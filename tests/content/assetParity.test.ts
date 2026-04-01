import { describe, expect, it } from "vitest";
import { buildAssetParityReport } from "../../tools/lib/assetParity";

describe("asset parity", () => {
  it("reports placeholder asset categories for the current real chapters", async () => {
    const report = await buildAssetParityReport();

    expect(report.summary.chapterCount).toBeGreaterThanOrEqual(2);
    expect(report.summary.placeholderCategories).toBeGreaterThan(0);

    const chapterOne = report.chapters.find((entry) => entry.chapterId === "chapter-01-lou-sang");
    expect(chapterOne).toBeTruthy();
    expect(chapterOne?.categories.find((entry) => entry.id === "ui-panels")?.status).toBe("locked");
    expect(chapterOne?.categories.find((entry) => entry.id === "icons")?.status).toBe("locked");
    expect(chapterOne?.categories.find((entry) => entry.id === "audio")?.status).toBe("placeholder");
    expect(report.issues.some((issue) => issue.type === "broken-reference")).toBe(true);
  });
});
