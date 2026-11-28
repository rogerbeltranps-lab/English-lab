// 📄 Prints the term report comment's sentence bank (el-term-report.js EL_TREP_BANK) as a Markdown table, for Roger to review.
//   node tools/term-report/bank.mjs > bank.md
import fs from "node:fs";import path from "node:path";import vm from "node:vm";import {fileURLToPath} from "node:url";
const ROOT=path.join(path.dirname(fileURLToPath(import.meta.url)),"../.."),W={console};W.window=W;vm.createContext(W);
vm.runInContext(fs.readFileSync(path.join(ROOT,"shared/js/el-term-report.js"),"utf8"),W);
const c=s=>String(s).replace(/\|/g,"\\|");
console.log("| # | When it is used (what the work shows) | English | Català |\n|---|---|---|---|");
Object.entries(W.EL_TREP_BANK).forEach(([id,b],i)=>console.log(`| ${i+1} · ${id} | ${c(b.when)} | ${c(b.en)} | ${c(b.ca)} |`));
