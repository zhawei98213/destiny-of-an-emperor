import path from "node:path";
import { runCli } from "./lib/importerCore";
import { buildChapterReferenceSummaryReport, writeChapterReferenceSummaryReport } from "./lib/referenceChapterSummary";

await runCli(async () => {
  const report = await buildChapterReferenceSummaryReport();
  const reportPath = await writeChapterReferenceSummaryReport(report);

  console.log("Chapter Reference Summary / 章节参考资料摘要");
  console.log(`Generated At / 生成时间: ${report.generatedAt}`);
  console.log(`Chapter Count / 章节数量: ${report.chapters.length}`);
  console.log(`Backlog Count / Backlog 数量: ${report.backlog.length}`);
  report.chapters.forEach((chapter) => {
    console.log(`${chapter.chapterId}: maps=${chapter.categories.maps.covered.length}/${chapter.categories.maps.required.length} npcs=${chapter.categories.npcs.covered.length}/${chapter.categories.npcs.required.length} ui=${chapter.categories.ui.covered.length}/${chapter.categories.ui.required.length} battles=${chapter.categories.battles.covered.length}/${chapter.categories.battles.required.length}`);
  });
  console.log(`Artifacts / 产物目录: ${path.dirname(reportPath)}`);
});
