import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));

export const repoRoot = path.resolve(scriptDir, "..", "..");
export const contentRoot = path.join(repoRoot, "content");
export const sourceRoot = path.join(contentRoot, "source");
export const generatedRoot = path.join(contentRoot, "generated");

export function formatError(filePath: string, fieldPath: string, message: string): Error {
  return new Error(`[import] ${filePath}:${fieldPath} ${message}`);
}

export async function readJsonFile<T>(filePath: string): Promise<T> {
  const rawText = await readFile(filePath, "utf8");
  try {
    return JSON.parse(rawText) as T;
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown parse error";
    throw new Error(`[import] ${path.relative(repoRoot, filePath)}: invalid JSON: ${reason}`);
  }
}

export async function writeStableJsonFile(filePath: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${stableStringify(value)}\n`, "utf8");
}

export function stableStringify(value: unknown): string {
  return JSON.stringify(sortKeys(value), null, 2);
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => sortKeys(entry));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, sortKeys(entry)]),
    );
  }

  return value;
}

export async function runCli(main: () => Promise<void>): Promise<void> {
  try {
    await main();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  }
}
