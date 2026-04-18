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
| 移动 | Move | Arrow keys / WASD |
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
