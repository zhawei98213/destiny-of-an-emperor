# Chapter 12 Inner Ford Battle Parity Notes
# Chapter 12 Inner Ford 战斗一致性说明

- battle slice: `inner-ford-road-battle-trigger` -> `inner-ford-road-raiders`
- 战斗切片：`inner-ford-road-battle-trigger` -> `inner-ford-road-raiders`
- current battle group: `highland-outlaws`
- 当前战斗组：`highland-outlaws`
- parity status: validating
- 一致性状态：验证中
- known divergence: chapter-12 still reuses the shared outlaw group instead of a chapter-local enemy import
- 已知偏差：chapter-12 仍复用共享乱兵战组，尚未切成章节自有敌群
- next action: keep the shared group until a later battle-data import pass proves chapter-local calibration is needed
- 下一步动作：在后续 battle-data 导入与校准明确需要拆分前，继续复用共享组

## Scope
## 范围

- Chapter: `chapter-12-inner-ford`
- Add real battle notes here only if the chapter contains one or more battle slices.
- 只有当本章包含一场或多场战斗切片时，才在此补 battle parity 说明。

## Initial Checklist
## 初始检查项

- [ ] battle trigger is bound to a real map slice
- [ ] 战斗触发已绑定到真实地图切片
- [ ] enemy group is imported or explicitly marked as a temporary stand-in
- [ ] 敌群已经导入，或已明确标记为临时代用组
- [ ] reward / exp / gold / drop have been sanity-checked
- [ ] 奖励 / 经验 / 金钱 / 掉落已经做过合理性检查
- [ ] golden regression and battle parity cases are both bound
- [ ] golden regression 与 battle parity case 都已绑定
