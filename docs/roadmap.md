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


## Milestone 2 closeout / 第二阶段收尾

中文：Milestone 2 已交付。下一阶段建议进入 Milestone 3：更强的脚本/地图系统、手动浏览器 QA、以及在安全边界内设计 emulator-backed PPU tracing 的实现细节。  
English: Milestone 2 has been delivered. The recommended next phase is Milestone 3: stronger script/map systems, manual browser QA, and implementation design for emulator-backed PPU tracing within the safety boundary.


## Milestone 3 delivered / 第三阶段已交付

- 中文：小沛城内原型、NPC、客栈、出入口和 `xiaopeiInnRested` 已实现。  
  English: Xiaopei interior prototype, NPCs, inn, exits, and `xiaopeiInnRested` are implemented.
- 中文：城镇内容按证据门槛标记为 prototype，等待未来 ROM 证据替换。  
  English: Town content is labeled prototype under the evidence gate and awaits future ROM evidence replacement.


## High-fidelity visual slice / 高还原视觉切片

- 中文：已开始把重点从工程原型纠偏到视觉/体验高还原。  
  English: Work has begun shifting from engineering prototype toward higher-fidelity visual/experience recreation.
- 中文：下一步应继续对照原版 UI 节奏、菜单布局和战斗画面，但仍避免提交 ROM payload。  
  English: Next steps should continue matching original UI rhythm, menu layout, and battle presentation while still avoiding committed ROM payload.


- 中文：城镇内部已加入可见 NPC、客栈和出口标识，减少盲踩事件点的问题。  
  English: Town interiors now include visible NPC, inn, and exit markers, reducing blind event-tile hunting.


- 中文：状态/物品菜单已从普通对话框升级为 FC 风格窗口。  
  English: Status and inventory menus have been upgraded from plain dialogue into FC-style windows.


- 中文：战斗界面已强化为更清晰的 FC RPG 窗口化军队对峙结构。  
  English: Battle UI has been strengthened into a clearer FC RPG-style windowed army-vs-army layout.


## Mapper 74 capture blocker / Mapper 74 截图阻塞

- 中文：项目内 NPM emulator `jsnes@2.1.0` 已验证不支持 Mapper 74；下一步需要评估另一个 NPM emulator 或实现 Mapper 74/MMC3-like 兼容支持。  
  English: Project-local NPM emulator `jsnes@2.1.0` has been verified not to support Mapper 74; next steps are evaluating another NPM emulator or implementing Mapper 74/MMC3-like compatibility.


- 中文：Mapper 74→MMC3 简单 shim 已验证失败：约 4 帧后 `invalid opcode at address $5466`。下一步需要真正的 Mapper 74/TQROM 支持或另一个 NPM emulator。  
  English: The simple Mapper 74→MMC3 shim has been verified to fail: after about 4 frames it hits `invalid opcode at address $5466`. Next steps require real Mapper 74/TQROM support or another NPM emulator.
