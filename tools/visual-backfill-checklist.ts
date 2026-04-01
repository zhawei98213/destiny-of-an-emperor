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

  console.log(`Visual Backfill Checklist / 视觉回填清单: ${planId}`);
  console.log(reportPath.replace(".report.json", ".checklist.md"));
});
