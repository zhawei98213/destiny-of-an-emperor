import path from "node:path";
import { validateContentPack } from "../../game/src/content/schema";
import type { ContentPack } from "../../game/src/types/content";
import { generatedRoot, sourceRoot, writeStableJsonFile } from "../lib/importerCore";
import { loadGameDataSource } from "../lib/sourceSchemas";

export interface GameDataImportReport {
  generatedAt: "stable";
  importer: "game-data";
  itemIds: string[];
  shopIds: string[];
  enemyIds: string[];
  battleGroupIds: string[];
}

const sourceFile = path.join(sourceRoot, "data", "demo-game-data.source.json");
const battleOutputFile = path.join(generatedRoot, "battle.content.json");
const reportOutputFile = path.join(generatedRoot, "import-staging", "game-data.generated.json");

export async function buildBattleContentPack(): Promise<ContentPack> {
  const source = await loadGameDataSource(sourceFile);
  return validateContentPack({
    meta: {
      id: "generated-battle",
      kind: "generated",
      version: 1,
      description: "Generated encounter and enemy placeholder data.",
    },
    enemies: source.enemies,
    battleGroups: source.battleGroups,
  }, "generated-battle-pack");
}

export async function buildGameDataImportReport(): Promise<GameDataImportReport> {
  const source = await loadGameDataSource(sourceFile);
  return {
    generatedAt: "stable",
    importer: "game-data",
    itemIds: source.items.map((item) => item.id),
    shopIds: source.shops.map((shop) => shop.id),
    enemyIds: source.enemies.map((enemy) => enemy.id),
    battleGroupIds: source.battleGroups.map((group) => group.id),
  };
}

export async function importGameData(): Promise<void> {
  await writeStableJsonFile(battleOutputFile, await buildBattleContentPack());
  await writeStableJsonFile(reportOutputFile, await buildGameDataImportReport());
  console.log(`Generated ${path.relative(process.cwd(), battleOutputFile)}`);
  console.log(`Generated ${path.relative(process.cwd(), reportOutputFile)}`);
}
