# Chapter 02 Lock Report
# 第 02 章锁定报告

## Scope
## 范围

- Chapter id: `chapter-02-east-road-relay`
- Maps: `east-road`, `relay-post`
- Entry: `field-east-road-event` from `field`
- Core runtime loop: field -> east-road -> relay-post -> east-road -> field

## Current Status
## 当前状态

- Chapter metadata status: `validating`
- Lock result: not locked yet
- Reason: runtime loop and regression are in place, but dialogue and reward details are still curated instead of source-verified

## Verified Now
## 当前已验证

- Chapter maps load through the shared world runtime
- Portal and warp links are valid
- NPC placement is runtime-visible
- `relay-rest-event` restores party state through the shared interpreter
- `relay-cache-event` gives an item once and persists state
- East-road encounter region reuses the existing battle loop and returns to world correctly

## Remaining Divergences
## 当前剩余偏差

- Dialogue text is curated, not yet verified against original source transcription
- Relay cache reward is curated, not yet verified against original item notes
- Relay post is currently a restore point, not a verified original shop slice

## Runtime Pressure Compared With Chapter 01
## 相比第一真实区域新增的运行时压力

- Two-hop map traversal now spans `field -> east-road -> relay-post`, so map connectivity is no longer a single boundary hop
- The same chapter now mixes event warp entry, portal return paths, NPC interaction, chest state, and area encounter behavior in one slice
- Chapter-level tracking now has to describe a slice that starts from a previous chapter map boundary instead of a self-contained town gate

## Next Actions
## 下一步动作

1. Verify chapter-02 dialogue lines from original reference text and replace curated wording where needed.
1. 根据原始参考文本核对第 02 章对白，并在需要时替换当前人工整理文本。
2. Verify the relay cache reward from source notes before marking item parity as locked.
2. 先根据原始资料核对驿站木箱奖励，再把物品一致性标为锁定。
3. Decide whether a real relay shop exists in source material; if yes, import it as a separate bounded event slice.
3. 确认原始资料里驿站是否存在真实商店；若存在，再把它作为独立事件切片导入。
