export type Facing = "up" | "down" | "left" | "right";
export type ItemKind = "consumable" | "equipment" | "key";
export type SkillTarget = "ally" | "enemy" | "self" | "all-enemies";
export type ContentPackKind = "manual" | "generated";
export type NpcBehavior = "idle";
export type TriggerKind = "npcInteraction" | "tile" | "region";
export type AssetState = "placeholder" | "imported" | "locked";
export type AssetCategory =
  | "tileset"
  | "character-sprite"
  | "npc-sprite"
  | "enemy-sprite"
  | "ui-panel"
  | "portrait"
  | "icon"
  | "audio";
export type FlagStateMap = Record<string, boolean>;
export type QuestStateMap = Record<string, string>;
export type ShopStateMap = Record<string, { visited: boolean }>;
export type PartyStateMap = Record<string, PartyMemberState>;

export interface WorldPlaceholderAssetResource {
  kind: "world-placeholder";
  fillColor: string;
  strokeColor: string;
  accentColor: string;
}

export interface PanelStyleAssetResource {
  kind: "panel-style";
  backgroundColor: string;
  borderColor: string;
  titleColor: string;
  bodyColor: string;
  accentColor: string;
}

export interface PortraitPlaceholderAssetResource {
  kind: "portrait-placeholder";
  backgroundColor: string;
  borderColor: string;
  textColor: string;
}

export interface SpriteFrameAssetResource {
  kind: "sprite-frame";
  sheetId: string;
  frameId: string;
  imagePath?: string;
}

export interface AudioRefAssetResource {
  kind: "audio-ref";
  path?: string;
}

export type AssetResource =
  | WorldPlaceholderAssetResource
  | PanelStyleAssetResource
  | PortraitPlaceholderAssetResource
  | SpriteFrameAssetResource
  | AudioRefAssetResource;

export interface AssetBindingDefinition {
  key: string;
  category: AssetCategory;
  state: AssetState;
  fallbackKey?: string;
  resource: AssetResource;
}

export interface AssetOverrideDefinition {
  chapterId: string;
  mapIds: string[];
  assetBindings: AssetBindingDefinition[];
}

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
  kind: TriggerKind;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  npcId?: string;
  eventId?: string;
  encounterTableId?: string;
  once: boolean;
}

export interface EncounterEntryDefinition {
  id: string;
  battleGroupId: string;
  weight: number;
  requiredFlagId?: string;
  blockedFlagId?: string;
}

export interface EncounterTableDefinition {
  id: string;
  name: string;
  stepInterval: number;
  chance: number;
  entries: EncounterEntryDefinition[];
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
  value?: boolean;
}

export interface ClearFlagEventStep {
  type: "clearFlag";
  flagId: string;
}

export interface IfFlagEventStep {
  type: "ifFlag";
  flagId: string;
  steps: EventStep[];
}

export interface IfNotFlagEventStep {
  type: "ifNotFlag";
  flagId: string;
  steps: EventStep[];
}

export interface IfHasItemEventStep {
  type: "ifHasItem";
  itemId: string;
  quantity?: number;
  steps: EventStep[];
}

export interface WarpEventStep {
  type: "warp";
  targetMapId: string;
  targetSpawnId: string;
}

export interface GiveItemEventStep {
  type: "giveItem";
  itemId: string;
  quantity: number;
}

export interface RemoveItemEventStep {
  type: "removeItem";
  itemId: string;
  quantity: number;
}

export interface JoinPartyEventStep {
  type: "joinParty";
  partyMemberId: string;
}

export interface OpenShopEventStep {
  type: "openShop";
  shopId: string;
}

export interface RestorePartyEventStep {
  type: "restoreParty";
}

export interface StartBattleEventStep {
  type: "startBattle";
  battleGroupId: string;
}

export interface PlaySfxEventStep {
  type: "playSfx";
  sfxId: string;
}

export interface EndEventStep {
  type: "end";
}

export type EventStep =
  | DialogueEventStep
  | SetFlagEventStep
  | ClearFlagEventStep
  | IfFlagEventStep
  | IfNotFlagEventStep
  | IfHasItemEventStep
  | WarpEventStep
  | GiveItemEventStep
  | RemoveItemEventStep
  | JoinPartyEventStep
  | OpenShopEventStep
  | RestorePartyEventStep
  | StartBattleEventStep
  | PlaySfxEventStep
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
  dropItems: EnemyDropDefinition[];
  baseStats: UnitStats;
}

export interface BattleGroupDefinition {
  id: string;
  name: string;
  enemyIds: string[];
}

export interface EnemyDropDefinition {
  itemId: string;
  quantity: number;
  chance: number;
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

export interface PartyMemberState {
  memberId: string;
  level: number;
  experience: number;
  currentHp: number;
  currentMp: number;
  statusIds: string[];
  formationSlot: number;
}

export interface SaveWorldState {
  mapId: string;
  spawnPointId: string;
  playerX: number;
  playerY: number;
  facing: Facing;
  stepCount: number;
}

export interface SaveMetaState {
  createdByVersion: number;
  migratedFromVersion?: number;
  migrationCount: number;
}

export interface SaveData {
  version: number;
  slot: string;
  world: SaveWorldState;
  partyMemberIds: string[];
  partyStates: PartyStateMap;
  flags: FlagStateMap;
  questStates: QuestStateMap;
  inventory: InventoryState;
  chapterId?: string;
  shopStates: ShopStateMap;
  consumedTriggerIds: string[];
  saveMeta: SaveMetaState;
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
  encounterTables: EncounterTableDefinition[];
  assetBindings?: AssetBindingDefinition[];
  assetOverrides?: AssetOverrideDefinition[];
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
  encounterTables: EncounterTableDefinition[];
  assetBindings?: AssetBindingDefinition[];
  assetOverrides?: AssetOverrideDefinition[];
}

export interface BattleRequest {
  battleGroupId: string;
  triggerId?: string;
  originMapId: string;
}

export interface BattleReward {
  experience: number;
  gold: number;
  items: InventoryEntry[];
}

export interface BattleResult {
  battleGroupId: string;
  outcome: "victory" | "defeat";
  partyStates: PartyStateMap;
  rewards: BattleReward;
}
