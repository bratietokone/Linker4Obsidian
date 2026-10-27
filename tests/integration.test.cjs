'use strict';
const assert = require('node:assert/strict');
const Module = require('node:module');
const mockEvents = {};
const commands = {};
let uiLanguage = 'ru';
let storedData = null;
let settingTab;
let updateCallback;
const renderedSettings = [];
class MockControl {
  setValue(value) { this.value = value; return this; }
  setDisabled(disabled) { this.disabled = disabled; return this; }
  onChange(callback) { this.change = callback; return this; }
  onClick(callback) { this.click = callback; return this; }
  addOptions() { return this; }
  setPlaceholder() { return this; }
  setButtonText() { return this; }
  setCta() { return this; }
}
class MockSetting {
  constructor() { renderedSettings.push(this); }
  setName(name) { this.name = name; return this; }
  setDesc() { return this; }
  setHeading() { return this; }
  addToggle(fn) { this.control = new MockControl(); fn(this.control); return this; }
  addDropdown(fn) { this.control = new MockControl(); fn(this.control); return this; }
  addText(fn) { this.control = new MockControl(); fn(this.control); return this; }
  addButton(fn) { this.control = new MockControl(); fn(this.control); return this; }
}

class MockPlugin {
  async loadData() { return storedData; }
  async saveData(data) { storedData = data; }
  addSettingTab(tab) { settingTab = tab; }
  registerEditorExtension(handler) { if (typeof handler === 'function') updateCallback = handler; }
  registerDomEvent() {}
  registerEvent() {}
  addCommand(command) { commands[command.id] = command; }
}
class MockMarkdownView {}
class MockSettingTab {
  constructor() {
    this.containerEl = {
      empty() { renderedSettings.length = 0; },
      createEl() { return {}; }
    };
  }
}
class MockCM { static updateListener = { of(callback) { return callback; } }; }
const orig = Module._load;
Module._load = function(request, parent, main) {
  if (request === 'obsidian') return { Plugin: MockPlugin, MarkdownView: MockMarkdownView, PluginSettingTab: MockSettingTab,
    Modal: class {}, Notice: class {}, Setting: MockSetting, App: class {}, Editor: class {}, TFile: class {}, getLanguage: () => uiLanguage };
  if (request === '@codemirror/view') return { EditorView: MockCM, ViewPlugin: {fromClass: () => ({external: true})}, WidgetType: class {}, Decoration: {none: [], replace: () => ({range:()=>({})}), set:()=>[]} };
  return orig.call(this, request, parent, main);
};
const { default: Linker } = require('../main.js');
Module._load = orig;

const activeFile = { path: 'test.md', extension: 'md' };
const app = {
  metadataCache: { getFirstLinkpathDest() { return null; } },
  workspace: {
    getActiveFile: () => activeFile,
    getLeavesOfType: () => [],
    on: (event, listener) => { mockEvents[event] = listener; return {event}; }
  },
  vault: { getMarkdownFiles: () => [] }
};

(async () => {
  const plugin = new Linker();
  plugin.app = app;
  await plugin.onload();
  assert.equal(typeof updateCallback, 'function');
  assert.equal(typeof mockEvents['editor-paste'], 'function');
  assert.equal(typeof commands['convert-current-note'].editorCallback, 'function');
  assert.equal(typeof commands['convert-entire-vault'].callback, 'function');
  assert.equal(typeof commands['insert-external-file-link'].editorCallback, 'function');
  assert.equal(typeof commands['insert-external-folder-link'].editorCallback, 'function');
  assert.equal(plugin.settings.language, 'auto');
  assert.equal(plugin.settings.externalFormat, 'markdown');
  assert.equal(plugin.settings.externalEnabled, true);
  assert.match(commands['convert-current-note'].name, /Предпросмотр/);
  assert.equal(typeof settingTab.display, 'function');

  // The nested automatic-YouTube switch follows the master switch without
  // clearing the previously saved automatic preference.
  settingTab.display();
  const youtubeMaster = renderedSettings.find(setting => setting.name === 'Включить поддержку YouTube')?.control;
  const youtubeAuto = renderedSettings.find(setting => setting.name === '↳ Автоматически встраивать при вставке и вводе')?.control;
  assert.ok(youtubeMaster && youtubeAuto);
  assert.equal(youtubeAuto.disabled, false);
  await youtubeMaster.change(false);
  assert.equal(plugin.settings.automaticYouTube, false);
  assert.equal(youtubeAuto.disabled, true);
  assert.equal(plugin.settings.pasteYouTube, true);
  await youtubeMaster.change(true);
  assert.equal(plugin.settings.automaticYouTube, true);
  assert.equal(youtubeAuto.disabled, false);

  // Simulate picking a file from Obsidian's [[autocomplete]]. In this case
  // autocomplete inserts only the filename; the closing ]] already exists.
  const doc = {
    length: '[[photo.png]]'.length,
    toString: () => '[[photo.png]]',
    lineAt: () => ({ text: '[[photo.png]]' })
  };
  let patch = null;
  const view = { hasFocus: true, state: {doc}, dispatch: changes => {patch = changes.changes;} };
  updateCallback({docChanged: true, view, state: {doc}, changes: {
    iterChanges(callback) { callback(2, 2, 2, 11, {toString:()=> 'photo.png'}); }
  }});
  await Promise.resolve();
  assert.deepEqual(patch, {from:0,to:0,insert:'!'});

  // Paste an entire valid YouTube URL into a blank Markdown note.
  let pasted = null, prevented = false;
  const editor = {getValue:()=>'',getCursor:()=>({line:0,ch:0}), replaceSelection:x=>{pasted=x;}};
  mockEvents['editor-paste']({
    defaultPrevented:false, preventDefault(){prevented=true;},
    clipboardData:{files:[],getData:()=> 'https://youtu.be/dQw4w9WgXcQ'}
  },editor);
  assert.equal(prevented, true);
  assert.equal(pasted, '![](https://www.youtube.com/watch?v=dQw4w9WgXcQ)');

  // Replacing selected text on its own line should still embed the video.
  pasted = null;
  mockEvents['editor-paste']({
    defaultPrevented:false, preventDefault(){},
    clipboardData:{files:[],getData:()=> 'https://youtu.be/dQw4w9WgXcQ'}
  }, { getValue:()=> 'selected', getCursor:(which)=>({line:0,ch:which==='to'?8:0}), replaceSelection:x=>{pasted=x;} });
  assert.equal(pasted, '![](https://www.youtube.com/watch?v=dQw4w9WgXcQ)');

  // No interception if user is editing a code block.
  let protectedPaste = false;
  mockEvents['editor-paste']({
    defaultPrevented:false, preventDefault(){protectedPaste=true;},
    clipboardData:{files:[],getData:()=> 'https://youtu.be/dQw4w9WgXcQ'}
  },{
    getValue:()=> '```\n\n```', getCursor:()=>({line:1,ch:0}), replaceSelection:()=>{throw new Error('Should not insert')}
  });
  assert.equal(protectedPaste, false);

  // Editor update listener and the explicit paste handler must both respect
  // the nested "automatic on paste and typing" preference.
  const url = 'https://youtu.be/dQw4w9WgXcQ';
  const expectedEmbed = '![](https://www.youtube.com/watch?v=dQw4w9WgXcQ)';
  async function simulateEditorTyping(text) {
    const doc = {
      length: text.length,
      toString: () => text,
      lineAt: () => ({text})
    };
    let patch = null;
    const view = { hasFocus: true, state: {doc}, dispatch: transaction => { patch = transaction.changes; } };
    updateCallback({docChanged:true, view, state:{doc}, changes:{
      iterChanges(callback) { callback(0, 0, 0, text.length, {toString:() => text}); }
    }});
    await Promise.resolve();
    return patch ? text.slice(0, patch.from) + patch.insert + text.slice(patch.to) : text;
  }

  assert.equal(await simulateEditorTyping(url), expectedEmbed);
  plugin.settings.pasteYouTube = false;
  assert.equal(await simulateEditorTyping(url), url);
  // Automatic Wiki attachment rules must continue to work independently.
  assert.equal(await simulateEditorTyping('[[photo.png]]'), '![[photo.png]]');
  // Explicit preview-and-convert commands retain YouTube conversion.
  const manual = require('../main.js').__test.transformText(url, activeFile.path, app, plugin.settings);
  assert.equal(manual.text, expectedEmbed);

  let interception = false, inserted = false;
  mockEvents['editor-paste']({
    defaultPrevented:false, preventDefault(){interception=true;},
    clipboardData:{files:[],getData:()=>url}
  }, {replaceSelection(){inserted=true;}});
  assert.equal(interception,false);
  assert.equal(inserted,false);

  plugin.settings.pasteYouTube = true;
  plugin.settings.automaticYouTube = false;
  assert.equal(await simulateEditorTyping(url),url);
  assert.equal(require('../main.js').__test.transformText(url, activeFile.path, app, plugin.settings).text,url);
  plugin.settings.automaticWiki = false;
  assert.equal(await simulateEditorTyping('[[photo.png]]'),'[[photo.png]]');
  plugin.settings.automaticWiki = true;
  plugin.settings.automaticYouTube = true;
  assert.equal(await simulateEditorTyping(url),expectedEmbed);
  plugin.settings.pasteYouTube = false;
  await plugin.saveSettings();
  assert.equal(storedData.pasteYouTube,false);
  // Existing settings are preserved by reload, no migration required.
  const persistedPlugin = new Linker();
  persistedPlugin.app = app;
  await persistedPlugin.onload();
  assert.equal(persistedPlugin.settings.automaticYouTube,true);
  assert.equal(persistedPlugin.settings.pasteYouTube,false);

  // Explicit language override persists for the next plugin load.
  storedData = {language:'en'};
  const enPlugin = new Linker();
  enPlugin.app = app;
  await enPlugin.onload();
  assert.match(commands['convert-current-note'].name, /Preview/);
  assert.equal(enPlugin.settings.language, 'en');
  uiLanguage = 'en';
  storedData = {language:'ru'};
  const ruPlugin = new Linker();
  ruPlugin.app = app;
  await ruPlugin.onload();
  assert.match(commands['convert-entire-vault'].name, /Предпросмотр/);
  // New language preferences persist across plugin loads and affect commands.
  storedData = { language: 'es' };
  const esPlugin = new Linker();
  esPlugin.app = app;
  await esPlugin.onload();
  assert.match(commands['convert-current-note'].name, /Vista previa/);
  storedData = { language: 'zh-CN' };
  const zhPlugin = new Linker();
  zhPlugin.app = app;
  await zhPlugin.onload();
  assert.match(commands['convert-entire-vault'].name, /预览/);
  console.log('YouTube toggle, live-typing and 15+ integration smoke checks passed.');
})().catch(err=>{console.error(err);process.exitCode=1;});
