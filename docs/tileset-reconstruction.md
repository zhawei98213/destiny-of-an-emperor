# Tileset Reconstruction
# Tileset 重建流程

## Goal
## 目标

Reconstruct runtime-usable tileset slices from reference materials when the original game tileset files are not available.
在没有原始游戏 tileset 文件的情况下，基于 reference 资料重建可供 runtime 使用的 tileset 子集。

This workflow is intentionally staged:
这个流程刻意分阶段进行：

- first build traceable candidate metadata
- 先建立可追溯的候选元数据
- then normalize tile crops into a stable plan
- 再把 tile crop 归一化为稳定计划
- then attach approved subsets to the shared asset registry
- 最后把审查通过的子集接入共享 asset registry

It does not assume perfect automatic reconstruction.
它不假设“一步自动重建完美结果”。

## Source Of Truth
## 事实来源

- reference inputs: `content/reference/manifest.json`
- reference 输入：`content/reference/manifest.json`
- tileset candidates: `content/reference/tiles/tileset-candidates.json`
- tileset 候选清单：`content/reference/tiles/tileset-candidates.json`
- runtime attachment: `content/manual/asset-registry.content.json`
- 运行时接线：`content/manual/asset-registry.content.json`

## Candidate Format
## 候选格式

Each candidate records:
每个 candidate 记录：

- `id`
- `chapterId`
- `mapIds`
- `logicalAssetKey`
- `status`
- `tileWidth` / `tileHeight`
- `palette`
- `referenceIds`
- `curationSteps`
- `tiles`
- `notes`

Each tile entry records:
每个 tile 条目记录：

- `tileId`
- `label`
- `role`
- `blocked`
- `referenceId`
- `sourceRect`
- `normalized`
- `observedPalette`

## Curated Steps
## 人工 curated 步骤

Manual steps are allowed, but must be written into `curationSteps`.
允许人工步骤，但必须写进 `curationSteps`。

Supported current step types:
当前支持的步骤类型：

- `manual-crop`
- `manual-normalize`
- `palette-review`

This keeps every reconstructed tile subset traceable.
这样可以保证每一批重建 tileset 子集都可追溯。

## Commands
## 命令

- `npm run tileset-crop-normalize`
  Writes the current normalization task list to `content/generated/import-staging/tileset-crop-plan.generated.json`.
- `npm run tileset-crop-normalize`
  把当前归一化任务列表写入 `content/generated/import-staging/tileset-crop-plan.generated.json`。

- `npm run tileset-reconstruct`
  Validates candidates, checks palette and dimensions, writes collision review assistance, and generates `reports/tileset-reconstruction/latest/`.
- `npm run tileset-reconstruct`
  校验 candidate，检查 palette 和尺寸，输出 collision review 协助结果，并生成 `reports/tileset-reconstruction/latest/`。

## Current Checks
## 当前检查能力

The current tooling checks:
当前工具会检查：

- duplicate candidate ids
- candidate id 重复
- duplicate logical asset keys
- logical asset key 重复
- missing reference ids
- 缺失 reference id
- invalid hex palette colors
- 非法十六进制 palette 颜色
- tile source and normalized dimensions
- tile source 与 normalized 尺寸
- per-tile palette consistency against the declared candidate palette
- 每个 tile 的 observed palette 是否属于 candidate 声明 palette
- whether the candidate is attached to the shared asset registry
- candidate 是否已经接入共享 asset registry
- blocked tile ids that appear on the runtime map but are not covered by the candidate tile list
- 运行时地图中实际出现、但 candidate tile 列表未覆盖的阻挡 tile id

## Runtime Attachment Rule
## 运行时接入规则

Reconstructed tilesets must enter runtime through a logical asset key such as `tileset.town`.
重建后的 tileset 必须通过 `tileset.town` 这类逻辑资源 key 接入 runtime。

Do not hardcode map colors or future sprite sheet paths directly in scenes.
不要把地图颜色或未来 sprite sheet 路径直接硬编码进 scene。

The current runtime attachment is a `tileset-palette` resource in `asset-registry.content.json`.
当前 runtime 接入方式是在 `asset-registry.content.json` 中声明 `tileset-palette` 资源。

This is the first bridge toward future real tileset assets.
这是通向未来真实 tileset 资源的第一层桥接。

## Lock Criteria
## 锁定标准

A reconstructed tileset slice should not be marked `locked` until:
重建后的 tileset 切片在满足以下条件前，不应标记为 `locked`：

1. candidate metadata validates cleanly
1. candidate 元数据校验通过
2. normalization plan is complete for the intended tile subset
2. 目标 tile 子集的归一化计划已经完整
3. collision review has no uncovered blocked tile ids for the locked maps
3. 锁定地图的 collision review 不再有未覆盖阻挡 tile id
4. the logical asset key is attached in asset registry
4. 对应逻辑资源 key 已接入 asset registry
5. parity review has been performed against reference material
5. 已基于 reference 资料完成一致性审查

## Current Baseline
## 当前基线

The first attached reconstructed subset is:
当前第一批已接入运行时的重建子集是：

- `chapter-01-town-main-tileset`
- logical key: `tileset.town`
- runtime map: `town`

This means Lou Sang town already uses a reconstructed tileset palette subset without changing scene logic.
这意味着楼桑村 `town` 地图已经在不修改 scene 逻辑的前提下，开始使用重建 tileset palette 子集。
