// Announcements from the teacher (Roger, 31 Oct 2026: "I want to be able to send messages to my students, like announcements from the
// teacher"). The teacher writes them on the dashboard (teacher.html, "📣 Announcements") to one group, a whole course, every group or
// some students: announcements/{id} = {text, to, label, groups:[group ids], uids:[student uids], created, read:{uid: time}}.
// A student gets the ones sent to their group (groups) or to them (uids, testers are always in it): once as a card at the top of the next
// page they open (only announcements from the last CARD_DAYS days), and always in "📣 Announcements" on their board (today.html).
// "OK / D'acord" on the card adds read.{their uid}; that is all a student can change (firestore.rules), and the dashboard shows who read it.
// The card's own words follow the student's route (Catalan for Starter and Base, en false); so does the teacher's text when it has two
// versions (ca, en: annText), otherwise it goes as written.
export const ANN_MAX=1000,CARD_DAYS=14,ANN_COLOR="#ea580c";
export const annMs=x=>!x?0:x.toMillis?x.toMillis():x.toDate?+x.toDate():typeof x==="number"?x:+new Date(x)||0;
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
// The teacher's text as safe HTML: escaped, line breaks kept (white-space:pre-wrap on its box), web links clickable.
export function annHtml(text){
  return esc(String(text??"").slice(0,ANN_MAX)).replace(/\bhttps?:\/\/[^\s<>"]+[^\s<>".,;:!?)»”]/g,u=>`<a href="${u}" target="_blank" rel="noopener">${u}</a>`);
}
// Two versions (Roger, 7 Nov 2026: "escriure el text en català i que sortís en anglès als grups que toca i en català als grups que toca"):
// an announcement can carry ca (for Starter and Base) and en (for Core, Plus and Pro) next to text (what the teacher wrote, the source).
// Old ones and private messages only have text. en = the reader's language is English (the card's en, the board's EN).
export const annText=(a,en)=>String((a&&(en?a.en:a.ca))||(a&&a.text)||"");
// Free machine translation for the dashboard (Roger: "with a free translation tool… I don't want this feature to depend on you"):
// Google Translate's free web endpoint, called from the teacher's browser (no key, no account; it allows any site). Web links are
// kept exactly as written: only the words between them are translated. Throws if the service does not answer, so the dashboard asks
// the teacher to write that version by hand.
const URL_RE=/\bhttps?:\/\/[^\s<>"]+[^\s<>".,;:!?)»”]/g;
async function gtx(q,from,to){
  const r=await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(q)}`);
  if(!r.ok)throw new Error("translation service: "+r.status);
  const j=await r.json();if(!Array.isArray(j)||!Array.isArray(j[0]))throw new Error("translation service: no text");
  return j[0].map(x=>x&&x[0]||"").join("")}
export async function annTranslate(text,from,to){
  const s=String(text||""),parts=[];let i=0;
  for(const m of s.matchAll(URL_RE)){parts.push([s.slice(i,m.index),true],[m[0],false]);i=m.index+m[0].length}parts.push([s.slice(i),true]);
  const out=await Promise.all(parts.map(async([p,tr])=>{if(!tr||!/\p{L}/u.test(p))return p;
    const lead=p.match(/^\s*/)[0],trail=p.slice(lead.length).match(/\s*$/)[0],core=p.slice(lead.length,p.length-trail.length);
    return lead+(await gtx(core,from,to)).trim()+trail}));
  return out.join("")}
export const annDate=(x,en)=>{const ms=annMs(x);return ms?new Date(ms).toLocaleDateString(en?"en-GB":"ca-ES",{weekday:"short",day:"numeric",month:"short"}):""};
// a private message to one student (to:"one", from the student's window on the dashboard, Roger 7 Nov 2026) has its own title
export const annTitle=(en,one)=>one?(en?"✉️ Message from your teacher":"✉️ Missatge del teu professor"):en?"📣 Announcement from your teacher":"📣 Anunci del professor";
// Answers (Roger, 7 Nov 2026: "they should be able to answer back"): on a private message (to:"one") the student can reply, and the teacher
// can answer again from the dashboard. thread = [{by:"s"|"t", text, at (ms), uid (student's)}], oldest first. A student only adds one "s"
// item with their uid, their read time and sAt (firestore.rules); the teacher's answer removes read.{uid}, so the card comes back.
export const annLast=a=>Math.max(annMs(a.created),...((a.thread||[]).map(x=>+x.at||0)));
const bubble=(x,en)=>{const me=x.by==="s";
  return `<div style="margin:6px 0 0 ${me?"28px":"0"};margin-right:${me?"0":"28px"};padding:6px 10px;border-radius:10px;background:${me?"#e0f2fe":"#fff7ed"};border-left:4px solid ${me?"#0284c7":ANN_COLOR};white-space:pre-wrap;overflow-wrap:anywhere">`
    +`<small style="display:block;color:#64748b;font-weight:600">${me?(en?"You":"Tu"):(en?"Your teacher":"El professor")} · ${esc(annDate(x.at,en))}</small>${annHtml(x.text)}</div>`};
export const annThreadHtml=(a,en)=>(a.thread||[]).map(x=>bubble(x,en)).join("");
const btn=(bg,fg)=>`border:0;background:${bg};color:${fg};border-radius:999px;padding:6px 18px;font:inherit;font-weight:600;cursor:pointer`;
// The reply box (card and board): a textarea and Send. data-annreply on the form holds the announcement id.
export const annReplyForm=(id,en)=>`<form data-annreply="${esc(id)}" style="margin:8px 0 0" hidden><textarea maxlength="${ANN_MAX}" required rows="3" style="width:100%;box-sizing:border-box;font:inherit;padding:6px 8px;border:1px solid #cbd5e1;border-radius:8px" placeholder="${en?"Write your answer…":"Escriu la teva resposta…"}"></textarea>`
  +`<div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap"><button type="submit" style="${btn("#0f766e","#fff")}">${en?"Send":"Envia"}</button><button type="button" data-annno style="${btn("#e2e8f0","#0f172a")}">${en?"Cancel":"Cancel·la"}</button></div></form>`;
// The card as HTML (the dashboard shows the same one as a preview). a = {text, ca, en, created, to, thread}: the text in the reader's language.
export function annCardHtml(a,en,preview){
  const one=a.to==="one",d=annDate(one?annLast(a):(a.created||Date.now()),en);
  return `<b style="display:block;font-size:17px;margin-bottom:2px">${annTitle(en,one)}</b><small style="display:block;color:#64748b;margin-bottom:8px">${esc(d)}</small>`
    +`<div data-annbody style="margin:0 0 10px;max-height:45vh;overflow:auto"><div style="padding:8px 12px;border-left:4px solid ${ANN_COLOR};background:#fff7ed;border-radius:8px;white-space:pre-wrap;overflow-wrap:anywhere">${annText(a,en).trim()?annHtml(annText(a,en).trim()):`<span style="color:#94a3b8">${preview?"Your message…":""}</span>`}</div>${one?annThreadHtml(a,en):""}</div>`
    +`<small style="display:block;color:#64748b;margin-bottom:10px">${one?(en?"You can read it again and answer in 📣 Announcements on your board.":"El pots tornar a llegir i respondre a 📣 Anuncis, al teu tauler."):en?"You can read it again in 📣 Announcements on your board.":"El pots tornar a llegir a 📣 Anuncis, al teu tauler."}</small>`
    +`<div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" data-annok style="${btn("#0f766e","#fff")}">${en?"OK":"D'acord"}</button>${one?`<button type="button" data-annrep style="${btn("#e0f2fe","#075985")}">↩ ${en?"Reply":"Respon"}</button>`:""}</div>`
    +(one&&!preview?annReplyForm(a.id||"",en):"");
}
export const annCardStyle="background:#fff;color:#0f172a;border:2px solid "+ANN_COLOR+";border-radius:16px;box-shadow:0 10px 30px #0003;padding:14px 16px;font:15px/1.45 system-ui,sans-serif;box-sizing:border-box";
// Wires a reply form (card or board): Reply shows it, Cancel hides it, Send calls reply(id, text) and then sent().
export function annWireReply(root,reply,sent){
  const f=root.querySelector("form[data-annreply]"),r=root.querySelector("[data-annrep]");if(!f)return;
  if(r)r.onclick=()=>{f.hidden=false;r.hidden=true;f.querySelector("textarea").focus()};
  f.querySelector("[data-annno]").onclick=()=>{f.hidden=true;if(r)r.hidden=false};
  f.onsubmit=async e=>{e.preventDefault();const t=f.querySelector("textarea").value.trim().slice(0,ANN_MAX),b=f.querySelector("[type=submit]");if(!t)return;
    b.disabled=true;try{await reply(f.dataset.annreply,t);sent&&sent(t)}catch(err){console.warn("reply",err);b.disabled=false;alert((document.documentElement.lang||"").startsWith("ca")?"No s'ha pogut enviar. Torna-ho a provar.":"It could not be sent. Try again. / No s'ha pogut enviar.")}}}

// Shows the unread announcements one after the other, oldest first. load() → [{id, text, created, ...}] not read yet, done(id) marks one read,
// reply(id, text) sends the student's answer to a private message (it also marks it read).
export async function showAnnouncements({load,done,reply,en}){
  let L;try{L=await load()}catch(e){console.warn("announcements",e);return}
  const since=Date.now()-CARD_DAYS*864e5;
  L=(L||[]).filter(a=>String(a.text||"").trim()&&annLast(a)>=since).sort((a,b)=>annLast(a)-annLast(b));
  const next=()=>{
    const a=L.shift();if(!a)return;
    const c=document.createElement("div");c.id="el-announce";c.setAttribute("role","status");
    c.style.cssText="position:fixed;top:16px;left:50%;transform:translateX(-50%);width:min(440px,calc(100vw - 24px));z-index:10004;"+annCardStyle;
    c.innerHTML=annCardHtml(a,en);
    const b=c.querySelector("[data-annok]"),body=c.querySelector("[data-annbody]");
    b.onclick=()=>{c.remove();Promise.resolve(done(a.id)).catch(e=>console.warn("announcement",e));dispatchEvent(new CustomEvent("el-ann-read",{detail:a.id}));next()};   // the board drops its "New" tag
    if(!reply)c.querySelector("[data-annrep]")?.remove();else annWireReply(c,reply,()=>{c.innerHTML=`<b>✓ ${en?"Sent to your teacher.":"Enviat al professor."}</b>`;dispatchEvent(new CustomEvent("el-ann-read",{detail:a.id}));setTimeout(()=>{c.remove();next()},1800)});
    document.body.append(c);if(body)body.scrollTop=body.scrollHeight;b.focus({preventScroll:true})};
  // one card at a time: after the teacher's answers to problem reports, corrections, the exam results and the level cards
  const busy=()=>["el-reply","el-corrections","el-exam-notice","el-level-notice"].some(id=>document.getElementById(id));
  const wait=()=>busy()?setTimeout(wait,600):next();
  setTimeout(wait,300);
}
