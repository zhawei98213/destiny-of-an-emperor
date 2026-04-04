import { describe, expect, it } from "vitest";
import { buildProgressionGatingReport } from "../../tools/lib/progressionGatingAudit";

describe("progression gating audit", () => {
  it("finds no soft-lock blockers in current imported real chapters", async () => {
    const report = await buildProgressionGatingReport();

    expect(report.progressionStateModel.chapterOrder.length).toBeGreaterThanOrEqual(6);
    expect(report.softLockRiskReport.blockerCount).toBe(0);
    expect(report.softLockRiskReport.nonBlockerCount).toBe(0);

    const chapterSixChecklist = report.chapterChecklists.find((entry) => entry.chapterId === "chapter-06-border-fort");
    expect(chapterSixChecklist).toBeTruthy();
    expect(chapterSixChecklist?.blockedMaps).toEqual([]);

    const borderGate = report.flagGatingReport.find((entry) => entry.eventId === "border-fort-gate-event");
    expect(borderGate).toBeTruthy();
    expect(borderGate?.requiredFlags).toEqual(["border-fort-gate-open"]);
    expect(borderGate?.providerStatus.every((entry) => entry.satisfied)).toBe(true);
  });
});
