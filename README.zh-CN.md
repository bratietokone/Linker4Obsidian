# Linker

**文档语言：** [English](README.md) | [Русский](README.ru.md) | [Español](README.es.md) | [简体中文](README.zh-CN.md)

Linker 是适用于桌面版 [Obsidian](https://obsidian.md/) 的社区插件。它让 Markdown 笔记保持为普通 Wiki 链接，同时根据规则自动嵌入受支持的附件；还可以将单独的 YouTube 视频网址转换为嵌入式播放器。

**版本：** 0.5.1 · **状态：** 已收录于 Obsidian 社区插件目录 · **要求：** Windows、macOS、Linux 桌面版 Obsidian 1.8.7 或更新版本。

## 功能

- Markdown 笔记保持 `[[笔记.md]]`，图片、PDF、音频和视频等附件按规则转换为 `![[文件.ext]]`。
- 自动处理新输入、粘贴或使用 `[[` 自动补全创建的 Wiki 链接。
- 将单独的 YouTube 视频网址（包括 Shorts 和 `/live/`）转换为 `![](URL)`。
- 批量转换当前笔记或整个库中的已有链接前，会先预览并要求确认。
- 界面支持自动（跟随 Obsidian）、English、Русский、Español 和简体中文。
- 无需账号或外部服务，不会将笔记库内容发送到服务器。

- **外部文件与文件夹：** 创建 Markdown `file:///` 或 Wiki `[[external:...]]` 链接，无需将文件复制进笔记库。

> **从 Linker4Obsidian 0.4.0 或更早版本迁移：**插件 ID 从 `linker4obsidian` 改为 `linker`。禁用旧插件，把 Linker 0.5.0 或更高版本安装在 `.obsidian/plugins/linker/`；如需保留设置，可复制原来的 `data.json`。确认新版本正常运行后再删除旧文件夹。

**文件系统访问与隐私：**外部链接功能仅供桌面端使用。用户选择或点击外部文件或文件夹链接时，插件通过 Node.js 检查指定本地路径的元数据，并通过 Electron 请求操作系统打开或显示该对象。访问笔记库外路径仅用于此功能。插件不会读取或上传外部文件内容，也不会上传笔记或收集遥测数据。

## 安装（Windows、macOS 和 Linux）

> 批量转换链接或测试开发版本之前，请先备份笔记库。

### 在 Obsidian 中安装（推荐）

1. 打开 **设置 → 第三方插件（Community plugins）→ 浏览（Browse）**。
2. 搜索 **Linker**（作者：**bratietokone**），或访问 [Linker 插件页面](https://obsidian.md/plugins?id=linker)。
3. 点击 **安装**，然后 **启用**。在 **设置 → Linker** 中选择界面语言和链接规则。

此方式适用于 Windows、macOS、Linux，并可通过社区插件机制接收正式更新。**正常安装不需要手动下载文件。**

### 手动安装（高级用法与本地测试）

要测试指定 GitHub 版本或开发分支构建：

1. 从 [GitHub Releases](https://github.com/bratietokone/Linker4Obsidian/releases) 或对应分支的 CI 构建产物获取 `main.js` 和 `manifest.json`。**0.5.1 仅提供两个独立文件，不提供 ZIP 安装包**；部分旧版本提供 ZIP。
2. 找到 **Obsidian 笔记库目录**（不是应用安装目录），在其中创建 `.obsidian/plugins/linker/`。
3. 将两个文件放入对应目录：

   ```text
   YourVault/
   └── .obsidian/
       └── plugins/
           └── linker/
               ├── main.js
               └── manifest.json
   ```

4. 重启 Obsidian 或重新加载社区插件，并启用 **Linker**。

使用开发构建替换稳定版之前，请先备份笔记库和 `data.json`。正式发布需要通过本地测试。

### 显示隐藏文件夹

| 系统 | 示例路径 | 显示隐藏文件 |
| --- | --- | --- |
| Windows | `C:\\Users\\<用户名>\\Documents\\MyVault\\.obsidian\\plugins\\linker\\` | 文件资源管理器：查看 → 显示 → 隐藏的项目。 |
| macOS | `/Users/<用户名>/Documents/MyVault/.obsidian/plugins/linker/` | Finder：**Cmd+Shift+.** |
| Linux | `/home/<用户名>/Documents/MyVault/.obsidian/plugins/linker/` | 文件管理器：**Ctrl+H**。 |

以上仅为示例，笔记库可以放在任何位置。请勿多创建一层 `linker/linker/`。

## 界面语言

在 **设置 → Linker → 界面语言** 中选择 **自动**、**English**、**Русский**、**Español** 或 **简体中文**。自动模式会跟随受支持的 Obsidian 界面语言，其他语言使用英语作为默认回退。

切换后设置、通知及对话框立即更新，命令面板中的名称需要重新加载插件才能更新。

## 默认链接规则

| 内容 | 结果 |
| --- | --- |
| Markdown 笔记（`.md`、`.markdown`） | `[[Notes/我的笔记.md]]` |
| 图片（`.png`、`.jpg`、`.webp` 等） | `![[图片.webp]]` |
| PDF 文件 | `![[文档.pdf]]` |
| 本地视频 | `![[视频.mp4]]` |
| 本地音频 | `![[音频.mp3]]` |
| 其他扩展名 | `[[压缩包.zip]]` |
| 独立的 YouTube 视频 URL | `![](https://www.youtube.com/watch?v=VIDEO_ID)` |
| 其他网站 URL | 保持普通链接 |

可以自定义文件类型和扩展名。**始终保留链接** 的优先级高于 **始终嵌入**。附件能否预览取决于 Obsidian 是否支持该格式。

## 外部文件与文件夹

在 **设置 → Linker → 外部文件与文件夹** 中，有独立的设置页面。可以启用外部链接，并选择新链接使用 Markdown 或 Wiki 格式；两种格式均可打开。

```markdown
[项目](<file:///home/user/Projects/>)
[报告](<file:///home/user/Documents/report.pdf>)

[[external:/home/user/Projects/|项目]]
[[external:/home/user/Documents/report.pdf|报告]]
```

通过命令面板中的 **插入外部文件链接** 或 **插入外部文件夹链接** 选择文件或文件夹。可以使用系统文件选择器（如可用），也可以手动输入绝对路径，并修改链接名称。

在阅读模式或 Live Preview 中点击链接，会使用默认应用或文件管理器打开；也可以在设置中选择仅显示目标所在位置。可执行文件不会由该功能直接运行。无效或不存在的路径会显示提示。暂不支持远程文件主机或其他 URI 协议。

**注意：** 不会复制或嵌入外部文件，也不会修改现有附件规则。

## 使用方法

- **新链接：** 输入 `[[...]]` 或通过自动补全选择文件。
- **拖拽和粘贴附件：** Obsidian 负责附件管理，插件则在生成 Wiki 链接后应用相应规则。
- **YouTube：** 在合适的单独一行粘贴视频网址即可嵌入播放器。
- **已有笔记：** 使用命令面板（`Ctrl+P` / `Cmd+P`），先预览，再转换当前笔记或整个库中的链接。

插件不会撤销用户主动创建的嵌入内容，会跳过代码块、行内代码、YAML 前置元数据及包含 HTML 注释的行。**批量转换前请备份笔记库。**

## 限制

- 外部路径必须为绝对路径，因设备而异；Flatpak 等沙箱环境可能限制访问。
- 仅支持 **桌面版 Obsidian**。
- 不会嵌入只有播放列表的链接或其他网站的内容。
- 不会将 `[文件](图片.png)` 这样的普通 Markdown 文件链接转换为 Wiki 嵌入。
- 已有链接需要通过命令转换；其他插件可能影响编辑器的链接插入行为。

## 开发

需要 Node.js 和 npm。TypeScript 源码位于 `src/`，本地化文件位于 `src/locales/`，使用 esbuild 在构建时生成 `main.js`；该文件不提交至 Git，而是由 GitHub Actions 自动附加到 Release。

```bash
npm ci
npm run validate
npm run typecheck
npm run lint
npm run build
npm test
```

GitHub Actions 会执行相同的检查。

## 开发与发布审批流程

**当前稳定版本为 0.5.1。** 规划中的功能不代表已经发布。

1. **每个开发阶段开始前均需详细讨论**范围、风险、验收标准及回归测试方案。
2. 在**独立 Git 分支和 Pull Request** 中开发。执行 `npm ci`、`npm run validate`、`npm run typecheck`、`npm run lint`、`npm run build`、`npm test`。CI 还会检查构建是否可重现，并提供测试安装产物。
3. 维护者**在自己的电脑上使用桌面版 Obsidian 进行本地测试**，必要时从源码自行构建，并检查链接、附件、YouTube 和设置的回归情况。发现问题先修复后复测。
4. **只有获得明确的发布批准后**，才将 `manifest.json` 和 `package.json` 更新为商定的 `X.Y.Z` 版本，并同步更新各语言 CHANGELOG。将新版号提交到 `main` 会自动触发发布，因此批准前不得修改版本号。
5. [Publish Linker release 工作流](https://github.com/bratietokone/Linker4Obsidian/actions/workflows/release.yml) 会执行校验、构建、测试、构建证明并发布 GitHub Release `X.Y.Z`（不加 `v`），附带 `main.js` 与 `manifest.json`。生成文件不提交 Git；已经发布的版本不会被覆盖。

**CI 成功不等于允许发布。** 测试分支不得直接发布；每个新阶段开始前都需重新讨论。

## 后续设想（0.5.1 尚未实现）

- **兼容性与代码质量：** 处理 [Obsidian Community 审查警告（Issue #9）](https://github.com/bratietokone/Linker4Obsidian/issues/9)，同时保持外部路径安全和 Obsidian 1.8.7+ 兼容性。
- **附件审计：** 设计独立的扫描和报告模块，识别可能未被引用的附件，提供预览与排除规则。初始版本**只读，不删除文件**。
- **以后再考虑清理：** 经单独讨论和本地测试后，才考虑将用户明确选择的文件移动到回收站。不计划自动删除或永久删除。

以上仅为建议，**不是已实现的功能或已确定的发布时间表**。

## 相关链接

- [版本发布](https://github.com/bratietokone/Linker4Obsidian/releases)
- [更新日志](CHANGELOG.zh-CN.md)
- [项目仓库](https://github.com/bratietokone/Linker4Obsidian)
- [问题反馈与建议](https://github.com/bratietokone/Linker4Obsidian/issues)
- [许可证](LICENSE)

本项目是独立社区项目，与 Obsidian 官方无关联。
