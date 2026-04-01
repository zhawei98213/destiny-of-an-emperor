import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { loadRealChapterMetadata } from "./manualContent";
import { formatError, readJsonFile, repoRoot, stableStringify } from "./importerCore";
import { loadReferenceManifest } from "./referencePipeline";

export type CharacterSpriteStatus = "placeholder" | "imported" | "validated" | "parity-review" | "locked";
export type CharacterFacing = "up" | "down" | "left" | "right";
export type CharacterFrameSlot = "stand" | "walkA" | "walkB";

export interface CharacterSpriteAnchor {
  x: number;
  y: number;
}

export interface CharacterSpriteBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CharacterFrameDefinition {
  frameId: string;
  referenceId?: string;
  status: CharacterSpriteStatus;
}

export interface CharacterFacingDefinition {
  stand: CharacterFrameDefinition;
  walkA: CharacterFrameDefinition;
  walkB: CharacterFrameDefinition;
}

export interface CharacterSpriteCandidate {
  id: string;
  chapterId: string;
  mapIds: string[];
  logicalAssetKey: string;
  familyId: string;
  status: CharacterSpriteStatus;
  frameWidth: number;
  frameHeight: number;
  anchor: CharacterSpriteAnchor;
  pivot: CharacterSpriteAnchor;
  boundingBox: CharacterSpriteBoundingBox;
  referenceIds: string[];
  directions: Record<CharacterFacing, CharacterFacingDefinition>;
  notes: string;
}

export interface CharacterSpriteCandidateManifest {
  format: "character-sprite-candidates-v1";
  candidates: CharacterSpriteCandidate[];
}

export interface CharacterSpriteMetadataEntry {
  frameId: string;
  logicalAssetKey: string;
  familyId: string;
  chapterId: string;
  mapIds: string[];
  facing: CharacterFacing;
  slot: CharacterFrameSlot;
  referenceId?: string;
  status: CharacterSpriteStatus;
  frameWidth: number;
  frameHeight: number;
  anchor: CharacterSpriteAnchor;
  pivot: CharacterSpriteAnchor;
  boundingBox: CharacterSpriteBoundingBox;
}

export interface CharacterSpriteMetadataDocument {
  format: "character-sprite-metadata-v1";
  generatedAt: string;
  entries: CharacterSpriteMetadataEntry[];
}

export interface CharacterSpriteIssue {
  severity: "error" | "warning";
  type:
    | "duplicate-candidate-id"
    | "duplicate-logical-key"
    | "missing-reference"
    | "invalid-dimensions"
    | "invalid-anchor"
    | "invalid-pivot"
    | "invalid-bounding-box"
    | "missing-stand-frame";
  path: string;
  message: string;
}

export interface CharacterSpriteReport {
  generatedAt: string;
  summary: {
    candidateCount: number;
    importedCandidateCount: number;
    importedFrameCount: number;
    issueCount: number;
    errorCount: number;
    warningCount: number;
  };
  candidates: Array<{
    candidateId: string;
    logicalAssetKey: string;
    chapterId: string;
    mapIds: string[];
    status: CharacterSpriteStatus;
    importedFacingSlots: string[];
  }>;
  metadata: CharacterSpriteMetadataEntry[];
  issues: CharacterSpriteIssue[];
}

const candidatePath = path.join(repoRoot, "content", "reference", "sprites", "character-sprite-candidates.json");
const metadataPath = path.join(repoRoot, "content", "generated", "character-sprite-metadata.generated.json");
const reportDir = path.join(repoRoot, "reports", "character-sprite-reconstruction", "latest");

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

function expectNumber(value: unknown, filePath: string, fieldPath: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw formatError(filePath, fieldPath, "must be a finite number");
  }

  return value;
}

function expectOptionalString(value: unknown, filePath: string, fieldPath: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return expectString(value, filePath, fieldPath);
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

function validateAnchor(value: unknown, filePath: string, fieldPath: string): CharacterSpriteAnchor {
  const record = expectRecord(value, filePath, fieldPath);
  return {
    x: expectNumber(record.x, filePath, `${fieldPath}.x`),
    y: expectNumber(record.y, filePath, `${fieldPath}.y`),
  };
}

function validateBoundingBox(value: unknown, filePath: string, fieldPath: string): CharacterSpriteBoundingBox {
  const record = expectRecord(value, filePath, fieldPath);
  return {
    x: expectNumber(record.x, filePath, `${fieldPath}.x`),
    y: expectNumber(record.y, filePath, `${fieldPath}.y`),
    width: expectNumber(record.width, filePath, `${fieldPath}.width`),
    height: expectNumber(record.height, filePath, `${fieldPath}.height`),
  };
}

function validateFrameDefinition(value: unknown, filePath: string, fieldPath: string): CharacterFrameDefinition {
  const record = expectRecord(value, filePath, fieldPath);
  return {
    frameId: expectString(record.frameId, filePath, `${fieldPath}.frameId`),
    referenceId: expectOptionalString(record.referenceId, filePath, `${fieldPath}.referenceId`),
    status: expectEnum(record.status, ["placeholder", "imported", "validated", "parity-review", "locked"], filePath, `${fieldPath}.status`),
  };
}

function validateFacingDefinition(value: unknown, filePath: string, fieldPath: string): CharacterFacingDefinition {
  const record = expectRecord(value, filePath, fieldPath);
  return {
    stand: validateFrameDefinition(record.stand, filePath, `${fieldPath}.stand`),
    walkA: validateFrameDefinition(record.walkA, filePath, `${fieldPath}.walkA`),
    walkB: validateFrameDefinition(record.walkB, filePath, `${fieldPath}.walkB`),
  };
}

function validateCandidate(value: unknown, filePath: string, fieldPath: string): CharacterSpriteCandidate {
  const record = expectRecord(value, filePath, fieldPath);
  const directionsRecord = expectRecord(record.directions, filePath, `${fieldPath}.directions`);
  return {
    id: expectString(record.id, filePath, `${fieldPath}.id`),
    chapterId: expectString(record.chapterId, filePath, `${fieldPath}.chapterId`),
    mapIds: expectStringArray(record.mapIds, filePath, `${fieldPath}.mapIds`),
    logicalAssetKey: expectString(record.logicalAssetKey, filePath, `${fieldPath}.logicalAssetKey`),
    familyId: expectString(record.familyId, filePath, `${fieldPath}.familyId`),
    status: expectEnum(record.status, ["placeholder", "imported", "validated", "parity-review", "locked"], filePath, `${fieldPath}.status`),
    frameWidth: expectNumber(record.frameWidth, filePath, `${fieldPath}.frameWidth`),
    frameHeight: expectNumber(record.frameHeight, filePath, `${fieldPath}.frameHeight`),
    anchor: validateAnchor(record.anchor, filePath, `${fieldPath}.anchor`),
    pivot: validateAnchor(record.pivot, filePath, `${fieldPath}.pivot`),
    boundingBox: validateBoundingBox(record.boundingBox, filePath, `${fieldPath}.boundingBox`),
    referenceIds: expectStringArray(record.referenceIds, filePath, `${fieldPath}.referenceIds`),
    directions: {
      up: validateFacingDefinition(directionsRecord.up, filePath, `${fieldPath}.directions.up`),
      down: validateFacingDefinition(directionsRecord.down, filePath, `${fieldPath}.directions.down`),
      left: validateFacingDefinition(directionsRecord.left, filePath, `${fieldPath}.directions.left`),
      right: validateFacingDefinition(directionsRecord.right, filePath, `${fieldPath}.directions.right`),
    },
    notes: expectString(record.notes, filePath, `${fieldPath}.notes`),
  };
}

export function validateCharacterSpriteCandidateManifest(
  value: unknown,
  filePath: string,
): CharacterSpriteCandidateManifest {
  const record = expectRecord(value, filePath, "root");
  if (record.format !== "character-sprite-candidates-v1") {
    throw formatError(filePath, "format", 'must be "character-sprite-candidates-v1"');
  }

  if (!Array.isArray(record.candidates)) {
    throw formatError(filePath, "candidates", "must be an array");
  }

  return {
    format: "character-sprite-candidates-v1",
    candidates: record.candidates.map((entry, index) => validateCandidate(entry, filePath, `candidates[${index}]`)),
  };
}

export async function loadCharacterSpriteCandidates(): Promise<CharacterSpriteCandidateManifest> {
  const document = await readJsonFile<unknown>(candidatePath);
  return validateCharacterSpriteCandidateManifest(document, path.relative(repoRoot, candidatePath));
}

function flattenMetadata(candidate: CharacterSpriteCandidate): CharacterSpriteMetadataEntry[] {
  const entries: CharacterSpriteMetadataEntry[] = [];
  const directions: CharacterFacing[] = ["up", "down", "left", "right"];
  const slots: CharacterFrameSlot[] = ["stand", "walkA", "walkB"];

  directions.forEach((facing) => {
    slots.forEach((slot) => {
      const frame = candidate.directions[facing][slot];
      entries.push({
        frameId: frame.frameId,
        logicalAssetKey: candidate.logicalAssetKey,
        familyId: candidate.familyId,
        chapterId: candidate.chapterId,
        mapIds: candidate.mapIds,
        facing,
        slot,
        referenceId: frame.referenceId,
        status: frame.status,
        frameWidth: candidate.frameWidth,
        frameHeight: candidate.frameHeight,
        anchor: candidate.anchor,
        pivot: candidate.pivot,
        boundingBox: candidate.boundingBox,
      });
    });
  });

  return entries;
}

function renderSummary(report: CharacterSpriteReport): string {
  const lines: string[] = [
    "# Character Sprite Reconstruction Report",
    "# 角色精灵重建报告",
    "",
    `- Generated At / 生成时间: ${report.generatedAt}`,
    `- Candidate Count / 候选数量: ${report.summary.candidateCount}`,
    `- Imported Candidates / 已导入候选数: ${report.summary.importedCandidateCount}`,
    `- Imported Frames / 已导入帧数: ${report.summary.importedFrameCount}`,
    `- Errors / 错误数: ${report.summary.errorCount}`,
    `- Warnings / 警告数: ${report.summary.warningCount}`,
    "",
  ];

  report.candidates.forEach((candidate) => {
    lines.push(
      `## ${candidate.candidateId}`,
      "",
      `- Asset Key / 资源键: ${candidate.logicalAssetKey}`,
      `- Chapter / 章节: ${candidate.chapterId}`,
      `- Maps / 地图: ${candidate.mapIds.join(", ")}`,
      `- Status / 状态: ${candidate.status}`,
      `- Imported Facing Slots / 已导入朝向槽位: ${candidate.importedFacingSlots.length > 0 ? candidate.importedFacingSlots.join(", ") : "none / 无"}`,
      "",
    );
  });

  if (report.issues.length > 0) {
    lines.push("## Issues", "## 问题", "");
    report.issues.forEach((issue) => {
      lines.push(`- [${issue.severity}] ${issue.path} ${issue.message}`);
    });
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

export async function buildCharacterSpriteReport(): Promise<CharacterSpriteReport> {
  const [manifest, referenceManifest, chapters] = await Promise.all([
    loadCharacterSpriteCandidates(),
    loadReferenceManifest(),
    loadRealChapterMetadata(),
  ]);

  const issues: CharacterSpriteIssue[] = [];
  const referenceIds = new Set(referenceManifest.entries.map((entry) => entry.id));
  const chapterIds = new Set(chapters.map((chapter) => chapter.chapterId));
  const seenCandidateIds = new Set<string>();
  const seenLogicalKeys = new Set<string>();
  const metadata: CharacterSpriteMetadataEntry[] = [];

  const candidates = manifest.candidates.map((candidate) => {
    if (seenCandidateIds.has(candidate.id)) {
      issues.push({
        severity: "error",
        type: "duplicate-candidate-id",
        path: `candidates.${candidate.id}`,
        message: `duplicate candidate id "${candidate.id}"`,
      });
    }
    seenCandidateIds.add(candidate.id);

    if (seenLogicalKeys.has(candidate.logicalAssetKey)) {
      issues.push({
        severity: "warning",
        type: "duplicate-logical-key",
        path: `candidates.${candidate.id}.logicalAssetKey`,
        message: `logical key "${candidate.logicalAssetKey}" is reused by another candidate`,
      });
    }
    seenLogicalKeys.add(candidate.logicalAssetKey);

    if (!chapterIds.has(candidate.chapterId)) {
      issues.push({
        severity: "warning",
        type: "missing-reference",
        path: `candidates.${candidate.id}.chapterId`,
        message: `chapter "${candidate.chapterId}" is not present in chapter metadata`,
      });
    }

    if (candidate.frameWidth !== 16 || candidate.frameHeight !== 16) {
      issues.push({
        severity: "warning",
        type: "invalid-dimensions",
        path: `candidates.${candidate.id}.frameSize`,
        message: `current visual spec expects 16x16 world character frames, received ${candidate.frameWidth}x${candidate.frameHeight}`,
      });
    }

    if (candidate.anchor.x < 0 || candidate.anchor.x > candidate.frameWidth || candidate.anchor.y < 0 || candidate.anchor.y > candidate.frameHeight) {
      issues.push({
        severity: "error",
        type: "invalid-anchor",
        path: `candidates.${candidate.id}.anchor`,
        message: "anchor must remain inside the declared frame bounds",
      });
    }

    if (candidate.pivot.x < 0 || candidate.pivot.x > candidate.frameWidth || candidate.pivot.y < 0 || candidate.pivot.y > candidate.frameHeight) {
      issues.push({
        severity: "error",
        type: "invalid-pivot",
        path: `candidates.${candidate.id}.pivot`,
        message: "pivot must remain inside the declared frame bounds",
      });
    }

    if (
      candidate.boundingBox.x < 0
      || candidate.boundingBox.y < 0
      || candidate.boundingBox.width <= 0
      || candidate.boundingBox.height <= 0
      || candidate.boundingBox.x + candidate.boundingBox.width > candidate.frameWidth
      || candidate.boundingBox.y + candidate.boundingBox.height > candidate.frameHeight
    ) {
      issues.push({
        severity: "error",
        type: "invalid-bounding-box",
        path: `candidates.${candidate.id}.boundingBox`,
        message: "bounding box must remain inside the declared frame bounds",
      });
    }

    candidate.referenceIds.forEach((referenceId) => {
      if (!referenceIds.has(referenceId)) {
        issues.push({
          severity: "error",
          type: "missing-reference",
          path: `candidates.${candidate.id}.referenceIds`,
          message: `reference "${referenceId}" does not exist in content/reference/manifest.json`,
        });
      }
    });

    const importedFacingSlots: string[] = [];
    (["up", "down", "left", "right"] as CharacterFacing[]).forEach((facing) => {
      const facingFrames = candidate.directions[facing];
      if (facingFrames.stand.status === "placeholder" && candidate.status !== "placeholder") {
        issues.push({
          severity: "warning",
          type: "missing-stand-frame",
          path: `candidates.${candidate.id}.directions.${facing}.stand`,
          message: `standing frame for facing "${facing}" is still placeholder`,
        });
      }

      (["stand", "walkA", "walkB"] as CharacterFrameSlot[]).forEach((slot) => {
        const frame = facingFrames[slot];
        if (frame.referenceId && !referenceIds.has(frame.referenceId)) {
          issues.push({
            severity: "error",
            type: "missing-reference",
            path: `candidates.${candidate.id}.directions.${facing}.${slot}`,
            message: `reference "${frame.referenceId}" does not exist in content/reference/manifest.json`,
          });
        }
        if (frame.status !== "placeholder") {
          importedFacingSlots.push(`${facing}:${slot}`);
        }
      });
    });

    metadata.push(...flattenMetadata(candidate));

    return {
      candidateId: candidate.id,
      logicalAssetKey: candidate.logicalAssetKey,
      chapterId: candidate.chapterId,
      mapIds: candidate.mapIds,
      status: candidate.status,
      importedFacingSlots,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      candidateCount: candidates.length,
      importedCandidateCount: candidates.filter((candidate) => candidate.status !== "placeholder").length,
      importedFrameCount: metadata.filter((entry) => entry.status !== "placeholder").length,
      issueCount: issues.length,
      errorCount: issues.filter((issue) => issue.severity === "error").length,
      warningCount: issues.filter((issue) => issue.severity === "warning").length,
    },
    candidates,
    metadata,
    issues,
  };
}

export async function writeCharacterSpriteArtifacts(): Promise<CharacterSpriteReport> {
  const report = await buildCharacterSpriteReport();
  await mkdir(path.dirname(metadataPath), { recursive: true });
  const metadataDocument: CharacterSpriteMetadataDocument = {
    format: "character-sprite-metadata-v1",
    generatedAt: report.generatedAt,
    entries: report.metadata,
  };
  await writeFile(metadataPath, `${stableStringify(metadataDocument)}\n`, "utf8");
  await mkdir(reportDir, { recursive: true });
  await writeFile(path.join(reportDir, "report.json"), `${stableStringify(report)}\n`, "utf8");
  await writeFile(path.join(reportDir, "summary.md"), renderSummary(report), "utf8");
  return report;
}
