import { runCli } from "./lib/importerCore";
import { writeEncounterTransitionParityArtifacts } from "./lib/encounterTransitionParity";

async function main(): Promise<void> {
  const report = await writeEncounterTransitionParityArtifacts();
  console.log(`Encounter and transition parity report generated. / 遭遇与切场衔接一致性报告已生成。`);
  console.log(`Audited Chapters / 审计章节: ${report.auditedChapters.join(", ")}`);
  console.log(`Warnings / 警告数: ${report.encounterTriggerAudit.filter((entry) => entry.status === "warning").length}`);
}

void runCli(main);
