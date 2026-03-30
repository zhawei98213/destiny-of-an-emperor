import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildAssetParityReport } from "./lib/assetParity";
import { repoRoot, runCli, stableStringify } from "./lib/importerCore";

const reportDirectory = path.join(repoRoot, "reports", "asset-parity", "latest");

function renderSummary(report: Awaited<ReturnType<typeof buildAssetParityReport>>): string {
  const lines: string[] = [
    "# Asset Parity Report",
    "# 资产一致性报告",
    "",
    `- Generated At / 生成时间: ${report.generatedAt}`,
    `- Chapter Count / 章节数量: ${report.summary.chapterCount}`,
    `- Issue Count / 问题数量: ${report.summary.issueCount}`,
    `- Placeholder Categories / 占位分类数: ${report.summary.placeholderCategories}`,
    "",
  ];

  report.chapters.forEach((chapter) => {
    lines.push(
      `## ${chapter.chapterId}`,
      "",
      `- Title / 标题: ${chapter.title}`,
      "",
      "| Category | Status | Referenced | Missing | Unreferenced |",
      "| --- | --- | --- | --- | --- |",
      ...chapter.categories.map((category) =>
        `| ${category.label} | ${category.status} | ${category.referencedIds.length} | ${category.missingIds.length} | ${category.unreferencedIds.length} |`),
      "",
    );

    chapter.categories.forEach((category) => {
      lines.push(
        `### ${category.label}`,
        "",
        `- Status / 状态: ${category.status}`,
        `- Referenced / 引用: ${category.referencedIds.length > 0 ? category.referencedIds.join(", ") : "none / 无"}`,
        `- Available / 可用: ${category.availableIds.length > 0 ? category.availableIds.join(", ") : "none / 无"}`,
        `- Missing / 缺失: ${category.missingIds.length > 0 ? category.missingIds.join(", ") : "none / 无"}`,
        `- Unreferenced / 未引用: ${category.unreferencedIds.length > 0 ? category.unreferencedIds.join(", ") : "none / 无"}`,
      );
      category.notes.forEach((note) => {
        lines.push(`- Note / 说明: ${note}`);
      });
      lines.push("");
    });
  });

  if (report.issues.length > 0) {
    lines.push("## Issues", "## 问题", "");
    report.issues.forEach((issue) => {
      lines.push(`- [${issue.severity}] ${issue.categoryId} ${issue.path} ${issue.message}`);
    });
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

export async function writeAssetParityArtifacts(): Promise<void> {
  const report = await buildAssetParityReport();
  await mkdir(reportDirectory, { recursive: true });
  await writeFile(path.join(reportDirectory, "report.json"), `${stableStringify(report)}\n`, "utf8");
  await writeFile(path.join(reportDirectory, "summary.md"), renderSummary(report), "utf8");

  console.log("Asset Parity Report / 资产一致性报告");
  console.log(`Generated At / 生成时间: ${report.generatedAt}`);
  console.log(`Chapter Count / 章节数量: ${report.summary.chapterCount}`);
  console.log(`Issue Count / 问题数量: ${report.summary.issueCount}`);
  console.log(`Placeholder Categories / 占位分类数: ${report.summary.placeholderCategories}`);
  report.chapters.forEach((chapter) => {
    console.log(`${chapter.chapterId}: ${chapter.categories.map((category) => `${category.id}=${category.status}`).join(" | ")}`);
  });
  console.log(`Artifacts / 产物目录: ${reportDirectory}`);
}

await runCli(async () => {
  await writeAssetParityArtifacts();
});
