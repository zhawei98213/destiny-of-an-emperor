import Phaser from "phaser";
import { BattleScene } from "@/scenes/BattleScene";
import { BootScene } from "@/scenes/BootScene";
import { TitleScene } from "@/scenes/TitleScene";
import { WorldScene } from "@/scenes/WorldScene";

export const SceneKey = {
  Boot: "BootScene",
  Title: "TitleScene",
  World: "WorldScene",
  Battle: "BattleScene",
} as const;

export type SceneKey = (typeof SceneKey)[keyof typeof SceneKey];

export function buildSceneRegistry(): Phaser.Types.Scenes.SceneType[] {
  return [BootScene, TitleScene, WorldScene, BattleScene];
}

export function createGameConfig(parent = "app"): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: 640,
    height: 360,
    backgroundColor: "#111827",
    pixelArt: true,
    scene: buildSceneRegistry(),
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  };
}
