import type { ContentDatabase, FlagStateMap, InventoryState } from "@/types/content";
import type { EventRuntime } from "@/systems/eventInterpreter";

export interface GameStateSnapshot {
  flags: FlagStateMap;
  inventory: InventoryState;
  partyMemberIds: string[];
  consumedTriggerIds: string[];
}

export class GameStateRuntime {
  private flags: FlagStateMap;

  private inventory: InventoryState;

  private partyMemberIds: string[];

  private readonly consumedTriggerIds = new Set<string>();

  constructor(database: ContentDatabase) {
    this.flags = Object.fromEntries(database.flags.map((flag) => [flag.id, flag.defaultValue]));
    this.inventory = {
      gold: 0,
      items: [],
    };
    this.partyMemberIds = database.partyMembers[0] ? [database.partyMembers[0].id] : [];
  }

  getSnapshot(): GameStateSnapshot {
    return {
      flags: { ...this.flags },
      inventory: {
        gold: this.inventory.gold,
        items: this.inventory.items.map((entry) => ({ ...entry })),
      },
      partyMemberIds: [...this.partyMemberIds],
      consumedTriggerIds: [...this.consumedTriggerIds],
    };
  }

  applyEventRuntime(runtime: EventRuntime): void {
    this.flags = { ...runtime.state.flags };
    this.inventory = {
      gold: runtime.state.inventory.gold,
      items: runtime.state.inventory.items.map((entry) => ({ ...entry })),
    };
    this.partyMemberIds = [...runtime.state.partyMemberIds];
  }

  isTriggerConsumed(triggerId: string): boolean {
    return this.consumedTriggerIds.has(triggerId);
  }

  consumeTrigger(triggerId: string): void {
    this.consumedTriggerIds.add(triggerId);
  }
}
