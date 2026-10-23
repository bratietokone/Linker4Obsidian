# Linker4Obsidian

**Documentation language:** [English](README.md) | [Русский](README.ru.md) | [Español](README.es.md) | [简体中文](README.zh-CN.md)

A desktop [Obsidian](https://obsidian.md/) community plugin that automatically embeds supported attachments while keeping Markdown notes as ordinary Wiki-links. It can also turn standalone YouTube video URLs into embedded players.

**Version:** 0.3.0 · **Status:** GitHub Release / manual installation · **Requirements:** Obsidian 1.8.7 or newer (desktop: Windows, macOS, Linux). The plugin is not yet listed in the Community Plugins directory.

## Features

- Links to Markdown notes stay as `[[note.md]]`; images, PDFs, audio, and video are embedded as `![[file.ext]]` according to configurable rules.
- Newly typed or pasted Wiki-links, including results of `[[` autocompletion, are processed in the editor.
- YouTube links (`youtube.com`, `youtu.be`, Shorts, `/live/`) are converted to `![](URL)` when pasted in a suitable location or processed by the conversion command.
- Review changes before converting links in the current note or the entire vault.
- User interface language: **Automatic (Obsidian language)**, **English**, **Русский**, **Español**, or **简体中文**. Settings, dialogs, and messages use the selected language; commands pick up a new language after reloading the plugin.
- No account or additional runtime service is needed. The plugin does not send vault content to a server.

## Installation (Windows, macOS, Linux)

> Before a first installation or any bulk conversion, make a backup of your vault or test the plugin in a separate vault.

The installation process is the same on every supported desktop operating system. **This version requires manual installation**, because it has not been accepted into the official Obsidian directory.

1. Open [GitHub Releases](https://github.com/bratietokone/Linker4Obsidian/releases) (access is required while the repository is private). From the release **Assets**, download both `main.js` and `manifest.json`, or download `linker4obsidian-vX.Y.Z.zip` and extract it.
2. Open the **vault** you want to use, not Obsidian's application installation directory. Find or create its hidden `.obsidian/plugins/linker4obsidian/` folder.
3. Place both files in that folder, preserving their original names. If using the ZIP, it already includes a `linker4obsidian/` folder, which should sit inside `.obsidian/plugins/`:

   ```text
   YourVault/
   └── .obsidian/
       └── plugins/
           └── linker4obsidian/
               ├── manifest.json
               └── main.js
   ```

4. Restart Obsidian, or reload your community plugins. Open **Settings → Community plugins**. Enable community plugins (if disabled), then enable **Linker4Obsidian**.
5. Open **Settings → Linker4Obsidian** (usually under Community plugins) to choose your interface language and link rules.

### Where is the vault's plugin directory?

| System | Example vault path | Showing hidden folders |
| --- | --- | --- |
| Windows | `C:\Users\<you>\Documents\MyVault\.obsidian\plugins\linker4obsidian\` | In File Explorer, enable **View → Show → Hidden items** (wording varies by version). |
| macOS | `/Users/<you>/Documents/MyVault/.obsidian/plugins/linker4obsidian/` | In Finder press **Cmd+Shift+.** to show hidden files. |
| Linux | `/home/<you>/Documents/MyVault/.obsidian/plugins/linker4obsidian/` | In most file managers press **Ctrl+H** to show hidden files. |

These are **examples**, not fixed locations. Your vault may be anywhere, including another drive or a synced folder. The `.obsidian` directory is inside the vault. Avoid an extra nesting level such as `linker4obsidian/linker4obsidian/`.

## Interface language

Open **Settings → Linker4Obsidian → Interface language** and select:

| Option | What it does |
| --- | --- |
| Automatic (default) | Uses the current Obsidian UI language when available. English is the fallback for unsupported languages. |
| English | Forces English regardless of Obsidian's language. |
| Русский | Forces Russian regardless of Obsidian's language. |
| Español | Forces Spanish regardless of Obsidian's language. |
| 简体中文 | Forces Simplified Chinese regardless of Obsidian's language. |

Settings are translated immediately when you select a language. Notifications and conversion dialogs use the chosen language. **Reload the plugin** to update the registered command names in the command palette. All interface translations are maintained in separate, type-checked `src/locales/` modules.

## Default link rules

| Content | Result |
| --- | --- |
| Markdown notes (`.md`, `.markdown`) | `[[Notes/My note.md]]` |
| Images (`.png`, `.jpg`, `.webp`, `.svg`, …) | `![[photo.webp]]` |
| PDF documents | `![[document.pdf]]` |
| Local video (`.mp4`, `.webm`, …) | `![[video.mp4]]` |
| Local audio (`.mp3`, `.flac`, …) | `![[audio.mp3]]` |
| Other / unsupported extensions | `[[archive.zip]]` |
| Standalone YouTube video URL | `![](https://www.youtube.com/watch?v=VIDEO_ID)` |
| Other web URLs | Remain regular links |

Rule categories and extension overrides are configurable. **Always link** extension overrides have precedence over **Always embed** overrides. Actual previews depend on what Obsidian can render.

## Using Linker4Obsidian

- **New links:** Enter a Wiki-link or select a file with Obsidian's built-in `[[` suggestions. The plugin normalizes new links to the configured format.
- **Files dragged or pasted into a note:** When Obsidian creates a Wiki-link, the plugin applies its file rules. Obsidian handles copying attachments into the vault; the plugin does not manage file copying.
- **YouTube:** Paste a video URL onto a suitable line. Links within ordinary paragraphs aren't converted automatically to avoid disrupting your text.
- **Existing notes:** Open the command palette (`Ctrl+P` / `Cmd+P`) and find **Linker4Obsidian: Preview and convert links in current note** or **Linker4Obsidian: Preview and convert links in entire vault** (names appear in Russian when the Russian interface was active at plugin load). Review the preview and confirm before modifying any notes.

The plugin preserves deliberate existing `![[...]]` embeds and does not rewrite fenced code blocks, YAML frontmatter, inline code, or HTML-comment lines. Bulk conversion changes existing notes only after confirmation. **Back up the vault before batch conversion.**

## Limitations

- This release is **desktop-only**, not a mobile plugin.
- Only supported YouTube *video* URLs are embedded; playlist-only links and unrelated sites stay ordinary links. Sites that disallow embedding aren't forced into iframes.
- Standard Markdown local-file links like `[file](image.png)` aren't converted into Wiki embeds.
- The live editor processes newly edited links; use the commands to process older links.
- Other community plugins or newer Obsidian editor behaviors can affect link insertion. Report reproducible issues in GitHub Issues.

## Development

Requires Node.js and npm. Source files are in `src/`, translations in `src/locales/`; the built `main.js` and `manifest.json` are in the repository root.

```bash
npm install
npm run typecheck
npm run build
npm test
```

GitHub Actions runs the same checks on pushes and pull requests. The plugin uses TypeScript and Obsidian's editor API; no external runtime packages or network requests are required.

## Feedback and license

- [Releases](https://github.com/bratietokone/Linker4Obsidian/releases)
- [Changelog](CHANGELOG.md)
- [Repository](https://github.com/bratietokone/Linker4Obsidian)
- [Report a bug or request a feature](https://github.com/bratietokone/Linker4Obsidian/issues)
- [License](LICENSE)

Independent community project; not affiliated with Obsidian. Tested by the maintainer in desktop Obsidian for the first release; please validate each update in your own vault.