# 游戏设计说明 / Game Design Notes

## 设计目标 / Design goal

中文：第一阶段目标不是一次性完成完整商业级复刻，而是形成一个可运行、可验证、可逐步替换数据的复古 RPG 闭环。  
English: The first milestone is not a complete commercial-grade remake. It is a runnable, verifiable retro-RPG loop whose placeholder data can be replaced incrementally by extracted private data.

## 当前 MVP 闭环 / Current MVP loop

1. 中文：玩家从小沛附近出发。  
   English: The player starts near Xiaopei.
2. 中文：进入小沛可恢复兵力与计策。  
   English: Entering Xiaopei restores soldiers and tactics.
3. 中文：沿官道探索会触发随机遭遇战。  
   English: Exploring the roads triggers random encounters.
4. 中文：战斗胜利获得金钱。  
   English: Winning battles grants gold.
5. 中文：虎牢关触发不可撤退 Boss 战。  
   English: Hulao Gate triggers a non-retreatable boss battle.
6. 中文：击败守军后设置胜利旗标，第一阶段目标完成。  
   English: Defeating the guard sets the victory flag and completes the first milestone.

## 系统 / Systems

### 地图 / Map

中文：当前地图是 32×30 tile 的程序化原型图，tile 类型包括平原、森林、山、水、官道、城镇、关隘。  
English: The current map is a 32×30 procedural prototype with grass, forest, mountain, water, road, town, and fort tiles.

### 队伍 / Party

中文：队伍单位拥有兵力、最大兵力、攻击、防御、计策点。兵力会影响伤害输出。  
English: Party units have soldiers, max soldiers, attack, defense, and tactics. Soldier count affects damage output.

### 战斗 / Battle

中文：战斗采用回合制命令菜单：攻击、计策、物品、撤退。Boss 战禁止撤退。  
English: Battles use a turn-based command menu: attack, tactic, item, run. Boss battles disable running.

### 存档 / Saves

中文：当前使用浏览器 `localStorage` 保存完整状态。后续如果状态结构变化，需要添加 save migration。  
English: The current prototype saves the full state to browser `localStorage`. Future state changes should include save migrations.

## 占位与替换 / Placeholders and replacement

中文：当前图形是 Canvas 程序绘制，占位文本和数据位于 `src/game/data.js`。当 ROM 数据提取稳定后，应生成 normalized JSON 并逐步替换这些占位数据。  
English: Current graphics are procedurally drawn in Canvas, while placeholder text and data live in `src/game/data.js`. Once ROM extraction stabilizes, generated normalized JSON should replace these placeholders incrementally.


## Milestone 2 implementation notes / 第二阶段实现说明

中文：玩法数据开始通过统一数据边界进入引擎。当前数据仍是占位/原型内容，不宣称等同原版 ROM 数据；后续私有 ROM 提取器应输出 normalized JSON，再生成不含 payload 的可提交 JS 投影。  
English: Gameplay data now enters the engine through a unified data boundary. Current data is still placeholder/prototype content and is not claimed to match authentic ROM data. Future private ROM extractors should output normalized JSON, then generate a commit-safe JS projection without payload.


## Save migration / 存档迁移

中文：第二阶段引入 `saveVersion: 2`。旧版无版本存档会在读取时补齐 `inventory`、`objectives`、`scoutRescued` 等字段；损坏的 JSON 存档会安全返回空结果，不会让游戏崩溃。  
English: Milestone 2 introduces `saveVersion: 2`. Versionless saves are completed on load with `inventory`, `objectives`, `scoutRescued`, and related fields; malformed JSON saves safely return no loaded state instead of crashing the game.


## Item system / 物品系统

中文：第二阶段把物品从占位菜单推进为可测试系统。当前 commit-safe prototype data 提供 `草药 / healing-herb`，可在战斗中恢复单个存活队员兵力，恢复值会 clamp 到最大兵力，使用成功后数量减少。该数据仍是原型数据，不宣称等同 ROM 原始参数。  
English: Milestone 2 turns inventory from a placeholder menu into a testable system. Current commit-safe prototype data provides `草药 / healing-herb`, usable in battle to restore soldiers for one living ally, clamped to max soldiers, decrementing quantity on success. This remains prototype data and is not claimed to match ROM-authentic parameters.
