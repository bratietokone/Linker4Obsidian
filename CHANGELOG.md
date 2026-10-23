# Changelog

**Language:** [English](CHANGELOG.md) | [Русский](CHANGELOG.ru.md) | [Español](CHANGELOG.es.md) | [简体中文](CHANGELOG.zh-CN.md)

All notable changes to Linker4Obsidian are documented here.

## [0.5.1] - 2026-10-23

- Resolved the Obsidian Community source-review crash caused by a DOM event callback matching a buggy sample-code lint rule.
- Updated settings section headings to use the supported Obsidian `Setting.setHeading()` API.
- Switched to reproducible npm lockfile builds, expanded lint checks, and generated release artifacts through GitHub Actions.
- Added GitHub artifact attestations and removed the unsupported ZIP release asset.
- No changes to link-conversion behavior.

## [0.5.0] - 2026-10-23

- Prepared for submission to the Obsidian Community directory as **Linker**.
- Changed the plugin ID from `linker4obsidian` to `linker` to meet directory rules. Existing installations require manual migration.
- Aligned version metadata and added automated manifest validation.
- Updated GitHub Actions to prepare draft releases from version tags like `0.5.0` (without `v`).
- Link processing behavior is unchanged.

## [0.4.0] - 2026-10-23

- Added links to files and folders outside the vault in both Markdown (`file:///`) and Wiki (`[[external:...|name]]`) formats.
- Added separate **External files and folders** settings page with configurable default link format and open/reveal behavior.
- Added commands to insert external file and folder links, with a file picker and manual path entry.
- Added opening of external targets in the system default application or file manager, with missing-path warnings and safe handling of executable files.
- Kept internal vault attachment, Wiki-link and YouTube behaviors unchanged. UI and documentation support all four languages.

## [0.3.0] - 2026-10-23

- Added Spanish and Simplified Chinese interface translations and automatic locale detection.
- Extracted all translations into type-checked `src/locales/` modules.
- Introduced esbuild to package all locale modules into one installable `main.js`.
- Added Spanish and Simplified Chinese README and CHANGELOG files.
- Preserved existing link rules and language settings.

## [0.2.0] - 2026-10-23

- Added selectable UI language: Automatic (follows Obsidian), English, and Russian.
- Translated settings, conversion dialogs, notifications, and command names.
- Added English and Russian README files, with universal installation instructions for Windows, macOS, and Linux.
- Retained existing link-processing behavior and settings compatibility with 0.1.0.
- Added a formal changelog and GitHub release packaging (including a ZIP and individual plugin files).
- Fixed TypeScript editor command signature compatibility with the Obsidian API.

## [0.1.0] - 2026-10-23

- Initial working version of Linker4Obsidian for desktop Obsidian.
- Ordinary Wiki-links for Markdown notes; automatic embeds for supported attachments.
- YouTube URL embedding, including Shorts and live video links.
- Preview-and-confirm commands for converting links in the current note or the whole vault.
- Configurable link rules and extension overrides.
