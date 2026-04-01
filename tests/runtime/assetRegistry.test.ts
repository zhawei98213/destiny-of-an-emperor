import { describe, expect, it } from "vitest";
import { AssetRegistry } from "@/assets/assetRegistry";
import { loadContentDatabase, type ContentReader } from "@/content/contentLoader";

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

describe("asset registry", () => {
  it("resolves chapter overrides without changing logical asset keys", async () => {
    const reader = new StubReader({
      "/content/manual/index.json": JSON.stringify({
        root: "/content/manual",
        kind: "manual",
        files: ["asset-registry.content.json", "world.content.json", "story.content.json"],
      }),
      "/content/generated/index.json": JSON.stringify({
        root: "/content/generated",
        kind: "generated",
        files: [],
      }),
      "/content/manual/asset-registry.content.json": JSON.stringify({
        meta: { id: "assets", kind: "manual", version: 1, description: "asset registry" },
        assetBindings: [
          {
            key: "tileset.default",
            category: "tileset",
            state: "placeholder",
            resource: {
              kind: "tileset-palette",
              tileWidth: 16,
              tileHeight: 16,
              tileColors: { "0": "#111111", "1": "#222222" },
              sourceCandidateIds: [],
            },
          },
          {
            key: "npc.default",
            category: "npc-sprite",
            state: "placeholder",
            resource: { kind: "world-placeholder", fillColor: "#aaaaaa", strokeColor: "#111111", accentColor: "#222222" },
          },
          {
            key: "npc.guard",
            category: "npc-sprite",
            state: "placeholder",
            fallbackKey: "npc.default",
            resource: { kind: "world-placeholder", fillColor: "#bbbbbb", strokeColor: "#111111", accentColor: "#222222" },
          },
          {
            key: "ui.panel.default",
            category: "ui-panel",
            state: "placeholder",
            resource: { kind: "panel-style", backgroundColor: "#000000", borderColor: "#ffffff", titleColor: "#ffffff", bodyColor: "#dddddd", accentColor: "#00ffff" },
          },
          {
            key: "ui.dialogue-box",
            category: "ui-panel",
            state: "placeholder",
            fallbackKey: "ui.panel.default",
            resource: { kind: "panel-style", backgroundColor: "#010101", borderColor: "#ffffff", titleColor: "#ffffff", bodyColor: "#dddddd", accentColor: "#00ffff" },
          },
        ],
        assetOverrides: [
          {
            chapterId: "chapter-01",
            mapIds: ["town"],
            assetBindings: [
              {
                key: "tileset.town",
                category: "tileset",
                state: "imported",
                fallbackKey: "tileset.default",
                resource: {
                  kind: "tileset-palette",
                  tileWidth: 16,
                  tileHeight: 16,
                  tileColors: { "0": "#333333", "1": "#444444" },
                  sourceCandidateIds: ["chapter-01-town-main-tileset"],
                },
              },
              {
                key: "npc.guard",
                category: "npc-sprite",
                state: "imported",
                fallbackKey: "npc.default",
                resource: { kind: "sprite-frame", sheetId: "chapter-01", frameId: "guard-left-stand", imagePath: "/assets/chapter-01.png" },
              },
              {
                key: "ui.dialogue-box",
                category: "ui-panel",
                state: "locked",
                fallbackKey: "ui.panel.default",
                resource: { kind: "panel-style", backgroundColor: "#111122", borderColor: "#ffcc00", titleColor: "#ffee88", bodyColor: "#ffffff", accentColor: "#66ccff" },
              },
            ],
          },
        ],
      }),
      "/content/manual/world.content.json": JSON.stringify({
        meta: { id: "world", kind: "manual", version: 1, description: "world" },
        maps: [{
          id: "town",
          name: "Town",
          width: 1,
          height: 1,
          tileWidth: 16,
          tileHeight: 16,
          tileLayers: [{ id: "ground", name: "Ground", width: 1, height: 1, tiles: [0] }],
          collisionLayers: [{ id: "collision", name: "Collision", width: 1, height: 1, blocked: [0] }],
          portals: [],
          spawnPoints: [{ id: "start", x: 0, y: 0, facing: "down" }],
          npcs: [],
          triggers: [],
        }],
        items: [],
        flags: [],
        shops: [],
        partyMembers: [{
          id: "hero",
          name: "Hero",
          level: 1,
          className: "General",
          recruitable: false,
          baseStats: { maxHp: 20, maxMp: 0, attack: 6, defense: 4, speed: 5 },
          growth: { hp: 3, mp: 0, attack: 2, defense: 1, speed: 1 },
          skills: ["focus"],
        }],
        questStates: [],
        skills: [{
          id: "focus",
          name: "Focus",
          description: "Raise morale for one turn.",
          power: 0,
          mpCost: 0,
          target: "self",
        }],
      }),
      "/content/manual/story.content.json": JSON.stringify({
        meta: { id: "story", kind: "manual", version: 1, description: "story" },
        dialogueLines: [],
        events: [],
        shops: [],
      }),
    });

    const database = await loadContentDatabase(reader, ["/content/manual/index.json", "/content/generated/index.json"]);
    const registry = new AssetRegistry(database);

    expect(registry.resolveNpcVisual("guard", { mapId: "field" }).fillColor).toBe("#bbbbbb");
    expect(registry.resolveNpcBinding("guard", { mapId: "town" }).resource.kind).toBe("sprite-frame");
    expect(registry.resolveTilesetPalette("tileset.town", { mapId: "town" }).tileColors["0"]).toBe("#333333");
    expect(registry.resolveTilesetPalette("tileset.field", { mapId: "field" }).tileColors["0"]).toBe("#111111");
    expect(registry.getBindingState("ui.dialogue-box", { mapId: "town" })).toBe("locked");
    expect(registry.resolvePanelStyle("ui.dialogue-box", { mapId: "town" }).borderColor).toBe("#ffcc00");
  });
});
