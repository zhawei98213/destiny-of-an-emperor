---
name: real-map-import
description: Import one real remake map slice into the repository's source/generated/manual pipeline, covering map layers, collision, portals, spawn points, and static NPC placement without pushing story logic into scenes. / 把一段真实复刻地图切片导入仓库既有的 source/generated/manual 管线，覆盖地图层、碰撞、出口、出生点和静态 NPC 摆放，同时不把剧情逻辑塞进 scene。
---

## 使用边界
## Scope

- Use this skill when the task is primarily about a real map area entering the content pipeline.
- 当任务的主体是把一段真实地图区域接入内容管线时，使用这个 skill。
- Use it for tile layers, collision, portals, spawn points, and NPC base placement.
- 它适用于 tile layer、collision、portal、spawn point 和 NPC 基础摆放。
- Do not use it as the main skill for dialogue-heavy event authoring or regression-only repair.
- 不要把它作为对白/事件导入或纯回归修复任务的主 skill。

## 标准步骤
## Standard Steps

1. Confirm the slice boundary first: one map area, its collision, portals, spawn points, and only the NPC placement needed for runtime visibility.
1. 先确认切片边界：一张地图区域、对应 collision、portal、spawn point，以及运行时可见所需的 NPC 摆放。
2. Put raw inputs under `content/source/maps/` and keep them importer-oriented, not runtime-oriented.
2. 把原始输入放进 `content/source/maps/`，保持面向导入器，而不是面向运行时。
3. Extend or reuse `tools/importers/importMapContent.ts` only when needed, and keep output deterministic.
3. 仅在需要时扩展或复用 `tools/importers/importMapContent.ts`，并保持输出稳定可重复。
4. Regenerate generated staging output with `npm run import-all`.
4. 用 `npm run import-all` 重新生成 generated staging 输出。
5. Curate final runtime content in `content/manual/world.content.json` only for overrides or runtime-facing assembly.
5. 只在 `content/manual/world.content.json` 里做覆盖或运行时组装，不要绕过导入流程。
6. Validate schema and content references with `npm run validate-content`.
6. 用 `npm run validate-content` 校验 schema 和内容引用。
7. If runtime-observable behavior changed, update or add a regression case in `tests/regression/`.
7. 如果运行时可观察行为变了，就更新或新增 `tests/regression/` 下的回归 case。
8. Update `docs/parity-matrix.md` with the imported slice status and concrete divergence notes.
8. 在 `docs/parity-matrix.md` 里更新该切片的状态和具体偏差说明。

## 禁止事项
## Do Not

- Do not write map-specific story flow in `WorldScene`.
- 不要把地图专属剧情流程写进 `WorldScene`。
- Do not hand-edit `content/generated/`.
- 不要手工修改 `content/generated/`。
- Do not mix unresolved upstream facts into `content/manual/` without marking them as curated or placeholder in docs.
- 不要把未核对的上游事实直接混进 `content/manual/`，除非在文档里明确标记为 curated 或占位。
- Do not expand the slice boundary just because neighboring areas are convenient.
- 不要因为相邻区域顺手就扩大导入边界。

## 完成定义
## Definition Of Done

- The real map can load in the current world runtime.
- 真实地图能在当前 world runtime 中加载。
- Player movement, collision, portals, spawn points, and visible NPC placement work for the imported slice.
- 玩家移动、碰撞、portal、spawn point 和可见 NPC 摆放在该切片上可用。
- `npm run import-all` and `npm run validate-content` pass.
- `npm run import-all` 和 `npm run validate-content` 通过。
- If behavior changed, `npm run regression-smoke` reflects the new slice state.
- 如果行为发生变化，`npm run regression-smoke` 能反映新的切片状态。
- `docs/parity-matrix.md` is updated in the same change.
- `docs/parity-matrix.md` 在同一次改动里完成更新。
