# Battle Data Import And Calibration Workflow
# 战斗数据导入与校准工作流

## Purpose
## 目的

This workflow keeps battle content import and battle parity calibration on the same path.
It is for imported real battle slices, not for speculative combat redesign.

这套工作流把战斗内容导入与战斗一致性校准收在同一条链路里。
它服务于已导入的真实战斗切片，而不是提前做推测性的战斗大改。

## Scope
## 范围

The workflow currently covers:
当前覆盖范围：

- enemy import review
- 敌人导入审查
- battle group import review
- 敌群导入审查
- battle scenario import review
- 战斗场景导入审查
- reward, experience, and drop validation
- 奖励、经验与掉落校验
- battle parity checklist
- battle 一致性检查清单
- battle regression case templating
- 战斗回归 case 模板

## Source Inputs
## 原始输入

- `content/source/data/demo-game-data.source.json`
- `content/source/data/demo-game-data.source.json`
- `content/source/data/battle-scenarios.source.json`
- `content/source/data/battle-scenarios.source.json`
- `tests/regression/golden-cases.json`
- `tests/regression/golden-cases.json`
- `tests/regression/battle-parity-cases.json`
- `tests/regression/battle-parity-cases.json`

## Commands
## 命令

- `npm run battle-enemy-group-import`
- `npm run battle-enemy-group-import`
- `npm run battle-scenario-import`
- `npm run battle-scenario-import`
- `npm run battle-reward-drop-check`
- `npm run battle-reward-drop-check`
- `npm run battle-parity-checklist`
- `npm run battle-parity-checklist`
- `npm run battle-parity`
- `npm run battle-parity`

## Workflow
## 工作流

1. Add or update enemy and battle group source data.
1. 新增或更新敌人、敌群 source 数据。
2. Add or update battle scenario source entries.
2. 新增或更新 battle scenario source 条目。
3. Regenerate generated battle content if source data changed.
3. 如果 source 数据变了，重新生成 generated battle content。
4. Bind one golden regression case for the battle roundtrip.
4. 为该战斗往返流程绑定一个 golden regression case。
5. Bind one battle parity case for deterministic calibration.
5. 为该战斗绑定一个 battle parity case 做 deterministic 校准。
6. Run the helper commands and inspect `reports/battle-calibration/latest/`.
6. 运行 helper 命令，并检查 `reports/battle-calibration/latest/`。
7. Run `npm run battle-parity`.
7. 运行 `npm run battle-parity`。

## Expected Outputs
## 预期输出

The helper workflow writes:
这套 helper 会输出：

- `reports/battle-calibration/latest/enemy-group-import.json`
- `reports/battle-calibration/latest/enemy-group-import.md`
- `reports/battle-calibration/latest/battle-scenario-import.json`
- `reports/battle-calibration/latest/battle-scenario-import.md`
- `reports/battle-calibration/latest/reward-drop-validation.json`
- `reports/battle-calibration/latest/reward-drop-validation.md`
- `reports/battle-calibration/latest/battle-parity-checklist.json`
- `reports/battle-calibration/latest/battle-parity-checklist.md`

## Checklist Meaning
## Checklist 含义

A battle scenario is considered calibrated when:
当一个战斗场景满足以下条件时，视为已校准：

- the chapter owns the battle group
- 章节元数据拥有该敌群
- a golden regression case is linked
- 已绑定 golden regression case
- a battle parity case is linked
- 已绑定 battle parity case
- the scenario source resolves against current world content
- 场景 source 已能对上当前 world 内容

## Current Real Example
## 当前真实样例

Current calibrated real example:
当前已校准的真实样例：

- scenario: `waystation-gate-outlaw-scout`
- scenario：`waystation-gate-outlaw-scout`
- chapter: `chapter-05-highland-waystation`
- chapter：`chapter-05-highland-waystation`
- battle group: `highland-outlaws`
- battle group：`highland-outlaws`
- golden regression case: `waystation-gate-battle-roundtrip`
- golden regression case：`waystation-gate-battle-roundtrip`
- battle parity case: `waystation-gate-outlaw-baseline`
- battle parity case：`waystation-gate-outlaw-baseline`

## Template
## 模板

Use:
使用：

- `tests/regression/battle-regression-case.template.json`

to create:
来创建：

- a new golden regression case
- 新的 golden regression case
- a matching battle parity case
- 对应的 battle parity case

## Rules
## 规则

- Do not hardcode enemy data into `BattleScene`.
- 不得把敌人数据写死进 `BattleScene`。
- Do not skip the source layer for new real battle slices.
- 新的真实战斗切片不得绕过 source 层。
- Do not calibrate a battle only in prose; always bind a machine-readable case.
- 不要只在文字里“描述已校准”；必须绑定机器可读的 case。
