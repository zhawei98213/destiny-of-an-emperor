import { runChapterCompletenessCheck } from "./lib/chapterCompletenessCheck";
import { runCli } from "./lib/importerCore";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { repoRoot, stableStringify } from "./lib/importerCore";

const reportDirectory = path.join(repoRoot, "reports", "chapters", "latest");

await runCli(async () => {
  const report = await runChapterCompletenessCheck();
  await mkdir(reportDirectory, { recursive: true });
  await writeFile(path.join(reportDirectory, "completeness-report.json"), `${stableStringify(report)}\n`, "utf8");
  await writeFile(
    path.join(reportDirectory, "completeness-report.md"),
    [
      "# Chapter Completeness Report",
      "# 章节完整性报告",
      "",
      `- Checked Chapters / 检查章节数: ${report.checkedChapters}`,
      `- Issue Count / 问题数: ${report.issues.length}`,
      "",
      ...report.chapters.flatMap((chapter) => [
        `## ${chapter.chapterId}`,
        "",
        ...(chapter.issues.length > 0
          ? chapter.issues.map((issue) => `- ${issue.severity.toUpperCase()} ${issue.path}: ${issue.message}`)
          : ["- OK / 正常"]),
        "",
      ]),
    ].join("\n"),
    "utf8",
  );
  report.issues.forEach((issue) => {
    console.log(`[chapter-completeness] ${issue.severity.toUpperCase()} ${issue.path} ${issue.message}`);
  });
  console.log(`Chapter Completeness Check / 章节完整性检查: chapters=${report.checkedChapters} issues=${report.issues.length}`);
  if (report.issues.some((issue) => issue.severity === "error")) {
    process.exitCode = 1;
  }
});
