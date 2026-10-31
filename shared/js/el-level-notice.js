// "Your level" (Roger, 30 Oct 2026: students "receive a notification with the level adjudicated, and from now on, if I ever change a level
// students need to receive a notification"). Every route the teacher sets on the dashboard (setLevel, setLevels in teacher.html) writes
// students/{uid}/levels/{ls}.changed (server time), .was (the route before) and .why ("exam": from the LS1 exam box). On every page that
// loads el-cloud.js, a student whose latest teacher-set route in their course is newer than students/{uid}.levelSeen[course] gets a card
// once, in the language of the new route (Catalan for Starter and Base). "Got it" saves levelSeen[course] = that time.
// Only the latest change counts: two changes before the student signs in give one card, with the latest level.

// lv() → {lsId: levels doc}, seen() → students/{uid}.levelSeen or {}, save(course, ms).
export async function levelNotice({lv,seen,save,course}){
  const L=(window.EL_LS||[]).filter(l=>l.course===course),ms=x=>x&&x.toMillis?x.toMillis():typeof x==="number"?x:0;
  let docs,was;try{[docs,was]=await Promise.all([lv(),seen()])}catch(e){console.warn("level notice",e);return}
  let last=null;
  for(const l of L){const d=(docs||{})[l.id];if(!d||!d.level||d.by==="student"||!ms(d.changed))continue;
    if(!last||ms(d.changed)>ms(last.d.changed))last={l,d}}
  if(!last||ms(last.d.changed)<=((was||{})[course]||0))return;
  const at=ms(last.d.changed),N=id=>((window.EL_LEVELS||[]).find(x=>x.id===id)||{}).name||id;
  const lvl=last.d.level,before=last.d.was&&last.d.was!==lvl?last.d.was:null,en=!(window.elCa?elCa(lvl):lvl==="beginners"||lvl==="insecure");
  const n="LS"+(L.indexOf(last.l)+1),ls=n+" · "+last.l.title.replace(/^\S+ · /,"");
  // the title names course, route and CEFR level, e.g. "2ESO Starter (A1)" (Roger, 31 Oct 2026; elLevelLabel in el-catalog.js)
  const full=window.elLevelLabel?elLevelLabel(course,lvl):N(lvl);
  const title=before?(en?`🧭 Your level has changed: ${full}`:`🧭 Has canviat de nivell: ${full}`):(en?`🧭 Your level: ${full}`:`🧭 El teu nivell: ${full}`);
  const why=last.d.why==="exam"?(en?"Your teacher has set your level from your LS1 exam mark. ":"El professor t'ha posat el nivell a partir de la nota de l'examen de la LS1. "):"";
  const body=why+(en?`From ${ls} on, you work at ${N(lvl)} level${before?` (before: ${N(before)})`:""}. Your activities and Learning Paths follow this level, and the work you have already done is kept.`
    :`A partir de la ${ls}, treballes al nivell ${N(lvl)}${before?` (abans: ${N(before)})`:""}. Les teves activitats i els Learning Paths segueixen aquest nivell, i la feina que ja has fet es manté.`);
  const show=()=>{
    const c=document.createElement("div");c.id="el-level-notice";c.setAttribute("role","status");
    c.style.cssText="position:fixed;top:16px;left:50%;transform:translateX(-50%);width:min(440px,calc(100vw - 24px));box-sizing:border-box;z-index:10004;background:#fff;color:#0f172a;border:2px solid #0f766e;border-radius:16px;box-shadow:0 10px 30px #0003;padding:14px 16px;font:15px/1.45 system-ui,sans-serif";
    c.innerHTML='<b style="display:block;font-size:17px;margin-bottom:4px"></b><p style="margin:0 0 10px"></p><small style="display:block;color:#64748b;margin-bottom:10px">'+(en?"From your teacher":"Del teu professor")+"</small>"
      +'<button type="button" style="border:0;background:#0f766e;color:#fff;border-radius:999px;padding:6px 18px;font:inherit;font-weight:600;cursor:pointer"></button>';
    c.querySelector("b").textContent=title;c.querySelector("p").textContent=body;
    const b=c.querySelector("button");b.textContent=en?"Got it":"D'acord";
    b.onclick=()=>{c.remove();Promise.resolve(save(course,at)).catch(e=>console.warn("level notice",e))};
    document.body.append(c);b.focus({preventScroll:true})};
  // one card at a time: after the teacher's answers to problem reports (el-reply.js) and the exam results card (el-exam-notice.js)
  const wait=()=>document.getElementById("el-reply")||document.getElementById("el-corrections")||document.getElementById("el-exam-notice")?setTimeout(wait,600):show();
  wait();
}
