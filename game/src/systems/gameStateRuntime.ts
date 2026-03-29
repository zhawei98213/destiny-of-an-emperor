import { SAVE_DATA_VERSION } from "@/systems/saveManager";
import type { EventRuntime } from "@/systems/eventInterpreter";
import type {
  BattleResult,
  ContentDatabase,
  FlagStateMap,
  InventoryState,
  PartyMemberState,
  PartyStateMap,
  QuestStateMap,
  SaveData,
  ShopStateMap,
} from "@/types/content";
import type { WorldRuntimeState } from "@/world/worldRuntime";

export interface GameStateSnapshot {
  flags: FlagStateMap;
  inventory: InventoryState;
  partyMemberIds: string[];
  partyStates: PartyStateMap;
  questStates: QuestStateMap;
  chapterId?: string;
  shopStates: ShopStateMap;
  consumedTriggerIds: string[];
  world: WorldRuntimeState;
}

export class GameStateRuntime {
  private readonly database: ContentDatabase;

  private flags: FlagStateMap;

  private inventory: InventoryState;

  private partyMemberIds: string[];

  private partyStates: PartyStateMap;

  private questStates: QuestStateMap;

  private chapterId?: string;

  private shopStates: ShopStateMap;

  private readonly consumedTriggerIds = new Set<string>();

  private world: WorldRuntimeState;

  constructor(
    database: ContentDatabase,
    initialSaveData?: SaveData,
  ) {
    this.database = database;
    this.flags = Object.fromEntries(database.flags.map((flag) => [flag.id, flag.defaultValue]));
    this.inventory = {
      gold: 0,
      items: [],
    };
    this.partyMemberIds = database.partyMembers[0] ? [database.partyMembers[0].id] : [];
    this.partyStates = Object.fromEntries(
      database.partyMembers.map((member, index) => [member.id, this.createDefaultPartyState(member.id, index)]),
    );
    this.questStates = Object.fromEntries(
      database.questStates.map((questState) => [questState.id, questState.initialStage]),
    );
    this.shopStates = Object.fromEntries(
      database.shops.map((shop) => [shop.id, { visited: false }]),
    );
    const firstMap = database.maps[0];
    const firstSpawn = firstMap?.spawnPoints[0];
    this.world = {
      currentMapId: firstMap?.id ?? "",
      currentSpawnId: firstSpawn?.id ?? "",
      playerX: firstSpawn?.x ?? 0,
      playerY: firstSpawn?.y ?? 0,
      facing: firstSpawn?.facing ?? "down",
    };

    if (initialSaveData) {
      this.loadSaveData(initialSaveData);
    }
  }

  getSnapshot(): GameStateSnapshot {
    return {
      flags: { ...this.flags },
      inventory: {
        gold: this.inventory.gold,
        items: this.inventory.items.map((entry) => ({ ...entry })),
      },
      partyMemberIds: [...this.partyMemberIds],
      partyStates: Object.fromEntries(
        Object.entries(this.partyStates).map(([memberId, state]) => [memberId, { ...state, statusIds: [...state.statusIds] }]),
      ),
      questStates: { ...this.questStates },
      chapterId: this.chapterId,
      shopStates: Object.fromEntries(
        Object.entries(this.shopStates).map(([shopId, shopState]) => [shopId, { ...shopState }]),
      ),
      consumedTriggerIds: [...this.consumedTriggerIds],
      world: { ...this.world },
    };
  }

  applyEventRuntime(runtime: EventRuntime): void {
    this.flags = { ...runtime.state.flags };
    this.inventory = {
      gold: runtime.state.inventory.gold,
      items: runtime.state.inventory.items.map((entry) => ({ ...entry })),
    };
    this.partyMemberIds = [...runtime.state.partyMemberIds];
    this.ensurePartyStatesForMembers();
  }

  syncWorldState(world: WorldRuntimeState): void {
    this.world = { ...world };
  }

  getWorldState(): WorldRuntimeState {
    return { ...this.world };
  }

  isTriggerConsumed(triggerId: string): boolean {
    return this.consumedTriggerIds.has(triggerId);
  }

  consumeTrigger(triggerId: string): void {
    this.consumedTriggerIds.add(triggerId);
  }

  applyBattleResult(result: BattleResult): void {
    if (result.outcome !== "victory") {
      return;
    }

    this.inventory = {
      gold: this.inventory.gold + result.rewards.gold,
      items: this.mergeInventoryItems(result.rewards.items),
    };

    const nextPartyStates: PartyStateMap = {};
    this.partyMemberIds.forEach((memberId, index) => {
      const currentState = this.partyStates[memberId] ?? this.createDefaultPartyState(memberId, index);
      nextPartyStates[memberId] = {
        ...currentState,
        experience: currentState.experience + result.rewards.experience,
      };
    });
    this.partyStates = {
      ...this.partyStates,
      ...nextPartyStates,
    };
  }

  toSaveData(slot: string): SaveData {
    return {
      version: SAVE_DATA_VERSION,
      slot,
      world: {
        mapId: this.world.currentMapId,
        spawnPointId: this.world.currentSpawnId,
        playerX: this.world.playerX,
        playerY: this.world.playerY,
        facing: this.world.facing,
      },
      partyMemberIds: [...this.partyMemberIds],
      partyStates: Object.fromEntries(
        Object.entries(this.partyStates).map(([memberId, state]) => [memberId, { ...state, statusIds: [...state.statusIds] }]),
      ),
      flags: { ...this.flags },
      questStates: { ...this.questStates },
      inventory: {
        gold: this.inventory.gold,
        items: this.inventory.items.map((entry) => ({ ...entry })),
      },
      chapterId: this.chapterId,
      shopStates: Object.fromEntries(
        Object.entries(this.shopStates).map(([shopId, shopState]) => [shopId, { ...shopState }]),
      ),
      consumedTriggerIds: [...this.consumedTriggerIds],
    };
  }

  loadSaveData(saveData: SaveData): void {
    this.flags = { ...saveData.flags };
    this.inventory = {
      gold: saveData.inventory.gold,
      items: saveData.inventory.items.map((entry) => ({ ...entry })),
    };
    this.partyMemberIds = [...saveData.partyMemberIds];
    this.partyStates = Object.fromEntries(
      Object.entries(saveData.partyStates ?? {}).map(([memberId, state]) => [memberId, { ...state, statusIds: [...state.statusIds] }]),
    );
    this.ensurePartyStatesForMembers();
    this.questStates = { ...saveData.questStates };
    this.chapterId = saveData.chapterId;
    this.shopStates = Object.fromEntries(
      Object.entries(saveData.shopStates).map(([shopId, shopState]) => [shopId, { ...shopState }]),
    );
    this.consumedTriggerIds.clear();
    saveData.consumedTriggerIds.forEach((triggerId) => {
      this.consumedTriggerIds.add(triggerId);
    });
    this.world = {
      currentMapId: saveData.world.mapId,
      currentSpawnId: saveData.world.spawnPointId,
      playerX: saveData.world.playerX,
      playerY: saveData.world.playerY,
      facing: saveData.world.facing,
    };
  }

  private createDefaultPartyState(memberId: string, formationSlot: number): PartyMemberState {
    const member = this.database.partyMembers.find((entry) => entry.id === memberId);
    if (!member) {
      throw new Error(`GameStateRuntime could not initialize missing party member "${memberId}".`);
    }

    return {
      memberId,
      level: member.level,
      experience: 0,
      currentHp: member.baseStats.maxHp,
      currentMp: member.baseStats.maxMp,
      statusIds: [],
      formationSlot,
    };
  }

  private ensurePartyStatesForMembers(): void {
    this.partyMemberIds.forEach((memberId, index) => {
      const currentState = this.partyStates[memberId];
      this.partyStates[memberId] = currentState
        ? { ...currentState, formationSlot: index, statusIds: [...currentState.statusIds] }
        : this.createDefaultPartyState(memberId, index);
    });
  }

  private mergeInventoryItems(rewardItems: InventoryState["items"]): InventoryState["items"] {
    const nextItems = this.inventory.items.map((entry) => ({ ...entry }));

    rewardItems.forEach((reward) => {
      const existing = nextItems.find((entry) => entry.itemId === reward.itemId);
      if (existing) {
        existing.quantity += reward.quantity;
        return;
      }

      nextItems.push({ ...reward });
    });

    return nextItems;
  }
}
