// Floating ✅ To do button (Roger, 25 Oct 2026 as "📋 My week"; since 6 Nov 2026 only what the teacher opens: "I don't [want] students [to]
// see anything as to do nor the week. I say when to do sth since otherwise is too much info. I open sections or an LP and if we don't finish
// I can say this is homework"). On every page a signed-in student opens (board, course page, LS pages, activities, English Lab): the exam
// day, 📝 the homework the teacher set on the dashboard (ELWeek.studentHw, with ✔ Done or Open) and the learning paths and tabs the teacher
// has opened for the group that the student has not finished (elTodoList in el-catalog.js), each tab a link. No week plan, no plan dates.
// Loaded by el-cloud.js for students and testers: start({db,user,group,root,lsId,seesAll,results,levels,lsInfo}); the last three are
// el-cloud.js's shared reads (one per page, results from the 30-minute copy), so the list costs no reads of its own. Catalan for Starter/Base.
import {doc,getDoc,collection,getDocs} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const load=src=>new Promise(r=>{const s=document.createElement("script");s.src=src;s.onload=r;s.onerror=r;document.head.append(s)});
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
const store={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{Storage.prototype.setItem.call(localStorage,k,v)}catch(e){}}};

let REM=null,remReady;const remP=new Promise(r=>remReady=r);
// ⚡ Finished early? (el-cloud.js ffCard, Roger 21 Nov 2026: "if they are done, they can do pending tasks (button to go to pending task)"):
// window.elTodoReady = a Promise of elTodoPending(), the same work as this list, one entry per task [{u: path, p: tab or "", n: name}]
// (the list's todo() and the homework not done); an empty list when this page has no To do (no group, no plan, the LS not open).
export async function start(o){let fin;window.elTodoReady=new Promise(r=>fin=r);
  try{const x=await start0(o);fin(x&&x.pending||(()=>[]));return x}catch(e){fin(()=>[]);throw e}}
async function start0({db,user,group,root,lsId,seesAll,results,levels,lsInfo}){
  if(!group)return;
  if(!window.EL_PLAN)await load(new URL("shared/js/el-plan.js",root).href);
  if(!window.ELWeek)await load(new URL("shared/js/el-week.js",root).href);
  if(!window.EL_SECTIONS)await load(new URL("shared/js/el-sections.js",root).href);
  const W=window.ELWeek,x=W&&W.now(group);if(!x)return;
  const {ls,p,gi}=x,today=W.today();
  let i=W.row(p);if(i<0)i=p.rows.findIndex(r=>r.from>today);
  if(i<0)return;   // the plan is over
  const get=async path=>{const s=await getDoc(doc(db,...path)).catch(()=>null);return s&&s.exists()?s.data():null};
  let lvs={};try{lvs=levels?await levels():{};if(!levels)(await getDocs(collection(db,"students",user.uid,"levels"))).forEach(d=>lvs[d.id]=d.data())}catch(e){}
  const [info,pg]=await Promise.all([lsInfo?lsInfo(ls):get(["ls",ls]),lsId===ls?null:get(["students",user.uid,"progress",ls])]),lv=window.elRouteOf?elRouteOf(lvs,ls):lvs[ls];   // carried over from an earlier LS
  if(info&&info.planEdits&&W.applyEdits){W.applyEdits(ls,info.planEdits);i=W.row(p);if(i<0)i=p.rows.findIndex(r=>r.from>today);if(i<0)return}   // sessions the teacher moved to another day
  const st=(info&&info.status)==="public"?"open":(info&&info.status)||"hidden";
  if(!seesAll&&st!=="open")return;
  const rs={};try{const all=results?await results():null;if(all)for(const [id,r] of Object.entries(all))rs[r.activity||id.replace("__","/")]=r;
    else (await getDocs(collection(db,"students",user.uid,"results"))).forEach(d=>rs[d.data().activity||d.id.replace("__","/")]=d.data())}catch(e){}
  const ca=!seesAll&&(!lv||!lv.level||lv.level==="beginners"),lang=ca?"ca":"en",t=(c,e)=>ca?c:e;   // Catalan: Starter, and no route yet (Base reads English since 21 Nov 2026)
  const acts=(window.EL_CATALOG||[]).filter(a=>a.ls===ls);
  // On a page of this LS the local progress is the freshest; elsewhere the synced copy.
  const prog=k=>lsId===ls?store.get(k):((pg&&pg.data)||{})[k];
  const isDone=a=>{const d=new Set();a.keys.forEach(k=>window.elDoneSet(prog(k)).forEach(s=>d.add(s)));(window.elCorrected?elCorrected(a,rs[a.id]):[]).forEach(k=>d.add(k));return window.elAllDone(a,d,rs[a.id])};   // every step, not the Submit flag
  const canDo=a=>seesAll||window.elLpOpen(a,info,group);   // learning paths the teacher has opened for the group
  const doneOf=a=>{const d=new Set();a.keys.forEach(k=>window.elDoneSet(prog(k)).forEach(s=>d.add(s)));(window.elCorrected?elCorrected(a,rs[a.id]):[]).forEach(k=>d.add(k));return d};
  const lp=window.elLpNumMap?elLpNumMap(ls,p,gi):{},num=a=>{const n=Object.keys(lp).find(k=>lp[k]===a);return n?"LP"+n+" · ":""};
  const href=(a,id)=>new URL(a.path,root).href+(id?"#"+encodeURIComponent(id):"");
  // ✅ what the teacher has opened and I haven't finished (elTodoList), and 📝 only the homework the teacher set (ELWeek.studentHw)
  const todo=()=>seesAll?[]:window.elTodoList(ls,info,group,doneOf,isDone,p,gi);
  const hws=()=>W.studentHw(p,gi,((info||{}).homework||{})[group]).map(x=>{const tg=window.elHwTargets?elHwTargets(x,ls,p,gi)||{}:{};
    const left=Object.entries(tg).flatMap(([id,ps])=>{const a=acts.find(y=>y.id===id);if(!a)return [];const d=doneOf(a),all=((window.EL_SECTIONS||{})[a.id]||[]).map(z=>z[0]).filter(k=>elSecSteps(a,k).length);
      return ((ps&&ps.length)?ps:all.length?all:[""]).filter(k=>k?!elSecSteps(a,k).every(z=>d.has(z)):!isDone(a)).map(k=>[a,k])});
    return {x,left,done:Object.keys(tg).length>0&&!left.length,href:left.length?href(left[0][0],left[0][1]):null}});
  // the homework (set by the teacher) a learning path belongs to, for its 📝 homework by … tag; no blue 🏫 "from class" tag (Roger, 20 Nov 2026: "this shouldnt appear")
  const hwOf=a=>{const xs=W.studentHw(p,gi,((info||{}).homework||{})[group]);for(const x of xs){const tg=window.elHwTargets?elHwTargets(x,ls,p,gi)||{}:{};if(tg[a.id])return x}return null};
  // 🎯 Test yourself (Roger, 9 Nov 2026: the sample exam is optional, never a to-do item): the LS's optional practice, as a link under the list
  const opt=()=>seesAll?"":acts.filter(a=>a.optional&&canDo(a)).map(a=>`<div class="sub">🎯 ${t("Posa't a prova (opcional)","Test yourself (optional)")}</div><ul><li class="it"><span class="tt">${esc(a.title)}</span><a href="${href(a)}">${t("Obre","Open")}</a></li></ul>`).join("");
  function counts(){return todo().reduce((n,x)=>n+(x.tabs.length||1),0)}   // activities (tabs), the same number as the ✅ To do tile on the board and 📋 My activities (late + opened)
  function panel(){const ex=W.exam(p,gi),n=ex?W.days(today,ex):null,td=todo(),hw=hws();
    const exam=ex&&n>=0?`<div class="ex">📝 ${t("Examen","Exam")}: ${W.date(ex,lang)}${n>1?t(` · d'aquí a ${n} dies`,` · in ${n} days`):n===1?t(" · demà"," · tomorrow"):t(" · avui"," · today")}</div>`:"";
    const hwh=hw.length?`<div class="hw"><b>📝 ${t("Deures","Homework")}</b><ul>${hw.map(h=>`<li class="${h.done?"dn":""}"><span class="tt">${esc(W.taskText(h.x,lang))}</span>${h.done?`<span class="ok">✔ ${t("Fet","Done")}</span>`:h.href?`<a href="${h.href}">${t("Obre","Open")}</a>`:""}</li>${h.x.msg?`<li><details class="hwmsg"><summary>${t("Instruccions","Instructions")}</summary><div>${esc(h.x.msg).replace(/https?:\/\/[^\s<]+/g,u=>`<a href="${u}" target="_blank" rel="noopener">${u}</a>`)}</div></details></li>`:""}`).join("")}</ul></div>`:"";
    const tdh=td.length?`<ul>${td.map(x=>{const a=x.a;return `<li class="it"><span class="tt"><b>${esc(num(a)+a.title.split(/[:(]/)[0].trim())}</b>${x.late?` <span class="lt">⏰ ${t("endarrerida","late")}</span>`:hwOf(a)?` <span class="hwt">📝 ${t("deures per al","homework by")} ${W.date(hwOf(a).date,lang)}</span>`:""}`
        +(x.cp?`<br><small>⏱ ${t(`Primer fes el ${esc(x.cp.title)}`,`First do ${esc(x.cp.title)}`)}</small>`:x.tabs.length?`<br>${x.tabs.map(([id,nm])=>`<a class="tb" href="${href(a,id)}">${esc(nm)}</a>`).join(" ")}`:"")
        +`</span>${x.cp?`<a href="${href(x.cp)}">${t("Obre","Open")}</a>`:x.tabs.length?"":`<a href="${href(a)}">${t("Obre","Open")}</a>`}</li>`}).join("")}</ul>`
      :`<p class="cl">✓ ${t("Has acabat tot el que vam fer a classe.","You have finished everything we did in class.")}</p>`;
    return `<div class="hd"><b>✅ ${t("Per fer","To do")}</b><button type="button" data-x aria-label="${t("Tanca","Close")}">✕</button></div><div class="bd">${exam}${hwh}`
      +`<div class="sub">${t("El que vam fer a classe abans d'avui i encara no has acabat:","What we did in class before today and you haven't finished:")}</div>${tdh}`
      +opt()
      +`<a class="all" href="${new URL("today.html#todo",root).href}">${t("Al meu tauler","On my board")} →</a></div>`}

  const css=document.createElement("style");css.textContent=`
#el-todo-btn{position:fixed;right:10px;bottom:56px;z-index:10001;border:0;border-radius:999px;background:#4f46e5;color:#fff;padding:8px 14px;font:600 14px system-ui,sans-serif;box-shadow:0 4px 14px #0f172a40;cursor:pointer}
#el-todo-btn .n{background:#fff;color:#4338ca;border-radius:999px;padding:0 7px;margin-left:6px}
#el-todo{position:fixed;right:10px;bottom:100px;z-index:10001;width:min(360px,calc(100vw - 20px));max-height:min(70vh,560px);display:flex;flex-direction:column;background:#fff;color:#0f172a;border:1px solid #e2e8f0;border-radius:14px;box-shadow:0 10px 30px #0f172a40;font:14px/1.35 system-ui,sans-serif;text-align:left;overflow:hidden}
#el-todo[hidden]{display:none}
#el-todo .hd{background:#4f46e5;color:#fff;padding:9px 12px;display:flex;justify-content:space-between;align-items:center;gap:8px}
#el-todo .hd button{border:0;background:none;color:#fff;font-size:16px;cursor:pointer}
#el-todo .bd{padding:8px 12px 10px;overflow:auto}
#el-todo ul{list-style:none;margin:0;padding:0}
#el-todo li{display:flex;align-items:center;gap:7px;padding:3px 0}
#el-todo .tt{flex:1}#el-todo li.dn .tt{color:#64748b}
#el-todo li a,#el-todo .la a{font-size:12px;color:#4338ca;border:1px solid #c7d2fe;border-radius:6px;padding:1px 7px;text-decoration:none;white-space:nowrap}
#el-todo .ok{color:#16a34a;font-weight:600;font-size:12px;white-space:nowrap}#el-todo .td{color:#b45309;font-weight:600;font-size:12px;white-space:nowrap}
#el-todo .lt{color:#b91c1c;font-weight:600;font-size:12px;white-space:nowrap}#el-todo .hwt{color:#0e7490;font-weight:600;font-size:12px;white-space:nowrap}#el-todo .cls{color:#4338ca;font-weight:600;font-size:12px;white-space:nowrap}#el-todo .tg{color:#64748b;font-size:12px}
#el-todo .hwmsg summary{cursor:pointer;font-size:12px}#el-todo .hwmsg div{white-space:pre-wrap;font-size:12px;overflow-wrap:anywhere}#el-todo .hw{background:#ecfeff;color:#155e75;border-radius:8px;padding:5px 8px;margin-bottom:6px;font-size:13px}#el-todo .hw .cal{display:inline-block;margin-top:4px;font-size:12px;color:#0e7490;border:1px solid #a5f3fc;border-radius:6px;padding:1px 7px;text-decoration:none}
#el-todo .ex{background:#fef3c7;border-radius:8px;padding:4px 8px;margin:2px 0 6px;font-size:13px}
#el-todo .sp{background:#e0e7ff;color:#3730a3;border-radius:8px;padding:5px 8px;margin-bottom:6px;font-size:13px}
#el-todo .la{background:#fee2e2;color:#991b1b;border-radius:8px;padding:5px 8px;margin-bottom:6px;font-size:13px}
#el-todo .dy{margin:7px 0 9px}#el-todo h4{margin:0 0 3px;font-size:12px;color:#4338ca;text-transform:uppercase;letter-spacing:.03em}
#el-todo h4 i{color:#16a34a;font-style:normal}#el-todo .dy.now{background:#f0fdf4;border-radius:8px;padding:4px 6px;margin-left:-6px;margin-right:-6px}
#el-todo .cl{color:#64748b;font-size:12px;margin:2px 0 0 25px}#el-todo .bd>.cl{margin-left:0}
#el-todo .sub{font-size:12px;color:#475569;margin:4px 0 2px}#el-todo li.it{align-items:flex-start;border-bottom:1px solid #f1f5f9;padding:5px 0}#el-todo a.tb{display:inline-block;margin:3px 3px 0 0;font-size:12px;color:#0f766e;border:1px solid #99f6e4;background:#f0fdfa;border-radius:999px;padding:1px 8px;text-decoration:none}
#el-todo .all{display:block;margin-top:8px;font-size:12px;color:#4338ca}
@media print{#el-todo,#el-todo-btn{display:none}}`;
  document.head.append(css);
  const btn=document.createElement("button"),box=document.createElement("div");
  btn.id="el-todo-btn";btn.type="button";box.id="el-todo";box.setAttribute("role","dialog");box.setAttribute("aria-label",t("Per fer","To do"));
  document.body.append(box,btn);
  const draw=()=>{const n=counts();btn.innerHTML=`✅ ${t("Per fer","To do")}${n?`<span class="n">${n}</span>`:""}`;if(!box.hidden)box.innerHTML=panel()};
  const show=o=>{box.hidden=!o;store.set("el_todo_open",o?"1":"0");draw()};
  // ✅ To do opens the same card as in class, with links (Roger, 21 Nov 2026: "maybe it's clearer than the current To do … when they press
  // the button to do"); the old panel stays only as a fallback
  btn.onclick=()=>{if(document.getElementById("el-rem"))return;if(REM){remind({links:true});return}show(box.hidden)};
  box.addEventListener("click",e=>{if(e.target.closest("[data-x]"))show(false)});
  // Closed: the button opens the card (remind) now.
  box.hidden=true;
  draw();
  // ✅ Finish your activities (Roger, 21 Nov 2026): what remind() below shows in class, from the same pieces as the list above
  REM=()=>{const db=window.EL_RAW_OPEN?null:window.elDueBefore(info,group),dr=((p._dropped||{})[gi])||[],secOf=a=>(window.EL_SECTIONS||{})[a.id]||[];
    const dueA=a=>!db||db.acts.has(a.id)||!!db.tabs[a.id],dueT=(a,id)=>!db||db.acts.has(a.id)||!!(db.tabs[a.id]&&db.tabs[a.id].has(id));
    const td=todo(),left=new Map(td.map(x=>[x.a.id,x]));
    const lps=seesAll?[]:acts.filter(a=>!a.manual&&!a.optional&&!a.checkpoint&&!dr.includes(a.id)&&canDo(a)&&dueA(a)).map(a=>{const d=doneOf(a),ss=secOf(a);let ks;
      if(ss.length){const off=window.elSecLockedFor(a,info,group,d);ks=[...new Set(ss.filter(([id])=>!off.includes(id)&&dueT(a,id)).flatMap(([id])=>elSecSteps(a,id)))]}
      else ks=((window.EL_ACTIONS||{})[a.id]||[]).filter(k=>!(a.skip||[]).includes(k));
      const all=isDone(a),n=all?ks.length:ks.filter(k=>d.has(k)).length,x=left.get(a.id);
      return {a,lab:num(a)+a.title.split(/[:(]/)[0].trim(),n,of:ks.length,pc:all||!ks.length?(all?100:0):Math.round(n/ks.length*100),x}}).filter(z=>z.of||z.x);
    // checkpoints and anything else on the list that has no bar of its own
    td.filter(x=>!lps.some(z=>z.a===x.a)).forEach(x=>lps.push({a:x.a,lab:num(x.a)+x.a.title.split(/[:(]/)[0].trim(),n:0,of:0,pc:null,x}));
    const ex=W.exam(p,gi),dn=ex?W.days(today,ex):null;
    return {ca,lps,hw:hws().filter(h=>!h.done),exam:ex&&dn>=0?{d:W.date(ex,lang),n:dn}:null,href}};
  remReady();
  // progress made on this page shows when the student comes back to the tab or reopens the list
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)draw()});
  // ⚡ the pending tasks for the Finished early? card: the list's own order (late first), then the homework not done yet
  const secName=(a,k)=>(((window.EL_SECTIONS||{})[a.id]||[]).find(z=>z[0]===k)||[])[1]||"";
  const pending=()=>{const out=[],add=(u,p,n)=>{if(!out.some(y=>y.u===u&&y.p===p))out.push({u,p,n})},t0=a=>a.title.split(/[:(]/)[0].trim(),lp=a=>num(a)+t0(a),pre=a=>num(a)||t0(a)+" · ";
    if(seesAll)return out;
    todo().forEach(x=>{if(x.cp)add(x.cp.path,"",x.cp.title);else if(x.tabs.length)x.tabs.forEach(([id,nm])=>add(x.a.path,id,pre(x.a)+nm));else add(x.a.path,"",lp(x.a))});
    hws().forEach(h=>(h.left||[]).forEach(([a,k])=>add(a.path,k,k?pre(a)+(secName(a,k)||k):lp(a))));
    return out};
  return {draw,pending};
}

// ✅ Finish your activities (Roger, 21 Nov 2026: "At the beginning of the class, after the games, I want the students to see something like
// this [the dashboard's Work done in each learning path bars]. I want to remind them that they need to do all the activities. I also want
// them to see what activities they need to do"). When the teacher's class tab ends the warm-up (el-warmup.js, live/{group}.go.rem), every
// student in class mode sees this card once (el-cloud.js cmRemind): their own work only, never anyone else's. One bar per learning path the
// group has worked on (what was done in class before today or set as homework, elDueBefore: the share of those steps done; a tab for a later
// class is never shown or counted here), the tabs still to do under it (the ✅ To do list, elTodoList), homework not done and the exam day.
// No links: in class mode the class follows the teacher; ✅ To do on every page has them. Catalan for Starter/Base. No reads of its own.
// o.race (the board, once a day: today.html vyRace): the same card when they open the website, with the race line; o.done() runs when it closes.
export async function remind(o){o=o||{};const r=await Promise.race([remP,new Promise(z=>setTimeout(z,20000))]);if(!REM||document.getElementById("el-rem"))return false;
  const D=REM(),t=(c,e)=>D.ca?c:e,col=p=>window.elPctCol?elPctCol(p):"#16a34a";
  const todo=D.lps.filter(z=>z.x).length+D.hw.length;
  const rows=D.lps.map(z=>{const x=z.x,ok=!x;
    const L=(h,txt)=>o.links&&D.href?`<a class="tb" href="${h}">${txt} →</a>`:`<span class="tb">${txt}</span>`;   // o.links: each one opens the activity
    const tabs=x?(x.cp?L(o.links&&D.href?D.href(x.cp):"",`⏱ ${t(`Primer el ${esc(x.cp.title)}`,`First ${esc(x.cp.title)}`)}`):x.tabs.length?x.tabs.map(([id,nm])=>L(o.links&&D.href?D.href(z.a,id):"",esc(nm))).join(""):L(o.links&&D.href?D.href(z.a):"",z.a.checkpoint?t("Fes-lo","Do it"):t("Tot","All of it"))):"";
    return `<li class="${ok?"ok":""}"><div class="r"><span class="n">${esc(z.lab)}</span>${z.pc==null?"<span></span><b></b>":`<span class="bar"><i style="width:${z.pc}%;background:${col(z.pc)}"></i></span><b>${z.pc} %</b>`}<small>${ok?"✔ "+t("Fet","Done"):x.late?"⏰ "+t("Endarrerida","Late"):""}</small></div>${tabs?`<div class="tbs"><span class="lb">${t("Et falta:","Still to do:")}</span>${tabs}</div>`:""}</li>`}).join("");
  const hw=D.hw.length?`<div class="hw"><b>📝 ${t("Deures","Homework")}</b>${D.hw.map(h=>`<div>${esc(ELWeek.taskText(h.x,D.ca?"ca":"en"))}${o.links&&h.href?` <a class="tb" href="${h.href}">${t("Obre","Open")} →</a>`:""}</div>`).join("")}</div>`:"";
  const exam=D.exam?`<div class="ex">📝 ${t("Examen","Exam")}: ${D.exam.d}${D.exam.n>1?t(` · d'aquí a ${D.exam.n} dies`,` · in ${D.exam.n} days`):D.exam.n===1?t(" · demà"," · tomorrow"):t(" · avui"," · today")}</div>`:"";
  // every text sets its own colour: the page's own h2/p colours (green, navy…) must never reach the purple header (Roger, 21 Nov 2026:
  // "I can't read all the letters well here": the title came out green on purple)
  const st=document.createElement("style");st.id="el-rem-css";st.textContent=`
#el-rem{position:fixed;inset:0;z-index:2147482500;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;padding:16px;font:16px/1.35 system-ui,sans-serif;color:#0f172a}
#el-rem .bx{background:#fff;border-radius:18px;box-shadow:0 20px 50px rgba(0,0,0,.35);width:min(720px,100%);max-height:calc(100vh - 32px);display:flex;flex-direction:column;overflow:hidden;text-align:left}
#el-rem .hd{background:linear-gradient(90deg,#4338ca,#7c3aed);color:#fff;padding:16px 22px}#el-rem h2{margin:0;font:800 clamp(22px,2.6vw,30px)/1.2 system-ui,sans-serif;color:#fff}#el-rem .hd p{margin:6px 0 0;font-size:15px;color:#fff}
#el-rem .n,#el-rem .r b{color:#0f172a}
#el-rem .bd{padding:12px 22px 6px;overflow:auto}#el-rem h3{margin:4px 0 6px;font:800 13px system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#64748b}
#el-rem ul{list-style:none;margin:0;padding:0}#el-rem li{padding:8px 10px;border-radius:10px}#el-rem li:nth-child(odd){background:#f8fafc}
#el-rem .r{display:grid;grid-template-columns:minmax(0,1fr) minmax(90px,200px) 58px 118px;align-items:center;gap:12px}
#el-rem .n{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#el-rem .bar{height:12px;border-radius:999px;background:#e2e8f0;overflow:hidden}#el-rem .bar i{display:block;height:100%;border-radius:999px;min-width:6px}
#el-rem .r b{text-align:right;font-size:18px}#el-rem .r small{color:#64748b;font-size:13px;white-space:nowrap}#el-rem li:not(.ok) .r small{color:#b91c1c;font-weight:600}#el-rem li.ok .r small{color:#16a34a;font-weight:600}
#el-rem .tbs{display:flex;flex-wrap:wrap;gap:5px;align-items:center;margin-top:6px}#el-rem .lb{font-size:13px;color:#b91c1c;font-weight:700;margin-right:2px}
#el-rem a.tb{text-decoration:none}#el-rem a.tb:hover{border-color:#ea580c;background:#ffedd5}
#el-rem .tb{font-size:13px;color:#7c2d12;background:#fff7ed;border:1px solid #fed7aa;border-radius:999px;padding:2px 10px}
#el-rem .hw{background:#ecfeff;color:#155e75;border-radius:10px;padding:8px 12px;margin:10px 0 4px;font-size:15px}#el-rem .ex{background:#fef3c7;border-radius:10px;padding:8px 12px;margin:10px 0 4px;font-size:15px}
#el-rem .all{background:#f0fdf4;color:#166534;border-radius:10px;padding:10px 12px;font-weight:700;margin:4px 0 8px}
#el-rem .ft{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 22px 16px;border-top:1px solid #f1f5f9}#el-rem .ft p{margin:0;color:#475569;font-size:14px}
#el-rem .ft button{border:0;border-radius:999px;background:#4338ca;color:#fff;font:800 17px system-ui,sans-serif;padding:11px 26px;cursor:pointer;white-space:nowrap}
@media (max-width:640px){#el-rem{padding:8px}#el-rem .hd,#el-rem .bd,#el-rem .ft{padding-left:14px;padding-right:14px}#el-rem .r{grid-template-columns:minmax(0,1fr) 52px;gap:4px 10px}#el-rem .bar{grid-column:1/-1;grid-row:2}#el-rem .r small{grid-column:1/-1}#el-rem .ft{flex-direction:column;align-items:stretch}}
@media print{#el-rem{display:none}}`;
  if(!document.getElementById("el-rem-css"))document.head.append(st);
  const el=document.createElement("div");el.id="el-rem";el.className="notranslate";el.translate=false;
  el.innerHTML=`<div class="bx" role="dialog" aria-modal="true" aria-labelledby="el-rem-h"><div class="hd"><h2 id="el-rem-h">✅ ${todo?t("Acaba totes les activitats!","Finish all your activities!"):t("Ho tens tot fet!","You're up to date!")}</h2>
    <p>${todo?(o.race?t("Per guanyar la cursa, acaba-les totes: cada activitat que acabes et fa avançar. ","To win the race, finish them all: every activity you finish moves you forward. "):"")+t("Totes les activitats compten. Aquí tens el que vam fer a classe i el que encara et falta.","Every activity counts. Here is what we have done in class and what you still have to do."):t("Has fet totes les activitats que hem fet a classe. Molt bé!","You have done every activity we did in class. Well done!")}</p></div>
    <div class="bd">${D.lps.length?`<h3>${t("La meva feina a cada learning path","My work in each learning path")}</h3><ul>${rows}</ul>`:""}${hw}${exam}</div>
    <div class="ft"><p>${todo?(o.links?t("Clica una activitat per anar-hi. ","Click an activity to go there. "):"")+t("Acaba-les a casa o a classe quan acabis abans.","Finish them at home, or in class when you finish early."):t("Continua així!","Keep it up!")}</p><button type="button" data-x>👍 ${t("D'acord","OK")}</button></div></div>`;
  const shut=()=>{if(!el.isConnected)return;el.remove();clearTimeout(tm);if(o.done)try{o.done()}catch(e){}},tm=setTimeout(shut,5*60e3);   // gone after 5 minutes if nobody presses OK
  el.addEventListener("click",e=>{if(e.target.closest("[data-x]")||e.target===el)shut()});
  document.body.append(el);el.querySelector("[data-x]").focus();return true}
