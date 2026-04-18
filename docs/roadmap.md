# 复刻执行路线 / Remake Roadmap

## 目标 / Goal

中文：在不提交 ROM 或提取素材的前提下，持续推进一个可玩的高还原复古 RPG：先完成可运行引擎，再逐步用用户本地 ROM 的私有解析结果替换占位数据。  
English: Build a playable high-fidelity retro RPG while keeping ROMs and extracted assets out of source control. First complete a runnable engine, then progressively replace placeholder data with private extraction results from the user-provided local ROM.

## 双线策略 / Two-track strategy

1. **可运行引擎 / Runnable engine**  
   中文：用占位或程序绘制素材复现地图、菜单、队伍、遭遇战、回合战斗、Boss、存档等核心循环。  
   English: Use placeholder/procedural visuals to recreate the core loop: map, menus, party, encounters, turn-based battles, bosses, and saves.

2. **私有 ROM 数据管线 / Private ROM data pipeline**  
   中文：只解析用户本地提供且不入库的 ROM，逐步提取并归一化图形、文本、地图、武将、物品、战斗和脚本数据。  
   English: Analyze only the user-provided local ROM, keep outputs private, and normalize graphics, text, maps, officers, items, battles, and scripts over time.

## 已完成 / Done

- 中文：无依赖浏览器 Canvas 原型。  
  English: No-dependency browser Canvas prototype.
- 中文：地图移动、事件对话、城镇整备、随机遇敌、回合战斗。  
  English: Map movement, event dialogue, town rest, random encounters, turn-based battles.
- 中文：虎牢关 Boss 目标与胜利旗标，形成第一阶段闭环。  
  English: Hulao Gate boss objective and victory flag, forming the first milestone loop.
- 中文：ROM header/bank/候选 tile sheet 工具。  
  English: ROM header/bank/candidate tile-sheet tooling.
- 中文：ROM 与私有提取产物已被 `.gitignore` 保护。  
  English: ROMs and private extraction outputs are protected by `.gitignore`.

## 下一步 / Next steps

1. 中文：实现 Mapper 74 / CHR-RAM 运行时 PPU 写入追踪。  
   English: Implement Mapper 74 / CHR-RAM runtime PPU write tracing.
2. 中文：抓取真实 pattern table、palette、nametable 快照。  
   English: Capture real pattern table, palette, and nametable snapshots.
3. 中文：通过字库 tile 与文本引用建立 text table。  
   English: Discover the text table by correlating font tiles and text references.
4. 中文：识别武将、物品、敌人、战斗参数表并导出 JSON。  
   English: Identify officer, item, enemy, and battle parameter tables and export JSON.
5. 中文：把 `src/game/data.js` 切换为读取导出的 normalized JSON。  
   English: Switch `src/game/data.js` to consume exported normalized JSON.
6. 中文：扩展城镇、剧情脚本、地图切换与存档格式迁移。  
   English: Expand towns, story scripts, map transitions, and save-format migration.


## Milestone 2 progress / 第二阶段进度

- 中文：已开始建立规范化可提交数据边界。  
  English: The normalized commit-safe data boundary has started.


- 中文：已加入第二目标链 `rescue-scout` / `scoutRescued`，前置条件为 `hulaoCleared`。  
  English: Added the second objective chain `rescue-scout` / `scoutRescued`, gated by `hulaoCleared`.
