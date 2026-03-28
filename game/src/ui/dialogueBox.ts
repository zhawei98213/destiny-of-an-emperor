import Phaser from "phaser";
import type { DialogueSessionView } from "@/ui/dialogueSession";

export class DialogueBox {
  private static readonly UiDepth = 1000;

  private readonly background: Phaser.GameObjects.Rectangle;

  private readonly speakerText: Phaser.GameObjects.Text;

  private readonly bodyText: Phaser.GameObjects.Text;

  private readonly promptText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.background = scene.add.rectangle(320, 298, 600, 112, 0x0f172a, 0.94)
      .setStrokeStyle(2, 0xeab308)
      .setScrollFactor(0)
      .setDepth(DialogueBox.UiDepth)
      .setVisible(false);

    this.speakerText = scene.add.text(40, 250, "", {
      color: "#fde68a",
      fontFamily: "monospace",
      fontSize: "12px",
    }).setScrollFactor(0).setDepth(DialogueBox.UiDepth).setVisible(false);

    this.bodyText = scene.add.text(40, 272, "", {
      color: "#f8fafc",
      fontFamily: "monospace",
      fontSize: "14px",
      wordWrap: { width: 560 },
      lineSpacing: 6,
    }).setScrollFactor(0).setDepth(DialogueBox.UiDepth).setVisible(false);

    this.promptText = scene.add.text(552, 332, "", {
      color: "#93c5fd",
      fontFamily: "monospace",
      fontSize: "10px",
    }).setScrollFactor(0).setDepth(DialogueBox.UiDepth).setVisible(false);
  }

  show(view: DialogueSessionView): void {
    this.background.setVisible(true);
    this.speakerText.setVisible(true).setText(view.cue.speakerName);
    this.bodyText.setVisible(true).setText(view.visibleText);
    this.promptText.setVisible(true).setText(view.isLineComplete ? "Enter" : "Skip");
  }

  hide(): void {
    this.background.setVisible(false);
    this.speakerText.setVisible(false).setText("");
    this.bodyText.setVisible(false).setText("");
    this.promptText.setVisible(false).setText("");
  }
}
