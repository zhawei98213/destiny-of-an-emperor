import {
  buildEventTextLinkageReport,
  parseChapterArg,
  parseInputArg,
  resolveChapterSourceTextFile,
  writeEventTextLinkageArtifacts,
} from "./lib/npcDialogueImportHelpers";
import { runCli } from "./lib/importerCore";

await runCli(async () => {
  const args = process.argv.slice(2);
  const chapterId = parseChapterArg(args);
  const explicitInput = parseInputArg(args);
  const sourceFilePath = explicitInput || chapterId
    ? resolveChapterSourceTextFile(chapterId, explicitInput)
    : undefined;
  const report = await buildEventTextLinkageReport({
    chapterId,
    sourceFilePath,
  });
  const artifactPath = await writeEventTextLinkageArtifacts(report);

  report.issues.forEach((issue) => {
    console.log(`[event-text-linkage] [${issue.severity}] ${issue.path} ${issue.message}`);
  });
  console.log(`Event Text Linkage Check / 事件对白链路检查: events=${report.checkedEventCount} issues=${report.issues.length}`);
  console.log(`Artifacts / 产物: ${artifactPath}`);
  if (report.issues.some((issue) => issue.severity === "error")) {
    process.exitCode = 1;
  }
});
