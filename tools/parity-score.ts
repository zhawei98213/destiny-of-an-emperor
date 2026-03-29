import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildParityScoreReport } from "./lib/parityScoring";
import {
  repoRoot,
  runCli,
  stableStringify,
} from "./lib/importerCore";

const reportDirectory = path.join(repoRoot, "reports", "parity", "latest");

function formatIssueList(title: string, issues: string[]): string[] {
  if (issues.length === 0) {
    return [
      `### ${title}`,
      "",
      "- none",
      "- 无",
      "",
    ];
  }

  return [
    `### ${title}`,
    "",
    ...issues.flatMap((issue) => [`- ${issue}`]),
    "",
  ];
}

function renderSummary(report: Awaited<ReturnType<typeof buildParityScoreReport>>): string {
  const lines: string[] = [
    "# Parity Scoring Report",
    "# 一致性评分报告",
    "",
    `- Generated At / 生成时间: ${report.generatedAt}`,
    `- Chapter Count / 章节数量: ${report.totals.chapterCount}`,
    `- Average Score / 平均分: ${report.totals.averageScore}`,
    `- Blockers / 阻塞项: ${report.totals.blockerCount}`,
    `- Minor Mismatches / 次要偏差: ${report.totals.minorCount}`,
    "",
    "## Overview",
    "## 总览",
    "",
    "| Chapter | Score | Blockers | Minor |",
    "| --- | --- | --- | --- |",
    ...report.chapters.map((chapter) =>
      `| ${chapter.chapterId} | ${chapter.totalScore}/${chapter.maxScore} | ${chapter.blockerCount} | ${chapter.minorCount} |`),
    "",
  ];

  report.chapters.forEach((chapter) => {
    lines.push(
      `## ${chapter.chapterId}`,
      "",
      `- Title / 标题: ${chapter.title}`,
      `- Area / 区域: ${chapter.areaLabel}`,
      `- Status / 状态: ${chapter.status}`,
      `- Score / 得分: ${chapter.totalScore}/${chapter.maxScore}`,
      `- Regression Coverage / 回归覆盖: ${chapter.regressionPassCount}/${chapter.regressionCaseCount} passed`,
      "",
      "### Dimension Scores",
      "### 维度得分",
      "",
      "| Dimension | Score | Weight | Applicable |",
      "| --- | --- | --- | --- |",
      ...chapter.dimensions.map((dimension) =>
        `| ${dimension.label} | ${dimension.score}/${dimension.maxScore} | ${dimension.weight} | ${dimension.applicable ? "yes / 是" : "no / 否"} |`),
      "",
      ...formatIssueList("Blockers / 阻塞项", chapter.blockers),
      ...formatIssueList("Minor Mismatches / 次要偏差", chapter.minorMismatches),
      "### Evidence",
      "### 证据",
      "",
    );

    chapter.dimensions.forEach((dimension) => {
      lines.push(
        `- ${dimension.label}: ${dimension.evidence.join(" | ")}`,
      );
    });

    lines.push("");
  });

  return `${lines.join("\n")}\n`;
}

export async function writeParityScoreArtifacts(): Promise<void> {
  const report = await buildParityScoreReport();
  await mkdir(reportDirectory, { recursive: true });
  await writeFile(path.join(reportDirectory, "report.json"), `${stableStringify(report)}\n`, "utf8");
  await writeFile(path.join(reportDirectory, "summary.md"), renderSummary(report), "utf8");

  console.log("Parity Scoring Report / 一致性评分报告");
  console.log(`Generated At / 生成时间: ${report.generatedAt}`);
  console.log(`Chapter Count / 章节数量: ${report.totals.chapterCount}`);
  console.log(`Average Score / 平均分: ${report.totals.averageScore}`);
  console.log(`Blockers / 阻塞项: ${report.totals.blockerCount}`);
  console.log(`Minor Mismatches / 次要偏差: ${report.totals.minorCount}`);
  report.chapters.forEach((chapter) => {
    console.log(`${chapter.chapterId}: score=${chapter.totalScore}/${chapter.maxScore} blockers=${chapter.blockerCount} minor=${chapter.minorCount}`);
  });
  console.log(`Artifacts / 产物目录: ${reportDirectory}`);
}

await runCli(async () => {
  await writeParityScoreArtifacts();
});
