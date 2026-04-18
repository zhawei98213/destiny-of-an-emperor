import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { createHash } from "node:crypto";
import { NES } from "jsnes";

const romPath = process.argv[2] ?? "吞食天地2.nes";
const outPath = process.argv[3] ?? ".omx/visual-reference/capture.ppm";
const manifestPath = process.argv[4] ?? ".omx/visual-reference/manifest.json";
const framesToRun = Number(process.env.CAPTURE_FRAMES ?? 120);

function writeManifest(manifest) {
  mkdirSync(dirname(manifestPath), { recursive: true });
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
}

function writePpm(path, frameBuffer) {
  mkdirSync(dirname(path), { recursive: true });
  const rgb = Buffer.alloc(256 * 240 * 3);
  for (let i = 0; i < 256 * 240; i += 1) {
    const color = frameBuffer[i];
    rgb[i * 3] = color & 0xff;
    rgb[i * 3 + 1] = (color >> 8) & 0xff;
    rgb[i * 3 + 2] = (color >> 16) & 0xff;
  }
  writeFileSync(path, Buffer.concat([Buffer.from("P6\n256 240\n255\n", "ascii"), rgb]));
}

const romBytes = readFileSync(romPath);
const romHash = createHash("sha256").update(romBytes).digest("hex");
let lastFrame = null;
let frameCount = 0;
const manifestBase = {
  kind: "private-rom-reference-capture",
  emulator: { package: "jsnes", version: "2.1.0" },
  rom: { path: romPath, sha256: romHash },
  payloadPolicy: "capture output is private and must stay under ignored .omx/visual-reference/",
  output: { framePath: outPath, manifestPath },
};

try {
  const nes = new NES({
    onFrame(frameBuffer) {
      frameCount += 1;
      lastFrame = new Uint32Array(frameBuffer);
    },
    onAudioSample() {},
  });
  nes.loadROM(romBytes);
  for (let i = 0; i < framesToRun; i += 1) nes.frame();
  if (!lastFrame) throw new Error("emulator did not emit a frame");
  writePpm(outPath, lastFrame);
  writeManifest({
    ...manifestBase,
    status: "captured",
    framesRequested: framesToRun,
    framesCaptured: frameCount,
    privatePayloadWritten: true,
    notes: ["PPM frame is private and ignored by git", "Use this only as local visual reference"],
  });
  console.log(JSON.stringify({ status: "captured", outPath, manifestPath, framesCaptured: frameCount }, null, 2));
} catch (error) {
  writeManifest({
    ...manifestBase,
    status: "failed",
    framesRequested: framesToRun,
    framesCaptured: frameCount,
    privatePayloadWritten: false,
    error: String(error?.stack ?? error),
    likelyNextSteps: [
      "try another project-local NPM emulator with Mapper 74 support",
      "write a Mapper 74 compatibility probe before visual parity work",
      "keep using .omx/visual-reference/ for any private outputs",
    ],
  });
  console.error(JSON.stringify({ status: "failed", manifestPath, error: String(error?.message ?? error) }, null, 2));
  process.exitCode = 2;
}
