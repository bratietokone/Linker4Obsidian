# Changelog

**Language:** [English](CHANGELOG.md) | [Русский](CHANGELOG.ru.md) | [Español](CHANGELOG.es.md) | [简体中文](CHANGELOG.zh-CN.md)

All notable changes to Linker4Obsidian are documented here.

## [Unreleased]

- In development: external file and folder links in Markdown (`file:///`) and Wiki (`external:`) formats, with a separate settings page and new insert commands.

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
