"""Read a reading-story source (tools/reading-story/<course>-<ls>.md): chapters, levels, words, questions."""
import re

LEVELS = [("beginners", "Starter"), ("insecure", "Base"), ("safe", "Core"), ("daring", "Plus")]


def _q(line, label):
    q = line[len(label):].strip()
    m = re.match(r"(.*?)\s*\[(.*)\]\s*$", q)
    return (m.group(1), m.group(2)) if m else (q, None)


def _opts(line):
    return [re.sub(r"^[A-D]\.\s*", "", o).strip() for o in re.split(r"\s·\s(?=[A-D]\.\s)", line.strip())]


def parse(path):
    chapters = []
    for block in re.split(r"^# (?=Chapter )", open(path, encoding="utf-8").read(), flags=re.M)[1:]:
        head, *rest = block.split("\n", 1)
        m = re.match(r"Chapter (\d+) · (.*)", head.strip())
        ch = {"n": int(m.group(1)), "title": m.group(2).strip(), "levels": {}}
        text = rest[0] if rest else ""
        parts = re.split(r"^## ", text, flags=re.M)
        ch["lp"] = parts[0].strip()
        for part in parts[1:]:
            lines = [l.strip() for l in part.strip().split("\n")]
            name = lines[0].split("·")[0].strip()
            lv = {"paras": [], "words": [], "gist": None, "next": None}
            mode = "text"
            for l in lines[1:]:
                if not l:
                    continue
                if l.startswith("Words:"):
                    lv["words"] = [tuple(x.split(" = ", 1)) for x in l[6:].strip().split(" · ")]
                    mode = "q"
                elif l.startswith("Gist:"):
                    lv["gist"] = {"q": _q(l, "Gist:")}
                elif l.startswith("What happens next?"):
                    lv["next"] = {"q": _q(l, "What happens next?")}
                elif re.match(r"A\.\s", l):
                    (lv["next"] if lv["next"] else lv["gist"])["opts"] = _opts(l)
                elif mode == "text":
                    lv["paras"].append(l)
            ch["levels"][name] = lv
        chapters.append(ch)
    return chapters
