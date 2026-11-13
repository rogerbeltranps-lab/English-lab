#!/usr/bin/env python3
"""Build the 📖 Book learning path data of each reading story (Roger, 12 Nov 2026: "a Book LP with a section per chapter, and we
allocate time on the agenda … there should appear the chapters of the book").

Run: python3 tools/reading-story/lp.py
Source: the same tools/reading-story/<course>-<ls>.md as the PDFs (build.py). Output: <LS folder>/data/book.js, read by
<LS folder>/book.html (ls2-engine.js): one tab per chapter (ch1 … ch6) with the book's own pages for the student's route (Starter,
Base, Core, Plus; Pro has its own C2 book where the .md has one, else reads Plus), shown as a book that turns its pages (shared/js/el-book.js; the pictures and book/pages.json come
from build.py --web, run it first), and the chapter's two questions as the book's last page, answered on the page, once
(ls2-engine.js bookPanel): "Did you understand?" (checked, the right option first as in every mc panel) and "What happens next?
Guess!" (guess: saved, never marked; the next chapter shows the guess and, after its check, whether it was right). KEYS = the right options of the Drive teacher copies (✓), the same in every route.
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
from story import parse, levels_of      # noqa: E402

# keys: (gist, next) right option per chapter, 0 = A (Drive: Reading story teacher copies, ✓). lps: the site's Learning Path numbers
# of each chapter (the .md's "LPn" lines follow the LS design, where 4 ESO counts Getting started as LP0).
BOOKS = [
    {"src": "2eso-ls2", "dir": "2eso/free-time-live", "title": "Maya Live!", "key": "ls2Book2ESO",
     "keys": [(0, 1), (0, 2), (1, 0), (1, 2), (0, 1), (2, 0)], "lps": [[1], [2], [3], [4], [5], [6]]},
    {"src": "4eso-ls2", "dir": "4eso/seasons-and-celebrations", "title": "Lantern Night", "key": "ls2Book4ESO",
     "keys": [(0, 1), (0, 2), (1, 0), (2, 0), (1, 2), (0, 1)], "lps": [[1], [2], [3, 4], [5], [6], "fp"]},
]


def typo(s):
    out = []
    for i, ch in enumerate(s):
        if ch == '"':
            prev = s[i - 1] if i else " "
            out.append("“" if (prev.isspace() or prev in "(—–-\x01") else "”")
        elif ch == "'":
            out.append("’")
        else:
            out.append(ch)
    return "".join(out)


def lp_of(n):
    if n == "fp":
        return {"en": "With the final product", "ca": "Amb el producte final"}
    t = " + ".join("LP%s" % x for x in n)
    return {"en": "With " + t, "ca": "Amb " + t}


def build(b):
    chapters = parse(os.path.join(HERE, b["src"] + ".md"))
    man = json.load(open(os.path.join(ROOT, b["dir"], "book", "pages.json"), encoding="utf-8"))
    assert len(chapters) == len(b["keys"]), b["src"]
    panels, levels = [], levels_of(chapters)
    for k, ch in enumerate(chapters):
        core = ch["levels"]["Core"]
        # the book's own pages (build.py --web): chapter 1 opens with the cover and "How to read this book"
        pages = {lv: (man[lv]["cover"] if k == 0 else []) + man[lv][str(ch["n"])] for lv, _ in levels}
        items = []
        for which, key, label in (("gist", b["keys"][k][0], None), ("next", b["keys"][k][1], "guess")):
            # the questions and options are the same in every route; Catalan from the Starter/Base copy
            q = core[which]
            if not q:
                continue
            for lv, name in levels:
                o = ch["levels"][name][which]
                assert o and o["opts"] == q["opts"], (b["src"], ch["n"], name, which)
            qca = ch["levels"]["Base"][which]["q"][1]
            opts = q["opts"][:]
            opts.insert(0, opts.pop(key))          # the right option first (the page shuffles them)
            it = {"id": which, "q": typo(q["q"][0]), "o": [typo(x) for x in opts]}
            if qca:
                it["qca"] = typo(qca)
            if label:
                it["guess"] = True
            items.append(it)
        p = {"id": "ch%d" % ch["n"], "type": "mc", "tab": {"en": "Chapter %d" % ch["n"], "ca": "Capítol %d" % ch["n"]},
             "title": typo("Chapter %d · %s" % (ch["n"], ch["title"])), "pill": lp_of(b["lps"][k]),
             "intro": {"en": "Tap the book to read it full screen. Turn the pages like a real book: drag them with your finger or the mouse (or use ▶). The last page has two questions: one about the story and one guess about what happens next. Tap your answers and check: you can do it only once. Then, if you want, go on reading the next chapter.",
                       "ca": "Toca el llibre per llegir-lo a pantalla completa. Gira les pàgines com en un llibre de veritat: arrossega-les amb el dit o el ratolí (o fes servir ▶). L’última pàgina té dues preguntes: una sobre la història i una endevinalla sobre què passarà. Toca les respostes i comprova: només ho pots fer una vegada. Després, si vols, continua llegint el capítol següent."},
             "book": True, "media": {"pages": pages}, "items": items}
        if k:
            p["prev"] = "ch%d" % chapters[k - 1]["n"]
        panels.append(p)
    out = os.path.join(ROOT, b["dir"], "data", "book.js")
    js = ("/* Generated by tools/reading-story/lp.py from tools/reading-story/%s.md: the 📖 Book learning path (%s), one book, a step per chapter. "
          "Do not edit by hand. */\nwindow.LP = %s;\n") % (b["src"], b["title"], json.dumps(
        {"key": b["key"], "n": "B", "title": "Book: " + b["title"],
         # one tab for the whole book (Roger, 13 Nov 2026: "only one SLP for the book so that people can continue where they left off"):
         # ls2-engine.js draws one book that opens where the student stopped; the chapters below stay its steps
         "book": {"tab": {"en": "The book", "ca": "El llibre"}, "title": b["title"],
                  "intro": {"en": "Read at your own pace: the book opens where you stopped. Tap it to read full screen and turn the pages like a real book: drag them with your finger or the mouse (or use ▶). Each chapter ends with two questions: one about the story and one guess about what happens next. You can answer them only once, and then the next chapter opens. Go on reading as many chapters as you want!",
                            "ca": "Llegeix al teu ritme: el llibre s’obre on ho vas deixar. Toca’l per llegir a pantalla completa i gira les pàgines com en un llibre de veritat: arrossega-les amb el dit o el ratolí (o fes servir ▶). Cada capítol acaba amb dues preguntes: una sobre la història i una endevinalla sobre què passarà. Només les pots respondre una vegada, i llavors s’obre el capítol següent. Continua llegint tants capítols com vulguis!"}},
         "panels": panels}, ensure_ascii=False, indent=1))
    open(out, "w", encoding="utf-8").write(js)
    print("built", os.path.relpath(out, ROOT), len(panels), "chapters")


if __name__ == "__main__":
    for b in BOOKS:
        build(b)
