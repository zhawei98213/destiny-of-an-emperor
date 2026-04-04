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
      encounterTables: [],
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
      encounterTables: [],
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

  it("executes ifFlag, ifHasItem, warp, restoreParty, giveItem, and end against shared runtime state", () => {
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
            {
              type: "ifHasItem",
              itemId: "travel-pass",
              steps: [{ type: "setFlag", flagId: "gate-open" }],
            },
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
      items: [
        { id: "herb", name: "Herb", description: "HP", kind: "consumable", price: 10 },
        { id: "travel-pass", name: "Travel Pass", description: "Permit", kind: "key", price: 0 },
      ],
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
      encounterTables: [],
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
      inventory: {
        gold: 0,
        items: [{ itemId: "travel-pass", quantity: 1 }],
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
      playerX: 1,
      playerY: 1,
      facing: "down",
      stepCount: 0,
    });
    expect(runtime.state.inventory.items).toEqual([
      { itemId: "travel-pass", quantity: 1 },
      { itemId: "herb", quantity: 1 },
    ]);
    expect(runtime.state.flags["gate-open"]).toBe(true);
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

  it("supports elseSteps on shared conditional opcodes without breaking legacy branches", () => {
    const interpreter = new EventInterpreter();
    const event: EventDefinition = {
      id: "conditional-else-event",
      name: "Conditional Else Event",
      steps: [
        {
          type: "ifHasItem",
          itemId: "permit",
          steps: [
            { type: "setFlag", flagId: "has-permit" },
          ],
          elseSteps: [
            { type: "setFlag", flagId: "missing-permit" },
          ],
        },
        {
          type: "ifFlag",
          flagId: "has-permit",
          steps: [
            { type: "dialogue", lineId: "line-open" },
          ],
          elseSteps: [
            { type: "dialogue", lineId: "line-blocked" },
          ],
        },
        {
          type: "ifNotFlag",
          flagId: "has-permit",
          steps: [
            { type: "setFlag", flagId: "fallback-ran" },
          ],
          elseSteps: [
            { type: "setFlag", flagId: "fallback-skipped" },
          ],
        },
        { type: "end" },
      ],
    };
    const database: ContentDatabase = {
      packs: [],
      maps: [],
      dialogueLines: [
        { id: "line-open", speakerName: "Guard", text: "Open" },
        { id: "line-blocked", speakerName: "Guard", text: "Blocked" },
      ],
      events: [event],
      items: [
        { id: "permit", name: "Permit", description: "Permit", kind: "key", price: 0 },
      ],
      partyMembers: [],
      enemies: [],
      battleGroups: [],
      shops: [],
      skills: [],
      flags: [
        { id: "has-permit", defaultValue: false },
        { id: "missing-permit", defaultValue: false },
        { id: "fallback-ran", defaultValue: false },
        { id: "fallback-skipped", defaultValue: false },
      ],
      questStates: [],
      encounterTables: [],
    };

    const withoutPermit = createEventRuntime(database, {
      inventory: { gold: 0, items: [] },
    });
    interpreter.execute(event, database, withoutPermit);

    expect(withoutPermit.state.flags["missing-permit"]).toBe(true);
    expect(withoutPermit.state.flags["has-permit"]).toBe(false);
    expect(withoutPermit.state.flags["fallback-ran"]).toBe(true);
    expect(withoutPermit.state.flags["fallback-skipped"]).toBe(false);
    expect(withoutPermit.dialogueLog.map((entry) => entry.id)).toEqual(["line-blocked"]);

    const withPermit = createEventRuntime(database, {
      inventory: { gold: 0, items: [{ itemId: "permit", quantity: 1 }] },
    });
    interpreter.execute(event, database, withPermit);

    expect(withPermit.state.flags["has-permit"]).toBe(true);
    expect(withPermit.state.flags["missing-permit"]).toBe(false);
    expect(withPermit.state.flags["fallback-ran"]).toBe(false);
    expect(withPermit.state.flags["fallback-skipped"]).toBe(true);
    expect(withPermit.dialogueLog.map((entry) => entry.id)).toEqual(["line-open"]);
  });

  it("supports player-facing and scripted movement steps for cutscene-style events", () => {
    const interpreter = new EventInterpreter();
    const event: EventDefinition = {
      id: "escort-step-event",
      name: "Escort Step Event",
      steps: [
        { type: "facePlayer", facing: "right" },
        { type: "movePlayer", direction: "right", distance: 2 },
        { type: "dialogue", lineId: "line-forward" },
        { type: "end" },
      ],
    };
    const database: ContentDatabase = {
      packs: [],
      maps: [
        {
          id: "road",
          name: "Road",
          width: 6,
          height: 4,
          tileWidth: 16,
          tileHeight: 16,
          tileLayers: [{ id: "ground", name: "Ground", width: 6, height: 4, tiles: Array.from({ length: 24 }, () => 1) }],
          collisionLayers: [{ id: "collision", name: "Collision", width: 6, height: 4, blocked: Array.from({ length: 24 }, () => 0) }],
          portals: [],
          spawnPoints: [{ id: "road-start", x: 1, y: 1, facing: "down" }],
          npcs: [],
          triggers: [],
        },
      ],
      dialogueLines: [
        { id: "line-forward", speakerName: "系统", text: "你被催着向前移动了两步。", soundId: "sfx-step" },
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
      encounterTables: [],
    };
    const runtime = createEventRuntime(database, {
      world: {
        currentMapId: "road",
        currentSpawnPointId: "road-start",
        playerX: 1,
        playerY: 1,
        facing: "down",
        stepCount: 3,
      },
    });

    interpreter.execute(event, database, runtime);

    expect(runtime.state.world).toEqual({
      currentMapId: "road",
      currentSpawnPointId: "road-start",
      playerX: 3,
      playerY: 1,
      facing: "right",
      stepCount: 5,
    });
    expect(runtime.dialogueLog.map((entry) => entry.id)).toEqual(["line-forward"]);
  });
});
