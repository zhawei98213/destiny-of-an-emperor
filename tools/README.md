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
- `tools/chapter-bootstrap.ts`: creates a chapter metadata file plus matching plan and lock-report scaffolds from the repository templates.
- `tools/chapter-bootstrap.ts`：基于仓库模板创建章节元数据文件，以及对应的计划和锁定报告骨架。
- `tools/chapter-status-report.ts`: aggregates chapter metadata, completeness, parity, regression, and UI parity into one chapter import status summary.
- `tools/chapter-status-report.ts`：把章节元数据、completeness、parity、regression 和 UI parity 聚合成一份章节导入状态摘要。
- `tools/chapter-lock-checklist.ts`: generates a review checklist for deciding whether a chapter is ready to lock.
- `tools/chapter-lock-checklist.ts`：生成用于判断章节是否可锁定的审查清单。
- `tools/asset-check.ts`: generates an asset parity report for current chapters, including missing resources, unreferenced resources, broken references, and sprite metadata integrity.
- `tools/asset-check.ts`：为当前章节生成资产一致性报告，覆盖缺失资源、未引用资源、失效引用以及 sprite metadata 完整性。
- `tools/tileset-crop-normalize.ts`: writes the current tileset crop and normalization task plan from reference candidates into generated staging output.
- `tools/tileset-crop-normalize.ts`：根据 reference candidate 生成当前 tileset 裁切与归一化任务计划，并写入 generated staging 输出。
- `tools/tileset-reconstruct.ts`: validates tileset candidate manifests, palette consistency, tile dimensions, collision review assistance, and asset-registry attachment.
- `tools/tileset-reconstruct.ts`：校验 tileset candidate manifest、palette 一致性、图块尺寸、collision review 协助结果以及 asset-registry 接线状态。
- `tools/character-sprite-reconstruct.ts`: validates character sprite candidates, generates frame metadata, and reports facing-slot coverage plus anchor/pivot consistency.
- `tools/character-sprite-reconstruct.ts`：校验角色精灵 candidate，生成帧 metadata，并报告朝向槽位覆盖和 anchor/pivot 一致性。
- `tools/ui-asset-reconstruct.ts`: validates reconstructed UI asset manifests, panel rules, cursor/icon attachment, and writes one UI reconstruction report.
- `tools/ui-asset-reconstruct.ts`：校验重建 UI 资产清单、面板规则、光标/图标接线状态，并输出一份 UI 重建报告。
- `tools/visual-parity-score.ts`: scores one registry-only visual backfill pilot before and after replacement, then writes a diff-friendly parity summary.
- `tools/visual-parity-score.ts`：为单个只通过 registry 生效的视觉回填试点计算替换前后得分，并输出便于审查 diff 的一致性摘要。
- `tools/reference-validate.ts`: validates the reference manifest, reports missing subject ids or malformed metadata, and writes one reference report.
- `tools/reference-validate.ts`：校验 reference manifest，报告缺失 subject id 或错误 metadata，并生成一份 reference 报告。
- `tools/reference-frame-extract.ts`: validates curated frame packs from videos or screenshot sequences and writes one frame extraction report.
- `tools/reference-frame-extract.ts`：校验来自视频或截图序列的人工关键帧包，并输出一份关键帧提取报告。
- `tools/reference-summary.ts`: summarizes chapter-level reference coverage and writes the current reference backlog report.
- `tools/reference-summary.ts`：汇总章节级参考资料覆盖情况，并输出当前参考资料 backlog 报告。
- `tools/reference-query.ts`: queries indexed references by chapter, map, or subject so Codex and human editors can inspect one target quickly.
- `tools/reference-query.ts`：按章节、地图或对象查询已索引的参考资料，方便 Codex 与人工快速检查目标对象。
- `tools/text-check.ts`: generates a structured text integrity report, covering empty text, duplicate dialogue keys, missing metadata, broken event references, chapter coverage, and demo-versus-real text ratio.
- `tools/text-check.ts`：生成结构化文本完整性报告，覆盖空文本、重复对白 key、缺失元数据、失效事件引用、章节覆盖率以及 demo/真实文本占比。
- `tools/performance-baseline.ts`: samples startup, map-transition, battle-entry, and save/load costs, then writes a comparable runtime baseline report.
- `tools/performance-baseline.ts`：采样启动、地图切换、战斗进入和存档读写成本，并输出可比较的运行时基线报告。
- `tools/ui-parity.ts`: audits chapter-scoped UI behavior for dialogue, menu, shop, battle, and save flows, then writes a structured parity report.
- `tools/ui-parity.ts`：审计章节范围内的对话、菜单、商店、战斗和存档 UI 行为，并输出结构化一致性报告。
- `tools/pre-release-check.ts`: runs the current release-facing command chain in `light` or `full` mode and writes one summary verdict for importing readiness versus beta-test readiness.
- `tools/pre-release-check.ts`：以 `light` 或 `full` 模式执行当前发布前命令链，并输出“适合继续导入 / 适合发布测试版”的统一结论。

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
- Reference tools should keep reference inputs traceable and queryable, but must not convert them into runtime assets automatically.
- reference 工具应保证参考输入可追溯、可查询，但不得自动把它们转成运行时资源。

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
- `npm run chapter-bootstrap -- --id <chapter-id> --title "<title>" --area "<area>"`
  Creates a new chapter scaffold from the current templates with much less manual copy/paste work.
- `npm run chapter-bootstrap -- --id <chapter-id> --title "<title>" --area "<area>"`
  基于当前模板创建新的章节骨架，显著减少手工复制样板的工作量。
- `npm run chapter-status-report`
  Generates `reports/chapters/latest/status-report.*` from current chapter metadata and evidence reports.
- `npm run chapter-status-report`
  基于当前章节元数据和证据报告生成 `reports/chapters/latest/status-report.*`。
- `npm run chapter-lock-checklist -- --id <chapter-id>`
  Generates `reports/chapters/latest/lock-checklists/<chapter-id>.md` for lock review.
- `npm run chapter-lock-checklist -- --id <chapter-id>`
  生成 `reports/chapters/latest/lock-checklists/<chapter-id>.md`，用于锁定审核。
- `npm run asset-check`
  Generates `reports/asset-parity/latest/` and classifies current chapter assets as placeholder/imported/validated.
- `npm run asset-check`
  生成 `reports/asset-parity/latest/`，并把当前章节资产分类为 placeholder/imported/validated。
- `npm run visual-backfill-report -- --id <plan-id>`
  Generates `reports/visual-backfill/latest/<plan-id>.report.json` plus a summary of base-versus-chapter registry state.
- `npm run visual-backfill-report -- --id <plan-id>`
  生成 `reports/visual-backfill/latest/<plan-id>.report.json`，并汇总基础 registry 状态与章节 override 生效状态的对比结果。
- `npm run visual-backfill-checklist -- --id <plan-id>`
  Generates `reports/visual-backfill/latest/<plan-id>.checklist.md` for rollback, gameplay, and UI layout review.
- `npm run visual-backfill-checklist -- --id <plan-id>`
  生成 `reports/visual-backfill/latest/<plan-id>.checklist.md`，用于回滚、gameplay 和 UI 布局审核。
- `npm run visual-parity-score -- --id <plan-id>`
  Generates `reports/visual-parity/latest/<plan-id>.*` and scores the before/after state of one visual pilot.
- `npm run visual-parity-score -- --id <plan-id>`
  生成 `reports/visual-parity/latest/<plan-id>.*`，并为单个视觉试点计算替换前后状态得分。
- `npm run tileset-crop-normalize`
  Generates `content/generated/import-staging/tileset-crop-plan.generated.json` for current reconstruction candidates.
- `npm run tileset-crop-normalize`
  为当前重建 candidate 生成 `content/generated/import-staging/tileset-crop-plan.generated.json`。
- `npm run tileset-reconstruct`
  Generates `reports/tileset-reconstruction/latest/` and summarizes candidate attachment, palette issues, dimension issues, and collision review hints.
- `npm run tileset-reconstruct`
  生成 `reports/tileset-reconstruction/latest/`，并汇总 candidate 接线状态、palette 问题、尺寸问题和 collision review 提示。
- `npm run character-sprite-reconstruct`
  Generates `content/generated/character-sprite-metadata.generated.json` and `reports/character-sprite-reconstruction/latest/`.
- `npm run character-sprite-reconstruct`
  生成 `content/generated/character-sprite-metadata.generated.json` 和 `reports/character-sprite-reconstruction/latest/`。
- `npm run ui-asset-reconstruct`
  Generates `reports/ui-asset-reconstruction/latest/` and summarizes reconstructed panel, cursor, and icon attachment through the shared asset registry.
- `npm run ui-asset-reconstruct`
  生成 `reports/ui-asset-reconstruction/latest/`，并汇总通过共享 asset registry 接入的重建面板、光标和图标状态。
- `npm run reference-validate`
  Generates `reports/reference/latest/` and reports manifest errors such as missing subject ids, duplicate keys, and malformed metadata.
- `npm run reference-validate`
  生成 `reports/reference/latest/`，并报告缺失 subject id、重复 key、metadata 错误等 manifest 问题。
- `npm run reference-query -- --subject-type <type> --subject-id <id>`
  Prints the currently indexed references for one map, NPC, UI element, enemy, shop, or battle subject.
- `npm run reference-query -- --subject-type <type> --subject-id <id>`
  输出某个地图、NPC、UI 元素、敌人、商店或战斗对象当前已索引的参考资料。
- `npm run reference-frame-extract`
  Generates `reports/reference-frame-extract/latest/` and validates frame packs stored under `content/reference/frame-packs/`.
- `npm run reference-frame-extract`
  生成 `reports/reference-frame-extract/latest/`，并校验存放在 `content/reference/frame-packs/` 下的关键帧包。
- `npm run reference-summary`
  Generates `reports/reference/latest/chapter-summary.*` and records map/NPC/UI/battle gaps for the first four real chapters.
- `npm run reference-summary`
  生成 `reports/reference/latest/chapter-summary.*`，并记录前四个真实章节在地图/NPC/UI/战斗参考上的缺口。
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
- `npm run save-migration-check`
  Runs the focused save compatibility regression tests without rerunning the whole suite.
- `npm run save-migration-check`
  在不重跑整套测试的情况下执行聚焦存档兼容性的回归测试。
- `npm run pre-release-check -- --mode light|full`
  Generates `reports/pre-release/latest/` and summarizes whether the repository is fit for continued importing or beta-test release.
- `npm run pre-release-check -- --mode light|full`
  生成 `reports/pre-release/latest/`，并汇总当前仓库是否适合继续导入或发布测试版。

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
