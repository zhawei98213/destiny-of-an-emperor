import path from "node:path";
import { generatedRoot, sourceRoot, writeStableJsonFile } from "../lib/importerCore";
import { loadMapSource } from "../lib/sourceSchemas";

export interface MapImportReport {
  generatedAt: "stable";
  importer: "map-content";
  maps: Array<{
    id: string;
    name: string;
    size: { width: number; height: number };
    portalCount: number;
    spawnPointCount: number;
    triggerCount: number;
  }>;
}

const sourceFile = path.join(sourceRoot, "maps", "demo-maps.source.json");
const outputFile = path.join(generatedRoot, "import-staging", "map-content.generated.json");

export async function buildMapImportReport(): Promise<MapImportReport> {
  const source = await loadMapSource(sourceFile);
  return {
    generatedAt: "stable",
    importer: "map-content",
    maps: source.maps.map((map) => ({
      id: map.id,
      name: map.name,
      size: {
        width: map.width,
        height: map.height,
      },
      portalCount: map.portals.length,
      spawnPointCount: map.spawnPoints.length,
      triggerCount: map.triggers.length,
    })),
  };
}

export async function importMapContent(): Promise<void> {
  await writeStableJsonFile(outputFile, await buildMapImportReport());
  console.log(`Generated ${path.relative(process.cwd(), outputFile)}`);
}
