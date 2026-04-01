import { runCli } from "./lib/importerCore";
import { writeTilesetNormalizationPlan } from "./lib/tilesetReconstruction";

await runCli(async () => {
  const report = await writeTilesetNormalizationPlan();
  console.log("Tileset Crop Normalization Plan / Tileset 裁切归一化计划");
  console.log(`Generated At / 生成时间: ${report.generatedAt}`);
  console.log(`Planned Tasks / 计划任务数: ${report.normalizationPlan.length}`);
  console.log("Artifact / 产物: content/generated/import-staging/tileset-crop-plan.generated.json");
});
