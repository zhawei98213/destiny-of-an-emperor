import path from "node:path";
import { generatedRoot, runCli, writeStableJsonFile } from "./lib/importerCore";
import { generateSpriteMetadata } from "./importers/generateSpriteMetadata";
import { importGameData } from "./importers/importGameData";
import { importMapContent } from "./importers/importMapContent";
import { importTextTables } from "./importers/importTextTables";

const generatedIndexFile = path.join(generatedRoot, "index.json");

export async function importAll(): Promise<void> {
  await generateSpriteMetadata();
  await importMapContent();
  await importTextTables();
  await importGameData();
  await writeStableJsonFile(generatedIndexFile, {
    files: [
      "battle.content.json",
    ],
    kind: "generated",
    root: "/content/generated",
  });
  console.log(`Generated ${path.relative(process.cwd(), generatedIndexFile)}`);
}

await runCli(async () => {
  await importAll();
});
