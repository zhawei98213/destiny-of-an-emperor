# Performance Baseline
# 性能基线

## Goal
## 目标

Keep runtime performance observable as chapters, content, and assets grow.
随着章节、内容和资产增加，保持运行时性能可观测。

The current baseline is intentionally light. It samples the existing runtime seams and writes comparable reports before any larger optimization work begins.
当前基线刻意保持轻量。它先对现有运行时接缝做采样并输出可比较报告，再决定是否需要更大的优化动作。

## Current Metrics
## 当前指标

`npm run performance-baseline` writes `reports/performance/latest/` and tracks these metrics:
`npm run performance-baseline` 会写出 `reports/performance/latest/`，并跟踪以下指标：

- `startup`
  Boot-path baseline: content database load, representative save load, game state init, and world runtime init.
- `startup`
  启动链路基线：内容数据库加载、代表性存档读取、游戏状态初始化和世界运行时初始化。
- `map-transition`
  Logic-only map switch baseline: target spawn resolution, world state sync, and current map lookup.
- `map-transition`
  纯逻辑地图切换基线：目标出生点解析、世界状态同步和当前地图读取。
- `battle-entry`
  First battle entry baseline: real encounter resolution plus battle state creation.
- `battle-entry`
  首次进入战斗基线：真实遭遇解析加战斗状态创建。
- `save-load`
  Save and load baseline: current-schema save, current-schema load, and migrated legacy load.
- `save-load`
  存档与读档基线：当前 schema 存档、当前 schema 读档和旧版迁移读档。

## Report Output
## 报告输出

- `reports/performance/latest/summary.md`
  Human-readable summary with avg/min/max timings and bottleneck notes.
- `reports/performance/latest/summary.md`
  适合人工审查的摘要，包含 avg/min/max 耗时和瓶颈说明。
- `reports/performance/latest/report.json`
  Machine-readable structured metrics, bottlenecks, and findings for future tooling or Codex repair loops.
- `reports/performance/latest/report.json`
  适合后续工具或 Codex 修复流程读取的结构化指标、瓶颈和结论。

## Lightweight Profiling Plan
## 轻量 profiling 方案

The current profiling layer lives in [performanceLog.ts](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/game/src/core/performanceLog.ts).
当前 profiling 层位于 [performanceLog.ts](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/game/src/core/performanceLog.ts)。

Rules:
规则：

- Measure stable runtime seams, not every frame.
- 只测稳定的运行时接缝，不对每一帧做采样。
- Keep measurement logic out of scene-specific gameplay branches.
- 不把测量逻辑塞进特定 scene 的玩法分支里。
- Prefer CLI sampling first, because it is deterministic and easier to diff in reports.
- 优先采用 CLI 采样，因为它更稳定，也更容易在报告里做差异比较。
- Escalate to browser-frame or GPU profiling only after a baseline identifies a real hotspot worth deeper inspection.
- 只有当基线已经指出真实热点时，才升级到浏览器帧级或 GPU profiling。

## Interpreting Bottlenecks
## 如何解读瓶颈

The baseline classifies hotspots into three buckets:
基线会把热点分成三类：

- `runtime`
  State rebuilds, validation cost, repeated object creation, battle setup, save migration.
- `runtime`
  状态重建、校验成本、重复对象创建、战斗初始化、存档迁移。
- `resource`
  Current content lookup and runtime map access cost. This does not yet include Phaser texture upload or browser paint.
- `resource`
  当前内容查找和运行时地图访问成本。这里暂时不包含 Phaser 纹理上传或浏览器绘制。
- `import`
  Manifest count, pack count, JSON read/parse/merge cost during boot.
- `import`
  启动时 manifest 数量、pack 数量，以及 JSON 读取/解析/合并成本。

## Current Limits
## 当前限制

- This is not an end-to-end browser FPS profiler.
- 这不是端到端的浏览器 FPS profiler。
- It measures real runtime seams with current content, but not GPU upload, texture atlas churn, or long-session memory growth yet.
- 它会测当前真实内容下的真实运行时接缝，但还不会测 GPU 上传、纹理图集抖动或长时间运行的内存增长。
- Import cost is visible through startup sampling, but importer execution time itself still belongs to content-pipeline tooling, not in-game runtime.
- 启动采样能反映导入产物体量带来的成本，但导入器本身的执行时间仍属于内容管线工具，而不是游戏运行时。

## Recommended Use
## 推荐用法

Run this after changes that affect startup, scene transitions, battle entry, save format, or content volume.
当改动影响启动、场景切换、战斗进入、存档结构或内容体量时，执行这个工具。

Recommended sequence:
推荐顺序：

1. `npm run import-all`
1. `npm run import-all`
2. `npm run validate-content`
2. `npm run validate-content`
3. `npm test`
3. `npm test`
4. `npm run performance-baseline`
4. `npm run performance-baseline`

## Next Escalation Conditions
## 下一步升级条件

Escalate beyond this baseline when one of these becomes true:
当出现以下任一情况时，再升级到更重的性能分析手段：

- startup average keeps trending up across chapter imports
- 启动平均耗时会随着章节导入持续上升
- map transition latency becomes visible in playtest
- 地图切换延迟在试玩中已经可感知
- battle entry cost rises sharply after enemy, asset, or UI growth
- 敌群、资产或 UI 增长后，进入战斗成本明显抬升
- migrated save load becomes a measurable compatibility burden
- 旧存档迁移读档开始成为明显兼容负担
