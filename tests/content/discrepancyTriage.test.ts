import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildDiscrepancyTriageReport } from "../../tools/lib/discrepancyTriage";

describe("discrepancy triage", () => {
  it("builds a repair backlog with grouped priorities from parity and regression evidence", async () => {
    const report = await buildDiscrepancyTriageReport({
      parityReportPath: path.resolve(process.cwd(), "reports/parity/latest/report.json"),
      regressionReportPath: path.resolve(process.cwd(), "reports/regression/latest/report.json"),
    });

    expect(report.summary.totalItems).toBeGreaterThan(0);
    expect(report.summary.byPriority.P0).toBeGreaterThan(0);

    const spatialLock = report.backlog.find((entry) => entry.id === "chapter-01-lou-sang:spatial-parity");
    expect(spatialLock?.priority).toBe("P0");
    expect(spatialLock?.suggestedRepairTargets.some((entry) => entry.endsWith("content/manual/world.content.json"))).toBe(true);

    const saveRestore = report.backlog.find((entry) => entry.id === "chapter-02-east-road-relay:save-restore");
    expect(saveRestore?.priority).toBe("P0");
    expect(saveRestore?.dependencies).toEqual([]);

    const dialoguePolish = report.backlog.find((entry) => entry.id === "chapter-01-lou-sang:dialogue-polish");
    expect(dialoguePolish?.priority).toBe("P3");
  });
});
