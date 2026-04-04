import { runCli } from "./lib/importerCore";
import { writeEquipmentStatusRecoveryArtifacts } from "./lib/equipmentStatusRecovery";

async function main(): Promise<void> {
  const report = await writeEquipmentStatusRecoveryArtifacts();
  console.log("Equipment status recovery report generated. / 装备与恢复链路报告已生成。");
  console.log(`Chapter Count / 章节数量: ${report.innHealSavePointBehaviorAudit.length}`);
  console.log(`Recovery Calibrated / 恢复流程已校准: ${report.innHealSavePointBehaviorAudit.filter((entry) => entry.status === "calibrated").length}`);
}

void runCli(main);
