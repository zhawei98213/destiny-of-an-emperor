import path from "node:path";
import { readJsonFile, repoRoot } from "./importerCore";
import type { ParityScoreReport } from "./parityScoring";
import type { UiParityReport } from "./uiParity";

export type TriagePriority = "P0" | "P1" | "P2" | "P3";

export interface TriageEvidence {
  source: "parity-score" | "regression-smoke" | "ui-parity";
  chapterId: string;
  dimensionId?: string;
  messages: string[];
  caseIds?: string[];
}

export interface RepairBacklogItem {
  id: string;
  priority: TriagePriority;
  title: string;
  summary: string;
  source: TriageEvidence[];
  impactScope: {
    chapters: string[];
    systems: string[];
    maps?: string[];
  };
  suggestedRepairTargets: string[];
  dependencies: string[];
}

export interface DiscrepancyTriageReport {
  generatedAt: string;
  inputs: {
    parityReportPath: string;
    regressionReportPath: string;
    uiParityReportPath?: string;
  };
  summary: {
    totalItems: number;
    byPriority: Record<TriagePriority, number>;
    blockerCount: number;
    minorCount: number;
  };
  backlog: RepairBacklogItem[];
}

interface RegressionCaseSummary {
  id: string;
  status: "pass" | "mismatch" | "fail";
  locator: {
    mapId?: string;
    eventId?: string;
    triggerId?: string;
  };
}

interface RegressionReportSummary {
  totals: {
    pass: number;
    mismatch: number;
    fail: number;
    total: number;
  };
  cases: RegressionCaseSummary[];
}

interface DiscrepancyTriageOptions {
  parityReportPath?: string;
  regressionReportPath?: string;
  uiParityReportPath?: string;
}

interface ItemSeed {
  id: string;
  priority: TriagePriority;
  title: string;
  summary: string;
  chapters: string[];
  systems: string[];
  maps?: string[];
  suggestedRepairTargets: string[];
  dependencies: string[];
  source: TriageEvidence[];
}

const PRIORITY_ORDER: TriagePriority[] = ["P0", "P1", "P2", "P3"];

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function mergeBacklogItems(seeds: ItemSeed[]): RepairBacklogItem[] {
  const merged = new Map<string, ItemSeed>();

  seeds.forEach((seed) => {
    const existing = merged.get(seed.id);
    if (!existing) {
      merged.set(seed.id, {
        ...seed,
        chapters: [...seed.chapters],
        systems: [...seed.systems],
        maps: seed.maps ? [...seed.maps] : undefined,
        suggestedRepairTargets: [...seed.suggestedRepairTargets],
        dependencies: [...seed.dependencies],
        source: [...seed.source],
      });
      return;
    }

    existing.priority = PRIORITY_ORDER.indexOf(seed.priority) < PRIORITY_ORDER.indexOf(existing.priority)
      ? seed.priority
      : existing.priority;
    existing.chapters = unique([...existing.chapters, ...seed.chapters]);
    existing.systems = unique([...existing.systems, ...seed.systems]);
    existing.maps = unique([...(existing.maps ?? []), ...(seed.maps ?? [])]);
    existing.suggestedRepairTargets = unique([...existing.suggestedRepairTargets, ...seed.suggestedRepairTargets]);
    existing.dependencies = unique([...existing.dependencies, ...seed.dependencies]);
    existing.source = [...existing.source, ...seed.source];
  });

  return [...merged.values()]
    .map((entry) => ({
      id: entry.id,
      priority: entry.priority,
      title: entry.title,
      summary: entry.summary,
      source: entry.source,
      impactScope: {
        chapters: entry.chapters,
        systems: entry.systems,
        maps: entry.maps?.length ? entry.maps : undefined,
      },
      suggestedRepairTargets: entry.suggestedRepairTargets,
      dependencies: entry.dependencies,
    }))
    .sort((left, right) => {
      const priorityDiff = PRIORITY_ORDER.indexOf(left.priority) - PRIORITY_ORDER.indexOf(right.priority);
      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      return left.id.localeCompare(right.id);
    });
}

function createEvidence(
  chapterId: string,
  dimensionId: string,
  messages: string[],
  caseIds?: string[],
): TriageEvidence {
  return {
    source: "parity-score",
    chapterId,
    dimensionId,
    messages,
    caseIds,
  };
}

function buildSeeds(
  parityReport: ParityScoreReport,
  regressionReport: RegressionReportSummary,
  uiParityReport?: UiParityReport,
): ItemSeed[] {
  const seeds: ItemSeed[] = [];

  parityReport.chapters.forEach((chapter) => {
    const mapStructure = chapter.dimensions.find((entry) => entry.id === "map-structure");
    const npcPlacement = chapter.dimensions.find((entry) => entry.id === "npc-placement");
    const eventTriggers = chapter.dimensions.find((entry) => entry.id === "event-triggers");
    const dialogue = chapter.dimensions.find((entry) => entry.id === "dialogue-coverage");
    const battle = chapter.dimensions.find((entry) => entry.id === "battle-rewards");
    const shop = chapter.dimensions.find((entry) => entry.id === "shop-consistency");
    const saveRestore = chapter.dimensions.find((entry) => entry.id === "save-restore");

    const mapBlockers = [
      ...(mapStructure?.issues.filter((issue) => issue.severity === "blocker").map((issue) => issue.message) ?? []),
      ...(npcPlacement?.issues.filter((issue) => issue.severity === "blocker").map((issue) => issue.message) ?? []),
    ];
    const mapMinorIssues = mapStructure?.issues.filter((issue) => issue.severity === "minor").map((issue) => issue.message) ?? [];
    const npcMinorIssues = npcPlacement?.issues.filter((issue) => issue.severity === "minor").map((issue) => issue.message) ?? [];
    const mapMinors = [...mapMinorIssues, ...npcMinorIssues];

    if (mapBlockers.length > 0) {
      seeds.push({
        id: `${chapter.chapterId}:spatial-parity`,
        priority: "P0",
        title: `${chapter.chapterId} spatial parity lock`,
        summary: "Lock map layout, collision, and NPC placement before importing more adjacent real content into this slice.",
        chapters: [chapter.chapterId],
        systems: ["content-pipeline", "world-runtime"],
        suggestedRepairTargets: [
          path.join(repoRoot, "content", "source", "maps"),
          path.join(repoRoot, "content", "manual", "world.content.json"),
          path.join(repoRoot, "tests", "regression", "golden-cases.json"),
        ],
        dependencies: [],
        source: [
          createEvidence(chapter.chapterId, "map-structure", [
            ...(mapStructure?.issues.map((issue) => issue.message) ?? []),
          ]),
          createEvidence(chapter.chapterId, "npc-placement", [
            ...(npcPlacement?.issues.map((issue) => issue.message) ?? []),
          ]),
        ],
      });
    } else if (mapMinors.length > 0) {
      seeds.push({
        id: `${chapter.chapterId}:spatial-lockdown`,
        priority: "P2",
        title: `${chapter.chapterId} spatial lockdown`,
        summary: "Finish the remaining map and NPC parity checks for this chapter slice.",
        chapters: [chapter.chapterId],
        systems: ["content-pipeline", "world-runtime"],
        suggestedRepairTargets: [
          path.join(repoRoot, "content", "source", "maps"),
          path.join(repoRoot, "content", "manual", "world.content.json"),
          path.join(repoRoot, "tests", "regression", "golden-cases.json"),
        ],
        dependencies: [],
        source: [
          createEvidence(chapter.chapterId, "map-structure", mapMinorIssues),
          createEvidence(chapter.chapterId, "npc-placement", npcMinorIssues),
        ],
      });
    }

    const eventMainFlowIssues = eventTriggers?.issues.map((issue) => issue.message) ?? [];
    if (eventMainFlowIssues.length > 0) {
      seeds.push({
        id: `${chapter.chapterId}:main-flow-events`,
        priority: "P1",
        title: `${chapter.chapterId} main flow event parity`,
        summary: "Close the remaining main-flow event, flag, and trigger coverage gaps that affect chapter progression.",
        chapters: [chapter.chapterId],
        systems: ["event-interpreter", "world-runtime", "regression"],
        suggestedRepairTargets: [
          path.join(repoRoot, "content", "manual", "story.content.json"),
          path.join(repoRoot, "content", "manual", "world.content.json"),
          path.join(repoRoot, "tests", "regression", "golden-cases.json"),
        ],
        dependencies: mapBlockers.length > 0 ? [`${chapter.chapterId}:spatial-parity`] : [],
        source: [
          createEvidence(chapter.chapterId, "event-triggers", eventMainFlowIssues, chapter.regressionCaseCount ? [] : undefined),
        ],
      });
    }

    const saveIssues = saveRestore?.issues.map((issue) => issue.message) ?? [];
    if (saveIssues.length > 0) {
      seeds.push({
        id: `${chapter.chapterId}:save-restore`,
        priority: "P0",
        title: `${chapter.chapterId} save restore regression`,
        summary: "Add or fix chapter-specific save/load coverage before extending this chapter with more real content.",
        chapters: [chapter.chapterId],
        systems: ["save-manager", "game-state-runtime", "regression"],
        suggestedRepairTargets: [
          path.join(repoRoot, "tests", "regression", "golden-cases.json"),
          path.join(repoRoot, "content", "manual", "chapters"),
          path.join(repoRoot, "game", "src", "systems", "saveManager.ts"),
        ],
        dependencies: [],
        source: [
          createEvidence(chapter.chapterId, "save-restore", saveIssues),
        ],
      });
    }

    const battleIssues = battle?.issues.map((issue) => issue.message) ?? [];
    if (battleIssues.length > 0) {
      seeds.push({
        id: `${chapter.chapterId}:battle-local-parity`,
        priority: "P2",
        title: `${chapter.chapterId} battle and reward parity`,
        summary: "Align local battle groups and reward data with the intended chapter slice once the core chapter loop is stable.",
        chapters: [chapter.chapterId],
        systems: ["battle-runtime", "content-pipeline"],
        suggestedRepairTargets: [
          path.join(repoRoot, "content", "source", "data"),
          path.join(repoRoot, "content", "generated", "battle.content.json"),
          path.join(repoRoot, "tests", "regression", "golden-cases.json"),
        ],
        dependencies: eventMainFlowIssues.length > 0 ? [`${chapter.chapterId}:main-flow-events`] : [],
        source: [
          createEvidence(chapter.chapterId, "battle-rewards", battleIssues),
        ],
      });
    }

    const shopIssues = shop?.issues.map((issue) => issue.message) ?? [];
    if (shopIssues.length > 0) {
      seeds.push({
        id: `${chapter.chapterId}:shop-local-parity`,
        priority: "P2",
        title: `${chapter.chapterId} shop parity`,
        summary: "Lock shop goods, pricing, and shop-side behavior after the chapter's main flow is stable.",
        chapters: [chapter.chapterId],
        systems: ["content-pipeline", "shop-overlay"],
        suggestedRepairTargets: [
          path.join(repoRoot, "content", "source", "data"),
          path.join(repoRoot, "content", "manual", "story.content.json"),
          path.join(repoRoot, "tests", "regression", "golden-cases.json"),
        ],
        dependencies: eventMainFlowIssues.length > 0 ? [`${chapter.chapterId}:main-flow-events`] : [],
        source: [
          createEvidence(chapter.chapterId, "shop-consistency", shopIssues),
        ],
      });
    }

    const dialogueIssues = dialogue?.issues.map((issue) => issue.message) ?? [];
    if (dialogueIssues.length > 0) {
      seeds.push({
        id: `${chapter.chapterId}:dialogue-polish`,
        priority: "P3",
        title: `${chapter.chapterId} dialogue source lock`,
        summary: "Replace curated text with source-verified dialogue and close remaining dialogue-only parity drift.",
        chapters: [chapter.chapterId],
        systems: ["content-pipeline"],
        suggestedRepairTargets: [
          path.join(repoRoot, "content", "source", "text"),
          path.join(repoRoot, "content", "manual", "story.content.json"),
        ],
        dependencies: eventMainFlowIssues.length > 0 ? [`${chapter.chapterId}:main-flow-events`] : [],
        source: [
          createEvidence(chapter.chapterId, "dialogue-coverage", dialogueIssues),
        ],
      });
    }
  });

  if (regressionReport.totals.mismatch > 0 || regressionReport.totals.fail > 0) {
    seeds.push({
      id: "cross-chapter:regression-breakage",
      priority: "P0",
      title: "Cross-chapter regression breakage",
      summary: "Repair non-passing regression cases before importing or locking more real content.",
      chapters: unique(regressionReport.cases.map((entry) => entry.locator.mapId ?? "unknown")),
      systems: ["regression", "runtime"],
      suggestedRepairTargets: [
        path.join(repoRoot, "reports", "regression", "latest"),
        path.join(repoRoot, "tests", "regression", "golden-cases.json"),
      ],
      dependencies: [],
      source: [{
        source: "regression-smoke",
        chapterId: "cross-chapter",
        messages: [`mismatch=${regressionReport.totals.mismatch}`, `fail=${regressionReport.totals.fail}`],
        caseIds: regressionReport.cases
          .filter((entry) => entry.status !== "pass")
          .map((entry) => entry.id),
      }],
    });
  }

  uiParityReport?.cases
    .filter((entry) => entry.status === "diverged" && entry.priority)
    .forEach((entry) => {
      const priority = entry.priority;
      if (!priority) {
        return;
      }

      seeds.push({
        id: `ui:${entry.repairGroupId}`,
        priority,
        title: entry.title,
        summary: entry.differences[0] ?? "UI parity gap requires follow-up.",
        chapters: [entry.locator.chapterId],
        systems: unique(entry.systems),
        maps: [entry.locator.mapId],
        suggestedRepairTargets: [...entry.suggestedRepairTargets],
        dependencies: [],
        source: [{
          source: "ui-parity",
          chapterId: entry.locator.chapterId,
          dimensionId: entry.area,
          messages: [...entry.differences],
          caseIds: [entry.id],
        }],
      });
    });

  return seeds;
}

async function loadOptionalUiParityReport(targetPath: string | undefined): Promise<UiParityReport | undefined> {
  if (!targetPath) {
    return undefined;
  }

  try {
    return await readJsonFile<UiParityReport>(targetPath);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("ENOENT") || message.includes("no such file")) {
      return undefined;
    }

    throw error;
  }
}

export async function buildDiscrepancyTriageReport(options?: DiscrepancyTriageOptions): Promise<DiscrepancyTriageReport> {
  const parityReportPath = options?.parityReportPath
    ?? path.join(repoRoot, "reports", "parity", "latest", "report.json");
  const regressionReportPath = options?.regressionReportPath
    ?? path.join(repoRoot, "reports", "regression", "latest", "report.json");
  const uiParityReportPath = options?.uiParityReportPath
    ?? path.join(repoRoot, "reports", "ui-parity", "latest", "report.json");

  const parityReport = await readJsonFile<ParityScoreReport>(parityReportPath);
  const regressionReport = await readJsonFile<RegressionReportSummary>(regressionReportPath);
  const uiParityReport = await loadOptionalUiParityReport(uiParityReportPath);
  const backlog = mergeBacklogItems(buildSeeds(parityReport, regressionReport, uiParityReport));
  const byPriority = {
    P0: backlog.filter((entry) => entry.priority === "P0").length,
    P1: backlog.filter((entry) => entry.priority === "P1").length,
    P2: backlog.filter((entry) => entry.priority === "P2").length,
    P3: backlog.filter((entry) => entry.priority === "P3").length,
  };

  return {
    generatedAt: new Date().toISOString(),
    inputs: {
      parityReportPath,
      regressionReportPath,
      uiParityReportPath: uiParityReport ? uiParityReportPath : undefined,
    },
    summary: {
      totalItems: backlog.length,
      byPriority,
      blockerCount: byPriority.P0,
      minorCount: byPriority.P1 + byPriority.P2 + byPriority.P3,
    },
    backlog,
  };
}
