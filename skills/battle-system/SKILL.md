---
name: battle-system
description: Build and maintain the battle domain, turn flow, AI, reward calculation, and battle-world transitions for a data-driven JRPG remake. / 为数据驱动的 JRPG 重制项目构建和维护战斗领域、回合流程、AI、奖励结算以及战斗与世界之间的切换。
---

Rules / 规则:
1. Battle data must be content-driven. / 战斗数据必须由内容驱动。
2. BattleScene should orchestrate, not own all combat logic. / BattleScene 负责编排，不应承载全部战斗逻辑。
3. Rewards must flow through shared state containers. / 奖励结算必须通过共享状态容器流转。
4. Keep clear contracts between world state and battle state. / 世界状态和战斗状态之间必须保持清晰契约。
5. Add smoke tests for battle start, finish, reward, and failure paths. / 为战斗开始、结束、奖励和失败路径补充冒烟测试。
