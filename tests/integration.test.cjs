'use strict';
const assert = require('node:assert/strict');
const Module = require('node:module');
const mockEvents = {};
const commands = {};
let uiLanguage = 'ru';
let storedData = null;
let settingTab;
let updateCallback;
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
class MockSettingTab {}
class MockCM { static updateListener = { of(callback) { return callback; } }; }
const orig = Module._load;
Module._load = function(request, parent, main) {
  if (request === 'obsidian') return { Plugin: MockPlugin, MarkdownView: MockMarkdownView, PluginSettingTab: MockSettingTab,
    Modal: class {}, Notice: class {}, Setting: class {}, App: class {}, Editor: class {}, TFile: class {}, getLanguage: () => uiLanguage };
  if (request === '@codemirror/view') return { EditorView: MockCM, ViewPlugin: {fromClass: () => ({external: true})}, WidgetType: class {}, Decoration: {none: [], replace: () => ({range:()=>({})}), set:()=>[]} };
  return orig.call(this, request, parent, main);
};
const { default: Linker4 } = require('../main.js');
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
  const plugin = new Linker4();
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
  // Explicit language override persists for the next plugin load.
  storedData = {language:'en'};
  const enPlugin = new Linker4();
  enPlugin.app = app;
  await enPlugin.onload();
  assert.match(commands['convert-current-note'].name, /Preview/);
  assert.equal(enPlugin.settings.language, 'en');
  uiLanguage = 'en';
  storedData = {language:'ru'};
  const ruPlugin = new Linker4();
  ruPlugin.app = app;
  await ruPlugin.onload();
  assert.match(commands['convert-entire-vault'].name, /Предпросмотр/);
  // New language preferences persist across plugin loads and affect commands.
  storedData = { language: 'es' };
  const esPlugin = new Linker4();
  esPlugin.app = app;
  await esPlugin.onload();
  assert.match(commands['convert-current-note'].name, /Vista previa/);
  storedData = { language: 'zh-CN' };
  const zhPlugin = new Linker4();
  zhPlugin.app = app;
  await zhPlugin.onload();
  assert.match(commands['convert-entire-vault'].name, /预览/);
  console.log('15 integration smoke tests passed.');
})().catch(err=>{console.error(err);process.exitCode=1;});
