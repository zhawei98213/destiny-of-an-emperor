import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildParityScoreReport } from "../../tools/lib/parityScoring";

describe("parity scoring", () => {
  it("scores the imported real chapters with structured blocker guidance", async () => {
    const report = await buildParityScoreReport({
      chapterDirectory: path.resolve(process.cwd(), "content/manual/chapters"),
      regressionReportPath: path.resolve(process.cwd(), "reports/regression/latest/report.json"),
    });

    expect(report.totals.chapterCount).toBe(4);

    const chapterOne = report.chapters.find((entry) => entry.chapterId === "chapter-01-lou-sang");
    const chapterTwo = report.chapters.find((entry) => entry.chapterId === "chapter-02-east-road-relay");
    const chapterThree = report.chapters.find((entry) => entry.chapterId === "chapter-03-river-ford");
    const chapterFour = report.chapters.find((entry) => entry.chapterId === "chapter-04-ridgeway-camp");

    expect(chapterOne?.dimensions.find((entry) => entry.id === "shop-consistency")?.applicable).toBe(true);
    expect(chapterOne?.dimensions.find((entry) => entry.id === "save-restore")?.score).toBe(100);

    expect(chapterTwo?.dimensions.find((entry) => entry.id === "shop-consistency")?.applicable).toBe(false);
    expect(chapterTwo?.dimensions.find((entry) => entry.id === "save-restore")?.score).toBe(40);
    expect(chapterTwo?.blockers.some((entry) => entry.includes("No chapter-specific save/load regression case is bound"))).toBe(true);

    expect(chapterThree?.dimensions.find((entry) => entry.id === "shop-consistency")?.applicable).toBe(true);
    expect(chapterThree?.dimensions.find((entry) => entry.id === "battle-rewards")?.score).toBeGreaterThan(0);
    expect(chapterFour?.dimensions.find((entry) => entry.id === "shop-consistency")?.applicable).toBe(true);
    expect(chapterFour?.dimensions.find((entry) => entry.id === "battle-rewards")?.score).toBeGreaterThan(0);
  });
});
