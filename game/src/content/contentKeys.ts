export const CONTENT_REGISTRY_KEY = "contentDatabase";
export const GAME_STATE_REGISTRY_KEY = "gameStateRuntime";
export const SAVE_MANAGER_REGISTRY_KEY = "saveManager";
export const WORLD_RUNTIME_REGISTRY_KEY = "worldRuntime";
export const BATTLE_REQUEST_REGISTRY_KEY = "battleRequest";

export const DEFAULT_CONTENT_MANIFESTS = [
  "/content/manual/index.json",
  "/content/generated/index.json",
] as const;
