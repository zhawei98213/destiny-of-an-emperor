import {
  buildDialogueTableImportReport,
  parseChapterArg,
  parseInputArg,
  resolveChapterSourceTextFile,
  writeDialogueTableImportArtifacts,
} from "./lib/npcDialogueImportHelpers";
import { runCli } from "./lib/importerCore";

await runCli(async () => {
  const args = process.argv.slice(2);
  const chapterId = parseChapterArg(args);
  const sourceFilePath = resolveChapterSourceTextFile(chapterId, parseInputArg(args));
  const report = await buildDialogueTableImportReport(sourceFilePath, chapterId);
  const artifactPath = await writeDialogueTableImportArtifacts(report);

  report.issues.forEach((issue) => {
    console.log(`[dialogue-table-import] [${issue.severity}] ${issue.path} ${issue.message}`);
  });
  console.log(`Dialogue Table Import Helper / 对话表导入辅助: source=${report.sourceFile} dialogue=${report.summary.sourceDialogueCount} events=${report.summary.sourceEventCount} missing=${report.summary.missingCount} mismatch=${report.summary.mismatchCount}`);
  console.log(`Artifacts / 产物: ${artifactPath}`);
  if (report.issues.some((issue) => issue.severity === "error")) {
    process.exitCode = 1;
  }
});
