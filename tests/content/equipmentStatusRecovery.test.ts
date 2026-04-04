import { describe, expect, it } from "vitest";
import { buildEquipmentStatusRecoveryReport } from "../../tools/lib/equipmentStatusRecovery";

describe("equipmentStatusRecovery", () => {
  it("captures at least one calibrated recovery flow for a real chapter", async () => {
    const report = await buildEquipmentStatusRecoveryReport();

    expect(report.innHealSavePointBehaviorAudit.some((entry) => entry.status === "calibrated")).toBe(true);
  });
});
