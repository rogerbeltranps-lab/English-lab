// Students' Sunday summary (Roger, 1 Nov 2026: "the same for the students. However they can't receive mails outside of the school domain";
// chose "Weekly summary on Sunday"). Run by .github/workflows/teacher-emails.yml every Sunday evening: one email per student, from the
// teacher's school account (SCHOOL_APP_PASSWORD, see lib.mjs; school accounts only receive mail from the school domain), with
//   1. their homework and self-study classes for the coming week (Mon to Sun): ELWeek.upcoming with the plan's lines and the homework the
//      teacher set from the dashboard (ls/{id}.homework[group]), exactly what the student board lists;
//   2. what the teacher answered or corrected in the last 7 days, as pointers only (activity · step): answers to their comments
//      (results.answers[step].at), corrections and marking feedback (results.replies[step] on a results doc updated this week) and answers to
//      their problem reports (problemReplies). They read the words on their board.
// Language as on the board: Catalan for Starter, Base and no route; English for Core, Plus and Pro. Written as the teacher, never mentions AI.
// Only signed-in students with a school (@ietramuntana.cat) email, never the tester; nothing to say: no email.
// The Action log is public: counts only, never names or emails.
//   node tools/notify/students.mjs [--dry]     --dry: nothing sent, every email goes to notify-dry.eml in the temp folder
//   node tools/notify/students.mjs --test       the email of one student, sent to the teacher (ALERT_EMAIL_TO) instead, to check it
//   EL_TODAY=YYYY-MM-DD pretends today is that day (a Sunday: the summary is for the next Monday to Sunday).
import fs from "node:fs";
import path from "node:path";
import {ARGS,DRY,SITE,SCHOOL,TEACHER_TO,ROOT,sendMail,site,firestore} from "./lib.mjs";

const TEST=ARGS.includes("--test"),DOMAIN="@ietramuntana.cat";
if(!SCHOOL.pass&&!DRY){console.log("No SCHOOL_APP_PASSWORD: students' emails are off, nothing to do.");process.exit(0)}
const W=site(["el-catalog.js","el-plan.js","el-week.js"]),WK=W.ELWeek,TODAY=WK.today();
const wd=new Date(TODAY+"T12:00").getDay(),MON=WK.add(TODAY,wd===0?1:wd===6?2:(8-wd)%7||7);   // the next Monday
const TESTERS=JSON.parse((/TESTERS=(\[[^\]]*\])/.exec(fs.readFileSync(path.join(ROOT,"shared/js/el-firebase.js"),"utf8"))||[,"[]"])[1]);
const CA_ROUTES=["beginners","insecure"];
const db=await firestore(),weekAgo=new Date(Date.now()-7*864e5).toISOString(),recent=d=>d&&new Date(d)>=new Date(weekAgo);

const roster=Object.fromEntries(await db.list("roster"));
const studs=(await db.list("students")).map(([uid,s])=>{const em=String(s.email||"").toLowerCase(),r=roster[em]||{};return {uid,email:em,group:r.group||s.group,first:r.first||String(s.name||"").split(/[ ,]/).filter(Boolean).pop()||""}})
  .filter(s=>s.email.endsWith(DOMAIN)&&!TESTERS.includes(s.email)&&W.EL_GROUPS.some(g=>g.id===s.group));
const lsInfo={},plans={};
for(const g of W.EL_GROUPS)plans[g.id]=WK.now(g.id);
await Promise.all([...new Set(Object.values(plans).filter(Boolean).map(x=>x.ls))].map(async ls=>{lsInfo[ls]=await db.get("ls/"+encodeURIComponent(ls))||{}}));
const pReplies=await db.since("problemReplies",weekAgo);
const act=id=>W.EL_CATALOG.find(a=>a.id===id)||null;
const stepName=(a,k)=>((a&&a.steps)||[]).find(([s])=>s===k)?.[1]||k;

let sent=0,skipped=0;
for(const s of (TEST?studs.slice(0,1):studs)){
  const plan=plans[s.group],ls=plan&&plan.ls;
  const lvs=Object.fromEntries(await db.list("students/"+s.uid+"/levels")),route=ls?W.elRouteOf(lvs,ls).level:null,ca=!route||CA_ROUTES.includes(route),lang=ca?"ca":"en",T=(c,e)=>ca?c:e;
  // 1. the coming week
  const tasks=plan&&lsInfo[ls]&&lsInfo[ls].status!=="hidden"?WK.upcoming(plan.p,plan.gi,MON,6,(lsInfo[ls].homework||{})[s.group]):[];
  // 2. the teacher's answers and corrections this week
  const news=[];
  for(const [,r] of await db.list("students/"+s.uid+"/results")){const a=act(r.activity),title=a?a.title:r.activity||"";
    Object.entries(r.answers||{}).forEach(([k,x])=>{if(x&&recent(x.at))news.push(T("Resposta al teu comentari: ","Answer to your comment: ")+title+" · "+stepName(a,k))});
    if(recent(r.updated))Object.keys(r.replies||{}).forEach(k=>{const m=(r.marked||{})[k];if(!m||recent(m))news.push(T("Correcció: ","Correction: ")+title+" · "+stepName(a,k))})}
  const pr=pReplies.filter(x=>x.uid===s.uid);if(pr.length)news.push(T("Resposta al problema que em vas enviar","Answer to the problem you sent me")+(pr.length>1?" ("+pr.length+")":""));
  const uniq=[...new Set(news)];
  if(!tasks.length&&!uniq.length){skipped++;continue}
  const out=[T("Hola ","Hi ")+s.first+",","",T("Això és el que tens aquesta setmana a English Lab:","This is your English Lab week:"),""];
  if(tasks.length)out.push(T("🏠 DEURES I CLASSES PEL TEU COMPTE","🏠 HOMEWORK AND CLASSES ON YOUR OWN"),...tasks.map(x=>"• "+WK.taskText(x,lang)),"");
  if(uniq.length)out.push(T("✉️ T'HE CONTESTAT O CORREGIT","✉️ I ANSWERED OR CORRECTED"),...uniq.map(x=>"• "+x),T("Ho tens tot al teu tauler.","It is all on your board."),"");
  out.push(T("Entra amb el teu correu de l'institut: ","Sign in with your school email: ")+SITE+"today.html","",T("Bona setmana!","Have a good week!"),"Roger");
  const subject=T("English Lab: la teva setmana del "+WK.date(MON,"ca"),"English Lab: your week from "+WK.date(MON,"en"));
  sendMail(SCHOOL,TEST?TEACHER_TO:[s.email],subject,out.join("\n"),"Roger Beltran · English Lab");sent++;
  if(!DRY)await new Promise(r=>setTimeout(r,300));   // gently, under Google's sending limits
}
console.log((DRY?"Dry run: ":"")+sent+" student email(s) "+(DRY?"written":TEST?"sent to the teacher as a test":"sent")+", "+skipped+" with nothing this week.");   // counts only: the log is public
