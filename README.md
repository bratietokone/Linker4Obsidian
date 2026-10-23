# Linker4

**Documentation language:** [English](README.md) | [Русский](README.ru.md) | [Español](README.es.md) | [简体中文](README.zh-CN.md)

A desktop [Obsidian](https://obsidian.md/) community plugin that automatically embeds supported attachments while keeping Markdown notes as ordinary Wiki-links. It can also turn standalone YouTube video URLs into embedded players.

**Version:** 0.5.0 · **Status:** GitHub Release / manual installation · **Requirements:** Obsidian 1.8.7 or newer (desktop: Windows, macOS, Linux). The plugin is not yet listed in the Community Plugins directory.

## Features

- Links to Markdown notes stay as `[[note.md]]`; images, PDFs, audio, and video are embedded as `![[file.ext]]` according to configurable rules.
- Newly typed or pasted Wiki-links, including results of `[[` autocompletion, are processed in the editor.
- YouTube links (`youtube.com`, `youtu.be`, Shorts, `/live/`) are converted to `![](URL)` when pasted in a suitable location or processed by the conversion command.
- Review changes before converting links in the current note or the entire vault.
- User interface language: **Automatic (Obsidian language)**, **English**, **Русский**, **Español**, or **简体中文**. Settings, dialogs, and messages use the selected language; commands pick up a new language after reloading the plugin.
- No account or additional runtime service is needed. The plugin does not send vault content to a server.

- **External files and folders:** create Markdown `file:///` or Wiki `[[external:...]]` links to items outside the vault and open them using your OS. No attachments are copied.

> **Migrating from Linker4Obsidian 0.4.0 or earlier:** the plugin ID changed from `linker4obsidian` to `linker-four`. Disable the old plugin, install Linker4 0.5.0 or later into `.obsidian/plugins/linker-four/`, and copy the old `data.json` if you want to preserve settings. Verify the new installation before deleting the old plugin folder. Older release packages use a different ID.

## Installation (Windows, macOS, Linux)

> Before a first installation or any bulk conversion, make a backup of your vault or test the plugin in a separate vault.

The installation process is the same on every supported desktop operating system. **This version requires manual installation**, because it has not been accepted into the official Obsidian directory.

1. Open [GitHub Releases](https://github.com/bratietokone/Linker4Obsidian/releases) (access is required while the repository is private). From the release **Assets**, download both `main.js` and `manifest.json`, or download `linker4-vX.Y.Z.zip` and extract it.
2. Open the **vault** you want to use, not Obsidian's application installation directory. Find or create its hidden `.obsidian/plugins/linker-four/` folder.
3. Place both files in that folder, preserving their original names. If using the ZIP, it already includes a `linker-four/` folder, which should sit inside `.obsidian/plugins/`:

   ```text
   YourVault/
   └── .obsidian/
       └── plugins/
           └── linker-four/
               ├── manifest.json
               └── main.js
   ```

4. Restart Obsidian, or reload your community plugins. Open **Settings → Community plugins**. Enable community plugins (if disabled), then enable **Linker4**.
5. Open **Settings → Linker4** (usually under Community plugins) to choose your interface language and link rules.

### Where is the vault's plugin directory?

| System | Example vault path | Showing hidden folders |
| --- | --- | --- |
| Windows | `C:\Users\<you>\Documents\MyVault\.obsidian\plugins\linker-four\` | In File Explorer, enable **View → Show → Hidden items** (wording varies by version). |
| macOS | `/Users/<you>/Documents/MyVault/.obsidian/plugins/linker-four/` | In Finder press **Cmd+Shift+.** to show hidden files. |
| Linux | `/home/<you>/Documents/MyVault/.obsidian/plugins/linker-four/` | In most file managers press **Ctrl+H** to show hidden files. |

These are **examples**, not fixed locations. Your vault may be anywhere, including another drive or a synced folder. The `.obsidian` directory is inside the vault. Avoid an extra nesting level such as `linker-four/linker-four/`.

## Interface language

Open **Settings → Linker4 → Interface language** and select:

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

## External files and folders

Open **Settings → Linker4 → External files and folders** (a separate settings page). Enable external links and choose your preferred format for *new* links: Markdown or Wiki. Both formats can be opened regardless of this preference.

```markdown
[Projects](<file:///home/user/Projects/>)
[Report](<file:///home/user/Documents/report.pdf>)

[[external:/home/user/Projects/|Projects]]
[[external:/home/user/Documents/report.pdf|Report]]
```

Use **Insert link to external file** or **Insert link to external folder** from the command palette. You can choose an item through the native file chooser, where supported, or type an absolute path manually. The optional display name is inserted as the link label.

Click links in Reading View or Live Preview to open a file in its default OS application or open a directory in the file manager. In settings you may instead choose to reveal the target in the file manager. Executable files are never launched by this feature, only revealed. Invalid or missing paths produce a warning. Only local paths are supported; remote file hosts and non-file schemes are rejected.

**External links never embed or copy files.** Existing rules for attachments inside the vault remain unchanged.

## Using Linker4

- **New links:** Enter a Wiki-link or select a file with Obsidian's built-in `[[` suggestions. The plugin normalizes new links to the configured format.
- **Files dragged or pasted into a note:** When Obsidian creates a Wiki-link, the plugin applies its file rules. Obsidian handles copying attachments into the vault; the plugin does not manage file copying.
- **YouTube:** Paste a video URL onto a suitable line. Links within ordinary paragraphs aren't converted automatically to avoid disrupting your text.
- **Existing notes:** Open the command palette (`Ctrl+P` / `Cmd+P`) and find **Linker4: Preview and convert links in current note** or **Linker4: Preview and convert links in entire vault** (names appear in Russian when the Russian interface was active at plugin load). Review the preview and confirm before modifying any notes.

The plugin preserves deliberate existing `![[...]]` embeds and does not rewrite fenced code blocks, YAML frontmatter, inline code, or HTML-comment lines. Bulk conversion changes existing notes only after confirmation. **Back up the vault before batch conversion.**

## Limitations

- External paths must be absolute, are device-specific, and may be inaccessible in sandboxed installations such as Flatpak.
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