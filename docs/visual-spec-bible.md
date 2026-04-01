# Visual Spec Bible
# 视觉规格手册

## Purpose
## 目的

This document turns “looks identical” into an executable visual specification for reconstruction work.
本文把“长得一模一样”拆成可执行的视觉规格，供后续资源重建任务直接引用。

It is intentionally limited to rules that can be checked against the current runtime, asset parity,
and reference pipeline.
它只写当前运行时、asset parity 和 reference pipeline 可以支撑的可检查规则。

Each section includes:
每一项都包含：

- current spec
- 当前规格
- status: `confirmed` or `pending-reference`
- 状态：`confirmed` 或 `pending-reference`
- validation method
- 验证方式

## 1. Target Resolution And Pixel Grid
## 1. 目标分辨率与像素栅格

### Spec / 规格

- Base runtime resolution is `640 x 360`.
- 基础运行时分辨率为 `640 x 360`。
- Rendering must stay on an integer-like pixel grid with `pixelArt: true`.
- 渲染必须保持像素风格，`pixelArt: true` 不得关闭。
- Runtime scaling should use `Phaser.Scale.FIT` plus centered letterboxing.
- 运行时缩放应使用 `Phaser.Scale.FIT` 与居中适配。

### Status / 状态

- `confirmed`
- `已确定`

### Validation / 验证方式

- Inspect [sceneRegistry.ts](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/game/src/core/sceneRegistry.ts).
- 检查 [sceneRegistry.ts](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/game/src/core/sceneRegistry.ts)。
- Verify `width=640`, `height=360`, `pixelArt=true`, `scale.mode=FIT`.
- 验证 `width=640`、`height=360`、`pixelArt=true`、`scale.mode=FIT`。

## 2. Tile Size
## 2. Tile 尺寸

### Spec / 规格

- World tiles are currently `16 x 16`.
- 当前 world tile 尺寸为 `16 x 16`。
- New world map content must keep `tileWidth=16` and `tileHeight=16` unless a deliberate runtime migration is approved.
- 新 world 地图内容必须保持 `tileWidth=16`、`tileHeight=16`，除非明确批准运行时迁移。
- Collision, portal rectangles, spawn points, and NPC placement are all defined on the same 16px grid.
- 碰撞、portal 矩形、出生点和 NPC 摆位都基于同一套 16px 网格。

### Status / 状态

- `confirmed`
- `已确定`

### Validation / 验证方式

- Inspect [sprite-metadata.generated.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/generated/sprite-metadata.generated.json).
- 检查 [sprite-metadata.generated.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/generated/sprite-metadata.generated.json)。
- Inspect loaded map definitions in [world.content.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/manual/world.content.json).
- 检查 [world.content.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/manual/world.content.json) 中的地图定义。
- Confirm world rendering still multiplies grid coordinates by `map.tileWidth` and `map.tileHeight` in [renderWorldMap.ts](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/game/src/world/renderWorldMap.ts).
- 确认 [renderWorldMap.ts](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/game/src/world/renderWorldMap.ts) 仍以 `map.tileWidth`、`map.tileHeight` 计算显示位置。

## 3. Sprite Size Classes
## 3. Sprite 尺寸分类

### Spec / 规格

- World-facing character and NPC base frames are currently `16 x 16`.
- 当前面向 world 的角色与 NPC 基础帧为 `16 x 16`。
- Sprite families should be registered by symbolic id, not by scene-local file path.
- sprite family 必须使用符号 id 注册，不得使用 scene 局部文件路径。
- Current practical classes:
  - `world-character`: `16 x 16`
  - `world-npc`: `16 x 16`
  - `ui-portrait`: size not locked yet
  - `enemy-battle`: size not locked yet

- 当前可执行分类：
  - `world-character`：`16 x 16`
  - `world-npc`：`16 x 16`
  - `ui-portrait`：尺寸尚未锁定
  - `enemy-battle`：尺寸尚未锁定

### Status / 状态

- `world-character`: `confirmed`
- `world-npc`: `confirmed`
- `ui-portrait`: `pending-reference`
- `enemy-battle`: `pending-reference`

- `world-character`：`已确定`
- `world-npc`：`已确定`
- `ui-portrait`：`待 reference 校验`
- `enemy-battle`：`待 reference 校验`

### Validation / 验证方式

- Check generated world sprite frames in [sprite-metadata.generated.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/generated/sprite-metadata.generated.json).
- 检查 [sprite-metadata.generated.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/generated/sprite-metadata.generated.json) 中的 world sprite frame。
- Use `npm run asset-check` to verify sprite references stay in content or registry layers.
- 使用 `npm run asset-check` 验证 sprite 引用仍然收敛在内容层或注册层。
- Use `content/reference/manifest.json` to collect portrait and enemy visual references before locking those classes.
- 在锁定 portrait 和 enemy 尺寸前，先用 `content/reference/manifest.json` 收集参考资料。

## 4. Palette And Color Count Strategy
## 4. Palette / 色数策略

### Spec / 规格

- The runtime currently uses symbolic placeholder colors for map tiles and DOM-based UI colors.
- 当前运行时地图 tile 和 UI 仍主要使用符号化占位颜色与 DOM 样式颜色。
- Reconstructed visual assets must target a palette-constrained pixel-art workflow.
- 未来重建资源必须遵循受限调色板的像素美术流程。
- Do not introduce full-color painted assets that bypass palette review.
- 不得引入绕过调色板审查的全彩图绘资源。
- Final palette counts are not locked yet.
- 最终色数上限当前尚未锁定。

### Status / 状态

- strategy: `confirmed`
- exact palette and color count: `pending-reference`

- 策略：`已确定`
- 精确调色板与色数：`待 reference 校验`

### Validation / 验证方式

- Confirm current placeholder map palette usage in [renderWorldMap.ts](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/game/src/world/renderWorldMap.ts).
- 在 [renderWorldMap.ts](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/game/src/world/renderWorldMap.ts) 中确认当前占位地图调色板行为。
- Before locking a palette, attach reference entries under `content/reference/tiles/`, `content/reference/sprites/`, and `content/reference/ui/`.
- 在锁定调色板前，先把参考资料挂到 `content/reference/tiles/`、`content/reference/sprites/`、`content/reference/ui/`。
- Record palette decisions in asset reconstruction tasks and review them through asset parity.
- 在资产重建任务中记录调色板决策，并通过 asset parity 进行审查。

## 5. UI Panel Border Rules
## 5. UI 面板边框规则

### Spec / 规格

- UI panels currently use high-contrast pixel-style borders with solid interior fill.
- 当前 UI 面板使用高对比度、像素风倾向的边框和纯色内底。
- Border thickness should remain visually equivalent to `2px` at base resolution.
- 在基础分辨率下，边框厚度应保持在视觉等效的 `2px`。
- Panel corners may be slightly rounded in the temporary DOM implementation, but final imported assets should prefer squared or near-squared retro corners unless references prove otherwise.
- 当前 DOM 版面板允许轻微圆角，但最终导入的正式面板应优先使用方角或接近方角的复古边角，除非 reference 明确证明不是这样。

### Status / 状态

- border thickness and contrast: `confirmed`
- corner language: `pending-reference`

- 边框厚度与对比关系：`已确定`
- 边角语言：`待 reference 校验`

### Validation / 验证方式

- Inspect [dialogueBox.ts](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/game/src/ui/dialogueBox.ts) and [menuOverlay.ts](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/game/src/ui/menuOverlay.ts).
- 检查 [dialogueBox.ts](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/game/src/ui/dialogueBox.ts) 与 [menuOverlay.ts](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/game/src/ui/menuOverlay.ts)。
- Add panel reference crops through `content/reference/ui/` before locking imported panel assets.
- 在锁定正式 UI panel 资源前，先通过 `content/reference/ui/` 收集 panel 参考裁切。

## 6. Dialogue Box Layout Rules
## 6. 对话框布局规则

### Spec / 规格

- Dialogue box is anchored to the bottom center of the viewport.
- 对话框固定在视口底部居中。
- Width should not exceed `min(92vw, 600px)` in the current responsive overlay.
- 当前响应式 overlay 宽度不应超过 `min(92vw, 600px)`。
- Minimum box height is `112px`.
- 最小高度为 `112px`。
- Layout order is:
  1. speaker line
  2. body text
  3. prompt at bottom-right

- 当前布局顺序为：
  1. 说话者行
  2. 正文
  3. 右下角提示

- Dialogue text must remain data-driven from `story.content.json`.
- 对话正文必须继续由 `story.content.json` 数据驱动。

### Status / 状态

- open position, speaker/body/prompt structure: `confirmed`
- exact padding rhythm and line length parity: `pending-reference`

- 打开位置、speaker/body/prompt 结构：`已确定`
- 精确留白节奏与单行长度一致性：`待 reference 校验`

### Validation / 验证方式

- Inspect [dialogueBox.ts](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/game/src/ui/dialogueBox.ts).
- 检查 [dialogueBox.ts](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/game/src/ui/dialogueBox.ts)。
- Run `npm run ui-parity` and confirm dialogue open/close and typewriter behavior remain matched.
- 执行 `npm run ui-parity`，确认对话框开关与逐字行为仍然匹配。
- Query `dialogue-box` references with `npm run reference-query -- --subject-type ui --subject-id dialogue-box`.
- 使用 `npm run reference-query -- --subject-type ui --subject-id dialogue-box` 查询对话框参考资料。

## 7. Character Facing And Walk Animation Rules
## 7. 角色朝向与步行动画帧规则

### Spec / 规格

- Characters and NPCs must support four-direction facing: up, down, left, right.
- 角色和 NPC 必须支持四方向朝向：上、下、左、右。
- Facing is part of runtime state and content placement rules.
- 朝向属于运行时状态与内容摆位规则的一部分。
- World locomotion currently supports grid movement and facing changes.
- 当前 world 已支持基于网格的移动与朝向变更。
- Walk animation frame counts are not locked yet.
- 步行动画帧数尚未锁定。
- Until locked, every sprite family must at least provide one stable standing frame per required facing used by the current slice.
- 在完全锁定之前，当前切片中每个 sprite family 至少要为已用到的朝向提供稳定站立帧。

### Status / 状态

- four-direction support: `confirmed`
- exact walk frame count and cadence: `pending-reference`

- 四方向支持：`已确定`
- 精确步行动画帧数与节奏：`待 reference 校验`

### Validation / 验证方式

- Inspect world runtime and NPC facing usage in [world.content.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/manual/world.content.json).
- 检查 [world.content.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/manual/world.content.json) 中的角色与 NPC 朝向使用。
- Verify current base frames in [sprite-metadata.generated.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/generated/sprite-metadata.generated.json).
- 检查 [sprite-metadata.generated.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/generated/sprite-metadata.generated.json) 中的当前基础帧。
- Run `npm run character-sprite-reconstruct` to validate facing classification, frame slots, and anchor/pivot consistency against the current reconstruction workflow.
- 执行 `npm run character-sprite-reconstruct`，校验当前重建流程中的朝向分类、帧槽位以及 anchor/pivot 一致性。
- Add directional reference crops before locking animation counts.
- 在锁定动画帧数前，先补对应朝向的 reference 裁切。

## 8. Enemy Sprite Size Rules
## 8. 敌人图尺寸规则

### Spec / 规格

- Enemy battle units must use one dedicated battle-facing size class, separate from 16x16 world sprites.
- 敌方战斗单位必须使用独立的战斗尺寸分类，不能与 16x16 world sprite 混用。
- Enemy sprite dimensions are not yet locked in the current repository.
- 当前仓库中敌方图尺寸尚未锁定。
- Until locked, enemy references should be tracked by enemy id in `content/reference/enemies/` or `content/reference/battle/`.
- 在锁定之前，敌人参考资料应按 enemy id 收口到 `content/reference/enemies/` 或 `content/reference/battle/`。

### Status / 状态

- `pending-reference`
- `待 reference 校验`

### Validation / 验证方式

- Use `npm run battle-parity` to confirm enemy groups and reward behavior are stable before visual lock.
- 在锁定敌图之前，先用 `npm run battle-parity` 确认敌群与奖励行为稳定。
- Add enemy reference entries by `subject_type=enemy`.
- 通过 `subject_type=enemy` 增加敌方 reference 条目。
- Lock dimensions only after at least one real battle slice has enemy reference coverage.
- 至少有一个真实战斗切片具备敌方 reference 覆盖后，才能锁定敌图尺寸。

## 9. Item And Icon Size Rules
## 9. 物品 / 图标尺寸规则

### Spec / 规格

- Inventory and shop data are already typed, but icon rendering is not yet implemented as imported assets.
- 背包与商店数据已经类型化，但图标渲染尚未作为正式导入资源落地。
- Item or icon assets must use one shared icon size class when introduced.
- 物品或图标资源一旦引入，必须使用统一的 icon 尺寸分类。
- Exact icon size is not locked yet.
- 精确 icon 尺寸当前尚未锁定。
- Do not add scene-local icon file paths before a shared icon registry exists.
- 在共享 icon 注册层建立前，不得引入 scene 局部 icon 文件路径。

### Status / 状态

- shared-registry requirement: `confirmed`
- exact size: `pending-reference`

- 共享注册层要求：`已确定`
- 精确尺寸：`待 reference 校验`

### Validation / 验证方式

- Review [asset-parity.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/asset-parity.md) for current icon placeholder state.
- 检查 [asset-parity.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/asset-parity.md) 中当前 icon 占位状态。
- Add icon and item reference crops under `content/reference/ui/` or `content/reference/shops/`.
- 把物品和 icon 的参考裁切补到 `content/reference/ui/` 或 `content/reference/shops/`。
- Validate future icon references through `npm run asset-check`.
- 后续 icon 引用通过 `npm run asset-check` 校验。

## 10. Map Layering And Occlusion Rules
## 10. 地图层级与遮挡表现规则

### Spec / 规格

- Map data must keep layout and collision separate.
- 地图数据必须保持布局层与碰撞层分离。
- Runtime map rendering currently supports ordered tile layers, collision layers, portals, and spawn points.
- 当前运行时地图渲染支持有序 tile layer、collision layer、portal 和 spawn point。
- Occlusion-critical map features should eventually be represented as explicit layers or typed map objects, not scene hacks.
- 需要遮挡关系的地图要素最终应表达为明确图层或类型化地图对象，而不是 scene 特判。
- Current temporary state:
  - tile layers render back-to-front
  - collision is logical, not visual
  - true front-layer occlusion is not locked yet

- 当前临时状态：
  - tile layer 按顺序从后往前绘制
  - collision 是逻辑层，不是视觉层
  - 真正的前景遮挡层尚未锁定

### Status / 状态

- tile-layer ordering: `confirmed`
- true foreground occlusion behavior: `pending-reference`

- tile-layer 顺序：`已确定`
- 真正前景遮挡表现：`待 reference 校验`

### Validation / 验证方式

- Inspect [renderWorldMap.ts](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/game/src/world/renderWorldMap.ts) and map schema validators.
- 检查 [renderWorldMap.ts](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/game/src/world/renderWorldMap.ts) 与地图 schema 校验逻辑。
- Validate layer dimensions and map bounds through `npm run validate-content`.
- 通过 `npm run validate-content` 校验图层尺寸和地图边界。
- Before locking occlusion, attach full-map and cropped tile references to `content/reference/screenshots/` and `content/reference/tiles/`.
- 在锁定遮挡表现前，先把完整地图截图和 tile 裁切参考挂到 `content/reference/screenshots/` 与 `content/reference/tiles/`。

## Implementation Rules
## 实施规则

- Use this document as a constraint source for any asset reconstruction task.
- 任何资产重建任务都应把本文作为约束来源。
- If a spec here is still `pending-reference`, do not silently treat it as locked.
- 如果某项仍是 `pending-reference`，不得默认把它当作已锁定规格。
- When one pending item becomes stable, update this document and the related reference manifest in the same change.
- 当某个待定项稳定后，必须在同一次改动里更新本文和相关 reference manifest。
- Runtime code should consume final assets through registries or content ids, never by reading reference files directly.
- 运行时代码必须通过 registry 或内容 id 消费最终资源，不能直接读取 reference 文件。

## Current Practical Use
## 当前实际用途

This document is ready to guide:
本文当前已经可以直接指导：

- world sprite reconstruction
- world sprite 重建
- dialogue box reconstruction
- 对话框重建
- menu panel reconstruction
- 菜单面板重建
- map tile reconstruction planning
- 地图 tile 重建规划
- enemy and icon reference collection
- 敌图与图标参考采集

It is not yet sufficient to claim final art lock for battle enemies, icons, portrait sizes, or foreground occlusion.
但它还不足以直接声称敌图、图标、头像尺寸或前景遮挡已经达到最终美术锁定状态。
