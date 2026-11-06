// LS home page (LS2 on) in the board's style (Roger, 6 Nov 2026: "Redesign the LS so that they fit the new students and teacher design
// and students go from the dashboard to the ls and the ls to the dashboard"). shared/css/ls-home.css draws it.
// The page holds the content (head, learning paths as <ol class="lps"> of <a class="lp" data-a="activity id">, tiles and the places
// <section data-place="study|about|final">); this file adds:
// - the side menu of the board (today.html): My activities (the teacher: Dashboard), this LS, All Learning Situations, English Lab,
//   Practise, Help; on a phone the board's bottom bar; a ‹ back link at the top to the board or the dashboard;
// - places by hash (#study, #about, #final) with a ‹ back link to the LS home, as the board's places;
// - the Continue card (the first open learning path not done, in the order of the group's time plan, or the checkpoint it needs first)
//   and each learning path's progress (✓ done, steps done, 🔒 not open yet, ✂ dropped), from the progress el-cloud.js already copied
//   into this browser, the LS document it already read (ELCloud.lsNow) and the results it already read: no new Firestore reads;
// - Catalan for Starter and Base (data-ca on the static labels), English for Core, Plus, Pro, the teacher and testers.
// Preview: window.EL_DEMO_LS = {role:"student"|"teacher", group, level, info:{status, open:{group:[ids]}}, pg:{key:json}, rs:{}} before this file.
(function(){
  const LS=document.body.dataset.ls,ROOT=new URL("../../",location.href).href,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const ls=(window.EL_LS||[]).find(l=>l.id===LS)||{id:LS,course:LS.split("-")[0],title:document.title};
  const COURSE=ls.course,CN={"2eso":"2 ESO","4eso":"4 ESO"},lsName=l=>l.title.replace(/^\S+ · /,"");
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
    const a=(h,txt,cls,cur)=>`<a class="nv${cls?" "+cls:""}" href="${h}"${cur?' aria-current="page"':""}>${txt}</a>`;
    let html;
    if(teach()||who.role==="tester"){
      const first=teach()?a(dashHref(),"📊 Dashboard"):a(boardHref(),"🏠 My activities");
      html=first+`<div class="nvsep"></div>`+["2eso","4eso"].map(c=>`<div class="nvh">${CN[c]}</div>`+a(ROOT+c+"/index.html",CN[c]+" · Learning Situations","sub")
        +(window.EL_LS||[]).filter(l=>l.course===c).map((l,i)=>a(lsHref(l),"LS"+(i+1)+" · "+esc(lsName(l)),"sub"+(l.id===LS?" on":""),l.id===LS)).join("")).join("")
        +`<div class="nvsep"></div>`+a(ROOT+"lab/","English Lab")+a(ROOT+"lab/practice.html",t("Practica","Practise"));
    }else{
      html=a(boardHref(),"🏠 "+t("Les meves activitats","My activities"))
        +a("index.html","📚 "+esc(lsName(ls)),"on",true)
        +a(ROOT+COURSE+"/index.html",t("Totes les Learning Situations","All Learning Situations"),"sub")
        +a(ROOT+"lab/","English Lab")+a(ROOT+"lab/practice.html",t("Practica","Practise"))
        +a(ROOT+"today.html#help","❓ "+t("Ajuda","Help"));
    }
    $$(".nvs,.nvs-m").forEach(n=>n.innerHTML=html);
    const stu=!teach()&&who.role!=="tester";document.body.classList.toggle("stu",stu);
    const b=$("#bnav");if(b)b.innerHTML=stu?[["","🏠",t("Inici","Home")],["#todo","✅",t("Per fer","To do")],["#homework","📝",t("Deures","Homework")],["#marks","📊",t("Notes","Marks")],[null,"📚","LS"],["#help","❓",t("Ajuda","Help")]]
      .map(([h,i,l])=>h===null?`<a class="on" aria-current="page" href="#"><i>${i}</i>${l}</a>`:`<a href="${boardHref()}${h}"><i>${i}</i>${l}</a>`).join(""):"";
  }
  // ---- places (#study, #about, #final): the board's rule, little on the menu and the details inside each place
  const PLACES=["study","about","final"];
  function place(){
    const p=PLACES.includes(location.hash.slice(1))?location.hash.slice(1):"home";
    $$("[data-place]").forEach(s=>s.hidden=s.dataset.place!==p);
    const c=$("#crumb");
    if(c)c.innerHTML=p==="home"?`<a class="back" href="${teach()?dashHref():boardHref()}">‹ ${teach()?"Dashboard":t("Les meves activitats","My activities")}</a>`
      :`<a class="back" href="#">‹ ${esc(lsName(ls))}</a>`;
    if(p!=="home")window.scrollTo(0,0);
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
    let next=null;
    if(!all&&!closed)for(const {a} of rows){if(a.manual||dropped.includes(a.id)||!open(a)||!stepsOf(a).length||done(a))continue;
      const cp=elCheckpointMissing(a,doneOf,open);next=cp?{a:cp,cp:true}:{a};break}
    return {open,done,dropped,next,all,closed};
  }
  // Students see only the learning paths the teacher has opened for their group (Roger, 6 Nov 2026: "I don't want students to see the
  // future LP as depending on the time left they might not do them"): not open yet and dropped ones are left out; the teacher and testers see all.
  function lpRows(S){
    let shown=0;
    $$("a.lp[data-a]").forEach(el=>{const li=el.closest("li")||el;li.hidden=false;
      const a=acts().find(x=>x.id===el.dataset.a),st=el.querySelector(".st")||el.appendChild(Object.assign(document.createElement("span"),{className:"st"}));
      el.classList.remove("done","locked","nextup","dropped");st.className="st";st.innerHTML="";
      if(!a||teach()){st.innerHTML=t("Obre","Open")+" →";shown++;return}
      if(!S.all&&(S.dropped.includes(a.id)||!S.open(a))){li.hidden=true;return}
      shown++;
      const ks=stepsOf(a),ds=doneOf(a),n=ks.filter(k=>ds.has(k)).length,isNext=S.next&&S.next.a.id===a.id;
      const cp=!S.all&&!S.closed&&!a.manual&&elCheckpointMissing(a,doneOf,S.open);
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
      +`<div class="cs">Students see their own progress on this page: ✓ done, steps done, 🔒 not open yet, and their next learning path.</div><a class="cgo" href="${dashHref()}">📊 Open ${esc(lsName(ls))} on the dashboard</a>`;c.hidden=false;return}
    if(S.closed){c.className="cont done";c.innerHTML=`<div class="ct">${t("Aquesta LS ja està tancada","This LS is closed")}</div><div class="cs">${t("Pots repassar el que vas fer i el feedback del professor.","You can review what you did and your teacher's feedback.")}</div><a class="cgo" href="${boardHref()}#marks">📊 ${t("Les meves notes","My marks")} →</a>`;c.hidden=false;return}
    if(S.all){c.hidden=true;return}
    const nx=S.next;
    if(!nx){c.className="cont done";c.innerHTML=`<div class="ct">✓ ${t("Ho tens tot fet!","You're all done!")}</div><div class="cs">${t("No tens res pendent als learning paths oberts.","Nothing left to do in the open learning paths.")}</div><a class="cgo" href="${ROOT}lab/practice.html">${t("Practica pel teu compte","Practise on your own")} →</a>`;c.hidden=false;return}
    const ks=stepsOf(nx.a),ds=doneOf(nx.a),n=ks.filter(k=>ds.has(k)).length,num=lpNum(nx.a),title=nx.a.title.replace(/\s*\(warm-up\)$/,"");
    c.className="cont";
    c.innerHTML=`<div class="ck">${n?t("Continua on ho vas deixar","Continue where you left off"):t("El següent learning path","Your next learning path")}</div><div class="ct">${num&&/^\d+$/.test(num)?"LP"+num+" · ":""}${esc(title)}</div>`
      +`<div class="cs">${nx.cp?t("Primer fes aquest checkpoint, sense apunts: obre el que ve després.","First do this checkpoint, without notes: it opens what comes next."):t("El learning path et marca el pas que toca.","The learning path shows you the next step.")}</div>`
      +(ks.length?`<div class="crow"><div class="cbar"><span style="width:${Math.round(n/ks.length*100)}%"></span></div><span class="cn">${n} / ${ks.length} ${t("passos","steps")}</span></div>`:"")
      +`<a class="cgo" href="${href(nx.a)}">▶ ${n?t("Continua","Continue"):t("Comença","Start")}</a>`;
    c.hidden=false;
  }
  function draw(){
    lang();nav();place();
    if(ST){const S=status();lpRows(S);contCard(S)}
  }
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
  let tries=0;(function wait(){if(window.ELCloud&&ELCloud.onUser){ELCloud.onUser(u=>fromCloud(u).catch(e=>console.warn("ls home",e)));return}
    if(++tries<300)setTimeout(wait,100)})();
})();
