# PRD: Milestone 2 — Data-Ready Playable Expansion / 第二阶段：数据就绪的可玩扩展

## Metadata / 元数据

- Project / 项目: Destiny of an Emperor / 吞食天地复刻原型
- Planning mode / 规划模式: `$ralplan --consensus` deliberate-quality planning
- Date / 日期: 2026-04-18
- Source of truth / 当前依据: commit `14d5fb4` plus current repository inspection
- Execution status / 执行状态: approved for handoff; not auto-executed by ralplan

## Requirements Summary / 需求摘要

中文：第二阶段不尝试一次性完成完整商业级复刻，而是把当前可玩的 Canvas MVP 扩展成“数据就绪”的第二个可验证里程碑：更清晰的数据边界、更可靠的存档迁移、真实可用的最小物品系统、第二条可完成目标链、ROM 运行时追踪的安全设计骨架，以及中英文双语过程记录。  
English: Milestone 2 does not attempt a full commercial remake. It expands the current playable Canvas MVP into a data-ready second milestone: a clearer data boundary, safer save migration, a minimal real item system, a second completable objective chain, a safe ROM runtime-tracing design scaffold, and bilingual process records.

## Current Evidence / 当前事实依据

- `README.md` documents the current no-dependency Canvas prototype and first MVP loop.
- `package.json` defines `start`, `check`, `rom:inspect`, and `rom:chr` scripts.
- `src/main.js` currently owns field movement, events, menu, combat, HUD, and render loop.
- `src/game/data.js` currently contains prototype maps, events, officers, enemies, boss data, and opening objective text.
- `src/game/state.js` owns state creation, restore, battle start, save, and load.
- `tools/nes_rom_tool.py` parses iNES/NES2 metadata, bank hashes, vectors, and candidate CHR visualizations.
- ROM facts: iNES, Mapper 74, PRG 1 MiB, CHR ROM 0, CHR RAM hint 8 KiB.
- `.gitignore` protects `.omx/`, ROM files, and private extracted asset paths.
- Documentation is already bilingual in README and docs.

## Non-goals / 非目标

中文：以下内容不属于第二阶段范围。  
English: The following are out of scope for Milestone 2.

- 不完成全量原版游戏复刻 / Do not complete the full original game remake.
- 不提交 ROM、提取图形、文本 dump、音乐、bank 切片、pattern table、nametable、palette、截图或 runtime capture payload。 / Do not commit ROM bytes, extracted graphics, text dumps, music, bank slices, pattern tables, nametables, palettes, screenshots, or runtime capture payloads.
- 不在测试保护不足时大规模重构 `src/main.js`。 / Do not broadly refactor `src/main.js` before behavior-locking tests are in place.
- 不宣称占位数据已经等同原版数据。 / Do not claim placeholder data is authentic original data.

## RALPLAN-DR Summary / RALPLAN-DR 摘要

### Principles / 原则

1. 中文：可玩进展优先于档案完整性。  
   English: Playable progress over archival completeness.
2. 中文：私有 payload 边界不可妥协。  
   English: Private payload boundaries are non-negotiable.
3. 中文：双语文档是一等交付物。  
   English: Bilingual documentation is a first-class deliverable.
4. 中文：先建立数据管线边界，再替换数据。  
   English: Establish the data pipeline boundary before replacing content.
5. 中文：每个可验证切片及时提交并推送。  
   English: Commit and push each verified coherent slice promptly.

### Decision Drivers / 决策驱动

1. 中文：用户要求最高质量完成、记录过程、及时提交 GitHub、文档中英文双语。  
   English: The user requires highest-quality completion, process records, prompt GitHub commits, and bilingual docs.
2. 中文：当前项目已有可运行 MVP，下一步应减少重做风险并保护存档/数据边界。  
   English: The project already has a runnable MVP, so the next step should reduce rework risk and protect save/data boundaries.
3. 中文：ROM 使用 CHR RAM，完整素材提取需要运行时追踪；不能把 payload 纳入仓库。  
   English: The ROM uses CHR RAM, so accurate asset extraction requires runtime tracing; payload must not enter the repository.

### Viable Options / 可行选项

#### Option A — Engine Expansion + Normalized Data Boundary / 引擎扩展 + 规范化数据边界（推荐）

Pros / 优点:
- 中文：同时提升可玩性与长期可维护性。  
  English: Improves playability and long-term maintainability together.
- 中文：把真实 ROM 数据接入点前置，减少后续替换成本。  
  English: Creates the future ROM-data integration point early.
- 中文：可以用现有 `npm run check` 和 smoke tests 快速验证。  
  English: Can be verified quickly with existing `npm run check` and smoke tests.

Cons / 缺点:
- 中文：需要小心控制 `src/main.js` 变更范围。  
  English: Requires careful control of `src/main.js` edit scope.
- 中文：还不能立刻得到完整原版素材。  
  English: Does not immediately produce complete original assets.

#### Option B — ROM Tracing First / ROM 追踪优先

Pros / 优点:
- 中文：更接近最终真实素材和数据提取目标。  
  English: Closer to the final authentic data-extraction goal.

Cons / 缺点:
- 中文：Mapper 74 + CHR RAM 追踪复杂，可能耗尽里程碑而没有可玩进展。  
  English: Mapper 74 + CHR RAM tracing is complex and may consume the milestone without playable progress.
- 中文：payload 安全边界更容易被误破坏。  
  English: Payload safety boundaries are easier to violate accidentally.

#### Option C — Refactor First / 重构优先

Pros / 优点:
- 中文：可能改善代码结构。  
  English: May improve code structure.

Cons / 缺点:
- 中文：行为测试不足时重构风险高。  
  English: Risky without stronger behavior tests.
- 中文：用户要“完成结果”，纯重构体验价值低。  
  English: The user wants completion results; pure refactoring has low visible value.

## Decision / 决策

中文：采用 Option A：Engine Expansion + Normalized Data Boundary。  
English: Choose Option A: Engine Expansion + Normalized Data Boundary.

## Explicit Data-Boundary ADR / 明确数据边界 ADR

### Decision / 决策

中文：第二阶段采用“checked-in generated JS data module + 单一 loader/boundary”的方案。规范化 shape 以 JSON 形式记录在文档中，但运行时默认从可提交 JS 模块导入，保持无构建、无第三方依赖、本地静态服务器可运行。  
English: Milestone 2 uses a checked-in generated JS data module plus a single loader/boundary. The normalized shape is documented as JSON, while runtime imports a commit-safe JS module to preserve the no-build, no-dependency static-server workflow.

### Drivers / 驱动

- `package.json` currently uses no build step and runs via static server.
- Browser JSON import assertions are less portable than JS module imports.
- Future extraction tools can generate JSON first, then a checked-in/public-safe JS projection.

### Alternatives considered / 备选方案

1. **Direct JSON fetch/import / 直接 JSON fetch/import**  
   中文：优点是格式接近未来提取器输出；缺点是浏览器 JSON import assertion 兼容性和本地静态运行细节更复杂。  
   English: Pros: close to future extractor output. Cons: browser JSON import assertion compatibility and static-runtime details are more fragile.

2. **Keep current `data.js` as scattered source data / 保持当前 `data.js` 分散数据**  
   中文：优点是改动小；缺点是没有 schema/reference 验证，后续 ROM 数据替换成本高。  
   English: Pros: lowest immediate change. Cons: no schema/reference validation and higher future ROM-data replacement cost.

3. **ROM-tracing-first / ROM 追踪优先**  
   中文：优点是接近真实数据；缺点是 Mapper 74 + CHR RAM 复杂，且容易在没有边界时引入 payload 风险。  
   English: Pros: closer to authentic data. Cons: Mapper 74 + CHR RAM is complex and may introduce payload risk before boundaries are ready.

4. **Generated JS boundary / 生成式 JS 边界（选择）**  
   中文：优点是保留无构建运行方式、浏览器兼容性好、可由未来 JSON 生成；缺点是需要明确 canonical JSON shape 与生成约定，避免 JS 成为新的手写孤岛。  
   English: Pros: keeps no-build runtime, is browser-friendly, and can be generated from future JSON. Cons: needs a canonical JSON shape and generation convention so JS does not become another manual island.

### Why chosen / 选择理由

中文：选择 generated JS boundary，因为它最符合当前无构建项目、能让测试先保护数据引用，又不阻塞未来从 ROM 提取 JSON 并生成可提交投影。  
English: The generated JS boundary best fits the current no-build project, allows tests to protect data references early, and does not block future ROM-extracted JSON from producing a commit-safe projection.

### Consequences / 后果

- Engine code must not import scattered gameplay data directly from multiple files.
- `src/game/data.js` should become or delegate to the single commit-safe boundary.
- Tests must validate ID references and schema shape before gameplay logic uses the data.
- Future ROM extractor outputs should target canonical JSON first, then generate the commit-safe JS projection when payload-free.

### Follow-ups / 后续

- Document the canonical JSON shape in `docs/data-pipeline.md`.
- Add a schema/reference validator to `scripts/smoke-test.mjs` or a dedicated validation script.
- Keep private extractor outputs under `.omx/rom-analysis/` until payload-free projections are intentionally generated.

## Phased Scope / 分阶段范围

### Phase 0 — Planning and Process Baseline / 规划与过程基线

Deliverables / 交付物:
- `.omx/plans/prd-milestone-2.md`
- `.omx/plans/test-spec-milestone-2.md`
- `docs/planning/milestone-2-plan.md`
- `docs/planning/milestone-2-process.md`

Acceptance / 验收:
- 双语过程记录存在。 / Bilingual process record exists.
- PRD 与 test spec 明确 private payload 边界。 / PRD and test spec state private payload boundary.
- PRD 明确第二阶段不是完整复刻。 / PRD states Milestone 2 is not the full remake.

### Phase 1 — Normalized Commit-Safe Data Boundary / 规范化可提交数据边界

Deliverables / 交付物:
- A single gameplay-data boundary module.
- Commit-safe prototype generated/source data.
- Schema/reference validation in smoke tests.
- Bilingual data-pipeline docs update.

Acceptance / 验收:
- Engine consumes at least maps, events, encounters, boss/objective data through one boundary.
- Tests fail for duplicate IDs, missing referenced boss IDs, invalid map dimensions, and missing item references.
- No private payload is staged.

### Phase 2 — Save Versioning Before State Expansion / 先做存档版本与迁移

Deliverables / 交付物:
- `CURRENT_SAVE_VERSION = 2` or equivalent.
- `saveVersion` in new game state.
- Migration for versionless MVP saves.
- Malformed-save safe fallback.

Acceptance / 验收:
- Versionless save migrates or resets deterministically.
- Malformed save does not throw.
- Current save round-trip preserves player, party, flags, inventory, objective state, and RNG seed.

### Phase 3 — Minimal Real Item System / 最小真实物品系统

Deliverables / 交付物:
- At least one usable item, e.g. healing item.
- Quantity decrement.
- Menu and battle usage path.
- Empty inventory path.

Acceptance / 验收:
- Healing clamps to max soldiers.
- Quantity decreases exactly once on use.
- Cannot use unavailable item.
- Item behavior is covered by tests.

### Phase 4 — Second Playable Objective Chain / 第二条可完成目标链

Deliverables / 交付物:
- A second objective after Hulao Gate.
- Clear Chinese in-game objective text.
- Completion flag and reward.
- Bilingual docs update.

Acceptance / 验收:
- Player can complete objective 1 and then objective 2 in the same save state.
- Objective 2 cannot be completed before prerequisites unless intentionally designed.
- Smoke tests cover the flag progression.

### Phase 5 — ROM Runtime-Tracing Design/Safe Scaffold / ROM 运行时追踪安全设计骨架

Deliverables / 交付物:
- Design docs and skeleton command/API only.
- Output path policy under ignored `.omx/rom-analysis/runtime-captures/`.
- Metadata-only manifest shape.

Acceptance / 验收:
- No payload-producing command is advertised as commit-safe.
- Staged-file review confirms no ROM/capture payloads.
- Python syntax check passes if tools change.

### Phase 6 — Bilingual Closeout and Final Verification / 双语收尾与最终验证

Deliverables / 交付物:
- Updated README and docs.
- Completion process record.
- Verification evidence.
- Final pushed commit.

Acceptance / 验收:
- `npm run check` passes.
- `python3 -m py_compile tools/nes_rom_tool.py` passes.
- `npm run rom:inspect` passes when local ROM exists.
- HTTP smoke passes.
- Git status is clean after push.

## `src/main.js` Guardrails / `src/main.js` 护栏

Allowed / 允许:
- Localized integration calls for data loader, item usage, objective events, and dialogue text.
- Extraction of small helpers only when tests already cover behavior.

Not allowed without new refactor plan / 未另行规划前不允许:
- Rewriting render loop, input model, battle loop, and field movement together.
- Moving more than one major responsibility out of `src/main.js` in the same gameplay slice.
- Changing battle math and objective flow in the same commit unless tests cover both.

Measurable guardrail / 可度量护栏:
- Each gameplay commit touching `src/main.js` must list affected functions in the process log.
- Any commit changing more than 5 functions in `src/main.js` must add/extend behavior tests or split the commit.
- If `src/main.js` grows by more than ~150 net lines in a single slice, stop and create a refactor sub-plan.

## Pre-mortem / 失败预演

1. Failure / 失败：Data boundary becomes a second hardcoded data file with no validation.  
   Mitigation / 缓解：Add schema/reference smoke tests before migrating gameplay logic.
2. Failure / 失败：Save migration corrupts user progress.  
   Mitigation / 缓解：Implement migration before adding inventory/objective state; test versionless, malformed, and current saves.
3. Failure / 失败：ROM tracing scaffold accidentally commits payload or screenshots.  
   Mitigation / 缓解：Keep outputs under ignored paths; run `git status --short` and `git check-ignore` checks before every commit.

## Verification Matrix / 验证矩阵

- Unit-like / 类单元：data validation, save migration, item effects, objective flags.
- Integration / 集成：`npm run check`, `npm run rom:inspect`, Python compile.
- E2E smoke / 端到端冒烟：local HTTP server + curl; manual browser path when feasible.
- Observability / 可观察性：process records include commit hash, checks run, known gaps, and staged-file privacy review.

## Available Agent Types / 可用 Agent 类型

- `architect`: data boundary and long-term structure review.
- `test-engineer`: migration/item/objective tests.
- `executor`: implementation slices.
- `writer`: bilingual docs and process records.
- `security-reviewer`: private ROM/payload boundary.
- `verifier`: final evidence and claim validation.
- `git-master`: Lore commits and push hygiene.

## Second Objective Definition / 第二目标定义

- Objective ID / 目标 ID: `rescue-scout`
- Completion flag / 完成旗标: `scoutRescued`
- Prerequisite / 前置条件: `hulaoCleared === true`
- Trigger location / 触发位置: a new road/village event north-east of Hulao Gate, exact map coordinate to be chosen during implementation and recorded in data validation tests.
- In-game Chinese objective text / 中文目标文本: `虎牢关已破。前往北平南道，救回应急斥候。`
- Reward / 奖励: one healing item bundle plus gold, represented through normalized data.
- Smoke expectation / 冒烟预期: before `hulaoCleared`, event explains the road is unsafe; after `hulaoCleared`, event can complete and sets `scoutRescued`.

## Handoff Write Scopes / 交接写入范围

### Ralph sequential scopes / Ralph 顺序范围

1. Data boundary slice: `src/game/data.js`, new loader/generated data module, validation tests, `docs/data-pipeline.md`.
2. Save migration slice: `src/game/state.js`, save/migration tests, `docs/game-design.md`.
3. Item system slice: item helper/module, localized `src/main.js` menu/battle calls, tests, `docs/game-design.md`.
4. Objective slice: normalized data/objective event, localized `src/main.js` event handling, tests, `docs/roadmap.md`.
5. ROM safety scaffold/docs slice: `docs/rom-analysis.md`, `docs/data-pipeline.md`, optional metadata-only tool skeleton.
6. Verification/git slice: process record, README updates, final checks, Lore commit/push.

### Team lane ownership / Team lane ownership

- Data-boundary lane owns data loader/generated data and validation tests; it must not edit battle logic.
- Save-migration lane owns `src/game/state.js` migration and save tests; it must not change map/objective text.
- Gameplay lane owns item/objective integration and localized `src/main.js` calls; it must not change ROM tooling.
- ROM-safety/docs lane owns docs and payload policy only; it must not generate or stage payload.
- Verifier/git lane owns checks, staged-file review, process record, and commit/push hygiene.

## Handoff Guidance / 交接建议

### Ralph path / Ralph 路径

中文：适合保守顺序推进，每个切片验证、提交、推送。  
English: Best for conservative sequential delivery with verification, commit, and push per slice.

Suggested command:

```text
$ralph .omx/plans/prd-milestone-2.md .omx/plans/test-spec-milestone-2.md
```

### Team path / Team 路径

中文：适合并行推进，但必须分离写入范围。  
English: Suitable for parallel execution if write scopes are separated.

Suggested lanes:
1. Data boundary executor.
2. Save migration/test engineer.
3. Item/objective gameplay executor.
4. ROM safety/docs writer.
5. Verifier/git hygiene.

Suggested command:

```text
$team "Implement Milestone 2 using .omx/plans/prd-milestone-2.md and .omx/plans/test-spec-milestone-2.md. Preserve private ROM boundary, keep docs bilingual, verify and push coherent Lore commits."
```
