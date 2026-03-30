# Plugin And MCP Evaluation
# Plugin 与 MCP 评估

## Goal
## 目标

Decide whether the current repository workflows are mature enough to justify a Codex plugin or an MCP workspace, without adding complexity just for novelty.
判断当前仓库工作流是否已经成熟到值得升级成 Codex plugin 或 MCP 工作区，同时避免为了“高级化”而引入额外复杂度。

This evaluation is based only on the current repository state: existing skills, local tools, reports, scripts, and real content import needs.
本评估只基于当前仓库的真实状态：现有 skills、本地工具、报告、脚本，以及真实内容导入需求。

## Current Skills
## 当前已有 Skills

| Skill | Current Role | Stability Assessment |
| --- | --- | --- |
| `battle-system` | battle runtime, reward flow, battle-world transitions | stable domain rule set, but still evolving on parity details |
| `battle-system` | 战斗运行时、奖励流转、战斗与世界切换 | 领域规则已稳定，但一致性细节仍在演进 |
| `content-import-validator` | import scripts, generated content, validators, consistency checks | stable and reusable |
| `content-import-validator` | 导入脚本、generated 内容、校验器、一致性检查 | 稳定且可复用 |
| `jrpg-runtime-architect` | runtime boundaries, scene layering, save/state contracts | stable as architecture policy |
| `jrpg-runtime-architect` | 运行时边界、scene 分层、存档与状态契约 | 作为架构约束已稳定 |
| `map-event-pipeline` | triggers, dialogue, flags, opcode evolution, event interpreter workflow | stable but still gaining new real-content cases |
| `map-event-pipeline` | trigger、对话、flag、opcode 演进、事件解释器工作流 | 已基本稳定，但仍在吸收新的真实内容 case |
| `real-map-import` | bounded real map slice import into `source -> tools -> generated/manual` | stable and repeatedly proven |
| `real-map-import` | 把真实地图切片导入 `source -> tools -> generated/manual` | 已多次验证，流程稳定 |
| `real-event-import` | bounded real event import plus regression/parity updates | stable and repeatedly proven |
| `real-event-import` | 真实事件导入，并同步更新 regression/parity | 已多次验证，流程稳定 |
| `parity-audit` | evidence-based parity status updates | stable and useful |
| `parity-audit` | 基于证据更新 parity 状态 | 稳定且有用 |
| `regression-repair` | repair loop driven by regression evidence | stable and useful |
| `regression-repair` | 基于回归证据驱动修复循环 | 稳定且有用 |

## Current Toolchain And Dependency Reality
## 当前工具链与依赖现实

### Local Tooling
### 本地工具

The repository already has a coherent local CLI layer:
仓库已经具备一套完整的本地 CLI 层：

- import and validation: `import-all`, `validate-content`
- 导入与校验：`import-all`、`validate-content`
- maintenance helpers: `event-json`, `format:events`, `check:npc-placement`, `check:chapter-completeness`
- 维护辅助：`event-json`、`format:events`、`check:npc-placement`、`check:chapter-completeness`
- quality gates: `test`, `build`, `regression-smoke`, `parity-score`, `battle-parity`, `discrepancy-triage`
- 质量门禁：`test`、`build`、`regression-smoke`、`parity-score`、`battle-parity`、`discrepancy-triage`

These commands already solve the current team workflow without requiring a separate distribution mechanism.
这些命令已经能覆盖当前团队工作流，不需要额外的分发机制才能使用。

### External Dependencies
### 外部依赖

Current external runtime/build dependencies are intentionally small:
当前外部运行时与构建依赖刻意保持得很小：

- `phaser`
- `typescript`
- `vite`
- `vitest`
- `jsdom`

There is no current dependency on external SaaS, remote content databases, or third-party asset services that would naturally justify MCP integration today.
当前并没有依赖外部 SaaS、远程内容数据库或第三方资产服务，因此今天还没有天然需要接入 MCP 的外部系统。

## Which Workflows Are Stable Enough To Package
## 哪些工作流已经足够稳定，适合打包

### Worth Packaging As Shared Workflow Contracts
### 适合打包成共享工作流约束

These are already stable enough to package as reusable workflow entry points:
以下流程已经足够稳定，可以打包成可复用工作流入口：

1. `real-map-import`
1. `real-map-import`

- clear boundary
- 边界清晰
- repeatedly proven in chapter import work
- 已在章节导入中多次验证
- low conceptual drift
- 概念漂移低

2. `real-event-import`
2. `real-event-import`

- already tied to DSL, regression, and parity updates
- 已经与 DSL、回归和 parity 更新强绑定
- good candidate for standard packaging
- 很适合作为标准打包对象

3. `parity-audit`
3. `parity-audit`

- depends on stable report files and matrix structure
- 依赖的是稳定的报告文件和矩阵结构
- strong candidate for future automation
- 很适合进一步自动化

4. `regression-repair`
4. `regression-repair`

- works well as a repo-specific repair loop
- 作为仓库专用修复循环已经很好用
- still benefits from local code access more than remote abstraction
- 目前仍更依赖本地代码访问，而不是远程抽象

### Not Yet Worth Packaging Beyond Skills
### 还不值得超出 Skill 层打包的流程

These are not yet strong plugin candidates:
这些流程目前还不值得进一步升级成 plugin：

- `battle-system`
  because battle parity is still converging on real content, and packaging too early would freeze assumptions that are still changing.
- `battle-system`
  因为战斗一致性仍在随着真实内容收敛，太早打包会过早固化仍在变化的假设。

- `map-event-pipeline`
  because opcode and event composition rules are still growing chapter by chapter.
- `map-event-pipeline`
  因为 opcode 与事件组合规则仍在随章节推进而扩展。

- `jrpg-runtime-architect`
  because it is better kept as repository policy than as a separate executable tool.
- `jrpg-runtime-architect`
  因为它更适合作为仓库级约束，而不是独立可执行工具。

## Which External Tools Would Fit MCP Best
## 哪些外部工具最适合放入 MCP

### Recommendation Today
### 当前建议

Do not build a general MCP workspace yet.
当前不建议建立通用 MCP 工作区。

Reason:
原因：

- current workflows are almost entirely local-file and local-command based
- 当前工作流几乎全部基于本地文件和本地命令
- Codex already has direct repository access, so MCP would mostly duplicate local reads
- Codex 已经能直接读取仓库，因此 MCP 大多只是在重复本地读取能力
- there is no current remote source of truth that needs a stable structured connector
- 当前没有一个必须通过结构化连接器访问的远程真相源

### MCP Candidates Only If The Repository Grows Further
### 仅在仓库继续扩张后才值得做的 MCP 候选

1. Chapter Content Graph MCP
1. 章节内容图谱 MCP

Use case:
用途：

- query `chapter -> maps -> npcs -> triggers -> events -> shops -> enemyGroups`
- 查询 `chapter -> maps -> npcs -> triggers -> events -> shops -> enemyGroups`
- useful when chapter count is high enough that grep becomes noisy
- 当章节数量增多到 `grep` 已经很吵时，这会很有用

Value:
价值：

- high for parity audit and discrepancy triage
- 对 parity audit 和 discrepancy triage 的价值较高

Trigger condition:
触发条件：

- at least 5 to 8 real chapters imported
- 至少导入 5 到 8 个真实章节

2. Regression/Parity Report Reader MCP
2. Regression/Parity 报告读取 MCP

Use case:
用途：

- structured queries across `reports/regression`, `reports/parity`, `reports/triage`, `reports/battle-parity`
- 对 `reports/regression`、`reports/parity`、`reports/triage`、`reports/battle-parity` 做结构化查询

Value:
价值：

- medium
- 中等

Trigger condition:
触发条件：

- when report volume grows enough that manual file inspection becomes costly
- 当报告数量增长到手工检查成本明显上升时

3. Reference Asset Index MCP
3. 参考资料索引 MCP

Use case:
用途：

- browse imported screenshots, source tables, and curated chapter references
- 浏览导入截图、source 表和人工整理的章节参考资料

Value:
价值：

- potentially high, but only if the project really accumulates large reference archives
- 潜在价值较高，但前提是项目确实积累了大量参考资料档案

Trigger condition:
触发条件：

- when original reference assets are systematically stored under repository-adjacent storage
- 当原始参考资源被系统化存放到仓库附近的统一存储中时

## Plugin Evaluation
## Plugin 评估

### Recommendation Today
### 当前建议

Do not upgrade the repository into a Codex plugin yet.
当前不建议把仓库升级成 Codex plugin。

Reason:
原因：

1. The repo already has effective repo-local skills.
1. 仓库已经有有效的 repo-local skills。

2. The existing value comes from local scripts plus repository context, not from a missing plugin runtime surface.
2. 当前价值主要来自本地脚本与仓库上下文，而不是缺少某种 plugin 运行面。

3. A plugin would mostly wrap commands that Codex can already execute directly.
3. plugin 现在大多只是在包裹 Codex 已经能直接执行的命令。

4. The packaged surface would still be moving because real-content import rules are not fully locked.
4. 可打包接口本身仍在变化，因为真实内容导入规则还没有完全锁定。

### Smallest Plugin Worth Considering Later
### 未来最小可行 Plugin 方案

If a plugin becomes worthwhile later, the smallest useful version should be a thin workflow wrapper, not a full custom runtime.
如果以后确实值得做 plugin，最小有价值版本应该是一个轻量工作流包装层，而不是完整自定义运行时。

Suggested scope:
建议范围：

- expose a few stable actions:
- 暴露少数稳定动作：
  - `import_all`
  - `validate_content`
  - `run_regression_smoke`
  - `run_parity_score`
  - `check_chapter_completeness`
- expose a structured summary reader for generated reports
- 暴露一个读取生成报告结构化摘要的接口

Suggested directory structure:
建议目录结构：

```text
.codex-plugin/
  plugin.json
  README.md
  commands/
    import-all.md
    validate-content.md
    regression-smoke.md
    parity-score.md
    chapter-completeness.md
  adapters/
    report-summary.ts
    cli-runner.ts
```

Design rule:
设计规则：

- the plugin should call existing repository scripts
- plugin 只调用仓库现有脚本
- it should not reimplement import, validation, or report logic
- 不要在 plugin 里重写导入、校验或报告逻辑

## Decision
## 决策建议

### Short Version
### 简短结论

- `skills`: keep and continue refining
- `skills`：继续保留并迭代
- `plugin`: defer for now
- `plugin`：暂缓
- `MCP workspace`: defer for now
- `MCP 工作区`：暂缓

### Why Defer
### 为什么暂缓

- current repository needs are still solved efficiently by local commands plus skills
- 当前仓库需求仍能被本地命令加 skill 高效解决
- there is no strong external-system pressure
- 没有强烈的外部系统接入压力
- early plugin/MCP work would add maintenance surface before core content import is stable enough
- 在核心内容导入尚未完全稳定前，过早做 plugin/MCP 只会增加维护面

## Trigger Conditions For Next-Stage Tooling
## 进入下一阶段工具化的触发条件

Move to the next tooling phase only when at least one of these becomes true:
只有在至少满足以下一条时，才建议进入下一阶段工具化：

1. The repository has imported enough real chapters that report navigation and chapter graph queries become a daily bottleneck.
1. 已导入足够多的真实章节，以至于报告导航和章节图谱查询变成日常瓶颈。

2. Multiple contributors or multiple repositories need the same import/parity workflow surface.
2. 多个协作者或多个仓库需要复用同一套导入/parity 工作流接口。

3. Reference assets, extracted tables, or external content sources become large enough that a structured MCP connector would save repeated manual search.
3. 参考资源、提取表或外部内容源增长到足以让结构化 MCP 连接器显著减少重复人工搜索。

4. The stable command surface stops changing frequently for at least one full chapter factory cycle.
4. 至少经历一个完整章节工厂周期后，稳定命令面不再频繁变化。

## Final Recommendation
## 最终建议

For the current stage, continue investing in:
对当前阶段，更应该继续投资于：

- better local scripts
- 更好的本地脚本
- clearer skills
- 更清晰的 skills
- stronger reports
- 更强的报告体系
- tighter chapter metadata and parity workflows
- 更紧的章节元数据与 parity 工作流

Do not move to plugin or MCP as a default next step yet.
当前不要把 plugin 或 MCP 当成默认下一步。

Re-evaluate after the repository reaches the next real-content scale threshold.
等仓库达到下一档真实内容规模后，再重新评估。
