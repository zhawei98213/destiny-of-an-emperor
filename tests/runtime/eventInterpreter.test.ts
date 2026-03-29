import { describe, expect, it } from "vitest";
import { createDialogueCue, createEventRuntime, EventInterpreter } from "@/systems/eventInterpreter";
import type { ContentDatabase, EventDefinition } from "@/types/content";

describe("event interpreter", () => {
  it("executes dialogue, setFlag, and end", () => {
    const interpreter = new EventInterpreter();
    const event: EventDefinition = {
      id: "intro",
      name: "Intro",
      steps: [
        { type: "dialogue", lineId: "line-1" },
        { type: "setFlag", flagId: "introSeen" },
        { type: "end" },
        { type: "dialogue", lineId: "line-2" },
      ],
    };
    const database: ContentDatabase = {
      packs: [],
      maps: [],
      dialogueLines: [
        { id: "line-1", speakerName: "Narrator", text: "Welcome", portraitId: "narrator", soundId: "blip" },
        { id: "line-2", speakerName: "Narrator", text: "Skipped" },
      ],
      events: [event],
      items: [],
      partyMembers: [],
      enemies: [],
      battleGroups: [],
      shops: [],
      skills: [],
      flags: [],
      questStates: [],
    };
    const runtime = createEventRuntime(database);

    interpreter.execute(event, database, runtime);

    expect(runtime.dialogueLog).toEqual([{
      id: "line-1",
      speakerName: "Narrator",
      speakerNpcId: undefined,
      text: "Welcome",
      portraitId: "narrator",
      soundId: "blip",
      choices: undefined,
    }]);
    expect(runtime.state.flags.introSeen).toBe(true);
    expect(runtime.ended).toBe(true);
  });

  it("creates structured dialogue cues with extension fields", () => {
    const event: EventDefinition = {
      id: "intro",
      name: "Intro",
      steps: [],
    };
    const database: ContentDatabase = {
      packs: [],
      maps: [],
      dialogueLines: [
        {
          id: "line-1",
          speakerName: "Guide",
          speakerNpcId: "npc-1",
          text: "Welcome to town.",
          portraitId: "guide-default",
          soundId: "voice-guide",
        },
      ],
      events: [],
      items: [],
      partyMembers: [],
      enemies: [],
      battleGroups: [],
      shops: [],
      skills: [],
      flags: [],
      questStates: [],
    };

    expect(createDialogueCue(database, event, "line-1")).toEqual({
      id: "line-1",
      speakerName: "Guide",
      speakerNpcId: "npc-1",
      text: "Welcome to town.",
      portraitId: "guide-default",
      soundId: "voice-guide",
      choices: undefined,
    });
  });

  it("executes ifFlag, warp, restoreParty, giveItem, and end against shared runtime state", () => {
    const interpreter = new EventInterpreter();
    const event: EventDefinition = {
      id: "guard-pass-event",
      name: "Guard Pass Event",
      steps: [
        {
          type: "ifFlag",
          flagId: "gate-open",
          steps: [
            { type: "warp", targetMapId: "field", targetSpawnId: "field-gate" },
          ],
        },
        {
          type: "ifNotFlag",
          flagId: "chest-opened",
          steps: [
            { type: "restoreParty" },
            { type: "giveItem", itemId: "herb", quantity: 1 },
            { type: "setFlag", flagId: "chest-opened" },
          ],
        },
        { type: "end" },
        { type: "giveItem", itemId: "herb", quantity: 99 },
      ],
    };
    const database: ContentDatabase = {
      packs: [],
      maps: [
        {
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
        },
        {
          id: "field",
          name: "Field",
          width: 5,
          height: 5,
          tileWidth: 16,
          tileHeight: 16,
          tileLayers: [{ id: "ground", name: "Ground", width: 5, height: 5, tiles: Array.from({ length: 25 }, () => 1) }],
          collisionLayers: [{ id: "collision", name: "Collision", width: 5, height: 5, blocked: Array.from({ length: 25 }, () => 0) }],
          portals: [],
          spawnPoints: [{ id: "field-gate", x: 2, y: 2, facing: "right" }],
          npcs: [],
          triggers: [],
        },
      ],
      dialogueLines: [],
      events: [event],
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
      flags: [
        { id: "gate-open", defaultValue: true },
        { id: "chest-opened", defaultValue: false },
      ],
      questStates: [],
    };
    const runtime = createEventRuntime(database, {
      partyStates: {
        hero: {
          memberId: "hero",
          level: 1,
          experience: 0,
          currentHp: 1,
          currentMp: 0,
          statusIds: ["poison"],
          formationSlot: 0,
        },
      },
      world: {
        currentMapId: "town",
        currentSpawnPointId: "town-start",
      },
    });

    interpreter.execute(event, database, runtime);

    expect(runtime.pendingWarp).toEqual({
      mapId: "field",
      spawnPointId: "field-gate",
    });
    expect(runtime.state.world).toEqual({
      currentMapId: "field",
      currentSpawnPointId: "field-gate",
    });
    expect(runtime.state.inventory.items).toEqual([{ itemId: "herb", quantity: 1 }]);
    expect(runtime.state.flags["chest-opened"]).toBe(true);
    expect(runtime.state.partyStates.hero).toEqual({
      memberId: "hero",
      level: 1,
      experience: 0,
      currentHp: 10,
      currentMp: 5,
      statusIds: [],
      formationSlot: 0,
    });
    expect(runtime.ended).toBe(true);
  });
});
