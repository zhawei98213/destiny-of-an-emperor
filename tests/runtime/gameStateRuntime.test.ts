import { describe, expect, it } from "vitest";
import { GameStateRuntime } from "@/systems/gameStateRuntime";
import { createEventRuntime } from "@/systems/eventInterpreter";
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
      spawnPoints: [{ id: "start", x: 1, y: 1, facing: "down" }],
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
    shops: [],
    skills: [{ id: "skill-1", name: "Strike", description: "Hit", mpCost: 0, power: 4, target: "enemy" }],
    flags: [{ id: "opened", defaultValue: false }],
    questStates: [],
  };
}

describe("game state runtime", () => {
  it("applies event state and tracks consumed triggers", () => {
    const database = createDatabase();
    const gameState = new GameStateRuntime(database);
    const runtime = createEventRuntime(database);
    runtime.state.flags.opened = true;
    runtime.state.inventory.items.push({ itemId: "herb", quantity: 1 });
    runtime.state.partyStates.hero.currentHp = 3;
    gameState.applyEventRuntime(runtime);
    gameState.consumeTrigger("chest-trigger");

    expect(gameState.getSnapshot().flags.opened).toBe(true);
    expect(gameState.getSnapshot().inventory.items).toEqual([{ itemId: "herb", quantity: 1 }]);
    expect(gameState.getSnapshot().partyStates.hero?.currentHp).toBe(3);
    expect(gameState.isTriggerConsumed("chest-trigger")).toBe(true);
  });
});
