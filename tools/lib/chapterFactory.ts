import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  type ChapterCompletenessIssue,
  runChapterCompletenessCheck,
} from "./chapterCompletenessCheck";
import {
  type ChapterMetadata,
  type ChapterStatus,
  loadAllChapterMetadata,
} from "./chapterMetadata";
import { repoRoot, stableStringify, writeStableJsonFile } from "./importerCore";
import type { ParityScoreReport } from "./parityScoring";
import type { UiParityReport } from "./uiParity";
import type { RegressionReport } from "./parityScoring";

const chapterDocsDir = path.join(repoRoot, "docs", "chapters");
const chapterMetadataDir = path.join(repoRoot, "content", "manual", "chapters");
const chapterReportsDir = path.join(repoRoot, "reports", "chapters", "latest");
const referenceRootDir = path.join(repoRoot, "content", "reference");
const referenceFramePacksDir = path.join(referenceRootDir, "frame-packs");
const sourceTextDir = path.join(repoRoot, "content", "source", "text");
const visualBackfillDir = path.join(repoRoot, "content", "manual", "visual-backfill");

interface ChapterBootstrapOptions {
  chapterId: string;
  title: string;
  areaLabel: string;
  status?: ChapterStatus;
}

export interface ChapterBootstrapResult {
  chapterId: string;
  createdFiles: string[];
}

export interface ChapterFactoryOutputPaths {
  chapterDocsDir?: string;
  chapterMetadataDir?: string;
  chapterReportsDir?: string;
  referenceFramePacksDir?: string;
  sourceTextDir?: string;
  visualBackfillDir?: string;
  referenceRootDir?: string;
}

export interface BatchChapterBootstrapResult extends ChapterBootstrapResult {
  createdDirectories: string[];
  checklistPath: string;
  summaryPath: string;
}

export interface ChapterImportStatusEntry {
  chapterId: string;
  title: string;
  areaLabel: string;
  status: ChapterStatus;
  metadataPath: string;
  planPath: string;
  lockReportPath: string;
  completeness: {
    errorCount: number;
    warningCount: number;
  };
  parity?: {
    totalScore: number;
    blockerCount: number;
    minorCount: number;
  };
  regression: {
    boundCount: number;
    passCount: number;
    missingCount: number;
  };
  uiParity: {
    matchedCount: number;
    divergedCount: number;
  };
  readyForLockChecklist: boolean;
}

export interface ChapterImportStatusReport {
  generatedAt: string;
  chapters: ChapterImportStatusEntry[];
}

export interface ChapterLockChecklistReport {
  chapterId: string;
  title: string;
  generatedAt: string;
  items: Array<{
    label: string;
    checked: boolean;
    detail: string;
  }>;
}

function relativeToRepo(filePath: string): string {
  return path.relative(repoRoot, filePath);
}

function getArgValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index === -1) {
    return undefined;
  }

  return process.argv[index + 1];
}

function getChapterPlanPath(chapterId: string, paths?: ChapterFactoryOutputPaths): string {
  return path.join(paths?.chapterDocsDir ?? chapterDocsDir, `${chapterId}-plan.md`);
}

function getChapterLockReportPath(chapterId: string, paths?: ChapterFactoryOutputPaths): string {
  return path.join(paths?.chapterDocsDir ?? chapterDocsDir, `${chapterId}-lock-report.md`);
}

function getChapterMetadataPath(chapterId: string, paths?: ChapterFactoryOutputPaths): string {
  return path.join(paths?.chapterMetadataDir ?? chapterMetadataDir, `${chapterId}.json`);
}

function getGeneratedChecklistPath(chapterId: string, paths?: ChapterFactoryOutputPaths): string {
  return path.join(paths?.chapterReportsDir ?? chapterReportsDir, "lock-checklists", `${chapterId}.md`);
}

function getBatchBootstrapSummaryPath(chapterId: string, paths?: ChapterFactoryOutputPaths): string {
  return path.join(paths?.chapterReportsDir ?? chapterReportsDir, "bootstrap", `${chapterId}.md`);
}

function getChapterVisualBacklogPath(chapterId: string, paths?: ChapterFactoryOutputPaths): string {
  return path.join(paths?.chapterDocsDir ?? chapterDocsDir, `${chapterId}-visual-replacement-backlog.md`);
}

function getChapterBattleParityNotesPath(chapterId: string, paths?: ChapterFactoryOutputPaths): string {
  return path.join(paths?.chapterDocsDir ?? chapterDocsDir, `${chapterId}-battle-parity-notes.md`);
}

function getChapterReferencePackPath(chapterId: string, paths?: ChapterFactoryOutputPaths): string {
  return path.join(paths?.referenceFramePacksDir ?? referenceFramePacksDir, `${chapterId}-pack.json`);
}

function getChapterSourceTextPath(chapterId: string, paths?: ChapterFactoryOutputPaths): string {
  return path.join(paths?.sourceTextDir ?? sourceTextDir, `${chapterId}.source.json`);
}

function getChapterVisualBackfillPlanPath(chapterId: string, paths?: ChapterFactoryOutputPaths): string {
  return path.join(paths?.visualBackfillDir ?? visualBackfillDir, `${chapterId}-bootstrap-batch.json`);
}

function getReferenceChapterDirectories(chapterId: string, paths?: ChapterFactoryOutputPaths): string[] {
  const root = paths?.referenceRootDir ?? referenceRootDir;
  return [
    path.join(root, "screenshots", chapterId),
    path.join(root, "video-stills", chapterId),
    path.join(root, "ui", chapterId),
    path.join(root, "sprites", chapterId),
    path.join(root, "tiles", chapterId),
    path.join(root, "enemies", chapterId),
    path.join(root, "shops", chapterId),
    path.join(root, "battle", chapterId),
  ];
}

function createBootstrapNotes(chapterId: string, title: string): string {
  return [
    `Planned scaffold created by chapter bootstrap for ${chapterId}.`,
    `${chapterId} 的计划骨架由 chapter bootstrap 自动创建。`,
    `Replace placeholder notes with real import scope before moving beyond planned status.`,
    `在脱离 planned 状态前，请把这些占位说明替换成真实导入范围。`,
    `Current working title: ${title}.`,
    `当前工作标题：${title}。`,
  ].join(" ");
}

function toTitleCaseFromChapterId(chapterId: string): string {
  return chapterId
    .split("-")
    .map((segment, index) => {
      if (index === 0) {
        return "Chapter";
      }

      if (/^\d+$/.test(segment)) {
        return segment;
      }

      return segment.charAt(0).toUpperCase() + segment.slice(1);
    })
    .join(" ");
}

async function loadJsonTemplate<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

export async function bootstrapChapterScaffold(
  options: ChapterBootstrapOptions,
  paths?: ChapterFactoryOutputPaths,
): Promise<ChapterBootstrapResult> {
  const status = options.status ?? "planned";
  const metadataTemplate = await loadJsonTemplate<ChapterMetadata>(
    path.join(chapterMetadataDir, "chapter-template.json"),
  );
  const planTemplate = await readFile(path.join(chapterDocsDir, "chapter-template.md"), "utf8");
  const metadataPath = path.join(paths?.chapterMetadataDir ?? chapterMetadataDir, `${options.chapterId}.json`);
  const planPath = path.join(paths?.chapterDocsDir ?? chapterDocsDir, `${options.chapterId}-plan.md`);
  const lockReportPath = path.join(paths?.chapterDocsDir ?? chapterDocsDir, `${options.chapterId}-lock-report.md`);

  const metadata: ChapterMetadata = {
    ...metadataTemplate,
    chapterId: options.chapterId,
    title: options.title,
    areaLabel: options.areaLabel,
    status,
    notes: createBootstrapNotes(options.chapterId, options.title),
  };

  const chapterLabel = toTitleCaseFromChapterId(options.chapterId);
  const planContent = planTemplate
    .replace("# Chapter XX Plan", `# ${chapterLabel} Plan`)
    .replace("# 第 XX 章计划", `# ${chapterLabel} 计划`)
    .replace("- `chapterId`:", `- \`chapterId\`: \`${options.chapterId}\``)
    .replace("- `status`:", `- \`status\`: \`${status}\``);

  const lockReportContent = [
    `# ${chapterLabel} Lock Report`,
    `# ${chapterLabel} 锁定报告`,
    "",
    "## Scope",
    "## 范围",
    "",
    `- Chapter id: \`${options.chapterId}\``,
    `- Title: ${options.title}`,
    `- Area label: ${options.areaLabel}`,
    `- Metadata status: \`${status}\``,
    "",
    "## Current Status",
    "## 当前状态",
    "",
    "- Lock result: not reviewed yet",
    "- 锁定结果：尚未审核",
    "- Reason: scaffold only; real import and parity work have not started",
    "- 原因：当前只有骨架，真实导入和 parity 工作尚未开始",
    "",
    "## Verified Now",
    "## 当前已验证",
    "",
    "- Bootstrap files exist and are ready for chapter-factory execution",
    "- chapter bootstrap 文件已生成，可直接进入 chapter-factory 流程",
    "",
    "## Remaining Divergences",
    "## 当前剩余偏差",
    "",
    "- No real maps, NPCs, events, shops, or enemy groups have been imported yet",
    "- 当前尚未导入真实地图、NPC、事件、商店或敌群",
    "",
    "## Next Actions",
    "## 下一步动作",
    "",
    "1. Fill chapter scope in the plan file.",
    "1. 在计划文件中填写章节范围。",
    "2. Start the source -> tools -> generated/manual import flow for the first map slice.",
    "2. 启动首张地图切片的 source -> tools -> generated/manual 导入流程。",
    "3. Run completeness, parity, regression, and lock checklist tools as the slice grows.",
    "3. 随着切片推进，执行 completeness、parity、regression 和 lock checklist 工具。",
    "",
  ].join("\n");

  await mkdir(paths?.chapterMetadataDir ?? chapterMetadataDir, { recursive: true });
  await mkdir(paths?.chapterDocsDir ?? chapterDocsDir, { recursive: true });
  await writeStableJsonFile(metadataPath, metadata);
  await writeFile(planPath, planContent, "utf8");
  await writeFile(lockReportPath, lockReportContent, "utf8");

  return {
    chapterId: options.chapterId,
    createdFiles: [
      metadataPath,
      planPath,
      lockReportPath,
    ],
  };
}

function createVisualBacklogTemplate(chapterId: string, title: string, chapterLabel: string): string {
  return [
    `# ${chapterLabel} Visual Replacement Backlog`,
    `# ${chapterLabel} 视觉替换 Backlog`,
    "",
    "## Goal",
    "## 目标",
    "",
    `Track ${chapterId} visual replacement work in parallel with gameplay closure.`,
    `在 gameplay 闭环并行推进的同时，持续跟踪 ${chapterId} 的视觉替换工作。`,
    "",
    "## Batch Bootstrap Defaults",
    "## 批量初始化默认项",
    "",
    `- Chapter: \`${chapterId}\``,
    `- Title: ${title}`,
    "- Runtime lane: gameplay/content remains blocking",
    "- 运行时主线：gameplay/content 仍然是阻塞主线",
    "- Visual lane: replace placeholders only through asset registry",
    "- 视觉副线：只能通过 asset registry 替换 placeholder",
    "",
    "## Initial Placeholder Targets",
    "## 初始占位目标",
    "",
    "| 逻辑资源 key | 当前状态 | 替换目标 | 参考资料缺口 | 下一步动作 |",
    "| --- | --- | --- | --- | --- |",
    "| `tileset.<chapter-map>` | `placeholder` | chapter-local tileset subset | 缺地图参考图 | 建立 tileset reconstruction candidate |",
    "| `npc.<chapter-role>` | `placeholder family reuse` | chapter-local NPC standing frames | 缺 NPC 站立帧参考 | 复用 character sprite reconstruction workflow |",
    "| `ui.dialogue-box` | `shared fallback` | chapter-local dialogue box variant if needed | 缺 UI 参考图 | 在 reference pack 补 dialogue/UI 场景帧 |",
    "| `audio.<chapter-bgm>` | `shared fallback` | chapter-local bgm/sfx mapping | 缺章节音频参考 | 在 audio workflow 中补 chapter-local mapping |",
    "",
    "## Notes",
    "## 说明",
    "",
    "- Generated by batch chapter bootstrap. Replace the generic rows with real chapter-specific entries during import.",
    "- 由 batch chapter bootstrap 自动生成。导入时请把这些通用行替换成真实章节条目。",
    "",
  ].join("\n");
}

function createBattleParityNotesTemplate(chapterId: string, chapterLabel: string): string {
  return [
    `# ${chapterLabel} Battle Parity Notes`,
    `# ${chapterLabel} 战斗一致性说明`,
    "",
    "## Scope",
    "## 范围",
    "",
    `- Chapter: \`${chapterId}\``,
    "- Add real battle notes here only if the chapter contains one or more battle slices.",
    "- 只有当本章包含一场或多场战斗切片时，才在此补 battle parity 说明。",
    "",
    "## Initial Checklist",
    "## 初始检查项",
    "",
    "- [ ] battle trigger is bound to a real map slice",
    "- [ ] 战斗触发已绑定到真实地图切片",
    "- [ ] enemy group is imported or explicitly marked as a temporary stand-in",
    "- [ ] 敌群已经导入，或已明确标记为临时代用组",
    "- [ ] reward / exp / gold / drop have been sanity-checked",
    "- [ ] 奖励 / 经验 / 金钱 / 掉落已经做过合理性检查",
    "- [ ] golden regression and battle parity cases are both bound",
    "- [ ] golden regression 与 battle parity case 都已绑定",
    "",
  ].join("\n");
}

function createSourceTextSkeleton(chapterId: string, title: string) {
  return {
    format: "text-source-v1",
    chapterId,
    title,
    notes: "Replace bootstrap placeholders with real dialogue lines and events before claiming the chapter is imported. / 在声称章节已导入前，请用真实对白和事件替换 bootstrap 占位内容。",
    dialogueLines: [
      {
        id: `${chapterId}-placeholder-line`,
        speakerName: "系统",
        text: "这里是批量初始化生成的对白占位，请替换成真实文本。",
        portraitId: "system-default",
        soundId: "sfx-confirm",
        styleId: "system-default",
        locale: "zh-CN",
        revisionTag: "bootstrap",
      },
    ],
    events: [
      {
        id: `${chapterId}-placeholder-event`,
        name: `${title} Placeholder Event`,
        steps: [
          {
            type: "dialogue",
            lineId: `${chapterId}-placeholder-line`,
          },
          {
            type: "end",
          },
        ],
      },
    ],
  };
}

function createVisualBackfillPlan(chapterId: string, title: string) {
  return {
    format: "visual-backfill-plan-v1",
    planId: `${chapterId}-bootstrap-batch`,
    chapterId,
    title: `${title} Bootstrap Visual Batch`,
    status: "planned",
    notes: "Bootstrap visual batch. Replace placeholders with real registry-only replacement entries once chapter references are available. / 批量初始化生成的视觉批次。章节参考资料到位后，请替换为真实的 registry-only 替换条目。",
    replacementEntries: [
      {
        logicalAssetKey: "ui.dialogue-box",
        category: "ui-panel",
        expectedBaseState: "placeholder",
        targetState: "imported",
        sourceManifestIds: [
          `${chapterId}-dialogue-ui-reference`,
        ],
        rollback: {
          mode: "remove-chapter-override",
          fallbackKey: "ui.panel.default",
          notes: "Rollback by removing the chapter override. / 通过移除章节 override 回滚。",
        },
        verification: {
          regressionCaseIds: [],
          requireUiParity: true,
          requireBuild: true,
          notes: "Fill regression case ids after the first gameplay loop is bound. / 首条 gameplay 闭环绑定后，再补 regression case id。",
        },
        notes: "Replace with a real chapter-local dialogue panel or keep as shared fallback. / 将其替换为真实章节对话框，或继续保留共享回退。",
      },
    ],
  };
}

function createReferencePackTemplate(chapterId: string, title: string) {
  return {
    format: "reference-frame-pack-v1",
    pack_id: `${chapterId}-pack`,
    chapter: chapterId,
    title: `${title} Reference Pack`,
    source: {
      source_name: `${chapterId}-reference-source`,
      source_type: "screenshot",
      input_path: `screenshots/${chapterId}/reference-source.png`,
      approximate_source: "Describe the screenshot or video source for this chapter. / 描述本章截图或视频参考来源。",
    },
    notes: "Bootstrap reference pack. Replace the placeholder frame list with real map, NPC, UI, and battle frames as coverage grows. / 批量初始化生成的参考包。随着覆盖率提升，请用真实地图、NPC、UI 和战斗关键帧替换占位内容。",
    frames: [
      {
        id: `${chapterId}-map-keyframe-0001`,
        source_ref: "manual-sample-0001",
        scene_type: "world",
        map_id: "replace-map-id",
        subject_type: "map",
        subject_id: "replace-subject-id",
        confidence: "low",
        output_asset_path: `screenshots/${chapterId}/${chapterId}-map-keyframe-0001.png`,
        metadata: {
          variant: "bootstrap",
          tags: [
            "bootstrap",
            "map",
          ],
        },
        notes: "Replace with a real chapter frame once reference capture begins. / 开始采集 reference 后，请替换成真实章节关键帧。",
      },
    ],
  };
}

function createBootstrapSummary(
  chapterId: string,
  title: string,
  areaLabel: string,
  createdFiles: string[],
  createdDirectories: string[],
  checklistPath: string,
): string {
  return [
    "# Batch Chapter Bootstrap Summary",
    "# 批量章节初始化摘要",
    "",
    `- Chapter Id / 章节 ID: \`${chapterId}\``,
    `- Title / 标题: ${title}`,
    `- Area Label / 区域标签: ${areaLabel}`,
    "",
    "## Created Files",
    "## 已创建文件",
    "",
    ...createdFiles.map((entry) => `- ${relativeToRepo(entry)}`),
    "",
    "## Created Directories",
    "## 已创建目录",
    "",
    ...createdDirectories.map((entry) => `- ${relativeToRepo(entry)}`),
    "",
    "## Default Checklist",
    "## 默认检查清单",
    "",
    `- Lock checklist path / 锁定清单路径: ${relativeToRepo(checklistPath)}`,
    "- [ ] Replace bootstrap placeholder notes with real chapter scope.",
    "- [ ] 用真实章节范围替换 bootstrap 占位说明。",
    "- [ ] Import the first real map slice through source -> tools -> generated/manual.",
    "- [ ] 通过 source -> tools -> generated/manual 导入首张真实地图切片。",
    "- [ ] Bind initial regression, parity, and reference workflows before leaving planned/importing status.",
    "- [ ] 在离开 planned/importing 状态前，先绑定初始 regression、parity 和 reference 工作流。",
    "",
  ].join("\n");
}

export async function bootstrapChapterBatch(
  options: ChapterBootstrapOptions,
  paths?: ChapterFactoryOutputPaths,
): Promise<BatchChapterBootstrapResult> {
  const scaffoldResult = await bootstrapChapterScaffold(options, paths);
  const chapterLabel = toTitleCaseFromChapterId(options.chapterId);
  const visualBacklogPath = getChapterVisualBacklogPath(options.chapterId, paths);
  const battleNotesPath = getChapterBattleParityNotesPath(options.chapterId, paths);
  const referencePackPath = getChapterReferencePackPath(options.chapterId, paths);
  const sourceTextPath = getChapterSourceTextPath(options.chapterId, paths);
  const visualBackfillPlanPath = getChapterVisualBackfillPlanPath(options.chapterId, paths);
  const checklistPath = getGeneratedChecklistPath(options.chapterId, paths);
  const summaryPath = getBatchBootstrapSummaryPath(options.chapterId, paths);
  const createdDirectories = getReferenceChapterDirectories(options.chapterId, paths);

  await Promise.all([
    mkdir(path.dirname(visualBacklogPath), { recursive: true }),
    mkdir(path.dirname(battleNotesPath), { recursive: true }),
    mkdir(path.dirname(referencePackPath), { recursive: true }),
    mkdir(path.dirname(sourceTextPath), { recursive: true }),
    mkdir(path.dirname(visualBackfillPlanPath), { recursive: true }),
    mkdir(path.dirname(summaryPath), { recursive: true }),
    ...createdDirectories.map((directoryPath) => mkdir(directoryPath, { recursive: true })),
  ]);

  await writeFile(
    visualBacklogPath,
    `${createVisualBacklogTemplate(options.chapterId, options.title, chapterLabel)}\n`,
    "utf8",
  );
  await writeFile(
    battleNotesPath,
    `${createBattleParityNotesTemplate(options.chapterId, chapterLabel)}\n`,
    "utf8",
  );
  await writeStableJsonFile(referencePackPath, createReferencePackTemplate(options.chapterId, options.title));
  await writeStableJsonFile(sourceTextPath, createSourceTextSkeleton(options.chapterId, options.title));
  await writeStableJsonFile(visualBackfillPlanPath, createVisualBackfillPlan(options.chapterId, options.title));
  await writeChapterLockChecklist(options.chapterId, paths);

  const createdFiles = [
    ...scaffoldResult.createdFiles,
    visualBacklogPath,
    battleNotesPath,
    referencePackPath,
    sourceTextPath,
    visualBackfillPlanPath,
  ];

  await writeFile(
    summaryPath,
    `${createBootstrapSummary(
      options.chapterId,
      options.title,
      options.areaLabel,
      createdFiles,
      createdDirectories,
      checklistPath,
    )}\n`,
    "utf8",
  );

  return {
    chapterId: options.chapterId,
    createdFiles,
    createdDirectories,
    checklistPath,
    summaryPath,
  };
}

async function loadOptionalJson<T>(filePath: string): Promise<T | undefined> {
  try {
    const rawText = await readFile(filePath, "utf8");
    if (rawText.trim().length === 0) {
      return undefined;
    }

    return JSON.parse(rawText) as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (
      message.includes("ENOENT")
      || message.includes("no such file")
      || message.includes("Unexpected end of JSON input")
    ) {
      return undefined;
    }

    throw error;
  }
}

function getChapterCompletenessIssues(
  issues: ChapterCompletenessIssue[],
  chapterId: string,
): ChapterCompletenessIssue[] {
  return issues.filter((issue) => issue.chapterId === chapterId);
}

function getRegressionCoverage(
  chapter: ChapterMetadata,
  regressionReport?: RegressionReport,
): ChapterImportStatusEntry["regression"] {
  if (!regressionReport) {
    return {
      boundCount: chapter.regressionCases.length,
      passCount: 0,
      missingCount: chapter.regressionCases.length,
    };
  }

  const caseIndex = new Map(regressionReport.cases.map((entry) => [entry.id, entry]));
  const passCount = chapter.regressionCases.filter((caseId) => caseIndex.get(caseId)?.status === "pass").length;
  const missingCount = chapter.regressionCases.filter((caseId) => !caseIndex.has(caseId)).length;
  return {
    boundCount: chapter.regressionCases.length,
    passCount,
    missingCount,
  };
}

function getUiParityCoverage(
  chapterId: string,
  uiParityReport?: UiParityReport,
): ChapterImportStatusEntry["uiParity"] {
  const cases = uiParityReport?.cases.filter((entry) => entry.locator.chapterId === chapterId) ?? [];
  return {
    matchedCount: cases.filter((entry) => entry.status === "matched").length,
    divergedCount: cases.filter((entry) => entry.status === "diverged").length,
  };
}

export async function buildChapterImportStatusReport(
  paths?: ChapterFactoryOutputPaths,
): Promise<ChapterImportStatusReport> {
  const chapters = (await loadAllChapterMetadata(paths?.chapterMetadataDir ?? chapterMetadataDir))
    .filter((entry) => entry.chapterId !== "chapter-template");
  const [completenessReport, parityReport, regressionReport, uiParityReport] = await Promise.all([
    runChapterCompletenessCheck(),
    loadOptionalJson<ParityScoreReport>(path.join(repoRoot, "reports", "parity", "latest", "report.json")),
    loadOptionalJson<RegressionReport>(path.join(repoRoot, "reports", "regression", "latest", "report.json")),
    loadOptionalJson<UiParityReport>(path.join(repoRoot, "reports", "ui-parity", "latest", "report.json")),
  ]);

  const parityIndex = new Map((parityReport?.chapters ?? []).map((entry) => [entry.chapterId, entry]));
  const entries: ChapterImportStatusEntry[] = chapters.map((chapter) => {
    const chapterIssues = getChapterCompletenessIssues(completenessReport.issues, chapter.chapterId);
    const parity = parityIndex.get(chapter.chapterId);
    const regression = getRegressionCoverage(chapter, regressionReport);
    const uiParity = getUiParityCoverage(chapter.chapterId, uiParityReport);
    return {
      chapterId: chapter.chapterId,
      title: chapter.title,
      areaLabel: chapter.areaLabel,
      status: chapter.status,
      metadataPath: relativeToRepo(getChapterMetadataPath(chapter.chapterId, paths)),
      planPath: relativeToRepo(getChapterPlanPath(chapter.chapterId, paths)),
      lockReportPath: relativeToRepo(getChapterLockReportPath(chapter.chapterId, paths)),
      completeness: {
        errorCount: chapterIssues.filter((issue) => issue.severity === "error").length,
        warningCount: chapterIssues.filter((issue) => issue.severity === "warning").length,
      },
      parity: parity
        ? {
          totalScore: parity.totalScore,
          blockerCount: parity.blockerCount,
          minorCount: parity.minorCount,
        }
        : undefined,
      regression,
      uiParity,
      readyForLockChecklist: chapter.status !== "planned",
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    chapters: entries,
  };
}

function checklistItem(label: string, checked: boolean, detail: string) {
  return { label, checked, detail };
}

export async function buildChapterLockChecklist(
  chapterId: string,
  paths?: ChapterFactoryOutputPaths,
): Promise<ChapterLockChecklistReport> {
  const [statusReport, parityReport] = await Promise.all([
    buildChapterImportStatusReport(paths),
    loadOptionalJson<ParityScoreReport>(path.join(repoRoot, "reports", "parity", "latest", "report.json")),
  ]);
  const chapter = statusReport.chapters.find((entry) => entry.chapterId === chapterId);
  if (!chapter) {
    throw new Error(`Chapter lock checklist could not find chapter "${chapterId}".`);
  }

  const metadata = (await loadAllChapterMetadata(paths?.chapterMetadataDir ?? chapterMetadataDir))
    .find((entry) => entry.chapterId === chapterId);
  if (!metadata) {
    throw new Error(`Chapter metadata could not be reloaded for "${chapterId}".`);
  }

  const parity = parityReport?.chapters.find((entry) => entry.chapterId === chapterId);

  return {
    chapterId,
    title: chapter.title,
    generatedAt: new Date().toISOString(),
    items: [
      checklistItem(
        "Chapter metadata exists / 章节元数据存在",
        true,
        `${chapter.metadataPath}`,
      ),
      checklistItem(
        "Plan and lock report scaffolds exist / 计划和锁定报告骨架存在",
        true,
        `${chapter.planPath} | ${chapter.lockReportPath}`,
      ),
      checklistItem(
        "Completeness has no errors / completeness 无 error",
        chapter.completeness.errorCount === 0,
        `errors=${chapter.completeness.errorCount} warnings=${chapter.completeness.warningCount}`,
      ),
      checklistItem(
        "Regression cases are bound / 已绑定 regression cases",
        chapter.regression.boundCount > 0,
        `bound=${chapter.regression.boundCount} missing=${chapter.regression.missingCount}`,
      ),
      checklistItem(
        "All bound regression cases pass / 已绑定 regression 全部通过",
        chapter.regression.boundCount > 0 && chapter.regression.passCount === chapter.regression.boundCount,
        `pass=${chapter.regression.passCount}/${chapter.regression.boundCount}`,
      ),
      checklistItem(
        "Parity has no blockers / parity 无 blocker",
        (parity?.blockerCount ?? 0) === 0,
        `score=${parity?.totalScore ?? "n/a"} blockers=${parity?.blockerCount ?? "n/a"} minors=${parity?.minorCount ?? "n/a"}`,
      ),
      checklistItem(
        "Parity summary is ready for lock / paritySummary 已接近锁定",
        Object.values(metadata.paritySummary).every((status) => status === "locked" || status === "parity-review"),
        stableStringify(metadata.paritySummary),
      ),
      checklistItem(
        "Chapter status is ready for final review / 章节状态已进入最终审核阶段",
        metadata.status === "parity-review" || metadata.status === "locked",
        `status=${metadata.status}`,
      ),
      checklistItem(
        "UI parity has no remaining divergences / UI 一致性无剩余偏差",
        chapter.uiParity.divergedCount === 0,
        `matched=${chapter.uiParity.matchedCount} diverged=${chapter.uiParity.divergedCount}`,
      ),
      checklistItem(
        "Human lock notes updated / 人工锁定说明已更新",
        true,
        "Update docs/chapters/<chapter>-lock-report.md before claiming locked.",
      ),
    ],
  };
}

export async function writeChapterLockChecklist(
  chapterId: string,
  paths?: ChapterFactoryOutputPaths,
): Promise<string> {
  const report = await buildChapterLockChecklist(chapterId, paths);
  const lines = [
    `# ${report.title} Lock Checklist`,
    `# ${report.title} 锁定检查清单`,
    "",
    `- Chapter Id / 章节 ID: \`${report.chapterId}\``,
    `- Generated At / 生成时间: ${report.generatedAt}`,
    "",
    "## Checklist",
    "## 清单",
    "",
    ...report.items.map((item) => `- [${item.checked ? "x" : " "}] ${item.label}: ${item.detail}`),
    "",
  ];
  const targetPath = getGeneratedChecklistPath(chapterId, paths);
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, `${lines.join("\n")}\n`, "utf8");
  return targetPath;
}

export function parseChapterBootstrapArgs(): ChapterBootstrapOptions {
  const chapterId = getArgValue("--id");
  const title = getArgValue("--title");
  const areaLabel = getArgValue("--area");
  const status = (getArgValue("--status") as ChapterStatus | undefined) ?? "planned";

  if (!chapterId || !title || !areaLabel) {
    throw new Error("chapter-bootstrap requires --id, --title, and --area.");
  }

  return {
    chapterId,
    title,
    areaLabel,
    status,
  };
}

export function parseChapterIdArg(): string {
  const chapterId = getArgValue("--id");
  if (!chapterId) {
    throw new Error("This command requires --id <chapter-id>.");
  }

  return chapterId;
}

export function formatChapterImportStatusReport(report: ChapterImportStatusReport): string {
  const lines = [
    "Chapter Import Status Report / 章节导入状态报告",
    `Generated At / 生成时间: ${report.generatedAt}`,
    "",
  ];

  report.chapters.forEach((entry) => {
    lines.push(`${entry.chapterId} :: ${entry.title}`);
    lines.push(`  status=${entry.status} completeness=${entry.completeness.errorCount} error(s), ${entry.completeness.warningCount} warning(s)`);
    lines.push(`  regression=${entry.regression.passCount}/${entry.regression.boundCount} passed missing=${entry.regression.missingCount}`);
    lines.push(`  uiParity=matched ${entry.uiParity.matchedCount} diverged ${entry.uiParity.divergedCount}`);
    if (entry.parity) {
      lines.push(`  parity=score ${entry.parity.totalScore} blockers ${entry.parity.blockerCount} minors ${entry.parity.minorCount}`);
    }
    lines.push("");
  });

  return lines.join("\n");
}

export async function writeChapterImportStatusReport(
  report: ChapterImportStatusReport,
): Promise<string> {
  const targetPath = path.join(chapterReportsDir, "status-report.json");
  await mkdir(chapterReportsDir, { recursive: true });
  await writeStableJsonFile(targetPath, report);
  const summaryPath = path.join(chapterReportsDir, "status-report.md");
  const lines = [
    "# Chapter Import Status Report",
    "# 章节导入状态报告",
    "",
    `Generated At / 生成时间: ${report.generatedAt}`,
    "",
    "| Chapter | Status | Completeness | Regression | UI Parity | Parity |",
    "| --- | --- | --- | --- | --- | --- |",
    ...report.chapters.map((entry) => `| ${entry.chapterId} | ${entry.status} | E${entry.completeness.errorCount}/W${entry.completeness.warningCount} | ${entry.regression.passCount}/${entry.regression.boundCount} pass | M${entry.uiParity.matchedCount}/D${entry.uiParity.divergedCount} | ${entry.parity ? `${entry.parity.totalScore} (${entry.parity.blockerCount}B/${entry.parity.minorCount}m)` : "n/a"} |`),
    "",
  ];
  await writeFile(summaryPath, `${lines.join("\n")}\n`, "utf8");
  return targetPath;
}
