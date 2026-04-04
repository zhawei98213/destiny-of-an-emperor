# Chapter 12 Inner Ford Plan
# Chapter 12 Inner Ford 计划

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

- `chapterId`: `chapter-12-inner-ford`
- `status`: `validating`
- included maps: `inner-ford-road`、`inner-ford-camp`
- included NPC groups: `inner-ford-clerk`、`inner-ford-sentry`、`inner-ford-quartermaster`、`inner-ford-boatman`
- included events: `inner-ford-clerk-event`、`inner-ford-sentry-event`、`inner-ford-gate-event`、`inner-ford-shop-event`、`inner-ford-cache-event`
- included shops: `inner-ford-shop`
- included battle slices: `inner-ford-road-battle-trigger` -> `inner-ford-road-raiders`
- included item/chest slices: `inner-ford-cache-event`
- out of scope: chapter-12 专属敌群导入、chapter-12 视觉锁定、chapter-12 音频 reference 细化

## 2. Raw Source Checklist
## 2. 原始资料清单

- map sources: `content/source/maps/reed-ferry.source.json`、`content/source/maps/inner-ford.source.json`
- NPC and event sources: `content/source/text/chapter-12-inner-ford.source.json`
- shop sources: curated `content/manual/story.content.json`
- enemy group sources: shared `highland-outlaws`
- item/chest sources: curated chapter-12 chest reward rows

## 3. Map Import Steps
## 3. 地图导入步骤

- [x] 用 `batch-chapter-bootstrap` 生成 chapter-12 骨架与默认 manifest
- [x] 给 `reed-ferry-camp` 增加向东的切换事件，形成 chapter-11 -> chapter-12 的稳定入口
- [x] 导入 `inner-ford-road` 与 `inner-ford-camp` 两张 source map
- [x] 接入 portal、spawn point、NPC 基础位置与朝向

## 4. NPC And Event Import Steps
## 4. NPC 与事件导入步骤

- [x] 导入 `inner-ford-clerk`、`inner-ford-sentry`、`inner-ford-quartermaster`、`inner-ford-boatman`
- [x] 继续复用 clerk/sentry/gate/shop/chest 模式构建 chapter-12 事件链
- [x] 继续复用 `facePlayer + movePlayer + warp` 的放桥切图模式

## 5. Shop / Enemy Group / Item Import Steps
## 5. 商店 / 敌群 / 物品导入步骤

- [x] 新增 `inner-ford-shop`
- [x] 复用 `highland-outlaws` 作为 chapter-12 战斗代用组
- [x] 新增内渡补给箱奖励

## 6. Parity Audit Steps
## 6. Parity 校验步骤

- [ ] 更新 `docs/parity-matrix.md`
- [ ] 运行 `npm run parity-score`
- [ ] 运行 `npm run discrepancy-triage`

## 7. Regression Steps
## 7. Regression 校验步骤

- [ ] 绑定 chapter-12 golden cases
- [ ] 绑定 chapter-12 battle parity case
- [ ] 运行 `npm run regression-smoke`

## 8. Lock Criteria
## 8. 锁定完成标准

- [ ] chapter-12 入口、守兵放行、商店、宝箱、战斗、存档都完成回归覆盖
- [ ] chapter-12 reference pack 从 bootstrap 占位提升到章节级真实覆盖
- [ ] chapter-12 visual backlog 明确列出 tileset、NPC、UI、battle 缺口

## 9. Current Divergences And Priority
## 9. 当前差异与优先级

- Priority 1: chapter-12 继续复用共享乱兵战与共享 NPC family，尚未进入章节级视觉锁定
- Priority 2: chapter-12 reference pack 目前只有低置信度占位帧
- Priority 3: chapter-12 商店和木箱奖励仍是 curated 版本，未与更强原始资料核对

## 10. New Content Mode And Runtime Read
## 10. 新内容模式与运行时判断

- new content mode: a second ford checkpoint slice that extends the ferry handoff into an inner crossing road and camp pair
- 新内容模式：把渡口交接继续推进成“内渡前路 + 内渡营地”双图切片的第二道河渡检查点
- new runtime requirement triggered: none
- 是否触发新的运行时需求：没有
- visual gap focus: inner-ford road and camp stills, chapter-local sentry/clerk standing frames, one dialogue UI still, and one battle still
- 视觉缺口重点：内渡前路与营地图参考、章节级守兵/文吏站立帧、一张对话 UI 参考，以及一张战斗 still
