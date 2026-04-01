import { describe, expect, it } from "vitest";
import { buildVisualParityScoreReport } from "../../tools/lib/visualParityScoring";

describe("visual parity scoring", () => {
  it("scores the chapter-01 visual pilot before and after states", async () => {
    const report = await buildVisualParityScoreReport("chapter-01-lou-sang-visual-pilot");

    expect(report.chapterId).toBe("chapter-01-lou-sang");
    expect(report.summary.scoreAfter).toBeGreaterThan(report.summary.scoreBefore);
    expect(report.buckets.some((bucket) => bucket.id === "tilesets" && bucket.scoreAfter === 100)).toBe(true);
    expect(report.buckets.some((bucket) => bucket.id === "npc-sprites" && bucket.scoreAfter === 100)).toBe(true);
    expect(report.buckets.some((bucket) => bucket.id === "ui-assets" && bucket.scoreAfter === 100)).toBe(true);
    expect(report.summary.gameplaySafe).toBe(true);
  });
});
