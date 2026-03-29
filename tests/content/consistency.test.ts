import { describe, expect, it } from "vitest";
import { validateContentReferences } from "@/content/schema";
import type { ContentDatabase } from "@/types/content";

function createBaseDatabase(): ContentDatabase {
  const width = 10;
  const height = 10;

  return {
    packs: [],
    maps: [
      {
        id: "map-1",
        name: "Map One",
        width,
        height,
        tileWidth: 16,
        tileHeight: 16,
        tileLayers: [{ id: "ground", name: "Ground", width, height, tiles: Array.from({ length: width * height }, () => 1) }],
        collisionLayers: [{ id: "collision", name: "Collision", width, height, blocked: Array.from({ length: width * height }, () => 0) }],
        portals: [],
        spawnPoints: [{ id: "start", x: 1, y: 1, facing: "down" }],
        npcs: [{ id: "npc-1", name: "Guide", x: 1, y: 1, sprite: "guide", facing: "down", behavior: "idle", eventId: "event-1" }],
        triggers: [{ id: "trigger-1", kind: "tile", x: 2, y: 2, width: 1, height: 1, eventId: "event-1", once: false }],
      },
    ],
    dialogueLines: [{ id: "line-1", speakerName: "Guide", speakerNpcId: "npc-1", text: "Hello" }],
    events: [{ id: "event-1", name: "Event", steps: [{ type: "dialogue", lineId: "line-1" }, { type: "end" }] }],
    items: [{ id: "item-1", name: "Herb", description: "HP", kind: "consumable", price: 10 }],
    partyMembers: [{
      id: "hero",
      name: "Hero",
      className: "Lord",
      level: 1,
      skills: ["skill-1"],
      baseStats: { maxHp: 10, maxMp: 5, attack: 5, defense: 5, speed: 5 },
    }],
    enemies: [{
      id: "enemy-1",
      name: "Bandit",
      level: 1,
      skills: ["skill-1"],
      rewardGold: 1,
      rewardExperience: 1,
      dropItems: [],
      baseStats: { maxHp: 10, maxMp: 0, attack: 3, defense: 2, speed: 2 },
    }],
    battleGroups: [{ id: "group-1", name: "Bandits", enemyIds: ["enemy-1"] }],
    shops: [{ id: "shop-1", name: "Shop", inventory: [{ itemId: "item-1" }] }],
    skills: [{ id: "skill-1", name: "Strike", description: "Hit", mpCost: 0, power: 4, target: "enemy" }],
    flags: [{ id: "flag-1", defaultValue: false }],
    questStates: [{ id: "quest-1", stages: ["idle", "done"], initialStage: "idle" }],
    encounterTables: [],
  };
}

describe("content consistency", () => {
  it("rejects missing references with explicit errors", () => {
    const database = createBaseDatabase();
    if (!database.shops[0]) {
      throw new Error("expected seeded shop data");
    }

    database.shops[0].inventory[0] = { itemId: "missing-item" };

    expect(() => validateContentReferences(database)).toThrowError(
      /shops\.shop-1\.inventory\[0\]\.itemId.*missing item "missing-item"/,
    );
  });

  it("rejects mismatched tile layer sizes with explicit errors", () => {
    const database = createBaseDatabase();
    if (!database.maps[0]) {
      throw new Error("expected seeded map data");
    }

    database.maps[0].tileLayers[0] = {
      ...database.maps[0].tileLayers[0],
      tiles: [1, 1, 1],
    };

    expect(() => validateContentReferences(database)).toThrowError(
      /maps\.map-1\.tileLayers\[0\]\.tiles.*expected 100 tiles, received 3/,
    );
  });
});
