// Match the Obsidian Community scanner's security-error / advisory-warning split.
// Lint authored sources, not bundled main.js (Obsidian sample plugin convention).
import { defineConfig, globalIgnores } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";

const securityRules = new Set([
  "no-eval",
  "no-implied-eval",
  "no-unsanitized/method",
  "no-unsanitized/property",
  "obsidianmd/regex-lookbehind",
  "obsidianmd/no-forbidden-elements",
]);

const recommended = obsidianmd.configs.recommended.map(config => ({
  ...config,
  ...(config.rules
    ? {
        rules: Object.fromEntries(
          Object.entries(config.rules).map(([name, setting]) => {
            const values = Array.isArray(setting) ? setting : [setting];
            const level = values[0];
            if (level === "off" || level === 0) return [name, setting];
            return [name, [securityRules.has(name) ? "error" : "warn", ...values.slice(1)]];
          }),
        ),
      }
    : {}),
}));

export default defineConfig([
  globalIgnores([
    "main.js",
    "dist/**",
    "build/**",
    "tests/**",
    "scripts/**",
    "src/locales/**",
    "**/*.cjs",
    "**/*.mjs",
  ]),
  ...recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["eslint.config.*", "manifest.json"],
        },
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: [".json"],
      },
    },
    rules: {
      "no-undef": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/no-base-to-string": "off",
      "import/no-unresolved": "off",
      "obsidianmd/validate-manifest": "off",
      "obsidianmd/validate-license": "off",
      "obsidianmd/commands/no-command-in-command-id": "off",
      "obsidianmd/commands/no-plugin-id-in-command-id": "off",
    },
  },
]);
