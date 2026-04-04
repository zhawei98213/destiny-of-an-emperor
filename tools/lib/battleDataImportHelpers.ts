import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { validateBattleParitySuite } from "./battleParityCases";
import { readJsonFile, repoRoot, stableStringify } from "./importerCore";
import { loadRealChapterMetadata, loadManualWorldContent } from "./manualContent";
import { validateGoldenRegressionSuite } from "../../tests/regression/goldenCaseSchema";
import { loadGameDataSource } from "./sourceSchemas";

type Severity = "blocker" | "non-blocker";

interface BattleScenarioSourceEntry {
  id: string;
  chapterId: string;
  name: string;
  mapId: string;
  triggerId: string;
  encounterTableId?: string;
  battleGroupId: string;
  goldenCaseId?: string;
  battleParityCaseId?: string;
  notes?: string;
}

interface BattleScenarioSourceDocument {
  format: "battle-scenario-source-v1";
  scenarios: BattleScenarioSourceEntry[];
}

export interface BattleImportIssue {
  severity: Severity;
  type:
    | "missing-battle-group"
    | "missing-enemy"
    | "missing-drop-item"
    | "missing-trigger"
    | "missing-encounter-table"
    | "missing-golden-case"
    | "missing-battle-parity-case"
    | "reward-regression";
  path: string;
  message: string;
}

export interface BattleEnemyGroupImportReport {
  generatedAt: string;
  sourceFile: string;
  enemyCount: number;
  battleGroupCount: number;
  issues: BattleImportIssue[];
  entries: Array<{
    enemyId: string;
    rewardGold: number;
    rewardExperience: number;
    dropItemIds: string[];
    battleGroupIds: string[];
  }>;
}

export interface BattleScenarioImportReport {
  generatedAt: string;
  sourceFile: string;
  scenarioCount: number;
  importedScenarioCount: number;
  issues: BattleImportIssue[];
  scenarios: Array<{
    id: string;
    chapterId: string;
    mapId: string;
    triggerId: string;
    battleGroupId: string;
    goldenCaseId?: string;
    battleParityCaseId?: string;
    imported: boolean;
  }>;
}

export interface BattleRewardValidationReport {
  generatedAt: string;
  issues: BattleImportIssue[];
  groups: Array<{
    id: string;
    enemyIds: string[];
    goldTotal: number;
    experienceTotal: number;
    dropItemIds: string[];
    status: "ok" | "review";
  }>;
}

export interface BattleParityChecklistReport {
  generatedAt: string;
  calibratedScenarioCount: number;
  blockerCount: number;
  issues: BattleImportIssue[];
  checklist: Array<{
    scenarioId: string;
    chapterId: string;
    battleGroupId: string;
    checks: Array<{
      label: string;
      passed: boolean;
      detail: string;
    }>;
  }>;
}

interface RewardValidationWorkingEntry {
  id: string;
  enemyIds: string[];
  goldTotal: number;
  experienceTotal: number;
  dropItemIds: string[];
  status: "ok" | "review";
  sortKey: number;
}

export const battleCalibrationReportDir = path.join(repoRoot, "reports", "battle-calibration", "latest");
const sourceFile = path.join(repoRoot, "content", "source", "data", "battle-scenarios.source.json");
const gameDataSourceFile = path.join(repoRoot, "content", "source", "data", "demo-game-data.source.json");
const battleContentFile = path.join(repoRoot, "content", "generated", "battle.content.json");
const battleParityCasesFile = path.join(repoRoot, "tests", "regression", "battle-parity-cases.json");
const goldenCasesFile = path.join(repoRoot, "tests", "regression", "golden-cases.json");

interface BattleGeneratedContent {
  enemies: Array<{
    id: string;
    rewardGold: number;
    rewardExperience: number;
    dropItems: Array<{ itemId: string; quantity: number; chance: number }>;
  }>;
  battleGroups: Array<{
    id: string;
    enemyIds: string[];
  }>;
}

function expectString(value: unknown, pathLabel: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`[battle-scenario-source] ${pathLabel}: expected non-empty string`);
  }
  return value;
}

function validateScenarioSource(value: unknown): BattleScenarioSourceDocument {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("[battle-scenario-source] root: expected object");
  }
  const record = value as Record<string, unknown>;
  if (record.format !== "battle-scenario-source-v1") {
    throw new Error('[battle-scenario-source] format: expected "battle-scenario-source-v1"');
  }
  if (!Array.isArray(record.scenarios)) {
    throw new Error("[battle-scenario-source] scenarios: expected array");
  }
  return {
    format: "battle-scenario-source-v1",
    scenarios: record.scenarios.map((entry, index) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        throw new Error(`[battle-scenario-source] scenarios[${index}]: expected object`);
      }
      const item = entry as Record<string, unknown>;
      return {
        id: expectString(item.id, `scenarios[${index}].id`),
        chapterId: expectString(item.chapterId, `scenarios[${index}].chapterId`),
        name: expectString(item.name, `scenarios[${index}].name`),
        mapId: expectString(item.mapId, `scenarios[${index}].mapId`),
        triggerId: expectString(item.triggerId, `scenarios[${index}].triggerId`),
        encounterTableId: item.encounterTableId === undefined ? undefined : expectString(item.encounterTableId, `scenarios[${index}].encounterTableId`),
        battleGroupId: expectString(item.battleGroupId, `scenarios[${index}].battleGroupId`),
        goldenCaseId: item.goldenCaseId === undefined ? undefined : expectString(item.goldenCaseId, `scenarios[${index}].goldenCaseId`),
        battleParityCaseId: item.battleParityCaseId === undefined ? undefined : expectString(item.battleParityCaseId, `scenarios[${index}].battleParityCaseId`),
        notes: item.notes === undefined ? undefined : expectString(item.notes, `scenarios[${index}].notes`),
      };
    }),
  };
}

async function loadScenarioSource(): Promise<BattleScenarioSourceDocument> {
  return validateScenarioSource(await readJsonFile<unknown>(sourceFile));
}

async function loadBattleGeneratedContent(): Promise<BattleGeneratedContent> {
  return readJsonFile<BattleGeneratedContent>(battleContentFile);
}

async function loadBattleParityCases() {
  const raw = JSON.parse(await readFile(battleParityCasesFile, "utf8"));
  return validateBattleParitySuite(raw);
}

async function loadGoldenCases() {
  const raw = JSON.parse(await readFile(goldenCasesFile, "utf8"));
  return validateGoldenRegressionSuite(raw);
}

function summarizeIssuesMarkdown(title: string, subtitle: string, issues: BattleImportIssue[], details: string[]): string {
  const lines = [title, subtitle, ""];
  details.forEach((detail) => lines.push(detail));
  lines.push("", "## Issues", "## 问题", "");
  if (issues.length === 0) {
    lines.push("- none / 无");
  } else {
    issues.forEach((issue) => lines.push(`- [${issue.severity}] ${issue.path}: ${issue.message}`));
  }
  return `${lines.join("\n")}\n`;
}

export async function buildBattleEnemyGroupImportReport(): Promise<BattleEnemyGroupImportReport> {
  const [source, generated, world] = await Promise.all([
    loadGameDataSource(gameDataSourceFile),
    loadBattleGeneratedContent(),
    loadManualWorldContent(),
  ]);

  const issues: BattleImportIssue[] = [];
  const sourceEnemies = new Map(source.enemies.map((entry) => [entry.id, entry] as const));
  const sourceGroups = new Map(source.battleGroups.map((entry) => [entry.id, entry] as const));
  const worldItems = new Set(world.items.map((entry) => entry.id));

  const entries = generated.enemies.map((enemy) => {
    if (!sourceEnemies.has(enemy.id)) {
      issues.push({
        severity: "blocker",
        type: "missing-enemy",
        path: `content/generated/battle.content.json:enemies.${enemy.id}`,
        message: `Generated enemy ${enemy.id} is missing from source data. / 生成敌人 ${enemy.id} 未在 source 数据中定义。`,
      });
    }
    enemy.dropItems.forEach((drop, index) => {
      if (!worldItems.has(drop.itemId)) {
        issues.push({
          severity: "blocker",
          type: "missing-drop-item",
          path: `content/generated/battle.content.json:enemies.${enemy.id}.dropItems[${index}]`,
          message: `Drop item ${drop.itemId} is missing from world items. / 掉落物 ${drop.itemId} 未在 world items 中定义。`,
        });
      }
    });
    return {
      enemyId: enemy.id,
      rewardGold: enemy.rewardGold,
      rewardExperience: enemy.rewardExperience,
      dropItemIds: enemy.dropItems.map((drop) => drop.itemId).sort((left, right) => left.localeCompare(right)),
      battleGroupIds: generated.battleGroups
        .filter((group) => group.enemyIds.includes(enemy.id))
        .map((group) => group.id)
        .sort((left, right) => left.localeCompare(right)),
    };
  });

  generated.battleGroups.forEach((group) => {
    if (!sourceGroups.has(group.id)) {
      issues.push({
        severity: "blocker",
        type: "missing-battle-group",
        path: `content/generated/battle.content.json:battleGroups.${group.id}`,
        message: `Generated battle group ${group.id} is missing from source data. / 生成敌群 ${group.id} 未在 source 数据中定义。`,
      });
    }
  });

  return {
    generatedAt: new Date().toISOString(),
    sourceFile: path.relative(repoRoot, gameDataSourceFile),
    enemyCount: generated.enemies.length,
    battleGroupCount: generated.battleGroups.length,
    issues,
    entries,
  };
}

export async function buildBattleScenarioImportReport(): Promise<BattleScenarioImportReport> {
  const [source, world, battleParitySuite, goldenSuite] = await Promise.all([
    loadScenarioSource(),
    loadManualWorldContent(),
    loadBattleParityCases(),
    loadGoldenCases(),
  ]);

  const parityCaseIds = new Set(battleParitySuite.cases.map((entry) => entry.id));
  const goldenCaseIds = new Set(goldenSuite.cases.map((entry) => entry.id));
  const triggerIndex = new Map(
    world.maps.flatMap((map) => map.triggers.map((trigger) => [trigger.id, { mapId: map.id, trigger }] as const)),
  );
  const encounterTableIds = new Set(world.encounterTables.map((entry) => entry.id));

  const issues: BattleImportIssue[] = [];
  const scenarios = source.scenarios.map((scenario, index) => {
    const triggerEntry = triggerIndex.get(scenario.triggerId);
    if (!triggerEntry) {
      issues.push({
        severity: "blocker",
        type: "missing-trigger",
        path: `${path.relative(repoRoot, sourceFile)}:scenarios[${index}].triggerId`,
        message: `Trigger ${scenario.triggerId} does not exist in world content. / trigger ${scenario.triggerId} 未在 world 内容中定义。`,
      });
    }
    if (scenario.encounterTableId && !encounterTableIds.has(scenario.encounterTableId)) {
      issues.push({
        severity: "blocker",
        type: "missing-encounter-table",
        path: `${path.relative(repoRoot, sourceFile)}:scenarios[${index}].encounterTableId`,
        message: `Encounter table ${scenario.encounterTableId} does not exist in world content. / 遭遇表 ${scenario.encounterTableId} 未在 world 内容中定义。`,
      });
    }
    if (scenario.goldenCaseId && !goldenCaseIds.has(scenario.goldenCaseId)) {
      issues.push({
        severity: "blocker",
        type: "missing-golden-case",
        path: `${path.relative(repoRoot, sourceFile)}:scenarios[${index}].goldenCaseId`,
        message: `Golden case ${scenario.goldenCaseId} is missing. / golden case ${scenario.goldenCaseId} 不存在。`,
      });
    }
    if (scenario.battleParityCaseId && !parityCaseIds.has(scenario.battleParityCaseId)) {
      issues.push({
        severity: "blocker",
        type: "missing-battle-parity-case",
        path: `${path.relative(repoRoot, sourceFile)}:scenarios[${index}].battleParityCaseId`,
        message: `Battle parity case ${scenario.battleParityCaseId} is missing. / battle parity case ${scenario.battleParityCaseId} 不存在。`,
      });
    }

    const imported = Boolean(
      triggerEntry
      && (!scenario.encounterTableId || encounterTableIds.has(scenario.encounterTableId))
      && (!scenario.goldenCaseId || goldenCaseIds.has(scenario.goldenCaseId))
      && (!scenario.battleParityCaseId || parityCaseIds.has(scenario.battleParityCaseId)),
    );

    return {
      id: scenario.id,
      chapterId: scenario.chapterId,
      mapId: scenario.mapId,
      triggerId: scenario.triggerId,
      battleGroupId: scenario.battleGroupId,
      goldenCaseId: scenario.goldenCaseId,
      battleParityCaseId: scenario.battleParityCaseId,
      imported,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    sourceFile: path.relative(repoRoot, sourceFile),
    scenarioCount: source.scenarios.length,
    importedScenarioCount: scenarios.filter((entry) => entry.imported).length,
    issues,
    scenarios,
  };
}

export async function buildBattleRewardValidationReport(): Promise<BattleRewardValidationReport> {
  const [source, generated] = await Promise.all([
    loadGameDataSource(gameDataSourceFile),
    loadBattleGeneratedContent(),
  ]);

  const issues: BattleImportIssue[] = [];
  const enemyOrder = new Map(source.enemies.map((entry, index) => [entry.id, index] as const));

  const groups: RewardValidationWorkingEntry[] = generated.battleGroups.map((group) => {
    const groupEnemies = group.enemyIds
      .map((enemyId) => generated.enemies.find((enemy) => enemy.id === enemyId))
      .filter((enemy): enemy is NonNullable<typeof enemy> => Boolean(enemy));
    const goldTotal = groupEnemies.reduce((sum, enemy) => sum + enemy.rewardGold, 0);
    const experienceTotal = groupEnemies.reduce((sum, enemy) => sum + enemy.rewardExperience, 0);
    const dropItemIds = [...new Set(groupEnemies.flatMap((enemy) => enemy.dropItems.map((drop) => drop.itemId)))].sort((left, right) => left.localeCompare(right));
    return {
      id: group.id,
      enemyIds: group.enemyIds,
      goldTotal,
      experienceTotal,
      dropItemIds,
      status: "ok" as RewardValidationWorkingEntry["status"],
      sortKey: Math.min(...group.enemyIds.map((enemyId) => enemyOrder.get(enemyId) ?? Number.MAX_SAFE_INTEGER)),
    };
  }).sort((left, right) => left.sortKey - right.sortKey);

  for (let index = 1; index < groups.length; index += 1) {
    if (groups[index].goldTotal < groups[index - 1].goldTotal) {
      issues.push({
        severity: "non-blocker",
        type: "reward-regression",
        path: `content/generated/battle.content.json:battleGroups.${groups[index].id}`,
        message: `Reward gold for ${groups[index].id} is lower than the previous group baseline. / ${groups[index].id} 的金钱奖励低于前一敌群基线。`,
      });
      groups[index] = { ...groups[index], status: "review" };
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    issues,
    groups: groups.map(({ sortKey: _sortKey, ...entry }) => entry),
  };
}

export async function buildBattleParityChecklistReport(): Promise<BattleParityChecklistReport> {
  const [chapters, scenarioReport] = await Promise.all([
    loadRealChapterMetadata(),
    buildBattleScenarioImportReport(),
  ]);
  const chapterIndex = new Map(chapters.map((entry) => [entry.chapterId, entry] as const));
  const issues = [...scenarioReport.issues];
  const checklist = scenarioReport.scenarios.map((scenario) => {
    const chapter = chapterIndex.get(scenario.chapterId);
    const checks = [
      {
        label: "chapter owns battle group / 章节归属敌群",
        passed: Boolean(chapter?.enemyGroups.includes(scenario.battleGroupId)),
        detail: chapter?.enemyGroups.includes(scenario.battleGroupId)
          ? `${scenario.battleGroupId} is listed in chapter metadata. / ${scenario.battleGroupId} 已登记在章节元数据中。`
          : `${scenario.battleGroupId} is missing from chapter metadata. / ${scenario.battleGroupId} 未登记在章节元数据中。`,
      },
      {
        label: "golden regression linked / golden 回归已绑定",
        passed: Boolean(scenario.goldenCaseId),
        detail: scenario.goldenCaseId
          ? `${scenario.goldenCaseId} linked. / 已绑定 ${scenario.goldenCaseId}。`
          : "missing golden case linkage / 缺少 golden case 绑定。",
      },
      {
        label: "battle parity linked / battle parity 已绑定",
        passed: Boolean(scenario.battleParityCaseId),
        detail: scenario.battleParityCaseId
          ? `${scenario.battleParityCaseId} linked. / 已绑定 ${scenario.battleParityCaseId}。`
          : "missing battle parity linkage / 缺少 battle parity 绑定。",
      },
      {
        label: "scenario import ready / 场景导入就绪",
        passed: scenario.imported,
        detail: scenario.imported
          ? "scenario source resolves against current content. / 场景 source 已能对上当前内容。"
          : "scenario source is still missing required links. / 场景 source 仍缺必要关联。",
      },
    ];

    checks.forEach((check, index) => {
      if (!check.passed) {
        issues.push({
          severity: "blocker",
          type: "missing-battle-parity-case",
          path: `battle-parity-checklist.${scenario.id}.${index}`,
          message: `${scenario.id}: ${check.detail}`,
        });
      }
    });

    return {
      scenarioId: scenario.id,
      chapterId: scenario.chapterId,
      battleGroupId: scenario.battleGroupId,
      checks,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    calibratedScenarioCount: checklist.filter((entry) => entry.checks.every((check) => check.passed)).length,
    blockerCount: issues.filter((issue) => issue.severity === "blocker").length,
    issues,
    checklist,
  };
}

async function writeArtifactPair(name: string, payload: unknown, markdown: string): Promise<void> {
  await mkdir(battleCalibrationReportDir, { recursive: true });
  await Promise.all([
    writeFile(path.join(battleCalibrationReportDir, `${name}.json`), `${stableStringify(payload)}\n`, "utf8"),
    writeFile(path.join(battleCalibrationReportDir, `${name}.md`), markdown, "utf8"),
  ]);
}

export async function writeBattleCalibrationArtifacts(): Promise<{
  enemyGroupImport: BattleEnemyGroupImportReport;
  battleScenarioImport: BattleScenarioImportReport;
  rewardValidation: BattleRewardValidationReport;
  parityChecklist: BattleParityChecklistReport;
}> {
  const [enemyGroupImport, battleScenarioImport, rewardValidation, parityChecklist] = await Promise.all([
    buildBattleEnemyGroupImportReport(),
    buildBattleScenarioImportReport(),
    buildBattleRewardValidationReport(),
    buildBattleParityChecklistReport(),
  ]);

  await Promise.all([
    writeArtifactPair(
      "enemy-group-import",
      enemyGroupImport,
      summarizeIssuesMarkdown(
        "# Enemy And Group Import Report\n# 敌人与敌群导入报告",
        "",
        enemyGroupImport.issues,
        [
          `- Source File / 来源文件: ${enemyGroupImport.sourceFile}`,
          `- Enemy Count / 敌人数量: ${enemyGroupImport.enemyCount}`,
          `- Battle Group Count / 敌群数量: ${enemyGroupImport.battleGroupCount}`,
        ],
      ),
    ),
    writeArtifactPair(
      "battle-scenario-import",
      battleScenarioImport,
      summarizeIssuesMarkdown(
        "# Battle Scenario Import Report\n# 战斗场景导入报告",
        "",
        battleScenarioImport.issues,
        [
          `- Source File / 来源文件: ${battleScenarioImport.sourceFile}`,
          `- Scenario Count / 场景数量: ${battleScenarioImport.scenarioCount}`,
          `- Imported Scenario Count / 已导入场景数: ${battleScenarioImport.importedScenarioCount}`,
        ],
      ),
    ),
    writeArtifactPair(
      "reward-drop-validation",
      rewardValidation,
      summarizeIssuesMarkdown(
        "# Reward Drop Validation\n# 奖励掉落校验",
        "",
        rewardValidation.issues,
        rewardValidation.groups.map((group) => `- ${group.id}: gold=${group.goldTotal} exp=${group.experienceTotal} drops=${group.dropItemIds.join(", ") || "none"} status=${group.status}`),
      ),
    ),
    writeArtifactPair(
      "battle-parity-checklist",
      parityChecklist,
      summarizeIssuesMarkdown(
        "# Battle Parity Checklist\n# 战斗一致性检查清单",
        "",
        parityChecklist.issues,
        [
          `- Calibrated Scenario Count / 已校准场景数: ${parityChecklist.calibratedScenarioCount}`,
          `- Blocker Count / 阻塞项数量: ${parityChecklist.blockerCount}`,
        ],
      ),
    ),
  ]);

  return {
    enemyGroupImport,
    battleScenarioImport,
    rewardValidation,
    parityChecklist,
  };
}
