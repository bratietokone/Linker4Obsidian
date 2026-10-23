import { App, Editor, Modal, Notice, Setting } from 'obsidian';
import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate, WidgetType } from '@codemirror/view';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export type ExternalFormat = 'markdown' | 'wiki';
export type ExternalOpenMode = 'open' | 'reveal';
export type ExternalKind = 'file' | 'directory';

export interface ExternalConfig {
  externalEnabled: boolean;
  externalFormat: ExternalFormat;
  externalOpenMode: ExternalOpenMode;
}

/** Only local absolute paths are accepted; remote hosts and other URI schemes are not. */
export function resolveExternalTarget(target: string): string | null {
  const value = target.trim();
  if (!value) return null;
  if (value.startsWith('external:')) {
    let candidate: string;
    try { candidate = decodeURIComponent(value.slice('external:'.length)); }
    catch { return null; }
    const normalized = path.normalize(candidate);
    return path.isAbsolute(normalized) ? normalized : null;
  }
  if (!/^file:\/\//i.test(value)) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'file:' || (url.hostname && url.hostname !== 'localhost')) return null;
    const filename = fileURLToPath(url);
    return path.isAbsolute(filename) ? path.normalize(filename) : null;
  } catch { return null; }
}

export function isExternalWikiTarget(target: string): boolean {
  return target.startsWith('external:');
}

export function createExternalLink(absolutePath: string, label: string, format: ExternalFormat): string {
  const candidate = path.normalize(absolutePath.trim());
  if (!path.isAbsolute(candidate)) throw new Error('A local absolute path is required.');
  const fileName = path.basename(candidate) || candidate;
  const title = (label.trim() || fileName).replace(/[\r\n]/g, ' ').trim();
  if (format === 'markdown') {
    const safeLabel = title.replace(/\\/g, '\\\\').replace(/\]/g, '\\]');
    return '[' + safeLabel + '](<' + pathToFileURL(candidate).href + '>)';
  }
  // Encode Wiki delimiters and literal percent signs, preserving readable paths.
  const wikiPath = candidate.replace(/\\/g, '/').replace(/%/g, '%25')
    .replace(/\|/g, '%7C').replace(/\[/g, '%5B').replace(/\]/g, '%5D');
  const safeAlias = title.replace(/\|/g, '¦').replace(/\]/g, ')');
  return '[[external:' + wikiPath + '|' + safeAlias + ']]';
}

export function readExternalLinkFromWiki(value: string): { target: string; label: string } | null {
  if (!isExternalWikiTarget(value)) return null;
  const separator = value.indexOf('|');
  const target = separator < 0 ? value : value.slice(0, separator);
  const resolved = resolveExternalTarget(target);
  if (!resolved) return null;
  return { target, label: (separator < 0 ? path.basename(resolved) : value.slice(separator + 1)) || resolved };
}

export function isExecutablePath(filename: string): boolean {
  return /\.(exe|com|bat|cmd|ps1|sh|desktop|app|msi|scr|jar|run)$/i.test(filename);
}

type Translate = (key: string, params?: Record<string, string | number>) => string;

export async function openExternalTarget(target: string, mode: ExternalOpenMode, t: Translate): Promise<void> {
  const filename = resolveExternalTarget(target);
  if (!filename) { new Notice(t('externalInvalidPath')); return; }
  let isDirectory: boolean;
  try { isDirectory = (await fs.promises.stat(filename)).isDirectory(); }
  catch { new Notice(t('externalMissing', { path: filename })); return; }
  try {
    const shell = (require('electron') as { shell?: {
      openPath: (file: string) => Promise<string>;
      showItemInFolder: (file: string) => void;
    }}).shell;
    if (!shell) throw new Error('Electron shell is unavailable');
    // Never execute potentially executable files: only reveal them to the user.
    if (mode === 'reveal' || (!isDirectory && isExecutablePath(filename))) {
      shell.showItemInFolder(filename);
    } else {
      const error = await shell.openPath(filename);
      if (error) throw new Error(error);
    }
  } catch (error) {
    console.error('Linker4Obsidian: cannot open external file', error);
    new Notice(t('externalOpenFailed'));
  }
}

async function chooseNativePath(kind: ExternalKind): Promise<string | null> {
  try {
    let remote: { dialog?: { showOpenDialog: (options: {
      properties: string[];
    }) => Promise<{ canceled: boolean; filePaths: string[] }> } } | undefined;
    try { remote = (require('electron') as { remote?: typeof remote }).remote; }
    catch { /* Electron is unavailable in this environment. */ }
    if (!remote?.dialog) {
      try { remote = require('@electron/remote') as typeof remote; }
      catch { /* Older or sandboxed builds may not provide a native dialog. */ }
    }
    if (!remote?.dialog) return null;
    const result = await remote.dialog.showOpenDialog({
      properties: [kind === 'file' ? 'openFile' : 'openDirectory']
    });
    return result.canceled ? null : (result.filePaths[0] || null);
  } catch (error) {
    console.error('Linker4Obsidian: native picker failed', error);
    return null;
  }
}

/** Dialog always permits entering a path, even if the native picker is unavailable. */
export class ExternalInsertModal extends Modal {
  private selectedPath = '';
  private displayName = '';
  private editedName = false;
  constructor(app: App, private editor: Editor, private kind: ExternalKind,
    private getFormat: () => ExternalFormat, private t: Translate) { super(app); }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h2', { text: this.t(this.kind === 'file' ? 'externalInsertFile' : 'externalInsertFolder') });
    contentEl.createEl('p', { text: this.t('externalInsertHint') });
    let updatePath: (next: string) => void = () => {};
    new Setting(contentEl).setName(this.t('externalPath')).addText(input => {
      input.setPlaceholder(this.kind === 'file' ? '/home/user/Documents/report.pdf' : '/home/user/Projects')
        .setValue(this.selectedPath)
        .onChange(next => { this.selectedPath = next; if (!this.editedName) updatePath(next); });
      updatePath = next => {
        if (!this.editedName) {
          this.displayName = path.basename(next.replace(/[\\/]+$/, '')) || next;
          nameField?.setValue(this.displayName);
        }
      };
      // Keep a reference so the browse button updates this same input.
      pathField = input;
    });
    let nameField: { setValue: (value: string) => unknown } | undefined;
    let pathField: { setValue: (value: string) => unknown } | undefined;
    new Setting(contentEl).setName(this.t('externalDisplayName')).addText(input => {
      nameField = input;
      input.setPlaceholder(this.t('externalDisplayPlaceholder'))
        .onChange(value => { this.editedName = true; this.displayName = value; });
    });
    new Setting(contentEl)
      .addButton(button => button.setButtonText(this.t('externalBrowse')).onClick(async () => {
        const selected = await chooseNativePath(this.kind);
        if (!selected) {
          new Notice(this.t('externalPickerFallback'));
          return;
        }
        this.selectedPath = selected;
        pathField?.setValue(selected);
        if (!this.editedName) updatePath(selected);
      }))
      .addButton(button => button.setButtonText(this.t('cancel')).onClick(() => this.close()))
      .addButton(button => button.setButtonText(this.t('externalInsert')).setCta().onClick(() => {
        try {
          const target = this.selectedPath.trim();
          const parsed = target.startsWith('file://') ? resolveExternalTarget(target) : target;
          if (!parsed || !path.isAbsolute(parsed)) {
            new Notice(this.t('externalInvalidPath'));
            return;
          }
          this.editor.replaceSelection(createExternalLink(parsed, this.displayName, this.getFormat()));
          this.close();
        } catch {
          new Notice(this.t('externalInvalidPath'));
        }
      }));
  }
  onClose(): void { this.contentEl.empty(); }
}

interface ExternalMatch { from: number; to: number; target: string; label: string; }

function collectLinks(text: string, offset: number): ExternalMatch[] {
  const result: ExternalMatch[] = [];
  // Embedded external links are deliberately not supported in this feature.
  const wiki = /(?<!!)\[\[(external:[^\]\r\n]+)\]\]/g;
  for (const match of text.matchAll(wiki)) {
    const parsed = readExternalLinkFromWiki(match[1]);
    if (parsed) result.push({ from: offset + match.index, to: offset + match.index + match[0].length, ...parsed });
  }
  const md = /\[([^\]\r\n]+)\]\(\s*(?:<(file:\/\/\/[^>\r\n]+)>|(file:\/\/\/[^\s)\r\n]+))\s*\)/gi;
  for (const match of text.matchAll(md)) {
    const target = match[2] || match[3];
    if (resolveExternalTarget(target)) {
      result.push({ from: offset + match.index, to: offset + match.index + match[0].length,
        target, label: match[1].replace(/\\\]/g, ']') });
    }
  }
  return result.sort((a, b) => a.from - b.from).filter((match, index, arr) =>
    index === 0 || match.from >= arr[index - 1].to);
}

export function getExternalEditorExtension(config: () => ExternalConfig, t: Translate) {
  class ExternalLinkWidget extends WidgetType {
    constructor(private target: string, private label: string) { super(); }
    eq(other: ExternalLinkWidget): boolean { return this.target === other.target && this.label === other.label; }
    toDOM(): HTMLElement {
      const el = document.createElement('span');
      el.className = 'cm-link cm-underline';
      el.textContent = this.label;
      el.title = this.target;
      el.setAttribute('role', 'link');
      el.tabIndex = 0;
      const open = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        void openExternalTarget(this.target, config().externalOpenMode, t);
      };
      el.addEventListener('click', open);
      el.addEventListener('keydown', event => { if (event.key === 'Enter') open(event); });
      return el;
    }
  }
  const build = (view: EditorView): DecorationSet => {
    if (!config().externalEnabled) return Decoration.none;
    const decorations: ReturnType<typeof Decoration.replace>[] = [];
    const cursor = view.state.selection.main.head;
    for (const range of view.visibleRanges) {
      const matches = collectLinks(view.state.doc.sliceString(range.from, range.to), range.from);
      for (const link of matches) {
        // Keep the full markup editable while the cursor is inside the link.
        if (cursor >= link.from - 1 && cursor <= link.to + 1) continue;
        decorations.push(Decoration.replace({ widget: new ExternalLinkWidget(link.target, link.label) }).range(link.from, link.to));
      }
    }
    return Decoration.set(decorations, true);
  };
  return ViewPlugin.fromClass(class {
    decorations: DecorationSet;
    constructor(view: EditorView) { this.decorations = build(view); }
    update(update: ViewUpdate): void {
      if (update.docChanged || update.selectionSet || update.viewportChanged) {
        this.decorations = build(update.view);
      }
    }
  }, { decorations: instance => instance.decorations });
}

/** Intercepts only clearly identified external links; internal vault links are untouched. */
export function handleExternalAnchorClick(event: MouseEvent, config: ExternalConfig, t: Translate): boolean {
  if (!config.externalEnabled) return false;
  const element = event.target;
  if (!(element instanceof Element)) return false;
  const anchor = element.closest('a');
  if (!anchor) return false;
  const link = anchor.getAttribute('data-href') || anchor.getAttribute('href') || '';
  const target = link.startsWith('external:') ? link.split('|')[0] : link;
  if (!resolveExternalTarget(target)) return false;
  event.preventDefault();
  event.stopImmediatePropagation();
  void openExternalTarget(target, config.externalOpenMode, t);
  return true;
}

export const __externalTest = { collectLinks, chooseNativePath };
