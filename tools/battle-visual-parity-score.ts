import { runCli } from "./lib/importerCore";
import { battleVisualParityReportDir, writeBattleVisualParityScoreArtifacts } from "./lib/battleVisualBackfill";

await runCli(async () => {
  const report = await writeBattleVisualParityScoreArtifacts();
  console.log("Battle Visual Parity Score / 战斗视觉一致性得分");
  console.log(`Entry Count / 条目数: ${report.summary.entryCount}`);
  console.log(`Score Before / 替换前得分: ${report.summary.scoreBefore}`);
  console.log(`Score After / 替换后得分: ${report.summary.scoreAfter}`);
  console.log(`Delta / 提升: ${report.summary.delta}`);
  console.log(`Artifacts / 产物目录: ${battleVisualParityReportDir}`);
});
