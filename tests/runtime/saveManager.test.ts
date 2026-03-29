import { describe, expect, it } from "vitest";
import { GameStateRuntime } from "@/systems/gameStateRuntime";
import { DEFAULT_SAVE_SLOT, MemoryStorage, SaveManager } from "@/systems/saveManager";
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
  };
}

describe("save manager", () => {
  it("round-trips versioned save data through schema validation", () => {
    const database = createDatabase();
    const saveManager = new SaveManager(new MemoryStorage(), database);
    const stateRuntime = new GameStateRuntime(database);
    stateRuntime.syncWorldState({
      currentMapId: "town",
      currentSpawnId: "town-start",
      playerX: 2,
      playerY: 3,
      facing: "left",
    });
    stateRuntime.consumeTrigger("chest-trigger");

    const saveData = stateRuntime.toSaveData(DEFAULT_SAVE_SLOT);
    saveData.flags.opened = true;
    saveData.inventory.items.push({ itemId: "herb", quantity: 2 });
    saveData.shopStates["shop-1"] = { visited: true };

    saveManager.save(saveData);
    const loaded = saveManager.load(DEFAULT_SAVE_SLOT);

    expect(loaded?.version).toBe(2);
    expect(loaded?.world).toEqual({
      mapId: "town",
      spawnPointId: "town-start",
      playerX: 2,
      playerY: 3,
      facing: "left",
    });
    expect(loaded?.inventory.items).toEqual([{ itemId: "herb", quantity: 2 }]);
    expect(loaded?.partyStates.hero?.memberId).toBe("hero");
    expect(loaded?.consumedTriggerIds).toEqual(["chest-trigger"]);
    expect(loaded?.shopStates["shop-1"]).toEqual({ visited: true });
  });
});
