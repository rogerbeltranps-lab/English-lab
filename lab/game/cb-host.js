// 🕵️ Code Breakers board (Roger, 11–12 Nov 2026: "can we make a game like a blooket, hackers like?"), codebreakers.html: the teacher's
// screen on the projector. The rules are in cb.js. ?lp=<course>-ls<n>-lp<n> (or ?deck=<one of its games>): the round uses both games of
// that learning path, no theory. The teacher chooses the group and the time (5, 8, 10 or 15 minutes; + 2 min and ■ End while it runs).
//   live/{group} = {on, game:true, mode:"cb", deck, title, sid, at, phase: lobby | play | end, cp (at the end: the class's % right),
//                   cb:{decks:[vocab id, grammar id], lp, end (ms), pl:{pid: {nm, av, e, s, ws, c, sh, n, r}}, hr:{pid_k: {f, t, ok, blk, n, at}}}}
// pl = the players (pid = ELCB.pid(email), never the email): name, animal, bits earned (e) and bits now (s), their 3 password words (ws) and
// the clue of the one they chose (c, never the word), firewall until (sh), answered (n) and right (r). hr = every hack, judged here: the
// board alone reads the passwords (in the players' answers docs). Published at most every 4 s (a hack at once): the Firestore reads stay low.
// At the end the board saves the results as two class game results, one per game (vocabulary, grammar), so 📊 Results, the 🧩📚 circles,
// 🎓 My progress and the LS mark read them like any other game: gameResults/{group}_{sid} (vocabulary) and {group}_{sid+1} (grammar) with
// mode "cb" and cb:true (each student's % is over the questions THEY answered: stu[].a), and myGames/{email}.games[same key] with of = a.
// Right answers are +1 term point each, as in the class game.
import {initializeApp,getApps} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import * as A from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import * as S from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {CONFIG,TEACHERS} from "../../shared/js/el-firebase.js";

const G=window.ELGame,CB=window.ELCB,{esc,md}=G,$=s=>document.querySelector(s);
const app=getApps()[0]||initializeApp(CONFIG),auth=A.getAuth(app),db=S.getFirestore(app);
const app$=$("#app");G.bg();
const URLP=new URLSearchParams(location.search);
const BACK=(()=>{const lp=u=>{try{const x=new URL(u,location.href);return x.origin===location.origin&&!/\/lab\/game\//.test(x.pathname)&&!/\/teacher\.html$/.test(x.pathname)?x.pathname+x.search:""}catch(e){return ""}};
  let b=lp(URLP.get("from")||"")||lp(document.referrer);try{if(b)sessionStorage.setItem("elCbBack",b);else b=sessionStorage.getItem("elCbBack")||""}catch(e){}return b})();
const CMT=(()=>{try{const o=JSON.parse(sessionStorage.getItem("el_cm")||"null");return o&&o.g&&Date.now()<o.until?o:null}catch(e){return null}})();
const MINS=[5,8,10,15];
const ss={get(){try{return JSON.parse(sessionStorage.getItem("elCB")||"null")}catch(e){return null}},set(v){try{sessionStorage.setItem("elCB",JSON.stringify(v))}catch(e){}}};

// the learning path: its two games (decks/index.js, same course, LS and learning path)
function lpGames(key,deck){const L=window.EL_GAMES||[];let d=deck&&L.find(x=>x.id===deck);
  if(!d&&key)d=L.find(x=>x.id.startsWith(key+"-"));if(!d)return [];
  return L.filter(x=>x.course===d.course&&x.ls===d.ls&&x.lp===d.lp).sort((a,b)=>(a.kind==="vocab"?0:1)-(b.kind==="vocab"?0:1))}
const lpKeyOf=d=>d.id.replace(/-(vocab|grammar)$/,"");

const H={user:null,teacher:false,games:lpGames(URLP.get("lp"),URLP.get("deck")),L:null,g:"",sid:0,phase:"pick",end:0,mins:8,hr:{},names:{},pts:{},players:{},
  feed:[],lx:{},err:"",term:elTerm()};
const saved=ss.get();
if(saved&&saved.sid&&Date.now()-saved.sid<4*3600e3&&(!H.games.length||lpKeyOf(H.games[0])===saved.lp)){H.games=lpGames(saved.lp);Object.assign(H,{g:saved.g,sid:saved.sid,phase:saved.phase,end:saved.end,mins:saved.mins||8,hr:saved.hr||{}})}
const keep=()=>ss.set(H.sid?{lp:H.games.length?lpKeyOf(H.games[0]):"",g:H.g,sid:H.sid,phase:H.phase,end:H.end,mins:H.mins,hr:H.hr}:null);
const meta=()=>H.games[0]||{};
const lpName=()=>meta().lp||"";
const title=()=>"🕵️ Code Breakers · "+(lpName()||"");
const groupName=g=>((window.EL_GROUPS||[]).find(x=>x.id===g)||{}).name||g;
const nameOf=em=>H.names[em]||em.split("@")[0];
const lsId=()=>{const m=meta(),nm=String(m.ls||"").replace(/^[^·]*·\s*/,"").trim().toLowerCase();
  const l=(window.EL_LS||[]).find(x=>x.course===m.course&&x.title.replace(/^[^·]*·\s*/,"").trim().toLowerCase()===nm);return l?l.id:""};
const left=()=>Math.max(0,H.end-Date.now());
const fmt=ms=>{const s=Math.ceil(ms/1000);return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")};

/* ---------- players, bits and hacks ---------- */
const byPid=()=>{const m={};Object.keys(H.players).forEach(em=>m[CB.pid(em)]=em);return m};
function pl(){const out={};Object.entries(H.players).forEach(([em,p])=>{const c=p.cb||{},w=(H.L&&H.L.words||[]).find(z=>z.w===c.pw);
  out[CB.pid(em)]={nm:nameOf(em),av:CB.avatar(em),e:+c.e||0,ws:Array.isArray(c.ws)?c.ws.slice(0,3):[],c:w?w.c:"",sh:+c.sh||0,n:+c.n||0,r:+c.r||0,pw:!!c.pw}});
  Object.keys(out).forEach(id=>out[id].s=CB.score(id,out,H.hr));return out}
// every new hack attempt (cb.h in the players' docs), oldest first: right password and no firewall → steals ELCB.HACK of the target's bits
function judge(){const P=byPid(),todo=[];
  Object.entries(H.players).forEach(([em,p])=>{const h=(p.cb||{}).h||{},f=CB.pid(em);Object.entries(h).forEach(([k,v])=>{const id=f+"_"+k;if(!H.hr[id]&&v&&v.t)todo.push({id,f,...v})})});
  if(!todo.length)return false;todo.sort((a,b)=>(+a.at||0)-(+b.at||0));
  todo.forEach(t=>{const at=+t.at||Date.now(),fN0=nameOf(P[t.f]||""),tN0=nameOf(P[t.t]||"");
    // 🤝 no ganging up (cb.js guard): the target was tried less than 1 min ago (2 after a hack that worked), or the same hacker twice in a row
    if(CB.guard(t.t,H.hr,at)>at||CB.lastTarget(t.f,H.hr)===t.t){H.hr[t.id]={f:t.f,t:t.t,ok:false,blk:true,pr:true,n:0,at};
      say(`✋ <b>${esc(tN0)}</b> is protected for now: <b>${esc(fN0)}</b> must choose someone else`,"miss");return}
    const tem=P[t.t],tc=tem&&(H.players[tem].cb||{}),P0=pl(),ok=!!tc&&!!tc.pw&&t.g===tc.pw,blk=ok&&+tc.sh>at;
    const n=ok&&!blk?Math.max(0,Math.round(CB.score(t.t,P0,H.hr)*CB.HACK)):0;
    H.hr[t.id]={f:t.f,t:t.t,ok:ok&&!blk,blk,n,at};
    const fN=nameOf(P[t.f]||""),tN=nameOf(tem||"");
    say(ok&&!blk?(n?`🔓 <b>${esc(fN)}</b> hacked <b>${esc(tN)}</b>: ${n} bits!`:`🔓 <b>${esc(fN)}</b> cracked <b>${esc(tN)}</b>'s password, but they had no bits`):blk?`🛡️ <b>${esc(tN)}</b>'s firewall stopped <b>${esc(fN)}</b>`:`🔒 <b>${esc(fN)}</b> tried to hack <b>${esc(tN)}</b>: wrong password`,ok&&!blk?"hack":"miss");
    G.fx(ok&&!blk&&n?"reveal":"tap")});
  keep();return true}
function feedFiles(){Object.entries(H.players).forEach(([em,p])=>{const l=(p.cb||{}).lx;if(!l||!l.at||(H.lx[em]||0)>=l.at)return;const first=H.lx[em]===undefined;H.lx[em]=l.at;if(first&&Date.now()-l.at>8e3)return;
  const n=`<b>${esc(nameOf(em))}</b>`;
  if(l.k==="double")say(`⚡ ${n} doubled their bits: +${l.n}!`,"good");else if(l.k==="virus")say(`🦠 ${n} caught a virus: −${l.n}`,"bad");
  else if(l.k==="shield")say(`🛡️ ${n} turned on a firewall`,"shield");else if(l.k==="bits"&&l.n>=60)say(`💾 ${n} found ${l.n} bits!`,"good")})}
function say(h,k){H.feed.unshift({h,k,at:Date.now()});H.feed=H.feed.slice(0,8)}

/* ---------- Firebase ---------- */
let ansStop=null,pubT=0,pubAt=0,beat=0;
function publish(soon){
  if(!H.g||!H.sid)return;clearTimeout(pubT);const wait=soon?250:Math.max(0,4000-(Date.now()-pubAt));
  pubT=setTimeout(()=>{pubAt=Date.now();const P=pl();Object.values(P).forEach(p=>delete p.pw);
    const D=S.deleteField(),data={on:true,game:true,mode:"cb",deck:location.pathname,title:title(),sid:H.sid,phase:H.phase,i:0,qn:0,qt:0,keys:{},at:S.serverTimestamp(),
      cb:{decks:H.games.map(d=>d.id),lp:lpName(),end:H.end,pl:P,hr:H.hr},q:D,th:D,ok:D,nt:D,cp:H.phase==="end"&&H.cp!=null?H.cp:D};
    S.setDoc(S.doc(db,"live",H.g),data,{mergeFields:Object.keys(data)}).catch(e=>{console.warn("live",e);H.err="⚠ The students can't see the game: "+e.message;draw()})},wait)}
function liveOff(g){if(g)S.setDoc(S.doc(db,"live",g),{on:false,at:S.serverTimestamp()},{merge:true}).catch(e=>console.warn("live",e))}
addEventListener("pagehide",()=>{if(H.g&&H.sid&&H.teacher)liveOff(H.g)});
async function startGroup(){
  const g=H.g;H.err="";H.players={};
  try{const [ro,pt]=await Promise.all([S.getDocs(S.query(S.collection(db,"roster"),S.where("group","==",g))),S.getDocs(S.collection(db,"points"))]);
    const names={},keys=new Set();ro.forEach(d=>{const x=d.data();keys.add(d.id);names[d.id]=(x.first||d.id.split("@")[0])+(x.surname1?" "+x.surname1[0]+".":"")});
    const pts={};pt.forEach(d=>{if(keys.has(d.id))pts[d.id]=+d.data()[H.term]||0});Object.assign(H,{names,pts})}
  catch(e){console.warn("game",e);H.err="⚠ Could not read the group: "+e.message}
  if(ansStop)ansStop();
  ansStop=S.onSnapshot(S.collection(db,"live",g,"answers"),qs=>{const before=Object.keys(H.players).length,P={};
    qs.forEach(d=>{const x=d.data();if(x.sid===H.sid)P[d.id]={a:x.a||{},cb:x.cb||{}}});H.players=P;
    if(H.phase==="lobby"&&Object.keys(P).length>before)G.fx("join");
    const hacked=judge();feedFiles();publish(hacked);draw()},e=>{console.warn("answers",e);H.err="⚠ Could not read the answers: "+e.message;draw()});
  clearInterval(beat);beat=setInterval(()=>publish(),30e3);publish(true);draw()}

/* ---------- the round ---------- */
async function startGame(g){H.g=g;H.sid=Date.now();H.phase="lobby";H.end=0;H.hr={};H.feed=[];H.lx={};H.cp=null;savedSid=0;keep();G.music("lobby");await startGroup()}
function go(){H.phase="play";H.end=Date.now()+H.mins*60e3;keep();G.music("think");G.fx("next");publish(true);draw()}
function more(){H.end=Math.max(H.end,Date.now())+2*60e3;keep();publish(true);draw()}
function finish(){if(H.phase!=="play")return;H.phase="end";H.end=Math.min(H.end,Date.now());const t=totals();H.cp=t.n?Math.round(t.r/t.n*100):null;
  keep();G.music("");G.fx("drum");setTimeout(()=>{G.fx("fanfare");G.confetti()},1700);publish(true);saveResults();draw()}
function endGame(){const g=H.g;if(H.phase==="play")finish();liveOff(g);if(ansStop)ansStop();ansStop=null;clearInterval(beat);G.music("");
  Object.assign(H,{g:"",sid:0,phase:"pick",end:0,hr:{},players:{},feed:[]});keep();draw()}
setInterval(()=>{if(H.phase==="play"&&H.end&&Date.now()>=H.end)finish();else if(H.phase==="play")drawTime()},500);

// the answers, checked here again from what each student tapped or wrote (first try of each question)
function marks(){const out={};if(!H.L)return out;
  Object.entries(H.players).forEach(([em,p])=>{const m={};Object.entries(p.a||{}).forEach(([k,v])=>{const q=H.L.byKey[k];if(q)m[k]={q,v,ok:CB.isRight(q,v)}});out[em]=m});return out}
function totals(){const M=marks();let n=0,r=0;Object.entries(M).forEach(([em,m])=>{if(!H.names[em])return;Object.values(m).forEach(x=>{n++;if(x.ok)r++})});return {n,r}}
let savedSid=0;
async function saveResults(){
  if(!H.g||!H.sid||savedSid===H.sid||!H.L)return;savedSid=H.sid;const M=marks(),m=meta(),d=new Date(H.sid);
  const day=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  const w=S.writeBatch(db),now=S.serverTimestamp(),mine={};
  H.games.forEach((gm,gi)=>{const dk=H.L.decks[gm.id];if(!dk)return;
    const qs=dk.qs.filter(q=>Object.values(M).some(x=>x[q.key]));if(!qs.length)return;
    const said=x=>String(x.v).slice(0,80),okText=q=>CB.plain(q.write?q.write[0]:q.options[0]).slice(0,80);
    const stu=Object.entries(M).map(([e,x])=>{const mineQ=qs.filter(q=>x[q.key]);if(!mineQ.length)return null;const ans={};mineQ.forEach(q=>ans[q.n]=said(x[q.key]));
      return {e,r:mineQ.filter(q=>x[q.key].ok).length,a:mineQ.length,miss:mineQ.filter(q=>!x[q.key].ok).map(q=>q.n),ans}}).filter(Boolean);
    const key=H.g+"_"+(H.sid+gi);
    const doc={group:H.g,course:gm.course||"",deck:gm.id,title:dk.title,kind:gm.kind||dk.kind,ls:gm.ls||"",lp:gm.lp||"",mode:"cb",cb:true,sid:H.sid+gi,day,term:H.term,at:now,
      qn:dk.qs.length,done:qs.length,qs:qs.map(q=>{const all=Object.values(M).map(x=>x[q.key]).filter(Boolean);return {n:q.n,q:CB.plain(q.q).slice(0,160),ok:okText(q),right:all.filter(z=>z.ok).length,of:all.length}}),nts:[],stu};
    w.set(S.doc(db,"gameResults",key),doc);
    stu.forEach(x=>{const pn={},miss=x.miss.map(n=>{const q=qs.find(z=>z.n===n);return {n,q:CB.plain(q.q).slice(0,160),a:x.ans[n]||"",ok:okText(q),p:q.p||""}});
      qs.filter(q=>M[x.e][q.key]).forEach(q=>{if(q.p)pn[q.p]=(pn[q.p]||0)+1});
      (mine[x.e]=mine[x.e]||{})[key]={deck:gm.id,title:dk.title,kind:doc.kind,ls:lsId(),lp:doc.lp,day,sid:H.sid+gi,r:x.r,of:x.a,pn,miss,mode:"cb"}})});
  Object.entries(mine).forEach(([e,games])=>w.set(S.doc(db,"myGames",e),{games,updated:now},{merge:true}));
  // +1 term point per right answer (the same points as the class game); the group's best over the student list only
  const right={};Object.entries(M).forEach(([e,x])=>{const r=Object.values(x).filter(z=>z.ok).length;if(r)right[e]=r});
  Object.entries(right).forEach(([e,r])=>{H.pts[e]=(H.pts[e]||0)+r;w.set(S.doc(db,"points",e),{[H.term]:S.increment(r),updated:now},{merge:true})});
  if(Object.keys(right).length)w.set(S.doc(db,"teams",H.g),{best:{[H.term]:Math.max(0,...Object.keys(H.names).map(e=>H.pts[e]||0))},updated:now},{merge:true});
  try{await w.commit()}catch(e){savedSid=0;console.warn("results",e);H.err="⚠ Results not saved: "+e.message;draw()}
}

/* ---------- 🎓 back to class mode (as the class game board) ---------- */
async function backToClass(){const g=CMT&&CMT.g;if(!g)return;if(H.phase==="play")finish();await saveResults();
  try{await S.setDoc(S.doc(db,"live",g),{cmBack:Date.now(),on:false,at:S.serverTimestamp()},{merge:true})}catch(e){H.err="⚠ The students were not sent back: "+e.message;draw();return}
  let x=null;try{x=JSON.parse(sessionStorage.getItem("el_cm_last")||"null")}catch(e){}
  Object.assign(H,{g:"",sid:0,phase:"pick"});keep();
  const u=x&&x.u?new URL("../../"+x.u,location.href):new URL(BACK||"../../teacher.html",location.href);if(x&&x.p)u.hash=x.p;location.href=u.href}

/* ---------- screens ---------- */
const back=()=>CMT&&CMT.g===H.g&&H.sid?`<button class="btn cm" data-do="cmback">🎓 Back to class mode</button> `:BACK?`<a class="btn ghost" href="${esc(BACK)}">← Learning Path</a> `:"";
function top(){return `<div class="top"><span class="pill">📡 ${esc(groupName(H.g))}</span><span class="pill">🕵️ ${Object.keys(H.players).length}</span><span class="pill lpn">${esc(lpName())}</span><span class="sp"></span>
  ${H.err?`<span class="pill" style="background:#b3261e">${esc(H.err)}</span>`:""}<button class="btn ghost" data-do="mute" title="Music and sounds (M)">${G.sound()?"🔊":"🔇"}</button>
  ${H.phase==="play"?`<button class="btn ghost" data-do="more" title="Two more minutes">+2 min</button>`:""}${H.phase!=="end"?back():""}<button class="btn ghost" data-do="end">${Date.now()-endArm<3000?(H.phase==="play"?"Tap again: end now":"Tap again to close"):"■ End"}</button></div>`}
function rankList(){const P=pl();return Object.entries(P).map(([id,p])=>({id,...p})).sort((a,b)=>b.s-a.s||a.nm.localeCompare(b.nm))}
function draw(){
  if(!H.user){app$.innerHTML=`<div class="center"><div class="card msg pop"><h2>🕵️ Code Breakers</h2><p>This is the teacher's board. Sign in with the teacher's account.</p><p><button class="btn go" data-do="signin">Sign in with Google</button></p></div></div>`;return}
  if(!H.teacher){app$.innerHTML=`<div class="center"><div class="card msg pop"><h2>🕵️ Code Breakers</h2><p>This is the teacher's board. When your teacher starts the game, it opens by itself on your screen.</p><p><a class="btn go" href="play.html">Go to the game screen</a></p></div></div>`;return}
  if(!H.games.length){   // choose a learning path
    const L=window.EL_GAMES||[],lps=[];L.forEach(d=>{const k=lpKeyOf(d);if(!/-lp[1-3]$/.test(k))return;if(!lps.some(x=>x.k===k))lps.push({k,d})});
    const by=c=>lps.filter(x=>x.d.course===c).sort((a,b)=>(a.d.ls+a.d.lp).localeCompare(b.d.ls+b.d.lp,"en",{numeric:true}));
    app$.innerHTML=`<div class="center"><div><h1 class="logo pop">🕵️ Code Breakers</h1><p class="sub">Choose a learning path: its vocabulary and grammar questions, each student at their own pace.</p>
      <div class="courses">${["2eso","4eso"].map(c=>`<section class="course"><h2>${c==="2eso"?"2 ESO":"4 ESO"}</h2><div class="picks">${by(c).map(x=>`<button class="btn deckbtn" data-do="lp" data-k="${esc(x.k)}"><span class="e">🕵️</span><span>${esc(x.d.lp)}<br><small style="opacity:.7">${esc(x.d.ls)}</small></span></button>`).join("")}</div></section>`).join("")}</div>
      <p>${back()}<a class="btn ghost" href="host.html">🎮 Class games</a> <a class="btn ghost" href="../../teacher.html">← Dashboard</a></p></div></div>`;return}
  if(!H.L){app$.innerHTML=`<div class="center"><p>Loading the questions…</p></div>`;return}
  if(H.phase==="pick"||!H.g){const gs=(window.EL_GROUPS||[]).filter(g=>g.course===meta().course),n=H.L.pool.length,nx=H.L.pool.filter(q=>q.extra).length;
    app$.innerHTML=`<div class="center"><div><h1 class="logo pop">🕵️ Code Breakers</h1><p class="sub"><b>${esc(lpName())}</b> · ${esc(meta().ls||"")}<br>${H.games.map(d=>esc(d.title)).join(" + ")} · ${n} questions${nx?` (${nx} new ones first)`:""} · no theory</p>
      <p class="sub">Each student answers at their own pace. A right answer opens a file: 💾 bits, ⚡ double, 🛡️ firewall, 🦠 virus or 💻 hack (steal bits by cracking a player's password). Only the % right counts for their marks.</p>
      <div class="picks">${gs.map(g=>`<button class="btn go deckbtn" data-do="group" data-g="${g.id}">▶ ${esc(g.name)}</button>`).join("")}</div>
      <p>${back()}<button class="btn ghost" data-do="lps">← Other learning paths</button> <a class="btn ghost" href="host.html">🎮 Class games</a></p></div></div>`;return}
  const R=rankList();
  if(H.phase==="lobby"){
    app$.innerHTML=top()+`<div class="main"><div class="center" style="padding:0"><div style="width:100%"><h1 class="logo pop">🕵️ Code Breakers</h1>
      <div class="join"><div class="card">💻 Sign in on your Chromebook and <b>choose your secret password</b>.</div><div class="count">🕵️ ${R.length} player${R.length===1?"":"s"}</div></div>
      <div class="cbmins"><span>⏱ Time:</span>${MINS.map(m=>`<button class="btn${m===H.mins?" go":" ghost"}" data-do="mins" data-m="${m}">${m} min</button>`).join("")}<button class="btn go" data-do="go" style="font-size:1.2em">Start ▶</button></div>
      <div class="names">${R.map(p=>`<span>${esc(p.av)} ${esc(p.nm)} ${p.pw?"🔒":"<small>…</small>"}</span>`).join("")||'<span style="background:none;color:#fff;box-shadow:none;opacity:.8">Waiting for students…</span>'}</div></div></div></div>`;return}
  const t=totals(),mx=Math.max(1,...R.map(p=>p.s));
  const rows=R.slice(0,12).map((p,k)=>`<div class="cbrow"><span class="rk">${k+1}</span><span class="av">${esc(p.av)}</span><span class="nm">${esc(p.nm)}${p.sh>Date.now()?" 🛡️":""}</span><span class="trk"><i style="width:${Math.round(p.s/mx*100)}%"></i></span><span class="bt">${p.s}</span></div>`).join("");
  // the end screen is drawn once (late saves from the Chromebooks would restart the podium's animation); again only if the numbers change
  if(H.phase==="end"){const ek=H.sid+":"+R.map(p=>p.id+":"+p.s).join(",")+":"+t.n+":"+H.err+":"+endArm;if(ek===lastEnd&&app$.querySelector(".cbpod"))return;lastEnd=ek;
    const pod=[R[1],R[0],R[2]],cls=["p2","p1","p3"],medal=["🥈","🥇","🥉"];
    app$.innerHTML=top()+`<div class="main"><div class="center" style="padding:0"><div style="width:100%">
      <div style="display:flex;align-items:center;justify-content:center;gap:28px;flex-wrap:wrap">${t.n?G.ring(t.r/t.n*100,"the class got right","150px"):""}<div><h1 class="logo pop" style="margin:0">⏱ Time's up!</h1><p class="sub">${t.n} answers · ${t.r} right · every right answer is +1 point</p></div></div>
      <div class="podium cbpod"${R.length?"":" hidden"}>${pod.map((x,k)=>x?`<div class="${cls[k]} slidein" style="animation-delay:${[.8,1.6,0][k]}s"><span class="nm">${esc(x.av)} ${esc(x.nm)}<br><span class="sc">💾 ${x.s} bits</span></span><span class="blk">${medal[k]}</span></div>`:"<div></div>").join("")}</div>
      <p><button class="btn go" data-do="finish">Finish</button> <button class="btn ghost" data-do="again">Play again</button> <a class="btn ghost" href="results.html?g=${encodeURIComponent(H.g)}" target="_blank" rel="noopener">📊 Results</a> ${back()}</p></div></div></div>`;return}
  app$.innerHTML=top()+`<div class="main cbplay"><div class="cbhead"><div class="cbtime${left()<30e3?" low":""}" id="cbtime">⏱ ${fmt(left())}</div>
      <div class="cbstat"><b>${t.n}</b> answers · <b>${t.n?Math.round(t.r/t.n*100):0} %</b> right</div></div>
    <div class="cbcols"><div class="card cbrank">${rows||'<p class="muted">Nobody has bits yet…</p>'}</div>
      <div class="cbfeed">${H.feed.map((f,i)=>`<div class="cbev ${f.k}${i===0&&Date.now()-f.at<3000?" pop":""}">${f.h}</div>`).join("")||'<div class="cbev">💻 Hacks, viruses and firewalls show up here.</div>'}</div></div></div>`;
}
function drawTime(){const e=$("#cbtime");if(e){e.textContent="⏱ "+fmt(left());e.classList.toggle("low",left()<30e3)}}

let endArm=0,lastEnd="";
app$.addEventListener("click",async e=>{const b=e.target.closest("[data-do]");if(!b)return;const d=b.dataset.do;
  if(d==="signin"){try{const p=new A.GoogleAuthProvider();p.setCustomParameters({prompt:"select_account"});await A.signInWithPopup(auth,p)}catch(x){console.warn("sign in",x)}}
  if(d==="lp"){H.games=lpGames(b.dataset.k);history.replaceState(null,"","?lp="+encodeURIComponent(b.dataset.k));H.L=null;draw();await loadLP();draw()}
  if(d==="lps"){H.games=[];H.L=null;history.replaceState(null,"",location.pathname);draw()}
  if(d==="group")startGame(b.dataset.g);
  if(d==="mins"){H.mins=+b.dataset.m;keep();draw()}
  if(d==="go")go();
  if(d==="more")more();
  if(d==="mute"){G.sound(!G.sound());draw()}
  if(d==="end"){if(Date.now()-endArm<3000){endArm=0;if(H.phase==="play")finish();else endGame()}else{endArm=Date.now();draw();setTimeout(draw,3100)}}
  if(d==="finish")endGame();
  if(d==="again"){const g=H.g;endGame();startGame(g)}
  if(d==="cmback")backToClass();
});
addEventListener("keydown",e=>{if(e.key==="m"||e.key==="M"){G.sound(!G.sound());draw()}});
async function loadLP(){if(!H.games.length)return;const L=await CB.load(H.games.map(d=>d.id));L.byKey={};L.pool.forEach(q=>L.byKey[q.key]=q);H.L=L}

A.onAuthStateChanged(auth,async u=>{
  H.user=u;H.teacher=!!u&&TEACHERS.includes((u.email||"").toLowerCase());
  if(H.teacher&&H.games.length&&!H.L){draw();await loadLP()}
  if(H.teacher&&H.L&&H.g&&H.sid){if(H.phase==="lobby")G.music("lobby");else if(H.phase==="play")G.music("think");startGroup()}
  draw();
});
