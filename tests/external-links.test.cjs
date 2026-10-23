'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const Module = require('node:module');
const originalLoad = Module._load;
const called = { open: [], reveal: [], notices: [] };
const electron = {
  shell: {
    openPath: async file => { called.open.push(file); return ''; },
    showItemInFolder: file => { called.reveal.push(file); }
  }
};
Module._load = function(request, parent, isMain) {
  if (request === 'obsidian') {
    return {
      App: class {}, Editor: class {}, MarkdownView: class {}, Modal: class {},
      Notice: class { constructor(text) { called.notices.push(text); } },
      Plugin: class {}, PluginSettingTab: class {}, Setting: class {},
      TFile: class {}, getLanguage: () => 'en'
    };
  }
  if (request === '@codemirror/view') {
    return { EditorView: class {}, WidgetType: class {},
      ViewPlugin: {fromClass: () => ({})}, Decoration: {none: [], set:()=>[]} };
  }
  if (request === 'electron') return electron;
  return originalLoad.call(this, request, parent, isMain);
};
const {__test} = require('../main.js');
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'linker4obsidian-test-'));
const file = path.join(base, 'report file.pdf');
const executable = path.join(base, 'script.sh');
const executableNoExt = path.join(base, 'program');
fs.writeFileSync(file, 'dummy content');
fs.writeFileSync(executable, '#!/bin/sh\nexit 0\n', {mode:0o755});
fs.writeFileSync(executableNoExt, '#!/bin/sh\nexit 0\n', {mode:0o755});
const t = (key, params={}) => key + (params.path || '');

(async () => {
  const fileLink = __test.createExternalLink(file, 'Report', 'markdown');
  assert.match(fileLink, /^\\[Report\\]\\(<file:\/\/\//);
  await __test.openExternalTarget(__test.createExternalLink(file, '', 'wiki')
    .match(/\[\[(.+?)\|/)[1], 'open', t);
  assert.deepEqual(called.open, [file]);

  await __test.openExternalTarget('external:' + base, 'open', t);
  assert.deepEqual(called.open, [file, base]);

  await __test.openExternalTarget('external:' + file, 'reveal', t);
  assert.deepEqual(called.reveal, [file]);

  // Shell must never execute a runnable file, even if clicked deliberately.
  await __test.openExternalTarget('external:' + executable, 'open', t);
  await __test.openExternalTarget('external:' + executableNoExt, 'open', t);
  assert.deepEqual(called.reveal, [file, executable, executableNoExt]);
  assert.deepEqual(called.open, [file, base]);

  await __test.openExternalTarget('external:' + path.join(base, 'missing.pdf'), 'open', t);
  await __test.openExternalTarget('https://example.com/test.pdf', 'open', t);
  assert.equal(called.notices.length, 2);
  assert.deepEqual(called.open, [file, base]);

  console.log('9 external file opening checks passed.');
})().catch(error => { console.error(error); process.exitCode = 1; })
  .finally(() => {
    Module._load = originalLoad;
    fs.rmSync(base, {recursive: true, force: true});
  });
