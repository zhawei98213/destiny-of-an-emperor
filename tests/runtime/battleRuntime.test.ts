import { describe, expect, it } from "vitest";
import { createBattleState, getCurrentActor, runAttackTurn } from "@/battle/battleRuntime";
import { GameStateRuntime } from "@/systems/gameStateRuntime";
import type { ContentDatabase } from "@/types/content";

function createDatabase(): ContentDatabase {
  return {
    packs: [],
    maps: [{
      id: "field",
      name: "Field",
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
      skills: ["slash"],
      baseStats: { maxHp: 16, maxMp: 4, attack: 9, defense: 5, speed: 8 },
    }],
    enemies: [{
      id: "slime",
      name: "Slime",
      level: 1,
      skills: ["slash"],
      rewardGold: 4,
      rewardExperience: 3,
      dropItems: [{ itemId: "herb", quantity: 1, chance: 1 }],
      baseStats: { maxHp: 6, maxMp: 0, attack: 3, defense: 1, speed: 2 },
    }],
    battleGroups: [{ id: "starter-slime", name: "Starter Slime", enemyIds: ["slime"] }],
    shops: [],
    skills: [{ id: "slash", name: "Slash", description: "Hit", mpCost: 0, power: 4, target: "enemy" }],
    flags: [],
    questStates: [],
  };
}

describe("battle runtime", () => {
  it("resolves a victory and writes rewards back to shared state", () => {
    const database = createDatabase();
    const gameState = new GameStateRuntime(database);
    const state = createBattleState(database, gameState.getSnapshot(), {
      battleGroupId: "starter-slime",
      originMapId: "field",
    });

    expect(getCurrentActor(state)?.side).toBe("ally");

    const result = runAttackTurn(state);
    expect(result.outcome?.outcome).toBe("victory");
    expect(result.outcome?.rewards).toEqual({
      experience: 3,
      gold: 4,
      items: [{ itemId: "herb", quantity: 1 }],
    });

    gameState.applyBattleResult(result.outcome!);
    const snapshot = gameState.getSnapshot();
    expect(snapshot.inventory.gold).toBe(4);
    expect(snapshot.inventory.items).toEqual([{ itemId: "herb", quantity: 1 }]);
    expect(snapshot.partyStates.hero?.experience).toBe(3);
  });

  it("resolves defeat when all allies fall", () => {
    const database = createDatabase();
    const gameState = new GameStateRuntime(database);
    const snapshot = gameState.getSnapshot();
    snapshot.partyStates.hero.currentHp = 1;
    const state = createBattleState(database, snapshot, {
      battleGroupId: "starter-slime",
      originMapId: "field",
    });
    const weakenedState = {
      ...state,
      units: state.units.map((unit) => {
        if (unit.side === "ally") {
          return {
            ...unit,
            attack: 1,
            speed: 1,
          };
        }

        return {
          ...unit,
          attack: 3,
          speed: 9,
        };
      }),
      turnOrder: ["enemy:slime:0", "ally:hero"],
    };

    let nextState = weakenedState;
    while (!nextState.outcome) {
      nextState = runAttackTurn(nextState).state;
    }

    expect(nextState.outcome).toEqual({
      battleGroupId: "starter-slime",
      outcome: "defeat",
      rewards: {
        experience: 0,
        gold: 0,
        items: [],
      },
    });
  });
});
