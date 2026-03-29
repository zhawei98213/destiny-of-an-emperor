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
    expect(suite.cases).toHaveLength(14);
    expect(suite.cases.map((entry) => entry.id)).toEqual([
      "guard-blocked-without-pass",
      "guard-opens-gate-with-pass",
      "guard-opens-gate-with-legacy-flag",
      "east-exit-warp-after-guard-opens-gate",
      "chest-first-open",
      "chest-second-check",
      "shop-counter-opens-shop-state",
      "field-battle-roundtrip",
      "save-load-restores-runtime",
      "field-east-road-warp",
      "road-scout-talk",
      "relay-rest-recovers-party",
      "relay-cache-first-open",
      "east-road-battle-roundtrip",
    ]);
  });

  it("passes the current golden regression chapter slice", async () => {
    const report = await writeGoldenRegressionArtifacts(await runGoldenRegression());

    expect(report.totals.mismatch).toBe(0);
    expect(report.totals.fail).toBe(0);
    expect(report.totals.pass).toBe(14);
    expect(report.reportDirectory).toContain("reports/regression/latest");
    expect(report.cases[0]?.artifacts?.expectedSnapshotPath).toContain(".expected.snapshot.json");
    expect(report.cases[0]?.artifacts?.actualSnapshotPath).toContain(".actual.snapshot.json");
    expect(report.cases[0]?.artifacts?.diffSnapshotPath).toContain(".diff.snapshot.json");
  });
});
