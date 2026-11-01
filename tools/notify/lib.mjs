// Shared by tools/notify/notify.mjs (teacher emails) and tools/notify/students.mjs (students' Sunday summary): sending with Google's SMTP,
// the site's own helpers (EL_GROUPS, EL_LS, EL_PLAN, EL_CATALOG, ELWeek) and read-only Firestore with a service account.
// Sender (Roger, 1 Nov 2026: students' school accounts only receive mail from the school domain): the school account SCHOOL_USER
// (default roger.beltran@ietramuntana.cat) with SCHOOL_APP_PASSWORD; teacher emails fall back to GMAIL_USER + GMAIL_APP_PASSWORD.
// DRY=true: nothing is sent, the emails are appended to notify-dry.eml in the temp folder.
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import {fileURLToPath} from "node:url";
import {execFileSync} from "node:child_process";

export const E=process.env,ARGS=process.argv.slice(2),DRY=ARGS.includes("--dry");
export const SITE="https://rogerbeltranps-lab.github.io/English-lab/",TZ="Europe/Madrid",ROOT=path.join(path.dirname(fileURLToPath(import.meta.url)),"../..");
const PROJECT="english-lab-ietm";
export const SCHOOL={user:(E.SCHOOL_USER||"roger.beltran@ietramuntana.cat").trim(),pass:(E.SCHOOL_APP_PASSWORD||"").replace(/\s+/g,"")};
export const GMAIL={user:(E.GMAIL_USER||"roger.beltranps@gmail.com").trim(),pass:(E.GMAIL_APP_PASSWORD||"").replace(/\s+/g,"")};
export const TEACHER_TO=(E.ALERT_EMAIL_TO||"roger.beltranps@gmail.com").split(",").map(s=>s.trim()).filter(Boolean);

// one plain-text email; from = {user, pass}; name = the sender's display name
export function sendMail(from,to,subject,text,name="English Lab"){
  to=[].concat(to);const b64=s=>Buffer.from(s,"utf8").toString("base64"),wrap=s=>s.replace(/.{1,76}/g,"$&\r\n");
  const eml=["From: =?UTF-8?B?"+b64(name)+"?= <"+from.user+">","To: "+to.join(", "),"Subject: =?UTF-8?B?"+b64(subject)+"?=",
    "Date: "+new Date().toUTCString().replace("GMT","+0000"),"Message-ID: <"+crypto.randomUUID()+"@english-lab>","MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8","Content-Transfer-Encoding: base64","",wrap(b64(text))].join("\r\n");
  if(DRY){fs.appendFileSync(path.join(os.tmpdir(),"notify-dry.eml"),eml+"\r\n\r\n=====\r\n\r\n");return}
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),"el-mail-")),f=path.join(dir,"m.eml"),rc=path.join(dir,"netrc");
  try{fs.writeFileSync(f,eml);fs.writeFileSync(rc,"machine smtp.gmail.com login "+from.user+" password "+from.pass+"\n",{mode:0o600});   // the password never on the command line
    execFileSync("curl",["--silent","--show-error","--ssl-reqd","--url","smtps://smtp.gmail.com:465","--netrc-file",rc,"--mail-from",from.user,
      ...to.flatMap(t=>["--mail-rcpt",t]),"--upload-file",f],{stdio:["ignore","ignore","pipe"]})}
  catch(e){throw new Error("The email could not be sent (check the app password): "+String(e.stderr||e.message).split(from.pass).join("***").slice(0,300))}
  finally{fs.rmSync(dir,{recursive:true,force:true})}
}

// the site's helpers, with today in Madrid (EL_TODAY=YYYY-MM-DD pretends today is that day)
export function site(files){
  const ctx={console};ctx.window=ctx;
  ctx.EL_TODAY=E.EL_TODAY||new Intl.DateTimeFormat("en-CA",{timeZone:TZ,year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
  vm.createContext(ctx);
  for(const f of files)vm.runInContext(fs.readFileSync(path.join(ROOT,"shared/js",f),"utf8"),ctx,{filename:f});
  return ctx.window;
}

// Firestore REST, read only (FIREBASE_SERVICE_ACCOUNT: a service account's JSON key, a secret, never in the repo)
export async function firestore(){
  const t=(E.FIREBASE_SERVICE_ACCOUNT||"").trim().replace(/^['"]|['"]$/g,"");if(!t)throw new Error("Missing FIREBASE_SERVICE_ACCOUNT");
  const k=JSON.parse(t.startsWith("{")?t:Buffer.from(t,"base64").toString("utf8")),now=Math.floor(Date.now()/1000),b=o=>Buffer.from(JSON.stringify(o)).toString("base64url");
  const un=b({alg:"RS256",typ:"JWT"})+"."+b({iss:k.client_email,scope:"https://www.googleapis.com/auth/datastore",aud:"https://oauth2.googleapis.com/token",iat:now,exp:now+3600});
  const jwt=un+"."+crypto.createSign("RSA-SHA256").update(un).sign(k.private_key).toString("base64url");
  const j=await (await fetch("https://oauth2.googleapis.com/token",{method:"POST",body:new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion:jwt})})).json();
  if(!j.access_token)throw new Error("Service account sign-in failed: "+(j.error||"no token"));
  const TOKEN=j.access_token,BASE="https://firestore.googleapis.com/v1/projects/"+PROJECT+"/databases/(default)/documents";
  const api=async(method,url,body)=>{
    const r=await fetch(url,{method,headers:{authorization:"Bearer "+TOKEN,"content-type":"application/json"},body:body&&JSON.stringify(body)});
    if(r.status===404)return null;const x=await r.json().catch(()=>null);if(!r.ok)throw new Error(method+" failed: "+(x?.[0]?.error?.message||x?.error?.message||r.status));return x};
  const plain=v=>v==null?null:"stringValue" in v?v.stringValue:"integerValue" in v?+v.integerValue:"doubleValue" in v?v.doubleValue:"booleanValue" in v?v.booleanValue
    :"timestampValue" in v?v.timestampValue:"nullValue" in v?null:"mapValue" in v?Object.fromEntries(Object.entries(v.mapValue.fields||{}).map(([k,x])=>[k,plain(x)]))
    :"arrayValue" in v?(v.arrayValue.values||[]).map(plain):null;
  const doc=d=>d?Object.fromEntries(Object.entries(d.fields||{}).map(([k,x])=>[k,plain(x)])):null;
  return {
    get:async p=>doc(await api("GET",BASE+"/"+p)),
    // every document of a collection (or subcollection path): [[id, data]]
    list:async p=>{const out=[];let tok="";do{const j=await api("GET",BASE+"/"+p+"?pageSize=300"+(tok?"&pageToken="+tok:""));(j?.documents||[]).forEach(d=>out.push([d.name.split("/").pop(),doc(d)]));tok=j?.nextPageToken||""}while(tok);return out},
    // documents of a top-level collection with created >= from
    since:async(coll,from)=>((await api("POST",BASE+":runQuery",{structuredQuery:{from:[{collectionId:coll}],
      where:{fieldFilter:{field:{fieldPath:"created"},op:"GREATER_THAN_OR_EQUAL",value:{timestampValue:from}}},orderBy:[{field:{fieldPath:"created"}}]}}))||[])
      .filter(x=>x.document).map(x=>Object.assign({id:x.document.name.split("/").pop()},doc(x.document)))};
}
