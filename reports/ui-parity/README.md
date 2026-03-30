# UI Parity Reports
# UI 一致性报告

`reports/ui-parity/latest/` is the generated output directory for UI parity auditing.
`reports/ui-parity/latest/` 是 UI 一致性审计工具的生成输出目录。

The UI parity tool writes:
UI 一致性工具会写出：

- `summary.md`: human-readable case summary with expected, actual, and difference sections
- `summary.md`：适合人工审查的 case 摘要，包含预期、实际和差异小节
- `report.json`: machine-readable structured UI parity report for future repair loops
- `report.json`：供后续修复流程读取的结构化 UI 一致性报告

These files are generated and ignored by git. Re-run `npm run ui-parity` to refresh them.
这些文件属于生成产物，并已加入 git ignore。需要更新时重新执行 `npm run ui-parity`。
