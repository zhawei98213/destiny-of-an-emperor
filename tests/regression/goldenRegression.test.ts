import { describe, expect, it } from "vitest";
import { loadGoldenRegressionSuite, runGoldenRegression } from "./goldenRegressionRunner";

describe("golden regression suite", () => {
  it("loads the chapter slice golden cases", async () => {
    const suite = await loadGoldenRegressionSuite();

    expect(suite.version).toBe(1);
    expect(suite.cases).toHaveLength(6);
    expect(suite.cases.map((entry) => entry.id)).toEqual([
      "guard-blocked-without-pass",
      "guard-warp-with-pass",
      "chest-first-open",
      "chest-second-check",
      "field-battle-roundtrip",
      "save-load-restores-runtime",
    ]);
  });

  it("passes the current golden regression chapter slice", async () => {
    const report = await runGoldenRegression();

    expect(report.totals.mismatch).toBe(0);
    expect(report.totals.fail).toBe(0);
    expect(report.totals.pass).toBe(6);
  });
});
