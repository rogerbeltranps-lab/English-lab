/* 🎲 Surprise questions · 4 ESO · LS2 · Seasons & Celebrations (Roger, 21 Nov 2026: "like a game or shadowing that are anywhere"). One tab per
   activity the teacher makes on the Time plan (ls/{id}.sq, el-catalog.js elSqList): its questions come from the SLPs ticked there
   (data/surprise.js written, data/surprise-auto.js automatic; shared/js/el-surprise.js). The tabs change when the LS document arrives
   ("el-sq", ls2-engine.js addDyn). */
window.LP = {
  key: 'ls2Surprise4ESO', n: 0, starter: true, title: 'Surprise questions',
  // nothing made yet: one card that says so (the page always has a tab)
  dyn: () => { const ps = window.elSurprise ? elSurprise.panels('4eso-seasons-and-celebrations', '4eso-seasons-and-celebrations') : []; return ps.length ? ps : [{ id: 'none', type: 'info', tab: { ca: '🎲', en: '🎲' }, title: { ca: 'Preguntes sorpresa', en: 'Surprise questions' },
    html: { ca: '<p class="instruction">Encara no hi ha cap activitat de preguntes sorpresa. Quan el professor en posi una, la trobaràs aquí.</p>', en: '<p class="instruction">There are no Surprise questions yet. When your teacher sets one, you’ll find it here.</p>' } }]; }
};
