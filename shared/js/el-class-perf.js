// 📈 Class performance (Roger, 14 Nov 2026: "if a student is in class mode but doesn't do the activities, once I finish the class and say
// what I did and what I didn't, I want a predetermined message (that the web sends automatically, not you) telling them today you've done
// x% of the activities, please keep up"; and "I want to have this information on the students table … Class performance").
// When the end-of-class window (el-cm-agenda.js wrapUp) is saved, for every student who was in class mode (beat live/{group}/here/{email}
// after the class mode started) this works out how many of the steps the teacher ticked ✔ Finished they have done (their saved
// progress, the same done steps as the dashboard), saves it in classPerf/{group}_{day}_{start} (teacher only) for the dashboard's
// Class performance column, and, with ✉️ ticked, emails each student their result in Roger's voice, English then Catalan, from the
// school address through the school mail script (the same relay and teacher sign-in as the dashboard's emails: one email each).
// Reads (once, at the end of a class): the group's here documents, students and student list (about 30 each) and each present student's
// progress of the LS(s) of today's steps (about 30). No reads at any other time.
const MAIL_URL="https://script.google.com/macros/s/AKfycbyG8C2d9UN7Ped1Z3MfjRR_k3WCPpWiXVI2m3FFpuW9MUD8OLh9epTwsYrcR0RkrN0GIA/exec";   // as teacher.html
// who gets the email (Roger, 14 Nov 2026: "students below 90 %" and "also students who did 100% a message telling well done"): less than
// BELOW % of the ✔ Finished steps gets "please keep up", all of them gets "well done", 90-99 % gets nothing
export const BELOW=90;
export const getsMail=r=>r.of>0&&(r.n>=r.of||r.n/r.of*100<BELOW);
const SLACK=2*60e3;   // a beat up to 2 minutes before class mode started still counts (the student was already on the page)
const MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],MCA=["gen.","febr.","març","abr.","maig","juny","jul.","ag.","set.","oct.","nov.","des."];
const DEN=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],DCA=["dg.","dl.","dt.","dc.","dj.","dv.","ds."];
const dayEn=d=>{const x=new Date(d+"T12:00");return DEN[x.getDay()]+" "+x.getDate()+" "+MON[x.getMonth()]};
const dayCa=d=>{const x=new Date(d+"T12:00");return DCA[x.getDay()]+" "+x.getDate()+" "+MCA[x.getMonth()]};
const H=t=>String(t==null?"":t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);

// The step keys (EL_ACTIONS) a planned item asks for: a tab's own steps (elSecSteps: the Vocabulary tab = its study cards and sentences),
// the whole learning path for "path#" (a recall checkpoint), and for the 📖 Book the chapter due that day (the n-th day "path#book" is on
// the agenda = chapter n, as ELWeek counts it) or "path#ch2" itself. Steps the path does not score (a.skip) are left out. [] = not counted.
export function stepKeys(a,p,ag,day){const all=((window.EL_ACTIONS||{})[a.id]||[]).filter(k=>!(a.skip||[]).includes(k));
  if(!p)return all;
  if(window.elBookPath&&elBookPath(a)){if(/^ch\d+$/.test(p))return all.includes(p)?[p]:[];
    const n=Object.keys((ag&&ag.days)||{}).filter(d=>d<=day&&(ag.days[d]||[]).includes(a.id+"#book")).length;return n&&all[n-1]?[all[n-1]]:[]}
  return (window.elSecSteps?elSecSteps(a,p):[p]).filter(k=>all.includes(k))}
const doneSet=(a,pg)=>{const s=new Set();(a.keys||[]).forEach(k=>{if(pg&&pg[k]&&window.elDoneSet)elDoneSet(pg[k]).forEach(x=>s.add(x))});return s};

// the emails, in Roger's voice (never a word about who writes them); left = names of the steps still to do
export function mailText(o){const {first,n,of,left,day,link}=o,pc=of?Math.round(n/of*100):0,all=n>=of;
  const hi=first?" "+first:"";
  const subject=all?`English Lab · ${dayEn(day)}: all of today's class activities done 🎉`:`English Lab · ${dayEn(day)}: ${n} of ${of} class activities done`;
  const en=all?[`Hi${hi},`,``,`Well done! In today's English class (${dayEn(day)}) you did all ${of} class activities (100%). Keep it up!`]
    :[`Hi${hi},`,``,`In today's English class (${dayEn(day)}) you did ${n} of the ${of} class activities (${pc}%).`,
      `Still to do: ${left.join(", ")}.`,``,`You can still do them on English Lab: ${link}`,
      `Please keep up with the class activities. I know you can do it!`];
  const ca=all?[`Hola${hi},`,``,`Molt bé! A la classe d'anglès d'avui (${dayCa(day)}) has fet totes les ${of} activitats de classe (100%). Continua així!`]
    :[`Hola${hi},`,``,`A la classe d'anglès d'avui (${dayCa(day)}) has fet ${n} de les ${of} activitats de classe (${pc}%).`,
      `Et falta: ${left.join(", ")}.`,``,`Encara les pots fer a English Lab: ${link}`,
      `Intenta seguir el ritme de les activitats de classe. Sé que ho pots fer!`];
  const body=[...en,``,`Roger`,``,`— — —`,``,...ca,``,`Roger`].join("\n");
  const p=ls=>ls.map(l=>l?`<p style="margin:0 0 8px">${H(l).replace(H(link),`<a href="${H(link)}">${H(link)}</a>`).replace(/(\d+ (?:of|de) (?:the |les )?\d+ (?:class activities|activitats de classe) \(\d+%\)|all \d+ class activities \(100%\)|totes les \d+ activitats de classe \(100%\))/,"<b>$1</b>")}</p>`:"").join("");
  const html=`<div style="font:15px/1.5 Arial,sans-serif;color:#1e293b;max-width:560px">${p(en)}<p style="margin:0 0 18px">Roger</p><hr style="border:0;border-top:1px solid #e2e8f0;margin:0 0 18px">${p(ca)}<p style="margin:0">Roger</p></div>`;
  return {subject,body,html}}

// ctx (from el-cm-agenda.js): db, doc, setDoc, getDocs, collection, query, where, serverTimestamp, token (the teacher's idToken),
// tester(email), root, g, gname, s (class mode start). steps: [{a, p, it, n (name), ag (that LS's agenda)}] = today's ✔ Finished steps.
// say(text) shows how far it is. → {saved, present, below, sent, failed}
export async function run(ctx,steps,day,mail,say){say=say||(()=>{});
  // the Book names its chapter ("📖 The book · chapter 2"), so the student knows which one
  const C=ctx,list=steps.map(z=>{const ks=stepKeys(z.a,z.p,z.ag,day),ch=window.elBookPath&&elBookPath(z.a)&&ks.length===1&&/^ch(\d+)$/.exec(ks[0]);
    return Object.assign({},z,{ks,n:ch&&!/chapter/i.test(z.n)?z.n+" · chapter "+ch[1]:z.n})}).filter(z=>z.ks.length);
  if(!list.length)return {saved:false,present:0,below:0,sent:0,failed:0};
  say("Working out each student's class activities…");
  const [here,studs,ro]=await Promise.all([C.getDocs(C.collection(C.db,"live",C.g,"here")),C.getDocs(C.query(C.collection(C.db,"students"),C.where("group","==",C.g))),
    C.getDocs(C.query(C.collection(C.db,"roster"),C.where("group","==",C.g))).catch(()=>null)]);
  const ms=t=>t&&t.toMillis?t.toMillis():typeof t==="number"?t:0;
  const inCls=new Set(here.docs.filter(d=>ms(d.data().seen)>=C.s-SLACK).map(d=>d.id.toLowerCase()));
  const first={};if(ro)ro.docs.forEach(d=>{const r=d.data();first[d.id.toLowerCase()]=r.first||""});
  const who=studs.docs.map(d=>Object.assign({uid:d.id},d.data())).filter(s=>s.email&&inCls.has(String(s.email).toLowerCase())&&!(C.tester&&C.tester(String(s.email).toLowerCase())));
  const lss=[...new Set(list.map(z=>z.a.ls))];
  const rows=await Promise.all(who.map(async s=>{const pg={};
    await Promise.all(lss.map(async ls=>{try{const x=await C.getDoc(C.doc(C.db,"students",s.uid,"progress",ls));pg[ls]=x.exists()?x.data().data||{}:{}}catch(e){pg[ls]={}}}));
    const did=list.filter(z=>{const d=doneSet(z.a,pg[z.a.ls]);return z.ks.every(k=>d.has(k))});
    const e=String(s.email).toLowerCase(),nm=s.name||e.split("@")[0];
    return {e,uid:s.uid,name:nm,first:first[e]||String(nm).split(" ")[0]||"",n:did.length,of:list.length,left:list.filter(z=>!did.includes(z)).map(z=>z.n)}}));
  rows.sort((x,y)=>x.n/x.of-y.n/y.of||x.name.localeCompare(y.name));
  const id=C.g+"_"+day+"_"+C.s,ref=C.doc(C.db,"classPerf",id);
  const rec={group:C.g,day,s:C.s,at:C.serverTimestamp(),steps:list.map(z=>({it:z.it,n:z.n,ls:z.a.ls})),rows:rows.map(({e,uid,name,n,of,left})=>({e,uid,name,n,of,left}))};
  await C.setDoc(ref,rec);
  const to=rows.filter(getsMail),out={saved:true,present:rows.length,below:rows.filter(r=>r.n/r.of*100<BELOW).length,all:rows.filter(r=>r.n>=r.of).length,sent:0,failed:0};
  if(!mail||!to.length){if(rows.length)await C.setDoc(ref,{mail:{on:!!mail,sent:0,failed:0}},{merge:true}).catch(()=>{});return out}
  const tok=await C.token(),link=new URL("today.html",C.root).href,bad=[];let k=0;
  const one=async r=>{const m=mailText({first:r.first,n:r.n,of:r.of,left:r.left,day,link});
    try{const x=await fetch(MAIL_URL,{method:"POST",headers:{"content-type":"text/plain"},body:JSON.stringify({idToken:tok,to:[r.e],subject:m.subject,body:m.body,html:m.html,name:"Roger Beltran · English Lab"})});
      const j=await x.json();if(j&&j.ok)out.sent++;else{out.failed++;bad.push(r.e+": "+((j&&j.error)||"no answer"))}}
    catch(e){out.failed++;bad.push(r.e+": the school mail script did not answer")}
    say(`✉️ Emailing students… ${++k} of ${to.length}`)};
  say(`✉️ Emailing students… 0 of ${to.length}`);
  for(let i=0;i<to.length;i+=4)await Promise.all(to.slice(i,i+4).map(one));   // 4 at a time: quick, and kind to the script
  await C.setDoc(ref,{mail:{on:true,sent:out.sent,failed:out.failed,to:to.map(r=>r.e),err:bad.slice(0,10)}},{merge:true}).catch(()=>{});
  return out}
