# Back Half Chapter Plan
# 后半程章节计划

## Goal
## 目标

After the front-10 alpha milestone, the next route segment should keep chapter throughput stable while making dependency, reference, and parity risk explicit.
在前 10 区域 Alpha 里程碑之后，后半程路线的目标是继续保持章节吞吐稳定，同时把依赖、reference 和 parity 风险显式化。

This document is the planning board for chapter-11 through chapter-15.
这份文档作为 chapter-11 到 chapter-15 的执行看板。

## 1. Chapter Queue
## 1. 章节队列

| Order | Chapter Id | Working Title | Route Role | Default Pattern |
| --- | --- | --- | --- | --- |
| 11 | `chapter-11-reed-ferry` | Reed Ferry Crossing | bridge between marsh route and inner checkpoint | gate/guard + shop + chest |
| 12 | `chapter-12-inner-ford` | Inner Ford Approach | river crossing staging area | town-lite + battle road |
| 13 | `chapter-13-stone-causeway` | Stone Causeway Watch | narrow checkpoint corridor | gate/guard + scripted checkpoint |
| 14 | `chapter-14-east-ridge-camp` | East Ridge Camp | deeper support outpost | shop + chest + encounter |
| 15 | `chapter-15-frontier-stockade` | Frontier Stockade | back-half cadence validation node | gate/guard + shop + save/load |

## 2. Dependency Graph
## 2. 依赖关系

- `chapter-11-reed-ferry` depends on the east exit of `chapter-10-marsh-outpost`.
- `chapter-11-reed-ferry` 依赖 `chapter-10-marsh-outpost` 的东向出口。
- `chapter-12-inner-ford` depends on chapter-11 opening the ferry or ford checkpoint.
- `chapter-12-inner-ford` 依赖 chapter-11 打开渡口或河渡检查点。
- `chapter-13-stone-causeway` depends on chapter-12 route handoff plus one checkpoint flag or order chain.
- `chapter-13-stone-causeway` 依赖 chapter-12 的路线交接，以及一条 checkpoint flag 或军令链。
- `chapter-14-east-ridge-camp` depends on chapter-13 gate completion and may reuse the current shared outlaw battle slice unless real data forces a split.
- `chapter-14-east-ridge-camp` 依赖 chapter-13 栅门放行完成，并且在真实数据没有迫使拆分前，优先继续复用当前共享乱兵战切片。
- `chapter-15-frontier-stockade` depends on chapter-14 opening the stockade approach and must be used as the first back-half cadence validation checkpoint.
- `chapter-15-frontier-stockade` 依赖 chapter-14 打开前往寨堡的路线，并作为后半程第一阶段节拍验证检查点。

## 3. High-Risk Systems
## 3. 高风险系统

- Cross-chapter portal stitching beyond chapter-10.
- chapter-10 之后继续向东扩张时的跨章 portal 拼接。
- Save/load parity for later slices that are already gameplay-closed but not yet lock-closed.
- 已经 gameplay 闭环、但尚未 lock 收口的后续切片的 save/load parity。
- Battle parity drift if later chapters keep reusing shared battle groups for too long.
- 如果后续章节过久复用共享 battle group，战斗一致性可能会逐步漂移。
- Visual backlog growth outrunning actual backfill throughput.
- visual backlog 的增长速度继续快于真实回填速度。
- Text continuity and naming consistency once more route officials and checkpoint NPCs are added.
- 后续加入更多路线文吏和检查点 NPC 后，文本连续性和命名一致性可能变得脆弱。

## 4. Required Reference Gaps
## 4. 需要补齐的 Reference 缺口

- chapter-10 still lacks high-confidence map, NPC, UI, and battle references.
- chapter-10 仍缺高置信度的地图、NPC、UI 和战斗参考。
- chapter-11 through chapter-15 each need at minimum:
- chapter-11 到 chapter-15 每章至少需要：
  - one map still for every imported map
  - 每张已导入地图至少一张静态参考
  - one NPC standing reference for each new clerk / sentry / merchant role
  - 每个新增文吏 / 守兵 / 商人角色至少一张站立参考
  - one dialogue UI still
  - 一张对话 UI 参考
  - one battle still if the chapter contains a battle
  - 如果该章有战斗，则至少一张战斗参考
- Later chapters should prefer chapter-level frame packs over ad hoc reference entries.
- 后续章节应优先建立章节级 frame pack，而不是零散添加 reference 条目。

## 5. Repeated Patterns And New Patterns
## 5. 预计重复模式与新模式

### Repeated Patterns
### 重复模式

- clerk -> sentry -> gate -> shop -> chest -> encounter
- 文吏 -> 守兵 -> 栅门 -> 商店 -> 宝箱 -> 遭遇战
- two-map route slice with one road map and one interior outpost map
- 一张道路图加一张内部哨所图的双图切片
- one chapter-local save/load regression case
- 一条章节级 save/load 回归 case
- one chapter-local visual replacement backlog
- 一份章节级 visual replacement backlog

### Expected New Patterns
### 预计新模式

- ferry or river-crossing handoff pattern
- 渡口或河渡交接模式
- narrower checkpoint corridor pattern
- 更狭窄的检查点走廊模式
- possible first back-half requirement for a more explicit multi-NPC checkpoint chain
- 后半程可能首次出现更明确的多 NPC 检查点链
- possible need to split the reused outlaw battle into a new chapter-owned variant if parity drifts
- 如果 parity 漂移，可能需要首次把共享乱兵战拆成章节自有变体

## Execution Rules
## 执行规则

- Prefer existing chapter factory, gate/guard, shop, chest, and battle patterns first.
- 优先复用现有 chapter factory、gate/guard、shop、chest 和 battle 模式。
- If a new chapter needs a new pattern, document it before introducing content.
- 如果新章节需要新模式，先把模式抽象出来，再落内容。
- Do not let visual reconstruction block gameplay closure.
- 不要让视觉重建阻塞 gameplay 闭环。
- Keep all new reference work traceable through chapter-level packs and visual replacement backlog files.
- 所有新增 reference 工作都必须通过章节级 pack 和 visual replacement backlog 可追溯。

## Current Read
## 当前判断

- Back-half importing is safe to continue.
- 后半程导入可以继续推进。
- The main risk is not runtime breadth anymore, but accumulated parity and visual debt.
- 当前主要风险已不再是 runtime 广度，而是累计的 parity 和 visual 债务。
