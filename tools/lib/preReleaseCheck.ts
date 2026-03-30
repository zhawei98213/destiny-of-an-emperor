import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { repoRoot, stableStringify } from "./importerCore";

export type PreReleaseMode = "light" | "full";
export type PreReleaseVerdict = "yes" | "no" | "not-evaluated";

export interface PreReleaseCommandDefinition {
  id: string;
  label: string;
  command: string;
  args: string[];
  phase: "core" | "extended";
}

export interface PreReleaseCommandResult {
  id: string;
  label: string;
  phase: "core" | "extended";
  commandLine: string;
  exitCode: number;
  success: boolean;
  output: string;
}

export interface PreReleaseSummaryMetrics {
  regression?: {
    pass: number;
    mismatch: number;
    fail: number;
    total: number;
  };
  parity?: {
    chapterCount: number;
    averageScore: number;
    blockerCount: number;
    minorMismatchCount: number;
  };
  chapterCompleteness?: {
    checkedChapters: number;
    errorCount: number;
    warningCount: number;
  };
  asset?: {
    chapterCount: number;
    issueCount: number;
    placeholderCategoryCount: number;
  };
  text?: {
    chapterCount: number;
    manualLineCount: number;
    errorCount: number;
    warningCount: number;
    realSharePercent: number;
  };
}

export interface PreReleaseReport {
  generatedAt: string;
  mode: PreReleaseMode;
  commands: PreReleaseCommandResult[];
  totals: {
    total: number;
    passed: number;
    failed: number;
  };
  metrics: PreReleaseSummaryMetrics;
  verdict: {
    continueImport: PreReleaseVerdict;
    betaTest: PreReleaseVerdict;
  };
  keyFailures: string[];
  notes: string[];
}

interface RegressionReportShape {
  totals: {
    pass: number;
    mismatch: number;
    fail: number;
    total: number;
  };
}

interface ParityReportShape {
  totals: {
    chapterCount: number;
    averageScore: number;
    blockerCount: number;
    minorMismatchCount: number;
  };
}

interface ChapterCompletenessReportShape {
  checkedChapters: number;
  issues: Array<{
    severity: "warning" | "error";
  }>;
}

interface AssetParityReportShape {
  summary: {
    chapterCount: number;
    issueCount: number;
    placeholderCategories: number;
  };
}

interface TextIntegrityReportShape {
  summary: {
    chapterCount: number;
    manualLineCount: number;
    errorCount: number;
    warningCount: number;
  };
  ratio: {
    realSharePercent: number;
  };
}

const preReleaseReportDirectory = path.join(repoRoot, "reports", "pre-release", "latest");

export function getPreReleaseCommands(mode: PreReleaseMode): PreReleaseCommandDefinition[] {
  const core: PreReleaseCommandDefinition[] = [
    {
      id: "validate-content",
      label: "Validate Content / 内容校验",
      command: "npm",
      args: ["run", "validate-content"],
      phase: "core",
    },
    {
      id: "save-migration-check",
      label: "Save Migration Checks / 存档迁移检查",
      command: "npm",
      args: ["run", "save-migration-check"],
      phase: "core",
    },
    {
      id: "test",
      label: "Test / 测试",
      command: "npm",
      args: ["run", "test"],
      phase: "core",
    },
    {
      id: "build",
      label: "Build / 构建",
      command: "npm",
      args: ["run", "build"],
      phase: "core",
    },
  ];

  if (mode === "light") {
    return core;
  }

  return [
    ...core,
    {
      id: "regression-smoke",
      label: "Regression Smoke / 回归冒烟",
      command: "npm",
      args: ["run", "regression-smoke"],
      phase: "extended",
    },
    {
      id: "parity-score",
      label: "Parity Score / 一致性评分",
      command: "npm",
      args: ["run", "parity-score"],
      phase: "extended",
    },
    {
      id: "chapter-completeness",
      label: "Chapter Completeness / 章节完整性",
      command: "npm",
      args: ["run", "check:chapter-completeness"],
      phase: "extended",
    },
    {
      id: "asset-check",
      label: "Asset Integrity / 资产完整性",
      command: "npm",
      args: ["run", "asset-check"],
      phase: "extended",
    },
    {
      id: "text-check",
      label: "Text Integrity / 文本完整性",
      command: "npm",
      args: ["run", "text-check"],
      phase: "extended",
    },
  ];
}

function resolveMode(argv: string[]): PreReleaseMode {
  const modeIndex = argv.findIndex((entry) => entry === "--mode");
  const modeValue = modeIndex >= 0 ? argv[modeIndex + 1] : undefined;
  if (modeValue === "light" || modeValue === "full") {
    return modeValue;
  }

  return "full";
}

async function runCommand(definition: PreReleaseCommandDefinition): Promise<PreReleaseCommandResult> {
  return new Promise((resolve) => {
    const child = spawn(definition.command, definition.args, {
      cwd: repoRoot,
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
      shell: false,
    });

    let output = "";
    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      output += chunk.toString();
    });

    child.on("close", (exitCode) => {
      resolve({
        id: definition.id,
        label: definition.label,
        phase: definition.phase,
        commandLine: `${definition.command} ${definition.args.join(" ")}`,
        exitCode: exitCode ?? 1,
        success: (exitCode ?? 1) === 0,
        output,
      });
    });
  });
}

async function readOptionalJson<T>(filePath: string): Promise<T | undefined> {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as T;
  } catch {
    return undefined;
  }
}

async function loadMetrics(mode: PreReleaseMode): Promise<PreReleaseSummaryMetrics> {
  const metrics: PreReleaseSummaryMetrics = {};

  if (mode === "full") {
    const regression = await readOptionalJson<RegressionReportShape>(
      path.join(repoRoot, "reports", "regression", "latest", "report.json"),
    );
    if (regression) {
      metrics.regression = regression.totals;
    }

    const parity = await readOptionalJson<ParityReportShape>(
      path.join(repoRoot, "reports", "parity", "latest", "report.json"),
    );
    if (parity) {
      metrics.parity = parity.totals;
    }

    const chapterCompleteness = await readOptionalJson<ChapterCompletenessReportShape>(
      path.join(repoRoot, "reports", "chapters", "latest", "completeness-report.json"),
    );
    if (chapterCompleteness) {
      metrics.chapterCompleteness = {
        checkedChapters: chapterCompleteness.checkedChapters,
        errorCount: chapterCompleteness.issues.filter((issue) => issue.severity === "error").length,
        warningCount: chapterCompleteness.issues.filter((issue) => issue.severity === "warning").length,
      };
    }

    const asset = await readOptionalJson<AssetParityReportShape>(
      path.join(repoRoot, "reports", "asset-parity", "latest", "report.json"),
    );
    if (asset) {
      metrics.asset = {
        chapterCount: asset.summary.chapterCount,
        issueCount: asset.summary.issueCount,
        placeholderCategoryCount: asset.summary.placeholderCategories,
      };
    }

    const text = await readOptionalJson<TextIntegrityReportShape>(
      path.join(repoRoot, "reports", "text-integrity", "latest", "report.json"),
    );
    if (text) {
      metrics.text = {
        chapterCount: text.summary.chapterCount,
        manualLineCount: text.summary.manualLineCount,
        errorCount: text.summary.errorCount,
        warningCount: text.summary.warningCount,
        realSharePercent: text.ratio.realSharePercent,
      };
    }
  }

  return metrics;
}

export function evaluatePreReleaseReport(
  mode: PreReleaseMode,
  commands: PreReleaseCommandResult[],
  metrics: PreReleaseSummaryMetrics,
): Pick<PreReleaseReport, "totals" | "verdict" | "keyFailures" | "notes"> {
  const failedCommands = commands.filter((entry) => !entry.success);
  const coreFailed = commands.some((entry) => entry.phase === "core" && !entry.success);
  const totals = {
    total: commands.length,
    passed: commands.filter((entry) => entry.success).length,
    failed: failedCommands.length,
  };

  const keyFailures = failedCommands.map((entry) => `${entry.id}: ${entry.label}`);
  const notes: string[] = [];

  if (metrics.chapterCompleteness && metrics.chapterCompleteness.warningCount > 0) {
    notes.push(
      `chapter completeness warnings=${metrics.chapterCompleteness.warningCount} / 章节完整性警告=${metrics.chapterCompleteness.warningCount}`,
    );
  }
  if (metrics.parity && metrics.parity.blockerCount > 0) {
    notes.push(`parity blockers=${metrics.parity.blockerCount} / 一致性阻塞项=${metrics.parity.blockerCount}`);
  }
  if (metrics.asset && metrics.asset.issueCount > 0) {
    notes.push(`asset issues=${metrics.asset.issueCount} / 资产问题=${metrics.asset.issueCount}`);
  }
  if (metrics.text && metrics.text.warningCount > 0) {
    notes.push(`text warnings=${metrics.text.warningCount} / 文本警告=${metrics.text.warningCount}`);
  }
  if (metrics.regression && (metrics.regression.mismatch > 0 || metrics.regression.fail > 0)) {
    notes.push(
      `regression mismatch=${metrics.regression.mismatch} fail=${metrics.regression.fail} / 回归不匹配=${metrics.regression.mismatch} 失败=${metrics.regression.fail}`,
    );
  }

  const continueImport: PreReleaseVerdict = coreFailed ? "no" : "yes";

  if (mode === "light") {
    return {
      totals,
      verdict: {
        continueImport,
        betaTest: "not-evaluated",
      },
      keyFailures,
      notes,
    };
  }

  const betaBlocked =
    failedCommands.length > 0 ||
    (metrics.regression ? metrics.regression.mismatch > 0 || metrics.regression.fail > 0 : false) ||
    (metrics.parity ? metrics.parity.blockerCount > 0 : true) ||
    (metrics.chapterCompleteness ? metrics.chapterCompleteness.errorCount > 0 : true) ||
    (metrics.asset ? metrics.asset.issueCount > 0 : true) ||
    (metrics.text ? metrics.text.errorCount > 0 : true);

  return {
    totals,
    verdict: {
      continueImport,
      betaTest: betaBlocked ? "no" : "yes",
    },
    keyFailures,
    notes,
  };
}

export function formatPreReleaseReport(report: PreReleaseReport): string {
  const lines = [
    "Pre-Release Check / 发布前检查",
    `Mode / 模式: ${report.mode}`,
    `Totals / 汇总: passed=${report.totals.passed} failed=${report.totals.failed} total=${report.totals.total}`,
    `Continue Import / 适合继续导入: ${report.verdict.continueImport}`,
    `Beta Test / 适合发布测试版: ${report.verdict.betaTest}`,
    "",
    "Command Results / 命令结果",
  ];

  report.commands.forEach((entry) => {
    lines.push(`- ${entry.success ? "PASS" : "FAIL"} ${entry.id} :: ${entry.commandLine}`);
  });

  if (report.metrics.regression) {
    lines.push(
      "",
      `Regression / 回归: pass=${report.metrics.regression.pass} mismatch=${report.metrics.regression.mismatch} fail=${report.metrics.regression.fail}`,
    );
  }
  if (report.metrics.parity) {
    lines.push(
      `Parity / 一致性: chapters=${report.metrics.parity.chapterCount} average=${report.metrics.parity.averageScore} blockers=${report.metrics.parity.blockerCount}`,
    );
  }
  if (report.metrics.chapterCompleteness) {
    lines.push(
      `Chapter Completeness / 章节完整性: checked=${report.metrics.chapterCompleteness.checkedChapters} errors=${report.metrics.chapterCompleteness.errorCount} warnings=${report.metrics.chapterCompleteness.warningCount}`,
    );
  }
  if (report.metrics.asset) {
    lines.push(
      `Asset Integrity / 资产完整性: chapters=${report.metrics.asset.chapterCount} issues=${report.metrics.asset.issueCount} placeholders=${report.metrics.asset.placeholderCategoryCount}`,
    );
  }
  if (report.metrics.text) {
    lines.push(
      `Text Integrity / 文本完整性: chapters=${report.metrics.text.chapterCount} errors=${report.metrics.text.errorCount} warnings=${report.metrics.text.warningCount} realShare=${report.metrics.text.realSharePercent}%`,
    );
  }

  if (report.keyFailures.length > 0) {
    lines.push("", "Key Failures / 关键失败项");
    report.keyFailures.forEach((entry) => lines.push(`- ${entry}`));
  }

  if (report.notes.length > 0) {
    lines.push("", "Notes / 备注");
    report.notes.forEach((entry) => lines.push(`- ${entry}`));
  }

  return `${lines.join("\n")}\n`;
}

export async function runPreReleaseCheck(mode: PreReleaseMode): Promise<PreReleaseReport> {
  const commands = getPreReleaseCommands(mode);
  const results: PreReleaseCommandResult[] = [];

  for (const command of commands) {
    const result = await runCommand(command);
    results.push(result);
  }

  const metrics = await loadMetrics(mode);
  const evaluation = evaluatePreReleaseReport(mode, results, metrics);
  return {
    generatedAt: new Date().toISOString(),
    mode,
    commands: results,
    totals: evaluation.totals,
    metrics,
    verdict: evaluation.verdict,
    keyFailures: evaluation.keyFailures,
    notes: evaluation.notes,
  };
}

export async function writePreReleaseArtifacts(report: PreReleaseReport): Promise<PreReleaseReport> {
  await mkdir(preReleaseReportDirectory, { recursive: true });
  await writeFile(
    path.join(preReleaseReportDirectory, "report.json"),
    `${stableStringify(report)}\n`,
    "utf8",
  );
  await writeFile(
    path.join(preReleaseReportDirectory, "summary.md"),
    formatPreReleaseReport(report),
    "utf8",
  );
  return report;
}

export async function runPreReleaseCli(argv: string[]): Promise<void> {
  const mode = resolveMode(argv);
  const report = await writePreReleaseArtifacts(await runPreReleaseCheck(mode));
  process.stdout.write(formatPreReleaseReport(report));
  console.log(`Artifacts / 产物目录: ${preReleaseReportDirectory}`);
  if (report.totals.failed > 0) {
    process.exitCode = 1;
  }
}
