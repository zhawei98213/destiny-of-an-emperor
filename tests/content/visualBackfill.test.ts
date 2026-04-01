import { describe, expect, it } from "vitest";
import { buildVisualBackfillReport, validateVisualBackfillPlans } from "../../tools/lib/visualBackfill";

describe("visual backfill workflow", () => {
  it("validates plan files for registry-only batches", async () => {
    const plans = await validateVisualBackfillPlans();

    expect(plans.some((entry) => entry.planId === "chapter-01-lou-sang-ui-batch")).toBe(true);
  });

  it("builds a chapter-local before/after report for the proven chapter-01 batch", async () => {
    const report = await buildVisualBackfillReport("chapter-01-lou-sang-ui-batch");

    expect(report.chapterId).toBe("chapter-01-lou-sang");
    expect(report.summary.entryCount).toBeGreaterThanOrEqual(10);
    expect(report.summary.lockedCount).toBeGreaterThanOrEqual(10);
    expect(report.summary.gameplaySafe).toBe(true);
    expect(report.summary.uiLayoutSafe).toBe(true);
    expect(report.entries.every((entry) => entry.effectiveState === "locked")).toBe(true);
  });
});
