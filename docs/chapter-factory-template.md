# Chapter Factory Template
# 章节工厂模板

## Purpose
## 目的

Use this template to plan and execute one real remake chapter or one bounded real area with the same workflow every time.
用这份模板以统一工艺规划和执行一个真实复刻章节，或一个边界清晰的真实区域。

Copy this file into `docs/chapters/chapter-xx-plan.md` before starting a new chapter slice.
开始新章节切片前，把本文件复制为 `docs/chapters/chapter-xx-plan.md`。

This template must stay aligned with:
本模板必须与以下内容保持一致：

- `AGENTS.md`
- `docs/parity-matrix.md`
- `docs/testing-and-regression.md`
- `content/source -> tools -> generated/manual -> runtime`

## 1. Chapter Scope Definition
## 1. 章节范围定义

### Chapter Id
### 章节编号

- `chapterId`:
- 章节编号：

### Area Boundary
### 区域边界

- Included maps:
- 纳入范围的地图：
- Included NPC groups:
- 纳入范围的 NPC 组：
- Included events:
- 纳入范围的事件：
- Included shops:
- 纳入范围的商店：
- Included battle slices:
- 纳入范围的战斗切片：
- Included item/chest slices:
- 纳入范围的物品/宝箱切片：

### Out Of Scope
### 明确不做

- Deferred maps:
- 延后处理的地图：
- Deferred events:
- 延后处理的事件：
- Deferred systems:
- 延后处理的系统能力：

Rule:
规则：

- Keep the slice small enough that parity and regression can be closed in the same phase.
- 范围要小到能在同一阶段内完成 parity 和 regression 收口。

## 2. Raw Source Checklist
## 2. 原始资料清单

Prepare and store all raw inputs under `content/source/`.
所有原始资料都必须准备好并放入 `content/source/`。

### Map Sources
### 地图资料

- area screenshots or extraction source:
- 区域截图或提取来源：
- tile layout notes:
- tile 布局说明：
- collision notes:
- collision 说明：
- portal and spawn notes:
- portal 与 spawn 说明：

### NPC And Event Sources
### NPC 与事件资料

- NPC roster with id, role, position, facing:
- NPC 清单，包含 id、职责、位置、朝向：
- dialogue transcription source:
- 对话誊写来源：
- event trigger notes:
- 事件触发条件说明：
- flag mutation notes:
- flag 变化说明：

### Shop / Battle / Item Sources
### 商店 / 战斗 / 物品资料

- shop goods and prices:
- 商店商品与价格：
- enemy group source:
- 敌群资料：
- reward / drop source:
- 奖励 / 掉落资料：
- chest contents source:
- 宝箱内容资料：

Rule:
规则：

- If a fact is not verified enough for runtime use, keep it in source notes and do not silently move it into `content/manual/`.
- 如果某个事实还没有核对到可用于运行时，就留在 source 资料里，不要悄悄挪进 `content/manual/`。

## 3. Map Import Steps
## 3. 地图导入步骤

1. Define one bounded map slice and its importer-facing raw file names.
1. 先定义一个边界清晰的地图切片，以及对应的导入器输入文件名。
2. Add raw map input under `content/source/maps/`.
2. 把原始地图输入放入 `content/source/maps/`。
3. Extend or reuse map importer logic in `tools/` only if the current importer cannot represent the source format.
3. 只有当前导入器无法表达该格式时，才扩展或复用 `tools/` 下的地图导入逻辑。
4. Run `npm run import-all`.
4. 执行 `npm run import-all`。
5. Review generated staging output in `content/generated/import-staging/`.
5. 检查 `content/generated/import-staging/` 中的 staging 输出。
6. Assemble final runtime map content in `content/manual/world.content.json`.
6. 在 `content/manual/world.content.json` 组装最终运行时地图内容。
7. Run `npm run validate-content`.
7. 执行 `npm run validate-content`。

Expected output:
预期产出：

- map layout
- 地图布局
- collision
- 碰撞
- portals
- 出口
- spawn points
- 出生点
- static NPC placement
- 静态 NPC 摆放

## 4. NPC And Event Import Steps
## 4. NPC 与事件导入步骤

1. Define the event batch boundary before editing content.
1. 动手前先定义事件批次边界。
2. Confirm whether current event DSL already supports the required behavior.
2. 先确认当前事件 DSL 是否已经支持目标行为。
3. If not, add the smallest runtime/schema/test extension first.
3. 如果不支持，先补最小 runtime/schema/test 扩展。
4. Add or update triggers in `content/manual/world.content.json`.
4. 在 `content/manual/world.content.json` 中新增或更新 trigger。
5. Add or update dialogue and event steps in `content/manual/story.content.json`.
5. 在 `content/manual/story.content.json` 中新增或更新对白与事件步骤。
6. Keep all story and dialogue text in Simplified Chinese unless the task explicitly says otherwise.
6. 除非任务明确要求其他语言，否则剧情和对白统一使用简体中文。
7. Bind each real event to at least one parity row and one regression case.
7. 每个真实事件都要绑定至少一个 parity 条目和一个 regression case。

Rule:
规则：

- Trigger defines when; event defines what.
- trigger 定义何时触发；event 定义具体行为。

## 5. Shop / Enemy Group / Item Import Steps
## 5. 商店 / 敌群 / 物品导入步骤

### Shop
### 商店

1. Put raw shop tables under `content/source/data/` or the chapter-specific source location.
1. 把原始商店表放进 `content/source/data/` 或章节专用 source 位置。
2. Generate or curate stable runtime-facing shop definitions.
2. 生成或整理稳定的运行时商店定义。
3. Verify shop UI uses `expectedUi`, not only `shopStates`.
3. 商店验证必须走 `expectedUi`，不能只看 `shopStates`。

### Enemy Groups
### 敌群

1. Put enemy and battle-group raw inputs under source tables first.
1. 先把敌人和 battle-group 原始输入放进 source 表。
2. Generate `content/generated/battle.content.json` through tools.
2. 通过工具生成 `content/generated/battle.content.json`。
3. Connect battle references by ids only.
3. 只通过 id 接通战斗引用。

### Items And Chests
### 物品与宝箱

1. Import item definitions before wiring chest rewards.
1. 先导入 item 定义，再接宝箱奖励。
2. Keep one-shot behavior in trigger/event/state, not in scene logic.
2. 一次性领取逻辑必须放在 trigger/event/state 中，不能写进 scene。

## 6. Parity Audit Steps
## 6. Parity 校验步骤

1. Open `docs/parity-matrix.md`.
1. 打开 `docs/parity-matrix.md`。
2. Add or update rows for the current chapter slice.
2. 为当前章节切片新增或更新条目。
3. Mark rows only as:
3. 条目状态只允许使用：
   - `未开始 / Not Started`
   - `进行中 / In Progress`
   - `已验证 / Verified`
   - `有偏差 / Diverged`
4. For every row, fill:
4. 每一行都必须填写：
   - current system location
   - 当前系统承载位置
   - data source
   - 数据来源
   - validation method
   - 验证方法
   - divergence notes
   - 偏差说明
   - next action
   - 下一步动作
5. Keep content gaps and runtime gaps separate.
5. 内容缺口和 runtime 缺口必须分开写。

## 7. Regression Steps
## 7. Regression 校验步骤

Run these in order after each meaningful chapter step:
每完成一个有意义的章节步骤后，按顺序执行：

1. `npm run import-all`
1. `npm run import-all`
2. `npm run validate-content`
2. `npm run validate-content`
3. `npm run test`
3. `npm run test`
4. `npm run regression-smoke`
4. `npm run regression-smoke`

If runtime-observable behavior changed:
如果运行时可观察行为发生变化：

- update or add a golden case in `tests/regression/`
- 更新或新增 `tests/regression/` 中的 golden case
- extend `expectedUi` when the change affects visible UI
- 如果改动影响可见 UI，就扩展 `expectedUi`

## 8. Lock Criteria
## 8. 锁定完成标准

This chapter slice is locked only when all of the following are true:
只有满足以下全部条件，这个章节切片才能算锁定完成：

- Scope stayed within the declared boundary.
- 实际工作没有越出声明范围。
- All real raw inputs are stored under `content/source/`.
- 所有真实原始资料都已放入 `content/source/`。
- Final runtime content is in `content/manual/` and `content/generated/`, not in scene code.
- 最终运行时内容位于 `content/manual/` 与 `content/generated/`，而不是 scene 代码。
- `npm run validate-content` passes.
- `npm run validate-content` 通过。
- `npm test` passes.
- `npm test` 通过。
- `npm run regression-smoke` passes, or approved deviations are documented in parity notes.
- `npm run regression-smoke` 通过，或者已批准偏差已写入 parity 说明。
- Relevant parity rows are `已验证 / Verified` with no unresolved blocking note.
- 相关 parity 条目都已到 `已验证 / Verified`，且没有未解决的阻塞说明。

## 9. Common Divergence Types And Repair Priority
## 9. 常见差异类型与修复优先级

### Priority 1: Blocks Further Real Import
### 优先级 1：阻塞后续真实导入

- Missing schema for a new content format
- 新内容格式没有 schema
- Runtime cannot load or display imported data
- runtime 无法加载或显示导入数据
- Trigger/event seam is insufficient for the next real event batch
- trigger/event 接缝不足以承载下一批真实事件
- No regression path exists for a newly visible behavior
- 新出现的可见行为没有 regression 路径

### Priority 2: Blocks Parity Verification
### 优先级 2：阻塞一致性核对

- Shop, battle, or dialogue UI cannot show the imported data clearly
- 商店、战斗或对白 UI 不能清晰显示导入数据
- Golden case exists but does not check the relevant visible result
- golden case 已存在，但没有检查相关可见结果
- Save/load does not preserve the state required for chapter re-check
- 存读档不能保留章节复核所需状态

### Priority 3: Content Divergence, Runtime Already Supports It
### 优先级 3：runtime 已支持，但内容仍有偏差

- Placeholder text not yet replaced
- 占位对白尚未替换
- Placeholder item reward not yet replaced
- 占位物品奖励尚未替换
- Placeholder prices or enemy rewards not yet replaced
- 占位价格或敌群奖励尚未替换

Rule:
规则：

- Fix one Priority 1 blocker before polishing Priority 2 or Priority 3 differences.
- 在处理优先级 2 或 3 之前，先解决一个优先级 1 阻塞项。

## Copy Block
## 可复制起始块

```md
# Chapter XX Plan
# 第 XX 章计划

## 1. Chapter Scope Definition
## 1. 章节范围定义

- chapterId:
- included maps:
- included NPC groups:
- included events:
- included shops:
- included battle slices:
- included item/chest slices:
- out of scope:

## 2. Raw Source Checklist
## 2. 原始资料清单

- map sources:
- NPC and event sources:
- shop / enemy group / item sources:

## 3. Map Import Steps
## 3. 地图导入步骤

- [ ]

## 4. NPC And Event Import Steps
## 4. NPC 与事件导入步骤

- [ ]

## 5. Shop / Enemy Group / Item Import Steps
## 5. 商店 / 敌群 / 物品导入步骤

- [ ]

## 6. Parity Audit Steps
## 6. Parity 校验步骤

- [ ]

## 7. Regression Steps
## 7. Regression 校验步骤

- [ ]

## 8. Lock Criteria
## 8. 锁定完成标准

- [ ]

## 9. Current Divergences And Priority
## 9. 当前差异与优先级

- Priority 1:
- Priority 2:
- Priority 3:
```
