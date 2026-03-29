import { describe, expect, it } from "vitest";
import { GameStateRuntime } from "@/systems/gameStateRuntime";
import { MemoryStorage, SaveManager } from "@/systems/saveManager";
import { MenuController } from "@/ui/menuController";
import type { ContentDatabase } from "@/types/content";
import { WorldRuntime } from "@/world/worldRuntime";
import type { MenuOverlayPort } from "@/ui/menuOverlay";

class TestOverlay implements MenuOverlayPort {
  public lastRendered = "";

  public hidden = true;

  render(viewModel: { activeTab: string; systemText: string; partyText: string; inventoryText: string; statusText: string }): void {
    this.hidden = false;
    this.lastRendered = `${viewModel.activeTab}\n${viewModel.statusText}\n${viewModel.inventoryText}\n${viewModel.partyText}\n${viewModel.systemText}`;
  }

  hide(): void {
    this.hidden = true;
  }

  destroy(): void {}
}

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

describe("menu controller", () => {
  it("opens, switches tabs, saves, and loads through save manager", () => {
    const database = createDatabase();
    const overlay = new TestOverlay();
    const gameState = new GameStateRuntime(database);
    const worldRuntime = new WorldRuntime(database);
    const saveManager = new SaveManager(new MemoryStorage(), database);
    const controller = new MenuController(
      overlay,
      database,
      gameState,
      worldRuntime,
      saveManager,
    );

    controller.toggle();
    expect(overlay.hidden).toBe(false);

    controller.nextTab();
    expect(overlay.lastRendered.startsWith("inventory")).toBe(true);

    const saveResult = controller.save();
    expect(saveResult.shouldReloadWorld).toBe(false);

    gameState.syncWorldState({
      currentMapId: "town",
      currentSpawnId: "town-start",
      playerX: 3,
      playerY: 3,
      facing: "right",
      stepCount: 0,
    });
    saveManager.save(gameState.toSaveData("slot-1"));
    const loadResult = controller.load();

    expect(loadResult.shouldReloadWorld).toBe(true);
    expect(worldRuntime.getState().playerX).toBe(3);
  });
});
