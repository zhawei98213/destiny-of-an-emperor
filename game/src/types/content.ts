export type FlagMap = Record<string, boolean>;

export interface DialogueEvent {
  type: "dialogue";
  speaker: string;
  text: string;
}

export interface SetFlagEvent {
  type: "setFlag";
  flag: string;
  value: boolean;
}

export interface EndEvent {
  type: "end";
}

export type EventCommand = DialogueEvent | SetFlagEvent | EndEvent;

export interface WorldActorDefinition {
  id: string;
  name: string;
  x: number;
  y: number;
}

export interface WorldMapDefinition {
  id: string;
  name: string;
  width: number;
  height: number;
  actors: WorldActorDefinition[];
}

export interface GameContent {
  meta: {
    id: string;
    title: string;
    version: number;
  };
  world: {
    startScene: string;
    map: WorldMapDefinition;
  };
  events: {
    intro: EventCommand[];
  };
}
