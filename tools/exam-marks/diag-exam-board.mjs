// READ-ONLY diagnostic: why the student board shows "no mark yet" for the LS1 exam. Writes nothing.
// Run on Roger's PC from C:\Developer\English-lab:  node ..\dades-alumnes\diag-exam-board.mjs
import fs from "node:fs";import os from "node:os";import path from "node:path";
const PROJECT="english-lab-ietm",LS=process.argv[2]||"4eso-my-real-routine",TESTER="roger.beltran@ietramuntana.cat";
const f=path.join(process.env.XDG_CONFIG_HOME||path.join(os.homedir(),".config"),"configstore","firebase-tools.json");
const rt=JSON.parse(fs.readFileSync(f,"utf8")).tokens.refresh_token;
const tk=await (await fetch("https://oauth2.googleapis.com/token",{method:"POST",body:new URLSearchParams({grant_type:"refresh_token",refresh_token:rt,
  client_id:"563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com",client_secret:"j9iVZfS8kkCEFUPaAeJV0sAi"})})).json();
const H={authorization:"Bearer "+tk.access_token,"x-goog-user-project":PROJECT,"content-type":"application/json"};
const IT="https://identitytoolkit.googleapis.com/v1/projects/"+PROJECT,DOCS="https://firestore.googleapis.com/v1/projects/"+PROJECT+"/databases/(default)/documents/";
const get=async u=>{const r=await fetch(u,{headers:H});if(r.status===404)return null;const j=await r.json();if(!r.ok)throw new Error(u+": "+JSON.stringify(j.error));return j};
const post=async(u,b)=>{const r=await fetch(u,{method:"POST",headers:H,body:JSON.stringify(b)});const j=await r.json();if(!r.ok)throw new Error(u+": "+JSON.stringify(j.error));return j};
const sv=v=>v?.stringValue??v?.integerValue??v?.doubleValue??(v?.booleanValue!=null?String(v.booleanValue):undefined);
async function listAll(col){let out=[],pt="";do{const j=await get(DOCS+col+"?pageSize=300"+(pt?"&pageToken="+pt:""));out=out.concat(j?.documents||[]);pt=j?.nextPageToken||""}while(pt);return out}
const id=d=>d.name.split("/").pop();
// students docs by email
const st=await listAll("students"),byEmail={};st.forEach(d=>{const e=(sv(d.fields?.email)||"").toLowerCase();(byEmail[e]=byEmail[e]||[]).push(d)});
async function show(email,label){
  const users=(await post(IT+"/accounts:lookup",{email:[email]})).users||[];
  const docs=byEmail[email]||[];
  const lines=[];
  for(const u of users){const res=await listAll("students/"+u.localId+"/results");const a=res.find(r=>id(r)===LS+"__assessment");
    const sec=a?.fields?.sections?.mapValue?.fields||{};
    lines.push(`  auth uid ${u.localId.slice(0,6)}… providers=[${(u.providerUserInfo||[]).map(p=>p.providerId).join(",")}${u.passwordHash?",password-hash":""}] lastLogin=${u.lastLoginAt?new Date(+u.lastLoginAt).toISOString():"-"} profileDoc=${st.some(d=>id(d)===u.localId)?"yes":"NO"} results=${res.length} assessmentDoc=${a?"yes":"NO"} activity=${a?sv(a.fields?.activity):"-"} sections=${Object.keys(sec).length}`)}
  for(const d of docs)if(!users.some(u=>u.localId===id(d)))lines.push(`  students doc ${id(d).slice(0,6)}… with this email but NO auth user of that uid; group=${sv(d.fields?.group)}; results=${(await listAll("students/"+id(d)+"/results")).length}`);
  console.log(label+" "+email+(users.length?"":" (no auth account)")+"\n"+lines.join("\n"));
  return {users,docs};
}
console.log("=== Tester ===");await show(TESTER,"TESTER");
// every students doc that points at the tester by name
st.filter(d=>/beltran/i.test(sv(d.fields?.name)||"")).forEach(d=>console.log("  students doc named "+sv(d.fields?.name)+" uid "+id(d).slice(0,6)+"… email "+sv(d.fields?.email)+" group "+sv(d.fields?.group)));
console.log("\n=== Roster 4ESO (summary) ===");
const ro=await listAll("roster");let n={total:0,noAuth:0,noAssess:0,ok:0,wrongAct:0,neverSignedIn:0};const problems=[];
for(const r of ro){const g=sv(r.fields?.group)||"";if(!g.startsWith(LS.slice(0,4).toUpperCase()))continue;n.total++;
  const email=decodeURIComponent(id(r)).toLowerCase(),u=((await post(IT+"/accounts:lookup",{email:[email]})).users||[])[0];
  if(!u){n.noAuth++;continue}if(!u.lastLoginAt)n.neverSignedIn++;
  const a=await get(DOCS+"students/"+u.localId+"/results/"+LS+"__assessment");
  if(!a){n.noAssess++;continue}
  if(sv(a.fields?.activity)!==LS+"/assessment"){n.wrongAct++;problems.push(email.split("@")[0]+": activity="+sv(a.fields?.activity));continue}
  n.ok++}
console.log(JSON.stringify(n));problems.forEach(p=>console.log("  "+p));
