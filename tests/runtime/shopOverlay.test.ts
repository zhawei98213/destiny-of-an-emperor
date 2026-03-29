import { describe, expect, it } from "vitest";
import { GameStateRuntime } from "@/systems/gameStateRuntime";
import type { ContentDatabase } from "@/types/content";
import { buildShopViewModel } from "@/ui/shopOverlay";

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
      spawnPoints: [{ id: "start", x: 1, y: 1, facing: "down" }],
      npcs: [],
      triggers: [],
    }],
    dialogueLines: [],
    events: [],
    items: [
      { id: "herb", name: "Herb", description: "HP", kind: "consumable", price: 10 },
      { id: "bronze-sword", name: "Bronze Sword", description: "ATK", kind: "equipment", price: 45 },
    ],
    partyMembers: [{
      id: "hero",
      name: "Hero",
      className: "Lord",
      level: 1,
      skills: ["slash"],
      baseStats: { maxHp: 10, maxMp: 5, attack: 5, defense: 5, speed: 5 },
    }],
    enemies: [],
    battleGroups: [],
    shops: [{
      id: "starter-shop",
      name: "Starter Shop",
      inventory: [
        { itemId: "herb" },
        { itemId: "bronze-sword", price: 40 },
      ],
    }],
    skills: [{ id: "slash", name: "Slash", description: "Hit", mpCost: 0, power: 4, target: "enemy" }],
    flags: [],
    questStates: [],
    encounterTables: [],
  };
}

describe("shop overlay", () => {
  it("builds visible item and price lines from shop content", () => {
    const database = createDatabase();
    const gameState = new GameStateRuntime(database);
    const view = buildShopViewModel(database, gameState.getSnapshot(), "starter-shop");

    expect(view.shopId).toBe("starter-shop");
    expect(view.itemLines).toEqual([
      "1. Herb - 10G",
      "2. Bronze Sword - 40G",
    ]);
    expect(view.bodyText).toContain("Space / Esc: Close / 关闭");
  });
});
