# Destiny of an Emperor / 吞食天地复刻原型

> 中文：这是一个本地复刻工程：先搭建可玩的复古 RPG 引擎骨架，再把用户本地提供的 ROM 解析结果接入数据管线。  
> English: This is a local remake project. The first milestone builds a playable retro-RPG engine scaffold, then connects it to a private data pipeline derived from the user-provided local ROM.

## 当前状态 / Current status

中文：当前仓库已经可以运行一个无第三方依赖的浏览器 Canvas 原型。它不是完整原版游戏，但已经包含第一阶段 MVP 所需的探索、菜单、随机战斗、Boss 目标和本地 ROM metadata 管线。  
English: The repository now runs a no-dependency browser Canvas prototype. It is not the full original game yet, but it includes the first MVP loop: overworld exploration, menu flow, random battles, a boss objective, and local ROM metadata integration.

## 运行 / Run

中文：推荐使用本地静态服务器，避免浏览器在 `file://` 下限制 ES modules 与 `fetch()`。  
English: Use a local static server so browser ES modules and `fetch()` work consistently.

```sh
npm start
# or: python3 -m http.server 8080
```

Open / 打开：<http://localhost:8080>

## 操作 / Controls

| 中文 | English | Key |
| --- | --- | --- |
| 移动 | Move | Arrow keys / WASD，打开后可以直接移动 / move immediately after launch |
| 确认、打开菜单 | Confirm / open menu | Enter / Z |
| 取消 | Cancel | Esc / X |
| 保存 | Save | F5 |
| 读取 | Load | F9 |

## 当前玩法循环 / Current gameplay loop

中文：从小沛附近出发，在城镇整备，沿官道探索，遭遇随机敌军，最后击破虎牢关守军完成第一阶段目标。  
English: Start near Xiaopei, rest in town, explore the road, survive random encounters, and defeat the Hulao Gate guard to complete the first milestone objective.

已实现 / Implemented:

- 中文：大地图格子移动；English: grid-based overworld movement.
- 中文：城镇、关隘、桥梁事件；English: town, fort, and bridge events.
- 中文：菜单、状态、物品占位、保存；English: menu, status, inventory placeholder, and save flow.
- 中文：随机遭遇战；English: random encounters.
- 中文：回合制战斗指令：攻击、计策、物品、撤退；English: turn-based commands: attack, tactic, item, run.
- 中文：不可撤退 Boss 战与胜利旗标；English: non-retreatable boss battle with a victory flag.
- 中文：本地 ROM metadata HUD；English: local ROM metadata display in the HUD.

## ROM 分析 / ROM analysis

中文：ROM 与提取资产是私有文件，已在 `.gitignore` 中忽略。不要提交 ROM、提取图像、提取音乐、文本 dump 或其它受版权保护 payload。  
English: ROMs and extracted assets are private and ignored by `.gitignore`. Do not commit ROM files, extracted graphics, extracted music, text dumps, or other copyrighted payloads.

```sh
npm run rom:inspect
npm run rom:chr
npm run rom:town-probe
```

等价底层命令 / Equivalent low-level commands:

```sh
python3 tools/nes_rom_tool.py inspect '吞食天地2.nes' --out .omx/rom-analysis/metadata.json
python3 tools/nes_rom_tool.py extract-chr-candidates '吞食天地2.nes' --out-dir .omx/rom-analysis/chr-candidates
```

更多说明 / More details:

- `docs/rom-analysis.md`
- `docs/data-pipeline.md`
- `docs/roadmap.md`
- `docs/game-design.md`

## 验证 / Verification

```sh
npm run check
python3 -m py_compile tools/nes_rom_tool.py
```

中文：`npm run check` 会做 JS 语法检查和无浏览器 smoke test。  
English: `npm run check` runs JavaScript syntax checks and a browserless smoke test.

## 代码提交纪律 / Commit discipline

中文：提交时遵守 Lore commit protocol；每个提交说明“为什么改”，并记录测试结果。  
English: Commits follow the Lore commit protocol: explain why the change exists and record verification evidence.


## Data boundary / 数据边界

中文：运行时 gameplay data 通过 `src/game/data.js` 统一导出；第二阶段会逐步把 prototype data、存档、物品、目标链都纳入可测试的数据边界。  
English: Runtime gameplay data is exported through `src/game/data.js`; Milestone 2 progressively routes prototype data, saves, items, and objective chains through a testable data boundary.


## Save compatibility / 存档兼容

中文：当前存档格式版本为 2。旧版本地存档会在读取时迁移；损坏存档会安全忽略。  
English: The current save format version is 2. Older local saves are migrated on load; malformed saves are ignored safely.


## Items / 物品

中文：战斗中的“物品”指令现在会尝试使用 `草药` 恢复受伤队员；物品数量会保存到版本 2 存档。  
English: The battle “Item” command now attempts to use `healing-herb` to restore a wounded ally; item quantity is persisted in version 2 saves.


## Objective chain / 目标链

中文：第一阶段目标是击破虎牢关；完成后会解锁第二目标 `rescue-scout`，前往北平南道救回应急斥候。  
English: The first objective is clearing Hulao Gate; once complete, the second objective `rescue-scout` unlocks and sends the player to Beiping South Road to rescue an emergency scout.


Runtime trace plan / 运行时追踪计划：

```sh
python3 tools/nes_rom_tool.py trace-plan '吞食天地2.nes' --out .omx/rom-analysis/runtime-trace-plan.json
```

中文：该命令只生成 metadata-only 计划，不生成可提交素材。  
English: This command writes a metadata-only plan and does not generate commit-safe assets.


## Milestone 2 completion / 第二阶段完成状态

中文：第二阶段已完成：数据边界、存档迁移、物品系统、第二目标链、ROM metadata-only 追踪计划和双语过程记录均已实现。运行 `npm run check` 可验证核心数据、存档、物品与目标链 smoke tests。  
English: Milestone 2 is complete: data boundary, save migration, item system, second objective chain, ROM metadata-only tracing plan, and bilingual process records are implemented. Run `npm run check` to verify the core data, save, item, and objective-chain smoke tests.


## Town interior / 城镇内部

中文：Milestone 3 加入小沛城内原型：玩家可从大地图进入小沛、与 NPC 对话、使用客栈恢复兵力/计策，并从城门返回大地图。当前城镇布局和台词标记为 prototype，等待未来 ROM 证据替换。  
English: Milestone 3 adds a prototype Xiaopei interior: the player can enter from the overworld, talk to NPCs, use the inn to restore soldiers/tactics, and exit back to the overworld. The current layout and text are labeled prototype until future ROM evidence replaces them.


## High-fidelity visual slice / 高还原视觉切片

中文：当前版本已开始纠偏到“看起来像 FC RPG / 吞食天地风格”的方向：使用更接近 NES 的黑底白框 UI、复古调色板、图块纹理、战斗指令窗、队伍/敌军窗口和像素角色表现。仍然不使用或提交 ROM 提取素材。  
English: The current version has started pivoting toward a more FC RPG / Destiny-of-an-Emperor-like look: NES-like black/white window UI, retro palette, patterned tiles, battle command windows, party/enemy panels, and pixel character presentation. It still does not use or commit ROM-extracted assets.


## Visible town events / 可见城镇事件

中文：小沛城内现在会直接显示 NPC、客栈标识和出口标识，不再需要玩家盲踩事件点。  
English: Xiaopei interior now visibly renders NPCs, the inn marker, and the exit marker so players no longer have to blindly step on event tiles.


## FC-style menu / FC 风格菜单

中文：主菜单现在不再把状态/物品塞进普通对话框，而是显示独立的 FC 风格窗口。Enter/Z 打开菜单，选择“状态”或“物品”进入子窗口，X/Esc 返回。  
English: The main menu no longer shows status/inventory as plain dialogue. It now displays dedicated FC-style windows. Press Enter/Z to open the menu, choose Status or Items to enter a sub-window, and use X/Esc to return.
