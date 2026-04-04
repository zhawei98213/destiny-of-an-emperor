# Chapter 11 Reed Ferry Plan
# Chapter 11 Reed Ferry 计划

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

- `chapterId`: `chapter-11-reed-ferry`
- `status`: `validating`
- included maps: `reed-ferry-road`、`reed-ferry-camp`
- included NPC groups: `reed-clerk`、`reed-sentry`、`reed-quartermaster`、`reed-boatman`
- included events: `reed-clerk-event`、`reed-sentry-event`、`reed-ferry-gate-event`、`reed-ferry-shop-event`、`reed-ferry-cache-event`
- included shops: `reed-ferry-shop`
- included battle slices: `reed-ferry-road-battle-trigger` -> `reed-ferry-road-raiders`
- included item/chest slices: `reed-ferry-cache-event`
- out of scope: chapter-11 专属敌群导入、chapter-11 视觉锁定、chapter-11 音频 reference 细化

## 2. Raw Source Checklist
## 2. 原始资料清单

- map sources: `content/source/maps/marsh-outpost.source.json`、`content/source/maps/reed-ferry.source.json`
- NPC and event sources: `content/source/text/chapter-11-reed-ferry.source.json`
- shop sources: curated `content/manual/story.content.json`
- enemy group sources: shared `highland-outlaws`
- item/chest sources: curated chapter-11 chest reward rows

## 3. Map Import Steps
## 3. 地图导入步骤

- [x] 用 `batch-chapter-bootstrap` 生成 chapter-11 骨架与默认 manifest
- [x] 给 `marsh-outpost` 增加向东 portal，形成 chapter-10 -> chapter-11 的稳定入口
- [x] 导入 `reed-ferry-road` 与 `reed-ferry-camp` 两张 source map
- [x] 接入 portal、spawn point、NPC 基础位置与朝向

## 4. NPC And Event Import Steps
## 4. NPC 与事件导入步骤

- [x] 导入 `reed-clerk`、`reed-sentry`、`reed-quartermaster`、`reed-boatman`
- [x] 继续复用 clerk/sentry/gate/shop/chest 模式构建 chapter-11 事件链
- [x] 继续复用 `facePlayer + movePlayer + warp` 的渡桥放行切图模式

## 5. Shop / Enemy Group / Item Import Steps
## 5. 商店 / 敌群 / 物品导入步骤

- [x] 新增 `reed-ferry-shop`
- [x] 复用 `highland-outlaws` 作为 chapter-11 战斗代用组
- [x] 新增渡营补给箱奖励

## 6. Parity Audit Steps
## 6. Parity 校验步骤

- [ ] 更新 `docs/parity-matrix.md`
- [ ] 运行 `npm run parity-score`
- [ ] 运行 `npm run discrepancy-triage`

## 7. Regression Steps
## 7. Regression 校验步骤

- [ ] 绑定 chapter-11 golden cases
- [ ] 绑定 chapter-11 battle parity case
- [ ] 运行 `npm run regression-smoke`

## 8. Lock Criteria
## 8. 锁定完成标准

- [ ] chapter-11 入口、守兵放行、商店、宝箱、战斗、存档都完成回归覆盖
- [ ] chapter-11 reference pack 从 bootstrap 占位提升到章节级真实覆盖
- [ ] chapter-11 visual backlog 明确列出 tileset、NPC、UI、battle 缺口

## 9. Current Divergences And Priority
## 9. 当前差异与优先级

- Priority 1: chapter-11 继续复用共享乱兵战与共享 NPC family，尚未进入章节级视觉锁定
- Priority 2: chapter-11 reference pack 目前只有低置信度占位帧
- Priority 3: chapter-11 商店和木箱奖励仍是 curated 版本，未与更强原始资料核对

## 10. New Content Mode And Runtime Read
## 10. 新内容模式与运行时判断

- new content mode: first ferry handoff slice on the eastern marsh route, but still closed with the shared gate cutscene pattern
- 新内容模式：东向沼泽路线上的第一个“渡口交接”切片，但仍通过共享的栅门过场模式闭环
- new runtime requirement triggered: none
- 是否触发新的运行时需求：没有
- visual gap focus: ferry road map still, sentry/clerk standing frames, ferry-camp shop UI still, and one battle still
- 视觉缺口重点：渡口前路地图参考、文吏/守兵站立帧、渡营商店 UI 参考，以及一张战斗 still
