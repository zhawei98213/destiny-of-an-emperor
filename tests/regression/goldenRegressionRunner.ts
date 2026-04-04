import { mkdir, readFile, writeFile } from "node:fs/promises";
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
  ShopStateMap,
} from "@/types/content";
import { resolveRegionEncounter } from "@/world/worldEncounterRuntime";
import { WorldRuntime } from "@/world/worldRuntime";
import {
  findEncounterTriggersAtPoint,
  findNpcInteractionTrigger,
  findTriggersAtPoint,
} from "@/world/worldTriggerResolver";
import { buildShopViewModel } from "@/ui/shopOverlay";
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
const REGRESSION_REPORT_DIR = resolve(process.cwd(), "reports/regression/latest");
const REGRESSION_CASES_DIR = resolve(REGRESSION_REPORT_DIR, "cases");

export interface GoldenCaseLocator {
  mapId?: string;
  triggerId?: string;
  triggerKind: GoldenRegressionCase["trigger"]["kind"];
  eventId?: string;
  encounterTableId?: string;
  npcId?: string;
  point?: {
    x: number;
    y: number;
  };
  battleGroupId?: string;
  slot?: string;
}

export interface GoldenObservedUi {
  sceneFlow: string[];
  activeScene: string;
  dialogueLineIds: string[];
  battleOutcome?: "victory" | "defeat";
  shopId?: string;
  shopItemLines?: string[];
}

export interface GoldenObservedState {
  world: ReturnType<GameStateRuntime["getWorldState"]>;
  flags: Record<string, boolean>;
  inventory: InventoryState;
  partyMemberIds: string[];
  partyStates: Record<string, PartyMemberState>;
  shopStates: ShopStateMap;
  consumedTriggerIds: string[];
}

export interface GoldenCaseDiffEntry {
  path: string;
  expected: unknown;
  actual: unknown;
}

export interface GoldenCaseArtifacts {
  expectedSnapshotPath?: string;
  actualSnapshotPath?: string;
  diffSnapshotPath?: string;
  screenshotPath?: string;
}

export interface GoldenCaseResult {
  id: string;
  name: string;
  status: RegressionStatus;
  mismatches: string[];
  locator: GoldenCaseLocator;
  expectedState: GoldenExpectedState;
  expectedUi: GoldenRegressionCase["expectedUi"];
  error?: string;
  observedUi?: GoldenObservedUi;
  observedState?: GoldenObservedState;
  diffs: GoldenCaseDiffEntry[];
  artifacts?: GoldenCaseArtifacts;
}

export interface GoldenRegressionReport {
  generatedAt: string;
  reportDirectory?: string;
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
    shopStates: Object.fromEntries(
      Object.entries(snapshot.shopStates).map(([shopId, state]) => [shopId, { ...state }]),
    ),
    consumedTriggerIds: [...snapshot.consumedTriggerIds],
  };
}

function createLocator(regressionCase: GoldenRegressionCase, extras: Partial<GoldenCaseLocator> = {}): GoldenCaseLocator {
  if (regressionCase.trigger.kind === "saveLoadRoundTrip") {
    return {
      triggerKind: regressionCase.trigger.kind,
      slot: regressionCase.trigger.slot,
      ...extras,
    };
  }

  return {
    triggerKind: regressionCase.trigger.kind,
    mapId: regressionCase.trigger.mapId,
    npcId: regressionCase.trigger.kind === "npcInteraction" ? regressionCase.trigger.npcId : undefined,
    point: regressionCase.trigger.kind === "npcInteraction"
      ? undefined
      : {
        x: regressionCase.trigger.x,
        y: regressionCase.trigger.y,
      },
    ...extras,
  };
}

function compareExpectedState(
  expected: GoldenExpectedState,
  actual: GoldenObservedState,
): GoldenCaseDiffEntry[] {
  const mismatches: GoldenCaseDiffEntry[] = [];

  if (expected.world) {
    const fields = Object.entries(expected.world);
    fields.forEach(([field, value]) => {
      if (actual.world[field as keyof typeof actual.world] !== value) {
        mismatches.push({
          path: `state.world.${field}`,
          expected: value,
          actual: actual.world[field as keyof typeof actual.world],
        });
      }
    });
  }

  if (expected.flags) {
    Object.entries(expected.flags).forEach(([flagId, value]) => {
      if (actual.flags[flagId] !== value) {
        mismatches.push({
          path: `state.flags.${flagId}`,
          expected: value,
          actual: actual.flags[flagId],
        });
      }
    });
  }

  if (expected.inventory) {
    if (JSON.stringify(actual.inventory) !== JSON.stringify(expected.inventory)) {
      mismatches.push({
        path: "state.inventory",
        expected: expected.inventory,
        actual: actual.inventory,
      });
    }
  }

  if (expected.partyMemberIds && JSON.stringify(actual.partyMemberIds) !== JSON.stringify(expected.partyMemberIds)) {
    mismatches.push({
      path: "state.partyMemberIds",
      expected: expected.partyMemberIds,
      actual: actual.partyMemberIds,
    });
  }

  if (expected.partyStates) {
    Object.entries(expected.partyStates).forEach(([memberId, expectedState]) => {
      const actualState = actual.partyStates[memberId];
      if (!actualState) {
        mismatches.push({
          path: `state.partyStates.${memberId}`,
          expected: expectedState,
          actual: undefined,
        });
        return;
      }

      Object.entries(expectedState).forEach(([field, value]) => {
        if (JSON.stringify(actualState[field as keyof PartyMemberState]) !== JSON.stringify(value)) {
          mismatches.push({
            path: `state.partyStates.${memberId}.${field}`,
            expected: value,
            actual: actualState[field as keyof PartyMemberState],
          });
        }
      });
    });
  }

  if (expected.shopStates) {
    Object.entries(expected.shopStates).forEach(([shopId, expectedState]) => {
      const actualState = actual.shopStates[shopId];
      if (!actualState) {
        mismatches.push({
          path: `state.shopStates.${shopId}`,
          expected: expectedState,
          actual: undefined,
        });
        return;
      }

      if (JSON.stringify(actualState) !== JSON.stringify(expectedState)) {
        mismatches.push({
          path: `state.shopStates.${shopId}`,
          expected: expectedState,
          actual: actualState,
        });
      }
    });
  }

  if (
    expected.consumedTriggerIds
    && JSON.stringify(actual.consumedTriggerIds) !== JSON.stringify(expected.consumedTriggerIds)
  ) {
    mismatches.push({
      path: "state.consumedTriggerIds",
      expected: expected.consumedTriggerIds,
      actual: actual.consumedTriggerIds,
    });
  }

  return mismatches;
}

function compareExpectedUi(expected: GoldenRegressionCase["expectedUi"], actual: GoldenObservedUi): GoldenCaseDiffEntry[] {
  const mismatches: GoldenCaseDiffEntry[] = [];

  if (JSON.stringify(actual.sceneFlow) !== JSON.stringify(expected.sceneFlow)) {
    mismatches.push({
      path: "ui.sceneFlow",
      expected: expected.sceneFlow,
      actual: actual.sceneFlow,
    });
  }

  if (actual.activeScene !== expected.activeScene) {
    mismatches.push({
      path: "ui.activeScene",
      expected: expected.activeScene,
      actual: actual.activeScene,
    });
  }

  if (JSON.stringify(actual.dialogueLineIds) !== JSON.stringify(expected.dialogueLineIds)) {
    mismatches.push({
      path: "ui.dialogueLineIds",
      expected: expected.dialogueLineIds,
      actual: actual.dialogueLineIds,
    });
  }

  if (expected.battleOutcome !== undefined && actual.battleOutcome !== expected.battleOutcome) {
    mismatches.push({
      path: "ui.battleOutcome",
      expected: expected.battleOutcome,
      actual: actual.battleOutcome,
    });
  }

  if (expected.shopId !== undefined && actual.shopId !== expected.shopId) {
    mismatches.push({
      path: "ui.shopId",
      expected: expected.shopId,
      actual: actual.shopId,
    });
  }

  if (
    expected.shopItemLines !== undefined
    && JSON.stringify(actual.shopItemLines ?? []) !== JSON.stringify(expected.shopItemLines)
  ) {
    mismatches.push({
      path: "ui.shopItemLines",
      expected: expected.shopItemLines,
      actual: actual.shopItemLines ?? [],
    });
  }

  return mismatches;
}

function resolveTrigger(database: ContentDatabase, gameState: GameStateRuntime, regressionCase: GoldenRegressionCase) {
  const triggerSpec = regressionCase.trigger;
  if (triggerSpec.kind === "saveLoadRoundTrip") {
    return undefined;
  }

  const map = database.maps.find((entry) => entry.id === triggerSpec.mapId);
  if (!map) {
    throw new Error(`missing map "${triggerSpec.mapId}"`);
  }

  if (gameState.getWorldState().currentMapId !== map.id) {
    throw new Error(`case world state is on "${gameState.getWorldState().currentMapId}" but trigger expects map "${map.id}"`);
  }

  if (triggerSpec.kind === "npcInteraction") {
    const trigger = findNpcInteractionTrigger(map, triggerSpec.npcId);
    if (!trigger) {
      throw new Error(`missing npc interaction trigger for npc "${triggerSpec.npcId}" on map "${map.id}"`);
    }

    return trigger;
  }

  const [trigger] = findTriggersAtPoint(map, {
    x: triggerSpec.x,
    y: triggerSpec.y,
  }).filter((entry) => entry.kind === triggerSpec.kind);

  if (!trigger && triggerSpec.kind === "region") {
    const [encounterTrigger] = findEncounterTriggersAtPoint(map, {
      x: triggerSpec.x,
      y: triggerSpec.y,
    });
    if (encounterTrigger) {
      return encounterTrigger;
    }
  }

  if (!trigger) {
    throw new Error(
      `missing ${triggerSpec.kind} trigger at (${triggerSpec.x}, ${triggerSpec.y}) on map "${map.id}"`,
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
        const diffs = [
          ...compareExpectedState(regressionCase.expectedState, observedState),
          ...compareExpectedUi(regressionCase.expectedUi, observedUi),
        ];

        return {
          id: regressionCase.id,
          name: regressionCase.name,
          status: diffs.length > 0 ? "mismatch" : "pass",
          mismatches: diffs.map((entry) => `${entry.path}: expected ${JSON.stringify(entry.expected)}, received ${JSON.stringify(entry.actual)}`),
          locator: createLocator(regressionCase, { triggerId: trigger.id }),
          expectedState: regressionCase.expectedState,
          expectedUi: regressionCase.expectedUi,
          observedState,
          observedUi,
          diffs,
        };
      }

      const snapshot = harness.gameState.getSnapshot();
      let eventId: string | undefined;
      let battleGroupId: string | undefined;
      let openedShopId: string | undefined;

      if (trigger.eventId) {
        const event = database.events.find((entry) => entry.id === trigger.eventId);
        if (!event) {
          throw new Error(`missing event "${trigger.eventId}"`);
        }

        const runtime = createEventRuntime(database, {
          flags: snapshot.flags,
          inventory: snapshot.inventory,
          partyMemberIds: snapshot.partyMemberIds,
          partyStates: snapshot.partyStates,
          world: {
            currentMapId: snapshot.world.currentMapId,
            currentSpawnPointId: snapshot.world.currentSpawnId,
            playerX: snapshot.world.playerX,
            playerY: snapshot.world.playerY,
            facing: snapshot.world.facing,
            stepCount: snapshot.world.stepCount,
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

        battleGroupId = runtime.startedBattleGroupIds.at(-1);
        openedShopId = runtime.openedShopIds.at(-1);
        eventId = event.id;
      } else if (trigger.encounterTableId) {
        const encounter = resolveRegionEncounter(
          database,
          trigger,
          harness.worldRuntime.getState(),
          snapshot,
        );
        battleGroupId = encounter?.battleGroupId;
      }

      if (battleGroupId) {
        observedUi.sceneFlow.push(BATTLE_SCENE_ID);
        observedUi.activeScene = BATTLE_SCENE_ID;
        observedUi.battleOutcome = runBattle(database, harness.gameState, battleGroupId);
        observedUi.sceneFlow.push(WORLD_SCENE_ID);
        observedUi.activeScene = WORLD_SCENE_ID;
      }

      if (openedShopId) {
        const shopView = buildShopViewModel(database, harness.gameState.getSnapshot(), openedShopId);
        observedUi.shopId = shopView.shopId;
        observedUi.shopItemLines = [...shopView.itemLines];
      }

      const observedState = createObservedState(harness.gameState);
      const diffs = [
        ...compareExpectedState(regressionCase.expectedState, observedState),
        ...compareExpectedUi(regressionCase.expectedUi, observedUi),
      ];

      return {
        id: regressionCase.id,
        name: regressionCase.name,
        status: diffs.length > 0 ? "mismatch" : "pass",
        mismatches: diffs.map((entry) => `${entry.path}: expected ${JSON.stringify(entry.expected)}, received ${JSON.stringify(entry.actual)}`),
        locator: createLocator(regressionCase, {
          triggerId: trigger.id,
          eventId,
          battleGroupId,
          encounterTableId: trigger.encounterTableId,
        }),
        expectedState: regressionCase.expectedState,
        expectedUi: regressionCase.expectedUi,
        observedState,
        observedUi,
        diffs,
      };
    }

    harness.gameState.syncWorldState(harness.worldRuntime.getState());
    const observedState = createObservedState(harness.gameState);
    const diffs = [
      ...compareExpectedState(regressionCase.expectedState, observedState),
      ...compareExpectedUi(regressionCase.expectedUi, observedUi),
    ];

    return {
      id: regressionCase.id,
      name: regressionCase.name,
      status: diffs.length > 0 ? "mismatch" : "pass",
      mismatches: diffs.map((entry) => `${entry.path}: expected ${JSON.stringify(entry.expected)}, received ${JSON.stringify(entry.actual)}`),
      locator: createLocator(regressionCase),
      expectedState: regressionCase.expectedState,
      expectedUi: regressionCase.expectedUi,
      observedState,
      observedUi,
      diffs,
    };
  } catch (error) {
    return {
      id: regressionCase.id,
      name: regressionCase.name,
      status: "fail",
      mismatches: [],
      locator: createLocator(regressionCase),
      expectedState: regressionCase.expectedState,
      expectedUi: regressionCase.expectedUi,
      error: error instanceof Error ? error.message : String(error),
      observedUi,
      observedState: createObservedState(harness.gameState),
      diffs: [],
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
    const diffs = [
      ...compareExpectedState(regressionCase.expectedState, observedState),
      ...compareExpectedUi(regressionCase.expectedUi, observedUi),
    ];

    return {
      id: regressionCase.id,
      name: regressionCase.name,
      status: diffs.length > 0 ? "mismatch" : "pass",
      mismatches: diffs.map((entry) => `${entry.path}: expected ${JSON.stringify(entry.expected)}, received ${JSON.stringify(entry.actual)}`),
      locator: createLocator(regressionCase),
      expectedState: regressionCase.expectedState,
      expectedUi: regressionCase.expectedUi,
      observedState,
      observedUi,
      diffs,
    };
  } catch (error) {
    return {
      id: regressionCase.id,
      name: regressionCase.name,
      status: "fail",
      mismatches: [],
      locator: createLocator(regressionCase),
      expectedState: regressionCase.expectedState,
      expectedUi: regressionCase.expectedUi,
      error: error instanceof Error ? error.message : String(error),
      observedUi,
      observedState: createObservedState(harness.gameState),
      diffs: [],
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
    reportDirectory: REGRESSION_REPORT_DIR,
    totals: {
      pass: results.filter((entry) => entry.status === "pass").length,
      mismatch: results.filter((entry) => entry.status === "mismatch").length,
      fail: results.filter((entry) => entry.status === "fail").length,
      total: results.length,
    },
    cases: results,
  };
}

function stringifySnapshot(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function formatLocator(locator: GoldenCaseLocator): string {
  const parts = [
    `triggerKind=${locator.triggerKind}`,
    locator.mapId ? `mapId=${locator.mapId}` : undefined,
    locator.triggerId ? `triggerId=${locator.triggerId}` : undefined,
    locator.eventId ? `eventId=${locator.eventId}` : undefined,
    locator.npcId ? `npcId=${locator.npcId}` : undefined,
    locator.point ? `point=(${locator.point.x},${locator.point.y})` : undefined,
    locator.battleGroupId ? `battleGroupId=${locator.battleGroupId}` : undefined,
    locator.encounterTableId ? `encounterTableId=${locator.encounterTableId}` : undefined,
    locator.slot ? `slot=${locator.slot}` : undefined,
  ].filter(Boolean);

  return parts.join(" | ");
}

function buildCaseExpectedSnapshot(entry: GoldenCaseResult): Record<string, unknown> {
  return {
    locator: entry.locator,
    expectedState: entry.expectedState,
    expectedUi: entry.expectedUi,
  };
}

function buildCaseActualSnapshot(entry: GoldenCaseResult): Record<string, unknown> {
  return {
    locator: entry.locator,
    observedState: entry.observedState,
    observedUi: entry.observedUi,
    error: entry.error,
  };
}

function buildCaseDiffSnapshot(entry: GoldenCaseResult): Record<string, unknown> {
  return {
    locator: entry.locator,
    status: entry.status,
    diffs: entry.diffs,
    mismatches: entry.mismatches,
    error: entry.error,
  };
}

export async function writeGoldenRegressionArtifacts(report: GoldenRegressionReport): Promise<GoldenRegressionReport> {
  await mkdir(REGRESSION_CASES_DIR, { recursive: true });

  const cases = await Promise.all(report.cases.map(async (entry) => {
    const expectedSnapshotPath = resolve(REGRESSION_CASES_DIR, `${entry.id}.expected.snapshot.json`);
    const actualSnapshotPath = resolve(REGRESSION_CASES_DIR, `${entry.id}.actual.snapshot.json`);
    const diffSnapshotPath = resolve(REGRESSION_CASES_DIR, `${entry.id}.diff.snapshot.json`);

    await writeFile(expectedSnapshotPath, stringifySnapshot(buildCaseExpectedSnapshot(entry)), "utf8");
    await writeFile(actualSnapshotPath, stringifySnapshot(buildCaseActualSnapshot(entry)), "utf8");
    await writeFile(diffSnapshotPath, stringifySnapshot(buildCaseDiffSnapshot(entry)), "utf8");

    return {
      ...entry,
      artifacts: {
        expectedSnapshotPath,
        actualSnapshotPath,
        diffSnapshotPath,
        screenshotPath: undefined,
      },
    };
  }));

  const nextReport = {
    ...report,
    cases,
  };
  await writeFile(resolve(REGRESSION_REPORT_DIR, "report.json"), stringifySnapshot(nextReport), "utf8");
  await writeFile(resolve(REGRESSION_REPORT_DIR, "summary.md"), formatGoldenRegressionMarkdown(nextReport), "utf8");

  return nextReport;
}

export function formatGoldenRegressionReport(report: GoldenRegressionReport): string {
  const lines = [
    "Golden Regression Report / 黄金回归报告",
    `Generated At / 生成时间: ${report.generatedAt}`,
    `Totals / 汇总: pass=${report.totals.pass} mismatch=${report.totals.mismatch} fail=${report.totals.fail} total=${report.totals.total}`,
    report.reportDirectory ? `Artifacts / 产物目录: ${report.reportDirectory}` : undefined,
    "",
  ].filter((entry): entry is string => Boolean(entry));

  report.cases.forEach((entry) => {
    lines.push(`${entry.status.toUpperCase()} ${entry.id} :: ${entry.name}`);
    lines.push(`  locator: ${formatLocator(entry.locator)}`);
    if (entry.error) {
      lines.push(`  error: ${entry.error}`);
    }

    entry.diffs.forEach((diff) => {
      lines.push(`  diff: ${diff.path}`);
      lines.push(`    expected: ${JSON.stringify(diff.expected)}`);
      lines.push(`    actual: ${JSON.stringify(diff.actual)}`);
    });

    if (entry.observedUi) {
      lines.push(`  sceneFlow: ${JSON.stringify(entry.observedUi.sceneFlow)}`);
      lines.push(`  activeScene: ${entry.observedUi.activeScene}`);
      lines.push(`  dialogueLineIds: ${JSON.stringify(entry.observedUi.dialogueLineIds)}`);
      if (entry.observedUi.battleOutcome) {
        lines.push(`  battleOutcome: ${entry.observedUi.battleOutcome}`);
      }
    }

    if (entry.artifacts) {
      lines.push(`  expectedSnapshot: ${entry.artifacts.expectedSnapshotPath}`);
      lines.push(`  actualSnapshot: ${entry.artifacts.actualSnapshotPath}`);
      lines.push(`  diffSnapshot: ${entry.artifacts.diffSnapshotPath}`);
    }

    lines.push("");
  });

  return lines.join("\n");
}

export function formatGoldenRegressionMarkdown(report: GoldenRegressionReport): string {
  const lines = [
    "# Golden Regression Report",
    "# 黄金回归报告",
    "",
    `- Generated At / 生成时间: ${report.generatedAt}`,
    `- Totals / 汇总: pass=${report.totals.pass} mismatch=${report.totals.mismatch} fail=${report.totals.fail} total=${report.totals.total}`,
    report.reportDirectory ? `- Artifacts / 产物目录: \`${report.reportDirectory}\`` : undefined,
    "",
  ].filter((entry): entry is string => Boolean(entry));

  report.cases.forEach((entry) => {
    lines.push(`## ${entry.id}`);
    lines.push("");
    lines.push(`- Name / 名称: ${entry.name}`);
    lines.push(`- Status / 状态: ${entry.status}`);
    lines.push(`- Locator / 定位: ${formatLocator(entry.locator)}`);
    lines.push("");
    lines.push("### Expected");
    lines.push("### 预期");
    lines.push("");
    lines.push("```json");
    lines.push(JSON.stringify(buildCaseExpectedSnapshot(entry), null, 2));
    lines.push("```");
    lines.push("");
    lines.push("### Actual");
    lines.push("### 实际");
    lines.push("");
    lines.push("```json");
    lines.push(JSON.stringify(buildCaseActualSnapshot(entry), null, 2));
    lines.push("```");
    lines.push("");
    lines.push("### Diff");
    lines.push("### 差异");
    lines.push("");

    if (entry.diffs.length === 0 && !entry.error) {
      lines.push("- No mismatch.");
      lines.push("- 无差异。");
    } else {
      entry.diffs.forEach((diff) => {
        lines.push(`- \`${diff.path}\``);
        lines.push(`  expected: \`${JSON.stringify(diff.expected)}\``);
        lines.push(`  actual: \`${JSON.stringify(diff.actual)}\``);
      });

      if (entry.error) {
        lines.push(`- error: \`${entry.error}\``);
      }
    }

    lines.push("");
    lines.push("### Snapshots");
    lines.push("### 快照");
    lines.push("");
    lines.push(`- expected text snapshot: \`${entry.artifacts?.expectedSnapshotPath ?? "pending"}\``);
    lines.push(`- expected 文本快照：\`${entry.artifacts?.expectedSnapshotPath ?? "pending"}\``);
    lines.push(`- actual text snapshot: \`${entry.artifacts?.actualSnapshotPath ?? "pending"}\``);
    lines.push(`- actual 文本快照：\`${entry.artifacts?.actualSnapshotPath ?? "pending"}\``);
    lines.push(`- diff text snapshot: \`${entry.artifacts?.diffSnapshotPath ?? "pending"}\``);
    lines.push(`- diff 文本快照：\`${entry.artifacts?.diffSnapshotPath ?? "pending"}\``);
    lines.push(`- screenshot placeholder: \`${entry.artifacts?.screenshotPath ?? "not-generated"}\``);
    lines.push(`- 截图占位：\`${entry.artifacts?.screenshotPath ?? "未生成"}\``);
    lines.push("");
  });

  return lines.join("\n");
}
