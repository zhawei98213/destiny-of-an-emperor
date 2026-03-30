# Discrepancy Triage Reports
# 差异分级报告

`reports/triage/latest/` is the generated output directory for discrepancy triage.
`reports/triage/latest/` 是差异分级工具的生成输出目录。

The triage tool reads parity, regression, and UI parity evidence when available.
分级工具会在可用时读取 parity、regression 和 UI parity 证据。

The triage tool writes:
分级工具会写出：

- `summary.md`: human-readable repair backlog with grouped priorities, sources, and dependencies
- `summary.md`：适合人工审查的修复待办，包含优先级、来源和依赖关系
- `report.json`: machine-readable repair backlog for future Codex repair loops
- `report.json`：供后续 Codex 修复流程读取的结构化修复待办

These files are generated and ignored by git. Re-run `npm run discrepancy-triage` to refresh them.
这些文件属于生成产物，并已加入 git ignore。需要更新时重新执行 `npm run discrepancy-triage`。
