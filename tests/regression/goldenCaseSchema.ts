import type {
  Facing,
  InventoryState,
  PartyMemberState,
  ShopStateMap,
} from "@/types/content";

export type RegressionSceneId = "WorldScene" | "BattleScene";
export type GoldenTriggerKind = "npcInteraction" | "tile" | "region" | "saveLoadRoundTrip";

export interface GoldenWorldStateSeed {
  mapId: string;
  spawnPointId: string;
  playerX: number;
  playerY: number;
  facing: Facing;
  stepCount?: number;
}

export interface GoldenStateSeed {
  world?: GoldenWorldStateSeed;
  flags?: Record<string, boolean>;
  inventory?: InventoryState;
  partyMemberIds?: string[];
  partyStates?: Record<string, PartyMemberState>;
  shopStates?: ShopStateMap;
  consumedTriggerIds?: string[];
}

export interface GoldenNpcTrigger {
  kind: "npcInteraction";
  mapId: string;
  npcId: string;
}

export interface GoldenPointTrigger {
  kind: "tile" | "region";
  mapId: string;
  x: number;
  y: number;
}

export interface GoldenSaveLoadTrigger {
  kind: "saveLoadRoundTrip";
  slot: string;
  postSaveMutation: GoldenStateSeed;
}

export type GoldenTrigger =
  | GoldenNpcTrigger
  | GoldenPointTrigger
  | GoldenSaveLoadTrigger;

export interface GoldenExpectedState {
  world?: {
    currentMapId: string;
    currentSpawnId: string;
    playerX: number;
    playerY: number;
    facing: Facing;
  };
  flags?: Record<string, boolean>;
  inventory?: InventoryState;
  partyMemberIds?: string[];
  partyStates?: Record<string, PartyMemberState>;
  shopStates?: ShopStateMap;
  consumedTriggerIds?: string[];
}

export interface GoldenExpectedUi {
  sceneFlow: RegressionSceneId[];
  activeScene: RegressionSceneId;
  dialogueLineIds: string[];
  battleOutcome?: "victory" | "defeat";
  shopId?: string;
  shopItemLines?: string[];
}

export interface GoldenRegressionCase {
  id: string;
  name: string;
  initialState: GoldenStateSeed;
  trigger: GoldenTrigger;
  expectedState: GoldenExpectedState;
  expectedUi: GoldenExpectedUi;
}

export interface GoldenRegressionSuite {
  version: number;
  cases: GoldenRegressionCase[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function expectRecord(value: unknown, path: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error(`[golden-regression] ${path}: expected object`);
  }

  return value;
}

function expectString(value: unknown, path: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`[golden-regression] ${path}: expected non-empty string`);
  }

  return value;
}

function expectNumber(value: unknown, path: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`[golden-regression] ${path}: expected finite number`);
  }

  return value;
}

function expectBoolean(value: unknown, path: string): boolean {
  if (typeof value !== "boolean") {
    throw new Error(`[golden-regression] ${path}: expected boolean`);
  }

  return value;
}

function expectStringArray(value: unknown, path: string): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`[golden-regression] ${path}: expected string array`);
  }

  return value.map((entry, index) => expectString(entry, `${path}[${index}]`));
}

function expectFacing(value: unknown, path: string): Facing {
  if (value !== "up" && value !== "down" && value !== "left" && value !== "right") {
    throw new Error(`[golden-regression] ${path}: expected facing up/down/left/right`);
  }

  return value;
}

function validateInventoryState(value: unknown, path: string): InventoryState {
  const record = expectRecord(value, path);
  const itemsValue = record.items;
  if (!Array.isArray(itemsValue)) {
    throw new Error(`[golden-regression] ${path}.items: expected array`);
  }

  return {
    gold: expectNumber(record.gold, `${path}.gold`),
    items: itemsValue.map((entry, index) => {
      const item = expectRecord(entry, `${path}.items[${index}]`);
      return {
        itemId: expectString(item.itemId, `${path}.items[${index}].itemId`),
        quantity: expectNumber(item.quantity, `${path}.items[${index}].quantity`),
      };
    }),
  };
}

function validatePartyStateMap(value: unknown, path: string): Record<string, PartyMemberState> {
  const record = expectRecord(value, path);
  return Object.fromEntries(
    Object.entries(record).map(([memberId, memberState]) => {
      const entry = expectRecord(memberState, `${path}.${memberId}`);
      const statusIds = entry.statusIds;
      if (!Array.isArray(statusIds)) {
        throw new Error(`[golden-regression] ${path}.${memberId}.statusIds: expected array`);
      }

      return [memberId, {
        memberId: expectString(entry.memberId, `${path}.${memberId}.memberId`),
        level: expectNumber(entry.level, `${path}.${memberId}.level`),
        experience: expectNumber(entry.experience, `${path}.${memberId}.experience`),
        currentHp: expectNumber(entry.currentHp, `${path}.${memberId}.currentHp`),
        currentMp: expectNumber(entry.currentMp, `${path}.${memberId}.currentMp`),
        statusIds: statusIds.map((statusId, index) => expectString(statusId, `${path}.${memberId}.statusIds[${index}]`)),
        formationSlot: expectNumber(entry.formationSlot, `${path}.${memberId}.formationSlot`),
      }];
    }),
  );
}

function validateStateSeed(value: unknown, path: string): GoldenStateSeed {
  const record = expectRecord(value, path);
  const worldValue = record.world;
  const flagsValue = record.flags;
  const inventoryValue = record.inventory;
  const partyMemberIdsValue = record.partyMemberIds;
  const partyStatesValue = record.partyStates;
  const shopStatesValue = record.shopStates;
  const consumedTriggerIdsValue = record.consumedTriggerIds;

  return {
    world: worldValue
      ? (() => {
        const world = expectRecord(worldValue, `${path}.world`);
        return {
          mapId: expectString(world.mapId, `${path}.world.mapId`),
          spawnPointId: expectString(world.spawnPointId, `${path}.world.spawnPointId`),
          playerX: expectNumber(world.playerX, `${path}.world.playerX`),
          playerY: expectNumber(world.playerY, `${path}.world.playerY`),
          facing: expectFacing(world.facing, `${path}.world.facing`),
          stepCount: world.stepCount === undefined ? undefined : expectNumber(world.stepCount, `${path}.world.stepCount`),
        };
      })()
      : undefined,
    flags: flagsValue
      ? Object.fromEntries(
        Object.entries(expectRecord(flagsValue, `${path}.flags`)).map(([flagId, flagValue]) => [flagId, expectBoolean(flagValue, `${path}.flags.${flagId}`)]),
      )
      : undefined,
    inventory: inventoryValue ? validateInventoryState(inventoryValue, `${path}.inventory`) : undefined,
    partyMemberIds: partyMemberIdsValue ? expectStringArray(partyMemberIdsValue, `${path}.partyMemberIds`) : undefined,
    partyStates: partyStatesValue ? validatePartyStateMap(partyStatesValue, `${path}.partyStates`) : undefined,
    shopStates: shopStatesValue
      ? Object.fromEntries(
        Object.entries(expectRecord(shopStatesValue, `${path}.shopStates`)).map(([shopId, shopValue]) => {
          const shopState = expectRecord(shopValue, `${path}.shopStates.${shopId}`);
          return [shopId, {
            visited: expectBoolean(shopState.visited, `${path}.shopStates.${shopId}.visited`),
          }];
        }),
      )
      : undefined,
    consumedTriggerIds: consumedTriggerIdsValue ? expectStringArray(consumedTriggerIdsValue, `${path}.consumedTriggerIds`) : undefined,
  };
}

function validateTrigger(value: unknown, path: string): GoldenTrigger {
  const record = expectRecord(value, path);
  const kind = expectString(record.kind, `${path}.kind`);

  if (kind === "npcInteraction") {
    return {
      kind,
      mapId: expectString(record.mapId, `${path}.mapId`),
      npcId: expectString(record.npcId, `${path}.npcId`),
    };
  }

  if (kind === "tile" || kind === "region") {
    return {
      kind,
      mapId: expectString(record.mapId, `${path}.mapId`),
      x: expectNumber(record.x, `${path}.x`),
      y: expectNumber(record.y, `${path}.y`),
    };
  }

  if (kind === "saveLoadRoundTrip") {
    return {
      kind,
      slot: expectString(record.slot, `${path}.slot`),
      postSaveMutation: validateStateSeed(record.postSaveMutation, `${path}.postSaveMutation`),
    };
  }

  throw new Error(`[golden-regression] ${path}.kind: unsupported trigger kind "${kind}"`);
}

function validateExpectedState(value: unknown, path: string): GoldenExpectedState {
  const record = expectRecord(value, path);
  const worldValue = record.world;
  return {
    world: worldValue
      ? (() => {
        const world = expectRecord(worldValue, `${path}.world`);
        return {
          currentMapId: expectString(world.currentMapId, `${path}.world.currentMapId`),
          currentSpawnId: expectString(world.currentSpawnId, `${path}.world.currentSpawnId`),
          playerX: expectNumber(world.playerX, `${path}.world.playerX`),
          playerY: expectNumber(world.playerY, `${path}.world.playerY`),
          facing: expectFacing(world.facing, `${path}.world.facing`),
        };
      })()
      : undefined,
    flags: record.flags
      ? Object.fromEntries(
        Object.entries(expectRecord(record.flags, `${path}.flags`)).map(([flagId, flagValue]) => [flagId, expectBoolean(flagValue, `${path}.flags.${flagId}`)]),
      )
      : undefined,
    inventory: record.inventory ? validateInventoryState(record.inventory, `${path}.inventory`) : undefined,
    partyMemberIds: record.partyMemberIds ? expectStringArray(record.partyMemberIds, `${path}.partyMemberIds`) : undefined,
    partyStates: record.partyStates ? validatePartyStateMap(record.partyStates, `${path}.partyStates`) : undefined,
    shopStates: record.shopStates
      ? Object.fromEntries(
        Object.entries(expectRecord(record.shopStates, `${path}.shopStates`)).map(([shopId, shopValue]) => {
          const shopState = expectRecord(shopValue, `${path}.shopStates.${shopId}`);
          return [shopId, {
            visited: expectBoolean(shopState.visited, `${path}.shopStates.${shopId}.visited`),
          }];
        }),
      )
      : undefined,
    consumedTriggerIds: record.consumedTriggerIds ? expectStringArray(record.consumedTriggerIds, `${path}.consumedTriggerIds`) : undefined,
  };
}

function validateExpectedUi(value: unknown, path: string): GoldenExpectedUi {
  const record = expectRecord(value, path);
  const sceneFlow = expectStringArray(record.sceneFlow, `${path}.sceneFlow`).map((sceneId) => {
    if (sceneId !== "WorldScene" && sceneId !== "BattleScene") {
      throw new Error(`[golden-regression] ${path}.sceneFlow: unsupported scene "${sceneId}"`);
    }

    return sceneId;
  });
  const activeScene = expectString(record.activeScene, `${path}.activeScene`);
  if (activeScene !== "WorldScene" && activeScene !== "BattleScene") {
    throw new Error(`[golden-regression] ${path}.activeScene: unsupported scene "${activeScene}"`);
  }

  const battleOutcome = record.battleOutcome;
  if (
    battleOutcome !== undefined
    && battleOutcome !== "victory"
    && battleOutcome !== "defeat"
  ) {
    throw new Error(`[golden-regression] ${path}.battleOutcome: expected victory/defeat`);
  }

  return {
    sceneFlow,
    activeScene,
    dialogueLineIds: expectStringArray(record.dialogueLineIds, `${path}.dialogueLineIds`),
    battleOutcome,
    shopId: record.shopId === undefined ? undefined : expectString(record.shopId, `${path}.shopId`),
    shopItemLines: record.shopItemLines === undefined ? undefined : expectStringArray(record.shopItemLines, `${path}.shopItemLines`),
  };
}

export function validateGoldenRegressionSuite(value: unknown): GoldenRegressionSuite {
  const record = expectRecord(value, "root");
  const casesValue = record.cases;
  if (!Array.isArray(casesValue)) {
    throw new Error("[golden-regression] root.cases: expected array");
  }

  const suite: GoldenRegressionSuite = {
    version: expectNumber(record.version, "root.version"),
    cases: casesValue.map((caseValue, index) => {
      const regressionCase = expectRecord(caseValue, `root.cases[${index}]`);
      return {
        id: expectString(regressionCase.id, `root.cases[${index}].id`),
        name: expectString(regressionCase.name, `root.cases[${index}].name`),
        initialState: validateStateSeed(regressionCase.initialState, `root.cases[${index}].initialState`),
        trigger: validateTrigger(regressionCase.trigger, `root.cases[${index}].trigger`),
        expectedState: validateExpectedState(regressionCase.expectedState, `root.cases[${index}].expectedState`),
        expectedUi: validateExpectedUi(regressionCase.expectedUi, `root.cases[${index}].expectedUi`),
      };
    }),
  };

  const uniqueIds = new Set<string>();
  suite.cases.forEach((entry, index) => {
    if (uniqueIds.has(entry.id)) {
      throw new Error(`[golden-regression] root.cases[${index}].id: duplicate id "${entry.id}"`);
    }

    uniqueIds.add(entry.id);
  });

  return suite;
}
