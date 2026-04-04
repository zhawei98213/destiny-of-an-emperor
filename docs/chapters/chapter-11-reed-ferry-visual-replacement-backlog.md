# Chapter 11 Reed Ferry Visual Replacement Backlog
# Chapter 11 Reed Ferry 视觉替换 Backlog

## Goal
## 目标

Track chapter-11-reed-ferry visual replacement work in parallel with gameplay closure.
在 gameplay 闭环并行推进的同时，持续跟踪 chapter-11-reed-ferry 的视觉替换工作。

| Logical Asset Key | Current State | Registry Source | Replacement Target | Reference Gap | Next Step |
| --- | --- | --- | --- | --- | --- |
| `tileset.reed-ferry-road` | `placeholder` | `content/manual/asset-registry.content.json` | 芦渡前路 tileset 子集 | 缺 `reed-ferry-road` 全图参考 | 在 `content/reference/tiles/chapter-11-reed-ferry/` 建 candidate |
| `tileset.reed-ferry-camp` | `placeholder` | `content/manual/asset-registry.content.json` | 渡营 tileset 子集 | 缺 `reed-ferry-camp` 全图参考 | 补 chapter-11 map reference 后进入 tileset reconstruction |
| `npc.guard` | `placeholder family reuse` | shared registry + `content/manual/world.content.json` | `reed-sentry` chapter-local 站立帧 | 缺守兵站立帧 | 在 `content/reference/sprites/chapter-11-reed-ferry/` 建 candidate |
| `npc.guide` | `placeholder family reuse` | shared registry + `content/manual/world.content.json` | `reed-clerk` / `reed-boatman` chapter-local 站立帧 | 缺文吏与艄公参考 | 补角色帧参考并进入 sprite reconstruction |
| `ui.dialogue-box` | `shared imported` | asset registry | 若拿到 chapter-11 对话框参考则可回填 | 缺 chapter-11 UI still | 暂时继续复用 chapter-01 reconstructed UI |
| `battle.highland-outlaws` | `shared imported battle proxy` | battle asset registry + battle manifest | chapter-11 芦渡前路乱兵战视觉切片 | 缺 chapter-11 battle still | 先补战斗 still，再决定是否做 chapter-local battle visual override |
