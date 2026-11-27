// 📄 Term report drafts (Roger, 23 Nov 2026; docs/REQUIREMENTS.md § 3 "Term report", AGENTS.md "Term report").
// For every student: the % and one precise line for each point of "What we worked on this term" (shared/js/el-term-report.js), when the
// work was done (the date each step was first completed vs its class day on the Time plan), and a descriptive comment in Roger's voice
// (Catalan for Starter or no level, English for the rest; never a name). Teacher-only numbers (first tries vs latest) go apart.
//
//   NODE_USE_ENV_PROXY=1 node tools/term-report/draft.mjs --out DIR [--data cache.json] [--apply]
// Reads Firestore once (or a cache made by an earlier run with --save cache.json), writes DIR/drafts.json and DIR/preview.md (personal data:
// keep DIR in /mnt/project-files/alumnes/). --apply writes termReports/{email} (what the student sees, only while Roger shows it in class)
// and termReportsT/{email} (teacher only), only on Roger's "apply".
import fs from "node:fs";import path from "node:path";import vm from "node:vm";import {fileURLToPath} from "node:url";
const ROOT=path.join(path.dirname(fileURLToPath(import.meta.url)),"../.."),A=process.argv.slice(2),arg=k=>{const i=A.indexOf(k);return i<0?null:A[i+1]};
const OUT=arg("--out"),TERM="t1",APPLY=A.includes("--apply");if(!OUT){console.error("--out DIR needed");process.exit(1)}
// the same code as the page (today.html#report): el-term-report.js elTrepBuild, with the catalog, plan and Time plan helpers it uses
const win={console};win.window=win;vm.createContext(win);
for(const f of ["el-catalog.js","el-sections.js","el-criteria.js","el-plan.js","el-week.js","el-points.js","el-grading.js","el-term-report.js"])vm.runInContext(fs.readFileSync(path.join(ROOT,"shared/js",f),"utf8"),win,{filename:f});
const TREP=win.EL_TREP[TERM];
const LPS={};for(const [c,dir] of [["2eso","2eso/free-time-live"],["4eso","4eso/seasons-and-celebrations"]])for(const f of fs.readdirSync(path.join(ROOT,dir,"data")).filter(x=>x.endsWith(".js"))){
  const w={};try{vm.runInNewContext(fs.readFileSync(path.join(ROOT,dir,"data",f),"utf8"),{window:w,console})}catch(e){continue}
  if(w.LP&&w.LP.key&&w.LP.panels)LPS[w.LP.key]={lp:w.LP,act:c+"/ls2-"+f.replace(/\.js$/,""),course:c}}
const LS2={"2eso":"2eso-free-time-live","4eso":"4eso-seasons-and-celebrations"},LS1={"2eso":"2eso-my-real-routine","4eso":"4eso-my-real-routine"};

// ---------- data ----------
let DATA;const cache=arg("--data");
if(cache&&fs.existsSync(cache))DATA=JSON.parse(fs.readFileSync(cache,"utf8"));
else{const {firestore}=await import(path.join(ROOT,"tools/notify/lib.mjs"));const f=await firestore();DATA={at:new Date().toISOString(),roster:{},students:{},ls:{}};
  const R=(await f.list("roster")).filter(([,d])=>d&&!d.away&&!d.tester&&/^(2ESO|4ESO)[AB]$/.test(d.group||""));R.forEach(([id,d])=>DATA.roster[id.toLowerCase()]={group:d.group});
  const by={};(await f.list("students")).forEach(([uid,d])=>{if(d&&d.email)by[d.email.toLowerCase()]=[uid,d]});
  for(const id of [...Object.values(LS1),...Object.values(LS2)])DATA.ls[id]=await f.get("ls/"+id);
  await Promise.all(Object.keys(DATA.roster).map(async email=>{const s=by[email];if(!s)return;const [uid,d]=s,o={uid,me:d,pg:{},rs:{},lv:{},mg:{}};
    const [pg,rs,lv,mg]=await Promise.all([f.list("students/"+uid+"/progress"),f.list("students/"+uid+"/results"),f.list("students/"+uid+"/levels"),f.get("myGames/"+email).catch(()=>null)]);
    pg.forEach(([k,v])=>o.pg[k]=(v&&v.data)||{});rs.forEach(([k,v])=>o.rs[(v&&v.activity)||k]=v);lv.forEach(([k,v])=>o.lv[k]=v);o.mg=(mg&&mg.games)||{};DATA.students[email]=o}));
  if(arg("--save"))fs.writeFileSync(arg("--save"),JSON.stringify(DATA))}
const NOW=Date.parse(DATA.at||new Date().toISOString());

// ---------- helpers ----------
const st=(S,key)=>{for(const l of Object.values(S.pg||{})){const v=l&&l[key];if(v){try{return typeof v==="string"?JSON.parse(v):v}catch(e){return null}}}return null};
const lvlOf=(S,course)=>((S.lv||{})[LS2[course]]||{}).level||((S.lv||{})[LS1[course]]||{}).level||"";
const games=S=>Object.values(S.mg||{}).filter(g=>g&&g.title&&g.of);
const strip=h=>String(h).replace(/<[^>]+>/g,"");
// The exam counts in the reports even while its results are held (Roger, 25 Nov 2026: "the reports must have them anyway, and I decide
// when to publish everthing!"): he publishes the reports himself (📣 Publish the draft), so nothing is left out.
const [T_FROM,T_TO]=win.elTermSpan(TERM),UPTO=win.ELWeek.add(T_TO,1);   // the tabs taught by the term's last day (as the bonus)

// ---------- teacher only: first tries vs latest per skill ----------
const SK={read:"reading",listen:"listening",again:"listening",grammar:"grammar",mixed:"grammar",grammarPrep:"grammar",grammarRel:"grammar",grammarComp:"grammar",grammarFeel:"grammar",vocabEx:"vocabulary",words:"vocabulary"};
function firstLatest(S,course){const o={};Object.entries(LPS).filter(([,v])=>v.course===course).forEach(([k])=>{const s=st(S,k);if(!s)return;
  Object.entries(SK).forEach(([pid,sk])=>{const f=(s.tries||{})[pid],l=(s.last||{})[pid]||f;if(!f||!f.max)return;const y=o[sk]=o[sk]||{f:0,l:0,m:0};y.f+=+f.score||0;y.l+=+(l.score??f.score)||0;y.m+=+f.max})});
  Object.values(o).forEach(y=>{y.first=Math.round(y.f/y.m*100);y.latest=Math.round(y.l/y.m*100)});return o}

// ---------- every student ----------
const drafts={};
for(const [email,R] of Object.entries(DATA.roster)){const S=DATA.students[email];if(!S)continue;const course=R.group.startsWith("2")?"2eso":"4eso",C=TREP[course];
  const lv=lvlOf(S,course),L=!lv||lv==="beginners"?"ca":"en";
  const ctx={course,group:R.group,lang:L,pg:S.pg,rs:S.rs,games:games(S),infoOf:id=>DATA.ls[id]||{},term:{from:T_FROM,to:T_TO,deadline:(win.EL_TREP_DEADLINE||{})[TERM]},
    taught:win.elTrepTaught(R.group,id=>DATA.ls[id]||{},UPTO),lp:key=>(LPS[key]||{}).lp||null};
  const P=win.elTrepBuild(C,ctx);delete P.live;
  drafts[email]={uid:S.uid,group:R.group,course,lang:L,level:lv,at:DATA.at,pub:Object.assign({term:TERM},P,{at:DATA.at}),
    teacher:{firstLatest:firstLatest(S,course)}}}
fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(path.join(OUT,"drafts.json"),JSON.stringify(drafts,null,1));
// preview for Roger: one block per student (group, level, profile, comment, the points)
const md=["# Term 1 reports: drafts ("+DATA.at.slice(0,16).replace("T"," ")+" UTC)",""];
for(const g of ["2ESOA","2ESOB","4ESOA","4ESOB"]){md.push("## "+g,"");Object.entries(drafts).filter(([,d])=>d.group===g).forEach(([e,d])=>{const P=d.pub;
  md.push(`### ${e.split("@")[0]} · ${d.level||"no level"} · ${P.lang} · ${P.time.profile} (${P.time.done}/${P.time.due} done, ${P.time.inWeek}% in the class week, ${P.time.lastMin}% last minute)`,"",P.comment,"");
  P.pts.forEach((p,i)=>md.push(`- ${p.pct==null?"–":p.pct+"%"} · ${strip(p.line)}`));md.push("")})}
fs.writeFileSync(path.join(OUT,"preview.md"),md.join("\n"));
const N=Object.values(drafts),cnt=k=>N.filter(d=>d.pub.time.profile===k).length;
console.log(N.length,"drafts ·",N.filter(d=>d.lang==="ca").length,"Catalan ·","steady",cnt("steady"),"behind",cnt("behind"),"last minute",cnt("last"),"none",cnt("none"));
if(APPLY){const {firestore}=await import(path.join(ROOT,"tools/notify/lib.mjs"));const f=await firestore();if(!f.set)throw new Error("lib has no set()");
  for(const [e,d] of Object.entries(drafts)){await f.set("termReports/"+e,{[TERM]:d.pub});await f.set("termReportsT/"+e,{[TERM]:d.teacher})}
  console.log("WRITTEN",N.length,"termReports + termReportsT")}
