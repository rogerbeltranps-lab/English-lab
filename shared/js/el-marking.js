// Marking sheets (Roger, 31 Oct 2026: "the idea of this website is that everything gets corrected by itself except for the final product").
// The learning-path steps that need a teacher level (moments of el-grading.js outside the final product: Reading log, Listening chart,
// Research card / Fact file) are marked from a sheet: every hand-in of a group without a level, the indicators, and a strict answer
// format (EL-MARKS v1). Students appear as codes (S- + the start of their uid), never names. Used by teacher.html (the 🤖 Marking sheet
// dialog) and by tools/marking/marks.mjs (the same from the cloud, with a service account). Needs el-week.js (ELWeek) for ready().
window.ELMark=(function(){
  const V="EL-MARKS v1",DEG=["NA","AS","AN","AE"];
  // short codes, unique among these students: [[code, uid], …]
  function codes(uids){for(let n=6;n<=28;n++){const cs=uids.map(u=>"S-"+u.slice(0,n));if(new Set(cs).size===cs.length)return new Map(cs.map((c,i)=>[c,uids[i]]))}return new Map(uids.map(u=>["S-"+u,u]))}
  // o = {aid, title, step, stepName, group, date, crits:[c], crit:{c:"4.1 · CE4 · Reading: …"}, ind:{c:[NA, AS, AN, AE texts]},
  //      students:[{code, route (name), ca (feedback in Catalan), exam ("LS1 6/10": their exam writing marks), ty (the writing log of
  //      el-typing.js: {p pasted chars, k keys typed, s seconds writing, n chars}), fields:[{l, v}]}]}
  function sheet(o){
    const head=[`${V} SHEET`,`Activity: ${o.aid} · ${o.title}`,`Step: ${o.step} · ${o.stepName}`,`Group: ${o.group} · ${o.date}`,`Criteria: ${o.crits.join(", ")}`,"",
      "You are marking the work of secondary-school students of English (Catalonia). Give each student one level per criterion, using only the indicators below.",
      "Levels, lowest to highest: NA (not achieved), AS (satisfactory), AN (notable), AE (excellent).",
      "Each student did the route shown (Starter and Base had more support and shorter tasks; Core and Plus fuller ones): judge the work against the indicators for what that route asked. Do not lower a level for small spelling mistakes unless the indicator says so. Empty work is NA.",
      "COPYING: flag a text you think the student did not write themselves: far above what their route and exam writing mark suggest, translator-like (correct but unnatural, words or structures a learner at that level would not know), or mostly pasted according to its writing log (pasting most of a long text in seconds, with few keys typed). A spoken transcript comes from speech recognition, so few typed keys is normal there: only pasting counts. Route Pro is a native speaker preparing C2: a perfect text is expected, so flag Pro only when most of it was pasted. A flag never decides the mark: the teacher checks it. Still give the levels the work would get if it were their own.",
      "",...o.crits.flatMap(c=>[o.crit[c]||c,...(o.ind[c]||[]).map((d,i)=>`  ${DEG[i]}: ${d}`),""])];
    const body=o.students.flatMap(s=>[`=== ${s.code} · route ${s.route||"–"} · feedback in ${s.ca?"Catalan":"English"}${s.exam?" · exam writing "+s.exam:""}`,
      ...(s.ty?[`[writing log] ${tyText(s.ty)}`]:[]),
      ...(s.fields||[]).map(f=>`[${f.l}] ${String(f.v||"").replace(/\s+/g," ").trim()||"(empty)"}`),""]);
    const fmt=["ANSWER FORMAT (strict: the dashboard reads it automatically). Reply with ONLY these lines, in a single code block, nothing before or after:",
      `${V} | ${o.aid} | ${o.step} | ${o.group}`,
      `<code> | ${o.crits.map(c=>c+"=<level>").join("; ")} | <feedback: one or two short sentences to the student, in the language given, saying one thing done well and one to improve>`,
      "(one line per student, every code above, same order)",
      `For a flagged text add a fourth part at the end of its line: <code> | … | <feedback> | COPY? <short reason for the teacher, in English>`,"END",
      "Levels must be exactly NA, AS, AN or AE. Never write | inside the feedback. Never add names."];
    return [...head,"STUDENTS",...body,...fmt].join("\n");
  }
  // the writing log in words: "pasted 180 characters (the text has 200) · 40 keys typed · 3 min writing"
  function tyText(t){return `pasted ${t.p||0} characters (the text has ${t.n||0}) · ${t.k||0} keys typed · ${t.s>=60?Math.round(t.s/60)+" min":(t.s||0)+" s"} writing`}
  // the answer: {err} or {group, rows:[{code, lv:{c: level}, fb, flag (the COPY? reason or "")}], bad:[lines left out], missing:[codes without a line]}
  function parse(txt,o){   // o = {aid, step, crits, codes: Map code → anything}
    const ls=String(txt||"").replace(/```[a-z]*/gi,"").split(/\r?\n/).map(l=>l.trim()).filter(Boolean),h=ls.findIndex(l=>l.replace(/\s+\|/,"|").startsWith(V+"|"));
    if(h<0)return {err:`No “${V} | …” line found: paste the whole answer.`};
    const [,aid,step,group]=ls[h].split("|").map(x=>x.trim());
    if(aid!==o.aid||step!==o.step)return {err:`This answer is for ${aid} · ${step}, not for this sheet.`};
    const rows=[],bad=[],seen=new Set();
    for(const l of ls.slice(h+1)){if(/^END$/i.test(l))break;const p=l.split("|").map(x=>x.trim());
      if(!o.codes.has(p[0])||seen.has(p[0])){bad.push(l);continue}const lv={};
      (p[1]||"").split(";").forEach(x=>{const r=/^(.+?)\s*=\s*(NA|AS|AN|AE)$/i.exec(x.trim());if(r&&o.crits.includes(r[1].trim()))lv[r[1].trim()]=r[2].toUpperCase()});
      if(!o.crits.every(c=>lv[c])){bad.push(l);continue}seen.add(p[0]);const fi=p.findIndex((x,i)=>i>1&&/^COPY\??(\s|:|$)/i.test(x));
      rows.push({code:p[0],lv,fb:(fi<0?p.slice(2):p.slice(2,fi)).join(" ").trim(),flag:fi<0?"":p.slice(fi).join(" ").replace(/^COPY\??:?\s*/i,"").trim()||"possible copy"})}
    return {group,rows,bad,missing:[...o.codes.keys()].filter(c=>!seen.has(c))};
  }
  // When a step is ready to mark in a group: its last session in the plan (the due day; the line that names the activity or its
  // "LPn") ticked in the time plan, plus 7 days. Ticks keep the day they were ticked; an older tick (true) counts from the due day.
  // o = {p: EL_PLAN[ls], gi: the group's column, due, title, ticks: teacherPlan/{group}.ticks, ls}
  function ready(o){const W=window.ELWeek;if(!o.p||!o.due||o.gi<0)return {};
    const lines=r=>String(r.g?r.g[o.gi]||"":r.what||"").split("\n").filter(Boolean);
    const date=(r,l)=>{const m=/^\w{3} (\d{1,2})\b/.exec(l);if(!m||!r.from)return null;for(let j=0;j<7;j++){const d=W.add(r.from,j);if(+d.slice(8)===+m[1])return d}return null};
    const key=String(o.title||"").split(":")[0].toLowerCase().slice(0,14);let n=null,line=null;
    o.p.rows.forEach(r=>lines(r).forEach(l=>{const q=!n&&l.toLowerCase().includes(key)&&/\bLP(\d+)\b/.exec(l);if(q)n=q[1]}));   // "LP2 What are they doing? (1/2)" … "LP2 (2/2)"
    o.p.rows.forEach(r=>lines(r).forEach(l=>{if(date(r,l)===o.due&&(l.toLowerCase().includes(key)||n&&new RegExp("\\bLP"+n+"\\b").test(l)))line=l}));
    const t=line&&(o.ticks||{})[o.ls+"|"+line],done=t?(typeof t==="string"?t:o.due):null;
    return {due:o.due,line,done,from:done?W.add(done,7):null};
  }
  // ---- Students' comments on hand-ins, answered by Claude (Roger, 31 Oct 2026: "Claude should answer properly with context").
  // h = the hand-in (state.steps[step]), x = results/{activity}. A comment still needs an answer unless it only says "no problem"
  // (elNoComment), the teacher marked it "No reply needed" (seen), the teacher answered it (replies[step] not written by the marking,
  // fbBy[step]), or Claude answered this very comment (answers[step] = {t, q, at}; a new comment opens it again).
  // asked(): Claude handed it to the teacher (ask[step] = {why, q, at}); then it waits in the To do as 🙋 and Claude leaves it.
  const q=h=>String((h&&h.comment)||"").trim();
  function open(h,x,step){x=x||{};const c=q(h);if(!c||(window.elNoComment&&elNoComment(c))||(x.seen||{})[step])return false;
    if((x.replies||{})[step]&&!(x.fbBy||{})[step])return false;const an=(x.answers||{})[step];return !(an&&an.q===c)}
  const asked=(h,x,step)=>{const k=((x||{}).ask||{})[step];return !!(k&&k.q===q(h))};
  const CV="EL-ANSWERS v1";
  // o = {date, items:[{id ("Q1"…), code, route, ca, ls, title, step, stepName, content (the file with the step and its texts), fields:[{l,v}], comment}]}
  function commentSheet(o){
    const head=[`${CV} SHEET · ${o.date}`,"",
      "Students of English in a Catalan secondary school (2 ESO and 4 ESO) wrote these comments to their teacher when they handed in a step of a Learning Path on the English Lab website. Answer each one as their teacher would: kind, short (one to four sentences), concrete and useful.",
      "Before answering, read the step in the content file given (the panel with that step id, and any text, audio transcript or model it refers to), so the answer fits what the student was doing. Use the student's hand-in too. Explain a word or an idea with the sentence or example from the Learning Path. Never give the answers of an assessed task, never mention marks, levels or that a step is assessed.",
      "Answer in the language given (Catalan for Starter and Base, English for Core, Plus and Pro), in simple words for that route.",
      "Hand to the teacher instead (FORYOU), without answering, anything that needs the teacher's decision or care: handing in again or late, deadlines, exams, marks, a route change, a problem with the website, a personal, family or health matter, a conflict with classmates, anything worrying, rude or unclear.","","COMMENTS"];
    const body=o.items.flatMap(i=>[`=== ${i.id} · ${i.code} · route ${i.route||"–"} · answer in ${i.ca?"Catalan":"English"}`,`[Where] ${i.ls} · ${i.title} · step "${i.step}" (${i.stepName}) · content: ${i.content}`,
      ...(i.fields||[]).map(f=>`[${f.l}] ${String(f.v||"").replace(/\s+/g," ").trim()||"(empty)"}`),`[COMMENT] ${String(i.comment).replace(/\s+/g," ").trim()}`,""]);
    const fmt=["ANSWER FORMAT (strict: read automatically). Reply with ONLY these lines, in a single code block:",`${CV}`,
      "<id> | <code> | <step> | ANSWER | <the answer to the student, on one line>",
      "<id> | <code> | <step> | FORYOU | <one short line for the teacher, in English: what the student needs>",
      "(one line per comment, every id above)","END","Never write | inside a text. Never add names."];
    return [...head,...body,...fmt].join("\n");
  }
  // {err} or {rows:[{id, code, step, kind: "ANSWER"|"FORYOU", text}], bad, missing}; o.items as in commentSheet
  function parseComments(txt,o){
    const ls=String(txt||"").replace(/```[a-z]*/gi,"").split(/\r?\n/).map(l=>l.trim()).filter(Boolean),h=ls.findIndex(l=>l===CV);
    if(h<0)return {err:`No “${CV}” line found.`};
    const by=new Map(o.items.map(i=>[i.id,i])),rows=[],bad=[],seen=new Set();
    for(const l of ls.slice(h+1)){if(/^END$/i.test(l))break;const p=l.split("|").map(x=>x.trim()),i=by.get(p[0]),k=(p[3]||"").toUpperCase();
      if(!i||seen.has(p[0])||p[1]!==i.code||p[2]!==i.step||!["ANSWER","FORYOU"].includes(k)||!p.slice(4).join(" ").trim()){bad.push(l);continue}
      seen.add(p[0]);rows.push({id:p[0],code:p[1],step:p[2],kind:k,text:p.slice(4).join(" ").trim()})}
    return {rows,bad,missing:[...by.keys()].filter(c=>!seen.has(c))};
  }
  return {V,codes,sheet,parse,ready,tyText,q,open,asked,CV,commentSheet,parseComments};
})();
