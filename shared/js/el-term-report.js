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
   A point's % is the average of its sources that have data; null when none has. */
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
  window.EL_TREP = { t1: T1 };

  // A point's % for one student. ctx = {pg: {lsId: {storeKey: state (string or object)}}, rs: {activity: result}, games: [{title, r, of}],
  // held: lsId => true while that exam's results are held}. Returns {pct, n} (n = sources with data) or {pct: null, n: 0}.
  const st = (ctx, key) => { for (const l of Object.values(ctx.pg || {})) { const v = l && l[key]; if (v) { try { return typeof v === "string" ? JSON.parse(v) : v; } catch (e) { return null; } } } return null; };
  function one(s, ctx) {
    if (s.p) { const S = st(ctx, s.p); if (!S) return null; const L = S.last || {}, T = S.tries || {}; let a = 0, b = 0;
      s.ps.forEach(id => { const y = L[id] || T[id]; if (y && y.max) { a += +y.score || 0; b += +y.max; } }); return b ? a / b * 100 : null; }
    // a "done" point counts only the steps taught for the student's group (ctx.due(key) = Set of step ids done in class or set as homework
    // by the end of term); a step still 🔒 locked for the group is left out, never 0 (problem report, 2ESOB, 27 Nov 2026)
    if (s.d) { const S = st(ctx, s.d); if (!S) return null; const dn = S.done || {}, due = ctx.due ? ctx.due(s.d) : null;
      const ps = due ? s.ps.filter(id => due.has(id)) : s.ps; return ps.length ? ps.filter(id => dn[id]).length / ps.length * 100 : null; }
    if (s.x) { if (ctx.held && ctx.held(s.x)) return null; const sc = ((ctx.rs || {})[s.x + "/assessment"] || {}).sections || {}; let a = 0, b = 0;
      s.k.forEach(k => { const y = sc[k]; if (y && y.score != null && y.max) { a += +y.score; b += +y.max; } }); return b ? a / b * 100 : null; }
    if (s.fp) { const f = (ctx.rs || {})[s.fp] || {}; return f.max && f.score != null ? f.score / f.max * 100 : null; }
    if (s.g) { const g = (ctx.games || []).filter(x => x && x.title === s.g && x.of).sort((x, y) => String(y.day || "").localeCompare(String(x.day || "")))[0];
      return g ? (+g.r || 0) / g.of * 100 : null; }
    return null; }
  window.elTrepPct = function (pt, ctx) { const v = (pt.src || []).map(s => one(s, ctx)).filter(x => x != null);
    return v.length ? { pct: Math.round(v.reduce((n, x) => n + x, 0) / v.length), n: v.length } : { pct: null, n: 0 }; };
})();
