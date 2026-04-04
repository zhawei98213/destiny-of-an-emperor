import { describe, expect, it } from "vitest";
import {
  buildBattleEnemyGroupImportReport,
  buildBattleParityChecklistReport,
  buildBattleRewardValidationReport,
  buildBattleScenarioImportReport,
} from "../../tools/lib/battleDataImportHelpers";

describe("battle calibration workflow", () => {
  it("keeps one real battle scenario fully imported and calibrated", async () => {
    const [enemyReport, scenarioReport, rewardReport, checklistReport] = await Promise.all([
      buildBattleEnemyGroupImportReport(),
      buildBattleScenarioImportReport(),
      buildBattleRewardValidationReport(),
      buildBattleParityChecklistReport(),
    ]);

    expect(enemyReport.issues.filter((issue) => issue.severity === "blocker")).toEqual([]);
    expect(scenarioReport.importedScenarioCount).toBeGreaterThanOrEqual(1);
    expect(rewardReport.groups.some((group) => group.id === "highland-outlaws")).toBe(true);

    const waystationScenario = scenarioReport.scenarios.find((entry) => entry.id === "waystation-gate-outlaw-scout");
    expect(waystationScenario?.imported).toBe(true);

    const waystationChecklist = checklistReport.checklist.find((entry) => entry.scenarioId === "waystation-gate-outlaw-scout");
    expect(waystationChecklist).toBeTruthy();
    expect(waystationChecklist?.checks.every((check) => check.passed)).toBe(true);
    expect(checklistReport.blockerCount).toBe(0);
  });
});
