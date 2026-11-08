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
    const vis=a=>{const ks=stepsOf(a);if(all||closed)return ks;const ds=doneOf(a),off=elSecLockedFor(a,info,g,ds);
      return ks.filter(k=>ds.has(k)||!(off.includes(k)||((k==="cards"||k==="practice")&&off.includes("vocab"))))};
    let next=null;
    if(!all&&!closed)for(const {a} of rows){if(a.manual||dropped.includes(a.id)||!open(a)||done(a)||!vis(a).some(k=>!doneOf(a).has(k)))continue;
      const cp=elCheckpointMissing(a,doneOf,open);next=cp?{a:cp,cp:true}:{a};break}
    return {open,done,dropped,next,all,closed,vis};
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
    if(teach()){c.className="cont teach";c.innerHTML=`<div class="ck">Teacher view</div><div class="ct">Every learning path is open for you</div>`
      +`<div class="cs">Students see only the learning paths you have opened for them, with ✓ done, steps done and their next one (never anything locked).</div><a class="cgo" href="${dashHref()}">📊 Open ${esc(lsName(ls))} on the dashboard</a>`;c.hidden=false;return}
    if(S.closed){c.className="cont done";c.innerHTML=`<div class="ct">${t("Aquesta LS ja està tancada","This LS is closed")}</div><div class="cs">${t("Pots repassar el que vas fer i el feedback del professor.","You can review what you did and your teacher's feedback.")}</div><a class="cgo" href="${boardHref()}#marks">📊 ${t("Les meves notes","My marks")} →</a>`;c.hidden=false;return}
    if(S.all){c.hidden=true;return}
    const nx=S.next;
    if(!nx){c.className="cont done";c.innerHTML=`<div class="ct">✓ ${t("Ho tens tot fet!","You're all done!")}</div><div class="cs">${t("No tens res pendent als learning paths oberts.","Nothing left to do in the open learning paths.")}</div><a class="cgo" href="${ROOT}lab/practice.html">${t("Practica pel teu compte","Practise on your own")} →</a>`;c.hidden=false;return}
    const ks=elTabGroups(nx.a,S.vis(nx.a)),ds=doneOf(nx.a),n=ks.filter(g=>g.every(k=>ds.has(k))).length,num=lpNum(nx.a),title=nx.a.title.replace(/\s*\(warm-up\)$/,"");
    c.className="cont";
    c.innerHTML=`<div class="ck">${n?t("Continua on ho vas deixar","Continue where you left off"):t("El següent learning path","Your next learning path")}</div><div class="ct">${num&&/^\d+$/.test(num)?"LP"+num+" · ":""}${esc(title)}</div>`
      +`<div class="cs">${nx.cp?t("Primer fes aquest checkpoint, sense apunts: obre el que ve després.","First do this checkpoint, without notes: it opens what comes next."):t("El learning path et marca el pas que toca.","The learning path shows you the next step.")}</div>`
      +(ks.length?`<div class="crow"><div class="cbar"><span style="width:${Math.round(n/ks.length*100)}%"></span></div><span class="cn">${n} / ${ks.length} ${t("passos","steps")}</span></div>`:"")
      +`<a class="cgo" href="${href(nx.a)}">▶ ${n?t("Continua","Continue"):t("Comença","Start")}</a>`;
    c.hidden=false;
  }
  function draw(){
    lang();nav();place();
    // 📈 My formative assessment tile (Roger, 7 Nov 2026: "instead of study, my formative assessment"): the board's formative tab of this LS
    $$("[data-el-formative]").forEach(e=>{const b=boardHref();e.href=b+(b.includes("?")?"&":"?")+"ls="+encodeURIComponent(LS)+"#formative"});
    if(ST){const S=status();lpRows(S);contCard(S)}
    document.dispatchEvent(new Event("ellshome"));   // el-notes.js draws again in the right language
  }
  window.ELLsHome={ca:()=>CA};
  window.addEventListener("hashchange",place);
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
    let info={},rs={};
    try{info=await (C.lsNow||C.lsInfo)(LS)}catch(e){}
    if(who.role!=="teacher")try{for(const r of Object.values(await C.results()))if(r&&r.activity)rs[r.activity]=r}catch(e){}
    const pg={[LS]:pgOf()};try{elInjectCorrected(pg,rs)}catch(e){}   // steps the teacher corrected count as done, as on the board
    ST={info,group:C.group(),pg:pg[LS],rs};
    draw();
  }
  const D=window.EL_DEMO_LS;
  if(D){who={role:D.role||"student",uid:"demo"};CA=D.role!=="teacher"&&(!D.level||elCa(D.level));
    if(D.pg)for(const k in D.pg)localStorage.setItem(k,D.pg[k]);
    const pg={[LS]:pgOf()};try{elInjectCorrected(pg,D.rs||{})}catch(e){}
    ST={info:D.info||{status:"open"},group:D.group,pg:pg[LS],rs:D.rs||{}};draw();
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
      ST={info:info||{},group:who.role==="as"?(A.group||null):W.group||null,pg:pg[LS],rs};
    }
    if(who.role==="teacher")$$("[data-el-teacher]").forEach(e=>e.hidden=false);
    draw();
  })();
  // <html class="elgate">: the page shows now, on this drawing (ls-home.css); nobody signed in on this browser: once Firebase knows (el-cloud.js)
  document.documentElement.classList.add((()=>{try{return localStorage.getItem("el_who")}catch(e){return null}})()?"elready":"elwait");
  let tries=0;(function wait(){if(window.ELCloud&&ELCloud.onUser){ELCloud.onUser(u=>fromCloud(u).catch(e=>console.warn("ls home",e)));return}
    if(++tries<300)setTimeout(wait,100)})();
})();
