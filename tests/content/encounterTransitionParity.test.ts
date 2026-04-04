import { describe, expect, it } from "vitest";
import { buildEncounterTransitionParityReport } from "../../tools/lib/encounterTransitionParity";

describe("encounterTransitionParity", () => {
  it("audits at least one real chapter handoff chain", async () => {
    const report = await buildEncounterTransitionParityReport();

    expect(report.auditedChapters).toContain("chapter-05-highland-waystation");
    expect(report.encounterTriggerAudit.some((entry) => entry.kind === "world-to-battle")).toBe(true);
    expect(report.encounterTriggerAudit.some((entry) => entry.kind === "battle-to-world")).toBe(true);
    expect(report.encounterTriggerAudit.some((entry) => entry.kind === "map-to-map")).toBe(true);
  });
});
