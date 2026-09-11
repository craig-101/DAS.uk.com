#!/usr/bin/env python3
"""
Import the DAS 2025 guideline PDFs from das.uk.com as page images.

Four kinds of source, all keyed by the document id used in data/library.js
and all written into public/docs/<document-id>/, where the app finds them:

    SOURCES  PDF rendered one image per page → page-1.jpg, page-2.jpg, …
    IMAGES   list of image URLs saved as pages → page-1.jpg, page-2.jpg, …
             (for older guidelines that DAS publishes as images, not PDFs)
    THUMBS   PDF whose first page becomes the list thumbnail → thumb.jpg
             (for documents that open a PDF via the `pdf` field)
    FRAMES   (video URL, seconds) → a frame grabbed with ffmpeg → thumb.jpg
             (for documents that open a video via the `link` field)
    PDFS     PDF copied as-is → <filename>, for a local `pdf:` link

Usage
    pip install pymupdf                    # once
    python3 scripts/import-das-pdfs.py     # everything
    python3 scripts/import-das-pdfs.py --only plan-a,plan-b
    python3 scripts/import-das-pdfs.py --dpi 150

Re-run whenever DAS publishes an updated PDF. Existing page-N.* files in each
target folder are removed first so page counts stay correct; any other files
in the folder (e.g. a custom thumb.png) are left alone.

To add a document: put its URL(s) in the right map below and run the script.
"""

import argparse
import re
import sys
import tempfile
import urllib.parse
import urllib.request
from pathlib import Path

try:
    import pymupdf
except ImportError:
    sys.exit("PyMuPDF is required:  pip install pymupdf")

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "public" / "docs"
UP = "https://das.uk.com/wp-content/uploads"

# document id in data/library.js  →  PDF on das.uk.com
SOURCES = {
    # Difficult Airway Algorithms      https://das.uk.com/algorithms/
    "master-algorithm":     f"{UP}/2025/12/DAS-Algorhitms-2025-A4-MANAGEMENT.jpg_rotated.pdf",
    "plan-a":               f"{UP}/2025/12/DAS-Algorhitms-2025-A4-PLAN-A.jpg_rotated.pdf",
    "plan-b":               f"{UP}/2025/12/DAS-Algorhitms-2025-A4-PLAN-B.jpg_rotated.pdf",
    "plan-c":               f"{UP}/2025/12/DAS-Algorhitms-2025-A4-PLAN-C.jpg_rotated.pdf",
    "plan-d":               f"{UP}/2025/12/DAS-Algorhitms-2025-A4-PLAN-D.jpg_rotated.pdf",
    "preparation-plan":     f"{UP}/2025/12/DAS-Algorhitms-2025-A4-PREP-PLAN.pdf",
    # Infographics                     https://das.uk.com/infographics/
    "intubation-through-sad":    f"{UP}/2025/12/Flexible-Bronchoscopy-Guided-UPDT2.pdf",
    "human-factors-infographic": f"{UP}/2026/05/Human-Factors-in-Failed-Intubation-One-Page-Final.pdf",
    "vertical-skin-incision":    f"{UP}/2025/12/2025-CICO-Vertical-Incision-pdf.pdf",
    "transverse-stab-incision":  f"{UP}/2025/12/2025-CICO-Transverse-stab-incision-pdf.pdf",
    # AirBites                         https://das.uk.com/airbites/
    "airbites-facilitator-guide": f"{UP}/2025/11/AirBites-Facilitator-guide-2025.pdf",
    "airbite-1":            f"{UP}/2025/11/Bite1.pdf",
    "airbite-2":            f"{UP}/2025/11/Bite2.pdf",
    "airbite-3":            f"{UP}/2025/11/Bite3.pdf",
    "airbite-4":            f"{UP}/2025/11/Bite4.pdf",
    "airbite-5":            f"{UP}/2025/11/Bite5.pdf",
    "human-factors":        f"{UP}/2026/05/DAS-2025-AirBIte-Human-Factors-Final-V2.pdf",
    # AirDrills                        https://das.uk.com/airdrills/
    "airdrills-facilitator-guide":  f"{UP}/2026/04/Facilitator-User-Guide-VEMS-Air-Drill-final.pdf",
    "airdrills-theatre":            f"{UP}/2026/04/DAS-2025-AirDrills-V2-final.pdf",
    "airdrills-critical-care":      f"{UP}/2026/04/DAS-2025-Critical-Care-AirDrills-13_04-compressed.pdf",
    "airdrills-emergency-department": f"{UP}/2026/04/DAS-2025-Emergency-Department-AirDrills-13_04-compressed.pdf",
    "airdrills-vems-pack":          f"{UP}/2026/01/Airdrill-VEMS-All-in-One-.pdf",
}

# document id  →  list of image URLs, saved in order as page-1.jpg, page-2.jpg, …
IMAGES = {
    # Other DAS guidelines               https://das.uk.com/guidelines/
    "ati-guideline": [
        f"{UP}/2024/11/anae14904-fig-0002-m.jpg",
        f"{UP}/2024/11/anae14904-fig-0001-m.jpg",
        f"{UP}/2024/11/anae14904-fig-0003-m.jpg",
        f"{UP}/2024/11/anae14904-fig-0004-m.jpg",
    ],
    "extubation-guideline": [
        f"{UP}/2024/07/Screenshot-2024-07-25-at-10.25.13.png",
        f"{UP}/2024/07/Screenshot-2024-07-25-at-10.25.32.png",
        f"{UP}/2024/07/Screenshot-2024-07-25-at-10.25.45.png",
    ],
    "obstetric-guideline": [f"{UP}/2024/07/01-15-DAS-algorithms-web-20092015-0{n}.jpg" for n in range(1, 7)],
    "icu-guideline": [
        f"{UP}/2024/10/DAS_ICU_guidelines_algorithm1.jpg",
        f"{UP}/2024/10/DAS_ICU_guidelines_algorithm2.jpg",
        f"{UP}/2024/10/DAS_ICU_guidelines_checklist.jpg",
    ],
    "thyroid-haematoma-guideline": [
        f"{UP}/2024/07/Figure-1_R1_2.png",
        f"{UP}/2024/07/Figure-2_R1_2.png",
        f"{UP}/2024/07/Figure-3_R1_2.png",
        f"{UP}/2024/07/Table-1_R1-_2.png",
    ],
}

# AirClips on Vimeo: Vimeo's own poster frames (from its oEmbed API)
VC = "https://i.vimeocdn.com/video"
IMAGES.update({
    "airclips-plan-a-introduction": [f"{VC}/2074384454-8f013fd661d58409bf5c78a9164efc5c7668044eb3938f69ce22fcfcf1469813-d_1280"],
    "airclips-plan-a-planning":     [f"{VC}/2074386922-28e7f3a15751a35033874d65f40ef99113ec990381221c71c53181ead989f427-d_1280"],
    "airclips-plan-a-successful":   [f"{VC}/2074385533-a8bc6ea78e57dc6c988a1e1f68d34369cd3a346a0934f7fc873e8e30b4420acf-d_1280"],
    "airclips-plan-a-failed":       [f"{VC}/2077220050-6206261395cd8fe8bf0ddf673481e740a1f59dec379f79220078cc7ce84505a6-d_1280"],
    "airclips-plan-d":              [f"{VC}/2137183753-a5981a176069dcae7d273ebaffef14d69898b62ee7bd36df31c76a745037ba44-d_1280"],
})

# document id  →  (video URL, seconds in) — one frame grabbed with ffmpeg as thumb.jpg
S3 = "https://daswebsite.s3.eu-west-1.amazonaws.com"
FRAMES = {
    "airclips-plan-b":         (f"{UP}/2026/02/plan_b-720p.mp4", 8),
    "talk-introduction-2025":  (f"{S3}/DAS%2BIntubation%2BGuidelines_presentation.mp4", 20),
    "talk-whats-new-2025":     (f"{UP}/2025/12/video1850929497.mp4", 20),
}

# document id  →  PDF whose first page is rendered as thumb.jpg
THUMBS = {
    # AirSim                             https://das.uk.com/airsim/
    "airsim-novice":     f"{UP}/2026/04/DAS-Novice-SIM-V2.0-17_04.pdf",
    "airsim-ipe-plan-a": f"{UP}/2026/04/IPE-SIM_Plan-A.pdf",
    "airsim-ipe-plan-b": f"{UP}/2026/04/IPE-SIM_Plan-B.pdf",
    "airsim-ipe-plan-c": f"{UP}/2026/04/IPE-SIM_-Plan-C.pdf",
    "airsim-ipe-plan-d": f"{UP}/2026/04/IPE-SIM_-Plan-D.pdf",
    # Thyroid haematoma resources        https://das.uk.com/guidelines/haematoma/
    "thyroid-haematoma-resources": f"{UP}/2024/07/Supporting-Information-Appendix-S3_R1.pdf",
    # Airway trolley                     https://das.uk.com/DA-trolley/
    "trolley-contents": f"{UP}/2025/12/DAS-Adult-Unanticipated-Difficult-Airway-Trolley-without-images-V3.pdf",
    "trolley-labels":   f"{UP}/2025/12/DAS-Unanticipated-DAT-V4.pdf",
    # Patient information                https://das.uk.com/patient-information/
    "ati-infographic":        f"{UP}/2024/09/ATI-Infographic-FINAL-Feb-2023pdf.pdf",
    "ati-patient-info":       f"{S3}/AWAKE+INTUBATION+Patient+Information+v9+June+2022+final+version.pdf",
    "ati-patient-info-welsh": f"{S3}/AWAKE+INTUBATION+Patient+Information+v8+April+2022+%28Welsh%29.pdf",
}

# document id  →  (PDF on das.uk.com, file name to save it under)
PDFS = {
    "algorithms-a4-set": (f"{UP}/2025/12/DAS-Algorhitms-2025-A4-PREP-PLAN_merge-3.pdf", "DAS-2025-algorithms-A4.pdf"),
}

ALL_IDS = list(dict.fromkeys([*SOURCES, *IMAGES, *THUMBS, *FRAMES, *PDFS]))

PAGE_FILE = re.compile(r"^page-\d+\.(png|jpe?g|webp)$", re.I)


def download(url: str, cache: Path) -> Path:
    target = cache / urllib.parse.unquote(url.rsplit("/", 1)[-1])
    if not target.exists():
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req) as r, open(target, "wb") as f:
            f.write(r.read())
    return target


def render(doc_id: str, pdf: Path, dpi: int, quality: int) -> int:
    out = DOCS / doc_id
    out.mkdir(parents=True, exist_ok=True)
    for old in out.iterdir():
        if PAGE_FILE.match(old.name):
            old.unlink()
    with pymupdf.open(pdf) as d:
        for i, page in enumerate(d, start=1):
            pix = page.get_pixmap(dpi=dpi, alpha=False)
            pix.save(out / f"page-{i}.jpg", jpg_quality=quality)
        return d.page_count


def save_images(doc_id: str, files: list, quality: int) -> int:
    out = DOCS / doc_id
    out.mkdir(parents=True, exist_ok=True)
    for old in out.iterdir():
        if PAGE_FILE.match(old.name):
            old.unlink()
    for i, f in enumerate(files, start=1):
        pix = pymupdf.Pixmap(str(f))
        if pix.alpha:
            pix = pymupdf.Pixmap(pix, 0)
        if pix.n != 3:
            pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
        pix.save(out / f"page-{i}.jpg", jpg_quality=quality)
    return len(files)


def save_thumb(doc_id: str, pdf: Path, quality: int) -> None:
    out = DOCS / doc_id
    out.mkdir(parents=True, exist_ok=True)
    with pymupdf.open(pdf) as d:
        d[0].get_pixmap(dpi=110, alpha=False).save(out / "thumb.jpg", jpg_quality=quality)


def save_frame(doc_id: str, url: str, seconds: int) -> None:
    """Grab one frame straight from the video URL (needs ffmpeg on the PATH)."""
    import shutil
    import subprocess
    if not shutil.which("ffmpeg"):
        raise RuntimeError("ffmpeg not installed — skipping video thumbnail")
    out = DOCS / doc_id
    out.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-y", "-ss", str(seconds), "-i", url,
         "-frames:v", "1", "-vf", "scale=1280:-2", "-q:v", "3", str(out / "thumb.jpg")],
        check=True, timeout=180,
    )


def copy_pdf(doc_id: str, pdf: Path, name: str) -> None:
    out = DOCS / doc_id
    out.mkdir(parents=True, exist_ok=True)
    (out / name).write_bytes(pdf.read_bytes())


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--only", help="comma-separated document ids (default: all)")
    ap.add_argument("--dpi", type=int, default=200)
    ap.add_argument("--quality", type=int, default=88, help="JPEG quality (default 88)")
    args = ap.parse_args()

    ids = args.only.split(",") if args.only else ALL_IDS
    unknown = [i for i in ids if i not in ALL_IDS]
    if unknown:
        sys.exit(f"Unknown document id(s): {', '.join(unknown)}")

    cache = Path(tempfile.gettempdir()) / "das-airway-pdfs"
    cache.mkdir(exist_ok=True)

    for doc_id in ids:
        try:
            if doc_id in SOURCES:
                url = SOURCES[doc_id]
                n = render(doc_id, download(url, cache), args.dpi, args.quality)
                print(f"{doc_id:32s} {n:3d} page(s)  ← {url.rsplit('/', 1)[-1]}")
            if doc_id in IMAGES:
                n = save_images(doc_id, [download(u, cache) for u in IMAGES[doc_id]], args.quality)
                print(f"{doc_id:32s} {n:3d} image(s)")
            if doc_id in THUMBS:
                url = THUMBS[doc_id]
                save_thumb(doc_id, download(url, cache), args.quality)
                print(f"{doc_id:32s} thumbnail  ← {url.rsplit('/', 1)[-1]}")
            if doc_id in FRAMES:
                url, secs = FRAMES[doc_id]
                save_frame(doc_id, url, secs)
                print(f"{doc_id:32s} video frame  ← {url.rsplit('/', 1)[-1]}")
            if doc_id in PDFS:
                url, name = PDFS[doc_id]
                copy_pdf(doc_id, download(url, cache), name)
                print(f"{doc_id:32s} PDF saved as {name}  ← {url.rsplit('/', 1)[-1]}")
        except Exception as e:  # keep going; report at the end
            print(f"{doc_id:32s} FAILED: {e}", file=sys.stderr)


if __name__ == "__main__":
    main()
