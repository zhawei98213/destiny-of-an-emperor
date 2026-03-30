import { describe, expect, it } from "vitest";
import { MemoryStorage, SaveManager } from "@/systems/saveManager";
import { SAVE_DATA_VERSION, runSaveDataMigrations } from "@/systems/saveMigration";
import type { ContentDatabase } from "@/types/content";

function createDatabase(): ContentDatabase {
  return {
    packs: [],
    maps: [{
      id: "town",
      name: "Town",
      width: 5,
      height: 5,
      tileWidth: 16,
      tileHeight: 16,
      tileLayers: [{ id: "ground", name: "Ground", width: 5, height: 5, tiles: Array.from({ length: 25 }, () => 1) }],
      collisionLayers: [{ id: "collision", name: "Collision", width: 5, height: 5, blocked: Array.from({ length: 25 }, () => 0) }],
      portals: [],
      spawnPoints: [{ id: "town-start", x: 1, y: 1, facing: "down" }],
      npcs: [],
      triggers: [],
    }],
    dialogueLines: [],
    events: [],
    items: [{ id: "herb", name: "Herb", description: "HP", kind: "consumable", price: 10 }],
    partyMembers: [{
      id: "hero",
      name: "Hero",
      className: "Lord",
      level: 1,
      skills: ["skill-1"],
      baseStats: { maxHp: 10, maxMp: 5, attack: 5, defense: 5, speed: 5 },
    }],
    enemies: [],
    battleGroups: [],
    shops: [{ id: "shop-1", name: "Shop", inventory: [] }],
    skills: [{ id: "skill-1", name: "Strike", description: "Hit", mpCost: 0, power: 4, target: "enemy" }],
    flags: [{ id: "opened", defaultValue: false }],
    questStates: [{ id: "quest-1", stages: ["idle", "done"], initialStage: "idle" }],
    encounterTables: [],
  };
}

describe("save migration", () => {
  it("migrates a version 1 save and fills missing defaults", () => {
    const migrated = runSaveDataMigrations({
      version: 1,
      slot: "legacy-v1",
      world: {
        mapId: "town",
        spawnPointId: "town-start",
        playerX: 2,
        playerY: 3,
        facing: "left",
      },
      partyMemberIds: ["hero"],
      flags: {
        opened: true,
      },
      questStates: {
        "quest-1": "idle",
      },
      inventory: {
        gold: 5,
        items: [{ itemId: "herb", quantity: 1 }],
      },
    });

    expect(migrated.version).toBe(SAVE_DATA_VERSION);
    expect(migrated.world.stepCount).toBe(0);
    expect(migrated.partyStates).toEqual({});
    expect(migrated.shopStates).toEqual({});
    expect(migrated.consumedTriggerIds).toEqual([]);
    expect(migrated.saveMeta).toEqual({
      createdByVersion: 1,
      migratedFromVersion: 2,
      migrationCount: 2,
    });
  });

  it("reads a version 2 save through SaveManager and preserves state after migration", () => {
    const database = createDatabase();
    const storage = new MemoryStorage();
    const saveManager = new SaveManager(storage, database);

    storage.setItem("save:legacy-v2", JSON.stringify({
      version: 2,
      slot: "legacy-v2",
      world: {
        mapId: "town",
        spawnPointId: "town-start",
        playerX: 4,
        playerY: 1,
        facing: "up",
        stepCount: 7,
      },
      partyMemberIds: ["hero"],
      partyStates: {
        hero: {
          memberId: "hero",
          level: 2,
          experience: 9,
          currentHp: 7,
          currentMp: 3,
          statusIds: [],
          formationSlot: 0,
        },
      },
      flags: {
        opened: false,
      },
      questStates: {
        "quest-1": "idle",
      },
      inventory: {
        gold: 12,
        items: [{ itemId: "herb", quantity: 2 }],
      },
      chapterId: "chapter-02-east-road-relay",
      shopStates: {
        "shop-1": {
          visited: true,
        },
      },
      consumedTriggerIds: ["chest-trigger"],
    }));

    const loaded = saveManager.load("legacy-v2");

    expect(loaded?.version).toBe(SAVE_DATA_VERSION);
    expect(loaded?.world).toEqual({
      mapId: "town",
      spawnPointId: "town-start",
      playerX: 4,
      playerY: 1,
      facing: "up",
      stepCount: 7,
    });
    expect(loaded?.inventory).toEqual({
      gold: 12,
      items: [{ itemId: "herb", quantity: 2 }],
    });
    expect(loaded?.partyStates.hero?.level).toBe(2);
    expect(loaded?.shopStates["shop-1"]).toEqual({ visited: true });
    expect(loaded?.consumedTriggerIds).toEqual(["chest-trigger"]);
    expect(loaded?.saveMeta).toEqual({
      createdByVersion: 2,
      migratedFromVersion: 2,
      migrationCount: 1,
    });
  });
});
