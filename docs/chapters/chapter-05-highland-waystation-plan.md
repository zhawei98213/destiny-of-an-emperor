# Chapter 05 Highland Waystation Plan
# Chapter 05 Highland Waystation 计划

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

- `chapterId`: `chapter-05-highland-waystation`
- `status`: `validating`
- included maps: `highland-pass`, `waystation-gate`, `supply-court`
- included NPC groups: `pass-courier`, `pass-scout`, `gate-captain`, `supply-steward`, `court-veteran`
- included events: `pass-courier-event`, `pass-scout-event`, `gate-captain-event`, `highland-east-gate-event`, `supply-steward-event`, `supply-cache-event`
- included shops: `waystation-supply-shop`
- included battle slices: `highland-pass-battle-trigger` -> `highland-outlaws`, `waystation-gate-battle-trigger` -> `highland-outlaws`
- included item/chest slices: key progression item `waystation-badge`, chest reward via `supply-cache-trigger`
- out of scope: original-script-perfect text, chapter-specific UI reskin, final tileset reconstruction, portrait/audio import, purchase transaction flow

## 2. Raw Source Checklist
## 2. 原始资料清单

- map sources: [ridgeway-camp.source.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/source/maps/ridgeway-camp.source.json) for the west-boundary connection, plus [highland-waystation.source.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/source/maps/highland-waystation.source.json) for the new maps
- NPC and event sources: curated chapter-05 event notes assembled into [story.content.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/manual/story.content.json)
- shop sources: [demo-game-data.source.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/source/data/demo-game-data.source.json) -> `waystation-supply-shop`
- enemy group sources: [demo-game-data.source.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/source/data/demo-game-data.source.json) -> `highland-outlaws`
- item/chest sources: current curated `waystation-badge` permit item and `bandage` chest reward, pending original verification

## 3. Map Import Steps
## 3. 地图导入步骤

- [x] Reuse the chapter bootstrap scaffold instead of hand-creating metadata, plan, and lock files
- [x] Extend the west boundary source map so `ridgeway-camp` connects into chapter-05 via content data
- [x] Add `highland-pass`, `waystation-gate`, and `supply-court` raw maps under `content/source/maps/`
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

- [x] Reuse the existing source data table for the staging battle group and shop registry
- [x] Add one new battle group `highland-outlaws` and one new shop `waystation-supply-shop`
- [x] Add key item `waystation-badge`
- [ ] Verify the final real shop and reward table once original notes are available

## 6. Parity Audit Steps
## 6. Parity 校验步骤

- [x] Add chapter-05 rows to [parity-matrix.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/parity-matrix.md)
- [x] Keep a separate chapter-local visual replacement backlog at [chapter-05-highland-waystation-visual-replacement-backlog.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-05-highland-waystation-visual-replacement-backlog.md)
- [x] Re-run asset, text, and UI parity reports after landing the slice
- [x] Keep visual replacement tasks non-blocking for gameplay closure

## 7. Regression Steps
## 7. Regression 校验步骤

- [x] Add chapter-05 golden cases
- [x] Keep `expectedUi` on the badge issue, gate opening, shop, chest, battle loop, and save/load roundtrip
- [x] Re-run discrepancy triage after the new regression report lands

## 8. Lock Criteria
## 8. 锁定完成标准

- [ ] Original dialogue lines verified against source reference
- [ ] `waystation-supply-shop` goods and prices verified against source reference
- [ ] `supply-cache-event` reward verified against source reference
- [ ] chapter-05 tileset and NPC visuals upgraded beyond placeholder
- [x] Maps load and connect in current runtime
- [x] NPC interactions, progression node, shop, chest loop, and save/load all run through shared systems
- [x] Validation, regression, asset, text, and UI audit commands pass

## 9. Current Divergences And Priority
## 9. 当前差异与优先级

- Priority 1: verify chapter-05 dialogue, shop table, and chest reward against original notes
- Priority 2: collect chapter-05 tileset and sprite references so the visual replacement backlog can start moving
- Priority 3: decide whether `waystation-gate` should later gain visible gate-state art instead of the current flag-only progression

## 10. Dual-Track Notes
## 10. 双轨模式记录

- Faster now:
- 当前更快的步骤：
  - `chapter-bootstrap` again removed the need to hand-copy metadata, plan, and lock scaffolds
  - `chapter-bootstrap` 再次免去了手工复制 metadata、plan 和 lock 骨架
  - existing event DSL was sufficient, so chapter-05 did not need any runtime opcode expansion
  - 现有事件 DSL 已足够支撑本章，因此 chapter-05 不需要新增 runtime opcode
  - the shared asset registry made it possible to keep all visual placeholders explicit while gameplay closed first
  - 共享 asset registry 让所有视觉 placeholder 都能显式登记，同时 gameplay 先完成闭环
- Still manual:
- 仍然手工的步骤：
  - deciding exact map scope and narrative handoff from chapter-04
  - 确定从 chapter-04 过渡到 chapter-05 的精确地图边界与叙事交接
  - curating Chinese dialogue and event names
  - 整理中文对白与事件命名
  - assembling runtime-ready maps in `world.content.json`
  - 把运行时可用地图手工组装进 `world.content.json`
  - writing the visual replacement backlog because chapter tools do not generate it yet
  - 视觉替换 backlog 仍需手工整理，因为现有章节工具还不会自动生成
- Not stable enough yet:
- 还不够稳定的工具点：
  - chapter bootstrap does not yet create a visual replacement backlog scaffold
  - `chapter-bootstrap` 目前还不会顺手生成 visual replacement backlog 骨架
  - source data for shop and enemy groups still lands in runtime through a mixed curated/generated path
  - 商店和敌群的 source data 目前仍通过“curated + generated”混合路径进入 runtime
  - reports that consume `reports/regression/latest` still need sequential reruns after `regression-smoke`
  - 读取 `reports/regression/latest` 的报告命令仍需在 `regression-smoke` 之后串行执行
