// Answer key of a web exam (Roger, 17 Nov 2026: 2 ESO LS2 exam, shared/js/el-web-exam.js) into cpKeys/{exam key}.web, which only the
// teacher can read. The field is `web`, not `items`, so the checkpoints' hash sync (cpHashSync) leaves it alone and no hash reaches students.
// keys.json comes from tools/web-exam/build.mjs and stays outside the repo (project files web-exam-2eso-ls2/):
//   node tools/web-exam/upload-keys.mjs <keys.json> [--apply]
// Answers the teacher accepted on the dashboard (web.<id>.extra) are kept. Without --apply it only prints what would change.
// Sign-in: FIREBASE_SERVICE_ACCOUNT (the cloud environment's secret), else the Firebase CLI login on Roger's computer (as tools/exam-marks).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";

const PROJECT="english-lab-ietm";
const args=process.argv.slice(2),apply=args.includes("--apply"),[file]=args.filter(a=>!a.startsWith("--"));
if(!file){console.error("Usage: node upload-keys.mjs <keys.json> [--apply]");process.exit(1)}
const KEYS=JSON.parse(fs.readFileSync(file,"utf8"));

async function token(){
  const sa=process.env.FIREBASE_SERVICE_ACCOUNT;
  if(sa){const t=sa.trim().replace(/^['"]|['"]$/g,""),k=JSON.parse(t.startsWith("{")?t:Buffer.from(t,"base64").toString("utf8")),
    now=Math.floor(Date.now()/1000),b=o=>Buffer.from(JSON.stringify(o)).toString("base64url");
    const un=b({alg:"RS256",typ:"JWT"})+"."+b({iss:k.client_email,scope:"https://www.googleapis.com/auth/datastore",aud:"https://oauth2.googleapis.com/token",iat:now,exp:now+3600});
    const jwt=un+"."+crypto.createSign("RSA-SHA256").update(un).sign(k.private_key).toString("base64url");
    const j=await (await fetch("https://oauth2.googleapis.com/token",{method:"POST",body:new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion:jwt})})).json();
    if(!j.access_token)throw new Error("Service account token: "+JSON.stringify(j));return j.access_token}
  const f=path.join(process.env.XDG_CONFIG_HOME||path.join(os.homedir(),".config"),"configstore","firebase-tools.json");
  const rt=fs.existsSync(f)&&JSON.parse(fs.readFileSync(f,"utf8")).tokens?.refresh_token;
  if(!rt)throw new Error("No FIREBASE_SERVICE_ACCOUNT and not signed in to the Firebase CLI: run `npx firebase-tools login` first.");
  const r=await fetch("https://oauth2.googleapis.com/token",{method:"POST",body:new URLSearchParams({grant_type:"refresh_token",refresh_token:rt,
    client_id:"563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com",client_secret:"j9iVZfS8kkCEFUPaAeJV0sAi"})});   // the Firebase CLI's public client
  const j=await r.json();if(!j.access_token)throw new Error("Token: "+JSON.stringify(j));return j.access_token;
}
const TOKEN=await token();
async function api(method,url,body,ok404){
  const r=await fetch(url,{method,headers:{authorization:"Bearer "+TOKEN,"x-goog-user-project":PROJECT,"content-type":"application/json"},body:body&&JSON.stringify(body)});
  if(ok404&&r.status===404)return null;
  const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(method+" "+url.split("?")[0]+": "+(j.error?.message||r.status));return j;
}
const DOCS="https://firestore.googleapis.com/v1/projects/"+PROJECT+"/databases/(default)/documents/";
const enc=x=>x==null?{nullValue:null}:Array.isArray(x)?{arrayValue:{values:x.map(enc)}}:typeof x==="object"?{mapValue:{fields:Object.fromEntries(Object.entries(x).map(([k,v])=>[k,enc(v)]))}}
  :typeof x==="number"?(Number.isInteger(x)?{integerValue:String(x)}:{doubleValue:x}):typeof x==="boolean"?{booleanValue:x}:{stringValue:String(x)};
const dec=v=>!v?null:"stringValue" in v?v.stringValue:"integerValue" in v?+v.integerValue:"doubleValue" in v?v.doubleValue:"booleanValue" in v?v.booleanValue:
  "arrayValue" in v?(v.arrayValue.values||[]).map(dec):"mapValue" in v?Object.fromEntries(Object.entries(v.mapValue.fields||{}).map(([k,x])=>[k,dec(x)])):null;
const canon=x=>Array.isArray(x)?"["+x.map(canon).join(",")+"]":x&&typeof x==="object"?"{"+Object.keys(x).sort().map(k=>JSON.stringify(k)+":"+canon(x[k])).join(",")+"}":JSON.stringify(x);

let n=0;
for(const [key,K] of Object.entries(KEYS)){
  if(!K.web){console.log("✗ "+key+": no `web` field, skipped");continue}
  const cur=await api("GET",DOCS+"cpKeys/"+key,null,true),old=cur?dec(cur.fields?.web)||{}:{};
  const web=Object.fromEntries(Object.entries(K.web).map(([id,it])=>[id,Object.assign({},it,old[id]&&old[id].extra?{extra:old[id].extra}:{})]));
  const diff=Object.keys(web).filter(id=>canon(old[id]||null)!==canon(web[id])).length,gone=Object.keys(old).filter(id=>!web[id]).length;
  console.log((diff||gone?apply?"✓ ":"→ ":"= ")+key+": "+Object.keys(web).length+" questions"+(diff?", "+diff+" new or changed":"")+(gone?", "+gone+" removed":"")+(diff||gone?"":", up to date"));
  if(!(diff||gone)||!apply)continue;n++;
  // only the web field (and updated): any other field of the doc stays
  await api("PATCH",DOCS+"cpKeys/"+key+"?updateMask.fieldPaths=web&updateMask.fieldPaths=updated",{fields:{web:enc(web),updated:{timestampValue:new Date().toISOString()}}});
}
console.log(apply?"\nWritten: "+n:"\nNothing written: run again with --apply.");
