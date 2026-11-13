// 🕵️ Code Breakers on a student's Chromebook (Roger, 11–12 Nov 2026; the rules are in cb.js). play.js hands the screen over to this
// when live/{group}.mode is "cb". The student plays at their own pace: a question (tiles or write the missing words), then, if right,
// one of 3 files. Their answers and game go to their own live/{group}/answers/{email} = {sid, a:{key: what they tapped or wrote (first
// try only)}, cb:{pw, ws, e (bits earned here), n (answered), r (right), i (place in their list), lp (loop), sh (firewall until), h:{k:
// {t (target pid), g (password guess), at}}, lx (last file: {k, n, at})}, at}, at most every 3 s (a hack or a firewall at once).
// The board answers hacks in live/{group}.cb.hr and publishes everyone's bits (cb.pl). Unlike the classic game, this page loads the decks
// (the questions and their answers) because each student goes at their own pace; the board recomputes every result from the raw answers.
export function cbPlayer(ctx){
const {S,G,esc,md,pic,T,app$}=ctx,CB=window.ELCB;
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
function save(now_){Object.assign(pend.cb,{e:st.e,n:st.n,r:st.r,i:st.i,lp:st.lp});clearTimeout(flushT);flushT=setTimeout(flush,now_?0:3000)}
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
    sh:+c.sh||0,hk:Object.keys(c.h||{}).length,cur:null,last:null};
  if(st.lp)st.order=CB.order(L.pool,seed+st.lp*101);
  if(!c.ws)pend.cb.ws=st.ws;
  scr=st.pw?"q":"pw";draw();
}
function nextQ(){if(!st.order.length)return null;if(st.i>=st.order.length){st.lp++;st.i=0;st.order=CB.order(L.pool,st.seed+st.lp*101)}return st.order[st.i]}

/* ---------- screens ---------- */
const fmt=ms=>{const s=Math.ceil(ms/1000);return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")};
function top(){const [rk,of]=st?rank():[0,0],sh=st&&st.sh>now(),p=x().phase;
  return `<div class="top cbtop"><span class="pill">${CB.avatar(em())} ${esc(ctx.first())}</span><span class="pill cbbits">💾 <b id="cbb">${st?myBits():0}</b></span>${st&&p==="play"?`<span class="pill" id="cbrk">#${rk} / ${of}</span>`:""}
    ${sh?`<span class="pill cbsh" id="cbsh">🛡️ ${fmt(st.sh-now())}</span>`:""}<span class="sp cbnewsw">${newsH()}</span>${p==="play"&&+C().end?`<span class="pill cbtime${left()<30e3?" low":""}" id="cbt">⏱ ${fmt(left())}</span>`:""}
    <button class="btn ghost" data-do="mute" aria-label="Sound">${G.sound()?"🔊":"🔇"}</button></div>`}
function liveTop(){const t=app$.querySelector(".cbtop");if(!t)return;const b=t.querySelector("#cbb");if(!b)return;
  const v=String(myBits());if(b.textContent!==v){b.textContent=v;b.parentNode.classList.remove("bump");void b.parentNode.offsetWidth;b.parentNode.classList.add("bump")}
  const tm=t.querySelector("#cbt");if(tm){tm.textContent="⏱ "+fmt(left());tm.classList.toggle("low",left()<30e3)}
  const rk=t.querySelector("#cbrk");if(rk&&st){const [a,b2]=rank();rk.textContent=`#${a} / ${b2}`}
  const sh=t.querySelector("#cbsh");if(sh){if(st.sh>now())sh.textContent="🛡️ "+fmt(st.sh-now());else sh.remove()}}
function put(key,h){scrKey=key;app$.innerHTML=top()+`<div class="main cbmain">${h}</div>`}
function center(h){return `<div class="center"><div>${h}</div></div>`}

function draw(){
  if(x().sid!==sid&&!loading)loading=start().catch(e=>console.warn("code breakers",e)).finally(()=>{loading=null});
  if(!st){if(scrKey!=="load")put("load",center(`<div class="emo pop">🕵️</div><p class="big">Code Breakers</p><p class="mid">${esc(T("Loading the questions…","Carregant les preguntes…"))}</p>`));return}
  hrCheck();
  if(x().phase==="lobby"&&scr!=="pw"&&!st.pw)scr="pw";
  if(over()){flush();return endView()}
  if(x().phase==="lobby"&&st.pw)return lobbyWait();
  const key=scr+":"+(scr==="q"?st.i+":"+st.lp:"")+(scr==="files"||scr==="hackPick"||scr==="hackPw"||scr==="hackWait"||scr==="hackRes"||scr==="fb"?":"+(st.cur||"")+":"+(st.last?st.last.at:"")+(st.file?":o":""):"");
  if(key===scrKey&&scr!=="hackPick"){liveTop();if(scr==="hackWait")hackWaitCheck();return}
  ({pw:pwView,q:qView,fb:fbView,files:filesView,hackPick:pickView,hackPw:hackPwView,hackWait:hackWaitView,hackRes:hackResView}[scr]||qView)(key);
}

function pwView(key){
  const ws=st.ws||[];
  if(!ws.length){st.pw="-";scr="q";return draw()}
  put(key,center(`<div class="emo pop">🔐</div><p class="big">${esc(T("Choose your secret password","Tria la teva contrasenya secreta"))}</p>
    <p class="mid">${esc(T("Other players must guess it to hack you. Choose the word you think is hardest!","Els altres l'han d'endevinar per hackejar-te. Tria la paraula que creguis més difícil!"))}</p>
    <div class="cbpw">${ws.map(w=>`<button class="btn cbword${st.pw===w?" on":""}" data-cb="pw" data-w="${esc(w)}">${esc(w)}</button>`).join("")}</div>`));
}
function lobbyWait(){const key="lobby:"+st.pw;if(key===scrKey)return liveTop();
  put(key,center(`<div class="emo pop">🕵️</div><p class="big">${esc(T("You're in","Ja hi ets"))}, ${esc(ctx.first())}!</p>
    <p class="mid">🔒 ${esc(T("Your password","La teva contrasenya"))}: <b class="cbkey">${esc(st.pw)}</b> <button class="btn ghost" data-cb="repw">${esc(T("Change","Canvia"))}</button></p>
    <p class="mid">${esc(T("Wait for the start. Answer right to open files: bits, double, firewall, virus or hack!","Espera que comenci. Encerta per obrir fitxers: bits, doble, tallafoc, virus o hack!"))}</p>`))}

function qView(key){
  const k=nextQ(),qu=qOf(k);if(!qu){put(key,center(`<p class="big">No questions</p>`));return}
  st.cur=k;
  if(qu.write){
    put(key,`<div class="card qcard slidein">${md(qu.q)}</div>${qu.img?`<div class="cbpic pic">${pic(qu.img)}</div>`:""}
      <form class="wform cbw slidein"><label for="cbwa">✏️ ${esc(T("Write the missing words","Escriu les paraules que falten"))}</label>
      <input id="cbwa" type="text" maxlength="60" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"><button class="btn go" type="submit">${esc(T("Send ✓","Envia ✓"))}</button></form>`);
    const i=document.getElementById("cbwa");if(i)i.focus();return}
  const o=CB.shown(qu,st.seed);
  put(key,`<div class="card qcard slidein">${md(qu.q)}</div><div class="tiles${o.length===2?" two":""}">${o.map((d,j)=>`<button class="tile t${j}" data-cb="tap" data-v="${j}"><span class="shp s${j}"></span><span class="tx">${md(qu.options[d])}</span></button>`).join("")}</div>`);
}
function answer(text,right){
  const qu=qOf(st.cur);if(!qu||scr!=="q")return;
  if(st.a[qu.key]==null){st.a[qu.key]=text;pend.a[qu.key]=text;st.n++;if(right)st.r++}
  st.i++;st.last={ok:right,text,key:qu.key,at:now()};st.streak=right?(st.streak||0)+1:0;
  G.fx(right?"right":"wrong");save();
  scr=right?"files":"fb";st.file=null;draw();
}
function fbView(key){const qu=qOf(st.last.key);
  put(key,`<div class="res no cbres"><div class="pop"><div class="mark">✗</div><p class="big">${esc(T("Not this time","Aquesta no"))}</p>
    <p class="mid">${qu.write?`${esc(T("You wrote","Has escrit"))}: <s>${esc(st.last.text)}</s><br>`:""}${esc(T("The answer","La resposta"))}: <b>${qu.write?esc(qu.write[0]):md(qu.options[0])}</b></p>
    ${qu.why?`<p class="mid cbwhy">💡 ${md(qu.why)}</p>`:""}<p><button class="btn go" data-cb="next">${esc(T("Next question ▶","Següent pregunta ▶"))}</button></p></div></div>`);
  const b=app$.querySelector('[data-cb="next"]');if(b)b.focus()}

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
  const canHack=others().some(p=>p.s>0),cur0=myBits(),all=[0,1,2].map(()=>CB.reward(st.r,canHack,null,cur0)),got=Object.assign({},all[j]),cur=myBits();
  if(got.k==="double"){got.n=cur;st.e+=got.n}
  else if(got.k==="virus"){got.n=Math.round(cur*CB.VIRUS);st.e-=got.n}
  else if(got.k==="bits")st.e+=got.n;
  else if(got.k==="shield"){st.sh=now()+CB.SHIELD_MS;pend.cb.sh=st.sh}
  st.file={j,all,got};pend.cb.lx={k:got.k,n:got.n||0,at:now()};
  G.fx(got.k==="virus"?"wrong":got.k==="hack"?"reveal":"right");if(got.k==="double")G.confetti();
  save(got.k!=="bits");draw()}

/* ---------- hacking ---------- */
function pickView(key){const l=others();
  const k2=key+":"+l.map(p=>p.id+p.s+(p.sh>now()?"s":"")).join(",");if(k2===scrKey)return liveTop();
  put(k2,`<p class="big cbh">💻 ${esc(T("Who do you want to hack?","A qui vols hackejar?"))}</p>
    <div class="cbpick">${l.map(p=>`<button class="cbp" data-cb="target" data-id="${esc(p.id)}"${p.s>0?"":" disabled"}><span class="av">${esc(p.av||"🕵️")}</span><span class="nm">${esc(p.nm||"?")}</span><span class="bt">💾 ${p.s}</span>${p.sh>now()?'<span class="sh">🛡️</span>':""}</button>`).join("")||`<p class="mid">${esc(T("Nobody to hack yet.","Encara no hi ha ningú per hackejar."))}</p>`}</div>
    <p style="text-align:center"><button class="btn ghost" data-cb="next">${esc(T("Skip","Salta"))}</button></p>`)}
function hackPwView(key){const p=(C().pl||{})[st.target]||{};
  put(key,center(`<p class="big">🔓 ${esc(T("Crack the password of","Esbrina la contrasenya de"))} ${esc(p.av||"")} ${esc(p.nm||"")}</p>
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
    :r.blk?`<div class="emo pop">🛡️</div><p class="big">${esc(T("Blocked!","Bloquejat!"))}</p><p class="mid">${esc(p.nm||"")} ${esc(T("has a firewall on.","té el tallafoc actiu."))}</p>`
    :r.ok?`<div class="emo pop">🔓</div><p class="big">${esc(T("Access granted!","Accés concedit!"))}</p><p class="mid">${esc(T("You stole","Has robat"))} <b>${r.n} bits</b> ${esc(T("from","a"))} ${esc(p.av||"")} ${esc(p.nm||"")}</p>`
    :`<div class="emo pop">🔒</div><p class="big">${esc(T("Wrong password","Contrasenya incorrecta"))}</p><p class="mid">“${esc(st.hack.g)}” ${esc(T("was not it.","no era.")) }</p>`;
  put(key,center(h+`<p><button class="btn go" data-cb="next">${esc(T("Next question ▶","Següent pregunta ▶"))}</button></p>`))}
// someone hacked me (or my firewall stopped them): a banner for a few seconds, the game goes on underneath
function hrCheck(){const hr=C().hr||{};
  if(!seenHr){seenHr=new Set(Object.keys(hr));return}
  Object.entries(hr).forEach(([id,h])=>{if(seenHr.has(id))return;seenHr.add(id);if(h.t!==me())return;
    const p=(C().pl||{})[h.f]||{};
    toast(h.ok?`⚠️ ${esc(p.av||"")} <b>${esc(p.nm||"")}</b> ${esc(T("hacked you!","t'ha hackejat!"))} −${h.n} bits`:h.blk?`🛡️ ${esc(T("Your firewall stopped","El teu tallafoc ha aturat"))} ${esc(p.av||"")} <b>${esc(p.nm||"")}</b>`:`🔒 ${esc(p.av||"")} <b>${esc(p.nm||"")}</b> ${esc(T("tried to hack you, but failed","ha intentat hackejar-te, però ha fallat"))}`,h.ok);
    if(h.ok)G.fx("wrong")})}
// The news sits in the top bar, in the space between the pills (13 Nov 2026, 2 ESO A: "El texto no me deja leer": a floating box
// at the top of the screen covered the question every time somebody tried to hack them). It never covers the question or the answers.
function newsH(){return news&&news.until>now()?`<span class="cbnews${news.bad?" bad":""} pop" id="cbnews">${news.h}</span>`:""}
function toast(h,bad){news={h,bad,until:now()+5000};const w=app$.querySelector(".cbtop .cbnewsw");if(w)w.innerHTML=newsH();
  clearTimeout(toastT);toastT=setTimeout(()=>{news=null;const n=document.getElementById("cbnews");if(n)n.remove()},5000)}

function endView(){const [rk,of]=rank(),key="end:"+myBits()+":"+rk+":"+(x().cp??"");if(key===scrKey)return;
  if(!scrKey.startsWith("end")){G.fx("fanfare");if(rk&&rk<=3)G.confetti()}
  const pc=st.n?Math.round(st.r/st.n*100):0;
  put(key,center(`<div class="emo pop">${rk===1?"🏆":rk&&rk<=3?"🥈":"🕵️"}</div><p class="big">${esc(T("Time's up!","S'ha acabat el temps!"))}</p>
    <p class="mid">💾 <b>${myBits()} bits</b> · #${rk} / ${of}</p><p class="mid">✓ ${st.r} / ${st.n} ${esc(T("right","encerts"))} (${pc} %)</p>
    ${typeof x().cp==="number"?G.ring(x().cp,"👥 "+T("The class got right","La classe ha encertat"),"min(24vh,170px)"):""}${ctx.cmWait()}`))}

/* ---------- taps and keys ---------- */
app$.addEventListener("click",e=>{if(!st||x().mode!=="cb")return;const b=e.target.closest("[data-cb]");if(!b||b.disabled)return;const d=b.dataset.cb;
  if(d==="pw"){st.pw=b.dataset.w;pend.cb.pw=st.pw;pend.cb.ws=st.ws;save(true);G.fx("tap");scr="q";draw()}
  else if(d==="repw"){scr="pw";draw()}
  else if(d==="tap"&&scr==="q"){const qu=qOf(st.cur),o=CB.shown(qu,st.seed),k=o[+b.dataset.v];answer(CB.plain(qu.options[k]),k===0)}
  else if(d==="next"){scr="q";st.file=null;draw()}
  else if(d==="file")openFile(+b.dataset.j);
  else if(d==="hack"){scr="hackPick";draw()}
  else if(d==="target"){st.target=b.dataset.id;scr="hackPw";draw()}
  else if(d==="guess")guess(b.dataset.w);
});
app$.addEventListener("submit",e=>{if(!st||x().mode!=="cb"||!e.target.closest(".cbw"))return;e.preventDefault();
  const v=String(e.target.querySelector("input").value||"").replace(/\s+/g," ").trim().slice(0,60);if(!v)return;const qu=qOf(st.cur);answer(v,CB.isRight(qu,v))});
addEventListener("keydown",e=>{if(!st||x().mode!=="cb")return;if(e.key==="Enter"&&scr!=="q"){const b=app$.querySelector('[data-cb="next"].btn.go,[data-cb="hack"]');if(b&&!e.target.closest("input")){e.preventDefault();b.click()}}});
clearInterval(tick);tick=setInterval(()=>{if(st&&x().mode==="cb"&&ctx.active())draw()},1000);
return {draw,flush};
}
