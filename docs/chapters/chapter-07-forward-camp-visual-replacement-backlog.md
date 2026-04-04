# Chapter 07 Forward Camp Visual Replacement Backlog
# Chapter 07 Forward Camp 视觉替换 Backlog

## Goal
## 目标

Track the chapter-07 visual replacement work without blocking gameplay/content closure.
在不阻塞 chapter-07 gameplay/content 收口的前提下，持续跟踪本章视觉替换工作。

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

- `asset-check`: chapter-07 is expected to stay `tilesets=placeholder | character-sprites=placeholder | npc-sprites=placeholder | enemy-sprites=placeholder | ui-panels=placeholder | icons=placeholder | audio=placeholder` after initial import
- `asset-check`：chapter-07 初次导入后预计仍保持 `tilesets=placeholder | character-sprites=placeholder | npc-sprites=placeholder | enemy-sprites=placeholder | ui-panels=placeholder | icons=placeholder | audio=placeholder`
- `parity-score`: gameplay closure is allowed to proceed while this backlog remains open, as long as chapter-07 does not introduce new visual-only blockers
- `parity-score`：只要 chapter-07 没有引入新的纯视觉 blocker，gameplay 闭环就允许继续推进，本 backlog 可以并行保留
- chapter-07 currently starts with explicit reference gaps rather than silent placeholder drift
- chapter-07 当前从一开始就把参考资料缺口显式列出，而不是默默堆积 placeholder 漂移

## Chapter 07 Runtime Asset Targets
## Chapter 07 运行时资产目标

| 逻辑资源 key | 当前状态 | 当前承载位置 | 替换目标 | 参考资料缺口 | 下一步动作 |
| --- | --- | --- | --- | --- | --- |
| `tileset.fort-east-road` | `placeholder` | `content/manual/asset-registry.content.json` | 前营东路地面、营墙、路障 tileset 子集 | 缺 chapter-07 东路与营墙 reference crop | 在 `content/reference/tiles/` 建 candidate，并补 reference manifest |
| `tileset.forward-camp-yard` | `placeholder` | `content/manual/asset-registry.content.json` | 补给场地面、货箱、营帐 tileset 子集 | 缺补给场地面与货箱裁切图 | 采集章节 reference，再进入 tileset reconstruction |
| `npc.guard` | `placeholder family reuse` | `content/manual/world.content.json` + shared registry | `camp-sentry` chapter-07 精灵帧 | 缺前营守兵站立帧 | 复用 character sprite reconstruction，为 `camp-sentry` 建候选 |
| `npc.guide` | `placeholder family reuse` | `content/manual/world.content.json` + shared registry | `fort-adjutant`、`camp-scout` chapter-07 精灵帧 | 缺都尉与斥候裁切图 | 采集 reference，补 chapter-07 sprite candidate |
| `npc.merchant` | `placeholder family reuse` | `content/manual/world.content.json` + shared registry | `camp-purveyor` sprite frame | 缺粮官站立帧 | 采集 reference，补 merchant 变体 |
| `ui.dialogue-box` | `base placeholder/reconstructed mix` | shared registry fallback | chapter-07 对话框边框和指针样式 | 缺 chapter-07 对话框 reference | 等参考图到位后决定是否新增 chapter-07 UI override |
| `ui.shop-overlay` | `base placeholder/reconstructed mix` | shared registry fallback | chapter-07 商店框布局与边框 | 缺补给场商店框参考 | 参考不足前继续复用共享 UI |
| `ui.battle-panel` | `base placeholder/reconstructed mix` | shared registry fallback | chapter-07 战斗指令框样式 | 缺 chapter-07 战斗 UI reference | 先保持现有重建规则，不阻塞 battle 闭环 |
| `ui.battle-backdrop` | `placeholder` | shared registry fallback | 章节内前营遭遇战背景 | 缺前营东路战斗 still/reference | 采集 battle reference，再推进 battle visual backfill |
| `audio.bgm.chapter-07-forward-camp.world` / `audio.bgm.chapter-07-forward-camp.battle.highland-outlaws` | `placeholder` | shared registry + `audio-routing.content.json` | world/battle BGM 路由与后续回填 | 缺 chapter-07 可追溯音频参考 | 当前不阻塞章节闭环，继续留在 audio backlog |

## New Reference Gaps
## 新增参考缺口

- Missing full-map references for `fort-east-road`
- 缺少 `fort-east-road` 的整图参考
- Missing full-map references for `forward-camp-yard`
- 缺少 `forward-camp-yard` 的整图参考
- Missing NPC stills for `fort-adjutant`, `camp-sentry`, `camp-purveyor`, `camp-scout`
- 缺少 `fort-adjutant`、`camp-sentry`、`camp-purveyor`、`camp-scout` 的人物静帧参考
- Missing shop-frame and battle-frame references for chapter-07
- 缺少 chapter-07 的商店框与战斗框参考
- Missing battle stills for `fort-east-road-raiders`
- 缺少 `fort-east-road-raiders` 的战斗参考帧

## Priority
## 优先级

1. `tileset.fort-east-road` / `tileset.forward-camp-yard`
1. `tileset.fort-east-road` / `tileset.forward-camp-yard`
2. chapter-07 NPC frame candidates
2. chapter-07 NPC 帧候选
3. chapter-local battle/UI references only if they improve parity review efficiency
3. 只有在能提升 parity review 效率时，才补章节级 battle/UI reference
