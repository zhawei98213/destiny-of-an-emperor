import type {
  AssetBindingDefinition,
  AssetCategory,
  AssetOverrideDefinition,
  AssetResource,
  AssetState,
  ContentDatabase,
  PanelStyleAssetResource,
  TilesetPaletteAssetResource,
  WorldPlaceholderAssetResource,
} from "@/types/content";

export interface AssetContext {
  mapId?: string;
}

export interface ResolvedAssetBinding {
  key: string;
  category: AssetCategory;
  state: AssetState;
  resource: AssetResource;
  resolvedFromKey: string;
  usedFallback: boolean;
}

function matchesOverride(override: AssetOverrideDefinition, context: AssetContext): boolean {
  if (!context.mapId) {
    return false;
  }

  return override.mapIds.includes(context.mapId);
}

export class AssetRegistry {
  private readonly baseBindings = new Map<string, AssetBindingDefinition>();

  private readonly overrides: AssetOverrideDefinition[];

  constructor(database: ContentDatabase) {
    (database.assetBindings ?? []).forEach((binding) => {
      this.baseBindings.set(binding.key, binding);
    });
    this.overrides = [...(database.assetOverrides ?? [])];
  }

  getBindingState(key: string, context: AssetContext = {}): AssetState {
    return this.resolve(key, this.fallbackKeyForCategory(this.categoryFromKey(key) ?? "ui-panel"), context).state;
  }

  resolveNpcBinding(spriteId: string, context: AssetContext = {}): ResolvedAssetBinding {
    return this.resolve(`npc.${spriteId}`, "npc.default", context);
  }

  resolveNpcVisual(spriteId: string, context: AssetContext = {}): WorldPlaceholderAssetResource {
    const resolved = this.resolveNpcBinding(spriteId, context);
    if (resolved.resource.kind === "world-placeholder") {
      return resolved.resource;
    }

    return {
      kind: "world-placeholder",
      fillColor: "#cbd5e1",
      strokeColor: "#0f172a",
      accentColor: "#ef4444",
    };
  }

  resolvePanelStyle(panelKey: string, context: AssetContext = {}): PanelStyleAssetResource {
    const resolved = this.resolve(panelKey, "ui.panel.default", context);
    if (resolved.resource.kind === "panel-style") {
      return resolved.resource;
    }

    return {
      kind: "panel-style",
      backgroundColor: "rgba(15, 23, 42, 0.94)",
      borderColor: "#f8fafc",
      titleColor: "#f8fafc",
      bodyColor: "#e2e8f0",
      accentColor: "#93c5fd",
    };
  }

  resolveTilesetPalette(tilesetKey: string, context: AssetContext = {}): TilesetPaletteAssetResource {
    const resolved = this.resolve(tilesetKey, "tileset.default", context);
    if (resolved.resource.kind === "tileset-palette") {
      return resolved.resource;
    }

    return {
      kind: "tileset-palette",
      tileWidth: 16,
      tileHeight: 16,
      tileColors: {
        "0": "#0f172a",
        "1": "#5f8f3f",
        "2": "#c8a65a",
        "3": "#59626d",
        "4": "#3b82c4",
        "5": "#31572c",
      },
      sourceCandidateIds: [],
    };
  }

  private resolve(key: string, fallbackKey: string, context: AssetContext): ResolvedAssetBinding {
    const overrideBinding = this.findOverrideBinding(key, context);
    if (overrideBinding) {
      return {
        key,
        category: overrideBinding.category,
        state: overrideBinding.state,
        resource: overrideBinding.resource,
        resolvedFromKey: overrideBinding.key,
        usedFallback: false,
      };
    }

    const baseBinding = this.baseBindings.get(key);
    if (baseBinding) {
      return {
        key,
        category: baseBinding.category,
        state: baseBinding.state,
        resource: baseBinding.resource,
        resolvedFromKey: baseBinding.key,
        usedFallback: false,
      };
    }

    const fallbackBinding = this.baseBindings.get(fallbackKey);
    if (fallbackBinding) {
      return {
        key,
        category: fallbackBinding.category,
        state: fallbackBinding.state,
        resource: fallbackBinding.resource,
        resolvedFromKey: fallbackBinding.key,
        usedFallback: true,
      };
    }

    return {
      key,
      category: this.categoryFromKey(key) ?? "ui-panel",
      state: "placeholder",
      resource: {
        kind: "panel-style",
        backgroundColor: "rgba(15, 23, 42, 0.94)",
        borderColor: "#f8fafc",
        titleColor: "#f8fafc",
        bodyColor: "#e2e8f0",
        accentColor: "#93c5fd",
      },
      resolvedFromKey: fallbackKey,
      usedFallback: true,
    };
  }

  private findOverrideBinding(key: string, context: AssetContext): AssetBindingDefinition | undefined {
    for (const override of this.overrides) {
      if (!matchesOverride(override, context)) {
        continue;
      }

      const binding = override.assetBindings.find((entry) => entry.key === key);
      if (binding) {
        return binding;
      }
    }

    return undefined;
  }

  private categoryFromKey(key: string): AssetCategory | undefined {
    if (key.startsWith("npc.")) {
      return "npc-sprite";
    }

    if (key.startsWith("tileset.")) {
      return "tileset";
    }

    if (key.startsWith("portrait.")) {
      return "portrait";
    }

    if (key.startsWith("audio.")) {
      return "audio";
    }

    if (key.startsWith("ui.")) {
      return "ui-panel";
    }

    return undefined;
  }

  private fallbackKeyForCategory(category: AssetCategory): string {
    switch (category) {
      case "npc-sprite":
        return "npc.default";
      case "tileset":
        return "tileset.default";
      case "portrait":
        return "portrait.default";
      case "audio":
        return "audio.default";
      case "ui-panel":
        return "ui.panel.default";
      default:
        return "ui.panel.default";
    }
  }
}
