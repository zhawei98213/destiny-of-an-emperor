# UI Parity
# UI 一致性

## Goal
## 目标

Track whether the visible UI behavior is moving toward the target JRPG experience, not just whether the feature works.
跟踪可见 UI 行为是否在逐步接近目标 JRPG 体验，而不只是“功能能用”。

This current stage prioritizes behavior parity over final art polish.
当前阶段优先关注行为一致性，而不是最终美术完成度。

## Covered Areas
## 覆盖范围

`npm run ui-parity` currently checks:
`npm run ui-parity` 当前检查：

- dialogue box open and close timing
- 对话框打开与关闭时机
- typewriter reveal and skip behavior
- 逐字显示与跳过行为
- menu toggle and state sync
- 菜单开关与状态同步
- shop interaction flow
- 商店交互流程
- battle command selection flow
- 战斗指令选择流程
- save entry behavior
- 存档入口行为

## Real Scene Focus
## 真实场景对照

The current report uses at least one real imported chapter scene instead of only demo-only checks.
当前报告至少使用一个真实导入章节场景，而不是只做 demo 检查。

Current focus scenes:
当前对照场景：

- `chapter-01-lou-sang / town`
  dialogue, menu, shop, and save loop
- `chapter-01-lou-sang / town`
  对话、菜单、商店和存档闭环
- `chapter-03-river-ford / river-ford`
  battle entry and command loop
- `chapter-03-river-ford / river-ford`
  战斗进入与指令闭环

## Report Output
## 报告输出

- `reports/ui-parity/latest/summary.md`
  human-readable case summary with expected, actual, and difference sections
- `reports/ui-parity/latest/summary.md`
  适合人工审查的条目摘要，包含预期、实际和差异小节
- `reports/ui-parity/latest/report.json`
  machine-readable structured UI parity report for future repair loops
- `reports/ui-parity/latest/report.json`
  供后续修复循环读取的结构化 UI 一致性报告

## Current Interpretation
## 当前解读方式

Each case records:
每个条目记录：

- locator fields such as `chapterId`, `mapId`, `triggerId`, `eventId`, and `npcId`
- `chapterId`、`mapId`、`triggerId`、`eventId`、`npcId` 等定位字段
- expected behavior
- 预期行为
- actual current behavior
- 当前实际行为
- explicit differences
- 明确差异
- suggested repair targets
- 建议修复位置

Cases can be `matched` or `diverged`.
条目会标记为 `matched` 或 `diverged`。

## Triage Integration
## 与 Triage 的接线

UI differences are not meant to sit in a separate report forever.
UI 差异不应该永远停留在单独报告里。

`npm run discrepancy-triage` reads `reports/ui-parity/latest/report.json` when available and turns diverged UI cases into repair backlog items.
`npm run discrepancy-triage` 会在可用时读取 `reports/ui-parity/latest/report.json`，并把存在偏差的 UI 条目转成修复 backlog。

Current priority policy:
当前优先级策略：

- `P1`
  main-flow UI gaps that block chapter feel calibration, such as shop flow or battle command flow
- `P1`
  会阻塞章节体验校准的主流程 UI 缺口，例如商店流程或战斗指令流程
- `P2`
  important but still playable loop gaps, such as save entry discoverability
- `P2`
  重要但仍可玩的流程缺口，例如存档入口可发现性
- `P3`
  presentation-only detail gaps once core loop behavior is already stable
- `P3`
  当核心流程已经稳定后，纯表现层细节缺口

## Non-Goals
## 非目标

- Do not chase final art or exact panel styling in this stage.
- 这个阶段不追求最终美术或完全一致的面板样式。
- Do not hardcode real dialogue or shop behavior into UI components.
- 不要把真实对白或商店行为写死进 UI 组件。
- Keep behavior definitions in runtime, event DSL, and content data.
- 行为定义应继续留在 runtime、事件 DSL 和内容数据里。
