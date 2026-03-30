# Chapter 04 Ridgeway Camp Lock Report
# Chapter 04 Ridgeway Camp 锁定报告

## Scope
## 范围

- Chapter id: `chapter-04-ridgeway-camp`
- Title: Ridgeway Camp Advance
- Area label: Ridgeway West Pass, Ridgeway Watch, and Ridgeway Camp Slice
- Metadata status: `validating`

## Current Status
## 当前状态

- Lock result: not locked yet
- 锁定结果：尚未锁定
- Reason: the fourth slice is now imported and playable, but dialogue, shop inventory, and reward details still need original-reference verification
- 原因：第四个切片已经导入并可运行，但对白、商店货表和奖励细节仍需和原始参考资料核对

## Verified Now
## 当前已验证

- Chapter bootstrap scaffold was reused instead of hand-copying metadata and docs
- 章节骨架直接复用了 chapter bootstrap，而不是手工复制 metadata 和文档
- `ridgeway-west-pass`, `ridgeway-watch`, and `ridgeway-camp` are connected in the shared world runtime
- `ridgeway-west-pass`、`ridgeway-watch` 和 `ridgeway-camp` 已经在共享 world runtime 中连通
- Imported events, encounters, shop flow, and chest flow all run through the shared interpreter and existing UI paths
- 导入的事件、遭遇战、商店流程和宝箱流程都继续走共享解释器和现有 UI 路径
- Chapter reports can now be regenerated through completeness, parity, text, asset, UI, discrepancy, and lock-checklist commands
- 当前章节已经可以通过 completeness、parity、text、asset、UI、discrepancy 和 lock-checklist 命令重新生成报告

## Tool Gain Record
## 工具收益记录

- Faster:
- 更快的步骤：
  - metadata, plan, and lock scaffolds already existed from `chapter-bootstrap`
  - `chapter-bootstrap` 已提前生成 metadata、plan 和 lock 骨架
  - `chapter-status-report` and `chapter-lock-checklist` reduced repetitive chapter-summary writing
  - `chapter-status-report` 和 `chapter-lock-checklist` 减少了重复写章节摘要的工作
  - `check:chapter-completeness` immediately highlighted chapter ownership drift after the new links landed
  - `check:chapter-completeness` 在新连通关系接入后能立刻指出章节归属漂移
- Still manual:
- 仍然手工的步骤：
  - shaping the exact map scope and progression node for the new slice
  - 为新切片定义精确地图范围和剧情推进节点
  - writing curated Chinese dialogue and event text
  - 编写人工整理版中文对白和事件文本
  - assembling runtime-ready maps into `world.content.json`
  - 把可运行地图手工组装进 `world.content.json`
- Not stable enough yet:
- 还不够稳定的工具点：
- no single command yet turns source map staging into final runtime world assembly
- 目前还没有单条命令能把 source 地图 staging 直接变成最终 runtime world 组装
- cross-chapter boundary ownership still needs manual interpretation in completeness reports
- completeness 报告里的跨章节边界归属仍需要人工判断
- reports that read `reports/regression/latest` still need to run after `regression-smoke`, not beside it
- 读取 `reports/regression/latest` 的报告命令目前仍需要在 `regression-smoke` 之后再跑，不能和它并行

## Remaining Divergences
## 当前剩余偏差

- `ridgeway-camp-shop` inventory and price table are still curated instead of source-verified
- `ridgeway-camp-shop` 的货物和价格表目前仍是人工整理版，还不是原始资料核对后的结果
- `ridgeway-cache-event` reward is structurally correct, but the final reward item is not yet source-verified
- `ridgeway-cache-event` 的一次性奖励逻辑已经正确，但最终奖励物仍未完成原始资料核对
- Gate progression is currently flag-driven without a visible gate-state art change
- 当前岗亭放行仍是 flag 驱动，还没有可见的门禁美术变化

## Next Actions
## 下一步动作

1. Verify chapter-04 dialogue, shop table, and cache reward against source references.
1. 根据原始参考资料核对第 04 章对白、商店表和木箱奖励。
2. Keep the current regression cases and discrepancy backlog updated as chapter-04 parity improves.
2. 随着第 04 章 parity 提升，继续维护当前 regression cases 和 discrepancy backlog。
3. Consider whether the map importer should grow a final-world assembly helper, because this remains the slowest manual step.
3. 评估地图导入器是否要补最终 world 组装辅助，因为这仍然是最慢的手工步骤。
