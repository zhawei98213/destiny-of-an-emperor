# Reference Pipeline
# 参考资料管线

## Purpose
## 目的

This pipeline exists so the project can collect, normalize, and query visual references
before original game assets are available.
这个管线的目标是在没有原始游戏资源文件的前提下，先把视觉参考资料采集、整理和查询体系建立起来。

The goal is not to treat references as runtime assets.
目标不是把参考资料直接当成运行时资源使用。

## Boundaries
## 边界

- `content/reference/` stores traceable reference inputs only.
- `content/reference/` 只存放可追溯的参考输入。
- `game/` must not load `content/reference/` directly.
- `game/` 不得直接加载 `content/reference/`。
- Reference files must be indexed through `content/reference/manifest.json`.
- 参考资料文件必须通过 `content/reference/manifest.json` 建立索引。
- Runtime assets should be reconstructed later through the asset pipeline, not copied from references ad hoc.
- 运行时资源应在后续通过资产管线重建，而不是临时从参考资料直接复制到运行时。

## Directory Layout
## 目录结构

- `content/reference/screenshots/`
- `content/reference/video-stills/`
- `content/reference/ui/`
- `content/reference/sprites/`
- `content/reference/tiles/`
- `content/reference/enemies/`
- `content/reference/shops/`
- `content/reference/battle/`

Recommended usage:

推荐用法：

- `screenshots/`: full-screen or map-level captures.
- `screenshots/`：整屏或地图级截图。
- `video-stills/`: extracted frames from gameplay videos.
- `video-stills/`：从游戏视频提取的帧图。
- `ui/`: cropped panels, windows, cursors, box layouts.
- `ui/`：裁切后的面板、窗口、光标、对话框布局。
- `sprites/`: character, NPC, or object sprite crops.
- `sprites/`：角色、NPC 或对象精灵裁切。
- `tiles/`: terrain, building, and map tile references.
- `tiles/`：地形、建筑和地图 tile 参考。
- `enemies/`: enemy sprite and encounter presentation references.
- `enemies/`：敌方形象与遭遇表现参考。
- `shops/`: store layouts, counter shots, inventory panel references.
- `shops/`：商店布局、柜台画面、商品面板参考。
- `battle/`: battle HUD, turn flow, and result screen references.
- `battle/`：战斗 HUD、回合流程和结算画面参考。

## Manifest Format
## Manifest 格式

Manifest file:

manifest 文件：

- `content/reference/manifest.json`

Current format:

当前格式：

- `format: "reference-manifest-v1"`
- `entries: ReferenceEntry[]`

Each entry records:

每条记录至少包含：

- `id`: stable unique reference key
- `id`：稳定唯一的 reference key
- `source_name`: human-readable source label
- `source_name`：人类可读的来源名称
- `source_type`: `screenshot | video | manual-crop`
- `source_type`：`screenshot | video | manual-crop`
- `chapter`: owning chapter id
- `chapter`：所属章节 id
- `map_id`: optional map scope
- `map_id`：可选的地图范围
- `scene_type`: optional scene bucket such as `dialogue`, `menu`, `shop`, or `battle`
- `scene_type`：可选的场景类型，例如 `dialogue`、`menu`、`shop` 或 `battle`
- `subject_type`: `map | npc | ui | sprite | tile | enemy | shop | battle`
- `subject_type`：`map | npc | ui | sprite | tile | enemy | shop | battle`
- `subject_id`: concrete target id used for querying
- `subject_id`：用于查询的具体目标 id
- `confidence`: `low | medium | high`
- `confidence`：`low | medium | high`
- `notes`: editorial context and caveats
- `notes`：编辑上下文和注意事项

Optional fields:

可选字段：

- `asset_path`: relative path inside `content/reference/`
- `asset_path`：`content/reference/` 内的相对路径
- `metadata.timestamp`
- `metadata.source_locator`
- `metadata.approximate_source`
- `metadata.crop.{x,y,width,height}`
- `metadata.variant`
- `metadata.tags[]`

## Reference Frame Extraction
## 参考关键帧提取

Reference frame extraction adds one more ingestion path on top of the base manifest:
参考关键帧提取在基础 manifest 之上新增了一条输入路径：

- `content/reference/frame-packs/*.json`

Each frame pack describes:
每个关键帧包描述：

- one video or screenshot-sequence source
- 一个视频或截图序列来源
- a curated list of keyframes
- 一组人工整理的关键帧
- chapter ownership
- 章节归属
- `map_id`
- `scene_type`
- `subject_type`
- `subject_id`
- approximate timestamp or frame source reference
- 近似时间戳或源帧定位信息

Command:
命令：

- `npm run reference-frame-extract`

This command validates frame packs and writes:
该命令会校验关键帧包，并输出：

- `reports/reference-frame-extract/latest/report.json`
- `reports/reference-frame-extract/latest/summary.md`

Frame-pack-derived entries are merged into the normal reference query path, so `reference-query` can discover them without a separate database.
由关键帧包派生出来的条目会并入常规 reference 查询路径，因此 `reference-query` 无需额外数据库就能查到这些帧。

## Chapter Reference Summary
## 章节参考资料摘要

Command:
命令：

- `npm run reference-summary`

This command summarizes the first four imported real chapters and writes:
该命令会汇总前四个已导入真实章节，并输出：

- `reports/reference/latest/chapter-summary.json`
- `reports/reference/latest/chapter-summary.md`

It tracks four reconstruction-facing buckets:
它会跟踪四类面向重建的覆盖项：

- map references
- 地图参考
- NPC references
- NPC 参考
- UI references
- UI 参考
- battle references
- 战斗参考

Missing items become the current reference backlog and should not block gameplay chapter lock.
缺失项会进入当前 reference backlog，但不应阻塞 gameplay 章节锁定。

## Reference Validator
## 参考资料校验器

Command:

命令：

- `npm run reference-validate`

The validator checks:

校验器会检查：

- missing `subject_id`
- 缺少 `subject_id`
- duplicate reference keys
- 重复的 reference key
- unparseable metadata
- 无法解析的 metadata

It also writes a structured report to:

并会把结构化报告写到：

- `reports/reference/latest/report.json`
- `reports/reference/latest/summary.md`

## Reference Query
## 参考资料查询

Command examples:

命令示例：

- `npm run reference-query -- --subject-type npc --subject-id town-guard`
- `npm run reference-query -- --subject-type map --subject-id town`
- `npm run reference-query -- --subject-type ui --subject-id dialogue-box --chapter chapter-01-lou-sang`
- `npm run reference-query -- --scene-type dialogue --subject-type ui --subject-id dialogue-box --chapter chapter-01-lou-sang`

The query tool is intended for Codex and human editors to answer:

查询工具用于让 Codex 和人工快速回答：

- which references exist for one NPC
- 某个 NPC 目前有哪些参考资料
- which references exist for one map
- 某张地图目前有哪些参考资料
- which references exist for one UI element
- 某个 UI 元素目前有哪些参考资料

## Future Asset Reconstruction Hook
## 未来资产重建接口

`tools/lib/referencePipeline.ts` exposes a stable index builder for future asset reconstruction work.
`tools/lib/referencePipeline.ts` 提供了稳定的索引构建接口，供未来资产重建流程复用。

The intended flow is:

目标链路是：

1. collect references into `content/reference/`
1. 把参考资料收集到 `content/reference/`
2. index them through the manifest
2. 通过 manifest 建立索引
3. query by chapter, map, and subject
3. 按章节、地图和对象查询
4. feed curated subsets into later asset reconstruction tools
4. 把整理后的子集交给后续资产重建工具

## Current Status
## 当前状态

The first wired chapter is `chapter-01-lou-sang`.
当前已挂接的第一个真实章节是 `chapter-01-lou-sang`。

That means the reference pipeline is now available for map layout, NPC facing, dialogue UI,
and shop counter references in the first real slice.
这意味着第一真实区域已经可以对地图布局、NPC 朝向、对话框 UI 和商店柜台参考资料进行索引和查询。

It now also owns the first structured frame pack:
它现在还拥有第一个结构化关键帧包：

- `content/reference/frame-packs/chapter-01-lou-sang-ui-pack.json`

The first four imported chapters now all have chapter-level frame packs:
前四个已导入章节现在都已经具备章节级关键帧包：

- `chapter-01-lou-sang-ui-pack`
- `chapter-02-east-road-relay-pack`
- `chapter-03-river-ford-pack`
- `chapter-04-ridgeway-camp-pack`
