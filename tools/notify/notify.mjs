// Teacher emails (Roger, 1 Nov 2026: "when I have messages as a teacher on the app, that I receive a mail" … "a mail on Saturday with that info
// would be enough" … "if it's free, receiving notifications on my mail is not a bad idea"). Run by .github/workflows/teacher-emails.yml:
//   --instant (every 15 minutes in the day): the ⚠️ Problem reports (problems) and 💡 Ideas (suggestions) sent since the last check, in one email.
//   no flag (Saturday morning, after the Friday 19:37 marking audit): ONE email with
//     1. the class sessions not ticked, per group: the same list as the dashboard's "⚠ Weekend check" (pending() in teacher.html: sessions before
//        today, not ticked in teacherPlan/{group}.ticks, not set as homework, not "Homework by …", "moved to" or self-study lines). Left
//        alone they move to next week's list (↪), so the email suggests ticking them or 🏠 Set as homework.
//     2. the problem reports not marked as fixed and the ideas of the last 7 days.
// Nothing to say: no email. Sent from the school account (SCHOOL_MAIL_URL, see lib.mjs) or else Gmail (GMAIL_APP_PASSWORD) to ALERT_EMAIL_TO (default
// roger.beltranps@gmail.com); no password: it does nothing. See lib.mjs. Free (GitHub Actions in a public repo), no Claude.
// The Action log is public (the repo is public): counts only, never names or text.
//   node tools/notify/notify.mjs [--instant] [--dry]    --dry: nothing sent, the email goes to notify-dry.eml in the temp folder
//   node tools/notify/notify.mjs --test                  a short test email now (nothing read)
//   EL_TODAY=YYYY-MM-DD pretends today is that day; with --instant, NOTIFY_STATE is the last-check file.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {E,ARGS,DRY,SITE,TZ,SCHOOL,GMAIL,TEACHER_TO,sendMail as send,site,firestore} from "./lib.mjs";

const TEST=ARGS.includes("--test"),INSTANT=ARGS.includes("--instant"),FROM=SCHOOL.ok?SCHOOL:GMAIL.pass?GMAIL:null;
if(!FROM&&!DRY){console.log("No SCHOOL_MAIL_URL, SCHOOL_APP_PASSWORD or GMAIL_APP_PASSWORD: teacher emails are off, nothing to do.");process.exit(0)}
const sendMail=async(subject,text)=>{await send(FROM||SCHOOL,TEACHER_TO,subject,text);console.log(DRY?"Dry run: email written.":"Email sent.")};
if(TEST){await sendMail("English Lab: test email ✅","This is a test. You will get an email when a student sends a ⚠️ Problem report or a 💡 Idea, and every Saturday morning one email with the sessions you did not tick and the week's open reports and ideas (no email when there is nothing).\n\nDashboard: "+SITE+"teacher.html\n");process.exit(0)}

const W=site(["el-catalog.js","el-plan.js","el-week.js"]),WK=W.ELWeek,TODAY=WK.today();
const db=await firestore(),since=db.since;

const KIND={media:"🔊 Audio or video does not play",stuck:"⛔ Cannot go on",marking:"❌ Correct answer marked wrong",display:"🖥️ Page looks wrong",other:"❓ Something else"};
const GROUP=Object.fromEntries(W.EL_GROUPS.map(g=>[g.id,g.name]));
const ROUTE={beginners:"Starter",insecure:"Base",safe:"Core",daring:"Plus",native:"Pro"};
const time=d=>new Date(d).toLocaleString("en-GB",{timeZone:TZ,weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});
const n=(k,one,many)=>k+" "+(k===1?one:many);
const who=x=>[x.name||x.email||"Someone",GROUP[x.group]||x.group,ROUTE[x.route]].filter(Boolean).join(" · ");
const block=(x,head,where)=>[head,"   "+who(x)+" · "+time(x.created),where?"   📍 "+where:"",x.text?"   “"+String(x.text).trim().replace(/\s*\n\s*/g," / ")+"”":""].filter(Boolean).join("\n");

const probBlock=x=>block(x,"• "+(KIND[x.kind]||x.kind||"Problem")+(x.shot?" (with a screenshot)":""),[x.title||x.page,x.section].filter(Boolean).join(" › "))+"\n";
const ideaBlock=x=>block(x,"• Idea",x.page)+"\n";

// ---- instant mode (--instant, every 15 minutes in the day; Roger, 1 Nov 2026: "if it's free, receiving notifications on my mail is not a bad
// idea"): the problem reports and ideas created since the last check, in one email. The last check is a small file (NOTIFY_STATE) the Action
// keeps in its cache (the service account can only read Firestore); no file: look back 20 minutes, a little more than one run.
if(INSTANT){
  const STATE=E.NOTIFY_STATE||path.join(os.tmpdir(),"notify-state.json"),now=new Date(Date.now()-5000).toISOString();   // 5 s back: a report being written now waits for the next run
  let last;try{last=JSON.parse(fs.readFileSync(STATE,"utf8")).lastAt}catch(e){}
  if(!last){last=new Date(Date.now()-20*60000).toISOString();console.log("No saved last check: looking back 20 minutes.")}
  const t=d=>new Date(d).getTime(),inWin=x=>t(x.created)>t(last)&&t(x.created)<=t(now);
  const [probs,ideas]=(await Promise.all([since("problems",last),since("suggestions",last)])).map(l=>l.filter(inWin));
  console.log("New since the last check: "+probs.length+" problem report(s), "+ideas.length+" idea(s).");   // counts only: the log is public
  if(probs.length||ideas.length){
    const out=[];
    if(probs.length)out.push("⚠️ NEW PROBLEM REPORTS","",...probs.map(probBlock),"Open them: "+SITE+"teacher.html#probs","");
    if(ideas.length)out.push("💡 NEW IDEAS","",...ideas.map(ideaBlock),"Open them: "+SITE+"teacher.html","");
    out.push("—","English Lab checks every 15 minutes from 7:00 to 23:00. Students do not see this email.");
    await sendMail("English Lab: "+[probs.length?n(probs.length,"new problem report","new problem reports"):"",ideas.length?n(ideas.length,"new idea","new ideas"):""].filter(Boolean).join(" and "),out.join("\n"))}
  if(!DRY)fs.writeFileSync(STATE,JSON.stringify({lastAt:now}));
  process.exit(0);
}

// ---- 1. sessions not ticked (the same rules as pending() in teacher.html)
const ticks={},hw={};
await Promise.all(W.EL_GROUPS.map(async g=>{ticks[g.id]=(await db.get("teacherPlan/"+g.id)||{}).ticks||{}}));
const plans=W.EL_GROUPS.map(g=>{const n=WK.now(g.id);return n?Object.assign({gid:g.id,name:g.name},n):null}).filter(Boolean);
await Promise.all([...new Set(plans.map(x=>x.ls))].map(async ls=>{hw[ls]=(await db.get("ls/"+encodeURIComponent(ls))||{}).homework||{}}));
const lines=(x,r)=>String(r.g?r.g[x.gi]||"":r.what||"").split("\n").filter(Boolean);
const lineDate=(r,l)=>{const m=/^\w{3} (\d{1,2})\b/.exec(l);if(!m||!r.from)return null;for(let j=0;j<7;j++){const d=WK.add(r.from,j);if(+d.slice(8)===+m[1])return d}return null};
const ticked=(x,l)=>!!ticks[x.gid][x.ls+"|"+l];
const hwLine=(x,l)=>Object.values((hw[x.ls]||{})[x.gid]||{}).some(h=>h&&h.line===l);
const pending=x=>x.p.rows.flatMap((r,i)=>lines(x,r).filter(l=>{const d=lineDate(r,l);return d&&d<TODAY&&!ticked(x,l)}).map(line=>({i,line})))
  .filter(y=>!/^Homework by /.test(y.line)&&!/\bmoved to\b|· self-study\b/.test(y.line)&&!hwLine(x,y.line));
const behind=plans.map(x=>[x,pending(x)]).filter(([,ps])=>ps.length);
const nBehind=behind.reduce((a,[,ps])=>a+ps.length,0);

// ---- 2. problem reports and ideas of the last 7 days
const weekAgo=new Date(Date.now()-7*864e5).toISOString();
const [allProbs,ideas]=await Promise.all([since("problems",weekAgo),since("suggestions",weekAgo)]);
const probs=allProbs.filter(x=>!x.fixed),nFixed=allProbs.length-probs.length;   // the ones already marked as fixed need nothing
console.log("Today "+TODAY+": "+nBehind+" session(s) not ticked, "+probs.length+" open problem report(s), "+ideas.length+" idea(s) this week.");   // counts only: the log is public
if(!nBehind&&!probs.length&&!ideas.length){console.log("Nothing to send.");process.exit(0)}

const out=["Good morning! Here is your English Lab week.",""];
if(nBehind)out.push("⚠ SESSIONS NOT TICKED ("+nBehind+")","Tick the ones you did. For the others, 🏠 Set as homework so students do them at home, or leave them: they move to next week's list.","",
  ...behind.flatMap(([x,ps])=>[x.name+":",...ps.map(y=>"   ☐ "+y.line),""]),"Open the Time plan: "+SITE+"teacher.html","");
if(probs.length)out.push("⚠️ PROBLEM REPORTS THIS WEEK ("+probs.length+")","",...probs.map(probBlock),(nFixed?"("+n(nFixed,"more report","more reports")+" this week already marked as fixed.)\n":"")+"Open them: "+SITE+"teacher.html#probs","");
if(ideas.length)out.push("💡 IDEAS THIS WEEK ("+ideas.length+")","",...ideas.map(ideaBlock),"Open them: "+SITE+"teacher.html","");
out.push("—","English Lab sends this every Saturday morning, only when there is something. Students do not see it.");
const subj=[nBehind?n(nBehind,"session","sessions")+" not ticked":"",probs.length?n(probs.length,"problem report","problem reports"):"",ideas.length?n(ideas.length,"idea","ideas"):""].filter(Boolean);
await sendMail("English Lab · your week: "+subj.join(", "),out.join("\n"));
