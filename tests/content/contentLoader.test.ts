import { describe, expect, it } from "vitest";
import { loadGameContent } from "@/content/contentLoader";
import type { ContentReader } from "@/content/contentLoader";

class StubReader implements ContentReader {
  constructor(private readonly payload: string) {}

  async readText(): Promise<string> {
    return this.payload;
  }
}

describe("content loader", () => {
  it("parses and validates bootstrap content", async () => {
    const reader = new StubReader(JSON.stringify({
      meta: { id: "bootstrap", title: "JRPG Skeleton", version: 1 },
      world: {
        startScene: "WorldScene",
        map: {
          id: "starter-plains",
          name: "Starter Plains",
          width: 20,
          height: 15,
          actors: [{ id: "hero", name: "Hero", x: 10, y: 7 }],
        },
      },
      events: {
        intro: [
          { type: "dialogue", speaker: "Narrator", text: "Hello" },
          { type: "setFlag", flag: "seenIntro", value: true },
          { type: "end" },
        ],
      },
    }));

    const content = await loadGameContent(reader, "memory://bootstrap");
    expect(content.world.map.actors[0]?.id).toBe("hero");
    expect(content.events.intro).toHaveLength(3);
  });
});
