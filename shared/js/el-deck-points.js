// Team points in a class presentation (Roger, 25 Oct 2026; the rules and the bonus are in el-points.js, which loads first).
// Load it after the slides and before the deck's own script. The deck has:
//   <section class="slide" data-el-points></section>: the reminder, filled here so every presentation explains the points;
//   #teambar (data-course="4eso": the groups to choose from) and #teamsBtn (🏆 Teams), which opens and closes it.
// Signed out, the strip is a plain scoreboard kept in this browser. Signed in with the teacher's account and a class group
// chosen, its teams come from the dashboard (Team points) and every + or − is saved at once for each member of the team
// (points/{email}.{term}) and for the team (teams/{group}.score.{term}.{team}), with the group's best (teams/{group}.best.{term}).
// Buzzer (Roger, 25 Oct 2026): with a group chosen, 🔔 Buzz (or B) opens the buzzers on the students' boards (today.html); the first
// student to press wins the turn for their team and the presentation says "Lions, answer!". See the buzzer section below.
// Live view (Roger, 25 Oct 2026): the teacher's screen also publishes its slide and step (live/{group}); a student opens the deck with
// ?live={group} (link on their board) and their device follows it, with the buzzer below and Catalan help for Insecure (data-ls).
// The deck's own script opens the strip with ELDeckPoints.toggle(true) (.go321[data-teams]) and re-places its timer on resize;
// it announces every step (deckstep) and follows with ELDeck.show(state) (window.ELDeck: info, show, setCa).
(function(){
const SRC=document.currentScript.src,FB="https://www.gstatic.com/firebasejs/10.14.1/";
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const B=(en,ca)=>`<span class="l-en">${en}</span><span class="l-ca">${ca}</span>`;
const store={get(k,d){try{const v=localStorage.getItem("elDeck."+k);return v===null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem("elDeck."+k,JSON.stringify(v))}catch(e){}}};

const css=document.createElement("style");
css.textContent=`
.teambar{display:flex;gap:.5em;align-items:center;padding:.4em max(16px,env(safe-area-inset-right,0px)) .4em max(16px,env(safe-area-inset-left,0px));background:var(--surface);border-top:1px solid var(--line);overflow-x:auto}
.team{display:flex;align-items:center;gap:.35em;background:var(--bg);border:1px solid var(--line);border-radius:14px;padding:.25em .5em;flex:1 1 0;min-width:9.5em}
.team input,.team .tn{flex:1;min-width:0;border:0;background:transparent;font:600 .8em var(--f-body);color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.team .sc{font:800 1.5em var(--f-display);font-variant-numeric:tabular-nums;min-width:1.3em;text-align:center}
.team .sc.bump{animation:elDeckBump .45s ease-out}
.team button{width:2em;height:2em;padding:0;border-radius:50%;border:1px solid var(--line);background:var(--bg);color:var(--ink);font:600 .8em var(--f-body)}
.tctl{display:flex;gap:.4em;align-items:center;flex:0 0 auto}
.teambar select{font:600 .75em var(--f-body);color:var(--ink);background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:.2em}
.tstat{font-size:.7em;color:var(--muted);white-space:nowrap}.tstat.no{color:var(--no)}.tstat a{color:var(--accent)}
@keyframes elDeckBump{from{transform:scale(1.7)}to{transform:scale(1)}}
@keyframes elBuzzPop{0%{transform:scale(.5);opacity:0}60%{transform:scale(1.06);opacity:1}100%{transform:scale(1)}}
.elbuzz{position:fixed;z-index:45;left:16px;right:16px;margin-inline:auto;width:fit-content;top:4.2em;display:flex;align-items:center;gap:.6em;flex-wrap:wrap;justify-content:center;background:var(--surface);color:var(--ink);border:2px solid var(--accent);border-radius:999px;padding:.35em .5em .35em 1em;box-shadow:0 8px 24px rgba(0,0,0,.2);font:600 .9em var(--f-body)}
.elbuzz.win{top:50%;transform:translateY(-50%);flex-direction:column;border-radius:28px;border-width:3px;padding:1.2em 2em;gap:.9em}
.elbuzz .who{margin:0;font:800 min(3.2em,11vw)/1.1 var(--f-display);text-align:center;text-wrap:balance;animation:elBuzzPop .4s ease-out}
.elbuzz .bzrow{display:flex;gap:.5em;flex-wrap:wrap;justify-content:center}
.elbuzz button{border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:999px;padding:.35em .9em;font:600 .85em var(--f-body)}
.elbuzz button.ok{background:var(--ok-bg);color:var(--ok);border-color:var(--ok)}.elbuzz button.no{background:var(--no-bg);color:var(--no);border-color:var(--no)}
.elbuzz small{color:var(--muted);font-weight:500}
.elbuzz .dot{width:.7em;height:.7em;border-radius:50%;background:var(--no);animation:elBuzzPulse 1s ease-in-out infinite}
@keyframes elBuzzPulse{50%{opacity:.25}}
.deck-live .teambar{display:none!important}
.ellive{display:inline-flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:.2em .5em;font:600 .75em/1.25 var(--f-body);color:var(--accent);text-align:center;min-width:0}
.ellive a{color:var(--accent);display:inline-block;padding:.45em .2em}.ellive button{min-height:36px;border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:999px;padding:.3em .9em;font:600 1em var(--f-body);touch-action:manipulation}   /* big enough to tap on a touch screen */
.ptrule{display:flex;gap:.7em;align-items:flex-start;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:.45em .9em;min-width:0}
.ptrule .ico{font-size:1.4em;line-height:1.1;flex:0 0 auto}.ptrule b{display:block}
[data-q]{position:relative;-webkit-tap-highlight-color:transparent}[data-q] .opt{position:relative}
.qres{position:absolute;top:-.75em;right:-.4em;z-index:2;background:var(--ink);color:var(--bg);border-radius:999px;padding:.15em .65em;font:700 .72em/1.35 var(--f-body);box-shadow:0 2px 8px rgba(0,0,0,.2);white-space:nowrap;pointer-events:none}
.qres.ok{background:var(--ok);color:#fff}
.opt .ocnt{position:absolute;top:-.6em;right:-.5em;background:var(--ink);color:var(--bg);border-radius:999px;min-width:1.7em;padding:.05em .45em;font:700 .75em/1.45 var(--f-body);text-align:center;font-variant-numeric:tabular-nums}
.elch{position:fixed;z-index:70;display:flex;flex-wrap:wrap;gap:.5em;padding:.55em;background:var(--surface);border:2px solid var(--accent);border-radius:16px;box-shadow:0 12px 32px rgba(0,0,0,.28);max-width:calc(100vw - 24px)}
.elch[hidden]{display:none}
.elch button{min-height:48px;min-width:4.6em;padding:.3em .9em;border-radius:12px;border:2px solid var(--line);background:var(--bg);color:var(--ink);font:700 1.05em var(--f-body);cursor:pointer;touch-action:manipulation}
.elch button.on{border-color:var(--accent);background:var(--soft)}
.mych{display:block;width:max-content;margin-top:.4em;border-radius:999px;padding:.1em .65em;font:700 .78em/1.4 var(--f-body);background:var(--soft);color:var(--accent);border:1px solid var(--accent)}
.mych.ok{background:var(--ok-bg);color:var(--ok);border-color:var(--ok)}.mych.no{background:var(--no-bg);color:var(--no);border-color:var(--no)}
.cbm{display:none}:root.el-cb .cbm{display:inline-flex}:root.el-cb .ask:has(.cbm)>.mode:not(.cbm){display:none}   /* Chromebook mode */
:root.deck-live .go321{display:none}   /* following: 3 · 2 · 1, the timer and the random number are the teacher's */
@media (prefers-reduced-motion: reduce){.team .sc.bump,.elbuzz .who,.elbuzz .dot{animation:none}}`;
document.head.appendChild(css);

/* ---------- reminder slide: the rules, then a quick check with new numbers every day ---------- */
// By the date, not at random, so the projector and the students following on their devices show the same numbers.
const EX=[[12,15],[8,16],[12,20],[14,20],[9,10],[6,15],[15,25],[16,20]],today=new Date();
$$(".slide[data-el-points]").forEach(s=>{
  const [m,b]=EX[(today.getFullYear()*372+today.getMonth()*31+today.getDate())%EX.length],x=elBonus(m,b),N=n=>elNum(n,"en"),C=n=>elNum(n,"ca"),opt=(n,ok)=>`<button type="button" class="opt"${ok?" data-ok":""} data-ca="+${C(n)}">+${N(n)}</button>`;
  s.dataset.title=s.dataset.title||"Team points";
  s.innerHTML=`<p class="eyebrow" data-ca="Cada classe · Punts d’equip">Every class · Team points</p>
  <h2 data-ca="Avui el teu equip pot guanyar punts">Your team can win points today</h2>
  <div class="cols">
    <div class="stack">${elPointsRules().map(r=>`<p class="ptrule"><span class="ico" aria-hidden="true">${r.icon}</span><span data-ca="${esc(r.ca)}">${r.en}</span></p>`).join("")}</div>
    <div class="stack">
      <div class="ask"><span class="mode" data-ca="✋ Mostra 1, 2 o 3 dits">✋ Show 1, 2 or 3 fingers</span><button type="button" class="go321" data-say="fingers" data-ca="3 · 2 · 1 · Ja!">3 · 2 · 1 · Show!</button></div>
      <div class="poll" data-open="1">
        <p class="q" data-ca="El teu equip té <b>${m}</b> punts i el millor equip en té <b>${b}</b>. Quant suma a la teva nota del trimestre?">Your team has <b>${m}</b> points and the best team has <b>${b}</b>. How much does it add to your term grade?</p>
        <div class="opts">${opt(x,true)}${opt(EL_POINTS_BONUS)}${opt(m/10)}</div>
        <p class="why ans" data-ca="${m} ÷ ${b} × ${C(EL_POINTS_BONUS)} = <b>+${C(x)}</b>. Un 4,8 passa a ser un ${C(4.8+x)}: aprovat!">${m} ÷ ${b} × ${N(EL_POINTS_BONUS)} = <b>+${N(x)}</b>. A 4.8 becomes a ${N(4.8+x)}: you pass!</p>
      </div>
      <p class="small" data-ca="Respon bé amb el teu equip i mira els teus punts al teu tauler.">Answer well with your team and check your points on your board.</p>
    </div>
  </div>`;
});

/* ---------- team strip ---------- */
const bar=$("#teambar"),btn=$("#teamsBtn");
if(!bar)return;
const local=store.get("teams",null)||{n:4,names:[],score:[0,0,0,0,0,0]};
// T.group: the class group the points are saved for (remembered for 3 hours, one lesson, so the next class starts unsaved);
// T.data: that group's teams this term {g, term, list, score:{team:n}, members:{team:[email]}, pts:{email:n}}.
// T.sid: this class session (the time the group was chosen), so the students' answers start empty every class; T.ans: their answers.
const T={fb:null,user:null,teacher:false,group:"",data:null,msg:"",sid:0,ans:null};
{const g=store.get("group",null);if(g&&g.g&&Date.now()-g.at<3*3600e3){T.group=g.g;T.sid=g.deck===location.pathname?g.at:Date.now();   // another deck in the same lesson: a new session, so the answers start empty
  if(T.sid!==g.at)store.set("group",{g:g.g,at:T.sid,deck:location.pathname})}}
const ready=()=>T.teacher&&T.group&&T.data&&T.data.g===T.group;
const resized=()=>dispatchEvent(new Event("resize"));
const groups=()=>(window.EL_GROUPS||[]).filter(g=>!bar.dataset.course||g.course===bar.dataset.course);

function draw(){
  const D=ready()?T.data:null,cloudOn=T.teacher&&T.group;let h="";   // cloudOn without D: loading, or it could not load (only the status shows)
  if(D)h=D.list.length?D.list.map(t=>{const n=(D.members[t.id]||[]).length;return `<div class="team" title="${n} ${n===1?"student":"students"}"><span class="tn">${esc(t.name)}</span><button type="button" data-team="${esc(t.id)}" data-d="-1" aria-label="Remove a point">−</button><span class="sc">${D.score[t.id]||0}</span><button type="button" data-team="${esc(t.id)}" data-d="1" aria-label="Add a point">+</button></div>`}).join("")
    :`<span class="tstat">${B("No teams in this group yet: make them on the dashboard (Team points).","Aquest grup encara no té equips: fes-los al tauler del professor.")} <a href="${new URL("../../teacher.html",SRC).href}" target="_blank" rel="noopener">Dashboard</a></span>`;
  else if(!cloudOn)h=[...Array(local.n).keys()].map(t=>`<div class="team"><input id="teamName${t}" value="${esc(local.names[t]||"Team "+(t+1))}" aria-label="Team ${t+1} name"><button type="button" data-team="${t}" data-d="-1" aria-label="Remove a point">−</button><span class="sc">${local.score[t]||0}</span><button type="button" data-team="${t}" data-d="1" aria-label="Add a point">+</button></div>`).join("");
  const sel=T.teacher?`<select id="teamGroup" aria-label="Class group the points are saved for" title="Class group the points are saved for"><option value="">Not saved</option>${groups().map(g=>`<option value="${g.id}"${g.id===T.group?" selected":""}>☁ ${esc(g.name)}</option>`).join("")}</select>`:"";
  const stat=T.msg?`<span class="tstat no">${T.msg}</span>`
    :D?(T.ans?`<span class="tstat" title="Students following this presentation on their device">📡 <span id="ansN">${T.ans.n}</span> ${B("joined","connectats")}</span>`:"")+(D.list.length?`<button type="button" class="tool" id="buzzOpen" title="Open the buzzers on the students' boards (B)">🔔 ${B("Buzz","Polsador")}</button>`:"")+`<span class="tstat" title="Saved for every member of the team">${B(elTermName(D.term,"en"),elTermName(D.term,"ca"))} · ${B("best","millor")} ${Math.max(0,...Object.values(D.pts))}</span><button type="button" class="tool" id="teamsReload" title="Load the teams again">↻</button>`
    :T.teacher?"":`<button type="button" class="tool" id="teamsSignIn" title="Sign in with the teacher's account to save the points for a class group">☁ ${B("Save points","Desa els punts")}</button>`;
  const ctl=cloudOn?"":`<select id="teamCount" aria-label="Number of teams">${[2,3,4,5,6].map(n=>`<option value="${n}"${n===local.n?" selected":""}>${n}</option>`).join("")}</select><button type="button" class="tool" id="teamsZero">${B("Reset","Zero")}</button>`;
  bar.innerHTML=h+`<span class="tctl">${sel}${ctl}${stat}</span>`;
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
    A.onAuthStateChanged(fb.auth,u=>{T.user=u;T.teacher=!!u&&C.TEACHERS.includes((u.email||"").toLowerCase());if(T.teacher&&T.group)load();else{listen("");draw()}if(LIVE)joinLive(u)});
    return fb;
  })().catch(e=>{console.warn("team points",e);T.fb=null;return null});
}
async function load(){
  const fb=await cloud(),g=T.group;if(!fb||!g)return draw();
  const {S,db}=fb,term=elTerm();T.data=null;T.msg=B("Loading the teams…","Carregant els equips…");draw();
  try{
    const [ro,pt,tm]=await Promise.all([S.getDocs(S.query(S.collection(db,"roster"),S.where("group","==",g))),S.getDocs(S.collection(db,"points")),S.getDoc(S.doc(db,"teams",g))]);
    let keys=ro.docs.map(d=>d.id);
    if(!keys.length)keys=(await S.getDocs(S.query(S.collection(db,"students"),S.where("group","==",g)))).docs.map(d=>(d.data().email||"").toLowerCase()).filter(Boolean);   // no student list yet
    if(T.group!==g)return;
    const P={};pt.forEach(d=>P[d.id]=d.data());
    const t=tm.exists()?tm.data():{},list=t.list||[],members=Object.fromEntries(list.map(x=>[x.id,[]])),pts={};
    keys.forEach(k=>{const p=P[k]||{};pts[k]=+p[term]||0;if(members[p.team])members[p.team].push(k)});
    T.data={g,term,list,score:Object.assign({},(t.score||{})[term]),members,pts};T.msg="";listen(g);
  }catch(e){console.warn("team points",e);T.msg="⚠ Could not load the teams: "+esc(e.message)}
  draw();
}
async function award(id,d){
  const D=T.data,cur=D.score[id]||0;if(d<0&&cur<=0)return;
  const hit=(D.members[id]||[]).filter(k=>d>0||D.pts[k]>0);
  D.score[id]=cur+d;hit.forEach(k=>D.pts[k]+=d);
  const best=Math.max(0,...Object.values(D.pts));
  T.msg=hit.length?"":"⚠ This team has no students: add them on the dashboard.";
  draw();bump(id);
  try{const {S,db}=await cloud(),b=S.writeBatch(db),now=S.serverTimestamp();
    hit.forEach(k=>b.set(S.doc(db,"points",k),{[D.term]:S.increment(d),updated:now},{merge:true}));
    b.set(S.doc(db,"teams",D.g),{score:{[D.term]:{[id]:S.increment(d)}},best:{[D.term]:best},updated:now},{merge:true});
    await b.commit();
  }catch(e){console.warn("team points",e);D.score[id]=cur;hit.forEach(k=>D.pts[k]-=d);T.msg="⚠ Not saved: "+esc(e.message);draw()}
}
const bump=id=>{const b=bar.querySelector(`[data-team="${CSS.escape(String(id))}"]`),sc=b&&b.parentNode.querySelector(".sc");if(sc){sc.classList.remove("bump");void sc.offsetWidth;sc.classList.add("bump")}};

/* ---------- live: the teacher's screen publishes where it is ---------- */
// live/{group} = {on, deck (path), title, slide, step, man, order, at}: written at every step and every minute while a group is chosen.
let liveT=null,beat=null;
addEventListener("deckstep",()=>{if(ready())sendLive();drawAns()});
function sendLive(){clearTimeout(liveT);liveT=setTimeout(async()=>{
  const fb=await cloud();if(!fb||!ready()||!window.ELDeck)return;
  try{await fb.S.setDoc(fb.S.doc(fb.db,"live",T.group),Object.assign({on:true,deck:location.pathname,title:document.title,sid:T.sid},ELDeck.info(),{at:fb.S.serverTimestamp()}))}catch(e){console.warn("live",e)}},150)}
async function liveOff(g){const fb=await cloud();if(fb)fb.S.setDoc(fb.S.doc(fb.db,"live",g),{on:false,at:fb.S.serverTimestamp()},{merge:true}).catch(e=>console.warn("live",e))}
addEventListener("pagehide",()=>{if(T.live)liveOff(T.live)});

/* ---------- buzzer: the students' boards buzz, the first team answers ---------- */
// buzz/{group} = {open, q, out:[team], winner:{team, at} or null}. The teacher opens a question here; a student's board sets the
// winner once (firestore.rules: their own team, while open and nobody has, not a team that is out). Then ✓ gives the team +1 and
// closes, ✗ leaves that team out of this question and opens the buzzers again for the others, and Close ends it.
const bz=document.createElement("div");bz.className="elbuzz";bz.hidden=true;bz.setAttribute("aria-live","assertive");document.body.append(bz);
let unsub=null,ansUnsub=null;
function listen(g){
  if(unsub)unsub();unsub=null;T.buzz=null;drawBuzz();clearInterval(beat);beat=null;if(ansUnsub)ansUnsub();ansUnsub=null;T.ans=null;drawAns();
  if(T.live&&T.live!==g)liveOff(T.live);T.live=g||null;if(!g)return;
  sendLive();beat=setInterval(sendLive,60e3);   // every minute too, so the students' boards know the class is still on
  cloud().then(fb=>{if(!fb||T.group!==g)return;
    ansUnsub=fb.S.onSnapshot(fb.S.collection(fb.db,"live",g,"answers"),qs=>{const R={};let n=0;
      qs.forEach(d=>{const x=d.data();if(x.sid!==T.sid)return;n++;Object.entries(x.a||{}).forEach(([q,v])=>{if(v>=0)(R[q]=R[q]||{})[v]=(R[q][v]||0)+1})});
      const had=T.ans;T.ans={R,n};drawAns();const c=$("#ansN",bar);if(had&&c){c.textContent=n;cbMode()}else draw()},e=>console.warn("answers",e));   // a tap only updates the count
    let first=true;   // no sound for the state the page finds when it opens
    unsub=fb.S.onSnapshot(fb.S.doc(fb.db,"buzz",g),s=>{const was=T.buzz||{};T.buzz=s.exists()?s.data():null;const z=T.buzz||{};
      if(!first){if(z.open&&z.winner&&!was.winner)snd("first");else if(z.open&&!was.open)snd("open")}first=false;drawBuzz()},e=>console.warn("buzz",e))});
}
const tname=id=>esc(((T.data&&T.data.list.find(x=>x.id===id))||{}).name||id);
function drawBuzz(){
  const z=T.buzz;bz.hidden=!(ready()&&z&&z.open);if(bz.hidden)return;
  bz.classList.toggle("win",!!z.winner);
  bz.innerHTML=z.winner?`<p class="who">🔔 ${B(tname(z.winner.team)+", answer!",tname(z.winner.team)+", responeu!")}</p><div class="bzrow"><button type="button" class="ok" data-bz="right">✓ ${B("Right · +1","Correcte · +1")}</button><button type="button" class="no" data-bz="wrong">✗ ${B("Wrong · another team","Incorrecte · un altre equip")}</button><button type="button" data-bz="close">${B("Close","Tanca")}</button></div>`
    :`<span class="dot" aria-hidden="true"></span><span>${B("Buzzers open: press 🔔 on your Chromebook!","Polsadors oberts: premeu 🔔 al Chromebook!")}</span>${(z.out||[]).length?`<small>${B("Out:","Fora:")} ${z.out.map(tname).join(", ")}</small>`:""}<button type="button" data-bz="close">${B("Close","Tanca")}</button>`;
}
const snd=n=>window.ELSound&&ELSound.play(n);   // shared/js/el-sound.js
async function buzzSet(o,merge=true){
  const fb=await cloud();if(!fb||!T.group)return;
  try{await fb.S.setDoc(fb.S.doc(fb.db,"buzz",T.group),Object.assign(o,{updated:fb.S.serverTimestamp()}),{merge})}catch(e){console.warn("buzz",e);T.msg="⚠ Buzzer: "+esc(e.message);draw()}
}
const openBuzz=()=>ready()&&T.data.list.length?buzzSet({open:true,q:Date.now(),out:[],winner:null},false):null;
bz.addEventListener("click",e=>{
  const a=e.target.closest("[data-bz]"),z=T.buzz;if(!a||!z)return;const w=z.winner&&z.winner.team;
  if(a.dataset.bz==="right"){snd("right");if(w)award(w,1);buzzSet({open:false})}
  else if(a.dataset.bz==="wrong"){snd("wrong");const out=[...new Set([...(z.out||[]),w].filter(Boolean))];   // nobody left to buzz: close
    buzzSet({out,winner:null,open:T.data.list.some(t=>!out.includes(t.id)&&(T.data.members[t.id]||[]).length)})}
  else buzzSet({open:false});
});
document.addEventListener("keydown",e=>{if((e.key==="b"||e.key==="B")&&!e.altKey&&!e.ctrlKey&&!e.metaKey&&!(e.target.closest&&e.target.closest("input,textarea,select")))openBuzz()});

bar.addEventListener("click",async e=>{
  const b=e.target.closest("[data-team]");
  if(b){const d=+b.dataset.d;if(d>0)snd("point");
    if(ready())return award(b.dataset.team,d);
    const t=+b.dataset.team;local.score[t]=Math.max(0,(local.score[t]||0)+d);b.parentNode.querySelector(".sc").textContent=local.score[t];store.set("teams",local);if(d>0)bump(t);return}
  if(e.target.closest("#teamsZero")){local.score=[0,0,0,0,0,0];store.set("teams",local);draw()}
  if(e.target.closest("#teamsReload"))load();
  if(e.target.closest("#buzzOpen"))openBuzz();
  if(e.target.closest("#teamsSignIn")){const fb=await cloud();if(!fb)return;
    try{const p=new fb.A.GoogleAuthProvider();p.setCustomParameters({prompt:"select_account"});await fb.A.signInWithPopup(fb.auth,p)}catch(x){console.warn("sign in",x)}
    if(!T.teacher&&T.user){T.msg=B("Only the teacher's account saves points.","Només el compte del professor desa punts.");draw()}}
});
bar.addEventListener("change",e=>{
  const id=e.target.id;
  if(id==="teamGroup"){T.group=e.target.value;T.msg="";T.sid=Date.now();store.set("group",T.group?{g:T.group,at:T.sid,deck:location.pathname}:null);listen("");T.group?load():draw()}
  else if(id==="teamCount"){local.n=+e.target.value;store.set("teams",local);draw()}
  else if(id.startsWith("teamName")){local.names[+id.slice(8)]=e.target.value;store.set("teams",local)}
});
if(btn)btn.addEventListener("click",()=>toggle());
/* ---------- class quiz: students answer on their device, the projector counts ---------- */
// live/{group}/answers/{email} = {sid, a:{question: value}, at}: written by each student following the class (firestore.rules: their
// own, in their own group); sid = the teacher's session, so a new class starts empty. The deck marks each question with data-q and the
// right value with data-okv (a poll: the option's data-i; a card with choices, data-ch "a|b|c": the choice's position).
// The projector shows how many answered (✋ 12 / 18) and, once the answer is shown, how many were right and what each option got.
function drawAns(){
  $$(".qres,.ocnt").forEach(e=>e.remove());
  const A=T.ans;if(!A||!ready()||LIVE)return;
  $$("[data-q]").forEach(el=>{const c=A.R[el.dataset.q]||{},n=Object.values(c).reduce((a,b)=>a+b,0),open=el.classList.contains("open");if(!n)return;
    const b=document.createElement("span");b.className="qres"+(open?" ok":"");b.textContent=open?`✓ ${c[el.dataset.okv]||0} / ${n}`:`✋ ${n} / ${A.n}`;el.append(b);
    if(open)$$(".opt",el).forEach(o=>{const k=document.createElement("span");k.className="ocnt";k.textContent=c[o.dataset.i]||0;o.append(k)})});
}
// A student following: a card with choices opens a chooser (a poll's options are the deck's own buttons); each answer is saved, and
// once the teacher shows the answer the card says whether theirs was right.
const chooser=document.createElement("div");chooser.className="elch";chooser.hidden=true;chooser.setAttribute("role","group");document.body.append(chooser);
let chFor=null;
const chLabels=el=>(document.documentElement.classList.contains("ca-on")&&el.dataset.chca||el.dataset.ch||"").split("|");
const following=()=>document.documentElement.classList.contains("deck-live");
document.addEventListener("click",e=>{
  if(!following()){chooser.hidden=true;return}
  const b=e.target.closest(".elch button");
  if(b){const el=chFor;chooser.hidden=true;if(!el||el.classList.contains("open"))return;el.dataset.mine=b.dataset.v;markMine();
    dispatchEvent(new CustomEvent("deckanswer",{detail:{q:el.dataset.q,v:+b.dataset.v}}));return}
  const c=e.target.closest("[data-ch][data-q]");
  if(!c||c.classList.contains("open")||c.closest(".later,.gone")){if(!e.target.closest(".elch"))chooser.hidden=true;return}
  chFor=c;chooser.innerHTML=chLabels(c).map((l,i)=>`<button type="button" data-v="${i}" class="${String(i)===c.dataset.mine?"on":""}">${esc(l)}</button>`).join("");
  chooser.hidden=false;const r=c.getBoundingClientRect(),w=chooser.offsetWidth,h=chooser.offsetHeight;
  chooser.style.left=Math.max(12,Math.min(innerWidth-w-12,r.left+r.width/2-w/2))+"px";
  chooser.style.top=(r.bottom+8+h<innerHeight-12?r.bottom+8:Math.max(12,r.top-h-8))+"px";
},true);
function markMine(){
  $$("[data-ch][data-mine]").forEach(el=>{let m=$(".mych",el);if(!m){m=document.createElement("span");m.className="mych";el.append(m)}
    const open=el.classList.contains("open"),ok=el.dataset.mine===el.dataset.okv,l=chLabels(el)[+el.dataset.mine];
    m.className="mych"+(open?(ok?" ok":" no"):"");m.textContent=(open?(ok?"✓ ":"✗ "):"")+(document.documentElement.classList.contains("ca-on")?"Tu: ":"You: ")+l});
}
addEventListener("deckstep",()=>{if(chFor&&chFor.classList.contains("open"))chooser.hidden=true;markMine()});
let Q=null,mySid=0;   // the student's answers doc while following
addEventListener("deckanswer",e=>{if(!Q||!mySid||paused)return;
  Q.S.setDoc(Q.ref,{sid:mySid,a:{[e.detail.q]:e.detail.v},at:Q.S.serverTimestamp()},{merge:true}).catch(x=>console.warn("answer",x))});
// Chromebook mode (Roger, 25 Oct 2026: "it says fingers up; shouldn't it work with the Chromebooks: they buzz, and the system shows who
// answers?"). Once students have joined (teacher) or while following (student), a question's finger code becomes "💻 Tap your answer"
// and its 3 · 2 · 1 button becomes "3 · 2 · 1 · 🔔 Buzz!": the deck's countdown then opens the buzzers (ELDeckPoints.buzz), and the
// projector and the Chromebooks show which team answers. Only for slides with questions students can answer (data-q).
function canBuzz(){return !!(ready()&&T.data.list.length&&T.ans&&T.ans.n>0&&$(".slide.on [data-q]"))}   // on this slide
function cbMode(){   // also called by the strip's first draw, before the consts below exist: no following() here
  const on=T.teacher?!!(ready()&&T.ans&&T.ans.n>0):document.documentElement.classList.contains("deck-live"),buzz=T.teacher&&on&&T.data.list.length>0;
  document.documentElement.classList.toggle("el-cb",on);
  if(!on&&!$(".cbm"))return;
  $$(".slide .ask").forEach(a=>{
    const go=$$('.go321[data-say="fingers"],.go321[data-say="thumbs"]',a),sl=a.closest(".slide");if(!go.length||!$("[data-q]",sl))return;
    if(!$(".cbm",a)){const m=document.createElement("span");m.className="mode cbm";
      m.innerHTML=$("[data-ch]",sl)?B("💻 Tap a card, then your answer","💻 Toca una targeta i tria la resposta"):B("💻 Tap your answer on your Chromebook","💻 Toca la resposta al Chromebook");a.prepend(m)}
    go.forEach(g=>{if(g.dataset.orig===undefined)g.dataset.orig=g.innerHTML;g.innerHTML=buzz?B("3 · 2 · 1 · 🔔 Buzz!","3 · 2 · 1 · 🔔 Premeu!"):g.dataset.orig});
  });
}
async function joinQuiz(x){   // the teacher's session: keep my answers if I come back to the same one, start empty for a new one
  if(!Q||!x.sid||x.sid===mySid||x.sid===joinQuiz.pending)return;const sid=joinQuiz.pending=x.sid;
  try{const d=await Q.S.getDoc(Q.ref);if(!(d.exists()&&d.data().sid===sid))await Q.S.setDoc(Q.ref,{sid,a:{},at:Q.S.serverTimestamp()})}catch(e){console.warn("answer",e)}
  if(joinQuiz.pending===sid)mySid=sid;   // answers are saved only from here, so the reset cannot wipe one
}

/* ---------- a student follows the class: ?live={group} ---------- */
// The device shows the teacher's slide and step (ELDeck.show), turns the Catalan help on for an Insecure student (their route in the
// deck's LS, #teambar data-ls) and shows the buzzer (el-buzz.js) when the student has a team. "Stop following" lets them look around.
const LIVE=(new URLSearchParams(location.search).get("live")||"").replace(/[^\w-]/g,"");
const lv=document.createElement("span");lv.className="ellive";lv.setAttribute("aria-live","polite");
let liveStop=null,buzzStop=null,ptStop=null,tmStop=null,paused=false,lastLive=null,liveGen=0;
const fresh=at=>{const ms=at&&(at.toMillis?at.toMillis():+at);return !!ms&&Date.now()-ms<10*60e3};
const sameDeck=p=>String(p||"").toLowerCase()===location.pathname.toLowerCase();   // the teacher's deck is this page (whatever the case of the address)
function liveDraw(){
  const x=lastLive,on=x&&x.on&&fresh(x.at),here=on&&sameDeck(x.deck);
  if(window.ELDeck)ELDeck.show(here&&!paused?x:null);
  if(here)joinQuiz(x);
  cbMode();
  lv.innerHTML=!on?`📺 ${B("The class presentation is not on now.","Ara no hi ha cap presentació a classe.")}`
    :!here?`📺 ${B("Your class is on another presentation:","La classe és en una altra presentació:")} <a href="${esc(x.deck)}?live=${LIVE}">${x.title?esc(x.title):B("open it","obre-la")}</a>`
    :paused?`<button type="button" data-live="1">📺 ${B("Follow again","Torna a seguir")}</button>`
    :`📺 ${B("Following the class","Segueixes la classe")} <button type="button" data-live="0">${B("Stop","Atura")}</button>`;
}
lv.addEventListener("click",e=>{const b=e.target.closest("[data-live]");if(b){paused=b.dataset.live==="0";liveDraw()}});
async function joinLive(u){
  const gen=++liveGen;[liveStop,buzzStop,ptStop,tmStop].forEach(f=>f&&f());liveStop=buzzStop=ptStop=tmStop=null;Q=null;mySid=0;joinQuiz.pending=0;
  ($(".bottom .mid")||document.body).append(lv);
  if(!u||T.teacher){lv.innerHTML=T.teacher?"":`📺 ${B("Sign in with your school email and password to follow the class.","Entra amb el correu de l’institut i la contrasenya per seguir la classe.")}`;if(!u)lv.append(signInBtn());return}
  const fb=await cloud();if(!fb||gen!==liveGen)return;const {S,db}=fb,em=(u.email||"").toLowerCase();Q={S,ref:S.doc(db,"live",LIVE,"answers",em)};
  if(bar.dataset.ls)S.getDoc(S.doc(db,"students",u.uid,"levels",bar.dataset.ls)).then(l=>{if(l.exists()&&(l.data().level==="insecure"||l.data().level==="beginners")&&window.ELDeck)ELDeck.setCa(true)}).catch(()=>{});   // Catalan for Insecure
  liveStop=S.onSnapshot(S.doc(db,"live",LIVE),s=>{lastLive=s.exists()?s.data():null;liveDraw()},e=>{console.warn("live",e);lv.innerHTML=`📺 ${B("You cannot follow this class.","No pots seguir aquesta classe.")}`});
  // the buzzer for my team, from points/{email} and teams/{group} as they change (a team given during the class counts too)
  try{const {buzzer}=await import(new URL("el-buzz.js",SRC).href);if(gen!==liveGen)return;let pt=null,tm=null,cur="";
    const setBuzz=()=>{const team=pt&&pt.team,list=(tm&&tm.list)||[],ok=team&&list.some(x=>x.id===team),key=ok?team+"|"+list.map(x=>x.id+x.name).join():"";
      if(key===cur)return;cur=key;if(buzzStop){buzzStop();buzzStop=null}if(!ok)return;
      const el=$("#elBuzzLive")||document.body.appendChild(Object.assign(document.createElement("div"),{id:"elBuzzLive"}));
      buzzStop=buzzer({S,db,group:LIVE,team,names:Object.fromEntries(list.map(x=>[x.id,x.name])),t:(ca,en)=>B(en,ca),el})};
    ptStop=S.onSnapshot(S.doc(db,"points",em),p=>{pt=p.exists()?p.data():null;setBuzz()},e=>console.warn("points",e));
    tmStop=S.onSnapshot(S.doc(db,"teams",LIVE),x=>{tm=x.exists()?x.data():null;setBuzz()},e=>console.warn("teams",e));
  }catch(e){console.warn("buzz",e)}
}
function signInBtn(){const b=document.createElement("button");b.type="button";b.innerHTML=B("Sign in","Entra");
  b.onclick=async()=>{const fb=await cloud();if(!fb)return;   // school email + password (el-signin.js)
    try{const [{signIn},C]=await Promise.all([import(new URL("el-signin.js",SRC).href),import(new URL("el-firebase.js",SRC).href)]);await signIn({auth:fb.auth,A:fb.A,domain:C.DOMAINS[0]})}catch(x){console.warn("sign in",x)}};return b}
if(LIVE){cloud();setInterval(()=>{if(lastLive)liveDraw()},60e3)}   // the class ends: no new minute from the teacher

draw();toggle(!!store.get("teamsOn",false));
window.ELDeckPoints={toggle,canBuzz,buzz:openBuzz};
})();
