# Battle Parity Reports
# 战斗一致性校准报告

`reports/battle-parity/latest/` is the generated output directory for battle parity calibration.
`reports/battle-parity/latest/` 是战斗一致性校准工具的生成输出目录。

The tool writes:
工具会写出：

- `summary.md`: human-readable calibration summary with one section per real battle case
- `summary.md`：适合人工审查的校准摘要，每个真实战斗案例各有一节
- `report.json`: machine-readable structured battle parity evidence for future repair or import work
- `report.json`：供后续修复或导入流程读取的结构化战斗一致性证据

These files are generated and ignored by git. Re-run `npm run battle-parity` to refresh them.
这些文件属于生成产物，并已加入 git ignore。需要更新时重新执行 `npm run battle-parity`。
