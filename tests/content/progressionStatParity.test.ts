import { describe, expect, it } from "vitest";
import { buildProgressionStatParityReport } from "../../tools/lib/progressionStatParity";

describe("progressionStatParity", () => {
  it("builds a structured chapter growth report", async () => {
    const report = await buildProgressionStatParityReport();

    expect(report.partyGrowthReport.length).toBeGreaterThanOrEqual(6);
    expect(report.levelStatCurveSummary.length).toBe(report.partyGrowthReport.length);
  });
});
