import type {
  BattleRequest,
  BattleResult,
  ContentDatabase,
  EnemyDefinition,
  InventoryEntry,
  PartyMemberDefinition,
  PartyMemberState,
} from "@/types/content";
import type { GameStateSnapshot } from "@/systems/gameStateRuntime";

export type BattleUnitSide = "ally" | "enemy";

export interface BattleUnit {
  unitId: string;
  definitionId: string;
  side: BattleUnitSide;
  name: string;
  level: number;
  currentHp: number;
  maxHp: number;
  currentMp: number;
  maxMp: number;
  attack: number;
  defense: number;
  speed: number;
  skillIds: string[];
  statusIds: string[];
  formationSlot: number;
  rewardGold: number;
  rewardExperience: number;
  dropItems: InventoryEntry[];
}

export interface BattleState {
  request: BattleRequest;
  units: BattleUnit[];
  turnOrder: string[];
  turnIndex: number;
  log: string[];
  outcome?: BattleResult;
}

export interface BattleActionResult {
  state: BattleState;
  actorId?: string;
  targetId?: string;
  damage?: number;
  defeatedUnitId?: string;
  outcome?: BattleResult;
}

export function createBattleState(
  database: ContentDatabase,
  snapshot: GameStateSnapshot,
  request: BattleRequest,
): BattleState {
  const battleGroup = database.battleGroups.find((entry) => entry.id === request.battleGroupId);
  if (!battleGroup) {
    throw new Error(`BattleRuntime could not find battle group "${request.battleGroupId}".`);
  }

  const allyUnits = snapshot.partyMemberIds.map((memberId, index) => {
    const member = database.partyMembers.find((entry) => entry.id === memberId);
    if (!member) {
      throw new Error(`BattleRuntime could not find party member "${memberId}".`);
    }

    return createAllyUnit(member, snapshot.partyStates[memberId], index);
  });

  const enemyUnits = battleGroup.enemyIds.map((enemyId, index) => {
    const enemy = database.enemies.find((entry) => entry.id === enemyId);
    if (!enemy) {
      throw new Error(`BattleRuntime could not find enemy "${enemyId}".`);
    }

    return createEnemyUnit(enemy, index);
  });

  const units = [...allyUnits, ...enemyUnits];
  return {
    request,
    units,
    turnOrder: buildTurnOrder(units),
    turnIndex: 0,
    log: [
      `Battle Start: ${battleGroup.name}`,
      `战斗开始：${battleGroup.name}`,
    ],
  };
}

export function getCurrentActor(state: BattleState): BattleUnit | undefined {
  const currentUnitId = state.turnOrder[state.turnIndex];
  if (!currentUnitId) {
    return undefined;
  }

  const actor = state.units.find((unit) => unit.unitId === currentUnitId);
  if (!actor || actor.currentHp <= 0) {
    return getNextLivingActor(state);
  }

  return actor;
}

export function runAttackTurn(state: BattleState): BattleActionResult {
  if (state.outcome) {
    return { state, outcome: state.outcome };
  }

  const actor = getCurrentActor(state);
  if (!actor) {
    const finalizedState = finalizeBattle(state, "defeat");
    return {
      state: finalizedState,
      outcome: finalizedState.outcome,
    };
  }

  const target = findFirstLivingTarget(state.units, actor.side === "ally" ? "enemy" : "ally");
  if (!target) {
    const outcome = actor.side === "ally" ? "victory" : "defeat";
    const finalizedState = finalizeBattle(state, outcome);
    return {
      state: finalizedState,
      actorId: actor.unitId,
      outcome: finalizedState.outcome,
    };
  }

  const damage = calculateAttackDamage(actor, target);
  const nextUnits = state.units.map((unit) => {
    if (unit.unitId !== target.unitId) {
      return unit;
    }

    return {
      ...unit,
      currentHp: Math.max(0, unit.currentHp - damage),
    };
  });
  const updatedTarget = nextUnits.find((unit) => unit.unitId === target.unitId);
  const nextLog = [
    ...state.log,
    `${actor.name} hits ${target.name} for ${damage} damage.`,
    `${actor.name} 对 ${target.name} 造成了 ${damage} 点伤害。`,
  ];

  if (updatedTarget && updatedTarget.currentHp === 0) {
    nextLog.push(`${target.name} is defeated.`);
    nextLog.push(`${target.name} 被击倒了。`);
  }

  const nextState = advanceTurn({
    ...state,
    units: nextUnits,
    log: nextLog,
  });
  const winningSide = resolveWinningSide(nextState.units);
  const finalizedState = winningSide
    ? finalizeBattle(nextState, winningSide === "ally" ? "victory" : "defeat")
    : nextState;

  return {
    state: finalizedState,
    actorId: actor.unitId,
    targetId: target.unitId,
    damage,
    defeatedUnitId: updatedTarget?.currentHp === 0 ? target.unitId : undefined,
    outcome: finalizedState.outcome,
  };
}

export function findFirstLivingTarget(units: BattleUnit[], side: BattleUnitSide): BattleUnit | undefined {
  return units.find((unit) => unit.side === side && unit.currentHp > 0);
}

export function calculateAttackDamage(actor: BattleUnit, target: BattleUnit): number {
  return Math.max(1, actor.attack - Math.floor(target.defense / 2));
}

function createAllyUnit(
  member: PartyMemberDefinition,
  runtimeState: PartyMemberState | undefined,
  index: number,
): BattleUnit {
  return {
    unitId: `ally:${member.id}`,
    definitionId: member.id,
    side: "ally",
    name: member.name,
    level: runtimeState?.level ?? member.level,
    currentHp: runtimeState?.currentHp ?? member.baseStats.maxHp,
    maxHp: member.baseStats.maxHp,
    currentMp: runtimeState?.currentMp ?? member.baseStats.maxMp,
    maxMp: member.baseStats.maxMp,
    attack: member.baseStats.attack,
    defense: member.baseStats.defense,
    speed: member.baseStats.speed,
    skillIds: [...member.skills],
    statusIds: [...(runtimeState?.statusIds ?? [])],
    formationSlot: runtimeState?.formationSlot ?? index,
    rewardGold: 0,
    rewardExperience: 0,
    dropItems: [],
  };
}

function createEnemyUnit(enemy: EnemyDefinition, index: number): BattleUnit {
  return {
    unitId: `enemy:${enemy.id}:${index}`,
    definitionId: enemy.id,
    side: "enemy",
    name: enemy.name,
    level: enemy.level,
    currentHp: enemy.baseStats.maxHp,
    maxHp: enemy.baseStats.maxHp,
    currentMp: enemy.baseStats.maxMp,
    maxMp: enemy.baseStats.maxMp,
    attack: enemy.baseStats.attack,
    defense: enemy.baseStats.defense,
    speed: enemy.baseStats.speed,
    skillIds: [...enemy.skills],
    statusIds: [],
    formationSlot: index,
    rewardGold: enemy.rewardGold,
    rewardExperience: enemy.rewardExperience,
    dropItems: enemy.dropItems
      .filter((drop) => drop.chance >= 1)
      .map((drop) => ({ itemId: drop.itemId, quantity: drop.quantity })),
  };
}

function buildTurnOrder(units: BattleUnit[]): string[] {
  return [...units]
    .sort((left, right) => {
      if (right.speed !== left.speed) {
        return right.speed - left.speed;
      }

      if (left.side !== right.side) {
        return left.side === "ally" ? -1 : 1;
      }

      return left.formationSlot - right.formationSlot;
    })
    .map((unit) => unit.unitId);
}

function advanceTurn(state: BattleState): BattleState {
  const livingTurnOrder = state.turnOrder.filter((unitId) =>
    state.units.some((unit) => unit.unitId === unitId && unit.currentHp > 0),
  );
  if (livingTurnOrder.length === 0) {
    return {
      ...state,
      turnOrder: [],
      turnIndex: 0,
    };
  }

  return {
    ...state,
    turnOrder: livingTurnOrder,
    turnIndex: (state.turnIndex + 1) % livingTurnOrder.length,
  };
}

function getNextLivingActor(state: BattleState): BattleUnit | undefined {
  const livingTurnOrder = state.turnOrder.filter((unitId) =>
    state.units.some((unit) => unit.unitId === unitId && unit.currentHp > 0),
  );
  return livingTurnOrder.length > 0
    ? state.units.find((unit) => unit.unitId === livingTurnOrder[0])
    : undefined;
}

function resolveWinningSide(units: BattleUnit[]): BattleUnitSide | undefined {
  const hasLivingAlly = units.some((unit) => unit.side === "ally" && unit.currentHp > 0);
  const hasLivingEnemy = units.some((unit) => unit.side === "enemy" && unit.currentHp > 0);

  if (hasLivingAlly && hasLivingEnemy) {
    return undefined;
  }

  return hasLivingAlly ? "ally" : "enemy";
}

function finalizeBattle(state: BattleState, outcome: BattleResult["outcome"]): BattleState {
  const rewards = outcome === "victory"
    ? collectRewards(state.units)
    : { experience: 0, gold: 0, items: [] };

  return {
    ...state,
    outcome: {
      battleGroupId: state.request.battleGroupId,
      outcome,
      rewards,
    },
    log: [
      ...state.log,
      outcome === "victory" ? "Victory!" : "Defeat...",
      outcome === "victory" ? "战斗胜利！" : "战斗失败……",
    ],
  };
}

function collectRewards(units: BattleUnit[]): BattleResult["rewards"] {
  const defeatedEnemies = units.filter((unit) => unit.side === "enemy" && unit.currentHp === 0);
  const itemMap = new Map<string, number>();
  defeatedEnemies.forEach((enemy) => {
    enemy.dropItems.forEach((item) => {
      itemMap.set(item.itemId, (itemMap.get(item.itemId) ?? 0) + item.quantity);
    });
  });

  return {
    experience: defeatedEnemies.reduce((total, enemy) => total + enemy.rewardExperience, 0),
    gold: defeatedEnemies.reduce((total, enemy) => total + enemy.rewardGold, 0),
    items: [...itemMap.entries()].map(([itemId, quantity]) => ({ itemId, quantity })),
  };
}
