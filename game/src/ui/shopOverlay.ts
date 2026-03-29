import type { GameStateSnapshot } from "@/systems/gameStateRuntime";
import type { ContentDatabase } from "@/types/content";

export interface ShopViewModel {
  shopId: string;
  titleText: string;
  subtitleText: string;
  bodyText: string;
  itemLines: string[];
}

export interface ShopOverlayPort {
  render(viewModel: ShopViewModel): void;
  hide(): void;
  destroy(): void;
}

export class ShopOverlay implements ShopOverlayPort {
  private readonly overlay?: HTMLDivElement;

  private readonly titleText?: HTMLDivElement;

  private readonly subtitleText?: HTMLDivElement;

  private readonly bodyText?: HTMLPreElement;

  constructor() {
    if (typeof document === "undefined") {
      return;
    }

    this.overlay = document.createElement("div");
    this.overlay.style.position = "fixed";
    this.overlay.style.left = "24px";
    this.overlay.style.bottom = "24px";
    this.overlay.style.width = "min(92vw, 420px)";
    this.overlay.style.minHeight = "220px";
    this.overlay.style.display = "none";
    this.overlay.style.zIndex = "99997";
    this.overlay.style.padding = "16px";
    this.overlay.style.boxSizing = "border-box";
    this.overlay.style.fontFamily = "monospace";
    this.overlay.style.background = "rgba(8, 47, 73, 0.96)";
    this.overlay.style.border = "2px solid #f59e0b";
    this.overlay.style.borderRadius = "10px";
    this.overlay.style.color = "#f8fafc";
    this.overlay.style.boxShadow = "0 12px 36px rgba(0, 0, 0, 0.35)";

    this.titleText = document.createElement("div");
    this.titleText.style.fontSize = "16px";
    this.titleText.style.fontWeight = "700";
    this.titleText.style.marginBottom = "8px";

    this.subtitleText = document.createElement("div");
    this.subtitleText.style.fontSize = "12px";
    this.subtitleText.style.color = "#fde68a";
    this.subtitleText.style.marginBottom = "12px";

    this.bodyText = document.createElement("pre");
    this.bodyText.style.margin = "0";
    this.bodyText.style.fontFamily = "monospace";
    this.bodyText.style.fontSize = "14px";
    this.bodyText.style.lineHeight = "1.45";
    this.bodyText.style.whiteSpace = "pre-wrap";

    this.overlay.appendChild(this.titleText);
    this.overlay.appendChild(this.subtitleText);
    this.overlay.appendChild(this.bodyText);
    document.body.appendChild(this.overlay);
  }

  render(viewModel: ShopViewModel): void {
    if (!this.overlay || !this.titleText || !this.subtitleText || !this.bodyText) {
      return;
    }

    this.overlay.style.display = "block";
    this.titleText.textContent = viewModel.titleText;
    this.subtitleText.textContent = viewModel.subtitleText;
    this.bodyText.textContent = viewModel.bodyText;
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

export function buildShopViewModel(
  database: ContentDatabase,
  snapshot: GameStateSnapshot,
  shopId: string,
): ShopViewModel {
  const shop = database.shops.find((entry) => entry.id === shopId);
  if (!shop) {
    throw new Error(`ShopOverlay could not find shop "${shopId}".`);
  }

  const itemLines = shop.inventory.map((entry, index) => {
    const item = database.items.find((candidate) => candidate.id === entry.itemId);
    const price = entry.price ?? item?.price ?? 0;
    const itemName = item?.name ?? entry.itemId;
    return `${index + 1}. ${itemName} - ${price}G`;
  });

  return {
    shopId,
    titleText: `${shop.name} / 商店`,
    subtitleText: `Gold / 金钱: ${snapshot.inventory.gold}`,
    bodyText: [
      itemLines.length > 0 ? itemLines.join("\n") : "No goods.\n当前没有商品。",
      "",
      "Space / Esc: Close / 关闭",
    ].join("\n"),
    itemLines,
  };
}
