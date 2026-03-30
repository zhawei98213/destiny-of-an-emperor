# Pre-Release Reports
# 发布前检查报告

`npm run pre-release-check -- --mode light|full` writes the latest aggregated release-gate artifacts into `reports/pre-release/latest/`.
`npm run pre-release-check -- --mode light|full` 会把最新聚合后的发布前门禁产物写入 `reports/pre-release/latest/`。

- `summary.md`: concise human-readable verdict and command overview
- `summary.md`：简洁的人工可读结论和命令总览
- `report.json`: machine-readable command results, metrics, failures, and notes
- `report.json`：机器可读的命令结果、指标、失败项和备注

`light` mode is for fast local confidence.
`light` 模式用于快速本地确认。

`full` mode is for release-style checks and beta-test readiness review.
`full` 模式用于发布前检查和测试版准备度审查。
