# Reproduction Rules
# 复刻约束

## Core Rules
## 核心规则

- Story logic must not be hardcoded in scenes.
- 剧情逻辑不得写死在 scene 中。
- Generated data must not be edited by hand.
- generated 数据不得人工直接编辑。
- New content formats must ship with schema validation.
- 新增内容格式必须补 schema。
- New opcodes must ship with tests.
- 新增 opcode 必须补测试。
- Save-structure changes must document a compatibility strategy.
- 修改存档结构必须说明兼容策略。

## Scene Boundaries
## Scene 边界

Scenes may:
scene 可以负责：

- read input
- 读取输入
- coordinate transitions between runtime modules
- 协调运行时模块之间的切换
- render view-layer state
- 渲染视图层状态

Scenes must not:
scene 不应负责：

- encode branch story flow directly
- 直接编码剧情分支流程
- become the authoritative owner of save, party, or inventory state
- 成为存档、队伍或背包状态的唯一权威来源
- bypass content loaders, schema, or interpreter layers
- 绕过内容加载器、schema 或解释器层

## Data Discipline
## 数据纪律

- `content/source/` is the place for raw import inputs.
- `content/source/` 用于原始导入输入。
- `content/generated/` is recreated by tools and must stay deterministic.
- `content/generated/` 由工具重建，必须保持稳定可重复。
- `content/manual/` is the only place intended for direct editorial fixes.
- `content/manual/` 才是允许直接做编辑修正的目录。

## Compatibility Rule
## 兼容性规则

Whenever save data changes, the implementation must explicitly choose and document one of these strategies:
每次修改存档结构时，必须明确选择并记录以下兼容策略之一：

- backward-compatible additive change
- 向后兼容的增量字段
- validated migration from older save versions
- 从旧版本存档迁移并校验
- explicit save invalidation with documented reason
- 明确宣布旧存档失效并说明原因
