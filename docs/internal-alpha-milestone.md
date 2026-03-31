# Internal Alpha Milestone / 内部测试版里程碑

## Purpose / 目的

This document is the current engineering control panel for the internal alpha milestone.
It records what is playable, what is locked, what still blocks scale-up, and whether the
project is ready to continue importing more real content.

本文档是当前内部测试版里程碑的工程总控面板，用来记录当前可玩范围、已锁定内容、
仍然阻塞规模化导入的问题，以及项目是否已经进入“可持续扩大内容规模”的阶段。

## Current Playable Real Area Scope / 当前可玩的真实区域范围

The current internal alpha slice contains four real area chapters connected into one
continuous playable chain.

当前内部测试版切片包含 4 个真实区域章节，已经串成一条连续可玩的链路。

1. `chapter-01-lou-sang`
   Lou Sang Village, village east gate, field handoff.
   楼桑村、东门口、通往野外的切换入口。
2. `chapter-02-east-road-relay`
   East Road, Relay Post, chapter boundary handoff from the field.
   东路、驿站、从野外进入第二章节的边界切换。
3. `chapter-03-river-ford`
   Relay East Pass, River Ford, Ford Camp.
   驿站东口、渡口、前营。
4. `chapter-04-ridgeway-camp`
   Ridgeway West Pass, Ridgeway Watch, Ridgeway Camp.
   山道西口、山岗哨、山营。

Current practical loop:

当前实际可玩闭环：

- Enter world from title and move through four real chapter slices.
- Trigger guard checks, treasure rewards, shop or supply interactions, and chapter gate items.
- Trigger region encounters and return to world after battle.
- Save and load from the current runtime state.

- 从标题进入 world，并在 4 个真实章节切片之间推进。
- 触发门卫检查、宝箱奖励、商店或补给点交互、章节门禁物品推进。
- 触发区域遭遇战，并在战斗后返回 world。
- 从当前运行时状态执行存档和读档。

## Locked Chapters / 已锁定章节列表

No chapter is fully locked yet.

当前还没有任何章节达到完全锁定状态。

Current chapter states:

当前章节状态：

- `chapter-01-lou-sang`: `parity-review`
- `chapter-02-east-road-relay`: `validating`
- `chapter-03-river-ford`: `validating`
- `chapter-04-ridgeway-camp`: `validating`

Interpretation:

状态解读：

- Chapter 1 is closest to lock, but still has spatial parity blockers.
- Chapters 2 to 4 are playable and regression-covered, but not yet chapter-locked.

- 第 1 章离锁定最近，但仍有空间一致性 blocker。
- 第 2 到第 4 章已经可玩且有回归覆盖，但还未达到章节锁定标准。

## Internal Alpha Lock Result / 本次内部测试版锁定结果

Latest full pre-release result:

最近一次完整发布前检查结果：

- `Continue Import / 适合继续导入`: `yes`
- `Beta Test / 适合发布测试版`: `no`
- `Passed Checks / 通过检查数`: `9/9`

Engineering conclusion:

工程判断：

- The project has entered the **sustainably scalable content expansion** phase.
- The project has **not** entered the release-candidate or beta-test phase.

- 项目已经进入**可持续扩大内容规模**阶段。
- 项目**尚未**进入可对外测试或准发布阶段。

Why this is considered scalable:

为什么判断为“可持续扩大内容规模”：

- Four real chapters have already been imported through the same pipeline.
- Chapter bootstrap, completeness checks, lock checklist, parity, regression, text, asset,
  UI, battle, and pre-release workflows are all established.
- New content is no longer relying on ad hoc scene logic to become playable.

- 已经有 4 个真实章节通过同一套流程导入。
- chapter bootstrap、completeness、lock checklist、parity、regression、text、asset、UI、
  battle、pre-release 这些流程已经成形。
- 新内容不再依赖临时 scene 逻辑才能变成可玩内容。

What still prevents wider milestone locking:

仍然阻止更大范围锁定的原因：

- parity blockers are still active
- save-restore chapter coverage is incomplete
- asset and text warning volume is still high
- several UI and main-flow parity gaps remain open

- parity blocker 仍未清零
- 章节级 save-restore 覆盖仍不完整
- 资产和文本 warning 总量仍然偏高
- 多个 UI 与主流程 parity 缺口仍未收口

## Current Blockers / 仍存在的 Blocker

Current `P0` backlog from discrepancy triage:

当前来自 discrepancy triage 的 `P0` backlog：

1. `chapter-01-lou-sang:spatial-parity`
   Map structure, collision, and NPC placement are not fully locked against the current parity target.
   地图结构、碰撞和 NPC 摆位还没有按当前 parity 目标锁死。
2. `chapter-02-east-road-relay:save-restore`
   Chapter-level save and restore regression is still missing.
   章节级存档恢复回归仍然缺失。
3. `chapter-03-river-ford:save-restore`
   Chapter-level save and restore regression is still missing.
   章节级存档恢复回归仍然缺失。
4. `chapter-04-ridgeway-camp:save-restore`
   Chapter-level save and restore regression is still missing.
   章节级存档恢复回归仍然缺失。

Current `P1` items that affect the main player-facing experience:

当前影响主流程体验的 `P1` 项：

- main-flow event parity for chapters 1 to 4
- `ui:shop-flow`
- `ui:battle-command-flow`

- 第 1 到第 4 章的主流程事件一致性
- `ui:shop-flow`
- `ui:battle-command-flow`

## Known Divergence Categories / 已知偏差分类

These divergence categories are already visible in parity, UI parity, battle parity,
asset parity, text integrity, and discrepancy triage reports.

这些偏差分类已经体现在 parity、UI parity、battle parity、asset parity、text integrity、
discrepancy triage 报告中。

1. **Spatial parity / 空间一致性**
   Map shape, passability, spawn placement, and NPC placement still need lock-level verification.
   地图形状、可通行区域、出生点、NPC 摆位仍需锁定级别核验。
2. **Main-flow event parity / 主流程事件一致性**
   Real chapter progression exists, but some gate, branch, and sequence details still need source verification.
   真实章节推进已经可跑，但部分门禁、分支和顺序细节仍需与原始资料核对。
3. **Battle local parity / 战斗局部一致性**
   Battles are playable and calibrated at baseline, but real enemy tables and exact rewards still need tighter alignment.
   战斗已经可玩且有基线校准，但真实敌群表和精确奖励还需继续对齐。
4. **Shop local parity / 商店局部一致性**
   Shop opening is wired, but buy or sell flow and exact product parity are still incomplete.
   商店打开链路已接通，但买卖流程和精确商品一致性仍不完整。
5. **UI flow parity / UI 行为一致性**
   Dialogue is functional, but battle command flow, shop flow, and save entry flow still diverge from the target experience.
   对话已可用，但战斗指令流、商店流程、存档入口流程仍与目标体验有偏差。
6. **Asset parity / 资产一致性**
   Placeholder assets still dominate large parts of the current slice.
   当前切片中仍有大量占位资源。
7. **Text metadata integrity / 文本元数据完整性**
   Real text coverage is high, but metadata warnings such as style coverage remain.
   真实文本覆盖率已经较高，但 style 等元数据 warning 仍然存在。
8. **Save coverage parity / 存档覆盖一致性**
   Save migration is implemented, but chapter-specific restore cases are not complete.
   存档迁移已经具备，但章节级恢复案例还没有补齐。

## Save Compatibility Status / 存档兼容状态

Current save compatibility status is stable at the system layer.

当前存档兼容状态在系统层面是稳定的。

Status summary:

状态摘要：

- Save migration is centralized in the save system, not in UI or scene code.
- Older saves are loaded through migration and then validated against the latest schema.
- Current compatibility path includes at least:
  - `v1 -> v3`
  - `v2 -> v3`
- Migration regression already covers:
  - old-version load
  - post-migration state correctness
  - missing-field defaults
  - current-version round-trip

- 存档迁移集中在 save system 中，不散落在 UI 或 scene 代码里。
- 旧存档会先经过迁移，再按最新 schema 校验。
- 当前至少覆盖以下兼容路径：
  - `v1 -> v3`
  - `v2 -> v3`
- 迁移回归已经覆盖：
  - 旧版本可读取
  - 迁移后状态正确
  - 缺失字段补默认值
  - 当前版本往返读写正常

Remaining gap:

剩余缺口：

- Save schema compatibility is present, but chapter-specific save or restore parity cases
  are still missing for chapters 2 to 4.

- Save schema 兼容能力已经存在，但第 2 到第 4 章仍缺章节级 save 或 restore parity case。

## Performance Baseline Summary / 性能基线摘要

Current lightweight baseline:

当前轻量基线：

- `Boot Pipeline / 启动链路`: `32.621ms` average
- `Map Transition / 地图切换`: `0.18ms` average
- `Battle Entry / 首次进入战斗`: `0.587ms` average
- `Save And Load / 存档读档`: `0.76ms` average

Most visible bottleneck:

最明显的瓶颈：

- `Boot Pipeline -> Load content database`
- average `31.366ms`
- classified as `import`
- severity `high`

- `Boot Pipeline -> Load content database`
- 平均 `31.366ms`
- 问题类型为 `import`
- 严重度 `high`

Interpretation:

解读：

- The current bottleneck is content loading volume, not world transition or battle transition.
- Runtime frame-critical systems are not yet the main performance risk.

- 当前主要瓶颈是内容加载体量，不是地图切换或战斗切换。
- 运行时帧关键系统还不是当前主要性能风险。

## Known Report Snapshot / 当前报告快照

Latest full internal-alpha check snapshot:

最近一次完整内部测试版检查快照：

- Regression Smoke: `pass=30 mismatch=0 fail=0`
- Parity Score: `chapters=4 average=76 blockers=6`
- Chapter Completeness: `checked=4 errors=0 warnings=4`
- Asset Integrity: `chapters=4 issues=76 placeholders=28`
- Text Integrity: `chapters=4 errors=0 warnings=37 realShare=90.3%`
- Discrepancy Backlog: `P0=4 P1=6 P2=11 P3=4`

## Next-Phase Goals / 下一阶段目标

### 1. Continue Expanding Chapters / 继续扩章节

- Keep importing new real chapter slices through `chapter-bootstrap`, completeness checks,
  regression binding, and lock checklist generation.
- Do not bypass `source -> tools -> generated/manual`.

- 继续通过 `chapter-bootstrap`、completeness、regression 绑定、lock checklist 生成来导入新的真实章节切片。
- 不得绕过 `source -> tools -> generated/manual`。

### 2. Focused Parity Repair / 集中修 Parity

- Clear `P0` save-restore chapter gaps first.
- Lock chapter 1 spatial parity, then continue chapter 2 to 4 spatial lock.
- Reduce parity blockers before attempting broader milestone lock.

- 先清掉 `P0` 的章节级 save-restore 缺口。
- 先锁第 1 章空间一致性，再继续第 2 到第 4 章的空间锁定。
- 在尝试更大范围里程碑锁定前，先继续降低 parity blocker。

### 3. Focused Battle Repair / 集中修战斗

- Keep battle work limited to real chapters already imported.
- Tighten real enemy groups, rewards, and battle event settlement against current battle parity reports.

- 战斗修复只围绕已经导入的真实章节展开。
- 继续按 battle parity 报告收紧真实敌群、奖励和战斗事件结算一致性。

### 4. Focused UI and Asset Repair / 集中修 UI / 资产

- Prioritize `ui:shop-flow`, `ui:battle-command-flow`, and `ui:save-entry-flow`.
- Reduce placeholder assets in already playable chapters before scaling visual coverage wider.
- Continue improving text metadata quality without moving text into UI components.

- 优先处理 `ui:shop-flow`、`ui:battle-command-flow`、`ui:save-entry-flow`。
- 在继续扩大可玩范围之前，先降低已可玩章节中的占位资产比例。
- 继续提升文本元数据质量，但不要把文本写死进 UI 组件。

## Operating Decision / 总体工程判断

Recommended operating decision:

建议的总体工程判断：

- **Yes**: continue importing new real chapter slices with the current toolchain.
- **Yes**: treat this document as the control panel for the internal alpha phase.
- **No**: do not claim chapter lock or beta readiness yet.
- **No**: do not expand visual polish work ahead of parity blockers and save coverage blockers.

- **是**：继续使用当前工具链导入新的真实章节切片。
- **是**：把本文档作为内部测试版阶段的总控面板。
- **否**：当前还不能声称章节已锁定，也不能声称已具备测试版质量。
- **否**：不要在 parity blocker 和 save coverage blocker 未收口前优先投入大规模视觉打磨。
