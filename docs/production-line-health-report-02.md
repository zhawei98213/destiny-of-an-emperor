# Production Line Health Report 02
# 生产线健康报告 02

## Purpose
## 目的

This document is a mid-cycle health review for the current Route A production line.
It is meant to answer whether chapter throughput is stabilizing, whether visual backfill is
starting to pay off, which systems are still recurring bottlenecks, and what the next execution
focus should be.

本文档是当前 Route A 生产线的一次中期体检。
它用来回答章节吞吐是否已经稳定、视觉回填是否开始产生收益、哪些系统仍在重复形成瓶颈，
以及下一阶段执行重点应该放在哪里。

## Chapter Throughput
## 章节吞吐情况

Current real imported chapter count is `7`:
当前已导入真实章节数为 `7`：

- `chapter-01-lou-sang`
- `chapter-02-east-road-relay`
- `chapter-03-river-ford`
- `chapter-04-ridgeway-camp`
- `chapter-05-highland-waystation`
- `chapter-06-border-fort`
- `chapter-07-forward-camp`

Current fully locked chapter count is `0`.
当前完全锁定章节数为 `0`。

Current interpretation:
当前判断：

- Chapter import throughput is stable enough to keep expanding Route A.
- 章节导入吞吐已经稳定到可以继续扩张 Route A。
- Chapter lock throughput is still slower than chapter import throughput.
- 章节锁定吞吐仍然慢于章节导入吞吐。
- The current line is good at producing playable, saveable, regression-covered slices.
- 当前生产线已经擅长产出“可玩、可存档、可回归”的章节切片。

Latest chapter snapshot:
最近章节快照：

| Chapter | Status | Completeness | Regression | Parity |
| --- | --- | --- | --- | --- |
| `chapter-01-lou-sang` | `parity-review` | `E0/W1` | `8/8 pass` | `75 (3B/7m)` |
| `chapter-02-east-road-relay` | `validating` | `E0/W2` | `5/5 pass` | `76 (1B/9m)` |
| `chapter-03-river-ford` | `validating` | `E0/W1` | `8/8 pass` | `75 (1B/10m)` |
| `chapter-04-ridgeway-camp` | `validating` | `E0/W0` | `8/8 pass` | `76 (1B/10m)` |
| `chapter-05-highland-waystation` | `validating` | `E0/W0` | `9/9 pass` | `83 (0B/10m)` |
| `chapter-06-border-fort` | `validating` | `E0/W0` | `8/8 pass` | `80 (0B/10m)` |
| `chapter-07-forward-camp` | `validating` | `E0/W0` | `7/7 pass` | `83 (0B/10m)` |

## Visual Backfill Status
## 视觉回填情况

Visual backfill is now producing measurable value, but only on selected slices.
视觉回填现在已经开始产生可衡量收益，但目前仍集中在少量切片上。

Confirmed gain:
已确认收益：

- `chapter-01-lou-sang` town center visual pilot is complete.
- `chapter-01-lou-sang` 的镇中心视觉回填试点已经完成。
- Replaced categories in the pilot:
- 试点中已替换的类别：
  - `tileset.town`
  - `npc.guard`
  - `npc.merchant`
  - `npc.guide`
  - `ui.dialogue-box`
- Pilot result:
- 试点结果：
  - visual parity score `20 -> 100`
  - gameplay safe `yes`
  - UI layout safe `yes`
  - interaction safe `yes`

Current limitation:
当前限制：

- Visual backfill is still chapter-local and plan-driven.
- 视觉回填目前仍是章节局部、按计划批次推进。
- Asset parity warnings remain high because most later chapters still rely on placeholder assets.
- 由于后续章节大多数资源仍是 placeholder，所以 asset parity warning 总量仍然很高。
- The workflow is proven, but throughput is not yet broad enough to call visual parity scalable.
- 这条流程已经被证明可行，但吞吐还不足以称为“可规模化视觉回填”。

## Event DSL Stability
## 事件 DSL 稳定性

The event DSL is now stable for current Route A chapter shapes.
事件 DSL 现在已经足以覆盖当前 Route A 的章节形态。

Stable capabilities already in regular use:
已经稳定进入常规使用的能力：

- `dialogue`
- `setFlag`
- `clearFlag`
- `ifFlag`
- `ifNotFlag`
- `ifHasItem`
- `warp`
- `giveItem`
- `removeItem`
- `joinParty`
- `startBattle`
- `playSfx`
- `openShop`
- `restoreParty`
- `movePlayer`
- `facePlayer`
- conditional `elseSteps`

Current assessment:
当前判断：

- No recent real chapter import was blocked by a missing core branching feature.
- 最近几章真实导入已经没有被“缺少核心分支能力”阻塞。
- The latest additions were small, repeated-pattern driven enhancements rather than speculative opcodes.
- 最近新增的能力都属于小型、高频模式驱动的增强，而不是投机式加 opcode。
- The DSL is stable enough for continued chapter importing.
- DSL 已经稳定到足以继续推进章节导入。

Remaining weak point:
剩余薄弱点：

- Longer multi-step cutscene polish is still minimal.
- 更长的多步 cutscene 打磨能力仍然是最小实现。
- This is no longer a main import blocker, but it is still a parity-quality limiter.
- 它已经不是主线导入 blocker，但仍会限制更高层级的剧情一致性。

## Battle System Stability
## 战斗系统稳定性

Battle runtime is stable at the current chapter scale.
战斗系统在当前章节规模下已经稳定。

Confirmed stable areas:
已确认稳定的部分：

- Real battle scenarios can be imported, calibrated, and regression-bound.
- 真实战斗场景已经可以导入、校准并绑定回归。
- Battle parity baseline is running with `4` calibrated cases and no mismatch.
- battle parity 基线当前有 `4` 个已校准 case，且没有 mismatch。
- Battle visual backfill has proven that at least one real battle can swap partial visual assets through the registry.
- battle visual backfill 已证明至少一个真实战斗可以通过 registry 替换部分视觉资源。

Remaining repeated bottlenecks:
仍然重复出现的瓶颈：

- battle UI command selection is still missing
- battle UI confirm/cancel is still missing
- target selection is still hardcoded
- result pacing is still simple compared with the target experience

- battle UI 指令选择仍然缺失
- battle UI 确认/取消仍然缺失
- 目标选择仍是硬编码
- 结果展示节奏仍然比目标体验更简化

Conclusion:
结论：

- Battle data import and parity are stable enough for more chapters.
- battle 数据导入和基础 parity 已经足以支持继续扩章节。
- Battle UI parity is the main remaining combat-side bottleneck.
- battle UI parity 是当前战斗侧最主要的剩余瓶颈。

## High-Priority Backlog
## 高优先 Backlog

Current highest-value backlog remains concentrated in a small set of repeated issues.
当前最高价值 backlog 仍然集中在少数重复出现的问题上。

### P0
### P0

1. `chapter-01-lou-sang:spatial-parity`
   Lock map layout, collision, and NPC placement for the first real chapter.
   锁定第一真实章节的地图结构、碰撞和 NPC 摆位。
2. `chapter-02-east-road-relay:save-restore`
   Add chapter-specific save/load regression coverage.
   补 chapter-specific save/load regression。
3. `chapter-03-river-ford:save-restore`
   Add chapter-specific save/load regression coverage.
   补 chapter-specific save/load regression。
4. `chapter-04-ridgeway-camp:save-restore`
   Add chapter-specific save/load regression coverage.
   补 chapter-specific save/load regression。

### P1
### P1

- battle UI command selection / confirm / cancel / target selection
- battle UI 的指令选择 / 确认 / 取消 / 目标选择
- main-flow event parity cleanup for imported chapters
- 已导入章节的主流程事件一致性收口
- chapter-07-forward-camp main flow closure
- 第 7 章主流程一致性收口

## Next-Stage Goals
## 下一阶段目标

Priority order for the next cycle:
下一阶段优先级顺序：

1. Keep chapter import throughput high through chapter factory and dual-track mode.
1. 继续依赖 chapter factory 和双轨模式保持章节导入吞吐。
2. Batch-fix repeated P0 save-restore and spatial parity debt.
2. 批量修复重复出现的 P0 存档恢复与空间一致性债务。
3. Convert battle UI parity from audit-only into small runtime closures.
3. 把 battle UI parity 从“只审计”推进到小步 runtime 收口。
4. Expand visual backfill from one successful pilot into repeatable chapter batches.
4. 把已成功的视觉试点扩成可重复的章节批次。
5. Push reference packs earlier in each chapter so reconstruction work starts with less drift.
5. 更早生成章节 reference pack，减少后续重建漂移。

## Executive Conclusion
## 执行结论

The production line is stable enough to keep importing new real chapters.
当前生产线已经稳定到可以继续导入新的真实章节。

The production line is **not yet stable enough** to call chapter locking routine.
当前生产线**还没有稳定到**可以把章节锁定当成例行低成本动作。

Visual backfill has started to produce real payoff, but only after the gameplay/content line
has already proven a slice stable.
视觉回填已经开始产生真实收益，但目前仍建立在 gameplay/content 轨先证明章节切片稳定之后。

The next clear productivity win will come from:
下一次最明确的生产率提升会来自：

- reducing repeated save-restore and spatial parity debt
- turning battle UI parity findings into small runtime closures
- making visual backfill batch generation less manual

- 减少重复出现的 save-restore 与空间一致性债务
- 把 battle UI parity 的发现转成小步 runtime 收口
- 进一步减少 visual backfill 批次生成的手工量
