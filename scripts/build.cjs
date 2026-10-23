'use strict';
const fs = require('node:fs');
const path = require('node:path');
let ts;
try { ts = require('typescript'); }
catch {
  // Local fallback for a container with global TypeScript but no registry.
  const { execFileSync } = require('node:child_process');
  const globalRoot = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim();
  ts = require(path.join(globalRoot, 'typescript'));
}
const file = path.resolve(__dirname, '../src/main.ts');
const source = fs.readFileSync(file, 'utf8');
const built = ts.transpileModule(source, {
  fileName: file,
  compilerOptions: { target: ts.ScriptTarget.ES2021, module: ts.ModuleKind.CommonJS, strict: true },
  reportDiagnostics: true
});
const errors = (built.diagnostics || []).filter(x => x.category === ts.DiagnosticCategory.Error);
if (errors.length) {
  console.error(ts.formatDiagnosticsWithColorAndContext(errors, {
    getCurrentDirectory: () => process.cwd(),
    getCanonicalFileName: p => p,
    getNewLine: () => '\n'
  }));
  process.exit(1);
}
fs.writeFileSync(path.resolve(__dirname, '../main.js'), built.outputText, 'utf8');
console.log('Built main.js');
