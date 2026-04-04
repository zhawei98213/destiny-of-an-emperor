# Economy Parity Audit
# 经济一致性审计

This audit keeps chapter economy data reviewable as more real areas are imported. It does not try to fully simulate the original game economy yet. It focuses on traceability, obvious imbalance risks, and whether current imported chapters still expose a clear path for shops, key items, rewards, and drops.
这个审计在更多真实区域导入后，保证章节经济数据仍然可审查。它当前不尝试完整模拟原作经济系统，而是优先关注可追溯性、明显的失衡风险，以及当前已导入章节是否仍然能清楚展示商店、关键物品、奖励和掉落路径。

## Scope
## 范围

- `shop inventory audit`
- `shop inventory audit`
- `item availability by chapter`
- `item availability by chapter`
- `price consistency report`
- `price consistency report`
- `reward/drop sanity check`
- `reward/drop sanity check`

The audit consumes:
该审计读取以下内容：

- `content/manual/world.content.json`
- `content/manual/story.content.json`
- `content/manual/chapters/*.json`
- `content/generated/battle.content.json`

It writes:
它会输出到：

- `reports/economy-parity/latest/report.json`
- `reports/economy-parity/latest/summary.md`

## Checks
## 检查项

### Shop Inventory Audit
### 商店库存审计

- Verifies that every chapter-owned shop resolves to a real shop definition.
- 校验每个章节归属的商店都能解析到真实商店定义。
- Verifies that every listed shop item exists in world item data.
- 校验每个商店条目中的物品都存在于 world item 数据中。
- Records effective price versus base item price.
- 记录实际售价与基础物品价格之间的差值。

### Item Availability By Chapter
### 章节物品流通

- Summarizes which items enter the chapter economy by:
- 汇总哪些物品通过以下路径进入章节经济：
- shop inventory
- 商店库存
- event `giveItem`
- 事件 `giveItem`
- enemy drops
- 敌人掉落
- item-gated progression checks such as `ifHasItem`
- `ifHasItem` 这类基于物品的推进门禁

This section is the main place to track key-item circulation.
这一部分是跟踪关键物品流通路径的主入口。

### Price Consistency Report
### 价格一致性报告

- Compares shop-effective prices against base item prices.
- 对比商店实际价格与物品基础价格。
- Marks stable prices as `consistent`.
- 将稳定价格标记为 `consistent`。
- Marks chapter-specific overrides as `overridden`.
- 将章节局部价格覆盖标记为 `overridden`。
- Marks later-chapter price drops as `regressed`.
- 将后续章节价格反向下降标记为 `regressed`。

### Reward And Drop Sanity Check
### 奖励与掉落合理性检查

- Summarizes gold and experience ranges for each chapter-owned enemy group.
- 汇总每个章节敌群的金钱与经验区间。
- Lists configured drop items and drop chances.
- 列出配置好的掉落物与掉率。
- Flags missing drop item definitions as blockers.
- 将缺失掉落物定义标记为 blocker。
- Flags suspicious reward regressions as non-blockers.
- 将可疑的奖励回退标记为 non-blocker。

## Severity
## 严重级别

- `blocker`
  Missing shop definitions, missing item definitions, missing enemy groups, missing enemy records, or missing drop item definitions.
- `blocker`
  缺失商店定义、缺失物品定义、缺失敌群、缺失敌人记录，或缺失掉落物定义。
- `non-blocker`
  Price overrides, price regressions, or reward regressions that should be reviewed but do not immediately break chapter closure.
- `non-blocker`
  价格覆盖、价格回退或奖励回退。这些问题需要审查，但不会立刻打断章节闭环。

## Commands
## 命令

- `npm run economy-parity-audit`

## Expected Usage
## 推荐用法

Run this audit after:
建议在以下情况后运行本审计：

- importing a new chapter with shops, rewards, or gated items
- 导入包含商店、奖励或门禁物品的新章节之后
- changing item base prices
- 修改物品基础价格之后
- changing shop inventory or chapter enemy groups
- 修改商店库存或章节敌群之后
- adjusting battle reward data
- 调整战斗奖励数据之后

The report is review-oriented. It should help Codex and human editors answer:
这份报告面向审查，帮助 Codex 和人工编辑回答：

- Which chapters sell which items?
- 哪些章节在卖哪些物品？
- Which key items enter the game by event versus by shop or by drop?
- 哪些关键物品是通过事件、商店或掉落进入游戏的？
- Are chapter-local price overrides intentional?
- 章节局部价格覆盖是否是有意设计？
- Do rewards and drops still scale in a reasonable direction?
- 奖励和掉落是否仍沿着合理方向变化？
