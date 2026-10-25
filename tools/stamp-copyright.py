#!/usr/bin/env python3
"""Stamp the English Lab copyright line on every page of downloadable PDFs (Roger, 25 Oct 2026).

Run: python3 tools/stamp-copyright.py path/to/a.pdf [more.pdf ...]
The wording comes from shared/js/el-copyright.js (one source for the site and the PDFs). The line goes bottom left,
on the same line as the footer of the LS summary PDFs (LibreOffice A4, 8 pt grey); --x/--y move it (points from the
bottom-left corner). A PDF that already has the line is left as it is, so the script can run again after a rebuild.
Needs pypdf and reportlab.
"""
import argparse, datetime, io, os, re, sys
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def wording():
    js = open(os.path.join(ROOT, "shared/js/el-copyright.js"), encoding="utf-8").read()
    rest = re.search(r'"© "\+new Date\(\)\.getFullYear\(\)\+"([^"]+)"', js).group(1)
    return "© %d%s" % (datetime.date.today().year, rest)


def font():
    for path in ("/usr/share/fonts/truetype/crosextra/Carlito-Regular.ttf", "C:/Windows/Fonts/calibri.ttf"):
        if os.path.exists(path):
            pdfmetrics.registerFont(TTFont("CopyrightFont", path))
            return "CopyrightFont"
    return "Helvetica"


def stamp(path, text, face, x, y):
    reader = PdfReader(path)
    if text.split(" ", 2)[2] in (reader.pages[0].extract_text() or ""):
        print("already stamped:", path)
        return
    writer = PdfWriter()
    for page in reader.pages:
        w, h = float(page.mediabox.width), float(page.mediabox.height)
        buf = io.BytesIO()
        c = canvas.Canvas(buf, pagesize=(w, h))
        c.setFont(face, 8)
        c.setFillColorRGB(0x5F / 255, 0x6B / 255, 0x73 / 255)
        c.drawString(x, y, text)
        c.save()
        page.merge_page(PdfReader(buf).pages[0])
        writer.add_page(page)
    writer.add_metadata({k: v for k, v in (reader.metadata or {}).items()})
    writer.add_metadata({"/Copyright": text})
    with open(path, "wb") as f:
        writer.write(f)
    print("stamped:", path)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("pdfs", nargs="+")
    ap.add_argument("--x", type=float, default=51.1)
    ap.add_argument("--y", type=float, default=38.14)
    a = ap.parse_args()
    text, face = wording(), font()
    for p in a.pdfs:
        stamp(p, text, face, a.x, a.y)
