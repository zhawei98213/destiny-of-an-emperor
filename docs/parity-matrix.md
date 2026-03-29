# Parity Matrix
# 一致性矩阵

## Purpose
## 目的

Use this matrix to track remake parity as a set of checkable items instead of one vague “chapter complete” label.
使用这份矩阵把复刻一致性拆成可核对的项目，而不是用一个模糊的“章节完成”状态来代替。

Each row should be updated per chapter or sub-area.
每一行都应按章节或局部区域持续更新。

## Status Values
## 状态值

- `未开始 / Not Started`
- `进行中 / In Progress`
- `已验证 / Verified`
- `有偏差 / Diverged`

## How To Use
## 使用方式

- Fill one row per chapter slice, map section, or gameplay chunk.
- 每个章节切片、地图区域或玩法片段填写一行。
- Mark a row `已验证 / Verified` only when the listed validation method has been executed against committed data and runtime behavior.
- 只有在针对已提交的数据和运行时行为执行了对应验证方法后，才能把该行标记为 `已验证 / Verified`。
- If any required field is unknown, the row is not locked.
- 只要任何关键字段还未知，该行就不能视为锁定完成。

## Matrix Template
## 矩阵模板

### 1. 地图布局一致性 / Map Layout Parity

| 字段 | 内容 |
| --- | --- |
| 章节 / 区域 | 例：前哨镇 / Town Center |
| 复刻对象 | 地图尺寸、tile 排布、装饰层、道路与建筑轮廓 |
| 当前系统承载位置 | `content/manual/world.content.json` -> `maps[].tileLayers` |
| 数据来源 | 原始地图截图 / 提取表 / `content/source/maps/` |
| 验证方法 | 运行时截图对比、格子坐标核对、tile layer diff |
| 当前状态 | 未开始 / 进行中 / 已验证 / 有偏差 |
| 偏差说明 | 记录具体 tile 区域、尺寸差异或缺失装饰 |
| 下一步动作 | 补 source 地图数据、调整 importer、修正 manual override |

### 2. 阻挡/可通行区域一致性 / Collision And Walkability Parity

| 字段 | 内容 |
| --- | --- |
| 章节 / 区域 |  |
| 复刻对象 | 可通行格、不可通行格、门口与边界阻挡 |
| 当前系统承载位置 | `content/manual/world.content.json` -> `maps[].collisionLayers` |
| 数据来源 | 原始地图碰撞标注 / 人工标格 / `content/source/maps/` |
| 验证方法 | 手动走格测试、碰撞层数组核对、边界校验 |
| 当前状态 | 未开始 / 进行中 / 已验证 / 有偏差 |
| 偏差说明 | 记录错误坐标、漏挡或误挡区域 |
| 下一步动作 | 修正 collision 数据并重跑验证 |

### 3. NPC 位置、朝向一致性 / NPC Position And Facing Parity

| 字段 | 内容 |
| --- | --- |
| 章节 / 区域 |  |
| 复刻对象 | NPC 出现位置、初始朝向、是否存在、基础行为 |
| 当前系统承载位置 | `content/manual/world.content.json` -> `maps[].npcs` |
| 数据来源 | 原始场景截图 / NPC 配置表 / `content/source/maps/` |
| 验证方法 | 地图坐标核对、运行时站位截图对比 |
| 当前状态 | 未开始 / 进行中 / 已验证 / 有偏差 |
| 偏差说明 | 记录 NPC id、位置偏差或朝向错误 |
| 下一步动作 | 修正 NPC 数据或补 importer 映射 |

### 4. 对话文本一致性 / Dialogue Text Parity

| 字段 | 内容 |
| --- | --- |
| 章节 / 区域 |  |
| 复刻对象 | 文本内容、说话者、句序、关键术语 |
| 当前系统承载位置 | `content/manual/story.content.json` -> `dialogueLines` |
| 数据来源 | 原始文本表 / 脚本提取 / `content/source/text/` |
| 验证方法 | 文本 diff、逐句人工比对、事件引用检查 |
| 当前状态 | 未开始 / 进行中 / 已验证 / 有偏差 |
| 偏差说明 | 记录 line id、术语差异或缺句情况 |
| 下一步动作 | 修正文案、补导入规则、统一术语表 |

### 5. 事件触发条件一致性 / Event Trigger Condition Parity

| 字段 | 内容 |
| --- | --- |
| 章节 / 区域 |  |
| 复刻对象 | 何时触发、由谁触发、tile/region/NPC interaction 条件 |
| 当前系统承载位置 | `content/manual/world.content.json` -> `maps[].triggers` |
| 数据来源 | 原始流程记录 / 事件脚本 / `content/source/maps/` 与 `content/source/text/` |
| 验证方法 | 逐步手动触发、trigger 数据核对、事件测试 |
| 当前状态 | 未开始 / 进行中 / 已验证 / 有偏差 |
| 偏差说明 | 记录 trigger id、触发方式或条件差异 |
| 下一步动作 | 修正 trigger 数据或补 interpreter 能力 |

### 6. Flag 变化一致性 / Flag Mutation Parity

| 字段 | 内容 |
| --- | --- |
| 章节 / 区域 |  |
| 复刻对象 | 剧情前后 flag 的设置、清除、依赖关系 |
| 当前系统承载位置 | `content/manual/world.content.json` -> `flags`；`content/manual/story.content.json` -> `events[].steps` |
| 数据来源 | 原始事件脚本 / 流程表 / `content/source/text/` |
| 验证方法 | 事件执行后状态快照、解释器测试、存档回读验证 |
| 当前状态 | 未开始 / 进行中 / 已验证 / 有偏差 |
| 偏差说明 | 记录 flag id、错误分支或遗漏状态 |
| 下一步动作 | 修正 opcode 数据或补 flag schema |

### 7. 地图切换与出生点一致性 / Map Transition And Spawn Parity

| 字段 | 内容 |
| --- | --- |
| 章节 / 区域 |  |
| 复刻对象 | 切图入口、目标地图、目标出生点、进入朝向 |
| 当前系统承载位置 | `content/manual/world.content.json` -> `portals`、`spawnPoints`；事件 `warp` |
| 数据来源 | 原始地图连通关系 / 流程表 / `content/source/maps/` |
| 验证方法 | 手动往返切图、spawn 坐标核对、存档恢复验证 |
| 当前状态 | 未开始 / 进行中 / 已验证 / 有偏差 |
| 偏差说明 | 记录 map id、spawn id、朝向或入口位置差异 |
| 下一步动作 | 修正 portal / warp / spawn 数据 |

### 8. 宝箱/物品获取一致性 / Chest And Item Gain Parity

| 字段 | 内容 |
| --- | --- |
| 章节 / 区域 |  |
| 复刻对象 | 宝箱位置、一次性领取、获得物品与数量 |
| 当前系统承载位置 | `maps[].triggers`、`events[].steps`、`items`、`consumedTriggerIds` |
| 数据来源 | 原始宝箱表 / 地图截图 / `content/source/maps/` |
| 验证方法 | 手动开启、背包状态核对、读档后复测 |
| 当前状态 | 未开始 / 进行中 / 已验证 / 有偏差 |
| 偏差说明 | 记录 trigger id、item id、数量或一次性逻辑偏差 |
| 下一步动作 | 修正事件步、物品定义或触发器属性 |

### 9. 商店商品与价格一致性 / Shop Inventory And Price Parity

| 字段 | 内容 |
| --- | --- |
| 章节 / 区域 |  |
| 复刻对象 | 商店是否出现、商品列表、价格、补给点行为 |
| 当前系统承载位置 | `content/manual/story.content.json` -> `shops` 与 `openShop`；`shopStates` |
| 数据来源 | 原始商店表 / 价格表 / `content/source/data/` |
| 验证方法 | 商店数据核对、事件触发验证、价格对照表检查 |
| 当前状态 | 未开始 / 进行中 / 已验证 / 有偏差 |
| 偏差说明 | 记录 shop id、item id、价格差异或缺货情况 |
| 下一步动作 | 修正商店定义、导入表或补交互能力 |

### 10. 战斗敌群与奖励一致性 / Battle Group And Reward Parity

| 字段 | 内容 |
| --- | --- |
| 章节 / 区域 |  |
| 复刻对象 | 敌群组成、敌人属性、掉落、金钱、经验 |
| 当前系统承载位置 | `content/generated/battle.content.json`；battle runtime reward 写回 |
| 数据来源 | 原始敌群表 / 战斗数据表 / `content/source/data/` |
| 验证方法 | 战斗触发验证、奖励状态快照、内容 pack 对照 |
| 当前状态 | 未开始 / 进行中 / 已验证 / 有偏差 |
| 偏差说明 | 记录 battleGroup id、enemy id、奖励差异 |
| 下一步动作 | 修正 source 数据、导入器映射或战斗计算规则 |

### 11. 队伍加入/离队一致性 / Party Join And Leave Parity

| 字段 | 内容 |
| --- | --- |
| 章节 / 区域 |  |
| 复刻对象 | 何时入队、何时离队、队伍顺序、状态保留 |
| 当前系统承载位置 | `events[].steps` -> `joinParty`；`partyMemberIds` 与 `partyStates` |
| 数据来源 | 原始剧情流程 / 队伍表 / `content/source/text/` |
| 验证方法 | 事件后队伍状态核对、菜单页验证、存档回读验证 |
| 当前状态 | 未开始 / 进行中 / 已验证 / 有偏差 |
| 偏差说明 | 记录 member id、时机偏差或状态丢失 |
| 下一步动作 | 扩展 opcode、修正事件数据、补回归测试 |

### 12. 菜单/存档行为一致性 / Menu And Save Behavior Parity

| 字段 | 内容 |
| --- | --- |
| 章节 / 区域 |  |
| 复刻对象 | 菜单开关、页签显示、存档后恢复地图/位置/物品/队伍/flag |
| 当前系统承载位置 | `menuController`、`menuOverlay`、`saveManager`、`GameStateRuntime` |
| 数据来源 | 当前运行时状态、目标章节行为记录 |
| 验证方法 | 手工存读档、菜单截图、save schema 与回归测试 |
| 当前状态 | 未开始 / 进行中 / 已验证 / 有偏差 |
| 偏差说明 | 记录具体状态字段未恢复或菜单展示差异 |
| 下一步动作 | 修正 save schema、UI 绑定或状态同步逻辑 |

## Lock Criteria
## 锁定标准

A small area is “locked complete” only when all relevant rows for that area are marked `已验证 / Verified` and the `偏差说明 / Divergence Notes` field is empty.
一个小区域只有在该区域相关行全部标记为 `已验证 / Verified` 且 `偏差说明 / Divergence Notes` 为空时，才能视为“锁定完成”。

If one row remains `进行中 / In Progress` or `有偏差 / Diverged`, that area is not locked.
只要仍有任意一行是 `进行中 / In Progress` 或 `有偏差 / Diverged`，该区域就不能视为锁定完成。
