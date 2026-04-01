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

## Current Slice Entries
## 当前切片条目

### Lou Sang Village Event Import
### 楼桑村事件导入

| 维度 | 复刻对象 | 当前系统承载位置 | 数据来源 | 验证方法 | 当前状态 | 偏差说明 | 下一步动作 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 事件触发条件一致性 / Event Trigger Condition Parity | `lou-sang-guard-trigger`、`lou-sang-chest-trigger`、`lou-sang-east-exit-trigger`、`lou-sang-shop-trigger` | `content/manual/world.content.json` -> `maps[town].triggers` | `content/source/maps/lou-sang-village.source.json` + curated `story.content.json` | `npm run regression-smoke` + 运行时手工触发 | 已验证 / Verified | 门卫与补给官现在通过共享 DSL 的 `ifHasItem` 串起“领取路引 -> 门卫验物 -> 放行”链路，同时保留旧 `gate-pass` flag 兼容 | 后续只需核对真实原文和真实路引来源细节，不再需要 scene 或 DSL 特判 |
| 对话文本一致性 / Dialogue Text Parity | Lou Sang 门卫、商店、出口、宝箱对话 | `content/manual/story.content.json` -> `dialogueLines` | 当前为手工 curated 第一版，尚未接入真实文本原表 | 回归报告 `reports/regression/latest/summary.md` + 人工文案审阅 | 有偏差 / Diverged | 文本已经从 demo 事件切到 Lou Sang 片段命名，但逐句原文尚未完成核对 | 接入真实文本 source 表并替换当前 curated 文案 |
| Flag 变化一致性 / Flag Mutation Parity | `gate-pass`、`lou-sang-east-gate-open`、`town-chest-opened`、`merchant-met` | `content/manual/story.content.json` -> `events[].steps`；`content/manual/world.content.json` -> `flags` | curated 事件 DSL + `travel-pass` key item | `golden-cases.json` + `regression-smoke` + save/load case | 进行中 / In Progress | 新链路已经不再依赖外部预置 `gate-pass` 才能推进；当前剩余差异是原始资料尚未核对出“路引发放时机与文本” | 后续按原始剧情资料微调补给官发证对白与时机 |
| 地图切换与出生点一致性 / Map Transition And Spawn Parity | Lou Sang 东门出口 -> `field-gate` | `lou-sang-east-exit-event` + `spawnPoints` | `content/source/maps/lou-sang-village.source.json` | `east-exit-warp-after-guard-opens-gate` 回归 case | 已验证 / Verified | 当前切图闭环可用，但出口提示动画与门体表现尚未实现 | 后续若需要原作级门动画，再扩展可视层，不改事件 DSL |
| 宝箱/物品获取一致性 / Chest And Item Gain Parity | Lou Sang 宝箱一次性领取 | `lou-sang-chest-event` + `lou-sang-chest-trigger` | `content/source/maps/lou-sang-village.source.json` + curated 物品配置 | `chest-first-open` / `chest-second-check` 回归 case | 有偏差 / Diverged | 一次性逻辑已验证，但奖励物仍沿用 `herb` 占位，尚未核对真实片段奖励 | 接入真实物品 source 表并核对奖励 |
| 商店商品与价格一致性 / Shop Inventory And Price Parity | Lou Sang 供给点交互骨架 | `lou-sang-shop-event` + `shops[starter-shop]` + `shopStates` + `shopOverlay` | 当前商店表来自既有 curated 数据 | `shop-counter-opens-shop-state` 回归 case + 运行时商店 overlay 核对 | 进行中 / In Progress | 现在已能打开独立商店 UI 并显示商品与价格，但商品列表和价格仍非真实片段数据，尚未支持购买流程 | 导入真实商店表，之后再补最小购买/出售交互 |
| 战斗敌群与奖励一致性 / Battle Group And Reward Parity | `field-battle-trigger` -> `eastern-road-patrols` -> `training-slimes` | `content/manual/world.content.json` -> `encounterTables` + `content/generated/battle.content.json` + `game/src/battle/battleRuntime.ts` | `content/source/data/demo-game-data.source.json` | `field-battle-roundtrip` 回归 case + `reports/battle-parity/latest/summary.md` | 进行中 / In Progress | 当前基线战斗已完成专项校准，明确锁定了敌群组成、出手顺序、基础伤害、经验、掉落和战后返回 world 状态；但敌群仍是 curated `training-slimes`，尚未替换为真实原始敌群表 | 后续导入真实敌群表后，继续复用 battle parity 报告核对是否保持同等级闭环 |

### East Road Relay Import
### 楼桑东路驿站导入

| 维度 | 复刻对象 | 当前系统承载位置 | 数据来源 | 验证方法 | 当前状态 | 偏差说明 | 下一步动作 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 地图布局一致性 / Map Layout Parity | `east-road`、`relay-post` 两张相连地图 | `content/manual/world.content.json` -> `maps[east-road]`、`maps[relay-post]` | `content/source/maps/east-road-relay.source.json` | `npm run import-all` + 运行时手工切图核对 | 进行中 / In Progress | 地图已进入 source/generated/manual 管线，但还没有原始截图级别的逐格核对记录 | 后续补地图截图对照与格子差异说明 |
| NPC 位置、朝向一致性 / NPC Position And Facing Parity | `road-scout`、`relay-healer`、`relay-porter` | `content/manual/world.content.json` -> `maps[].npcs` | `content/source/maps/east-road-relay.source.json` | 运行时站位核对 + `road-scout-talk` / `relay-rest-recovers-party` 回归 case | 进行中 / In Progress | 位置和朝向已接通，但尚未做原始参考图逐点对照 | 后续补原始摆位参考并锁定坐标 |
| 事件触发条件一致性 / Event Trigger Condition Parity | `field-east-road-trigger`、`road-scout-trigger`、`relay-rest-trigger`、`relay-cache-trigger` | `content/manual/world.content.json` -> `maps[field/east-road/relay-post].triggers` | `content/source/maps/east-road-relay.source.json` + curated `story.content.json` | `field-east-road-warp`、`road-scout-talk`、`relay-rest-recovers-party`、`relay-cache-first-open` | 已验证 / Verified | 共享 interpreter 与 trigger 分层已跑通，当前无 scene 特判 | 若后续补真实分支，再继续扩内容而不改 scene |
| 地图切换与出生点一致性 / Map Transition And Spawn Parity | `field -> east-road -> relay-post` 与回退链路 | `field-east-road-event`、`portals`、`spawnPoints` | `content/source/maps/demo-maps.source.json` + `content/source/maps/east-road-relay.source.json` | `field-east-road-warp` 回归 case + 运行时往返切图 | 进行中 / In Progress | 从 `field` 进入 `east-road` 已有回归覆盖，但 `relay-post` 往返仍主要靠手工验证 | 后续补一条 relay-post 往返的 golden case |
| 宝箱/物品获取一致性 / Chest And Item Gain Parity | 驿站木箱一次性领取 `bronze-sword` | `relay-cache-event` + `relay-cache-trigger` | 当前奖励为 curated 版本，尚未接入原始物品记录 | `relay-cache-first-open` 回归 case + 读档复测 | 有偏差 / Diverged | 一次性逻辑已验证，但奖励内容还没有原始资料核对 | 核对原始宝箱奖励，再决定是否替换 `bronze-sword` |
| 战斗敌群与奖励一致性 / Battle Group And Reward Parity | `east-road-battle-trigger` -> `relay-road-wolves` -> `field-wolves` | `content/manual/world.content.json` -> `encounterTables` + `content/generated/battle.content.json` + `game/src/battle/battleRuntime.ts` | `content/source/data/demo-game-data.source.json` | `east-road-battle-roundtrip` 回归 case + `reports/battle-parity/latest/summary.md` | 进行中 / In Progress | 驿道路野狼战现在也已完成专项校准，能核对敌群、顺序、伤害、奖励和战后返回；但敌群仍沿用现有 curated `field-wolves`，尚未导入真实原始敌群表 | 后续如果有原始驿道路敌群表，再导入真实 battle group，并复跑 battle parity 报告 |

### River Ford Advance Import
### 河渡前营导入

| 维度 | 复刻对象 | 当前系统承载位置 | 数据来源 | 验证方法 | 当前状态 | 偏差说明 | 下一步动作 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 地图布局一致性 / Map Layout Parity | `relay-east-pass`、`river-ford`、`ford-camp` 三张相连地图 | `content/manual/world.content.json` -> `maps[relay-east-pass]`、`maps[river-ford]`、`maps[ford-camp]` | `content/source/maps/river-ford-camp.source.json` | `npm run import-all` + 运行时切图核对 + chapter-03 lock report | 进行中 / In Progress | 地图已经进入 source/generated/manual 管线，但还没有原始截图级别的逐格锁定记录 | 后续补原始地图截图对照和 tile 差异说明 |
| NPC 位置、朝向一致性 / NPC Position And Facing Parity | `ford-clerk`、`ford-guard`、`river-sentry`、`camp-quartermaster`、`camp-veteran`、`camp-lookout` | `content/manual/world.content.json` -> `maps[].npcs` | `content/source/maps/river-ford-camp.source.json` | 运行时站位核对 + `check:npc-placement` + chapter-03 regression cases | 进行中 / In Progress | 位置和朝向已经接通，但仍缺原始参考图逐点比对 | 后续补原始摆位参考并锁定坐标 |
| 事件触发条件一致性 / Event Trigger Condition Parity | `relay-post-east-trigger`、`ford-clerk-trigger`、`ford-guard-trigger`、`ford-east-crossing-trigger`、`camp-quartermaster-trigger`、`ford-camp-cache-trigger` | `content/manual/world.content.json` -> `maps[relay-post/river-ford/ford-camp].triggers` | `content/source/maps/river-ford-camp.source.json` + curated `story.content.json` | `relay-post-east-warp`、`ford-clerk-issues-seal`、`ford-guard-opens-crossing`、`ford-east-crossing-warps`、`camp-quartermaster-opens-shop`、`ford-camp-cache-first-open` | 已验证 / Verified | 当前全部通过共享 interpreter 与 trigger 分层运行，没有 scene 特判 | 后续只需继续按真实资料微调文案和奖励，不需要为新区域加 runtime 分支 |
| Flag 变化一致性 / Flag Mutation Parity | `ford-seal-issued`、`river-ford-gate-open`、`ford-camp-cache-opened` | `content/manual/story.content.json` -> `events[].steps`；`content/manual/world.content.json` -> `flags` | curated chapter-03 event flow | regression smoke + 章节 lock report + save/load 路径复测 | 进行中 / In Progress | 当前文符发放、守兵放行和木箱一次性状态都已接通；剩余差异是原始资料还未核对出真实发放时机和奖励细节 | 后续按原始章节记录微调 flag 时机 |
| 地图切换与出生点一致性 / Map Transition And Spawn Parity | `relay-post -> relay-east-pass -> river-ford -> ford-camp` 与回退链路 | `relay-post-east-event`、`ford-east-crossing-event`、`portals`、`spawnPoints` | `content/source/maps/east-road-relay.source.json` + `content/source/maps/river-ford-camp.source.json` | chapter-03 warp regression cases + 运行时往返切图 | 进行中 / In Progress | 前进链路有 regression 覆盖，完整回退链路仍以手工验证为主 | 后续补一条完整往返的 golden case |
| 宝箱/物品获取一致性 / Chest And Item Gain Parity | 前营木箱一次性领取 `bandage` | `ford-camp-cache-event` + `ford-camp-cache-trigger` | 当前奖励为 curated 版本，尚未接入原始物品记录 | `ford-camp-cache-first-open` 回归 case + 读档复测 | 有偏差 / Diverged | 一次性逻辑已验证，但奖励内容还没有原始资料核对 | 核对原始木箱奖励，再决定是否替换 `bandage` |
| 商店商品与价格一致性 / Shop Inventory And Price Parity | `ford-camp-shop` 军需帐补给 | `camp-quartermaster-event` + `shops[ford-camp-shop]` + `shopOverlay` + `shopStates` | 当前商店表来自 curated chapter-03 版本 | `camp-quartermaster-opens-shop` 回归 case + 商店 overlay 核对 | 有偏差 / Diverged | 现在已经能打开独立商店 UI 并显示商品与价格，但商品列表和价格仍非真实资料最终版 | 后续导入真实商店表，并继续复用 `expectedUi.shopItemLines` 收口 |
| 战斗敌群与奖励一致性 / Battle Group And Reward Parity | `relay-east-pass-battle-trigger` -> `field-wolves`；`river-ford-battle-trigger` -> `river-bandits` | `content/manual/world.content.json` -> `encounterTables` + `content/generated/battle.content.json` + `game/src/battle/battleRuntime.ts` | `content/source/data/demo-game-data.source.json` | `relay-east-pass-battle-roundtrip`、`river-ford-battle-roundtrip` + `reports/battle-parity/latest/summary.md` | 进行中 / In Progress | 第三章首次在同一切片内并行使用“继承敌群 + 新增敌群”两套战斗数据；运行时闭环已打通，但 `river-bandits` 仍是当前 curated 数据，不是最终原始敌群表 | 后续若拿到真实敌群表，再替换 `river-bandits` 并复跑 battle parity |

### Ridgeway Camp Advance Import
### 山脊营寨推进导入

| 维度 | 复刻对象 | 当前系统承载位置 | 数据来源 | 验证方法 | 当前状态 | 偏差说明 | 下一步动作 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 地图布局一致性 / Map Layout Parity | `ridgeway-west-pass`、`ridgeway-watch`、`ridgeway-camp` 三张相连地图 | `content/manual/world.content.json` -> `maps[ridgeway-west-pass]`、`maps[ridgeway-watch]`、`maps[ridgeway-camp]` | `content/source/maps/ridgeway-camp.source.json` + `content/source/maps/river-ford-camp.source.json` | `npm run import-all` + 运行时切图核对 + chapter-04 lock report | 进行中 / In Progress | 第四章首次要求在上一章地图边界上直接扩一条新链路；地图 source 已进入管线，但最终 runtime 组装仍是手工步骤 | 后续评估是否需要给 map importer 增加 final-world assembly 辅助 |
| NPC 位置、朝向一致性 / NPC Position And Facing Parity | `ridge-runner`、`pass-sentry`、`watch-clerk`、`watch-guard`、`watch-lookout`、`ridge-quartermaster`、`ridge-veteran` | `content/manual/world.content.json` -> `maps[].npcs` | `content/source/maps/ridgeway-camp.source.json` | 运行时站位核对 + `check:npc-placement` + chapter-04 regression cases | 进行中 / In Progress | 位置和朝向已经接通，但仍缺原始参考图逐点核对；同时第 4 章首次把工具收益记录纳入章节 lock report | 后续补原始摆位参考并继续复用 `check:npc-placement` 收口 |
| 事件触发条件一致性 / Event Trigger Condition Parity | `ridge-runner-trigger`、`watch-clerk-trigger`、`watch-guard-trigger`、`ridgeway-east-gate-trigger`、`ridge-quartermaster-trigger`、`ridgeway-cache-trigger` | `content/manual/world.content.json` -> `maps[ridgeway-west-pass/ridgeway-watch/ridgeway-camp].triggers` | `content/source/maps/ridgeway-camp.source.json` + curated `story.content.json` | `ridge-runner-issues-token`、`watch-clerk-dialogue`、`watch-guard-opens-gate`、`ridgeway-east-gate-warps`、`ridge-quartermaster-opens-shop`、`ridgeway-cache-first-open` | 已验证 / Verified | 当前全部继续通过共享 interpreter 与 trigger 分层运行，没有为第 4 章加入 scene 特判 | 后续只需按真实资料微调对白和奖励，不需要为新区域改 runtime 分支 |
| Flag 变化一致性 / Flag Mutation Parity | `ridge-token-issued`、`ridgeway-east-gate-open`、`ridgeway-cache-opened` | `content/manual/story.content.json` -> `events[].steps`；`content/manual/world.content.json` -> `flags` | curated chapter-04 event flow | regression smoke + lock report + save/load 路径复测 | 进行中 / In Progress | 当前“领取山道符牌 -> 守兵验牌 -> 东门放行 -> 进入山营”链路已接通；剩余差异是发牌时机、文案和奖励仍待原始资料核对 | 后续按原始章节资料微调发牌和奖励时机 |
| 地图切换与出生点一致性 / Map Transition And Spawn Parity | `ford-camp -> ridgeway-west-pass -> ridgeway-watch -> ridgeway-camp` 与回退链路 | `portals`、`ridgeway-east-gate-event`、`spawnPoints` | `content/source/maps/river-ford-camp.source.json` + `content/source/maps/ridgeway-camp.source.json` | chapter-04 warp regression cases + 运行时往返切图 | 进行中 / In Progress | 第四章首次复用上章地图作为西侧边界入口；前进链路有回归覆盖，完整回退链路仍以手工验证为主 | 后续补一条完整往返的 golden case，覆盖回退到 `ford-camp` |
| 宝箱/物品获取一致性 / Chest And Item Gain Parity | 山营补给箱一次性领取 `travel-ration` | `ridgeway-cache-event` + `ridgeway-cache-trigger` | 当前奖励为 curated 版本，尚未接入原始物品记录 | `ridgeway-cache-first-open` 回归 case + 读档复测 | 有偏差 / Diverged | 一次性逻辑已验证，但奖励内容还没有原始资料核对 | 核对原始木箱奖励，再决定是否替换 `travel-ration` |
| 商店商品与价格一致性 / Shop Inventory And Price Parity | `ridgeway-camp-shop` 山营军需补给 | `ridge-quartermaster-event` + `shops[ridgeway-camp-shop]` + `shopOverlay` + `shopStates` | 当前商店表来自 curated chapter-04 版本 | `ridge-quartermaster-opens-shop` 回归 case + 商店 overlay 核对 | 有偏差 / Diverged | 现在已经能打开独立商店 UI 并显示商品与价格，但货表仍非真实资料最终版；同时第 4 章证明了 `shopOverlay + expectedUi.shopItemLines` 能稳定复用到新章节 | 后续导入真实商店表，并继续复用现有 UI 校验路径 |
| 战斗敌群与奖励一致性 / Battle Group And Reward Parity | `ridgeway-west-battle-trigger`、`ridgeway-watch-battle-trigger` -> `ridgeway-raiders` | `content/manual/world.content.json` -> `encounterTables` + `content/generated/battle.content.json` + `game/src/battle/battleRuntime.ts` | `content/source/data/demo-game-data.source.json` | `ridgeway-west-pass-battle-roundtrip`、`ridgeway-watch-battle-roundtrip` + `reports/battle-parity/latest/summary.md` | 进行中 / In Progress | 第四章首次把同一 battle group 绑定到两个相邻地图的不同 encounter table；运行时闭环已打通，但 `ridgeway-raiders` 仍是当前 curated 数据，不是最终原始敌群表 | 后续若拿到真实敌群表，再替换 `ridgeway-raiders` 并复跑 battle parity |

### Highland Waystation Dual-Track Import
### 高坡驿路双轨导入

| 维度 | 复刻对象 | 当前系统承载位置 | 数据来源 | 验证方法 | 当前状态 | 偏差说明 | 下一步动作 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 地图布局一致性 / Map Layout Parity | `highland-pass`、`waystation-gate`、`supply-court` 三张相连地图 | `content/manual/world.content.json` -> `maps[highland-pass]`、`maps[waystation-gate]`、`maps[supply-court]` | `content/source/maps/highland-waystation.source.json` + `content/source/maps/ridgeway-camp.source.json` | `npm run import-all` + 运行时切图核对 + chapter-05 lock report | 进行中 / In Progress | 第五章继续沿章节边界扩展三张新地图，地图 source 已进入管线，但最终 runtime 组装仍是手工步骤 | 后续评估是否需要给 map importer 增加 final-world assembly 辅助 |
| NPC 位置、朝向一致性 / NPC Position And Facing Parity | `pass-courier`、`pass-scout`、`gate-captain`、`supply-steward`、`court-veteran` | `content/manual/world.content.json` -> `maps[].npcs` | `content/source/maps/highland-waystation.source.json` | 运行时站位核对 + `check:npc-placement` + chapter-05 regression cases | 进行中 / In Progress | 位置和朝向已经接通，但仍缺原始参考图逐点核对；视觉替换当前通过 chapter-local backlog 单独管理 | 后续补原始摆位参考并复用 character sprite reconstruction |
| 事件触发条件一致性 / Event Trigger Condition Parity | `pass-courier-trigger`、`pass-scout-trigger`、`gate-captain-trigger`、`highland-east-gate-trigger`、`supply-steward-trigger`、`supply-cache-trigger` | `content/manual/world.content.json` -> `maps[highland-pass/waystation-gate/supply-court].triggers` | `content/source/maps/highland-waystation.source.json` + curated `story.content.json` | `pass-courier-issues-badge`、`pass-scout-dialogue`、`gate-captain-opens-east-gate`、`highland-east-gate-warps`、`supply-steward-opens-shop`、`supply-cache-first-open` | 已验证 / Verified | 当前全部继续通过共享 interpreter 与 trigger 分层运行，没有为第 5 章加入 scene 特判 | 后续只需按真实资料微调对白和奖励，不需要为新区域改 runtime 分支 |
| Flag 变化一致性 / Flag Mutation Parity | `waystation-badge-issued`、`highland-east-gate-open`、`supply-cache-opened` | `content/manual/story.content.json` -> `events[].steps`；`content/manual/world.content.json` -> `flags` | curated chapter-05 event flow | regression smoke + save/load roundtrip + chapter-05 lock report | 进行中 / In Progress | 当前“传令兵发牌 -> 守将验牌 -> 东门放行 -> 补给院开启”链路已接通；剩余差异是 badge 发放时机、文案和 chest 奖励仍待原始资料核对 | 后续按原始章节资料微调发牌、放行和奖励时机 |
| 地图切换与出生点一致性 / Map Transition And Spawn Parity | `ridgeway-camp -> highland-pass -> waystation-gate -> supply-court` 与回退链路 | `portals`、`highland-east-gate-event`、`spawnPoints` | `content/source/maps/ridgeway-camp.source.json` + `content/source/maps/highland-waystation.source.json` | chapter-05 warp regression cases + 运行时往返切图 | 进行中 / In Progress | 第五章继续扩展章节边界，前进链路已有 regression 覆盖，但完整回退链路仍以手工验证为主 | 后续补一条完整回退到 `ridgeway-camp` 的 golden case |
| 宝箱/物品获取一致性 / Chest And Item Gain Parity | 驿院补给箱一次性领取 `bandage` | `supply-cache-event` + `supply-cache-trigger` | 当前奖励为 curated 版本，尚未接入原始物品记录 | `supply-cache-first-open` 回归 case + 读档复测 | 有偏差 / Diverged | 一次性逻辑已验证，但奖励内容和数量还没有原始资料核对 | 核对原始木箱奖励，再决定是否调整 `bandage` 数量 |
| 商店商品与价格一致性 / Shop Inventory And Price Parity | `waystation-supply-shop` 驿院补给 | `supply-steward-event` + `shops[waystation-supply-shop]` + `shopOverlay` + `shopStates` | 当前商店表来自 curated chapter-05 版本 | `supply-steward-opens-shop` 回归 case + 商店 overlay 核对 | 有偏差 / Diverged | 现在已经能打开独立商店 UI 并显示商品与价格，但货表仍非真实资料最终版；视觉 placeholder 通过 asset registry 和 chapter-local backlog 单独管理，没有阻塞商店闭环 | 后续导入真实商店表，并继续复用现有 UI 校验路径 |
| 战斗敌群与奖励一致性 / Battle Group And Reward Parity | `highland-pass-battle-trigger`、`waystation-gate-battle-trigger` -> `highland-outlaws` | `content/manual/world.content.json` -> `encounterTables` + `content/generated/battle.content.json` + `game/src/battle/battleRuntime.ts` | `content/source/data/demo-game-data.source.json` | `highland-pass-battle-roundtrip`、`waystation-gate-battle-roundtrip` + `reports/battle-parity/latest/summary.md` | 进行中 / In Progress | 第五章继续复用“同一 battle group 绑定到两个地图”的模式；运行时闭环已打通，但 `highland-outlaws` 仍是当前 curated 数据，不是最终原始敌群表 | 后续若拿到真实敌群表，再替换 `highland-outlaws` 并复跑 battle parity |

### Border Fort Function-Point Import
### 边关前营功能点导入

| 维度 | 复刻对象 | 当前系统承载位置 | 数据来源 | 验证方法 | 当前状态 | 偏差说明 | 下一步动作 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 地图布局一致性 / Map Layout Parity | `border-road`、`border-fort-yard` 两张相连地图 | `content/manual/world.content.json` -> `maps[border-road]`、`maps[border-fort-yard]` | `content/source/maps/border-fort.source.json` + `content/source/maps/highland-waystation.source.json` | `npm run import-all` + 运行时切图核对 + chapter-06 lock report | 进行中 / In Progress | 第六章继续沿 chapter-05 东边界扩展两张新地图；地图 source 已进入管线，但最终 runtime 组装仍是手工步骤 | 后续评估是否继续给 map importer 增加 final-world assembly 辅助 |
| NPC 位置、朝向一致性 / NPC Position And Facing Parity | `border-clerk`、`border-sentry`、`fort-healer`、`fort-veteran` | `content/manual/world.content.json` -> `maps[].npcs` | `content/source/maps/border-fort.source.json` | 运行时站位核对 + `check:npc-placement` + chapter-06 regression cases | 进行中 / In Progress | 位置和朝向已经接通，但仍缺原始参考图逐点核对；chapter-06 先复用共享 sprite family 以保持吞吐 | 后续补原始摆位参考并继续复用 character sprite reconstruction |
| 事件触发条件一致性 / Event Trigger Condition Parity | `border-clerk-trigger`、`border-sentry-trigger`、`border-fort-gate-trigger`、`fort-healer-trigger`、`fort-cache-trigger` | `content/manual/world.content.json` -> `maps[border-road/border-fort-yard].triggers` | `content/source/maps/border-fort.source.json` + curated `story.content.json` | `border-clerk-issues-orders`、`border-sentry-opens-gate`、`border-fort-gate-warps`、`fort-healer-restores-party`、`fort-cache-first-open` | 已验证 / Verified | 当前全部继续通过共享 interpreter 与 trigger 分层运行，没有为第 6 章加入 scene 特判 | 后续只需按真实资料微调对白和奖励，不需要为新区域改 runtime 分支 |
| Flag 变化一致性 / Flag Mutation Parity | `border-orders-issued`、`border-fort-gate-open`、`fort-cache-opened` | `content/manual/story.content.json` -> `events[].steps`；`content/manual/world.content.json` -> `flags` | curated chapter-06 event flow | regression smoke + save/load roundtrip + chapter-06 lock report | 进行中 / In Progress | 当前“文吏交代 -> 守兵验令 -> 营门放行 -> 前营整备”链路已接通；剩余差异是文案和木箱奖励仍待原始资料核对 | 后续按原始章节资料微调发令、放行和奖励时机 |
| 地图切换与出生点一致性 / Map Transition And Spawn Parity | `supply-court -> border-road -> border-fort-yard` 与回退链路 | `portals`、`border-fort-gate-event`、`spawnPoints` | `content/source/maps/highland-waystation.source.json` + `content/source/maps/border-fort.source.json` | chapter-06 warp regression cases + 运行时往返切图 | 进行中 / In Progress | 第六章首次从 chapter-05 的功能地图直接向东延长一段闭环；前进链路已有 regression 覆盖，但从 `supply-court` 进入 chapter-06 仍以手工验证为主 | 后续补一条跨章入口到 `border-road` 的 golden case 或专门 portal 验证脚本 |
| 宝箱/物品获取一致性 / Chest And Item Gain Parity | 前营补给箱一次性领取 `bandage x2` | `fort-cache-event` + `fort-cache-trigger` | 当前奖励为 curated 版本，尚未接入原始物品记录 | `fort-cache-first-open` 回归 case + 读档复测 | 有偏差 / Diverged | 一次性逻辑已验证，但奖励内容和数量还没有原始资料核对 | 核对原始木箱奖励，再决定是否调整 `bandage` 数量 |
| 功能点一致性 / Function Point Parity | `fort-healer-event` 恢复点 | `fort-healer-event` + `restoreParty` + `gameStateRuntime` | curated chapter-06 功能点设计 | `fort-healer-restores-party` 回归 case + 存档复测 | 进行中 / In Progress | 当前先用恢复点收口前营补给环，不直接扩真实商店；功能闭环已验证，但是否应为真实商店仍待参考资料确认 | 后续在参考更完整时决定是否升级为真实商店切片 |
| 战斗敌群与奖励一致性 / Battle Group And Reward Parity | `border-road-battle-trigger` -> `border-road-outlaws` -> `highland-outlaws` | `content/manual/world.content.json` -> `encounterTables` + `content/generated/battle.content.json` + `game/src/battle/battleRuntime.ts` | `content/source/data/demo-game-data.source.json` | `border-road-battle-roundtrip` + `reports/battle-parity/latest/summary.md` | 进行中 / In Progress | 第六章继续复用共享 battle group，以避免为新章提前扩战斗系统；运行时闭环已打通，但 `highland-outlaws` 仍是当前 curated 数据，不是最终原始敌群表 | 后续若拿到真实敌群表，再决定是否拆出 chapter-06 专属 battle group 并复跑 battle parity |
