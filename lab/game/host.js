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
// The Learning Path the teacher came from (Roger, 30 Oct 2026): ?from= on the page's Start button, else the page that linked here
// (not the dashboard, which has its own button). Kept in this tab, so it survives choosing another game, a reload and the end.
const BACK=(()=>{
  const lp=u=>{try{const x=new URL(u,location.href);return x.origin===location.origin&&!/\/lab\/game\//.test(x.pathname)&&!/\/teacher\.html$/.test(x.pathname)?x.pathname+x.search:""}catch(e){return ""}};
  const fromDash=/\/teacher\.html/.test(document.referrer);
  let b=lp(URLP.get("from")||"")||(fromDash?"":lp(document.referrer));
  try{if(b||fromDash)sessionStorage.setItem("elGameBack",b);else b=sessionStorage.getItem("elGameBack")||""}catch(e){}
  return b})();
const backBtn=()=>BACK?`<a class="btn ghost" href="${esc(BACK)}">← Learning Path</a> `:"";
const tab={get(){try{return JSON.parse(sessionStorage.getItem("elGame")||"null")}catch(e){return null}},set(v){try{sessionStorage.setItem("elGame",JSON.stringify(v))}catch(e){}}};

// H: the game on this board. deckId, deck (the deck file's content), g (group), sid (this game: the time it started), i (slide; -1 lobby),
// phase, keys {slide: right option, in the shown order}, aw {slide: [emails that got the point]}. names {email: "First S."} (student list),
// pts {email: points this term} for the group's best, players {email: answers} of this game.
const H={user:null,teacher:false,deckId:URLP.get("deck")||"",deck:null,g:"",sid:0,i:-1,phase:"pick",step:0,keys:{},aw:{},names:{},pts:{},players:{},term:elTerm(),err:""};
const saved=tab.get();
if(saved&&saved.sid&&Date.now()-saved.sid<4*3600e3&&(!H.deckId||H.deckId===saved.deckId))Object.assign(H,{deckId:saved.deckId,g:saved.g,sid:saved.sid,i:saved.i,phase:saved.phase,step:saved.step||0,keys:saved.keys||{},aw:saved.aw||{}});
const keep=()=>tab.set(H.sid?{deckId:H.deckId,g:H.g,sid:H.sid,i:H.i,phase:H.phase,step:H.step,keys:H.keys,aw:H.aw}:null);
// Catalan help on the theory slides (Roger, 5 Nov 2026: the grammar games explain the grammar "so that students understand it"):
// off by default (the games are at Safe level, in English); CA on the board or the C key shows a slide's ca lines. Kept in this browser.
const caOn=v=>{try{if(v!=null)localStorage.setItem("el_game_ca",v?"on":"off");return localStorage.getItem("el_game_ca")==="on"}catch(e){return !!v}};

const slides=()=>H.deck?H.deck.slides:[];
const cur=()=>slides()[H.i];
const isQ=s=>!!(s&&s.q);
const isW=s=>!!(s&&s.q&&s.write);   // a written question
const isN=s=>!!(s&&!s.q&&typeof s.notes==="number");   // a 📝 Take your notes slide (withNotes)
const meta=()=>(window.EL_GAMES||[]).find(d=>d.id===H.deckId)||{};
// the LS of the game (decks/index.js ls "LS2 · Free Time, Live!" → EL_LS id "2eso-free-time-live"), where the notes are shown
const lsId=()=>{const m=meta(),c=m.course||(H.deck&&H.deck.course)||"",nm=String(m.ls||"").replace(/^[^·]*·\s*/,"").trim().toLowerCase();
  const l=(window.EL_LS||[]).find(x=>x.course===c&&x.title.replace(/^[^·]*·\s*/,"").trim().toLowerCase()===nm);return l?l.id:""};
const accepted=i=>slides()[i].write.map(G.norm);
// A theory slide's blocks (Roger, 5 Nov 2026, grammar games): lines can be text, a table {table:[[header…],[row…]…]} or a warning
// {watch:"…"}. With step:true, Space shows one block at a time (the teacher explains each one), then goes on.
const blocks=s=>s&&!isQ(s)&&!isN(s)?(s.lines||[]):[];
const moreToShow=()=>{const s=cur();return H.phase==="show"&&s&&!isQ(s)&&s.step&&H.step<blocks(s).length};
const qList=()=>slides().map((s,i)=>isQ(s)?i:-1).filter(i=>i>=0);
const order=i=>{const s=slides()[i];return s.keep?[...s.options.keys()]:G.shuffle(s.options.length,H.sid+i*7919)};   // order[k] = the deck's option shown k-th
const okAt=i=>order(i).indexOf(0);   // the deck's first option is the right one
const answered=i=>Object.values(H.players).filter(a=>a[i]!=null);
const groupName=g=>((window.EL_GROUPS||[]).find(x=>x.id===g)||{}).name||g;
const nameOf=em=>H.names[em]||em.split("@")[0];

/* ---------- the deck file ---------- */
// A deck is loaded only for the teacher, so nothing on a student's device ever loads the answers.
window.ELGameDeck=d=>{H.deck=withNotes(d)};
// 📝 Take your notes (Roger, 6 Nov 2026: "in the slides I explain theory, I want students to have a slide with: Take your notes: and then
// they can see on their LS: your notes"): after each run of theory slides the board adds a notes slide {notes:k, topics, from}. The board
// shows the theory again in small (the projector) and each student types notes on their device (play.js), saved in
// students/{uid}/notes/{deck}.parts.p{k}; the LS home page shows them in 📝 Your notes (shared/js/el-notes.js). No notes slide with
// notes:false on the deck or on a theory slide. Space / Next goes on, so the teacher can skip it.
function withNotes(d){
  if(!d||d.notes===false)return d;
  const res=[];let run=[],k=0;
  const flush=()=>{if(run.length){k++;res.push({notes:k,topics:run.map(i=>res[i].theory||""),from:run.slice()});run=[]}};
  d.slides.forEach(s=>{
    if(s.q){flush();res.push(s);return}
    res.push(s);if(s.notes!==false)run.push(res.length-1);
  });
  flush();
  return Object.assign({},d,{slides:res});
}
function loadDeck(id){
  return new Promise(res=>{if(!/^[\w-]+$/.test(id))return res(false);H.deck=null;
    const s=document.createElement("script");s.src=`decks/${id}.js`;s.onload=()=>res(!!H.deck);s.onerror=()=>res(false);document.head.append(s)});
}

/* ---------- Firebase ---------- */
let liveBeat=null,ansStop=null;
function live(){
  if(!H.g||!H.sid||!H.deck)return;
  const s=cur(),qs=qList(),base={on:true,game:true,deck:location.pathname,title:H.deck.title,sid:H.sid,phase:H.phase==="show"?(isQ(s)?"q":isN(s)?"notes":"theory"):H.phase,
    i:H.i,qn:qs.indexOf(H.i)+1,qt:qs.length,keys:H.keys,at:S.serverTimestamp()};
  if(s&&H.phase!=="end"&&H.phase!=="lobby"){
    if(isN(s)){const m=meta();base.nt={k:s.notes,topics:s.topics,deck:H.deckId,ls:lsId(),lp:m.lp||"",title:H.deck.title,course:m.course||""}}
    else if(isW(s))base.q={text:s.q,img:s.img||"",write:true};
    else if(isQ(s))base.q={text:s.q,img:s.img||"",opts:order(H.i).map(k=>s.options[k])};else base.th={title:s.theory||"",img:s.img||""};
    if(H.phase==="reveal")base.ok=isW(s)?s.write[0]:okAt(H.i);
  }
  // only the game's own fields: a pull-up (go) and the group's full screen (fs) stay as they are (Roger, 6 Nov 2026), so after the game
  // the students are kept and in full screen again; a field the slide does not use (q, th, ok, nt) is removed
  const D=S.deleteField(),data=Object.assign({q:D,th:D,ok:D,nt:D},base);
  S.setDoc(S.doc(db,"live",H.g),data,{mergeFields:Object.keys(data)}).catch(e=>{console.warn("live",e);H.err="⚠ The students can't see the game: "+e.message;draw()});
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
  // ⛶ 📴 who left full screen in this game and who is not connected (Roger, 6 Nov 2026): live/{group}/fsLeft (at after the game started)
  // and live/{group}/here (the players' beats, play.js); pills in the top bar, the names when the teacher taps them
  whoStop();
  WHO.stops=[S.onSnapshot(S.collection(db,"live",g,"fsLeft"),c=>{WHO.left=c.docs.map(d=>Object.assign({e:d.id},d.data()));drawTop()},e=>console.warn("fsLeft",e)),
    S.onSnapshot(S.collection(db,"live",g,"here"),c=>{WHO.here={};c.docs.forEach(d=>WHO.here[d.id]=d.data());drawTop()},e=>console.warn("here",e))];
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
// Results (Roger, 5 Nov 2026: "I need to see their results in a chart, as a group and individually"): when the game ends (the last slide,
// ■ End or Finish), one document gameResults/{group}_{sid} keeps who got what right, only for the questions whose answer was shown.
// One write per game; results.html reads a group's documents (one per game played) and draws the charts. Teacher only (firestore.rules).
//   {group, course, deck, title, kind: vocab | grammar | mixed, ls, lp, sid, day, term, at, qn (questions in the game), done (shown),
//    qs:[{n, q, right, of}] (n = question number, right / of = students right / students who answered),
//    stu:[{e, r, a, miss:[n…], ans:{n: their answer}, notes:{p<k>: text}}] (e = email, r = right, a = answered, miss = the shown questions
//    they got wrong or didn't answer, ans = what they tapped or wrote, notes = their 📝 notes), qs[].ok = the right answer,
//    nts:[{k, topic}] (the notes slides; a game is saved also when nobody answered a question but someone wrote notes)}
// 📝 The group played this game (Roger, 6 Nov 2026: "if a student doesn't come and doesn't do the game, the system detects it and saves the
// theory in their notes"): ls/{id}.played[group][deck] = day (ms of the first time), written once per game when the board reaches a notes
// slide or the end. Students already read their LS's ls doc on every page (el-cloud.js lsInfo), so 📝 Your notes shows the theory of
// every game their group played, with their own notes when they took them (el-notes.js). No extra reads.
let playedSid=0;
function markPlayed(){
  const id=lsId();if(!id||!H.g||!H.sid||playedSid===H.sid||!H.deck||H.deck.notes===false)return;playedSid=H.sid;
  S.setDoc(S.doc(db,"ls",id),{played:{[H.g]:{[H.deckId]:H.sid}}},{merge:true}).catch(e=>{playedSid=0;console.warn("played",e)});
}
let savedSid=0;
async function saveResults(){
  markPlayed();
  if(!H.g||!H.sid||savedSid===H.sid||!H.deck)return;
  const qs=qList(),shown=qs.filter(i=>H.aw[i]);if(!shown.length&&!slides().some((s,i)=>isN(s)&&answered(i).length))return;
  const meta=(window.EL_GAMES||[]).find(d=>d.id===H.deckId)||{},num=i=>qs.indexOf(i)+1;
  // each student's own answers (Roger, 6 Nov 2026: "I want to be able to see the answers of each student, their performance and their
  // notes of the LS"): ans {n: the option they tapped or what they wrote}, notes {p<k>: what they wrote on the 📝 notes slides}
  const nIdx=slides().map((s,i)=>isN(s)?i:-1).filter(i=>i>=0);
  const said=(i,v)=>{const s=slides()[i];if(v==null)return null;if(isW(s))return String(v).slice(0,80);const k=order(i)[v];return k==null?null:String(s.options[k]).replace(/\*\*/g,"").slice(0,80)};
  const stu=Object.entries(H.players).map(([e,a])=>{const miss=shown.filter(i=>!H.aw[i].includes(e)).map(num),ans={},notes={};
    shown.forEach(i=>{const v=said(i,a[i]);if(v!=null)ans[num(i)]=v});
    nIdx.forEach(i=>{if(typeof a[i]==="string"&&a[i].trim())notes["p"+slides()[i].notes]=a[i].slice(0,3000)});
    return {e,r:shown.length-miss.length,a:shown.filter(i=>a[i]!=null).length,miss,ans,notes}});
  const d=new Date(H.sid),day=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  const doc={group:H.g,course:meta.course||H.deck.course||"",deck:H.deckId,title:H.deck.title,kind:meta.kind||"mixed",ls:meta.ls||"",lp:meta.lp||"",
    sid:H.sid,day,term:H.term,at:S.serverTimestamp(),qn:qs.length,done:shown.length,
    qs:shown.map(i=>({n:num(i),q:String(slides()[i].q).replace(/\*\*/g,"").slice(0,160),ok:String(isW(slides()[i])?slides()[i].write[0]:slides()[i].options[0]).replace(/\*\*/g,"").slice(0,80),right:H.aw[i].length,of:answered(i).length})),
    nts:nIdx.map(i=>({k:"p"+slides()[i].notes,topic:slides()[i].topics.join(" · ").slice(0,200)})),stu};
  savedSid=H.sid;
  try{await S.setDoc(S.doc(db,"gameResults",H.g+"_"+H.sid),doc)}catch(e){savedSid=0;console.warn("results",e);H.err="⚠ Results not saved: "+e.message;draw()}
  // each student's own result (Roger, 6 Nov 2026: "I want students to see their results in the games and suggestions of what to study"):
  // myGames/{email}.games[{group}_{sid}] = {deck, title, kind, ls, lp, day, sid, r, of, miss:[{n, q, a (their answer), ok, p (the notes part
  // whose theory it practises)}]} (firestore.rules: the student reads their own, only the teacher writes). One write per player per game;
  // the LS page's 📝 Your notes reads it once (shared/js/el-notes.js) and puts it with the theory and their notes.
  if(!shown.length)return;
  const partOf=i=>{for(let j=i-1;j>=0;j--)if(isN(slides()[j]))return "p"+slides()[j].notes;return ""};
  try{const w=S.writeBatch(db),key=H.g+"_"+H.sid;
    stu.forEach(x=>{const miss=x.miss.map(n=>{const i=qs[n-1],q=doc.qs.find(z=>z.n===n)||{};return {n,q:q.q||"",a:x.ans[n]==null?"":x.ans[n],ok:q.ok||"",p:partOf(i)}});
      w.set(S.doc(db,"myGames",x.e),{games:{[key]:{deck:H.deckId,title:H.deck.title,kind:doc.kind,ls:lsId(),lp:doc.lp,day,sid:H.sid,r:x.r,of:shown.length,miss}},updated:S.serverTimestamp()},{merge:true})});
    await w.commit()}catch(e){console.warn("my games",e);H.err="⚠ Students' results not saved: "+e.message;draw()}
}
let autoT=null;
function autoReveal(){   // like a Kahoot: once everyone who joined has answered, the answer shows by itself
  clearTimeout(autoT);
  if(H.phase!=="show"||!isQ(cur()))return;const n=Object.keys(H.players).length;
  if(n&&answered(H.i).length>=n)autoT=setTimeout(()=>{if(H.phase==="show"&&answered(H.i).length>=Object.keys(H.players).length)go("reveal")},900);
}

const WHO={stops:[],left:[],here:{},open:false};
const whoStop=()=>{WHO.stops.forEach(f=>f());WHO.stops=[];WHO.left=[];WHO.here={};WHO.open=false};
const ms=t=>t&&t.toMillis?t.toMillis():typeof t==="number"?t:0;
const hm=t=>{const d=new Date(ms(t));return ms(t)?String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0"):""};
// the whole group, in or out (Roger, 6 Nov 2026: "who is in and who is out"): elClassRoll in el-catalog.js with the group's student list
function who(){if(!H.sid||H.phase==="end"||H.phase==="pick")return {active:false,inn:[],out:[],n:0};
  const x={game:true,on:true,phase:"q",sid:H.sid,at:Date.now(),title:H.deck&&H.deck.title},left=WHO.left.filter(y=>ms(y.at)>=H.sid).map(y=>Object.assign({},y,{pull:H.sid}));
  return elClassRoll(x,left,Object.entries(WHO.here).map(([e,y])=>Object.assign({e},y)),Object.keys(H.names).map(e=>({e,name:H.names[e]})))}
const why=y=>y.why==="full"?"out of full screen"+(y.left?` · left ${hm(y.left.at)}${y.left.n>1?` (${y.left.n}×)`:""}`:""):y.why==="closed"?`screen closed or another window · since ${hm(y.seen)}`:y.why==="lost"?`lost connection · since ${hm(y.seen)}`:"not in the game";
// only the top bar is drawn again (the slide underneath keeps its animation)
function drawTop(){const t=app$.querySelector(".top");if(t&&H.g&&H.sid)t.outerHTML=top()}
setInterval(drawTop,15e3);   // a beat missed for EL_HERE_MS

/* ---------- moving through the game ---------- */
function go(to){
  if(to==="reveal"){H.phase="reveal";award(H.i);G.music("");G.fx("reveal");setTimeout(()=>G.fx(H.aw[H.i]&&H.aw[H.i].length?"right":"wrong"),700)}
  else if(to==="next"){
    if(H.i+1>=slides().length){H.phase="end";saveResults();G.music("");G.fx("drum");setTimeout(()=>{G.fx("fanfare");G.confetti()},1700)}
    else{H.i++;H.phase="show";H.step=1;G.fx("next");G.music(isQ(cur())?"think":"");if(isN(cur()))markPlayed()}
  }
  keep();live();draw();autoReveal();
}
function more(){H.step++;keep();G.fx("tap");draw()}
function primary(){
  if(H.phase==="lobby")go("next");
  else if(H.phase==="show")isQ(cur())?go("reveal"):moreToShow()?more():go("next");
  else if(H.phase==="reveal")go("next");
}
addEventListener("keydown",e=>{if(e.target.closest&&e.target.closest("input,select,textarea"))return;
  if([" ","Enter","ArrowRight","PageDown"].includes(e.key)){e.preventDefault();primary()}
  if(e.key==="m"||e.key==="M"){G.sound(!G.sound());draw()}
  if((e.key==="c"||e.key==="C")&&H.phase==="show"&&cur()&&cur().ca){caOn(!caOn());draw()}});

function startGame(g){
  H.g=g;H.sid=Date.now();H.i=-1;H.phase="lobby";H.keys={};H.aw={};keep();G.music("lobby");startGroup();
}
function endGame(){
  const g=H.g;saveResults();liveOff(g);if(ansStop)ansStop();ansStop=null;whoStop();clearInterval(liveBeat);G.music("");
  Object.assign(H,{g:"",sid:0,i:-1,phase:"pick",keys:{},aw:{},players:{}});keep();draw();
}

/* ---------- screens ---------- */
const top=()=>{const qs=qList(),qn=qs.indexOf(H.i)+1,s0=cur();
  const w=who(),gone=w.out.filter(y=>y.why!=="never"),never=w.out.filter(y=>y.why==="never");
  const box=WHO.open&&w.active?`<div class="whobox pop">${gone.length?`<p>${gone.map(y=>`<span class="o">✗ <b>${esc(y.name)}</b> · ${why(y)}</span>`).join("<br>")}</p>`:""}${never.length?`<p class="nv">⚪ Not in the game (${never.length}): ${never.map(y=>esc(y.name)).join(", ")}</p>`:""}<p class="i">✓ In (${w.inn.length}): ${w.inn.map(y=>esc(y.name)).join(", ")||"nobody yet"}</p></div>`:"";
  return `<div class="top"><span class="pill">📡 ${esc(groupName(H.g))}</span><span class="pill">🎮 ${Object.keys(H.players).length}</span>
  ${w.active?`<button class="pill who${w.out.length?" warn":""}" data-do="who" title="Who is in full screen and connected, and who is out (tap to show or hide the names)">✓ ${w.inn.length} in · ✗ ${w.out.length} out</button>`:""}${box}
  ${H.i>=0&&H.phase!=="end"?`<span class="pill">${qn?`${isW(cur())?"✏️ ":""}Question ${qn} / ${qs.length}`:isN(cur())?"📝 Notes":"Theory"}</span>`:""}<span class="sp"></span>
  ${H.err?`<span class="pill" style="background:#b3261e">${esc(H.err)}</span>`:""}
  ${H.phase==="show"&&s0&&!isQ(s0)&&s0.ca?`<button class="btn ghost${caOn()?" on":""}" data-do="ca" title="Catalan help on this slide (C)">CA</button>`:""}
  <button class="btn ghost" data-do="mute" title="Music and sounds (M)">${G.sound()?"🔊":"🔇"}</button>
  <button class="btn ghost" data-do="end" title="End the game for everyone">${Date.now()-endArm<3000?"Tap again to end":"■ End"}</button></div>`};
// one block of a theory slide: text, a table {table} or a warning {watch} (also the small copy on the notes slide)
function blockHtml(l,hid,fresh){
  if(l&&l.table){const [h,...r]=l.table;return `<table class="tt${fresh}"${hid}><thead><tr>${h.map(c=>`<th>${md(c)}</th>`).join("")}</tr></thead><tbody>${r.map(x=>`<tr>${x.map(c=>`<td>${md(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`}
  if(l&&l.watch)return `<p class="watch${fresh}"${hid}>⚠️ ${md(l.watch)}</p>`;
  return `<p class="${fresh}"${hid}>${md(l)}</p>`}
const tiles=(s,i,reveal)=>{const o=order(i),ok=okAt(i);
  return `<div class="tiles">${o.map((k,n)=>`<div class="tile t${n}${reveal&&n!==ok?" dim":""}"><span class="shp s${n}"></span><span class="tx">${md(s.options[k])}</span>${reveal&&n===ok?'<span class="mark">✓</span>':""}</div>`).join("")}</div>`};

function draw(){
  if(!H.user){app$.innerHTML=`<div class="center"><div class="card msg pop"><h2>🎮 Class game</h2><p>This is the teacher's board. Sign in with the teacher's account to start a game.</p><p><button class="btn go" data-do="signin">Sign in with Google</button></p></div></div>`;return}
  if(!H.teacher){app$.innerHTML=`<div class="center"><div class="card msg pop"><h2>🎮 Class game</h2><p>This is the teacher's board. When your teacher starts a game, it opens by itself on your screen.</p><p><a class="btn go" href="play.html">Go to the game screen</a> <button class="btn" data-do="signout">Sign out</button></p></div></div>`;return}
  if(!H.deck){
    // Games by course (2 ESO, 4 ESO), then by LS, then by learning path (Roger, 30 Oct 2026: "organised by course and LS").
    const list=window.EL_GAMES||[],by=(a,k)=>[...new Set(a.map(d=>d[k]||""))].sort((x,y)=>x.localeCompare(y,"en",{numeric:true}));
    const card=d=>`<button class="btn deckbtn slidein" data-do="deck" data-id="${esc(d.id)}"><span class="e">${esc(d.emoji||"🎮")}</span><span>${esc(d.title)}${d.lp?`<br><small style="opacity:.7">${esc(d.lp)}</small>`:""}</span></button>`;
    const cols=by(list,"course").map(c=>{const g=list.filter(d=>d.course===c);
      return `<section class="course"><h2>${c==="2eso"?"2 ESO":c==="4eso"?"4 ESO":esc(c)}</h2>${by(g,"ls").map(l=>`${l?`<h3>${esc(l)}</h3>`:""}<div class="picks">${g.filter(d=>(d.ls||"")===l).sort((a,b)=>(a.lp||"").localeCompare(b.lp||"","en",{numeric:true})).map(card).join("")}</div>`).join("")}</section>`}).join("");
    app$.innerHTML=`<div class="center"><div><h1 class="logo pop">🎮 Class game</h1><p class="sub">Choose a game. All games are at Safe level. Each learning path has a 📚 vocabulary game and a 🧩 grammar game.</p>${cols?`<div class="courses">${cols}</div>`:"<p>No games yet.</p>"}<p>${backBtn()}<a class="btn ghost" href="results.html" target="_blank" rel="noopener">📊 Results</a> <a class="btn ghost" href="../../teacher.html">← Dashboard</a></p></div></div>`;return}
  if(H.phase==="pick"||!H.g){
    const course=H.deck.course||((window.EL_GAMES||[]).find(d=>d.id===H.deckId)||{}).course,gs=(window.EL_GROUPS||[]).filter(g=>!course||g.course===course);   // the game's course (decks/index.js)
    app$.innerHTML=`<div class="center"><div><h1 class="logo pop">${esc(H.deck.title)}</h1><p class="sub">${slides().length} slides · ${qList().length} questions. Start the game for a group: its students are taken into it.</p>
      <div class="picks">${gs.map(g=>`<button class="btn go deckbtn" data-do="group" data-g="${g.id}">▶ ${esc(g.name)}</button>`).join("")}</div>
      <p>${backBtn()}<button class="btn ghost" data-do="decks">← Other games</button> <a class="btn ghost" href="../../teacher.html${course?"?course="+course:""}">← Dashboard</a></p></div></div>`;return}
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
      <p><button class="btn go" data-do="finish">Finish</button> <button class="btn ghost" data-do="again">Play again</button> <a class="btn ghost" href="results.html?g=${encodeURIComponent(H.g)}" target="_blank" rel="noopener">📊 Results</a> ${backBtn()}</p></div></div></div>`;return}
  if(!isQ(s)&&!isN(s)){
    const bl=blocks(s),n=s.step?Math.max(1,H.step):bl.length,ca=[].concat(s.ca||[]);
    const block=(l,k)=>blockHtml(l,k>=n?' style="visibility:hidden"':"",s.step&&k===n-1&&k>0?" pop":"");
    app$.innerHTML=top()+`<div class="main"><div class="card theory slidein${s.wide?" wide":""}"><div class="pic">${pic(s.img)}</div><div class="tx"><h2>${md(s.theory)}</h2>${bl.map(block).join("")}
      ${ca.length&&caOn()?`<div class="ca pop"><b>En català</b>${ca.map(l=>`<p>${md(l)}</p>`).join("")}</div>`:""}</div></div>
      <div style="text-align:right">${moreToShow()?`<span class="stepn">${n} / ${bl.length}</span> <button class="btn go" data-do="more">Show more ▼<span class="kbd">Space</span></button>`:`<button class="btn go" data-do="next">Next ▶<span class="kbd">Space</span></button>`}</div></div>`;return}
  const rev=H.phase==="reveal",n=answered(H.i).length;
  if(isN(s)){   // 📝 Take your notes: the theory of the run again, small, while the students write on their devices
    const recap=s.from.map(i=>slides()[i]).map(t=>`<section><h3>${pic(t.img)} ${md(t.theory)}</h3>${(t.lines||[]).map(l=>blockHtml(l,"","")).join("")}</section>`).join("");
    app$.innerHTML=top()+`<div class="main"><div class="card notes slidein"><div class="nhead"><span class="nemo">📝</span><div><h2>Take your notes</h2>
      <p>On your Chromebook, in your own words: <b>the rule</b>, <b>two examples</b> and <b>the mistake to avoid</b>. They are saved on your LS page, in <b>📝 Your notes</b>.</p></div>
      <div class="stat"><b>${n}</b>writing${P.length?` / ${P.length}`:""}</div></div><div class="recap">${recap}</div></div>
      <div style="text-align:right"><button class="btn go" data-do="next">Next ▶<span class="kbd">Space</span></button></div></div>`;return}
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
  if(d==="more")more();
  if(d==="ca"){caOn(!caOn());draw()}
  if(d==="reveal")go("reveal");
  if(d==="mute"){G.sound(!G.sound());draw()}
  if(d==="who"){WHO.open=!WHO.open;drawTop()}
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
