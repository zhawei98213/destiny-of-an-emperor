# Chapter 06 Border Fort Lock Report
# Chapter 06 Border Fort 锁定报告

## Scope
## 范围

- Chapter id: `chapter-06-border-fort`
- Title: Border Fort Approach
- Area label: Border Road and Border Fort Yard Slice
- Metadata status: `validating`

## Current Status
## 当前状态

- Lock result: gameplay slice is closed; parity review remains open
- 锁定结果：gameplay 切片已闭环；parity review 仍未结束
- Reason: map/event/runtime loop now works end-to-end, but text and visual references still need stronger source coverage
- 原因：当前地图/事件/运行时闭环已能端到端运行，但文本与视觉参考仍需要更强的来源覆盖
- Latest verification: `regression=7/7 passed`, `parity=81/100`, `chapter completeness=0 warning`
- 最新验证结果：`regression=7/7 passed`、`parity=81/100`、`chapter completeness=0 warning`

## Verified Now
## 当前已验证

- chapter-06 is reachable from `supply-court` through content-driven map data
- chapter-06 已可通过内容驱动的地图数据从 `supply-court` 进入
- clerk -> sentry -> gate -> fort-yard progression runs through the shared event interpreter
- “文吏 -> 守兵 -> 营门 -> 前院”推进链路全部通过共享事件解释器执行
- healer recovery, chest reward, one battle slice, and save/load roundtrip all have regression coverage
- 医官恢复、木箱奖励、战斗切片和存档读档往返都已有回归覆盖
- current regression artifacts are green with `pass=46 mismatch=0 fail=0`, including 7 chapter-06 cases
- 当前 regression 产物全绿，结果为 `pass=46 mismatch=0 fail=0`，其中包含 7 条 chapter-06 用例
- chapter-local visual replacement backlog is in place, so unresolved references do not block gameplay closure
- 章节级视觉替换 backlog 已建立，因此未完成的视觉参考不会阻塞 gameplay 闭环

## Remaining Divergences
## 当前剩余偏差

- `border-road` and `border-fort-yard` still use placeholder-managed tileset keys
- `border-road` 和 `border-fort-yard` 目前仍使用 placeholder 管理的 tileset key
- NPC visuals still reuse shared `guard` / `guide` / `merchant` families without chapter-06-specific reconstructed frames
- NPC 视觉目前仍复用共享 `guard` / `guide` / `merchant` family，还没有 chapter-06 专属重建帧
- dialogue wording and chest reward are curated chapter-06 placeholders, not yet confirmed against stronger references
- 对话文案和木箱奖励仍是 chapter-06 的 curated 占位版本，还没有用更强参考资料确认
- the recovery point is a function point, not yet a verified original shop/supply table
- 当前补给点是功能点，还不是已核实的原始商店/补给表

## Next Actions
## 下一步动作

1. Collect chapter-06 map, gate, and NPC references and move them into the visual replacement backlog.
1. 采集 chapter-06 的地图、营门和 NPC 参考资料，并推进到视觉替换 backlog。
2. Decide whether the healer node should remain a restore-only point or be upgraded to a true store/supply slice once references improve.
2. 在参考资料更完整后，决定医官节点是否继续保持恢复点，还是升级为真正的商店/补给切片。
3. Re-run parity, asset, and text reports once stronger references are available.
3. 等更强参考资料到位后，再次执行 parity、asset 和 text 报告。
