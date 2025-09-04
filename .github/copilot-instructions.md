# mdui v2 — AI 开发助手速览

本仓库是一个使用 pnpm 的多包（monorepo）工程，核心是基于 Lit 的 Web Components 组件库。以下约定与流程能让你在本仓库快速、高效地工作。

## 架构与关键包

- packages/mdui：核心组件库（Lit，自定义元素，CSS/JS 分发）。
- packages/shared：内部公共代码与样式（mixin.less、装饰器、mixins、lit-styles）。
- packages/jq：轻量 jQuery 风格工具库（支持按需导入，链式原型方法）。
- packages/icons：Material Icons 每个图标一个组件文件（可按需导入）。
- packages/mcp：面向本仓库的 MCP 服务器（文档/组件/图标工具）。
- scripts/\*\*：统一的构建脚本（less→css、style.less→style.ts、CEM、i18n、IDE 数据、web-types、jsx-types）。

## 本地开发与构建

- 仅支持 pnpm（preinstall 会强制）；Node >= 22，pnpm >= 10；模块系统为 ESM。
- 开发：`pnpm dev`（先 build-dev 再并发启动 ts watch、样式 watch 与 Vite，自动打开 /demos/index.html）。
- 构建：`pnpm build`（clean、lint、build:jq/shared/mdui/icons，再 build:mcp）；打包发行：`pnpm bundle`（Rollup 生成 mdui.esm.js 与 mdui.global.js）。
- 测试：`pnpm test` 或分别运行 `pnpm test:mdui` / `pnpm test:jq`（@web/test-runner + Playwright；用例位于 packages/\*/\*\*/**test**）。

## 组件与样式约定（packages/mdui）

- 目录结构：`src/components/<name>/<name>.ts`（Lit 组件，@customElement('mdui-...')）；同目录可含 `style.less`。
- 样式流水线：`style.less` 经脚本生成同名 `style.ts`，导出变量名为文件名的 camelCase（示例：`style.less`→`style.ts` 导出 `style`；`button-style.less`→`buttonStyle`）。
- 全局 Less：`packages/shared/src/mixin.less` 会被自动拼接（NpmImportPlugin 支持 `~` 前缀导入）；生产构建会 autoprefix + 压缩，开发不压缩。
- 公有 API 与文档：公开属性/方法需带 JSDoc 注释；CEM 只收集 public 且能区分 attribute/property（见 scripts/common/build/component.ts）。
- 新增/修改组件后：先 `pnpm build:mdui-dev`（或 `pnpm dev`），若缺少 CEM 则运行 `pnpm customElements:mdui` 生成 `packages/mdui/custom-elements.json`。

## 文档、i18n 与 IDE 数据

- CEM 配置：`scripts/mdui/cem.js`（包含 components 与 shared/mixins，排除 style.ts/ripple）。
- 由 CEM 派生：
  - `pnpm i18n` 调用 `scripts/build-i18n.ts`，从 CEM 抽取文案；`docs/zh-cn.json` 为源，其他语言按 `packages/mdui/lit-localize.json` 目标列表生成/对齐。
  - `pnpm vscode:mdui` 产出 VSCode html-data（html-data.{en,zh-cn}.json）。
  - `pnpm webtypes:mdui` 产出 JetBrains Web Types（web-types.{en,zh-cn}.json）。
  - `pnpm jsxtypes:mdui` 产出 JSX 类型定义（jsx.{en,zh-cn}.d.ts）。

## Demos 与调试

- 开发服务器：Vite 配置位于 `scripts/vite.config.ts`，默认打开 `/demos/index.html`；组件示例在 `demos/components/*.html`。
- 组件更改时，`scripts/mdui/dev.ts` 会 watch `.less` 触发样式重建；`scripts/common/build/lit-js.ts` 在非 dev 模式压缩 HTML literals。

## icons 与 jq 使用模式

- icons：每个图标一个文件，按需导入并直接使用对应自定义元素，例如 `import '@mdui/icons/search.js'` + `<mdui-icon-search></mdui-icon-search>`。
- jq：树摇对原型方法无效，建议按需导入：先 `import { $ } from '@mdui/jq/$.js'`，再导入所需原型方法模块；或使用 `@mdui/jq/functions.js` 中的独立函数。

## MCP 开发（packages/mcp）

- 构建：`pnpm build:mcp`；运行 stdio 服务器：`node packages/mcp/stdio.js`。
- 若提示缺少 CEM，请先运行 `pnpm customElements:mdui` 生成 `packages/mdui/custom-elements.json`。

## 常见坑位

- 保持 ESM 与带扩展名的相对导入（脚本代码常用 `import './x.js'`）。
- `packages/shared/src/helpers/decorator.ts` 中的代码不要封装成函数，否则 CEM 无法识别（已有注释说明）。
- 仅使用 pnpm；提交前受 lint-staged 约束：`.less` 走 stylelint，`.ts` 走 eslint + prettier。

若以上说明有不清晰或缺少之处，请在具体开发场景中指出，我们会补充更贴近实际的工作流细节与示例。
