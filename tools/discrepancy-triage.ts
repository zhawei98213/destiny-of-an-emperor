import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildDiscrepancyTriageReport } from "./lib/discrepancyTriage";
import { repoRoot, runCli, stableStringify } from "./lib/importerCore";

const reportDirectory = path.join(repoRoot, "reports", "triage", "latest");

function renderSummary(report: Awaited<ReturnType<typeof buildDiscrepancyTriageReport>>): string {
  const lines: string[] = [
    "# Discrepancy Triage Report",
    "# 差异分级报告",
    "",
    `- Generated At / 生成时间: ${report.generatedAt}`,
    `- Total Items / 总条目数: ${report.summary.totalItems}`,
    `- P0: ${report.summary.byPriority.P0}`,
    `- P1: ${report.summary.byPriority.P1}`,
    `- P2: ${report.summary.byPriority.P2}`,
    `- P3: ${report.summary.byPriority.P3}`,
    "",
    "## Backlog",
    "## 修复待办",
    "",
  ];

  report.backlog.forEach((item) => {
    lines.push(
      `## ${item.id}`,
      "",
      `- Priority / 优先级: ${item.priority}`,
      `- Title / 标题: ${item.title}`,
      `- Summary / 摘要: ${item.summary}`,
      `- Chapters / 章节: ${item.impactScope.chapters.join(", ")}`,
      `- Systems / 系统: ${item.impactScope.systems.join(", ")}`,
      `- Suggested Repair Targets / 建议修复位置: ${item.suggestedRepairTargets.join(" | ")}`,
      `- Dependencies / 依赖: ${item.dependencies.length > 0 ? item.dependencies.join(", ") : "none / 无"}`,
      "",
      "### Sources",
      "### 来源",
      "",
    );

    item.source.forEach((source) => {
      lines.push(
        `- ${source.source} | chapter=${source.chapterId} | dimension=${source.dimensionId ?? "n/a"} | messages=${source.messages.join(" ; ")}${source.caseIds && source.caseIds.length > 0 ? ` | cases=${source.caseIds.join(", ")}` : ""}`,
      );
    });

    lines.push("");
  });

  return `${lines.join("\n")}\n`;
}

export async function writeDiscrepancyTriageArtifacts(): Promise<void> {
  const report = await buildDiscrepancyTriageReport();
  await mkdir(reportDirectory, { recursive: true });
  await writeFile(path.join(reportDirectory, "report.json"), `${stableStringify(report)}\n`, "utf8");
  await writeFile(path.join(reportDirectory, "summary.md"), renderSummary(report), "utf8");

  console.log("Discrepancy Triage Report / 差异分级报告");
  console.log(`Generated At / 生成时间: ${report.generatedAt}`);
  if (report.inputs.uiParityReportPath) {
    console.log(`UI Parity Input / UI 一致性输入: ${report.inputs.uiParityReportPath}`);
  }
  console.log(`Total Items / 总条目数: ${report.summary.totalItems}`);
  console.log(`P0=${report.summary.byPriority.P0} P1=${report.summary.byPriority.P1} P2=${report.summary.byPriority.P2} P3=${report.summary.byPriority.P3}`);
  report.backlog.forEach((item) => {
    console.log(`${item.priority} ${item.id} :: ${item.title}`);
  });
  console.log(`Artifacts / 产物目录: ${reportDirectory}`);
}

await runCli(async () => {
  await writeDiscrepancyTriageArtifacts();
});
