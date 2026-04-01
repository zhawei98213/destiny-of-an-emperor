import { runCli } from "./lib/importerCore";
import { parseVisualBackfillPlanIdArg } from "./lib/visualBackfill";
import { buildVisualParityScoreReport, writeVisualParityScoreReport } from "./lib/visualParityScoring";

await runCli(async () => {
  const planId = parseVisualBackfillPlanIdArg(process.argv.slice(2));
  const report = await buildVisualParityScoreReport(planId);
  const reportPath = await writeVisualParityScoreReport(report);

  console.log("Visual Parity Score / 视觉一致性评分");
  console.log(`Generated At / 生成时间: ${report.generatedAt}`);
  console.log(`Plan / 计划: ${report.planId}`);
  console.log(`Chapter / 章节: ${report.chapterId}`);
  console.log(`Overall / 总分: before=${report.summary.scoreBefore} after=${report.summary.scoreAfter} delta=${report.summary.delta}`);
  report.buckets.forEach((bucket) => {
    console.log(`${bucket.id}: before=${bucket.scoreBefore} after=${bucket.scoreAfter} delta=${bucket.delta}`);
  });
  console.log(`Artifacts / 产物目录: ${reportPath}`);
});
