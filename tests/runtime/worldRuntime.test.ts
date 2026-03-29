import { describe, expect, it } from "vitest";
import { WorldRuntime } from "@/world/worldRuntime";
import type { ContentDatabase } from "@/types/content";

function createWorldDatabase(): ContentDatabase {
  const townWidth = 5;
  const townHeight = 5;
  const fieldWidth = 6;
  const fieldHeight = 5;

  const townCollision = Array.from({ length: townWidth * townHeight }, () => 0);
  townCollision[(1 * townWidth) + 2] = 1;

  return {
    packs: [],
    maps: [
      {
        id: "town",
        name: "Town",
        width: townWidth,
        height: townHeight,
        tileWidth: 16,
        tileHeight: 16,
        tileLayers: [
          { id: "ground", name: "Ground", width: townWidth, height: townHeight, tiles: Array.from({ length: townWidth * townHeight }, () => 1) },
        ],
        collisionLayers: [
          { id: "collision", name: "Collision", width: townWidth, height: townHeight, blocked: townCollision },
        ],
        portals: [
          { id: "to-field", x: 3, y: 2, width: 1, height: 1, targetMapId: "field", targetSpawnId: "field-gate" },
        ],
        spawnPoints: [
          { id: "town-start", x: 1, y: 2, facing: "down" },
          { id: "from-field", x: 2, y: 2, facing: "left" },
        ],
        npcs: [],
        triggers: [],
      },
      {
        id: "field",
        name: "Field",
        width: fieldWidth,
        height: fieldHeight,
        tileWidth: 16,
        tileHeight: 16,
        tileLayers: [
          { id: "ground", name: "Ground", width: fieldWidth, height: fieldHeight, tiles: Array.from({ length: fieldWidth * fieldHeight }, () => 2) },
        ],
        collisionLayers: [
          { id: "collision", name: "Collision", width: fieldWidth, height: fieldHeight, blocked: Array.from({ length: fieldWidth * fieldHeight }, () => 0) },
        ],
        portals: [
          { id: "to-town", x: 1, y: 2, width: 1, height: 1, targetMapId: "town", targetSpawnId: "from-field" },
        ],
        spawnPoints: [
          { id: "field-gate", x: 2, y: 2, facing: "right" },
        ],
        npcs: [],
        triggers: [],
      },
    ],
    dialogueLines: [],
    events: [],
    items: [{ id: "item-1", name: "Herb", description: "HP", kind: "consumable", price: 10 }],
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
    shops: [],
    skills: [{ id: "skill-1", name: "Strike", description: "Hit", mpCost: 0, power: 4, target: "enemy" }],
    flags: [],
    questStates: [],
    encounterTables: [],
  };
}

describe("world runtime", () => {
  it("moves on the grid, blocks collision, and updates facing", () => {
    const runtime = new WorldRuntime(createWorldDatabase());

    const moved = runtime.move("right");
    expect(moved.type).toBe("moved");
    expect(moved.state.currentMapId).toBe("town");
    expect(moved.state.playerX).toBe(2);
    expect(moved.state.playerY).toBe(2);
    expect(moved.state.facing).toBe("right");
    expect(moved.state.stepCount).toBe(1);

    const blocked = runtime.move("up");
    expect(blocked.type).toBe("blocked");
    expect(blocked.state.playerX).toBe(2);
    expect(blocked.state.playerY).toBe(2);
    expect(blocked.state.facing).toBe("up");
    expect(blocked.state.stepCount).toBe(1);
  });

  it("treats npc tiles as blocked so interaction happens from an adjacent tile", () => {
    const database = createWorldDatabase();
    if (!database.maps[0]) {
      throw new Error("expected seeded map data");
    }

    database.maps[0].npcs = [
      {
        id: "guide",
        name: "Guide",
        x: 2,
        y: 2,
        sprite: "guide",
        facing: "down",
        behavior: "idle",
        eventId: "guide-event",
      },
    ];

    const runtime = new WorldRuntime(database, {
      currentMapId: "town",
      currentSpawnId: "town-start",
      playerX: 1,
      playerY: 2,
      facing: "right",
      stepCount: 0,
    });

    const blocked = runtime.move("right");
    expect(blocked.type).toBe("blocked");
    expect(blocked.state.playerX).toBe(1);
    expect(blocked.state.playerY).toBe(2);
  });

  it("transitions through portals and lands on the target spawn point", () => {
    const runtime = new WorldRuntime(createWorldDatabase());

    runtime.move("right");
    const result = runtime.move("right");

    expect(result.type).toBe("portal");
    expect(result.portal?.id).toBe("to-field");
    expect(result.state.currentMapId).toBe("field");
    expect(result.state.currentSpawnId).toBe("field-gate");
    expect(result.state.playerX).toBe(2);
    expect(result.state.playerY).toBe(2);
    expect(result.state.facing).toBe("right");
    expect(result.state.stepCount).toBe(2);
  });
});
