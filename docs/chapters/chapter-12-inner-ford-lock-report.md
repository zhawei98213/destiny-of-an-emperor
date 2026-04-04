# Chapter 12 Inner Ford Lock Report
# Chapter 12 Inner Ford 锁定报告

## Scope
## 范围

- Chapter id: `chapter-12-inner-ford`
- Title: Inner Ford Approach
- Area label: Inner Ford Road and Camp Slice
- Metadata status: `validating`

## Current Status
## 当前状态

- Lock result: in progress
- 锁定结果：进行中
- Reason: chapter-12 slice is imported, regression-backed, and stitched onto the reed-ferry route, but parity and visual review remain open
- 原因：chapter-12 切片已导入、已接入回归，并已拼接到芦渡路线，但 parity 与视觉审核仍未结束

## Verified Now
## 当前已验证

- chapter-12 source maps, events, shop, battle slice, and save/load path are wired into the shared content pipeline
- chapter-12 的 source 地图、事件、商店、战斗切片和存档路径已接入共享内容管线
- chapter-12 golden regression, battle parity, chapter metadata, and reference pack are all bound
- chapter-12 的 golden regression、battle parity、chapter metadata 与 reference pack 已全部绑定

## Remaining Divergences
## 当前剩余偏差

- `inner-ford-road` and `inner-ford-camp` still use placeholder-managed tileset keys
- `inner-ford-road` 与 `inner-ford-camp` 目前仍使用 placeholder 管理的 tileset key
- battle slice still reuses `highland-outlaws`
- 战斗切片仍复用 `highland-outlaws`
- chapter-12 reference pack remains low-confidence and is not yet suitable for visual lock
- chapter-12 reference pack 仍是低置信度版本，尚不足以支撑视觉锁定

## Next Actions
## 下一步动作

1. Continue chapter-12 visual replacement planning without blocking gameplay closure.
1. 在不阻塞 gameplay 闭环的前提下，继续推进 chapter-12 的视觉替换计划。
2. Add higher-confidence map, NPC, UI, and battle reference frames for chapter-12.
2. 为 chapter-12 补更高置信度的地图、NPC、UI 和战斗参考帧。
3. Keep chapter-12 on the shared clerk -> sentry -> gate throughput pattern unless real data forces a split.
3. 在真实资料迫使拆分之前，继续让 chapter-12 保持共享的文吏 -> 守兵 -> 栅门吞吐模式。

## Scope
## 范围

- Chapter id: `chapter-12-inner-ford`
- Title: Inner Ford Approach
- Area label: Inner Ford Road and Camp Slice
- Metadata status: `planned`

## Current Status
## 当前状态

- Lock result: not reviewed yet
- 锁定结果：尚未审核
- Reason: scaffold only; real import and parity work have not started
- 原因：当前只有骨架，真实导入和 parity 工作尚未开始

## Verified Now
## 当前已验证

- Bootstrap files exist and are ready for chapter-factory execution
- chapter bootstrap 文件已生成，可直接进入 chapter-factory 流程

## Remaining Divergences
## 当前剩余偏差

- No real maps, NPCs, events, shops, or enemy groups have been imported yet
- 当前尚未导入真实地图、NPC、事件、商店或敌群

## Next Actions
## 下一步动作

1. Fill chapter scope in the plan file.
1. 在计划文件中填写章节范围。
2. Start the source -> tools -> generated/manual import flow for the first map slice.
2. 启动首张地图切片的 source -> tools -> generated/manual 导入流程。
3. Run completeness, parity, regression, and lock checklist tools as the slice grows.
3. 随着切片推进，执行 completeness、parity、regression 和 lock checklist 工具。
