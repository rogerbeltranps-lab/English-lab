#!/usr/bin/env python3
"""Build the reading-story books: one book-style PDF per route (Roger, 31 Oct 2026: "nice pdf book-like versions for each level").

Run: python3 tools/reading-story/build.py
Source: tools/reading-story/<course>-<ls>.md (the story text of every level, made with ChatGPT and checked word by word; teacher
notes and answer keys are in the Drive docs, not here) and <course>-<ls>-cover.jpg. Output: <LS folder>/downloads/<ls>-story-<route>.pdf,
which the LS home page shows (el-cloud.js storyCard, EL_LS[].story in el-catalog.js). Each book: cover, how to read it and contents,
then one chapter a page onwards (words box, the text re-paragraphed by paragraphs.py, two multiple-choice questions without the key).
The copyright line (shared/js/el-copyright.js) is on every page. Needs Node Playwright (print.mjs) and pypdf.
"""
import datetime, html, json, os, re, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
from story import parse, LEVELS          # noqa: E402
from paragraphs import paragraphs        # noqa: E402
from pypdf import PdfReader, PdfWriter   # noqa: E402

CEFR = {"2eso": {"beginners": "A1", "insecure": "A1+", "safe": "A2", "daring": "A2+"},
        "4eso": {"beginners": "A1", "insecure": "A2", "safe": "B1", "daring": "B1+"}}   # = EL_CEFR in el-catalog.js

BOOKS = [
    {"src": "2eso-ls2", "course": "2eso", "out": "2eso/free-time-live/downloads/ls2-story-", "title": "Maya Live!",
     "tagline": "A mystery at the skate park", "ls": "2 ESO · Free Time, Live! · LS2", "ending": "To be continued…",
     "ink": "#0f3d3e", "accent": "#e8590c", "soft": "#fff4ea", "line": "#f6c9a6", "night": "#103638"},
    {"src": "4eso-ls2", "course": "4eso", "out": "4eso/seasons-and-celebrations/downloads/ls2-story-", "title": "Lantern Night",
     "tagline": "An old lantern. A lost tradition. A secret waiting to be told.", "ls": "4 ESO · Seasons & Celebrations · LS2",
     "ending": "The end", "ink": "#4a1020", "accent": "#b4232f", "soft": "#fbf3e4", "line": "#ecd3a3", "night": "#24090f"},
]


def copyright_line():
    js = open(os.path.join(ROOT, "shared/js/el-copyright.js"), encoding="utf-8").read()
    rest = re.search(r'"© "\+new Date\(\)\.getFullYear\(\)\+"([^"]+)"', js).group(1)
    return "© %d%s" % (datetime.date.today().year, rest)


def typo(s):
    out, open_q = [], True
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
    return html.escape(typo(s), quote=False).replace("\x01", '<span class="gl">').replace("\x02", "</span>")


def mark_words(paras, words):
    """Underline the first use of each glossed word in the chapter text."""
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


def lp_label(lp, the=False):
    n = re.findall(r"LP\s*(\d+)", lp)
    if len(n) > 1:
        return "Learning Paths " + ", ".join(n[:-1]) + " and " + n[-1]
    if n:
        return "Learning Path " + n[0]
    if lp.lower().startswith("final product"):
        return "the final product" if the else "Final product"
    return lp


CSS = """
@page{size:A5}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{font-family:Caladea,'Liberation Serif',serif;color:#22262a;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.sans{font-family:Inter,'DejaVu Sans',sans-serif}
.page{break-after:page}
h1,h2,h3{font-family:'Inter Display',Inter,sans-serif;margin:0}
.intro h2{font-size:15pt;color:var(--ink);margin:0 0 3mm}
.intro p{font-size:10.5pt;line-height:1.45;margin:0 0 2mm}
.intro .ca{font-style:italic;color:#5b6168}
.toc{margin-top:6mm}
.toc h2{font-size:13pt}
.toc ol{list-style:none;padding:0;margin:3mm 0 0}
.toc li{display:flex;align-items:baseline;gap:3mm;padding:1.7mm 0;border-bottom:1px dotted var(--line);font-size:10.5pt}
.toc .n{font-family:'Inter Display',Inter,sans-serif;font-weight:700;color:var(--accent);width:6mm}
.toc .t{flex:1}
.toc .lp{font-family:Inter,sans-serif;font-size:8pt;color:#6b7280;white-space:nowrap}
.chapter{break-before:page}
.kicker{font-family:Inter,sans-serif;font-size:8pt;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:var(--accent)}
.chapter h1{font-size:19pt;line-height:1.15;color:var(--ink);margin:1.5mm 0 1.5mm}
.lpl{font-family:Inter,sans-serif;font-size:7.5pt;color:#6b7280;margin-bottom:4mm}
.words{background:var(--soft);border:1px solid var(--line);border-radius:3mm;padding:2.6mm 3.4mm;margin:0 0 4.5mm;break-inside:avoid}
.words h3{font-family:Inter,sans-serif;font-size:7.5pt;letter-spacing:.12em;text-transform:uppercase;color:var(--ink);margin-bottom:1.5mm}
.words ul{list-style:none;margin:0;padding:0;columns:2;column-gap:5mm}
.words li{font-size:9.5pt;line-height:1.35;break-inside:avoid;padding:.4mm 0}
.words b{color:var(--ink)}
.words i{color:#5b6168}
.text p{font-size:var(--fs);line-height:var(--lh);margin:0;text-align:justify;hyphens:auto;text-indent:5mm;orphans:2;widows:2}
.text p:first-child{text-indent:0}
.text p:first-child::first-letter{float:left;font-family:'Inter Display',Inter,sans-serif;font-weight:800;font-size:calc(var(--fs)*3.1);line-height:.82;margin:1.2mm 1.6mm 0 0;color:var(--accent)}
.gl{text-decoration:underline;text-decoration-style:dotted;text-decoration-color:var(--accent);text-decoration-thickness:1.2px;text-underline-offset:2px}
.think{margin-top:5mm;border-top:2px solid var(--accent);padding-top:3mm;break-inside:avoid}
.think h3{font-family:Inter,sans-serif;font-size:8pt;letter-spacing:.14em;text-transform:uppercase;color:var(--accent)}
.think .how{font-family:Inter,sans-serif;font-size:7.5pt;color:#6b7280;margin:.8mm 0 2.5mm}
.q{margin:0 0 3mm}
.q .qt{font-size:calc(var(--fs) - 0.5pt);font-weight:700;color:var(--ink);line-height:1.3}
.q .lab{font-family:Inter,sans-serif;font-size:7pt;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;display:block;margin-bottom:.6mm}
.q .ca{font-style:italic;font-weight:400;color:#5b6168;font-size:9pt;display:block}
.q ul{list-style:none;margin:1.4mm 0 0;padding:0}
.q li{font-size:calc(var(--fs) - 1pt);line-height:1.35;padding:.7mm 0 .7mm 7.5mm;position:relative}
.q li span{position:absolute;left:0;top:.5mm;width:5mm;height:5mm;border:1.2px solid var(--accent);border-radius:50%;font-family:Inter,sans-serif;font-size:6.5pt;font-weight:700;color:var(--accent);display:flex;align-items:center;justify-content:center}
.end{text-align:center;margin-top:9mm;font-family:'Inter Display',Inter,sans-serif;font-style:italic;font-size:12pt;color:var(--accent)}
.end:before{content:"✦  ✦  ✦";display:block;font-style:normal;font-size:9pt;letter-spacing:.2em;margin-bottom:3mm;color:var(--line)}
"""

COVER_CSS = """
@page{size:A5;margin:0}
.cover{width:148mm;height:210mm;background:var(--night);color:#fff;position:relative;overflow:hidden;padding:13mm 12mm 0;font-family:Inter,sans-serif}
.cover:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 80% 8%,rgba(255,255,255,.10),transparent 45%),radial-gradient(circle at 10% 95%,var(--accent),transparent 55%);opacity:.55}
.cover>*{position:relative}
.cover .brand{font-size:7.5pt;font-weight:700;letter-spacing:.3em;text-transform:uppercase;opacity:.75}
.cover h1{font-family:'Inter Display',Inter,sans-serif;font-weight:800;font-size:38pt;line-height:1;margin:7mm 0 3mm;letter-spacing:-.01em}
.cover .tag{font-family:Caladea,serif;font-style:italic;font-size:13pt;line-height:1.3;opacity:.92;max-width:115mm}
.cover .img{margin:8mm 0 0;border-radius:2.5mm;overflow:hidden;border:1.2mm solid #fff;box-shadow:0 3mm 8mm rgba(0,0,0,.45);transform:rotate(-1.2deg)}
.cover .img img{display:block;width:100%;height:auto}
.cover .foot{position:absolute;left:12mm;right:12mm;bottom:12mm;display:flex;align-items:flex-end;justify-content:space-between;gap:4mm}
.cover .pill{background:var(--accent);color:#fff;border-radius:99px;padding:2.4mm 5mm;font-weight:800;font-size:13pt;white-space:nowrap}
.cover .meta{text-align:right;font-size:8pt;line-height:1.45;opacity:.85}
.cover .copy{position:absolute;left:12mm;bottom:5mm;font-size:6.5pt;opacity:.6}
"""


def vars_css(b, lv):
    fs, lh = {"beginners": ("12.5pt", "1.6"), "insecure": ("12pt", "1.55"), "safe": ("11.5pt", "1.5"), "daring": ("11pt", "1.48")}[lv]
    return ":root{--ink:%s;--accent:%s;--soft:%s;--line:%s;--night:%s;--fs:%s;--lh:%s}" % (b["ink"], b["accent"], b["soft"], b["line"], b["night"], fs, lh)


def cover_html(b, lv, name, img, copy):
    return """<!doctype html><html lang="en"><meta charset="utf-8"><style>%s%s%s</style>
<div class="cover"><div class="brand">English Lab · Reading corner</div><h1>%s</h1><div class="tag">%s</div>
<div class="img"><img src="%s"></div>
<div class="foot"><div class="pill">%s · %s</div><div class="meta">%s<br>Six chapters · one a week</div></div>
<div class="copy">%s</div></div></html>""" % (CSS, COVER_CSS, vars_css(b, lv), esc(b["title"]), esc(b["tagline"]), img, name,
                                              CEFR[b["course"]][lv], esc(b["ls"]), esc(copy))


def body_html(b, lv, name, chapters):
    ca = lv in ("beginners", "insecure")
    intro = ["<section class=\"intro page\"><h2>How to read this book</h2>",
             "<p>Read one chapter a week at home, with the Learning Path it goes with. Read it once for the story, then again more slowly.</p>",
             "<p>The words in the box at the start help you. They are <span class=\"gl\">underlined</span> in the story.</p>",
             "<p>At the end of each chapter, circle one answer to each question. In class we talk about the chapter for ten minutes and see who guessed what happens next.</p>"]
    if ca:
        intro += ["<p class=\"ca\">Llegeix un capítol cada setmana a casa, amb el Learning Path que li toca. Llegeix-lo una vegada per entendre la història i una altra més a poc a poc.</p>",
                  "<p class=\"ca\">Les paraules del requadre de l'inici t'ajuden: estan subratllades a la història.</p>",
                  "<p class=\"ca\">Al final de cada capítol, encercla una resposta a cada pregunta. A classe en parlem deu minuts i mirem qui ha endevinat què passa després.</p>"]
    intro.append("<div class=\"toc\"><h2>Contents</h2><ol>")
    for ch in chapters:
        intro.append("<li><span class=\"n\">%d</span><span class=\"t\">%s</span><span class=\"lp\">%s</span></li>" % (ch["n"], esc(ch["title"]), lp_label(ch["lp"])))
    intro.append("</ol></div></section>")
    out = []
    for k, ch in enumerate(chapters):
        L = ch["levels"][name]
        paras = mark_words(paragraphs(L["paras"]), L["words"])
        s = ["<section class=\"chapter\"><div class=\"kicker\">Chapter %d</div><h1>%s</h1><div class=\"lpl\">Read it with %s</div>" % (ch["n"], esc(ch["title"]), lp_label(ch["lp"], True))]
        if L["words"]:
            s.append("<div class=\"words\"><h3>Words to help you%s</h3><ul>%s</ul></div>" % (" · Paraules que t'ajuden" if ca else "",
                     "".join("<li><b>%s</b> = <i>%s</i></li>" % (esc(w), esc(g)) for w, g in L["words"])))
        s.append("<div class=\"text\">" + "".join("<p>%s</p>" % esc(p) for p in paras) + "</div>")
        s.append("<div class=\"think\"><h3>Think about it</h3><div class=\"how\">Circle one answer for each question.%s</div>" % (" · Encercla una resposta a cada pregunta." if ca else ""))
        for lab, q in (("1 · Did you understand?" + (" · Ho has entès?" if ca else ""), L["gist"]), ("2 · What happens next? Guess!" + (" · Què passarà? Endevina-ho!" if ca else ""), L["next"])):
            if not q:
                continue
            qt, qca = q["q"]
            s.append("<div class=\"q\"><div class=\"qt\"><span class=\"lab\">%s</span>%s%s</div><ul>%s</ul></div>" % (lab, esc(qt),
                     ("<span class=\"ca\">%s</span>" % esc(qca)) if (qca and ca) else "",
                     "".join("<li><span>%s</span>%s</li>" % ("ABCD"[i], esc(o)) for i, o in enumerate(q.get("opts", [])))))
        s.append("</div>")
        if k == len(chapters) - 1:
            s.append("<div class=\"end\">%s</div>" % esc(b["ending"]))
        s.append("</section>")
        out.append("".join(s))
    return "<!doctype html><html lang=\"en\"><meta charset=\"utf-8\"><style>%s%s</style><body>%s%s</body></html>" % (CSS, vars_css(b, lv), "".join(intro), "".join(out))


def main():
    copy = copyright_line()
    tmp = tempfile.mkdtemp(prefix="story-")
    jobs, made = [], []
    for b in BOOKS:
        chapters = parse(os.path.join(HERE, b["src"] + ".md"))
        img = "file://" + os.path.join(HERE, b["src"] + "-cover.jpg")
        for lv, name in LEVELS:
            base = os.path.join(tmp, "%s-%s" % (b["src"], lv))
            open(base + "-cover.html", "w", encoding="utf-8").write(cover_html(b, lv, name, img, copy))
            open(base + "-body.html", "w", encoding="utf-8").write(body_html(b, lv, name, chapters))
            head = "%s · %s %s (%s)" % (b["title"], b["course"].upper(), name, CEFR[b["course"]][lv])
            jobs.append({"html": base + "-cover.html", "pdf": base + "-cover.pdf", "footer": False})
            jobs.append({"html": base + "-body.html", "pdf": base + "-body.pdf", "footer": True, "head": head, "copy": copy})
            made.append((b, lv, name, base, head))
    jf = os.path.join(tmp, "jobs.json")
    json.dump(jobs, open(jf, "w"))
    subprocess.run(["node", os.path.join(HERE, "print.mjs"), jf], check=True)
    for b, lv, name, base, head in made:
        w = PdfWriter()
        for part in ("-cover.pdf", "-body.pdf"):
            for p in PdfReader(base + part).pages:
                w.add_page(p)
        w.add_metadata({"/Title": head, "/Author": "Roger Beltran · English Lab", "/Copyright": copy})
        out = os.path.join(ROOT, b["out"] + lv + ".pdf")
        os.makedirs(os.path.dirname(out), exist_ok=True)
        with open(out, "wb") as f:
            w.write(f)
        print("built", os.path.relpath(out, ROOT), len(w.pages), "pages")


if __name__ == "__main__":
    main()
