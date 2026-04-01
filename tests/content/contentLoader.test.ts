import { describe, expect, it } from "vitest";
import { loadContentDatabase } from "@/content/contentLoader";
import type { ContentReader } from "@/content/contentLoader";

class StubReader implements ContentReader {
  constructor(private readonly files: Record<string, string>) {}

  async readText(path: string): Promise<string> {
    const entry = this.files[path];
    if (!entry) {
      throw new Error(`Missing stub content for ${path}`);
    }

    return entry;
  }
}

describe("content loader", () => {
  it("loads manual and generated content through one database", async () => {
    const starterMapTiles = Array.from({ length: 20 * 15 }, () => 1);
    const starterMapCollision = Array.from({ length: 20 * 15 }, () => 0);

    const reader = new StubReader({
      "/content/manual/index.json": JSON.stringify({
        root: "/content/manual",
        kind: "manual",
        files: ["asset-registry.content.json", "world.content.json", "story.content.json"],
      }),
      "/content/generated/index.json": JSON.stringify({
        root: "/content/generated",
        kind: "generated",
        files: ["battle.content.json"],
      }),
      "/content/manual/asset-registry.content.json": JSON.stringify({
        meta: {
          id: "assets-manual",
          kind: "manual",
          version: 1,
          description: "manual asset registry",
        },
        assetBindings: [
          {
            key: "npc.default",
            category: "npc-sprite",
            state: "placeholder",
            resource: { kind: "world-placeholder", fillColor: "#aaaaaa", strokeColor: "#111111", accentColor: "#222222" },
          },
          {
            key: "npc.hero",
            category: "npc-sprite",
            state: "placeholder",
            fallbackKey: "npc.default",
            resource: { kind: "world-placeholder", fillColor: "#bbbbbb", strokeColor: "#111111", accentColor: "#222222" },
          },
          {
            key: "portrait.hero-default",
            category: "portrait",
            state: "placeholder",
            resource: { kind: "portrait-placeholder", backgroundColor: "#111111", borderColor: "#eeeeee", textColor: "#ffffff" },
          },
          {
            key: "audio.voice-hero",
            category: "audio",
            state: "placeholder",
            resource: { kind: "audio-ref" },
          },
          {
            key: "audio.sfx-shop-open",
            category: "audio",
            state: "placeholder",
            resource: { kind: "audio-ref" },
          },
        ],
        assetOverrides: [],
      }),
      "/content/manual/world.content.json": JSON.stringify({
        meta: {
          id: "world-manual",
          kind: "manual",
          version: 1,
          description: "manual world content",
        },
        maps: [
          {
            id: "starter-plains",
            name: "Starter Plains",
            width: 20,
            height: 15,
            tileWidth: 16,
            tileHeight: 16,
            tileLayers: [{ id: "ground", name: "Ground", width: 20, height: 15, tiles: starterMapTiles }],
            collisionLayers: [{ id: "collision", name: "Collision", width: 20, height: 15, blocked: starterMapCollision }],
            portals: [],
            spawnPoints: [{ id: "hero-start", x: 8, y: 7, facing: "down" }],
            npcs: [{ id: "liu-bei", name: "Liu Bei", x: 9, y: 7, sprite: "hero", facing: "down", behavior: "idle", eventId: "intro-event" }],
            triggers: [{ id: "intro-trigger", kind: "tile", x: 8, y: 7, width: 1, height: 1, eventId: "intro-event", once: true }],
          },
        ],
        flags: [{ id: "intro-complete", defaultValue: false }],
        questStates: [{ id: "yellow-turban", stages: ["not-started", "started"], initialStage: "not-started" }],
        items: [{ id: "herb", name: "Herb", description: "Restore HP", kind: "consumable", price: 10 }],
        skills: [{ id: "focus", name: "Focus", description: "Steady yourself", mpCost: 0, power: 0, target: "self" }],
        partyMembers: [{
          id: "liu-bei",
          name: "Liu Bei",
          className: "Lord",
          level: 1,
          skills: ["focus"],
          baseStats: { maxHp: 20, maxMp: 5, attack: 8, defense: 6, speed: 5 },
        }],
      }),
      "/content/manual/story.content.json": JSON.stringify({
        meta: {
          id: "story-manual",
          kind: "manual",
          version: 1,
          description: "manual story content",
        },
        dialogueLines: [{ id: "line-1", speakerName: "Liu Bei", speakerNpcId: "liu-bei", text: "We should move.", portraitId: "hero-default", soundId: "voice-hero" }],
        events: [{
          id: "intro-event",
          name: "Intro Event",
          steps: [
            { type: "dialogue", lineId: "line-1" },
            { type: "setFlag", flagId: "intro-complete", value: true },
            { type: "openShop", shopId: "starter-shop" },
            { type: "startBattle", battleGroupId: "starter-slimes" },
            { type: "end" },
          ],
        }],
        shops: [{ id: "starter-shop", name: "Starter Shop", inventory: [{ itemId: "herb", price: 12 }] }],
      }),
      "/content/generated/battle.content.json": JSON.stringify({
        meta: {
          id: "battle-generated",
          kind: "generated",
          version: 1,
          description: "generated battle content",
        },
        enemies: [{
          id: "slime",
          name: "Slime",
          level: 1,
          skills: ["focus"],
          rewardGold: 5,
          rewardExperience: 3,
          dropItems: [],
          baseStats: { maxHp: 10, maxMp: 0, attack: 4, defense: 2, speed: 3 },
        }],
        battleGroups: [{ id: "starter-slimes", name: "Starter Slimes", enemyIds: ["slime"] }],
      }),
    });

    const content = await loadContentDatabase(reader, [
      "/content/manual/index.json",
      "/content/generated/index.json",
    ]);

    expect(content.maps[0]?.id).toBe("starter-plains");
    expect(content.events[0]?.steps).toHaveLength(5);
    expect(content.battleGroups[0]?.enemyIds[0]).toBe("slime");
    expect((content.assetBindings ?? []).some((entry) => entry.key === "npc.hero")).toBe(true);
  });
});
