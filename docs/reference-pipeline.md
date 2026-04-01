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
- `metadata.crop.{x,y,width,height}`
- `metadata.variant`
- `metadata.tags[]`

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
