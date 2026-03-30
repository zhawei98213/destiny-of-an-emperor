import { writeFile } from "node:fs/promises";
import path from "node:path";
import { readFile } from "node:fs/promises";
import {
  createPerformanceRecorder,
  summarizePerformanceMetricSamples,
  type PerformanceIssueKind,
  type PerformanceMetricSample,
  type PerformanceMetricSummary,
} from "../../game/src/core/performanceLog";
import { createBattleState } from "../../game/src/battle/battleRuntime";
import { loadContentDatabase } from "../../game/src/content/contentLoader";
import { DEFAULT_CONTENT_MANIFESTS } from "../../game/src/content/contentKeys";
import { GameStateRuntime } from "../../game/src/systems/gameStateRuntime";
import { MemoryStorage, SaveManager } from "../../game/src/systems/saveManager";
import type {
  BattleRequest,
  ContentDatabase,
  EncounterTableDefinition,
  MapDefinition,
  SaveData,
  TriggerDefinition,
} from "../../game/src/types/content";
import { resolveRegionEncounter } from "../../game/src/world/worldEncounterRuntime";
import { WorldRuntime } from "../../game/src/world/worldRuntime";
import {
  repoRoot,
  writeStableJsonFile,
} from "./importerCore";

const reportsDir = path.join(repoRoot, "reports", "performance", "latest");

class FileSystemContentReader {
  constructor(private readonly rootDir: string) {}

  async readText(targetPath: string): Promise<string> {
    const normalized = targetPath.startsWith("/")
      ? targetPath.slice(1)
      : targetPath;

    return readFile(path.resolve(this.rootDir, normalized), "utf8");
  }
}

export interface PerformanceBottleneck {
  metricId: string;
  metricLabel: string;
  stepId: string;
  stepLabel: string;
  issueKind: PerformanceIssueKind;
  averageMs: number;
  shareOfMetric: number;
  priority: "high" | "medium" | "low";
  suggestedFocus: string;
}

export interface PerformanceBaselineReport {
  generatedAt: string;
  iterations: number;
  metrics: PerformanceMetricSummary[];
  bottlenecks: PerformanceBottleneck[];
  findings: {
    runtime: string[];
    resource: string[];
    import: string[];
  };
}

export interface PerformanceBaselineOptions {
  iterations?: number;
}

function roundMs(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function pickEncounterTrigger(
  database: ContentDatabase,
  preferredIds: string[],
): { map: MapDefinition; trigger: TriggerDefinition; encounterTable: EncounterTableDefinition } {
  for (const triggerId of preferredIds) {
    for (const map of database.maps) {
      const trigger = map.triggers.find((entry) => entry.id === triggerId && entry.kind === "region");
      if (!trigger?.encounterTableId) {
        continue;
      }

      const encounterTable = database.encounterTables.find((entry) => entry.id === trigger.encounterTableId);
      if (encounterTable) {
        return { map, trigger, encounterTable };
      }
    }
  }

  throw new Error("Performance baseline could not find a real encounter trigger.");
}

function createRepresentativeSaveData(database: ContentDatabase): SaveData {
  const gameState = new GameStateRuntime(database);
  const worldState = gameState.getWorldState();
  const saveData = gameState.toSaveData("perf-current");
  return {
    ...saveData,
    chapterId: "chapter-03-river-ford",
    world: {
      mapId: "river-ford",
      spawnPointId: "from-west-pass",
      playerX: 6,
      playerY: 7,
      facing: "right",
      stepCount: Math.max(64, worldState.stepCount),
    },
    flags: {
      ...saveData.flags,
      "lou-sang-east-gate-open": true,
      "river-ford-gate-open": true,
    },
    inventory: {
      gold: 280,
      items: [
        { itemId: "travel-pass", quantity: 1 },
        { itemId: "ford-seal", quantity: 1 },
        { itemId: "herb", quantity: 3 },
      ],
    },
    consumedTriggerIds: [
      "lou-sang-chest-trigger",
      "relay-cache-trigger",
    ],
    shopStates: Object.fromEntries(
      Object.entries(saveData.shopStates).map(([shopId, shopState]) => [shopId, {
        ...shopState,
        visited: shopId === "starter-shop" || shopId === "ford-camp-shop",
      }]),
    ),
  };
}

function createLegacyVersion2SaveData(current: SaveData): Record<string, unknown> {
  return {
    version: 2,
    slot: "perf-legacy-v2",
    world: { ...current.world },
    partyMemberIds: [...current.partyMemberIds],
    partyStates: Object.fromEntries(
      Object.entries(current.partyStates).map(([memberId, state]) => [memberId, { ...state, statusIds: [...state.statusIds] }]),
    ),
    flags: { ...current.flags },
    questStates: { ...current.questStates },
    inventory: {
      gold: current.inventory.gold,
      items: current.inventory.items.map((entry) => ({ ...entry })),
    },
    chapterId: current.chapterId,
    shopStates: Object.fromEntries(
      Object.entries(current.shopStates).map(([shopId, shopState]) => [shopId, { ...shopState }]),
    ),
    consumedTriggerIds: [...current.consumedTriggerIds],
  };
}

async function sampleStartup(): Promise<PerformanceMetricSample> {
  const recorder = createPerformanceRecorder("startup", "Boot Pipeline / 启动链路", "import");
  const database = await recorder.measureAsync(
    "content-load",
    "Load content database / 加载内容数据库",
    "import",
    async () => loadContentDatabase(new FileSystemContentReader(repoRoot), DEFAULT_CONTENT_MANIFESTS),
  );
  const representativeSave = createRepresentativeSaveData(database);
  const storage = recorder.measure(
    "seed-storage",
    "Seed current save / 写入当前存档样本",
    "runtime",
    () => {
      const nextStorage = new MemoryStorage();
      nextStorage.setItem("save:slot-1", JSON.stringify(representativeSave));
      return nextStorage;
    },
  );
  const saveManager = recorder.measure(
    "create-save-manager",
    "Create save manager / 创建存档管理器",
    "runtime",
    () => new SaveManager(storage, database),
  );
  const saveData = recorder.measure(
    "load-save",
    "Load current save / 读取当前存档",
    "runtime",
    () => saveManager.load("slot-1"),
  );
  const gameState = recorder.measure(
    "init-game-state",
    "Init game state runtime / 初始化游戏状态运行时",
    "runtime",
    () => new GameStateRuntime(database, saveData ?? undefined),
  );
  recorder.measure(
    "init-world-runtime",
    "Init world runtime / 初始化世界运行时",
    "runtime",
    () => new WorldRuntime(database, gameState.getWorldState()),
  );
  return recorder.finish([
    "Focuses on content loading plus runtime bootstrap, not browser paint.",
    "聚焦内容加载与运行时启动，不包含浏览器首帧绘制。",
  ]);
}

async function sampleMapTransition(): Promise<PerformanceMetricSample> {
  const database = await loadContentDatabase(new FileSystemContentReader(repoRoot), DEFAULT_CONTENT_MANIFESTS);
  const recorder = createPerformanceRecorder("map-transition", "Map Transition / 地图切换", "runtime");
  const worldRuntime = recorder.measure(
    "create-world-runtime",
    "Create world runtime / 创建世界运行时",
    "runtime",
    () => new WorldRuntime(database, {
      currentMapId: "relay-east-pass",
      currentSpawnId: "from-relay-post-east",
      playerX: 16,
      playerY: 7,
      facing: "right",
      stepCount: 96,
    }),
  );
  const gameState = recorder.measure(
    "create-game-state",
    "Create game state / 创建游戏状态",
    "runtime",
    () => new GameStateRuntime(database),
  );
  recorder.measure(
    "portal-resolution",
    "Resolve target spawn / 解析目标出生点",
    "runtime",
    () => worldRuntime.setSpawn("river-ford", "from-west-pass"),
  );
  recorder.measure(
    "world-state-sync",
    "Sync world state / 同步世界状态",
    "runtime",
    () => gameState.syncWorldState(worldRuntime.getState()),
  );
  recorder.measure(
    "read-map-definition",
    "Read current map / 读取当前地图定义",
    "resource",
    () => worldRuntime.getCurrentMap(),
  );
  return recorder.finish([
    "Logic-only portal switch baseline. Phaser render cost is tracked separately later.",
    "这里只测逻辑层 portal 切换，Phaser 渲染成本后续单独跟踪。",
  ]);
}

async function sampleBattleEntry(): Promise<PerformanceMetricSample> {
  const database = await loadContentDatabase(new FileSystemContentReader(repoRoot), DEFAULT_CONTENT_MANIFESTS);
  const recorder = createPerformanceRecorder("battle-entry", "Battle Entry / 首次进入战斗", "runtime");
  const { map, trigger, encounterTable } = pickEncounterTrigger(database, [
    "relay-east-pass-battle-trigger",
    "east-road-battle-trigger",
    "field-battle-trigger",
    "river-ford-battle-trigger",
  ]);
  const gameState = recorder.measure(
    "create-game-state",
    "Create game state / 创建游戏状态",
    "runtime",
    () => new GameStateRuntime(database),
  );
  const encounter = recorder.measure(
    "resolve-encounter",
    "Resolve encounter table / 解析遭遇表",
    "runtime",
    () => resolveRegionEncounter(
      database,
      trigger,
      {
        currentMapId: map.id,
        currentSpawnId: map.spawnPoints[0]?.id ?? "",
        playerX: trigger.x ?? 0,
        playerY: trigger.y ?? 0,
        facing: "right",
        stepCount: encounterTable.stepInterval,
      },
      gameState.getSnapshot(),
    ),
  );
  if (!encounter) {
    throw new Error(`Performance baseline could not resolve encounter for trigger "${trigger.id}".`);
  }

  const request: BattleRequest = {
    battleGroupId: encounter.battleGroupId,
    originMapId: map.id,
    triggerId: encounter.triggerId,
  };
  recorder.measure(
    "create-battle-state",
    "Create battle state / 创建战斗状态",
    "runtime",
    () => createBattleState(database, gameState.getSnapshot(), request),
  );
  return recorder.finish([
    `Uses real trigger ${trigger.id} on ${map.id}.`,
    `使用真实触发器 ${trigger.id} 和地图 ${map.id}。`,
  ]);
}

async function sampleSaveLoad(): Promise<PerformanceMetricSample> {
  const database = await loadContentDatabase(new FileSystemContentReader(repoRoot), DEFAULT_CONTENT_MANIFESTS);
  const recorder = createPerformanceRecorder("save-load", "Save And Load / 存档与读档", "runtime");
  const representativeSave = createRepresentativeSaveData(database);
  const legacySave = createLegacyVersion2SaveData(representativeSave);
  const storage = recorder.measure(
    "create-storage",
    "Create memory storage / 创建内存存储",
    "runtime",
    () => new MemoryStorage(),
  );
  const saveManager = recorder.measure(
    "create-save-manager",
    "Create save manager / 创建存档管理器",
    "runtime",
    () => new SaveManager(storage, database),
  );
  recorder.measure(
    "save-current",
    "Save current schema / 写入当前 schema 存档",
    "runtime",
    () => saveManager.save(representativeSave),
  );
  recorder.measure(
    "load-current",
    "Load current schema / 读取当前 schema 存档",
    "runtime",
    () => saveManager.load("perf-current"),
  );
  storage.setItem("save:perf-legacy-v2", JSON.stringify(legacySave));
  recorder.measure(
    "load-legacy-v2",
    "Load migrated v2 save / 读取并迁移 v2 存档",
    "runtime",
    () => saveManager.load("perf-legacy-v2"),
  );
  return recorder.finish([
    "Includes migration path cost for a representative v2 save.",
    "包含代表性 v2 存档的迁移成本。",
  ]);
}

function summarizeBottlenecks(metrics: PerformanceMetricSummary[]): PerformanceBottleneck[] {
  return metrics
    .flatMap((metric) => metric.steps.slice(0, 3).map((step) => ({
      metricId: metric.id,
      metricLabel: metric.label,
      stepId: step.id,
      stepLabel: step.label,
      issueKind: step.issueKind,
      averageMs: step.averageMs,
      shareOfMetric: metric.averageMs === 0 ? 0 : roundMs(step.averageMs / metric.averageMs),
      priority: (step.averageMs >= 3 ? "high" : step.averageMs >= 1 ? "medium" : "low") as PerformanceBottleneck["priority"],
      suggestedFocus: step.issueKind === "import"
        ? "Check importer output size, manifest count, and JSON parse volume."
        : step.issueKind === "resource"
          ? "Check asset fan-out and runtime lookup density before optimizing scene code."
          : "Check runtime object churn, repeated validation, and duplicate state rebuilds.",
    })))
    .sort((left, right) => right.averageMs - left.averageMs)
    .slice(0, 8);
}

function buildFindings(metrics: PerformanceMetricSummary[], bottlenecks: PerformanceBottleneck[]) {
  const startupMetric = metrics.find((entry) => entry.id === "startup");
  const mapMetric = metrics.find((entry) => entry.id === "map-transition");
  const battleMetric = metrics.find((entry) => entry.id === "battle-entry");
  const saveMetric = metrics.find((entry) => entry.id === "save-load");

  return {
    runtime: [
      startupMetric
        ? `Startup runtime init averages ${startupMetric.averageMs}ms, with ${startupMetric.steps[0]?.label ?? "no step"} as the heaviest boot segment.`
        : "Startup runtime metric is unavailable.",
      battleMetric
        ? `Battle entry averages ${battleMetric.averageMs}ms; this is the current baseline for real encounter-to-battle setup.`
        : "Battle entry metric is unavailable.",
      saveMetric
        ? `Save/load averages ${saveMetric.averageMs}ms including migrated legacy load, so save compatibility cost stays visible.`
        : "Save/load metric is unavailable.",
    ],
    resource: [
      mapMetric
        ? `Map transition lookup averages ${mapMetric.averageMs}ms in logic-only mode; render and texture decode are still outside this baseline.`
        : "Map transition metric is unavailable.",
      "Current CLI baseline measures content/resource lookup, not Phaser texture upload or browser paint.",
    ],
    import: [
      startupMetric
        ? `Startup includes full content manifest and pack loading, so importer output growth will show up here first.`
        : "Startup import metric is unavailable.",
      bottlenecks.some((entry) => entry.issueKind === "import")
        ? `Top import hotspot: ${bottlenecks.find((entry) => entry.issueKind === "import")?.stepLabel ?? "n/a"}.`
        : "No import-specific hotspot crossed the current report threshold.",
    ],
  };
}

export async function runPerformanceBaseline(
  options: PerformanceBaselineOptions = {},
): Promise<PerformanceBaselineReport> {
  const iterations = Math.max(1, options.iterations ?? 5);
  const samples = new Map<string, PerformanceMetricSample[]>();
  const metricFactories = [
    sampleStartup,
    sampleMapTransition,
    sampleBattleEntry,
    sampleSaveLoad,
  ];

  for (let index = 0; index < iterations; index += 1) {
    for (const factory of metricFactories) {
      const sample = await factory();
      const metricSamples = samples.get(sample.id) ?? [];
      metricSamples.push(sample);
      samples.set(sample.id, metricSamples);
    }
  }

  const metrics = [...samples.entries()]
    .map(([metricId, metricSamples]) => summarizePerformanceMetricSamples(metricId, metricSamples))
    .sort((left, right) => left.label.localeCompare(right.label));
  const bottlenecks = summarizeBottlenecks(metrics);
  return {
    generatedAt: new Date().toISOString(),
    iterations,
    metrics,
    bottlenecks,
    findings: buildFindings(metrics, bottlenecks),
  };
}

export function formatPerformanceBaselineReport(report: PerformanceBaselineReport): string {
  const lines = [
    "Performance Baseline Report / 性能基线报告",
    `Generated At / 生成时间: ${report.generatedAt}`,
    `Iterations / 采样轮次: ${report.iterations}`,
    "",
    "Metrics / 指标",
  ];

  report.metrics.forEach((metric) => {
    lines.push(
      `- ${metric.label}: avg=${metric.averageMs}ms min=${metric.minMs}ms max=${metric.maxMs}ms issueKind=${metric.issueKind}`,
    );
    metric.steps.slice(0, 3).forEach((step) => {
      lines.push(`  - ${step.label}: avg=${step.averageMs}ms max=${step.maxMs}ms issueKind=${step.issueKind}`);
    });
  });

  lines.push("", "Bottlenecks / 瓶颈");
  report.bottlenecks.forEach((entry) => {
    lines.push(
      `- ${entry.metricLabel} :: ${entry.stepLabel} avg=${entry.averageMs}ms share=${entry.shareOfMetric} priority=${entry.priority} issueKind=${entry.issueKind}`,
    );
  });

  return lines.join("\n");
}

export async function writePerformanceBaselineArtifacts(
  report: PerformanceBaselineReport,
): Promise<PerformanceBaselineReport> {
  await writeStableJsonFile(path.join(reportsDir, "report.json"), report);
  const summaryLines = [
    "# Performance Baseline",
    "# 性能基线",
    "",
    `Generated At / 生成时间: ${report.generatedAt}`,
    `Iterations / 采样轮次: ${report.iterations}`,
    "",
    "## Metrics",
    "## 指标",
    "",
    "| Metric | Avg (ms) | Min (ms) | Max (ms) | Issue Kind |",
    "| --- | ---: | ---: | ---: | --- |",
    ...report.metrics.map((metric) => `| ${metric.label} | ${metric.averageMs} | ${metric.minMs} | ${metric.maxMs} | ${metric.issueKind} |`),
    "",
    "## Bottlenecks",
    "## 瓶颈",
    "",
    ...report.bottlenecks.map((entry) => `- ${entry.metricLabel}: ${entry.stepLabel} (${entry.averageMs}ms, ${entry.issueKind}, ${entry.priority})`),
    "",
    "## Findings",
    "## 结论",
    "",
    "### Runtime",
    "### 运行时",
    ...report.findings.runtime.map((entry) => `- ${entry}`),
    "",
    "### Resource",
    "### 资源",
    ...report.findings.resource.map((entry) => `- ${entry}`),
    "",
    "### Import",
    "### 导入",
    ...report.findings.import.map((entry) => `- ${entry}`),
  ];
  await writeFile(path.join(reportsDir, "summary.md"), `${summaryLines.join("\n")}\n`, "utf8");
  return report;
}
