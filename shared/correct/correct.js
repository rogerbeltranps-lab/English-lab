// ✅ Correct together: draws the slides of shared/correct/correct-core.js (see index.html). Teacher only.
import {initializeApp,getApps} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getFirestore,collection,query,where,getDocs,doc,getDoc} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {CONFIG,TEACHERS} from "../js/el-firebase.js";

const X=window.ELCorrect,{NAME,esc}=X,$=id=>document.getElementById(id);
const P=new URLSearchParams(location.search),LS=P.get("ls")||"",LPF=P.get("lp")||"",TAB=P.get("tab")||"read",G=P.get("g")||"",EMBED=P.get("embed")==="1";
const course=(LS.match(/^\d+eso/)||[""])[0],ROUTES=["beginners","insecure","safe","daring"];
const base="../../"+LS+"/";
const load=src=>new Promise((ok,no)=>{const s=document.createElement("script");s.src=src;s.onload=ok;s.onerror=no;document.head.append(s)});
const tx=o=>o==null?"":typeof o==="string"?o:(o.en||o.ca||"");

let slides=[],at=0,shown=new Set(),LP=null,CLASS=null;   // CLASS: {n students, by: {panel|qid|route: [values]}}

async function build(){
  if(!/^[24]eso\/[a-z0-9-]+$/.test(LS)||!/^[a-z0-9-]+$/.test(LPF))throw new Error("Which reading? The link has no learning path.");
  await load(base+"data/"+LPF+".js");LP=window.LP;
  const chat=typeof readingChat!=="undefined"?readingChat:null;   // 4 ESO Getting started: the reading is a chat (data/getting-started.js)
  const notes=(window.EL_CORRECT||{})[LS+"/"+LPF]||{};
  const read=LP.panels.find(p=>p.id==="read"),log=LP.panels.find(p=>p.id==="log");
  const ctx={LP,key:LS+"/"+LPF,routes:ROUTES,chat,notes,textPanel:read};
  const panels=[read,log].filter(p=>p&&(p.items||p.fields));
  panels.forEach(p=>{slides=slides.concat(X.slidesFor(ctx,p,false))});
  // Pro (4 ESO): its own essay and questions, last; only when the group has a Pro student (or no group is given)
  if(course==="4eso"){
    try{await load(base+"data/native/"+LPF+".js")}catch(e){}
    let N=LP.native;
    if(!N&&window.GS_NATIVE)N={read:Object.assign({},read,{media:{text:GS_NATIVE.readingHtml},items:GS_NATIVE.readingQs})};
    if(N&&N.read&&N.read.items){const pr=Object.assign({},N.read,{id:"read"});
      slides.pro=X.slidesFor({LP,key:ctx.key,routes:["native"],chat:null,notes,textPanel:pr},pr,true).filter(s=>s.kind!=="log")}}
}

/* ---------- the students' answers (one read per student: their progress for this LS) ---------- */
const norm=s=>String(s==null?"":s).toLowerCase().replace(/[’‘`]/g,"'").replace(/[“”"]/g,"").replace(/[.,!?;:]/g,"").replace(/\s+/g," ").trim();
async function classAnswers(){
  if(!G)return null;
  const app=getApps()[0]||initializeApp(CONFIG),db=getFirestore(app),lsId=LS.replace("/","-");
  const st=await getDocs(query(collection(db,"students"),where("group","==",G)));
  const by={},lv={};let n=0;
  await Promise.all(st.docs.map(async s=>{
    const p=await getDoc(doc(db,"students",s.id,"progress",lsId)).catch(()=>null);
    const d=p&&p.exists()?(p.data().data||{}):{};let state=null;try{state=JSON.parse(d[LP.key]||"null")}catch(e){}
    const L=d[LP.key+"Level"]||null;if(L)lv[L]=(lv[L]||0)+1;
    if(!state||!state.ans)return;n++;
    Object.entries(state.ans).forEach(([pid,a])=>{if(!a||!Array.isArray(a.v)||!Array.isArray(a.q))return;
      a.q.forEach((q,i)=>{const v=a.v[i];if(v==null||v==="")return;const k=pid+"|"+q+"|"+(a.l||"");(by[k]=by[k]||[]).push(v)})});
  }));
  return {n,by,lv,students:st.size};
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
const itemOf=(panelId,qid,pro)=>{const p=pro?Object.assign({},(LP.native||{}).read||{}):LP.panels.find(x=>x.id===panelId)||{};
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
     "");
}
function own(s,open){
  return `<div class="chips"><span class="chip all">👥 Question ${s.num}</span><span class="chip on">each level has its own</span></div>`+
    `<div class="where" style="--n:${s.per.length}">`+s.per.map(p=>{if(p.none)return `<div class="col"><h3>${NAME[p.r]}</h3><div class="none">No question ${s.num}</div></div>`;
      const t=open?tally(s.panel,p.qid,[p.r],itemOf(s.panel,p.qid,s.pro)):null;
      return `<div class="col"><h3>${NAME[p.r]} <small>question ${s.num}</small></h3><p class="q">${esc(p.q)}</p>`+
        `<p class="a ${open?"":"hid"}">${open?"✓ "+esc(p.ans):"? …"}</p>`+(open?`<div class="txt">${X.snippet(p,true)}</div>`:"")+
        (t?`<div class="n">Right: ${t.ok} / ${t.all}</div>`:"")+`</div>`}).join("")+`</div>`+
    (open?"":`<p class="hint">Say the words, not a letter: the options are in a different order on every Chromebook.</p>`);
}
function logSlide(s,open){
  const has=s.rows.some(r=>r.cells.some(c=>c));
  return `<div class="chips"><span class="chip all">📝 Reading log · model notes</span></div><h1 style="font-size:28px">Short notes, in your own words</h1>`+(s.note?`<p class="hint">${esc(s.note)}</p>`:"")+
    `<table class="log"><thead><tr><th style="width:24%">Question</th>${s.routes.map(r=>`<th>${NAME[r]}</th>`).join("")}</tr></thead><tbody>`+
    s.rows.map(r=>{const first=s.routes.findIndex((x,i)=>r.cells[i]!==null),lab=first>0?`<span class="tag">${NAME[s.routes[first]]}${first<s.routes.length-1?"+":""}</span>`:"";
      return `<tr><td class="lab">${esc(r.label)}${lab}</td>${r.cells.map(c=>c===null?'<td class="na">not in your log</td>':!open?'<td class="hid">…</td>':`<td>${esc(c)||"—"}</td>`).join("")}</tr>`}).join("")+
    `</tbody></table>`+(has?"":`<p class="hint">No model notes yet for this log.</p>`);
}
const label=s=>s.kind==="log"?"📝":s.pro?"P"+(slides.filter(x=>x.pro).indexOf(s)+1):String(slides.filter(x=>!x.pro&&x.kind!=="log"&&x.panel===s.panel).indexOf(s)+1);
function draw(){
  const s=slides[at],open=shown.has(at);
  $("out").outerHTML=`<div class="card" id="out">${!s?"":s.kind==="log"?logSlide(s,open):s.kind==="own"?own(s,open):shared(s,open)}</div>`;
  let lastPanel=null;
  $("dots").innerHTML=slides.map((x,i)=>{const gap=lastPanel&&lastPanel!==x.panel+(x.pro?"p":"")?'<span class="gap"></span>':"";lastPanel=x.panel+(x.pro?"p":"");
    return gap+`<button data-i="${i}" class="${i===at?"now":shown.has(i)?"seen":""}" title="${x.kind==="log"?"Reading log":x.pro?"Pro":x.panel==="log"?"Reading log":"Reading"}">${label(x)}</button>`}).join("");
  $("bar").innerHTML=`<button data-k="back" ${at?"":"disabled"}>◀ Back</button>`+
    (open?`<button class="pri" data-k="next" ${at<slides.length-1?"":"disabled"}>Next ▶</button>`:`<button class="pri" data-k="show">👁 ${s&&s.kind==="log"?"Show the model notes":"Show the answer"}</button>`+`<button data-k="next" ${at<slides.length-1?"":"disabled"}>Next ▶</button>`)+
    `<button data-k="close">✕ Close</button><span class="keys">Space: show / next · ← →</span>`;
  document.querySelector("main").scrollTop=0;
}
function act(k){if(k==="back"&&at>0)at--;else if(k==="next"&&at<slides.length-1)at++;else if(k==="show")shown.add(at);else if(k==="close")return closeIt();draw()}
function closeIt(){if(EMBED&&parent!==window)parent.postMessage({elCorrect:"close"},location.origin);else if(history.length>1)history.back();else window.close()}
document.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;if(b.dataset.i!=null){at=+b.dataset.i;draw()}else if(b.dataset.k)act(b.dataset.k)});
document.addEventListener("keydown",e=>{if(e.target.closest("input,textarea"))return;
  if(e.key==="ArrowRight"||e.key==="PageDown")act("next");else if(e.key==="ArrowLeft"||e.key==="PageUp")act("back");
  else if(e.key===" "||e.key==="Enter"){e.preventDefault();act(shown.has(at)?"next":"show")}else if(e.key==="Escape")act("close")});

async function run(){
  await build();
  const gname=((window.EL_GROUPS||[]).find(x=>x.id===G)||{}).name||"";
  const a=(window.EL_CATALOG||[]).find(x=>x.path===LS+"/"+LPF+".html");
  const lpName=a?(window.elLpLabel?elLpLabel(a):a.title):LP.title;
  const tabName=p=>tx((LP.panels.find(x=>x.id===p)||{}).tab)||p;
  $("sub").textContent=[gname,lpName,[...new Set(slides.map(s=>s.panel))].map(tabName).join(" + ")].filter(Boolean).join(" · ");
  document.title="✅ Correct · "+(gname?gname+" · ":"")+LP.title;
  try{CLASS=await classAnswers()}catch(e){console.warn("class answers",e)}
  if(slides.pro&&(!CLASS||CLASS.lv.native))slides=slides.concat(slides.pro);
  if(!slides.length){$("out").textContent="This step has no questions to correct together.";return}
  const i=slides.findIndex(s=>s.panel===TAB&&!s.pro);at=i<0?0:i;
  draw();
}
// after the teacher's sign-in (teacher-gate.js shows the sign-in box until then)
const auth=getAuth(getApps()[0]||initializeApp(CONFIG));let started=false;
onAuthStateChanged(auth,u=>{if(started||!u||!TEACHERS.includes((u.email||"").toLowerCase()))return;started=true;
  run().catch(e=>{console.error(e);const o=$("out");o.className="msg";o.textContent="Could not open the correction: "+(e.message||e)})});
