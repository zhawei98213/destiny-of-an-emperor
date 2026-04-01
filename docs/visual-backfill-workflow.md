# Visual Backfill Workflow
# 视觉回填工作流

## Goal
## 目标

Backfill placeholder visuals for already imported chapters without changing gameplay logic, content flow, or scene-local file paths.
在不修改 gameplay 逻辑、内容流程或 scene 本地文件路径的前提下，为已导入章节回填占位视觉资源。

This workflow exists for locked or lock-near chapters that already have working gameplay loops.
这套流程用于已经具备可玩闭环的已锁定或接近锁定章节。

## Hard Boundary
## 强制边界

- Asset registry is the only replacement entry point.
- asset registry 是唯一的替换入口。
- Do not change gameplay code just to swap one chapter's visuals.
- 不得为了替换某一章视觉资源而修改 gameplay 代码。
- Do not bypass chapter-local overrides with scene-local colors, file paths, or DOM styling.
- 不得通过 scene 本地颜色、文件路径或 DOM 样式绕过章节级 override。
- Every replacement batch must be reversible by removing the chapter override or restoring the documented fallback key.
- 每一批替换都必须可以通过删除章节 override 或恢复文档中的 fallback key 回滚。

## Plan Format
## 计划格式

Store plans under `content/manual/visual-backfill/`.
计划文件放在 `content/manual/visual-backfill/` 下。

Required fields:
必填字段：

- `format`: `visual-backfill-plan-v1`
- `planId`
- `chapterId`
- `title`
- `status`: `planned` | `importing` | `validating` | `locked`
- `notes`
- `replacementEntries[]`

Each `replacementEntries[]` item must include:
每个 `replacementEntries[]` 条目必须包含：

- `logicalAssetKey`
- `category`
- `expectedBaseState`
- `targetState`
- `sourceManifestIds`
- `rollback`
- `verification`
- `notes`

Current template:
当前模板：

- [visual-backfill-plan-template.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/manual/visual-backfill/visual-backfill-plan-template.json)

Current completed sample:
当前已完成样例：

- [chapter-01-lou-sang-ui-batch.json](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/content/manual/visual-backfill/chapter-01-lou-sang-ui-batch.json)

## Required Checks
## 必跑检查

Before generating a backfill report, run:
生成回填报告前，先运行：

1. `npm run regression-smoke`
2. `npm run asset-check`
3. `npm run ui-parity`
4. `npm run validate-content`

Then generate the chapter-local backfill evidence:
然后生成章节级回填证据：

1. `npm run visual-backfill-report -- --id <plan-id>`
2. `npm run visual-backfill-checklist -- --id <plan-id>`

## Comparison Rules
## 对比规则

The backfill report compares:
回填报告会对比：

- base registry state before replacement
- 替换前的基础 registry 状态
- effective chapter override state after replacement
- 替换后的章节 override 生效状态
- required regression cases
- 必要的 regression case
- UI parity findings that are layout-related versus behavior-related
- UI parity 中“布局相关”和“行为相关”的差异

This is enough to answer:
这足以回答：

- did gameplay regress
- gameplay 是否退化
- did UI layout drift
- UI 是否发生错位
- did collision, portal, or interaction loops break
- 碰撞、切图或交互闭环是否被破坏

## Chapter Checklist
## 章节清单

Each chapter batch must produce a checklist with these gates:
每个章节批次都必须生成包含以下门槛的 checklist：

1. registry-only replacement path
1. 仅通过 registry 替换
2. explicit rollback path
2. 明确的回滚路径
3. gameplay regressions still green
3. gameplay 回归仍为绿色
4. UI has no layout-specific divergence
4. UI 没有布局类差异
5. collision / portal / interaction loops remain intact
5. 碰撞 / 切图 / 交互闭环仍然完整

## Current Proven Batches
## 当前已验证批次

The first proven batch is `chapter-01-lou-sang-ui-batch`.
第一个已验证批次是 `chapter-01-lou-sang-ui-batch`。

Scope:
范围：

- `ui.dialogue-box`
- `ui.menu-overlay`
- `ui.shop-overlay`
- `ui.battle-panel`
- `icon.dialogue-pointer`
- `icon.menu-cursor`
- `icon.shop-pointer`
- `icon.battle-cursor`
- `icon.item-basic`
- `icon.system-save`

The first full visual pilot is `chapter-01-lou-sang-visual-pilot`.
第一个完整视觉试点是 `chapter-01-lou-sang-visual-pilot`。

Its scope proves one registry-only replacement loop for:
它证明了一条只通过 registry 生效的完整替换闭环，覆盖：

- `tileset.town`
- `npc.guard`
- `npc.merchant`
- `npc.guide`
- `ui.dialogue-box`

Use `npm run visual-parity-score -- --id chapter-01-lou-sang-visual-pilot` to capture the before/after score delta for that pilot.
可通过 `npm run visual-parity-score -- --id chapter-01-lou-sang-visual-pilot` 记录该试点的替换前后评分变化。

## Done Criteria
## 完成标准

A visual backfill batch is considered complete only when:
只有满足以下条件，视觉回填批次才算完成：

1. every replacement entry is active through chapter-local asset overrides
1. 每个替换条目都已经通过章节级 asset override 生效
2. rollback is documented and mechanically simple
2. 回滚路径已文档化且机械上简单可执行
3. required regression cases still pass
3. 规定的 regression case 仍然通过
4. UI parity shows no layout-specific divergence for the chapter
4. 该章节的 UI parity 没有布局类差异
5. `docs/asset-parity.md` is updated to reflect the new effective state
5. `docs/asset-parity.md` 已更新并反映新的有效状态
