import {
  buildSpeakerMetadataReport,
  parseChapterArg,
  parseInputArg,
  resolveChapterSourceTextFile,
  writeSpeakerMetadataArtifacts,
} from "./lib/npcDialogueImportHelpers";
import { runCli } from "./lib/importerCore";

await runCli(async () => {
  const args = process.argv.slice(2);
  const chapterId = parseChapterArg(args);
  const explicitInput = parseInputArg(args);
  const sourceFilePath = explicitInput || chapterId
    ? resolveChapterSourceTextFile(chapterId, explicitInput)
    : undefined;
  const report = await buildSpeakerMetadataReport({
    chapterId,
    sourceFilePath,
  });
  const artifactPath = await writeSpeakerMetadataArtifacts(report);

  report.issues.forEach((issue) => {
    console.log(`[speaker-metadata] [${issue.severity}] ${issue.path} ${issue.message}`);
  });
  console.log(`Speaker Metadata Check / 说话者元数据检查: lines=${report.checkedLineCount} issues=${report.issues.length}`);
  console.log(`Artifacts / 产物: ${artifactPath}`);
  if (report.issues.some((issue) => issue.severity === "error")) {
    process.exitCode = 1;
  }
});
