import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildBattleParityReport } from "../../tools/lib/battleParity";

describe("battle parity", () => {
  it("calibrates the current real battle slices against regression-backed baselines", async () => {
    const report = await buildBattleParityReport({
      regressionReportPath: path.resolve(process.cwd(), "reports/regression/latest/report.json"),
    });

    expect(report.totals.totalCases).toBe(8);
    expect(report.totals.failedCases).toBe(0);

    const louSang = report.cases.find((entry) => entry.id === "lou-sang-field-training");
    const eastRoad = report.cases.find((entry) => entry.id === "east-road-wolf-skirmish");
    const waystation = report.cases.find((entry) => entry.id === "waystation-gate-outlaw-baseline");
    const forwardCamp = report.cases.find((entry) => entry.id === "forward-camp-outlaw-baseline");
    const bridgehead = report.cases.find((entry) => entry.id === "bridgehead-outlaw-baseline");
    const riverWatch = report.cases.find((entry) => entry.id === "river-watch-outlaw-baseline");
    const marsh = report.cases.find((entry) => entry.id === "marsh-road-outlaw-baseline");
    const reedFerry = report.cases.find((entry) => entry.id === "reed-ferry-road-outlaw-baseline");

    expect(louSang?.calibrated).toBe(true);
    expect(louSang?.dimensions.find((entry) => entry.id === "turn-order")?.status).toBe("pass");
    expect(eastRoad?.calibrated).toBe(true);
    expect(eastRoad?.dimensions.find((entry) => entry.id === "world-return")?.status).toBe("pass");
    expect(waystation?.calibrated).toBe(true);
    expect(forwardCamp?.calibrated).toBe(true);
    expect(bridgehead?.calibrated).toBe(true);
    expect(riverWatch?.calibrated).toBe(true);
    expect(marsh?.calibrated).toBe(true);
    expect(reedFerry?.calibrated).toBe(true);
  });
});
