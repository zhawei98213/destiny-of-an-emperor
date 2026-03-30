# Chapter 03 Lock Report
# 第 03 章锁定报告

## Scope
## 范围

- Chapter id: `chapter-03-river-ford`
- Maps: `relay-east-pass`, `river-ford`, `ford-camp`
- Entry: `relay-post-east-event` from `relay-post`
- Core runtime loop: relay-post -> relay-east-pass -> river-ford -> ford-camp -> river-ford -> relay-east-pass -> relay-post

## Current Status
## 当前状态

- Chapter metadata status: `validating`
- Lock result: not locked yet
- Reason: the runtime loop, progression node, shop, chest, and battle slices are in place, but dialogue, reward, and shop tables are still curated instead of source-verified

## Verified Now
## 当前已验证

- Chapter maps load through the shared world runtime
- Portal and warp links are valid
- `ford-clerk-event` issues the permit item through the shared interpreter
- `ford-guard-event` and `ford-east-crossing-event` form a shared item/flag progression gate without scene-specific branches
- `camp-quartermaster-event` opens the shop overlay through the shared shop path
- `ford-camp-cache-event` grants supplies once and persists state
- Both encounter regions return to world correctly after battle

## Remaining Divergences
## 当前剩余偏差

- Dialogue text is curated, not yet verified against original source transcription
- `ford-camp-shop` inventory and prices are curated, not yet verified against original shop notes
- `ford-camp-cache-event` reward is curated, not yet verified against original reward notes
- The guard gate is represented by flag state only; there is no bridge-state visual asset yet

## Runtime Pressure Compared With Chapters 01 And 02
## 相比前两章新增的运行时压力

- This is the first slice that combines three connected maps, two encounter tables, one item-gated progression node, one downstream shop, and one one-shot chest in the same chapter
- Progression now depends on both inventory state and flag state across multiple maps, not just one local guard interaction
- Chapter ownership now spans a chain that starts from a previous chapter hub and ends in a downstream camp with its own shop and reward loop

## New Content Patterns
## 新增内容模式

1. Chapter-local permit flow: talk to an NPC, obtain a key item, then use a different NPC plus a tile exit to unlock downstream traversal.
1. 章节内通行证流程：先与 NPC 对话拿到关键物品，再通过另一名 NPC 加地图出口解锁下游区域。
2. Dual encounter usage: one inherited enemy group and one new chapter-specific enemy group coexist in the same slice.
2. 双遭遇表使用：同一切片里同时存在继承的旧敌群和新增的章节敌群。
3. Downstream service map: the final map in the slice owns both a shop interaction and a one-shot reward point.
3. 下游服务地图：切片终点地图同时承载商店交互和一次性奖励点。

## Next Actions
## 下一步动作

1. Verify chapter-03 dialogue lines from original reference text and replace curated wording where needed.
1. 根据原始参考文本核对第 03 章对白，并在需要时替换当前人工整理文本。
2. Verify `ford-camp-shop` and `ford-camp-cache-event` from original notes before marking item and shop parity as locked.
2. 根据原始资料核对 `ford-camp-shop` 和 `ford-camp-cache-event`，再把物品与商店一致性标为锁定。
3. Decide whether a later asset pass should add a visible bridge-state or gate-state presentation for the ford crossing.
3. 决定后续资产阶段是否要为渡口通行补一层可见的桥体或关卡状态表现。
