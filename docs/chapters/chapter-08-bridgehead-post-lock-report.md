# Chapter 08 Bridgehead Post Lock Report
# Chapter 08 Bridgehead Post 锁定报告

## Scope
## 范围

- Chapter id: `chapter-08-bridgehead-post`
- Title: Bridgehead Post Advance
- Area label: Forward Camp East Road and Bridgehead Slice
- Metadata status: `validating`

## Current Status
## 当前状态

- Lock result: gameplay slice is closed; parity review remains open
- 锁定结果：gameplay 切片已闭环；parity review 仍未结束
- Reason: the chapter loop is fully playable, but map references, NPC references, and chapter-local battle references are still low-confidence
- 原因：章节闭环已经可玩，但地图、NPC 和章节级战斗参考资料仍然是低置信度覆盖

## Verified Now
## 当前已验证

- chapter-08 is reachable from `forward-camp-yard` through a content-driven portal, not a new scene branch
- chapter-08 通过内容驱动的 portal 从 `forward-camp-yard` 可达，没有引入新的 scene 分支
- captain -> sentry -> gate-cutscene -> bridgehead post runs through the shared event interpreter
- “都伯 -> 守兵 -> 木栅过场 -> 桥头哨所”链路全部通过共享事件解释器执行
- chapter-08 reuses the established shop, chest, and region-battle patterns without adding a new workflow
- chapter-08 继续复用既有的商店、宝箱和 region battle 模式，没有新增流程分支
- chapter-local visual replacement backlog and reference pack already exist, so visual debt is visible without blocking gameplay closure
- 章节级 visual replacement backlog 与 reference pack 已建立，因此视觉债务可见但不会阻塞 gameplay 闭环

## New System Pressure
## 新增系统压力模式

- chapter-08 is the first slice where the forward chapter entrance is a portal instead of an event-owned handoff
- chapter-08 是第一个以前一章 portal 而不是 event-owned handoff 作为入口的切片
- this increases pressure on cross-chapter world stitching and connectivity auditing rather than on DSL branching
- 这会把新增压力更多放在跨章 world 拼接和连接性审计上，而不是事件 DSL 分支能力上
- the chapter also adds one more low-confidence chapter-local reference pack that must stay synchronized with gameplay closure
- 同时，本章新增了一个需要与 gameplay 闭环同步维护的低置信度章节级 reference pack

## Remaining Divergences
## 当前剩余偏差

- `bridge-road` and `bridgehead-post` still use placeholder-managed tileset keys
- `bridge-road` 和 `bridgehead-post` 目前仍使用 placeholder 管理的 tileset key
- chapter-08 NPC visuals still reuse shared sprite families
- chapter-08 NPC 视觉仍复用共享 sprite family
- `highland-outlaws` remains a deliberate battle stand-in, not a chapter-08-specific imported enemy group
- `highland-outlaws` 仍是有意保留的战斗代用组，还不是 chapter-08 专属导入敌群
- chapter-08 shop inventory and chest reward are curated values, not yet stronger-source verified
- chapter-08 商店货表和木箱奖励仍是 curated 数值，还没有用更强来源核对

## Next Actions
## 下一步动作

1. Bind chapter-08 regression and battle parity cases.
1. 绑定 chapter-08 regression 与 battle parity case。
2. Re-run parity, discrepancy, reference, and chapter-status reports.
2. 重新执行 parity、discrepancy、reference 和 chapter-status 报告。
3. Keep chapter-08 visual replacement backlog explicit while preserving gameplay closure speed.
3. 在保持 gameplay 闭环速度的同时，继续让 chapter-08 的视觉替换 backlog 保持显式可追踪。
