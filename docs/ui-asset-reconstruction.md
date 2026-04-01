# UI Asset Reconstruction
# UI 资产重建流程

## Goal
## 目标

Reconstruct the highest-impact JRPG UI assets through a stable workflow before pursuing full visual completeness.
先通过稳定流程重建最影响 JRPG 观感的 UI 资产，再逐步推进完整视觉一致性。

This workflow currently prioritizes:
当前流程优先覆盖：

- dialogue box
- 对话框
- main menu frame
- 主菜单框
- shop frame
- 商店框
- battle command / battle panel frame
- 战斗指令区 / 战斗面板框
- cursor and pointer glyphs
- 光标和指针字形
- basic icons used by menu and system flows
- 菜单和系统流程会用到的基础图标

## Source Of Truth
## 事实来源

- reference entries: `content/reference/manifest.json`
- reference 条目：`content/reference/manifest.json`
- UI asset manifest: `content/reference/ui/ui-asset-manifest.json`
- UI 资产清单：`content/reference/ui/ui-asset-manifest.json`
- runtime attachment: `content/manual/asset-registry.content.json`
- 运行时接线：`content/manual/asset-registry.content.json`
- visual spec: `docs/visual-spec-bible.md`
- 视觉规格：`docs/visual-spec-bible.md`

## Reconstruction Scope
## 重建范围

This workflow does not attempt a full UI skin replacement in one step.
这个流程不试图一步完成整套 UI 皮肤替换。

It focuses on:
它聚焦于：

- border language and panel silhouette
- 边框语言和面板轮廓
- padding and line-height consistency
- padding 和行高一致性
- pointer and selected-state rules
- 指针和选中态规则
- runtime attachment through logical asset keys
- 通过逻辑资源 key 接入运行时

## Manifest Format
## 清单格式

Each entry records:
每个条目记录：

- `id`
- `logicalAssetKey`
- `type`: `panel | cursor | icon`
- `chapterId`
- `mapIds`
- `state`
- `referenceIds`
- `panelRules` for panel entries
- `glyphRules` for cursor/icon entries
- `notes`

Panel rules currently define:
当前 panel 规则定义：

- `frameMode`
- `borderThickness`
- `cornerSize`
- `paddingX`
- `paddingY`
- `lineHeight`
- `pointerAssetKey`
- `selectedPrefix`
- `selectedSuffix`

## 9-Slice Equivalent Rule
## 9-Slice 等价规则

The current runtime UI uses DOM overlays instead of sprite-based panels.
当前运行时 UI 使用 DOM overlay，而不是基于 sprite 的面板。

Because of that, the first reconstruction bridge uses `frameMode: "nine-slice-css"` as an equivalent rule:
因此第一版重建桥接使用 `frameMode: "nine-slice-css"` 作为等价规则：

- border thickness is explicit
- 明确边框厚度
- corner size is explicit
- 明确角尺寸
- padding is explicit
- 明确 padding
- line height is explicit
- 明确行高
- pointer and selection markers come from logical icon keys
- 指针和选中标记来自逻辑 icon key

This is not a final pixel-perfect renderer.
这不是最终的像素级面板渲染器。

It is the current stable bridge that keeps gameplay code independent from concrete UI resource files.
它是当前最稳定的桥接层，可以让 gameplay 代码脱离具体 UI 资源文件。

## Current Checks
## 当前检查能力

`npm run ui-asset-reconstruct` currently checks:
`npm run ui-asset-reconstruct` 当前会检查：

- duplicate manifest ids
- manifest id 重复
- duplicate logical asset keys inside one chapter
- 同一章节内逻辑资源 key 重复
- missing reference ids
- 缺失 reference id
- missing runtime asset registry bindings
- 缺失运行时 asset registry 绑定
- resource kind mismatch between manifest and registry
- manifest 与 registry 之间的资源类型不匹配
- missing `sourceManifestId` back-links
- 缺失 `sourceManifestId` 回链
- invalid panel rule values such as non-positive border thickness
- 非法 panel 规则值，例如边框厚度不合法

## Runtime Attachment Rule
## 运行时接入规则

Scenes must not hardcode concrete UI asset paths.
scene 不得硬编码具体 UI 资产路径。

UI overlays should consume:
UI overlay 应通过以下方式消费资源：

- `assetRegistry.resolvePanelStyle(...)`
- `assetRegistry.resolveIconGlyph(...)`

This allows later replacement of placeholder or reconstructed assets without changing gameplay logic.
这样后续替换 placeholder 或重建版资源时，不需要改 gameplay 逻辑。

## Current Baseline
## 当前基线

The first reconstructed UI slice is attached to:
第一批已接入的重建 UI 切片包括：

- `chapter-01-lou-sang`
- `ui.dialogue-box`
- `ui.menu-overlay`
- `ui.shop-overlay`
- `ui.battle-panel`
- `icon.dialogue-pointer`
- `icon.menu-cursor`
- `icon.shop-pointer`
- `icon.battle-cursor`

At least the dialogue box and menu overlay now use reconstructed border, padding, line-height, and pointer rules from the shared asset registry.
至少对话框和菜单框现在已经通过共享 asset registry 使用重建后的边框、padding、行高和指针规则。

## Commands
## 命令

- `npm run ui-asset-reconstruct`
  Validates the current UI asset manifest, checks runtime attachment, and writes `reports/ui-asset-reconstruction/latest/`.
- `npm run ui-asset-reconstruct`
  校验当前 UI asset manifest，检查运行时接线状态，并生成 `reports/ui-asset-reconstruction/latest/`。

## Lock Criteria
## 锁定标准

A UI asset slice should not move to `locked` until:
一个 UI 资产切片在满足以下条件前，不应进入 `locked`：

1. manifest validation passes without errors
1. manifest 校验无错误
2. runtime binding exists through the shared asset registry
2. 已通过共享 asset registry 建立运行时绑定
3. panel spacing and pointer behavior have been checked in a real chapter scene
3. 已在真实章节场景里核对面板留白和指针行为
4. UI parity review records any remaining behavioral differences separately from asset shape
4. UI parity 已把剩余行为差异与资源外观差异分开记录
