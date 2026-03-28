import Phaser from "phaser";
import { SceneKey } from "@/core/sceneRegistry";

export class WorldScene extends Phaser.Scene {
  private hero?: Phaser.GameObjects.Rectangle;

  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

  private battleKey?: Phaser.Input.Keyboard.Key;

  constructor() {
    super(SceneKey.World);
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#14532d");

    const map = this.add.rectangle(320, 180, 480, 240, 0x3f6212, 1);
    map.setStrokeStyle(4, 0x84cc16);

    this.hero = this.add.rectangle(320, 180, 18, 18, 0xf8fafc, 1);
    this.hero.setStrokeStyle(2, 0x1e293b);

    this.add.text(24, 24, "World Placeholder", {
      color: "#fef08a",
      fontFamily: "sans-serif",
      fontSize: "18px",
    });

    this.add.text(24, 52, "Arrow keys move. B enters battle.", {
      color: "#f8fafc",
      fontFamily: "sans-serif",
      fontSize: "14px",
    });

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.battleKey = this.input.keyboard?.addKey("B");
  }

  update(): void {
    if (!this.hero) {
      return;
    }

    const speed = 2;
    if (this.cursors?.left?.isDown) this.hero.x -= speed;
    if (this.cursors?.right?.isDown) this.hero.x += speed;
    if (this.cursors?.up?.isDown) this.hero.y -= speed;
    if (this.cursors?.down?.isDown) this.hero.y += speed;
    this.hero.x = Phaser.Math.Clamp(this.hero.x, 92, 548);
    this.hero.y = Phaser.Math.Clamp(this.hero.y, 72, 288);

    if (this.battleKey && Phaser.Input.Keyboard.JustDown(this.battleKey)) {
      this.scene.start(SceneKey.Battle);
    }
  }
}
