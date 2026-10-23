"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  __test: () => __test,
  default: () => LinkerPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian2 = require("obsidian");
var import_view2 = require("@codemirror/view");

// src/externalLinks.ts
var import_obsidian = require("obsidian");
var import_view = require("@codemirror/view");
var fs = __toESM(require("node:fs"));
var path = __toESM(require("node:path"));
var import_node_url = require("node:url");
function resolveExternalTarget(target) {
  const value = target.trim();
  if (!value) return null;
  if (value.startsWith("external:")) {
    let candidate;
    try {
      candidate = decodeURIComponent(value.slice("external:".length));
    } catch {
      return null;
    }
    const normalized = path.normalize(candidate);
    return path.isAbsolute(normalized) ? normalized : null;
  }
  if (!/^file:\/\//i.test(value)) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "file:" || url.hostname && url.hostname !== "localhost") return null;
    const filename = (0, import_node_url.fileURLToPath)(url);
    return path.isAbsolute(filename) ? path.normalize(filename) : null;
  } catch {
    return null;
  }
}
function isExternalWikiTarget(target) {
  return target.startsWith("external:");
}
function createExternalLink(absolutePath, label, format) {
  const candidate = path.normalize(absolutePath.trim());
  if (!path.isAbsolute(candidate)) throw new Error("A local absolute path is required.");
  const fileName = path.basename(candidate) || candidate;
  const title = (label.trim() || fileName).replace(/[\r\n]/g, " ").trim();
  if (format === "markdown") {
    const safeLabel = title.replace(/\\/g, "\\\\").replace(/\]/g, "\\]");
    return "[" + safeLabel + "](<" + (0, import_node_url.pathToFileURL)(candidate).href + ">)";
  }
  const wikiPath = candidate.replace(/\\/g, "/").replace(/%/g, "%25").replace(/\|/g, "%7C").replace(/\[/g, "%5B").replace(/\]/g, "%5D");
  const safeAlias = title.replace(/\|/g, "\xA6").replace(/\]/g, ")");
  return "[[external:" + wikiPath + "|" + safeAlias + "]]";
}
function readExternalLinkFromWiki(value) {
  if (!isExternalWikiTarget(value)) return null;
  const separator = value.indexOf("|");
  const target = separator < 0 ? value : value.slice(0, separator);
  const resolved = resolveExternalTarget(target);
  if (!resolved) return null;
  return { target, label: (separator < 0 ? path.basename(resolved) : value.slice(separator + 1)) || resolved };
}
function isExecutablePath(filename) {
  return /\.(exe|com|bat|cmd|ps1|sh|desktop|app|appimage|command|bin|msi|scr|jar|run|lnk|url)$/i.test(filename);
}
async function openExternalTarget(target, mode, t) {
  const filename = resolveExternalTarget(target);
  if (!filename) {
    new import_obsidian.Notice(t("externalInvalidPath"));
    return;
  }
  let isDirectory;
  let isExecutable;
  try {
    const stat = await fs.promises.stat(filename);
    isDirectory = stat.isDirectory();
    isExecutable = isExecutablePath(filename) || !isDirectory && process.platform !== "win32" && (stat.mode & 73) !== 0;
  } catch {
    new import_obsidian.Notice(t("externalMissing", { path: filename }));
    return;
  }
  try {
    const shell = require("electron").shell;
    if (!shell) throw new Error("Electron shell is unavailable");
    if (mode === "reveal" || isExecutable) {
      shell.showItemInFolder(filename);
    } else {
      const error = await shell.openPath(filename);
      if (error) throw new Error(error);
    }
  } catch (error) {
    console.error("Linker: cannot open external file", error);
    new import_obsidian.Notice(t("externalOpenFailed"));
  }
}
async function chooseNativePath(kind) {
  try {
    let remote;
    try {
      remote = require("electron").remote;
    } catch {
    }
    if (!remote?.dialog) {
      try {
        remote = require("@electron/remote");
      } catch {
      }
    }
    if (!remote?.dialog) return null;
    const result = await remote.dialog.showOpenDialog({
      properties: [kind === "file" ? "openFile" : "openDirectory"]
    });
    return result.canceled ? null : result.filePaths[0] || null;
  } catch (error) {
    console.error("Linker: native picker failed", error);
    return null;
  }
}
var ExternalInsertModal = class extends import_obsidian.Modal {
  constructor(app, editor, kind, getFormat, t) {
    super(app);
    this.editor = editor;
    this.kind = kind;
    this.getFormat = getFormat;
    this.t = t;
    this.selectedPath = "";
    this.displayName = "";
    this.editedName = false;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: this.t(this.kind === "file" ? "externalInsertFile" : "externalInsertFolder") });
    contentEl.createEl("p", { text: this.t("externalInsertHint") });
    let updatePath = () => {
    };
    let nameField;
    let pathField;
    new import_obsidian.Setting(contentEl).setName(this.t("externalPath")).addText((input) => {
      input.setPlaceholder(this.kind === "file" ? "/home/user/Documents/report.pdf" : "/home/user/Projects").setValue(this.selectedPath).onChange((next) => {
        this.selectedPath = next;
        if (!this.editedName) updatePath(next);
      });
      updatePath = (next) => {
        if (!this.editedName) {
          this.displayName = path.basename(next.replace(/[\\/]+$/, "")) || next;
          nameField?.setValue(this.displayName);
        }
      };
      pathField = input;
    });
    new import_obsidian.Setting(contentEl).setName(this.t("externalDisplayName")).addText((input) => {
      nameField = input;
      input.setPlaceholder(this.t("externalDisplayPlaceholder")).onChange((value) => {
        if (value !== this.displayName) this.editedName = true;
        this.displayName = value;
      });
    });
    new import_obsidian.Setting(contentEl).addButton((button) => button.setButtonText(this.t("externalBrowse")).onClick(async () => {
      const selected = await chooseNativePath(this.kind);
      if (!selected) {
        new import_obsidian.Notice(this.t("externalPickerFallback"));
        return;
      }
      this.selectedPath = selected;
      pathField?.setValue(selected);
      if (!this.editedName) updatePath(selected);
    })).addButton((button) => button.setButtonText(this.t("cancel")).onClick(() => this.close())).addButton((button) => button.setButtonText(this.t("externalInsert")).setCta().onClick(() => {
      try {
        const target = this.selectedPath.trim();
        const parsed = target.startsWith("file://") ? resolveExternalTarget(target) : target;
        if (!parsed || !path.isAbsolute(parsed)) {
          new import_obsidian.Notice(this.t("externalInvalidPath"));
          return;
        }
        this.editor.replaceSelection(createExternalLink(parsed, this.displayName, this.getFormat()));
        this.close();
      } catch {
        new import_obsidian.Notice(this.t("externalInvalidPath"));
      }
    }));
  }
  onClose() {
    this.contentEl.empty();
  }
};
function collectLinks(text, offset) {
  const result = [];
  const wiki = /(?<!!)\[\[(external:[^\]\r\n]+)\]\]/g;
  for (const match of text.matchAll(wiki)) {
    const parsed = readExternalLinkFromWiki(match[1]);
    if (parsed) result.push({ from: offset + match.index, to: offset + match.index + match[0].length, ...parsed });
  }
  const md = /\[([^\]\r\n]+)\]\(\s*(?:<(file:\/\/\/[^>\r\n]+)>|(file:\/\/\/[^\s)\r\n]+))\s*\)/gi;
  for (const match of text.matchAll(md)) {
    const target = match[2] || match[3];
    if (resolveExternalTarget(target)) {
      result.push({
        from: offset + match.index,
        to: offset + match.index + match[0].length,
        target,
        label: match[1].replace(/\\\]/g, "]")
      });
    }
  }
  return result.sort((a, b) => a.from - b.from).filter((match, index, arr) => index === 0 || match.from >= arr[index - 1].to);
}
function getExternalEditorExtension(config, t) {
  class ExternalLinkWidget extends import_view.WidgetType {
    constructor(target, label) {
      super();
      this.target = target;
      this.label = label;
    }
    eq(other) {
      return this.target === other.target && this.label === other.label;
    }
    toDOM() {
      const el = document.createElement("span");
      el.className = "cm-link cm-underline";
      el.textContent = this.label;
      el.title = this.target;
      el.setAttribute("role", "link");
      el.tabIndex = 0;
      const open = (event) => {
        event.preventDefault();
        event.stopPropagation();
        void openExternalTarget(this.target, config().externalOpenMode, t);
      };
      el.addEventListener("click", open);
      el.addEventListener("keydown", (event) => {
        if (event.key === "Enter") open(event);
      });
      return el;
    }
  }
  const build = (view) => {
    if (!config().externalEnabled) return import_view.Decoration.none;
    const decorations = [];
    const cursor = view.state.selection.main.head;
    for (const range of view.visibleRanges) {
      const matches = collectLinks(view.state.doc.sliceString(range.from, range.to), range.from);
      for (const link of matches) {
        if (cursor >= link.from - 1 && cursor <= link.to + 1) continue;
        decorations.push(import_view.Decoration.replace({ widget: new ExternalLinkWidget(link.target, link.label) }).range(link.from, link.to));
      }
    }
    return import_view.Decoration.set(decorations, true);
  };
  return import_view.ViewPlugin.fromClass(class {
    constructor(view) {
      this.decorations = build(view);
    }
    update(update) {
      if (update.docChanged || update.selectionSet || update.viewportChanged) {
        this.decorations = build(update.view);
      }
    }
  }, { decorations: (instance) => instance.decorations });
}
function handleExternalAnchorClick(event, config, t) {
  if (!config.externalEnabled) return false;
  const element = event.target;
  if (!(element instanceof Element)) return false;
  const anchor = element.closest("a");
  if (!anchor) return false;
  const link = anchor.getAttribute("data-href") || anchor.getAttribute("href") || "";
  const target = link.startsWith("external:") ? link.split("|")[0] : link;
  if (!resolveExternalTarget(target)) return false;
  event.preventDefault();
  event.stopImmediatePropagation();
  void openExternalTarget(target, config.externalOpenMode, t);
  return true;
}

// src/locales/en.ts
var EN = {
  language: "Interface language",
  languageDesc: "Choose the language for Linker independently of Obsidian.",
  languageAuto: "Automatic (Obsidian language)",
  languageEnglish: "English",
  languageRussian: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439",
  languageSpanish: "Espa\xF1ol",
  languageChinese: "\u7B80\u4F53\u4E2D\u6587",
  languageChanged: "Settings language updated. Reload the plugin to update command palette names.",
  automaticWiki: "Automatically process Wiki-links",
  automaticWikiDesc: "Apply file-type rules to newly created or pasted [[links]], without rewriting the entire document.",
  automaticYouTube: "YouTube \u2192 embedded player",
  automaticYouTubeDesc: "Convert standalone YouTube URLs and Markdown links when processing existing notes.",
  pasteYouTube: "Embed YouTube on paste",
  pasteYouTubeDesc: "Insert ![](URL) when a YouTube video URL is pasted into an eligible line.",
  fileRules: "File type rules",
  markdown: "Markdown notes",
  image: "Images",
  pdf: "PDF files",
  video: "Video files",
  audio: "Audio files",
  other: "Unknown file types",
  otherDesc: "Normal links by default",
  link: "Link [[...]]",
  embed: "Embed ![[...]]",
  extraExtensions: "Additional extensions",
  alwaysEmbed: "Always embed",
  alwaysEmbedDesc: "Comma-separated extensions such as epub, tif. The file can be displayed only if Obsidian supports it.",
  alwaysLink: "Always link",
  alwaysLinkDesc: "Takes priority over embed rules. For example: zip, md.",
  existingLinksHint: "Existing links are changed only through command palette actions. Back up your notes first.",
  currentCommand: "Preview and convert links in current note",
  vaultCommand: "Preview and convert links in entire vault",
  currentTitle: "Convert links in the current note?",
  vaultTitle: "Convert links in the entire vault?",
  currentDescription: "{count} changes proposed. Code fences and frontmatter will be skipped.",
  vaultDescription: "{count} changes in {files} notes. Back up your vault before a bulk operation.",
  noChanges: "Linker: no changes needed.",
  applied: "Linker: applied {count} changes.",
  vaultApplied: "Linker: converted {count} links.{errors}",
  vaultErrors: " Errors: {count}.",
  modalError: "Linker: conversion failed. Check the developer console.",
  lineExample: "Line {line}: {before} \u2192 {after}",
  moreExamples: "...and {count} more",
  cancel: "Cancel",
  tabGeneral: "General",
  tabExternal: "External files and folders",
  externalEnabled: "Enable external links",
  externalEnabledDesc: "Allow local file and folder links without importing attachments into the vault.",
  externalFormat: "Format for new external links",
  externalFormatDesc: "Only affects newly inserted external links; both formats remain clickable.",
  externalMarkdown: "Markdown [name](file:///...)",
  externalWiki: "Wiki [[external:...|name]]",
  externalOpenMode: "On click",
  externalOpenModeDesc: "Choose how to handle a local file or folder.",
  externalModeOpen: "Open in default application / file manager",
  externalModeReveal: "Show in file manager",
  externalSettingsHint: "Use the command palette to insert a link to an external file or folder. Paths must be absolute. Executable files are only revealed, never launched.",
  externalInsertFile: "Insert link to external file",
  externalInsertFolder: "Insert link to external folder",
  externalInsertHint: "Choose a path or enter an absolute local path. No files will be copied into the vault.",
  externalPath: "File or folder path",
  externalDisplayName: "Display name",
  externalDisplayPlaceholder: "Optional link name",
  externalBrowse: "Browse\u2026",
  externalInsert: "Insert link",
  externalPickerFallback: "File picker is unavailable or cancelled. You can enter a path manually.",
  externalInvalidPath: "Please enter a valid absolute local file or folder path.",
  externalMissing: "External path not found: {path}",
  externalOpenFailed: "Could not open the external file or folder.",
  apply: "Apply"
};

// src/locales/ru.ts
var RU = {
  language: "\u042F\u0437\u044B\u043A \u0438\u043D\u0442\u0435\u0440\u0444\u0435\u0439\u0441\u0430",
  languageDesc: "\u042F\u0437\u044B\u043A Linker \u043C\u043E\u0436\u043D\u043E \u0432\u044B\u0431\u0440\u0430\u0442\u044C \u043D\u0435\u0437\u0430\u0432\u0438\u0441\u0438\u043C\u043E \u043E\u0442 \u044F\u0437\u044B\u043A\u0430 Obsidian.",
  languageAuto: "\u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438 (\u044F\u0437\u044B\u043A Obsidian)",
  languageEnglish: "English",
  languageRussian: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439",
  languageSpanish: "Espa\xF1ol",
  languageChinese: "\u7B80\u4F53\u4E2D\u6587",
  languageChanged: "\u042F\u0437\u044B\u043A \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043A \u0438\u0437\u043C\u0435\u043D\u0451\u043D. \u041F\u0435\u0440\u0435\u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u043F\u043B\u0430\u0433\u0438\u043D, \u0447\u0442\u043E\u0431\u044B \u043E\u0431\u043D\u043E\u0432\u0438\u0442\u044C \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u044F \u043A\u043E\u043C\u0430\u043D\u0434 \u0432 \u043F\u0430\u043B\u0438\u0442\u0440\u0435.",
  automaticWiki: "\u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430 Wiki-\u0441\u0441\u044B\u043B\u043E\u043A",
  automaticWikiDesc: "\u041F\u0440\u0438\u043C\u0435\u043D\u044F\u0435\u0442 \u043F\u0440\u0430\u0432\u0438\u043B\u0430 \u0442\u0438\u043F\u043E\u0432 \u0444\u0430\u0439\u043B\u043E\u0432 \u043A \u043D\u043E\u0432\u044B\u043C \u0438\u043B\u0438 \u0432\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u043D\u044B\u043C [[\u0441\u0441\u044B\u043B\u043A\u0430\u043C]], \u043D\u0435 \u043F\u0435\u0440\u0435\u043F\u0438\u0441\u044B\u0432\u0430\u044F \u0432\u0435\u0441\u044C \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442.",
  automaticYouTube: "YouTube \u2192 \u0432\u0441\u0442\u0440\u043E\u0435\u043D\u043D\u044B\u0439 \u043F\u043B\u0435\u0435\u0440",
  automaticYouTubeDesc: "\u041F\u0440\u0435\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u044B\u0432\u0430\u0442\u044C \u043E\u0434\u0438\u043D\u043E\u0447\u043D\u044B\u0435 YouTube URL \u0438 Markdown-\u0441\u0441\u044B\u043B\u043A\u0438 \u043F\u0440\u0438 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u044E\u0449\u0438\u0445 \u0437\u0430\u043C\u0435\u0442\u043E\u043A.",
  pasteYouTube: "\u0412\u0441\u0442\u0440\u0430\u0438\u0432\u0430\u0442\u044C YouTube \u043F\u0440\u0438 \u0432\u0441\u0442\u0430\u0432\u043A\u0435",
  pasteYouTubeDesc: "\u041F\u0440\u0438 \u0432\u0441\u0442\u0430\u0432\u043A\u0435 URL \u0440\u043E\u043B\u0438\u043A\u0430 \u043D\u0430 YouTube \u0432 \u043F\u043E\u0434\u0445\u043E\u0434\u044F\u0449\u0443\u044E \u0441\u0442\u0440\u043E\u043A\u0443 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F ![](URL).",
  fileRules: "\u041F\u0440\u0430\u0432\u0438\u043B\u0430 \u043F\u043E \u0442\u0438\u043F\u0430\u043C \u0444\u0430\u0439\u043B\u043E\u0432",
  markdown: "\u0417\u0430\u043C\u0435\u0442\u043A\u0438 Markdown",
  image: "\u0418\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F",
  pdf: "PDF-\u0444\u0430\u0439\u043B\u044B",
  video: "\u0412\u0438\u0434\u0435\u043E\u0444\u0430\u0439\u043B\u044B",
  audio: "\u0410\u0443\u0434\u0438\u043E\u0444\u0430\u0439\u043B\u044B",
  other: "\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u044B\u0435 \u0442\u0438\u043F\u044B",
  otherDesc: "\u041F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E \u043E\u0431\u044B\u0447\u043D\u0430\u044F \u0441\u0441\u044B\u043B\u043A\u0430",
  link: "\u041E\u0431\u044B\u0447\u043D\u0430\u044F \u0441\u0441\u044B\u043B\u043A\u0430 [[...]]",
  embed: "\u0412\u0441\u0442\u0440\u043E\u0438\u0442\u044C ![[...]]",
  extraExtensions: "\u0414\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u0440\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u044F",
  alwaysEmbed: "\u0412\u0441\u0435\u0433\u0434\u0430 \u0432\u0441\u0442\u0440\u0430\u0438\u0432\u0430\u0442\u044C",
  alwaysEmbedDesc: "\u0420\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u044F \u0447\u0435\u0440\u0435\u0437 \u0437\u0430\u043F\u044F\u0442\u0443\u044E, \u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440 epub, tif. \u0424\u043E\u0440\u043C\u0430\u0442 \u0434\u043E\u043B\u0436\u0435\u043D \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0442\u044C\u0441\u044F Obsidian.",
  alwaysLink: "\u0412\u0441\u0435\u0433\u0434\u0430 \u043E\u0441\u0442\u0430\u0432\u043B\u044F\u0442\u044C \u0441\u0441\u044B\u043B\u043A\u043E\u0439",
  alwaysLinkDesc: "\u041F\u0440\u0438\u043E\u0440\u0438\u0442\u0435\u0442 \u0432\u044B\u0448\u0435 \u043F\u0440\u0430\u0432\u0438\u043B\u0430 \u0432\u0441\u0442\u0440\u0430\u0438\u0432\u0430\u043D\u0438\u044F. \u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440 zip, md.",
  existingLinksHint: "\u0421\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u044E\u0449\u0438\u0435 \u0441\u0441\u044B\u043B\u043A\u0438 \u0438\u0437\u043C\u0435\u043D\u044F\u044E\u0442\u0441\u044F \u0442\u043E\u043B\u044C\u043A\u043E \u043A\u043E\u043C\u0430\u043D\u0434\u0430\u043C\u0438 \u0447\u0435\u0440\u0435\u0437 \u043F\u0430\u043B\u0438\u0442\u0440\u0443 \u043A\u043E\u043C\u0430\u043D\u0434. \u041D\u0430\u0447\u043D\u0438\u0442\u0435 \u0441 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u043E\u0439 \u043A\u043E\u043F\u0438\u0438 \u0437\u0430\u043C\u0435\u0442\u043E\u043A.",
  currentCommand: "\u041F\u0440\u0435\u0434\u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440 \u0438 \u043F\u0440\u0435\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u0435 \u0441\u0441\u044B\u043B\u043E\u043A \u0432 \u0442\u0435\u043A\u0443\u0449\u0435\u0439 \u0437\u0430\u043C\u0435\u0442\u043A\u0435",
  vaultCommand: "\u041F\u0440\u0435\u0434\u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440 \u0438 \u043F\u0440\u0435\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u0435 \u0441\u0441\u044B\u043B\u043E\u043A \u0432\u043E \u0432\u0441\u0451\u043C \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435",
  currentTitle: "\u041F\u0440\u0435\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u0442\u044C \u0441\u0441\u044B\u043B\u043A\u0438 \u0432 \u0442\u0435\u043A\u0443\u0449\u0435\u0439 \u0437\u0430\u043C\u0435\u0442\u043A\u0435?",
  vaultTitle: "\u041F\u0440\u0435\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u0442\u044C \u0441\u0441\u044B\u043B\u043A\u0438 \u0432\u043E \u0432\u0441\u0451\u043C \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435?",
  currentDescription: "\u041F\u0440\u0435\u0434\u043B\u0430\u0433\u0430\u0435\u0442\u0441\u044F {count} \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0439. \u0422\u0435\u043A\u0441\u0442 \u0432 \u043A\u043E\u0434\u043E\u0432\u044B\u0445 \u0431\u043B\u043E\u043A\u0430\u0445 \u0438 frontmatter \u043F\u0440\u043E\u043F\u0443\u0441\u043A\u0430\u0435\u0442\u0441\u044F.",
  vaultDescription: "{count} \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0439 \u0432 {files} \u0437\u0430\u043C\u0435\u0442\u043A\u0430\u0445. \u041F\u0435\u0440\u0435\u0434 \u043C\u0430\u0441\u0441\u043E\u0432\u043E\u0439 \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u0435\u0439 \u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0443\u0435\u0442\u0441\u044F \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u0430\u044F \u043A\u043E\u043F\u0438\u044F.",
  noChanges: "Linker: \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0439 \u043D\u0435 \u0442\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044F.",
  applied: "Linker: \u043F\u0440\u0438\u043C\u0435\u043D\u0435\u043D\u043E {count} \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0439.",
  vaultApplied: "Linker: \u043F\u0440\u0435\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u043E {count} \u0441\u0441\u044B\u043B\u043E\u043A.{errors}",
  vaultErrors: " \u041E\u0448\u0438\u0431\u043E\u043A: {count}.",
  modalError: "Linker: \u043E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0435\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u044F. \u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u043A\u043E\u043D\u0441\u043E\u043B\u044C.",
  lineExample: "\u0421\u0442\u0440\u043E\u043A\u0430 {line}: {before} \u2192 {after}",
  moreExamples: "...\u0438 \u0435\u0449\u0451 {count}",
  cancel: "\u041E\u0442\u043C\u0435\u043D\u0430",
  tabGeneral: "\u041E\u0441\u043D\u043E\u0432\u043D\u044B\u0435",
  tabExternal: "\u0412\u043D\u0435\u0448\u043D\u0438\u0435 \u0444\u0430\u0439\u043B\u044B \u0438 \u043F\u0430\u043F\u043A\u0438",
  externalEnabled: "\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0432\u043D\u0435\u0448\u043D\u0438\u0435 \u0441\u0441\u044B\u043B\u043A\u0438",
  externalEnabledDesc: "\u0421\u0441\u044B\u043B\u043A\u0438 \u043D\u0430 \u0444\u0430\u0439\u043B\u044B \u0438 \u043F\u0430\u043F\u043A\u0438 \u0437\u0430 \u043F\u0440\u0435\u0434\u0435\u043B\u0430\u043C\u0438 \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430 \u0431\u0435\u0437 \u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F \u0432\u043B\u043E\u0436\u0435\u043D\u0438\u0439.",
  externalFormat: "\u0424\u043E\u0440\u043C\u0430\u0442 \u043D\u043E\u0432\u044B\u0445 \u0432\u043D\u0435\u0448\u043D\u0438\u0445 \u0441\u0441\u044B\u043B\u043E\u043A",
  externalFormatDesc: "\u041E\u043F\u0440\u0435\u0434\u0435\u043B\u044F\u0435\u0442 \u0442\u043E\u043B\u044C\u043A\u043E \u0441\u043E\u0437\u0434\u0430\u0432\u0430\u0435\u043C\u044B\u0435 \u0441\u0441\u044B\u043B\u043A\u0438. \u041E\u0431\u0430 \u0444\u043E\u0440\u043C\u0430\u0442\u0430 \u043E\u0441\u0442\u0430\u044E\u0442\u0441\u044F \u043A\u043B\u0438\u043A\u0430\u0431\u0435\u043B\u044C\u043D\u044B\u043C\u0438.",
  externalMarkdown: "Markdown [\u0438\u043C\u044F](file:///...)",
  externalWiki: "Wiki [[external:...|\u0438\u043C\u044F]]",
  externalOpenMode: "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u043F\u0440\u0438 \u043D\u0430\u0436\u0430\u0442\u0438\u0438",
  externalOpenModeDesc: "\u041A\u0430\u043A \u043E\u0442\u043A\u0440\u044B\u0432\u0430\u0442\u044C \u0432\u043D\u0435\u0448\u043D\u0438\u0439 \u0444\u0430\u0439\u043B \u0438\u043B\u0438 \u043F\u0430\u043F\u043A\u0443.",
  externalModeOpen: "\u041E\u0442\u043A\u0440\u044B\u0432\u0430\u0442\u044C \u0432 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0438 / \u0444\u0430\u0439\u043B\u043E\u0432\u043E\u043C \u043C\u0435\u043D\u0435\u0434\u0436\u0435\u0440\u0435",
  externalModeReveal: "\u041F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0442\u044C \u0432 \u0444\u0430\u0439\u043B\u043E\u0432\u043E\u043C \u043C\u0435\u043D\u0435\u0434\u0436\u0435\u0440\u0435",
  externalSettingsHint: "\u0412\u0441\u0442\u0430\u0432\u043A\u0430 \u0432\u043D\u0435\u0448\u043D\u0435\u0433\u043E \u0444\u0430\u0439\u043B\u0430 \u0438\u043B\u0438 \u043F\u0430\u043F\u043A\u0438 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0430 \u0447\u0435\u0440\u0435\u0437 \u043F\u0430\u043B\u0438\u0442\u0440\u0443 \u043A\u043E\u043C\u0430\u043D\u0434. \u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u044E\u0442\u0441\u044F \u0430\u0431\u0441\u043E\u043B\u044E\u0442\u043D\u044B\u0435 \u043F\u0443\u0442\u0438. \u0418\u0441\u043F\u043E\u043B\u043D\u044F\u0435\u043C\u044B\u0435 \u0444\u0430\u0439\u043B\u044B \u0442\u043E\u043B\u044C\u043A\u043E \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u044E\u0442\u0441\u044F \u0432 \u043F\u0430\u043F\u043A\u0435, \u043D\u043E \u043D\u0435 \u0437\u0430\u043F\u0443\u0441\u043A\u0430\u044E\u0442\u0441\u044F.",
  externalInsertFile: "\u0412\u0441\u0442\u0430\u0432\u0438\u0442\u044C \u0441\u0441\u044B\u043B\u043A\u0443 \u043D\u0430 \u0432\u043D\u0435\u0448\u043D\u0438\u0439 \u0444\u0430\u0439\u043B",
  externalInsertFolder: "\u0412\u0441\u0442\u0430\u0432\u0438\u0442\u044C \u0441\u0441\u044B\u043B\u043A\u0443 \u043D\u0430 \u0432\u043D\u0435\u0448\u043D\u044E\u044E \u043F\u0430\u043F\u043A\u0443",
  externalInsertHint: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043E\u0431\u044A\u0435\u043A\u0442 \u0438\u043B\u0438 \u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u0430\u0431\u0441\u043E\u043B\u044E\u0442\u043D\u044B\u0439 \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u043F\u0443\u0442\u044C. \u0424\u0430\u0439\u043B\u044B \u043D\u0435 \u043A\u043E\u043F\u0438\u0440\u0443\u044E\u0442\u0441\u044F \u0432 \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435.",
  externalPath: "\u041F\u0443\u0442\u044C \u043A \u0444\u0430\u0439\u043B\u0443 \u0438\u043B\u0438 \u043F\u0430\u043F\u043A\u0435",
  externalDisplayName: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0441\u0441\u044B\u043B\u043A\u0438",
  externalDisplayPlaceholder: "\u041D\u0435\u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0435 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435",
  externalBrowse: "\u0412\u044B\u0431\u0440\u0430\u0442\u044C\u2026",
  externalInsert: "\u0412\u0441\u0442\u0430\u0432\u0438\u0442\u044C \u0441\u0441\u044B\u043B\u043A\u0443",
  externalPickerFallback: "\u0414\u0438\u0430\u043B\u043E\u0433 \u0432\u044B\u0431\u043E\u0440\u0430 \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D \u0438\u043B\u0438 \u043E\u0442\u043C\u0435\u043D\u0451\u043D. \u041F\u0443\u0442\u044C \u043C\u043E\u0436\u043D\u043E \u0432\u0432\u0435\u0441\u0442\u0438 \u0432\u0440\u0443\u0447\u043D\u0443\u044E.",
  externalInvalidPath: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 \u0430\u0431\u0441\u043E\u043B\u044E\u0442\u043D\u044B\u0439 \u043F\u0443\u0442\u044C \u043A \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u043E\u043C\u0443 \u0444\u0430\u0439\u043B\u0443 \u0438\u043B\u0438 \u043F\u0430\u043F\u043A\u0435.",
  externalMissing: "\u0412\u043D\u0435\u0448\u043D\u0438\u0439 \u043F\u0443\u0442\u044C \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D: {path}",
  externalOpenFailed: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043E\u0442\u043A\u0440\u044B\u0442\u044C \u0432\u043D\u0435\u0448\u043D\u0438\u0439 \u0444\u0430\u0439\u043B \u0438\u043B\u0438 \u043F\u0430\u043F\u043A\u0443.",
  apply: "\u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C"
};

// src/locales/es.ts
var ES = {
  language: "Idioma de la interfaz",
  languageDesc: "Elige el idioma de Linker independientemente del idioma de Obsidian.",
  languageAuto: "Autom\xE1tico (idioma de Obsidian)",
  languageEnglish: "English",
  languageRussian: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439",
  languageSpanish: "Espa\xF1ol",
  languageChinese: "\u7B80\u4F53\u4E2D\u6587",
  languageChanged: "Idioma actualizado. Recarga el plugin para actualizar los nombres de los comandos.",
  automaticWiki: "Procesar enlaces Wiki autom\xE1ticamente",
  automaticWikiDesc: "Aplica reglas seg\xFAn el tipo de archivo a los enlaces [[...]] nuevos o pegados sin reescribir la nota entera.",
  automaticYouTube: "YouTube \u2192 reproductor integrado",
  automaticYouTubeDesc: "Convierte las URL de YouTube independientes y los enlaces Markdown al procesar notas existentes.",
  pasteYouTube: "Incrustar YouTube al pegar",
  pasteYouTubeDesc: "Inserta ![](URL) al pegar la URL de un v\xEDdeo de YouTube en una l\xEDnea adecuada.",
  fileRules: "Reglas por tipo de archivo",
  markdown: "Notas Markdown",
  image: "Im\xE1genes",
  pdf: "Archivos PDF",
  video: "Archivos de v\xEDdeo",
  audio: "Archivos de audio",
  other: "Otros tipos de archivo",
  otherDesc: "Enlaces normales de forma predeterminada",
  link: "Enlace [[...]]",
  embed: "Incrustar ![[...]]",
  extraExtensions: "Extensiones adicionales",
  alwaysEmbed: "Incrustar siempre",
  alwaysEmbedDesc: "Extensiones separadas por comas, como epub, tif. Obsidian solo mostrar\xE1 los formatos compatibles.",
  alwaysLink: "Usar siempre un enlace",
  alwaysLinkDesc: "Tiene prioridad sobre las reglas de incrustaci\xF3n. Por ejemplo: zip, md.",
  existingLinksHint: "Los enlaces existentes solo cambian mediante comandos. Haz una copia de seguridad de tus notas.",
  currentCommand: "Vista previa y conversi\xF3n de enlaces en la nota actual",
  vaultCommand: "Vista previa y conversi\xF3n de enlaces en toda la b\xF3veda",
  currentTitle: "\xBFConvertir los enlaces de la nota actual?",
  vaultTitle: "\xBFConvertir los enlaces de toda la b\xF3veda?",
  currentDescription: "Se proponen {count} cambios. Se omitir\xE1n los bloques de c\xF3digo y los metadatos iniciales.",
  vaultDescription: "{count} cambios en {files} notas. Haz una copia de seguridad antes de la conversi\xF3n masiva.",
  noChanges: "Linker: no es necesario hacer cambios.",
  applied: "Linker: se aplicaron {count} cambios.",
  vaultApplied: "Linker: se convirtieron {count} enlaces.{errors}",
  vaultErrors: " Errores: {count}.",
  modalError: "Linker: error durante la conversi\xF3n. Consulta la consola de desarrollo.",
  lineExample: "L\xEDnea {line}: {before} \u2192 {after}",
  moreExamples: "...y {count} m\xE1s",
  cancel: "Cancelar",
  tabGeneral: "General",
  tabExternal: "Archivos y carpetas externos",
  externalEnabled: "Activar enlaces externos",
  externalEnabledDesc: "Enlaces a archivos y carpetas fuera de la b\xF3veda sin copiar adjuntos.",
  externalFormat: "Formato de los nuevos enlaces externos",
  externalFormatDesc: "Solo afecta a los enlaces nuevos; ambos formatos se pueden abrir.",
  externalMarkdown: "Markdown [nombre](file:///...)",
  externalWiki: "Wiki [[external:...|nombre]]",
  externalOpenMode: "Al hacer clic",
  externalOpenModeDesc: "C\xF3mo abrir archivos y carpetas locales.",
  externalModeOpen: "Abrir con la aplicaci\xF3n o gestor predeterminado",
  externalModeReveal: "Mostrar en el gestor de archivos",
  externalSettingsHint: "Inserta enlaces a archivos o carpetas externos desde la paleta de comandos. Usa rutas absolutas. Los archivos ejecutables solo se muestran en su carpeta.",
  externalInsertFile: "Insertar enlace a archivo externo",
  externalInsertFolder: "Insertar enlace a carpeta externa",
  externalInsertHint: "Selecciona o introduce una ruta local absoluta. No se copiar\xE1 ning\xFAn archivo a la b\xF3veda.",
  externalPath: "Ruta del archivo o carpeta",
  externalDisplayName: "Nombre del enlace",
  externalDisplayPlaceholder: "Nombre opcional",
  externalBrowse: "Examinar\u2026",
  externalInsert: "Insertar enlace",
  externalPickerFallback: "Selector no disponible o cancelado. Puedes introducir la ruta manualmente.",
  externalInvalidPath: "Introduce una ruta local absoluta v\xE1lida.",
  externalMissing: "No se encuentra la ruta externa: {path}",
  externalOpenFailed: "No se pudo abrir el archivo o la carpeta externa.",
  apply: "Aplicar"
};

// src/locales/zh-CN.ts
var ZH_CN = {
  language: "\u754C\u9762\u8BED\u8A00",
  languageDesc: "\u5355\u72EC\u8BBE\u7F6E Linker \u7684\u754C\u9762\u8BED\u8A00\uFF0C\u4E0D\u53D7 Obsidian \u8BED\u8A00\u8BBE\u7F6E\u9650\u5236\u3002",
  languageAuto: "\u81EA\u52A8\uFF08\u8DDF\u968F Obsidian\uFF09",
  languageEnglish: "English",
  languageRussian: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439",
  languageSpanish: "Espa\xF1ol",
  languageChinese: "\u7B80\u4F53\u4E2D\u6587",
  languageChanged: "\u754C\u9762\u8BED\u8A00\u5DF2\u66F4\u65B0\u3002\u91CD\u65B0\u52A0\u8F7D\u63D2\u4EF6\u540E\uFF0C\u547D\u4EE4\u9762\u677F\u4E2D\u7684\u540D\u79F0\u4E5F\u4F1A\u66F4\u65B0\u3002",
  automaticWiki: "\u81EA\u52A8\u5904\u7406 Wiki \u94FE\u63A5",
  automaticWikiDesc: "\u6839\u636E\u6587\u4EF6\u7C7B\u578B\u5904\u7406\u65B0\u5EFA\u6216\u7C98\u8D34\u7684 [[\u94FE\u63A5]]\uFF0C\u65E0\u9700\u91CD\u5199\u6574\u7BC7\u7B14\u8BB0\u3002",
  automaticYouTube: "YouTube \u2192 \u5D4C\u5165\u5F0F\u64AD\u653E\u5668",
  automaticYouTubeDesc: "\u5904\u7406\u73B0\u6709\u7B14\u8BB0\u65F6\uFF0C\u5C06\u72EC\u7ACB\u7684 YouTube \u7F51\u5740\u53CA Markdown \u94FE\u63A5\u8F6C\u6362\u4E3A\u5D4C\u5165\u5185\u5BB9\u3002",
  pasteYouTube: "\u7C98\u8D34\u65F6\u5D4C\u5165 YouTube",
  pasteYouTubeDesc: "\u5728\u5408\u9002\u7684\u884C\u7C98\u8D34 YouTube \u89C6\u9891\u7F51\u5740\u65F6\u63D2\u5165 ![](URL)\u3002",
  fileRules: "\u6587\u4EF6\u7C7B\u578B\u89C4\u5219",
  markdown: "Markdown \u7B14\u8BB0",
  image: "\u56FE\u7247",
  pdf: "PDF \u6587\u4EF6",
  video: "\u89C6\u9891\u6587\u4EF6",
  audio: "\u97F3\u9891\u6587\u4EF6",
  other: "\u5176\u4ED6\u6587\u4EF6\u7C7B\u578B",
  otherDesc: "\u9ED8\u8BA4\u4F7F\u7528\u666E\u901A\u94FE\u63A5",
  link: "\u666E\u901A\u94FE\u63A5 [[...]]",
  embed: "\u5D4C\u5165 ![[...]]",
  extraExtensions: "\u81EA\u5B9A\u4E49\u6269\u5C55\u540D",
  alwaysEmbed: "\u59CB\u7EC8\u5D4C\u5165",
  alwaysEmbedDesc: "\u7528\u9017\u53F7\u5206\u9694\u6269\u5C55\u540D\uFF0C\u4F8B\u5982 epub\u3001tif\u3002\u53EA\u6709 Obsidian \u652F\u6301\u7684\u683C\u5F0F\u624D\u80FD\u663E\u793A\u3002",
  alwaysLink: "\u59CB\u7EC8\u4FDD\u7559\u94FE\u63A5",
  alwaysLinkDesc: "\u4F18\u5148\u7EA7\u9AD8\u4E8E\u5D4C\u5165\u89C4\u5219\uFF0C\u4F8B\u5982 zip\u3001md\u3002",
  existingLinksHint: "\u73B0\u6709\u94FE\u63A5\u4EC5\u4F1A\u901A\u8FC7\u547D\u4EE4\u9762\u677F\u64CD\u4F5C\u8FDB\u884C\u8F6C\u6362\u3002\u8BF7\u5148\u5907\u4EFD\u7B14\u8BB0\u3002",
  currentCommand: "\u9884\u89C8\u5E76\u8F6C\u6362\u5F53\u524D\u7B14\u8BB0\u4E2D\u7684\u94FE\u63A5",
  vaultCommand: "\u9884\u89C8\u5E76\u8F6C\u6362\u6574\u4E2A\u5E93\u4E2D\u7684\u94FE\u63A5",
  currentTitle: "\u8981\u8F6C\u6362\u5F53\u524D\u7B14\u8BB0\u4E2D\u7684\u94FE\u63A5\u5417\uFF1F",
  vaultTitle: "\u8981\u8F6C\u6362\u6574\u4E2A\u5E93\u4E2D\u7684\u94FE\u63A5\u5417\uFF1F",
  currentDescription: "\u8BA1\u5212\u4FEE\u6539 {count} \u5904\u3002\u5C06\u8DF3\u8FC7\u4EE3\u7801\u5757\u548C YAML \u524D\u7F6E\u5143\u6570\u636E\u3002",
  vaultDescription: "\u5C06\u5728 {files} \u7BC7\u7B14\u8BB0\u4E2D\u4FEE\u6539 {count} \u5904\u3002\u6279\u91CF\u64CD\u4F5C\u524D\u8BF7\u5148\u5907\u4EFD\u3002",
  noChanges: "Linker\uFF1A\u65E0\u9700\u4FEE\u6539\u3002",
  applied: "Linker\uFF1A\u5DF2\u5E94\u7528 {count} \u5904\u4FEE\u6539\u3002",
  vaultApplied: "Linker\uFF1A\u5DF2\u8F6C\u6362 {count} \u4E2A\u94FE\u63A5\u3002{errors}",
  vaultErrors: " \u9519\u8BEF\uFF1A{count} \u4E2A\u3002",
  modalError: "Linker\uFF1A\u8F6C\u6362\u5931\u8D25\uFF0C\u8BF7\u67E5\u770B\u5F00\u53D1\u8005\u63A7\u5236\u53F0\u3002",
  lineExample: "\u7B2C {line} \u884C\uFF1A{before} \u2192 {after}",
  moreExamples: "\u2026\u2026\u4EE5\u53CA\u5176\u4ED6 {count} \u5904",
  cancel: "\u53D6\u6D88",
  tabGeneral: "\u5E38\u89C4",
  tabExternal: "\u5916\u90E8\u6587\u4EF6\u4E0E\u6587\u4EF6\u5939",
  externalEnabled: "\u542F\u7528\u5916\u90E8\u94FE\u63A5",
  externalEnabledDesc: "\u5F15\u7528\u5E93\u5916\u7684\u6587\u4EF6\u548C\u6587\u4EF6\u5939\uFF0C\u65E0\u9700\u5C06\u9644\u4EF6\u590D\u5236\u5230\u7B14\u8BB0\u5E93\u3002",
  externalFormat: "\u65B0\u5EFA\u5916\u90E8\u94FE\u63A5\u7684\u683C\u5F0F",
  externalFormatDesc: "\u53EA\u5F71\u54CD\u65B0\u63D2\u5165\u7684\u94FE\u63A5\uFF0C\u4E24\u79CD\u683C\u5F0F\u5747\u53EF\u70B9\u51FB\u6253\u5F00\u3002",
  externalMarkdown: "Markdown [\u540D\u79F0](file:///...)",
  externalWiki: "Wiki [[external:...|\u540D\u79F0]]",
  externalOpenMode: "\u70B9\u51FB\u94FE\u63A5\u65F6",
  externalOpenModeDesc: "\u9009\u62E9\u5982\u4F55\u6253\u5F00\u672C\u5730\u6587\u4EF6\u6216\u6587\u4EF6\u5939\u3002",
  externalModeOpen: "\u4F7F\u7528\u9ED8\u8BA4\u5E94\u7528\u6216\u6587\u4EF6\u7BA1\u7406\u5668\u6253\u5F00",
  externalModeReveal: "\u5728\u6587\u4EF6\u7BA1\u7406\u5668\u4E2D\u663E\u793A",
  externalSettingsHint: "\u901A\u8FC7\u547D\u4EE4\u9762\u677F\u63D2\u5165\u5916\u90E8\u6587\u4EF6\u6216\u6587\u4EF6\u5939\u94FE\u63A5\u3002\u5FC5\u987B\u4F7F\u7528\u7EDD\u5BF9\u8DEF\u5F84\u3002\u53EF\u6267\u884C\u6587\u4EF6\u4EC5\u5728\u6587\u4EF6\u7BA1\u7406\u5668\u4E2D\u663E\u793A\uFF0C\u4E0D\u76F4\u63A5\u8FD0\u884C\u3002",
  externalInsertFile: "\u63D2\u5165\u5916\u90E8\u6587\u4EF6\u94FE\u63A5",
  externalInsertFolder: "\u63D2\u5165\u5916\u90E8\u6587\u4EF6\u5939\u94FE\u63A5",
  externalInsertHint: "\u9009\u62E9\u5BF9\u8C61\u6216\u8F93\u5165\u672C\u5730\u7EDD\u5BF9\u8DEF\u5F84\u3002\u4E0D\u4F1A\u5411\u7B14\u8BB0\u5E93\u590D\u5236\u4EFB\u4F55\u6587\u4EF6\u3002",
  externalPath: "\u6587\u4EF6\u6216\u6587\u4EF6\u5939\u8DEF\u5F84",
  externalDisplayName: "\u94FE\u63A5\u540D\u79F0",
  externalDisplayPlaceholder: "\u53EF\u9009\u540D\u79F0",
  externalBrowse: "\u6D4F\u89C8\u2026",
  externalInsert: "\u63D2\u5165\u94FE\u63A5",
  externalPickerFallback: "\u6587\u4EF6\u9009\u62E9\u5668\u4E0D\u53EF\u7528\u6216\u5DF2\u53D6\u6D88\u3002\u53EF\u4EE5\u624B\u52A8\u8F93\u5165\u8DEF\u5F84\u3002",
  externalInvalidPath: "\u8BF7\u8F93\u5165\u6709\u6548\u7684\u672C\u5730\u7EDD\u5BF9\u8DEF\u5F84\u3002",
  externalMissing: "\u627E\u4E0D\u5230\u5916\u90E8\u8DEF\u5F84\uFF1A{path}",
  externalOpenFailed: "\u65E0\u6CD5\u6253\u5F00\u5916\u90E8\u6587\u4EF6\u6216\u6587\u4EF6\u5939\u3002",
  apply: "\u5E94\u7528"
};

// src/locales/index.ts
var TRANSLATIONS = {
  en: EN,
  ru: RU,
  es: ES,
  "zh-CN": ZH_CN
};
function localeFromLanguage(raw) {
  const value = raw.toLowerCase().replace(/_/g, "-");
  if (value === "ru" || value.startsWith("ru-")) return "ru";
  if (value === "es" || value.startsWith("es-")) return "es";
  if (value === "zh" || value === "zh-cn" || value === "zh-sg" || value === "zh-hans" || value.startsWith("zh-hans-")) return "zh-CN";
  return "en";
}

// src/main.ts
var DEFAULT_SETTINGS = {
  language: "auto",
  externalEnabled: true,
  externalFormat: "markdown",
  externalOpenMode: "open",
  automaticWiki: true,
  automaticYouTube: true,
  pasteYouTube: true,
  rules: { markdown: "link", image: "embed", pdf: "embed", video: "embed", audio: "embed", other: "link" },
  additionalEmbedExtensions: "",
  additionalLinkExtensions: ""
};
function resolvedLocale(settings) {
  return localeFromLanguage(settings.language === "auto" ? (0, import_obsidian2.getLanguage)() : settings.language);
}
function tr(settings, key, params = {}) {
  return TRANSLATIONS[resolvedLocale(settings)][key].replace(/\{(\w+)\}/g, (match, name) => Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match);
}
var EXTENSIONS = {
  markdown: ["md", "markdown"],
  image: ["png", "jpg", "jpeg", "gif", "webp", "svg", "avif", "bmp"],
  pdf: ["pdf"],
  video: ["mp4", "webm", "mov", "mkv", "ogv"],
  audio: ["mp3", "m4a", "ogg", "oga", "wav", "flac", "opus"]
};
function extensionList(value) {
  return new Set(value.split(/[\s,;]+/).map((x) => x.trim().replace(/^\./, "").toLowerCase()).filter(Boolean));
}
function linkBehavior(target, sourcePath, app, settings) {
  const rawPath = target.split("|", 1)[0].split("#", 1)[0].trim();
  const decodedPath = rawPath.replace(/\\([\\[\]#|])/g, "$1");
  let ext = /\.([a-zA-Z0-9]+)$/.exec(decodedPath)?.[1]?.toLowerCase();
  if (!ext) {
    const linkedFile = app.metadataCache.getFirstLinkpathDest(decodedPath, sourcePath);
    if (linkedFile) ext = linkedFile.extension.toLowerCase();
  }
  if (!ext) return settings.rules.other;
  if (extensionList(settings.additionalLinkExtensions).has(ext)) return "link";
  if (extensionList(settings.additionalEmbedExtensions).has(ext)) return "embed";
  for (const [category, extensions] of Object.entries(EXTENSIONS)) {
    if (extensions.includes(ext)) return settings.rules[category];
  }
  return settings.rules.other;
}
function youtubeEmbed(text) {
  let url;
  try {
    url = new URL(text.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.toLowerCase();
  const youtubeHost = ["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"].includes(host);
  const shortHost = ["youtu.be", "www.youtu.be"].includes(host);
  if (!youtubeHost && !shortHost) return null;
  const parts = url.pathname.split("/").filter(Boolean);
  let videoId = null;
  if (shortHost) videoId = parts[0] || null;
  else if (parts[0] === "watch") videoId = url.searchParams.get("v");
  else if (["shorts", "embed", "live", "v"].includes(parts[0])) videoId = parts[1] || null;
  if (!videoId || !/^[\w-]{11}$/.test(videoId)) return null;
  const normalized = new URL("https://www.youtube.com/watch");
  normalized.searchParams.set("v", videoId);
  const timestamp = url.searchParams.get("t") || url.searchParams.get("start");
  if (timestamp && /^[\dhms]+$/i.test(timestamp)) normalized.searchParams.set("t", timestamp);
  return `![](${normalized.toString()})`;
}
function inInlineCode(line, position) {
  let activeTicks = 0;
  for (let i = 0; i < position; ) {
    if (line[i] === "\\") {
      i += 2;
      continue;
    }
    if (line[i] !== "`") {
      i++;
      continue;
    }
    let end = i;
    while (end < line.length && line[end] === "`") end++;
    const ticks = end - i;
    if (!activeTicks) activeTicks = ticks;
    else if (activeTicks === ticks) activeTicks = 0;
    i = end;
  }
  return activeTicks !== 0;
}
function intersects(span, changed) {
  return !changed || span.from <= changed.to && span.to >= changed.from;
}
function transformText(text, sourcePath, app, settings, touched, only) {
  let changes = 0;
  let result = "";
  let pos = 0;
  let inFrontmatter = false;
  let inFence = null;
  let inComment = false;
  let index = 0;
  const lines = text.match(/[^\n]*\n|[^\n]+$/g) || [];
  for (const wholeLine of lines) {
    const ending = wholeLine.endsWith("\n") ? "\n" : "";
    const raw = ending ? wholeLine.slice(0, -1) : wholeLine;
    const line = raw.endsWith("\r") ? raw.slice(0, -1) : raw;
    const trailing = raw.endsWith("\r") ? "\r" + ending : ending;
    const trimmed = line.trim();
    let skip = false;
    if (index === 0 && (trimmed === "---" || trimmed === "+++")) {
      inFrontmatter = true;
      skip = true;
    } else if (inFrontmatter) {
      skip = true;
      if (trimmed === "---" || trimmed === "+++" || trimmed === "...") inFrontmatter = false;
    } else {
      const fence = /^ {0,3}(`{3,}|~{3,})/.exec(line);
      if (inFence) {
        skip = true;
        if (fence && fence[1][0] === inFence.marker && fence[1].length >= inFence.width && new RegExp(`^ {0,3}${inFence.marker === "`" ? "`" : "~"}{${inFence.width},}\\s*$`).test(line)) {
          inFence = null;
        }
      } else if (fence) {
        skip = true;
        inFence = { marker: fence[1][0], width: fence[1].length };
      }
    }
    if (!skip && (inComment || line.includes("<!--"))) {
      const start = inComment ? 0 : line.indexOf("<!--");
      const end = line.indexOf("-->", start + (inComment ? 0 : 4));
      if (start >= 0 && end < 0) inComment = true;
      if (end >= 0) inComment = false;
      skip = true;
    }
    if (skip) {
      result += wholeLine;
      pos += wholeLine.length;
      index++;
      continue;
    }
    let next = line;
    if (only !== "youtube" && settings.automaticWiki) {
      const wiki = /(!?)\[\[([^\]\r\n]+)\]\]/g;
      const edits = [];
      for (const match of line.matchAll(wiki)) {
        const start = match.index;
        const end = start + match[0].length;
        if (start > 0 && line[start - 1] === "\\" || inInlineCode(line, start) || !intersects({ from: pos + start, to: pos + end }, touched)) continue;
        if (match[2].startsWith("external:")) continue;
        const desired = linkBehavior(match[2], sourcePath, app, settings);
        if (match[1] === "!" && desired === "link") continue;
        const replacement = `${desired === "embed" ? "!" : ""}[[${match[2]}]]`;
        if (replacement !== match[0]) edits.push({ start, end, replacement });
      }
      for (const edit of edits.reverse()) {
        next = next.slice(0, edit.start) + edit.replacement + next.slice(edit.end);
        changes++;
      }
    }
    if (only !== "wiki" && settings.automaticYouTube && !next.includes("`")) {
      const standalone = /^(\s*)(<?https?:\/\/[^\s<>]+>?|\[[^\]\r\n]*\]\((https?:\/\/[^\s)]+)\))(\s*)$/.exec(next);
      if (standalone && intersects({ from: pos, to: pos + line.length }, touched)) {
        let candidate = standalone[3] || standalone[2];
        candidate = candidate.replace(/^</, "").replace(/>$/, "");
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
function diffExamples(before, after, settings, limit = 6) {
  const a = before.split("\n"), b = after.split("\n");
  const examples = [];
  for (let i = 0; i < Math.min(a.length, b.length) && examples.length < limit; i++) {
    if (a[i] === b[i]) continue;
    const clip = (s) => s.trim().slice(0, 100);
    examples.push(tr(settings, "lineExample", { line: i + 1, before: clip(a[i]), after: clip(b[i]) }));
  }
  return examples;
}
var ConfirmModal = class extends import_obsidian2.Modal {
  constructor(app, titleText, description, examples, settings, onConfirm) {
    super(app);
    this.titleText = titleText;
    this.description = description;
    this.examples = examples;
    this.settings = settings;
    this.onConfirm = onConfirm;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: this.titleText });
    contentEl.createEl("p", { text: this.description });
    if (this.examples.length) {
      const list = contentEl.createEl("ul");
      for (const example of this.examples.slice(0, 20)) list.createEl("li", { text: example });
      if (this.examples.length > 20) contentEl.createEl("p", { text: tr(this.settings, "moreExamples", { count: this.examples.length - 20 }) });
    }
    new import_obsidian2.Setting(contentEl).addButton((btn) => btn.setButtonText(tr(this.settings, "cancel")).onClick(() => this.close())).addButton((btn) => btn.setButtonText(tr(this.settings, "apply")).setCta().onClick(async () => {
      this.close();
      try {
        await this.onConfirm();
      } catch (err) {
        console.error("Linker: conversion failed", err);
        new import_obsidian2.Notice(tr(this.settings, "modalError"));
      }
    }));
  }
  onClose() {
    this.contentEl.empty();
  }
};
var LinkerPlugin = class extends import_obsidian2.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
    this.applying = /* @__PURE__ */ new WeakSet();
  }
  openEditor(file) {
    for (const leaf of this.app.workspace.getLeavesOfType("markdown")) {
      const view = leaf.view;
      if (view instanceof import_obsidian2.MarkdownView && view.file?.path === file.path) return view.editor;
    }
    return null;
  }
  async onload() {
    const saved = await this.loadData();
    this.settings = { ...DEFAULT_SETTINGS, ...saved, rules: { ...DEFAULT_SETTINGS.rules, ...saved?.rules } };
    this.addSettingTab(new LinkerSettingTab(this.app, this));
    const externalTranslate = (key, params = {}) => tr(this.settings, key, params);
    this.registerEditorExtension(getExternalEditorExtension(() => this.settings, externalTranslate));
    if (typeof document !== "undefined") {
      this.registerDomEvent(document, "click", (event) => {
        handleExternalAnchorClick(event, this.settings, externalTranslate);
      }, true);
    }
    this.addCommand({
      id: "insert-external-file-link",
      name: tr(this.settings, "externalInsertFile"),
      editorCallback: (editor) => {
        if (!this.settings.externalEnabled) return;
        new ExternalInsertModal(
          this.app,
          editor,
          "file",
          () => this.settings.externalFormat,
          externalTranslate
        ).open();
      }
    });
    this.addCommand({
      id: "insert-external-folder-link",
      name: tr(this.settings, "externalInsertFolder"),
      editorCallback: (editor) => {
        if (!this.settings.externalEnabled) return;
        new ExternalInsertModal(
          this.app,
          editor,
          "directory",
          () => this.settings.externalFormat,
          externalTranslate
        ).open();
      }
    });
    this.registerEditorExtension(import_view2.EditorView.updateListener.of((update) => {
      if (!update.docChanged || !(this.settings.automaticWiki || this.settings.automaticYouTube) || this.applying.has(update.view) || !update.view.hasFocus) return;
      const file = this.app.workspace.getActiveFile();
      if (!file || file.extension !== "md") return;
      const ranges = [];
      let promising = false;
      update.changes.iterChanges((_fromA, _toA, fromB, toB, inserted) => {
        const insertedText = inserted.toString();
        const changedLine = update.state.doc.lineAt(Math.min(fromB, update.state.doc.length)).text;
        const wikiNearby = this.settings.automaticWiki && changedLine.includes("[[") && changedLine.includes("]]");
        if (insertedText.length && (wikiNearby || /https?:\/\//.test(insertedText) || insertedText.includes("]("))) {
          ranges.push({ from: fromB, to: toB });
          promising = true;
        }
      });
      if (!promising) return;
      const originalDoc = update.state.doc;
      queueMicrotask(() => {
        const view = update.view;
        if (view.state.doc !== originalDoc || !view.hasFocus) return;
        const path2 = this.app.workspace.getActiveFile()?.path;
        if (path2 !== file.path) return;
        const input = view.state.doc.toString();
        let output = input;
        for (const range of ranges.sort((a, b) => b.from - a.from)) {
          if (ranges.length > 1) break;
          output = transformText(output, file.path, this.app, this.settings, range).text;
        }
        if (ranges.length > 1) {
          const envelope = { from: Math.min(...ranges.map((r) => r.from)), to: Math.max(...ranges.map((r) => r.to)) };
          output = transformText(input, file.path, this.app, this.settings, envelope).text;
        }
        if (output === input) return;
        let from = 0;
        while (from < input.length && from < output.length && input[from] === output[from]) from++;
        let oldEnd = input.length, newEnd = output.length;
        while (oldEnd > from && newEnd > from && input[oldEnd - 1] === output[newEnd - 1]) {
          oldEnd--;
          newEnd--;
        }
        this.applying.add(view);
        try {
          view.dispatch({ changes: { from, to: oldEnd, insert: output.slice(from, newEnd) } });
        } finally {
          this.applying.delete(view);
        }
      });
    }));
    this.registerEvent(this.app.workspace.on("editor-paste", (event, editor) => {
      if (event.defaultPrevented || !this.settings.automaticYouTube || !this.settings.pasteYouTube) return;
      const clipboard = event.clipboardData;
      if (!clipboard || clipboard.files.length > 0) return;
      const text = clipboard.getData("text/plain").trim();
      const embed = youtubeEmbed(text);
      if (!embed) return;
      const file = this.app.workspace.getActiveFile();
      if (!file || file.extension !== "md") return;
      const content = editor.getValue();
      const cursor = editor.getCursor("from");
      const endCursor = editor.getCursor("to");
      const offsetOf = (line, ch) => content.split("\n").slice(0, line).reduce((n, l) => n + l.length + 1, 0) + ch;
      const offset = offsetOf(cursor.line, cursor.ch);
      const endOffset = offsetOf(endCursor.line, endCursor.ch);
      const sentinel = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
      const probe = content.slice(0, offset) + sentinel + content.slice(endOffset);
      const protectedResult = transformText(
        probe,
        file.path,
        this.app,
        { ...this.settings, automaticWiki: false },
        { from: offset, to: offset + sentinel.length },
        "youtube"
      );
      if (protectedResult.text === probe) return;
      event.preventDefault();
      editor.replaceSelection(embed);
    }));
    this.addCommand({
      id: "convert-current-note",
      name: tr(this.settings, "currentCommand"),
      editorCallback: (editor, view) => {
        const file = view.file;
        if (!file) return;
        const preview = transformText(editor.getValue(), file.path, this.app, this.settings);
        if (!preview.changes) {
          new import_obsidian2.Notice(tr(this.settings, "noChanges"));
          return;
        }
        new ConfirmModal(
          this.app,
          tr(this.settings, "currentTitle"),
          tr(this.settings, "currentDescription", { count: preview.changes }),
          diffExamples(editor.getValue(), preview.text, this.settings),
          this.settings,
          async () => {
            const fresh = transformText(editor.getValue(), file.path, this.app, this.settings);
            if (fresh.changes) {
              const previous = editor.getCursor();
              editor.setValue(fresh.text);
              editor.setCursor(previous);
              new import_obsidian2.Notice(tr(this.settings, "applied", { count: fresh.changes }));
            }
          }
        ).open();
      }
    });
    this.addCommand({
      id: "convert-entire-vault",
      name: tr(this.settings, "vaultCommand"),
      callback: async () => {
        const files = this.app.vault.getMarkdownFiles();
        const plans = [];
        for (const file of files) {
          const text = this.openEditor(file)?.getValue() ?? await this.app.vault.cachedRead(file);
          const { changes, text: updated } = transformText(text, file.path, this.app, this.settings);
          if (changes) plans.push({ file, count: changes, example: diffExamples(text, updated, this.settings, 1)[0] || "" });
        }
        const total = plans.reduce((n, p) => n + p.count, 0);
        if (!total) {
          new import_obsidian2.Notice(tr(this.settings, "noChanges"));
          return;
        }
        new ConfirmModal(
          this.app,
          tr(this.settings, "vaultTitle"),
          tr(this.settings, "vaultDescription", { count: total, files: plans.length }),
          plans.map((p) => `${p.file.path} \u2014 ${p.count}; ${p.example}`),
          this.settings,
          async () => {
            let changed = 0, errors = 0;
            for (const { file } of plans) {
              try {
                const editor = this.openEditor(file);
                if (editor) {
                  const current = transformText(editor.getValue(), file.path, this.app, this.settings);
                  if (current.changes) {
                    editor.setValue(current.text);
                    changed += current.changes;
                  }
                } else {
                  let fileChanges = 0;
                  await this.app.vault.process(file, (data) => {
                    const outcome = transformText(data, file.path, this.app, this.settings);
                    fileChanges = outcome.changes;
                    return outcome.text;
                  });
                  changed += fileChanges;
                }
              } catch (e) {
                errors++;
                console.error("Linker: failed on", file.path, e);
              }
            }
            new import_obsidian2.Notice(tr(this.settings, "vaultApplied", { count: changed, errors: errors ? tr(this.settings, "vaultErrors", { count: errors }) : "" }), 8e3);
          }
        ).open();
      }
    });
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
var LinkerSettingTab = class extends import_obsidian2.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.activeSection = "general";
  }
  display() {
    const { containerEl } = this;
    const t = (key) => tr(this.plugin.settings, key);
    containerEl.empty();
    containerEl.createEl("h2", { text: "Linker" });
    new import_obsidian2.Setting(containerEl).addButton((btn) => {
      btn.setButtonText(t("tabGeneral"));
      if (this.activeSection === "general") btn.setCta();
      btn.onClick(() => {
        this.activeSection = "general";
        this.display();
      });
    }).addButton((btn) => {
      btn.setButtonText(t("tabExternal"));
      if (this.activeSection === "external") btn.setCta();
      btn.onClick(() => {
        this.activeSection = "external";
        this.display();
      });
    });
    if (this.activeSection === "external") {
      new import_obsidian2.Setting(containerEl).setName(t("externalEnabled")).setDesc(t("externalEnabledDesc")).addToggle((toggle) => toggle.setValue(this.plugin.settings.externalEnabled).onChange(async (value) => {
        this.plugin.settings.externalEnabled = value;
        await this.plugin.saveSettings();
      }));
      new import_obsidian2.Setting(containerEl).setName(t("externalFormat")).setDesc(t("externalFormatDesc")).addDropdown((dropdown) => dropdown.addOptions({
        markdown: t("externalMarkdown"),
        wiki: t("externalWiki")
      }).setValue(this.plugin.settings.externalFormat).onChange(async (value) => {
        this.plugin.settings.externalFormat = value;
        await this.plugin.saveSettings();
      }));
      new import_obsidian2.Setting(containerEl).setName(t("externalOpenMode")).setDesc(t("externalOpenModeDesc")).addDropdown((dropdown) => dropdown.addOptions({
        open: t("externalModeOpen"),
        reveal: t("externalModeReveal")
      }).setValue(this.plugin.settings.externalOpenMode).onChange(async (value) => {
        this.plugin.settings.externalOpenMode = value;
        await this.plugin.saveSettings();
      }));
      containerEl.createEl("p", { text: t("externalSettingsHint") });
      return;
    }
    new import_obsidian2.Setting(containerEl).setName(t("language")).setDesc(t("languageDesc")).addDropdown((d) => d.addOptions({
      auto: t("languageAuto"),
      en: t("languageEnglish"),
      ru: t("languageRussian"),
      es: t("languageSpanish"),
      "zh-CN": t("languageChinese")
    }).setValue(this.plugin.settings.language).onChange(async (value) => {
      if (!["auto", "en", "ru", "es", "zh-CN"].includes(value)) return;
      this.plugin.settings.language = value;
      await this.plugin.saveSettings();
      this.display();
      new import_obsidian2.Notice(tr(this.plugin.settings, "languageChanged"));
    }));
    new import_obsidian2.Setting(containerEl).setName(t("automaticWiki")).setDesc(t("automaticWikiDesc")).addToggle((toggle) => toggle.setValue(this.plugin.settings.automaticWiki).onChange(async (value) => {
      this.plugin.settings.automaticWiki = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian2.Setting(containerEl).setName(t("automaticYouTube")).setDesc(t("automaticYouTubeDesc")).addToggle((toggle) => toggle.setValue(this.plugin.settings.automaticYouTube).onChange(async (value) => {
      this.plugin.settings.automaticYouTube = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian2.Setting(containerEl).setName(t("pasteYouTube")).setDesc(t("pasteYouTubeDesc")).addToggle((toggle) => toggle.setValue(this.plugin.settings.pasteYouTube).onChange(async (value) => {
      this.plugin.settings.pasteYouTube = value;
      await this.plugin.saveSettings();
    }));
    containerEl.createEl("h3", { text: t("fileRules") });
    const labels = [
      { cat: "markdown", name: "markdown", desc: ".md, .markdown" },
      { cat: "image", name: "image", desc: EXTENSIONS.image.join(", ") },
      { cat: "pdf", name: "pdf", desc: ".pdf" },
      { cat: "video", name: "video", desc: EXTENSIONS.video.join(", ") },
      { cat: "audio", name: "audio", desc: EXTENSIONS.audio.join(", ") },
      { cat: "other", name: "other", desc: t("otherDesc") }
    ];
    for (const { cat, name, desc } of labels) {
      new import_obsidian2.Setting(containerEl).setName(t(name)).setDesc(desc).addDropdown((d) => d.addOptions({ link: t("link"), embed: t("embed") }).setValue(this.plugin.settings.rules[cat]).onChange(async (value) => {
        this.plugin.settings.rules[cat] = value;
        await this.plugin.saveSettings();
      }));
    }
    containerEl.createEl("h3", { text: t("extraExtensions") });
    new import_obsidian2.Setting(containerEl).setName(t("alwaysEmbed")).setDesc(t("alwaysEmbedDesc")).addText((field) => field.setPlaceholder("epub, tif").setValue(this.plugin.settings.additionalEmbedExtensions).onChange(async (value) => {
      this.plugin.settings.additionalEmbedExtensions = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian2.Setting(containerEl).setName(t("alwaysLink")).setDesc(t("alwaysLinkDesc")).addText((field) => field.setPlaceholder("zip, exe").setValue(this.plugin.settings.additionalLinkExtensions).onChange(async (value) => {
      this.plugin.settings.additionalLinkExtensions = value;
      await this.plugin.saveSettings();
    }));
    containerEl.createEl("p", { text: t("existingLinksHint") });
  }
};
var __test = { transformText, youtubeEmbed, inInlineCode, resolvedLocale, localeFromLanguage, tr, createExternalLink, resolveExternalTarget, isExecutablePath, readExternalLinkFromWiki, openExternalTarget };
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  __test
});
