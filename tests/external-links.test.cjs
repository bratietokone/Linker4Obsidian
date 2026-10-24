'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const Module = require('node:module');
const originalLoad = Module._load;
const called = { open: [], reveal: [], notices: [] };
let externalWidgetClass = null;
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
      ViewPlugin: {fromClass: (cls) => { externalWidgetClass = cls; return {external:true}; }}, Decoration: {none: [], replace: (options) => ({range:(from,to)=>({from,to,widget:options.widget})}), set:(decorations)=>decorations} };
  }
  if (request === 'electron') return electron;
  return originalLoad.call(this, request, parent, isMain);
};
const {__test} = require('../main.js');
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'linker4obsidian-test-'));
const file = path.join(base, 'report file.pdf');
const executable = path.join(base, 'script.sh');
const executableNoExt = path.join(base, 'program');
const executableLink = path.join(base, 'safe-name.txt');
fs.writeFileSync(file, 'dummy content');
fs.writeFileSync(executable, '#!/bin/sh\nexit 0\n', {mode:0o755});
fs.writeFileSync(executableNoExt, '#!/bin/sh\nexit 0\n', {mode:0o755});
fs.symlinkSync(executable, executableLink);
const t = (key, params={}) => key + (params.path || '');

(async () => {
  const fileLink = __test.createExternalLink(file, 'Report', 'markdown');
  assert.match(fileLink, /^\[Report\]\(<file:\/\/\//);
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
  await __test.openExternalTarget('external:' + executableLink, 'open', t);
  assert.deepEqual(called.reveal, [file, executable, executableNoExt, executableLink]);
  assert.deepEqual(called.open, [file, base]);

  await __test.openExternalTarget('external:' + path.join(base, 'missing.pdf'), 'open', t);
  await __test.openExternalTarget('https://example.com/test.pdf', 'open', t);
  assert.equal(called.notices.length, 2);
  assert.deepEqual(called.open, [file, base]);


  // Local URI safety: reject network shares, other schemes and unsafe encodings.
  assert.equal(__test.resolveExternalTarget('external:../../relative.md'), null);
  assert.equal(__test.resolveExternalTarget('external://remote/share/report.pdf'), null);
  assert.equal(__test.resolveExternalTarget('external:%2F%2Fremote%2Fshare'), null);
  assert.equal(__test.resolveExternalTarget('external:%00/tmp/test'), null);
  assert.equal(__test.resolveExternalTarget('file://remote/tmp/file.pdf'), null);
  assert.equal(__test.resolveExternalTarget('file:///tmp/a.pdf?x=1'), null);
  assert.equal(__test.resolveExternalTarget('file:///tmp/a.pdf#fragment'), null);
  assert.equal(__test.resolveExternalTarget('https://example.com/a'), null);
  assert.equal(__test.resolveExternalTarget('file:///tmp/My%20Report.pdf'), '/tmp/My Report.pdf');

  // Source-mode Markdown protected spans must not become clickable widgets.
  const markdown = [
    '---',
    'banner: [[external:/tmp/frontmatter.png]]',
    '---',
    '[Visible](<file:///tmp/report.pdf>)',
    '```md',
    '[[external:/tmp/fenced.png]]',
    '```',
    'A `[[external:/tmp/inline.png]]` link',
    '<!-- [[external:/tmp/comment.png]] -->',
    '[[external:/tmp/visible.png|Visible image]]'
  ].join('\n');
  const rendered = __test.collectRenderableExternalLinks(markdown);
  assert.deepEqual(rendered.map(match => match.label), ['Visible', 'Visible image']);

  // A widget must disappear as soon as external links are disabled.
  const config = {externalEnabled:true, externalFormat:'wiki', externalOpenMode:'open'};
  const controller = __test.getExternalEditorExtension(() => config, t);
  let dispatchCount = 0;
  const view = { state:{doc:{sliceString:(from,to)=>markdown.slice(from,to)},
    selection:{main:{head:0}, ranges:[]}}, visibleRanges:[{from:0,to:markdown.length}],
    dispatch(spec){ dispatchCount++; this.instance.update({view:this, selectionSet:true, docChanged:false, viewportChanged:false}); }};
  view.instance = new externalWidgetClass(view);
  assert.equal(view.instance.decorations.length, 2);
  config.externalEnabled = false;
  controller.refresh();
  assert.equal(dispatchCount, 1);
  assert.deepEqual(view.instance.decorations, []);
  view.instance.destroy();
  controller.refresh();
  assert.equal(dispatchCount, 1);

  // Reading View-only delegation: never intercept an unrelated sidebar link.
  const wasElement = global.Element;
  global.Element = class {};
  try {
    const anchor = {getAttribute:(key)=> key === 'href' ? 'file:///tmp/report.pdf' : null};
    const target = new global.Element();
    target.closest = (selector)=>selector === 'a' ? anchor : null;
    const event = {target,button:0,defaultPrevented:false,
      preventDefault(){throw Error('Should not intercept');},
      stopImmediatePropagation(){throw Error('Should not intercept');}};
    assert.equal(__test.handleExternalAnchorClick(event,config,t),false);
    config.externalEnabled=true;
    assert.equal(__test.handleExternalAnchorClick(event,config,t),false);
  } finally { global.Element = wasElement; }

  // A native chooser may not exist; still preserve manual entry as a fallback.
  assert.equal(await __test.pickLocalPath('file'), null);

  console.log('External opening, safety and editor-refresh regression checks passed.');
})().catch(error => { console.error(error); process.exitCode = 1; })
  .finally(() => {
    Module._load = originalLoad;
    fs.rmSync(base, {recursive: true, force: true});
  });
