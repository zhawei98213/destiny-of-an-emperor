import type { DialogueCue } from "@/types/content";

export interface DialogueSessionView {
  cue: DialogueCue;
  visibleText: string;
  isLineComplete: boolean;
  isComplete: boolean;
}

export class DialogueSession {
  private cueIndex = 0;

  private visibleCharacterCount = 0;

  private completed = false;

  constructor(
    private readonly cues: DialogueCue[],
    private readonly charactersPerSecond = 48,
  ) {}

  isActive(): boolean {
    return !this.completed && this.cues.length > 0;
  }

  update(deltaMs: number, accelerated: boolean): DialogueSessionView | undefined {
    if (!this.isActive()) {
      return undefined;
    }

    const cue = this.cues[this.cueIndex];
    if (!cue) {
      this.completed = true;
      return undefined;
    }

    const speedMultiplier = accelerated ? 3 : 1;
    const nextVisibleCount = this.visibleCharacterCount + ((deltaMs / 1000) * this.charactersPerSecond * speedMultiplier);
    this.visibleCharacterCount = Math.min(cue.text.length, Math.floor(nextVisibleCount));

    return this.getView();
  }

  advance(): DialogueSessionView | undefined {
    if (!this.isActive()) {
      return undefined;
    }

    const cue = this.cues[this.cueIndex];
    if (!cue) {
      this.completed = true;
      return undefined;
    }

    if (this.visibleCharacterCount < cue.text.length) {
      this.visibleCharacterCount = cue.text.length;
      return this.getView();
    }

    if (this.cueIndex < this.cues.length - 1) {
      this.cueIndex += 1;
      this.visibleCharacterCount = 0;
      return this.getView();
    }

    this.completed = true;
    return this.getView();
  }

  getView(): DialogueSessionView | undefined {
    const cue = this.cues[this.cueIndex];
    if (!cue) {
      return undefined;
    }

    return {
      cue,
      visibleText: cue.text.slice(0, this.visibleCharacterCount),
      isLineComplete: this.visibleCharacterCount >= cue.text.length,
      isComplete: this.completed,
    };
  }
}
