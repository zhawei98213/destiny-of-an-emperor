import { describe, expect, it } from "vitest";
import {
  buildReferenceIndex,
  buildReferenceReport,
  loadReferenceManifest,
  queryReferenceEntries,
} from "../../tools/lib/referencePipeline";

describe("reference pipeline", () => {
  it("loads and validates the current reference manifest", async () => {
    const manifest = await loadReferenceManifest();
    expect(manifest.format).toBe("reference-manifest-v1");
    expect(manifest.entries.length).toBeGreaterThan(0);
  });

  it("exposes query access for one real chapter subject", async () => {
    const index = buildReferenceIndex(await loadReferenceManifest());
    const entries = queryReferenceEntries(index, {
      chapter: "chapter-01-lou-sang",
      subjectType: "npc",
      subjectId: "town-guard",
    });

    expect(entries.length).toBeGreaterThan(0);
    expect(entries.every((entry) => entry.chapter === "chapter-01-lou-sang")).toBe(true);
  });

  it("reports zero validation errors for the checked-in manifest", async () => {
    const report = await buildReferenceReport();
    expect(report.summary.errorCount).toBe(0);
    expect(report.chapterCoverage.some((chapter) => (
      chapter.chapterId === "chapter-01-lou-sang" && chapter.referenceCount > 0
    ))).toBe(true);
  });
});
