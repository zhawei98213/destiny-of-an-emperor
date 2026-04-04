# Overworld Navigation Parity
# 大地图导航一致性

This audit keeps the growing world route readable once multiple real chapters are stitched together.
这份审计用于在多个真实章节拼接后，持续保持世界导航关系清晰可追踪。

## Scope
## 范围

- world navigation map
- 世界导航图
- travel dependency notes
- 行进依赖说明
- inaccessible intended path checks
- 预期路径不可达检查
- accidental shortcut checks
- 非预期捷径检查

## Command
## 命令

- `npm run overworld-navigation-parity`

## Output
## 输出

- `reports/overworld-navigation/latest/report.json`
- `reports/overworld-navigation/latest/summary.md`

## Current Rule
## 当前规则

- This audit reuses world connectivity and progression evidence.
- 该审计复用世界连接性与主线推进审计的既有证据。
- It must not invent new travel rules inside scene code.
- 它不能把新的行进规则写进 scene 代码。
