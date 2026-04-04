# Chapter 09 River Watch Post Lock Report
# Chapter 09 River Watch Post 锁定报告

## Scope
## 范围

- Chapter id: `chapter-09-river-watch-post`
- Title: River Watch Post Advance
- Area label: Bridgehead East Bank and River Watch Slice
- Metadata status: `validating`

## Current Status
## 当前状态

- Lock result: not locked yet
- 锁定结果：尚未锁定
- Reason: gameplay loop is closed, but parity, reference coverage, and visual replacement are still in progress
- 原因：gameplay 闭环已完成，但 parity、reference 覆盖与视觉替换仍在进行中

## Verified Now
## 当前已验证

- chapter-09 reuses the current two-map gate slice pattern without adding scene-specific runtime branches
- chapter-09 继续复用当前双图门禁切片模式，没有引入 scene 特判
- chapter-09 reference pack, visual backlog, and battle parity notes have all been created at chapter scope
- chapter-09 的 reference pack、visual backlog 和 battle parity notes 已经全部建立为章节级文件
- regression target set is defined for clerk, sentry, gate, shop, chest, battle, and save/load
- 文吏、守兵、栅门、商店、宝箱、战斗与存读档的回归目标集已经定义

## Standardized Modes Reused
## 本章复用的标准化模式

- `clerk -> sentry -> gate warp` progression flow
- `文吏 -> 守兵 -> 栅门切图` 推进流
- `shop NPC + chest + shared encounter table` support flow
- `商店 NPC + 宝箱 + 共享 encounter table` 支撑流
- `batch-chapter-bootstrap -> source -> manual -> regression` chapter import path
- `batch-chapter-bootstrap -> source -> manual -> regression` 章节导入路径

## Remaining Divergences
## 当前剩余偏差

- `east-bank-road` and `river-watch-post` still use placeholder-managed tileset keys
- `east-bank-road` 和 `river-watch-post` 目前仍使用 placeholder 管理的 tileset key
- chapter-09 still reuses shared `highland-outlaws` instead of a chapter-local real enemy group
- chapter-09 仍复用共享 `highland-outlaws`，而不是章节局部真实敌群
- chapter-09 reference pack still starts from low-confidence bootstrap frames
- chapter-09 的 reference pack 仍从低置信度 bootstrap 帧起步

## New System Pressure Pattern
## 本章新增系统压力模式

- The new pressure is not a new opcode or runtime feature. It is repetition pressure: the same gate/shop/chest/battle slice is now being instantiated across more chapters, so drift between chapter metadata, reference pack scaffolding, and cross-chapter portal stitching becomes the main risk.
- 本章新增的压力不在新 opcode 或新 runtime 功能，而在重复压力：同一套 gate/shop/chest/battle 切片正在被复制到更多章节，因此章节 metadata、reference pack 骨架和跨章 portal 拼接之间的漂移成为主要风险。

## Next Actions
## 下一步动作

1. Bind chapter-09 golden regression and battle parity cases.
1. 绑定 chapter-09 的 golden regression 与 battle parity case。
2. Update parity matrix and chapter index so chapter-09 enters the shared audit surface.
2. 更新 parity matrix 和 chapter index，让 chapter-09 进入共享审计面。
3. Expand the chapter-09 reference pack beyond bootstrap placeholders.
3. 把 chapter-09 的 reference pack 从 bootstrap 占位扩展到章节级真实覆盖。
