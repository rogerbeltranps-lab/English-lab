// Announcements from the teacher (Roger, 31 Oct 2026: "I want to be able to send messages to my students, like announcements from the
// teacher"). The teacher writes them on the dashboard (teacher.html, "📣 Announcements") to one group, a whole course, every group or
// some students: announcements/{id} = {text, to, label, groups:[group ids], uids:[student uids], created, read:{uid: time}}.
// A student gets the ones sent to their group (groups) or to them (uids, testers are always in it): once as a card at the top of the next
// page they open (only announcements from the last CARD_DAYS days), and always in "📣 Announcements" on their board (today.html).
// "OK / D'acord" on the card adds read.{their uid}; that is all a student can change (firestore.rules), and the dashboard shows who read it.
// The card's own words follow the student's route (Catalan for Starter and Base, en false); the teacher's text goes as written.
export const ANN_MAX=1000,CARD_DAYS=14,ANN_COLOR="#ea580c";
export const annMs=x=>!x?0:x.toMillis?x.toMillis():x.toDate?+x.toDate():typeof x==="number"?x:+new Date(x)||0;
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
// The teacher's text as safe HTML: escaped, line breaks kept (white-space:pre-wrap on its box), web links clickable.
export function annHtml(text){
  return esc(String(text??"").slice(0,ANN_MAX)).replace(/\bhttps?:\/\/[^\s<>"]+[^\s<>".,;:!?)»”]/g,u=>`<a href="${u}" target="_blank" rel="noopener">${u}</a>`);
}
export const annDate=(x,en)=>{const ms=annMs(x);return ms?new Date(ms).toLocaleDateString(en?"en-GB":"ca-ES",{weekday:"short",day:"numeric",month:"short"}):""};
export const annTitle=en=>en?"📣 Announcement from your teacher":"📣 Anunci del professor";
// The card as HTML (the dashboard shows the same one as a preview). a = {text, created}.
export function annCardHtml(a,en,preview){
  const d=annDate(a.created||Date.now(),en);
  return `<b style="display:block;font-size:17px;margin-bottom:2px">${annTitle(en)}</b><small style="display:block;color:#64748b;margin-bottom:8px">${esc(d)}</small>`
    +`<div style="margin:0 0 10px;padding:8px 12px;border-left:4px solid ${ANN_COLOR};background:#fff7ed;border-radius:8px;white-space:pre-wrap;overflow-wrap:anywhere;max-height:45vh;overflow:auto">${String(a.text||"").trim()?annHtml(String(a.text).trim()):`<span style="color:#94a3b8">${preview?"Your message…":""}</span>`}</div>`
    +`<small style="display:block;color:#64748b;margin-bottom:10px">${en?"You can read it again in 📣 Announcements on your board.":"El pots tornar a llegir a 📣 Anuncis, al teu tauler."}</small>`
    +`<button type="button" style="border:0;background:#0f766e;color:#fff;border-radius:999px;padding:6px 18px;font:inherit;font-weight:600;cursor:pointer">${en?"OK":"D'acord"}</button>`;
}
export const annCardStyle="background:#fff;color:#0f172a;border:2px solid "+ANN_COLOR+";border-radius:16px;box-shadow:0 10px 30px #0003;padding:14px 16px;font:15px/1.45 system-ui,sans-serif;box-sizing:border-box";

// Shows the unread announcements one after the other, oldest first. load() → [{id, text, created, ...}] not read yet, done(id) marks one read.
export async function showAnnouncements({load,done,en}){
  let L;try{L=await load()}catch(e){console.warn("announcements",e);return}
  const since=Date.now()-CARD_DAYS*864e5;
  L=(L||[]).filter(a=>String(a.text||"").trim()&&annMs(a.created)>=since).sort((a,b)=>annMs(a.created)-annMs(b.created));
  const next=()=>{
    const a=L.shift();if(!a)return;
    const c=document.createElement("div");c.id="el-announce";c.setAttribute("role","status");
    c.style.cssText="position:fixed;top:16px;left:50%;transform:translateX(-50%);width:min(440px,calc(100vw - 24px));z-index:10004;"+annCardStyle;
    c.innerHTML=annCardHtml(a,en);
    const b=c.querySelector("button");
    b.onclick=()=>{c.remove();Promise.resolve(done(a.id)).catch(e=>console.warn("announcement",e));dispatchEvent(new CustomEvent("el-ann-read",{detail:a.id}));next()};   // the board drops its "New" tag
    document.body.append(c);b.focus({preventScroll:true})};
  // one card at a time: after the teacher's answers to problem reports, corrections, the exam results and the level cards
  const busy=()=>["el-reply","el-corrections","el-exam-notice","el-level-notice"].some(id=>document.getElementById(id));
  const wait=()=>busy()?setTimeout(wait,600):next();
  setTimeout(wait,300);
}
