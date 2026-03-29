import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createBattleState, runAttackTurn } from "@/battle/battleRuntime";
import { loadContentDatabase, type ContentReader } from "@/content/contentLoader";
import { createEventRuntime, EventInterpreter } from "@/systems/eventInterpreter";
import { GameStateRuntime } from "@/systems/gameStateRuntime";
import { MemoryStorage, SaveManager } from "@/systems/saveManager";
import type {
  ContentDatabase,
  InventoryState,
  PartyMemberState,
  SaveData,
} from "@/types/content";
import { WorldRuntime } from "@/world/worldRuntime";
import { findNpcInteractionTrigger, findTriggersAtPoint } from "@/world/worldTriggerResolver";
import type {
  GoldenExpectedState,
  GoldenRegressionCase,
  GoldenRegressionSuite,
  GoldenStateSeed,
} from "./goldenCaseSchema";
import { validateGoldenRegressionSuite } from "./goldenCaseSchema";

const GOLDEN_CASES_PATH = resolve(process.cwd(), "tests/regression/golden-cases.json");
const MANIFEST_PATHS = ["/content/manual/index.json", "/content/generated/index.json"] as const;
const WORLD_SCENE_ID = "WorldScene";
const BATTLE_SCENE_ID = "BattleScene";

type RegressionStatus = "pass" | "mismatch" | "fail";

export interface GoldenObservedUi {
  sceneFlow: string[];
  activeScene: string;
  dialogueLineIds: string[];
  battleOutcome?: "victory" | "defeat";
}

export interface GoldenObservedState {
  world: ReturnType<GameStateRuntime["getWorldState"]>;
  flags: Record<string, boolean>;
  inventory: InventoryState;
  partyMemberIds: string[];
  partyStates: Record<string, PartyMemberState>;
  consumedTriggerIds: string[];
}

export interface GoldenCaseResult {
  id: string;
  name: string;
  status: RegressionStatus;
  mismatches: string[];
  error?: string;
  observedUi?: GoldenObservedUi;
  observedState?: GoldenObservedState;
}

export interface GoldenRegressionReport {
  generatedAt: string;
  totals: {
    pass: number;
    mismatch: number;
    fail: number;
    total: number;
  };
  cases: GoldenCaseResult[];
}

class FsContentReader implements ContentReader {
  async readText(path: string): Promise<string> {
    const filePath = resolve(process.cwd(), `.${path}`);
    return readFile(filePath, "utf8");
  }
}

export async function loadGoldenRegressionSuite(): Promise<GoldenRegressionSuite> {
  const raw = await readFile(GOLDEN_CASES_PATH, "utf8");
  return validateGoldenRegressionSuite(JSON.parse(raw) as unknown);
}

export async function createRegressionDatabase(): Promise<ContentDatabase> {
  return loadContentDatabase(new FsContentReader(), MANIFEST_PATHS);
}

function applyStateSeed(saveData: SaveData, seed: GoldenStateSeed): SaveData {
  return {
    ...saveData,
    world: seed.world
      ? {
        mapId: seed.world.mapId,
        spawnPointId: seed.world.spawnPointId,
        playerX: seed.world.playerX,
        playerY: seed.world.playerY,
        facing: seed.world.facing,
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
    consumedTriggerIds: seed.consumedTriggerIds
      ? [...seed.consumedTriggerIds]
      : [...saveData.consumedTriggerIds],
  };
}

function createRuntimeHarness(database: ContentDatabase, seed: GoldenStateSeed) {
  const gameState = new GameStateRuntime(database);
  const seededSave = applyStateSeed(gameState.toSaveData("golden-runtime"), seed);
  gameState.loadSaveData(seededSave);
  const worldRuntime = new WorldRuntime(database, gameState.getWorldState());
  gameState.syncWorldState(worldRuntime.getState());

  return {
    gameState,
    worldRuntime,
    saveManager: new SaveManager(new MemoryStorage(), database),
  };
}

function createObservedState(gameState: GameStateRuntime): GoldenObservedState {
  const snapshot = gameState.getSnapshot();
  return {
    world: snapshot.world,
    flags: snapshot.flags,
    inventory: {
      gold: snapshot.inventory.gold,
      items: snapshot.inventory.items.map((entry) => ({ ...entry })),
    },
    partyMemberIds: [...snapshot.partyMemberIds],
    partyStates: Object.fromEntries(
      Object.entries(snapshot.partyStates).map(([memberId, state]) => [memberId, { ...state, statusIds: [...state.statusIds] }]),
    ),
    consumedTriggerIds: [...snapshot.consumedTriggerIds],
  };
}

function compareExpectedState(
  expected: GoldenExpectedState,
  actual: GoldenObservedState,
): string[] {
  const mismatches: string[] = [];

  if (expected.world) {
    const fields = Object.entries(expected.world);
    fields.forEach(([field, value]) => {
      if (actual.world[field as keyof typeof actual.world] !== value) {
        mismatches.push(
          `state.world.${field}: expected ${JSON.stringify(value)}, received ${JSON.stringify(actual.world[field as keyof typeof actual.world])}`,
        );
      }
    });
  }

  if (expected.flags) {
    Object.entries(expected.flags).forEach(([flagId, value]) => {
      if (actual.flags[flagId] !== value) {
        mismatches.push(
          `state.flags.${flagId}: expected ${JSON.stringify(value)}, received ${JSON.stringify(actual.flags[flagId])}`,
        );
      }
    });
  }

  if (expected.inventory) {
    if (JSON.stringify(actual.inventory) !== JSON.stringify(expected.inventory)) {
      mismatches.push(
        `state.inventory: expected ${JSON.stringify(expected.inventory)}, received ${JSON.stringify(actual.inventory)}`,
      );
    }
  }

  if (expected.partyMemberIds && JSON.stringify(actual.partyMemberIds) !== JSON.stringify(expected.partyMemberIds)) {
    mismatches.push(
      `state.partyMemberIds: expected ${JSON.stringify(expected.partyMemberIds)}, received ${JSON.stringify(actual.partyMemberIds)}`,
    );
  }

  if (expected.partyStates) {
    Object.entries(expected.partyStates).forEach(([memberId, expectedState]) => {
      const actualState = actual.partyStates[memberId];
      if (!actualState) {
        mismatches.push(`state.partyStates.${memberId}: missing member`);
        return;
      }

      Object.entries(expectedState).forEach(([field, value]) => {
        if (JSON.stringify(actualState[field as keyof PartyMemberState]) !== JSON.stringify(value)) {
          mismatches.push(
            `state.partyStates.${memberId}.${field}: expected ${JSON.stringify(value)}, received ${JSON.stringify(actualState[field as keyof PartyMemberState])}`,
          );
        }
      });
    });
  }

  if (
    expected.consumedTriggerIds
    && JSON.stringify(actual.consumedTriggerIds) !== JSON.stringify(expected.consumedTriggerIds)
  ) {
    mismatches.push(
      `state.consumedTriggerIds: expected ${JSON.stringify(expected.consumedTriggerIds)}, received ${JSON.stringify(actual.consumedTriggerIds)}`,
    );
  }

  return mismatches;
}

function compareExpectedUi(expected: GoldenRegressionCase["expectedUi"], actual: GoldenObservedUi): string[] {
  const mismatches: string[] = [];

  if (JSON.stringify(actual.sceneFlow) !== JSON.stringify(expected.sceneFlow)) {
    mismatches.push(
      `ui.sceneFlow: expected ${JSON.stringify(expected.sceneFlow)}, received ${JSON.stringify(actual.sceneFlow)}`,
    );
  }

  if (actual.activeScene !== expected.activeScene) {
    mismatches.push(`ui.activeScene: expected ${expected.activeScene}, received ${actual.activeScene}`);
  }

  if (JSON.stringify(actual.dialogueLineIds) !== JSON.stringify(expected.dialogueLineIds)) {
    mismatches.push(
      `ui.dialogueLineIds: expected ${JSON.stringify(expected.dialogueLineIds)}, received ${JSON.stringify(actual.dialogueLineIds)}`,
    );
  }

  if (expected.battleOutcome !== undefined && actual.battleOutcome !== expected.battleOutcome) {
    mismatches.push(`ui.battleOutcome: expected ${expected.battleOutcome}, received ${actual.battleOutcome}`);
  }

  return mismatches;
}

function resolveTrigger(database: ContentDatabase, gameState: GameStateRuntime, regressionCase: GoldenRegressionCase) {
  if (regressionCase.trigger.kind === "saveLoadRoundTrip") {
    return undefined;
  }

  const map = database.maps.find((entry) => entry.id === regressionCase.trigger.mapId);
  if (!map) {
    throw new Error(`missing map "${regressionCase.trigger.mapId}"`);
  }

  if (gameState.getWorldState().currentMapId !== map.id) {
    throw new Error(`case world state is on "${gameState.getWorldState().currentMapId}" but trigger expects map "${map.id}"`);
  }

  if (regressionCase.trigger.kind === "npcInteraction") {
    const trigger = findNpcInteractionTrigger(map, regressionCase.trigger.npcId);
    if (!trigger) {
      throw new Error(`missing npc interaction trigger for npc "${regressionCase.trigger.npcId}" on map "${map.id}"`);
    }

    return trigger;
  }

  const [trigger] = findTriggersAtPoint(map, {
    x: regressionCase.trigger.x,
    y: regressionCase.trigger.y,
  }).filter((entry) => entry.kind === regressionCase.trigger.kind);

  if (!trigger) {
    throw new Error(
      `missing ${regressionCase.trigger.kind} trigger at (${regressionCase.trigger.x}, ${regressionCase.trigger.y}) on map "${map.id}"`,
    );
  }

  return trigger;
}

function runBattle(database: ContentDatabase, gameState: GameStateRuntime, battleGroupId: string): "victory" | "defeat" {
  let battleState = createBattleState(database, gameState.getSnapshot(), {
    battleGroupId,
    originMapId: gameState.getWorldState().currentMapId,
  });

  while (!battleState.outcome) {
    battleState = runAttackTurn(battleState).state;
  }

  gameState.applyBattleResult(battleState.outcome);
  return battleState.outcome.outcome;
}

function executeWorldTriggerCase(database: ContentDatabase, regressionCase: GoldenRegressionCase): GoldenCaseResult {
  const harness = createRuntimeHarness(database, regressionCase.initialState);
  const observedUi: GoldenObservedUi = {
    sceneFlow: [WORLD_SCENE_ID],
    activeScene: WORLD_SCENE_ID,
    dialogueLineIds: [],
  };

  try {
    const trigger = resolveTrigger(database, harness.gameState, regressionCase);
    if (trigger) {
      if (trigger.once && harness.gameState.isTriggerConsumed(trigger.id)) {
        const observedState = createObservedState(harness.gameState);
        const mismatches = [
          ...compareExpectedState(regressionCase.expectedState, observedState),
          ...compareExpectedUi(regressionCase.expectedUi, observedUi),
        ];

        return {
          id: regressionCase.id,
          name: regressionCase.name,
          status: mismatches.length > 0 ? "mismatch" : "pass",
          mismatches,
          observedState,
          observedUi,
        };
      }

      const event = database.events.find((entry) => entry.id === trigger.eventId);
      if (!event) {
        throw new Error(`missing event "${trigger.eventId}"`);
      }

      const snapshot = harness.gameState.getSnapshot();
      const runtime = createEventRuntime(database, {
        flags: snapshot.flags,
        inventory: snapshot.inventory,
        partyMemberIds: snapshot.partyMemberIds,
        partyStates: snapshot.partyStates,
        world: {
          currentMapId: snapshot.world.currentMapId,
          currentSpawnPointId: snapshot.world.currentSpawnId,
        },
      });
      new EventInterpreter().execute(event, database, runtime);
      harness.gameState.applyEventRuntime(runtime);
      if (trigger.once) {
        harness.gameState.consumeTrigger(trigger.id);
      }

      observedUi.dialogueLineIds = runtime.dialogueLog.map((entry) => entry.id);

      if (runtime.pendingWarp) {
        harness.worldRuntime.setSpawn(runtime.pendingWarp.mapId, runtime.pendingWarp.spawnPointId);
        harness.gameState.syncWorldState(harness.worldRuntime.getState());
      }

      const battleGroupId = runtime.startedBattleGroupIds.at(-1);
      if (battleGroupId) {
        observedUi.sceneFlow.push(BATTLE_SCENE_ID);
        observedUi.activeScene = BATTLE_SCENE_ID;
        observedUi.battleOutcome = runBattle(database, harness.gameState, battleGroupId);
        observedUi.sceneFlow.push(WORLD_SCENE_ID);
        observedUi.activeScene = WORLD_SCENE_ID;
      }
    }

    harness.gameState.syncWorldState(harness.worldRuntime.getState());
    const observedState = createObservedState(harness.gameState);
    const mismatches = [
      ...compareExpectedState(regressionCase.expectedState, observedState),
      ...compareExpectedUi(regressionCase.expectedUi, observedUi),
    ];

    return {
      id: regressionCase.id,
      name: regressionCase.name,
      status: mismatches.length > 0 ? "mismatch" : "pass",
      mismatches,
      observedState,
      observedUi,
    };
  } catch (error) {
    return {
      id: regressionCase.id,
      name: regressionCase.name,
      status: "fail",
      mismatches: [],
      error: error instanceof Error ? error.message : String(error),
      observedUi,
      observedState: createObservedState(harness.gameState),
    };
  }
}

function executeSaveLoadCase(database: ContentDatabase, regressionCase: GoldenRegressionCase): GoldenCaseResult {
  const harness = createRuntimeHarness(database, regressionCase.initialState);
  const observedUi: GoldenObservedUi = {
    sceneFlow: [WORLD_SCENE_ID],
    activeScene: WORLD_SCENE_ID,
    dialogueLineIds: [],
  };

  try {
    if (regressionCase.trigger.kind !== "saveLoadRoundTrip") {
      throw new Error(`unsupported save case trigger "${regressionCase.trigger.kind}"`);
    }

    const saveData = harness.gameState.toSaveData(regressionCase.trigger.slot);
    harness.saveManager.save(saveData);

    const mutatedSave = applyStateSeed(
      harness.gameState.toSaveData(regressionCase.trigger.slot),
      regressionCase.trigger.postSaveMutation,
    );
    harness.gameState.loadSaveData(mutatedSave);
    harness.worldRuntime.setState(harness.gameState.getWorldState());

    const loaded = harness.saveManager.load(regressionCase.trigger.slot);
    if (!loaded) {
      throw new Error(`save slot "${regressionCase.trigger.slot}" returned null`);
    }

    harness.gameState.loadSaveData(loaded);
    harness.worldRuntime.setState(harness.gameState.getWorldState());
    harness.gameState.syncWorldState(harness.worldRuntime.getState());

    const observedState = createObservedState(harness.gameState);
    const mismatches = [
      ...compareExpectedState(regressionCase.expectedState, observedState),
      ...compareExpectedUi(regressionCase.expectedUi, observedUi),
    ];

    return {
      id: regressionCase.id,
      name: regressionCase.name,
      status: mismatches.length > 0 ? "mismatch" : "pass",
      mismatches,
      observedState,
      observedUi,
    };
  } catch (error) {
    return {
      id: regressionCase.id,
      name: regressionCase.name,
      status: "fail",
      mismatches: [],
      error: error instanceof Error ? error.message : String(error),
      observedUi,
      observedState: createObservedState(harness.gameState),
    };
  }
}

export async function runGoldenRegression(): Promise<GoldenRegressionReport> {
  const [suite, database] = await Promise.all([
    loadGoldenRegressionSuite(),
    createRegressionDatabase(),
  ]);
  const results = suite.cases.map((regressionCase) => (
    regressionCase.trigger.kind === "saveLoadRoundTrip"
      ? executeSaveLoadCase(database, regressionCase)
      : executeWorldTriggerCase(database, regressionCase)
  ));

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      pass: results.filter((entry) => entry.status === "pass").length,
      mismatch: results.filter((entry) => entry.status === "mismatch").length,
      fail: results.filter((entry) => entry.status === "fail").length,
      total: results.length,
    },
    cases: results,
  };
}

export function formatGoldenRegressionReport(report: GoldenRegressionReport): string {
  const lines = [
    "Golden Regression Report / 黄金回归报告",
    `Generated At / 生成时间: ${report.generatedAt}`,
    `Totals / 汇总: pass=${report.totals.pass} mismatch=${report.totals.mismatch} fail=${report.totals.fail} total=${report.totals.total}`,
    "",
  ];

  report.cases.forEach((entry) => {
    lines.push(`${entry.status.toUpperCase()} ${entry.id} :: ${entry.name}`);
    if (entry.error) {
      lines.push(`  error: ${entry.error}`);
    }

    entry.mismatches.forEach((mismatch) => {
      lines.push(`  mismatch: ${mismatch}`);
    });

    if (entry.observedUi) {
      lines.push(`  sceneFlow: ${JSON.stringify(entry.observedUi.sceneFlow)}`);
      lines.push(`  activeScene: ${entry.observedUi.activeScene}`);
      lines.push(`  dialogueLineIds: ${JSON.stringify(entry.observedUi.dialogueLineIds)}`);
      if (entry.observedUi.battleOutcome) {
        lines.push(`  battleOutcome: ${entry.observedUi.battleOutcome}`);
      }
    }

    lines.push("");
  });

  return lines.join("\n");
}
