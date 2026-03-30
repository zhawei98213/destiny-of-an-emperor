import { describe, expect, it } from "vitest";
import {
  formatPerformanceBaselineReport,
  runPerformanceBaseline,
} from "../../tools/lib/performanceBaseline";

describe("performance baseline tooling", () => {
  it("produces comparable metric summaries for the current real-content slice", async () => {
    const report = await runPerformanceBaseline({ iterations: 1 });

    expect([...report.metrics.map((entry) => entry.id)].sort()).toEqual([
      "battle-entry",
      "map-transition",
      "save-load",
      "startup",
    ]);
    expect(report.metrics.every((entry) => entry.averageMs >= 0)).toBe(true);
    expect(report.bottlenecks.length).toBeGreaterThan(0);
    expect(report.findings.runtime.length).toBeGreaterThan(0);
  });

  it("formats a readable summary", async () => {
    const report = await runPerformanceBaseline({ iterations: 1 });
    const summary = formatPerformanceBaselineReport(report);

    expect(summary).toContain("Performance Baseline Report");
    expect(summary).toContain("Boot Pipeline / 启动链路");
    expect(summary).toContain("Battle Entry / 首次进入战斗");
  });
});
