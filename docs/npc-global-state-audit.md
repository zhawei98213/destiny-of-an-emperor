# NPC Global State Audit
# NPC 全局状态审计

This audit tracks NPC visibility, trigger binding, flag-driven behavior, and stale-state risk across the first ten real slices.
这份审计用于跟踪前十个真实区域中的 NPC 显示、触发绑定、flag 驱动行为以及旧状态残留风险。

## Scope
## 范围

- npc visibility/state report
- NPC 显示与状态报告
- flag-driven npc behavior summary
- flag 驱动的 NPC 行为摘要
- stale npc state detection
- 陈旧 NPC 状态检测
- chapter dependency notes
- 章节依赖说明

## Command
## 命令

- `npm run npc-global-state-audit`

## Output
## 输出

- `reports/npc-global-state/latest/report.json`
- `reports/npc-global-state/latest/summary.md`

## Current Rule
## 当前规则

- NPC state remains data-driven through world content and event DSL.
- NPC 状态必须继续通过 world content 与事件 DSL 驱动。
- The audit can report stale data, but it must not add hardcoded scene branches.
- 该审计可以报告陈旧数据，但不能引入 scene 特判。
