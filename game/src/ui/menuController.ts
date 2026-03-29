import { DEFAULT_SAVE_SLOT, SaveManager } from "@/systems/saveManager";
import type { ContentDatabase } from "@/types/content";
import { GameStateRuntime } from "@/systems/gameStateRuntime";
import { buildMenuViewModel, type MenuOverlayPort, type MenuTabId } from "@/ui/menuOverlay";
import { WorldRuntime } from "@/world/worldRuntime";

export interface MenuActionResult {
  shouldReloadWorld: boolean;
}

const MENU_TABS: MenuTabId[] = ["status", "inventory", "party", "system"];

export class MenuController {
  private activeTab: MenuTabId = "status";

  private isOpen = false;

  private message = "Ready.\n菜单已就绪。";

  constructor(
    private readonly overlay: MenuOverlayPort,
    private readonly database: ContentDatabase,
    private readonly gameStateRuntime: GameStateRuntime,
    private readonly worldRuntime: WorldRuntime,
    private readonly saveManager: SaveManager,
  ) {}

  isMenuOpen(): boolean {
    return this.isOpen;
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.render();
      return;
    }

    this.overlay.hide();
  }

  nextTab(): void {
    this.activeTab = MENU_TABS[(MENU_TABS.indexOf(this.activeTab) + 1) % MENU_TABS.length] ?? "status";
    this.render();
  }

  previousTab(): void {
    this.activeTab = MENU_TABS[(MENU_TABS.indexOf(this.activeTab) + MENU_TABS.length - 1) % MENU_TABS.length] ?? "status";
    this.render();
  }

  refresh(): void {
    if (!this.isOpen) {
      return;
    }

    this.render();
  }

  save(): MenuActionResult {
    this.gameStateRuntime.syncWorldState(this.worldRuntime.getState());
    this.saveManager.save(this.gameStateRuntime.toSaveData(DEFAULT_SAVE_SLOT));
    this.message = "Saved to slot-1.\n已保存到 slot-1。";
    this.render();
    return { shouldReloadWorld: false };
  }

  load(): MenuActionResult {
    const saveData = this.saveManager.load(DEFAULT_SAVE_SLOT);
    if (!saveData) {
      this.message = "No save found.\n未找到存档。";
      this.render();
      return { shouldReloadWorld: false };
    }

    this.gameStateRuntime.loadSaveData(saveData);
    this.worldRuntime.setState(this.gameStateRuntime.getWorldState());
    this.message = "Loaded slot-1.\n已读取 slot-1。";
    this.render();
    return { shouldReloadWorld: true };
  }

  destroy(): void {
    this.overlay.destroy();
  }

  private render(): void {
    this.overlay.render(buildMenuViewModel(
      this.database,
      this.gameStateRuntime.getSnapshot(),
      this.activeTab,
      this.message,
    ));
  }
}
