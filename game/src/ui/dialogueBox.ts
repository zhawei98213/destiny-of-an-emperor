import Phaser from "phaser";
import type { DialogueSessionView } from "@/ui/dialogueSession";

export class DialogueBox {
  private static readonly BackgroundDepth = 1000;

  private readonly background: Phaser.GameObjects.Rectangle;

  private readonly overlay?: HTMLDivElement;

  private readonly speakerText?: HTMLDivElement;

  private readonly bodyText?: HTMLDivElement;

  private readonly promptText?: HTMLDivElement;

  constructor(scene: Phaser.Scene) {
    this.background = scene.add.rectangle(320, 298, 600, 112, 0x0f172a, 0.94)
      .setStrokeStyle(2, 0xeab308)
      .setScrollFactor(0)
      .setDepth(DialogueBox.BackgroundDepth)
      .setVisible(false);

    const parent = scene.game.canvas.parentElement;
    if (parent && typeof document !== "undefined") {
      if (!parent.style.position) {
        parent.style.position = "relative";
      }

      this.overlay = document.createElement("div");
      this.overlay.style.position = "absolute";
      this.overlay.style.left = "20px";
      this.overlay.style.right = "20px";
      this.overlay.style.bottom = "14px";
      this.overlay.style.height = "104px";
      this.overlay.style.display = "none";
      this.overlay.style.pointerEvents = "none";
      this.overlay.style.zIndex = "20";
      this.overlay.style.padding = "10px 18px";
      this.overlay.style.boxSizing = "border-box";
      this.overlay.style.fontFamily = "monospace";

      this.speakerText = document.createElement("div");
      this.speakerText.style.color = "#fde68a";
      this.speakerText.style.fontSize = "14px";
      this.speakerText.style.fontWeight = "700";
      this.speakerText.style.marginBottom = "8px";

      this.bodyText = document.createElement("div");
      this.bodyText.style.color = "#f8fafc";
      this.bodyText.style.fontSize = "16px";
      this.bodyText.style.lineHeight = "1.45";
      this.bodyText.style.whiteSpace = "pre-wrap";

      this.promptText = document.createElement("div");
      this.promptText.style.position = "absolute";
      this.promptText.style.right = "18px";
      this.promptText.style.bottom = "12px";
      this.promptText.style.color = "#93c5fd";
      this.promptText.style.fontSize = "12px";

      this.overlay.appendChild(this.speakerText);
      this.overlay.appendChild(this.bodyText);
      this.overlay.appendChild(this.promptText);
      parent.appendChild(this.overlay);

      scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        this.overlay?.remove();
      });
      scene.events.once(Phaser.Scenes.Events.DESTROY, () => {
        this.overlay?.remove();
      });
    }
  }

  show(view: DialogueSessionView): void {
    const fallbackText = view.cue.text.length > 0 ? view.cue.text.slice(0, 1) : "";
    const visibleText = view.visibleText.length > 0 ? view.visibleText : fallbackText;

    this.background.setVisible(true);

    if (this.overlay && this.speakerText && this.bodyText && this.promptText) {
      this.speakerText.textContent = view.cue.speakerName;
      this.bodyText.textContent = visibleText;
      this.promptText.textContent = view.isLineComplete ? "Enter" : "Skip";
      this.overlay.style.display = "block";
    }
  }

  hide(): void {
    this.background.setVisible(false);

    if (this.overlay && this.speakerText && this.bodyText && this.promptText) {
      this.overlay.style.display = "none";
      this.speakerText.textContent = "";
      this.bodyText.textContent = "";
      this.promptText.textContent = "";
    }
  }
}
