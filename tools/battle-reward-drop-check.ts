import { runCli } from "./lib/importerCore";
import { battleCalibrationReportDir, buildBattleRewardValidationReport, writeBattleCalibrationArtifacts } from "./lib/battleDataImportHelpers";

await runCli(async () => {
  const report = await buildBattleRewardValidationReport();
  await writeBattleCalibrationArtifacts();
  console.log("Battle Reward Drop Validation / 战斗奖励掉落校验");
  console.log(`Group Count / 敌群数量: ${report.groups.length}`);
  console.log(`Issue Count / 问题数量: ${report.issues.length}`);
  console.log(`Artifacts / 产物目录: ${battleCalibrationReportDir}`);
  if (report.issues.some((issue) => issue.severity === "blocker")) {
    process.exitCode = 1;
  }
});
