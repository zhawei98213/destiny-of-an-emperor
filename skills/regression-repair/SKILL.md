---
name: regression-repair
description: Use the golden regression report to repair runtime or content-pipeline mismatches by fixing the highest-priority blocker first, then extending regression coverage and updating parity documentation. / 使用黄金回归报告修复 runtime 或内容管线中的不一致，先解决最高优先级阻塞项，再扩展回归覆盖并更新 parity 文档。
---

## 使用边界
## Scope

- Use this skill when `npm run regression-smoke` or a targeted golden case reports `MISMATCH` or `FAIL`.
- 当 `npm run regression-smoke` 或某个 golden case 报出 `MISMATCH` 或 `FAIL` 时，使用这个 skill。
- Use it for fixing real runtime blockers that are visible in regression artifacts.
- 它适用于修复已经在回归产物里可见的真实 runtime 阻塞问题。
- Do not use it for broad cleanup when no regression signal exists.
- 没有回归信号时，不要把它用于大范围清理。

## 标准步骤
## Standard Steps

1. Read `reports/regression/latest/summary.md` and the failing case snapshots first.
1. 先读 `reports/regression/latest/summary.md` 和失败 case 的快照。
2. Rank issues by what most blocks the next real-content import step.
2. 按“最阻塞下一步真实内容导入”的程度排序问题。
3. Fix one blocker at a time.
3. 一次只修一个阻塞项。
4. Prefer runtime fixes that preserve existing content layering and DSL boundaries.
4. 优先做不破坏现有内容分层和 DSL 边界的 runtime 修复。
5. If UI-facing behavior changes, extend regression `expectedUi`.
5. 如果改动影响 UI 可观察行为，就扩展回归里的 `expectedUi`。
6. Update `docs/parity-matrix.md`, `docs/testing-and-regression.md`, and `AGENTS.md` when the repair changes documented workflow.
6. 如果修复影响文档化流程，就同步更新 `docs/parity-matrix.md`、`docs/testing-and-regression.md` 和 `AGENTS.md`。
7. Re-run the smallest failing scope first, then `npm run regression-smoke`.
7. 先重跑最小失败范围，再跑 `npm run regression-smoke`。

## 禁止事项
## Do Not

- Do not “fix” a mismatch by weakening the regression expectation without proving the new behavior is intended.
- 不要在没有证明新行为是预期结果的前提下，通过降低回归期望来“修复” mismatch。
- Do not hide content-facing gaps by moving logic into scenes.
- 不要通过把逻辑塞进 scene 来掩盖内容侧缺口。
- Do not combine multiple unrelated repairs into one step.
- 不要把多个无关修复混成一步。

## 完成定义
## Definition Of Done

- The targeted regression mismatch or failure is gone.
- 目标回归 mismatch 或 failure 已消失。
- The fix includes either a new regression case or an expanded existing case.
- 修复同时包含新增回归 case 或对现有 case 的扩展。
- Affected workflow docs are updated if the repair changed expected process.
- 如果修复改变了预期流程，相关工作流文档已同步更新。
- `npm run regression-smoke` passes after the repair.
- 修复后 `npm run regression-smoke` 通过。
