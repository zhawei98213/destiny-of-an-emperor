import { describe, expect, it } from "vitest";
import { findNpcInFront, getTileInFront } from "@/world/worldInteraction";
import type { MapDefinition } from "@/types/content";
import type { WorldRuntimeState } from "@/world/worldRuntime";

const map: MapDefinition = {
  id: "town",
  name: "Town",
  width: 10,
  height: 10,
  tileWidth: 16,
  tileHeight: 16,
  tileLayers: [{ id: "ground", name: "Ground", width: 10, height: 10, tiles: Array.from({ length: 100 }, () => 1) }],
  collisionLayers: [{ id: "collision", name: "Collision", width: 10, height: 10, blocked: Array.from({ length: 100 }, () => 0) }],
  portals: [],
  spawnPoints: [{ id: "start", x: 2, y: 2, facing: "right" }],
  npcs: [
    { id: "npc-1", name: "Guide", x: 3, y: 2, sprite: "guide", facing: "left", behavior: "idle", eventId: "guide-event" },
  ],
  triggers: [],
};

describe("world interaction", () => {
  it("finds the tile in front of the player based on facing", () => {
    const state: WorldRuntimeState = {
      currentMapId: "town",
      currentSpawnId: "start",
      playerX: 2,
      playerY: 2,
      facing: "right",
      stepCount: 0,
    };

    expect(getTileInFront(state)).toEqual({ x: 3, y: 2 });
  });

  it("finds an npc standing in front of the player", () => {
    const state: WorldRuntimeState = {
      currentMapId: "town",
      currentSpawnId: "start",
      playerX: 2,
      playerY: 2,
      facing: "right",
      stepCount: 0,
    };

    expect(findNpcInFront(map, state)?.id).toBe("npc-1");
  });
});
