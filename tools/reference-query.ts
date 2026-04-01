import { loadReferenceManifest, buildReferenceIndex, queryReferenceEntries } from "./lib/referencePipeline";
import { runCli, stableStringify } from "./lib/importerCore";

interface ParsedArgs {
  chapter?: string;
  mapId?: string;
  sceneType?: string;
  subjectType?: string;
  subjectId?: string;
}

function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = {};

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    const next = argv[index + 1];
    if (!next) {
      continue;
    }

    if (current === "--chapter") {
      parsed.chapter = next;
      index += 1;
    } else if (current === "--map-id") {
      parsed.mapId = next;
      index += 1;
    } else if (current === "--scene-type") {
      parsed.sceneType = next;
      index += 1;
    } else if (current === "--subject-type") {
      parsed.subjectType = next;
      index += 1;
    } else if (current === "--subject-id") {
      parsed.subjectId = next;
      index += 1;
    }
  }

  return parsed;
}

await runCli(async () => {
  const args = parseArgs(process.argv.slice(2));
  if (!args.subjectType && !args.subjectId && !args.chapter && !args.mapId && !args.sceneType) {
    throw new Error("[reference-query] provide at least one filter such as --subject-type, --subject-id, --chapter, --map-id, or --scene-type");
  }

  const index = buildReferenceIndex(await loadReferenceManifest());
  const entries = queryReferenceEntries(index, {
      chapter: args.chapter,
      mapId: args.mapId,
      sceneType: args.sceneType as never,
      subjectType: args.subjectType as never,
      subjectId: args.subjectId,
    });

  console.log("Reference Query Result / 参考资料查询结果");
  console.log(`Match Count / 命中数量: ${entries.length}`);
  console.log(stableStringify(entries));
});
