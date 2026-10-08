/* "Mark section as done" button at the end of each Learning Path section.
   It only works when the section's activities are done, then opens the next section; otherwise it says what is missing.
   Progress itself is still recorded by each page's own activities. */
var sectionNext = {
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
      const ca = () => config.level() === 'insecure';
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
        button.textContent = ca() ? 'Marca la secció com a feta' : 'Mark section as done';
        const ready = !!cfg.done();
        button.setAttribute('aria-disabled', ready ? 'false' : 'true');
        button.style.opacity = ready ? '' : '.55';
        if (reset) message.textContent = '';
      });
    });
    const refresh = reset => buttons.forEach(f => f(reset === true));
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
      undo.textContent = config.level() === 'insecure' ? 'Desfés ↺' : 'Undo ↺';
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
      note.textContent = all ? '' : (config.level() === 'insecure'
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
    const options = select ? [...select.options].filter(o => o.value) : [];
    const here = options.findIndex(o => o.value === location.pathname.split('/').pop());
    const target = options[here + 1] ? options[here + 1].value : 'index.html';
    const hasNext = !!options[here + 1];
    const ca = () => config.level() === 'insecure';
    const card = document.createElement('div');
    card.className = 'section-card section-next';
    card.innerHTML = '<div class="actions"><button class="btn main" type="button"></button></div><p class="feedback no" aria-live="polite"></p>' +
      '<div class="confirm" hidden><p><strong class="q"></strong></p><div class="actions"><button class="btn confirm-yes" type="button"></button><button class="btn secondary confirm-no" type="button"></button></div></div>';
    panel.appendChild(card);
    const main = card.querySelector('.main'), message = card.querySelector('.feedback'), confirmBox = card.querySelector('.confirm');
    const yes = card.querySelector('.confirm-yes'), no = card.querySelector('.confirm-no'), question = card.querySelector('.q');
    const labels = () => {
      main.textContent = ca()
        ? (hasNext ? 'Marca la secció com a feta i continua amb el següent Learning Path' : 'Marca la secció com a feta i torna a My Real Routine')
        : (hasNext ? 'Mark section as done and continue to the next Learning Path' : 'Mark section as done and return to My Real Routine');
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
    yes.addEventListener('click', () => { location.href = target; });
    ['click', 'input', 'change'].forEach(type => document.addEventListener(type, () => setTimeout(labels, 60)));
    document.querySelectorAll('.route,.tab').forEach(r => r.addEventListener('click', () => setTimeout(() => { labels(); confirmBox.hidden = true; message.textContent = ''; }, 0)));
    labels();
  }
};
