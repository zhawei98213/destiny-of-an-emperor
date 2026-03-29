---
name: real-event-import
description: Import one bounded batch of real remake events into the existing trigger/event DSL, keeping triggers and events separate and updating parity plus regression together. / 把一批边界清晰的真实复刻事件导入现有 trigger/event DSL，保持 trigger 与 event 分离，并同步更新 parity 与回归。
---

## 使用边界
## Scope

- Use this skill when the task is about real NPC, tile, or region events entering the content DSL.
- 当任务是把真实 NPC、tile 或 region 事件接入内容 DSL 时，使用这个 skill。
- Use it for guard checks, chest events, map exits, shop interactions, and similar event slices.
- 它适用于门卫检查、宝箱事件、地图出口、商店交互这类事件切片。
- Do not use it for pure map geometry import or for runtime defect repair with no content change.
- 不要把它用于纯地图几何导入，或没有内容变更的纯 runtime 修复。

## 标准步骤
## Standard Steps

1. Define the event batch boundary before editing: which triggers, which events, and which flags/items/shops/battle groups are in scope.
1. 动手前先定义事件批次边界：哪些 trigger、哪些 event，以及哪些 flag/item/shop/battle group 在范围内。
2. Check whether the current DSL already supports the target behavior.
2. 先检查当前 DSL 是否已经支持目标行为。
3. If DSL is insufficient, add the smallest extension with schema, validation, and tests before importing real content.
3. 如果 DSL 不足，先用最小扩展补上 schema、校验和测试，再导入真实内容。
4. Author triggers in `content/manual/world.content.json` and event flow in `content/manual/story.content.json`.
4. 在 `content/manual/world.content.json` 写 trigger，在 `content/manual/story.content.json` 写事件流程。
5. Keep dialogue and story text in content data, defaulting to Simplified Chinese.
5. 对话和剧情文本必须留在内容数据里，并默认使用简体中文。
6. For every imported real event, update `docs/parity-matrix.md`.
6. 每导入一个真实事件，都要同步更新 `docs/parity-matrix.md`。
7. Add or bind at least one regression case for the imported behavior.
7. 为导入行为新增或绑定至少一个回归 case。
8. Run the matching verification commands based on risk.
8. 按风险执行对应验证命令。

## 禁止事项
## Do Not

- Do not hardcode event branches in scenes.
- 不要把事件分支硬编码到 scene 里。
- Do not create temporary real-content-only code branches in runtime.
- 不要为真实内容单独加临时代码分支。
- Do not add a new opcode without tests.
- 新增 opcode 时不要不补测试。
- Do not skip parity or regression updates when runtime-observable behavior changes.
- 当运行时可观察行为变化时，不要跳过 parity 或 regression 更新。

## 完成定义
## Definition Of Done

- Imported events run through the shared interpreter and content data only.
- 导入事件完全通过共享解释器和内容数据运行。
- Trigger and event responsibilities remain separate.
- trigger 和 event 的职责保持分离。
- At least one regression case or extended case covers the new behavior.
- 至少有一个新增或扩展后的回归 case 覆盖了该行为。
- `docs/parity-matrix.md` records current status, divergence, and next action.
- `docs/parity-matrix.md` 记录了当前状态、偏差和下一步动作。
- Validation commands pass for the affected scope.
- 受影响范围的校验命令全部通过。
