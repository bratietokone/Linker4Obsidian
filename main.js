"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  __test: () => __test,
  default: () => Linker4ObsidianPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var import_view = require("@codemirror/view");

// src/locales/en.ts
var EN = {
  language: "Interface language",
  languageDesc: "Choose the language for Linker4Obsidian independently of Obsidian.",
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
  noChanges: "Linker4Obsidian: no changes needed.",
  applied: "Linker4Obsidian: applied {count} changes.",
  vaultApplied: "Linker4Obsidian: converted {count} links.{errors}",
  vaultErrors: " Errors: {count}.",
  modalError: "Linker4Obsidian: conversion failed. Check the developer console.",
  lineExample: "Line {line}: {before} \u2192 {after}",
  moreExamples: "...and {count} more",
  cancel: "Cancel",
  apply: "Apply"
};

// src/locales/ru.ts
var RU = {
  language: "\u042F\u0437\u044B\u043A \u0438\u043D\u0442\u0435\u0440\u0444\u0435\u0439\u0441\u0430",
  languageDesc: "\u042F\u0437\u044B\u043A Linker4Obsidian \u043C\u043E\u0436\u043D\u043E \u0432\u044B\u0431\u0440\u0430\u0442\u044C \u043D\u0435\u0437\u0430\u0432\u0438\u0441\u0438\u043C\u043E \u043E\u0442 \u044F\u0437\u044B\u043A\u0430 Obsidian.",
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
  noChanges: "Linker4Obsidian: \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0439 \u043D\u0435 \u0442\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044F.",
  applied: "Linker4Obsidian: \u043F\u0440\u0438\u043C\u0435\u043D\u0435\u043D\u043E {count} \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0439.",
  vaultApplied: "Linker4Obsidian: \u043F\u0440\u0435\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u043E {count} \u0441\u0441\u044B\u043B\u043E\u043A.{errors}",
  vaultErrors: " \u041E\u0448\u0438\u0431\u043E\u043A: {count}.",
  modalError: "Linker4Obsidian: \u043E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0435\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u044F. \u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u043A\u043E\u043D\u0441\u043E\u043B\u044C.",
  lineExample: "\u0421\u0442\u0440\u043E\u043A\u0430 {line}: {before} \u2192 {after}",
  moreExamples: "...\u0438 \u0435\u0449\u0451 {count}",
  cancel: "\u041E\u0442\u043C\u0435\u043D\u0430",
  apply: "\u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C"
};

// src/locales/es.ts
var ES = {
  language: "Idioma de la interfaz",
  languageDesc: "Elige el idioma de Linker4Obsidian independientemente del idioma de Obsidian.",
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
  noChanges: "Linker4Obsidian: no es necesario hacer cambios.",
  applied: "Linker4Obsidian: se aplicaron {count} cambios.",
  vaultApplied: "Linker4Obsidian: se convirtieron {count} enlaces.{errors}",
  vaultErrors: " Errores: {count}.",
  modalError: "Linker4Obsidian: error durante la conversi\xF3n. Consulta la consola de desarrollo.",
  lineExample: "L\xEDnea {line}: {before} \u2192 {after}",
  moreExamples: "...y {count} m\xE1s",
  cancel: "Cancelar",
  apply: "Aplicar"
};

// src/locales/zh-CN.ts
var ZH_CN = {
  language: "\u754C\u9762\u8BED\u8A00",
  languageDesc: "\u5355\u72EC\u8BBE\u7F6E Linker4Obsidian \u7684\u754C\u9762\u8BED\u8A00\uFF0C\u4E0D\u53D7 Obsidian \u8BED\u8A00\u8BBE\u7F6E\u9650\u5236\u3002",
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
  noChanges: "Linker4Obsidian\uFF1A\u65E0\u9700\u4FEE\u6539\u3002",
  applied: "Linker4Obsidian\uFF1A\u5DF2\u5E94\u7528 {count} \u5904\u4FEE\u6539\u3002",
  vaultApplied: "Linker4Obsidian\uFF1A\u5DF2\u8F6C\u6362 {count} \u4E2A\u94FE\u63A5\u3002{errors}",
  vaultErrors: " \u9519\u8BEF\uFF1A{count} \u4E2A\u3002",
  modalError: "Linker4Obsidian\uFF1A\u8F6C\u6362\u5931\u8D25\uFF0C\u8BF7\u67E5\u770B\u5F00\u53D1\u8005\u63A7\u5236\u53F0\u3002",
  lineExample: "\u7B2C {line} \u884C\uFF1A{before} \u2192 {after}",
  moreExamples: "\u2026\u2026\u4EE5\u53CA\u5176\u4ED6 {count} \u5904",
  cancel: "\u53D6\u6D88",
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
  automaticWiki: true,
  automaticYouTube: true,
  pasteYouTube: true,
  rules: { markdown: "link", image: "embed", pdf: "embed", video: "embed", audio: "embed", other: "link" },
  additionalEmbedExtensions: "",
  additionalLinkExtensions: ""
};
function resolvedLocale(settings) {
  return localeFromLanguage(settings.language === "auto" ? (0, import_obsidian.getLanguage)() : settings.language);
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
var ConfirmModal = class extends import_obsidian.Modal {
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
    new import_obsidian.Setting(contentEl).addButton((btn) => btn.setButtonText(tr(this.settings, "cancel")).onClick(() => this.close())).addButton((btn) => btn.setButtonText(tr(this.settings, "apply")).setCta().onClick(async () => {
      this.close();
      try {
        await this.onConfirm();
      } catch (err) {
        console.error("Linker4Obsidian: conversion failed", err);
        new import_obsidian.Notice(tr(this.settings, "modalError"));
      }
    }));
  }
  onClose() {
    this.contentEl.empty();
  }
};
var Linker4ObsidianPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
    this.applying = /* @__PURE__ */ new WeakSet();
  }
  openEditor(file) {
    for (const leaf of this.app.workspace.getLeavesOfType("markdown")) {
      const view = leaf.view;
      if (view instanceof import_obsidian.MarkdownView && view.file?.path === file.path) return view.editor;
    }
    return null;
  }
  async onload() {
    const saved = await this.loadData();
    this.settings = { ...DEFAULT_SETTINGS, ...saved, rules: { ...DEFAULT_SETTINGS.rules, ...saved?.rules } };
    this.addSettingTab(new LinkerSettingTab(this.app, this));
    this.registerEditorExtension(import_view.EditorView.updateListener.of((update) => {
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
        const path = this.app.workspace.getActiveFile()?.path;
        if (path !== file.path) return;
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
          new import_obsidian.Notice(tr(this.settings, "noChanges"));
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
              new import_obsidian.Notice(tr(this.settings, "applied", { count: fresh.changes }));
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
          new import_obsidian.Notice(tr(this.settings, "noChanges"));
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
                console.error("Linker4Obsidian: failed on", file.path, e);
              }
            }
            new import_obsidian.Notice(tr(this.settings, "vaultApplied", { count: changed, errors: errors ? tr(this.settings, "vaultErrors", { count: errors }) : "" }), 8e3);
          }
        ).open();
      }
    });
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
var LinkerSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    const t = (key) => tr(this.plugin.settings, key);
    containerEl.empty();
    containerEl.createEl("h2", { text: "Linker4Obsidian" });
    new import_obsidian.Setting(containerEl).setName(t("language")).setDesc(t("languageDesc")).addDropdown((d) => d.addOptions({
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
      new import_obsidian.Notice(tr(this.plugin.settings, "languageChanged"));
    }));
    new import_obsidian.Setting(containerEl).setName(t("automaticWiki")).setDesc(t("automaticWikiDesc")).addToggle((toggle) => toggle.setValue(this.plugin.settings.automaticWiki).onChange(async (value) => {
      this.plugin.settings.automaticWiki = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName(t("automaticYouTube")).setDesc(t("automaticYouTubeDesc")).addToggle((toggle) => toggle.setValue(this.plugin.settings.automaticYouTube).onChange(async (value) => {
      this.plugin.settings.automaticYouTube = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName(t("pasteYouTube")).setDesc(t("pasteYouTubeDesc")).addToggle((toggle) => toggle.setValue(this.plugin.settings.pasteYouTube).onChange(async (value) => {
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
      new import_obsidian.Setting(containerEl).setName(t(name)).setDesc(desc).addDropdown((d) => d.addOptions({ link: t("link"), embed: t("embed") }).setValue(this.plugin.settings.rules[cat]).onChange(async (value) => {
        this.plugin.settings.rules[cat] = value;
        await this.plugin.saveSettings();
      }));
    }
    containerEl.createEl("h3", { text: t("extraExtensions") });
    new import_obsidian.Setting(containerEl).setName(t("alwaysEmbed")).setDesc(t("alwaysEmbedDesc")).addText((field) => field.setPlaceholder("epub, tif").setValue(this.plugin.settings.additionalEmbedExtensions).onChange(async (value) => {
      this.plugin.settings.additionalEmbedExtensions = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName(t("alwaysLink")).setDesc(t("alwaysLinkDesc")).addText((field) => field.setPlaceholder("zip, exe").setValue(this.plugin.settings.additionalLinkExtensions).onChange(async (value) => {
      this.plugin.settings.additionalLinkExtensions = value;
      await this.plugin.saveSettings();
    }));
    containerEl.createEl("p", { text: t("existingLinksHint") });
  }
};
var __test = { transformText, youtubeEmbed, inInlineCode, resolvedLocale, localeFromLanguage, tr };
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  __test
});
