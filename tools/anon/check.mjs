// 🕶 Check: marking never sees who the student is (Roger, 26 Nov 2026; docs/REQUIREMENTS.md § 8). Free, no database.
//   node tools/anon/check.mjs
// 1. mask() / unmask() hide every student's name and put it back unchanged; 2. the marking tools hand the marker masked words and no
// names or emails (a static look at the code, so a later change that sends the raw text or a name again fails here).
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {nameWords,mask,unmask,maskDeep,unmaskDeep,codeOf} from "./anon.mjs";
const ROOT=path.join(path.dirname(fileURLToPath(import.meta.url)),"../.."),bad=[];
const ok=(c,m)=>{if(!c)bad.push(m)};

// 1. the masking (invented students only)
const W=nameWords([{name:"Pau Exemple",first:"Pau",surname1:"Exemple"},{first:"Alex",surname1:"Sample",surname2:"Muñoz-Test"},"Mark Will"]);
const m={},src="Hi, I'm Pau Exemple. Pau means peace, la pau. I will meet Alex’s mum and Mr Muñoz. Mark it here, Mark!";
const t=mask(src,W,m);
ok(!/Pau|Exemple|Alex|Muñoz/.test(t),"a name is still there: "+t);
ok(/la pau/.test(t),"an ordinary lower-case word was masked: "+t);
ok(/I will meet/.test(t),"‘will’ was masked: "+t);
ok(unmask(t,m)===src,"unmask did not give the text back: "+unmask(t,m));
ok(mask("Pau",W,m)===mask("Pau",W,m),"the same name must keep its number");
const deep={f:[{l:"Text",v:"My friend Alex"}],q:"Exemple"},md=maskDeep(deep,W,m);
ok(JSON.stringify(md).indexOf("Alex")<0&&JSON.stringify(unmaskDeep(md,m))===JSON.stringify(deep),"maskDeep / unmaskDeep");
ok(/^S-\w{6}$/.test(codeOf("abcdefghijk")),"codeOf");

// 2. the tools
const read=f=>fs.readFileSync(path.join(ROOT,f),"utf8");
const marks=read("tools/marking/marks.mjs"),writing=read("tools/web-exam/writing.mjs"),probs=read("tools/problems/auto.mjs"),teacher=read("teacher.html");
ok(!/fields:by\[u\]\.h\.f\b/.test(marks)&&(marks.match(/fields:mk\(u,by\[u\]\.h\.f\)/g)||[]).length===2,"marks.mjs: a sheet sends a student's fields without mk()");
ok(/fields:mk\(s\.uid,h\.f\),comment:mk\(s\.uid,/.test(marks),"marks.mjs comments(): the comment sheet must mask fields and comment");
ok((marks.match(/unmk\(/g)||[]).length>=7,"marks.mjs: the answers must be unmasked before they are saved");
ok(/taught\(a,grp\.id,m\.step\)/.test(marks)&&/if\(!taught\(a,grp\.id,step\)\)continue/.test(marks),"marks.mjs: corrections must follow the agenda (taught)");
ok(!/\bname: s\.name|email: s\.email/.test(writing)&&/code: codeOf\(uid\)/.test(writing)&&/text: mask\(text/.test(writing),"writing.mjs export: no name or email, masked text");
ok(/w\.corrected = unmask\(/.test(writing),"writing.mjs import: unmask the correction");
ok(!/\(x\.name\|\|"\?"\)/.test(probs)&&!/a\.label\|\|"\?"/.test(probs),"problems/auto.mjs: prints a student's name");
ok(/JSON\.stringify\(M\(x\.text\)\)/.test(probs),"problems/auto.mjs: the report's words must be masked");
ok(!/The student is "\+who|being marked is "\+who/.test(teacher)&&/student:"",group:/.test(teacher),"teacher.html: the Roig final product prompt must not carry the name");

if(bad.filter(Boolean).length){console.error("✗ Anonymous marking:\n  "+bad.filter(Boolean).join("\n  "));process.exit(1)}
console.log("✓ Anonymous marking: names masked and restored, the marking tools send no names");
