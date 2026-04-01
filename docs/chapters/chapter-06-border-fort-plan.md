# Chapter 06 Border Fort Plan
# Chapter 06 Border Fort 计划

Use this file as the working plan for one real chapter or one bounded real area.
把此文件作为一个真实章节或一个边界清晰区域的执行计划。

Reference workflow:
执行工艺参考：

- [chapter-factory-template.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapter-factory-template.md)
- [AGENTS.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/AGENTS.md)
- [parity-matrix.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/parity-matrix.md)
- [testing-and-regression.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/testing-and-regression.md)

## 1. Chapter Scope Definition
## 1. 章节范围定义

- `chapterId`: `chapter-06-border-fort`
- `status`: `validating`
- included maps: `border-road`, `border-fort-yard`
- included NPC groups: `border-clerk`, `border-sentry`, `fort-healer`, `fort-veteran`
- included events: `border-clerk-event`, `border-sentry-event`, `border-fort-gate-event`, `fort-healer-event`, `fort-cache-event`
- included shops: none; this slice uses one recovery point instead of a shop
- included battle slices: `border-road-battle-trigger` -> `border-road-outlaws` -> `highland-outlaws`
- included item/chest slices: `fort-cache-trigger` -> `bandage x2`
- out of scope: original-script-perfect text, chapter-local UI reskin, new battle opcode, portrait/audio import, true border-fort shop table

## 2. Raw Source Checklist
## 2. 原始资料清单

- map sources: [highland-waystation.source.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/source/maps/highland-waystation.source.json) for the west-boundary connection and [border-fort.source.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/source/maps/border-fort.source.json) for the new area maps
- NPC and event sources: curated chapter-06 event notes assembled into [story.content.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/manual/story.content.json)
- shop sources: none in this slice; the function-point path is `fort-healer-event` -> `restoreParty`
- enemy group sources: existing [demo-game-data.source.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/source/data/demo-game-data.source.json) -> `highland-outlaws`, bound through new encounter table `border-road-outlaws`
- item/chest sources: current curated `bandage` chest reward, pending original verification

## 3. Map Import Steps
## 3. 地图导入步骤

- [x] Extend chapter-05 `supply-court` source and manual world content with one eastbound portal into chapter-06
- [x] Add `border-road` and `border-fort-yard` raw maps under `content/source/maps/border-fort.source.json`
- [x] Assemble the final runtime maps into [world.content.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/manual/world.content.json) without scene-local shortcuts
- [x] Bind `tileset.border-road` and `tileset.border-fort-yard` as explicit placeholder keys in [asset-registry.content.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/manual/asset-registry.content.json)

## 4. NPC And Event Import Steps
## 4. NPC 与事件导入步骤

- [x] Add four NPCs with runtime-facing position, sprite family, and facing data from content
- [x] Add the clerk-order -> sentry-check -> gate-warp progression using only existing event DSL
- [x] Keep one non-trigger NPC (`fort-veteran`) as static placement content so later dialogue import has a stable anchor
- [x] Keep all chapter-06 dialogue in Simplified Chinese and out of scene code

## 5. Shop / Enemy Group / Item Import Steps
## 5. 商店 / 敌群 / 物品导入步骤

- [x] Reuse `restoreParty` as the chapter function point through `fort-healer-event`
- [x] Add `border-road-outlaws` encounter table and reuse `highland-outlaws` as the minimum battle slice
- [x] Add one one-shot chest reward through `fort-cache-event`

## 6. Parity Audit Steps
## 6. Parity 校验步骤

- [x] Add chapter-06 rows to [parity-matrix.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/parity-matrix.md)
- [x] Add chapter-local visual/reference gap tracking in [chapter-06-border-fort-visual-replacement-backlog.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-06-border-fort-visual-replacement-backlog.md)
- [x] Keep gameplay closure independent from unresolved visual reference gaps

## 7. Regression Steps
## 7. Regression 校验步骤

- [x] Add chapter-06 golden cases for clerk, sentry, gate warp, healer, chest, battle, and save/load
- [x] Re-run `regression-smoke`, `check:chapter-completeness`, `chapter-status-report`, and `chapter-lock-checklist`

## 8. Lock Criteria
## 8. 锁定完成标准

- [x] The slice is reachable from chapter-05 without scene-local branching
- [x] At least one progression node, one recovery point, one chest, and one battle are content-driven and replayable
- [x] Save/load restores the chapter-06 runtime state
- [ ] Dialogue wording and chest reward are verified against stronger reference sources
- [ ] Visual replacement backlog starts with explicit map/NPC/UI/battle gaps

## 9. Current Divergences And Priority
## 9. 当前差异与优先级

- Priority 1: collect chapter-06 gate, yard, and sentry references so the visual backlog can move beyond pure placeholder tracking
- Priority 2: verify whether the border-fort recovery point should later become a true supply shop instead of a restore-only function point
- Priority 3: confirm whether `highland-outlaws` is an acceptable stand-in for the border-road battle slice or needs a dedicated enemy group later
