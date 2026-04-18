# PRD: Milestone 3 — Town Interior Slice + Evidence-Gated Original-Inference Bridge / 第三阶段：城镇内部切片 + 证据门槛制原版推断桥

## Metadata / 元数据

- Source spec / 来源规格: `.omx/specs/deep-interview-milestone-3-town-inference.md`
- Date / 日期: 2026-04-18
- Current baseline / 当前基线: commit `3122f4b`
- Execution mode / 执行模式: Ralplan -> Ralph pipeline

## Requirements Summary / 需求摘要

中文：第三阶段需要在继续保持可玩进展的同时，进行更重的 ROM 原版推断。只有当本地 ROM/合法资料/metadata-only 工具提供明确证据时，才把城镇细节标记为 original-derived；否则实现清楚标记为 prototype 的小沛城镇内部、NPC 和客栈。  
English: Milestone 3 must continue playable progress while investing more heavily in ROM-original inference. Town details may be marked original-derived only when local ROM/lawful references/metadata-only tools provide explicit evidence; otherwise the Xiaopei town interior, NPCs, and inn are implemented as clearly labeled prototype content.

## RALPLAN-DR Summary / RALPLAN-DR 摘要

### Principles / 原则

1. 中文：证据优先，不能把占位内容冒充原版。  
   English: Evidence first; never present placeholders as original-authentic.
2. 中文：可玩切片必须落地，不能无限逆向。  
   English: A playable slice must ship; reverse engineering must not continue indefinitely.
3. 中文：ROM/payload 边界不可妥协。  
   English: ROM/payload boundaries are non-negotiable.
4. 中文：数据边界与测试先行。  
   English: Data boundaries and tests come first.
5. 中文：双语文档和过程证据继续作为交付物。  
   English: Bilingual docs and process evidence remain deliverables.

### Decision Drivers / 决策驱动

1. 中文：用户选择平衡路线，但要求原版优先且重度推断。  
   English: The user chose a balanced route but requested original-first heavy inference.
2. 中文：当前项目已有 Milestone 2 数据边界、存档、物品、目标链。  
   English: The project already has Milestone 2 data boundary, saves, items, and objective chains.
3. 中文：ROM 是 Mapper 74 + CHR RAM，真实城镇素材/文本需要证据门槛。  
   English: The ROM is Mapper 74 + CHR RAM, so authentic town graphics/text require evidence gates.

### Viable Options / 可行选项

#### Option A — Evidence-Gated Heavy Probe + Prototype Fallback / 证据门槛重探针 + 原型回退（选择）

Pros / 优点:
- 中文：尊重“原版优先”同时保证有可玩交付。  
  English: Respects original-first while still shipping playable progress.
- 中文：为后续真实 ROM 数据接入建立证据分类。  
  English: Establishes evidence categories for future ROM-derived data.

Cons / 缺点:
- 中文：需要更多测试和文档来防止误标原版。  
  English: Requires more tests and docs to prevent false authenticity claims.

#### Option B — Runtime Tracing First Only / 只做运行时追踪优先

Pros / 优点:
- 中文：更接近原始数据。  
  English: Closer to authentic data.

Cons / 缺点:
- 中文：可能没有城镇可玩交付，违背平衡路线。  
  English: May produce no playable town slice, violating the balanced route.

#### Option C — Prototype Town Only / 只做原型城镇

Pros / 优点:
- 中文：最快可玩。  
  English: Fastest playable progress.

Cons / 缺点:
- 中文：忽略用户要求的重度原版推断。  
  English: Ignores the user's heavy original-inference preference.

## Decision / 决策

中文：采用 Option A。Milestone 3 先建立 metadata-only inference/evidence 机制，再实现小沛城镇内部；如果没有达到证据门槛，城镇内容必须标记为 prototype。  
English: Choose Option A. Milestone 3 first establishes metadata-only inference/evidence mechanisms, then implements Xiaopei interior; if evidence thresholds are not met, town content must be labeled prototype.

## ADR / 架构决策记录

### Decision / 决策

中文：城镇数据进入现有 `src/game/data.js` 统一边界；新增 town/interior/evidence 字段；ROM 推断工具只提交 metadata-only 输出结构和命令，不提交 payload。  
English: Town data flows through the existing `src/game/data.js` boundary; town/interior/evidence fields are added; ROM inference tools commit metadata-only output structures and commands, never payload.

### Alternatives considered / 备选方案

- Direct payload extraction into repo / 直接把提取素材入库：Rejected because it violates private payload boundary.
- Emulator implementation before town slice / 先完整 emulator 再城镇：Rejected because it risks no playable milestone.
- Hardcode town without evidence labels / 无证据标签硬编码城镇：Rejected because it risks false authenticity claims.

### Consequences / 后果

- Town data must carry evidence status.
- Tests must verify service/NPC/evidence references.
- Docs must label prototype vs confirmed/inferred content.
- Future tracing can replace prototype content without changing gameplay systems.

### Follow-ups / 后续

- Milestone 4 can deepen emulator-backed PPU tracing if Milestone 3 metadata probe finds useful candidates.
- Manual browser QA should be added after town movement is playable.

## In Scope / 范围内

- Metadata-only town inference probe/report.
- Evidence manifest/schema.
- Xiaopei interior map and town transitions.
- At least 2 NPCs.
- Inn service only: pay gold, restore soldiers/tactics, insufficient-gold refusal.
- `xiaopeiInnRested` or equivalent flag.
- Save/load preservation for town/interior state.
- Bilingual docs and process logs.
- Lore commits + push after verified slices.

## Out of Scope / 非目标

- No committed ROM/payload/captures/screenshots/bank slices/text dumps/audio.
- No shop in Milestone 3 unless inn/town MVP is already complete.
- No full original-game fidelity claim.
- No large battle/equipment/UI/world expansion.

## Evidence Gate / 证据门槛

A town detail may be labeled `confirmed` or `inferred` only if backed by one of:

- metadata-only PRG bank/address analysis;
- suspected text/font evidence;
- repeatable local command producing payload-free evidence;
- lawful reference description;
- private capture reference stored outside git.

Otherwise mark it `prototype` or `unknown`.

## Acceptance Criteria / 验收标准

- `npm run check` passes.
- Python tools compile.
- ROM inference command runs and writes metadata-only outputs under ignored `.omx/`.
- Data validation covers town maps, NPCs, services, transitions, evidence metadata.
- Player can enter Xiaopei interior from overworld and exit back.
- Player can talk to at least 2 NPCs.
- Inn success deducts gold, restores party soldiers/tactics, sets `xiaopeiInnRested`.
- Inn insufficient-gold path does not restore and shows refusal result.
- Save/load preserves interior map position, gold, and `xiaopeiInnRested`.
- Docs are bilingual and label prototype vs evidence-backed content.
- Private payload checks pass.
- GitHub push succeeds and worktree is clean.

## Execution Slices / 执行切片

1. Planning artifacts and process records.
2. Metadata-only town inference command/report schema.
3. Town/interior data schema + validation.
4. Town transition/interior movement.
5. NPC + inn service behavior.
6. Save/tests/docs/process closeout.
7. Deslop + regression verification.
