import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadRealChapterMetadata, loadManualStoryContent, loadManualWorldContent } from "./manualContent";
import { repoRoot, stableStringify } from "./importerCore";

type NpcStateIssueSeverity = "blocker" | "non-blocker";
type NpcStateIssueType = "missing-trigger" | "missing-world-npc" | "stale-npc" | "cross-chapter-flag";

interface NpcStateEntry {
  chapterId: string;
  mapId: string;
  npcId: string;
  npcName: string;
  facing: string;
  triggerIds: string[];
  eventIds: string[];
  flagIds: string[];
  speakerLineIds: string[];
}

interface NpcStateIssue {
  severity: NpcStateIssueSeverity;
  type: NpcStateIssueType;
  chapterId: string;
  npcId?: string;
  mapId?: string;
  path: string;
  message: string;
}

interface ChapterDependencyNote {
  chapterId: string;
  npcId: string;
  dependencyType: "flag-provider" | "cross-chapter-entry";
  detail: string;
}

export interface NpcGlobalStateReport {
  generatedAt: string;
  summary: {
    chapterCount: number;
    npcCount: number;
    blockerCount: number;
    nonBlockerCount: number;
  };
  npcVisibilityStateReport: NpcStateEntry[];
  flagDrivenBehaviorSummary: Array<{
    chapterId: string;
    npcId: string;
    flagIds: string[];
    eventIds: string[];
  }>;
  staleNpcStateDetection: NpcStateIssue[];
  chapterDependencyNotes: ChapterDependencyNote[];
}

export const npcGlobalStateReportDir = path.join(repoRoot, "reports", "npc-global-state", "latest");

function collectFlagIds(steps: Array<Record<string, unknown>>, output: Set<string>): void {
  steps.forEach((step) => {
    if (
      (step.type === "ifFlag" || step.type === "ifNotFlag" || step.type === "setFlag" || step.type === "clearFlag")
      && typeof step.flagId === "string"
    ) {
      output.add(step.flagId);
    }

    if (Array.isArray(step.steps)) {
      collectFlagIds(step.steps as Array<Record<string, unknown>>, output);
    }

    if (Array.isArray(step.elseSteps)) {
      collectFlagIds(step.elseSteps as Array<Record<string, unknown>>, output);
    }
  });
}

function buildSummary(report: NpcGlobalStateReport): string {
  const lines: string[] = [
    "# NPC Global State Audit",
    "# NPC 全局状态审计",
    "",
    `- Generated At / 生成时间: ${report.generatedAt}`,
    `- Chapter Count / 章节数量: ${report.summary.chapterCount}`,
    `- NPC Count / NPC 数量: ${report.summary.npcCount}`,
    `- Blocker Count / 阻塞项数量: ${report.summary.blockerCount}`,
    `- Non-Blocker Count / 非阻塞项数量: ${report.summary.nonBlockerCount}`,
    "",
    "## NPC Visibility State Report",
    "## NPC 显示状态报告",
    "",
    "| Chapter | Map | NPC | Facing | Triggers | Events | Flags |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...report.npcVisibilityStateReport.map((entry) =>
      `| ${entry.chapterId} | ${entry.mapId} | ${entry.npcId} | ${entry.facing} | ${entry.triggerIds.length} | ${entry.eventIds.length} | ${entry.flagIds.join(", ") || "-"} |`),
    "",
    "## Chapter Dependency Notes",
    "## 章节依赖说明",
    "",
  ];

  if (report.chapterDependencyNotes.length === 0) {
    lines.push("- none / 无", "");
  } else {
    report.chapterDependencyNotes.forEach((note) => {
      lines.push(`- ${note.chapterId} :: ${note.npcId} :: ${note.dependencyType} :: ${note.detail}`);
    });
    lines.push("");
  }

  lines.push("## Issues", "## 问题", "");
  if (report.staleNpcStateDetection.length === 0) {
    lines.push("- none / 无", "");
  } else {
    report.staleNpcStateDetection.forEach((issue) => {
      lines.push(`- [${issue.severity}] ${issue.type} ${issue.path} ${issue.message}`);
    });
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

export async function buildNpcGlobalStateReport(): Promise<NpcGlobalStateReport> {
  const [chapters, world, story] = await Promise.all([
    loadRealChapterMetadata(),
    loadManualWorldContent(),
    loadManualStoryContent(),
  ]);

  const mapIndex = new Map(world.maps.map((map) => [map.id, map]));
  const eventIndex = new Map(story.events.map((event) => [event.id, event]));
  const linesByNpcId = new Map<string, string[]>();
  story.dialogueLines.forEach((line) => {
    if (!line.speakerNpcId) {
      return;
    }
    const existing = linesByNpcId.get(line.speakerNpcId) ?? [];
    existing.push(line.id);
    linesByNpcId.set(line.speakerNpcId, existing);
  });

  const reportEntries: NpcStateEntry[] = [];
  const issues: NpcStateIssue[] = [];
  const dependencyNotes: ChapterDependencyNote[] = [];

  chapters.forEach((chapter) => {
    chapter.maps.forEach((mapId) => {
      const map = mapIndex.get(mapId);
      if (!map) {
        return;
      }

      map.npcs.forEach((npc) => {
        const triggers = map.triggers.filter((trigger) => trigger.npcId === npc.id);
        const eventIds = triggers
          .map((trigger) => trigger.eventId)
          .filter((eventId): eventId is string => typeof eventId === "string");
        const flagIds = new Set<string>();
        eventIds.forEach((eventId) => {
          const event = eventIndex.get(eventId);
          if (event) {
            collectFlagIds(event.steps, flagIds);
          }
        });

        reportEntries.push({
          chapterId: chapter.chapterId,
          mapId,
          npcId: npc.id,
          npcName: npc.name,
          facing: npc.facing,
          triggerIds: triggers.map((trigger) => trigger.id),
          eventIds,
          flagIds: [...flagIds].sort(),
          speakerLineIds: [...(linesByNpcId.get(npc.id) ?? [])].sort(),
        });

        if (triggers.length === 0 && !npc.shopId) {
          issues.push({
            severity: "non-blocker",
            type: "missing-trigger",
            chapterId: chapter.chapterId,
            npcId: npc.id,
            mapId,
            path: `content/manual/world.content.json:maps.${mapId}.npcs.${npc.id}`,
            message: `npc "${npc.id}" has no trigger or shop binding`,
          });
        }

        if (triggers.length > 0 && flagIds.size > 0) {
          dependencyNotes.push({
            chapterId: chapter.chapterId,
            npcId: npc.id,
            dependencyType: "flag-provider",
            detail: `flags=${[...flagIds].sort().join(", ")}`,
          });
        }
      });
    });
  });

  story.dialogueLines.forEach((line, index) => {
    if (!line.speakerNpcId) {
      return;
    }

    const found = reportEntries.some((entry) => entry.npcId === line.speakerNpcId);
    if (!found) {
      issues.push({
        severity: "blocker",
        type: "missing-world-npc",
        chapterId: "unknown",
        npcId: line.speakerNpcId,
        path: `content/manual/story.content.json:dialogueLines[${index}].speakerNpcId`,
        message: `dialogue speakerNpcId "${line.speakerNpcId}" is not present in imported world maps`,
      });
    }
  });

  reportEntries.forEach((entry) => {
    if (entry.triggerIds.length === 0 && entry.speakerLineIds.length === 0 && entry.eventIds.length === 0 && entry.npcName.length > 0) {
      issues.push({
        severity: "non-blocker",
        type: "stale-npc",
        chapterId: entry.chapterId,
        npcId: entry.npcId,
        mapId: entry.mapId,
        path: `content/manual/world.content.json:maps.${entry.mapId}.npcs.${entry.npcId}`,
        message: `npc "${entry.npcId}" has no dialogue lines, events, or trigger bindings`,
      });
    }
  });

  const report: NpcGlobalStateReport = {
    generatedAt: new Date().toISOString(),
    summary: {
      chapterCount: chapters.length,
      npcCount: reportEntries.length,
      blockerCount: issues.filter((issue) => issue.severity === "blocker").length,
      nonBlockerCount: issues.filter((issue) => issue.severity === "non-blocker").length,
    },
    npcVisibilityStateReport: reportEntries.sort((left, right) => left.chapterId.localeCompare(right.chapterId) || left.mapId.localeCompare(right.mapId) || left.npcId.localeCompare(right.npcId)),
    flagDrivenBehaviorSummary: reportEntries
      .filter((entry) => entry.flagIds.length > 0)
      .map((entry) => ({
        chapterId: entry.chapterId,
        npcId: entry.npcId,
        flagIds: entry.flagIds,
        eventIds: entry.eventIds,
      })),
    staleNpcStateDetection: issues,
    chapterDependencyNotes: dependencyNotes,
  };

  return report;
}

export async function writeNpcGlobalStateReport(): Promise<NpcGlobalStateReport> {
  const report = await buildNpcGlobalStateReport();
  await mkdir(npcGlobalStateReportDir, { recursive: true });
  await writeFile(path.join(npcGlobalStateReportDir, "report.json"), `${stableStringify(report)}\n`, "utf8");
  await writeFile(path.join(npcGlobalStateReportDir, "summary.md"), buildSummary(report), "utf8");
  return report;
}
