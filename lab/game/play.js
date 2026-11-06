// The class game player (Roger, 26 Oct 2026), play.html: a student's screen. A signed-in student is brought here from any page when
// the teacher starts a game for their group (el-cloud.js, el-deck-points.js), with ?g={group}&from={the page they were on}. It follows
// live/{group} (written by the board, host.js) and shows only what the student needs: the question and its options as four coloured
// tiles; one tap is their answer (live/{group}/answers/{email}, firestore.rules: their own); once the teacher shows the answer, a green
// or red screen. A written question (q.write, Roger 30 Oct 2026) shows a box instead of the tiles: the student types the missing words
// and sends them once; the board checks them. No deck file is loaded here, so the answers are never on a student's device before the teacher shows them.
// Sounds only for the student's own taps and results; the music plays on the board.
import {initializeApp,getApps} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import * as A from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import * as S from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {CONFIG,DOMAINS,TEACHERS,TESTERS} from "../../shared/js/el-firebase.js";
import {signIn} from "../../shared/js/el-signin.js";

const G=window.ELGame,{esc,md,pic}=G;
const app=getApps()[0]||initializeApp(CONFIG),auth=A.getAuth(app),db=S.getFirestore(app);
const app$=document.getElementById("app");G.bg();
const P=new URLSearchParams(location.search),FROM=(P.get("from")||"").startsWith("/")?P.get("from"):new URL("../../today.html",location.href).pathname;
let user=null,group=(P.get("g")||"").replace(/[^\w-]/g,""),x=null,ref=null,mySid=0,mine={},tester=false,stop=null,shown="",draft={k:"",v:""};

const fresh=at=>{const ms=at&&(at.toMillis?at.toMillis():+at);return !!ms&&Date.now()-ms<10*60e3};
const gameOn=()=>!!(x&&x.game&&x.on&&fresh(x.at));
const score=()=>Object.entries((x&&x.keys)||{}).filter(([i,ok])=>Array.isArray(ok)?G.right(mine[i],ok):mine[i]===ok).length;
const first=()=>((user&&user.displayName)||"").split(" ")[0]||(user&&user.email||"").split("@")[0];

const top=()=>`<div class="top">${!gameOn()||x.phase==="end"?`<a class="btn go" href="${esc(FROM)}">← Back</a>`:""}<span class="pill">🎮 ${esc(x&&gameOn()?x.title:"Class game")}</span>${x&&gameOn()&&x.qt?`<span class="pill">✓ ${score()}</span>`:""}<span class="sp"></span>${user?`<span class="pill" title="${esc(user.email)}">👤 ${esc(first())}</span>`:""}
  <button class="btn ghost" data-do="mute" aria-label="Sound">${G.sound()?"🔊":"🔇"}</button></div>`;
const page=(h,cls)=>{app$.innerHTML=top()+`<div class="main"><div class="center ${cls||""}"><div>${h}</div></div></div>`};

function draw(){
  if(!user)return page(`<div class="card msg pop"><h2>🎮 Class game</h2><p>Sign in with your school email and password to join the game.<br><span class="note">Entra amb el correu de l'institut i la contrasenya.</span></p><p><button class="btn go" data-do="signin">Sign in · Entra</button></p></div>`);
  if(TEACHERS.includes((user.email||"").toLowerCase()))return page(`<div class="card msg pop"><h2>🎮 Class game</h2><p>This is the students' screen. The game starts from the board.</p><p><a class="btn go" href="host.html">Open the board</a></p></div>`);
  if(!group)return page(`<div class="card msg pop"><h2>🎮 Class game</h2><p>You are not on a class list yet. Ask your teacher.</p></div>`);
  if(!gameOn())return page(`<div class="emo pop">⏳</div><p class="big">${x&&x.game&&x.phase==="end"?"The game is over":"Waiting for your teacher…"}</p><p class="mid">The game opens here by itself.</p>`);
  const ph=x.phase,i=String(x.i),q=x.q||{},n=(q.opts||[]).length;
  if(ph==="lobby")return page(`<div class="emo pop">🎉</div><p class="big">You're in, ${esc(first())}!</p><p class="mid">Look for your name on the board.</p>`);
  if(ph==="theory")return page(`<div class="emo pop">${pic(x.th&&x.th.img)||"👀"}</div><p class="big">Look at the board</p><p class="mid">${md(x.th&&x.th.title)}</p>`);
  if(ph==="end"){const s=score(),t=x.qt||0;
    if(shown!==x.sid+":end"){shown=x.sid+":end";G.fx("fanfare");if(s>0)G.confetti()}
    return page(`<div class="emo pop">${s>=t*.8?"🏆":s>=t/2?"⭐":"💪"}</div><p class="big">You got ${s} / ${t} right</p><p class="mid">+${s} point${s===1?"":"s"} · Well done!</p>`)}
  if(ph==="q"&&q.write&&mine[i]==null){const k=x.sid+":"+i,v=draft.k===k?draft.v:"";
    app$.innerHTML=top()+`<div class="main"><div class="card qcard slidein">${md(q.text)}</div>
      <form class="wform slidein" data-k="${esc(k)}"><label for="wa">✏️ Write the missing words <span class="note">Escriu només les paraules que falten</span></label>
        <input id="wa" type="text" maxlength="60" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" value="${esc(v)}">
        <button class="btn go" type="submit">Send ✓</button></form></div>`;
    const inp=document.getElementById("wa");inp.focus();inp.setSelectionRange(v.length,v.length);return}
  if(ph==="q"&&q.write){
    return page(`<span class="chosen typed pop">${esc(mine[i])}</span><p class="big">Answer sent!</p><p class="mid dots"><span></span><span></span><span></span></p><p class="mid">Wait for the others.</p>`)}
  if(ph==="q"&&mine[i]==null){
    app$.innerHTML=top()+`<div class="main"><div class="card qcard slidein">${md(q.text)}</div>
      <div class="tiles${n===2?" two":""}">${(q.opts||[]).map((o,k)=>`<button class="tile t${k}" data-v="${k}"><span class="shp s${k}"></span><span class="tx">${md(o)}</span></button>`).join("")}</div></div>`;return}
  if(ph==="q"){const k=mine[i];
    return page(`<span class="chosen pop" style="background:var(--c${k})"><span class="shp s${k}"></span>${md((q.opts||[])[k])}</span><p class="big">Answer sent!</p><p class="mid dots"><span></span><span></span><span></span></p><p class="mid">Wait for the others.</p>`)}
  if(ph==="reveal"&&q.write){const k=mine[i],right=G.right(k,(x.keys||{})[i]),key=x.sid+":"+i;
    if(shown!==key){shown=key;G.fx(k==null?"":right?"right":"wrong")}
    app$.innerHTML=top()+`<div class="res ${k==null?"none":right?"ok":"no"}"><div class="pop"><div class="mark">${k==null?"⏰":right?"✓":"✗"}</div>
      <p class="big">${k==null?"No answer":right?"Correct! +1":"Not this time"}</p>
      ${right?"":`${k==null?"":`<p class="mid">You wrote: <s>${esc(k)}</s></p>`}<p class="mid">The answer: <b>${esc(x.ok)}</b></p>`}<p class="mid">Look at the board.</p></div></div>`;return}
  if(ph==="reveal"){const k=mine[i],ok=x.ok,right=k===ok,key=x.sid+":"+i;
    if(shown!==key){shown=key;G.fx(k==null?"":right?"right":"wrong")}
    app$.innerHTML=top()+`<div class="res ${k==null?"none":right?"ok":"no"}"><div class="pop"><div class="mark">${k==null?"⏰":right?"✓":"✗"}</div>
      <p class="big">${k==null?"No answer":right?"Correct! +1":"Not this time"}</p>
      ${right?"":`<p class="mid">The answer: <b>${md((q.opts||[])[ok])}</b></p>`}<p class="mid">Look at the board.</p></div></div>`;return}
  page(`<p class="big">Look at the board</p>`);
}

function send(v){   // a written answer, once
  if(!gameOn()||x.phase!=="q"||!(x.q&&x.q.write))return;const i=String(x.i);v=String(v||"").replace(/\s+/g," ").trim().slice(0,60);
  if(!v||mine[i]!=null)return;
  mine[i]=v;draft={k:"",v:""};G.fx("tap");draw();
  if(ref&&mySid===x.sid)S.setDoc(ref,{sid:x.sid,a:{[i]:v},at:S.serverTimestamp()},{merge:true}).catch(err=>console.warn("answer",err));
}
app$.addEventListener("submit",e=>{e.preventDefault();const f=e.target.closest(".wform");if(f)send(f.querySelector("input").value)});
app$.addEventListener("input",e=>{const f=e.target.closest(".wform");if(f)draft={k:f.dataset.k,v:e.target.value}});   // a redraw keeps what they typed
app$.addEventListener("click",async e=>{
  const t=e.target.closest(".tile[data-v]");
  if(t&&gameOn()&&x.phase==="q"){const i=String(x.i),v=+t.dataset.v;if(mine[i]!=null)return;
    mine[i]=v;G.fx("tap");draw();
    if(ref&&mySid===x.sid)S.setDoc(ref,{sid:x.sid,a:{[i]:v},at:S.serverTimestamp()},{merge:true}).catch(err=>console.warn("answer",err));
    return}
  const b=e.target.closest("[data-do]");if(!b)return;
  if(b.dataset.do==="mute"){G.sound(!G.sound());draw()}
  if(b.dataset.do==="signin"){try{await signIn({auth,A,domain:DOMAINS[0]})}catch(err){console.warn("sign in",err)}}
});

// A new game: start with no answers; the same game again (a reload): keep mine.
async function join(){
  if(!ref||!gameOn()||x.sid===mySid||join.busy===x.sid)return;const sid=join.busy=x.sid;
  try{const d=await S.getDoc(ref);
    if(d.exists()&&d.data().sid===sid)mine=Object.assign({},d.data().a);
    else{mine={};await S.setDoc(ref,{sid,a:{},at:S.serverTimestamp()})}
  }catch(e){console.warn("join",e);mine={}}
  if(join.busy===sid){mySid=sid;draw()}
}

A.onAuthStateChanged(auth,async u=>{
  user=u;if(stop)stop();stop=null;ref=null;mySid=0;mine={};x=null;
  if(!u||TEACHERS.includes((u.email||"").toLowerCase()))return draw();
  const em=(u.email||"").toLowerCase();tester=TESTERS.includes(em);
  if(!group){try{const r=await S.getDoc(S.doc(db,"roster",em));group=(r.exists()&&r.data().group||(tester&&localStorage.getItem("el_view"))||"").replace(/[^\w-]/g,"")}catch(e){console.warn("roster",e)}}
  if(!group)return draw();
  ref=S.doc(db,"live",group,"answers",em);
  stop=S.onSnapshot(S.doc(db,"live",group),s=>{x=s.exists()?s.data():null;if(gameOn()&&x.sid!==mySid){mine={};join()}draw()},e=>{console.warn("live",e);draw()});
  draw();
});
let wasOn=false;setInterval(()=>{if(x&&gameOn()!==wasOn)draw();wasOn=gameOn()},30e3);   // the board stopped sending (closed): back to waiting

// ⛶ Full screen in the game (Roger, 6 Nov 2026: "when they are playing a game, I want them to be in full screen too"): while a game is on
// (lobby to the last question), the player is covered until the student taps it (a browser only goes full screen after a tap), then
// Esc is locked (Chrome and Chromebooks: Keyboard Lock, only holding Esc down leaves). Leaving full screen brings the cover back and
// writes live/{group}/fsLeft/{email} = {name, at, pull, n} (pull = the group's full screen fs.at when it is on, else this game's sid),
// the same list as the dashboard's; the board shows it too. Not for the teacher, not on iPhones (no full screen for pages there).
// Catalan only for Starter and Base: ?ca=1 (el-cloud.js knows the level), ?ca=0 English, none (another page brought them here) both.
const FD=document,FE=FD.documentElement,CA=P.get("ca");
const T=(en,ca)=>CA==="1"?ca:CA==="0"?en:en+" · "+ca;
const fsCan=()=>!!(FD.fullscreenEnabled||FD.webkitFullscreenEnabled),fsIs=()=>!!(FD.fullscreenElement||FD.webkitFullscreenElement);
const isT=()=>!!user&&TEACHERS.includes((user.email||"").toLowerCase());
const fsOnG=f=>!!(f&&f.on&&f.at&&Date.now()<(f.until||f.at+70*60e3));
const pullKey=()=>fsOnG(x&&x.fs)?x.fs.at:x&&x.sid;
const ss=(k,v)=>{try{if(v===undefined)return sessionStorage.getItem(k);sessionStorage.setItem(k,v)}catch(e){return null}};
let fsWas=false,bye=false;addEventListener("beforeunload",()=>{bye=true});addEventListener("pagehide",()=>{bye=true});   // ← Back: not leaving
const fsWanted=()=>!!(user&&group&&!isT()&&gameOn()&&x.phase!=="end"&&fsCan());
function fsLeft(){const pk=pullKey();if(!pk)return;const k="el_fs_"+pk+"_n",n=(+ss(k)||0)+1;ss(k,String(n));
  S.setDoc(S.doc(db,"live",group,"fsLeft",(user.email||"").toLowerCase()),{name:user.displayName||user.email||"",at:S.serverTimestamp(),pull:pk,n},{merge:true}).catch(e=>console.warn("full screen",e))}
function fsGo(){try{const lk=()=>{try{if(navigator.keyboard&&navigator.keyboard.lock)navigator.keyboard.lock(["Escape"]).catch(()=>{})}catch(e){}},
  r=(FE.requestFullscreen||FE.webkitRequestFullscreen).call(FE);if(r&&r.then)r.then(()=>{lk();fsCheck()},()=>{});else{lk();fsCheck()}}catch(e){}}
function fsCheck(){let c=document.getElementById("el-fs");
  if(!fsWanted()){if(c)c.remove();if(fsWas){fsWas=false;try{if(navigator.keyboard&&navigator.keyboard.unlock)navigator.keyboard.unlock()}catch(e){}
    try{if(fsIs())(FD.exitFullscreen||FD.webkitExitFullscreen).call(FD)}catch(e){}}return}
  if(fsIs()){if(c)c.remove();fsWas=true;return}
  const left=fsWas;if(left){fsWas=false;setTimeout(()=>{if(!bye)fsLeft()},500)}
  const again=left||(+ss("el_fs_"+pullKey()+"_n")||0)>0;
  if(!c){c=document.createElement("div");c.id="el-fs";c.setAttribute("role","button");
    c.style.cssText="position:fixed;inset:0;z-index:50;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:24px;text-align:center;background:#3d1d8f;color:#fff;cursor:pointer";
    c.onclick=fsGo;document.body.append(c)}
  const h=(again?T("You left full screen. Your teacher can see it.","Has sortit de la pantalla completa. El professor ho veu."):T("The game is in full screen.","El joc és a pantalla completa."))
    +"|"+(again?T("Tap to go back to the game","Toca per tornar al joc"):T("Tap to join the game","Toca per entrar al joc"));
  if(c.dataset.h!==h){c.dataset.h=h;const [a,b]=h.split("|");c.innerHTML='<div class="emo pop">'+(again?"⛶":"🎮")+'</div><p class="big" style="max-width:760px"></p><span class="btn go"></span>';
    c.children[1].textContent=a;c.children[2].textContent=b+" →"}}
FD.addEventListener("fullscreenchange",()=>fsCheck());FD.addEventListener("webkitfullscreenchange",()=>fsCheck());
// 📴 Connected (Roger, 6 Nov 2026: "if they disconnect, the teacher's board shows it"): during a game the player beats
// live/{group}/here/{email} = {name, seen, off} once a minute, and off:true at once when the page is hidden (lid closed, another window).
// The board and the dashboard list who stopped beating (elClassWatch in el-catalog.js, host.js).
let beatAt=0,beatSid=0;
function beat(off){if(!user||!group||isT())return;beatAt=Date.now();
  S.setDoc(S.doc(db,"live",group,"here",(user.email||"").toLowerCase()),{name:user.displayName||user.email||"",seen:S.serverTimestamp(),off:!!off,fs:!fsWanted()||fsIs()}).catch(e=>console.warn("here",e))}
let okWas=null;   // in or out of full screen: sent at once when it changes
document.addEventListener("visibilitychange",()=>{if(!gameOn()||x.phase==="end")return;if(document.visibilityState==="hidden"){if(!bye)beat(true)}else beat(false)});
function hereTick(){if(!gameOn()||x.phase==="end"||document.visibilityState!=="visible")return;
  const ok=!fsWanted()||fsIs(),ch=okWas!==null&&ok!==okWas;okWas=ok;
  if(ch||x.sid!==beatSid||Date.now()-beatAt>=60e3){beatSid=x.sid;beat(false)}}
setInterval(()=>{fsCheck();hereTick()},1000);FD.addEventListener("fullscreenchange",hereTick);FD.addEventListener("webkitfullscreenchange",hereTick);
