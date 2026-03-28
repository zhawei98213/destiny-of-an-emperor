import type Phaser from "phaser";
import type { MapDefinition } from "@/types/content";

const TILE_PALETTE: Record<number, number> = {
  0: 0x0f172a,
  1: 0x5f8f3f,
  2: 0xc8a65a,
  3: 0x59626d,
  4: 0x3b82c4,
  5: 0x31572c,
};

function getTileColor(tileId: number): number {
  return TILE_PALETTE[tileId] ?? 0xf43f5e;
}

export function renderWorldMap(scene: Phaser.Scene, map: MapDefinition): void {
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
          getTileColor(tileId),
          1,
        ).setStrokeStyle(tileId === 3 ? 1 : 0, 0x1f2937, 0.85);
      }
    }
  }
}
