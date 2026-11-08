/* Final product video upload (Roger, 8 Nov 2026: "it'd be a good idea that students load the final product on the web … the files could go to my
   drive"). elVideo.mount(box, {ca, meta, saved, onDone}) draws an "Upload your video" card: the student picks the file and the page sends it in
   8 MB pieces to the school Apps Script (tools/notify/school-mail.gs, actions video_start / video_chunk / video_status), which writes it into
   the teacher's Drive (Teacher Studio › 04_Students (private) › Final product videos › group). Heavy videos work (up to 2 GB); a lost
   connection goes on from the last piece Drive has. onDone({id, name, size, at}) is called once the whole file is in Drive; the page then
   saves it with the hand-in (state.steps.video) so the dashboard can play it and Gemini can watch it. saved = that earlier upload. */
(function () {
  const RELAY = 'https://script.google.com/macros/s/AKfycbyG8C2d9UN7Ped1Z3MfjRR_k3WCPpWiXVI2m3FFpuW9MUD8OLh9epTwsYrcR0RkrN0GIA/exec';
  const MAX = 2e9;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const mb = n => n >= 1e9 ? (n / 1e9).toFixed(1) + ' GB' : Math.max(1, Math.round(n / 1e6)) + ' MB';
  const b64 = blob => new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1] || ''); r.onerror = no; r.readAsDataURL(blob); });
  const wait = ms => new Promise(r => setTimeout(r, ms));
  async function call(body) {
    const r = await fetch(RELAY, { method: 'POST', headers: { 'content-type': 'text/plain' }, body: JSON.stringify(body) });
    return r.json();
  }

  function mount(box, o) {
    if (!box) return;
    const ca = !!o.ca, T = (c, e) => ca ? c : e;
    let saved = o.saved && o.saved.id ? o.saved : null, busy = false;
    function draw(note, cls) {
      box.innerHTML = '<div class="section-card el-video" style="border:2px solid #9bc3ff;background:#f4f9ff">' +
        '<h3 style="margin-top:0">🎬 ' + T('Puja el teu vídeo', 'Upload your video') + '</h3>' +
        (saved ? '<p class="feedback ok" style="margin:6px 0">✅ ' + T('El professor ja té el teu vídeo', 'Your teacher has your video') + ': <b>' + esc(saved.name) + '</b> (' + mb(saved.size) + ', ' + new Date(saved.at).toLocaleDateString() + ').</p>' : '') +
        '<p class="instruction">' + (saved ? T('Si l’has millorat, pots pujar-ne una versió nova: el professor veurà l’última.', 'If you improved it, you can upload a new version: your teacher will see the last one.')
          : T('Tria el fitxer del vídeo (mp4, mov o webm). Va directament a la carpeta del professor: només ell el pot veure. Si és gros, pot trigar uns minuts: no tanquis la pàgina.',
            'Choose your video file (mp4, mov or webm). It goes straight to your teacher’s folder: only your teacher can see it. A big video can take a few minutes: don’t close the page.')) + '</p>' +
        '<div class="actions" style="justify-content:flex-start"><label class="btn" style="cursor:pointer">' + (saved ? T('Puja una versió nova', 'Upload a new version') : T('Tria el vídeo', 'Choose the video')) +
        '<input type="file" accept="video/*" hidden></label></div>' +
        '<div class="elv-bar" hidden style="height:14px;border-radius:7px;background:#dde7f3;overflow:hidden;margin:10px 0"><div style="height:100%;width:0;background:#2f7de1;transition:width .3s"></div></div>' +
        '<p class="feedback ' + (cls || '') + '" aria-live="polite">' + (note || '') + '</p></div>';
      const inp = box.querySelector('input[type=file]');
      inp.onchange = () => { const f = inp.files && inp.files[0]; if (f) send(f); };
      if (busy) inp.disabled = true;
    }
    function bar(p) { const b = box.querySelector('.elv-bar'); if (!b) return; b.hidden = false; b.firstChild.style.width = Math.round(p * 100) + '%'; }
    function say(t, cls) { const m = box.querySelector('.feedback:last-child'); if (m) { m.className = 'feedback ' + (cls || ''); m.textContent = t; } }
    async function send(f) {
      if (busy) return;
      if (!/^video\//.test(f.type || '') && !/\.(mp4|mov|webm|m4v|avi|mkv)$/i.test(f.name)) return say(T('Això no és un vídeo. Tria el fitxer del vídeo.', 'That is not a video. Choose your video file.'), 'no');
      if (f.size > MAX) return say(T('El vídeo és massa gros (més de 2 GB). Exporta’l amb menys qualitat (720p) i torna-ho a provar.', 'The video is too big (over 2 GB). Export it in lower quality (720p) and try again.'), 'no');
      const C = window.ELCloud, u = C && C.auth && C.auth.currentUser;
      if (!u) return say(T('Primer entra amb el teu compte de l’institut.', 'Sign in with your school account first.'), 'no');
      busy = true; draw(T('Preparant…', 'Getting ready…'));
      const meta = Object.assign({ page: location.pathname, group: (C.group && C.group()) || '' }, o.meta || {});
      const leave = e => { e.preventDefault(); e.returnValue = ''; };
      addEventListener('beforeunload', leave);
      try {
        const st = await call({ idToken: await u.getIdToken(), action: 'video_start', name: f.name, size: f.size, mime: f.type || 'video/mp4', meta });
        if (!st || !st.ok) throw new Error(st && st.error || 'no answer');
        const step = st.chunk || 8 * 1024 * 1024;
        let off = 0, tries = 0, res = null;
        while (!res) {
          bar(off / f.size);
          say(T('Pujant… ', 'Uploading… ') + Math.round(off / f.size * 100) + '% (' + mb(off) + ' / ' + mb(f.size) + ')' + T(' · no tanquis la pàgina', ' · don’t close this page'));
          let j;
          try { j = await call({ action: 'video_chunk', token: st.token, offset: off, data: await b64(f.slice(off, Math.min(f.size, off + step))) }); }
          catch (e) { j = null; }
          if (j && j.ok && j.done) { res = j; break; }
          if (j && j.ok) { off = j.next; tries = 0; continue; }
          if (j && /expired/.test(j.error || '')) throw new Error(j.error);
          if (++tries > 6) throw new Error(j && j.error || 'connection');
          say(T('La connexió ha fallat: ho torno a provar…', 'The connection failed: trying again…'), 'no');
          await wait(2000 * tries);
          try { const s = await call({ action: 'video_status', token: st.token }); if (s && s.ok && s.done) res = s; else if (s && s.ok) off = s.next; } catch (e) {}
        }
        saved = { id: res.id, name: f.name, size: f.size, at: new Date().toISOString() };
        busy = false;
        if (o.onDone) o.onDone(saved);
        draw('✅ ' + T('Fet! El vídeo ja és a la carpeta del professor.', 'Done! Your video is in your teacher’s folder.'), 'ok');
      } catch (e) {
        busy = false;
        const m = String(e && e.message || e);
        draw(T('No s’ha pogut pujar el vídeo', 'The video could not be uploaded') + ' (' + (m === 'too many videos today' ? T('massa vídeos avui', 'too many videos today') : m) + '). ' +
          T('Torna-ho a provar; si no funciona, fes servir el botó Problema.', 'Try again; if it still fails, use the Problem button.'), 'no');
      } finally { removeEventListener('beforeunload', leave); }
    }
    draw();
  }
  window.elVideo = { mount };
})();
