import path from "node:path";
import { repoRoot, runCli } from "./lib/importerCore";
import { buildReferenceFramePackReport, writeReferenceFramePackArtifacts } from "./lib/referenceFrameExtract";

await runCli(async () => {
  const report = await writeReferenceFramePackArtifacts(await buildReferenceFramePackReport());
  const artifactDir = path.join(repoRoot, "reports", "reference-frame-extract", "latest");

  console.log("Reference Frame Extraction Report / 参考关键帧提取报告");
  console.log(`Generated At / 生成时间: ${report.generatedAt}`);
  console.log(`Pack Count / 包数量: ${report.summary.packCount}`);
  console.log(`Frame Count / 帧数量: ${report.summary.frameCount}`);
  console.log(`Generated Entry Count / 生成条目数量: ${report.summary.generatedEntryCount}`);
  console.log(`Error Count / 错误数: ${report.summary.errorCount}`);
  console.log(`Warning Count / 警告数: ${report.summary.warningCount}`);
  console.log(`Artifacts / 产物目录: ${artifactDir}`);

  if (report.summary.errorCount > 0) {
    process.exitCode = 1;
  }
});
