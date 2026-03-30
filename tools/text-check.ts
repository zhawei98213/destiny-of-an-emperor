import path from "node:path";
import { buildTextIntegrityReport, writeTextIntegrityArtifacts } from "./lib/textIntegrity";
import { runCli, repoRoot } from "./lib/importerCore";

await runCli(async () => {
  const report = await writeTextIntegrityArtifacts(await buildTextIntegrityReport());
  const artifactDir = path.join(repoRoot, "reports", "text-integrity", "latest");

  console.log("Text Integrity Report / 文本完整性报告");
  console.log(`Generated At / 生成时间: ${report.generatedAt}`);
  console.log(`Manual Line Count / 手工对白数: ${report.summary.manualLineCount}`);
  console.log(`Chapter Count / 章节数量: ${report.summary.chapterCount}`);
  console.log(`Error Count / 错误数: ${report.summary.errorCount}`);
  console.log(`Warning Count / 警告数: ${report.summary.warningCount}`);
  console.log(`Demo Share / Demo 占比: ${report.ratio.demoSharePercent}%`);
  console.log(`Real Share / 真实占比: ${report.ratio.realSharePercent}%`);
  report.chapterCoverage.forEach((chapter) => {
    console.log(`${chapter.chapterId}: referenced=${chapter.referencedLineCount} coverage=${chapter.manualCoveragePercent}% missing=${chapter.uncoveredReferencedLineIds.length}`);
  });
  console.log(`Artifacts / 产物目录: ${artifactDir}`);
});

