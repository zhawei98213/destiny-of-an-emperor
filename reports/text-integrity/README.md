# Text Integrity Reports
# 文本完整性报告

Generated artifacts are written to `reports/text-integrity/latest/`.
生成产物会写入 `reports/text-integrity/latest/`。

Current outputs:
当前输出包括：

- `report.json`: structured integrity report for Codex and other tooling
- `report.json`：供 Codex 和其他工具消费的结构化完整性报告
- `summary.md`: human-readable summary of coverage, ratio, and issues
- `summary.md`：适合人工阅读的覆盖率、占比和问题摘要

Regenerate the latest report with:
重新生成最新报告请执行：

```bash
npm run text-check
```
