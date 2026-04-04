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
- `npm run batch-chapter-bootstrap -- --id <chapter-id> --title "<title>" --area "<area>"`
- `npm run batch-chapter-bootstrap -- --id <chapter-id> --title "<title>" --area "<area>"`
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
- `chapter-06-border-fort`: sixth real slice, currently `validating`
- `chapter-06-border-fort`：第六段真实切片，当前状态为 `validating`
- `chapter-07-forward-camp`: seventh real slice, currently `validating`
- `chapter-07-forward-camp`：第七段真实切片，当前状态为 `validating`
- `chapter-08-bridgehead-post`: eighth real slice, currently `validating`
- `chapter-08-bridgehead-post`：第八段真实切片，当前状态为 `validating`
- `chapter-09-river-watch-post`: ninth real slice, currently `validating`
- `chapter-09-river-watch-post`：第九段真实切片，当前状态为 `validating`
- `chapter-10-marsh-outpost`: tenth real slice, currently `validating`
- `chapter-10-marsh-outpost`：第十段真实切片，当前状态为 `validating`
- `chapter-11-reed-ferry`: eleventh real slice, currently `validating`
- `chapter-11-reed-ferry`：第十一段真实切片，当前状态为 `validating`

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
- [chapter-06-border-fort-plan.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-06-border-fort-plan.md): execution plan for the sixth real slice, including east-boundary reuse notes
- [chapter-06-border-fort-plan.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-06-border-fort-plan.md)：第六段真实切片的执行计划，内含东向边界复用说明
- [chapter-06-border-fort-lock-report.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-06-border-fort-lock-report.md): current lock, divergence, and function-point report for the sixth real slice
- [chapter-06-border-fort-lock-report.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-06-border-fort-lock-report.md)：第六段真实切片当前的锁定、偏差与功能点报告
- `chapter-06-border-fort-visual-replacement-backlog.md`: chapter-local visual replacement backlog and new reference-gap tracker for chapter-06
- `chapter-06-border-fort-visual-replacement-backlog.md`：chapter-06 的章节级视觉替换 backlog 与新增参考缺口跟踪
- [chapter-07-forward-camp-plan.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-07-forward-camp-plan.md): execution plan for the seventh real slice, including scripted gate-flow notes
- [chapter-07-forward-camp-plan.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-07-forward-camp-plan.md)：第七段真实切片的执行计划，内含 scripted gate-flow 说明
- [chapter-07-forward-camp-lock-report.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-07-forward-camp-lock-report.md): current lock, divergence, and dual-track report for the seventh real slice
- [chapter-07-forward-camp-lock-report.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-07-forward-camp-lock-report.md)：第七段真实切片当前的锁定、偏差与双轨报告
- `chapter-07-forward-camp-visual-replacement-backlog.md`: chapter-local visual replacement backlog and reference gap tracker for chapter-07
- `chapter-07-forward-camp-visual-replacement-backlog.md`：chapter-07 的章节级视觉替换 backlog 与参考缺口跟踪
- `chapter-07-forward-camp-battle-parity-notes.md`: chapter-local battle parity notes for the reused outlaw slice
- `chapter-07-forward-camp-battle-parity-notes.md`：chapter-07 复用乱兵战切片的章节级 battle parity 说明
- [chapter-08-bridgehead-post-plan.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-08-bridgehead-post-plan.md): execution plan for the eighth real slice, including batch bootstrap and bridgehead stitching notes
- [chapter-08-bridgehead-post-plan.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-08-bridgehead-post-plan.md)：第八段真实切片的执行计划，内含 batch bootstrap 与桥头拼接说明
- [chapter-08-bridgehead-post-lock-report.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-08-bridgehead-post-lock-report.md): current lock, divergence, and bridgehead closure report for the eighth real slice
- [chapter-08-bridgehead-post-lock-report.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-08-bridgehead-post-lock-report.md)：第八段真实切片当前的锁定、偏差与桥头闭环报告
- `chapter-08-bridgehead-post-visual-replacement-backlog.md`: chapter-local visual replacement backlog and reference gap tracker for chapter-08
- `chapter-08-bridgehead-post-visual-replacement-backlog.md`：chapter-08 的章节级视觉替换 backlog 与参考缺口跟踪
- `chapter-08-bridgehead-post-battle-parity-notes.md`: chapter-local battle parity notes for the bridge-road outlaw slice
- `chapter-08-bridgehead-post-battle-parity-notes.md`：chapter-08 桥头前路乱兵战切片的章节级 battle parity 说明
- [chapter-09-river-watch-post-plan.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-09-river-watch-post-plan.md): execution plan for the ninth real slice, including standardized gate-chain reuse notes
- [chapter-09-river-watch-post-plan.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-09-river-watch-post-plan.md)：第九段真实切片的执行计划，内含标准化 gate-chain 复用说明
- [chapter-09-river-watch-post-lock-report.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-09-river-watch-post-lock-report.md): current lock, divergence, and standardized pattern report for the ninth real slice
- [chapter-09-river-watch-post-lock-report.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-09-river-watch-post-lock-report.md)：第九段真实切片当前的锁定、偏差与标准化模式报告
- `chapter-09-river-watch-post-visual-replacement-backlog.md`: chapter-local visual replacement backlog and reference gap tracker for chapter-09
- `chapter-09-river-watch-post-visual-replacement-backlog.md`：chapter-09 的章节级视觉替换 backlog 与参考缺口跟踪
- `chapter-09-river-watch-post-battle-parity-notes.md`: chapter-local battle parity notes for the east-bank outlaw slice
- `chapter-09-river-watch-post-battle-parity-notes.md`：chapter-09 河岸前路乱兵战切片的章节级 battle parity 说明
- [chapter-10-marsh-outpost-plan.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-10-marsh-outpost-plan.md): execution plan for the tenth real slice, including marsh-side gate-chain reuse notes
- [chapter-10-marsh-outpost-plan.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-10-marsh-outpost-plan.md)：第十段真实切片的执行计划，内含沼泽侧 gate-chain 复用说明
- [chapter-10-marsh-outpost-lock-report.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-10-marsh-outpost-lock-report.md): current lock, divergence, and throughput report for the tenth real slice
- [chapter-10-marsh-outpost-lock-report.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-10-marsh-outpost-lock-report.md)：第十段真实切片当前的锁定、偏差与吞吐报告
- `chapter-10-marsh-outpost-visual-replacement-backlog.md`: chapter-local visual replacement backlog and reference gap tracker for chapter-10
- `chapter-10-marsh-outpost-visual-replacement-backlog.md`：chapter-10 的章节级视觉替换 backlog 与参考缺口跟踪
- `chapter-10-marsh-outpost-battle-parity-notes.md`: chapter-local battle parity notes for the marsh-road outlaw slice
- `chapter-10-marsh-outpost-battle-parity-notes.md`：chapter-10 沼泽前路乱兵战切片的章节级 battle parity 说明
- [chapter-11-reed-ferry-plan.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-11-reed-ferry-plan.md): execution plan for the eleventh real slice, including ferry handoff reuse notes
- [chapter-11-reed-ferry-plan.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-11-reed-ferry-plan.md)：第十一段真实切片的执行计划，内含渡口交接模式复用说明
- [chapter-11-reed-ferry-lock-report.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-11-reed-ferry-lock-report.md): current lock, divergence, and ferry-route throughput report for the eleventh real slice
- [chapter-11-reed-ferry-lock-report.md](/Users/zha/Documents/CodeSpaces/gptAI/destiny-of-an-emperor/docs/chapters/chapter-11-reed-ferry-lock-report.md)：第十一段真实切片当前的锁定、偏差与渡口路线吞吐报告
- `chapter-11-reed-ferry-visual-replacement-backlog.md`: chapter-local visual replacement backlog and reference gap tracker for chapter-11
- `chapter-11-reed-ferry-visual-replacement-backlog.md`：chapter-11 的章节级视觉替换 backlog 与参考缺口跟踪
- `chapter-11-reed-ferry-battle-parity-notes.md`: chapter-local battle parity notes for the reed-ferry outlaw slice
- `chapter-11-reed-ferry-battle-parity-notes.md`：chapter-11 芦渡前路乱兵战切片的章节级 battle parity 说明

The matching chapter metadata lives in `content/manual/chapters/`.
对应的章节元数据位于 `content/manual/chapters/`。
