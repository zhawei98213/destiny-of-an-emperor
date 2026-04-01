import Phaser from "phaser";
import { AssetRegistry } from "@/assets/assetRegistry";
import { getCurrentActor, runAttackTurn, type BattleState, createBattleState } from "@/battle/battleRuntime";
import {
  ASSET_REGISTRY_KEY,
  BATTLE_REQUEST_REGISTRY_KEY,
  CONTENT_REGISTRY_KEY,
  GAME_STATE_REGISTRY_KEY,
} from "@/content/contentKeys";
import { SceneKey } from "@/core/sceneRegistry";
import { GameStateRuntime } from "@/systems/gameStateRuntime";
import type { BattleRequest, ContentDatabase } from "@/types/content";

export class BattleScene extends Phaser.Scene {
  private static readonly AutoTurnDelayMs = 450;

  private contentDatabase?: ContentDatabase;

  private gameStateRuntime?: GameStateRuntime;

  private battleState?: BattleState;

  private assetRegistry?: AssetRegistry;

  private attackKey?: Phaser.Input.Keyboard.Key;

  private advanceKey?: Phaser.Input.Keyboard.Key;

  private nextAutoTurnAt = 0;

  private allyText?: Phaser.GameObjects.Text;

  private enemyText?: Phaser.GameObjects.Text;

  private promptText?: Phaser.GameObjects.Text;

  private logText?: Phaser.GameObjects.Text;

  constructor() {
    super(SceneKey.Battle);
  }

  create(): void {
    this.contentDatabase = this.registry.get(CONTENT_REGISTRY_KEY) as ContentDatabase | undefined;
    this.gameStateRuntime = this.registry.get(GAME_STATE_REGISTRY_KEY) as GameStateRuntime | undefined;
    this.assetRegistry = this.registry.get(ASSET_REGISTRY_KEY) as AssetRegistry | undefined;
    const request = this.registry.get(BATTLE_REQUEST_REGISTRY_KEY) as BattleRequest | undefined;
    if (!this.contentDatabase || !this.gameStateRuntime || !request) {
      this.scene.start(SceneKey.World);
      return;
    }

    this.battleState = createBattleState(
      this.contentDatabase,
      this.gameStateRuntime.getSnapshot(),
      request,
    );
    this.attackKey = this.input.keyboard?.addKey("A");
    this.advanceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const panelStyle = this.assetRegistry?.resolvePanelStyle("ui.battle-panel", { mapId: request.originMapId });
    this.cameras.main.setBackgroundColor(panelStyle?.backgroundColor ?? "#1f2937");

    this.add.text(24, 20, "Battle / 战斗", {
      color: panelStyle?.titleColor ?? "#f8fafc",
      fontFamily: "monospace",
      fontSize: "20px",
    });
    this.allyText = this.add.text(24, 70, "", {
      color: panelStyle?.bodyColor ?? "#bfdbfe",
      fontFamily: "monospace",
      fontSize: "13px",
    });
    this.enemyText = this.add.text(360, 70, "", {
      color: panelStyle?.bodyColor ?? "#fecaca",
      fontFamily: "monospace",
      fontSize: "13px",
    });
    this.promptText = this.add.text(24, 280, "", {
      color: panelStyle?.accentColor ?? "#fef3c7",
      fontFamily: "monospace",
      fontSize: "13px",
    });
    this.logText = this.add.text(24, 310, "", {
      color: panelStyle?.bodyColor ?? "#e5e7eb",
      fontFamily: "monospace",
      fontSize: "12px",
      wordWrap: { width: 592 },
    });
    this.renderBattle();
  }

  update(time: number): void {
    if (!this.battleState) {
      return;
    }

    if (this.battleState.outcome) {
      if (this.advanceKey && Phaser.Input.Keyboard.JustDown(this.advanceKey)) {
        this.finishBattle();
      }
      return;
    }

    const actor = getCurrentActor(this.battleState);
    if (!actor) {
      return;
    }

    if (actor.side === "ally") {
      if (this.attackKey && Phaser.Input.Keyboard.JustDown(this.attackKey)) {
        this.battleState = runAttackTurn(this.battleState).state;
        this.renderBattle();
      }
      return;
    }

    if (time < this.nextAutoTurnAt) {
      return;
    }

    this.battleState = runAttackTurn(this.battleState).state;
    this.nextAutoTurnAt = time + BattleScene.AutoTurnDelayMs;
    this.renderBattle();
  }

  private finishBattle(): void {
    if (!this.battleState?.outcome || !this.gameStateRuntime) {
      this.scene.start(SceneKey.World);
      return;
    }

    this.gameStateRuntime.applyBattleResult(this.battleState.outcome);
    this.registry.remove(BATTLE_REQUEST_REGISTRY_KEY);
    this.scene.start(SceneKey.World);
  }

  private renderBattle(): void {
    if (!this.battleState || !this.allyText || !this.enemyText || !this.promptText || !this.logText) {
      return;
    }

    const allies = this.battleState.units.filter((unit) => unit.side === "ally");
    const enemies = this.battleState.units.filter((unit) => unit.side === "enemy");
    this.allyText.setText([
      "Allies / 我方",
      ...allies.map((unit) => `${unit.name} LV ${unit.level} HP ${unit.currentHp}/${unit.maxHp} MP ${unit.currentMp}/${unit.maxMp}`),
    ]);
    this.enemyText.setText([
      "Enemies / 敌方",
      ...enemies.map((unit) => `${unit.name} HP ${unit.currentHp}/${unit.maxHp}`),
    ]);

    if (this.battleState.outcome) {
      const rewards = this.battleState.outcome.rewards;
      const itemSummary = rewards.items.length > 0
        ? rewards.items.map((item) => `${item.itemId} x${item.quantity}`).join(", ")
        : "none / 无";
      this.promptText.setText([
        this.battleState.outcome.outcome === "victory"
          ? "Victory. Press Space to return. / 胜利，按 Space 返回。"
          : "Defeat. Press Space to return. / 失败，按 Space 返回。",
        `Gold / 金钱: ${rewards.gold}`,
        `EXP / 经验: ${rewards.experience}`,
        `Drops / 掉落: ${itemSummary}`,
      ]);
    } else {
      const actor = getCurrentActor(this.battleState);
      this.promptText.setText(
        actor?.side === "ally"
          ? `A: Attack / A 普通攻击\nTurn / 当前行动: ${actor.name}`
          : `Enemy turn... / 敌方行动中...\nTurn / 当前行动: ${actor?.name ?? ""}`,
      );
    }

    this.logText.setText(this.battleState.log.slice(-6).join("\n"));
  }
}
