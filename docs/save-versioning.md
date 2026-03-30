# Save Versioning Strategy
# 存档版本策略

## Goal
## 目标

Keep save schema evolution explicit, reviewable, and backward compatible enough for ongoing real-content import work.
让存档 schema 的演进保持显式、可审查，并为持续的真实内容导入提供足够的向后兼容能力。

## Current Rule
## 当前规则

- The runtime writes only the latest `SaveData.version`.
- 运行时只写最新的 `SaveData.version`。
- Old save versions are upgraded by a dedicated migration runner before normal schema validation and reference validation.
- 旧存档版本会先经过专门的迁移器，再进入常规 schema 校验和引用校验。
- Scene code and UI must not contain save-version branching logic.
- scene 和 UI 代码里不得出现存档版本分支逻辑。

## Current Versions
## 当前版本

### Version 1
### 版本 1

Legacy baseline save shape:
旧版基础存档结构：

- had `world`, `partyMemberIds`, `flags`, `questStates`, and `inventory`
- 包含 `world`、`partyMemberIds`、`flags`、`questStates` 和 `inventory`
- did not reliably include `stepCount`
- 不稳定包含 `stepCount`
- did not require `partyStates`
- 不要求 `partyStates`
- did not require `shopStates`
- 不要求 `shopStates`
- did not require `consumedTriggerIds`
- 不要求 `consumedTriggerIds`
- had no explicit save migration metadata
- 没有显式迁移元数据

### Version 2
### 版本 2

Expanded runtime state save shape:
扩展后的运行时状态存档结构：

- added `stepCount`
- 新增 `stepCount`
- added `partyStates`
- 新增 `partyStates`
- added `shopStates`
- 新增 `shopStates`
- added `consumedTriggerIds`
- 新增 `consumedTriggerIds`
- still had no explicit `saveMeta`
- 仍没有显式 `saveMeta`

### Version 3
### 版本 3

Current canonical save shape:
当前标准存档结构：

- keeps version 2 gameplay state fields
- 保留版本 2 的玩法状态字段
- adds `saveMeta`
- 新增 `saveMeta`
- records:
  - `createdByVersion`
  - `migratedFromVersion`
  - `migrationCount`
- 记录：
  - `createdByVersion`
  - `migratedFromVersion`
  - `migrationCount`

## Migration Path
## 迁移路径

Current supported path:
当前支持路径：

- `v1 -> v2 -> v3`
- `v2 -> v3`

The runtime writes only `v3`.
运行时只写 `v3`。

## Compatibility Rules
## 兼容规则

When the save schema grows:
当存档 schema 扩展时：

1. Add the new field to the current `SaveData` type.
1. 先把新字段加入当前 `SaveData` 类型。
2. Add migration logic in `game/src/systems/saveMigration.ts`.
2. 在 `game/src/systems/saveMigration.ts` 中补迁移逻辑。
3. Define a default for older saves.
3. 为旧存档定义默认值。
4. Add or update regression tests.
4. 补充或更新回归测试。
5. Update `docs/save-compatibility.md`.
5. 更新 `docs/save-compatibility.md`。

## Defaulting Strategy
## 默认值策略

- new chapter fields: default to the current known chapter or `undefined`, never to an invalid chapter id
- 新章节字段：默认回退到当前已知章节或 `undefined`，绝不能写成无效章节 id
- new flag fields: default from the content flag definition table, usually `false`
- 新 flag 字段：从内容 flag 定义表取默认值，通常为 `false`
- new inventory fields: default to empty collections and zero counts
- 新背包字段：默认空集合和零计数
- new party fields: default to empty runtime-owned maps and let runtime bootstrap missing member states
- 新队伍字段：默认空映射，并由 runtime 补齐缺失成员状态
- new shop or one-shot state fields: default to empty maps/arrays
- 新商店或一次性状态字段：默认空 map 或空数组

## Ownership
## 归属

- `game/src/systems/saveMigration.ts`: migration runner and version stepping
- `game/src/systems/saveMigration.ts`：迁移执行器和版本升级逻辑
- `game/src/systems/saveManager.ts`: read/write entry point
- `game/src/systems/saveManager.ts`：读写入口
- `game/src/content/schema/validators.ts`: latest-version save schema validation
- `game/src/content/schema/validators.ts`：最新版本存档 schema 校验
- `game/src/content/schema/consistency.ts`: content reference validation after migration
- `game/src/content/schema/consistency.ts`：迁移后内容引用校验
