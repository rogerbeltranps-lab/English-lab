// 📋 Today's agenda in class mode (Roger, 7 Nov 2026: "in class mode, I should have the day of the agenda so that I can click it and
// students can see it on the board"). The class tab (el-cloud.js cmTeacher) gets a 📋 Today button on its chip: a panel with the group's
// class day from the Time plan agenda (ls/{ls}.planEdits[group].agenda, the same list as the dashboard's day card, in the same order, with
// the minutes). It opens by itself when class mode starts, so the projector shows the plan for the class. A click on a tab or a learning
// path takes the class tab there and the students follow (class mode); a learning path or tab still locked for the group opens first.
// 🎮 a game opens the game board in a new tab (students join it as usual); 🎬 Shadowing plays the unit's video over the class tab (the
// students stay where they are); other notes are only shown. Reads: the course's LS documents, once per page (the cached ls/{id} read),
// and only while the panel is open. No writes, except opening a locked learning path or tab.
const K="el_cm_ag";
const E=t=>String(t==null?"":t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
const SHD="note:🎬 Shadowing with the whole class";
const today=()=>window.ELWeek&&ELWeek.today?ELWeek.today():window.EL_TODAY||new Date().toLocaleDateString("en-CA",{timeZone:"Europe/Madrid"});
const dLab=d=>{const x=new Date(d+"T12:00");return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][x.getDay()]+" "+x.getDate()+" "+["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][x.getMonth()]};
const isGame=p=>/^game:/.test(p||"");
export const wanted=()=>{try{return sessionStorage.getItem(K)==="1"}catch(e){return false}};
const want=v=>{try{sessionStorage.setItem(K,v?"1":"0")}catch(e){}};

let C=null,box=null,vid=null;
function load(src,has){return has()?Promise.resolve():new Promise(r=>{const s=document.createElement("script");s.src=new URL(src,C.root).href;s.onload=s.onerror=r;document.head.append(s)})}
const byId=id=>(window.EL_CATALOG||[]).find(a=>a.id===id);
const secs=a=>((window.EL_SECTIONS||{})[a.id]||[]);
const gameOf=id=>(window.EL_GAMES||[]).find(g=>g.id===id);
function itName(a,p){if(isGame(p)){const g=gameOf(p.slice(5));return "🎮 "+(g?(window.elGameName?elGameName(g):g.title):p.slice(5))}const z=secs(a).find(q=>q[0]===p);return z?z[1]:p}
// the day's items as the dashboard shows them: [{a (learning path or null), its}]; a day reordered by hand (ag.man[day]) keeps its order,
// any other day groups each learning path's tabs; a learning path's tabs always follow the path's order (teacher.html agRuns, agTabOrder)
function runs(ag,d){const its=((ag.days||{})[d]||[]).filter(it=>it!=="self"),man=!!(ag.man||{})[d],gs=[];
  const ord=(a,it)=>{const p=it.slice(it.indexOf("#")+1),i=[...secs(a).map(z=>z[0])].indexOf(p);return isGame(p)?500:i<0?99:i};
  const isTab=it=>{const i=it.indexOf("#");return !/^note:/.test(it)&&i>0&&i<it.length-1&&!isGame(it.slice(i+1))};
  const out=its.slice(),by={};out.forEach((it,i)=>{if(isTab(it))(by[it.split("#")[0]]=by[it.split("#")[0]]||[]).push(i)});
  Object.entries(by).forEach(([id,pos])=>{const a=byId(id);if(!a)return;pos.map(i=>out[i]).sort((p,q)=>ord(a,p)-ord(a,q)).forEach((it,j)=>{out[pos[j]]=it})});
  out.forEach(it=>{if(it==="exam")return;const id=/^note:/.test(it)?"":it.split("#")[0],g=id&&(man?[gs[gs.length-1]]:gs).find(z=>z&&z.id===id);if(g)g.its.push(it);else gs.push({id,a:id?byId(id):null,its:[it]})});
  if(!man)gs.forEach(g=>{if(g.a)g.its.sort((p,q)=>ord(g.a,p)-ord(g.a,q))});
  return gs.filter(g=>!g.id||g.a)}
// the course's LSs from LS2 on (LS1 keeps its old plan) with the group's agenda: [{ls, ag}]
async function agendas(){const course=((window.EL_GROUPS||[]).find(x=>x.id===C.g)||{}).course||(C.g.match(/^\d+eso/i)||[""])[0].toLowerCase();
  const ls=(window.EL_LS||[]).filter(l=>l.course===course&&!/-my-real-routine$/.test(l.id));
  const out=await Promise.all(ls.map(async l=>{try{const info=await C.lsInfo(l.id);const ag=window.elAgendaOf&&elAgendaOf(info,C.g);return ag?{ls:l,info,ag}:null}catch(e){return null}}));
  return out.filter(Boolean)}
// the class day to show: today, else the next day with something on the agenda
function pickDay(list){const t=today(),has=(x,d)=>((x.ag.days||{})[d]||[]).some(it=>it!=="self")||x.ag.exam===d;
  if(list.some(x=>has(x,t)))return t;
  return list.flatMap(x=>Object.keys(x.ag.days||{}).concat(x.ag.exam?[x.ag.exam]:[]).filter(d=>d>t&&has(x,d))).sort()[0]||t}

function hereIs(a,p){if(!a)return false;const u=new URL(a.path,C.root);if(u.pathname!==location.pathname)return false;
  if(!p)return true;const t=document.querySelector(".tab.active[data-panel]");return !!t&&t.dataset.panel===p}

const CSS=`#el-cmag{position:fixed;left:12px;bottom:68px;z-index:2147481400;width:min(460px,calc(100vw - 24px));max-height:calc(100vh - 96px);overflow:auto;
  background:#fff;border:2px solid #4338ca;border-radius:16px;box-shadow:0 10px 30px rgba(30,27,75,.3);font:600 16px system-ui,sans-serif;color:#1e1b4b;padding:12px 14px}
#el-cmag .hd{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:6px}#el-cmag .hd b{font-size:20px}#el-cmag .hd small{color:#4338ca;font-weight:700}
#el-cmag .hd .x{margin-left:auto;border:0;background:#eef2ff;color:#3730a3;border-radius:999px;width:30px;height:30px;font-size:16px;cursor:pointer}
#el-cmag .tot{color:#1d4ed8;font-size:14px;margin:0 0 8px}#el-cmag .tot.over{color:#b91c1c}
#el-cmag .lp{display:flex;align-items:center;gap:8px;margin:10px 2px 4px;font-weight:800;font-size:17px}#el-cmag .lp small{margin-left:auto;color:#1d4ed8;font-weight:700;font-size:14px}
#el-cmag .it{display:flex;align-items:center;gap:10px;width:100%;text-align:left;margin:5px 0;padding:8px 12px;border:1.5px solid #c7d2fe;border-radius:14px;background:#eef2ff;color:#1e1b4b;font:600 16px system-ui,sans-serif;cursor:pointer}
#el-cmag .it:hover{border-color:#4338ca;background:#e0e7ff}#el-cmag .it .go{margin-left:auto;color:#4338ca;font-weight:800;white-space:nowrap}
#el-cmag .it.nt{background:#fef9c3;border-color:#fde047;cursor:default}#el-cmag .it.shd{background:#f3e8ff;border-color:#d8b4fe;color:#5b21b6;cursor:pointer}
#el-cmag .it.ex{background:#fee2e2;border-color:#fca5a5;cursor:default}#el-cmag .it.now{background:#4338ca;border-color:#4338ca;color:#fff}#el-cmag .it.now .go{color:#fff}
#el-cmag .m{flex:none;border:1.5px solid #60a5fa;border-radius:999px;padding:1px 9px;font-size:14px;color:#1d4ed8;background:#fff}
#el-cmag .it.now .m{border-color:#fff}#el-cmag .msg{color:#64748b;font-weight:500;margin:6px 2px}#el-cmag .err{color:#b91c1c}
#el-cmvid{position:fixed;inset:0;z-index:2147481600;background:rgba(15,23,42,.92);display:grid;place-items:center;padding:20px}
#el-cmvid video{max-width:100%;max-height:calc(100vh - 90px);border-radius:12px;background:#000}
#el-cmvid button{position:absolute;top:14px;right:16px;border:0;border-radius:999px;padding:8px 16px;background:#fff;color:#1e1b4b;font:800 15px system-ui,sans-serif;cursor:pointer}`;

// ctx: {db, doc, setDoc, lsInfo, root, g (group id), gname}
export function setup(ctx){C=ctx}
export function isOpen(){return !!box}
export function close(){if(box){box.remove();box=null}want(false)}
export async function open(){if(!C)return;want(true);
  if(!document.getElementById("el-cmag-css")){const st=document.createElement("style");st.id="el-cmag-css";st.textContent=CSS;document.head.append(st)}
  if(!box){box=document.createElement("div");box.id="el-cmag";box.onclick=click;document.body.append(box)}
  box.innerHTML='<div class="hd"><b>📋 Today</b><button class="x" data-x="1" title="Close">✕</button></div><p class="msg">Loading the agenda…</p>';
  await Promise.all([load("shared/js/el-sections.js",()=>window.EL_SECTIONS),load("shared/js/el-plan.js",()=>window.EL_PLAN),load("shared/js/el-week.js",()=>window.ELWeek),load("lab/game/decks/index.js",()=>window.EL_GAMES)]);
  await draw()}
let L=null,D=null;
async function draw(){if(!box)return;
  try{L=await agendas()}catch(e){L=[]}
  D=pickDay(L);const t=today();
  const its=[];let body="",tot=0;
  L.forEach(x=>{const ag=x.ag,mn=it=>+((ag.min||{})[D+"|"+it])||0;
    if(ag.exam===D)body+=`<div class="it ex">📝 Exam</div>`;
    runs(ag,D).forEach(g=>{
      if(!g.a){g.its.forEach(it=>{const n=its.push({ls:x,it})-1,m=mn(it);tot+=m;const sh=it===SHD&&x.ls.shadowing;
        body+=`<${sh?"button":"div"} class="it ${sh?"shd":"nt"}" ${sh?`data-i="${n}" title="Play the unit's shadowing video here (students stay where they are)"`:""}>${m?`<span class="m">${m} min</span>`:""}<span>${E(it.slice(5))}</span>${sh?'<span class="go">▶ Play</span>':""}</${sh?"button":"div"}>`});return}
      const a=g.a,nos=g.its.length===1&&/#$/.test(g.its[0]),lt=g.its.reduce((s,it)=>s+mn(it),0);
      if(!nos)body+=`<div class="lp">${E((ag.lab||{})[a.id]||(window.elLpLabel?elLpLabel(a):a.title))}${lt?`<small>⏱ ${lt} min</small>`:""}</div>`;
      g.its.forEach(it=>{const p=it.slice(it.indexOf("#")+1),n=its.push({ls:x,it,a,p})-1,m=mn(it),gm=isGame(p),now=!gm&&hereIs(a,p);tot+=m;
        body+=`<button class="it ${now?"now":""}" data-i="${n}" title="${gm?"Open the game board in a new tab":"Go there: "+E(C.gname)+" follows"}">${m?`<span class="m">${m} min</span>`:""}<span>${E(nos?(window.elLpLabel?elLpLabel(a):a.title):itName(a,p))}</span><span class="go">${now?"● now":gm?"🎮 Open ↗":"Go →"}</span></button>`})})});
  const len=+((window.EL_TIMETABLE||{}).len)||60;
  box.innerHTML=`<div class="hd"><b>📋 ${D===t?"Today":"Next class"} · ${E(dLab(D))}</b><small>${E(C.gname)}</small><button class="x" data-x="1" title="Close (📋 Today on the bar opens it again)">✕</button></div>`
    +(tot?`<p class="tot ${tot>len?"over":""}">⏱ ${tot} of ${len} min planned</p>`:"")
    +(body||`<p class="msg">Nothing on the agenda${D===t?" today":""} for ${E(C.gname)}. Plan it in the dashboard's Time plan.</p>`);
  box._its=its}
function click(e){const b=e.target.closest("button");if(!b||!box)return;if(b.dataset.x)return close();
  const x=(box._its||[])[+b.dataset.i];if(!x)return;
  if(x.it===SHD)return play(new URL(x.ls.ls.shadowing,C.root).href);
  if(isGame(x.p)){window.open(new URL("lab/game/host.html?deck="+encodeURIComponent(x.p.slice(5))+"&g="+encodeURIComponent(C.g),C.root).href,"_blank","noopener");return}
  go(x,b)}
// to a tab or a learning path: opened first if it is still locked for the group (as Start class mode on the dashboard does), then the class
// tab goes there (same page: only the tab changes) and cmTeacher sends it to the students
async function go(x,b){const a=x.a,p=x.p||"",info=x.ls.info,g=C.g,ref=C.doc(C.db,"ls",a.ls);b.disabled=true;
  try{if(window.elLpOpen&&!elLpOpen(a,info,g,true)){const ids=[...(window.EL_CATALOG||[]).filter(y=>y.ls===a.ls&&elLpOpen(y,info,g,true)).map(y=>y.id),a.id],Lk=elLpLocks(a.ls,ids);
      await C.setDoc(ref,{open:{[g]:ids},locked:{[g]:Lk.locked},lockedKeys:{[g]:Lk.lockedKeys}},{merge:true});info.open=Object.assign({},info.open,{[g]:ids})}
    const lk=p&&window.elSecLocked?elSecLocked(a,info,g):[];
    if(p&&lk.includes(p)){const k=a.id.replace("/","__"),rest=lk.filter(z=>z!==p),op=[...new Set([...((((info.secOpened||{})[g]||{})[k])||[]),p])];
      await C.setDoc(ref,{secLocked:{[g]:{[k]:rest}},secOpened:{[g]:{[k]:op}}},{merge:true})}}
  catch(err){b.disabled=false;const m=document.createElement("p");m.className="msg err";m.textContent="✗ Could not open it for "+C.gname+": "+(err.code||err.message||err);b.after(m);return}
  close();
  const u=new URL(a.path,C.root);
  if(u.pathname===location.pathname){const t=p&&[...document.querySelectorAll(".tab[data-panel]")].find(z=>z.dataset.panel===p);if(t)t.click();else if(!p)window.scrollTo(0,0);return}
  location.href=u.href+(p?"#"+encodeURIComponent(p):"")}
function play(src){if(vid)vid.remove();vid=document.createElement("div");vid.id="el-cmvid";
  vid.innerHTML='<video controls autoplay playsinline></video><button type="button">✕ Close the video</button>';vid.querySelector("video").src=src;
  vid.querySelector("button").onclick=()=>{vid.remove();vid=null};document.body.append(vid)}
// the "now" mark follows the class tab (a tab clicked on the page)
export function refresh(){if(box&&L)draw()}
