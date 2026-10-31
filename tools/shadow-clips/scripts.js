// Run from the repo root: S=<work dir> node tools/shadow-clips/scripts.js <data files…>  → <work dir>/scripts.json (the media.script of every mp3 listening panel).
// Then: python3 tools/shadow-clips/align.py <work dir> → times.json (start/end of each script line, normal and -slow mp3), and gen.py <work dir> → clips.json.
// Shadowing clips (AGENTS.md, "The four communicative competences"): pip install pocketsphinx (bundles its English model).
// dump scripts of mp3 listening panels: file -> lines
global.window={};const fs=require("fs");const out={};
const files=process.argv.slice(2);
for(const f of files){window.LP=null;eval(fs.readFileSync(f,"utf8"));
 for(const p of window.LP.panels){const m=p.media;if(m&&m.audio&&m.script){out[f.replace(/data\/.*/,"")+m.audio]=m.script.map(l=>Array.isArray(l)?l[l.length-1]:l)}}}
fs.writeFileSync(process.env.S+"/scripts.json",JSON.stringify(out,null,1));console.log(Object.keys(out).map(k=>k+" "+out[k].length).join("\n"))
