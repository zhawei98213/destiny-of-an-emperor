# Reference Frame Extraction Workflow
# 参考关键帧提取工作流

## Goal
## 目标

Turn reference videos or screenshot sequences into traceable keyframe packs that can be indexed by chapter, map, scene type, and subject.
把参考视频或连续截图整理成可追溯的关键帧包，并按章节、地图、场景类型和对象建立索引。

## Input
## 输入

- `content/reference/frame-packs/*.json`

## Output
## 输出

- `reports/reference-frame-extract/latest/report.json`
- `reports/reference-frame-extract/latest/summary.md`

The extracted entries are merged into the normal reference query path through `tools/lib/referencePipeline.ts`.
提取出的条目会通过 `tools/lib/referencePipeline.ts` 并入正常的 reference 查询链路。

## Command
## 命令

- `npm run reference-frame-extract`

## Boundaries
## 边界

- This workflow does not create runtime assets.
- 这套流程不会创建运行时资源。
- This workflow allows manual curated frame picking.
- 这套流程允许人工 curated 选择关键帧。
- Keyframes must live under `content/reference/`.
- 关键帧必须位于 `content/reference/` 下。
