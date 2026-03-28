import type { FlagMap } from "@/types/content";

export interface SaveState {
  slot: string;
  scene: string;
  flags: FlagMap;
}

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

export class SaveManager {
  constructor(private readonly storage: SaveStorage) {}

  save(state: SaveState): void {
    this.storage.setItem(`save:${state.slot}`, JSON.stringify(state));
  }

  load(slot: string): SaveState | null {
    const raw = this.storage.getItem(`save:${slot}`);
    return raw ? (JSON.parse(raw) as SaveState) : null;
  }
}
