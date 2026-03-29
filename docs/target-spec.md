# Target Spec
# 目标规格

## Goal
## 目标

This repository is building a long-lived, data-driven remake foundation for a classic console JRPG.
这个仓库正在为一款经典主机 JRPG 的长期复刻建立一个可持续的数据驱动基础。

The current target is not feature completeness. The target is reproducible infrastructure with clean boundaries:
当前目标不是功能完备，而是具备可重复建设能力的基础设施，并保持清晰边界：

- runtime logic separated from content authoring
- 运行时逻辑与内容编写分离
- stable content contracts and schema validation
- 稳定的内容契约和 schema 校验
- testable systems for world, battle, save, and event flow
- 可测试的世界、战斗、存档和事件流系统
- importer tooling that can regenerate generated content deterministically
- 能稳定重建 generated 内容的导入工具

## Runtime Scope
## 当前运行时范围

The current runtime includes:
当前运行时已经包括：

- world map rendering, camera follow, four-direction movement, and grid collision
- 世界地图渲染、摄像机跟随、四方向移动和网格碰撞
- NPC interaction and dialogue presentation
- NPC 交互和对话展示
- unified event interpretation for map triggers and NPC triggers
- 面向地图触发器和 NPC 触发器的统一事件解释器
- menu, party/inventory state, and versioned save data
- 菜单、队伍与背包状态，以及版本化存档数据
- minimal battle loop with reward payout and return to world
- 带奖励结算并返回 world 的最小战斗闭环

## Non-Goals
## 非目标

The following are intentionally not treated as “done” yet:
以下内容当前明确不视为“已完成”：

- full original-game content reproduction
- 原作全部内容复刻
- polished battle effects or animation fidelity
- 完整的战斗特效和动画还原
- final asset import pipeline from production data sources
- 面向正式数据源的最终导入管线
- branch dialogue, complex AI, formation systems, or full RPG progression
- 分支对话、复杂 AI、阵型系统或完整 RPG 成长

## Success Criteria
## 成功标准

A change is aligned with the target spec when:
一次改动符合目标规格，至少应满足：

- it strengthens data-driven seams instead of bypassing them
- 它强化了数据驱动边界，而不是绕过这些边界
- it keeps `game/` reading only final consumable content
- 它保持 `game/` 只读取最终可消费内容
- it introduces schema and validation whenever a new content format appears
- 它在新增内容格式时同步补上 schema 和校验
- it remains reproducible through scripts and regression checks
- 它可以通过脚本和回归检查被重复执行与验证
