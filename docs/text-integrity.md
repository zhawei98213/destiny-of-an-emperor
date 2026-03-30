# Text Integrity
# 文本完整性

## Goal
## 目标

Keep imported real dialogue maintainable by treating text as structured content instead of loose strings hidden in UI code.
把导入后的真实对白当作结构化内容维护，而不是把零散字符串藏在 UI 代码里。

This document defines:
本文定义：

- where dialogue text should live
- 对话文本应该放在哪里
- what the text integrity checker validates
- 文本完整性检查器会验证什么
- how chapter-level text coverage is measured
- 如何统计章节级文本覆盖
- how demo text and real text are compared
- 如何比较 demo 文本与真实文本
- which metadata is reserved for future language and revision workflows
- 为未来多语言和文本修订预留了哪些元数据

## Text Source Rules
## 文本来源规则

- Dialogue text must stay in event DSL data or text tables.
- 对话文本必须保留在事件 DSL 数据或文本表里。
- Do not hardcode real dialogue into `dialogueBox`, `shopOverlay`, scene code, or other UI components.
- 不要把真实对白硬编码进 `dialogueBox`、`shopOverlay`、scene 代码或其他 UI 组件。
- Event steps may reference text by `lineId`, but they must not inline final real dialogue strings in scene logic.
- 事件步骤可以通过 `lineId` 引用文本，但不能在 scene 逻辑里内联最终真实对白。
- Current runtime-facing text lives in `content/manual/story.content.json`.
- 当前运行时可消费的文本位于 `content/manual/story.content.json`。
- Raw imported or demo text sources should stay under `content/source/text/`.
- 原始导入文本或 demo 文本源应保留在 `content/source/text/`。

## Integrity Checks
## 完整性检查

`npm run text-check` currently validates:
`npm run text-check` 当前会验证：

1. empty dialogue text
1. 空对白文本
2. duplicate dialogue keys
2. 重复对白 key
3. missing `speakerName` metadata
3. 缺失 `speakerName` 元数据
4. missing `portraitId` metadata
4. 缺失 `portraitId` 元数据
5. missing `styleId` metadata
5. 缺失 `styleId` 元数据
6. event steps that reference a non-existent `lineId`
6. 事件步骤引用了不存在的 `lineId`

The current checker is intentionally stricter than runtime requirements.
当前检查器故意比运行时要求更严格。

For example:
例如：

- a line may still render without `portraitId`
- 某些对白即使缺少 `portraitId` 也可能仍能显示
- but the checker will still report that metadata gap as a maintainability warning
- 但检查器仍会把这种元数据缺口报告为可维护性 warning

## Chapter Coverage
## 章节覆盖统计

The checker builds chapter-level coverage by:
检查器会按以下方式计算章节覆盖：

1. reading chapter ownership from `content/manual/chapters/*.json`
1. 从 `content/manual/chapters/*.json` 读取章节归属
2. collecting `eventId` ownership for each chapter
2. 收集每章拥有的 `eventId`
3. recursively tracing `dialogue` steps to the referenced `lineId`
3. 递归追踪 `dialogue` 步骤所引用的 `lineId`
4. reporting how many referenced lines resolve to real manual text
4. 报告这些引用里有多少能解析到真实 manual 文本

This makes it possible to answer:
这样就能回答：

- which chapter actually owns which lines
- 哪个章节实际拥有了哪些对白
- whether a chapter event batch is still missing dialogue lines
- 某个章节事件批次是否仍缺对白
- whether dialogue drift is a data problem or a runtime problem
- 对话漂移到底是数据问题还是运行时问题

## Demo vs Real Ratio
## Demo 与真实文本占比

The report tracks two explicit buckets:
报告会跟踪两个明确桶位：

- `demo text`: dialogue lines from `content/source/text/demo-text.source.json`
- `demo text`：来自 `content/source/text/demo-text.source.json` 的对白
- `real text`: manual dialogue lines that are referenced by real chapter events
- `real text`：被真实章节事件引用的 manual 对白

Any manual lines not yet owned by a chapter are counted separately as `uncategorized manual lines`.
任何尚未被章节归属到的 manual 对白会单独计为 `uncategorized manual lines`。

This ratio is not a literary quality score.
这个占比不是文案质量评分。

It is a maintenance signal that shows how much of the active text layer is still demo-oriented versus chapter-owned real content.
它是一个维护信号，用来显示当前活跃文本层里还有多少仍偏向 demo，多少已经进入章节归属的真实内容。

## Future-Proof Metadata
## 预留的未来元数据

The current tool already recognizes these optional dialogue metadata fields:
当前工具已经识别以下可选对白元数据字段：

- `styleId`
- `locale`
- `revisionTag`

They are not runtime-critical yet, but they reserve clear structure for:
它们目前还不是运行时强依赖，但已经为以下方向预留了明确结构：

- multiple language variants
- 多语言版本
- text tone or UI presentation styles
- 文本语气或 UI 展示风格
- revision tracking when real scripts are corrected
- 真实脚本修订时的版本追踪

The checker currently warns when `styleId` is missing so the project can gradually converge toward explicit dialogue presentation metadata.
检查器当前会在缺少 `styleId` 时给出 warning，目的是让项目逐步收敛到显式的对白展示元数据结构。

## Outputs
## 输出产物

`npm run text-check` writes:
`npm run text-check` 会生成：

- `reports/text-integrity/latest/report.json`
- `reports/text-integrity/latest/summary.md`

These outputs are intended for both human review and Codex follow-up repair tasks.
这些输出既面向人工审查，也面向 Codex 后续修复任务。

## Current Baseline
## 当前基线

At the current repository stage:
在当前仓库阶段：

- all three imported real chapters already produce chapter-level text coverage
- 三个已导入真实章节都已经能产出章节级文本覆盖统计
- real text currently outweighs demo text in the report
- 当前报告里真实文本已经明显高于 demo 文本
- the main remaining integrity warnings are metadata-oriented, especially missing `styleId`
- 当前主要剩余 warning 是元数据层面的，尤其是缺少 `styleId`

This is acceptable for the current phase because the project is still building text governance before full script replacement.
这在当前阶段是可接受的，因为项目还处在“先建立文本治理能力，再逐步替换真实脚本”的阶段。
