import {
  App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab,
  Setting, TFile, getLanguage
} from 'obsidian';
import { EditorView, ViewUpdate } from '@codemirror/view';
import { TRANSLATIONS, localeFromLanguage, type TranslationKey, type UiLocale, type LanguagePreference } from './locales';

type Behavior = 'link' | 'embed';
type Category = 'markdown' | 'image' | 'pdf' | 'video' | 'audio' | 'other';
type Rules = Record<Category, Behavior>;

interface LinkerSettings {
  language: LanguagePreference;
  automaticWiki: boolean;
  automaticYouTube: boolean;
  pasteYouTube: boolean;
  rules: Rules;
  additionalEmbedExtensions: string;
  additionalLinkExtensions: string;
}

const DEFAULT_SETTINGS: LinkerSettings = {
  language: 'auto',
  automaticWiki: true,
  automaticYouTube: true,
  pasteYouTube: true,
  rules: { markdown: 'link', image: 'embed', pdf: 'embed', video: 'embed', audio: 'embed', other: 'link' },
  additionalEmbedExtensions: '',
  additionalLinkExtensions: ''
};

/** Only interface text is localized; generated note content is never translated. */
function resolvedLocale(settings: LinkerSettings): UiLocale {
  return localeFromLanguage(settings.language === 'auto' ? getLanguage() : settings.language);
}
function tr(settings: LinkerSettings, key: TranslationKey, params: Record<string, string | number> = {}): string {
  return TRANSLATIONS[resolvedLocale(settings)][key].replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match);
}

const EXTENSIONS: Record<Exclude<Category, 'other'>, string[]> = {
  markdown: ['md', 'markdown'],
  image: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif', 'bmp'],
  pdf: ['pdf'],
  video: ['mp4', 'webm', 'mov', 'mkv', 'ogv'],
  audio: ['mp3', 'm4a', 'ogg', 'oga', 'wav', 'flac', 'opus']
};

function extensionList(value: string): Set<string> {
  return new Set(value.split(/[\s,;]+/).map(x => x.trim().replace(/^\./, '').toLowerCase()).filter(Boolean));
}

function linkBehavior(target: string, sourcePath: string, app: App, settings: LinkerSettings): Behavior {
  const rawPath = target.split('|', 1)[0].split('#', 1)[0].trim();
  const decodedPath = rawPath.replace(/\\([\\[\]#|])/g, '$1');
  let ext = /\.([a-zA-Z0-9]+)$/.exec(decodedPath)?.[1]?.toLowerCase();
  if (!ext) {
    const linkedFile = app.metadataCache.getFirstLinkpathDest(decodedPath, sourcePath);
    if (linkedFile) ext = linkedFile.extension.toLowerCase();
  }
  if (!ext) return settings.rules.other;
  // Additional link extensions have priority over additional embed extensions.
  if (extensionList(settings.additionalLinkExtensions).has(ext)) return 'link';
  if (extensionList(settings.additionalEmbedExtensions).has(ext)) return 'embed';
  for (const [category, extensions] of Object.entries(EXTENSIONS)) {
    if (extensions.includes(ext)) return settings.rules[category as Category];
  }
  return settings.rules.other;
}

function youtubeEmbed(text: string): string | null {
  let url: URL;
  try { url = new URL(text.trim()); } catch { return null; }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  const host = url.hostname.toLowerCase();
  const youtubeHost = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(host);
  const shortHost = ['youtu.be', 'www.youtu.be'].includes(host);
  if (!youtubeHost && !shortHost) return null;
  const parts = url.pathname.split('/').filter(Boolean);
  let videoId: string | null = null;
  if (shortHost) videoId = parts[0] || null;
  else if (parts[0] === 'watch') videoId = url.searchParams.get('v');
  else if (['shorts', 'embed', 'live', 'v'].includes(parts[0])) videoId = parts[1] || null;
  if (!videoId || !/^[\w-]{11}$/.test(videoId)) return null;
  const normalized = new URL('https://www.youtube.com/watch');
  normalized.searchParams.set('v', videoId);
  const timestamp = url.searchParams.get('t') || url.searchParams.get('start');
  if (timestamp && /^[\dhms]+$/i.test(timestamp)) normalized.searchParams.set('t', timestamp);
  return `![](${normalized.toString()})`;
}

function inInlineCode(line: string, position: number): boolean {
  let activeTicks = 0;
  for (let i = 0; i < position;) {
    if (line[i] === '\\') { i += 2; continue; }
    if (line[i] !== '`') { i++; continue; }
    let end = i;
    while (end < line.length && line[end] === '`') end++;
    const ticks = end - i;
    if (!activeTicks) activeTicks = ticks;
    else if (activeTicks === ticks) activeTicks = 0;
    i = end;
  }
  return activeTicks !== 0;
}

interface TransformResult { text: string; changes: number; }
interface Span { from: number; to: number; }
function intersects(span: Span, changed?: Span): boolean {
  return !changed || (span.from <= changed.to && span.to >= changed.from);
}

/** Pure-ish content transformation; no vault write. Kept exportable for tests. */
function transformText(
  text: string, sourcePath: string, app: App, settings: LinkerSettings,
  touched?: Span, only?: 'wiki' | 'youtube'
): TransformResult {
  let changes = 0;
  let result = '';
  let pos = 0;
  let inFrontmatter = false;
  let inFence: { marker: string; width: number } | null = null;
  let inComment = false;
  let index = 0;
  // Preserve original line endings (CRLF included).
  const lines = text.match(/[^\n]*\n|[^\n]+$/g) || [];
  for (const wholeLine of lines) {
    const ending = wholeLine.endsWith('\n') ? '\n' : '';
    const raw = ending ? wholeLine.slice(0, -1) : wholeLine;
    const line = raw.endsWith('\r') ? raw.slice(0, -1) : raw;
    const trailing = raw.endsWith('\r') ? '\r' + ending : ending;
    const trimmed = line.trim();
    let skip = false;
    if (index === 0 && (trimmed === '---' || trimmed === '+++')) {
      inFrontmatter = true;
      skip = true;
    } else if (inFrontmatter) {
      skip = true;
      if (trimmed === '---' || trimmed === '+++' || trimmed === '...') inFrontmatter = false;
    } else {
      const fence = /^ {0,3}(`{3,}|~{3,})/.exec(line);
      if (inFence) {
        skip = true;
        if (fence && fence[1][0] === inFence.marker && fence[1].length >= inFence.width &&
          new RegExp(`^ {0,3}${inFence.marker === '`' ? '`' : '~'}{${inFence.width},}\\s*$`).test(line)) {
          inFence = null;
        }
      } else if (fence) {
        skip = true;
        inFence = { marker: fence[1][0], width: fence[1].length };
      }
    }

    // Avoid rewriting HTML comments, even when they cover multiple lines.
    if (!skip && (inComment || line.includes('<!--'))) {
      const start = inComment ? 0 : line.indexOf('<!--');
      const end = line.indexOf('-->', start + (inComment ? 0 : 4));
      if (start >= 0 && end < 0) inComment = true;
      if (end >= 0) inComment = false;
      // Conservative: don't change links on a line with comments.
      skip = true;
    }
    if (skip) {
      result += wholeLine;
      pos += wholeLine.length;
      index++;
      continue;
    }

    let next = line;
    if (only !== 'youtube' && settings.automaticWiki) {
      const wiki = /(!?)\[\[([^\]\r\n]+)\]\]/g;
      const edits: { start: number; end: number; replacement: string }[] = [];
      for (const match of line.matchAll(wiki)) {
        const start = match.index;
        const end = start + match[0].length;
        if ((start > 0 && line[start - 1] === '\\') || inInlineCode(line, start) ||
          !intersects({ from: pos + start, to: pos + end }, touched)) continue;
        const desired = linkBehavior(match[2], sourcePath, app, settings);
        // An explicit embed was a deliberate user choice: do not undo it.
        if (match[1] === '!' && desired === 'link') continue;
        const replacement = `${desired === 'embed' ? '!' : ''}[[${match[2]}]]`;
        if (replacement !== match[0]) edits.push({ start, end, replacement });
      }
      for (const edit of edits.reverse()) {
        next = next.slice(0, edit.start) + edit.replacement + next.slice(edit.end);
        changes++;
      }
    }

    if (only !== 'wiki' && settings.automaticYouTube && !next.includes('`')) {
      // Only a standalone URL/Markdown link becomes a media block. A URL in a
      // paragraph remains a normal hyperlink to avoid breaking prose.
      const standalone = /^(\s*)(<?https?:\/\/[^\s<>]+>?|\[[^\]\r\n]*\]\((https?:\/\/[^\s)]+)\))(\s*)$/.exec(next);
      if (standalone && intersects({ from: pos, to: pos + line.length }, touched)) {
        let candidate = standalone[3] || standalone[2];
        candidate = candidate.replace(/^</, '').replace(/>$/, '');
        const embed = youtubeEmbed(candidate);
        if (embed) {
          const replacement = `${standalone[1]}${embed}${standalone[4]}`;
          if (replacement !== next) { next = replacement; changes++; }
        }
      }
    }
    result += next + trailing;
    pos += wholeLine.length;
    index++;
  }
  return { text: result, changes };
}

function diffExamples(before: string, after: string, settings: LinkerSettings, limit = 6): string[] {
  const a = before.split('\n'), b = after.split('\n');
  const examples: string[] = [];
  for (let i = 0; i < Math.min(a.length, b.length) && examples.length < limit; i++) {
    if (a[i] === b[i]) continue;
    const clip = (s: string) => s.trim().slice(0, 100);
    examples.push(tr(settings, 'lineExample', { line: i + 1, before: clip(a[i]), after: clip(b[i]) }));
  }
  return examples;
}

class ConfirmModal extends Modal {
  constructor(app: App, private titleText: string, private description: string,
    private examples: string[], private settings: LinkerSettings, private onConfirm: () => Promise<void>) { super(app); }
  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h2', { text: this.titleText });
    contentEl.createEl('p', { text: this.description });
    if (this.examples.length) {
      const list = contentEl.createEl('ul');
      for (const example of this.examples.slice(0, 20)) list.createEl('li', { text: example });
      if (this.examples.length > 20) contentEl.createEl('p', { text: tr(this.settings, 'moreExamples', { count: this.examples.length - 20 }) });
    }
    new Setting(contentEl)
      .addButton(btn => btn.setButtonText(tr(this.settings, 'cancel')).onClick(() => this.close()))
      .addButton(btn => btn.setButtonText(tr(this.settings, 'apply')).setCta().onClick(async () => {
        this.close();
        try { await this.onConfirm(); }
        catch (err) { console.error('Linker4Obsidian: conversion failed', err); new Notice(tr(this.settings, 'modalError')); }
      }));
  }
  onClose(): void { this.contentEl.empty(); }
}

export default class Linker4ObsidianPlugin extends Plugin {
  settings: LinkerSettings = DEFAULT_SETTINGS;
  private applying = new WeakSet<EditorView>();

  private openEditor(file: TFile): Editor | null {
    for (const leaf of this.app.workspace.getLeavesOfType('markdown')) {
      const view = leaf.view;
      if (view instanceof MarkdownView && view.file?.path === file.path) return view.editor;
    }
    return null;
  }

  async onload(): Promise<void> {
    const saved = await this.loadData() as Partial<LinkerSettings> | null;
    this.settings = { ...DEFAULT_SETTINGS, ...saved, rules: { ...DEFAULT_SETTINGS.rules, ...saved?.rules } };
    this.addSettingTab(new LinkerSettingTab(this.app, this));

    this.registerEditorExtension(EditorView.updateListener.of((update: ViewUpdate) => {
      if (!update.docChanged || !(this.settings.automaticWiki || this.settings.automaticYouTube) ||
        this.applying.has(update.view) || !update.view.hasFocus) return;
      const file = this.app.workspace.getActiveFile();
      if (!file || file.extension !== 'md') return;
      const ranges: Span[] = [];
      let promising = false;
      update.changes.iterChanges((_fromA, _toA, fromB, toB, inserted) => {
        const insertedText = inserted.toString();
        const changedLine = update.state.doc.lineAt(Math.min(fromB, update.state.doc.length)).text;
        const wikiNearby = this.settings.automaticWiki && changedLine.includes('[[') && changedLine.includes(']]');
        if (insertedText.length && (wikiNearby || /https?:\/\//.test(insertedText) || insertedText.includes(']('))) {
          ranges.push({ from: fromB, to: toB });
          promising = true;
        }
      });
      if (!promising) return;
      const originalDoc = update.state.doc;
      queueMicrotask(() => {
        const view = update.view;
        if (view.state.doc !== originalDoc || !view.hasFocus) return;
        const path = this.app.workspace.getActiveFile()?.path;
        if (path !== file.path) return;
        const input = view.state.doc.toString();
        // Convert only links intersecting text just entered, not old links on
        // the same line or elsewhere in the note.
        let output = input;
        // Work from the end: offsets stay stable until all replacements are done.
        for (const range of ranges.sort((a, b) => b.from - a.from)) {
          // Replacements can alter offsets. One range per transaction is the
          // normal case; for multi-line paste use the envelope instead below.
          if (ranges.length > 1) break;
          output = transformText(output, file.path, this.app, this.settings, range).text;
        }
        if (ranges.length > 1) {
          const envelope = { from: Math.min(...ranges.map(r => r.from)), to: Math.max(...ranges.map(r => r.to)) };
          output = transformText(input, file.path, this.app, this.settings, envelope).text;
        }
        if (output === input) return;
        // Minimal change set preserves cursor/selection mapping and undo history.
        let from = 0;
        while (from < input.length && from < output.length && input[from] === output[from]) from++;
        let oldEnd = input.length, newEnd = output.length;
        while (oldEnd > from && newEnd > from && input[oldEnd - 1] === output[newEnd - 1]) { oldEnd--; newEnd--; }
        this.applying.add(view);
        try { view.dispatch({ changes: { from, to: oldEnd, insert: output.slice(from, newEnd) } }); }
        finally { this.applying.delete(view); }
      });
    }));

    this.registerEvent(this.app.workspace.on('editor-paste', (event: ClipboardEvent, editor: Editor) => {
      if (event.defaultPrevented || !this.settings.automaticYouTube || !this.settings.pasteYouTube) return;
      const clipboard = event.clipboardData;
      if (!clipboard || clipboard.files.length > 0) return;
      const text = clipboard.getData('text/plain').trim();
      const embed = youtubeEmbed(text);
      if (!embed) return;
      const file = this.app.workspace.getActiveFile();
      if (!file || file.extension !== 'md') return;
      // Do not alter literal pasted text inside YAML, code fences or inline code.
      const content = editor.getValue();
      const cursor = editor.getCursor('from');
      const endCursor = editor.getCursor('to');
      const offsetOf = (line: number, ch: number) =>
        content.split('\n').slice(0, line).reduce((n, l) => n + l.length + 1, 0) + ch;
      const offset = offsetOf(cursor.line, cursor.ch);
      const endOffset = offsetOf(endCursor.line, endCursor.ch);
      const sentinel = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const probe = content.slice(0, offset) + sentinel + content.slice(endOffset);
      const protectedResult = transformText(probe, file.path, this.app,
        { ...this.settings, automaticWiki: false }, { from: offset, to: offset + sentinel.length }, 'youtube');
      if (protectedResult.text === probe) return; // includes code/fenced/frontmatter
      event.preventDefault();
      editor.replaceSelection(embed);
    }));

    this.addCommand({
      id: 'convert-current-note', name: tr(this.settings, 'currentCommand'),
      editorCallback: (editor: Editor, view) => {
        const file = view.file;
        if (!file) return;
        const preview = transformText(editor.getValue(), file.path, this.app, this.settings);
        if (!preview.changes) { new Notice(tr(this.settings, 'noChanges')); return; }
        new ConfirmModal(this.app, tr(this.settings, 'currentTitle'),
          tr(this.settings, 'currentDescription', { count: preview.changes }),
          diffExamples(editor.getValue(), preview.text, this.settings), this.settings, async () => {
            const fresh = transformText(editor.getValue(), file.path, this.app, this.settings);
            if (fresh.changes) {
              const previous = editor.getCursor();
              editor.setValue(fresh.text);
              editor.setCursor(previous);
              new Notice(tr(this.settings, 'applied', { count: fresh.changes }));
            }
          }).open();
      }
    });

    this.addCommand({
      id: 'convert-entire-vault', name: tr(this.settings, 'vaultCommand'),
      callback: async () => {
        const files = this.app.vault.getMarkdownFiles();
        const plans: { file: TFile; count: number; example: string }[] = [];
        for (const file of files) {
          const text = this.openEditor(file)?.getValue() ?? await this.app.vault.cachedRead(file);
          const { changes, text: updated } = transformText(text, file.path, this.app, this.settings);
          if (changes) plans.push({ file, count: changes, example: diffExamples(text, updated, this.settings, 1)[0] || '' });
        }
        const total = plans.reduce((n, p) => n + p.count, 0);
        if (!total) { new Notice(tr(this.settings, 'noChanges')); return; }
        new ConfirmModal(this.app, tr(this.settings, 'vaultTitle'),
          tr(this.settings, 'vaultDescription', { count: total, files: plans.length }),
          plans.map(p => `${p.file.path} — ${p.count}; ${p.example}`), this.settings, async () => {
            let changed = 0, errors = 0;
            for (const { file } of plans) {
              try {
                const editor = this.openEditor(file);
                if (editor) {
                  // Update open notes through their editor, including background
                  // tabs, to avoid replacing unsaved in-memory buffers.
                  const current = transformText(editor.getValue(), file.path, this.app, this.settings);
                  if (current.changes) { editor.setValue(current.text); changed += current.changes; }
                } else {
                  let fileChanges = 0;
                  await this.app.vault.process(file, data => {
                    const outcome = transformText(data, file.path, this.app, this.settings);
                    fileChanges = outcome.changes;
                    return outcome.text;
                  });
                  changed += fileChanges;
                }
              } catch (e) { errors++; console.error('Linker4Obsidian: failed on', file.path, e); }
            }
            new Notice(tr(this.settings, 'vaultApplied', { count: changed, errors: errors ? tr(this.settings, 'vaultErrors', { count: errors }) : '' }), 8000);
          }).open();
      }
    });
  }
  async saveSettings(): Promise<void> { await this.saveData(this.settings); }
}

class LinkerSettingTab extends PluginSettingTab {
  constructor(app: App, private plugin: Linker4ObsidianPlugin) { super(app, plugin); }
  display(): void {
    const { containerEl } = this;
    const t = (key: TranslationKey) => tr(this.plugin.settings, key);
    containerEl.empty();
    containerEl.createEl('h2', { text: 'Linker4Obsidian' });
    new Setting(containerEl).setName(t('language')).setDesc(t('languageDesc'))
      .addDropdown(d => d.addOptions({
        auto: t('languageAuto'), en: t('languageEnglish'), ru: t('languageRussian'),
        es: t('languageSpanish'), 'zh-CN': t('languageChinese')
      }).setValue(this.plugin.settings.language).onChange(async (value) => {
        if (!['auto', 'en', 'ru', 'es', 'zh-CN'].includes(value)) return;
        this.plugin.settings.language = value as LanguagePreference;
        await this.plugin.saveSettings();
        this.display();
        new Notice(tr(this.plugin.settings, 'languageChanged'));
      }));
    new Setting(containerEl).setName(t('automaticWiki')).setDesc(t('automaticWikiDesc'))
      .addToggle(toggle => toggle.setValue(this.plugin.settings.automaticWiki).onChange(async value => {
        this.plugin.settings.automaticWiki = value;
        await this.plugin.saveSettings();
      }));
    new Setting(containerEl).setName(t('automaticYouTube')).setDesc(t('automaticYouTubeDesc'))
      .addToggle(toggle => toggle.setValue(this.plugin.settings.automaticYouTube).onChange(async value => {
        this.plugin.settings.automaticYouTube = value;
        await this.plugin.saveSettings();
      }));
    new Setting(containerEl).setName(t('pasteYouTube')).setDesc(t('pasteYouTubeDesc'))
      .addToggle(toggle => toggle.setValue(this.plugin.settings.pasteYouTube).onChange(async value => {
        this.plugin.settings.pasteYouTube = value;
        await this.plugin.saveSettings();
      }));
    containerEl.createEl('h3', { text: t('fileRules') });
    const labels: { cat: Category; name: TranslationKey; desc: string }[] = [
      { cat: 'markdown', name: 'markdown', desc: '.md, .markdown' },
      { cat: 'image', name: 'image', desc: EXTENSIONS.image.join(', ') },
      { cat: 'pdf', name: 'pdf', desc: '.pdf' },
      { cat: 'video', name: 'video', desc: EXTENSIONS.video.join(', ') },
      { cat: 'audio', name: 'audio', desc: EXTENSIONS.audio.join(', ') },
      { cat: 'other', name: 'other', desc: t('otherDesc') }
    ];
    for (const { cat, name, desc } of labels) {
      new Setting(containerEl).setName(t(name)).setDesc(desc)
        .addDropdown(d => d.addOptions({ link: t('link'), embed: t('embed') })
          .setValue(this.plugin.settings.rules[cat]).onChange(async value => {
            this.plugin.settings.rules[cat] = value as Behavior;
            await this.plugin.saveSettings();
          }));
    }
    containerEl.createEl('h3', { text: t('extraExtensions') });
    new Setting(containerEl).setName(t('alwaysEmbed')).setDesc(t('alwaysEmbedDesc'))
      .addText(field => field.setPlaceholder('epub, tif').setValue(this.plugin.settings.additionalEmbedExtensions)
        .onChange(async value => { this.plugin.settings.additionalEmbedExtensions = value; await this.plugin.saveSettings(); }));
    new Setting(containerEl).setName(t('alwaysLink')).setDesc(t('alwaysLinkDesc'))
      .addText(field => field.setPlaceholder('zip, exe').setValue(this.plugin.settings.additionalLinkExtensions)
        .onChange(async value => { this.plugin.settings.additionalLinkExtensions = value; await this.plugin.saveSettings(); }));
    containerEl.createEl('p', { text: t('existingLinksHint') });
  }
}

/** Pure helpers exposed for automated regression tests. */
export const __test = { transformText, youtubeEmbed, inInlineCode, resolvedLocale, localeFromLanguage, tr };