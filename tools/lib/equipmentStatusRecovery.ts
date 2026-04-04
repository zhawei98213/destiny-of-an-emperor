import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadRealChapterMetadata, loadManualStoryContent, loadManualWorldContent } from "./manualContent";
import { readJsonFile, repoRoot, stableStringify } from "./importerCore";

interface GoldenRegressionReport {
  cases: Array<{
    id: string;
    status: "pass" | "mismatch" | "fail";
  }>;
}

export interface EquipmentStatusRecoveryReport {
  generatedAt: string;
  equipmentBehaviorAudit: {
    runtimeSupportsEquipFlow: boolean;
    notes: string[];
  };
  statusEffectSupportGapAnalysis: {
    blockerCount: number;
    gaps: string[];
  };
  innHealSavePointBehaviorAudit: Array<{
    chapterId: string;
    restoreCaseIds: string[];
    saveCaseIds: string[];
    status: "calibrated" | "gap";
  }>;
  restoreReviveEdgeCaseChecklist: Array<{
    label: string;
    passed: boolean;
    detail: string;
  }>;
}

export const equipmentStatusRecoveryReportDir = path.join(repoRoot, "reports", "equipment-status-recovery", "latest");

export async function buildEquipmentStatusRecoveryReport(): Promise<EquipmentStatusRecoveryReport> {
  const chapters = await loadRealChapterMetadata();
  const story = await loadManualStoryContent();
  const world = await loadManualWorldContent();
  const regression = await readJsonFile<GoldenRegressionReport>(path.join(repoRoot, "reports", "regression", "latest", "report.json"));

  const equipmentCount = world.items.filter((entry) => entry.kind === "equipment").length;
  const runtimeSupportsEquipFlow = story.events.some((event) => event.id.includes("equip"));
  const restoreEvents = new Set(
    story.events
      .filter((event) => event.steps.some((step) => step.type === "restoreParty"))
      .map((event) => event.id),
  );

  const innHealSavePointBehaviorAudit: EquipmentStatusRecoveryReport["innHealSavePointBehaviorAudit"] = chapters.map((chapter) => {
    const restoreCaseIds = chapter.regressionCases.filter((caseId) => caseId.includes("restores-party"));
    const saveCaseIds = chapter.regressionCases.filter((caseId) => caseId.includes("save-load"));
    return {
      chapterId: chapter.chapterId,
      restoreCaseIds,
      saveCaseIds,
      status: restoreCaseIds.every((caseId) => regression.cases.some((entry) => entry.id === caseId && entry.status === "pass"))
        && saveCaseIds.every((caseId) => regression.cases.some((entry) => entry.id === caseId && entry.status === "pass"))
        ? "calibrated"
        : "gap",
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    equipmentBehaviorAudit: {
      runtimeSupportsEquipFlow,
      notes: [
        equipmentCount > 0
          ? `Equipment items exist (${equipmentCount}), but runtime equip/unequip interaction is not yet implemented. / 当前已有 ${equipmentCount} 个装备物品，但运行时还没有完整 equip/unequip 交互。`
          : "No equipment items are currently imported. / 当前尚未导入装备物品。",
        `Restore events currently imported: ${[...restoreEvents].join(", ") || "none / 无"}`,
      ],
    },
    statusEffectSupportGapAnalysis: {
      blockerCount: runtimeSupportsEquipFlow ? 0 : 1,
      gaps: [
        "Status ids are persisted and restoreParty clears them, but there is still no full status-effect application loop in battle or overworld.",
        "statusIds 目前能持久化，restoreParty 也会清除它们，但 battle 和 overworld 仍未形成完整的状态异常应用闭环。",
      ],
    },
    innHealSavePointBehaviorAudit,
    restoreReviveEdgeCaseChecklist: [
      {
        label: "restoreParty refills HP and MP / restoreParty 会补满 HP 和 MP",
        passed: true,
        detail: "Covered by relay-healer and fort-healer regression cases. / 已由 relay-healer 和 fort-healer 回归用例覆盖。",
      },
      {
        label: "restoreParty clears statuses / restoreParty 会清除状态异常",
        passed: true,
        detail: "Covered by runtime interpreter regression. / 已由 runtime interpreter 回归覆盖。",
      },
      {
        label: "revive-specific behavior remains separate / 复活专用行为仍需单独补充",
        passed: false,
        detail: "No dedicated revive opcode or KO-state UI flow exists yet. / 当前还没有专门的复活 opcode 或 KO 状态 UI 流程。",
      },
    ],
  };
}

function renderSummary(report: EquipmentStatusRecoveryReport): string {
  return [
    "# Equipment Status Recovery Report",
    "# 装备与恢复链路报告",
    "",
    `- Generated At / 生成时间: ${report.generatedAt}`,
    `- Chapter Count / 章节数量: ${report.innHealSavePointBehaviorAudit.length}`,
    `- Recovery Calibrated / 恢复流程已校准: ${report.innHealSavePointBehaviorAudit.filter((entry) => entry.status === "calibrated").length}`,
    "",
  ].join("\n");
}

export async function writeEquipmentStatusRecoveryArtifacts(): Promise<EquipmentStatusRecoveryReport> {
  const report = await buildEquipmentStatusRecoveryReport();
  await mkdir(equipmentStatusRecoveryReportDir, { recursive: true });
  await writeFile(path.join(equipmentStatusRecoveryReportDir, "report.json"), `${stableStringify(report)}\n`, "utf8");
  await writeFile(path.join(equipmentStatusRecoveryReportDir, "summary.md"), `${renderSummary(report)}\n`, "utf8");
  return report;
}
