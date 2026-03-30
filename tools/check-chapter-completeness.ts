import { runChapterCompletenessCheck } from "./lib/chapterCompletenessCheck";
import { runCli } from "./lib/importerCore";

await runCli(async () => {
  const report = await runChapterCompletenessCheck();
  report.issues.forEach((issue) => {
    console.log(`[chapter-completeness] ${issue.severity.toUpperCase()} ${issue.path} ${issue.message}`);
  });
  console.log(`Chapter Completeness Check / 章节完整性检查: chapters=${report.checkedChapters} issues=${report.issues.length}`);
  if (report.issues.some((issue) => issue.severity === "error")) {
    process.exitCode = 1;
  }
});
