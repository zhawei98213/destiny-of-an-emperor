import Phaser from "phaser";
import {
  CONTENT_REGISTRY_KEY,
  GAME_STATE_REGISTRY_KEY,
  WORLD_RUNTIME_REGISTRY_KEY,
} from "@/content/contentKeys";
import { SceneKey } from "@/core/sceneRegistry";
import type { WarpTarget } from "@/systems/eventInterpreter";
import type { ContentDatabase, Facing } from "@/types/content";
import { createEventRuntime, EventInterpreter } from "@/systems/eventInterpreter";
import { GameStateRuntime } from "@/systems/gameStateRuntime";
import { DialogueBox } from "@/ui/dialogueBox";
import { DialogueSession } from "@/ui/dialogueSession";
import { renderWorldMap } from "@/world/renderWorldMap";
import { findNpcInFront } from "@/world/worldInteraction";
import { findNpcInteractionTrigger, findTriggersAtPoint } from "@/world/worldTriggerResolver";
import { WorldRuntime } from "@/world/worldRuntime";

export class WorldScene extends Phaser.Scene {
  private static readonly MoveIntervalMs = 130;

  private static readonly CameraZoom = 2;

  private static readonly NpcBodyColor = 0xf59e0b;

  private hero?: Phaser.GameObjects.Rectangle;

  private facingMarker?: Phaser.GameObjects.Rectangle;

  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

  private battleKey?: Phaser.Input.Keyboard.Key;

  private interactKey?: Phaser.Input.Keyboard.Key;

  private fastDialogueKey?: Phaser.Input.Keyboard.Key;

  private worldRuntime?: WorldRuntime;

  private contentDatabase?: ContentDatabase;

  private gameStateRuntime?: GameStateRuntime;

  private dialogueBox?: DialogueBox;

  private dialogueSession?: DialogueSession;

  private pendingWarpTarget?: WarpTarget;

  private pendingBattleGroupId?: string;

  private readonly eventInterpreter = new EventInterpreter();

  private nextMoveAt = 0;

  constructor() {
    super(SceneKey.World);
  }

  create(): void {
    this.contentDatabase = this.registry.get(CONTENT_REGISTRY_KEY) as ContentDatabase | undefined;
    this.gameStateRuntime = this.registry.get(GAME_STATE_REGISTRY_KEY) as GameStateRuntime | undefined;
    this.worldRuntime = this.registry.get(WORLD_RUNTIME_REGISTRY_KEY) as WorldRuntime | undefined;
    if (!this.contentDatabase || !this.gameStateRuntime || !this.worldRuntime) {
      throw new Error("WorldScene requires bootstrapped content and world runtime.");
    }

    this.cameras.main.setBackgroundColor("#0f172a");
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.battleKey = this.input.keyboard?.addKey("B");
    this.interactKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.fastDialogueKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.dialogueBox = new DialogueBox(this);
    this.renderCurrentMap();
  }

  update(time: number, delta: number): void {
    if (!this.hero || !this.worldRuntime) {
      return;
    }

    if (this.updateDialogue(delta)) {
      return;
    }

    if (this.interactKey && Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      this.tryStartNpcInteraction();
      if (this.dialogueSession) {
        return;
      }
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
      return;
    }

    this.tryStartStepTriggers();
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

    this.renderNpcs();
    this.syncHeroToRuntime();

    const mapWidthPx = map.width * map.tileWidth;
    const mapHeightPx = map.height * map.tileHeight;
    this.cameras.main.setZoom(WorldScene.CameraZoom);
    this.cameras.main.setBounds(0, 0, mapWidthPx, mapHeightPx);
    this.cameras.main.startFollow(this.hero, true, 0.2, 0.2);
    this.cameras.main.roundPixels = true;

    this.add.text(8, 8, `${map.name}\nArrow keys move\nSpace talks\nB enters battle`, {
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

  private renderNpcs(): void {
    if (!this.worldRuntime) {
      return;
    }

    const map = this.worldRuntime.getCurrentMap();
    map.npcs.forEach((npc) => {
      const centerX = (npc.x * map.tileWidth) + (map.tileWidth / 2);
      const centerY = (npc.y * map.tileHeight) + (map.tileHeight / 2);
      const npcSprite = this.add.rectangle(
        centerX,
        centerY,
        map.tileWidth - 4,
        map.tileHeight - 4,
        WorldScene.NpcBodyColor,
        1,
      );
      npcSprite.setStrokeStyle(2, 0x451a03);

      const facingOffsetX = npc.facing === "left" ? -4 : npc.facing === "right" ? 4 : 0;
      const facingOffsetY = npc.facing === "up" ? -4 : npc.facing === "down" ? 4 : 0;
      this.add.rectangle(centerX + facingOffsetX, centerY + facingOffsetY, 4, 4, 0x1d4ed8, 1);
    });
  }

  private tryStartNpcInteraction(): void {
    if (!this.worldRuntime || !this.contentDatabase || !this.gameStateRuntime) {
      return;
    }

    const map = this.worldRuntime.getCurrentMap();
    const state = this.worldRuntime.getState();
    const npc = findNpcInFront(map, state);
    if (!npc) {
      return;
    }

    const trigger = findNpcInteractionTrigger(map, npc.id);
    if (!trigger) {
      return;
    }

    this.executeTrigger(trigger.id);
  }

  private updateDialogue(delta: number): boolean {
    if (!this.dialogueSession) {
      return false;
    }

    const accelerated = this.fastDialogueKey?.isDown ?? false;
    const effectiveDelta = Number.isFinite(delta) && delta > 0 ? delta : 16;
    const view = this.dialogueSession.update(effectiveDelta, accelerated);
    if (view) {
      this.dialogueBox?.show(view);
    }

    if (this.interactKey && Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      const nextView = this.dialogueSession.advance();
      if (nextView?.isComplete) {
        this.dialogueBox?.hide();
        this.dialogueSession = undefined;
        this.applyPendingEventEffects();
      } else if (nextView) {
        this.dialogueBox?.show(nextView);
      }
    }

    return true;
  }

  private tryStartStepTriggers(): void {
    if (!this.worldRuntime) {
      return;
    }

    const map = this.worldRuntime.getCurrentMap();
    const state = this.worldRuntime.getState();
    const currentTileTriggers = findTriggersAtPoint(map, {
      x: state.playerX,
      y: state.playerY,
    });

    const trigger = currentTileTriggers[0];
    if (!trigger) {
      return;
    }

    this.executeTrigger(trigger.id);
  }

  private executeTrigger(triggerId: string): void {
    if (!this.worldRuntime || !this.contentDatabase || !this.gameStateRuntime) {
      return;
    }

    const map = this.worldRuntime.getCurrentMap();
    const trigger = map.triggers.find((entry) => entry.id === triggerId);
    if (!trigger) {
      throw new Error(`WorldScene could not find trigger "${triggerId}" on map "${map.id}".`);
    }

    if (trigger.once && this.gameStateRuntime.isTriggerConsumed(trigger.id)) {
      return;
    }

    const event = this.contentDatabase.events.find((entry) => entry.id === trigger.eventId);
    if (!event) {
      throw new Error(`WorldScene could not find event "${trigger.eventId}" for trigger "${trigger.id}".`);
    }

    const worldState = this.worldRuntime.getState();
    const snapshot = this.gameStateRuntime.getSnapshot();
    const runtime = createEventRuntime(this.contentDatabase, {
      flags: snapshot.flags,
      inventory: snapshot.inventory,
      partyMemberIds: snapshot.partyMemberIds,
      world: {
        currentMapId: worldState.currentMapId,
        currentSpawnPointId: worldState.currentSpawnId,
      },
    });

    this.eventInterpreter.execute(event, this.contentDatabase, runtime);
    this.gameStateRuntime.applyEventRuntime(runtime);
    if (trigger.once) {
      this.gameStateRuntime.consumeTrigger(trigger.id);
    }

    this.pendingWarpTarget = runtime.pendingWarp;
    this.pendingBattleGroupId = runtime.startedBattleGroupIds.at(-1);

    if (runtime.dialogueLog.length > 0) {
      this.dialogueSession = new DialogueSession(runtime.dialogueLog);
      const initialView = this.dialogueSession.getView();
      if (initialView) {
        this.dialogueBox?.show(initialView);
      }
      return;
    }

    this.applyPendingEventEffects();
  }

  private applyPendingEventEffects(): void {
    if (this.pendingWarpTarget && this.worldRuntime) {
      this.worldRuntime.setSpawn(this.pendingWarpTarget.mapId, this.pendingWarpTarget.spawnPointId);
      this.pendingWarpTarget = undefined;
      this.pendingBattleGroupId = undefined;
      this.scene.restart();
      return;
    }

    if (this.pendingBattleGroupId) {
      this.pendingBattleGroupId = undefined;
      this.scene.start(SceneKey.Battle);
    }
  }
}
