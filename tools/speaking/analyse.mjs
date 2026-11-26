// 🗣 Roig's speaking analysis of every new recording, every weekday (Roger, 24 Nov 2026: "I wanted to quantify the words they pronounce
// well … and the structure of the speech and over time decide a way of comparing it"; he chose "every recording, every day").
// The same analysis as the dashboard's 🔍 Analyse in 🗣 Speaking (teacher.html spkOne): each Speaking, Talk and 🎲 Surprise questions
// recording handed in (progress steps with x.audio, not Shadowing x.sh) and not analysed yet goes to the school script (v38, action
// "speak_an" with the key) and its answer is saved in settings/spk_{ls}_{group}[uid][Drive file id] = {a, k, at, an, model, eur, done}.
// FOR THE TEACHER ONLY: students never read settings, and nothing is sent to them. Final product videos stay on the dashboard's button.
//   node tools/speaking/analyse.mjs            what would be analysed, per group and LS, and about how much it costs (reads only)
//   node tools/speaking/analyse.mjs --apply    analyse them (about €0.006 each, Roig Flash) and save
// Step of the scheduled task "English Lab: mark and correct" (weekdays). Sign-in: FIREBASE_SERVICE_ACCOUNT; the script: SCHOOL_MAIL_URL
// + SCHOOL_MAIL_KEY (environment secrets, never in the repo). Reads: the roster, the students, one progress doc per student and course
// LS, one settings doc per LS and group, and the levels of a student only when they have a new recording.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import {fileURLToPath} from "node:url";

const ROOT=path.join(path.dirname(fileURLToPath(import.meta.url)),"../.."),APPLY=process.argv.includes("--apply"),EUR=0.006,MAX=+(process.env.SPK_MAX||120);
const ctx={console};ctx.window=ctx;vm.createContext(ctx);
for(const f of ["el-catalog.js","el-criteria.js","el-grading.js"])vm.runInContext(fs.readFileSync(path.join(ROOT,"shared/js",f),"utf8"),ctx,{filename:f});
const W=ctx.window;
const RELAY=(process.env.SCHOOL_MAIL_URL||"").trim(),KEY=(process.env.SCHOOL_MAIL_KEY||"").trim();

async function token(){const sa=(process.env.FIREBASE_SERVICE_ACCOUNT||"").trim().replace(/^['"]|['"]$/g,"");if(!sa)throw new Error("No FIREBASE_SERVICE_ACCOUNT.");
  const k=JSON.parse(sa.startsWith("{")?sa:Buffer.from(sa,"base64").toString("utf8")),now=Math.floor(Date.now()/1000),b=o=>Buffer.from(JSON.stringify(o)).toString("base64url");
  const un=b({alg:"RS256",typ:"JWT"})+"."+b({iss:k.client_email,scope:"https://www.googleapis.com/auth/datastore",aud:"https://oauth2.googleapis.com/token",iat:now,exp:now+3600});
  const jwt=un+"."+crypto.createSign("RSA-SHA256").update(un).sign(k.private_key).toString("base64url");
  const j=await (await fetch("https://oauth2.googleapis.com/token",{method:"POST",body:new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion:jwt})})).json();
  if(!j.access_token)throw new Error("Service account token failed");return j.access_token}
const TOKEN=await token(),DOCS="https://firestore.googleapis.com/v1/projects/english-lab-ietm/databases/(default)/documents/";
async function api(method,url,body){const r=await fetch(url,{method,headers:{authorization:"Bearer "+TOKEN,"content-type":"application/json"},body:body&&JSON.stringify(body)});
  if(r.status===404)return null;const j=await r.json().catch(()=>({}));if(r.status===429)throw new Error("Firestore quota (429): stopped, nothing more read");
  if(!r.ok)throw new Error(method+" "+url.split("?")[0]+": "+(j.error?.message||r.status));return j}
const plain=v=>v==null?null:"stringValue" in v?v.stringValue:"integerValue" in v?+v.integerValue:"doubleValue" in v?v.doubleValue:"booleanValue" in v?v.booleanValue
  :"timestampValue" in v?v.timestampValue:"nullValue" in v?null:"mapValue" in v?Object.fromEntries(Object.entries(v.mapValue.fields||{}).map(([k,x])=>[k,plain(x)]))
  :"arrayValue" in v?(v.arrayValue.values||[]).map(plain):null;
const doc=d=>d?Object.fromEntries(Object.entries(d.fields||{}).map(([k,x])=>[k,plain(x)])):null;
const fsv=x=>x==null?{nullValue:null}:typeof x==="string"?{stringValue:x}:typeof x==="number"?(Number.isInteger(x)?{integerValue:String(x)}:{doubleValue:x})
  :typeof x==="boolean"?{booleanValue:x}:Array.isArray(x)?{arrayValue:{values:x.map(fsv)}}:{mapValue:{fields:Object.fromEntries(Object.entries(x).map(([k,v])=>[k,fsv(v)]))}};
const fp=(...ks)=>ks.map(k=>/^[A-Za-z_][A-Za-z_0-9]*$/.test(k)?k:"`"+k.replace(/`/g,"\\`")+"`").join(".");
async function list(coll){const out=[];let t="";do{const j=await api("GET",DOCS+coll+"?pageSize=300"+(t?"&pageToken="+t:""));(j?.documents||[]).forEach(d=>out.push([d.name.split("/").pop(),doc(d)]));t=j?.nextPageToken||""}while(t);return out}

const roster=Object.fromEntries(await list("roster"));
const TESTERS=JSON.parse((/TESTERS=(\[[^\]]*\])/.exec(fs.readFileSync(path.join(ROOT,"shared/js/el-firebase.js"),"utf8"))||[,"[]"])[1]);
const studs=(await list("students")).map(([uid,s])=>({uid,...s,group:(roster[(s.email||"").toLowerCase()]||{}).group||s.group}))
  .filter(s=>!TESTERS.includes((s.email||"").toLowerCase())&&W.EL_GROUPS.some(g=>g.id===s.group));
const cefr=ls=>/my-real-routine/.test(ls)&&ls.startsWith("2eso")?"A1":"A2+";   // as teacher.html spkCefr
const todo=[],settings={};
for(const grp of W.EL_GROUPS){const lss=W.EL_LS.filter(l=>l.course===grp.course&&!l.personal);
  for(const l of lss){const sid="spk_"+l.id+"_"+grp.id;settings[sid]=(doc(await api("GET",DOCS+"settings/"+sid))||{});
    const acts=W.EL_CATALOG.filter(a=>a.ls===l.id&&a.keys&&a.keys.length);
    for(const s of studs.filter(x=>x.group===grp.id)){const pg=(doc(await api("GET",DOCS+`students/${s.uid}/progress/${l.id}`))||{}).data||{};
      for(const a of acts){let st={};try{st=JSON.parse(pg[a.keys[0]]||"{}").steps||{}}catch(e){}
        for(const [k,x] of Object.entries(st)){if(!x||!x.audio||!x.audio.id||x.sh)continue;if(((settings[sid][s.uid]||{})[x.audio.id]))continue;
          const qf=((x.f||[]).find(y=>y.l==="Questions asked")||{}).v,qs=x.sq&&qf?String(qf).replace(/\s*\n\s*/g," / "):"";
          todo.push({grp,ls:l.id,sid,s,a,k,fid:x.audio.id,at:x.date||null,task:(a.title||a.id)+" · "+(x.title||k)+(qs?" · four surprise questions answered without preparation, easy to harder: "+qs:"")})}}}}}
const by={};todo.forEach(r=>{const k=r.grp.id+" · "+r.ls;by[k]=(by[k]||0)+1});
Object.entries(by).forEach(([k,n])=>console.log(`SPEAKING · ${k} · ${n} new recording${n>1?"s":""}`));
console.log(`${todo.length} recording${todo.length===1?"":"s"} to analyse · about €${(todo.length*EUR).toFixed(2)}${todo.length>MAX?` (this run does the newest ${MAX})`:""}`);
if(!APPLY){if(todo.length)console.log("Nothing analysed: run again with --apply.");process.exit(0)}
if(!RELAY||!KEY)throw new Error("No SCHOOL_MAIL_URL / SCHOOL_MAIL_KEY: cannot reach the school script.");
todo.sort((p,q)=>String(q.at).localeCompare(String(p.at)));
const lvCache={};let ok=0,bad=0,eur=0;
for(const r of todo.slice(0,MAX)){
  if(!(r.s.uid in lvCache))lvCache[r.s.uid]=Object.fromEntries(((await api("GET",DOCS+`students/${r.s.uid}/levels`))?.documents||[]).map(d=>[d.name.split("/").pop(),doc(d)]));
  const level=W.elRouteOf(lvCache[r.s.uid],r.ls).level||"";
  let j=null;try{const res=await fetch(RELAY,{method:"POST",headers:{"content-type":"text/plain"},body:JSON.stringify({key:KEY,action:"speak_an",fileId:r.fid,task:r.task,level,course:r.ls.startsWith("2eso")?"2 ESO":"4 ESO",cefr:cefr(r.ls)}),redirect:"follow"});j=await res.json()}catch(e){j={ok:false,error:String(e.message||e)}}
  if(!j||!j.ok){bad++;console.log(`✗ ${r.grp.id} · ${r.a.id} · ${r.k}: ${j&&j.error||"no answer"}`);if(/not the teacher/.test(j&&j.error||""))break;continue}
  const rec={a:r.a.id,k:r.k,at:r.at,an:j.an,model:j.model||"",eur:j.eur==null?null:j.eur,done:new Date().toISOString(),by:"run"};
  await api("PATCH",DOCS+"settings/"+r.sid+"?updateMask.fieldPaths="+encodeURIComponent(fp(r.s.uid,r.fid)),{fields:{[r.s.uid]:fsv({[r.fid]:rec})}});
  ok++;eur+=+j.eur||0;console.log(`✓ ${r.grp.id} · ${r.a.id} · ${r.k}${j.an&&j.an.n&&j.an.n.words?` · ${j.an.n.clear}/${j.an.n.words} words clear`:""}`)}
console.log(`\nAnalysed: ${ok} · could not: ${bad} · Roig €${eur.toFixed(3)}`);
