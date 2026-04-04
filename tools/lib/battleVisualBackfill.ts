import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadManualAssetRegistryContent } from "./manualContent";
import { formatError, readJsonFile, repoRoot, stableStringify } from "./importerCore";
import { loadReferenceManifest } from "./referencePipeline";

type BattleVisualState = "placeholder" | "imported" | "locked";
type BattleAssetType = "backdrop" | "enemy-sprite" | "ui-panel";

export interface BattleAssetManifestEntry {
  id: string;
  chapterId: string;
  mapIds: string[];
  battleGroupIds: string[];
  logicalAssetKey: string;
  assetType: BattleAssetType;
  state: BattleVisualState;
  referenceIds: string[];
  notes: string;
}

export interface BattleAssetManifest {
  format: "battle-asset-manifest-v1";
  entries: BattleAssetManifestEntry[];
}

export interface BattleEnemySpriteIntakeEntry {
  id: string;
  chapterId: string;
  enemyId: string;
  logicalAssetKey: string;
  state: BattleVisualState;
  referenceIds: string[];
  silhouette: "humanoid" | "beast" | "slime";
  dominantColors: string[];
  notes: string;
}

export interface BattleEnemySpriteIntakeDocument {
  format: "battle-enemy-sprite-intake-v1";
  entries: BattleEnemySpriteIntakeEntry[];
}

export interface BattleVisualIssue {
  severity: "error" | "warning";
  type:
    | "duplicate-entry-id"
    | "missing-reference"
    | "missing-registry-binding"
    | "missing-intake"
    | "resource-kind-mismatch";
  path: string;
  message: string;
}

export interface BattleVisualBackfillReport {
  generatedAt: string;
  summary: {
    entryCount: number;
    importedCount: number;
    lockedCount: number;
    errorCount: number;
    warningCount: number;
  };
  entries: Array<{
    id: string;
    chapterId: string;
    logicalAssetKey: string;
    assetType: BattleAssetType;
    targetState: BattleVisualState;
    effectiveState?: string;
    runtimeAttached: boolean;
    sourceManifestIds: string[];
  }>;
  issues: BattleVisualIssue[];
}

export interface BattleVisualParityScoreReport {
  generatedAt: string;
  summary: {
    entryCount: number;
    scoreBefore: number;
    scoreAfter: number;
    delta: number;
  };
  entries: Array<{
    id: string;
    logicalAssetKey: string;
    assetType: BattleAssetType;
    baseState: string;
    effectiveState: string;
    scoreBefore: number;
    scoreAfter: number;
    delta: number;
  }>;
}

const battleManifestPath = path.join(repoRoot, "content", "reference", "battle", "battle-asset-manifest.json");
const enemyIntakePath = path.join(repoRoot, "content", "reference", "enemies", "battle-enemy-sprite-intake.json");
export const battleVisualBackfillReportDir = path.join(repoRoot, "reports", "battle-visual-backfill", "latest");
export const battleVisualParityReportDir = path.join(repoRoot, "reports", "battle-visual-parity", "latest");

function expectRecord(value: unknown, filePath: string, fieldPath: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw formatError(filePath, fieldPath, "must be an object");
  }
  return value as Record<string, unknown>;
}

function expectString(value: unknown, filePath: string, fieldPath: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw formatError(filePath, fieldPath, "must be a non-empty string");
  }
  return value;
}

function expectStringArray(value: unknown, filePath: string, fieldPath: string): string[] {
  if (!Array.isArray(value)) {
    throw formatError(filePath, fieldPath, "must be an array of strings");
  }
  return value.map((entry, index) => expectString(entry, filePath, `${fieldPath}[${index}]`));
}

function expectEnum<T extends string>(value: unknown, valid: readonly T[], filePath: string, fieldPath: string): T {
  if (!valid.includes(value as T)) {
    throw formatError(filePath, fieldPath, `must be one of ${valid.join(", ")}`);
  }
  return value as T;
}

function validateBattleAssetManifest(value: unknown, filePath: string): BattleAssetManifest {
  const record = expectRecord(value, filePath, "root");
  if (record.format !== "battle-asset-manifest-v1") {
    throw formatError(filePath, "format", 'must be "battle-asset-manifest-v1"');
  }
  if (!Array.isArray(record.entries)) {
    throw formatError(filePath, "entries", "must be an array");
  }
  return {
    format: "battle-asset-manifest-v1",
    entries: record.entries.map((entry, index) => {
      const item = expectRecord(entry, filePath, `entries[${index}]`);
      return {
        id: expectString(item.id, filePath, `entries[${index}].id`),
        chapterId: expectString(item.chapterId, filePath, `entries[${index}].chapterId`),
        mapIds: expectStringArray(item.mapIds, filePath, `entries[${index}].mapIds`),
        battleGroupIds: expectStringArray(item.battleGroupIds, filePath, `entries[${index}].battleGroupIds`),
        logicalAssetKey: expectString(item.logicalAssetKey, filePath, `entries[${index}].logicalAssetKey`),
        assetType: expectEnum(item.assetType, ["backdrop", "enemy-sprite", "ui-panel"], filePath, `entries[${index}].assetType`),
        state: expectEnum(item.state, ["placeholder", "imported", "locked"], filePath, `entries[${index}].state`),
        referenceIds: expectStringArray(item.referenceIds, filePath, `entries[${index}].referenceIds`),
        notes: expectString(item.notes, filePath, `entries[${index}].notes`),
      };
    }),
  };
}

function validateBattleEnemySpriteIntake(value: unknown, filePath: string): BattleEnemySpriteIntakeDocument {
  const record = expectRecord(value, filePath, "root");
  if (record.format !== "battle-enemy-sprite-intake-v1") {
    throw formatError(filePath, "format", 'must be "battle-enemy-sprite-intake-v1"');
  }
  if (!Array.isArray(record.entries)) {
    throw formatError(filePath, "entries", "must be an array");
  }
  return {
    format: "battle-enemy-sprite-intake-v1",
    entries: record.entries.map((entry, index) => {
      const item = expectRecord(entry, filePath, `entries[${index}]`);
      return {
        id: expectString(item.id, filePath, `entries[${index}].id`),
        chapterId: expectString(item.chapterId, filePath, `entries[${index}].chapterId`),
        enemyId: expectString(item.enemyId, filePath, `entries[${index}].enemyId`),
        logicalAssetKey: expectString(item.logicalAssetKey, filePath, `entries[${index}].logicalAssetKey`),
        state: expectEnum(item.state, ["placeholder", "imported", "locked"], filePath, `entries[${index}].state`),
        referenceIds: expectStringArray(item.referenceIds, filePath, `entries[${index}].referenceIds`),
        silhouette: expectEnum(item.silhouette, ["humanoid", "beast", "slime"], filePath, `entries[${index}].silhouette`),
        dominantColors: expectStringArray(item.dominantColors, filePath, `entries[${index}].dominantColors`),
        notes: expectString(item.notes, filePath, `entries[${index}].notes`),
      };
    }),
  };
}

export async function loadBattleAssetManifest(): Promise<BattleAssetManifest> {
  return validateBattleAssetManifest(
    await readJsonFile<unknown>(battleManifestPath),
    path.relative(repoRoot, battleManifestPath),
  );
}

export async function loadBattleEnemySpriteIntake(): Promise<BattleEnemySpriteIntakeDocument> {
  return validateBattleEnemySpriteIntake(
    await readJsonFile<unknown>(enemyIntakePath),
    path.relative(repoRoot, enemyIntakePath),
  );
}

function stateScore(state: string): number {
  switch (state) {
    case "locked":
      return 100;
    case "imported":
      return 70;
    case "placeholder":
      return 20;
    default:
      return 0;
  }
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export async function buildBattleVisualBackfillReport(): Promise<BattleVisualBackfillReport> {
  const [manifest, intake, references, registry] = await Promise.all([
    loadBattleAssetManifest(),
    loadBattleEnemySpriteIntake(),
    loadReferenceManifest(),
    loadManualAssetRegistryContent(),
  ]);

  const issues: BattleVisualIssue[] = [];
  const referenceIds = new Set(references.entries.map((entry) => entry.id));
  const entryIds = new Set<string>();
  const baseBindings = new Map(registry.assetBindings.map((entry) => [entry.key, entry]));
  const overrideBindings = new Map(
    registry.assetOverrides.flatMap((override) =>
      override.assetBindings.map((binding) => [`${override.chapterId}:${binding.key}`, binding] as const),
    ),
  );
  const intakeByKey = new Map(intake.entries.map((entry) => [entry.logicalAssetKey, entry] as const));

  const entries = manifest.entries.map((entry, index) => {
    if (entryIds.has(entry.id)) {
      issues.push({
        severity: "error",
        type: "duplicate-entry-id",
        path: `entries[${index}].id`,
        message: `duplicate battle asset manifest id "${entry.id}" / 重复的 battle asset manifest id "${entry.id}"`,
      });
    }
    entryIds.add(entry.id);

    entry.referenceIds.forEach((referenceId) => {
      if (!referenceIds.has(referenceId)) {
        issues.push({
          severity: "error",
          type: "missing-reference",
          path: `entries[${index}].referenceIds`,
          message: `missing reference id "${referenceId}" / 缺少 reference id "${referenceId}"`,
        });
      }
    });

    if (entry.assetType === "enemy-sprite" && !intakeByKey.has(entry.logicalAssetKey)) {
      issues.push({
        severity: "error",
        type: "missing-intake",
        path: `entries[${index}].logicalAssetKey`,
        message: `enemy visual "${entry.logicalAssetKey}" is missing enemy intake metadata / 敌方视觉 "${entry.logicalAssetKey}" 缺少 intake 元数据`,
      });
    }

    const effectiveBinding = overrideBindings.get(`${entry.chapterId}:${entry.logicalAssetKey}`) ?? baseBindings.get(entry.logicalAssetKey);
    if (!effectiveBinding) {
      issues.push({
        severity: "error",
        type: "missing-registry-binding",
        path: `entries[${index}].logicalAssetKey`,
        message: `missing asset registry binding for "${entry.logicalAssetKey}" / 缺少 "${entry.logicalAssetKey}" 的 asset registry 绑定`,
      });
    } else if (
      (entry.assetType === "backdrop" && effectiveBinding.resource.kind !== "battle-backdrop")
      || (entry.assetType === "enemy-sprite" && effectiveBinding.resource.kind !== "battle-visual")
      || (entry.assetType === "ui-panel" && effectiveBinding.resource.kind !== "panel-style")
    ) {
      issues.push({
        severity: "error",
        type: "resource-kind-mismatch",
        path: `entries[${index}].logicalAssetKey`,
        message: `asset "${entry.logicalAssetKey}" uses incompatible resource kind "${effectiveBinding.resource.kind}" / 资源 "${entry.logicalAssetKey}" 使用了不兼容的资源类型 "${effectiveBinding.resource.kind}"`,
      });
    }

    return {
      id: entry.id,
      chapterId: entry.chapterId,
      logicalAssetKey: entry.logicalAssetKey,
      assetType: entry.assetType,
      targetState: entry.state,
      effectiveState: effectiveBinding?.state,
      runtimeAttached: Boolean(effectiveBinding),
      sourceManifestIds: entry.referenceIds,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      entryCount: entries.length,
      importedCount: entries.filter((entry) => entry.effectiveState === "imported").length,
      lockedCount: entries.filter((entry) => entry.effectiveState === "locked").length,
      errorCount: issues.filter((issue) => issue.severity === "error").length,
      warningCount: issues.filter((issue) => issue.severity === "warning").length,
    },
    entries,
    issues,
  };
}

export async function buildBattleVisualParityScoreReport(): Promise<BattleVisualParityScoreReport> {
  const [manifest, registry] = await Promise.all([
    loadBattleAssetManifest(),
    loadManualAssetRegistryContent(),
  ]);

  const baseBindings = new Map(registry.assetBindings.map((entry) => [entry.key, entry]));
  const overrideBindings = new Map(
    registry.assetOverrides.flatMap((override) =>
      override.assetBindings.map((binding) => [`${override.chapterId}:${binding.key}`, binding] as const),
    ),
  );

  const entries = manifest.entries.map((entry) => {
    const baseState = baseBindings.get(entry.logicalAssetKey)?.state ?? "placeholder";
    const effectiveState = overrideBindings.get(`${entry.chapterId}:${entry.logicalAssetKey}`)?.state
      ?? baseState;
    const scoreBefore = stateScore(baseState);
    const scoreAfter = stateScore(effectiveState);
    return {
      id: entry.id,
      logicalAssetKey: entry.logicalAssetKey,
      assetType: entry.assetType,
      baseState,
      effectiveState,
      scoreBefore,
      scoreAfter,
      delta: scoreAfter - scoreBefore,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      entryCount: entries.length,
      scoreBefore: average(entries.map((entry) => entry.scoreBefore)),
      scoreAfter: average(entries.map((entry) => entry.scoreAfter)),
      delta: average(entries.map((entry) => entry.delta)),
    },
    entries,
  };
}

export async function writeBattleVisualBackfillArtifacts(): Promise<BattleVisualBackfillReport> {
  const report = await buildBattleVisualBackfillReport();
  await mkdir(battleVisualBackfillReportDir, { recursive: true });
  await Promise.all([
    writeFile(path.join(battleVisualBackfillReportDir, "report.json"), `${stableStringify(report)}\n`, "utf8"),
    writeFile(
      path.join(battleVisualBackfillReportDir, "summary.md"),
      `# Battle Visual Backfill\n# 战斗视觉回填\n\n- Entry Count / 条目数: ${report.summary.entryCount}\n- Imported Count / 已导入数: ${report.summary.importedCount}\n- Locked Count / 已锁定数: ${report.summary.lockedCount}\n- Error Count / 错误数: ${report.summary.errorCount}\n- Warning Count / 警告数: ${report.summary.warningCount}\n`,
      "utf8",
    ),
  ]);
  return report;
}

export async function writeBattleVisualParityScoreArtifacts(): Promise<BattleVisualParityScoreReport> {
  const report = await buildBattleVisualParityScoreReport();
  await mkdir(battleVisualParityReportDir, { recursive: true });
  await Promise.all([
    writeFile(path.join(battleVisualParityReportDir, "report.json"), `${stableStringify(report)}\n`, "utf8"),
    writeFile(
      path.join(battleVisualParityReportDir, "summary.md"),
      `# Battle Visual Parity Score\n# 战斗视觉一致性得分\n\n- Entry Count / 条目数: ${report.summary.entryCount}\n- Score Before / 替换前得分: ${report.summary.scoreBefore}\n- Score After / 替换后得分: ${report.summary.scoreAfter}\n- Delta / 提升: ${report.summary.delta}\n`,
      "utf8",
    ),
  ]);
  return report;
}
