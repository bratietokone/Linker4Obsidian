'use strict';
const assert = require('node:assert/strict');
const Module = require('node:module');
const mockEvents = {};
const commands = {};
let updateCallback;
class MockPlugin {
  async loadData() { return null; }
  addSettingTab() {}
  registerEditorExtension(handler) { updateCallback = handler; }
  registerEvent() {}
  addCommand(command) { commands[command.id] = command; }
}
class MockMarkdownView {}
class MockSettingTab {}
class MockCM { static updateListener = { of(callback) { return callback; } }; }
const orig = Module._load;
Module._load = function(request, parent, main) {
  if (request === 'obsidian') return { Plugin: MockPlugin, MarkdownView: MockMarkdownView, PluginSettingTab: MockSettingTab,
    Modal: class {}, Notice: class {}, Setting: class {}, App: class {}, Editor: class {}, TFile: class {} };
  if (request === '@codemirror/view') return { EditorView: MockCM };
  return orig.call(this, request, parent, main);
};
const { default: SmartEmbed } = require('../main.js');
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
  const plugin = new SmartEmbed();
  plugin.app = app;
  await plugin.onload();
  assert.equal(typeof updateCallback, 'function');
  assert.equal(typeof mockEvents['editor-paste'], 'function');
  assert.equal(typeof commands['convert-current-note'].editorCallback, 'function');
  assert.equal(typeof commands['convert-entire-vault'].callback, 'function');

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
  console.log('5 integration smoke tests passed.');
})().catch(err=>{console.error(err);process.exitCode=1;});
