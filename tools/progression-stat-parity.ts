import { runCli } from "./lib/importerCore";
import { writeProgressionStatParityArtifacts } from "./lib/progressionStatParity";

async function main(): Promise<void> {
  const report = await writeProgressionStatParityArtifacts();
  console.log("Progression stat parity report generated. / 成长曲线一致性报告已生成。");
  console.log(`Chapter Count / 章节数量: ${report.partyGrowthReport.length}`);
  console.log(`Outlier Count / 异常数: ${report.obviousOutliers.length}`);
}

void runCli(main);
