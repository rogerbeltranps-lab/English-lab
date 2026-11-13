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
      const gt=/^gt-/.test(id)&&nd&&nd.parts&&nd.parts.gt||null;   // 📘 notes taken while the grammar was explained together (el-cloud.js gtBox)
      return {id,gt,title:m.title||(th&&th.title)||(nd&&nd.title)||(res[0]&&res[0].title)||id,kind:m.kind||(gt?"grammar":"")||(res[0]&&res[0].kind)||"",lp:m.lp||(nd&&nd.lp)||(res[0]&&res[0].lp)||"",
        when:Math.max(ms((played||{})[id]),res[0]?res[0].sid:0),parts,notes:(nd&&nd.parts)||{},res:res[0]||null,tries:res.length}
    }).sort((a,b)=>lpNum(a.lp)-lpNum(b.lp)||(a.kind==="vocab"?0:1)-(b.kind==="vocab"?0:1)||a.when-b.when);
  }

  /* 📘 Grammar together (Roger, 13 Nov 2026: "It should appear in their notes with the day, the grammar summary and their notes"): the day,
     the explanation boxes seen together on the projector (as the student saw them) and what the student wrote, read only. The boxes are the
     site's own text, saved by the student's page: only <b> <strong> <em> <i> <br> <del> <s> <u> are kept as tags. */
  const safe=h=>String(h||"").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/&lt;(\/?)(strong|em|b|i|br|del|s|u)\s*\/?&gt;/gi,"<$1$2>");
  const gtDay=d=>{const x=new Date(String(d||"")+"T12:00:00");return isNaN(x)?"":x.toLocaleDateString(ca()?"ca":"en-GB",{weekday:"short",day:"numeric",month:"short"})};
  function gtCard(g,inLp){
    const p=g.gt,txt=String(p.text||"").trim(),when=`<span class="muted nt-day">${t("Gramàtica junts","Grammar together")}${p.day?" · "+esc(gtDay(p.day)):""}</span>`,name=esc(String(g.title).replace(/^📘\s*/,""));
    const body=`<section class="npart">${(p.sum||[]).length?`<div class="nt-th"><h4>📘 ${t("Com funciona","How it works")}</h4>${p.sum.map(b=>`<div class="ex-rule">${safe(b)}</div>`).join("")}</div>`:""}
      <div class="nt-my"><span class="nt-lab">📝 ${t("Els teus apunts","Your notes")}</span>${txt?`<div class="nread">${esc(txt).replace(/\n/g,"<br>")}</div>`:`<p class="muted nt-none">${t("No vas prendre apunts aquí.","You didn't take notes here.")}</p>`}</div></section>`;
    if(inLp)return `<details class="ngame" id="ng-${esc(g.id)}"><summary><span class="ng-t">📘 ${name} ${when}</span></summary>${body}</details>`;
    return `<article class="bigcard ncard"><div class="nt-head"><div>${g.lp?`<span class="nlp">${esc(g.lp)}</span>`:""}<h2>📘 ${name}</h2>${when}</div></div>${body}</article>`;
  }
  function card(g,inLp){
    if(g.gt)return gtCard(g,inLp);
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
    const name=esc(String(g.title).replace(/^(Grammar|Vocabulary) · /,"")),when=g.when?`<span class="muted nt-day">${t("Joc de classe","Class game")} · ${day(g.when)}</span>`:"";
    // inside a learning path of 🎯 What's in the exam: a fold, so the page stays short on a Chromebook (Roger, 9 Nov 2026)
    if(inLp)return `<details class="ngame" id="ng-${esc(g.id)}"><summary><span class="ng-t">${kindIcon(g.kind)} ${name} ${when}</span>${badge}</summary>${study}${parts}</details>`;
    return `<article class="bigcard ncard"><div class="nt-head"><div>${g.lp?`<span class="nlp">${esc(g.lp)}</span>`:""}<h2>${kindIcon(g.kind)} ${name}</h2>
      ${when}</div>${badge}</div>${study}${parts}</article>`;
  }
  // a game shown to the teacher inside a learning path (👁 What each group sees): the theory only
  const tGame=g=>`<details class="ngame"><summary><span class="ng-t">${kindIcon(g.kind)} ${esc(String(g.title).replace(/^(Grammar|Vocabulary) · /,""))} <span class="muted nt-day">${t("Joc de classe","Class game")}${g.when?" · "+day(g.when):""}</span></span></summary>${
    g.parts.map(p=>`<section class="npart">${p.slides.length?`<div class="nt-th">${p.slides.map(slide).join("")}</div>`:`<h3>${md(p.topic)}</h3>`}</section>`).join("")}</details>`;

  // 🎯 What's in the exam (el-exam.js builds it): one card per learning path the group has done something of, in the LS's order:
  // the tabs done in class (with their day), 🔑 key terms, 🧩 grammar and 🎮 its class games; then games of no learning path here.
  const exDay=d=>{try{return ELWeek.date(d,ca()?"ca":"en")}catch(e){return d}};
  function examTop(ex,printBtn){
    const n=ex.exam&&window.ELWeek?ELWeek.days(ELWeek.today(),ex.exam):null;
    const when=ex.exam?`<p class="ex-date">📅 <b>${t("Examen","Exam")}: ${esc(exDay(ex.exam))}</b>${n!=null&&n>=0?` <span class="muted">· ${n===0?t("avui","today"):n===1?t("demà","tomorrow"):t(`d'aquí a ${n} dies`,`in ${n} days`)}</span>`:""}</p>`:"";
    const drop=ex.dropped.length?`<p class="ex-drop">✂️ ${t("No entra a l'examen","Not in your exam")}: ${ex.dropped.map(a=>`<b>LP${esc(a.n)} · ${esc(a.title)}</b>`).join(" · ")}</p>`:"";
    return `<article class="bigcard ex-top">${when}<p>${t("Aquí tens tot el que la teva classe ha fet en aquesta LS: és el que entra a l'examen. Cada vegada que feu alguna cosa nova a classe, apareix aquí. A cada learning path tens les paraules clau, la gramàtica i la teoria dels jocs amb els teus apunts.",
      "Here is everything your class has done in this LS: this is what goes in the exam. Each time you do something new in class, it appears here. Each learning path has its key terms, its grammar and the theory from the class games with your notes.")}</p>${drop}
      <p class="ex-btns">${ex.sample?`<a class="nbtn" href="${esc(ex.sample)}">📝 ${t("Examen de mostra","Sample exam")}</a>`:""}${printBtn?`<button type="button" class="nbtn" id="notesPrint">🖨 ${t("Imprimeix-ho","Print it")}</button>`:""}</p></article>`;
  }
  function lpCard(lp,games,game){
    const lpN=lp.n,tabs=lp.tabs.map(x=>`<span class="ex-tab">✔ ${esc(x.name)}${x.day&&x.day!==true?` <small>${esc(exDay(x.day).replace(/\.$/,""))}</small>`:""}</span>`).join("");
    const nTerms=lp.terms.reduce((n,g)=>n+g.items.length,0);
    const terms=nTerms?`<details class="ex-sec"><summary>🔑 ${t("Paraules clau","Key terms")} <span class="muted">· ${nTerms}</span></summary>${lp.terms.map(g=>`<h4>${g.g}</h4><ul class="ex-terms">${g.items.map(x=>
      `<li><b>${x.en}</b>${x.ca?` <span class="ex-ca">${x.ca}</span>`:""}${x.ex?`<small>${x.ex}</small>`:""}</li>`).join("")}</ul>`).join("")}</details>`:"";
    const gram=lp.grammar.length?`<details class="ex-sec"><summary>🧩 ${t("Gramàtica","Grammar")} <span class="muted">· ${lp.grammar.reduce((n,g)=>n+g.boxes.length,0)}</span></summary>${lp.grammar.map(g=>`<h4>${g.title}</h4>${g.boxes.map(b=>`<div class="ex-rule">${b}</div>`).join("")}`).join("")}</details>`:"";
    const gm=games.length?`<div class="ex-games"><span class="nt-lab">${games.some(g=>g.gt)?(games.every(g=>g.gt)?"📘 ":"🎮 📘 ")+t("Teoria i els teus apunts","Theory and your notes"):"🎮 "+t("Jocs de classe: teoria i els teus apunts","Class games: theory and your notes")}</span>${games.map(game).join("")}</div>`:"";
    const none=!terms&&!gram&&!gm?`<p class="muted">${t("En aquest learning path heu fet pràctica de comprensió i expressió: repassa'l obrint-lo.","In this learning path you practised the skills: open it to look at it again.")}</p>`:"";
    return `<article class="bigcard ncard ex-lp"><div class="nt-head"><div><span class="nlp">LP${esc(lpN)}</span><h2>${esc(lp.title)}</h2></div><a class="nbtn" href="${esc(lp.href)}">${t("Obre","Open")} →</a></div>
      ${tabs?`<div class="ex-tabs"><span class="nt-lab">✅ ${t("Fet a classe","Done in class")}</span>${tabs}</div>`:""}${terms}${gram}${gm}${none}</article>`;
  }
  // games → learning path number (EL_GAMES lp "LP3 · …")
  const lpOf=g=>{const m=String(g.lp||"").match(/LP\s*(\d+)/);return m?m[1]:""};
  function examHtml(ex,games,game,printBtn){
    const used=new Set(),body=ex.lps.map(lp=>{const gs=games.filter(g=>lpOf(g)===String(lp.n));gs.forEach(g=>used.add(g.id));return lpCard(lp,gs,game)}).join("");
    const rest=games.filter(g=>!used.has(g.id)&&!ex.dropped.some(a=>String(a.n)===lpOf(g)));
    if(!body&&!rest.length)return examTop(ex,false)+`<article class="bigcard nempty"><span aria-hidden="true">🎯</span><p>${t("Encara no heu fet res d'aquesta LS a classe. Quan ho feu, apareixerà aquí.","Your class hasn't done anything of this LS yet. When you do, it will appear here.")}</p></article>`;
    return examTop(ex,printBtn)+body+(rest.length?`<article class="bigcard ncard ex-lp"><h2>🎮 ${t("Altres jocs de classe","Other class games")}</h2>${rest.map(game).join("")}</article>`:"");
  }

  // 🎮 Which group played which game (Roger, 8 Nov 2026: "I need to know if the games-theory have been played in a class to make sure they
  // all do them"): the teacher's view of this place is a table, one row per class game of this LS (index.js), one column per group of the
  // course, ✓ + day from ls/{id}.played or "Not yet" with ▶ Play (the board on that game). Same ls doc read as the students' view.
  let tPlayed=null;
  function teacherTable(){
    const ls=(window.EL_LS||[]).find(l=>l.id===LS)||{},nm=String(ls.title||"").replace(/^[^·]*·\s*/,"").trim().toLowerCase();
    const games=(window.EL_GAMES||[]).filter(g=>g.course===ls.course&&String(g.ls||"").replace(/^[^·]*·\s*/,"").trim().toLowerCase()===nm)
      .sort((a,b)=>lpNum(a.lp)-lpNum(b.lp)||(a.kind==="vocab"?0:1)-(b.kind==="vocab"?0:1));
    const groups=(window.EL_GROUPS||[]).filter(g=>g.course===ls.course);
    if(!games.length||!groups.length)return "";
    if(!tPlayed)return `<article class="bigcard"><h2>🎮 Class games played</h2><p class="muted">Loading…</p></article>`;
    const back=encodeURIComponent(location.pathname);
    const missing=groups.map(g=>({g,n:games.filter(d=>!(tPlayed[g.id]||{})[d.id]).length}));
    const rows=games.map(d=>`<tr><td><span class="nlp">${esc(String(d.lp||"").replace(/\s*·.*/,""))}</span></td><td>${kindIcon(d.kind)} ${esc(String(d.title).replace(/^(Grammar|Vocabulary) · /,""))}</td>`
      +groups.map(g=>{const w=(tPlayed[g.id]||{})[d.id];return w?`<td class="tp-yes">✓ ${esc(day(w))}</td>`:`<td class="tp-no">Not yet</td>`}).join("")
      +`<td><a class="nbtn tp-play" href="../../lab/game/host.html?deck=${encodeURIComponent(d.id)}&from=${back}">▶ Play</a></td></tr>`).join("");
    return `<article class="bigcard tp"><h2>🎮 Class games played</h2><p class="muted">Every class game of this LS and the groups that played it (the board saves it on the first 📝 notes slide or at the end). ${
      missing.map(x=>`<b>${esc(x.g.name)}</b>: ${x.n?`${x.n} not played yet`:"all played ✓"}`).join(" · ")}</p>
      <div class="tp-wrap"><table class="nt-t tp-t"><thead><tr><th>Path</th><th>Game</th>${groups.map(g=>`<th>${esc(g.name)}</th>`).join("")}<th></th></tr></thead><tbody>${rows}</tbody></table></div></article>`;
  }

  // 👁 What each group sees (teacher): pick a group and a route, and see their 🎯 What's in the exam with the games' theory (no notes),
  // to check that the exam asks only what the group has done (Roger, 9 Nov 2026)
  let tInfo=null,tSel={gid:null,level:"safe"},tEx=null;
  function teacherPreview(){
    const ls=(window.EL_LS||[]).find(l=>l.id===LS)||{},groups=(window.EL_GROUPS||[]).filter(g=>g.course===ls.course);
    if(!window.ELExam||!groups.length)return "";
    const lv=(window.EL_LEVELS||[]).filter(x=>x.id!=="native"||ls.course==="4eso");
    const btn=(on,attr,txt)=>`<button type="button" class="nbtn${on?" on":""}" ${attr}>${esc(txt)}</button>`;
    let body="";
    if(tSel.gid&&tEx)body=examHtml(tEx,tGames(),tGame,false);
    else if(tSel.gid)body=`<p class="muted">Loading…</p>`;
    return `<article class="bigcard ex-pick"><h2>👁 What each group sees in 🎯 What's in the exam</h2><p class="muted">Only the tabs ticked on the Time plan (or on a class day already past) and the class games the group played, at the student's route. Use it to check that the exam asks only this.</p>
      <p class="ex-btns">${groups.map(g=>btn(g.id===tSel.gid,`data-exg="${esc(g.id)}"`,g.name)).join("")}</p>
      ${tSel.gid?`<p class="ex-btns">${lv.map(x=>btn(x.id===tSel.level,`data-exl="${esc(x.id)}"`,x.student||x.name)).join("")}</p>`:""}</article>${body}`;
  }
  const tGames=()=>build(((tInfo&&tInfo.played)||{})[tSel.gid]||{},[],{});
  async function tBuild(){
    if(!tSel.gid||!tInfo||!window.ELExam)return;
    tEx=null;draw();const k=tSel.gid+"|"+tSel.level;
    const r=await ELExam.build({LS,gid:tSel.gid,done:(tInfo.done||{})[tSel.gid]||{},level:tSel.level,ca:false,played:lpPlayed(tGames())});
    if(k===tSel.gid+"|"+tSel.level){tEx=r;draw()}
  }
  document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-exg],[data-exl]");if(!b)return;
    if(b.dataset.exg)tSel.gid=b.dataset.exg;else tSel.level=b.dataset.exl;tBuild()});
  const lpPlayed=games=>{const o={};games.forEach(g=>{const m=String(g.lp||"").match(/LP\s*(\d+)/);if(m)o[m[1]]=true});return o};

  function draw(){
    const box=$("#notesBox");if(!box)return;
    if(!who){box.innerHTML=`<p class="muted">${t("Entra per veure els teus apunts.","Sign in to see your notes.")}</p>`;return}
    if(who.teacher){box.innerHTML=teacherTable()+teacherPreview()+`<article class="bigcard"><p>Each student sees here what their group has done in this LS, learning path by learning path: the tabs done in class, the key terms and grammar of those tabs at their route, and every class game their group played with a copy of the theory, their own notes below it (read only), their result and what to study. Students who missed a game get its theory without notes. You see every student's answers, marks and notes together on the <a href="../../lab/game/results.html">📊 game results</a> page (click a student), or this page as they see it with 👁 Student view.</p></article>`;return}
    if(!data||(!data.ex&&exCtx&&window.ELExam)){box.innerHTML=`<p class="muted">${t("Carregant…","Loading…")}</p>`;return}
    if(data.ex&&window.ELNotebook){ELNotebook.draw(box,data.ex,data.games,{t,esc,md,slide,day,exDay,gtDay,safe,lpOf,LS,ca:ca(),own:!!who.own,uid:who.uid||'',rs:data.rs||{},nb:data.nb||(data.nb={parts:{}}),save:nbSave,saveGt:gtSave,saveGn:gnSave});return}   // 📓 My notebook (el-notebook.js)
    if(data.ex){box.innerHTML=examHtml(data.ex,data.games,g=>card(g,true),true);return}
    const intro=`<p class="muted nintro">${t("Aquí tens cada joc de classe d'aquesta LS: la teoria, els teus apunts de <b>📝 Pren apunts</b> a sota, el teu resultat i què has d'estudiar.","Here is every class game of this LS: the theory, your notes from <b>📝 Take your notes</b> below it, your result and what to study.")}</p>`;
    if(!data.games.length){box.innerHTML=intro+`<article class="bigcard nempty"><span aria-hidden="true">📝</span><p>${t("Encara no heu fet cap joc de classe en aquesta LS.","Your class hasn't played any class game in this LS yet.")}</p></article>`;return}
    box.innerHTML=intro+`<p class="nprint"><button type="button" class="nbtn" id="notesPrint">🖨 ${t("Imprimeix-ho","Print it")}</button></p>`+data.games.map(card).join("");
  }
  // print with every fold open
  window.addEventListener("beforeprint",()=>document.querySelectorAll("#notesBox details").forEach(d=>{if(!d.open){d.open=true;d.dataset.pr="1"}}));
  window.addEventListener("afterprint",()=>document.querySelectorAll('#notesBox details[data-pr]').forEach(d=>{d.open=false;delete d.dataset.pr}));
  document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest("#notesPrint"))window.print()});
  // 🎯 What to study links jump to that theory part here (Roger, 7 Nov 2026: "this link doesn't take you to the slide"): a plain #nt-… link
  // changed the hash, so the LS page left the #notes place for its home. Scroll instead, keep #notes, and light the part up for a moment.
  document.addEventListener("click",e=>{const a=e.target.closest&&e.target.closest('a[href^="#nt-"]');if(!a)return;e.preventDefault();
    const el=document.getElementById(a.getAttribute("href").slice(1));if(!el)return;
    for(let d=el.closest("details");d;d=d.parentElement&&d.parentElement.closest("details"))d.open=true;
    el.scrollIntoView({behavior:"smooth",block:"start"});el.classList.remove("nt-hit");void el.offsetWidth;el.classList.add("nt-hit");
    setTimeout(()=>el.classList.remove("nt-hit"),2200)});

  async function load(){
    if(who&&who.teacher){if(tPlayed||busy)return draw();
      if(D){tPlayed=D.playedAll||{};tInfo=D.info||{played:tPlayed};return draw()}
      busy=true;draw();try{const i=await window.ELCloud.lsInfo(LS);tInfo=i||{};tPlayed=(i&&i.played)||{}}catch(e){console.warn("played",e);tPlayed={};tInfo={}}busy=false;return draw()}
    if(data||busy||!who)return draw();
    if(D){data={games:build(D.played||{},(D.notes||[]).map(x=>Object.assign({parts:{}},x)),D.myGames||{}),nb:D.nb||null,rs:D.rs||{}};exCtx={gid:D.group,done:((D.info||{}).done||{})[D.group]||{},level:D.level};return exBuild()}
    busy=true;draw();
    const C=window.ELCloud;let played={},notes=[],mine={},info={},lvs={},nb=null,rs={};
    try{S=S||await import(FS);
      let q,g,rr;[info,q,g,lvs,rr]=await Promise.all([(C.lsNow||C.lsInfo)(LS).catch(()=>({})),
        S.getDocs(S.query(S.collection(C.db,"students",who.uid,"notes"),S.where("ls","==",LS))).catch(e=>{console.warn("notes",e);return null}),
        who.email&&!mg?S.getDoc(S.doc(C.db,"myGames",who.email)).catch(e=>{console.warn("my games",e);return null}):null,
        window.ELExam&&C.levels?C.levels().catch(()=>({})):{},
        // 📝 Exams in the notebook: the exam report and the final product feedback (the student's results, kept on the device by el-cloud.js)
        window.ELNotebook&&C.results?C.results().catch(()=>({})):{}]);
      Object.values(rr||{}).forEach(r=>{if(r&&r.activity)rs[r.activity]=r});
      played=((info&&info.played)||{})[who.group||C.group()]||{};
      if(q)notes=q.docs.map(x=>Object.assign({id:x.id,parts:{}},x.data()));
      nb=notes.find(n=>n.id==="nb-"+LS)||null;notes=notes.filter(n=>!/^nb-/.test(n.id));   // 📓 the notebook's own sections and order
      if(mg)mine=mg;else if(g&&g.exists())mine=mg=g.data().games||{};
    }catch(e){console.warn("notes",e)}
    data={games:build(played,notes,mine),nb,rs};busy=false;
    const gid=who.group||C.group();exCtx={gid,done:((info&&info.done)||{})[gid]||{},level:window.elRouteOf?elRouteOf(lvs||{},LS).level:null};
    exBuild();
  }
  // 📓 the student's own notebook sections and their order: students/{uid}/notes/nb-<LS> = {ls, course, deck, title, lp, parts:{o:{list},
  // s…:{topic, html, text, dr, day}}, updated} (the notes rule: their own, parts ≤ 20). Written whole, so a deleted section goes.
  async function nbSave(parts){
    if(!who||!who.own||D)return;const C=window.ELCloud;S=S||await import(FS);
    const ls=(window.EL_LS||[]).find(l=>l.id===LS)||{};
    await S.setDoc(S.doc(C.db,"students",who.uid,"notes","nb-"+LS),{ls:LS,course:ls.course||"",deck:"nb-"+LS,title:"📓 My notebook",lp:"",parts,updated:S.serverTimestamp()});
  }
  // ✏️ the notes a student took on the whiteboard, edited in the notebook: back into their own doc (notes/gt-…, parts.gt)
  async function gtSave(id,gt){
    if(!who||!who.own||D||!/^gt-/.test(id))return;const C=window.ELCloud;S=S||await import(FS);
    await S.setDoc(S.doc(C.db,"students",who.uid,"notes",id),{parts:{gt},updated:S.serverTimestamp()},{merge:true});
  }
  // ✏️ the notes a student took in a class game, edited in the notebook: back into that game's doc (notes/<deck>, parts.<k>, merged)
  async function gnSave(id,k,p){
    if(!who||!who.own||D||/^(nb|gt)-/.test(id)||!k)return;const C=window.ELCloud;S=S||await import(FS);
    await S.setDoc(S.doc(C.db,"students",who.uid,"notes",id),{parts:{[k]:p},updated:S.serverTimestamp()},{merge:true});
  }
  // 🎯 What's in the exam for the student (el-exam.js), again when the language is known (Catalan for Starter and Base)
  let exCtx=null,exSeq=0;
  async function exBuild(){
    if(!window.ELExam||!exCtx||!data){draw();return}
    const k=++exSeq;draw();
    try{const ex=await ELExam.build({LS,gid:exCtx.gid,done:exCtx.done,level:exCtx.level,ca:ca(),played:lpPlayed(data.games)});if(k===exSeq&&data){data.ex=ex;draw()}}
    catch(e){console.warn("exam",e);if(k===exSeq){exCtx=null;draw()}}
  }
  // 🧩 📚 Games and theory card on the LS home, the board's card (Roger, 7 Nov 2026: "instead of this", the slim 📝 tile): the % right in this
  // LS's grammar and vocabulary class games (elRing, el-catalog.js), Open → and 📝 Your notes, all opening #notes. One read of
  // myGames/{email} per page (kept for #notes too); circles show "–" until there is a result, and for the teacher.
  let mg=null,mgBusy=false;
  function homeCard(){
    const a=document.querySelector('a.tile.nt[href="#notes"]');if(!a||!window.elRing)return;
    const g=Object.values(mg||{}).filter(x=>x&&x.ls===LS),st=window.elGameStats?elGameStats(g):{},tip=k=>window.elGameTip&&g.length?elGameTip(g,k,ca()):"";
    a.classList.add("gm");
    const nb=!!window.ELNotebook;   // 📓 LS2 on: the student's notebook
    a.innerHTML=`<span class="gm-h"><span><b>${nb?"📓 "+t("La meva llibreta","My notebook"):"🎯 "+t("Què entra a l'examen","What's in the exam")}</b><small>${nb?t("Índex, teoria, vocabulari i els teus apunts: el que entra a l'examen","Index, theory, vocabulary and your notes: what's in the exam"):t("El que hem fet, paraules clau, teoria i els teus apunts","What we've done, key terms, theory and your notes")}</small></span><span class="gm-open">${t("Obre","Open")} →</span></span>`
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
  document.addEventListener("ellshome",()=>{if(data&&exCtx)exBuild();else if(here()||data)draw()});
  window.addEventListener("hashchange",()=>{if(here())load()});
  function setWho(u){
    const C=window.ELCloud,AS=C&&C.viewing;
    who=!u?null:AS?{uid:AS.uid,email:(AS.email||"").toLowerCase(),group:AS.group}:C.isTeacher(u)?{teacher:true}:{uid:u.uid,email:(u.email||"").toLowerCase(),own:true};
    data=null;mg=null;tPlayed=null;tInfo=null;tEx=null;exCtx=null;if(here())load();else draw();loadMg();
  }
  if(D){who=D.role==="teacher"?{teacher:true}:{uid:"demo",own:D.role!=="as"};mg=D.myGames||null;homeCard();if(here())load();else draw();window.addEventListener("load",()=>{if(here())load()});return}
  homeCard();
  let tries=0;(function wait(){if(window.ELCloud&&ELCloud.onUser){ELCloud.onUser(setWho);return}if(++tries<300)setTimeout(wait,100)})();
})();
