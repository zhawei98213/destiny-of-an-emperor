import { runCli } from "./lib/importerCore";
import { battleCalibrationReportDir, buildBattleParityChecklistReport, writeBattleCalibrationArtifacts } from "./lib/battleDataImportHelpers";

await runCli(async () => {
  const report = await buildBattleParityChecklistReport();
  await writeBattleCalibrationArtifacts();
  console.log("Battle Parity Checklist / 战斗一致性检查清单");
  console.log(`Calibrated Scenario Count / 已校准场景数: ${report.calibratedScenarioCount}`);
  console.log(`Blocker Count / 阻塞项数量: ${report.blockerCount}`);
  console.log(`Artifacts / 产物目录: ${battleCalibrationReportDir}`);
  if (report.blockerCount > 0) {
    process.exitCode = 1;
  }
});
