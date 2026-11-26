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
  // a personal LS (Towards Nativeness) is not an LS of its course on the dashboard: it opens its own ✦ page there, never a 4 ESO group
  // (Roger, 25 Nov 2026: "Why do I only see 4ESO when I press this button")
  const dashHref=()=>ROOT+(ls.personal?"teacher.html?g=tn":"teacher.html?course="+COURSE+"&ls="+encodeURIComponent(LS));
  const teach=()=>who.role==="teacher";
  function nav(){
    // every item is a button with an icon (Roger, 6 Nov 2026: "these things should look like buttons"; shared/css/el-app.css): "🏠 My dashboard" → icon + label
    // an LS item ("LS2 · Free Time, Live!") shows its number in the icon box instead of 📚 (Roger, 7 Nov 2026: "instead of the book emoji")
    const a=(h,txt,cls,cur)=>{const m=String(txt).match(/^(\p{Extended_Pictographic}\uFE0F?)\s*(.*)$/u)||String(txt).match(/^(LS\d+) · (.*)$/),ic={"English Lab":"🧪",Practise:"🎯",Practica:"🎯"}[txt]||(m?m[1]:"🗂");
      return `<a class="nv${cls?" "+cls:""}" href="${h}"${cur?' aria-current="page"':""}><span class="ic${/^LS\d/.test(ic)?" lsn":""}" aria-hidden="true">${ic}</span><span class="lb">${m?m[2]:txt}</span></a>`};
    let html;
    // the teacher: the dashboard's side menu, the same on every teacher page (elTeacherMenu in el-catalog.js; Roger, 25 Nov 2026: "this
    // menu should always be the same"), under the dashboard's name
    const tm=teach()&&!!window.elTeacherMenu,br=$("aside.side .brand");
    if(br){if(br.dataset.en==null){br.dataset.en=br.textContent;br.dataset.h=br.getAttribute("href")||""}
      br.textContent=tm?"Teacher dashboard":br.dataset.en;br.setAttribute("href",tm?ROOT+"teacher.html":br.dataset.h)}
    $$(".nvs,.nvs-m").forEach(n=>n.classList.toggle("eltm",tm));
    if(tm){
      html=elTeacherMenu({root:ROOT});
    }else if(who.role==="tester"){
      const first=a(boardHref(),"🏠 My dashboard");
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
    else{const top=$("aside.side>.elmtop");if(top){const b=top.querySelector(".brand");if(b)top.before(b);top.remove()}}   // drawn first for a student (the strip), then the teacher: the brand comes back out of the ☰ row
    const b=$("#bnav");if(b)b.innerHTML=stu?[["","🏠",t("Inici","Home")],["#todo","✅",t("Per fer","To do")],["#homework","📝",t("Deures","Homework")],["#marks","📊",t("Notes","Marks")],[null,"📚","LS"],["#help","❓",t("Ajuda","Help")]]
      .map(([h,i,l])=>h===null?`<a class="on" aria-current="page" href="#"><i>${i}</i>${l}</a>`:`<a href="${boardHref()}${h}"><i>${i}</i>${l}</a>`).join(""):"";
    // a phone (≤640 px): the students' tab bar of every page instead (elPhoneTabs in el-catalog.js, shared/css/el-phone.css; Roger, 8 Nov 2026)
    if(stu&&window.elPhoneTabs)elPhoneTabs({root:ROOT,board:boardHref(),ls:LS,here:"ls",ca:CA});
    // the teacher on a phone: the dashboard's tab bar (elTeacherTabs); nobody else keeps a students' bar drawn before sign-in was known
    else if(tm&&window.elTeacherTabs)elTeacherTabs({root:ROOT});
    else{const p=$("nav.elptabs");if(p)p.remove();document.body.classList.remove("elptab")}
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
    return {open,done,dropped,next,all,closed,vis,can,rows,soonAny};
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

  // ---- the LS page (Roger, 26 Nov 2026, doc "New student's organization menu", his sketch of the LS: "Easy to read. Format (all LS all
  // course same color"; it replaces the simple LS home of 20 Nov and its 📊 skills card and 🧭 Your steps): a band in the course's colour
  // (the LS's number and title, its question, 🏆 Final product on the right) · 🎯 What you will learn | 📏 How you will be assessed ·
  // 🧩 Grammar | 🔤 Vocabulary (each class game topic with the student's % in the class games, 📖 Study = its class explanation here,
  // 🧠 Cards = Flashcards) · 📋 Activities, grouped by skill: each tab the student can see, with its result and Open ›. Built from this
  // page's own content (the About place, a.chal, [data-ls-lists]) and the catalogue, so every LS page gets it with no change to its HTML.
  // LS1 and a personal LS keep their home. No new Firestore reads: the progress in this browser, the results the page already read and
  // the class games el-notes.js already reads for this page (myGames, window.EL_MY_GAMES).
  const SIMPLE=!ALL_LPS&&!ls.personal;
  let LV=null;   // the student's level (route id) for the grammar and vocabulary lines; null = every line (teacher, testers, not known yet)
  const RK={beginners:0,insecure:1,safe:2,daring:3,native:4},RN={Beginners:"beginners",Insecure:"insecure",Safe:"safe",Daring:"daring",Native:"native",Starter:"beginners",Base:"insecure",Core:"safe",Plus:"daring",Pro:"native"};
  // the skill groups of 📋 Activities, in this order: label, Catalan, icon (as on the voyage map, el-voyage.js SK)
  const GRP=[["Reading","Reading","📖"],["Listening","Listening","🎧"],["Speaking","Speaking","🗣"],["Writing","Escriptura","✍️"],["Grammar","Gramàtica","🧩"],
    ["Vocabulary","Vocabulari","🔤"],["Research","Recerca","🔎"],["Recall","Repàs","🧠"]];
  // a tab's group: the voyage map's skill of its first step (el-voyage.js skill), "Speaking · Talk" → Speaking; checkpoints → Recall
  function groupOf(a,pid){if(/checkpoint/.test(a.id))return "Recall";let s="";try{s=window.elVoyage?elVoyage.skill(a.id,pid,null):""}catch(e){}
    if(!s)s=/^recall/.test(pid)?"Recall":/^(vocab|words|cards|practice)/.test(pid)?"Vocabulary":/^(grammar|mixed)/.test(pid)?"Grammar":/^(shadow|talk|speak)/.test(pid)?"Speaking":/^(write|card)/.test(pid)?"Writing":/listen|again|chart/.test(pid)?"Listening":/read|log|^ch\d|^book/.test(pid)?"Reading":"";
    s=String(s).split(" · ")[0];return GRP.some(g=>g[0]===s)?s:null}
  const LVL=/_(beginners|insecure|safe|daring|native)$/;
  // a step's latest score (0–1) in this browser's progress: the newest check of any level (the latest version shows, never the first try)
  function stepScore(a,k){let best=null;if(!ST)return null;
    a.keys.forEach(key=>{let st=null;try{st=JSON.parse(ST.pg[key]||"null")}catch(e){}if(!st)return;const L=st.last||{};
      Object.keys(L).forEach(x=>{if(x.replace(LVL,"")!==k)return;const l=L[x];if(l&&+l.max>0&&(!best||Date.parse(l.date)>Date.parse(best.date)))best=l})});
    return best?Math.max(0,Math.min(1,(+best.score||0)/+best.max)):null}
  const pcCol=p=>window.elPctCol?elPctCol(p):"#64748b";
  // the page's own content, read once
  let SRC=null;
  function source(){if(SRC)return SRC;
    const tx=e=>e?e.textContent.replace(/\s+/g," ").trim():"",ab=$('[data-place="about"]')||document.createElement("div"),c=$("a.chal"),fin=$('[data-place="final"] a.btn');
    SRC={q:tx($('[data-place="home"] .lshead p.q')),
      aims:[...ab.querySelectorAll(".ab-obj")].map(o=>({i:tx(o.querySelector(".ab-oi")),v:tx(o.querySelector(".ab-oh b")),p:tx(o.querySelector("p:not(.ab-why)")).replace(/,\s*$/,".")})),
      crit:[...ab.querySelectorAll(".ab-crit")].map(d=>({k:([...d.classList].find(x=>/^k[0-9a-z]$/.test(x))||"kb"),chip:(d.querySelector(".ab-chip")||{}).outerHTML||"",sk:tx(d.querySelector(".ab-ch b")),
        d:tx(d.querySelector(".ab-do")).replace(/^In this LS:\s*/,""),off:tx(d.querySelector(".ab-off")).replace(/^Curriculum criterion:\s*/,"")})),
      chal:c?{b:tx(c.querySelector("b")),h:fin?fin.getAttribute("href"):c.getAttribute("href")}:null,
      lists:[...document.querySelectorAll("[data-ls-lists] .bigcard")].map(e=>({h:tx(e.querySelector("h2")),li:[...e.querySelectorAll("li")].map(tx)})).filter(x=>x.h&&x.li.length)};
    return SRC}
  // a line of the programme's lists for the student's level, as the board's langLists (today.html): "Safe: …" lines from that level up
  function listLine(x){const all=LV==null,me=all?99:RK[LV]??0,re=/\b(Beginners|Insecure|Safe|Daring|Native)\b/g,nm=v=>(window.EL_ROUTE_RENAME||{})[v]||v;
    const N="Beginners|Insecure|Safe|Daring|Native|Starter|Base|Core|Plus|Pro",m=x.match(new RegExp("^("+N+"):\\s*")),tg=x.match(new RegExp("\\s*\\(((?:"+N+")(?:,\\s*(?:"+N+"))*)\\)"));
    const lv=m?[m[1]]:tg?tg[1].split(/,\s*/):[];if(lv.length&&me<Math.min(...lv.map(v=>RK[RN[v]])))return "";
    let s=x;if(!all){if(m)s=s.slice(m[0].length);if(tg)s=s.replace(tg[0],"")}else s=s.replace(re,nm);
    return `<li>${esc(s)}</li>`}

  // 🧩 Grammar | 🔤 Vocabulary: the class game topics of this LS (lab/game/decks/theory.js: the theory slides explained in class), only the
  // ones of a learning path the student can open or has played; % = right answers in its class games (myGames), "–" before any.
  // With no class game yet (a new LS), the programme's lists at the student's level, as before.
  function gvTopics(kind,S){const TH=window.EL_GAME_THEORY||{},num=(window.elLsNum?elLsNum(ls):"").toLowerCase(),pre=COURSE+"-"+num+"-lp";if(!num)return [];
    const G=window.EL_GAMES||[],mg=Object.values(window.EL_MY_GAMES||{}).filter(g=>g&&g.ls===LS);
    const actOf=k=>{const g=G.find(d=>d.id===k);if(g&&g.act)return g.act;const lp=(k.match(/-lp\d+-/)||[])[0],s=lp&&G.find(d=>d.act&&d.id.includes(lp)&&d.id.startsWith(COURSE+"-"+num));return s?s.act:null};
    return Object.keys(TH).filter(k=>k.startsWith(pre)&&(kind==="grammar"?/-grammar$/.test(k):/-vocab$/.test(k))).sort((a,b)=>a.localeCompare(b,"en",{numeric:true})).map(k=>{
      const gs=mg.filter(g=>g.deck===k),r=gs.reduce((n,g)=>n+(+g.r||0),0),of=gs.reduce((n,g)=>n+(+g.of||0),0);
      const act=actOf(k),a=act&&acts().find(x=>x.id===act);
      const ok=S.all||S.closed||gs.length||(a&&S.open(a)&&!S.dropped.includes(a.id));
      return ok?{k,title:String(TH[k].title||"").replace(/^(Grammar|Vocabulary) · /,""),parts:(TH[k].parts||[]).map(p=>(CA&&p.nameCa)||p.name).filter(Boolean),pc:of?r/of*100:null}:null}).filter(Boolean)}
  function gvCard(kind,S){const L=gvTopics(kind,S),gr=kind==="grammar",S0=source(),list=S0.lists[gr?0:1];
    const head=`<h2>${gr?"🧩 "+t("Gramàtica","Grammar"):"🔤 "+t("Vocabulari","Vocabulary")}</h2>`;
    if(!L.length)return list?`<section class="lsn-card lsn-gv">${head}<ul class="lsn-ul">${list.li.map(listLine).join("")}</ul></section>`:"";
    return `<section class="lsn-card lsn-gv">${head}<ul class="lsn-topics">${L.map(x=>`<li><span class="lsn-tt"><b>${esc(x.title)}</b>${x.parts.length?`<small>${esc(x.parts.join(" · "))}</small>`:""}</span>`
      +`<span class="lsn-pc" style="color:${x.pc==null?"#94a3b8":pcCol(x.pc)}">${x.pc==null?"–":Math.round(x.pc)+" %"}</span>`
      +(gr?`<button type="button" class="lsn-btn" data-do="lsstudy" data-k="${esc(x.k)}">📖 ${t("Estudia","Study")}</button>`
        :`<a class="lsn-btn" href="${ROOT}lab/practice.html#deck">🧠 ${t("Targetes","Cards")}</a>`)+`</li>`).join("")}</ul></section>`}
  // 📖 Study: the topic's class explanation (its theory slides) in a window on this page, each point with the student's own words in Catalan for Starter
  const md=s=>esc(s).replace(/\*\*(.+?)\*\*/g,"<b>$1</b>").replace(/~~(.+?)~~/g,"<s>$1</s>");
  function study(k){const T=(window.EL_GAME_THEORY||{})[k];if(!T)return;
    let d=$("#lsnDlg");if(!d){d=document.createElement("dialog");d.id="lsnDlg";d.className="lsn-dlg";document.body.appendChild(d);
      d.addEventListener("click",e=>{if(e.target===d||e.target.closest("[data-do=lsclose]"))d.close()})}
    const sl=s=>`<div class="lsn-sl"><h4>${esc(s.img||"")} ${esc(s.theory||"")}</h4>`+(CA&&s.ca?`<ul>${s.ca.map(c=>`<li>${md(c)}</li>`).join("")}</ul>`:"")
      +(s.lines||[]).map(x=>typeof x==="string"?`<p>${md(x)}</p>`:x.table?`<div class="lsn-tw"><table>${x.table.map((r,i)=>`<tr>${r.map(c=>i?`<td>${md(c)}</td>`:`<th>${md(c)}</th>`).join("")}</tr>`).join("")}</table></div>`:x.watch?`<p class="lsn-watch">⚠️ ${md(x.watch)}</p>`:"").join("")+`</div>`;
    d.innerHTML=`<div class="lsn-dh"><h3>📖 ${esc(String(T.title||"").replace(/^(Grammar|Vocabulary) · /,""))}</h3><button type="button" class="lsn-x" data-do="lsclose">✕ ${t("Tanca","Close")}</button></div>`
      +(T.parts||[]).map(p=>`<section><h3 class="lsn-ph">${esc((CA&&p.nameCa)||p.name||"")}</h3>${(p.slides||[]).map(sl).join("")}</section>`).join("");
    if(d.showModal&&!d.open)d.showModal();d.scrollTop=0}
  document.addEventListener("click",e=>{const b=e.target.closest('[data-do="lsstudy"]');if(b)study(b.dataset.k)});

  // 📋 Activities: the learning paths the student can open (not dropped, not behind a checkpoint), each tab they can see (never one for a
  // later class), in the group's order; its result: the latest score of its checked steps (x / 10), ✓ Done, or To do. Checkpoints show only
  // Done (their marks wait for 📣 Release feedback). The sample exam, the final product and Reflect are not here. Each row: the step's topic,
  // a one-line summary (EL_STEP_TITLES [3] / [4], from the step's intro: Roger, 26 Nov 2026, "They need to have a little description -
  // summary") and the learning path · tab. 📖 The book is one row (its chapters are its steps, n / 6 until all are done).
  // Two views (Roger, 26 Nov 2026: "I want the option of viewing the activities in order of appearence"): 🧩 By skill (a card per skill)
  // or 🔢 In order (a card per learning path, its tabs in the path's order); the choice stays on this device (el_ls_actview).
  function actItems(S){const out=[],secs=a=>(window.EL_SECTIONS||{})[a.id]||[],TT=(a,p)=>((window.EL_STEP_TITLES||{})[a]||{})[p]||null;
    const lpT=a=>a.title.replace(/\s*\(warm-up\)$/,""),fpH=(source().chal||{}).h||"",noIc=s=>String(s).replace(/^[\u{1F300}-\u{1FAFF}☀-➿]️?\s*/u,"");
    S.rows.forEach(({a})=>{if(a.optional||a.manual||(fpH&&a.path.endsWith("/"+fpH)))return;
      if(!S.all&&!S.closed&&(S.dropped.includes(a.id)||!S.open(a)||elCheckpointMissing(a,doneOf,S.open)))return;
      const ks=S.can(a);if(!ks.length)return;const ds=ST?doneOf(a):new Set(),href=a.path.split("/").pop(),lp=lpT(a);
      if(/checkpoint/.test(a.id)){out.push({a,lp,grp:"Recall",t:lp,s:t("Un repàs curt del que has après, sense apunts.","A short review of what you have learnt, without notes."),
        m:"",h:href,v:null,done:ks.every(k=>ds.has(k)),cp:1});return}
      const tabs=[];elTabGroups(a,ks).forEach(g=>{const tab=secs(a).some(y=>y[0]===g[0])?g[0]:(g[0]==="cards"||g[0]==="practice")?"vocab":elTabOf(a.id,g[0]);
        const o=tabs.find(x=>x.tab===tab);if(o)o.g=o.g.concat(g);else tabs.push({tab,g:g.slice()})});
      tabs.forEach(({tab,g})=>{const bk=tab==="book",grp=groupOf(a,bk?"ch1":g[0]);if(!grp)return;
        const sn=noIc((secs(a).find(y=>y[0]===tab)||[])[1]||(bk?"Book":tab)),tt=bk?null:(TT(a.id,tab)||TT(a.id,g[0]));
        let ti=tt?((CA&&tt[2])||tt[1]||""):"",su=tt?((CA&&tt[4])||tt[3]||""):"";if(/^Learning Path \d/.test(ti))ti="";
        if(bk){ti=noIc(lp);su=t("Llegeix la història capítol a capítol i respon les preguntes de cada capítol.","Read the story chapter by chapter and answer the questions on each one.")}
        const sc=g.map(k=>stepScore(a,k)).filter(v=>v!=null),n=g.filter(k=>ds.has(k)).length;
        out.push({a,lp,grp,sn,t:ti||sn,s:su,m:bk?"":lp+" · "+sn,h:href+"#"+encodeURIComponent(tab),
          v:sc.length?sc.reduce((x,y)=>x+y,0)/sc.length:null,done:n===g.length,part:g.length>1&&bk?[n,g.length]:null})})});
    return out}
  let ACT_S=null,ACT_N=0,AV="skill";try{AV=localStorage.getItem("el_ls_actview")==="order"?"order":"skill"}catch(e){}
  const actCols=()=>innerWidth<=640?1:innerWidth<=1100?2:3;
  function actsBody(S){const I=actItems(S),T=teach(),ic=k=>(GRP.find(g=>g[0]===k)||[])[2]||"",gn=k=>{const g=GRP.find(x=>x[0]===k);return g?(CA?g[1]:g[0]):k};
    const res=x=>T?"":x.v!=null&&!x.cp?`<span class="lsn-r" style="--rc:${pcCol(x.v*100)}">${(Math.round(x.v*100)/10).toLocaleString(CA?"ca":"en")} / 10</span>`
      :x.done?`<span class="lsn-r ok">✓ ${t("Fet","Done")}</span>`:x.part&&x.part[0]?`<span class="lsn-r">${x.part[0]} / ${x.part[1]}</span>`:`<span class="lsn-r todo">${t("Per fer","To do")}</span>`;
    const row=(x,meta)=>`<li><a href="${esc(x.h)}"><span class="lsn-at"><b>${esc(x.t)}</b>${x.s?`<small>${esc(x.s)}</small>`:""}${meta?`<em>${esc(meta)}</em>`:""}</span>${res(x)}<span class="lsn-open">${t("Obre","Open")} ›</span></a></li>`;
    const avg=L=>{const vs=L.filter(x=>x.v!=null&&!x.cp).map(x=>x.v);return vs.length?vs.reduce((x,y)=>x+y,0)/vs.length*100:null};
    const card=(head,L,meta)=>{const av=avg(L);return {n:L.length,h:`<section class="lsn-card lsn-sk"><h3><span>${head}</span>${!T&&av!=null?`<span class="lsn-av" style="--rc:${pcCol(av)}">${Math.round(av)} %</span>`:""}</h3><ul>${L.map(x=>row(x,meta(x))).join("")}</ul></section>`}};
    let cards;
    if(AV==="order"){const by=[];I.forEach(x=>{let c=by.find(y=>y.a===x.a);if(!c)by.push(c={a:x.a,L:[]});c.L.push(x)});
      cards=by.map(c=>card(esc(c.L[0].lp),c.L,x=>x.cp?"":ic(x.grp)+" "+(x.sn||gn(x.grp))))}
    else cards=GRP.map(([k,ca,i])=>{const L=I.filter(x=>x.grp===k);return L.length?card(i+" "+esc(CA?ca:k),L,x=>x.m):null}).filter(Boolean);
    if(!cards.length)return `<p class="lsn-none">${t("El professor obrirà les activitats a classe, quan toqui.","Your teacher will open the activities in class, when it is time.")}</p>`;
    // no gaps (Roger, 26 Nov 2026: "I dont want the blank spaces here"): each card goes under the shortest column so far, in reading order
    const n=ACT_N=actCols(),col=Array.from({length:n},()=>({h:0,s:""}));
    // 🔢 In order reads down each column, then the next one (learning paths in a row); 🧩 By skill fills the shortest column
    const hOf=c=>c.n*2.6+3,tot=cards.reduce((x,c)=>x+hOf(c),0);let k=0;
    cards.forEach((c,i)=>{if(AV==="order"){if(k<n-1&&col[k].h&&col[k].h+hOf(c)/2>tot/n)k++}else k=col.reduce((b,x,j)=>x.h<col[b].h?j:b,0);col[k].s+=c.h;col[k].h+=hOf(c)});
    return `<div class="lsn-acts" data-n="${n}">${col.map(c=>`<div class="lsn-col">${c.s}</div>`).join("")}</div>`}
    function actsSection(S){ACT_S=S;const T=teach();
    const sw=`<span class="lsn-view" role="group" aria-label="${t("Ordena les activitats","Order the activities")}">`
      +[["skill","🧩",t("Per destreses","By skill")],["order","🔢",t("En ordre","In order")]].map(([v,i,l])=>`<button type="button" data-do="lsview" data-v="${v}" aria-pressed="${AV===v}">${i} ${l}</button>`).join("")+`</span>`;
    return `<div class="lsn-ah"><h2>📋 ${t("Activitats","Activities")}</h2><span class="lsn-sub">${T?"Each student sees their own result in each activity.":AV==="order"
      ?t("En l'ordre de cada learning path · el teu resultat a cada una","In the order of each learning path · your result in each"):t("Per destreses · el teu resultat a cada una","Grouped by skill · your result in each")}</span>${sw}</div>`
      +`<div id="lsnActs">${actsBody(S)}</div>`}
  document.addEventListener("click",e=>{const b=e.target.closest('[data-do="lsview"]');if(!b||!ACT_S)return;AV=b.dataset.v;try{localStorage.setItem("el_ls_actview",AV)}catch(x){}
    simpleHome()});
  addEventListener("resize",()=>{const n=actCols(),b=$("#lsnActs");if(!b||!ACT_S||n===ACT_N)return;ACT_N=n;b.innerHTML=actsBody(ACT_S)});

  function simpleHome(){if(!SIMPLE)return;
    const home=$('[data-place="home"]'),head=home&&home.querySelector(".lshead");if(!head)return;
    document.body.classList.add("lss");
    let w=$("#lsSimple");if(!w){w=document.createElement("div");w.id="lsSimple";w.className="lsn";head.after(w)}
    const S0=source(),S=ST?status():{all:true,closed:false,open:()=>true,dropped:[],rows:acts().map(a=>({a})),can:a=>stepsOf(a)};
    const num=window.elLsNum?elLsNum(ls):"";
    const fp=S0.chal?`<a class="lsn-fp" href="${esc(S0.chal.h)}"><span class="lsn-k">🏆 ${t("Producte final","Final product")}</span><b>${esc(S0.chal.b)}</b><span class="lsn-go">${t("Mira què has de fer","See what to do")} →</span></a>`:"";
    const band=`<header class="lsn-band"><div class="lsn-bt"><span class="lsn-eye">${esc(CN[COURSE]||"")}${num?" · "+esc(num):""}</span><h1>${esc(lsName(ls))}</h1>${S0.q?`<p>${esc(S0.q)}</p>`:""}</div>${fp}</header>`;
    const aims=S0.aims.length?`<section class="lsn-card lsn-aims"><h2>🎯 ${t("Què aprendràs","What you will learn")}</h2><ul>${S0.aims.map(o=>`<li><span class="lsn-ai" aria-hidden="true">${esc(o.i)}</span><span><b>${esc(o.v)}</b> ${esc(o.p)}</span></li>`).join("")}</ul></section>`:"";
    const crit=S0.crit.length?`<section class="lsn-card lsn-crit"><h2>📏 ${t("Com t'avaluarem","How you will be assessed")}</h2>`
      +S0.crit.map(c=>`<details class="lsn-cr ${esc(c.k)}"><summary>${c.chip}<span class="lsn-crt"><b>${esc(c.sk)}</b> · ${esc(c.d)}</span></summary>${c.off?`<p>${esc(c.off)}</p>`:""}</details>`).join("")
      +`<p class="lsn-tip">${t("Toca un criteri per llegir-lo sencer ›","Tap a criterion to read its full text ›")}</p></section>`:"";
    w.innerHTML=band+`<div class="lsn-two">${aims}${crit}</div><div class="lsn-two">${gvCard("grammar",S)}${gvCard("vocab",S)}</div>`+actsSection(S);
    if(window.elRouteFix)try{elRouteFix(w)}catch(e){}
  }
  document.addEventListener("elmygames",()=>{if(SIMPLE)simpleHome()});   // el-notes.js has read the class games
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
    who=AS?{role:"as",uid:AS.uid}:C.isTeacher(u)?{role:"teacher"}:C.isTester(u)&&!C.viewGroup()?{role:"tester"}:{role:"student",uid:u.uid};
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
    who=A&&A.uid?{role:"as",uid:A.uid}:{role:W.role,uid:W.uid};
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
