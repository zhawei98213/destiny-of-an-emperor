# Chapter 06 Border Fort Visual Replacement Backlog
# Chapter 06 Border Fort 视觉替换 Backlog

## Goal
## 目标

Track the chapter-06 visual replacement work without blocking gameplay/content closure.
在不阻塞 chapter-06 gameplay/content 收口的前提下，持续跟踪本章视觉替换工作。

## Current Policy
## 当前策略

- gameplay/content remains the blocking lane
- gameplay/content 仍然是阻塞主线
- visual parity is a parallel lane
- visual parity 作为并行副线推进
- every placeholder listed here must already resolve through the shared asset registry
- 这里列出的每个 placeholder 都必须已经通过共享 asset registry 解析
- replacement work may lag behind chapter closure, but not behind traceability
- 视觉替换可以落后于章节闭环，但不能落后于可追溯管理

## Current Report Snapshot
## 当前报告快照

- `asset-check`: chapter-06 currently resolves `tilesets=placeholder | character-sprites=placeholder | npc-sprites=placeholder | enemy-sprites=placeholder | ui-panels=placeholder | icons=placeholder | audio=placeholder`
- `asset-check`：chapter-06 当前状态为 `tilesets=placeholder | character-sprites=placeholder | npc-sprites=placeholder | enemy-sprites=placeholder | ui-panels=placeholder | icons=placeholder | audio=placeholder`
- `parity-score`: chapter-06 gameplay closure is allowed to proceed even while asset-side parity remains open
- `parity-score`：即使资产侧 parity 仍未关闭，chapter-06 的 gameplay 闭环也允许继续推进
- `parity-score`: chapter-06 currently scores `81/100` with `0 blockers` and `9 minor mismatches`
- `parity-score`：chapter-06 当前分数为 `81/100`，状态为 `0 blockers` 与 `9 minor mismatches`
- `regression-smoke`: chapter-06 adds one closed loop for clerk -> sentry -> gate -> healer -> chest -> battle -> save/load
- `regression-smoke`：chapter-06 新增了一条“文吏 -> 守兵 -> 营门 -> 医官 -> 木箱 -> 战斗 -> 存档读档”的闭环

## Chapter 06 Runtime Asset Targets
## Chapter 06 运行时资产目标

| 逻辑资源 key | 当前状态 | 当前承载位置 | 替换目标 | 参考资料缺口 | 下一步动作 |
| --- | --- | --- | --- | --- | --- |
| `tileset.border-road` | `placeholder` | `content/manual/asset-registry.content.json` | 边关前路地面、路面、营门外墙 tileset 子集 | 缺边关前路地面与路口裁切图 | 在 `content/reference/tiles/` 建 candidate，并补 reference manifest |
| `tileset.border-fort-yard` | `placeholder` | `content/manual/asset-registry.content.json` | 边营前院地面、帐篷、木箱 tileset 子集 | 缺前院地表、帐篷和箱体参考图 | 先采集院内截图，再补 tileset reconstruction candidate |
| `npc.guard` | `placeholder family reuse` | `content/manual/world.content.json` + shared registry | `border-sentry` 的 chapter-06 站立帧 | 缺边关守兵正侧向参考图 | 复用 character sprite reconstruction，为 `border-sentry` 建候选 |
| `npc.guide` | `placeholder family reuse` | `content/manual/world.content.json` + shared registry | `border-clerk`、`fort-veteran` 的 chapter-06 站立帧 | 缺边关文吏、边营老卒裁切图 | 采集 reference，补 guide 变体候选 |
| `npc.merchant` | `placeholder family reuse` | `content/manual/world.content.json` + shared registry | `fort-healer` 的 chapter-06 站立帧 | 缺医官站立帧 | 采集 reference，补 merchant 变体 |
| `ui.dialogue-box` | `base placeholder` | shared registry fallback | chapter-06 对话框边框和指针样式 | 缺边营/边关对话框参考图 | 参考不足前继续复用共享对话框 |
| `ui.battle-panel` | `base placeholder` | shared registry fallback | chapter-06 战斗指令框样式 | 缺边关前路战斗 UI reference | 在 battle reference pack 有更多内容前继续复用共享 UI |
| `portrait.guard-default` / `portrait.guide-default` / `portrait.merchant-default` | `placeholder` | shared registry | chapter-06 对话头像 | 缺文吏、守兵、医官头像参考图 | 等参考图到位后一起补 portrait backlog |
| `battle.highland-outlaws` | `shared reference gap` | `content/generated/battle.content.json` + `reports/battle-parity/latest/` | chapter-06 前路遭遇战参考包 | 缺 chapter-06 边关前路战斗画面参考 | 先采集 battle still，再决定是否需要 chapter-local battle parity 对照 |

## New Reference Gaps
## 新增参考资料缺口

- 缺 `border-road` 全图布局参考
- 缺 `border-fort-yard` 全图布局参考
- 缺 `border-clerk`、`border-sentry`、`fort-healer`、`fort-veteran` 的站立帧参考
- 缺 chapter-06 对话框与战斗框参考
- 缺 chapter-06 边关前路战斗 still / screenshot
- 缺 chapter-06 chapter-level reference pack，因此 `reference-summary` 目前还不能统计本章覆盖率

## Priority
## 优先级

1. `tileset.border-road` / `tileset.border-fort-yard`
1. `tileset.border-road` / `tileset.border-fort-yard`
2. `npc.guard` / `npc.guide` / `npc.merchant` chapter-06 variants
2. `npc.guard` / `npc.guide` / `npc.merchant` 的 chapter-06 变体
3. chapter-local dialogue and battle references only if they improve parity review efficiency
3. 只有在能提升 parity review 效率时，才补章节级对话和战斗参考

## Notes
## 说明

- This backlog is intentionally separate from the chapter lock report.
- 这份 backlog 刻意与章节 lock report 分离。
- The chapter may remain playable and regression-safe while every row here is still pending.
- 即使这里的条目都还没替换完成，章节也可以保持可玩且回归安全。
- The only hard requirement is that placeholders are explicit, registry-managed, and scheduled.
- 唯一的硬要求是：placeholder 必须显式存在、由 registry 管理，并且有明确替换计划。
