// ✏️ Correct it: the teacher's correction screen (Roger, 24 Nov 2026: "I underline the sentences that are wrong, and the system suggests a
// correction and why. I change whatever I want"; "The text is corrected with my underlined sentences. And I have a template to give
// feedback based on the corrections"; "then the system double checks my correction to spot any mistake"; for recordings "I see their
// transcript, I underline the words mispronounced and the sentences that sound off"). Teacher only (teacher.html wrOpen → fixOpen).
// It reads and writes the same text a correction already is (el-marking.js fbText, shown to students by el-corrections.js writing()):
//   the comment (✔ line, then "➜ " lines), one "✗ their words → right — why" line per underline ("→ 🔊 …" = a word said wrong, never
//   changed in the corrected text), and for a writing "✅ " + their text corrected with the changes in *…*. So whoever wrote the correction
//   (Beltran, another AI, the teacher) it opens here as underlines, and what is saved here shows to students exactly like Beltran's.
// ELFix.open(host, {orig, reply, rec, ca, lv: {has, cur}, names, onSave({text, lv})}). The double check is free and local (no AI, no reads).
window.ELFix=(function(){
  const ROW=/^✗ ([\s\S]+?) → ([\s\S]+?)(?: — ([\s\S]*))?$/,DEG=["NA","AS","AN","AE"],LVC={NA:"#64748b",AS:"#16a34a",AN:"#2563eb",AE:"#7c3aed"};
  const esc=t=>String(t==null?"":t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
  const one=t=>String(t||"").replace(/\s+/g," ").replace(/ — /g," - ").replace(/ → /g," -> ").trim();
  const W=/[\p{L}\p{N}'’-]/u;
  // a correction's text → {note lines, rows, fixed}
  function parse(text){const ls=String(text||"").split("\n"),rows=[],note=[];let fixed="";
    for(const l of ls){if(l.startsWith("✗ ")){const m=ROW.exec(l);if(m)rows.push({w:m[1].trim(),fix:m[2].trim().replace(/^🔊\s*/,""),why:(m[3]||"").trim(),k:/^🔊/.test(m[2].trim())?"p":"s"})}
      else if(l.startsWith("✅ "))fixed=l.slice(2);else if(l.trim())note.push(l.trim())}
    return {note,rows,fixed}}
  // where each row's words are in the text (first time, not inside another row); s = -1 when they are not there
  function place(orig,rows){const taken=[];for(const r of rows){if(r.s>=0&&r.e>r.s){taken.push([r.s,r.e]);continue}let i=orig.indexOf(r.w);
      while(i>=0&&taken.some(([a,b])=>i<b&&i+r.w.length>a))i=orig.indexOf(r.w,i+1);r.s=i;r.e=i>=0?i+r.w.length:-1;if(i>=0)taken.push([r.s,r.e])}
    return rows}
  // their text with every underline (not a word said wrong) replaced by its correction between *…*
  function corrected(orig,rows){let out="",at=0;for(const r of rows.filter(r=>r.s>=0&&r.k!=="p"&&one(r.fix)).sort((a,b)=>a.s-b.s)){if(r.s<at)continue;
      out+=orig.slice(at,r.s)+"*"+one(r.fix)+"*";at=r.e}return out+orig.slice(at)}
  // the ➜ line the feedback template suggests: the reason that comes back most, with how many of the mistakes it covers
  function suggestNext(rows,ca){const rs=rows.filter(r=>one(r.why)),n={};if(!rs.length)return "";
    for(const r of rs){const k=one(r.why).toLowerCase().split(/[\s:+,;(]+/)[0]||one(r.why).toLowerCase();n[k]=(n[k]||{c:0,t:one(r.why)});n[k].c++}
    const top=Object.values(n).sort((a,b)=>b.c-a.c)[0],t=top.t.replace(/[.!]+$/,""),N=rows.length;
    return ca?`La propera vegada, revisa això: ${t}${top.c>1?` (${top.c} de les teves ${N} errades)`:""}.`:`Next time, check this: ${t}${top.c>1?` (${top.c} of your ${N} mistakes)`:""}.`}
  function text(st,rec){const rows=st.rows.filter(r=>r.s>=0||r.w).map(r=>"✗ "+one(r.w)+" → "+(r.k==="p"?"🔊 ":"")+one(r.fix)+(one(r.why)?" — "+one(r.why):""));
    const note=[one(st.well),...String(st.next||"").split("\n").map(one).filter(Boolean).map(x=>"➜ "+x.replace(/^➜\s*/,""))].filter(Boolean);
    const fx=!rec&&st.rows.some(r=>r.s>=0&&r.k!=="p")?"✅ "+corrected(st.orig,st.rows):"";
    return [note.join("\n"),...(rows.length?["",...rows]:[]),...(fx?["",fx]:[])].join("\n").trim()}
  // the double check: things to look at before it is saved (the teacher decides)
  const CA_W=/\b(és|els|les|amb|per|molt|has|teu|teva|també|però|perquè|això|una)\b/gi,EN_W=/\b(the|you|your|and|is|very|good|next|time|try|well)\b/gi;
  const AI=/\b(AI|IA|Claude|Gemini|ChatGPT|GPT|Roig|Beltran|bot|intel·ligència artificial|inteligencia artificial|artificial intelligence|automatic|automàtica?)\b/i;
  function check(st,o){const out=[],all=[st.well,st.next,...st.rows.flatMap(r=>[r.fix,r.why])].join(" "),N=st.rows.length;
    st.rows.forEach((r,i)=>{const n=`Underline ${i+1} (“${one(r.w).slice(0,40)}”)`;
      if(!one(r.fix))out.push(`${n} has no correction.`);
      else if(r.k!=="p"&&one(r.fix).toLowerCase()===one(r.w).toLowerCase())out.push(`${n}: the correction is the same as their words.`);
      if(!one(r.why))out.push(`${n} has no “why”.`);
      if(r.s<0)out.push(`${n}: these words are not in their text any more, so they won't be underlined for the student.`)});
    if(!one(st.well)&&!String(st.next||"").trim())out.push("The comment is empty: the feedback template has no ✔ or ➜ line.");
    if(!o.rec&&N>8)out.push(`${N} mistakes: the rule is at most 8, the most useful first.`);
    const nm=(o.names||[]).find(x=>x&&x.length>2&&new RegExp("(^|[^\\p{L}])"+x.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"($|[^\\p{L}])","u").test(all));
    if(nm)out.push(`A student's name is in it (“${nm}”): students never see names.`);
    const ai=AI.exec(all);if(ai)out.push(`“${ai[0]}”: students must never read about AI or who corrects it.`);
    const ca=(all.match(CA_W)||[]).length,en=(all.match(EN_W)||[]).length;
    if(o.ca&&en>ca+2)out.push("This student reads Catalan (Starter): the comment looks English.");
    if(!o.ca&&ca>en+2)out.push("This student reads English: the comment looks Catalan (only Starter gets Catalan).");
    if(o.lv&&o.lv.has&&!st.lv)out.push("No 5.1 level yet (it fills the Writing skill on your dashboard; students never see it).");
    return out}
  let css=false,cur=null;
  function style(){if(css)return;css=true;document.addEventListener("selectionchange",()=>cur&&cur());const s=document.createElement("style");s.textContent=`
.fx{margin:10px 0;padding:12px 14px;border:2px solid #2563eb;border-radius:14px;background:#eff6ff;color:#0f172a;font:15px/1.5 system-ui,sans-serif}
.fx h4{margin:0 0 6px;color:#1e3a8a}.fx .fxt{background:#fff;color:#0f172a;border:1px solid #cbd5e1;border-radius:10px;padding:10px 12px;white-space:pre-wrap;user-select:text;-webkit-user-select:text;cursor:text}
.fx .u{color:#b91c1c;text-decoration:underline wavy #ef4444;text-underline-offset:3px;cursor:pointer}.fx .u.p{color:#9a3412;text-decoration:underline dotted #f97316 2px}
.fx .u.on{background:#fef08a}.fx .bar{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.fx .bar button,.fx .lv button{font-size:14px}
.fx table{border-collapse:collapse;width:100%;background:#fff;color:#0f172a;font-size:14px;margin:6px 0}.fx td,.fx th{border-top:1px solid #dbeafe;padding:5px 6px;vertical-align:top;text-align:left}
.fx th{color:#1e3a8a;border-top:0}.fx td input{width:100%;box-sizing:border-box;font-size:14px;padding:4px 6px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;color:#0f172a}
.fx .w{color:#b91c1c}.fx .w.p{color:#9a3412}.fx .fxc{background:#fff;color:#0f172a;border-radius:10px;padding:10px 12px;white-space:pre-wrap}.fx .fxc b{color:#15803d;text-decoration:underline}
.fx label{display:block;font-weight:600;margin:8px 0 2px;color:#0f172a}.fx textarea{width:100%;box-sizing:border-box;min-height:48px;font:14px/1.4 system-ui,sans-serif;padding:6px 8px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;color:#0f172a}
.fx .lv button.on{color:#fff;border-color:transparent}.fx .warn{margin:8px 0;padding:8px 10px;border-radius:10px;background:#fef3c7;color:#78350f;border:1px solid #f59e0b}
.fx .warn ul{margin:4px 0 0;padding-left:20px}.fx .mut{color:#475569;font-size:13px}
@media (max-width:640px){.fx table,.fx tbody,.fx tr,.fx td{display:block;width:100%}.fx thead{display:none}.fx tr{border-top:1px solid #bfdbfe;padding:4px 0}.fx td{border:0;padding:2px 0}}`;document.head.appendChild(s)}
  function open(host,o){style();const orig=String(o.orig||""),p=parse(o.reply),st={orig,rows:place(orig,p.rows),lv:o.lv&&o.lv.cur||null,sel:null,on:-1,warn:null};
    const nx=p.note.filter(l=>l.startsWith("➜ ")).map(l=>l.slice(2)),wl=p.note.filter(l=>!l.startsWith("➜ "));st.well=wl.join(" ");st.next=nx.join("\n");
    const T=(ca,en)=>o.ca?ca:en;
    function draw(){const rs=st.rows.map((r,i)=>Object.assign({i},r)).filter(r=>r.s>=0).sort((a,b)=>a.s-b.s);let h="",at=0;
      for(const r of rs){if(r.s<at)continue;h+=esc(orig.slice(at,r.s))+`<span class="u${r.k==="p"?" p":""}${st.on===r.i?" on":""}" data-fx="${r.i}" title="${r.k==="p"?"🔊 word said wrong":"mistake"}">${esc(orig.slice(r.s,r.e))}</span>`;at=r.e}
      h+=esc(orig.slice(at));
      const sug=suggestNext(st.rows,o.ca),cx=!o.rec&&st.rows.some(r=>r.s>=0&&r.k!=="p");
      host.innerHTML=`<div class="fx"><h4>✏️ Correct it</h4><p class="mut">${o.rec?"Select a word or a sentence in the transcript, then mark it: 🔊 a word said wrong, or 〰 a sentence that sounds off.":"Select the words or the sentence that is wrong (drag, or double-click a word), then press ＿ Underline."} Each underline gets its correction and why below; change anything. A tap on an underline shows its row, ✕ removes it.</p>
        <div class="fxt" id="fxt">${h||'<span class="mut">(empty)</span>'}</div>
        <div class="bar">${o.rec?`<button data-fxdo="addp">🔊 Word said wrong</button><button data-fxdo="adds">〰 Sentence that sounds off</button>`:`<button data-fxdo="adds">＿ Underline</button>`}<span class="mut" id="fxsel"></span></div>
        ${st.rows.length?`<table><thead><tr><th style="width:26%">${o.rec?"What they said":"Their words"}</th><th style="width:30%">${o.rec?"How it should sound / the natural version":"Correction"}</th><th>Why</th><th></th></tr></thead><tbody>${st.rows.map((r,i)=>`<tr${st.on===i?' style="background:#fef9c3"':""}><td class="w${r.k==="p"?" p":""}">${r.k==="p"?"🔊 ":""}${esc(r.w)}${r.s<0?' <small class="mut">(not in the text)</small>':""}</td><td><input data-fxi="${i}" data-f="fix" value="${esc(r.fix)}" spellcheck="true" lang="${r.k==="p"?"":"en"}"></td><td><input data-fxi="${i}" data-f="why" value="${esc(r.why)}" spellcheck="true" lang="${o.ca?"ca":"en"}"></td><td><button class="g" data-fxdo="del" data-i="${i}" title="Remove this underline">✕</button></td></tr>`).join("")}</tbody></table>`:'<p class="mut">No underlines yet.</p>'}
        ${cx?`<label>✅ Their text, corrected <small class="mut">(built from your underlines)</small></label><div class="fxc" id="fxc">${esc(corrected(orig,st.rows)).replace(/\*([^*\n]+)\*/g,"<b>$1</b>")}</div>`:""}
        <label>✔ ${T("El que has fet bé","What you did well")}</label><textarea data-fxf="well" lang="${o.ca?"ca":"en"}" spellcheck="true">${esc(st.well)}</textarea>
        <label>➜ ${T("Treballa això","Work on this next")} <small class="mut">(one line per tip)</small></label><textarea data-fxf="next" lang="${o.ca?"ca":"en"}" spellcheck="true" placeholder="${esc(sug)}">${esc(st.next)}</textarea>
        ${sug&&one(st.next)!==one(sug)?`<div class="bar"><button class="g" data-fxdo="sug">↳ Use the suggestion: “${esc(sug)}”</button></div>`:""}
        ${o.lv&&o.lv.has?`<label>5.1 level <small class="mut">(your dashboard only; students never see it)</small></label><div class="lv bar">${DEG.map(l=>`<button data-fxdo="lv" data-l="${l}" class="${st.lv===l?"on":"g"}" style="${st.lv===l?"background:"+LVC[l]:""}">${l}</button>`).join("")}</div>`:""}
        ${st.warn?`<div class="warn"><b>🔎 Double check</b>${st.warn.length?`: please look at these before it goes out.<ul>${st.warn.map(w=>"<li>"+esc(w)+"</li>").join("")}</ul>`:": nothing to look at."}</div>`:""}
        <div class="bar"><button data-fxdo="save">${st.warn&&st.warn.length?"💾 Save anyway":"🔎 Check and save"}</button>${st.warn&&st.warn.length?'<button class="g" data-fxdo="recheck">🔎 Check again</button>':""}<button class="g" data-fxdo="cancel">Cancel</button></div>
        <p class="mut">${o.hold||""}</p></div>`;
      const box=host.querySelector("#fxt");
      const selNow=()=>{const s=getSelection();if(!s||!s.rangeCount||s.isCollapsed)return null;const r=s.getRangeAt(0);if(!box.contains(r.startContainer)||!box.contains(r.endContainer))return null;
        const off=(n,k)=>{const q=document.createRange();q.selectNodeContents(box);q.setEnd(n,k);return q.toString().length};let a=off(r.startContainer,r.startOffset),b=off(r.endContainer,r.endOffset);
        if(a>b)[a,b]=[b,a];while(a<b&&/\s/.test(orig[a]))a++;while(b>a&&/\s/.test(orig[b-1]))b--;while(a>0&&W.test(orig[a-1])&&W.test(orig[a]))a--;while(b<orig.length&&W.test(orig[b])&&W.test(orig[b-1]))b++;
        return b>a?{a,b}:null};
      const showSel=()=>{st.sel=selNow();const e=host.querySelector("#fxsel");if(e)e.textContent=st.sel?"“"+orig.slice(st.sel.a,st.sel.b).slice(0,60)+"”":""};
      box.addEventListener("mouseup",showSel);box.addEventListener("touchend",()=>setTimeout(showSel,30));cur=()=>{if(box.isConnected)showSel()};
      box.addEventListener("click",e=>{const u=e.target.closest("[data-fx]");if(u&&getSelection().isCollapsed){st.on=+u.dataset.fx;draw();const i=host.querySelector(`[data-fxi="${st.on}"][data-f="fix"]`);if(i)i.focus()}});
      host.querySelectorAll("[data-fxi]").forEach(i=>i.addEventListener("input",()=>{st.rows[+i.dataset.fxi][i.dataset.f]=i.value;st.warn=null;const c=host.querySelector("#fxc");if(c)c.innerHTML=esc(corrected(orig,st.rows)).replace(/\*([^*\n]+)\*/g,"<b>$1</b>")}));
      host.querySelectorAll("[data-fxf]").forEach(i=>i.addEventListener("input",()=>{st[i.dataset.fxf]=i.value;st.warn=null}));
      host.querySelectorAll("[data-fxdo]").forEach(b=>b.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();const d=b.dataset.fxdo;
        if(d==="adds"||d==="addp"){const s=st.sel||selNow();if(!s){const m=host.querySelector("#fxsel");if(m)m.textContent="Select some words in the text first.";return}
          const over=st.rows.findIndex(r=>r.s>=0&&s.a<r.e&&s.b>r.s);if(over>=0)st.rows.splice(over,1);
          const w=orig.slice(s.a,s.b);st.rows.push({s:s.a,e:s.b,w,fix:d==="addp"?"":w,why:"",k:d==="addp"?"p":"s"});st.rows.sort((x,y)=>(x.s<0?1e9:x.s)-(y.s<0?1e9:y.s));
          st.on=st.rows.findIndex(r=>r.s===s.a);st.sel=null;st.warn=null;getSelection().removeAllRanges();draw();const i=host.querySelector(`[data-fxi="${st.on}"][data-f="fix"]`);if(i){i.focus();i.select()}return}
        if(d==="del"){st.rows.splice(+b.dataset.i,1);st.on=-1;st.warn=null;draw();return}
        if(d==="sug"){st.next=suggestNext(st.rows,o.ca);st.warn=null;draw();return}
        if(d==="lv"){st.lv=st.lv===b.dataset.l?null:b.dataset.l;st.warn=null;draw();return}
        if(d==="cancel"){o.onCancel&&o.onCancel();return}
        if(d==="recheck"){st.warn=check(st,o);draw();return}
        if(d==="save"){if(!st.warn){st.warn=check(st,o);if(st.warn.length){draw();host.querySelector(".warn").scrollIntoView({block:"nearest"});return}}
          const t=text(st,o.rec);if(!t){st.warn=["There is nothing to save."];draw();return}
          b.disabled=true;Promise.resolve(o.onSave({text:t,lv:st.lv})).catch(err=>{b.disabled=false;st.warn=["Not saved: "+(err&&err.message||err)];draw()})}}))}
    draw()}
  return {open,parse,place,corrected,suggestNext,check,text}})();
