/* 📄 Term report (Roger, 23 Nov 2026: "create a personal report of the 1st term. It must include criteria, grammar and vocabulary, a progress
   of their results over time and their daily work"; "the term report must contain this somehow: Aquest primer trimestre hem treballat…";
   "Can we give feedback on this precisely?"). docs/REQUIREMENTS.md § 3 "Term report"; AGENTS.md "Term report".

   EL_TREP[term][course]: what we worked on this term, in Roger's own words (Catalan for Starter, English for everyone else), each point with
   the sources that measure it. The same file is read by the page (today.html#report) and by tools/term-report/draft.mjs (which writes each
   student's draft lines and comment), so the % a student sees is always worked out the same way (elTrepPct).

   A source is one of:
     {p: page store key, ps: [panel ids]}   the panel's latest score (state.last), never the first try
     {d: page store key, ps: [panel ids]}   done or not (shadowing, speaking: no score)
     {x: LS id, k: [exam section keys]}     that LS's exam sections (only once the results are out)
     {fp: activity id}                      a final product mark (LS1: results/{activity}.score / max)
     {g: "deck title"}                      the class games of that deck (its latest play)
   A point's % is the average of its sources that have data; null when none has. Only the steps taught to the group count (ctx.taught).
   A term with no text here gets its points from the class games the group played (elTrepWorked, below). */
(function () {
  const T1 = {
    "2eso": {
      lss: [
        { ls: "2eso-my-real-routine", name: "My Real Routine", pts: [
          { ca: "Descriure la nostra rutina diària i la d’una altra persona (<i>I get up at 7. My friend goes to bed at 10</i>).",
            en: "Describing our daily routine and someone else’s (<i>I get up at 7. My friend goes to bed at 10</i>).",
            src: [{ x: "2eso-my-real-routine", k: ["reading", "wtask"] }] },
          { ca: "Present simple: afirmatiu, negatiu i preguntes (<i>I play / I don’t play / Do you play?</i>), i la -s de tercera persona (<i>she plays, he watches</i>).",
            en: "Present simple: positive, negative and questions (<i>I play / I don’t play / Do you play?</i>), and the third-person -s (<i>she plays, he watches</i>).",
            src: [{ x: "2eso-my-real-routine", k: ["gchoose", "gcomplete", "wgrammar"] }, { p: "ls2GettingStarted2ESO", ps: ["recall"] }] },
          { ca: "Adverbis de freqüència: com de sovint fem les coses (<i>always, usually, sometimes, never</i>).",
            en: "Adverbs of frequency: how often we do things (<i>always, usually, sometimes, never</i>).",
            src: [{ g: "Grammar · Present Simple: how often?" }, { p: "ls2NowUsually2ESO", ps: ["vocabEx"] }] },
          { ca: "Connectors senzills per ordenar el que fem (<i>then, after that, because, but</i>).",
            en: "Simple linkers to put what we do in order (<i>then, after that, because, but</i>).",
            src: [{ x: "2eso-my-real-routine", k: ["worg"] }] },
          { ca: "Vocabulari de la rutina, els àpats, l’escola i el temps lliure (<i>have breakfast, brush my teeth, do homework</i>).",
            en: "Vocabulary of routines, meals, school and free time (<i>have breakfast, brush my teeth, do homework</i>).",
            src: [{ x: "2eso-my-real-routine", k: ["vchoose", "vcomplete", "wvocab"] }] },
          { ca: "Hàbits saludables: alimentació, son, activitat física i pantalles.",
            en: "Healthy habits: food, sleep, physical activity and screens.",
            src: [{ fp: "2eso/final-product", part: "ok" }] },
          { ca: "Producte final: entrevista a un company/a i vídeo amb Google Slides sobre la seva rutina, valorant si és saludable.",
            en: "Final product: an interview with a classmate and a Google Slides video about their routine, saying whether it is healthy.",
            src: [{ fp: "2eso/final-product", part: "go" }] }] },
        { fpLater: true, ls: "2eso-free-time-live", name: "Free Time, Live!", pts: [
          { ca: "Vocabulari i expressions del temps lliure i les aficions (<i>go skateboarding, hang out with friends</i>).",
            en: "Free-time and hobby vocabulary and expressions (<i>go skateboarding, hang out with friends</i>).",
            src: [{ p: "ls2GettingStarted2ESO", ps: ["vocabEx"] }, { g: "Vocabulary · Free-time activities" }, { x: "2eso-free-time-live", k: ["vocabulary"] }] },
          { ca: "La roba, l’equipament esportiu i el temps atmosfèric (<i>trainers, helmet, it’s sunny, it’s raining</i>).",
            en: "Clothes, sports kit and the weather (<i>trainers, helmet, it’s sunny, it’s raining</i>).",
            src: [{ p: "ls2Doing2ESO", ps: ["vocabEx"] }, { g: "Vocabulary · Clothes, kit and weather" }] },
          { ca: "Present continu: explicar què està fent algú ara mateix (<i>She is playing basketball right now</i>).",
            en: "Present continuous: saying what someone is doing right now (<i>She is playing basketball right now</i>).",
            src: [{ p: "ls2Doing2ESO", ps: ["grammar", "mixed"] }, { p: "ls2NowUsually2ESO", ps: ["grammar", "mixed"] }, { g: "Grammar · Present Continuous" },
              { g: "Grammar · Present Simple or Present Continuous?" }, { x: "2eso-free-time-live", k: ["grammar"] }] },
          { ca: "Un listening en directe d’un partit de bàsquet.",
            en: "A live listening of a basketball match.",
            src: [{ p: "ls2Doing2ESO", ps: ["listen", "again"] }, { x: "2eso-free-time-live", k: ["listening"] }] },
          { ca: "Expressió oral i shadowing: repetir frases en veu alta imitant la pronunciació.",
            en: "Speaking and shadowing: repeating sentences out loud, copying the pronunciation.",
            src: [{ d: "ls2GettingStarted2ESO", ps: ["speak"] }, { d: "ls2Doing2ESO", ps: ["shadow", "speak"] }, { d: "ls2NowUsually2ESO", ps: ["shadow", "speak"] }] }] }],
      how: {
        ca: ["Hem fet les activitats a través de la web English Lab i hem repassat amb jocs de vocabulari i de gramàtica.",
          "Per avaluar hem tingut en compte el treball del dia a dia, els exàmens de My Real Routine i de Free Time, Live! i el producte final de My Real Routine.",
          "El producte final de Free Time, Live! comptarà per al segon trimestre."],
        en: ["We did the activities on the English Lab website and reviewed with vocabulary and grammar games.",
          "Your mark comes from your everyday work, the My Real Routine and Free Time, Live! exams, and the My Real Routine final product.",
          "The Free Time, Live! final product will count in term 2."] } },
    "4eso": {
      lss: [
        { ls: "4eso-my-real-routine", name: "My Real Routine", pts: [
          { ca: "Descriure la vida quotidiana, els desplaçaments, les responsabilitats i com desconnectem, amb un anglès més ric i natural.",
            en: "Describing daily life, getting around, responsibilities and how we switch off, in richer, more natural English.",
            src: [{ x: "4eso-my-real-routine", k: ["reading", "wtask"] }] },
          { ca: "Present simple en contextos reals (<i>I usually catch the bus at 8</i>).",
            en: "The present simple in real contexts (<i>I usually catch the bus at 8</i>).",
            src: [{ x: "4eso-my-real-routine", k: ["grammar", "wgrammar"] }, { p: "ls2GettingStarted4ESO", ps: ["recall"] }] },
          { ca: "Phrasal verbs i expressions idiomàtiques (<i>set off, catch up on, call it a day, rush hour</i>).",
            en: "Phrasal verbs and idioms (<i>set off, catch up on, call it a day, rush hour</i>).",
            src: [{ x: "4eso-my-real-routine", k: ["vocabulary", "wvocab"] }] },
          { ca: "Connectors de causa, contrast i conseqüència (<i>because, although, whereas, however, so</i>).",
            en: "Linkers of cause, contrast and result (<i>because, although, whereas, however, so</i>).",
            src: [{ x: "4eso-my-real-routine", k: ["worg"] }, { p: "ls2Traditions4ESO", ps: ["grammarComp"] }] },
          { ca: "Hàbits saludables i benestar.",
            en: "Healthy habits and well-being.",
            src: [{ fp: "4eso/final-product", part: "ok" }] },
          { ca: "Producte final: entrevista a un company/a i vídeo amb Google Slides sobre les nostres rutines i els hàbits saludables.",
            en: "Final product: an interview with a classmate and a Google Slides video about our routines and healthy habits.",
            src: [{ fp: "4eso/final-product", part: "go" }] }] },
        { fpLater: true, ls: "4eso-seasons-and-celebrations", name: "Seasons & Celebrations", pts: [
          { ca: "La Castanyada i Halloween: vocabulari de la tardor (<i>chestnuts, pumpkin, fallen leaves</i>), listening i expressió oral.",
            en: "La Castanyada and Halloween: autumn vocabulary (<i>chestnuts, pumpkin, fallen leaves</i>), listening and speaking.",
            src: [{ p: "ls2GettingStarted4ESO", ps: ["words", "listen"] }, { g: "Vocabulary · Autumn words" }, { d: "ls2GettingStarted4ESO", ps: ["speak"] }] },
          { ca: "Festes d’arreu del món: costums, dates i símbols, amb un vídeo real sobre Diwali.",
            en: "Celebrations around the world: customs, dates and symbols, with a real video about Diwali.",
            src: [{ p: "ls2Celebrations4ESO", ps: ["vocabEx", "read", "listen"] }, { g: "Vocabulary · Celebrations around the world" }, { x: "4eso-seasons-and-celebrations", k: ["vocabulary", "reading"] }] },
          { ca: "Descriure tradicions (<i>Diwali is celebrated in autumn. It takes place in October or November</i>).",
            en: "Describing traditions (<i>Diwali is celebrated in autumn. It takes place in October or November</i>).",
            src: [{ p: "ls2Celebrations4ESO", ps: ["grammar", "mixed"] }, { g: "Grammar · Customs, dates and It is celebrated" }, { x: "4eso-seasons-and-celebrations", k: ["writing"] }] },
          { ca: "Past simple i used to per parlar del passat i de l’origen de les tradicions (<i>People used to carve turnips. They lit fires</i>).",
            en: "The past simple and <i>used to</i> to talk about the past and where traditions come from (<i>People used to carve turnips. They lit fires</i>).",
            src: [{ p: "ls2Traditions4ESO", ps: ["grammar"] }, { g: "Grammar · Origins, relatives and contrast" }, { x: "4eso-seasons-and-celebrations", k: ["grammar"] }] }] }],
      how: {
        ca: ["Hem fet les activitats a través de la web English Lab i hem repassat amb jocs de vocabulari i de gramàtica.",
          "Per avaluar hem tingut en compte el treball del dia a dia, els exàmens de My Real Routine i de Seasons & Celebrations i el producte final de My Real Routine.",
          "El producte final de Seasons & Celebrations comptarà per al segon trimestre."],
        en: ["We did the activities on the English Lab website and reviewed with vocabulary and grammar games.",
          "Your mark comes from your everyday work, the My Real Routine and Seasons & Celebrations exams, and the My Real Routine final product.",
          "The Seasons & Celebrations final product will count in term 2."] } }
  };
  // fpLater: this LS's final product counts in the next term, so the report leaves it out (Roger, 25 Nov 2026: "the final product of the
  // LS2 shouldn't be included in the report")
  // deadline: the last day activities still count for the term's report (its "Draft" line: Fri 27 Nov 2026 for term 1)
  // timing: when the activities were done (on time, late, at the last minute) is said in the comment only from term 2 (Roger, 28 Nov 2026:
  // "it should be in the comments (but not in this ones because I was building the web)"). Term 1's report still shows it in its daily work box.
  Object.values(T1).forEach(c => { c.timing = false; });
  window.EL_TREP = { t1: T1 };
  window.EL_TREP_DEADLINE = { t1: "2026-11-27" };

  // A point's % for one student. ctx = {pg: {lsId: {storeKey: state (string or object)}}, rs: {activity: result}, games: [{title, r, of}],
  // held: lsId => true while that exam's results are held}. Returns {pct, n} (n = sources with data) or {pct: null, n: 0}.
  const st = (ctx, key) => { for (const l of Object.values(ctx.pg || {})) { const v = l && l[key]; if (v) { try { return typeof v === "string" ? JSON.parse(v) : v; } catch (e) { return null; } } } return null; };
  function one(s, ctx) {
    // only the steps taught to the group: a step still 🔒 locked for the group is left out, never 0 (problem report, 2ESOB, 27 Nov 2026;
    // Roger, 27 Nov 2026). ctx.taught(key, step) → bool (elTrepTaught), or ctx.due(key) = Set of the step ids taught
    const k = s.p || s.d, due = !ctx.taught && ctx.due && k ? ctx.due(k) : null;
    const ps = (s.ps || []).filter(id => ctx.taught ? ctx.taught(k, id) : due ? due.has(id) : true);
    if ((s.p || s.d) && !ps.length) return null;
    if (s.p) { const S = st(ctx, s.p); if (!S) return null; const L = S.last || {}, T = S.tries || {}; let a = 0, b = 0;
      ps.forEach(id => { const y = L[id] || T[id]; if (y && y.max) { a += +y.score || 0; b += +y.max; } }); return b ? a / b * 100 : null; }
    if (s.d) { const S = st(ctx, s.d); if (!S) return null; const dn = S.done || {}; return ps.filter(id => dn[id]).length / ps.length * 100; }
    if (s.x) { if (ctx.held && ctx.held(s.x)) return null; const sc = ((ctx.rs || {})[s.x + "/assessment"] || {}).sections || {}; let a = 0, b = 0;
      s.k.forEach(k => { const y = sc[k]; if (y && y.score != null && y.max) { a += +y.score; b += +y.max; } }); return b ? a / b * 100 : null; }
    if (s.fp) { const f = (ctx.rs || {})[s.fp] || {}; return f.max && f.score != null ? f.score / f.max * 100 : null; }
    if (s.g) { const g = (ctx.games || []).filter(x => x && x.title === s.g && x.of).sort((x, y) => String(y.day || "").localeCompare(String(x.day || "")))[0];
      return g ? (+g.r || 0) / g.of * 100 : null; }
    return null; }
  window.elTrepPct = function (pt, ctx) { const v = (pt.src || []).map(s => one(s, ctx)).filter(x => x != null);
    return v.length ? { pct: Math.round(v.reduce((n, x) => n + x, 0) / v.length), n: v.length } : { pct: null, n: 0 }; };
})();

/* 📄 Reports that build themselves (Roger, 26 Nov 2026: "I want the report's to get done alone according to the activities done and
   criteria"; 27 Nov 2026: "reports must be done as we do activities, meaning they pull the information automatically on their own").
   docs/REQUIREMENTS.md § 3 "Term report". Everything the report says about a student is worked out here from their own data each time the
   page opens (today.html#report) or the drafts run (tools/term-report/draft.mjs), with the same code in both places:
     elTrepTaught(gid, infoOf, upTo)  → (store key, step) => was that step taught to the group (on the Time plan agenda up to upTo, ticked as
                                         done in class or set as homework: elDueBefore, the same test as ✅ To do and the marking). A step
                                         that was never unlocked never counts, in a point's % or in the daily work.
     elTrepWorked(term, course, games) → the term's "What we worked on": Roger's own text (EL_TREP) when he wrote one, otherwise one point per
                                         grammar and vocabulary class game the group played that term (its % = the student's latest play).
     elTrepBuild(C, ctx)               → {pts: [{pct, line, ca}], strong, work, time, comment, commentCa}: what termReports/{email} holds, now live.
   ctx = {course, group, lang ("ca" | "en"), pg, rs, games, taught, infoOf (ls id → ls doc), term: {from, to, deadline}, lp (store key → the
   learning path's data, or null: the page does not load it), prev (the saved draft: a point keeps its written line while its % is the same)}. */
(function () {
  // a date as YYYY-MM-DD: an ISO text, a time in ms or a Firestore time ({seconds}); "" when it is none of them
  const day = s => { if (!s) return ""; if (typeof s === "object" && s.seconds != null) s = s.seconds * 1000; if (typeof s === "number" || /^\d{9,}$/.test(s)) { const d = new Date(+s); return isNaN(d) ? "" : d.toISOString().slice(0, 10); }
    const t = String(s).slice(0, 10); return /^\d{4}-\d\d-\d\d$/.test(t) ? t : ""; }, addD = (d, n) => { const x = new Date(d + "T12:00:00Z"); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
  const monday = d => { const x = new Date(d + "T12:00:00Z"), k = (x.getUTCDay() + 6) % 7; x.setUTCDate(x.getUTCDate() - k); return x.toISOString().slice(0, 10); };
  const strip = h => String(h == null ? "" : h).replace(/<[^>]+>/g, "");
  const esc = x => String(x == null ? "" : x).replace(/[<>]/g, "");   // students' own text in the lines: no tags (the page escapes everything but <i>)
  const norm = s => String(s == null ? "" : s).toLowerCase().replace(/[’‘`´]/g, "'").replace(/[.!?¡¿,;:"“”]+/g, " ").replace(/\s+/g, " ").trim();
  const lc = s => /^(La |Halloween|Diwali|Free |My |Seasons)/.test(s) ? s : s[0].toLowerCase() + s.slice(1);
  const short = p => strip(p).split(/[:(]/)[0].trim().replace(/\.$/, "");
  const parse = v => { if (!v) return null; try { return typeof v === "string" ? JSON.parse(v) : v; } catch (e) { return null; } };
  const st = (ctx, key) => { for (const l of Object.values(ctx.pg || {})) { const v = parse(l && l[key]); if (v) return v; } return null; };
  const actOfKey = key => (window.EL_CATALOG || []).find(a => (a.keys || []).includes(key)) || null;

  window.elTrepTaught = function (gid, infoOf, upTo) {
    const DB = {};
    return function (key, step) {
      const a = actOfKey(key); if (!a || a.optional || !window.elDueBefore || !window.elTabsOf) return true;
      if (!(a.ls in DB)) DB[a.ls] = gid ? elDueBefore(infoOf(a.ls) || {}, gid, upTo) : null;
      const db = DB[a.ls]; if (!db || db.acts.has(a.id)) return true;
      const all = elTabsOf(a); if (!all || !all.some(x => x.includes(step))) return true;   // a step outside the tabs: not held back
      const ps = db.tabs[a.id]; if (!ps || !ps.size) return false;
      const g = elTabsOf(a, new Set([...ps].map(x => elTabOf(a.id, x)))); return !!g && g.some(x => x.includes(step)); }; };

  // the class day of every tab: {"activity#tab": YYYY-MM-DD}, the earliest of the agenda, the tick "done in class" and the homework's day
  window.elTrepClassDays = function (info, gid, upTo) {
    const o = {}, put = (k, d) => { if (!d || d === true || (upTo && d > upTo)) return; k = String(k); const i = k.indexOf("#"); if (i < 0 || /^note:|#game:/.test(k)) return;
      const id = k.slice(0, i), p = window.elTabOf ? elTabOf(id, k.slice(i + 1)) : k.slice(i + 1); if (!p) return; const kk = id + "#" + p; if (!o[kk] || d < o[kk]) o[kk] = d; };
    const ag = window.elAgendaOf ? elAgendaOf(info, gid) : null;
    Object.entries((ag && ag.days) || {}).forEach(([d, its]) => (its || []).forEach(it => put(it, d)));
    Object.entries(((info && info.done) || {})[gid] || {}).forEach(([k, d]) => put(k, d));
    Object.values(((info && info.homework) || {})[gid] || {}).forEach(h => { if (!h || !h.tabs || typeof h.tabs !== "object" || !h.set) return;
      Object.entries(h.tabs).forEach(([id, ps]) => (ps || []).forEach(p => put(id + "#" + p, h.set))); });
    return o; };

  // "What we worked on": Roger's own text, or the grammar and vocabulary class games of the term (one point each)
  window.elTrepWorked = function (term, course, games) {
    const C = ((window.EL_TREP || {})[term] || {})[course]; if (C) return C;
    const [from, to] = window.elTermSpan ? elTermSpan(term) : ["", "9999-12-31"];
    const lss = (window.EL_LS || []).filter(l => l.course === course), by = {};
    (games || []).forEach(g => { if (!g || !g.title || !g.ls || !g.of || (g.day && (day(g.day) <= from || day(g.day) > to))) return;
      const l = lss.find(x => x.id === g.ls); if (!l) return; (by[l.id] = by[l.id] || new Set()).add(g.title); });
    const out = lss.filter(l => by[l.id]).map(l => ({ ls: l.id, name: String(l.title).replace(/^\S+ · /, ""), pts: [...by[l.id]].sort().map(tt => {
      const n = tt.replace(/^(Grammar|Vocabulary) · /, ""), gr = /^Grammar/.test(tt);
      return { ca: (gr ? "Gramàtica: " : "Vocabulari: ") + n, en: (gr ? "Grammar: " : "Vocabulary: ") + n, src: [{ g: tt }] }; }) }));
    return out.length ? { auto: true, lss: out, how: { ca: ["Hem fet les activitats a través de la web English Lab i hem repassat amb jocs de vocabulari i de gramàtica.",
      "Per avaluar comptem les activitats corregides que hem fet a classe o que eren deures, i els exàmens."],
      en: ["We did the activities on the English Lab website and reviewed with vocabulary and grammar games.",
        "Your mark comes from the corrected activities we did in class or set as homework, and the exams."] } } : null; };

  // 📄 Term 1, Term 2, Term 3 or the final report of the whole year (Roger, 28 Nov 2026: "I should have a 1st term, 2n term, 3rd term and final
  // mark report option (with all the competences of the school year"). scope "t1" | "t2" | "t3" | "y" → {scope, C, lss, exams, term, upTo}:
  //   C      what we worked on (t1: Roger's text; t2, t3: elTrepWorked; y: every term's points, LS by LS); never null for t2, t3 and y
  //   lss    every LS of the course (t2, t3, y), so the daily work counts each tab taught in the term, whichever LS it belongs to
  //   exams  the LSs whose exam the comment names: the term's own LSs (EL_LS .term or two per term), every LS for the year
  //   term   {id, from, to, deadline}: to is today while the term is running; the final report's daily work starts with term 2, because
  //          when the work was done counts from term 2 (Roger, 28 Nov 2026: "not in this ones because I was building the web")
  //   upTo   the day after the term's last day once it has ended (elTrepTaught), else undefined (today)
  const lsTermOf = (l, all) => Math.min(3, l.term || Math.ceil((all.indexOf(l) + 1) / 2));
  window.elTrepScope = function (scope, course, games, today) {
    today = today || (window.ELWeek && ELWeek.today()) || new Date().toISOString().slice(0, 10);
    const TS = window.EL_TERMS || [], all = (window.EL_LS || []).filter(l => l.course === course), DL = window.EL_TREP_DEADLINE || {};
    const span = id => window.elTermSpan ? elTermSpan(id) : ["", "9999-12-31"], cut = d => d > today ? today : d;
    if (scope === "t1") { const [from, to] = span("t1"); return { scope, C: ((window.EL_TREP || {}).t1 || {})[course] || null, term: { id: "t1", from, to, deadline: DL.t1 }, upTo: to < today ? addD(to, 1) : undefined }; }
    const HOW = { ca: ["Hem fet les activitats a través de la web English Lab i hem repassat amb jocs de vocabulari i de gramàtica.", "Per avaluar comptem les activitats corregides que hem fet a classe o que eren deures, i els exàmens."],
      en: ["We did the activities on the English Lab website and reviewed with vocabulary and grammar games.", "Your mark comes from the corrected activities we did in class or set as homework, and the exams."] };
    if (scope === "y") { const by = {}, order = [];
      ["t1", "t2", "t3"].forEach(t => { const c = elTrepWorked(t, course, games); ((c && c.lss) || []).forEach(l => { const o = by[l.ls] || (by[l.ls] = { ls: l.ls, name: l.name, pts: [] }); if (!order.includes(l.ls)) order.push(l.ls);
        l.pts.forEach(p => { if (!o.pts.some(q => q.en === p.en)) o.pts.push(p); }); }); });
      const t3 = span("t3"), last = TS.length ? TS[TS.length - 1].id : "t3";
      return { scope, C: { year: true, lss: order.map(id => by[id]), how: { ca: [HOW.ca[0], "La nota del curs surt de les competències de tot l'any: cada trimestre compta més que l'anterior (1r ×1, 2n ×2, 3r ×3)."],
          en: [HOW.en[0], "Your year mark comes from your competences across the whole year: each term counts more than the one before (Term 1 ×1, Term 2 ×2, Term 3 ×3)."] } },
        lss: all.map(l => l.id), exams: all.map(l => l.id), term: { id: "y", from: span("t1")[1], to: cut(t3[1]), deadline: DL.y || DL[last] }, upTo: t3[1] < today ? addD(t3[1], 1) : undefined }; }
    const n = +String(scope).slice(1), [from, to] = span(scope), C = elTrepWorked(scope, course, games) || { auto: true, lss: [], how: HOW };
    return { scope, C, lss: all.map(l => l.id), exams: all.filter(l => lsTermOf(l, all) === n).map(l => l.id), term: { id: scope, from, to: cut(to), deadline: DL[scope] }, upTo: to < today ? addD(to, 1) : undefined }; };
  // the words that change with the report: this term / this school year, next term / next year, and the activities' deadline
  const DAYS = { ca: ["diumenge", "dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte"], en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] };
  const MON = ["gener", "febrer", "març", "abril", "maig", "juny", "juliol", "agost", "setembre", "octubre", "novembre", "desembre"];
  window.elTrepWords = function (scope, L, deadline, today) { const ca = L === "ca", yr = scope === "y", nextYr = yr || scope === "t3";
    let by; if (deadline) { const d = new Date(deadline + "T12:00:00Z"), days = (d - new Date((today || deadline) + "T12:00:00Z")) / 864e5, dn = d.getUTCDate(), m = d.getUTCMonth();
      by = days >= 0 && days <= 6 ? (ca ? "abans de " : "before ") + DAYS[ca ? "ca" : "en"][d.getUTCDay()]
        : ca ? `abans ${dn === 1 || dn === 11 ? "de l'" : "del "}${dn} ${/^[aeiou]/.test(MON[m]) ? "d'" : "de "}${MON[m]}` : `before ${dn} ${d.toLocaleDateString("en-GB", { month: "long", timeZone: "UTC" })}`; }
    else by = ca ? (yr ? "abans que acabi el curs" : "abans que acabi el trimestre") : (yr ? "before the end of the school year" : "before the end of the term");
    return ca ? { tw: yr ? "aquest curs" : "aquest trimestre", nx: nextYr ? "el curs vinent" : "el proper trimestre", Nx: nextYr ? "El curs vinent" : "El proper trimestre", Anx: nextYr ? "El curs vinent" : "Al proper trimestre", by }
      : { tw: yr ? "this school year" : "this term", nx: nextYr ? "next year" : "next term", Nx: nextYr ? "Next year" : "Next term", Anx: nextYr ? "Next year" : "Next term", by }; };
  // what a saved report keeps of its points (t2, t3, the year): their words, so the list and the page show them even when the games change
  window.elTrepPoints = C => ((C && C.lss) || []).map(l => ({ ls: l.ls, name: l.name, pts: l.pts.map(p => ({ ca: p.ca, en: p.en })) }));

  // a writing mistake only illustrates the rubric row of its point (Roger, 25 Nov 2026: "did we really do this?")
  const WKIND = t => { t = String(t || ""); return /spell|ortogra/i.test(t) ? "spell" : /task|reused|content|tasca/i.test(t) ? "task" : /punctu|capital|linker|connect|cohes|organi|paragraph|majúsc|puntua/i.test(t) ? "org"
    : /vocab|expression|colloc|phrasal|word|time|lèxic|expressi/i.test(t) ? "vocab" : "grammar"; };
  const WKEY = { wtask: "task", wgrammar: "grammar", wvocab: "vocab", worg: "org" };
  const latestGame = (ctx, title) => (ctx.games || []).filter(g => g && g.title === title).sort((a, b) => String(b.day || "").localeCompare(String(a.day || "")))[0] || null;
  // a typed question still answered wrongly now (the latest answer, never the first try); needs the path's data (draft.mjs)
  function wrongNow(ctx, key, panels) { const s = st(ctx, key), L = ctx.lp && ctx.lp(key); if (!s || !L) return []; const out = [];
    panels.forEach(pid => { if (ctx.taught && !ctx.taught(key, pid)) return; const a = (s.ans || {})[pid], P = (L.panels || []).find(p => p.id === pid); if (!a || !P || !Array.isArray(a.q) || !Array.isArray(a.v)) return;
      a.q.forEach((q, i) => { const it = (P.items || []).find(x => norm(strip(x.q)) === norm(strip(q))); if (!it || !Array.isArray(it.a)) return; const v = a.v[i];
        if (v == null || v === "" || typeof v !== "string") return; if (it.a.some(x => norm(x) === norm(v))) return;
        out.push({ q: strip(q), mine: v, fix: it.a[0], ca: it.ca || it.he || it.en, en: it.he || it.en || it.ca }); }); }); return out; }
  function evidence(ctx, pt) { const ev = [];
    for (const s of pt.src) {
      if (s.g) { const g = latestGame(ctx, s.g); ((g && g.miss) || []).forEach(m => m && m.q && m.ok && ev.push({ k: "game", q: strip(m.q), mine: m.a, fix: m.ok })); }
      if (s.p) ev.push(...wrongNow(ctx, s.p, s.ps).map(x => Object.assign({ k: "lp" }, x)));
      if (s.x) { const r = ((ctx.rs || {})[s.x + "/assessment"] || {}).report || {};
        const parts = { listening: "Listening", reading: "Reading", vocabulary: "Vocabulary", grammar: "Grammar", vchoose: "Vocabulary", vcomplete: "Vocabulary", gchoose: "Grammar", gcomplete: "Grammar" };
        const want = new Set(s.k.map(k => parts[k]).filter(Boolean));
        (r.questions || []).filter(q => q && !q.ok && want.has(q.part) && q.right).forEach(q => ev.push({ k: "exam", q: strip(q.text || ""), mine: strip(q.mine || ""), fix: strip(q.right).replace(/\.$/, ""), why: q.why }));
        const wk = s.k.includes("writing") ? null : new Set(s.k.map(k => WKEY[k]).filter(Boolean));
        if (wk === null || wk.size) ((r.writing || {}).errors || []).filter(e => e && WKIND(e.type) !== "spell" && (wk === null || wk.has(WKIND(e.type)))).forEach(e => ev.push({ k: "write", mine: e.orig, fix: e.fix, why: e.why })); }
      if (s.fp) { const fb = String(((ctx.rs || {})[s.fp] || {}).feedback || ""); const ok = fb.split("\n").find(l => /^✔/.test(l.trim())), go = fb.split("\n").find(l => /^➜/.test(l.trim()));
        if (ok) ev.push({ k: "fpok", t: ok.trim().replace(/^✔\s*/, "") }); if (go) ev.push({ k: "fpgo", t: go.trim().replace(/^➜\s*/, "") }); } }
    return ev; }
  const BAND = { ca: [[90, "Excel·lent."], [80, "Molt bé."], [60, "Bé."], [50, "Hi vas arribant."], [0, "Aquí has de treballar més."]], en: [[90, "Excellent."], [80, "Very good."], [60, "Good."], [50, "Getting there."], [0, "This needs more work."]] };
  function lineOf(pct, ev, L, pt) { if (pct == null) return L === "ca" ? "Encara no has fet prou activitats d'aquest punt per saber com et va." : "You haven't done enough activities on this point yet for us to know how it's going.";
    const b = BAND[L].find(([m]) => pct >= m)[1], e = ev.find(x => x.k !== "fpok" && x.k !== "fpgo" && strip(x.fix).trim()), ok = ev.find(x => x.k === "fpok"), go = ev.find(x => x.k === "fpgo");
    const fpw = (pt.src.find(s => s.fp) || {}).part;   // a final product split in two points: the first says what went well, the second what to improve
    if (ok || go) return [b, fpw !== "go" && ok ? esc(ok.t) : "", fpw !== "ok" && pct < 90 && go ? (L === "ca" ? "Per millorar: " : "To improve: ") + esc(go.t) : ""].filter(Boolean).join(" ");
    if (pct >= 90) return b;
    if (!e) return b + " " + (pct >= 60 ? (L === "ca" ? "Continua així." : "Keep it up.") : pt.src.some(s => s.d) ? (L === "ca" ? "Fes les gravacions i el shadowing que et falten: és la millor manera de guanyar fluïdesa." : "Do the recordings and shadowing you still have to do: it is the best way to become fluent.") : (L === "ca" ? "Torna a fer aquestes activitats i fixa't en l'explicació de cada error." : "Do these activities again and read the explanation of each mistake."));
    const fx = `<i>${esc(String(e.fix).replace(/\.$/, ""))}</i>`, mn = e.mine ? `<i>${esc(e.mine)}</i>` : "", rule = strip(L === "ca" ? (e.ca || e.why || "") : (e.en || e.why || "")), eq = esc(e.q);
    if (e.k === "write") return `${b} ${L === "ca" ? "Al teu writing" : "In your writing"}: ${mn} → ${fx}.${rule ? " " + rule : ""}`;
    if (e.k === "exam") return `${b} ${L === "ca" ? "A l'examen" : "In the exam"}, “${eq}”: ${L === "ca" ? "la resposta era" : "the answer was"} ${fx}.`;
    return `${b} ${L === "ca" ? "Vigila" : "Watch out"}: “${eq}” → ${fx}.${rule ? " " + rule : ""}`; }

  // when the work was done: every tab taught in the term (its class day), done in the week of its class, later, or at the last minute
  // The same measures, tab by tab, are what the student sees all term in 🎓 My progress › 📋 How I'm working (Roger, 28 Nov 2026: "it's a
  // good idea that the students see that during the term… a table with their progress easy to understand"; today.html howCard):
  // elTrepTabs(LS ids, ctx) gives the summary below plus rows = [{ls, a (activity), tab, day (its class day), at (the day it was finished, or "")}]
  // ctx.lss (elTrepScope): every LS of the course, so a term counts all the tabs taught in it, whichever LS they belong to
  function timing(C, ctx) { return tabs(ctx.lss || C.lss.map(x => x.ls), ctx); }
  window.elTrepTabs = (ids, ctx) => tabs(ids, ctx);
  function tabs(ids, ctx) {
    const T = ctx.term || {}, to = T.to || "9999-12-31", from = T.from || "", G = window.EL_GRADING || {}, W = window.ELWeek, rows = [];
    const lss = ids.filter(id => G[id] && !G[id].only);   // LS1 (exam and final product only): its paths were practice
    let due = 0, dn = 0, inWeek = 0, lastMin = 0, lateN = 0, exam = null, start = null; const wk = {};
    lss.forEach(ls => { const p = (window.EL_PLAN || {})[ls], gi = p && W ? W.col(p, ctx.group) : -1;
      // with ctx.lss, only an exam of the term (or up to two weeks after it ends, as the LS2 exams after term 1) is "the exam"
      if (p && gi >= 0 && p.exam && p.exam[gi] && (!ctx.lss || (p.exam[gi] > from && p.exam[gi] <= addD(to, 14)))) exam = p.exam[gi];
      const sp = p && W && W.span(p); if (sp && (!ctx.lss || (sp[1] || "9999") > from) && (!start || sp[0] < start)) start = sp[0];
      const info = ctx.infoOf ? ctx.infoOf(ls) : null; let days = elTrepClassDays(info, ctx.group, to);
      // a group with no Time plan agenda and no ticks: each path's tabs on its due day of the plan (EL_PLAN due), as ✅ To do does then
      if (!Object.keys(days).length && p && gi >= 0 && W) (window.EL_CATALOG || []).filter(a => a.ls === ls).forEach(a => { const d = W.due(p, a.id, gi); if (!d || d > to) return;
        ((window.EL_SECTIONS || {})[a.id] || []).forEach(([tab]) => { days[a.id + "#" + tab] = d; }); });
      (window.EL_CATALOG || []).filter(a => a.ls === ls && !a.manual && !a.optional).forEach(a => {
        const S = (a.keys || []).map(k => st(ctx, k)).filter(Boolean), D = Object.assign({}, ...S.map(s => s.done || {})), A = Object.assign({}, ...S.map(s => s.doneAt || {}));
        Object.entries(D).forEach(([pid, v]) => { const at = v && day(A[pid]); if (at) wk[monday(at)] = (wk[monday(at)] || 0) + 1; });   // the weekly bars: every step finished
        Object.entries(days).forEach(([k, d]) => { if (!k.startsWith(a.id + "#") || d <= from) return; const tab = k.slice(a.id.length + 1);
          const steps = window.elSecSteps ? elSecSteps(a, tab) : [tab]; if (!steps.length) return; due++; const row = { ls, a, tab, day: d, done: false, at: "" }; rows.push(row);
          if (!steps.every(s => D[s])) return; dn++; row.done = true; const at = day(steps.map(s => A[s]).filter(Boolean).sort().pop()); if (!at) return; row.at = at;
          if (at <= addD(d, 7)) inWeek++; else { lateN++; if (at >= addD(to, -6) || (exam && at >= addD(exam, -3) && at <= exam)) lastMin++; } }); }); });
    // the bars start with the term: its first school day (the Monday after a term that ends on a Friday)
    if (ctx.lss && start && from && start <= from) { start = addD(from, 1); const wd = new Date(start + "T12:00:00Z").getUTCDay(); if (wd === 6 || wd === 0) start = addD(start, wd === 6 ? 2 : 1); }
    const weeks = []; if (start) for (let w = monday(start); w <= monday(exam && exam > to ? exam : to); w = addD(w, 7)) { weeks.push({ d: w, n: wk[w] || 0 }); if (weeks.length > 30) break; }
    const p = due ? Math.round(inWeek / due * 100) : 0, lm = dn ? Math.round(lastMin / dn * 100) : 0, prof = !due ? null : !dn ? "none" : p >= 70 ? "steady" : lm >= 40 ? "last" : "behind";
    return { due, done: dn, late: lateN, inWeek: p, lastMin: lm, profile: prof, weeks, exam, rows }; }

  // the comment, in Roger's voice (never a name), from a fixed bank of objective sentences: each one says only what the activities, the
  // Time plan dates or the exams show (Roger, 28 Nov 2026: "a bank of sentences… that are objective and that can be observed in the
  // activities"), each with its Catalan for the butlletí de notes ("per every sentence that we build in English we need the catalan version").
  // Exams by their level, never their numbers or questions ("avoid exam numbers, you can say your exam and task showed a Very Good mark results").
  // {x} = filled in; the bank is printed for Roger by tools/term-report/bank.mjs.
  const BANK = window.EL_TREP_BANK = {
    work:     { when: "Everyday work, first (Roger, 28 Nov 2026: the exam is not what matters most): the average % of the points of “What we worked on” (activities, class games, hand-ins) as a level", en: "Your everyday work {tw} (activities, class games and the work you handed in) showed {d} results.", ca: "La teva feina de cada dia {tw} (activitats, jocs de classe i les feines que has entregat) ha mostrat un {d}." },
    progUp:   { when: "Progress: the activities' latest answers are 10 points or more above the first tries (the student went back and corrected them)", en: "You make progress when you correct your work: your answers now are much better than your first tries.", ca: "Progresses quan corregeixes la feina: les teves respostes d'ara són molt millors que els primers intents." },
    progNone: { when: "Progress: first tries had many mistakes (under 70 %) and the student hardly corrected them", en: "You can still correct many of your answers: going back to your mistakes is how you make progress.", ca: "Encara pots corregir moltes de les teves respostes: tornar als errors és com es progressa." },
    onTime:   { when: "From term 2 (never in term 1). Daily work: 70 % or more of the activities due were done in the week of their class", en: "You did your activities on time: most of them in the same week as the class. Keep it up.", ca: "Has fet les activitats a temps: la majoria, la mateixa setmana de la classe. Continua així." },
    notOnTime:{ when: "From term 2 (never in term 1). Daily work: under 70 % done in the week of the class (and not mostly at the last minute)", en: "You didn't do all your activities on time: you did {done} of the {due} activities we did in class.", ca: "No has fet totes les activitats a temps: n'has fet {done} de les {due} que vam fer a classe." },
    late:     { when: "From term 2. …and 3 or more were done after the week of their class", en: "{late} of them were done after the week of the class.", ca: "{late} les vas fer després de la setmana de la classe." },
    lastMin:  { when: "From term 2 (never in term 1). Daily work: 40 % or more of what was done was done in the last week of term or the 3 days before the exam", en: "You left many activities until the end of the term or just before the exam, so there was less time to practise.", ca: "Vas deixar moltes activitats per al final del trimestre o just abans de l'examen, i així vas tenir menys temps per practicar." },
    none:     { when: "Daily work: none of the activities due is done", en: "You haven't done the activities we did in class yet: they are the basis of your mark.", ca: "Encara no has fet les activitats que vam fer a classe: són la base de la nota." },
    best:     { when: "Points of “What we worked on”: the one or two with the best % (70 % or more)", en: "Your work shows your strongest points: {x}.", ca: "La teva feina mostra els teus punts forts: {x}." },
    focus:    { when: "Points: the one with the lowest % (under 70 %)", en: "Your work shows the point you need to work on most: {x}.", ca: "La teva feina mostra el punt que has de treballar més: {x}." },
    tipWrite: { when: "…and that point's mistakes are in a corrected writing", en: "Read the corrections of your writings and write those sentences again.", ca: "Llegeix les correccions dels teus writings i torna a escriure aquelles frases." },
    tipGame:  { when: "…and that point's mistakes are in the class games", en: "You missed some questions on it in the class games: play them again in 🎲 Games.", ca: "Als jocs de classe vas fallar preguntes d'aquest punt: torna-hi a jugar a 🎲 Jocs." },
    tipLp:    { when: "…and some answers in its activities are still wrong now", en: "Some of your answers in these activities are still wrong: correct them.", ca: "Algunes respostes d'aquestes activitats encara estan malament: corregeix-les." },
    tipSpeak: { when: "…and it is a speaking point with recordings or shadowing not done", en: "Some recordings or shadowing are still to do: do them, it is the best way to become fluent.", ca: "Et falten gravacions o shadowing: fes-los, és la millor manera de guanyar fluïdesa." },
    tipRedo:  { when: "…otherwise (or its mistakes are in the exam)", en: "Do these activities again and read the explanation of each mistake.", ca: "Torna a fer aquestes activitats i fixa't en l'explicació de cada error." },
    examUp:   { when: "Exams, after the everyday work: the last LS exam reached a higher level than the one before", en: "In the exams, you went up from {d1} in {N1} to {d2} in {N2}.", ca: "Als exàmens has pujat d'un {d1} a la {N1} a un {d2} a la {N2}." },
    examDown: { when: "Exams: the last LS exam reached a lower level than the one before", en: "In the exams, you went down from {d1} in {N1} to {d2} in {N2}.", ca: "Als exàmens has baixat d'un {d1} a la {N1} a un {d2} a la {N2}." },
    examSame: { when: "Exams: both LS exams reached the same level", en: "In the exams of {N1} and {N2}, you showed {d2} results both times.", ca: "Als exàmens de la {N1} i de la {N2} has tret un {d2} totes dues vegades." },
    examOne:  { when: "Exams: only the last LS exam has a mark", en: "In the {N2} exam, you showed {d2} results.", ca: "A l'examen de la {N2} has tret un {d2}." },
    left1:    { when: "Before the activities deadline: 1 activity due is still not done", en: "You still have 1 activity to do: finish it {by}.", ca: "Et falta 1 activitat: fes-la {by}." },
    left:     { when: "Before the activities deadline: 2 or more activities due are still not done", en: "You still have {n} activities to do: finish them {by}.", ca: "Et falten {n} activitats: fes-les {by}." },
    next:     { when: "Always, at the end", en: "{Nx}, do each activity in the week we do it in class.", ca: "{Anx}, fes cada activitat la setmana que la fem a classe." },
    nextPr:   { when: "At the end, when there is a point to work on (in place of the one above)", en: "{Nx}, do each activity in the week we do it in class and practise “{x}” in 🎯 Practise.", ca: "{Anx}, fes cada activitat la setmana que la fem a classe i practica «{x}» a 🎯 Practica." },
    // a closing sentence, one of these, from what the work shows (Roger, 28 Nov 2026: "Add nice personal sentences at the end"; "too personal, I'm a teacher not a friend" for the others; he kept endProud, endEffort and endFresh)
    endProud: { when: "Close: everyday work Very good or Excellent and (from term 2) the activities on time", en: "I'm really proud of the way you worked {tw}. Keep enjoying English!", ca: "Estic molt orgullós de com has treballat {tw}. Continua gaudint de l'anglès!" },
    endEffort:{ when: "Close: the student corrected their work (progress sentence above), when the one above doesn't apply", en: "I can see the effort you put into correcting your work, and I'm sure {nx} will be even better.", ca: "Es nota l'esforç que has fet per corregir la feina, i segur que {nx} anirà encara millor." },
    endFresh: { when: "Close: none of the activities due is done", en: "{Nx} is a fresh start, and I'm here to help you every step of the way.", ca: "{Nx} és un nou començament, i sóc aquí per ajudar-te en cada pas." },
    endBelieve:{ when: "Close: everyday work Not satisfactory or Satisfactory, or (from term 2) the activities late or at the last minute", en: "With regular work every week, your results can improve.", ca: "Amb una feina regular cada setmana, els teus resultats poden millorar." },
    endThanks:{ when: "Close: any other case", en: "Keep working steadily {nx}.", ca: "Continua treballant amb constància {nx}." } };
  const DEG = { en: ["Not satisfactory (No assoliment)", "Satisfactory (Assoliment satisfactori)", "Very good (Assoliment notable)", "Excellent (Assoliment excel·lent)"],
    ca: ["No assoliment", "Assoliment satisfactori", "Assoliment notable", "Assoliment excel·lent"] };
  const degOf = m => m < 5 ? 0 : m < 7 ? 1 : m < 9 ? 2 : 3;
  function comment(L, pts, tm, ctx, C) { const ca = L === "ca", today = (window.ELWeek && ELWeek.today()) || new Date().toISOString().slice(0, 10), open = ctx.term && ctx.term.deadline ? today <= ctx.term.deadline : !ctx.term || !ctx.term.to || today <= ctx.term.to;
    // {tw} this term / this school year, {nx} {Nx} {Anx} next term / next year, {by} before the deadline (elTrepWords: term 3 and the final report look to next year)
    const WD = elTrepWords(ctx.scope || "t1", L, ctx.term && ctx.term.deadline, today);
    const out = [], say = (id, v) => out.push(BANK[id][ca ? "ca" : "en"].replace(/\{(\w+)\}/g, (m, k) => v && v[k] != null ? v[k] : WD[k] != null ? WD[k] : m));
    const ex = id => { const sc = ((ctx.rs || {})[id + "/assessment"] || {}).sections || {}; let a = 0, b = 0; Object.values(sc).forEach(y => { if (y && y.score != null && y.max) { a += +y.score; b += +y.max; } }); return b ? Math.round(a / b * 100) / 10 : null; };
    // the exams of the report: the term's LSs (ctx.exams, only those with a mark; elTrepScope) or, in term 1, its two LSs as Roger wrote them
    const XI = ctx.exams ? ctx.exams.filter(id => ex(id) != null) : C.lss.map(x => x.ls), xs = XI.map(ex), e1 = xs.length > 1 ? xs[xs.length - 2] : null, e2 = xs.length ? xs[xs.length - 1] : null;
    const lsN = id => (window.elLsNum && elLsNum((window.EL_LS || []).find(l => l.id === id) || {})) || "", N1 = (XI.length > 1 && lsN(XI[XI.length - 2])) || "LS1", N2 = (XI.length && lsN(XI[XI.length - 1])) || "LS2";
    const D = DEG[ca ? "ca" : "en"], d1 = e1 != null ? degOf(e1) : null, d2 = e2 != null ? degOf(e2) : null, V = { N1, N2, d1: D[d1], d2: D[d2] };
    // everyday work and progress first, the exam after (Roger, 28 Nov 2026: "it seem that we focus more on the exam that on the rest and it isn't true")
    const has = pts.filter(p => p.pct != null).sort((a, b) => b.pct - a.pct), best = has.slice(0, 2).filter(p => p.pct >= 70), worst = has.filter(p => p.pct < 70).slice(-2).reverse(), w = worst[0];
    let lv = null; if (has.length) { const avg = has.reduce((a, p) => a + p.pct, 0) / has.length; lv = avg >= 90 ? 3 : avg >= 70 ? 2 : avg >= 50 ? 1 : 0; say("work", { d: D[lv] }); }
    const pr = ctx.prog, up = !!(pr && pr.m >= 10 && pr.l - pr.f >= 10); if (pr && pr.m >= 10) { if (up) say("progUp"); else if (pr.f < 70 && pr.l - pr.f < 3) say("progNone"); }
    const tOn = C.timing !== false, P = tm.profile;
    if (P === "none") say("none"); else if (tOn) { if (P === "steady") say("onTime"); else if (P === "behind") { say("notOnTime", tm); if (tm.late >= 3) say("late", tm); } else if (P === "last") say("lastMin"); }
    if (best.length) say("best", { x: best.map(p => lc(short(p.t))).join(ca ? " i " : " and ") });
    if (w) { say("focus", { x: lc(short(w.t)) }); say({ write: "tipWrite", game: "tipGame", lp: "tipLp" }[w.ek] || (w.speak ? "tipSpeak" : "tipRedo")); }
    if (d1 != null && d2 != null) say(d2 > d1 ? "examUp" : d2 < d1 ? "examDown" : "examSame", V); else if (d2 != null) say("examOne", V);
    const left = tm.due - tm.done, todo = open && left > 0;
    if (todo && tm.profile !== "none") say(left === 1 ? "left1" : "left", { n: left });
    w ? say("nextPr", { x: lc(short(w.t)) }) : say("next");
    // term 1: the close follows the everyday work's level alone, never when it was done
    const late = tOn && (P === "behind" || P === "last");
    say(P === "none" ? "endFresh" : (tOn ? P === "steady" : true) && lv >= 2 ? "endProud" : up ? "endEffort" : late || (lv != null && lv <= 1) ? "endBelieve" : "endThanks");
    return out.join(" "); }

  // Firestore takes no array straight inside another array ("Nested arrays are not supported": 🔄 Rebuild failed on 28 Nov 2026), so a
  // week is { d: monday, n: activities finished }. Reports saved before then (tools/term-report/draft.mjs) hold [monday, n] pairs:
  // elTrepWeeks reads both, elTrepSafe turns any old pair into the new shape before a report is written again (backups, restores).
  window.elTrepWeeks = function (T) { return ((T && T.weeks) || []).map(x => Array.isArray(x) ? { d: x[0], n: +x[1] || 0 } : { d: x && x.d, n: +(x && x.n) || 0 }); };
  window.elTrepSafe = function safe(v) { return Array.isArray(v) ? v.map(x => Array.isArray(x) ? (x.length === 2 && typeof x[0] === "string" ? { d: x[0], n: x[1] } : Object.assign({}, x.map(safe))) : safe(x))
    : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, safe(x)])) : v; };
  window.elTrepBuild = function (C, ctx) { const L = ctx.lang === "ca" ? "ca" : "en", prev = (ctx.prev && ctx.prev.pts) || [], pts = [], ptsCa = [];
    C.lss.forEach((l, li) => l.pts.forEach(pt => { const i = pts.length, { pct } = elTrepPct(pt, ctx), was = prev[i], ev = evidence(ctx, pt);
      const e0 = ev.find(x => x.k !== "fpok" && x.k !== "fpgo" && strip(x.fix).trim()), ek = e0 ? e0.k : null, speak = !e0 && pct != null && pct < 60 && pt.src.some(s => s.d);
      // a line written by the drafts (they read the learning paths' answers, the page does not) stays while its % is the same
      const keep = was && was.line && was.pct === pct && !ctx.lp, line = keep ? was.line : lineOf(pct, ev, L, pt);
      // every English sentence has its Catalan, for the butlletí de notes (Roger, 28 Nov 2026: "per every sentence that we build in English we need the catalan version")
      const lineCa = L === "ca" ? line : keep && was.ca ? was.ca : lineOf(pct, ev, "ca", pt);
      pts.push({ i, ls: li, t: pt[L] || pt.en, pct, line, ek, speak }); ptsCa.push({ i, ls: li, t: pt.ca || pt.en, pct, line: lineCa, ek, speak }); }));
    // progress (formative): first tries against the latest answers of every auto-checked step taught (the learning paths' stores)
    let f = 0, l = 0, m = 0; Object.values(ctx.pg || {}).forEach(ls => Object.entries(ls || {}).forEach(([key, v]) => { let s; try { s = typeof v === "string" ? JSON.parse(v) : v; } catch (e) { return; }
      if (!s || !s.tries) return; Object.entries(s.tries).forEach(([pid, t]) => { if (!t || !t.max || (ctx.taught && !ctx.taught(key, pid))) return; const z = (s.last || {})[pid] || t;
        f += +t.score || 0; l += +(z.score ?? t.score) || 0; m += +t.max; }); }));
    ctx = Object.assign({}, ctx, { prog: m ? { f: Math.round(f / m * 100), l: Math.round(l / m * 100), m } : null });
    const tm = timing(C, ctx), has = pts.filter(p => p.pct != null).sort((a, b) => b.pct - a.pct), cm = comment(L, pts, tm, ctx, C);
    return { lang: L, live: true, pts: pts.map((p, i) => ({ pct: p.pct, line: p.line, ca: ptsCa[i].line })), strong: has.filter(p => p.pct >= 70).slice(0, 3).map(p => p.i), work: has.filter(p => p.pct < 70).slice(-2).map(p => p.i),
      time: { due: tm.due, done: tm.done, inWeek: tm.inWeek, lastMin: tm.lastMin, profile: tm.profile, weeks: tm.weeks, exam: tm.exam }, comment: cm, commentCa: L === "ca" ? cm : comment("ca", ptsCa, tm, ctx, C) }; };
})();
