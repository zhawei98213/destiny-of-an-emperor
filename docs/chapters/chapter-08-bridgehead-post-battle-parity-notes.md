# Chapter 08 Bridgehead Post Battle Parity Notes
# Chapter 08 Bridgehead Post 战斗一致性说明

## Scope
## 范围

- Chapter: `chapter-08-bridgehead-post`
- Battle slice: `bridge-road-battle-trigger`
- Encounter table: `bridge-road-raiders`
- Current battle group: `highland-outlaws`

## Current Decision
## 当前决策

- chapter-08 continues to reuse `highland-outlaws` as a deliberate stand-in
- chapter-08 继续刻意复用 `highland-outlaws` 作为代用敌群
- this keeps chapter throughput high and avoids introducing a new battle-data branch before stronger references arrive
- 这样可以保持章节吞吐，不会在更强参考资料到位前额外分叉 battle-data

## Validation Target
## 校验目标

- [ ] `bridge-road-battle-roundtrip` is bound in golden regression
- [ ] `bridge-road-battle-roundtrip` 已绑定 golden regression
- [ ] `bridge-road-raiders` is bound in battle parity cases
- [ ] `bridge-road-raiders` 已绑定 battle parity case
- [ ] reward / exp / drop continue to match the shared baseline
- [ ] 奖励 / 经验 / 掉落继续对齐共享基线

## Remaining Gap
## 当前缺口

- chapter-08 still lacks a chapter-local enemy reference pack
- chapter-08 仍缺章节级敌人参考包
- the current battle visual and reward balance are good enough for gameplay closure, but not yet chapter-local parity lock
- 当前战斗视觉和奖励平衡已经足够支撑 gameplay 闭环，但还不能视为章节级 parity lock
