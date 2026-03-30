import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  type ChapterCompletenessIssue,
  runChapterCompletenessCheck,
} from "./chapterCompletenessCheck";
import {
  type ChapterMetadata,
  type ChapterStatus,
  loadAllChapterMetadata,
} from "./chapterMetadata";
import { repoRoot, stableStringify, writeStableJsonFile } from "./importerCore";
import type { ParityScoreReport } from "./parityScoring";
import type { UiParityReport } from "./uiParity";
import type { RegressionReport } from "./parityScoring";

const chapterDocsDir = path.join(repoRoot, "docs", "chapters");
const chapterMetadataDir = path.join(repoRoot, "content", "manual", "chapters");
const chapterReportsDir = path.join(repoRoot, "reports", "chapters", "latest");

interface ChapterBootstrapOptions {
  chapterId: string;
  title: string;
  areaLabel: string;
  status?: ChapterStatus;
}

export interface ChapterBootstrapResult {
  chapterId: string;
  createdFiles: string[];
}

export interface ChapterImportStatusEntry {
  chapterId: string;
  title: string;
  areaLabel: string;
  status: ChapterStatus;
  metadataPath: string;
  planPath: string;
  lockReportPath: string;
  completeness: {
    errorCount: number;
    warningCount: number;
  };
  parity?: {
    totalScore: number;
    blockerCount: number;
    minorCount: number;
  };
  regression: {
    boundCount: number;
    passCount: number;
    missingCount: number;
  };
  uiParity: {
    matchedCount: number;
    divergedCount: number;
  };
  readyForLockChecklist: boolean;
}

export interface ChapterImportStatusReport {
  generatedAt: string;
  chapters: ChapterImportStatusEntry[];
}

export interface ChapterLockChecklistReport {
  chapterId: string;
  title: string;
  generatedAt: string;
  items: Array<{
    label: string;
    checked: boolean;
    detail: string;
  }>;
}

function relativeToRepo(filePath: string): string {
  return path.relative(repoRoot, filePath);
}

function getArgValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index === -1) {
    return undefined;
  }

  return process.argv[index + 1];
}

function getChapterPlanPath(chapterId: string): string {
  return path.join(chapterDocsDir, `${chapterId}-plan.md`);
}

function getChapterLockReportPath(chapterId: string): string {
  return path.join(chapterDocsDir, `${chapterId}-lock-report.md`);
}

function getChapterMetadataPath(chapterId: string): string {
  return path.join(chapterMetadataDir, `${chapterId}.json`);
}

function getGeneratedChecklistPath(chapterId: string): string {
  return path.join(chapterReportsDir, "lock-checklists", `${chapterId}.md`);
}

function createBootstrapNotes(chapterId: string, title: string): string {
  return [
    `Planned scaffold created by chapter bootstrap for ${chapterId}.`,
    `${chapterId} 的计划骨架由 chapter bootstrap 自动创建。`,
    `Replace placeholder notes with real import scope before moving beyond planned status.`,
    `在脱离 planned 状态前，请把这些占位说明替换成真实导入范围。`,
    `Current working title: ${title}.`,
    `当前工作标题：${title}。`,
  ].join(" ");
}

function toTitleCaseFromChapterId(chapterId: string): string {
  return chapterId
    .split("-")
    .map((segment, index) => {
      if (index === 0) {
        return "Chapter";
      }

      if (/^\d+$/.test(segment)) {
        return segment;
      }

      return segment.charAt(0).toUpperCase() + segment.slice(1);
    })
    .join(" ");
}

async function loadJsonTemplate<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

export async function bootstrapChapterScaffold(
  options: ChapterBootstrapOptions,
): Promise<ChapterBootstrapResult> {
  const status = options.status ?? "planned";
  const metadataTemplate = await loadJsonTemplate<ChapterMetadata>(
    path.join(chapterMetadataDir, "chapter-template.json"),
  );
  const planTemplate = await readFile(path.join(chapterDocsDir, "chapter-template.md"), "utf8");
  const metadataPath = getChapterMetadataPath(options.chapterId);
  const planPath = getChapterPlanPath(options.chapterId);
  const lockReportPath = getChapterLockReportPath(options.chapterId);

  const metadata: ChapterMetadata = {
    ...metadataTemplate,
    chapterId: options.chapterId,
    title: options.title,
    areaLabel: options.areaLabel,
    status,
    notes: createBootstrapNotes(options.chapterId, options.title),
  };

  const chapterLabel = toTitleCaseFromChapterId(options.chapterId);
  const planContent = planTemplate
    .replace("# Chapter XX Plan", `# ${chapterLabel} Plan`)
    .replace("# 第 XX 章计划", `# ${chapterLabel} 计划`)
    .replace("- `chapterId`:", `- \`chapterId\`: \`${options.chapterId}\``)
    .replace("- `status`:", `- \`status\`: \`${status}\``);

  const lockReportContent = [
    `# ${chapterLabel} Lock Report`,
    `# ${chapterLabel} 锁定报告`,
    "",
    "## Scope",
    "## 范围",
    "",
    `- Chapter id: \`${options.chapterId}\``,
    `- Title: ${options.title}`,
    `- Area label: ${options.areaLabel}`,
    `- Metadata status: \`${status}\``,
    "",
    "## Current Status",
    "## 当前状态",
    "",
    "- Lock result: not reviewed yet",
    "- 锁定结果：尚未审核",
    "- Reason: scaffold only; real import and parity work have not started",
    "- 原因：当前只有骨架，真实导入和 parity 工作尚未开始",
    "",
    "## Verified Now",
    "## 当前已验证",
    "",
    "- Bootstrap files exist and are ready for chapter-factory execution",
    "- chapter bootstrap 文件已生成，可直接进入 chapter-factory 流程",
    "",
    "## Remaining Divergences",
    "## 当前剩余偏差",
    "",
    "- No real maps, NPCs, events, shops, or enemy groups have been imported yet",
    "- 当前尚未导入真实地图、NPC、事件、商店或敌群",
    "",
    "## Next Actions",
    "## 下一步动作",
    "",
    "1. Fill chapter scope in the plan file.",
    "1. 在计划文件中填写章节范围。",
    "2. Start the source -> tools -> generated/manual import flow for the first map slice.",
    "2. 启动首张地图切片的 source -> tools -> generated/manual 导入流程。",
    "3. Run completeness, parity, regression, and lock checklist tools as the slice grows.",
    "3. 随着切片推进，执行 completeness、parity、regression 和 lock checklist 工具。",
    "",
  ].join("\n");

  await mkdir(chapterMetadataDir, { recursive: true });
  await mkdir(chapterDocsDir, { recursive: true });
  await writeStableJsonFile(metadataPath, metadata);
  await writeFile(planPath, planContent, "utf8");
  await writeFile(lockReportPath, lockReportContent, "utf8");

  return {
    chapterId: options.chapterId,
    createdFiles: [
      metadataPath,
      planPath,
      lockReportPath,
    ],
  };
}

async function loadOptionalJson<T>(filePath: string): Promise<T | undefined> {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("ENOENT") || message.includes("no such file")) {
      return undefined;
    }

    throw error;
  }
}

function getChapterCompletenessIssues(
  issues: ChapterCompletenessIssue[],
  chapterId: string,
): ChapterCompletenessIssue[] {
  return issues.filter((issue) => issue.chapterId === chapterId);
}

function getRegressionCoverage(
  chapter: ChapterMetadata,
  regressionReport?: RegressionReport,
): ChapterImportStatusEntry["regression"] {
  if (!regressionReport) {
    return {
      boundCount: chapter.regressionCases.length,
      passCount: 0,
      missingCount: chapter.regressionCases.length,
    };
  }

  const caseIndex = new Map(regressionReport.cases.map((entry) => [entry.id, entry]));
  const passCount = chapter.regressionCases.filter((caseId) => caseIndex.get(caseId)?.status === "pass").length;
  const missingCount = chapter.regressionCases.filter((caseId) => !caseIndex.has(caseId)).length;
  return {
    boundCount: chapter.regressionCases.length,
    passCount,
    missingCount,
  };
}

function getUiParityCoverage(
  chapterId: string,
  uiParityReport?: UiParityReport,
): ChapterImportStatusEntry["uiParity"] {
  const cases = uiParityReport?.cases.filter((entry) => entry.locator.chapterId === chapterId) ?? [];
  return {
    matchedCount: cases.filter((entry) => entry.status === "matched").length,
    divergedCount: cases.filter((entry) => entry.status === "diverged").length,
  };
}

export async function buildChapterImportStatusReport(): Promise<ChapterImportStatusReport> {
  const chapters = (await loadAllChapterMetadata(chapterMetadataDir))
    .filter((entry) => entry.chapterId !== "chapter-template");
  const [completenessReport, parityReport, regressionReport, uiParityReport] = await Promise.all([
    runChapterCompletenessCheck(),
    loadOptionalJson<ParityScoreReport>(path.join(repoRoot, "reports", "parity", "latest", "report.json")),
    loadOptionalJson<RegressionReport>(path.join(repoRoot, "reports", "regression", "latest", "report.json")),
    loadOptionalJson<UiParityReport>(path.join(repoRoot, "reports", "ui-parity", "latest", "report.json")),
  ]);

  const parityIndex = new Map((parityReport?.chapters ?? []).map((entry) => [entry.chapterId, entry]));
  const entries: ChapterImportStatusEntry[] = chapters.map((chapter) => {
    const chapterIssues = getChapterCompletenessIssues(completenessReport.issues, chapter.chapterId);
    const parity = parityIndex.get(chapter.chapterId);
    const regression = getRegressionCoverage(chapter, regressionReport);
    const uiParity = getUiParityCoverage(chapter.chapterId, uiParityReport);
    return {
      chapterId: chapter.chapterId,
      title: chapter.title,
      areaLabel: chapter.areaLabel,
      status: chapter.status,
      metadataPath: relativeToRepo(getChapterMetadataPath(chapter.chapterId)),
      planPath: relativeToRepo(getChapterPlanPath(chapter.chapterId)),
      lockReportPath: relativeToRepo(getChapterLockReportPath(chapter.chapterId)),
      completeness: {
        errorCount: chapterIssues.filter((issue) => issue.severity === "error").length,
        warningCount: chapterIssues.filter((issue) => issue.severity === "warning").length,
      },
      parity: parity
        ? {
          totalScore: parity.totalScore,
          blockerCount: parity.blockerCount,
          minorCount: parity.minorCount,
        }
        : undefined,
      regression,
      uiParity,
      readyForLockChecklist: chapter.status !== "planned",
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    chapters: entries,
  };
}

function checklistItem(label: string, checked: boolean, detail: string) {
  return { label, checked, detail };
}

export async function buildChapterLockChecklist(
  chapterId: string,
): Promise<ChapterLockChecklistReport> {
  const [statusReport, parityReport] = await Promise.all([
    buildChapterImportStatusReport(),
    loadOptionalJson<ParityScoreReport>(path.join(repoRoot, "reports", "parity", "latest", "report.json")),
  ]);
  const chapter = statusReport.chapters.find((entry) => entry.chapterId === chapterId);
  if (!chapter) {
    throw new Error(`Chapter lock checklist could not find chapter "${chapterId}".`);
  }

  const metadata = (await loadAllChapterMetadata(chapterMetadataDir)).find((entry) => entry.chapterId === chapterId);
  if (!metadata) {
    throw new Error(`Chapter metadata could not be reloaded for "${chapterId}".`);
  }

  const parity = parityReport?.chapters.find((entry) => entry.chapterId === chapterId);

  return {
    chapterId,
    title: chapter.title,
    generatedAt: new Date().toISOString(),
    items: [
      checklistItem(
        "Chapter metadata exists / 章节元数据存在",
        true,
        `${chapter.metadataPath}`,
      ),
      checklistItem(
        "Plan and lock report scaffolds exist / 计划和锁定报告骨架存在",
        true,
        `${chapter.planPath} | ${chapter.lockReportPath}`,
      ),
      checklistItem(
        "Completeness has no errors / completeness 无 error",
        chapter.completeness.errorCount === 0,
        `errors=${chapter.completeness.errorCount} warnings=${chapter.completeness.warningCount}`,
      ),
      checklistItem(
        "Regression cases are bound / 已绑定 regression cases",
        chapter.regression.boundCount > 0,
        `bound=${chapter.regression.boundCount} missing=${chapter.regression.missingCount}`,
      ),
      checklistItem(
        "All bound regression cases pass / 已绑定 regression 全部通过",
        chapter.regression.boundCount > 0 && chapter.regression.passCount === chapter.regression.boundCount,
        `pass=${chapter.regression.passCount}/${chapter.regression.boundCount}`,
      ),
      checklistItem(
        "Parity has no blockers / parity 无 blocker",
        (parity?.blockerCount ?? 0) === 0,
        `score=${parity?.totalScore ?? "n/a"} blockers=${parity?.blockerCount ?? "n/a"} minors=${parity?.minorCount ?? "n/a"}`,
      ),
      checklistItem(
        "Parity summary is ready for lock / paritySummary 已接近锁定",
        Object.values(metadata.paritySummary).every((status) => status === "locked" || status === "parity-review"),
        stableStringify(metadata.paritySummary),
      ),
      checklistItem(
        "Chapter status is ready for final review / 章节状态已进入最终审核阶段",
        metadata.status === "parity-review" || metadata.status === "locked",
        `status=${metadata.status}`,
      ),
      checklistItem(
        "UI parity has no remaining divergences / UI 一致性无剩余偏差",
        chapter.uiParity.divergedCount === 0,
        `matched=${chapter.uiParity.matchedCount} diverged=${chapter.uiParity.divergedCount}`,
      ),
      checklistItem(
        "Human lock notes updated / 人工锁定说明已更新",
        true,
        "Update docs/chapters/<chapter>-lock-report.md before claiming locked.",
      ),
    ],
  };
}

export async function writeChapterLockChecklist(
  chapterId: string,
): Promise<string> {
  const report = await buildChapterLockChecklist(chapterId);
  const lines = [
    `# ${report.title} Lock Checklist`,
    `# ${report.title} 锁定检查清单`,
    "",
    `- Chapter Id / 章节 ID: \`${report.chapterId}\``,
    `- Generated At / 生成时间: ${report.generatedAt}`,
    "",
    "## Checklist",
    "## 清单",
    "",
    ...report.items.map((item) => `- [${item.checked ? "x" : " "}] ${item.label}: ${item.detail}`),
    "",
  ];
  const targetPath = getGeneratedChecklistPath(chapterId);
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, `${lines.join("\n")}\n`, "utf8");
  return targetPath;
}

export function parseChapterBootstrapArgs(): ChapterBootstrapOptions {
  const chapterId = getArgValue("--id");
  const title = getArgValue("--title");
  const areaLabel = getArgValue("--area");
  const status = (getArgValue("--status") as ChapterStatus | undefined) ?? "planned";

  if (!chapterId || !title || !areaLabel) {
    throw new Error("chapter-bootstrap requires --id, --title, and --area.");
  }

  return {
    chapterId,
    title,
    areaLabel,
    status,
  };
}

export function parseChapterIdArg(): string {
  const chapterId = getArgValue("--id");
  if (!chapterId) {
    throw new Error("This command requires --id <chapter-id>.");
  }

  return chapterId;
}

export function formatChapterImportStatusReport(report: ChapterImportStatusReport): string {
  const lines = [
    "Chapter Import Status Report / 章节导入状态报告",
    `Generated At / 生成时间: ${report.generatedAt}`,
    "",
  ];

  report.chapters.forEach((entry) => {
    lines.push(`${entry.chapterId} :: ${entry.title}`);
    lines.push(`  status=${entry.status} completeness=${entry.completeness.errorCount} error(s), ${entry.completeness.warningCount} warning(s)`);
    lines.push(`  regression=${entry.regression.passCount}/${entry.regression.boundCount} passed missing=${entry.regression.missingCount}`);
    lines.push(`  uiParity=matched ${entry.uiParity.matchedCount} diverged ${entry.uiParity.divergedCount}`);
    if (entry.parity) {
      lines.push(`  parity=score ${entry.parity.totalScore} blockers ${entry.parity.blockerCount} minors ${entry.parity.minorCount}`);
    }
    lines.push("");
  });

  return lines.join("\n");
}

export async function writeChapterImportStatusReport(
  report: ChapterImportStatusReport,
): Promise<string> {
  const targetPath = path.join(chapterReportsDir, "status-report.json");
  await mkdir(chapterReportsDir, { recursive: true });
  await writeStableJsonFile(targetPath, report);
  const summaryPath = path.join(chapterReportsDir, "status-report.md");
  const lines = [
    "# Chapter Import Status Report",
    "# 章节导入状态报告",
    "",
    `Generated At / 生成时间: ${report.generatedAt}`,
    "",
    "| Chapter | Status | Completeness | Regression | UI Parity | Parity |",
    "| --- | --- | --- | --- | --- | --- |",
    ...report.chapters.map((entry) => `| ${entry.chapterId} | ${entry.status} | E${entry.completeness.errorCount}/W${entry.completeness.warningCount} | ${entry.regression.passCount}/${entry.regression.boundCount} pass | M${entry.uiParity.matchedCount}/D${entry.uiParity.divergedCount} | ${entry.parity ? `${entry.parity.totalScore} (${entry.parity.blockerCount}B/${entry.parity.minorCount}m)` : "n/a"} |`),
    "",
  ];
  await writeFile(summaryPath, `${lines.join("\n")}\n`, "utf8");
  return targetPath;
}
