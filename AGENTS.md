# Repository Guidelines
# 仓库协作指南

## Project Structure & Module Organization
## 项目结构与模块组织

This repository currently centers on the `game/`, `content/`, `tests/`, `tools/`, `docs/`, and `skills/` directories. Keep gameplay runtime code under `game/src/`, place tests under `tests/`, store hand-authored or generated data in `content/`, and put reusable scripts in `tools/`. Mirror runtime modules in the test tree when possible, for example `game/src/world/worldRuntime.ts` with `tests/runtime/worldRuntime.test.ts`.
当前仓库主要围绕 `game/`、`content/`、`tests/`、`tools/`、`docs/` 和 `skills/` 目录组织。游戏运行时代码放在 `game/src/`，测试放在 `tests/`，手工或生成的数据放在 `content/`，可复用脚本放在 `tools/`。测试目录应尽量镜像运行时模块，例如 `game/src/world/worldRuntime.ts` 对应 `tests/runtime/worldRuntime.test.ts`。

## Build, Test, and Development Commands
## 构建、测试与开发命令

Use stable, documented entry points rather than ad hoc scripts:
优先使用稳定且已记录的入口命令，而不是临时脚本：

- `npm install`: install project dependencies.
- `npm install`：安装项目依赖。
- `npm run dev`: start the local Vite dev server.
- `npm run dev`：启动本地 Vite 开发服务器。
- `npm run check:content`: validate manual and generated content packs plus cross-file references.
- `npm run check:content`：校验手工和生成内容包及跨文件引用。
- `npm test`: run the Vitest suite once.
- `npm test`：运行一次 Vitest 测试套件。
- `npm run build`: type-check and create a production build in `dist/`.
- `npm run build`：执行类型检查并在 `dist/` 中生成生产构建。

Use `git status`, `git log --oneline`, and `rg --files` as the default quick inspection commands before making changes.
在开始修改前，默认使用 `git status`、`git log --oneline` 和 `rg --files` 做快速检查。

## Coding Style & Naming Conventions
## 编码风格与命名约定

Use UTF-8 text files and keep Markdown concise and readable. For new code, use 4-space indentation unless the language has a stronger convention. Prefer descriptive, lowercase directory and file names such as `content/manual/` or `tests/runtime/`. Keep modules focused and avoid mixing runtime logic, tooling, and content definitions in the same file.
使用 UTF-8 文本文件，并让 Markdown 保持简洁易读。新代码默认使用 4 空格缩进，除非所用语言有更强约定。目录和文件名优先使用描述性的小写命名，例如 `content/manual/` 或 `tests/runtime/`。模块应保持单一职责，避免把运行时逻辑、工具脚本和内容定义混在同一个文件中。

## Testing Guidelines
## 测试要求

Add tests alongside any non-trivial feature or bug fix. Keep test names explicit, such as `test_<feature>.py` or `<feature>.test.ts`, and prefer fast, repeatable tests that can run locally before opening a pull request.
任何非平凡功能或缺陷修复都应同时补充测试。测试命名要明确，例如 `test_<feature>.py` 或 `<feature>.test.ts`，并优先保证测试可以在本地快速、稳定、可重复运行。

## Commit & Pull Request Guidelines
## 提交与 Pull Request 规范

Use short, imperative commit messages such as `Add map loader`, `Document save format`, or `Fix battle state reset`. Keep each commit scoped to one logical change.
提交信息应简短、使用祈使句，例如 `Add map loader`、`Document save format` 或 `Fix battle state reset`。每次提交只处理一个逻辑变更。

When working through a multi-step task, commit and push each completed step to GitHub instead of waiting until the very end.
处理多步骤任务时，每完成一个明确步骤，都要立即提交并推送到 GitHub，而不是等到全部结束后再统一提交。

Pull requests should include a brief description, note any setup or migration steps, and link related issues when available. If a change affects visuals, gameplay flow, or generated assets, include screenshots or sample output.
Pull Request 应包含简要说明、必要的环境准备或迁移步骤，并在有对应 issue 时附上链接。如果改动影响画面、流程或生成资产，应附上截图或示例输出。

## Documentation Expectations
## 文档要求

Update `README.md` and this file when you introduce new directories, commands, or contributor workflows. Repository documentation should describe the current committed state, not a plan that has not been implemented yet.
当你引入新的目录、命令或协作流程时，要同步更新 `README.md` 和本文件。仓库文档应描述当前已经提交的真实状态，而不是尚未落地的计划。

Code comments, documentation, and `README.md` content should be written bilingually in English and Chinese whenever they are added or updated.
代码注释、项目文档以及 `README.md` 的新增或更新内容都应使用英文和中文双语编写。

## Implementation Rules
## 实施规则

Prefer preserving layering and data-driven design over quick hardcoded solutions.
优先维护分层和数据驱动设计，不为了速度把逻辑硬编码进去。

After each change, check whether the change breaks directory responsibilities, introduces an unvalidated data format, or places story logic directly in a scene.
每次改动后，都要检查是否破坏目录职责、是否引入了未校验的数据格式、以及是否把剧情逻辑直接写进了 scene。

When adding a new content format, update schema and validation in the same change.
新增内容格式时，必须在同一次改动里同步更新 schema 和校验逻辑。

When adding a key feature, include at least a minimal automated test or a reproducible verification script.
新增关键功能时，至少补一个最小自动化测试或可复现的验证脚本。

Prefer small, scoped commits and avoid unrelated refactors.
尽量保持小步、范围明确的提交，避免顺手做无关重构。

In responses, present what changed, why it changed, and how it was verified before listing run commands.
输出时先说明改了什么、为什么这么改、如何验证，再给运行命令。
