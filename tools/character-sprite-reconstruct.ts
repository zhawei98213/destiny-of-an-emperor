import { runCli } from "./lib/importerCore";
import { writeCharacterSpriteArtifacts } from "./lib/characterSpriteReconstruction";

await runCli(async () => {
  const report = await writeCharacterSpriteArtifacts();
  console.log("Character Sprite Reconstruction Report / 角色精灵重建报告");
  console.log(`Generated At / 生成时间: ${report.generatedAt}`);
  console.log(`Candidate Count / 候选数量: ${report.summary.candidateCount}`);
  console.log(`Imported Candidates / 已导入候选数: ${report.summary.importedCandidateCount}`);
  console.log(`Imported Frames / 已导入帧数: ${report.summary.importedFrameCount}`);
  console.log(`Errors / 错误数: ${report.summary.errorCount}`);
  console.log(`Warnings / 警告数: ${report.summary.warningCount}`);
  report.candidates.forEach((candidate) => {
    console.log(`${candidate.candidateId}: key=${candidate.logicalAssetKey} | imported=${candidate.importedFacingSlots.join(",") || "none"}`);
  });
  console.log("Artifacts / 产物目录: reports/character-sprite-reconstruction/latest");
  console.log("Metadata / 元数据: content/generated/character-sprite-metadata.generated.json");
});
