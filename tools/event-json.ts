import path from "node:path";
import {
  lintEventJsonFile,
  writeFormattedEventJsonFile,
} from "./lib/eventJsonLint";
import { repoRoot, runCli } from "./lib/importerCore";

function resolveTargets(args: string[]): { write: boolean; files: string[] } {
  const write = args.includes("--write");
  const fileArgs = args.filter((arg) => arg !== "--write" && arg !== "--check");
  const files = fileArgs.length > 0
    ? fileArgs.map((entry) => path.resolve(process.cwd(), entry))
    : [path.join(repoRoot, "content", "manual", "story.content.json")];

  return { write, files };
}

await runCli(async () => {
  const { write, files } = resolveTargets(process.argv.slice(2));
  let formattingDriftCount = 0;
  let issueCount = 0;
  let normalizedCount = 0;

  for (const filePath of files) {
    if (write) {
      await writeFormattedEventJsonFile(filePath);
    }

    const result = await lintEventJsonFile(filePath);
    if (result.normalized) {
      normalizedCount += 1;
    } else {
      formattingDriftCount += 1;
      console.log(`[event-json] ${filePath}: formatting drift detected; run with --write to normalize.`);
    }

    result.issues.forEach((issue) => {
      issueCount += 1;
      console.log(`[event-json] ${filePath}:${issue.path} ${issue.message}`);
    });
  }

  console.log(`Event JSON Check / 事件 JSON 检查: files=${files.length} normalized=${normalizedCount} formattingDrift=${formattingDriftCount} issues=${issueCount}`);
  if (issueCount > 0) {
    process.exitCode = 1;
  }
});
