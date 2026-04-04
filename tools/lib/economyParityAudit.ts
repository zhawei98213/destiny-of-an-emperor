import { mkdir } from "node:fs/promises";
import path from "node:path";
import {
  loadManualStoryContent,
  loadManualWorldContent,
  loadRealChapterMetadata,
  manualWorldPath,
  manualStoryPath,
} from "./manualContent";
import { readJsonFile, repoRoot, stableStringify } from "./importerCore";

type EconomySeverity = "blocker" | "non-blocker";

interface StoryEventStep {
  type?: string;
  itemId?: string;
  quantity?: number;
  flagId?: string;
  steps?: StoryEventStep[];
  elseSteps?: StoryEventStep[];
}

interface BattleGeneratedContent {
  battleGroups: Array<{
    id: string;
    name: string;
    enemyIds: string[];
  }>;
  enemies: Array<{
    id: string;
    name: string;
    rewardExperience: number;
    rewardGold: number;
    dropItems: Array<{
      itemId: string;
      quantity: number;
      chance: number;
    }>;
  }>;
}

interface WorldItemDefinition {
  id: string;
  name?: string;
  kind?: string;
  price: number;
}

interface WorldContentWithItemKinds {
  items: WorldItemDefinition[];
}

export interface EconomyIssue {
  severity: EconomySeverity;
  type:
    | "missing-shop"
    | "missing-item"
    | "missing-enemy-group"
    | "missing-enemy"
    | "missing-drop-item"
    | "price-regression"
    | "price-override"
    | "reward-regression";
  chapterId: string;
  path: string;
  message: string;
}

export interface ChapterShopSummary {
  chapterId: string;
  shopId: string;
  shopName: string;
  inventory: Array<{
    itemId: string;
    basePrice: number;
    effectivePrice: number;
    priceDelta: number;
  }>;
}

export interface ItemAvailabilityByChapter {
  chapterId: string;
  chapterTitle: string;
  shopItems: string[];
  eventItems: string[];
  dropItems: string[];
  requiredItems: string[];
  criticalItemFlows: Array<{
    itemId: string;
    kind: string;
    obtainedVia: string[];
    requiredBy: string[];
  }>;
}

export interface PriceConsistencyEntry {
  itemId: string;
  basePrice: number;
  chapterPrices: Array<{
    chapterId: string;
    shopId: string;
    price: number;
  }>;
  status: "consistent" | "overridden" | "regressed";
}

export interface RewardDropSanityEntry {
  chapterId: string;
  enemyGroupId: string;
  enemyIds: string[];
  rewardGoldRange: {
    min: number;
    max: number;
  };
  rewardExperienceRange: {
    min: number;
    max: number;
  };
  dropItems: Array<{
    itemId: string;
    quantity: number;
    chance: number;
  }>;
  status: "ok" | "regressed";
}

export interface EconomyParityReport {
  generatedAt: string;
  summary: {
    chapterCount: number;
    shopCount: number;
    itemCount: number;
    issueCount: number;
    blockerCount: number;
    nonBlockerCount: number;
  };
  shopInventoryAudit: ChapterShopSummary[];
  itemAvailabilityByChapter: ItemAvailabilityByChapter[];
  priceConsistencyReport: PriceConsistencyEntry[];
  rewardDropSanityCheck: RewardDropSanityEntry[];
  issues: EconomyIssue[];
}

export const economyParityReportDir = path.join(repoRoot, "reports", "economy-parity", "latest");

function pushUnique(target: string[], value: string): void {
  if (!target.includes(value)) {
    target.push(value);
  }
}

function collectEventEconomyFacts(
  steps: StoryEventStep[],
  facts: {
    givenItems: Array<{ itemId: string; quantity: number; path: string }>;
    requiredItems: Array<{ itemId: string; quantity: number; path: string }>;
  },
  pathPrefix: string,
): void {
  steps.forEach((step, index) => {
    const path = `${pathPrefix}[${index}]`;
    if (step.type === "giveItem" && step.itemId) {
      facts.givenItems.push({
        itemId: step.itemId,
        quantity: step.quantity ?? 1,
        path,
      });
    }

    if (step.type === "ifHasItem" && step.itemId) {
      facts.requiredItems.push({
        itemId: step.itemId,
        quantity: step.quantity ?? 1,
        path,
      });
    }

    if (step.steps) {
      collectEventEconomyFacts(step.steps, facts, `${path}.steps`);
    }

    if (step.elseSteps) {
      collectEventEconomyFacts(step.elseSteps, facts, `${path}.elseSteps`);
    }
  });
}

function summarizeCriticalItemFlows(
  chapterId: string,
  itemDefinitions: Map<string, WorldItemDefinition>,
  shopItems: string[],
  eventFacts: Map<string, { obtainedVia: string[]; requiredBy: string[] }>,
  dropItems: string[],
): ItemAvailabilityByChapter["criticalItemFlows"] {
  const allCriticalIds = new Set<string>();

  itemDefinitions.forEach((item) => {
    if (item.kind === "key" || item.price === 0) {
      allCriticalIds.add(item.id);
    }
  });

  eventFacts.forEach((_value, itemId) => {
    allCriticalIds.add(itemId);
  });

  return [...allCriticalIds]
    .sort((left, right) => left.localeCompare(right))
    .map((itemId) => {
      const item = itemDefinitions.get(itemId);
      const flow = eventFacts.get(itemId) ?? { obtainedVia: [], requiredBy: [] };
      const obtainedVia = [...flow.obtainedVia];
      const requiredBy = [...flow.requiredBy];

      if (shopItems.includes(itemId)) {
        pushUnique(obtainedVia, `shop:${chapterId}`);
      }
      if (dropItems.includes(itemId)) {
        pushUnique(obtainedVia, `drop:${chapterId}`);
      }

      return {
        itemId,
        kind: item?.kind ?? (item?.price === 0 ? "key" : "unknown"),
        obtainedVia: obtainedVia.sort((left, right) => left.localeCompare(right)),
        requiredBy: requiredBy.sort((left, right) => left.localeCompare(right)),
      };
    })
    .filter((entry) => entry.obtainedVia.length > 0 || entry.requiredBy.length > 0 || entry.kind === "key");
}

function toMarkdown(report: EconomyParityReport): string {
  const lines: string[] = [];

  lines.push("# Economy Parity Audit");
  lines.push("# 经济一致性审计");
  lines.push("");
  lines.push(`- Generated At / 生成时间: ${report.generatedAt}`);
  lines.push(`- Chapter Count / 章节数量: ${report.summary.chapterCount}`);
  lines.push(`- Shop Count / 商店数量: ${report.summary.shopCount}`);
  lines.push(`- Item Count / 物品数量: ${report.summary.itemCount}`);
  lines.push(`- Blocker Count / 阻塞项数量: ${report.summary.blockerCount}`);
  lines.push(`- Non-Blocker Count / 非阻塞项数量: ${report.summary.nonBlockerCount}`);
  lines.push("");
  lines.push("## Shop Inventory Audit");
  lines.push("## 商店库存审计");
  lines.push("");
  report.shopInventoryAudit.forEach((shop) => {
    lines.push(`- ${shop.chapterId} / ${shop.shopId}: ${shop.inventory.map((entry) => `${entry.itemId}@${entry.effectivePrice}`).join(", ") || "none"}`);
  });
  lines.push("");
  lines.push("## Item Availability By Chapter");
  lines.push("## 章节物品流通");
  lines.push("");
  report.itemAvailabilityByChapter.forEach((entry) => {
    lines.push(`- ${entry.chapterId}: shops=${entry.shopItems.join(", ") || "none"} | events=${entry.eventItems.join(", ") || "none"} | drops=${entry.dropItems.join(", ") || "none"} | required=${entry.requiredItems.join(", ") || "none"}`);
  });
  lines.push("");
  lines.push("## Price Consistency");
  lines.push("## 价格一致性");
  lines.push("");
  report.priceConsistencyReport.forEach((entry) => {
    lines.push(`- ${entry.itemId}: ${entry.status} | ${entry.chapterPrices.map((priceEntry) => `${priceEntry.chapterId}:${priceEntry.shopId}@${priceEntry.price}`).join(", ") || "no shop price"}`);
  });
  lines.push("");
  lines.push("## Reward And Drop Sanity");
  lines.push("## 奖励与掉落合理性");
  lines.push("");
  report.rewardDropSanityCheck.forEach((entry) => {
    lines.push(`- ${entry.chapterId}:${entry.enemyGroupId} gold=${entry.rewardGoldRange.min}-${entry.rewardGoldRange.max} exp=${entry.rewardExperienceRange.min}-${entry.rewardExperienceRange.max} drops=${entry.dropItems.map((drop) => `${drop.itemId}@${drop.chance}`).join(", ") || "none"} status=${entry.status}`);
  });
  lines.push("");
  lines.push("## Issues");
  lines.push("## 问题");
  lines.push("");
  if (report.issues.length === 0) {
    lines.push("- none / 无");
  } else {
    report.issues.forEach((issue) => {
      lines.push(`- [${issue.severity}] ${issue.chapterId} ${issue.path}: ${issue.message}`);
    });
  }

  return `${lines.join("\n")}\n`;
}

export async function buildEconomyParityReport(): Promise<EconomyParityReport> {
  const [chapters, story, world, worldWithKinds, battle] = await Promise.all([
    loadRealChapterMetadata(),
    loadManualStoryContent(),
    loadManualWorldContent(),
    readJsonFile<WorldContentWithItemKinds>(manualWorldPath),
    readJsonFile<BattleGeneratedContent>(path.join(repoRoot, "content", "generated", "battle.content.json")),
  ]);

  const issues: EconomyIssue[] = [];
  const itemDefinitions = new Map(
    worldWithKinds.items.map((item) => [item.id, item] as const),
  );
  const shopsById = new Map(story.shops.map((shop) => [shop.id, shop] as const));
  const eventsById = new Map(story.events.map((event) => [event.id, event] as const));
  const battleGroupsById = new Map(battle.battleGroups.map((group) => [group.id, group] as const));
  const enemiesById = new Map(battle.enemies.map((enemy) => [enemy.id, enemy] as const));

  const shopInventoryAudit: ChapterShopSummary[] = [];
  const itemAvailabilityByChapter: ItemAvailabilityByChapter[] = [];
  const rewardDropSanityCheck: RewardDropSanityEntry[] = [];
  const priceTracking = new Map<string, PriceConsistencyEntry>();

  chapters.forEach((chapter) => {
    const chapterShopItems: string[] = [];
    const chapterDropItems: string[] = [];
    const chapterRequiredItems: string[] = [];
    const chapterEventItems: string[] = [];
    const chapterEventFacts = new Map<string, { obtainedVia: string[]; requiredBy: string[] }>();

    chapter.shops.forEach((shopId) => {
      const shop = shopsById.get(shopId);
      if (!shop) {
        issues.push({
          severity: "blocker",
          type: "missing-shop",
          chapterId: chapter.chapterId,
          path: `${path.relative(repoRoot, manualStoryPath)}:shops.${shopId}`,
          message: `Shop definition is missing for ${shopId}. / 缺少 ${shopId} 的商店定义。`,
        });
        return;
      }

      const inventory = shop.inventory.map((entry, index) => {
        const item = itemDefinitions.get(entry.itemId);
        if (!item) {
          issues.push({
            severity: "blocker",
            type: "missing-item",
            chapterId: chapter.chapterId,
            path: `${path.relative(repoRoot, manualStoryPath)}:shops.${shop.id}.inventory[${index}].itemId`,
            message: `Shop item ${entry.itemId} is missing from world items. / 商店物品 ${entry.itemId} 未在 world items 中定义。`,
          });
        }

        const basePrice = item?.price ?? 0;
        const effectivePrice = entry.price ?? basePrice;
        const priceDelta = effectivePrice - basePrice;
        pushUnique(chapterShopItems, entry.itemId);

        if (!priceTracking.has(entry.itemId)) {
          priceTracking.set(entry.itemId, {
            itemId: entry.itemId,
            basePrice,
            chapterPrices: [],
            status: "consistent",
          });
        }
        priceTracking.get(entry.itemId)?.chapterPrices.push({
          chapterId: chapter.chapterId,
          shopId: shop.id,
          price: effectivePrice,
        });

        if (priceDelta !== 0) {
          issues.push({
            severity: "non-blocker",
            type: "price-override",
            chapterId: chapter.chapterId,
            path: `${path.relative(repoRoot, manualStoryPath)}:shops.${shop.id}.inventory[${index}]`,
            message: `Shop price override for ${entry.itemId}: base=${basePrice}, effective=${effectivePrice}. / ${entry.itemId} 出现商店价格覆盖：基础价 ${basePrice}，实际价 ${effectivePrice}。`,
          });
        }

        return {
          itemId: entry.itemId,
          basePrice,
          effectivePrice,
          priceDelta,
        };
      });

      shopInventoryAudit.push({
        chapterId: chapter.chapterId,
        shopId: shop.id,
        shopName: shop.name,
        inventory,
      });
    });

    chapter.events.forEach((eventId) => {
      const event = eventsById.get(eventId);
      if (!event) {
        return;
      }

      const facts = {
        givenItems: [] as Array<{ itemId: string; quantity: number; path: string }>,
        requiredItems: [] as Array<{ itemId: string; quantity: number; path: string }>,
      };
      collectEventEconomyFacts(event.steps as StoryEventStep[], facts, `${eventId}.steps`);

      facts.givenItems.forEach((entry) => {
        pushUnique(chapterEventItems, entry.itemId);
        if (!chapterEventFacts.has(entry.itemId)) {
          chapterEventFacts.set(entry.itemId, { obtainedVia: [], requiredBy: [] });
        }
        pushUnique(
          chapterEventFacts.get(entry.itemId)!.obtainedVia,
          `event:${eventId}`,
        );
      });

      facts.requiredItems.forEach((entry) => {
        pushUnique(chapterRequiredItems, entry.itemId);
        if (!chapterEventFacts.has(entry.itemId)) {
          chapterEventFacts.set(entry.itemId, { obtainedVia: [], requiredBy: [] });
        }
        pushUnique(
          chapterEventFacts.get(entry.itemId)!.requiredBy,
          `event:${eventId}`,
        );
      });
    });

    chapter.enemyGroups.forEach((enemyGroupId) => {
      const group = battleGroupsById.get(enemyGroupId);
      if (!group) {
        issues.push({
          severity: "blocker",
          type: "missing-enemy-group",
          chapterId: chapter.chapterId,
          path: `${path.relative(repoRoot, manualWorldPath)}:chapter.${chapter.chapterId}.enemyGroups`,
          message: `Enemy group ${enemyGroupId} is missing from generated battle data. / 生成战斗数据中缺少敌群 ${enemyGroupId}。`,
        });
        return;
      }

      const rewardGoldValues: number[] = [];
      const rewardExperienceValues: number[] = [];
      const dropItems: RewardDropSanityEntry["dropItems"] = [];

      group.enemyIds.forEach((enemyId) => {
        const enemy = enemiesById.get(enemyId);
        if (!enemy) {
          issues.push({
            severity: "blocker",
            type: "missing-enemy",
            chapterId: chapter.chapterId,
            path: `content/generated/battle.content.json:battleGroups.${group.id}.enemyIds`,
            message: `Enemy ${enemyId} is missing from generated battle data. / 生成战斗数据中缺少敌人 ${enemyId}。`,
          });
          return;
        }

        rewardGoldValues.push(enemy.rewardGold);
        rewardExperienceValues.push(enemy.rewardExperience);
        enemy.dropItems.forEach((drop, dropIndex) => {
          dropItems.push({
            itemId: drop.itemId,
            quantity: drop.quantity,
            chance: drop.chance,
          });
          pushUnique(chapterDropItems, drop.itemId);
          if (!itemDefinitions.has(drop.itemId)) {
            issues.push({
              severity: "blocker",
              type: "missing-drop-item",
              chapterId: chapter.chapterId,
              path: `content/generated/battle.content.json:enemies.${enemy.id}.dropItems[${dropIndex}]`,
              message: `Drop item ${drop.itemId} is missing from world items. / 掉落物 ${drop.itemId} 未在 world items 中定义。`,
            });
          }
        });
      });

      rewardDropSanityCheck.push({
        chapterId: chapter.chapterId,
        enemyGroupId,
        enemyIds: group.enemyIds,
        rewardGoldRange: {
          min: rewardGoldValues.length > 0 ? Math.min(...rewardGoldValues) : 0,
          max: rewardGoldValues.length > 0 ? Math.max(...rewardGoldValues) : 0,
        },
        rewardExperienceRange: {
          min: rewardExperienceValues.length > 0 ? Math.min(...rewardExperienceValues) : 0,
          max: rewardExperienceValues.length > 0 ? Math.max(...rewardExperienceValues) : 0,
        },
        dropItems,
        status: "ok",
      });
    });

    itemAvailabilityByChapter.push({
      chapterId: chapter.chapterId,
      chapterTitle: chapter.title,
      shopItems: chapterShopItems.sort((left, right) => left.localeCompare(right)),
      eventItems: chapterEventItems.sort((left, right) => left.localeCompare(right)),
      dropItems: chapterDropItems.sort((left, right) => left.localeCompare(right)),
      requiredItems: chapterRequiredItems.sort((left, right) => left.localeCompare(right)),
      criticalItemFlows: summarizeCriticalItemFlows(
        chapter.chapterId,
        itemDefinitions,
        chapterShopItems,
        chapterEventFacts,
        chapterDropItems,
      ),
    });
  });

  priceTracking.forEach((entry, itemId) => {
    entry.chapterPrices.sort((left, right) => left.chapterId.localeCompare(right.chapterId));
    let sawOverride = false;
    let sawRegression = false;
    for (let index = 1; index < entry.chapterPrices.length; index += 1) {
      if (entry.chapterPrices[index].price < entry.chapterPrices[index - 1].price) {
        sawRegression = true;
      }
    }
    if (entry.chapterPrices.some((price) => price.price !== entry.basePrice)) {
      sawOverride = true;
    }
    entry.status = sawRegression ? "regressed" : sawOverride ? "overridden" : "consistent";
    if (sawRegression) {
      issues.push({
        severity: "non-blocker",
        type: "price-regression",
        chapterId: entry.chapterPrices[entry.chapterPrices.length - 1]?.chapterId ?? "unknown",
        path: `priceConsistency.${itemId}`,
        message: `Later chapter shop price for ${itemId} is lower than an earlier chapter. / 后续章节中 ${itemId} 的商店价格低于更早章节。`,
      });
    }
  });

  const chapterIndex = new Map(
    chapters.map((chapter, index) => [chapter.chapterId, index] as const),
  );

  const rewardProgression = rewardDropSanityCheck
    .slice()
    .sort(
      (left, right) =>
        (chapterIndex.get(left.chapterId) ?? Number.MAX_SAFE_INTEGER) -
        (chapterIndex.get(right.chapterId) ?? Number.MAX_SAFE_INTEGER),
    );

  for (let index = 1; index < rewardProgression.length; index += 1) {
    const current = rewardProgression[index];
    const previous = rewardProgression[index - 1];
    if (current.rewardGoldRange.max < previous.rewardGoldRange.max) {
      current.status = "regressed";
      issues.push({
        severity: "non-blocker",
        type: "reward-regression",
        chapterId: current.chapterId,
        path: `rewardDropSanityCheck.${current.enemyGroupId}`,
        message: `Reward gold for ${current.enemyGroupId} drops below the previous chapter baseline. / ${current.enemyGroupId} 的金钱奖励低于前一章节基线。`,
      });
    }
  }

  issues.sort((left, right) => {
    if (left.severity !== right.severity) {
      return left.severity === "blocker" ? -1 : 1;
    }
    return `${left.chapterId}:${left.path}`.localeCompare(`${right.chapterId}:${right.path}`);
  });

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      chapterCount: chapters.length,
      shopCount: shopInventoryAudit.length,
      itemCount: world.items.length,
      issueCount: issues.length,
      blockerCount: issues.filter((issue) => issue.severity === "blocker").length,
      nonBlockerCount: issues.filter((issue) => issue.severity === "non-blocker").length,
    },
    shopInventoryAudit,
    itemAvailabilityByChapter,
    priceConsistencyReport: [...priceTracking.values()].sort((left, right) => left.itemId.localeCompare(right.itemId)),
    rewardDropSanityCheck,
    issues,
  };
}

export async function writeEconomyParityArtifacts(): Promise<EconomyParityReport> {
  const report = await buildEconomyParityReport();
  await mkdir(economyParityReportDir, { recursive: true });
  await Promise.all([
    mkdir(path.join(repoRoot, "reports", "economy-parity"), { recursive: true }),
    mkdir(economyParityReportDir, { recursive: true }),
  ]);

  const reportPath = path.join(economyParityReportDir, "report.json");
  const summaryPath = path.join(economyParityReportDir, "summary.md");
  await Promise.all([
    import("node:fs/promises").then(({ writeFile }) => writeFile(reportPath, `${stableStringify(report)}\n`, "utf8")),
    import("node:fs/promises").then(({ writeFile }) => writeFile(summaryPath, toMarkdown(report), "utf8")),
  ]);

  return report;
}
