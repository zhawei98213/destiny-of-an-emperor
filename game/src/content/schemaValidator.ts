import type { EventCommand, GameContent, WorldActorDefinition, WorldMapDefinition } from "@/types/content";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isString = (value: unknown): value is string => typeof value === "string";
const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
const isBoolean = (value: unknown): value is boolean => typeof value === "boolean";

function validateActor(value: unknown): value is WorldActorDefinition {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.name) &&
    isNumber(value.x) &&
    isNumber(value.y)
  );
}

function validateMap(value: unknown): value is WorldMapDefinition {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.name) &&
    isNumber(value.width) &&
    isNumber(value.height) &&
    Array.isArray(value.actors) &&
    value.actors.every(validateActor)
  );
}

function validateEvent(value: unknown): value is EventCommand {
  if (!isRecord(value) || !isString(value.type)) {
    return false;
  }

  switch (value.type) {
    case "dialogue":
      return isString(value.speaker) && isString(value.text);
    case "setFlag":
      return isString(value.flag) && isBoolean(value.value);
    case "end":
      return true;
    default:
      return false;
  }
}

export function validateGameContent(value: unknown): GameContent {
  if (!isRecord(value)) {
    throw new Error("Content root must be an object.");
  }

  const { meta, world, events } = value;

  if (
    !isRecord(meta) ||
    !isString(meta.id) ||
    !isString(meta.title) ||
    !isNumber(meta.version)
  ) {
    throw new Error("Invalid content meta block.");
  }

  if (
    !isRecord(world) ||
    !isString(world.startScene) ||
    !validateMap(world.map)
  ) {
    throw new Error("Invalid world block.");
  }

  if (
    !isRecord(events) ||
    !Array.isArray(events.intro) ||
    !events.intro.every(validateEvent)
  ) {
    throw new Error("Invalid events block.");
  }

  return value as unknown as GameContent;
}
