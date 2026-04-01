# Character Sprite Reconstruction
# 角色精灵重建流程

## Goal
## 目标

Reconstruct character-facing sprite resources for the hero and NPCs when the original sprite sheet is unavailable.
在没有原始 sprite sheet 的情况下，为主角和 NPC 重建可用的朝向与基础步行动画资源。

This workflow currently targets:
当前流程先覆盖：

- one standing frame per facing
- 每个朝向至少一个站立帧
- minimal walk slots `walkA` and `walkB`
- 最小步行动画槽位 `walkA` 和 `walkB`
- stable anchor, pivot, and bounding box rules
- 稳定的 anchor、pivot 和 bounding box 规则

## Source Of Truth
## 事实来源

- reference entries: `content/reference/manifest.json`
- reference 条目：`content/reference/manifest.json`
- sprite candidates: `content/reference/sprites/character-sprite-candidates.json`
- 精灵候选清单：`content/reference/sprites/character-sprite-candidates.json`
- generated metadata: `content/generated/character-sprite-metadata.generated.json`
- 生成的元数据：`content/generated/character-sprite-metadata.generated.json`
- runtime attachment: `content/manual/asset-registry.content.json`
- 运行时接线：`content/manual/asset-registry.content.json`

## Candidate Format
## 候选格式

Each candidate records:
每个 candidate 记录：

- `id`
- `chapterId`
- `mapIds`
- `logicalAssetKey`
- `familyId`
- `status`
- `frameWidth` / `frameHeight`
- `anchor`
- `pivot`
- `boundingBox`
- `referenceIds`
- `directions.up|down|left|right`
- `notes`

Each facing records 3 slots:
每个朝向记录 3 个槽位：

- `stand`
- `walkA`
- `walkB`

Each slot records:
每个槽位记录：

- `frameId`
- `referenceId` optional
- `status`

## Validation Rules
## 校验规则

The current tool checks:
当前工具会检查：

- duplicate candidate ids
- candidate id 重复
- duplicate logical asset keys
- logical asset key 重复
- missing reference ids
- 缺失 reference id
- frame size against current visual spec `16x16`
- 帧尺寸是否符合当前视觉规格 `16x16`
- anchor inside frame bounds
- anchor 是否位于帧范围内
- pivot inside frame bounds
- pivot 是否位于帧范围内
- bounding box inside frame bounds
- bounding box 是否位于帧范围内
- missing standing frames for imported candidates
- 已导入 candidate 是否缺失站立帧

## Runtime Attachment
## 运行时接入

Character sprite candidates do not go directly into scenes.
角色精灵 candidate 不会直接写进 scene。

They attach through logical asset keys such as:
它们通过逻辑资源 key 接入，例如：

- `npc.guard`
- `npc.merchant`
- `npc.guide`

The current runtime bridge uses `sprite-frame` asset resources.
当前运行时桥接方式是 `sprite-frame` 资源。

If real pixel sheets do not exist yet, the world scene still renders a deterministic frame proxy instead of scene-local hardcoded colors.
如果真实像素图还不存在，world scene 仍会渲染统一的 frame proxy，而不是 scene 本地硬编码颜色。

## Commands
## 命令

- `npm run character-sprite-reconstruct`
  Validates the candidate manifest, writes generated sprite metadata, and writes the current reconstruction report.
- `npm run character-sprite-reconstruct`
  校验 candidate manifest，生成 sprite metadata，并输出当前重建报告。

## Current Baseline
## 当前基线

The first attached character sprite slice is:
当前第一批已接入运行时的角色精灵切片是：

- `chapter-01-lou-sang`
- `npc.guard`
- `npc.merchant`
- `npc.guide`

These three NPCs already resolve through the character sprite reconstruction workflow instead of plain `world-placeholder` bindings.
这 3 个 NPC 现在已经通过 character sprite reconstruction workflow 解析，而不是继续使用纯 `world-placeholder` 绑定。

## Lock Criteria
## 锁定标准

A character family should not move to `locked` until:
一个角色 family 在满足以下条件前，不应升级到 `locked`：

1. all currently used facings have non-placeholder `stand` frames
1. 当前实际使用到的所有朝向都已有非 placeholder 的 `stand` 帧
2. anchor, pivot, and bounding box pass validation
2. anchor、pivot 和 bounding box 校验通过
3. at least the minimum walk slots are defined, even if some remain placeholder
3. 至少已定义最小步行动画槽位，即使部分仍为 placeholder
4. runtime attachment is through asset registry rather than scene-local paths
4. 运行时通过 asset registry 接入，而不是 scene 本地路径
5. parity review is completed against reference material
5. 已基于 reference 资料完成一致性审查
