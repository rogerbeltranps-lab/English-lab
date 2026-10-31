// Writing evidence for the marking sheets (Roger, 31 Oct 2026: "I want to make sure they don't copy, so if the text is perfect or from
// Google Translate we should notice"). On every learning-path page (loaded by learning-path-support.js) each text box keeps, per page
// and box, how many characters came in by pasting or dropping, how many keys were typed and how long the student was actively writing
// (gaps of more than a minute do not count). Kept in localStorage under el_ty:<page> (el_ keys are not synced). Nothing is shown to the
// student. A hand-in stores elTyping.sum(the step's panel) as state.steps[step].ty = {p: pasted chars, k: keys typed, s: seconds
// writing, n: chars in the boxes}; the marking sheet shows it and Claude flags a text that was mostly pasted (shared/js/el-marking.js).
window.elTyping = window.elTyping || (function () {
  var K = 'el_ty:' + location.pathname, D = {}, last = {}, timer = null, GAP = 60000;
  try { D = JSON.parse(localStorage.getItem(K) || '{}') || {}; } catch (e) { D = {}; }
  function keep() { clearTimeout(timer); timer = setTimeout(function () { try { localStorage.setItem(K, JSON.stringify(D)); } catch (e) {} }, 400); }
  function box(el) { return el && el.matches && el.matches('textarea, input[type=text], input:not([type])') && !el.readOnly ? el : null; }
  function keyOf(el) { var p = el.parentElement && el.parentElement.closest('[id]'); return el.id || ((p ? p.id : '') + '/' + (el.getAttribute('data-f') || el.getAttribute('data-n') || el.name || '')); }
  function rec(el) { var k = keyOf(el); return D[k] = D[k] || { p: 0, k: 0, ms: 0 }; }
  document.addEventListener('paste', function (e) { var el = box(e.target); if (!el) return; var t = ''; try { t = e.clipboardData.getData('text') || ''; } catch (x) {} rec(el).p += t.length; keep(); }, true);
  document.addEventListener('drop', function (e) { var el = box(e.target); if (!el) return; var t = ''; try { t = e.dataTransfer.getData('text') || ''; } catch (x) {} rec(el).p += t.length; keep(); }, true);
  document.addEventListener('keydown', function (e) { var el = box(e.target); if (!el || e.ctrlKey || e.metaKey || e.altKey) return; if (e.key && (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter')) { rec(el).k++; keep(); } }, true);
  document.addEventListener('input', function (e) { var el = box(e.target); if (!el) return; var k = keyOf(el), now = Date.now(); if (last[k] && now - last[k] < GAP) rec(el).ms += now - last[k]; last[k] = now; keep(); }, true);
  // totals for the text boxes inside root (an element or a selector): what a hand-in stores
  function sum(root) {
    var r = typeof root === 'string' ? document.querySelector(root) : root, o = { p: 0, k: 0, s: 0, n: 0 }, ms = 0;
    if (!r) return null;
    var q = 'textarea, input[type=text], input:not([type])';
    [].forEach.call(r.matches(q) ? [r] : r.querySelectorAll(q), function (el) { var x = D[keyOf(el)]; o.n += (el.value || '').trim().length; if (x) { o.p += x.p; o.k += x.k; ms += x.ms; } });
    o.s = Math.round(ms / 1000); return o;
  }
  return { sum: sum };
})();
