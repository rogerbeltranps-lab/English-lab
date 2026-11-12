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

async function build(){
  if(!/^[24]eso\/[a-z0-9-]+$/.test(LS)||!/^[a-z0-9-]+$/.test(LPF))throw new Error("Which reading? The link has no learning path.");
  await load(base+"data/"+LPF+".js");LP=window.LP;
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

/* ---------- the students' answers (one read per student: their progress for this LS) ---------- */
const norm=s=>String(s==null?"":s).toLowerCase().replace(/[’‘`]/g,"'").replace(/[“”"]/g,"").replace(/[.,!?;:]/g,"").replace(/\s+/g," ").trim();
async function classAnswers(){
  if(!G)return null;
  const app=getApps()[0]||initializeApp(CONFIG),db=getFirestore(app),lsId=LS.replace("/","-");
  const st=await getDocs(query(collection(db,"students"),where("group","==",G)));
  const by={},lv={};let n=0,done=0;
  await Promise.all(st.docs.map(async s=>{
    const p=await getDoc(doc(db,"students",s.id,"progress",lsId)).catch(()=>null);
    const d=p&&p.exists()?(p.data().data||{}):{};let state=null;try{state=JSON.parse(d[LP.key]||"null")}catch(e){}
    const L=d[LP.key+"Level"]||null;if(L)lv[L]=(lv[L]||0)+1;
    if(!state||!state.ans)return;n++;if(state.ans.read)done++;
    Object.entries(state.ans).forEach(([pid,a])=>{if(!a||!Array.isArray(a.v)||!Array.isArray(a.q))return;
      a.q.forEach((q,i)=>{const v=a.v[i];if(v==null||v==="")return;const k=pid+"|"+q+"|"+(a.l||"");(by[k]=by[k]||[]).push(v)})});
  }));
  return {n,by,lv,done,students:st.size};
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
  const s=slides[at],on=s&&s.kind==="readall",B=on?blocks():null,st=on?steps(B):[];
  // after the reading (⏱ Your turn and the questions): x, each Chromebook has its own text back with the words the shared text did not
  // have marked green (el-cloud.js rtExtras), so Core and Plus read their extra details before answering (Roger: "if they read different texts…")
  const ri=slides.findIndex(x=>x.kind==="readall"),after=s&&ri>=0&&at>ri;
  if(after){const tx=X.textFor(CTX,LP.panels.find(p=>p.id==="read"),RL),v={u:LS+"/"+LPF+".html",k:-1,x:1,l:RL,h:tx.chat?tx.units.map(u=>esc(u.who)+": "+esc(u.s)).join("<br>"):tx.html,at:Date.now()},key=v.u+"|x|"+v.l;
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
  const who=G&&CLASS?`<p class="done">✅ ${CLASS.done} of ${CLASS.students} have checked the reading <button class="sm" data-k="who">🔄 Update</button></p>`:G?`<p class="done"><button class="sm" data-k="who">🔄 Who has finished?</button></p>`:"";
  return `<div class="chips"><span class="chip all">⏱ Your turn</span></div><h1>Answer the questions of your level on your Chromebook</h1>`+
    `<p class="ca">Respon les preguntes del teu nivell al Chromebook. Pots tornar a llegir el teu text.</p>`+
    (G?`<p class="ca">🆕 First read the <b style="background:#bbf7d0;color:#14532d;padding:0 4px;border-radius:4px">green words</b>: what your text says that the ${NAME[RL]} text didn't. · Primer llegeix les paraules en verd.</p>`:"")+
    `<div class="timer ${TM.left<=0?"up":""}" id="tbig">${TM.left<=0?"⏰ Time!":mmss(TM.left)}</div>`+
    `<div class="tbtn"><button data-k="tgo" class="pri2">${TM.on?"⏸ Pause":TM.left<TM.len&&TM.left>0?"▶ Go on":"▶ Start"}</button>${[5,10,15].map(m=>`<button data-tm="${m}" class="${TM.len===m*60?"on":""}">${m} min</button>`).join("")}<button data-tm="+1">+1 min</button></div>`+who;
}
function tick(){if(!TM.on)return;TM.left=Math.max(0,TM.left-1);if(!TM.left){TM.on=false;clearInterval(TM.iv)}
  const b=$("tbig");if(b){b.textContent=TM.left?mmss(TM.left):"⏰ Time!";b.classList.toggle("up",!TM.left)}
  const m=$("tmini");if(m)m.textContent=(TM.on||TM.left<TM.len)&&!(slides[at]&&slides[at].kind==="turn")?"⏱ "+(TM.left?mmss(TM.left):"Time!"):"";
  if(!TM.on&&slides[at]&&slides[at].kind==="turn")draw()}
function timer(k){if(k==="tgo"){TM.on=!TM.on&&TM.left>0;clearInterval(TM.iv);if(TM.on)TM.iv=setInterval(tick,1000)}
  else if(k==="+1"){TM.left+=60;TM.len=Math.max(TM.len,TM.left)}else{TM.len=TM.left=+k*60;TM.on=false;clearInterval(TM.iv)}draw()}
const label=s=>s.kind==="readall"?"📖":s.kind==="turn"?"⏱":s.kind==="log"?"📝":s.pro?"P"+(slides.filter(x=>x.pro).indexOf(s)+1):String(slides.filter(x=>!x.pro&&/shared|own/.test(x.kind)&&x.panel===s.panel).indexOf(s)+1);
function draw(){
  const s=slides[at],open=shown.has(at);
  $("out").outerHTML=`<div class="card" id="out">${!s?"":s.kind==="readall"?readAll():s.kind==="turn"?turn():s.kind==="log"?logSlide(s,open):s.kind==="own"?own(s,open):shared(s,open)}</div>`;
  const m=$("tmini");if(m)m.textContent=(TM.on||TM.left<TM.len)&&s&&s.kind!=="turn"?"⏱ "+(TM.left?mmss(TM.left):"Time!"):"";
  let lastPanel=null;
  $("dots").innerHTML=slides.map((x,i)=>{const gap=lastPanel&&lastPanel!==x.panel+(x.pro?"p":"")?'<span class="gap"></span>':"";lastPanel=x.panel+(x.pro?"p":"");
    return gap+`<button data-i="${i}" class="${i===at?"now":shown.has(i)?"seen":""}" title="${x.kind==="readall"?"Read together":x.kind==="turn"?"Your turn: each level answers":x.kind==="log"?"Reading log":x.pro?"Pro":x.panel==="log"?"Reading log":"Reading"}">${label(x)}</button>`}).join("");
  const plain=s&&(s.kind==="readall"||s.kind==="turn"),last=s&&s.kind==="readall"?document.querySelectorAll(".rt span[data-rp]").length-1:0;
  $("bar").innerHTML=`<button data-k="back" ${at?"":"disabled"}>◀ Back</button>`+
    (plain?(s.kind==="readall"&&RP<last?`<button class="pri" data-k="para">▶ ${RP<0?"Start reading":"Next sentence"}</button><button data-k="next">Skip ▶</button>`:`<button class="pri" data-k="next">Next ▶</button>`):open?`<button class="pri" data-k="next" ${at<slides.length-1?"":"disabled"}>Next ▶</button>`:`<button class="pri" data-k="show">👁 ${s&&s.kind==="log"?"Show the model notes":"Show the answer"}</button>`+`<button data-k="next" ${at<slides.length-1?"":"disabled"}>Next ▶</button>`)+
    `<button data-k="close">✕ Close</button><span class="keys">Space: show / next · ← →</span>`;
  rtSend();
  const cur=document.querySelector(".rt span.now");if(cur)cur.scrollIntoView({block:"center"});else document.querySelector("main").scrollTop=0;
}
function act(k){if(k==="para"){const n=document.querySelectorAll(".rt span[data-rp]").length;if(RP<n-1)RP++;else if(at<slides.length-1)at++;}
  else if(k==="who"){classAnswers().then(c=>{CLASS=c;draw()}).catch(e=>console.warn("class answers",e));return}
  else if(k==="tgo")return timer(k);
  else if(k==="back"&&at>0)at--;else if(k==="next"&&at<slides.length-1)at++;else if(k==="show")shown.add(at);else if(k==="close")return closeIt();draw()}
function closeIt(){const s=slides[at];if(s)at=-1;rtSend().finally(()=>{at=0;closeGo()})}
window.addEventListener("pagehide",()=>{if(rtLast){at=-1;rtSend()}});
function closeGo(){if(EMBED&&parent!==window)parent.postMessage({elCorrect:"close"},location.origin);else if(history.length>1)history.back();else window.close()}
document.addEventListener("click",e=>{const p=e.target.closest(".rt [data-rp]");if(p){RP=+p.dataset.rp;return draw()}
  const b=e.target.closest("button");if(!b)return;if(b.dataset.i!=null){at=+b.dataset.i;draw()}else if(b.dataset.rl){RL=b.dataset.rl;try{localStorage.setItem(RL_K,RL)}catch(x){}draw()}
  else if(b.dataset.tm)timer(b.dataset.tm==="+1"?"+1":b.dataset.tm);else if(b.dataset.k)act(b.dataset.k)});
document.addEventListener("keydown",e=>{if(e.target.closest("input,textarea"))return;
  const rk=(slides[at]||{}).kind==="readall";   // on 📖 Read together the arrows (and a presenter clicker) move the paragraph
  if(e.key==="ArrowRight"||e.key==="PageDown")act(rk?"para":"next");else if(e.key==="ArrowLeft"||e.key==="PageUp"){if(rk&&RP>0){RP--;draw()}else act("back")}
  else if(e.key===" "||e.key==="Enter"){e.preventDefault();const k=(slides[at]||{}).kind;act(k==="readall"?"para":k==="turn"||shown.has(at)?"next":"show")}else if(e.key==="Escape")act("close")});

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
  const i=slides.findIndex(s=>s.panel===TAB&&!s.pro);at=i<0?0:i;   // the Reading tab starts with 📖 Read together
  draw();
}
// after the teacher's sign-in (teacher-gate.js shows the sign-in box until then)
const auth=getAuth(getApps()[0]||initializeApp(CONFIG));let started=false;
onAuthStateChanged(auth,u=>{if(started||!u||!TEACHERS.includes((u.email||"").toLowerCase()))return;started=true;
  run().catch(e=>{console.error(e);const o=$("out");o.className="msg";o.textContent="Could not open the correction: "+(e.message||e)})});
