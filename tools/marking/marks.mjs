// Marking sheets from the cloud (Roger, 31 Oct 2026: "could you do it yourself instead of ChatGPT so that it's more automatic?").
// The same sheets and EL-MARKS v1 answers as the dashboard's 🤖 Marking sheet (shared/js/el-marking.js), read and written straight in
// Firestore, so Claude can mark the Reading log, Listening chart and Research card / Fact file without Roger's computer.
//   node tools/marking/marks.mjs ready                                   steps with hand-ins without a level, per group, and when they are ready
//   node tools/marking/marks.mjs fb-ready | fb-sheet <group> <activity> <step> | fb-apply <group> <activity> <step> <file> [--apply]
//        the same for corrections without a level (writing and speaking texts, Talk transcripts, other hand-ins): see "Corrections without a level";
//        a writing's correction also saves its 5.1 level (Roger, 21 Nov 2026)
//   node tools/marking/marks.mjs lv-ready | lv-sheet <group> <activity> <step> | lv-apply <group> <activity> <step> <file> [--apply]
//        a 5.1 level for writings corrected before that (level only, nothing new sent to the student)
//   node tools/marking/marks.mjs audit                                   is the marking working? ❌ hand-ins ready before the last Wednesday run
//        and still without a level or correction (exit code 2), ⏰ possible copies waiting for the teacher 7+ days; read-only
//   node tools/marking/marks.mjs sheet <group> <activity> <step>         the sheet (students as codes, never names)
//   node tools/marking/marks.mjs apply <group> <activity> <step> <answer file> [--apply] [--feedback]
//        reads the EL-MARKS v1 answer and saves the levels (students/{uid}/results/{activity}.levels[step][criterion]), as the dashboard's
//        level buttons do; --feedback also saves each line's feedback as the teacher's answer to the student (replies[step]).
//        Without --apply it only prints what would change. A line with "COPY? reason" (a possible copy) saves no level: it is kept as
//        results/{activity}.flags[step] = {why, lv, fb, at} for the teacher to accept or send back in the dashboard's To do, unless it was
//        clearly pasted (ELMark.pasted, not the Pro route): then it is sent back at once (done "redo", auto) with the Redo note and its reason.
//        Feedback is marked fbBy[step] = "marking", so it never counts as the answer to a student's comment.
//   node tools/marking/marks.mjs comments                                  the comments sheet: every student comment on a hand-in still
//        waiting for an answer (ELMark.open, not handed to the teacher), all groups, with the hand-in and the content file to read
//   node tools/marking/marks.mjs answer <answer file> [--apply]             saves the EL-ANSWERS v1 answer: ANSWER → answers[step] =
//        {t, q, at, made} (the student sees it as the teacher's answer from at: 8:00-18:00, 2 hours later; made = when it was written), FORYOU → ask[step] = {why, q, at} (🙋 in the dashboard's To do)
//   comments --new / answer <file> --new [--apply]   the same, only for the students who saved a new comment since the last instant run
//        ("No new comments." and nothing else read when there is none): the instant run of "English Lab: problem reports (instant)"
// The dashboard's ✏️ Corrections (Roger, 6 Nov 2026) shows when each piece was corrected and where the run is: fb-apply saves
// results/{activity}.fbAt[step] = when the correction was sent; `ready` (the first step of the scheduled task "English Lab: mark and
// correct") saves settings/marking.run = {started, via: "request" when the teacher asked for it with ✏️ Correct everything waiting now
// (settings/marking.request.at is newer than the last start), else "schedule"}; `audit` (its last step) saves run.done, only for a run
// started in the last 12 hours and not finished (the Friday audit alone changes nothing). --no-run: `ready` saves nothing (a test).
// Sign-in: FIREBASE_SERVICE_ACCOUNT (the service account's JSON key, an environment secret of the cloud environment, never in the repo),
// else the Firebase CLI login on Roger's PC (as tools/exam-marks). Group = EL_GROUPS id (2ESOA…); activity = catalogue id
// (2eso/ls2-what-are-they-doing); step = the moment's step (log, chart, card, factfile). The answer file holds no names.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import {fileURLToPath} from "node:url";
import {replyAt,whenText,namesIn} from "../problems/reply-time.mjs";

const PROJECT="english-lab-ietm",ROOT=path.join(path.dirname(fileURLToPath(import.meta.url)),"../..");
const ctx={console};ctx.window=ctx;if(process.env.EL_TODAY)ctx.EL_TODAY=process.env.EL_TODAY;   // a date for tests
vm.createContext(ctx);
for(const f of ["el-catalog.js","el-criteria.js","el-plan.js","el-week.js","el-grading.js","el-marking.js"])vm.runInContext(fs.readFileSync(path.join(ROOT,"shared/js",f),"utf8"),ctx,{filename:f});
const W=ctx.window,CA_RT=["beginners"];
// A possible copy that was clearly pasted (ELMark.pasted: most of the text pasted, little typed) is sent back at once instead of waiting
// in the teacher's To do (Roger, 4 Nov 2026: "when this happens and you see it on Wednesdays, you can automatically send redo"): the flag
// is saved as done "redo" (auto) and the student gets the Redo note with the reason from the writing log (ELMark.redoNote). Never the Pro route.
const autoRedo=(route,ty)=>route!=="native"&&W.ELMark.pasted(ty);
const redoNote=(route,ty,why)=>W.ELMark.redoNote(ty,why,!route||CA_RT.includes(route));

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

// --new (comments and answer; the instant run, Roger 9 Nov 2026: "I want you to answer straight away"): only the students whose page saved
// a new comment since the last instant run (students/{uid}.commented, set by el-cloud.js) are read, so a run reads a few documents.
// settings/marking.cmtRun = the newest `commented` already handled; `answer --apply --new` (or `comments --new` with nothing waiting) moves it on.
const NEW=process.argv.includes("--new")&&["comments","answer"].includes(process.argv[2]);let NEWS=null;
if(NEW){const since=(doc(await api("GET",DOCS+"settings/marking"))||{}).cmtRun||"1970-01-01T00:00:00Z";
  const q=await api("POST",DOCS.replace(/\/$/,"")+":runQuery",{structuredQuery:{from:[{collectionId:"students"}],where:{fieldFilter:{field:{fieldPath:"commented"},op:"GREATER_THAN",value:{timestampValue:since}}}}});
  NEWS=(q||[]).filter(x=>x.document).map(x=>[x.document.name.split("/").pop(),doc(x.document)]);
  if(!NEWS.length){console.log("No new comments.");process.exit(0)}}
const cmtDone=async()=>{const t=NEWS.map(([,s])=>s.commented).sort().pop();if(t)await api("PATCH",DOCS+"settings/marking?updateMask.fieldPaths=cmtRun",{fields:{cmtRun:fsv(t)}})};
// students of a group: the student list's group decides (as on the dashboard), testers left out
const roster=NEW?Object.fromEntries(await Promise.all(NEWS.map(async([,s])=>{const e=(s.email||"").toLowerCase();return [e,e?doc(await api("GET",DOCS+"roster/"+encodeURIComponent(e)))||{}:{}]})))
  :Object.fromEntries(await list("roster")),studs=(NEW?NEWS:await list("students")).map(([uid,s])=>({uid,...s,group:(roster[(s.email||"").toLowerCase()]||{}).group||s.group}));
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
// Talk transcripts; other hand-ins) gets the teacher's correction as replies[step], with no effect on marks; a writing also gets a 5.1 level
// (wCrits below, Roger 21 Nov 2026), the rest no level. fbSig[step]
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
// A writing's correction also gives a 5.1 level (Roger, 21 Nov 2026: corrected writings count in the Writing skill and criterion 5.1):
// the LS's 5.1 indicators, saved as results/{activity}.levels[step]["5.1"] + marked[step] with the correction. LSs without 5.1 indicators
// (LS1, exam + final product only) keep corrections without a level. The level never changes a mark (no grading block reads it); it is
// evidence for 5.1 (el-grading.js evidence) and the Writing skill of the charts (el-charts.js work).
const wCrits=a=>{const g=W.EL_GRADING[a.ls]||{};return !g.only&&g.ind&&g.ind["5.1"]?["5.1"]:[]};
const contentOf=a=>{const d=a.path.replace(/[^/]+\.html$/,m=>"data/"+m.replace(/\.html$/,".js"));return fs.existsSync(path.join(ROOT,d))?d:a.path};
const lvOpts=a=>{const L=wCrits(a),course=a.ls.split("-")[0],g=W.EL_GRADING[a.ls]||{};
  return {lvc:L,crit:Object.fromEntries(L.map(c=>[c,`${c} · ${W.elCompetence(c)}: ${W.elCriterion(course,c)||""}`])),ind:Object.fromEntries(L.map(c=>[c,(g.ind||{})[c]||[]])),content:contentOf(a)}};
function fbSheetOf(grp,a,step,rows){const course=a.ls.split("-")[0],codes=W.ELMark.codes(rows.map(r=>r.s.uid)),by=Object.fromEntries(rows.map(r=>[r.s.uid,r]));
  const names=Object.fromEntries((W.EL_LEVELS||[]).map(l=>[l.id,l.name])),lo=rows[0].mode==="writing"?lvOpts(a):{lvc:[],crit:{},ind:{}};
  const text=W.ELMark.sheet({aid:a.id,title:a.title,step,stepName:rows[0].title||STEPNAME[step]||step,group:grp.name,date:W.ELWeek.today(),crits:[],...lo,mode:rows[0].mode,
    students:[...codes].map(([code,u])=>({code,route:names[by[u].route]||by[u].route,ca:!by[u].route||CA_RT.includes(by[u].route),exam:by[u].exam,ty:by[u].h.ty,fields:by[u].h.f}))});
  return {text,codes:new Map([...codes].map(([c,u])=>[c,by[u]])),lvc:lo.lvc}}

// Writings corrected before they got a level (Roger, 21 Nov 2026): lv-sheet / lv-apply give each one its 5.1 level only, from the text
// handed in and the correction already sent (nothing new is sent to the student). Same answer format, with "-" for the correction.
async function lvTodo(grp,a,step){const out=[],L=wCrits(a);if(!L.length)return out;const skip=new Set(moments(a.ls).filter(m=>m.a===a.id).map(m=>m.step));
  for(const s of studs.filter(x=>x.group===grp.id&&!isTester(x))){const st=await student(s.uid,a.ls,a.id);let state={};try{state=JSON.parse(st.data[a.keys[0]]||"{}")}catch(e){}
    const it=W.ELMark.fbItems(state,skip,null)[step],res=st.res,sig=(res.fbSig||{})[step];
    if(!it||it.mode!=="writing"||!sig||sig==="redo"||sig!==sigOf(JSON.stringify(it.fields))||L.every(c=>((res.levels||{})[step]||{})[c]))continue;   // only the version that was corrected
    out.push({s,h:{f:[...it.fields,{l:"My correction (already sent)",v:(res.replies||{})[step]||""}],ty:it.ty,date:it.date},route:st.route,exam:st.exam,title:it.title,mode:"writing"})}
  return out.sort((x,y)=>x.s.uid<y.s.uid?-1:1)}
function lvSheetOf(grp,a,step,rows){const sh=fbSheetOf(grp,a,step,rows);
  const text=sh.text.replace(" · CORRECTIONS + LEVEL"," · LEVELS ONLY").replace(/\nANSWER FORMAT[\s\S]*$/,"\n"+["THIS RUN: these writings were already corrected (the correction is shown). Give ONLY the level: no new correction, no flag.",
    "ANSWER FORMAT (strict). Reply with ONLY these lines, in a single code block, nothing before or after:",`EL-MARKS v1 | ${a.id} | ${step} | ${grp.name}`,`<code> | ${sh.lvc.map(c=>c+"=<level>").join("; ")} | -`,"(one line per student, every code above, same order)","END","Levels must be exactly NA, AS, AN or AE."].join("\n"));
  return {...sh,text}}

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
const PE={};for(const ls of Object.keys(W.EL_PLAN||{})){const d=doc(await api("GET",DOCS+"ls/"+encodeURIComponent(ls)).catch(()=>null))||{};PE[ls]=d.planEdits||{};if(d.planEdits)W.ELWeek.applyEdits(ls,d.planEdits)}
// a group's ticks, with the past class days of its agendas counted as done (ELWeek.autoTicks, as on the dashboard)
async function ticksOf(grp){const t=(doc(await api("GET",DOCS+"teacherPlan/"+grp.id))||{}).ticks||{};
  for(const [ls,pe] of Object.entries(PE)){const a=(pe[grp.id]||{}).agenda;if(!a)continue;let ag=null;try{ag=typeof a==="string"?JSON.parse(a):a}catch(e){}W.ELWeek.autoTicks(ls,ag,t)}return t}
const [cmd,...rest]=process.argv.slice(2),flags=new Set(rest.filter(x=>x.startsWith("--"))),args=rest.filter(x=>!x.startsWith("--"));
const grpOf=id=>{const g=W.EL_GROUPS.find(x=>x.id===id);if(!g)throw new Error("No group "+id);return g};
const momentOf=(aid,step)=>{const a=W.EL_CATALOG.find(x=>x.id===aid),m=a&&moments(a.ls).find(x=>x.a===aid&&x.step===step);if(!m)throw new Error("No marking step "+aid+" · "+step);return m};
// ✍️ Towards Nativeness (Roger's own C1 → C2 course, a personal LS; Roger, 17 Nov 2026: "I only want Gemini, Roig, to correct my speakings,
// the text I want … corrected by you" and "only correct me when sth is really off or non-native like"). His writing hand-ins (and the short
// new task after each correction) are marked by the page as state.coach[step] = {sent, task} / {nextSent, nextText} and the page asks the
// school script (tn_mark) to start this scheduled task. tn-ready lists what is waiting and says whether this run is only for him (MODE);
// tn-apply saves Claude's correction in students/{uid}/results/{activity}.tnCoach[step] (and [step + "_2"] for the new task), which the
// page polls and shows in the same tab. Only Roger's own accounts (the testers and the teacher), never students.
async function tnItems(){
  const c2=vm.createContext({console,localStorage:{getItem:k=>k==="el_who"?'{"role":"tester"}':null}});c2.window=c2;   // the personal LS stays in this copy
  vm.runInContext(fs.readFileSync(path.join(ROOT,"shared/js/el-catalog.js"),"utf8"),c2,{filename:"el-catalog.js"});
  const P=new Set(c2.EL_LS.filter(l=>l.personal).map(l=>l.id)),acts=c2.EL_CATALOG.filter(a=>P.has(a.ls));
  const TEACH=JSON.parse((/TEACHERS=(\[[^\]]*\])/.exec(fs.readFileSync(path.join(ROOT,"shared/js/el-firebase.js"),"utf8"))||[,"[]"])[1]);
  const me=studs.filter(s=>isTester(s)||TEACH.includes((s.email||"").toLowerCase())),out=[];
  for(const s of me)for(const a of acts){const rk=a.id.replace("/","__");
    const pg=doc(await once("p|"+s.uid+"|"+a.ls,()=>api("GET",DOCS+`students/${s.uid}/progress/${a.ls}`)))||{},res=doc(await once("r|"+s.uid+"|"+rk,()=>api("GET",DOCS+`students/${s.uid}/results/${rk}`)))||{};
    let st={};try{st=JSON.parse((pg.data||{})[a.keys[0]]||"{}")}catch(e){}
    const done=res.tnCoach||{};
    for(const [id,c] of Object.entries(st.coach||{})){if(!c)continue;const h=((st.steps||{})[id]||{}),text=((h.f||[])[0]||{}).v;
      if(c.sent&&!c.fix&&!done[id]&&text)out.push({uid:s.uid,aid:a.id,ls:a.ls,title:a.title,step:id,task:c.task||h.title||"",text,at:c.sent});
      if(c.nextSent&&c.nextText&&!done[id+"_2"])out.push({uid:s.uid,aid:a.id,ls:a.ls,title:a.title,step:id+"_2",task:(c.next||{}).task||"",use:(c.next||{}).use||[],text:c.nextText,at:c.nextSent,second:true})}}
  return out.sort((x,y)=>String(x.at).localeCompare(String(y.at))).map((x,i)=>Object.assign(x,{code:"T"+(i+1)}))}
const fsvA=x=>Array.isArray(x)?{arrayValue:{values:x.map(fsvA)}}:x&&typeof x==="object"?{mapValue:{fields:Object.fromEntries(Object.entries(x).map(([k,v])=>[k,fsvA(v)]))}}:fsv(x);
// Which run is this? The Wednesday one or one the teacher asked for (✏️ Correct everything waiting now) does everything; any other start came
// from his own course (tn_mark), so only his writing is corrected. The scheduled task's prompt can't be changed from a thread, so `ready`,
// and `fb-ready` check this themselves: `ready` prints his pieces first, and in a TN-only run neither lists student work (`audit` only reads).
async function tnFull(){const m=doc(await api("GET",DOCS+"settings/marking"))||{},run=m.run||{},rq=(m.request||{}).at;
  const madrid=new Date(new Date().toLocaleString("en-US",{timeZone:"Europe/Madrid"})),wed=madrid.getDay()===3&&madrid.getHours()>=13&&madrid.getHours()<18;
  return !!(wed||(rq&&(!run.started||String(rq)>String(run.started))))}
const TN_ONLY="MODE: TOWARDS NATIVENESS ONLY (started from Roger's own course): correct only his writing below with tn-apply, then stop. Nothing is READY for students in this run: do not run sheets (fb-ready prints nothing; audit only reports).";
async function tnPrint(full){const its=await tnItems();
  console.log(full?"MODE: FULL RUN (the Wednesday run or ✏️ Correct everything waiting now): do every step, the Towards Nativeness one too.":TN_ONLY);
  if(!its.length){console.log("No Towards Nativeness writing waiting."+(full?"":" If his course has just asked, wait 60 seconds and run tn-ready again (up to 3 times)."));return}
  console.log(`\nTOWARDS NATIVENESS · Roger's own writing, ${its.length} piece(s). Roger is a Catalan-speaking English teacher (C1) who wants to write like a native-like everyday user, NOT an expert.
RULES: correct ONLY what is really wrong or sounds non-native to an ordinary native speaker (Catalan/Spanish calques, prepositions, word order,
questions, articles, countable nouns, verb patterns like want someone to, tenses, collocations a native would never use). NEVER offer a nicer,
more formal or more idiomatic alternative for anything a native could naturally write. Ignore typos, spelling, punctuation and capitals (he types
fast). Fewer fixes is fine; none is fine. Write in English, to him ("you"), short and warm.
ANSWER FORMAT: a JSON array in a file in your scratchpad, one object per code:
  {"code":"T1","fix":[{"said":"his exact words (only the part that changes, a few words around it)","natural":"how a native writes that part","why":"the rule in at most 12 words"}],
   "corrected":"his whole text with only those changes","well":"one native-like phrase he used, quoted",
   "next":{"task":"a short new writing task (60-120 words to write) on a related everyday topic that needs the corrected forms","use":["3 to 6 corrected chunks"]}}
  (no "next" for a NEW TASK piece). Then: node tools/marking/marks.mjs tn-apply <file> --apply
  tn-apply only writes tnCoach in Roger's own results: that is part of this marking run (Roger, 17 Nov 2026) and allowed.
`);
  for(const x of its)console.log(`--- ${x.code} · ${x.title} · ${x.second?"NEW TASK (his answer to the short task after a correction)":"writing"} · handed in ${x.at}\nTask: ${x.task}${x.use&&x.use.length?"\nChunks to use: "+x.use.join(" · "):""}\nText:\n${x.text}\n`)}
if(cmd==="tn-ready")await tnPrint(await tnFull());
else if(cmd==="tn-apply"){const its=await tnItems(),ans=JSON.parse(fs.readFileSync(args[0],"utf8")),now=new Date().toISOString(),s=v=>String(v||"").trim();let n=0;
  for(const a of ans){const x=its.find(i=>i.code===a.code);if(!x){console.log("? no piece "+a.code);continue}
    const v={fix:(Array.isArray(a.fix)?a.fix:[]).map(f=>({said:s(f.said),natural:s(f.natural),why:s(f.why)})).filter(f=>f.said&&f.natural),corrected:s(a.corrected),well:s(a.well),at:now};
    if(!x.second&&a.next&&s(a.next.task))v.next={task:s(a.next.task),use:(Array.isArray(a.next.use)?a.next.use:[]).map(s).filter(Boolean).slice(0,6)};
    console.log(`${x.code} · ${x.title} · ${x.step}: ${v.fix.length} fix(es)${v.next?" + new task":""}`);n++;
    if(flags.has("--apply"))await api("PATCH",DOCS+`students/${x.uid}/results/${x.aid.replace("/","__")}?`+["ls","activity","updated",fp("tnCoach",x.step)].map(p=>"updateMask.fieldPaths="+encodeURIComponent(p)).join("&"),
      {fields:{ls:fsv(x.ls),activity:fsv(x.aid),updated:{timestampValue:now},tnCoach:fsvA({[x.step]:v})}})}
  const left=its.filter(i=>!ans.some(a=>a.code===i.code)).map(i=>i.code);
  console.log(`\n${flags.has("--apply")?"Saved":"Would save"}: ${n} correction(s)${left.length?" · NOT ANSWERED: "+left.join(", "):""}`)}
else if(cmd==="ready"){const today=W.ELWeek.today(),full=await tnFull();
  console.log("STEP 0 · TOWARDS NATIVENESS (Roger's own writing; do it first)");await tnPrint(full);console.log("\nSTUDENTS");
  if(!full){console.log("Nothing READY: this run is only for Roger's own course. Skip the sheets, correct his writing above, and finish.");process.exit(0)}
  if(!flags.has("--no-run")){const mk=doc(await api("GET",DOCS+"settings/marking"))||{},rq=Date.parse((mk.request||{}).at||"")||0,st=Date.parse((mk.run||{}).started||"")||0,via=rq>st?"request":"schedule";
    await api("PATCH",DOCS+"settings/marking?updateMask.fieldPaths=run",{fields:{run:fsv({started:new Date().toISOString(),via})}});console.log("RUN started ("+(via==="request"?"asked from the dashboard":"scheduled")+")")}
  for(const grp of W.EL_GROUPS){const ticks=await ticksOf(grp);
    for(const ls of Object.keys(W.EL_GRADING).filter(l=>l.startsWith(grp.course+"-")))for(const m of moments(ls)){
      const rows=await todo(grp,m);if(!rows.length)continue;const r=readyOf(grp,ls,m,ticks),now=!!(r.from&&today>=r.from);
      console.log([now?"READY":"wait ",grp.id,m.a,m.step,rows.length+" to mark",r.from?"from "+r.from:r.line?"session not ticked: "+r.line:"no session in the plan"].join(" · "))}}}
else if(cmd==="audit"){   // is the weekly marking working? (Roger, 31 Oct 2026: "a command to audit what you do and warn me if it's not working")
  const today=W.ELWeek.today(),days=(a,b)=>Math.round((Date.parse(a)-Date.parse(b))/864e5),problems=[],remind=[],ok=[];
  for(const grp of W.EL_GROUPS){const ticks=await ticksOf(grp);
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
  {const run=(doc(await api("GET",DOCS+"settings/marking"))||{}).run||{},st=Date.parse(run.started||"")||0,dn=Date.parse(run.done||"")||0;   // the end of a run (see the top)
    if(st&&dn<st&&Date.now()-st<12*3600e3){await api("PATCH",DOCS+"settings/marking?updateMask.fieldPaths=run.done",{fields:{run:fsv({done:new Date().toISOString()})}});console.log("RUN done")}}
  if(problems.length)process.exitCode=2}
else if(cmd==="fb-ready"&&!(await tnFull()))console.log("Nothing to correct: this run is only for Roger's own course (Towards Nativeness).");
else if(cmd==="fb-ready"){   // pieces waiting for a correction without a level, per group, activity and step
  for(const grp of W.EL_GROUPS)for(const a of fbActs(grp.course)){const t=await fbTodo(grp,a);for(const [step,rows] of Object.entries(t))console.log(["FEEDBACK",grp.id,a.id,step,rows.length+" to correct"].join(" · "))}}
else if(cmd==="fb-sheet"){const [gid,aid,step]=args,grp=grpOf(gid),a=W.EL_CATALOG.find(x=>x.id===aid),rows=a?(await fbTodo(grp,a))[step]||[]:[];
  console.log(rows.length?fbSheetOf(grp,a,step,rows).text:"Nothing to correct.")}
else if(cmd==="fb-apply"){const [gid,aid,step,file]=args,grp=grpOf(gid),a=W.EL_CATALOG.find(x=>x.id===aid);if(!a)throw new Error("No activity "+aid);
  const rows=(await fbTodo(grp,a))[step]||[];if(!rows.length){console.log("Nothing to correct.");process.exit(0)}
  const sh=fbSheetOf(grp,a,step,rows),r=W.ELMark.parse(fs.readFileSync(file,"utf8"),{aid:a.id,step,crits:sh.lvc,codes:sh.codes});if(r.err)throw new Error(r.err);
  const LV=sh.lvc.length>0;   // a writing: its 5.1 level is saved with the correction
  const rk=a.id.replace("/","__");
  for(const x of r.rows){const row=sh.codes.get(x.code);if(!x.fb){r.bad.push(x.code+" (no feedback)");continue}
    if(row.mode==="writing")x.fb=W.ELMark.fbText(x.fb);
    else if(row.mode==="surprise")x.fb=W.ELMark.sqText(x.fb);   // 🎲 one sentence + "➜ " things to improve (el-corrections.js)   // comment + table of mistakes + the corrected text (el-corrections.js shows the table)
    const auto=!!x.flag&&autoRedo(row.route,row.h.ty);x.auto=auto;
    console.log((flags.has("--apply")?"✓ ":"→ ")+x.code+" · "+(LV?Object.entries(x.lv).map(([c,l])=>c+"="+l).join(" ")+" · ":"")+(auto?"↺ MOSTLY PASTED: sent back to redo (note: "+redoNote(row.route,row.h.ty,x.flag)+") · ":x.flag?"⚠️ POSSIBLE COPY (to the To do, not sent): "+x.flag+" · ":"")+x.fb.replace(/\n+/g," / "));if(!flags.has("--apply"))continue;
    if(auto){const at=new Date().toISOString();   // as the dashboard's Redo: the writing opens again, its next hand-in is corrected again
      await api("PATCH",DOCS+`students/${row.s.uid}/results/${rk}?`+["ls","activity","updated",fp("flags",step),fp("replies",step),fp("fbSig",step),fp("fbAt",step)].map(p=>"updateMask.fieldPaths="+encodeURIComponent(p)).join("&"),
        {fields:{ls:fsv(a.ls),activity:fsv(a.id),updated:{timestampValue:at},fbAt:fsv({[step]:at}),flags:fsv({[step]:{why:x.flag,lv:{},fb:x.fb,v:row.v,f:row.h.f,ty:row.h.ty||null,at,done:"redo",auto:true}}),replies:fsv({[step]:redoNote(row.route,row.h.ty,x.flag)}),fbSig:fsv({[step]:"redo"})}});continue}
    if(x.flag){await api("PATCH",DOCS+`students/${row.s.uid}/results/${rk}?`+["ls","activity","updated",fp("flags",step)].map(p=>"updateMask.fieldPaths="+encodeURIComponent(p)).join("&"),   // the teacher accepts it (the correction and the level are sent) or asks for it again in class
      {fields:{ls:fsv(a.ls),activity:fsv(a.id),updated:{timestampValue:new Date().toISOString()},flags:fsv({[step]:{why:x.flag,lv:LV?x.lv:{},fb:x.fb,v:row.v,f:row.h.f,ty:row.h.ty||null,at:new Date().toISOString()}})}});continue}
    const at=new Date().toISOString();
    await api("PATCH",DOCS+`students/${row.s.uid}/results/${rk}?`+["ls","activity","updated",fp("replies",step),fp("fbSig",step),fp("fbAt",step),...(LV?[...Object.keys(x.lv).map(c=>fp("levels",step,c)),fp("marked",step)]:[])].map(p=>"updateMask.fieldPaths="+encodeURIComponent(p)).join("&"),
      {fields:{ls:fsv(a.ls),activity:fsv(a.id),updated:{timestampValue:at},replies:fsv({[step]:x.fb}),fbSig:fsv({[step]:row.v}),fbAt:fsv({[step]:at}),...(LV?{levels:fsv({[step]:x.lv}),marked:fsv({[step]:at})}:{})}})}
  console.log(`\n${flags.has("--apply")?"Sent":"Would send"}: ${r.rows.filter(x=>x.fb&&!x.flag).length} · sent back automatically (mostly pasted): ${r.rows.filter(x=>x.auto).length} · possible copies for the teacher: ${r.rows.filter(x=>x.flag&&!x.auto).length} · no line: ${r.missing.length} · lines left out: ${r.bad.length}${flags.has("--apply")?"":"\nNothing written: run again with --apply."}`)}
else if(cmd==="lv-ready"){const hasW=a=>{try{return /type:\s*'writing'/.test(fs.readFileSync(path.join(ROOT,contentOf(a)),"utf8"))}catch(e){return false}};
  for(const grp of W.EL_GROUPS)for(const a of fbActs(grp.course).filter(hasW))for(const step of ["write"]){const n=(await lvTodo(grp,a,step)).length;if(n)console.log(["LEVEL",grp.id,a.id,step,n+" corrected without a level"].join(" · "))}}
else if(cmd==="lv-sheet"){const [gid,aid,step]=args,grp=grpOf(gid),a=W.EL_CATALOG.find(x=>x.id===aid),rows=a?await lvTodo(grp,a,step):[];
  console.log(rows.length?lvSheetOf(grp,a,step,rows).text:"Nothing to level.")}
else if(cmd==="lv-apply"){const [gid,aid,step,file]=args,grp=grpOf(gid),a=W.EL_CATALOG.find(x=>x.id===aid);if(!a)throw new Error("No activity "+aid);
  const rows=await lvTodo(grp,a,step);if(!rows.length){console.log("Nothing to level.");process.exit(0)}
  const sh=lvSheetOf(grp,a,step,rows),r=W.ELMark.parse(fs.readFileSync(file,"utf8"),{aid:a.id,step,crits:sh.lvc,codes:sh.codes});if(r.err)throw new Error(r.err);const rk=a.id.replace("/","__");
  for(const x of r.rows){const row=sh.codes.get(x.code);console.log((flags.has("--apply")?"✓ ":"→ ")+x.code+" · "+Object.entries(x.lv).map(([c,l])=>c+"="+l).join(" "));if(!flags.has("--apply"))continue;
    const at=new Date().toISOString();
    await api("PATCH",DOCS+`students/${row.s.uid}/results/${rk}?`+["ls","activity","updated",...Object.keys(x.lv).map(c=>fp("levels",step,c)),fp("marked",step)].map(p=>"updateMask.fieldPaths="+encodeURIComponent(p)).join("&"),
      {fields:{ls:fsv(a.ls),activity:fsv(a.id),updated:{timestampValue:at},levels:fsv({[step]:x.lv}),marked:fsv({[step]:at})}})}
  console.log(`\n${flags.has("--apply")?"Saved":"Would save"}: ${r.rows.length} · no line: ${r.missing.length} · lines left out: ${r.bad.length}${flags.has("--apply")?"":"\nNothing written: run again with --apply."}`)}
else if(cmd==="sheet"){const [gid,aid,step]=args,grp=grpOf(gid),m=momentOf(aid,step),rows=await todo(grp,m);
  console.log(rows.length?sheetOf(grp,m,rows).text:"Nothing to mark: every hand-in has a level.")}
else if(cmd==="apply"){const [gid,aid,step,file]=args,grp=grpOf(gid),m=momentOf(aid,step),rows=await todo(grp,m),sh=sheetOf(grp,m,rows);
  const r=W.ELMark.parse(fs.readFileSync(file,"utf8"),{aid:m.a,step:m.step,crits:m.c,codes:sh.codes});if(r.err)throw new Error(r.err);
  const a=W.EL_CATALOG.find(x=>x.id===m.a),rk=a.id.replace("/","__");
  for(const x of r.rows){const row=sh.codes.get(x.code),s=row.s,fb=flags.has("--feedback")&&x.fb,auto=!!x.flag&&autoRedo(row.route,row.h.ty);x.auto=auto;
    console.log((flags.has("--apply")?"✓ ":"→ ")+x.code+" · "+Object.entries(x.lv).map(([c,l])=>c+"="+l).join(" ")+(auto?" · ↺ MOSTLY PASTED: no level, sent back to redo (note: "+redoNote(row.route,row.h.ty,x.flag)+")":x.flag?" · ⚠️ POSSIBLE COPY (no level, to the To do): "+x.flag:fb?" · feedback: "+x.fb:""));
    if(!flags.has("--apply"))continue;
    if(auto){const at=new Date().toISOString();   // as the dashboard's Redo on a level moment: no level, the note, the next hand-in goes back to the sheet
      await api("PATCH",DOCS+`students/${s.uid}/results/${rk}?`+["ls","activity","updated",fp("flags",m.step),fp("replies",m.step)].map(p=>"updateMask.fieldPaths="+encodeURIComponent(p)).join("&"),
        {fields:{ls:fsv(a.ls),activity:fsv(a.id),updated:{timestampValue:at},flags:fsv({[m.step]:{why:x.flag,lv:x.lv,fb:fb?x.fb:"",at,done:"redo",auto:true}}),replies:fsv({[m.step]:redoNote(row.route,row.h.ty,x.flag)})}});continue}
    if(x.flag){await api("PATCH",DOCS+`students/${s.uid}/results/${rk}?`+["ls","activity","updated",fp("flags",m.step)].map(p=>"updateMask.fieldPaths="+encodeURIComponent(p)).join("&"),
      {fields:{ls:fsv(a.ls),activity:fsv(a.id),updated:{timestampValue:new Date().toISOString()},flags:fsv({[m.step]:{why:x.flag,lv:x.lv,fb:fb?x.fb:"",at:new Date().toISOString()}})}});continue}
    const paths=["ls","activity","updated",...m.c.map(c=>fp("levels",m.step,c)),fp("marked",m.step),...(fb?[fp("replies",m.step),fp("fbBy",m.step)]:[])];
    await api("PATCH",DOCS+`students/${s.uid}/results/${rk}?`+paths.map(p=>"updateMask.fieldPaths="+encodeURIComponent(p)).join("&"),
      {fields:{ls:fsv(a.ls),activity:fsv(a.id),updated:{timestampValue:new Date().toISOString()},levels:fsv({[m.step]:x.lv}),marked:fsv({[m.step]:new Date().toISOString()}),...(fb?{replies:fsv({[m.step]:x.fb}),fbBy:fsv({[m.step]:"marking"})}:{})}})}
  const nf=r.rows.filter(x=>x.flag).length,na=r.rows.filter(x=>x.auto).length;
  console.log(`\n${flags.has("--apply")?"Saved":"Would save"}: ${r.rows.length-nf} · sent back automatically (mostly pasted): ${na} · possible copies for the teacher: ${nf-na} · no line: ${r.missing.length} · lines left out: ${r.bad.length}${flags.has("--apply")?"":"\nNothing written: run again with --apply."}`)}
else if(cmd==="comments"||cmd==="answer"){const its=await comments();
  if(cmd==="comments"){console.log(its.length?W.ELMark.commentSheet({date:W.ELWeek.today(),items:its}):"No comments waiting for an answer.");if(NEW&&!its.length)await cmtDone()}
  // Never straight away (Roger, 17 Nov 2026: "always answer from 8-18 and after 2 hours since u receive the message o report, don't use their
  // names or surnames since sometimes it feels like AI"): an ANSWER is saved now with at = replyAt(now) (≥ 2 hours after the comment, inside
  // 08:00-18:00 Madrid), and el-corrections.js shows it to the student only from then; --now (only when Roger asks) sends at once. An answer
  // with the student's name or surnames stops the whole file before anything is saved.
  else{const r=W.ELMark.parseComments(fs.readFileSync(args[0],"utf8"),{items:its});if(r.err)throw new Error(r.err);const now=new Date().toISOString(),NOW=process.argv.includes("--now");
    const who=uid=>{const s=studs.find(y=>y.uid===uid)||{},ro=roster[(s.email||"").toLowerCase()]||{};return [s.name,ro.first,ro.surname1,ro.surname2,ro.name].filter(Boolean)};
    const named=r.rows.filter(x=>x.kind==="ANSWER").map(x=>[x.id,namesIn(x.text,who(its.find(y=>y.id===x.id).uid))]).filter(([,w])=>w.length);
    if(named.length)throw new Error("Don't use the student's name or surnames in an answer (Roger, 17 Nov 2026: it feels like AI). Write these again without them: "+named.map(([id,w])=>id+" ("+w.join(", ")+")").join(" · ")+". Nothing was saved.");
    for(const x of r.rows){const i=its.find(y=>y.id===x.id),f=x.kind==="ANSWER"?"answers":"ask",go=NOW?now:new Date(replyAt(Date.now())).toISOString(),v=x.kind==="ANSWER"?{t:x.text,q:i.comment,at:go,made:now}:{why:x.text,q:i.comment,at:now};
      console.log((flags.has("--apply")?"✓ ":"→ ")+x.id+" · "+x.code+" · "+i.aid+" · "+x.step+" · "+(x.kind==="ANSWER"?"answer (the student sees it "+(NOW?"now":"from "+whenText(Date.parse(go)))+"): ":"🙋 for the teacher: ")+x.text);
      if(flags.has("--apply"))await api("PATCH",DOCS+`students/${i.uid}/results/${i.aid.replace("/","__")}?`+["ls","activity","updated",fp(f,x.step)].map(p=>"updateMask.fieldPaths="+encodeURIComponent(p)).join("&"),
        {fields:{ls:fsv(i.lsId),activity:fsv(i.aid),updated:{timestampValue:now},[f]:fsv({[x.step]:v})}})}
    if(NEW&&flags.has("--apply"))await cmtDone();
    console.log(`\n${flags.has("--apply")?"Saved":"Would save"}: ${r.rows.filter(x=>x.kind==="ANSWER").length} answers · ${r.rows.filter(x=>x.kind==="FORYOU").length} for the teacher · no line: ${r.missing.length} · lines left out: ${r.bad.length}${flags.has("--apply")?"":"\nNothing written: run again with --apply."}`)}}
else{console.log("Usage: node tools/marking/marks.mjs lv-ready | lv-sheet <group> <activity> <step> | lv-apply <group> <activity> <step> <answer file> [--apply] | tn-ready | tn-apply <answer file> [--apply] | ready | audit | fb-ready | fb-sheet <group> <activity> <step> | fb-apply <group> <activity> <step> <answer file> [--apply] | sheet <group> <activity> <step> | apply <group> <activity> <step> <answer file> [--apply] [--feedback] | comments | answer <answer file> [--apply]");process.exit(1)}
