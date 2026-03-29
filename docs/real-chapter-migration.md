# Real Chapter Migration
# 真实章节迁移说明

## Purpose
## 目的

This vertical slice is a stable placeholder chapter, not a claim of full original-game reproduction.
这个垂直切片是一个稳定的占位章节，不代表已经完整复刻原作内容。

Its purpose is to prove the content interfaces that a future chapter import should target.
它的作用是验证未来真实章节导入时应该对接的内容接口。

## What Can Be Replaced Safely
## 哪些部分可以安全替换

The following content areas are already isolated behind stable formats:
以下内容区域已经被隔离在稳定格式之后：

- map layouts, portals, spawn points, NPCs, and triggers in `world.content.json`
- `world.content.json` 中的地图布局、portal、出生点、NPC 和 trigger
- dialogue lines, event flow, and shop definitions in `story.content.json`
- `story.content.json` 中的对话、事件流程和商店定义
- enemies and battle groups in `content/generated/battle.content.json`
- `content/generated/battle.content.json` 中的敌人和战斗组
- raw upstream tables in `content/source/` plus importer output in `content/generated/`
- `content/source/` 中的上游原始表，以及 `content/generated/` 中的导入结果

## Recommended Migration Path
## 推荐迁移路径

1. Put extracted chapter source tables into `content/source/`.
1. 将提取出的章节原始表放入 `content/source/`。
2. Extend importers in `tools/` to convert those raw tables into deterministic generated outputs.
2. 扩展 `tools/` 下的导入器，把这些原始表转换成稳定的 generated 输出。
3. Keep chapter-specific hand fixes in `content/manual/`, not in `generated/`.
3. 将章节级人工修正放在 `content/manual/`，不要直接改 `generated/`。
4. Add or extend schema before introducing any new content shape.
4. 在引入新的内容结构前，先补或扩展 schema。
5. Run `npm run import-all`, `npm run validate-content`, and `npm run regression-smoke`.
5. 执行 `npm run import-all`、`npm run validate-content` 和 `npm run regression-smoke`。

## If Real Chapter Data Adds New Needs
## 如果真实章节数据引入新需求

- New event behaviors should be added as new opcodes with tests.
- 新的事件行为应以新 opcode 的形式加入，并补测试。
- New save fields must declare a compatibility strategy before landing.
- 新的存档字段在落地前必须声明兼容策略。
- New importer outputs should remain deterministic so generated diffs stay reviewable.
- 新的导入输出必须保持稳定，以便 generated diff 可审查。
