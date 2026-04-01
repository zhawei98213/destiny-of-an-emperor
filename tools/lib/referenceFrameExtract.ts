import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadRealChapterMetadata } from "./manualContent";
import { formatError, readJsonFile, repoRoot, stableStringify } from "./importerCore";
import type { ReferenceConfidence, ReferenceEntry, ReferenceEntryMetadata, ReferenceIssue, ReferenceSubjectType } from "./referencePipeline";

export type ReferenceFrameSourceType = "video" | "screenshot-sequence";
export type ReferenceSceneType =
  | "world"
  | "dialogue"
  | "menu"
  | "shop"
  | "battle"
  | "cutscene"
  | "other";

export interface ReferenceFrameSource {
  source_name: string;
  source_type: ReferenceFrameSourceType;
  input_path: string;
  approximate_source: string;
}

export interface ReferenceFrameEntry {
  id: string;
  source_ref: string;
  scene_type: ReferenceSceneType;
  map_id?: string;
  subject_type: ReferenceSubjectType;
  subject_id: string;
  confidence: ReferenceConfidence;
  output_asset_path: string;
  metadata?: ReferenceEntryMetadata;
  notes: string;
}

export interface ReferenceFramePack {
  format: "reference-frame-pack-v1";
  pack_id: string;
  chapter: string;
  title: string;
  source: ReferenceFrameSource;
  notes: string;
  frames: ReferenceFrameEntry[];
}

export interface ReferenceFramePackReport {
  generatedAt: string;
  summary: {
    packCount: number;
    frameCount: number;
    generatedEntryCount: number;
    errorCount: number;
    warningCount: number;
  };
  packs: Array<{
    pack_id: string;
    chapter: string;
    frameCount: number;
  }>;
  issues: ReferenceIssue[];
  generatedEntries: ReferenceEntry[];
}

const framePackDir = path.join(repoRoot, "content", "reference", "frame-packs");
const reportDir = path.join(repoRoot, "reports", "reference-frame-extract", "latest");
const validSourceTypes: readonly ReferenceFrameSourceType[] = ["video", "screenshot-sequence"];
const validSceneTypes: readonly ReferenceSceneType[] = ["world", "dialogue", "menu", "shop", "battle", "cutscene", "other"];
const validConfidenceValues: readonly ReferenceConfidence[] = ["low", "medium", "high"];
const validSubjectTypes: readonly ReferenceSubjectType[] = ["map", "npc", "ui", "sprite", "tile", "enemy", "shop", "battle"];

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

function validateMetadata(value: unknown, filePath: string, fieldPath: string): ReferenceEntryMetadata | undefined {
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

function validateFrameEntry(value: unknown, filePath: string, fieldPath: string): ReferenceFrameEntry {
  const record = expectRecord(value, filePath, fieldPath);
  return {
    id: expectString(record.id, filePath, `${fieldPath}.id`),
    source_ref: expectString(record.source_ref, filePath, `${fieldPath}.source_ref`),
    scene_type: expectEnumValue(record.scene_type, validSceneTypes, filePath, `${fieldPath}.scene_type`),
    map_id: expectOptionalString(record.map_id, filePath, `${fieldPath}.map_id`),
    subject_type: expectEnumValue(record.subject_type, validSubjectTypes, filePath, `${fieldPath}.subject_type`),
    subject_id: expectString(record.subject_id, filePath, `${fieldPath}.subject_id`),
    confidence: expectEnumValue(record.confidence, validConfidenceValues, filePath, `${fieldPath}.confidence`),
    output_asset_path: expectString(record.output_asset_path, filePath, `${fieldPath}.output_asset_path`),
    metadata: validateMetadata(record.metadata, filePath, `${fieldPath}.metadata`),
    notes: expectString(record.notes, filePath, `${fieldPath}.notes`),
  };
}

function validatePack(value: unknown, filePath: string): ReferenceFramePack {
  const record = expectRecord(value, filePath, "root");
  if (record.format !== "reference-frame-pack-v1") {
    throw formatError(filePath, "format", 'must be "reference-frame-pack-v1"');
  }
  if (!Array.isArray(record.frames)) {
    throw formatError(filePath, "frames", "must be an array");
  }
  const source = expectRecord(record.source, filePath, "source");

  return {
    format: "reference-frame-pack-v1",
    pack_id: expectString(record.pack_id, filePath, "pack_id"),
    chapter: expectString(record.chapter, filePath, "chapter"),
    title: expectString(record.title, filePath, "title"),
    source: {
      source_name: expectString(source.source_name, filePath, "source.source_name"),
      source_type: expectEnumValue(source.source_type, validSourceTypes, filePath, "source.source_type"),
      input_path: expectString(source.input_path, filePath, "source.input_path"),
      approximate_source: expectString(source.approximate_source, filePath, "source.approximate_source"),
    },
    notes: expectString(record.notes, filePath, "notes"),
    frames: record.frames.map((entry, index) => validateFrameEntry(entry, filePath, `frames[${index}]`)),
  };
}

export async function loadReferenceFramePacks(): Promise<ReferenceFramePack[]> {
  const fileNames = (await readdir(framePackDir, { withFileTypes: true }))
    .map((entry) => entry.name)
    .filter((entry) => entry.endsWith(".json"))
    .sort((left, right) => left.localeCompare(right));

  return Promise.all(fileNames.map(async (fileName) => {
    const filePath = path.join(framePackDir, fileName);
    return validatePack(await readJsonFile<unknown>(filePath), path.relative(repoRoot, filePath));
  }));
}

export function framePackToReferenceEntries(pack: ReferenceFramePack): ReferenceEntry[] {
  return pack.frames.map((frame) => ({
    id: frame.id,
    source_name: `${pack.source.source_name}:${frame.source_ref}`,
    source_type: pack.source.source_type === "video" ? "video" : "screenshot",
    chapter: pack.chapter,
    map_id: frame.map_id,
    scene_type: frame.scene_type,
    subject_type: frame.subject_type,
    subject_id: frame.subject_id,
    confidence: frame.confidence,
    asset_path: frame.output_asset_path,
    metadata: {
      ...frame.metadata,
      timestamp: frame.metadata?.timestamp ?? frame.source_ref,
      source_locator: frame.metadata?.source_locator ?? frame.source_ref,
      approximate_source: frame.metadata?.approximate_source ?? pack.source.approximate_source,
      tags: [...(frame.metadata?.tags ?? []), "reference-frame"],
    },
    notes: `${frame.notes} Source / 来源: ${pack.source.approximate_source}`,
  }));
}

export async function buildReferenceFramePackReport(): Promise<ReferenceFramePackReport> {
  const issues: ReferenceIssue[] = [];
  const chapterIds = new Set((await loadRealChapterMetadata()).map((entry) => entry.chapterId));
  const packs: ReferenceFramePack[] = [];
  const seenFrameIds = new Map<string, string>();
  const fileNames = (await readdir(framePackDir, { withFileTypes: true }))
    .map((entry) => entry.name)
    .filter((entry) => entry.endsWith(".json"))
    .sort((left, right) => left.localeCompare(right));

  for (const fileName of fileNames) {
    const filePath = path.join(framePackDir, fileName);
    const relativePath = path.relative(repoRoot, filePath);

    try {
      const pack = validatePack(await readJsonFile<unknown>(filePath), relativePath);
      packs.push(pack);

      if (pack.chapter !== "chapter-template" && !chapterIds.has(pack.chapter)) {
        issues.push({
          severity: "error",
          type: "unparseable-metadata",
          path: `${relativePath}:chapter`,
          message: `references unknown chapter "${pack.chapter}"`,
        });
      }

      pack.frames.forEach((frame, index) => {
        const previousPath = seenFrameIds.get(frame.id);
        if (previousPath) {
          issues.push({
            severity: "error",
            type: "duplicate-reference-key",
            path: `${relativePath}:frames[${index}].id`,
            referenceId: frame.id,
            message: `duplicates frame id already declared in ${previousPath}`,
          });
        } else {
          seenFrameIds.set(frame.id, `${relativePath}:frames[${index}].id`);
        }

        if (!frame.subject_id.trim()) {
          issues.push({
            severity: "error",
            type: "missing-subject-id",
            path: `${relativePath}:frames[${index}].subject_id`,
            referenceId: frame.id,
            message: "subject_id must be a non-empty string",
          });
        }
      });
    } catch (error) {
      issues.push({
        severity: "error",
        type: "unparseable-metadata",
        path: relativePath,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const generatedEntries = packs.flatMap((pack) => framePackToReferenceEntries(pack));

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      packCount: packs.length,
      frameCount: packs.reduce((sum, pack) => sum + pack.frames.length, 0),
      generatedEntryCount: generatedEntries.length,
      errorCount: issues.filter((issue) => issue.severity === "error").length,
      warningCount: issues.filter((issue) => issue.severity === "warning").length,
    },
    packs: packs.map((pack) => ({
      pack_id: pack.pack_id,
      chapter: pack.chapter,
      frameCount: pack.frames.length,
    })),
    issues,
    generatedEntries,
  };
}

export async function writeReferenceFramePackArtifacts(report: ReferenceFramePackReport): Promise<ReferenceFramePackReport> {
  await mkdir(reportDir, { recursive: true });
  await writeFile(path.join(reportDir, "report.json"), `${stableStringify(report)}\n`, "utf8");
  const summaryLines = [
    "# Reference Frame Extraction Report",
    "# 参考关键帧提取报告",
    "",
    `- Generated At / 生成时间: ${report.generatedAt}`,
    `- Pack Count / 包数量: ${report.summary.packCount}`,
    `- Frame Count / 帧数量: ${report.summary.frameCount}`,
    `- Generated Entry Count / 生成条目数量: ${report.summary.generatedEntryCount}`,
    `- Error Count / 错误数: ${report.summary.errorCount}`,
    `- Warning Count / 警告数: ${report.summary.warningCount}`,
    "",
    "## Packs",
    "## 资源包",
    "",
    ...report.packs.map((pack) => `- ${pack.pack_id}: ${pack.chapter} (${pack.frameCount} frames / ${pack.frameCount} 帧)`),
    "",
    "## Issues",
    "## 问题",
    "",
    ...(report.issues.length === 0 ? ["- none / 无"] : report.issues.map((issue) => `- [${issue.severity}] ${issue.type} ${issue.path} ${issue.message}`)),
    "",
  ];
  await writeFile(path.join(reportDir, "summary.md"), `${summaryLines.join("\n")}\n`, "utf8");
  return report;
}
