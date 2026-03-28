import Phaser from "phaser";
import { SceneKey } from "@/core/sceneRegistry";

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SceneKey.Boot);
  }

  preload(): void {
    this.load.json("bootstrap-content", "/content/manual/bootstrap.content.json");
  }

  create(): void {
    this.scene.start(SceneKey.Title);
  }
}
