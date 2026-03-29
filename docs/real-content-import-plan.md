# Real Content Import Plan
# 真实内容导入计划

## Purpose
## 目的

This plan defines the first controlled move from placeholder demo content to real reproduction content.
这份计划用于定义从占位 demo 内容过渡到真实复刻内容的第一段受控迁移范围。

It is intentionally small. The goal is to prove the import path, validation path, and regression path before expanding to a full chapter.
它刻意保持很小，目标是在扩展到完整章节前，先验证导入路径、校验路径和回归路径。

Do not spread real content into scene code. All real content must stay in content data and importer outputs.
不要把真实内容散落到 scene 代码里。所有真实内容都必须留在内容数据和导入器输出中。

## First Slice Scope
## 第一段范围边界

The first real-content slice is limited to one small area with these elements:
第一段真实内容只覆盖一个小区域，且仅包含以下元素：

- 1 town map
- 1 张城镇地图
- 2 to 3 NPCs
- 2 到 3 个 NPC
- 1 guard-block event
- 1 个门卫阻拦事件
- 1 chest
- 1 个宝箱
- 1 shop
- 1 个商店
- 1 map exit
- 1 个地图出口
- optional 0 to 1 battle
- 可选 0 到 1 场战斗

Anything outside this boundary stays on placeholder content for now.
超出这个边界的部分暂时继续使用占位内容。

## Runtime Targets
## 运行时目标

The imported slice must map into these existing runtime seams:
导入后的这一段内容必须落到以下现有运行时接口中：

- map layout, collision, portals, spawn points, NPC positions, and triggers into `content/manual/world.content.json`
- 地图布局、碰撞、portal、出生点、NPC 位置和 trigger 进入 `content/manual/world.content.json`
- dialogue lines, event steps, and shop definitions into `content/manual/story.content.json`
- 对话行、事件步骤和商店定义进入 `content/manual/story.content.json`
- enemies and battle groups into source tables first, then generated runtime packs
- 敌人和战斗组先进入 source 原始表，再进入 generated 运行时包

If the imported slice needs a new runtime shape, add schema and tests first.
如果导入片段需要新的运行时结构，先补 schema 和测试。

## Required Raw Inputs
## 需要准备的原始输入

Prepare the following source inputs before starting import:
开始导入前，需要准备以下 source 输入：

- area map reference for one town section
- 该城镇区域的地图参考资料
- tile layout notes or extracted grid for that section
- 该区域的 tile 布局说明或提取出的网格数据
- passability notes for walls, counters, doors, and exits
- 墙体、柜台、门和出口的可通行性说明
- NPC roster for this slice: id, role, position, facing
- 该片段的 NPC 列表：id、职责、位置、朝向
- dialogue source for those NPCs
- 这些 NPC 的对话原文
- event condition notes for the guard block and chest
- 门卫阻拦和宝箱事件的触发条件说明
- shop source list: goods and prices
- 商店原始清单：商品和价格
- map exit target and spawn point target
- 地图出口目标和出生点目标
- optional encounter source if one battle is included
- 如果包含战斗，则准备对应的敌群原始资料

Minimum accepted evidence can be screenshots, extracted tables, transcription notes, or a verified reference spreadsheet, but every source file must be traceable to one area.
允许的最小证据可以是截图、提取表、誊写笔记或已核对表格，但每份 source 文件都必须能追溯到同一个区域。

## Directory Ownership
## 目录归属

### `content/source/`
### `content/source/`

Use `source/` for raw and importer-facing inputs only:
`source/` 只放原始输入和面向导入器的中间原料：

- extracted map tables
- 提取出的地图表
- dialogue transcription tables
- 对话誊写表
- NPC placement sheets
- NPC 摆放表
- shop lists
- 商店列表
- encounter source tables
- 遭遇战原始表

Do not put runtime-ready event JSON here.
不要把可直接运行的 event JSON 放在这里。

### `content/generated/`
### `content/generated/`

Use `generated/` for deterministic importer outputs only:
`generated/` 只放稳定、可重复生成的导入输出：

- generated battle packs
- 生成的战斗内容包
- sprite metadata
- 精灵元数据
- importer staging reports
- 导入器 staging 报告

Do not hand-edit these files.
不要手工编辑这些文件。

### `content/manual/`
### `content/manual/`

Use `manual/` for runtime-consumable content that still needs hand curation:
`manual/` 用于仍需人工整理、但已经可以被运行时消费的内容：

- final map JSON assembled from verified source inputs
- 基于核对后原始输入整理出的最终地图 JSON
- final event steps assembled into the existing opcode model
- 按现有 opcode 模型整理后的最终事件步骤
- dialogue lines with stable ids
- 带稳定 id 的对话行
- shop definitions after review
- 审核后的商店定义

If information is not verified enough for runtime use, keep it in `source/`, not `manual/`.
如果信息尚未核对到可用于运行时，就留在 `source/`，不要提前放进 `manual/`。

## Import Steps
## 导入步骤

1. Collect one-area source inputs and place them under `content/source/` with filenames tied to the area name.
1. 收集单一区域的 source 输入，并按区域名放入 `content/source/`。
2. Update or extend `tools/` importers so those inputs can be parsed repeatedly.
2. 更新或扩展 `tools/` 下的导入器，使这些输入能够被重复解析。
3. Generate deterministic staging output into `content/generated/` for inspection.
3. 在 `content/generated/` 生成可检查的稳定 staging 输出。
4. Translate verified staging output into final runtime content in `content/manual/`.
4. 将已核对的 staging 输出整理进 `content/manual/` 的最终运行时内容。
5. Wire the imported slice by data only: triggers, event ids, dialogue ids, shop ids, map exit, and optional battle group ids.
5. 仅通过数据接线：trigger、event id、dialogue id、shop id、地图出口以及可选的 battle group id。
6. Do not patch `WorldScene`, `BattleScene`, or menu code just to fit area-specific story flow.
6. 不要为了适配这一段区域剧情而修改 `WorldScene`、`BattleScene` 或菜单代码。

## Validation Steps
## 校验步骤

Run these after each meaningful import step:
每完成一个有意义的导入步骤后，运行以下检查：

1. `npm run import-all`
1. `npm run import-all`
2. `npm run validate-content`
2. `npm run validate-content`

Validation must confirm:
校验必须确认：

- generated output is up to date
- generated 输出是最新的
- manual content still matches schema
- manual 内容仍然符合 schema
- map references, event references, item references, and shop references are valid
- 地图引用、事件引用、物品引用和商店引用有效

## Regression Steps
## 回归步骤

After the slice is wired into runtime content, run:
当该片段已经接入运行时内容后，执行：

1. `npm test`
1. `npm test`
2. `npm run regression-smoke`
2. `npm run regression-smoke`

If the imported area replaces one of the current placeholder cases, update the relevant golden cases in `tests/regression/` in the same change.
如果导入区域替换了当前某个占位 case，就必须在同一次改动里同步更新 `tests/regression/` 里的黄金样例。

## What May Be Placeholder
## 哪些信息可以先占位

The following can be placeholder values during the first import slice:
在第一段真实导入中，以下内容允许先用占位值：

- portrait ids
- 头像 id
- sound effect ids when audio parity is not ready
- 当音频一致性尚未开始时的音效 id
- optional battle content if the area does not require battle yet
- 如果该区域当前不需要战斗，则战斗内容可以暂时缺省
- importer staging fields that are inspection-only and not runtime-consumed yet
- 仅用于检查、尚未被运行时消费的导入 staging 字段

## What May Not Be Placeholder
## 哪些信息不能占位

The following must be real and verified before the slice is called imported:
在该片段被称为“已导入”之前，以下内容必须是真实且已核对的：

- map dimensions and walkable layout
- 地图尺寸和可行走布局
- collision and blocked regions
- 碰撞和阻挡区域
- NPC positions and facing
- NPC 位置和朝向
- trigger-to-event links
- trigger 到 event 的链接
- gate-block condition and release condition
- 门卫阻拦条件和放行条件
- chest reward behavior
- 宝箱奖励行为
- shop goods and prices
- 商店商品和价格
- map exit target and spawn target
- 地图出口目标和出生点目标

## Lock Definition
## 锁定完成定义

The first real-content slice is considered locked only when all of these are true:
第一段真实内容只有在以下条件全部满足时才算锁定完成：

- the area stays within the defined scope boundary
- 区域内容仍在上面定义的范围边界内
- all raw inputs are stored under `content/source/`
- 所有原始输入都已放入 `content/source/`
- importer output is reproducible
- 导入输出可重复生成
- final runtime content lives in `content/manual/` and `content/generated/`, not scene code
- 最终运行时内容位于 `content/manual/` 和 `content/generated/`，而不是 scene 代码
- schema validation passes
- schema 校验通过
- golden regression passes or approved deviations are documented
- 黄金回归通过，或者已批准的偏差已被记录
- the imported area can be played from title entry through its local guard, chest, shop, and exit loop
- 可以从标题进入并走完该区域内部的门卫、宝箱、商店和出口闭环

## Codex Execution Notes
## 给 Codex 的执行说明

When using this plan, Codex should:
Codex 后续按这份计划执行时，应当：

- import one area only
- 一次只导入一个区域
- keep source ingestion, manual assembly, and runtime verification as separate commits when practical
- 在可行时，把 source 接入、manual 组装和运行时验证拆成独立提交
- stop and document any missing non-placeholder data instead of inventing story content
- 如果缺的是“不能占位”的数据，就停止并记录，不要编造剧情内容
- update regression cases when runtime-observable behavior changes
- 当运行时可观察行为变化时，同步更新回归 case
