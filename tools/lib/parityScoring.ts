import path from "node:path";
import { readFile } from "node:fs/promises";
import {
  ChapterMetadata,
  ChapterStatus,
  loadAllChapterMetadata,
} from "./chapterMetadata";
import {
  readJsonFile,
  repoRoot,
} from "./importerCore";

export type ParityIssueSeverity = "blocker" | "minor";

export interface RegressionCaseReport {
  id: string;
  status: "pass" | "mismatch" | "fail";
  locator: {
    triggerKind?: string;
    mapId?: string;
    triggerId?: string;
    eventId?: string;
    encounterTableId?: string;
    npcId?: string;
    battleGroupId?: string;
  };
  expectedUi?: {
    dialogueLineIds?: string[];
    shopId?: string;
    battleOutcome?: string;
  };
  observedUi?: {
    dialogueLineIds?: string[];
    shopId?: string;
    battleOutcome?: string;
  };
}

export interface RegressionReport {
  generatedAt: string;
  totals: {
    pass: number;
    mismatch: number;
    fail: number;
    total: number;
  };
  cases: RegressionCaseReport[];
}

export interface ParityIssue {
  severity: ParityIssueSeverity;
  message: string;
}

export interface ParityDimensionScore {
  id:
    | "map-structure"
    | "npc-placement"
    | "event-triggers"
    | "dialogue-coverage"
    | "battle-rewards"
    | "shop-consistency"
    | "save-restore";
  label: string;
  score: number;
  maxScore: 100;
  weight: number;
  applicable: boolean;
  evidence: string[];
  issues: ParityIssue[];
}

export interface ChapterParityScore {
  chapterId: string;
  title: string;
  areaLabel: string;
  status: ChapterStatus;
  totalScore: number;
  maxScore: number;
  blockerCount: number;
  minorCount: number;
  regressionCaseCount: number;
  regressionPassCount: number;
  dimensions: ParityDimensionScore[];
  blockers: string[];
  minorMismatches: string[];
}

export interface ParityScoreReport {
  generatedAt: string;
  source: {
    chapterDirectory: string;
    regressionReportPath: string;
  };
  totals: {
    chapterCount: number;
    blockerCount: number;
    minorCount: number;
    averageScore: number;
  };
  chapters: ChapterParityScore[];
}

const STATUS_SCORES: Record<ChapterStatus, number> = {
  planned: 20,
  importing: 45,
  validating: 70,
  "parity-review": 85,
  locked: 100,
};

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function formatStatus(status: ChapterStatus): string {
  return `${status} (${STATUS_SCORES[status]})`;
}

function createIssue(severity: ParityIssueSeverity, message: string): ParityIssue {
  return { severity, message };
}

function getRealChapters(chapters: ChapterMetadata[]): ChapterMetadata[] {
  return chapters.filter((chapter) => (
    chapter.chapterId !== "chapter-template"
    && (
      chapter.maps.length > 0
      || chapter.npcs.length > 0
      || chapter.events.length > 0
      || chapter.shops.length > 0
      || chapter.enemyGroups.length > 0
      || chapter.regressionCases.length > 0
    )
  ));
}

function getChapterCases(
  regressionReport: RegressionReport,
  chapter: ChapterMetadata,
): RegressionCaseReport[] {
  return chapter.regressionCases
    .map((caseId) => regressionReport.cases.find((entry) => entry.id === caseId))
    .filter((entry): entry is RegressionCaseReport => Boolean(entry));
}

function getMissingCaseIds(
  regressionReport: RegressionReport,
  chapter: ChapterMetadata,
): string[] {
  return chapter.regressionCases.filter(
    (caseId) => !regressionReport.cases.some((entry) => entry.id === caseId),
  );
}

function buildMapStructureScore(chapter: ChapterMetadata): ParityDimensionScore {
  const statuses = [
    chapter.paritySummary.mapLayout,
    chapter.paritySummary.collision,
  ];
  const issues: ParityIssue[] = [];

  statuses.forEach((status, index) => {
    const label = index === 0 ? "mapLayout" : "collision";
    if (status === "planned" || status === "importing") {
      issues.push(createIssue("blocker", `${label} remains ${status}`));
    } else if (status !== "locked") {
      issues.push(createIssue("minor", `${label} is ${status}, not locked`));
    }
  });

  return {
    id: "map-structure",
    label: "地图结构一致性 / Map Structure Consistency",
    score: average(statuses.map((status) => STATUS_SCORES[status])),
    maxScore: 100,
    weight: 20,
    applicable: chapter.maps.length > 0,
    evidence: [
      `maps=${chapter.maps.join(", ")}`,
      `mapLayout=${formatStatus(chapter.paritySummary.mapLayout)}`,
      `collision=${formatStatus(chapter.paritySummary.collision)}`,
    ],
    issues,
  };
}

function buildNpcPlacementScore(
  chapter: ChapterMetadata,
  chapterCases: RegressionCaseReport[],
): ParityDimensionScore {
  const coveredNpcIds = new Set(
    chapterCases
      .map((entry) => entry.locator.npcId)
      .filter((npcId): npcId is string => Boolean(npcId)),
  );
  const coverageRatio = chapter.npcs.length === 0
    ? 1
    : coveredNpcIds.size / chapter.npcs.length;
  const issues: ParityIssue[] = [];

  if (chapter.paritySummary.npcPlacement === "planned" || chapter.paritySummary.npcPlacement === "importing") {
    issues.push(createIssue("blocker", `npcPlacement remains ${chapter.paritySummary.npcPlacement}`));
  } else if (chapter.paritySummary.npcPlacement !== "locked") {
    issues.push(createIssue("minor", `npcPlacement is ${chapter.paritySummary.npcPlacement}, not locked`));
  }

  if (coverageRatio < 0.5) {
    issues.push(createIssue("blocker", `NPC regression coverage is only ${Math.round(coverageRatio * 100)}%`));
  } else if (coverageRatio < 1) {
    const uncovered = chapter.npcs.filter((npcId) => !coveredNpcIds.has(npcId));
    issues.push(createIssue("minor", `NPC regression coverage misses ${uncovered.join(", ")}`));
  }

  return {
    id: "npc-placement",
    label: "NPC 摆放一致性 / NPC Placement Consistency",
    score: average([
      STATUS_SCORES[chapter.paritySummary.npcPlacement],
      Math.round(coverageRatio * 100),
    ]),
    maxScore: 100,
    weight: 12,
    applicable: chapter.npcs.length > 0,
    evidence: [
      `npcs=${chapter.npcs.join(", ")}`,
      `coverage=${coveredNpcIds.size}/${chapter.npcs.length}`,
      `npcPlacement=${formatStatus(chapter.paritySummary.npcPlacement)}`,
    ],
    issues,
  };
}

function buildEventTriggerScore(
  chapter: ChapterMetadata,
  chapterCases: RegressionCaseReport[],
  missingCaseIds: string[],
): ParityDimensionScore {
  const coveredEventIds = new Set(
    chapterCases
      .map((entry) => entry.locator.eventId)
      .filter((eventId): eventId is string => Boolean(eventId)),
  );
  const coverageRatio = chapter.events.length === 0
    ? 1
    : coveredEventIds.size / chapter.events.length;
  const statuses = [
    chapter.paritySummary.events,
    chapter.paritySummary.flags,
    chapter.paritySummary.transitions,
  ];
  const issues: ParityIssue[] = [];

  statuses.forEach((status, index) => {
    const label = ["events", "flags", "transitions"][index];
    if (status === "planned" || status === "importing") {
      issues.push(createIssue("blocker", `${label} remains ${status}`));
    } else if (status !== "locked") {
      issues.push(createIssue("minor", `${label} is ${status}, not locked`));
    }
  });

  if (missingCaseIds.length > 0) {
    issues.push(createIssue("blocker", `Missing regression cases: ${missingCaseIds.join(", ")}`));
  }

  if (coverageRatio < 0.5) {
    issues.push(createIssue("blocker", `Event regression coverage is only ${Math.round(coverageRatio * 100)}%`));
  } else if (coverageRatio < 1) {
    const uncovered = chapter.events.filter((eventId) => !coveredEventIds.has(eventId));
    issues.push(createIssue("minor", `Event regression coverage misses ${uncovered.join(", ")}`));
  }

  if (chapterCases.some((entry) => entry.status !== "pass")) {
    issues.push(createIssue("blocker", "At least one chapter event regression case is not passing"));
  }

  return {
    id: "event-triggers",
    label: "事件触发一致性 / Event Trigger Consistency",
    score: average([
      average(statuses.map((status) => STATUS_SCORES[status])),
      Math.round(coverageRatio * 100),
    ]),
    maxScore: 100,
    weight: 20,
    applicable: chapter.events.length > 0,
    evidence: [
      `events=${chapter.events.join(", ")}`,
      `coverage=${coveredEventIds.size}/${chapter.events.length}`,
      `events=${formatStatus(chapter.paritySummary.events)}`,
      `flags=${formatStatus(chapter.paritySummary.flags)}`,
      `transitions=${formatStatus(chapter.paritySummary.transitions)}`,
    ],
    issues,
  };
}

function buildDialogueCoverageScore(
  chapter: ChapterMetadata,
  chapterCases: RegressionCaseReport[],
): ParityDimensionScore {
  const dialogueCaseCount = chapterCases.filter(
    (entry) => (entry.observedUi?.dialogueLineIds?.length ?? entry.expectedUi?.dialogueLineIds?.length ?? 0) > 0,
  ).length;
  const coverageRatio = chapter.events.length === 0
    ? 1
    : Math.min(1, dialogueCaseCount / chapter.events.length);
  const issues: ParityIssue[] = [];

  if (chapter.paritySummary.dialogue === "planned" || chapter.paritySummary.dialogue === "importing") {
    issues.push(createIssue("blocker", `dialogue remains ${chapter.paritySummary.dialogue}`));
  } else if (chapter.paritySummary.dialogue !== "locked") {
    issues.push(createIssue("minor", `dialogue is ${chapter.paritySummary.dialogue}, not locked`));
  }

  if (dialogueCaseCount === 0 && chapter.events.length > 0) {
    issues.push(createIssue("blocker", "No dialogue-bearing regression cases are bound to this chapter"));
  }

  return {
    id: "dialogue-coverage",
    label: "对话覆盖一致性 / Dialogue Coverage Consistency",
    score: average([
      STATUS_SCORES[chapter.paritySummary.dialogue],
      Math.round(coverageRatio * 100),
    ]),
    maxScore: 100,
    weight: 14,
    applicable: chapter.events.length > 0,
    evidence: [
      `dialogue=${formatStatus(chapter.paritySummary.dialogue)}`,
      `dialogueCases=${dialogueCaseCount}`,
      `chapterEvents=${chapter.events.length}`,
    ],
    issues,
  };
}

function buildBattleScore(
  chapter: ChapterMetadata,
  chapterCases: RegressionCaseReport[],
): ParityDimensionScore {
  if (chapter.enemyGroups.length === 0) {
    return {
      id: "battle-rewards",
      label: "战斗与奖励一致性 / Battle And Reward Consistency",
      score: 100,
      maxScore: 100,
      weight: 14,
      applicable: false,
      evidence: ["Not applicable for this chapter slice."],
      issues: [],
    };
  }

  const battleCases = chapterCases.filter((entry) => Boolean(entry.observedUi?.battleOutcome));
  const coverageRatio = Math.min(1, battleCases.length / chapter.enemyGroups.length);
  const issues: ParityIssue[] = [];

  if (chapter.paritySummary.battles === "planned" || chapter.paritySummary.battles === "importing") {
    issues.push(createIssue("blocker", `battles remains ${chapter.paritySummary.battles}`));
  } else if (chapter.paritySummary.battles !== "locked") {
    issues.push(createIssue("minor", `battles is ${chapter.paritySummary.battles}, not locked`));
  }

  if (battleCases.length === 0) {
    issues.push(createIssue("blocker", "No battle regression case covers this chapter"));
  }

  return {
    id: "battle-rewards",
    label: "战斗与奖励一致性 / Battle And Reward Consistency",
    score: average([
      STATUS_SCORES[chapter.paritySummary.battles],
      Math.round(coverageRatio * 100),
    ]),
    maxScore: 100,
    weight: 14,
    applicable: true,
    evidence: [
      `enemyGroups=${chapter.enemyGroups.join(", ")}`,
      `battleCases=${battleCases.length}`,
      `battles=${formatStatus(chapter.paritySummary.battles)}`,
    ],
    issues,
  };
}

function buildShopScore(
  chapter: ChapterMetadata,
  chapterCases: RegressionCaseReport[],
): ParityDimensionScore {
  if (chapter.shops.length === 0) {
    return {
      id: "shop-consistency",
      label: "商店一致性 / Shop Consistency",
      score: 100,
      maxScore: 100,
      weight: 10,
      applicable: false,
      evidence: ["Not applicable for this chapter slice."],
      issues: [],
    };
  }

  const shopCases = chapterCases.filter((entry) => {
    const shopId = entry.observedUi?.shopId ?? entry.expectedUi?.shopId;
    return Boolean(shopId && chapter.shops.includes(shopId));
  });
  const coverageRatio = Math.min(1, shopCases.length / chapter.shops.length);
  const issues: ParityIssue[] = [];

  if (chapter.paritySummary.shops === "planned" || chapter.paritySummary.shops === "importing") {
    issues.push(createIssue("blocker", `shops remains ${chapter.paritySummary.shops}`));
  } else if (chapter.paritySummary.shops !== "locked") {
    issues.push(createIssue("minor", `shops is ${chapter.paritySummary.shops}, not locked`));
  }

  if (shopCases.length === 0) {
    issues.push(createIssue("blocker", "No shop regression case covers this chapter"));
  }

  return {
    id: "shop-consistency",
    label: "商店一致性 / Shop Consistency",
    score: average([
      STATUS_SCORES[chapter.paritySummary.shops],
      Math.round(coverageRatio * 100),
    ]),
    maxScore: 100,
    weight: 10,
    applicable: true,
    evidence: [
      `shops=${chapter.shops.join(", ")}`,
      `shopCases=${shopCases.length}`,
      `shops=${formatStatus(chapter.paritySummary.shops)}`,
    ],
    issues,
  };
}

function buildSaveRestoreScore(
  chapter: ChapterMetadata,
  chapterCases: RegressionCaseReport[],
): ParityDimensionScore {
  const saveCases = chapterCases.filter((entry) => entry.locator.triggerKind === "saveLoadRoundTrip");
  const issues: ParityIssue[] = [];
  let score = 100;

  if (saveCases.length === 0) {
    score = 40;
    issues.push(createIssue("blocker", "No chapter-specific save/load regression case is bound"));
  } else if (saveCases.some((entry) => entry.status !== "pass")) {
    score = 20;
    issues.push(createIssue("blocker", "A chapter save/load regression case is failing or mismatched"));
  }

  return {
    id: "save-restore",
    label: "存档恢复一致性 / Save Restore Consistency",
    score,
    maxScore: 100,
    weight: 10,
    applicable: true,
    evidence: [
      `saveCases=${saveCases.length}`,
      `chapterStatus=${formatStatus(chapter.status)}`,
    ],
    issues,
  };
}

function summarizeChapterScore(
  chapter: ChapterMetadata,
  regressionReport: RegressionReport,
): ChapterParityScore {
  const chapterCases = getChapterCases(regressionReport, chapter);
  const missingCaseIds = getMissingCaseIds(regressionReport, chapter);
  const dimensions = [
    buildMapStructureScore(chapter),
    buildNpcPlacementScore(chapter, chapterCases),
    buildEventTriggerScore(chapter, chapterCases, missingCaseIds),
    buildDialogueCoverageScore(chapter, chapterCases),
    buildBattleScore(chapter, chapterCases),
    buildShopScore(chapter, chapterCases),
    buildSaveRestoreScore(chapter, chapterCases),
  ];

  const applicableDimensions = dimensions.filter((dimension) => dimension.applicable);
  const weightedScore = applicableDimensions.reduce(
    (sum, dimension) => sum + (dimension.score * dimension.weight),
    0,
  );
  const totalWeight = applicableDimensions.reduce((sum, dimension) => sum + dimension.weight, 0);
  const totalScore = totalWeight === 0 ? 100 : clampScore(weightedScore / totalWeight);
  const blockers = dimensions.flatMap((dimension) =>
    dimension.issues
      .filter((issue) => issue.severity === "blocker")
      .map((issue) => `${dimension.label}: ${issue.message}`),
  );
  const minorMismatches = dimensions.flatMap((dimension) =>
    dimension.issues
      .filter((issue) => issue.severity === "minor")
      .map((issue) => `${dimension.label}: ${issue.message}`),
  );

  return {
    chapterId: chapter.chapterId,
    title: chapter.title,
    areaLabel: chapter.areaLabel,
    status: chapter.status,
    totalScore,
    maxScore: 100,
    blockerCount: blockers.length,
    minorCount: minorMismatches.length,
    regressionCaseCount: chapter.regressionCases.length,
    regressionPassCount: chapterCases.filter((entry) => entry.status === "pass").length,
    dimensions,
    blockers,
    minorMismatches,
  };
}

export async function loadRegressionReport(reportPath: string): Promise<RegressionReport> {
  return readJsonFile<RegressionReport>(reportPath);
}

export async function buildParityScoreReport(options?: {
  chapterDirectory?: string;
  regressionReportPath?: string;
}): Promise<ParityScoreReport> {
  const chapterDirectory = options?.chapterDirectory
    ?? path.join(repoRoot, "content", "manual", "chapters");
  const regressionReportPath = options?.regressionReportPath
    ?? path.join(repoRoot, "reports", "regression", "latest", "report.json");

  const chapters = getRealChapters(await loadAllChapterMetadata(chapterDirectory));
  const regressionReport = await loadRegressionReport(regressionReportPath);
  const chapterScores = chapters.map((chapter) => summarizeChapterScore(chapter, regressionReport));

  return {
    generatedAt: new Date().toISOString(),
    source: {
      chapterDirectory,
      regressionReportPath,
    },
    totals: {
      chapterCount: chapterScores.length,
      blockerCount: chapterScores.reduce((sum, chapter) => sum + chapter.blockerCount, 0),
      minorCount: chapterScores.reduce((sum, chapter) => sum + chapter.minorCount, 0),
      averageScore: average(chapterScores.map((chapter) => chapter.totalScore)),
    },
    chapters: chapterScores,
  };
}

export async function readSummaryTemplate(readmePath: string): Promise<string> {
  return readFile(readmePath, "utf8");
}
