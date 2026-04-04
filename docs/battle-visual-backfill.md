# Battle Visual Backfill Workflow
# 战斗视觉回填工作流

## Purpose
## 目的

This workflow lets battle scenes replace placeholder enemy visuals, battle backdrops, and battle UI through the shared asset registry without changing gameplay content or scene-specific logic.
这套工作流让战斗场景可以通过共享 asset registry 替换占位敌图、战斗背景和战斗 UI，而不需要修改 gameplay 内容或为单个场景写特判。

## Inputs
## 输入

- `content/reference/manifest.json`
- `content/reference/manifest.json`
- `content/reference/battle/battle-asset-manifest.json`
- `content/reference/battle/battle-asset-manifest.json`
- `content/reference/enemies/battle-enemy-sprite-intake.json`
- `content/reference/enemies/battle-enemy-sprite-intake.json`
- `content/manual/asset-registry.content.json`
- `content/manual/asset-registry.content.json`

## Scope
## 范围

The current workflow covers:
当前覆盖范围：

- battle backdrops
- 战斗背景
- enemy battle visuals
- 敌方战斗视觉
- battle UI panel mapping
- 战斗 UI 面板映射
- battle-scene visual parity scoring
- 战斗场景视觉一致性评分

## Rules
## 规则

- Do not use files under `content/reference/` directly as runtime assets.
- 不得把 `content/reference/` 下的文件直接当成 runtime 资源使用。
- Battle visuals must go through `content/manual/asset-registry.content.json`.
- 战斗视觉必须通过 `content/manual/asset-registry.content.json` 接入。
- Gameplay triggers, battle groups, and rewards must not be changed just to fit visuals.
- 不得为了迁就视觉资源而修改 gameplay trigger、battle group 或奖励。

## Commands
## 命令

- `npm run battle-visual-backfill`
- `npm run battle-visual-backfill`
- `npm run battle-visual-parity-score`
- `npm run battle-visual-parity-score`

## Current Pilot
## 当前试点

Current pilot battle slice:
当前试点战斗切片：

- chapter: `chapter-05-highland-waystation`
- map: `waystation-gate`
- battle group: `highland-outlaws`

Current imported visual assets:
当前已导入的视觉资产：

- `ui.battle-backdrop`
- `enemy.highland-outlaw`
- `ui.battle-panel`

## Output
## 输出

- `reports/battle-visual-backfill/latest/`
- `reports/battle-visual-backfill/latest/`
- `reports/battle-visual-parity/latest/`
- `reports/battle-visual-parity/latest/`
