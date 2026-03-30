# Asset Parity Reports
# 资产一致性报告

`reports/asset-parity/latest/` is the generated output directory for asset parity checks.
`reports/asset-parity/latest/` 是资产一致性检查的生成输出目录。

The tool writes:
工具会写出：

- `summary.md`: human-readable per-chapter asset status summary
- `summary.md`：适合人工审查的章节级资产状态摘要
- `report.json`: machine-readable structured asset parity report
- `report.json`：供工具读取的结构化资产一致性报告

These files are generated and ignored by git. Re-run `npm run asset-check` to refresh them.
这些文件属于生成产物，并已加入 git ignore。需要更新时重新执行 `npm run asset-check`。
