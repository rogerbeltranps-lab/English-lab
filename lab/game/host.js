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
// 🎮 Quiz or 🕵️ Code Breakers (Roger, 16 Nov 2026: "make grammar and vocabulary games as hackers too … so I choose hackers or Kahoot"): after
// choosing a game, the teacher chooses how to play it (kept in this browser, el_game_fmt) and then the group. Quiz = this board; Code Breakers
// = codebreakers.html?game=<deck>&g=<group>&go=1 (cb-host.js), that game alone, each student at their own pace. Both save the same results
// (gameResults + myGames, +1 point per right answer), so the marks read them the same way.
// 🔒 One game per group (Roger, 16 Nov 2026: the board showed the quiz while the Chromebooks showed Code Breakers): live/{group} belongs to
// the board that started its game last. This board checks it when it picks a game up again (a reload) and once a minute (one read): if a
// newer game took the group (Code Breakers or another board), it stops at once and never writes to live/{group} again.
// 🧩 Which grammar? (Roger, 16 Nov 2026: "When doing grammar games I want to choose the topics done in all the LS like: comparatives, ed/ing
// relative clauses… so we add more and more difficulty as we progress and if I don't have time to do whatever there are no questions about it"):
// a grammar game asks, after the group, which grammar points go in (💬 the expressions of the vocabulary decks too, see exDeck). Every grammar point of every grammar game of the course (all LSs) is a
// tick, grouped by LS and learning path; the points whose tab the group has done (ls/{id}.done, the Time plan) are ticked by themselves.
// This game's ticked points bring all their questions; each ticked point of another game brings 1, 2 or 3 🔁 review questions (its deck and
// decks/more questions, a new choice every game), spread among this game's. An unticked point has no questions. Code Breakers gets the same
// choice (&tp=, the same questions). Results stay this game's; a review question keeps its own game and point (d, dp).
// 📚 Vocabulary games too, and ONE grammar game and ONE vocabulary game per LS (Roger, 16 Nov 2026: "And the same with the vocab, so now we
// only have one game of grammar and one game of vocab per LS"): the board's list has 🧩 Grammar · LSn and 📚 Vocabulary · LSn (?ls=<ls id>&kind=);
// after the group, the points of every learning path of the LS (and earlier LSs) are ticked by the Time plan, and the game is saved as the
// newest learning path's game with ticked points (all its ticked questions); the other ticked points bring their 🔁 questions.
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
const backBtn=()=>cmGroup()?cmBtn()+" ":BACK?`<a class="btn ghost" href="${esc(BACK)}">← Learning Path</a> `:"";
// 🎓 Back to class mode (Roger, 9 Nov 2026: "when we play a game I should be able to go to the class mode where I came from and students
// [...] should only be able to go to the class where they had been pulled up and when I say so"). The class tab (el-cloud.js cmTeacher,
// sessionStorage el_cm) opens the game in itself (📋 Today, el-cm-agenda.js; a game button on a learning path page): this board then
// shows 🎓 Back to class mode, which ends the game (results saved), writes live/{group}.cmBack = now (the students waiting in the player
// go back to the class page, play.js) and takes this tab back to the page and tab it came from, still in class mode (el_cm_last).
// A board opened in another tab while the group is in class mode (live/{group}.go, read once when the game starts) gets the button too:
// it sends the students back and closes this tab (or goes to the class page if the browser keeps it open).
const CMT=(()=>{try{const o=JSON.parse(sessionStorage.getItem("el_cm")||"null");return o&&o.g&&Date.now()<o.until?o:null}catch(e){return null}})();
let CMG=null,CMGg="",cmArm=0,cmBusy=false;
const cmGroup=()=>CMT?CMT.g:CMGg&&window.elCmOn&&elCmOn(CMG)?CMGg:"";
function cmHome(){let x=null;if(CMT){try{x=JSON.parse(sessionStorage.getItem("el_cm_last")||"null")}catch(e){}}else x=CMG;
  if(!x||!x.u)return new URL(BACK||"../../teacher.html",location.href).href;
  const u=new URL("../../"+x.u,location.href);u.hash=x.p||"";return u.href}
const cmPlaying=()=>!!(H.sid&&H.phase!=="end");
const cmBtn=()=>cmGroup()?`<button class="btn cm" data-do="cmback" title="End the game and take ${esc(groupName(cmGroup()))} back to the class page with you">${cmBusy?"Going back…":cmPlaying()&&Date.now()-cmArm<3000?"Tap again: end the game and go back":"🎓 Back to class mode"}</button>`:"";
async function backToClass(){const g=cmGroup();if(!g||cmBusy)return;cmBusy=true;draw();
  const was=H.g,sid=H.sid;
  if(sid){try{await saveResults()}catch(e){console.warn("results",e)}if(ansStop)ansStop();ansStop=null;whoStop();clearInterval(liveBeat);G.music("");
    Object.assign(H,{g:"",sid:0,i:-1,phase:"pick",keys:{},aw:{},players:{},tp:null,deck:H.deck0||H.deck});keep()}
  const w={cmBack:Date.now()};if(sid&&was===g)Object.assign(w,{on:false,at:S.serverTimestamp()});
  try{await S.setDoc(S.doc(db,"live",g),w,{merge:true});if(sid&&was&&was!==g)await S.setDoc(S.doc(db,"live",was),{on:false,at:S.serverTimestamp()},{merge:true})}
  catch(e){cmBusy=false;H.err="⚠ The students were not sent back: "+e.message;draw();return}
  const to=cmHome();if(CMT){location.href=to;return}
  try{window.close()}catch(e){}setTimeout(()=>{location.href=to},400)}
const tab={get(){try{return JSON.parse(sessionStorage.getItem("elGame")||"null")}catch(e){return null}},set(v){try{sessionStorage.setItem("elGame",JSON.stringify(v))}catch(e){}}};

// H: the game on this board. deckId, deck (the deck file's content), g (group), sid (this game: the time it started), i (slide; -1 lobby),
// phase, keys {slide: right option, in the shown order}, aw {slide: [emails that got the point]}. names {email: "First S."} (student list),
// pts {email: points this term} for the group's best, players {email: answers} of this game.
// the LS game (🧩 Grammar · LSn / 📚 Vocabulary · LSn): {ls: EL_LS id, kind}; H.deckId is then its newest learning path's game
const lsGames=(ls,kind)=>(window.EL_GAMES||[]).filter(d=>(d.kind||(/-vocab$/.test(d.id)?"vocab":"grammar"))===kind&&lsOf(d)===ls).sort((a,b)=>String(a.lp).localeCompare(String(b.lp),"en",{numeric:true}));
const LSG0=(()=>{const ls=URLP.get("ls"),k=URLP.get("kind");return ls&&/^(grammar|vocab)$/.test(k||"")&&lsGames(ls,k).length?{ls,kind:k}:null})();
const H={user:null,teacher:false,lsg:LSG0,deckId:URLP.get("deck")||(LSG0?lsGames(LSG0.ls,LSG0.kind).slice(-1)[0].id:""),deck:null,deck0:null,g:"",sid:0,i:-1,phase:"pick",step:0,keys:{},aw:{},names:{},pts:{},players:{},term:elTerm(),err:"",tg:"",tp:null,tsel:null};
const saved=tab.get();
if(saved&&saved.sid&&Date.now()-saved.sid<4*3600e3&&(!H.deckId||H.deckId===saved.deckId))Object.assign(H,{deckId:saved.deckId,g:saved.g,sid:saved.sid,i:saved.i,phase:saved.phase,step:saved.step||0,keys:saved.keys||{},aw:saved.aw||{},rp:saved.rp,tp:saved.tp||null,rvn:saved.rvn});
const keep=()=>tab.set(H.sid?{deckId:H.deckId,g:H.g,sid:H.sid,i:H.i,phase:H.phase,step:H.step,keys:H.keys,aw:H.aw,rp:H.rp,tp:H.tp,rvn:H.rvn}:null);
// Catalan help on the theory slides (Roger, 5 Nov 2026: the grammar games explain the grammar "so that students understand it"):
// off by default (the games are at Safe level, in English); CA on the board or the C key shows a slide's ca lines. Kept in this browser.
// how the teacher plays the class games: "quiz" (this board) or "cb" (🕵️ Code Breakers), kept in this browser
const fmt=v=>{try{if(v!=null)localStorage.setItem("el_game_fmt",v==="cb"?"cb":"quiz");return localStorage.getItem("el_game_fmt")==="cb"?"cb":"quiz"}catch(e){return v==="cb"?"cb":"quiz"}};
const caOn=v=>{try{if(v!=null)localStorage.setItem("el_game_ca",v?"on":"off");return localStorage.getItem("el_game_ca")==="on"}catch(e){return !!v}};

const slides=()=>H.deck?H.deck.slides:[];
const cur=()=>slides()[H.i];
const isQ=s=>!!(s&&s.q);
const isW=s=>!!(s&&s.q&&s.write);   // a written question
const isN=s=>!!(s&&!s.q&&typeof s.notes==="number");   // a 📝 Take your notes slide (withNotes)
// what the 2 sentences use (Roger, 10 Nov 2026: "ask them to write 2 sentences using the vocabulary or grammar structures learnt and whatever
// they need to remember better the theory explained"): the game's kind (decks/index.js), or the end of its id
const kindOf=()=>meta().kind||(/-vocab$/.test(H.deckId||"")?"vocab":/-grammar$/.test(H.deckId||"")?"grammar":"");
const noteWhat=(kind,id)=>{kind=kind||(/-vocab$/.test(id||"")?"vocab":/-grammar$/.test(id||"")?"grammar":"");
  return kind==="vocab"?"<b>the new words</b>":kind==="grammar"?"<b>the grammar structures</b> you have learnt":"<b>the new words or grammar</b>"};
const meta=()=>(window.EL_GAMES||[]).find(d=>d.id===H.deckId)||{};
// the game's name starts with its learning path: "LP2 · Vocabulary · Clothes, kit and weather" (decks/index.js elGameName, Roger 7 Nov 2026)
const gName=()=>meta().lp?elGameName(H.deckId):H.deck.title;
// the LS game's name on the board's screens before it starts: "🧩 Grammar · LS2 · Seasons & Celebrations"
const lsgName=()=>{const d=meta();return (H.lsg.kind==="vocab"?"📚 Vocabulary":"🧩 Grammar")+" · "+(d.ls||"")};
const boardName=()=>H.lsg?lsgName():gName();
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
window.ELGameDeck=d=>{H.deck=H.deck0=withNotes(d)};
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

/* ---------- 🧩 Which grammar? (the grammar points of the game, chosen before it starts) ---------- */
// RAW[id] = a deck's points: [{k (1 = its first run of theory slides, as the 📝 notes parts), name (point), tab, qs (its questions), more
// (its decks/more questions)}]. Loaded one after the other (the deck files call the global ELGameDeck), never on a student's device.
const RAW={};
const script=src=>new Promise(res=>{const s=document.createElement("script");s.src=src;s.onload=()=>res(true);s.onerror=()=>res(false);document.head.append(s)});
function pointsOf(d,more){const out=[];let run=false,cur=null;
  (d.slides||[]).forEach(s=>{if(s.q){run=false;if(cur)cur.qs.push(s);return}if(s.notes===false)return;
    if(!run){run=true;cur={k:out.length+1,name:"",tab:"",qs:[],more:[]};out.push(cur)}
    if(!cur.name&&s.point)cur.name=s.point;if(!cur.tab&&s.tab)cur.tab=s.tab;if(s.ex)cur.ex=true;if(!cur.th&&s.theory)cur.th=String(s.theory).replace(/\*\*/g,"")});
  out.forEach(p=>{p.name=p.name||p.th||"Part "+p.k});
  ((more&&more.questions)||[]).forEach(q=>{const p=out[(+q.p||0)-1];if(p&&q.q)p.more.push(q)});
  return out}
async function rawDeck(id){if(id in RAW)return RAW[id];if(!/^[\w-]+$/.test(id))return RAW[id]=null;
  const was=window.ELGameDeck,wasM=window.ELGameMore;let got=null,more=null;
  window.ELGameDeck=d=>{got=d};await script(`decks/${id}.js`);window.ELGameMore=m=>{more=m};await script(`decks/more/${id}.js`);
  window.ELGameDeck=was;window.ELGameMore=wasM;return RAW[id]=got?pointsOf(got,more):null}
const gm=id=>(window.EL_GAMES||[]).find(d=>d.id===id)||{};
function lsOf(d){const nm=String(d.ls||"").replace(/^[^·]*·\s*/,"").trim().toLowerCase();const l=(window.EL_LS||[]).find(x=>x.course===d.course&&x.title.replace(/^[^·]*·\s*/,"").trim().toLowerCase()===nm);return l?l.id:""}
const lpNum=d=>String(d.lp||"").split(" · ")[0];
// the games of this game's course and kind (grammar or vocabulary), by LS and then learning path (decks/index.js)
const kindIs=d=>d.kind||(/-vocab$/.test(d.id)?"vocab":"grammar");
const gDecks=()=>{const c=meta().course,k=kindOf();return (window.EL_GAMES||[]).filter(d=>d.course===c&&kindIs(d)===k)
  .sort((a,b)=>(a.ls+" "+a.lp).localeCompare(b.ls+" "+b.lp,"en",{numeric:true}))};
// 💬 Expressions (Roger, 16 Nov 2026: "why do we have grammar in the vocabulary section? … can we label them as Expressions" + "and include
// them in the grammar games"): a point of a 📚 vocabulary deck whose theory slide has ex:true (play / go / do, on / at / in + time, verb +
// preposition, both… and) is played in the 🧩 grammar game, listed under its learning path as 💬, and never in the vocabulary game. It stays
// in its own deck (the same point number, so the students' notes and results keep their place): its questions come in like a 🔁 review
// question (d, dp: they count for their own point), all of them when it is the learning path the game is saved as (anchor), else 1, 2 or 3.
const exDeck=d=>d&&kindIs(d)==="grammar"?(window.EL_GAMES||[]).find(x=>x.course===d.course&&x.ls===d.ls&&x.lp===d.lp&&kindIs(x)==="vocab")||null:null;
const exDecks=()=>kindOf()==="grammar"?gDecks().map(exDeck).filter(Boolean):[];
// the points a deck offers in this game: a vocabulary deck gives its 💬 points to the grammar game and keeps the others
const ptsOf=d=>{const P=RAW[d.id]||[];return kindIs(d)!=="vocab"?P:kindOf()==="vocab"?P.filter(p=>!p.ex):P.filter(p=>p.ex)};
const sameLp=(a,b)=>!!a&&!!b&&a.course===b.course&&a.ls===b.ls&&a.lp===b.lp;
let tpBusy=false;
async function loadPoints(){if(tpBusy)return;tpBusy=true;for(const d of gDecks().concat(exDecks()))await rawDeck(d.id);tpBusy=false;draw()}
const pointsReady=()=>gDecks().concat(exDecks()).every(d=>d.id in RAW);
// done: the tabs the group has done in that LS (ls/{id}.done[group], read with the played games: no extra reads)
const doneOf=(d,g)=>((DN||{})[lsOf(d)]||{})[g]||{};
// a point of this game's LS is ticked when the group has done its tab; a point with no tab (or an LS with no Time plan ticks for that path) when the group
// played its game; this game's points all ticked if none of them is
function tpDefault(g){const out={};
  gDecks().concat(exDecks()).forEach(d=>{if(!RAW[d.id])return;const P=ptsOf(d),done=doneOf(d,g),info=d.act&&Object.keys(done).some(k=>k.startsWith(d.act+"#")),pl=PL&&(PL[d.id]||{})[g];
    // earlier LSs start unticked (the list grows every LS): the teacher ticks the ones to review
    let ks=d.ls!==meta().ls?[]:P.filter(p=>p.tab&&info?!!done[d.act+"#"+p.tab]:(d.id===H.deckId&&!H.lsg||!!pl)).map(p=>p.k);
    if(d.id===H.deckId&&!H.lsg&&!ks.length)ks=P.map(p=>p.k);
    out[d.id]=new Set(ks)});
  // an LS game with nothing done yet: its first learning path
  if(H.lsg&&!gDecks().concat(exDecks()).some(d=>d.ls===meta().ls&&out[d.id]&&out[d.id].size)){const f=gDecks().find(d=>d.ls===meta().ls);
    [f,exDeck(f)].forEach(x=>{if(x&&RAW[x.id])out[x.id]=new Set(ptsOf(x).map(p=>p.k))})}
  return out}
// the game it is saved as: this game, or for an LS game the newest learning path of the LS with ticked points
function anchor(sel){if(!H.lsg)return H.deckId;const on=d=>!!d&&!!sel&&!!sel[d.id]&&sel[d.id].size>0,ds=gDecks().filter(d=>d.ls===meta().ls&&(on(d)||on(exDeck(d))));return ds.length?ds[ds.length-1].id:H.deckId}
// the choice as it is kept: null = this game exactly as it is (all its points, nothing else)
function tpFrom(sel,a){a=a||H.deckId;const o={};Object.entries(sel||{}).forEach(([id,ks])=>{const x=[...ks].sort((p,q)=>p-q);if(x.length)o[id]=x});
  const P=RAW[a]||[],mine=o[a]||[];if(Object.keys(o).length===(mine.length?1:0)&&mine.length===P.length)return null;return o}
// questions per earlier point: 1, 2, 3 or 99 (all of them)
const rvOk=n=>n>=1&&n<=3||n===99;
const rvN=v=>{try{if(v!=null)localStorage.setItem("el_game_rvn",String(v));const n=+localStorage.getItem("el_game_rvn");return rvOk(n)?n:1}catch(e){return rvOk(v)?v:1}};
// the questions of the game for the chosen points: this game's points in the deck's order, the 🔁 review questions spread among them
async function build(){
  if(!H.deck0)return;if(!H.tp){H.deck=H.deck0;return}
  const tp=H.tp,own=new Set(tp[H.deckId]||[]),seed=H.sid||1,n=H.rvn||rvN(),main=[];let k=0;
  H.deck0.slides.forEach(s=>{if(isN(s)){k=s.notes;return}if(s.q&&(!k||own.has(k)))main.push(Object.assign({},s,{_p:k&&H.deck0.notes!==false?"p"+k:""}))});
  const rv=[];
  for(const id of Object.keys(tp)){if(id===H.deckId)continue;const P=await rawDeck(id),d=gm(id);if(!P)continue;
    // 💬 the expressions of this game's own learning path: all their questions, after this game's own (as its points, in deck order)
    const mine=sameLp(d,gm(H.deckId));
    tp[id].forEach(kk=>{const p=P.find(x=>x.k===kk);if(!p)return;const tag=q=>{q=Object.assign({},q);delete q.p;return Object.assign(q,{_p:"",_rv:{d:id,dp:"p"+kk,lp:lpNum(d),ls:String(d.ls||"").split(" · ")[0],name:p.name,...(p.ex?{ex:true}:{}),...(mine?{own:true}:{})}})};
      if(mine){p.qs.forEach(q=>main.push(tag(q)));return}
      const pool=p.qs.concat(p.more),h=[...(id+kk)].reduce((a,c)=>a*31+c.charCodeAt(0)>>>0,7);
      G.shuffle(pool.length,seed+h).slice(0,n).forEach(j=>rv.push(tag(pool[j])))})}
  const R=G.shuffle(rv.length,seed+17).map(j=>rv[j]),out=[];
  if(!main.length)out.push(...R);else main.forEach((q,i)=>{out.push(q);out.push(...R.slice(Math.floor(i*R.length/main.length),Math.floor((i+1)*R.length/main.length)))});
  H.deck=Object.assign({},H.deck0,{slides:out});
}
// how many questions the choice gives (the 🧩 screen): this game's, and review
// (Code Breakers: this game's decks/more questions too, and the same number of review questions per point)
function tpCount(sel,cb){const a=anchor(sel),P=RAW[a]||[],mine=sel[a]||new Set(),n=H.rvn||rvN(),x=exDeck(gm(a)),X=x&&RAW[x.id]||[],xs=x&&sel[x.id]||new Set();
  // this game's points and 💬 the expressions of its learning path: all their questions
  const own=P.filter(p=>mine.has(p.k)).concat(X.filter(p=>xs.has(p.k))).reduce((t,p)=>t+p.qs.length+(cb?p.more.length:0),0);let rv=0;
  Object.entries(sel).forEach(([id,ks])=>{const Q=RAW[id];if(!Q||id===a||x&&id===x.id)return;Q.filter(p=>ks.has(p.k)).forEach(p=>{rv+=Math.min(n,p.qs.length+p.more.length)})});
  return {own,rv}}
// for Code Breakers (codebreakers.html &tp=): "deck.1.2,deck2.3"
const tpParam=tp=>Object.entries(tp).map(([id,ks])=>id+"."+ks.join(".")).join(",");

/* ---------- Firebase ---------- */
let liveBeat=null,ansStop=null;
function live(){
  if(!H.g||!H.sid||!H.deck)return;
  const s=cur(),qs=qList(),base={on:true,game:true,deck:location.pathname,title:gName(),sid:H.sid,phase:H.phase==="show"?(isQ(s)?"q":isN(s)?"notes":"theory"):H.phase,
    i:H.i,qn:qs.indexOf(H.i)+1,qt:qs.length,keys:H.keys,at:S.serverTimestamp()};
  if(s&&H.phase!=="end"&&H.phase!=="lobby"){
    if(isN(s)){const m=meta();base.nt={k:s.notes,topics:s.topics,deck:H.deckId,ls:lsId(),lp:m.lp||"",title:H.deck.title,course:m.course||"",kind:m.kind||""}}
    else if(isW(s))base.q={text:s.q,img:s.img||"",write:true};
    else if(isQ(s))base.q={text:s.q,img:s.img||"",opts:order(H.i).map(k=>s.options[k])};else base.th={title:s.theory||"",img:s.img||""};
    if(H.phase==="reveal")base.ok=isW(s)?s.write[0]:okAt(H.i);
  }
  // only the game's own fields: a pull-up (go) and the group's full screen (fs) stay as they are (Roger, 6 Nov 2026), so after the game
  // the students are kept and in full screen again; a field the slide does not use (q, th, ok, nt) is removed
  // the end: the class's % right, as on the board's 🏁 Well done!, also on the students' screens (Roger, 9 Nov 2026: "I want the percentage of the class at the end too")
  if(H.phase==="end"){const P=Object.keys(H.players),tot=P.length*qs.length,right=P.reduce((t,em)=>t+Object.values(H.aw).filter(l=>l.includes(em)).length,0);if(tot)base.cp=Math.round(right/tot*100)}
  // mode and cb are removed too (Roger, 16 Nov 2026: "I was seeing the proper game but students were playing a hacker game"): a 🕵️ Code
  // Breakers round leaves live/{group}.mode "cb", and play.js shows Code Breakers whenever it is there, so a class game must clear it
  const D=S.deleteField(),data=Object.assign({q:D,th:D,ok:D,nt:D,cp:D,mode:D,cb:D,offBy:D},base);
  S.setDoc(S.doc(db,"live",H.g),data,{mergeFields:Object.keys(data)}).catch(e=>{console.warn("live",e);H.err="⚠ The students can't see the game: "+e.message;draw()});
}
function liveOff(g,by){if(g)S.setDoc(S.doc(db,"live",g),Object.assign({on:false,at:S.serverTimestamp()},by?{offBy:by}:{}),{merge:true}).catch(e=>console.warn("live",e))}
addEventListener("pagehide",()=>{if(H.g&&H.sid&&H.teacher)liveOff(H.g,H.sid)});   // a reload puts it back on at once (the tab keeps the game)

// the students' answers docs say which game they are in (no extra reads): a newer game than ours → this board stops at once; an older game
// written after ours started (another board wrote live/{group} over ours) → ours is published again (at most every 5 s)
let reAt=0;
function otherGame(qs){let newer=false,older=false;qs.forEach(d=>{const x=d.data(),s=+x.sid||0,at=x.at&&x.at.toMillis?x.at.toMillis():0;if(s>H.sid)newer=true;else if(s&&s<H.sid&&at>H.sid+3000)older=true});
  if(newer){stepAside();return true}if(older&&Date.now()-reAt>5000){reAt=Date.now();live()}return false}
// offBy: the game whose board was closed or reloaded (pagehide) turned live/{group} off; if that was this board while a newer game was on,
// the newer game is turned on again (the newer board's writes remove offBy, so a game that really ended stays off)
async function taken(){if(!H.g||!H.sid)return false;try{const r=S.doc(db,"live",H.g),d=await S.getDoc(r),x=d.exists()?d.data():null;if(!(x&&+x.sid>H.sid))return false;
  if(x.on===false&&+x.offBy===H.sid)await S.setDoc(r,{on:true,offBy:S.deleteField(),at:S.serverTimestamp()},{merge:true});return true}catch(e){console.warn("live",e);return false}}
async function stepAside(){if(!H.g||!H.sid)return;const gn=groupName(H.g);clearInterval(liveBeat);if(ansStop)ansStop();ansStop=null;whoStop();G.music("");
  if(H.phase!=="lobby")try{await saveResults()}catch(e){console.warn("results",e)}   // what they answered still counts
  Object.assign(H,{g:"",sid:0,i:-1,phase:"pick",keys:{},aw:{},players:{},rp:undefined,tp:null,deck:H.deck0||H.deck});keep();H.note=`⏹ ${gn} is playing another game now (started on another screen), so this board stopped.`;draw()}
async function startGroup(){
  if(await taken())return stepAside();
  const g=H.g;H.err="";H.players={};
  if(!CMT)S.getDoc(S.doc(db,"live",g)).then(d=>{CMG=d.exists()&&d.data().go||null;CMGg=g;if(cmGroup())draw()}).catch(e=>console.warn("class mode",e));
  try{
    const [ro,pt]=await Promise.all([S.getDocs(S.query(S.collection(db,"roster"),S.where("group","==",g))),S.getDocs(S.collection(db,"points"))]);
    const names={},keys=new Set();
    ro.forEach(d=>{const x=d.data();keys.add(d.id);names[d.id]=(x.first||d.id.split("@")[0])+(x.surname1?" "+x.surname1[0]+".":"")});
    const pts={};pt.forEach(d=>{if(keys.has(d.id))pts[d.id]=+d.data()[H.term]||0});
    Object.assign(H,{names,pts});
  }catch(e){console.warn("game",e);H.err="⚠ Could not read the group: "+e.message}
  if(ansStop)ansStop();
  ansStop=S.onSnapshot(S.collection(db,"live",g,"answers"),qs=>{
    if(otherGame(qs))return;
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
  clearInterval(liveBeat);liveBeat=setInterval(async()=>{if(await taken())return stepAside();live()},60e3);   // every minute too: the students' devices know the game is still on
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
// Which groups played each game (Roger, 8 Nov 2026: "I need to know if the games-theory have been played in a class to make sure they all
// do them"): the game list and the group buttons show ✓ + day per group, from the same ls/{id}.played. One read per LS that has games,
// once per board load (PL = {deck: {group: ms}}); a game played here is added at once.
let PL=null,DN=null,plBusy=false;
async function loadPlayed(){
  if(PL||plBusy||!H.teacher)return;plBusy=true;const out={},dn={};
  const lsIds=[...new Set((window.EL_GAMES||[]).map(d=>{const nm=String(d.ls||"").replace(/^[^·]*·\s*/,"").trim().toLowerCase();
    const l=(window.EL_LS||[]).find(x=>x.course===d.course&&x.title.replace(/^[^·]*·\s*/,"").trim().toLowerCase()===nm);return l?l.id:""}).filter(Boolean))];
  await Promise.all(lsIds.map(async id=>{try{const d=await S.getDoc(S.doc(db,"ls",id)),p=(d.exists()&&d.data().played)||{};dn[id]=(d.exists()&&d.data().done)||{};
    for(const g in p)for(const k in p[g])(out[k]=out[k]||{})[g]=p[g][k]}catch(e){console.warn("played",e)}}));
  PL=out;DN=dn;plBusy=false;draw();
}
const plDay=ms=>new Date(+ms).toLocaleDateString("en-GB",{day:"numeric",month:"short"});

function markPlayed(){
  const id=lsId();if(!id||!H.g||!H.sid||playedSid===H.sid||!H.deck||H.deck.notes===false)return;playedSid=H.sid;
  if(PL&&!(PL[H.deckId]||{})[H.g])(PL[H.deckId]=PL[H.deckId]||{})[H.g]=H.sid;
  S.setDoc(S.doc(db,"ls",id),{played:{[H.g]:{[H.deckId]:H.sid}}},{merge:true}).catch(e=>{playedSid=0;console.warn("played",e)});
}
let savedSid=0;
async function saveResults(){
  markPlayed();
  if(!H.g||!H.sid||savedSid===H.sid||!H.deck)return;
  // a question nobody answered was skipped (Roger, 6 Nov 2026): it is not saved and never counts
  const qs=qList(),shown=qs.filter(i=>H.aw[i]&&answered(i).length);if(!shown.length&&!slides().some((s,i)=>isN(s)&&answered(i).length))return;
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
    qs:shown.map(i=>({n:num(i),q:String(slides()[i].q).replace(/\*\*/g,"").slice(0,160),ok:String(isW(slides()[i])?slides()[i].write[0]:slides()[i].options[0]).replace(/\*\*/g,"").slice(0,80),right:H.aw[i].length,of:answered(i).length,...(slides()[i]._rv?{d:slides()[i]._rv.d}:{})})),
    nts:nIdx.map(i=>({k:"p"+slides()[i].notes,topic:slides()[i].topics.join(" · ").slice(0,200)})),stu,...(H.tp?{tp:H.tp}:{})};
  savedSid=H.sid;
  try{await S.setDoc(S.doc(db,"gameResults",H.g+"_"+H.sid),doc)}catch(e){savedSid=0;console.warn("results",e);H.err="⚠ Results not saved: "+e.message;draw()}
  // each student's own result (Roger, 6 Nov 2026: "I want students to see their results in the games and suggestions of what to study"):
  // myGames/{email}.games[{group}_{sid}] = {deck, title, kind, ls, lp, day, sid, r, of, miss:[{n, q, a (their answer), ok, p (the notes part
  // whose theory it practises)}]} (firestore.rules: the student reads their own, only the teacher writes). One write per player per game;
  // the LS page's 📝 Your notes reads it once (shared/js/el-notes.js) and puts it with the theory and their notes.
  if(!shown.length)return;
  const partOf=i=>{const s=slides()[i];if(s&&s._p!=null)return s._p;for(let j=i-1;j>=0;j--)if(isN(slides()[j]))return "p"+slides()[j].notes;return ""};
  // 🔁 a review question (🧩 Which grammar?) counts for its own game's point: px {deck: {point: shown}} and d / dp on a miss
  const px={};shown.forEach(i=>{const r=slides()[i]._rv;if(r)(px[r.d]=px[r.d]||{})[r.dp]=(px[r.d][r.dp]||0)+1});
  // pn = how many shown questions practised each notes part (Roger, 9 Nov 2026: the student's % per grammar or vocabulary point in 🎓 My progress)
  const pn={};shown.forEach(i=>{const p=partOf(i);if(p)pn[p]=(pn[p]||0)+1});
  try{const w=S.writeBatch(db),key=H.g+"_"+H.sid;
    stu.forEach(x=>{const miss=x.miss.map(n=>{const i=qs[n-1],q=doc.qs.find(z=>z.n===n)||{};const r=slides()[i]._rv;return Object.assign({n,q:q.q||"",a:x.ans[n]==null?"":x.ans[n],ok:q.ok||"",p:partOf(i)},r?{d:r.d,dp:r.dp}:{})});
      w.set(S.doc(db,"myGames",x.e),{games:{[key]:{deck:H.deckId,title:H.deck.title,kind:doc.kind,ls:lsId(),lp:doc.lp,day,sid:H.sid,r:x.r,of:shown.length,pn,miss,...(Object.keys(px).length?{px}:{})}},updated:S.serverTimestamp()},{merge:true})});
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
  const x={game:true,on:true,phase:"q",sid:H.sid,at:Date.now(),title:H.deck&&gName()},left=WHO.left.filter(y=>ms(y.at)>=H.sid).map(y=>Object.assign({},y,{pull:H.sid}));
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
    else{
      // No theory slides in the class games (Roger, 16 Nov 2026: "during the game of vocab and grammar, I didn't want theory anymore"):
      // Next always jumps over the theory and 📝 notes slides, so a game is questions only. The decks keep their theory: it still splits
      // the questions into parts (pn, 🎯 What to study), it is on the LS page's 📝 Your notes (theory.js) and Code Breakers shows it after a wrong answer.
      let j=H.i+1;while(j<slides().length&&!isQ(slides()[j]))j++;
      if(j>=slides().length){H.i=slides().length-1;H.phase="end";saveResults();G.music("");G.fx("drum");setTimeout(()=>{G.fx("fanfare");G.confetti()},1700)}
      else{H.i=j;H.phase="show";H.step=1;G.fx("next");G.music("think")}}
  }
  keep();live();draw();autoReveal();
}
function more(){H.step++;keep();G.fx("tap");draw()}
// ⏭ Skip to the questions (Roger, 11 Nov 2026, playing a game again: "I can review the theory or just skip it and go to the questions"): on a
// theory or 📝 notes slide, jump to the next question, past the rest of this run of theory and its notes slide. Key: S.
const nextQ=()=>{for(let j=H.i+1;j<slides().length;j++)if(isQ(slides()[j]))return j;return -1};
// 🔁 A game the group has played before goes straight to the questions (Roger, 12 Nov 2026, on the whiteboard: "2nd time we play a game,
// no theory slides"): H.rp (replay) is on when ls/{id}.played (PL) already has this game for this group from an earlier game, or after
// "Play again". Then Next jumps over every theory and 📝 notes slide (the notes were taken the first time; absent students have the
// theory on their LS page anyway). The lobby says so and has 📖 Show the theory to turn it off for this game. undefined = not decided yet
// (PL still loading): decided when PL arrives, or at Start.
const playedBefore=()=>{const w=PL&&(PL[H.deckId]||{})[H.g];return w&&+w!==H.sid?+w:0};
const decideRp=()=>{if(H.rp===undefined&&PL){H.rp=!!playedBefore();keep()}};
function skipTheory(){const j=nextQ();if(j<0||H.phase!=="show"||isQ(cur()))return;H.i=j-1;go("next")}
const skipBtn=()=>nextQ()>=0?`<button class="btn ghost" data-do="skipth" title="Skip the theory and go straight to the next question (key S)">⏭ Skip to the questions<span class="kbd">S</span></button> `:"";
function primary(){
  if(H.phase==="lobby")go("next");
  else if(H.phase==="show")isQ(cur())?go("reveal"):moreToShow()?more():go("next");
  else if(H.phase==="reveal")go("next");
}
addEventListener("keydown",e=>{if(e.target.closest&&e.target.closest("input,select,textarea"))return;
  if([" ","Enter","ArrowRight","PageDown"].includes(e.key)){e.preventDefault();primary()}
  else if((e.key==="s"||e.key==="S")&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&H.teacher&&H.phase==="show"&&!isQ(cur())){e.preventDefault();skipTheory()}
  if(e.key==="m"||e.key==="M"){G.sound(!G.sound());draw()}
  if((e.key==="c"||e.key==="C")&&H.phase==="show"&&cur()&&cur().ca){caOn(!caOn());draw()}});

async function startGame(g,again){
  H.note="";H.tg="";try{sessionStorage.removeItem("elCB")}catch(e){}   // a Code Breakers round of this tab is over
  H.g=g;H.sid=Date.now();H.i=-1;H.phase="lobby";H.keys={};H.aw={};H.rp=again?true:undefined;H.ag=!!again;if(!H.tp)H.rvn=undefined;else if(!again)H.rvn=rvN();await build();decideRp();keep();G.music("lobby");startGroup();
}
// ■ End and Finish also send a group in class mode back to the class (cmBack, as 🎓 Back to class mode; Roger, 16 Nov 2026: "students
// couldn't leave the game once finished"): ending the game is the teacher saying so. Out of class mode cmBack changes nothing.
function endGame(){
  const g=H.g;saveResults();if(g)S.setDoc(S.doc(db,"live",g),{on:false,cmBack:Date.now(),at:S.serverTimestamp()},{merge:true}).catch(e=>console.warn("live",e));if(ansStop)ansStop();ansStop=null;whoStop();clearInterval(liveBeat);G.music("");
  Object.assign(H,{g:"",sid:0,i:-1,phase:"pick",keys:{},aw:{},players:{},rp:undefined,tp:null,deck:H.deck0||H.deck});keep();draw();
}

/* ---------- screens ---------- */
const top=()=>{const qs=qList(),qn=qs.indexOf(H.i)+1,s0=cur();
  const w=who(),{gone,back,never}=elWhoLeft(w);
  // only the counts on the board (Roger, 10 Nov 2026: "during the games students played to log in and out so that their name appeared"):
  // the names (who left, who came back, who is not here, who is in) open only when the teacher taps the pill (WHO.open)
  const box=WHO.open&&w.active?`<div class="whobox pop">${gone.length?`<p>${gone.map(y=>`<span class="o">✗ <b>${esc(y.name)}</b> · ${why(y)}</span>`).join("<br>")}</p>`:""}${back.length?`<p class="bk">↩ Left and came back (${back.length}): ${back.map(y=>`<b>${esc(y.name)}</b> <small>(${y.left.n>1?y.left.n+"×, last ":""}${hm(y.left.at)})</small>`).join(", ")}</p>`:""}${never.length?`<p class="nv">⚪ Not in the game (${never.length}): ${never.map(y=>esc(y.name)).join(", ")}</p>`:""}<p class="i">✓ In (${w.inn.length}): ${w.inn.map(y=>esc(y.name)).join(", ")||"nobody yet"}</p></div>`:"";
  return `<div class="top"><span class="pill">📡 ${esc(groupName(H.g))}</span><span class="pill">🎮 ${Object.keys(H.players).length}</span>
  ${w.active?`<button class="pill who${gone.length?" warn":""}" data-do="who" title="Who is in full screen and connected, who left and who is not in the game (tap to show or hide the names)">✓ ${w.inn.length} in · ✗ ${gone.length} left${back.length?` · ↩ ${back.length}`:""}${never.length?` · ⚪ ${never.length} not here`:""}</button>`:""}${box}
  ${H.i>=0&&H.phase!=="end"?`<span class="pill">${qn?`${isW(cur())?"✏️ ":""}Question ${qn} / ${qs.length}${cur()._rv?`${cur()._rv.ex?" · 💬 Expressions":""}${cur()._rv.own?"":` · 🔁 ${esc(cur()._rv.ls+" "+cur()._rv.lp)}`}`:""}`:isN(cur())?"📝 Notes":"Theory"}</span>`:""}<span class="sp"></span>
  ${H.err?`<span class="pill" style="background:#b3261e">${esc(H.err)}</span>`:""}
  ${H.phase==="show"&&s0&&!isQ(s0)&&s0.ca?`<button class="btn ghost${caOn()?" on":""}" data-do="ca" title="Catalan help on this slide (C)">CA</button>`:""}
  <button class="btn ghost" data-do="mute" title="Music and sounds (M)">${G.sound()?"🔊":"🔇"}</button>
  ${H.phase!=="end"?cmBtn():""}<button class="btn ghost" data-do="end" title="End the game for everyone">${Date.now()-endArm<3000?"Tap again to end":"■ End"}</button></div>`};
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
    // ONE 🧩 grammar game and ONE 📚 vocabulary game per LS (Roger, 16 Nov 2026: "so now we only have one game of grammar and one game of vocab
    // per LS"): each opens the LS's points to tick (drawPoints). Under it, which learning paths each group has played. The learning path
    // games still open from their learning path page and the Time plan; Code Breakers with both games of a path is on codebreakers.html.
    const lsCard=(c,l,kind)=>{const ds=list.filter(d=>d.course===c&&(d.ls||"")===l&&kindIs(d)===kind).sort((a,b)=>String(a.lp).localeCompare(String(b.lp),"en",{numeric:true}));if(!ds.length)return "";
      const id=lsOf(ds[0]),gs=(window.EL_GROUPS||[]).filter(g=>g.course===c);
      const pl=PL?`<br><small class="pl">${gs.map(g=>{const n=ds.filter(d=>(PL[d.id]||{})[g.id]).map(d=>lpNum(d));return n.length?`<span class="pl-y">✓ ${esc(g.name)}: ${esc(n.join(" "))}</span>`:`<span class="pl-n">✗ ${esc(g.name)}</span>`}).join(" ")}</small>`:"";
      return `<button class="btn deckbtn slidein" data-do="lsgame" data-ls="${esc(id)}" data-kind="${kind}"><span class="e">${kind==="vocab"?"📚":"🧩"}</span><span>${kind==="vocab"?"Vocabulary":"Grammar"} · ${esc(String(l).split(" · ")[0])}<br><small style="opacity:.7">${ds.map(d=>esc(lpNum(d))).join(" · ")}: tick the points you've done</small>${pl}</span></button>`};loadPlayed();
    const cols=by(list,"course").map(c=>{const g=list.filter(d=>d.course===c);
      return `<section class="course"><h2>${c==="2eso"?"2 ESO":c==="4eso"?"4 ESO":esc(c)}</h2>${by(g,"ls").map(l=>`${l?`<h3>${esc(l)}</h3>`:""}<div class="picks">${lsCard(c,l,"grammar")}${lsCard(c,l,"vocab")}</div>`).join("")}</section>`}).join("");
    app$.innerHTML=`<div class="center"><div><h1 class="logo pop">🎮 Class game</h1><p class="sub">Choose a game, then play it as a 🎮 Quiz or as 🕵️ Code Breakers. All games are at Safe level. Each LS has one 🧩 grammar game and one 📚 vocabulary game: you tick the points you've done.</p>${cols?`<div class="courses">${cols}</div>`:"<p>No games yet.</p>"}<p>${backBtn()}<a class="btn ghost" href="results.html" target="_blank" rel="noopener">📊 Results</a> <a class="btn ghost" href="../../teacher.html">← Dashboard</a></p></div></div>`;return}
  if(H.tg&&!H.g){drawPoints();return}
  if(H.phase==="pick"||!H.g){
    loadPlayed();
    const course=H.deck.course||((window.EL_GAMES||[]).find(d=>d.id===H.deckId)||{}).course,gs=(window.EL_GROUPS||[]).filter(g=>!course||g.course===course);   // the game's course (decks/index.js)
    const cb=fmt()==="cb",lpN=String(meta().lp||"").split(" · ")[0];
    app$.innerHTML=`<div class="center"><div><h1 class="logo pop">${esc(boardName())}</h1>${H.note?`<p class="card msg pop" style="margin:.4em auto 1em">${esc(H.note)}</p>`:""}
      <div class="fmt" role="radiogroup" aria-label="How to play it"><span>How do you want to play it?</span><button class="btn${cb?" ghost":" go on"}" role="radio" aria-checked="${!cb}" data-do="fmt" data-f="quiz">🎮 Quiz</button><button class="btn cbbtn${cb?" on":" off"}" role="radio" aria-checked="${cb}" data-do="fmt" data-f="cb">🕵️ Code Breakers</button></div>
      <p class="sub">${cb?`Questions only, no theory. <b>Each student at their own pace</b> on their Chromebook: a right answer opens a file (💾 bits, 🛡️ firewall, 💻 hack…). Only the % right counts for their marks.`:`${H.lsg?"Questions on the points you tick":qList().length+" questions"}, no theory. <b>Everyone answers the same question</b>, on the board. Every right answer is +1 point.`}<br>Start it for a group: its students are taken into it.</p>
      <div class="picks">${gs.map(g=>{const w=PL&&(PL[H.deckId]||{})[g.id];return `<button class="btn deckbtn${cb?" cbbtn":" go"}" data-do="group" data-g="${g.id}">${cb?"🕵️":"▶"} ${esc(g.name)}${PL&&!cb?`<br><small class="pl">${w?`<span class="pl-y">✓ played ${esc(plDay(w))}</span>`:`<span class="pl-n">not played yet</span>`}</small>`:""}</button>`}).join("")}</div>
      ${cb&&lpN&&!H.lsg&&/-lp[1-3]-/.test(H.deckId)?`<p><a class="btn ghost" href="codebreakers.html?deck=${encodeURIComponent(H.deckId)}${BACK?"&from="+encodeURIComponent(BACK):""}">🕵️ ${esc(lpN)} with both games in one round <small style="opacity:.75;margin-left:.3em">(vocabulary + grammar)</small></a></p>`:""}
      <p>${backBtn()}<button class="btn ghost" data-do="decks">← Other games</button> <a class="btn ghost" href="../../teacher.html${course?"?course="+course:""}">← Dashboard</a></p></div></div>`;return}
  const s=cur(),P=Object.keys(H.players);
  if(H.phase==="lobby"){
    loadPlayed();decideRp();const pb=playedBefore(),again=!pb&&H.ag;
    const rpLine=pb?`<p class="rp pop">🔁 Played on ${esc(plDay(pb))}.</p>`:"";
    const tpLine=H.tp?`<p class="rp pop">${kindOf()==="vocab"?"📚":"🧩"} ${qList().length} questions on ${Object.values(H.tp).reduce((t,a)=>t+a.length,0)} ${kindOf()==="vocab"?"vocabulary":"grammar"} points${Object.keys(H.tp).some(id=>id!==H.deckId)?`, with 🔁 review of earlier learning paths`:""}.</p>`:"";
    app$.innerHTML=top()+`<div class="main"><div class="center" style="padding:0"><div style="width:100%">
      <h1 class="logo pop">${esc(gName())}</h1>
      <div class="join"><div class="card">💻 Sign in on your Chromebook: the game opens by itself.</div><div class="count">🎮 ${P.length} player${P.length===1?"":"s"}</div>
        <button class="btn go" data-do="next" style="font-size:1.2em">Start ▶</button></div>${rpLine}${tpLine}
      <div class="names">${P.sort((a,b)=>nameOf(a).localeCompare(nameOf(b))).map(em=>`<span${seen.has(em)?"":' class="pop"'}>${esc(nameOf(em))}</span>`).join("")||'<span style="background:none;color:#fff;box-shadow:none;opacity:.8">Waiting for students…</span>'}</div>
    </div></div></div>`;P.forEach(em=>seen.add(em));return}
  if(H.phase==="end"){
    const score=em=>Object.values(H.aw).filter(l=>l.includes(em)).length,qs=qList().length;
    const rank=P.map(em=>({em,n:score(em)})).filter(x=>x.n>0).sort((a,b)=>b.n-a.n||nameOf(a.em).localeCompare(nameOf(b.em))).slice(0,3);
    const tot=P.length*qs,right=P.reduce((t,em)=>t+score(em),0),pod=[rank[1],rank[0],rank[2]],cls=["p2","p1","p3"],medal=["🥈","🥇","🥉"];
    app$.innerHTML=top()+`<div class="main"><div class="center" style="padding:0"><div style="width:100%">
      <div style="display:flex;align-items:center;justify-content:center;gap:28px;flex-wrap:wrap">${tot?G.ring(right/tot*100,"the class got right","170px"):""}<div style="flex:0 1 auto"><h1 class="logo pop" style="margin:0">🏁 Well done!</h1><p class="sub">Every right answer is +1 point.</p></div></div>
      ${rank.length?"":`<p class="card msg" style="margin:1em auto">No right answers this time. Next time!</p>`}<div class="podium"${rank.length?"":" hidden"}>${pod.map((x,k)=>x?`<div class="${cls[k]} slidein" style="animation-delay:${[.8,1.6,0][k]}s"><span class="nm">${esc(nameOf(x.em))}<br><span class="sc">${x.n} right</span></span><span class="blk">${medal[k]}</span></div>`:"<div></div>").join("")}</div>
      <p><button class="btn go" data-do="finish">Finish</button> <button class="btn ghost" data-do="again">Play again</button> <a class="btn ghost" href="results.html?g=${encodeURIComponent(H.g)}" target="_blank" rel="noopener">📊 Results</a> ${backBtn()}</p></div></div></div>`;return}
  if(!isQ(s)&&!isN(s)){
    const bl=blocks(s),n=s.step?Math.max(1,H.step):bl.length,ca=[].concat(s.ca||[]);
    const block=(l,k)=>blockHtml(l,k>=n?' style="visibility:hidden"':"",s.step&&k===n-1&&k>0?" pop":"");
    // 📓 drawn like the student's notebook (Roger, 14 Nov 2026: "when doing the grammar, the vocab, and the reading together, and I present
    // information, I want the slide have this style"): lined paper, a 📚 Vocabulary / 🧩 Grammar post-it with the learning path, the title
    // in pencil and the explanation on a taped slip in the teacher's handwriting (el-notebook.css, .nbk in host.html)
    const kd=kindOf(),lp=String(meta().lp||"").split(" · ")[0];
    app$.innerHTML=top()+`<div class="main"><div class="card theory nbk slidein${s.wide?" wide":""}"><div class="nbtop"><span class="nb-postit k-${kd==="vocab"?"vocab":kd==="grammar"?"grammar":"other"}">${kd==="vocab"?"📚 Vocabulary":kd==="grammar"?"🧩 Grammar":"📘 Theory"}${lp?`<small>${esc(lp)}</small>`:""}</span></div>
      <div class="pic">${pic(s.img)}</div><div class="tx"><h2 class="nb-h3">${md(s.theory)}</h2><div class="nb-slip">${bl.map(block).join("")}
      ${ca.length&&caOn()?`<div class="ca pop"><b>En català</b>${ca.map(l=>`<p>${md(l)}</p>`).join("")}</div>`:""}</div></div></div>
      <div style="text-align:right">${skipBtn()}${moreToShow()?`<span class="stepn">${n} / ${bl.length}</span> <button class="btn go" data-do="more">Show more ▼<span class="kbd">Space</span></button>`:`<button class="btn go" data-do="next">Next ▶<span class="kbd">Space</span></button>`}</div></div>`;return}
  const rev=H.phase==="reveal",n=answered(H.i).length;
  if(isN(s)){   // 📝 Take your notes: the theory of the run again, small, while the students write on their devices
    const recap=s.from.map(i=>slides()[i]).map(t=>`<section class="nb-slip"><h3>${pic(t.img)} ${md(t.theory)}</h3>${(t.lines||[]).map(l=>blockHtml(l,"","")).join("")}</section>`).join("");
    app$.innerHTML=top()+`<div class="main"><div class="card notes nbk slidein"><div class="nhead"><span class="nemo">📝</span><div><h2>Take your notes</h2>
      <p>On your Chromebook: write <b>2 sentences</b> of your own using ${noteWhat(meta().kind,H.deckId)}, and <b>anything that helps you remember</b> the theory. They are saved on your LS page, in <b>📝 Your notes</b>.</p></div>
      <div class="stat"><b>${n}</b>writing${P.length?` / ${P.length}`:""}</div></div><div class="recap">${recap}</div></div>
      <div style="text-align:right">${skipBtn()}<button class="btn go" data-do="next">Next ▶<span class="kbd">Space</span></button></div></div>`;return}
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

// 🧩 Which grammar? for the group H.tg: every grammar point of the course's grammar games, by LS and learning path, ticked by the Time plan
function drawPoints(){
  const g=H.tg,cb=fmt()==="cb",head=`<h1 class="logo pop">${esc(boardName())}</h1>`,what=kindOf()==="vocab"?"vocabulary":"grammar";
  if(!PL||!pointsReady()){loadPlayed();loadPoints();app$.innerHTML=`<div class="center"><div>${head}<p class="sub">Loading the grammar points…</p></div></div>`;return}
  if(!H.tsel)H.tsel=tpDefault(g);
  const sel=H.tsel,day=v=>{const t=/^\d{4}-\d\d-\d\d$/.test(String(v))?new Date(v+"T12:00:00"):new Date(+v||v);return isNaN(t)?"":t.toLocaleDateString("en-GB",{day:"numeric",month:"short"})};
  const lsList=[...new Set(gDecks().map(d=>d.ls||""))];
  // the ticks of one deck's points (a grammar deck, or 💬 the expressions of its learning path's vocabulary deck, labelled as such)
  const A=anchor(sel),rows=(d,me)=>{const P=ptsOf(d),done=doneOf(d,g),info=d.act&&Object.keys(done).some(k=>k.startsWith(d.act+"#")),pl=PL&&(PL[d.id]||{})[g],on=sel[d.id]||new Set(),ex=kindIs(d)==="vocab"&&kindOf()==="grammar";
    const why=p=>{if(p.tab&&info){const v=done[d.act+"#"+p.tab];return v?`<span class="tpy">✓ done${day(v)?" "+esc(day(v)):""}</span>`:`<span class="tpn">not done yet</span>`}
      return pl?`<span class="tpy">✓ ${ex?"vocabulary ":""}game played ${esc(plDay(pl))}</span>`:me?"":`<span class="tpn">${ex?"vocabulary ":""}game not played yet</span>`};
    return P.map(p=>`<label class="tpi${on.has(p.k)?" on":""}"><input type="checkbox" data-do="tpk" data-id="${esc(d.id)}" data-k="${p.k}"${on.has(p.k)?" checked":""}><span class="tpt">${ex?"💬 <b>Expressions</b> · ":""}${esc(p.name)}</span><small>${why(p)}</small></label>`).join("")};
  const lp=d=>{const me=d.id===A,x=exDeck(d);
    return `<div class="tplp${me?" me":""}"><div class="tph"><b>${esc(d.lp||d.title)}</b>${me?`<span class="tpme">${H.lsg?"All its questions":"This game"}</span>`:""}<span class="sp"></span><button class="tpa" data-do="tpall" data-id="${esc(d.id)}">All</button><button class="tpa" data-do="tpnone" data-id="${esc(d.id)}">None</button></div>
      ${rows(d,me)}${x&&RAW[x.id]?rows(x,me):""}</div>`};
  const c=tpCount(sel,cb),n=H.rvn||rvN(),none=!Object.values(sel).some(x=>x.size),tot=c.own+c.rv;
  app$.innerHTML=`<div class="center tpwrap"><div style="width:100%">${head}
    <p class="sub">${what==="vocabulary"?"📚":"🧩"} <b>Which ${what} for ${esc(groupName(g))}?</b> Ticked = done in class (Time plan) or a game you played. Untick what you haven't taught yet: it gets no questions.${H.lsg?` The newest learning path ticked gets all its questions; each earlier point gets 🔁 review questions.`:` Tick earlier points to review them.`}</p>
    <div class="tpcols">${lsList.map(l=>`<section class="course tpls">${l?`<h3>${esc(l)}</h3>`:""}${gDecks().filter(d=>(d.ls||"")===l).map(lp).join("")}</section>`).join("")}</div>
    <div class="tpbar"><span class="tpnum">🔁 Each earlier point:</span>${[1,2,3,99].map(k=>`<button class="btn${k===n?" go":" ghost"}" data-do="tpn" data-n="${k}">${k===99?"all":k} question${k>1?"s":""}</button>`).join("")}
      <b class="tptot">${none?"Tick at least one point":`${tot} question${tot===1?"":"s"}${c.rv?` (${c.own} from ${esc(lpNum(gm(A))||"this game")} + ${c.rv} review)`:""}${cb?" · 🕵️ each at their own pace":""}`}</b>
      <button class="btn ${cb?"cbbtn":"go"}" data-do="tpgo"${none?" disabled":""} style="font-size:1.1em">${cb?"🕵️":"▶"} Start for ${esc(groupName(g))}</button></div>
    <p>${backBtn()}<button class="btn ghost" data-do="tpback">← Groups</button></p></div></div>`;
}

let endArm=0;
const seen=new Set();   // names already on the lobby (only a new one pops in)
app$.addEventListener("click",async e=>{
  const b=e.target.closest("[data-do]");if(!b)return;const d=b.dataset.do;
  if(d==="signin"){try{const p=new A.GoogleAuthProvider();p.setCustomParameters({prompt:"select_account"});await A.signInWithPopup(auth,p)}catch(x){console.warn("sign in",x)}}
  if(d==="signout")A.signOut(auth);
  if(d==="lsgame"){const L=lsGames(b.dataset.ls,b.dataset.kind);if(!L.length)return;H.lsg={ls:b.dataset.ls,kind:b.dataset.kind};H.tp=null;H.tg="";H.deckId=L[L.length-1].id;
    history.replaceState(null,"","?ls="+encodeURIComponent(H.lsg.ls)+"&kind="+H.lsg.kind);if(!await loadDeck(H.deckId))H.err="Could not load the game.";draw();return}
  if(d==="deck"){H.lsg=null;H.tp=null;H.tg="";H.deckId=b.dataset.id;history.replaceState(null,"","?deck="+encodeURIComponent(H.deckId));if(!await loadDeck(H.deckId))H.err="Could not load the game.";draw()}
  if(d==="decks"){H.deck=H.deck0=null;H.deckId="";H.tp=null;H.tg="";H.lsg=null;history.replaceState(null,"",location.pathname);draw()}
  if(d==="group"&&/^(grammar|vocab)$/.test(kindOf())){H.tg=b.dataset.g;H.tsel=null;H.err="";loadPlayed();loadPoints();draw();window.scrollTo(0,0);return}
  if(d==="group"){if(fmt()==="cb"){keep();location.href="codebreakers.html?game="+encodeURIComponent(H.deckId)+"&g="+encodeURIComponent(b.dataset.g)+"&go=1"+(BACK?"&from="+encodeURIComponent(BACK):"");return}startGame(b.dataset.g)}
  if(d==="fmt"){fmt(b.dataset.f);draw()}
  if(d==="tpk"){const s=H.tsel&&H.tsel[b.dataset.id];if(s){const k=+b.dataset.k;if(b.checked)s.add(k);else s.delete(k);draw()}}
  if(d==="tpall"||d==="tpnone"){const dk=gm(b.dataset.id);if(RAW[b.dataset.id]&&H.tsel){[dk,exDeck(dk)].forEach(x=>{if(x&&RAW[x.id])H.tsel[x.id]=new Set(d==="tpall"?ptsOf(x).map(p=>p.k):[])});draw()}}
  if(d==="tpn"){rvN(+b.dataset.n);draw()}
  if(d==="tpback"){H.tg="";H.tsel=null;draw()}
  if(d==="tpgo"&&H.tsel){const g=H.tg,a=anchor(H.tsel),tp=tpFrom(H.tsel,a);if(tp&&!Object.keys(tp).length)return;
    if(a!==H.deckId){H.deckId=a;if(!await loadDeck(a)){H.err="Could not load the game.";draw();return}}
    if(H.lsg)history.replaceState(null,"","?deck="+encodeURIComponent(a)+"&ls="+encodeURIComponent(H.lsg.ls)+"&kind="+H.lsg.kind);
    if(fmt()==="cb"){keep();location.href="codebreakers.html?game="+encodeURIComponent(H.deckId)+"&g="+encodeURIComponent(g)+"&go=1"+(tp?"&tp="+encodeURIComponent(tpParam(tp))+"&rn="+rvN()+"&rs="+(Date.now()%1e6):"")+(BACK?"&from="+encodeURIComponent(BACK):"");return}
    H.tp=tp;H.tsel=null;startGame(g)}
  if(d==="next")go("next");
  if(d==="skipth")skipTheory();
  if(d==="more")more();
  if(d==="ca"){caOn(!caOn());draw()}
  if(d==="reveal")go("reveal");
  if(d==="mute"){G.sound(!G.sound());draw()}
  if(d==="who"){WHO.open=!WHO.open;drawTop()}
  if(d==="end"){if(Date.now()-endArm<3000)endGame();else{endArm=Date.now();b.textContent="Tap again to end";setTimeout(()=>{if(b.isConnected)b.textContent="■ End"},3000)}}
  if(d==="finish")endGame();
  if(d==="cmback"){if(cmPlaying()&&Date.now()-cmArm>=3000){cmArm=Date.now();draw();setTimeout(()=>{if(Date.now()-cmArm>=3000)draw()},3100)}else backToClass()}
  if(d==="again"){const g=H.g;startGame(g,true)}
  if(d==="rp"){H.rp=!H.rp;keep();draw()}
});

A.onAuthStateChanged(auth,async u=>{
  H.user=u;H.teacher=!!u&&TEACHERS.includes((u.email||"").toLowerCase());
  if(H.teacher&&H.deckId&&!H.deck&&!await loadDeck(H.deckId)){H.deckId="";H.phase="pick";H.g="";H.sid=0;keep()}
  if(H.teacher&&H.deck&&H.g&&H.sid&&H.tp)await build();
  if(H.teacher&&H.deck&&H.g&&H.sid){if(H.phase==="lobby")G.music("lobby");else if(H.phase==="show"&&isQ(cur()))G.music("think");startGroup()}
  draw();
});
