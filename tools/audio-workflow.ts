import { runCli } from "./lib/importerCore";
import { writeAudioWorkflowArtifacts } from "./lib/audioWorkflow";

async function main(): Promise<void> {
  const report = await writeAudioWorkflowArtifacts();
  console.log("Audio workflow report generated. / 音频工作流报告已生成。");
  console.log(`Chapter Count / 章节数量: ${report.chapterMappings.length}`);
  console.log(`Issue Count / 问题数: ${report.issues.length}`);
}

void runCli(main);
