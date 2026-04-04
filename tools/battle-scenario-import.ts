import { runCli } from "./lib/importerCore";
import { battleCalibrationReportDir, buildBattleScenarioImportReport, writeBattleCalibrationArtifacts } from "./lib/battleDataImportHelpers";

await runCli(async () => {
  const report = await buildBattleScenarioImportReport();
  await writeBattleCalibrationArtifacts();
  console.log("Battle Scenario Import / 战斗场景导入");
  console.log(`Source File / 来源文件: ${report.sourceFile}`);
  console.log(`Scenario Count / 场景数量: ${report.scenarioCount}`);
  console.log(`Imported Scenario Count / 已导入场景数: ${report.importedScenarioCount}`);
  console.log(`Issue Count / 问题数量: ${report.issues.length}`);
  console.log(`Artifacts / 产物目录: ${battleCalibrationReportDir}`);
  if (report.issues.some((issue) => issue.severity === "blocker")) {
    process.exitCode = 1;
  }
});
