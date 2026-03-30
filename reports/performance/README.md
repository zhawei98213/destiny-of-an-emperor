# Performance Baseline Reports
# 性能基线报告

`reports/performance/latest/` is the generated output directory for runtime baseline sampling.
`reports/performance/latest/` 是运行时基线采样工具的生成输出目录。

The baseline writes:
基线工具会写出：

- `summary.md`: human-readable timing summary with comparable metrics and hotspot notes
- `summary.md`：适合人工审查的耗时摘要，包含可比较指标和热点说明
- `report.json`: machine-readable structured metrics and bottleneck list
- `report.json`：供后续工具或 Codex 读取的结构化指标与瓶颈列表

These files are generated and ignored by git. Re-run `npm run performance-baseline` to refresh them.
这些文件属于生成产物，并已加入 git ignore。需要更新时重新执行 `npm run performance-baseline`。
