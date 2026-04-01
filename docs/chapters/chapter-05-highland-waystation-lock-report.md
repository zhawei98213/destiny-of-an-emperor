# Chapter 05 Highland Waystation Lock Report
# Chapter 05 Highland Waystation 锁定报告

## Scope
## 范围

- Chapter id: `chapter-05-highland-waystation`
- Title: Highland Waystation Approach
- Area label: Highland Pass, Waystation Gate, and Supply Court Slice
- Metadata status: `validating`

## Current Status
## 当前状态

- Lock result: not locked yet
- 锁定结果：尚未锁定
- Reason: the fifth slice is now imported and playable, but dialogue, shop inventory, chest reward, and visual replacement items still need source-backed review
- 原因：第五个切片已经导入并可运行，但对白、商店货表、木箱奖励和视觉替换条目仍需结合原始资料继续核对

## Verified Now
## 当前已验证

- Chapter bootstrap scaffold was reused instead of hand-copying metadata and docs
- 章节骨架直接复用了 chapter bootstrap，而不是手工复制 metadata 和文档
- `highland-pass`, `waystation-gate`, and `supply-court` are connected in the shared world runtime
- `highland-pass`、`waystation-gate` 和 `supply-court` 已经在共享 world runtime 中连通
- Imported events, encounters, shop flow, chest flow, and save/load roundtrip all run through shared systems without chapter-specific runtime branches
- 导入的事件、遭遇战、商店流程、宝箱流程以及存档读档往返都继续走共享系统，没有第 5 章专用 runtime 特判
- A dedicated visual replacement backlog now exists for the chapter, so asset parity work no longer needs to block gameplay closure
- 本章已经有独立的 visual replacement backlog，因此资产一致性工作不再需要阻塞 gameplay 闭环
- Current evidence snapshot:
- 当前证据快照：
  - `regression-smoke`: chapter-05 `9/9` passed, repo total `39/39` passed
  - `regression-smoke`：chapter-05 `9/9` 通过，仓库总计 `39/39` 通过
  - `parity-score`: chapter-05 `83/100`, `0` blockers, `10` minor mismatches
  - `parity-score`：chapter-05 `83/100`，`0` 个 blocker，`10` 个 minor mismatch
  - `chapter-status-report`: chapter-05 `status=validating`, completeness `0` error / `0` warning
  - `chapter-status-report`：chapter-05 当前 `status=validating`，completeness 为 `0` error / `0` warning
  - `text-check`: chapter-05 referenced lines `8`, coverage `100%`
  - `text-check`：chapter-05 当前引用对白 `8` 条，覆盖率 `100%`
  - `asset-check`: chapter-05 asset categories are still placeholder-managed, but all current placeholder families now route through the shared registry
  - `asset-check`：chapter-05 的资产分类仍以 placeholder 为主，但当前占位资源家族已经全部通过共享 registry 接线

## Tool Gain Record
## 工具收益记录

- Faster:
- 更快的步骤：
  - `chapter-bootstrap` again removed repetitive scaffold work for the fifth slice
  - `chapter-bootstrap` 再次去掉了第 5 章的重复样板工作
  - existing regression and parity patterns from chapters 03 and 04 could be cloned with small id changes instead of rethinking the workflow
  - 第 03、04 章已经跑通的 regression 和 parity 模式可以直接小改 id 复用，而不必重想流程
  - asset registry made placeholder ownership explicit, which enabled a separate visual backlog without changing scene code
  - asset registry 明确了 placeholder 归属，因此可以单独写 visual backlog，而不用改 scene 代码
- Still manual:
- 仍然手工的步骤：
  - shaping exact chapter handoff and event naming
  - 设计章节交界和事件命名
  - assembling runtime maps in `world.content.json`
  - 在 `world.content.json` 中组装运行时地图
  - writing the chapter-local visual replacement backlog
  - 编写章节级 visual replacement backlog
- Not stable enough yet:
- 还不够稳定的工具点：
  - there is still no one-command bridge from source map staging into final runtime world assembly
  - 目前仍没有一条命令能把 source map staging 直接变成最终 runtime world 组装
  - chapter bootstrap does not yet create a visual backlog scaffold
  - `chapter-bootstrap` 还不会自动生成 visual backlog 骨架
  - source-data to runtime flow for shops remains partly curated
  - 商店 source-data 到 runtime 的链路仍有一部分是 curated

## Remaining Divergences
## 当前剩余偏差

- `waystation-supply-shop` inventory and price table are still curated instead of source-verified
- `waystation-supply-shop` 的货物和价格表目前仍是人工整理版，还不是原始资料核对后的结果
- `supply-cache-event` reward is structurally correct, but the final reward item quantity still needs source verification
- `supply-cache-event` 的一次性奖励逻辑已经正确，但最终奖励内容和数量仍需原始资料核对
- chapter-05 map tilesets and NPC visuals still resolve through placeholder-managed asset registry entries
- chapter-05 的地图 tileset 和 NPC 视觉目前仍通过 placeholder 管理的 asset registry 条目解析
- Gate progression is currently flag-driven without a visible gate-state art change
- 当前驿门放行仍是 flag 驱动，还没有可见的门禁美术变化
- UI parity is still inherited from the shared backlog: chapter-05 itself does not add a new UI blocker, but the repo-level open items for shop flow, battle command flow, and save entry still apply to later polish
- UI parity 目前仍继承共享 backlog：chapter-05 本身没有新增 UI blocker，但仓库级的商店流程、战斗指令流程和存档入口问题仍会影响后续打磨

## Next Actions
## 下一步动作

1. Verify chapter-05 dialogue, shop table, and chest reward against source references.
1. 根据原始参考资料核对第 05 章对白、商店表和补给箱奖励。
2. Start collecting chapter-05 tile and sprite references so the visual replacement backlog can move from planned to importing.
2. 开始采集第 05 章图块和角色参考资料，让 visual replacement backlog 从 planned 进入 importing。
3. Keep regression, discrepancy, and chapter-status reports updated as chapter-05 parity improves.
3. 随着第 05 章 parity 提升，继续维护 regression、discrepancy 和 chapter-status 报告。
