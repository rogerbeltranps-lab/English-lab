// 📖 Reference tab of the teacher dashboard (Roger, 31 Oct 2026: "tabs with the maps of the competences from 1-4th of ESO (all
// competences, and assessment criteria, also the cross curricular ones), grammar distribution, lexicon distribution, across ESO and in
// which LS are worked… so that I can easily check anything if I need it"). Read-only: data from shared/js/el-reference-data.js
// (built by tools/reference/build-reference.py from the curriculum texts, the two programmes and the Drive grammar/lexicon maps).
// 2 ESO and 4 ESO show the LS (and its term: LS1–2 term 1, LS3–4 term 2, LS5–6 term 3); 1r and 3r only show the course, because
// their LSs are not programmed yet. Criteria texts stay in the official Catalan.
(function(){
  const R=window.EL_REF;if(!R)return;
  const S={t:"comp",c:"all",ls:"all"};
  const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const COURSES=[["1","1r ESO"],["2","2n ESO"],["3","3r ESO"],["4","4t ESO"]],PC={"2":"2eso","4":"4eso"};
  const term=n=>Math.ceil(n/2),lsName=(c,n)=>((((window.EL_COMP_MAP||{})[PC[c]]||{})[n])||{}).name||"";
  const band=c=>c==="1"||c==="2"?"a":"b";
  const NAME={"2":"Listening","3":"Speaking","4":"Reading","5":"Writing","1":"Intercultural awareness","6":"Research and information",
    "7":"Personal reading","8":"Mediation","9":"Learning strategies","10":"Ethical communication"};
  const ORDER=["2","3","4","5","1","6","7","8","9","10"],COMM=["2","3","4","5"];
  const crOf=ce=>Object.keys(R.criteria).filter(k=>k.split(".")[0]===ce).sort((x,y)=>+x.split(".")[1]-+y.split(".")[1]);
  // criteria of competence ce worked in course c (1r/3r: every communicative criterion of the band, the integrated ones by the course distribution)
  const inCourse=(ce,c)=>COMM.includes(ce)?crOf(ce).filter(k=>R.criteria[k][band(c)]):((R.dist[c]||{})[ce]||[]);
  const progEng=(c,ce)=>R.prog[PC[c]].eng[ce]||[[],[],[],[],[],[]];
  const pill=k=>`<span class="rf-p">${esc(k)}</span>`;
  const cols=()=>S.c==="all"?COURSES:COURSES.filter(([c])=>c===S.c);
  const lsCols=c=>[1,2,3,4,5,6].filter(n=>S.ls==="all"||+S.ls===n);

  function head(){
    const tabs=[["comp","English competences"],["trans","Cross-curricular competences"],["gram","Grammar"],["lex","Lexicon"]];
    return `<div class="bar">${tabs.map(([k,t])=>`<button class="chip ${S.t===k?"on":""}" data-ref="t" data-v="${k}">${t}</button>`).join("")}</div>`
      +`<div class="bar"><span class="muted">Course:</span> ${[["all","1r–4t ESO"],...COURSES].map(([k,t])=>`<button class="chip ${S.c===k?"on":""}" data-ref="c" data-v="${k}">${t}</button>`).join("")}`
      +(PC[S.c]?` <span class="muted">· LS:</span> ${["all",1,2,3,4,5,6].map(n=>`<button class="chip ${String(S.ls)===String(n)?"on":""}" data-ref="ls" data-v="${n}" title="${n==="all"?"":esc(lsName(S.c,n))+" · term "+term(n)}">${n==="all"?"All":"LS"+n}</button>`).join("")}`:"")
      +` <input id="rf-q" type="search" placeholder="Search…" aria-label="Search the tables" style="margin-left:auto;min-width:160px;padding:4px 8px;border:1px solid #cbd5e1;border-radius:8px"></div>`
      +(S.c==="1"||S.c==="3"?`<p class="muted">${S.c==="1"?"1r":"3r"} ESO has no LSs programmed yet, so it shows only what is worked in the course (no LS or term yet).</p>`:"");
  }
  // the header of the LS columns: 2n / 4t ESO with LS1…LS6 and their term
  const lsTh=c=>lsCols(c).map(n=>`<th title="${esc(lsName(c,n))}">LS${n}<br><small>T${term(n)}</small></th>`).join("");
  const groupTh=()=>cols().map(([c,t])=>PC[c]?`<th colspan="${lsCols(c).length}" class="rf-c${c}">${t}</th>`:`<th rowspan="2" class="rf-c${c}">${t}<br><small>course</small></th>`).join("");

  // ---- English competences
  function comp(){
    const rowsM=ORDER.map((ce,i)=>`${i===0?`<tr class="rf-sec"><td colspan="99">Communicative skills (every course, every term)</td></tr>`:i===4?`<tr class="rf-sec"><td colspan="99">Integrated competences</td></tr>`:""}<tr data-q="${esc(("ce"+ce+" "+NAME[ce]+" "+R.statements[ce]).toLowerCase())}"><th class="rf-l">CE${ce} · ${NAME[ce]}</th>`
      +cols().map(([c])=>PC[c]?lsCols(c).map(n=>{const x=progEng(c,ce)[n-1];return `<td>${x.length?x.map(pill).join(" "):'<span class="muted">—</span>'}</td>`}).join("")
        :`<td>${inCourse(ce,c).map(pill).join(" ")||'<span class="muted">—</span>'}</td>`).join("")+`</tr>`).join("");
    const matrix=`<h3>Where each criterion is assessed</h3><p class="muted">2n and 4t: the criteria each LS assesses (annual programme). 1r and 3r: the criteria of the course (communicative ones all, integrated ones by the course distribution of the mother doc, a proposal).</p>`
      +`<div class="qwrap"><table class="rf"><thead><tr><th rowspan="2" class="rf-l">Competence</th>${groupTh()}</tr><tr>${cols().filter(([c])=>PC[c]).map(([c])=>lsTh(c)).join("")}</tr></thead><tbody>${rowsM}</tbody></table></div>`;
    const where=k=>{const ce=k.split(".")[0];return COURSES.map(([c,t])=>{if(PC[c]){const l=progEng(c,ce).map((x,i)=>x.includes(k)?i+1:0).filter(Boolean);return l.length?`<b>${t.split(" ")[0]}</b> ${l.map(n=>`LS${n}<small class="muted">·T${term(n)}</small>`).join(", ")}`:""}
      return inCourse(ce,c).includes(k)?`<b>${t.split(" ")[0]}</b> course`:""}).filter(Boolean).join("<br>")||'<span class="muted">not assessed</span>'};
    const bands=S.c==="all"?["a","b"]:[band(S.c)],BT={a:"1r i 2n ESO",b:"3r i 4t ESO"};
    const okLs=k=>!PC[S.c]||S.ls==="all"||progEng(S.c,k.split(".")[0])[S.ls-1].includes(k);
    const list=ORDER.map(ce=>{const ks=crOf(ce).filter(k=>bands.some(b=>R.criteria[k][b])&&(S.c==="all"||PC[S.c]||inCourse(ce,S.c).includes(k))&&okLs(k));if(!ks.length)return "";
      return `<tr class="rf-sec"><td colspan="99"><b>CE${ce} · ${NAME[ce]}.</b> <span class="rf-st">${esc(R.statements[ce])}</span></td></tr>`
        +ks.map(k=>`<tr data-q="${esc((k+" ce"+ce+" "+NAME[ce]+" "+R.statements[ce]+" "+bands.map(b=>R.criteria[k][b]).join(" ")).toLowerCase())}"><th>${k}</th>${bands.map(b=>`<td class="rf-t">${esc(R.criteria[k][b])||'<span class="muted">— (only in 3r i 4t)</span>'}</td>`).join("")}<td class="rf-w">${where(k)}</td></tr>`).join("")}).join("");
    return matrix+`<h3>Competences and assessment criteria</h3><p class="muted">Decret 175/2022, Llengua estrangera. Each competence has the same statement in all ESO; the criteria change between 1r–2n and 3r–4t.</p>`
      +`<div class="qwrap"><table class="rf"><thead><tr><th>Criterion</th>${bands.map(b=>`<th>${BT[b]}</th>`).join("")}<th>Where it is assessed</th></tr></thead><tbody>${list}</tbody></table></div>`;
  }

  // ---- cross-curricular competences
  function trans(){
    const C=cols().filter(([c])=>PC[c]),at=(c,code)=>R.prog[PC[c]].trans[code]||[];
    const rowsM=R.transversal.map(a=>`<tr class="rf-sec"><td colspan="99">${esc(a.name)} (${esc(a.code)})</td></tr>`+a.comps.map(x=>`<tr data-q="${esc(x.code.toLowerCase())}"><th class="rf-l">${esc(x.code)}</th>`
      +C.map(([c])=>lsCols(c).map(n=>{const v=at(c,x.code)[n-1]||[];return `<td>${v.length?v.map(y=>`<span title="Shares ${y.o} with ${y.ce}">${pill(y.n)} <small class="muted">${y.ce}</small></span>`).join(" "):'<span class="muted">—</span>'}</td>`}).join("")).join("")+`</tr>`).join("")).join("");
    const matrix=C.length?`<h3>Where each one is assessed</h3><p class="muted">Each LS assesses two, with one criterion each and a learning objective shared with an English competence (small code). They are shown apart and do not count in the English mark.</p>`
      +`<div class="qwrap"><table class="rf"><thead><tr><th rowspan="2" class="rf-l">Competence</th>${C.map(([c,t])=>`<th colspan="${lsCols(c).length}" class="rf-c${c}">${t}</th>`).join("")}</tr><tr>${C.map(([c])=>lsTh(c)).join("")}</tr></thead><tbody>${rowsM}</tbody></table></div>`
      :`<p class="muted">No cross-curricular competence is assessed by LS in ${S.c==="1"?"1r":"3r"} ESO yet: its LSs are not programmed.</p>`;
    const bands=S.c==="all"?["a","b"]:[band(S.c)],BT={a:"1r i 2n ESO",b:"3r i 4t ESO"};
    const where=(code,n)=>C.map(([c,t])=>{const l=at(c,code).map((v,i)=>v.some(y=>y.n===n)?i+1:0).filter(Boolean);return l.length?`<b>${t.split(" ")[0]}</b> ${l.map(i=>`LS${i}<small class="muted">·T${term(i)}</small>`).join(", ")}`:""}).filter(Boolean).join("<br>")||'<span class="muted">—</span>';
    const okLs=(code,n)=>!PC[S.c]||S.ls==="all"||(at(S.c,code)[S.ls-1]||[]).some(y=>y.n===n);
    const list=R.transversal.map(a=>{const body=a.comps.map(x=>{const cr=x.crit.filter(k=>okLs(x.code,k.n));if(!cr.length)return "";
      return `<tr class="rf-sec2"><td colspan="99"><b>${esc(x.code)}.</b> <span class="rf-st">${esc(x.statement)}</span></td></tr>`
        +cr.map(k=>`<tr data-q="${esc((x.code+" "+x.code+"."+k.n+" "+bands.map(b=>k[b]).join(" ")+" "+k.link).toLowerCase())}"><th>${esc(k.n)}</th>${bands.map(b=>`<td class="rf-t">${esc(k[b])}</td>`).join("")}<td class="rf-w">${esc(k.link)}</td><td class="rf-w">${where(x.code,k.n)}</td></tr>`).join("")}).join("");
      return body?`<tr class="rf-sec"><td colspan="99">${esc(a.name)} (${esc(a.code)})</td></tr>`+body:""}).join("");
    return matrix+`<h3>Competences and assessment criteria</h3><p class="muted">XTEC (Decret 175/2022), the 17 cross-curricular competences with their 54 criteria. “Link with English” is a proposal from the mother doc: Directe = an English task gives the evidence; Possible = only if the LS topic or product allows it; No = content of another subject.</p>`
      +`<div class="qwrap"><table class="rf"><thead><tr><th>Criterion</th>${bands.map(b=>`<th>${BT[b]}</th>`).join("")}<th>Link with English</th><th>Where it is assessed</th></tr></thead><tbody>${list}</tbody></table></div>`;
  }

  // ---- grammar and lexicon maps
  const LET={I:["Introduce","#dbeafe","#1e3a8a"],C:["Consolidate","#dcfce7","#14532d"],R:["Review","#fef3c7","#78350f"]};
  const cell=s=>s==="—"?'<span class="muted">—</span>':esc(s.replace(/^\d\s*/,""))
    .replace(/\bLS(\d)\b/g,(m,n)=>`<b>LS${n}</b><small class="muted">·T${term(+n)}</small>`)
    .replace(/(^|[\s/:])([ICR])(?=$|[\s*†‡,:;)])/g,(m,p,l)=>`${p}<span class="rf-l${l}" title="${LET[l][0]}">${l}</span>`);
  function map(rows,what){
    const C=cols(),lsHit=s=>S.ls==="all"||new RegExp("\\bLS"+S.ls+"\\b").test(s);
    let body="",sec="";
    rows.forEach(r=>{if(r.sec){sec=r.sec;return}
      const cs=C.map(([c])=>r.c[+c-1]);if(S.c!=="all"&&(cs[0]==="—"||!lsHit(cs[0])))return;
      if(sec){body+=`<tr class="rf-sec"><td colspan="99">${esc(sec)}</td></tr>`;sec=""}
      body+=`<tr data-q="${esc((r.s+" "+r.c.join(" ")).toLowerCase())}"><td class="rf-t">${esc(r.s)}</td><td title="Source: ${esc(r.src)}">${esc(r.cefr)}</td>${cs.map(x=>`<td class="rf-m">${cell(x)}</td>`).join("")}</tr>`});
    return `<h3>${what} map, A1 → B1</h3><p class="muted">${Object.entries(LET).map(([l,[t]])=>`<span class="rf-l${l}">${l}</span> ${t}`).join(" · ")} · — not a focus. 2n and 4t: the LS (and term) where it is worked; routes in brackets when not every route produces it (Starter produces only its A1 core list). 1r and 3r: the course only, until their LSs are programmed. CEFR level is a guide (hover: source row of the map).</p>`
      +(body?`<div class="qwrap"><table class="rf"><thead><tr><th>${what==="Grammar"?"Grammar point":"Lexical area"}</th><th>CEFR</th>${C.map(([c,t])=>`<th class="rf-c${c}">${t}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table></div>`:`<p class="muted">Nothing for this filter.</p>`);
  }

  function view(){
    const b=S.t==="comp"?comp():S.t==="trans"?trans():S.t==="gram"?map(R.grammar,"Grammar"):map(R.lexicon,"Lexicon");
    return `<div class="box" id="rf"><h2>📖 Reference: competences, criteria, grammar and lexicon across ESO</h2>${head()}${b}`
      +`<p class="muted" style="margin-top:10px">Read-only. Built ${esc(R.built)} from the curriculum (official texts), the 2n and 4t programmes and the grammar and lexicon maps in Drive (Teacher Studio › 05). After an LS design or a change in the maps, run tools/reference/build-reference.py.</p></div>`;
  }
  function filter(){const q=((document.getElementById("rf-q")||{}).value||"").trim().toLowerCase();
    document.querySelectorAll("#rf table.rf tbody").forEach(tb=>{let sec=null,secAny=false,sub=null,subAny=false;
      const endSub=()=>{if(sub)sub.style.display=!q||subAny?"":"none";sub=null;subAny=false},endSec=()=>{endSub();if(sec)sec.style.display=!q||secAny?"":"none";sec=null;secAny=false};
      [...tb.rows].forEach(tr=>{if(tr.classList.contains("rf-sec")){endSec();sec=tr}else if(tr.classList.contains("rf-sec2")){endSub();sub=tr}
        else if(tr.dataset.q!=null){const on=!q||tr.dataset.q.includes(q);tr.style.display=on?"":"none";if(on)secAny=subAny=true}});endSec()})}
  function redraw(){const el=document.getElementById("rf"),q=(document.getElementById("rf-q")||{}).value||"";if(!el)return;el.outerHTML=view();const i=document.getElementById("rf-q");if(i){i.value=q;filter()}}
  document.addEventListener("click",e=>{const t=e.target.closest("[data-ref]");if(!t)return;const k=t.dataset.ref,v=t.dataset.v;
    if(k==="c"){S.c=v;S.ls="all"}else S[k]=v;redraw()});
  document.addEventListener("input",e=>{if(e.target.id==="rf-q")filter()});
  const css=document.createElement("style");
  css.textContent=`table.rf{width:100%}table.rf thead th{position:static}table.rf th,table.rf td{text-align:left;vertical-align:top}table.rf td.rf-t{min-width:260px;max-width:520px;white-space:normal}table.rf td.rf-w{white-space:nowrap;font-size:12px}table.rf td.rf-m{min-width:110px;white-space:normal}
table.rf th.rf-l{white-space:nowrap}table.rf tr.rf-sec td{background:#f1f5f9;font-weight:700}table.rf tr.rf-sec2 td{background:#f8fafc}table.rf .rf-st{font-weight:400;color:#475569}
.rf-p{display:inline-block;border:1px solid #cbd5e1;border-radius:6px;padding:0 5px;font-weight:600;background:#fff}table.rf th.rf-c2,table.rf th.rf-c1{border-top:3px solid #16a34a}table.rf th.rf-c4,table.rf th.rf-c3{border-top:3px solid #2563eb}
.rf-lI,.rf-lC,.rf-lR{display:inline-block;border-radius:5px;padding:0 5px;font-weight:700;font-size:12px}.rf-lI{background:#dbeafe;color:#1e3a8a}.rf-lC{background:#dcfce7;color:#14532d}.rf-lR{background:#fef3c7;color:#78350f}`;
  document.head.appendChild(css);
  window.ELRef={view};
})();
