// Team points in a class presentation (Roger, 25 Oct 2026; the rules and the bonus are in el-points.js, which loads first).
// Load it after the slides and before the deck's own script. The deck has:
//   <section class="slide" data-el-points></section>: the reminder, filled here so every presentation explains the points;
//   #teambar (data-course="4eso": the groups to choose from) and #teamsBtn (🏆 Teams), which opens and closes it.
// Signed out, the strip is a plain scoreboard kept in this browser. Signed in with the teacher's account and a class group
// chosen, its teams come from the dashboard (Team points) and every + or − is saved at once for each member of the team
// (points/{email}.{term}) and for the team (teams/{group}.score.{term}.{team}), with the group's best (teams/{group}.best.{term}).
// The deck's own script opens the strip with ELDeckPoints.toggle(true) (.go321[data-teams]) and re-places its timer on resize.
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
.ptrule{display:flex;gap:.7em;align-items:flex-start;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:.55em .9em;min-width:0}
.ptrule .ico{font-size:1.4em;line-height:1.1;flex:0 0 auto}.ptrule b{display:block}
@media (prefers-reduced-motion: reduce){.team .sc.bump{animation:none}}`;
document.head.appendChild(css);

/* ---------- reminder slide: the rules, then a quick check with new numbers every time ---------- */
const EX=[[12,15],[8,16],[12,20],[14,20],[9,10],[6,15],[15,25],[16,20]];
$$(".slide[data-el-points]").forEach(s=>{
  const [m,b]=EX[Math.floor(Math.random()*EX.length)],x=elBonus(m,b),N=n=>elNum(n,"en"),C=n=>elNum(n,"ca"),opt=(n,ok)=>`<button type="button" class="opt"${ok?" data-ok":""} data-ca="+${C(n)}">+${N(n)}</button>`;
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
const T={fb:null,user:null,teacher:false,group:"",data:null,msg:""};
{const g=store.get("group",null);if(g&&g.g&&Date.now()-g.at<3*3600e3)T.group=g.g}
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
    :D?`<span class="tstat" title="Saved for every member of the team">${B(elTermName(D.term,"en"),elTermName(D.term,"ca"))} · ${B("best","millor")} ${Math.max(0,...Object.values(D.pts))}</span><button type="button" class="tool" id="teamsReload" title="Load the teams again">↻</button>`
    :T.teacher?"":`<button type="button" class="tool" id="teamsSignIn" title="Sign in with the teacher's account to save the points for a class group">☁ ${B("Save points","Desa els punts")}</button>`;
  const ctl=cloudOn?"":`<select id="teamCount" aria-label="Number of teams">${[2,3,4,5,6].map(n=>`<option value="${n}"${n===local.n?" selected":""}>${n}</option>`).join("")}</select><button type="button" class="tool" id="teamsZero">${B("Reset","Zero")}</button>`;
  bar.innerHTML=h+`<span class="tctl">${sel}${ctl}${stat}</span>`;
  resized();
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
    A.onAuthStateChanged(fb.auth,u=>{T.user=u;T.teacher=!!u&&C.TEACHERS.includes((u.email||"").toLowerCase());if(T.teacher&&T.group)load();else draw()});
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
    T.data={g,term,list,score:Object.assign({},(t.score||{})[term]),members,pts};T.msg="";
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

bar.addEventListener("click",async e=>{
  const b=e.target.closest("[data-team]");
  if(b){const d=+b.dataset.d;
    if(ready())return award(b.dataset.team,d);
    const t=+b.dataset.team;local.score[t]=Math.max(0,(local.score[t]||0)+d);b.parentNode.querySelector(".sc").textContent=local.score[t];store.set("teams",local);if(d>0)bump(t);return}
  if(e.target.closest("#teamsZero")){local.score=[0,0,0,0,0,0];store.set("teams",local);draw()}
  if(e.target.closest("#teamsReload"))load();
  if(e.target.closest("#teamsSignIn")){const fb=await cloud();if(!fb)return;
    try{const p=new fb.A.GoogleAuthProvider();p.setCustomParameters({prompt:"select_account"});await fb.A.signInWithPopup(fb.auth,p)}catch(x){console.warn("sign in",x)}
    if(!T.teacher&&T.user){T.msg=B("Only the teacher's account saves points.","Només el compte del professor desa punts.");draw()}}
});
bar.addEventListener("change",e=>{
  const id=e.target.id;
  if(id==="teamGroup"){T.group=e.target.value;T.msg="";store.set("group",T.group?{g:T.group,at:Date.now()}:null);T.group?load():draw()}
  else if(id==="teamCount"){local.n=+e.target.value;store.set("teams",local);draw()}
  else if(id.startsWith("teamName")){local.names[+id.slice(8)]=e.target.value;store.set("teams",local)}
});
if(btn)btn.addEventListener("click",()=>toggle());
draw();toggle(!!store.get("teamsOn",false));
window.ELDeckPoints={toggle};
})();
