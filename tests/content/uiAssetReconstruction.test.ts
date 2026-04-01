import { describe, expect, it } from "vitest";
import { buildUiAssetReconstructionReport } from "../../tools/lib/uiAssetReconstruction";

describe("ui asset reconstruction", () => {
  it("reports attached reconstructed UI assets for the first real chapter", async () => {
    const report = await buildUiAssetReconstructionReport();

    expect(report.summary.entryCount).toBeGreaterThan(0);
    expect(report.summary.reconstructedPanelCount).toBeGreaterThan(0);
    expect(report.summary.errorCount).toBe(0);

    const chapterOne = report.chapters.find((entry) => entry.chapterId === "chapter-01-lou-sang");
    expect(chapterOne).toBeTruthy();
    expect(chapterOne?.attachedCount).toBeGreaterThan(0);
    expect(report.entries.some((entry) => entry.logicalAssetKey === "ui.dialogue-box" && entry.runtimeAttached)).toBe(true);
  });
});
