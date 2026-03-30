# Chapter 03 Plan
# 第 03 章计划

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

- `chapterId`: `chapter-03-river-ford`
- `status`: `validating`
- included maps: `relay-east-pass`, `river-ford`, `ford-camp`
- included NPC groups: `ford-clerk`, `ford-guard`, `river-sentry`, `camp-quartermaster`, `camp-veteran`, `camp-lookout`
- included events: `relay-post-east-event`, `ford-clerk-event`, `ford-guard-event`, `ford-east-crossing-event`, `camp-quartermaster-event`, `ford-camp-cache-event`
- included shops: `ford-camp-shop`
- included battle slices: `relay-east-pass-battle-trigger` -> `field-wolves`, `river-ford-battle-trigger` -> `river-bandits`
- included item/chest slices: `ford-camp-cache-trigger`
- out of scope: original-script-perfect text, scripted NPC movement, bridge animation, real asset replacement for the new maps

## 2. Raw Source Checklist
## 2. 原始资料清单

- map sources: [river-ford-camp.source.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/source/maps/river-ford-camp.source.json)
- NPC and event sources: current curated chapter notes assembled into [story.content.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/manual/story.content.json)
- shop sources: [demo-game-data.source.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/source/data/demo-game-data.source.json) -> `ford-camp-shop`
- enemy group sources: [demo-game-data.source.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/source/data/demo-game-data.source.json) -> `river-bandits`
- item/chest sources: current curated `ford-seal` permit item and `bandage` supply reward, pending original verification

## 3. Map Import Steps
## 3. 地图导入步骤

- [x] Add `relay-east-pass`, `river-ford`, and `ford-camp` raw maps under `content/source/maps/`
- [x] Reuse the existing map importer without format changes
- [x] Wire chapter entry from `relay-post` into `relay-east-pass`
- [x] Assemble final runtime maps in [world.content.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/manual/world.content.json)

## 4. NPC And Event Import Steps
## 4. NPC 与事件导入步骤

- [x] Keep trigger and event separate
- [x] Reuse existing DSL only: `dialogue`, `ifHasItem`, `ifFlag`, `ifNotFlag`, `warp`, `giveItem`, `setFlag`, `openShop`, `playSfx`, `end`
- [x] Keep all dialogue in Simplified Chinese
- [x] Bind each imported event to parity and regression

## 5. Shop / Enemy Group / Item Import Steps
## 5. 商店 / 敌群 / 物品导入步骤

- [x] Reuse the existing data importer by extending `demo-game-data.source.json`
- [x] Add one new battle group `river-bandits` and one new shop `ford-camp-shop`
- [x] Add key item `ford-seal` and supply item `bandage`
- [ ] Verify the real reward and shop table once original notes are available

## 6. Parity Audit Steps
## 6. Parity 校验步骤

- [x] Add chapter-03 rows to [parity-matrix.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/parity-matrix.md)
- [x] Update [asset-parity.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/asset-parity.md) for the third real chapter baseline
- [x] Record current divergences and pressure in a chapter lock report

## 7. Regression Steps
## 7. Regression 校验步骤

- [x] Add chapter-03 golden cases
- [x] Keep `expectedUi` on the clerk, guard, shop, chest, and battle loop
- [x] Re-run import, validation, tests, and smoke regression after wiring

## 8. Lock Criteria
## 8. 锁定完成标准

- [ ] Original dialogue lines verified against source reference
- [ ] Ford-camp shop goods and prices verified against source reference
- [ ] Ford-camp chest reward verified against source reference
- [x] Maps load and connect in current runtime
- [x] NPC interactions, progression node, shop, and chest loop run through the shared interpreter
- [x] Regression and validation commands pass

## 9. Current Divergences And Priority
## 9. 当前差异与优先级

- Priority 1: verify chapter-03 dialogue and item names against original notes
- Priority 2: verify `ford-camp-shop` inventory and `ford-camp-cache-event` reward
- Priority 3: decide whether the river ford should later gain visible bridge-state art instead of the current flag-only progression
