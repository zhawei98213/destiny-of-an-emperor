import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  repoRoot,
  runCli,
  stableStringify,
} from "./lib/importerCore";
import { buildBattleParityReport } from "./lib/battleParity";

const reportDirectory = path.join(repoRoot, "reports", "battle-parity", "latest");

function renderSummary(report: Awaited<ReturnType<typeof buildBattleParityReport>>): string {
  const lines: string[] = [
    "# Battle Parity Report",
    "# 战斗一致性校准报告",
    "",
    `- Generated At / 生成时间: ${report.generatedAt}`,
    `- Total Cases / 案例总数: ${report.totals.totalCases}`,
    `- Calibrated Cases / 已校准案例: ${report.totals.calibratedCases}`,
    `- Mismatch Cases / 不一致案例: ${report.totals.mismatchCases}`,
    `- Failed Cases / 失败案例: ${report.totals.failedCases}`,
    "",
    "## Overview",
    "## 总览",
    "",
    "| Case | Chapter | Status | Calibrated |",
    "| --- | --- | --- | --- |",
    ...report.cases.map((entry) =>
      `| ${entry.id} | ${entry.chapterId} | ${entry.status} | ${entry.calibrated ? "yes / 是" : "no / 否"} |`),
    "",
  ];

  report.cases.forEach((entry) => {
    lines.push(
      `## ${entry.id}`,
      "",
      `- Name / 名称: ${entry.name}`,
      `- Chapter / 章节: ${entry.chapterId}`,
      `- Golden Case / 黄金回归案例: ${entry.goldenCaseId}`,
      `- Status / 状态: ${entry.status}`,
      `- Calibrated / 已校准: ${entry.calibrated ? "yes / 是" : "no / 否"}`,
      `- Regression Status / 回归状态: ${entry.regressionCaseStatus ?? "missing / 缺失"}`,
      "",
      "| Dimension | Status |",
      "| --- | --- |",
      ...entry.dimensions.map((dimension) => `| ${dimension.label} | ${dimension.status} |`),
      "",
    );

    entry.dimensions.forEach((dimension) => {
      lines.push(
        `### ${dimension.label}`,
        "",
        "#### Expected",
        "#### 预期",
        "",
        "```json",
        stableStringify(dimension.expected),
        "```",
        "",
        "#### Actual",
        "#### 实际",
        "",
        "```json",
        stableStringify(dimension.actual),
        "```",
        "",
        "#### Diff",
        "#### 差异",
        "",
      );

      if (dimension.mismatches.length === 0) {
        lines.push("- No mismatch.", "- 无差异。", "");
      } else {
        dimension.mismatches.forEach((mismatch) => {
          lines.push(`- ${mismatch}`);
        });
        lines.push("");
      }
    });
  });

  return `${lines.join("\n")}\n`;
}

export async function writeBattleParityArtifacts(): Promise<void> {
  const report = await buildBattleParityReport();
  await mkdir(reportDirectory, { recursive: true });
  await writeFile(path.join(reportDirectory, "report.json"), `${stableStringify(report)}\n`, "utf8");
  await writeFile(path.join(reportDirectory, "summary.md"), renderSummary(report), "utf8");

  console.log("Battle Parity Report / 战斗一致性校准报告");
  console.log(`Generated At / 生成时间: ${report.generatedAt}`);
  console.log(`Total Cases / 案例总数: ${report.totals.totalCases}`);
  console.log(`Calibrated Cases / 已校准案例: ${report.totals.calibratedCases}`);
  console.log(`Mismatch Cases / 不一致案例: ${report.totals.mismatchCases}`);
  console.log(`Failed Cases / 失败案例: ${report.totals.failedCases}`);
  report.cases.forEach((entry) => {
    console.log(`${entry.id}: status=${entry.status} calibrated=${entry.calibrated ? "yes" : "no"}`);
  });
  console.log(`Artifacts / 产物目录: ${reportDirectory}`);
}

await runCli(async () => {
  await writeBattleParityArtifacts();
});
