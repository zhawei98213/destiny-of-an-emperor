import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { NES as JsNes } from "jsnes";

const require = createRequire(import.meta.url);
const romPath = process.argv[2] ?? "吞食天地2.nes";
const outPath = process.argv[3] ?? ".omx/visual-reference/capture.ppm";
const manifestPath = process.argv[4] ?? ".omx/visual-reference/manifest.json";
const emulator = process.env.CAPTURE_EMULATOR ?? "nes-emu";
const framesToRun = Number(process.env.CAPTURE_FRAMES ?? 120);

function writeManifest(manifest) {
  mkdirSync(dirname(manifestPath), { recursive: true });
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
}

function countUniqueColors(frameBuffer, limit = 8) {
  const colors = new Set();
  for (const color of frameBuffer) {
    colors.add(color >>> 0);
    if (colors.size > limit) break;
  }
  return colors.size;
}

function writePpm(path, frameBuffer, colorFormat) {
  mkdirSync(dirname(path), { recursive: true });
  const rgb = Buffer.alloc(256 * 240 * 3);
  for (let i = 0; i < 256 * 240; i += 1) {
    const color = frameBuffer[i] >>> 0;
    if (colorFormat === "argb") {
      rgb[i * 3] = (color >> 16) & 0xff;
      rgb[i * 3 + 1] = (color >> 8) & 0xff;
      rgb[i * 3 + 2] = color & 0xff;
    } else {
      rgb[i * 3] = color & 0xff;
      rgb[i * 3 + 1] = (color >> 8) & 0xff;
      rgb[i * 3 + 2] = (color >> 16) & 0xff;
    }
  }
  writeFileSync(path, Buffer.concat([Buffer.from("P6\n256 240\n255\n", "ascii"), rgb]));
}

function runJsnes(romBytes) {
  let lastFrame = null;
  let frameCount = 0;
  const nes = new JsNes({
    onFrame(frameBuffer) {
      frameCount += 1;
      lastFrame = new Uint32Array(frameBuffer);
    },
    onAudioSample() {},
  });
  nes.loadROM(romBytes);
  for (let i = 0; i < framesToRun; i += 1) nes.frame();
  return { lastFrame, frameCount, colorFormat: "bgrx" };
}

function runNesEmu(romBytes) {
  let lastFrame = null;
  let frameCount = 0;
  const NESModule = require("nes-emu");
  const NES = NESModule.default ?? NESModule;
  const nes = new NES((frameBuffer) => {
    frameCount += 1;
    lastFrame = new Uint32Array(frameBuffer);
  }, () => {});
  nes.load(romBytes);
  for (let i = 0; i < framesToRun; i += 1) nes.frame();
  return { lastFrame, frameCount, colorFormat: "argb" };
}

const romBytes = readFileSync(romPath);
const romHash = createHash("sha256").update(romBytes).digest("hex");
const manifestBase = {
  kind: "private-rom-reference-capture",
  emulator: { package: emulator, version: emulator === "nes-emu" ? "1.0.63" : "2.1.0" },
  mapperCompatibility: emulator === "nes-emu" ? "project-local mapper74->MMC3 shim; experimental" : "project-local jsnes mapper74->MMC3 shim; experimental",
  rom: { path: romPath, sha256: romHash },
  payloadPolicy: "capture output is private and must stay under ignored .omx/visual-reference/",
  output: { framePath: outPath, manifestPath },
};

try {
  const result = emulator === "jsnes" ? runJsnes(romBytes) : runNesEmu(romBytes);
  if (!result.lastFrame) throw new Error("emulator did not emit a frame");
  writePpm(outPath, result.lastFrame, result.colorFormat);
  const uniqueColorCount = countUniqueColors(result.lastFrame);
  const usable = uniqueColorCount > 1;
  writeManifest({
    ...manifestBase,
    status: usable ? "captured" : "captured-unusable",
    framesRequested: framesToRun,
    framesCaptured: result.frameCount,
    uniqueColorCount,
    privatePayloadWritten: true,
    notes: [
      "PPM frame is private and ignored by git",
      "Mapper 74 compatibility is experimental; use capture for visual reference only after manual sanity check",
      ...(usable ? [] : ["Captured frame is a flat color and is not useful for visual parity"]),
    ],
  });
  console.log(JSON.stringify({ status: usable ? "captured" : "captured-unusable", emulator, outPath, manifestPath, framesCaptured: result.frameCount, uniqueColorCount }, null, 2));
  if (!usable) process.exitCode = 3;
} catch (error) {
  const message = String(error?.message ?? error);
  writeManifest({
    ...manifestBase,
    status: "failed",
    framesRequested: framesToRun,
    framesCaptured: 0,
    privatePayloadWritten: false,
    error: String(error?.stack ?? error),
    failureKind: message.includes("Unsupported mapper") ? "unsupported-mapper" : (message.includes("invalid opcode") ? "mapper-shim-crash" : "emulation-failure"),
    likelyNextSteps: [
      "try another project-local NPM emulator with Mapper 74 support",
      "write a full Mapper 74/TQROM implementation before visual parity work",
      "keep using .omx/visual-reference/ for any private outputs",
    ],
  });
  console.error(JSON.stringify({ status: "failed", emulator, manifestPath, error: message }, null, 2));
  process.exitCode = 2;
}
