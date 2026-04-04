# Chapter 08 Bridgehead Post Plan
# Chapter 08 Bridgehead Post 计划

## 1. Chapter Scope Definition
## 1. 章节范围定义

- `chapterId`: `chapter-08-bridgehead-post`
- `status`: `validating`
- included maps: `bridge-road`、`bridgehead-post`
- included NPC groups: `bridge-captain`、`bridge-sentry`、`bridge-quartermaster`、`bridge-runner`
- included events: `bridge-captain-event`、`bridge-sentry-event`、`bridgehead-gate-event`、`bridgehead-shop-event`、`bridgehead-cache-event`
- included shops: `bridgehead-post-shop`
- included battle slices: `bridge-road-battle-trigger` -> `bridge-road-raiders`
- included item/chest slices: `bridgehead-cache-event`
- out of scope: chapter-08 专属敌群导入、chapter-08 视觉锁定、chapter-08 音频 reference 细化

## 2. Raw Source Checklist
## 2. 原始资料清单

- map sources: `content/source/maps/forward-camp.source.json`、`content/source/maps/bridgehead-post.source.json`
- NPC and event sources: `content/source/text/chapter-08-bridgehead-post.source.json`
- shop sources: curated `content/manual/story.content.json`
- enemy group sources: shared `highland-outlaws`
- item/chest sources: curated chapter-08 chest reward rows

## 3. Map Import Steps
## 3. 地图导入步骤

- [x] 用 `batch-chapter-bootstrap` 生成 chapter-08 骨架与默认 manifest
- [x] 给 `forward-camp-yard` 增加向东 portal，形成 chapter-07 -> chapter-08 的稳定入口
- [x] 导入 `bridge-road` 与 `bridgehead-post` 两张 source map
- [x] 接入 portal、spawn point、NPC 基础位置与朝向

## 4. NPC And Event Import Steps
## 4. NPC 与事件导入步骤

- [x] 导入 `bridge-captain`、`bridge-sentry`、`bridge-quartermaster`、`bridge-runner`
- [x] 复用 guard/gate/shop/chest 模式构建 chapter-08 事件链
- [x] 用 `facePlayer + movePlayer + warp` 完成桥头木栅过场

## 5. Shop / Enemy Group / Item Import Steps
## 5. 商店 / 敌群 / 物品导入步骤

- [x] 新增 `bridgehead-post-shop`
- [x] 复用 `highland-outlaws` 作为 chapter-08 战斗代用组
- [x] 新增桥头补给箱奖励

## 6. Parity Audit Steps
## 6. Parity 校验步骤

- [ ] 更新 `docs/parity-matrix.md`
- [ ] 运行 `npm run parity-score`
- [ ] 运行 `npm run discrepancy-triage`

## 7. Regression Steps
## 7. Regression 校验步骤

- [ ] 绑定 chapter-08 golden cases
- [ ] 绑定 chapter-08 battle parity case
- [ ] 运行 `npm run regression-smoke`

## 8. Lock Criteria
## 8. 锁定完成标准

- [ ] chapter-08 入口、守兵放行、商店、宝箱、战斗、存档都完成回归覆盖
- [ ] chapter-08 reference pack 从 bootstrap 占位提升到章节级真实覆盖
- [ ] chapter-08 visual backlog 明确列出 tileset、NPC、UI、battle 缺口

## 9. Current Divergences And Priority
## 9. 当前差异与优先级

- Priority 1: chapter-08 仍复用共享敌群与共享 NPC family，尚未进入章节级视觉锁定
- Priority 2: chapter-08 reference pack 目前只有低置信度占位帧
- Priority 3: chapter-08 商店和木箱奖励仍是 curated 版本，未与更强原始资料核对
