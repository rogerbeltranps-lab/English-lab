/* Question analysis on the teacher dashboard (Roger, 26 Oct 2026: "spot the questions that are better answered and the ones that are
   more difficult… by levels… a place where I can see it and understand my students' needs"). Teacher only; students never see it.
   Answers: the first check of every question, saved by LS2 pages in their progress (state.items, firstItems in ls2-engine.js). Before that
   was saved, typed questions can still be read from the answers that stay on the page (state.ans: a wrong check leaves a try).
   Questions: each page's data file (<LS folder>/data/<page>.js), loaded here once per LS. */
window.ELItems=(function(){
  const ROUTES=["beginners","insecure","safe","daring"],AREAS=["Grammar","Vocabulary","Reading","Listening","Mixed recall","Other skills"];
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
        // secure checkpoints (el-checkpoint.js) have no answers in the page: the dashboard's copy of the key (cpKeys) fills them in
        const K=((window.EL_CP_KEYS||{})[(w.LP||{}).key]||{}).items||{};
        const panels=((w.LP||{}).panels||[]).map(p=>{if(p.secure&&p.items)p.items=p.items.map(it=>it.id&&K[it.id]?Object.assign({},it,{a:K[it.id].a,ca:K[it.id].ca,en:K[it.id].en}):it);
          const src=p.type==="vocab"?p.practice:["recall","mc","typed","quiz"].includes(p.type)?p.items:null;
          return src?{id:p.id,type:p.type,src,step:p.step,title:plain(en(p.title)).replace(/^(Reading|Listening)\s*:\s*/,"").replace(/^./,c=>c.toUpperCase())||p.id,area:p.area||areaOf(p),stay:p.type==="vocab"?"vocab":p.id,prefix:p.type==="vocab"?"vp":p.id,p}:null}).filter(Boolean);
        return {a,panels}}
      catch(e){console.warn("questions",file,e);return {a,panels:[]}}
    })).then(list=>({acts:list.filter(x=>x.panels.length),none:list.filter(x=>!x.panels.length).map(x=>x.a)}));
  }

  // ---- answers. studs: [{uid, group, name}]; stateOf(uid, a) = the page's saved state; routeOf(uid) = the student's route now.
  // Three sources, best first, so every first try already saved counts (Roger, 26 Oct 2026: "I want the first try answers of everything"):
  //  1. state.items: each question of the first check (saved since 26 Oct 2026 evening);
  //  2. state.ans, the answers that stay on the page (since 25–26 Oct 2026): they are the first try when the step was checked only once
  //     (its first and latest check were saved together), and a typed question with no wrong try was right the first time;
  //  3. the step's first-try score (state.tries / state.first, saved since LS2 began): no questions, but it counts for its section in
  //     "Skills and topics" and "What each route needs" (secs).
  // all: every activity of the LS (also pages without a data file); sections(a) = [[step, name]] of an activity.
  const t0=d=>{const x=Date.parse(d||"");return isNaN(x)?null:x};
  const once=(f,l)=>!!f&&!!l&&f.score===l.score&&t0(f.date)!=null&&t0(l.date)!=null&&Math.abs(t0(l.date)-t0(f.date))<1000;
  function stepArea(k,name){const s=(k+" "+name).toLowerCase();
    return /recall|check/.test(s)?"Mixed recall":/read|log/.test(s)?"Reading":/listen|chart/.test(s)?"Listening":/vocab|word|cards|practice/.test(s)?"Vocabulary":/gram|mixed/.test(s)?"Grammar":"Other skills"}
  function collect(B,studs,stateOf,routeOf,all,sections){
    const Q=new Map(),order=[],S=new Map(),secs=[];
    const item=(x,P,list,i,it)=>{const key=x.a.id+"|"+P.id+"|"+list+"|"+i;let q=Q.get(key);
      if(!q){const area=P.area||(gram(it)?"Grammar":"Vocabulary");
        q={key,a:x.a,P,list,i,it,area,topic:P.area?P.title:recallTopic(P),r:{},g:{},all:{n:0,ok:0},wrong:{},miss:[],old:0};Q.set(key,q);order.push(q)}
      return q};
    const sec=(a,k,area,topic)=>{const key=a.id+"|"+k;let s=S.get(key);if(!s){s={key,a,k,area,topic,r:{},g:{},all:{n:0,ok:0},st:0};S.set(key,s);secs.push(s)}return s};
    const addSec=(s,stu,t)=>{if(!t||!t.max)return;const m=(o,k)=>{const c=o[k]=o[k]||{n:0,ok:0};c.n+=t.max;c.ok+=Math.min(t.score||0,t.max)};
      m(s.r,t.level||routeOf(stu.uid)||"insecure");m(s.g,stu.group);s.all.n+=t.max;s.all.ok+=Math.min(t.score||0,t.max);s.st++};
    B.acts.forEach(x=>x.panels.forEach(P=>{   // every question appears, answered or not, in page order
      if(Array.isArray(P.src))P.src.forEach((it,i)=>item(x,P,"all",i,it));
      else ROUTES.forEach(l=>(P.src[l]||[]).forEach((it,i)=>item(x,P,l,i,it)))}));
    // the step of a panel: the key of its first try (tries) and of its latest check (last)
    const stepOf=P=>P.step||(P.type==="vocab"?"practice":P.id);
    const firstOf=(st,P)=>{const k=stepOf(P);if(P.type==="recall"){const f=st.first||st.recall||{},l=(st.last||{})[k];const lv=(l&&l.level)||Object.keys(f)[0];return f[lv]?Object.assign({level:lv},f[lv]):null}
      if(P.type==="quiz"){const e=Object.entries(st.tries||{}).find(([q])=>q.startsWith(P.id+"_"));return e?e[1]:null}return (st.tries||{})[k]||null};
    const lastOf=(st,P,f)=>{const k=P.type==="quiz"&&f?P.id+"_"+f.level:stepOf(P);return (st.last||{})[k]||null};
    studs.forEach(s=>{
      B.acts.forEach(x=>{const st=stateOf(s.uid,x.a)||{},rec=st.items||{};
        x.panels.forEach(P=>{const seen=new Map();   // item key → {ok, a, level, date}: the earliest first check of this student
          ROUTES.forEach(l=>{const R=rec[P.id+"_"+l];if(!R||!Array.isArray(R.q))return;
            const list=Array.isArray(P.src)?"all":P.src[R.level]?R.level:"insecure",items=Array.isArray(P.src)?P.src:forLevel(P.src,R.level);
            R.q.forEach((qi,j)=>{const it=items[qi];if(!it)return;const k=list+"|"+qi,o=seen.get(k);
              if(!o||String(R.date||"")<String(o.date||""))seen.set(k,{ok:R.ok[j],a:(R.a||[])[j],level:R.level,date:R.date,it,qi,list})})});
          const f=firstOf(st,P),A=(st.ans||{})[P.stay];
          if(!seen.size&&A&&Array.isArray(A.v)){
            const lv=A.l||(f&&f.level)||routeOf(s.uid)||"insecure",items=forLevel(P.src,lv),list=Array.isArray(P.src)?"all":P.src[lv]?lv:"insecure",one=once(f,lastOf(st,P,f));
            if(items.length===A.v.length)items.forEach((it,i)=>{const v=it.o&&A.v[i]!=null&&A.v[i]!==""?+A.v[i]:A.v[i],qi=Array.isArray(P.src)?P.src.indexOf(it):i,k=list+"|"+qi;
              if(it.o){if(one)seen.set(k,{ok:v===0?1:0,a:v,level:lv,it,qi,list,old:true});return}
              if(!it.a)return;const tr=(A.tries||{})[P.prefix+i]||0,ok=v!=null&&v!==""&&it.a.some(a=>norm(a)===norm(v));
              if(one)seen.set(k,{ok:ok?1:0,a:v==null?"":v,level:lv,it,qi,list,old:true});
              else if(tr>0)seen.set(k,{ok:0,a:null,level:lv,it,qi,list,old:true});
              else if(ok)seen.set(k,{ok:1,a:v,level:lv,it,qi,list,old:true})})}
          if(!seen.size){if(f)addSec(sec(x.a,stepOf(P),P.area||"Mixed recall",P.area?P.title:recallTopic(P)),s,f);return}
          seen.forEach(o=>{const q=Q.get(x.a.id+"|"+P.id+"|"+o.list+"|"+o.qi);if(!q)return;
            const add=(m,k)=>{const c=m[k]=m[k]||{n:0,ok:0};c.n++;c.ok+=o.ok?1:0};
            add(q.r,o.level);add(q.g,s.group);q.all.n++;q.all.ok+=o.ok?1:0;if(o.old)q.old++;
            if(!o.ok){q.miss.push(s.name);const w=o.it.o?(o.a==null?"(no answer)":plain(o.it.o[o.a])):o.a==null?null:o.a===""?"(blank)":norm(o.a);
              if(w)q.wrong[w]=(q.wrong[w]||0)+1}})})});
      // pages without a data file (4ESO LS2 Getting started): the first-try score of each scored section
      (all||[]).filter(a=>!B.acts.some(x=>x.a.id===a.id)).forEach(a=>{const st=stateOf(s.uid,a)||{};
        (sections?sections(a):[]).forEach(([k,name])=>{let t=(st.tries||{})[k];
          if(!t&&/recall/.test(k)){const f=st.first||st.recall||{},lv=Object.keys(f)[0];if(lv)t=Object.assign({level:lv},f[lv])}
          if(t)addSec(sec(a,k,stepArea(k,name),name),s,t)})})});
    order.secs=secs;
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
  // units: the questions and the section scores (collect: secs); hardest questions come from the questions only
  function needs(units,qs,r,LV,nStud){
    const T=topics(units,r).filter(t=>t.n>=3),weak=T.filter(t=>pc(t)<75).sort((a,b)=>pc(a)-pc(b)).slice(0,3),strong=T.filter(t=>pc(t)>=75).sort((a,b)=>pc(b)-pc(a)).slice(0,2);
    const hard=qs.map(q=>({q,c:of(q,r)})).filter(x=>x.c.n>=2&&pc(x.c)<75).sort((a,b)=>pc(a.c)-pc(b.c)||b.c.n-a.c.n).slice(0,3);
    const t=sum(units.map(q=>({c:of(q,r)})));
    const li=t=>`<li><b>${esc(t.area)}</b> · ${esc(t.topic)} <span class="qp" style="background:${col(pc(t))}">${pc(t)} %</span></li>`;
    return `<div class="tpc qa-${r}"><h3><span class="route r-${r}">${esc(LV[r]||r)}</span></h3>`
      +(t.n?`<p class="muted">${nStud} student${nStud===1?"":"s"} · ${t.n} answers · first try right <b>${pc(t)} %</b></p>`
        +(weak.length?`<p><b>Needs work</b></p><ul>${weak.map(li).join("")}</ul>`:`<p>✓ No weak area yet (every topic 75 % or more).</p>`)
        +(hard.length?`<p><b>Review first</b></p><ol>${hard.map(({q,c})=>`<li>${qText(q)} → <b>${right(q)}</b> <span class="qp" style="background:${col(pc(c))}">${pc(c)} %</span>${topWrong(q,1).map(([w])=>` <small class="muted">often: “${esc(w)}”</small>`).join("")}</li>`).join("")}</ol>`:"")
        +(strong.length?`<p><b>Going well</b></p><ul>${strong.map(li).join("")}</ul>`:"")
      :`<p class="muted">No answers from this route yet.</p>`)+`</div>`}

  // o: {ls, lss:[{id,title}], groups:[{id,name}], gsel, f:{act,area,sort,all}, LV, B, qs, studs}
  function view(o){
    const {B,LV,f}=o,GS=o.groups.filter(g=>o.gsel==="all"||g.id===o.gsel),qs=o.qs,routes=ROUTES,secs=(qs.secs||[]).filter(x=>x.all.n);
    const nBy=r=>o.studs.filter(s=>o.rec[s.uid]&&o.rec[s.uid].has(r)).length;
    const answered=qs.filter(q=>q.all.n),units=[...answered,...secs],nSec=secs.reduce((t,x)=>t+x.st,0);
    let h=`<div class="box"><h2>🔎 Question analysis</h2><p class="muted">How well students answer each question <b>the first time they check it</b> (what they really know; later tries are practice), by route and group. Green 75 % or more · amber 50–74 % · red under 50 %. Hover a cell to see who got it wrong.</p>`
      +`<div class="bar">${o.lss.length>1?`<select data-do="qals" style="max-width:100%">${o.lss.map(l=>`<option value="${l.id}" ${l.id===o.ls?"selected":""}>${esc(l.title)}</option>`).join("")}</select>`:`<b>${esc(o.lss[0].title)}</b>`}
        <span class="muted">· Group:</span> ${[{id:"all",name:"Both groups"},...o.groups].map(g=>`<button class="chip ${o.gsel===g.id?"on":""}" data-do="qa" data-f="g" data-v="${g.id}">${esc(g.name)}</button>`).join("")}</div>`
      +`<p class="muted">${answered.length} of ${qs.length} questions answered so far by ${o.studs.filter(s=>o.rec[s.uid]&&o.rec[s.uid].size).length} students${nSec?`, plus ${nSec} section score${nSec===1?"":"s"} (work saved before each question was: its first-try score counts for its section, in “What each route needs” and “Skills and topics”)`:""}.</p></div>`;
    if(!units.length)return h+`<div class="box"><p>No first tries saved yet in this LS for ${esc(GS.map(g=>g.name).join(" and "))}. They appear as soon as students check questions in its learning paths.</p>${notIn(B)}</div>`;
    // needs per route
    h+=`<div class="box"><h2>What each route needs</h2><p class="muted">Weakest topics (at least 3 answers or points), the questions to review first and what is going well, from first tries only.</p><div class="tp">${routes.map(r=>needs(units,answered,r,LV,nBy(r))).join("")}</div></div>`;
    // hardest and easiest
    const ranked=answered.filter(q=>q.all.n>=2),hard=[...ranked].sort((a,b)=>pc(a.all)-pc(b.all)||b.all.n-a.all.n).slice(0,8),easy=[...ranked].sort((a,b)=>pc(b.all)-pc(a.all)||b.all.n-a.all.n).slice(0,8);
    const mini=(list,title)=>`<div class="tpc"><h3>${title}</h3>${list.length?`<div class="qwrap"><table class="qa"><tr><th>Question</th><th>All</th>${routes.map(r=>`<th>${esc((LV[r]||r).split(" · ")[0])}</th>`).join("")}</tr>${list.map(q=>`<tr><td class="ql">${qText(q)} → <b>${right(q)}</b><br><small class="muted">${where(q)}</small></td>${cell(q.all)}${routes.map(r=>cell(q.r[r])).join("")}</tr>`).join("")}</table></div>`:`<p class="muted">Not enough answers yet (2 per question).</p>`}</div>`;
    h+=`<div class="box"><h2>Hardest and best answered questions</h2><div class="tp">${mini(hard,"😟 Hardest")}${mini(easy,"😀 Best answered")}</div></div>`;
    // skills and topics × routes and groups
    const T=topics(units,"all"),cols=[...routes.map(r=>["r",r,(LV[r]||r).split(" · ")[0]]),...(o.groups.length>1&&o.gsel==="all"?o.groups.map(g=>["g",g.id,g.name]):[])];
    const tc=(list,c)=>{const m={n:0,ok:0};list.forEach(q=>{const x=c[0]==="r"?q.r[c[1]]:q.g[c[1]];if(x){m.n+=x.n;m.ok+=x.ok}});return m};
    h+=`<div class="box"><h2>Skills and topics</h2><p class="muted">First-try accuracy per area and topic (the section of each learning path; recall questions are split into grammar and vocabulary from the question). “Scores” are sections with only a first-try score: its points count here (right / points).</p><div class="qwrap"><table class="qa"><tr><th class="ql">Area · topic</th><th>Questions</th><th>All</th>${cols.map(c=>`<th>${esc(c[2])}</th>`).join("")}</tr>`
      +AREAS.map(A=>{const inA=units.filter(q=>q.area===A);if(!inA.length)return "";
        const ts=T.filter(t=>t.area===A).sort((a,b)=>pc(a)-pc(b)),nq=l=>{const q=l.filter(x=>x.it).length,sc=l.filter(x=>!x.it).reduce((t,x)=>t+x.st,0);return (q||(sc?"":0))+(sc?`${q?" + ":""}<small class="muted">${sc} score${sc===1?"":"s"}</small>`:"")};
        return `<tr class="qa-area"><td class="ql"><b>${A}</b></td><td>${nq(inA)}</td>${cell(sum(inA.map(q=>({c:q.all}))))}${cols.map(c=>cell(tc(inA,c))).join("")}</tr>`
          +ts.map(t=>{const qq=inA.filter(q=>q.topic===t.topic);return `<tr><td class="ql">${esc(t.topic)}</td><td>${nq(qq)}</td>${cell(t)}${cols.map(c=>cell(tc(qq,c))).join("")}</tr>`}).join("")}).join("")
      +`</table></div></div>`;
    // every question
    const actsWith=B.acts.map(x=>x.a);
    let list=qs.filter(q=>(f.act==="all"||q.a.id===f.act)&&(f.area==="all"||q.area===f.area)&&(f.sort==="order"||q.all.n));
    if(f.sort==="hard")list.sort((a,b)=>pc(a.all)-pc(b.all)||b.all.n-a.all.n);if(f.sort==="easy")list.sort((a,b)=>pc(b.all)-pc(a.all)||b.all.n-a.all.n);
    const n=list.length,cut=f.all?list:list.slice(0,40);
    h+=`<div class="box"><h2>Every question</h2>${nSec?`<p class="muted">Sections saved only as a score are not listed here (no answers per question).</p>`:""}<div class="bar"><select data-do="qaf" data-f="act" style="max-width:100%"><option value="all">All activities</option>${actsWith.map(a=>`<option value="${a.id}" ${f.act===a.id?"selected":""}>${esc(a.title)}</option>`).join("")}</select>
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
      <li>Work saved before 26 Oct 2026 evening: a section checked once gives its answers per question; one checked several times, or before answers were kept on the page, gives only its first-try score.</li></ul></details>`;
  // which routes each student answered in (for the counts on the route cards)
  // all: every activity of the LS
  function routesOf(all,studs,stateOf){const m={};studs.forEach(s=>{const set=new Set();all.forEach(a=>{const st=stateOf(s.uid,a)||{};
    Object.values(st.items||{}).forEach(R=>R&&R.level&&set.add(R.level));
    Object.values(Object.assign({},st.tries||{},st.last||{})).forEach(t=>t&&t.level&&set.add(t.level));
    Object.keys(st.first||{}).forEach(l=>ROUTES.includes(l)&&set.add(l))});m[s.uid]=set});return m}
  return {bank,collect,view,routesOf,ROUTES};
})();
