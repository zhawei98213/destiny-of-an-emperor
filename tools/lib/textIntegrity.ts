import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadTextSource } from "./sourceSchemas";
import {
  loadManualStoryContent,
  loadRealChapterMetadata,
} from "./manualContent";
import { repoRoot, stableStringify } from "./importerCore";

export type TextIntegritySeverity = "warning" | "error";

export type TextIntegrityIssueType =
  | "empty-text"
  | "duplicate-key"
  | "missing-speaker"
  | "missing-portrait"
  | "missing-style"
  | "missing-line-reference";

export interface TextIntegrityIssue {
  severity: TextIntegritySeverity;
  type: TextIntegrityIssueType;
  path: string;
  lineId?: string;
  eventId?: string;
  chapterId?: string;
  message: string;
}

export interface ChapterTextCoverage {
  chapterId: string;
  title: string;
  eventIds: string[];
  referencedLineIds: string[];
  referencedLineCount: number;
  coveredManualLineCount: number;
  uncoveredReferencedLineIds: string[];
  manualCoveragePercent: number;
}

export interface TextDemoRealRatio {
  demoLineCount: number;
  realLineCount: number;
  uncategorizedManualLineCount: number;
  demoSharePercent: number;
  realSharePercent: number;
}

export interface TextIntegrityReport {
  generatedAt: string;
  summary: {
    manualLineCount: number;
    chapterCount: number;
    errorCount: number;
    warningCount: number;
  };
  ratio: TextDemoRealRatio;
  chapterCoverage: ChapterTextCoverage[];
  issues: TextIntegrityIssue[];
}

const manualStoryFile = path.join(repoRoot, "content", "manual", "story.content.json");
const demoTextSourceFile = path.join(repoRoot, "content", "source", "text", "demo-text.source.json");
const reportDir = path.join(repoRoot, "reports", "text-integrity", "latest");

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function collectDialogueLineIdsFromSteps(
  steps: Array<Record<string, unknown>>,
  lineIds: Set<string>,
  issues: TextIntegrityIssue[],
  basePath: string,
  eventId: string,
  knownLineIds: Set<string>,
  chapterId?: string,
): void {
  steps.forEach((step, index) => {
    const stepPath = `${basePath}[${index}]`;
    if (step.type === "dialogue") {
      const lineId = typeof step.lineId === "string" ? step.lineId : undefined;
      if (!lineId || !knownLineIds.has(lineId)) {
        issues.push({
          severity: "error",
          type: "missing-line-reference",
          path: `${stepPath}.lineId`,
          lineId,
          eventId,
          chapterId,
          message: `event "${eventId}" references a missing dialogue line "${lineId ?? "undefined"}"`,
        });
      } else {
        lineIds.add(lineId);
      }
    }

    if (Array.isArray(step.steps)) {
      collectDialogueLineIdsFromSteps(
        step.steps as Array<Record<string, unknown>>,
        lineIds,
        issues,
        `${stepPath}.steps`,
        eventId,
        knownLineIds,
        chapterId,
      );
    }
  });
}

function stablePercent(numerator: number, denominator: number): number {
  if (denominator <= 0) {
    return 0;
  }

  return Math.round((numerator / denominator) * 1000) / 10;
}

function createSummary(report: TextIntegrityReport): string {
  const lines: string[] = [
    "# Text Integrity Report",
    "# 文本完整性报告",
    "",
    `- Generated At / 生成时间: ${report.generatedAt}`,
    `- Manual Line Count / 手工对白数: ${report.summary.manualLineCount}`,
    `- Chapter Count / 章节数量: ${report.summary.chapterCount}`,
    `- Error Count / 错误数: ${report.summary.errorCount}`,
    `- Warning Count / 警告数: ${report.summary.warningCount}`,
    "",
    "## Demo vs Real Ratio",
    "## Demo 与真实文本占比",
    "",
    `- Demo Line Count / Demo 文本数: ${report.ratio.demoLineCount}`,
    `- Real Line Count / 真实文本数: ${report.ratio.realLineCount}`,
    `- Uncategorized Manual Lines / 未归类手工文本数: ${report.ratio.uncategorizedManualLineCount}`,
    `- Demo Share / Demo 占比: ${report.ratio.demoSharePercent}%`,
    `- Real Share / 真实占比: ${report.ratio.realSharePercent}%`,
    "",
    "## Chapter Coverage",
    "## 章节覆盖统计",
    "",
    "| Chapter | Referenced Lines | Coverage | Missing References |",
    "| --- | --- | --- | --- |",
  ];

  report.chapterCoverage.forEach((chapter) => {
    lines.push(`| ${chapter.chapterId} | ${chapter.referencedLineCount} | ${chapter.manualCoveragePercent}% | ${chapter.uncoveredReferencedLineIds.length} |`);
  });

  lines.push("", "## Issues", "## 问题", "");
  if (report.issues.length === 0) {
    lines.push("- none / 无");
    return `${lines.join("\n")}\n`;
  }

  report.issues.forEach((issue) => {
    lines.push(`- [${issue.severity}] ${issue.type} ${issue.path} ${issue.message}`);
  });

  return `${lines.join("\n")}\n`;
}

export async function buildTextIntegrityReport(): Promise<TextIntegrityReport> {
  const [story, chapters, demoSource, rawStoryText] = await Promise.all([
    loadManualStoryContent(),
    loadRealChapterMetadata(),
    loadTextSource(demoTextSourceFile),
    readFile(manualStoryFile, "utf8"),
  ]);

  const issues: TextIntegrityIssue[] = [];
  const importedChapters = chapters.filter((chapter) => (
    chapter.maps.length > 0
    || chapter.npcs.length > 0
    || chapter.events.length > 0
    || chapter.shops.length > 0
    || chapter.enemyGroups.length > 0
    || chapter.regressionCases.length > 0
  ));
  const manualLineIds = new Set(story.dialogueLines.map((line) => line.id));

  const parsedStory = JSON.parse(rawStoryText) as Record<string, unknown>;
  if (Array.isArray(parsedStory.dialogueLines)) {
    const seen = new Map<string, number>();
    parsedStory.dialogueLines.forEach((entry, index) => {
      if (!isRecord(entry) || typeof entry.id !== "string") {
        return;
      }

      const previousIndex = seen.get(entry.id);
      if (previousIndex !== undefined) {
        issues.push({
          severity: "error",
          type: "duplicate-key",
          path: `content/manual/story.content.json:dialogueLines[${index}].id`,
          lineId: entry.id,
          message: `duplicates dialogueLines[${previousIndex}].id "${entry.id}"`,
        });
        return;
      }

      seen.set(entry.id, index);
    });
  }

  story.dialogueLines.forEach((line, index) => {
    const linePath = `content/manual/story.content.json:dialogueLines[${index}]`;
    if (typeof line.text !== "string" || line.text.trim().length === 0) {
      issues.push({
        severity: "error",
        type: "empty-text",
        path: `${linePath}.text`,
        lineId: line.id,
        message: `dialogue line "${line.id}" has empty text`,
      });
    }

    if (typeof line.speakerName !== "string" || line.speakerName.trim().length === 0) {
      issues.push({
        severity: "warning",
        type: "missing-speaker",
        path: `${linePath}.speakerName`,
        lineId: line.id,
        message: `dialogue line "${line.id}" is missing speakerName metadata`,
      });
    }

    if (typeof line.portraitId !== "string" || line.portraitId.trim().length === 0) {
      issues.push({
        severity: "warning",
        type: "missing-portrait",
        path: `${linePath}.portraitId`,
        lineId: line.id,
        message: `dialogue line "${line.id}" is missing portraitId metadata`,
      });
    }

    if (typeof line.styleId !== "string" || line.styleId.trim().length === 0) {
      issues.push({
        severity: "warning",
        type: "missing-style",
        path: `${linePath}.styleId`,
        lineId: line.id,
        message: `dialogue line "${line.id}" is missing styleId metadata`,
      });
    }
  });

  const eventIndex = new Map(story.events.map((event) => [event.id, event]));
  const chapterCoverage: ChapterTextCoverage[] = importedChapters.map((chapter) => {
    const lineIds = new Set<string>();
    chapter.events.forEach((eventId) => {
      const event = eventIndex.get(eventId);
      if (!event) {
        return;
      }

      collectDialogueLineIdsFromSteps(
        event.steps,
        lineIds,
        issues,
        `content/manual/story.content.json:event(${event.id}).steps`,
        event.id,
        manualLineIds,
        chapter.chapterId,
      );
    });

    const referencedLineIds = [...lineIds].sort((left, right) => left.localeCompare(right));
    const uncoveredReferencedLineIds = referencedLineIds.filter((lineId) => !manualLineIds.has(lineId));
    return {
      chapterId: chapter.chapterId,
      title: chapter.title,
      eventIds: [...chapter.events],
      referencedLineIds,
      referencedLineCount: referencedLineIds.length,
      coveredManualLineCount: referencedLineIds.length - uncoveredReferencedLineIds.length,
      uncoveredReferencedLineIds,
      manualCoveragePercent: stablePercent(
        referencedLineIds.length - uncoveredReferencedLineIds.length,
        referencedLineIds.length,
      ),
    };
  });

  const realLineIds = new Set(chapterCoverage.flatMap((chapter) => chapter.referencedLineIds));
  const realLineCount = realLineIds.size;
  const demoLineCount = demoSource.dialogueLines.length;
  const uncategorizedManualLineCount = story.dialogueLines.filter((line) => !realLineIds.has(line.id)).length;
  const classifiedTotal = demoLineCount + realLineCount;

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      manualLineCount: story.dialogueLines.length,
      chapterCount: chapterCoverage.length,
      errorCount: issues.filter((issue) => issue.severity === "error").length,
      warningCount: issues.filter((issue) => issue.severity === "warning").length,
    },
    ratio: {
      demoLineCount,
      realLineCount,
      uncategorizedManualLineCount,
      demoSharePercent: stablePercent(demoLineCount, classifiedTotal),
      realSharePercent: stablePercent(realLineCount, classifiedTotal),
    },
    chapterCoverage,
    issues: issues.sort((left, right) => left.path.localeCompare(right.path)),
  };
}

export async function writeTextIntegrityArtifacts(report: TextIntegrityReport): Promise<TextIntegrityReport> {
  await mkdir(reportDir, { recursive: true });
  const jsonPath = path.join(reportDir, "report.json");
  const summaryPath = path.join(reportDir, "summary.md");
  await writeFile(jsonPath, `${stableStringify(report)}\n`, "utf8");
  await writeFile(summaryPath, createSummary(report), "utf8");
  return report;
}
