import { validateSaveData, validateSaveDataReferences } from "@/content/schema";
import type { ContentDatabase, SaveData } from "@/types/content";

export const DEFAULT_SAVE_SLOT = "slot-1";

export const SAVE_DATA_VERSION = 1;

export interface SaveStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export class MemoryStorage implements SaveStorage {
  private readonly store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

export class BrowserStorage implements SaveStorage {
  getItem(key: string): string | null {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem(key);
  }

  setItem(key: string, value: string): void {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(key, value);
  }
}

export class SaveManager {
  constructor(
    private readonly storage: SaveStorage,
    private readonly database: ContentDatabase,
  ) {}

  save(state: SaveData): void {
    validateSaveDataReferences(validateSaveData(state), this.database);
    this.storage.setItem(`save:${state.slot}`, JSON.stringify(state));
  }

  load(slot: string): SaveData | null {
    const raw = this.storage.getItem(`save:${slot}`);
    if (!raw) {
      return null;
    }

    const saveData = validateSaveData(JSON.parse(raw) as unknown);
    return validateSaveDataReferences(saveData, this.database);
  }
}
