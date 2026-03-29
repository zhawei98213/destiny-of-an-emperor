import type { GridPoint } from "@/world/worldInteraction";
import type { MapDefinition, TriggerDefinition } from "@/types/content";

function isPointInsideTrigger(point: GridPoint, trigger: TriggerDefinition): boolean {
  const x = trigger.x ?? 0;
  const y = trigger.y ?? 0;
  const width = trigger.width ?? 1;
  const height = trigger.height ?? 1;

  return (
    point.x >= x
    && point.x < x + width
    && point.y >= y
    && point.y < y + height
  );
}

export function findNpcInteractionTrigger(
  map: MapDefinition,
  npcId: string,
): TriggerDefinition | undefined {
  return map.triggers.find((trigger) => trigger.kind === "npcInteraction" && trigger.npcId === npcId);
}

export function findTriggersAtPoint(
  map: MapDefinition,
  point: GridPoint,
): TriggerDefinition[] {
  return map.triggers.filter((trigger) => (
    (trigger.kind === "tile" || trigger.kind === "region")
    && Boolean(trigger.eventId)
    && isPointInsideTrigger(point, trigger)
  ));
}

export function findEncounterTriggersAtPoint(
  map: MapDefinition,
  point: GridPoint,
): TriggerDefinition[] {
  return map.triggers.filter((trigger) => (
    trigger.kind === "region"
    && Boolean(trigger.encounterTableId)
    && isPointInsideTrigger(point, trigger)
  ));
}
