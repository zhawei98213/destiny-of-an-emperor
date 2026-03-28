import Phaser from "phaser";
import { SceneKey } from "@/core/sceneRegistry";

export class TitleScene extends Phaser.Scene {
  constructor() {
    super(SceneKey.Title);
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#0f172a");

    this.add.text(320, 130, "Destiny of an Emperor", {
      color: "#f8fafc",
      fontFamily: "sans-serif",
      fontSize: "28px",
    }).setOrigin(0.5);

    this.add.text(320, 200, "Press Enter or click to start", {
      color: "#cbd5e1",
      fontFamily: "sans-serif",
      fontSize: "16px",
    }).setOrigin(0.5);

    this.input.keyboard?.once("keydown-ENTER", () => {
      this.scene.start(SceneKey.World);
    });

    this.input.once("pointerdown", () => {
      this.scene.start(SceneKey.World);
    });
  }
}
