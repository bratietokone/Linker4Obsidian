'use strict';
const esbuild = require('esbuild');
esbuild.buildSync({
  entryPoints: ['src/main.ts'],
  outfile: 'main.js',
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'es2021',
  external: ['obsidian', '@codemirror/view'],
  logLevel: 'info'
});
