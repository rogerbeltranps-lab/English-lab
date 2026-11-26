// No translating, no copying (Roger, 9 Nov 2026: "I don't want them to be able to use the translator of Chrome that translates all
// the web" + "is it possible to not allow copying, Ctrl+C or copy and paste on the web?"). Loaded in the <head> of every student page
// and game (not teacher.html). Each page also has <html translate="no" class="notranslate"> + <meta name="google" content="notranslate">;
// this file adds them again in case a page is missing them.
//  - Page text can't be selected, copied, cut, dragged or right-clicked (so it can't go into Google Translate or "Translate selection").
//  - In the answer boxes students type as usual, can right-click, and can copy/cut their OWN text. Pasting text is only
//    allowed when it is that own text (moving a sentence inside their writing); anything else (a translator, a web page, a chat) is
//    stopped, and so is dropping text dragged in from another window. Pasting an image still works (screenshot in the report dialog).
//  - A blocked paste stops here (window, capture phase), so shared/js/el-typing.js never counts it as pasted characters; allowed pastes
//    still reach it and are counted as before.
//  - No spelling help (Roger, 13 Nov 2026: "when students write in the web I don't want the corrector to underline their mistakes or
//    solve their misspelling mistakes"): every answer box, also the ones a page builds later, gets spellcheck="false" (no red
//    underlines, no spelling suggestions on right-click), autocorrect="off", autocapitalize="off", writingsuggestions="false" (Chrome's
//    grey inline suggestions) and autocomplete="off" (no list of earlier answers; a box that already says what it autocompletes, like
//    the sign-in email, keeps it), plus the switches Grammarly and LanguageTool read. Chromebooks pass these to their own keyboard
//    autocorrect too. <html spellcheck="false"> covers anything missed. Password boxes are left alone.
// What it can't stop: a photo of the screen, a phone, another extension or app, retyping into a translator, or turning JavaScript off.
(function () {
  if (window.__elNoCopy) return; window.__elNoCopy = true;
  var d = document, h = d.documentElement;
  h.setAttribute('translate', 'no'); h.classList.add('notranslate');
  if (!d.querySelector('meta[name="google"][content="notranslate"]')) {
    var m = d.createElement('meta'); m.name = 'google'; m.content = 'notranslate'; (d.head || h).appendChild(m);
  }
  var st = d.createElement('style');
  st.textContent = 'body{-webkit-user-select:none;user-select:none}' +
    'input,textarea,select,[contenteditable]:not([contenteditable="false"]),[contenteditable] *{-webkit-user-select:text;user-select:text}';
  (d.head || h).appendChild(st);

  function editable(el) {
    for (; el && el.nodeType !== 1; el = el.parentNode) {}
    if (!el || !el.closest) return null;
    var b = el.closest('textarea, input, [contenteditable]');
    if (!b || b.getAttribute('contenteditable') === 'false') return null;
    if (b.tagName === 'INPUT' && /^(button|submit|reset|checkbox|radio|file|image|range|color|hidden)$/i.test(b.type)) return null;
    return b;
  }
  function stop(e) { e.preventDefault(); e.stopImmediatePropagation(); }
  function selText(b) {
    if (b && b.value != null && b.selectionStart != null) { try { return b.value.slice(b.selectionStart, b.selectionEnd); } catch (x) {} }
    return String(window.getSelection ? window.getSelection() : '');
  }
  var norm = function (s) { return String(s || '').replace(/\r\n?/g, '\n').trim(); };
  var own = [];   // texts the student copied or cut from their own boxes on this page (last 5)

  function copyCut(e) {
    var b = editable(e.target);
    if (!b) { stop(e); return; }
    var t = norm(selText(b)); if (t) { own.unshift(t); own.length = Math.min(own.length, 5); }
  }
  window.addEventListener('copy', copyCut, true);
  window.addEventListener('cut', copyCut, true);
  window.addEventListener('paste', function (e) {
    var cd = e.clipboardData, t = '';
    try { t = cd ? cd.getData('text') || '' : ''; } catch (x) {}
    if (!norm(t)) return;                       // nothing as text (an image, a file): let it through
    if (!editable(e.target) || own.indexOf(norm(t)) < 0) stop(e);
  }, true);
  window.addEventListener('drop', function (e) {
    var dt = e.dataTransfer, t = '';
    try { t = dt ? dt.getData('text') || '' : ''; } catch (x) {}
    if (!inside && norm(t) && own.indexOf(norm(t)) < 0) stop(e);   // drag-and-drop inside the page (a game) still works
  }, true);
  var inside = false;
  window.addEventListener('dragstart', function (e) {
    var el = e.target.nodeType === 1 ? e.target : e.target.parentNode;
    if (!editable(el) && !(el && el.closest && el.closest('[draggable="true"]'))) { stop(e); return; }
    inside = true;
  }, true);
  window.addEventListener('dragend', function () { inside = false; }, true);
  window.addEventListener('contextmenu', function (e) { if (!editable(e.target)) stop(e); }, true);

  // No spelling help in answer boxes.
  var OFF = { spellcheck: 'false', autocorrect: 'off', autocapitalize: 'off', writingsuggestions: 'false',
    'data-gramm': 'false', 'data-gramm_editor': 'false', 'data-enable-grammarly': 'false', 'data-lt-active': 'false' };
  function noHelp(b) {
    if (!b || b.nodeType !== 1 || b.__elNoHelp) return;
    if (b.tagName === 'INPUT' && /^password$/i.test(b.type)) return;
    b.__elNoHelp = true;
    for (var k in OFF) if (b.getAttribute(k) !== OFF[k]) b.setAttribute(k, OFF[k]);
    if (!b.hasAttribute('autocomplete')) b.setAttribute('autocomplete', 'off');
  }
  var BOX = 'textarea, input, [contenteditable]';
  function scan(root) {
    if (!root || root.nodeType !== 1) return;
    noHelp(editable(root) === root ? root : null);
    if (root.querySelectorAll) { var l = root.querySelectorAll(BOX); for (var i = 0; i < l.length; i++) noHelp(editable(l[i]) === l[i] ? l[i] : null); }
  }
  h.setAttribute('spellcheck', 'false');
  window.addEventListener('focusin', function (e) { noHelp(editable(e.target)); }, true);
  if (window.MutationObserver) new MutationObserver(function (ms) {
    for (var i = 0; i < ms.length; i++) {
      var m = ms[i];
      if (m.type === 'attributes') { m.target.__elNoHelp = false; scan(m.target); }
      else for (var j = 0; j < m.addedNodes.length; j++) scan(m.addedNodes[j]);
    }
  }).observe(h, { childList: true, subtree: true, attributes: true, attributeFilter: ['contenteditable', 'spellcheck', 'type'] });
  scan(h);
})();
