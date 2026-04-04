# Chapter 07 Forward Camp Plan
# Chapter 07 Forward Camp 计划

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

- `chapterId`: `chapter-07-forward-camp`
- `status`: `validating`
- included maps: `fort-east-road`, `forward-camp-yard`
- included NPC groups: `fort-adjutant`, `camp-sentry`, `camp-purveyor`, `camp-scout`
- included events: `border-fort-east-road-event`, `fort-adjutant-event`, `camp-sentry-event`, `forward-camp-gate-event`, `forward-camp-shop-event`, `forward-camp-cache-event`
- included shops: `forward-camp-shop`
- included battle slices: `fort-east-road-battle-trigger` -> `fort-east-road-raiders` -> `highland-outlaws`
- included item/chest slices: `forward-camp-cache-trigger` -> `bandage x1 + herb x1`
- out of scope: original-script-perfect wording, chapter-local visual replacement completion, dedicated chapter-07 enemy group, chapter-07 portrait/audio backfill

## 2. Raw Source Checklist
## 2. 原始资料清单

- map sources: [border-fort.source.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/source/maps/border-fort.source.json) for the west-boundary connection and [forward-camp.source.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/source/maps/forward-camp.source.json) for the new area maps
- NPC and event sources: [chapter-07-forward-camp.source.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/source/text/chapter-07-forward-camp.source.json) and curated chapter-07 event notes assembled into [story.content.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/manual/story.content.json)
- shop sources: current curated `forward-camp-shop` table in [story.content.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/manual/story.content.json)
- enemy group sources: existing [demo-game-data.source.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/source/data/demo-game-data.source.json) -> `highland-outlaws`, bound through new encounter table `fort-east-road-raiders`
- item/chest sources: current curated `bandage + herb` reward, pending original verification

## 3. Map Import Steps
## 3. 地图导入步骤

- [x] Extend chapter-06 `border-fort-yard` with one eastbound tile event into chapter-07
- [x] Add `fort-east-road` and `forward-camp-yard` raw maps under [forward-camp.source.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/source/maps/forward-camp.source.json)
- [x] Assemble the final runtime maps into [world.content.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/manual/world.content.json) without scene-local shortcuts
- [x] Bind `tileset.fort-east-road` and `tileset.forward-camp-yard` as explicit placeholder keys in [asset-registry.content.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/manual/asset-registry.content.json)

## 4. NPC And Event Import Steps
## 4. NPC 与事件导入步骤

- [x] Add four NPCs with runtime-facing position, sprite family, and facing data from content
- [x] Add the adjutant-order -> sentry-check -> gate-cutscene -> forward-camp warp progression using only shared event DSL
- [x] Use `facePlayer` + `movePlayer` in a real gate transition instead of scene-local scripted motion
- [x] Keep all chapter-07 dialogue in Simplified Chinese and out of scene code

## 5. Shop / Enemy Group / Item Import Steps
## 5. 商店 / 敌群 / 物品导入步骤

- [x] Add one chapter-local shop through `forward-camp-shop-event`
- [x] Add `fort-east-road-raiders` encounter table and reuse `highland-outlaws` as the minimum battle slice
- [x] Add one one-shot chest reward through `forward-camp-cache-event`

## 6. Parity Audit Steps
## 6. Parity 校验步骤

- [x] Add chapter-07 rows to [parity-matrix.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/parity-matrix.md)
- [x] Add chapter-local visual/reference gap tracking in [chapter-07-forward-camp-visual-replacement-backlog.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-07-forward-camp-visual-replacement-backlog.md)
- [x] Keep gameplay closure independent from unresolved visual reference gaps

## 7. Regression Steps
## 7. Regression 校验步骤

- [x] Add chapter-07 golden cases for the entry, adjutant, sentry, gate warp, shop, chest, battle, and save/load
- [x] Add chapter-07 battle parity notes for the reused `highland-outlaws` slice
- [x] Re-run `regression-smoke`, `check:chapter-completeness`, `chapter-status-report`, and `chapter-lock-checklist`

## 8. Lock Criteria
## 8. 锁定完成标准

- [x] The slice is reachable from chapter-06 without scene-local branching
- [x] At least one progression node, one shop point, one chest, and one battle are content-driven and replayable
- [x] Save/load restores the chapter-07 runtime state
- [x] The new cutscene minimum (`facePlayer` + `movePlayer`) is exercised by a real chapter gate event
- [ ] Dialogue wording and chest reward are verified against stronger reference sources
- [ ] Visual replacement backlog starts with explicit map/NPC/UI/battle gaps

## 9. Current Divergences And Priority
## 9. 当前差异与优先级

- Priority 1: collect chapter-07 map, gate, and NPC references so the visual backlog can move beyond pure placeholder tracking
- Priority 2: decide whether `highland-outlaws` remains an acceptable stand-in for the fort-east-road battle slice or needs a dedicated enemy group
- Priority 3: verify whether the forward-camp shop inventory and chest reward should change once stronger references arrive
