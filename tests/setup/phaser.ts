import { vi } from "vitest";

class MockScene {
  public readonly sys: { settings: { key: string } };

  public readonly scene = {
    start: () => undefined,
  };

  public readonly cameras = {
    main: {
      setBackgroundColor: () => undefined,
    },
  };

  public readonly add = {
    rectangle: (..._args: unknown[]) => ({
      x: 0,
      y: 0,
      setStrokeStyle: () => undefined,
    }),
    text: (..._args: unknown[]) => ({
      setOrigin: () => undefined,
    }),
  };

  public readonly input = {
    keyboard: {
      once: () => undefined,
      createCursorKeys: () => ({}),
      addKey: () => ({ isDown: false }),
    },
    once: () => undefined,
  };

  public readonly events = {
    on: () => undefined,
  };

  constructor(key: string) {
    this.sys = {
      settings: {
        key,
      },
    };
  }
}

vi.mock("phaser", () => {
  const PhaserMock = {
    AUTO: 0,
    Scene: MockScene,
    Scale: {
      FIT: 1,
      CENTER_BOTH: 2,
    },
    Math: {
      Clamp: (value: number, min: number, max: number) =>
        Math.min(Math.max(value, min), max),
    },
    Input: {
      Keyboard: {
        JustDown: () => false,
      },
    },
  };

  return { default: PhaserMock };
});
