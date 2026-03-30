import { describe, expect, it } from "vitest";
import { buildUiParityReport, formatUiParityReport } from "../../tools/lib/uiParity";

describe("ui parity", () => {
  it("records current ui behavior and flags the major remaining parity gaps", async () => {
    const report = await buildUiParityReport();

    expect(report.totals.total).toBeGreaterThanOrEqual(6);
    expect(report.totals.diverged).toBeGreaterThanOrEqual(3);
    expect(report.cases.some((entry) => entry.id === "chapter-01-lou-sang:shop-flow" && entry.status === "diverged")).toBe(true);
    expect(report.cases.some((entry) => entry.id === "chapter-03-river-ford:battle-command-flow" && entry.status === "diverged")).toBe(true);
    expect(report.cases.some((entry) => entry.id === "chapter-01-lou-sang:save-entry-flow" && entry.status === "diverged")).toBe(true);
  });

  it("formats a readable ui parity summary", async () => {
    const report = await buildUiParityReport();
    const summary = formatUiParityReport(report);

    expect(summary).toContain("UI Parity Report");
    expect(summary).toContain("chapter-01-lou-sang:shop-flow");
    expect(summary).toContain("chapter-03-river-ford:battle-command-flow");
  });
});
