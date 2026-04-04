# Chapter 08 Bridgehead Post Visual Replacement Backlog
# Chapter 08 Bridgehead Post 视觉替换 Backlog

## Goal
## 目标

Track chapter-08 visual replacement work without blocking gameplay/content closure.
在不阻塞 chapter-08 gameplay/content 闭环的前提下，持续跟踪本章视觉替换工作。

## Current Policy
## 当前策略

- gameplay/content remains the blocking lane
- gameplay/content 仍然是阻塞主线
- visual parity is a parallel lane
- visual parity 作为并行副线推进
- every placeholder listed here must already resolve through the shared asset registry
- 这里列出的每个 placeholder 都必须已经通过共享 asset registry 解析

## Current Report Snapshot
## 当前报告快照

- chapter-08 currently keeps gameplay closure first and visual replacement second
- chapter-08 当前继续遵守“先 gameplay 闭环，再视觉替换”的双轨策略
- the chapter-local reference pack already exists, but every row is still low-confidence
- 章节级 reference pack 已建立，但目前所有条目都仍是低置信度占位
- chapter-08 intentionally reuses shared NPC sprite families and the shared battle group to avoid slowing chapter throughput
- chapter-08 刻意复用共享 NPC sprite family 和共享 battle group，以避免拖慢章节吞吐

## Chapter 08 Runtime Asset Targets
## Chapter 08 运行时资产目标

| 逻辑资源 key | 当前状态 | 当前承载位置 | 替换目标 | 参考资料缺口 | 下一步动作 |
| --- | --- | --- | --- | --- | --- |
| `tileset.bridge-road` | `placeholder` | `content/manual/asset-registry.content.json` | 桥头前路地面与木栅 tileset 子集 | 缺桥头前路全图参考 | 在 `content/reference/tiles/chapter-08-bridgehead-post/` 建 candidate |
| `tileset.bridgehead-post` | `placeholder` | `content/manual/asset-registry.content.json` | 桥头补给哨所地面与帐篷 tileset 子集 | 缺补给哨所布局参考 | 补 chapter-08 map reference 后进入 tileset reconstruction |
| `npc.guard` | `placeholder family reuse` | `content/manual/world.content.json` + shared registry | `bridge-sentry` chapter-08 站立帧 | 缺守兵正侧向参考图 | 复用 character sprite reconstruction workflow |
| `npc.guide` | `placeholder family reuse` | `content/manual/world.content.json` + shared registry | `bridge-captain` / `bridge-runner` chapter-08 站立帧 | 缺都伯与传令兵参考图 | 在 reference pack 中补 NPC 关键帧 |
| `npc.merchant` | `placeholder family reuse` | `content/manual/world.content.json` + shared registry | `bridge-quartermaster` chapter-08 站立帧 | 缺粮官站立帧 | 在 `content/reference/sprites/chapter-08-bridgehead-post/` 建 candidate |
| `ui.dialogue-box` | `shared fallback` | shared registry fallback | chapter-08 对话框边框与指针风格 | 缺 chapter-08 UI 参考图 | 先保留共享 UI，等 reference 覆盖提升后再替换 |
| `battle.highland-outlaws` | `shared fallback` | `content/generated/battle.content.json` + battle registry | chapter-08 桥头前路遭遇战视觉参考 | 缺 chapter-08 战斗画面 still | 补 battle reference 后再决定是否做 chapter-local battle visual override |
| `audio.chapter-08-bgm` | `shared fallback` | audio registry routing | chapter-08 地图 / 战斗音频映射 | 缺章节音频参考 | 后续在 audio workflow 补 chapter-local mapping |

## New Reference Gaps
## 新增参考资料缺口

- 缺 `bridge-road` 全图布局参考
- 缺 `bridgehead-post` 全图布局参考
- 缺 `bridge-captain`、`bridge-sentry`、`bridge-quartermaster`、`bridge-runner` 站立帧参考
- 缺 chapter-08 对话框 / 商店框 / 战斗框参考
- 缺 chapter-08 桥头前路战斗 still / screenshot

## Priority
## 优先级

1. `tileset.bridge-road` / `tileset.bridgehead-post`
1. `tileset.bridge-road` / `tileset.bridgehead-post`
2. `npc.guard` / `npc.guide` / `npc.merchant` chapter-08 variants
2. `npc.guard` / `npc.guide` / `npc.merchant` 的 chapter-08 变体
3. chapter-local battle and UI references
3. 章节级战斗与 UI 参考
