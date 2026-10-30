// The class game board (Roger, 26 Oct 2026), host.html: the teacher's screen on the projector. Signed in with the teacher's account:
// choose a game (decks/index.js) and a group. From then on the board publishes the game in live/{group} (firestore.rules: only the teacher
// writes it, the group's students read it), and every signed-in student of the group is taken into the player (play.html) from any page
// (el-cloud.js, el-deck-points.js). The student's device only ever gets the question and the options in the shown order; the right one
// arrives once the teacher shows it. Students answer in live/{group}/answers/{email} = {sid, a:{slide: option}, at} (rules: their own).
// A written question (deck {q, write:[accepted answers]}, Roger 30 Oct 2026): students type the missing words instead (a:{slide: text});
// the board checks them with ELGame.norm when it shows the answer, and shows the wrong answers (no names) to talk about them.
// When the answer is shown, every student who tapped the right one gets +1 in points/{email}.{term} and the group's best goes to
// teams/{group}.best.{term}, the same points as the class presentations (el-points.js: bonus up to +0.5, in proportion to the best).
//   live/{group} = {on, game:true, deck, title, sid, at, phase: lobby | theory | q | reveal | end, i, qn, qt,
//                   keys:{slide: right option | [accepted answers, normalised] for a written one},
//                   q:{text, img, opts} (a question) or q:{text, img, write:true} (a written one), th:{title, img} (a theory slide),
//                   ok (once shown: the right option, or the answer to show for a written one)}
// The board keeps its place in this tab (sessionStorage), so a reload goes on with the same game.
import {initializeApp,getApps} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import * as A from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import * as S from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {CONFIG,TEACHERS} from "../../shared/js/el-firebase.js";

const G=window.ELGame,{esc,md,pic}=G,$=s=>document.querySelector(s);
const app=getApps()[0]||initializeApp(CONFIG),auth=A.getAuth(app),db=S.getFirestore(app);
const app$=$("#app");G.bg();
const URLP=new URLSearchParams(location.search);
const tab={get(){try{return JSON.parse(sessionStorage.getItem("elGame")||"null")}catch(e){return null}},set(v){try{sessionStorage.setItem("elGame",JSON.stringify(v))}catch(e){}}};

// H: the game on this board. deckId, deck (the deck file's content), g (group), sid (this game: the time it started), i (slide; -1 lobby),
// phase, keys {slide: right option, in the shown order}, aw {slide: [emails that got the point]}. names {email: "First S."} (student list),
// pts {email: points this term} for the group's best, players {email: answers} of this game.
const H={user:null,teacher:false,deckId:URLP.get("deck")||"",deck:null,g:"",sid:0,i:-1,phase:"pick",keys:{},aw:{},names:{},pts:{},players:{},term:elTerm(),err:""};
const saved=tab.get();
if(saved&&saved.sid&&Date.now()-saved.sid<4*3600e3&&(!H.deckId||H.deckId===saved.deckId))Object.assign(H,{deckId:saved.deckId,g:saved.g,sid:saved.sid,i:saved.i,phase:saved.phase,keys:saved.keys||{},aw:saved.aw||{}});
const keep=()=>tab.set(H.sid?{deckId:H.deckId,g:H.g,sid:H.sid,i:H.i,phase:H.phase,keys:H.keys,aw:H.aw}:null);

const slides=()=>H.deck?H.deck.slides:[];
const cur=()=>slides()[H.i];
const isQ=s=>!!(s&&s.q);
const isW=s=>!!(s&&s.q&&s.write);   // a written question
const accepted=i=>slides()[i].write.map(G.norm);
const qList=()=>slides().map((s,i)=>isQ(s)?i:-1).filter(i=>i>=0);
const order=i=>{const s=slides()[i];return s.keep?[...s.options.keys()]:G.shuffle(s.options.length,H.sid+i*7919)};   // order[k] = the deck's option shown k-th
const okAt=i=>order(i).indexOf(0);   // the deck's first option is the right one
const answered=i=>Object.values(H.players).filter(a=>a[i]!=null);
const groupName=g=>((window.EL_GROUPS||[]).find(x=>x.id===g)||{}).name||g;
const nameOf=em=>H.names[em]||em.split("@")[0];

/* ---------- the deck file ---------- */
// A deck is loaded only for the teacher, so nothing on a student's device ever loads the answers.
window.ELGameDeck=d=>{H.deck=d};
function loadDeck(id){
  return new Promise(res=>{if(!/^[\w-]+$/.test(id))return res(false);H.deck=null;
    const s=document.createElement("script");s.src=`decks/${id}.js`;s.onload=()=>res(!!H.deck);s.onerror=()=>res(false);document.head.append(s)});
}

/* ---------- Firebase ---------- */
let liveBeat=null,ansStop=null;
function live(){
  if(!H.g||!H.sid||!H.deck)return;
  const s=cur(),qs=qList(),base={on:true,game:true,deck:location.pathname,title:H.deck.title,sid:H.sid,phase:H.phase==="show"?(isQ(s)?"q":"theory"):H.phase,
    i:H.i,qn:qs.indexOf(H.i)+1,qt:qs.length,keys:H.keys,at:S.serverTimestamp()};
  if(s&&H.phase!=="end"&&H.phase!=="lobby"){
    if(isW(s))base.q={text:s.q,img:s.img||"",write:true};
    else if(isQ(s))base.q={text:s.q,img:s.img||"",opts:order(H.i).map(k=>s.options[k])};else base.th={title:s.theory||"",img:s.img||""};
    if(H.phase==="reveal")base.ok=isW(s)?s.write[0]:okAt(H.i);
  }
  S.setDoc(S.doc(db,"live",H.g),base).catch(e=>{console.warn("live",e);H.err="⚠ The students can't see the game: "+e.message;draw()});
}
function liveOff(g){if(g)S.setDoc(S.doc(db,"live",g),{on:false,at:S.serverTimestamp()},{merge:true}).catch(e=>console.warn("live",e))}
addEventListener("pagehide",()=>{if(H.g&&H.sid&&H.teacher)liveOff(H.g)});   // a reload puts it back on at once (the tab keeps the game)

async function startGroup(){
  const g=H.g;H.err="";H.players={};
  try{
    const [ro,pt]=await Promise.all([S.getDocs(S.query(S.collection(db,"roster"),S.where("group","==",g))),S.getDocs(S.collection(db,"points"))]);
    const names={},keys=new Set();
    ro.forEach(d=>{const x=d.data();keys.add(d.id);names[d.id]=(x.first||d.id.split("@")[0])+(x.surname1?" "+x.surname1[0]+".":"")});
    const pts={};pt.forEach(d=>{if(keys.has(d.id))pts[d.id]=+d.data()[H.term]||0});
    Object.assign(H,{names,pts});
  }catch(e){console.warn("game",e);H.err="⚠ Could not read the group: "+e.message}
  if(ansStop)ansStop();
  ansStop=S.onSnapshot(S.collection(db,"live",g,"answers"),qs=>{
    const before=Object.keys(H.players).length,P={};
    qs.forEach(d=>{const x=d.data();if(x.sid===H.sid)P[d.id]=x.a||{}});
    H.players=P;if(H.phase==="lobby"&&Object.keys(P).length>before)G.fx("join");
    draw();autoReveal();
  },e=>{console.warn("answers",e);H.err="⚠ Could not read the answers: "+e.message;draw()});
  clearInterval(liveBeat);liveBeat=setInterval(live,60e3);   // every minute too: the students' devices know the game is still on
  live();draw();
}
// The answer is shown: everyone who tapped the right one (or wrote an accepted answer) gets +1 (once per slide and game; late taps after this don't count).
async function award(i){
  if(H.aw[i])return;const w=isW(slides()[i]),ok=w?accepted(i):okAt(i),hit=Object.entries(H.players).filter(([,a])=>w?G.right(a[i],ok):a[i]===ok).map(([em])=>em);
  H.aw[i]=hit;H.keys[i]=ok;keep();
  if(!hit.length)return;
  hit.forEach(em=>H.pts[em]=(H.pts[em]||0)+1);
  const best=Math.max(0,...Object.keys(H.names).map(em=>H.pts[em]||0));   // students on the list only: a tester's points never set the best
  try{const w=S.writeBatch(db),now=S.serverTimestamp();
    hit.forEach(em=>w.set(S.doc(db,"points",em),{[H.term]:S.increment(1),updated:now},{merge:true}));
    w.set(S.doc(db,"teams",H.g),{best:{[H.term]:best},updated:now},{merge:true});
    await w.commit();
  }catch(e){console.warn("points",e);H.err="⚠ Points not saved: "+e.message;draw()}
}
let autoT=null;
function autoReveal(){   // like a Kahoot: once everyone who joined has answered, the answer shows by itself
  clearTimeout(autoT);
  if(H.phase!=="show"||!isQ(cur()))return;const n=Object.keys(H.players).length;
  if(n&&answered(H.i).length>=n)autoT=setTimeout(()=>{if(H.phase==="show"&&answered(H.i).length>=Object.keys(H.players).length)go("reveal")},900);
}

/* ---------- moving through the game ---------- */
function go(to){
  if(to==="reveal"){H.phase="reveal";award(H.i);G.music("");G.fx("reveal");setTimeout(()=>G.fx(H.aw[H.i]&&H.aw[H.i].length?"right":"wrong"),700)}
  else if(to==="next"){
    if(H.i+1>=slides().length){H.phase="end";G.music("");G.fx("drum");setTimeout(()=>{G.fx("fanfare");G.confetti()},1700)}
    else{H.i++;H.phase="show";G.fx("next");G.music(isQ(cur())?"think":"")}
  }
  keep();live();draw();autoReveal();
}
function primary(){
  if(H.phase==="lobby")go("next");
  else if(H.phase==="show")isQ(cur())?go("reveal"):go("next");
  else if(H.phase==="reveal")go("next");
}
addEventListener("keydown",e=>{if(e.target.closest&&e.target.closest("input,select,textarea"))return;
  if([" ","Enter","ArrowRight","PageDown"].includes(e.key)){e.preventDefault();primary()}
  if(e.key==="m"||e.key==="M"){G.sound(!G.sound());draw()}});

function startGame(g){
  H.g=g;H.sid=Date.now();H.i=-1;H.phase="lobby";H.keys={};H.aw={};keep();G.music("lobby");startGroup();
}
function endGame(){
  const g=H.g;liveOff(g);if(ansStop)ansStop();ansStop=null;clearInterval(liveBeat);G.music("");
  Object.assign(H,{g:"",sid:0,i:-1,phase:"pick",keys:{},aw:{},players:{}});keep();draw();
}

/* ---------- screens ---------- */
const top=()=>{const qs=qList(),qn=qs.indexOf(H.i)+1;
  return `<div class="top"><span class="pill">📡 ${esc(groupName(H.g))}</span><span class="pill">🎮 ${Object.keys(H.players).length}</span>
  ${H.i>=0&&H.phase!=="end"?`<span class="pill">${qn?`${isW(cur())?"✏️ ":""}Question ${qn} / ${qs.length}`:"Theory"}</span>`:""}<span class="sp"></span>
  ${H.err?`<span class="pill" style="background:#b3261e">${esc(H.err)}</span>`:""}
  <button class="btn ghost" data-do="mute" title="Music and sounds (M)">${G.sound()?"🔊":"🔇"}</button>
  <button class="btn ghost" data-do="end" title="End the game for everyone">■ End</button></div>`};
const tiles=(s,i,reveal)=>{const o=order(i),ok=okAt(i);
  return `<div class="tiles">${o.map((k,n)=>`<div class="tile t${n}${reveal&&n!==ok?" dim":""}"><span class="shp s${n}"></span><span class="tx">${md(s.options[k])}</span>${reveal&&n===ok?'<span class="mark">✓</span>':""}</div>`).join("")}</div>`};

function draw(){
  if(!H.user){app$.innerHTML=`<div class="center"><div class="card msg pop"><h2>🎮 Class game</h2><p>This is the teacher's board. Sign in with the teacher's account to start a game.</p><p><button class="btn go" data-do="signin">Sign in with Google</button></p></div></div>`;return}
  if(!H.teacher){app$.innerHTML=`<div class="center"><div class="card msg pop"><h2>🎮 Class game</h2><p>This is the teacher's board. When your teacher starts a game, it opens by itself on your screen.</p><p><a class="btn go" href="play.html">Go to the game screen</a> <button class="btn" data-do="signout">Sign out</button></p></div></div>`;return}
  if(!H.deck){
    const list=window.EL_GAMES||[];
    app$.innerHTML=`<div class="center"><div><h1 class="logo pop">🎮 Class game</h1><p class="sub">Choose a game.</p><div class="picks">${list.map(d=>`<button class="btn deckbtn slidein" data-do="deck" data-id="${esc(d.id)}"><span class="e">${esc(d.emoji||"🎮")}</span><span>${esc(d.title)}<br><small style="opacity:.7">${esc(d.course==="2eso"?"2 ESO":"4 ESO")}${d.ls?" · "+esc(d.ls):""}</small></span></button>`).join("")||"<p>No games yet.</p>"}</div><p><a class="btn ghost" href="../../teacher.html">← Dashboard</a></p></div></div>`;return}
  if(H.phase==="pick"||!H.g){
    const course=H.deck.course||((window.EL_GAMES||[]).find(d=>d.id===H.deckId)||{}).course,gs=(window.EL_GROUPS||[]).filter(g=>!course||g.course===course);   // the game's course (decks/index.js)
    app$.innerHTML=`<div class="center"><div><h1 class="logo pop">${esc(H.deck.title)}</h1><p class="sub">${slides().length} slides · ${qList().length} questions. Start the game for a group: its students are taken into it.</p>
      <div class="picks">${gs.map(g=>`<button class="btn go deckbtn" data-do="group" data-g="${g.id}">▶ ${esc(g.name)}</button>`).join("")}</div>
      <p><button class="btn ghost" data-do="decks">← Other games</button> <a class="btn ghost" href="../../teacher.html${course?"?course="+course:""}">← Dashboard</a></p></div></div>`;return}
  const s=cur(),P=Object.keys(H.players);
  if(H.phase==="lobby"){
    app$.innerHTML=top()+`<div class="main"><div class="center" style="padding:0"><div style="width:100%">
      <h1 class="logo pop">${esc(H.deck.title)}</h1>
      <div class="join"><div class="card">💻 Sign in on your Chromebook: the game opens by itself.</div><div class="count">🎮 ${P.length} player${P.length===1?"":"s"}</div>
        <button class="btn go" data-do="next" style="font-size:1.2em">Start ▶</button></div>
      <div class="names">${P.sort((a,b)=>nameOf(a).localeCompare(nameOf(b))).map(em=>`<span${seen.has(em)?"":' class="pop"'}>${esc(nameOf(em))}</span>`).join("")||'<span style="background:none;color:#fff;box-shadow:none;opacity:.8">Waiting for students…</span>'}</div>
    </div></div></div>`;P.forEach(em=>seen.add(em));return}
  if(H.phase==="end"){
    const score=em=>Object.values(H.aw).filter(l=>l.includes(em)).length,qs=qList().length;
    const rank=P.map(em=>({em,n:score(em)})).filter(x=>x.n>0).sort((a,b)=>b.n-a.n||nameOf(a.em).localeCompare(nameOf(b.em))).slice(0,3);
    const tot=P.length*qs,right=P.reduce((t,em)=>t+score(em),0),pod=[rank[1],rank[0],rank[2]],cls=["p2","p1","p3"],medal=["🥈","🥇","🥉"];
    app$.innerHTML=top()+`<div class="main"><div class="center" style="padding:0"><div style="width:100%">
      <h1 class="logo pop">🏁 Well done!</h1><p class="sub">${tot?`The class got <b>${Math.round(right/tot*100)} %</b> right.`:""} Every right answer is +1 point.</p>
      ${rank.length?"":`<p class="card msg" style="margin:1em auto">No right answers this time. Next time!</p>`}<div class="podium"${rank.length?"":" hidden"}>${pod.map((x,k)=>x?`<div class="${cls[k]} slidein" style="animation-delay:${[.8,1.6,0][k]}s"><span class="nm">${esc(nameOf(x.em))}<br><span class="sc">${x.n} right</span></span><span class="blk">${medal[k]}</span></div>`:"<div></div>").join("")}</div>
      <p><button class="btn go" data-do="finish">Finish</button> <button class="btn ghost" data-do="again">Play again</button></p></div></div></div>`;return}
  if(!isQ(s)){
    app$.innerHTML=top()+`<div class="main"><div class="card theory slidein"><div class="pic">${pic(s.img)}</div><div><h2>${md(s.theory)}</h2>${(s.lines||[]).map(l=>`<p>${md(l)}</p>`).join("")}</div></div>
      <div style="text-align:right"><button class="btn go" data-do="next">Next ▶<span class="kbd">Space</span></button></div></div>`;return}
  const rev=H.phase==="reveal",n=answered(H.i).length;
  if(isW(s)){
    const ok=accepted(H.i),wrong={};
    answered(H.i).forEach(a=>{if(!G.right(a[H.i],ok)){const t=G.norm(a[H.i]);wrong[t]=(wrong[t]||0)+1}});
    const top6=Object.entries(wrong).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,6);
    const also=s.write.slice(1).filter(t=>!t.startsWith("'"));   // other full forms (a contraction alone like 's cheering is accepted, not shown)
    app$.innerHTML=top()+`<div class="main"><div class="card qcard slidein">${md(s.q)}</div><div class="mid">
      <div class="stat">${rev?`<b>${(H.aw[H.i]||[]).length}</b>right`:`<b>${n}</b>answer${n===1?"":"s"}${P.length?` / ${P.length}`:""}`}</div><div class="pic pop">${pic(s.img)}</div>
      <div style="text-align:center">${rev?`<button class="btn go" data-do="next">Next ▶<span class="kbd">Space</span></button>`:`<button class="btn go" data-do="reveal">Show answer<span class="kbd">Space</span></button>`}</div></div>
      ${rev&&s.why?`<div class="card why pop">💡 ${md(s.why)}</div>`:""}
      ${rev?`<div class="wans pop"><span class="mark">✓</span><span>${esc(s.write[0])}${also.length?`<small>also: ${also.map(esc).join(" · ")}</small>`:""}</span></div>
        ${top6.length?`<div class="wrongs"><span>Wrong answers:</span>${top6.map(([t,c])=>`<span class="w">${esc(t||"…")}${c>1?` <b>×${c}</b>`:""}</span>`).join("")}</div>`:""}`
      :`<div class="wask">✏️ Write the missing words on your Chromebook</div>`}</div>`;
    return}
  const o=order(H.i),ok=okAt(H.i);
  let middle;
  if(rev){const c=o.map((_,k)=>answered(H.i).filter(a=>a[H.i]===k).length),mx=Math.max(1,...c);
    middle=`<div class="stat"><b>${(H.aw[H.i]||[]).length}</b>right</div>
      <div class="bars">${c.map((v,k)=>`<div class="bar"><i style="height:${Math.round(v/mx*80)+4}%;background:var(--c${k});${k===ok?"":"opacity:.45"}"></i><span><span class="shp s${k}" style="font-size:.8em"></span>${v}${k===ok?" ✓":""}</span></div>`).join("")}</div>
      <div style="text-align:center"><button class="btn go" data-do="next">Next ▶<span class="kbd">Space</span></button></div>`}
  else middle=`<div class="stat"><b>${n}</b>answer${n===1?"":"s"}${P.length?` / ${P.length}`:""}</div><div class="pic pop">${pic(s.img)}</div>
      <div style="text-align:center"><button class="btn go" data-do="reveal">Show answer<span class="kbd">Space</span></button></div>`;
  app$.innerHTML=top()+`<div class="main"><div class="card qcard slidein">${md(s.q)}</div><div class="mid">${middle}</div>
    ${rev&&s.why?`<div class="card why pop">💡 ${md(s.why)}</div>`:""}${tiles(s,H.i,rev)}</div>`;
}

let endArm=0;
const seen=new Set();   // names already on the lobby (only a new one pops in)
app$.addEventListener("click",async e=>{
  const b=e.target.closest("[data-do]");if(!b)return;const d=b.dataset.do;
  if(d==="signin"){try{const p=new A.GoogleAuthProvider();p.setCustomParameters({prompt:"select_account"});await A.signInWithPopup(auth,p)}catch(x){console.warn("sign in",x)}}
  if(d==="signout")A.signOut(auth);
  if(d==="deck"){H.deckId=b.dataset.id;history.replaceState(null,"","?deck="+encodeURIComponent(H.deckId));if(!await loadDeck(H.deckId))H.err="Could not load the game.";draw()}
  if(d==="decks"){H.deck=null;H.deckId="";history.replaceState(null,"",location.pathname);draw()}
  if(d==="group")startGame(b.dataset.g);
  if(d==="next")go("next");
  if(d==="reveal")go("reveal");
  if(d==="mute"){G.sound(!G.sound());draw()}
  if(d==="end"){if(Date.now()-endArm<3000)endGame();else{endArm=Date.now();b.textContent="Tap again to end";setTimeout(()=>{if(b.isConnected)b.textContent="■ End"},3000)}}
  if(d==="finish")endGame();
  if(d==="again"){const g=H.g;startGame(g)}
});

A.onAuthStateChanged(auth,async u=>{
  H.user=u;H.teacher=!!u&&TEACHERS.includes((u.email||"").toLowerCase());
  if(H.teacher&&H.deckId&&!H.deck&&!await loadDeck(H.deckId)){H.deckId="";H.phase="pick";H.g="";H.sid=0;keep()}
  if(H.teacher&&H.deck&&H.g&&H.sid){if(H.phase==="lobby")G.music("lobby");else if(H.phase==="show"&&isQ(cur()))G.music("think");startGroup()}
  draw();
});
