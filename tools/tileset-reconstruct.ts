import { runCli } from "./lib/importerCore";
import { writeTilesetReconstructionArtifacts } from "./lib/tilesetReconstruction";

await runCli(async () => {
  const report = await writeTilesetReconstructionArtifacts();
  console.log("Tileset Reconstruction Report / Tileset 重建报告");
  console.log(`Generated At / 生成时间: ${report.generatedAt}`);
  console.log(`Candidate Count / 候选数量: ${report.summary.candidateCount}`);
  console.log(`Attached Count / 已接入运行时数量: ${report.summary.attachedCount}`);
  console.log(`Errors / 错误数: ${report.summary.errorCount}`);
  console.log(`Warnings / 警告数: ${report.summary.warningCount}`);
  report.candidates.forEach((candidate) => {
    console.log(
      `${candidate.candidateId}: status=${candidate.status} | attached=${candidate.runtimeAttached ? "yes" : "no"} | maps=${candidate.mapIds.join(",")}`,
    );
  });
  console.log("Artifacts / 产物目录: reports/tileset-reconstruction/latest");
  console.log("Normalization Plan / 归一化计划: content/generated/import-staging/tileset-crop-plan.generated.json");
});
