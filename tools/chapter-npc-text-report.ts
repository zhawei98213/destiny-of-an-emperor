import path from "node:path";
import {
  buildChapterNpcTextCompletenessReport,
  writeChapterNpcTextCompletenessArtifacts,
} from "./lib/npcDialogueImportHelpers";
import { repoRoot, runCli } from "./lib/importerCore";

await runCli(async () => {
  const report = await buildChapterNpcTextCompletenessReport();
  const artifactPath = await writeChapterNpcTextCompletenessArtifacts(report);
  const artifactDir = path.join(repoRoot, "reports", "npc-dialogue", "latest");

  report.issues.forEach((issue) => {
    console.log(`[chapter-npc-text] [${issue.severity}] ${issue.path} ${issue.message}`);
  });
  console.log("Chapter NPC/Text Completeness Report / 章节 NPC 与文本完整性报告");
  console.log(`Generated At / 生成时间: ${report.generatedAt}`);
  console.log(`Chapter Count / 章节数量: ${report.summary.chapterCount}`);
  console.log(`Ready / 就绪: ${report.summary.readyCount}`);
  console.log(`Partial / 部分完成: ${report.summary.partialCount}`);
  console.log(`Missing Source / 缺少 source: ${report.summary.missingSourceCount}`);
  console.log(`Issue Count / 问题数量: ${report.summary.issueCount}`);
  report.chapters.forEach((chapter) => {
    console.log(`${chapter.chapterId}: status=${chapter.status} sourceMaps=${chapter.sourceMapCount} sourceNpcs=${chapter.sourceNpcCount} sourceDialogue=${chapter.sourceDialogueCount} referencedDialogue=${chapter.referencedDialogueCount} issues=${chapter.npcIssueCount + chapter.linkageIssueCount + chapter.speakerIssueCount}`);
  });
  console.log(`Artifacts / 产物目录: ${artifactDir}`);
  console.log(`Primary Artifact / 主报告: ${artifactPath}`);
  if (report.issues.some((issue) => issue.severity === "error")) {
    process.exitCode = 1;
  }
});
