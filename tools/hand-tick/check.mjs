// ✔ To do only after ✔ Finished (Roger, 28 Nov 2026; REQUIREMENTS § 3): from EL_HAND_TICK a class day of the Time plan agenda never makes
// its tabs To do (taught) by itself; only the tick (ls/{id}.done), homework, or a day before EL_HAND_TICK. Run: node tools/hand-tick/check.mjs
import fs from "node:fs";import vm from "node:vm";import path from "node:path";import {fileURLToPath} from "node:url";
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const load=today=>{const c={console};c.window=c;c.EL_TODAY=today;vm.createContext(c);
  for(const f of ["el-catalog.js","el-sections.js","el-plan.js","el-week.js","el-points.js"])vm.runInContext(fs.readFileSync(path.join(ROOT,"shared/js",f),"utf8"),c,{filename:f});return c};
const A="4eso/ls2-plan-the-day",G="4ESOB",LS="4eso-seasons-and-celebrations",fail=[],ok=(c,m)=>{if(!c)fail.push(m)};
const ag={days:{"2026-11-27":[A+"#recall"],"2026-11-30":[A+"#listen",A+"#grammar",A+"#game:x"],"2026-12-01":[A+"#write"]}};
const info=done=>({planEdits:{[G]:{agenda:JSON.stringify(ag)}},done:{[G]:done||{}},homework:{[G]:{h1:{set:"2026-11-30",tabs:{[A]:["speak"]}}}}});
const tabs=(c,i,t)=>[...((c.elDueBefore(i,G,t).tabs[A])||[])].sort().join(",");
let c=load("2026-12-02");
ok(tabs(c,info(),"2026-12-02")==="recall,speak","agenda days from 30 Nov count by themselves: "+tabs(c,info(),"2026-12-02"));
ok(tabs(c,info({[A+"#listen"]:"2026-11-30"}),"2026-12-02")==="listen,recall,speak","a ✔ Finished tab must count: "+tabs(c,info({[A+"#listen"]:"2026-11-30"}),"2026-12-02"));
const t={},auto=c.ELWeek.autoTicks(LS,ag,t,"2026-12-02");
ok(auto.some(k=>k.includes("@2026-11-27#"))&&!auto.some(k=>/@2026-1(1-30|2-01)/.test(k)),"autoTicks must tick only days before 30 Nov: "+auto.join(" "));
const st=c.elHandInStarts(info({[A+"#listen"]:"2026-12-01"}),G,"2026-12-02");
ok(st(A,"listen")==="2026-12-01"&&st(A,"grammar")==null,"hand-in start = the tick's day: "+st(A,"listen")+" / "+st(A,"grammar"));
if(fail.length){console.error("✗ "+fail.join("\n✗ "));process.exit(1)}console.log("✓ Planned tabs are To do only once ✔ Finished (from 30 Nov 2026)");
