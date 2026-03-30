import { describe, expect, it } from "vitest";
import {
  evaluatePreReleaseReport,
  formatPreReleaseReport,
  getPreReleaseCommands,
} from "../../tools/lib/preReleaseCheck";
import type { PreReleaseCommandResult } from "../../tools/lib/preReleaseCheck";

function createCommandResult(
  id: string,
  phase: "core" | "extended",
  success = true,
): PreReleaseCommandResult {
  return {
    id,
    label: id,
    phase,
    commandLine: `npm run ${id}`,
    exitCode: success ? 0 : 1,
    success,
    output: "",
  };
}

describe("pre-release check", () => {
  it("exposes different command sets for light and full modes", () => {
    expect(getPreReleaseCommands("light").map((entry) => entry.id)).toEqual([
      "validate-content",
      "save-migration-check",
      "test",
      "build",
    ]);
    expect(getPreReleaseCommands("full").map((entry) => entry.id)).toEqual([
      "validate-content",
      "save-migration-check",
      "test",
      "build",
      "regression-smoke",
      "parity-score",
      "chapter-completeness",
      "asset-check",
      "text-check",
    ]);
  });

  it("keeps continue-import yes when light mode core checks pass", () => {
    const evaluation = evaluatePreReleaseReport(
      "light",
      [
        createCommandResult("validate-content", "core"),
        createCommandResult("save-migration-check", "core"),
        createCommandResult("test", "core"),
        createCommandResult("build", "core"),
      ],
      {},
    );

    expect(evaluation.verdict.continueImport).toBe("yes");
    expect(evaluation.verdict.betaTest).toBe("not-evaluated");
  });

  it("blocks beta-test verdict when full mode still has blockers or asset issues", () => {
    const evaluation = evaluatePreReleaseReport(
      "full",
      [
        createCommandResult("validate-content", "core"),
        createCommandResult("save-migration-check", "core"),
        createCommandResult("test", "core"),
        createCommandResult("build", "core"),
        createCommandResult("regression-smoke", "extended"),
        createCommandResult("parity-score", "extended"),
        createCommandResult("chapter-completeness", "extended"),
        createCommandResult("asset-check", "extended"),
        createCommandResult("text-check", "extended"),
      ],
      {
        regression: {
          pass: 30,
          mismatch: 0,
          fail: 0,
          total: 30,
        },
        parity: {
          chapterCount: 4,
          averageScore: 76,
          blockerCount: 1,
          minorMismatchCount: 10,
        },
        chapterCompleteness: {
          checkedChapters: 4,
          errorCount: 0,
          warningCount: 4,
        },
        asset: {
          chapterCount: 4,
          issueCount: 76,
          placeholderCategoryCount: 28,
        },
        text: {
          chapterCount: 4,
          manualLineCount: 28,
          errorCount: 0,
          warningCount: 37,
          realSharePercent: 90.3,
        },
      },
    );

    expect(evaluation.verdict.continueImport).toBe("yes");
    expect(evaluation.verdict.betaTest).toBe("no");

    const formatted = formatPreReleaseReport({
      generatedAt: "stable",
      mode: "full",
      commands: [
        createCommandResult("validate-content", "core"),
        createCommandResult("asset-check", "extended"),
      ],
      totals: evaluation.totals,
      metrics: {
        parity: {
          chapterCount: 4,
          averageScore: 76,
          blockerCount: 1,
          minorMismatchCount: 10,
        },
      },
      verdict: evaluation.verdict,
      keyFailures: evaluation.keyFailures,
      notes: evaluation.notes,
    });
    expect(formatted).toContain("Pre-Release Check");
    expect(formatted).toContain("Continue Import / 适合继续导入: yes");
    expect(formatted).toContain("Beta Test / 适合发布测试版: no");
  });
});
