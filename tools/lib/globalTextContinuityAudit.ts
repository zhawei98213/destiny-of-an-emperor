import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadManualStoryContent, loadRealChapterMetadata } from "./manualContent";
import { repoRoot, stableStringify } from "./importerCore";

type ContinuitySeverity = "blocker" | "non-blocker";
type ContinuityIssueType = "repeated-text" | "missing-linkage" | "naming-inconsistency";

interface ContinuityIssue {
  severity: ContinuitySeverity;
  type: ContinuityIssueType;
  path: string;
  chapterId?: string;
  lineIds?: string[];
  message: string;
}

export interface GlobalTextContinuityReport {
  generatedAt: string;
  summary: {
    chapterCount: number;
    repeatedGroupCount: number;
    namingIssueCount: number;
    blockerCount: number;
    nonBlockerCount: number;
  };
  repeatedTextAnalysis: Array<{
    text: string;
    lineIds: string[];
  }>;
  missingTextLinkageAudit: ContinuityIssue[];
  namingConsistencyAudit: Array<{
    speakerNpcId: string;
    speakerNames: string[];
    lineIds: string[];
  }>;
  chapterContinuityNotes: Array<{
    chapterId: string;
    title: string;
    recurringSpeakerNames: string[];
    referencedLineIds: string[];
    notes: string[];
  }>;
}

export const globalTextContinuityReportDir = path.join(repoRoot, "reports", "global-text-continuity", "latest");

function collectLineIds(steps: Array<Record<string, unknown>>, output: Set<string>): void {
  steps.forEach((step) => {
    if (step.type === "dialogue" && typeof step.lineId === "string") {
      output.add(step.lineId);
    }
    if (Array.isArray(step.steps)) {
      collectLineIds(step.steps as Array<Record<string, unknown>>, output);
    }
    if (Array.isArray(step.elseSteps)) {
      collectLineIds(step.elseSteps as Array<Record<string, unknown>>, output);
    }
  });
}

function buildSummary(report: GlobalTextContinuityReport): string {
  const lines: string[] = [
    "# Global Text Continuity Audit",
    "# 全局文本连续性审计",
    "",
    `- Generated At / 生成时间: ${report.generatedAt}`,
    `- Chapter Count / 章节数量: ${report.summary.chapterCount}`,
    `- Repeated Group Count / 重复文本组数: ${report.summary.repeatedGroupCount}`,
    `- Naming Issue Count / 命名问题数: ${report.summary.namingIssueCount}`,
    `- Blocker Count / 阻塞项数量: ${report.summary.blockerCount}`,
    `- Non-Blocker Count / 非阻塞项数量: ${report.summary.nonBlockerCount}`,
    "",
    "## Chapter Continuity Notes",
    "## 章节连续性说明",
    "",
  ];

  report.chapterContinuityNotes.forEach((chapter) => {
    lines.push(`### ${chapter.chapterId}`);
    lines.push(`### ${chapter.chapterId}`);
    lines.push("");
    lines.push(`- recurring speakers / 复现说话者：${chapter.recurringSpeakerNames.join(", ") || "none / 无"}`);
    lines.push(`- referenced lines / 引用对白：${chapter.referencedLineIds.length}`);
    chapter.notes.forEach((note) => lines.push(`- ${note}`));
    lines.push("");
  });

  lines.push("## Issues", "## 问题", "");
  const issues = [...report.missingTextLinkageAudit];
  report.namingConsistencyAudit.forEach((entry) => {
    if (entry.speakerNames.length > 1) {
      issues.push({
        severity: "non-blocker",
        type: "naming-inconsistency",
        path: `speakerNpcId:${entry.speakerNpcId}`,
        lineIds: entry.lineIds,
        message: `speakerNpcId "${entry.speakerNpcId}" uses multiple names: ${entry.speakerNames.join(", ")}`,
      });
    }
  });

  if (issues.length === 0) {
    lines.push("- none / 无", "");
  } else {
    issues.forEach((issue) => lines.push(`- [${issue.severity}] ${issue.type} ${issue.path} ${issue.message}`));
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

export async function buildGlobalTextContinuityReport(): Promise<GlobalTextContinuityReport> {
  const [story, chapters] = await Promise.all([
    loadManualStoryContent(),
    loadRealChapterMetadata(),
  ]);

  const lineIndex = new Map(story.dialogueLines.map((line) => [line.id, line]));
  const eventIndex = new Map(story.events.map((event) => [event.id, event]));
  const textGroups = new Map<string, string[]>();
  const speakerNamesByNpc = new Map<string, Set<string>>();
  const lineIdsByNpc = new Map<string, string[]>();

  story.dialogueLines.forEach((line, index) => {
    const normalized = line.text?.trim();
    if (normalized) {
      const existing = textGroups.get(normalized) ?? [];
      existing.push(line.id);
      textGroups.set(normalized, existing);
    }

    if (line.speakerNpcId) {
      const names = speakerNamesByNpc.get(line.speakerNpcId) ?? new Set<string>();
      if (line.speakerName) {
        names.add(line.speakerName);
      }
      speakerNamesByNpc.set(line.speakerNpcId, names);
      const ids = lineIdsByNpc.get(line.speakerNpcId) ?? [];
      ids.push(line.id);
      lineIdsByNpc.set(line.speakerNpcId, ids);
    } else if (!line.speakerName) {
      // no-op, covered elsewhere
    }

    if (!normalized) {
      textGroups.set(`__empty__${index}`, [line.id]);
    }
  });

  const repeatedTextAnalysis = [...textGroups.entries()]
    .filter(([text, lineIds]) => !text.startsWith("__empty__") && lineIds.length > 1)
    .map(([text, lineIds]) => ({ text, lineIds: [...lineIds].sort() }))
    .sort((left, right) => right.lineIds.length - left.lineIds.length || left.text.localeCompare(right.text));

  const missingTextLinkageAudit: ContinuityIssue[] = [];
  const chapterContinuityNotes = chapters.map((chapter) => {
    const referencedLineIds = new Set<string>();
    chapter.events.forEach((eventId) => {
      const event = eventIndex.get(eventId);
      if (event) {
        collectLineIds(event.steps, referencedLineIds);
      }
    });

    [...referencedLineIds].forEach((lineId) => {
      if (!lineIndex.has(lineId)) {
        missingTextLinkageAudit.push({
          severity: "blocker",
          type: "missing-linkage",
          chapterId: chapter.chapterId,
          path: `chapter:${chapter.chapterId}:event-line:${lineId}`,
          message: `chapter "${chapter.chapterId}" references missing line "${lineId}"`,
        });
      }
    });

    const recurringSpeakerNames = [...new Set(
      [...referencedLineIds]
        .map((lineId) => lineIndex.get(lineId)?.speakerName?.trim())
        .filter((value): value is string => Boolean(value)),
    )].sort();

    return {
      chapterId: chapter.chapterId,
      title: chapter.title,
      recurringSpeakerNames,
      referencedLineIds: [...referencedLineIds].sort(),
      notes: [
        `章节引用对白 ${referencedLineIds.size} 条 / ${referencedLineIds.size} referenced lines`,
        `重复说话者命名 ${recurringSpeakerNames.length} 个 / ${recurringSpeakerNames.length} recurring speaker names`,
      ],
    };
  });

  const namingConsistencyAudit = [...speakerNamesByNpc.entries()]
    .map(([speakerNpcId, speakerNames]) => ({
      speakerNpcId,
      speakerNames: [...speakerNames].sort(),
      lineIds: [...(lineIdsByNpc.get(speakerNpcId) ?? [])].sort(),
    }))
    .sort((left, right) => left.speakerNpcId.localeCompare(right.speakerNpcId));

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      chapterCount: chapters.length,
      repeatedGroupCount: repeatedTextAnalysis.length,
      namingIssueCount: namingConsistencyAudit.filter((entry) => entry.speakerNames.length > 1).length,
      blockerCount: missingTextLinkageAudit.filter((issue) => issue.severity === "blocker").length,
      nonBlockerCount: repeatedTextAnalysis.length + namingConsistencyAudit.filter((entry) => entry.speakerNames.length > 1).length,
    },
    repeatedTextAnalysis,
    missingTextLinkageAudit,
    namingConsistencyAudit,
    chapterContinuityNotes,
  };
}

export async function writeGlobalTextContinuityReport(): Promise<GlobalTextContinuityReport> {
  const report = await buildGlobalTextContinuityReport();
  await mkdir(globalTextContinuityReportDir, { recursive: true });
  await writeFile(path.join(globalTextContinuityReportDir, "report.json"), `${stableStringify(report)}\n`, "utf8");
  await writeFile(path.join(globalTextContinuityReportDir, "summary.md"), buildSummary(report), "utf8");
  return report;
}
