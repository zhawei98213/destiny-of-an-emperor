import { describe, expect, it } from "vitest";
import {
  loadGoldenRegressionSuite,
  runGoldenRegression,
  writeGoldenRegressionArtifacts,
} from "./goldenRegressionRunner";

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
    const report = await writeGoldenRegressionArtifacts(await runGoldenRegression());

    expect(report.totals.mismatch).toBe(0);
    expect(report.totals.fail).toBe(0);
    expect(report.totals.pass).toBe(6);
    expect(report.reportDirectory).toContain("reports/regression/latest");
    expect(report.cases[0]?.artifacts?.expectedSnapshotPath).toContain(".expected.snapshot.json");
    expect(report.cases[0]?.artifacts?.actualSnapshotPath).toContain(".actual.snapshot.json");
    expect(report.cases[0]?.artifacts?.diffSnapshotPath).toContain(".diff.snapshot.json");
  });
});
