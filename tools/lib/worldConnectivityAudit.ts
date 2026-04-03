import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadRealChapterMetadata, loadManualStoryContent, loadManualWorldContent } from "./manualContent";
import { repoRoot, stableStringify } from "./importerCore";

export type ConnectivityEdgeKind = "portal" | "tile-warp" | "npc-warp" | "region-warp";
export type ConnectivityIssueType =
  | "missing-portal"
  | "isolated-map"
  | "invalid-spawn"
  | "invalid-trigger-warp"
  | "bidirectional-mismatch";
export type ConnectivityIssueSeverity = "error" | "warning";

export interface ConnectivityEdge {
  id: string;
  kind: ConnectivityEdgeKind;
  sourceMapId: string;
  targetMapId: string;
  targetSpawnId: string;
  sourceRef: string;
  sourceTriggerId?: string;
  sourceEventId?: string;
}

export interface ConnectivityGraphNode {
  mapId: string;
  chapterIds: string[];
  inboundCount: number;
  outboundCount: number;
}

export interface ConnectivityIssue {
  severity: ConnectivityIssueSeverity;
  type: ConnectivityIssueType;
  path: string;
  message: string;
  mapId?: string;
  targetMapId?: string;
  spawnId?: string;
  chapterId?: string;
}

export interface ChapterConnectivitySummary {
  chapterId: string;
  title: string;
  mapIds: string[];
  inboundConnectionCount: number;
  outboundConnectionCount: number;
  isolatedMapIds: string[];
  issueCount: number;
}

export interface WorldConnectivityReport {
  generatedAt: string;
  summary: {
    chapterCount: number;
    mapCount: number;
    edgeCount: number;
    portalEdgeCount: number;
    triggerWarpEdgeCount: number;
    isolatedMapCount: number;
    issueCount: number;
    errorCount: number;
    warningCount: number;
  };
  graph: {
    nodes: ConnectivityGraphNode[];
    edges: ConnectivityEdge[];
  };
  chapters: ChapterConnectivitySummary[];
  issues: ConnectivityIssue[];
}

export const worldConnectivityReportDir = path.join(repoRoot, "reports", "world-connectivity", "latest");

function collectWarpEdges(
  steps: Array<Record<string, unknown>>,
  sourceMapId: string,
  sourceTriggerId: string,
  sourceEventId: string,
  edges: ConnectivityEdge[],
  basePath: string,
): void {
  steps.forEach((step, index) => {
    const stepPath = `${basePath}[${index}]`;
    if (step.type === "warp" && typeof step.targetMapId === "string" && typeof step.targetSpawnId === "string") {
      edges.push({
        id: `${sourceMapId}:${sourceTriggerId}:${index}:${step.targetMapId}:${step.targetSpawnId}`,
        kind: "tile-warp",
        sourceMapId,
        targetMapId: step.targetMapId,
        targetSpawnId: step.targetSpawnId,
        sourceRef: stepPath,
        sourceTriggerId,
        sourceEventId,
      });
    }

    if (Array.isArray(step.steps)) {
      collectWarpEdges(
        step.steps as Array<Record<string, unknown>>,
        sourceMapId,
        sourceTriggerId,
        sourceEventId,
        edges,
        `${stepPath}.steps`,
      );
    }

    if (Array.isArray(step.elseSteps)) {
      collectWarpEdges(
        step.elseSteps as Array<Record<string, unknown>>,
        sourceMapId,
        sourceTriggerId,
        sourceEventId,
        edges,
        `${stepPath}.elseSteps`,
      );
    }
  });
}

function edgeKindFromTriggerKind(kind: string | undefined): ConnectivityEdgeKind {
  switch (kind) {
    case "npcInteraction":
      return "npc-warp";
    case "region":
      return "region-warp";
    case "tile":
    default:
      return "tile-warp";
  }
}

function buildSummary(report: WorldConnectivityReport): string {
  const lines: string[] = [
    "# World Connectivity Audit",
    "# 世界连接性审计",
    "",
    `- Generated At / 生成时间: ${report.generatedAt}`,
    `- Chapter Count / 章节数量: ${report.summary.chapterCount}`,
    `- Map Count / 地图数量: ${report.summary.mapCount}`,
    `- Edge Count / 连接边数量: ${report.summary.edgeCount}`,
    `- Portal Edge Count / Portal 连接数量: ${report.summary.portalEdgeCount}`,
    `- Trigger Warp Count / Trigger Warp 数量: ${report.summary.triggerWarpEdgeCount}`,
    `- Isolated Map Count / 孤立地图数量: ${report.summary.isolatedMapCount}`,
    `- Issue Count / 问题数量: ${report.summary.issueCount}`,
    "",
    "## Graph",
    "## 连接图",
    "",
    "```mermaid",
    "flowchart LR",
    ...report.graph.edges.map((edge) =>
      `  ${edge.sourceMapId}[${edge.sourceMapId}] -->|${edge.kind}:${edge.targetSpawnId}| ${edge.targetMapId}[${edge.targetMapId}]`),
    "```",
    "",
    "## Chapter Summary",
    "## 章节摘要",
    "",
    "| Chapter | Maps | Inbound | Outbound | Isolated | Issues |",
    "| --- | --- | --- | --- | --- | --- |",
    ...report.chapters.map((chapter) =>
      `| ${chapter.chapterId} | ${chapter.mapIds.length} | ${chapter.inboundConnectionCount} | ${chapter.outboundConnectionCount} | ${chapter.isolatedMapIds.length} | ${chapter.issueCount} |`),
    "",
  ];

  if (report.issues.length > 0) {
    lines.push("## Issues", "## 问题", "");
    report.issues.forEach((issue) => {
      lines.push(`- [${issue.severity}] ${issue.type} ${issue.path} ${issue.message}`);
    });
    lines.push("");
  } else {
    lines.push("## Issues", "## 问题", "", "- none", "- 无", "");
  }

  return `${lines.join("\n")}\n`;
}

function buildPairKey(left: string, right: string): string {
  return [left, right].sort().join("::");
}

export async function buildWorldConnectivityReport(): Promise<WorldConnectivityReport> {
  const [world, story, chapters] = await Promise.all([
    loadManualWorldContent(),
    loadManualStoryContent(),
    loadRealChapterMetadata(),
  ]);

  const issues: ConnectivityIssue[] = [];
  const mapIndex = new Map(world.maps.map((map) => [map.id, map]));
  const eventIndex = new Map(story.events.map((event) => [event.id, event]));
  const chapterMapIds = new Map<string, string[]>();
  chapters.forEach((chapter) => {
    chapter.maps.forEach((mapId) => {
      const existing = chapterMapIds.get(mapId) ?? [];
      existing.push(chapter.chapterId);
      chapterMapIds.set(mapId, existing);
    });
  });

  const edges: ConnectivityEdge[] = [];

  world.maps.forEach((map) => {
    const primaryCollision = map.collisionLayers[0];
    map.spawnPoints.forEach((spawnPoint, index) => {
      const outOfBounds = spawnPoint.x < 0
        || spawnPoint.y < 0
        || spawnPoint.x >= map.width
        || spawnPoint.y >= map.height;

      if (outOfBounds) {
        issues.push({
          severity: "error",
          type: "invalid-spawn",
          path: `content/manual/world.content.json:maps.${map.id}.spawnPoints[${index}]`,
          message: `spawn "${spawnPoint.id}" is outside map bounds`,
          mapId: map.id,
          spawnId: spawnPoint.id,
          chapterId: chapterMapIds.get(map.id)?.[0],
        });
        return;
      }

      const blockedIndex = spawnPoint.y * map.width + spawnPoint.x;
      if (primaryCollision?.blocked[blockedIndex] === 1) {
        issues.push({
          severity: "error",
          type: "invalid-spawn",
          path: `content/manual/world.content.json:maps.${map.id}.spawnPoints[${index}]`,
          message: `spawn "${spawnPoint.id}" is placed on a blocked tile`,
          mapId: map.id,
          spawnId: spawnPoint.id,
          chapterId: chapterMapIds.get(map.id)?.[0],
        });
      }
    });

    map.portals.forEach((portal, index) => {
      edges.push({
        id: `portal:${map.id}:${portal.id}`,
        kind: "portal",
        sourceMapId: map.id,
        targetMapId: portal.targetMapId,
        targetSpawnId: portal.targetSpawnId,
        sourceRef: `content/manual/world.content.json:maps.${map.id}.portals[${index}]`,
      });
    });

    map.triggers.forEach((trigger) => {
      if (!trigger.eventId) {
        return;
      }

      const event = eventIndex.get(trigger.eventId);
      if (!event) {
        return;
      }

      const warpEdges: ConnectivityEdge[] = [];
      collectWarpEdges(
        event.steps as Array<Record<string, unknown>>,
        map.id,
        trigger.id,
        event.id,
        warpEdges,
        `content/manual/story.content.json:event(${event.id}).steps`,
      );

      warpEdges.forEach((edge) => {
        edge.kind = edgeKindFromTriggerKind(trigger.kind);
        edges.push(edge);
      });

      if (warpEdges.length === 0 && (trigger.kind === "tile" || trigger.kind === "npcInteraction")) {
        return;
      }

      warpEdges.forEach((edge) => {
        if (!mapIndex.has(edge.targetMapId)) {
          issues.push({
            severity: "error",
            type: "invalid-trigger-warp",
            path: edge.sourceRef,
            message: `trigger warp points to missing map "${edge.targetMapId}"`,
            mapId: map.id,
            targetMapId: edge.targetMapId,
            chapterId: chapterMapIds.get(map.id)?.[0],
          });
          return;
        }

        const targetMap = mapIndex.get(edge.targetMapId);
        if (!targetMap?.spawnPoints.some((spawnPoint) => spawnPoint.id === edge.targetSpawnId)) {
          issues.push({
            severity: "error",
            type: "invalid-trigger-warp",
            path: edge.sourceRef,
            message: `trigger warp points to missing spawn "${edge.targetSpawnId}" on map "${edge.targetMapId}"`,
            mapId: map.id,
            targetMapId: edge.targetMapId,
            spawnId: edge.targetSpawnId,
            chapterId: chapterMapIds.get(map.id)?.[0],
          });
        }
      });
    });
  });

  const inboundByMap = new Map<string, ConnectivityEdge[]>();
  const outboundByMap = new Map<string, ConnectivityEdge[]>();
  edges.forEach((edge) => {
    const inbound = inboundByMap.get(edge.targetMapId) ?? [];
    inbound.push(edge);
    inboundByMap.set(edge.targetMapId, inbound);

    const outbound = outboundByMap.get(edge.sourceMapId) ?? [];
    outbound.push(edge);
    outboundByMap.set(edge.sourceMapId, outbound);
  });

  world.maps.forEach((map) => {
    const inbound = inboundByMap.get(map.id) ?? [];
    const outbound = outboundByMap.get(map.id) ?? [];
    if (inbound.length === 0 && outbound.length === 0) {
      issues.push({
        severity: "error",
        type: "isolated-map",
        path: `content/manual/world.content.json:maps.${map.id}`,
        message: `map "${map.id}" has no inbound or outbound world connections`,
        mapId: map.id,
        chapterId: chapterMapIds.get(map.id)?.[0],
      });
    }
  });

  const freeReturnKinds = new Set<ConnectivityEdgeKind>(["portal", "tile-warp"]);
  edges
    .filter((edge) => freeReturnKinds.has(edge.kind))
    .forEach((edge) => {
      const returnEdges = (outboundByMap.get(edge.targetMapId) ?? []).filter((candidate) =>
        candidate.targetMapId === edge.sourceMapId && freeReturnKinds.has(candidate.kind));
      if (returnEdges.length === 0) {
        issues.push({
          severity: "warning",
          type: "missing-portal",
          path: edge.sourceRef,
          message: `connection from "${edge.sourceMapId}" to "${edge.targetMapId}" has no free return traversal on the target map`,
          mapId: edge.sourceMapId,
          targetMapId: edge.targetMapId,
          chapterId: chapterMapIds.get(edge.sourceMapId)?.[0],
        });
      }
    });

  const pairGroups = new Map<string, ConnectivityEdge[]>();
  edges.forEach((edge) => {
    const key = buildPairKey(edge.sourceMapId, edge.targetMapId);
    const list = pairGroups.get(key) ?? [];
    list.push(edge);
    pairGroups.set(key, list);
  });

  pairGroups.forEach((pairEdges) => {
    const directions = new Map<string, Set<ConnectivityEdgeKind>>();
    pairEdges.forEach((edge) => {
      const key = `${edge.sourceMapId}->${edge.targetMapId}`;
      const kinds = directions.get(key) ?? new Set<ConnectivityEdgeKind>();
      kinds.add(edge.kind);
      directions.set(key, kinds);
    });

    if (directions.size < 2) {
      return;
    }

    const [forward, backward] = [...directions.entries()];
    if (!forward || !backward) {
      return;
    }

    const forwardIsFree = [...forward[1]].some((kind) => freeReturnKinds.has(kind));
    const backwardIsFree = [...backward[1]].some((kind) => freeReturnKinds.has(kind));
    if (forwardIsFree !== backwardIsFree) {
      const [sourcePair] = pairEdges;
      issues.push({
        severity: "warning",
        type: "bidirectional-mismatch",
        path: sourcePair?.sourceRef ?? "content/manual/world.content.json",
        message: `map pair "${forward[0]}" and "${backward[0]}" uses inconsistent free-return connectivity`,
        mapId: sourcePair?.sourceMapId,
        targetMapId: sourcePair?.targetMapId,
        chapterId: sourcePair ? chapterMapIds.get(sourcePair.sourceMapId)?.[0] : undefined,
      });
    }
  });

  const nodes: ConnectivityGraphNode[] = world.maps.map((map) => ({
    mapId: map.id,
    chapterIds: [...new Set(chapterMapIds.get(map.id) ?? [])].sort(),
    inboundCount: (inboundByMap.get(map.id) ?? []).length,
    outboundCount: (outboundByMap.get(map.id) ?? []).length,
  }));

  const realChapters = chapters.filter((chapter) => chapter.chapterId !== "chapter-template");
  const chapterSummaries: ChapterConnectivitySummary[] = realChapters.map((chapter) => {
    const chapterIssues = issues.filter((issue) => issue.chapterId === chapter.chapterId);
    const isolatedMapIds = chapter.maps.filter((mapId) =>
      chapterIssues.some((issue) => issue.type === "isolated-map" && issue.mapId === mapId));
    return {
      chapterId: chapter.chapterId,
      title: chapter.title,
      mapIds: [...chapter.maps],
      inboundConnectionCount: chapter.maps.reduce((sum, mapId) => sum + (inboundByMap.get(mapId)?.length ?? 0), 0),
      outboundConnectionCount: chapter.maps.reduce((sum, mapId) => sum + (outboundByMap.get(mapId)?.length ?? 0), 0),
      isolatedMapIds,
      issueCount: chapterIssues.length,
    };
  });

  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      chapterCount: realChapters.length,
      mapCount: world.maps.length,
      edgeCount: edges.length,
      portalEdgeCount: edges.filter((edge) => edge.kind === "portal").length,
      triggerWarpEdgeCount: edges.filter((edge) => edge.kind !== "portal").length,
      isolatedMapCount: issues.filter((issue) => issue.type === "isolated-map").length,
      issueCount: issues.length,
      errorCount,
      warningCount,
    },
    graph: {
      nodes: nodes.sort((left, right) => left.mapId.localeCompare(right.mapId)),
      edges: edges.sort((left, right) => left.id.localeCompare(right.id)),
    },
    chapters: chapterSummaries.sort((left, right) => left.chapterId.localeCompare(right.chapterId)),
    issues,
  };
}

export async function writeWorldConnectivityArtifacts(): Promise<WorldConnectivityReport> {
  const report = await buildWorldConnectivityReport();
  await mkdir(worldConnectivityReportDir, { recursive: true });
  await writeFile(path.join(worldConnectivityReportDir, "report.json"), `${stableStringify(report)}\n`, "utf8");
  await writeFile(path.join(worldConnectivityReportDir, "summary.md"), buildSummary(report), "utf8");
  return report;
}
