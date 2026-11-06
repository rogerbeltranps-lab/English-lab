// 📝 Your notes on the LS home page (Roger, 6 Nov 2026: "when playing a game, in the slides I explain theory, I want students to have a slide
// with: Take your notes: and then they can see on their LS: your notes"). In a class game, after the theory slides, the board shows a
// "Take your notes" slide and each student types notes on their device (lab/game/play.js), saved in students/{uid}/notes/{deck} =
// {ls, course, deck, title, lp, parts:{p<k>:{topic, text, at}}, updated}. This file fills the place #notes of the LS home
// (<section data-place="notes"> with #notesBox; el-ls-home.js shows it): one card per game, grouped by learning path, each part under the
// theory it is about. Students can change their notes here (saved 1.5 s after they stop typing) and print them. The teacher's student
// view shows the student's notes, read only. Reads: one query (this LS's notes docs) the first time the place opens on the page.
// Catalan for Starter and Base (ELLsHome.ca(), el-ls-home.js). Preview: EL_DEMO_LS.notes = [docs] before el-ls-home.js.
(function(){
  const LS=document.body.dataset.ls,FS="https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
  const $=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const md=s=>esc(s).replace(/\*\*(.+?)\*\*/g,"<b>$1</b>").replace(/~~(.+?)~~/g,"<s>$1</s>");
  const ca=()=>!!(window.ELLsHome&&ELLsHome.ca()),t=(c,e)=>ca()?c:e;
  const D=window.EL_DEMO_LS;
  let docs=null,busy=false,who=null,S=null;   // who: {uid, edit} · S: the Firestore module
  const timers={};

  const kindIcon=d=>/^grammar/i.test(d.title||"")?"🧩":/^vocabulary/i.test(d.title||"")?"📚":"🎮";
  const pnum=k=>+String(k).replace(/\D/g,"")||0;
  const lpKey=d=>{const m=String(d.lp||"").match(/LP\s*(\d+)/);return m?+m[1]:99};

  function draw(){
    const box=$("#notesBox");if(!box)return;
    if(!who){box.innerHTML=`<p class="muted">${t("Entra per veure els teus apunts.","Sign in to see your notes.")}</p>`;return}
    if(who.teacher){box.innerHTML=`<article class="bigcard"><p>Students' notes from the class games appear here, on each student's own LS page. To see one student's notes, open their board with 👁 Student view and come to this page.</p></article>`;return}
    if(!docs){box.innerHTML=`<p class="muted">${t("Carregant…","Loading…")}</p>`;return}
    const list=docs.filter(d=>Object.values(d.parts||{}).some(p=>String(p.text||"").trim())||who.edit&&Object.keys(d.parts||{}).length)
      .sort((a,b)=>lpKey(a)-lpKey(b)||String(a.title).localeCompare(String(b.title)));
    const intro=`<p class="muted nintro">${t("Als jocs de classe, després de la teoria, surt la pantalla <b>📝 Pren apunts</b>: el que hi escrius apareix aquí. Pots canviar-ho quan vulguis.","In the class games, after the theory, you get the <b>📝 Take your notes</b> screen: what you write there appears here. You can change it any time.")}</p>`;
    if(!list.length){box.innerHTML=intro+`<article class="bigcard nempty"><span aria-hidden="true">📝</span><p>${t("Encara no tens apunts d'aquesta LS.","You have no notes for this LS yet.")}</p></article>`;return}
    box.innerHTML=intro+(who.edit?`<p class="nprint"><button type="button" class="nbtn" id="notesPrint">🖨 ${t("Imprimeix els apunts","Print my notes")}</button></p>`:"")
      +list.map(d=>`<article class="bigcard ncard">${d.lp?`<span class="nlp">${esc(d.lp)}</span>`:""}<h2>${kindIcon(d)} ${esc(String(d.title||"").replace(/^(Grammar|Vocabulary) · /,""))}</h2>`
        +Object.keys(d.parts||{}).sort((a,b)=>pnum(a)-pnum(b)).map(k=>{const p=d.parts[k]||{};
          return `<section class="npart"><h3>${md(p.topic||t("Apunts","Notes"))}</h3>`+(who.edit
            ?`<textarea class="ntext" data-d="${esc(d.deck||d.id)}" data-p="${esc(k)}" spellcheck="false" maxlength="3000" aria-label="${esc(p.topic||"Notes")}">${esc(p.text||"")}</textarea><span class="nsv" data-sv="${esc((d.deck||d.id)+"/"+k)}"></span>`
            :`<div class="nread">${esc(p.text||"").replace(/\n/g,"<br>")||"<span class=muted>–</span>"}</div>`)+`</section>`}).join("")+`</article>`).join("");
    box.querySelectorAll("textarea.ntext").forEach(grow);
  }
  const grow=ta=>{ta.style.height="auto";ta.style.height=Math.max(90,ta.scrollHeight+4)+"px"};
  const sv=(key,txt)=>{const e=document.querySelector(`[data-sv="${CSS.escape(key)}"]`);if(e)e.textContent=txt};

  async function save(deck,k,text){
    const key=deck+"/"+k;
    if(D){sv(key,"✓ "+t("Desat","Saved"));return}
    try{sv(key,t("Desant…","Saving…"));
      await S.setDoc(S.doc(ELCloud.db,"students",who.uid,"notes",deck),{parts:{[k]:{text:text.slice(0,3000),at:S.serverTimestamp()}},updated:S.serverTimestamp()},{merge:true});
      const d=docs.find(x=>(x.deck||x.id)===deck);if(d)d.parts[k].text=text;sv(key,"✓ "+t("Desat","Saved"))
    }catch(e){console.warn("notes",e);sv(key,"⚠ "+t("No s'ha desat. Torna-ho a provar.","Not saved. Try again."))}
  }
  document.addEventListener("input",e=>{const ta=e.target.closest&&e.target.closest("textarea.ntext");if(!ta)return;grow(ta);
    const key=ta.dataset.d+"/"+ta.dataset.p;sv(key,"");clearTimeout(timers[key]);timers[key]=setTimeout(()=>save(ta.dataset.d,ta.dataset.p,ta.value),1500)});
  document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest("#notesPrint"))window.print()});

  async function load(){
    if(docs||busy||!who||who.teacher)return draw();
    if(D){docs=(D.notes||[]).map(x=>Object.assign({parts:{}},x));return draw()}
    busy=true;draw();
    try{S=S||await import(FS);const q=await S.getDocs(S.query(S.collection(ELCloud.db,"students",who.uid,"notes"),S.where("ls","==",LS)));
      docs=q.docs.map(x=>Object.assign({id:x.id,parts:{}},x.data()))}catch(e){console.warn("notes",e);docs=[]}
    busy=false;draw();
  }
  const here=()=>location.hash==="#notes";
  document.addEventListener("ellshome",()=>{if(here()||docs)draw()});
  window.addEventListener("hashchange",()=>{if(here())load()});
  function setWho(u){
    const C=window.ELCloud,AS=C&&C.viewing;
    who=!u?null:AS?{uid:AS.uid,edit:false}:C.isTeacher(u)?{teacher:true}:{uid:u.uid,edit:true};
    docs=null;if(here())load();else draw();
  }
  if(D){who=D.role==="teacher"?{teacher:true}:{uid:"demo",edit:D.role!=="as"};if(here())load();else draw();window.addEventListener("load",()=>{if(here())load()});return}
  let tries=0;(function wait(){if(window.ELCloud&&ELCloud.onUser){ELCloud.onUser(setWho);return}if(++tries<300)setTimeout(wait,100)})();
})();
