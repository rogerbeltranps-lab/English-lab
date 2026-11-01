// Teacher alerts (Roger, 1 Nov 2026: "when I have messages as a teacher on the app, that I receive a mail or a notification on my cellphone").
// Run by .github/workflows/teacher-alerts.yml every 15 minutes in the day: it reads the problem reports (⚠️ Problem, problems/{id}) and the
// ideas (💡 Idea, suggestions/{id}) created since the last run and sends ONE message for all of them:
//   • an email (GMAIL_APP_PASSWORD: a Gmail app password of GMAIL_USER, default roger.beltranps@gmail.com; sent to ALERT_EMAIL_TO, default
//     GMAIL_USER). The email has the student's name, group, page and text: it goes only to the teacher's inbox.
//   • and/or a phone push with the free ntfy app (NTFY_TOPIC: the topic the teacher subscribed to). The push says only how many, never names
//     or text, because ntfy is an outside service.
// Neither secret set: it does nothing at all. The last run is remembered in a small file (NOTIFY_STATE) that the Action keeps in its cache
// (the Action's service account can only read Firestore). The log is public (the repo is public): counts only, never names or text.
//   node tools/notify/notify.mjs            check and send
//   node tools/notify/notify.mjs --test     send a test message now (nothing read, the state is not changed)
//   node tools/notify/notify.mjs --dry      print the counts and write the email to notify-dry.eml in the temp folder; nothing sent or saved
//                                            (NOTIFY_SINCE=<ISO time> looks back to that time)
// Sign-in: FIREBASE_SERVICE_ACCOUNT (a service account's JSON key, a secret, never in the repo; reading is enough).
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {execFileSync} from "node:child_process";

const PROJECT="english-lab-ietm",SITE="https://rogerbeltranps-lab.github.io/English-lab/",TZ="Europe/Madrid";
const E=process.env,TEST=process.argv.includes("--test"),DRY=process.argv.includes("--dry");
const MAIL_USER=(E.GMAIL_USER||"roger.beltranps@gmail.com").trim(),MAIL_PASS=(E.GMAIL_APP_PASSWORD||"").replace(/\s+/g,""),
  MAIL_TO=(E.ALERT_EMAIL_TO||MAIL_USER).split(",").map(s=>s.trim()).filter(Boolean),TOPIC=(E.NTFY_TOPIC||"").trim();
if(!MAIL_PASS&&!TOPIC&&!DRY){console.log("No GMAIL_APP_PASSWORD and no NTFY_TOPIC: alerts are off, nothing to do.");process.exit(0)}

const KIND={media:"🔊 Audio or video does not play",stuck:"⛔ Cannot go on",marking:"❌ Correct answer marked wrong",display:"🖥️ Page looks wrong",other:"❓ Something else"};
const GROUP={"2ESOA":"2 ESO A","2ESOB":"2 ESO B","4ESOA":"4 ESO A","4ESOB":"4 ESO B"};
const ROUTE={beginners:"Starter",insecure:"Base",safe:"Core",daring:"Plus",native:"Pro"};
const time=d=>new Date(d).toLocaleString("en-GB",{timeZone:TZ,weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});
const n=(k,one,many)=>k+" "+(k===1?one:many);

// ---- sending
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
async function sendPush(text,click){
  if(DRY){console.log("Dry run: push \""+text+"\"");return}
  const r=await fetch("https://ntfy.sh/"+encodeURIComponent(TOPIC),{method:"POST",body:text,headers:{Title:"English Lab",Tags:"bell",Click:click,Priority:"high"}});
  if(!r.ok)throw new Error("The phone push could not be sent: "+r.status);console.log("Push sent.")
}
async function send({subject,text,push,click}){
  const errs=[];
  if(MAIL_PASS||DRY)try{sendMail(subject,text)}catch(e){errs.push(e.message)}
  if(TOPIC||DRY)try{await sendPush(push,click)}catch(e){errs.push(e.message)}
  if(errs.length)throw new Error(errs.join("\n"));
}

if(TEST){
  await send({subject:"English Lab: test alert ✅",text:"This is a test. From now on you get an email like this when a student sends a ⚠️ Problem report or a 💡 Idea.\n\nDashboard: "+SITE+"teacher.html\n",
    push:"Test alert: alerts for new problem reports and ideas are on.",click:SITE+"teacher.html"});
  process.exit(0);
}

// ---- Firestore (REST, service account, read only)
async function token(){
  const t=(E.FIREBASE_SERVICE_ACCOUNT||"").trim().replace(/^['"]|['"]$/g,"");if(!t)throw new Error("Missing FIREBASE_SERVICE_ACCOUNT");
  const k=JSON.parse(t.startsWith("{")?t:Buffer.from(t,"base64").toString("utf8")),now=Math.floor(Date.now()/1000),b=o=>Buffer.from(JSON.stringify(o)).toString("base64url");
  const un=b({alg:"RS256",typ:"JWT"})+"."+b({iss:k.client_email,scope:"https://www.googleapis.com/auth/datastore",aud:"https://oauth2.googleapis.com/token",iat:now,exp:now+3600});
  const jwt=un+"."+crypto.createSign("RSA-SHA256").update(un).sign(k.private_key).toString("base64url");
  const j=await (await fetch("https://oauth2.googleapis.com/token",{method:"POST",body:new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion:jwt})})).json();
  if(!j.access_token)throw new Error("Service account sign-in failed: "+(j.error||"no token"));return j.access_token;
}
const TOKEN=await token(),BASE="https://firestore.googleapis.com/v1/projects/"+PROJECT+"/databases/(default)/documents";
const plain=v=>v==null?null:"stringValue" in v?v.stringValue:"integerValue" in v?+v.integerValue:"doubleValue" in v?v.doubleValue:"booleanValue" in v?v.booleanValue
  :"timestampValue" in v?v.timestampValue:"nullValue" in v?null:"mapValue" in v?Object.fromEntries(Object.entries(v.mapValue.fields||{}).map(([k,x])=>[k,plain(x)]))
  :"arrayValue" in v?(v.arrayValue.values||[]).map(plain):null;
const doc=d=>Object.assign({id:d.name.split("/").pop()},Object.fromEntries(Object.entries(d.fields||{}).map(([k,x])=>[k,plain(x)])));
async function since(coll,from,to){
  const r=await fetch(BASE+":runQuery",{method:"POST",headers:{authorization:"Bearer "+TOKEN,"content-type":"application/json"},body:JSON.stringify({structuredQuery:{
    from:[{collectionId:coll}],where:{compositeFilter:{op:"AND",filters:[
      {fieldFilter:{field:{fieldPath:"created"},op:"GREATER_THAN",value:{timestampValue:from}}},
      {fieldFilter:{field:{fieldPath:"created"},op:"LESS_THAN_OR_EQUAL",value:{timestampValue:to}}}]}},orderBy:[{field:{fieldPath:"created"}}]}})});
  const j=await r.json().catch(()=>null);if(!r.ok)throw new Error("Reading "+coll+" failed: "+(j?.[0]?.error?.message||j?.error?.message||r.status));
  return j.filter(x=>x.document).map(x=>doc(x.document));
}

// ---- the last run (no file: the first run, or the cache was lost: look back 20 minutes, a little more than one run)
const STATE=E.NOTIFY_STATE||path.join(os.tmpdir(),"notify-state.json"),now=new Date(Date.now()-5000).toISOString();   // 5 s back: a report being written right now waits for the next run
let last=DRY&&E.NOTIFY_SINCE;
if(!last)try{last=JSON.parse(fs.readFileSync(STATE,"utf8")).lastAt}catch(e){}
if(!last){last=new Date(Date.now()-20*60000).toISOString();console.log("No saved last run: looking back 20 minutes.")}
const save=()=>{if(!DRY)fs.writeFileSync(STATE,JSON.stringify({lastAt:now}))};

const [probs,ideas]=await Promise.all([since("problems",last,now),since("suggestions",last,now)]);
console.log("New since the last run: "+probs.length+" problem report(s), "+ideas.length+" idea(s).");   // counts only: the log is public
if(!probs.length&&!ideas.length){save();process.exit(0)}

const who=x=>[x.name||x.email||"Someone",GROUP[x.group]||x.group,ROUTE[x.route]].filter(Boolean).join(" · ");
const block=(x,head,where)=>[head,"   "+who(x)+" · "+time(x.created),where?"   📍 "+where:"",x.text?"   “"+String(x.text).trim().replace(/\s*\n\s*/g," / ")+"”":""].filter(Boolean).join("\n");
const parts=[n(probs.length,"problem report","problem reports"),n(ideas.length,"idea","ideas")].filter(s=>!s.startsWith("0 "));
const lines=[];
if(probs.length)lines.push("⚠️ PROBLEM REPORTS","",...probs.map(x=>block(x,"• "+(KIND[x.kind]||x.kind||"Problem")+(x.shot?" (with a screenshot)":""),
  [x.title||x.page,x.section].filter(Boolean).join(" › "))+"\n"),"Open them: "+SITE+"teacher.html#probs","");
if(ideas.length)lines.push("💡 IDEAS","",...ideas.map(x=>block(x,"• Idea",x.page)+"\n"),"Open them: "+SITE+"teacher.html","");
lines.push("—","English Lab alerts: one email per check (every 15 minutes, 7:00 to 23:00). Students do not see this email.");
await send({subject:"English Lab: "+parts.join(" and "),text:lines.join("\n"),push:"New on English Lab: "+parts.join(" and ")+". Tap to open the dashboard.",
  click:SITE+"teacher.html"+(probs.length?"#probs":"")});
save();
