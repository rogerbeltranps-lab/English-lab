// Route names (Roger, 26 Oct 2026, research audit; 30 Oct 2026: "no need for old names in the app any more"): the app shows only
// Starter · Base · Core · Plus · Pro, never Beginners · Insecure · Safe · Daring · Native. Code ids, data and docs keep the old names.
// Rather than edit every page and every text (plans, rubrics, tips), this script relabels whole, capitalised words in the visible text,
// titles, aria-labels and placeholders, now and whenever a page re-renders. Loaded by el-cloud.js, by teacher.html and, on pages
// without el-cloud.js, next to el-copyright.js.
(function () {
  if (window.EL_ROUTE_RENAME) return;
  const MAP = window.EL_ROUTE_RENAME = { Beginners: 'Starter', Insecure: 'Base', Safe: 'Core', Daring: 'Plus', Native: 'Pro' };
  // Native (Roger, 30 Oct 2026) → Pro, but never in "Native American(s)" (LP3 content).
  const RE = /\b(Beginners|Insecure|Safe|Daring|Native(?! Americans?\b))\b/g, TEST = /\b(Beginners|Insecure|Safe|Daring|Native(?! Americans?\b))\b/;
  const SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, NOSCRIPT: 1, CODE: 1 };
  const swap = s => s.replace(RE, m => MAP[m]);
  const ATTRS = ['title', 'aria-label', 'placeholder', 'alt'];
  function fixEl(el) {
    for (const a of ATTRS) { const v = el.getAttribute && el.getAttribute(a); if (v && TEST.test(v)) el.setAttribute(a, swap(v)); }
  }
  function fix(root) {
    if (!root) return;
    if (root.nodeType === 3) { const p = root.parentNode; if (p && !SKIP[p.nodeName] && !p.isContentEditable && TEST.test(root.nodeValue)) root.nodeValue = swap(root.nodeValue); return; }
    if (root.nodeType !== 1 && root.nodeType !== 9) return;
    if (root.nodeType === 1) { if (SKIP[root.nodeName] || root.isContentEditable) return; fixEl(root); }
    const w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode: n => n.nodeType === 1 ? (SKIP[n.nodeName] || n.isContentEditable ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) : NodeFilter.FILTER_ACCEPT
    });
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      if (n.nodeType === 1) fixEl(n);
      else if (TEST.test(n.nodeValue)) n.nodeValue = swap(n.nodeValue);
    }
  }
  function start() {
    if (TEST.test(document.title)) document.title = swap(document.title);
    fix(document.body);
    new MutationObserver(ms => {
      for (const m of ms) {
        if (m.type === 'childList') m.addedNodes.forEach(fix);
        else if (m.type === 'characterData') fix(m.target);
        else if (m.type === 'attributes') fixEl(m.target);
      }
      if (TEST.test(document.title)) document.title = swap(document.title);
    }).observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
