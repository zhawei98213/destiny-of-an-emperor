# Asset Parity
# 资产一致性

## Goal
## 目标

Extend remake parity from logic and event flow into the visible asset layer, but start with management and structural validation instead of trying to perfect art quality in one pass.
把复刻一致性从逻辑与事件层扩展到可见资产层，但第一步先建立管理与结构化校验能力，而不是一次性追求美术完美。

This document defines:
本文定义：

- asset categories
- 资产分类
- asset status values
- 资产状态值
- where asset references should live
- 资源引用应该放在哪里
- how to validate current chapter slices
- 如何校验当前章节切片

## Asset Reference Rules
## 资源引用规则

- Do not scatter literal asset paths across scenes.
- 不要把字面量资源路径散落到 scene 中。
- Asset ids should live in content data or in a dedicated resource registry layer.
- 资源 id 应该统一收敛到内容数据层或专门的资源注册层。
- Runtime-facing logical asset keys now live in `content/manual/asset-registry.content.json`.
- 面向运行时的逻辑资源 key 现在统一放在 `content/manual/asset-registry.content.json`。
- Chapter- or map-specific swaps should go through `assetOverrides`, not scene-local path branches.
- 章节级或地图级资源替换应通过 `assetOverrides` 完成，不能回退到 scene 本地路径分支。
- Current accepted reference points are:
- 当前允许的引用入口有：
  - `content/manual/world.content.json` for NPC sprite ids
  - `content/manual/world.content.json`：NPC sprite id
  - `content/manual/story.content.json` for `portraitId`, `soundId`, and `playSfx.sfxId`
  - `content/manual/story.content.json`：`portraitId`、`soundId` 和 `playSfx.sfxId`
  - `content/manual/asset-registry.content.json` for logical asset bindings, fallback keys, and chapter overrides
  - `content/manual/asset-registry.content.json`：逻辑资源绑定、fallback key 和章节覆盖
  - `content/generated/sprite-metadata.generated.json` as the current generated sprite registry seed
  - `content/generated/sprite-metadata.generated.json`：当前生成式精灵注册种子
- Future real assets should extend these layers instead of introducing scene-local file paths.
- 后续真实资产应继续扩展这些层，而不是重新引入 scene 本地文件路径。

## Asset Categories
## 资产分类

The current parity scope uses these categories:
当前一致性范围使用以下分类：

1. `tilesets`
1. `tilesets`
2. `character sprites`
2. `character sprites`
3. `npc sprites`
3. `npc sprites`
4. `enemy sprites`
4. `enemy sprites`
5. `ui panels`
5. `ui panels`
6. `icons`
6. `icons`
7. `sfx / bgm references`
7. `sfx / bgm references`

## Status Values
## 状态值

- `placeholder`
  The category is still using stand-in rendering, implicit routing, or symbolic ids without backed files or registry entries.
- `placeholder`
  该分类仍在使用占位表现、隐式接线，或仅有符号 id 而没有实际文件或注册项。

- `imported`
  Files or generated metadata exist, but coverage is incomplete or still has unresolved reference gaps.
- `imported`
  已存在文件或生成元数据，但覆盖仍不完整，或还有未解决的引用缺口。

- `validated`
  Current references, files, and generated metadata are structurally consistent.
- `validated`
  当前引用、文件和生成元数据在结构上是一致的。

- `parity-review`
  Structural validation passes, and the category is under original-reference comparison.
- `parity-review`
  结构校验已经通过，当前正在做原始参考资料对照。

- `locked`
  The category is both structurally valid and remake-parity reviewed for the current slice.
- `locked`
  该分类对当前切片既结构有效，也已经完成复刻一致性审查。

## Current Chapter Baseline
## 当前章节基线

Run `npm run asset-check` to regenerate the latest structured report under `reports/asset-parity/latest/`.
执行 `npm run asset-check` 可在 `reports/asset-parity/latest/` 重新生成最新结构化报告。

At the current repository stage, all five imported real chapters still read as mostly `placeholder` on the asset side.
在当前仓库阶段，五个已导入真实章节在资产侧仍然大多处于 `placeholder`。

Main reasons:
主要原因：

- no checked-in sprite sheet image exists at `/assets/sprites/world-demo.png`
- 仓库里还没有真正存在的 `/assets/sprites/world-demo.png` 精灵图
- the asset registry is now in place, but only chapter-01 currently overrides UI panel bindings, so most chapter categories still resolve to shared placeholders
- 资产注册层已经建立，但目前只有 chapter-01 对 UI 面板绑定做了章节覆盖，因此大多章节分类仍解析到共享占位资源
- NPC sprite references are symbolic, but only part of the family list exists in generated metadata
- NPC sprite 引用已经符号化，但 generated metadata 只覆盖了其中一部分 family
- enemy sprites have no registry yet
- 敌方精灵还没有注册层
- UI panels and icons are still code-drawn or absent
- UI 面板与图标仍是代码绘制或尚未建立
- audio ids exist in content, but no audio registry or files exist
- 音频 id 已进入内容层，但还没有音频注册层和实际文件
- the fifth chapter now makes this dual-track policy explicit by keeping a committed visual replacement backlog while gameplay closes first
- 第五章则把这种双轨策略显式化：在 gameplay 先闭环的同时，另行提交视觉替换 backlog

## Validation Commands
## 校验命令

- `npm run asset-check`
  Generates `reports/asset-parity/latest/report.json` and `summary.md`.
- `npm run asset-check`
  生成 `reports/asset-parity/latest/report.json` 和 `summary.md`。

- `npm test -- --run tests/content/assetParity.test.ts`
  Verifies that the checker can at least classify current placeholder state for the real chapters.
- `npm test -- --run tests/content/assetParity.test.ts`
  验证检查器至少能正确识别当前真实章节的占位状态。

## What The Current Checker Covers
## 当前检查器覆盖内容

The current asset checker reports:
当前资产检查器会报告：

- missing resource files
- 缺失的资源文件
- unreferenced generated sprite families
- 未被引用的生成精灵 family
- content references that point to non-existent assets
- 指向不存在资产的内容引用
- asset registry keys that fall back to placeholders
- 回退到占位资源的 asset registry key
- sprite metadata completeness against sprite source metadata
- sprite metadata 相对 sprite source metadata 的完整性
- literal asset path leakage into scenes
- scene 中出现字面量资源路径

## Lock Criteria
## 锁定标准

An asset category for a chapter should not move to `locked` until:
章节资产分类在满足以下条件前，不应升级到 `locked`：

1. structural checks pass for that category
1. 该分类的结构检查已经通过
2. the real files or registry entries exist
2. 真实文件或注册项已经存在
3. placeholder rendering has been removed for the category
3. 该分类的占位渲染已被移除
4. parity review has been performed against original reference material
4. 已完成对原始参考资料的一致性审查

## Next Practical Steps
## 当前最实际的下一步

1. Create a minimal real sprite file layout or resource registry entry so `sprite-metadata.generated.json` no longer points to a missing image.
1. 先建立最小真实精灵文件布局或资源注册项，让 `sprite-metadata.generated.json` 不再指向缺失图片。

2. Add explicit registry coverage for NPC sprite families such as `guide`.
2. 为 `guide` 等 NPC 精灵 family 补齐明确注册覆盖。

3. Expand chapter-level `assetOverrides` beyond chapter-01 so later real slices can swap a batch of UI or NPC visuals without touching scene code.
3. 把章节级 `assetOverrides` 扩展到 chapter-01 之外，让后续真实切片能够在不改 scene 的前提下成批替换 UI 或 NPC 表现。

4. Add an audio registry only when real audio files or real reference ids are ready.
4. 只有当真实音频文件或真实参考 id 准备好之后，再建立音频注册层。

5. Add chapter-03 NPC and map-facing sprite families only through the shared metadata and asset registry path, not through scene-local overrides.
5. 第 03 章新增的 NPC 和地图可见资源也必须继续走共享 metadata 与资产注册层，不能回退到 scene 本地特判。
