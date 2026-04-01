import Phaser from "phaser";
import type { MapDefinition, TilesetPaletteAssetResource } from "@/types/content";

function getTileColor(tileId: number, palette: TilesetPaletteAssetResource): number {
  const tileColor = palette.tileColors[String(tileId)] ?? "#f43f5e";
  return Phaser.Display.Color.HexStringToColor(tileColor).color;
}

export function renderWorldMap(
  scene: Phaser.Scene,
  map: MapDefinition,
  palette: TilesetPaletteAssetResource,
): void {
  for (const layer of map.tileLayers) {
    for (let y = 0; y < layer.height; y += 1) {
      for (let x = 0; x < layer.width; x += 1) {
        const tileId = layer.tiles[(y * layer.width) + x] ?? 0;
        const centerX = (x * map.tileWidth) + (map.tileWidth / 2);
        const centerY = (y * map.tileHeight) + (map.tileHeight / 2);

        scene.add.rectangle(
          centerX,
          centerY,
          map.tileWidth,
          map.tileHeight,
          getTileColor(tileId, palette),
          1,
        ).setStrokeStyle(tileId === 3 ? 1 : 0, 0x1f2937, 0.85);
      }
    }
  }
}
