import { runCli } from "./lib/importerCore";
import {
  buildVisualBackfillReport,
  parseVisualBackfillPlanIdArg,
  writeVisualBackfillArtifacts,
} from "./lib/visualBackfill";

await runCli(async () => {
  const planId = parseVisualBackfillPlanIdArg(process.argv.slice(2));
  const report = await buildVisualBackfillReport(planId);
  const reportPath = await writeVisualBackfillArtifacts(report);

  console.log("Visual Backfill Report / 视觉回填报告");
  console.log(`Generated At / 生成时间: ${report.generatedAt}`);
  console.log(`Plan / 计划: ${report.planId}`);
  console.log(`Chapter / 章节: ${report.chapterId} :: ${report.chapterTitle}`);
  console.log(`Totals / 汇总: entries=${report.summary.entryCount} locked=${report.summary.lockedCount} gameplaySafe=${report.summary.gameplaySafe} uiLayoutSafe=${report.summary.uiLayoutSafe} interactionSafe=${report.summary.interactionSafe}`);
  console.log(`Artifacts / 产物目录: ${reportPath}`);
});
