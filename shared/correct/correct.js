// ✅ Correct together: draws the slides of shared/correct/correct-core.js (see index.html). Teacher only.
import {initializeApp,getApps} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getFirestore,collection,query,where,getDocs,doc,getDoc,setDoc} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {CONFIG,TEACHERS} from "../js/el-firebase.js";

const X=window.ELCorrect,{NAME,esc}=X,$=id=>document.getElementById(id);
const P=new URLSearchParams(location.search),LS=P.get("ls")||"",LPF=P.get("lp")||"",TAB=P.get("tab")||"read",G=P.get("g")||"",EMBED=P.get("embed")==="1";
const course=(LS.match(/^\d+eso/)||[""])[0],ROUTES=["beginners","insecure","safe","daring"];
const base="../../"+LS+"/";
const load=src=>new Promise((ok,no)=>{const s=document.createElement("script");s.src=src;s.onload=ok;s.onerror=no;document.head.append(s)});
const tx=o=>o==null?"":typeof o==="string"?o:(o.en||o.ca||"");

let slides=[],at=0,shown=new Set(),LP=null,CLASS=null,CTX=null;   // CLASS: {n students, by: {panel|qid|route: [values]}}
/* 📖 Read together, then ⏱ Your turn (Roger, 12 Nov 2026: "can we read together instead of everyone having a different text, and then
   leave time for each one to do their level"): before the questions, one level's version of the text on the projector, a paragraph at a
   time (all the levels have the same text, longer as the level goes up), then a countdown while each student answers their own level's
   questions on the Chromebook, with their own text there. RL: the version read together (kept per course in this browser). */
const RL_K="el_rt_level_"+course;let RL="insecure",RP=-1;try{const v=localStorage.getItem(RL_K);if(ROUTES.includes(v))RL=v}catch(e){}
const TM={len:600,left:600,on:false,iv:null};
/* 📘 Grammar together (Roger, 12 Nov 2026: "I need the same we did with the reading but with the grammar section. Start with the grammar
   of the LP3, LS2"): tab=grammar on a page listed in EL_CORRECT_GRAMMAR (el-catalog.js). The same three parts as the reading:
   📘 How it works together (the step's explanation boxes on the projector, one at a time, every Chromebook showing the same boxes and
   following the yellow one), ⏱ Your turn (each student does their own level's exercise, with the boxes of their level that were not
   seen together in green), then the sentences one by one: the answer in its gap, the levels that have it with their own number, the
   rule, and what the class wrote. GV: the boxes shown together, "all" (every level's, each with its level) or one level's. */
const GRAM=TAB==="grammar",GV_K="el_gx_view_"+course;let GV="all";try{const v=localStorage.getItem(GV_K);if(v==="all"||ROUTES.includes(v))GV=v}catch(e){}
let PRO_ON=false;

async function build(){
  if(!/^[24]eso\/[a-z0-9-]+$/.test(LS)||!/^[a-z0-9-]+$/.test(LPF))throw new Error("Which reading? The link has no learning path.");
  await load(base+"data/"+LPF+".js");LP=window.LP;
  if(GRAM)return buildGrammar();
  const chat=typeof readingChat!=="undefined"?readingChat:null;   // 4 ESO Getting started: the reading is a chat (data/getting-started.js)
  const notes=(window.EL_CORRECT||{})[LS+"/"+LPF]||{};
  const read=LP.panels.find(p=>p.id==="read"),log=LP.panels.find(p=>p.id==="log");
  const ctx={LP,key:LS+"/"+LPF,routes:ROUTES,chat,notes,textPanel:read};
  const panels=[read,log].filter(p=>p&&(p.items||p.fields));
  panels.forEach(p=>{slides=slides.concat(X.slidesFor(ctx,p,false))});
  CTX=ctx;if(read&&read.media&&read.media.text&&read.items)slides.unshift({kind:"readall",panel:"read"},{kind:"turn",panel:"read"});
  // Pro (4 ESO): its own essay and questions, last; only when the group has a Pro student (or no group is given)
  if(course==="4eso"){
    try{await load(base+"data/native/"+LPF+".js")}catch(e){}
    let N=LP.native;
    if(!N&&window.GS_NATIVE)N={read:Object.assign({},read,{media:{text:GS_NATIVE.readingHtml},items:GS_NATIVE.readingQs})};
    if(N&&N.read&&N.read.items){const pr=Object.assign({},N.read,{id:"read"});
      slides.pro=X.slidesFor({LP,key:ctx.key,routes:["native"],chat:null,notes,textPanel:pr},pr,true).filter(s=>s.kind!=="log")}}
}

async function buildGrammar(){
  const g=LP.panels.find(p=>p.id==="grammar");
  if(!g||!Array.isArray(g.items))throw new Error("This learning path has no grammar step to correct together.");
  CTX={LP,key:LS+"/"+LPF,routes:ROUTES,chat:null,notes:{},textPanel:g};
  slides=[{kind:"explain",panel:"grammar"},{kind:"turn",panel:"grammar"}].concat(X.slidesFor(CTX,g,false).map(s=>Object.assign(s,{gram:true})));
  // Pro (4 ESO): its own grammar (data/native/<lp>.js), last; only when the group has a Pro student (or no group is given)
  if(course==="4eso"){try{await load(base+"data/native/"+LPF+".js")}catch(e){}
    const N=LP.native&&LP.native.grammar;
    if(N&&Array.isArray(N.items)){const pr=Object.assign({},N,{id:"grammar"});slides.pro=X.slidesFor({LP,key:CTX.key,routes:["native"],chat:null,notes:{},textPanel:pr},pr,true).map(s=>Object.assign(s,{gram:true}))}}
}
// the boxes on the projector for the view GV, Pro's last (only in "all", when the group has a Pro student)
function gBoxes(){
  const g=LP.panels.find(p=>p.id==="grammar"),all=X.boxesFor(g.explain,ROUTES).map(b=>Object.assign(b,{lab:X.boxLabel(b,ROUTES)}));
  let out=GV==="all"?all:all.filter(b=>b.on.includes(GV));
  const N=LP.native&&LP.native.grammar;
  if(GV==="all"&&PRO_ON&&N&&N.explain)out=out.concat(X.boxesFor(N.explain,["native"]).map(b=>Object.assign(b,{lab:"Pro",pro:true})));
  return out;
}
const lvCls=b=>b.pro?"pro":b.all?"all":"on";
function explainAll(){
  const B=gBoxes(),g=LP.panels.find(p=>p.id==="grammar");
  return `<div class="chips"><span class="chip all">📘 How it works · together</span>`+
    ["all"].concat(ROUTES).map(v=>`<button class="chip lvb ${v===GV?"on":""}" data-gv="${v}" title="${v==="all"?"Every level's boxes, each with its level":"Only the "+NAME[v]+" boxes"}">${v==="all"?"All levels":NAME[v]}</button>`).join("")+`</div>`+
    `<h1 class="gt">${esc(tx(g.title))}</h1>`+
    `<div class="gxs ${RP>=0?"focus":""}">`+B.map((b,i)=>`<div class="gx ${i===RP?"now":""}" data-rp="${i}"><span class="chip ${lvCls(b)}">${b.all?"👥 ":""}${esc(b.lab)}</span><div class="en">${b.en}</div>${b.ca&&X.norm(b.ca)!==X.norm(b.en)?`<div class="cax">${b.ca}</div>`:""}</div>`).join("")+`</div>`+
    `<p class="hint">${GV==="all"?"Every level's explanation, each box with the levels that have it.":"The "+NAME[GV]+" explanation."}${G?" Every Chromebook shows these same boxes now (Base and Starter in Catalan where there is a translation) and follows the yellow one; their own level's boxes come back for ⏱ Your turn"+(GV==="all"?".":", with the ones not seen together in green.")+" Space, → or a click: next box.":""}</p>`;
}
// what the students' "How it works" box shows while explaining together (el-cloud.js rtFollow, rt.p): the same boxes, English (h) and
// Catalan where the box has it (hc, for Base and Starter), each with its level
function gHtml(B,ca){const lab=b=>ca?b.lab.replace("Everyone","Tothom").replace(" only"," només"):b.lab;
  return `<h3>📘 ${ca?"Com funciona · junts":"How it works · together"}</h3>`+B.map(b=>`<div class="model"><span style="display:inline-block;font:800 12px system-ui,sans-serif;padding:1px 8px;border-radius:999px;margin-right:6px;background:${b.all?"#e3f4ea":b.pro?"#f3e8ff":"#dfe9ff"};color:${b.all?"#1f6b40":b.pro?"#6b21a8":"#2b4fa8"}">${esc(lab(b))}</span>${ca&&b.ca?b.ca:b.en}</div>`).join("")}
const textOf=h=>{const d=document.createElement("div");d.innerHTML=h||"";return d.textContent};
function gSend(){
  const s=slides[at],on=s&&s.kind==="explain",ei=slides.findIndex(x=>x.kind==="explain"),after=s&&ei>=0&&at>ei,u=LS+"/"+LPF+".html";
  let v=null,key="";
  if(on){const B=gBoxes();v={u,p:"grammar",k:RP<B.length?RP:-1,n:B.length,l:GV,h:gHtml(B,false),hc:gHtml(B,true),at:Date.now()};key=u+"|g|"+v.k+"|"+v.n+"|"+GV}
  else if(after){const B=gBoxes(),hs=[...new Set(B.flatMap(b=>[X.norm(textOf(b.en)),b.ca?X.norm(textOf(b.ca)):""]).filter(Boolean))];
    v={u,p:"grammar",k:-1,x:1,l:GV,hs,at:Date.now()};key=u+"|gx|"+GV+"|"+hs.length}
  if(key===rtLast)return Promise.resolve();rtLast=key;
  return setDoc(doc(getFirestore(getApps()[0]),"live",G),{rt:v},{merge:true}).catch(e=>console.warn("grammar together",e));
}
// one gap-fill sentence: the sentence (its gaps filled when shown), the answer, the levels that have it with their number, the rule
function gram(s,open){
  const it=itemOf(s.panel,s.qid,s.pro),t=open?tally(s.panel,s.qid,s.on,it):null,why=it.en||it.ca||"",whyCa=it.ca&&it.en&&it.ca!==it.en?it.ca:"";
  const only=s.all||s.pro?"":`<p class="hint">${s.routes.filter(r=>!s.on.includes(r)).map(r=>NAME[r]).join(" and ")}: this sentence is not in your exercise. Listen and think of the answer.</p>`;
  return classBox(t)+`<div class="chips">${chipsFor(s)}</div><h1 class="gq">${X.fill(s.q,s.ans,open)}</h1>`+
    (open?`<div class="ans">✓ ${esc(s.ans)}</div>${s.alt.length?`<div class="alt">Also right: ${s.alt.map(esc).join(" · ")}</div>`:""}`+
      (why?`<p class="why">💡 ${esc(why)}${whyCa?`<span class="cax"> · ${esc(whyCa)}</span>`:""}</p>`:"")
     :`<div class="ans hid">? &nbsp;Think, then say your answer</div>`)+only;
}
/* ---------- the students' answers (one read per student: their progress for this LS) ---------- */
/* 📊 Who did it and how (Roger, 13 Nov 2026: "I want to see who's done the activities during the grammar … their % of good answers and who
   did it, I need to see the statistic right away but also somewhere else to assess my performance"): on ⏱ Your turn, every student of the
   group with what they did (✅ checked: right on their first check and %, ✏ working: answers typed but not checked yet, — not started) and
   the class %, read again every 30 s while that slide is on screen (one read per student; the group's list is read once). From ⏱ Your turn
   on, each read is also saved in classResults/{group}_{ls}_{lp}_{tab}_{day} (teacher only), which the dashboard shows in 📊 Class results. */
const PID=GRAM?"grammar":"read";
let ST=null,CLASS_AT=0,STARTED=0,savedSig="";
const norm=s=>String(s==null?"":s).toLowerCase().replace(/[’‘`]/g,"'").replace(/[“”"]/g,"").replace(/[.,!?;:]/g,"").replace(/\s+/g," ").trim();
const ymd=d=>{const x=new Date(d);return x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0")};
// the step's questions on a level (Pro: data/native/<lp>.js)
function stepAt(L){const p=L==="native"?(LP.native||{})[PID]:LP.panels.find(x=>x.id===PID);return p&&p.items?{p,items:X.forLevel(p.items,L||"insecure")}:{p:null,items:[]}}
function rowOf(s,state,L){
  const f=state&&state.tries&&state.tries[PID],l=state&&state.last&&state.last[PID],lev=L||(f&&f.level)||"";
  const ty=state&&state.typing&&state.typing[PID+"_"+lev],it=f&&state.items&&state.items[PID+"_"+f.level];
  return {e:s.email,n:s.name,l:lev,ok:f?f.score:null,max:f?f.max:null,at:f?f.date:null,lok:l?l.score:null,lmax:l?l.max:null,lat:l?l.date:null,
    typed:Array.isArray(ty)?ty.filter(v=>v!=null&&v!=="").length:0,of:stepAt(lev).items.length,fl:f?f.level:null,qi:it?it.q:null,qok:it?it.ok:null};
}
async function classAnswers(){
  if(!G)return null;
  const app=getApps()[0]||initializeApp(CONFIG),db=getFirestore(app),lsId=LS.replace("/","-");
  if(!ST){const st=await getDocs(query(collection(db,"students"),where("group","==",G)));
    ST=st.docs.map(d=>({id:d.id,name:d.data().name||"",email:String(d.data().email||"").toLowerCase()})).filter(s=>!TEACHERS.includes(s.email))}
  const by={},lv={},rows=[];let n=0,done=0;
  await Promise.all(ST.map(async s=>{
    const p=await getDoc(doc(db,"students",s.id,"progress",lsId)).catch(()=>null);
    const d=p&&p.exists()?(p.data().data||{}):{};let state=null;try{state=JSON.parse(d[LP.key]||"null")}catch(e){}
    const L=d[LP.key+"Level"]||null;if(L)lv[L]=(lv[L]||0)+1;
    rows.push(rowOf(s,state,L));
    if(!state||!state.ans)return;n++;if(state.ans[PID])done++;
    Object.entries(state.ans).forEach(([pid,a])=>{if(!a||!Array.isArray(a.v)||!Array.isArray(a.q))return;
      a.q.forEach((q,i)=>{const v=a.v[i];if(v==null||v==="")return;const k=pid+"|"+q+"|"+(a.l||"");(by[k]=by[k]||[]).push(v)})});
  }));
  CLASS_AT=Date.now();
  return {n,by,lv,done,students:ST.length,rows};
}
const pctOf=r=>r.ok!=null&&r.max?Math.round(100*r.ok/r.max):null;
// the class in numbers: checked / working / not started, the class % (each student counts the same) and the students who checked today
function sumUp(rows){const today=ymd(Date.now()),ck=rows.filter(r=>r.ok!=null&&r.max),wk=rows.filter(r=>r.ok==null&&r.typed),ps=ck.map(pctOf);
  return {n:rows.length,done:ck.length,work:wk.length,none:rows.length-ck.length-wk.length,today:ck.filter(r=>r.at&&ymd(r.at)===today).length,
    pct:ps.length?Math.round(ps.reduce((a,b)=>a+b,0)/ps.length):null}}
// right / tried for each sentence on the students' first check (state.items), hardest first
function perQuestion(rows){const m={};
  rows.forEach(r=>{if(!r.qi||!r.qok)return;const p=stepAt(r.fl).p;if(!p)return;
    r.qi.forEach((j,i)=>{const it=Array.isArray(p.items)?p.items[j]:null;if(!it)return;const t=tx(it.q),k=(r.fl==="native"?"P|":"")+t;
      const x=m[k]=m[k]||{t,ok:0,n:0,pro:r.fl==="native"};x.n++;if(r.qok[i])x.ok++})});
  return Object.values(m).sort((a,b)=>a.ok/a.n-b.ok/b.n)}
const shortN=r=>{const w=String(r.n||r.e.split("@")[0]).trim().split(/\s+/);return w[0]+(w[1]?" "+w[1][0]+".":"")};
const hm=d=>{const x=new Date(d);return String(x.getHours()).padStart(2,"0")+":"+String(x.getMinutes()).padStart(2,"0")};
const NM_K="el_cx_names";let NM=true;try{NM=localStorage.getItem(NM_K)!=="0"}catch(e){}
function resBox(){
  if(!G)return "";
  if(!CLASS)return `<p class="done"><button class="sm" data-k="who">🔄 Who has done it?</button></p>`;
  const R=CLASS.rows||[],S=sumUp(R),what=GRAM?"grammar":"reading";
  const chip=r=>{const p=pctOf(r),c=p==null?(r.typed?"w":"n"):p>=80?"g":p>=50?"a":"r",earlier=r.at&&ymd(r.at)!==ymd(Date.now());
    return `<span class="rc ${c}" title="${esc(r.n||r.e)} · ${X.NAME[r.l]||""}${r.at?" · first check "+(earlier?ymd(r.at):hm(r.at)):""}${r.lat&&r.lat!==r.at?" · latest "+r.lok+"/"+r.lmax:""}">`+
      `${NM?esc(shortN(r))+" ":""}${p!=null?`<b>${p}%</b><small>${r.ok}/${r.max}${earlier?" · before":""}</small>`:r.typed?`<b>✏</b><small>${r.typed}/${r.of}</small>`:`<b>—</b>`}</span>`};
  const ord=(a,b)=>shortN(a).localeCompare(shortN(b)),ck=R.filter(r=>pctOf(r)!=null).sort(ord),wk=R.filter(r=>pctOf(r)==null&&r.typed).sort(ord),no=R.filter(r=>pctOf(r)==null&&!r.typed).sort(ord);
  return `<div class="res" id="res"><div class="rsum"><span class="big2">${S.pct==null?"–":S.pct+" %"}</span><span>right on their first check of the ${what}</span>`+
    `<span class="rn"><b>✅ ${S.done}</b> checked${S.done&&S.today<S.done?` (${S.done-S.today} before today)`:""} · <b>✏ ${S.work}</b> working · <b>— ${S.none}</b> not started</span></div>`+
    `<div class="rgrid">${ck.concat(wk,no).map(chip).join("")}</div>`+
    `<p class="rfoot"><button class="sm" data-k="who">🔄 Update</button><button class="sm" data-k="names">${NM?"🙈 Hide names":"👁 Show names"}</button>`+
    `<span>Updated ${hm(CLASS_AT)}${slides[at]&&slides[at].kind==="turn"?" · again every 30 s":""}${STARTED||slides[at]&&slides[at].kind==="turn"?" · saved in the dashboard, 📊 Class results":""}</span></p></div>`;
}
// the box alone (a refresh while the slide is on screen keeps the timer and the scroll)
function resDraw(){const b=$("res");if(b)b.outerHTML=resBox();else if(slides[at]&&slides[at].kind==="turn")draw()}
let refreshing=null;
function refresh(){if(!G||refreshing)return refreshing||Promise.resolve();
  refreshing=classAnswers().then(c=>{CLASS=c;resSave()}).catch(e=>console.warn("class answers",e)).finally(()=>{refreshing=null});return refreshing}
// every 30 s while ⏱ Your turn is on screen (and the tab is seen); one read once more when the sentences start
let poll=null,wasTurn=false;
function livePoll(){const on=!!G&&!!slides[at]&&slides[at].kind==="turn";
  if(on&&!STARTED){STARTED=Date.now();resSave()}
  if(on&&!poll)poll=setInterval(()=>{if(document.visibilityState==="visible")refresh().then(resDraw)},30000);
  if(!on&&poll){clearInterval(poll);poll=null}
  if(wasTurn&&!on&&Date.now()-CLASS_AT>10000)refresh().then(()=>{if(slides[at]&&slides[at].gram||slides[at]&&/shared|own/.test(slides[at].kind))draw()});
  wasTurn=on}
// 📈 the lesson's results, kept for the dashboard: one document a group, learning path, tab and day, written only when something changed
function resSave(){
  if(!G||!STARTED||!CLASS||!CLASS.rows)return;
  const rows=CLASS.rows.map(({qi,qok,...r})=>r).sort((a,b)=>a.e<b.e?-1:1),S=sumUp(CLASS.rows),qs=perQuestion(CLASS.rows),day=ymd(STARTED);
  const sig=JSON.stringify([rows,qs]);if(sig===savedSig)return;savedSig=sig;
  const a=(window.EL_CATALOG||[]).find(x=>x.path===LS+"/"+LPF+".html"),id=[G,LS.replace("/","-"),LPF,PID,day].join("_");
  setDoc(doc(getFirestore(getApps()[0]),"classResults",id),{group:G,ls:LS,lp:LPF,tab:PID,day,from:STARTED,at:Date.now(),
    title:a?(window.elLpLabel?elLpLabel(a):a.title):LP.title,sum:S,rows,qs}).catch(e=>{savedSig="";console.warn("class results",e)});
}
// right / answered for one question: MC answers are the option's place in the data (0 = the right one), typed ones are compared as text
function tally(panel,qid,routes,item){
  if(!CLASS)return null;let ok=0,all=0;const wrong={};
  routes.forEach(r=>(CLASS.by[panel+"|"+qid+"|"+r]||[]).forEach(v=>{all++;
    const good=item.o?+v===0:[].concat(item.a||[]).some(a=>norm(a)===norm(v));
    if(good)ok++;else{const w=item.o?item.o[+v]:String(v);if(w!=null)wrong[w]=(wrong[w]||0)+1}}));
  if(!all)return null;
  const top=Object.entries(wrong).sort((a,b)=>b[1]-a[1])[0];
  return {ok,all,top};
}
const itemOf=(panelId,qid,pro)=>{const p=pro?Object.assign({},(LP.native||{})[panelId]||{}):LP.panels.find(x=>x.id===panelId)||{};
  const items=pro&&!p.items&&window.GS_NATIVE?GS_NATIVE.readingQs:p.items;
  const all=Array.isArray(items)?items:Object.values(items||{}).flat();return all.find(it=>X.qid(it)===qid)||{}};

/* ---------- drawing ---------- */
// the levels that have the question, with its number on their screen (Starter's question 5 can be Base's question 6)
const chipsFor=s=>{if(s.pro)return '<span class="chip pro">Pro only</span>';const num=r=>(s.per.find(p=>p.r===r)||{}).num,same=s.per.every(p=>p.num===s.per[0].num);
  return (s.all?'<span class="chip all">👥 Everyone'+(same?' · question '+s.per[0].num:'')+'</span>':'')+
    s.routes.map(r=>s.all&&same?'':`<span class="chip ${s.on.includes(r)?"on":""}">${NAME[r]}${s.on.includes(r)?" · "+num(r):""}</span>`).join("")};
function classBox(t){if(!t)return"";const pct=Math.round(100*t.ok/t.all);
  return `<div class="class">Right in the class<div class="big">${t.ok} / ${t.all}</div>${pct}%${t.top&&t.ok<t.all?` · ${t.top[1]} chose “${esc(t.top[0])}”`:""}</div>`}
function shared(s,open){
  const t=open?tally(s.panel,s.qid,s.on,itemOf(s.panel,s.qid,s.pro)):null;
  const only=s.all||s.pro?"":`<p class="hint">${s.routes.filter(r=>!s.on.includes(r)).map(r=>NAME[r]).join(" and ")}: this question is not in your reading. Listen and find it on the board.</p>`;
  return classBox(t)+`<div class="chips">${chipsFor(s)}</div><h1>${esc(s.q)}</h1>`+
    (open?`<div class="ans">✓ ${esc(s.ans)}</div>${s.alt.length?`<div class="alt">Also right: ${s.alt.map(esc).join(" · ")}</div>`:""}`:`<div class="ans hid">? &nbsp;Think, then say your answer</div>`)+
    (s.mc?`<p class="hint">Say the words, not a letter: the options are in a different order on every Chromebook.</p>`:"")+only+
    (open&&s.per.some(p=>p.ev.length)?`<div class="wh">Where the text says it</div><div class="where" style="--n:${s.per.length}">`+
      s.per.map(p=>`<div class="col"><h3>${NAME[p.r]} <small>question ${p.num}</small></h3><div class="txt">${X.snippet(p,true)||'<span class="none">The whole text: no one sentence.</span>'}</div></div>`).join("")+`</div>`:
     "")+cbHint(open);
}
// ✅ what the Chromebooks show meanwhile (el-cloud.js rtCorrect)
const cbHint=open=>G&&!GRAM?`<p class="hint">💻 ${open?"Every Chromebook now shows, in a card the student can move, their own answer, ✓ or ✗, the right answer of their level and where their text says it.":"Every Chromebook marks this question in the student's own reading; their answer and the right one appear when you show it."}</p>`:"";
function own(s,open){
  return `<div class="chips"><span class="chip all">👥 Question ${s.num}</span><span class="chip on">each level has its own</span></div>`+
    `<div class="where" style="--n:${s.per.length}">`+s.per.map(p=>{if(p.none)return `<div class="col"><h3>${NAME[p.r]}</h3><div class="none">No question ${s.num}</div></div>`;
      const t=open?tally(s.panel,p.qid,[p.r],itemOf(s.panel,p.qid,s.pro)):null;
      return `<div class="col"><h3>${NAME[p.r]} <small>question ${s.num}</small></h3><p class="q">${esc(p.q)}</p>`+
        `<p class="a ${open?"":"hid"}">${open?"✓ "+esc(p.ans):"? …"}</p>`+(open?`<div class="txt">${X.snippet(p,true)}</div>`:"")+
        (t?`<div class="n">Right: ${t.ok} / ${t.all}</div>`:"")+`</div>`}).join("")+`</div>`+
    (open?"":`<p class="hint">Say the words, not a letter: the options are in a different order on every Chromebook.</p>`)+cbHint(open);
}
function logSlide(s,open){
  const has=s.rows.some(r=>r.cells.some(c=>c));
  return `<div class="chips"><span class="chip all">📝 Reading log · model notes</span></div><h1 style="font-size:28px">Short notes, in your own words</h1>`+(s.note?`<p class="hint">${esc(s.note)}</p>`:"")+
    `<table class="log"><thead><tr><th style="width:24%">Question</th>${s.routes.map(r=>`<th>${NAME[r]}</th>`).join("")}</tr></thead><tbody>`+
    s.rows.map(r=>{const first=s.routes.findIndex((x,i)=>r.cells[i]!==null),lab=first>0?`<span class="tag">${NAME[s.routes[first]]}${first<s.routes.length-1?"+":""}</span>`:"";
      return `<tr><td class="lab">${esc(r.label)}${lab}</td>${r.cells.map(c=>c===null?'<td class="na">not in your log</td>':!open?'<td class="hid">…</td>':`<td>${esc(c)||"—"}</td>`).join("")}</tr>`}).join("")+
    `</tbody></table>`+(has?"":`<p class="hint">No model notes yet for this log.</p>`);
}
// the text's blocks as the students' page shows them (ls2-engine.js .reading > p; a chat: one block per message), so that block k on the
// projector is block k on their screen (📖 their screens follow: live/{group}.rt, rtSend)
function blocks(){
  const t=X.textFor(CTX,LP.panels.find(p=>p.id==="read"),RL);
  if(t.chat)return {chat:true,list:t.units.map(u=>"<b>"+esc(u.who)+":</b> "+esc(u.s))};
  const d=document.createElement("div");d.innerHTML=X.byLevel(LP.panels.find(p=>p.id==="read").media.text,RL)||"";
  return {chat:false,list:[...d.children].filter(e=>!e.classList.contains("tiny")).map(e=>e.innerHTML)};
}
// the sentences read one by one ("how do I change the sentence to read?"): [{b: block, s: text, br: a new line before it}];
// a chat message is one step
function steps(B){const out=[];B.list.forEach((h,b)=>{if(B.chat){out.push({b,h});return}let lp=null;
  X.units(h).forEach(u=>{out.push({b,s:u.s,br:lp!==null&&u.p!==lp});lp=u.p})});return out}
function readAll(){
  const B=blocks(),st=steps(B);
  return `<div class="chips"><span class="chip all">📖 Read together</span>${ROUTES.map(r=>`<button class="chip lvb ${r===RL?"on":""}" data-rl="${r}" title="Read the ${NAME[r]} version together">${NAME[r]}</button>`).join("")}</div>`+
    `<div class="rt ${RP>=0?"focus":""}">`+B.list.map((h,b)=>`<p class="${RP>=0&&st[RP]&&st[RP].b===b?"cur":""}">`+
      st.map((x,i)=>x.b!==b?"":(x.br?"<br>":(x.h||i===0||st[i-1].b!==b?"":" "))+`<span data-rp="${i}" class="${i===RP?"now":""}">${x.h||esc(x.s)}</span>`).join("")+`</p>`).join("")+`</div>`+
    `<p class="hint">Everyone reads the ${NAME[RL]} version now.${G?" Every Chromebook shows this same text now and follows the yellow paragraph; their own level's text comes back for ⏱ Your turn, with the words the ${NAME[RL]} text doesn't have in green. Space, → or a click: next sentence.":""}</p>`;
}
/* 📖 the students' screens follow the paragraph (Roger, 12 Nov 2026: "yes go ahead"): live/{group}.rt = {u: the page, k: block, n: blocks,
   chat, l: level, h: the text, at}, written only when the paragraph or the level changes (one small write a paragraph, not a sentence; the students' pages already listen to live/{group},
   el-cloud.js rtFollow); null when the reading is left or the screen closes */
let rtLast="";
function rtSend(){
  if(!G)return Promise.resolve();
  if(GRAM)return gSend();
  const s=slides[at],on=s&&s.kind==="readall",B=on?blocks():null,st=on?steps(B):[];
  // after the reading (⏱ Your turn and the questions): x, each Chromebook has its own text back with the words the shared text did not
  // have marked green (el-cloud.js rtExtras), so Core and Plus read their extra details before answering (Roger: "if they read different texts…")
  const ri=slides.findIndex(x=>x.kind==="readall"),after=s&&ri>=0&&at>ri;
  // ✅ c: the question on the projector, so every Chromebook marks its own and, once the answer is shown, says what the student answered and
  // the right answer of their level (el-cloud.js rtCorrect; Roger, 13 Nov 2026: "students see the feedback on their Chromebook with the
  // answers according to their level and see what they did")
  const P1=t=>X.plain(t).replace(/\s+/g," ").trim();
  // once the answer is shown, also where each level's text says it (w, or h per question when each level has its own): the snippet of the
  // projector's "Where the text says it", the sentence marked, for the student's floating card
  const op=shown.has(at),sn=p=>op&&p.ev&&p.ev.length?X.snippet(p,true):"";
  const c=s&&!s.gram&&(s.kind==="shared"||s.kind==="own")?{p:s.panel,s:op,qs:s.kind==="shared"?[{q:P1(s.q),a:P1(s.ans),alt:(s.alt||[]).map(P1)}]
    :s.per.filter(p=>!p.none).map(p=>({q:P1(p.q),a:P1(p.ans),h:sn(p)})),w:s.kind==="shared"?s.per.map(p=>({r:p.r,n:p.num,h:sn(p)})):[]}:null;
  if(after){const tx=X.textFor(CTX,LP.panels.find(p=>p.id==="read"),RL),v={u:LS+"/"+LPF+".html",k:-1,x:1,l:RL,h:tx.chat?tx.units.map(u=>esc(u.who)+": "+esc(u.s)).join("<br>"):tx.html,c,at:Date.now()},key=v.u+"|x|"+v.l+"|"+(c?at+"|"+(c.s?1:0):"");
    if(key===rtLast)return Promise.resolve();rtLast=key;
    return setDoc(doc(getFirestore(getApps()[0]),"live",G),{rt:v},{merge:true}).catch(e=>console.warn("read together",e))}
  // h: the text read together, which every Chromebook shows instead of its own level's text until the reading is left (Roger, 12 Nov
  // 2026: "but again, the text is not the same for everyone"); a chat goes as the page's own messages (4 ESO Getting started)
  const h=!on?"":B.chat?X.textFor(CTX,LP.panels.find(p=>p.id==="read"),RL).units.map(u=>`<div class="msg ${esc(u.who.toLowerCase())}"><b>${esc(u.who)}</b>${esc(u.s)}</div>`).join("")
    :X.byLevel(LP.panels.find(p=>p.id==="read").media.text,RL)||"";
  const v=on?{u:LS+"/"+LPF+".html",k:st[RP]?st[RP].b:-1,n:B.list.length,chat:B.chat,l:RL,h,at:Date.now()}:null,key=v?v.u+"|"+v.k+"|"+v.n+"|"+v.l:"";
  if(key===rtLast)return Promise.resolve();rtLast=key;
  return setDoc(doc(getFirestore(getApps()[0]),"live",G),{rt:v},{merge:true}).catch(e=>console.warn("read together",e));
}
const mmss=n=>Math.floor(n/60)+":"+String(n%60).padStart(2,"0");
function turn(){
  if(GRAM)return gTurn();
  const who=resBox();
  return `<div class="chips"><span class="chip all">⏱ Your turn</span></div><h1>Answer the questions of your level on your Chromebook</h1>`+
    `<p class="ca">Respon les preguntes del teu nivell al Chromebook. Pots tornar a llegir el teu text.</p>`+
    (G?`<p class="ca">🆕 First read the <b style="background:#bbf7d0;color:#14532d;padding:0 4px;border-radius:4px">green words</b>: what your text says that the ${NAME[RL]} text didn't. · Primer llegeix les paraules en verd.</p>`:"")+
    `<div class="timer ${TM.left<=0?"up":""}" id="tbig">${TM.left<=0?"⏰ Time!":mmss(TM.left)}</div>`+
    `<div class="tbtn"><button data-k="tgo" class="pri2">${TM.on?"⏸ Pause":TM.left<TM.len&&TM.left>0?"▶ Go on":"▶ Start"}</button>${[5,10,15].map(m=>`<button data-tm="${m}" class="${TM.len===m*60?"on":""}">${m} min</button>`).join("")}<button data-tm="+1">+1 min</button></div>`+who;
}
function gTurn(){
  const who=resBox();
  return `<div class="chips"><span class="chip all">⏱ Your turn</span></div><h1>Do the grammar exercise of your level on your Chromebook</h1>`+
    `<p class="ca">Fes l'exercici de gramàtica del teu nivell al Chromebook. Pots tornar a mirar «Com funciona».</p>`+
    (G&&GV!=="all"?`<p class="ca">🆕 First read the <b style="background:#bbf7d0;color:#14532d;padding:0 4px;border-radius:4px">green boxes</b>: what your level has that we didn't see together. · Primer llegeix els requadres en verd.</p>`:"")+
    `<div class="timer ${TM.left<=0?"up":""} ${G?"tsm":""}" id="tbig">${TM.left<=0?"⏰ Time!":mmss(TM.left)}</div>`+
    `<div class="tbtn"><button data-k="tgo" class="pri2">${TM.on?"⏸ Pause":TM.left<TM.len&&TM.left>0?"▶ Go on":"▶ Start"}</button>${[5,10,15].map(m=>`<button data-tm="${m}" class="${TM.len===m*60?"on":""}">${m} min</button>`).join("")}<button data-tm="+1">+1 min</button></div>`+who;
}
function tick(){if(!TM.on)return;TM.left=Math.max(0,TM.left-1);if(!TM.left){TM.on=false;clearInterval(TM.iv)}
  const b=$("tbig");if(b){b.textContent=TM.left?mmss(TM.left):"⏰ Time!";b.classList.toggle("up",!TM.left)}
  const m=$("tmini");if(m)m.textContent=(TM.on||TM.left<TM.len)&&!(slides[at]&&slides[at].kind==="turn")?"⏱ "+(TM.left?mmss(TM.left):"Time!"):"";
  if(!TM.on&&slides[at]&&slides[at].kind==="turn")draw()}
function timer(k){if(k==="tgo"){TM.on=!TM.on&&TM.left>0;clearInterval(TM.iv);if(TM.on)TM.iv=setInterval(tick,1000)}
  else if(k==="+1"){TM.left+=60;TM.len=Math.max(TM.len,TM.left)}else{TM.len=TM.left=+k*60;TM.on=false;clearInterval(TM.iv)}draw()}
const label=s=>s.kind==="explain"?"📘":s.kind==="readall"?"📖":s.kind==="turn"?"⏱":s.kind==="log"?"📝":s.pro?"P"+(slides.filter(x=>x.pro).indexOf(s)+1):String(slides.filter(x=>!x.pro&&/shared|own/.test(x.kind)&&x.panel===s.panel).indexOf(s)+1);
function draw(){
  const s=slides[at],open=shown.has(at);
  $("out").outerHTML=`<div class="card" id="out">${!s?"":s.kind==="explain"?explainAll():s.gram?gram(s,open):s.kind==="readall"?readAll():s.kind==="turn"?turn():s.kind==="log"?logSlide(s,open):s.kind==="own"?own(s,open):shared(s,open)}</div>`;
  const m=$("tmini");if(m)m.textContent=(TM.on||TM.left<TM.len)&&s&&s.kind!=="turn"?"⏱ "+(TM.left?mmss(TM.left):"Time!"):"";
  let lastPanel=null;
  $("dots").innerHTML=slides.map((x,i)=>{const pk=x.panel+(x.pro?"p":"")+(x.gram?"|"+(x.all?"all":x.on[0]):""),gap=lastPanel&&lastPanel!==pk?'<span class="gap"></span>':"";lastPanel=pk;   // grammar: a gap between Everyone, Base, Core+ and Plus
    return gap+`<button data-i="${i}" class="${i===at?"now":shown.has(i)?"seen":""}" title="${x.kind==="explain"?"How it works, together":x.kind==="readall"?"Read together":x.kind==="turn"?"Your turn: each level answers":x.gram?(x.pro?"Pro grammar":"Grammar"):x.kind==="log"?"Reading log":x.pro?"Pro":x.panel==="log"?"Reading log":"Reading"}">${label(x)}</button>`}).join("");
  const rk=s&&(s.kind==="readall"||s.kind==="explain"),plain=s&&(rk||s.kind==="turn"),last=rk?document.querySelectorAll("[data-rp]").length-1:0;
  $("bar").innerHTML=`<button data-k="back" ${at?"":"disabled"}>◀ Back</button>`+
    (plain?(rk&&RP<last?`<button class="pri" data-k="para">▶ ${RP<0?(s.kind==="explain"?"Start":"Start reading"):s.kind==="explain"?"Next box":"Next sentence"}</button><button data-k="next">Skip ▶</button>`:`<button class="pri" data-k="next">Next ▶</button>`):open?`<button class="pri" data-k="next" ${at<slides.length-1?"":"disabled"}>Next ▶</button>`:`<button class="pri" data-k="show">👁 ${s&&s.kind==="log"?"Show the model notes":"Show the answer"}</button>`+`<button data-k="next" ${at<slides.length-1?"":"disabled"}>Next ▶</button>`)+
    `<button data-k="close">✕ Close</button><span class="keys">Space: show / next · ← →</span>`;
  rtSend();livePoll();
  const cur=document.querySelector("[data-rp].now");if(cur)cur.scrollIntoView({block:"center"});else document.querySelector("main").scrollTop=0;
}
function act(k){if(k==="para"){const n=document.querySelectorAll("[data-rp]").length;if(RP<n-1)RP++;else if(at<slides.length-1)at++;}
  else if(k==="who"){refresh().then(resDraw);return}
  else if(k==="names"){NM=!NM;try{localStorage.setItem(NM_K,NM?"1":"0")}catch(x){}resDraw();return}
  else if(k==="tgo")return timer(k);
  else if(k==="back"&&at>0)at--;else if(k==="next"&&at<slides.length-1)at++;else if(k==="show")shown.add(at);else if(k==="close")return closeIt();draw()}
function closeIt(){const s=slides[at];if(poll){clearInterval(poll);poll=null}if(s)at=-1;rtSend().finally(()=>{at=0;closeGo()})}
window.addEventListener("pagehide",()=>{if(rtLast){at=-1;rtSend()}});
function closeGo(){if(EMBED&&parent!==window)parent.postMessage({elCorrect:"close"},location.origin);else if(history.length>1)history.back();else window.close()}
document.addEventListener("click",e=>{const p=e.target.closest("[data-rp]");if(p){RP=+p.dataset.rp;return draw()}
  const b=e.target.closest("button");if(!b)return;if(b.dataset.i!=null){at=+b.dataset.i;draw()}else if(b.dataset.rl){RL=b.dataset.rl;try{localStorage.setItem(RL_K,RL)}catch(x){}draw()}
  else if(b.dataset.gv){GV=b.dataset.gv;RP=-1;try{localStorage.setItem(GV_K,GV)}catch(x){}draw()}
  else if(b.dataset.tm)timer(b.dataset.tm==="+1"?"+1":b.dataset.tm);else if(b.dataset.k)act(b.dataset.k)});
document.addEventListener("keydown",e=>{if(e.target.closest("input,textarea"))return;
  const rk=/^(readall|explain)$/.test((slides[at]||{}).kind);   // on 📖 Read together / 📘 How it works the arrows (and a presenter clicker) move the paragraph / box
  if(e.key==="ArrowRight"||e.key==="PageDown")act(rk?"para":"next");else if(e.key==="ArrowLeft"||e.key==="PageUp"){if(rk&&RP>0){RP--;draw()}else act("back")}
  else if(e.key===" "||e.key==="Enter"){e.preventDefault();const k=(slides[at]||{}).kind;act(k==="readall"||k==="explain"?"para":k==="turn"||shown.has(at)?"next":"show")}else if(e.key==="Escape")act("close")});

async function run(){
  await build();
  const gname=((window.EL_GROUPS||[]).find(x=>x.id===G)||{}).name||"";
  const a=(window.EL_CATALOG||[]).find(x=>x.path===LS+"/"+LPF+".html");
  const lpName=a?(window.elLpLabel?elLpLabel(a):a.title):LP.title;
  const tabName=p=>tx((LP.panels.find(x=>x.id===p)||{}).tab)||p;
  $("sub").textContent=[gname,lpName,[...new Set(slides.map(s=>s.panel))].map(tabName).join(" + ")].filter(Boolean).join(" · ");
  document.title="✅ Correct · "+(gname?gname+" · ":"")+LP.title;
  try{CLASS=await classAnswers()}catch(e){console.warn("class answers",e)}
  if(slides.pro&&(!CLASS||CLASS.lv.native)){slides=slides.concat(slides.pro);PRO_ON=true}
  if(!slides.length){$("out").textContent="This step has no questions to correct together.";return}
  const i=slides.findIndex(s=>s.panel===TAB&&!s.pro);at=i<0?0:i;   // the Reading tab starts with 📖 Read together, Grammar with 📘 How it works
  draw();
}
// after the teacher's sign-in (teacher-gate.js shows the sign-in box until then)
const auth=getAuth(getApps()[0]||initializeApp(CONFIG));let started=false;
onAuthStateChanged(auth,u=>{if(started||!u||!TEACHERS.includes((u.email||"").toLowerCase()))return;started=true;
  run().catch(e=>{console.error(e);const o=$("out");o.className="msg";o.textContent="Could not open the correction: "+(e.message||e)})});
