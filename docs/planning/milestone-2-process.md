# Milestone 2 Process Record / 第二阶段过程记录

## 2026-04-18 — RALPLAN intake / RALPLAN 输入

中文：用户要求 `$ralplan`，目标是“最高质量完成工作”，并要求中间计划和过程保持记录。此前还要求及时提交 GitHub、文档中英文双语。  
English: The user invoked `$ralplan`, asking for highest-quality completion and persistent planning/process records. Earlier requirements also include prompt GitHub commits and careful Chinese/English bilingual docs.

## Context facts / 上下文事实

- 中文：当前最新推送提交为 `14d5fb4 Establish a playable private-remake foundation`。  
  English: Latest pushed commit is `14d5fb4 Establish a playable private-remake foundation`.
- 中文：当前原型是无依赖 Canvas RPG MVP。  
  English: Current prototype is a no-dependency Canvas RPG MVP.
- 中文：ROM 为用户本地提供；仓库不得提交 ROM 或提取 payload。  
  English: ROM is user-provided locally; the repository must not commit ROM or extracted payloads.
- 中文：`omx explore` 因缺少 cargo 不可用，已使用 shell inspection 作为事实收集替代。  
  English: `omx explore` was unavailable due to missing cargo; shell inspection was used as fallback fact gathering.

## Consensus log / 共识日志

1. 中文：Planner 草案建议 Milestone 2：数据就绪的可玩扩展。  
   English: Planner draft proposed Milestone 2: Data-Ready Playable Expansion.
2. 中文：Architect 首轮要求迭代，重点是数据边界、存档迁移顺序、`src/main.js` 护栏、ROM 非 payload 范围。  
   English: Architect first pass required iteration around data boundary, save migration ordering, `src/main.js` guardrails, and ROM non-payload scope.
3. 中文：修订计划明确采用 checked-in generated JS data module + 单一 loader/boundary，并把存档迁移放在物品/目标扩展前。  
   English: Revised plan chose checked-in generated JS data module + single loader/boundary and placed save migration before item/objective state expansion.
4. 中文：修订计划增加可度量 `src/main.js` 护栏和 ROM metadata/design-only 范围。  
   English: Revised plan added measurable `src/main.js` guardrails and metadata/design-only ROM scope.
5. 中文：Critic 显式复核返回 ITERATE，要求补齐 ADR alternatives/why/consequences/follow-ups、修正过早 approval 记录、增加 fail-closed 私有 payload 检查、补充交接写入范围、明确第二目标。  
   English: Explicit Critic review returned ITERATE, requiring ADR alternatives/why/consequences/follow-ups, removal of premature approval language, fail-closed private payload checks, handoff write scopes, and a concrete second objective definition.
6. 中文：本记录已按 Critic 反馈修订；Critic re-review 返回 APPROVE，无剩余 must-fix。  
   English: This record was revised according to Critic feedback; Critic re-review returned APPROVE with no remaining must-fix items.

## Artifacts / 产物

- `.omx/plans/prd-milestone-2.md`
- `.omx/plans/test-spec-milestone-2.md`
- `docs/planning/milestone-2-plan.md`
- `docs/planning/milestone-2-process.md`

## Verification to run after this planning commit / 本规划提交后的验证

```sh
npm run check
python3 -m py_compile tools/nes_rom_tool.py
npm run rom:inspect
```

## Known gaps / 已知缺口

中文：本次是规划与记录，不执行 Milestone 2 代码实现。执行应通过 Ralph 或 Team 按 PRD/Test Spec 推进。  
English: This is planning and recordkeeping only. Milestone 2 implementation should proceed through Ralph or Team using the PRD/Test Spec.


## Final critic approval / 最终 Critic 批准

中文：最终 Critic 复核通过：ADR 完整、备选方案公平、风险缓解明确、验收标准可测试、验证步骤具体、双语记录质量合格、私有 ROM/payload 安全边界可执行、Ralph/Team 交接写入范围明确。  
English: Final Critic review approved: ADR is complete, alternatives are fair, risk mitigations are clear, acceptance criteria are testable, verification steps are concrete, bilingual records are adequate, private ROM/payload boundaries are enforceable, and Ralph/Team handoff write scopes are clear.


## 2026-04-18 — Phase 1 data boundary / 阶段 1 数据边界

中文：实现规范化可提交数据边界：新增 `src/game/generated/prototype-data.js`、`src/game/tile-types.js`、`src/game/validation/data-validation.js`，并让 `src/game/data.js` 成为统一导出边界。`scripts/smoke-test.mjs` 现在验证 schema/reference，包括第二目标事件 `rescue-scout`。  
English: Implemented the normalized commit-safe data boundary: added `src/game/generated/prototype-data.js`, `src/game/tile-types.js`, and `src/game/validation/data-validation.js`, while making `src/game/data.js` the unified export boundary. `scripts/smoke-test.mjs` now validates schema/reference integrity, including the second-objective event `rescue-scout`.

验证 / Verification:

```sh
npm run check
python3 -m py_compile tools/nes_rom_tool.py
npm run rom:inspect
```

隐私检查 / Privacy check: no staged private payload before commit.  
English: No staged private payload before commit.


## 2026-04-18 — Phase 2 save migration / 阶段 2 存档迁移

中文：实现 `saveVersion: 2`、存档序列化/读取模块 `src/game/storage.js`、旧版无版本存档迁移、损坏存档安全失败，以及 smoke test 中的 round-trip/migration 断言。  
English: Implemented `saveVersion: 2`, save serialization/loading module `src/game/storage.js`, migration for versionless saves, safe failure for malformed saves, and smoke-test assertions for round-trip and migration behavior.

验证 / Verification:

```sh
npm run check
python3 -m py_compile tools/nes_rom_tool.py
npm run rom:inspect
```
