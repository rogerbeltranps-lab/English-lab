// Students' problem reports handled by Claude (Roger, 8 Nov 2026: "When somebody reports a problem I want you to read it straightaway and,
// if it's a real problem, fix it and answer the student that it is fixed straightaway. Merge, but it must be a technical problem, not a
// design or pedagogical thing." + "I must be informed though via mail, with an important subject").
// Used by the scheduled task "English Lab: problem reports" (see docs/general/problem-reports-auto.md for the whole routine).
//   node tools/problems/auto.mjs open                  the open reports Claude has not looked at yet (no problems/{id}.auto), oldest first,
//                                                       with everything the report holds; the screenshot is saved to a temp file to look at
//   node tools/problems/auto.mjs open --all            every open report, also the ones already looked at (left for Roger)
//   node tools/problems/auto.mjs fixed <id> [--msg "..."] [--note "..."] [--apply]
//        the bug is fixed and merged: the student gets the ✅ fixed card (problemReplies/{id}, kind "fixed", the same note as the dashboard's
//        "✅ Mark as fixed", in the report's language), with --msg as the teacher's own words under it (≤1000 characters, Roger's voice, the
//        report's language, never AI); the report is marked fixed, msg kept in problems/{id}.msgs like "✅ Send and mark as fixed", and
//        problems/{id}.auto = {verdict:"fixed", note, at (timestamp)} (note = what was fixed + PR, for Roger; the dashboard shows it). The
//        GitHub Action "English Lab emails" (notify.mjs --instant) then sends Roger the "⚠️ IMPORTANT" email: run it at once with
//        workflow_dispatch, send = "new reports and ideas to me" (its 15-minute schedule is only the backup).
//   node tools/problems/auto.mjs leave <id> --note "..." [--apply]
//        not a technical bug (design, pedagogy, marking, a route, unclear…): nothing is sent to the student and the report stays open for
//        Roger with problems/{id}.auto = {verdict:"roger", note, at}, so later runs skip it.
// Without --apply it only prints what it would write. Sign-in: FIREBASE_SERVICE_ACCOUNT (the cloud environment's secret, can write).
// Reads: one list of problems (a few dozen documents) + one screenshot per new report. Personal data stays in Firestore and the session.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import {fileURLToPath} from "node:url";

const ROOT=path.join(path.dirname(fileURLToPath(import.meta.url)),"../.."),PROJECT="english-lab-ietm",MSG_MAX=1000;
const [cmd,id,...rest]=process.argv.slice(2),flag=f=>rest.includes(f)||process.argv.includes(f),opt=f=>{const i=rest.indexOf(f);return i>=0?rest[i+1]:null};
const ctx={console};ctx.window=ctx;vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(ROOT,"shared/js/el-catalog.js"),"utf8"),ctx);
const elCa=ctx.window.elCa;

async function token(){
  const t=(process.env.FIREBASE_SERVICE_ACCOUNT||"").trim().replace(/^['"]|['"]$/g,"");if(!t)throw new Error("Missing FIREBASE_SERVICE_ACCOUNT");
  const k=JSON.parse(t.startsWith("{")?t:Buffer.from(t,"base64").toString("utf8")),now=Math.floor(Date.now()/1000),b=o=>Buffer.from(JSON.stringify(o)).toString("base64url");
  const un=b({alg:"RS256",typ:"JWT"})+"."+b({iss:k.client_email,scope:"https://www.googleapis.com/auth/datastore",aud:"https://oauth2.googleapis.com/token",iat:now,exp:now+3600});
  const jwt=un+"."+crypto.createSign("RSA-SHA256").update(un).sign(k.private_key).toString("base64url");
  const j=await (await fetch("https://oauth2.googleapis.com/token",{method:"POST",body:new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion:jwt})})).json();
  if(!j.access_token)throw new Error("Service account sign-in failed: "+(j.error||"no token"));return j.access_token;
}
const TOKEN=await token(),BASE="projects/"+PROJECT+"/databases/(default)/documents",DOCS="https://firestore.googleapis.com/v1/"+BASE+"/";
async function api(method,url,body){
  const r=await fetch(url,{method,headers:{authorization:"Bearer "+TOKEN,"content-type":"application/json"},body:body&&JSON.stringify(body)});
  if(r.status===404)return null;const j=await r.json().catch(()=>({}));
  if(r.status===429)throw new Error("Firestore quota reached (429): try again later, nothing was read as empty");
  if(!r.ok)throw new Error(method+" "+url.split("?")[0]+": "+(j.error?.message||r.status));return j;
}
const plain=v=>v==null?null:"stringValue" in v?v.stringValue:"integerValue" in v?+v.integerValue:"doubleValue" in v?v.doubleValue:"booleanValue" in v?v.booleanValue
  :"timestampValue" in v?v.timestampValue:"nullValue" in v?null:"mapValue" in v?Object.fromEntries(Object.entries(v.mapValue.fields||{}).map(([k,x])=>[k,plain(x)]))
  :"arrayValue" in v?(v.arrayValue.values||[]).map(plain):null;
const doc=d=>d?Object.fromEntries(Object.entries(d.fields||{}).map(([k,x])=>[k,plain(x)])):null;
const fsv=x=>x==null?{nullValue:null}:typeof x==="string"?{stringValue:x}:typeof x==="number"?(Number.isInteger(x)?{integerValue:String(x)}:{doubleValue:x})
  :typeof x==="boolean"?{booleanValue:x}:x instanceof Date?{timestampValue:x.toISOString()}:Array.isArray(x)?{arrayValue:{values:x.map(fsv)}}:{mapValue:{fields:Object.fromEntries(Object.entries(x).map(([k,v])=>[k,fsv(v)]))}};
async function list(coll){const out=[];let t="";do{const j=await api("GET",DOCS+coll+"?pageSize=300"+(t?"&pageToken="+t:""));(j?.documents||[]).forEach(d=>out.push(Object.assign({id:d.name.split("/").pop()},doc(d))));t=j?.nextPageToken||""}while(t);return out}
const when=x=>Date.parse(x.created||"")||0;

if(cmd==="open"){
  const L=(await list("problems")).filter(x=>!x.fixed&&(flag("--all")||!x.auto)).sort((a,b)=>when(a)-when(b));
  // students' new comments (Roger, 9 Nov 2026: "I want you to answer straight away"): the same task answers them. One query: students whose
  // page saved a comment after settings/marking.cmtRun (el-cloud.js sets students/{uid}.commented; marks.mjs comments --new reads them).
  const since=(doc(await api("GET",DOCS+"settings/marking"))||{}).cmtRun||"1970-01-01T00:00:00Z";
  const nc=((await api("POST",DOCS.replace(/\/$/,"")+":runQuery",{structuredQuery:{from:[{collectionId:"students"}],where:{fieldFilter:{field:{fieldPath:"commented"},op:"GREATER_THAN",value:{timestampValue:since}}}}}))||[]).filter(x=>x.document).length;
  console.log(L.length?L.length+" open report(s)"+(flag("--all")?"":" not looked at yet")+".":nc?"No open report to look at.":"Nothing new: no open report to look at and no new comment.");
  if(nc)console.log(`NEW COMMENTS: ${nc} student(s) wrote a comment since the last run. Answer them: docs/general/problem-reports-auto.md, section "Students' comments, answered at once" (node tools/marking/marks.mjs comments --new).`);
  for(const x of L){
    const en=!!x.route&&!elCa(x.route);
    console.log("\n=== "+x.id+" · "+(x.created||"?")+" · "+(x.name||"?")+" ("+(x.group||"no group")+", route "+(x.route||"none")+" → answer in "+(en?"English":"Catalan")+")");
    console.log("kind: "+x.kind+"\nwords: "+(x.text?JSON.stringify(x.text):"(none)")+"\npage: "+x.page+"\ntitle: "+x.title+"\nsection: "+x.section+"\nls: "+x.ls+" · activity: "+x.activity+"\ndevice: "+x.device);
    if((x.errors||[]).length)console.log("errors:\n  "+x.errors.map(e=>typeof e==="string"?e:JSON.stringify(e)).join("\n  "));
    if((x.msgs||[]).length)console.log("already answered: "+x.msgs.map(m=>JSON.stringify(m.text)).join(" | "));
    if(x.auto)console.log("looked at: "+x.auto.verdict+" · "+x.auto.note);
    if(x.shot){const s=doc(await api("GET",DOCS+"problemShots/"+x.id));if(s&&s.img){const f=path.join(os.tmpdir(),"problem-"+x.id+".jpg");fs.writeFileSync(f,Buffer.from(s.img.split(",")[1],"base64"));console.log("screenshot: "+f+" (careful: shots taken before 6 Nov 2026 can show the folded Study guide over the page)")}}
    console.log("live page: https://rogerbeltranps-lab.github.io/English-lab/"+String(x.page||"").replace(/^\//,""));
  }
  process.exit(0);
}

if(cmd==="fixed"||cmd==="leave"){
  if(!id)throw new Error("Which report? node tools/problems/auto.mjs "+cmd+" <id> …");
  const x=doc(await api("GET",DOCS+"problems/"+id));if(!x)throw new Error("No report "+id);
  if(x.fixed)throw new Error("Report "+id+" is already marked as fixed: nothing to do.");
  const note=String(opt("--note")||"").trim().slice(0,500),now=new Date().toISOString();
  if(cmd==="leave"&&!note)throw new Error("leave needs --note \"why Roger should look at it\"");
  const writes=[];
  if(cmd==="leave"){
    writes.push({update:{name:BASE+"/problems/"+id,fields:{auto:fsv({verdict:"roger",note,at:new Date(now)})}},updateMask:{fieldPaths:["auto"]}});
  }else{
    const msg=String(opt("--msg")||"").trim().slice(0,MSG_MAX),en=!!x.route&&!elCa(x.route);
    const reply={uid:x.uid,kind:"fixed",what:x.kind||"other",text:String(x.text||"").slice(0,300),where:String((/^(com estudiar|how to study)$/i.test(x.section||"")?"":x.section)||x.title||"").slice(0,200),en};   // "How to study" = the folded Study guide (reports before PR #290), not where they were
    if(msg)reply.msg=msg;
    writes.push({update:{name:BASE+"/problemReplies/"+id,fields:Object.fromEntries(Object.entries(reply).map(([k,v])=>[k,fsv(v)]))},
      updateTransforms:[{fieldPath:"created",setToServerValue:"REQUEST_TIME"}]});
    const w={update:{name:BASE+"/problems/"+id,fields:{fixed:fsv(true),auto:fsv({verdict:"fixed",note,at:new Date(now)})}},updateMask:{fieldPaths:["fixed","auto"]}};
    if(msg)w.updateTransforms=[{fieldPath:"msgs",appendMissingElements:{values:[fsv({text:msg,at:now,rid:id,fix:true})]}}];
    writes.push(w);
    console.log("Student card ("+(en?"English":"Catalan")+"): ✅ fixed"+(msg?" + message: "+JSON.stringify(msg):""));
  }
  console.log("Report "+id+" ("+(x.name||"?")+", "+(x.group||"")+"): "+(cmd==="fixed"?"marked fixed":"left for Roger")+(note?" · note: "+note:""));
  if(!flag("--apply")){console.log("(dry run: add --apply to save)");process.exit(0)}
  await api("POST","https://firestore.googleapis.com/v1/"+BASE+":commit",{writes});
  console.log("Saved ✓");
  process.exit(0);
}

console.log("Usage: node tools/problems/auto.mjs open [--all] | fixed <id> [--msg \"...\"] [--note \"...\"] [--apply] | leave <id> --note \"...\" [--apply]");
process.exit(1);
