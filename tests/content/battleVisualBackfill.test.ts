import { describe, expect, it } from "vitest";
import {
  buildBattleVisualBackfillReport,
  buildBattleVisualParityScoreReport,
} from "../../tools/lib/battleVisualBackfill";

describe("battle visual backfill workflow", () => {
  it("uses partial reconstructed visuals for one real battle slice", async () => {
    const [backfillReport, scoreReport] = await Promise.all([
      buildBattleVisualBackfillReport(),
      buildBattleVisualParityScoreReport(),
    ]);

    expect(backfillReport.summary.errorCount).toBe(0);
    expect(backfillReport.entries.some((entry) => entry.logicalAssetKey === "enemy.highland-outlaw" && entry.effectiveState === "imported")).toBe(true);
    expect(backfillReport.entries.some((entry) => entry.logicalAssetKey === "ui.battle-backdrop" && entry.effectiveState === "imported")).toBe(true);
    expect(scoreReport.summary.scoreAfter).toBeGreaterThan(scoreReport.summary.scoreBefore);
  });
});
