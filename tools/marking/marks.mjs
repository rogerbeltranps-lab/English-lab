// Marking sheets from the cloud (Roger, 31 Oct 2026: "could you do it yourself instead of ChatGPT so that it's more automatic?").
// The same sheets and EL-MARKS v1 answers as the dashboard's 🤖 Marking sheet (shared/js/el-marking.js), read and written straight in
// Firestore, so Claude can mark the Reading log, Listening chart and Research card / Fact file without Roger's computer.
//   node tools/marking/marks.mjs ready                                   steps with hand-ins without a level, per group, and when they are ready
//   node tools/marking/marks.mjs fb-ready | fb-sheet <group> <activity> <step> | fb-apply <group> <activity> <step> <file> [--apply]
//        the same for corrections without a level (writing and speaking texts, Talk transcripts, other hand-ins): see "Corrections without a level"
//   node tools/marking/marks.mjs audit                                   is the marking working? ❌ hand-ins ready before the last Wednesday run
//        and still without a level or correction (exit code 2), ⏰ possible copies waiting for the teacher 7+ days; read-only
//   node tools/marking/marks.mjs sheet <group> <activity> <step>         the sheet (students as codes, never names)
//   node tools/marking/marks.mjs apply <group> <activity> <step> <answer file> [--apply] [--feedback]
//        reads the EL-MARKS v1 answer and saves the levels (students/{uid}/results/{activity}.levels[step][criterion]), as the dashboard's
//        level buttons do; --feedback also saves each line's feedback as the teacher's answer to the student (replies[step]).
//        Without --apply it only prints what would change. A line with "COPY? reason" (a possible copy) saves no level: it is kept as
//        results/{activity}.flags[step] = {why, lv, fb, at} for the teacher to accept or send back in the dashboard's To do.
//        Feedback is marked fbBy[step] = "marking", so it never counts as the answer to a student's comment.
//   node tools/marking/marks.mjs comments                                  the comments sheet: every student comment on a hand-in still
//        waiting for an answer (ELMark.open, not handed to the teacher), all groups, with the hand-in and the content file to read
//   node tools/marking/marks.mjs answer <answer file> [--apply]             saves the EL-ANSWERS v1 answer: ANSWER → answers[step] =
//        {t, q, at} (the student sees it as the teacher's answer), FORYOU → ask[step] = {why, q, at} (🙋 in the dashboard's To do)
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
const once=(k,f)=>cache[k]||(cache[k]=f());   // each document read once per run
async function student(uid,ls,aid){const rk=aid.replace("/","__");
  const L=W.EL_LS.filter(l=>l.course===ls.split("-")[0]),upto=L.slice(0,L.findIndex(l=>l.id===ls)+1);
  const [pg,rs,lv,...ex]=await Promise.all([once("p|"+uid+"|"+ls,()=>api("GET",DOCS+`students/${uid}/progress/${ls}`)),once("r|"+uid+"|"+rk,()=>api("GET",DOCS+`students/${uid}/results/${rk}`)),
    once("l|"+uid,()=>api("GET",DOCS+`students/${uid}/levels`)),...upto.map(l=>once("r|"+uid+"|"+l.id+"__assessment",()=>api("GET",DOCS+`students/${uid}/results/${l.id}__assessment`)))]);
  const lvs=Object.fromEntries((lv?.documents||[]).map(d=>[d.name.split("/").pop(),doc(d)]));
  const exam=ex.map((d,i)=>{const w=((doc(d)||{}).sections||{}).writing||{};return w.score!=null&&w.score!==""?`LS${i+1} ${w.score}/${w.max||10}`:null}).filter(Boolean).join(", ");   // exam writing so far
  return {data:(doc(pg)||{}).data||{},res:doc(rs)||{},route:W.elRouteOf(lvs,ls).level,exam};
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
  return W.ELMark.ready({p,gi,due,title:a.title,ticks,ls,atOnce:m.atOnce})}
function sheetOf(grp,m,rows){const a=W.EL_CATALOG.find(x=>x.id===m.a),g=W.EL_GRADING[a.ls],course=a.ls.split("-")[0],codes=W.ELMark.codes(rows.map(r=>r.s.uid)),by=Object.fromEntries(rows.map(r=>[r.s.uid,r]));
  const names=Object.fromEntries((W.EL_LEVELS||[]).map(l=>[l.id,l.name]));
  const text=W.ELMark.sheet({aid:m.a,title:a.title,step:m.step,stepName:m.name,group:grp.name,date:W.ELWeek.today(),crits:m.c,
    crit:Object.fromEntries(m.c.map(c=>[c,`${c} · ${W.elCompetence(c)}: ${W.elCriterion(course,c)||""}`])),ind:g.ind,
    students:[...codes].map(([code,u])=>({code,route:names[by[u].route]||by[u].route,ca:!by[u].route||CA_RT.includes(by[u].route),exam:by[u].exam,ty:by[u].h.ty,fields:by[u].h.f}))});
  return {text,codes:new Map([...codes].map(([c,u])=>[c,by[u]]))}}

// ---- Corrections without a level (Roger, 31 Oct 2026: "the idea is that if they work more, they can have all the corrections"): every
// other piece a student writes in a learning path (writing and speaking panels: the final version, else the text sent for AI feedback;
// Talk transcripts; other hand-ins) gets the teacher's correction as replies[step], with no level and no effect on marks. fbSig[step]
// keeps the version corrected, so a new version is corrected again. Left out: the level moments (marked above), the final product
// (the teacher's), LSs that are only exam + final product (LS1); the Reflect card gets a personal answer instead of a correction, and a hand-in the teacher already answered by hand.
const sigOf=t=>{let h=5381;for(const ch of String(t))h=(h*33+ch.codePointAt(0))>>>0;return h.toString(36)};
const fbActs=course=>W.EL_CATALOG.filter(a=>{const g=W.EL_GRADING[a.ls]||{};return a.ls.startsWith(course+"-")&&!g.only&&!a.manual&&!(g.fp&&g.fp.a===a.id)&&a.keys&&a.keys.length});
const REFLECT=a=>/reflect$/.test(a.id)?"reflect":null;   // the Reflect page: its card gets a personal answer (el-marking.js fbItems form)
async function fbTodo(grp,a){const skip=new Set(moments(a.ls).filter(m=>m.a===a.id).map(m=>m.step)),out={};
  for(const s of studs.filter(x=>x.group===grp.id&&!isTester(x))){const st=await student(s.uid,a.ls,a.id);let state={};try{state=JSON.parse(st.data[a.keys[0]]||"{}")}catch(e){}
    const items=W.ELMark.fbItems(state,skip,REFLECT(a)),res=st.res;
    for(const [step,it] of Object.entries(items)){const v=sigOf(JSON.stringify(it.fields));
      if((res.fbSig||{})[step]===v)continue;                               // this version is corrected
      if((res.replies||{})[step]&&!(res.fbSig||{})[step])continue;          // the teacher answered it by hand
      const fl=(res.flags||{})[step];if(fl&&!fl.done||fl&&fl.done==="redo"&&!(String(it.date||"")>String(fl.at||"")))continue;   // a possible copy waiting for the teacher, or redone in class and not handed in again
      (out[step]=out[step]||[]).push({s,h:{f:it.fields,ty:it.ty,date:it.date},route:st.route,exam:st.exam,v,title:it.title,mode:it.mode})}}
  for(const k in out)out[k].sort((x,y)=>x.s.uid<y.s.uid?-1:1);return out}
const STEPNAME={write:"Writing",speak:"Speaking",talk:"Talk"};
function fbSheetOf(grp,a,step,rows){const course=a.ls.split("-")[0],codes=W.ELMark.codes(rows.map(r=>r.s.uid)),by=Object.fromEntries(rows.map(r=>[r.s.uid,r]));
  const names=Object.fromEntries((W.EL_LEVELS||[]).map(l=>[l.id,l.name]));
  const text=W.ELMark.sheet({aid:a.id,title:a.title,step,stepName:rows[0].title||STEPNAME[step]||step,group:grp.name,date:W.ELWeek.today(),crits:[],crit:{},ind:{},mode:rows[0].mode,
    students:[...codes].map(([code,u])=>({code,route:names[by[u].route]||by[u].route,ca:!by[u].route||CA_RT.includes(by[u].route),exam:by[u].exam,ty:by[u].h.ty,fields:by[u].h.f}))});
  return {text,codes:new Map([...codes].map(([c,u])=>[c,by[u]]))}}

// Comments waiting for Claude, every group: same order every time (group, student, activity, step), so the ids of the sheet are found again by `answer`
// (the line also repeats the student's code and the step, and a line that no longer matches is left out).
async function comments(){const out=[],names=Object.fromEntries((W.EL_LEVELS||[]).map(l=>[l.id,l.name])),acts=W.EL_CATALOG.filter(a=>a.steps&&a.keys);
  const content=a=>{const d=a.path.replace(/[^/]+\.html$/,m=>"data/"+m.replace(/\.html$/,".js"));return fs.existsSync(path.join(ROOT,d))?d:a.path};
  for(const grp of W.EL_GROUPS){const ss=studs.filter(x=>x.group===grp.id&&!isTester(x)).sort((x,y)=>x.uid<y.uid?-1:1),codes=W.ELMark.codes(ss.map(x=>x.uid)),code=Object.fromEntries([...codes].map(([c,u])=>[u,c]));
    for(const s of ss){const lvs=Object.fromEntries(((await api("GET",DOCS+`students/${s.uid}/levels`))?.documents||[]).map(d=>[d.name.split("/").pop(),doc(d)])),pg={};
      for(const a of acts.filter(x=>x.ls.startsWith(grp.course+"-"))){
        if(!(a.ls in pg))pg[a.ls]=(doc(await api("GET",DOCS+`students/${s.uid}/progress/${a.ls}`))||{}).data||{};
        let sp={};try{sp=JSON.parse(pg[a.ls][a.keys[0]]||"{}").steps||{}}catch(e){}
        if(!a.steps.some(([k])=>sp[k]&&W.ELMark.q(sp[k])))continue;   // no comment here: no need to read the results
        const st={route:W.elRouteOf(lvs,a.ls).level,res:doc(await api("GET",DOCS+`students/${s.uid}/results/${a.id.replace("/","__")}`))||{}};
      for(const [step,name] of a.steps){const h=sp[step];if(!W.ELMark.open(h,st.res,step)||W.ELMark.asked(h,st.res,step))continue;
        out.push({id:"Q"+(out.length+1),uid:s.uid,code:code[s.uid],route:names[st.route]||st.route,ca:!st.route||CA_RT.includes(st.route),ls:(W.EL_LS.find(l=>l.id===a.ls)||{}).title||a.ls,lsId:a.ls,
          aid:a.id,title:a.title,step,stepName:name,content:content(a),fields:h.f,comment:W.ELMark.q(h)})}}}}
  return out}

// sessions the teacher moved to another day on the dashboard (ls/{id}.planEdits): due days and session lines follow, as on the dashboard
for(const ls of Object.keys(W.EL_PLAN||{})){const d=doc(await api("GET",DOCS+"ls/"+encodeURIComponent(ls)).catch(()=>null))||{};if(d.planEdits)W.ELWeek.applyEdits(ls,d.planEdits)}
const [cmd,...rest]=process.argv.slice(2),flags=new Set(rest.filter(x=>x.startsWith("--"))),args=rest.filter(x=>!x.startsWith("--"));
const grpOf=id=>{const g=W.EL_GROUPS.find(x=>x.id===id);if(!g)throw new Error("No group "+id);return g};
const momentOf=(aid,step)=>{const a=W.EL_CATALOG.find(x=>x.id===aid),m=a&&moments(a.ls).find(x=>x.a===aid&&x.step===step);if(!m)throw new Error("No marking step "+aid+" · "+step);return m};
if(cmd==="ready"){const today=W.ELWeek.today();
  for(const grp of W.EL_GROUPS){const ticks=(doc(await api("GET",DOCS+"teacherPlan/"+grp.id))||{}).ticks||{};
    for(const ls of Object.keys(W.EL_GRADING).filter(l=>l.startsWith(grp.course+"-")))for(const m of moments(ls)){
      const rows=await todo(grp,m);if(!rows.length)continue;const r=readyOf(grp,ls,m,ticks),now=!!(r.from&&today>=r.from);
      console.log([now?"READY":"wait ",grp.id,m.a,m.step,rows.length+" to mark",r.from?"from "+r.from:r.line?"session not ticked: "+r.line:"no session in the plan"].join(" · "))}}}
else if(cmd==="audit"){   // is the weekly marking working? (Roger, 31 Oct 2026: "a command to audit what you do and warn me if it's not working")
  const today=W.ELWeek.today(),days=(a,b)=>Math.round((Date.parse(a)-Date.parse(b))/864e5),problems=[],remind=[],ok=[];
  for(const grp of W.EL_GROUPS){const ticks=(doc(await api("GET",DOCS+"teacherPlan/"+grp.id))||{}).ticks||{};
    for(const ls of Object.keys(W.EL_GRADING).filter(l=>l.startsWith(grp.course+"-")))for(const m of moments(ls)){
      const a=W.EL_CATALOG.find(x=>x.id===m.a),rows=await todo(grp,m),r=readyOf(grp,ls,m,ticks);
      // a late hand-in counts from the day it came in, not from when the step was ready
      if(rows.length&&r.from&&today>=r.from){const since=x=>{const h=String(x.h.date||"").slice(0,10);return h>r.from?h:r.from},late=rows.filter(x=>W.ELMark.late(since(x),today));   // ready before the last Wednesday run
        if(late.length)problems.push(`${grp.id} · ${m.name} (${a.title}): ${late.length} hand-in${late.length>1?"s":""} ready since ${late.map(since).sort()[0]} still without a level (missed the Wednesday run of ${W.ELMark.lastRun(today)})`);
        if(rows.length>late.length)ok.push(`${grp.id} · ${m.name} (${a.title}): ${rows.length-late.length} hand-in${rows.length-late.length>1?"s":""} to mark at the next run`)}
      // possible copies waiting for the teacher
      for(const s of studs.filter(x=>x.group===grp.id&&!isTester(x))){const st=await student(s.uid,a.ls,a.id),f=(st.res.flags||{})[m.step];
        if(f&&!f.done&&days(today,String(f.at).slice(0,10))>=7)remind.push(`${grp.id} · ${m.name}: a possible copy waiting for you since ${String(f.at).slice(0,10)}`)}}}
  // corrections without a level: a piece handed in before the last Wednesday run and still without a correction
  for(const grp of W.EL_GROUPS)for(const a of fbActs(grp.course))for(const [step,rows] of Object.entries(await fbTodo(grp,a))){
    const late=rows.filter(x=>x.h.date&&W.ELMark.late(String(x.h.date).slice(0,10),today));
    if(late.length)problems.push(`${grp.id} · ${a.title} · ${STEPNAME[step]||step}: ${late.length} piece${late.length>1?"s":""} that missed the Wednesday run of ${W.ELMark.lastRun(today)}`);
    else ok.push(`${grp.id} · ${a.title} · ${STEPNAME[step]||step}: ${rows.length} piece${rows.length>1?"s":""} to correct at the next run`)}
  console.log(`AUDIT ${today}: ${problems.length?"PROBLEMS":"OK"}`);
  problems.forEach(x=>console.log("❌ "+x));remind.forEach(x=>console.log("⏰ "+x));ok.forEach(x=>console.log("🤖 to mark now: "+x));
  if(!problems.length&&!remind.length&&!ok.length)console.log("Nothing waiting: every hand-in that is ready has a level.");
  if(problems.length)process.exitCode=2}
else if(cmd==="fb-ready"){   // pieces waiting for a correction without a level, per group, activity and step
  for(const grp of W.EL_GROUPS)for(const a of fbActs(grp.course)){const t=await fbTodo(grp,a);for(const [step,rows] of Object.entries(t))console.log(["FEEDBACK",grp.id,a.id,step,rows.length+" to correct"].join(" · "))}}
else if(cmd==="fb-sheet"){const [gid,aid,step]=args,grp=grpOf(gid),a=W.EL_CATALOG.find(x=>x.id===aid),rows=a?(await fbTodo(grp,a))[step]||[]:[];
  console.log(rows.length?fbSheetOf(grp,a,step,rows).text:"Nothing to correct.")}
else if(cmd==="fb-apply"){const [gid,aid,step,file]=args,grp=grpOf(gid),a=W.EL_CATALOG.find(x=>x.id===aid);if(!a)throw new Error("No activity "+aid);
  const rows=(await fbTodo(grp,a))[step]||[],sh=fbSheetOf(grp,a,step,rows),r=W.ELMark.parse(fs.readFileSync(file,"utf8"),{aid:a.id,step,crits:[],codes:sh.codes});if(r.err)throw new Error(r.err);
  const rk=a.id.replace("/","__");
  for(const x of r.rows){const row=sh.codes.get(x.code);if(!x.fb){r.bad.push(x.code+" (no feedback)");continue}
    if(row.mode==="writing")x.fb=W.ELMark.fbText(x.fb);   // comment + table of mistakes + the corrected text (el-corrections.js shows the table)
    console.log((flags.has("--apply")?"✓ ":"→ ")+x.code+" · "+(x.flag?"⚠️ POSSIBLE COPY (to the To do, not sent): "+x.flag+" · ":"")+x.fb.replace(/\n+/g," / "));if(!flags.has("--apply"))continue;
    if(x.flag){await api("PATCH",DOCS+`students/${row.s.uid}/results/${rk}?`+["ls","activity","updated",fp("flags",step)].map(p=>"updateMask.fieldPaths="+encodeURIComponent(p)).join("&"),   // the teacher accepts it (the correction is sent) or asks for it again in class
      {fields:{ls:fsv(a.ls),activity:fsv(a.id),updated:{timestampValue:new Date().toISOString()},flags:fsv({[step]:{why:x.flag,lv:{},fb:x.fb,v:row.v,f:row.h.f,ty:row.h.ty||null,at:new Date().toISOString()}})}});continue}
    await api("PATCH",DOCS+`students/${row.s.uid}/results/${rk}?`+["ls","activity","updated",fp("replies",step),fp("fbSig",step)].map(p=>"updateMask.fieldPaths="+encodeURIComponent(p)).join("&"),
      {fields:{ls:fsv(a.ls),activity:fsv(a.id),updated:{timestampValue:new Date().toISOString()},replies:fsv({[step]:x.fb}),fbSig:fsv({[step]:row.v})}})}
  console.log(`\n${flags.has("--apply")?"Sent":"Would send"}: ${r.rows.filter(x=>x.fb&&!x.flag).length} · possible copies: ${r.rows.filter(x=>x.flag).length} · no line: ${r.missing.length} · lines left out: ${r.bad.length}${flags.has("--apply")?"":"\nNothing written: run again with --apply."}`)}
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
    const paths=["ls","activity","updated",...m.c.map(c=>fp("levels",m.step,c)),fp("marked",m.step),...(fb?[fp("replies",m.step),fp("fbBy",m.step)]:[])];
    await api("PATCH",DOCS+`students/${s.uid}/results/${rk}?`+paths.map(p=>"updateMask.fieldPaths="+encodeURIComponent(p)).join("&"),
      {fields:{ls:fsv(a.ls),activity:fsv(a.id),updated:{timestampValue:new Date().toISOString()},levels:fsv({[m.step]:x.lv}),marked:fsv({[m.step]:new Date().toISOString()}),...(fb?{replies:fsv({[m.step]:x.fb}),fbBy:fsv({[m.step]:"marking"})}:{})}})}
  const nf=r.rows.filter(x=>x.flag).length;
  console.log(`\n${flags.has("--apply")?"Saved":"Would save"}: ${r.rows.length-nf} · possible copies for the teacher: ${nf} · no line: ${r.missing.length} · lines left out: ${r.bad.length}${flags.has("--apply")?"":"\nNothing written: run again with --apply."}`)}
else if(cmd==="comments"||cmd==="answer"){const its=await comments();
  if(cmd==="comments")console.log(its.length?W.ELMark.commentSheet({date:W.ELWeek.today(),items:its}):"No comments waiting for an answer.");
  else{const r=W.ELMark.parseComments(fs.readFileSync(args[0],"utf8"),{items:its});if(r.err)throw new Error(r.err);const now=new Date().toISOString();
    for(const x of r.rows){const i=its.find(y=>y.id===x.id),f=x.kind==="ANSWER"?"answers":"ask",v=x.kind==="ANSWER"?{t:x.text,q:i.comment,at:now}:{why:x.text,q:i.comment,at:now};
      console.log((flags.has("--apply")?"✓ ":"→ ")+x.id+" · "+x.code+" · "+i.aid+" · "+x.step+" · "+(x.kind==="ANSWER"?"answer: ":"🙋 for the teacher: ")+x.text);
      if(flags.has("--apply"))await api("PATCH",DOCS+`students/${i.uid}/results/${i.aid.replace("/","__")}?`+["ls","activity","updated",fp(f,x.step)].map(p=>"updateMask.fieldPaths="+encodeURIComponent(p)).join("&"),
        {fields:{ls:fsv(i.lsId),activity:fsv(i.aid),updated:{timestampValue:now},[f]:fsv({[x.step]:v})}})}
    console.log(`\n${flags.has("--apply")?"Saved":"Would save"}: ${r.rows.filter(x=>x.kind==="ANSWER").length} answers · ${r.rows.filter(x=>x.kind==="FORYOU").length} for the teacher · no line: ${r.missing.length} · lines left out: ${r.bad.length}${flags.has("--apply")?"":"\nNothing written: run again with --apply."}`)}}
else{console.log("Usage: node tools/marking/marks.mjs ready | audit | fb-ready | fb-sheet <group> <activity> <step> | fb-apply <group> <activity> <step> <answer file> [--apply] | sheet <group> <activity> <step> | apply <group> <activity> <step> <answer file> [--apply] [--feedback] | comments | answer <answer file> [--apply]");process.exit(1)}
