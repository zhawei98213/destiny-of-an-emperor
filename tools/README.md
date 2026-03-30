# Tools
# 工具目录

Place importers, content compilers, schema checks, and migration scripts here as the pipeline grows.
随着内容管线扩展，应将导入器、内容编译器、schema 校验和迁移脚本放在这里。

Current first-pass tooling:
当前第一版工具包括：

- `tools/import-all.ts`: runs every importer and regenerates stable demo outputs in `content/generated/`.
- `tools/import-all.ts`：执行全部导入器，并在 `content/generated/` 中重新生成稳定的 demo 输出。
- `tools/importers/generateSpriteMetadata.ts`: builds deterministic sprite sheet metadata from `content/source/sprites/`.
- `tools/importers/generateSpriteMetadata.ts`：从 `content/source/sprites/` 生成稳定的精灵表元数据。
- `tools/importers/importMapContent.ts`: validates map source inputs and emits a staging report for future runtime pack generation.
- `tools/importers/importMapContent.ts`：校验地图原始输入，并输出供后续运行时内容包生成使用的 staging report。
- `tools/importers/importTextTables.ts`: validates text and event source inputs and emits a staging report.
- `tools/importers/importTextTables.ts`：校验文本与事件原始输入，并输出 staging report。
- `tools/importers/importGameData.ts`: imports enemy, item, and shop source tables and generates the runtime battle content pack plus a staging report.
- `tools/importers/importGameData.ts`：导入敌人、物品、商店原始表，并生成运行时战斗内容包和一个 staging report。
- `tools/validate-content.ts`: verifies source-derived generated files are up to date and then validates the final runtime content database.
- `tools/validate-content.ts`：先检查 generated 文件是否与 source 推导结果一致，再校验最终运行时内容数据库。
- `tools/event-json.ts`: lints event JSON structure and can rewrite `story.content.json` into stable formatter output.
- `tools/event-json.ts`：检查事件 JSON 结构，并可把 `story.content.json` 重写为稳定格式化输出。
- `tools/check-npc-placement.ts`: checks whether NPC placement collides with blocked tiles, portals, spawns, or other NPCs.
- `tools/check-npc-placement.ts`：检查 NPC 摆位是否撞上阻挡格、portal、spawn 点或其他 NPC。
- `tools/check-chapter-completeness.ts`: compares chapter metadata against reachable maps, NPCs, events, shops, and enemy groups.
- `tools/check-chapter-completeness.ts`：把章节元数据与当前可达地图、NPC、事件、商店和敌群做对照。
- `tools/asset-check.ts`: generates an asset parity report for current chapters, including missing resources, unreferenced resources, broken references, and sprite metadata integrity.
- `tools/asset-check.ts`：为当前章节生成资产一致性报告，覆盖缺失资源、未引用资源、失效引用以及 sprite metadata 完整性。
- `tools/text-check.ts`: generates a structured text integrity report, covering empty text, duplicate dialogue keys, missing metadata, broken event references, chapter coverage, and demo-versus-real text ratio.
- `tools/text-check.ts`：生成结构化文本完整性报告，覆盖空文本、重复对白 key、缺失元数据、失效事件引用、章节覆盖率以及 demo/真实文本占比。
- `tools/performance-baseline.ts`: samples startup, map-transition, battle-entry, and save/load costs, then writes a comparable runtime baseline report.
- `tools/performance-baseline.ts`：采样启动、地图切换、战斗进入和存档读写成本，并输出可比较的运行时基线报告。
- `tools/ui-parity.ts`: audits chapter-scoped UI behavior for dialogue, menu, shop, battle, and save flows, then writes a structured parity report.
- `tools/ui-parity.ts`：审计章节范围内的对话、菜单、商店、战斗和存档 UI 行为，并输出结构化一致性报告。

## Import Rules
## 导入规范

- Real content import must always start from `content/source/`.
- 真实内容导入必须始终从 `content/source/` 开始。
- `tools/` should parse raw inputs and emit deterministic generated outputs before anything reaches runtime content.
- `tools/` 应先解析原始输入并输出稳定的 generated 结果，之后内容才可以进入运行时内容层。
- Do not bypass importers by dropping raw extracted data straight into `content/manual/`.
- 不要绕过导入器，直接把原始提取数据丢进 `content/manual/`。
- Do not patch scenes to compensate for missing imported data.
- 不要通过修改 scene 来补偿缺失的导入数据。
- When a new source table or generated output shape is introduced, add or extend schema and validation in the same change.
- 引入新的 source 表或 generated 输出结构时，必须在同一次改动里补或扩展 schema 与校验。
- Importer output order should remain stable so diffs stay reviewable.
- 导入器输出顺序必须保持稳定，这样 diff 才可审查。
- Failure messages should point to a concrete file and field whenever possible.
- 出错信息应尽量定位到具体文件和字段。
- Editor helpers should focus on import-time friction and chapter maintenance, not duplicate the final runtime guarantees already enforced by `validate-content`.
- 编辑辅助工具应聚焦导入阶段摩擦和章节维护，不要重复 `validate-content` 已经承担的最终运行时保证。

## Editor Helpers
## 录入辅助工具

- `npm run event-json`
  Checks event JSON shape and reports formatting drift in `content/manual/story.content.json`.
- `npm run event-json`
  检查 `content/manual/story.content.json` 的事件 JSON 结构，并报告格式化漂移。
- `npm run format:events`
  Rewrites `content/manual/story.content.json` into stable key order and formatting.
- `npm run format:events`
  把 `content/manual/story.content.json` 重写成稳定 key 顺序和格式。
- `npm run check:npc-placement`
  Validates that current manual NPC coordinates do not overlap blocked tiles, portals, spawn points, or other NPCs.
- `npm run check:npc-placement`
  校验当前 manual NPC 坐标不会与阻挡格、portal、spawn 点或其他 NPC 重叠。
- `npm run check:chapter-completeness`
  Compares chapter metadata ownership against currently reachable chapter content and reports missing or cross-chapter entries.
- `npm run check:chapter-completeness`
  把章节元数据归属与当前可达章节内容做比对，并报告缺失项或跨章节归属项。
- `npm run asset-check`
  Generates `reports/asset-parity/latest/` and classifies current chapter assets as placeholder/imported/validated.
- `npm run asset-check`
  生成 `reports/asset-parity/latest/`，并把当前章节资产分类为 placeholder/imported/validated。
- `npm run text-check`
  Generates `reports/text-integrity/latest/` and reports chapter-level dialogue coverage plus text metadata gaps.
- `npm run text-check`
  生成 `reports/text-integrity/latest/`，并报告章节级对白覆盖和文本元数据缺口。
- `npm run performance-baseline`
  Generates `reports/performance/latest/` and classifies the most obvious timing hotspots into runtime, resource, and import buckets.
- `npm run performance-baseline`
  生成 `reports/performance/latest/`，并把最明显的耗时热点分类到 runtime、resource 和 import 三类。
- `npm run ui-parity`
  Generates `reports/ui-parity/latest/` and records matched versus diverged UI behavior for real chapter scenes.
- `npm run ui-parity`
  生成 `reports/ui-parity/latest/`，并记录真实章节场景中的 UI 行为匹配项与偏差项。

## Recommended Import Flow
## 推荐导入流程

1. add raw area inputs under `content/source/`
1. 将区域原始输入加入 `content/source/`
2. extend or run importer scripts in `tools/`
2. 扩展或执行 `tools/` 下的导入脚本
3. inspect generated staging output under `content/generated/`
3. 检查 `content/generated/` 下的 staging 输出
4. assemble verified runtime content into `content/manual/`
4. 将已核对的运行时内容整理进 `content/manual/`
5. run `npm run import-all`
5. 执行 `npm run import-all`
6. run `npm run validate-content`
6. 执行 `npm run validate-content`
7. run `npm run regression-smoke` when the imported change affects runtime behavior
7. 当导入改动影响运行时行为时，执行 `npm run regression-smoke`
