'use strict';
const assert = require('node:assert/strict');
const Module = require('node:module');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
execFileSync('node', [path.join(__dirname, '..', 'scripts', 'build.cjs')], { stdio: 'inherit' });
const load = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === 'obsidian') return { App: class {}, Editor: class {}, MarkdownView: class {}, Modal: class {}, Notice: class {}, Plugin: class {}, PluginSettingTab: class {}, Setting: class {}, TFile: class {}, getLanguage: () => 'en' };
  if (request === '@codemirror/view') return { EditorView: class {} };
  return load.call(this, request, parent, isMain);
};
const { __test } = require('../main.js');
Module._load = load;
const defaults = {
  language: 'auto',
  automaticWiki: true, automaticYouTube: true, pasteYouTube: true,
  rules: { markdown: 'link', image: 'embed', pdf: 'embed', video: 'embed', audio: 'embed', other: 'link' },
  additionalEmbedExtensions: '', additionalLinkExtensions: ''
};
const app = { metadataCache: { getFirstLinkpathDest: target => {
  if (target === 'Notes/My note') return {extension:'md'};
  if (target === 'pic') return {extension:'png'};
  return null;
}}};
const transform = (text, s = defaults, touch) => __test.transformText(text, 'Inbox/test.md', app, s, touch);
function eq(input, expected, s = defaults, touch) {
  const outcome = transform(input, s, touch);
  assert.equal(outcome.text, expected, '\nInput: ' + JSON.stringify(input));
  return outcome;
}
const tests = [
  () => eq('[[Notes/My note]]', '[[Notes/My note]]'),
  () => eq('[[note.md|Name]]', '[[note.md|Name]]'),
  () => eq('[[pic]]', '![[pic]]'),
  () => eq('[[Images/photo.webp|400]]', '![[Images/photo.webp|400]]'),
  () => eq('[[file.pdf#page=12]]', '![[file.pdf#page=12]]'),
  () => eq('[[foo.mp4]]\n[[a.mp3]]\n[[x.zip]]', '![[foo.mp4]]\n![[a.mp3]]\n[[x.zip]]'),
  () => eq('![[file.pdf]]', '![[file.pdf]]'),
  () => eq('![[note.md]]', '![[note.md]]'), // intentional embed preserved
  () => eq('hello [[image.png]] there', 'hello ![[image.png]] there'),
  () => eq('`[[image.png]]`', '`[[image.png]]`'),
  () => eq('before `hello` [[image.png]]', 'before `hello` ![[image.png]]'),
  () => eq('\\[[image.png]]', '\\[[image.png]]'),
  () => eq('---\ntitle: "[[image.png]]"\n---\n[[x.pdf]]', '---\ntitle: "[[image.png]]"\n---\n![[x.pdf]]'),
  () => eq('```md\n[[x.pdf]]\n```\n[[x.pdf]]', '```md\n[[x.pdf]]\n```\n![[x.pdf]]'),
  () => eq('~~~~\n[[x.pdf]]\n~~~~\n[[x.pdf]]', '~~~~\n[[x.pdf]]\n~~~~\n![[x.pdf]]'),
  () => eq('<!-- [[x.pdf]] -->\n[[x.pdf]]', '<!-- [[x.pdf]] -->\n![[x.pdf]]'),
  () => eq('start <!--\n[[x.pdf]]\n-->\n[[x.pdf]]', 'start <!--\n[[x.pdf]]\n-->\n![[x.pdf]]'),
  () => eq('[[x.pdf]]\r\n[[n.md]]\r\n', '![[x.pdf]]\r\n[[n.md]]\r\n'),
  () => eq('[[foo.epub]]', '![[foo.epub]]', {...defaults, additionalEmbedExtensions: 'epub'}),
  () => eq('[[foo.pdf]]', '[[foo.pdf]]', {...defaults, additionalLinkExtensions: 'pdf'}),
  () => eq('[[foo.pdf]]', '[[foo.pdf]]', {...defaults, rules: {...defaults.rules, pdf:'link'}}),
  () => eq('[[a.png]] and [[b.pdf]]', '[[a.png]] and ![[b.pdf]]', defaults, {from: 18, to: 19}),
  () => eq('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '![](https://www.youtube.com/watch?v=dQw4w9WgXcQ)'),
  () => eq('https://youtu.be/dQw4w9WgXcQ', '![](https://www.youtube.com/watch?v=dQw4w9WgXcQ)'),
  () => eq('https://www.youtube.com/shorts/dQw4w9WgXcQ', '![](https://www.youtube.com/watch?v=dQw4w9WgXcQ)'),
  () => eq('[Video](https://www.youtube.com/watch?v=dQw4w9WgXcQ)', '![](https://www.youtube.com/watch?v=dQw4w9WgXcQ)'),
  () => eq('Here is https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Here is https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
  () => eq('https://notyoutube.com/watch?v=dQw4w9WgXcQ', 'https://notyoutube.com/watch?v=dQw4w9WgXcQ'),
  () => eq('https://www.youtube.com/watch?v=BAD', 'https://www.youtube.com/watch?v=BAD'),
  () => eq('![](https://www.youtube.com/watch?v=dQw4w9WgXcQ)', '![](https://www.youtube.com/watch?v=dQw4w9WgXcQ)'),
  () => eq('```\nhttps://www.youtube.com/watch?v=dQw4w9WgXcQ\n```', '```\nhttps://www.youtube.com/watch?v=dQw4w9WgXcQ\n```'),
  () => eq('[[a.jpg]]', '[[a.jpg]]', {...defaults, automaticWiki: false}),
  () => eq('https://youtu.be/dQw4w9WgXcQ', 'https://youtu.be/dQw4w9WgXcQ', {...defaults, automaticYouTube: false}),
  () => assert.equal(__test.youtubeEmbed('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=12'), '![](https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=12)'),
  () => assert.equal(__test.youtubeEmbed('https://youtube.com.evil.tld/watch?v=dQw4w9WgXcQ'), null),
  () => assert.equal(__test.youtubeEmbed('javascript:alert(1)'), null),
  () => assert.equal(__test.inInlineCode('prefix `code` after', 14), false),
  () => assert.equal(__test.resolvedLocale(defaults), 'en'),
  () => assert.equal(__test.resolvedLocale({ ...defaults, language: 'ru' }), 'ru'),
  () => assert.equal(__test.tr({ ...defaults, language: 'en' }, 'apply'), 'Apply'),
  () => assert.equal(__test.tr({ ...defaults, language: 'ru' }, 'apply'), 'Применить'),
  () => assert.equal(__test.tr({ ...defaults, language: 'es' }, 'apply'), 'Aplicar'),
  () => assert.equal(__test.tr({ ...defaults, language: 'zh-CN' }, 'apply'), '应用'),
  () => assert.equal(__test.resolvedLocale({ ...defaults, language: 'es' }), 'es'),
  () => assert.equal(__test.resolvedLocale({ ...defaults, language: 'zh-CN' }), 'zh-CN'),
  () => assert.equal(__test.localeFromLanguage('es-MX'), 'es'),
  () => assert.equal(__test.tr({ ...defaults, language: 'ru' }, 'tabExternal'), 'Внешние файлы и папки'),
  () => assert.equal(__test.tr({ ...defaults, language: 'es' }, 'externalBrowse'), 'Examinar…'),
  () => assert.equal(__test.tr({ ...defaults, language: 'zh-CN' }, 'externalInsertFolder'), '插入外部文件夹链接'),
  () => assert.equal(__test.resolveExternalTarget('external:/tmp/My%20Files/report.pdf'), '/tmp/My Files/report.pdf'),
  () => assert.equal(__test.resolveExternalTarget('file:///tmp/My%20Files/report.pdf'), '/tmp/My Files/report.pdf'),
  () => assert.equal(__test.resolveExternalTarget('https://example.com/a'), null),
  () => assert.equal(__test.resolveExternalTarget('file://otherhost/tmp/a'), null),
  () => assert.equal(__test.resolveExternalTarget('external:../relative'), null),
  () => assert.equal(__test.createExternalLink('/tmp/My Files/report.pdf', 'My report', 'markdown'), '[My report](<file:///tmp/My%20Files/report.pdf>)'),
  () => assert.equal(__test.createExternalLink('/tmp/My Files/report.pdf', 'My report', 'wiki'), '[[external:/tmp/My Files/report.pdf|My report]]'),
  () => assert.equal(__test.readExternalLinkFromWiki('external:/tmp/My Files/report.pdf|My report')?.label, 'My report'),
  () => assert.equal(__test.isExecutablePath('/tmp/install.sh'), true),
  () => assert.equal(__test.isExecutablePath('/tmp/report.pdf'), false),
  () => eq('[[external:/tmp/My Files/report.pdf]]', '[[external:/tmp/My Files/report.pdf]]'),
  () => assert.equal(__test.localeFromLanguage('zh-Hans'), 'zh-CN'),
  () => assert.equal(__test.localeFromLanguage('zh-TW'), 'en'),
  () => assert.equal(__test.localeFromLanguage('de-DE'), 'en'),
  () => assert.equal(__test.tr({ ...defaults, language: 'ru' }, 'applied', { count: 3 }), 'Linker: применено 3 изменений.'),
  () => assert.equal(__test.tr({ ...defaults, language: 'en' }, 'applied', { count: 3 }), 'Linker: applied 3 changes.')
];
for (let i = 0; i < tests.length; i++) {
  try { tests[i](); }
  catch (error) { console.error(`FAIL ${i+1}`, error); process.exitCode = 1; }
}
if (!process.exitCode) console.log(`${tests.length} tests passed.`);
