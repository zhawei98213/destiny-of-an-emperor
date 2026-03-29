import path from "node:path";
import { readdir } from "node:fs/promises";
import { generatedRoot, sourceRoot, writeStableJsonFile } from "../lib/importerCore";
import { loadMapSource } from "../lib/sourceSchemas";

export interface MapImportReport {
  generatedAt: "stable";
  importer: "map-content";
  sourceFiles: string[];
  maps: Array<{
    id: string;
    name: string;
    sourceFile: string;
    size: { width: number; height: number };
    collisionLayerCount: number;
    npcCount: number;
    portalCount: number;
    spawnPointCount: number;
    triggerCount: number;
  }>;
}

const mapSourceDir = path.join(sourceRoot, "maps");
const outputFile = path.join(generatedRoot, "import-staging", "map-content.generated.json");

interface LoadedMapSourceFile {
  fileName: string;
  document: Awaited<ReturnType<typeof loadMapSource>>;
}

async function loadMapSourceFiles(): Promise<LoadedMapSourceFile[]> {
  const entries = await readdir(mapSourceDir, { withFileTypes: true });
  const sourceFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".source.json"))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  return Promise.all(sourceFiles.map(async (fileName) => ({
    fileName,
    document: await loadMapSource(path.join(mapSourceDir, fileName)),
  })));
}

export async function buildMapImportReport(): Promise<MapImportReport> {
  const sourceFiles = await loadMapSourceFiles();
  return {
    generatedAt: "stable",
    importer: "map-content",
    sourceFiles: sourceFiles.map((entry) => entry.fileName),
    maps: sourceFiles.flatMap((sourceFile) => sourceFile.document.maps.map((map) => ({
      id: map.id,
      name: map.name,
      sourceFile: sourceFile.fileName,
      size: {
        width: map.width,
        height: map.height,
      },
      collisionLayerCount: map.collisionLayers.length,
      npcCount: map.npcs.length,
      portalCount: map.portals.length,
      spawnPointCount: map.spawnPoints.length,
      triggerCount: map.triggers.length,
    }))),
  };
}

export async function importMapContent(): Promise<void> {
  await writeStableJsonFile(outputFile, await buildMapImportReport());
  console.log(`Generated ${path.relative(process.cwd(), outputFile)}`);
}
