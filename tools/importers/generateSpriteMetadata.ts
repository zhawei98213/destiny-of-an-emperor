import path from "node:path";
import { generatedRoot, sourceRoot, writeStableJsonFile } from "../lib/importerCore";
import { loadSpriteSheetSource } from "../lib/sourceSchemas";

export interface SpriteMetadataOutput {
  generatedAt: "stable";
  imagePath: string;
  sheetId: string;
  tileHeight: number;
  tileWidth: number;
  frames: Array<{
    frame: { x: number; y: number; w: number; h: number };
    id: string;
  }>;
}

const sourceFile = path.join(sourceRoot, "sprites", "demo-sheet.source.json");
const outputFile = path.join(generatedRoot, "sprite-metadata.generated.json");

export async function buildSpriteMetadata(): Promise<SpriteMetadataOutput> {
  const source = await loadSpriteSheetSource(sourceFile);
  return {
    generatedAt: "stable",
    imagePath: source.imagePath,
    sheetId: source.sheetId,
    tileHeight: source.tileHeight,
    tileWidth: source.tileWidth,
    frames: source.frames.map((frame) => ({
      frame: {
        x: frame.x,
        y: frame.y,
        w: frame.width,
        h: frame.height,
      },
      id: frame.id,
    })),
  };
}

export async function generateSpriteMetadata(): Promise<void> {
  await writeStableJsonFile(outputFile, await buildSpriteMetadata());
  console.log(`Generated ${path.relative(process.cwd(), outputFile)}`);
}
