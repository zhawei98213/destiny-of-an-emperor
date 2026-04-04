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
- `tools/npc-placement-import.ts`: compares chapter NPC placements in source maps against manual world content and emits import-ready rows plus mismatch issues.
- `tools/npc-placement-import.ts`：对比章节 source 地图中的 NPC 摆位与 manual world 内容，并输出可导入行和不一致问题。
- `tools/dialogue-table-import.ts`: compares one chapter text source file against manual story dialogue/event content and reports missing or mismatched rows.
- `tools/dialogue-table-import.ts`：对比单章文本 source 文件与 manual story 的对白/事件内容，并报告缺失或不一致的行。
- `tools/event-text-linkage-check.ts`: validates dialogue `lineId` references for one chapter or one source text file.
- `tools/event-text-linkage-check.ts`：校验单章或单个 source 文本文件的对白 `lineId` 引用。
- `tools/speaker-metadata-check.ts`: validates speaker metadata completeness and whether `speakerNpcId` still belongs to the target chapter.
- `tools/speaker-metadata-check.ts`：校验 speaker 元数据完整性，以及 `speakerNpcId` 是否仍属于目标章节。
- `tools/chapter-npc-text-report.ts`: summarizes per-chapter NPC placement source coverage and text-source completeness for imported chapters.
- `tools/chapter-npc-text-report.ts`：汇总已导入章节的 NPC 摆位 source 覆盖和文本 source 完整性。
- `tools/check-chapter-completeness.ts`: compares chapter metadata against reachable maps, NPCs, events, shops, and enemy groups.
- `tools/check-chapter-completeness.ts`：把章节元数据与当前可达地图、NPC、事件、商店和敌群做对照。
- `tools/chapter-bootstrap.ts`: creates a chapter metadata file plus matching plan and lock-report scaffolds from the repository templates.
- `tools/chapter-bootstrap.ts`：基于仓库模板创建章节元数据文件，以及对应的计划和锁定报告骨架。
- `tools/batch-chapter-bootstrap.ts`: creates the full default chapter batch, including metadata, plan, lock-report, visual backlog, battle notes, source text skeleton, reference pack, visual backfill plan, and a creation summary.
- `tools/batch-chapter-bootstrap.ts`：创建完整的默认章节批次，包括元数据、计划、锁定报告、视觉 backlog、战斗说明、source 文本骨架、reference pack、visual backfill plan 和创建摘要。
- `tools/chapter-status-report.ts`: aggregates chapter metadata, completeness, parity, regression, and UI parity into one chapter import status summary.
- `tools/chapter-status-report.ts`：把章节元数据、completeness、parity、regression 和 UI parity 聚合成一份章节导入状态摘要。
- `tools/chapter-lock-checklist.ts`: generates a review checklist for deciding whether a chapter is ready to lock.
- `tools/chapter-lock-checklist.ts`：生成用于判断章节是否可锁定的审查清单。
- `tools/progression-gating-audit.ts`: simulates mainline chapter progression, reports map-access dependencies, and identifies soft-lock risks plus per-chapter progression checklists.
- `tools/progression-gating-audit.ts`：模拟主线章节推进，输出地图开放依赖，并识别软锁风险与每章推进检查清单。
- `tools/progression-stat-parity.ts`: summarizes chapter growth curves, battle reward bands, equipment progression, and obvious stat outliers.
- `tools/progression-stat-parity.ts`：汇总章节成长曲线、战斗奖励区间、装备推进和明显属性异常点。
- `tools/encounter-transition-parity.ts`: audits encounter triggers, transition timing, scene handoff state, and return-to-world integrity for real slices.
- `tools/encounter-transition-parity.ts`：审计真实切片中的遭遇触发、切场时机、场景交接状态和返回 world 完整性。
- `tools/world-connectivity-audit.ts`: generates the current global map connection graph and reports missing return portals, isolated maps, invalid spawns, and bidirectional traversal mismatches.
- `tools/world-connectivity-audit.ts`：生成当前全局地图连接图，并报告缺失返回 portal、孤立地图、无效 spawn 和双向移动不一致问题。
- `tools/npc-global-state-audit.ts`: generates a front-10 NPC visibility, trigger, and stale-state audit from manual world/story content.
- `tools/npc-global-state-audit.ts`：基于 manual world/story 内容生成前 10 区域的 NPC 显示、触发和陈旧状态审计。
- `tools/global-text-continuity-audit.ts`: generates a front-10 text continuity audit covering repeated text, missing linkage, and naming consistency.
- `tools/global-text-continuity-audit.ts`：生成前 10 区域文本连续性审计，覆盖重复文本、缺失链接和命名一致性。
- `tools/overworld-navigation-parity.ts`: generates a front-10 world navigation audit from connectivity and progression evidence.
- `tools/overworld-navigation-parity.ts`：基于连接性和推进证据生成前 10 区域的大地图导航审计。
- `tools/economy-parity-audit.ts`: audits chapter-owned shops, item circulation, price overrides, and battle reward/drop sanity.
- `tools/economy-parity-audit.ts`：审计章节归属商店、物品流通、价格覆盖以及战斗奖励/掉落合理性。
- `tools/equipment-status-recovery.ts`: audits equipment support gaps, status support gaps, heal/save point behavior, and restore/revive edge cases.
- `tools/equipment-status-recovery.ts`：审计装备支持缺口、状态支持缺口、恢复/存档点行为以及恢复/复活边界情况。
- `tools/audio-workflow.ts`: validates chapter / map / battle audio routing and logical audio-key coverage against the shared asset registry.
- `tools/audio-workflow.ts`：校验章节 / 地图 / 战斗音频路由，以及共享 asset registry 中逻辑音频 key 的覆盖情况。
- `tools/battle-enemy-group-import.ts`: checks source enemies and battle groups against generated battle content.
- `tools/battle-enemy-group-import.ts`：检查 source 敌人和敌群与 generated battle content 的一致性。
- `tools/battle-scenario-import.ts`: checks battle scenario source entries against world triggers, encounter tables, golden cases, and battle parity cases.
- `tools/battle-scenario-import.ts`：检查 battle scenario source 条目与 world trigger、遭遇表、golden case 和 battle parity case 的一致性。
- `tools/battle-reward-drop-check.ts`: validates reward, experience, and drop sanity for current generated battle groups.
- `tools/battle-reward-drop-check.ts`：校验当前 generated battle groups 的奖励、经验与掉落合理性。
- `tools/battle-parity-checklist.ts`: generates one checklist showing whether scenario import, regression, and parity wiring are complete.
- `tools/battle-parity-checklist.ts`：生成一份检查清单，说明场景导入、回归和 parity 接线是否完整。
- `tools/battle-ui-flow-parity.ts`: audits battle command selection, confirm/cancel, target selection, result timing, and battle-end transition behavior.
- `tools/battle-ui-flow-parity.ts`：审计战斗中的指令选择、确认/取消、目标选择、结果提示时机和战斗结束过场行为。
- `tools/battle-visual-backfill.ts`: validates battle asset manifests, enemy sprite intake, and asset-registry attachment for battle visuals.
- `tools/battle-visual-backfill.ts`：校验 battle 资产 manifest、enemy sprite intake 以及 battle 视觉的 asset-registry 接线状态。
- `tools/battle-visual-parity-score.ts`: scores battle-scene visual replacement progress from the current battle asset manifest and chapter overrides.
- `tools/battle-visual-parity-score.ts`：基于当前 battle asset manifest 和章节级 override，为战斗场景视觉替换进度打分。
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
- `npm run npc-placement-import -- --chapter chapter-06-border-fort`
  Generates one chapter-targeted NPC placement import report from source maps and manual world content.
- `npm run npc-placement-import -- --chapter chapter-06-border-fort`
  基于 source 地图和 manual world 内容生成单章 NPC 摆位导入报告。
- `npm run dialogue-table-import -- --chapter chapter-06-border-fort`
  Generates one chapter-targeted dialogue/event import comparison from `content/source/text/<chapter-id>.source.json`.
- `npm run dialogue-table-import -- --chapter chapter-06-border-fort`
  基于 `content/source/text/<chapter-id>.source.json` 生成单章对白/事件导入对比报告。
- `npm run event-text-linkage-check -- --chapter chapter-06-border-fort`
  Validates chapter-scoped dialogue `lineId` linkage using the current DSL.
- `npm run event-text-linkage-check -- --chapter chapter-06-border-fort`
  基于当前 DSL 校验章节范围内的对白 `lineId` 链接。
- `npm run speaker-metadata-check -- --chapter chapter-06-border-fort`
  Validates chapter speaker name, portrait, style, and speaker NPC ownership metadata.
- `npm run speaker-metadata-check -- --chapter chapter-06-border-fort`
  校验章节的 speaker 名称、头像、样式和 speaker NPC 归属元数据。
- `npm run chapter-npc-text-report`
  Generates one per-chapter NPC/text completeness report for imported chapters.
- `npm run chapter-npc-text-report`
  为已导入章节生成每章一份 NPC/文本完整性报告。
- `npm run check:chapter-completeness`
  Compares chapter metadata ownership against currently reachable chapter content and reports missing or cross-chapter entries.
- `npm run check:chapter-completeness`
  把章节元数据归属与当前可达章节内容做比对，并报告缺失项或跨章节归属项。
- `npm run chapter-bootstrap -- --id <chapter-id> --title "<title>" --area "<area>"`
  Creates a new chapter scaffold from the current templates with much less manual copy/paste work.
- `npm run chapter-bootstrap -- --id <chapter-id> --title "<title>" --area "<area>"`
  基于当前模板创建新的章节骨架，显著减少手工复制样板的工作量。
- `npm run batch-chapter-bootstrap -- --id <chapter-id> --title "<title>" --area "<area>"`
  Creates the default chapter batch in one step, including chapter-local manifests, checklists, reference folders, and a bootstrap summary.
- `npm run batch-chapter-bootstrap -- --id <chapter-id> --title "<title>" --area "<area>"`
  一次性创建默认章节批次，包括章节级 manifest、checklist、reference 目录和 bootstrap 摘要。
- `npm run chapter-status-report`
  Generates `reports/chapters/latest/status-report.*` from current chapter metadata and evidence reports.
- `npm run chapter-status-report`
  基于当前章节元数据和证据报告生成 `reports/chapters/latest/status-report.*`。
- `npm run chapter-lock-checklist -- --id <chapter-id>`
  Generates `reports/chapters/latest/lock-checklists/<chapter-id>.md` for lock review.
- `npm run chapter-lock-checklist -- --id <chapter-id>`
  生成 `reports/chapters/latest/lock-checklists/<chapter-id>.md`，用于锁定审核。
- `npm run progression-gating-audit`
  Generates `reports/progression-gating/latest/` and audits progression-critical gates, provider chains, and soft-lock risk.
- `npm run progression-gating-audit`
  生成 `reports/progression-gating/latest/`，并审计推进关键门禁、提供者链路和软锁风险。
- `npm run world-connectivity-audit`
  Generates `reports/world-connectivity/latest/` and audits graph-level map traversal issues such as missing return portals, isolated maps, invalid spawns, and bidirectional traversal mismatches.
- `npm run world-connectivity-audit`
  生成 `reports/world-connectivity/latest/`，并审计缺失返回 portal、孤立地图、无效 spawn、双向移动不一致等图结构级问题。
- `npm run npc-global-state-audit`
  Generates `reports/npc-global-state/latest/` and summarizes NPC visibility, trigger bindings, flag-driven behavior, and stale-state risks across imported chapters.
- `npm run npc-global-state-audit`
  生成 `reports/npc-global-state/latest/`，并汇总已导入章节中的 NPC 显示、触发绑定、flag 驱动行为和陈旧状态风险。
- `npm run global-text-continuity-audit`
  Generates `reports/global-text-continuity/latest/` and summarizes repeated text, missing linkage, naming consistency, and chapter continuity notes.
- `npm run global-text-continuity-audit`
  生成 `reports/global-text-continuity/latest/`，并汇总重复文本、缺失链接、命名一致性和章节连续性说明。
- `npm run overworld-navigation-parity`
  Generates `reports/overworld-navigation/latest/` and summarizes world-route edges, travel dependencies, inaccessible intended paths, and accidental shortcuts.
- `npm run overworld-navigation-parity`
  生成 `reports/overworld-navigation/latest/`，并汇总世界路线边、行进依赖、预期路径不可达以及非预期捷径。
- `npm run economy-parity-audit`
  Generates `reports/economy-parity/latest/` and audits shop inventory, item circulation, price consistency, and reward/drop sanity for imported chapters.
- `npm run economy-parity-audit`
  生成 `reports/economy-parity/latest/`，并为已导入章节审计商店库存、物品流通、价格一致性以及奖励/掉落合理性。
- `npm run battle-enemy-group-import`
  Generates `reports/battle-calibration/latest/enemy-group-import.*` and checks source enemy/group data against generated battle content.
- `npm run battle-enemy-group-import`
  生成 `reports/battle-calibration/latest/enemy-group-import.*`，并检查 source 敌人/敌群数据与 generated battle content 的一致性。
- `npm run battle-scenario-import`
  Generates `reports/battle-calibration/latest/battle-scenario-import.*` and checks battle scenario source entries against world content and regression/parity bindings.
- `npm run battle-scenario-import`
  生成 `reports/battle-calibration/latest/battle-scenario-import.*`，并检查 battle scenario source 条目与 world 内容及 regression/parity 绑定。
- `npm run battle-reward-drop-check`
  Generates `reports/battle-calibration/latest/reward-drop-validation.*` and validates reward/experience/drop sanity.
- `npm run battle-reward-drop-check`
  生成 `reports/battle-calibration/latest/reward-drop-validation.*`，并校验奖励/经验/掉落合理性。
- `npm run battle-parity-checklist`
  Generates `reports/battle-calibration/latest/battle-parity-checklist.*` and shows whether a real battle slice is fully imported and calibrated.
- `npm run battle-parity-checklist`
  生成 `reports/battle-calibration/latest/battle-parity-checklist.*`，并说明某个真实战斗切片是否已完整导入并校准。
- `npm run battle-visual-backfill`
  Generates `reports/battle-visual-backfill/latest/` and verifies battle asset manifest entries, enemy intake metadata, and asset-registry attachment.
- `npm run battle-visual-backfill`
  生成 `reports/battle-visual-backfill/latest/`，并校验 battle 资产 manifest、enemy intake 元数据和 asset-registry 接线状态。
- `npm run battle-visual-parity-score`
  Generates `reports/battle-visual-parity/latest/` and scores battle-scene visual replacement progress for imported battle assets.
- `npm run battle-visual-parity-score`
  生成 `reports/battle-visual-parity/latest/`，并为已导入 battle 视觉资产计算战斗场景视觉替换得分。
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
