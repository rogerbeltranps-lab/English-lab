/* "Next section →" button at the end of each Learning Path section.
   It only works when the section's activities are done, then opens the next section; otherwise it says what is missing.
   It records nothing: progress is saved by each page's own activities (a tab is done as soon as its work is saved).
   It was called "Mark section as done" and students took it for handing in: in 🎓 class mode the next tab is locked, the click
   met the 🔒 message and they reported "it doesn't let me mark it as done" (2ESOB, 17 Nov 2026). Roger, 17 Nov 2026, chose
   "Next section →", hidden while 🎓 class mode / the teacher's 🔒 does not let the student go there.
   LS1 keeps its old wording (leave LS1 alone): its learning paths are the pages that load ls1-lp.js. */
// Catalan only for Starter since 21 Nov 2026 (Roger: "base is also in English"); LS1 keeps Base in Catalan (its pages are finished).
var snCa = l => l === 'beginners' || (l === 'insecure' && !!document.querySelector('script[src*="ls1-lp.js"]'));
var sectionNext = {
  ls1: () => !!document.querySelector('script[src*="ls1-lp.js"]'),
  // el-cloud.js tells whether the teacher's 🎓 class mode / 🔒 keeps the student off that tab or page (and sends "el-lock" when that changes)
  blocked(fn, arg) { try { return !!(window[fn] && window[fn](arg)); } catch (e) { return false; } },
  hideStyle() {
    if (document.getElementById('el-sn-css')) return;
    const st = document.createElement('style'); st.id = 'el-sn-css';
    st.textContent = '.section-next.el-sn-off{display:none!important}';
    document.head.appendChild(st);
  },
  init(config) {
    const tabs = [...document.querySelectorAll('.tab')];
    const order = tabs.map(t => t.dataset.panel);
    const buttons = [];
    config.panels.forEach(cfg => {
      const next = order[order.indexOf(cfg.id) + 1];
      const panel = document.getElementById(cfg.id);
      if (!next || !panel) return;
      const card = document.createElement('div');
      card.className = 'section-card section-next';
      card.innerHTML = '<div class="actions"><button class="btn" type="button"></button></div><p class="feedback no" aria-live="polite"></p>';
      panel.appendChild(card);
      const button = card.querySelector('button'), message = card.querySelector('.feedback');
      const nextTab = tabs[order.indexOf(next)];
      const ca = () => snCa(config.level());
      button.addEventListener('click', () => {
        if (cfg.done()) {
          message.textContent = '';
          nextTab.click();
          return;
        }
        button.setAttribute('aria-disabled', 'true');
        const detail = cfg.detail ? cfg.detail(ca()) : '';
        message.textContent = (ca()
          ? 'Encara no pots continuar: completa primer les activitats d’aquesta secció. '
          : 'Not yet: finish this section’s activities first. ') + detail;
      });
      buttons.push(reset => {
        button.textContent = sectionNext.ls1() ? (ca() ? 'Marca la secció com a feta' : 'Mark section as done') : (ca() ? 'Següent secció →' : 'Next section →');
        card.classList.toggle('el-sn-off', sectionNext.blocked('elNextBlocked', next));
        const ready = !!cfg.done();
        button.setAttribute('aria-disabled', ready ? 'false' : 'true');
        button.style.opacity = ready ? '' : '.55';
        if (reset) message.textContent = '';
      });
    });
    sectionNext.hideStyle();
    const refresh = reset => buttons.forEach(f => f(reset === true));
    document.addEventListener('el-lock', () => refresh());
    // Re-check after any activity so the button looks available as soon as the section is done.
    ['click', 'input', 'change'].forEach(type => document.addEventListener(type, () => setTimeout(refresh, 60)));
    document.querySelectorAll('.route').forEach(r => r.addEventListener('click', () => setTimeout(() => refresh(true), 0)));
    tabs.forEach(t => t.addEventListener('click', () => setTimeout(() => refresh(true), 0)));
    refresh(true);
  },
  list(ca, parts) {
    const todo = parts.filter(p => !p[0]).map(p => p[ca ? 1 : 2]);
    return todo.length ? (ca ? 'Falta: ' : 'Still to do: ') + todo.join(' · ') + '.' : '';
  },
  // Adds an "Undo" button after a "done" button; it is only visible while the step is marked as done.
  undo(config) {
    const undo = document.createElement('button');
    undo.type = 'button';
    undo.className = 'btn secondary';
    config.button.insertAdjacentElement('afterend', undo);
    const sync = () => {
      undo.textContent = snCa(config.level()) ? 'Desfés ↺' : 'Undo ↺';
      undo.hidden = !config.isDone();
    };
    undo.addEventListener('click', () => { config.undo(); setTimeout(sync, 0); });
    ['click', 'input', 'change'].forEach(type => document.addEventListener(type, () => setTimeout(sync, 60)));
    sync();
  },
  // Keeps an "explored" button disabled until every vocabulary chip has been hovered, focused or tapped.
  gateExplore(config) {
    const { button, container } = config;
    const note = document.createElement('p');
    note.className = 'feedback';
    (button.closest('.actions') || button).insertAdjacentElement('afterend', note);
    const style = document.createElement('style');
    style.textContent = '.chip.seen::after{content:" ✓";font-size:.8em;opacity:.7}#' + button.id + ':disabled{opacity:.5;cursor:not-allowed}';
    document.head.appendChild(style);
    const update = () => {
      const chips = [...container.querySelectorAll('.chip')];
      const seen = chips.filter(c => c.classList.contains('seen')).length;
      const all = chips.length > 0 && seen === chips.length;
      button.disabled = !all;
      note.textContent = all ? '' : (snCa(config.level())
        ? 'Passa el ratolí per sobre de cada expressió (o toca-la al mòbil) per veure’n el significat: ' + seen + '/' + chips.length
        : 'Hover over (or tap) every expression to see its meaning: ' + seen + '/' + chips.length);
    };
    // Even if the button were enabled by mistake, do nothing until every expression has been seen.
    button.addEventListener('click', e => {
      const chips = [...container.querySelectorAll('.chip')];
      if (!chips.length || chips.some(c => !c.classList.contains('seen'))) { e.stopImmediatePropagation(); e.preventDefault(); update(); }
    }, true);
    const mark = e => {
      const chip = e.target.closest && e.target.closest('.chip');
      if (chip) { chip.classList.add('seen'); update(); }
    };
    ['mouseover', 'focusin', 'click', 'touchstart'].forEach(type => container.addEventListener(type, mark, { passive: true }));
    new MutationObserver(update).observe(container, { childList: true, subtree: true });
    ['click', 'input', 'change'].forEach(type => document.addEventListener(type, () => setTimeout(update, 60)));
    update();
  },
  // Last section of a Learning Path: mark it as done, check with the student, then open the next Learning Path.
  final(config) {
    const panel = document.getElementById(config.id);
    if (!panel) return;
    const select = document.getElementById('sessionJump');
    // read at the moment it is used: el-cloud.js trims the menu to the learning paths open for the student once it knows them
    const nextOpt = () => { const options = select ? [...select.options].filter(o => o.value) : [], here = options.findIndex(o => o.value === location.pathname.split('/').pop()); return options[here + 1] || null; };
    const ca = () => snCa(config.level());
    const card = document.createElement('div');
    card.className = 'section-card section-next';
    card.innerHTML = '<div class="actions"><button class="btn main" type="button"></button></div><p class="feedback no" aria-live="polite"></p>' +
      '<div class="confirm" hidden><p><strong class="q"></strong></p><div class="actions"><button class="btn confirm-yes" type="button"></button><button class="btn secondary confirm-no" type="button"></button></div></div>';
    panel.appendChild(card);
    const main = card.querySelector('.main'), message = card.querySelector('.feedback'), confirmBox = card.querySelector('.confirm');
    const yes = card.querySelector('.confirm-yes'), no = card.querySelector('.confirm-no'), question = card.querySelector('.q');
    const lsName = () => { const b = document.querySelector('.topbar .brand>a.elback'); return (b && (b.dataset.ls || b.textContent) || '').trim(); };
    const dest = () => (nextOpt() || { value: 'index.html' }).value;
    sectionNext.hideStyle();
    const labels = () => {
      if (sectionNext.ls1()) main.textContent = ca()
        ? (nextOpt() ? 'Marca la secció com a feta i continua amb el següent Learning Path' : 'Marca la secció com a feta i torna a My Real Routine')
        : (nextOpt() ? 'Mark section as done and continue to the next Learning Path' : 'Mark section as done and return to My Real Routine');
      else main.textContent = nextOpt() ? (ca() ? 'Següent Learning Path →' : 'Next Learning Path →')
        : (ca() ? 'Torna a ' : 'Back to ') + (lsName() || (ca() ? 'la pàgina de la LS' : 'the LS page')) + ' →';
      card.classList.toggle('el-sn-off', sectionNext.blocked('elLeaveBlocked', dest()));
      question.textContent = ca()
        ? 'Has acabat i revisat totes les activitats d’aquesta secció?'
        : 'Have you finished and checked all the activities in this section?';
      yes.textContent = ca() ? 'Sí, continua' : 'Yes, continue';
      no.textContent = ca() ? 'Encara no' : 'Not yet';
      const ready = !!config.done();
      main.setAttribute('aria-disabled', ready ? 'false' : 'true');
      main.style.opacity = ready ? '' : '.55';
    };
    main.addEventListener('click', () => {
      if (!config.done()) {
        confirmBox.hidden = true;
        message.textContent = (ca()
          ? 'Encara no pots continuar: completa primer les activitats d’aquesta secció. '
          : 'Not yet: finish this section’s activities first. ') + (config.detail ? config.detail(ca()) : '');
        return;
      }
      message.textContent = '';
      confirmBox.hidden = false;
      yes.focus();
    });
    no.addEventListener('click', () => { confirmBox.hidden = true; });
    yes.addEventListener('click', () => { location.href = dest(); });
    document.addEventListener('el-lock', () => labels());
    addEventListener('load', () => setTimeout(labels, 0));   // the LS name in the top bar (el-app.js) may come after this
    ['click', 'input', 'change'].forEach(type => document.addEventListener(type, () => setTimeout(labels, 60)));
    document.querySelectorAll('.route,.tab').forEach(r => r.addEventListener('click', () => setTimeout(() => { labels(); confirmBox.hidden = true; message.textContent = ''; }, 0)));
    labels();
  }
};
