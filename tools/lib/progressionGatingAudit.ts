import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { loadContentDatabase } from "../../game/src/content/contentLoader";
import { DEFAULT_CONTENT_MANIFESTS } from "../../game/src/content/contentKeys";
import type {
  ContentDatabase,
  EventStep,
  FlagStateMap,
  MapDefinition,
  TriggerDefinition,
} from "../../game/src/types/content";
import { loadRealChapterMetadata } from "./manualContent";
import { repoRoot, stableStringify } from "./importerCore";

type GateSeverity = "blocker" | "non-blocker";

interface ItemRequirement {
  itemId: string;
  quantity: number;
}

interface RequirementState {
  requiredFlags: Set<string>;
  blockedFlags: Set<string>;
  requiredItems: Map<string, number>;
}

interface ProgressionStateSnapshot {
  chapterId: string;
  accessibleMaps: string[];
  knownFlags: string[];
  knownItems: string[];
}

interface ProviderReference {
  chapterId: string;
  mapId: string;
  triggerId: string;
  eventId: string;
  path: string;
}

interface GateProviderStatus {
  kind: "flag" | "item";
  id: string;
  satisfied: boolean;
  providers: ProviderReference[];
}

interface GatedTransitionSummary {
  chapterId: string;
  sourceMapId: string;
  triggerId: string;
  eventId: string;
  targetMapId: string;
  targetSpawnId: string;
  requiredFlags: string[];
  blockedFlags: string[];
  requiredItems: ItemRequirement[];
  providerStatus: GateProviderStatus[];
  sourcePath: string;
}

interface ProgressionIssue {
  severity: GateSeverity;
  type: "missing-provider" | "inaccessible-map" | "entry-gap";
  chapterId: string;
  path: string;
  message: string;
}

interface ChapterProgressionChecklist {
  chapterId: string;
  title: string;
  entryMaps: string[];
  accessibleMaps: string[];
  blockedMaps: string[];
  checklist: Array<{
    label: string;
    passed: boolean;
    detail: string;
  }>;
  blockerCount: number;
  nonBlockerCount: number;
}

export interface ProgressionGatingReport {
  generatedAt: string;
  progressionStateModel: {
    chapterOrder: string[];
    cumulativeSnapshots: ProgressionStateSnapshot[];
  };
  mapAccessDependencySummary: GatedTransitionSummary[];
  flagGatingReport: GatedTransitionSummary[];
  softLockRiskReport: {
    blockerCount: number;
    nonBlockerCount: number;
    issues: ProgressionIssue[];
  };
  chapterChecklists: ChapterProgressionChecklist[];
}

export const progressionGatingReportDir = path.join(repoRoot, "reports", "progression-gating", "latest");

class FileSystemContentReader {
  constructor(private readonly rootDir: string) {}

  async readText(targetPath: string): Promise<string> {
    const normalized = targetPath.startsWith("/") ? targetPath.slice(1) : targetPath;
    return readFile(path.resolve(this.rootDir, normalized), "utf8");
  }
}

function createRequirementState(): RequirementState {
  return {
    requiredFlags: new Set<string>(),
    blockedFlags: new Set<string>(),
    requiredItems: new Map<string, number>(),
  };
}

function cloneRequirementState(source: RequirementState): RequirementState {
  return {
    requiredFlags: new Set(source.requiredFlags),
    blockedFlags: new Set(source.blockedFlags),
    requiredItems: new Map(source.requiredItems),
  };
}

function mergeRequiredItem(requirements: RequirementState, itemId: string, quantity: number): void {
  const current = requirements.requiredItems.get(itemId) ?? 0;
  requirements.requiredItems.set(itemId, Math.max(current, quantity));
}

function inventoryMapToList(items: Map<string, number>): string[] {
  return [...items.entries()]
    .filter(([, quantity]) => quantity > 0)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([itemId, quantity]) => `${itemId}x${quantity}`);
}

function getTriggerMapIndex(database: ContentDatabase): Map<string, { map: MapDefinition; trigger: TriggerDefinition }> {
  const result = new Map<string, { map: MapDefinition; trigger: TriggerDefinition }>();
  database.maps.forEach((map) => {
    map.triggers.forEach((trigger) => {
      result.set(trigger.id, { map, trigger });
    });
  });
  return result;
}

function collectEventFacts(
  steps: EventStep[],
  context: RequirementState,
  path: string,
  output: {
    warps: Array<{
      targetMapId: string;
      targetSpawnId: string;
      requirements: RequirementState;
      path: string;
    }>;
    setFlags: Array<{ flagId: string; path: string }>;
    givenItems: Array<{ itemId: string; quantity: number; path: string }>;
  },
): void {
  steps.forEach((step, index) => {
    const stepPath = `${path}[${index}]`;
    switch (step.type) {
      case "setFlag":
        output.setFlags.push({ flagId: step.flagId, path: stepPath });
        break;
      case "giveItem":
        output.givenItems.push({ itemId: step.itemId, quantity: step.quantity, path: stepPath });
        break;
      case "warp":
        output.warps.push({
          targetMapId: step.targetMapId,
          targetSpawnId: step.targetSpawnId,
          requirements: cloneRequirementState(context),
          path: stepPath,
        });
        break;
      case "ifFlag": {
        const thenContext = cloneRequirementState(context);
        thenContext.requiredFlags.add(step.flagId);
        collectEventFacts(step.steps, thenContext, `${stepPath}.steps`, output);
        if (step.elseSteps) {
          const elseContext = cloneRequirementState(context);
          elseContext.blockedFlags.add(step.flagId);
          collectEventFacts(step.elseSteps, elseContext, `${stepPath}.elseSteps`, output);
        }
        break;
      }
      case "ifNotFlag": {
        const thenContext = cloneRequirementState(context);
        thenContext.blockedFlags.add(step.flagId);
        collectEventFacts(step.steps, thenContext, `${stepPath}.steps`, output);
        if (step.elseSteps) {
          const elseContext = cloneRequirementState(context);
          elseContext.requiredFlags.add(step.flagId);
          collectEventFacts(step.elseSteps, elseContext, `${stepPath}.elseSteps`, output);
        }
        break;
      }
      case "ifHasItem": {
        const thenContext = cloneRequirementState(context);
        mergeRequiredItem(thenContext, step.itemId, step.quantity ?? 1);
        collectEventFacts(step.steps, thenContext, `${stepPath}.steps`, output);
        if (step.elseSteps) {
          collectEventFacts(step.elseSteps, cloneRequirementState(context), `${stepPath}.elseSteps`, output);
        }
        break;
      }
      default:
        break;
    }
  });
}

function executeEventPath(
  steps: EventStep[],
  flags: FlagStateMap,
  items: Map<string, number>,
  output: {
    setFlags: Set<string>;
    clearFlags: Set<string>;
    givenItems: Map<string, number>;
    warps: Array<{ targetMapId: string; targetSpawnId: string }>;
  },
): void {
  for (const step of steps) {
    switch (step.type) {
      case "setFlag":
        flags[step.flagId] = step.value ?? true;
        output.setFlags.add(step.flagId);
        break;
      case "clearFlag":
        flags[step.flagId] = false;
        output.clearFlags.add(step.flagId);
        break;
      case "giveItem": {
        const next = (items.get(step.itemId) ?? 0) + step.quantity;
        items.set(step.itemId, next);
        output.givenItems.set(step.itemId, (output.givenItems.get(step.itemId) ?? 0) + step.quantity);
        break;
      }
      case "removeItem": {
        const next = Math.max(0, (items.get(step.itemId) ?? 0) - step.quantity);
        items.set(step.itemId, next);
        break;
      }
      case "warp":
        output.warps.push({ targetMapId: step.targetMapId, targetSpawnId: step.targetSpawnId });
        break;
      case "ifFlag":
        executeEventPath(flags[step.flagId] ? step.steps : step.elseSteps ?? [], flags, items, output);
        break;
      case "ifNotFlag":
        executeEventPath(!flags[step.flagId] ? step.steps : step.elseSteps ?? [], flags, items, output);
        break;
      case "ifHasItem":
        executeEventPath(((items.get(step.itemId) ?? 0) >= (step.quantity ?? 1)) ? step.steps : step.elseSteps ?? [], flags, items, output);
        break;
      case "end":
        return;
      default:
        break;
    }
  }
}

function renderChecklist(checklist: ChapterProgressionChecklist): string {
  const lines: string[] = [
    `# ${checklist.chapterId} Progression Checklist`,
    `# ${checklist.chapterId} 推进检查清单`,
    "",
    `- Title / 标题: ${checklist.title}`,
    `- Entry Maps / 入口地图: ${checklist.entryMaps.join(", ")}`,
    `- Accessible Maps / 可达地图: ${checklist.accessibleMaps.join(", ")}`,
    `- Blocked Maps / 未打开地图: ${checklist.blockedMaps.length > 0 ? checklist.blockedMaps.join(", ") : "none / 无"}`,
    `- Blockers / 阻塞项: ${checklist.blockerCount}`,
    `- Non-Blockers / 非阻塞项: ${checklist.nonBlockerCount}`,
    "",
  ];

  checklist.checklist.forEach((item) => {
    lines.push(`- [${item.passed ? "x" : " "}] ${item.label}: ${item.detail}`);
  });
  lines.push("");
  return `${lines.join("\n")}\n`;
}

function renderSummary(report: ProgressionGatingReport): string {
  const lines: string[] = [
    "# Progression Gating Audit",
    "# 推进门禁审计",
    "",
    `- Generated At / 生成时间: ${report.generatedAt}`,
    `- Chapter Count / 章节数量: ${report.progressionStateModel.chapterOrder.length}`,
    `- Blocker Count / 阻塞项数量: ${report.softLockRiskReport.blockerCount}`,
    `- Non-Blocker Count / 非阻塞项数量: ${report.softLockRiskReport.nonBlockerCount}`,
    "",
    "## Progression State Model",
    "## 推进状态模型",
    "",
    "| Chapter | Accessible Maps | Known Flags | Known Items |",
    "| --- | --- | --- | --- |",
    ...report.progressionStateModel.cumulativeSnapshots.map((snapshot) =>
      `| ${snapshot.chapterId} | ${snapshot.accessibleMaps.join(", ")} | ${snapshot.knownFlags.join(", ")} | ${snapshot.knownItems.join(", ")} |`),
    "",
    "## Map Access Dependency Summary",
    "## 地图开放依赖摘要",
    "",
  ];

  report.mapAccessDependencySummary.forEach((transition) => {
    lines.push(
      `### ${transition.chapterId} :: ${transition.sourceMapId} -> ${transition.targetMapId}`,
      "",
      `- Trigger / 触发器: ${transition.triggerId}`,
      `- Event / 事件: ${transition.eventId}`,
      `- Target Spawn / 目标出生点: ${transition.targetSpawnId}`,
      `- Required Flags / 需要的 Flag: ${transition.requiredFlags.length > 0 ? transition.requiredFlags.join(", ") : "none / 无"}`,
      `- Blocked Flags / 必须未设置的 Flag: ${transition.blockedFlags.length > 0 ? transition.blockedFlags.join(", ") : "none / 无"}`,
      `- Required Items / 需要的物品: ${transition.requiredItems.length > 0 ? transition.requiredItems.map((entry) => `${entry.itemId}x${entry.quantity}`).join(", ") : "none / 无"}`,
      `- Provider Status / 提供者状态: ${transition.providerStatus.map((entry) => `${entry.kind}:${entry.id}=${entry.satisfied ? "ok" : "missing"}`).join(" | ") || "none / 无"}`,
      "",
    );
  });

  lines.push("## Soft-Lock Risk Report", "## 软锁风险报告", "");
  if (report.softLockRiskReport.issues.length === 0) {
    lines.push("- none", "- 无", "");
  } else {
    report.softLockRiskReport.issues.forEach((issue) => {
      lines.push(`- [${issue.severity}] ${issue.chapterId} ${issue.path} ${issue.message}`);
    });
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

export async function buildProgressionGatingReport(): Promise<ProgressionGatingReport> {
  const database = await loadContentDatabase(new FileSystemContentReader(repoRoot), DEFAULT_CONTENT_MANIFESTS);
  const chapters = (await loadRealChapterMetadata()).filter((chapter) => chapter.chapterId !== "chapter-template");
  const chapterOrder = chapters.map((chapter) => chapter.chapterId);
  const triggerMapIndex = getTriggerMapIndex(database);
  const eventIndex = new Map(database.events.map((event) => [event.id, event]));

  const eventFacts = new Map<string, {
    warps: Array<{
      targetMapId: string;
      targetSpawnId: string;
      requirements: RequirementState;
      path: string;
    }>;
    setFlags: Array<{ flagId: string; path: string }>;
    givenItems: Array<{ itemId: string; quantity: number; path: string }>;
  }>();

  database.events.forEach((event) => {
    const facts = {
      warps: [] as Array<{ targetMapId: string; targetSpawnId: string; requirements: RequirementState; path: string }>,
      setFlags: [] as Array<{ flagId: string; path: string }>,
      givenItems: [] as Array<{ itemId: string; quantity: number; path: string }>,
    };
    collectEventFacts(event.steps, createRequirementState(), `events.${event.id}.steps`, facts);
    eventFacts.set(event.id, facts);
  });

  const providerMap = new Map<string, ProviderReference[]>();
  const itemProviderMap = new Map<string, ProviderReference[]>();

  chapters.forEach((chapter) => {
    chapter.events.forEach((eventId) => {
      const facts = eventFacts.get(eventId);
      const triggerEntry = [...triggerMapIndex.values()].find((entry) => entry.trigger.eventId === eventId);
      const mapId = triggerEntry?.map.id ?? chapter.maps[0] ?? "";
      const triggerId = triggerEntry?.trigger.id ?? `chapter:${chapter.chapterId}:${eventId}`;
      facts?.setFlags.forEach((flag) => {
        const list = providerMap.get(flag.flagId) ?? [];
        list.push({
          chapterId: chapter.chapterId,
          mapId,
          triggerId,
          eventId,
          path: flag.path,
        });
        providerMap.set(flag.flagId, list);
      });
      facts?.givenItems.forEach((item) => {
        const list = itemProviderMap.get(item.itemId) ?? [];
        list.push({
          chapterId: chapter.chapterId,
          mapId,
          triggerId,
          eventId,
          path: item.path,
        });
        itemProviderMap.set(item.itemId, list);
      });
    });
  });

  const cumulativeFlags: FlagStateMap = Object.fromEntries(database.flags.map((flag) => [flag.id, flag.defaultValue]));
  const cumulativeItems = new Map<string, number>();
  const snapshots: ProgressionStateSnapshot[] = [];
  const transitions: GatedTransitionSummary[] = [];
  const issues: ProgressionIssue[] = [];
  const checklists: ChapterProgressionChecklist[] = [];
  const processedEventsByChapter = new Map<string, Set<string>>();

  chapters.forEach((chapter, chapterIndex) => {
    const entryMaps = chapter.maps.filter((mapId) => {
      if (chapterIndex === 0) {
        return mapId === chapter.maps[0];
      }

      return database.maps.some((map) =>
        map.triggers.some((trigger) => {
          if (!trigger.eventId) {
            return false;
          }
          const event = eventIndex.get(trigger.eventId);
          if (!event) {
            return false;
          }
          const facts = eventFacts.get(event.id);
          return facts?.warps.some((warp) => warp.targetMapId === mapId) ?? false;
        })
        || map.portals.some((portal) => portal.targetMapId === mapId));
    });

    const accessibleMaps = new Set<string>(entryMaps.length > 0 ? entryMaps : [chapter.maps[0]]);
    const processedEvents = processedEventsByChapter.get(chapter.chapterId) ?? new Set<string>();
    processedEventsByChapter.set(chapter.chapterId, processedEvents);

    let changed = true;
    while (changed) {
      changed = false;

      for (const mapId of [...accessibleMaps]) {
        const map = database.maps.find((entry) => entry.id === mapId);
        if (!map) {
          continue;
        }

        map.portals.forEach((portal) => {
          if (chapter.maps.includes(portal.targetMapId) && !accessibleMaps.has(portal.targetMapId)) {
            accessibleMaps.add(portal.targetMapId);
            changed = true;
          }
        });

        map.triggers.forEach((trigger) => {
          if (!trigger.eventId) {
            return;
          }

          const event = eventIndex.get(trigger.eventId);
          if (!event || !chapter.events.includes(event.id)) {
            return;
          }

          const eventKey = `${mapId}:${trigger.id}:${event.id}`;
          const localFlags = { ...cumulativeFlags };
          const localItems = new Map(cumulativeItems);
          const output = {
            setFlags: new Set<string>(),
            clearFlags: new Set<string>(),
            givenItems: new Map<string, number>(),
            warps: [] as Array<{ targetMapId: string; targetSpawnId: string }>,
          };

          executeEventPath(event.steps, localFlags, localItems, output);

          if (!processedEvents.has(eventKey)
            || [...output.setFlags].some((flagId) => !cumulativeFlags[flagId])
            || [...output.givenItems.entries()].some(([itemId, quantity]) => (cumulativeItems.get(itemId) ?? 0) < quantity)
            || output.warps.some((warp) => chapter.maps.includes(warp.targetMapId) && !accessibleMaps.has(warp.targetMapId))) {
            processedEvents.add(eventKey);
            output.setFlags.forEach((flagId) => {
              if (!cumulativeFlags[flagId]) {
                cumulativeFlags[flagId] = true;
                changed = true;
              }
            });
            output.clearFlags.forEach((flagId) => {
              if (cumulativeFlags[flagId]) {
                cumulativeFlags[flagId] = false;
                changed = true;
              }
            });
            output.givenItems.forEach((quantity, itemId) => {
              const current = cumulativeItems.get(itemId) ?? 0;
              cumulativeItems.set(itemId, current + quantity);
              if (quantity > 0) {
                changed = true;
              }
            });
            output.warps.forEach((warp) => {
              if (chapter.maps.includes(warp.targetMapId) && !accessibleMaps.has(warp.targetMapId)) {
                accessibleMaps.add(warp.targetMapId);
                changed = true;
              }
            });
          }
        });
      }
    }

    chapter.events.forEach((eventId) => {
      const event = eventIndex.get(eventId);
      const facts = eventFacts.get(eventId);
      const triggerEntry = [...triggerMapIndex.values()].find((entry) => entry.trigger.eventId === eventId);
      if (!event || !facts || !triggerEntry) {
        return;
      }

      facts.warps.forEach((warp) => {
        const providerStatus: GateProviderStatus[] = [
          ...[...warp.requirements.requiredFlags].map((flagId) => ({
            kind: "flag" as const,
            id: flagId,
            satisfied: (providerMap.get(flagId) ?? []).some((provider) =>
              chapterOrder.indexOf(provider.chapterId) <= chapterIndex),
            providers: (providerMap.get(flagId) ?? []).filter((provider) =>
              chapterOrder.indexOf(provider.chapterId) <= chapterIndex),
          })),
          ...[...warp.requirements.requiredItems.entries()].map(([itemId, quantity]) => ({
            kind: "item" as const,
            id: `${itemId}x${quantity}`,
            satisfied: (itemProviderMap.get(itemId) ?? []).some((provider) =>
              chapterOrder.indexOf(provider.chapterId) <= chapterIndex),
            providers: (itemProviderMap.get(itemId) ?? []).filter((provider) =>
              chapterOrder.indexOf(provider.chapterId) <= chapterIndex),
          })),
        ];

        transitions.push({
          chapterId: chapter.chapterId,
          sourceMapId: triggerEntry.map.id,
          triggerId: triggerEntry.trigger.id,
          eventId,
          targetMapId: warp.targetMapId,
          targetSpawnId: warp.targetSpawnId,
          requiredFlags: [...warp.requirements.requiredFlags].sort(),
          blockedFlags: [...warp.requirements.blockedFlags].sort(),
          requiredItems: [...warp.requirements.requiredItems.entries()]
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([itemId, quantity]) => ({ itemId, quantity })),
          providerStatus,
          sourcePath: warp.path,
        });

        providerStatus
          .filter((entry) => !entry.satisfied)
          .forEach((entry) => {
            issues.push({
              severity: "blocker",
              type: "missing-provider",
              chapterId: chapter.chapterId,
              path: warp.path,
              message: `transition to "${warp.targetMapId}" requires ${entry.kind} "${entry.id}" but no provider exists in current or previous chapters`,
            });
          });
      });
    });

    const blockedMaps = chapter.maps.filter((mapId) => !accessibleMaps.has(mapId));
    if (entryMaps.length === 0) {
      issues.push({
        severity: "blocker",
        type: "entry-gap",
        chapterId: chapter.chapterId,
        path: `content/manual/chapters/${chapter.chapterId}.json`,
        message: `chapter "${chapter.chapterId}" has no detected entry map from the current world graph`,
      });
    }

    blockedMaps.forEach((mapId) => {
      issues.push({
        severity: "blocker",
        type: "inaccessible-map",
        chapterId: chapter.chapterId,
        path: `content/manual/chapters/${chapter.chapterId}.json`,
        message: `map "${mapId}" remains inaccessible after simulating current progression state`,
      });
    });

    const chapterIssues = issues.filter((issue) => issue.chapterId === chapter.chapterId);
    checklists.push({
      chapterId: chapter.chapterId,
      title: chapter.title,
      entryMaps,
      accessibleMaps: [...accessibleMaps].sort(),
      blockedMaps,
      checklist: [
        {
          label: "Entry Map Resolved / 入口地图已识别",
          passed: entryMaps.length > 0,
          detail: entryMaps.length > 0 ? entryMaps.join(", ") : "no detected entry map / 未识别到入口地图",
        },
        {
          label: "Mainline Maps Reachable / 主线地图可达",
          passed: blockedMaps.length === 0,
          detail: blockedMaps.length === 0 ? "all maps reachable / 所有地图均可达" : blockedMaps.join(", "),
        },
        {
          label: "Gate Providers Exist / 门禁提供者存在",
          passed: !chapterIssues.some((issue) => issue.type === "missing-provider"),
          detail: chapterIssues.filter((issue) => issue.type === "missing-provider").map((issue) => issue.message).join(" | ") || "ok / 正常",
        },
      ],
      blockerCount: chapterIssues.filter((issue) => issue.severity === "blocker").length,
      nonBlockerCount: chapterIssues.filter((issue) => issue.severity === "non-blocker").length,
    });

    snapshots.push({
      chapterId: chapter.chapterId,
      accessibleMaps: [...accessibleMaps].sort(),
      knownFlags: Object.entries(cumulativeFlags)
        .filter(([, enabled]) => enabled)
        .map(([flagId]) => flagId)
        .sort(),
      knownItems: inventoryMapToList(cumulativeItems),
    });
  });

  return {
    generatedAt: new Date().toISOString(),
    progressionStateModel: {
      chapterOrder,
      cumulativeSnapshots: snapshots,
    },
    mapAccessDependencySummary: transitions,
    flagGatingReport: transitions.filter((entry) => entry.requiredFlags.length > 0 || entry.requiredItems.length > 0),
    softLockRiskReport: {
      blockerCount: issues.filter((issue) => issue.severity === "blocker").length,
      nonBlockerCount: issues.filter((issue) => issue.severity === "non-blocker").length,
      issues,
    },
    chapterChecklists: checklists,
  };
}

export async function writeProgressionGatingArtifacts(): Promise<ProgressionGatingReport> {
  const report = await buildProgressionGatingReport();
  await mkdir(path.join(progressionGatingReportDir, "checklists"), { recursive: true });
  await writeFile(path.join(progressionGatingReportDir, "report.json"), `${stableStringify(report)}\n`, "utf8");
  await writeFile(path.join(progressionGatingReportDir, "summary.md"), renderSummary(report), "utf8");
  await Promise.all(report.chapterChecklists.map((checklist) =>
    writeFile(
      path.join(progressionGatingReportDir, "checklists", `${checklist.chapterId}.md`),
      renderChecklist(checklist),
      "utf8",
    )));
  return report;
}
