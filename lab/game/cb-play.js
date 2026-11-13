// 🕵️ Code Breakers on a student's Chromebook (Roger, 11–12 Nov 2026; the rules are in cb.js). play.js hands the screen over to this
// when live/{group}.mode is "cb". The student plays at their own pace: a question (tiles or write the missing words), then, if right,
// one of 3 files. Their answers and game go to their own live/{group}/answers/{email} = {sid, a:{key: what they tapped or wrote (first
// try only)}, cb:{pw, ws, e (bits earned here), n (answered), r (right), i (place in their list), lp (loop), sh (firewall until), h:{k:
// {t (target pid), g (password guess), at}}, lx (last file: {k, n, at})}, at}, at most every 3 s (a hack or a firewall at once).
// The board answers hacks in live/{group}.cb.hr and publishes everyone's bits (cb.pl). Unlike the classic game, this page loads the decks
// (the questions and their answers) because each student goes at their own pace; the board recomputes every result from the raw answers.
// 🧑‍💻 Hacker avatars (cb-av.js, Roger 13 Nov 2026): their hacker sits only inside the name pill of the top bar while they play (never over
// the question or the answers); big in the lobby (with the 👕 locker: cb.wear = what they choose to wear) and on the end screen, where
// the board's cb.rw[pid] says what they won. Their own cbAv/{email} is read once per round; cb.bs = their best run of right answers.
export function cbPlayer(ctx){
const {S,G,esc,md,pic,T,app$}=ctx,CB=window.ELCB,AV=window.ELCBAV;
let avDoc=null;
let L=null,loading=null,st=null,sid=0,scr="",scrKey="",pend={a:{},cb:{}},flushT=0,seenHr=null,toastT=0,news=null,tick=0,fbTimer=0;
const em=()=>(ctx.user().email||"").toLowerCase(),me=()=>CB.pid(em()),x=()=>ctx.x()||{},C=()=>x().cb||{};
const now=()=>Date.now(),left=()=>Math.max(0,(+C().end||0)-now());
const over=()=>x().phase==="end"||x().phase==="play"&&+C().end&&left()<=0;
const plMine=()=>{const pl=Object.assign({},C().pl||{});pl[me()]=Object.assign({},pl[me()]||{},{e:st?st.e:0});return pl};
const myBits=()=>CB.score(me(),plMine(),C().hr);
const others=()=>Object.entries(C().pl||{}).filter(([id,p])=>id!==me()&&p.ws&&p.ws.length).map(([id,p])=>({id,...p,s:CB.score(id,id===me()?plMine():C().pl,C().hr)})).sort((a,b)=>b.s-a.s);
function rank(){const all=Object.keys(Object.assign({},C().pl||{},{[me()]:1})).map(id=>({id,s:CB.score(id,plMine(),C().hr)})).sort((a,b)=>b.s-a.s);return [all.findIndex(y=>y.id===me())+1,all.length]}
const qOf=k=>L&&L.byKey[k];

/* ---------- saving: my own answers doc ---------- */
function save(now_){Object.assign(pend.cb,{e:st.e,n:st.n,r:st.r,i:st.i,lp:st.lp,bs:st.bs||0});clearTimeout(flushT);flushT=setTimeout(flush,now_?0:3000)}
function flush(){clearTimeout(flushT);const r=ctx.ref();if(!r||!st||ctx.mySid()!==sid)return;
  const d={sid,at:S.serverTimestamp()};if(Object.keys(pend.a).length)d.a=pend.a;if(Object.keys(pend.cb).length)d.cb=pend.cb;pend={a:{},cb:{}};
  S.setDoc(r,d,{merge:true}).catch(e=>{console.warn("code breakers",e);pend.a=Object.assign(d.a||{},pend.a);pend.cb=Object.assign(d.cb||{},pend.cb);flushT=setTimeout(flush,5000)})}
addEventListener("pagehide",()=>{if(st)flush()});

/* ---------- starting: the decks, my list, what I did before a reload ---------- */
async function start(){
  sid=x().sid;st=null;scr="";L=null;seenHr=null;
  const decks=(C().decks||[]).filter(id=>/^[\w-]+$/.test(id)),got=await CB.load(decks);if(x().sid!==sid)return;
  got.byKey={};got.pool.forEach(q=>got.byKey[q.key]=q);L=got;
  const sv=ctx.saved()||{},c=sv.cb||{},seed=CB.hash(em()+":"+sid);
  st={seed,order:CB.order(L.pool,seed),a:Object.assign({},sv.a||{}),e:+c.e||0,n:+c.n||0,r:+c.r||0,i:+c.i||0,lp:+c.lp||0,pw:c.pw||"",ws:Array.isArray(c.ws)&&c.ws.length?c.ws:CB.pwFor(em(),L.words).map(w=>w.w),
    sh:+c.sh||0,hk:Object.keys(c.h||{}).length,cur:null,last:null,sim:null,skip:new Set(),lockUntil:0,bs:+c.bs||0,wear:c.wear&&typeof c.wear==="object"?c.wear:null};
  // my hacker: one read per round (only the board writes it)
  try{const r=ctx.ref();if(r){const d=await S.getDoc(S.doc(r.firestore,"cbAv",em()));avDoc=d.exists()?d.data():{}}}catch(e){console.warn("hacker",e);avDoc=avDoc||{}}
  if(x().sid!==sid)return;
  if(st.lp)st.order=CB.order(L.pool,seed+st.lp*101);
  if(!c.ws)pend.cb.ws=st.ws;
  scr=st.pw?"q":"pw";draw();
}
// the next question in my list, past the ones I already got as a 🔁 similar question in this round of the list
function nextQ(){if(!st.order.length)return null;
  for(let g=0;g<=st.order.length;g++){if(st.i>=st.order.length){st.lp++;st.i=0;st.skip.clear();st.order=CB.order(L.pool,st.seed+st.lp*101)}
    if(!st.skip.has(st.order[st.i]))break;st.i++}
  return st.order[st.i]}

/* ---------- screens ---------- */
const fmt=ms=>{const s=Math.ceil(ms/1000);return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")};
function top(){const [rk,of]=st?rank():[0,0],sh=st&&st.sh>now(),p=x().phase;
  const lk=myLook();
  return `<div class="top cbtop"><span class="pill cbme">${AV.svg(lk,{mini:true,size:40})}<span>${esc(ctx.first())}<small>${esc(AV.RANKS[lk.r-1].n)}</small></span></span><span class="pill cbbits">💾 <b id="cbb">${st?myBits():0}</b></span>${st&&p==="play"?`<span class="pill" id="cbrk">#${rk} / ${of}</span>`:""}
    ${sh?`<span class="pill cbsh" id="cbsh">🛡️ ${fmt(st.sh-now())}</span>`:""}<span class="sp cbnewsw">${newsH()}</span>${p==="play"&&+C().end?`<span class="pill cbtime${left()<30e3?" low":""}" id="cbt">⏱ ${fmt(left())}</span>`:""}
    <button class="btn ghost" data-do="mute" aria-label="Sound">${G.sound()?"🔊":"🔇"}</button></div>`}
function liveTop(){const t=app$.querySelector(".cbtop");if(!t)return;const b=t.querySelector("#cbb");if(!b)return;
  const v=String(myBits());if(b.textContent!==v){b.textContent=v;b.parentNode.classList.remove("bump");void b.parentNode.offsetWidth;b.parentNode.classList.add("bump")}
  const tm=t.querySelector("#cbt");if(tm){tm.textContent="⏱ "+fmt(left());tm.classList.toggle("low",left()<30e3)}
  const rk=t.querySelector("#cbrk");if(rk&&st){const [a,b2]=rank();rk.textContent=`#${a} / ${b2}`}
  const sh=t.querySelector("#cbsh");if(sh){if(st.sh>now())sh.textContent="🛡️ "+fmt(st.sh-now());else sh.remove()}}
// what I wear: my cbAv + what I chose in the 👕 locker; at the end, the board's new look (with what I just won)
function myLook(){const rw=(C().rw||{})[me()],p=(C().pl||{})[me()];
  if(rw&&p&&p.hv)return Object.assign({a:CB.avatar(em())},p.hv);return AV.look(avDoc,st&&st.wear,CB.avatar(em()))}
function put(key,h){scrKey=key;app$.innerHTML=top()+`<div class="main cbmain">${h}</div>`;waitCheck()}
// buttons that wait (data-until = ms): disabled until then, the seconds left on them; checked every second and exactly at the end
function waitCheck(){const t=now();let next=0;
  app$.querySelectorAll("[data-until]").forEach(b=>{const u=+b.dataset.until;
    if(t>=u){b.disabled=false;b.removeAttribute("data-until");b.classList.remove("wait");const l=b.querySelector(".wl");if(l)l.remove();const r=b.closest(".main")&&app$.querySelector(".cbread");if(r&&b.matches(".tile,.cbw .btn"))r.classList.add("done")}
    else{b.disabled=true;const l=b.querySelector(".wl");if(l)l.textContent=" ⏳ "+Math.ceil((u-t)/1000);next=next?Math.min(next,u):u}});
  if(next)setTimeout(waitCheck,Math.min(1000,next-t+20))}
function center(h){return `<div class="center"><div>${h}</div></div>`}

function draw(){
  if(x().sid!==sid&&!loading)loading=start().catch(e=>console.warn("code breakers",e)).finally(()=>{loading=null});
  if(!st){if(scrKey!=="load")put("load",center(`<div class="emo pop">🕵️</div><p class="big">Code Breakers</p><p class="mid">${esc(T("Loading the questions…","Carregant les preguntes…"))}</p>`));return}
  hrCheck();
  if(x().phase==="lobby"&&scr!=="pw"&&!st.pw)scr="pw";
  if(over()){flush();return endView()}
  if(x().phase==="lobby"&&st.pw)return scr==="locker"?lockerView():lobbyWait();
  if(scr==="locker")scr="q";
  const key=scr+":"+(scr==="q"?st.i+":"+st.lp+":"+(st.sim||""):"")+(scr==="files"||scr==="hackPick"||scr==="hackPw"||scr==="hackWait"||scr==="hackRes"||scr==="fb"?":"+(st.cur||"")+":"+(st.last?st.last.at:"")+(st.file?":o":""):"");
  if(key===scrKey&&scr!=="hackPick"){liveTop();waitCheck();if(scr==="hackWait")hackWaitCheck();return}
  ({pw:pwView,q:qView,fb:fbView,files:filesView,hackPick:pickView,hackPw:hackPwView,hackWait:hackWaitView,hackRes:hackResView}[scr]||qView)(key);
}

function pwView(key){
  const ws=st.ws||[];
  if(!ws.length){st.pw="-";scr="q";return draw()}
  put(key,center(`<div class="emo pop">🔐</div><p class="big">${esc(T("Choose your secret password","Tria la teva contrasenya secreta"))}</p>
    <p class="mid">${esc(T("Other players must guess it to hack you. Choose the word you think is hardest!","Els altres l'han d'endevinar per hackejar-te. Tria la paraula que creguis més difícil!"))}</p>
    <div class="cbpw">${ws.map(w=>`<button class="btn cbword${st.pw===w?" on":""}" data-cb="pw" data-w="${esc(w)}">${esc(w)}</button>`).join("")}</div>`));
}
function lobbyWait(){const lk=myLook(),key="lobby:"+st.pw+":"+JSON.stringify(lk);if(key===scrKey)return liveTop();
  put(key,center(`<div class="cbhero pop">${AV.svg(lk,{size:170})}<div><b>${esc(AV.RANKS[lk.r-1].n)}</b> <small>· ${esc(T("rank","rang"))} ${lk.r} / 10</small></div>
    <button class="btn ghost" data-cb="locker">👕 ${esc(T("My hacker","El meu hacker"))}</button></div><p class="big">${esc(T("You're in","Ja hi ets"))}, ${esc(ctx.first())}!</p>
    <p class="mid">🔒 ${esc(T("Your password","La teva contrasenya"))}: <b class="cbkey">${esc(st.pw)}</b> <button class="btn ghost" data-cb="repw">${esc(T("Change","Canvia"))}</button></p>
    <p class="mid">${esc(T("Wait for the start. Answer right to open files: bits, double, firewall, virus or hack!","Espera que comenci. Encerta per obrir fitxers: bits, doble, tallafoc, virus o hack!"))}</p>`))}

function qView(key){
  const k=st.sim||nextQ(),qu=qOf(k);if(!qu){put(key,center(`<p class="big">No questions</p>`));return}
  st.cur=k;const ms=CB.readMs(qu),until=now()+ms;st.lockUntil=until;
  const simTag=st.sim?`<div class="cbsimtag">🔁 ${esc(T("A similar question: try again!","Una pregunta semblant: torna-ho a provar!"))}</div>`:"";
  const bar=`<div class="cbread" style="--ms:${ms}ms" aria-hidden="true"><i></i></div>`;
  if(qu.write){
    put(key,`${simTag}<div class="card qcard slidein">${md(qu.q)}</div>${bar}${qu.img?`<div class="cbpic pic">${pic(qu.img)}</div>`:""}
      <form class="wform cbw slidein"><label for="cbwa">✏️ ${esc(T("Write the missing words","Escriu les paraules que falten"))}</label>
      <input id="cbwa" type="text" maxlength="60" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"><button class="btn go wait" type="submit" data-until="${until}" disabled>${esc(T("Send ✓","Envia ✓"))}</button></form>`);
    const i=document.getElementById("cbwa");if(i)i.focus();return}
  const o=CB.shown(qu,st.seed);
  put(key,`${simTag}<div class="card qcard slidein">${md(qu.q)}</div>${bar}<div class="tiles${o.length===2?" two":""}">${o.map((d,j)=>`<button class="tile t${j} wait" data-cb="tap" data-v="${j}" data-until="${until}" disabled><span class="shp s${j}"></span><span class="tx">${md(qu.options[d])}</span></button>`).join("")}</div>`);
}
function answer(text,right){
  const qu=qOf(st.cur);if(!qu||scr!=="q")return;
  if(now()<st.lockUntil)return;
  if(st.a[qu.key]==null){st.a[qu.key]=text;pend.a[qu.key]=text;st.n++;if(right)st.r++}
  // a 🔁 similar question is not in my list: the list goes on from where it was; a first wrong answer gets one, a second doesn't
  const second=!!st.sim;if(!second)st.i++;st.sim=null;
  st.last={ok:right,text,key:qu.key,at:now(),second,sim:!right&&!second?CB.similar(L.pool,qu,st.a,st.seed+st.n,new Set([...st.skip,...st.order.slice(st.i,st.i+1)])):null};
  st.streak=right?(st.streak||0)+1:0;st.bs=Math.max(st.bs||0,st.streak);
  G.fx(right?"right":"wrong");save();
  scr=right?"files":"fb";st.file=null;draw();
}
// ✗ Not this time: the answer, why, and (the first time) the theory of that part of the game, then 🔁 a similar question. The button waits a
// few seconds so they read it. Starter and Base (?ca=1) get the theory explained in Catalan (Roger, 13 Nov 2026: "if they are base or
// starter explain the theory in catalan"): the slide's Catalan help first, then its examples; the others get it in English (with the
// Catalan help smaller below when the level isn't known).
function thHtml(qu){const d=L.decks[qu.deck],sl=(d&&d.th&&d.th[qu.tp])||[];if(!sl.length)return "";
  const lang=ctx.lang?ctx.lang():null,bl=l=>l&&l.table?`<table><thead><tr>${l.table[0].map(c=>`<th>${md(c)}</th>`).join("")}</tr></thead><tbody>${l.table.slice(1).map(r=>`<tr>${r.map(c=>`<td>${md(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`
    :l&&l.watch?`<p class="w">⚠️ ${md(l.watch)}</p>`:`<p>${md(l)}</p>`;
  const ca=s0=>(s0.ca||[]).map(c=>`<p>${md(c)}</p>`).join("");
  return `<div class="card cbth slidein"><small>📖 ${esc(T("Remember the theory","Recorda la teoria"))}</small>${sl.map(s0=>lang==="1"
    ?`<h4>${esc(s0.img||"")} ${md(s0.pointCa||s0.point||s0.theory)}</h4>${s0.ca&&s0.ca.length?`<div class="cbca">${ca(s0)}</div>`:""}${(s0.lines||[]).map(bl).join("")}`
    :`<h4>${esc(s0.img||"")} ${md(s0.point||s0.theory)}</h4>${(s0.lines||[]).map(bl).join("")}${lang!=="0"&&s0.ca&&s0.ca.length?`<div class="cbca small">${ca(s0)}</div>`:""}`).join("")}</div>`}
function fbView(key){const qu=qOf(st.last.key),sim=st.last.sim,wait=now()+(st.last.second?2500:5000);
  const btn=sim?`<button class="btn go wait" data-cb="sim" data-until="${wait}" disabled>🔁 ${esc(T("Try a similar question","Prova una pregunta semblant"))}<span class="wl"></span></button>`
    :`<button class="btn go wait" data-cb="next" data-until="${wait}" disabled>${esc(T("Next question ▶","Següent pregunta ▶"))}<span class="wl"></span></button>`;
  put(key,`<div class="res no cbres"><div class="pop cbfb"><div class="mark">✗</div><p class="big">${esc(st.last.second?T("Not this one either","Aquesta tampoc"):T("Not this time","Aquesta no"))}</p>
    <p class="mid">${qu.write?`${esc(T("You wrote","Has escrit"))}: <s>${esc(st.last.text)}</s><br>`:""}${esc(T("The answer","La resposta"))}: <b>${qu.write?esc(qu.write[0]):md(qu.options[0])}</b></p>
    ${qu.why?`<p class="mid cbwhy">💡 ${md(qu.why)}</p>`:""}${st.last.second?`<p class="mid">💪 ${esc(T("Keep going: you'll see it again later.","Continua: ja hi tornaràs a sortir."))}</p>`:thHtml(qu)}<p>${btn}</p></div></div>`)}

// 👕 the locker (lobby only): what I won, to wear; what I could still win, greyed out. Ranks come from XP; the crates from my % right.
function lockerView(){const lk=myLook(),doc=avDoc||{},xp=+doc.xp||0,nx=AV.RANKS[lk.r],key="locker:"+JSON.stringify(lk);if(key===scrKey)return liveTop();
  const cell=(s,k,tier)=>{const own=!k||AV.own(doc,s,k),on=(lk[s]||"")===k,c=k?AV.TIERS[tier].c:"#475569";
    const face=(s==="v"||s==="p")&&k?`<i class="sw" style="background:${AV.ITEMS[s][k]}"></i>`:k?`<i class="ic">${AV.ICON[k]||"?"}</i>`:`<i class="ic">–</i>`;
    const name=!k?(s==="p"?T("standard","normal"):T("none","cap")):s==="pt"||s==="fx"?AV.ITEMS[s][k]:k;
    return `<button class="cbit${on?" on":""}" style="--c:${c}" data-cb="wear" data-s="${s}" data-k="${k}"${own?"":" disabled"} title="${esc(name)}">${face}<span>${esc(name)}</span></button>`};
  const badges=Object.entries(AV.BADGES).map(([k,b])=>`<span class="cbbdg${doc.b&&doc.b[k]?"":" off"}" title="${esc(b[1]+": "+b[2])}">${b[0]}</span>`).join("");
  put(key,`<div class="cblocker"><div class="cbhero">${AV.svg(lk,{size:190})}<div><b>${esc(AV.RANKS[lk.r-1].n)}</b> <small>· ${esc(T("rank","rang"))} ${lk.r} / 10</small></div>
      <div class="cbxp"><i style="width:${nx?Math.round((xp-AV.RANKS[lk.r-1].xp)/(nx.xp-AV.RANKS[lk.r-1].xp)*100):100}%"></i></div><small>${xp} XP${nx?` · ${nx.xp-xp} ${esc(T("to","per a"))} ${esc(nx.n)}`:""}</small>
      <div class="cbbdgs">${badges}</div><button class="btn go" data-cb="lockerOk">✓ ${esc(T("Done","Fet"))}</button></div>
    <div class="cbslots">${AV.SLOTS.map(([s,label,items,tier])=>`<div><h4>${esc(label)} <span style="color:${AV.TIERS[tier].c}">· ${esc(AV.TIERS[tier].n)}</span></h4><div class="cbits">${(s!=="v"?[""]:[]).concat(Object.keys(items)).map(k=>cell(s,k,tier)).join("")}</div></div>`).join("")}
      <p class="cbhow">${esc(T("Better results, better crates: under 50 % a visor, 50–74 % a paint, 75–89 % a pet, 90 % or more an effect. Beat your best % for a better one!","Millors resultats, millors premis: menys del 50 % una visera, 50–74 % una pintura, 75–89 % una mascota, 90 % o més un efecte. Supera el teu millor % i en tindràs un de millor!"))}</p></div></div>`)}

/* ---------- the 3 files ---------- */
function filesView(key){const f=st.file;
  const card=(j)=>{if(!f)return `<button class="cbfile slidein" style="animation-delay:${j*.08}s" data-cb="file" data-j="${j}"><span class="fe">📁</span><span>${"ABC"[j]}</span></button>`;
    const r=f.all[j],[e,n]=CB.FILE_LOOK[r.k];return `<div class="cbfile open ${j===f.j?"mine pop":"dim"} k-${r.k}"><span class="fe">${e}</span><span>${r.k==="bits"?"+"+r.n:esc(n)}</span></div>`};
  const msg=f?fileMsg(f.got):"";
  put(key,center(`<p class="big">${f?msg:"✓ "+esc(T("Correct! Choose a file","Correcte! Tria un fitxer"))}</p><div class="cbfiles">${[0,1,2].map(card).join("")}</div>
    ${f?`<p><button class="btn go" data-cb="${f.got.k==="hack"?"hack":"next"}">${f.got.k==="hack"?"💻 "+esc(T("Choose who to hack","Tria a qui hackeges")):esc(T("Next question ▶","Següent pregunta ▶"))}</button>${f.got.k==="hack"?` <button class="btn ghost" data-cb="next">${esc(T("Skip","Salta"))}</button>`:""}</p>`:""}`));
  const b=app$.querySelector(".btn.go");if(b)b.focus()}
function fileMsg(g){const t={bits:`💾 +${g.n} bits!`,double:`⚡ ${T("Double!","Doble!")} +${g.n}`,shield:`🛡️ ${T("Firewall on for 90 s","Tallafoc actiu 90 s")}`,
  virus:`🦠 ${T("Virus!","Virus!")} −${g.n}`,hack:`💻 ${T("Hack!","Hack!")}`};return esc(t[g.k]||"")}
function openFile(j){if(st.file)return;
  const canHack=others().some(p=>p.s>0&&!guarded(p)),cur0=myBits(),all=[0,1,2].map(()=>CB.reward(st.r,canHack,null,cur0)),got=Object.assign({},all[j]),cur=myBits();
  if(got.k==="double"){got.n=cur;st.e+=got.n}
  else if(got.k==="virus"){got.n=Math.round(cur*CB.VIRUS);st.e-=got.n}
  else if(got.k==="bits")st.e+=got.n;
  else if(got.k==="shield"){st.sh=now()+CB.SHIELD_MS;pend.cb.sh=st.sh}
  st.file={j,all,got};pend.cb.lx={k:got.k,n:got.n||0,at:now()};
  G.fx(got.k==="virus"?"wrong":got.k==="hack"?"reveal":"right");if(got.k==="double")G.confetti();
  save(got.k!=="bits");draw()}

/* ---------- hacking ---------- */
// 🤝 a player hacked a moment ago, or the one I tried last, can't be chosen now (cb.js guard): greyed out with ✋ and the time left
const guarded=p=>{const hr=C().hr,u=CB.guard(p.id,hr);return u>now()?u:CB.lastTarget(me(),hr)===p.id?-1:0};
function pickView(key){const l=others();
  const k2=key+":"+l.map(p=>p.id+p.s+(p.sh>now()?"s":"")+":"+Math.ceil(Math.max(0,guarded(p)-now())/1000)).join(",");if(k2===scrKey)return liveTop();
  put(k2,`<p class="big cbh">💻 ${esc(T("Who do you want to hack?","A qui vols hackejar?"))}</p>
    <p class="cbrule">🤝 ${esc(T("Fair play: you can't hack the same person twice in a row, and someone who was just hacked is safe for a moment.","Joc net: no pots hackejar la mateixa persona dues vegades seguides, i qui acaba de ser hackejat està protegit una estona."))}</p>
    <div class="cbpick">${l.map(p=>{const g=guarded(p);return `<button class="cbp${g?" grd":""}" data-cb="target" data-id="${esc(p.id)}"${p.s>0&&!g?"":" disabled"}><span class="av">${AV.svg(Object.assign({a:p.av},p.hv),{mini:true,size:44})}</span><span class="nm">${esc(p.nm||"?")}</span><span class="bt">${g>0?"✋ "+fmt(g-now()):g?"✋ "+esc(T("Last time","L'última vegada")):"💾 "+p.s}</span>${p.sh>now()?'<span class="sh">🛡️</span>':""}</button>`}).join("")||`<p class="mid">${esc(T("Nobody to hack yet.","Encara no hi ha ningú per hackejar."))}</p>`}</div>
    <p style="text-align:center"><button class="btn ghost" data-cb="next">${esc(T("Skip","Salta"))}</button></p>`)}
function hackPwView(key){const p=(C().pl||{})[st.target]||{};
  put(key,center(`<p class="big">🔓 ${esc(T("Crack the password of","Esbrina la contrasenya de"))} ${AV.svg(Object.assign({a:p.av},p.hv),{mini:true,size:48})} ${esc(p.nm||"")}</p>
    <div class="card cbclue"><small>${esc(T("Clue: the missing word","Pista: la paraula que falta"))}</small>${md(p.c||"…")}</div>
    <div class="cbpw">${(p.ws||[]).map(w=>`<button class="btn cbword" data-cb="guess" data-w="${esc(w)}">${esc(w)}</button>`).join("")}</div>
    <p><button class="btn ghost" data-cb="next">${esc(T("Skip","Salta"))}</button></p>`))}
function guess(w){const id=String(st.hk++);st.hack={id:me()+"_"+id,t:st.target,g:w,at:now()};
  pend.cb.h=Object.assign(pend.cb.h||{},{[id]:{t:st.target,g:w,at:st.hack.at}});save(true);scr="hackWait";draw()}
function hackWaitView(key){put(key,center(`<div class="emo cbspin">💻</div><p class="big">${esc(T("Hacking…","Hackejant…"))}</p><div class="cbprog"><i></i></div>`));hackWaitCheck()}
function hackWaitCheck(){const h=st.hack,r=h&&(C().hr||{})[h.id];
  if(r&&now()-h.at>1800){st.hack.res=r;scr="hackRes";G.fx(r.ok?"fanfare":"wrong");if(r.ok)G.confetti();draw()}
  else if(!r&&now()-h.at>20e3){st.hack.res={late:true};scr="hackRes";draw()}}
function hackResView(key){const r=st.hack.res,p=(C().pl||{})[st.hack.t]||{};
  const h=r.late?`<div class="emo">📡</div><p class="big">${esc(T("No answer from the board","El tauler no respon"))}</p><p class="mid">${esc(T("Keep playing: you'll see the result on the board.","Continua jugant: el resultat sortirà al tauler."))}</p>`
    :r.pr?`<div class="emo pop">✋</div><p class="big">${esc(T("Protected!","Protegit!"))}</p><p class="mid">${esc(p.nm||"")} ${esc(T("was just hacked: choose someone else next time.","acaba de ser hackejat: la propera vegada tria algú altre."))}</p>`
    :r.blk?`<div class="emo pop">🛡️</div><p class="big">${esc(T("Blocked!","Bloquejat!"))}</p><p class="mid">${esc(p.nm||"")} ${esc(T("has a firewall on.","té el tallafoc actiu."))}</p>`
    :r.ok?`<div class="emo pop">🔓</div><p class="big">${esc(T("Access granted!","Accés concedit!"))}</p><p class="mid">${esc(T("You stole","Has robat"))} <b>${r.n} bits</b> ${esc(T("from","a"))} ${esc(p.av||"")} ${esc(p.nm||"")}</p>`
    :`<div class="emo pop">🔒</div><p class="big">${esc(T("Wrong password","Contrasenya incorrecta"))}</p><p class="mid">“${esc(st.hack.g)}” ${esc(T("was not it.","no era.")) }</p>`;
  put(key,center(h+`<p><button class="btn go" data-cb="next">${esc(T("Next question ▶","Següent pregunta ▶"))}</button></p>`))}
// someone hacked me (or my firewall stopped them): a banner for a few seconds, the game goes on underneath
function hrCheck(){const hr=C().hr||{};
  if(!seenHr){seenHr=new Set(Object.keys(hr));return}
  Object.entries(hr).forEach(([id,h])=>{if(seenHr.has(id))return;seenHr.add(id);if(h.t!==me())return;
    if(h.pr)return;const p=(C().pl||{})[h.f]||{};
    toast(h.ok?`⚠️ ${esc(p.av||"")} <b>${esc(p.nm||"")}</b> ${esc(T("hacked you!","t'ha hackejat!"))} −${h.n} bits`:h.blk?`🛡️ ${esc(T("Your firewall stopped","El teu tallafoc ha aturat"))} ${esc(p.av||"")} <b>${esc(p.nm||"")}</b>`:`🔒 ${esc(p.av||"")} <b>${esc(p.nm||"")}</b> ${esc(T("tried to hack you, but failed","ha intentat hackejar-te, però ha fallat"))}`,h.ok);
    if(h.ok)G.fx("wrong")})}
// The news sits in the top bar, in the space between the pills (13 Nov 2026, 2 ESO A: "El texto no me deja leer": a floating box
// at the top of the screen covered the question every time somebody tried to hack them). It never covers the question or the answers.
function newsH(){return news&&news.until>now()?`<span class="cbnews${news.bad?" bad":""} pop" id="cbnews">${news.h}</span>`:""}
function toast(h,bad){news={h,bad,until:now()+5000};const w=app$.querySelector(".cbtop .cbnewsw");if(w)w.innerHTML=newsH();
  clearTimeout(toastT);toastT=setTimeout(()=>{news=null;const n=document.getElementById("cbnews");if(n)n.remove()},5000)}

// the end: my hacker (left) and the round (right): bits, place, % right, then what my hacker won (cb.rw, from the board a moment later)
function endView(){const [rk,of]=rank(),rw=(C().rw||{})[me()],key="end:"+myBits()+":"+rk+":"+(x().cp??"")+":"+(rw?rw.xp:"-");if(key===scrKey)return;
  if(!scrKey.startsWith("end")){G.fx("fanfare");if(rk&&rk<=3)G.confetti()}
  if(rw&&!scrKey.includes(":"+rw.xp)&&rw.r1>rw.r0)setTimeout(()=>{G.fx("reveal");G.confetti()},600);
  const pc=st.n?Math.round(st.r/st.n*100):0,lk=myLook(),xp=rw?rw.xp:+(avDoc&&avDoc.xp)||0,cur=AV.RANKS[lk.r-1],nx=AV.RANKS[lk.r];
  const up=rw&&rw.r1>rw.r0,tier=rw?AV.TIERS[rw.t]:null;
  const won=!rw?(st.n>=3?`<p class="mid cbwait">⏳ ${esc(T("Your hacker is getting its rewards…","El teu hacker està rebent els premis…"))}</p>`:`<p class="mid">${esc(T("Answer 3 questions or more to earn XP for your hacker.","Respon 3 preguntes o més per guanyar XP per al teu hacker."))}</p>`)
    :`<div class="cbline"><span>✓ ${st.r} × 10 XP${rw.m!==1?` × ${rw.m}`:""}${rw.bo?` + ${rw.bo} 🏆`:""}</span><b>+${rw.x} XP</b></div>
      <div class="cbcrate pop" style="--c:${tier.c}"><span class="ce">${tier.e}</span><span><small>${esc(tier.n)} ${esc(T("crate","premi"))}${rw.up?" · 📈 "+esc(T("personal best","rècord personal")):""}</small>${rw.g?`${esc(AV.SLOTS.find(z=>z[0]===rw.g.s)[1])}: <b>${esc(rw.g.s==="pt"||rw.g.s==="fx"?AV.ITEMS[rw.g.s][rw.g.k]:rw.g.k)}</b>`:esc(T("You have them all: +50 XP!","Ja els tens tots: +50 XP!"))}</span></div>
      ${rw.nb&&rw.nb.length?`<div class="cbbdgs">${rw.nb.map(k=>AV.BADGES[k]?`<span class="cbbdg big pop">${AV.BADGES[k][0]} ${esc(AV.BADGES[k][1])}</span>`:"").join("")}</div>`:""}`;
  put(key,`<div class="cbend"><div class="cbhero${up?" up":""}">${AV.svg(lk,{size:190})}${up?`<div class="cbrankup pop">⭐ ${esc(T("Rank up!","Has pujat de rang!"))}</div>`:""}
      <div><b>${esc(cur.n)}</b> <small>· ${esc(T("rank","rang"))} ${lk.r} / 10</small></div><div class="cbxp"><i style="width:${nx?Math.round((xp-cur.xp)/(nx.xp-cur.xp)*100):100}%"></i></div><small>${xp} XP${nx?` · ${nx.xp-xp} ${esc(T("to","per a"))} ${esc(nx.n)}`:""}</small></div>
    <div class="cbendr"><p class="big">${rk===1?"🏆":rk&&rk<=3?"🥈":"⏱"} ${esc(T("Time's up!","S'ha acabat el temps!"))}</p>
      <p class="mid">💾 <b>${myBits()} bits</b> · #${rk} / ${of} · ✓ ${st.r} / ${st.n} (${pc} %)</p>${won}
      ${typeof x().cp==="number"?G.ring(x().cp,"👥 "+T("The class got right","La classe ha encertat"),"min(16vh,120px)"):""}${ctx.cmWait()}</div></div>`)}

/* ---------- taps and keys ---------- */
app$.addEventListener("click",e=>{if(!st||x().mode!=="cb")return;const b=e.target.closest("[data-cb]");if(!b||b.disabled)return;const d=b.dataset.cb;
  if(d==="pw"){st.pw=b.dataset.w;pend.cb.pw=st.pw;pend.cb.ws=st.ws;save(true);G.fx("tap");scr="q";draw()}
  else if(d==="repw"){scr="pw";draw()}
  else if(d==="locker"){scr="locker";draw()}
  else if(d==="lockerOk"){scr="q";draw()}
  else if(d==="wear"){st.wear=Object.assign({},st.wear||{},{[b.dataset.s]:b.dataset.k||""});pend.cb.wear=st.wear;save(true);G.fx("tap");draw()}
  else if(d==="tap"&&scr==="q"&&now()>=st.lockUntil){const qu=qOf(st.cur),o=CB.shown(qu,st.seed),k=o[+b.dataset.v];answer(CB.plain(qu.options[k]),k===0)}
  else if(d==="next"){scr="q";st.file=null;st.sim=null;draw()}
  else if(d==="sim"&&st.last&&st.last.sim){st.sim=st.last.sim;st.skip.add(st.sim);scr="q";st.file=null;draw()}
  else if(d==="file")openFile(+b.dataset.j);
  else if(d==="hack"){scr="hackPick";draw()}
  else if(d==="target"){st.target=b.dataset.id;scr="hackPw";draw()}
  else if(d==="guess")guess(b.dataset.w);
});
app$.addEventListener("submit",e=>{if(!st||x().mode!=="cb"||!e.target.closest(".cbw"))return;e.preventDefault();
  const v=String(e.target.querySelector("input").value||"").replace(/\s+/g," ").trim().slice(0,60);if(!v)return;const qu=qOf(st.cur);answer(v,CB.isRight(qu,v))});
addEventListener("keydown",e=>{if(!st||x().mode!=="cb")return;if(e.key==="Enter"&&scr!=="q"){const b=app$.querySelector('[data-cb="next"].btn.go,[data-cb="sim"],[data-cb="hack"]');if(b&&!e.target.closest("input")){e.preventDefault();b.click()}}});
clearInterval(tick);tick=setInterval(()=>{if(st&&x().mode==="cb"&&ctx.active())draw()},1000);
return {draw,flush};
}
