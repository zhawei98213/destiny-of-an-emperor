export type Facing = "up" | "down" | "left" | "right";
export type ItemKind = "consumable" | "equipment" | "key";
export type SkillTarget = "ally" | "enemy" | "self" | "all-enemies";
export type ContentPackKind = "manual" | "generated";
export type NpcBehavior = "idle";
export type FlagStateMap = Record<string, boolean>;
export type QuestStateMap = Record<string, string>;

export interface TileLayerDefinition {
  id: string;
  name: string;
  width: number;
  height: number;
  tiles: number[];
}

export interface CollisionLayerDefinition {
  id: string;
  name: string;
  width: number;
  height: number;
  blocked: number[];
}

export interface PortalDefinition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  targetMapId: string;
  targetSpawnId: string;
}

export interface SpawnPointDefinition {
  id: string;
  x: number;
  y: number;
  facing: Facing;
}

export interface NpcDefinition {
  id: string;
  name: string;
  x: number;
  y: number;
  sprite: string;
  facing: Facing;
  behavior: NpcBehavior;
  eventId?: string;
  shopId?: string;
}

export interface TriggerDefinition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  eventId: string;
  once: boolean;
}

export interface MapDefinition {
  id: string;
  name: string;
  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;
  tileLayers: TileLayerDefinition[];
  collisionLayers: CollisionLayerDefinition[];
  portals: PortalDefinition[];
  spawnPoints: SpawnPointDefinition[];
  npcs: NpcDefinition[];
  triggers: TriggerDefinition[];
}

export interface DialogueLineDefinition {
  id: string;
  speakerName: string;
  speakerNpcId?: string;
  text: string;
  portraitId?: string;
  soundId?: string;
}

export interface DialogueChoiceOption {
  id: string;
  label: string;
}

export interface DialogueCue {
  id: string;
  speakerName: string;
  speakerNpcId?: string;
  text: string;
  portraitId?: string;
  soundId?: string;
  choices?: DialogueChoiceOption[];
}

export interface DialogueEventStep {
  type: "dialogue";
  lineId: string;
}

export interface SetFlagEventStep {
  type: "setFlag";
  flagId: string;
  value: boolean;
}

export interface OpenShopEventStep {
  type: "openShop";
  shopId: string;
}

export interface StartBattleEventStep {
  type: "startBattle";
  battleGroupId: string;
}

export interface EndEventStep {
  type: "end";
}

export type EventStep =
  | DialogueEventStep
  | SetFlagEventStep
  | OpenShopEventStep
  | StartBattleEventStep
  | EndEventStep;

export interface EventDefinition {
  id: string;
  name: string;
  steps: EventStep[];
}

export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  kind: ItemKind;
  price: number;
}

export interface UnitStats {
  maxHp: number;
  maxMp: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface PartyMemberDefinition {
  id: string;
  name: string;
  className: string;
  level: number;
  skills: string[];
  baseStats: UnitStats;
}

export interface EnemyDefinition {
  id: string;
  name: string;
  level: number;
  skills: string[];
  rewardGold: number;
  rewardExperience: number;
  baseStats: UnitStats;
}

export interface BattleGroupDefinition {
  id: string;
  name: string;
  enemyIds: string[];
}

export interface ShopInventoryEntry {
  itemId: string;
  price?: number;
}

export interface ShopDefinition {
  id: string;
  name: string;
  inventory: ShopInventoryEntry[];
}

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  mpCost: number;
  power: number;
  target: SkillTarget;
}

export interface FlagDefinition {
  id: string;
  defaultValue: boolean;
}

export interface QuestStateDefinition {
  id: string;
  stages: string[];
  initialStage: string;
}

export interface InventoryEntry {
  itemId: string;
  quantity: number;
}

export interface InventoryState {
  gold: number;
  items: InventoryEntry[];
}

export interface SaveData {
  slot: string;
  mapId: string;
  spawnPointId: string;
  partyMemberIds: string[];
  flags: FlagStateMap;
  questStates: QuestStateMap;
  inventory: InventoryState;
}

export interface ContentPackMeta {
  id: string;
  kind: ContentPackKind;
  version: number;
  description: string;
}

export interface ContentPack {
  meta: ContentPackMeta;
  maps: MapDefinition[];
  dialogueLines: DialogueLineDefinition[];
  events: EventDefinition[];
  items: ItemDefinition[];
  partyMembers: PartyMemberDefinition[];
  enemies: EnemyDefinition[];
  battleGroups: BattleGroupDefinition[];
  shops: ShopDefinition[];
  skills: SkillDefinition[];
  flags: FlagDefinition[];
  questStates: QuestStateDefinition[];
}

export interface ContentManifest {
  root: string;
  kind: ContentPackKind;
  files: string[];
}

export interface ContentDatabase {
  packs: ContentPackMeta[];
  maps: MapDefinition[];
  dialogueLines: DialogueLineDefinition[];
  events: EventDefinition[];
  items: ItemDefinition[];
  partyMembers: PartyMemberDefinition[];
  enemies: EnemyDefinition[];
  battleGroups: BattleGroupDefinition[];
  shops: ShopDefinition[];
  skills: SkillDefinition[];
  flags: FlagDefinition[];
  questStates: QuestStateDefinition[];
}
