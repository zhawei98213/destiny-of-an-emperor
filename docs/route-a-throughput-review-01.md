# Route A Throughput Review 01
# Route A 吞吐复盘 01

## Purpose
## 目的

This document reviews the first wave of real chapter importing under the current chapter factory and dual-track workflow.
It is not a milestone announcement. It is an execution review meant to show which parts of the pipeline are now stable,
which parts still slow down chapter expansion, and how later runs should split work between Codex and manual curation.

本文档复盘当前 chapter factory 与双轨模式下的第一轮真实章节导入吞吐表现。
它不是里程碑宣传文档，而是一份执行复盘，用来说明哪些流程已经稳定、哪些环节仍然拖慢章节扩张，
以及后续执行应该如何在 Codex 与人工 curated 之间分工。

## Current Locked Chapter Count
## 当前已锁定章节数

Current locked chapter count is `0`.
当前已锁定章节数为 `0`。

Current imported real chapter count is `6`:
当前已导入真实章节数为 `6`：

- `chapter-01-lou-sang`
- `chapter-02-east-road-relay`
- `chapter-03-river-ford`
- `chapter-04-ridgeway-camp`
- `chapter-05-highland-waystation`
- `chapter-06-border-fort`

Current state interpretation:
当前状态解读：

- The project is already in a sustainable chapter-expansion phase.
- 项目已经进入可持续的章节扩张阶段。
- Chapter closure throughput is improving.
- 章节闭环吞吐正在提升。
- Final chapter lock throughput is still slower than import throughput.
- 但最终章节锁定吞吐仍然慢于章节导入吞吐。

## Average Per-Chapter Import Time Structure
## 平均每章导入耗时结构

This section is based on the recent real chapter runs rather than exact stopwatch timings.
The goal is to show relative cost distribution, not false precision.

本节基于最近几章的真实导入经验，而不是严格秒表计时。
目标是呈现相对成本结构，而不是伪精确数字。

Current average import effort per chapter looks like this:
当前每章平均导入工作量结构大致如下：

1. `15%` chapter bootstrap and metadata wiring
1. `15%` 章节骨架与元数据接线
   Includes chapter metadata, plan, lock report scaffold, initial regression slotting, and chapter index updates.
   包括章节元数据、计划文档、锁定报告骨架、初始 regression 挂接和章节索引更新。
2. `30%` map assembly and world stitching
2. `30%` 地图组装与 world 接线
   Includes source map trimming, collision or portal confirmation, spawn setup, chapter boundary stitching, and final `world.content.json` assembly.
   包括 source 地图裁切、collision 或 portal 核对、spawn 配置、章节边界拼接以及最终 `world.content.json` 组装。
3. `25%` NPC, dialogue, and event authoring
3. `25%` NPC、对白与事件编写
   Includes NPC placement review, event DSL wiring, dialogue table alignment, and chapter-local progression setup.
   包括 NPC 摆位核对、事件 DSL 接线、对白表对齐以及章节内推进链搭建。
4. `10%` regression and audit integration
4. `10%` 回归与审计接入
   Includes golden regression cases, chapter completeness, parity linkage, and lock evidence updates.
   包括 golden regression case、chapter completeness、parity 挂接以及锁定证据更新。
5. `20%` reference and visual backlog work
5. `20%` reference 与视觉 backlog 工作
   Includes chapter visual replacement backlog, reference gaps, asset registry placeholder planning, and chapter-local visual notes.
   包括章节视觉替换 backlog、reference 缺口、asset registry 占位替换计划和章节视觉备注。

Interpretation:
解读：

- The biggest remaining cost is still `map assembly and world stitching`.
- 当前最大剩余成本仍然是 `地图组装与 world 接线`。
- The second biggest cost is `NPC, dialogue, and event authoring`.
- 第二大成本是 `NPC、对白与事件编写`。
- Bootstrap, completeness, and baseline reporting are no longer the dominant cost centers.
- bootstrap、completeness 和基线报告已经不再是主要成本中心。

## Main Bottlenecks
## 主要阻塞点

### 1. Final map assembly is still partly manual
### 1. 最终地图组装仍然部分依赖手工

- Source map import is stable.
- source 地图导入已经稳定。
- Final chapter-ready runtime map composition still requires manual judgment.
- 但最终可运行章节地图的组装仍需要人工判断。
- The main friction is not schema or tooling breakage.
- 主要摩擦点不是 schema 或工具失效。
- The real friction is turning staged map slices into final chapter-connected world data.
- 真正的摩擦在于把 staged 地图切片变成最终可连通的章节 world 数据。

### 2. Dialogue and event curation still needs editorial judgment
### 2. 对白与事件整理仍需要编辑性判断

- The DSL itself is now mostly stable for current chapter slices.
- 当前章节切片所需的 DSL 基本已经稳定。
- The slow part is deciding exact line grouping, branch wording, item-gate phrasing, and event ownership.
- 慢的部分在于决定对白分句、分支措辞、门禁物品表达和事件归属。
- This is especially visible when one chapter is bridged from the previous chapter instead of starting as an isolated town.
- 这一点在“从上一章边界继续向外扩”的章节中尤其明显。

### 3. Visual backlog capture is still manual and chapter-specific
### 3. 视觉 backlog 记录仍然偏手工且章节化

- Dual-track mode prevents visual work from blocking chapter closure.
- 双轨模式已经避免视觉工作阻塞章节闭环。
- But visual replacement backlog generation is still largely manual.
- 但 visual replacement backlog 的生成仍然主要靠手工。
- This does not block gameplay, but it still consumes throughput.
- 这不会阻塞 gameplay，但会占用吞吐。

### 4. Lock-level parity is slower than import-level parity
### 4. 锁定级 parity 的速度慢于导入级 parity

- Imported chapters can become playable and regression-covered quickly.
- 章节可以较快达到可玩和 regression 覆盖。
- Full lock still slows down on spatial parity, save-restore coverage, and visual/reference gaps.
- 但完整锁定仍会在空间一致性、save-restore 覆盖和视觉/reference 缺口上变慢。

## Stable Toolchains
## 已稳定的工具链

The following workflows are now stable enough to treat as default Route A production tooling:
以下流程已经足够稳定，可以视为 Route A 的默认生产工具链：

1. `chapter-bootstrap`
1. `chapter-bootstrap`
   Reduces chapter scaffold work reliably.
   稳定减少章节骨架创建工作量。
2. `check:chapter-completeness`
2. `check:chapter-completeness`
   Good at catching ownership drift and missing metadata.
   很适合抓章节归属漂移和元数据缺失。
3. `chapter-status-report` and `chapter-lock-checklist`
3. `chapter-status-report` 和 `chapter-lock-checklist`
   Stable for chapter-level control and review.
   对章节级总控和审查已经稳定。
4. `regression-smoke`
4. `regression-smoke`
   Stable as the minimum gameplay safety net.
   作为最小 gameplay 安全网已经稳定。
5. `world-connectivity-audit` and `progression-gating-audit`
5. `world-connectivity-audit` 和 `progression-gating-audit`
   Stable for catching structural world and progression problems before they become chapter blockers.
   能在问题升级成章节 blocker 之前抓出世界结构和推进问题。
6. `npc-dialogue-import helpers`
6. `npc-dialogue-import helpers`
   Stable for chapter-local NPC and text entry checks.
   对章节级 NPC 和文本录入检查已经稳定。
7. `economy-parity-audit`
7. `economy-parity-audit`
   Stable for shop, item, price, reward, and drop review.
   对商店、物品、价格、奖励和掉落审查已经稳定。
8. `asset registry + visual backlog`
8. `asset registry + visual backlog`
   Stable as the only allowed visual replacement entry path.
   作为唯一允许的视觉替换入口已经稳定。

## Next-Stage Priorities
## 下一阶段优先级

Priority order for the next Route A runs:
下一阶段 Route A 的优先级顺序：

1. Improve map final-assembly throughput
1. 提高地图最终组装吞吐
   Build stronger helpers from staged source maps into final `world.content.json` structures.
   从 staged source 地图到最终 `world.content.json` 结构，补更强的辅助工具。
2. Keep chapter import throughput high
2. 保持章节导入吞吐
   Continue adding real chapters while the current toolchain is stable.
   在当前工具链稳定的前提下继续扩章节。
3. Fill repeated save-restore and parity blockers in batches
3. 批量补齐反复出现的 save-restore 与 parity blocker
   Do not let chapter lock debt grow without bound.
   不要让章节锁定债务无限累积。
4. Generate reference packs and visual replacement backlog earlier
4. 更早生成 reference pack 与 visual replacement backlog
   Keep visual debt visible without letting it block gameplay.
   让视觉债务保持可见，但不阻塞 gameplay。

## Tasks That Should Continue To Be Handled By Codex
## 应继续交给 Codex 的任务

- Chapter scaffold generation and metadata wiring.
- 章节骨架生成与元数据接线。
- Source-to-generated-to-manual tooling work.
- `source -> generated -> manual` 工具链工作。
- Event DSL structure authoring after the chapter beat is known.
- 在章节节奏明确后进行事件 DSL 结构编写。
- Regression case creation and report integration.
- regression case 创建与报告接入。
- Cross-file audit tooling, report generation, and consistency checks.
- 跨文件审计工具、报告生成和一致性检查。
- Asset registry wiring, placeholder planning, and visual backlog scaffolding.
- asset registry 接线、placeholder 规划和 visual backlog 骨架。
- Repeated schema and validator updates when new high-frequency patterns are confirmed.
- 当高频模式被确认后，重复性的 schema 与 validator 扩展。

## Tasks That Still Need Manual Curated Work
## 仍需要人工 curated 的任务

- Choosing exact chapter boundary cuts from upstream reference material.
- 从上游参考资料中决定章节边界切片。
- Finalizing Chinese dialogue phrasing, cadence, and speaker tone.
- 确定中文对白措辞、节奏和人物语气。
- Deciding whether a local variation is intentional parity or a temporary placeholder.
- 判断某个局部差异到底是有意的 parity 取舍，还是临时 placeholder。
- Confirming real map composition details when reference coverage is incomplete.
- 在 reference 覆盖不足时确认真实地图拼接细节。
- Confirming exact visual replacement priorities for locked or near-locked chapters.
- 为已锁定或接近锁定的章节确定精确视觉替换优先级。

## Actionable Guidance For Later Runs
## 对后续执行的直接指引

For the next Route A executions:
对后续 Route A 执行：

1. Keep using chapter bootstrap first. Do not hand-create chapter scaffolds.
1. 先用 chapter bootstrap，不要手工创建章节骨架。
2. Treat map assembly as the first place worth tooling investment.
2. 把地图最终组装当成最值得继续工具化的第一优先点。
3. Keep gameplay closure and visual backlog in parallel, not in sequence.
3. 继续让 gameplay 闭环与 visual backlog 并行，而不是串行等待。
4. Do not wait for perfect parity before importing the next playable chapter.
4. 不要为了追求完美 parity 而暂停下一章的可玩导入。
5. Batch-fix repeated parity and save-restore blockers after every 2 to 3 chapter imports.
5. 每导入 2 到 3 章后，集中清一次重复出现的 parity 和 save-restore blocker。

Current executive conclusion:
当前执行结论：

- Chapter throughput is already good enough to keep expanding Route A.
- 当前章节吞吐已经足够支持继续扩 Route A。
- The next real productivity win will come from reducing manual map assembly and manual visual backlog writing.
- 下一次真正的吞吐提升，主要会来自减少手工地图组装和手工 visual backlog 编写。
