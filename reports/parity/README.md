# Parity Score Reports
# 一致性评分报告

`reports/parity/latest/` is the generated output directory for chapter parity scoring.
`reports/parity/latest/` 是章节一致性评分工具的生成输出目录。

The scorer writes:
评分工具会写出：

- `summary.md`: human-readable chapter summary with total score, dimension scores, blockers, and minor mismatches
- `summary.md`：适合人工审查的章节摘要，包含总分、维度得分、阻塞项和次要偏差
- `report.json`: machine-readable structured score report for future tooling or Codex review
- `report.json`：适合后续工具或 Codex 读取的结构化评分报告

These files are generated and ignored by git. Re-run `npm run parity-score` to refresh them.
这些文件属于生成产物，并已加入 git ignore。需要更新时重新执行 `npm run parity-score`。
