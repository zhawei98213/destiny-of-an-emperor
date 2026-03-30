import path from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import { stableStringify } from "./importerCore";

export interface EventJsonLintIssue {
  path: string;
  message: string;
}

export interface EventJsonLintResult {
  filePath: string;
  normalized: boolean;
  issues: EventJsonLintIssue[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function collectArrayIdIssues(
  issues: EventJsonLintIssue[],
  record: Record<string, unknown>,
  arrayKey: "dialogueLines" | "events" | "shops",
): void {
  const entries = record[arrayKey];
  if (!Array.isArray(entries)) {
    return;
  }

  const seen = new Map<string, number>();
  entries.forEach((entry, index) => {
    if (!isRecord(entry) || typeof entry.id !== "string") {
      issues.push({
        path: `${arrayKey}[${index}]`,
        message: "must contain a string id",
      });
      return;
    }

    const previousIndex = seen.get(entry.id);
    if (previousIndex !== undefined) {
      issues.push({
        path: `${arrayKey}[${index}].id`,
        message: `duplicates ${arrayKey}[${previousIndex}].id "${entry.id}"`,
      });
      return;
    }

    seen.set(entry.id, index);
  });
}

function lintEventSteps(
  issues: EventJsonLintIssue[],
  steps: unknown,
  basePath: string,
): void {
  if (!Array.isArray(steps)) {
    issues.push({
      path: basePath,
      message: "must be an array",
    });
    return;
  }

  let endCount = 0;
  steps.forEach((entry, index) => {
    if (!isRecord(entry) || typeof entry.type !== "string") {
      issues.push({
        path: `${basePath}[${index}]`,
        message: "must contain a string type",
      });
      return;
    }

    if (entry.type === "end") {
      endCount += 1;
      if (index !== steps.length - 1) {
        issues.push({
          path: `${basePath}[${index}]`,
          message: "end should be the last step in its step list",
        });
      }
    }

    if ("steps" in entry) {
      lintEventSteps(issues, entry.steps, `${basePath}[${index}].steps`);
    }
  });

  if (steps.length > 0 && endCount === 0) {
    issues.push({
      path: basePath,
      message: "event step list should end with an end opcode",
    });
  }
}

export async function lintEventJsonFile(filePath: string): Promise<EventJsonLintResult> {
  const rawText = await readFile(filePath, "utf8");
  const document = JSON.parse(rawText) as unknown;
  const normalizedText = `${stableStringify(document)}\n`;
  const normalized = rawText === normalizedText;
  const issues: EventJsonLintIssue[] = [];

  if (!isRecord(document)) {
    issues.push({
      path: "root",
      message: "must be an object",
    });
  } else {
    collectArrayIdIssues(issues, document, "dialogueLines");
    collectArrayIdIssues(issues, document, "events");
    collectArrayIdIssues(issues, document, "shops");

    if (Array.isArray(document.events)) {
      document.events.forEach((entry, index) => {
        if (!isRecord(entry)) {
          issues.push({
            path: `events[${index}]`,
            message: "must be an object",
          });
          return;
        }

        lintEventSteps(issues, entry.steps, `events[${index}].steps`);
      });
    }
  }

  return {
    filePath: path.resolve(filePath),
    normalized,
    issues,
  };
}

export async function writeFormattedEventJsonFile(filePath: string): Promise<void> {
  const rawText = await readFile(filePath, "utf8");
  const document = JSON.parse(rawText) as unknown;
  await writeFile(filePath, `${stableStringify(document)}\n`, "utf8");
}
