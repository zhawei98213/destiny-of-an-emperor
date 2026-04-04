# Chapter 11 Reed Ferry Battle Parity Notes
# Chapter 11 Reed Ferry 战斗一致性说明

## Scope
## 范围

- Chapter: `chapter-11-reed-ferry`
- Add real battle notes here only if the chapter contains one or more battle slices.
- 只有当本章包含一场或多场战斗切片时，才在此补 battle parity 说明。

## Current Read
## 当前判断

- battle trigger: `reed-ferry-road-battle-trigger`
- 战斗触发：`reed-ferry-road-battle-trigger`
- encounter table: `reed-ferry-road-raiders`
- 遭遇表：`reed-ferry-road-raiders`
- current group: shared stand-in `highland-outlaws`
- 当前敌群：共享代用组 `highland-outlaws`

## Checklist
## 检查项

- [x] battle trigger is bound to a real map slice
- [x] 战斗触发已绑定到真实地图切片
- [x] enemy group is imported or explicitly marked as a temporary stand-in
- [x] 敌群已经导入，或已明确标记为临时代用组
- [x] reward / exp / gold / drop have been sanity-checked
- [x] 奖励 / 经验 / 金钱 / 掉落已经做过合理性检查
- [x] golden regression and battle parity cases are both bound
- [x] golden regression 与 battle parity case 都已绑定

## Notes
## 说明

- Chapter-11 does not trigger a new battle runtime requirement. It continues to reuse the standardized outlaw baseline to validate that ferry-route chapters can still close battle parity without new scene logic.
- chapter-11 没有触发新的战斗运行时需求。它继续复用标准化乱兵战基线，用来验证“渡口路线章节”仍能在不新增 scene 逻辑的前提下闭合 battle parity。
