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
  //      students:[{code, route (name), ca (feedback in Catalan), fields:[{l, v}]}]}
  function sheet(o){
    const head=[`${V} SHEET`,`Activity: ${o.aid} · ${o.title}`,`Step: ${o.step} · ${o.stepName}`,`Group: ${o.group} · ${o.date}`,`Criteria: ${o.crits.join(", ")}`,"",
      "You are marking the work of secondary-school students of English (Catalonia). Give each student one level per criterion, using only the indicators below.",
      "Levels, lowest to highest: NA (not achieved), AS (satisfactory), AN (notable), AE (excellent).",
      "Each student did the route shown (Starter and Base had more support and shorter tasks; Core and Plus fuller ones): judge the work against the indicators for what that route asked. Do not lower a level for small spelling mistakes unless the indicator says so. Empty or copied work is NA.",
      "",...o.crits.flatMap(c=>[o.crit[c]||c,...(o.ind[c]||[]).map((d,i)=>`  ${DEG[i]}: ${d}`),""])];
    const body=o.students.flatMap(s=>[`=== ${s.code} · route ${s.route||"–"} · feedback in ${s.ca?"Catalan":"English"}`,
      ...(s.fields||[]).map(f=>`[${f.l}] ${String(f.v||"").replace(/\s+/g," ").trim()||"(empty)"}`),""]);
    const fmt=["ANSWER FORMAT (strict: the dashboard reads it automatically). Reply with ONLY these lines, in a single code block, nothing before or after:",
      `${V} | ${o.aid} | ${o.step} | ${o.group}`,
      `<code> | ${o.crits.map(c=>c+"=<level>").join("; ")} | <feedback: one or two short sentences to the student, in the language given, saying one thing done well and one to improve>`,
      "(one line per student, every code above, same order)","END",
      "Levels must be exactly NA, AS, AN or AE. Never write | inside the feedback. Never add names."];
    return [...head,"STUDENTS",...body,...fmt].join("\n");
  }
  // the answer: {err} or {group, rows:[{code, lv:{c: level}, fb}], bad:[lines left out], missing:[codes without a line]}
  function parse(txt,o){   // o = {aid, step, crits, codes: Map code → anything}
    const ls=String(txt||"").replace(/```[a-z]*/gi,"").split(/\r?\n/).map(l=>l.trim()).filter(Boolean),h=ls.findIndex(l=>l.replace(/\s+\|/,"|").startsWith(V+"|"));
    if(h<0)return {err:`No “${V} | …” line found: paste the whole answer.`};
    const [,aid,step,group]=ls[h].split("|").map(x=>x.trim());
    if(aid!==o.aid||step!==o.step)return {err:`This answer is for ${aid} · ${step}, not for this sheet.`};
    const rows=[],bad=[],seen=new Set();
    for(const l of ls.slice(h+1)){if(/^END$/i.test(l))break;const p=l.split("|").map(x=>x.trim());
      if(!o.codes.has(p[0])||seen.has(p[0])){bad.push(l);continue}const lv={};
      (p[1]||"").split(";").forEach(x=>{const r=/^(.+?)\s*=\s*(NA|AS|AN|AE)$/i.exec(x.trim());if(r&&o.crits.includes(r[1].trim()))lv[r[1].trim()]=r[2].toUpperCase()});
      if(!o.crits.every(c=>lv[c])){bad.push(l);continue}seen.add(p[0]);rows.push({code:p[0],lv,fb:p.slice(2).join(" ").trim()})}
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
  return {V,codes,sheet,parse,ready};
})();
