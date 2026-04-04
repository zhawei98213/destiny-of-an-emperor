# Chapter 10 Marsh Outpost Plan
# Chapter 10 Marsh Outpost 计划

## 1. Chapter Scope Definition
## 1. 章节范围定义

- `chapterId`: `chapter-10-marsh-outpost`
- `status`: `validating`
- included maps: `marsh-road`、`marsh-outpost`
- included NPC groups: `marsh-clerk`、`marsh-sentry`、`marsh-quartermaster`、`marsh-scout`
- included events: `marsh-clerk-event`、`marsh-sentry-event`、`marsh-outpost-gate-event`、`marsh-outpost-shop-event`、`marsh-outpost-cache-event`
- included shops: `marsh-outpost-shop`
- included battle slices: `marsh-road-battle-trigger` -> `marsh-road-raiders`
- included item/chest slices: `marsh-outpost-cache-event`
- out of scope: chapter-10 专属敌群导入、chapter-10 视觉锁定、chapter-10 音频 reference 细化

## 2. Raw Source Checklist
## 2. 原始资料清单

- map sources: `content/source/maps/river-watch-post.source.json`、`content/source/maps/marsh-outpost.source.json`
- NPC and event sources: `content/source/text/chapter-10-marsh-outpost.source.json`
- shop sources: curated `content/manual/story.content.json`
- enemy group sources: shared `highland-outlaws`
- item/chest sources: curated chapter-10 chest reward rows

## 3. Map Import Steps
## 3. 地图导入步骤

- [x] 用 `batch-chapter-bootstrap` 生成 chapter-10 骨架与默认 manifest
- [x] 给 `river-watch-post` 增加向东 portal，形成 chapter-09 -> chapter-10 的稳定入口
- [x] 导入 `marsh-road` 与 `marsh-outpost` 两张 source map
- [x] 接入 portal、spawn point、NPC 基础位置与朝向

## 4. NPC And Event Import Steps
## 4. NPC 与事件导入步骤

- [x] 导入 `marsh-clerk`、`marsh-sentry`、`marsh-quartermaster`、`marsh-scout`
- [x] 继续复用 clerk/sentry/gate/shop/chest 模式构建 chapter-10 事件链
- [x] 继续复用 `facePlayer + movePlayer + warp` 的木栅过场切图模式

## 5. Shop / Enemy Group / Item Import Steps
## 5. 商店 / 敌群 / 物品导入步骤

- [x] 新增 `marsh-outpost-shop`
- [x] 复用 `highland-outlaws` 作为 chapter-10 战斗代用组
- [x] 新增沼营补给箱奖励

## 6. Parity Audit Steps
## 6. Parity 校验步骤

- [x] 更新 `docs/parity-matrix.md`
- [x] 运行 `npm run parity-score`
- [x] 运行 `npm run discrepancy-triage`

## 7. Regression Steps
## 7. Regression 校验步骤

- [x] 绑定 chapter-10 golden cases
- [x] 绑定 chapter-10 battle parity case
- [x] 运行 `npm run regression-smoke`

## 8. Lock Criteria
## 8. 锁定完成标准

- [x] chapter-10 入口、守兵放行、商店、宝箱、战斗、存档都完成回归覆盖
- [x] chapter-10 reference pack 从 bootstrap 占位提升到章节级真实覆盖
- [x] chapter-10 visual backlog 明确列出 tileset、NPC、UI、battle 缺口

## 9. Standardized Content Modes
## 9. 已标准化内容模式

- standardized map pattern: west-road -> gated interior two-map slice
- 已标准化地图模式：西侧道路 -> 东侧 gated interior 双图切片
- standardized event pattern: clerk flag issue -> sentry flag check -> gate cutscene warp
- 已标准化事件模式：文吏发 flag -> 守兵验 flag -> 木栅过场切图
- standardized support pattern: shop NPC + one-shot chest + shared encounter table
- 已标准化支撑模式：商店 NPC + 一次性宝箱 + 共享 encounter table

## 10. Current Divergences And Priority
## 10. 当前差异与优先级

- Priority 1: chapter-10 继续复用共享敌群与共享 NPC family，尚未进入章节级视觉锁定
- Priority 2: chapter-10 reference pack 目前只有低置信度占位帧
- Priority 3: chapter-10 商店和木箱奖励仍是 curated 版本，未与更强原始资料核对
