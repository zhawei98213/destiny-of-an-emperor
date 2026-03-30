import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildUiParityReport, formatUiParityReport } from "./lib/uiParity";
import { repoRoot, runCli, stableStringify } from "./lib/importerCore";

const reportDirectory = path.join(repoRoot, "reports", "ui-parity", "latest");

function renderSummary(report: Awaited<ReturnType<typeof buildUiParityReport>>): string {
  const lines = [
    "# UI Parity Report",
    "# UI 一致性报告",
    "",
    `- Generated At / 生成时间: ${report.generatedAt}`,
    `- Matched / 已匹配: ${report.totals.matched}`,
    `- Diverged / 有偏差: ${report.totals.diverged}`,
    `- Total / 总数: ${report.totals.total}`,
    "",
    "## Focus Scenes",
    "## 对照场景",
    "",
    ...report.focusScenes.map((scene) => `- ${scene.chapterId} :: ${scene.mapId} :: ${scene.purpose}`),
    "",
    "## Cases",
    "## 条目",
    "",
  ];

  report.cases.forEach((entry) => {
    lines.push(`### ${entry.id}`, "");
    lines.push(`- Title / 标题: ${entry.title}`);
    lines.push(`- Area / 区域: ${entry.area}`);
    lines.push(`- Status / 状态: ${entry.status}`);
    if (entry.priority) {
      lines.push(`- Priority / 优先级: ${entry.priority}`);
    }
    lines.push(`- Locator / 定位: chapter=${entry.locator.chapterId}, map=${entry.locator.mapId}${entry.locator.triggerId ? `, trigger=${entry.locator.triggerId}` : ""}${entry.locator.eventId ? `, event=${entry.locator.eventId}` : ""}${entry.locator.npcId ? `, npc=${entry.locator.npcId}` : ""}`);
    lines.push("- Expected / 预期:");
    entry.expected.forEach((line) => lines.push(`  - ${line}`));
    lines.push("- Actual / 实际:");
    entry.actual.forEach((line) => lines.push(`  - ${line}`));
    lines.push("- Differences / 差异:");
    if (entry.differences.length === 0) {
      lines.push("  - none / 无");
    } else {
      entry.differences.forEach((line) => lines.push(`  - ${line}`));
    }
    lines.push("- Suggested Repair Targets / 建议修复位置:");
    entry.suggestedRepairTargets.forEach((target) => lines.push(`  - ${target}`));
    lines.push("");
  });

  return `${lines.join("\n")}\n`;
}

await runCli(async () => {
  const report = await buildUiParityReport();
  await mkdir(reportDirectory, { recursive: true });
  await writeFile(path.join(reportDirectory, "report.json"), `${stableStringify(report)}\n`, "utf8");
  await writeFile(path.join(reportDirectory, "summary.md"), renderSummary(report), "utf8");
  console.log(formatUiParityReport(report));
  console.log(`Artifacts / 产物目录: ${reportDirectory}`);
});
