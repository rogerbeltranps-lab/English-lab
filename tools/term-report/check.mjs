// 📄 Check: reports build themselves and a step that was never unlocked never counts (Roger, 26–27 Nov 2026; docs/REQUIREMENTS.md § 3
// "Term report"). Free, no database, invented students only.   node tools/term-report/check.mjs
import fs from "node:fs";import path from "node:path";import vm from "node:vm";import {fileURLToPath} from "node:url";
const ROOT=path.join(path.dirname(fileURLToPath(import.meta.url)),"../.."),bad=[],ok=(c,m)=>{if(!c)bad.push(m)};
const W={console,EL_TODAY:"2026-11-27"};W.window=W;vm.createContext(W);
for(const f of ["el-catalog.js","el-sections.js","el-criteria.js","el-plan.js","el-week.js","el-points.js","el-grading.js","el-term-report.js"])vm.runInContext(fs.readFileSync(path.join(ROOT,"shared/js",f),"utf8"),W,{filename:f});
const LS="4eso-seasons-and-celebrations",C=W.EL_TREP.t1["4eso"],G="4ESOA";
// the Time plan: only the Reading tab of Celebrations was taught (20 Nov); Getting started's Speaking tab is still locked
const info={status:"open",planEdits:{[G]:{agenda:JSON.stringify({days:{"2026-11-04":["4eso/ls2-celebrations-around-the-world#read"],"2026-12-02":["4eso/ls2-getting-started#speak"]}})}}};
const GS=JSON.stringify({done:{words:true},doneAt:{words:"2026-10-28T10:00:00Z"}});
const pg={[LS]:{ls2GettingStarted4ESO:GS,ls2Celebrations4ESO:JSON.stringify({done:{read:true},doneAt:{read:"2026-11-05T10:00:00Z"},last:{read:{score:4,max:5}}})}};
const taught=W.elTrepTaught(G,()=>info,"2026-11-21");
ok(taught("ls2Celebrations4ESO","read")===true,"a tab on a past class day must count as taught");
ok(taught("ls2GettingStarted4ESO","speak")===false,"a tab planned for a later class must not count as taught");
const speak={src:[{d:"ls2GettingStarted4ESO",ps:["speak"]}]};
ok(W.elTrepPct(speak,{pg,taught}).pct===null,"a locked step counted in a point's % (must be left out, not 0)");
ok(W.elTrepPct(speak,{pg}).pct===0,"without the Time plan test, a step not done is 0");
const ctx={course:"4eso",group:G,lang:"en",pg,rs:{},games:[],taught,infoOf:()=>info,term:{from:"",to:"2026-11-20",deadline:"2026-11-27"}};
const R=W.elTrepBuild(C,ctx);
ok(R.pts.length===C.lss.reduce((n,l)=>n+l.pts.length,0),"one line per point");
ok(R.time.due===1&&R.time.done===1&&R.time.inWeek===100&&R.time.profile==="steady","timing: only the taught tab is due ("+JSON.stringify(R.time)+")");
ok(R.pts.some(p=>p.pct===80),"the Reading's latest score reaches its point");
ok(!/Sample|Exemple/.test(R.comment)&&R.comment.length>20,"the comment is written and has no name");
// a saved draft line is kept while its % is the same, replaced when the % moves
const prev={pts:R.pts.map(p=>({pct:p.pct,line:"SAVED"}))};
ok(W.elTrepBuild(C,Object.assign({},ctx,{prev})).pts.every(p=>p.line==="SAVED"),"a saved line must stay while its % is the same");
const pg2={[LS]:{ls2GettingStarted4ESO:GS,ls2Celebrations4ESO:JSON.stringify({done:{read:true},doneAt:{read:"2026-11-05T10:00:00Z"},last:{read:{score:5,max:5}}})}};
ok(W.elTrepBuild(C,Object.assign({},ctx,{pg:pg2,prev})).pts.some(p=>p.pct===100&&p.line!=="SAVED"),"a line must be written again when its % changes");
// problem report, 2ESOB, 27 Nov 2026 ("El shadowing ho vaig fer be i m'has posat una mitjana que no va acorde amb el que he fet"): LP2 Speaking
// and all of LP3 still locked, so only LP1 Speaking (not done) and LP2 shadowing (done) count
const sh=W.EL_TREP.t1["2eso"].lss[1].pts.find(p=>/shadowing/i.test(p.en));
const pgS={x:{ls2GettingStarted2ESO:JSON.stringify({done:{}}),ls2Doing2ESO:JSON.stringify({done:{shadow:true}}),ls2NowUsually2ESO:JSON.stringify({done:{}})}};
const T2={ls2GettingStarted2ESO:new Set(["speak"]),ls2Doing2ESO:new Set(["shadow"])};
ok(W.elTrepPct(sh,{pg:pgS,due:k=>T2[k]||new Set()}).pct===50,"2ESOB shadowing: locked steps must be left out (want 50)");
ok(W.elTrepPct(sh,{pg:pgS,taught:(k,id)=>!!(T2[k]&&T2[k].has(id))}).pct===50,"2ESOB shadowing with elTrepTaught's form (want 50)");
ok(W.elTrepPct(sh,{pg:pgS}).pct===17,"without the group's agenda every step counts (want 17)");
ok(W.elTrepPct(sh,{pg:pgS,due:()=>new Set()}).pct===null,"nothing taught yet: no %");
// a term with no text: the points come from the class games played that term
const auto=W.elTrepWorked("t2","4eso",[{title:"Grammar · Something new",ls:LS,of:10,r:7,day:"2026-12-03"},{title:"Vocabulary · Old",ls:LS,of:10,r:7,day:"2026-11-03"}]);
ok(auto&&auto.auto&&auto.lss[0].pts.length===1&&/Something new/.test(auto.lss[0].pts[0].en),"term 2 points from that term's class games only");
// the comment names exams by their level, never their numbers or questions, and every English sentence has its Catalan (Roger, 28 Nov 2026)
const rsX={"4eso-my-real-routine/assessment":{sections:{a:{score:58,max:100}}},[LS+"/assessment"]:{sections:{a:{score:84,max:100}},report:{questions:[{ok:false,part:"Reading",text:"SECRET QUESTION",mine:"x",right:"y"}]}}};
const RX=W.elTrepBuild(C,Object.assign({},ctx,{rs:rsX}));
ok(/Satisfactory \(Assoliment satisfactori\)/.test(RX.comment)&&/Very good \(Assoliment notable\)/.test(RX.comment),"the comment must name the exams' levels: "+RX.comment);
ok(!/\d+[.,]\d|\d+ ?%|SECRET/.test(RX.comment),"the comment must have no exam numbers, %, or exam questions: "+RX.comment);
ok(typeof RX.commentCa==="string"&&/Assoliment satisfactori/.test(RX.commentCa)&&/Assoliment notable/.test(RX.commentCa)&&!/ exam /.test(RX.commentCa),"an English report must carry its comment in Catalan: "+RX.commentCa);
ok(RX.pts.every(p=>typeof p.ca==="string"&&p.ca.length>3),"every point line must have its Catalan");
ok(/^Your everyday work/.test(RX.comment)&&RX.comment.indexOf("exam")>RX.comment.indexOf("everyday work"),"the comment opens with everyday work, the exam comes after: "+RX.comment);
// a closing sentence from the bank, a teacher's, not a friend's (Roger, 28 Nov 2026)
{const E=["endProud","endEffort","endFresh","endBelieve","endThanks"].map(k=>W.EL_TREP_BANK[k]);ok(E.some(b=>RX.comment.endsWith(b.en)),"the comment ends with a closing sentence: "+RX.comment);
 ok(E.some(b=>RX.commentCa.endsWith(b.ca)),"the Catalan comment ends the same way: "+RX.commentCa);}
const RC=W.elTrepBuild(C,Object.assign({},ctx,{rs:rsX,lang:"ca"}));ok(RC.commentCa===RC.comment,"a Catalan report's Catalan comment is the comment itself");
// term 1: the comment never says when the activities were done (Roger, 28 Nov 2026: "not in this ones because I was building the web"); from term 2 it does
{const TS=["onTime","notOnTime","lastMin"].map(k=>W.EL_TREP_BANK[k]),has=(c,l)=>TS.some(b=>c.includes(b[l].split(/[:{,]/)[0]));
 for(const r of [R,RX,RC])ok(!has(r.comment,r.lang)&&!has(r.commentCa,"ca"),"a term 1 comment talks about when the activities were done: "+r.comment);
 const R2=W.elTrepBuild(Object.assign({},C,{timing:true}),Object.assign({},ctx,{rs:rsX}));ok(R2.time.profile==="none"||has(R2.comment,"en"),"from term 2 the comment must say when the activities were done ("+R2.time.profile+"): "+R2.comment);}
// Firestore takes no array straight inside another array (🔄 Rebuild failed with "Nested arrays are not supported", 28 Nov 2026)
const nested=(v,inArr)=>Array.isArray(v)?(inArr||v.some(x=>nested(x,true))):v&&typeof v==="object"?Object.values(v).some(x=>nested(x,false)):false;
for(const [n,r] of [["English",RX],["Catalan",RC],["first",R]])ok(!nested(r,false),`the ${n} report holds an array inside an array (Firestore refuses to save it): `+JSON.stringify(r.time&&r.time.weeks));
ok(RX.time.weeks.length&&RX.time.weeks.every(w=>typeof w.d==="string"&&typeof w.n==="number"),"each week is {d, n}: "+JSON.stringify(RX.time.weeks));
{const old={time:{weeks:[["2026-10-26",5],["2026-11-02",0]]},pts:[{pct:50}]},sf=W.elTrepSafe(old);
 ok(!nested(sf,false)&&sf.time.weeks[0].d==="2026-10-26"&&sf.time.weeks[0].n===5,"elTrepSafe turns an old saved report's [monday, n] weeks into {d, n}: "+JSON.stringify(sf));
 ok(JSON.stringify(W.elTrepWeeks(old))===JSON.stringify(W.elTrepWeeks(sf)),"elTrepWeeks reads old and new weeks the same");}
if(bad.length){console.error("✗ Term report:\n  "+bad.join("\n  "));process.exit(1)}
console.log("✓ Term report: built live, locked steps never count, saved lines kept while unchanged");
