# Chapter 07 Forward Camp Battle Parity Notes
# Chapter 07 Forward Camp 战斗 Parity 说明

## Scope
## 范围

- Chapter id: `chapter-07-forward-camp`
- Battle slice: `fort-east-road-battle-trigger` -> `fort-east-road-raiders` -> `highland-outlaws`
- 战斗切片：`fort-east-road-battle-trigger` -> `fort-east-road-raiders` -> `highland-outlaws`

## Current Choice
## 当前选择

- chapter-07 reuses `highland-outlaws` as the minimum battle slice so gameplay closure and battle UI/transition audits can proceed without waiting for a dedicated enemy import
- chapter-07 当前复用 `highland-outlaws` 作为最小战斗切片，这样 gameplay 闭环以及 battle UI/transition 审计可以先推进，而不用等待专属敌群导入
- this is a deliberate parity compromise, not a hidden fallback
- 这是有意保留的 parity 折中，不是隐藏回退

## Verified Now
## 当前已验证

- world -> battle -> world roundtrip remains shared-runtime safe
- world -> battle -> world 的往返仍然通过共享运行时安全执行
- battle rewards continue to write back into chapter runtime state
- 战斗奖励继续能正确写回章节运行时状态
- battle UI flow and encounter/transition audits cover this slice through the shared systems
- battle UI flow 与 encounter/transition 审计都通过共享系统覆盖到了这个切片

## Remaining Divergence
## 当前剩余偏差

- `highland-outlaws` is still a stand-in battle group, not a chapter-07-specific imported enemy pack
- `highland-outlaws` 仍是代用战斗组，不是 chapter-07 专属导入敌群
- no chapter-07-specific enemy visual backfill exists yet
- 当前还没有 chapter-07 专属的敌图视觉回填

## Next Action
## 下一步动作

1. Add a chapter-07 battle reference pack once stronger source coverage arrives.
1. 等更强参考资料到位后，为 chapter-07 补 battle reference pack。
2. Replace `highland-outlaws` only when a real chapter-07 group can be imported and calibrated together.
2. 只有当 chapter-07 的真实敌群能一起导入并校准时，才替换 `highland-outlaws`。
