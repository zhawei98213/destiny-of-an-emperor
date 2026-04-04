import { describe, expect, it } from "vitest";
import { buildTextIntegrityReport } from "../../tools/lib/textIntegrity";

describe("text integrity", () => {
  it("builds chapter-level coverage and demo-vs-real text ratio", async () => {
    const report = await buildTextIntegrityReport();

    expect(report.summary.chapterCount).toBe(7);
    expect(report.ratio.demoLineCount).toBeGreaterThan(0);
    expect(report.ratio.realLineCount).toBeGreaterThan(0);
    expect(report.ratio.realSharePercent).toBeGreaterThan(report.ratio.demoSharePercent);

    const chapterThree = report.chapterCoverage.find((entry) => entry.chapterId === "chapter-03-river-ford");
    const chapterFour = report.chapterCoverage.find((entry) => entry.chapterId === "chapter-04-ridgeway-camp");
    const chapterFive = report.chapterCoverage.find((entry) => entry.chapterId === "chapter-05-highland-waystation");
    const chapterSix = report.chapterCoverage.find((entry) => entry.chapterId === "chapter-06-border-fort");
    const chapterSeven = report.chapterCoverage.find((entry) => entry.chapterId === "chapter-07-forward-camp");
    expect(chapterThree?.referencedLineIds).toContain("ford-clerk-line-issue");
    expect(chapterThree?.referencedLineIds).toContain("camp-quartermaster-line");
    expect(chapterThree?.manualCoveragePercent).toBe(100);
    expect(chapterFour?.referencedLineIds).toContain("ridge-runner-line-issue");
    expect(chapterFour?.referencedLineIds).toContain("ridge-quartermaster-line");
    expect(chapterFour?.manualCoveragePercent).toBe(100);
    expect(chapterFive?.referencedLineIds).toContain("pass-courier-line-issue");
    expect(chapterFive?.referencedLineIds).toContain("supply-steward-line");
    expect(chapterFive?.manualCoveragePercent).toBe(100);
    expect(chapterSix?.referencedLineIds).toContain("border-clerk-line-issue");
    expect(chapterSix?.referencedLineIds).toContain("fort-healer-line");
    expect(chapterSix?.manualCoveragePercent).toBe(100);
    expect(chapterSeven?.referencedLineIds).toContain("fort-adjutant-line-issue-1");
    expect(chapterSeven?.referencedLineIds).toContain("forward-camp-shop-line");
    expect(chapterSeven?.manualCoveragePercent).toBe(100);

    expect(report.issues.some((issue) => issue.type === "missing-style")).toBe(true);
    expect(report.issues.some((issue) => issue.type === "missing-line-reference")).toBe(false);
  });
});
