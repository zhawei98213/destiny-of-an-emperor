import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadRealChapterMetadata, loadManualStoryContent, loadManualWorldContent } from "./manualContent";
import { readJsonFile, repoRoot, stableStringify } from "./importerCore";

interface BattleContentDocument {
  enemies: Array<{
    id: string;
    level: number;
    rewardExperience: number;
    rewardGold: number;
  }>;
  battleGroups: Array<{
    id: string;
    enemyIds: string[];
  }>;
}

export interface ProgressionStatParityReport {
  generatedAt: string;
  partyGrowthReport: Array<{
    chapterId: string;
    chapterTitle: string;
    battleGroups: string[];
    totalRewardExperience: number;
    totalRewardGold: number;
  }>;
  levelStatCurveSummary: Array<{
    chapterId: string;
    enemyLevelBand: string;
    cumulativeExperience: number;
    cumulativeGold: number;
  }>;
  equipmentProgressionSummary: Array<{
    chapterId: string;
    equipmentItems: string[];
    equipmentShops: string[];
  }>;
  obviousOutliers: Array<{
    severity: "blocker" | "non-blocker";
    chapterId: string;
    message: string;
  }>;
}

export const progressionStatParityReportDir = path.join(repoRoot, "reports", "progression-stat-parity", "latest");

export async function buildProgressionStatParityReport(): Promise<ProgressionStatParityReport> {
  const chapters = await loadRealChapterMetadata();
  const story = await loadManualStoryContent();
  const world = await loadManualWorldContent();
  const battleContent = await readJsonFile<BattleContentDocument>(path.join(repoRoot, "content", "generated", "battle.content.json"));

  const itemIndex = new Map(world.items.map((entry) => [entry.id, entry]));
  const shopIndex = new Map(story.shops.map((entry) => [entry.id, entry]));
  const enemyIndex = new Map(battleContent.enemies.map((entry) => [entry.id, entry]));
  const battleGroupIndex = new Map(battleContent.battleGroups.map((entry) => [entry.id, entry]));

  let cumulativeExperience = 0;
  let cumulativeGold = 0;

  const partyGrowthReport = chapters.map((chapter) => {
    const groups = chapter.enemyGroups
      .map((groupId) => battleGroupIndex.get(groupId))
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
    const totalRewardExperience = groups.reduce((sum, group) => (
      sum + group.enemyIds.reduce((inner, enemyId) => inner + (enemyIndex.get(enemyId)?.rewardExperience ?? 0), 0)
    ), 0);
    const totalRewardGold = groups.reduce((sum, group) => (
      sum + group.enemyIds.reduce((inner, enemyId) => inner + (enemyIndex.get(enemyId)?.rewardGold ?? 0), 0)
    ), 0);
    cumulativeExperience += totalRewardExperience;
    cumulativeGold += totalRewardGold;
    return {
      chapterId: chapter.chapterId,
      chapterTitle: chapter.title,
      battleGroups: chapter.enemyGroups,
      totalRewardExperience,
      totalRewardGold,
    };
  });

  const levelStatCurveSummary = chapters.map((chapter, index) => {
    const groups = chapter.enemyGroups
      .map((groupId) => battleGroupIndex.get(groupId))
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
    const levels = groups.flatMap((group) => group.enemyIds.map((enemyId) => enemyIndex.get(enemyId)?.level ?? 0)).filter((entry) => entry > 0);
    const previousExperience = partyGrowthReport
      .slice(0, index + 1)
      .reduce((sum, entry) => sum + entry.totalRewardExperience, 0);
    const previousGold = partyGrowthReport
      .slice(0, index + 1)
      .reduce((sum, entry) => sum + entry.totalRewardGold, 0);
    return {
      chapterId: chapter.chapterId,
      enemyLevelBand: levels.length > 0 ? `${Math.min(...levels)}-${Math.max(...levels)}` : "none",
      cumulativeExperience: previousExperience,
      cumulativeGold: previousGold,
    };
  });

  const equipmentProgressionSummary = chapters.map((chapter) => {
    const equipmentItems = new Set<string>();
    chapter.shops
      .map((shopId) => shopIndex.get(shopId))
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
      .forEach((shop) => {
        shop.inventory.forEach((entry) => {
          if (itemIndex.get(entry.itemId)?.kind === "equipment") {
            equipmentItems.add(entry.itemId);
          }
        });
      });

    return {
      chapterId: chapter.chapterId,
      equipmentItems: [...equipmentItems].sort((left, right) => left.localeCompare(right)),
      equipmentShops: chapter.shops.filter((shopId) => (
        (shopIndex.get(shopId)?.inventory ?? []).some((entry) => itemIndex.get(entry.itemId)?.kind === "equipment")
      )),
    };
  });

  const obviousOutliers: ProgressionStatParityReport["obviousOutliers"] = [];
  for (let index = 1; index < levelStatCurveSummary.length; index += 1) {
    const previous = levelStatCurveSummary[index - 1];
    const current = levelStatCurveSummary[index];
    const [previousHigh] = previous.enemyLevelBand.split("-").slice(-1).map((value) => Number(value) || 0);
    const [currentLow] = current.enemyLevelBand.split("-").map((value) => Number(value) || 0);
    if (previousHigh > 0 && currentLow > previousHigh + 2) {
      obviousOutliers.push({
        severity: "non-blocker",
        chapterId: current.chapterId,
        message: `enemy level jumps from ${previous.enemyLevelBand} to ${current.enemyLevelBand}`,
      });
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    partyGrowthReport,
    levelStatCurveSummary,
    equipmentProgressionSummary,
    obviousOutliers,
  };
}

function renderSummary(report: ProgressionStatParityReport): string {
  return [
    "# Progression Stat Parity Report",
    "# 成长曲线一致性报告",
    "",
    `- Generated At / 生成时间: ${report.generatedAt}`,
    `- Chapter Count / 章节数量: ${report.partyGrowthReport.length}`,
    `- Outlier Count / 异常数: ${report.obviousOutliers.length}`,
    "",
  ].join("\n");
}

export async function writeProgressionStatParityArtifacts(): Promise<ProgressionStatParityReport> {
  const report = await buildProgressionStatParityReport();
  await mkdir(progressionStatParityReportDir, { recursive: true });
  await writeFile(path.join(progressionStatParityReportDir, "report.json"), `${stableStringify(report)}\n`, "utf8");
  await writeFile(path.join(progressionStatParityReportDir, "summary.md"), `${renderSummary(report)}\n`, "utf8");
  return report;
}
