# Linker4Obsidian for Obsidian

Community plugin in development (v0.1.0). Automatically uses a normal `[[...]]` link for Markdown notes and an embed `![[...]]` for supported attachment types. Turns a pasted YouTube video URL into a media embed.

**Language:** Settings and command names are in Russian. No account or cloud service needed.

## Install on Fedora / Linux

1. Back up your vault or test in a separate vault first. Obsidian explicitly recommends a test vault for plugin development.
2. Exit Obsidian (or disable the plugin before replacing its files).
3. Unpack `linker4obsidian-install.zip` into the **`.obsidian/plugins/` directory of the vault**. The resulting paths must be:

   ```text
   YourVault/
     .obsidian/
       plugins/
         linker4obsidian/
           manifest.json
           main.js
   ```

   Shell installation example (edit the path and zip file name):

   ```bash
   mkdir -p "/path/to/YourVault/.obsidian/plugins"
   unzip -o linker4obsidian-install.zip -d "/path/to/YourVault/.obsidian/plugins"
   ```

4. Launch Obsidian → **Settings → Community plugins → Turn on community plugins** (if needed) → enable **Linker4Obsidian**.
5. Open **Settings → Community plugins → Linker4Obsidian** to configure behavior.

**Do not** extract the ZIP to `linker4obsidian/linker4obsidian/` (double nesting).

## Default behavior

| Content | Generated Markdown |
| --- | --- |
| A Markdown note (`.md`, `.markdown`) | `[[My note.md]]` |
| Images (`.png`, `.jpg`, `.webp`, `.svg`, ...) | `![[image.webp]]` |
| PDF | `![[report.pdf]]` |
| Video attachment (`.mp4`, `.webm`, ...) | `![[clip.mp4]]` |
| Audio attachment (`.mp3`, `.flac`, ...) | `![[sound.flac]]` |
| Unknown file type | `[[archive.zip]]` |
| YouTube video URL pasted as a standalone URL | `![](https://www.youtube.com/watch?v=VIDEO_ID)` |
| Other website URL | Kept as a normal URL/link |

Supported insertion paths:
- Selection via the editor's built-in `[[` completion, including completion where `]]` is already present.
- Typing/pasting a new Wiki-link into the editor.
- Dropping an attachment **if Obsidian itself inserts a Wiki-link**; Linker4Obsidian then normalizes it. Obsidian is responsible for copying external attachments into the vault.
- `Ctrl+V` with a plain YouTube video URL, including `youtu.be`, Shorts and `/live/` links.

Existing embeds (`![[...]]`) are **preserved**, including deliberate Markdown transclusions; it doesn't remove a manually typed `!`.

The editor rewriter touches only newly edited links. It ignores code fences, frontmatter, inline code, and HTML comment lines. The YouTube rewrite for normal editor updates is restricted to a standalone URL or Markdown link on a line. It doesn't modify a YouTube URL inside prose.

### Convert old links

Open the command palette (`Ctrl+P`):
- **Linker4Obsidian: Предпросмотр и преобразование ссылок в текущей заметке**
- **Linker4Obsidian: Предпросмотр и преобразование ссылок во всём хранилище**

Both commands present a preview and require confirmation. The vault-wide command lists affected files and sample before/after lines. It processes open editor buffers through the editor where possible and uses `Vault.process()` for closed notes. **Create a backup first.**

### Customize

All categories can be set to **Link** or **Embed**, and comma-separated extension overrides are supported. Explicit "always link" overrides take precedence over "always embed".

An `![[file]]` only displays a preview if your Obsidian installation supports that file format. This plugin doesn't add decoders or a web-page iframe renderer. Unsupported YouTube variants (for example, a playlist without a video ID) stay ordinary links.

## Repository

<https://github.com/bratietokone/Linker4Obsidian>

The root of the repository contains the Obsidian `manifest.json` and compiled `main.js` for direct installation. The plugin ID is `linker4obsidian` (a new plugin identity, not an in-place upgrade from Smart Embed).

## Development

`src/main.ts` is the single TypeScript entry point. Output is a CommonJS `main.js` using imports that Obsidian already provides (`obsidian` and `@codemirror/view`). No external runtime packages or network calls are required.

```bash
npm install
npm run typecheck
npm run build
npm test
```

The build script uses local TypeScript; it can also use globally installed TypeScript if the npm registry isn't accessible. Typechecking against the official Obsidian API requires the development dependencies to be installed.

## Test status

- 37 tests of link classification, YouTube normalization, Markdown exclusions, and targeted updates.
- 5 integration smoke tests with mocked Obsidian/editor event APIs.
- Compiled `main.js` supplied.
- **Not yet tested inside a real Obsidian session**, and full typechecking against downloaded Obsidian API declarations wasn't possible in the offline build environment. Test the supplied package in a separate vault before trusting it with important notes.

## Known limitations / roadmap

- Markdown-style *local file links* (`[file](image.png)`) aren't rewritten; it targets `[[Wiki]]` links as requested.
- For pasting YouTube while editing prose, embedding isn't automatically forced into the middle of a paragraph.
- Non-YouTube external web pages aren't embedded as iframes.
- Automatic insert behavior can vary with other link-handling community plugins and Obsidian editor versions; test with your exact setup.
- Batch preview samples show changed lines, not a full structured diff.

Linker4Obsidian is independent of Obsidian and is not currently published in the Obsidian Community Plugins directory.
