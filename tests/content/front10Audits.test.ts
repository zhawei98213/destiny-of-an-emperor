import { describe, expect, it } from "vitest";
import { buildNpcGlobalStateReport } from "../../tools/lib/npcGlobalStateAudit";
import { buildGlobalTextContinuityReport } from "../../tools/lib/globalTextContinuityAudit";
import { buildOverworldNavigationParityReport } from "../../tools/lib/overworldNavigationParity";

describe("front-10 audits", () => {
  it("builds NPC global state coverage for the imported real slices", async () => {
    const report = await buildNpcGlobalStateReport();

    expect(report.summary.chapterCount).toBeGreaterThanOrEqual(10);
    expect(report.summary.npcCount).toBeGreaterThan(0);
    expect(report.npcVisibilityStateReport.some((entry) => entry.chapterId === "chapter-10-marsh-outpost")).toBe(true);
  });

  it("builds cross-chapter text continuity evidence", async () => {
    const report = await buildGlobalTextContinuityReport();

    expect(report.summary.chapterCount).toBeGreaterThanOrEqual(10);
    expect(report.chapterContinuityNotes.some((entry) => entry.chapterId === "chapter-10-marsh-outpost")).toBe(true);
    expect(report.missingTextLinkageAudit.length).toBe(0);
  });

  it("builds overworld navigation parity from connectivity and progression evidence", async () => {
    const report = await buildOverworldNavigationParityReport();

    expect(report.summary.chapterCount).toBeGreaterThanOrEqual(10);
    expect(report.summary.mapCount).toBeGreaterThan(0);
    expect(report.travelDependencyNotes.some((entry) => entry.chapterId === "chapter-10-marsh-outpost")).toBe(true);
  });
});
