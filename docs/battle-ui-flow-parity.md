# Battle UI Flow Parity
# 战斗 UI 流程一致性

This audit tracks battle command flow behavior before battle UI art is finalized.
这份审计在战斗 UI 美术锁定前，先跟踪战斗指令流程行为的一致性。

Current scope:
当前范围：

- command selection
- confirm / cancel
- target selection
- result message timing
- battle end transition

Rules:
规则：

- Focus on behavior parity first, not final art polish.
- 优先检查行为一致性，而不是最终美术打磨。
- Every diverged case must carry a repair priority and repair target.
- 每个偏差条目都必须带修复优先级和修复位置。
- Battle UI parity findings feed discrepancy triage.
- 战斗 UI 一致性偏差需要接入 discrepancy triage。

Outputs:
输出：

- `reports/battle-ui-flow/latest/report.json`
- `reports/battle-ui-flow/latest/summary.md`

Command:
命令：

- `npm run battle-ui-flow-parity`
