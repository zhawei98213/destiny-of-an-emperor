import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadManualAssetRegistryContent, loadRealChapterMetadata } from "./manualContent";
import { formatError, readJsonFile, repoRoot, stableStringify } from "./importerCore";
import { loadReferenceManifest } from "./referencePipeline";

export type UiAssetEntryType = "panel" | "cursor" | "icon";
export type UiAssetReconstructionStatus = "placeholder" | "imported" | "locked";

export interface UiPanelRules {
  frameMode: "solid" | "nine-slice-css";
  borderThickness: number;
  cornerSize: number;
  paddingX: number;
  paddingY: number;
  lineHeight: number;
  pointerAssetKey?: string;
  selectedPrefix?: string;
  selectedSuffix?: string;
}

export interface UiGlyphRules {
  glyph: string;
  color: string;
  selectedColor?: string;
}

export interface UiAssetManifestEntry {
  id: string;
  logicalAssetKey: string;
  type: UiAssetEntryType;
  chapterId: string;
  mapIds: string[];
  state: UiAssetReconstructionStatus;
  referenceIds: string[];
  panelRules?: UiPanelRules;
  glyphRules?: UiGlyphRules;
  notes: string;
}

export interface UiAssetManifest {
  format: "ui-asset-manifest-v1";
  entries: UiAssetManifestEntry[];
}

export interface UiAssetIssue {
  severity: "error" | "warning";
  type:
    | "duplicate-entry-id"
    | "duplicate-logical-key"
    | "missing-reference"
    | "missing-registry-binding"
    | "resource-kind-mismatch"
    | "missing-source-manifest"
    | "invalid-rule";
  path: string;
  message: string;
}

export interface UiAssetEntrySummary {
  id: string;
  logicalAssetKey: string;
  type: UiAssetEntryType;
  chapterId: string;
  state: UiAssetReconstructionStatus;
  runtimeAttached: boolean;
  resolvedState?: string;
}

export interface UiAssetReconstructionReport {
  generatedAt: string;
  summary: {
    entryCount: number;
    chapterCount: number;
    attachedCount: number;
    reconstructedPanelCount: number;
    errorCount: number;
    warningCount: number;
  };
  chapters: Array<{
    chapterId: string;
    title: string;
    entryCount: number;
    attachedCount: number;
  }>;
  entries: UiAssetEntrySummary[];
  issues: UiAssetIssue[];
}

const manifestPath = path.join(repoRoot, "content", "reference", "ui", "ui-asset-manifest.json");
const reportDir = path.join(repoRoot, "reports", "ui-asset-reconstruction", "latest");

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

function expectNumber(value: unknown, filePath: string, fieldPath: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw formatError(filePath, fieldPath, "must be a finite number");
  }

  return value;
}

function expectEnum<T extends string>(value: unknown, valid: readonly T[], filePath: string, fieldPath: string): T {
  if (!valid.includes(value as T)) {
    throw formatError(filePath, fieldPath, `must be one of ${valid.join(", ")}`);
  }

  return value as T;
}

function expectOptionalString(value: unknown, filePath: string, fieldPath: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return expectString(value, filePath, fieldPath);
}

function validatePanelRules(value: unknown, filePath: string, fieldPath: string): UiPanelRules {
  const record = expectRecord(value, filePath, fieldPath);
  return {
    frameMode: expectEnum(record.frameMode, ["solid", "nine-slice-css"], filePath, `${fieldPath}.frameMode`),
    borderThickness: expectNumber(record.borderThickness, filePath, `${fieldPath}.borderThickness`),
    cornerSize: expectNumber(record.cornerSize, filePath, `${fieldPath}.cornerSize`),
    paddingX: expectNumber(record.paddingX, filePath, `${fieldPath}.paddingX`),
    paddingY: expectNumber(record.paddingY, filePath, `${fieldPath}.paddingY`),
    lineHeight: expectNumber(record.lineHeight, filePath, `${fieldPath}.lineHeight`),
    pointerAssetKey: expectOptionalString(record.pointerAssetKey, filePath, `${fieldPath}.pointerAssetKey`),
    selectedPrefix: expectOptionalString(record.selectedPrefix, filePath, `${fieldPath}.selectedPrefix`),
    selectedSuffix: expectOptionalString(record.selectedSuffix, filePath, `${fieldPath}.selectedSuffix`),
  };
}

function validateGlyphRules(value: unknown, filePath: string, fieldPath: string): UiGlyphRules {
  const record = expectRecord(value, filePath, fieldPath);
  return {
    glyph: expectString(record.glyph, filePath, `${fieldPath}.glyph`),
    color: expectString(record.color, filePath, `${fieldPath}.color`),
    selectedColor: expectOptionalString(record.selectedColor, filePath, `${fieldPath}.selectedColor`),
  };
}

function validateEntry(value: unknown, filePath: string, fieldPath: string): UiAssetManifestEntry {
  const record = expectRecord(value, filePath, fieldPath);
  const type = expectEnum(record.type, ["panel", "cursor", "icon"], filePath, `${fieldPath}.type`);
  return {
    id: expectString(record.id, filePath, `${fieldPath}.id`),
    logicalAssetKey: expectString(record.logicalAssetKey, filePath, `${fieldPath}.logicalAssetKey`),
    type,
    chapterId: expectString(record.chapterId, filePath, `${fieldPath}.chapterId`),
    mapIds: expectStringArray(record.mapIds, filePath, `${fieldPath}.mapIds`),
    state: expectEnum(record.state, ["placeholder", "imported", "locked"], filePath, `${fieldPath}.state`),
    referenceIds: expectStringArray(record.referenceIds, filePath, `${fieldPath}.referenceIds`),
    panelRules: type === "panel" ? validatePanelRules(record.panelRules, filePath, `${fieldPath}.panelRules`) : undefined,
    glyphRules: type !== "panel" ? validateGlyphRules(record.glyphRules, filePath, `${fieldPath}.glyphRules`) : undefined,
    notes: expectString(record.notes, filePath, `${fieldPath}.notes`),
  };
}

export function validateUiAssetManifest(value: unknown, filePath: string): UiAssetManifest {
  const record = expectRecord(value, filePath, "root");
  if (record.format !== "ui-asset-manifest-v1") {
    throw formatError(filePath, "format", 'must be "ui-asset-manifest-v1"');
  }

  if (!Array.isArray(record.entries)) {
    throw formatError(filePath, "entries", "must be an array");
  }

  return {
    format: "ui-asset-manifest-v1",
    entries: record.entries.map((entry, index) => validateEntry(entry, filePath, `entries[${index}]`)),
  };
}

export async function loadUiAssetManifest(): Promise<UiAssetManifest> {
  const document = await readJsonFile<unknown>(manifestPath);
  return validateUiAssetManifest(document, path.relative(repoRoot, manifestPath));
}

function buildChapterBindingLookup(
  registry: Awaited<ReturnType<typeof loadManualAssetRegistryContent>>,
): Map<string, { state: string; resource: Record<string, unknown> }> {
  const lookup = new Map<string, { state: string; resource: Record<string, unknown> }>();
  registry.assetBindings.forEach((binding) => {
    lookup.set(`base:${binding.key}`, { state: binding.state, resource: binding.resource });
  });
  registry.assetOverrides.forEach((override) => {
    override.assetBindings.forEach((binding) => {
      lookup.set(`${override.chapterId}:${binding.key}`, { state: binding.state, resource: binding.resource });
    });
  });
  return lookup;
}

export async function buildUiAssetReconstructionReport(): Promise<UiAssetReconstructionReport> {
  const [manifest, references, registry, chapters] = await Promise.all([
    loadUiAssetManifest(),
    loadReferenceManifest(),
    loadManualAssetRegistryContent(),
    loadRealChapterMetadata(),
  ]);

  const issues: UiAssetIssue[] = [];
  const chapterIndex = new Map(chapters.map((entry) => [entry.chapterId, entry]));
  const referenceIds = new Set(references.entries.map((entry) => entry.id));
  const entryIds = new Set<string>();
  const logicalKeys = new Set<string>();
  const bindingLookup = buildChapterBindingLookup(registry);

  const entries = manifest.entries.map((entry, index) => {
    if (entryIds.has(entry.id)) {
      issues.push({
        severity: "error",
        type: "duplicate-entry-id",
        path: `entries[${index}].id`,
        message: `duplicate ui asset manifest id "${entry.id}"`,
      });
    }
    entryIds.add(entry.id);

    if (logicalKeys.has(`${entry.chapterId}:${entry.logicalAssetKey}`)) {
      issues.push({
        severity: "error",
        type: "duplicate-logical-key",
        path: `entries[${index}].logicalAssetKey`,
        message: `duplicate logical asset key "${entry.logicalAssetKey}" for chapter "${entry.chapterId}"`,
      });
    }
    logicalKeys.add(`${entry.chapterId}:${entry.logicalAssetKey}`);

    entry.referenceIds.forEach((referenceId) => {
      if (!referenceIds.has(referenceId)) {
        issues.push({
          severity: "error",
          type: "missing-reference",
          path: `entries[${index}].referenceIds`,
          message: `missing reference id "${referenceId}"`,
        });
      }
    });

    if (entry.panelRules) {
      if (entry.panelRules.borderThickness <= 0 || entry.panelRules.paddingX < 0 || entry.panelRules.paddingY < 0) {
        issues.push({
          severity: "error",
          type: "invalid-rule",
          path: `entries[${index}].panelRules`,
          message: "panel rules must use positive border thickness and non-negative padding",
        });
      }
      if (entry.panelRules.pointerAssetKey && !entry.panelRules.pointerAssetKey.startsWith("icon.")) {
        issues.push({
          severity: "error",
          type: "invalid-rule",
          path: `entries[${index}].panelRules.pointerAssetKey`,
          message: "pointerAssetKey must point to an icon.* logical asset key",
        });
      }
    }

    const binding = bindingLookup.get(`${entry.chapterId}:${entry.logicalAssetKey}`) ?? bindingLookup.get(`base:${entry.logicalAssetKey}`);
    if (!binding) {
      issues.push({
        severity: "error",
        type: "missing-registry-binding",
        path: `entries[${index}].logicalAssetKey`,
        message: `missing asset registry binding for "${entry.logicalAssetKey}"`,
      });
      return {
        id: entry.id,
        logicalAssetKey: entry.logicalAssetKey,
        type: entry.type,
        chapterId: entry.chapterId,
        state: entry.state,
        runtimeAttached: false,
      };
    }

    const expectedKind = entry.type === "panel" ? "panel-style" : "icon-glyph";
    if (binding.resource.kind !== expectedKind) {
      issues.push({
        severity: "error",
        type: "resource-kind-mismatch",
        path: `entries[${index}].logicalAssetKey`,
        message: `expected resource kind "${expectedKind}" but found "${String(binding.resource.kind)}"`,
      });
    }

    const sourceManifestId = typeof binding.resource.sourceManifestId === "string" ? binding.resource.sourceManifestId : undefined;
    if (sourceManifestId !== entry.id) {
      issues.push({
        severity: "warning",
        type: "missing-source-manifest",
        path: `entries[${index}].id`,
        message: `asset registry binding for "${entry.logicalAssetKey}" should declare sourceManifestId "${entry.id}"`,
      });
    }

    if (!chapterIndex.has(entry.chapterId)) {
      issues.push({
        severity: "warning",
        type: "invalid-rule",
        path: `entries[${index}].chapterId`,
        message: `chapter "${entry.chapterId}" is not part of current real chapter metadata`,
      });
    }

    return {
      id: entry.id,
      logicalAssetKey: entry.logicalAssetKey,
      type: entry.type,
      chapterId: entry.chapterId,
      state: entry.state,
      runtimeAttached: true,
      resolvedState: binding.state,
    };
  });

  const chapterSummaries = chapters.map((chapter) => {
    const chapterEntries = entries.filter((entry) => entry.chapterId === chapter.chapterId);
    return {
      chapterId: chapter.chapterId,
      title: chapter.title,
      entryCount: chapterEntries.length,
      attachedCount: chapterEntries.filter((entry) => entry.runtimeAttached).length,
    };
  }).filter((entry) => entry.entryCount > 0);

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      entryCount: entries.length,
      chapterCount: chapterSummaries.length,
      attachedCount: entries.filter((entry) => entry.runtimeAttached).length,
      reconstructedPanelCount: entries.filter((entry) => entry.type === "panel" && entry.runtimeAttached).length,
      errorCount: issues.filter((issue) => issue.severity === "error").length,
      warningCount: issues.filter((issue) => issue.severity === "warning").length,
    },
    chapters: chapterSummaries,
    entries,
    issues,
  };
}

export async function writeUiAssetReconstructionArtifacts(): Promise<UiAssetReconstructionReport> {
  const report = await buildUiAssetReconstructionReport();
  await mkdir(reportDir, { recursive: true });
  await writeFile(path.join(reportDir, "report.json"), `${stableStringify(report)}\n`, "utf8");
  const summaryLines = [
    "# UI Asset Reconstruction",
    "# UI 资产重建",
    "",
    `- Generated At / 生成时间: ${report.generatedAt}`,
    `- Entry Count / 条目数: ${report.summary.entryCount}`,
    `- Chapter Count / 章节数: ${report.summary.chapterCount}`,
    `- Attached Count / 已接入运行时数量: ${report.summary.attachedCount}`,
    `- Reconstructed Panel Count / 已重建面板数: ${report.summary.reconstructedPanelCount}`,
    `- Error Count / 错误数: ${report.summary.errorCount}`,
    `- Warning Count / 警告数: ${report.summary.warningCount}`,
    "",
    "## Chapters",
    "## 章节摘要",
    ...report.chapters.flatMap((chapter) => [
      `- ${chapter.chapterId}: entries=${chapter.entryCount}, attached=${chapter.attachedCount}`,
    ]),
    "",
    "## Issues",
    "## 问题列表",
    ...(report.issues.length > 0
      ? report.issues.map((issue) => `- [${issue.severity}] ${issue.type}: ${issue.message}`)
      : ["- none / 无"]),
  ];
  await writeFile(path.join(reportDir, "summary.md"), `${summaryLines.join("\n")}\n`, "utf8");
  return report;
}
