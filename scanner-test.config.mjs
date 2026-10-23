import { defineConfig, globalIgnores } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";
const securityRules = new Set(["no-eval","no-implied-eval","no-unsanitized/method","no-unsanitized/property","obsidianmd/regex-lookbehind","obsidianmd/no-forbidden-elements"]);
const recommended = obsidianmd.configs.recommended.map(conf => ({...conf, ...(conf.rules ? {rules: Object.fromEntries(Object.entries(conf.rules).map(([k,v])=>{const vv=Array.isArray(v)?v:[v];return [k,vv[0]===0||vv[0]==="off"?v:[securityRules.has(k)?"error":"warn",...vv.slice(1)]];}))} : {})}));
export default defineConfig([
  globalIgnores(["node_modules","dist","build","pkg","test-vault",".obsidian","**/.obsidian/**","esbuild.config.mjs","version-bump.mjs","**/*.test.*","**/*.tests.*","**/*.spec.*","**/*.specs.*","**/test/**","**/tests/**","**/__tests__/**","**/mocks/**","**/__mocks__/**","**/*.cjs","**/*.mjs","**/*.cts","**/*.mts","**/vite*","**/scripts/**","**/docs/**","**/i18n/**","**/i18next/**","**/locale/**","**/locales/**","**/translations/**","**/l10n/**",".pnpm-store","**/testUtils**","automation/**","e2e-tests/**"]),
  ...recommended,
  { languageOptions: { parserOptions: { projectService: { allowDefaultProject: ["eslint.config.js","manifest.json"] }, tsconfigRootDir: process.cwd(), extraFileExtensions: [".json"] } }, rules: {
    "no-undef":"off",
    "@typescript-eslint/no-unsafe-member-access":"off", "@typescript-eslint/no-unsafe-assignment":"off", "@typescript-eslint/no-unsafe-argument":"off", "@typescript-eslint/no-unsafe-call":"off", "@typescript-eslint/no-unsafe-return":"off",
    "@typescript-eslint/restrict-template-expressions":"off", "@typescript-eslint/no-base-to-string":"off", "import/no-unresolved":"off",
    "obsidianmd/validate-manifest":"off", "obsidianmd/validate-license":"off",
    "obsidianmd/commands/no-command-in-command-id":"off", "obsidianmd/commands/no-plugin-id-in-command-id":"off"
  } }
]);
