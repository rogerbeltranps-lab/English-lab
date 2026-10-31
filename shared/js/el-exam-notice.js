// "Your exam results are ready" (Roger, 30 Oct 2026: "I want students to receive a notification that they have their exam results on
// their dashboard"). On every page that loads el-cloud.js, a student whose exam of an LS (EL_GRADING[ls].exam) has a mark in every section
// gets a card once: "See my results →" opens the board on that LS with the exam open (today.html?ls=…#exam). The marks the student has
// been told about are saved as students/{uid}.examSeen[ls] = the marks in one string, so new marks (for example corrected ones) bring
// the card back as "updated". "Later" hides it until the browser is closed. Nothing is shown for an LS the student's board does not list
// (hidden, or not assigned to the group), nor for an exam with a section still empty (the teacher may be typing the marks).
const sig=(e,sc)=>e.sections.map(([k,,mx])=>{const s=sc[k];return s&&s.score!=null&&s.score!==""?k+":"+s.score+"/"+(s.max||mx||e.max):null});

// get(ls) → the assessment record or null, seen() → students/{uid}.examSeen or {}, save(ls,sig), visible(ls) → the board lists the LS.
export async function examNotice({get,seen,save,visible,course,en,board}){
  const G=window.EL_GRADING||{},L=(window.EL_LS||[]).filter(l=>l.course===course&&G[l.id]&&G[l.id].exam&&G[l.id].only);   // only LSs whose board shows the exam (onlyView in today.html)if(!L.length)return;
  let was;try{was=await seen()||{}}catch(e){console.warn("exam notice",e);return}
  const todo=[];
  for(const l of L){
    let r;try{r=await get(l.id)}catch(e){continue}
    const s=sig(G[l.id].exam,(r&&r.sections)||{});if(s.includes(null))continue;   // no exam yet, or not every section entered
    const v=s.join(",");if(was[l.id]===v)continue;
    let later=null;try{later=sessionStorage.getItem("el_exam_later_"+l.id)}catch(e){}
    if(later===v||!(await visible(l.id).catch(()=>false)))continue;
    todo.push({l,v,again:!!was[l.id]});
  }
  const next=()=>{
    const o=todo.shift();if(!o)return;
    const n="LS"+((window.EL_LS||[]).filter(x=>x.course===course).indexOf(o.l)+1),name=n+" · "+o.l.title.replace(/^\S+ · /,"");
    const title=o.again?(en?`📝 Your ${n} exam results have changed`:`📝 Han canviat els resultats de l'examen de la ${n}`)
      :(en?`📝 Your ${n} exam results are ready!`:`📝 Ja tens els resultats de l'examen de la ${n}!`);
    const body=o.again?(en?`Your teacher has updated your exam marks for ${name}. Have a look at them on your board.`:`El professor ha actualitzat les notes de l'examen de la ${name}. Mira-les al teu tauler.`)
      :(en?`Your teacher has put your exam marks for ${name} on your board. Have a look at your mark and at your exam by criteria.`:`El professor ha posat les notes de l'examen de la ${name} al teu tauler. Mira la teva nota i l'examen per criteris.`);
    const c=document.createElement("div");c.id="el-exam-notice";c.setAttribute("role","status");
    c.style.cssText="position:fixed;top:16px;left:50%;transform:translateX(-50%);width:min(440px,calc(100vw - 24px));box-sizing:border-box;z-index:10004;background:#fff;color:#0f172a;border:2px solid #2563eb;border-radius:16px;box-shadow:0 10px 30px #0003;padding:14px 16px;font:15px/1.45 system-ui,sans-serif";
    c.innerHTML='<b style="display:block;font-size:17px;margin-bottom:4px"></b><p style="margin:0 0 10px"></p><small style="display:block;color:#64748b;margin-bottom:10px">'+(en?"From your teacher":"Del teu professor")+"</small>"
      +'<a style="display:inline-block;background:#0f766e;color:#fff;border-radius:999px;padding:6px 18px;font-weight:600;text-decoration:none;margin-right:8px"></a>'
      +'<button type="button" style="border:1px solid #cbd5e1;background:#fff;color:#334155;border-radius:999px;padding:6px 16px;font:inherit;cursor:pointer"></button>';
    c.querySelector("b").textContent=title;c.querySelector("p").textContent=body;
    const a=c.querySelector("a"),b=c.querySelector("button");
    a.textContent=en?"See my results →":"Mira els resultats →";a.href=board+"?ls="+encodeURIComponent(o.l.id)+"#exam";
    // save before leaving the page; on the board itself the link only changes the hash, so reload to open that LS
    a.onclick=ev=>{ev.preventDefault();c.remove();const go=()=>{const u=new URL(a.href,location.href);if(u.pathname===location.pathname&&u.search===location.search){history.replaceState(null,"",u.href);location.reload()}else location.href=u.href};
      Promise.resolve(save(o.l.id,o.v)).catch(e=>console.warn("exam notice",e)).then(go)};
    b.textContent=en?"Later":"Més tard";
    b.onclick=()=>{c.remove();try{sessionStorage.setItem("el_exam_later_"+o.l.id,o.v)}catch(e){}next()};
    document.body.append(c);a.focus({preventScroll:true})};
  const wait=()=>document.getElementById("el-reply")||document.getElementById("el-corrections")||document.getElementById("el-level-notice")?setTimeout(wait,600):next();   // after the teacher's answers to problem reports (el-reply.js) and the level card (el-level-notice.js)
  wait();
}
