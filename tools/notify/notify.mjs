// Teacher emails: the Saturday email (Roger, 1 Nov 2026: "when I have messages as a teacher on the app, that I receive a mail" … "receive a mail
// on Saturday with that info would be enough"). Run by .github/workflows/teacher-emails.yml every Saturday morning. ONE email with:
//   1. the class sessions not ticked, per group: the same list as the dashboard's "⚠ Weekend check" (pending() in teacher.html: sessions before
//      today, not ticked in teacherPlan/{group}.ticks, not set as homework, not "Homework by …", "moved to" or self-study lines). If nothing
//      is done they move to next week's list (↪), so the email suggests ticking them or 🏠 Set as homework.
//   2. the ⚠️ Problem reports (problems, not marked as fixed) and 💡 Ideas (suggestions) sent in the last 7 days, with the student, group, page and text.
// Nothing to say: no email. Sent with Gmail (GMAIL_APP_PASSWORD: an app password of GMAIL_USER, default roger.beltranps@gmail.com) to
// ALERT_EMAIL_TO (default GMAIL_USER); no password: it does nothing. Free (GitHub Actions in a public repo), no Claude.
// The Action log is public (the repo is public): counts only, never names or text.
// Also --instant (every 15 minutes in the day): only the problem reports and ideas sent since the last check, in one email (see below).
//   node tools/notify/notify.mjs          build and send the Saturday email
//   node tools/notify/notify.mjs --instant  the new problem reports and ideas since the last check
//   node tools/notify/notify.mjs --test   send a short test email now (nothing read)
//   node tools/notify/notify.mjs --dry    print the counts and write the email to notify-dry.eml in the temp folder; nothing sent
//                                          (EL_TODAY=YYYY-MM-DD pretends today is that day; with --instant, NOTIFY_STATE points to the last-check file)
// Sign-in: FIREBASE_SERVICE_ACCOUNT (a service account's JSON key, a secret, never in the repo; reading is enough).
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import {fileURLToPath} from "node:url";
import {execFileSync} from "node:child_process";

const PROJECT="english-lab-ietm",SITE="https://rogerbeltranps-lab.github.io/English-lab/",TZ="Europe/Madrid",ROOT=path.join(path.dirname(fileURLToPath(import.meta.url)),"../..");
const E=process.env,TEST=process.argv.includes("--test"),DRY=process.argv.includes("--dry"),INSTANT=process.argv.includes("--instant");
const MAIL_USER=(E.GMAIL_USER||"roger.beltranps@gmail.com").trim(),MAIL_PASS=(E.GMAIL_APP_PASSWORD||"").replace(/\s+/g,""),
  MAIL_TO=(E.ALERT_EMAIL_TO||MAIL_USER).split(",").map(s=>s.trim()).filter(Boolean);
if(!MAIL_PASS&&!DRY){console.log("No GMAIL_APP_PASSWORD: the Saturday email is off, nothing to do.");process.exit(0)}

function sendMail(subject,text){
  const b64=s=>Buffer.from(s,"utf8").toString("base64"),wrap=s=>s.replace(/.{1,76}/g,"$&\r\n");
  const eml=["From: =?UTF-8?B?"+b64("English Lab")+"?= <"+MAIL_USER+">","To: "+MAIL_TO.join(", "),"Subject: =?UTF-8?B?"+b64(subject)+"?=",
    "Date: "+new Date().toUTCString().replace("GMT","+0000"),"Message-ID: <"+crypto.randomUUID()+"@english-lab>","MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8","Content-Transfer-Encoding: base64","",wrap(b64(text))].join("\r\n");
  if(DRY){const f=path.join(os.tmpdir(),"notify-dry.eml");fs.writeFileSync(f,eml);console.log("Dry run: email written to "+f);return}
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),"el-mail-")),f=path.join(dir,"m.eml"),rc=path.join(dir,"netrc");
  try{fs.writeFileSync(f,eml);fs.writeFileSync(rc,"machine smtp.gmail.com login "+MAIL_USER+" password "+MAIL_PASS+"\n",{mode:0o600});   // the password never on the command line
    execFileSync("curl",["--silent","--show-error","--ssl-reqd","--url","smtps://smtp.gmail.com:465","--netrc-file",rc,"--mail-from",MAIL_USER,
      ...MAIL_TO.flatMap(t=>["--mail-rcpt",t]),"--upload-file",f],{stdio:["ignore","ignore","pipe"]});
    console.log("Email sent.")}
  catch(e){throw new Error("The email could not be sent (check GMAIL_APP_PASSWORD): "+String(e.stderr||e.message).split(MAIL_PASS).join("***").slice(0,300))}
  finally{fs.rmSync(dir,{recursive:true,force:true})}
}
if(TEST){sendMail("English Lab: test email ✅","This is a test. Every Saturday morning you will get one email with the sessions you did not tick and the week's ⚠️ Problem reports and 💡 Ideas (no email when there is nothing).\n\nDashboard: "+SITE+"teacher.html\n");process.exit(0)}

// ---- the site's own plan helpers (EL_GROUPS, EL_PLAN, ELWeek), today in Madrid
const ctx={console};ctx.window=ctx;
ctx.EL_TODAY=E.EL_TODAY||new Intl.DateTimeFormat("en-CA",{timeZone:TZ,year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
vm.createContext(ctx);
for(const f of ["el-catalog.js","el-plan.js","el-week.js"])vm.runInContext(fs.readFileSync(path.join(ROOT,"shared/js",f),"utf8"),ctx,{filename:f});
const W=ctx.window,WK=W.ELWeek,TODAY=WK.today();

// ---- Firestore (REST, read only)
async function token(){
  const t=(E.FIREBASE_SERVICE_ACCOUNT||"").trim().replace(/^['"]|['"]$/g,"");if(!t)throw new Error("Missing FIREBASE_SERVICE_ACCOUNT");
  const k=JSON.parse(t.startsWith("{")?t:Buffer.from(t,"base64").toString("utf8")),now=Math.floor(Date.now()/1000),b=o=>Buffer.from(JSON.stringify(o)).toString("base64url");
  const un=b({alg:"RS256",typ:"JWT"})+"."+b({iss:k.client_email,scope:"https://www.googleapis.com/auth/datastore",aud:"https://oauth2.googleapis.com/token",iat:now,exp:now+3600});
  const jwt=un+"."+crypto.createSign("RSA-SHA256").update(un).sign(k.private_key).toString("base64url");
  const j=await (await fetch("https://oauth2.googleapis.com/token",{method:"POST",body:new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion:jwt})})).json();
  if(!j.access_token)throw new Error("Service account sign-in failed: "+(j.error||"no token"));return j.access_token;
}
const TOKEN=await token(),BASE="https://firestore.googleapis.com/v1/projects/"+PROJECT+"/databases/(default)/documents";
async function api(method,url,body){
  const r=await fetch(url,{method,headers:{authorization:"Bearer "+TOKEN,"content-type":"application/json"},body:body&&JSON.stringify(body)});
  if(r.status===404)return null;const j=await r.json().catch(()=>null);if(!r.ok)throw new Error(method+" failed: "+(j?.[0]?.error?.message||j?.error?.message||r.status));return j;
}
const plain=v=>v==null?null:"stringValue" in v?v.stringValue:"integerValue" in v?+v.integerValue:"doubleValue" in v?v.doubleValue:"booleanValue" in v?v.booleanValue
  :"timestampValue" in v?v.timestampValue:"nullValue" in v?null:"mapValue" in v?Object.fromEntries(Object.entries(v.mapValue.fields||{}).map(([k,x])=>[k,plain(x)]))
  :"arrayValue" in v?(v.arrayValue.values||[]).map(plain):null;
const doc=d=>d?Object.fromEntries(Object.entries(d.fields||{}).map(([k,x])=>[k,plain(x)])):null;
const since=async(coll,from)=>((await api("POST",BASE+":runQuery",{structuredQuery:{from:[{collectionId:coll}],
  where:{fieldFilter:{field:{fieldPath:"created"},op:"GREATER_THAN_OR_EQUAL",value:{timestampValue:from}}},orderBy:[{field:{fieldPath:"created"}}]}}))||[])
  .filter(x=>x.document).map(x=>doc(x.document));

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
    sendMail("English Lab: "+[probs.length?n(probs.length,"new problem report","new problem reports"):"",ideas.length?n(ideas.length,"new idea","new ideas"):""].filter(Boolean).join(" and "),out.join("\n"))}
  if(!DRY)fs.writeFileSync(STATE,JSON.stringify({lastAt:now}));
  process.exit(0);
}

// ---- 1. sessions not ticked (the same rules as pending() in teacher.html)
const ticks={},hw={};
await Promise.all(W.EL_GROUPS.map(async g=>{ticks[g.id]=(doc(await api("GET",BASE+"/teacherPlan/"+g.id))||{}).ticks||{}}));
const plans=W.EL_GROUPS.map(g=>{const n=WK.now(g.id);return n?Object.assign({gid:g.id,name:g.name},n):null}).filter(Boolean);
await Promise.all([...new Set(plans.map(x=>x.ls))].map(async ls=>{hw[ls]=(doc(await api("GET",BASE+"/ls/"+encodeURIComponent(ls)))||{}).homework||{}}));
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
sendMail("English Lab · your week: "+subj.join(", "),out.join("\n"));
