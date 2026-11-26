// 🟢 Online now + 🕘 Visit history (Roger, 13 Nov 2026: "Is it possible to see who is connected on the website? … And I want to have a historial").
// Loaded by el-cloud.js on every page of a signed-in student (and the test account), never in the teacher's student view.
// One document per student and day, visits/{day}_{uid} (day = the date in Madrid), only the teacher reads it (firestore.rules):
//   {uid, email, name, group, day, tester?, last (server time of the latest beat), page, title (where they are now),
//    s: {<start ms>: {a: start ms, b: last seen ms, p: {<page key>: seconds on it}}},   one entry per visit (a gap of 10 min starts a new one)
//    t: {<page key>: {n: title, u: path}}}
// Few writes: a beat when a page opens (at most one a minute) and every 4 minutes while the page is on screen; nothing while it is hidden.
// The time of each page is counted in this browser (el_vis_<uid>) and goes with the next beat; a visit that ended while the page was hidden
// (lid closed) is sent once, when the student comes back. The dashboard's 🟢 Online counts a student online while their last beat is
// at most 6 minutes old. Nothing is read here.
const BEAT_MS = 4 * 60e3, MIN_GAP = 60e3, NEW_VISIT = 10 * 60e3, TICK = 15e3;
const dayOf = (ms) => { try { return new Date(ms).toLocaleDateString("en-CA", { timeZone: "Europe/Madrid" }) } catch (e) { return new Date(ms).toISOString().slice(0, 10) } };
const keyOf = (u) => (u.replace(/\.html$/, "").replace(/[^a-z0-9-]+/gi, "~").replace(/^~+|~+$/g, "") || "home").slice(0, 120);

export function startVisits({ db, fs, user, name, group, tester, root }) {
  if (window.__elVisits) return; window.__elVisits = true;
  const { doc, setDoc, serverTimestamp } = fs;
  const K = "el_vis_" + user.uid;
  const base = new URL(root).pathname;
  const page = (location.pathname.startsWith(base) ? location.pathname.slice(base.length) : location.pathname.replace(/^\//, "")) || "index.html";
  const pageTitle = (page === "today.html" ? "🏠 Board" : (document.title || page).replace(/\s*·\s*English Lab\s*$/, "")).slice(0, 190);
  // 📓 My notebook is the LS page with #notes (el-notebook.js), not a page of its own: it gets its own row (Roger, 14 Nov 2026:
  // "how do I know if she has checked the notebook?"), "📓 My notebook · <the LS>", and the time on it is counted apart
  let path, title, pk;
  const where = () => { const nb = location.hash === "#notes";
    path = nb ? page + "#notes" : page; pk = keyOf(page) + (nb ? "~notebook" : "");
    title = nb ? ("📓 My notebook · " + pageTitle.replace(/^\d+\s*ESO\s*·\s*/i, "")).slice(0, 190) : pageTitle };
  where();
  const load = () => { try { return JSON.parse(localStorage.getItem(K) || "null") } catch (e) { return null } };
  const save = (v) => { try { localStorage.setItem(K, JSON.stringify(v)) } catch (e) { } };
  let V = load(), lastTick = Date.now(), timer = null;

  // the visit's document: its day is the day it started
  function send(v, here) {
    const d = { uid: user.uid, email: (user.email || "").toLowerCase(), name: (name || "").slice(0, 190), group: group || null, day: v.day,
      last: serverTimestamp(), s: { [String(v.a)]: { a: v.a, b: v.b, p: v.p } }, t: v.t };
    if (tester) d.tester = true;
    if (here) { d.page = path.slice(0, 290); d.title = title }
    v.sent = v.b; v.at = Date.now(); save(v);
    return setDoc(doc(db, "visits", v.day + "_" + user.uid), d, { merge: true }).catch((e) => console.warn("visits", e));
  }
  function fresh(now) { return { day: dayOf(now), a: now, b: now, p: {}, t: {}, sent: 0, at: 0 } }
  // a visit that stopped more than 10 minutes ago is over: send what was not sent yet, then start a new one
  function current(now) {
    V = load() || V;
    if (!V || now - V.b > NEW_VISIT || V.day !== dayOf(V.a)) {
      if (V && V.b > V.sent && V.a) send(V, false);
      V = fresh(now); save(V);
    }
    return V;
  }
  function count(leaving) {
    const now = Date.now(), dt = Math.min(now - lastTick, 2 * TICK); lastTick = now;
    if (!leaving && document.visibilityState !== "visible") return;
    const v = current(now);
    v.p[pk] = Math.round((v.p[pk] || 0) + dt / 1000);
    if (!v.t[pk] && Object.keys(v.t).length < 150) v.t[pk] = { n: title, u: path };
    v.b = now; save(v);
    if (!leaving && now - (v.at || 0) >= BEAT_MS) send(v, true);
  }
  // the first beat of this page: now, or a minute after the last one (going quickly from page to page)
  function open() {
    const now = Date.now(), v = current(now);
    if (!v.t[pk] && Object.keys(v.t).length < 150) v.t[pk] = { n: title, u: path };
    if (!v.p[pk]) v.p[pk] = 0;
    v.b = now; save(v);
    clearTimeout(timer);
    const wait = Math.max(0, MIN_GAP - (now - (v.at || 0)));
    timer = setTimeout(() => { if (document.visibilityState === "visible") { const w = current(Date.now()); w.b = Date.now(); send(w, true) } }, wait);
  }
  if (document.visibilityState === "visible") open();
  setInterval(count, TICK);
  // into or out of the notebook: the time so far goes to where they were, and a beat says where they are now (at most one a minute)
  addEventListener("hashchange", () => { const was = pk;
    if (document.visibilityState === "visible") count(true);   // pk is still where they were
    where(); if (pk !== was && document.visibilityState === "visible") open() });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") { lastTick = Date.now(); open() }
    else count(true)
  });
}
