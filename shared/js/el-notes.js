// 📝 Your notes on the LS home page: the class games of this LS, each with its theory, the student's notes and result (Roger, 6 Nov 2026):
//  - "in the slides I explain theory, I want students to have a slide with: Take your notes: and then they can see on their LS: your notes";
//  - "they can't edit, they only can see them after they do them in the formative games" (read only, printable);
//  - "they get a copy of the slides and below their notes … If a student doesn't come and doesn't do the game, the system detects it and
//    saves the theory in their notes but without their notes";
//  - "I want students to see their results in the games and suggestions of what to study".
// Sources, all read once when the place #notes opens (el-ls-home.js shows <section data-place="notes"> with #notesBox):
//  - the games their group played: ls/{id}.played[group][deck] (written by the board, lab/game/host.js; ls doc already read by el-cloud.js);
//  - the theory: window.EL_GAME_THEORY (lab/game/decks/theory.js, built by tools/game-theory/build.mjs: theory slides only, no answers);
//  - their notes: students/{uid}/notes where ls == this LS (one query; lab/game/play.js writes them);
//  - their results: myGames/{email} (one read; the board writes it at the end of each game): right / shown and each mistake with their
//    answer, the right answer and the theory part it practises, so "🎯 What to study" points at that part.
//    Games played before the board saved each answer (before 6 Nov 2026, copied later from gameResults) have no a: only the right answer shows.
// Catalan for Starter and Base (ELLsHome.ca()). The teacher's student view shows the student's page. Preview: EL_DEMO_LS.notes, .myGames,
// .played before el-ls-home.js.
(function(){
  const LS=document.body.dataset.ls,FS="https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
  const $=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const md=s=>esc(s).replace(/\*\*(.+?)\*\*/g,"<b>$1</b>").replace(/~~(.+?)~~/g,"<s>$1</s>").replace(/_{3,}/g,"____");
  const ca=()=>!!(window.ELLsHome&&ELLsHome.ca()),t=(c,e)=>ca()?c:e;
  const D=window.EL_DEMO_LS;
  let data=null,busy=false,who=null,S=null;   // who: {uid, email, own} or {teacher} · data: {games:[…]}

  const meta=id=>(window.EL_GAMES||[]).find(g=>g.id===id)||{};
  const lpNum=lp=>{const m=String(lp||"").match(/LP\s*(\d+)/);return m?+m[1]:99};
  const kindIcon=k=>k==="grammar"?"🧩":k==="vocab"?"📚":"🎮";
  const ms=v=>v&&v.toMillis?v.toMillis():+v||0;
  const day=v=>{const d=new Date(ms(v));return ms(v)?d.toLocaleDateString(ca()?"ca":"en-GB",{weekday:"short",day:"numeric",month:"short"}):""};
  const block=l=>{
    if(l&&l.table){const [h,...r]=l.table;return `<table class="nt-t"><thead><tr>${h.map(c=>`<th>${md(c)}</th>`).join("")}</tr></thead><tbody>${r.map(x=>`<tr>${x.map(c=>`<td>${md(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`}
    if(l&&l.watch)return `<p class="nt-w">⚠️ ${md(l.watch)}</p>`;
    return `<p>${md(l)}</p>`};
  const slide=s=>`<div class="nt-s"><h4>${s.img&&!/\./.test(s.img)?esc(s.img)+" ":""}${md(s.theory)}</h4>${(s.lines||[]).map(block).join("")}${ca()&&s.ca?`<div class="nt-ca">${s.ca.map(l=>`<p>${md(l)}</p>`).join("")}</div>`:""}</div>`;

  // one card per game: every game the group played, plus any game with notes or a result (a tester, another group's game)
  function build(played,notes,mine){
    const ids=new Set([...Object.keys(played||{}),...notes.map(n=>n.deck||n.id),...Object.values(mine||{}).filter(g=>!g.ls||g.ls===LS).map(g=>g.deck)]);
    return [...ids].map(id=>{
      const m=meta(id),th=(window.EL_GAME_THEORY||{})[id],nd=notes.find(n=>(n.deck||n.id)===id),res=Object.values(mine||{}).filter(g=>g.deck===id).sort((a,b)=>b.sid-a.sid);
      const parts=th?th.parts.map(p=>({k:p.k,slides:p.slides,topic:p.slides.map(s=>s.theory).join(" · ")})):Object.keys((nd&&nd.parts)||{}).map(k=>({k,slides:[],topic:nd.parts[k].topic||""}));
      return {id,title:m.title||(th&&th.title)||(nd&&nd.title)||(res[0]&&res[0].title)||id,kind:m.kind||(res[0]&&res[0].kind)||"",lp:m.lp||(nd&&nd.lp)||(res[0]&&res[0].lp)||"",
        when:Math.max(ms((played||{})[id]),res[0]?res[0].sid:0),parts,notes:(nd&&nd.parts)||{},res:res[0]||null,tries:res.length}
    }).sort((a,b)=>lpNum(a.lp)-lpNum(b.lp)||(a.kind==="vocab"?0:1)-(b.kind==="vocab"?0:1)||a.when-b.when);
  }

  function card(g){
    const r=g.res,hasNotes=Object.values(g.notes).some(p=>String(p.text||"").trim()),absent=!r&&!hasNotes;
    const pc=r&&r.of?Math.round(r.r/r.of*100):null,miss=(r&&r.miss)||[];
    const byPart={};miss.forEach(x=>{(byPart[x.p||""]=byPart[x.p||""]||[]).push(x)});
    const badge=r?`<span class="nt-score${pc<50?" low":pc>=80?" good":""}">${r.r} / ${r.of} · ${pc} %</span>`:absent?`<span class="nt-score away">${t("No hi eres","You weren't there")}</span>`:"";
    // 🎯 What to study: the theory parts with mistakes first, then the questions to look at again
    let study="";
    if(absent)study=`<div class="nt-study away"><b>🎯 ${t("Què has d'estudiar","What to study")}</b><p>${t("No vas fer aquest joc. Llegeix la teoria de sota i pren els teus apunts en paper. Si tens dubtes, pregunta al professor.","You missed this game. Read the theory below and take your own notes on paper. If anything is not clear, ask your teacher.")}</p></div>`;
    else if(r&&!miss.length)study=`<div class="nt-study good"><b>🎯 ${t("Què has d'estudiar","What to study")}</b><p>${t("Ho tens tot bé! Repassa els teus apunts abans de l'examen.","All right! Read your notes again before the exam.")}</p></div>`;
    else if(r){const ps=Object.entries(byPart).sort((a,b)=>b[1].length-a[1].length);
      study=`<div class="nt-study"><b>🎯 ${t("Què has d'estudiar","What to study")}</b>${pc<50?`<p>${t("Llegeix tota la teoria de sota amb calma i torna a mirar les preguntes.","Read all the theory below slowly and look at the questions again.")}</p>`:""}<ul>${ps.map(([k,l])=>{const p=g.parts.find(x=>x.k===k);
        return `<li>${p?`<a href="#nt-${esc(g.id)}-${esc(k)}">${md(p.topic)}</a>`:t("Altres preguntes","Other questions")} <span class="muted">· ${l.length} ${l.length===1?t("errada","mistake"):t("errades","mistakes")}</span></li>`}).join("")}</ul>
        <details><summary>${t("Les preguntes que has de revisar","The questions to look at again")} (${miss.length})</summary><ol class="nt-miss">${miss.map(x=>`<li>${md(x.q)}<br>${x.a==null?"":`<span class="no">✗ ${x.a?esc(x.a):t("sense resposta","no answer")}</span> → `}<span class="ok">✓ ${esc(x.ok)}</span></li>`).join("")}</ol></details></div>`}
    const parts=g.parts.map(p=>{const n=g.notes[p.k],txt=n&&String(n.text||"").trim(),bad=(byPart[p.k]||[]).length;
      return `<section class="npart" id="nt-${esc(g.id)}-${esc(p.k)}">${bad?`<span class="nt-flag">🎯 ${bad} ${bad===1?t("errada","mistake"):t("errades","mistakes")} ${t("sobre això","on this")}</span>`:""}
        ${p.slides.length?`<div class="nt-th">${p.slides.map(slide).join("")}</div>`:`<h3>${md(p.topic)}</h3>`}
        <div class="nt-my"><span class="nt-lab">📝 ${t("Els teus apunts","Your notes")}</span>${txt?`<div class="nread">${esc(txt).replace(/\n/g,"<br>")}</div>`
          :`<p class="muted nt-none">${absent?t("No hi ha apunts: no vas fer aquest joc.","No notes: you weren't in this game."):t("No vas prendre apunts aquí.","You didn't take notes here.")}</p>`}</div></section>`}).join("");
    return `<article class="bigcard ncard"><div class="nt-head"><div>${g.lp?`<span class="nlp">${esc(g.lp)}</span>`:""}<h2>${kindIcon(g.kind)} ${esc(String(g.title).replace(/^(Grammar|Vocabulary) · /,""))}</h2>
      ${g.when?`<span class="muted nt-day">${t("Joc de classe","Class game")} · ${day(g.when)}</span>`:""}</div>${badge}</div>${study}${parts}</article>`;
  }

  function draw(){
    const box=$("#notesBox");if(!box)return;
    if(!who){box.innerHTML=`<p class="muted">${t("Entra per veure els teus apunts.","Sign in to see your notes.")}</p>`;return}
    if(who.teacher){box.innerHTML=`<article class="bigcard"><p>Each student sees here every class game of this LS that their group played: a copy of the theory, their own notes below it (read only), their result and what to study. Students who missed a game get its theory without notes. You see every student's answers, marks and notes together on the <a href="../../lab/game/results.html">📊 game results</a> page (click a student), or this page as they see it with 👁 Student view.</p></article>`;return}
    if(!data){box.innerHTML=`<p class="muted">${t("Carregant…","Loading…")}</p>`;return}
    const intro=`<p class="muted nintro">${t("Aquí tens cada joc de classe d'aquesta LS: la teoria, els teus apunts de <b>📝 Pren apunts</b> a sota, el teu resultat i què has d'estudiar.","Here is every class game of this LS: the theory, your notes from <b>📝 Take your notes</b> below it, your result and what to study.")}</p>`;
    if(!data.games.length){box.innerHTML=intro+`<article class="bigcard nempty"><span aria-hidden="true">📝</span><p>${t("Encara no heu fet cap joc de classe en aquesta LS.","Your class hasn't played any class game in this LS yet.")}</p></article>`;return}
    box.innerHTML=intro+`<p class="nprint"><button type="button" class="nbtn" id="notesPrint">🖨 ${t("Imprimeix-ho","Print it")}</button></p>`+data.games.map(card).join("");
  }
  document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest("#notesPrint"))window.print()});
  // 🎯 What to study links jump to that theory part here (Roger, 7 Nov 2026: "this link doesn't take you to the slide"): a plain #nt-… link
  // changed the hash, so the LS page left the #notes place for its home. Scroll instead, keep #notes, and light the part up for a moment.
  document.addEventListener("click",e=>{const a=e.target.closest&&e.target.closest('a[href^="#nt-"]');if(!a)return;e.preventDefault();
    const el=document.getElementById(a.getAttribute("href").slice(1));if(!el)return;
    el.scrollIntoView({behavior:"smooth",block:"start"});el.classList.remove("nt-hit");void el.offsetWidth;el.classList.add("nt-hit");
    setTimeout(()=>el.classList.remove("nt-hit"),2200)});

  async function load(){
    if(data||busy||!who||who.teacher)return draw();
    if(D){data={games:build(D.played||{},(D.notes||[]).map(x=>Object.assign({parts:{}},x)),D.myGames||{})};return draw()}
    busy=true;draw();
    const C=window.ELCloud;let played={},notes=[],mine={};
    try{S=S||await import(FS);
      const [info,q,g]=await Promise.all([(C.lsNow||C.lsInfo)(LS).catch(()=>({})),
        S.getDocs(S.query(S.collection(C.db,"students",who.uid,"notes"),S.where("ls","==",LS))).catch(e=>{console.warn("notes",e);return null}),
        who.email&&!mg?S.getDoc(S.doc(C.db,"myGames",who.email)).catch(e=>{console.warn("my games",e);return null}):null]);
      played=((info&&info.played)||{})[who.group||C.group()]||{};
      if(q)notes=q.docs.map(x=>Object.assign({id:x.id,parts:{}},x.data()));
      if(mg)mine=mg;else if(g&&g.exists())mine=mg=g.data().games||{};
    }catch(e){console.warn("notes",e)}
    data={games:build(played,notes,mine)};busy=false;draw();
  }
  // 🧩 📚 Games and theory card on the LS home, the board's card (Roger, 7 Nov 2026: "instead of this", the slim 📝 tile): the % right in this
  // LS's grammar and vocabulary class games (elRing, el-catalog.js), Open → and 📝 Your notes, all opening #notes. One read of
  // myGames/{email} per page (kept for #notes too); circles show "–" until there is a result, and for the teacher.
  let mg=null,mgBusy=false;
  function homeCard(){
    const a=document.querySelector('a.tile.nt[href="#notes"]');if(!a||!window.elRing)return;
    const g=Object.values(mg||{}).filter(x=>x&&x.ls===LS),st=window.elGameStats?elGameStats(g):{},tip=k=>window.elGameTip&&g.length?elGameTip(g,k,ca()):"";
    a.classList.add("gm");
    a.innerHTML=`<span class="gm-h"><span><b>${t("Jocs i teoria","Games and theory")}</b><small>${t("Mira els teus resultats i què has d'estudiar","See your results and what to study")}</small></span><span class="gm-open">${t("Obre","Open")} →</span></span>`
      +`<span class="gm-row"><span class="gm-rings">${elRing(st.grammar??null,"🧩 "+t("Gramàtica","Grammar"),42,tip("grammar"))}${elRing(st.vocab??null,"📚 "+t("Vocabulari","Vocabulary"),42,tip("vocab"))}</span>`
      +`<span class="gm-note"><i aria-hidden="true">📝</i>${t("Els teus apunts","Your notes")}</span></span>`;
  }
  async function loadMg(){
    if(mg||mgBusy||!who||who.teacher||!who.email)return homeCard();
    if(D){mg=D.myGames||{};return homeCard()}
    mgBusy=true;homeCard();
    try{S=S||await import(FS);const g=await S.getDoc(S.doc(window.ELCloud.db,"myGames",who.email));mg=g.exists()?g.data().games||{}:{}}catch(e){console.warn("my games",e);mg={}}
    mgBusy=false;homeCard();
  }
  document.addEventListener("ellshome",homeCard);
  const here=()=>location.hash==="#notes";
  document.addEventListener("ellshome",()=>{if(here()||data)draw()});
  window.addEventListener("hashchange",()=>{if(here())load()});
  function setWho(u){
    const C=window.ELCloud,AS=C&&C.viewing;
    who=!u?null:AS?{uid:AS.uid,email:(AS.email||"").toLowerCase(),group:AS.group}:C.isTeacher(u)?{teacher:true}:{uid:u.uid,email:(u.email||"").toLowerCase(),own:true};
    data=null;mg=null;if(here())load();else draw();loadMg();
  }
  if(D){who=D.role==="teacher"?{teacher:true}:{uid:"demo",own:D.role!=="as"};mg=D.myGames||null;homeCard();if(here())load();else draw();window.addEventListener("load",()=>{if(here())load()});return}
  homeCard();
  let tries=0;(function wait(){if(window.ELCloud&&ELCloud.onUser){ELCloud.onUser(setWho);return}if(++tries<300)setTimeout(wait,100)})();
})();
