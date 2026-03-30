import type { Facing, InventoryEntry } from "@/types/content";
import type { RegressionSceneId } from "../../tests/regression/goldenCaseSchema";

export interface BattleParityDamageEntry {
  actorId: string;
  targetId: string;
  damage: number;
}

export interface BattleParityRewardExpectation {
  experience: number;
  gold: number;
  items: InventoryEntry[];
}

export interface BattleParityTriggerExpectation {
  mapId: string;
  triggerId: string;
  encounterTableId?: string;
  battleGroupId: string;
}

export interface BattleParityWorldReturnExpectation {
  mapId: string;
  spawnId: string;
  playerX: number;
  playerY: number;
  facing: Facing;
}

export interface BattleParitySettlementExpectation {
  sceneFlow: RegressionSceneId[];
  activeScene: RegressionSceneId;
  battleOutcome: "victory" | "defeat";
}

export interface BattleParityCase {
  id: string;
  chapterId: string;
  name: string;
  goldenCaseId: string;
  expected: {
    battleGroupId: string;
    enemyIds: string[];
    openingTurnOrder: string[];
    damageSequence: BattleParityDamageEntry[];
    rewards: BattleParityRewardExpectation;
    outcome: "victory" | "defeat";
    trigger: BattleParityTriggerExpectation;
    worldReturn: BattleParityWorldReturnExpectation;
    settlement: BattleParitySettlementExpectation;
  };
}

export interface BattleParitySuite {
  version: number;
  cases: BattleParityCase[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function expectRecord(value: unknown, path: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error(`[battle-parity] ${path}: expected object`);
  }

  return value;
}

function expectString(value: unknown, path: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`[battle-parity] ${path}: expected non-empty string`);
  }

  return value;
}

function expectNumber(value: unknown, path: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`[battle-parity] ${path}: expected finite number`);
  }

  return value;
}

function expectStringArray(value: unknown, path: string): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`[battle-parity] ${path}: expected string array`);
  }

  return value.map((entry, index) => expectString(entry, `${path}[${index}]`));
}

function expectFacing(value: unknown, path: string): Facing {
  if (value !== "up" && value !== "down" && value !== "left" && value !== "right") {
    throw new Error(`[battle-parity] ${path}: expected up/down/left/right`);
  }

  return value;
}

function expectSceneId(value: unknown, path: string): RegressionSceneId {
  if (value !== "WorldScene" && value !== "BattleScene") {
    throw new Error(`[battle-parity] ${path}: expected WorldScene or BattleScene`);
  }

  return value;
}

function validateInventoryEntries(value: unknown, path: string): InventoryEntry[] {
  if (!Array.isArray(value)) {
    throw new Error(`[battle-parity] ${path}: expected array`);
  }

  return value.map((entry, index) => {
    const record = expectRecord(entry, `${path}[${index}]`);
    return {
      itemId: expectString(record.itemId, `${path}[${index}].itemId`),
      quantity: expectNumber(record.quantity, `${path}[${index}].quantity`),
    };
  });
}

function validateDamageSequence(value: unknown, path: string): BattleParityDamageEntry[] {
  if (!Array.isArray(value)) {
    throw new Error(`[battle-parity] ${path}: expected array`);
  }

  return value.map((entry, index) => {
    const record = expectRecord(entry, `${path}[${index}]`);
    return {
      actorId: expectString(record.actorId, `${path}[${index}].actorId`),
      targetId: expectString(record.targetId, `${path}[${index}].targetId`),
      damage: expectNumber(record.damage, `${path}[${index}].damage`),
    };
  });
}

function validateCase(value: unknown, path: string): BattleParityCase {
  const record = expectRecord(value, path);
  const expected = expectRecord(record.expected, `${path}.expected`);
  const rewards = expectRecord(expected.rewards, `${path}.expected.rewards`);
  const trigger = expectRecord(expected.trigger, `${path}.expected.trigger`);
  const worldReturn = expectRecord(expected.worldReturn, `${path}.expected.worldReturn`);
  const settlement = expectRecord(expected.settlement, `${path}.expected.settlement`);
  const outcome = expectString(expected.outcome, `${path}.expected.outcome`);
  if (outcome !== "victory" && outcome !== "defeat") {
    throw new Error(`[battle-parity] ${path}.expected.outcome: expected victory or defeat`);
  }
  const battleOutcome = expectString(settlement.battleOutcome, `${path}.expected.settlement.battleOutcome`);
  if (battleOutcome !== "victory" && battleOutcome !== "defeat") {
    throw new Error(`[battle-parity] ${path}.expected.settlement.battleOutcome: expected victory or defeat`);
  }

  return {
    id: expectString(record.id, `${path}.id`),
    chapterId: expectString(record.chapterId, `${path}.chapterId`),
    name: expectString(record.name, `${path}.name`),
    goldenCaseId: expectString(record.goldenCaseId, `${path}.goldenCaseId`),
    expected: {
      battleGroupId: expectString(expected.battleGroupId, `${path}.expected.battleGroupId`),
      enemyIds: expectStringArray(expected.enemyIds, `${path}.expected.enemyIds`),
      openingTurnOrder: expectStringArray(expected.openingTurnOrder, `${path}.expected.openingTurnOrder`),
      damageSequence: validateDamageSequence(expected.damageSequence, `${path}.expected.damageSequence`),
      rewards: {
        experience: expectNumber(rewards.experience, `${path}.expected.rewards.experience`),
        gold: expectNumber(rewards.gold, `${path}.expected.rewards.gold`),
        items: validateInventoryEntries(
          rewards.items,
          `${path}.expected.rewards.items`,
        ),
      },
      outcome,
      trigger: {
        mapId: expectString(trigger.mapId, `${path}.expected.trigger.mapId`),
        triggerId: expectString(trigger.triggerId, `${path}.expected.trigger.triggerId`),
        encounterTableId: trigger.encounterTableId === undefined
          ? undefined
          : expectString(trigger.encounterTableId, `${path}.expected.trigger.encounterTableId`),
        battleGroupId: expectString(trigger.battleGroupId, `${path}.expected.trigger.battleGroupId`),
      },
      worldReturn: {
        mapId: expectString(worldReturn.mapId, `${path}.expected.worldReturn.mapId`),
        spawnId: expectString(worldReturn.spawnId, `${path}.expected.worldReturn.spawnId`),
        playerX: expectNumber(worldReturn.playerX, `${path}.expected.worldReturn.playerX`),
        playerY: expectNumber(worldReturn.playerY, `${path}.expected.worldReturn.playerY`),
        facing: expectFacing(worldReturn.facing, `${path}.expected.worldReturn.facing`),
      },
      settlement: {
        sceneFlow: Array.isArray(settlement.sceneFlow)
          ? settlement.sceneFlow.map((entry, index) => expectSceneId(entry, `${path}.expected.settlement.sceneFlow[${index}]`))
          : (() => {
            throw new Error(`[battle-parity] ${path}.expected.settlement.sceneFlow: expected array`);
          })(),
        activeScene: expectSceneId(settlement.activeScene, `${path}.expected.settlement.activeScene`),
        battleOutcome,
      },
    },
  };
}

export function validateBattleParitySuite(value: unknown): BattleParitySuite {
  const record = expectRecord(value, "suite");
  const version = expectNumber(record.version, "suite.version");
  if (!Array.isArray(record.cases)) {
    throw new Error("[battle-parity] suite.cases: expected array");
  }

  return {
    version,
    cases: record.cases.map((entry, index) => validateCase(entry, `suite.cases[${index}]`)),
  };
}
