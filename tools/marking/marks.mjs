// Marking sheets from the cloud (Roger, 31 Oct 2026: "could you do it yourself instead of ChatGPT so that it's more automatic?").
// The same sheets and EL-MARKS v1 answers as the dashboard's 🤖 Marking sheet (shared/js/el-marking.js), read and written straight in
// Firestore, so Claude can mark the Reading log, Listening chart and Research card / Fact file without Roger's computer.
//   node tools/marking/marks.mjs ready                                   steps with hand-ins without a level, per group, and when they are ready
//   node tools/marking/marks.mjs audit                                   is the marking working? ❌ hand-ins ready 4+ days and still without a
//        level (exit code 2), ⏰ possible copies waiting for the teacher 7+ days; read-only
//   node tools/marking/marks.mjs sheet <group> <activity> <step>         the sheet (students as codes, never names)
//   node tools/marking/marks.mjs apply <group> <activity> <step> <answer file> [--apply] [--feedback]
//        reads the EL-MARKS v1 answer and saves the levels (students/{uid}/results/{activity}.levels[step][criterion]), as the dashboard's
//        level buttons do; --feedback also saves each line's feedback as the teacher's answer to the student (replies[step]).
//        Without --apply it only prints what would change. A line with "COPY? reason" (a possible copy) saves no level: it is kept as
//        results/{activity}.flags[step] = {why, lv, fb, at} for the teacher to accept or send back in the dashboard's To do.
// Sign-in: FIREBASE_SERVICE_ACCOUNT (the service account's JSON key, an environment secret of the cloud environment, never in the repo),
// else the Firebase CLI login on Roger's PC (as tools/exam-marks). Group = EL_GROUPS id (2ESOA…); activity = catalogue id
// (2eso/ls2-what-are-they-doing); step = the moment's step (log, chart, card, factfile). The answer file holds no names.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import {fileURLToPath} from "node:url";

const PROJECT="english-lab-ietm",ROOT=path.join(path.dirname(fileURLToPath(import.meta.url)),"../..");
const ctx={console};ctx.window=ctx;if(process.env.EL_TODAY)ctx.EL_TODAY=process.env.EL_TODAY;   // a date for tests
vm.createContext(ctx);
for(const f of ["el-catalog.js","el-criteria.js","el-plan.js","el-week.js","el-grading.js","el-marking.js"])vm.runInContext(fs.readFileSync(path.join(ROOT,"shared/js",f),"utf8"),ctx,{filename:f});
const W=ctx.window,CA_RT=["beginners","insecure"];

async function token(){
  const sa=process.env.FIREBASE_SERVICE_ACCOUNT;
  if(sa){const t=sa.trim().replace(/^['"]|['"]$/g,""),k=JSON.parse(t.startsWith("{")?t:Buffer.from(t,"base64").toString("utf8")),   // one-line JSON (or base64)
    now=Math.floor(Date.now()/1000),b=o=>Buffer.from(JSON.stringify(o)).toString("base64url");
    const un=b({alg:"RS256",typ:"JWT"})+"."+b({iss:k.client_email,scope:"https://www.googleapis.com/auth/datastore",aud:"https://oauth2.googleapis.com/token",iat:now,exp:now+3600});
    const jwt=un+"."+crypto.createSign("RSA-SHA256").update(un).sign(k.private_key).toString("base64url");
    const j=await (await fetch("https://oauth2.googleapis.com/token",{method:"POST",body:new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion:jwt})})).json();
    if(!j.access_token)throw new Error("Service account token: "+JSON.stringify(j));return j.access_token}
  const f=path.join(process.env.XDG_CONFIG_HOME||path.join(os.homedir(),".config"),"configstore","firebase-tools.json");
  const rt=fs.existsSync(f)&&JSON.parse(fs.readFileSync(f,"utf8")).tokens?.refresh_token;
  if(!rt)throw new Error("No FIREBASE_SERVICE_ACCOUNT and not signed in to the Firebase CLI.");
  const j=await (await fetch("https://oauth2.googleapis.com/token",{method:"POST",body:new URLSearchParams({grant_type:"refresh_token",refresh_token:rt,
    client_id:"563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com",client_secret:"j9iVZfS8kkCEFUPaAeJV0sAi"})})).json();   // the Firebase CLI's public client
  if(!j.access_token)throw new Error("Token: "+JSON.stringify(j));return j.access_token;
}
const TOKEN=await token(),DOCS="https://firestore.googleapis.com/v1/projects/"+PROJECT+"/databases/(default)/documents/";
async function api(method,url,body){
  const r=await fetch(url,{method,headers:{authorization:"Bearer "+TOKEN,"content-type":"application/json"},body:body&&JSON.stringify(body)});
  if(r.status===404)return null;const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(method+" "+url.split("?")[0]+": "+(j.error?.message||r.status));return j;
}
// Firestore values ⇄ plain values
const plain=v=>v==null?null:"stringValue" in v?v.stringValue:"integerValue" in v?+v.integerValue:"doubleValue" in v?v.doubleValue:"booleanValue" in v?v.booleanValue
  :"timestampValue" in v?v.timestampValue:"nullValue" in v?null:"mapValue" in v?Object.fromEntries(Object.entries(v.mapValue.fields||{}).map(([k,x])=>[k,plain(x)]))
  :"arrayValue" in v?(v.arrayValue.values||[]).map(plain):null;
const doc=d=>d?Object.fromEntries(Object.entries(d.fields||{}).map(([k,x])=>[k,plain(x)])):null;
const fsv=x=>x==null?{nullValue:null}:typeof x==="string"?{stringValue:x}:typeof x==="number"?(Number.isInteger(x)?{integerValue:String(x)}:{doubleValue:x})
  :typeof x==="boolean"?{booleanValue:x}:{mapValue:{fields:Object.fromEntries(Object.entries(x).map(([k,v])=>[k,fsv(v)]))}};
const fp=(...ks)=>ks.map(k=>/^[A-Za-z_][A-Za-z_0-9]*$/.test(k)?k:"`"+k.replace(/`/g,"\\`")+"`").join(".");
async function list(coll){const out=[];let t="";do{const j=await api("GET",DOCS+coll+"?pageSize=300"+(t?"&pageToken="+t:""));(j?.documents||[]).forEach(d=>out.push([d.name.split("/").pop(),doc(d)]));t=j?.nextPageToken||""}while(t);return out}

// students of a group: the student list's group decides (as on the dashboard), testers left out
const roster=Object.fromEntries(await list("roster")),studs=(await list("students")).map(([uid,s])=>({uid,...s,group:(roster[(s.email||"").toLowerCase()]||{}).group||s.group}));
const TESTERS=JSON.parse((/TESTERS=(\[[^\]]*\])/.exec(fs.readFileSync(path.join(ROOT,"shared/js/el-firebase.js"),"utf8"))||[,"[]"])[1]),isTester=s=>TESTERS.includes((s.email||"").toLowerCase());   // as ELCloud.isTester
const cache={};
async function student(uid,ls,aid){const k=uid+"|"+ls+"|"+aid;if(cache[k])return cache[k];const rk=aid.replace("/","__");
  const L=W.EL_LS.filter(l=>l.course===ls.split("-")[0]),upto=L.slice(0,L.findIndex(l=>l.id===ls)+1);
  const [pg,rs,lv,...ex]=await Promise.all([api("GET",DOCS+`students/${uid}/progress/${ls}`),api("GET",DOCS+`students/${uid}/results/${rk}`),api("GET",DOCS+`students/${uid}/levels`),
    ...upto.map(l=>api("GET",DOCS+`students/${uid}/results/${l.id}__assessment`))]);
  const lvs=Object.fromEntries((lv?.documents||[]).map(d=>[d.name.split("/").pop(),doc(d)]));
  const exam=ex.map((d,i)=>{const w=((doc(d)||{}).sections||{}).writing||{};return w.score!=null&&w.score!==""?`LS${i+1} ${w.score}/${w.max||10}`:null}).filter(Boolean).join(", ");   // exam writing so far
  return cache[k]={data:(doc(pg)||{}).data||{},res:doc(rs)||{},route:W.elRouteOf(lvs,ls).level,exam};
}
const moments=ls=>((W.EL_GRADING[ls]||{}).moments||[]).filter(m=>{const a=W.EL_CATALOG.find(x=>x.id===m.a);return !m.group&&a&&!a.manual&&a.ls===ls});
async function todo(grp,m){const a=W.EL_CATALOG.find(x=>x.id===m.a),out=[];
  for(const s of studs.filter(x=>x.group===grp.id&&!isTester(x))){const st=await student(s.uid,a.ls,a.id);
    let h=null;try{h=(JSON.parse(st.data[a.keys[0]]||"{}").steps||{})[m.step]}catch(e){}
    const lv=((st.res.levels||{})[m.step])||{},f=((st.res.flags||{})[m.step]);
    const waits=!!f&&!(f.done==="redo"&&h&&h.date>f.at);   // a possible copy waiting for the teacher (as mkWaits in teacher.html)
    const again=!!h&&!!(st.res.marked||{})[m.step]&&h.date>st.res.marked[m.step];   // handed in again after the sheet marked it (as mkAgain)
    if(h&&(!m.c.every(c=>lv[c])||again)&&!waits)out.push({s,h,route:st.route,exam:st.exam})}
  return out.sort((x,y)=>x.s.uid<y.s.uid?-1:1)}
function readyOf(grp,ls,m,ticks){const p=W.EL_PLAN[ls],gi=p?W.ELWeek.col(p,grp.id):-1,due=p&&p.due&&p.due[m.a]?p.due[m.a][gi]:null,a=W.EL_CATALOG.find(x=>x.id===m.a);
  return W.ELMark.ready({p,gi,due,title:a.title,ticks,ls})}
function sheetOf(grp,m,rows){const a=W.EL_CATALOG.find(x=>x.id===m.a),g=W.EL_GRADING[a.ls],course=a.ls.split("-")[0],codes=W.ELMark.codes(rows.map(r=>r.s.uid)),by=Object.fromEntries(rows.map(r=>[r.s.uid,r]));
  const names=Object.fromEntries((W.EL_LEVELS||[]).map(l=>[l.id,l.name]));
  const text=W.ELMark.sheet({aid:m.a,title:a.title,step:m.step,stepName:m.name,group:grp.name,date:W.ELWeek.today(),crits:m.c,
    crit:Object.fromEntries(m.c.map(c=>[c,`${c} · ${W.elCompetence(c)}: ${W.elCriterion(course,c)||""}`])),ind:g.ind,
    students:[...codes].map(([code,u])=>({code,route:names[by[u].route]||by[u].route,ca:CA_RT.includes(by[u].route),exam:by[u].exam,ty:by[u].h.ty,fields:by[u].h.f}))});
  return {text,codes:new Map([...codes].map(([c,u])=>[c,by[u]]))}}

const [cmd,...rest]=process.argv.slice(2),flags=new Set(rest.filter(x=>x.startsWith("--"))),args=rest.filter(x=>!x.startsWith("--"));
const grpOf=id=>{const g=W.EL_GROUPS.find(x=>x.id===id);if(!g)throw new Error("No group "+id);return g};
const momentOf=(aid,step)=>{const a=W.EL_CATALOG.find(x=>x.id===aid),m=a&&moments(a.ls).find(x=>x.a===aid&&x.step===step);if(!m)throw new Error("No marking step "+aid+" · "+step);return m};
if(cmd==="ready"){const today=W.ELWeek.today();
  for(const grp of W.EL_GROUPS){const ticks=(doc(await api("GET",DOCS+"teacherPlan/"+grp.id))||{}).ticks||{};
    for(const ls of Object.keys(W.EL_GRADING).filter(l=>l.startsWith(grp.course+"-")))for(const m of moments(ls)){
      const rows=await todo(grp,m);if(!rows.length)continue;const r=readyOf(grp,ls,m,ticks),now=!!(r.from&&today>=r.from);
      console.log([now?"READY":"wait ",grp.id,m.a,m.step,rows.length+" to mark",r.from?"from "+r.from:r.line?"session not ticked: "+r.line:"no session in the plan"].join(" · "))}}}
else if(cmd==="audit"){   // is the weekly marking working? (Roger, 31 Oct 2026: "a command to audit what you do and warn me if it's not working")
  const today=W.ELWeek.today(),days=(a,b)=>Math.round((Date.parse(a)-Date.parse(b))/864e5),LATE=4,problems=[],remind=[],ok=[];
  for(const grp of W.EL_GROUPS){const ticks=(doc(await api("GET",DOCS+"teacherPlan/"+grp.id))||{}).ticks||{};
    for(const ls of Object.keys(W.EL_GRADING).filter(l=>l.startsWith(grp.course+"-")))for(const m of moments(ls)){
      const a=W.EL_CATALOG.find(x=>x.id===m.a),rows=await todo(grp,m),r=readyOf(grp,ls,m,ticks);
      // a late hand-in counts from the day it came in, not from when the step was ready
      if(rows.length&&r.from&&today>=r.from){const since=x=>{const h=String(x.h.date||"").slice(0,10);return h>r.from?h:r.from},late=rows.filter(x=>days(today,since(x))>=LATE);
        if(late.length)problems.push(`${grp.id} · ${m.name} (${a.title}): ${late.length} hand-in${late.length>1?"s":""} ready since ${late.map(since).sort()[0]} still without a level (${days(today,late.map(since).sort()[0])} days late)`);
        if(rows.length>late.length)ok.push(`${grp.id} · ${m.name} (${a.title}): ${rows.length-late.length} hand-in${rows.length-late.length>1?"s":""} to mark at the next run`)}
      // possible copies waiting for the teacher
      for(const s of studs.filter(x=>x.group===grp.id&&!isTester(x))){const st=await student(s.uid,a.ls,a.id),f=(st.res.flags||{})[m.step];
        if(f&&!f.done&&days(today,String(f.at).slice(0,10))>=7)remind.push(`${grp.id} · ${m.name}: a possible copy waiting for you since ${String(f.at).slice(0,10)}`)}}}
  console.log(`AUDIT ${today}: ${problems.length?"PROBLEMS":"OK"}`);
  problems.forEach(x=>console.log("❌ "+x));remind.forEach(x=>console.log("⏰ "+x));ok.forEach(x=>console.log("🤖 to mark now: "+x));
  if(!problems.length&&!remind.length&&!ok.length)console.log("Nothing waiting: every hand-in that is ready has a level.");
  if(problems.length)process.exitCode=2}
else if(cmd==="sheet"){const [gid,aid,step]=args,grp=grpOf(gid),m=momentOf(aid,step),rows=await todo(grp,m);
  console.log(rows.length?sheetOf(grp,m,rows).text:"Nothing to mark: every hand-in has a level.")}
else if(cmd==="apply"){const [gid,aid,step,file]=args,grp=grpOf(gid),m=momentOf(aid,step),rows=await todo(grp,m),sh=sheetOf(grp,m,rows);
  const r=W.ELMark.parse(fs.readFileSync(file,"utf8"),{aid:m.a,step:m.step,crits:m.c,codes:sh.codes});if(r.err)throw new Error(r.err);
  const a=W.EL_CATALOG.find(x=>x.id===m.a),rk=a.id.replace("/","__");
  for(const x of r.rows){const s=sh.codes.get(x.code).s,fb=flags.has("--feedback")&&x.fb;
    console.log((flags.has("--apply")?"✓ ":"→ ")+x.code+" · "+Object.entries(x.lv).map(([c,l])=>c+"="+l).join(" ")+(x.flag?" · ⚠️ POSSIBLE COPY (no level, to the To do): "+x.flag:fb?" · feedback: "+x.fb:""));
    if(!flags.has("--apply"))continue;
    if(x.flag){await api("PATCH",DOCS+`students/${s.uid}/results/${rk}?`+["ls","activity","updated",fp("flags",m.step)].map(p=>"updateMask.fieldPaths="+encodeURIComponent(p)).join("&"),
      {fields:{ls:fsv(a.ls),activity:fsv(a.id),updated:{timestampValue:new Date().toISOString()},flags:fsv({[m.step]:{why:x.flag,lv:x.lv,fb:fb?x.fb:"",at:new Date().toISOString()}})}});continue}
    const paths=["ls","activity","updated",...m.c.map(c=>fp("levels",m.step,c)),fp("marked",m.step),...(fb?[fp("replies",m.step)]:[])];
    await api("PATCH",DOCS+`students/${s.uid}/results/${rk}?`+paths.map(p=>"updateMask.fieldPaths="+encodeURIComponent(p)).join("&"),
      {fields:{ls:fsv(a.ls),activity:fsv(a.id),updated:{timestampValue:new Date().toISOString()},levels:fsv({[m.step]:x.lv}),marked:fsv({[m.step]:new Date().toISOString()}),...(fb?{replies:fsv({[m.step]:x.fb})}:{})}})}
  const nf=r.rows.filter(x=>x.flag).length;
  console.log(`\n${flags.has("--apply")?"Saved":"Would save"}: ${r.rows.length-nf} · possible copies for the teacher: ${nf} · no line: ${r.missing.length} · lines left out: ${r.bad.length}${flags.has("--apply")?"":"\nNothing written: run again with --apply."}`)}
else{console.log("Usage: node tools/marking/marks.mjs ready | audit | sheet <group> <activity> <step> | apply <group> <activity> <step> <answer file> [--apply] [--feedback]");process.exit(1)}
