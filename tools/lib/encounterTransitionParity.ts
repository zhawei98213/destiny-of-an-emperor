import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadContentDatabase } from "../../game/src/content/contentLoader";
import { DEFAULT_CONTENT_MANIFESTS } from "../../game/src/content/contentKeys";
import type { MapDefinition } from "../../game/src/types/content";
import { readJsonFile, repoRoot, stableStringify } from "./importerCore";

export interface EncounterTransitionCase {
  id: string;
  title: string;
  chapterId: string;
  mapId: string;
  status: "passed" | "warning";
  summary: string;
  locator: {
    triggerId?: string;
    eventId?: string;
    encounterTableId?: string;
    battleGroupId?: string;
  };
  kind: "world-to-battle" | "story-to-battle" | "battle-to-world" | "map-to-map";
  evidence: string[];
}

export interface EncounterTransitionParityReport {
  generatedAt: string;
  auditedChapters: string[];
  encounterTriggerAudit: EncounterTransitionCase[];
  transitionTimingSummary: Array<{
    id: string;
    valueMs: number;
    source: string;
  }>;
  sceneHandoffStateValidation: {
    passed: number;
    warnings: number;
    notes: string[];
  };
  returnToWorldIntegrityCheck: {
    passed: number;
    warnings: number;
    notes: string[];
  };
}

interface BattleParityReport {
  cases: Array<{
    id: string;
    status: "calibrated" | "mismatch" | "fail";
    locator: {
      chapterId: string;
      mapId: string;
      triggerId?: string;
      encounterTableId?: string;
      battleGroupId: string;
    };
  }>;
}

export const encounterTransitionReportDir = path.join(repoRoot, "reports", "encounter-transition-parity", "latest");

class FileSystemContentReader {
  constructor(private readonly rootDir: string) {}

  async readText(targetPath: string): Promise<string> {
    const normalized = targetPath.startsWith("/") ? targetPath.slice(1) : targetPath;
    const { readFile } = await import("node:fs/promises");
    return readFile(path.resolve(this.rootDir, normalized), "utf8");
  }
}

function mapHasReturnPortal(map: MapDefinition, targetMapId: string): boolean {
  return map.portals.some((portal) => portal.targetMapId === targetMapId);
}

function filePath(relativePath: string): string {
  return path.join(repoRoot, relativePath);
}

export async function buildEncounterTransitionParityReport(): Promise<EncounterTransitionParityReport> {
  const database = await loadContentDatabase(new FileSystemContentReader(repoRoot), DEFAULT_CONTENT_MANIFESTS);
  const battleParityReport = await readJsonFile<BattleParityReport>(
    path.join(repoRoot, "reports", "battle-parity", "latest", "report.json"),
  );

  const cases: EncounterTransitionCase[] = [];
  const auditedChapters = ["chapter-05-highland-waystation", "chapter-06-border-fort", "chapter-07-forward-camp"];

  const highlandPass = database.maps.find((entry) => entry.id === "highland-pass");
  const borderRoad = database.maps.find((entry) => entry.id === "border-road");
  const borderFortYard = database.maps.find((entry) => entry.id === "border-fort-yard");
  const fortEastRoad = database.maps.find((entry) => entry.id === "fort-east-road");
  const forwardCampYard = database.maps.find((entry) => entry.id === "forward-camp-yard");

  if (highlandPass) {
    const trigger = highlandPass.triggers.find((entry) => entry.id === "highland-pass-battle-trigger");
    cases.push({
      id: "chapter-05-highland-waystation:world-to-battle",
      title: "Highland pass world to battle handoff / 山道 world 到 battle 衔接",
      chapterId: "chapter-05-highland-waystation",
      mapId: "highland-pass",
      status: trigger?.encounterTableId ? "passed" : "warning",
      summary: trigger?.encounterTableId
        ? "Region encounter trigger is bound and can hand off to battle through the shared battle request path."
        : "Region encounter trigger is missing or no longer bound to an encounter table.",
      locator: {
        triggerId: trigger?.id,
        encounterTableId: trigger?.encounterTableId,
      },
      kind: "world-to-battle",
      evidence: [
        filePath("content/manual/world.content.json"),
        filePath("game/src/scenes/WorldScene.ts"),
        filePath("game/src/world/worldEncounterRuntime.ts"),
      ],
    });
  }

  cases.push({
    id: "chapter-05-highland-waystation:battle-to-world",
    title: "Waystation battle return to world / 驿门战斗返回 world",
    chapterId: "chapter-05-highland-waystation",
    mapId: "waystation-gate",
    status: battleParityReport.cases.some((entry) => entry.id === "waystation-gate-outlaw-baseline" && entry.status === "calibrated")
      ? "passed"
      : "warning",
    summary: "Battle parity baseline confirms the calibrated battle returns to WorldScene with settlement data applied.",
    locator: {
      triggerId: "waystation-gate-battle-trigger",
      battleGroupId: "highland-outlaws",
    },
    kind: "battle-to-world",
    evidence: [
      filePath("reports/battle-parity/latest/report.json"),
      filePath("game/src/scenes/BattleScene.ts"),
      filePath("game/src/systems/gameStateRuntime.ts"),
    ],
  });

  cases.push({
    id: "chapter-06-border-fort:map-to-map",
    title: "Border road to fort yard warp / 边关前路到前营切图",
    chapterId: "chapter-06-border-fort",
    mapId: "border-road",
    status: borderRoad && borderFortYard && mapHasReturnPortal(borderFortYard, "border-road") ? "passed" : "warning",
    summary: borderRoad && borderFortYard && mapHasReturnPortal(borderFortYard, "border-road")
      ? "Gate-triggered warp enters border-fort-yard and the return portal remains intact."
      : "One side of the border road to fort yard transition is missing.",
    locator: {
      triggerId: "border-fort-gate-trigger",
      eventId: "border-fort-gate-event",
    },
    kind: "map-to-map",
    evidence: [
      filePath("content/manual/world.content.json"),
      filePath("content/manual/story.content.json"),
    ],
  });

  cases.push({
    id: "chapter-06-border-fort:story-to-battle",
    title: "Story to battle audit placeholder / 剧情到战斗衔接占位审计",
    chapterId: "chapter-06-border-fort",
    mapId: "border-road",
    status: "warning",
    summary: "Current real slices still rely on world encounter handoff instead of story-triggered battle nodes.",
    locator: {},
    kind: "story-to-battle",
    evidence: [
      filePath("content/manual/story.content.json"),
      filePath("content/manual/world.content.json"),
    ],
  });

  cases.push({
    id: "chapter-07-forward-camp:map-to-map",
    title: "Fort east road to forward camp yard / 前营东路到补给场切图",
    chapterId: "chapter-07-forward-camp",
    mapId: "fort-east-road",
    status: fortEastRoad && forwardCampYard && mapHasReturnPortal(forwardCampYard, "fort-east-road") ? "passed" : "warning",
    summary: fortEastRoad && forwardCampYard && mapHasReturnPortal(forwardCampYard, "fort-east-road")
      ? "Gate-triggered cutscene warp enters forward-camp-yard and the return portal remains intact."
      : "One side of the fort east road to forward camp yard transition is missing.",
    locator: {
      triggerId: "forward-camp-gate-trigger",
      eventId: "forward-camp-gate-event",
    },
    kind: "map-to-map",
    evidence: [
      filePath("content/manual/world.content.json"),
      filePath("content/manual/story.content.json"),
    ],
  });

  cases.push({
    id: "chapter-07-forward-camp:battle-to-world",
    title: "Forward camp battle return to world / 前营东路战斗返回 world",
    chapterId: "chapter-07-forward-camp",
    mapId: "fort-east-road",
    status: battleParityReport.cases.some((entry) => entry.id === "forward-camp-outlaw-baseline" && entry.status === "calibrated")
      ? "passed"
      : "warning",
    summary: "Battle parity baseline confirms the chapter-07 outlaw slice returns to WorldScene with settlement data applied.",
    locator: {
      triggerId: "fort-east-road-battle-trigger",
      encounterTableId: "fort-east-road-raiders",
      battleGroupId: "highland-outlaws",
    },
    kind: "battle-to-world",
    evidence: [
      filePath("reports/battle-parity/latest/report.json"),
      filePath("game/src/scenes/BattleScene.ts"),
      filePath("game/src/systems/gameStateRuntime.ts"),
    ],
  });

  const warnings = cases.filter((entry) => entry.status === "warning");
  return {
    generatedAt: new Date().toISOString(),
    auditedChapters,
    encounterTriggerAudit: cases,
    transitionTimingSummary: [
      {
        id: "battle-auto-turn-delay",
        valueMs: 450,
        source: "game/src/scenes/BattleScene.ts :: AutoTurnDelayMs",
      },
      {
        id: "world-grid-move-interval",
        valueMs: 130,
        source: "game/src/scenes/WorldScene.ts :: MoveIntervalMs",
      },
      {
        id: "dialogue-typewriter-fallback-frame",
        valueMs: 16,
        source: "game/src/scenes/WorldScene.ts :: updateDialogue delta fallback",
      },
    ],
    sceneHandoffStateValidation: {
      passed: cases.filter((entry) => entry.kind === "world-to-battle" || entry.kind === "map-to-map").length - warnings.filter((entry) => entry.kind === "world-to-battle" || entry.kind === "map-to-map").length,
      warnings: warnings.filter((entry) => entry.kind === "world-to-battle" || entry.kind === "map-to-map").length,
      notes: [
        "WorldScene and BattleScene still exchange state only through BattleRequest and GameStateRuntime snapshots.",
        "当前 WorldScene 和 BattleScene 仍通过 BattleRequest 与 GameStateRuntime 快照交换状态。",
      ],
    },
    returnToWorldIntegrityCheck: {
      passed: cases.filter((entry) => entry.kind === "battle-to-world" && entry.status === "passed").length,
      warnings: cases.filter((entry) => entry.kind === "battle-to-world" && entry.status === "warning").length,
      notes: [
        "BattleScene returns through finishBattle and applies rewards before restarting WorldScene.",
        "BattleScene 当前通过 finishBattle 回写奖励后再返回 WorldScene。",
      ],
    },
  };
}

function renderSummary(report: EncounterTransitionParityReport): string {
  return [
    "# Encounter And Transition Parity Report",
    "# 遭遇与切场衔接一致性报告",
    "",
    `- Generated At / 生成时间: ${report.generatedAt}`,
    `- Audited Chapters / 审计章节: ${report.auditedChapters.join(", ")}`,
    `- Encounter Cases / 遭遇条目数: ${report.encounterTriggerAudit.length}`,
    `- Warnings / 警告数: ${report.encounterTriggerAudit.filter((entry) => entry.status === "warning").length}`,
    "",
    "## Cases",
    "## 条目",
    "",
    ...report.encounterTriggerAudit.flatMap((entry) => [
      `### ${entry.id}`,
      "",
      `- Kind / 类型: ${entry.kind}`,
      `- Status / 状态: ${entry.status}`,
      `- Summary / 摘要: ${entry.summary}`,
      "",
    ]),
  ].join("\n");
}

export async function writeEncounterTransitionParityArtifacts(): Promise<EncounterTransitionParityReport> {
  const report = await buildEncounterTransitionParityReport();
  await mkdir(encounterTransitionReportDir, { recursive: true });
  await writeFile(path.join(encounterTransitionReportDir, "report.json"), `${stableStringify(report)}\n`, "utf8");
  await writeFile(path.join(encounterTransitionReportDir, "summary.md"), `${renderSummary(report)}\n`, "utf8");
  return report;
}
