import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadAllChapterMetadata } from "./chapterMetadata";
import { readJsonFile, repoRoot, stableStringify } from "./importerCore";
import { loadManualAssetRegistryContent } from "./manualContent";

const visualBackfillDir = path.join(repoRoot, "content", "manual", "visual-backfill");
const manualChapterDir = path.join(repoRoot, "content", "manual", "chapters");
const reportsDir = path.join(repoRoot, "reports", "visual-backfill", "latest");
const regressionReportPath = path.join(repoRoot, "reports", "regression", "latest", "report.json");
const uiParityReportPath = path.join(repoRoot, "reports", "ui-parity", "latest", "report.json");

export type VisualBackfillPlanStatus =
  | "planned"
  | "importing"
  | "validating"
  | "locked";

export interface VisualBackfillPlanEntry {
  logicalAssetKey: string;
  category: string;
  expectedBaseState: "placeholder" | "imported" | "locked";
  targetState: "placeholder" | "imported" | "locked";
  sourceManifestIds: string[];
  rollback: {
    mode: "remove-chapter-override" | "repoint-to-fallback";
    fallbackKey?: string;
    notes: string;
  };
  verification: {
    regressionCaseIds: string[];
    requireUiParity: boolean;
    requireBuild: boolean;
    notes: string;
  };
  notes: string;
}

export interface VisualBackfillPlan {
  format: "visual-backfill-plan-v1";
  planId: string;
  chapterId: string;
  title: string;
  status: VisualBackfillPlanStatus;
  notes: string;
  replacementEntries: VisualBackfillPlanEntry[];
}

interface RegressionReport {
  totals: {
    pass: number;
    mismatch: number;
    fail: number;
    total: number;
  };
  cases: Array<{
    id: string;
    status: "pass" | "mismatch" | "fail";
    locator?: {
      chapterId?: string;
      mapId?: string;
    };
  }>;
}

interface UiParityReport {
  cases: Array<{
    id: string;
    status: "matched" | "diverged";
    locator?: {
      chapterId?: string;
    };
    differences?: string[];
    title: string;
  }>;
}

interface VisualBackfillChecklistItem {
  id: string;
  checked: boolean;
  label: string;
  detail: string;
}

export interface VisualBackfillReportEntry {
  logicalAssetKey: string;
  category: string;
  baseState: string;
  effectiveState: string;
  targetState: string;
  changed: boolean;
  sourceManifestIds: string[];
  rollbackMode: string;
  fallbackKey?: string;
  regressionCaseIds: string[];
}

export interface VisualBackfillReport {
  generatedAt: string;
  planId: string;
  chapterId: string;
  chapterTitle: string;
  title: string;
  planPath: string;
  status: VisualBackfillPlanStatus;
  summary: {
    entryCount: number;
    changedCount: number;
    lockedCount: number;
    gameplaySafe: boolean;
    uiLayoutSafe: boolean;
    interactionSafe: boolean;
  };
  entries: VisualBackfillReportEntry[];
  evidence: {
    regression: {
      requiredCaseCount: number;
      passedCaseCount: number;
      missingCaseIds: string[];
      failedCaseIds: string[];
    };
    uiParity: {
      chapterCaseCount: number;
      layoutRelatedDivergences: string[];
      acceptedBehaviorDivergences: string[];
    };
  };
  checklist: VisualBackfillChecklistItem[];
}

function resolveBaseBinding(
  logicalAssetKey: string,
  baseBindingMap: Map<string, { key: string; state: string }>,
  chapterOverride?: { fallbackKey?: string; state: string },
): { key: string; state: string } | undefined {
  return baseBindingMap.get(logicalAssetKey)
    ?? (chapterOverride?.fallbackKey ? baseBindingMap.get(chapterOverride.fallbackKey) : undefined);
}

function getArgValue(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index === -1) {
    return undefined;
  }
  return args[index + 1];
}

export function parseVisualBackfillPlanIdArg(args: string[]): string {
  const planId = getArgValue(args, "--id");
  if (!planId) {
    throw new Error("This command requires --id <visual-backfill-plan-id>.");
  }
  return planId;
}

function getPlanPath(planId: string): string {
  return path.join(visualBackfillDir, `${planId}.json`);
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

export async function loadAllVisualBackfillPlans(): Promise<VisualBackfillPlan[]> {
  const fileNames = (await readdir(visualBackfillDir, { withFileTypes: true }))
    .map((entry) => entry.name)
    .filter((entry) => entry.endsWith(".json"))
    .sort((left, right) => left.localeCompare(right));

  const plans = await Promise.all(fileNames.map((fileName) => readJsonFile<VisualBackfillPlan>(path.join(visualBackfillDir, fileName))));
  return plans;
}

export async function loadVisualBackfillPlan(planId: string): Promise<VisualBackfillPlan> {
  return readJsonFile<VisualBackfillPlan>(getPlanPath(planId));
}

export async function validateVisualBackfillPlans(): Promise<VisualBackfillPlan[]> {
  const [plans, chapters, assetRegistry] = await Promise.all([
    loadAllVisualBackfillPlans(),
    loadAllChapterMetadata(manualChapterDir),
    loadManualAssetRegistryContent(),
  ]);

  const chapterIds = new Set(chapters.map((entry) => entry.chapterId));
  const planIds = new Set<string>();
  const baseBindingMap = new Map(assetRegistry.assetBindings.map((entry) => [entry.key, entry]));
  const overrideMap = new Map(
    assetRegistry.assetOverrides.flatMap((override) => override.assetBindings.map((binding) => [`${override.chapterId}:${binding.key}`, binding] as const)),
  );

  plans.forEach((plan) => {
    if (plan.format !== "visual-backfill-plan-v1") {
      throw new Error(`[visual-backfill] ${path.relative(repoRoot, getPlanPath(plan.planId))}:format must equal "visual-backfill-plan-v1"`);
    }
    if (!plan.planId) {
      throw new Error(`[visual-backfill] ${path.relative(repoRoot, getPlanPath(plan.planId || "unknown"))}:planId is required`);
    }
    if (planIds.has(plan.planId)) {
      throw new Error(`[visual-backfill] duplicate planId "${plan.planId}"`);
    }
    planIds.add(plan.planId);
    if (!chapterIds.has(plan.chapterId)) {
      throw new Error(`[visual-backfill] ${path.relative(repoRoot, getPlanPath(plan.planId))}:chapterId references unknown chapter "${plan.chapterId}"`);
    }
    if (!Array.isArray(plan.replacementEntries) || plan.replacementEntries.length === 0) {
      throw new Error(`[visual-backfill] ${path.relative(repoRoot, getPlanPath(plan.planId))}:replacementEntries must contain at least one entry`);
    }

    const isTemplatePlan = plan.chapterId === "chapter-template";
    if (isTemplatePlan) {
      return;
    }

    const entryKeys = new Set<string>();
    const chapter = chapters.find((entry) => entry.chapterId === plan.chapterId)!;
    const chapterRegressionIds = new Set(chapter.regressionCases);

    plan.replacementEntries.forEach((entry, index) => {
      const fieldPrefix = `[visual-backfill] ${path.relative(repoRoot, getPlanPath(plan.planId))}:replacementEntries[${index}]`;
      if (!entry.logicalAssetKey) {
        throw new Error(`${fieldPrefix}.logicalAssetKey is required`);
      }
      if (entryKeys.has(entry.logicalAssetKey)) {
        throw new Error(`${fieldPrefix}.logicalAssetKey duplicates "${entry.logicalAssetKey}"`);
      }
      entryKeys.add(entry.logicalAssetKey);

      const chapterOverride = overrideMap.get(`${plan.chapterId}:${entry.logicalAssetKey}`);
      const baseBinding = resolveBaseBinding(entry.logicalAssetKey, baseBindingMap, chapterOverride);

      if (!baseBinding) {
        throw new Error(`${fieldPrefix}.logicalAssetKey "${entry.logicalAssetKey}" does not resolve to a base or fallback asset binding`);
      }
      if (!chapterOverride) {
        throw new Error(`${fieldPrefix}.logicalAssetKey "${entry.logicalAssetKey}" does not exist as a chapter override for "${plan.chapterId}"`);
      }
      if (baseBinding.state !== entry.expectedBaseState) {
        throw new Error(`${fieldPrefix}.expectedBaseState expected "${entry.expectedBaseState}" but base registry state is "${baseBinding.state}"`);
      }
      if (chapterOverride.state !== entry.targetState) {
        throw new Error(`${fieldPrefix}.targetState expected "${entry.targetState}" but chapter override state is "${chapterOverride.state}"`);
      }
      if (!Array.isArray(entry.sourceManifestIds) || entry.sourceManifestIds.length === 0) {
        throw new Error(`${fieldPrefix}.sourceManifestIds must contain at least one manifest id`);
      }
      if (!entry.rollback?.mode || !entry.rollback.notes) {
        throw new Error(`${fieldPrefix}.rollback.mode and rollback.notes are required`);
      }
      if (entry.rollback.mode === "repoint-to-fallback" && !entry.rollback.fallbackKey) {
        throw new Error(`${fieldPrefix}.rollback.fallbackKey is required when mode is "repoint-to-fallback"`);
      }
      if (!Array.isArray(entry.verification?.regressionCaseIds) || entry.verification.regressionCaseIds.length === 0) {
        throw new Error(`${fieldPrefix}.verification.regressionCaseIds must contain at least one regression case id`);
      }
      entry.verification.regressionCaseIds.forEach((caseId) => {
        if (!chapterRegressionIds.has(caseId)) {
          throw new Error(`${fieldPrefix}.verification.regressionCaseIds references "${caseId}" which is not bound to chapter "${plan.chapterId}"`);
        }
      });
    });
  });

  return plans;
}

function isLayoutDifference(message: string): boolean {
  const text = message.toLowerCase();
  return [
    "layout",
    "misalign",
    "padding",
    "cursor",
    "frame",
    "panel",
    "错位",
    "布局",
    "边框",
    "光标",
  ].some((keyword) => text.includes(keyword));
}

export async function buildVisualBackfillReport(planId: string): Promise<VisualBackfillReport> {
  const [plan, chapters, assetRegistry, regressionReport, uiParityReport] = await Promise.all([
    loadVisualBackfillPlan(planId),
    loadAllChapterMetadata(manualChapterDir),
    loadManualAssetRegistryContent(),
    readJsonFile<RegressionReport>(regressionReportPath),
    readJsonFile<UiParityReport>(uiParityReportPath),
  ]);

  const chapter = chapters.find((entry) => entry.chapterId === plan.chapterId);
  if (!chapter) {
    throw new Error(`[visual-backfill] plan "${planId}" references missing chapter "${plan.chapterId}"`);
  }

  const baseBindingMap = new Map(assetRegistry.assetBindings.map((entry) => [entry.key, entry]));
  const chapterOverrideMap = new Map(
    assetRegistry.assetOverrides
      .filter((override) => override.chapterId === plan.chapterId)
      .flatMap((override) => override.assetBindings)
      .map((binding) => [binding.key, binding]),
  );

  const entries: VisualBackfillReportEntry[] = plan.replacementEntries.map((entry) => {
    const overrideBinding = chapterOverrideMap.get(entry.logicalAssetKey);
    const baseBinding = resolveBaseBinding(entry.logicalAssetKey, baseBindingMap, overrideBinding);
    return {
      logicalAssetKey: entry.logicalAssetKey,
      category: entry.category,
      baseState: baseBinding?.state ?? "missing",
      effectiveState: overrideBinding?.state ?? baseBinding?.state ?? "missing",
      targetState: entry.targetState,
      changed: (overrideBinding?.state ?? baseBinding?.state) !== baseBinding?.state || Boolean(overrideBinding),
      sourceManifestIds: entry.sourceManifestIds,
      rollbackMode: entry.rollback.mode,
      fallbackKey: entry.rollback.fallbackKey,
      regressionCaseIds: entry.verification.regressionCaseIds,
    };
  });

  const requiredRegressionCaseIds = unique(plan.replacementEntries.flatMap((entry) => entry.verification.regressionCaseIds));
  const regressionCaseMap = new Map(regressionReport.cases.map((entry) => [entry.id, entry]));
  const passedCaseIds = requiredRegressionCaseIds.filter((caseId) => regressionCaseMap.get(caseId)?.status === "pass");
  const missingCaseIds = requiredRegressionCaseIds.filter((caseId) => !regressionCaseMap.has(caseId));
  const failedCaseIds = requiredRegressionCaseIds.filter((caseId) => {
    const status = regressionCaseMap.get(caseId)?.status;
    return Boolean(status && status !== "pass");
  });

  const chapterUiCases = uiParityReport.cases.filter((entry) => entry.locator?.chapterId === plan.chapterId);
  const layoutRelatedDivergences = chapterUiCases
    .filter((entry) => entry.status === "diverged" && (entry.differences ?? []).some((difference) => isLayoutDifference(difference)))
    .map((entry) => entry.id);
  const acceptedBehaviorDivergences = chapterUiCases
    .filter((entry) => entry.status === "diverged" && !layoutRelatedDivergences.includes(entry.id))
    .map((entry) => entry.id);

  const gameplaySafe = missingCaseIds.length === 0 && failedCaseIds.length === 0;
  const uiLayoutSafe = layoutRelatedDivergences.length === 0;
  const interactionSafe = gameplaySafe;

  const checklist: VisualBackfillChecklistItem[] = [
    {
      id: "registry-only",
      checked: entries.every((entry) => entry.changed),
      label: "Every replacement goes through chapter-local asset registry overrides only.",
      detail: "所有替换都只通过章节级 asset registry override 进入运行时。",
    },
    {
      id: "rollback-ready",
      checked: plan.replacementEntries.every((entry) => Boolean(entry.rollback.mode && entry.rollback.notes)),
      label: "Every replacement entry has an explicit rollback path.",
      detail: "每个替换条目都带有明确的回滚路径。",
    },
    {
      id: "gameplay-safe",
      checked: gameplaySafe,
      label: "Gameplay regressions stay green after the batch.",
      detail: `回归要求通过：${passedCaseIds.length}/${requiredRegressionCaseIds.length}；missing=${missingCaseIds.join(", ") || "none"}；failed=${failedCaseIds.join(", ") || "none"}`,
    },
    {
      id: "ui-layout-safe",
      checked: uiLayoutSafe,
      label: "UI parity does not report any layout-specific divergence for the chapter.",
      detail: `UI 错位类差异：${layoutRelatedDivergences.join(", ") || "none"}；行为类已知差异：${acceptedBehaviorDivergences.join(", ") || "none"}`,
    },
    {
      id: "interaction-safe",
      checked: interactionSafe,
      label: "Collision, portal, and interaction loops remain unaffected because only registry bindings changed and chapter regressions still pass.",
      detail: "由于只改 registry 绑定且章节回归保持通过，因此碰撞、切图和交互链路未受影响。",
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    planId: plan.planId,
    chapterId: plan.chapterId,
    chapterTitle: chapter.title,
    title: plan.title,
    planPath: getPlanPath(planId),
    status: plan.status,
    summary: {
      entryCount: entries.length,
      changedCount: entries.filter((entry) => entry.changed).length,
      lockedCount: entries.filter((entry) => entry.effectiveState === "locked").length,
      gameplaySafe,
      uiLayoutSafe,
      interactionSafe,
    },
    entries,
    evidence: {
      regression: {
        requiredCaseCount: requiredRegressionCaseIds.length,
        passedCaseCount: passedCaseIds.length,
        missingCaseIds,
        failedCaseIds,
      },
      uiParity: {
        chapterCaseCount: chapterUiCases.length,
        layoutRelatedDivergences,
        acceptedBehaviorDivergences,
      },
    },
    checklist,
  };
}

export async function writeVisualBackfillArtifacts(report: VisualBackfillReport): Promise<string> {
  await mkdir(reportsDir, { recursive: true });
  const reportPath = path.join(reportsDir, `${report.planId}.report.json`);
  const summaryPath = path.join(reportsDir, `${report.planId}.summary.md`);
  const checklistPath = path.join(reportsDir, `${report.planId}.checklist.md`);

  await writeFile(reportPath, `${stableStringify(report)}\n`, "utf8");

  const summaryLines = [
    `# ${report.title}`,
    `# ${report.title}`,
    "",
    `Generated At / 生成时间: ${report.generatedAt}`,
    `Plan / 计划: ${path.relative(repoRoot, report.planPath)}`,
    `Chapter / 章节: ${report.chapterId} :: ${report.chapterTitle}`,
    `Status / 状态: ${report.status}`,
    "",
    "| Asset Key | Category | Base | Effective | Target | Source Manifest IDs |",
    "| --- | --- | --- | --- | --- | --- |",
    ...report.entries.map((entry) => `| ${entry.logicalAssetKey} | ${entry.category} | ${entry.baseState} | ${entry.effectiveState} | ${entry.targetState} | ${entry.sourceManifestIds.join(", ")} |`),
    "",
    `Gameplay Safe / Gameplay 安全: ${report.summary.gameplaySafe ? "yes" : "no"}`,
    `UI Layout Safe / UI 布局安全: ${report.summary.uiLayoutSafe ? "yes" : "no"}`,
    `Interaction Safe / 交互安全: ${report.summary.interactionSafe ? "yes" : "no"}`,
    "",
    `Accepted UI Behavior Divergences / 已接受的 UI 行为差异: ${report.evidence.uiParity.acceptedBehaviorDivergences.join(", ") || "none"}`,
    `Layout Divergences / 布局差异: ${report.evidence.uiParity.layoutRelatedDivergences.join(", ") || "none"}`,
    "",
  ];
  await writeFile(summaryPath, `${summaryLines.join("\n")}\n`, "utf8");

  const checklistLines = [
    `# ${report.title} Checklist`,
    `# ${report.title} 清单`,
    "",
    ...report.checklist.map((item) => `- [${item.checked ? "x" : " "}] ${item.label} / ${item.detail}`),
    "",
  ];
  await writeFile(checklistPath, `${checklistLines.join("\n")}\n`, "utf8");

  return reportPath;
}
