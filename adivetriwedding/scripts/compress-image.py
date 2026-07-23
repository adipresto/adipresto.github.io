#!/usr/bin/env python3
"""
Kompres gambar untuk components/film-roll-loop/photos.

Mengikuti pola yang sudah dipakai di proyek ini (lihat docs/knowledge-graph.md,
node `ec-filesize`): foto di-resize ke lebar 667px (portrait) atau proporsional,
lalu disimpan ulang sebagai JPEG kualitas 82 agar ukurannya sebanding dengan
foto lain di koleksi film-roll-loop (~60-150KB).

Pemakaian:
    python scripts/compress-image.py <file1> [file2 ...] [--width 667] [--quality 82] [--output-dir DIR] [--in-place]

Contoh:
    python scripts/compress-image.py components/film-roll-loop/photos/6.JPG
    python scripts/compress-image.py components/film-roll-loop/photos/*.JPG --width 667 --quality 82
"""

import argparse
import sys
from pathlib import Path

from PIL import Image, ImageOps


def compress_image(src: Path, dest: Path, width: int, quality: int) -> None:
    with Image.open(src) as img:
        img = ImageOps.exif_transpose(img)
        img = img.convert("RGB")

        if width and img.width > width:
            new_height = round(img.height * (width / img.width))
            img = img.resize((width, new_height), Image.LANCZOS)

        dest.parent.mkdir(parents=True, exist_ok=True)
        img.save(dest, "JPEG", quality=quality, optimize=True)


def format_size(num_bytes: int) -> str:
    if num_bytes >= 1024 * 1024:
        return f"{num_bytes / (1024 * 1024):.2f}MB"
    return f"{num_bytes / 1024:.0f}KB"


def main() -> int:
    parser = argparse.ArgumentParser(description="Kompres gambar JPEG/PNG ke ukuran file kecil.")
    parser.add_argument("files", nargs="+", help="Path gambar yang akan dikompres")
    parser.add_argument("--width", type=int, default=667, help="Lebar target dalam px (default: 667, sama seperti foto lain di koleksi)")
    parser.add_argument("--quality", type=int, default=82, help="Kualitas JPEG 1-95 (default: 82)")
    parser.add_argument("--output-dir", type=Path, default=None, help="Simpan hasil ke folder ini (default: timpa file asli)")
    parser.add_argument("--suffix", default="", help='Tambahkan suffix ke nama file, mis. "desktop" -> 1desktop.JPG')
    args = parser.parse_args()

    for file_str in args.files:
        src = Path(file_str)
        if not src.exists():
            print(f"[skip] {src} tidak ditemukan", file=sys.stderr)
            continue

        if args.output_dir:
            dest = args.output_dir / f"{src.stem}{args.suffix}.JPG"
        elif args.suffix:
            dest = src.with_name(f"{src.stem}{args.suffix}.JPG")
        else:
            dest = src

        before = src.stat().st_size
        compress_image(src, dest, args.width, args.quality)
        after = dest.stat().st_size

        with Image.open(dest) as out_img:
            dims = f"{out_img.width}x{out_img.height}"

        print(f"{src.name} -> {dest.name}: {format_size(before)} -> {format_size(after)} ({dims})")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
