import type {
  ContentDatabase,
  DialogueCue,
  EventDefinition,
  EventStep,
  FlagStateMap,
  InventoryState,
} from "@/types/content";

export interface EventWorldState {
  currentMapId: string;
  currentSpawnPointId: string;
}

export interface WarpTarget {
  mapId: string;
  spawnPointId: string;
}

export interface EventRuntime {
  state: {
    flags: FlagStateMap;
    inventory: InventoryState;
    partyMemberIds: string[];
    world: EventWorldState;
  };
  dialogueLog: DialogueCue[];
  openedShopIds: string[];
  playedSfxIds: string[];
  startedBattleGroupIds: string[];
  pendingWarp?: WarpTarget;
  ended: boolean;
}

export interface CreateEventRuntimeOptions {
  flags?: FlagStateMap;
  inventory?: InventoryState;
  partyMemberIds?: string[];
  world?: Partial<EventWorldState>;
}

export function createEventRuntime(
  database?: ContentDatabase,
  options: CreateEventRuntimeOptions = {},
): EventRuntime {
  const defaultMapId = options.world?.currentMapId ?? database?.maps[0]?.id ?? "";
  const defaultSpawnPointId = options.world?.currentSpawnPointId
    ?? database?.maps[0]?.spawnPoints[0]?.id
    ?? "";
  const defaultFlags = database
    ? Object.fromEntries(database.flags.map((flag) => [flag.id, flag.defaultValue]))
    : {};
  const defaultPartyMemberIds = database?.partyMembers[0] ? [database.partyMembers[0].id] : [];

  return {
    state: {
      flags: {
        ...defaultFlags,
        ...(options.flags ?? {}),
      },
      inventory: options.inventory ?? {
        gold: 0,
        items: [],
      },
      partyMemberIds: options.partyMemberIds ?? defaultPartyMemberIds,
      world: {
        currentMapId: defaultMapId,
        currentSpawnPointId: defaultSpawnPointId,
      },
    },
    dialogueLog: [],
    openedShopIds: [],
    playedSfxIds: [],
    startedBattleGroupIds: [],
    ended: false,
  };
}

export function createDialogueCue(
  database: ContentDatabase,
  event: EventDefinition,
  lineId: string,
): DialogueCue {
  const line = database.dialogueLines.find((entry) => entry.id === lineId);
  if (!line) {
    throw new Error(
      `[event] ${event.id}: missing dialogue line "${lineId}" during execution`,
    );
  }

  return {
    id: line.id,
    speakerName: line.speakerName,
    speakerNpcId: line.speakerNpcId,
    text: line.text,
    portraitId: line.portraitId,
    soundId: line.soundId,
    choices: undefined,
  };
}

function adjustInventoryItem(
  inventory: InventoryState,
  itemId: string,
  quantityDelta: number,
): InventoryState {
  const existingEntry = inventory.items.find((entry) => entry.itemId === itemId);
  if (!existingEntry && quantityDelta <= 0) {
    return inventory;
  }

  const nextItems = inventory.items
    .map((entry) => (
      entry.itemId === itemId
        ? { ...entry, quantity: Math.max(0, entry.quantity + quantityDelta) }
        : entry
    ))
    .filter((entry) => entry.quantity > 0);

  if (!existingEntry && quantityDelta > 0) {
    nextItems.push({
      itemId,
      quantity: quantityDelta,
    });
  }

  return {
    ...inventory,
    items: nextItems,
  };
}

export class EventInterpreter {
  private executeSteps(
    steps: EventStep[],
    event: EventDefinition,
    database: ContentDatabase,
    runtime: EventRuntime,
  ): void {
    for (const command of steps) {
      if (runtime.ended) {
        break;
      }

      this.executeStep(command, event, database, runtime);
    }
  }

  private executeStep(
    command: EventStep,
    event: EventDefinition,
    database: ContentDatabase,
    runtime: EventRuntime,
  ): void {
    switch (command.type) {
      case "dialogue":
        runtime.dialogueLog.push(createDialogueCue(database, event, command.lineId));
        break;
      case "setFlag":
        runtime.state.flags[command.flagId] = command.value ?? true;
        break;
      case "clearFlag":
        runtime.state.flags[command.flagId] = false;
        break;
      case "ifFlag":
        if (runtime.state.flags[command.flagId]) {
          this.executeSteps(command.steps, event, database, runtime);
        }
        break;
      case "ifNotFlag":
        if (!runtime.state.flags[command.flagId]) {
          this.executeSteps(command.steps, event, database, runtime);
        }
        break;
      case "warp":
        runtime.state.world.currentMapId = command.targetMapId;
        runtime.state.world.currentSpawnPointId = command.targetSpawnId;
        runtime.pendingWarp = {
          mapId: command.targetMapId,
          spawnPointId: command.targetSpawnId,
        };
        break;
      case "giveItem":
        runtime.state.inventory = adjustInventoryItem(
          runtime.state.inventory,
          command.itemId,
          command.quantity,
        );
        break;
      case "removeItem":
        runtime.state.inventory = adjustInventoryItem(
          runtime.state.inventory,
          command.itemId,
          -command.quantity,
        );
        break;
      case "joinParty":
        if (!runtime.state.partyMemberIds.includes(command.partyMemberId)) {
          runtime.state.partyMemberIds.push(command.partyMemberId);
        }
        break;
      case "openShop":
        runtime.openedShopIds.push(command.shopId);
        break;
      case "startBattle":
        runtime.startedBattleGroupIds.push(command.battleGroupId);
        break;
      case "playSfx":
        runtime.playedSfxIds.push(command.sfxId);
        break;
      case "end":
        runtime.ended = true;
        break;
    }
  }

  execute(event: EventDefinition, database: ContentDatabase, runtime: EventRuntime): EventRuntime {
    this.executeSteps(event.steps, event, database, runtime);
    return runtime;
  }
}
