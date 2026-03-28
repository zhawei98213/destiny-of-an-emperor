import Phaser from "phaser";
import { SceneKey } from "@/core/sceneRegistry";

export class BattleScene extends Phaser.Scene {
  constructor() {
    super(SceneKey.Battle);
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#3f0d12");

    this.add.text(320, 150, "Battle Placeholder", {
      color: "#f8fafc",
      fontFamily: "sans-serif",
      fontSize: "24px",
    }).setOrigin(0.5);

    this.add.text(320, 205, "Press Esc to return to world", {
      color: "#fecaca",
      fontFamily: "sans-serif",
      fontSize: "14px",
    }).setOrigin(0.5);

    this.input.keyboard?.once("keydown-ESC", () => {
      this.scene.start(SceneKey.World);
    });
  }
}
