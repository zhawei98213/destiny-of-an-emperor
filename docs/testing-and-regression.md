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

## Current Smoke Scope
## 当前 Smoke 范围

`regression-smoke` currently covers:
当前 `regression-smoke` 覆盖：

- importer determinism
- 导入器稳定性
- content loader and cross-reference checks
- 内容加载器与跨引用校验
- event interpreter baseline behavior
- 事件解释器基础行为
- world runtime movement and portal flow
- world runtime 的移动与 portal 流程
- battle runtime victory and defeat loop
- battle runtime 的胜败闭环
- save and menu state baseline behavior
- 存档和菜单状态的基础行为
- scene registry wiring
- 场景注册接线

## Expectations For New Work
## 新改动要求

- New key features should add at least one automated test or a reproducible validation script.
- 新增关键功能至少要补一个自动化测试或可复现验证脚本。
- Opcode changes should extend interpreter tests.
- opcode 改动应扩展解释器测试。
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
