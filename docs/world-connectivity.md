# World Connectivity Audit
# 世界连接性审计

## Goal
## 目标

This audit keeps chapter growth from silently breaking world traversal.
这项审计用于防止章节扩展过程中悄悄把世界切图链路弄乱。

It focuses on map-to-map connectivity, spawn validity, and whether free traversal edges still form a consistent return path.
它重点检查地图之间的连接关系、出生点有效性，以及自由移动边是否仍然具备一致的返回路径。

## Scope
## 范围

The audit reads:
该审计读取：

- `content/manual/world.content.json`
- `content/manual/story.content.json`
- `content/manual/chapters/*.json`

It does not replace runtime schema validation. It adds graph-level checks that are easier to miss while importing adjacent chapters.
它不替代运行时 schema 校验。它补充的是章节相邻扩展时更容易漏掉的图结构级检查。

## Checks
## 检查项

1. Global map connection graph
1. 全局地图连接图

- Build graph nodes from all runtime maps.
- 从所有运行时地图构建图节点。
- Build edges from:
  - portals
  - trigger-driven `warp` steps bound through map triggers
- 从以下来源构建边：
  - `portal`
  - 通过地图 trigger 绑定的事件 `warp`

2. Missing portal check
2. 缺失 portal 检查

- If a free traversal edge enters another map, the target map should expose a return portal back to the source map.
- 如果一个自由移动边把玩家带入另一张地图，目标地图应提供一条返回源地图的自由返回路径，通常是 portal，也可以是 tile warp 出口。
- This catches slices that can be entered but not cleanly exited during normal traversal.
- 这能捕捉“能进去但无法通过正常移动链路退出”的区域切片。

3. Isolated map check
3. 孤立地图检查

- A map with no inbound and no outbound connections is treated as isolated.
- 没有入边也没有出边的地图会被视为孤立地图。

4. Invalid spawn check
4. 无效 spawn 检查

- Spawn points must stay inside map bounds.
- 出生点必须位于地图边界内。
- Spawn points must not land on blocked tiles.
- 出生点不得落在阻挡格上。

5. Bidirectional inconsistency check
5. 双向连接不一致检查

- When a map pair has edges in both directions, their traversal class should stay consistent enough to support free return traversal.
- 当一对地图在两个方向上都存在连接边时，它们的移动类别应足够一致，以支持自由往返。
- Current rule:
  - `portal` and tile-trigger `warp` are treated as free traversal
  - NPC-trigger and region-trigger warp are treated as gated traversal
- 当前规则：
  - `portal` 和 tile-trigger `warp` 视为自由移动边
  - NPC-trigger 和 region-trigger warp 视为受限移动边

## Output
## 输出

Run:
执行：

- `npm run world-connectivity-audit`

Artifacts:
产物：

- `reports/world-connectivity/latest/report.json`
- `reports/world-connectivity/latest/summary.md`

The summary includes:
摘要中包括：

- graph counts
- 图统计
- per-chapter connectivity summary
- 每章连接性摘要
- issue list
- 问题列表
- a Mermaid graph for quick review
- 用于快速审阅的 Mermaid 图

## Interpretation
## 解读方式

- `error`
  - blocks continued importing until fixed
- `error`
  - 在修复前应阻止继续向相邻章节导入
- `warning`
  - does not block gameplay closure immediately, but should be recorded before claiming the world graph is stable
- `warning`
  - 不会立刻阻塞 gameplay 闭环，但在宣称世界连接图稳定前应记录并处理

## Current Baseline
## 当前基线

The current imported real chapters are expected to pass with:
当前已导入真实章节的预期基线是：

- no isolated maps
- 没有孤立地图
- no invalid spawns
- 没有无效出生点
- no missing return portals on current free traversal edges
- 当前自由移动边没有缺失返回 portal

If this audit starts failing after a chapter import, fix the world data first instead of patching scene logic.
如果章节导入后这项审计开始失败，应先修正世界数据，而不是通过 scene 逻辑打补丁。
