import {
  formatPerformanceBaselineReport,
  runPerformanceBaseline,
  writePerformanceBaselineArtifacts,
} from "./lib/performanceBaseline";
import { runCli } from "./lib/importerCore";

await runCli(async () => {
  const report = await writePerformanceBaselineArtifacts(await runPerformanceBaseline());
  console.log(formatPerformanceBaselineReport(report));
});
