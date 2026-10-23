"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.__test = void 0;
const obsidian_1 = require("obsidian");
const view_1 = require("@codemirror/view");
const DEFAULT_SETTINGS = {
    automaticWiki: true,
    automaticYouTube: true,
    pasteYouTube: true,
    rules: { markdown: 'link', image: 'embed', pdf: 'embed', video: 'embed', audio: 'embed', other: 'link' },
    additionalEmbedExtensions: '',
    additionalLinkExtensions: ''
};
const EXTENSIONS = {
    markdown: ['md', 'markdown'],
    image: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif', 'bmp'],
    pdf: ['pdf'],
    video: ['mp4', 'webm', 'mov', 'mkv', 'ogv'],
    audio: ['mp3', 'm4a', 'ogg', 'oga', 'wav', 'flac', 'opus']
};
function extensionList(value) {
    return new Set(value.split(/[\s,;]+/).map(x => x.trim().replace(/^\./, '').toLowerCase()).filter(Boolean));
}
function linkBehavior(target, sourcePath, app, settings) {
    const rawPath = target.split('|', 1)[0].split('#', 1)[0].trim();
    const decodedPath = rawPath.replace(/\\([\\[\]#|])/g, '$1');
    let ext = /\.([a-zA-Z0-9]+)$/.exec(decodedPath)?.[1]?.toLowerCase();
    if (!ext) {
        const linkedFile = app.metadataCache.getFirstLinkpathDest(decodedPath, sourcePath);
        if (linkedFile)
            ext = linkedFile.extension.toLowerCase();
    }
    if (!ext)
        return settings.rules.other;
    // Additional link extensions have priority over additional embed extensions.
    if (extensionList(settings.additionalLinkExtensions).has(ext))
        return 'link';
    if (extensionList(settings.additionalEmbedExtensions).has(ext))
        return 'embed';
    for (const [category, extensions] of Object.entries(EXTENSIONS)) {
        if (extensions.includes(ext))
            return settings.rules[category];
    }
    return settings.rules.other;
}
function youtubeEmbed(text) {
    let url;
    try {
        url = new URL(text.trim());
    }
    catch {
        return null;
    }
    if (url.protocol !== 'https:' && url.protocol !== 'http:')
        return null;
    const host = url.hostname.toLowerCase();
    const youtubeHost = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(host);
    const shortHost = ['youtu.be', 'www.youtu.be'].includes(host);
    if (!youtubeHost && !shortHost)
        return null;
    const parts = url.pathname.split('/').filter(Boolean);
    let videoId = null;
    if (shortHost)
        videoId = parts[0] || null;
    else if (parts[0] === 'watch')
        videoId = url.searchParams.get('v');
    else if (['shorts', 'embed', 'live', 'v'].includes(parts[0]))
        videoId = parts[1] || null;
    if (!videoId || !/^[\w-]{11}$/.test(videoId))
        return null;
    const normalized = new URL('https://www.youtube.com/watch');
    normalized.searchParams.set('v', videoId);
    const timestamp = url.searchParams.get('t') || url.searchParams.get('start');
    if (timestamp && /^[\dhms]+$/i.test(timestamp))
        normalized.searchParams.set('t', timestamp);
    return `![](${normalized.toString()})`;
}
function inInlineCode(line, position) {
    let activeTicks = 0;
    for (let i = 0; i < position;) {
        if (line[i] === '\\') {
            i += 2;
            continue;
        }
        if (line[i] !== '`') {
            i++;
            continue;
        }
        let end = i;
        while (end < line.length && line[end] === '`')
            end++;
        const ticks = end - i;
        if (!activeTicks)
            activeTicks = ticks;
        else if (activeTicks === ticks)
            activeTicks = 0;
        i = end;
    }
    return activeTicks !== 0;
}
function intersects(span, changed) {
    return !changed || (span.from <= changed.to && span.to >= changed.from);
}
/** Pure-ish content transformation; no vault write. Kept exportable for tests. */
function transformText(text, sourcePath, app, settings, touched, only) {
    let changes = 0;
    let result = '';
    let pos = 0;
    let inFrontmatter = false;
    let inFence = null;
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
        }
        else if (inFrontmatter) {
            skip = true;
            if (trimmed === '---' || trimmed === '+++' || trimmed === '...')
                inFrontmatter = false;
        }
        else {
            const fence = /^ {0,3}(`{3,}|~{3,})/.exec(line);
            if (inFence) {
                skip = true;
                if (fence && fence[1][0] === inFence.marker && fence[1].length >= inFence.width &&
                    new RegExp(`^ {0,3}${inFence.marker === '`' ? '`' : '~'}{${inFence.width},}\\s*$`).test(line)) {
                    inFence = null;
                }
            }
            else if (fence) {
                skip = true;
                inFence = { marker: fence[1][0], width: fence[1].length };
            }
        }
        // Avoid rewriting HTML comments, even when they cover multiple lines.
        if (!skip && (inComment || line.includes('<!--'))) {
            const start = inComment ? 0 : line.indexOf('<!--');
            const end = line.indexOf('-->', start + (inComment ? 0 : 4));
            if (start >= 0 && end < 0)
                inComment = true;
            if (end >= 0)
                inComment = false;
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
            const edits = [];
            for (const match of line.matchAll(wiki)) {
                const start = match.index;
                const end = start + match[0].length;
                if ((start > 0 && line[start - 1] === '\\') || inInlineCode(line, start) ||
                    !intersects({ from: pos + start, to: pos + end }, touched))
                    continue;
                const desired = linkBehavior(match[2], sourcePath, app, settings);
                // An explicit embed was a deliberate user choice: do not undo it.
                if (match[1] === '!' && desired === 'link')
                    continue;
                const replacement = `${desired === 'embed' ? '!' : ''}[[${match[2]}]]`;
                if (replacement !== match[0])
                    edits.push({ start, end, replacement });
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
                    if (replacement !== next) {
                        next = replacement;
                        changes++;
                    }
                }
            }
        }
        result += next + trailing;
        pos += wholeLine.length;
        index++;
    }
    return { text: result, changes };
}
function diffExamples(before, after, limit = 6) {
    const a = before.split('\n'), b = after.split('\n');
    const examples = [];
    for (let i = 0; i < Math.min(a.length, b.length) && examples.length < limit; i++) {
        if (a[i] === b[i])
            continue;
        const clip = (s) => s.trim().slice(0, 100);
        examples.push(`Строка ${i + 1}: ${clip(a[i])} → ${clip(b[i])}`);
    }
    return examples;
}
class ConfirmModal extends obsidian_1.Modal {
    constructor(app, titleText, description, examples, onConfirm) {
        super(app);
        this.titleText = titleText;
        this.description = description;
        this.examples = examples;
        this.onConfirm = onConfirm;
    }
    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.createEl('h2', { text: this.titleText });
        contentEl.createEl('p', { text: this.description });
        if (this.examples.length) {
            const list = contentEl.createEl('ul');
            for (const example of this.examples.slice(0, 20))
                list.createEl('li', { text: example });
            if (this.examples.length > 20)
                contentEl.createEl('p', { text: `...и ещё ${this.examples.length - 20}` });
        }
        new obsidian_1.Setting(contentEl)
            .addButton(btn => btn.setButtonText('Отмена').onClick(() => this.close()))
            .addButton(btn => btn.setButtonText('Применить').setCta().onClick(async () => {
            this.close();
            try {
                await this.onConfirm();
            }
            catch (err) {
                console.error('Linker4Obsidian: conversion failed', err);
                new obsidian_1.Notice('Linker4Obsidian: ошибка преобразования. Проверьте консоль.');
            }
        }));
    }
    onClose() { this.contentEl.empty(); }
}
class Linker4ObsidianPlugin extends obsidian_1.Plugin {
    constructor() {
        super(...arguments);
        this.settings = DEFAULT_SETTINGS;
        this.applying = new WeakSet();
    }
    openEditor(file) {
        for (const leaf of this.app.workspace.getLeavesOfType('markdown')) {
            const view = leaf.view;
            if (view instanceof obsidian_1.MarkdownView && view.file?.path === file.path)
                return view.editor;
        }
        return null;
    }
    async onload() {
        const saved = await this.loadData();
        this.settings = { ...DEFAULT_SETTINGS, ...saved, rules: { ...DEFAULT_SETTINGS.rules, ...saved?.rules } };
        this.addSettingTab(new LinkerSettingTab(this.app, this));
        this.registerEditorExtension(view_1.EditorView.updateListener.of((update) => {
            if (!update.docChanged || !(this.settings.automaticWiki || this.settings.automaticYouTube) ||
                this.applying.has(update.view) || !update.view.hasFocus)
                return;
            const file = this.app.workspace.getActiveFile();
            if (!file || file.extension !== 'md')
                return;
            const ranges = [];
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
            if (!promising)
                return;
            const originalDoc = update.state.doc;
            queueMicrotask(() => {
                const view = update.view;
                if (view.state.doc !== originalDoc || !view.hasFocus)
                    return;
                const path = this.app.workspace.getActiveFile()?.path;
                if (path !== file.path)
                    return;
                const input = view.state.doc.toString();
                // Convert only links intersecting text just entered, not old links on
                // the same line or elsewhere in the note.
                let output = input;
                // Work from the end: offsets stay stable until all replacements are done.
                for (const range of ranges.sort((a, b) => b.from - a.from)) {
                    // Replacements can alter offsets. One range per transaction is the
                    // normal case; for multi-line paste use the envelope instead below.
                    if (ranges.length > 1)
                        break;
                    output = transformText(output, file.path, this.app, this.settings, range).text;
                }
                if (ranges.length > 1) {
                    const envelope = { from: Math.min(...ranges.map(r => r.from)), to: Math.max(...ranges.map(r => r.to)) };
                    output = transformText(input, file.path, this.app, this.settings, envelope).text;
                }
                if (output === input)
                    return;
                // Minimal change set preserves cursor/selection mapping and undo history.
                let from = 0;
                while (from < input.length && from < output.length && input[from] === output[from])
                    from++;
                let oldEnd = input.length, newEnd = output.length;
                while (oldEnd > from && newEnd > from && input[oldEnd - 1] === output[newEnd - 1]) {
                    oldEnd--;
                    newEnd--;
                }
                this.applying.add(view);
                try {
                    view.dispatch({ changes: { from, to: oldEnd, insert: output.slice(from, newEnd) } });
                }
                finally {
                    this.applying.delete(view);
                }
            });
        }));
        this.registerEvent(this.app.workspace.on('editor-paste', (event, editor) => {
            if (event.defaultPrevented || !this.settings.automaticYouTube || !this.settings.pasteYouTube)
                return;
            const clipboard = event.clipboardData;
            if (!clipboard || clipboard.files.length > 0)
                return;
            const text = clipboard.getData('text/plain').trim();
            const embed = youtubeEmbed(text);
            if (!embed)
                return;
            const file = this.app.workspace.getActiveFile();
            if (!file || file.extension !== 'md')
                return;
            // Do not alter literal pasted text inside YAML, code fences or inline code.
            const content = editor.getValue();
            const cursor = editor.getCursor('from');
            const endCursor = editor.getCursor('to');
            const offsetOf = (line, ch) => content.split('\n').slice(0, line).reduce((n, l) => n + l.length + 1, 0) + ch;
            const offset = offsetOf(cursor.line, cursor.ch);
            const endOffset = offsetOf(endCursor.line, endCursor.ch);
            const sentinel = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
            const probe = content.slice(0, offset) + sentinel + content.slice(endOffset);
            const protectedResult = transformText(probe, file.path, this.app, { ...this.settings, automaticWiki: false }, { from: offset, to: offset + sentinel.length }, 'youtube');
            if (protectedResult.text === probe)
                return; // includes code/fenced/frontmatter
            event.preventDefault();
            editor.replaceSelection(embed);
        }));
        this.addCommand({
            id: 'convert-current-note', name: 'Предпросмотр и преобразование ссылок в текущей заметке',
            editorCallback: (editor, view) => {
                const file = view.file;
                if (!file)
                    return;
                const preview = transformText(editor.getValue(), file.path, this.app, this.settings);
                if (!preview.changes) {
                    new obsidian_1.Notice('Linker4Obsidian: изменений не требуется.');
                    return;
                }
                new ConfirmModal(this.app, 'Преобразовать ссылки в текущей заметке?', `Предлагается ${preview.changes} изменений. Текст в кодовых блоках и frontmatter пропускается.`, diffExamples(editor.getValue(), preview.text), async () => {
                    const fresh = transformText(editor.getValue(), file.path, this.app, this.settings);
                    if (fresh.changes) {
                        const previous = editor.getCursor();
                        editor.setValue(fresh.text);
                        editor.setCursor(previous);
                        new obsidian_1.Notice(`Linker4Obsidian: применено ${fresh.changes} изменений.`);
                    }
                }).open();
            }
        });
        this.addCommand({
            id: 'convert-entire-vault', name: 'Предпросмотр и преобразование ссылок во всём хранилище',
            callback: async () => {
                const files = this.app.vault.getMarkdownFiles();
                const plans = [];
                for (const file of files) {
                    const text = this.openEditor(file)?.getValue() ?? await this.app.vault.cachedRead(file);
                    const { changes, text: updated } = transformText(text, file.path, this.app, this.settings);
                    if (changes)
                        plans.push({ file, count: changes, example: diffExamples(text, updated, 1)[0] || '' });
                }
                const total = plans.reduce((n, p) => n + p.count, 0);
                if (!total) {
                    new obsidian_1.Notice('Linker4Obsidian: изменений не требуется.');
                    return;
                }
                new ConfirmModal(this.app, 'Преобразовать ссылки во всём хранилище?', `${total} изменений в ${plans.length} заметках. Перед массовой операцией рекомендуется резервная копия.`, plans.map(p => `${p.file.path} — ${p.count}; ${p.example}`), async () => {
                    let changed = 0, errors = 0;
                    for (const { file } of plans) {
                        try {
                            const editor = this.openEditor(file);
                            if (editor) {
                                // Update open notes through their editor, including background
                                // tabs, to avoid replacing unsaved in-memory buffers.
                                const current = transformText(editor.getValue(), file.path, this.app, this.settings);
                                if (current.changes) {
                                    editor.setValue(current.text);
                                    changed += current.changes;
                                }
                            }
                            else {
                                let fileChanges = 0;
                                await this.app.vault.process(file, data => {
                                    const outcome = transformText(data, file.path, this.app, this.settings);
                                    fileChanges = outcome.changes;
                                    return outcome.text;
                                });
                                changed += fileChanges;
                            }
                        }
                        catch (e) {
                            errors++;
                            console.error('Linker4Obsidian: failed on', file.path, e);
                        }
                    }
                    new obsidian_1.Notice(`Linker4Obsidian: преобразовано ${changed} ссылок.${errors ? ` Ошибок: ${errors}.` : ''}`, 8000);
                }).open();
            }
        });
    }
    async saveSettings() { await this.saveData(this.settings); }
}
exports.default = Linker4ObsidianPlugin;
class LinkerSettingTab extends obsidian_1.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Linker4Obsidian' });
        new obsidian_1.Setting(containerEl).setName('Автоматическая обработка Wiki-ссылок')
            .setDesc('При создании/вставке [[ссылки]] применяет правила типов файлов. Не изменяет весь документ при каждом вводе.')
            .addToggle(t => t.setValue(this.plugin.settings.automaticWiki).onChange(async (v) => {
            this.plugin.settings.automaticWiki = v;
            await this.plugin.saveSettings();
        }));
        new obsidian_1.Setting(containerEl).setName('YouTube → встроенный плеер')
            .setDesc('Преобразовывать одиночные YouTube URL и Markdown-ссылки при массовой обработке.')
            .addToggle(t => t.setValue(this.plugin.settings.automaticYouTube).onChange(async (v) => {
            this.plugin.settings.automaticYouTube = v;
            await this.plugin.saveSettings();
        }));
        new obsidian_1.Setting(containerEl).setName('Встраивать YouTube при Ctrl+V')
            .setDesc('При вставке чистого URL ролика на YouTube использует ![](URL).')
            .addToggle(t => t.setValue(this.plugin.settings.pasteYouTube).onChange(async (v) => {
            this.plugin.settings.pasteYouTube = v;
            await this.plugin.saveSettings();
        }));
        containerEl.createEl('h3', { text: 'Правила по типам файлов' });
        const labels = [
            { cat: 'markdown', name: 'Заметки Markdown', desc: '.md, .markdown' },
            { cat: 'image', name: 'Изображения', desc: EXTENSIONS.image.join(', ') },
            { cat: 'pdf', name: 'PDF', desc: '.pdf' },
            { cat: 'video', name: 'Видеофайлы', desc: EXTENSIONS.video.join(', ') },
            { cat: 'audio', name: 'Аудиофайлы', desc: EXTENSIONS.audio.join(', ') },
            { cat: 'other', name: 'Неизвестные типы', desc: 'По умолчанию обычная ссылка' }
        ];
        for (const { cat, name, desc } of labels) {
            new obsidian_1.Setting(containerEl).setName(name).setDesc(desc)
                .addDropdown(d => d.addOptions({ link: 'Обычная ссылка [[...]]', embed: 'Встроить ![[...]]' })
                .setValue(this.plugin.settings.rules[cat]).onChange(async (v) => {
                this.plugin.settings.rules[cat] = v;
                await this.plugin.saveSettings();
            }));
        }
        containerEl.createEl('h3', { text: 'Дополнительные расширения' });
        new obsidian_1.Setting(containerEl).setName('Всегда встраивать')
            .setDesc('Расширения через запятую, например epub, tif. Работает только если Obsidian умеет отображать формат.')
            .addText(t => t.setPlaceholder('epub, tif').setValue(this.plugin.settings.additionalEmbedExtensions)
            .onChange(async (v) => { this.plugin.settings.additionalEmbedExtensions = v; await this.plugin.saveSettings(); }));
        new obsidian_1.Setting(containerEl).setName('Всегда оставлять ссылкой')
            .setDesc('Приоритет выше правила встраивания. Например zip, md.')
            .addText(t => t.setPlaceholder('zip, exe').setValue(this.plugin.settings.additionalLinkExtensions)
            .onChange(async (v) => { this.plugin.settings.additionalLinkExtensions = v; await this.plugin.saveSettings(); }));
        containerEl.createEl('p', { text: 'Существующие ссылки изменяются только командами через палитру команд. Начните с резервной копии заметок.' });
    }
}
exports.__test = { youtubeEmbed, transformText, linkBehavior, inInlineCode };
