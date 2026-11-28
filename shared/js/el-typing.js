// Writing evidence for the marking sheets (Roger, 31 Oct 2026: "I want to make sure they don't copy, so if the text is perfect or from
// Google Translate we should notice"). On every learning-path page (loaded by learning-path-support.js) each text box keeps, per page
// and box, how many characters came in by pasting or dropping, how many keys were typed and how long the student was actively writing
// (gaps of more than a minute do not count). Kept in localStorage under el_ty:<page> (el_ keys are not synced). Nothing is shown to the
// student. A hand-in stores elTyping.sum(the step's panel) as state.steps[step].ty = {p: pasted chars, k: keys typed, s: seconds
// writing, n: chars in the boxes, c: chars refused because they came in a chunk (dictation, swipe), only when there were some}; the marking sheet shows it and Claude flags a text that was mostly pasted (shared/js/el-marking.js).
window.elTyping = window.elTyping || (function () {
  var K = 'el_ty:' + location.pathname, D = {}, last = {}, timer = null, GAP = 60000;
  try { D = JSON.parse(localStorage.getItem(K) || '{}') || {}; } catch (e) { D = {}; }
  function keep() { clearTimeout(timer); timer = setTimeout(function () { try { localStorage.setItem(K, JSON.stringify(D)); } catch (e) {} }, 400); }
  function box(el) { return el && el.matches && el.matches('textarea, input[type=text], input:not([type])') && !el.readOnly ? el : null; }
  function keyOf(el) { var p = el.parentElement && el.parentElement.closest('[id]'); return el.id || ((p ? p.id : '') + '/' + (el.getAttribute('data-f') || el.getAttribute('data-n') || el.name || '')); }
  function rec(el) { var k = keyOf(el); return D[k] = D[k] || { p: 0, k: 0, ms: 0 }; }
  document.addEventListener('paste', function (e) { var el = box(e.target); if (!el || e.__elOwn) return; var t = ''; try { t = e.clipboardData.getData('text') || ''; } catch (x) {} rec(el).p += t.length; keep(); }, true);
  document.addEventListener('drop', function (e) { var el = box(e.target); if (!el || e.__elOwn) return; var t = ''; try { t = e.dataTransfer.getData('text') || ''; } catch (x) {} rec(el).p += t.length; keep(); }, true);
  document.addEventListener('keydown', function (e) { var el = box(e.target); if (!el || e.ctrlKey || e.metaKey || e.altKey) return; if (e.key && (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter')) { rec(el).k++; keep(); } }, true);
  document.addEventListener('input', function (e) { var el = box(e.target); if (!el) return; var k = keyOf(el), now = Date.now(); if (last[k] && now - last[k] < GAP) rec(el).ms += now - last[k]; last[k] = now; keep(); }, true);
  /* No dictation in writing boxes (Roger, 28 Nov 2026: a writing of 521 characters went in with 26 keys in 3 minutes; "lock it"):
     a writing box (any <textarea> of an activity, section.panel, on a learning path page; not a dialog such as ⚠️ Report a problem, not
     Towards Nativeness) takes text only a few letters at a time, the way a
     keyboard types it. Text that arrives in a chunk (dictation on a Chromebook or a phone, swipe typing, a phone's word suggestions,
     autofill) is refused: cancelled in beforeinput where the browser allows it, otherwise taken back in input. Pasting is left to
     el-nocopy.js (own text only) and undo/redo still work. Each refused chunk counts in c (characters), so the writing log can say it. */
  var MAX = 3, LOCK = !/towards-nativeness/.test(location.pathname), pre = null, tipAt = 0;
  function wbox(el) { return LOCK && el && el.tagName === 'TEXTAREA' && !el.readOnly && !el.disabled && el.closest('section.panel') && !el.closest('dialog') ? el : null; }
  function freeType(t) { return !t || /^(delete|history|insertFromPaste|insertFromDrop|insertLineBreak|insertParagraph|format)/.test(t); }
  function tip(el) {
    var now = Date.now(); if (now - tipAt < 4000) return; tipAt = now;
    var t = document.createElement('div'); t.className = 'el-type-tip'; t.setAttribute('role', 'status');
    var CA = 'Escriu-ho tu, lletra a lletra: aqu\u00ED no funciona el dictat ni el lliscament.', EN = 'Type it yourself, letter by letter: dictation and swipe typing don\u2019t work here.';
    var ca = false; try { ca = !!(window.elPageCa && window.elPageCa()); } catch (x) {}   // both languages, theirs first (Catalan only for Starter)
    t.textContent = '\u270B ' + (ca ? CA + ' \u00B7 ' + EN : EN + ' \u00B7 ' + CA);
    t.style.cssText = 'position:fixed;left:50%;bottom:84px;transform:translateX(-50%);z-index:99999;max-width:min(92vw,560px);background:#1f2937;color:#fff;font:600 14px/1.4 system-ui,sans-serif;padding:10px 14px;border-radius:10px;box-shadow:0 4px 18px rgba(0,0,0,.25);text-align:center';
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 4500);
  }
  function refused(el, n) { rec(el).c = (rec(el).c || 0) + n; keep(); tip(el); }
  document.addEventListener('beforeinput', function (e) {
    var el = wbox(e.target); pre = null; if (!el) return;
    pre = { el: el, v: el.value, a: el.selectionStart, b: el.selectionEnd, t: e.inputType };
    if (freeType(e.inputType)) return;
    var d = e.data != null ? e.data : (e.dataTransfer ? e.dataTransfer.getData('text') : '');
    if (d && d.length > MAX && e.cancelable && e.inputType !== 'insertCompositionText') { e.preventDefault(); pre = null; refused(el, d.length); }
  }, true);
  document.addEventListener('input', function (e) {
    var el = wbox(e.target), p = pre; pre = null; if (!el || !p || p.el !== el || freeType(e.inputType || p.t)) return;
    var added = el.value.length - (p.v.length - Math.max(0, (p.b || 0) - (p.a || 0)));
    if (added > MAX) { el.value = p.v; try { el.setSelectionRange(p.a, p.b); } catch (x) {} refused(el, added); e.stopImmediatePropagation(); }
  }, true);
  // totals for the text boxes inside root (an element or a selector): what a hand-in stores
  function sum(root) {
    var r = typeof root === 'string' ? document.querySelector(root) : root, o = { p: 0, k: 0, s: 0, n: 0 }, ms = 0;
    if (!r) return null;
    var q = 'textarea, input[type=text], input:not([type])';
    [].forEach.call(r.matches(q) ? [r] : r.querySelectorAll(q), function (el) { var x = D[keyOf(el)]; o.n += (el.value || '').trim().length; if (x) { o.p += x.p; o.k += x.k; ms += x.ms; if (x.c) o.c = (o.c || 0) + x.c; } });
    o.s = Math.round(ms / 1000); return o;
  }
  return { sum: sum };
})();
