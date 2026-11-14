// 🎙️ Who couldn't record (Roger, 14 Nov 2026: "If they can't record, ask them to notify it so that, when I start a class with that group I
// get a message on the screen to help them out"). Students press 🎙️ I can't record on a Speaking or Talk step (shared/js/el-mic.js cant),
// which writes live/{group}/micHelp/{email} = {name, page, step, title, at}. When class mode starts, the class tab (el-cloud.js cmTeacher)
// calls show(): one read of that small collection (only the students who pressed it), and if there is anyone, a card at the top of the
// projector screen. The card shows the count first and the names on a tap (as the class panels, Roger 10 Nov 2026), so the class does not
// read them on the projector unless Roger wants. ✓ Sorted removes one; a student whose recording later reaches the teacher removes it too.
// The 🎙️ button on the class mode chip opens it again (count kept in sessionStorage el_cm_mic_n for that chip).
let C = null, box = null, list = [];
const E = t => String(t == null ? "" : t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const day = ts => { const d = ts && ts.toDate ? ts.toDate() : null; return d ? d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) : ""; };
const keep = () => { try { sessionStorage.setItem("el_cm_mic_n", String(list.length)); } catch (e) {} };
export const count = () => { try { return +sessionStorage.getItem("el_cm_mic_n") || 0; } catch (e) { return 0; } };

// ctx: {db, collection, getDocs, doc, deleteDoc, g, gname, onCount}
export async function show(ctx, names) {
  C = ctx;
  try { const s = await C.getDocs(C.collection(C.db, "live", C.g, "micHelp")); list = s.docs.map(d => Object.assign({ e: d.id }, d.data())); }
  catch (e) { console.warn("mic help", e); return 0; }
  list.sort((a, b) => String(a.name).localeCompare(String(b.name)));
  keep(); if (C.onCount) C.onCount(list.length);
  if (list.length) draw(!!names); else close();
  return list.length;
}
export function close() { if (box) { box.remove(); box = null; } }

function draw(names) {
  if (!box) {
    box = document.createElement("div"); box.id = "el-michelp";
    box.style.cssText = "position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:2147483200;width:min(560px,calc(100vw - 24px));max-height:calc(100vh - 28px);overflow:auto;box-sizing:border-box;padding:14px 16px;border-radius:16px;background:#fff7ed;color:#1f2937;border:2px solid #f97316;box-shadow:0 10px 30px rgba(0,0,0,.25);font:15px/1.45 system-ui,-apple-system,'Segoe UI',sans-serif";
    box.onclick = e => { const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.k === "x") return close();
      if (b.dataset.k === "who") return draw(true);
      if (b.dataset.k === "ok") return sorted(b.dataset.e, b); };
    document.body.append(box);
  }
  const n = list.length, btn = "border:1px solid #fdba74;border-radius:999px;padding:5px 12px;background:#fff;color:#9a3412;font:700 13px system-ui,sans-serif;cursor:pointer";
  box.innerHTML = '<div style="display:flex;align-items:flex-start;gap:10px"><div style="font-size:26px;line-height:1">🎙️</div><div style="flex:1">' +
    '<b style="font-size:17px">' + n + (n === 1 ? " student" : " students") + " of " + E(C.gname) + " can’t record</b>" +
    '<div style="color:#7c2d12;margin-top:2px">They pressed “I can’t record” on a speaking step. Help them with the microphone during this class.</div></div>' +
    '<button data-k="x" title="Close (🎙️ on the class mode chip opens it again)" style="border:0;background:none;font-size:22px;line-height:1;color:#9a3412;cursor:pointer;padding:0 2px">×</button></div>' +
    (names
      ? '<ul style="list-style:none;margin:10px 0 0;padding:0">' + list.map(x => '<li style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:7px 0;border-top:1px solid #fed7aa"><b>' + E(x.name || x.e) + '</b><span style="color:#7c2d12;font-size:13px">' + E(x.title || x.step || "") + (x.at ? " · " + E(day(x.at)) : "") + '</span><button data-k="ok" data-e="' + E(x.e) + '" title="Remove them from this list (the microphone works now)" style="margin-left:auto;' + btn + '">✓ Sorted</button></li>').join("") + "</ul>"
      : '<div style="margin-top:10px"><button data-k="who" style="' + btn + '">👀 Show who</button></div>');
}
async function sorted(e, b) {
  b.disabled = true; b.textContent = "…";
  try { await C.deleteDoc(C.doc(C.db, "live", C.g, "micHelp", e)); list = list.filter(x => x.e !== e); keep(); if (C.onCount) C.onCount(list.length); list.length ? draw(true) : close(); }
  catch (err) { console.warn("mic help", err); b.disabled = false; b.textContent = "✗ Not saved: try again"; }
}
