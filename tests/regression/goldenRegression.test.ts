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
    expect(suite.cases).toHaveLength(39);
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
      "relay-post-east-warp",
      "ford-clerk-issues-seal",
      "ford-guard-opens-crossing",
      "ford-east-crossing-warps",
      "camp-quartermaster-opens-shop",
      "ford-camp-cache-first-open",
      "relay-east-pass-battle-roundtrip",
      "river-ford-battle-roundtrip",
      "ridge-runner-issues-token",
      "watch-clerk-dialogue",
      "watch-guard-opens-gate",
      "ridgeway-east-gate-warps",
      "ridge-quartermaster-opens-shop",
      "ridgeway-cache-first-open",
      "ridgeway-west-pass-battle-roundtrip",
      "ridgeway-watch-battle-roundtrip",
      "pass-courier-issues-badge",
      "pass-scout-dialogue",
      "gate-captain-opens-east-gate",
      "highland-east-gate-warps",
      "supply-steward-opens-shop",
      "supply-cache-first-open",
      "highland-pass-battle-roundtrip",
      "waystation-gate-battle-roundtrip",
      "highland-save-load-restores-runtime",
    ]);
  });

  it("passes the current golden regression chapter slice", async () => {
    const report = await writeGoldenRegressionArtifacts(await runGoldenRegression());

    expect(report.totals.mismatch).toBe(0);
    expect(report.totals.fail).toBe(0);
    expect(report.totals.pass).toBe(39);
    expect(report.reportDirectory).toContain("reports/regression/latest");
    expect(report.cases[0]?.artifacts?.expectedSnapshotPath).toContain(".expected.snapshot.json");
    expect(report.cases[0]?.artifacts?.actualSnapshotPath).toContain(".actual.snapshot.json");
    expect(report.cases[0]?.artifacts?.diffSnapshotPath).toContain(".diff.snapshot.json");
  });
});
