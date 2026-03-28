import { describe, expect, it } from "vitest";
import { buildSceneRegistry, createGameConfig, SceneKey } from "@/core/sceneRegistry";
import { BattleScene } from "@/scenes/BattleScene";
import { BootScene } from "@/scenes/BootScene";
import { TitleScene } from "@/scenes/TitleScene";
import { WorldScene } from "@/scenes/WorldScene";

describe("scene registry", () => {
  it("registers the boot-first scene flow", () => {
    const registry = buildSceneRegistry();
    expect(registry).toEqual([BootScene, TitleScene, WorldScene, BattleScene]);
  });

  it("creates a game config that starts from boot", () => {
    const config = createGameConfig("test-root");
    const scenes = Array.isArray(config.scene) ? config.scene : [config.scene];
    expect(config.parent).toBe("test-root");
    expect(scenes[0]).toBe(BootScene);
    expect(new BootScene().sys.settings.key).toBe(SceneKey.Boot);
    expect(new TitleScene().sys.settings.key).toBe(SceneKey.Title);
    expect(new WorldScene().sys.settings.key).toBe(SceneKey.World);
    expect(new BattleScene().sys.settings.key).toBe(SceneKey.Battle);
  });
});
