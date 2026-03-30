import { readFile } from "node:fs/promises";
import path from "node:path";
import { repoRoot } from "./importerCore";

export type UiParityPriority = "P1" | "P2" | "P3";

export interface UiParityLocator {
  chapterId: string;
  mapId: string;
  triggerId?: string;
  eventId?: string;
  npcId?: string;
}

export interface UiParityCase {
  id: string;
  repairGroupId: string;
  title: string;
  area: "dialogue" | "menu" | "shop" | "battle" | "save";
  status: "matched" | "diverged";
  priority?: UiParityPriority;
  locator: UiParityLocator;
  expected: string[];
  actual: string[];
  differences: string[];
  suggestedRepairTargets: string[];
  systems: string[];
  evidenceFiles: string[];
}

export interface UiParityReport {
  generatedAt: string;
  focusScenes: Array<{
    chapterId: string;
    mapId: string;
    purpose: string;
  }>;
  totals: {
    matched: number;
    diverged: number;
    total: number;
  };
  cases: UiParityCase[];
}

async function readRelativeFile(relativePath: string): Promise<string> {
  return readFile(path.join(repoRoot, relativePath), "utf8");
}

function filePath(relativePath: string): string {
  return path.join(repoRoot, relativePath);
}

function includesAll(text: string, needles: string[]): boolean {
  return needles.every((needle) => text.includes(needle));
}

export async function buildUiParityReport(): Promise<UiParityReport> {
  const dialogueSessionSource = await readRelativeFile("game/src/ui/dialogueSession.ts");
  const dialogueBoxSource = await readRelativeFile("game/src/ui/dialogueBox.ts");
  const worldSceneSource = await readRelativeFile("game/src/scenes/WorldScene.ts");
  const menuControllerSource = await readRelativeFile("game/src/ui/menuController.ts");
  const menuOverlaySource = await readRelativeFile("game/src/ui/menuOverlay.ts");
  const shopOverlaySource = await readRelativeFile("game/src/ui/shopOverlay.ts");
  const battleSceneSource = await readRelativeFile("game/src/scenes/BattleScene.ts");

  const hasDialogueLock = worldSceneSource.includes("if (this.updateDialogue(delta)) {\n      return;");
  const hasDialogueSkip = includesAll(dialogueSessionSource, [
    "if (this.visibleCharacterCount < cue.text.length)",
    "this.visibleCharacterProgress = cue.text.length;",
  ]);
  const hasDialogueAccelerate = dialogueSessionSource.includes("const speedMultiplier = accelerated ? 3 : 1;");
  const hasDialoguePromptStates = includesAll(dialogueBoxSource, [
    'view.isLineComplete ? "Enter" : "Skip"',
    'this.overlay.style.display = "block";',
  ]);

  const hasMenuToggle = includesAll(menuControllerSource, [
    "toggle(): void",
    "this.isOpen = !this.isOpen;",
  ]);
  const hasMenuStateSync = includesAll(menuControllerSource, [
    "this.gameStateRuntime.syncWorldState(this.worldRuntime.getState());",
    "this.saveManager.save(this.gameStateRuntime.toSaveData(DEFAULT_SAVE_SLOT));",
    "this.gameStateRuntime.loadSaveData(saveData);",
  ]) && includesAll(menuOverlaySource, [
    "Gold / 金钱:",
    "Map / 地图:",
  ]);

  const hasShopTransactionalFlow = includesAll(shopOverlaySource, [
    "buy",
    "sell",
  ]) || shopOverlaySource.includes("selectedIndex");
  const hasShopReadOnlyList = includesAll(shopOverlaySource, [
    "itemLines",
    "Space / Esc: Close / 关闭",
  ]);

  const hasBattleCommandSelection = battleSceneSource.includes("selectedCommand")
    || battleSceneSource.includes("commandMenu")
    || battleSceneSource.includes("targetIndex");
  const hasBattleSingleAttackInput = includesAll(battleSceneSource, [
    'this.attackKey = this.input.keyboard?.addKey("A");',
    "runAttackTurn(this.battleState).state",
  ]);

  const hasSaveEntryUi = menuOverlaySource.includes("Save Slot")
    || menuOverlaySource.includes("slot list")
    || menuControllerSource.includes("selectedSaveSlot");
  const hasSaveHotkeyOnly = includesAll(menuControllerSource, [
    'this.message = "Saved to slot-1.\\n已保存到 slot-1。";',
    'this.message = "Loaded slot-1.\\n已读取 slot-1。";',
  ]);

  const cases: UiParityCase[] = [
    {
      id: "chapter-01-lou-sang:dialogue-open-close",
      repairGroupId: "dialogue-timing",
      title: "Lou Sang dialogue open and close timing / 楼桑对话框开关时机",
      area: "dialogue",
      status: hasDialogueLock && hasDialoguePromptStates ? "matched" : "diverged",
      locator: {
        chapterId: "chapter-01-lou-sang",
        mapId: "town",
        triggerId: "guide-talk-trigger",
        eventId: "intro-event",
        npcId: "village-guide",
      },
      expected: [
        "Dialogue opens as soon as a real NPC interaction starts.",
        "对话在真实 NPC 交互开始时立即打开。",
        "Player movement stays locked until the final line completes.",
        "直到最后一句结束前，玩家移动应保持锁定。",
      ],
      actual: [
        hasDialogueLock
          ? "WorldScene returns early while dialogue is active, so movement remains locked."
          : "WorldScene dialogue lock path is missing or drifted.",
        hasDialoguePromptStates
          ? "DialogueBox switches prompt text between Skip and Enter and shows immediately."
          : "Dialogue prompt state switching is incomplete.",
      ],
      differences: hasDialogueLock && hasDialoguePromptStates
        ? []
        : ["Dialogue open/close timing is no longer guaranteed by the current UI path."],
      suggestedRepairTargets: [
        filePath("game/src/scenes/WorldScene.ts"),
        filePath("game/src/ui/dialogueBox.ts"),
        filePath("tests/runtime/dialogueSession.test.ts"),
      ],
      systems: ["world-scene", "dialogue-ui"],
      evidenceFiles: [
        filePath("game/src/scenes/WorldScene.ts"),
        filePath("game/src/ui/dialogueBox.ts"),
      ],
    },
    {
      id: "chapter-01-lou-sang:dialogue-typewriter",
      repairGroupId: "dialogue-typewriter",
      title: "Lou Sang dialogue typewriter and skip / 楼桑逐字显示与跳过",
      area: "dialogue",
      status: hasDialogueSkip && hasDialogueAccelerate ? "matched" : "diverged",
      locator: {
        chapterId: "chapter-01-lou-sang",
        mapId: "town",
        triggerId: "guide-talk-trigger",
        eventId: "intro-event",
        npcId: "village-guide",
      },
      expected: [
        "Dialogue should reveal over time and support accelerated reveal plus full-line skip.",
        "对白应逐字显示，并支持加速显示和整句跳过。",
      ],
      actual: [
        hasDialogueAccelerate
          ? "Holding the fast key applies a 3x reveal multiplier."
          : "Accelerated reveal path is missing.",
        hasDialogueSkip
          ? "Advance completes the current line before moving to the next cue."
          : "Skip-to-line-complete behavior is missing.",
      ],
      differences: hasDialogueSkip && hasDialogueAccelerate
        ? []
        : ["Typewriter reveal no longer matches the baseline skip and accelerate contract."],
      suggestedRepairTargets: [
        filePath("game/src/ui/dialogueSession.ts"),
        filePath("tests/runtime/dialogueSession.test.ts"),
      ],
      systems: ["dialogue-ui"],
      evidenceFiles: [
        filePath("game/src/ui/dialogueSession.ts"),
      ],
    },
    {
      id: "chapter-01-lou-sang:menu-state-sync",
      repairGroupId: "menu-state-sync",
      title: "Lou Sang menu toggle and state sync / 楼桑菜单开关与状态同步",
      area: "menu",
      status: hasMenuToggle && hasMenuStateSync ? "matched" : "diverged",
      locator: {
        chapterId: "chapter-01-lou-sang",
        mapId: "town",
      },
      expected: [
        "Menu should open and close reliably, then reflect current gold, location, party, save, and load state.",
        "菜单应能稳定开关，并反映当前金钱、坐标、队伍、存档和读档状态。",
      ],
      actual: [
        hasMenuToggle
          ? "MenuController owns open/close state instead of WorldScene hardcoding it."
          : "Menu open/close state is not centrally owned.",
        hasMenuStateSync
          ? "Menu reads runtime snapshot data and refreshes after save/load."
          : "Menu state sync path is incomplete.",
      ],
      differences: hasMenuToggle && hasMenuStateSync
        ? []
        : ["Menu state no longer matches the shared runtime snapshot contract."],
      suggestedRepairTargets: [
        filePath("game/src/ui/menuController.ts"),
        filePath("game/src/ui/menuOverlay.ts"),
        filePath("tests/runtime/menuController.test.ts"),
      ],
      systems: ["menu-ui", "save-manager"],
      evidenceFiles: [
        filePath("game/src/ui/menuController.ts"),
        filePath("game/src/ui/menuOverlay.ts"),
      ],
    },
    {
      id: "chapter-01-lou-sang:shop-flow",
      repairGroupId: "shop-flow",
      title: "Lou Sang shop interaction flow / 楼桑商店交互流程",
      area: "shop",
      status: hasShopTransactionalFlow ? "matched" : "diverged",
      priority: "P1",
      locator: {
        chapterId: "chapter-01-lou-sang",
        mapId: "town",
        triggerId: "lou-sang-shop-trigger",
        eventId: "lou-sang-shop-event",
        npcId: "merchant",
      },
      expected: [
        "A real shop flow should support a clear open, browse, confirm, and cancel loop.",
        "真实商店流程应至少包含打开、浏览、确认和取消闭环。",
      ],
      actual: [
        hasShopReadOnlyList
          ? "Current shop UI only renders a read-only item list and a close hint."
          : "Current shop list rendering is incomplete.",
        "There is no buy, sell, quantity, or confirm state in the current overlay model.",
      ],
      differences: [
        "Shop parity is still blocked by a read-only overlay instead of a transactional flow.",
        "商店一致性目前仍受阻于只读 overlay，而不是交易流程。",
      ],
      suggestedRepairTargets: [
        filePath("game/src/ui/shopOverlay.ts"),
        filePath("game/src/scenes/WorldScene.ts"),
        filePath("tests/regression/golden-cases.json"),
      ],
      systems: ["shop-overlay", "world-scene", "regression"],
      evidenceFiles: [
        filePath("game/src/ui/shopOverlay.ts"),
        filePath("game/src/scenes/WorldScene.ts"),
      ],
    },
    {
      id: "chapter-03-river-ford:battle-command-flow",
      repairGroupId: "battle-command-flow",
      title: "River Ford battle command selection / 渡口战斗指令选择流程",
      area: "battle",
      status: hasBattleCommandSelection ? "matched" : "diverged",
      priority: "P1",
      locator: {
        chapterId: "chapter-03-river-ford",
        mapId: "river-ford",
        triggerId: "river-ford-battle-trigger",
      },
      expected: [
        "Battle UI should expose a command selection step before immediate action resolution.",
        "战斗 UI 应在立刻结算前提供明确的指令选择步骤。",
      ],
      actual: [
        hasBattleSingleAttackInput
          ? "Current BattleScene binds one attack key and resolves turns immediately."
          : "Battle input path drifted away from the current single-attack baseline.",
        "There is no command cursor, target selection, or confirm stage.",
      ],
      differences: [
        "Battle parity still lacks a command-selection loop, so real battle UI cannot be calibrated beyond basic attack.",
        "战斗一致性目前仍缺少指令选择闭环，因此真实战斗 UI 无法继续校准到基础攻击之外。",
      ],
      suggestedRepairTargets: [
        filePath("game/src/scenes/BattleScene.ts"),
        filePath("game/src/battle/battleRuntime.ts"),
        filePath("tests/regression/battle-parity-cases.json"),
      ],
      systems: ["battle-scene", "battle-runtime", "battle-parity"],
      evidenceFiles: [
        filePath("game/src/scenes/BattleScene.ts"),
      ],
    },
    {
      id: "chapter-01-lou-sang:save-entry-flow",
      repairGroupId: "save-entry-flow",
      title: "Lou Sang save entry behavior / 楼桑存档入口行为",
      area: "save",
      status: hasSaveEntryUi ? "matched" : "diverged",
      priority: "P2",
      locator: {
        chapterId: "chapter-01-lou-sang",
        mapId: "town",
      },
      expected: [
        "Save UI should expose an explicit save entry surface that players can discover inside the menu flow.",
        "存档 UI 应在菜单流程中提供明确且可发现的存档入口。",
      ],
      actual: [
        hasSaveHotkeyOnly
          ? "Current system page relies on S/L hotkeys and message text for save/load feedback."
          : "Save/load entry path drifted from the current hotkey baseline.",
        "There is no slot list, confirm step, or dedicated save sub-panel.",
      ],
      differences: [
        "Save behavior is functional but still anchored to hotkeys instead of an explicit UI entry loop.",
        "存档行为虽然可用，但目前仍依赖快捷键，而不是明确的 UI 入口闭环。",
      ],
      suggestedRepairTargets: [
        filePath("game/src/ui/menuController.ts"),
        filePath("game/src/ui/menuOverlay.ts"),
        filePath("tests/runtime/menuController.test.ts"),
      ],
      systems: ["menu-ui", "save-manager"],
      evidenceFiles: [
        filePath("game/src/ui/menuController.ts"),
        filePath("game/src/ui/menuOverlay.ts"),
      ],
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    focusScenes: [
      {
        chapterId: "chapter-01-lou-sang",
        mapId: "town",
        purpose: "dialogue, menu, shop, and save loop / 对话、菜单、商店与存档闭环",
      },
      {
        chapterId: "chapter-03-river-ford",
        mapId: "river-ford",
        purpose: "real battle entry and command loop / 真实战斗进入与指令闭环",
      },
    ],
    totals: {
      matched: cases.filter((entry) => entry.status === "matched").length,
      diverged: cases.filter((entry) => entry.status === "diverged").length,
      total: cases.length,
    },
    cases,
  };
}

export function formatUiParityReport(report: UiParityReport): string {
  const lines = [
    "UI Parity Report / UI 一致性报告",
    `Generated At / 生成时间: ${report.generatedAt}`,
    `Totals / 汇总: matched=${report.totals.matched} diverged=${report.totals.diverged} total=${report.totals.total}`,
    "",
  ];

  report.cases.forEach((entry) => {
    lines.push(`${entry.status.toUpperCase()} ${entry.id} :: ${entry.title}`);
    lines.push(`  locator: chapter=${entry.locator.chapterId} | map=${entry.locator.mapId}${entry.locator.triggerId ? ` | trigger=${entry.locator.triggerId}` : ""}${entry.locator.eventId ? ` | event=${entry.locator.eventId}` : ""}${entry.locator.npcId ? ` | npc=${entry.locator.npcId}` : ""}`);
    if (entry.priority) {
      lines.push(`  priority: ${entry.priority}`);
    }
    entry.differences.forEach((difference) => {
      lines.push(`  diff: ${difference}`);
    });
    lines.push("");
  });

  return lines.join("\n");
}
