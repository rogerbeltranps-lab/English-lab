/* Model final product pages (<route>-model.html, LS2 on): adds the model as a VIDEO WITH SOUND above the slides.
   Use: <script src="../../shared/js/el-model-video.js" data-video="video/safe-model.mp4" data-who="Arnau's vlog" defer></script>
   data-ca="1" (Base pages, Catalan support): buttons and note in Catalan, data-who in Catalan too ("el vlog de la Júlia").
   Two buttons: 🎬 Watch it (video, default) / 🖼 Slides one by one (the existing slides + script). Captions on the video.
   The video is made by tools/model-video (free voices). (Roger, 14 Nov 2026: "examples with audio of the LS2 final tasks") */
(function () {
  'use strict';
  var me = document.currentScript, src = me && me.getAttribute('data-video');
  if (!src) return;
  var who = me.getAttribute('data-who') || 'the model', v = me.getAttribute('data-v') || '1', ca = me.getAttribute('data-ca') === '1';
  var T = ca ? { watch: '🎬 Mira ', slides: '🖼 Diapositives una a una', note: '🔊 Activa el so. <b>CC</b> mostra o amaga les paraules. Al teu vídeo, també s’ha de veure la teva cara.' }
    : { watch: '🎬 Watch ', slides: '🖼 Slides one by one', note: '🔊 Turn the sound on. <b>CC</b> shows or hides the words. In your real video, your face is on screen too.' };
  function start() {
    var shell = document.getElementById('presentationShell');
    if (!shell || document.getElementById('modelVideo')) return;
    var base = src.replace(/\.mp4$/, '');
    var css = document.createElement('style');
    css.textContent = '.mv-tabs{max-width:1160px;margin:0 auto 12px;display:flex;gap:8px;flex-wrap:wrap}' +
      '.mv-tab{border:2px solid var(--soft2,#d8eee3);background:#fff;color:var(--dark,#174d3d);padding:9px 16px;border-radius:12px;font-weight:800;cursor:pointer;font:inherit;font-weight:800}' +
      '.mv-tab[aria-pressed=true]{background:var(--accent,#1f6b52);border-color:var(--accent,#1f6b52);color:#fff}' +
      '.mv{max-width:1160px;margin:0 auto}.mv video{display:block;width:100%;max-height:calc(100dvh - 215px);aspect-ratio:16/9;margin:auto;background:#0d1a16;border-radius:var(--radius,22px);box-shadow:0 15px 45px rgba(18,37,56,.13)}' +
      '.mv p{margin:10px 2px 0;color:var(--muted,#66766f);font-size:.85rem}.mv[hidden],.mv-hide{display:none!important}' +
      '@media print{.mv-tabs,.mv{display:none!important}}';
    document.head.appendChild(css);
    var tabs = document.createElement('div');
    tabs.className = 'mv-tabs';
    tabs.innerHTML = '<button type="button" class="mv-tab" data-k="video" aria-pressed="true">' + T.watch + who + '</button>' +
      '<button type="button" class="mv-tab" data-k="slides" aria-pressed="false">' + T.slides + '</button>';
    var box = document.createElement('div');
    box.className = 'mv'; box.id = 'modelVideo';
    box.innerHTML = '<video controls preload="metadata" playsinline poster="' + base + '-poster.jpg?v=' + v + '" src="' + src + '?v=' + v + '">' +
      '<track kind="captions" srclang="en" label="English" src="' + base + '.vtt?v=' + v + '" default></video>' +
      '<p>' + T.note + '</p>';
    shell.parentNode.insertBefore(tabs, shell);
    shell.parentNode.insertBefore(box, shell);
    var video = box.querySelector('video');
    function show(k) {
      [].forEach.call(tabs.children, function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-k') === k)); });
      box.hidden = k !== 'video';
      shell.classList.toggle('mv-hide', k === 'video');
      if (k !== 'video') video.pause();
    }
    tabs.addEventListener('click', function (e) { var b = e.target.closest('.mv-tab'); if (b) show(b.getAttribute('data-k')); });
    show('video');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
