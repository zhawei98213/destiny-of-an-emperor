import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { repoRoot, stableStringify } from "./importerCore";

export type BattleUiParityPriority = "P1" | "P2" | "P3";

export interface BattleUiFlowCase {
  id: string;
  title: string;
  area: "command" | "target" | "result" | "transition";
  status: "matched" | "diverged";
  priority: BattleUiParityPriority;
  locator: {
    chapterId: string;
    mapId: string;
    triggerId?: string;
    battleGroupId?: string;
  };
  expected: string[];
  actual: string[];
  differences: string[];
  suggestedRepairTargets: string[];
  evidenceFiles: string[];
}

export interface BattleUiFlowReport {
  generatedAt: string;
  focusScenes: Array<{
    chapterId: string;
    mapId: string;
    battleGroupId: string;
    purpose: string;
  }>;
  totals: {
    matched: number;
    diverged: number;
    total: number;
  };
  cases: BattleUiFlowCase[];
}

export const battleUiFlowReportDir = path.join(repoRoot, "reports", "battle-ui-flow", "latest");

function filePath(relativePath: string): string {
  return path.join(repoRoot, relativePath);
}

async function readRelativeFile(relativePath: string): Promise<string> {
  return readFile(path.join(repoRoot, relativePath), "utf8");
}

function includesAll(text: string, needles: string[]): boolean {
  return needles.every((needle) => text.includes(needle));
}

export async function buildBattleUiFlowReport(): Promise<BattleUiFlowReport> {
  const battleSceneSource = await readRelativeFile("game/src/scenes/BattleScene.ts");
  const battleRuntimeSource = await readRelativeFile("game/src/battle/battleRuntime.ts");

  const hasCommandSelectionLoop = battleSceneSource.includes("selectedCommand")
    || battleSceneSource.includes("commandIndex");
  const hasConfirmCancel = battleSceneSource.includes("cancelKey")
    && (battleSceneSource.includes("confirm") || battleSceneSource.includes("cancel"));
  const hasTargetSelection = battleSceneSource.includes("targetIndex")
    || battleSceneSource.includes("selectedTargetId");
  const hasResultMessagePause = battleSceneSource.includes("pendingResultAdvance")
    || battleSceneSource.includes("resultMessageQueue");
  const hasBattleEndTransitionGate = includesAll(battleSceneSource, [
    "if (this.battleState.outcome)",
    "Press Space to return",
  ]);
  const hasImmediateAttackResolution = includesAll(battleSceneSource, [
    'this.attackKey = this.input.keyboard?.addKey("A");',
    "runAttackTurn(this.battleState).state",
  ]);
  const hasSingleTargetAttack = battleRuntimeSource.includes("findFirstLivingTarget");

  const cases: BattleUiFlowCase[] = [
    {
      id: "chapter-05-highland-waystation:command-selection",
      title: "Waystation battle command selection / 驿门战斗指令选择",
      area: "command",
      status: hasCommandSelectionLoop ? "matched" : "diverged",
      priority: "P1",
      locator: {
        chapterId: "chapter-05-highland-waystation",
        mapId: "waystation-gate",
        triggerId: "waystation-gate-battle-trigger",
        battleGroupId: "highland-outlaws",
      },
      expected: [
        "Battle UI should enter a command-selection state before resolving an ally turn.",
        "战斗 UI 应先进入指令选择状态，再结算我方回合。",
      ],
      actual: [
        hasImmediateAttackResolution
          ? "Current battle loop binds a direct attack key and resolves the turn immediately."
          : "Immediate attack resolution path is no longer present.",
      ],
      differences: hasCommandSelectionLoop
        ? []
        : [
          "Battle command selection loop is still missing.",
          "战斗指令选择闭环仍然缺失。",
        ],
      suggestedRepairTargets: [
        filePath("game/src/scenes/BattleScene.ts"),
        filePath("tests/regression/battle-ui-cases.json"),
      ],
      evidenceFiles: [
        filePath("game/src/scenes/BattleScene.ts"),
      ],
    },
    {
      id: "chapter-05-highland-waystation:command-confirm-cancel",
      title: "Waystation battle confirm and cancel / 驿门战斗确认与取消",
      area: "command",
      status: hasConfirmCancel ? "matched" : "diverged",
      priority: "P1",
      locator: {
        chapterId: "chapter-05-highland-waystation",
        mapId: "waystation-gate",
        triggerId: "waystation-gate-battle-trigger",
        battleGroupId: "highland-outlaws",
      },
      expected: [
        "Battle command flow should expose confirm and cancel behavior before action execution.",
        "战斗指令流应在执行前提供确认与取消行为。",
      ],
      actual: [
        hasConfirmCancel
          ? "Battle scene now exposes explicit confirm/cancel input handling."
          : "Current battle loop only supports attack/advance input and no cancel path.",
      ],
      differences: hasConfirmCancel
        ? []
        : [
          "Confirm/cancel behavior is not available in battle UI.",
          "战斗 UI 还没有确认/取消行为。",
        ],
      suggestedRepairTargets: [
        filePath("game/src/scenes/BattleScene.ts"),
        filePath("tests/regression/battle-ui-cases.json"),
      ],
      evidenceFiles: [
        filePath("game/src/scenes/BattleScene.ts"),
      ],
    },
    {
      id: "chapter-05-highland-waystation:target-selection",
      title: "Waystation target selection / 驿门战斗目标选择",
      area: "target",
      status: hasTargetSelection && !hasSingleTargetAttack ? "matched" : "diverged",
      priority: "P1",
      locator: {
        chapterId: "chapter-05-highland-waystation",
        mapId: "waystation-gate",
        triggerId: "waystation-gate-battle-trigger",
        battleGroupId: "highland-outlaws",
      },
      expected: [
        "Battle UI should allow choosing a target when multiple enemies are alive.",
        "多名敌人存活时，战斗 UI 应允许手动选择目标。",
      ],
      actual: [
        hasSingleTargetAttack
          ? "Battle runtime still resolves actions against the first living enemy target."
          : "Battle runtime no longer hardcodes first-living target selection.",
      ],
      differences: hasTargetSelection && !hasSingleTargetAttack
        ? []
        : [
          "Target selection is still hardcoded to the first living target.",
          "目标选择仍被硬编码为首个存活目标。",
        ],
      suggestedRepairTargets: [
        filePath("game/src/scenes/BattleScene.ts"),
        filePath("game/src/battle/battleRuntime.ts"),
        filePath("tests/regression/battle-ui-cases.json"),
      ],
      evidenceFiles: [
        filePath("game/src/scenes/BattleScene.ts"),
        filePath("game/src/battle/battleRuntime.ts"),
      ],
    },
    {
      id: "chapter-05-highland-waystation:result-message-timing",
      title: "Waystation result message timing / 驿门战斗结果提示时机",
      area: "result",
      status: hasResultMessagePause ? "matched" : "diverged",
      priority: "P2",
      locator: {
        chapterId: "chapter-05-highland-waystation",
        mapId: "waystation-gate",
        triggerId: "waystation-gate-battle-trigger",
        battleGroupId: "highland-outlaws",
      },
      expected: [
        "Damage and defeat messages should remain visible long enough for review before advancing.",
        "伤害与击倒信息应保留足够时间，便于玩家读取。",
      ],
      actual: [
        hasResultMessagePause
          ? "Battle scene now has a dedicated result message gating path."
          : "Battle log updates immediately with no dedicated per-result pause gate.",
      ],
      differences: hasResultMessagePause
        ? []
        : [
          "Battle result message timing is still tied to the main loop without a dedicated pause.",
          "战斗结果提示时机仍直接绑定主循环，没有单独停顿。",
        ],
      suggestedRepairTargets: [
        filePath("game/src/scenes/BattleScene.ts"),
        filePath("tests/regression/battle-ui-cases.json"),
      ],
      evidenceFiles: [
        filePath("game/src/scenes/BattleScene.ts"),
      ],
    },
    {
      id: "chapter-05-highland-waystation:battle-end-transition",
      title: "Waystation battle end transition / 驿门战斗结束过场",
      area: "transition",
      status: hasBattleEndTransitionGate ? "matched" : "diverged",
      priority: "P2",
      locator: {
        chapterId: "chapter-05-highland-waystation",
        mapId: "waystation-gate",
        triggerId: "waystation-gate-battle-trigger",
        battleGroupId: "highland-outlaws",
      },
      expected: [
        "Battle end should clearly gate the return-to-world transition after victory or defeat messaging.",
        "战斗结束后，应在胜负提示后明确控制返回 world 的过场时机。",
      ],
      actual: [
        hasBattleEndTransitionGate
          ? "BattleScene waits for an explicit advance input before returning to world."
          : "Battle end no longer exposes an explicit transition gate.",
      ],
      differences: hasBattleEndTransitionGate ? [] : [
        "Battle end transition gate is missing.",
        "战斗结束过场闸门缺失。",
      ],
      suggestedRepairTargets: [
        filePath("game/src/scenes/BattleScene.ts"),
        filePath("tests/regression/battle-ui-cases.json"),
      ],
      evidenceFiles: [
        filePath("game/src/scenes/BattleScene.ts"),
      ],
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    focusScenes: [
      {
        chapterId: "chapter-05-highland-waystation",
        mapId: "waystation-gate",
        battleGroupId: "highland-outlaws",
        purpose: "Real battle UI command loop and settlement flow / 真实战斗 UI 指令闭环与结算流程",
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

function renderSummary(report: BattleUiFlowReport): string {
  return [
    "# Battle UI Flow Parity Report",
    "# 战斗 UI 流程一致性报告",
    "",
    `- Generated At / 生成时间: ${report.generatedAt}`,
    `- Matched / 已匹配: ${report.totals.matched}`,
    `- Diverged / 有偏差: ${report.totals.diverged}`,
    `- Total / 总数: ${report.totals.total}`,
    "",
    "## Cases",
    "## 条目",
    "",
    ...report.cases.flatMap((entry) => [
      `### ${entry.id}`,
      "",
      `- Title / 标题: ${entry.title}`,
      `- Area / 区域: ${entry.area}`,
      `- Status / 状态: ${entry.status}`,
      `- Priority / 优先级: ${entry.priority}`,
      `- Locator / 定位: chapter=${entry.locator.chapterId}, map=${entry.locator.mapId}${entry.locator.triggerId ? `, trigger=${entry.locator.triggerId}` : ""}${entry.locator.battleGroupId ? `, battleGroup=${entry.locator.battleGroupId}` : ""}`,
      ...entry.differences.map((difference) => `- Difference / 差异: ${difference}`),
      "",
    ]),
  ].join("\n");
}

export async function writeBattleUiFlowParityArtifacts(): Promise<BattleUiFlowReport> {
  const report = await buildBattleUiFlowReport();
  await mkdir(battleUiFlowReportDir, { recursive: true });
  await writeFile(path.join(battleUiFlowReportDir, "report.json"), `${stableStringify(report)}\n`, "utf8");
  await writeFile(path.join(battleUiFlowReportDir, "summary.md"), `${renderSummary(report)}\n`, "utf8");
  return report;
}
