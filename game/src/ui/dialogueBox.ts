import Phaser from "phaser";
import type { DialogueSessionView } from "@/ui/dialogueSession";

export class DialogueBox {
  private readonly overlay?: HTMLDivElement;

  private readonly speakerText?: HTMLDivElement;

  private readonly bodyText?: HTMLDivElement;

  private readonly promptText?: HTMLDivElement;

  constructor(scene: Phaser.Scene) {
    const parent = scene.game.canvas.parentElement;
    if (parent && typeof document !== "undefined") {
      // Use a DOM overlay for dialogue text because Phaser text objects were not
      // rendering reliably in the user's environment.
      // 使用 DOM overlay 显示对话文本，因为在当前用户环境中 Phaser 文本对象渲染不稳定。
      this.overlay = document.createElement("div");
      this.overlay.style.position = "fixed";
      this.overlay.style.left = "50%";
      this.overlay.style.bottom = "24px";
      this.overlay.style.transform = "translateX(-50%)";
      this.overlay.style.width = "min(92vw, 600px)";
      this.overlay.style.minHeight = "112px";
      this.overlay.style.display = "none";
      this.overlay.style.pointerEvents = "none";
      this.overlay.style.zIndex = "99999";
      this.overlay.style.padding = "10px 18px";
      this.overlay.style.boxSizing = "border-box";
      this.overlay.style.fontFamily = "monospace";
      this.overlay.style.background = "rgba(15, 23, 42, 0.94)";
      this.overlay.style.border = "2px solid #eab308";
      this.overlay.style.borderRadius = "8px";
      this.overlay.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.35)";

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
      document.body.appendChild(this.overlay);

      scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        this.overlay?.remove();
      });
      scene.events.once(Phaser.Scenes.Events.DESTROY, () => {
        this.overlay?.remove();
      });
    }
  }

  show(view: DialogueSessionView): void {
    const fallbackText = view.cue.text;
    const visibleText = view.visibleText.length > 0 ? view.visibleText : fallbackText;

    if (this.overlay && this.speakerText && this.bodyText && this.promptText) {
      this.speakerText.textContent = view.cue.speakerName;
      this.bodyText.textContent = visibleText;
      this.promptText.textContent = view.isLineComplete ? "Enter" : "Skip";
      this.overlay.style.display = "block";
    }
  }

  hide(): void {
    if (this.overlay && this.speakerText && this.bodyText && this.promptText) {
      this.overlay.style.display = "none";
      this.speakerText.textContent = "";
      this.bodyText.textContent = "";
      this.promptText.textContent = "";
    }
  }
}
