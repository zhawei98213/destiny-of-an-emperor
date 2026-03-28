import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadContentDatabase } from "../game/src/content/contentLoader";
import { DEFAULT_CONTENT_MANIFESTS } from "../game/src/content/contentKeys";

class FileSystemContentReader {
  private readonly rootDir: string;

  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  async readText(targetPath: string): Promise<string> {
    const normalized = targetPath.startsWith("/")
      ? targetPath.slice(1)
      : targetPath;

    const absolutePath = path.resolve(this.rootDir, normalized);
    return readFile(absolutePath, "utf8");
  }
}

async function main(): Promise<void> {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(scriptDir, "..");
  const reader = new FileSystemContentReader(repoRoot);
  const database = await loadContentDatabase(reader, DEFAULT_CONTENT_MANIFESTS);

  console.log(
    [
      "Content check passed.",
      `packs=${database.packs.length}`,
      `maps=${database.maps.length}`,
      `events=${database.events.length}`,
      `items=${database.items.length}`,
      `enemies=${database.enemies.length}`,
    ].join(" "),
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Content check failed: ${message}`);
  process.exitCode = 1;
});
