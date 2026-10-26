// Floating weekly to-do list (Roger, 25 Oct 2026): a "📋 My week" button on every page a signed-in student opens
// (board, course page, LS pages, activities, English Lab). It opens this week's class days of the student's group,
// from the teaching plan in el-plan.js (through el-week.js): per day, the activities worked on or due that day
// (✔ Done / To do / Late, with Open), what else happens in class, the exam day and late work from earlier weeks.
// Optional activities (`optional` in el-plan.js, same shape as `due`) show as homework and are never late (students are not told
// they are optional or how they count: Roger, 26 Oct 2026; checkpoints open the next Learning Path anyway).
// Loaded by el-cloud.js for students and testers: start({db,user,group,root,lsId,seesAll}). Catalan for Insecure.
import {doc,getDoc,collection,getDocs} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const load=src=>new Promise(r=>{const s=document.createElement("script");s.src=src;s.onload=r;s.onerror=r;document.head.append(s)});
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
const store={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{Storage.prototype.setItem.call(localStorage,k,v)}catch(e){}}};
const DAY={en:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],ca:["Diumenge","Dilluns","Dimarts","Dimecres","Dijous","Divendres","Dissabte"]};
const WD=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
// "Getting started: Castanyada & Halloween (warm-up)" → "getting started"
const short=t=>String(t).split(/[:(]/)[0].trim().toLowerCase();

export async function start({db,user,group,root,lsId,seesAll}){
  if(!group)return;
  if(!window.EL_PLAN)await load(new URL("shared/js/el-plan.js",root).href);
  if(!window.ELWeek)await load(new URL("shared/js/el-week.js",root).href);
  const W=window.ELWeek,x=W&&W.now(group);if(!x)return;
  const {ls,p,gi}=x,today=W.today();
  let i=W.row(p);if(i<0)i=p.rows.findIndex(r=>r.from>today);
  if(i<0)return;   // the plan is over
  const get=async path=>{const s=await getDoc(doc(db,...path)).catch(()=>null);return s&&s.exists()?s.data():null};
  const [info,lv,pg]=await Promise.all([get(["ls",ls]),get(["students",user.uid,"levels",ls]),get(["students",user.uid,"progress",ls])]);
  const st=(info&&info.status)==="public"?"open":(info&&info.status)||"hidden";
  if(!seesAll&&st!=="open")return;
  const rs={};try{(await getDocs(collection(db,"students",user.uid,"results"))).forEach(d=>rs[d.data().activity||d.id.replace("__","/")]=d.data())}catch(e){}
  const ca=!seesAll&&lv&&(lv.level==="insecure"||lv.level==="beginners"),lang=ca?"ca":"en",t=(c,e)=>ca?c:e;
  const acts=(window.EL_CATALOG||[]).filter(a=>a.ls===ls);
  // On a page of this LS the local progress is the freshest; elsewhere the synced copy.
  const prog=k=>lsId===ls?store.get(k):((pg&&pg.data)||{})[k];
  const isDone=a=>{const r=rs[a.id]||{};if(r.locked||r.markedDone)return true;
    const d=new Set();a.keys.forEach(k=>window.elDoneSet(prog(k)).forEach(s=>d.add(s)));
    const req=((window.EL_ACTIONS||{})[a.id]||[]).filter(k=>!(a.skip||[]).includes(k));return req.length>0&&req.every(k=>d.has(k))};
  const canDo=a=>seesAll||window.elLpOpen(a,info,group);   // learning paths the teacher has opened for the group
  const opt=id=>p.optional&&p.optional[id]&&p.optional[id][gi]||null;
  // "LP3" in a session line → the activity named next to it somewhere in the plan ("LP3 Where traditions come from")
  const lp={};p.rows.forEach(r=>(r.g?r.g[gi]||"":r.what||"").replace(/LP(\d+) ([A-Z][^(\n·]*)/g,(m,n,name)=>{const a=acts.find(a=>short(a.title).startsWith(name.trim().toLowerCase())||name.trim().toLowerCase().startsWith(short(a.title)));if(a)lp[n]=a}));
  const mentions=seg=>{const s=seg.toLowerCase(),out=acts.filter(a=>s.includes(short(a.title)));const n=seg.match(/\bLP(\d+)\b/);if(n&&lp[n[1]]&&!out.includes(lp[n[1]]))out.push(lp[n[1]]);return out};

  function week(){
    const r=p.rows[i],end=W.add(r.from,6),days={},extra=[];
    const dayOf=d=>days[d]||(days[d]={items:[],cls:[]});
    (r.g?r.g[gi]||"":r.what||"").split("\n").filter(Boolean).forEach(line=>{
      const m=line.match(/^(Sun|Mon|Tue|Wed|Thu|Fri|Sat) \d+ · (.*)$/);
      if(!m){extra.push(line);return}
      const d=W.add(r.from,(WD.indexOf(m[1])+6)%7),dd=dayOf(d);
      m[2].split(" · ").forEach(seg=>{const as=mentions(seg);
        if(!as.length){dd.cls.push(seg);return}
        as.forEach(a=>{if(!dd.items.some(it=>it.a===a))dd.items.push({a,part:(seg.match(/\((\d\/\d)\)/)||[])[1]||""})})})});
    // activities due (or optional) this week land on their day even if the line does not name them
    acts.forEach(a=>{const due=W.due(p,a.id,gi),o=opt(a.id);[[due,false],[o,true]].forEach(([d,optional])=>{if(!d||d<r.from||d>end)return;
      const dd=dayOf(d),it=dd.items.find(it=>it.a===a);if(it)it.optional=optional;else dd.items.push({a,optional,part:""})})});
    Object.values(days).forEach(dd=>dd.items.forEach(it=>it.due=W.due(p,it.a.id,gi)));
    return {r,days,extra};
  }
  const lateOnes=from=>acts.filter(a=>{const d=W.due(p,a.id,gi);return d&&d<from&&d<today&&!a.manual&&canDo(a)&&!isDone(a)});

  function status(it,d){const a=it.a;
    if(a.manual)return `<span class="tg">${t("al Classroom","on Classroom")}</span>`;
    if(isDone(a))return `<span class="ok">✔ ${t("Fet","Done")}</span>`;
    if(!canDo(a))return `<span class="tg">${t("el professor l'obrirà","your teacher will open it")}</span>`;
    if(it.optional)return `<span class="tg">${t("deures","homework")}</span>`;
    if(it.due&&it.due<today)return `<span class="lt">${t("Endarrerida","Late")}</span>`;
    return it.part&&it.due!==d?"":`<span class="td">${t("Per fer","To do")}</span>`}
  const href=a=>new URL(a.path,root).href;
  const item=(it,d)=>{const a=it.a,done=!a.manual&&isDone(a);
    return `<li class="${done?"dn":""}"><span class="ck">${done?"✅":"⬜"}</span><span class="tt">${esc(a.title.split(/[:(]/)[0].trim())}${it.part?` <small>(${it.part})</small>`:""}</span>${status(it,d)}${done||!canDo(a)?"":`<a href="${href(a)}">${t("Obre","Open")}</a>`}</li>`};

  function counts(){const {days}=week(),from=p.rows[i].from;let n=lateOnes(from).length;
    Object.entries(days).forEach(([d,dd])=>dd.items.forEach(it=>{if(it.due===d&&!it.optional&&!it.a.manual&&canDo(it.a)&&!isDone(it.a))n++}));return n}

  function panel(){const {r,days,extra}=week(),late=lateOnes(r.from),ex=W.exam(p,gi),n=ex?W.days(today,ex):null;
    const exam=ex&&n>=0?`<div class="ex">📝 ${t("Examen","Exam")}: ${W.date(ex,lang)}${n>1?t(` · d'aquí a ${n} dies`,` · in ${n} days`):n===1?t(" · demà"," · tomorrow"):t(" · avui"," · today")}</div>`:"";
    const lt=late.length?`<div class="la"><b>⏰ ${t("Endarrerides","Late")}</b><ul>${late.map(a=>`<li><span class="tt">${esc(a.title.split(/[:(]/)[0].trim())} <small>· ${W.date(W.due(p,a.id,gi),lang)}</small></span><a href="${href(a)}">${t("Fes-la","Do it")}</a></li>`).join("")}</ul></div>`:"";
    const ds=Object.keys(days).sort().map(d=>{const dd=days[d],dt=new Date(d+"T12:00");
      return `<div class="dy ${d===today?"now":""}"><h4>${DAY[lang][dt.getDay()]} ${dt.getDate()}${d===today?` <i>· ${t("avui","today")}</i>`:""}</h4>`
        +(dd.items.length?`<ul>${dd.items.map(it=>item(it,d)).join("")}</ul>`:"")
        +(dd.cls.length?`<div class="cl">${t("A classe:","In class:")} ${esc(dd.cls.join(" · "))}</div>`:"")+`</div>`}).join("");
    const head=i===W.row(p)?t("La meva setmana","My week"):i===0?t("Comencem","We start"):t("Propera setmana","Next week");
    return `<div class="hd"><b>📋 ${head} · ${W.week(r,lang)}</b><button type="button" data-x aria-label="${t("Tanca","Close")}">✕</button></div><div class="bd">${exam}${lt}${ds||`<p class="cl">${t("Aquesta setmana no hi ha classes previstes.","No classes planned this week.")}</p>`}`
      +extra.map(e=>`<div class="cl">${esc(W.line(e,lang))}</div>`).join("")+(r.note?`<div class="cl">ℹ️ ${esc(r.note)}</div>`:"")
      +`<a class="all" href="${new URL("today.html",root).href}">${t("Tot el pla al meu tauler","The whole plan on my board")} →</a></div>`}

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
#el-todo .ex{background:#fef3c7;border-radius:8px;padding:4px 8px;margin:2px 0 6px;font-size:13px}
#el-todo .la{background:#fee2e2;color:#991b1b;border-radius:8px;padding:5px 8px;margin-bottom:6px;font-size:13px}
#el-todo .dy{margin:7px 0 9px}#el-todo h4{margin:0 0 3px;font-size:12px;color:#4338ca;text-transform:uppercase;letter-spacing:.03em}
#el-todo h4 i{color:#16a34a;font-style:normal}#el-todo .dy.now{background:#f0fdf4;border-radius:8px;padding:4px 6px;margin-left:-6px;margin-right:-6px}
#el-todo .cl{color:#64748b;font-size:12px;margin:2px 0 0 25px}#el-todo .bd>.cl{margin-left:0}
#el-todo .all{display:block;margin-top:8px;font-size:12px;color:#4338ca}
@media print{#el-todo,#el-todo-btn{display:none}}`;
  document.head.append(css);
  const btn=document.createElement("button"),box=document.createElement("div");
  btn.id="el-todo-btn";btn.type="button";box.id="el-todo";box.setAttribute("role","dialog");box.setAttribute("aria-label",t("La meva setmana","My week"));
  document.body.append(box,btn);
  const draw=()=>{const n=counts();btn.innerHTML=`📋 ${t("La meva setmana","My week")}${n?`<span class="n">${n} ${t("per fer","to do")}</span>`:""}`;if(!box.hidden)box.innerHTML=panel()};
  const show=o=>{box.hidden=!o;store.set("el_todo_open",o?"1":"0");draw()};
  btn.onclick=()=>show(box.hidden);
  box.addEventListener("click",e=>{if(e.target.closest("[data-x]"))show(false)});
  // Closed unless the student left it open; it opens by itself once at the start of each new week.
  const wk=p.rows[i].from,seen=store.get("el_todo_week")===wk;store.set("el_todo_week",wk);
  box.hidden=seen?store.get("el_todo_open")!=="1":false;
  draw();
  // progress made on this page shows when the student comes back to the tab or reopens the list
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)draw()});
  return {draw};
}
