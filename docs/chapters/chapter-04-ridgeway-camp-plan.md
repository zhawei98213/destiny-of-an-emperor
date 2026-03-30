# Chapter 04 Ridgeway Camp Plan
# Chapter 04 Ridgeway Camp 计划

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

- `chapterId`: `chapter-04-ridgeway-camp`
- `status`: `validating`
- included maps: `ridgeway-west-pass`, `ridgeway-watch`, `ridgeway-camp`
- included NPC groups: `ridge-runner`, `pass-sentry`, `watch-clerk`, `watch-guard`, `watch-lookout`, `ridge-quartermaster`, `ridge-veteran`
- included events: `ridge-runner-event`, `watch-clerk-event`, `watch-guard-event`, `ridgeway-east-gate-event`, `ridge-quartermaster-event`, `ridgeway-cache-event`
- included shops: `ridgeway-camp-shop`
- included battle slices: `ridgeway-west-battle-trigger` -> `ridgeway-raiders`, `ridgeway-watch-battle-trigger` -> `ridgeway-raiders`
- included item/chest slices: `ridgeway-cache-trigger`, key progression item `ridge-token`
- out of scope: original-script-perfect text, scripted NPC movement, gate animation, final real shop table verification, final real reward verification

## 2. Raw Source Checklist
## 2. 原始资料清单

- map sources: [river-ford-camp.source.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/source/maps/river-ford-camp.source.json) for the west boundary update, and [ridgeway-camp.source.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/source/maps/ridgeway-camp.source.json) for the new maps
- NPC and event sources: curated chapter-04 event notes assembled into [story.content.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/manual/story.content.json)
- shop sources: [demo-game-data.source.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/source/data/demo-game-data.source.json) -> `ridgeway-camp-shop`
- enemy group sources: [demo-game-data.source.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/source/data/demo-game-data.source.json) -> `ridgeway-raiders`
- item/chest sources: current curated `ridge-token` permit item and `travel-ration` chest reward, pending original verification

## 3. Map Import Steps
## 3. 地图导入步骤

- [x] Reuse the existing chapter bootstrap scaffold instead of hand-creating metadata, plan, and lock files
- [x] Extend the upstream west-boundary source map so `ford-camp` connects into chapter-04 via data instead of a scene branch
- [x] Add `ridgeway-west-pass`, `ridgeway-watch`, and `ridgeway-camp` raw maps under `content/source/maps/`
- [x] Reuse the existing map importer and staging report without format changes
- [x] Assemble final runtime maps in [world.content.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/manual/world.content.json)

## 4. NPC And Event Import Steps
## 4. NPC 与事件导入步骤

- [x] Keep trigger and event separate
- [x] Reuse existing DSL only: `dialogue`, `ifHasItem`, `ifFlag`, `ifNotFlag`, `warp`, `giveItem`, `setFlag`, `openShop`, `playSfx`, `end`
- [x] Keep all dialogue in Simplified Chinese
- [x] Bind each imported event to parity and regression

## 5. Shop / Enemy Group / Item Import Steps
## 5. 商店 / 敌群 / 物品导入步骤

- [x] Reuse the existing game-data source file for the staging inventory and enemy-group registry
- [x] Add one new battle group `ridgeway-raiders` and one new shop `ridgeway-camp-shop`
- [x] Add key item `ridge-token` and supply item `travel-ration`
- [ ] Verify the final real shop and reward table once original notes are available

## 6. Parity Audit Steps
## 6. Parity 校验步骤

- [x] Add chapter-04 rows to [parity-matrix.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/parity-matrix.md)
- [x] Re-run asset, text, and UI parity reports for the fourth real slice
- [x] Record tool gains and remaining manual steps in the chapter lock report

## 7. Regression Steps
## 7. Regression 校验步骤

- [x] Add chapter-04 golden cases
- [x] Keep `expectedUi` on the permit issue, watch gate, shop, chest, and battle loop
- [x] Re-run discrepancy triage after the new regression report lands

## 8. Lock Criteria
## 8. 锁定完成标准

- [ ] Original dialogue lines verified against source reference
- [ ] Ridgeway camp shop goods and prices verified against source reference
- [ ] Ridgeway cache reward verified against source reference
- [x] Maps load and connect in current runtime
- [x] NPC interactions, progression node, shop, and chest loop run through the shared interpreter
- [x] Validation, regression, text, asset, and UI audit commands pass

## 9. Current Divergences And Priority
## 9. 当前差异与优先级

- Priority 1: verify chapter-04 dialogue and item names against original notes
- Priority 2: verify `ridgeway-camp-shop` inventory and `ridgeway-cache-event` reward
- Priority 3: decide whether the ridgeway watch should later gain visible gate-state art instead of the current flag-only progression

## 10. Tool Gain Notes
## 10. 工具收益记录

- Faster now:
- 当前更快的步骤：
  - `chapter bootstrap` already removed the need to hand-copy metadata, plan, and lock scaffolds
  - `chapter bootstrap` 已经免去了手工复制 metadata、plan 和 lock 骨架
  - `check:chapter-completeness` immediately exposed chapter ownership drift after wiring
  - `check:chapter-completeness` 在接线后能立刻暴露章节归属漂移
  - `chapter-status-report` and `chapter-lock-checklist` provide a reusable summary instead of manual checklists
  - `chapter-status-report` 和 `chapter-lock-checklist` 已能代替手工整理状态摘要和锁定清单
- Still manual:
- 仍然手工的步骤：
  - deciding the exact chapter boundary and real slice scope
  - 决定章节边界和真实切片范围
  - curating Chinese dialogue lines and event names
  - 整理中文对白和事件命名
  - assembling final runtime maps in `world.content.json` because the map importer still only produces staging reports
  - 由于地图导入器目前只产出 staging report，最终运行时地图仍需在 `world.content.json` 里手工组装
- Not stable enough yet:
- 还不够稳定的工具点：
  - chapter completeness still needs better first-class handling for cross-chapter boundary ownership
  - chapter completeness 对跨章节边界归属仍需要更明确的原生支持
  - parity, asset, text, UI, and discrepancy reports still need sequential reruns instead of one combined chapter audit command
  - parity、asset、text、UI 和 discrepancy 报告仍需要串行重跑，还没有整合成单一章节审计命令
  - reports that consume `reports/regression/latest` cannot be run in parallel with `regression-smoke`, or they may read stale results
  - 读取 `reports/regression/latest` 的报告命令目前不能和 `regression-smoke` 并行执行，否则可能会读到旧结果
