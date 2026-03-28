import Phaser from "phaser";
import { CONTENT_REGISTRY_KEY, WORLD_RUNTIME_REGISTRY_KEY } from "@/content/contentKeys";
import { SceneKey } from "@/core/sceneRegistry";
import type { ContentDatabase, Facing } from "@/types/content";
import { renderWorldMap } from "@/world/renderWorldMap";
import { WorldRuntime } from "@/world/worldRuntime";

export class WorldScene extends Phaser.Scene {
  private static readonly MoveIntervalMs = 130;

  private static readonly CameraZoom = 2;

  private hero?: Phaser.GameObjects.Rectangle;

  private facingMarker?: Phaser.GameObjects.Rectangle;

  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

  private battleKey?: Phaser.Input.Keyboard.Key;

  private worldRuntime?: WorldRuntime;

  private nextMoveAt = 0;

  constructor() {
    super(SceneKey.World);
  }

  create(): void {
    const contentDatabase = this.registry.get(CONTENT_REGISTRY_KEY) as ContentDatabase | undefined;
    this.worldRuntime = this.registry.get(WORLD_RUNTIME_REGISTRY_KEY) as WorldRuntime | undefined;
    if (!contentDatabase || !this.worldRuntime) {
      throw new Error("WorldScene requires bootstrapped content and world runtime.");
    }

    this.cameras.main.setBackgroundColor("#0f172a");
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.battleKey = this.input.keyboard?.addKey("B");
    this.renderCurrentMap();
  }

  update(time: number): void {
    if (!this.hero || !this.worldRuntime) {
      return;
    }

    if (this.battleKey && Phaser.Input.Keyboard.JustDown(this.battleKey)) {
      this.scene.start(SceneKey.Battle);
      return;
    }

    if (time < this.nextMoveAt) {
      return;
    }

    const direction = this.getMovementDirection();
    if (!direction) {
      return;
    }

    const result = this.worldRuntime.move(direction);
    this.syncHeroToRuntime();
    this.nextMoveAt = time + WorldScene.MoveIntervalMs;

    if (result.type === "portal") {
      this.scene.restart();
    }
  }

  private getMovementDirection(): Facing | undefined {
    if (this.cursors?.left?.isDown) {
      return "left";
    }

    if (this.cursors?.right?.isDown) {
      return "right";
    }

    if (this.cursors?.up?.isDown) {
      return "up";
    }

    if (this.cursors?.down?.isDown) {
      return "down";
    }

    return undefined;
  }

  private renderCurrentMap(): void {
    if (!this.worldRuntime) {
      return;
    }

    const map = this.worldRuntime.getCurrentMap();
    renderWorldMap(this, map);

    this.hero = this.add.rectangle(0, 0, map.tileWidth - 4, map.tileHeight - 4, 0xf8fafc, 1);
    this.hero.setStrokeStyle(2, 0x0f172a);
    this.facingMarker = this.add.rectangle(0, 0, 4, 4, 0xdc2626, 1);

    this.syncHeroToRuntime();

    const mapWidthPx = map.width * map.tileWidth;
    const mapHeightPx = map.height * map.tileHeight;
    this.cameras.main.setZoom(WorldScene.CameraZoom);
    this.cameras.main.setBounds(0, 0, mapWidthPx, mapHeightPx);
    this.cameras.main.startFollow(this.hero, true, 0.2, 0.2);
    this.cameras.main.roundPixels = true;

    this.add.text(8, 8, `${map.name}\nArrow keys move\nB enters battle`, {
      color: "#f8fafc",
      fontFamily: "monospace",
      fontSize: "10px",
      backgroundColor: "#0f172acc",
      padding: {
        x: 4,
        y: 4,
      },
    }).setScrollFactor(0);
  }

  private syncHeroToRuntime(): void {
    if (!this.hero || !this.facingMarker || !this.worldRuntime) {
      return;
    }

    const map = this.worldRuntime.getCurrentMap();
    const state = this.worldRuntime.getState();
    const heroX = (state.playerX * map.tileWidth) + (map.tileWidth / 2);
    const heroY = (state.playerY * map.tileHeight) + (map.tileHeight / 2);
    this.hero.setPosition(heroX, heroY);

    const markerOffsetX = state.facing === "left" ? -4 : state.facing === "right" ? 4 : 0;
    const markerOffsetY = state.facing === "up" ? -4 : state.facing === "down" ? 4 : 0;
    this.facingMarker.setPosition(heroX + markerOffsetX, heroY + markerOffsetY);
  }
}
