// LS home page (LS2 on) in the board's style (Roger, 6 Nov 2026: "Redesign the LS so that they fit the new students and teacher design
// and students go from the dashboard to the ls and the ls to the dashboard"). shared/css/ls-home.css draws it.
// The page holds the content (head, learning paths as <ol class="lps"> of <a class="lp" data-a="activity id">, tiles and the places
// <section data-place="study|about|final">); this file adds:
// - the side menu of the board (today.html): My dashboard (the teacher: Dashboard), this LS, All Learning Situations, Games,
//   Practise, Help; on a phone the board's bottom bar; a ‹ back link at the top to the board or the dashboard;
// - places by hash (#study, #about, #final, #notes: el-notes.js fills it) with a ‹ back link to the LS home, as the board's places;
// - the Continue card (the first open learning path not done, in the order of the group's time plan, or the checkpoint it needs first)
//   and each learning path's progress (✓ done, steps done; students see only the ones they can open), from the progress el-cloud.js already copied
//   into this browser, the LS document it already read (ELCloud.lsNow) and the results it already read: no new Firestore reads;
// - Catalan for Starter and Base (data-ca on the static labels), English for Core, Plus, Pro, the teacher and testers.
// Preview: window.EL_DEMO_LS = {role:"student"|"teacher", group, level, info:{status, open:{group:[ids]}}, pg:{key:json}, rs:{}} before this file.
(function(){
  const LS=document.body.dataset.ls,ROOT=new URL("../../",location.href).href,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const ls=(window.EL_LS||[]).find(l=>l.id===LS)||{id:LS,course:LS.split("-")[0],title:document.title};
  const COURSE=ls.course,CN={"2eso":"2 ESO","4eso":"4 ESO"},lsName=l=>window.elLsName?elLsName(l):l.title.replace(/^\S+ · /,"");
  const lsHref=l=>ROOT+l.course+"/"+l.id.slice(l.course.length+1)+"/index.html";
  let CA=false;const t=(ca,en)=>CA?ca:en;
  let who={role:"none"};   // none (not known yet) · student · teacher · tester (sees everything) · as (the teacher's student view)

  // ---- static labels: data-ca holds the Catalan text; the English one is kept on first use
  function lang(){
    document.documentElement.lang=CA?"ca":"en";
    $$("[data-ca]").forEach(e=>{if(e.dataset.en==null)e.dataset.en=e.innerHTML;e.innerHTML=CA?e.dataset.ca:e.dataset.en});
    $$("[data-ca-title]").forEach(e=>{if(e.dataset.enTitle==null)e.dataset.enTitle=e.getAttribute("aria-label")||"";e.setAttribute("aria-label",CA?e.dataset.caTitle:e.dataset.enTitle)});
  }

  // ---- menus
  const boardHref=()=>who.role==="as"&&who.uid?ROOT+"today.html?student="+encodeURIComponent(who.uid):ROOT+"today.html";
  const dashHref=()=>ROOT+"teacher.html?course="+COURSE+"&ls="+encodeURIComponent(LS);
  const teach=()=>who.role==="teacher";
  function nav(){
    // every item is a button with an icon (Roger, 6 Nov 2026: "these things should look like buttons"; shared/css/el-app.css): "🏠 My dashboard" → icon + label
    // an LS item ("LS2 · Free Time, Live!") shows its number in the icon box instead of 📚 (Roger, 7 Nov 2026: "instead of the book emoji")
    const a=(h,txt,cls,cur)=>{const m=String(txt).match(/^(\p{Extended_Pictographic}\uFE0F?)\s*(.*)$/u)||String(txt).match(/^(LS\d+) · (.*)$/),ic={"English Lab":"🧪",Practise:"🎯",Practica:"🎯"}[txt]||(m?m[1]:"🗂");
      return `<a class="nv${cls?" "+cls:""}" href="${h}"${cur?' aria-current="page"':""}><span class="ic${/^LS\d/.test(ic)?" lsn":""}" aria-hidden="true">${ic}</span><span class="lb">${m?m[2]:txt}</span></a>`};
    let html;
    if(teach()||who.role==="tester"){
      const first=teach()?a(dashHref(),"📊 Dashboard"):a(boardHref(),"🏠 My dashboard");
      html=first+`<div class="nvsep"></div>`+["2eso","4eso"].map(c=>`<div class="nvh">${CN[c]}</div>`+a(ROOT+c+"/index.html",CN[c]+" · Learning Situations","sub")
        +(window.EL_LS||[]).filter(l=>l.course===c).map((l,i)=>a(lsHref(l),esc(lsName(l)),"sub"+(l.id===LS?" on":""),l.id===LS)).join("")).join("")
        +`<div class="nvsep"></div>`+a(ROOT+"lab/","🎲 "+t("Jocs","Games"))+a(ROOT+"lab/practice.html",t("Practica","Practise"));
    }else{
      // the students' menu, the same on every page: elStudentMenu (el-catalog.js; Roger, 7 Nov 2026: "this should always be the same")
      let g=null;try{g=(window.ELCloud&&ELCloud.group&&ELCloud.group())||null}catch(e){}
      let app=false;try{app=matchMedia("(display-mode: standalone)").matches||navigator.standalone===true}catch(e){}
      // the LS being looked at is in the list even when the saved list does not have it
      const ML=window.elMenuLs?elMenuLs([COURSE],g):[],lss=ML.some(l=>l.id===LS)?ML:[...ML,...(window.EL_LS||[]).filter(l=>l.id===LS)];
      html=window.elStudentMenu?elStudentMenu({root:ROOT,courses:[COURSE],lss,ca:CA,board:boardHref(),here:"ls:"+LS,app})
        :a(boardHref(),"🏠 "+t("El meu tauler","My dashboard"))+a("index.html",esc(lsName(ls)),"on",true);
    }
    $$(".nvs,.nvs-m").forEach(n=>n.innerHTML=html);
    const stu=!teach()&&who.role!=="tester";document.body.classList.toggle("stu",stu);
    // a student on the LS: the side menu is a strip of icons that opens when the mouse is on it (Roger, 8 Nov 2026: "to see better the
    // screen"; elMiniRail in el-catalog.js, el-app.css section 3), on every LS, LS1's home too (Roger, 8 Nov 2026: "the menu should
    // collapse in every LS"; only the menu, LS1's content stays as it is)
    const mini=stu&&!!window.elMiniRail;document.body.classList.toggle("elmini",mini);
    if(mini)elMiniRail($("aside.side"));
    const b=$("#bnav");if(b)b.innerHTML=stu?[["","🏠",t("Inici","Home")],["#todo","✅",t("Per fer","To do")],["#homework","📝",t("Deures","Homework")],["#marks","📊",t("Notes","Marks")],[null,"📚","LS"],["#help","❓",t("Ajuda","Help")]]
      .map(([h,i,l])=>h===null?`<a class="on" aria-current="page" href="#"><i>${i}</i>${l}</a>`:`<a href="${boardHref()}${h}"><i>${i}</i>${l}</a>`).join(""):"";
    // a phone (≤640 px): the students' tab bar of every page instead (elPhoneTabs in el-catalog.js, shared/css/el-phone.css; Roger, 8 Nov 2026)
    if(stu&&window.elPhoneTabs)elPhoneTabs({root:ROOT,board:boardHref(),ls:LS,here:"ls",ca:CA});
  }
  // ---- places (#study, #about, #final): the board's rule, little on the menu and the details inside each place
  const PLACES=["study","about","final","notes"];   // notes: 📝 Your notes from the class games (el-notes.js)
  // Go to the top only when the place changes, never on a redraw: the page draws again when Firebase answers and on every refresh, and that
  // threw the student back to the top while scrolling the Study place (Roger's screen recording, 7 Nov 2026)
  // The jump is instant, never animated: ls-home.css has html{scroll-behavior:smooth}, so a plain scrollTo(0,0) first showed the new place
  // at the old scroll (About opened at its criteria) and then slid up to the top (Roger's screen recording, 7 Nov 2026, 22:51).
  // Back on the LS home, the page goes back to where the student was on it, not to where they were on About.
  let shownPlace=null,homeY=0;
  const jump=y=>{try{window.scrollTo({top:y,left:0,behavior:"instant"})}catch(e){window.scrollTo(0,y)}};
  function place(){
    // a place the page does not have (LS2 has no #study since 7 Nov 2026; an old link or bookmark) opens the LS home
    const h=location.hash.slice(1),p=PLACES.includes(h)&&document.querySelector(`[data-place="${h}"]`)?h:"home",moved=p!==shownPlace,from=shownPlace;
    if(moved&&from==="home")homeY=window.scrollY;
    shownPlace=p;
    $$("[data-place]").forEach(s=>s.hidden=s.dataset.place!==p);
    const c=$("#crumb");
    if(c)c.innerHTML=p==="home"?`<a class="back" href="${teach()?dashHref():boardHref()}">‹ ${teach()?"Dashboard":t("El meu tauler","My dashboard")}</a>`
      :`<a class="back" href="#">‹ ${esc(lsName(ls))}</a>`;
    if(moved&&(from!==null||p!=="home"))jump(p==="home"?homeY:0);   // the first drawing of the LS home keeps the browser's own scroll
  }

  // ---- progress
  const acts=()=>(window.EL_CATALOG||[]).filter(a=>a.ls===LS);
  let ST=null;   // {info, group, pg:{key:string}, rs:{activity:result}}
  const pgOf=()=>{const o={};acts().forEach(a=>a.keys.forEach(k=>{const v=localStorage.getItem(k);if(v!=null)o[k]=v}));return o};
  function doneOf(a){const s=new Set();a.keys.forEach(k=>elDoneSet(ST.pg[k]).forEach(x=>s.add(x)));return s}
  const stepsOf=a=>(window.EL_ACTIONS||{})[a.id]||[];
  function status(){
    const info=ST.info||{},g=ST.group,all=teach()||who.role==="tester",closed=info.status==="closed";
    const open=a=>all||closed||elLpOpen(a,info,g);
    const p=(window.EL_PLAN||{})[LS],gi=p&&g&&window.ELWeek?ELWeek.col(p,g):-1,dropped=(gi>=0&&(p._dropped||{})[gi])||[];
    const dueOf=a=>gi>=0?ELWeek.due(p,a.id,gi):null;
    const done=a=>elAllDone(a,doneOf(a),ST.rs[a.id]);
    const rows=acts().map((a,i)=>({a,i,d:dueOf(a)})).sort((x,y)=>(x.d||"~")<(y.d||"~")?-1:(x.d||"~")>(y.d||"~")?1:x.i-y.i);
    // the steps a student sees: the ones done or in a section open for them (a section the teacher has not opened is never counted)
    // + the tabs 🏫 for a later class (elSecSoon): shown and counted, but never the next step until their day
    const offOf=a=>elSecLockedFor(a,info,g,doneOf(a)),soonOf=a=>elSoonSteps(a,elSecSoon(a,info,g,doneOf(a)));
    const isOff=(off,k)=>off.includes(k)||((k==="cards"||k==="practice")&&off.includes("vocab"));
    const can=a=>{const ks=stepsOf(a);if(all||closed)return ks;const ds=doneOf(a),off=offOf(a);return ks.filter(k=>ds.has(k)||!isOff(off,k))};
    const vis=a=>{const ks=stepsOf(a);if(all||closed)return ks;const ds=doneOf(a),off=offOf(a),soon=soonOf(a);return ks.filter(k=>ds.has(k)||!isOff(off,k)||soon.includes(k))};
    let next=null;
    if(!all&&!closed)for(const {a} of rows){if(a.manual||a.optional||dropped.includes(a.id)||!open(a)||done(a)||!can(a).some(k=>!doneOf(a).has(k)))continue;
      const cp=elCheckpointMissing(a,doneOf,open),k=can(a).find(x=>!doneOf(a).has(x)&&!(a.skip||[]).includes(x));next=cp?{a:cp,cp:true}:{a,k};break}
    const soonAny=!all&&!closed&&rows.some(({a})=>open(a)&&!dropped.includes(a.id)&&soonOf(a).some(k=>!doneOf(a).has(k)));
    return {open,done,dropped,next,all,closed,vis,soonAny};
  }
  // Students see only the learning paths the teacher has opened for their group (Roger, 6 Nov 2026: "I don't want students to see the
  // future LP as depending on the time left they might not do them"): not open yet and dropped ones are left out; the teacher and testers see all.
  // Nor one still behind a checkpoint (Roger, 7 Nov 2026: "they mustn't see that anything is locked"): the checkpoint is their next one.
  // LS1 (My Real Routine, both courses) is the exception (Roger, 7 Nov 2026: "since we didn't do the calendar agenda stuff here the LP don't
  // appear, but they did them all. So they should be here"): LS1 never had a Time plan, so students see every learning path of it, with their
  // own progress (✓ done, or steps done when there are some), never a lock, whatever the open switches say. The Continue card still only offers open ones.
  const ALL_LPS=/-my-real-routine$/.test(LS);
  function lpRows(S){
    let shown=0;
    $$("a.lp[data-a]").forEach(el=>{const li=el.closest("li")||el;li.hidden=false;
      const a=acts().find(x=>x.id===el.dataset.a),st=el.querySelector(".st")||el.appendChild(Object.assign(document.createElement("span"),{className:"st"}));
      el.classList.remove("done","locked","nextup","dropped");st.className="st";st.innerHTML="";
      if(!a||teach()){st.innerHTML=t("Obre","Open")+" →";shown++;return}
      const cp=!S.all&&!S.closed&&!a.manual&&elCheckpointMissing(a,doneOf,S.open);
      if(ALL_LPS&&!S.all){shown++;const ks=elTabGroups(a,stepsOf(a)),ds=doneOf(a),n=ks.filter(g=>g.every(k=>ds.has(k))).length,isNext=S.next&&S.next.a.id===a.id;
        if(ks.length&&(S.done(a)||n===ks.length)){el.classList.add("done");st.classList.add("ok");st.textContent="✓ "+t("Fet","Done")}
        else if(isNext){el.classList.add("nextup");st.classList.add("next");st.textContent=t("Ara toca","Next")+(ks.length?" · "+n+"/"+ks.length:"")}
        else if(n)st.innerHTML=`<span class="mb"><i style="width:${Math.round(n/ks.length*100)}%"></i></span>`+n+" / "+ks.length;   // no "0 / 10": much of LS1 was done before progress was saved online
        return}
      if(!S.all&&(S.dropped.includes(a.id)||!S.open(a)||cp||(stepsOf(a).length&&!S.vis(a).length))){li.hidden=true;return}
      shown++;
      const ks=elTabGroups(a,S.vis(a)),ds=doneOf(a),n=ks.filter(g=>g.every(k=>ds.has(k))).length,isNext=S.next&&S.next.a.id===a.id;
      if(S.dropped.includes(a.id)){el.classList.add("dropped");st.textContent="✂ "+t("No cal fer-lo","Not needed")}
      else if(!S.open(a)){el.classList.add("locked");st.classList.add("lock");st.textContent="🔒 "+t("Encara no està obert","Not open yet")}
      else if(ks.length&&S.done(a)){el.classList.add("done");st.classList.add("ok");st.textContent="✓ "+t("Fet","Done")}
      else if(isNext){el.classList.add("nextup");st.classList.add("next");st.textContent=(S.next.cp?t("Fes-lo ara","Do it now"):t("Ara toca","Next"))+(ks.length?" · "+n+"/"+ks.length:"")}
      else if(cp){el.classList.add("locked");st.classList.add("lock");st.textContent="🔒 "+t("Primer el checkpoint","Checkpoint first")}
      else if(ks.length)st.innerHTML=(n?`<span class="mb"><i style="width:${Math.round(n/ks.length*100)}%"></i></span>`:"")+n+" / "+ks.length;
    });
    const none=$("#lpsNone");if(none)none.hidden=shown>0;
    document.body.classList.add("lps-ready");
  }
  function contCard(S){
    const c=$("#cont");if(!c)return;
    const lpNum=a=>{const el=$(`a.lp[data-a="${a.id}"] .n`);return el?el.textContent.trim():""};
    const href=a=>a.path.split("/").pop();
    // a step's tab and name, from EL_SECTIONS (as panelOf / tabName in today.html)
    const secs=a=>(window.EL_SECTIONS||{})[a.id]||[],panel=(a,k)=>secs(a).some(y=>y[0]===k)?k:(k==="cards"||k==="practice")&&secs(a).some(y=>y[0]==="vocab")?"vocab":k;
    const secName=(a,k)=>{const x=secs(a).find(y=>y[0]===panel(a,k));return x?x[1]:k==="check"?"Checkpoint":k.charAt(0).toUpperCase()+k.slice(1)};
    if(teach()){c.className="cont teach";c.innerHTML=`<div class="ck">Teacher view</div><div class="ct">Every learning path is open for you</div>`
      +`<div class="cs">Students see only the learning paths you have opened for them, with ✓ done, steps done and their next one (never anything locked).</div><a class="cgo" href="${dashHref()}">📊 Open ${esc(lsName(ls))} on the dashboard</a>`;c.hidden=false;return}
    if(S.closed){c.className="cont done";c.innerHTML=`<div class="ct">${t("Aquesta LS ja està tancada","This LS is closed")}</div><div class="cs">${t("Pots repassar el que vas fer i el feedback del professor.","You can review what you did and your teacher's feedback.")}</div><a class="cgo" href="${boardHref()}#marks">📊 ${t("Les meves notes","My marks")} →</a>`;c.hidden=false;return}
    if(S.all){c.hidden=true;return}
    const nx=S.next;
    if(!nx){c.className="cont done";c.innerHTML=`<div class="ct">✓ ${S.soonAny?t("Ho tens tot fet, de moment!","All done for now!"):t("Ho tens tot fet!","You're all done!")}</div><div class="cs">${S.soonAny?t("De moment no tens res pendent: la resta la farem a classe 🏫.","Nothing left to do for now: we'll do the rest in class 🏫."):t("No tens res pendent als learning paths oberts.","Nothing left to do in the open learning paths.")}</div><a class="cgo" href="${ROOT}lab/practice.html">${t("Practica pel teu compte","Practise on your own")} →</a>`;c.hidden=false;return}
    const ks=elTabGroups(nx.a,S.vis(nx.a)),ds=doneOf(nx.a),n=ks.filter(g=>g.every(k=>ds.has(k))).length,num=lpNum(nx.a),title=nx.a.title.replace(/\s*\(warm-up\)$/,"");
    c.className="cont";
    c.innerHTML=`<div class="ck">${n?t("Continua on ho vas deixar","Continue where you left off"):t("El següent learning path","Your next learning path")}</div><div class="ct">${num&&/^\d+$/.test(num)?"LP"+num+" · ":""}${esc(title)}</div>`
      // the next step by name, as on the student board (Roger, 8 Nov 2026: "this was very useful")
      +`<div class="cs">${nx.cp?t("Primer fes aquest checkpoint, sense apunts: obre el que ve després.","First do this checkpoint, without notes: it opens what comes next."):nx.k?t("Següent pas","Next step")+": <b>"+esc(secName(nx.a,nx.k))+"</b>":t("El learning path et marca el pas que toca.","The learning path shows you the next step.")}</div>`
      // bar, steps and the button on one row, as on the board (Roger, 8 Nov 2026: "the same but shorter ... the bar is very visual")
      +`<div class="cbtns">`+(ks.length?`<div class="crow"><div class="cbar"><span style="width:${Math.round(n/ks.length*100)}%"></span></div><span class="cn">${n} / ${ks.length} ${t("passos","steps")}</span></div>`:"")
      +`<a class="cgo" href="${href(nx.a)}${nx.k?"#"+encodeURIComponent(panel(nx.a,nx.k)):""}">▶ ${n?t("Continua","Continue"):t("Comença","Start")}</a></div>`;
    c.hidden=false;
  }
  // ⓘ About this LS as a banner under the LS heading, the same card as on the student board (today.html aboutHtml; Roger, 8 Nov 2026:
  // "and this should also be here"): goals as verb chips, competences in their colours, how many goals, competences and criteria, and
  // Find out → the About place. Read from this page's About place; the About tile goes, as on the board. LS1 stays as it is.
  function aboutBanner(){
    if(ALL_LPS||SIMPLE)return;
    const ab=$('[data-place="about"]'),head=$('[data-place="home"] .lshead');if(!ab||!head)return;
    const tile=$('.tiles a.tile[href="#about"]');if(tile)tile.hidden=true;
    const tx=e=>e?e.textContent.replace(/\s+/g," ").trim():"";
    const objs=[...ab.querySelectorAll(".ab-obj .ab-oh")].map(h=>({i:tx(h.querySelector(".ab-oi")),v:tx(h.querySelector("b"))})).filter(o=>o.v);
    const comps=[...ab.querySelectorAll(".ab-comp")].map(e=>({k:([...e.classList].find(c=>/^k[0-9a-z]$/.test(c))||"").slice(1),i:tx(e.querySelector(".ab-ci")),n:tx(e.querySelector("b")).replace(/\s*\(.*\)\s*$/,"")})).filter(c=>c.n);
    const crit=ab.querySelectorAll(".ab-crit").length;
    const n=(k,ca1,en1,ca,en)=>k?`<span><b>${k}</b> ${k===1?t(ca1,en1):t(ca,en)}</span>`:"";
    const nums=n(objs.length,"objectiu","goal","objectius","goals")+n(comps.length,"competència","competence","competències","competences")+n(crit,"criteri d'avaluació","assessment criterion","criteris d'avaluació","assessment criteria");
    const ob=objs.map(o=>`<span class="abo">${o.i?`<i aria-hidden="true">${esc(o.i)}</i>`:""}${esc(o.v)}</span>`).join("");
    const cp=comps.map(c=>`<span class="abc fk-${esc(c.k||"b")}">${c.i?`<i aria-hidden="true">${esc(c.i)}</i>`:""}${esc(c.n)}</span>`).join("");
    let a=document.getElementById("lsAbout");if(!a){a=document.createElement("a");a.id="lsAbout";a.className="lsab";a.href="#about";head.after(a)}
    a.innerHTML=`<span class="abi" aria-hidden="true">🧭</span>`
      +`<span class="abt"><span class="abk">ⓘ ${t("Sobre aquesta LS","About this LS")}</span><b>${t("Què aprendràs i com t'avaluarem","What you will learn and how you are assessed")}</b>`
      +(nums?`<span class="abn">${nums}</span>`:"")+`</span>`
      +(ob||cp?`<span class="abx">${ob?`<span class="abr"><em>🎯 ${t("Objectius","Goals")}</em>${ob}</span>`:""}${cp?`<span class="abr"><em>🧩 ${t("Competències","Competences")}</em>${cp}</span>`:""}</span>`:"")
      +`<span class="abgo">${t("Descobreix-ho","Find out")} →</span>`;
  }

  // ---- the simple LS home (Roger, 20 Nov 2026: "the LS must be similar to the new format and simple, there is too much info: there should
  // be aims, challenge, criteria, grammar vocab list, and a percentage of each communicative skill's performance in the activities so far
  // (average of all tries) and the exams"). In the voyage board's look (parchment cards, Georgia titles). Built from this page's own
  // content (the About place, a.chal, [data-ls-lists]), so every LS page gets it with no change to its HTML; the old home (Continue card,
  // learning paths, tiles, About banner) stays in the file but is hidden (the board's 🧭 voyage has the steps). LS1 and a personal LS keep
  // their home. No new Firestore reads: the progress in this browser and the results the page already read.
  const SIMPLE=!ALL_LPS&&!ls.personal;
  let LV=null;   // the student's level (route id) for the grammar and vocabulary lines; null = every line (teacher, testers, not known yet)
  const RK={beginners:0,insecure:1,safe:2,daring:3,native:4},RN={Beginners:"beginners",Insecure:"insecure",Safe:"safe",Daring:"daring",Native:"native",Starter:"beginners",Base:"insecure",Core:"safe",Plus:"daring",Pro:"native"};
  // the skills, as on the voyage map (el-voyage.js SK): label (Catalan where the map has one), icon, colour
  const SKL={Reading:["Reading","📖","#1d4ed8"],Listening:["Listening","🎧","#7e22ce"],Speaking:["Speaking","🗣","#c2410c"],Writing:["Escriptura","✍️","#15803d"],
    Grammar:["Gramàtica","🧩","#b91c1c"],Vocabulary:["Vocabulari","🔤","#0f766e"]};
  const SK4=["Reading","Listening","Speaking","Writing"],SK2=["Grammar","Vocabulary"];
  const skName=k=>CA?SKL[k][0]:k;
  // a step's skill: the voyage map's (el-voyage.js skill), only the six above (recall, research and checkpoints mix things up: left out)
  function skillOf(a,pid){let s="";try{s=window.elVoyage?elVoyage.skill(a.id,pid,null):""}catch(e){}
    if(!s)s=/^(vocab|words|cards|practice)/.test(pid)?"Vocabulary":/^(grammar|mixed)/.test(pid)?"Grammar":/^(shadow|talk|speak)/.test(pid)?"Speaking":/^(write|card)/.test(pid)?"Writing":/listen|again|chart/.test(pid)?"Listening":/read|log|^ch\d/.test(pid)?"Reading":"";
    s=String(s).split(" · ")[0];return SKL[s]?s:null}
  // 📊 each skill's % in the activities: every checked step of this LS (the engine's state: all = every try since 20 Nov 2026, before
  // that the first and the latest try), a step marked by the teacher (results levels) when it has no checks; each step counts the same.
  // In the exam: the points of the exam parts of that skill (results/{ls}__assessment sections), never while the results are held.
  const LVL=/_(beginners|insecure|safe|daring|native)$/;
  function skillData(){const act={},ex={},put=(k,v)=>{if(v==null||isNaN(v))return;const z=act[k]||(act[k]={s:0,n:0});z.s+=Math.max(0,Math.min(1,v));z.n++};
    if(!ST)return {act,ex,held:null};
    acts().forEach(a=>{if(/checkpoint/.test(a.id)||a.graded===false)return;const seen=new Set();
      a.keys.forEach(key=>{let st=null;try{st=JSON.parse(ST.pg[key]||"null")}catch(e){}if(!st)return;
        const A=st.all||{},F=st.tries||{},L=st.last||{};
        new Set([...Object.keys(A),...Object.keys(F),...Object.keys(L)]).forEach(k=>{const pid=k.replace(LVL,""),sk=skillOf(a,pid);if(!sk)return;
          let v=null;if(A[k]&&A[k].n)v=A[k].s/A[k].n;
          else{const f=F[k],l=L[k],xs=[f];if(l&&(!f||Math.abs(Date.parse(l.date)-Date.parse(f.date))>5000))xs.push(l);
            const ok=xs.filter(x=>x&&+x.max>0);if(ok.length)v=ok.reduce((n,x)=>n+(+x.score||0)/+x.max,0)/ok.length}
          if(v!=null){put(sk,v);seen.add(pid)}})});
      const M=window.EL_DEGREE_MARK||{NA:2.5,AS:5,AN:7.5,AE:10};
      Object.entries(((ST.rs||{})[a.id]||{}).levels||{}).forEach(([pid,cs])=>{if(seen.has(pid))return;const sk=skillOf(a,pid);if(!sk)return;
        const ms=Object.values(cs||{}).map(d=>M[d]).filter(n=>n!=null);if(ms.length)put(sk,ms.reduce((n,m)=>n+m,0)/ms.length/10)})});
    const X=(ST.raw||{})[LS+"__assessment"],G=((window.EL_GRADING||{})[LS]||{}).exam;
    const held=X&&(X.held||(X.showFrom&&Date.now()<Date.parse(X.showFrom)))?(X.held||X.showFrom):null;
    if(X&&G&&!held&&X.sections)G.sections.forEach(([k,name,max])=>{const v=X.sections[k];if(!v||v.score==null)return;const sk=String(name).split(/\s|·/)[0];if(!SKL[sk])return;
      const z=ex[sk]||(ex[sk]={s:0,m:0});z.s+=+v.score||0;z.m+=+(v.max||max)||0});
    return {act,ex,held}}
  const pc=(s,n)=>n?Math.round(s/n*100):null;
  function skillsCard(){
    const D=skillData(),T=teach();
    const bar=(lab,p,k,note)=>`<div class="sk-b"><em>${lab}</em><span class="sk-bar"><i style="width:${p||0}%;background:${SKL[k][2]}"></i></span><strong${p==null?' class="na"':""}>${p==null?(note||"–"):p+" %"}</strong></div>`;
    const heldTx=D.held?(()=>{const d=new Date(D.held);return t("Resultats de l'examen: ","Exam results: ")+d.toLocaleDateString(CA?"ca":"en-GB",{weekday:"short",day:"numeric",month:"short"})})():"";
    const row=k=>{const a=D.act[k],e=D.ex[k],pa=a?pc(a.s,a.n):null,pe=e&&e.m?Math.round(e.s/e.m*100):null;
      return `<div class="sk-row" style="--k:${SKL[k][2]}"><span class="sk-ic" aria-hidden="true">${SKL[k][1]}</span><b class="sk-n">${esc(skName(k))}</b>`
        +bar(t("Activitats","Activities"),pa,k)+bar(t("Examen","Exam"),pe,k)+`</div>`};
    return `<section class="lss-card lss-skills"><h2>📊 ${t("Com et va a cada destresa","How you are doing in each skill")}</h2>`
      +(T?`<p class="lss-lead">${"Each student sees their own percentages here: the average of all their tries in the activities, and their mark in each part of the exam."}</p>`:
        `<p class="lss-lead">${t("Activitats: la mitjana de tots els teus intents. Examen: la nota de cada part.","Activities: the average of all your tries. Exam: your mark in each part.")}</p>`)
      +SK4.map(row).join("")+`<div class="sk-sep"></div>`+SK2.map(row).join("")
      +(heldTx?`<p class="lss-held">📝 ${esc(heldTx)}</p>`:"")+`</section>`}
  // the page's own content, read once
  let SRC=null;
  function source(){if(SRC)return SRC;
    const tx=e=>e?e.textContent.replace(/\s+/g," ").trim():"",ab=$('[data-place="about"]')||document.createElement("div"),c=$("a.chal"),fin=$('[data-place="final"] a.btn');
    SRC={aims:[...ab.querySelectorAll(".ab-obj")].map(o=>({i:tx(o.querySelector(".ab-oi")),v:tx(o.querySelector(".ab-oh b")),p:tx(o.querySelector("p:not(.ab-why)")),w:tx(o.querySelector(".ab-why")).replace(/^➜\s*/,"")})),
      crit:[...ab.querySelectorAll(".ab-crit")].map(d=>({k:([...d.classList].find(x=>/^k[0-9a-z]$/.test(x))||"kb"),chip:(d.querySelector(".ab-chip")||{}).outerHTML||"",sk:tx(d.querySelector(".ab-ch b")),
        d:tx(d.querySelector(".ab-do")).replace(/^In this LS:\s*/,""),off:tx(d.querySelector(".ab-off")).replace(/^Curriculum criterion:\s*/,"")})),
      chal:c?{b:tx(c.querySelector("b")),d:tx(c.querySelector(".d")),h:fin?fin.getAttribute("href"):c.getAttribute("href")}:null,
      lists:[...document.querySelectorAll("[data-ls-lists] .bigcard")].map(e=>({h:tx(e.querySelector("h2")),li:[...e.querySelectorAll("li")].map(tx)})).filter(x=>x.h&&x.li.length)};
    return SRC}
  // a line of the lists for the student's level, as the board's langLists (today.html): "Safe: …" lines from that level up, the tag dropped
  function listLine(x){const all=LV==null,me=all?99:RK[LV]??0,re=/\b(Beginners|Insecure|Safe|Daring|Native)\b/g,nm=v=>(window.EL_ROUTE_RENAME||{})[v]||v;
    const N="Beginners|Insecure|Safe|Daring|Native|Starter|Base|Core|Plus|Pro",m=x.match(new RegExp("^("+N+"):\\s*")),tg=x.match(new RegExp("\\s*\\(((?:"+N+")(?:,\\s*(?:"+N+"))*)\\)"));
    const lv=m?[m[1]]:tg?tg[1].split(/,\s*/):[];if(lv.length&&me<Math.min(...lv.map(v=>RK[RN[v]])))return "";
    let s=x;if(!all){if(m)s=s.slice(m[0].length);if(tg)s=s.replace(tg[0],"")}else s=s.replace(re,nm);
    return `<li>${esc(s)}</li>`}
  function destImg(){try{if(!window.elVoyage||!elVoyage.SKINS[LS])return "";const S=elVoyage.skin({skin:LS});return S.I+S.dest.img+".webp"}catch(e){return ""}}
  function simpleHome(){if(!SIMPLE)return;
    const home=$('[data-place="home"]'),head=home&&home.querySelector(".lshead");if(!head)return;
    document.body.classList.add("lss");
    let w=$("#lsSimple");if(!w){w=document.createElement("div");w.id="lsSimple";w.className="lss-grid";head.after(w)}
    const S=source(),img=destImg();
    const chal=S.chal?`<a class="lss-card lss-chal" href="${esc(S.chal.h)}">${img?`<img src="${esc(img)}" alt="" loading="lazy">`:""}<span class="lss-cb"><span class="lss-k">🏆 ${t("El teu repte · producte final","Your challenge · final product")}</span><b>${esc(S.chal.b)}</b><span class="lss-d">${esc(S.chal.d)}</span><span class="lss-go">${t("Mira què has de fer","See what to do")} →</span></span></a>`:"";
    const aims=S.aims.length?`<section class="lss-card lss-aims"><h2>🎯 ${t("Què aprendràs","What you will learn")}</h2><ol>${S.aims.map(o=>`<li><span class="lss-ai" aria-hidden="true">${esc(o.i)}</span><span><b>${esc(o.v)}</b> ${esc(o.p)}${o.w?` <small>${esc(o.w)}</small>`:""}</span></li>`).join("")}</ol></section>`:"";
    const crit=S.crit.length?`<section class="lss-card lss-crit"><h2>📏 ${t("Com t'avaluarem","How you are assessed")}</h2><p class="lss-lead">${t("Els criteris d'avaluació d'aquesta LS. Toca'n un per veure el text oficial.","The assessment criteria of this LS. Tap one to see its official wording.")}</p>`
      +S.crit.map(c=>`<details class="lss-cr ${esc(c.k)}"><summary>${c.chip}<span class="lss-crt"><b>${esc(c.sk)}</b> ${esc(c.d)}</span></summary><p>${esc(c.off)}</p></details>`).join("")+`</section>`:"";
    const lists=S.lists.length?`<section class="lss-card lss-gv"><h2>🔤 ${t("Gramàtica i vocabulari","Grammar and vocabulary")}</h2><div class="lss-gvc">${S.lists.map(c=>`<div><h3>${esc(c.h)}</h3><ul>${c.li.map(listLine).join("")}</ul></div>`).join("")}</div></section>`:"";
    w.innerHTML=`<div class="lss-col">${chal}${aims}${crit}</div><div class="lss-col">${skillsCard()}${lists}</div>`;
    if(window.elRouteFix)try{elRouteFix(w)}catch(e){}
  }
  function draw(){
    lang();nav();place();aboutBanner();simpleHome();
    // 📈 My formative assessment tile (Roger, 7 Nov 2026: "instead of study, my formative assessment"): the board's formative tab of this LS
    $$("[data-el-formative]").forEach(e=>{const b=boardHref();e.href=b+(b.includes("?")?"&":"?")+"ls="+encodeURIComponent(LS)+"#formative"});
    if(ST){const S=status();lpRows(S);contCard(S)}
    document.dispatchEvent(new Event("ellshome"));   // el-notes.js draws again in the right language
  }
  window.ELLsHome={ca:()=>CA};
  window.addEventListener("hashchange",place);
  window.addEventListener("load",()=>{if(SIMPLE)simpleHome()});
  // teacher-only tiles (data-el-teacher: el-cloud.js shows them for the teacher)
  draw();

  async function fromCloud(u){
    const C=window.ELCloud;
    if(!u){who={role:"none"};CA=false;ST=null;draw();return}
    const AS=C.viewing;
    who=AS?{role:"as",uid:AS.uid}:C.isTeacher(u)?{role:"teacher"}:C.isTester(u)&&!C.viewGroup()?{role:"tester"}:{role:"student"};
    let lvs={};try{lvs=await C.levels()}catch(e){}
    const lv=window.elRouteOf?elRouteOf(lvs,LS).level:null;
    CA=(who.role==="student"||who.role==="as")&&(!lv||elCa(lv));
    if(who.role==="as")try{const A=JSON.parse(sessionStorage.getItem("el_as")||"null");if(A&&A.uid===who.uid&&A.ca!==CA){A.ca=CA;sessionStorage.setItem("el_as",JSON.stringify(A))}}catch(e){}
    LV=who.role==="student"||who.role==="as"?lv:null;
    let info={},rs={},raw={};
    try{info=await (C.lsNow||C.lsInfo)(LS)}catch(e){}
    if(who.role!=="teacher")try{raw=await C.results()||{};for(const r of Object.values(raw))if(r&&r.activity)rs[r.activity]=r}catch(e){}
    const pg={[LS]:pgOf()};try{elInjectCorrected(pg,rs)}catch(e){}   // steps the teacher corrected count as done, as on the board
    ST={info,group:C.group(),pg:pg[LS],rs,raw};
    draw();
  }
  const D=window.EL_DEMO_LS;
  if(D){who={role:D.role||"student",uid:"demo"};CA=D.role!=="teacher"&&(!D.level||elCa(D.level));
    if(D.pg)for(const k in D.pg)localStorage.setItem(k,D.pg[k]);
    const pg={[LS]:pgOf()};try{elInjectCorrected(pg,D.rs||{})}catch(e){}
    LV=D.role!=="teacher"&&D.level||null;
    ST={info:D.info||{status:"open"},group:D.group,pg:pg[LS],rs:D.rs||{},raw:D.raw||{}};draw();
    $$("[data-el-teacher]").forEach(e=>e.hidden=D.role!=="teacher");return}
  // Until Firebase has loaded and said who is signed in, draw for who was signed in on this browser last (el_who, el-cloud.js), with the
  // LS state, answers and results last kept in this browser: the page opens on its real look, not on an empty or a student's one
  // (Roger, 7 Nov 2026: "it loads old version for seconds and then it opens the last version"). fromCloud draws it again with what it reads.
  (function early(){
    const J=(st,k)=>{try{return JSON.parse(st.getItem(k)||"null")}catch(e){return null}};
    const W=J(localStorage,"el_who");if(!W||!W.role)return;
    const A=W.role==="teacher"?J(sessionStorage,"el_as"):null;
    who=A&&A.uid?{role:"as",uid:A.uid}:{role:W.role};
    // the teacher's student view: the student's language, kept with el_as by the page before (el-cloud.js remember, the board, fromCloud below)
    CA=who.role==="student"?W.ca!==false:who.role==="as"?A.ca!==false:false;
    const info=J(localStorage,"el_ls_"+LS),rc=who.role==="student"&&W.uid?J(localStorage,"el_rc_"+W.uid):null,rs={};
    if(rc&&rc.d)for(const r of Object.values(rc.d))if(r&&r.activity)rs[r.activity]=r;
    if(info||who.role==="teacher"||who.role==="tester"){
      const pg={[LS]:pgOf()};try{elInjectCorrected(pg,rs)}catch(e){}
      ST={info:info||{},group:who.role==="as"?(A.group||null):W.group||null,pg:pg[LS],rs,raw:(rc&&rc.d)||{}};
    }
    if(who.role==="teacher")$$("[data-el-teacher]").forEach(e=>e.hidden=false);
    draw();
  })();
  // <html class="elgate">: the page shows now, on this drawing (ls-home.css); nobody signed in on this browser: once Firebase knows (el-cloud.js)
  document.documentElement.classList.add((()=>{try{return localStorage.getItem("el_who")}catch(e){return null}})()?"elready":"elwait");
  let tries=0;(function wait(){if(window.ELCloud&&ELCloud.onUser){ELCloud.onUser(u=>fromCloud(u).catch(e=>console.warn("ls home",e)));return}
    if(++tries<300)setTimeout(wait,100)})();
})();
