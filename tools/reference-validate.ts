import path from "node:path";
import { buildReferenceReport, writeReferenceArtifacts } from "./lib/referencePipeline";
import { repoRoot, runCli } from "./lib/importerCore";

await runCli(async () => {
  const report = await writeReferenceArtifacts(await buildReferenceReport());
  const artifactDir = path.join(repoRoot, "reports", "reference", "latest");

  console.log("Reference Pipeline Report / 参考资料管线报告");
  console.log(`Generated At / 生成时间: ${report.generatedAt}`);
  console.log(`Entry Count / 条目数量: ${report.summary.entryCount}`);
  console.log(`Chapter Count / 章节数量: ${report.summary.chapterCount}`);
  console.log(`Error Count / 错误数: ${report.summary.errorCount}`);
  console.log(`Warning Count / 警告数: ${report.summary.warningCount}`);
  report.chapterCoverage.forEach((chapter) => {
    console.log(`${chapter.chapterId}: references=${chapter.referenceCount}`);
  });
  console.log(`Artifacts / 产物目录: ${artifactDir}`);

  if (report.summary.errorCount > 0) {
    process.exitCode = 1;
  }
});
