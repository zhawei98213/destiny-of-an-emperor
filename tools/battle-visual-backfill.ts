import { runCli } from "./lib/importerCore";
import { battleVisualBackfillReportDir, writeBattleVisualBackfillArtifacts } from "./lib/battleVisualBackfill";

await runCli(async () => {
  const report = await writeBattleVisualBackfillArtifacts();
  console.log("Battle Visual Backfill / 战斗视觉回填");
  console.log(`Entry Count / 条目数: ${report.summary.entryCount}`);
  console.log(`Imported Count / 已导入数: ${report.summary.importedCount}`);
  console.log(`Locked Count / 已锁定数: ${report.summary.lockedCount}`);
  console.log(`Error Count / 错误数: ${report.summary.errorCount}`);
  console.log(`Warning Count / 警告数: ${report.summary.warningCount}`);
  console.log(`Artifacts / 产物目录: ${battleVisualBackfillReportDir}`);
  if (report.summary.errorCount > 0) {
    process.exitCode = 1;
  }
});
