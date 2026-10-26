/* Question analysis on the teacher dashboard (Roger, 26 Oct 2026: "spot the questions that are better answered and the ones that are
   more difficult… by levels… a place where I can see it and understand my students' needs"). Teacher only; students never see it.
   Answers: the first check of every question, saved by LS2 pages in their progress (state.items, firstItems in ls2-engine.js). Before that
   was saved, typed questions can still be read from the answers that stay on the page (state.ans: a wrong check leaves a try).
   Questions: each page's data file (<LS folder>/data/<page>.js), loaded here once per LS. */
window.ELItems=(function(){
  const ROUTES=["beginners","insecure","safe","daring"],AREAS=["Grammar","Vocabulary","Reading","Listening","Other skills"];
  const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const en=o=>o==null?"":typeof o==="string"?o:(o.en||o.ca||"");
  const plain=s=>String(s||"").replace(/<[^>]*>/g," ").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/\s+/g," ").trim();
  const norm=s=>String(s||"").toLowerCase().replace(/[’‘`]/g,"'").replace(/[“”"]/g,"").replace(/[.,!?;:]/g,"").replace(/\s+/g," ").trim();   // as ls2-engine.js
  // the questions a route sees, exactly as ls2-engine.js forLevel
  const forLevel=(src,l)=>!src?[]:Array.isArray(src)?src.filter(x=>ROUTES.indexOf(x.r||"beginners")<=ROUTES.indexOf(l)):(src[l]||(l==="beginners"?src.insecure:null)||[]);
  // Recall and checkpoint questions mix grammar and vocabulary: a verb in brackets, a rewrite (→) or a small grammar word as the answer is grammar.
  const FUNC=/^(on|in|at|the|a|an|is|are|am|was|were|will|won't|wont|do|does|don't|doesn't|did|didn't|isn't|aren't|wasn't|weren't|going to|has|have|than|more|most|by|for|since|ago|who|which|that|where|when|whose|could|would|can|can't|should|must|may|might|shall|me|him|her|us|them|my|your|his|its|our|their|not|be|been|being|to|of|from|with|some|any|much|many|used to|are exchanged)$/;
  const gram=it=>/\(|→|->/.test(it.q||"")||(it.a||[]).some(a=>FUNC.test(norm(a)));
  // area and topic of a panel (and of a recall question)
  function areaOf(p){const m=p.media||{},id=p.id;
    if(p.type==="vocab")return "Vocabulary";if(p.type==="typed")return "Grammar";if(p.type==="recall")return null;
    if(p.type==="quiz"){if(/listen|chart/.test(id))return "Listening";if(/read|log/.test(id))return "Reading";if(/vocab/.test(id))return "Vocabulary";if(/gram/.test(id))return "Grammar"}
    if(m.audio||m.youtube||m.videos)return "Listening";if(m.text)return "Reading";return "Other skills"}
  const recallTopic=p=>/check/.test(p.id)?"Recall checkpoints":"Recall warm-ups";

  // ---- the questions of an LS: {acts:[{a, panels:[{id,type,src,title,area,stay,prefix}]}], none:[activity titles without questions]}
  const banks={};
  function bank(ls,acts){
    if(banks[ls])return banks[ls];
    return banks[ls]=Promise.all(acts.map(async a=>{
      const file=a.path.replace(/[^/]+\.html$/,"data/"+a.path.split("/").pop().replace(".html",".js"));
      try{const r=await fetch(file,{cache:"no-cache"});if(!r.ok)return {a,panels:[]};const w={};new Function("window",await r.text())(w);
        const panels=((w.LP||{}).panels||[]).map(p=>{const src=p.type==="vocab"?p.practice:["recall","mc","typed","quiz"].includes(p.type)?p.items:null;
          return src?{id:p.id,type:p.type,src,title:plain(en(p.title)).replace(/^(Reading|Listening)\s*:\s*/,"")||p.id,area:areaOf(p),stay:p.type==="vocab"?"vocab":p.id,prefix:p.type==="vocab"?"vp":p.id,p}:null}).filter(Boolean);
        return {a,panels}}
      catch(e){console.warn("questions",file,e);return {a,panels:[]}}
    })).then(list=>({acts:list.filter(x=>x.panels.length),none:list.filter(x=>!x.panels.length).map(x=>x.a)}));
  }

  // ---- answers. studs: [{uid, group, name}]; stateOf(uid, a) = the page's saved state; routeOf(uid) = the student's route now
  function collect(B,studs,stateOf,routeOf){
    const Q=new Map(),order=[];
    const item=(x,P,list,i,it)=>{const key=x.a.id+"|"+P.id+"|"+list+"|"+i;let q=Q.get(key);
      if(!q){const area=P.area||(gram(it)?"Grammar":"Vocabulary");
        q={key,a:x.a,P,list,i,it,area,topic:P.area?P.title:recallTopic(P),r:{},g:{},all:{n:0,ok:0},wrong:{},miss:[],old:0};Q.set(key,q);order.push(q)}
      return q};
    B.acts.forEach(x=>x.panels.forEach(P=>{   // every question appears, answered or not, in page order
      if(Array.isArray(P.src))P.src.forEach((it,i)=>item(x,P,"all",i,it));
      else ROUTES.forEach(l=>(P.src[l]||[]).forEach((it,i)=>item(x,P,l,i,it)))}));
    studs.forEach(s=>B.acts.forEach(x=>{const st=stateOf(s.uid,x.a)||{},rec=st.items||{};
      x.panels.forEach(P=>{const seen=new Map();   // item key → {ok, a, level, date}: the earliest first check of this student
        ROUTES.forEach(l=>{const R=rec[P.id+"_"+l];if(!R||!Array.isArray(R.q))return;
          const list=Array.isArray(P.src)?"all":P.src[R.level]?R.level:"insecure",items=Array.isArray(P.src)?P.src:forLevel(P.src,R.level);
          R.q.forEach((qi,j)=>{const it=items[qi];if(!it)return;const k=list+"|"+qi,o=seen.get(k);
            if(!o||String(R.date||"")<String(o.date||""))seen.set(k,{ok:R.ok[j],a:(R.a||[])[j],level:R.level,date:R.date,it,qi,list})})});
        // before 26 Oct 2026 only the answers that stay on the page were saved: typed questions with a wrong check (a try) or right
        // with none. Multiple choice keeps only the latest choice, so it is left out.
        const A=(st.ans||{})[P.stay];
        if(!seen.size&&A&&Array.isArray(A.v)){
          const t=Object.entries(Object.assign({},st.tries||{},st.last||{})).find(([k])=>k===P.id||k===(P.type==="vocab"?"practice":"")||k.startsWith(P.id+"_")),
            lv=(t&&t[1].level)||routeOf(s.uid)||"insecure",items=forLevel(P.src,lv),list=Array.isArray(P.src)?"all":P.src[lv]?lv:"insecure";
          items.forEach((it,i)=>{if(it.o||!it.a)return;const tr=(A.tries||{})[P.prefix+i]||0,v=A.v[i];
            const qi=Array.isArray(P.src)?P.src.indexOf(it):i;
            if(tr>0)seen.set(list+"|"+qi,{ok:0,a:null,level:lv,it,qi,list,old:true});
            else if(v&&it.a.some(a=>norm(a)===norm(v)))seen.set(list+"|"+qi,{ok:1,a:v,level:lv,it,qi,list,old:true})})}
        seen.forEach(o=>{const q=Q.get(x.a.id+"|"+P.id+"|"+o.list+"|"+o.qi);if(!q)return;
          const add=(m,k)=>{const c=m[k]=m[k]||{n:0,ok:0};c.n++;c.ok+=o.ok?1:0};
          add(q.r,o.level);add(q.g,s.group);q.all.n++;q.all.ok+=o.ok?1:0;if(o.old)q.old++;
          if(!o.ok){q.miss.push(s.name);const w=o.it.o?(o.a==null?"(no answer)":plain(o.it.o[o.a])):o.a==null?null:o.a===""?"(blank)":norm(o.a);
            if(w)q.wrong[w]=(q.wrong[w]||0)+1}})})}));
    return order;
  }

  // ---- view
  const pc=c=>c&&c.n?Math.round(c.ok/c.n*100):null;
  const col=p=>p==null?"":p<50?"#fee2e2":p<75?"#fef3c7":"#dcfce7";
  const cell=(c,tip)=>{const p=pc(c);return p==null?`<td class="muted">–</td>`:`<td style="background:${col(p)}" title="${esc(tip||"")}"><b>${p} %</b><br><small>${c.ok}/${c.n}</small></td>`};
  const sum=qs=>qs.reduce((t,q)=>({n:t.n+q.c.n,ok:t.ok+q.c.ok}),{n:0,ok:0});
  const qText=q=>esc(plain(q.it.q));
  const right=q=>esc(plain(q.it.o?q.it.o[0]:(q.it.a||[])[0]));
  const where=q=>esc(q.a.title.replace(/\s*\(warm-up\)$/,""))+" · "+esc(q.P.title);
  const topWrong=(q,n)=>Object.entries(q.wrong).sort((a,b)=>b[1]-a[1]).slice(0,n);
  // the route's numbers of one question (c), for a route or for all routes
  const of=(q,r)=>r==="all"?q.all:q.r[r]||{n:0,ok:0};
  function topics(qs,r){const T={};qs.forEach(q=>{const c=of(q,r);if(!c.n)return;const k=q.area+" · "+q.topic;(T[k]=T[k]||{k,area:q.area,topic:q.topic,n:0,ok:0,q:0});T[k].n+=c.n;T[k].ok+=c.ok;T[k].q++});
    return Object.values(T)}
  function needs(qs,r,LV,nStud){
    const T=topics(qs,r).filter(t=>t.n>=3),weak=T.filter(t=>pc(t)<75).sort((a,b)=>pc(a)-pc(b)).slice(0,3),strong=T.filter(t=>pc(t)>=75).sort((a,b)=>pc(b)-pc(a)).slice(0,2);
    const hard=qs.map(q=>({q,c:of(q,r)})).filter(x=>x.c.n>=2&&pc(x.c)<75).sort((a,b)=>pc(a.c)-pc(b.c)||b.c.n-a.c.n).slice(0,3);
    const t=sum(qs.map(q=>({c:of(q,r)})));
    const li=t=>`<li><b>${esc(t.area)}</b> · ${esc(t.topic)} <span class="qp" style="background:${col(pc(t))}">${pc(t)} %</span></li>`;
    return `<div class="tpc qa-${r}"><h3><span class="route r-${r}">${esc(LV[r]||r)}</span></h3>`
      +(t.n?`<p class="muted">${nStud} student${nStud===1?"":"s"} · ${t.n} answers · first try right <b>${pc(t)} %</b></p>`
        +(weak.length?`<p><b>Needs work</b></p><ul>${weak.map(li).join("")}</ul>`:`<p>✓ No weak area yet (every topic 75 % or more).</p>`)
        +(hard.length?`<p><b>Review first</b></p><ol>${hard.map(({q,c})=>`<li>${qText(q)} → <b>${right(q)}</b> <span class="qp" style="background:${col(pc(c))}">${pc(c)} %</span>${topWrong(q,1).map(([w])=>` <small class="muted">often: “${esc(w)}”</small>`).join("")}</li>`).join("")}</ol>`:"")
        +(strong.length?`<p><b>Going well</b></p><ul>${strong.map(li).join("")}</ul>`:"")
      :`<p class="muted">No answers from this route yet.</p>`)+`</div>`}

  // o: {ls, lss:[{id,title}], groups:[{id,name}], gsel, f:{act,area,sort,all}, LV, B, qs, studs}
  function view(o){
    const {B,LV,f}=o,GS=o.groups.filter(g=>o.gsel==="all"||g.id===o.gsel),qs=o.qs,routes=ROUTES;
    const nBy=r=>o.studs.filter(s=>o.rec[s.uid]&&o.rec[s.uid].has(r)).length;
    const answered=qs.filter(q=>q.all.n);
    let h=`<div class="box"><h2>🔎 Question analysis</h2><p class="muted">How well students answer each question <b>the first time they check it</b> (what they really know; later tries are practice), by route and group. Green 75 % or more · amber 50–74 % · red under 50 %. Hover a cell to see who got it wrong.</p>`
      +`<div class="bar">${o.lss.length>1?`<select data-do="qals" style="max-width:100%">${o.lss.map(l=>`<option value="${l.id}" ${l.id===o.ls?"selected":""}>${esc(l.title)}</option>`).join("")}</select>`:`<b>${esc(o.lss[0].title)}</b>`}
        <span class="muted">· Group:</span> ${[{id:"all",name:"Both groups"},...o.groups].map(g=>`<button class="chip ${o.gsel===g.id?"on":""}" data-do="qa" data-f="g" data-v="${g.id}">${esc(g.name)}</button>`).join("")}</div>`
      +`<p class="muted">${answered.length} of ${qs.length} questions answered so far by ${o.studs.filter(s=>o.rec[s.uid]&&o.rec[s.uid].size).length} students.${qs.some(q=>q.old)?" Answers checked before 26 Oct 2026 count only for typed questions (multiple choice kept only the latest choice then).":""}</p></div>`;
    if(!answered.length)return h+`<div class="box"><p>No answers yet in this LS for ${esc(GS.map(g=>g.name).join(" and "))}. They appear as soon as students check questions in its learning paths.</p>${notIn(B)}</div>`;
    // needs per route
    h+=`<div class="box"><h2>What each route needs</h2><p class="muted">Weakest topics (at least 3 answers), the questions to review first and what is going well, from first tries only.</p><div class="tp">${routes.map(r=>needs(qs,r,LV,nBy(r))).join("")}</div></div>`;
    // hardest and easiest
    const ranked=answered.filter(q=>q.all.n>=2),hard=[...ranked].sort((a,b)=>pc(a.all)-pc(b.all)||b.all.n-a.all.n).slice(0,8),easy=[...ranked].sort((a,b)=>pc(b.all)-pc(a.all)||b.all.n-a.all.n).slice(0,8);
    const mini=(list,title)=>`<div class="tpc"><h3>${title}</h3>${list.length?`<div class="qwrap"><table class="qa"><tr><th>Question</th><th>All</th>${routes.map(r=>`<th>${esc((LV[r]||r).split(" · ")[0])}</th>`).join("")}</tr>${list.map(q=>`<tr><td class="ql">${qText(q)} → <b>${right(q)}</b><br><small class="muted">${where(q)}</small></td>${cell(q.all)}${routes.map(r=>cell(q.r[r])).join("")}</tr>`).join("")}</table></div>`:`<p class="muted">Not enough answers yet (2 per question).</p>`}</div>`;
    h+=`<div class="box"><h2>Hardest and best answered questions</h2><div class="tp">${mini(hard,"😟 Hardest")}${mini(easy,"😀 Best answered")}</div></div>`;
    // skills and topics × routes and groups
    const T=topics(qs,"all"),cols=[...routes.map(r=>["r",r,(LV[r]||r).split(" · ")[0]]),...(o.groups.length>1&&o.gsel==="all"?o.groups.map(g=>["g",g.id,g.name]):[])];
    const tc=(list,c)=>{const m={n:0,ok:0};list.forEach(q=>{const x=c[0]==="r"?q.r[c[1]]:q.g[c[1]];if(x){m.n+=x.n;m.ok+=x.ok}});return m};
    h+=`<div class="box"><h2>Skills and topics</h2><p class="muted">First-try accuracy per area and topic (the section of each learning path; recall questions are split into grammar and vocabulary from the question).</p><div class="qwrap"><table class="qa"><tr><th class="ql">Area · topic</th><th>Questions</th><th>All</th>${cols.map(c=>`<th>${esc(c[2])}</th>`).join("")}</tr>`
      +AREAS.map(A=>{const inA=answered.filter(q=>q.area===A);if(!inA.length)return "";
        const ts=T.filter(t=>t.area===A).sort((a,b)=>pc(a)-pc(b));
        return `<tr class="qa-area"><td class="ql"><b>${A}</b></td><td>${inA.length}</td>${cell(sum(inA.map(q=>({c:q.all}))))}${cols.map(c=>cell(tc(inA,c))).join("")}</tr>`
          +ts.map(t=>{const qq=inA.filter(q=>q.topic===t.topic);return `<tr><td class="ql">${esc(t.topic)}</td><td>${qq.length}</td>${cell(t)}${cols.map(c=>cell(tc(qq,c))).join("")}</tr>`}).join("")}).join("")
      +`</table></div></div>`;
    // every question
    const actsWith=B.acts.map(x=>x.a);
    let list=qs.filter(q=>(f.act==="all"||q.a.id===f.act)&&(f.area==="all"||q.area===f.area)&&(f.sort==="order"||q.all.n));
    if(f.sort==="hard")list.sort((a,b)=>pc(a.all)-pc(b.all)||b.all.n-a.all.n);if(f.sort==="easy")list.sort((a,b)=>pc(b.all)-pc(a.all)||b.all.n-a.all.n);
    const n=list.length,cut=f.all?list:list.slice(0,40);
    h+=`<div class="box"><h2>Every question</h2><div class="bar"><select data-do="qaf" data-f="act" style="max-width:100%"><option value="all">All activities</option>${actsWith.map(a=>`<option value="${a.id}" ${f.act===a.id?"selected":""}>${esc(a.title)}</option>`).join("")}</select>
        <span class="muted">· Area:</span> ${["all",...AREAS].map(A=>`<button class="chip ${f.area===A?"on":""}" data-do="qa" data-f="area" data-v="${A}">${A==="all"?"All":A}</button>`).join("")}
        <span class="muted">· Order:</span> ${[["hard","Hardest first"],["easy","Best first"],["order","Page order"]].map(([k,t])=>`<button class="chip ${f.sort===k?"on":""}" data-do="qa" data-f="sort" data-v="${k}">${t}</button>`).join("")}</div>`
      +`<div class="qwrap"><table class="qa"><tr><th class="ql">Question → right answer</th><th>Area</th><th>All</th>${routes.map(r=>`<th>${esc((LV[r]||r).split(" · ")[0])}</th>`).join("")}${o.gsel==="all"&&o.groups.length>1?o.groups.map(g=>`<th>${esc(g.name)}</th>`).join(""):""}<th class="ql">Most common wrong answers</th></tr>`
      +cut.map(q=>{const miss=q.miss.length?"Wrong the first time: "+q.miss.join(", "):"";
        const seen=q.list!=="all"?` <span class="route r-${q.list}">${esc((LV[q.list]||q.list).split(" · ")[0])} only</span>`:q.it.r&&q.it.r!=="beginners"?` <small class="muted">(from ${esc((LV[q.it.r]||q.it.r).split(" · ")[0])})</small>`:"";
        return `<tr><td class="ql">${qText(q)} → <b>${right(q)}</b>${seen}<br><small class="muted">${where(q)} · question ${q.i+1}</small></td><td><small>${esc(q.area)}</small></td>${cell(q.all,miss)}${routes.map(r=>cell(q.r[r],miss)).join("")}`
          +(o.gsel==="all"&&o.groups.length>1?o.groups.map(g=>cell(q.g[g.id],miss)).join(""):"")
          +`<td class="ql"><small>${topWrong(q,3).map(([w,c])=>`“${esc(w)}” ×${c}`).join(" · ")||(q.all.n&&q.all.ok<q.all.n?"(answer not saved)":"")}</small></td></tr>`}).join("")
      +`</table></div>${n>cut.length?`<p><button class="g" data-do="qa" data-f="all" data-v="1">Show all ${n} questions</button></p>`:""}</div>`;
    return h+`<div class="box">${notIn(B)}</div>`;
  }
  const notIn=B=>`<details class="key"><summary>What is not in this analysis</summary><ul class="muted">
      <li>Writing, speaking, checklists and hand-ins: open answers, read them in each activity's window.</li>
      ${B.none.length?`<li>Activities with no auto-corrected questions on the site: ${B.none.map(a=>esc(a.title)).join(" · ")}.</li>`:""}
      <li>LS1 My Real Routine pages do not save answers per question.</li>
      <li>Class presentations (📡 Class): answers stay in the class quiz, not here.</li>
      <li>Multiple-choice questions checked before 26 Oct 2026 (only the latest choice was saved then).</li></ul></details>`;
  // which routes each student answered in (for the counts on the route cards)
  function routesOf(B,studs,stateOf){const m={};studs.forEach(s=>{const set=new Set();B.acts.forEach(x=>{const st=stateOf(s.uid,x.a)||{};
    Object.values(st.items||{}).forEach(R=>R&&R.level&&set.add(R.level));
    if(x.panels.some(P=>(st.ans||{})[P.stay])){const l=Object.values(Object.assign({},st.tries||{},st.last||{})).map(t=>t&&t.level).find(Boolean);if(l)set.add(l)}});m[s.uid]=set});return m}
  return {bank,collect,view,routesOf,ROUTES};
})();
