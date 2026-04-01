import { runCli } from "./lib/importerCore";
import { writeUiAssetReconstructionArtifacts } from "./lib/uiAssetReconstruction";

await runCli(async () => {
  const report = await writeUiAssetReconstructionArtifacts();
  console.log("UI Asset Reconstruction Report / UI 资产重建报告");
  console.log(`Generated At / 生成时间: ${report.generatedAt}`);
  console.log(`Entry Count / 条目数: ${report.summary.entryCount}`);
  console.log(`Attached Count / 已接入运行时数量: ${report.summary.attachedCount}`);
  console.log(`Reconstructed Panels / 已重建面板数: ${report.summary.reconstructedPanelCount}`);
  console.log(`Errors / 错误数: ${report.summary.errorCount}`);
  console.log(`Warnings / 警告数: ${report.summary.warningCount}`);
  report.chapters.forEach((chapter) => {
    console.log(`${chapter.chapterId}: entries=${chapter.entryCount} | attached=${chapter.attachedCount}`);
  });
  console.log("Artifacts / 产物目录: reports/ui-asset-reconstruction/latest");
});
