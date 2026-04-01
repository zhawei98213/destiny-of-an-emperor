import Phaser from "phaser";
import { AssetRegistry } from "@/assets/assetRegistry";
import {
  ASSET_REGISTRY_KEY,
  BATTLE_REQUEST_REGISTRY_KEY,
  CONTENT_REGISTRY_KEY,
  GAME_STATE_REGISTRY_KEY,
  SAVE_MANAGER_REGISTRY_KEY,
  WORLD_RUNTIME_REGISTRY_KEY,
} from "@/content/contentKeys";
import { SceneKey } from "@/core/sceneRegistry";
import type { WarpTarget } from "@/systems/eventInterpreter";
import type { BattleRequest, ContentDatabase, Facing } from "@/types/content";
import { createEventRuntime, EventInterpreter } from "@/systems/eventInterpreter";
import { GameStateRuntime } from "@/systems/gameStateRuntime";
import { SaveManager } from "@/systems/saveManager";
import { DialogueBox } from "@/ui/dialogueBox";
import { DialogueSession } from "@/ui/dialogueSession";
import { MenuController } from "@/ui/menuController";
import { MenuOverlay } from "@/ui/menuOverlay";
import { buildShopViewModel, ShopOverlay } from "@/ui/shopOverlay";
import { resolveRegionEncounter } from "@/world/worldEncounterRuntime";
import { renderWorldMap } from "@/world/renderWorldMap";
import { findNpcInFront } from "@/world/worldInteraction";
import {
  findEncounterTriggersAtPoint,
  findNpcInteractionTrigger,
  findTriggersAtPoint,
} from "@/world/worldTriggerResolver";
import { WorldRuntime } from "@/world/worldRuntime";

export class WorldScene extends Phaser.Scene {
  private static readonly MoveIntervalMs = 130;

  private static readonly CameraZoom = 2;

  private hero?: Phaser.GameObjects.Rectangle;

  private facingMarker?: Phaser.GameObjects.Rectangle;

  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

  private interactKey?: Phaser.Input.Keyboard.Key;

  private fastDialogueKey?: Phaser.Input.Keyboard.Key;

  private menuKey?: Phaser.Input.Keyboard.Key;

  private menuNextKey?: Phaser.Input.Keyboard.Key;

  private menuPreviousKey?: Phaser.Input.Keyboard.Key;

  private menuSaveKey?: Phaser.Input.Keyboard.Key;

  private menuLoadKey?: Phaser.Input.Keyboard.Key;

  private cancelKey?: Phaser.Input.Keyboard.Key;

  private worldRuntime?: WorldRuntime;

  private contentDatabase?: ContentDatabase;

  private gameStateRuntime?: GameStateRuntime;

  private saveManager?: SaveManager;

  private assetRegistry?: AssetRegistry;

  private dialogueBox?: DialogueBox;

  private dialogueSession?: DialogueSession;

  private menuController?: MenuController;

  private shopOverlay?: ShopOverlay;

  private activeShopId?: string;

  private pendingWarpTarget?: WarpTarget;

  private pendingBattleGroupId?: string;

  private pendingBattleTriggerId?: string;

  private pendingShopId?: string;

  private readonly eventInterpreter = new EventInterpreter();

  private nextMoveAt = 0;

  constructor() {
    super(SceneKey.World);
  }

  create(): void {
    this.contentDatabase = this.registry.get(CONTENT_REGISTRY_KEY) as ContentDatabase | undefined;
    this.gameStateRuntime = this.registry.get(GAME_STATE_REGISTRY_KEY) as GameStateRuntime | undefined;
    this.saveManager = this.registry.get(SAVE_MANAGER_REGISTRY_KEY) as SaveManager | undefined;
    this.worldRuntime = this.registry.get(WORLD_RUNTIME_REGISTRY_KEY) as WorldRuntime | undefined;
    this.assetRegistry = this.registry.get(ASSET_REGISTRY_KEY) as AssetRegistry | undefined;
    if (!this.contentDatabase || !this.gameStateRuntime || !this.saveManager || !this.worldRuntime || !this.assetRegistry) {
      throw new Error("WorldScene requires bootstrapped content and world runtime.");
    }

    this.cameras.main.setBackgroundColor("#0f172a");
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.interactKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.fastDialogueKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.menuKey = this.input.keyboard?.addKey("M");
    this.menuNextKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.menuPreviousKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.menuSaveKey = this.input.keyboard?.addKey("S");
    this.menuLoadKey = this.input.keyboard?.addKey("L");
    this.cancelKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.dialogueBox = new DialogueBox(this);
    this.shopOverlay = new ShopOverlay();
    this.menuController = new MenuController(
      new MenuOverlay(),
      this.contentDatabase,
      this.gameStateRuntime,
      this.worldRuntime,
      this.saveManager,
    );
    this.gameStateRuntime.syncWorldState(this.worldRuntime.getState());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.menuController?.destroy();
      this.shopOverlay?.destroy();
    });
    this.renderCurrentMap();
  }

  update(time: number, delta: number): void {
    if (!this.hero || !this.worldRuntime || !this.assetRegistry) {
      return;
    }

    const currentMapId = this.worldRuntime.getCurrentMap().id;
    const assetRegistry = this.assetRegistry;

    if (this.menuKey && Phaser.Input.Keyboard.JustDown(this.menuKey)) {
      this.menuController?.toggle(assetRegistry.resolvePanelStyle("ui.menu-overlay", {
        mapId: currentMapId,
      }));
      return;
    }

    if (this.menuController?.isMenuOpen()) {
      this.handleMenuInput();
      this.menuController.refresh(assetRegistry.resolvePanelStyle("ui.menu-overlay", {
        mapId: currentMapId,
      }));
      return;
    }

    if (this.updateShop()) {
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

    if (time < this.nextMoveAt) {
      return;
    }

    const direction = this.getMovementDirection();
    if (!direction) {
      return;
    }

    const result = this.worldRuntime.move(direction);
    this.gameStateRuntime?.syncWorldState(result.state);
    this.syncHeroToRuntime();
    this.nextMoveAt = time + WorldScene.MoveIntervalMs;

    if (result.type === "portal") {
      this.scene.restart();
      return;
    }

    if (result.type !== "moved") {
      return;
    }

    if (this.tryStartStepTriggers()) {
      return;
    }

    this.tryStartRegionEncounter();
  }

  private updateShop(): boolean {
    if (!this.activeShopId) {
      return false;
    }

    if (
      (this.interactKey && Phaser.Input.Keyboard.JustDown(this.interactKey))
      || (this.cancelKey && Phaser.Input.Keyboard.JustDown(this.cancelKey))
    ) {
      this.shopOverlay?.hide();
      this.activeShopId = undefined;
    }

    return true;
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
    if (!this.worldRuntime || !this.assetRegistry) {
      return;
    }

    const map = this.worldRuntime.getCurrentMap();
    const tilesetPalette = this.assetRegistry.resolveTilesetPalette(`tileset.${map.id}`, { mapId: map.id });
    renderWorldMap(this, map, tilesetPalette);

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

    this.add.text(8, 8, `${map.name}\nArrows move / 方向键移动\nSpace talks / 空格对话\nM menu / M 打开菜单\nS save L load / S 存档 L 读档\nWalk into battle regions / 走进战斗区域`, {
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
    if (!this.worldRuntime || !this.assetRegistry) {
      return;
    }

    const assetRegistry = this.assetRegistry;
    const map = this.worldRuntime.getCurrentMap();
    map.npcs.forEach((npc) => {
      const npcBinding = assetRegistry.resolveNpcBinding(npc.sprite, { mapId: map.id });
      const centerX = (npc.x * map.tileWidth) + (map.tileWidth / 2);
      const centerY = (npc.y * map.tileHeight) + (map.tileHeight / 2);
      if (npcBinding.resource.kind === "sprite-frame") {
        const frameTone = this.previewFrameTone(npcBinding.resource.frameId);
        const npcSprite = this.add.rectangle(
          centerX,
          centerY,
          map.tileWidth - 6,
          map.tileHeight - 4,
          frameTone.fill,
          1,
        );
        npcSprite.setStrokeStyle(2, frameTone.stroke);
        this.add.rectangle(centerX, centerY + 4, map.tileWidth - 10, 3, frameTone.shadow, 0.85);
        this.add.rectangle(centerX, centerY - 5, map.tileWidth - 10, 3, frameTone.accent, 1);
      } else {
        const npcStyle = assetRegistry.resolveNpcVisual(npc.sprite, { mapId: map.id });
        const npcSprite = this.add.rectangle(
          centerX,
          centerY,
          map.tileWidth - 4,
          map.tileHeight - 4,
          Phaser.Display.Color.HexStringToColor(npcStyle.fillColor).color,
          1,
        );
        npcSprite.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(npcStyle.strokeColor).color);

        const facingOffsetX = npc.facing === "left" ? -4 : npc.facing === "right" ? 4 : 0;
        const facingOffsetY = npc.facing === "up" ? -4 : npc.facing === "down" ? 4 : 0;
        this.add.rectangle(
          centerX + facingOffsetX,
          centerY + facingOffsetY,
          4,
          4,
          Phaser.Display.Color.HexStringToColor(npcStyle.accentColor).color,
          1,
        );
      }
    });
  }

  private previewFrameTone(frameId: string): { fill: number; stroke: number; accent: number; shadow: number } {
    if (frameId.startsWith("guard-")) {
      return { fill: 0xd97706, stroke: 0x78350f, accent: 0x1d4ed8, shadow: 0x451a03 };
    }

    if (frameId.startsWith("merchant-")) {
      return { fill: 0xfb923c, stroke: 0x7c2d12, accent: 0x0f766e, shadow: 0x431407 };
    }

    if (frameId.startsWith("guide-")) {
      return { fill: 0x4ade80, stroke: 0x166534, accent: 0x0f766e, shadow: 0x14532d };
    }

    return { fill: 0xcbd5e1, stroke: 0x0f172a, accent: 0xef4444, shadow: 0x334155 };
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
    if (!this.dialogueSession || !this.worldRuntime || !this.assetRegistry) {
      return false;
    }

    const accelerated = this.fastDialogueKey?.isDown ?? false;
    const effectiveDelta = Number.isFinite(delta) && delta > 0 ? delta : 16;
    const currentMapId = this.worldRuntime.getCurrentMap().id;
    const assetRegistry = this.assetRegistry;
    const view = this.dialogueSession.update(effectiveDelta, accelerated);
    if (view) {
      this.dialogueBox?.show(view, assetRegistry.resolvePanelStyle("ui.dialogue-box", { mapId: currentMapId }));
    }

    if (this.interactKey && Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      const nextView = this.dialogueSession.advance();
      if (nextView?.isComplete) {
        this.dialogueBox?.hide();
        this.dialogueSession = undefined;
        this.applyPendingEventEffects();
      } else if (nextView) {
        this.dialogueBox?.show(nextView, assetRegistry.resolvePanelStyle("ui.dialogue-box", { mapId: currentMapId }));
      }
    }

    return true;
  }

  private tryStartStepTriggers(): boolean {
    if (!this.worldRuntime) {
      return false;
    }

    const map = this.worldRuntime.getCurrentMap();
    const state = this.worldRuntime.getState();
    const currentTileTriggers = findTriggersAtPoint(map, {
      x: state.playerX,
      y: state.playerY,
    });

    const trigger = currentTileTriggers[0];
    if (!trigger) {
      return false;
    }

    this.executeTrigger(trigger.id);
    return true;
  }

  private tryStartRegionEncounter(): void {
    if (!this.worldRuntime || !this.contentDatabase || !this.gameStateRuntime || !this.assetRegistry) {
      return;
    }

    const map = this.worldRuntime.getCurrentMap();
    const worldState = this.worldRuntime.getState();
    const snapshot = this.gameStateRuntime.getSnapshot();
    const [trigger] = findEncounterTriggersAtPoint(map, {
      x: worldState.playerX,
      y: worldState.playerY,
    });
    if (!trigger) {
      return;
    }

    const encounter = resolveRegionEncounter(
      this.contentDatabase,
      trigger,
      worldState,
      snapshot,
    );
    if (!encounter) {
      return;
    }

    this.startBattle({
      battleGroupId: encounter.battleGroupId,
      triggerId: encounter.triggerId,
      originMapId: worldState.currentMapId,
    });
  }

  private executeTrigger(triggerId: string): void {
    if (!this.worldRuntime || !this.contentDatabase || !this.gameStateRuntime || !this.assetRegistry) {
      return;
    }

    const map = this.worldRuntime.getCurrentMap();
    const assetRegistry = this.assetRegistry;
    const trigger = map.triggers.find((entry) => entry.id === triggerId);
    if (!trigger) {
      throw new Error(`WorldScene could not find trigger "${triggerId}" on map "${map.id}".`);
    }

    if (trigger.once && this.gameStateRuntime.isTriggerConsumed(trigger.id)) {
      return;
    }

    if (!trigger.eventId) {
      throw new Error(`WorldScene trigger "${trigger.id}" does not define eventId.`);
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
    this.pendingBattleTriggerId = runtime.startedBattleGroupIds.length > 0 ? trigger.id : undefined;
    this.pendingShopId = runtime.openedShopIds.at(-1);

    if (runtime.dialogueLog.length > 0) {
      this.dialogueSession = new DialogueSession(runtime.dialogueLog);
      const initialView = this.dialogueSession.getView();
      if (initialView) {
        this.dialogueBox?.show(
          initialView,
          assetRegistry.resolvePanelStyle("ui.dialogue-box", { mapId: map.id }),
        );
      }
      return;
    }

    this.applyPendingEventEffects();
  }

  private applyPendingEventEffects(): void {
    if (this.pendingWarpTarget && this.worldRuntime) {
      this.worldRuntime.setSpawn(this.pendingWarpTarget.mapId, this.pendingWarpTarget.spawnPointId);
      this.gameStateRuntime?.syncWorldState(this.worldRuntime.getState());
      this.pendingWarpTarget = undefined;
      this.pendingBattleGroupId = undefined;
      this.scene.restart();
      return;
    }

    if (this.pendingBattleGroupId && this.worldRuntime) {
      this.startBattle({
        battleGroupId: this.pendingBattleGroupId,
        triggerId: this.pendingBattleTriggerId,
        originMapId: this.worldRuntime.getState().currentMapId,
      });
      return;
    }

    if (this.pendingShopId && this.contentDatabase && this.gameStateRuntime && this.assetRegistry) {
      const currentMapId = this.worldRuntime?.getCurrentMap().id;
      this.activeShopId = this.pendingShopId;
      this.shopOverlay?.render(buildShopViewModel(
        this.contentDatabase,
        this.gameStateRuntime.getSnapshot(),
        this.pendingShopId,
      ), this.assetRegistry.resolvePanelStyle("ui.shop-overlay", { mapId: currentMapId }));
      this.pendingShopId = undefined;
    }
  }

  private startBattle(request: BattleRequest): void {
    this.pendingBattleGroupId = undefined;
    this.pendingBattleTriggerId = undefined;
    this.registry.set(BATTLE_REQUEST_REGISTRY_KEY, request);
    this.scene.start(SceneKey.Battle);
  }

  private handleMenuInput(): void {
    if (!this.menuController || !this.assetRegistry) {
      return;
    }

    const currentMapId = this.worldRuntime?.getCurrentMap().id;

    if (this.menuNextKey && Phaser.Input.Keyboard.JustDown(this.menuNextKey)) {
      this.menuController.nextTab(this.assetRegistry.resolvePanelStyle("ui.menu-overlay", { mapId: currentMapId }));
      return;
    }

    if (this.menuPreviousKey && Phaser.Input.Keyboard.JustDown(this.menuPreviousKey)) {
      this.menuController.previousTab(this.assetRegistry.resolvePanelStyle("ui.menu-overlay", { mapId: currentMapId }));
      return;
    }

    if (this.menuSaveKey && Phaser.Input.Keyboard.JustDown(this.menuSaveKey)) {
      this.menuController.save();
      return;
    }

    if (this.menuLoadKey && Phaser.Input.Keyboard.JustDown(this.menuLoadKey)) {
      const result = this.menuController.load();
      if (result.shouldReloadWorld) {
        this.scene.restart();
      }
    }
  }
}
