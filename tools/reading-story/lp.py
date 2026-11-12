#!/usr/bin/env python3
"""Build the 📖 Book learning path data of each reading story (Roger, 12 Nov 2026: "a Book LP with a section per chapter, and we
allocate time on the agenda … there should appear the chapters of the book").

Run: python3 tools/reading-story/lp.py
Source: the same tools/reading-story/<course>-<ls>.md as the PDFs (build.py). Output: <LS folder>/data/book.js, read by
<LS folder>/book.html (ls2-engine.js): one tab per chapter (ch1 … ch6) with the chapter text of the student's route (Starter, Base,
Core, Plus; Pro reads Plus), the words box and the chapter's two questions: "Did you understand?" (checked, the right option first as
in every mc panel) and "What happens next? Guess!" (guess: saved, never marked; the next chapter shows the guess and, after its
check, whether it was right). KEYS = the right options of the Drive teacher copies (✓), the same in every route.
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
from story import parse, LEVELS          # noqa: E402
from paragraphs import paragraphs        # noqa: E402
import html as H                         # noqa: E402

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


def esc(s):
    return H.escape(typo(s), quote=False).replace("\x01", "<u>").replace("\x02", "</u>")


def mark_words(paras, words):
    """Underline the first use of each glossed word in the chapter text (as build.py)."""
    done = set()
    for w, _ in words:
        key = w.strip()
        pat = re.compile(r"(?<![\w\x01])(" + re.escape(key) + r"(?:s|es)?)(?![\w])", re.I)
        for k, p in enumerate(paras):
            m = pat.search(p)
            if m and key not in done:
                paras[k] = p[:m.start()] + "\x01" + m.group(1) + "\x02" + p[m.end():]
                done.add(key)
                break
    return paras


def lp_of(n):
    if n == "fp":
        return {"en": "With the final product", "ca": "Amb el producte final"}
    t = " + ".join("LP%s" % x for x in n)
    return {"en": "With " + t, "ca": "Amb " + t}


def text_html(L, ca):
    paras = mark_words(paragraphs(L["paras"]), L["words"])
    w = ""
    if L["words"]:
        w = ('<div class="book-words"><strong>' + ("Paraules que t’ajuden" if ca else "Words to help you") + '</strong><ul>'
             + "".join("<li><b>%s</b> = <i>%s</i></li>" % (esc(a), esc(b)) for a, b in L["words"]) + "</ul></div>")
    return w + '<div class="book-text">' + "".join("<p>%s</p>" % esc(p) for p in paras) + "</div>"


def build(b):
    chapters = parse(os.path.join(HERE, b["src"] + ".md"))
    assert len(chapters) == len(b["keys"]), b["src"]
    panels = []
    for k, ch in enumerate(chapters):
        core = ch["levels"]["Core"]
        text = {lv: text_html(ch["levels"][name], lv in ("beginners", "insecure")) for lv, name in LEVELS}
        items = []
        for which, key, label in (("gist", b["keys"][k][0], None), ("next", b["keys"][k][1], "guess")):
            # the questions and options are the same in every route; Catalan from the Starter/Base copy
            q = core[which]
            if not q:
                continue
            for lv, name in LEVELS:
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
             "intro": {"en": "Read the chapter once for the story, then again more slowly. Then answer: one question about the story and one guess about what happens next.",
                       "ca": "Llegeix el capítol una vegada per entendre la història i una altra més a poc a poc. Després respon: una pregunta sobre la història i una endevinalla sobre què passarà."},
             "book": True, "media": {"text": text}, "items": items}
        if k:
            p["prev"] = "ch%d" % chapters[k - 1]["n"]
        panels.append(p)
    out = os.path.join(ROOT, b["dir"], "data", "book.js")
    js = ("/* Generated by tools/reading-story/lp.py from tools/reading-story/%s.md: the 📖 Book learning path (%s), one tab per chapter. "
          "Do not edit by hand. */\nwindow.LP = %s;\n") % (b["src"], b["title"], json.dumps(
        {"key": b["key"], "n": "B", "title": "Book: " + b["title"], "panels": panels}, ensure_ascii=False, indent=1))
    open(out, "w", encoding="utf-8").write(js)
    print("built", os.path.relpath(out, ROOT), len(panels), "chapters")


if __name__ == "__main__":
    for b in BOOKS:
        build(b)
