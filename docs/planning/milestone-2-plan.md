# Milestone 2 Plan / 第二阶段计划

中文：本文件是可提交的双语计划记录；完整 PRD 和 Test Spec 也保存在 `.omx/plans/` 中供 OMX/Ralph/Team 使用。  
English: This file is the commit-safe bilingual plan record. Full PRD and Test Spec artifacts are also stored under `.omx/plans/` for OMX/Ralph/Team handoff.

## Decision / 决策

中文：执行 **Milestone 2 — Data-Ready Playable Expansion / 第二阶段：数据就绪的可玩扩展**。  
English: Execute **Milestone 2 — Data-Ready Playable Expansion**.

## Why / 为什么

中文：当前项目已经有可运行的 Canvas MVP；最高质量的下一步不是盲目扩大范围，而是让原型更可玩、更可测试、更容易接入未来 ROM 私有提取数据。  
English: The project already has a runnable Canvas MVP. The highest-quality next step is not uncontrolled scope expansion, but making the prototype more playable, more testable, and ready for future private ROM-derived data.

## Principles / 原则

1. 中文：可玩进展优先于档案完整性。  
   English: Playable progress over archival completeness.
2. 中文：私有 ROM/payload 边界不可妥协。  
   English: Private ROM/payload boundaries are non-negotiable.
3. 中文：双语文档是一等交付物。  
   English: Bilingual documentation is a first-class deliverable.
4. 中文：先建立数据边界，再替换真实数据。  
   English: Establish the data boundary before replacing real data.
5. 中文：每个验证切片及时提交并推送。  
   English: Commit and push each verified slice promptly.

## Chosen approach / 选择方案

中文：采用“引擎扩展 + 规范化可提交数据边界”。具体做法是：保留无构建/无依赖运行方式，新增单一数据 loader/boundary，先让 prototype data 通过该边界流入引擎，再做存档迁移、物品系统、第二目标链和 ROM 追踪设计骨架。  
English: Use “engine expansion + normalized commit-safe data boundary.” Keep the no-build/no-dependency runtime, add a single data loader/boundary, route prototype data through that boundary first, then implement save migration, item system, second objective chain, and ROM tracing design scaffold.

## Phases / 阶段

1. 中文：规划与过程基线。  
   English: Planning and process baseline.
2. 中文：规范化可提交数据边界。  
   English: Normalized commit-safe data boundary.
3. 中文：存档版本与迁移。  
   English: Save versioning and migration.
4. 中文：最小真实物品系统。  
   English: Minimal real item system.
5. 中文：第二条可完成目标链。  
   English: Second completable objective chain.
6. 中文：ROM 运行时追踪安全设计骨架。  
   English: ROM runtime-tracing safe design scaffold.
7. 中文：双语收尾与最终验证。  
   English: Bilingual closeout and final verification.

## Acceptance / 验收

- 中文：数据从单一边界进入引擎，且有 schema/reference 测试。  
  English: Data enters the engine through a single boundary with schema/reference tests.
- 中文：存档有版本号与迁移测试。  
  English: Saves have versioning and migration tests.
- 中文：至少一个物品具备真实效果。  
  English: At least one item has a real gameplay effect.
- 中文：第一目标后存在第二条可完成目标链：`rescue-scout` / `scoutRescued`，前置条件为 `hulaoCleared`。  
  English: A second objective chain exists after the first objective: `rescue-scout` / `scoutRescued`, gated by `hulaoCleared`.
- 中文：ROM 追踪工作只提交设计、schema、metadata，不提交 payload。  
  English: ROM tracing work commits design, schemas, and metadata only—not payload.
- 中文：文档与过程记录保持中英文双语。  
  English: Documentation and process records remain bilingual.
- 中文：每个切片验证后用 Lore commit 协议提交并推送。  
  English: Each slice is verified, committed with Lore protocol, and pushed.

## Handoff / 交接

中文：推荐用 Ralph 顺序执行；如果需要并行，可以用 Team，把数据边界、存档测试、物品/目标、ROM 安全文档、最终验证拆成独立 lane。  
English: Prefer Ralph for sequential execution. If parallelism is needed, use Team with separate lanes for data boundary, save/tests, items/objectives, ROM safety docs, and final verification.


## Handoff write scopes / 交接写入范围

中文：执行时必须拆分写入范围：数据边界、存档迁移、物品/目标玩法、ROM 安全文档、验证/git 卫生分别处理，避免多个 lane 同时大改 `src/main.js`、`src/game/data.js`、`src/game/state.js`。  
English: Execution must split write scopes: data boundary, save migration, item/objective gameplay, ROM safety docs, and verification/git hygiene should be handled separately to avoid overlapping large edits to `src/main.js`, `src/game/data.js`, and `src/game/state.js`.
