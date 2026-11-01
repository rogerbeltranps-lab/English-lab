// Exam reports onto the student board (Roger, 1 Nov 2026): writes each student's report (the questions to review, the writing with its
// rubric and corrections, what to review) to students/{uid}/results/{ls}__assessment .report, which today.html shows on the "My exams"
// tab. Only the report field is written: the marks (tools/exam-marks) and everything else in the record stay as they are.
// Run on Roger's computer, where the Firebase CLI is signed in as the project owner (as tools/exam-marks):
//   node tools/exam-report/import-exam-report.mjs <reports.json outside the repo> <ls id, e.g. 4eso-my-real-routine> [--apply]
// reports.json = {email: report}, made by tools/exam-report/build-4eso-ls1.py. Without --apply it only prints what would change.
// The JSON holds personal data: keep it outside the repo (e.g. C:\Developer\dades-alumnes).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const PROJECT="english-lab-ietm";
const args=process.argv.slice(2),apply=args.includes("--apply"),[file,ls]=args.filter(a=>!a.startsWith("--"));
if(!file||!ls){console.error("Usage: node import-exam-report.mjs <reports.json> <ls id> [--apply]");process.exit(1)}
const reports=JSON.parse(fs.readFileSync(file,"utf8"));

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
const IT="https://identitytoolkit.googleapis.com/v1/projects/"+PROJECT,DOCS="https://firestore.googleapis.com/v1/projects/"+PROJECT+"/databases/(default)/documents/";
const mask=ps=>ps.map(p=>"updateMask.fieldPaths="+encodeURIComponent(p)).join("&");
// JSON ⇄ Firestore values
const enc=x=>x==null?{nullValue:null}:Array.isArray(x)?{arrayValue:{values:x.map(enc)}}:typeof x==="object"?{mapValue:{fields:Object.fromEntries(Object.entries(x).map(([k,v])=>[k,enc(v)]))}}
  :typeof x==="number"?(Number.isInteger(x)?{integerValue:String(x)}:{doubleValue:x}):typeof x==="boolean"?{booleanValue:x}:{stringValue:String(x)};
const dec=v=>!v?undefined:"nullValue" in v?null:v.arrayValue?(v.arrayValue.values||[]).map(dec):v.mapValue?Object.fromEntries(Object.entries(v.mapValue.fields||{}).map(([k,y])=>[k,dec(y)]))
  :v.integerValue!=null?+v.integerValue:v.doubleValue!=null?+v.doubleValue:v.booleanValue!=null?v.booleanValue:v.stringValue;
const canon=x=>JSON.stringify(x,(k,v)=>v&&typeof v==="object"&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);

let changed=0,same=0,skipped=0;
for(const [mail,rep] of Object.entries(reports)){const email=mail.toLowerCase();
  const ro=await api("GET",DOCS+"roster/"+encodeURIComponent(email),null,true);
  if(!ro){console.log("✗ "+email+": not on the student list, skipped");skipped++;continue}
  const u=(await api("POST",IT+"/accounts:lookup",{email:[email]})).users?.[0];
  if(!u){console.log("✗ "+email+": no account, skipped");skipped++;continue}
  const id=ls+"__assessment",cur=await api("GET",DOCS+"students/"+u.localId+"/results/"+id,null,true);
  if(!cur?.fields?.sections){console.log("✗ "+email+": no exam marks for "+ls+" yet (import them first with tools/exam-marks), skipped");skipped++;continue}
  if(canon(dec(cur.fields.report))===canon(rep)){same++;console.log("= "+email+": already up to date");continue}
  console.log((apply?"✓ ":"→ ")+email+" ("+(ro.fields?.group?.stringValue||"")+"): "+(cur.fields.report?"update":"new")+" report · "+(rep.questions||[]).length+" questions to review · "
    +((rep.writing||{}).errors||[]).length+" writing mistakes"+((rep.writing||{}).note?" · writing not assessable":""));
  changed++;if(!apply)continue;
  await api("PATCH",DOCS+"students/"+u.localId+"/results/"+id+"?"+mask(["report"]),{fields:{report:enc(rep)}});
}
console.log(`\n${apply?"Written":"Would write"}: ${changed} · already up to date: ${same} · skipped: ${skipped}${apply?"":"\nNothing written: run again with --apply."}`);
