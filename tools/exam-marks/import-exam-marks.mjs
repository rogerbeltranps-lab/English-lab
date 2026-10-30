// Exam marks from a CSV (Roger, 30 Oct 2026: the 4 ESO LS1 marks from his "Notes per criteri" sheet). Writes each student's section
// scores to students/{uid}/results/{ls}__assessment .sections[k] = {score, max}, the same record the dashboard's exam table saves.
// Run on Roger's PC, where the Firebase CLI is signed in as the project owner (as tools/student-accounts):
//   node tools/exam-marks/import-exam-marks.mjs <file.csv outside the repo> <ls id, e.g. 4eso-my-real-routine> [--apply]
// Without --apply it only prints what would change. CSV: a header row with `email` and one column per section key of
// EL_GRADING[ls].exam (shared/js/el-grading.js); other columns are ignored, an empty cell leaves that section as it is. Section keys the
// LS no longer has (LS1 "writing", "vocabulary", "grammar" before they were split by criterion) are removed. The maximum is the section's own.
// An optional `version` column (insecure, safe or daring) records which exam version the student took (.version, shown on the dashboard).
// A student who never signed in gets their profile (email and the student list's group), so the dashboard lists the marks under them.
// The CSV holds personal data: keep it outside the repo (e.g. C:\Developer\dades-alumnes).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import {fileURLToPath} from "node:url";

const PROJECT="english-lab-ietm";
const args=process.argv.slice(2),apply=args.includes("--apply"),[file,ls]=args.filter(a=>!a.startsWith("--"));
if(!file||!ls){console.error("Usage: node import-exam-marks.mjs <file.csv> <ls id> [--apply]");process.exit(1)}
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)),"../../shared/js/el-grading.js"),"utf8"),ctx);
const exam=(ctx.window.EL_GRADING[ls]||{}).exam;if(!exam){console.error("No exam for "+ls+" in el-grading.js");process.exit(1)}
const keys=exam.sections.map(s=>s[0]),maxOf=k=>exam.sections.find(s=>s[0]===k)[2]||exam.max;

const lines=fs.readFileSync(file,"utf8").replace(/^\uFEFF/,"").split(/\r?\n/).filter(l=>l.trim());
const head=lines[0].split(",").map(h=>h.trim().toLowerCase());
if(!head.includes("email")){console.error("The CSV needs an email column");process.exit(1)}
const rows=lines.slice(1).map(l=>Object.fromEntries(l.split(",").map((v,i)=>[head[i],v.trim()])));
const missing=keys.filter(k=>!head.includes(k));if(missing.length)console.log("Columns not in the CSV (left as they are): "+missing.join(", "));

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
const num=v=>v?.integerValue!=null?+v.integerValue:v?.doubleValue!=null?+v.doubleValue:null,str=v=>v?.stringValue??null;
const val=x=>typeof x==="number"?(Number.isInteger(x)?{integerValue:String(x)}:{doubleValue:x}):{stringValue:String(x)};
const mask=ps=>ps.map(p=>"updateMask.fieldPaths="+encodeURIComponent(p)).join("&");

let changed=0,same=0,skipped=0;
for(const row of rows){const email=(row.email||"").toLowerCase();if(!email)continue;
  const ro=await api("GET",DOCS+"roster/"+encodeURIComponent(email),null,true);
  if(!ro){console.log("✗ "+email+": not on the student list, skipped");skipped++;continue}
  const u=(await api("POST",IT+"/accounts:lookup",{email:[email]})).users?.[0];
  if(!u){console.log("✗ "+email+": no account, skipped");skipped++;continue}
  const id=ls+"__assessment",cur=await api("GET",DOCS+"students/"+u.localId+"/results/"+id,null,true);
  const cs=cur?.fields?.sections?.mapValue?.fields||{},want={},drop=Object.keys(cs).filter(k=>!keys.includes(k));
  keys.forEach(k=>{if(row[k]==null||row[k]==="")return;const sc=+row[k];if(isNaN(sc))throw new Error(email+": "+k+" is not a number");
    const c=cs[k]?.mapValue?.fields||{};if(num(c.score)!==sc||num(c.max)!==maxOf(k))want[k]={score:sc,max:maxOf(k)}});
  const ver=(row.version||"").toLowerCase(),newVer=ver&&ver!==str(cur?.fields?.version)?ver:null;
  if(ver&&!["insecure","safe","daring"].includes(ver))throw new Error(email+": version must be insecure, safe or daring, not "+row.version);
  const show=k=>{const c=cs[k]?.mapValue?.fields;return c?num(c.score)+"/"+num(c.max):"–"};
  if(!Object.keys(want).length&&!drop.length&&!newVer){same++;console.log("= "+email+": already up to date");continue}
  console.log((apply?"✓ ":"→ ")+email+" ("+str(ro.fields?.group)+"): "+Object.entries(want).map(([k,v])=>k+" "+show(k)+" → "+v.score+"/"+v.max).join(", ")+(drop.length?" · remove "+drop.map(k=>k+" "+show(k)).join(", "):"")+(newVer?" · version "+(str(cur?.fields?.version)||"–")+" → "+newVer:""));
  changed++;if(!apply)continue;
  const prof=await api("GET",DOCS+"students/"+u.localId,null,true);
  if(!prof){console.log("   (no profile yet: created with the list's group)");
    await api("PATCH",DOCS+"students/"+u.localId+"?"+mask(["email","group","name"]),{fields:{email:val(email),group:ro.fields.group,name:val("")}})}
  const paths=["ls","activity","updated",...Object.keys(want).map(k=>"sections."+k),...drop.map(k=>"sections."+k),...(newVer?["version"]:[])];
  await api("PATCH",DOCS+"students/"+u.localId+"/results/"+id+"?"+mask(paths),{fields:{ls:val(ls),activity:val(ls+"/assessment"),updated:{timestampValue:new Date().toISOString()},...(newVer?{version:val(newVer)}:{}),
    sections:{mapValue:{fields:Object.fromEntries(Object.entries(want).map(([k,v])=>[k,{mapValue:{fields:{score:val(v.score),max:val(v.max)}}}]))}}}});
}
console.log(`\n${apply?"Written":"Would write"}: ${changed} · already up to date: ${same} · skipped: ${skipped}${apply?"":"\nNothing written: run again with --apply."}`);
