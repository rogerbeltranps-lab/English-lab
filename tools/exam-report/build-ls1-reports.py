# LS1 exam reports (2 ESO and 4 ESO) for the student board (Roger, 1 Nov 2026: "the idea is that I don't need to make them again since all the info
# could be on their student board"). Reads his marked workbook (Drive: Notes_4ESO_definitives.xlsx, the one his Apps Script
# Code_Informes_LS1_v4_4.gs turned into PDF reports) and writes one report per student, as the board reads it in
# results/{ls}__assessment .report (today.html examView): the questions to review, the writing (rubric, feedback, mistakes table,
# original and corrected text) and what to review. Same rules as the PDFs: wrong or blank answers only; explanations and review links
# as in the script; Catalan for the Insecure (Base) route, English for the others; a writing marked "NO AVALUABLE · FIABILITAT" gets
# the reliability note and no corrections. Nothing here recalculates marks (they are imported by tools/exam-marks).
#   python3 -I tools/exam-report/build-ls1-reports.py 4eso <Notes_4ESO_definitives.xlsx> <out.json> [why-en.json]
#   python3 -I tools/exam-report/build-ls1-reports.py 4eso-six <the workbook of the 6 later 4 ESO exams> <out.json> [why-en.json]
#   python3 -I tools/exam-report/build-ls1-reports.py 2eso <2ESO_INFORMES_Writing_revisat_53_alumnes.xlsx> <out.json> [why-en.json]
# why-en.json: English for the Catalan "Per què?" lines of the mistakes table ({catalan: english}); missing ones are listed in
# <out>.todo.json. The workbook and the JSON hold personal data: keep them outside the repo.
import json, os, re, sys, difflib
import openpyxl

mode, src, out = sys.argv[1], sys.argv[2], sys.argv[3]
assert mode in ("4eso", "4eso-six", "2eso"), mode
why_en = json.load(open(sys.argv[4], encoding="utf-8")) if len(sys.argv) > 4 else {}
wb = openpyxl.load_workbook(src, read_only=True, data_only=True)
rows = lambda name: [r + (None,) * 30 for r in wb[name].iter_rows(values_only=True) if r]
s = lambda v: "" if v is None else str(v).strip()
def n(v):
    try: return float(v)
    except (TypeError, ValueError): return None
num = lambda v: (int(v) if v is not None and float(v).is_integer() else v)

BASE = "4eso/my-real-routine/"
LESSONS = {"LP2": ("LP2 · A day in real life", "a-day-in-real-life.html"), "LP3": ("LP3 · Useful expressions", "useful-expressions.html"),
           "LP4": ("LP4 · Present Simple & Phrasal verbs", "grammar-phrasal-verbs.html"), "LP5": ("LP5 · Healthy habits", "healthy-habits.html")}
lp = lambda k: {"t": LESSONS[k][0], "href": BASE + LESSONS[k][1]}
FORM_TABS = {"A": "Respuestas de formulario 1", "B": "Respuestas de formulario 2", "C": "Respuestas de formulario 3", "D": "Respuestas de formulario 4"}
# Right answers no student wrote out in full (Roger's checked answer key, as in his Apps Script). Kept out of the repo with the exam:
# an optional option-fallback.json next to the workbook, {"model|route|question": "B. answer"}.
_fb = os.path.join(os.path.dirname(os.path.abspath(src)), "option-fallback.json")
OPTION_FALLBACK = json.load(open(_fb, encoding="utf-8")) if os.path.exists(_fb) else {}
ROUTES = ["Insecure", "Safe", "Daring"]

def lesson(q, text):
    t = text.lower()
    if q >= 23: return "LP4"
    if q <= 10: return "LP5" if re.search(r"screen|sleep|water|break|healthy|stress|exercise|active", t) else "LP2"
    if re.search(r"stay hydrated|sleep|screen|break|stress|recharge|balanced diet|healthy|habit|sugary|physical", t): return "LP5"
    if re.search(r"wind down|turn in|sleep in|head out|catch up|put off|pick up|get down", t): return "LP3"
    return "LP2"
def explain(q, prompt, correct, ca):
    x = (prompt + " " + correct).lower(); T = lambda a, b: a if ca else b
    if q <= 5: return T("Aquesta és la dada correcta de l’àudio. Repassa les hores, les accions i les paraules que distingeixen les opcions.", "This is the correct listening detail. Review the times, actions and clues that distinguish the options.")
    if q <= 10: return T("Torna al text i busca la frase o les dades que justifiquen la resposta. No n’hi ha prou amb reconèixer una paraula aïllada.", "Return to the reading text and identify the details supporting the answer. Do not rely on a single familiar word.")
    if q <= 22: return T(f"Repassa el significat i la construcció de l’expressió «{correct}». Comprova que encaixi amb el context.", f"Review the meaning and pattern of “{correct}”. Check that it fits the context.")
    if re.search(r"doesn't|doesn’t|don't|don’t|negative|negativ", x): return T("En Present Simple, la negació és don’t/doesn’t + verb en forma base.", "In the Present Simple, use don’t/doesn’t + the base form.")
    if re.search(r"how often|when\s+_|does\s+_|do\s+_|question|\?", x): return T("A les preguntes de Present Simple, fem servir Do/Does + subjecte + verb base.", "For Present Simple questions, use Do/Does + subject + base verb.")
    if re.search(r"usually|often|never|always|sometimes", x): return T("Recorda la posició de l’adverbi de freqüència: abans del verb principal, després de be.", "Remember frequency-word order: before the main verb, after be.")
    if re.search(r"put .*off|pick .*up|get down to|catch up on", x): return T("Repassa els phrasal verbs i la posició de l’objecte, sobretot quan és un pronom.", "Review phrasal verbs and object position, especially with pronouns.")
    if re.search(r"by ___|after ___|before ___|\(read\)|\(have\)", x): return T("Després de by, before i after quan precedeixen un verb d’activitat, habitualment fem servir -ing.", "After by, before and after before an activity verb, we normally use -ing.")
    if re.search(r"because|although|whereas|however|so\b|as a result|but\b", x): return T("Tria el connector segons si la relació és causa, contrast o conseqüència.", "Choose the linker according to whether you express a reason, contrast or result.")
    return T("Comprova la concordança del Present Simple i la forma exacta que demana la frase.", "Check Present Simple agreement and the form required by the sentence.")
PLAN = {"LP2": ("Repassa les rutines quotidianes i escriu tres frases pròpies.", "Review daily routines and write three original sentences."),
        "LP3": ("Practica les expressions habituals i el seu ús en una frase.", "Practise useful expressions in meaningful sentences."),
        "LP4": ("Revisa el Present Simple i escriu tres frases noves de creació pròpia.", "Review the Present Simple and write three new sentences of your own."),
        "LP5": ("Repassa els hàbits saludables i justifica’n un amb because.", "Review healthy habits and explain one using because.")}
CAT_EN = {"Preposicions": "Prepositions", "Ortografia": "Spelling", "Expressió i estil": "Expression and style", "Pronoms": "Pronouns",
          "Gramàtica": "Grammar", "Vocabulari": "Vocabulary", "Puntuació": "Punctuation", "Concordança": "Agreement", "Temps verbals": "Verb tenses",
          "Ordre de les paraules": "Word order", "Connectors": "Linkers", "Articles": "Articles", "Majúscules": "Capital letters", "Lèxic": "Vocabulary", "Coherència": "Coherence"}

def marked(orig, fixed):
    """The corrected text with the changed words in *…* (the board shows them in bold, as in the learning-path corrections)."""
    a, b = re.findall(r"\S+|\s+", orig), re.findall(r"\S+|\s+", fixed); out = []
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        chunk = "".join(b[j1:j2])
        if op == "equal" or not chunk.strip(): out.append(chunk); continue
        lead = chunk[:len(chunk) - len(chunk.lstrip())]; trail = chunk[len(chunk.rstrip()):]
        out.append(lead + "\n".join("*" + line.strip() + "*" if line.strip() else line for line in chunk.strip().split("\n")) + trail)
    return re.sub(r"\*([ \t]+)\*", r"\1", "".join(out))   # neighbouring changed words in one bold run

def build_4eso():
    # question texts: the form headers, 35 per route in route order
    prompts = {}
    for model, tab in FORM_TABS.items():
        hits = []
        for v in rows(tab)[0]:
            m = re.match(r"^\s*0?([1-9]|[12]\d|3[0-5])(?:\s+|[.):-])\s*(.+)$", s(v))
            if m: hits.append((int(m.group(1)), re.sub(r"\s*\[\s*\d+\s*punts\s*\]\s*$", "", m.group(2), flags=re.I).strip()))
        assert len(hits) == 105, (tab, len(hits))
        for i, (q, text) in enumerate(hits): prompts[f"{model}|{ROUTES[i // 35]}|{q}"] = text

    reg = {s(r[0]): r for r in rows("Registre")[1:] if s(r[0])}
    wri = {}; wri_row = {}
    for i, r in enumerate(rows("Writings")[1:]):
        if s(r[0]): wri[s(r[0])] = r; wri_row[s(r[0])] = i + 2
    cri = [r for r in rows("Notes per criteri")[1:] if len(r) > 21 and s(r[21])]
    txt = {int(n(r[9])): r for r in rows("Textos corregits")[1:] if len(r) > 9 and n(r[9]) and n(r[9]) > 1}
    errs = {}
    for r in rows("Taula derrades")[1:]:
        if len(r) > 7 and n(r[7]): errs.setdefault(int(n(r[7])), []).append(r)
    ques = {}
    for r in rows("Notes per pregunta")[1:]:
        if len(r) > 13 and s(r[13]) and n(r[4]) and 1 <= n(r[4]) <= 34: ques.setdefault(s(r[13]), []).append(r)
    opts = {}
    for r in rows("Notes per pregunta")[1:]:
        if len(r) < 11 or not n(r[4]): continue
        q = int(n(r[4]))
        if (q <= 18 or 23 <= q <= 29) and s(r[10]).upper().startswith("CORRECTA") and re.match(r"^\s*[A-D]\s*[.)-]\s*\S", s(r[8]), re.I):
            opts.setdefault(f"{s(r[2])}|{s(r[3])}|{q}", []).append(s(r[8]))
    best = {k: max(set(v), key=v.count) for k, v in opts.items()}
    mail = {s(r[0]): s(r[3]).lower() for r in rows("Control correus")[1:] if r and s(r[0])}

    reports, todo = {}, set()
    for c in cri:
        key = s(c[21]); r, w = reg[key], wri[key]; name = s(r[5]); model = s(r[2]).upper(); route = s(r[3]); ca = route == "Insecure"
        email = mail.get(name) or s(r[4]).lower(); T = lambda a, b: a if ca else b
        t = txt.get(wri_row[key]); assert t, name
        rep = {"model": model, "lang": "ca" if ca else "en", "questions": []}
        wrong = [q for q in sorted(ques.get(key, []), key=lambda q: n(q[4])) if s(q[10]) in ("INCORRECTA", "SENSE RESPOSTA")]
        weight = {"LP2": 0, "LP3": 0, "LP4": 0, "LP5": 0}
        for q in wrong:
            qn = int(n(q[4])); k = f"{model}|{route}|{qn}"; prompt = prompts.get(k, f"Q{qn}")
            full = best.get(k) or OPTION_FALLBACK.get(k); valid = s(q[9])
            right = full if full and valid and full[0].upper() == valid[0].upper() else valid
            l = lesson(qn, prompt + " " + right); weight[lesson(qn, prompt + " " + valid)] += n(q[7]) or 0
            rep["questions"].append({"q": qn, "part": "Listening" if qn <= 5 else "Reading" if qn <= 10 else "Vocabulary" if qn <= 22 else "Grammar",
                "pts": num(n(q[7])), "got": num(n(q[11]) or 0), "text": prompt, "mine": "" if s(q[10]) == "SENSE RESPOSTA" else s(q[8]),
                "right": right, "why": explain(qn, prompt, right, ca), "lp": lp(l)})
        unassessable = re.search(r"NO AVALUABLE.*FIABILITAT", s(w[11]), re.I)
        wr = {"original": s(t[4]) or s(w[8])}
        if unassessable:
            wr["rubric"] = [[T("Writing (no avaluable)", "Writing (not assessable)"), 0, 20]]
            wr["note"] = T("El sistema de comprovació de similitud ha detectat coincidències textuals importants entre el Writing i el Reading del mateix examen. El Writing no ha superat el test de fiabilitat; per aquest motiu, el docent no n’ha fet la correcció lingüística ordinària. Qualificació del Writing: 0/20.",
                           "The similarity-checking system found substantial textual overlap between the Writing and the Reading passage in this exam. The Writing did not pass the reliability check, so it was not assessed using the usual language rubric. Writing score: 0/20.")
        else:
            wr["rubric"] = [[T("C1 · Tasca i contingut", "C1 · Task achievement"), num(n(w[12])), 8], ["C2 · Grammar", num(n(w[13])), 4],
                            ["C3 · Vocabulary", num(n(w[14])), 4], [T("C4 · Organització i cohesió", "C4 · Organisation and cohesion"), num(n(w[15])), 4]]
            if s(t[5]): wr["corrected"] = marked(wr["original"], s(t[5]))
            fb = s(t[6]) or s(w[22])
            if fb: wr["feedback"] = fb
            wr["errors"] = []
            for e in errs.get(wri_row[key], []):
                why = s(e[5]); cat = s(e[6])
                if not ca:
                    if why and why not in why_en: todo.add(why)
                    why = why_en.get(why, why); cat = CAT_EN.get(cat, cat)
                wr["errors"].append({"type": cat, "orig": s(e[3]), "fix": s(e[4]), "why": why})
                tt = (s(e[5]) + " " + s(e[6])).lower()
                if re.search(r"concord|gram|verb|simple|singular|negati|pregunta|adverb|phrasal", tt): weight["LP4"] += 2
                elif re.search(r"healthy|hàbit|descans|salut|son|screen", tt): weight["LP5"] += 2
                elif re.search(r"expressi|preposici|idiom|col·locaci", tt): weight["LP3"] += 1
                else: weight["LP2"] += 1
        rep["writing"] = wr
        order = sorted(weight, key=lambda k: -weight[k])
        rep["review"] = ([{"text": T(PLAN[k][0], PLAN[k][1]), "lp": lp(k)} for k in order if weight[k] > 0][:3]
                         or [{"text": T("Mantén el bon nivell: amplia el vocabulari amb expressions noves.", "Keep progressing: extend your vocabulary with new expressions."), "lp": lp("LP3")}])
        assert email and "@" in email, name
        reports[email] = rep


    return reports, todo

def err_weight(weight, why, cat):
    tt = (why + " " + cat).lower()
    if re.search(r"concord|gram|verb|simple|singular|negati|pregunta|adverb|phrasal", tt): weight["LP4"] += 2
    elif re.search(r"healthy|hàbit|descans|salut|son|screen", tt): weight["LP5"] += 2
    elif re.search(r"expressi|preposici|idiom|col·locaci", tt): weight["LP3"] += 1
    else: weight["LP2"] += 1
def plan(weight, T):
    order = sorted(weight, key=lambda k: -weight[k])
    return ([{"text": T(PLAN[k][0], PLAN[k][1]), "lp": lp(k)} for k in order if weight[k] > 0][:3]
            or [{"text": T("Mantén el bon nivell: amplia el vocabulari amb expressions noves.", "Keep progressing: extend your vocabulary with new expressions."), "lp": lp("LP3")}])
def why_of(why, ca, todo):
    if ca or not why: return why
    if why not in why_en: todo.add(why)
    return why_en.get(why, why)

# The 6 later 4 ESO exams (Roger's workbook "MY REAL ROUTINE · 6 ALUMNES", validated 28 Oct 2026): same report as the 43 above.
def build_4eso_six():
    reports, todo = {}, set()
    res = [r for r in rows("Resum") if "@" in s(r[1])]
    texts = {s(r[0]): r for r in rows("Textos writing")[3:]}
    errs = {}
    for r in rows("Errors writing")[3:]: errs.setdefault(s(r[0]), []).append(r)
    qs = {}
    for r in rows("Notes per pregunta")[3:]:
        if n(r[4]): qs.setdefault(s(r[0]), []).append(r)
    for r in res:
        name, email, model, route = s(r[0]), s(r[1]).lower(), s(r[3]).upper(), s(r[4]); ca = route == "Insecure"; T = lambda a, b: a if ca else b
        rep = {"model": model, "lang": "ca" if ca else "en", "questions": []}; weight = {"LP2": 0, "LP3": 0, "LP4": 0, "LP5": 0}
        for q in sorted(qs.get(name, []), key=lambda q: n(q[4])):
            if s(q[12]) == "CORRECTA": continue
            qn = int(n(q[4])); prompt = re.sub(r"^\s*\d+\s+", "", re.sub(r"\s*\[\s*\d+\s*punts\s*\]\s*$", "", s(q[7]), flags=re.I))
            right = s(q[9]); weight[lesson(qn, prompt + " " + right)] += n(q[10]) or 0
            rep["questions"].append({"q": qn, "part": s(q[5]), "pts": num(n(q[10])), "got": num(n(q[11]) or 0), "text": prompt,
                "mine": s(q[8]), "right": right, "why": explain(qn, prompt, right, ca), "lp": lp(lesson(qn, prompt + " " + right))})
        t = texts.get(name); assert t, name
        wr = {"original": s(t[3]), "rubric": [[T("C1 · Tasca i contingut", "C1 · Task achievement"), num(n(r[9])), 8], ["C2 · Grammar", num(n(r[10])), 4],
              ["C3 · Vocabulary", num(n(r[11])), 4], [T("C4 · Organització i cohesió", "C4 · Organisation and cohesion"), num(n(r[12])), 4]], "errors": []}
        if s(t[4]): wr["corrected"] = marked(wr["original"], s(t[4]))
        if s(t[6]): wr["feedback"] = s(t[6])
        for e in errs.get(name, []):
            cat = s(e[3]); wr["errors"].append({"type": cat if ca else CAT_EN.get(cat, cat), "orig": s(e[4]), "fix": s(e[5]), "why": why_of(s(e[6]), ca, todo)})
            err_weight(weight, s(e[6]), cat)
        rep["writing"] = wr; rep["review"] = plan(weight, T); reports[email] = rep
    return reports, todo

# 2 ESO (Roger's "INFORMES 2ESO" workbook, 53 exams): questions with their explanation and what to review, the writing, its mistakes.
LP2E = {"Listening · My Real Routine": ("LP2 · A day in my life", "a-day-in-my-life.html", "Torna a escoltar l'àudio i fixa't en les persones, les hores i les accions.", "Listen again and focus on people, times and actions."),
        "Reading · My Real Routine": ("LP3 · Same day, different person", "same-day-different-person.html", "Torna al text i busca la frase que justifica cada resposta.", "Go back to the text and find the sentence that proves each answer."),
        "Daily routines and healthy habits": ("LP5 · Healthy habits", "healthy-habits.html", "Repassa el vocabulari de les rutines i els hàbits saludables i escriu tres frases teves.", "Review the vocabulary of routines and healthy habits and write three sentences of your own."),
        "Present Simple · Grammar": ("LP4 · Present Simple", "present-simple-grammar.html", "Revisa el Present Simple (he/she + -s, don't/doesn't, preguntes) i escriu tres frases noves.", "Review the Present Simple (he/she + -s, don't/doesn't, questions) and write three new sentences.")}
def build_2eso():
    reports, todo = {}, set()
    al = [r for r in rows("ALUMNES")[1:] if s(r[0]) and "@" in s(r[5])]
    qs, errs = {}, {}
    for r in rows("PREGUNTES")[1:]:
        if s(r[0]) and n(r[4]): qs.setdefault(s(r[0]), []).append(r)
    for r in rows("ERRADES_WRITING")[1:]:
        if s(r[0]): errs.setdefault(s(r[0]), []).append(r)
    link = lambda k: {"t": LP2E[k][0], "href": "2eso/my-real-routine/" + LP2E[k][1]} if k in LP2E else {"t": k}
    for r in al:
        key, model, route, email = s(r[0]), s(r[3]).upper(), s(r[4]), s(r[5]).lower(); ca = route == "Insecure"; T = lambda a, b: a if ca else b
        rep = {"model": model, "lang": "ca" if ca else "en", "questions": []}; weight = {}
        for q in sorted(qs.get(key, []), key=lambda q: n(q[4])):
            mx, got = n(q[9]) or 0, n(q[10]) or 0
            if got >= mx: continue
            weight[s(q[12])] = weight.get(s(q[12]), 0) + mx - got
            rep["questions"].append({"q": int(n(q[4])), "part": s(q[5]), "pts": num(mx), "got": num(got), "text": s(q[6]), "mine": s(q[7]),
                "right": s(q[8]), "why": s(q[11]), "lp": link(s(q[12]))})
        wsc = n(r[10]) or 0; orig, fixed, fb = s(r[17]), s(r[18]), s(r[19])
        wr = {"original": orig, "rubric": [[T("C1 · Tasca i contingut", "C1 · Task achievement"), num(n(r[13]) or 0), 8], ["C2 · Grammar", num(n(r[14]) or 0), 4],
              ["C3 · Vocabulary", num(n(r[15]) or 0), 4], [T("C4 · Organització i cohesió", "C4 · Organisation and cohesion"), num(n(r[16]) or 0), 4]], "errors": []}
        head = fixed.split("\n", 1)
        if wsc == 0 and not re.match(r"^(English phrases|Possible corrected)", fixed): wr["note"] = fixed   # nothing of their own to correct: the teacher's note
        else:
            if len(head) == 2 and head[0].rstrip().endswith(":") and len(head[0]) < 90: wr["note"], fixed = head[0].strip(), head[1].strip()
            elif re.match(r"^(English phrases|Possible corrected|The text mainly)", fixed): wr["note"], fixed = fixed.split("\n", 1)[0].strip(), (fixed.split("\n", 1) + [""])[1].strip()
            if fixed: wr["corrected"] = marked(orig, fixed)
        if fb: wr["feedback"] = fb
        for e in errs.get(key, []):
            cat = s(e[2]); wr["errors"].append({"type": cat if ca else CAT_EN.get(cat, cat), "orig": s(e[3]), "fix": s(e[4]), "why": why_of(s(e[5]), ca, todo)})
            k = "Present Simple · Grammar" if re.search(r"present|verb|third|negat|question|agreement|subject|pronoun", cat, re.I) else "Daily routines and healthy habits"
            weight[k] = weight.get(k, 0) + 1
        rep["writing"] = wr
        rep["review"] = [{"text": T(LP2E[k][2], LP2E[k][3]), "lp": link(k)} for k in sorted(weight, key=lambda k: -weight[k]) if k in LP2E][:3]
        reports[email] = rep
    return reports, todo

reports, todo = {"4eso": build_4eso, "4eso-six": build_4eso_six, "2eso": build_2eso}[mode]()
json.dump(reports, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
json.dump(sorted(todo), open(out + ".todo.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"{len(reports)} reports → {out}; {len(todo)} 'why' lines without English → {out}.todo.json")
