import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  loadAllChapterMetadata,
  validateChapterMetadata,
} from "../../tools/lib/chapterMetadata";

describe("chapter metadata", () => {
  it("loads chapter metadata records from content/manual/chapters", async () => {
    const chapters = await loadAllChapterMetadata(
      path.resolve(process.cwd(), "content/manual/chapters"),
    );

    expect(chapters.map((entry) => entry.chapterId)).toEqual([
      "chapter-01-lou-sang",
      "chapter-02-east-road-relay",
      "chapter-03-river-ford",
      "chapter-04-ridgeway-camp",
      "chapter-template",
    ]);
    expect(chapters.find((entry) => entry.chapterId === "chapter-01-lou-sang")?.maps).toEqual([
      "town",
      "field",
    ]);
    expect(chapters.find((entry) => entry.chapterId === "chapter-02-east-road-relay")?.maps).toEqual([
      "east-road",
      "relay-post",
    ]);
    expect(chapters.find((entry) => entry.chapterId === "chapter-03-river-ford")?.maps).toEqual([
      "relay-east-pass",
      "river-ford",
      "ford-camp",
    ]);
    expect(chapters.find((entry) => entry.chapterId === "chapter-04-ridgeway-camp")?.status).toBe("planned");
  });

  it("rejects unsupported chapter status values with exact field errors", () => {
    expect(() => validateChapterMetadata({
      format: "chapter-metadata-v1",
      chapterId: "bad-chapter",
      title: "Bad Chapter",
      areaLabel: "Bad Area",
      status: "done",
      maps: [],
      npcs: [],
      events: [],
      shops: [],
      enemyGroups: [],
      regressionCases: [],
      paritySummary: {
        mapLayout: "planned",
        collision: "planned",
        npcPlacement: "planned",
        dialogue: "planned",
        events: "planned",
        flags: "planned",
        transitions: "planned",
        items: "planned",
        shops: "planned",
        battles: "planned",
      },
      notes: "invalid",
    }, "bad-chapter.json")).toThrowError(/bad-chapter\.json:status must be one of/);
  });
});
