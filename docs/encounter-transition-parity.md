# Encounter And Transition Parity
# 遭遇与切场衔接一致性

This audit checks the feel and integrity of world, battle, and map transitions.
这份审计用于检查 world、battle 和地图切换之间的手感与完整性。

Audit areas:
审计范围：

1. encounter trigger audit
2. transition timing summary
3. scene handoff state validation
4. return-to-world integrity check

Current rules:
当前规则：

- `world -> battle` should stay on the shared `BattleRequest` handoff path.
- `world -> battle` 必须继续走共享的 `BattleRequest` 交接路径。
- `battle -> world` must reapply settlement state before returning.
- `battle -> world` 返回前必须先回写结算状态。
- `map -> map` audit must verify that warp and return paths stay coherent.
- `map -> map` 审计必须验证切图与回退路径保持一致。
- Story-triggered battle remains a tracked gap until a real chapter requires it.
- 在真实章节明确需要前，剧情触发战斗仍作为已知缺口跟踪。

Outputs:
输出：

- `reports/encounter-transition-parity/latest/report.json`
- `reports/encounter-transition-parity/latest/summary.md`

Command:
命令：

- `npm run encounter-transition-parity`
