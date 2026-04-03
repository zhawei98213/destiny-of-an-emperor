import {
  buildNpcPlacementImportReport,
  parseChapterArg,
  writeNpcPlacementImportArtifacts,
} from "./lib/npcDialogueImportHelpers";
import { runCli } from "./lib/importerCore";

await runCli(async () => {
  const chapterId = parseChapterArg(process.argv.slice(2));
  if (!chapterId) {
    throw new Error("[npc-placement-import] provide --chapter <chapter-id>");
  }

  const report = await buildNpcPlacementImportReport(chapterId);
  const artifactPath = await writeNpcPlacementImportArtifacts(report);

  report.issues.forEach((issue) => {
    console.log(`[npc-placement-import] [${issue.severity}] ${issue.path} ${issue.message}`);
  });
  console.log(`NPC Placement Import Helper / NPC 摆位导入辅助: chapter=${chapterId} maps=${report.summary.mapCount} sourceNpcs=${report.summary.sourceNpcCount} manualNpcs=${report.summary.manualNpcCount} issues=${report.summary.issueCount}`);
  console.log(`Artifacts / 产物: ${artifactPath}`);
  if (report.issues.some((issue) => issue.severity === "error")) {
    process.exitCode = 1;
  }
});
