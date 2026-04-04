import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildProgressionGatingReport } from "./progressionGatingAudit";
import { buildWorldConnectivityReport } from "./worldConnectivityAudit";
import { loadRealChapterMetadata } from "./manualContent";
import { repoRoot, stableStringify } from "./importerCore";

type NavigationIssueSeverity = "blocker" | "non-blocker";
type NavigationIssueType = "inaccessible-intended-path" | "accidental-shortcut";

interface NavigationIssue {
  severity: NavigationIssueSeverity;
  type: NavigationIssueType;
  chapterId?: string;
  path: string;
  message: string;
}

export interface OverworldNavigationParityReport {
  generatedAt: string;
  summary: {
    chapterCount: number;
    mapCount: number;
    chapterEdgeCount: number;
    blockerCount: number;
    nonBlockerCount: number;
  };
  worldNavigationMap: Array<{
    sourceChapterId: string;
    targetChapterId: string;
    sourceMapId: string;
    targetMapId: string;
    kind: string;
  }>;
  travelDependencyNotes: Array<{
    chapterId: string;
    accessibleMaps: string[];
    blockedMaps: string[];
  }>;
  inaccessibleIntendedPathChecks: NavigationIssue[];
  accidentalShortcutChecks: NavigationIssue[];
}

export const overworldNavigationReportDir = path.join(repoRoot, "reports", "overworld-navigation", "latest");

function buildSummary(report: OverworldNavigationParityReport): string {
  const lines: string[] = [
    "# Overworld Navigation Parity",
    "# 大地图导航一致性",
    "",
    `- Generated At / 生成时间: ${report.generatedAt}`,
    `- Chapter Count / 章节数量: ${report.summary.chapterCount}`,
    `- Map Count / 地图数量: ${report.summary.mapCount}`,
    `- Chapter Edge Count / 章节连接数量: ${report.summary.chapterEdgeCount}`,
    `- Blocker Count / 阻塞项数量: ${report.summary.blockerCount}`,
    `- Non-Blocker Count / 非阻塞项数量: ${report.summary.nonBlockerCount}`,
    "",
    "## Travel Dependency Notes",
    "## 行进依赖说明",
    "",
  ];

  report.travelDependencyNotes.forEach((note) => {
    lines.push(`- ${note.chapterId}: accessible=${note.accessibleMaps.join(", ")} blocked=${note.blockedMaps.join(", ") || "none / 无"}`);
  });
  lines.push("", "## Issues", "## 问题", "");

  const issues = [...report.inaccessibleIntendedPathChecks, ...report.accidentalShortcutChecks];
  if (issues.length === 0) {
    lines.push("- none / 无", "");
  } else {
    issues.forEach((issue) => lines.push(`- [${issue.severity}] ${issue.type} ${issue.path} ${issue.message}`));
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

export async function buildOverworldNavigationParityReport(): Promise<OverworldNavigationParityReport> {
  const [chapters, connectivity, progression] = await Promise.all([
    loadRealChapterMetadata(),
    buildWorldConnectivityReport(),
    buildProgressionGatingReport(),
  ]);

  const mapToChapter = new Map<string, string>();
  chapters.forEach((chapter) => {
    chapter.maps.forEach((mapId) => mapToChapter.set(mapId, chapter.chapterId));
  });

  const worldNavigationMap = connectivity.graph.edges
    .map((edge) => ({
      sourceChapterId: mapToChapter.get(edge.sourceMapId) ?? "unknown",
      targetChapterId: mapToChapter.get(edge.targetMapId) ?? "unknown",
      sourceMapId: edge.sourceMapId,
      targetMapId: edge.targetMapId,
      kind: edge.kind,
    }))
    .filter((edge) => edge.sourceChapterId !== "unknown" && edge.targetChapterId !== "unknown");

  const inaccessibleIntendedPathChecks: NavigationIssue[] = progression.softLockRiskReport.issues.map((issue) => ({
    severity: issue.severity === "blocker" ? "blocker" : "non-blocker",
    type: "inaccessible-intended-path",
    chapterId: issue.chapterId,
    path: issue.path,
    message: issue.message,
  }));

  const accidentalShortcutChecks: NavigationIssue[] = worldNavigationMap
    .filter((edge) => edge.sourceChapterId !== edge.targetChapterId)
    .filter((edge) => {
      const sourceIndex = chapters.findIndex((chapter) => chapter.chapterId === edge.sourceChapterId);
      const targetIndex = chapters.findIndex((chapter) => chapter.chapterId === edge.targetChapterId);
      return sourceIndex >= 0 && targetIndex >= 0 && Math.abs(targetIndex - sourceIndex) > 1;
    })
    .map((edge) => ({
      severity: "non-blocker" as const,
      type: "accidental-shortcut" as const,
      chapterId: edge.sourceChapterId,
      path: `${edge.sourceMapId}->${edge.targetMapId}`,
      message: `cross-chapter edge jumps from ${edge.sourceChapterId} to ${edge.targetChapterId}`,
    }));

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      chapterCount: chapters.length,
      mapCount: connectivity.summary.mapCount,
      chapterEdgeCount: worldNavigationMap.length,
      blockerCount: inaccessibleIntendedPathChecks.filter((issue) => issue.severity === "blocker").length,
      nonBlockerCount: inaccessibleIntendedPathChecks.filter((issue) => issue.severity === "non-blocker").length + accidentalShortcutChecks.length,
    },
    worldNavigationMap,
    travelDependencyNotes: progression.chapterChecklists.map((chapter) => ({
      chapterId: chapter.chapterId,
      accessibleMaps: chapter.accessibleMaps,
      blockedMaps: chapter.blockedMaps,
    })),
    inaccessibleIntendedPathChecks,
    accidentalShortcutChecks,
  };
}

export async function writeOverworldNavigationParityReport(): Promise<OverworldNavigationParityReport> {
  const report = await buildOverworldNavigationParityReport();
  await mkdir(overworldNavigationReportDir, { recursive: true });
  await writeFile(path.join(overworldNavigationReportDir, "report.json"), `${stableStringify(report)}\n`, "utf8");
  await writeFile(path.join(overworldNavigationReportDir, "summary.md"), buildSummary(report), "utf8");
  return report;
}
