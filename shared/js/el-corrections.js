// The teacher's corrections, where the student did the work (Roger, 31 Oct 2026: "when you correct it students get a notification and
// see the correction in that tab of the learning path"). The teacher's answer to a hand-in is results/{activity}.replies[step]: written
// on the dashboard (💬 Answer, or the feedback of a 🤖 Marking sheet) or by tools/marking/marks.mjs. On every page that loads
// el-cloud.js a student gets a card, once per new answer, with a link to that step's tab of the learning path (page.html#step: el-cloud
// opens the tab). On the learning path itself the answer sits at the top of the step's tab, always. Levels are never shown to the
// student (students are not told which steps are assessed); "corrected" is said when the step has a teacher level, "answered" when not.
// The answers the student has seen are students/{uid}.fbSeen["activity|step"] = a short signature of the text, so a new or changed
// answer brings the card back. "Later" hides it until the browser is closed. On the learning path the step's levels are also sent to
// the page as the "el-levels" event (a teacher-marked writing panel turns them into its points, ls2-engine.js).
const sig=t=>{let h=5381;for(const ch of String(t))h=(h*33+ch.codePointAt(0))>>>0;return h.toString(36)};
const css=s=>window.CSS&&CSS.escape?CSS.escape(s):s.replace(/[^\w-]/g,"\\$&");

// list() → [{activity, replies, levels}] (the student's results), seen() → fbSeen, save({key: sig}), here = this page's activity id or
// null, root = the site root URL, en = the route reads English, name(activity, step) → the step's name or null.
export async function corrections({list,seen,save,here,root,en,name}){
  let rs,was;try{[rs,was]=await Promise.all([list(),seen()]);was=was||{}}catch(e){console.warn("corrections",e);return}
  const cat=window.EL_CATALOG||[],T=(ca,e)=>en?e:ca;
  const items=[];
  for(const r of rs){const a=cat.find(x=>x.id===r.activity);if(!a)continue;
    for(const [step,text] of Object.entries(r.replies||{}))if(text&&String(text).trim())
      items.push({a,step,text:String(text),k:a.id+"|"+step,v:sig(text),corr:!!((r.levels||{})[step]&&Object.keys(r.levels[step]).length)})}
  // on the learning path: the answers in their tabs, and the levels for the page
  const mine=rs.find(r=>r.activity===here);
  if(mine&&mine.levels)dispatchEvent(new CustomEvent("el-levels",{detail:{levels:mine.levels}}));
  const shown={};
  for(const it of items.filter(x=>x.a.id===here)){
    const put=()=>{const p=document.querySelector("section.panel#"+css(it.step))||document.getElementById(it.step);if(!p)return false;
      let b=p.querySelector(":scope>.el-correction");if(!b){b=document.createElement("div");b.className="el-correction";const h=p.querySelector(":scope>.panel-head");h?h.after(b):p.prepend(b)}
      b.style.cssText="margin:0 0 14px;padding:12px 14px;border:2px solid #16a34a;border-radius:14px;background:#f0fdf4;color:#0f172a;font:15px/1.5 system-ui,sans-serif";
      b.innerHTML='<b style="display:block;margin-bottom:4px"></b><div style="white-space:pre-wrap"></div>';
      b.querySelector("b").textContent=it.corr?T("✏️ La correcció del professor","✏️ Your teacher’s correction"):T("💬 La resposta del professor","💬 Your teacher’s answer");
      b.querySelector("div").textContent=it.text;return true};
    if(put())shown[it.k]=it.v;else{let n=0;const t=setInterval(()=>{if(put()||++n>40)clearInterval(t)},250)}   // the page may still be drawing its tabs
  }
  if(Object.keys(shown).length)Promise.resolve(save(shown)).catch(e=>console.warn("corrections",e));
  let later={};try{later=JSON.parse(sessionStorage.getItem("el_corr_later")||"{}")}catch(e){}
  const todo=items.filter(x=>!shown[x.k]&&was[x.k]!==x.v&&later[x.k]!==x.v);
  if(!todo.length)return;
  const show=()=>{
    const c=document.createElement("div");c.id="el-corrections";c.setAttribute("role","status");
    c.style.cssText="position:fixed;top:16px;left:50%;transform:translateX(-50%);width:min(460px,calc(100vw - 24px));box-sizing:border-box;z-index:10004;background:#fff;color:#0f172a;border:2px solid #16a34a;border-radius:16px;box-shadow:0 10px 30px #0003;padding:14px 16px;font:15px/1.45 system-ui,sans-serif;max-height:80vh;overflow:auto";
    const any=todo.some(x=>x.corr);
    c.innerHTML='<b style="display:block;font-size:17px;margin-bottom:4px"></b><p style="margin:0 0 8px"></p><ul style="margin:0 0 10px;padding-left:20px"></ul><small style="display:block;color:#64748b;margin-bottom:10px"></small>'
      +'<button type="button" style="border:1px solid #cbd5e1;background:#fff;color:#334155;border-radius:999px;padding:6px 16px;font:inherit;cursor:pointer"></button>';
    c.querySelector("b").textContent=any?T("✏️ El professor t’ha corregit feina","✏️ Your teacher has corrected your work"):T("💬 El professor t’ha respost","💬 Your teacher has answered you");
    c.querySelector("p").textContent=T("Obre-la per llegir què has fet bé i què pots millorar:","Open it to read what you did well and what to improve:");
    c.querySelector("small").textContent=T("Del teu professor","From your teacher");
    const ul=c.querySelector("ul");
    for(const it of todo.slice(0,6)){const li=document.createElement("li"),l=document.createElement("a");
      l.textContent=it.a.title.replace(/:.*$/,"")+" · "+(name(it.a.id,it.step)||it.step)+" →";l.href=new URL(it.a.path,root).href+"#"+encodeURIComponent(it.step);
      l.style.cssText="color:#0f766e;font-weight:600";
      l.onclick=ev=>{ev.preventDefault();c.remove();Promise.resolve(save({[it.k]:it.v})).catch(e=>console.warn("corrections",e)).then(()=>{
        const u=new URL(l.href);if(u.pathname===location.pathname){history.replaceState(null,"",u.href);location.reload()}else location.href=u.href})};
      li.append(l);ul.append(li)}
    if(todo.length>6){const li=document.createElement("li");li.textContent=T("… i "+(todo.length-6)+" més","… and "+(todo.length-6)+" more");ul.append(li)}
    const b=c.querySelector("button");b.textContent=T("Més tard","Later");
    b.onclick=()=>{c.remove();todo.forEach(x=>later[x.k]=x.v);try{sessionStorage.setItem("el_corr_later",JSON.stringify(later))}catch(e){}};
    document.body.append(c)};
  // one card at a time: after the problem-report answers, the level card and the exam card
  const wait=()=>document.getElementById("el-reply")||document.getElementById("el-level-notice")||document.getElementById("el-exam-notice")?setTimeout(wait,600):show();
  wait();
}
