# Global Text Continuity
# 全局文本连续性

This audit keeps cross-chapter dialogue import maintainable once the first ten real slices are in place.
这份审计用于在前十个真实区域导入后，持续维护跨章节对白的一致性。

## Scope
## 范围

- repeated text analysis
- 重复文本分析
- missing text linkage audit
- 缺失文本链接审计
- naming consistency audit
- 命名一致性审计
- chapter-to-chapter continuity notes
- 章节间连续性说明

## Command
## 命令

- `npm run global-text-continuity-audit`

## Output
## 输出

- `reports/global-text-continuity/latest/report.json`
- `reports/global-text-continuity/latest/summary.md`

## Current Rule
## 当前规则

- Text stays in content data and remains driven by event DSL or text tables.
- 文本必须继续留在内容数据里，并由事件 DSL 或文本表驱动。
- The audit is for continuity review only; it must not create a new hardcoded dialogue path.
- 该审计只服务连续性复核，不能引入新的写死对白路径。
