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
- `npm run check:content`: validate manual and generated content packs plus cross-file references.
- `npm run check:content`：校验手工和生成内容包及其跨文件引用。
- `npm test`: run the Vitest suite once.
- `npm test`：运行一次 Vitest 测试套件。
- `npm run build`: type-check and create a production build in `dist/`.
- `npm run build`：执行类型检查并在 `dist/` 目录生成生产构建。

## Current Runtime
## 当前运行时状态

The playable skeleton contains four scenes:
当前可运行骨架包含四个场景：

- `BootScene`: loads bootstrap content and transfers control to the title screen.
- `BootScene`：加载启动内容并切换到标题画面。
- `TitleScene`: minimal entry screen; pressing Enter or clicking starts the world.
- `TitleScene`：最小化入口界面；按 Enter 或点击即可进入世界场景。
- `WorldScene`: renders data-driven maps, follows the player camera, applies grid collision, loads NPCs from content, and handles scene-safe portal and dialogue interactions while preserving world runtime state.
- `WorldScene`：渲染数据驱动地图、让摄像机跟随玩家、应用基于网格的碰撞、从内容数据加载 NPC，并在保留世界运行时状态的前提下处理 portal 和对话交互。
- `BattleScene`: placeholder battle screen entered with `B` and exited with `Esc`.
- `BattleScene`：占位战斗场景，按 `B` 进入，按 `Esc` 返回。

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
- `eventInterpreter`: executes declarative event steps such as dialogue, flags, shops, and battle launches.
- `eventInterpreter`：执行声明式事件步骤，例如对话、标记设置、商店打开和战斗启动。
- `dialogueSession` + `dialogueBox`: keep dialogue presentation and typewriter flow separate from event execution so portraits, audio, and choices can be extended later.
- `dialogueSession` + `dialogueBox`：将对话展示与逐字播放流程从事件执行中分离，为后续头像、音效和选项扩展预留接口。

`content/source/` is reserved for raw import material and is intentionally outside the runtime loading path. `content/manual/` is for hand-authored packs. `content/generated/` is for tool-produced packs that already satisfy runtime schema.
`content/source/` 保留给原始导入材料，刻意不进入运行时加载路径。`content/manual/` 用于手工编写内容包。`content/generated/` 用于已经满足运行时 schema 的工具生成内容包。

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
6. Face the merchant and confirm a different dialogue payload is shown.
6. 面向商人并确认会显示不同的对话内容。
7. Step onto the east gate portal in `town` to enter `field`.
7. 走到 `town` 东侧出口 portal，确认可以进入 `field`。
8. Confirm the player appears at the `field` gate spawn and can return through the west portal.
8. 确认玩家出现在 `field` 的门口出生点，并且可以通过西侧 portal 返回。

Use these tests as the baseline for future content pipelines, state machines, and gameplay systems.
后续扩展内容管线、状态机和玩法系统时，应以这些测试作为基线。
