import { runCli } from "./lib/importerCore";
import { writeWorldConnectivityArtifacts, worldConnectivityReportDir } from "./lib/worldConnectivityAudit";

await runCli(async () => {
  const report = await writeWorldConnectivityArtifacts();

  console.log("World Connectivity Audit / 世界连接性审计");
  console.log(`Generated At / 生成时间: ${report.generatedAt}`);
  console.log(`Chapter Count / 章节数量: ${report.summary.chapterCount}`);
  console.log(`Map Count / 地图数量: ${report.summary.mapCount}`);
  console.log(`Edge Count / 连接边数量: ${report.summary.edgeCount}`);
  console.log(`Portal Edge Count / Portal 连接数量: ${report.summary.portalEdgeCount}`);
  console.log(`Trigger Warp Count / Trigger Warp 数量: ${report.summary.triggerWarpEdgeCount}`);
  console.log(`Issue Count / 问题数量: ${report.summary.issueCount}`);
  report.chapters.forEach((chapter) => {
    console.log(
      `${chapter.chapterId}: maps=${chapter.mapIds.length} inbound=${chapter.inboundConnectionCount} outbound=${chapter.outboundConnectionCount} issues=${chapter.issueCount}`,
    );
  });
  console.log(`Artifacts / 产物目录: ${worldConnectivityReportDir}`);
  if (report.summary.errorCount > 0) {
    process.exitCode = 1;
  }
});
