# Reusable Area Pattern Toolkit
# 可复用区域模式工具包

This toolkit captures the area patterns that have already repeated across the first ten real slices.
这个工具包把前十个真实区域里已经反复出现的区域模式沉淀下来。

## Goal
## 目标

- reduce repeated setup when importing later chapters
- 减少后续章节导入时的重复搭建
- keep map/event/NPC patterns data-driven
- 保持地图 / 事件 / NPC 模式的数据驱动
- reuse the same chapter factory, regression, parity, and visual-backfill hooks
- 复用同一套 chapter factory、regression、parity 和 visual backfill 接口

## Pattern Catalog
## 模式目录

### 1. Town Pattern
### 1. 城镇模式

- maps: one safe town map plus one exit map or immediate field portal
- 地图：一个安全城镇图，加一个出口图或直接接野外 portal
- npc set: guide / clerk / merchant / guard
- NPC 组合：向导 / 文吏 / 商人 / 守兵
- common event chain: intro dialogue -> supply/shop -> gate check -> exit warp
- 常见事件链：开场对白 -> 补给 / 商店 -> 守门检查 -> 出口切图

### 2. Dungeon Or Cave Pattern
### 2. 洞穴 / 迷宫模式

- maps: one to three connected interior maps
- 地图：一到三张相连室内地图
- content nodes: one checkpoint NPC or sign, one chest, one encounter region
- 内容节点：一个检查点 NPC 或标牌、一个宝箱、一个遭遇区域
- common event chain: checkpoint text -> chest -> encounter -> exit warp
- 常见事件链：检查点文本 -> 宝箱 -> 遭遇 -> 出口切图

### 3. Gate Or Guard Pattern
### 3. 栅门 / 守兵模式

- maps: road map plus gated interior or next route
- 地图：道路图加带门禁的内部区域或下一段路线
- common event chain: clerk issues order -> sentry validates flag/item -> gate trigger warps
- 常见事件链：文吏发令 -> 守兵验 flag / 物品 -> 栅门 trigger 切图
- preferred DSL: `ifFlag` or `ifHasItem` with `elseSteps`
- 推荐 DSL：带 `elseSteps` 的 `ifFlag` 或 `ifHasItem`

### 4. Shop Pattern
### 4. 商店模式

- owner NPC: merchant / quartermaster / purveyor
- 所属 NPC：商人 / 军需官 / 粮官
- common event chain: dialogue -> `openShop` -> `playSfx` -> `end`
- 常见事件链：dialogue -> `openShop` -> `playSfx` -> `end`
- audit hooks: economy parity, UI parity, regression `shopItemLines`
- 审计挂点：economy parity、UI parity、regression `shopItemLines`

### 5. Chest Pattern
### 5. 宝箱模式

- trigger kind: `tile`, `once: true`
- trigger 类型：`tile`，`once: true`
- common event chain: dialogue -> one or more `giveItem` -> `setFlag` -> `playSfx`
- 常见事件链：dialogue -> 一个或多个 `giveItem` -> `setFlag` -> `playSfx`
- audit hooks: regression first-open, consumed trigger ids, save/load
- 审计挂点：首次开启回归、consumed trigger ids、存读档

### 6. Story Checkpoint Pattern
### 6. 剧情检查点模式

- content node: one NPC or one tile gate that changes route state
- 内容节点：一个 NPC 或一个改变路线状态的 tile gate
- common event chain: dialogue -> set or clear progression flag -> optional warp
- 常见事件链：dialogue -> 设置或清除推进 flag -> 可选 warp
- audit hooks: progression gating, chapter lock report, discrepancy triage
- 审计挂点：progression gating、chapter lock report、discrepancy triage

## Usage
## 使用方式

- Start new chapter work with `npm run batch-chapter-bootstrap -- --id <chapter-id> --title "<title>" --area "<area>"`.
- 新章节先用 `npm run batch-chapter-bootstrap -- --id <chapter-id> --title "<title>" --area "<area>"` 起骨架。
- Copy the closest pattern from `content/manual/patterns/reusable-area-patterns.json`.
- 从 `content/manual/patterns/reusable-area-patterns.json` 复制最接近的模式。
- Reuse existing trigger, event, regression, and battle naming before creating a new flow.
- 在新造流程前，优先复用已有 trigger、event、regression 和 battle 命名。

## Current Limits
## 当前限制

- This toolkit does not replace source-map assembly.
- 这个工具包还不能替代 source 地图组装。
- It does not replace chapter-local visual backlog authoring.
- 它也不能替代章节级 visual backlog 编写。
- It is meant to reduce repeated content scaffolding, not to create new runtime branches.
- 它的目标是减少重复内容搭建，不是生成新的 runtime 分支。
