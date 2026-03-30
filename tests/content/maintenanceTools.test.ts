import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { lintEventJsonFile, writeFormattedEventJsonFile } from "../../tools/lib/eventJsonLint";
import { runNpcPlacementCheck } from "../../tools/lib/npcPlacementCheck";
import { runChapterCompletenessCheck } from "../../tools/lib/chapterCompletenessCheck";

describe("maintenance tools", () => {
  it("formats and lints event json files", async () => {
    const directory = path.join(process.cwd(), ".tmp", "maintenance-tools");
    await mkdir(directory, { recursive: true });
    const filePath = path.join(directory, "story.json");
    await writeFile(
      filePath,
      JSON.stringify({
        events: [{ steps: [{ type: "dialogue", lineId: "a" }, { type: "end" }], id: "evt-a", name: "A" }],
        dialogueLines: [{ text: "A", id: "line-a", speakerName: "系统" }],
        shops: [],
      }),
      "utf8",
    );

    const before = await lintEventJsonFile(filePath);
    expect(before.normalized).toBe(false);
    expect(before.issues).toHaveLength(0);

    await writeFormattedEventJsonFile(filePath);
    const after = await lintEventJsonFile(filePath);
    const formatted = await readFile(filePath, "utf8");

    expect(after.normalized).toBe(true);
    expect(formatted.endsWith("\n")).toBe(true);
  });

  it("passes npc placement and chapter completeness checks for the current curated chapters", async () => {
    const npcReport = await runNpcPlacementCheck();
    const chapterReport = await runChapterCompletenessCheck();

    expect(npcReport.issues).toEqual([]);
    expect(chapterReport.issues.filter((issue) => issue.severity === "error")).toEqual([]);
  });
});
