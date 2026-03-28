import { failSchema } from "@/content/schema/primitives";
import type { ContentDatabase, Facing, MapDefinition, PortalDefinition, SpawnPointDefinition } from "@/types/content";

export interface WorldRuntimeState {
  currentMapId: string;
  currentSpawnId: string;
  playerX: number;
  playerY: number;
  facing: Facing;
}

export interface WorldMoveResult {
  type: "moved" | "blocked" | "portal";
  state: WorldRuntimeState;
  portal?: PortalDefinition;
}

function getMapById(database: ContentDatabase, mapId: string): MapDefinition {
  const map = database.maps.find((entry) => entry.id === mapId);
  if (!map) {
    failSchema("worldRuntime.currentMapId", `references missing map "${mapId}"`);
  }

  return map;
}

function getSpawnPoint(map: MapDefinition, spawnId: string): SpawnPointDefinition {
  const spawnPoint = map.spawnPoints.find((entry) => entry.id === spawnId);
  if (!spawnPoint) {
    failSchema(
      "worldRuntime.currentSpawnId",
      `references missing spawn "${spawnId}" on map "${map.id}"`,
    );
  }

  return spawnPoint;
}

function isBlocked(map: MapDefinition, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= map.width || y >= map.height) {
    return true;
  }

  const index = y * map.width + x;
  return map.collisionLayers.some((layer) => (layer.blocked[index] ?? 0) !== 0);
}

function findPortalAt(map: MapDefinition, x: number, y: number): PortalDefinition | undefined {
  return map.portals.find((portal) => (
    x >= portal.x
    && x < portal.x + portal.width
    && y >= portal.y
    && y < portal.y + portal.height
  ));
}

function createStateFromSpawn(
  map: MapDefinition,
  spawnPoint: SpawnPointDefinition,
): WorldRuntimeState {
  return {
    currentMapId: map.id,
    currentSpawnId: spawnPoint.id,
    playerX: spawnPoint.x,
    playerY: spawnPoint.y,
    facing: spawnPoint.facing,
  };
}

export function createInitialWorldState(database: ContentDatabase): WorldRuntimeState {
  const map = database.maps[0];
  if (!map) {
    failSchema("maps", "at least one map is required for world runtime");
  }

  const spawnPoint = map.spawnPoints[0];
  if (!spawnPoint) {
    failSchema(`maps.${map.id}.spawnPoints`, "at least one spawn point is required");
  }

  return createStateFromSpawn(map, spawnPoint);
}

export class WorldRuntime {
  private state: WorldRuntimeState;

  constructor(
    private readonly database: ContentDatabase,
    initialState = createInitialWorldState(database),
  ) {
    this.state = { ...initialState };
    this.assertState();
  }

  getState(): WorldRuntimeState {
    return { ...this.state };
  }

  getCurrentMap(): MapDefinition {
    return getMapById(this.database, this.state.currentMapId);
  }

  move(direction: Facing): WorldMoveResult {
    const currentMap = this.getCurrentMap();
    const nextX = this.state.playerX + (direction === "left" ? -1 : direction === "right" ? 1 : 0);
    const nextY = this.state.playerY + (direction === "up" ? -1 : direction === "down" ? 1 : 0);

    this.state = {
      ...this.state,
      facing: direction,
    };

    if (isBlocked(currentMap, nextX, nextY)) {
      return {
        type: "blocked",
        state: this.getState(),
      };
    }

    this.state = {
      ...this.state,
      playerX: nextX,
      playerY: nextY,
    };

    const portal = findPortalAt(currentMap, nextX, nextY);
    if (!portal) {
      return {
        type: "moved",
        state: this.getState(),
      };
    }

    this.setSpawn(portal.targetMapId, portal.targetSpawnId);
    return {
      type: "portal",
      portal,
      state: this.getState(),
    };
  }

  setSpawn(mapId: string, spawnId: string): WorldRuntimeState {
    const map = getMapById(this.database, mapId);
    const spawnPoint = getSpawnPoint(map, spawnId);
    this.state = createStateFromSpawn(map, spawnPoint);
    return this.getState();
  }

  private assertState(): void {
    const map = this.getCurrentMap();
    getSpawnPoint(map, this.state.currentSpawnId);
    if (
      this.state.playerX < 0
      || this.state.playerY < 0
      || this.state.playerX >= map.width
      || this.state.playerY >= map.height
    ) {
      failSchema(
        "worldRuntime.playerPosition",
        `player position (${this.state.playerX}, ${this.state.playerY}) is outside map "${map.id}"`,
      );
    }

    if (isBlocked(map, this.state.playerX, this.state.playerY)) {
      failSchema(
        "worldRuntime.playerPosition",
        `player position (${this.state.playerX}, ${this.state.playerY}) is blocked on map "${map.id}"`,
      );
    }
  }
}
