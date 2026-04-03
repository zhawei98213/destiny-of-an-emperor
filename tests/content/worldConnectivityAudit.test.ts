import { describe, expect, it } from "vitest";
import { buildWorldConnectivityReport } from "../../tools/lib/worldConnectivityAudit";

describe("world connectivity audit", () => {
  it("passes connectivity checks for current imported real chapters", async () => {
    const report = await buildWorldConnectivityReport();

    expect(report.summary.chapterCount).toBeGreaterThanOrEqual(6);
    expect(report.summary.mapCount).toBeGreaterThanOrEqual(15);
    expect(report.summary.edgeCount).toBeGreaterThan(0);
    expect(report.summary.errorCount).toBe(0);
    expect(report.summary.issueCount).toBe(0);

    const chapterSix = report.chapters.find((entry) => entry.chapterId === "chapter-06-border-fort");
    expect(chapterSix).toBeTruthy();
    expect(chapterSix?.issueCount).toBe(0);
    expect(report.graph.edges.some((edge) => edge.sourceMapId === "border-road" && edge.targetMapId === "border-fort-yard")).toBe(true);
  });
});
