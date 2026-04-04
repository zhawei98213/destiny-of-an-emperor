# Chapter 11 Reed Ferry Lock Report
# Chapter 11 Reed Ferry 锁定报告

## Scope
## 范围

- Chapter id: `chapter-11-reed-ferry`
- Title: Reed Ferry Crossing
- Area label: Reed Ferry Road and Ferry Camp Slice
- Metadata status: `validating`

## Current Status
## 当前状态

- Lock result: in progress
- 锁定结果：进行中
- Reason: chapter-11 slice is imported, regression-backed, and stitched onto the marsh route, but parity and visual review remain open
- 原因：chapter-11 切片已导入、已接入回归，并已拼接到沼泽路线，但 parity 与视觉审核仍未结束

## Verified Now
## 当前已验证

- chapter-11 source maps, events, shop, battle slice, and save/load path are wired into the shared content pipeline
- chapter-11 的 source 地图、事件、商店、战斗切片和存档路径已接入共享内容管线
- chapter-11 golden regression, battle parity, chapter metadata, and reference pack are all bound
- chapter-11 的 golden regression、battle parity、chapter metadata 与 reference pack 已全部绑定

## Remaining Divergences
## 当前剩余偏差

- `reed-ferry-road` and `reed-ferry-camp` still use placeholder-managed tileset keys
- `reed-ferry-road` 与 `reed-ferry-camp` 目前仍使用 placeholder 管理的 tileset key
- battle slice still reuses `highland-outlaws`
- 战斗切片仍复用 `highland-outlaws`
- chapter-11 reference pack remains low-confidence and is not yet suitable for visual lock
- chapter-11 reference pack 仍是低置信度版本，尚不足以支撑视觉锁定

## Next Actions
## 下一步动作

1. Continue chapter-11 visual replacement planning without blocking gameplay closure.
1. 在不阻塞 gameplay 闭环的前提下，继续推进 chapter-11 的视觉替换计划。
2. Add higher-confidence map, NPC, UI, and battle reference frames for chapter-11.
2. 为 chapter-11 补更高置信度的地图、NPC、UI 和战斗参考帧。
3. Keep chapter-11 on the shared clerk -> sentry -> gate throughput pattern unless real data forces a split.
3. 在真实资料迫使拆分之前，继续让 chapter-11 保持共享的文吏 -> 守兵 -> 栅门吞吐模式。
