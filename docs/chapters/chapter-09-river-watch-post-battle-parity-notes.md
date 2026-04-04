# Chapter 09 River Watch Post Battle Parity Notes
# Chapter 09 River Watch Post 战斗一致性说明

## Scope
## 范围

- Chapter: `chapter-09-river-watch-post`
- Battle slice: `east-bank-road-battle-trigger` -> `east-bank-raiders` -> `highland-outlaws`
- 本章战斗切片：`east-bank-road-battle-trigger` -> `east-bank-raiders` -> `highland-outlaws`

## Reused Pattern
## 复用模式

- Chapter-09 intentionally reuses the existing `highland-outlaws` group and the current east-road style encounter loop.
- chapter-09 刻意复用现有 `highland-outlaws` 敌群和当前的东向道路式 encounter loop。

## Checklist
## 检查项

- [ ] battle trigger is bound to `east-bank-road`
- [ ] 战斗 trigger 已绑定到 `east-bank-road`
- [ ] `east-bank-raiders` encounter table resolves to `highland-outlaws`
- [ ] `east-bank-raiders` encounter table 已正确指向 `highland-outlaws`
- [ ] golden regression and battle parity cases are both bound
- [ ] golden regression 与 battle parity case 都已绑定
- [ ] reward / exp / gold / drop remain aligned with the reused outlaw baseline
- [ ] 奖励 / 经验 / 金钱 / 掉落与复用的乱兵基线保持一致

## Current Divergence
## 当前偏差

- The chapter is calibrated against the reused outlaw baseline, not a chapter-09-specific real enemy table.
- 当前是按复用的乱兵基线校准，而不是按 chapter-09 专属真实敌群表校准。
