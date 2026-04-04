import { runCli } from "./lib/importerCore";
import { battleCalibrationReportDir, buildBattleEnemyGroupImportReport, writeBattleCalibrationArtifacts } from "./lib/battleDataImportHelpers";

await runCli(async () => {
  const report = await buildBattleEnemyGroupImportReport();
  await writeBattleCalibrationArtifacts();
  console.log("Battle Enemy And Group Import / 战斗敌人与敌群导入");
  console.log(`Source File / 来源文件: ${report.sourceFile}`);
  console.log(`Enemy Count / 敌人数量: ${report.enemyCount}`);
  console.log(`Battle Group Count / 敌群数量: ${report.battleGroupCount}`);
  console.log(`Issue Count / 问题数量: ${report.issues.length}`);
  console.log(`Artifacts / 产物目录: ${battleCalibrationReportDir}`);
  if (report.issues.some((issue) => issue.severity === "blocker")) {
    process.exitCode = 1;
  }
});
