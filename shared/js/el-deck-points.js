// Class quiz with individual points in a class presentation (Roger, 25–26 Oct 2026; the rules and the bonus are in el-points.js, which
// loads first). Load it after the slides and before the deck's own script. The deck has:
//   <section class="slide" data-el-points></section>: the reminder, filled here so every presentation explains the points;
//   #teambar (data-course="4eso": the groups to choose from, data-ls: the deck's LS) and #teamsBtn, which opens and closes it.
// Teacher (signed in with the teacher's account): choosing the class group in the strip starts the class: the screen publishes where it
// is (live/{group}: slide, step, revealed answers, option order; every step and every minute) and listens to the students' answers
// (live/{group}/answers/{email} = {sid, a:{question: value}, at}). When the teacher shows a question's answer, every student who tapped
// the right one gets +1 (points/{email}.{term}), once per question and class session; the group's best goes to teams/{group}.best.{term}.
// The projector shows how many joined, how many answered and, once shown, how many were right and the votes per option. No names.
// Student: a presentation is the teacher's. Anyone who is not signed in as the teacher only follows it: the slides stay covered by the
// player (the current question and its options, nothing else, so the answers stay on the board until the teacher shows them) and the
// deck's own navigation is off. The Learning Path's deck link opens it with ?live={group} (el-live-join.js); a signed-in student
// without it follows their own group (student list). They tap an option; once the teacher shows the answer they see ✓ or ✗ and look
// at the board for the reason. Catalan for an Insecure student (their route).
// The deck's own script announces every step (deckstep) and follows with ELDeck.show(state) (window.ELDeck: info, show, setCa).
(function(){
const SRC=document.currentScript.src,FB="https://www.gstatic.com/firebasejs/10.14.1/";
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const B=(en,ca)=>`<span class="l-en">${en}</span><span class="l-ca">${ca}</span>`;
const store={get(k,d){try{const v=localStorage.getItem("elDeck."+k);return v===null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem("elDeck."+k,JSON.stringify(v))}catch(e){}}};

const css=document.createElement("style");
css.textContent=`
.teambar{padding:.4em max(16px,env(safe-area-inset-right,0px)) .4em max(16px,env(safe-area-inset-left,0px));background:var(--surface);border-top:1px solid var(--line)}
.trow{display:flex;gap:.6em;align-items:center;flex-wrap:wrap}
.who{font-size:.6em;line-height:1.2;color:var(--muted);margin-top:.2em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.teambar select{font:600 .8em var(--f-body);color:var(--ink);background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:.25em .4em}
.tstat{font-size:.7em;color:var(--muted);white-space:nowrap}.tstat.no{color:var(--no)}.tstat b{color:var(--ink)}
:root.el-stu .teambar{display:none!important}   /* a signed-in student: the strip is the teacher's */
.ellive{display:inline-flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:.2em .5em;font:600 .75em/1.25 var(--f-body);color:var(--accent);text-align:center;min-width:0}
.ellive a{color:var(--accent);display:inline-block;padding:.45em .2em}.ellive button{min-height:36px;border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:999px;padding:.3em .9em;font:600 1em var(--f-body);touch-action:manipulation}   /* big enough to tap on a touch screen */
.ptrule{display:flex;gap:.7em;align-items:flex-start;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:.45em .9em;min-width:0}
.ptrule .ico{font-size:1.4em;line-height:1.1;flex:0 0 auto}.ptrule b{display:block}
[data-q]{position:relative;-webkit-tap-highlight-color:transparent}[data-q] .opt{position:relative}
.qres{position:absolute;top:-.75em;right:-.4em;z-index:2;background:var(--ink);color:var(--bg);border-radius:999px;padding:.15em .65em;font:700 .72em/1.35 var(--f-body);box-shadow:0 2px 8px rgba(0,0,0,.2);white-space:nowrap;pointer-events:none}
.qres.ok{background:var(--ok);color:#fff}
.opt .ocnt{position:absolute;top:-.6em;right:-.5em;background:var(--ink);color:var(--bg);border-radius:999px;min-width:1.7em;padding:.05em .45em;font:700 .75em/1.45 var(--f-body);text-align:center;font-variant-numeric:tabular-nums}
.elplay{position:fixed;left:0;right:0;top:0;z-index:60;overflow:auto;background:var(--bg);color:var(--ink);font-family:var(--f-body);padding:max(16px,env(safe-area-inset-top,0px)) max(16px,env(safe-area-inset-right,0px)) 16px max(16px,env(safe-area-inset-left,0px))}
.elplay[hidden]{display:none}
.elplay .pc{max-width:720px;margin:0 auto}
.elplay h2{font:800 1.3em/1.2 var(--f-body);margin:0 0 .6em}
.elplay .st{margin:0 0 1em;min-height:1.5em}.elplay .st .ellive{font-size:.95em;justify-content:flex-start;text-align:left}
.elplay .wait{text-align:center;color:var(--muted);font:600 1.15em/1.4 var(--f-body);padding:2.5em 0}
.elplay .pq{margin:0 0 1.3em}
.elplay .q{font:700 1.2em/1.35 var(--f-body);margin:0 0 .6em}.elplay .q .emo{margin-right:.3em}
.elplay .po{display:grid;gap:.6em}
.elplay .po button{min-height:56px;padding:.6em 1em;border-radius:14px;border:2px solid var(--line);background:var(--surface);color:var(--ink);font:700 1.1em/1.3 var(--f-body);text-align:left;cursor:pointer;touch-action:manipulation}
.elplay .po button.on{border-color:var(--accent);background:var(--soft)}
.elplay .po button.ok{border-color:var(--ok);background:var(--ok-bg)}.elplay .po button.no{border-color:var(--no);background:var(--no-bg)}
.elplay .po button:disabled{cursor:default}
.elplay .pr{font:700 1.05em/1.3 var(--f-body);margin:.5em 0 0}.elplay .pr.ok{color:var(--ok)}.elplay .pr.no{color:var(--no)}
.cbm{display:none}:root.el-cb .cbm{display:inline-flex}:root.el-cb .ask:has(.cbm)>.mode:not(.cbm){display:none}   /* Chromebook mode */
:root.deck-live .go321{display:none}   /* following: 3 · 2 · 1, the timer and the random number are the teacher's */`;
document.head.appendChild(css);

/* ---------- reminder slide: the rules, then a quick check with new numbers every day ---------- */
// By the date, not at random, so the projector and the students following on their devices show the same numbers.
const EX=[[12,15],[8,16],[12,20],[14,20],[9,10],[6,15],[15,25],[16,20]],today=new Date();
$$(".slide[data-el-points]").forEach(s=>{
  const [m,b]=EX[(today.getFullYear()*372+today.getMonth()*31+today.getDate())%EX.length],x=elBonus(m,b),N=n=>elNum(n,"en"),C=n=>elNum(n,"ca"),opt=(n,ok)=>`<button type="button" class="opt"${ok?" data-ok":""} data-ca="+${C(n)}">+${N(n)}</button>`;
  s.dataset.title=s.dataset.title||"Points";
  s.innerHTML=`<p class="eyebrow" data-ca="Cada classe · Punts">Every class · Points</p>
  <h2 data-ca="Avui pots guanyar punts">You can win points today</h2>
  <div class="cols">
    <div class="stack">${elPointsRules().map(r=>`<p class="ptrule"><span class="ico" aria-hidden="true">${r.icon}</span><span data-ca="${esc(r.ca)}">${r.en}</span></p>`).join("")}</div>
    <div class="stack">
      <div class="ask"><span class="mode" data-ca="✋ Mostra 1, 2 o 3 dits">✋ Show 1, 2 or 3 fingers</span><button type="button" class="go321" data-say="fingers" data-ca="3 · 2 · 1 · Ja!">3 · 2 · 1 · Show!</button></div>
      <div class="poll" data-open="1">
        <p class="q" data-ca="Tens <b>${m}</b> punts i el millor de la classe en té <b>${b}</b>. Quant suma a la teva nota del trimestre?">You have <b>${m}</b> points and the best student has <b>${b}</b>. How much does it add to your term grade?</p>
        <div class="opts">${opt(x,true)}${opt(EL_POINTS_BONUS)}${opt(m/10)}</div>
        <p class="why ans" data-ca="${m} ÷ ${b} × ${C(EL_POINTS_BONUS)} = <b>+${C(x)}</b>. Un 4,8 passa a ser un ${C(4.8+x)}: aprovat!">${m} ÷ ${b} × ${N(EL_POINTS_BONUS)} = <b>+${N(x)}</b>. A 4.8 becomes a ${N(4.8+x)}: you pass!</p>
      </div>
      <p class="small" data-ca="Respon al Chromebook i mira els teus punts al teu tauler.">Answer on your Chromebook and check your points on your board.</p>
    </div>
  </div>`;
});

/* ---------- the class strip (teacher) ---------- */
const bar=$("#teambar"),btn=$("#teamsBtn");
if(!bar)return;
// T.group: the class group the class is on (kept for this tab only, so a reload goes on with the class and no other tab or later visit
// starts broadcasting by itself: Roger, 26 Oct 2026, an old tab kept the class on); T.data: that group's
// students and points this term {g, term, keys, pts:{email:n}}. T.sid: this class session (the time the group was chosen), so the
// students' answers start empty every class; T.ans: their answers {A:{email:{q:v}}, R:{q:{v:n}}, n, who}; T.aw: {q:[email]} awarded.
const T={fb:null,user:null,teacher:false,group:"",data:null,msg:"",sid:0,ans:null,aw:{}};
const tab={get(k,d){try{const v=sessionStorage.getItem("elDeck."+k);return v===null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{sessionStorage.setItem("elDeck."+k,JSON.stringify(v))}catch(e){}}};
{const g=tab.get("group",null);if(g&&g.g&&g.deck===location.pathname&&Date.now()-g.at<3*3600e3){T.group=g.g;T.sid=g.at}
  const aw=tab.get("aw",null);if(aw&&aw.sid===T.sid)T.aw=aw.q||{}}
const ready=()=>T.teacher&&T.group&&T.data&&T.data.g===T.group;
const resized=()=>dispatchEvent(new Event("resize"));
const groups=()=>(window.EL_GROUPS||[]).filter(g=>!bar.dataset.course||g.course===bar.dataset.course);
const best=()=>ready()?Math.max(0,...T.data.keys.map(k=>T.data.pts[k]||0)):0;

function draw(){
  const D=ready()?T.data:null,on=!!(T.teacher&&T.group);
  const sel=T.teacher?`<select id="teamGroup" aria-label="Class group" title="Start the class: choose the class group">${on?"":`<option value="">▶ Start the class…</option>`}${groups().map(g=>`<option value="${g.id}"${g.id===T.group?" selected":""}>📡 ${esc(g.name)}</option>`).join("")}${on?`<option value="">■ Stop</option>`:""}</select>`:"";
  const stat=T.msg?`<span class="tstat no">${T.msg}</span>`
    :D?(T.ans?`<span class="tstat" title="Students following this presentation on their device">📡 <b id="ansN">${T.ans.n}</b> ${B("joined","connectats")}</span>`:"")+`<span class="tstat" title="The best student of the group this term">🏆 ${B("best","millor")} <b id="ptBest">${best()}</b></span><button type="button" class="tool" id="teamsReload" title="Load the group again">↻</button>`
    :on?"":T.teacher?"":`<button type="button" class="tool" id="teamsSignIn" title="Sign in with the teacher's account to start the class">▶ ${B("Start the class","Comença la classe")}</button>`;
  const who=T.ans?T.ans.who:[];
  bar.innerHTML=`<div class="trow">${sel}${stat}</div>`+(T.ans?`<div class="who" id="ansWho" title="Students following this presentation on their device"${who.length?"":" hidden"}>${esc(who.join(" · "))}</div>`:"");
  if(btn)btn.innerHTML=on?`📡<span class="tl"> ${esc((groups().find(g=>g.id===T.group)||{}).name||T.group)}</span>`:`📡<span class="tl" data-ca=" Classe"> Class</span>`;
  resized();cbMode();
}
function toggle(on){
  bar.hidden=on===undefined?!bar.hidden:!on;
  if(btn)btn.setAttribute("aria-pressed",String(!bar.hidden));
  store.set("teamsOn",!bar.hidden);
  if(!bar.hidden)cloud();
  resized();
}

/* Firebase loads the first time the strip opens. */
const loadScript=src=>new Promise(r=>{const s=document.createElement("script");s.src=src;s.onload=s.onerror=r;document.head.append(s)});
function cloud(){
  return T.fb=T.fb||(async()=>{
    const cfg=new URL("el-firebase.js",SRC).href,cat=new URL("el-catalog.js",SRC).href;   // first, so a bad address fails before any import starts
    const [{initializeApp,getApps},A,S,C]=await Promise.all([import(FB+"firebase-app.js"),import(FB+"firebase-auth.js"),import(FB+"firebase-firestore.js"),import(cfg),window.EL_GROUPS?0:loadScript(cat)]);
    const app=getApps()[0]||initializeApp(C.CONFIG),fb={A,S,auth:A.getAuth(app),db:S.getFirestore(app)};
    A.onAuthStateChanged(fb.auth,u=>{T.user=u;T.teacher=!!u&&C.TEACHERS.includes((u.email||"").toLowerCase());document.documentElement.classList.toggle("el-stu",!!u&&!T.teacher);if(T.teacher&&T.group)load();else{listen("");draw()}joinLive(u)});
    return fb;
  })().catch(e=>{console.warn("class quiz",e);T.fb=null;return null});
}
async function load(){
  const fb=await cloud(),g=T.group;if(!fb||!g)return draw();
  const {S,db}=fb,term=elTerm();T.data=null;T.msg=B("Starting the class…","Començant la classe…");draw();
  try{
    const [ro,pt]=await Promise.all([S.getDocs(S.query(S.collection(db,"roster"),S.where("group","==",g))),S.getDocs(S.collection(db,"points"))]);
    let keys=ro.docs.map(d=>d.id);
    if(!keys.length)keys=(await S.getDocs(S.query(S.collection(db,"students"),S.where("group","==",g)))).docs.map(d=>(d.data().email||"").toLowerCase()).filter(Boolean);   // no student list yet
    if(T.group!==g)return;
    const pts={};pt.forEach(d=>{pts[d.id]=+d.data()[term]||0});
    T.data={g,term,keys,pts};T.msg="";listen(g);
  }catch(e){console.warn("class quiz",e);T.msg="⚠ Could not start the class: "+esc(e.message)}
  draw();
}
// Points: when the teacher shows a question's answer, every student whose answer is the right one gets +1, once per question and class
// session (T.aw, kept in this browser for the session). Answers that arrive just after the reveal count too.
async function awardOpen(){
  if(!ready()||!T.ans)return;const D=T.data,hit=[];
  $$("[data-q].open").forEach(el=>{const q=el.dataset.q,ok=String(el.dataset.okv),aw=T.aw[q]=T.aw[q]||[];
    Object.entries(T.ans.A).forEach(([em,a])=>{if(String(a[q])===ok&&!aw.includes(em)){aw.push(em);hit.push(em)}})});
  if(!hit.length)return;
  tab.set("aw",{sid:T.sid,q:T.aw});
  hit.forEach(em=>D.pts[em]=(D.pts[em]||0)+1);const b=$("#ptBest",bar);if(b)b.textContent=best();
  try{const {S,db}=await cloud(),w=S.writeBatch(db),now=S.serverTimestamp();
    hit.forEach(em=>w.set(S.doc(db,"points",em),{[D.term]:S.increment(1),updated:now},{merge:true}));
    w.set(S.doc(db,"teams",D.g),{best:{[D.term]:best()},updated:now},{merge:true});
    await w.commit();
  }catch(e){console.warn("points",e);T.msg="⚠ Points not saved: "+esc(e.message);draw()}
}

/* ---------- live: the teacher's screen publishes where it is ---------- */
// live/{group} = {on, deck (path), title, sid, slide, step, man, order, at}: written at every step and every minute while the class is on.
let liveT=null,beat=null;
addEventListener("deckstep",()=>{if(ready()){sendLive();awardOpen()}drawAns()});
function sendLive(){clearTimeout(liveT);liveT=setTimeout(async()=>{
  const fb=await cloud();if(!fb||!ready()||!window.ELDeck)return;
  try{await fb.S.setDoc(fb.S.doc(fb.db,"live",T.group),Object.assign({on:true,deck:location.pathname,title:document.title,sid:T.sid},ELDeck.info(),{at:fb.S.serverTimestamp()}))}catch(e){console.warn("live",e)}},150)}
async function liveOff(g){const fb=await cloud();if(fb)fb.S.setDoc(fb.S.doc(fb.db,"live",g),{on:false,at:fb.S.serverTimestamp()},{merge:true}).catch(e=>console.warn("live",e))}
addEventListener("pagehide",()=>{if(T.live)liveOff(T.live)});
let ansUnsub=null;
function listen(g){
  clearInterval(beat);beat=null;if(ansUnsub)ansUnsub();ansUnsub=null;T.ans=null;drawAns();
  if(T.live&&T.live!==g)liveOff(T.live);T.live=g||null;if(!g)return;
  sendLive();beat=setInterval(sendLive,60e3);   // every minute too, so the students' devices know the class is still on
  cloud().then(fb=>{if(!fb||T.group!==g)return;
    ansUnsub=fb.S.onSnapshot(fb.S.collection(fb.db,"live",g,"answers"),qs=>{const A={},R={},who=[];let n=0;
      qs.forEach(d=>{const x=d.data();if(x.sid!==T.sid)return;n++;who.push(d.id.split("@")[0]);A[d.id]=x.a||{};Object.entries(x.a||{}).forEach(([q,v])=>{if(v>=0)(R[q]=R[q]||{})[v]=(R[q][v]||0)+1})});
      who.sort();const had=T.ans;T.ans={A,R,n,who};drawAns();awardOpen();const c=$("#ansN",bar),w=$("#ansWho",bar);
      if(had&&c&&w){c.textContent=n;w.textContent=who.join(" · ");w.hidden=!who.length;cbMode();resized()}else draw()},e=>console.warn("answers",e))});   // a tap only updates the count
}

bar.addEventListener("click",async e=>{
  if(e.target.closest("#teamsReload"))load();
  if(e.target.closest("#teamsSignIn")){const fb=await cloud();if(!fb)return;
    try{const p=new fb.A.GoogleAuthProvider();p.setCustomParameters({prompt:"select_account"});await fb.A.signInWithPopup(fb.auth,p)}catch(x){console.warn("sign in",x)}
    if(!T.teacher&&T.user){T.msg=B("Only the teacher's account starts the class.","Només el compte del professor comença la classe.");draw()}}
});
bar.addEventListener("change",e=>{
  if(e.target.id!=="teamGroup")return;
  T.group=e.target.value;T.msg="";T.sid=Date.now();T.aw={};tab.set("group",T.group?{g:T.group,at:T.sid,deck:location.pathname}:null);listen("");T.group?load():draw();
});
if(btn)btn.addEventListener("click",()=>toggle());

/* ---------- class quiz: every question a student can answer on their device ---------- */
// The deck marks each question with data-q and the right value with data-okv (a poll: the option's data-i; a card with choices,
// data-ch "a|b|c": the choice's position). The projector shows how many answered (✋ 12 / 18) and, once the answer is shown, how many
// were right and what each option got.
function drawAns(){
  $$(".qres,.ocnt").forEach(e=>e.remove());
  const A=T.ans;if(!A||!ready())return;
  $$("[data-q]").forEach(el=>{const c=A.R[el.dataset.q]||{},n=Object.values(c).reduce((a,b)=>a+b,0),open=el.classList.contains("open");if(!n)return;
    const b=document.createElement("span");b.className="qres"+(open?" ok":"");b.textContent=open?`✓ ${c[el.dataset.okv]||0} / ${n}`:`✋ ${n} / ${A.n}`;el.append(b);
    if(open)$$(".opt",el).forEach(o=>{const k=document.createElement("span");k.className="ocnt";k.textContent=c[o.dataset.i]||0;o.append(k)})});
}
// The player (a student following): one question at a time, the next one the teacher will reveal on this slide, with its options as big
// buttons, over the slides; above it, how they did in the one just revealed (Roger, 26 Oct 2026: a whole slide of cards was too much). A poll
// (data-q with .opt buttons) or a card with choices (data-ch "a|b|c"); the answer is saved when tapped; once the teacher shows the
// answer, theirs turns green or red and the board has the reason. A slide without a question: "Look at the board".
const player=document.createElement("div");player.className="elplay";player.hidden=true;player.innerHTML='<div class="pc"><p class="st"></p><div class="pb"></div></div>';document.body.append(player);   // .st: the status line (lv); .pb: the questions
const following=()=>document.documentElement.classList.contains("deck-live");
const chLabels=el=>(document.documentElement.classList.contains("ca-on")&&el.dataset.chca||el.dataset.ch||"").split("|");
const inner=(el,drop)=>{const c=el.cloneNode(true);$$(drop,c).forEach(x=>x.remove());return c.innerHTML};
function playerDraw(){
  if(T.teacher){player.hidden=true;return}
  player.hidden=false;player.style.bottom=(($(".bottom")||{}).offsetHeight||0)+(bar.hidden?0:bar.offsetHeight)+"px";
  const pb=$(".pb",player),s=following()&&lastLive&&lastLive.on&&sameDeck(lastLive.deck)&&$(".slide.on");
  if(!s){pb.innerHTML="";return}
  const all=$$("[data-q]",s).filter(el=>!el.closest(".later")),isOpen=el=>el.classList.contains("open");
  const cur=all.find(el=>!isOpen(el)&&!el.closest(".gone")),done=all.filter(isOpen),last=done[done.length-1];
  const res=el=>{const mine=el.dataset.mine,ok=String(el.dataset.okv);
    return `<p class="pr ${mine==null?"":mine===ok?"ok":"no"}">${mine==null?B("No answer.","Sense resposta."):mine===ok?B("✓ Right!","✓ Correcte!"):B("✗ Not this time.","✗ Aquesta vegada no.")} ${B("Look at the board.","Mira la pissarra.")}</p>`};
  const ask=el=>{const mine=el.dataset.mine,q=el.dataset.ch?inner(el,".ans"):($(".q",el)?inner($(".q",el),".ans"):""),
      opts=el.dataset.ch?chLabels(el).map((l,i)=>({v:String(i),h:esc(l)})):$$(".opt",el).map(o=>({v:o.dataset.i,h:inner(o,".ocnt")}));
    return `<div class="pq" data-pq="${esc(el.dataset.q)}"><p class="q">${q}</p><div class="po">${opts.map(o=>`<button type="button" data-v="${o.v}" class="${o.v===mine?"on":""}">${o.h}</button>`).join("")}</div></div>`};
  pb.innerHTML=`<h2>${esc(s.dataset.title||document.title)}</h2>`+(last?res(last):"")+(cur?ask(cur):last?"":`<p class="wait">${B("👀 Look at the board","👀 Mira la pissarra")}</p>`);
}
player.addEventListener("click",e=>{
  const b=e.target.closest(".po button");if(!b||b.disabled)return;
  const el=$(`.slide.on [data-q="${b.closest(".pq").dataset.pq}"]`);if(!el||el.classList.contains("open"))return;
  el.dataset.mine=b.dataset.v;$$(".opt",el).forEach(o=>o.setAttribute("aria-pressed",String(o.dataset.i===b.dataset.v)));   // the slide underneath agrees
  dispatchEvent(new CustomEvent("deckanswer",{detail:{q:el.dataset.q,v:+b.dataset.v}}));playerDraw();
});
addEventListener("deckstep",playerDraw);addEventListener("resize",()=>{if(!player.hidden)playerDraw()});
let Q=null,mySid=0;   // the student's answers doc while following
addEventListener("deckanswer",e=>{if(!Q||!mySid)return;
  Q.S.setDoc(Q.ref,{sid:mySid,a:{[e.detail.q]:e.detail.v},at:Q.S.serverTimestamp()},{merge:true}).catch(x=>console.warn("answer",x))});
// Chromebook mode (the projector): once students have joined, a question's finger code becomes "💻 Tap your answer on your Chromebook".
// Only for slides with questions students can answer (data-q).
function cbMode(){
  const on=!!(T.teacher&&ready()&&T.ans&&T.ans.n>0);
  document.documentElement.classList.toggle("el-cb",on);
  if(!on&&!$(".cbm"))return;
  $$(".slide .ask").forEach(a=>{
    const go=$$('.go321[data-say="fingers"],.go321[data-say="thumbs"]',a),sl=a.closest(".slide");if(!go.length||!$("[data-q]",sl)||$(".cbm",a))return;
    const m=document.createElement("span");m.className="mode cbm";
    m.innerHTML=$("[data-ch]",sl)?B("💻 Tap a card, then your answer","💻 Toca una targeta i tria la resposta"):B("💻 Tap your answer on your Chromebook","💻 Toca la resposta al Chromebook");a.prepend(m);
  });
}
async function joinQuiz(x){   // the teacher's session: keep my answers if I come back to the same one, start empty for a new one
  if(!Q||!x.sid||x.sid===mySid||x.sid===joinQuiz.pending)return;const sid=joinQuiz.pending=x.sid;
  try{const d=await Q.S.getDoc(Q.ref);if(!(d.exists()&&d.data().sid===sid))await Q.S.setDoc(Q.ref,{sid,a:{},at:Q.S.serverTimestamp()})}catch(e){console.warn("answer",e)}
  if(joinQuiz.pending===sid)mySid=sid;   // answers are saved only from here, so the reset cannot wipe one
}

/* ---------- a student follows the class ---------- */
// Everyone but the teacher follows: the deck is locked on the first slide (ELDeck.show(LOCK): no navigation, the player covers the
// slide) until the teacher's screen says where it is (live/{group}, every step and every minute); then the device shows the
// teacher's slide and step (ELDeck.show) under the player. Catalan help for an Insecure student (their route in the deck's LS, #teambar
// data-ls). The group: ?live={group} from the Learning Path, or the student's group on the student list (a tester: "View as group").
const LIVE=(new URLSearchParams(location.search).get("live")||"").replace(/[^\w-]/g,"");
let liveGroup=LIVE;
const LOCK={slide:0,step:0,man:[],order:[]};
const lv=document.createElement("span");lv.className="ellive";lv.setAttribute("aria-live","polite");
let liveStop=null,lastLive=null,liveGen=0;
const fresh=at=>{const ms=at&&(at.toMillis?at.toMillis():+at);return !!ms&&Date.now()-ms<10*60e3};
const sameDeck=p=>String(p||"").toLowerCase()===location.pathname.toLowerCase();   // the teacher's deck is this page (whatever the case of the address)
function liveDraw(){
  const x=lastLive,on=x&&x.on&&fresh(x.at),here=on&&sameDeck(x.deck);
  if(window.ELDeck)ELDeck.show(T.teacher?null:here?x:LOCK);
  if(here)joinQuiz(x);
  cbMode();
  lv.innerHTML=T.teacher?""
    :!T.user?`📺 ${B("Sign in with your school email and password to join the class.","Entra amb el correu de l’institut i la contrasenya per entrar a la classe.")}`
    :!liveGroup?`📺 ${B("You are not on a class list yet. Ask your teacher.","Encara no ets a cap llista de classe. Digues-ho al professor.")}`
    :!on?`📺 ${B("Waiting for your teacher to start the class…","Esperant que el professor comenci la classe…")}`
    :!here?`📺 ${B("Your class is on another presentation:","La classe és en una altra presentació:")} <a href="${esc(x.deck)}?live=${liveGroup}">${x.title?esc(x.title):B("open it","obre-la")}</a>`
    :`📺 ${B("Following the class","Segueixes la classe")}`;
  if(!T.user)lv.append(signInBtn());
  playerDraw();
}
async function joinLive(u){
  const gen=++liveGen;if(liveStop)liveStop();liveStop=null;Q=null;mySid=0;joinQuiz.pending=0;lastLive=null;
  $(".st",player).append(lv);
  if(!u||T.teacher){liveDraw();if(!u&&bar.hidden)toggle(true);return}   // not signed in: the strip offers "▶ Start the class" to the teacher
  const fb=await cloud();if(!fb||gen!==liveGen)return;const {S,db}=fb,em=(u.email||"").toLowerCase();
  if(!liveGroup){try{const r=await S.getDoc(S.doc(db,"roster",em));liveGroup=(r.exists()&&r.data().group||localStorage.getItem("el_view")||"").replace(/[^\w-]/g,"")}catch(e){console.warn("roster",e)}if(gen!==liveGen)return}
  if(!liveGroup){liveDraw();return}
  Q={S,ref:S.doc(db,"live",liveGroup,"answers",em)};
  // Catalan for Insecure and Beginners: the route of this LS, or the one carried over from an earlier LS (elRouteOf in el-catalog.js)
  if(bar.dataset.ls)S.getDocs(S.collection(db,"students",u.uid,"levels")).then(qs=>{const m={},ls=bar.dataset.ls;qs.forEach(d=>m[d.id]=d.data());
    const l=window.elRouteOf?elRouteOf(m,ls).level:(m[ls]||{}).level;if((l==="insecure"||l==="beginners")&&window.ELDeck)ELDeck.setCa(true)}).catch(()=>{});
  liveStop=S.onSnapshot(S.doc(db,"live",liveGroup),s=>{lastLive=s.exists()?s.data():null;liveDraw()},e=>{console.warn("live",e);lv.innerHTML=`📺 ${B("You cannot join this class.","No pots entrar a aquesta classe.")}`;playerDraw()});
}
function signInBtn(){const b=document.createElement("button");b.type="button";b.innerHTML=B("Sign in","Entra");
  b.onclick=async()=>{const fb=await cloud();if(!fb)return;   // school email + password (el-signin.js)
    try{const [{signIn},C]=await Promise.all([import(new URL("el-signin.js",SRC).href),import(new URL("el-firebase.js",SRC).href)]);await signIn({auth:fb.auth,A:fb.A,domain:C.DOMAINS[0]})}catch(x){console.warn("sign in",x)}};return b}
document.documentElement.classList.add("deck-live");   // locked until the teacher's account is known
addEventListener("DOMContentLoaded",()=>{liveDraw();cloud()});
setInterval(()=>{if(lastLive)liveDraw()},60e3);   // the class ends: no new minute from the teacher

draw();toggle(!!store.get("teamsOn",false));
window.ELDeckPoints={toggle};
})();
