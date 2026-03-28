import Phaser from "phaser";
import { BrowserContentReader, loadContentDatabase } from "@/content/contentLoader";
import {
  CONTENT_REGISTRY_KEY,
  DEFAULT_CONTENT_MANIFESTS,
  GAME_STATE_REGISTRY_KEY,
  WORLD_RUNTIME_REGISTRY_KEY,
} from "@/content/contentKeys";
import { SceneKey } from "@/core/sceneRegistry";
import { GameStateRuntime } from "@/systems/gameStateRuntime";
import { WorldRuntime } from "@/world/worldRuntime";

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SceneKey.Boot);
  }

  create(): void {
    void this.bootstrap();
  }

  private async bootstrap(): Promise<void> {
    try {
      const database = await loadContentDatabase(
        new BrowserContentReader(),
        DEFAULT_CONTENT_MANIFESTS,
      );
      this.registry.set(CONTENT_REGISTRY_KEY, database);
      this.registry.set(GAME_STATE_REGISTRY_KEY, new GameStateRuntime(database));
      this.registry.set(WORLD_RUNTIME_REGISTRY_KEY, new WorldRuntime(database));
      this.scene.start(SceneKey.Title);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown content boot error";
      this.add.text(24, 24, `Boot failed\n${message}`, {
        color: "#fecaca",
        fontFamily: "monospace",
        fontSize: "14px",
        wordWrap: { width: 592 },
      });
      throw error;
    }
  }
}
