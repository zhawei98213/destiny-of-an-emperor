import { runCli } from "./lib/importerCore";
import { economyParityReportDir, writeEconomyParityArtifacts } from "./lib/economyParityAudit";

await runCli(async () => {
  const report = await writeEconomyParityArtifacts();

  console.log("Economy Parity Audit / 经济一致性审计");
  console.log(`Generated At / 生成时间: ${report.generatedAt}`);
  console.log(`Chapter Count / 章节数量: ${report.summary.chapterCount}`);
  console.log(`Shop Count / 商店数量: ${report.summary.shopCount}`);
  console.log(`Item Count / 物品数量: ${report.summary.itemCount}`);
  console.log(`Blocker Count / 阻塞项数量: ${report.summary.blockerCount}`);
  console.log(`Non-Blocker Count / 非阻塞项数量: ${report.summary.nonBlockerCount}`);
  report.itemAvailabilityByChapter.forEach((entry) => {
    console.log(
      `${entry.chapterId}: shops=${entry.shopItems.length} events=${entry.eventItems.length} drops=${entry.dropItems.length} required=${entry.requiredItems.length}`,
    );
  });
  console.log(`Artifacts / 产物目录: ${economyParityReportDir}`);

  if (report.summary.blockerCount > 0) {
    process.exitCode = 1;
  }
});
