import { describe, expect, it } from "vitest";
import {
  findEncounterTriggersAtPoint,
  findNpcInteractionTrigger,
  findTriggersAtPoint,
} from "@/world/worldTriggerResolver";
import type { MapDefinition } from "@/types/content";

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
  spawnPoints: [{ id: "start", x: 1, y: 1, facing: "down" }],
  npcs: [{ id: "guard", name: "Guard", x: 4, y: 4, sprite: "guard", facing: "left", behavior: "idle" }],
  triggers: [
    { id: "guard-talk", kind: "npcInteraction", npcId: "guard", eventId: "guard-event", once: false },
    { id: "chest-tile", kind: "tile", x: 2, y: 2, width: 1, height: 1, eventId: "chest-event", once: true },
    { id: "field-region", kind: "region", x: 5, y: 5, width: 2, height: 2, eventId: "field-event", once: false },
    { id: "encounter-region", kind: "region", x: 7, y: 7, width: 2, height: 1, encounterTableId: "field-patrols", once: false },
  ],
};

describe("world trigger resolver", () => {
  it("finds npc interaction triggers by npc id", () => {
    expect(findNpcInteractionTrigger(map, "guard")?.id).toBe("guard-talk");
  });

  it("finds tile and region triggers at a point", () => {
    expect(findTriggersAtPoint(map, { x: 2, y: 2 }).map((trigger) => trigger.id)).toEqual(["chest-tile"]);
    expect(findTriggersAtPoint(map, { x: 6, y: 6 }).map((trigger) => trigger.id)).toEqual(["field-region"]);
  });

  it("resolves encounter regions separately from event triggers", () => {
    expect(findEncounterTriggersAtPoint(map, { x: 7, y: 7 }).map((trigger) => trigger.id)).toEqual(["encounter-region"]);
    expect(findTriggersAtPoint(map, { x: 7, y: 7 })).toEqual([]);
  });
});
