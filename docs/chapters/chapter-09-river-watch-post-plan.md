# Chapter 09 River Watch Post Plan
# Chapter 09 River Watch Post 计划

## 1. Chapter Scope Definition
## 1. 章节范围定义

- `chapterId`: `chapter-09-river-watch-post`
- `status`: `validating`
- included maps: `east-bank-road`、`river-watch-post`
- included NPC groups: `bank-clerk`、`bank-sentry`、`watch-quartermaster`、`watch-scout`
- included events: `bank-clerk-event`、`bank-sentry-event`、`river-watch-gate-event`、`river-watch-shop-event`、`river-watch-cache-event`
- included shops: `river-watch-post-shop`
- included battle slices: `east-bank-road-battle-trigger` -> `east-bank-raiders`
- included item/chest slices: `river-watch-cache-event`
- out of scope: chapter-09 专属敌群导入、chapter-09 视觉锁定、chapter-09 音频 reference 细化

## 2. Raw Source Checklist
## 2. 原始资料清单

- map sources: `content/source/maps/bridgehead-post.source.json`、`content/source/maps/river-watch-post.source.json`
- NPC and event sources: `content/source/text/chapter-09-river-watch-post.source.json`
- shop sources: curated `content/manual/story.content.json`
- enemy group sources: shared `highland-outlaws`
- item/chest sources: curated chapter-09 chest reward rows

## 3. Map Import Steps
## 3. 地图导入步骤

- [x] 用 `batch-chapter-bootstrap` 生成 chapter-09 骨架与默认 manifest
- [x] 给 `bridgehead-post` 增加向东 portal，形成 chapter-08 -> chapter-09 的稳定入口
- [x] 导入 `east-bank-road` 与 `river-watch-post` 两张 source map
- [x] 接入 portal、spawn point、NPC 基础位置与朝向

## 4. NPC And Event Import Steps
## 4. NPC 与事件导入步骤

- [x] 导入 `bank-clerk`、`bank-sentry`、`watch-quartermaster`、`watch-scout`
- [x] 复用 clerk/sentry/gate/shop/chest 模式构建 chapter-09 事件链
- [x] 继续复用 `facePlayer + movePlayer + warp` 的过场门栅切图模式

## 5. Shop / Enemy Group / Item Import Steps
## 5. 商店 / 敌群 / 物品导入步骤

- [x] 新增 `river-watch-post-shop`
- [x] 复用 `highland-outlaws` 作为 chapter-09 战斗代用组
- [x] 新增河营补给箱奖励

## 6. Parity Audit Steps
## 6. Parity 校验步骤

- [ ] 更新 `docs/parity-matrix.md`
- [ ] 运行 `npm run parity-score`
- [ ] 运行 `npm run discrepancy-triage`

## 7. Regression Steps
## 7. Regression 校验步骤

- [ ] 绑定 chapter-09 golden cases
- [ ] 绑定 chapter-09 battle parity case
- [ ] 运行 `npm run regression-smoke`

## 8. Lock Criteria
## 8. 锁定完成标准

- [ ] chapter-09 入口、守兵放行、商店、宝箱、战斗、存档都完成回归覆盖
- [ ] chapter-09 reference pack 从 bootstrap 占位提升到章节级真实覆盖
- [ ] chapter-09 visual backlog 明确列出 tileset、NPC、UI、battle 缺口

## 9. Standardized Content Modes
## 9. 已标准化内容模式

- standardized map pattern: west-road -> gated interior two-map slice
- 已标准化地图模式：西侧道路 -> 东侧 gated interior 的双图切片
- standardized event pattern: clerk flag issue -> sentry flag check -> gate cutscene warp
- 已标准化事件模式：文吏发 flag -> 守兵验 flag -> 栅门过场切图
- standardized support pattern: shop NPC + one-shot chest + shared encounter table
- 已标准化支撑模式：商店 NPC + 一次性宝箱 + 共享 encounter table

## 10. Current Divergences And Priority
## 10. 当前差异与优先级

- Priority 1: chapter-09 继续复用共享敌群与共享 NPC family，尚未进入章节级视觉锁定
- Priority 2: chapter-09 reference pack 目前只有低置信度占位帧
- Priority 3: chapter-09 商店和木箱奖励仍是 curated 版本，未与更强原始资料核对
