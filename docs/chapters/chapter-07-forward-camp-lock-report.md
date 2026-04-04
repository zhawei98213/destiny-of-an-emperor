# Chapter 07 Forward Camp Lock Report
# Chapter 07 Forward Camp 锁定报告

## Scope
## 范围

- Chapter id: `chapter-07-forward-camp`
- Title: Forward Camp Corridor
- Area label: Border Fort East Road and Forward Camp Slice
- Metadata status: `validating`

## Current Status
## 当前状态

- Lock result: gameplay slice is closed; parity review remains open
- 锁定结果：gameplay 切片已闭环；parity review 仍未结束
- Reason: map/event/runtime loop now works end-to-end, but text and visual references still need stronger source coverage
- 原因：当前地图/事件/运行时闭环已能端到端运行，但文本与视觉参考仍需要更强的来源覆盖
- Latest verification: `regression=7/7 expected`, `chapter completeness=0 warning target`, `battle parity notes attached`
- 最新验证结果：`regression=7/7 预期`、`chapter completeness=0 warning 目标`、`battle parity 说明已附加`

## Verified Now
## 当前已验证

- chapter-07 is reachable from `border-fort-yard` through content-driven map data
- chapter-07 已可通过内容驱动的地图数据从 `border-fort-yard` 进入
- adjutant -> sentry -> gate-cutscene -> forward-camp progression runs through the shared event interpreter
- “都尉 -> 守兵 -> 营门过场 -> 前营补给场”推进链路全部通过共享事件解释器执行
- chapter-07 is the first real slice that uses `facePlayer` + `movePlayer` in a committed gate event instead of scene-local scripting
- chapter-07 是第一个在正式提交的真实章节事件中使用 `facePlayer` + `movePlayer` 完成营门过场的切片，而不是在 scene 里写局部脚本
- shop interaction, chest reward, one battle slice, and save/load roundtrip are all bound into the chapter regression plan
- 商店交互、木箱奖励、战斗切片和存档读档往返都已经绑定到章节回归计划
- chapter-local visual replacement backlog and battle parity notes are in place, so unresolved reference gaps do not block gameplay closure
- 章节级 visual replacement backlog 与 battle parity 说明都已建立，因此未解决的参考资料缺口不会阻塞 gameplay 闭环

## Remaining Divergences
## 当前剩余偏差

- `fort-east-road` and `forward-camp-yard` still use placeholder-managed tileset keys
- `fort-east-road` 和 `forward-camp-yard` 目前仍使用 placeholder 管理的 tileset key
- NPC visuals still reuse shared `guard` / `guide` / `merchant` families without chapter-07-specific reconstructed frames
- NPC 视觉目前仍复用共享 `guard` / `guide` / `merchant` family，还没有 chapter-07 专属重建帧
- dialogue wording, shop inventory, and chest reward are curated chapter-07 placeholders, not yet confirmed against stronger references
- 对话文案、商店货表和木箱奖励仍是 chapter-07 的 curated 占位版本，还没有用更强参考资料确认
- `highland-outlaws` is a deliberate battle stand-in, not yet a chapter-07-specific imported enemy group
- `highland-outlaws` 当前是有意保留的战斗代用组，还不是 chapter-07 专属导入敌群

## Next Actions
## 下一步动作

1. Collect chapter-07 map, gate, and NPC references and move them into the visual replacement backlog.
1. 采集 chapter-07 的地图、营门和 NPC 参考资料，并推进到视觉替换 backlog。
2. Decide whether `highland-outlaws` remains an acceptable battle stand-in or should be replaced by a chapter-07-specific enemy group later.
2. 决定 `highland-outlaws` 是否继续作为可接受的战斗代用组，还是后续替换成 chapter-07 专属敌群。
3. Re-run parity, asset, text, battle, and discrepancy reports once stronger references arrive.
3. 等更强参考资料到位后，再次执行 parity、asset、text、battle 和 discrepancy 报告。
