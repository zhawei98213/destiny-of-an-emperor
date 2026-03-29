---
name: parity-audit
description: Audit a remake slice against current content, runtime, and regression evidence, then update parity tracking with concrete verified, diverged, and next-step findings. / 依据当前内容、运行时和回归证据审计一个复刻切片，并把已验证项、偏差项和下一步动作具体写回 parity 跟踪文档。
---

## 使用边界
## Scope

- Use this skill when the task is to determine whether a slice is actually parity-locked, in progress, or diverged.
- 当任务是判断某个切片到底已锁定、进行中还是存在偏差时，使用这个 skill。
- Use it after map import, event import, runtime changes, or regression changes that affect observable parity.
- 它适用于地图导入、事件导入、runtime 变更或回归变更之后的可观察一致性审计。
- Do not use it as a substitute for implementing a known blocker.
- 不要把它当成已知阻塞缺口的实现替代品。

## 标准步骤
## Standard Steps

1. Read the latest parity rows in `docs/parity-matrix.md`.
1. 先读 `docs/parity-matrix.md` 里的最新 parity 行。
2. Read the latest regression artifacts under `reports/regression/latest/`.
2. 读取 `reports/regression/latest/` 下的最新回归产物。
3. Inspect the relevant source/manual/generated content and runtime files tied to the slice.
3. 检查与该切片相关的 source/manual/generated 内容和 runtime 文件。
4. Separate content gaps from runtime gaps.
4. 把内容缺口和 runtime 缺口分开。
5. Mark only evidence-backed rows as `已验证 / Verified`.
5. 只有有证据支撑的项目才能标记为 `已验证 / Verified`。
6. Write concrete divergence notes with ids, fields, and affected files.
6. 用具体 id、字段和受影响文件来写偏差说明。
7. Set the next action to the smallest step that unblocks further real-content importing.
7. 把下一步动作收敛到能解除后续真实内容导入阻塞的最小步骤。

## 禁止事项
## Do Not

- Do not write vague status like “mostly done”.
- 不要写“基本完成”这种模糊状态。
- Do not mark a row verified without a listed validation method being executed.
- 没执行过列出的验证方法时，不要把条目标为 verified。
- Do not mix speculative source facts into the matrix as if they were confirmed.
- 不要把未经确认的上游事实当成已确认信息写进矩阵。

## 完成定义
## Definition Of Done

- `docs/parity-matrix.md` reflects the current repository state instead of stale assumptions.
- `docs/parity-matrix.md` 反映的是当前仓库状态，而不是过期假设。
- Each touched row has concrete divergence notes and a concrete next action.
- 每个变更过的条目都有具体偏差说明和具体下一步动作。
- The audit clearly identifies whether the blocker is content-side or runtime-side.
- 审计结果能清楚区分阻塞项是内容侧还是 runtime 侧。
