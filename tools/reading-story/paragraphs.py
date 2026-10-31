"""Re-paragraph a story text the way a novel prints it (tools/reading-story/build.py).

The source text breaks paragraphs in odd places, sometimes inside a line of dialogue, so the builder joins a level's text and splits
it again: each new speaker starts a paragraph, the same speaker goes on in the same paragraph (a line with its own "X says" is taken as a new speaker), narration stays with a line of speech when
it goes on about the speaker (it starts with their name or he/she), an answer to a question is a new speaker, and the source's own breaks are kept only between two narration sentences. Quotes are straight (") in the source.
"""
import re

SPEECH = re.compile(r"\b(says?|said|asks?|asked|repl(y|ies|ied)|answer(s|ed)?|shout(s|ed)?|whisper(s|ed)?|explain(s|ed|ing)?|"
                    r"adds?|added|laugh(s|ed)?|remind(s|ed)?|cr(y|ies|ied)|call(s|ed)|writes?|wrote|reads?|"
                    r"continu(e|es|ed)|tells?|told|agree(s|d)?|jok(e|es|ed)|sigh(s|ed)?|admit(s|ted)?|insist(s|ed)?|"
                    r"promis(e|es|ed)|suggest(s|ed)?|interrupt(s|ed)?|murmur(s|ed)?|groan(s|ed)?|yell(s|ed)?|scream(s|ed)?|"
                    r"announc(e|es|ed)|types?|typed|messages?|texts?|repeat(s|ed)?|begins?|began|thinks?|thought)\b", re.I)
ABBR = ("Mr.", "Mrs.", "Ms.", "Dr.", "St.", "M.", "T.")
PRON = {"he", "she", "they", "i", "we", "you"}


def _speaker(chunk):
    for w in re.findall(r"[A-Za-zÀ-ÿ_0-9'’-]+", chunk):
        if w.lower() in PRON:
            return None                      # "she said": could be anyone, take it as the same speaker
        if w[0].isupper() and w not in ("I",):
            return w.lower()
    return None


def _attribution(inner, chunk):
    c = chunk.strip()
    if not c:
        return False
    words = c.split()
    if len(words) > 12:
        return False
    return inner.endswith(",") or c[0].islower() or c[0] in ",—-" or bool(SPEECH.search(" ".join(words[:5])))


def units(t):
    """Cut text into sentence units; a quoted span is never cut, and a speech unit keeps its "X says" part."""
    out, i, n = [], 0, len(t)
    while i < n:
        while i < n and t[i].isspace():
            i += 1
        if i >= n:
            break
        u = {"start": i, "speech": t[i] == '"', "attr": False, "speaker": None, "quote": False}
        while i < n:
            ch = t[i]
            if ch == '"':
                j = t.find('"', i + 1)
                j = n - 1 if j < 0 else j
                inner = t[i + 1:j].rstrip()
                u["lastq"] = inner
                i = j + 1
                u["quote"] = True
                rest = t[i:]
                pq = rest.find('"')
                pq = len(rest) if pq < 0 else pq
                me = re.search(r"[.!?](?=\s|$)", rest)
                pe = me.end() if me else len(rest)
                ends = inner[-1:] in ".!?" or inner.endswith("...") or inner.endswith("…")
                if pe <= pq:                      # the sentence after the quote ends before any new quote
                    chunk = rest[:pe]
                    if _attribution(inner, chunk):
                        u["attr"] = True
                        u["speaker"] = u["speaker"] or _speaker(chunk)
                        i += pe
                        break
                    if ends or not rest.strip():
                        break                     # narration starts: new unit
                    continue
                chunk = rest[:pq]                 # text before another quote
                if not chunk.strip():
                    if ends:
                        break                     # two quotes in a row: another line of dialogue
                    continue
                if _attribution(inner, chunk):
                    u["attr"] = True
                    u["speaker"] = u["speaker"] or _speaker(chunk)
                continue
            if ch in ".!?" and (i + 1 >= n or t[i + 1].isspace()):
                tail = t[max(u["start"], i - 3):i + 1]
                if not any(tail.endswith(a) for a in ABBR) or i + 2 >= n or not t[i + 2].isupper():
                    i += 1
                    break
            i += 1
        u["end"] = i
        u["text"] = t[u["start"]:i].strip()
        if u["text"]:
            out.append(u)
    return out


def paragraphs(source_paragraphs):
    """source_paragraphs: the source's paragraphs of one level. Returns the new paragraphs (plain text)."""
    t, breaks = "", set()
    for p in source_paragraphs:
        if t:
            t += " "
            breaks.add(len(t))
        t += " ".join(p.split())
    paras, cur, prev = [], [], None
    for u in units(t):
        hint = prev is not None and any(prev["end"] <= b <= u["start"] for b in breaks)
        if prev is None:
            new = True
        elif u["speech"]:
            if prev["speech"]:
                same = prev["attr"] and (not u["attr"] or (u["speaker"] is not None and u["speaker"] == prev["speaker"]))
                if same and not u["attr"] and prev.get("lastq", "").endswith("?"):
                    same = False                  # a question, then an answer

                new = not same
            elif prev["quote"]:
                new = True
            else:
                new = bool(u["speaker"]) and u["speaker"] not in prev["text"].lower()
        else:
            if prev["speech"]:
                first = (re.match(r"[A-Za-zÀ-ÿ_0-9'’-]+", u["text"]) or [""])[0].lower()
                new = not prev["attr"] or hint or not (first in PRON or first == prev["speaker"])
            else:
                new = hint or len(cur) >= 7
        if new and cur:
            paras.append(" ".join(x["text"] for x in cur))
            cur = []
        cur.append(u)
        prev = u
    if cur:
        paras.append(" ".join(x["text"] for x in cur))
    return paras
