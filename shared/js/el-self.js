/* Self-assessment at the end of an LS (Roger, 2 Nov 2026: "afegir una autoavaluació al final de la LS").
   A panel of type 'self' on the LS's Reflect page (ls2-engine.js: R.self = p => ELSelf.panel(p, api)). The student taps 1–4 on
   "I can…" statements grouped by competence (the four communicative ones, CE2–CE5, with the same number of statements each, then the
   other competences the LS assesses and how they learn, CE9 9.3), picks the one competence they most want to improve in the next LS
   and hands it in. Nothing to read for the teacher: no free text. Each statement links to the Learning Path tab that worked it, so
   anything rated 1–2 becomes a "review this" link right away.
   Saved in the page's state (synced with the rest of its progress, no extra reads) as state[p.id] =
   { level, date, avg, focus: {k, n}, groups: [{k, c, n, v}], items: [{k, s, v}] }: k = competence key as the dashboard reads it
   ("2" = CE2, "9" = CE9, "CD4" = a transversal), c = the criteria, n = English name, v = average (1–4), s = statement in English.
   The teacher dashboard ("Self-assessment" box, teacher.html selfBox) shows it next to the student's marks per competence.
   Config: { id, type: 'self', tab, title, intro, next: {ca, en} (name of the next LS), groups: [{ k, c, icon, n: {ca, en},
   items: [{ ca, en, lp: ['page.html', 'tab id'] }] }] }. */
window.ELSelf = (function () {
  const SCALE = { ca: ['Encara no', 'En part', 'Gairebé del tot', 'Del tot'], en: ['Not yet', 'Partly', 'Mostly', 'Fully'] };
  const CSS = '.self-item{padding:11px 0;border-top:1px solid var(--line,#dde)}.self-item:first-of-type{border-top:0}.self-item p{margin:0 0 7px;font-weight:650}'
    + '.self-scale{display:flex;flex-wrap:wrap;gap:6px}.self-scale button,.self-focus button{border:1px solid var(--line,#ccd);background:#fff;border-radius:11px;padding:7px 11px;font:inherit;font-size:.92rem;cursor:pointer;color:inherit}'
    + '.self-scale button.on{background:var(--accent,#1f6b52);border-color:var(--accent,#1f6b52);color:#fff;font-weight:700}.self-focus{display:flex;flex-wrap:wrap;gap:8px}'
    + '.self-focus button.on{background:var(--soft,#e9f5ef);border-color:var(--accent,#1f6b52);font-weight:700}.self-lp{font-size:.85rem;margin-left:4px}'
    + '.self-group h3{margin:0 0 4px}.self-group small{color:var(--muted,#667);font-weight:400}.self-bar{height:10px;border-radius:6px;background:#eef1f0;overflow:hidden;margin:4px 0 10px}'
    + '.self-bar span{display:block;height:100%;background:var(--accent,#1f6b52)}.self-res li{margin:5px 0}';

  function panel(p, api) {
    const ca = api.ca, tx = api.tx, esc = api.esc, id = p.id;
    const scale = () => ca() ? SCALE.ca : SCALE.en;
    const lpName = f => { const x = (api.pages || []).find(y => y[0] === f); return x ? (/^\d/.test(x[1]) ? 'LP' : '') + x[1] : f; };
    const link = it => it.lp ? '<a class="self-lp" href="' + it.lp[0] + (it.lp[1] ? '#' + it.lp[1] : '') + '">' + esc(lpName(it.lp[0])) + ' →</a>' : '';
    const draft = () => { const st = api.state(); st[id + 'Draft'] = st[id + 'Draft'] || { v: {}, focus: '' }; return st[id + 'Draft']; };
    const avg = a => a.length ? Math.round(a.reduce((t, x) => t + x, 0) / a.length * 10) / 10 : null;

    function result() {
      const h = api.state()[id]; if (!h) return '';
      const low = [];
      p.groups.forEach((g, gi) => g.items.forEach((it, ii) => { const v = (h.r || {})[gi + '.' + ii]; if (v && v <= 2) low.push(it); }));
      const nx = tx(p.next || { ca: 'la propera LS', en: 'the next LS' });
      return '<div class="section-card self-res"><h3>' + (ca() ? 'El meu resultat' : 'My result') + '</h3>'
        + h.groups.map(g => '<div><strong>' + esc(g.icon || '') + ' ' + esc(ca() ? g.nca || g.n : g.n) + '</strong> · ' + g.v + ' / 4<div class="self-bar"><span style="width:' + (g.v / 4 * 100) + '%"></span></div></div>').join('')
        + (h.focus ? '<p>🎯 ' + (ca() ? 'Vull millorar a ' + nx + ': ' : 'What I want to improve in ' + nx + ': ') + '<b>' + esc(ca() ? h.focus.nca || h.focus.n : h.focus.n) + '</b></p>' : '')
        + (low.length ? '<p>' + (ca() ? 'Abans de ' + nx + ', repassa el que has marcat amb 1 o 2:' : 'Before ' + nx + ', review what you rated 1 or 2:') + '</p><ul>'
          + low.map(it => '<li>' + esc(tx(it)) + ' ' + link(it) + '</li>').join('') + '</ul>'
          : '<p>' + (ca() ? 'Res per sota de 3. Molt bé!' : 'Nothing below 3. Well done!') + '</p>')
        + '</div>';
    }

    return {
      html: (document.getElementById('elSelfCss') ? '' : '<style id="elSelfCss">' + CSS + '</style>')
        + '<div class="section-card"><p class="instruction">' + (ca()
          ? 'Toca un número per a cada frase. 1 ' + SCALE.ca[0] + ' · 2 ' + SCALE.ca[1] + ' · 3 ' + SCALE.ca[2] + ' · 4 ' + SCALE.ca[3] + '. Sigues sincer/a: no hi ha respostes bones o dolentes.'
          : 'Tap a number for each sentence. 1 ' + SCALE.en[0] + ' · 2 ' + SCALE.en[1] + ' · 3 ' + SCALE.en[2] + ' · 4 ' + SCALE.en[3] + '. Be honest: there are no right or wrong answers.') + '</p></div>'
        + p.groups.map((g, gi) => '<div class="section-card self-group"><h3>' + esc(g.icon || '') + ' ' + esc(tx(g.n)) + '</h3>'
          + g.items.map((it, ii) => '<div class="self-item"><p>' + esc(tx(it)) + '</p><div class="self-scale" data-k="' + gi + '.' + ii + '">'
            + [1, 2, 3, 4].map(v => '<button type="button" data-v="' + v + '">' + v + ' · ' + scale()[v - 1] + '</button>').join('') + '</div></div>').join('') + '</div>').join('')
        + '<div class="section-card"><h3>🎯 ' + (ca() ? 'Què vols millorar més a ' : 'What do you most want to improve in ') + esc(tx(p.next || { ca: 'la propera LS', en: 'the next LS' })) + '?</h3>'
        + '<div class="self-focus">' + p.groups.map((g, gi) => '<button type="button" data-g="' + gi + '">' + esc(g.icon || '') + ' ' + esc(tx(g.n)) + '</button>').join('') + '</div>'
        + '<div class="actions"><button class="btn" type="button" id="' + id + 'Send">' + (ca() ? 'Entrega l’autoavaluació' : 'Hand in my self-assessment') + '</button></div><p class="feedback" id="' + id + 'Msg"></p></div>'
        + '<div id="' + id + 'Res">' + result() + '</div>',
      bind() {
        const d = draft(), root = document.getElementById(id), msg = document.getElementById(id + 'Msg');
        const paint = () => {
          root.querySelectorAll('.self-scale').forEach(s => s.querySelectorAll('button').forEach(b => b.classList.toggle('on', +b.dataset.v === d.v[s.dataset.k])));
          root.querySelectorAll('.self-focus button').forEach(b => b.classList.toggle('on', b.dataset.g === String(d.focus)));
        };
        root.querySelectorAll('.self-scale button').forEach(b => b.onclick = () => { d.v[b.parentNode.dataset.k] = +b.dataset.v; api.save(); paint(); });
        root.querySelectorAll('.self-focus button').forEach(b => b.onclick = () => { d.focus = b.dataset.g; api.save(); paint(); });
        paint();
        const h = api.state()[id];
        if (h) { msg.className = 'feedback ok'; msg.textContent = (ca() ? 'Entregada el ' : 'Handed in on ') + new Date(h.date).toLocaleDateString() + (ca() ? '. Si canvies alguna cosa, torna-la a entregar.' : '. If you change anything, hand it in again.'); }
        document.getElementById(id + 'Send').onclick = () => {
          const keys = p.groups.flatMap((g, gi) => g.items.map((it, ii) => gi + '.' + ii));
          if (keys.some(k => !d.v[k])) { msg.className = 'feedback no'; msg.textContent = ca() ? 'Puntua totes les frases.' : 'Rate every sentence.'; const k = keys.find(x => !d.v[x]), el = root.querySelector('.self-scale[data-k="' + k + '"]'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
          if (d.focus === '' || d.focus == null) { msg.className = 'feedback no'; msg.textContent = ca() ? 'Tria què vols millorar més.' : 'Choose what you most want to improve.'; return; }
          const en = o => typeof o === 'string' ? o : (o.en || o.ca), cao = o => typeof o === 'string' ? o : (o.ca || o.en);
          const groups = p.groups.map((g, gi) => ({ k: g.k, c: g.c || '', icon: g.icon || '', n: en(g.n), nca: cao(g.n), v: avg(g.items.map((it, ii) => d.v[gi + '.' + ii])) }));
          const items = p.groups.flatMap((g, gi) => g.items.map((it, ii) => ({ k: g.k, s: en(it), v: d.v[gi + '.' + ii] })));
          const fg = groups[+d.focus];
          api.state()[id] = { level: api.level(), date: new Date().toISOString(), avg: avg(items.map(x => x.v)), focus: { k: fg.k, n: fg.n, nca: fg.nca }, groups, items, r: Object.assign({}, d.v) };
          api.done(id);
          msg.className = 'feedback ok'; msg.textContent = ca() ? 'Entregada ✓ El professor la veurà al seu tauler.' : 'Handed in ✓ Your teacher will see it on the dashboard.';
          document.getElementById(id + 'Res').innerHTML = result();
        };
      }
    };
  }
  return { panel, SCALE };
})();
