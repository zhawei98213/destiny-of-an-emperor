# Codex Repository Rules
# Codex 仓库规则

## Scope
## 作用范围

This file is the default working contract for Codex in this repository.
这个文件是 Codex 在本仓库中的默认工作约束。

Follow it before making code, content, tooling, or documentation changes.
在修改代码、内容、工具或文档之前，先遵守这里的规则。

## Repository Structure
## 仓库结构

- `game/`: runtime code only. Scenes, systems, UI, battle, world, and content loading live here.
- `game/`：只放运行时代码。scene、system、UI、battle、world 和内容加载都在这里。
- `docs/`: project constraints, architecture notes, migration notes, and workflow docs.
- `docs/`：项目约束、架构说明、迁移说明和工作流文档。
- `tools/`: importers, validators, and reproducible content pipeline scripts.
- `tools/`：导入器、校验器和可重复执行的内容管线脚本。
- `content/source/`: raw upstream or extracted inputs for import tools.
- `content/source/`：导入工具使用的原始上游或提取输入。
- `content/generated/`: tool-generated outputs. Runtime may read listed content packs here.
- `content/generated/`：工具生成输出。运行时可以读取这里被 manifest 列出的内容包。
- `content/manual/`: hand-authored or hand-corrected runtime content.
- `content/manual/`：手工编写或人工修正的运行时内容。
- `content/reference/`: traceable screenshots, crops, and other non-runtime reference inputs used for parity and asset reconstruction.
- `content/reference/`：用于一致性核对和资产重建的可追溯截图、裁切图等非运行时参考输入。
- `tests/`: automated tests for runtime, content, scenes, and tooling behavior.
- `tests/`：运行时、内容、场景和工具行为的自动化测试。
- `skills/`: repository-specific Codex workflows and reusable instructions.
- `skills/`：仓库专用的 Codex 工作流和可复用说明。

## Content Boundaries
## 内容边界

- `source -> tools -> generated` is the only valid path for real imported content.
- `source -> tools -> generated` 是真实导入内容的唯一合法路径。
- Do not load `content/source/` directly in the game runtime.
- 不要让游戏运行时直接读取 `content/source/`。
- Do not hand-edit `content/generated/`.
- 不要手工修改 `content/generated/`。
- Put hand fixes and editorial overrides in `content/manual/`.
- 人工修正和编辑性覆盖内容放在 `content/manual/`。
- `game/` must read only final consumable content from manifest-listed manual/generated packs.
- `game/` 只能读取 manifest 列出的 manual/generated 最终可消费内容。
- Do not use `content/reference/` as runtime assets or scene-local shortcuts.
- 不得把 `content/reference/` 当成运行时资源或 scene 局部捷径使用。

## Common Commands
## 常用命令

- `npm run dev`: run the local game build.
- `npm run dev`：启动本地游戏。
- `npm run build`: type-check and create the production build.
- `npm run build`：类型检查并生成生产构建。
- `npm run test`: run the full automated test suite.
- `npm run test`：运行完整自动化测试。
- `npm run import-all`: regenerate generated content from source inputs.
- `npm run import-all`：从 source 输入重新生成 generated 内容。
- `npm run validate-content`: verify generated outputs and validate runtime content.
- `npm run validate-content`：检查 generated 输出并校验运行时内容。
- `npm run regression-smoke`: run import, validation, and the minimum regression suite.
- `npm run regression-smoke`：执行导入、校验和最小回归测试链路。
- `.github/workflows/ci.yml`: mirrors the minimum repository checks on push and pull request.
- `.github/workflows/ci.yml`：在 push 和 pull request 上镜像仓库最小校验链路。
- `npm run battle-parity`: generate the current real-battle parity calibration report.
- `npm run battle-parity`：生成当前真实战斗一致性校准报告。
- `npm run event-json`: lint event JSON structure and report formatting drift.
- `npm run event-json`：检查事件 JSON 结构并报告格式化漂移。
- `npm run format:events`: rewrite `content/manual/story.content.json` into stable formatting.
- `npm run format:events`：把 `content/manual/story.content.json` 重写成稳定格式。
- `npm run check:npc-placement`: verify manual NPC coordinates against collision and map landmarks.
- `npm run check:npc-placement`：校验 manual NPC 坐标与碰撞层和地图锚点的关系。
- `npm run check:chapter-completeness`: compare chapter metadata ownership against currently reachable content.
- `npm run check:chapter-completeness`：把章节元数据归属与当前可达内容做对照。
- `npm run chapter-bootstrap -- --id <chapter-id> --title "<title>" --area "<area>"`: create a new chapter scaffold from the repository templates.
- `npm run chapter-bootstrap -- --id <chapter-id> --title "<title>" --area "<area>"`：基于仓库模板创建新的章节骨架。
- `npm run chapter-status-report`: summarize chapter import status from metadata, completeness, parity, regression, and UI parity evidence.
- `npm run chapter-status-report`：基于元数据、completeness、parity、regression 和 UI parity 证据汇总章节导入状态。
- `npm run chapter-lock-checklist -- --id <chapter-id>`: generate a chapter lock checklist for review.
- `npm run chapter-lock-checklist -- --id <chapter-id>`：生成供审查使用的章节锁定清单。
- `npm run asset-check`: generate the current asset parity report for imported chapters.
- `npm run asset-check`：为已导入章节生成当前资产一致性报告。
- `npm run reference-validate`: validate the reference manifest and write the current reference report.
- `npm run reference-validate`：校验参考资料 manifest，并输出当前 reference 报告。
- `npm run reference-query -- --subject-type <type> --subject-id <id>`: query indexed references for one map, NPC, UI element, shop, enemy, or battle subject.
- `npm run reference-query -- --subject-type <type> --subject-id <id>`：按地图、NPC、UI 元素、商店、敌人或战斗对象查询已索引的参考资料。
- `npm run text-check`: generate the current text integrity report for imported chapters.
- `npm run text-check`：为已导入章节生成当前文本完整性报告。
- `npm run performance-baseline`: generate the current runtime performance baseline report.
- `npm run performance-baseline`：生成当前运行时性能基线报告。
- `npm run ui-parity`: generate the current UI parity report for imported chapter scenes.
- `npm run ui-parity`：为已导入章节场景生成当前 UI 一致性报告。
- `npm run save-migration-check`: run the dedicated save compatibility and migration regression tests.
- `npm run save-migration-check`：执行专门的存档兼容性与迁移回归测试。
- `npm run pre-release-check -- --mode light|full`: run one release-facing command that summarizes whether the repo is fit for continued importing or beta-test release.
- `npm run pre-release-check -- --mode light|full`：执行统一的发布前检查命令，并汇总仓库当前是否适合继续导入或发布测试版。

## Hard Rules
## 强制规则

- Do not hardcode story logic in scenes.
- 不得把剧情逻辑写死在 scene。
- Story and dialogue content should default to Simplified Chinese unless a task explicitly requires another language.
- 剧情和对话内容默认使用简体中文，除非任务明确要求使用其他语言。
- Do not hand-edit generated content.
- 不得手工修改 generated 内容。
- Every new data format must ship with schema and validation.
- 新增数据格式必须同时补 schema 和校验。
- Every new opcode must ship with tests.
- 新增 opcode 必须同时补测试。
- Any real content import must go through `source -> tools -> generated`.
- 任何真实内容导入都必须先走 `source -> tools -> generated`。
- If save structure changes, document the compatibility strategy in the same change.
- 如果修改存档结构，必须在同一次改动里说明兼容策略。
- If content-facing UI behavior changes, extend regression `expectedUi` instead of validating only state.
- 如果面向内容核对的 UI 行为发生变化，应扩展回归里的 `expectedUi`，不要只校验状态字段。

## Definition Of Done
## 完成定义

After a meaningful change, run at least the commands that match the risk:
每次有实际意义的改动后，至少运行与风险匹配的命令：

- Content or importer change: `npm run import-all` and `npm run validate-content`
- 内容或导入器改动：`npm run import-all` 和 `npm run validate-content`
- Runtime or scene change: `npm run test`
- 运行时或 scene 改动：`npm run test`
- Cross-cutting or release-shaping change: `npm run regression-smoke`
- 跨模块或接近发布的改动：`npm run regression-smoke`
- SaveData or compatibility change: `npm run save-migration-check`
- SaveData 或兼容性改动：`npm run save-migration-check`
- Battle tuning or battle-facing content change: `npm run battle-parity`
- 战斗调参或战斗相关内容改动：`npm run battle-parity`
- Build-affecting change: `npm run build`
- 可能影响构建的改动：`npm run build`
- Performance-sensitive change: `npm run performance-baseline`
- 涉及性能敏感路径的改动：`npm run performance-baseline`
- UI-flow or player-facing overlay change: `npm run ui-parity`
- 涉及 UI 流程或玩家可见 overlay 的改动：`npm run ui-parity`
- Before a beta-test handoff or any release-style checkpoint: `npm run pre-release-check -- --mode full`
- 在测试版移交或任何接近发布的检查点之前：执行 `npm run pre-release-check -- --mode full`
- CI should stay aligned with these same checks instead of inventing a separate heavier path.
- CI 应保持与这些相同的校验链路一致，不要额外发明一条更重的独立流程。

When reporting results, always explain in this order:
输出结果时，始终按以下顺序说明：

1. what changed
1. 改了什么
2. why it changed
2. 为什么这么改
3. how it was verified
3. 如何验证
4. commands run
4. 运行命令

## Codex Collaboration Rules
## Codex 协作规则

- Prefer small, reviewable changes.
- 优先做小步、可审查的改动。
- Avoid unrelated refactors.
- 避免无关重构。
- Prioritize fixes that unblock future importing and real content replacement.
- 优先修复会阻塞后续导入和真实内容替换的问题。
- Keep README, docs, scripts, and AGENTS consistent with the committed codebase.
- 保持 README、docs、scripts 和 AGENTS 与已提交代码一致。
- If a rule here conflicts with the current code, update the code or the docs in the same task. Do not leave drift behind.
- 如果这里的规则与当前代码冲突，就在同一任务里更新代码或文档，不要留下漂移状态。
