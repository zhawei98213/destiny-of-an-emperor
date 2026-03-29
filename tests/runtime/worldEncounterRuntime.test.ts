import { describe, expect, it } from "vitest";
import type { ContentDatabase, TriggerDefinition } from "@/types/content";
import { GameStateRuntime } from "@/systems/gameStateRuntime";
import { resolveRegionEncounter } from "@/world/worldEncounterRuntime";

function createDatabase(): ContentDatabase {
  return {
    packs: [],
    maps: [{
      id: "field",
      name: "Field",
      width: 8,
      height: 8,
      tileWidth: 16,
      tileHeight: 16,
      tileLayers: [{ id: "ground", name: "Ground", width: 8, height: 8, tiles: Array.from({ length: 64 }, () => 1) }],
      collisionLayers: [{ id: "collision", name: "Collision", width: 8, height: 8, blocked: Array.from({ length: 64 }, () => 0) }],
      portals: [],
      spawnPoints: [{ id: "start", x: 1, y: 1, facing: "right" }],
      npcs: [],
      triggers: [],
    }],
    dialogueLines: [],
    events: [],
    items: [],
    partyMembers: [{
      id: "hero",
      name: "Hero",
      className: "Lord",
      level: 1,
      skills: ["slash"],
      baseStats: { maxHp: 12, maxMp: 4, attack: 7, defense: 4, speed: 5 },
    }],
    enemies: [{
      id: "slime",
      name: "Slime",
      level: 1,
      skills: ["slash"],
      rewardGold: 3,
      rewardExperience: 2,
      dropItems: [],
      baseStats: { maxHp: 8, maxMp: 0, attack: 3, defense: 1, speed: 2 },
    }],
    battleGroups: [{ id: "field-slimes", name: "Field Slimes", enemyIds: ["slime"] }],
    shops: [],
    skills: [{ id: "slash", name: "Slash", description: "Hit", mpCost: 0, power: 4, target: "enemy" }],
    flags: [
      { id: "recruited-patrol", defaultValue: false },
    ],
    questStates: [],
    encounterTables: [{
      id: "field-patrols",
      name: "Field Patrols",
      stepInterval: 2,
      chance: 1,
      entries: [{
        id: "field-slime-entry",
        battleGroupId: "field-slimes",
        weight: 1,
        blockedFlagId: "recruited-patrol",
      }],
    }],
  };
}

describe("world encounter runtime", () => {
  const trigger: TriggerDefinition = {
    id: "field-encounter",
    kind: "region",
    x: 3,
    y: 3,
    width: 2,
    height: 2,
    encounterTableId: "field-patrols",
    once: false,
  };

  it("starts an encounter when the step interval matches and an entry is available", () => {
    const database = createDatabase();
    const gameState = new GameStateRuntime(database);

    const encounter = resolveRegionEncounter(
      database,
      trigger,
      {
        currentMapId: "field",
        currentSpawnId: "start",
        playerX: 3,
        playerY: 3,
        facing: "right",
        stepCount: 2,
      },
      gameState.getSnapshot(),
    );

    expect(encounter).toEqual({
      battleGroupId: "field-slimes",
      encounterTableId: "field-patrols",
      triggerId: "field-encounter",
    });
  });

  it("suppresses encounters when all entries are blocked by state", () => {
    const database = createDatabase();
    const gameState = new GameStateRuntime(database);
    const snapshot = gameState.getSnapshot();
    snapshot.flags["recruited-patrol"] = true;

    const encounter = resolveRegionEncounter(
      database,
      trigger,
      {
        currentMapId: "field",
        currentSpawnId: "start",
        playerX: 3,
        playerY: 3,
        facing: "right",
        stepCount: 2,
      },
      snapshot,
    );

    expect(encounter).toBeUndefined();
  });
});
