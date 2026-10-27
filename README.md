# Linker

**Documentation language:** [English](README.md) | [Русский](README.ru.md) | [Español](README.es.md) | [简体中文](README.zh-CN.md)

A desktop [Obsidian](https://obsidian.md/) community plugin that automatically embeds supported attachments while keeping Markdown notes as ordinary Wiki-links. It can also turn standalone YouTube video URLs into embedded players.

**Version:** 0.5.1 · **Status:** Available in Obsidian Community Plugins · **Requirements:** Obsidian 1.8.7 or newer (desktop: Windows, macOS, Linux).

## Features

- Links to Markdown notes stay as `[[note.md]]`; images, PDFs, audio, and video are embedded as `![[file.ext]]` according to configurable rules.
- Newly typed or pasted Wiki-links, including results of `[[` autocompletion, are processed in the editor.
- YouTube links (`youtube.com`, `youtu.be`, Shorts, `/live/`) are converted to `![](URL)` when pasted in a suitable location or processed by the conversion command.
- Review changes before converting links in the current note or the entire vault.
- User interface language: **Automatic (Obsidian language)**, **English**, **Русский**, **Español**, or **简体中文**. Settings, dialogs, and messages use the selected language; commands pick up a new language after reloading the plugin.
- No account or additional runtime service is needed. The plugin does not send vault content to a server.

- **External files and folders:** create Markdown `file:///` or Wiki `[[external:...]]` links to items outside the vault and open them using your OS. No attachments are copied.

> **Migrating from Linker4Obsidian 0.4.0 or earlier:** the plugin ID changed from `linker4obsidian` to `linker`. Disable the old plugin, install Linker 0.5.0 or later into `.obsidian/plugins/linker/`, and copy the old `data.json` if you want to preserve settings. Verify the new installation before deleting the old plugin folder. Older release packages use a different ID.

**Filesystem access and privacy:** The desktop-only external-link feature uses Node.js filesystem metadata checks to verify the local path selected or clicked by the user. It then asks Electron to open or reveal that file or directory using the operating system. Access outside the vault is needed only for this feature; the plugin does not read or upload external file contents, transmit vault data, or collect telemetry.

## Installation (Windows, macOS, Linux)

> Back up your vault before bulk conversion or when trying an unreleased build.

### Install from Obsidian (recommended)

1. In Obsidian open **Settings → Community plugins → Browse**.
2. Search for **Linker** (by **bratietokone**), or open the [Linker plugin page](https://obsidian.md/plugins?id=linker).
3. Select **Install**, then **Enable**. Open **Settings → Linker** to choose your link rules and language.

This is the recommended way to install and receive published updates on Windows, macOS, and Linux. **No manual download is needed.**

### Manual installation (advanced use / local testing)

For a specific GitHub release or an unreleased test build:

1. Get the tested `main.js` and `manifest.json` from [GitHub Releases](https://github.com/bratietokone/Linker4Obsidian/releases) or from the CI artifact for your development branch. Release **0.5.1 has two individual assets, not an installation ZIP**. Older releases may include ZIPs.
2. Find the folder of your **Obsidian vault** (not the Obsidian application). Create `.obsidian/plugins/linker/` inside it.
3. Place `main.js` and `manifest.json` in that folder:

   ```text
   YourVault/
   └── .obsidian/
       └── plugins/
           └── linker/
               ├── manifest.json
               └── main.js
   ```

4. Restart Obsidian or reload community plugins, then enable **Linker** under **Settings → Community plugins**. Open its settings.

Do not install a test build over a production copy without backing up your vault and the plugin's `data.json`. A development artifact must be tested locally before any release decision.

### Where is the vault's plugin directory?

| System | Example vault path | Showing hidden folders |
| --- | --- | --- |
| Windows | `C:\Users\<you>\Documents\MyVault\.obsidian\plugins\linker\` | In File Explorer, enable **View → Show → Hidden items** (wording varies by version). |
| macOS | `/Users/<you>/Documents/MyVault/.obsidian/plugins/linker/` | In Finder press **Cmd+Shift+.** to show hidden files. |
| Linux | `/home/<you>/Documents/MyVault/.obsidian/plugins/linker/` | In most file managers press **Ctrl+H** to show hidden files. |

These are **examples**, not fixed locations. Your vault may be anywhere, including another drive or a synced folder. The `.obsidian` directory is inside the vault. Avoid an extra nesting level such as `linker/linker/`.

## Interface language

Open **Settings → Linker → Interface language** and select:

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

Open **Settings → Linker → External files and folders** (a separate settings page). Enable external links and choose your preferred format for *new* links: Markdown or Wiki. Both formats can be opened regardless of this preference.

```markdown
[Projects](<file:///home/user/Projects/>)
[Report](<file:///home/user/Documents/report.pdf>)

[[external:/home/user/Projects/|Projects]]
[[external:/home/user/Documents/report.pdf|Report]]
```

Use **Insert link to external file** or **Insert link to external folder** from the command palette. You can choose an item through the native file chooser, where supported, or type an absolute path manually. The optional display name is inserted as the link label.

Click links in Reading View or Live Preview to open a file in its default OS application or open a directory in the file manager. In settings you may instead choose to reveal the target in the file manager. Executable files are never launched by this feature, only revealed. Invalid or missing paths produce a warning. Only local paths are supported; remote file hosts and non-file schemes are rejected.

**External links never embed or copy files.** Existing rules for attachments inside the vault remain unchanged.

## Using Linker

- **New links:** Enter a Wiki-link or select a file with Obsidian's built-in `[[` suggestions. The plugin normalizes new links to the configured format.
- **Files dragged or pasted into a note:** When Obsidian creates a Wiki-link, the plugin applies its file rules. Obsidian handles copying attachments into the vault; the plugin does not manage file copying.
- **YouTube:** Paste a video URL onto a suitable line. Links within ordinary paragraphs aren't converted automatically to avoid disrupting your text.
- **Existing notes:** Open the command palette (`Ctrl+P` / `Cmd+P`) and find **Linker: Preview and convert links in current note** or **Linker: Preview and convert links in entire vault** (names appear in Russian when the Russian interface was active at plugin load). Review the preview and confirm before modifying any notes.

The plugin preserves deliberate existing `![[...]]` embeds and does not rewrite fenced code blocks, YAML frontmatter, inline code, or HTML-comment lines. Bulk conversion changes existing notes only after confirmation. **Back up the vault before batch conversion.**

**YouTube settings:** **Enable YouTube embedding** is the master switch for conversion (including the commands under `Ctrl+P` / `Cmd+P`). Its nested **Automatically embed on paste and typing** switch controls only the editor's immediate automatic conversion. Turn it off to preserve newly pasted or typed YouTube URLs until you explicitly run a preview-and-convert command. Turning off the master switch disables both paths. Existing saved settings are retained.

## Limitations

- External paths must be absolute, are device-specific, and may be inaccessible in sandboxed installations such as Flatpak.
- This release is **desktop-only**, not a mobile plugin.
- Only supported YouTube *video* URLs are embedded; playlist-only links and unrelated sites stay ordinary links. Sites that disallow embedding aren't forced into iframes.
- Standard Markdown local-file links like `[file](image.png)` aren't converted into Wiki embeds.
- The live editor processes newly edited links; use the commands to process older links.
- Other community plugins or newer Obsidian editor behaviors can affect link insertion. Report reproducible issues in GitHub Issues.

## Development

Requires Node.js and npm. Source files are in `src/`, translations in `src/locales/`; `manifest.json` is in the repository root; `npm run build` generates `main.js` locally (not tracked in Git).

```bash
npm ci
npm run validate
npm run typecheck
npm run lint
npm run build
npm test
```

GitHub Actions runs the same checks on pushes and pull requests. The plugin uses TypeScript and Obsidian's editor API; no external runtime packages or network requests are required.

## Development and release policy

**Release 0.5.1 is the current stable version.** Proposed work is not released merely because it appears in the roadmap.

1. **Discuss each development stage in detail before implementation.** Agree on scope, risks, acceptance criteria, and regression scenarios.
2. Develop on a **separate Git branch / pull request**, preserving the stable release. Run `npm ci`, `npm run validate`, `npm run typecheck`, `npm run lint`, `npm run build`, and `npm test`. GitHub CI also checks reproducible builds and provides an installable test artifact.
3. The maintainer tests the artifact and, where relevant, the local source build **in desktop Obsidian on their own system**, including regression tests for links, attachments, YouTube, and settings. Address any findings before proceeding.
4. **Only after a separate explicit release decision** update `manifest.json` and `package.json` to the approved `X.Y.Z` version, and add release notes to the relevant CHANGELOG files. Merging a version change into `main` triggers automatic publication, so never change the manifest version as part of an unapproved test.
5. The [Publish Linker release workflow](https://github.com/bratietokone/Linker4Obsidian/actions/workflows/release.yml) validates, builds, tests, attests and publishes GitHub Release `X.Y.Z` (without `v`) with `main.js` and `manifest.json`. The generated `main.js` is not committed. A failed release can be retried after fixing its cause; published versions are not overwritten.

**Do not publish directly from a test branch, automatically advance stages, or release solely on the basis of a passing CI run.** Local validation and a release decision are required.

## Proposed work (not available in 0.5.1)

- **Compatibility and code hygiene:** address the remaining [Obsidian Community review warnings (Issue #9)](https://github.com/bratietokone/Linker4Obsidian/issues/9), with emphasis on external-path safety and support for Obsidian 1.8.7+.
- **Attachment audit:** discuss a separate module for scanning vault attachments, reporting possibly unused files, previewing evidence and allowing exclusions. Initial design is **read-only**; it does not delete anything.
- **Optional cleanup later:** only after its own design review and local tests, consider explicitly selected moves to trash. No automatic or permanent deletion is planned.

These are proposals, **not existing features or committed release dates**.

## Feedback and license

- [Releases](https://github.com/bratietokone/Linker4Obsidian/releases)
- [Changelog](CHANGELOG.md)
- [Repository](https://github.com/bratietokone/Linker4Obsidian)
- [Report a bug or request a feature](https://github.com/bratietokone/Linker4Obsidian/issues)
- [License](LICENSE)

Independent community project; not affiliated with Obsidian. Tested by the maintainer in desktop Obsidian for the first release; please validate each update in your own vault.