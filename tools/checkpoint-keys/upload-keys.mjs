// Answer keys of the secure recall checkpoints (Roger, 31 Oct 2026; shared/js/el-checkpoint.js, docs/general/secure-checkpoints.md).
// The checkpoint pages have no answers or hints (the repo is public): they live in cpKeys/{page key}, which only the teacher can read.
// Run on Roger's PC or Mac, where the Firebase CLI is signed in as the project owner (as tools/exam-marks):
//   node tools/checkpoint-keys/upload-keys.mjs <keys.json outside the repo> [--apply]
// keys.json: {"<page key>": {"items": {"<item id>": {"a": [accepted answers], "q": "question", "i": place in the page's list (-1 Pro),
//   "r": route, "ca": "hint", "en": "hint"}}}}. Kept in Drive (Teacher Studio) and project files checkpoint-keys/, never in the repo.
// Answers the teacher accepted on the dashboard (items.<id>.extra) are kept. Without --apply it only prints what would change.
// It also lists students who already saved a first try of that checkpoint the old way (before it was secure), so no started work is changed unseen.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const PROJECT="english-lab-ietm";
const args=process.argv.slice(2),apply=args.includes("--apply"),[file]=args.filter(a=>!a.startsWith("--"));
if(!file){console.error("Usage: node upload-keys.mjs <keys.json> [--apply]");process.exit(1)}
const KEYS=JSON.parse(fs.readFileSync(file,"utf8"));

async function token(){   // Google access token from the Firebase CLI login, as in tools/student-accounts
  const f=path.join(process.env.XDG_CONFIG_HOME||path.join(os.homedir(),".config"),"configstore","firebase-tools.json");
  const rt=fs.existsSync(f)&&JSON.parse(fs.readFileSync(f,"utf8")).tokens?.refresh_token;
  if(!rt)throw new Error("Not signed in to the Firebase CLI: run `npx firebase-tools login` first.");
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
// JSON ⇄ Firestore REST values
const enc=x=>x==null?{nullValue:null}:Array.isArray(x)?{arrayValue:{values:x.map(enc)}}:typeof x==="object"?{mapValue:{fields:Object.fromEntries(Object.entries(x).map(([k,v])=>[k,enc(v)]))}}
  :typeof x==="number"?(Number.isInteger(x)?{integerValue:String(x)}:{doubleValue:x}):typeof x==="boolean"?{booleanValue:x}:{stringValue:String(x)};
const dec=v=>!v?null:"stringValue" in v?v.stringValue:"integerValue" in v?+v.integerValue:"doubleValue" in v?v.doubleValue:"booleanValue" in v?v.booleanValue:
  "arrayValue" in v?(v.arrayValue.values||[]).map(dec):"mapValue" in v?Object.fromEntries(Object.entries(v.mapValue.fields||{}).map(([k,x])=>[k,dec(x)])):null;

// students who already have a first try (or the step done) of these checkpoints in their progress
const started={};let pageToken="";
do{const j=await api("GET",DOCS+"students?pageSize=300"+(pageToken?"&pageToken="+pageToken:""));pageToken=j.nextPageToken||"";
  for(const s of j.documents||[]){const uid=s.name.split("/").pop(),email=dec(s.fields?.email)||uid;
    const pg=await api("GET",DOCS+"students/"+uid+"/progress?pageSize=50");
    for(const p of pg.documents||[]){const data=dec(p.fields?.data)||{};
      for(const key of Object.keys(KEYS)){if(!data[key])continue;let st;try{st=JSON.parse(data[key])}catch(e){continue}
        const cp=await api("GET",DOCS+"students/"+uid+"/checkpoints/"+key,null,true);
        if(!cp&&(st.first&&Object.keys(st.first).length||(st.done||{}).check))(started[key]=started[key]||[]).push(email)}}}}
while(pageToken);

let n=0;
for(const [key,K] of Object.entries(KEYS)){
  const cur=await api("GET",DOCS+"cpKeys/"+key,null,true),old=cur?dec(cur.fields?.items)||{}:{};
  const items=Object.fromEntries(Object.entries(K.items).map(([id,it])=>[id,Object.assign({},it,old[id]&&old[id].extra?{extra:old[id].extra}:{})]));
  const diff=Object.keys(items).filter(id=>JSON.stringify(old[id]||null)!==JSON.stringify(items[id])).length;
  console.log((diff?apply?"✓ ":"→ ":"= ")+key+": "+Object.keys(items).length+" questions"+(diff?", "+diff+" new or changed":", up to date")+
    (started[key]?"\n   ⚠ already done the old way by "+started[key].length+": "+started[key].join(", "):""));
  if(!diff||!apply)continue;n++;
  await api("PATCH",DOCS+"cpKeys/"+key,{fields:{items:enc(items),updated:{timestampValue:new Date().toISOString()}}});
}
console.log(apply?"\nWritten: "+n:"\nNothing written: run again with --apply.");
