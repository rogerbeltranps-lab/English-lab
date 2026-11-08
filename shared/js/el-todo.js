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

export async function start({db,user,group,root,lsId,seesAll,results,levels,lsInfo}){
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
  const ca=!seesAll&&(!lv||!lv.level||lv.level==="insecure"||lv.level==="beginners"),lang=ca?"ca":"en",t=(c,e)=>ca?c:e;   // no route yet: the Insecure version, in Catalan
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
    return {x,done:Object.keys(tg).length>0&&!left.length,href:left.length?href(left[0][0],left[0][1]):null}});
  function counts(){return todo().length}   // the same number as the ✅ To do tile on the board
  function panel(){const ex=W.exam(p,gi),n=ex?W.days(today,ex):null,td=todo(),hw=hws();
    const exam=ex&&n>=0?`<div class="ex">📝 ${t("Examen","Exam")}: ${W.date(ex,lang)}${n>1?t(` · d'aquí a ${n} dies`,` · in ${n} days`):n===1?t(" · demà"," · tomorrow"):t(" · avui"," · today")}</div>`:"";
    const hwh=hw.length?`<div class="hw"><b>📝 ${t("Deures","Homework")}</b><ul>${hw.map(h=>`<li class="${h.done?"dn":""}"><span class="tt">${esc(W.taskText(h.x,lang))}</span>${h.done?`<span class="ok">✔ ${t("Fet","Done")}</span>`:h.href?`<a href="${h.href}">${t("Obre","Open")}</a>`:""}</li>${h.x.msg?`<li><details class="hwmsg"><summary>${t("Instruccions","Instructions")}</summary><div>${esc(h.x.msg).replace(/https?:\/\/[^\s<]+/g,u=>`<a href="${u}" target="_blank" rel="noopener">${u}</a>`)}</div></details></li>`:""}`).join("")}</ul></div>`:"";
    const tdh=td.length?`<ul>${td.map(x=>{const a=x.a;return `<li class="it"><span class="tt"><b>${esc(num(a)+a.title.split(/[:(]/)[0].trim())}</b>`
        +(x.cp?`<br><small>⏱ ${t(`Primer fes el ${esc(x.cp.title)}`,`First do ${esc(x.cp.title)}`)}</small>`:x.tabs.length?`<br>${x.tabs.map(([id,nm])=>`<a class="tb" href="${href(a,id)}">${esc(nm)}</a>`).join(" ")}`:"")
        +`</span>${x.cp?`<a href="${href(x.cp)}">${t("Obre","Open")}</a>`:x.tabs.length?"":`<a href="${href(a)}">${t("Obre","Open")}</a>`}</li>`}).join("")}</ul>`
      :`<p class="cl">✓ ${t("Has acabat tot el que el professor ha obert.","You have finished everything your teacher has opened.")}</p>`;
    return `<div class="hd"><b>✅ ${t("Per fer","To do")}</b><button type="button" data-x aria-label="${t("Tanca","Close")}">✕</button></div><div class="bd">${exam}${hwh}`
      +`<div class="sub">${t("El que el professor ha obert i encara no has acabat:","What your teacher has opened and you haven't finished:")}</div>${tdh}`
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
#el-todo .lt{color:#b91c1c;font-weight:600;font-size:12px;white-space:nowrap}#el-todo .tg{color:#64748b;font-size:12px}
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
  btn.onclick=()=>show(box.hidden);
  box.addEventListener("click",e=>{if(e.target.closest("[data-x]"))show(false)});
  // Closed unless the student left it open (no more "once a week": there is no week plan for students, Roger 6 Nov 2026).
  box.hidden=store.get("el_todo_open")!=="1";
  draw();
  // progress made on this page shows when the student comes back to the tab or reopens the list
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)draw()});
  return {draw};
}
