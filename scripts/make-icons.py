#!/usr/bin/env python3
"""
Generate the app icons (browser tab favicon, iOS home-screen icon, Android /
desktop PWA icons) from the DAS logo in public/img/das-logo-1024.png.

    pip install pymupdf        # once
    python3 scripts/make-icons.py

Writes into public/icons/. Re-run after replacing the source logo.
"""

from pathlib import Path

try:
    import pymupdf
except ImportError:
    raise SystemExit("PyMuPDF is required:  pip install pymupdf")

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public" / "img" / "das-logo-1024.png"
OUT = ROOT / "public" / "icons"

WHITE = (1, 1, 1)

# name, size, how much of the canvas the logo fills, background (None = transparent)
ICONS = [
    ("favicon-32.png",        32,  1.00, None),   # browser tab
    ("favicon-192.png",       192, 1.00, None),   # larger tab / bookmark icon
    ("apple-touch-icon.png",  180, 0.84, WHITE),  # iOS home screen (no transparency allowed)
    ("icon-192.png",          192, 0.84, WHITE),  # PWA
    ("icon-512.png",          512, 0.84, WHITE),  # PWA
    ("icon-maskable-512.png", 512, 0.62, WHITE),  # PWA maskable: logo inside the 80% safe zone
]


def make(name: str, size: int, scale: float, bg) -> None:
    doc = pymupdf.open()
    page = doc.new_page(width=size, height=size)
    if bg is not None:
        page.draw_rect(page.rect, color=None, fill=bg)
    pad = size * (1 - scale) / 2
    page.insert_image(pymupdf.Rect(pad, pad, size - pad, size - pad), filename=str(SRC), keep_proportion=True)
    page.get_pixmap(dpi=72, alpha=bg is None).save(OUT / name)
    print(f"{name:24s} {size}x{size}")


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for spec in ICONS:
        make(*spec)
