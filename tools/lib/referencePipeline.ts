import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadRealChapterMetadata } from "./manualContent";
import { formatError, readJsonFile, repoRoot, stableStringify } from "./importerCore";
import {
  buildReferenceFramePackReport,
  framePackToReferenceEntries,
  loadReferenceFramePacks,
  type ReferenceSceneType,
} from "./referenceFrameExtract";

export type ReferenceSourceType = "screenshot" | "video" | "manual-crop";
export type ReferenceSubjectType =
  | "map"
  | "npc"
  | "ui"
  | "sprite"
  | "tile"
  | "enemy"
  | "shop"
  | "battle";
export type ReferenceConfidence = "low" | "medium" | "high";
export type ReferenceSeverity = "error" | "warning";
export type ReferenceIssueType =
  | "missing-subject-id"
  | "duplicate-reference-key"
  | "unparseable-metadata";

export interface ReferenceEntryMetadata {
  timestamp?: string;
  source_locator?: string;
  approximate_source?: string;
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  variant?: string;
  tags?: string[];
}

export interface ReferenceEntry {
  id: string;
  source_name: string;
  source_type: ReferenceSourceType;
  chapter: string;
  map_id?: string;
  scene_type?: ReferenceSceneType;
  subject_type: ReferenceSubjectType;
  subject_id: string;
  confidence: ReferenceConfidence;
  asset_path?: string;
  metadata?: ReferenceEntryMetadata;
  notes: string;
}

export interface ReferenceManifest {
  format: "reference-manifest-v1";
  entries: ReferenceEntry[];
}

export interface ReferenceIssue {
  severity: ReferenceSeverity;
  type: ReferenceIssueType;
  path: string;
  referenceId?: string;
  message: string;
}

export interface ReferenceChapterSummary {
  chapterId: string;
  title: string;
  referenceCount: number;
}

export interface ReferenceReport {
  generatedAt: string;
  summary: {
    entryCount: number;
    chapterCount: number;
    errorCount: number;
    warningCount: number;
  };
  chapterCoverage: ReferenceChapterSummary[];
  issues: ReferenceIssue[];
  entries: ReferenceEntry[];
}

export interface ReferenceQuery {
  chapter?: string;
  mapId?: string;
  sceneType?: ReferenceSceneType;
  subjectType?: ReferenceSubjectType;
  subjectId?: string;
}

export interface ReferenceIndex {
  manifest: ReferenceManifest;
  byChapter: Map<string, ReferenceEntry[]>;
  bySubjectKey: Map<string, ReferenceEntry[]>;
}

const validSourceTypes: readonly ReferenceSourceType[] = ["screenshot", "video", "manual-crop"];
const validSubjectTypes: readonly ReferenceSubjectType[] = [
  "map",
  "npc",
  "ui",
  "sprite",
  "tile",
  "enemy",
  "shop",
  "battle",
] as const;
const validConfidenceValues: readonly ReferenceConfidence[] = ["low", "medium", "high"];

const manifestPath = path.join(repoRoot, "content", "reference", "manifest.json");
const reportDir = path.join(repoRoot, "reports", "reference", "latest");

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

function expectOptionalString(value: unknown, filePath: string, fieldPath: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return expectString(value, filePath, fieldPath);
}

function expectNumber(value: unknown, filePath: string, fieldPath: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw formatError(filePath, fieldPath, "must be a finite number");
  }

  return value;
}

function expectEnumValue<T extends string>(
  value: unknown,
  validValues: readonly T[],
  filePath: string,
  fieldPath: string,
): T {
  if (!validValues.includes(value as T)) {
    throw formatError(filePath, fieldPath, `must be one of ${validValues.join(", ")}`);
  }

  return value as T;
}

function validateMetadata(
  value: unknown,
  filePath: string,
  fieldPath: string,
): ReferenceEntryMetadata | undefined {
  if (value === undefined) {
    return undefined;
  }

  const record = expectRecord(value, filePath, fieldPath);
  let crop: ReferenceEntryMetadata["crop"];
  if (record.crop !== undefined) {
    const cropRecord = expectRecord(record.crop, filePath, `${fieldPath}.crop`);
    crop = {
      x: expectNumber(cropRecord.x, filePath, `${fieldPath}.crop.x`),
      y: expectNumber(cropRecord.y, filePath, `${fieldPath}.crop.y`),
      width: expectNumber(cropRecord.width, filePath, `${fieldPath}.crop.width`),
      height: expectNumber(cropRecord.height, filePath, `${fieldPath}.crop.height`),
    };
  }

  let tags: string[] | undefined;
  if (record.tags !== undefined) {
    if (!Array.isArray(record.tags)) {
      throw formatError(filePath, `${fieldPath}.tags`, "must be an array of strings");
    }

    tags = record.tags.map((entry, index) => expectString(entry, filePath, `${fieldPath}.tags[${index}]`));
  }

  return {
    timestamp: expectOptionalString(record.timestamp, filePath, `${fieldPath}.timestamp`),
    source_locator: expectOptionalString(record.source_locator, filePath, `${fieldPath}.source_locator`),
    approximate_source: expectOptionalString(record.approximate_source, filePath, `${fieldPath}.approximate_source`),
    crop,
    variant: expectOptionalString(record.variant, filePath, `${fieldPath}.variant`),
    tags,
  };
}

function validateEntry(value: unknown, filePath: string, fieldPath: string): ReferenceEntry {
  const record = expectRecord(value, filePath, fieldPath);
  return {
    id: expectString(record.id, filePath, `${fieldPath}.id`),
    source_name: expectString(record.source_name, filePath, `${fieldPath}.source_name`),
    source_type: expectEnumValue(record.source_type, validSourceTypes, filePath, `${fieldPath}.source_type`),
    chapter: expectString(record.chapter, filePath, `${fieldPath}.chapter`),
    map_id: expectOptionalString(record.map_id, filePath, `${fieldPath}.map_id`),
    scene_type: record.scene_type === undefined
      ? undefined
      : expectEnumValue(record.scene_type, ["world", "dialogue", "menu", "shop", "battle", "cutscene", "other"] as const, filePath, `${fieldPath}.scene_type`),
    subject_type: expectEnumValue(record.subject_type, validSubjectTypes, filePath, `${fieldPath}.subject_type`),
    subject_id: expectString(record.subject_id, filePath, `${fieldPath}.subject_id`),
    confidence: expectEnumValue(record.confidence, validConfidenceValues, filePath, `${fieldPath}.confidence`),
    asset_path: expectOptionalString(record.asset_path, filePath, `${fieldPath}.asset_path`),
    metadata: validateMetadata(record.metadata, filePath, `${fieldPath}.metadata`),
    notes: expectString(record.notes, filePath, `${fieldPath}.notes`),
  };
}

export function validateReferenceManifest(
  value: unknown,
  filePath: string,
): ReferenceManifest {
  const record = expectRecord(value, filePath, "root");
  if (record.format !== "reference-manifest-v1") {
    throw formatError(filePath, "format", 'must be "reference-manifest-v1"');
  }

  if (!Array.isArray(record.entries)) {
    throw formatError(filePath, "entries", "must be an array");
  }

  return {
    format: "reference-manifest-v1",
    entries: record.entries.map((entry, index) => validateEntry(entry, filePath, `entries[${index}]`)),
  };
}

export async function loadReferenceManifest(): Promise<ReferenceManifest> {
  const document = await readJsonFile<unknown>(manifestPath);
  const relativePath = path.relative(repoRoot, manifestPath);
  const baseManifest = validateReferenceManifest(document, relativePath);
  const framePacks = await loadReferenceFramePacks();
  return {
    format: "reference-manifest-v1",
    entries: [
      ...baseManifest.entries,
      ...framePacks.flatMap((pack) => framePackToReferenceEntries(pack)),
    ],
  };
}

function createSubjectKey(subjectType: ReferenceSubjectType, subjectId: string): string {
  return `${subjectType}:${subjectId}`;
}

export function buildReferenceIndex(manifest: ReferenceManifest): ReferenceIndex {
  const byChapter = new Map<string, ReferenceEntry[]>();
  const bySubjectKey = new Map<string, ReferenceEntry[]>();

  manifest.entries.forEach((entry) => {
    const chapterEntries = byChapter.get(entry.chapter) ?? [];
    chapterEntries.push(entry);
    byChapter.set(entry.chapter, chapterEntries);

    const subjectKey = createSubjectKey(entry.subject_type, entry.subject_id);
    const subjectEntries = bySubjectKey.get(subjectKey) ?? [];
    subjectEntries.push(entry);
    bySubjectKey.set(subjectKey, subjectEntries);
  });

  return {
    manifest,
    byChapter,
    bySubjectKey,
  };
}

export function queryReferenceEntries(index: ReferenceIndex, query: ReferenceQuery): ReferenceEntry[] {
  return index.manifest.entries.filter((entry) => {
    if (query.chapter && entry.chapter !== query.chapter) {
      return false;
    }

    if (query.mapId && entry.map_id !== query.mapId) {
      return false;
    }

    if (query.sceneType && entry.scene_type !== query.sceneType) {
      return false;
    }

    if (query.subjectType && entry.subject_type !== query.subjectType) {
      return false;
    }

    if (query.subjectId && entry.subject_id !== query.subjectId) {
      return false;
    }

    return true;
  });
}

function createSummary(report: ReferenceReport): string {
  const lines: string[] = [
    "# Reference Pipeline Report",
    "# 参考资料管线报告",
    "",
    `- Generated At / 生成时间: ${report.generatedAt}`,
    `- Entry Count / 条目数量: ${report.summary.entryCount}`,
    `- Chapter Count / 章节数量: ${report.summary.chapterCount}`,
    `- Error Count / 错误数: ${report.summary.errorCount}`,
    `- Warning Count / 警告数: ${report.summary.warningCount}`,
    "",
    "## Chapter Coverage",
    "## 章节覆盖",
    "",
  ];

  report.chapterCoverage.forEach((chapter) => {
    lines.push(`- ${chapter.chapterId}: ${chapter.referenceCount} references / ${chapter.referenceCount} 条参考资料`);
  });

  lines.push("", "## Issues", "## 问题", "");
  if (report.issues.length === 0) {
    lines.push("- none / 无");
  } else {
    report.issues.forEach((issue) => {
      lines.push(`- [${issue.severity}] ${issue.type} ${issue.path} ${issue.message}`);
    });
  }

  return `${lines.join("\n")}\n`;
}

export async function buildReferenceReport(): Promise<ReferenceReport> {
  const rawDocument = await readJsonFile<unknown>(manifestPath);
  const framePackReport = await buildReferenceFramePackReport();
  const issues: ReferenceIssue[] = [];
  const rawRecord = expectRecord(rawDocument, "content/reference/manifest.json", "root");

  if (Array.isArray(rawRecord.entries)) {
    const seen = new Map<string, number>();
    rawRecord.entries.forEach((entry, index) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        issues.push({
          severity: "error",
          type: "unparseable-metadata",
          path: `content/reference/manifest.json:entries[${index}]`,
          message: "entry must be an object",
        });
        return;
      }

      const record = entry as Record<string, unknown>;
      if (typeof record.id === "string") {
        const previousIndex = seen.get(record.id);
        if (previousIndex !== undefined) {
          issues.push({
            severity: "error",
            type: "duplicate-reference-key",
            path: `content/reference/manifest.json:entries[${index}].id`,
            referenceId: record.id,
            message: `duplicates entries[${previousIndex}].id "${record.id}"`,
          });
        } else {
          seen.set(record.id, index);
        }
      }

      if (typeof record.subject_id !== "string" || record.subject_id.trim().length === 0) {
        issues.push({
          severity: "error",
          type: "missing-subject-id",
          path: `content/reference/manifest.json:entries[${index}].subject_id`,
          referenceId: typeof record.id === "string" ? record.id : undefined,
          message: "subject_id must be a non-empty string",
        });
      }

      try {
        validateMetadata(record.metadata, "content/reference/manifest.json", `entries[${index}].metadata`);
      } catch (error) {
        issues.push({
          severity: "error",
          type: "unparseable-metadata",
          path: `content/reference/manifest.json:entries[${index}].metadata`,
          referenceId: typeof record.id === "string" ? record.id : undefined,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    });
  }

  const manifest = await loadReferenceManifest();
  const chapters = await loadRealChapterMetadata();
  const importedChapters = chapters.filter((chapter) => chapter.maps.length > 0 || chapter.events.length > 0);

  const chapterCoverage: ReferenceChapterSummary[] = importedChapters.map((chapter) => ({
    chapterId: chapter.chapterId,
    title: chapter.title,
    referenceCount: manifest.entries.filter((entry) => entry.chapter === chapter.chapterId).length,
  }));

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      entryCount: manifest.entries.length,
      chapterCount: chapterCoverage.length,
      errorCount: issues.filter((issue) => issue.severity === "error").length,
      warningCount: issues.filter((issue) => issue.severity === "warning").length,
    },
    chapterCoverage,
    issues: [...issues, ...framePackReport.issues],
    entries: manifest.entries,
  };
}

export async function writeReferenceArtifacts(report: ReferenceReport): Promise<ReferenceReport> {
  await mkdir(reportDir, { recursive: true });
  await writeFile(path.join(reportDir, "report.json"), `${stableStringify(report)}\n`, "utf8");
  await writeFile(path.join(reportDir, "summary.md"), createSummary(report), "utf8");
  return report;
}
