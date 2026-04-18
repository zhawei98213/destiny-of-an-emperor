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
