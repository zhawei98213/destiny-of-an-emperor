#!/usr/bin/env python3
"""NES ROM inspection and private extraction helpers.

This tool is intentionally dependency-free and is meant for user-provided ROMs
that the user is authorized to analyze. Keep generated outputs in ignored
private directories (the default examples use .omx/rom-analysis/).
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
from collections import Counter
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Iterable

INES_MAGIC = b"NES\x1a"


@dataclass(frozen=True)
class INESInfo:
    path: str
    size_bytes: int
    sha256: str
    md5: str
    format: str
    mapper: int
    submapper: int | None
    prg_rom_banks_16k: int
    chr_rom_banks_8k: int
    prg_rom_size: int
    chr_rom_size: int
    prg_ram_size_hint: int
    chr_ram_size_hint: int
    mirroring: str
    battery: bool
    trainer: bool
    four_screen: bool
    prg_offset: int
    chr_offset: int
    expected_size: int
    extra_bytes: int
    prg_sha256: str
    chr_sha256: str | None
    vectors_last_16k: dict[str, str] | None


class ROMError(RuntimeError):
    pass


def read_rom(path: Path) -> bytes:
    if not path.exists():
        raise ROMError(f"ROM not found: {path}")
    data = path.read_bytes()
    if len(data) < 16:
        raise ROMError(f"File too small for an iNES/NES 2.0 header: {path}")
    if data[:4] != INES_MAGIC:
        raise ROMError(f"Not an iNES/NES 2.0 ROM (missing NES<EOF> magic): {path}")
    return data


def parse_rom(path: Path) -> tuple[INESInfo, bytes, bytes]:
    data = read_rom(path)
    header = data[:16]
    flags6 = header[6]
    flags7 = header[7]
    trainer = bool(flags6 & 0x04)
    battery = bool(flags6 & 0x02)
    four_screen = bool(flags6 & 0x08)
    mirroring = "4-screen" if four_screen else ("vertical" if flags6 & 0x01 else "horizontal")
    nes2 = (flags7 & 0x0C) == 0x08

    if nes2:
        mapper = (flags6 >> 4) | (flags7 & 0xF0) | ((header[8] & 0x0F) << 8)
        submapper = (header[8] >> 4) & 0x0F
        prg_banks = header[4] | ((header[9] & 0x0F) << 8)
        chr_banks = header[5] | ((header[9] & 0xF0) << 4)
        # NES 2.0 RAM size fields are encoded as shifts; retain a practical byte hint.
        prg_ram_shift = header[10] & 0x0F
        chr_ram_shift = header[11] & 0x0F
        prg_ram_size_hint = 0 if prg_ram_shift == 0 else 64 << prg_ram_shift
        chr_ram_size_hint = 0 if chr_ram_shift == 0 else 64 << chr_ram_shift
        fmt = "NES 2.0"
    else:
        mapper = (flags6 >> 4) | (flags7 & 0xF0)
        submapper = None
        prg_banks = header[4]
        chr_banks = header[5]
        prg_ram_size_hint = header[8] * 8192 if header[8] else 8192
        chr_ram_size_hint = 8192 if chr_banks == 0 else 0
        fmt = "iNES"

    prg_size = prg_banks * 16 * 1024
    chr_size = chr_banks * 8 * 1024
    prg_offset = 16 + (512 if trainer else 0)
    chr_offset = prg_offset + prg_size
    expected_size = chr_offset + chr_size
    prg = data[prg_offset:chr_offset]
    chr_rom = data[chr_offset:expected_size]
    if len(prg) != prg_size or len(chr_rom) != chr_size:
        raise ROMError(
            f"ROM is truncated: expected PRG={prg_size} CHR={chr_size}, "
            f"got PRG={len(prg)} CHR={len(chr_rom)}"
        )

    vectors = None
    if prg_size >= 0x4000:
        last = prg[-0x4000:]
        vectors = {
            "nmi": f"0x{last[0x3FFA] | (last[0x3FFB] << 8):04x}",
            "reset": f"0x{last[0x3FFC] | (last[0x3FFD] << 8):04x}",
            "irq": f"0x{last[0x3FFE] | (last[0x3FFF] << 8):04x}",
        }

    info = INESInfo(
        path=str(path),
        size_bytes=len(data),
        sha256=hashlib.sha256(data).hexdigest(),
        md5=hashlib.md5(data).hexdigest(),
        format=fmt,
        mapper=mapper,
        submapper=submapper,
        prg_rom_banks_16k=prg_banks,
        chr_rom_banks_8k=chr_banks,
        prg_rom_size=prg_size,
        chr_rom_size=chr_size,
        prg_ram_size_hint=prg_ram_size_hint,
        chr_ram_size_hint=chr_ram_size_hint,
        mirroring=mirroring,
        battery=battery,
        trainer=trainer,
        four_screen=four_screen,
        prg_offset=prg_offset,
        chr_offset=chr_offset,
        expected_size=expected_size,
        extra_bytes=len(data) - expected_size,
        prg_sha256=hashlib.sha256(prg).hexdigest(),
        chr_sha256=hashlib.sha256(chr_rom).hexdigest() if chr_rom else None,
        vectors_last_16k=vectors,
    )
    return info, prg, chr_rom


def entropy(blob: bytes) -> float:
    counts = Counter(blob)
    return -sum((n / len(blob)) * math.log2(n / len(blob)) for n in counts.values()) if blob else 0.0


def bank_summary(prg: bytes, bank_size: int) -> list[dict[str, object]]:
    rows: list[dict[str, object]] = []
    for idx in range(0, len(prg), bank_size):
        bank = prg[idx : idx + bank_size]
        if len(bank) != bank_size:
            continue
        rows.append(
            {
                "bank": idx // bank_size,
                "offset": idx,
                "size": len(bank),
                "sha1": hashlib.sha1(bank).hexdigest(),
                "sha256": hashlib.sha256(bank).hexdigest(),
                "entropy": round(entropy(bank), 4),
                "zero_ratio": round(bank.count(0) / len(bank), 4),
                "ff_ratio": round(bank.count(0xFF) / len(bank), 4),
                "printable_ascii_ratio": round(sum(1 for b in bank if 32 <= b < 127) / len(bank), 4),
            }
        )
    return rows


def tile_pixels(tile: bytes) -> list[int]:
    """Decode one NES 2bpp 8x8 tile into 64 palette indices."""
    if len(tile) != 16:
        raise ValueError("NES tile must be 16 bytes")
    pixels: list[int] = []
    for y in range(8):
        lo = tile[y]
        hi = tile[y + 8]
        for x in range(8):
            bit = 7 - x
            pixels.append(((hi >> bit) & 1) << 1 | ((lo >> bit) & 1))
    return pixels


def write_pgm_tile_sheet(blob: bytes, out_path: Path, columns: int = 16) -> None:
    """Write a grayscale PGM tile sheet from raw NES 2bpp tile bytes."""
    tile_count = len(blob) // 16
    rows = math.ceil(tile_count / columns)
    width = columns * 8
    height = rows * 8
    image = bytearray([0xFF] * width * height)
    shades = [255, 170, 85, 0]

    for tile_index in range(tile_count):
        tile = blob[tile_index * 16 : tile_index * 16 + 16]
        pixels = tile_pixels(tile)
        tx = (tile_index % columns) * 8
        ty = (tile_index // columns) * 8
        for y in range(8):
            for x in range(8):
                image[(ty + y) * width + (tx + x)] = shades[pixels[y * 8 + x]]

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_bytes(f"P5\n{width} {height}\n255\n".encode("ascii") + bytes(image))


def inspect_cmd(args: argparse.Namespace) -> None:
    info, prg, chr_rom = parse_rom(Path(args.rom))
    result = asdict(info)
    result["prg_16k_banks"] = bank_summary(prg, 16 * 1024)
    result["prg_8k_banks"] = bank_summary(prg, 8 * 1024)
    if chr_rom:
        result["chr_8k_banks"] = bank_summary(chr_rom, 8 * 1024)
    text = json.dumps(result, ensure_ascii=False, indent=2)
    if args.out:
        out = Path(args.out)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(text + "\n", encoding="utf-8")
    print(text)


def extract_chr_candidates_cmd(args: argparse.Namespace) -> None:
    info, prg, chr_rom = parse_rom(Path(args.rom))
    out_dir = Path(args.out_dir)
    manifest: dict[str, object] = {"rom": asdict(info), "sheets": []}
    sheets: list[dict[str, object]] = []

    if chr_rom:
        for i in range(0, len(chr_rom), 8 * 1024):
            chunk = chr_rom[i : i + 8 * 1024]
            out = out_dir / f"chr-rom-{i // 8192:03d}.pgm"
            write_pgm_tile_sheet(chunk, out)
            sheets.append({"kind": "chr-rom", "bank_8k": i // 8192, "path": str(out), "sha256": hashlib.sha256(chunk).hexdigest()})
    else:
        # CHR RAM cartridges often store compressed or copied pattern data in PRG ROM.
        # These are candidate visualizations only; not every sheet is actual graphics.
        for i in range(0, len(prg), 8 * 1024):
            chunk = prg[i : i + 8 * 1024]
            out = out_dir / f"prg-as-chr-candidate-{i // 8192:03d}.pgm"
            write_pgm_tile_sheet(chunk, out)
            sheets.append({"kind": "prg-as-chr-candidate", "bank_8k": i // 8192, "path": str(out), "sha256": hashlib.sha256(chunk).hexdigest()})

    manifest["sheets"] = sheets
    manifest_path = out_dir / "manifest.json"
    out_dir.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"manifest": str(manifest_path), "sheet_count": len(sheets)}, ensure_ascii=False, indent=2))



def trace_plan_cmd(args: argparse.Namespace) -> None:
    """Write a metadata-only runtime tracing plan without extracting payload."""
    info, _, _ = parse_rom(Path(args.rom))
    out = Path(args.out)
    plan = {
        "kind": "runtime-trace-plan",
        "payloadPolicy": "metadata-only; do not commit runtime captures, screenshots, pattern tables, nametables, palettes, text dumps, audio, or bank slices",
        "rom": {
            "sha256": info.sha256,
            "format": info.format,
            "mapper": info.mapper,
            "prgRomSize": info.prg_rom_size,
            "chrRomSize": info.chr_rom_size,
            "chrRamSizeHint": info.chr_ram_size_hint,
            "mirroring": info.mirroring,
            "battery": info.battery,
        },
        "ignoredOutputRoot": ".omx/rom-analysis/runtime-captures/",
        "captureTargets": [
            {"name": "pattern-table-writes", "payload": "private", "description": "PPU pattern table write events and resulting CHR-RAM pages"},
            {"name": "palette-writes", "payload": "private", "description": "PPU palette write events"},
            {"name": "nametable-snapshots", "payload": "private", "description": "Scene nametable snapshots for map/menu/battle screens"},
            {"name": "text-render-events", "payload": "private", "description": "Runtime text rendering references for table discovery"},
        ],
        "commitSafeOutputs": [
            "hashes",
            "sizes",
            "counts",
            "schema documentation",
            "payload-free manifests",
        ],
    }
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(plan, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"tracePlan": str(out), "payloadPolicy": plan["payloadPolicy"]}, ensure_ascii=False, indent=2))

def main(argv: Iterable[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Inspect NES ROM headers/banks and extract private CHR visualizations.")
    sub = parser.add_subparsers(dest="cmd", required=True)

    inspect = sub.add_parser("inspect", help="Parse iNES/NES 2.0 metadata and bank summaries.")
    inspect.add_argument("rom")
    inspect.add_argument("--out", help="Optional JSON output path.")
    inspect.set_defaults(func=inspect_cmd)

    extract = sub.add_parser("extract-chr-candidates", help="Write PGM tile sheets from CHR ROM or PRG-as-CHR candidates.")
    extract.add_argument("rom")
    extract.add_argument("--out-dir", required=True)
    extract.set_defaults(func=extract_chr_candidates_cmd)

    trace = sub.add_parser("trace-plan", help="Write a metadata-only runtime tracing plan; does not extract payload.")
    trace.add_argument("rom")
    trace.add_argument("--out", required=True)
    trace.set_defaults(func=trace_plan_cmd)

    args = parser.parse_args(argv)
    args.func(args)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
