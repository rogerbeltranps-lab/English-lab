// Teacher emails (Roger, 1 Nov 2026: "when I have messages as a teacher on the app, that I receive a mail" … "a mail on Saturday with that info
// would be enough" … "if it's free, receiving notifications on my mail is not a bad idea"). Run by .github/workflows/teacher-emails.yml:
//   --instant (every 15 minutes in the day): the ⚠️ Problem reports (problems), 💡 Ideas (suggestions) and ✉️ students' answers to your private
//   messages (announcements with sAt, Roger 7 Nov 2026) sent since the last check, in one email; and, in its own "⚠️ IMPORTANT" email, the
//   reports Claude fixed by itself since then (problems/{id}.auto, tools/problems/auto.mjs, Roger 8 Nov 2026).
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
  const [probs,ideas]=(await Promise.all([since("problems",last),since("suggestions",last)])).map(l=>l.filter(inWin).filter(x=>!x.teacher));   // not Roger's own reports: he wrote them
  // answers to private messages: sAt (server time) is the student's last reply; the email quotes their answers since your last one (at most 3)
  const tail=th=>{const i=th.map(x=>x.by).lastIndexOf("t");return th.slice(i+1).filter(x=>x.by==="s").slice(-3)};
  const answers=(await since("announcements",last,"sAt")).filter(a=>t(a.sAt)>t(last)&&t(a.sAt)<=t(now)).map(a=>Object.assign(a,{newOnes:tail(a.thread||[])})).filter(a=>a.newOnes.length);
  // reports Claude fixed by itself (Roger, 8 Nov 2026: "I must be informed though via mail, with an important subject"): problems/{id}.auto
  // written by tools/problems/auto.mjs (verdict "fixed", at = when). Their own email, an ⚠️ IMPORTANT subject, sent first.
  const autoFixed=(await since("problems",last,"auto.at")).filter(x=>x.auto&&x.auto.verdict==="fixed"&&t(x.auto.at)>t(last)&&t(x.auto.at)<=t(now));
  if(autoFixed.length){
    const ns=autoFixed.filter(x=>!x.teacher).length,out=["Claude fixed "+n(autoFixed.length,"problem report","problem reports")+" by itself"+(ns?" and answered the student"+(ns>1?"s":"")+" for you":"")+":",""];
    autoFixed.forEach(x=>{out.push(block(x,"• "+(KIND[x.kind]||x.kind||"Problem"),[x.title||x.page,x.section].filter(Boolean).join(" › ")),"   🔧 "+String(x.auto.note||"").trim());
      const m=(x.msgs||[]).filter(y=>y.fix).pop();out.push(x.teacher?"   👨‍🏫 Your own report: hard reload the page (Ctrl+Shift+R) to see it fixed.":"   💬 The student got: ✅ Fixed!"+(m?" + “"+String(m.text).trim()+"”":""),"")});
    out.push("Check them or reopen one: "+SITE+"teacher.html#probs","","—","Only technical problems are fixed automatically; everything else stays in ⚠️ Problem reports for you. Students do not see this email.");
    await sendMail("⚠️ IMPORTANT · English Lab: "+n(autoFixed.length,"problem report","problem reports")+" fixed automatically",out.join("\n"))}
  console.log("New since the last check: "+probs.length+" problem report(s), "+ideas.length+" idea(s), "+answers.length+" answer(s), "+autoFixed.length+" fixed automatically.");   // counts only: the log is public
  if(probs.length||ideas.length||answers.length){
    const out=[];
    if(answers.length)out.push("✉️ ANSWERS TO YOUR MESSAGES","",...answers.map(a=>["• "+(a.label||"A student")+" answered your message",
      "   You wrote: “"+String(a.text||"").trim().replace(/\s*\n\s*/g," / ").slice(0,200)+"”",
      ...a.newOnes.map(x=>"   "+time(x.at)+": “"+String(x.text).trim().replace(/\s*\n\s*/g," / ")+"”")].join("\n")+"\n"),"Answer them: "+SITE+"teacher.html (💬 Messages)","");
    if(probs.length)out.push("⚠️ NEW PROBLEM REPORTS","",...probs.map(probBlock),"Open them: "+SITE+"teacher.html#probs","");
    if(ideas.length)out.push("💡 NEW IDEAS","",...ideas.map(ideaBlock),"Open them: "+SITE+"teacher.html","");
    out.push("—","English Lab checks every 15 minutes from 7:00 to 23:00. Students do not see this email.");
    await sendMail("English Lab: "+[answers.length?n(answers.length,"answer to your messages","answers to your messages"):"",probs.length?n(probs.length,"new problem report","new problem reports"):"",ideas.length?n(ideas.length,"new idea","new ideas"):""].filter(Boolean).join(" and "),out.join("\n"))}
  if(!DRY)fs.writeFileSync(STATE,JSON.stringify({lastAt:now}));
  process.exit(0);
}

// ---- 1. sessions not ticked (the same rules as pending() in teacher.html)
const ticks={},hw={};
await Promise.all(W.EL_GROUPS.map(async g=>{ticks[g.id]=(await db.get("teacherPlan/"+g.id)||{}).ticks||{}}));
const plans=W.EL_GROUPS.map(g=>{const n=WK.now(g.id);return n?Object.assign({gid:g.id,name:g.name},n):null}).filter(Boolean);
const pe={};
await Promise.all([...new Set(plans.map(x=>x.ls))].map(async ls=>{const d=await db.get("ls/"+encodeURIComponent(ls))||{};hw[ls]=d.homework||{};pe[ls]=d.planEdits||{};if(d.planEdits)WK.applyEdits(ls,d.planEdits)}));   // sessions moved on the dashboard
// past class days of the agenda count as done (ELWeek.autoTicks, as on the dashboard): only what is still on an old day of a group without an agenda shows here
const agOf=(ls,gid)=>{const s=((pe[ls]||{})[gid]||{}).agenda;if(!s)return null;try{return typeof s==="string"?JSON.parse(s):s}catch(e){return null}};
plans.forEach(x=>WK.autoTicks(x.ls,agOf(x.ls,x.gid),ticks[x.gid],TODAY));
const lines=(x,r)=>String(r.g?r.g[x.gi]||"":r.what||"").split("\n").filter(Boolean);
const lineDate=(r,l)=>{const m=/^\w{3} (\d{1,2})\b/.exec(l);if(!m||!r.from)return null;for(let j=0;j<7;j++){const d=WK.add(r.from,j);if(+d.slice(8)===+m[1])return d}return null};
const ticked=(x,l)=>{const o=((x.p._moved||{})[x.gi]||{})[l],a=((x.p._added||{})[x.gi]||{})[l];return !!(ticks[x.gid][x.ls+"|"+l]||o&&ticks[x.gid][x.ls+"|"+o.orig]||a&&ticks[x.gid][x.ls+"|"+a.key])};   // a moved session keeps a tick given before the move
const hwLine=(x,l)=>Object.values((hw[x.ls]||{})[x.gid]||{}).some(h=>h&&h.line===l);
const pending=x=>x.p.rows.flatMap((r,i)=>lines(x,r).filter(l=>{const d=lineDate(r,l);return d&&d<TODAY&&!ticked(x,l)}).map(line=>({i,line})))
  .filter(y=>!/^Homework by /.test(y.line)&&!/\bmoved to\b|· self-study\b/.test(y.line)&&!hwLine(x,y.line));
const behind=plans.map(x=>[x,pending(x)]).filter(([,ps])=>ps.length);
const nBehind=behind.reduce((a,[,ps])=>a+ps.length,0);

// ---- 2. problem reports and ideas of the last 7 days
const weekAgo=new Date(Date.now()-7*864e5).toISOString();
const [allProbs,ideas]=await Promise.all([since("problems",weekAgo),since("suggestions",weekAgo)]);
const probs=allProbs.filter(x=>!x.fixed),nFixed=allProbs.length-probs.length;   // the ones already marked as fixed need nothing
// ---- 3. website problems found by the weekly site check (Roger, 1 Nov 2026: "send me a mail if theres any prob"). The check runs on Saturday
// at 5:45 Madrid time, before this email, and opens a GitHub issue labelled site-check for each problem it finds; Roger closes it when it is fixed.
let siteIssues=[];
try{
  const r=await fetch("https://api.github.com/repos/rogerbeltranps-lab/English-lab/issues?labels=site-check&state=open&per_page=50",
    {headers:Object.assign({Accept:"application/vnd.github+json"},E.GITHUB_TOKEN?{Authorization:"Bearer "+E.GITHUB_TOKEN}:{})});
  if(r.ok)siteIssues=(await r.json()).filter(x=>!x.pull_request);else console.log("Site check issues: GitHub answered "+r.status+".");
}catch(e){console.log("Site check issues: could not reach GitHub.")}
console.log("Today "+TODAY+": "+nBehind+" session(s) not ticked, "+probs.length+" open problem report(s), "+ideas.length+" idea(s) this week, "+siteIssues.length+" website problem(s).");   // counts only: the log is public
if(!nBehind&&!probs.length&&!ideas.length&&!siteIssues.length){console.log("Nothing to send.");process.exit(0)}

const out=["Good morning! Here is your English Lab week.",""];
if(nBehind)out.push("⚠ SESSIONS NOT TICKED ("+nBehind+")","Tick the ones you did. For the others, 🏠 Set as homework so students do them at home, or leave them: they move to next week's list.","",
  ...behind.flatMap(([x,ps])=>[x.name+":",...ps.map(y=>"   ☐ "+y.line),""]),"Open the Time plan: "+SITE+"teacher.html","");
if(probs.length)out.push("⚠️ PROBLEM REPORTS THIS WEEK ("+probs.length+")","",...probs.map(probBlock),(nFixed?"("+n(nFixed,"more report","more reports")+" this week already marked as fixed.)\n":"")+"Open them: "+SITE+"teacher.html#probs","");
if(ideas.length)out.push("💡 IDEAS THIS WEEK ("+ideas.length+")","",...ideas.map(ideaBlock),"Open them: "+SITE+"teacher.html","");
if(siteIssues.length)out.push("🛠️ WEBSITE PROBLEMS FOUND BY THE WEEKLY CHECK ("+siteIssues.length+")","",...siteIssues.map(x=>"• "+x.title+"\n   "+x.html_url+"\n"),"Close each one on GitHub when it is fixed.","");
out.push("—","English Lab sends this every Saturday morning, only when there is something. Students do not see it.");
const subj=[nBehind?n(nBehind,"session","sessions")+" not ticked":"",probs.length?n(probs.length,"problem report","problem reports"):"",ideas.length?n(ideas.length,"idea","ideas"):"",siteIssues.length?n(siteIssues.length,"website problem","website problems"):""].filter(Boolean);
await sendMail("English Lab · your week: "+subj.join(", "),out.join("\n"));
