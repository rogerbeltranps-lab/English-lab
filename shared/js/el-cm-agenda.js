// 📋 Today's agenda in class mode (Roger, 7 Nov 2026: "in class mode, I should have the day of the agenda so that I can click it and
// students can see it on the board"; then "I wanted fixed not floating" and "we don't need this menu in class mode so we can put today's
// tasks there": it is docked in the left side menu, in place of its buttons (the class tab never shows them, el-catalog.js); only a
// narrow window or a phone, with no side menu, gets it floating above the chip). The class tab (el-cloud.js
// cmTeacher) gets a 📋 Today button on its chip that shows or hides it: a panel with the group's
// class day from the Time plan agenda (ls/{ls}.planEdits[group].agenda, the same list as the dashboard's day card, in the same order, with
// the minutes). It opens by itself when class mode starts, so the projector shows the plan for the class. A click on a tab or a learning
// path takes the class tab there and the students follow (class mode); a learning path or tab still locked for the group opens first.
// 🎮 a game opens the game board in this class tab (students join it as usual; 🎓 Back to class mode on the board comes back); 🎬 Shadowing plays the unit's video over the class tab (the
// students stay where they are); other notes are only shown. Reads: the course's LS documents, once per page (the cached ls/{id} read),
// and only while the panel is open. No writes, except opening a locked learning path or tab.
// Several steps at once and the end of the class (Roger, 12 Nov 2026: "In class mode, let me enable more than one SLP at once since there are
// times where students need to navigate them. And me and they should only see the SLP planned for the class. And I can have a button to add
// other SLP so that students can do. And in the class mode I can touch a SLP I say that that's for homework. When I finish the class mode, a
// window should pop up and let me say the SLP FINISHED and the ones to continue next class. On class mode I also need to say that an activity
// is for next class"). On today's class day each step has:
//   👥  students may work on it now too (the class tab's own step always is): plan() gives the class tab (el-cloud.js cmTeacher) the steps
//       that are open (ps) and today's planned steps (vis), which it writes on live/{group}.go; students move between the 👥 steps and see
//       only today's steps on a learning path page (the class tab too). Kept for this class mode in this browser tab (sessionStorage el_cm_en).
//   ⋯   🏠 Homework for next class (the same homework as the Time plan's 🏠 switch: ls/{ls}.homework[group][id] = {text, by, set, tabs, next})
//       and ⏭ Next class (the step moves to the group's next class day on the Time plan agenda).
// ➕ Add a step puts any tab of the course's LSs on today's agenda (from a later day it moves; the path and tab open for the group) and 👥 on.
// wrapUp() is the window ⏹ Stop opens: ✔ Finished (ticked on the Time plan, teacherPlan/{group}.ticks "ls|@day#item"), ⏭ Next class or 🏠
// Homework for each step of today. Every change reads the LS document first (the dashboard may have changed the agenda) and writes it once.
import {readingOf,openCorrect} from "../correct/open.js";
import * as PERF from "./el-class-perf.js";
// ✉️ in the end-of-class window: on unless the teacher took it off last time (this computer)
const mailOn=()=>{try{return localStorage.getItem("el_cm_mail")!=="0"}catch(e){return true}};
const mailSet=v=>{try{localStorage.setItem("el_cm_mail",v?"1":"0")}catch(e){}};
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
function itName(a,p){if(/^game:cb-/.test(p)){const g=(window.EL_GAMES||[]).find(z=>z.id.startsWith(p.slice(8)+"-"));return "🕵️ "+(g&&g.lp?String(g.lp).split(" · ")[0]+" · ":"")+"Code Breakers"}if(isGame(p)){const g=gameOf(p.slice(5));return "🎮 "+String(g?(window.elGameName?elGameName(g):g.title):p.slice(5)).replace(/^LP\d+ · /,"")}const z=secs(a).find(q=>q[0]===p);return z?z[1]:p}
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
#el-cmag .pr{display:block;width:100%;margin:0 0 8px;padding:5px 10px;border:1.5px solid #c7d2fe;border-radius:999px;background:#fff;color:#3730a3;font:700 14px system-ui,sans-serif;cursor:pointer}#el-cmag .pr:hover{border-color:#4338ca}
#el-cmag .tot{color:#1d4ed8;font-size:14px;margin:0 0 8px}#el-cmag .tot.over{color:#b91c1c}
#el-cmag .lp{display:flex;align-items:center;gap:8px;margin:10px 2px 4px;font-weight:800;font-size:17px}#el-cmag .lp small{margin-left:auto;color:#1d4ed8;font-weight:700;font-size:14px}
#el-cmag .it{display:flex;align-items:center;gap:10px;width:100%;text-align:left;margin:5px 0;padding:8px 12px;border:1.5px solid #c7d2fe;border-radius:14px;background:#eef2ff;color:#1e1b4b;font:600 16px system-ui,sans-serif;cursor:pointer}
#el-cmag .it:hover{border-color:#4338ca;background:#e0e7ff}#el-cmag .it .go{margin-left:auto;color:#4338ca;font-weight:800;white-space:nowrap}
#el-cmag .crt{display:block;margin:-2px 0 6px auto;padding:3px 10px;border:1.5px solid #86efac;border-radius:999px;background:#f0fdf4;color:#166534;font:700 13px system-ui,sans-serif;cursor:pointer}#el-cmag .crt:hover{border-color:#16a34a}
#el-cmag.dock .crt{font-size:12px;padding:2px 8px}
#el-cmag .it.nt{background:#fef9c3;border-color:#fde047;cursor:default}#el-cmag .it.shd{background:#f3e8ff;border-color:#d8b4fe;color:#5b21b6;cursor:pointer}
#el-cmag .it.ex{background:#fee2e2;border-color:#fca5a5;cursor:default}#el-cmag .it.now{background:#4338ca;border-color:#4338ca;color:#fff}#el-cmag .it.now .go{color:#fff}
#el-cmag .m{flex:none;border:1.5px solid #60a5fa;border-radius:999px;padding:1px 9px;font-size:14px;color:#1d4ed8;background:#fff}
#el-cmag .it.now .m{border-color:#fff}#el-cmag .msg{color:#64748b;font-weight:500;margin:6px 2px}#el-cmag .err{color:#b91c1c}
#el-cmag.dock{position:static;width:auto;max-height:none;overflow:visible;flex:none;box-shadow:none;border-width:1.5px;border-radius:14px;padding:10px;font-size:14px;margin:0}
#el-cmag.dock .hd b{font-size:15px}#el-cmag.dock .hd .x{width:26px;height:26px;font-size:13px}#el-cmag.dock .tot{font-size:12.5px;margin-bottom:4px}
#el-cmag.dock .lp{font-size:14px;margin:8px 0 2px;flex-wrap:wrap;gap:2px 6px}#el-cmag.dock .lp small{font-size:12px;margin-left:0}
#el-cmag.dock .it{font-size:14px;padding:6px 8px;gap:6px;margin:4px 0;border-radius:11px;flex-wrap:wrap;line-height:1.25}#el-cmag.dock .it .go{font-size:12.5px}
#el-cmag.dock .hd{flex-wrap:nowrap;gap:6px;margin-bottom:2px}#el-cmag.dock .hd b{font-size:14px;white-space:nowrap}#el-cmag.dock .hd .x{flex:none}
#el-cmag.dock .it{flex-wrap:nowrap}#el-cmag.dock .it>span:not(.m):not(.go){flex:1;min-width:0}#el-cmag.dock .it .go{margin-left:0}
#el-cmag.dock .m{order:3;font-size:11px;padding:0 5px;white-space:nowrap}#el-cmag.dock .msg{font-size:13px}#el-cmag.dock .hd small,#el-cmag.dock .gt{display:none}
.elrail:has(#el-cmag),aside.side:has(#el-cmag){padding-bottom:76px!important;overflow-y:auto}
.elrail:has(#el-cmag) .elside,.elrail:has(#el-cmag) .eln,aside.side:has(#el-cmag) .nvs{display:none!important}
#el-cmvid{position:fixed;inset:0;z-index:2147481600;background:rgba(15,23,42,.92);display:grid;place-items:center;padding:20px}
#el-cmvid video{max-width:100%;max-height:calc(100vh - 90px);border-radius:12px;background:#000}
#el-cmvid button{position:absolute;top:14px;right:16px;border:0;border-radius:999px;padding:8px 16px;background:#fff;color:#1e1b4b;font:800 15px system-ui,sans-serif;cursor:pointer}
#el-cmag .row{display:flex;align-items:stretch;gap:5px;margin:5px 0}#el-cmag .row>.it{flex:1;min-width:0;margin:0}
#el-cmag .en,#el-cmag .mo{flex:none;width:36px;border:1.5px solid #c7d2fe;border-radius:12px;background:#fff;color:#94a3b8;font:800 16px system-ui,sans-serif;cursor:pointer;padding:0;filter:grayscale(1);opacity:.75}
#el-cmag .en.on{background:#dcfce7;border-color:#22c55e;filter:none;opacity:1}#el-cmag .en.me{background:#e0e7ff;border-color:#4338ca;filter:none;opacity:1;cursor:default}
#el-cmag .mo{filter:none;opacity:1;color:#3730a3}#el-cmag .mo.on{background:#4338ca;color:#fff;border-color:#4338ca}
#el-cmag .hwb{font-style:normal;margin-left:4px}
#el-cmag .acts{display:flex;flex-wrap:wrap;gap:5px;margin:-1px 0 8px 41px}#el-cmag .acts button{border:1.5px solid #c7d2fe;border-radius:999px;background:#fff;color:#3730a3;font:700 13px system-ui,sans-serif;padding:5px 10px;cursor:pointer}
#el-cmag .acts button.on{background:#fef3c7;border-color:#f59e0b;color:#92400e}#el-cmag .acts button:hover{border-color:#4338ca}
#el-cmag .tools{display:flex;gap:6px;margin:0 0 8px}#el-cmag .tools button{flex:1;min-width:0;padding:6px 8px;border:1.5px solid #c7d2fe;border-radius:999px;background:#fff;color:#3730a3;font:800 13px system-ui,sans-serif;cursor:pointer;white-space:nowrap}
#el-cmag .tools button.on{background:#dcfce7;border-color:#22c55e;color:#166534}#el-cmag .tools button:hover{border-color:#4338ca}
#el-cmag .hint{margin:0 0 6px;font-size:13px;color:#166534;font-weight:700}#el-cmag .ok{margin:4px 2px 8px;padding:6px 10px;border-radius:10px;background:#dcfce7;color:#166534;font-size:13px;font-weight:700}
#el-cmag .ok.err{background:#fee2e2;color:#991b1b}
#el-cmag details{margin:6px 0;border:1.5px solid #e0e7ff;border-radius:12px;padding:4px 8px}#el-cmag summary{cursor:pointer;font-weight:800;padding:4px 0;list-style-position:inside}
#el-cmag summary small{color:#64748b;font-weight:600}#el-cmag .chips{display:flex;flex-wrap:wrap;gap:5px;padding:4px 0 6px}
#el-cmag .chip{border:1.5px solid #c7d2fe;border-radius:999px;background:#eef2ff;color:#1e1b4b;font:700 13px system-ui,sans-serif;padding:5px 10px;cursor:pointer}
#el-cmag .chip:hover{border-color:#4338ca;background:#e0e7ff}#el-cmag .chip.shd{background:#f3e8ff;border-color:#d8b4fe;color:#5b21b6}#el-cmag .chip.shd:hover{border-color:#7c3aed}#el-cmag .chip.shd span{color:#7c3aed}#el-cmag .chip.done{background:#f1f5f9;border-color:#e2e8f0;color:#64748b;cursor:default}
#el-cmag .back{border:0;background:none;color:#4338ca;font:800 14px system-ui,sans-serif;cursor:pointer;padding:2px 0;margin:0 0 6px}
#el-cmag.dock .row .it{flex-wrap:wrap;gap:2px 6px;padding:5px 7px}#el-cmag.dock .row .it>span:not(.m):not(.go){flex:1 1 100%}#el-cmag.dock .row .it .m{order:3}#el-cmag.dock .row .it .go{order:4;margin-left:auto}
#el-cmag.dock .en,#el-cmag.dock .mo{width:30px;font-size:14px;border-radius:10px}#el-cmag.dock .acts{margin-left:35px}#el-cmag.dock .acts button{font-size:12px;padding:4px 8px}
#el-cmag.dock .tools button{font-size:12px;padding:5px 6px}#el-cmag.dock .hint,#el-cmag.dock .ok{font-size:12px}#el-cmag.dock .chip{font-size:12px;padding:4px 8px}
#el-cmwrap{position:fixed;inset:0;z-index:2147483100;background:rgba(15,23,42,.55);display:grid;place-items:center;padding:16px;font:600 15px system-ui,sans-serif;color:#1e1b4b}
#el-cmwrap .bx{background:#fff;border-radius:18px;box-shadow:0 20px 50px rgba(15,23,42,.4);width:min(720px,100%);max-height:calc(100vh - 32px);display:flex;flex-direction:column;overflow:hidden}
#el-cmwrap .hd{padding:16px 20px 10px;border-bottom:1.5px solid #e0e7ff}#el-cmwrap h2{margin:0 0 4px;font-size:21px}#el-cmwrap .hd p{margin:0;color:#475569;font-weight:500;font-size:14px}
#el-cmwrap .ls{overflow:auto;padding:8px 20px 12px}#el-cmwrap .lp{margin:12px 0 4px;font-weight:800;color:#3730a3;font-size:15px}
#el-cmwrap .r{display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid #f1f5f9}#el-cmwrap .r .n{flex:1;min-width:0}
#el-cmwrap .seg{display:flex;flex:none;border:1.5px solid #c7d2fe;border-radius:999px;overflow:hidden}
#el-cmwrap .seg button{border:0;border-left:1.5px solid #c7d2fe;background:#fff;color:#334155;font:700 13.5px system-ui,sans-serif;padding:7px 12px;cursor:pointer;white-space:nowrap}
#el-cmwrap .seg button:first-child{border-left:0}#el-cmwrap .seg button:hover{background:#eef2ff}
#el-cmwrap .seg button.on[data-v=done]{background:#16a34a;color:#fff}#el-cmwrap .seg button.on[data-v=next]{background:#2563eb;color:#fff}#el-cmwrap .seg button.on[data-v=hw]{background:#d97706;color:#fff}
#el-cmwrap .ft{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end;align-items:center;padding:12px 20px;border-top:1.5px solid #e0e7ff;background:#f8fafc}
#el-cmwrap .ft button{border:1.5px solid #c7d2fe;border-radius:999px;background:#fff;color:#3730a3;font:800 14px system-ui,sans-serif;padding:9px 16px;cursor:pointer}
#el-cmwrap .ft button.go{background:#4338ca;border-color:#4338ca;color:#fff}#el-cmwrap .ft .m{margin-right:auto;color:#475569;font-size:13px}#el-cmwrap .ft .m.err{color:#b91c1c}
#el-cmwrap button:disabled{opacity:.6;cursor:default}
#el-cmwrap .ml{display:block;padding:10px 20px;border-top:1.5px solid #e0e7ff;font-size:14px;cursor:pointer;line-height:1.35}#el-cmwrap .ml input{width:17px;height:17px;vertical-align:-3px;margin-right:4px}
#el-cmwrap .ml small{color:#64748b;font-weight:500}#el-cmwrap .ft .m.ok{color:#166534;font-weight:800}
@media (max-width:640px){#el-cmwrap .r{flex-wrap:wrap}#el-cmwrap .seg{width:100%}#el-cmwrap .seg button{flex:1;padding:7px 4px}}`;

// ctx: {db, doc, setDoc, getDoc, getDocs, collection, query, where, deleteField, serverTimestamp, lsInfo, root, g (group id), gname,
//   s (when this class mode started), token() (the teacher's idToken, for the school mail script), tester(email)}
export function setup(ctx){C=ctx;enLoad()}
export function isOpen(){return !!box}
export function close(){if(box){box.remove();box=null}clearInterval(placeT);want(false)}
// the scripts and the agendas, also with the panel closed: the class tab needs today's steps for live/{group}.go (plan)
let ready=null;
const scripts=()=>Promise.all([load("shared/js/el-sections.js",()=>window.EL_SECTIONS),load("shared/js/el-plan.js",()=>window.EL_PLAN),load("shared/js/el-week.js",()=>window.ELWeek),load("lab/game/decks/index.js",()=>window.EL_GAMES)]);
export function init(){return ready||(ready=(async()=>{await scripts();L=await agendas();await bookOpen()})().catch(e=>{ready=null;throw e}))}
// ⚡ I've finished (Roger, 12 Nov 2026: fast finishers go on with "the book section"): the 📖 Book learning path of each LS with steps
// today. Class mode opens it for the group (rules level, so the answers save; ensureOpen, once) and names it on live/{group}.go.ff; the
// students' ⚡ I've finished (el-cloud.js ffGo) opens its next chapter for a student who has done today's open steps. Its chapters keep
// their Time plan days for everyone else (🏫 until then).
const bookOf=x=>(window.EL_CATALOG||[]).find(a=>a.ls===x.ls.id&&/\/book\.html$/.test(a.path||""));
const todayLs=()=>{const t=today();return (L||[]).filter(x=>((x.ag.days||{})[t]||[]).some(it=>it!=="self"&&!/^note:/.test(it)&&it.indexOf("#")>0))};
async function bookOpen(){for(const x of todayLs()){const a=bookOf(x);if(a&&window.elLpOpen&&!elLpOpen(a,x.info,C.g,true))try{await ensureOpen(x,a,"")}catch(e){console.warn("book",e)}}}
// 👥 the steps students may work on now (as well as the class tab's own step), for this class mode in this browser tab
const EN_K="el_cm_en";let EN=new Set();
function enLoad(){try{const o=JSON.parse(sessionStorage.getItem(EN_K)||"null");EN=new Set(o&&o.s===C.s&&Array.isArray(o.en)?o.en:[])}catch(e){EN=new Set()}}
function enSave(){try{sessionStorage.setItem(EN_K,JSON.stringify({s:C.s,en:[...EN]}))}catch(e){}}
// today's steps on the agenda (learning path tabs, whole paths, games): [{x (the LS: {ls, info, ag}), it, a, p}]
function todayItems(){if(!L)return [];const t=today();   // in the panel's order (runs: each path's tabs together, its games after them)
  return L.flatMap(x=>runs(x.ag,t).flatMap(g=>g.its).map(String).filter(it=>it!=="self"&&it!=="exam"&&!/^note:/.test(it)).map(it=>{const i=it.indexOf("#");if(i<0)return null;
    const a=byId(it.slice(0,i));return a?{x,it,a,p:it.slice(i+1)}:null}).filter(Boolean))}
const lpLab=(x,a)=>(x.ag.lab||{})[a.id]||(window.elLpLabel?elLpLabel(a):a.title);
const lpShort=(x,a)=>{const l=String(lpLab(x,a));return (l.match(/^LP\d+/)||[l])[0]};
const stepName=z=>z.p?itName(z.a,z.p):lpLab(z.x,z.a);
// what the class tab writes on live/{group}.go: vis = today's steps ("path#tab", "path#" = the whole page), ps = the 👥 ones [{u, p, n}]
export function plan(){if(!L)return null;const its=todayItems().filter(z=>!isGame(z.p));
  const ff=todayLs().map(x=>[x,bookOf(x)]).filter(([x,a])=>a&&window.elLpOpen&&elLpOpen(a,x.info,C.g,true)).map(([,a])=>a.path);
  return {vis:its.map(z=>z.a.path+"#"+z.p),ps:its.filter(z=>EN.has(z.it)).map(z=>({u:z.a.path,p:z.p,n:lpShort(z.x,z.a)+(z.p?" · "+itName(z.a,z.p):"")})),ff}}
export const hasToday=()=>todayItems().length>0;
// 🔥 the warm-up's class games (el-warmup.js, Roger 13 Nov 2026): the vocabulary and grammar games of today's learning paths (and any game on
// today), else of the paths on the latest earlier class day of the agenda: {decks: [ids], title}
export function warmDecks(){const G=(window.EL_GAMES||[]).filter(g=>g.kind==="vocab"||g.kind==="grammar"),ids=new Set(),names=new Set();
  const lsName=x=>String(x.ls.title||"").replace(/^\d\s*ESO\s*·\s*/i,"").toLowerCase();
  const add=(x,a)=>{const t=String(a.title||"").split(/[:(]/)[0].trim().toLowerCase(),
    hit=G.filter(g=>g.course===x.ls.course&&String(g.ls||"").toLowerCase().includes(lsName(x))&&t&&String(g.lp||"").split(" · ").slice(1).join(" · ").toLowerCase().startsWith(t));
    hit.forEach(g=>{ids.add(g.id);names.add(g.lp)})};
  const onDay=d=>{(L||[]).forEach(x=>((x.ag.days||{})[d]||[]).map(String).forEach(it=>{const i=it.indexOf("#");if(i<0||/^note:/.test(it))return;const a=byId(it.slice(0,i)),p=it.slice(i+1);
    if(/^game:(?!cb-)/.test(p)){const g=G.find(z=>z.id===p.slice(5));if(g){ids.add(g.id);names.add(g.lp)}}else if(a&&!/\/book\.html$/.test(a.path||""))add(x,a)}))};
  const t=today();onDay(t);
  if(!ids.size){const ds=[...new Set((L||[]).flatMap(x=>Object.keys(x.ag.days||{})))].filter(d=>d<t).sort().reverse();for(const d of ds){onDay(d);if(ids.size)break}}
  // nothing planned yet: the latest learning path with class games of the course's latest LS on the Time plan
  if(!ids.size){for(const x of (L||[]).slice().reverse()){const gs=G.filter(g=>g.course===x.ls.course&&String(g.ls||"").toLowerCase().includes(lsName(x)));
    const lp=gs.map(g=>g.lp).sort((a,b)=>(+(String(b).match(/^LP(\d+)/)||[0,0])[1])-(+(String(a).match(/^LP(\d+)/)||[0,0])[1]))[0];
    if(lp){gs.filter(g=>g.lp===lp).forEach(g=>{ids.add(g.id);names.add(g.lp)});break}}}
  return {decks:[...ids],title:[...names].join(" + ")}}
// 🏠 the homework made for one tab on day d for the next class (the Time plan's 🏠 switch, teacher.html hwNext): [id, homework] or null
const hwOf=x=>(((x.info||{}).homework||{})[C.g])||{};
function hwNext(x,d,it){const i=it.indexOf("#"),aid=it.slice(0,i),p=it.slice(i+1);
  return Object.entries(hwOf(x)).find(([,h])=>h&&h.next&&h.set===d&&h.tabs&&Object.keys(h.tabs).length===1&&String((h.tabs[aid]||[]).join())===p)||null}
const nextDay=d=>window.ELWeek&&ELWeek.classDays?ELWeek.classDays(C.g,ELWeek.add(d,1),ELWeek.add(d,70))[0]||null:null;
// the agenda, as the dashboard keeps it (teacher.html rmIt, addIt, agSave)
const rmIt=(ag,d,it)=>{const a=ag.days[d];if(!a)return;const i=a.indexOf(it);if(i>=0)a.splice(i,1)};
const addIt=(ag,d,it)=>{const a=ag.days[d]=ag.days[d]||[];if(a.includes(it))return;const id=it.split("#")[0],j=a.map(z=>z.split("#")[0]).lastIndexOf(id);if(j>=0)a.splice(j+1,0,it);else a.push(it)};
// an item from day `from` to day `to`, with its minutes, grouping and order switch
function mvIt(ag,from,to,it){rmIt(ag,from,it);addIt(ag,to,it);["min","wk","solo"].forEach(f=>{const m=ag[f];if(!m||!(from+"|"+it in m))return;m[to+"|"+it]=m[from+"|"+it];delete m[from+"|"+it]})}
function tidy(ag){Object.keys(ag.days).forEach(d=>{if(!ag.days[d].some(it=>it!=="self"))delete ag.days[d]});
  ["min","wk","solo"].forEach(f=>{const m=ag[f];if(!m)return;Object.keys(m).forEach(q=>{const i=q.indexOf("|");if(!(ag.days[q.slice(0,i)]||[]).includes(q.slice(i+1)))delete m[q]});if(!Object.keys(m).length)delete ag[f]});
  if(ag.man){Object.keys(ag.man).forEach(d=>{if(!ag.days[d])delete ag.man[d]});if(!Object.keys(ag.man).length)delete ag.man}}
// the LS document read again (the dashboard may have changed it since this page read it), its agenda changed by fn and saved
async function fresh(x){try{const s=await C.getDoc(C.doc(C.db,"ls",x.ls.id));if(!s.exists())return;const d=s.data(),i=x.info;
  ["planEdits","homework","open","locked","lockedKeys","secLocked","secOpened"].forEach(f=>{if(d[f])i[f]=d[f]})}catch(e){console.warn("agenda",e)}}
async function agWrite(x,fn){await fresh(x);const ag=window.elAgendaOf&&elAgendaOf(x.info,C.g);if(!ag)throw new Error("no Time plan for "+C.gname);
  if(fn(ag)===false)return;tidy(ag);const str=JSON.stringify(ag);
  await C.setDoc(C.doc(C.db,"ls",x.ls.id),{planEdits:{[C.g]:{agenda:str}}},{merge:true});
  x.info.planEdits=Object.assign({},x.info.planEdits,{[C.g]:Object.assign({},(x.info.planEdits||{})[C.g],{agenda:str})});x.ag=ag}
// homework of one LS: o = {id: homework or null (taken off)}
async function hwWrite(x,o){const w={};Object.entries(o).forEach(([id,h])=>{w[id]=h?Object.assign({},h,{at:C.serverTimestamp()}):C.deleteField()});
  await C.setDoc(C.doc(C.db,"ls",x.ls.id),{homework:{[C.g]:w}},{merge:true});
  const g=Object.assign({},hwOf(x));Object.entries(o).forEach(([id,h])=>{if(h)g[id]=h;else delete g[id]});x.info.homework=Object.assign({},x.info.homework,{[C.g]:g})}
const hwNew=(x,z,d)=>({text:lpLab(z.x,z.a)+": "+itName(z.a,z.p),by:nextDay(d),set:d,tabs:{[z.a.id]:[z.p]},next:true});
// ✔ ticked on the Time plan for today (teacherPlan/{group}.ticks "ls|@day#item" = the day), and "ls|@day" when the whole day is ticked
async function tickDone(list){if(!list.length)return;const t=today(),ref=C.doc(C.db,"teacherPlan",C.g);let cur={};
  try{const s=await C.getDoc(ref);cur=(s.exists()&&s.data().ticks)||{}}catch(e){console.warn("ticks",e)}
  const tk={};list.forEach(z=>{tk[z.x.ls.id+"|@"+t+"#"+z.it]=t});
  [...new Set(list.map(z=>z.x))].forEach(x=>{const its=[...((x.ag.days||{})[t]||[]).filter(it=>it!=="self"),...(x.ag.exam===t?["exam"]:[])],
    on=it=>{const k=x.ls.id+"|@"+t+"#"+it;return k in tk?tk[k]:cur[k]},all=its.length>0&&its.every(on),k=x.ls.id+"|@"+t;if(!!cur[k]!==all)tk[k]=all?t:false});
  await C.setDoc(ref,{ticks:tk,updated:C.serverTimestamp()},{merge:true})}
// a learning path or tab still locked for the group opens (as Start class mode on the dashboard does)
async function ensureOpen(x,a,p){const info=x.info,g=C.g,ref=C.doc(C.db,"ls",a.ls);
  if(window.elLpOpen&&!elLpOpen(a,info,g,true)){const ids=[...(window.EL_CATALOG||[]).filter(y=>y.ls===a.ls&&elLpOpen(y,info,g,true)).map(y=>y.id),a.id],Lk=elLpLocks(a.ls,ids);
    await C.setDoc(ref,{open:{[g]:ids},locked:{[g]:Lk.locked},lockedKeys:{[g]:Lk.lockedKeys}},{merge:true});
    info.open=Object.assign({},info.open,{[g]:ids});info.locked=Object.assign({},info.locked,{[g]:Lk.locked});info.lockedKeys=Object.assign({},info.lockedKeys,{[g]:Lk.lockedKeys})}
  const lk=p&&window.elSecLocked?elSecLocked(a,info,g):[];
  if(p&&lk.includes(p)){const k=a.id.replace("/","__"),rest=lk.filter(z=>z!==p),op=[...new Set([...((((info.secOpened||{})[g]||{})[k])||[]),p])];
    await C.setDoc(ref,{secLocked:{[g]:{[k]:rest}},secOpened:{[g]:{[k]:op}}},{merge:true});
    info.secLocked=Object.assign({},info.secLocked,{[g]:Object.assign({},(info.secLocked||{})[g],{[k]:rest})});
    info.secOpened=Object.assign({},info.secOpened,{[g]:Object.assign({},(info.secOpened||{})[g],{[k]:op})})}}
// docked in the side menu: the LP pages' rail (el-app.js .elrail, redrawn now and then, so it is put back) or the LS home's aside.side;
// only when that menu is shown wide (a computer), else floating
let placeT=null;
function host(){for(const el of document.querySelectorAll(".elrail,aside.side")){if(el.offsetWidth>=200&&getComputedStyle(el).display!=="none")return el}return null}
function place(){if(!box)return;const h=host();
  if(h){if(box.parentElement!==h)h.append(box);box.classList.add("dock")}
  else{box.classList.remove("dock");if(box.parentElement!==document.body)document.body.append(box)}}
export async function open(){if(!C)return;want(true);
  if(!document.getElementById("el-cmag-css")){const st=document.createElement("style");st.id="el-cmag-css";st.textContent=CSS;document.head.append(st)}
  if(!box){box=document.createElement("div");box.id="el-cmag";box.onclick=click;document.body.append(box)}
  place();clearInterval(placeT);placeT=setInterval(place,800);   // the side menu can come or be redrawn after this
  box.innerHTML='<div class="hd"><b>📋 Today</b><button class="x" data-x="1" title="Close">✕</button></div><p class="msg">Loading the agenda…</p>';
  await scripts();
  await draw()}
let L=null,D=null,MO=null,ADD=false,MSG=null;
const msg=()=>MSG?`<p class="ok ${MSG.err?"err":""}">${E(MSG.t)}</p>`:"";
const say=(t,err)=>{MSG={t,err:!!err};clearTimeout(say.k);say.k=setTimeout(()=>{MSG=null;if(box)draw()},err?9000:5000)};
async function draw(){if(!box)return;
  try{L=await agendas()}catch(e){L=[]}
  D=pickDay(L);const t=today(),live=D===t;
  if(ADD)return drawAdd();
  const its=[];let body="",tot=0,nTab=0;
  L.forEach(x=>{const ag=x.ag,mn=it=>+((ag.min||{})[D+"|"+it])||0;
    if(ag.exam===D)body+=`<div class="it ex">📝 Exam</div>`;
    runs(ag,D).forEach(g=>{
      if(!g.a){g.its.forEach(it=>{const n=its.push({ls:x,it})-1,m=mn(it);tot+=m;const sh=it===SHD&&x.ls.shadowing;
        body+=`<${sh?"button":"div"} class="it ${sh?"shd":"nt"}" ${sh?`data-i="${n}" title="Play the unit's shadowing video here (students stay where they are)"`:""}>${m?`<span class="m">${m} min</span>`:""}<span>${E(it.slice(5))}</span>${sh?'<span class="go">▶</span>':""}</${sh?"button":"div"}>`});return}
      const a=g.a,nos=g.its.length===1&&/#$/.test(g.its[0]),lt=g.its.reduce((s,it)=>s+mn(it),0);
      if(!nos)body+=`<div class="lp">${E(lpLab(x,a))}${lt?`<small>⏱ ${lt} min</small>`:""}</div>`;
      g.its.forEach(it=>{const p=it.slice(it.indexOf("#")+1),n=its.push({ls:x,it,a,p})-1,m=mn(it),gm=isGame(p),now=!gm&&hereIs(a,p);tot+=m;
        const hw=live&&p&&!gm&&hwNext(x,D,it);
        const cr=readingOf(a.path,p)?`<button class="crt" data-c="${n}" title="${p==="grammar"?"Explain and correct this grammar with the whole class on the projector: every level at once, sentence by sentence":"Correct this reading with the whole class on the projector: every level at once, question by question"} (the students stay where they are)">✅ Correct together</button>`:"";
        const btn=`<button class="it ${now?"now":""}" data-i="${n}" title="${gm?"Open the game board here (🎓 Back to class mode brings you back)":"Go there: "+E(C.gname)+" follows"}">${m?`<span class="m">${m} min</span>`:""}<span>${E(nos?lpLab(x,a):itName(a,p))}${hw?'<i class="hwb" title="Homework for next class">🏠</i>':""}</span><span class="go ${now||gm?"":"gt"}">${now?"● now":gm?"▶ Play":"Go →"}</span></button>`;
        if(!live||gm){body+=btn+cr;return}
        nTab++;const on=EN.has(it),nd=nextDay(D);
        body+=`<div class="row"><button class="en ${now?"me":on?"on":""}" data-en="${n}" aria-pressed="${now||on}" title="${now?"Your tab: students are always here":on?"Students can work on this step now · click to close it":"Let students work on this step too (they can move between the 👥 steps)"}">👥</button>${btn}<button class="mo ${MO===it?"on":""}" data-mo="${n}" title="Homework or next class">⋯</button></div>`;
        if(MO===it)body+=`<div class="acts">${p?`<button data-hw="${n}" class="${hw?"on":""}" title="${hw?"It is homework for "+E(dLab(hw[1].by))+" · click to take it off":"Students do it at home for the next class"}">🏠 ${hw?"Homework ✓":"Homework"}</button>`:""}${nd?`<button data-nx="${n}" title="It moves to the next class on your Time plan">⏭ Next class · ${E(dLab(nd))}</button>`:""}</div>`;body+=cr})})});
  const len=+((window.EL_TIMETABLE||{}).len)||60,tabs=its.filter(z=>z.a&&!isGame(z.p)),allOn=tabs.length>0&&tabs.every(z=>EN.has(z.it)||hereIs(z.a,z.p)),nOn=tabs.filter(z=>EN.has(z.it)&&!hereIs(z.a,z.p)).length;
  box.innerHTML=`<div class="hd"><b>📋 ${live?"Today":"Next class"} · ${E(dLab(D))}</b><small>${E(C.gname)}</small><button class="x" data-x="1" title="Hide (📋 Today on the class mode bar shows it again)">✕</button></div>`
    +(its.some(x=>x.a)?`<button class="pr" data-pr="1" title="This class on paper, for students without a Chromebook: its tabs and games, per level, with an answer key">🖨 Print session</button>`:"")
    +`<div class="tools">${live&&nTab>1?`<button data-all="1" class="${allOn?"on":""}" title="${allOn?"Back to one step: students follow your tab":"Students can move between all of today's steps"}">👥 ${allOn?"Only mine":"Open all"}</button>`:""}<button data-wu="1" title="A quick whole-class game with the words and grammar of today’s learning path (hangman, word order…): you tap what the students call out">🔥 Warm-up</button><button data-add="1" title="Put another step on today's class: it opens and students can do it">➕ Add a step</button></div>`
    +(live&&nOn?`<p class="hint">👥 Students can move between ${nOn+1} steps.</p>`:"")+msg()
    +(tot?`<p class="tot ${tot>len?"over":""}">⏱ ${tot} of ${len} min planned</p>`:"")
    +(body||`<p class="msg">Nothing on the agenda${live?" today":""} for ${E(C.gname)}. Plan it in the dashboard's Time plan, or ➕ add a step.</p>`);
  box._its=its}
// ➕ Add a step: every learning path with tabs of the course's LSs (the latest LS first), the tabs not on today yet
function drawAdd(){const t=today(),on=new Set(todayItems().map(z=>z.it)),its=[];let body="";const many=L.length>1;
  [...L].reverse().forEach(x=>{const as=(window.EL_CATALOG||[]).filter(a=>a.ls===x.ls.id&&secs(a).length&&!a.checkpoint&&!a.optional);if(!as.length)return;
    if(many)body+=`<div class="lp">${E(x.ls.title.replace(/^\dESO · /,""))}</div>`;
    // 🎬 the unit's shadowing video with the whole class (Roger, 13 Nov 2026: "the shadowing of the unit should be on the menu to add steps
    // during class mode"): goes on today's class like the Time plan's 🎬 Shadowing (the note SHD) and plays at once
    if(x.ls.shadowing){const tday=((x.ag.days||{})[t]||[]).includes(SHD),n=its.push({x,shd:true})-1;
      body+=`<div class="chips sh"><button class="chip shd" data-ad="${n}" title="${tday?"Already on today: play it now":"Add it to today's class and play the video now"}">🎬 Shadowing · whole class${tday?" ✓":""} <span>▶</span></button></div>`}
    as.forEach(a=>{const shut=window.elLpOpen&&!elLpOpen(a,x.info,C.g,true),here=hereIs(a,"");
      body+=`<details ${here?"open":""}><summary>${E(lpLab(x,a))}${shut?" <small>· not opened yet</small>":""}</summary><div class="chips">`
        +secs(a).map(([p,nm])=>{const it=a.id+"#"+p;if(on.has(it))return `<span class="chip done" title="Already on today">✓ ${E(nm)}</span>`;
          const n=its.push({x,a,p,it})-1;return `<button class="chip" data-ad="${n}" title="Add it to today's class">${E(nm)}</button>`}).join("")+`</div></details>`})});
  box.innerHTML=`<div class="hd"><b>➕ Add a step</b><button class="x" data-x="1" title="Hide">✕</button></div><button class="back" data-back="1">‹ Back to today</button>`+msg()
    +`<p class="msg" style="margin-top:0">It goes on today's class on the Time plan, opens for ${E(C.gname)} and students can do it (👥).</p>`+(body||`<p class="msg">No learning paths found.</p>`);
  box._add=its}
function click(e){const b=e.target.closest("button");if(!b||!box)return;if(b.dataset.x)return close();if(b.dataset.wu)return warmOpen();
  if(b.dataset.pr){const its=(box._its||[]).filter(x=>x.a).map(x=>x.it);window.open(new URL(elPrintDay(its,C.gname,dLab(D)),C.root).href,"_blank","noopener");return}
  // ✅ Correct together (Roger, 12 Nov 2026): the reading's correction over this tab (shared/correct/open.js); nothing moves for the students
  if(b.dataset.c!=null){const y=(box._its||[])[+b.dataset.c],r=y&&readingOf(y.a.path,y.p);if(r)openCorrect(C.root,Object.assign({tab:y.p,g:C.g},r));return}
  if(b.dataset.add){ADD=true;MO=null;return draw()}
  if(b.dataset.back){ADD=false;return draw()}
  if(b.dataset.ad)return addStep((box._add||[])[+b.dataset.ad],b);
  if(b.dataset.all){const tabs=(box._its||[]).filter(z=>z.a&&!isGame(z.p)),all=tabs.every(z=>EN.has(z.it)||hereIs(z.a,z.p));tabs.forEach(z=>all?EN.delete(z.it):EN.add(z.it));enSave();return draw()}
  const z=(box._its||[])[+(b.dataset.i||b.dataset.en||b.dataset.mo||b.dataset.hw||b.dataset.nx)];if(!z)return;
  if(b.dataset.en){if(b.classList.contains("me"))return;EN.has(z.it)?EN.delete(z.it):EN.add(z.it);enSave();return draw()}
  if(b.dataset.mo){MO=MO===z.it?null:z.it;return draw()}
  if(b.dataset.hw)return setHw(z,b);
  if(b.dataset.nx)return toNext(z,b);
  const x=z;
  if(x.it===SHD)return play(new URL(x.ls.ls.shadowing,C.root).href);
  // the game opens in this class tab (Roger, 9 Nov 2026: "when we play a game I should be able to go to the class mode where I came
  // from"): the board's 🎓 Back to class mode brings the tab back to this page and tab, still in class mode (lab/game/host.js)
  // 🕵️ Code Breakers (Roger, 12 Nov 2026), "game:cb-<lp>": its own board, the same way back to the class
  if(/^game:cb-/.test(x.p)){location.href=new URL("lab/game/codebreakers.html?lp="+encodeURIComponent(x.p.slice(8))+"&g="+encodeURIComponent(C.g)+"&from="+encodeURIComponent(location.pathname),C.root).href;return}
  if(isGame(x.p)){location.href=new URL("lab/game/host.html?deck="+encodeURIComponent(x.p.slice(5))+"&g="+encodeURIComponent(C.g)+"&from="+encodeURIComponent(location.pathname),C.root).href;return}
  go(x,b)}
const busy=async(b,f)=>{b.disabled=true;try{await f()}catch(err){console.warn("class mode",err);say("✗ Not saved: "+(err.code||err.message||err),true)}b.disabled=false;draw()};
// ➕ on today's agenda (taken off a later day where it was planned), open for the group, 👥 for the students
function addStep(y,b){if(!y)return;const t=today();
  if(y.shd){const src=new URL(y.x.ls.shadowing,C.root).href;return busy(b,async()=>{
    await agWrite(y.x,ag=>{if((ag.days[t]||[]).includes(SHD))return false;addIt(ag,t,SHD)});
    ADD=false;say("🎬 Shadowing is on today's class");play(src)})}
  return busy(b,async()=>{await ensureOpen(y.x,y.a,y.p);
  await agWrite(y.x,ag=>{Object.keys(ag.days).forEach(d=>{if(d>t)rmIt(ag,d,y.it)});addIt(ag,t,y.it)});
  EN.add(y.it);enSave();ADD=false;say("➕ "+lpShort(y.x,y.a)+" · "+itName(y.a,y.p)+" is on today: students can do it (👥)")})}
// 🏠 homework for the next class, or taken off again
function setHw(z,b){const x=z.ls,cur=hwNext(x,D,z.it);return busy(b,async()=>{
  if(cur){await hwWrite(x,{[cur[0]]:null});say("🏠 "+itName(z.a,z.p)+" is no longer homework");return}
  const h=hwNew(x,{x,a:z.a,p:z.p},D);if(!h.by)throw new Error("no later class in the timetable");
  await hwWrite(x,{["h"+Date.now().toString(36)]:h});say("🏠 "+itName(z.a,z.p)+": homework for "+dLab(h.by))})}
// ⏭ to the next class day on the agenda (its homework for next class goes: it is done in class)
function toNext(z,b){const x=z.ls,nd=nextDay(D);if(!nd)return;return busy(b,async()=>{
  await agWrite(x,ag=>{if(!(ag.days[D]||[]).includes(z.it))return false;mvIt(ag,D,nd,z.it)});
  const h=z.p&&hwNext(x,D,z.it);if(h)await hwWrite(x,{[h[0]]:null});
  EN.delete(z.it);enSave();MO=null;say("⏭ "+stepName({x,a:z.a,p:z.p})+" moved to "+dLab(nd))})}
// to a tab or a learning path: opened first if it is still locked for the group (as Start class mode on the dashboard does), then the class
// tab goes there (same page: only the tab changes) and cmTeacher sends it to the students
async function go(x,b){const a=x.a,p=x.p||"";b.disabled=true;
  try{await ensureOpen(x.ls,a,p)}
  catch(err){b.disabled=false;const m=document.createElement("p");m.className="msg err";m.textContent="✗ Could not open it for "+C.gname+": "+(err.code||err.message||err);b.after(m);return}
  // docked, it stays (the class tab has no menu to show in its place, el-catalog.js) and its "now" mark moves; floating, it closes
  if(box&&box.classList.contains("dock"))b.disabled=false;else close();
  const u=new URL(a.path,C.root);
  if(u.pathname===location.pathname){const t=p&&[...document.querySelectorAll(".tab[data-panel]")].find(z=>z.dataset.panel===p);if(t)t.click();else if(!p)window.scrollTo(0,0);return}
  location.href=u.href+(p?"#"+encodeURIComponent(p):"")}
// the video plays over the page with ⛶ Full screen that keeps the list of who left on top (elPlayVideo in el-catalog.js; Roger, 9 Nov 2026)
function play(src){if(window.elPlayVideo){vid=window.elPlayVideo(src);return}if(vid)vid.remove();vid=document.createElement("div");vid.id="el-cmvid";
  vid.innerHTML='<video controls autoplay playsinline></video><button type="button">✕ Close the video</button>';vid.querySelector("video").src=src;
  vid.querySelector("button").onclick=()=>{vid.remove();vid=null};document.body.append(vid)}
// the "now" mark follows the class tab (a tab clicked on the page)
// 🔥 the warm-up game over the class tab (el-warmup.js); also when class mode starts (el-cloud.js cmTeacher)
export async function warmOpen(auto){if(!C)return;try{await init()}catch(e){}const w=warmDecks();if(auto&&!w.decks.length)return;
  const m=await import(new URL("shared/js/el-warmup.js",C.root).href);return m.open(Object.assign({root:C.root,g:C.g,gname:C.gname,s:C.s},w))}
export function refresh(){if(box&&L)draw()}

// ⏹ The end of the class: each of today's steps ✔ Finished, ⏭ Next class or 🏠 Homework (Roger, 12 Nov 2026: "When I finish the class mode, a
// window should pop up and let me say the SLP FINISHED and the ones to continue next class"). Resolves "saved", "skipped" (ended without
// saving) or "back" (back to the class, only when canBack). Nothing for today: "none" at once.
export async function wrapUp(canBack){try{await init();L=await agendas()}catch(e){return "none"}
  const t=today(),rows=todayItems();if(!rows.length)return "none";
  if(!document.getElementById("el-cmag-css")){const st=document.createElement("style");st.id="el-cmag-css";st.textContent=CSS;document.head.append(st)}
  const nd=nextDay(t),ch=rows.map(z=>z.p&&!isGame(z.p)&&hwNext(z.x,t,z.it)?"hw":"done");
  const w=document.createElement("div");w.id="el-cmwrap";let last="";
  const seg=(i,z)=>[["done","✔ Finished"],...(nd?[["next","⏭ Next class"]]:[]),...(z.p&&!isGame(z.p)?[["hw","🏠 Homework"]]:[])].map(([v,l])=>`<button type="button" data-r="${i}" data-v="${v}" class="${ch[i]===v?"on":""}" aria-pressed="${ch[i]===v}">${l}</button>`).join("");
  const body=()=>rows.map((z,i)=>{const lp=z.p?lpLab(z.x,z.a):"",h=lp&&lp!==last?`<div class="lp">${E(lp)}</div>`:"";last=lp||last;
    return h+`<div class="r"><span class="n">${E(z.p?itName(z.a,z.p):lpLab(z.x,z.a))}</span><span class="seg">${seg(i,z)}</span></div>`}).join("");
  w.innerHTML=`<div class="bx" role="dialog" aria-modal="true" aria-labelledby="el-cmwrap-h"><div class="hd"><h2 id="el-cmwrap-h">🎓 End of the class · ${E(C.gname)}</h2><p>How did today's steps go? ✔ Finished is ticked on your Time plan, ⏭ Next class moves it to ${nd?E(dLab(nd)):"the next class"}, 🏠 Homework is for students to finish at home by then.</p></div>`
    +`<div class="ls">${body()}</div><label class="ml"><input type="checkbox" ${mailOn()?"checked":""}> ✉️ Email students their result: below ${PERF.BELOW}% of the ✔ Finished steps “please keep up”, 100% “well done” <small>(only students who were in class mode; everyone's % goes to 📈 Class performance in Students' progress)</small></label><div class="ft"><span class="m"></span>${canBack?'<button type="button" data-a="back">↩ Back to class</button>':""}<button type="button" data-a="skip">End without saving</button><button type="button" class="go" data-a="save">✔ Save and end class</button></div></div>`;
  document.body.append(w);
  return new Promise(res=>{const m=w.querySelector(".ft .m"),done=v=>{w.remove();res(v)};
    w.onclick=async e=>{const b=e.target.closest("button");if(!b)return;
      if(b.dataset.r){const i=+b.dataset.r;ch[i]=b.dataset.v;b.parentElement.querySelectorAll("button").forEach(q=>{const on=q===b;q.classList.toggle("on",on);q.setAttribute("aria-pressed",on)});return}
      if(b.dataset.a==="back")return done("back");if(b.dataset.a==="skip")return done("skipped");
      if(b.dataset.a!=="save")return;w.querySelectorAll("button").forEach(q=>q.disabled=true);m.className="m";m.textContent="Saving…";
      try{await saveWrap(rows,ch,t,nd)}
      catch(err){console.warn("class mode",err);m.className="m err";m.textContent="✗ Not saved: "+(err.code||err.message||err);w.querySelectorAll("button").forEach(q=>q.disabled=false);return}
      // 📈 each student's share of the ✔ Finished steps: saved for the dashboard and emailed (el-class-perf.js); the Time plan is saved already
      const ml=w.querySelector(".ml input"),mail=!!(ml&&ml.checked);mailSet(mail);if(ml)ml.disabled=true;
      try{const fin=rows.filter((z,i)=>ch[i]==="done"&&z.a&&!isGame(z.p)).map(z=>({a:z.a,p:z.p,it:z.it,n:stepName(z),ag:z.x.ag}));
        const r=await PERF.run(C,fin,t,mail,x=>{m.className="m";m.textContent=x});
        if(r.saved){m.className="m ok";m.textContent="✔ Saved"+(r.present?` · ${r.present} in class`+(mail?` · ✉️ ${r.sent} emailed`+(r.failed?` · ✗ ${r.failed} not sent`:""):""):" · nobody was in class mode");
          await new Promise(z=>setTimeout(z,r.failed?6000:2500))}
        done("saved")}
      catch(err){console.warn("class performance",err);m.className="m err";m.textContent="✔ Time plan saved · ✗ class performance not saved: "+(err.code||err.message||err);setTimeout(()=>done("saved"),6000)}}})}
async function saveWrap(rows,ch,t,nd){const xs=[...new Set(rows.map(z=>z.x))];
  for(const x of xs){const mine=rows.map((z,i)=>[z,ch[i]]).filter(([z])=>z.x===x);
    const nx=mine.filter(([,v])=>v==="next").map(([z])=>z.it);
    if(nx.length&&nd)await agWrite(x,ag=>{nx.forEach(it=>mvIt(ag,t,nd,it))});
    const hw={};mine.forEach(([z,v])=>{if(!z.p||isGame(z.p))return;const cur=hwNext(x,t,z.it);if(v==="hw"&&!cur){const h=hwNew(x,z,t);if(h.by)hw["h"+Date.now().toString(36)+Object.keys(hw).length]=h}else if(v!=="hw"&&cur)hw[cur[0]]=null});
    if(Object.keys(hw).length)await hwWrite(x,hw)}
  await tickDone(rows.filter((z,i)=>ch[i]==="done"));
  EN.clear();enSave()}
