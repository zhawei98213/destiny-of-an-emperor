import { describe, expect, it } from "vitest";
import { buildCharacterSpriteReport, loadCharacterSpriteCandidates } from "../../tools/lib/characterSpriteReconstruction";

describe("character sprite reconstruction", () => {
  it("loads the character sprite candidate manifest", async () => {
    const manifest = await loadCharacterSpriteCandidates();
    expect(manifest.candidates.map((entry) => entry.logicalAssetKey)).toEqual(
      expect.arrayContaining(["npc.guard", "npc.merchant", "npc.guide"]),
    );
  });

  it("builds metadata entries for imported chapter-01 NPC frames", async () => {
    const report = await buildCharacterSpriteReport();
    expect(report.summary.errorCount).toBe(0);
    expect(report.metadata.some((entry) => entry.frameId === "guard-left-stand" && entry.status !== "placeholder")).toBe(true);
    expect(report.metadata.some((entry) => entry.frameId === "merchant-left-stand" && entry.status !== "placeholder")).toBe(true);
    expect(report.metadata.some((entry) => entry.frameId === "guide-down-stand" && entry.status !== "placeholder")).toBe(true);
  });
});
