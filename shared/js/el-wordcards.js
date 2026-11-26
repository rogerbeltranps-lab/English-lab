/* 🃏 Word cards: ONE flashcard for the whole site (Roger, 20 Nov 2026: "simplify the vocabulary cards, no writing the prediction,
   simple like this and full screen, like Practise").
   Used by 🎯 Practise (lab/practice.html) and the Vocabulary steps of the LS2 Learning Paths (ls2-engine.js R.vocab, both courses, and
   Getting started in 4ESO Seasons and celebrations). LS1 pages keep their own cards (shared/js/flashcard-set.js).

   How it works: look at the word, say it out loud, think what it means, ↻ Turn over; the card shows the meaning and the example and plays
   them (🔊 Kokoro voice, shared/js/el-voice.js); ✓ Ho sabia / I knew it, or ↺ Encara no / Not yet (the card goes to the end of the deck).
   No typing. The first turn opens the cards full screen (Practise, PR #394): ✕ Close or Esc goes back to the page and it stays closed
   until ⛶ Full screen; Space or Enter turns the card; 🔀 Shuffle mixes the cards left. The browser full screen is only left if these cards
   entered it (class full screen of el-cloud.js stays on).

   ELWordCards.mount(host, {
     cards: () => [{ front, back, en, ex, star, src, ipa }],   // en: the English to play (front or back); src: small grey text after the counter
     ca: () => true|false,          // Catalan instructions
     how: () => 'text',             // instruction (optional, a default for English → Catalan)
     toolbar: true|false,           // 🔀 Shuffle and ⛶ Full screen above the card (Practise has them in its own row)
     note: () => 'html',            // a line under the card, not in full screen (optional)
     onKnow: card => {},            // ✓ I knew it
     say: x => {}                   // play a text or [word, example] (default ELVoice.say)
   }) → { render(), mix(), openFull(), closeFull(), restart() } */
(function (root) {
  if (root.ELWordCards) return;
  const CSS = `
.elwc-card{border:1px solid #e5e7eb;border-radius:18px;padding:16px;margin:12px 0;background:#fff;color:#172033;font-family:inherit}
.elwc-how{background:#f8fafc;border-radius:14px;padding:10px 14px;margin:0 0 12px;line-height:1.5}
.elwc-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:8px 0}
.elwc .elwc-btn{border:0;background:#3157d5;color:#fff;border-radius:999px;padding:8px 16px;cursor:pointer;font:inherit;font-weight:700;box-shadow:none;min-height:0;width:auto}
.elwc .elwc-btn.g{background:#eaf0ff;color:#3157d5}.elwc .elwc-btn.ok{background:#15803d;color:#fff}.elwc .elwc-btn.sm{padding:5px 12px;font-size:.9rem}
.elwc-flash{min-height:210px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:8px;border:2px solid #e5e7eb;border-radius:22px;padding:22px;background:linear-gradient(180deg,#fff,#f8fafc)}
.elwc-flash .n{color:#667085}.elwc-flash .en{font-size:1.9rem;font-weight:800;letter-spacing:-.02em;line-height:1.2}
.elwc-flash .ca{font-size:1.25rem;color:#0f766e;font-weight:700}.elwc-flash .ex{color:#667085;font-style:italic}
.elwc-flash .ipa{font:500 1.05rem/1.4 'Charis SIL','Doulos SIL','Lucida Sans Unicode','Segoe UI',system-ui,sans-serif;color:#1f4fb5}
.elwc-star{color:#d97706}.elwc-note{color:#667085;margin:6px 2px 0;font-size:.95rem}
.elwc-full{position:fixed;inset:0;z-index:2147480000;margin:0;border:0;border-radius:0;display:flex;flex-direction:column;padding:18px clamp(16px,4vw,48px);background:#f5f7fb;overflow:auto;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#172033}
.elwc-full .elwc-top{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 12px}.elwc-full .elwc-top .grow{flex:1}.elwc-full .elwc-top .muted{color:#667085}
.elwc-full .elwc-flash{flex:1;min-height:0;gap:18px}
.elwc-full .elwc-flash .en{font-size:clamp(2.2rem,5vw,3.6rem)}.elwc-full .elwc-flash .ca{font-size:clamp(1.5rem,3vw,2.2rem)}.elwc-full .elwc-flash .ex{font-size:clamp(1.05rem,2vw,1.35rem)}
.elwc-full .elwc-flash .ipa{font-size:clamp(1.1rem,2.2vw,1.5rem)}
.elwc-full .elwc-flash .elwc-btn{font-size:1.1rem;padding:12px 26px}.elwc-full .elwc-flash .elwc-btn.sm{font-size:1rem;padding:8px 18px}
.elwc-x{border:0;background:#172033;color:#fff;border-radius:999px;padding:8px 16px;font:inherit;font-weight:800;cursor:pointer}
html.fc-on,html.fc-on body{overflow:hidden}
@media (max-width:620px){.elwc-flash .en{font-size:1.5rem}}`;
  const css = () => { if (document.getElementById('elwc-css')) return; const s = document.createElement('style'); s.id = 'elwc-css'; s.textContent = CSS; document.head.appendChild(s); };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = a => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
  const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement;
  let active = null;   // the cards open full screen (one at a time)

  function mount(host, o) {
    css();
    const t = (c, e) => (o.ca && o.ca() ? c : e);
    const say = x => { try { (o.say || (y => root.ELVoice && root.ELVoice.say(y)))(x); } catch (e) {} };
    let deck = [], ids = null, di = 0, flipped = false, full = false, shut = false, fsMine = false, layer = null;

    function openFull() {
      full = true; active = I; document.documentElement.classList.add('fc-on');
      if (!fsEl()) { const E = document.documentElement, r = E.requestFullscreen || E.webkitRequestFullscreen;
        if (r) { try { const p = r.call(E); fsMine = true; if (p && p.catch) p.catch(() => { fsMine = false; }); } catch (e) { fsMine = false; } } }
      render();
    }
    function closeFull() {
      full = false; shut = true; if (active === I) active = null; document.documentElement.classList.remove('fc-on');
      if (fsMine && fsEl()) { try { (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) {} } fsMine = false;
      render();
    }
    const top = () => `<div class="elwc-top"><button type="button" class="elwc-x" data-wc="close" aria-label="${t('Tanca la pantalla completa', 'Close full screen')}">✕ ${t('Tanca', 'Close')}</button><button type="button" class="elwc-btn g sm" data-wc="mix">🔀 ${t('Barreja', 'Shuffle')}</button><span class="grow"></span><span class="muted">${t('Esc per sortir', 'Esc to leave')}</span></div>`;
    function cardHtml() {
      if (!deck.length) return `<div class="elwc-flash"><p class="n">${t('No hi ha targetes.', 'There are no cards.')}</p></div>`;
      if (di >= deck.length) return `<div class="elwc-flash"><div class="en">🎉 ${t('Has acabat el paquet!', 'You finished the deck!')}</div><p class="n">${t('Torna-hi demà: repassar sovint és el que fa que les paraules es quedin.', 'Come back tomorrow: reviewing often is what makes words stick.')}</p><button type="button" class="elwc-btn" data-wc="again">${t('Torna a començar', 'Start again')}</button></div>`;
      const w = deck[di], frontEn = w.en === w.front;
      const listen = `<button type="button" class="elwc-btn g sm" data-wc="say" data-v="${esc(w.en)}">🔊 ${t('Escolta', 'Listen')}</button>`;
      return `<div class="elwc-flash"><div class="n">${di + 1} / ${deck.length}${w.src ? ' · ' + esc(w.src) : ''}</div><div class="en">${esc(w.front)}${w.star ? ' <span class="elwc-star" title="key word">⭐</span>' : ''}</div>${frontEn ? listen : ''}
        ${flipped ? `<div class="ca">${esc(w.back)}</div>${!frontEn ? listen : ''}${w.ipa ? `<div class="ipa" lang="en">${esc(w.ipa)}</div>` : ''}${w.ex ? `<div class="ex">${esc(w.ex)} <button type="button" class="elwc-btn g sm" data-wc="say" data-v="${esc(w.ex)}" aria-label="${t('Escolta l’exemple', 'Listen to the example')}">🔊</button></div>` : ''}<div class="elwc-row" style="justify-content:center"><button type="button" class="elwc-btn ok" data-wc="know">✓ ${t('Ho sabia', 'I knew it')}</button><button type="button" class="elwc-btn g" data-wc="later">↺ ${t('Encara no', 'Not yet')}</button></div>`
          : `<button type="button" class="elwc-btn" data-wc="flip">${t('Gira la targeta', 'Turn over')}</button>`}</div>`;
    }
    function render() {
      const list = o.cards() || [], key = list.map(c => c.front + '\u0001' + c.back).join('\u0002');
      if (key !== ids) { deck = shuffle(list); ids = key; di = 0; flipped = false; }
      else { const by = new Map(list.map(c => [c.front + '\u0001' + c.back, c])); deck = deck.map(c => by.get(c.front + '\u0001' + c.back) || c); }   // same words, fresh details (IPA loaded later)
      const how = `<div class="elwc-how">${o.how ? o.how() : t('Mira la paraula, digues-la en veu alta i pensa què vol dir. Després gira la targeta.', 'Look at the word, say it out loud and think what it means. Then turn the card over.')}</div>`;
      const bar = o.toolbar === false ? '' : `<div class="elwc-row"><button type="button" class="elwc-btn g sm" data-wc="mix" title="${t('Barreja les targetes que et queden', 'Mix the cards you have left')}">🔀 ${t('Barreja', 'Shuffle')}</button><button type="button" class="elwc-btn g sm" data-wc="full">⛶ ${t('Pantalla completa', 'Full screen')}</button></div>`;
      const note = !full && o.note ? o.note() : '';
      host.classList.add('elwc');
      host.innerHTML = bar + (full ? '' : `<div class="elwc-card">${how}${cardHtml()}</div>`) + (note ? `<p class="elwc-note">${note}</p>` : '');
      if (full) {
        if (!layer) { layer = document.createElement('div'); layer.className = 'elwc elwc-full'; layer.setAttribute('role', 'dialog'); layer.setAttribute('aria-modal', 'true'); layer.addEventListener('click', click); }
        if (!layer.isConnected) document.body.appendChild(layer);
        layer.innerHTML = top() + how + cardHtml();
      } else if (layer && layer.isConnected) layer.remove();
    }
    function click(e) {
      const el = e.target.closest('[data-wc]'); if (!el) return; const k = el.dataset.wc;
      if (k === 'say') return say(el.dataset.v);
      if (k === 'full') return openFull();
      if (k === 'close') return closeFull();
      if (k === 'flip') { flipped = true; const w = deck[di]; say(w.ex ? [w.en, w.ex] : w.en); if (!full && !shut) return openFull(); }
      else if (k === 'mix') { const rest = shuffle(deck.slice(di)); deck.splice(di, rest.length, ...rest); flipped = false; }
      else if (k === 'know') { const w = deck[di]; di++; flipped = false; if (o.onKnow) o.onKnow(w); }
      else if (k === 'later') { deck.push(deck[di]); di++; flipped = false; }
      else if (k === 'again') { ids = null; }
      render();
    }
    host.addEventListener('click', click);
    const I = {
      render, openFull, closeFull,
      mix() { const rest = shuffle(deck.slice(di)); deck.splice(di, rest.length, ...rest); flipped = false; render(); },
      restart() { ids = null; render(); },
      get full() { return full; },
      // keys while full screen: Esc closes, Space / Enter turns the card
      key(e) {
        if (e.key === 'Escape') { e.preventDefault(); closeFull(); }
        else if ((e.key === ' ' || e.key === 'Enter') && !flipped && !(e.target.closest && e.target.closest('button,a,input,select,textarea'))) { e.preventDefault(); const b = layer && layer.querySelector('[data-wc="flip"]'); if (b) b.click(); }
      },
      fsLeft() { if (fsMine) { fsMine = false; if (full) closeFull(); } },
      // the host left the page (another step opened): close the full screen without touching anything else
      gone() { shut = false; if (full) { full = false; if (active === I) active = null; document.documentElement.classList.remove('fc-on'); if (fsMine && fsEl()) { try { (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) {} } fsMine = false; } if (layer && layer.isConnected) layer.remove(); }
    };
    render();
    return I;
  }
  document.addEventListener('keydown', e => { if (active) active.key(e); });
  const fsChange = () => { if (!fsEl() && active) active.fsLeft(); };
  document.addEventListener('fullscreenchange', fsChange); document.addEventListener('webkitfullscreenchange', fsChange);
  root.ELWordCards = { mount };
})(typeof window !== 'undefined' ? window : globalThis);
