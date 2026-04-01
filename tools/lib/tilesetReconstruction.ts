import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { loadManualAssetRegistryContent, loadManualWorldContent, loadRealChapterMetadata } from "./manualContent";
import { formatError, readJsonFile, repoRoot, stableStringify } from "./importerCore";
import { loadReferenceManifest } from "./referencePipeline";

export type TilesetCandidateStatus = "placeholder" | "imported" | "validated" | "parity-review" | "locked";

export interface TilesetCurationStep {
  type: "manual-crop" | "manual-normalize" | "palette-review";
  referenceId: string;
  notes: string;
}

export interface TilesetCandidateTile {
  tileId: number;
  label: string;
  role: "background" | "ground" | "structure" | "water";
  blocked: boolean;
  referenceId: string;
  sourceRect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  normalized: {
    tileWidth: number;
    tileHeight: number;
  };
  observedPalette: string[];
}

export interface TilesetCandidate {
  id: string;
  chapterId: string;
  mapIds: string[];
  logicalAssetKey: string;
  status: TilesetCandidateStatus;
  tileWidth: number;
  tileHeight: number;
  palette: string[];
  referenceIds: string[];
  curationSteps: TilesetCurationStep[];
  tiles: TilesetCandidateTile[];
  notes: string;
}

export interface TilesetCandidateManifest {
  format: "tileset-candidates-v1";
  candidates: TilesetCandidate[];
}

export interface TilesetIssue {
  severity: "error" | "warning";
  type:
    | "duplicate-candidate-id"
    | "duplicate-logical-key"
    | "missing-reference"
    | "invalid-color"
    | "tile-dimension"
    | "palette-consistency"
    | "asset-registry"
    | "collision-review";
  path: string;
  message: string;
}

export interface TilesetNormalizationTask {
  candidateId: string;
  logicalAssetKey: string;
  mapId: string;
  tileId: number;
  referenceId: string;
  sourceRect: TilesetCandidateTile["sourceRect"];
  normalized: TilesetCandidateTile["normalized"];
  status: "planned";
}

export interface CollisionOverlayReview {
  candidateId: string;
  mapId: string;
  blockedTileIds: number[];
  uncoveredBlockedTileIds: number[];
  blockedTileUsage: Array<{
    tileId: number;
    uses: number;
    coveredByCandidate: boolean;
  }>;
}

export interface TilesetCandidateSummary {
  candidateId: string;
  chapterId: string;
  mapIds: string[];
  logicalAssetKey: string;
  status: TilesetCandidateStatus;
  runtimeAttached: boolean;
  paletteSize: number;
  tileCount: number;
}

export interface TilesetReconstructionReport {
  generatedAt: string;
  summary: {
    candidateCount: number;
    attachedCount: number;
    issueCount: number;
    errorCount: number;
    warningCount: number;
  };
  candidates: TilesetCandidateSummary[];
  normalizationPlan: TilesetNormalizationTask[];
  collisionReview: CollisionOverlayReview[];
  issues: TilesetIssue[];
}

const candidatesPath = path.join(repoRoot, "content", "reference", "tiles", "tileset-candidates.json");
const reportDir = path.join(repoRoot, "reports", "tileset-reconstruction", "latest");
const normalizationPlanPath = path.join(
  repoRoot,
  "content",
  "generated",
  "import-staging",
  "tileset-crop-plan.generated.json",
);

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

function validateTile(value: unknown, filePath: string, fieldPath: string): TilesetCandidateTile {
  const record = expectRecord(value, filePath, fieldPath);
  const sourceRect = expectRecord(record.sourceRect, filePath, `${fieldPath}.sourceRect`);
  const normalized = expectRecord(record.normalized, filePath, `${fieldPath}.normalized`);
  return {
    tileId: expectNumber(record.tileId, filePath, `${fieldPath}.tileId`),
    label: expectString(record.label, filePath, `${fieldPath}.label`),
    role: expectEnum(record.role, ["background", "ground", "structure", "water"], filePath, `${fieldPath}.role`),
    blocked: Boolean(record.blocked),
    referenceId: expectString(record.referenceId, filePath, `${fieldPath}.referenceId`),
    sourceRect: {
      x: expectNumber(sourceRect.x, filePath, `${fieldPath}.sourceRect.x`),
      y: expectNumber(sourceRect.y, filePath, `${fieldPath}.sourceRect.y`),
      width: expectNumber(sourceRect.width, filePath, `${fieldPath}.sourceRect.width`),
      height: expectNumber(sourceRect.height, filePath, `${fieldPath}.sourceRect.height`),
    },
    normalized: {
      tileWidth: expectNumber(normalized.tileWidth, filePath, `${fieldPath}.normalized.tileWidth`),
      tileHeight: expectNumber(normalized.tileHeight, filePath, `${fieldPath}.normalized.tileHeight`),
    },
    observedPalette: expectStringArray(record.observedPalette, filePath, `${fieldPath}.observedPalette`),
  };
}

function validateCandidate(value: unknown, filePath: string, fieldPath: string): TilesetCandidate {
  const record = expectRecord(value, filePath, fieldPath);
  const curationSteps = Array.isArray(record.curationSteps) ? record.curationSteps : [];
  return {
    id: expectString(record.id, filePath, `${fieldPath}.id`),
    chapterId: expectString(record.chapterId, filePath, `${fieldPath}.chapterId`),
    mapIds: expectStringArray(record.mapIds, filePath, `${fieldPath}.mapIds`),
    logicalAssetKey: expectString(record.logicalAssetKey, filePath, `${fieldPath}.logicalAssetKey`),
    status: expectEnum(record.status, ["placeholder", "imported", "validated", "parity-review", "locked"], filePath, `${fieldPath}.status`),
    tileWidth: expectNumber(record.tileWidth, filePath, `${fieldPath}.tileWidth`),
    tileHeight: expectNumber(record.tileHeight, filePath, `${fieldPath}.tileHeight`),
    palette: expectStringArray(record.palette, filePath, `${fieldPath}.palette`),
    referenceIds: expectStringArray(record.referenceIds, filePath, `${fieldPath}.referenceIds`),
    curationSteps: curationSteps.map((entry, index) => {
      const stepRecord = expectRecord(entry, filePath, `${fieldPath}.curationSteps[${index}]`);
      return {
        type: expectEnum(stepRecord.type, ["manual-crop", "manual-normalize", "palette-review"], filePath, `${fieldPath}.curationSteps[${index}].type`),
        referenceId: expectString(stepRecord.referenceId, filePath, `${fieldPath}.curationSteps[${index}].referenceId`),
        notes: expectString(stepRecord.notes, filePath, `${fieldPath}.curationSteps[${index}].notes`),
      };
    }),
    tiles: (Array.isArray(record.tiles) ? record.tiles : []).map((entry, index) => validateTile(entry, filePath, `${fieldPath}.tiles[${index}]`)),
    notes: expectString(record.notes, filePath, `${fieldPath}.notes`),
  };
}

export function validateTilesetCandidateManifest(
  value: unknown,
  filePath: string,
): TilesetCandidateManifest {
  const record = expectRecord(value, filePath, "root");
  if (record.format !== "tileset-candidates-v1") {
    throw formatError(filePath, "format", 'must be "tileset-candidates-v1"');
  }

  if (!Array.isArray(record.candidates)) {
    throw formatError(filePath, "candidates", "must be an array");
  }

  return {
    format: "tileset-candidates-v1",
    candidates: record.candidates.map((entry, index) => validateCandidate(entry, filePath, `candidates[${index}]`)),
  };
}

export async function loadTilesetCandidates(): Promise<TilesetCandidateManifest> {
  const document = await readJsonFile<unknown>(candidatesPath);
  return validateTilesetCandidateManifest(document, path.relative(repoRoot, candidatesPath));
}

function isHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

function summarizeCollisionOverlay(
  map: Awaited<ReturnType<typeof loadManualWorldContent>>["maps"][number],
  candidate: TilesetCandidate,
): CollisionOverlayReview {
  const primaryLayer = map.tileLayers[0];
  const collisionLayer = map.collisionLayers[0];
  if (!primaryLayer || !collisionLayer) {
    return {
      candidateId: candidate.id,
      mapId: map.id,
      blockedTileIds: [],
      uncoveredBlockedTileIds: [],
      blockedTileUsage: [],
    };
  }

  const usage = new Map<number, number>();
  collisionLayer.blocked.forEach((entry, index) => {
    if (entry <= 0) {
      return;
    }

    const tileId = primaryLayer.tiles[index] ?? 0;
    usage.set(tileId, (usage.get(tileId) ?? 0) + 1);
  });

  const candidateTileIds = new Set(candidate.tiles.map((tile) => tile.tileId));
  const blockedTileIds = [...usage.keys()].sort((left, right) => left - right);
  return {
    candidateId: candidate.id,
    mapId: map.id,
    blockedTileIds,
    uncoveredBlockedTileIds: blockedTileIds.filter((tileId) => !candidateTileIds.has(tileId)),
    blockedTileUsage: blockedTileIds.map((tileId) => ({
      tileId,
      uses: usage.get(tileId) ?? 0,
      coveredByCandidate: candidateTileIds.has(tileId),
    })),
  };
}

function renderSummary(report: TilesetReconstructionReport): string {
  const lines: string[] = [
    "# Tileset Reconstruction Report",
    "# Tileset 重建报告",
    "",
    `- Generated At / 生成时间: ${report.generatedAt}`,
    `- Candidate Count / 候选数量: ${report.summary.candidateCount}`,
    `- Attached Count / 已接入运行时数量: ${report.summary.attachedCount}`,
    `- Errors / 错误数: ${report.summary.errorCount}`,
    `- Warnings / 警告数: ${report.summary.warningCount}`,
    "",
  ];

  report.candidates.forEach((candidate) => {
    lines.push(
      `## ${candidate.candidateId}`,
      "",
      `- Chapter / 章节: ${candidate.chapterId}`,
      `- Maps / 地图: ${candidate.mapIds.join(", ")}`,
      `- Asset Key / 资源键: ${candidate.logicalAssetKey}`,
      `- Status / 状态: ${candidate.status}`,
      `- Runtime Attached / 已接入运行时: ${candidate.runtimeAttached ? "yes / 是" : "no / 否"}`,
      `- Palette Size / 色板大小: ${candidate.paletteSize}`,
      `- Tile Count / 图块数: ${candidate.tileCount}`,
      "",
    );
  });

  lines.push("## Collision Review", "## 碰撞复核", "");
  report.collisionReview.forEach((review) => {
    lines.push(
      `### ${review.mapId}`,
      "",
      `- Blocked Tile Ids / 阻挡图块 ID: ${review.blockedTileIds.length > 0 ? review.blockedTileIds.join(", ") : "none / 无"}`,
      `- Uncovered Blocked Tile Ids / 未覆盖阻挡图块 ID: ${review.uncoveredBlockedTileIds.length > 0 ? review.uncoveredBlockedTileIds.join(", ") : "none / 无"}`,
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

export async function buildTilesetReconstructionReport(): Promise<TilesetReconstructionReport> {
  const [candidateManifest, referenceManifest, world, chapters, assetRegistry] = await Promise.all([
    loadTilesetCandidates(),
    loadReferenceManifest(),
    loadManualWorldContent(),
    loadRealChapterMetadata(),
    loadManualAssetRegistryContent(),
  ]);

  const issues: TilesetIssue[] = [];
  const referenceIds = new Set(referenceManifest.entries.map((entry) => entry.id));
  const chapterIds = new Set(chapters.map((chapter) => chapter.chapterId));
  const mapIndex = new Map(world.maps.map((map) => [map.id, map]));
  const assetKeys = new Map(
    [...assetRegistry.assetBindings, ...assetRegistry.assetOverrides.flatMap((override) => override.assetBindings)]
      .map((entry) => [entry.key, entry]),
  );

  const seenCandidateIds = new Set<string>();
  const seenLogicalKeys = new Set<string>();
  const normalizationPlan: TilesetNormalizationTask[] = [];
  const collisionReview: CollisionOverlayReview[] = [];

  const candidates = candidateManifest.candidates.map((candidate) => {
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
        message: `logical asset key "${candidate.logicalAssetKey}" is reused by multiple candidates`,
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

    candidate.palette.forEach((color, colorIndex) => {
      if (!isHexColor(color)) {
        issues.push({
          severity: "error",
          type: "invalid-color",
          path: `candidates.${candidate.id}.palette[${colorIndex}]`,
          message: `color "${color}" is not a valid #RRGGBB hex value`,
        });
      }
    });

    candidate.tiles.forEach((tile) => {
      if (tile.sourceRect.width !== candidate.tileWidth || tile.sourceRect.height !== candidate.tileHeight) {
        issues.push({
          severity: "warning",
          type: "tile-dimension",
          path: `candidates.${candidate.id}.tiles.${tile.tileId}.sourceRect`,
          message: `source rect ${tile.sourceRect.width}x${tile.sourceRect.height} does not match candidate tile size ${candidate.tileWidth}x${candidate.tileHeight}`,
        });
      }

      if (tile.normalized.tileWidth !== candidate.tileWidth || tile.normalized.tileHeight !== candidate.tileHeight) {
        issues.push({
          severity: "error",
          type: "tile-dimension",
          path: `candidates.${candidate.id}.tiles.${tile.tileId}.normalized`,
          message: `normalized size ${tile.normalized.tileWidth}x${tile.normalized.tileHeight} does not match candidate tile size ${candidate.tileWidth}x${candidate.tileHeight}`,
        });
      }

      tile.observedPalette.forEach((color) => {
        if (!candidate.palette.includes(color)) {
          issues.push({
            severity: "warning",
            type: "palette-consistency",
            path: `candidates.${candidate.id}.tiles.${tile.tileId}.observedPalette`,
            message: `tile ${tile.tileId} uses color "${color}" outside candidate palette`,
          });
        }
      });

      normalizationPlan.push({
        candidateId: candidate.id,
        logicalAssetKey: candidate.logicalAssetKey,
        mapId: candidate.mapIds[0] ?? "unknown-map",
        tileId: tile.tileId,
        referenceId: tile.referenceId,
        sourceRect: tile.sourceRect,
        normalized: tile.normalized,
        status: "planned",
      });
    });

    const assetEntry = assetKeys.get(candidate.logicalAssetKey);
    const sourceCandidateIds = assetEntry?.resource.kind === "tileset-palette" && Array.isArray(assetEntry.resource.sourceCandidateIds)
      ? assetEntry.resource.sourceCandidateIds.filter((entry): entry is string => typeof entry === "string")
      : [];
    const runtimeAttached = assetEntry?.category === "tileset"
      && assetEntry.resource.kind === "tileset-palette"
      && sourceCandidateIds.includes(candidate.id);
    if (!runtimeAttached) {
      issues.push({
        severity: "warning",
        type: "asset-registry",
        path: `candidates.${candidate.id}.logicalAssetKey`,
        message: `candidate is not attached to asset registry key "${candidate.logicalAssetKey}"`,
      });
    }

    candidate.mapIds.forEach((mapId) => {
      const map = mapIndex.get(mapId);
      if (!map) {
        issues.push({
          severity: "error",
          type: "missing-reference",
          path: `candidates.${candidate.id}.mapIds`,
          message: `map "${mapId}" does not exist in manual world content`,
        });
        return;
      }

      const review = summarizeCollisionOverlay(map, candidate);
      collisionReview.push(review);
      if (review.uncoveredBlockedTileIds.length > 0) {
        issues.push({
          severity: "warning",
          type: "collision-review",
          path: `candidates.${candidate.id}.mapIds.${mapId}`,
          message: `blocked tile ids ${review.uncoveredBlockedTileIds.join(", ")} are used on the map but not covered by the candidate tile list`,
        });
      }
    });

    return {
      candidateId: candidate.id,
      chapterId: candidate.chapterId,
      mapIds: candidate.mapIds,
      logicalAssetKey: candidate.logicalAssetKey,
      status: candidate.status,
      runtimeAttached,
      paletteSize: candidate.palette.length,
      tileCount: candidate.tiles.length,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      candidateCount: candidates.length,
      attachedCount: candidates.filter((candidate) => candidate.runtimeAttached).length,
      issueCount: issues.length,
      errorCount: issues.filter((issue) => issue.severity === "error").length,
      warningCount: issues.filter((issue) => issue.severity === "warning").length,
    },
    candidates,
    normalizationPlan,
    collisionReview,
    issues,
  };
}

export async function writeTilesetNormalizationPlan(): Promise<TilesetReconstructionReport> {
  const report = await buildTilesetReconstructionReport();
  await mkdir(path.dirname(normalizationPlanPath), { recursive: true });
  await writeFile(normalizationPlanPath, `${stableStringify({
    format: "tileset-crop-plan-v1",
    generatedAt: report.generatedAt,
    tasks: report.normalizationPlan,
  })}\n`, "utf8");
  return report;
}

export async function writeTilesetReconstructionArtifacts(): Promise<TilesetReconstructionReport> {
  const report = await writeTilesetNormalizationPlan();
  await mkdir(reportDir, { recursive: true });
  await writeFile(path.join(reportDir, "report.json"), `${stableStringify(report)}\n`, "utf8");
  await writeFile(path.join(reportDir, "summary.md"), renderSummary(report), "utf8");
  return report;
}
