// Builds lab/game/decks/theory.js (Roger, 6 Nov 2026: "when they take their notes, they get a copy of the slides and below their notes …
// if a student doesn't come … the system saves the theory in their notes"): ONLY the theory slides of every class game, grouped by the
// notes slide that follows them (p1, p2… the same grouping as withNotes in lab/game/host.js). The player (play.js) and the LS page's
// 📝 Your notes (shared/js/el-notes.js) load this file, never a deck file, so no student device ever gets the questions' answers.
// Run after adding or changing a deck: node tools/game-theory/build.mjs
import fs from "node:fs";import path from "node:path";import vm from "node:vm";import {fileURLToPath} from "node:url";
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../.."),DIR=path.join(ROOT,"lab/game/decks");
const out={};
for(const f of fs.readdirSync(DIR).filter(f=>f.endsWith(".js")&&f!=="index.js"&&f!=="theory.js").sort()){
  let deck=null;vm.runInNewContext(fs.readFileSync(path.join(DIR,f),"utf8"),{ELGameDeck:d=>{deck=d},window:{}});
  if(!deck||deck.notes===false)continue;
  // each part also has its grammar or vocabulary point (point / pointCa on its first theory slide; Roger, 9 Nov 2026: "shouldnt we put the
  // kind of grammar and performace like present simple") and n = how many questions practise it (never the questions themselves), so
  // 🎓 My progress shows the student's % per point (today.html gvBox) from their myGames misses (miss[].p)
  const parts=[];let run=[],pt=null;
  const flush=()=>{if(run.length){parts.push({k:"p"+(parts.length+1),...(pt?{name:pt[0],nameCa:pt[1]}:{}),n:0,slides:run});run=[];pt=null}};
  for(const s of deck.slides){
    if(s.q){flush();if(parts.length)parts[parts.length-1].n++;continue}
    if(s.point&&!run.length)pt=[s.point,s.pointCa||s.point];
    if(s.notes===false)continue;
    run.push({theory:s.theory||"",img:/^[\w./-]+\.(png|jpe?g|svg|webp)$/i.test(s.img||"")?"":s.img||"",lines:s.lines||[],...(s.ca?{ca:[].concat(s.ca)}:{})});
  }
  flush();
  if(parts.length)out[f.replace(/\.js$/,"")]={title:deck.title,parts};
}
fs.writeFileSync(path.join(DIR,"theory.js"),"// Built by tools/game-theory/build.mjs from the deck files: only the theory slides, never the questions. Do not edit by hand.\nwindow.EL_GAME_THEORY="+JSON.stringify(out)+";\n");
console.log("theory.js:",Object.keys(out).length,"games");
