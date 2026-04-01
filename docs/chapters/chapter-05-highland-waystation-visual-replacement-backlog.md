# Chapter 05 Highland Waystation Visual Replacement Backlog
# Chapter 05 Highland Waystation 视觉替换 Backlog

## Goal
## 目标

Track the chapter-05 visual replacement work without blocking gameplay/content closure.
在不阻塞 chapter-05 gameplay/content 收口的前提下，持续跟踪本章视觉替换工作。

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

- `asset-check`: chapter-05 is currently `tilesets=placeholder | character-sprites=placeholder | npc-sprites=placeholder | enemy-sprites=placeholder | ui-panels=placeholder | icons=placeholder | audio=placeholder`
- `asset-check`：chapter-05 当前状态为 `tilesets=placeholder | character-sprites=placeholder | npc-sprites=placeholder | enemy-sprites=placeholder | ui-panels=placeholder | icons=placeholder | audio=placeholder`
- `parity-score`: chapter-05 currently has `0` asset-side blockers, which means gameplay closure is allowed to proceed while this backlog remains open
- `parity-score`：chapter-05 当前资产侧 `0` 个 blocker，这意味着 gameplay 闭环可以继续推进，而本 backlog 允许并行保留
- `discrepancy-triage`: chapter-05 currently still carries `main-flow-events`, `battle-local-parity`, `shop-local-parity`, `spatial-lockdown`, and `dialogue-polish` follow-up items, but no chapter-05-specific P0 visual blocker yet
- `discrepancy-triage`：chapter-05 当前仍有 `main-flow-events`、`battle-local-parity`、`shop-local-parity`、`spatial-lockdown` 和 `dialogue-polish` 后续项，但暂时没有 chapter-05 专属的 P0 视觉 blocker

## Chapter 05 Runtime Asset Targets
## Chapter 05 运行时资产目标

| 逻辑资源 key | 当前状态 | 当前承载位置 | 替换目标 | 参考资料缺口 | 下一步动作 |
| --- | --- | --- | --- | --- | --- |
| `tileset.highland-pass` | `placeholder` | `content/manual/asset-registry.content.json` | 高坡山道地表、路面、坡壁 tileset 子集 | 缺 chapter-05 山道路面与坡壁 reference crop | 在 `content/reference/tiles/` 建 candidate，并补 reference manifest |
| `tileset.waystation-gate` | `placeholder` | `content/manual/asset-registry.content.json` | 驿门路面、关门、墙体 tileset 子集 | 缺驿门门体和墙体参考图 | 先采集门体截图，再补 tileset reconstruction candidate |
| `tileset.supply-court` | `placeholder` | `content/manual/asset-registry.content.json` | 补给院地面、帐篷、货箱 tileset 子集 | 缺补给院地面与货箱裁切图 | 采集章节 reference，再进入 tileset reconstruction |
| `npc.guard` | `placeholder family reuse` | `content/manual/world.content.json` + shared registry | 守将与斥候的 chapter-05 精灵帧 | 缺 chapter-05 守将/斥候站立帧 | 复用 character sprite reconstruction，为 `gate-captain` / `pass-scout` 建新候选 |
| `npc.guide` | `placeholder family reuse` | `content/manual/world.content.json` + shared registry | 传令兵与老卒的 chapter-05 精灵帧 | 缺传令兵、老卒裁切图 | 采集 reference，补 chapter-05 sprite candidate |
| `npc.merchant` | `placeholder family reuse` | `content/manual/world.content.json` + shared registry | 军需官 sprite frame | 缺转运军需官站立帧 | 采集 reference，补 merchant 变体 |
| `ui.dialogue-box` | `base placeholder` | shared registry fallback | chapter-05 对话框边框和指针样式 | 缺 chapter-05 对话框 reference | 等参考图到位后决定是否新增 chapter-05 UI override |
| `ui.shop-overlay` | `base placeholder` | shared registry fallback | chapter-05 商店框布局与边框 | 缺驿院商店框参考 | 参考不足前继续复用共享 UI |
| `ui.battle-panel` | `base placeholder` | shared registry fallback | chapter-05 战斗指令框样式 | 缺 chapter-05 战斗 UI reference | 先保持现有重建规则，不阻塞 battle 闭环 |
| `portrait.guard-default` / `portrait.guide-default` / `portrait.merchant-default` | `placeholder` | shared registry | 章节内对话头像 | 缺人物头像参考图 | 等文本与参考收集到位后一起补 portrait backlog |
| `audio.voice-*` / `audio.sfx-*` | `placeholder` | shared registry | voice/sfx 文件与 registry | 缺可追溯音频参考 | 当前不阻塞章节闭环，继续留在 audio backlog |

## Priority
## 优先级

1. `tileset.highland-pass` / `tileset.waystation-gate` / `tileset.supply-court`
1. `tileset.highland-pass` / `tileset.waystation-gate` / `tileset.supply-court`
2. `npc.guard` / `npc.guide` / `npc.merchant` chapter-05 variants
2. `npc.guard` / `npc.guide` / `npc.merchant` 的 chapter-05 变体
3. chapter-local UI references only if they improve parity review efficiency
3. 只有在能提升 parity review 效率时，才补章节级 UI reference

## Notes
## 说明

- This backlog is intentionally separate from the chapter lock report.
- 这份 backlog 刻意与章节 lock report 分离。
- The chapter may remain playable and regression-safe while every row here is still pending.
- 即使这里的条目都还没替换完成，章节也可以保持可玩且回归安全。
- The only hard requirement is that placeholders are explicit, registry-managed, and scheduled.
- 唯一的硬要求是：placeholder 必须显式存在、由 registry 管理，并且有明确替换计划。
