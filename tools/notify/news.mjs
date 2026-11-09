// Students' "new on your board" email (Roger, 6 Nov 2026: "how can I make students receive mails when I give them homework, announcements
// or feedback like reading or exams and final product results?"). Homework and announcements are emailed by the dashboard itself, at the
// moment the teacher sets or sends them (teacher.html mailStudents). This script does the results, which the dashboard does not write
// (exam marks, final product marks and the Wednesday corrections come from the marking tools): once a day (.github/workflows/teacher-emails.yml,
// about 16:30 Madrid, after the Wednesday 15:00 marking and the Friday 15:00 answers), and by hand (Run workflow > new results to students),
// one email per student with what is new since the last run:
//   📝 exam results ready (every section of results/{ls}__assessment has a mark, as the board's exam card) or changed
//   🎬 the final product mark (EL_GRADING[ls].fp.a with a score, or the assessment's progress.fp)
//   ✏️ corrections and marking feedback (results.replies), 💬 answers to their comments (results.answers[step].at), answers to problem reports
// Pointers only: they read the marks and the words on their board. Language as on the board (Catalan Starter, Base, no route; English
// Core, Plus, Pro), written as the teacher, never mentions AI. Only school (@ietramuntana.cat) emails, never the tester; nothing new: no email.
// The last run's time is kept in the Actions cache (NEWS_STATE); no file: look back 24 hours. The log is public: counts only.
//   node tools/notify/news.mjs [--dry]   --dry: nothing sent, emails go to notify-dry.eml in the temp folder
//   node tools/notify/news.mjs --test    the email of the first student with news (looking back 7 days), sent to the teacher instead
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {E,ARGS,DRY,SITE,SCHOOL,TEACHER_TO,ROOT,sendMail,site,firestore} from "./lib.mjs";

const TEST=ARGS.includes("--test"),DOMAIN="@ietramuntana.cat",CA_ROUTES=["beginners","insecure"];
if(!SCHOOL.ok&&!DRY){console.log("No SCHOOL_MAIL_URL: students' emails are off, nothing to do.");process.exit(0)}
const STATE=E.NEWS_STATE||path.join(os.tmpdir(),"news-state.json"),now=new Date(Date.now()-60000).toISOString();
// What each student was last told about, as small signatures (the dashboard rewrites results docs often, so "updated" alone is not news):
// {lastAt, sig: {uid: {"x:ls": exam marks, "f:ls": final product mark, "r:activity:step": hash of the correction, "a:activity:step": answer time}}}.
// No saved state (first run, or the cache expired): this run only takes note of everything, and sends nothing.
let st=null;try{st=JSON.parse(fs.readFileSync(STATE,"utf8"))}catch(e){}
const BASE=!st&&!TEST&&!ARGS.includes("--all"),last=st&&st.lastAt||new Date(Date.now()-7*864e5).toISOString(),old=TEST?{}:(st&&st.sig)||{},sig={};
const t=d=>d?new Date(d).getTime():0,isNew=d=>t(d)>t(last)&&t(d)<=t(now),hash=x=>crypto.createHash("sha1").update(String(x)).digest("hex").slice(0,10);
if(BASE)console.log("No saved state: taking note of what students already have, sending nothing.");
const W=site(["el-catalog.js","el-grading.js","el-sections.js"]),G=W.EL_GRADING||{};
const TESTERS=JSON.parse((/TESTERS=(\[[^\]]*\])/.exec(fs.readFileSync(path.join(ROOT,"shared/js/el-firebase.js"),"utf8"))||[,"[]"])[1]);
const db=await firestore();
const roster=Object.fromEntries(await db.list("roster"));
const studs=(await db.list("students")).map(([uid,s])=>{const em=String(s.email||"").toLowerCase(),r=roster[em]||{};return {uid,email:em,group:r.group||s.group,first:r.first||String(s.name||"").split(/[ ,]/).filter(Boolean).pop()||""}})
  .filter(s=>s.email.endsWith(DOMAIN)&&!TESTERS.includes(s.email)&&W.EL_GROUPS.some(g=>g.id===s.group));
const lsDoc={},hidden=async ls=>{if(!(ls in lsDoc))lsDoc[ls]=await db.get("ls/"+encodeURIComponent(ls))||{};return lsDoc[ls].status==="hidden"};
const pReplies=(await db.since("problemReplies",last)).filter(x=>isNew(x.created));
const act=id=>W.EL_CATALOG.find(a=>a.id===id)||null,stepName=(a,k)=>(((a&&a.steps)||[]).find(([s])=>s===k)||((W.EL_SECTIONS||{})[a&&a.id]||[]).find(([s])=>s===k)||[,k])[1];   // the page's own tab name
const lsName=ls=>{const l=W.EL_LS.find(x=>x.id===ls);if(!l)return ls;return "LS"+(W.EL_LS.filter(x=>x.course===l.course).indexOf(l)+1)+" · "+l.title.replace(/^\S+ · /,"")};
const fpOf=Object.fromEntries(Object.entries(G).filter(([,g])=>g.fp&&g.fp.a).map(([ls,g])=>[g.fp.a,ls]));
const full=(e,sc)=>e.sections.every(([k])=>sc&&sc[k]&&sc[k].score!=null&&sc[k].score!=="");

let sent=0,none=0;
for(const s of studs){
  const lvs=Object.fromEntries(await db.list("students/"+s.uid+"/levels")),news=[],was=old[s.uid]||{},now_=sig[s.uid]={};
  const res=(await db.list("students/"+s.uid+"/results")).map(([,r])=>r);
  const lang=res.some(r=>{const v=r.ls&&W.elRouteOf(lvs,r.ls).level;return v&&!CA_ROUTES.includes(v)})?"en":"ca",ca=lang==="ca",T=(c,e)=>ca?c:e;   // one level for every LS
  const note=(k,v,item)=>{if(v==null)return;now_[k]=v;if(was[k]!==v)news.push(item)};
  const fp={};
  for(const r of res){
    if(r.ls&&await hidden(r.ls)){Object.keys(was).forEach(k=>{if(k.includes(r.ls))now_[k]=was[k]});continue}   // an LS students cannot see yet: tell them when it opens
    const a=act(r.activity),title=a?a.title:r.activity||"",q="?ls="+encodeURIComponent(r.ls||"");
    if(r.activity===r.ls+"/assessment"){const g=G[r.ls]||{};
      if(g.exam&&full(g.exam,r.sections))note("x:"+r.ls,g.exam.sections.map(([k])=>r.sections[k].score).join(","),["📝",(was["x:"+r.ls]?T("Han canviat els resultats de l'examen: ","Your exam results have changed: "):T("Resultats de l'examen: ","Exam results: "))+lsName(r.ls),q+"#exam"]);
      if(r.progress&&r.progress.fp!=null&&fp[r.ls]==null)fp[r.ls]=Math.round(r.progress.fp*10)/10;
      continue}
    if(fpOf[r.activity]&&r.score!=null&&r.max){fp[fpOf[r.activity]]=Math.round(r.score/r.max*100)/10;continue}
    Object.entries(r.answers||{}).forEach(([k,x])=>{if(x&&x.t&&x.at)note("a:"+r.activity+":"+k,String(x.at),["💬",T("Resposta al teu comentari: ","Answer to your comment: ")+title+" · "+stepName(a,k),""])});
    Object.entries(r.replies||{}).forEach(([k,x])=>{if(String(x||"").trim())note("r:"+r.activity+":"+k,hash(x),["✏️",T("Correcció: ","Correction: ")+title+" · "+stepName(a,k),""])});
  }
  Object.entries(fp).forEach(([ls,m])=>note("f:"+ls,String(m),["🎬",T("Nota del producte final: ","Final product mark: ")+lsName(ls),"?ls="+encodeURIComponent(ls)]));
  if(BASE)continue;
  const pr=pReplies.filter(x=>x.uid===s.uid);if(pr.length)news.push(["🛠",T("Resposta al problema que em vas enviar","Answer to the problem you sent me")+(pr.length>1?" ("+pr.length+")":""),""]);
  const seen=new Set(),list=news.filter(([,x])=>!seen.has(x)&&seen.add(x));
  if(!list.length){none++;continue}
  const out=[T("Hola ","Hi ")+s.first+",","",T("Tens coses noves al teu tauler d'English Lab:","There is something new on your English Lab board:"),"",
    ...list.map(([i,x,q])=>i+" "+x+(q?"\n   "+SITE+"today.html"+q:"")),"",
    T("Entra amb el teu correu de l'institut: ","Sign in with your school email: ")+SITE+"today.html","","Roger"];
  const subject=list.some(([i])=>i==="📝")?T("English Lab: ja tens els resultats de l'examen","English Lab: your exam results are ready")
    :list.some(([i])=>i==="🎬")?T("English Lab: ja tens la nota del producte final","English Lab: your final product mark is ready")
    :T("English Lab: tens correccions i respostes noves","English Lab: new corrections and answers for you");
  await sendMail(SCHOOL,TEST?TEACHER_TO:[s.email],subject,out.join("\n"),"Roger Beltran · English Lab");sent++;
  if(TEST)break;
  if(!DRY)await new Promise(r=>setTimeout(r,300));   // gently, under Google's sending limits
}
if(!TEST&&(!DRY||E.NEWS_STATE))fs.writeFileSync(STATE,JSON.stringify({lastAt:now,sig}));   // a dry run keeps it only when NEWS_STATE is given (to try it)
if(BASE)console.log("Noted "+studs.length+" students.");else console.log((DRY?"Dry run: ":"")+sent+" student email(s) "+(DRY?"written":TEST?"sent to the teacher as a test":"sent")+", "+none+" with nothing new.");   // counts only: the log is public
