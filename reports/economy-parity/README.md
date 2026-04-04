# Economy Parity Reports
# 经济一致性报告

`npm run economy-parity-audit` writes the latest economy audit artifacts here.
`npm run economy-parity-audit` 会把最新的经济一致性审计产物写到这里。

- `latest/report.json`: machine-readable economy audit output.
- `latest/report.json`：机器可读的经济审计输出。
- `latest/summary.md`: human-readable summary for review.
- `latest/summary.md`：供人工审查的摘要报告。

The report is review-oriented. It does not block chapter importing unless blocker-class issues appear, such as missing shop definitions, missing item definitions, or broken drop references.
这份报告面向审查。除非出现 blocker 级问题，例如缺失商店定义、缺失物品定义或失效掉落引用，否则它不会阻塞章节导入。
