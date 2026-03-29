# Regression Reports
# 回归报告

`reports/regression/latest/` is the generated output directory for the golden regression runner.
`reports/regression/latest/` 是黄金回归执行器的生成输出目录。

The runner writes:
执行器会写出：

- `summary.md`: human-readable overview with expected, actual, and diff sections per case
- `summary.md`：适合人工审查的总览，每个 case 都包含预期、实际和差异
- `report.json`: machine-readable structured report for future tooling or Codex review
- `report.json`：适合后续工具或 Codex 读取的结构化报告
- `cases/*.expected.snapshot.json`: expected text snapshots
- `cases/*.expected.snapshot.json`：预期文本快照
- `cases/*.actual.snapshot.json`: actual text snapshots
- `cases/*.actual.snapshot.json`：实际文本快照
- `cases/*.diff.snapshot.json`: structured diff snapshots
- `cases/*.diff.snapshot.json`：结构化差异快照

These files are generated and ignored by git. Re-run `npm run regression-smoke` to refresh them.
这些文件属于生成产物，并已加入 git ignore。需要更新时重新执行 `npm run regression-smoke`。
