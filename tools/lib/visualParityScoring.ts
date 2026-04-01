import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { repoRoot, stableStringify } from "./importerCore";
import { buildVisualBackfillReport, loadVisualBackfillPlan, VisualBackfillPlanEntry } from "./visualBackfill";

const reportDirectory = path.join(repoRoot, "reports", "visual-parity", "latest");

type VisualParityBucket = "tilesets" | "npc-sprites" | "ui-assets";

export interface VisualParityScoreEntry {
  logicalAssetKey: string;
  category: string;
  bucket: VisualParityBucket;
  baseState: string;
  effectiveState: string;
  targetState: string;
  scoreBefore: number;
  scoreAfter: number;
  delta: number;
  sourceManifestIds: string[];
}

export interface VisualParityScoreBucket {
  id: VisualParityBucket;
  label: string;
  entryCount: number;
  scoreBefore: number;
  scoreAfter: number;
  delta: number;
  entries: VisualParityScoreEntry[];
}

export interface VisualParityScoreReport {
  generatedAt: string;
  planId: string;
  chapterId: string;
  title: string;
  scopeLabel: string;
  summary: {
    entryCount: number;
    scoreBefore: number;
    scoreAfter: number;
    delta: number;
    gameplaySafe: boolean;
    uiLayoutSafe: boolean;
    interactionSafe: boolean;
  };
  buckets: VisualParityScoreBucket[];
  entries: VisualParityScoreEntry[];
  acceptedBehaviorDivergences: string[];
  layoutDivergences: string[];
}

function getBucket(entry: VisualBackfillPlanEntry): VisualParityBucket {
  if (entry.category === "tileset") {
    return "tilesets";
  }
  if (entry.category === "npc-sprite" || entry.category === "character-sprite") {
    return "npc-sprites";
  }
  return "ui-assets";
}

function getBucketLabel(bucket: VisualParityBucket): string {
  switch (bucket) {
    case "tilesets":
      return "Tilesets / 地图图块";
    case "npc-sprites":
      return "NPC Sprites / NPC 精灵";
    case "ui-assets":
      return "UI Assets / UI 资产";
  }
}

function stateScore(state: string): number {
  switch (state) {
    case "locked":
      return 100;
    case "validated":
      return 85;
    case "imported":
      return 70;
    case "placeholder":
      return 20;
    default:
      return 0;
  }
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export async function buildVisualParityScoreReport(planId: string): Promise<VisualParityScoreReport> {
  const [plan, report] = await Promise.all([
    loadVisualBackfillPlan(planId),
    buildVisualBackfillReport(planId),
  ]);

  const entries: VisualParityScoreEntry[] = report.entries.map((entry, index) => {
    const planEntry = plan.replacementEntries[index];
    const scoreBefore = stateScore(entry.baseState);
    const scoreAfter = stateScore(entry.effectiveState);

    return {
      logicalAssetKey: entry.logicalAssetKey,
      category: entry.category,
      bucket: getBucket(planEntry),
      baseState: entry.baseState,
      effectiveState: entry.effectiveState,
      targetState: entry.targetState,
      scoreBefore,
      scoreAfter,
      delta: scoreAfter - scoreBefore,
      sourceManifestIds: entry.sourceManifestIds,
    };
  });

  const buckets: VisualParityScoreBucket[] = (["tilesets", "npc-sprites", "ui-assets"] as VisualParityBucket[]).map((bucket) => {
    const bucketEntries = entries.filter((entry) => entry.bucket === bucket);
    return {
      id: bucket,
      label: getBucketLabel(bucket),
      entryCount: bucketEntries.length,
      scoreBefore: average(bucketEntries.map((entry) => entry.scoreBefore)),
      scoreAfter: average(bucketEntries.map((entry) => entry.scoreAfter)),
      delta: average(bucketEntries.map((entry) => entry.delta)),
      entries: bucketEntries,
    };
  }).filter((bucket) => bucket.entryCount > 0);

  return {
    generatedAt: new Date().toISOString(),
    planId: report.planId,
    chapterId: report.chapterId,
    title: report.title,
    scopeLabel: "Lou Sang town center visual pilot / 楼桑村镇中心视觉试点",
    summary: {
      entryCount: entries.length,
      scoreBefore: average(entries.map((entry) => entry.scoreBefore)),
      scoreAfter: average(entries.map((entry) => entry.scoreAfter)),
      delta: average(entries.map((entry) => entry.delta)),
      gameplaySafe: report.summary.gameplaySafe,
      uiLayoutSafe: report.summary.uiLayoutSafe,
      interactionSafe: report.summary.interactionSafe,
    },
    buckets,
    entries,
    acceptedBehaviorDivergences: report.evidence.uiParity.acceptedBehaviorDivergences,
    layoutDivergences: report.evidence.uiParity.layoutRelatedDivergences,
  };
}

export async function writeVisualParityScoreReport(report: VisualParityScoreReport): Promise<string> {
  await mkdir(reportDirectory, { recursive: true });

  const reportPath = path.join(reportDirectory, `${report.planId}.report.json`);
  const summaryPath = path.join(reportDirectory, `${report.planId}.summary.md`);

  await writeFile(reportPath, `${stableStringify(report)}\n`, "utf8");

  const lines = [
    `# ${report.title}`,
    `# ${report.title}`,
    "",
    `Generated At / 生成时间: ${report.generatedAt}`,
    `Plan / 计划: ${report.planId}`,
    `Chapter / 章节: ${report.chapterId}`,
    `Scope / 范围: ${report.scopeLabel}`,
    "",
    `Overall Before / 替换前总分: ${report.summary.scoreBefore}`,
    `Overall After / 替换后总分: ${report.summary.scoreAfter}`,
    `Overall Delta / 总提升: ${report.summary.delta}`,
    `Gameplay Safe / Gameplay 安全: ${report.summary.gameplaySafe ? "yes" : "no"}`,
    `UI Layout Safe / UI 布局安全: ${report.summary.uiLayoutSafe ? "yes" : "no"}`,
    `Interaction Safe / 交互安全: ${report.summary.interactionSafe ? "yes" : "no"}`,
    "",
    "## Bucket Scores",
    "## 分类得分",
    "",
    "| Bucket | Entries | Before | After | Delta |",
    "| --- | --- | --- | --- | --- |",
    ...report.buckets.map((bucket) => `| ${bucket.label} | ${bucket.entryCount} | ${bucket.scoreBefore} | ${bucket.scoreAfter} | ${bucket.delta} |`),
    "",
    "## Entry Diff",
    "## 条目差异",
    "",
    "| Asset Key | Category | Before | After | Delta | Sources |",
    "| --- | --- | --- | --- | --- | --- |",
    ...report.entries.map((entry) => `| ${entry.logicalAssetKey} | ${entry.category} | ${entry.baseState} (${entry.scoreBefore}) | ${entry.effectiveState} (${entry.scoreAfter}) | ${entry.delta} | ${entry.sourceManifestIds.join(", ")} |`),
    "",
    `Accepted UI Behavior Divergences / 已接受 UI 行为差异: ${report.acceptedBehaviorDivergences.join(", ") || "none"}`,
    `Layout Divergences / 布局差异: ${report.layoutDivergences.join(", ") || "none"}`,
    "",
  ];

  await writeFile(summaryPath, `${lines.join("\n")}\n`, "utf8");
  return reportPath;
}
