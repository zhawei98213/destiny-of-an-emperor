import { runCli } from "./lib/importerCore";
import { writeBattleUiFlowParityArtifacts } from "./lib/battleUiFlowParity";

async function main(): Promise<void> {
  const report = await writeBattleUiFlowParityArtifacts();
  console.log(`Battle UI flow parity report generated. / 战斗 UI 流程一致性报告已生成。`);
  console.log(`Matched / 已匹配: ${report.totals.matched}`);
  console.log(`Diverged / 有偏差: ${report.totals.diverged}`);
  console.log(`Total / 总数: ${report.totals.total}`);
}

void runCli(main);
