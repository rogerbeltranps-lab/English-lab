/* Microphone helper for every recorder on the site (Roger, 31 Oct 2026: "Check all the recording of all the LS and fix it").
   Loaded by learning-path-support.js, so it reaches the LS1 pages, every Getting started and the LS2 engines without
   changing their content. It wraps the browser's own tools instead of replacing each recorder:
   - getUserMedia (audio only): a small "Microphone" box with a live level bar, a list to choose the microphone (saved in this
     browser and used from the next recording on), a warning when the mic gives no sound or is muted, and a clear message when
     the browser or the computer blocks it (address bar permission, Mac system settings, another app using it, no mic).
   - SpeechRecognition: when the automatic transcript cannot work (permission, no network to the speech service, no mic) it says
     why and tells the student to type what they said; after such an error the recognisers stop retrying.
   - AudioContext: resumed if the browser created it suspended.
   Wording follows the route: window.elMicCa() if a page sets it (LS2 engines), else the page's global `level`. */
(function () {
  if (window.elMic) return;
  const KEY = 'elMicId';
  const saved = { get() { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } }, set(v) { try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY); } catch (e) {} } };
  const ca = () => {
    try { if (typeof window.elMicCa === 'function') return !!window.elMicCa(); return typeof level !== 'undefined' && (level === 'insecure' || level === 'beginners'); }   // eslint-disable-line no-undef
    catch (e) { return false; }
  };
  const T = (c, e) => ca() ? c : e;
  const isMac = /Mac/.test(navigator.platform || navigator.userAgent);

  /* ---------- the box ---------- */
  let box = null, hideTimer = null;
  function ui() {
    if (box) return box;
    const st = document.createElement('style');
    st.textContent = '#elMic{position:fixed;left:12px;bottom:12px;z-index:2147483000;width:min(340px,calc(100vw - 24px));background:#fff;color:#14232e;border:1px solid #c9d3da;border-radius:14px;box-shadow:0 8px 28px rgba(0,0,0,.18);padding:10px 12px;font:14px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif}' +
      '#elMic[hidden]{display:none}#elMic .h{display:flex;align-items:center;gap:8px;font-weight:700}#elMic .x{margin-left:auto;border:0;background:none;font-size:18px;line-height:1;cursor:pointer;color:#5d6b75;padding:2px 4px}' +
      '#elMic .bar{height:10px;border-radius:6px;background:#e6ecf0;overflow:hidden;margin:8px 0 6px}#elMic .bar i{display:block;height:100%;width:0;background:#2e8b57;transition:width .08s}' +
      '#elMic select{width:100%;font:inherit;font-size:13px;padding:5px 6px;border:1px solid #c9d3da;border-radius:8px;background:#fff;color:#14232e}' +
      '#elMic .m{margin:6px 0 0;font-size:13px}#elMic .m.warn{color:#9a3412;font-weight:600}#elMic .m:empty{display:none}#elMic .s{font-size:12px;color:#5d6b75;margin-top:4px}';
    document.head.appendChild(st);
    box = document.createElement('div'); box.id = 'elMic'; box.hidden = true; box.setAttribute('role', 'status');
    box.innerHTML = '<div class="h"><span>🎤</span><span class="t"></span><button class="x" type="button" aria-label="Close">×</button></div>' +
      '<div class="bar" aria-hidden="true"><i></i></div><select aria-label="Microphone"></select><p class="s"></p><p class="m"></p><p class="m sr"></p>';
    box.querySelector('.x').onclick = () => { box.hidden = true; };
    box.querySelector('select').onchange = e => {
      saved.set(e.target.value);
      box.querySelector('.s').textContent = T('Fes servir aquest micròfon a partir de la propera gravació.', 'This microphone is used from your next recording on.');
    };
    document.body.appendChild(box);
    return box;
  }
  function show() { clearTimeout(hideTimer); const b = ui(); b.querySelector('.t').textContent = T('Micròfon', 'Microphone'); b.hidden = false; return b; }
  function say(text, cls) { const b = show(), m = b.querySelector(cls === 'sr' ? '.m.sr' : '.m:not(.sr)'); m.textContent = text || ''; m.className = 'm' + (cls === 'sr' ? ' sr warn' : text && cls !== 'ok' ? ' warn' : ''); }
  async function listMics(track) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
    try {
      const mics = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'audioinput' && d.deviceId !== 'communications');
      const cur = track && track.getSettings ? track.getSettings().deviceId : saved.get(), sel = ui().querySelector('select');
      sel.innerHTML = mics.map((d, i) => '<option value="' + d.deviceId.replace(/"/g, '&quot;') + '">' + (d.label || (T('Micròfon ', 'Microphone ') + (i + 1))).replace(/</g, '&lt;') + '</option>').join('');
      if (cur) sel.value = cur;
      sel.hidden = mics.length < 2;
    } catch (e) {}
  }

  /* ---------- level meter and silence check on each live mic stream ---------- */
  function watch(stream) {
    const track = stream.getAudioTracks()[0]; if (!track) return;
    const b = show(); say(''); b.querySelector('.s').textContent = ''; listMics(track);
    const fill = b.querySelector('.bar i');
    let ctx = null, an = null, data = null, peak = 0, maxAbs = 0, ran = 0, warned = false, t0 = Date.now();
    try { const C = OrigAC || window.AudioContext || window.webkitAudioContext; ctx = new C(); an = ctx.createAnalyser(); an.fftSize = 1024; ctx.createMediaStreamSource(stream).connect(an); data = new Float32Array(an.fftSize); if (ctx.state === 'suspended') ctx.resume().catch(() => {}); } catch (e) { ctx = null; }
    const quiet = () => T('No et sento: el micròfon no capta cap so. ', 'I can’t hear you: the microphone gives no sound. ') + fixSteps();
    if (track.muted) { warned = true; say(T('El micròfon està silenciat o el fa servir una altra aplicació. ', 'The microphone is muted or another app is using it. ') + fixSteps()); }
    track.addEventListener('mute', () => { warned = true; say(T('El micròfon s’ha silenciat. ', 'The microphone went silent. ') + fixSteps()); });
    track.addEventListener('unmute', () => { if (warned) say(''); warned = false; });
    const tick = () => {
      if (track.readyState === 'ended') {   // the page stopped the recording
        try { ctx && ctx.close(); } catch (e) {}
        fill.style.width = '0';
        if (!warned && !srDead) hideTimer = setTimeout(() => { if (box) box.hidden = true; }, 2500);
        return;
      }
      if (an && ctx.state === 'running') {
        an.getFloatTimeDomainData(data); let s = 0, mx = 0; for (let i = 0; i < data.length; i++) { const v = data[i]; s += v * v; if (v > mx) mx = v; else if (-v > mx) mx = -v; }
        const rms = Math.sqrt(s / data.length); peak = Math.max(peak, rms); maxAbs = Math.max(maxAbs, mx); ran++;
        fill.style.width = Math.min(100, Math.round(Math.sqrt(rms) * 260)) + '%';
        const secs = (Date.now() - t0) / 1000;
        if (!warned && secs > 3 && ran > 20 && maxAbs < 0.0005) { warned = true; say(quiet()); }   // digital silence: a dead or wrong input
        else if (!warned && secs > 9 && peak < 0.006) { warned = true; say(T('El so és molt fluix. Parla més a prop del micròfon o tria’n un altre a la llista.', 'The sound is very quiet. Speak closer to the microphone or choose another one in the list.')); }
        else if (warned && peak > 0.02 && maxAbs > 0.05) { warned = false; say(T('✓ Ara sí que et sento.', '✓ Now I can hear you.'), 'ok'); }
      }
      setTimeout(tick, 100);
    };
    tick();
  }
  function fixSteps() {
    return T('Comprova que el micròfon està connectat i no silenciat' + (isMac ? ' (Configuració del Sistema › So › Entrada)' : '') + ', tria’l a la llista de sota i torna a gravar. Si acabes de donar permís, prem Recarrega (Ctrl/Cmd+R).',
      'Check the microphone is plugged in and not muted' + (isMac ? ' (System Settings › Sound › Input)' : '') + ', choose it in the list below and record again. If you just allowed the mic, press Reload (Ctrl/Cmd+R).');
  }
  async function blocked(err) {
    const n = err && err.name || '', msg = String(err && err.message || '');
    let state = '';
    try { state = (await navigator.permissions.query({ name: 'microphone' })).state; } catch (e) {}
    let t;
    if ((n === 'NotAllowedError' || n === 'SecurityError') && /system/i.test(msg)) t = isMac
      ? T('L’ordinador no deixa que Chrome faci servir el micròfon. Ves a Configuració del Sistema › Privacitat i seguretat › Micròfon, activa el navegador, tanca’l i torna’l a obrir.', 'Your Mac is not letting the browser use the microphone. Go to System Settings › Privacy & Security › Microphone, turn the browser on, then quit and reopen it.')
      : T('L’ordinador no deixa que el navegador faci servir el micròfon. Activa’l a la configuració de privacitat del sistema i torna a obrir el navegador.', 'Your computer is not letting the browser use the microphone. Turn it on in the system privacy settings and reopen the browser.');
    else if (n === 'NotAllowedError' || n === 'SecurityError' || state === 'denied') t = T('El navegador té el micròfon bloquejat per a aquesta pàgina. Fes clic a la icona de l’esquerra de la barra d’adreces › Micròfon › Permet, i després prem Recarrega.', 'The browser is blocking the microphone on this page. Click the icon at the left of the address bar › Microphone › Allow, then press Reload.');
    else if (n === 'NotFoundError' || n === 'OverconstrainedError') t = T('No trobo cap micròfon. Connecta’n un (o els auriculars amb micròfon) i torna-ho a provar.', 'No microphone found. Plug one in (or headphones with a mic) and try again.');
    else if (n === 'NotReadableError' || n === 'AbortError') t = T('El micròfon no respon: potser el fa servir una altra aplicació (Meet, Zoom, Teams…). Tanca-la i torna-ho a provar.', 'The microphone is not responding: another app may be using it (Meet, Zoom, Teams…). Close it and try again.');
    else t = T('No s’ha pogut fer servir el micròfon. ', 'The microphone could not be used. ') + fixSteps();
    const b = show(); b.querySelector('.bar i').style.width = '0'; b.querySelector('.s').textContent = ''; say(t);
  }

  /* ---------- getUserMedia ---------- */
  const md = navigator.mediaDevices;
  if (md && md.getUserMedia) {
    const orig = md.getUserMedia.bind(md);
    md.getUserMedia = async function (c) {
      const audioOnly = c && c.audio && !c.video, id = audioOnly ? saved.get() : '';
      let s;
      try {
        if (id) {
          try { s = await orig(Object.assign({}, c, { audio: Object.assign({}, typeof c.audio === 'object' ? c.audio : {}, { deviceId: { exact: id } }) })); }
          catch (e) { if (e && (e.name === 'NotAllowedError' || e.name === 'SecurityError')) throw e; saved.set(''); s = await orig(c); }   // the saved mic is gone
        } else s = await orig(c);
      } catch (e) { if (audioOnly) blocked(e); throw e; }
      if (audioOnly) try { watch(s); } catch (e) {}
      return s;
    };
  }

  /* ---------- AudioContext: never left suspended ---------- */
  const OrigAC = window.AudioContext || window.webkitAudioContext;
  ['AudioContext', 'webkitAudioContext'].forEach(n => {
    const O = window[n]; if (!O) return;
    try { const P = class extends O { constructor(...a) { super(...a); if (this.state === 'suspended') this.resume().catch(() => {}); } }; window[n] = P; } catch (e) {}
  });

  /* ---------- SpeechRecognition: say why the transcript fails ---------- */
  let srDead = '';
  const srText = code => code === 'network'
    ? T('La transcripció automàtica no funciona en aquesta xarxa o en aquest navegador (necessita el servei de veu de Google, a Chrome). La gravació sí que funciona: escriu tu el que has dit.', 'The automatic transcript doesn’t work on this network or in this browser (it needs Google’s speech service, in Chrome). The recording still works: type what you said.')
    : code === 'audio-capture' ? T('La transcripció automàtica no troba el micròfon. Escriu tu el que has dit.', 'The automatic transcript can’t reach the microphone. Type what you said.')
    : code === 'language-not-supported' ? T('Aquest navegador no fa transcripcions en anglès. Escriu tu el que has dit.', 'This browser can’t transcribe English. Type what you said.')
    : T('El navegador no deixa fer la transcripció automàtica. Permet el micròfon (icona de l’esquerra de la barra d’adreces) i prem Recarrega. Mentrestant, escriu tu el que has dit.', 'The browser is not allowing the automatic transcript. Allow the microphone (icon at the left of the address bar) and press Reload. Meanwhile, type what you said.');
  ['SpeechRecognition', 'webkitSpeechRecognition'].forEach(n => {
    const O = window[n]; if (!O) return;
    try {
      const P = class extends O {
        constructor() {
          super();
          this.addEventListener('error', e => {
            const code = e && e.error;
            if (['not-allowed', 'service-not-allowed', 'network', 'audio-capture', 'language-not-supported'].includes(code)) { srDead = code; say(srText(code), 'sr'); }
          });
        }
        start() { if (srDead) { say(srText(srDead), 'sr'); return; } return super.start(); }   // no endless retries after a hard error
      };
      window[n] = P;
    } catch (e) {}
  });

  window.elMic = { srBroken: () => srDead, text: srText, show, say };
})();
