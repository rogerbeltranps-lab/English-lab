// Student accounts (Roger, 26 Oct 2026): every student on the student list (Firestore roster/{email}) gets a Firebase
// Email/Password account with their school email and a password we make, so signing in does not depend on the school's Google.
// Run on Roger's PC, where the Firebase CLI is signed in as the project owner (no key file needed):
//   node tools/student-accounts/student-accounts.mjs <folder outside the repo, e.g. C:\Developer\dades-alumnes> [--dry-run] [--only email,email]
// It writes into that folder (personal data: never commit it):
//   student-passwords.csv  email,group,surname1,surname2,first,password: kept between runs, so a password never changes unless
//                          you delete its row (or the whole file); new students on the list get a new one
//   send-passwords.gs      Google Apps Script that emails each student their login and password (paste it in script.google.com)
//   password-slips.html    one slip per student, one class group per page, to print as a backup
// Accounts: an email that already has an account (a student who signed in with Google) keeps its uid, so its progress stays;
// it only gets the password. Accounts are marked as verified (the rules need email_verified). Testers get an account too.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";

const PROJECT="english-lab-ietm",SITE="https://rogerbeltranps-lab.github.io/English-lab/";
const TESTERS=["roger.beltran@ietramuntana.cat"];   // also in shared/js/el-firebase.js
const args=process.argv.slice(2),dry=args.includes("--dry-run");
const only=(args[args.indexOf("--only")+1]||"").toLowerCase().split(",").filter(x=>args.includes("--only")&&x);
const out=args.find(a=>!a.startsWith("--")&&!only.includes(a.toLowerCase()));
if(!out){console.error("Usage: node student-accounts.mjs <data folder outside the repo> [--dry-run] [--only email,email]");process.exit(1)}
fs.mkdirSync(out,{recursive:true});

// Google access token from the Firebase CLI login (firebase login), the same one `firebase deploy` uses.
async function token(){
  const f=path.join(process.env.XDG_CONFIG_HOME||path.join(os.homedir(),".config"),"configstore","firebase-tools.json");
  const rt=fs.existsSync(f)&&JSON.parse(fs.readFileSync(f,"utf8")).tokens?.refresh_token;
  if(!rt)throw new Error("Not signed in to the Firebase CLI: run `npx firebase-tools login` first.");
  const r=await fetch("https://oauth2.googleapis.com/token",{method:"POST",body:new URLSearchParams({grant_type:"refresh_token",refresh_token:rt,
    client_id:"563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com",client_secret:"j9iVZfS8kkCEFUPaAeJV0sAi"})});   // the Firebase CLI's public client
  const j=await r.json();if(!j.access_token)throw new Error("Token: "+JSON.stringify(j));return j.access_token;
}
const TOKEN=await token();
async function api(method,url,body){
  const r=await fetch(url,{method,headers:{authorization:"Bearer "+TOKEN,"x-goog-user-project":PROJECT,"content-type":"application/json"},body:body&&JSON.stringify(body)});
  const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(method+" "+url.split("?")[0]+": "+(j.error?.message||r.status));return j;
}
const IT="https://identitytoolkit.googleapis.com/v1/projects/"+PROJECT;

// 1. The student list, from Firestore (what the dashboard shows), plus the testers.
const str=f=>f?.stringValue||"";
let roster=[],page="";
do{const j=await api("GET","https://firestore.googleapis.com/v1/projects/"+PROJECT+"/databases/(default)/documents/roster?pageSize=300"+(page?"&pageToken="+page:""));
  for(const d of j.documents||[]){const f=d.fields||{},email=(str(f.email)||d.name.split("/").pop()).toLowerCase();
    if(email.includes("@")&&!email.startsWith("pending-"))roster.push({email,group:str(f.group),surname1:str(f.surname1),surname2:str(f.surname2),first:str(f.first)})}
  page=j.nextPageToken||""}while(page);
for(const t of TESTERS)if(!roster.some(s=>s.email===t))roster.push({email:t,group:"tester",surname1:"Beltran",surname2:"Porres",first:"Roger"});
console.log(roster.length+" accounts on the list (testers included)");

// 2. Passwords: keep the ones already made, make new ones (an easy word + 4 digits, e.g. "lemon4827").
const WORDS="apple banana bear bird cake camel candy cat cherry cloud coconut cookie daisy dolphin dragon duck eagle forest fox frog garden ghost giraffe grape guitar hippo honey island jelly kiwi koala lemon lion mango maple melon monkey moon mouse ocean orange otter panda parrot peach pepper piano pirate planet pony puppy rabbit rain river robot rocket salmon shark sky snake snow spider star storm sun tiger tomato tulip turtle violin whale wolf zebra".split(" ");
const csvFile=path.join(out,"student-passwords.csv"),cell=v=>/[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;
const old={};
if(fs.existsSync(csvFile))for(const line of fs.readFileSync(csvFile,"utf8").split(/\r?\n/).slice(1)){const c=line.split(",");if(c[0])old[c[0].toLowerCase()]=c[c.length-1]}
for(const s of roster)s.password=old[s.email]||WORDS[crypto.randomInt(WORDS.length)]+(1000+crypto.randomInt(9000));
const order=s=>s.group+" "+s.surname1+" "+s.surname2+" "+s.first;
roster.sort((a,b)=>(a.group==="tester")-(b.group==="tester")||order(a).localeCompare(order(b),"ca"));   // testers last
fs.writeFileSync(csvFile,"email,group,surname1,surname2,first,password\n"+roster.map(s=>[s.email,s.group,s.surname1,s.surname2,s.first,s.password].map(cell).join(",")).join("\n")+"\n");

// 3. Firebase: Email/Password sign-in on; each account created, or the password added to the existing one.
if(!dry){
  await api("PATCH","https://identitytoolkit.googleapis.com/admin/v2/projects/"+PROJECT+"/config?updateMask=signIn.email.enabled,signIn.email.passwordRequired",{signIn:{email:{enabled:true,passwordRequired:true}}});
  let made=0,updated=0,failed=0;
  for(const s of roster.filter(s=>!only.length||only.includes(s.email))){
    const displayName=(s.first+" "+s.surname1).trim()||s.email;
    try{
      const found=(await api("POST",IT+"/accounts:lookup",{email:[s.email]})).users?.[0];
      if(found){await api("POST",IT+"/accounts:update",{localId:found.localId,password:s.password,emailVerified:true,...(found.displayName?{}:{displayName})});updated++}
      else{await api("POST",IT+"/accounts",{email:s.email,password:s.password,emailVerified:true,displayName});made++}
    }catch(e){failed++;console.error(s.email+": "+e.message)}
  }
  console.log(made+" accounts created, "+updated+" existing accounts got the password, "+failed+" failed");
}else console.log("Dry run: nothing changed in Firebase");

// 4. The email script and the printable slips (students only, not testers).
const kids=roster.filter(s=>s.group!=="tester"),esc=v=>v.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const year=new Date().getFullYear(),copy="© "+year+" Roger Beltran · English Lab · All rights reserved";   // as in shared/js/el-copyright.js
fs.writeFileSync(path.join(out,"send-passwords.gs"),`// English Lab: emails each student their login and password. Made by tools/student-accounts/student-accounts.mjs.
// 1. Open https://script.google.com (signed in with the account that sends), New project, paste this whole file, save.
// 2. Choose testMe and Run: you get the first student's email, to check it.  3. Choose sendAll and Run.
// sendAll never emails the same student twice, so you can run it again (e.g. the next day if the daily limit stops it).
const SITE=${JSON.stringify(SITE)};
const STUDENTS=${JSON.stringify(kids.map(s=>[s.email,s.first,s.password]))};
function message_(first,email,password){
  const subject="English Lab: el teu usuari i contrasenya · your login and password";
  const body="Hola "+first+",\\n\\nJa pots entrar a English Lab amb el teu correu de l'institut i aquesta contrasenya:\\n\\n"
    +"Usuari / Login: "+email+"\\nContrasenya / Password: "+password+"\\n\\nEntra a "+SITE+" i prem Entra / Sign in.\\nNo comparteixis la contrasenya amb ningú. Si l'oblides, demana-la al professor.\\n\\n"
    +"Hi "+first+",\\nYou can now sign in to English Lab with your school email and this password. Open the link above and press Sign in. Do not share your password. If you forget it, ask your teacher.\\n\\nRoger Beltran\\n\\n${copy}";
  return {subject,body,name:"Roger Beltran · English Lab"};
}
function testMe(){const s=STUDENTS[0],m=message_(s[1],s[0],s[2]);MailApp.sendEmail(Object.assign({to:Session.getActiveUser().getEmail()},m));Logger.log("Test sent to you (it shows "+s[0]+")")}
function sendAll(){
  const done=PropertiesService.getScriptProperties();let n=0;
  for(const [email,first,password] of STUDENTS){
    if(done.getProperty(email))continue;
    if(MailApp.getRemainingDailyQuota()<1){Logger.log("Daily email limit reached: run sendAll again tomorrow.");break}
    MailApp.sendEmail(Object.assign({to:email},message_(first,email,password)));done.setProperty(email,new Date().toISOString());n++;
  }
  Logger.log(n+" emails sent now; "+STUDENTS.filter(s=>done.getProperty(s[0])).length+" of "+STUDENTS.length+" sent in total.");
}
`);
const groups=[...new Set(kids.map(s=>s.group))];
fs.writeFileSync(path.join(out,"password-slips.html"),`<!doctype html><html lang="ca"><head><meta charset="utf-8"><title>English Lab passwords</title><style>
body{font:11pt Arial,sans-serif;margin:0}@page{size:A4;margin:10mm 10mm 14mm;@bottom-center{content:${JSON.stringify(copy)};font:8pt Arial,sans-serif;color:#5f6b73}}
section{break-after:page}h1{font-size:14pt;margin:0 0 6mm}.grid{display:grid;grid-template-columns:1fr 1fr;gap:0}
.slip{border:1px dashed #94a3b8;padding:3mm 4mm;break-inside:avoid;height:30mm;box-sizing:border-box}.n{font-weight:700}.k{color:#475569;font-size:9pt}
.v{font:11pt Consolas,monospace}.u{font-size:8.5pt;color:#475569}</style></head><body>
${groups.map(g=>`<section><h1>English Lab · ${esc(g)} · usuaris i contrasenyes</h1><div class="grid">${kids.filter(s=>s.group===g).map(s=>`<div class="slip"><div class="n">${esc(s.surname1+" "+s.surname2+", "+s.first)}</div>
<div><span class="k">Usuari / Login:</span> <span class="v">${esc(s.email)}</span></div><div><span class="k">Contrasenya / Password:</span> <span class="v">${esc(s.password)}</span></div>
<div class="u">${SITE} · Entra / Sign in</div></div>`).join("")}</div></section>`).join("")}
</body></html>`);
console.log("Written: "+["student-passwords.csv","send-passwords.gs","password-slips.html"].map(f=>path.join(out,f)).join(", "));
