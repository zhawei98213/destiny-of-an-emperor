import path from "node:path";
import { readFile } from "node:fs/promises";
import { loadContentDatabase } from "../game/src/content/contentLoader";
import { DEFAULT_CONTENT_MANIFESTS } from "../game/src/content/contentKeys";
import { buildSpriteMetadata } from "./importers/generateSpriteMetadata";
import { buildBattleContentPack, buildGameDataImportReport } from "./importers/importGameData";
import { buildMapImportReport } from "./importers/importMapContent";
import { buildTextImportReport } from "./importers/importTextTables";
import {
  generatedRoot,
  repoRoot,
  runCli,
  stableStringify,
} from "./lib/importerCore";
import { loadAllChapterMetadata } from "./lib/chapterMetadata";
import { validateVisualBackfillPlans } from "./lib/visualBackfill";

const manualChapterDir = path.join(repoRoot, "content", "manual", "chapters");

class FileSystemContentReader {
  constructor(private readonly rootDir: string) {}

  async readText(targetPath: string): Promise<string> {
    const normalized = targetPath.startsWith("/")
      ? targetPath.slice(1)
      : targetPath;

    return readFile(path.resolve(this.rootDir, normalized), "utf8");
  }
}

async function assertGeneratedFile(targetPath: string, expectedValue: unknown): Promise<void> {
  const absolutePath = path.join(generatedRoot, targetPath);
  const actualText = await readFile(absolutePath, "utf8");
  const expectedText = `${stableStringify(expectedValue)}\n`;
  if (actualText !== expectedText) {
    throw new Error(`[validate] ${path.relative(repoRoot, absolutePath)} does not match source data. Re-run npm run import:all.`);
  }
}

export async function validateAllContent(): Promise<void> {
  await assertGeneratedFile("sprite-metadata.generated.json", await buildSpriteMetadata());
  await assertGeneratedFile("import-staging/map-content.generated.json", await buildMapImportReport());
  await assertGeneratedFile("import-staging/text-tables.generated.json", await buildTextImportReport());
  await assertGeneratedFile("import-staging/game-data.generated.json", await buildGameDataImportReport());
  await assertGeneratedFile("battle.content.json", await buildBattleContentPack());
  await assertGeneratedFile("index.json", {
    files: ["battle.content.json"],
    kind: "generated",
    root: "/content/generated",
  });

  const database = await loadContentDatabase(
    new FileSystemContentReader(repoRoot),
    DEFAULT_CONTENT_MANIFESTS,
  );
  const chapterRecords = await loadAllChapterMetadata(manualChapterDir);
  const visualBackfillPlans = await validateVisualBackfillPlans();
  console.log(
    [
      "Content validation passed.",
      `packs=${database.packs.length}`,
      `maps=${database.maps.length}`,
      `events=${database.events.length}`,
      `items=${database.items.length}`,
      `enemies=${database.enemies.length}`,
      `chapters=${chapterRecords.length}`,
      `visualBackfillPlans=${visualBackfillPlans.length}`,
    ].join(" "),
  );
}

await runCli(async () => {
  await validateAllContent();
});
