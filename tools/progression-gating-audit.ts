import { runCli } from "./lib/importerCore";
import { progressionGatingReportDir, writeProgressionGatingArtifacts } from "./lib/progressionGatingAudit";

await runCli(async () => {
  const report = await writeProgressionGatingArtifacts();

  console.log("Progression Gating Audit / 推进门禁审计");
  console.log(`Generated At / 生成时间: ${report.generatedAt}`);
  console.log(`Chapter Count / 章节数量: ${report.progressionStateModel.chapterOrder.length}`);
  console.log(`Blocker Count / 阻塞项数量: ${report.softLockRiskReport.blockerCount}`);
  console.log(`Non-Blocker Count / 非阻塞项数量: ${report.softLockRiskReport.nonBlockerCount}`);
  report.chapterChecklists.forEach((checklist) => {
    console.log(
      `${checklist.chapterId}: accessible=${checklist.accessibleMaps.length}/${checklist.accessibleMaps.length + checklist.blockedMaps.length} blockers=${checklist.blockerCount} nonBlockers=${checklist.nonBlockerCount}`,
    );
  });
  console.log(`Artifacts / 产物目录: ${progressionGatingReportDir}`);

  if (report.softLockRiskReport.blockerCount > 0) {
    process.exitCode = 1;
  }
});
