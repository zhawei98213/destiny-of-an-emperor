# Testing And Regression
# 测试与回归

## Required Scripts
## 必备脚本

- `npm run import-all`: regenerate generated content from source inputs
- `npm run import-all`：从 source 输入重新生成 generated 内容
- `npm run validate-content`: verify generated outputs match source and validate runtime content
- `npm run validate-content`：检查 generated 是否与 source 一致，并校验运行时内容
- `npm run test`: run the automated test suite
- `npm run test`：运行自动化测试套件
- `npm run regression-smoke`: run the minimum import, validation, and regression check path
- `npm run regression-smoke`：执行最小导入、校验和回归检查链路
- `npm run parity-score`: score chapter parity from chapter metadata, parity state, and regression evidence
- `npm run parity-score`：基于章节元数据、parity 状态和回归证据计算章节一致性评分

## Current Smoke Scope
## 当前 Smoke 范围

`regression-smoke` now covers one golden regression report with these baseline cases:
当前 `regression-smoke` 现在输出一份黄金回归报告，覆盖以下基线 case：

- guard blocked without pass
- 无通行证时门卫阻拦
- guard warp with pass
- 有通行证时门卫放行并传送
- chest first open reward and one-shot flag
- 宝箱首次开启奖励与一次性 flag
- chest second check does not duplicate rewards
- 宝箱再次检查不会重复给奖励
- field battle enters `BattleScene`, resolves, and returns to `WorldScene`
- 野外战斗进入 `BattleScene`、完成结算并返回 `WorldScene`
- shop interaction opens the expected shop overlay and item price list
- 商店交互会打开预期的商店 overlay，并显示商品与价格列表
- save/load restores world, flags, inventory, and party state
- 存档读档恢复世界、flag、背包和队伍状态

The script prints one unified report and distinguishes `PASS`, `MISMATCH`, and `FAIL`.
脚本会输出统一格式报告，并清楚区分 `PASS`、`MISMATCH` 和 `FAIL`。

It also writes readable and machine-readable artifacts into `reports/regression/latest/`.
它还会把可读和机器可读的产物写入 `reports/regression/latest/`。

- `summary.md`: per-case overview with expected, actual, and diff sections
- `summary.md`：每个 case 都包含预期、实际和差异的小节
- `report.json`: structured regression report
- `report.json`：结构化回归报告
- `cases/*.expected.snapshot.json`, `cases/*.actual.snapshot.json`, `cases/*.diff.snapshot.json`
- `cases/*.expected.snapshot.json`、`cases/*.actual.snapshot.json`、`cases/*.diff.snapshot.json`

## Parity Score Output
## 一致性评分输出

`npm run parity-score` writes chapter-level score artifacts into `reports/parity/latest/`.
`npm run parity-score` 会把章节级评分产物写入 `reports/parity/latest/`。

- `summary.md`: total score, sub-scores, blockers, and minor mismatches for each chapter
- `summary.md`：每个章节的总分、子分、阻塞项和次要偏差
- `report.json`: structured score report for future repair loops
- `report.json`：供后续修补流程读取的结构化评分报告

## Expectations For New Work
## 新改动要求

- New key features should add at least one automated test or a reproducible validation script.
- 新增关键功能至少要补一个自动化测试或可复现验证脚本。
- Opcode changes should extend interpreter tests.
- opcode 改动应扩展解释器测试。
- Golden regression cases should live under `tests/regression/` with explicit initial state, trigger, expected state, and expected UI fields.
- 黄金回归 case 应放在 `tests/regression/` 下，并显式声明初始状态、触发行为、预期状态和预期 UI 字段。
- Content-facing overlays such as shop UI should be represented in `expectedUi`, not only in state assertions.
- 面向内容核对的 overlay，例如商店 UI，应在 `expectedUi` 中体现，而不只检查状态字段。
- Importer changes should keep output order stable and failure messages specific to file and field.
- 导入器改动应保持输出顺序稳定，并让失败信息精确到文件和字段。

## Recommended Workflow
## 推荐流程

1. `npm run import-all`
1. `npm run import-all`
2. `npm run validate-content`
2. `npm run validate-content`
3. `npm run test`
3. `npm run test`
4. `npm run regression-smoke` before merging large cross-cutting changes
4. 在合并较大跨模块改动前执行 `npm run regression-smoke`
