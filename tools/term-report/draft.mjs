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
const OUT=arg("--out"),TERM="t1",T1_END="2026-11-20",APPLY=A.includes("--apply");if(!OUT){console.error("--out DIR needed");process.exit(1)}
const win={};const load=f=>vm.runInNewContext(fs.readFileSync(path.join(ROOT,f),"utf8"),{window:win,console});
load("shared/js/el-term-report.js");load("shared/js/el-plan.js");
const TREP=win.EL_TREP[TERM],PLAN=win.EL_PLAN,pctOf=win.elTrepPct;
// the learning-path data of each LS2 (questions, accepted answers, rules), by store key; activity id = <course>/ls2-<file>
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
const norm=s=>String(s==null?"":s).toLowerCase().replace(/[’‘`´]/g,"'").replace(/[.!?¡¿,;:"“”]+/g," ").replace(/\s+/g," ").trim();
const day=s=>String(s||"").slice(0,10),addD=(d,n)=>{const x=new Date(d+"T12:00:00Z");x.setUTCDate(x.getUTCDate()+n);return x.toISOString().slice(0,10)};
const monday=d=>{const x=new Date(d+"T12:00:00Z"),k=(x.getUTCDay()+6)%7;x.setUTCDate(x.getUTCDate()-k);return x.toISOString().slice(0,10)};
const strip=h=>String(h).replace(/<[^>]+>/g,"");
const esc=x=>String(x==null?"":x).replace(/[<>]/g,"");   // students' own text in the lines: no tags (the page escapes everything but <i>)
const lc=s=>/^(La |Halloween|Diwali|Free |My |Seasons)/.test(s)?s:s[0].toLowerCase()+s.slice(1);
const short=p=>strip(p).split(/[:(]/)[0].trim().replace(/\.$/,"");
const st=(S,key)=>{for(const l of Object.values(S.pg||{})){const v=l&&l[key];if(v){try{return typeof v==="string"?JSON.parse(v):v}catch(e){return null}}}return null};
const lvlOf=(S,course)=>((S.lv||{})[LS2[course]]||{}).level||((S.lv||{})[LS1[course]]||{}).level||"";
// The exam counts in the reports even while its results are held (Roger, 25 Nov 2026: "the reports must have them anyway, and I decide
// when to publish everthing!"): he publishes the reports himself (📣 Publish the draft), so nothing is left out here.
const held=()=>false;
// a writing mistake only illustrates the rubric row of its point (Roger, 25 Nov 2026, on a linkers point that showed a verb-s mistake:
// "did we really do this?"): organisation = linkers, punctuation, capitals; vocabulary = words and expressions; task = content; the rest grammar
const WKIND=t=>{t=String(t||"");return /spell|ortogra/i.test(t)?"spell":/task|reused|content|tasca/i.test(t)?"task":/punctu|capital|linker|connect|cohes|organi|paragraph|majúsc|puntua/i.test(t)?"org"
  :/vocab|expression|colloc|phrasal|word|time|lèxic|expressi/i.test(t)?"vocab":"grammar"};
const WKEY={wtask:"task",wgrammar:"grammar",wvocab:"vocab",worg:"org"};
const games=S=>Object.values(S.mg||{}).filter(g=>g&&g.title&&g.of);
const latestGame=(S,title)=>games(S).filter(g=>g.title===title).sort((a,b)=>String(b.day||"").localeCompare(String(a.day||"")))[0]||null;

// a typed question still answered wrongly now (the latest answer, never the first try)
function wrongNow(S,key,panels){const s=st(S,key),L=LPS[key];if(!s||!L)return [];const out=[];
  panels.forEach(pid=>{const a=(s.ans||{})[pid],P=L.lp.panels.find(p=>p.id===pid);if(!a||!P||!Array.isArray(a.q)||!Array.isArray(a.v))return;
    a.q.forEach((q,i)=>{const it=(P.items||[]).find(x=>norm(strip(x.q))===norm(strip(q)));if(!it||!Array.isArray(it.a))return;const v=a.v[i];
      if(v==null||v===""||typeof v!=="string")return;if(it.a.some(x=>norm(x)===norm(v)))return;
      out.push({q:strip(q),mine:v,fix:it.a[0],ca:it.ca||it.he||it.en,en:it.he||it.en||it.ca})})});return out}

// ---------- one point ----------
function evidence(S,pt,course){const ev=[];
  for(const s of pt.src){
    if(s.g){const g=latestGame(S,s.g);(g&&g.miss||[]).forEach(m=>m&&m.q&&m.ok&&ev.push({k:"game",q:strip(m.q),mine:m.a,fix:m.ok}))}
    if(s.p)ev.push(...wrongNow(S,s.p,s.ps).map(x=>Object.assign({k:"lp"},x)));
    if(s.x&&!held(S,s.x)){const r=((S.rs||{})[s.x+"/assessment"]||{}).report||{};
      const parts={listening:"Listening",reading:"Reading",vocabulary:"Vocabulary",grammar:"Grammar",vchoose:"Vocabulary",vcomplete:"Vocabulary",gchoose:"Grammar",gcomplete:"Grammar"};
      const want=new Set(s.k.map(k=>parts[k]).filter(Boolean));
      (r.questions||[]).filter(q=>q&&!q.ok&&want.has(q.part)&&q.right).forEach(q=>ev.push({k:"exam",q:strip(q.text||""),mine:strip(q.mine||""),fix:strip(q.right).replace(/\.$/,""),why:q.why}));
      const wk=s.k.includes("writing")?null:new Set(s.k.map(k=>WKEY[k]).filter(Boolean));if(wk===null||wk.size)((r.writing||{}).errors||[]).filter(e=>e&&WKIND(e.type)!=="spell"&&(wk===null||wk.has(WKIND(e.type)))).forEach(e=>ev.push({k:"write",mine:e.orig,fix:e.fix,why:e.why}))}
    if(s.fp){const fb=String(((S.rs||{})[s.fp]||{}).feedback||"");const ok=fb.split("\n").find(l=>/^✔/.test(l.trim())),go=fb.split("\n").find(l=>/^➜/.test(l.trim()));
      if(ok)ev.push({k:"fpok",t:ok.trim().replace(/^✔\s*/,"")});if(go)ev.push({k:"fpgo",t:go.trim().replace(/^➜\s*/,"")})}}
  return ev}
const BAND={ca:[[90,"Excel·lent."],[80,"Molt bé."],[60,"Bé."],[50,"Hi vas arribant."],[0,"Aquí has de treballar més."]],en:[[90,"Excellent."],[80,"Very good."],[60,"Good."],[50,"Getting there."],[0,"This needs more work."]]};
function lineOf(pct,ev,L,pt){if(pct==null)return L==="ca"?"Encara no has fet prou activitats d'aquest punt per saber com et va.":"You haven't done enough activities on this point yet for us to know how it's going.";
  const b=BAND[L].find(([m])=>pct>=m)[1],e=ev.find(x=>x.k!=="fpok"&&x.k!=="fpgo"&&String(x.fix||"").replace(/<[^>]+>/g,"").trim()),ok=ev.find(x=>x.k==="fpok"),go=ev.find(x=>x.k==="fpgo");
  // a final product split in two points: the first says what went well, the second what to improve
  const fpw=(pt.src.find(s=>s.fp)||{}).part;
  if(ok||go)return [b,fpw!=="go"&&ok?esc(ok.t):"",fpw!=="ok"&&pct<90&&go?(L==="ca"?"Per millorar: ":"To improve: ")+esc(go.t):""].filter(Boolean).join(" ");
  if(pct>=90)return b;
  if(!e)return b+" "+(pct>=60?(L==="ca"?"Continua així.":"Keep it up."):pt.src.some(s=>s.d)?(L==="ca"?"Fes les gravacions i el shadowing que et falten: és la millor manera de guanyar fluïdesa.":"Do the recordings and shadowing you still have to do: it is the best way to become fluent."):(L==="ca"?"Torna a fer aquestes activitats i fixa't en l'explicació de cada error.":"Do these activities again and read the explanation of each mistake."));
  const fx=`<i>${esc(e.fix)}</i>`,mn=e.mine?`<i>${esc(e.mine)}</i>`:"",rule=strip(L==="ca"?(e.ca||e.why||""):(e.en||e.why||""));const eq=esc(e.q);
  if(e.k==="write")return `${b} ${L==="ca"?"Al teu writing":"In your writing"}: ${mn} → ${fx}.${rule?" "+rule:""}`;
  if(e.k==="exam")return `${b} ${L==="ca"?"A l'examen":"In the exam"}, “${eq}”: ${L==="ca"?"la resposta era":"the answer was"} ${fx}.`;
  return `${b} ${L==="ca"?"Vigila":"Watch out"}: “${eq}” → ${fx}.${rule?" "+rule:""}`}

// ---------- when the work was done ----------
function timing(S,course,group){const ls=LS2[course],done=((DATA.ls[ls]||{}).done||{})[group]||{},exam=(PLAN[ls].exam||[])[PLAN[ls].groups.indexOf(group.replace(/(\d)ESO/,"$1ESO-"))]||PLAN[ls].exam[0];
  const actKey={};Object.entries(LPS).forEach(([k,v])=>actKey[v.act]=k);
  let due=0,dn=0,inWeek=0,lastMin=0,lateN=0;const wk={},late=[];
  Object.entries(done).forEach(([tab,d])=>{if(!d||d>T1_END)return;const [act,pid]=tab.split("#");const key=actKey[act];if(!key||!pid)return;due++;const s=st(S,key)||{};
    // the Vocabulary tab holds two steps (cards, practice): done when both are, as elTabGroups counts it (el-catalog.js)
    const D=s.done||{},A=s.doneAt||{},two=pid==="vocab"&&!D.vocab&&D.cards!==undefined;
    if(two?!(D.cards&&D.practice):!D[pid])return;dn++;const at=day(two?[A.cards,A.practice].filter(Boolean).sort().pop():A[pid]);if(!at)return;
    if(at<=addD(d,7))inWeek++;else{late.push(at);lateN++;if(at>=addD(T1_END,-6)||(exam&&at>=addD(exam,-3)&&at<=exam))lastMin++}});
  // the weekly bars: every learning-path step finished that week (not only the ticked ones)
  Object.entries(LPS).filter(([,v])=>v.course===course).forEach(([k])=>{const s=st(S,k);if(!s)return;Object.entries(s.done||{}).forEach(([pid,v])=>{const at=v&&day((s.doneAt||{})[pid]);if(at)wk[monday(at)]=(wk[monday(at)]||0)+1})});
  const start=monday(PLAN[ls].from?PLAN[ls].from[0]:"2026-10-26"),weeks=[];for(let w=start;w<=monday(exam>T1_END?exam:T1_END);w=addD(w,7))weeks.push([w,wk[w]||0]);
  // over the activities due (done in class or set as homework by the end of term): not doing one counts as not done in its week
  const p=due?Math.round(inWeek/due*100):0,lm=dn?Math.round(lastMin/dn*100):0,prof=!dn?"none":p>=70?"steady":lm>=40?"last":"behind";
  return {due,done:dn,late:lateN,inWeek:p,lastMin:lm,profile:prof,weeks,exam}}

// the steps taught to a group by the end of term (ticked as done in class on the Time plan, or set as homework): a step still locked for the
// group never counts as not done (problem report, 2ESOB, 27 Nov 2026; REQUIREMENTS § 8 "only what is on the agenda")
const TAUGHT={};
function taught(course,group,key){const id=LS2[course]+"|"+group;if(!TAUGHT[id]){const o={},ls=DATA.ls[LS2[course]]||{},actKey={};
  Object.entries(LPS).forEach(([k,v])=>actKey[v.act]=k);const add=(act,pid)=>{const k=actKey[act];if(k&&pid)(o[k]=o[k]||new Set()).add(pid)};
  Object.entries((ls.done||{})[group]||{}).forEach(([tab,d])=>{if(d&&d<=T1_END){const [act,pid]=tab.split("#");add(act,pid)}});
  Object.values((ls.homework||{})[group]||{}).forEach(h=>{if(h&&h.tabs&&day(h.set)<=T1_END)Object.entries(h.tabs).forEach(([act,pids])=>(pids||[]).forEach(pid=>add(act,pid)))});
  TAUGHT[id]=o}
  return TAUGHT[id][key]||new Set()}

// ---------- teacher only: first tries vs latest per skill ----------
const SK={read:"reading",listen:"listening",again:"listening",grammar:"grammar",mixed:"grammar",grammarPrep:"grammar",grammarRel:"grammar",grammarComp:"grammar",grammarFeel:"grammar",vocabEx:"vocabulary",words:"vocabulary"};
function firstLatest(S,course){const o={};Object.entries(LPS).filter(([,v])=>v.course===course).forEach(([k])=>{const s=st(S,k);if(!s)return;
  Object.entries(SK).forEach(([pid,sk])=>{const f=(s.tries||{})[pid],l=(s.last||{})[pid]||f;if(!f||!f.max)return;const y=o[sk]=o[sk]||{f:0,l:0,m:0};y.f+=+f.score||0;y.l+=+(l.score??f.score)||0;y.m+=+f.max})});
  Object.values(o).forEach(y=>{y.first=Math.round(y.f/y.m*100);y.latest=Math.round(y.l/y.m*100)});return o}

// ---------- the comment, in Roger's voice (never a name) ----------
function comment(L,pts,tm,S,course){const ca=L==="ca",ex=id=>{const x=(S.rs||{})[id+"/assessment"]||{},sc=x.sections||{};if(held(S,id))return null;let a=0,b=0;Object.values(sc).forEach(y=>{if(y&&y.score!=null&&y.max){a+=+y.score;b+=+y.max}});return b?Math.round(a/b*100)/10:null};
  const e1=ex(LS1[course]),e2=ex(LS2[course]),f=n=>ca?String(n).replace(".",","):String(n);const out=[];
  if(e1!=null&&e2!=null)out.push(e2>e1+0.4?(ca?`Has millorat des de l'examen de la LS1: de ${f(e1)} a ${f(e2)}. Això vol dir que, quan treballes, aprens.`:`You have improved since the LS1 exam: from ${f(e1)} to ${f(e2)}. That shows that when you work, you learn.`)
    :e2<e1-0.4?(ca?`A l'examen de la LS2 has baixat respecte a la LS1 (de ${f(e1)} a ${f(e2)}): mirem junts què ha passat.`:`Your LS2 exam went down compared with LS1 (from ${f(e1)} to ${f(e2)}), so let's look at what happened.`)
    :(ca?`Els teus dos exàmens han anat semblant (${f(e1)} i ${f(e2)}).`:`Your two exams were similar (${f(e1)} and ${f(e2)}).`));
  const has=pts.filter(p=>p.pct!=null).sort((a,b)=>b.pct-a.pct),best=has.slice(0,2).filter(p=>p.pct>=70),worst=has.filter(p=>p.pct<70).slice(-2).reverse();
  if(best.length)out.push(ca?`El que domines més: ${best.map(p=>lc(short(p.t))).join(" i ")}.`:`What you know best: ${best.map(p=>lc(short(p.t))).join(" and ")}.`);
  if(worst.length){const w=worst[0];out.push(ca?`On has de posar més atenció és en ${lc(short(w.t))} (${w.pct} %). ${w.line.replace(/^[^.]*\.\s*/,"")}`:`Where you need to focus most is ${lc(short(w.t))} (${w.pct}%). ${w.line.replace(/^[^.]*\.\s*/,"")}`)}
  const T={steady:ca?`Has treballat de manera constant, setmana a setmana: continua així.`:`You worked steadily, week by week: keep it up.`,
    behind:(ca?`De les activitats que vam fer a classe, n'has fet ${tm.done} de ${tm.due}`:`Of the activities we did in class, you did ${tm.done} of ${tm.due}`)
      +(tm.late>=3?(ca?`, i ${tm.late} les vas fer més tard de la setmana que tocava.`:`, and ${tm.late} of them later than the week we did them.`):".")
      +(tm.due>tm.done?(ca?` Et falten ${tm.due-tm.done}: fes-les abans de divendres.`:` ${tm.due-tm.done} are still to do: finish them before Friday.`):""),
    last:ca?`Vas deixar moltes activitats per al final (${tm.lastMin} % l'última setmana o just abans de l'examen), i així no tens temps de practicar abans dels exàmens.`:`You left many activities until the end (${tm.lastMin}% in the last week or just before the exam), so there was no time to practise before the exams.`,
    none:ca?`Encara no has fet les activitats dels learning paths: són la base de la nota.`:`You haven't done the learning path activities yet: they are the basis of your mark.`}[tm.profile];out.push(T);
  if(tm.due&&tm.done<tm.due&&tm.profile!=="behind"&&tm.profile!=="none")out.push(ca?`Et falten ${tm.due-tm.done} activitats: fes-les abans de divendres.`:`You still have ${tm.due-tm.done} activities to do: finish them before Friday.`);
  const w=worst[0];out.push(ca?`Al 2n trimestre, fes cada activitat la setmana que la fem a classe${w?` i practica ${lc(short(w.t))} a 🎯 Practica`:""}.`:`In term 2, do each activity in the week we do it in class${w?` and practise ${lc(short(w.t))} in 🎯 Practise`:""}.`);
  return out.join(" ")}

// ---------- every student ----------
const drafts={};
for(const [email,R] of Object.entries(DATA.roster)){const S=DATA.students[email];if(!S)continue;const course=R.group.startsWith("2")?"2eso":"4eso",C=TREP[course];
  const lv=lvlOf(S,course),L=!lv||lv==="beginners"?"ca":"en";
  const ctx={pg:S.pg,rs:S.rs,games:games(S),held:ls=>held(S,ls),due:key=>taught(course,R.group,key)};
  const pts=[];C.lss.forEach((l,li)=>l.pts.forEach((pt,pi)=>{const {pct}=pctOf(pt,ctx),ev=evidence(S,pt,course);pts.push({i:pts.length,ls:li,t:pt[L]||pt.en,pct,line:lineOf(pct,ev,L,pt)})}));
  const tm=timing(S,course,R.group);
  const has=pts.filter(p=>p.pct!=null).sort((a,b)=>b.pct-a.pct);
  drafts[email]={uid:S.uid,group:R.group,course,lang:L,level:lv,at:DATA.at,
    pub:{term:TERM,lang:L,pts:pts.map(p=>({pct:p.pct,line:p.line})),strong:has.filter(p=>p.pct>=70).slice(0,3).map(p=>p.i),work:has.filter(p=>p.pct<70).slice(-2).map(p=>p.i),
      time:{due:tm.due,done:tm.done,inWeek:tm.inWeek,lastMin:tm.lastMin,profile:tm.profile,weeks:tm.weeks,exam:tm.exam},comment:comment(L,pts,tm,S,course),at:DATA.at},
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
