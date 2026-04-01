import { describe, expect, it } from "vitest";
import { buildTextIntegrityReport } from "../../tools/lib/textIntegrity";

describe("text integrity", () => {
  it("builds chapter-level coverage and demo-vs-real text ratio", async () => {
    const report = await buildTextIntegrityReport();

    expect(report.summary.chapterCount).toBe(5);
    expect(report.ratio.demoLineCount).toBeGreaterThan(0);
    expect(report.ratio.realLineCount).toBeGreaterThan(0);
    expect(report.ratio.realSharePercent).toBeGreaterThan(report.ratio.demoSharePercent);

    const chapterThree = report.chapterCoverage.find((entry) => entry.chapterId === "chapter-03-river-ford");
    const chapterFour = report.chapterCoverage.find((entry) => entry.chapterId === "chapter-04-ridgeway-camp");
    const chapterFive = report.chapterCoverage.find((entry) => entry.chapterId === "chapter-05-highland-waystation");
    expect(chapterThree?.referencedLineIds).toContain("ford-clerk-line-issue");
    expect(chapterThree?.referencedLineIds).toContain("camp-quartermaster-line");
    expect(chapterThree?.manualCoveragePercent).toBe(100);
    expect(chapterFour?.referencedLineIds).toContain("ridge-runner-line-issue");
    expect(chapterFour?.referencedLineIds).toContain("ridge-quartermaster-line");
    expect(chapterFour?.manualCoveragePercent).toBe(100);
    expect(chapterFive?.referencedLineIds).toContain("pass-courier-line-issue");
    expect(chapterFive?.referencedLineIds).toContain("supply-steward-line");
    expect(chapterFive?.manualCoveragePercent).toBe(100);

    expect(report.issues.some((issue) => issue.type === "missing-style")).toBe(true);
    expect(report.issues.some((issue) => issue.type === "missing-line-reference")).toBe(false);
  });
});
