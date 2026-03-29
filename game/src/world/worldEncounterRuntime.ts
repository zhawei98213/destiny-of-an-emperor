import type { GameStateSnapshot } from "@/systems/gameStateRuntime";
import type {
  ContentDatabase,
  EncounterEntryDefinition,
  EncounterTableDefinition,
  TriggerDefinition,
} from "@/types/content";
import type { WorldRuntimeState } from "@/world/worldRuntime";

export interface EncounterResolution {
  battleGroupId: string;
  encounterTableId: string;
  triggerId: string;
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createEncounterRoll(triggerId: string, state: WorldRuntimeState, suffix: string): number {
  const seed = `${triggerId}:${state.currentMapId}:${state.playerX}:${state.playerY}:${state.stepCount}:${suffix}`;
  return (hashString(seed) % 10_000) / 10_000;
}

function resolveEncounterEntries(
  table: EncounterTableDefinition,
  flags: GameStateSnapshot["flags"],
): EncounterEntryDefinition[] {
  return table.entries.filter((entry) => {
    if (entry.requiredFlagId && !flags[entry.requiredFlagId]) {
      return false;
    }

    if (entry.blockedFlagId && flags[entry.blockedFlagId]) {
      return false;
    }

    return true;
  });
}

export function resolveRegionEncounter(
  database: ContentDatabase,
  trigger: TriggerDefinition,
  worldState: WorldRuntimeState,
  snapshot: GameStateSnapshot,
): EncounterResolution | undefined {
  if (!trigger.encounterTableId) {
    return undefined;
  }

  const table = database.encounterTables.find((entry) => entry.id === trigger.encounterTableId);
  if (!table) {
    throw new Error(`WorldEncounterRuntime could not find encounter table "${trigger.encounterTableId}".`);
  }

  if (worldState.stepCount <= 0 || worldState.stepCount % table.stepInterval !== 0) {
    return undefined;
  }

  if (createEncounterRoll(trigger.id, worldState, "chance") >= table.chance) {
    return undefined;
  }

  const candidates = resolveEncounterEntries(table, snapshot.flags);
  if (candidates.length === 0) {
    return undefined;
  }

  const totalWeight = candidates.reduce((sum, entry) => sum + entry.weight, 0);
  let pick = createEncounterRoll(trigger.id, worldState, "entry") * totalWeight;

  for (const entry of candidates) {
    pick -= entry.weight;
    if (pick <= 0) {
      return {
        battleGroupId: entry.battleGroupId,
        encounterTableId: table.id,
        triggerId: trigger.id,
      };
    }
  }

  const lastEntry = candidates.at(-1);
  if (!lastEntry) {
    return undefined;
  }

  return {
    battleGroupId: lastEntry.battleGroupId,
    encounterTableId: table.id,
    triggerId: trigger.id,
  };
}
