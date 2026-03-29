import type { ContentDatabase } from "@/types/content";
import type { GameStateSnapshot } from "@/systems/gameStateRuntime";

export type MenuTabId = "status" | "inventory" | "party" | "system";

export interface MenuViewModel {
  activeTab: MenuTabId;
  statusText: string;
  inventoryText: string;
  partyText: string;
  systemText: string;
  goldText: string;
  locationText: string;
}

export interface MenuOverlayPort {
  render(viewModel: MenuViewModel): void;
  hide(): void;
  destroy(): void;
}

export class MenuOverlay implements MenuOverlayPort {
  private readonly overlay?: HTMLDivElement;

  private readonly titleText?: HTMLDivElement;

  private readonly headerText?: HTMLDivElement;

  private readonly tabText?: HTMLDivElement;

  private readonly bodyText?: HTMLPreElement;

  constructor() {
    if (typeof document === "undefined") {
      return;
    }

    this.overlay = document.createElement("div");
    this.overlay.style.position = "fixed";
    this.overlay.style.top = "24px";
    this.overlay.style.right = "24px";
    this.overlay.style.width = "min(92vw, 420px)";
    this.overlay.style.minHeight = "320px";
    this.overlay.style.display = "none";
    this.overlay.style.zIndex = "99998";
    this.overlay.style.padding = "16px";
    this.overlay.style.boxSizing = "border-box";
    this.overlay.style.fontFamily = "monospace";
    this.overlay.style.background = "rgba(15, 23, 42, 0.96)";
    this.overlay.style.border = "2px solid #38bdf8";
    this.overlay.style.borderRadius = "10px";
    this.overlay.style.color = "#e2e8f0";
    this.overlay.style.boxShadow = "0 12px 36px rgba(0, 0, 0, 0.35)";
    this.overlay.style.whiteSpace = "pre-wrap";

    this.titleText = document.createElement("div");
    this.titleText.textContent = "Main Menu / 主菜单";
    this.titleText.style.fontSize = "16px";
    this.titleText.style.fontWeight = "700";
    this.titleText.style.color = "#f8fafc";
    this.titleText.style.marginBottom = "8px";

    this.headerText = document.createElement("div");
    this.headerText.style.fontSize = "12px";
    this.headerText.style.color = "#94a3b8";
    this.headerText.style.marginBottom = "10px";

    this.tabText = document.createElement("div");
    this.tabText.style.fontSize = "13px";
    this.tabText.style.color = "#7dd3fc";
    this.tabText.style.marginBottom = "12px";

    this.bodyText = document.createElement("pre");
    this.bodyText.style.margin = "0";
    this.bodyText.style.fontFamily = "monospace";
    this.bodyText.style.fontSize = "14px";
    this.bodyText.style.lineHeight = "1.45";
    this.bodyText.style.whiteSpace = "pre-wrap";

    this.overlay.appendChild(this.titleText);
    this.overlay.appendChild(this.headerText);
    this.overlay.appendChild(this.tabText);
    this.overlay.appendChild(this.bodyText);
    document.body.appendChild(this.overlay);
  }

  render(viewModel: MenuViewModel): void {
    if (!this.overlay || !this.headerText || !this.tabText || !this.bodyText) {
      return;
    }

    this.overlay.style.display = "block";
    this.headerText.textContent = `${viewModel.goldText} | ${viewModel.locationText}`;
    this.tabText.textContent = "Status / 状态 | Inventory / 背包 | Party / 队伍 | System / 系统";

    switch (viewModel.activeTab) {
      case "status":
        this.bodyText.textContent = viewModel.statusText;
        break;
      case "inventory":
        this.bodyText.textContent = viewModel.inventoryText;
        break;
      case "party":
        this.bodyText.textContent = viewModel.partyText;
        break;
      case "system":
        this.bodyText.textContent = viewModel.systemText;
        break;
    }
  }

  hide(): void {
    if (!this.overlay) {
      return;
    }

    this.overlay.style.display = "none";
  }

  destroy(): void {
    this.overlay?.remove();
  }
}

export function buildMenuViewModel(
  database: ContentDatabase,
  snapshot: GameStateSnapshot,
  activeTab: MenuTabId,
  message: string,
): MenuViewModel {
  const partyMembers = snapshot.partyMemberIds
    .map((memberId) => {
      const definition = database.partyMembers.find((member) => member.id === memberId);
      return definition
        ? {
          definition,
          state: snapshot.partyStates[memberId],
        }
        : undefined;
    })
    .filter((member): member is NonNullable<typeof member> => Boolean(member));
  const leadMember = partyMembers[0];
  const inventoryLines = snapshot.inventory.items.length > 0
    ? snapshot.inventory.items.map((entry) => {
      const item = database.items.find((candidate) => candidate.id === entry.itemId);
      return `${item?.name ?? entry.itemId} x${entry.quantity}`;
    }).join("\n")
    : "No items.\n没有物品。";
  const partyLines = partyMembers.length > 0
    ? partyMembers.map(({ definition, state }, index) => `${index + 1}. ${definition.name} Lv${state?.level ?? definition.level} EXP ${state?.experience ?? 0} ${definition.className}`).join("\n")
    : "No party members.\n当前没有队伍成员。";

  return {
    activeTab,
    goldText: `Gold / 金钱: ${snapshot.inventory.gold}`,
    locationText: `Map / 地图: ${snapshot.world.currentMapId} (${snapshot.world.playerX}, ${snapshot.world.playerY})`,
    statusText: leadMember
      ? [
        `Lead / 领队: ${leadMember.definition.name}`,
        `Class / 职业: ${leadMember.definition.className}`,
        `Level / 等级: ${leadMember.state?.level ?? leadMember.definition.level}`,
        `EXP / 经验: ${leadMember.state?.experience ?? 0}`,
        `HP / 生命: ${leadMember.state?.currentHp ?? leadMember.definition.baseStats.maxHp}/${leadMember.definition.baseStats.maxHp}`,
        `MP / 法力: ${leadMember.state?.currentMp ?? leadMember.definition.baseStats.maxMp}/${leadMember.definition.baseStats.maxMp}`,
        `ATK / 攻击: ${leadMember.definition.baseStats.attack}`,
        `DEF / 防御: ${leadMember.definition.baseStats.defense}`,
        `SPD / 速度: ${leadMember.definition.baseStats.speed}`,
      ].join("\n")
      : "No lead member.\n当前没有领队。",
    inventoryText: inventoryLines,
    partyText: partyLines,
    systemText: [
      "S: Save / 存档",
      "L: Load / 读档",
      "M: Close / 关闭菜单",
      "",
      message,
    ].join("\n"),
  };
}
