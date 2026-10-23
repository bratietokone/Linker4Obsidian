# 更新日志

**语言：** [English](CHANGELOG.md) | [Русский](CHANGELOG.ru.md) | [Español](CHANGELOG.es.md) | [简体中文](CHANGELOG.zh-CN.md)

这里记录 Linker4Obsidian 的重要更新。

## [0.3.0] - 2026-10-23

- 新增西班牙语和简体中文界面选项，并支持自动检测。
- 将四种语言的翻译拆分为 `src/locales/` 下具有类型检查的模块。
- 改用 esbuild 构建单个安装文件 `main.js`。
- 新增西班牙语和简体中文 README 与更新日志。
- 保持原有链接规则与已保存的语言设置兼容。

## [0.2.0] - 2026-10-23

- 新增自动、英语和俄语语言选择。
- 翻译设置、确认对话框、通知和命令名称。
- 新增英文及俄文 README，涵盖 Windows、macOS 和 Linux 安装。
- 保持与 0.1.0 设置兼容。
- 增加更新日志和 GitHub Release 安装包（ZIP 和独立文件）。
- 修复与 Obsidian API 类型定义的兼容问题。

## [0.1.0] - 2026-10-23

- 首个适用于桌面版 Obsidian 的工作版本。
- Markdown 笔记保留普通 Wiki 链接，支持的附件自动嵌入。
- 支持 YouTube、Shorts 和直播视频的链接嵌入。
- 可预览并确认当前笔记或整个库中的链接转换。
- 支持自定义文件扩展名规则。
