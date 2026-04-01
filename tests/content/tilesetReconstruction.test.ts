import { describe, expect, it } from "vitest";
import { buildTilesetReconstructionReport, loadTilesetCandidates } from "../../tools/lib/tilesetReconstruction";

describe("tileset reconstruction", () => {
  it("loads the tileset candidate manifest", async () => {
    const manifest = await loadTilesetCandidates();
    expect(manifest.candidates.some((candidate) => candidate.id === "chapter-01-town-main-tileset")).toBe(true);
  });

  it("reports attached reconstructed tilesets and normalization tasks", async () => {
    const report = await buildTilesetReconstructionReport();
    const candidate = report.candidates.find((entry) => entry.candidateId === "chapter-01-town-main-tileset");

    expect(candidate?.runtimeAttached).toBe(true);
    expect(candidate?.logicalAssetKey).toBe("tileset.town");
    expect(report.normalizationPlan.some((task) => task.candidateId === "chapter-01-town-main-tileset")).toBe(true);
    expect(report.summary.errorCount).toBe(0);
  });
});
