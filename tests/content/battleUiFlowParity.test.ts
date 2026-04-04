import { describe, expect, it } from "vitest";
import { buildBattleUiFlowReport } from "../../tools/lib/battleUiFlowParity";

describe("battleUiFlowParity", () => {
  it("records at least three graded battle UI flow differences", async () => {
    const report = await buildBattleUiFlowReport();

    expect(report.totals.total).toBeGreaterThanOrEqual(5);
    expect(report.cases.filter((entry) => entry.status === "diverged").length).toBeGreaterThanOrEqual(3);
    expect(report.cases.every((entry) => entry.priority)).toBe(true);
  });
});
