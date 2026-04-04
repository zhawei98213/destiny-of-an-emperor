# Chapter 09 River Watch Post Visual Replacement Backlog
# Chapter 09 River Watch Post 视觉替换 Backlog

## Goal
## 目标

Track chapter-09 visual replacement work in parallel with gameplay closure.
在 gameplay 闭环并行推进的同时，持续跟踪 chapter-09 的视觉替换工作。

## Current Placeholder Targets
## 当前占位目标

| 逻辑资源 key | 当前状态 | 当前承载位置 | 替换目标 | 参考资料缺口 | 下一步动作 |
| --- | --- | --- | --- | --- | --- |
| `tileset.east-bank-road` | `placeholder` | `content/manual/asset-registry.content.json` | 河岸道路与木栅 tileset 子集 | 缺 `east-bank-road` 全图参考 | 在 `content/reference/tiles/chapter-09-river-watch-post/` 建 candidate |
| `tileset.river-watch-post` | `placeholder` | `content/manual/asset-registry.content.json` | 河营补给哨地面与帐篷 tileset 子集 | 缺 `river-watch-post` 全图参考 | 补 chapter-09 map reference 后进入 tileset reconstruction |
| `npc.guard` | `placeholder family reuse` | shared registry + `content/manual/world.content.json` | `bank-sentry` chapter-local 站立帧 | 缺河岸守兵站立帧 | 在 `content/reference/sprites/chapter-09-river-watch-post/` 建 candidate |
| `npc.merchant` | `placeholder family reuse` | shared registry + `content/manual/world.content.json` | `watch-quartermaster` chapter-local 站立帧 | 缺河营粮官站立帧 | 复用 character sprite reconstruction workflow |
| `ui.dialogue-box` | `shared fallback` | shared registry | 如有必要，为 chapter-09 补对话框章节变体 | 缺 chapter-09 对话框 reference | 在 reference pack 补 dialogue/UI 场景帧 |
| `ui.battle-panel` | `shared fallback` | shared registry | 如有必要，为 chapter-09 补 battle frame 变体 | 缺 chapter-09 battle still | 在 chapter-09 battle notes 中同步登记 |

## Reference Gaps
## 当前参考缺口

- 缺 `east-bank-road` 全图布局参考
- 缺 `river-watch-post` 全图布局参考
- 缺 `bank-clerk`、`bank-sentry`、`watch-quartermaster`、`watch-scout` 站立帧参考
- 缺 chapter-09 dialogue box / battle panel 对照帧
- 缺 `east-bank-road-raiders` 对应战斗 still / screenshot

## Priority Order
## 优先级顺序

1. `tileset.east-bank-road` / `tileset.river-watch-post`
1. `tileset.east-bank-road` / `tileset.river-watch-post`
2. `npc.guard` / `npc.merchant`
2. `npc.guard` / `npc.merchant`
3. chapter-09 UI reference and battle stills
3. chapter-09 UI reference 与 battle still
