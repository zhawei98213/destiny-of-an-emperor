# Destiny of an Emperor Remake Skeleton
# 吞食天地重制版项目骨架

This repository starts a data-driven 2D JRPG remake foundation inspired by the structure of classic console RPGs. The current goal is infrastructure, not game content: clean module boundaries, typed content contracts, reference-safe content packs, and testable runtime seams.
这个仓库提供了一个数据驱动的 2D JRPG 重制版基础框架，参考了经典主机 RPG 的结构。当前重点是基础设施而不是具体游戏内容，包括清晰的模块边界、类型化内容契约、可安全引用的内容包，以及可测试的运行时接缝。

## Directory Layout
## 目录结构

- `game/`: Phaser + TypeScript runtime, scenes, and core systems.
- `game/`：Phaser + TypeScript 运行时、场景和核心系统。
- `docs/`: design notes, architecture decisions, and future import pipeline docs.
- `docs/`：设计说明、架构决策以及后续导入管线文档。
- `tools/`: content build scripts, validators, and migration utilities.
- `tools/`：内容构建脚本、校验器和迁移工具。
- `content/source/`: raw extracted or imported upstream data.
- `content/source/`：提取或导入得到的原始上游数据。
- `content/generated/`: machine-generated runtime content artifacts.
- `content/generated/`：工具生成的运行时内容产物。
- `content/manual/`: hand-authored JSON content and placeholder data.
- `content/manual/`：手工编写的 JSON 内容和占位数据。
- `content/manual/asset-registry.content.json`: logical asset registry and chapter-level asset overrides used by the runtime.
- `content/manual/asset-registry.content.json`：运行时使用的逻辑资源注册层和章节级资源覆盖。
- `content/reference/`: traceable screenshots, crops, and other non-runtime reference inputs for parity and future asset reconstruction.
- `content/reference/`：用于一致性核对和未来资产重建的可追溯截图、裁切图等非运行时参考输入。
- `tests/`: automated tests for content, runtime systems, and scene wiring.
- `tests/`：内容、运行时系统和场景接线的自动化测试。
- `skills/`: repository-specific agent workflows and reusable instructions.
- `skills/`：仓库内专用的 agent 工作流和可复用指令。

## Commands
## 常用命令

- `npm install`: install project dependencies.
- `npm install`：安装项目依赖。
- `npm run dev`: start the local Vite dev server.
- `npm run dev`：启动本地 Vite 开发服务器。
- `npm run import-all`: regenerate every first-pass importer output from `content/source/`.
- `npm run import-all`：从 `content/source/` 重新生成第一版全部导入结果。
- `npm run validate-content`: verify generated outputs and validate runtime content.
- `npm run validate-content`：检查 generated 输出并校验运行时内容。
- `npm run check:content`: validate manual and generated content packs plus cross-file references.
- `npm run check:content`：校验手工和生成内容包及其跨文件引用。
- `npm test`: run the Vitest suite once.
- `npm test`：运行一次 Vitest 测试套件。
- `npm run regression-smoke`: run import, validation, and the minimum regression suite in one command.
- `npm run regression-smoke`：用一条命令执行导入、校验和最小回归测试。
- `npm run battle-parity`: generate the current battle parity calibration report for real battle slices.
- `npm run battle-parity`：为当前真实战斗切片生成战斗一致性校准报告。
- `npm run event-json`: lint event JSON structure and show formatting drift in `content/manual/story.content.json`.
- `npm run event-json`：检查 `content/manual/story.content.json` 的事件 JSON 结构并提示格式化漂移。
- `npm run format:events`: rewrite `content/manual/story.content.json` into stable formatting for reviewable diffs.
- `npm run format:events`：把 `content/manual/story.content.json` 重写成稳定格式，便于审查 diff。
- `npm run check:npc-placement`: verify that manual NPC coordinates do not overlap blocked tiles, portals, spawn points, or other NPCs.
- `npm run check:npc-placement`：校验 manual NPC 坐标不会与阻挡格、portal、spawn 点或其他 NPC 重叠。
- `npm run check:chapter-completeness`: compare chapter metadata with currently reachable maps, NPCs, events, shops, and enemy groups.
- `npm run check:chapter-completeness`：把章节元数据与当前可达地图、NPC、事件、商店和敌群做对照。
- `npm run chapter-bootstrap -- --id <chapter-id> --title "<title>" --area "<area>"`: create chapter metadata, plan, and lock-report scaffolds from the existing templates.
- `npm run chapter-bootstrap -- --id <chapter-id> --title "<title>" --area "<area>"`：基于现有模板创建章节元数据、计划和锁定报告骨架。
- `npm run chapter-status-report`: generate one chapter-level status summary aligned with completeness, parity, regression, and UI parity.
- `npm run chapter-status-report`：生成与 completeness、parity、regression 和 UI parity 对齐的章节级状态摘要。
- `npm run chapter-lock-checklist -- --id <chapter-id>`: generate a lock checklist for one chapter.
- `npm run chapter-lock-checklist -- --id <chapter-id>`：为单个章节生成锁定检查清单。
- `npm run asset-check`: generate the current chapter asset parity report and identify placeholder asset categories.
- `npm run asset-check`：生成当前章节资产一致性报告，并识别占位资产分类。
- `npm run tileset-crop-normalize`: generate the current tileset crop/normalization task plan from reference candidates.
- `npm run tileset-crop-normalize`：根据 reference candidate 生成当前 tileset 裁切/归一化任务计划。
- `npm run tileset-reconstruct`: validate tileset candidates, palette consistency, dimensions, collision review hints, and runtime attachment.
- `npm run tileset-reconstruct`：校验 tileset candidate、palette 一致性、尺寸、collision review 辅助信息和 runtime 接线状态。
- `npm run reference-validate`: validate `content/reference/manifest.json` and write the current reference pipeline report.
- `npm run reference-validate`：校验 `content/reference/manifest.json`，并生成当前 reference pipeline 报告。
- `npm run reference-query -- --subject-type <type> --subject-id <id>`: query indexed references for one subject such as a map, NPC, or UI element.
- `npm run reference-query -- --subject-type <type> --subject-id <id>`：按对象查询已索引的参考资料，例如地图、NPC 或 UI 元素。
- `npm run text-check`: generate the current text integrity report, including chapter coverage and demo-versus-real text ratio.
- `npm run text-check`：生成当前文本完整性报告，包括章节覆盖和 demo/真实文本占比。
- `npm run performance-baseline`: generate the current runtime performance baseline report and hotspot summary.
- `npm run performance-baseline`：生成当前运行时性能基线报告和热点摘要。
- `npm run ui-parity`: generate the current UI behavior parity report for real chapter scenes.
- `npm run ui-parity`：为真实章节场景生成当前 UI 行为一致性报告。
- `npm run save-migration-check`: run the dedicated save compatibility regression tests.
- `npm run save-migration-check`：执行专门的存档兼容性回归测试。
- `npm run pre-release-check -- --mode light|full`: run the aggregated pre-release gate and print one verdict for continued importing versus beta-test readiness.
- `npm run pre-release-check -- --mode light|full`：执行聚合后的发布前检查，并输出“是否适合继续导入 / 是否适合发布测试版”的统一结论。
- Regression reports are written to `reports/regression/latest/`.
- 回归报告会写入 `reports/regression/latest/`。
- Battle parity reports are written to `reports/battle-parity/latest/`.
- 战斗一致性校准报告会写入 `reports/battle-parity/latest/`。
- Performance baseline reports are written to `reports/performance/latest/`.
- 性能基线报告会写入 `reports/performance/latest/`。
- UI parity reports are written to `reports/ui-parity/latest/`.
- UI 一致性报告会写入 `reports/ui-parity/latest/`。
- Reference pipeline reports are written to `reports/reference/latest/`.
- Reference pipeline 报告会写入 `reports/reference/latest/`。
- Chapter workflow reports are written to `reports/chapters/latest/`.
- 章节工作流报告会写入 `reports/chapters/latest/`。
- Pre-release reports are written to `reports/pre-release/latest/`.
- 发布前检查报告会写入 `reports/pre-release/latest/`。
- `npm run build`: type-check and create a production build in `dist/`.
- `npm run build`：执行类型检查并在 `dist/` 目录生成生产构建。
- GitHub Actions now runs `validate-content`, `test`, `build`, `regression-smoke`, and `parity-score` on push and pull request.
- GitHub Actions 现在会在 push 和 pull request 上执行 `validate-content`、`test`、`build`、`regression-smoke` 和 `parity-score`。

## Current Runtime
## 当前运行时状态

The playable skeleton contains four scenes:
当前可运行骨架包含四个场景：

- `BootScene`: loads bootstrap content and transfers control to the title screen.
- `BootScene`：加载启动内容并切换到标题画面。
- `TitleScene`: minimal entry screen; pressing Enter or clicking starts the world.
- `TitleScene`：最小化入口界面；按 Enter 或点击即可进入世界场景。
- `WorldScene`: renders data-driven maps, follows the player camera, applies grid collision, loads NPCs from content, handles scene-safe portal and dialogue interactions, and delegates menu plus battle requests to dedicated runtime modules instead of owning those flows directly.
- `WorldScene`：渲染数据驱动地图、处理场景安全的 portal 与对话交互，并把菜单、战斗请求和世界状态同步委托给独立的运行时与 UI 模块，而不是直接在 scene 内部承载这些流程。
- `BattleScene`: consumes a structured battle request, builds ally and enemy units from content, resolves basic attacks plus simple enemy AI, and returns to the world after victory or defeat.
- `BattleScene`：消费结构化的战斗请求，从内容数据构建我方与敌方单位，完成基础攻击和简单敌方 AI，并在胜利或失败后返回世界场景。

The world layer now uses one unified event system for NPC interaction, tile triggers, and region triggers.
世界层现在使用一套统一事件系统来驱动 NPC 交互、tile trigger 和 region trigger。

The current vertical slice is a small outpost chapter: speak to the guide, obtain a gate pass from the quartermaster, pass the guard, fight once in the eastern field, return to town, and save or load the result.
当前垂直切片是一个小型前哨章节：先与向导交谈，再从军需官处取得通行凭证，通过守卫离开城镇，在东部野外完成一次战斗，然后返回城镇并进行存档或读档。

## Data-Driven Seams
## 数据驱动接缝

The first extension points are intentionally typed and data-driven:
首批扩展点刻意保持为类型化且数据驱动的结构：

- `contentLoader`: loads manifests from `content/manual/` and `content/generated/`, validates every pack, then merges them into one runtime database.
- `contentLoader`：从 `content/manual/` 和 `content/generated/` 读取清单，校验每个内容包，再合并为一个运行时数据库。
- `schema`: maps every JRPG content model to a matching TypeScript validator, including maps, events, items, NPCs, shops, battle groups, flags, quest states, inventory, and save data.
- `schema`：为每种 JRPG 内容模型提供对应的 TypeScript 校验器，包括地图、事件、物品、NPC、商店、战斗组、标记、任务状态、背包和存档数据。
- `saveManager`: persists typed save slots and validates save references against the loaded content database.
- `saveManager`：持久化类型化存档槽，并依据已加载的内容数据库校验存档引用。
- `menuController` + `menuOverlay`: keep the main menu shell, tab switching, and save/load actions separate from scene code while reading from one unified runtime snapshot.
- `menuController` + `menuOverlay`：把主菜单骨架、页签切换和存档读档动作从 scene 代码中分离出去，并统一读取同一份运行时快照。
- `battleRuntime`: keeps battle requests, unit models, attack resolution, enemy AI turns, and reward summaries in pure runtime code so `BattleScene` stays focused on UI and flow control.
- `battleRuntime`：把战斗请求、单位模型、攻击结算、敌方 AI 回合和奖励汇总放在纯运行时代码中，让 `BattleScene` 只负责 UI 和流程控制。
- `eventInterpreter`: executes declarative event steps such as dialogue, flags, shops, and battle launches.
- `eventInterpreter`：执行声明式事件步骤，例如对话、标记设置、商店打开和战斗启动。
- `gameStateRuntime` + `worldTriggerResolver`: keep persistent flags, inventory, party membership, and consumed one-shot triggers separate from scene code while mapping NPC, tile, and region triggers to events.
- `gameStateRuntime` + `worldTriggerResolver`：把持久化 flags、inventory、party 成员和一次性 trigger 消费状态从 scene 中分离出来，并负责把 NPC、tile、region trigger 映射到事件。
- `gameStateRuntime`: now acts as the unified state container for flags, inventory, party, money, world position, quest states, chapter progress, and shop state so SaveData stays versioned and extendable.
- `gameStateRuntime`：现在也作为 flags、背包、队伍、金钱、世界坐标、任务状态、章节进度和商店状态的统一状态容器，使 SaveData 保持可版本化且可扩展。
- `assetRegistry`: resolves logical asset keys such as NPC visuals and UI panels into concrete placeholder/imported bindings, with chapter-level overrides and unified fallback behavior.
- `assetRegistry`：把 NPC 表现、UI 面板等逻辑资源 key 解析为具体的 placeholder/imported 绑定，并支持章节级覆盖与统一回退策略。
- `tileset reconstruction workflow`: keeps tileset candidate manifests, normalization plans, and runtime palette attachment outside scenes so reconstructed map visuals can be replaced in batches.
- `tileset reconstruction workflow`：把 tileset candidate manifest、归一化计划和 runtime palette 接线放在 scene 之外，便于后续成批替换重建后的地图视觉资源。
- `dialogueSession` + `dialogueBox`: keep dialogue presentation and typewriter flow separate from event execution so portraits, audio, and choices can be extended later.
- `dialogueSession` + `dialogueBox`：将对话展示与逐字播放流程从事件执行中分离，为后续头像、音效和选项扩展预留接口。

Supported event opcodes currently include `dialogue`, `setFlag`, `clearFlag`, `ifFlag`, `ifNotFlag`, `warp`, `giveItem`, `removeItem`, `joinParty`, `startBattle`, `playSfx`, `openShop`, and `end`.
当前支持的事件 opcode 包括 `dialogue`、`setFlag`、`clearFlag`、`ifFlag`、`ifNotFlag`、`warp`、`giveItem`、`removeItem`、`joinParty`、`startBattle`、`playSfx`、`openShop` 和 `end`。

`content/source/` is reserved for raw import material and is intentionally outside the runtime loading path. `content/manual/` is for hand-authored packs. `content/generated/` is for tool-produced packs that already satisfy runtime schema. Do not hand-edit `content/generated/`; re-run `npm run import:all` instead.
`content/source/` 保留给原始导入材料，刻意不进入运行时加载路径。`content/manual/` 用于手工编写内容包。`content/generated/` 用于已经满足运行时 schema 的工具生成内容包。不要手工修改 `content/generated/`，需要更新时请重新执行 `npm run import:all`。

## Testing
## 测试

The current test suite covers:
当前测试套件覆盖以下内容：

- content schema parsing and manifest-based loading
- 内容 schema 解析与基于 manifest 的加载
- cross-reference validation failures with explicit error messages
- 带明确错误信息的跨引用校验失败场景
- event interpreter command execution
- 事件解释器命令执行
- world runtime movement, collision, and portal transitions
- 世界运行时中的移动、碰撞和 portal 切换
- NPC facing-based interaction targeting and dialogue typewriter flow
- 基于朝向的 NPC 交互目标判定和对话逐字显示流程
- unified event interpreter branching, warp, inventory mutation, and trigger resolution
- 统一事件解释器的条件分支、warp、物品变更和 trigger 解析
- menu controller save/load flow and world position restoration
- 菜单控制器的存档读档流程和世界坐标恢复
- battle runtime victory, defeat, reward payout, and world return flow
- 战斗运行时中的胜负判定、奖励发放和返回世界流程
- golden regression cases for guard gating, chest rewards, battle roundtrip, and save/load restoration
- 针对门卫放行、宝箱奖励、战斗往返以及存档恢复的黄金回归样例
- battle parity calibration for the first two real battle slices, covering enemy composition, turn order, damage, rewards, and world return consistency
- 针对前两个真实战斗切片的战斗一致性校准，覆盖敌群组成、出手顺序、伤害、奖励和返回 world 状态一致性
- scene registry wiring and boot-first startup order
- 场景注册表接线和以 Boot 开始的启动顺序

Manual verification in the current demo:
当前 demo 的手工验证步骤：

1. Run `npm run dev`.
1. 执行 `npm run dev`。
2. Start the game and move around `town` with the arrow keys.
2. 启动游戏，在 `town` 中用方向键移动。
3. Walk into walls to confirm collision blocks movement.
3. 走向墙体，确认碰撞会阻止移动。
4. Face the village guide and press `Space` to start dialogue, then press `Space` again to skip or advance lines.
4. 面向村口向导并按 `Space` 开始对话，再按 `Space` 可跳过当前逐字显示或进入下一句。
5. Confirm the player cannot move while dialogue is active and regains movement after the dialogue ends.
5. 确认对话过程中玩家无法移动，并且对话结束后能恢复移动控制。
6. Face the quartermaster, confirm the first conversation grants the road pass, then talk again later to restore the party and verify the supply-point loop works.
6. 面向军需官，确认第一次交谈会发放通行凭证；再次交谈时则会恢复队伍状态，形成补给点闭环。
7. Walk onto the chest tile in `town` and confirm the chest event grants an `Herb`.
7. 走到 `town` 的宝箱 tile 上，确认宝箱事件会获得一个 `Herb`。
8. After receiving the pass, talk to the guard again and confirm the same event interpreter now warps the player to `field`.
8. 拿到通行许可后再次与守卫对话，确认同一套事件解释器会把玩家传送到 `field`。
9. Move through the `field` region trigger and confirm it can start the training battle flow.
9. 走进 `field` 的 region trigger，确认它可以启动训练战斗流程。
10. In battle, press `A` to use the basic attack, wait for the enemy AI turn, and confirm the battle resolves to victory or defeat without freezing.
10. 在战斗中按 `A` 使用基础攻击，等待敌方 AI 行动，并确认战斗能正常分出胜负而不会卡住。
11. After battle, press `Space` to return to `WorldScene` and confirm gold, item drops, and experience are written into the menu state.
11. 战斗结束后按 `Space` 返回 `WorldScene`，并确认金钱、掉落物和经验已经写入菜单状态。
12. Press `M` to open the main menu, use Left and Right to switch Status, Inventory, Party, and System pages, and confirm gold plus current map coordinates are visible.
12. 按 `M` 打开主菜单，使用左右方向键切换状态、背包、队伍和系统页面，并确认能看到金钱和当前地图坐标。
13. Press `S` in the system page to save, move to a different tile, then press `L` to load and confirm map, position, party, inventory, and flags are restored.
13. 在系统页按 `S` 存档，移动到另一个格子后按 `L` 读档，确认地图、位置、队伍、背包和 flags 都被恢复。

Use these tests as the baseline for future content pipelines, state machines, and gameplay systems.
后续扩展内容管线、状态机和玩法系统时，应以这些测试作为基线。
