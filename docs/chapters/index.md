# Chapter Index
# 章节索引

This directory tracks chapter-level planning documents for real remake slices.
这个目录用于跟踪真实复刻切片的章节级计划文档。

## Status Values
## 状态值

- `planned`: scope exists but import work has not started
- `planned`：已定义范围，但尚未开始导入
- `importing`: source, importer, or manual assembly is in progress
- `importing`：source、导入器或 manual 组装进行中
- `validating`: content can load, and validation or runtime checking is underway
- `validating`：内容已能加载，正在做校验或运行时核对
- `parity-review`: parity and regression review are active, but divergences remain
- `parity-review`：正在做 parity 与 regression 审核，但仍存在差异
- `locked`: the slice meets current lock criteria
- `locked`：该切片已满足当前锁定标准

## Files
## 文件

- [chapter-template.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-template.md): copy this file to create `chapter-xx-plan.md`
- [chapter-template.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-template.md)：复制此文件以创建 `chapter-xx-plan.md`
- [chapter-factory-template.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapter-factory-template.md): execution workflow reference
- [chapter-factory-template.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapter-factory-template.md)：执行工艺参考

## Workflow Commands
## 工作流命令

- `npm run chapter-bootstrap -- --id <chapter-id> --title "<title>" --area "<area>"`
- `npm run chapter-bootstrap -- --id <chapter-id> --title "<title>" --area "<area>"`
- `npm run check:chapter-completeness`
- `npm run check:chapter-completeness`
- `npm run chapter-status-report`
- `npm run chapter-status-report`
- `npm run chapter-lock-checklist -- --id <chapter-id>`
- `npm run chapter-lock-checklist -- --id <chapter-id>`

## Current Chapter Records
## 当前章节记录

- `chapter-01-lou-sang`: first real slice, currently `parity-review`
- `chapter-01-lou-sang`：第一段真实切片，当前状态为 `parity-review`
- `chapter-02-east-road-relay`: second real slice, currently `validating`
- `chapter-02-east-road-relay`：第二段真实切片，当前状态为 `validating`
- `chapter-03-river-ford`: third real slice, currently `validating`
- `chapter-03-river-ford`：第三段真实切片，当前状态为 `validating`
- `chapter-04-ridgeway-camp`: fourth real slice, currently `validating`
- `chapter-04-ridgeway-camp`：第四段真实切片，当前状态为 `validating`
- `chapter-05-highland-waystation`: fifth real slice, currently `validating`
- `chapter-05-highland-waystation`：第五段真实切片，当前状态为 `validating`

## Working Files
## 工作文件

- [chapter-02-east-road-relay-plan.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-02-east-road-relay-plan.md): execution plan for the second real slice
- [chapter-02-east-road-relay-plan.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-02-east-road-relay-plan.md)：第二段真实切片的执行计划
- [chapter-02-east-road-relay-lock-report.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-02-east-road-relay-lock-report.md): current lock and divergence report for the second real slice
- [chapter-02-east-road-relay-lock-report.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-02-east-road-relay-lock-report.md)：第二段真实切片当前的锁定与差异报告
- [chapter-03-river-ford-plan.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-03-river-ford-plan.md): execution plan for the third real slice
- [chapter-03-river-ford-plan.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-03-river-ford-plan.md)：第三段真实切片的执行计划
- [chapter-03-river-ford-lock-report.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-03-river-ford-lock-report.md): current lock and divergence report for the third real slice
- [chapter-03-river-ford-lock-report.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-03-river-ford-lock-report.md)：第三段真实切片当前的锁定与差异报告
- [chapter-04-ridgeway-camp-plan.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-04-ridgeway-camp-plan.md): execution plan for the fourth real slice, including tool gain notes
- [chapter-04-ridgeway-camp-plan.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-04-ridgeway-camp-plan.md)：第四段真实切片的执行计划，内含工具收益记录
- [chapter-04-ridgeway-camp-lock-report.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-04-ridgeway-camp-lock-report.md): current lock, divergence, and tool-stability report for the fourth real slice
- [chapter-04-ridgeway-camp-lock-report.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-04-ridgeway-camp-lock-report.md)：第四段真实切片当前的锁定、差异与工具稳定性报告
- [chapter-05-highland-waystation-plan.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-05-highland-waystation-plan.md): execution plan for the fifth real slice, including dual-track notes
- [chapter-05-highland-waystation-plan.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-05-highland-waystation-plan.md)：第五段真实切片的执行计划，内含双轨模式说明
- [chapter-05-highland-waystation-lock-report.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-05-highland-waystation-lock-report.md): current lock, divergence, and dual-track report for the fifth real slice
- [chapter-05-highland-waystation-lock-report.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-05-highland-waystation-lock-report.md)：第五段真实切片当前的锁定、偏差与双轨报告
- `chapter-05-highland-waystation-visual-replacement-backlog.md`: chapter-local visual replacement backlog for placeholder-managed assets
- `chapter-05-highland-waystation-visual-replacement-backlog.md`：按章节维护的视觉替换 backlog，用于管理 placeholder 资产

The matching chapter metadata lives in `content/manual/chapters/`.
对应的章节元数据位于 `content/manual/chapters/`。
