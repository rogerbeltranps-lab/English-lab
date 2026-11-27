// Term report check (problem report, 2ESOB, 27 Nov 2026: "El shadowing ho vaig fer be i m'has posat una mitjana que no va acorde amb el que
// he fet"): a "done" point (Speaking and shadowing) counts only the steps taught to the student's group; a step still locked never counts 0.
//   node tools/term-report/check.mjs
import fs from "node:fs";import path from "node:path";import vm from "node:vm";import {fileURLToPath} from "node:url";
const ROOT=path.join(path.dirname(fileURLToPath(import.meta.url)),"../.."),win={};
vm.runInNewContext(fs.readFileSync(path.join(ROOT,"shared/js/el-term-report.js"),"utf8"),{window:win,console});
const pt=win.EL_TREP.t1["2eso"].lss[1].pts.find(p=>/shadowing/i.test(p.en));
const pg={x:{ls2GettingStarted2ESO:JSON.stringify({done:{}}),ls2Doing2ESO:JSON.stringify({done:{shadow:true}}),ls2NowUsually2ESO:JSON.stringify({done:{}})}};
const taught={ls2GettingStarted2ESO:new Set(["speak"]),ls2Doing2ESO:new Set(["shadow"])};   // LP2 Speaking and all of LP3 still locked
let bad=0;const eq=(got,want,what)=>{if(got!==want){bad++;console.log("✗",what,"→",got,"(want",want+")")}else console.log("✓",what,"=",got)};
eq(win.elTrepPct(pt,{pg,due:k=>taught[k]||new Set()}).pct,50,"LP1 Speaking not done + LP2 shadowing done, locked steps left out");
eq(win.elTrepPct(pt,{pg}).pct,17,"without the group's agenda every step counts (old behaviour)");
eq(win.elTrepPct(pt,{pg,due:()=>new Set()}).pct,null,"nothing taught yet: no %");
process.exit(bad?1:0);
