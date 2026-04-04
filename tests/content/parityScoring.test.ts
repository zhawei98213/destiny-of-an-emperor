import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildParityScoreReport } from "../../tools/lib/parityScoring";

describe("parity scoring", () => {
  it("scores the imported real chapters with structured blocker guidance", async () => {
    const report = await buildParityScoreReport({
      chapterDirectory: path.resolve(process.cwd(), "content/manual/chapters"),
      regressionReportPath: path.resolve(process.cwd(), "reports/regression/latest/report.json"),
    });

    expect(report.totals.chapterCount).toBe(9);

    const chapterOne = report.chapters.find((entry) => entry.chapterId === "chapter-01-lou-sang");
    const chapterTwo = report.chapters.find((entry) => entry.chapterId === "chapter-02-east-road-relay");
    const chapterThree = report.chapters.find((entry) => entry.chapterId === "chapter-03-river-ford");
    const chapterFour = report.chapters.find((entry) => entry.chapterId === "chapter-04-ridgeway-camp");
    const chapterFive = report.chapters.find((entry) => entry.chapterId === "chapter-05-highland-waystation");
    const chapterSix = report.chapters.find((entry) => entry.chapterId === "chapter-06-border-fort");
    const chapterSeven = report.chapters.find((entry) => entry.chapterId === "chapter-07-forward-camp");
    const chapterEight = report.chapters.find((entry) => entry.chapterId === "chapter-08-bridgehead-post");
    const chapterNine = report.chapters.find((entry) => entry.chapterId === "chapter-09-river-watch-post");

    expect(chapterOne?.dimensions.find((entry) => entry.id === "shop-consistency")?.applicable).toBe(true);
    expect(chapterOne?.dimensions.find((entry) => entry.id === "save-restore")?.score).toBe(100);

    expect(chapterTwo?.dimensions.find((entry) => entry.id === "shop-consistency")?.applicable).toBe(false);
    expect(chapterTwo?.dimensions.find((entry) => entry.id === "save-restore")?.score).toBe(40);
    expect(chapterTwo?.blockers.some((entry) => entry.includes("No chapter-specific save/load regression case is bound"))).toBe(true);

    expect(chapterThree?.dimensions.find((entry) => entry.id === "shop-consistency")?.applicable).toBe(true);
    expect(chapterThree?.dimensions.find((entry) => entry.id === "battle-rewards")?.score).toBeGreaterThan(0);
    expect(chapterFour?.dimensions.find((entry) => entry.id === "shop-consistency")?.applicable).toBe(true);
    expect(chapterFour?.dimensions.find((entry) => entry.id === "battle-rewards")?.score).toBeGreaterThan(0);
    expect(chapterFive?.dimensions.find((entry) => entry.id === "shop-consistency")?.applicable).toBe(true);
    expect(chapterFive?.dimensions.find((entry) => entry.id === "battle-rewards")?.score).toBeGreaterThan(0);
    expect(chapterSix?.dimensions.find((entry) => entry.id === "shop-consistency")?.applicable).toBe(false);
    expect(chapterSix?.dimensions.find((entry) => entry.id === "battle-rewards")?.score).toBeGreaterThan(0);
    expect(chapterSeven?.dimensions.find((entry) => entry.id === "shop-consistency")?.applicable).toBe(true);
    expect(chapterSeven?.dimensions.find((entry) => entry.id === "battle-rewards")?.score).toBeGreaterThan(0);
    expect(chapterEight?.dimensions.find((entry) => entry.id === "shop-consistency")?.applicable).toBe(true);
    expect(chapterEight?.dimensions.find((entry) => entry.id === "battle-rewards")?.score).toBeGreaterThan(0);
    expect(chapterNine?.dimensions.find((entry) => entry.id === "shop-consistency")?.applicable).toBe(true);
    expect(chapterNine?.dimensions.find((entry) => entry.id === "battle-rewards")?.score).toBeGreaterThan(0);
  });
});
