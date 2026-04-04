# Progression Gating Audit
# 推进门禁审计

## Goal
## 目标

This audit checks whether the current real chapter main flow can still advance without opening the wrong maps too early or getting trapped behind missing flags and items.
这项审计用于检查当前真实章节主线是否仍然可以正常推进，避免地图过早开放，或因为缺失 flag / 物品而被卡死。

It focuses on progression-critical events such as:
它重点覆盖以下推进关键事件：

- guard blocking and release
- 门卫阻拦与放行
- flag-controlled exits
- flag 控制的出口
- item-controlled gate opening
- 物品控制的开门逻辑
- chapter-local warp steps that unlock the next map
- 解锁下一张地图的章节内 warp 步骤

## Scope
## 范围

The audit reads:
该审计读取：

- runtime content database from `content/manual/` and `content/generated/`
- 来自 `content/manual/` 和 `content/generated/` 的运行时内容数据库
- chapter metadata from `content/manual/chapters/`
- 来自 `content/manual/chapters/` 的章节元数据
- trigger-to-event bindings from world content
- world 内容中的 trigger -> event 绑定

It does not replace regression. It answers a different question:
它不替代 regression。它回答的是另一个问题：

- if a player follows the current real chapter main path, is there an obvious soft-lock or missing gate provider?
- 如果玩家沿着当前真实章节主线推进，是否存在明显软锁或缺失门禁提供者？

## Outputs
## 输出

Run:
执行：

- `npm run progression-gating-audit`

Artifacts:
产物：

- `reports/progression-gating/latest/report.json`
- `reports/progression-gating/latest/summary.md`
- `reports/progression-gating/latest/checklists/<chapter-id>.md`

## Report Sections
## 报告部分

1. Progression state model
1. 推进状态模型

- chapter order
- 章节顺序
- cumulative accessible maps
- 累积可达地图
- cumulative known flags
- 累积已获得 flag
- cumulative known items
- 累积已获得物品

2. Map access dependency summary
2. 地图开放依赖摘要

- source map
- 源地图
- trigger id
- trigger id
- event id
- event id
- target map and spawn
- 目标地图与出生点
- required flags / blocked flags / required items
- 所需 flag / 必须未设置的 flag / 所需物品

3. Flag gating report
3. Flag 门禁报告

- progression warps that depend on flags or items
- 依赖 flag 或物品的推进型 warp
- whether providers exist in the current or previous chapters
- 当前章或前置章节中是否存在提供者

4. Soft-lock risk report
4. 软锁风险报告

- `blocker`
  - no provider exists for a required flag or item
  - a chapter entry map cannot be detected
  - one or more maps in the chapter remain inaccessible after progression simulation
- `blocker`
  - 某个所需 flag 或物品没有提供者
  - 无法识别章节入口地图
  - 推进模拟后章节内仍有地图不可达
- `non-blocker`
  - a dependency is unusual but does not currently block mainline closure
- `non-blocker`
  - 某个依赖关系异常，但当前不会阻塞主线闭环

5. Per chapter progression checklist
5. 每章推进检查清单

- entry map resolved
- 已识别入口地图
- mainline maps reachable
- 主线地图可达
- gate providers exist
- 门禁提供者存在

## Current Expected Baseline
## 当前预期基线

For the currently imported real chapters:
对于当前已导入的真实章节：

- blocker count should stay at `0`
- blocker 数应保持为 `0`
- every chapter checklist should show all mainline maps reachable
- 每章清单都应显示主线地图全部可达
- no guard / exit / gate warp should depend on a missing provider
- 任何门卫 / 出口 / 开门 warp 都不应依赖缺失的提供者

If this audit starts failing, fix content or interpreter wiring before importing the next adjacent real slice.
如果这项审计开始失败，应先修复内容或解释器接线，再继续导入下一段相邻真实切片。
