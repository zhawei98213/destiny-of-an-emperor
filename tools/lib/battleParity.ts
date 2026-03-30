import path from "node:path";
import { readFile } from "node:fs/promises";
import { createBattleState, runAttackTurn } from "@/battle/battleRuntime";
import { loadContentDatabase, type ContentReader } from "@/content/contentLoader";
import { GameStateRuntime } from "@/systems/gameStateRuntime";
import type {
  ContentDatabase,
  InventoryState,
  SaveData,
} from "@/types/content";
import {
  readJsonFile,
  repoRoot,
  stableStringify,
} from "./importerCore";
import {
  type BattleParityCase,
  type BattleParityDamageEntry,
  type BattleParitySuite,
  validateBattleParitySuite,
} from "./battleParityCases";
import {
  type GoldenRegressionCase,
  type GoldenRegressionSuite,
  validateGoldenRegressionSuite,
} from "../../tests/regression/goldenCaseSchema";

const MANIFEST_PATHS = ["/content/manual/index.json", "/content/generated/index.json"] as const;
const BATTLE_PARITY_CASES_PATH = path.join(repoRoot, "tests", "regression", "battle-parity-cases.json");
const GOLDEN_CASES_PATH = path.join(repoRoot, "tests", "regression", "golden-cases.json");
const DEFAULT_REGRESSION_REPORT_PATH = path.join(repoRoot, "reports", "regression", "latest", "report.json");

type DimensionStatus = "pass" | "mismatch" | "fail";

interface RegressionCaseSummary {
  id: string;
  status: "pass" | "mismatch" | "fail";
  locator: {
    triggerKind?: string;
    mapId?: string;
    triggerId?: string;
    encounterTableId?: string;
    battleGroupId?: string;
  };
  observedUi?: {
    sceneFlow?: string[];
    activeScene?: string;
    battleOutcome?: string;
  };
  observedState?: {
    world?: {
      currentMapId?: string;
      currentSpawnId?: string;
      playerX?: number;
      playerY?: number;
      facing?: string;
    };
  };
}

interface RegressionReportSummary {
  generatedAt: string;
  totals: {
    pass: number;
    mismatch: number;
    fail: number;
    total: number;
  };
  cases: RegressionCaseSummary[];
}

interface BattleSimulation {
  enemyIds: string[];
  openingTurnOrder: string[];
  damageSequence: BattleParityDamageEntry[];
  rewards: {
    experience: number;
    gold: number;
    items: InventoryState["items"];
  };
  outcome: "victory" | "defeat";
}

export interface BattleParityDimensionResult {
  id:
    | "enemy-composition"
    | "turn-order"
    | "damage-rewards"
    | "world-return"
    | "trigger-settlement";
  label: string;
  status: DimensionStatus;
  expected: unknown;
  actual: unknown;
  mismatches: string[];
}

export interface BattleParityCaseResult {
  id: string;
  chapterId: string;
  name: string;
  goldenCaseId: string;
  calibrated: boolean;
  status: DimensionStatus;
  regressionCaseStatus?: RegressionCaseSummary["status"];
  dimensions: BattleParityDimensionResult[];
}

export interface BattleParityReport {
  generatedAt: string;
  inputs: {
    battleParityCasesPath: string;
    goldenCasesPath: string;
    regressionReportPath: string;
  };
  totals: {
    totalCases: number;
    calibratedCases: number;
    mismatchCases: number;
    failedCases: number;
  };
  cases: BattleParityCaseResult[];
}

export interface BuildBattleParityReportOptions {
  regressionReportPath?: string;
}

class FsContentReader implements ContentReader {
  async readText(filePath: string): Promise<string> {
    return readFile(path.resolve(repoRoot, `.${filePath}`), "utf8");
  }
}

function sortItems(items: InventoryState["items"]): InventoryState["items"] {
  return [...items]
    .map((entry) => ({ ...entry }))
    .sort((left, right) => left.itemId.localeCompare(right.itemId) || left.quantity - right.quantity);
}

function normalizeDamageSequence(entries: BattleParityDamageEntry[]): BattleParityDamageEntry[] {
  return entries.map((entry) => ({ ...entry }));
}

function applyStateSeed(saveData: SaveData, seed: GoldenRegressionCase["initialState"]): SaveData {
  return {
    ...saveData,
    world: seed.world
      ? {
        mapId: seed.world.mapId,
        spawnPointId: seed.world.spawnPointId,
        playerX: seed.world.playerX,
        playerY: seed.world.playerY,
        facing: seed.world.facing,
        stepCount: seed.world.stepCount ?? saveData.world.stepCount,
      }
      : saveData.world,
    flags: seed.flags ? { ...saveData.flags, ...seed.flags } : { ...saveData.flags },
    inventory: seed.inventory
      ? {
        gold: seed.inventory.gold,
        items: seed.inventory.items.map((entry) => ({ ...entry })),
      }
      : {
        gold: saveData.inventory.gold,
        items: saveData.inventory.items.map((entry) => ({ ...entry })),
      },
    partyMemberIds: seed.partyMemberIds ? [...seed.partyMemberIds] : [...saveData.partyMemberIds],
    partyStates: seed.partyStates
      ? Object.fromEntries(
        Object.entries({
          ...saveData.partyStates,
          ...seed.partyStates,
        }).map(([memberId, state]) => [memberId, { ...state, statusIds: [...state.statusIds] }]),
      )
      : Object.fromEntries(
        Object.entries(saveData.partyStates).map(([memberId, state]) => [memberId, { ...state, statusIds: [...state.statusIds] }]),
      ),
    shopStates: seed.shopStates
      ? Object.fromEntries(
        Object.entries({
          ...saveData.shopStates,
          ...seed.shopStates,
        }).map(([shopId, state]) => [shopId, { ...state }]),
      )
      : Object.fromEntries(
        Object.entries(saveData.shopStates).map(([shopId, state]) => [shopId, { ...state }]),
      ),
    consumedTriggerIds: seed.consumedTriggerIds
      ? [...seed.consumedTriggerIds]
      : [...saveData.consumedTriggerIds],
  };
}

async function loadBattleParitySuite(): Promise<BattleParitySuite> {
  const raw = await readFile(BATTLE_PARITY_CASES_PATH, "utf8");
  return validateBattleParitySuite(JSON.parse(raw) as unknown);
}

async function loadGoldenSuite(): Promise<GoldenRegressionSuite> {
  const raw = await readFile(GOLDEN_CASES_PATH, "utf8");
  return validateGoldenRegressionSuite(JSON.parse(raw) as unknown);
}

async function createDatabase(): Promise<ContentDatabase> {
  return loadContentDatabase(new FsContentReader(), MANIFEST_PATHS);
}

function simulateBattle(
  database: ContentDatabase,
  battleCase: BattleParityCase,
  goldenCase: GoldenRegressionCase,
): BattleSimulation {
  const gameState = new GameStateRuntime(database);
  const seededSave = applyStateSeed(gameState.toSaveData("battle-parity"), goldenCase.initialState);
  gameState.loadSaveData(seededSave);

  let state = createBattleState(database, gameState.getSnapshot(), {
    battleGroupId: battleCase.expected.battleGroupId,
    originMapId: goldenCase.initialState.world?.mapId ?? "",
  });

  const openingTurnOrder = [...state.turnOrder];
  const damageSequence: BattleParityDamageEntry[] = [];

  while (!state.outcome) {
    const result = runAttackTurn(state);
    if (result.actorId && result.targetId && typeof result.damage === "number") {
      damageSequence.push({
        actorId: result.actorId,
        targetId: result.targetId,
        damage: result.damage,
      });
    }
    state = result.state;
  }

  return {
    enemyIds: state.units.filter((unit) => unit.side === "enemy").map((unit) => unit.definitionId),
    openingTurnOrder,
    damageSequence,
    rewards: {
      experience: state.outcome.rewards.experience,
      gold: state.outcome.rewards.gold,
      items: sortItems(state.outcome.rewards.items),
    },
    outcome: state.outcome.outcome,
  };
}

function compareValue(label: string, expected: unknown, actual: unknown): string[] {
  return stableStringify(expected) === stableStringify(actual)
    ? []
    : [`${label} mismatch: expected ${stableStringify(expected)} actual ${stableStringify(actual)}`];
}

function createDimension(
  id: BattleParityDimensionResult["id"],
  label: string,
  expected: unknown,
  actual: unknown,
  extraMismatches: string[] = [],
  fail = false,
): BattleParityDimensionResult {
  const mismatches = fail ? extraMismatches : [...compareValue(label, expected, actual), ...extraMismatches];
  return {
    id,
    label,
    status: fail ? "fail" : mismatches.length > 0 ? "mismatch" : "pass",
    expected,
    actual,
    mismatches,
  };
}

export async function buildBattleParityReport(
  options: BuildBattleParityReportOptions = {},
): Promise<BattleParityReport> {
  const regressionReportPath = options.regressionReportPath ?? DEFAULT_REGRESSION_REPORT_PATH;
  const [database, paritySuite, goldenSuite, regressionReport] = await Promise.all([
    createDatabase(),
    loadBattleParitySuite(),
    loadGoldenSuite(),
    readJsonFile<RegressionReportSummary>(regressionReportPath),
  ]);

  const cases = paritySuite.cases.map((battleCase) => {
    const goldenCase = goldenSuite.cases.find((entry) => entry.id === battleCase.goldenCaseId);
    const regressionCase = regressionReport.cases.find((entry) => entry.id === battleCase.goldenCaseId);

    if (!goldenCase || !regressionCase) {
      const dimensions: BattleParityDimensionResult[] = [
        createDimension(
          "trigger-settlement",
          "关键战斗触发与结算 / Trigger And Settlement",
          { goldenCaseId: battleCase.goldenCaseId },
          {
            goldenCaseFound: Boolean(goldenCase),
            regressionCaseFound: Boolean(regressionCase),
          },
          [
            !goldenCase ? `Missing golden regression case "${battleCase.goldenCaseId}"` : "",
            !regressionCase ? `Missing regression report case "${battleCase.goldenCaseId}"` : "",
          ].filter(Boolean),
          true,
        ),
      ];

      return {
        id: battleCase.id,
        chapterId: battleCase.chapterId,
        name: battleCase.name,
        goldenCaseId: battleCase.goldenCaseId,
        calibrated: false,
        status: "fail" as const,
        regressionCaseStatus: regressionCase?.status,
        dimensions,
      };
    }

    const battleGroup = database.battleGroups.find((entry) => entry.id === battleCase.expected.battleGroupId);
    if (!battleGroup) {
      const dimensions: BattleParityDimensionResult[] = [
        createDimension(
          "enemy-composition",
          "敌群组成 / Enemy Composition",
          battleCase.expected.battleGroupId,
          null,
          [`Missing battle group "${battleCase.expected.battleGroupId}" in content database`],
          true,
        ),
      ];

      return {
        id: battleCase.id,
        chapterId: battleCase.chapterId,
        name: battleCase.name,
        goldenCaseId: battleCase.goldenCaseId,
        calibrated: false,
        status: "fail" as const,
        regressionCaseStatus: regressionCase.status,
        dimensions,
      };
    }

    const simulation = simulateBattle(database, battleCase, goldenCase);
    const expectedRewards = {
      experience: battleCase.expected.rewards.experience,
      gold: battleCase.expected.rewards.gold,
      items: sortItems(battleCase.expected.rewards.items),
    };
    const actualRewards = {
      experience: simulation.rewards.experience,
      gold: simulation.rewards.gold,
      items: simulation.rewards.items,
    };

    const dimensions: BattleParityDimensionResult[] = [
      createDimension(
        "enemy-composition",
        "敌群组成 / Enemy Composition",
        {
          battleGroupId: battleCase.expected.battleGroupId,
          enemyIds: battleCase.expected.enemyIds,
        },
        {
          battleGroupId: battleGroup.id,
          enemyIds: simulation.enemyIds,
        },
      ),
      createDimension(
        "turn-order",
        "出手顺序基础逻辑 / Turn Order Baseline",
        battleCase.expected.openingTurnOrder,
        simulation.openingTurnOrder,
      ),
      createDimension(
        "damage-rewards",
        "基础伤害与奖励 / Damage And Rewards",
        {
          damageSequence: normalizeDamageSequence(battleCase.expected.damageSequence),
          rewards: expectedRewards,
        },
        {
          damageSequence: normalizeDamageSequence(simulation.damageSequence),
          rewards: actualRewards,
        },
        compareValue("battle outcome", battleCase.expected.outcome, simulation.outcome),
      ),
      createDimension(
        "world-return",
        "战后返回 World 状态 / World Return State",
        battleCase.expected.worldReturn,
        {
          mapId: regressionCase.observedState?.world?.currentMapId,
          spawnId: regressionCase.observedState?.world?.currentSpawnId,
          playerX: regressionCase.observedState?.world?.playerX,
          playerY: regressionCase.observedState?.world?.playerY,
          facing: regressionCase.observedState?.world?.facing,
        },
        regressionCase.status === "pass"
          ? []
          : [`Regression case "${regressionCase.id}" is ${regressionCase.status}, not pass`],
      ),
      createDimension(
        "trigger-settlement",
        "关键战斗触发与结算 / Trigger And Settlement",
        {
          trigger: battleCase.expected.trigger,
          settlement: battleCase.expected.settlement,
        },
        {
          trigger: {
            mapId: regressionCase.locator.mapId,
            triggerId: regressionCase.locator.triggerId,
            encounterTableId: regressionCase.locator.encounterTableId,
            battleGroupId: regressionCase.locator.battleGroupId,
          },
          settlement: {
            sceneFlow: regressionCase.observedUi?.sceneFlow,
            activeScene: regressionCase.observedUi?.activeScene,
            battleOutcome: regressionCase.observedUi?.battleOutcome,
          },
        },
        regressionCase.status === "pass"
          ? []
          : [`Regression case "${regressionCase.id}" is ${regressionCase.status}, not pass`],
      ),
    ];

    const status: DimensionStatus = dimensions.some((entry) => entry.status === "fail")
      ? "fail"
      : dimensions.some((entry) => entry.status === "mismatch")
        ? "mismatch"
        : "pass";

    return {
      id: battleCase.id,
      chapterId: battleCase.chapterId,
      name: battleCase.name,
      goldenCaseId: battleCase.goldenCaseId,
      calibrated: status === "pass",
      status,
      regressionCaseStatus: regressionCase.status,
      dimensions,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    inputs: {
      battleParityCasesPath: BATTLE_PARITY_CASES_PATH,
      goldenCasesPath: GOLDEN_CASES_PATH,
      regressionReportPath,
    },
    totals: {
      totalCases: cases.length,
      calibratedCases: cases.filter((entry) => entry.calibrated).length,
      mismatchCases: cases.filter((entry) => entry.status === "mismatch").length,
      failedCases: cases.filter((entry) => entry.status === "fail").length,
    },
    cases,
  };
}
