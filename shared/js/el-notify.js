// 📬 The student's own notifications (Roger, 25 Nov 2026: "will students see notifications, like you have the exam corrected…"; 📬, not
// the teacher's 📬, so the two never look the same in the 👁 student view: Roger, 25 Nov 2026: "it shoulndt be the same bell Icon"): a 📬 in
// the bottom-right bar of every page for students (and in the teacher's 👁 student view, as the student sees it), between 💡 and 🚪.
// The red number counts what is new; the list keeps the latest news from the teacher, newest first, each one a link:
//   ✏️ a correction · 💬 an answer to a hand-in or a comment · ↺ a step sent back to redo   (results/{activity}.replies / answers / flags)
//   📝 exam results that are out                                                        (results/{ls}__assessment, every section marked)
//   💬 / ✅ / 💌 the teacher's answer to a problem report or an idea                      (problemReplies, the same list as el-reply.js)
//   📣 / ✉️ an announcement or a private message                                         (announcements, the same list as el-announce.js)
// Held things never show early: everything comes from what the page already shows (el-cloud.js myResults takes out exam results waiting
// for 📣 Publish and corrections or answers waiting for 17:00; problem answers waiting for 📨 Send it and late announcements are left out
// by their own loads), so the 📬 knows nothing the cards do not. No Firestore reads of its own: the results copy, students/{uid} (fbSeen,
// examSeen) and the two card loads are shared with the cards. Problem answers are deleted when the student presses OK, and announcements
// are read once, so the 📬 keeps a short history of both in this browser (el_nt_<uid>: up to 30 items) and what was already looked at.
// "New" = not seen on its card or page yet (fbSeen / examSeen / OK) and not looked at in the 📬; anything older than 21 days is never new.
// Opening the list takes the number away; a click on a correction or exam saves it as seen, like its card does. Dates only, never times.
const NEW_DAYS=21,KEEP=30,SHOW=15;
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const ms=x=>!x?0:typeof x==="number"?x:x.toMillis?x.toMillis():x.toDate?+x.toDate():typeof x==="string"?Date.parse(x)||0:+x||0;
const cut=(s,n)=>{s=String(s??"").replace(/\s+/g," ").trim();return s.length>n?s.slice(0,n-1)+"…":s};
const store={get:k=>{try{return JSON.parse(localStorage.getItem(k)||"null")}catch(e){return null}},
  set:(k,v)=>{try{Storage.prototype.setItem.call(localStorage,k,JSON.stringify(v))}catch(e){}}};

// The items from the student's results (corrections, answers, redo, exam results). rs = {id: result} as el-cloud.js myResults gives it
// (held things already taken out); me = students/{uid} (fbSeen, examSeen); corr = el-corrections.js corrList; examSig = el-exam-notice.js.
// visible(ls) → the board lists that LS; saveFb({key: sig}) / saveExam(ls, sig) save what was seen (null in the student view).
export async function resultItems({rs,me,corr,examSig,course,root,board,en,name,visible,saveFb,saveExam}){
  const T=(ca,e)=>en?e:ca,now=Date.now(),cat=window.EL_CATALOG||[],G=window.EL_GRADING||{},fbSeen=(me&&me.fbSeen)||{},exSeen=(me&&me.examSeen)||{},out=[];
  const stepName=(a,step)=>name(a.id,step)||({write:T("Escriptura","Writing"),speak:"Speaking",talk:"Talk",reflect:T("Reflexió","Reflection")})[step]||step;
  for(const it of corr(Object.values(rs||{}),cat)){const r=it.r,step=it.step,fl=(r.flags||{})[step]||{},an=(r.answers||{})[step]||{};
    const go=ms((r.fbGo||{})[step]),at=Math.max(go<=now?go:0,ms((r.fbAt||{})[step]),ms((r.marked||{})[step]),ms(an.at)<=now?ms(an.at):0,fl.done==="redo"?ms(fl.at):0)||ms(r.updated);
    const redo=fl.done==="redo"&&(fl.back||fl.reopen||fl.auto);
    out.push({k:"c:"+it.k+":"+it.v,ic:redo?"↺":it.corr?"✏️":"💬",
      t:redo?T("El professor et demana que ho tornis a fer","Your teacher asks you to redo it"):it.corr?T("El professor t’ha corregit feina","Your teacher has corrected your work"):T("El professor t’ha respost","Your teacher has answered you"),
      s:it.a.title.replace(/:.*$/,"")+" · "+stepName(it.a,step),h:new URL(it.a.path,root).href+"#"+encodeURIComponent(step),at,
      fresh:fbSeen[it.k]!==it.v,ck:it.k,cv:it.v,go:saveFb?()=>saveFb({[it.k]:it.v}):null})}
  const L=(window.EL_LS||[]).filter(l=>l.course===course);
  for(const l of L){const g=G[l.id];if(!g||!g.exam)continue;
    const r=(rs||{})[l.id+"__assessment"],s=examSig(g.exam,(r&&r.sections)||{});if(!r||s.includes(null))continue;
    const v=s.join(",");if(!(await visible(l.id).catch(()=>false)))continue;
    const n="LS"+(L.indexOf(l)+1),sf=ms(r.showFrom),again=!!exSeen[l.id]&&exSeen[l.id]!==v;
    out.push({k:"x:"+l.id+":"+v,ic:"📝",t:again?T(`Han canviat els resultats de l'examen de la ${n}`,`Your ${n} exam results have changed`):T(`Ja tens els resultats de l'examen de la ${n}`,`Your ${n} exam results are ready`),
      s:n+" · "+l.title.replace(/^\S+ · /,""),h:board+"?ls="+encodeURIComponent(l.id)+"#exam",at:sf&&sf<=now?sf:ms(r.updated),
      fresh:exSeen[l.id]!==v,go:saveExam?()=>saveExam(l.id,v):null})}
  return out}

// The 📬 itself. uid = whose notifications, en = their language, ro = the teacher's 👁 student view (nothing saved, no history: the
// history is in the student's own browser). Returns {el, live(items), add(items), seen(prefix)}.
export function studentBell({uid,en,ro}){
  const T=(ca,e)=>en?e:ca,KEY="el_nt_"+uid;
  const st=(!ro&&store.get(KEY))||{log:[],seen:{}};st.log=st.log||[];st.seen=st.seen||{};
  // what was looked at: the latest 300 keys (the oldest go first), never pruned by what this page happens to have loaded so far
  const save=()=>{if(ro)return;const ks=Object.keys(st.seen);if(ks.length>300)ks.slice(0,ks.length-300).forEach(k=>delete st.seen[k]);store.set(KEY,st)};
  let live=[],open=false,rung=false;
  const css=document.createElement("style");css.textContent=`
#el-nbell{position:relative;display:inline-flex}
#el-nbell>button{border:1px solid #cbd5e1;background:#fff;color:#0f172a;border-radius:999px;padding:4px 9px;cursor:pointer;font:15px/1.2 system-ui,sans-serif;display:inline-flex;gap:4px;align-items:center}
#el-nbell>button b{background:#dc2626;color:#fff;border-radius:999px;min-width:18px;padding:0 5px;font-size:12px;line-height:18px;text-align:center}
#el-npanel{position:fixed;right:10px;bottom:58px;width:min(380px,calc(100vw - 20px));max-height:min(62vh,520px);overflow:auto;background:#fff;color:#0f172a;border:1px solid #cbd5e1;border-radius:14px;box-shadow:0 10px 30px #0003;z-index:10003;text-align:left;font:14px/1.4 system-ui,sans-serif}
#el-npanel[hidden]{display:none}
#el-npanel .hd{position:sticky;top:0;background:#0f766e;color:#fff;padding:9px 12px;display:flex;justify-content:space-between;align-items:center;gap:8px;z-index:1}
#el-npanel .hd button{border:0;background:none;color:#fff;font-size:16px;cursor:pointer}
#el-npanel ul{list-style:none;margin:0;padding:4px 6px 8px}
#el-npanel li{border-top:1px solid #e2e8f0}#el-npanel li:first-child{border-top:0}
#el-npanel li>a,#el-npanel li>button{display:flex;gap:9px;align-items:flex-start;width:100%;box-sizing:border-box;padding:8px 6px;border:0;background:none;color:#0f172a!important;text-decoration:none;text-align:left;font:inherit;cursor:pointer;border-radius:8px}
#el-npanel li>a:hover,#el-npanel li>button:hover,#el-npanel li>a:focus-visible,#el-npanel li>button:focus-visible{background:#f1f5f9}
#el-npanel .ic{flex:none;width:24px;text-align:center;font-size:17px;line-height:1.3}
#el-npanel .tx{flex:1;min-width:0}#el-npanel .tx b{display:block;color:#0f172a!important}#el-npanel .tx small{display:block;color:#475569!important;overflow-wrap:anywhere}
#el-npanel .dt{flex:none;color:#64748b!important;font-size:12px;white-space:nowrap;padding-top:2px}
#el-npanel li.nw>a,#el-npanel li.nw>button{background:#f0fdfa}#el-npanel li.nw .tx b:before{content:"";display:inline-block;width:8px;height:8px;border-radius:50%;background:#dc2626;margin:0 6px 1px 0}
#el-npanel .full{margin:0 6px 8px 39px;padding:8px 10px;background:#eff6ff;border-left:4px solid #2563eb;border-radius:8px;white-space:pre-wrap;overflow-wrap:anywhere;color:#0f172a!important}
#el-npanel .none{margin:14px 12px;color:#64748b!important}
@media (max-width:640px){#el-npanel{left:10px;right:10px;bottom:10px;width:auto;max-height:70vh}}
@media print{#el-nbell,#el-npanel{display:none!important}}`;
  document.head.append(css);
  const w=document.createElement("span");w.id="el-nbell";
  const b=document.createElement("button");b.type="button";b.className="elcb-i";
  const p=document.createElement("div");p.id="el-npanel";p.hidden=true;p.setAttribute("role","dialog");p.setAttribute("aria-label",T("Notificacions","Notifications"));
  w.append(b);document.body.append(p);
  const all=()=>{const m=new Map();for(const x of [...st.log,...live])if(!m.has(x.k))m.set(x.k,x);return [...m.values()].sort((a,c)=>(c.at||0)-(a.at||0))};
  const isNew=x=>!st.seen[x.k]&&x.fresh!==false&&(x.at||0)>Date.now()-NEW_DAYS*864e5;
  const day=t=>{if(!t)return "";const d=new Date(t),n=new Date(),y=new Date(n);y.setDate(n.getDate()-1);
    return d.toDateString()===n.toDateString()?T("Avui","Today"):d.toDateString()===y.toDateString()?T("Ahir","Yesterday"):d.toLocaleDateString(en?"en-GB":"ca-ES",{day:"numeric",month:"short"})};
  let shownNew=new Set();
  const draw=()=>{const L=all(),n=L.filter(isNew).length;
    b.innerHTML="📬"+(n?"<b>"+n+"</b>":"");
    const tip=n?T(n===1?"1 notificació nova":n+" notificacions noves",n===1?"1 new notification":n+" new notifications"):T("Notificacions","Notifications");
    b.dataset.tip=tip;b.setAttribute("aria-label",tip);
    if(n&&!rung&&b.animate){rung=true;b.animate([{transform:"rotate(0)"},{transform:"rotate(-16deg)"},{transform:"rotate(16deg)"},{transform:"rotate(0)"}],{duration:500,iterations:2,delay:1200})}
    if(p.hidden)return;
    const li=(x,i)=>{const inner='<span class="ic" aria-hidden="true">'+esc(x.ic)+'</span><span class="tx"><b>'+esc(x.t)+"</b>"+(x.s?"<small>"+esc(x.s)+"</small>":"")+'</span><span class="dt">'+esc(day(x.at))+"</span>";
      return '<li class="'+(shownNew.has(x.k)?"nw":"")+'">'+(x.h?'<a href="'+esc(x.h)+'" data-i="'+i+'">'+inner+"</a>":'<button type="button" data-i="'+i+'" aria-expanded="false">'+inner+"</button>")+"</li>"};
    const shown=L.slice(0,SHOW);
    p.innerHTML='<div class="hd"><b>📬 '+T("Notificacions","Notifications")+'</b><button type="button" data-x aria-label="'+T("Tanca","Close")+'">✕</button></div>'
      +(shown.length?"<ul>"+shown.map(li).join("")+"</ul>":'<p class="none">'+T("Encara no tens cap notificació. Aquí veuràs les correccions, les respostes del professor i els resultats dels exàmens.","No notifications yet. Here you will see your corrections, your teacher's answers and your exam results.")+"</p>");
    p.querySelector("[data-x]").onclick=()=>show(false);
    p.querySelectorAll("[data-i]").forEach(e=>{const x=shown[+e.dataset.i];
      if(e.tagName==="A")e.onclick=ev=>{if(!x.go||ro)return;ev.preventDefault();show(false);
        Promise.resolve().then(x.go).catch(er=>console.warn("notifications",er)).then(()=>{const u=new URL(x.h,location.href);
          if(u.pathname===location.pathname&&u.search===location.search){history.replaceState(null,"",u.href);location.reload()}else location.href=u.href})};
      else e.onclick=()=>{const nx=e.nextElementSibling;if(nx&&nx.classList.contains("full")){nx.remove();e.setAttribute("aria-expanded","false");return}
        if(!x.full)return;const d=document.createElement("div");d.className="full";d.textContent=x.full;e.after(d);e.setAttribute("aria-expanded","true")}})};
  const show=o=>{open=o;p.hidden=!o;
    if(o){const L=all();shownNew=new Set(L.filter(isNew).map(x=>x.k));if(!ro){L.forEach(x=>{if(!st.seen[x.k])st.seen[x.k]=1});save()}}
    draw();if(o){const f=p.querySelector("[data-i]");if(f)f.focus({preventScroll:true})}};
  b.onclick=e=>{e.stopPropagation();show(p.hidden)};
  document.addEventListener("click",e=>{if(!p.hidden&&!p.contains(e.target)&&!w.contains(e.target))show(false)});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!p.hidden)show(false)});
  // a correction shown on its own page (el-corrections.js saves fbSeen) is not new any more
  addEventListener("el-fb-seen",e=>{const d=e.detail||{};let ch=false;for(const x of live)if(x.ck&&d[x.ck]===x.cv&&x.fresh){x.fresh=false;ch=true}if(ch)draw()});
  addEventListener("el-ann-read",e=>api.seen("a:"+e.detail+":"));
  const api={el:w,
    // the items worked out from the results: replaced on every call
    live(items){live=(items||[]).slice();draw()},
    // items from the card loads (problem answers, announcements): kept in this browser's history
    add(items){if(!items||!items.length)return;for(const x of items){const i=st.log.findIndex(y=>y.k===x.k);const o={k:x.k,ic:x.ic,t:x.t,s:x.s||"",h:x.h||"",at:x.at||Date.now(),full:x.full||""};
        if(i>=0)st.log[i]=o;else st.log.push(o)}
      st.log.sort((a,c)=>(c.at||0)-(a.at||0));st.log=st.log.slice(0,KEEP);save();draw()},
    // seen on its own card (OK): every item whose key starts with the prefix
    seen(pre){let ch=false;for(const x of all())if(x.k.startsWith(pre)&&!st.seen[x.k]){st.seen[x.k]=1;ch=true}if(ch){save();draw()}}};
  draw();
  return api}

// A problem answer (problemReplies, as el-reply.js shows it) and an announcement (as el-announce.js shows it) as 📬 items.
export function replyItem(r,en,R){const lang=typeof r.en==="boolean"?r.en:en,{title,body}=R.replyText(r,lang),[m,m2]=R.replyMsgs(r,lang);
  const ic=/^\S+/.exec(title)[0];
  return {k:"r:"+r.id+":",ic,t:title.replace(/^\S+\s+/,""),s:cut(m||body,90),at:ms(r.at)||ms(r.created),full:[body,m,m2&&(R.otherLabel(lang)+"\n"+m2)].filter(Boolean).join("\n\n")}}
export function annItem(a,en,A,board){const one=a.to==="one",title=A.annTitle(en,one),last=A.annLast(a);
  return {k:"a:"+a.id+":"+last,ic:/^\S+/.exec(title)[0],t:title.replace(/^\S+\s+/,""),s:cut(A.annText(a,en),90),at:last,h:board+"#news"}}
