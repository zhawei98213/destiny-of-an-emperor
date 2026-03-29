# Chapter 02 Plan
# 第 02 章计划

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

- `chapterId`: `chapter-02-east-road-relay`
- `status`: `validating`
- included maps: `east-road`, `relay-post`
- included NPC groups: `road-scout`, `relay-healer`, `relay-porter`
- included events: `field-east-road-event`, `road-scout-event`, `relay-rest-event`, `relay-cache-event`
- included shops: none, use one restore function point instead
- included battle slices: `east-road-battle-trigger` -> `relay-road-wolves`
- included item/chest slices: `relay-cache-trigger`
- out of scope: original-script-perfect dialogue, shop table import, relay-post interior scripting beyond the current rest and chest loop

## 2. Raw Source Checklist
## 2. 原始资料清单

- map sources: [east-road-relay.source.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/source/maps/east-road-relay.source.json)
- NPC and event sources: current curated chapter notes assembled into [story.content.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/manual/story.content.json)
- shop sources: not in scope for this slice
- enemy group sources: reuse [demo-game-data.source.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/source/data/demo-game-data.source.json) -> `field-wolves`
- item/chest sources: current curated relay cache reward, pending original reward verification

## 3. Map Import Steps
## 3. 地图导入步骤

- [x] Add `east-road` and `relay-post` raw maps under `content/source/maps/`
- [x] Reuse existing map importer without format changes
- [x] Wire chapter entry from `field` into `east-road`
- [x] Assemble final runtime maps in [world.content.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/manual/world.content.json)

## 4. NPC And Event Import Steps
## 4. NPC 与事件导入步骤

- [x] Keep trigger and event separate
- [x] Reuse existing DSL only: `dialogue`, `warp`, `restoreParty`, `giveItem`, `setFlag`, `playSfx`, `end`
- [x] Keep all dialogue in Simplified Chinese
- [x] Bind each imported event to parity and regression

## 5. Shop / Enemy Group / Item Import Steps
## 5. 商店 / 敌群 / 物品导入步骤

- [x] Reuse existing `field-wolves` battle group for the east-road encounter slice
- [x] Reuse existing item definition `bronze-sword` for the relay cache reward
- [ ] Import original relay reward table once the source reference is available

## 6. Parity Audit Steps
## 6. Parity 校验步骤

- [x] Add chapter-02 rows to [parity-matrix.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/parity-matrix.md)
- [x] Separate runtime-supported behaviors from still-curated content
- [x] Record next actions in a chapter lock report

## 7. Regression Steps
## 7. Regression 校验步骤

- [x] Add chapter-02 golden cases
- [x] Keep `expectedUi` on visible behaviors such as dialogue and rest
- [x] Re-run import, validation, tests, and smoke regression after wiring

## 8. Lock Criteria
## 8. 锁定完成标准

- [ ] Original dialogue lines verified against source reference
- [ ] Relay cache reward verified against source reference
- [x] Maps load and connect in current runtime
- [x] NPC interactions and chest loop run through the shared interpreter
- [x] Regression and validation commands pass

## 9. Current Divergences And Priority
## 9. 当前差异与优先级

- Priority 1: verify chapter-02 dialogue against the future original text source
- Priority 2: verify relay cache reward against original item notes
- Priority 3: decide whether relay-post should later gain a true shop table or stay as a restore point
