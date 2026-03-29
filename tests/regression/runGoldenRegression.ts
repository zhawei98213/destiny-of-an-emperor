import { formatGoldenRegressionReport, runGoldenRegression } from "./goldenRegressionRunner";

const report = await runGoldenRegression();
console.log(formatGoldenRegressionReport(report));

if (report.totals.mismatch > 0 || report.totals.fail > 0) {
  process.exitCode = 1;
}
