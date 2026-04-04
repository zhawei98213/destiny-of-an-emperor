# Chapter 10 Marsh Outpost Visual Replacement Backlog
# Chapter 10 Marsh Outpost 视觉替换 Backlog

## Goal
## 目标

Track chapter-10-marsh-outpost visual replacement work in parallel with gameplay closure.
在 gameplay 闭环并行推进的同时，持续跟踪 chapter-10-marsh-outpost 的视觉替换工作。

| Logical Asset Key | Current State | Registry Source | Replacement Target | Reference Gap | Next Step |
| --- | --- | --- | --- | --- | --- |
| `tileset.marsh-road` | `placeholder` | `content/manual/asset-registry.content.json` | 沼泽前路 tileset 子集 | 缺 `marsh-road` 全图参考 | 在 `content/reference/tiles/chapter-10-marsh-outpost/` 建 candidate |
| `tileset.marsh-outpost` | `placeholder` | `content/manual/asset-registry.content.json` | 沼营哨所 tileset 子集 | 缺 `marsh-outpost` 全图参考 | 补 chapter-10 map reference 后进入 tileset reconstruction |
| `npc.guard` | `placeholder family reuse` | shared registry + `content/manual/world.content.json` | `marsh-sentry` chapter-local 站立帧 | 缺守兵站立帧 | 在 `content/reference/sprites/chapter-10-marsh-outpost/` 建 candidate |
| `npc.guide` | `placeholder family reuse` | shared registry + `content/manual/world.content.json` | `marsh-clerk` / `marsh-scout` chapter-local 站立帧 | 缺文吏与哨探参考 | 补角色帧参考并进入 sprite reconstruction |
| `ui.dialogue-box` | `shared imported` | asset registry | 若拿到 chapter-10 对话框参考则可回填 | 缺 chapter-10 UI still | 暂时继续复用 chapter-01 reconstructed UI |
