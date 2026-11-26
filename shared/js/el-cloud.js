// English Lab cloud: sign-in (students: school email + password; teacher: Google; el-signin.js), per-LS progress sync, LS release gate,
// route (set by the teacher), learning paths the teacher opens per group, once-only activities, points per completed action.
import "./el-copyright.js";
import "./el-route-names.js";
import {signIn} from "./el-signin.js";
import {CONFIG,DOMAINS,TEACHERS,TESTERS} from "./el-firebase.js";   // project config, school domains, teacher and testers
import {report,wakeFixer} from "./el-report.js";
import {awayWatch,awayCount} from "./el-away.js";   // 🎓 leaving the class page (other windows, tabs, apps)

const SKIP=/^(el_|firebase|debug)/;
const ROOT=new URL("../../",import.meta.url);
// Pages open straight on the right version (Roger, 7 Nov 2026: "When I open a page, it loads old version for seconds and then it opens
// the last version"). The Firebase SDK is loaded with import() after this point, not with static imports: those held back this whole file,
// so the app menu (el-app.js) and the route names (el-route-names.js) waited for the SDK, and every page first showed its signed-out or
// old look. The pages draw at once from el_who (who was signed in on this browser last, saved below in onAuthStateChanged) and redraw
// when the sign-in is known, which is the same picture.
loadScript("shared/js/el-app.js",()=>window.ELApp);   // the app menu on student pages (el-app.js: a strip of icon buttons, a phone's bottom bar)
// 🛠 Maintenance mode (Roger, 7 Nov 2026; shared/js/el-maintenance.js has the message and the worksheets). The teacher's switch on the
// dashboard writes site/maintenance = {on, note, pdfs, since} (anyone can read it, only the teacher writes it). Students only: the teacher, the
// teacher's student view and the test account's "see everything" get in as usual. Reads: none for 2 minutes after a check that found it
// off (el_mt in this browser), so a page opened from then on is covered within 2 minutes; otherwise one (a listener on that document,
// whose first answer is the check). While it is on, the page saves nothing, keeps listening and opens again by itself when it goes off.
// el_mt also keeps the last message shown, so a student's next page shows it at once, before the sign-in is known.
const MT_K="el_mt",MT_MS=2*60e3,mtSet=Storage.prototype.setItem;
const mtGet=()=>{try{return JSON.parse(localStorage.getItem(MT_K)||"null")}catch(e){return null}};
const mtPut=o=>{try{mtSet.call(localStorage,MT_K,JSON.stringify(Object.assign({t:Date.now()},o)))}catch(e){}};
let mtO=null,mtStop=null;
async function mtShow(o,tester){
  const m=await import("./el-maintenance.js");
  if(!mtO){const st=document.createElement("style");st.textContent=m.CSS;document.head.append(st);
    mtO=document.createElement("div");mtO.id="el-maintenance";
    mtO.style.cssText="position:fixed;inset:0;z-index:2147483600;background:#f8fafc;display:grid;place-items:center;padding:20px;overflow:auto";
    document.body.append(mtO)}
  mtO.innerHTML=m.html(Object.assign({root:ROOT.href,signOut:true},o));
  const b=mtO.querySelector("[data-mt-out]");if(b)b.onclick=()=>logout();
  // the test account in a group's student view: a way back to its own view (that bar is under the message)
  if(tester){const t=document.createElement("p");t.innerHTML='<button type="button" style="border:0;background:#7c3aed;color:#fff;border-radius:999px;padding:6px 14px;cursor:pointer;font:inherit">Test account: see everything again</button>';
    t.querySelector("button").onclick=()=>{mtSet.call(localStorage,"el_view","");location.reload()};mtO.firstElementChild.append(t)}
  document.documentElement.classList.add("elready");
}
function mtHide(){if(mtO){mtO.remove();mtO=null}}
(()=>{let w=null;try{w=JSON.parse(localStorage.getItem("el_who")||"null")}catch(e){}const c=mtGet();
  if(w&&w.role==="student"&&c&&c.on)mtShow(c).catch(e=>console.warn("maintenance",e))})();
const FB="https://www.gstatic.com/firebasejs/10.14.1/";
const FBM=await Promise.all([import(FB+"firebase-app.js"),import(FB+"firebase-auth.js"),import(FB+"firebase-firestore.js")])
  .catch(e=>{console.warn("Firebase could not load (offline?): the page works on its own, nothing is synced",e);return null});
// html.elwait (el-app.js, el-ls-home.js: nobody signed in on this browser): the page stays hidden until the sign-in is known
const elShow=()=>{const h=document.documentElement;if(h.classList.contains("elwait"))h.classList.add("elready")};
if(!FBM){elShow();await new Promise(()=>{})}   // offline: stop here quietly, as the failed static import did before
const [{initializeApp},A,{getFirestore,doc,getDoc,getDocs,setDoc,updateDoc,deleteDoc,collection,query,where,writeBatch,serverTimestamp,onSnapshot,arrayUnion}]=FBM;

const {getAuth,signOut,onAuthStateChanged}=A;
const app=initializeApp(CONFIG),auth=getAuth(app),db=getFirestore(app);
// Fewer Firestore reads (Roger, 1 Nov 2026: the free plan's 50,000 reads a day ran out; AGENTS.md "Student page reads").
// Each page reads the student's own documents once and every card shares them (once): students/{uid}, levels, ls/{id}.
// The results list (students/{uid}/results, the longest one) is also kept in this browser for 30 minutes (el_rc_<uid>), and the
// student's own result saves go into that copy, so teachers' corrections and exam marks show up at most 30 minutes late.
const once=(()=>{const m={};const f=(k,get)=>m[k]||(m[k]=Promise.resolve().then(get).catch(e=>{delete m[k];throw e}));f.drop=k=>{delete m[k]};return f})();
const RC="el_rc_",RC_MS=30*60e3;
const plain=o=>JSON.parse(JSON.stringify(o,(k,v)=>v&&typeof v.toMillis==="function"?v.toMillis():v));   // Timestamps → milliseconds
function rcGet(uid){try{const c=JSON.parse(localStorage.getItem(RC+uid)||"null");return c&&Date.now()-c.t<RC_MS?c.d:null}catch(e){return null}}
function rcPut(uid,d,t){try{origSet.call(localStorage,RC+uid,JSON.stringify({t:t||Date.now(),d}))}catch(e){}}
// fresh: read from the server (the board), otherwise the copy in this browser while it is younger than 30 minutes.
function myResults(uid,fresh){
  // window.EL_RS_RAW: the results as saved, exam marks included, only for the 📄 Term report (today.html reportPlace: Roger, 25 Nov 2026,
  // "the reports must have them anyway, and I decide when to publish everthing!"); every other page gets the held copy
  const keep=d=>{window.EL_RS_RAW=d;return held(d)};
  const c=!fresh&&rcGet(uid);if(c)return Promise.resolve(c).then(keep);
  return once("rs:"+uid,async()=>{const d={};(await getDocs(collection(db,"students",uid,"results"))).forEach(x=>d[x.id]=x.data());rcPut(uid,plain(d));return d}).then(keep);
}
// Exam results held back (Roger, 17 Nov 2026, the web exam: "we release the results automatically 4 days later"): a record with
// showFrom (an ISO time, written by the dashboard's 📥 Save marks and tools/web-exam/writing.mjs) shows no exam marks, report or writing
// level before that time; the board says when they come out (held). The continuous-assessment progress stays. On read, so the copy in
// this browser opens by itself when the day comes.
// Beltran's answers and corrections held too (Roger, 24 Nov 2026: "These answers must be in the afternoon from 17h and the same for all
// the corrections during weekdays at 17h"): an answer to a comment (answers[step].at) or a correction (replies[step] with fbGo[step],
// tools/marking/marks.mjs, tools/problems/reply-time.mjs) still to come is taken out here, so no page (the step's tab, the cards, the
// notebook, the board, My marks) shows it before then. A writing sent back to redo keeps its flag hidden too, so it opens at the same time.
const later=(m,now)=>{const t=typeof m==="number"?m:Date.parse(m||"");return t>now};
function soon(r,now){const go=r.fbGo||{},an=r.answers||{},hg=Object.keys(go).filter(k=>later(go[k],now)),ha=Object.keys(an).filter(k=>an[k]&&later(an[k].at,now));
  if(!hg.length&&!ha.length)return r;
  const c=Object.assign({},r),cut=(f,ks)=>{if(c[f]){c[f]=Object.assign({},c[f]);ks.forEach(k=>delete c[f][k])}};
  cut("answers",ha);cut("replies",hg);cut("fbSig",hg);cut("flags",hg);return c}
function held(d){const now=Date.now(),o={};
  for(const [k,r0] of Object.entries(d||{})){const r=r0&&typeof r0==="object"?soon(r0,now):r0;if(!(r&&r.showFrom&&now<Date.parse(r.showFrom))){o[k]=r;continue}
    const c=Object.assign({},r);delete c.sections;delete c.report;delete c.version;delete c.webPaper;
    if(c.levels){c.levels=Object.assign({},c.levels);delete c.levels.writing}
    // the exam mark the dashboard keeps in .progress (progSync) is held too (Roger, 20 Nov 2026: "students can see their results! they
    // shouldnt yet": My marks showed Exam 7.6 from progress.exam, and the LS mark so far counted it): no exam, no total with the exam in it
    if(c.progress){c.progress=Object.assign({},c.progress);delete c.progress.exam;delete c.progress.total}
    c.held=r.showFrom;o[k]=c}
  return o}
window.elHeld=held;
// 📣 held until the teacher publishes (Roger, 24 Nov 2026: "I only need a button to publish them when I want"): showFrom = 9999-12-31
// (EL_HOLD) means no date yet; elHeldDay gives the day results come out, or null when it is "until the teacher publishes them"
window.EL_HOLD="9999-12-31T00:00:00.000Z";
window.elHeldDay=v=>{const t=typeof v==="number"?v:Date.parse(v||"");return isNaN(t)||t>=Date.parse("9000-01-01T00:00:00Z")?null:new Date(t)};
// A result this page saved: put into the copy too (the server's time is unknown here, so "updated" stays out).
function rcSaved(uid,id,data){try{const c=JSON.parse(localStorage.getItem(RC+uid)||"null");if(!c)return;const o=Object.assign({},data);delete o.updated;
  c.d[id]=Object.assign(c.d[id]||{},plain(o));rcPut(uid,c.d,c.t)}catch(e){}}
// Cards that are usually empty (the teacher's replies to problem reports, announcements): after a check that found nothing, the
// next pages skip it for 15 minutes (el_ck_<kind>_<uid>). A card still waiting to be closed is checked on every page.
async function quiet(kind,u,load){
  const k="el_ck_"+kind+"_"+u.uid;let t=0;try{t=+localStorage.getItem(k)||0}catch(e){}
  if(Date.now()-t<15*60e3)return [];
  const r=await load();try{if(r.length)localStorage.removeItem(k);else origSet.call(localStorage,k,String(Date.now()))}catch(e){}
  return r;
}
const myLevels=uid=>once("lv:"+uid,async()=>{const o={};(await getDocs(collection(db,"students",uid,"levels"))).forEach(d=>o[d.id]=d.data());return o});
const myDoc=uid=>once("me:"+uid,async()=>{const s=await getDoc(doc(db,"students",uid));return s.exists()?s.data():null});
const origSet=Storage.prototype.setItem;
let bellEl=null,stopBell=null,stopJoin=null,stopGame=null,joinGen=0,lockedKeys=[],myGroup=null,noSync=false,user=null,timer=null,syncing=false,frozen=false,myLevel=null,homeLevel=null,stale=false,pulled=false;
const listeners=[];let userDone=false;   // userDone: onAuthStateChanged has worked out group, level and gate (ELCloud.onUser)
const isTeacher=u=>!!u&&TEACHERS.includes((u.email||"").toLowerCase());
const isTester=u=>!!u&&TESTERS.includes((u.email||"").toLowerCase());
// Testers can switch to the student view of one group (bottom bar): the site then behaves as for a listed student of that group.
// Kept in this browser only (el_view), so it needs no rules change; "" = tester view, everything open.
const viewGroup=u=>{if(!isTester(u))return null;const g=localStorage.getItem("el_view");return (window.EL_GROUPS||[]).some(x=>x.id===g)?g:null};
const seesAll=u=>isTester(u)&&!viewGroup(u);
// ✦ A personal LS (Towards Nativeness, el-catalog.js personal:true) is the teacher's own course (Roger, 17 Nov 2026: "My teacher account
// too"): there the teacher's account works as a learner that sees everything, like a tester (saves, pulls, its own notebook), not in teacher mode.
const tnLs=()=>!!lsId&&!!((window.EL_LS||[]).find(l=>l.id===lsId)||{}).personal;
const tnMe=u=>isTeacher(u)&&!AS&&tnLs();
const learner=u=>isStudent(u)||tnMe(u);
// In a group's view the tester can also pick a level (Roger, 1 Nov 2026: "see how each level sees it"): el_view_level, this browser only.
// "" = the route saved on the tester's own account. It replaces the route everywhere through window.EL_VIEW_LEVEL (elRouteOf, el-catalog.js).
const viewLevel=u=>{const g=viewGroup(u);if(!g)return null;const l=localStorage.getItem("el_view_level"),c=((window.EL_GROUPS||[]).find(x=>x.id===g)||{}).course;
  return (window.EL_LEVELS||[]).some(x=>x.id===l)&&(l!=="native"||c==="4eso")?l:null};
// 👁 The teacher browses the site as one student sees it (Roger, 4 Nov 2026: "I want to be able to [browse] the web like they do so that I can
// see how they see the writing corrections, their activities"). The student's board opened from the dashboard (today.html?student=uid)
// starts it in that browser tab (sessionStorage el_as = {uid}); every page of that tab then shows what that student sees: their group's
// LSs and learning paths, their level, their saved answers (students/{uid}/progress/{ls}, copied into this browser and marked el_as_loaded),
// the teacher's corrections in each step's tab and the same locks and messages. Read-only: the page is frozen and nothing is written to the
// student's documents (push() is only for student accounts; the cards that save something when closed are not shown). The dashboard, Exit,
// or any page of the teacher's own view clears the student's answers from this browser again (leaveAs).
const AS_K="el_as",AS_LOADED="el_as_loaded",AS_MS=10*60e3;
let AS=null;   // {uid, name, group, email}: only for the teacher account, set in onAuthStateChanged
const asRead=()=>{try{const o=JSON.parse(sessionStorage.getItem(AS_K)||"null");return o&&o.uid?o:null}catch(e){return null}};
const asSave=o=>{try{sessionStorage.setItem(AS_K,JSON.stringify(o))}catch(e){}};
const isStudent=u=>!!u&&DOMAINS.some(d=>(u.email||"").toLowerCase().endsWith("@"+d));
// Student list (roster/{email}, imported by the teacher in the dashboard): only listed school accounts (and testers) can use the site, and the list sets their group.
// null = not on the list; undefined = the list could not be read (then the site behaves as before the list existed).
// A refused read can come from an old sign-in pass (e.g. the account's email was changed or verified after this browser signed in,
// Josue 2ESOB, 13 Nov 2026: stuck on "Tria el teu grup"): get a fresh pass once and try again, so a reload is enough.
const onRoster=async(u,again)=>{try{const s=await getDoc(doc(db,"roster",(u.email||"").toLowerCase()));return s.exists()?s.data():null}
  catch(e){if(!again&&e&&e.code==="permission-denied"){try{await u.getIdToken(true);return await onRoster(u,true)}catch(x){}}console.warn("roster",e);return undefined}};
let myRoster;

// Which activity / LS is this page?
const relPath=location.pathname.replace(/^.*?\/((2|4)eso\/.*)$/,"$1");
const m=relPath.match(/^((2|4)eso)\/([^/]+)\//);
const lsId=m?m[1]+"-"+m[3]:null;
let actId=m?m[1]+"/"+relPath.split("/").pop().replace(".html",""):null;
const resKey=a=>a.replace("/","__");

// Keys of learning paths locked for the student's group are never sent (firestore.rules refuses them; the cloud copy stays as it is).
// ✦ the teacher as a learner (tnMe): only this LS's own keys, never what teacher mode left in this browser
// (its activities' keys, their …Level, and tnProducts: every Towards Nativeness key starts with "tn")
const tnKey=k=>/^tn[A-Z]/.test(k)||(window.EL_CATALOG||[]).some(a=>a.ls===lsId&&(a.keys||[]).some(x=>k.startsWith(x)));
const snapshot=()=>{const o={},only=user&&tnMe(user);for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(!SKIP.test(k)&&!lockedKeys.includes(k)&&(!only||tnKey(k)))o[k]=localStorage.getItem(k)}return o};
const progressRef=()=>doc(db,"students",user.uid,"progress",lsId);

// "public" (free access, nothing saved) was removed when students got their own password (Roger, 26 Oct 2026): an LS still stored as public is open.
const lsSt=s=>s==="public"?"open":s||"hidden";
// homework (set from the dashboard) and planEdits (sessions moved to another day, tabs per session) came later: they were not copied
// here, so the dashboard and the student board lost the homework set from the dashboard after a reload. planEdits is applied to the
// time plan (ELWeek.applyEdits) as soon as it is read.
// cpShown/cpClosed (closed recall checkpoints, elCpClosed) are kept too: without them a closed checkpoint still looked open on LP pages, so a
// student who missed it could start it (the send was refused) and every later learning path asked for it first (problem report, 4ESOB, 11 Nov).
// once per page here; ELCloud.lsInfo (the dashboard, after it changes an LS) always reads the server.
const lsInfo=id=>once("ls:"+id,()=>lsRead(id));
async function lsRead(id){try{const s=await getDoc(doc(db,"ls",id));if(!s.exists())return {status:"hidden",enabled:[],groups:null,open:{}};const d=s.data();
  if(d.planEdits&&window.ELWeek&&ELWeek.applyEdits)ELWeek.applyEdits(id,d.planEdits);
  if(window.elSqSync&&window.elSqAct&&elSqAct(id))elSqSync(id,d.sq||{});   // 🎲 the Surprise questions activities of this LS become its tabs (el-catalog.js)
  const o={status:lsSt(d.status),enabled:d.enabled||[],groups:d.groups||null,open:d.open||{},secLocked:d.secLocked||{},secOpened:d.secOpened||{},homework:d.homework||{},planEdits:d.planEdits||{},push:d.push||{},done:d.done||{},played:d.played||{},cpShown:d.cpShown||{},cpClosed:d.cpClosed||{},webExam:d.webExam||{},exams:d.exams||{}};
  lsKeep(id,o);return o}catch(e){return {status:"hidden",enabled:[],open:{}}}}
// The last LS state read in this browser (el_ls_<id>: status, groups, open learning paths), only for a page's first drawing before the
// sign-in is known (the LS home's learning paths, All Learning Situations). The page draws again with the state it reads now.
function lsKeep(id,o){try{origSet.call(localStorage,"el_ls_"+id,JSON.stringify({status:o.status,enabled:o.enabled,groups:o.groups,open:o.open,done:o.done}))}catch(e){}}
const lsStatus=async id=>(await lsInfo(id)).status;

// Any key the pull changes marks the page stale, not only this activity's: the final product reads every product piece and Reflect
// reads the checkpoints, so they must reload too to show the student's saved answers (Roger, 26 Oct 2026: answers always come back).
async function pull(){
  const s=await getDoc(progressRef()).catch(()=>null);
  if(s&&s.exists()){const cloud=s.data().data||{};syncing=true;cmtSeen=cmtSigs(cloud);
    const d=dirty();
    for(const k in cloud){if(d[k]&&localStorage.getItem(k)!=null)continue;if(localStorage.getItem(k)!==cloud[k]){origSet.call(localStorage,k,cloud[k]);stale=true}}
    syncing=false}
  pulled=true;
}
// The page's own script read localStorage before this file knew whose it is. After a wipe (another account) or a pull that
// changed it, reload once so the page shows this student's progress, not the old one, and never saves the old one back
// (a Daring student saw "2 / 5" from someone else's steps, Roger 26 Oct 2026). Returns true when it reloads.
// It is called twice on a page (in gate, then after it): once this page has started reloading, the second call must not read
// its own el_reload as "already reloaded" and remove it, or the next load reloads again, for ever (Roger, 8 Nov 2026: a 4 ESO
// student's tab kept reloading on LP3, whose page marks a finished step done as it opens, so every pull found it changed).
let reloading=false;
function reloadIfStale(){
  if(reloading)return true;
  const again=sessionStorage.getItem("el_reload")===location.pathname;sessionStorage.removeItem("el_reload");
  if(!stale||again){stale=false;return false}   // once only, never a loop
  reloading=true;sessionStorage.setItem("el_reload",location.pathname);frozen=true;location.reload();return true;
}
function resultPayload(a,extra){const sc=elPoints(a),parts=typeof window.EL_RESULT_PARTS==="function"?window.EL_RESULT_PARTS():null;return Object.assign({ls:lsId,activity:a.id,score:sc,max:a.points,done:sc,updated:serverTimestamp()},parts?{parts}:{},extra||{})}
// Nothing is sent before this page has pulled the student's progress: a save made while signing in (a slow connection) would
// otherwise send this browser's older copy over the answers saved from another device.
function push(){
  if(!user||!learner(user)||syncing||frozen||!lsId||noSync||!pulled)return;
  clearTimeout(timer);
  timer=setTimeout(send,1500);
}
let meAt=0;
// A new comment on a handed-in step (state.steps[step].comment, not only "no problem": elNoComment) that the cloud copy did not have yet:
// once it is saved, students/{uid}.commented is set and the school Apps Script starts the scheduled task that answers it (Roger, 9 Nov
// 2026: "I want you to answer straight away"; the same start as a problem report, wakeFixer). The task reads only the students with
// a newer `commented` (tools/marking/marks.mjs comments --new), so a run reads a handful of documents.
let cmtSeen=null;
function cmtSigs(o){const out=new Set();for(const k in o){const v=o[k];if(typeof v!=="string"||v.charAt(0)!=="{"||v.indexOf('"comment"')<0)continue;
  let st;try{st=JSON.parse(v).steps}catch(e){continue}
  for(const id in st||{}){const c=String((st[id]||{}).comment||"").trim();if(c&&!(window.elNoComment&&elNoComment(c)))out.add(k+"|"+id+"|"+c)}}return out}
async function send(){
  timer=null;
  try{
    const snap=snapshot();
    // students/{uid} (name, email, last active) at most every 5 minutes, not on every save: the free plan also has 20,000 writes a day
    if(Date.now()-meAt>5*60e3){await setDoc(doc(db,"students",user.uid),{name:user.displayName||"",email:user.email,updated:serverTimestamp()},{merge:true});meAt=Date.now()}
    await setDoc(progressRef(),{data:snap,updated:serverTimestamp()},{merge:true});
    {const now=cmtSigs(snap),was=cmtSeen||new Set(),fresh=[...now].some(x=>!was.has(x));cmtSeen=now;
      if(fresh){await setDoc(doc(db,"students",user.uid),{commented:serverTimestamp()},{merge:true}).catch(e=>console.warn("comment",e));wakeFixer(user)}}
    // saved: these keys are no longer newer here than in the cloud (keys of a locked learning path can never be sent)
    const d=dirty();for(const k in d)if(snap[k]===localStorage.getItem(k)||lockedKeys.includes(k))delete d[k];setDirty(d);
    const a=window.EL_CATALOG&&actId&&EL_CATALOG.find(x=>x.id===actId);
    if(a&&a.graded&&!a.manual){const r=resultPayload(a);await setDoc(doc(db,"students",user.uid,"results",resKey(actId)),r,{merge:true});rcSaved(user.uid,resKey(actId),r)}
  }catch(e){console.warn("sync",e)}
}
// Leaving the page (a presentation link, the board…) sends what is waiting at once instead of 1.5 s later.
addEventListener("pagehide",()=>{if(timer){clearTimeout(timer);send()}});
// Keys saved in this browser but not in the cloud yet (el_dirty). pull() never overwrites them with the older cloud copy: a student
// typed the recall, opened the Autumn words presentation within a second and came back to an empty page, because the save had not
// reached the cloud and the next page's pull put the old copy back (problem report, 4ESO B, 26 Oct 2026). The gate's push sends them.
const DIRTY="el_dirty";
const dirty=()=>{try{return JSON.parse(localStorage.getItem(DIRTY)||"{}")||{}}catch(e){return {}}};
const setDirty=d=>origSet.call(localStorage,DIRTY,JSON.stringify(d));
Storage.prototype.setItem=function(k,v){if(frozen&&this===localStorage&&!SKIP.test(k))return;origSet.call(this,k,v);
  if(this===localStorage&&!SKIP.test(k)){if(!syncing){const d=dirty();if(!d[k]){d[k]=1;setDirty(d)}}push()}};

async function login(){
  // The dashboard is the teacher's page: its Sign in goes straight to Google (the students' window is for every other page).
  const u=onDash?await teacherLogin():await signIn({auth,A,domain:DOMAINS[0]});if(!u)return;
  // Off to the dashboard or the board: cover this page at once, before the sign-in window's removal is painted, so the page
  // signed in from (the welcome page) doesn't flash up while the next one loads (Roger, 7 Nov 2026: "When I sign in I see for a
  // fraction of a second the welcome page"). Taken away again if the account is refused.
  const leaving=(isStudent(u)&&!onBoard&&!onLab)||(isTeacher(u)&&onHome);
  const cover=leaving?overlay('<p style="margin:0;color:#475569;font-weight:600">Opening your dashboard…</p>'):null;
  if(cover)cover.style.zIndex=10004
  const uncover=()=>{if(cover)cover.remove()};
  // Google is only for the teacher (Roger, 26 Oct 2026): any other account that comes in through the Google link is signed out.
  const google=(u.providerData||[]).some(p=>p.providerId==="google.com")&&!(u.providerData||[]).some(p=>p.providerId==="password");
  if(!isTeacher(u)&&(google||!isStudent(u))){uncover();await signOut(auth);alert(google&&isStudent(u)?"Google sign-in is only for the teacher. Sign in with your school email and your password. · Entra amb el correu de l'institut i la teva contrasenya.":"Sign in with your school email (@"+DOMAINS.join(", @")+").");return}
  if(isStudent(u)&&!isTester(u)&&(await onRoster(u))===null){uncover();return}   // refused in onAuthStateChanged
  // Right after signing in: students (testers too) go to their board, except on English Lab, where they stay to use it;
  // the teacher goes from Home to the dashboard and stays on any other page (to preview it).
  if(isStudent(u)&&!onBoard&&!onLab)location.href=BOARD;
  else if(isTeacher(u)&&onHome)location.href=DASH;
}
async function teacherLogin(){
  const p=new A.GoogleAuthProvider();p.setCustomParameters({prompt:"select_account"});
  try{return (await A.signInWithPopup(auth,p)).user}catch(x){if(x&&x.code!=="auth/popup-closed-by-user")console.warn("sign in",x);return null}
}
async function refuse(u){
  const mail=u.email;await signOut(auth);wipeLocal();origSet.call(localStorage,"el_uid","");localStorage.removeItem("el_who");
  const o=overlay('<div style="max-width:520px"><h1>Aquest compte no pot entrar</h1><p><b></b> no és a la llista d\'alumnes d\'English Lab. Entra amb el teu correu de l\'institut i la contrasenya que t\'ha donat el professor, o parla amb ell.</p><p><button style="border:0;background:#0f766e;color:#fff;border-radius:999px;padding:8px 16px;cursor:pointer;font:inherit">Entra amb un altre compte</button></p></div>');
  o.style.zIndex=10001;o.querySelector("b").textContent=mail;o.querySelector("button").onclick=()=>{o.remove();login()};
}
// Shared school computers: never leak one student's local progress into another account.
const wipeLocal=()=>{const ks=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(!SKIP.test(k))ks.push(k)}ks.forEach(k=>localStorage.removeItem(k));localStorage.removeItem(DIRTY);if(ks.length)stale=true};
const logout=async()=>{await signOut(auth);wipeLocal();origSet.call(localStorage,"el_uid","");localStorage.removeItem("el_who");location.reload()};

function banner(text,color,btn){
  const b=document.createElement("div");b.id="el-banner";
  b.style.cssText="position:sticky;top:0;z-index:9998;padding:8px 14px;font:14px system-ui,sans-serif;text-align:center;background:"+color+";color:#fff";
  b.textContent=text+" ";
  for(const bt of [].concat(btn||[])){const x=document.createElement("button");x.textContent=bt.t;x.onclick=bt.f;x.style.cssText="margin-left:8px;border:0;border-radius:6px;padding:3px 10px;cursor:pointer";b.append(x)}
  document.body.prepend(b);
}
// Read-only page: answers stay visible, nothing can be changed or saved (Check, Do it again, Save… are off too; tabs, the
// next-section buttons and the video speed buttons still work).
function freeze(){
  frozen=true;
  // the LS home page's tabs are radio buttons (.tab-radio): they keep working (Roger, 4 Nov 2026: student view, "I can't go to learning paths")
  const lock=()=>document.querySelectorAll("main input:not(.tab-radio),main textarea,main select,main .opt,main [draggable],main .actions button:not([data-vs])").forEach(e=>{if(e.closest(".section-next"))return;e.disabled=true;e.style.pointerEvents="none"});
  lock();new MutationObserver(lock).observe(document.body,{childList:true,subtree:true});
}
function overlay(html){
  const o=document.createElement("div");
  o.style.cssText="position:fixed;inset:0;z-index:10000;background:#f8fafc;display:grid;place-items:center;font:16px system-ui,sans-serif;text-align:center;padding:20px;overflow:auto";
  o.innerHTML=html;document.body.append(o);return o;
}
// The link back to the board speaks the page's language: Catalan for Starter, Base and no route, English otherwise.
const todayLink=(ca=true)=>'<p><a href="'+boardUrl()+'">'+(ca?"Torna al meu tauler":"Back to my board")+'</a></p>';
const block=(title,msg,ca=true)=>overlay('<div><h1>'+title+'</h1><p>'+msg+'</p>'+todayLink(ca)+'</div>');
// Signed-out visitors on an LS page: the sign-in button sits in the overlay itself; it goes away once someone signs in.
let signInO=null;
function signInBlock(){
  signInO=overlay('<div style="max-width:520px"><h1>Sign in</h1><p>To do the activities you need to sign in with your school email (@'+DOMAINS.join(", @")+') and the password your teacher gave you.</p><p><button style="border:0;background:#0f766e;color:#fff;border-radius:999px;padding:8px 16px;cursor:pointer;font:inherit">Sign in</button></p></div>');
  signInO.querySelector("button").onclick=login;
}

// Class group: listed students get the group of the student list (copied to students/{uid}.group, which the pages read).
// Testers, and everyone while the list cannot be read, choose it once on the first sign-in; afterwards only the teacher changes it.
async function ensureGroup(u){
  const me=await myDoc(u.uid).catch(()=>null),cur=me?me.group:null;
  if(!window.EL_GROUPS)return null;
  if(myRoster&&myRoster.group){
    if(cur!==myRoster.group)await setDoc(doc(db,"students",u.uid),{group:myRoster.group,name:u.displayName||"",email:u.email,updated:serverTimestamp()},{merge:true});
    return myRoster.group;
  }
  if(cur)return cur;
  return new Promise(res=>{
    const o=overlay('<div style="max-width:520px"><h1>Tria el teu grup</h1><p>Només ho hauràs de fer una vegada. Si t\'equivoques, avisa el professor.</p><div id="el-gr"></div></div>');
    EL_GROUPS.forEach(g=>{const b=document.createElement("button");b.innerHTML="<b>"+g.name+"</b>";
      b.style.cssText="display:block;width:100%;margin:10px 0;padding:12px;border:2px solid #0f766e;background:#fff;border-radius:12px;cursor:pointer;font:inherit";
      b.onclick=async()=>{if(!confirm("Ets de "+g.name+"?"))return;await setDoc(doc(db,"students",u.uid),{group:g.id,name:u.displayName||"",email:u.email,updated:serverTimestamp()},{merge:true});o.remove();res(g.id)};
      o.querySelector("#el-gr").append(b)});
  });
}
// Routes are set by the teacher (Roger, 30 Oct 2026: students never choose one; they ask for a change on their board, today.html).
// A student sees only their route's button. Testers keep every route button to try them all (their route, if any, opens first).
function applyLevel(lvl,all){
  myLevel=lvl;
  const btns=[...document.querySelectorAll(".route[data-level]")];
  // A page without a Beginners button (LS1) shows the Insecure version: Beginners content falls back to Insecure.
  // A page without a Native button shows the Daring version.
  const mine=btns.find(b=>b.dataset.level===lvl)||(lvl==="beginners"?btns.find(b=>b.dataset.level==="insecure"):lvl==="native"?btns.find(b=>b.dataset.level==="daring"):null);
  if(mine&&!mine.classList.contains("active"))mine.click();
  if(!all)btns.forEach(b=>{b.style.display=b===mine?"":"none"});   // el-app.js already showed only the active one: the student's own shows again
}
// Students only use their board, Games (lab/) and Practise (lab/practice.html), their own course page and the LSs assigned to their group.
const BOARD0=new URL("today.html",ROOT).href,DASH=new URL("teacher.html",ROOT).href,onBoard=/\/today\.html$/.test(location.pathname),onLab=/\/lab\/(index\.html|practice\.html)?$/.test(location.pathname),
  onHome=[ROOT.pathname,ROOT.pathname+"index.html"].includes(location.pathname),onDash=/\/teacher\.html$/.test(location.pathname);
// the student's board: in the teacher's student view, the board of that student
const boardUrl=()=>AS?BOARD0+"?student="+encodeURIComponent(AS.uid):BOARD0;
const BOARD=BOARD0;
// The teacher's Dashboard link says which course (and LS) this page is in, so the dashboard opens on it (teacher.html, el_t_last).
const dashHere=(()=>{const c=relPath.match(/^((2|4)eso)\//);if(!c)return DASH;const u=new URL(DASH);u.searchParams.set("course",c[1]);
  if(lsId)u.searchParams.set("ls",lsId);return u.href})();
const courseOf=g=>((window.EL_GROUPS||[]).find(x=>x.id===g)||{}).course;
async function gate(u){
  const c=relPath.match(/^((2|4)eso)\/(index\.html)?$/);
  if(!u&&c){signInBlock();return}   // course pages are for signed-in users only
  if((AS||isStudent(u)&&!seesAll(u))&&!lsId&&!onBoard&&!onLab){
    if(!(c&&c[1]===courseOf(myGroup))){location.replace(boardUrl());return}
  }
  if(AS&&!lsId&&!onBoard)asBanner();   // course pages, English Lab, Practice: the student view's banner too
  if(!lsId||!window.EL_CATALOG)return;
  if(!u&&!AS){signInBlock();return}   // signed out: the Sign in screen at once (it came after reading the LS, the same way)
  const info=await lsInfo(lsId),st=info.status;
  if(isStudent(u)&&!seesAll(u)&&Array.isArray(info.open[myGroup]))lockedKeys=elLpLocks(lsId,info.open[myGroup]).lockedKeys;
  if(isTeacher(u)&&!AS&&!tnMe(u)){if(st!=="open")banner("Teacher mode · LS "+lsId+": "+st,"#475569");teacherSections(info);if(!/-my-real-routine$/.test(lsId)){openHashTab();teacherCore()}return}   // the tab in the link (dashboard column names, Roger 7 Nov 2026: "should go to the SLP not the LP"); an open LS: no bar that pushes the page down a second after it opened (Roger, 7 Nov 2026); hidden or closed: the bar says so
  if(AS)asBanner();
  else if(!u||!learner(u)){signInBlock();return}
  const tester=!AS&&(seesAll(u)||tnMe(u)),vg=!AS&&viewGroup(u);
  if(tester&&!tnMe(u))banner("Test account: you see every LS and activity.","#7c3aed");
  if(vg){const vl=viewLevel(u);banner("Test account · student view of "+EL_GROUPS.find(x=>x.id===vg).name+(vl?" · level "+(window.elLevelLabel?elLevelLabel(courseOf(vg),vl):vl):"")+": you see what this group sees.","#7c3aed",{t:"See everything again",f:()=>{origSet.call(localStorage,"el_view","");location.reload()}})}
  // The student's level: one per course, the same in every LS (elRouteOf). With none yet, a student works on the Insecure
  // version (nothing is saved as their route) until the teacher sets it; testers just see every route.
  let lvs={};try{lvs=await myLevels(AS?AS.uid:u.uid)}catch(e){console.warn("levels",e)}
  let lvl=elRouteOf(lvs,lsId).level;
  const ca0=!lvl||elCa(lvl);   // the blocks below speak the student's language (Catalan with no route)
  if(!tester&&!elLsForGroup(EL_LS.find(l=>l.id===lsId),info,myGroup)){block(ca0?"Aquesta LS no és del teu grup":"This LS is not for your group",ca0?"Torna al teu tauler: allà tens les LS que el professor ha assignat al teu grup.":"Go back to your board: it has the LSs your teacher gave your group.",ca0);return}
  if(st==="hidden"&&!tester){block(ca0?"Aquesta LS encara no està disponible":"This LS is not available yet",ca0?"El professor l'obrirà quan estigui preparada.":"Your teacher will open it when it is ready.",ca0);return}
  if(AS){if(await asPull())return}
  else{const a0=EL_CATALOG.find(x=>x.id===actId);   // practice mode of a submitted activity is LS1 only: from LS2 on an old flag is dropped, so the page pulls and saves again
    if(a0&&!/-my-real-routine$/.test(a0.ls||""))localStorage.removeItem("el_practice_"+actId);
    if(localStorage.getItem("el_practice_"+actId)!=="1")await pull()}
  if(reloadIfStale())return;
  const a=EL_CATALOG.find(x=>x.id===actId),saved=hasWork(a);   // before applyLevel, whose route click saves an empty state
  if(!lvl&&!tester){lvl="insecure";banner("Encara no tens nivell: el professor te'l posarà a partir de l'examen de la primera LS. De moment fas la ruta Base.","#0369a1")}
  if(lvl||tester)applyLevel(lvl,tester);
  if(AS){freeze();asBanner()}   // the student's page, read-only (the banner again, now with their level)
  if(st==="closed"){freeze();banner("LS tancada: només pots consultar el que vas fer i el feedback.","#92400e");return}
  // Students are never told which activities are assessed (Roger, 26 Oct 2026), so this message does not say it either.
  const ca=elCa(lvl);
  // Learning paths open per group (elLpOpen in el-catalog.js): a locked one shows a block and saves nothing.
  // Students always see their own answers (Roger, 26 Oct 2026): with saved work it opens read-only instead of the block.
  // ↺ Let them do it (Roger, 11 Nov 2026: one student may still do a recall checkpoint that is closed or shown for the group): the
  // teacher's redo:true on that student's try opens it for them alone (firestore.rules cpOk letMe); one read, only on such a page
  let open=!a||elLpOpen(a,info,myGroup);
  const ffp=a&&!tester&&!AS?ffPage():[];if(!open&&ffp.length&&elLpOpen(a,info,myGroup,true))open=true;   // ⚡ I've finished: the Book chapter given to this student in class mode
  if(ffp.length){window.EL_CM_FREE=window.EL_CM_FREE||new Set();ffp.forEach(p=>window.EL_CM_FREE.add(p))}
  if(!open&&!tester&&!AS&&a.checkpoint&&elLpOpen(a,info,myGroup,true)&&elCpClosed(a,info,myGroup)){
    try{const s=await getDoc(doc(db,"students",u.uid,"checkpoints",a.keys[0]));if(s.exists()&&s.data().redo)open=true}catch(e){console.warn("checkpoint",e)}}
  if(a&&!tester&&!open&&saved){freeze();banner(ca?"Aquí pots veure les teves respostes, però ara no les pots canviar.":"Here you can see your answers, but you can't change them now.","#92400e");return}
  if(a&&!tester&&!open){frozen=true;block(ca?"Aquesta activitat encara no està oberta":"This activity is not open yet",ca?"El professor l'obrirà a classe quan toqui fer-la.":"Your teacher will open it in class when it is time to do it.",ca);return}
  if(a&&!tester){const dn=new Set(a.keys.flatMap(k=>[...elDoneSet(localStorage.getItem(k))]));lockSections(elSecLockedFor(a,info,myGroup,dn),ca,a,dn,elSecSoon(a,info,myGroup,dn),myGroup);trimJump(a,info,myGroup)}
  // A recall checkpoint must be done before what comes after it in the LS (elCheckpointMissing in el-catalog.js).
  const cp=!tester&&elCheckpointMissing(a,x=>elDoneSet(localStorage.getItem(x.keys[0])),x=>elLpOpen(x,info,myGroup));
  if(cp&&saved){freeze();banner(ca?"Per continuar aquesta activitat, primer acaba el "+cp.title+". Mentrestant pots veure les teves respostes.":"To go on with this activity, first finish "+cp.title+". Meanwhile you can see your answers.","#92400e",{t:(ca?"Obre el ":"Open ")+cp.title+" →",f:()=>{location.href=new URL(cp.path,ROOT).href}});return}
  if(cp){const o=overlay('<div style="max-width:520px"><h1></h1><p></p><p><a class="go" style="display:inline-block;background:#0f766e;color:#fff;border-radius:999px;padding:10px 18px;text-decoration:none;font-weight:700"></a></p>'+todayLink(ca)+'</div>');
    o.querySelector("h1").textContent=ca?"Primer fes el "+cp.title:"First do "+cp.title;
    o.querySelector("p").textContent=ca?"Per continuar, primer has d'acabar el "+cp.title+". Fes-lo sense apunts.":"To go on, first finish "+cp.title+". Do it without notes.";
    const go=o.querySelector("a.go");go.href=new URL(cp.path,ROOT).href;go.textContent=(ca?"Obre el ":"Open ")+cp.title+" →";return}
  if(a&&a.manual&&a.graded)banner(ca?"Aquesta activitat és per entregar a través del Google Classroom.":"This activity is to be submitted through Google Classroom.","#1d4ed8");
  // Submitting (locking) an activity is only for LS1 (left as it was). From LS2 on answers save on their own and nothing is submitted
  // (Roger, 6 Nov 2026): a learning path a student had submitted, even at 0, opened read-only, and "Practise again" there emptied
  // every answer and saved nothing (a 4 ESO student redid Celebrations around the world twice and could not hand in the Speaking).
  if(a&&a.mode==="once"&&/-my-real-routine$/.test(a.ls||"")&&!AS){
    const rref=doc(db,"students",u.uid,"results",resKey(actId));
    const rset=d=>setDoc(rref,d,{merge:true}).then(()=>rcSaved(u.uid,resKey(actId),d));   // the copy in this browser too
    const r=await getDoc(rref).catch(()=>null),rd=r&&r.exists()?r.data():{};
    if(rd.locked){
      noSync=true;const pk="el_practice_"+actId;
      if(localStorage.getItem(pk)==="1"){banner("Mode pràctica: pots fer l'activitat de nou, però no s'enviarà ni canviarà la teva nota.","#7c3aed",{t:"Surt de la pràctica",f:()=>{origSet.call(localStorage,pk,"0");location.reload()}});return}
      banner("Activitat entregada. Pots consultar-la i, si vols, tornar-la a fer per practicar (no s'enviarà de nou).","#92400e",{t:"Practica de nou",f:()=>{a.keys.forEach(k=>localStorage.removeItem(k));origSet.call(localStorage,pk,"1");location.reload()}});
      freeze();return}
    const submit=async()=>{if(!confirm(ca?"Un cop entregada, la nota queda fixada (podràs practicar-la de nou, però no s'enviarà). Vols entregar-la?":"Once submitted, your result is fixed (you can practise it again, but it will not be sent). Submit it?"))return;
      await setDoc(progressRef(),{data:snapshot(),updated:serverTimestamp()},{merge:true});
      await rset(resultPayload(a,{locked:true,markedDone:true}));location.reload()};
    if(rd.markedDone)banner((ca?"Aquesta activitat és per entregar. L'has marcada com a feta, però encara no l'has entregada.":"This activity is to be submitted. You have marked it as done but not submitted it yet."),"#15803d",[{t:ca?"Entrega-la":"Submit",f:submit},{t:ca?"Desmarca":"Unmark",f:async()=>{await rset({markedDone:false,updated:serverTimestamp()});location.reload()}}]);
    else banner((ca?"Aquesta activitat és per entregar (només una vegada). Quan acabis, marca-la com a feta.":"This activity is to be submitted (only once). When you finish, mark it as done."),"#1d4ed8",{t:ca?"Marca com a feta":"Mark as done",f:async()=>{
      await setDoc(progressRef(),{data:snapshot(),updated:serverTimestamp()},{merge:true});
      await rset(resultPayload(a,{markedDone:true}));
      if(confirm(ca?"Activitat marcada com a feta. Vols entregar-la ara? (La nota quedarà fixada.)":"Activity marked as done. Do you want to submit it now? (Your result will be fixed.)"))await rset(resultPayload(a,{locked:true,markedDone:true}));
      location.reload()}});
  }
  // no 📌 pull-up bar any more: 🎓 class mode takes students to the page (Roger, 7 Nov 2026: "we dont need this … in class mode I pull them up")
  openHashTab();
  // Work left in this browser that the cloud does not have yet (for example done while the LS was still "public") reaches the cloud now.
  push();
}

// 👁 The student's answers in this LS, copied into this browser for the teacher's student view: read again when it is another student
// or LS, or after 10 minutes. The page then reloads once (reloadIfStale) so its own script draws them. Returns true when it reloads.
async function asPull(){
  const k=AS.uid+"|"+lsId;let cur=null;try{cur=JSON.parse(localStorage.getItem(AS_LOADED)||"null")}catch(e){}
  if(cur&&cur.k===k&&Date.now()-cur.t<AS_MS)return false;
  const s=await getDoc(doc(db,"students",AS.uid,"progress",lsId)).catch(e=>{console.warn("student view",e);return null});
  const cloud=s&&s.exists()?s.data().data||{}:{};
  wipeKeys();for(const x in cloud)origSet.call(localStorage,x,cloud[x]);
  origSet.call(localStorage,AS_LOADED,JSON.stringify({k,t:Date.now()}));
  stale=true;return reloadIfStale();
}
// Remove the page answers kept in this browser (not the el_ settings), without marking them as unsaved.
function wipeKeys(){const ks=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(!SKIP.test(k))ks.push(k)}ks.forEach(k=>localStorage.removeItem(k));localStorage.removeItem(DIRTY);return ks.length}
// Back to the teacher's own view: the student's answers leave this browser. reload: the page's script may have drawn them already.
function leaveAs(clear){
  if(clear)try{sessionStorage.removeItem(AS_K)}catch(e){}
  if(localStorage.getItem(AS_LOADED)==null)return;
  localStorage.removeItem(AS_LOADED);if(wipeKeys()&&!onDash)stale=true;
}
const asExit=()=>{leaveAs(true);location.href=DASH};
const asWho=()=>(AS.name||AS.email||"this student")+(AS.group?" · "+(((window.EL_GROUPS||[]).find(x=>x.id===AS.group)||{}).name||AS.group):"")+((myLevel||homeLevel)&&AS.group&&window.elLevelLabel?" · "+elLevelLabel(courseOf(AS.group),myLevel||homeLevel):"");
// The student view shows the pages exactly as the student sees them, with only a red frame round the screen (Roger, 7 Nov 2026: "I need
// to see what students really see, I don't want to see this yellow thing, maybe a red line surrounding the screen"). The frame lets every
// click through; its corner tag names the student and is the way out (the bottom bar's ✕ Exit does the same).
function asBanner(){if(!AS||document.getElementById("el-as-frame"))return;
  const f=document.createElement("div");f.id="el-as-frame";
  f.style.cssText="position:fixed;inset:0;border:4px solid #dc2626;pointer-events:none;z-index:2147483646";
  const t=document.createElement("button");t.type="button";t.textContent="👁 "+(AS.name||AS.email||"Student")+" · ✕";
  t.title="Student view (read-only, nothing is saved). Click to exit and go back to your dashboard.";t.onclick=asExit;
  t.style.cssText="position:absolute;top:0;left:50%;transform:translateX(-50%);pointer-events:auto;border:0;border-radius:0 0 8px 8px;background:#dc2626;color:#fff;font:600 11px system-ui,sans-serif;padding:1px 8px 2px;cursor:pointer;opacity:.85";
  f.append(t);(document.body||document.documentElement).append(f);
  // never on paper (Roger, 13 Nov 2026: "No vull la línia vermella que surt aquí", the printed notebook)
  const ps=document.createElement("style");ps.textContent="@media print{#el-as-frame{display:none!important}}";document.head.append(ps)}
// The learning path the teacher has pulled up for the group (ls/{id}.push[group], elPullFor in el-catalog.js; Roger, 2 Nov 2026): on any
// other page of this LS a bar "📌 Your teacher wants you to open …" with Open it →; on that learning path itself its tab opens once (the
// first time the student lands there after the teacher pulled it up). ✕ hides the bar until the teacher pulls up something else.
function pullBar(info,a,ca){if(!myGroup)return;const x=elPullFor({[lsId]:info},myGroup);if(!x)return;
  const k="el_pull_"+myGroup+"_"+x.at,ss=(f,v)=>{try{return v===undefined?sessionStorage.getItem(f):sessionStorage.setItem(f,v)}catch(e){return null}};
  if(a&&a.id===x.a){if(x.p&&!location.hash&&!ss(k+"_tab")){ss(k+"_tab","1");history.replaceState(null,"","#"+x.p)}return}
  try{if(localStorage.getItem(k+"_x"))return}catch(e){}
  const b=document.createElement("div");b.id="el-pull";
  b.style.cssText="position:sticky;top:0;z-index:9998;display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;justify-content:center;padding:10px 14px;font:600 15px system-ui,sans-serif;background:#0f766e;color:#fff;box-shadow:0 2px 8px rgba(0,0,0,.2)";
  const tx=document.createElement("span");tx.textContent="📌 "+(ca?"El professor vol que obris: ":"Your teacher wants you to open: ")+x.t+(x.pn?" · "+x.pn:"");
  const go=document.createElement("a");go.href=new URL(x.act.path,ROOT).href+(x.p?"#"+x.p:"");go.textContent=(ca?"Obre-ho":"Open it")+" →";
  go.style.cssText="background:#fff;color:#0f766e;border-radius:999px;padding:6px 16px;text-decoration:none;font-weight:800";
  const no=document.createElement("button");no.textContent="✕";no.title=ca?"Amaga":"Hide";no.style.cssText="border:0;background:none;color:#fff;font-size:18px;cursor:pointer";
  no.onclick=()=>{try{localStorage.setItem(k+"_x","1")}catch(e){}b.remove()};
  b.append(tx,go,no);document.body.prepend(b);
}
// Has the student saved anything in this activity? An LS2 page's state counts only with a value in it ({"done":{}} is what
// opening the page with a route click leaves).
const full=x=>x!=null&&x!==""&&x!==false&&(typeof x!=="object"||Object.values(x).some(full));
function hasWork(a){return !!a&&a.keys.some(k=>{const v=localStorage.getItem(k);if(!v)return false;try{return full(JSON.parse(v))}catch(e){return true}})}

// Sections of this learning path that are locked for this student (elSecLockedFor in el-catalog.js) are read-only (Roger, 26 Oct 2026:
// "if they are locked they only see them, and if they already did them they see the last answered version with the correction"):
// the panel keeps the student's saved answers and feedback, and nothing in it can be changed (inputs, Check, Do it again, cards…), except
// audio, video, their speed buttons and hints. Students never see that anything is locked (Roger, 7 Nov 2026: "they mustn't see that
// anything is locked, it's too much info"): a locked section they have done nothing in is not shown at all (tab and panel hidden, a click
// on it from a Next button or a link does nothing), and one they did shows with a plain "look back at your answers" note, no 🔒.
// Pages re-render (LS2 engine), so it is applied again on every change.
// 🏫 To do in class (elSecSoon in el-catalog.js; Roger, 8 Nov 2026: "students can see it but can't write any answer nor play any video until
// it's class time", "a blue shadow and a legend saying to do in class"): a tab planned for a later class day is shown, not hidden, with a
// blue shadow, a 🏫 on its tab and a note with the day; nothing in it can be answered, pressed or played (audio, video, YouTube) until then.
// soon = {panel id: day}. It counts in the page's progress (it is not hidden), so the path never looks finished with tabs still to come.
function lockSections(ids,ca,a,done,soon,gid){
  const fr=window.EL_CM_FREE;if(fr)ids=ids.filter(id=>!fr.has(id));   // steps class mode opened for the student now (cmFree)
  if(!ids.length)return;soon=soon||{};
  // 🏫 tabs for a later class are no longer shown (Roger, 20 Nov 2026: "students still see to do activities and then they see activities in
  // blue, because we have to do them in class, this shouldnt appear"): hidden like a locked tab until their class opens them (the timers
  // below and class mode give them back in place), but still counted in the path's progress (wait), so a path never looks finished with
  // tabs still to come. A tab the student had already started stays shown, frozen, with their answers (cls).
  const did=id=>!!a&&!!done&&elSecSteps(a,id).some(k=>done.has(k));let cls=ids.filter(id=>id in soon&&did(id)),wait=ids.filter(id=>id in soon&&!did(id)),hide=ids.filter(id=>!did(id)),ro=ids.filter(id=>did(id)&&!(id in soon));
  const hidSteps=()=>a?hide.filter(id=>!wait.includes(id)).flatMap(id=>elSecSteps(a,id)):[];
  window.EL_HIDDEN_STEPS=hidSteps();if(window.elProgress)window.elProgress();   // the LS2 page's progress counts only the steps shown
  const note=ca?"Aquí pots repassar les teves respostes.":"Here you can look back at your answers.";
  const today=elAgToday(),openAt=gid?elClassOpenAt(gid,today):null,hm=ms=>{const d=new Date(ms);return d.getHours()+":"+String(d.getMinutes()).padStart(2,"0")};
  const day=d=>d===today?(ca?"avui":"today")+(openAt?(ca?" a les ":" at ")+hm(openAt+5*60e3):""):(()=>{try{return new Date(d+"T12:00:00").toLocaleDateString(ca?"ca-ES":"en-GB",{weekday:"short",day:"numeric",month:"short"})}catch(e){return d}})();
  // a tab the teacher moved to a later day after the student had started it (Roger, 8 Nov 2026: "we froze the page until the calendar allows
  // to edit but their answers get saved"): the same, with their answers kept and shown; it opens to change them on that day
  const cnote=id=>"🏫 "+(ca?"Ho farem a classe":"We'll do it in class")+(soon[id]?" · "+day(soon[id]):"")+". "
    +(did(id)?(ca?"Les teves respostes estan desades: les podràs continuar i canviar a classe. Fins llavors no es pot respondre ni posar els àudios o vídeos.":"Your answers are saved: you can carry on and change them in class. Until then you can't answer or play the audio or videos.")
      :(ca?"Ara ja ho pots mirar, però ho farem junts a classe: encara no pots respondre ni posar els àudios o vídeos.":"You can look at it now, but we'll do it together in class: you can't answer it or play the audio or videos yet."));
  const st=document.createElement("style");st.textContent=".panel.el-sec-off>:not(.el-sec-note){pointer-events:none}.panel.el-sec-off :is(audio,video,summary,[data-vs]){pointer-events:auto}"
    +".panel.el-sec-cls>:not(.el-sec-note){pointer-events:none}"   // no blue any more (Roger, 20 Nov 2026): a plain grey note, like a tab to look back at
    +".tab.el-sec-hide,.panel.el-sec-hide{display:none!important}.el-sec-note{margin:0 0 14px;padding:10px 14px;border-radius:10px;background:#f1f5f9;color:#334155;font-weight:600}";document.head.append(st);
  // nothing plays in a tab for class: a play started some other way (keyboard, script) stops at once
  if(cls.length)document.addEventListener("play",e=>{const m=e.target;if(m&&m.closest&&m.closest(".panel.el-sec-cls")){m.pause();try{m.currentTime=0}catch(x){}}},true);
  // a hidden tab never opens: a click on it (the "Mark section as done" button of the section before it, a #link) opens the next tab shown, if any
  const shownAfter=t=>{const ts=[...document.querySelectorAll(".tab[data-panel]")];return ts.slice(ts.indexOf(t)+1).find(x=>!x.classList.contains("el-sec-hide"))};
  document.addEventListener("click",e=>{const t=e.target.closest&&e.target.closest(".tab.el-sec-hide");if(!t)return;e.preventDefault();e.stopImmediatePropagation();const n=shownAfter(t);if(n)n.click()},true);
  const apply=()=>{
    document.querySelectorAll(".tab[data-panel]").forEach(t=>{if(hide.includes(t.dataset.panel)&&!t.classList.contains("el-sec-hide"))t.classList.add("el-sec-hide")});
    hide.forEach(id=>{const p=document.getElementById(id);if(p&&p.classList.contains("panel")&&!p.classList.contains("el-sec-hide"))p.classList.add("el-sec-hide")});
    // the open tab is one now hidden (the page's first tab, or a link to it): go to the first tab shown
    const on=document.querySelector(".tab.active.el-sec-hide");if(on){const f=[...document.querySelectorAll(".tab[data-panel]")].find(t=>!t.classList.contains("el-sec-hide"));if(f){on.classList.remove("active");f.click()}}
    // no "Mark section as done" button that leads nowhere: the last section shown keeps none
    document.querySelectorAll(".tab[data-panel]").forEach(t=>{if(t.classList.contains("el-sec-hide"))return;const p=document.getElementById(t.dataset.panel),c=p&&p.querySelector(".section-next");if(c)c.style.display=shownAfter(t)?"":"none"});
    cls.forEach(id=>{document.querySelectorAll(`.tab[data-panel="${id}"]`).forEach(t=>{if(!t.classList.contains("el-sec-cls")){t.classList.add("el-sec-cls");t.title=cnote(id)}});
      const p=document.getElementById(id);if(!p||!p.classList.contains("panel"))return;p.classList.add("el-sec-cls");
      if(!p.querySelector(":scope>.el-sec-note")){const n=document.createElement("div");n.className="el-sec-note";n.textContent=cnote(id);p.prepend(n)}
      p.querySelectorAll("input,textarea,select,button,audio,video,iframe,[contenteditable]").forEach(e=>{if(e.matches("audio,video")){if(!e.dataset.elcls)e.dataset.elcls=e.controls?"m1":"m0";e.pause&&e.pause();e.removeAttribute("autoplay");e.controls=false;e.tabIndex=-1;return}
        if(e.matches("iframe")){if(!e.dataset.elcls)e.dataset.elcls="f";e.tabIndex=-1;return}if(e.matches("[contenteditable]")){e.dataset.elcls="e";e.contentEditable="false";return}if(!e.disabled){e.dataset.elcls="d";e.disabled=true;e.tabIndex=-1}})});
    ro.forEach(id=>{const p=document.getElementById(id);if(!p||!p.classList.contains("panel"))return;p.classList.add("el-sec-off");
      if(!p.querySelector(":scope>.el-sec-note")){const n=document.createElement("div");n.className="el-sec-note";n.textContent=note;p.prepend(n)}
      p.querySelectorAll("input,textarea,select,button:not([data-vs])").forEach(e=>{if(!e.disabled){e.dataset.elro="1";e.disabled=true;e.tabIndex=-1}})})};
  apply();if(cls.length&&window.elProgress)window.elProgress();   // again, now the tabs for class are marked: never the "next" one
  // today's tabs for class open by themselves 5 minutes before the class (elClassOpenAt), on this page too: what was frozen is given back
  const now0=cls.filter(id=>soon[id]===today),wait0=wait.filter(id=>soon[id]===today);
  if(wait0.length&&openAt&&openAt>Date.now()&&openAt-Date.now()<18*3600e3)setTimeout(()=>window.elSecFree&&window.elSecFree(wait0),openAt-Date.now());   // hidden ones appear
  if(now0.length&&openAt&&openAt>Date.now()&&openAt-Date.now()<18*3600e3)setTimeout(()=>{cls=cls.filter(id=>!now0.includes(id));
    now0.forEach(id=>{document.querySelectorAll(`.tab[data-panel="${id}"]`).forEach(t=>{t.classList.remove("el-sec-cls");t.removeAttribute("title")});
      const p=document.getElementById(id);if(!p)return;p.classList.remove("el-sec-cls");const n=p.querySelector(":scope>.el-sec-note");if(n)n.remove();
      p.querySelectorAll("[data-elcls]").forEach(e=>{const k=e.dataset.elcls;delete e.dataset.elcls;e.removeAttribute("tabindex");
        if(k==="d")e.disabled=false;else if(k==="e")e.contentEditable="true";else if(k==="m1")e.controls=true})});
    if(window.elProgress)window.elProgress()},openAt-Date.now());
  new MutationObserver(apply).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["disabled"]});
  // 🎓 class mode opens steps for the class there and then (Roger, 12 Nov 2026: steps added during the class, several steps at once): they
  // are given back in place, hidden, 🏫 or read-only as they were, so nothing reloads (el-cloud.js cmFree; the agenda says so after a reload)
  window.elSecFree=list=>{const f=(list||[]).filter(id=>hide.includes(id)||cls.includes(id)||ro.includes(id));if(!f.length)return;
    hide=hide.filter(id=>!f.includes(id));cls=cls.filter(id=>!f.includes(id));ro=ro.filter(id=>!f.includes(id));wait=wait.filter(id=>!f.includes(id));
    f.forEach(id=>{document.querySelectorAll(`.tab[data-panel="${id}"]`).forEach(t=>{t.classList.remove("el-sec-hide","el-sec-cls");t.removeAttribute("title")});
      const p=document.getElementById(id);if(!p)return;p.classList.remove("el-sec-hide","el-sec-cls","el-sec-off");const n=p.querySelector(":scope>.el-sec-note");if(n)n.remove();
      p.querySelectorAll("[data-elcls]").forEach(e=>{const k=e.dataset.elcls;delete e.dataset.elcls;e.removeAttribute("tabindex");
        if(k==="d")e.disabled=false;else if(k==="e")e.contentEditable="true";else if(k==="m1")e.controls=true});
      p.querySelectorAll("[data-elro]").forEach(e=>{delete e.dataset.elro;e.removeAttribute("tabindex");e.disabled=false})});
    window.EL_HIDDEN_STEPS=hidSteps();apply();if(window.elProgress)window.elProgress()};
  // a page left open from an earlier day (problem report, 2ESOA, 13 Nov 2026: a Chromebook closed after Thursday's class and opened again
  // in Friday's class kept Friday's tabs 🏫 frozen): every minute, the tabs whose class day has come open in place, like the timer above
  if(cls.length||wait.length){const reday=setInterval(()=>{if(!cls.length&&!wait.length)return clearInterval(reday);const t=elAgToday(),op=gid?elClassOpenAt(gid,t):null;
    const f=[...cls,...wait].filter(id=>soon[id]&&(soon[id]<t||soon[id]===t&&(!op||Date.now()>=op)));if(f.length)window.elSecFree(f)},60e3)}
}
// The "Learning Path" menu at the top of an LS2 page lists only the paths a student can open (or did some of): never one still
// closed or waiting for a checkpoint (Roger, 7 Nov 2026: "they mustn't see that anything is locked").
function trimJump(a,info,g){const sel=document.getElementById("sessionJump");if(!sel)return;const dn=x=>elDoneSet(localStorage.getItem(x.keys[0])),op=x=>elLpOpen(x,info,g);
  [...sel.options].forEach(o=>{const x=EL_CATALOG.find(y=>y.ls===a.ls&&y.path.split("/").pop()===o.value);
    if(x&&x.id!==a.id&&!hasWork(x)&&(!op(x)||elCheckpointMissing(x,dn,op)))o.remove()})}
// Open and close sections right on the page (Roger, 1 Nov 2026: "vull poder obrir i tancar les tabs, són les seccions dels camins"): in
// teacher mode a bar above the tabs picks a group, and every section tab gets a 🔓/🔒 switch for that group. Same data and rule as the
// dashboard's Sections column (teacher.html api.secLock): ls/{id}.secLocked[group][activity] = locked panel ids, and secOpened keeps every
// section opened so far (elSecLockedFor, elSecPending in el-catalog.js). A learning path still locked for the group shows a warning with
// an Open button (ls/{id}.open, locked, lockedKeys, as api.lpOpen). LS1 pages are left as they are (Roger: leave LS1 alone).
// The learning path pages do not load el-sections.js (the section list the dashboard uses), so it is loaded here for the teacher only.
// 👥 Who is in the class, at the top right of a teacher's page (#el-fsfloat): ⛶ full screen for the group (live/{group}.fs = {on, at, until},
// as on the dashboard; fsCheck below), who left (live/{group}/fsLeft) and who is not connected (live/{group}/here, elClassWatch and
// elClassRoll in el-catalog.js), while full screen or a class game is on. One line of counts, the names under it on a tap (elWhoLine).
// Made for the group picked in the learning path's bar (teacherSections) and, on the class tab, for the class mode's group (cmTeacher).
// Roger, 13 Nov 2026: "I need to see who is in class during class mode and during the activities done together (grammar and reading)":
// the class tab used to show the group last picked in a learning path's bar (a class mode started from the dashboard for 2ESO B showed
// 2ESO A, out of its class, so nothing), showed nothing on pages without that bar (recall checkpoints…), and ✅ Correct together
// (shared/correct/open.js) covered it. Now the class tab always shows its class mode's group, on every page, and while ✅ Correct
// together is open the line sits as a strip above it (the frame starts under it). getG() = the group, redraw() = the page's redraw,
// owns() = this one draws #el-fsfloat now (the class tab's panel wins while class mode is on). Listeners on the same documents are
// shared by the Firestore SDK, so two panels for one group cost no more reads.
let fsPanelN=0;const fsRoster={},fsAll=new Set();   // each group's student list, read once per page for every panel (fsAll: their redraws)
function fsPanel(getG,redraw,owns){
  const P={G:null,X:null,live:null,list:[],here:[],ro:fsRoster,wl:{open:null,hide:false}},id=String(++fsPanelN);
  let sD=null,sL=null,sH=null,AT=null;
  const gname=g=>((window.EL_GROUPS||[]).find(x=>x.id===g)||{}).name||g,E=t=>String(t==null?"":t).replace(/</g,"&lt;");
  // in force now: the switch (P.X), written by 🎓 Class mode (elFsEff in el-catalog.js; never by the timetable alone since 24 Nov 2026)
  P.tt=()=>(P.live&&P.live.tt)||elTT(P.G);P.eff=()=>elFsEff(P.X,P.tt());
  const w0=()=>elClassWatch(Object.assign({},P.live,{fs:P.eff()}),P.list,P.here);
  P.watch=function(){const g=getG();if(!g||P.G===g)return;[sD,sL,sH].forEach(f=>f&&f());sD=sL=sH=null;P.G=g;P.X=P.live=null;P.list=[];P.here=[];
    sD=onSnapshot(doc(db,"live",g),s=>{if(P.G!==g)return;P.live=s.exists()?s.data():null;P.X=(P.live&&P.live.fs)||null;listen();redraw()},e=>console.warn("live",e))};
  function listen(){const g=P.G;if(!g)return;const on=w0().active;
    if(on&&!sL){sL=onSnapshot(collection(db,"live",g,"fsLeft"),c=>{P.list=c.docs.map(d=>Object.assign({e:d.id},d.data()));redraw()},e=>console.warn("fsLeft",e));
      sH=onSnapshot(collection(db,"live",g,"here"),c=>{P.here=c.docs.map(d=>Object.assign({e:d.id},d.data()));redraw()},e=>console.warn("here",e));
      if(!P.ro[g]){P.ro[g]=[];getDocs(query(collection(db,"roster"),where("group","==",g))).then(q=>{P.ro[g]=q.docs.map(d=>{const r=d.data();return {e:d.id,name:(r.first||r.name||d.id.split("@")[0])+(r.surname1?" "+r.surname1:"")}});fsAll.forEach(f=>f())}).catch(e=>{delete P.ro[g];console.warn("roster",e)})}}
    else if(!on&&sL){sL();sH&&sH();sL=sH=null;P.list=[];P.here=[]}}
  const iv=setInterval(()=>{if(P.live){listen();redraw()}},30e3);   // a beat missed for EL_HERE_MS, the end of the class or of the game
  const onCr=()=>redraw();window.addEventListener("el-correct",onCr);fsAll.add(redraw);   // ✅ Correct together opened or closed (shared/correct/open.js)
  P.stop=()=>{[sD,sL,sH].forEach(f=>f&&f());sD=sL=sH=null;P.G=null;clearInterval(iv);window.removeEventListener("el-correct",onCr);fsAll.delete(redraw);
    const f=document.getElementById("el-fsfloat");if(f&&f.dataset.o===id){f.remove();frTop(0)}};
  // on until the end of the class by the timetable (or LOCK_MS); off = null
  P.toggle=async()=>{const g=P.G,now=Date.now(),c=elSlotNow(P.tt(),now),v=P.eff()?null:{on:true,at:now,until:c?c.end:now+LOCK_MS};
    try{await setDoc(doc(db,"live",g),{fs:v},{merge:true});return v?"✓ "+gname(g)+" in full screen":"✓ Full screen off"}catch(e){console.warn("fs",e);return "✗ Not saved: "+(e.code||e.message||e)}};
  P.hm=t=>{const d=t&&t.toDate?t.toDate():typeof t==="number"?new Date(t):null;return d?d.toTimeString().slice(0,5):""};
  // the whole group, in or out (Roger, 6 Nov 2026), as on the dashboard: the group's student list (read once)
  P.roll=()=>elClassRoll(Object.assign({},P.live,{fs:P.eff()}),P.list,P.here,P.ro[P.G]||[]);
  P.why=y=>y.why==="full"?"out of full screen"+(y.left?" · left "+P.hm(y.left.at)+(y.left.n>1?" ("+y.left.n+"×)":""):""):y.why==="closed"?"screen closed or another window · since "+P.hm(y.seen)+elAwayNote(y.left):y.why==="lost"?"lost connection · since "+P.hm(y.seen):"not connected";
  const atApi=()=>({db,doc,setDoc,onSnapshot,deleteField:FBM[2].deleteField});
  // the ✅ Correct together frame starts under the strip (h px), back to the top when the strip goes
  function frTop(h){const fr=document.getElementById("el-correct");if(!fr)return;const t=h?h+"px":"0px";if(fr.style.top!==t){fr.style.top=t;fr.style.height=h?"calc(100vh - "+h+"px)":"100vh"}}
  // in the class tab (on the projector) one line of counts (Roger, 10 Nov 2026: "this was too big and I couldn't see the screen … students
  // played to log in and out so that their name appeared"): the names open under it only when the teacher taps a count (P.wl.open)
  // ✥ Drag it anywhere (Roger, 13 Nov 2026: "I want to be able to move this icon"): a press that moves more than 6 px drags the panel (or the
  // 👥 chip) instead of pressing its button; where it is left is kept on this computer (el_t_fspos, its top-left corner) and used again
  // on every page, kept on screen when it grows or the window shrinks. Not the strip above ✅ Correct together. No reads, no writes.
  const POS="el_t_fspos",posGet=()=>{try{const p=JSON.parse(localStorage.getItem(POS)||"null");return p&&isFinite(p.x)&&isFinite(p.y)?p:null}catch(e){return null}};
  const fit=(f,x,y)=>{f.style.left=Math.max(4,Math.min(x,innerWidth-f.offsetWidth-4))+"px";f.style.top=Math.max(4,Math.min(y,innerHeight-f.offsetHeight-4))+"px";f.style.right=f.style.bottom="auto"};
  const place=f=>{const p=posGet();if(p)fit(f,p.x,p.y)};
  function drag(f){let sx=0,sy=0,ox=0,oy=0,on=false,pid=null;f.style.touchAction="none";f.style.cursor="grab";f.title="Drag to move it";
    // move and release are followed on the whole window: a quick drag leaves the panel before it has moved
    const mv=e=>{if(pid!==e.pointerId)return;const dx=e.clientX-sx,dy=e.clientY-sy;
      if(!on){if(Math.abs(dx)+Math.abs(dy)<7)return;on=true;f.dataset.moving="1";f.style.cursor="grabbing"}
      e.preventDefault();fit(f,ox+dx,oy+dy)};
    const up=e=>{if(pid!==e.pointerId)return;pid=null;removeEventListener("pointermove",mv);removeEventListener("pointerup",up);removeEventListener("pointercancel",up);
      if(!on)return;on=false;delete f.dataset.moving;f.style.cursor="grab";f.dataset.dragged="1";setTimeout(()=>{delete f.dataset.dragged},400);
      try{origSet.call(localStorage,POS,JSON.stringify({x:parseInt(f.style.left),y:parseInt(f.style.top)}))}catch(x){}};
    f.addEventListener("pointerdown",e=>{if(e.button||e.target.closest(".el-wlbox"))return;const r=f.getBoundingClientRect();sx=e.clientX;sy=e.clientY;ox=r.left;oy=r.top;pid=e.pointerId;on=false;
      addEventListener("pointermove",mv);addEventListener("pointerup",up);addEventListener("pointercancel",up)})}
  P.float=function(){if(!owns())return;const w=P.roll();let f=document.getElementById("el-fsfloat");
    if(!w.active){if(f&&f.dataset.o===id){f.remove();frTop(0)}return}
    // over ✅ Correct together: a strip above it, or with ✕ Hide only the 👥 chip, bottom right (over the frame's empty corner)
    const g=P.G,cr=!!document.getElementById("el-correct"),dock=cr&&!P.wl.hide,mode=dock?"dock":cr?"chip":"float";
    if(f&&(f.dataset.o!==id||f.dataset.mode!==mode)){f.remove();f=null;frTop(0)}
    if(!f){f=document.createElement("div");f.id="el-fsfloat";f.dataset.o=id;f.dataset.mode=mode;
      f.style.cssText=dock?"position:fixed;top:0;left:0;right:0;z-index:2147483001;background:#fff;border-bottom:3px solid #ffd34d;padding:4px 16px 5px;font:600 14px system-ui,sans-serif;color:#1e293b;box-shadow:0 3px 10px rgba(0,0,0,.25)"
        :"position:fixed;"+(cr?"bottom:12px":"top:10px")+";right:12px;z-index:2147483001;max-width:min(420px,calc(100vw - 24px));background:#fff;border:2px solid #1e293b;border-radius:14px;padding:8px 12px;box-shadow:0 6px 20px rgba(0,0,0,.2);font:600 14px system-ui,sans-serif;color:#1e293b";
      f.onclick=e=>{const b=e.target.closest("button");if(!b||f.dataset.dragged)return;if(b.dataset.att){if(AT&&AT.cur)AT.m.attClick(b,atApi(),P.G,AT.cur,AT.w,P.ro[P.G]||[]).then(r=>{if(r)redraw()});return}
        if(b.dataset.hide){P.wl.hide=!P.wl.hide;redraw()}else if(b.dataset.wl){P.wl.open=P.wl.open===b.dataset.wl?null:b.dataset.wl;redraw()}else P.toggle().then(redraw)};document.body.append(f);if(!dock)drag(f)}
    // 🙋 attendance of this class (el-attend.js, loaded only here): "not here" until saved, then "absent"; ✗ counts only who left
    if(!AT){AT={m:null};import("./el-attend.js").then(m=>{AT.m=m;redraw()}).catch(e=>console.warn("attendance",e))}
    const aS=AT.m?AT.m.attClass(g,P.tt(),P.eff(),w):0;AT.cur=aS;AT.w=w;const aR=aS?AT.m.attWatch(atApi(),g,aS,redraw):undefined;
    if(aS)AT.m.attLate(atApi(),g,aS,w);
    const bs="border:1px solid #1e293b;border-radius:999px;padding:3px 10px;cursor:pointer;font:700 12px system-ui;";
    const av=aS?AT.m.attView(w,aR,false):undefined,wl=elWhoLine(w,{open:P.wl.open,av,why:P.why,hm:P.hm});
    // ✕ Hide (Roger, 10 Nov 2026: "can I hide the message?"): only a small 👥 in/of chip stays, a tap shows the panel again (this tab only)
    const hb='<button data-hide="1" style="'+bs+'background:#fff;color:#1e293b" title="'+(P.wl.hide?"Show who is in, who left and who is not here":"Hide this message")+'">'+(P.wl.hide?'👥 '+w.inn.length+'/'+w.n:'✕ Hide')+'</button>';
    f.style.padding=dock?(P.wl.hide?"3px 16px":"4px 16px 5px"):P.wl.hide?"4px 6px":"8px 12px";
    const h=P.wl.hide?hb:dock?'<div style="display:flex;gap:4px 12px;align-items:center;flex-wrap:wrap"><b style="white-space:nowrap">👥 '+E(gname(g))+'</b>'+wl.line.replace("margin-top:4px","margin:0")+'<span style="flex:1"></span>'+hb+'</div>'+wl.list
      :'<div style="display:flex;gap:8px;align-items:center;justify-content:space-between"><b>'+(w.fs?'⛶ '+E(gname(g))+' in full screen':'🎮 '+E(gname(g))+' is playing')+'</b><span>'+(w.fs?'<button style="'+bs+'background:#1e293b;color:#fff">Switch off</button> ':'')+hb+'</span></div>'
      +'<div style="color:#475569;font-size:12px;margin-top:2px">'+(w.game?'🎮 Class game: '+E(w.title)+(w.fs?' · ':''):'')+(w.fs?'until '+P.hm(P.eff().until):'')+'</div>'
      +wl.line+wl.list;
    if(f.dataset.h!==h){f.dataset.h=h;f.innerHTML=h}
    if(dock)frTop(f.offsetHeight);else if(!f.dataset.moving)place(f)};   // not while it is being dragged
  return P}
async function teacherSections(info){
  for(const [f,v] of [["el-sections","EL_SECTIONS"],["el-plan","EL_PLAN"]])if(!window[v])await new Promise(r=>{const sc=document.createElement("script");sc.src=new URL("shared/js/"+f+".js",ROOT).href;sc.onload=sc.onerror=r;document.head.append(sc)});
  const a=(window.EL_CATALOG||[]).find(x=>x.id===actId),secs=a&&(window.EL_SECTIONS||{})[a.id];
  if(!secs||!secs.length||/-my-real-routine$/.test(lsId))return;
  const ls=(window.EL_LS||[]).find(l=>l.id===lsId),course=lsId.split("-")[0];
  let grs=(window.EL_GROUPS||[]).filter(g=>elLsForGroup(ls,info,g.id));if(!grs.length)grs=(window.EL_GROUPS||[]).filter(g=>g.course===course);if(!grs.length)return;
  const k=a.id.replace("/","__"),ref=doc(db,"ls",lsId),all=secs.map(x=>x[0]),nm=id=>(secs.find(x=>x[0]===id)||[])[1]||id;
  let g=localStorage.getItem("el_t_secgroup");
  {const c=cmRead();if(c&&grs.some(x=>x.id===c.g))g=c.g}   // the class tab: its class mode's group (opened from the dashboard, the bar may remember another)
  if(!grs.some(x=>x.id===g))g=grs[0].id;
  let msg="",busy=false;
  const st=document.createElement("style");st.textContent=".el-tsec{margin:0 0 10px;padding:10px 14px;border:2px solid #a5b4fc;border-radius:12px;background:#eef2ff;font:14px system-ui,sans-serif;color:#1e1b4b}"
    +".el-tsec .r{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.el-tsec b{margin-right:4px}.el-tsec button{border:1px solid #c7d2fe;background:#fff;color:#3730a3;border-radius:999px;padding:3px 12px;cursor:pointer;font:600 13px system-ui,sans-serif}"
    +".el-tsec button.on{background:#4338ca;color:#fff;border-color:#4338ca}.el-tsec button.g{background:none;border-color:transparent;text-decoration:underline;font-weight:500}.el-tsec small{display:block;color:#475569;margin-top:6px}"
    +".el-tsec .w{margin-top:8px;padding:6px 10px;border-radius:8px;background:#fef2f2;color:#991b1b;font-weight:600}.el-tsec .w button{margin-left:6px}.el-tsec .m{margin-left:6px;color:#15803d;font-weight:600}.el-tsec .m.err{color:#b91c1c}"
    +".el-tsec .pl{margin-top:8px;padding-top:8px;border-top:1px dashed #a5b4fc}.el-tsec .pl button[data-cm]:not(.g){background:#0f766e;border-color:#0f766e;color:#fff}.el-tsec .now{color:#0f766e;font-weight:700}.el-tsec .pl button.fs.on{background:#1e293b;border-color:#1e293b;color:#fff}.el-tsec .fsl{flex-basis:100%;font-size:13px;color:#9a3412;font-weight:600}"
    +".el-gpl{flex-basis:100%;display:flex;flex-wrap:wrap;gap:4px 6px;margin-top:2px;font:600 12px system-ui,sans-serif}.el-gpl em{font-style:normal;padding:1px 8px;border-radius:999px;background:#fee2e2;color:#991b1b}.el-gpl em.y{background:#dcfce7;color:#166534}.el-gpl b{font-weight:800}"
    +".tab .el-tsw{display:inline-block;margin-left:6px;padding:0 6px;border-radius:999px;font-size:12px;line-height:18px;background:#dcfce7;border:1px solid #86efac;cursor:pointer;vertical-align:1px}"
    +".tab .el-tsw.off{background:#fee2e2;border-color:#fca5a5}.tab .el-tsw:hover{outline:2px solid #6366f1}.tab.el-toff{border-style:dashed!important;opacity:.75}";
  document.head.append(st);
  const locked=()=>((info.secLocked||{})[g]||{})[k]||[],gname=id=>(grs.find(x=>x.id===id)||{}).name||id;
  async function save(ids){if(busy)return;busy=true;
    const op=[...new Set([...(((info.secOpened||{})[g]||{})[k]||[]),...all.filter(x=>!ids.includes(x))])];
    try{await setDoc(ref,{secLocked:{[g]:{[k]:ids}},secOpened:{[g]:{[k]:op}}},{merge:true});
      for(const [f,v] of [["secLocked",ids],["secOpened",op]]){info[f]=Object.assign({},info[f]);info[f][g]=Object.assign({},info[f][g],{[k]:v})}msg="✓ Saved";}
    catch(e){console.warn("sections",e);msg="✗ Not saved: "+(e.code||e.message||e)}
    busy=false;draw();setTimeout(()=>{if(msg==="✓ Saved"){msg="";draw()}},2500)}
  async function openLp(){const ids=(window.EL_CATALOG||[]).filter(x=>x.ls===lsId&&(x===a||elLpOpen(x,info,g,true))).map(x=>x.id),L=elLpLocks(lsId,ids);
    try{await setDoc(ref,{open:{[g]:ids},locked:{[g]:L.locked},lockedKeys:{[g]:L.lockedKeys}},{merge:true});info.open=Object.assign({},info.open,{[g]:ids});msg="✓ Saved"}
    catch(e){console.warn("open",e);msg="✗ Not saved: "+(e.code||e.message||e)}draw()}
  // 🎓 Class mode (Roger, 6 Nov 2026, replaces 📌 Pull up): "Start class mode" opens this page in a new browser tab, the class tab for the
  // projector; the students of the group follow that tab wherever it goes (cmTeacher below) and this tab stays free for other things.
  const cmOpen=()=>{const now=Date.now(),until=(window.elClassEnd&&elClassEnd(g,now))||now+LOCK_MS,u=new URL(location.href);
    u.searchParams.set("elcm",g+"."+until);window.open(u.href,"_blank","noopener")};
  const cmStop=()=>setDoc(doc(db,"live",g),{go:null,fs:null},{merge:true}).then(()=>examEndIdle(g)).then(()=>{msg="✓ Class mode stopped"},e=>{msg="✗ Not saved: "+(e.code||e.message||e)}).then(draw);
  // 👥 who is in the class (fsPanel above): for the group picked in this bar; on the class tab the class mode's own panel shows instead
  const FP=fsPanel(()=>g,()=>draw(),()=>!cmOn);
  const fsWatch=()=>FP.watch(),fsE=()=>FP.eff(),fsRoll=()=>FP.roll(),fsHm=FP.hm,E=t=>String(t==null?"":t).replace(/</g,"&lt;");
  const fsToggle=()=>FP.toggle().then(m=>{msg=m;draw()});
  const fsFloat=()=>FP.float();
  // no full screen button any more (Roger, 7 Nov 2026): it is on during every class of the timetable and while class mode is on
  function fsRow(w){const x=fsE(),on=!!x;
    const {gone,never}=elWhoLeft(w);   // counts only: the names are in the panel at the top right, one tap away (Roger, 10 Nov 2026)
    return (w.active?'<div class="fsl">⛶ Full screen '+gname(g)+' · '+(on?'until '+fsHm(x.until):'🎮 in a game')+' · ✓ '+w.inn.length+' in · ✗ '+gone.length+' left · ⚪ '+never.length+' not here</div>':"")}
  // Has the group played this learning path's class games? (Roger, 8 Nov 2026: "see whether the group has played the games of the LP"):
  // under each 🎮 game button, every group of the course with ✓ + the day it was played or ✗ not yet, the group picked above in bold.
  // From ls/{id}.played[group][deck] (written by the game board, lab/game/host.js markPlayed), already in the LS doc this page reads: no extra reads.
  const plDay=ms=>new Date(+ms).toLocaleDateString("en-GB",{day:"numeric",month:"short"});
  function gamesPlayed(){const P=info.played||{};
    document.querySelectorAll('a[href*="host.html?deck="]').forEach(a=>{let id="";try{id=new URL(a.href).searchParams.get("deck")||""}catch(e){}if(!id)return;
      let s=a.querySelector(".el-gpl");if(!s){s=document.createElement("div");s.className="el-gpl";a.style.flexWrap="wrap";a.append(s)}
      const h=grs.map(x=>{const ms=(P[x.id]||{})[id],nm=x.id===g?"<b>"+E(x.name)+"</b>":E(x.name);
        return ms?'<em class="y">✓ '+nm+' · '+plDay(ms)+'</em>':'<em class="n">✗ '+nm+' · not yet</em>'}).join("");
      if(s.dataset.h!==h){s.dataset.h=h;s.innerHTML=h;s.title="Played in class by each group (✓ day / ✗ not yet)"}})}
  const toggle=id=>{const off=new Set(locked());off.has(id)?off.delete(id):off.add(id);save(all.filter(x=>off.has(x)))};
  function cmRow(){fsWatch();const x=FP.live&&FP.live.go,on=elCmOn(x),me=cmRead(),mine=me&&me.g===g;
    return '<div class="r pl"><b>🎓 Class mode for '+gname(g)+'</b>'
      +(mine?'<span class="now">This tab is the class tab: '+gname(g)+' follows it'+(x&&x.until?' until '+fsHm(x.until):'')+'</span><button class="g" data-cm="-">⏹ Stop class mode</button>'
        :on?'<span class="now">On: they follow your class tab ('+E(x.t||"")+(x.pn?" · "+E(x.pn):"")+')</span><button class="g" data-cm="-">⏹ Stop class mode</button><button data-cm="1">Start it here instead</button>'
        :'<button data-cm="1" title="Opens this page in a new tab for the projector. Every student of '+gname(g)+' goes wherever that tab goes (page and tab) until you stop it or the class ends. Keep using this tab for anything else.">Start class mode (new tab)</button>')
+'</div>'+((r=>r?'<div class="r pl">'+r+'</div>':'')(fsRow(fsRoll())))}
  function draw(){
    const t0=document.querySelector(".tab[data-panel]"),nav=t0&&t0.parentElement;if(!nav)return;
    // the copy el-app.js drew at once from el_tsec_<page path> (tsecEarly): the real bar takes its place now
    const early=document.getElementById("el-tsec-early");
    let bar=document.getElementById("el-tsec");
    const host=document.querySelector(".eltsec-host");   // the learning path's left column (el-app.js) has a place for it, else above the tabs
    if(!bar||(host?bar.parentElement!==host:bar.nextElementSibling!==nav)){if(bar)bar.remove();bar=document.createElement("div");bar.id="el-tsec";bar.className="el-tsec";if(host)host.append(bar);else nav.before(bar);
      bar.onclick=e=>{const b=e.target.closest("button");if(!b)return;e.preventDefault();
        if(b.dataset.g){g=b.dataset.g;origSet.call(localStorage,"el_t_secgroup",g);msg="";draw()}
        else if(b.dataset.all)save(b.dataset.all==="1"?[]:all.slice());else if(b.dataset.lp)openLp();else if(b.dataset.fs)fsToggle();else if(b.dataset.cm)b.dataset.cm==="-"?cmStop():cmOpen()}}
    if(early){document.querySelectorAll(".el-tsw-early").forEach(e=>e.remove());early.replaceWith(bar)}
    const off=locked(),n=all.length-off.filter(x=>all.includes(x)).length;
    const html='<div class="r"><b>🔓 Sections open for</b>'+grs.map(x=>'<button data-g="'+x.id+'" class="'+(x.id===g?"on":"")+'">'+x.name+'</button>').join("")
      +'<span>· '+n+' of '+all.length+' open</span><button class="g" data-all="1">open all</button><button class="g" data-all="0">close all</button>'
      +(msg?'<span class="m'+(msg[0]==="✗"?" err":"")+'">'+msg+'</span>':"")+'</div>'
      +'<small>Click 🔓 or 🔒 on a tab to open or close that section for '+gname(g)+'. Students see a closed section read-only, with their saved answers; one you opened before stays doable for students who have not finished it. Teacher only: students never see this bar.</small>'
      +cmRow()
      +(elLpOpen(a,info,g,true)?"":'<div class="w">⚠️ This whole learning path is locked for '+gname(g)+': students cannot open it yet.<button data-lp="1">✔ Open it for '+gname(g)+'</button></div>');
    if(bar.dataset.h!==html){bar.innerHTML=html;bar.dataset.h=html;try{origSet.call(localStorage,"el_tsec_"+relPath,JSON.stringify({h:html,css:st.textContent,all,off}))}catch(e){}}   // for el-app.js tsecEarly on the next visit
    fsFloat()
    gamesPlayed();
    document.querySelectorAll(".tab[data-panel]").forEach(t=>{const id=t.dataset.panel;if(!all.includes(id))return;const on=!off.includes(id);
      let sw=t.querySelector(".el-tsw");if(!sw){sw=document.createElement("span");sw.className="el-tsw";sw.setAttribute("role","button");
        sw.onclick=e=>{e.stopPropagation();e.preventDefault();toggle(id)};t.append(sw)}
      const tx=on?"🔓":"🔒",ti=(on?"Open":"Closed")+" for "+gname(g)+": click to "+(on?"close":"open")+" “"+nm(id)+"”";
      if(sw.textContent!==tx)sw.textContent=tx;if(sw.title!==ti)sw.title=ti;sw.classList.toggle("off",!on);t.classList.toggle("el-toff",!on)})}
  draw();new MutationObserver(()=>draw()).observe(document.body,{childList:true,subtree:true});
}
// Core by default for the teacher (Roger, 8 Nov 2026: "is it possible to see core as a default"): a learning path opens on the Core (B1)
// route in teacher mode, whatever level was picked last time; the Level buttons still switch it for this visit. Students keep their
// own route (applyLevel), and with none yet Base. Waits for the page's route buttons to be ready (ls2-engine.js init sets onclick).
function teacherCore(){let n=0;const go=()=>{const b=document.querySelector('.route[data-level="safe"]');
  if(b&&b.onclick){if(!b.classList.contains("active"))b.click();return}if(++n<60)setTimeout(go,150)};go()}
// A link to a section (activity.html#read, from the to-do list) opens that tab once the page is ready.
function openHashTab(){const id=decodeURIComponent(location.hash.slice(1));if(!id)return;const t=[...document.querySelectorAll(".tab[data-panel]")].find(x=>x.dataset.panel===id);if(t)t.click()}
addEventListener("hashchange",openHashTab);

// Submit (lock) an activity from any page, using the progress saved in the cloud.
async function submitActivity(a){
  const u=user;if(!u||!isStudent(u))return false;
  const p=await getDoc(doc(db,"students",u.uid,"progress",a.ls)).catch(()=>null),data=p&&p.exists()?p.data().data||{}:{};
  const sc=elPoints(a,k=>data[k]);
  const r={ls:a.ls,activity:a.id,score:sc,max:a.points,done:sc,locked:true,markedDone:true,updated:serverTimestamp()};
  await setDoc(doc(db,"students",u.uid,"results",resKey(a.id)),r,{merge:true});rcSaved(u.uid,resKey(a.id),r);
  return true;
}

// Announcements for this student (shared/js/el-announce.js): the ones sent to their group and the ones sent to them (testers are in every
// one's uids). Two queries, because firestore.rules let a student read only those; the teacher reads them all.
async function myAnnouncements(u){
  const c=collection(db,"announcements"),out={},add=s=>s.forEach(x=>out[x.id]=Object.assign({id:x.id},x.data()));
  if(isTeacher(u)){add(await getDocs(c));return Object.values(out)}
  const g=viewGroup(u)||myGroup;
  await Promise.all([getDocs(query(c,where("uids","array-contains",u.uid))).then(add),g&&getDocs(query(c,where("groups","array-contains",g))).then(add)].filter(Boolean));
  // scheduled ones (at = ms, Roger 2 Nov 2026: "program announcements") reach the student only from that time, dated then (card and board)
  // late answers on a private message (el-announce.js lateHold, Roger 14 Nov 2026): a teacher item dated after now stays hidden until then,
  // and the card it would bring back waits too (the teacher's answer removed read.{uid}: seen as read until the item's time)
  const now=Date.now();
  return Object.values(out).filter(a=>!(a.at>now)).map(a=>{if(a.at)a.created=a.at;
    const th=a.thread||[],vis=th.filter(x=>!(x.by==="t"&&x.at>now));
    if(vis.length<th.length){a.thread=vis;if(!(a.read||{})[u.uid])a.read=Object.assign({},a.read,{[u.uid]:"later"})}
    return a});
}
// The student's answer to a private message (to:"one"; Roger, 7 Nov 2026: "they should be able to answer back"): one more thread item, read
// now, sAt = when (the teacher's 15-minute email looks for new sAt). firestore.rules allows exactly this to the student it was sent to.
function annReply(u,id,text){text=String(text||"").trim().slice(0,1000);if(!u||!text||AS)return Promise.reject(new Error("nothing to send"));
  return updateDoc(doc(db,"announcements",id),{thread:arrayUnion({by:"s",uid:u.uid,text,at:Date.now()}),["read."+u.uid]:serverTimestamp(),sAt:serverTimestamp()})
    .then(r=>{wakeFixer(u);return r})}   // the instant task writes the teacher a draft answer (Roger, 20 Nov 2026), never sent by itself
// Problem reports (bottom bar "⚠️ Problema / Problem"): problems/{id}, read only by the teacher in the dashboard.
// Catalan for Insecure and with no route; English for Safe and Daring (LS pages: the route; the board: its own language).
// Outside an LS page (course pages, English Lab, Practice) the route is the one of the course's latest LS (homeLevel), so a Core or
// Plus student gets the Problem window and the cards in English there too. The board keeps its own language (the LS on screen).
const repEn=()=>{const l=myLevel||homeLevel;return l?!elCa(l):onBoard&&document.documentElement.lang==="en"};
// A screenshot goes in its own document (problemShots/{same id}), so the dashboard loads it only when the teacher opens it.
// The teacher has the same button (Roger, 13 Nov 2026: "I need a problem button available for the teacher"): on the dashboard, the class tab
// and every page, in English. The report says teacher:true (firestore.rules: only the teacher's own account) and the group is the class
// mode's group on the class tab; the same instant task reads it (docs/general/problem-reports-auto.md, "The teacher's own reports").
const reportProblem=(u,x)=>{const tch=isTeacher(u)&&!AS;return report({en:repEn(),teacher:tch,where:x&&x.where,save:o=>{
  const {shot,shotFrom}=o,ref=doc(collection(db,"problems")),b=writeBatch(db);delete o.shot;delete o.shotFrom;
  b.set(ref,Object.assign(o,{uid:u.uid,email:(u.email||"").toLowerCase(),name:u.displayName||"",group:tch?((cmRead()||{}).g||null):myGroup||null,ls:lsId,activity:actId,route:tch?null:myLevel,shot:shot?shotFrom:null,created:serverTimestamp()},tch?{teacher:true}:{}));
  if(shot)b.set(doc(db,"problemShots",ref.id),{uid:u.uid,img:shot,created:serverTimestamp()});
  return b.commit().then(r=>{wakeFixer(u);return r})}})};
// wakeFixer (el-report.js): once the report is saved, the instant task that reads new reports starts (also from the class game player).

// Suggestions to improve the site (bottom bar "💡 Idea"): suggestions/{id}, read only by the teacher in the dashboard. Same language as the Problem window.
function suggest(u){
  const en=repEn(),t=(ca,e)=>en?e:ca,d=document.createElement("dialog"),bs="border:0;border-radius:999px;padding:6px 14px;cursor:pointer;font:inherit;";
  d.style.cssText="border:0;border-radius:14px;padding:16px 18px;max-width:480px;width:calc(100% - 32px);box-shadow:0 10px 40px #0004;font:15px system-ui,sans-serif;color:#0f172a;background:#fff";
  d.innerHTML='<h3 style="margin:0 0 6px"></h3><p style="margin:0 0 8px;color:#475569"></p><textarea maxlength="1000" rows="5" style="width:100%;box-sizing:border-box;font:inherit;padding:6px;border:1px solid #cbd5e1;border-radius:8px"></textarea>'
    +'<p data-n style="margin:4px 0 0;color:#64748b;font-size:13px"></p><div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px"><button data-x></button><button data-ok></button></div>';
  d.querySelector("h3").textContent="💡 "+t("Suggereix una millora","Suggest an improvement");
  d.querySelector("p").textContent=t("Què milloraries de la web? Una idea, una cosa que costa d'entendre o que t'agradaria tenir. (Si alguna cosa no funciona, fes servir ⚠️ Problema.) El professor ho llegirà.","What would you improve on the website? An idea, something that is hard to understand or that you would like to have. (If something does not work, use ⚠️ Problem.) Your teacher will read it.");
  const ta=d.querySelector("textarea"),n=d.querySelector("[data-n]"),x=d.querySelector("[data-x]"),ok=d.querySelector("[data-ok]");
  x.style.cssText=bs+"background:#e2e8f0;color:#0f172a";x.textContent=t("Cancel·la","Cancel");x.onclick=()=>d.close();
  ok.style.cssText=bs+"background:#0f766e;color:#fff";ok.textContent=t("Envia","Send");
  const count=()=>n.textContent=ta.value.length+" / 1000";ta.oninput=count;count();
  ok.onclick=async()=>{const text=ta.value.trim();if(!text){ta.focus();return}
    ok.disabled=true;
    try{await setDoc(doc(collection(db,"suggestions")),{uid:u.uid,email:(u.email||"").toLowerCase(),name:u.displayName||"",group:myGroup||null,
        page:location.pathname.replace(/^.*?\/English-lab\//i,"").slice(0,200)||"index.html",text,created:serverTimestamp()});
      wakeFixer(u);   // the instant task writes the teacher a draft reply (Roger, 20 Nov 2026), never sent by itself
      d.innerHTML="";const m=document.createElement("p");m.style.cssText="margin:0 0 12px";m.textContent=t("Gràcies! El professor llegirà el teu suggeriment.","Thank you! Your teacher will read your suggestion.");
      const c=document.createElement("button");c.style.cssText=bs+"background:#0f766e;color:#fff";c.textContent="OK";c.onclick=()=>d.close();d.append(m,c)}
    catch(e){console.warn("suggestion",e);ok.disabled=false;alert(t("No s'ha pogut enviar. Torna-ho a provar més tard.","It could not be sent. Please try again later."))}};
  d.addEventListener("close",()=>d.remove());
  document.body.append(d);d.showModal();ta.focus();
}

// BAR-SPACE-START
// The bar floats over the bottom right corner, so at the end of a page it covered the last card (Roger, 8 Nov 2026: "students can't
// see the bottom side": the board's "About this LS"). An empty block as tall as the bar is kept at the end of the page while the bar
// floats, so the page scrolls on until everything is above it. None when the bar sits in the page (phones) or is hidden.
// Pages with a sticky side menu (.app: the board, LS homes, English Lab, Practise) get it at the end of the main column, not of the
// page: below .app it pushed the side menu up and cut off its top.
function keepBarSpace(el){
  const sp=document.createElement("div");sp.id="el-cloud-bar-space";sp.setAttribute("aria-hidden","true");sp.style.cssText="height:0;pointer-events:none";
  (document.querySelector(".app>.page,.app>main")||document.body).appendChild(sp);
  const fit=()=>{const cs=getComputedStyle(el),h=cs.position==="fixed"&&cs.display!=="none"?Math.ceil(el.getBoundingClientRect().height)+24:0;
    sp.style.height=h+"px";document.documentElement.style.setProperty("--el-bar-space",h+"px")};   // learning paths use the variable (el-app.css)
  fit();addEventListener("resize",fit);if(window.ResizeObserver)new ResizeObserver(fit).observe(el);
}
// BAR-SPACE-END
function bar(){
  const el=document.createElement("div");el.id="el-cloud-bar";
  el.style.cssText="position:fixed;right:10px;bottom:10px;z-index:10002;background:#fff;border:1px solid #cbd5e1;border-radius:999px;padding:6px 12px;font:13px system-ui,sans-serif;box-shadow:0 2px 8px #0002;display:flex;gap:8px;align-items:center";
  document.body.appendChild(el);keepBarSpace(el);
  // until Firebase has said who is signed in, the chip stays empty: it showed "Not signed in · Sign in" for a second to a signed-in
  // student on every page (Roger, 7 Nov 2026: "all pages still pop up in between")
  return u=>{el.innerHTML="";el.style.visibility=authKnown?"":"hidden";if(!authKnown)return;
    const b=(t,f)=>{const x=document.createElement("button");x.textContent=t;x.onclick=f;x.style.cssText="border:0;background:#0f766e;color:#fff;border-radius:999px;padding:4px 10px;cursor:pointer";return x};
    // the same Problem window for 📓 the notebook, which covers this bar (el-notebook.js ⚠️; not in the teacher's student view)
    window.elReport=u&&!AS&&(isStudent(u)||isTeacher(u))?(x=>reportProblem(u,x)):null;
    if(!u)el.append("Not signed in ",b("Sign in",login));
    // A student (and the teacher's 👁 student view) (Roger, 25 Nov 2026: "their name can go just below my name"; "students see the icons at the
    // bottom right and when they hover them over they see the names"): the name sits under "English with Roger" in the side menu (in the bar
    // only on a page without one) and the bar shows only icons, each with its name on hover (and as its label for screen readers)
    const ic=(i,tip,f,bg)=>{const x=b(i,f);x.className="elcb-i";x.dataset.tip=tip;x.setAttribute("aria-label",tip);x.style.background=bg||"#0f766e";x.style.padding="4px 9px";return x};
    tipCss();
    if(AS||u&&isStudent(u)&&!isTeacher(u)){const nm=AS?(AS.name||AS.email||""):(u.displayName||u.email||"");window.EL_WHO_NAME=nm;if(!elWhoPlace()){const sp=document.createElement("span");sp.className="elcb-nm";sp.textContent=nm;el.append(sp," ")}}
    // the teacher's own name too, under "Teacher dashboard" in the side menu, no longer in the bar (Roger, 25 Nov 2026: "this name should
    // appear below teachers dashboar"); in the bar only on a page without a side menu (a phone, a game board)
    else if(u&&isTeacher(u)){window.EL_WHO_NAME=u.displayName||u.email||"";if(!elWhoPlace()){const sp=document.createElement("span");sp.className="elcb-nm";sp.textContent=window.EL_WHO_NAME;el.append(sp," ")}}
    else{window.EL_WHO_NAME="";elWhoPlace()}
    if(!u){}
    else if(AS){const ca=elCa(myLevel||homeLevel),no=()=>{};   // the student's own bar; its buttons do nothing here
      const mz=mzBar(ca);if(mz)el.append(mz," ");
      if(nbA)el.append(nbA," ");   // 📓 My notebook (nbFab below)
      el.append(ic("⚠️",ca?"Avisa d'un problema":"Report a problem",no,"#b45309")," ",ic("💡",ca?"Suggereix una idea":"Suggest an idea",no)," ");
      if(nbellEl)el.append(nbellEl," ");   // the student's own 📬, as they see it (shared/js/el-notify.js)
      if(isTeacher(u)&&bellEl)el.append(bellEl," ");   // the teacher's 🔔 here too (Roger, 25 Nov 2026: "notifications should also appear here")
      el.append(ic("✕","Exit the student view: back to your dashboard",asExit,"#dc2626"))}
    else if(isStudent(u)&&!isTeacher(u)){
      const mz=mzBar(!repEn());if(mz)el.append(mz," ");
      if(nbA)el.append(nbA," ");   // 📓 My notebook (nbFab below)
      el.append(ic("⚠️",repEn()?"Report a problem":"Avisa d'un problema",()=>reportProblem(u),"#b45309")," ",ic("💡",repEn()?"Suggest an idea":"Suggereix una idea",()=>suggest(u))," ");
      if(nbellEl)el.append(nbellEl," ");   // 📬 their notifications (shared/js/el-notify.js)
      if(isTester(u))testerSel(u,el);
      el.append(ic("🚪",repEn()?"Sign out":"Tanca la sessió",logout,"#475569"))}
    else{if(isTeacher(u)){const mz=mzBar(false);if(mz)el.append(mz," ")}   // 🧑‍🎨 the teacher's own ⚡ streak too (Roger, 25 Nov 2026: "the mascot shoulb always visble here")
      if(!isTeacher(u))el.append(u.displayName||u.email," ");
      // no "My dashboard" / "Games" links here for students: the left menu already has both (Roger, 7 Nov 2026: "we don't need this
      // mini menu on the bottom"); the teacher keeps the Dashboard link
      if(isTeacher(u)){const a=document.createElement("a");a.textContent="Dashboard";a.href=dashHere;el.append(a," ")}
      if(nbA)el.append(nbA," ");   // 📓 My notebook (nbFab below)
      if(isStudent(u)){const p=b("⚠️ "+(repEn()?"Problem":"Problema"),()=>reportProblem(u));p.style.background="#b45309";p.title=repEn()?"Report a problem: something on the website does not work":"Avisa d'un problema: alguna cosa de la web no funciona";el.append(p," ")}
      else if(isTeacher(u)){const p=b("⚠️ Problem",()=>reportProblem(u));p.style.background="#b45309";p.title="Report a problem on this page: Beltran looks at it straight away (technical ones are fixed and you get an email)";el.append(p," ")}
      if(isStudent(u)){const i=b("💡 Idea",()=>suggest(u));i.title=repEn()?"Suggest an improvement to the website":"Suggereix una millora per a la web";el.append(i," ")}
      if(isTeacher(u)&&bellEl)el.append(bellEl," ");
      if(isTester(u))testerSel(u,el);
      el.append(b("Sign out",logout))}};
}
// 🧑‍🎨 The streak mascot in the bar (Roger, 25 Nov 2026, on the ✅ To do button and the bottom-right icons: "can they have the mascot here
// too? with the numbers"): Roger's avatar in the mood of the student's 🧠 Flashcards streak with the ⚡ number, on every student page
// except the board (where it sits beside 🎯 My level) and exams, recall checkpoints and the sample exam; a tap opens 🧠 Flashcards. No reads:
// the flashcards copy in this browser (el_flash_<uid>), as on the board; the teacher's 👁 student view reads the student's copy once a tab.
const noCorner=()=>!!window.EL_EXAM||/\/(exam|recall-checkpoint[^/]*|sample-exam)\.html$/.test(location.pathname);
let mzReady=null,mzAs=null;
// The account's copy of the flashcards (students/{uid}/flashcards/all), merged into this browser's, so the ⚡ also counts the cards studied on
// another device (the phone, the Chromebook): read at most once every 30 minutes per browser (el_flash_chk_<uid>), then the bar and the
// board's mascot redraw (event el-flash-sync). Problem seen 25 Nov 2026: students studied and their ⚡ stayed at 0.
function mzSync(uid){const k="el_flash_chk_"+uid;let t=0;try{t=+localStorage.getItem(k)||0}catch(e){}
  if(!uid||Date.now()-t<30*60e3)return;try{localStorage.setItem(k,String(Date.now()))}catch(e){}
  getDoc(doc(db,"students",uid,"flashcards","all")).then(s=>{if(!s.exists()||!window.ELFlashDeck)return;const lk="el_flash_"+uid;let loc=null;
    try{loc=JSON.parse(localStorage.getItem(lk)||"null")}catch(e){}
    const m=window.ELFlashDeck.merge(loc||{},JSON.parse(s.data().p||"{}"));try{localStorage.setItem(lk,JSON.stringify(m))}catch(e){}
    dispatchEvent(new CustomEvent("el-flash-sync",{detail:{uid}}));draw(user)}).catch(e=>console.warn("flashcards read",e))}
function mzBar(ca){
  if(noCorner())return null;   // every page, the board too (Roger, 25 Nov 2026: "the mascot should be everywhere"); never in exams
  if(!window.ELMascot||!window.ELFlashDeck){if(!mzReady)mzReady=loadScript("shared/js/el-flashdeck.js?v=20261125d",()=>window.ELFlashDeck).then(()=>loadScript("shared/js/el-mascot.js?v=20261126",()=>window.ELMascot)).then(()=>{if(window.ELMascot)draw(user)}).catch(e=>console.warn("mascot",e));return null}
  let P=null;
  if(AS){if(!mzAs||mzAs.uid!==AS.uid){const uid=AS.uid,k="el_mz_as_"+uid;mzAs={uid,P:{}};
      try{const c=JSON.parse(sessionStorage.getItem(k)||"null");if(c&&Date.now()-c.t<30*60e3){mzAs.P=c.P;}else getDoc(doc(db,"students",uid,"flashcards","all")).then(s=>{mzAs.P=s.exists()?JSON.parse(s.data().p||"{}"):{};
        try{sessionStorage.setItem(k,JSON.stringify({t:Date.now(),P:mzAs.P}))}catch(e){}draw(user)}).catch(()=>{})}catch(e){}}
    P=mzAs.P}
  else if(user)mzSync(user.uid);
  const M=window.ELMascot,x=M.data(AS?null:(user||{}).uid,P);if(!x)return null;
  const a=document.createElement("a");a.className="elcb-i elcb-mz";a.href=new URL("lab/practice.html"+(AS?"?student="+encodeURIComponent(AS.uid):"")+"#deck",ROOT).href;
  const n=x.st.n,tip=ca?"🧠 Targetes · ⚡ "+n+(n===1?" dia seguit":" dies seguits"):"🧠 Flashcards · ⚡ "+n+(n===1?" day in a row":" days in a row");
  a.dataset.tip=tip;a.dataset.ca=ca?"1":"";a.setAttribute("aria-label",tip);a.innerHTML=M.badge(n,"sm")+M.img(M.mood(x),50,"");
  return a}
// the flashcards page calls it after saving, so the ⚡ number and the mood follow the cards just studied without a reload
// (problem report, 4ESOA, 25 Nov 2026: the bar still said ⚡ 0 after studying)
window.elMascotRefresh=()=>{const old=document.querySelector(".elcb-mz");if(!old)return;const n=mzBar(old.dataset.ca==="1");if(n)old.replaceWith(n)};
// 📬 The student's own notifications (Roger, 25 Nov 2026: "will students see notifications, like you have the exam corrected…";
// shared/js/el-notify.js): corrections, answers, redo, exam results, problem answers and announcements, as the student sees them. Built
// from the reads the cards already make (results copy, students/{uid}, the two card loads): nothing held shows early, no reads of its own.
let nbellP=null,nbellEl=null,NTM=null;
const nbFeed=f=>{if(nbellP)nbellP.then(nb=>{if(nb)f(nb)}).catch(e=>console.warn("notifications",e))};
// Its language is the student's route: on the board the route was not known yet when the 📬 was built, so a Core student's 📬 came
// out in Catalan (found by the real-use tests, 25 Nov 2026). findHomeLevel reads the levels the board reads anyway (myLevels, once).
function nbellStart(u){const id=AS?AS.uid:u.uid,ro=!!AS;
  return (myLevel||homeLevel?Promise.resolve():findHomeLevel(AS||u)).then(()=>import("./el-notify.js")).then(m=>{NTM=m;const nb=m.studentBell({uid:id,en:repEn(),ro});nbellEl=nb.el;draw(user);
    loadScript("shared/js/el-catalog.js",()=>window.EL_CATALOG).then(()=>loadScript("shared/js/el-grading.js",()=>window.EL_GRADING))
      .then(()=>Promise.all([import("./el-corrections.js"),import("./el-exam-notice.js"),myResults(id),myDoc(id)]))
      .then(([C,X,rs,me])=>m.resultItems({rs,me,corr:C.corrList,examSig:X.examSig,course:courseOf(myGroup),root:ROOT,board:BOARD,en:repEn(),
        name:(aid,step)=>{for(const g of Object.values(window.EL_GRADING||{})){const x=(g.moments||[]).find(y=>y.a===aid&&y.step===step);if(x)return x.name}return null},
        visible:async ls=>{if(!myGroup)return false;const i=await lsInfo(ls);return i.status!=="hidden"&&elLsForGroup((window.EL_LS||[]).find(x=>x.id===ls),i,myGroup)},
        saveFb:ro?null:o=>setDoc(doc(db,"students",id),{fbSeen:o},{merge:true}),
        saveExam:ro?null:(ls,v)=>setDoc(doc(db,"students",id),{examSeen:{[ls]:v}},{merge:true})}))
      .then(items=>nb.live(items)).catch(e=>console.warn("notifications",e));
    return nb})}
function testerSel(u,el){{const s=document.createElement("select");s.title="Tester: see the site as a student of this group";
        s.innerHTML='<option value="">View: tester (everything)</option>'+(window.EL_GROUPS||[]).map(g=>'<option value="'+g.id+'">View as '+g.name+'</option>').join("");
        s.value=viewGroup(u)||"";s.onchange=()=>{origSet.call(localStorage,"el_view",s.value);location.reload()};el.append(s," ");
        const vg=viewGroup(u);if(vg){const c=courseOf(vg),lv=document.createElement("select");lv.title="Tester: see the site as a student on this level";
          lv.innerHTML='<option value="">Level: my own route</option>'+(window.EL_LEVELS||[]).filter(x=>x.id!=="native"||c==="4eso").map(x=>'<option value="'+x.id+'">'+(window.elLevelLabel?elLevelLabel(c,x.id):x.name)+'</option>').join("");
          lv.value=viewLevel(u)||"";lv.onchange=()=>{origSet.call(localStorage,"el_view_level",lv.value);location.reload()};el.append(lv," ")}}
}
// the student's name under "English with Roger" in whichever side menu the page has; el-app.js calls it again after drawing its menu.
// true when the name is on screen
window.elWhoPlace=()=>{document.querySelectorAll(".el-who").forEach(e=>e.remove());const nm=window.EL_WHO_NAME;if(!nm)return false;
  const br=[...document.querySelectorAll(".elrail .elr-brand,aside.side>.brand,aside.side>.elmtop>.brand,aside.sidebar>.brand,nav.tside>.brand")];
  // in the icon strip of an LS (elMiniRail) the brand sits in the ☰ row: the name goes under that row, not inside it, where it was
  // squeezed into a few pixels and broke letter by letter (problem report, 4ESOB, 25 Nov 2026)
  br.forEach(e=>{const d=document.createElement("div");d.className="el-who";d.textContent=nm;(e.parentElement.classList.contains("elmtop")?e.parentElement:e).after(d)});
  // a menu drawn after the bar (the dashboard's, teacher.html) takes the name out of the bar
  const on=br.some(e=>e.offsetParent);if(on)document.querySelectorAll("#el-cloud-bar .elcb-nm").forEach(e=>e.remove());return on};
const elWhoPlace=()=>window.elWhoPlace();
// the icons' names on hover (bar above) and the student's name under "English with Roger"
function tipCss(){if(document.getElementById("elcb-css"))return;const st=document.createElement("style");st.id="elcb-css";
  st.textContent='#el-cloud-bar .elcb-i{position:relative;font-size:15px;line-height:1.2}#el-cloud-bar .elcb-i:hover:after,#el-cloud-bar .elcb-i:focus-visible:after{content:attr(data-tip);position:absolute;right:0;bottom:calc(100% + 9px);background:#0f172a;color:#fff;font:600 12px/1.3 system-ui,sans-serif;padding:5px 9px;border-radius:8px;white-space:nowrap;box-shadow:0 4px 12px #0003;pointer-events:none;z-index:2}'
    +'#el-cloud-bar .elcb-mz{display:inline-flex;align-items:center;gap:3px;text-decoration:none;margin:-22px 2px -4px 0;padding:0;background:none}#el-cloud-bar .elcb-mz .elmz-img{width:50px!important;height:50px!important}#el-cloud-bar .elcb-mz:hover .elmz-img{transform:translateY(-2px) rotate(-2deg)}#el-cloud-bar .elcb-mz .elmz-badge{font-size:14px}@media (max-width:640px){html body #el-cloud-bar[style]{margin-bottom:76px!important}#el-cloud-bar .elcb-nm{flex-basis:100%;text-align:center}#el-cloud-bar .elcb-mz{margin-top:-14px}#el-cloud-bar .elcb-mz .elmz-img{width:44px!important;height:44px!important}}'
    +'.el-who{flex:none;padding:0 10px;margin:-2px 0 10px;font:600 .88rem/1.35 Inter,system-ui,sans-serif;color:#475569!important;overflow-wrap:anywhere}aside.side>.el-who{margin:-15px 0 0}aside.sidebar>.el-who{margin:-6px 0 14px}nav.tside>.el-who{padding:0 12px;margin:-10px 0 8px}@media (max-width:980px){nav.tside>.el-who{display:none}}body.elmini .elmtop+.el-who{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;overflow-wrap:normal;padding:0 8px 0 56px;margin:-10px 0 0;opacity:0;transition:opacity .12s ease}body.elmini :is(.elrail,aside.side):is(.elopen,:has(:focus-visible))>.elmtop+.el-who{opacity:1;transition-delay:.12s}@media (hover:hover){body.elmini :is(.elrail,aside.side):hover>.elmtop+.el-who{opacity:1;transition-delay:.27s}}@media (max-width:980px){body.elmini .elmtop+.el-who,.elrail>.el-who{display:none}}@media print{.el-who{display:none}}';
  document.head.appendChild(st)}
// Every page's own menu gets a link to the board ("My activities") for a signed-in student, or to the dashboard for the teacher,
// next to its Home link: header menu (course and LS pages), side and phone menus (Home, English Lab), top bar of activity pages.
function menuLink(u){
  document.querySelectorAll("[data-el-board]").forEach(e=>e.remove());
  if(!u||onBoard||onDash||!(isStudent(u)||isTeacher(u)))return;
  const teach=isTeacher(u)&&!AS,txt=teach?"Dashboard":elCa(myLevel||homeLevel)?"El meu tauler":"My dashboard";
  const add=(home,cls,icon)=>{if(!home)return;const a=document.createElement("a");a.dataset.elBoard="";a.className=cls;a.href=teach?dashHere:boardUrl();a.textContent=icon+txt;home.after(a)};
  document.querySelectorAll(".navlinks").forEach(n=>add(n.querySelector(":scope>a"),"",""));
  document.querySelectorAll(".nav-tabs,.mobile-tabs").forEach(n=>add(n.querySelector(":scope>.tab-btn"),"tab-btn",""));
  document.querySelectorAll(".lp-home-link").forEach(h=>add(h,"lp-home-link","☰ "));
  document.querySelectorAll(".site-header .home-link").forEach(h=>add(h,"home-link",""));
}
// The side and phone menus (English Lab, Practise) for a student, the teacher's student view and the tester in a group's view (Roger,
// 4 Nov 2026: "from this menu they should see: Go to the current Learning Situation, All LS, My activities and English Lab"). Home,
// Courses and Learning Situations go (they only lead back to the board); the current LS is the board's: the group's LS by the time plan
// (ELWeek.now), else its first open one, never a hidden one or one not assigned to the group. All LS = the course page.
// No new reads: lsInfo is the same cached ls/{id} read the LS dropdown and the to-do list make.
async function sideMenu(u){
  const navs=document.querySelectorAll(".nav-tabs,.mobile-tabs");
  document.querySelectorAll("[data-el-side]").forEach(e=>e.remove());
  document.querySelectorAll("[data-el-side-hid]").forEach(e=>{e.hidden=false;delete e.dataset.elSideHid});
  if(!navs.length||!u||onBoard||onDash||!myGroup||(!AS&&(!isStudent(u)||seesAll(u))))return;
  const course=courseOf(myGroup);if(!course)return;
  await Promise.all([loadScript("shared/js/el-plan.js",()=>window.EL_PLAN),loadScript("shared/js/el-week.js",()=>window.ELWeek)]);
  const mine=(window.EL_LS||[]).filter(l=>l.course===course),info={};
  await Promise.all(mine.map(async l=>{info[l.id]=await lsInfo(l.id)}));
  const vis=mine.filter(l=>info[l.id].status!=="hidden"&&elLsForGroup(l,info[l.id],myGroup));
  const nowId=window.ELWeek&&(ELWeek.now(myGroup)||{}).ls,cur=vis.find(l=>l.id===nowId)||vis.find(l=>info[l.id].status==="open")||vis[0];
  const ca=elCa(myLevel||homeLevel),href=p=>new URL(p,ROOT).href,root=href("index.html");
  document.querySelectorAll("[data-el-side]").forEach(e=>e.remove());   // a second call may have finished first
  navs.forEach(n=>{
    n.querySelectorAll(":scope>.tab-btn").forEach(a=>{const h=a.getAttribute("href");if(!h)return;const x=new URL(h,location.href);
      if(x.origin+x.pathname===root||x.href===ROOT.href){a.hidden=true;a.dataset.elSideHid=""}});
    const mk=(txt,h,sub)=>{const a=document.createElement("a");a.className="tab-btn";a.dataset.elSide="";a.href=h;a.textContent=txt;
      if(sub){a.title=sub;if(n.classList.contains("nav-tabs")){const s=document.createElement("small");s.textContent=sub;s.style.cssText="display:block;font-weight:600;opacity:.75;margin-top:2px";a.append(s)}}return a};
    const items=[];
    if(cur)items.push(mk(ca?"Learning Situation actual":"Current Learning Situation",href(cur.course+"/"+cur.id.slice(cur.course.length+1)+"/index.html"),window.elLsName?elLsName(cur):cur.title.replace(/^\S+ · /,"")));
    items.push(mk(ca?"Totes les Learning Situations":"All Learning Situations",href(course+"/index.html")));
    const at=n.querySelector(":scope>[data-el-board]")||n.querySelector(":scope>.tab-btn:not([hidden])");
    items.forEach(i=>at?at.before(i):n.append(i));
  });
}
// Learning Situations dropdown (.ls-dropdown, course and LS pages): a student, and the tester in a group's view, sees only their own
// course with the LSs assigned to their group that are not hidden; the other courses and the "Soon" ones go (Roger, 26 Oct 2026).
async function lsMenu(u){
  const dds=document.querySelectorAll(".ls-dropdown");
  if(!dds.length||!u||(!AS&&(!isStudent(u)||seesAll(u)))||!myGroup)return;
  const course=courseOf(myGroup),home=new URL(course+"/",ROOT).href,norm=h=>new URL(h,location.href).href.replace(/index\.html$/,""),ok={};
  await Promise.all((window.EL_LS||[]).filter(l=>l.course===course).map(async l=>{const i=await lsInfo(l.id);
    ok[new URL(l.id.replace(course+"-",course+"/")+"/",ROOT).href]=i.status!=="hidden"&&elLsForGroup(l,i,myGroup)}));
  dds.forEach(dd=>dd.querySelectorAll(".course-group").forEach(g=>{const c=g.querySelector(":scope>.course-link");
    if(g.classList.contains("muted-group")||!c||norm(c.getAttribute("href"))!==home){g.remove();return}
    g.querySelectorAll(".ls-link").forEach(a=>{if(!ok[norm(a.getAttribute("href"))])a.remove()})}));
  // the course page's LS cards too (the side menu's "All Learning Situations" opens it): only the ones the group can open
  document.querySelectorAll("a.card[href]").forEach(a=>{const h=norm(a.getAttribute("href"));if(h in ok&&!ok[h])a.remove()});
}
// Vocabulary and grammar summary on the LS page (Roger, 26 Oct 2026): the "Language & Knowledge" tab has an empty card ([data-el-study]);
// for an LS with `study` in EL_LS it gets the student's route PDF (nothing until they have a route), the teacher and testers all three.
// Pro (native, C2): its own PDF where the LS has `pro`, otherwise the Daring one; Starter its own where the LS has `starter` (LS2 on,
// tools/lp-worksheets/build.mjs), otherwise Base.
function studyCard(u){
  const el=document.querySelector("[data-el-study]"),ls=(window.EL_LS||[]).find(x=>x.id===lsId);
  if(!el||!ls||!ls.study||!u)return;
  const every=(isTeacher(u)&&!AS)||seesAll(u),lv=myLevel,ca=!every&&elCa(lv);
  if(!every&&!lv)return;
  const a=r=>'<a href="'+new URL(ls.study+r+".pdf",ROOT).href+'" target="_blank" rel="noopener" style="display:inline-block;margin:4px 8px 0 0;padding:12px 18px;border-radius:12px;background:var(--accent-dark);color:white;font-weight:800;text-decoration:none">📄 '+(ca?"Obre el resum":"Open the summary")+(every?" · "+EL_LEVELS.find(x=>x.id===r).name:"")+" (PDF)</a>";
  el.innerHTML="<h2>📚 "+(ca?"Resum del vocabulari i la gramàtica":"Vocabulary and grammar summary")+"</h2><p>"
    +(ca?"Primer tot el vocabulari i després tota la gramàtica de la teva ruta, amb les explicacions i la pràctica. Obre'l quan vulguis per estudiar (des del navegador també el pots descarregar). És opcional: fes-lo servir si et va bé.":"All the vocabulary and then all the grammar of your route, with the explanations and practice. Open it whenever you want to study (you can also download it from the browser). It is optional: use it if it helps you.")
    +"</p><p>"+(every?EL_LEVELS.filter(x=>(x.id!=="beginners"||ls.starter)&&(x.id!=="native"||ls.pro)).map(x=>a(x.id)).join(""):a(lv==="beginners"&&!ls.starter?"insecure":lv==="native"&&!ls.pro?"daring":lv))+"</p>";
  el.hidden=false;
}
// PDFs open in a new browser tab, not as a download (Roger, 1 Nov 2026: "They can download them if they want once are opened on the browser").
// Reading story on the LS home page (Roger, 31 Oct 2026: "nice pdf book-like versions for each level and put them on the home of each LS
// per levels"): the Overview tab has an empty card ([data-el-story]); for an LS with `story` in EL_LS it gets the book of the student's
// route only (tools/reading-story/build.py), nothing until they have a route; the teacher and testers get all four. Pro reads Plus.
function storyCard(u){
  const el=document.querySelector("[data-el-story]"),ls=(window.EL_LS||[]).find(x=>x.id===lsId);
  if(!el||!ls||!ls.story||!u)return;
  const every=(isTeacher(u)&&!AS)||seesAll(u),lv=myLevel,ca=!every&&elCa(lv),s=ls.story;
  if(!every&&!lv)return;
  const a=r=>'<a href="'+new URL(s.pdf+r+".pdf",ROOT).href+'" target="_blank" rel="noopener" style="display:inline-block;margin:4px 8px 0 0;padding:12px 18px;border-radius:12px;background:var(--accent-dark);color:white;font-weight:800;text-decoration:none">📖 '
    +(every?EL_LEVELS.find(x=>x.id===r).name+" (PDF)":ca?"Obre el teu llibre (PDF)":"Open your book (PDF)")+"</a>";
  el.innerHTML='<div style="display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap"><img src="'+new URL(s.pdf+"cover.jpg",ROOT).href+'" alt="" style="width:120px;border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,.18)">'
    +'<div style="flex:1;min-width:220px"><h2>📖 '+(ca?"Història per llegir":"Reading story")+" · "+s.title+"</h2><p>"
    +(ca?"Un misteri en sis capítols. Llegeix un capítol cada setmana a casa, amb el seu Learning Path. A classe en parlem deu minuts.":"A story in six chapters. Read one chapter a week at home, with its Learning Path. In class we talk about it for ten minutes.")
    +(every?"":" <b>"+elLevelLabel(ls.course,lv==="native"&&!s.pro?"daring":lv)+"</b>")
    +"</p><p>"+(every?EL_LEVELS.filter(x=>x.id!=="native"||s.pro).map(x=>a(x.id)).join(""):a(lv==="native"&&!s.pro?"daring":lv))+"</p></div></div>";   // story.pro: a C2 book for Pro (else Pro reads Plus)
  el.hidden=false;
}
let draw=()=>{},authKnown=false;
const start=()=>{draw=bar();draw(user)};
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",start):start();
new MutationObserver(()=>draw(user)).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});   // the board picks its language after loading

// Class game (lab/game, Roger 26 Oct 2026): while the teacher's board runs a game for the student's group (live/{group}, host.js), a
// signed-in student is taken into it (lab/game/play.html) from whatever page they are on, and goes back here with the player's Leave.
const GAME=new URL("lab/game/play.html",ROOT),onGame=location.pathname===GAME.pathname;
// 🎓 In class mode, a student who was in the game waits in the player after it until the teacher sends the group back to the class
// (Roger, 9 Nov 2026: "only [...] when I say so"; lab/game/play.js, host.js): leaving it before that (Back key, a link) brings them back
// there. Released by the board's 🎓 Back to class mode (live/{group}.cmBack) or the class tab moving on after the game (go.at), or when
// class mode ends. el_game_in = the game the player joined in this browser (play.js).
const cmHold=x=>{if(!x||!x.game||!x.sid||!elCmOn(x.go)||!x.go.lock)return false;let k="";try{k=localStorage.getItem("el_game_in")||""}catch(e){}
  return k===String(x.sid)&&+x.sid>(+x.cmBack||0)&&+x.sid>+x.go.at};
// A game that takes the student away in the middle of a new try: el_game_took {p: this page, at} (ls2-engine.js retryBack, Roger 16 Nov
// 2026). The first page after the game keeps the note through its own reload after the pull and forgets it when it is left.
const TOOK="el_game_took",LOADED=Date.now();
addEventListener("pagehide",()=>{if(reloading)return;try{const o=JSON.parse(sessionStorage.getItem(TOOK)||"null");if(o&&o.at<LOADED)sessionStorage.removeItem(TOOK)}catch(e){}});
// 📝 Exam mode (Roger, 17 Nov 2026: "I want to go exam mode, and when I do that all students get pulled up"): the dashboard writes
// live/{group}.exam = {on, href, ls, only, at, go}: every open page of the group's students (only those listed in .only, for a make-up
// exam of some students) goes to the exam page after the usual short notice that saves their work, and is kept there while it lasts.
// Pages of the exam itself stay (el-web-exam.js reads .go for ▶ Start). Class mode and pull-ups wait until the teacher ends exam mode.
// ⏹ Class mode stopping (or ending with the class) also ends an exam mode nobody has started yet, for the whole group (Roger, 19 Nov
// 2026: class mode opened on the exam at 19:42 and stopped, but exam mode stayed on and took 2ESO A, studying at home, to the waiting
// screen). An exam that has started (.go) or a make-up for some students (.only) is left alone.
async function examEndIdle(g){try{const s=await getDoc(doc(db,"live",g)),e=s.exists()?s.data().exam:null;
  if(!e||!e.on||e.go||Array.isArray(e.only)&&e.only.length||!e.ls)return;
  await Promise.all([setDoc(doc(db,"ls",e.ls),{webExam:{[g]:{open:false,mode:false,go:null,only:null,at:new Date().toISOString()}}},{merge:true}),
    setDoc(doc(db,"live",g),{exam:null},{merge:true})])}catch(x){console.warn("exam mode",x)}}
// 🚫📓 No notebook during an exam (Roger, 20 Nov 2026, 2ESO LS2 web exam: "students can see the notebook during the exam! change that
// immediately"): while exam mode is on for this student (and always on an exam page) html.el-exam-on hides 📓 and ✍ Notes, and the
// notebook (an LS page's #notes) does not open: the student goes straight back to the exam, no notice.
let examHref="";
const examMine=e=>{if(!e||!e.on||!e.href||!user||!isStudent(user)||AS)return false;
  const at=e.at&&e.at.toMillis?e.at.toMillis():+e.at||0;if(at&&Date.now()-at>3*3600e3)return false;   // a forgotten one
  return !(Array.isArray(e.only)&&!e.only.includes(String(user.email||"").toLowerCase()))};
const examPage=/(^|\/)exam\.html$/.test(relPath);
const examNb=()=>{const h=document.documentElement;if(!h.classList.contains("el-exam-on")||!examHref||location.hash!=="#notes"||!lsId||!/\/(index\.html)?$/.test(location.pathname))return false;
  h.style.visibility="hidden";location.replace(new URL(examHref,ROOT).href);return true};
(()=>{const st=document.createElement("style");st.textContent="html.el-exam-on #el-nbfab,html.el-exam-on #el-qnbtn,html.el-exam-on #el-qn{display:none!important}";document.head.append(st);
  if(examPage)document.documentElement.classList.add("el-exam-on")})();
addEventListener("hashchange",examNb);
function examFlag(e){const on=examMine(e);examHref=on?e.href:"";if(!examPage)document.documentElement.classList.toggle("el-exam-on",on);if(on)examNb()}
function examPull(e){
  if(!examMine(e))return false;
  const url=new URL(e.href,ROOT);if(location.pathname===url.pathname)return true;
  if(examNb())return true;
  try{sessionStorage.setItem("el_exam_from",location.href)}catch(x){}   // where the exam page sends them back if exam mode ends before they begin
  if(inShell){try{FW.location.replace(url.href)}catch(x){location.href=url.href}return true}
  goMove(url,lockCa()?"📝 L’examen":"📝 The exam",false,3,"📝");return true}
function gamePush(u){
  if(stopGame){stopGame();stopGame=null}
  if(!u||!isStudent(u)||!myGroup||onGame)return;
  let first=true;
  stopGame=onSnapshot(doc(db,"live",myGroup),s=>{const x=s.exists()?s.data():null,ms=x&&x.at&&x.at.toMillis?x.at.toMillis():0;
    // the player goes full screen too (Roger, 6 Nov 2026) and speaks Catalan only to Starter and Base: ca=1|0 (the level is read first if needed)
    // 📝 a student in the web exam (el-web-exam.js sets EL_EXAM_LOCK while they wait for ▶ Start or take it) is never moved: not by class
    // mode, a class game or a pull-up (Roger, 17 Nov 2026: Elunei takes her exam while the rest of the class is in class mode)
    examFlag(x&&x.exam);
    if(window.EL_EXAM_LOCK)return;
    // exam mode first: a student called to the exam is not taken to a class game the others play
    if(examPull(x&&x.exam))return;
    if(x&&(x.game&&x.on&&x.phase!=="end"&&Date.now()-ms<10*60e3||cmHold(x))){const g=()=>{try{sessionStorage.setItem(TOOK,JSON.stringify({p:location.pathname,at:Date.now()}))}catch(e){}location.href=GAME.href+"?g="+encodeURIComponent(myGroup)+"&from="+encodeURIComponent(location.pathname+location.search)+(myLevel||homeLevel?"&ca="+(lockCa()?1:0):"")};
      if(!myLevel&&!homeLevel&&!lvTried&&user&&!AS){lvTried=true;findHomeLevel(user).finally(g)}else g();return}
    const f=first,run=()=>{rtFollow(x&&x.rt);goTo(x&&x.go,f);FSL=(x&&x.fs)||null;TT=(x&&x.tt)||null;keepTT(TT);fsRefresh();fsKnown=true;fsCheck()};first=false;
    if(x&&(x.go||x.fs||elSlotNow(x.tt))&&!myLevel&&!homeLevel&&!lvTried&&user&&!AS){lvTried=true;findHomeLevel(user).finally(run)}else run()},
    e=>console.warn("game",e));
}
// 📖 Read together (shared/correct/, Roger 12 Nov 2026: "can we read together instead of everyone having a different text" and "but
// again, the text is not the same for everyone"): live/{group}.rt = {u, k, n, chat, l, h, at}. While it names this page, the reading box
// shows h, the one text the class reads on the projector, instead of the student's own level's text, with a note, and marks block k
// (the teacher's paragraph; -1 before the first). When rt is cleared (⏱ Your turn, or the screen closed) the student's own text comes
// back, so each one answers their own level. Nothing is written and nothing saved changes: only what the box shows.
let rtNow=null,rtKey="",rtBox=null,rtOrig=null,rtSig="";
function rtRestore(){if(rtBox&&rtOrig!=null&&rtBox.isConnected)rtBox.innerHTML=rtOrig;rtBox=null;rtOrig=null;rtSig="";
  const n=document.getElementById("el-rt-note");if(n)n.remove()}
// 🆕 After reading together (rt.x, from ⏱ Your turn on): the student's own text is back, and the words it has that the shared text did
// not (the extra details of a Core or Plus version) are marked green, so the student reads those on their own before answering
// (Roger, 12 Nov 2026: "if they read different texts…"). A CSS highlight: the page's text and answers are not touched.
const RT_STOP=new Set("a an the and or but of to in on at for from with by is are was were be it its this that there here i you he she we they me him her us them my your his our their not no as so if than then too very can will just also do does did have has had".split(" "));
const rtStem=w=>w.replace(/'s$/,"").replace(/ies$/,"y").replace(/(ing|ed|es|s)$/,"").replace(/(.)\1$/,"$1");
function rtExtras(box,h){if(typeof CSS==="undefined"||!CSS.highlights||typeof Highlight==="undefined")return 0;
  CSS.highlights.delete("el-rt-new");if(!box||!h)return 0;
  const seen=new Set((new DOMParser().parseFromString(h.replace(/<[^>]*>/g," "),"text/html").body.textContent.toLowerCase().replace(/[’‘]/g,"'").match(/[a-zà-ÿ0-9']+/g)||[]).map(rtStem));
  const hl=new Highlight(),tw=document.createTreeWalker(box,NodeFilter.SHOW_TEXT);let n,c=0,last=null;
  while((n=tw.nextNode())){if(n.parentElement&&n.parentElement.closest(".tiny,script,style,button"))continue;
    const re=/[A-Za-zÀ-ÿ0-9'’]+/g,t=n.nodeValue;let m;
    while((m=re.exec(t))){const w=m[0].toLowerCase().replace(/’/g,"'");
      if(RT_STOP.has(w)||seen.has(rtStem(w))||(w.length<2&&!/\d/.test(w)))continue;
      // joined to the previous new word when only spaces, commas or little words are between them ("ten to twelve")
      const gap=last&&last.endContainer===n?t.slice(last.endOffset,m.index):null;
      if(gap!=null&&gap.length<14&&/^[\s,'’-]*$/.test(gap.replace(/[A-Za-z]+/g,x=>RT_STOP.has(x.toLowerCase())?" ":"#")))last.setEnd(n,m.index+m[0].length);
      else{const r=new Range();r.setStart(n,m.index);r.setEnd(n,m.index+m[0].length);hl.add(r);last=r;c++}}
    last=null}
  if(c)CSS.highlights.set("el-rt-new",hl);return c}
function rtCss(){if(!document.getElementById("el-rt-css")){const st=document.createElement("style");st.id="el-rt-css";
    st.textContent=".el-rt-cur{background:#fff7cc!important;box-shadow:0 0 0 4px #ffd34d;border-radius:8px;transition:background .3s}"+
      "#el-rt-note{margin:0 0 10px;padding:8px 12px;border-radius:10px;background:#fff7cc;border:2px solid #ffd34d;font:700 15px system-ui,sans-serif;color:#713f12}"+
      "#el-rt-note.x{background:#dcfce7;border-color:#22c55e;color:#14532d}::highlight(el-rt-new){background-color:#bbf7d0;text-decoration:underline 2px #16a34a}"+
      ".el-rt-newbox{background:#dcfce7!important;box-shadow:0 0 0 3px #22c55e;border-radius:8px}.el-rt-newbox::before{content:'🆕 ';font-weight:800}"+
      ".el-rc-cur{box-shadow:0 0 0 4px #ffd34d!important;border-radius:12px;background:#fffbea!important}"+
      "#el-rc-card{position:fixed;right:16px;bottom:16px;z-index:2147481000;width:400px;max-width:calc(100vw - 32px);max-height:70vh;overflow:auto;background:#fff;border-radius:14px;border:3px solid #6366f1;box-shadow:0 10px 30px rgba(15,23,42,.3);font:16px/1.45 system-ui,sans-serif;color:#13222c}"+
      "#el-rc-card .h{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:7px 12px;background:#6366f1;color:#fff;font-weight:800;cursor:move;touch-action:none;user-select:none;position:sticky;top:0}"+
      "#el-rc-card .b{padding:10px 14px}#el-rc-card p{margin:0 0 6px}#el-rc-card .q{font-weight:700}#el-rc-card .w{color:#5f6b73}"+
      "#el-rc-card.ok{border-color:#2e8b57}#el-rc-card.ok .h{background:#2e8b57}#el-rc-card.no{border-color:#ef4444}#el-rc-card.no .h{background:#dc2626}"+
      "#el-rc-card .y b{color:inherit}#el-rc-card.no .y{color:#991b1b}#el-rc-card .r{color:#14532d;font-weight:600}"+
      "#el-rc-card .ev{margin-top:8px;padding:8px 10px;border-radius:10px;background:#f8fafc;border:1px solid #e3e7eb;font-size:15px}#el-rc-card .ev small{display:block;font-weight:700;color:#2b4fa8;margin-bottom:2px}"+
      "#el-rc-card mark{background:#ffe680;padding:1px 3px;border-radius:4px;color:inherit}";document.head.append(st)}}
function rtNote(box,cls,txt){let n=document.getElementById("el-rt-note");if(!n){n=document.createElement("p");n.id="el-rt-note";box.before(n)}n.className=cls;n.textContent=txt}
/* ✅ Correcting together (Roger, 13 Nov 2026: "when correcting the reading I want students to see the feedback on their Chromebook with the
   answers according to their level and see what they did", then "they should see this floating and they can move it if it's on their text;
   when I change the question it disappears and the next one appears"): on the projector's question slides rt.c = {p: the step, qs: [{q,
   a, alt}] the question (one per level when each level has its own), s: the answer is shown, w: [{r: level, n: its number, h: where the
   text says it, the sentence marked}]}. The student's own question with that text is outlined and brought into view, and a floating card
   (drag it by its top bar; the place is kept for the visit) shows that question: once the teacher shows the answer, what they answered
   (✓ / ✗), the right answer of their level and where their text says it. The card changes with the projector's question and goes when
   the screen closes or moves to the reading log. A question their level does not have: the card says so (listen). Nothing is written and
   their answers are not touched. */
const rcEsc=v=>String(v==null?"":v).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function rcClear(){const c=document.getElementById("el-rc-card");if(c)c.remove();document.querySelectorAll(".el-rc-cur").forEach(e=>e.classList.remove("el-rc-cur"))}
const rcTitle=el=>{const t=el.querySelector(".q-title");if(!t)return"";const c=t.cloneNode(true);c.querySelectorAll(".q-ca,small").forEach(x=>x.remove());return rtNorm(c.textContent.replace(/^\s*\d+\.\s*/,"").replace(/🔮/g,""))};
let rcPos=null;try{rcPos=JSON.parse(sessionStorage.getItem("el_rc_pos")||"null")}catch(e){}
function rcCard(){let c=document.getElementById("el-rc-card");if(c)return c;
  c=document.createElement("div");c.id="el-rc-card";c.innerHTML='<div class="h"><span class="t"></span><span class="g" aria-hidden="true">⠿</span></div><div class="b"></div>';document.body.append(c);
  const place=(x,y)=>{const w=c.offsetWidth,h=c.offsetHeight;x=Math.max(4,Math.min(innerWidth-w-4,x));y=Math.max(4,Math.min(innerHeight-h-4,y));c.style.left=x+"px";c.style.top=y+"px";c.style.right=c.style.bottom="auto";return {x,y}};
  if(rcPos)requestAnimationFrame(()=>place(rcPos.x,rcPos.y));
  const hd=c.querySelector(".h");let d=null;
  hd.addEventListener("pointerdown",e=>{const r=c.getBoundingClientRect();d={dx:e.clientX-r.left,dy:e.clientY-r.top};hd.setPointerCapture(e.pointerId);e.preventDefault()});
  hd.addEventListener("pointermove",e=>{if(d)rcPos=place(e.clientX-d.dx,e.clientY-d.dy)});
  const up=()=>{if(!d)return;d=null;try{sessionStorage.setItem("el_rc_pos",JSON.stringify(rcPos))}catch(e){}};hd.addEventListener("pointerup",up);hd.addEventListener("pointercancel",up);
  return c}
function rtCorrect(c,box){
  document.querySelectorAll(".el-rc-cur").forEach(e=>e.classList.remove("el-rc-cur"));
  if(!c||!Array.isArray(c.qs)){rcClear();return}
  const list=document.getElementById(c.p+"Form")||document.getElementById(c.p+"List");if(!list||list.offsetParent===null){rcClear();return}
  const ca=lockCa(),want=c.qs.map(x=>rtNorm(x.q));let hit=null,q=null;
  [...list.querySelectorAll(".question")].some(el=>{const i=want.indexOf(rcTitle(el));if(i<0)return false;hit=el;q=c.qs[i];return true});
  const card=rcCard(),T=card.querySelector(".t"),B=card.querySelector(".b"),k="c|"+want.join("|")+"|"+(c.s?1:0)+"|"+(hit?1:0);
  if(!hit){card.className="none";T.textContent=ca?"🙌 Ho resolem junts":"🙌 Work it out together";
    B.innerHTML=`<p>${ca?"Aquesta pregunta no és al teu reading: escolta i busca-la al text de la pissarra.":"This question isn't in your reading: listen and find it in the text on the board."}</p>`;rtKey=k;return}
  hit.classList.add("el-rc-cur");
  const num=(hit.querySelector(".q-title")||{}).textContent.match(/^\s*(\d+)\./),qt=(hit.querySelector(".q-title").cloneNode(true));qt.querySelectorAll(".q-ca,small").forEach(x=>x.remove());
  T.textContent=(ca?"🙌 Ho resolem junts · pregunta ":"🙌 Work it out together · question ")+(num?num[1]:"");
  if(k!==rtKey){rtKey=k;const ae=document.activeElement;if(!(ae&&ae.closest&&ae.closest("input[type=text],textarea")))hit.scrollIntoView({block:"center",behavior:"smooth"})}
  const qh=`<p class="q">${rcEsc(qt.textContent.replace(/^\s*\d+\.\s*/,"").trim())}</p>`;
  if(!c.s){card.className="wait";B.innerHTML=qh+`<p class="w">${ca?"Pensa la resposta i escolta…":"Think of your answer and listen…"}</p>`;return}
  // what they answered: the option they picked (0 = the right one in the data) or what they typed (the page's own ✓ when they checked)
  const r=hit.querySelector("input[type=radio]:checked"),t=hit.querySelector("input.typed,textarea.typed,input[type=text]"),fb=hit.querySelector(".feedback");
  const said=r?(r.closest("label")||{}).textContent||"":t?t.value.trim():"";
  const ok=r?+r.value===0:t?(fb&&fb.classList.contains("ok"))||[].concat(q.a||[],q.alt||[]).some(a=>rtNorm(a)===rtNorm(said)):false;
  // where their text says it: their level's (the one whose marked sentence is in the text on their screen; their route first)
  const w=Array.isArray(c.w)?c.w:[],inBox=rtNorm(box?box.textContent:""),mk=h=>rtNorm((h.match(/<mark>([\s\S]*?)<\/mark>/)||[,""])[1].replace(/<[^>]*>/g," "));
  const ev=(q.h?{h:q.h}:null)||w.find(x=>x.r===myLevel&&x.h)||w.filter(x=>x.h&&mk(x.h)&&inBox.includes(mk(x.h))).sort((a,b)=>mk(b.h).length-mk(a.h).length)[0]||null;   // the longest: Starter's short sentence is inside Core's
  card.className=ok?"ok":"no";
  B.innerHTML=qh+(said?`<p class="y">${ca?"La teva resposta":"Your answer"}: <b>${rcEsc(said)}</b> ${ok?"✓":"✗"}</p>`:`<p class="y">${ca?"No l'has resposta.":"You didn't answer it."}</p>`)+
    `<p class="r">${ok?"✓ "+(ca?"Correcte!":"Right!"):"✓ "+(ca?"Resposta correcta":"Right answer")+": <b>"+rcEsc(q.a||"")+"</b>"}</p>`+
    (ev?`<div class="ev"><small>${ca?"On ho diu el text":"Where the text says it"}</small><div>${ev.h}</div></div>`:"");
}
function rtFollow(rt){rtNow=rt||null;
  document.querySelectorAll(".el-rt-cur").forEach(e=>e.classList.remove("el-rt-cur"));
  document.querySelectorAll(".el-rt-newbox").forEach(e=>e.classList.remove("el-rt-newbox"));
  if(typeof CSS!=="undefined"&&CSS.highlights)CSS.highlights.delete("el-rt-new");
  if(!rt||rt.u!==relPath||Date.now()-(+rt.at||0)>3*3600e3){gtClose();wbClose();rtRestore();rcClear();return}
  if(rt.p)return rtGram(rt);
  const box=[...document.querySelectorAll(".reading,#readText")].find(e=>e.offsetParent!==null);if(!box)return;
  rtCss();
  if(rt.x){wbClose();rtRestore();const c=rtExtras(box,rt.h);if(c){const n=document.createElement("p");n.id="el-rt-note";n.className="x";box.before(n);
      n.textContent=lockCa()?"🆕 Les paraules en verd són el que el teu text diu de més que el que hem llegit junts: llegeix-les ara, abans de respondre.":"🆕 The green words are what your text says that we didn't read together: read them now, before you answer."}
    rtCorrect(rt.c,box);return}
  if(typeof rt.h==="string"&&rt.h){
    if(box!==rtBox){rtRestore();rtBox=box;rtOrig=box.innerHTML}
    const sig=rt.l+"|"+rt.h.length+"|"+rt.h.slice(0,80);
    if(sig!==rtSig){box.innerHTML=rt.h;rtSig=sig;let n=document.getElementById("el-rt-note");
      if(!n){n=document.createElement("p");n.id="el-rt-note";box.before(n)}
      n.textContent=lockCa()?"📖 Llegim junts: ara tothom té el mateix text que a la pissarra. El teu text torna quan hagis de respondre.":"📖 Reading together: everyone has the same text as on the board now. Your own text comes back when it's time to answer."}}
    if(typeof rt.h==="string"&&rt.h)wbShow(rt,"reading",rt.h,box);
  if(!(rt.k>=0))return;
  const bl=[...box.children].filter(e=>!e.classList.contains("tiny"));if(!bl.length)return;
  const i=rt.chat&&bl.length!==rt.n?Math.round(rt.k*(bl.length-1)/Math.max(1,rt.n-1)):Math.min(rt.k,bl.length-1),el=bl[i];
  el.classList.add("el-rt-cur");const k=rt.u+"|"+rt.k;if(k!==rtKey){rtKey=k;el.scrollIntoView({block:"center",behavior:"smooth"})}}
/* 📘 Grammar together (shared/correct/ tab=grammar; Roger, 12 Nov 2026: "the same we did with the reading but with the grammar section"):
   rt = {u, p: the step ("grammar"), k: the box explained now (-1 before the first), n, l, h: the boxes in English, hc: in Catalan, at}.
   The step's "How it works" card shows the projector's boxes (hc for a student who has the page in Catalan, Base and Starter) and marks
   box k. From ⏱ Your turn on, rt = {u, p, k: -1, x: 1, hs: the text of every box seen together}: the student's own boxes are back and
   the ones not seen together go green, to read before the exercise. Only what the card shows changes; nothing is saved. */
const rtNorm=s=>String(s||"").toLowerCase().replace(/[’‘`]/g,"'").replace(/[^a-zà-ÿ0-9']+/g," ").trim();
/* 📝 Notes while explaining together (Roger, 13 Nov 2026: "during the grammar together I want students to have a note place to copy the notes
   they want. It should appear in their notes with the day, the grammar summary and their notes"): under the shared boxes, a student gets
   📝 Take your notes. Saved 2.5 s after they stop typing, when the teacher goes on to ⏱ Your turn, and when the page closes, in
   students/{uid}/notes/gt-<course>-<ls>-<page> (the class games' notes collection, firestore.rules: their own) = {ls, course, deck, title, lp,
   parts:{gt:{topic, day, sum: the boxes seen together, text, at}}, updated}. 🎯 What's in the exam on the LS page shows it in its learning
   path's card (shared/js/el-notes.js gtCard). Nothing is saved until they write. */
// the boxes as plain words + <b>/<br> (the visual ones are styled divs that would eat the 1500 characters)
const gtFlat=h=>String(h||"").replace(/<\/(div|p|tr|table|h\d|li|ul|ol)>|<(br|hr)\b[^>]*>/gi,"<br>").replace(/<\/t[dh]>/gi," · ").replace(/<\/span>/gi," ").replace(/<(?!\/?(strong|em|b|i|br|del|s|u)\b)[^>]*>/gi,"").replace(/<(\/?)(strong|em|b|i|br|del|s|u)\b[^>]*>/gi,"<$1$2>").replace(/(\s*·\s*)+<br>/g,"<br>").replace(/(\s*<br>\s*){2,}/g,"<br>").replace(/^(\s*<br>)+|(<br>\s*)+$/g,"").trim();
const GTN={el:null,v:"",dirty:false,t:0,st:"",rt:null,loaded:"",ca:false};
const gtDeck=()=>"gt-"+relPath.replace(/\.html$/,"").replace(/\//g,"-");   // gt-2eso-free-time-live-what-are-they-doing
/* one notes doc per grammar section (Roger, 16 Nov 2026: "students should see the grammar ed/ing and below their notes and when we do another
   grammar point, the grammar theory and then their notes"): gt-<page>-<step id> (gt-…-where-traditions-come-from-grammarFeel), with
   parts.gt.sec = the step id; the notebook puts each one after its grammar step. Before, a page had one doc for all its sections
   (gt-<page>): gtLegacy() moves it, once, to the section it was written in (parts.gt.sec, or the step whose title it has). */
const gtSecId=rt=>String(rt&&rt.p||"grammar").replace(/[^a-z0-9_-]/gi,"")||"grammar";
const gtSecDeck=rt=>gtDeck()+"-"+gtSecId(rt);
let gtLeg=null;
function gtLegacy(){
  if(gtLeg)return gtLeg;const base=gtDeck(),ref=id=>doc(db,"students",user.uid,"notes",id);
  return gtLeg=getDoc(ref(base)).then(async s=>{
    if(!s.exists())return;const d=s.data(),g=(d.parts||{}).gt;if(!g)return;
    const t=String(d.title||"").replace(/^📘\s*/,"").trim(),ps=[...document.querySelectorAll("section.panel[id]")].filter(x=>x.querySelector(".section-card.worked"));
    const m=ps.find(x=>String((x.querySelector(".panel-head h2")||{}).textContent||"").trim()===t);
    const sec=String(g.sec||(m?m.id:ps.length===1?ps[0].id:"grammar")).replace(/[^a-z0-9_-]/gi,"")||"grammar",to=base+"-"+sec;
    if((await getDoc(ref(to))).exists())return;   // never overwrite: both stay
    await setDoc(ref(to),Object.assign({},d,{deck:to,parts:Object.assign({},d.parts,{gt:Object.assign({},g,{sec})})}));
    await deleteDoc(ref(base));
  }).catch(e=>console.warn("old grammar notes",e));
}
const gtT=(c,e)=>GTN.ca?c:e;
function gtState(st){if(st!=null)GTN.st=st;const e=document.getElementById("el-gt-st");if(!e)return;
  e.textContent=GTN.st==="saving"?gtT("Desant…","Saving…"):GTN.st==="saved"?gtT("✓ Desat a 🎯 Què entra a l'examen, amb la data i l'explicació","✓ Saved in 🎯 What's in the exam, with the day and the explanation")
    :GTN.st==="err"?gtT("⚠ Encara no s'ha desat: continua escrivint, ho torna a provar","⚠ Not saved yet: keep writing, it tries again"):gtT("Es desa sol mentre escrius.","Saved by itself while you write.")}
async function gtSave(){
  clearTimeout(GTN.t);if(!GTN.dirty||!user||!isStudent(user)||AS||!GTN.rt)return;GTN.dirty=false;
  const rt=GTN.rt,a=(window.EL_CATALOG||[]).find(y=>y.path===relPath),d=document.createElement("div");d.innerHTML=(GTN.ca&&rt.hc)||rt.h||"";
  const sum=[...d.querySelectorAll(".model")].map(m=>{const c=m.cloneNode(true),l=c.querySelector(":scope>span:first-child");if(l)l.remove();return gtFlat(c.innerHTML).slice(0,2500).replace(/<[^>]*$/,"")}).slice(0,12);
  const title=(document.querySelector('#'+String(rt.p).replace(/[^a-z0-9_-]/gi,"")+" .panel-head h2")||{}).textContent||"";
  const now=serverTimestamp(),day=new Date().toLocaleDateString("sv-SE",{timeZone:"Europe/Madrid"});gtState("saving");
  try{await gtLegacy();const deck=gtSecDeck(rt);await setDoc(doc(db,"students",user.uid,"notes",deck),{ls:lsId||"",course:(relPath.match(/^\d+eso/)||[""])[0],deck,
      title:"📘 "+(title||"Grammar").trim(),lp:window.LP&&window.LP.n?"LP"+window.LP.n+" "+String(window.LP.title&&(window.LP.title.en||window.LP.title)||a&&a.title||"").replace(/\s*\(.*$/,""):a&&window.elLpLabel?elLpLabel(a):"",parts:{gt:{topic:"How it works · together",sec:gtSecId(rt),day,sum,text:GTN.v.slice(0,3000),at:now}},updated:now},{merge:true});gtState("saved")}
  catch(e){console.warn("grammar notes",e);GTN.dirty=true;gtState("err");GTN.t=setTimeout(gtSave,8e3)}
}
function gtBox(box,rt){
  if(!user||!isStudent(user)||AS)return;GTN.rt=rt;GTN.ca=lockCa();
  let f=document.getElementById("el-gt-notes");
  if(!f||!f.isConnected||f.previousElementSibling!==box){if(f)f.remove();f=document.createElement("div");f.id="el-gt-notes";f.className="section-card";
    f.innerHTML=`<h3>📝 ${gtT("Pren apunts","Take your notes")}</h3><p class="instruction">${gtT("📓 L'explicació ja és a la teva llibreta: no la copiïs. Aquí pots escriure exemples teus o només les coses importants per recordar. És opcional.","📓 The explanation is already in your notebook: don't copy it. Here you can write your own examples or just the important things to remember. It's optional.")}</p>`+
      `<textarea maxlength="3000" spellcheck="false" style="width:100%;min-height:130px;font:16px/1.5 system-ui,sans-serif;padding:10px;border-radius:10px;border:2px solid #cbd5e1;box-sizing:border-box" placeholder="${GTN.ca?"Exemple: …&#10;Per recordar: … (opcional)":"Example: …&#10;To remember: … (optional)"}"></textarea><p class="tiny" id="el-gt-st"></p>`;
    box.after(f);const ta=f.querySelector("textarea");ta.value=GTN.v;
    ta.addEventListener("input",()=>{GTN.v=ta.value;GTN.dirty=true;gtState("");clearTimeout(GTN.t);GTN.t=setTimeout(gtSave,2500)});
    // what they wrote before on this learning path (another day, another device) comes back: one read per page
    if(GTN.loaded!==gtSecDeck(rt)){const dk=GTN.loaded=gtSecDeck(rt);gtLegacy().then(()=>getDoc(doc(db,"students",user.uid,"notes",dk))).then(s=>{const t=s.exists()?(((s.data().parts||{}).gt||{}).text||""):"";
      const x=document.querySelector("#el-gt-notes textarea");if(t&&x&&!GTN.v){x.value=GTN.v=t}}).catch(e=>console.warn("grammar notes",e))}}
  gtState(null);
}
function gtClose(){const f=document.getElementById("el-gt-notes");if(GTN.dirty)gtSave();if(f)f.remove()}
addEventListener("pagehide",()=>{if(GTN.dirty)gtSave()});
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden"&&GTN.dirty)gtSave()});
/* 📘 📖 Only a whiteboard while the teacher explains (Roger, 13 Nov 2026: "when doing an activity together, and I'm explaining theory I want
   students to only see a whiteboard and that when they take notes it looks like hand writing and they can underline, highlight, etc. this
   notes appear in their notes"; "when doing theory like grammar or whatever, they must only see their notes"): while rt names this page
   and it is not ⏱ Your turn yet, a student's Chromebook shows shared/js/el-whiteboard.js over the page: the projector's boxes (Grammar
   together) or text (Read together) with the part being explained marked, and their handwriting page (el-pad.js). The page is saved like
   📝 Take your notes was (2.5 s after they stop, on Your turn, when the page closes), in students/{uid}/notes/gt-<course>-<ls>-<page>
   (reading: …-rd) parts.gt = {topic, day, sum, text, html: their page with its marks (nb-* classes only), dr: their drawings, at}; one read
   per page brings back what they wrote before. 📓 My notebook on the LS page shows it (el-notebook.js). If the whiteboard can't load, the
   old 📝 box under the boxes comes back (grammar). The teacher and 👁 Student view never get it. */
const WB={m:null,p:null,fail:false,deck:"",v:null,dirty:false,t:0,rt:null,kind:"",loaded:"",ca:false,box:null};
const wbDeck=(k,rt)=>k==="reading"?gtDeck()+"-rd":gtSecDeck(rt);
const wbT=(c,e)=>WB.ca?c:e;
const wbMod=()=>WB.p||(WB.p=import("./el-whiteboard.js").then(m=>(WB.m=m)).catch(e=>{console.warn("whiteboard",e);WB.fail=true;throw e}));
const wbTitle=()=>{const b=WB.box,pn=b&&(b.closest(".panel")||b.closest("section"));return String(((pn&&pn.querySelector(".panel-head h2"))||{}).textContent||"").trim()};
function wbShow(rt,kind,html,box){
  if(!user||!isStudent(user)||AS||WB.fail)return false;
  const deck=wbDeck(kind,rt);
  if(WB.deck!==deck){if(WB.dirty)wbSave();if(WB.m)WB.m.close();WB.deck=deck;WB.v=null;WB.dirty=false}
  WB.rt=WB.srt=rt;WB.kind=kind;WB.ca=lockCa();WB.box=box;
  const go=()=>{if(!WB.rt||WB.deck!==deck)return;
    WB.m.render({kind,title:wbTitle(),head:window.LP&&window.LP.n?"LP"+window.LP.n:"",html,k:rt.k,n:rt.n,chat:rt.chat,ca:WB.ca,saved:WB.v,
      onChange:v=>{WB.v=v;WB.dirty=true;WB.m.status(wbT("Desant…","Saving…"));clearTimeout(WB.t);WB.t=setTimeout(wbSave,2500)}});
    if(!WB.dirty&&WB.loaded!==deck)WB.m.status(wbT("Es desa sol a 📓 La meva llibreta","Saved by itself in 📓 My notebook"));
    if(WB.loaded!==deck){WB.loaded=deck;(kind==="grammar"?gtLegacy():Promise.resolve()).then(()=>getDoc(doc(db,"students",user.uid,"notes",deck))).then(x=>{const p=x.exists()?((x.data().parts||{}).gt||{}):null;
      if(p&&(p.html||p.text||(p.dr||[]).length)&&!WB.dirty&&WB.deck===deck&&WB.m.isOpen()){WB.v={html:p.html||"",text:p.text||"",dr:p.dr||[]};WB.m.set(WB.v)}}).catch(e=>console.warn("whiteboard notes",e))}};
  if(WB.m)go();else wbMod().then(go).catch(()=>{if(kind==="grammar"&&WB.rt)gtBox(box,rt)});
  return true;
}
async function wbSave(){
  clearTimeout(WB.t);if(!WB.dirty||!WB.v||!user||!isStudent(user)||AS||!WB.srt)return;WB.dirty=false;
  const rt=WB.srt,kind=WB.kind,deck=WB.deck,v=WB.v,a=(window.EL_CATALOG||[]).find(y=>y.path===relPath);
  let sum=[];if(kind==="grammar"){const d=document.createElement("div");d.innerHTML=(WB.ca&&rt.hc)||rt.h||"";
    sum=[...d.querySelectorAll(".model")].map(m=>{const c=m.cloneNode(true),l=c.querySelector(":scope>span:first-child");if(l)l.remove();return gtFlat(c.innerHTML).slice(0,2500).replace(/<[^>]*$/,"")}).slice(0,12)}
  const html=String(v.html||"").length<60000?String(v.html||""):"",dr=[];let n=0;for(const x of v.dr||[]){n+=x.length;if(n>250000)break;dr.push(x)}
  const now=serverTimestamp(),day=new Date().toLocaleDateString("sv-SE",{timeZone:"Europe/Madrid"});
  if(WB.m)WB.m.status(wbT("Desant…","Saving…"));
  try{if(kind==="grammar")await gtLegacy();
    await setDoc(doc(db,"students",user.uid,"notes",deck),{ls:lsId||"",course:(relPath.match(/^\d+eso/)||[""])[0],deck,
      title:(kind==="grammar"?"📘 ":"📖 ")+(wbTitle()||(kind==="grammar"?"Grammar":"Reading")),lp:window.LP&&window.LP.n?"LP"+window.LP.n+" "+String(window.LP.title&&(window.LP.title.en||window.LP.title)||a&&a.title||"").replace(/\s*\(.*$/,""):a&&window.elLpLabel?elLpLabel(a):"",
      parts:{gt:{topic:kind==="grammar"?"How it works · together":"Reading together",...(kind==="grammar"?{sec:gtSecId(rt)}:{}),day,sum,text:String(v.text||"").slice(0,3000),html,dr,at:now}},updated:now},{merge:true});
    if(WB.m&&WB.deck===deck)WB.m.status(wbT("✓ Desat a 📓 La meva llibreta","✓ Saved in 📓 My notebook"))}
  catch(e){console.warn("whiteboard notes",e);WB.dirty=true;if(WB.m)WB.m.status(wbT("⚠ Encara no s'ha desat: continua, ho torna a provar","⚠ Not saved yet: keep going, it tries again"));WB.t=setTimeout(wbSave,8e3)}
}
function wbClose(){if(WB.dirty)wbSave();if(WB.m)WB.m.close();WB.rt=null}
addEventListener("pagehide",()=>{if(WB.dirty)wbSave()});
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden"&&WB.dirty)wbSave()});
/* 📓 My notebook, always at hand (Roger, 13 Nov 2026: "a floating icon like a notebook always present", "didn't I say that they should see
   the notebook here?" on the board): a 📓 button on every student page, the board, the learning paths, English Lab and the course pages.
   It sits in the bottom-right bar with ⚡, ⚠️, 💡 and 📬, an icon like the others with its name on hover (Roger, 26 Nov 2026: "this I want
   it here"; it was a round button floating bottom left). It opens the notebook (the LS page's #notes) of the LS the student is in: this LS
   on an LS page from LS2 on (LS1 has no notebook), elsewhere the last one the board or an LS page showed (el_nb on this device;
   window.elNbFab(href) from the board). Hidden on the notebook itself, under the whiteboard, in exams and on the teacher's dashboard. The
   element keeps its id #el-nbfab (class mode, ✍ Notes and the notebook's CSS look for it); bar() puts it back after every redraw. No reads. */
let nbA=null;
function nbFab(){
  if(nbA||/\/teacher\.html$/.test(location.pathname)||examPage)return;   // never on an exam page
  let href=null;
  if(lsId&&m){const L=(window.EL_LS||[]).find(x=>x.id===lsId);if(!L||!window.elLsNum)return;
    href=location.pathname.slice(0,location.pathname.length-relPath.length)+m[0]+"index.html#notes";try{localStorage.setItem("el_nb",href)}catch(e){}}
  else{try{href=localStorage.getItem("el_nb")}catch(e){}}
  const st=document.createElement("style");st.textContent="#el-cloud-bar #el-nbfab{display:inline-flex;align-items:center;border:1px solid #cbd5e1;background:#fff;color:#0f172a;border-radius:999px;padding:4px 9px;text-decoration:none;font:15px/1.2 system-ui,sans-serif;cursor:pointer}"+
    "#el-cloud-bar #el-nbfab:hover{background:#f8fafc}#el-cloud-bar #el-nbfab[hidden]{display:none}#el-cloud-bar #el-nbfab:focus-visible{outline:3px solid #2f5bd3;outline-offset:2px}"+
    "html.el-wb-on #el-nbfab,html.el-nbfab-off #el-nbfab,html.el-nb-full #el-nbfab{display:none!important}@media print{#el-nbfab{display:none}}";
  document.head.append(st);
  const a=document.createElement("a");a.id="el-nbfab";a.className="elcb-i";a.hidden=!href;if(href)a.href=href;a.textContent="📓";
  const lab=()=>{const t=lockCa()?"La meva llibreta":"My notebook";a.dataset.tip=t;a.title="";a.setAttribute("aria-label",t)};
  lab();nbA=a;draw(user);
  // the 📓 button always opens the notebook itself (Roger, 16 Nov 2026: "students should open their notebook whenever they press the notebook
  // button"); the ✍ Quick note pad it used to open first (qnOpen below) is no longer started from here
  const here=()=>document.documentElement.classList.toggle("el-nbfab-off",location.hash==="#notes"&&!!lsId&&/\/(index\.html)?$/.test(location.pathname));
  here();addEventListener("hashchange",here);setTimeout(lab,4000);
  // the board knows the student's LS now: its notebook (an LS1 or no LS: no button)
  window.elNbFab=h=>{try{if(h)localStorage.setItem("el_nb",h);else localStorage.removeItem("el_nb")}catch(e){}a.hidden=!h;if(h)a.href=h;else a.removeAttribute("href")};
}
// 📓 opened from a learning path: the notebook opens on that learning path, at the step on screen (Roger, 13 Nov 2026: "When I open my
// notebook from an SLP, I want the notebook to open there too"). el-notebook.js reads el_nb_at once, if it is less than 2 minutes old.
document.addEventListener("click",e=>{const a=e.target.closest&&e.target.closest('a[href*="#notes"]');if(!a||!lsId||!m||/\/(index\.html)?$/.test(location.pathname))return;
  const tab=document.querySelector(".tab.active[data-panel]");try{localStorage.setItem("el_nb_at",JSON.stringify({ls:lsId,page:location.pathname.split("/").pop(),panel:tab?tab.dataset.panel:"",t:Date.now()}))}catch(x){}},true);
// ↩ the notebook's Back button goes to the page it was opened from (Roger, 14 Nov 2026: "go back where they were, so if they were on
// the dashboard they go there, but if they were somewhere else…"): any 📓 link (the floating button, the board's card, an LS page's tile)
// keeps this page in el_nb_from (a learning path with the step on screen, #panel). Not from the notebook itself. No reads.
document.addEventListener("click",e=>{const a=e.target.closest&&e.target.closest('a[href*="#notes"]');if(!a||document.documentElement.classList.contains("el-nb-full"))return;
  const tab=document.querySelector(".tab.active[data-panel]"),u=new URL(location.href);if(tab)u.hash=tab.dataset.panel;else if(u.hash==="#notes")return;
  try{localStorage.setItem("el_nb_from",JSON.stringify({u:u.href,n:document.title,t:Date.now()}))}catch(x){}},true);
setTimeout(nbFab,0);   // after this module has run (lockCa is defined further down)
/* ✍ A quick note from any page (Roger, 13 Nov 2026: "is the floating icon of the notebook always available, so that students can note
   what they need when they need it?"): a handwriting page (el-pad.js: pens, highlighters, underline) over the page they are on, so they
   don't leave the activity. It is saved by itself (2 s after they stop, on ✓ and when the page closes) into their notebook,
   students/{uid}/notes/nb-<LS> parts.n.<id> = {sec: "lp<n>" (the learning path they are in) or "qn" (✍ Quick notes), html, text, dr, day,
   w: where they wrote it}, merged, so nothing else of the notebook is touched. "Open my notebook" still goes to the whole notebook.
   ✍ Notes while doing an activity (2ESOB problem report, 19 Nov 2026: "que quan estiguis fent una activitat puguis fer i posar notes a la
   teva llibreta", Roger: "I want to do this"): on a learning path (and the other activity pages of an LS from LS2 on; not the exams, the
   sample exam, the recall checkpoints or a Recall step: those are "No notes") a ✍ Notes button above 📓 opens the page as a panel at the
   side of the screen, the activity still there to work on. The note belongs to the step on screen: p = its tab, at = {b: that step's part
   in the notebook, e: 1} puts it right after that step in the notebook (el-notebook.js inlinePut); going to another tab with the panel open
   goes on in that step's note. The same step's note comes back when the panel opens again: ONE read of notes/nb-<LS> the first time the
   panel opens on a page, none before. No copying the theory (Roger, 19 Nov 2026, PR #729): Ctrl+C / paste were already blocked
   (el-nocopy.js); a slip says notes are their own examples or things to remember, and typing 7 words in a row of this step's theory boxes
   brings a tip that it is already in the notebook (typing is never stopped). Also used by the 📓 button when the teacher keeps them on a
   page (pull-up). */
const QN={w:null,p:null,id:"",v:null,dirty:false,t:0,ls:"",sec:"",where:"",pn:"",n:null,grams:null,nudged:0};
const qnLs=()=>{if(lsId)return lsId;let h="";try{h=localStorage.getItem("el_nb")||""}catch(e){}const x=h.match(/\/((2|4)eso)\/([^/]+)\/(index\.html)?#notes$/);return x?x[1]+"-"+x[3]:""};
const qnFk=s=>String(s).replace(/[^A-Za-z0-9_~-]/g,"_").slice(0,80);   // as el-notebook.js fk (the parts' ids)
// the activity page of an LS (not LS1, its notebook page, the exams or the checkpoints) where ✍ Notes shows, for a signed-in student
function qnPage(){
  if(!lsId||!m||!user||!isStudent(user)||AS)return false;
  const f=relPath.slice(m[0].length);if(!f||/^(index\.html)?$/.test(f)||/^(exam|sample-exam|recall-checkpoint-\d+)\.html$/.test(f)||!/\.html$/.test(f))return false;
  const L=(window.EL_LS||[]).find(x=>x.id===lsId);if(!L||!window.elLsNum||elLsNum(L)==="LS1")return false;
  const a=(window.EL_CATALOG||[]).find(y=>y.path===relPath);return !(a&&(a.checkpoint||a.exam))}
const qnTab=()=>document.querySelector(".tab.active[data-panel]");
const qnRecall=()=>{const t=qnTab(),id=t?t.dataset.panel:"",p=window.LP&&(LP.panels||[]).find(x=>x.id===id);return id==="recall"||!!(p&&p.type==="recall")};
// where the student is: the learning path and its step on screen
function qnWhere(ls){const LP=window.LP,tab=qnTab(),lpN=LP&&LP.n&&lsId===ls?String(LP.n):"",pn=lpN&&tab?tab.dataset.panel:"";
  const step=String((tab&&(tab.innerText||tab.textContent))||"").replace(/\s+/g," ").trim().replace(/^\d+\s*/,"").replace(/\s*✓$/,"").slice(0,60);
  return {lpN,pn,where:lpN?("LP"+lpN+(step?" · "+step:"")):String(document.title||"").replace(/\s*[·|–-]\s*English Lab.*$/i,"").slice(0,60)}}
// this step's theory (How it works, Expressions): 7 words in a row of it typed in the note = copying
const QW=7,qnWords=t=>String(t||"").toLowerCase().replace(/[’‘`]/g,"'").replace(/[^a-zà-ÿ0-9']+/g," ").trim().split(" ").filter(Boolean);
function qnGrams(){const g=new Set(),tab=qnTab(),pan=tab&&document.getElementById(tab.dataset.panel);if(!pan)return g;
  const w=qnWords([...pan.querySelectorAll(".section-card.worked,.explain,.model")].map(e=>e.innerText||e.textContent).join(" "));
  for(let i=0;i+QW<=w.length;i++)g.add(w.slice(i,i+QW).join(" "));return g}
function qnCopied(v,T){if(!QN.grams||!QN.grams.size||Date.now()-QN.nudged<20e3||!QN.w)return;const w=qnWords(v&&v.text);let hit=false;
  for(let i=0;i+QW<=w.length&&!hit;i++)hit=QN.grams.has(w.slice(i,i+QW).join(" "));if(!hit)return;QN.nudged=Date.now();
  const r=QN.w.querySelector(".qn-slip");if(r){r.classList.add("hot");setTimeout(()=>r.classList.remove("hot"),2500)}
  let h=document.getElementById("pad-hint");if(!h){h=document.createElement("div");h.id="pad-hint";document.body.append(h)}
  h.textContent=T("📓 Això ja és a la teva llibreta: no cal copiar-ho. Escriu-hi un exemple teu.","📓 This is already in your notebook: no need to copy it. Write an example of your own.");
  h.classList.add("on");clearTimeout(h._t);h._t=setTimeout(()=>h.classList.remove("on"),5000)}
// the student's notes of this LS's notebook, read once per page (only when the panel opens)
const qnNotes=ls=>QN.n&&QN.n.ls===ls?QN.n.p:(QN.n={ls,p:getDoc(doc(db,"students",user.uid,"notes","nb-"+ls)).then(x=>x.exists()?((x.data().parts||{}).n||{}):{}).catch(e=>{console.warn("quick note",e);QN.n=null;return {}})}).p;
function qnCss(){if(document.getElementById("el-qn-css"))return;const st=document.createElement("style");st.id="el-qn-css";st.textContent=
  "#el-qn{position:fixed;left:max(14px,env(safe-area-inset-left,0px));bottom:78px;z-index:9991;width:min(520px,calc(100vw - 28px));height:min(430px,calc(100vh - 110px));display:flex;flex-direction:column;background:#fffef8;border:2px solid #1f4fb5;border-radius:14px;box-shadow:0 14px 34px rgba(20,40,90,.3);font:15px/1.35 system-ui,sans-serif;color:#1e293b;overflow:hidden}"+
  "#el-qn .qn-top{display:flex;align-items:center;gap:8px;padding:8px 10px;border-bottom:1px solid #dbe4f5;background:#f3f6fd}#el-qn .qn-top b{white-space:nowrap}#el-qn .qn-w{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#64748b;font-size:13px}"+
  "#el-qn .qn-b{border:1px solid #c7d2ea;background:#fff;border-radius:8px;padding:4px 10px;font:600 13px system-ui,sans-serif;color:#1f4fb5;cursor:pointer;text-decoration:none;white-space:nowrap}#el-qn .qn-ok{background:#1f4fb5;color:#fff;border-color:#1f4fb5}"+
  "#el-qn .qn-host{flex:1;min-height:0;display:flex;flex-direction:column;overflow:auto;padding:6px 8px}#el-qn .qn-st{padding:3px 10px 6px;font-size:12px;color:#64748b}#el-qn .pad-tools{margin:0 0 10px;border-radius:8px;border:1px solid #d5dce5}"+
  "#el-qn .qn-slip{margin:8px 8px 0;padding:6px 11px;background:#fff7c2;border:1px solid #f0dc7a;border-radius:8px;box-shadow:0 2px 5px rgba(0,0,0,.08);font:500 13.5px/1.35 system-ui,sans-serif;color:#3d3a1f;transition:background .3s}#el-qn .qn-slip.hot{background:#ffd8d2}"+
  // ✍ Notes beside the activity: a panel down the left side of the screen; the page moves over so nothing of it is covered
  "#el-qn.side{left:0;top:0;bottom:0;width:390px;height:auto;border-radius:0 14px 14px 0;border-left:0;box-shadow:6px 0 24px rgba(20,40,90,.22)}#el-qn.side .qn-top{flex-wrap:wrap;row-gap:2px;padding:10px 12px}#el-qn.side .qn-top b{font-size:17px}#el-qn .qn-sp{flex:1}#el-qn.side .qn-w{flex-basis:100%;white-space:normal;font-weight:600}"+
  "#el-qn .qn-foot{display:flex;align-items:center;gap:8px;padding:6px 10px 10px;border-top:1px solid #e5eaf3}#el-qn .qn-foot .qn-st{flex:1;padding:0}"+
  "@media (min-width:900px){html.el-qn-side body{margin-left:390px!important}html.el-qn-side #el-nbfab,html.el-qn-side #el-qnbtn{display:none}}"+
  "#el-qnbtn{position:fixed;left:max(14px,env(safe-area-inset-left,0px));bottom:max(14px,env(safe-area-inset-bottom,0px));z-index:9990;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;width:52px;height:52px;padding:0;border-radius:16px;background:#1f4fb5;border:2px solid #1f4fb5;box-shadow:0 6px 16px rgba(20,40,90,.25);color:#fff;font:700 11px/1 system-ui,sans-serif;cursor:pointer;transition:transform .15s}"+
  "#el-qnbtn[hidden]{display:none}#el-qnbtn:hover{transform:translateY(-2px)}#el-qnbtn:focus-visible{outline:3px solid #2f5bd3;outline-offset:3px}#el-qnbtn span{font-size:20px;line-height:1}html.el-wb-on #el-qnbtn,html.el-nb-full #el-qnbtn{display:none}"+
  "@media (max-width:640px){#el-qn{left:8px;right:8px;width:auto;bottom:74px;height:min(70vh,calc(100vh - 100px))}#el-qn.side{top:auto;border-radius:14px;border-left:2px solid #1f4fb5}body.elptab #el-qn{bottom:calc(132px + env(safe-area-inset-bottom,0px));height:min(62vh,calc(100vh - 160px))}#el-qn .qn-w{display:none}body.elptab #el-qnbtn{bottom:calc(72px + env(safe-area-inset-bottom,0px))}}@media print{#el-qn,#el-qnbtn{display:none}}";document.head.append(st)}
// o.side: the ✍ Notes panel beside the activity (else the small quick note over the page)
function qnOpen(o){
  o=o||{};if(!user||!isStudent(user)||AS||document.documentElement.classList.contains("el-nbfab-off")||document.documentElement.classList.contains("el-exam-on"))return false;
  const ls=qnLs();if(!ls)return false;
  if(QN.w){qnClose();return true}
  const ca=lockCa(),T=(c,e2)=>ca?c:e2,{lpN,pn,where}=qnWhere(ls),side=!!o.side;
  if(!QN.id||QN.ls!==ls||QN.where!==where){if(QN.dirty)qnSave();QN.id="n"+Date.now().toString(36);QN.v=null;QN.dirty=false;QN.old=false}
  QN.ls=ls;QN.sec=lpN?"lp"+lpN:"qn";QN.where=where;QN.pn=pn;QN.grams=qnGrams();
  qnCss();
  const w=document.createElement("div");w.id="el-qn";if(side)w.className="side";w.setAttribute("role","dialog");w.setAttribute("aria-label",side?T("Apunts","Notes"):T("Nota ràpida","Quick note"));
  const href=document.getElementById("el-nbfab")&&document.getElementById("el-nbfab").getAttribute("href");
  const openA=href&&!(lockHere()&&!LOCK.cm)?`<a class="qn-b qn-open" href="${href}">📓 ${T("Obre la llibreta","Open my notebook")} →</a>`:"";
  w.innerHTML=side?`<div class="qn-top"><b>✍ ${T("Els meus apunts","My notes")}</b><span class="qn-sp"></span><button type="button" class="qn-b qn-ok" aria-label="${T("Tanca","Close")}">✕ ${T("Tanca","Close")}</button><span class="qn-w"></span></div>`
      +`<p class="qn-slip">${T("📓 La teoria ja és a la teva llibreta: no la copiïs. Aquí pots escriure exemples teus o les coses importants per recordar. És opcional.","📓 The theory is already in your notebook: don't copy it. Here you can write your own examples or the important things to remember. It's optional.")}</p>`
      +`<div class="qn-host"></div><div class="qn-foot"><span class="qn-st"></span>${openA}</div>`
    :`<div class="qn-top"><b>📓 ${T("Nota ràpida","Quick note")}</b><span class="qn-w"></span>${openA}<button type="button" class="qn-b qn-ok">✓ ${T("Fet","Done")}</button></div><div class="qn-host"></div><div class="qn-st"></div>`;
  w.querySelector(".qn-w").textContent="📍 "+where;
  document.body.append(w);QN.w=w;if(side)document.documentElement.classList.add("el-qn-side");
  const st=s2=>{const x=QN.w&&QN.w.querySelector(".qn-st");if(x)x.textContent=s2};
  const where0=lpN&&pn?T("sota aquest pas de LP"+lpN,"under this step of LP"+lpN):lpN?"LP"+lpN:T("✍ Notes ràpides","✍ Quick notes");
  st(T("Es desa sol a la teva llibreta, ","Saved by itself in your notebook, ")+where0+".");
  w.querySelector(".qn-ok").addEventListener("click",()=>qnClose());
  w.querySelector(".qn-open")?.addEventListener("click",()=>{if(QN.p)QN.v=Object.assign(QN.v||{},QN.p.get());if(QN.dirty)qnSave()});
  w.addEventListener("keydown",e=>{if(e.key==="Escape"){e.stopPropagation();qnClose()}});
  // this step's note from before comes back (side panel on a learning path step only; one read per page)
  const before=side&&lpN&&pn&&!QN.v&&!QN.old?Promise.race([qnNotes(ls).then(n=>{let id="";for(const k in n){const x=n[k];if(x&&!x.fl&&x.sec===QN.sec&&x.p===pn&&k>id)id=k}
    if(id&&QN.w===w&&!QN.dirty){QN.id=id;QN.v={html:n[id].html||"",text:n[id].text||"",dr:n[id].dr||[]}}QN.old=true}),new Promise(r=>setTimeout(r,2500))]):Promise.resolve();
  Promise.all([import("./el-pad.js"),before]).then(([P])=>{if(QN.w!==w)return;
    QN.p=P.pad(w.querySelector(".qn-host"),{html:QN.v&&QN.v.html,text:QN.v&&QN.v.text,dr:QN.v&&QN.v.dr,ca,ph:side?T("Exemples teus o coses importants per recordar… (opcional)","Your own examples or important things to remember… (optional)"):T("Escriu aquí el que vulguis recordar. Pots canviar de boli, subratllar i marcar.","Write here what you want to remember. You can change pens, highlight and underline."),
      onChange:v=>{QN.v=v;QN.dirty=true;qnCopied(v,T);st(T("Desant…","Saving…"));clearTimeout(QN.t);QN.t=setTimeout(qnSave,2000)}});
    QN.st=st;setTimeout(()=>{if(QN.p&&QN.p.ed)QN.p.ed.focus({preventScroll:true})},30)}).catch(e=>{console.warn("quick note",e);qnClose();if(href)location.href=href});
  return true;
}
async function qnSave(){
  clearTimeout(QN.t);if(!QN.dirty||!QN.v||!user||!isStudent(user)||AS)return;QN.dirty=false;
  const v=QN.v,ca=lockCa(),T=(c,e2)=>ca?c:e2,st=QN.w&&QN.st,id=QN.id,deck="nb-"+QN.ls;
  const L=(window.EL_LS||[]).find(l=>l.id===QN.ls)||{},html=String(v.html||"").length<60000?String(v.html||""):"",dr=[];let n=0;for(const x of v.dr||[]){n+=x.length;if(n>250000)break;dr.push(x)}
  if(!html.replace(/<[^>]*>/g,"").trim()&&!String(v.text||"").trim()&&!dr.length&&!QN.old)return;   // an empty new note is not saved (one from before, emptied, is)
  const day=new Date().toLocaleDateString("sv-SE",{timeZone:"Europe/Madrid"}),one={sec:QN.sec,html,text:String(v.text||"").slice(0,3000),dr,day,w:QN.where};
  if(QN.pn&&QN.sec!=="qn"){one.p=QN.pn;one.at={b:QN.sec+"-p-"+qnFk(QN.pn),e:1}}
  try{await setDoc(doc(db,"students",user.uid,"notes",deck),{ls:QN.ls,course:L.course||(QN.ls.match(/^\d+eso/)||[""])[0],deck,title:"📓 My notebook",lp:"",
      parts:{n:{[id]:one}},updated:serverTimestamp()},{merge:true});
    if(QN.id===id)QN.old=true;if(QN.n&&QN.n.ls===QN.ls)QN.n.p=QN.n.p.then(m2=>Object.assign(m2,{[id]:Object.assign({},m2[id],one)}));
    if(st&&QN.id===id)st(T("✓ Desat a la teva llibreta","✓ Saved in your notebook"))}
  catch(e){console.warn("quick note",e);QN.dirty=true;if(st)st(T("⚠ Encara no s'ha desat: ho torna a provar","⚠ Not saved yet: it tries again"));QN.t=setTimeout(qnSave,8e3)}
}
function qnClose(){if(QN.p)QN.v=Object.assign(QN.v||{},QN.p.get());if(QN.dirty)qnSave();if(QN.w)QN.w.remove();QN.w=null;QN.p=null;document.documentElement.classList.remove("el-qn-side")}
addEventListener("pagehide",()=>{if(QN.dirty)qnSave()});
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden"&&QN.dirty)qnSave()});
// the ✍ Notes button (above 📓) and the panel follow the step on screen: another tab = that step's note; a Recall step = no notes
function qnSync(){
  const b=document.getElementById("el-qnbtn"),ok=qnPage();
  if(!b){if(!ok)return;qnCss();const x=document.createElement("button");x.type="button";x.id="el-qnbtn";x.addEventListener("click",()=>{if(qnRecall()){lockToast(lockCa()?"🧠 Al Recall no hi ha apunts: respon sense mirar.":"🧠 No notes on Recall: answer without looking.");return}if(!qnOpen({side:true}))lockToast()});document.body.append(x);return qnSync()}
  const ca=lockCa(),lab=ca?"Apunts":"Notes";if(b.dataset.l!==lab){b.dataset.l=lab;b.innerHTML=`<span aria-hidden="true">✍</span>${lab}`;b.title=ca?"✍ Pren apunts a la teva llibreta sense sortir de l'activitat":"✍ Take notes in your notebook without leaving the activity"}
  b.hidden=!ok||qnRecall();
  if(!QN.w||!QN.w.classList.contains("side"))return;
  if(!ok||qnRecall()){qnClose();return}
  if(qnWhere(QN.ls).where!==QN.where){qnClose();qnOpen({side:true})}
}
document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest(".tab[data-panel],[data-next],.section-next,a[href^='#']"))setTimeout(qnSync,60)});
setInterval(qnSync,1000);
function rtGram(rt){
  const box=[...document.querySelectorAll("#"+String(rt.p).replace(/[^a-z0-9_-]/gi,"")+" .section-card.worked")].find(e=>e.offsetParent!==null);if(!box)return;
  rtCss();const ca=lockCa();
  if(rt.x){gtClose();wbClose();rtRestore();const hs=new Set(rt.hs||[]);let c=0;
    box.querySelectorAll(".model").forEach(m=>{if(!hs.has(rtNorm(m.textContent))){m.classList.add("el-rt-newbox");c++}});
    if(c)rtNote(box,"x",ca?"🆕 Els requadres en verd són del teu nivell i no els hem vist junts: llegeix-los ara, abans de començar.":"🆕 The green boxes are for your level and we didn't see them together: read them now, before you start.");
    return}
  const h=ca&&rt.hc?rt.hc:rt.h;
  if(typeof h==="string"&&h){
    if(box!==rtBox){rtRestore();rtBox=box;rtOrig=box.innerHTML}
    const sig="g|"+rt.l+"|"+(ca?1:0)+"|"+h.length+"|"+h.slice(0,80);
    if(sig!==rtSig){box.innerHTML=h;rtSig=sig;
      rtNote(box,"",ca?"📘 Aprenem junts: ara tothom veu la mateixa explicació que a la pissarra. La del teu nivell torna quan hagis de practicar.":"📘 Learning together: everyone sees the same explanation as on the board now. Your level's comes back when it's time to practise.")}
    if(!wbShow(rt,"grammar",h,box))gtBox(box,rt)}
  if(!(rt.k>=0))return;
  const bl=[...box.querySelectorAll(".model")];if(!bl.length)return;
  const el=bl[Math.min(rt.k,bl.length-1)];el.classList.add("el-rt-cur");const k=rt.u+"|g|"+rt.k;
  if(k!==rtKey){rtKey=k;const ae=document.activeElement;if(!(ae&&ae.closest&&ae.closest("#el-gt-notes")))el.scrollIntoView({block:"center",behavior:"smooth"})}}   // not while they write their notes
// the reading tab opened after the teacher moved on still gets the text and the mark (the page may draw the box again)
document.addEventListener("click",e=>{if(rtNow&&e.target.closest(".tab"))setTimeout(()=>{rtKey="";if(rtBox&&!rtBox.isConnected){rtBox=null;rtOrig=null;rtSig=""}if(rtBox&&rtBox.offsetParent===null)rtSig="";rtFollow(rtNow)},120)});
// 📌 Pull up takes the students there (Roger, 2 Nov 2026: "I want to literally pull them up, not only a message but make them go there"):
// the teacher's pull-up also writes live/{group}.go = {a, p, pn, t, at} (the document this page already listens to for class games, so
// no extra reads). Every student page that is open goes to that learning path (and tab) after a 5-second notice that saves their work
// first (the field they are typing in, then the cloud save). A page opened up to 3 minutes later goes there too; later than that,
// only the card and bar of pullBar remain. Each pull-up moves a browser once (localStorage el_go_<at>). Not from a recall checkpoint,
// the sample exam or a class presentation followed live (?live=): there the bar of pullBar says where to go.
const GO_MS=3*60e3;
function tabBar(g){const ca=lockCa(),old=document.getElementById("el-pull");if(old)old.remove();
  const b=document.createElement("div");b.id="el-pull";
  b.style.cssText="position:fixed;top:0;left:0;right:0;z-index:2147482000;display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;justify-content:center;padding:10px 14px;font:600 15px system-ui,sans-serif;background:#0f766e;color:#fff;box-shadow:0 2px 8px rgba(0,0,0,.2)";
  const tx=document.createElement("span");tx.textContent="📌 "+(ca?"El professor és a la pestanya: ":"Your teacher is on the tab: ")+(g.pn||g.p)+(ca?". Acaba el que estàs fent i ves-hi.":". Finish what you are doing and go there.");
  const go=document.createElement("button");go.textContent=(ca?"Ves-hi":"Go there")+" →";go.style.cssText="background:#fff;color:#0f766e;border:0;border-radius:999px;padding:6px 16px;font-weight:800;cursor:pointer";
  go.onclick=()=>{const t=document.querySelector('.tab[data-panel="'+CSS.escape(g.p)+'"]');if(t)t.click();b.remove()};
  const no=document.createElement("button");no.textContent="✕";no.style.cssText="border:0;background:none;color:#fff;font-size:18px;cursor:pointer";no.onclick=()=>b.remove();
  b.append(tx,go,no);document.body.prepend(b)}
// 🔒 Kept there until the teacher lets them go (Roger, 4 Nov 2026: "once I pull students in a section or LP, they mustn't be able to go
// to another part of the website until I say so"): a pull-up carries lock:true. While it lasts (until the teacher clicks Release, which
// sets go to null, or when the class it was made in ends (until; Roger, 5 Nov 2026: "when I finish a class, this should be released"),
// or LOCK_MS after it at the latest, in case it is forgotten) every other page that loads el-cloud.js sends the student
// back to that learning path at once, links that leave it are blocked with a message, and with a tab chosen the other tabs are blocked too
// (except the one the student was already working on, until they reach the teacher's tab). A bar on the path says they are kept there.
const LOCK_MS=70*60e3;
let LOCK=null,lockFrom=null;
const lockOn=g=>!!(g&&g.lock&&(g.a||g.cm&&g.u)&&g.at&&(g.cm?elCmOn(g):Date.now()-g.at<LOCK_MS&&!(g.until&&Date.now()>=g.until)));
// Catalan only for Starter and Base, English for Core, Plus and Pro (Roger, 5 Nov 2026: "the messages when pulled up and full screen should
// be in English except for the low levels starter and base"); the level comes from the page (LS pages) or the course's latest LS (findHomeLevel,
// read before the first pull-up or full screen message on pages that do not know it, such as the board)
const lockCa=()=>{const lv=myLevel||homeLevel;return !!lv&&elCa(lv)};
let lvTried=false;
const cmUrl=g=>{const u=new URL(g.u,ROOT);u.hash=g.p||"";return u},lockHere=()=>!!LOCK&&(LOCK.cm?cmHere(LOCK).length>0:actId===LOCK.a);
// 🎓 Several steps at once (Roger, 12 Nov 2026: "let me enable more than one SLP at once since there are times where students need to navigate
// them"): go.ps = [{u, p, n}] lists the steps the teacher opened with 👥 in 📋 Today (el-cm-agenda.js), the class tab's own step always
// counts too. Students may work on any of them: they are not moved while they are on one, and a row of chips on the class mode bar takes
// them from one to another (other pages too). go.vis = today's steps on the Time plan ("path#tab", "path#" a whole page): "me and they should
// only see the SLP planned for the class", so on those learning path pages every other tab is hidden while class mode lasts (cmTabs).
const onPage=u=>{try{return new URL(u,ROOT).pathname===location.pathname}catch(e){return false}};
// 📖 the Book is one tab now: a chapter tab sent by an older plan (path#ch2) is the "book" tab (elTabOf in el-catalog.js)
const tabP=(u,p)=>window.elTabOf?elTabOf(String(u||""),p||""):p||"";
function cmEn(g){if(!g||!g.cm)return [];const t=String(g.t||""),out=[{u:g.u,p:tabP(g.u,g.p),n:(t.match(/^LP\d+/)||[t])[0]+(g.pn?" · "+String(g.pn).replace(/^\d+\s+/,""):""),me:true}];
  (Array.isArray(g.ps)?g.ps:[]).forEach(x=>{const xp=x&&tabP(x.u,x.p);if(x&&x.u&&!out.some(y=>y.u===x.u&&y.p===xp))out.push({u:x.u,p:xp,n:x.n||x.p||""})});
  const f=ffRead(g);if(f)f.gs.forEach(x=>{if(!x||!x.u)return;const xp=tabP(x.u,x.p);if(!out.some(y=>y.u===x.u&&y.p===xp))out.push({u:x.u,p:xp,n:x.n||"",ff:true,hide:!!x.hide})});return out}
const cmHere=g=>cmEn(g).filter(x=>onPage(x.u));
// the tab the student is on: the active tab, or the panel shown when the page opened on a #tab link without marking a tab (the bar then
// said "Go there" to a student already on the teacher's tab)
const curPanel=()=>{const t=document.querySelector(".tab.active[data-panel]");if(t)return t.dataset.panel;const p=document.querySelector(".panel.active[id]");return p?p.id:null};
// ⚡ I've finished: fast finishers in class (Roger, 12 Nov 2026: "I want to allow doing further activities planned on the agenda for fast
// finishers", "yes add I've finished but that brings them to the book section"; 21 Nov 2026: "In class I want fast finisher to read the
// book, if they are done, they can do pending tasks (button to go to pending task), only if they have no pending task, I want them to go
// to games (include the ones of the exam)"). In class mode the student's 🎓 bar has ⚡ I've finished. It opens the ⚡ Finished early? card
// (ffCard) with the order worked out for this student:
//   0. today's class steps first (cmEn without the ones given here): a step not done on their progress → "First finish …" and a Go button;
//   1. 📖 the LS's Book (the class tab opens it for the group and names it on live/{group}.go.ff, el-cm-agenda.js), until the whole book is
//      read: every chapter's questions answered (the reader's own "done"); it opens where they stopped (no row when today has no Book);
//   2. ✅ their pending tasks: the ✅ To do list (el-todo.js elTodoReady → elTodoPending: late work, homework, class work not finished),
//      a button for each one;
//   3. 🎲 only with no pending task: the Games page (lab/), the LS vocabulary games and the exam's 🏗 games (Hangman, Quick quiz).
// What the card opens is given to this student alone while this class mode lasts (sessionStorage el_cm_ff = {s, until, k, gs: [{u, p, n,
// hide}]}; page-only, like the Time plan's 🏫 tabs): a chip on the bar (hide: a page the games link to, no chip of its own), not moved
// by the teacher's next move, freed with elSecFree / EL_CM_FREE on load. Each stage replaces the one before. Nothing new is made: it only
// points to work that exists and is open (the week-by-week rule). After the class those steps are as the Time plan says again.
const FF_K="el_cm_ff";
function ffGet(){try{const o=JSON.parse(sessionStorage.getItem(FF_K)||"null");if(o&&o.u&&Array.isArray(o.ps)&&!o.gs)o.gs=o.ps.map(p=>({u:o.u,p,n:ffName(p,lockCa())}));   // the older {u, ps} (the Book only)
  return o&&Array.isArray(o.gs)?o:null}catch(e){return null}}
function ffRead(g){if(!g||!g.cm)return null;const o=ffGet();return o&&o.s===g.s?o:null}
// the steps given on this page while that class mode lasts (known before live/{group} is read: the page's first locks)
function ffPage(){const o=ffGet();return o&&Date.now()<+o.until?o.gs.filter(x=>x&&onPage(x.u)).map(x=>x.p||""):[]}
const ffName=(p,ca)=>"📖 "+(ca?"El llibre":"The book");
const samePath=(a,b)=>{try{return new URL(a,ROOT).pathname===new URL(b,ROOT).pathname}catch(e){return false}};
const ffAct=u=>(window.EL_CATALOG||[]).find(y=>y.path&&samePath(y.path,u));
const ffDoneSet=a=>new Set(a.keys.flatMap(k=>[...elDoneSet(localStorage.getItem(k))]));
// a step of the class done on this student's progress (a page with no steps, such as a game, holds nobody back)
function ffDone(x){const a=ffAct(x.u);if(!a)return true;const sk=a.skip||[],ks=(x.p?elSecSteps(a,x.p):((window.EL_ACTIONS||{})[a.id]||[])).filter(k=>!sk.includes(k));
  if(!ks.length)return true;const d=ffDoneSet(a);return ks.every(k=>d.has(k))}
// the Book path the class tab offers (go.ff = [path]): the one of this page's LS, else the first
function ffBook(g){const ps=g&&g.cm&&Array.isArray(g.ff)?g.ff:[];if(!ps.length)return null;const as=ps.map(ffAct).filter(Boolean);return as.find(a=>a.ls===lsId)||as[0]||null}
// the pending tasks of the ✅ To do list (el-todo.js; it starts once the student is known, so a short wait the first time)
async function ffPending(){for(let i=0;i<30&&!window.elTodoReady;i++)await new Promise(r=>setTimeout(r,100));
  if(!window.elTodoReady)return [];const f=await Promise.race([window.elTodoReady,new Promise(r=>setTimeout(()=>r(null),4000))]);
  try{return f?f():[]}catch(e){console.warn("todo",e);return []}}
// 🎲 the Games page and the pages its cards open (the LS vocabulary games): one chip, the others only let the student through
const ffGames=ca=>[{u:"lab/",p:"",n:"🎲 "+(ca?"Jocs":"Games")},{u:"lab/index.html",p:"",n:"",hide:true}]
  .concat((window.EL_LS||[]).filter(l=>!l.personal).map(l=>({u:l.id.replace("-","/")+"/vocabulary-games.html",p:"",n:"",hide:true})));
async function ffState(g){const left=cmEn(g).filter(x=>!x.ff&&!ffDone(x)),bk=ffBook(g),chs=bk?((window.EL_ACTIONS||{})[bk.id]||[]):[];
  const d=bk?ffDoneSet(bk):null,read=chs.filter(k=>d.has(k)).length,book=bk&&chs.length?{a:bk,read,n:chs.length,done:read>=chs.length}:null;
  const todo=(await ffPending()).filter(x=>!(bk&&samePath(x.u,bk.path)));
  return {left,book,todo,stage:left.length?0:book&&!book.done?1:todo.length?2:3}}
// give this student a stage's steps (replacing the last ones) and take them to the first
function ffGrant(g,k,gs){const f={s:g.s,until:g.until||Date.now()+60*60e3,k,gs};try{sessionStorage.setItem(FF_K,JSON.stringify(f))}catch(e){}
  const here=gs.filter(x=>x.p&&onPage(x.u)).map(x=>tabP(x.u,x.p));
  if(here.length){window.EL_CM_FREE=window.EL_CM_FREE||new Set();here.forEach(p=>window.EL_CM_FREE.add(p));if(window.elSecFree)elSecFree(here)}
  ffClose();b0();lockBar();cmJump(gs[0])}
const b0=()=>{const b=document.getElementById("el-lock");if(b)b.dataset.h=""};   // the bar is drawn again (a new chip)
const ffClose=()=>{const c=document.getElementById("el-ff");if(c)c.remove()};
const ffEsc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
const FF_CSS=`#el-ff{position:fixed;left:50%;top:calc(var(--el-lock-h,52px) + 10px);transform:translateX(-50%);z-index:2147482500;width:min(460px,calc(100vw - 24px));max-height:calc(100vh - var(--el-lock-h,52px) - 30px);overflow:auto;background:#fff;color:#0f172a;border:2px solid #facc15;border-radius:18px;box-shadow:0 14px 40px rgba(15,23,42,.28);font:15px/1.4 system-ui,sans-serif;text-align:left}
#el-ff .hd{display:flex;align-items:center;gap:8px;background:#fef9c3;padding:12px 16px;border-bottom:1px solid #fde68a}#el-ff .hd b{flex:1;font-size:18px;color:#422006}
#el-ff .hd button{border:0;background:none;font-size:20px;line-height:1;cursor:pointer;color:#713f12;padding:2px 6px}
#el-ff .bd{padding:12px 16px 16px}#el-ff .ld{margin:0 0 8px;color:#475569;font-size:14px}
#el-ff .first{background:#fef2f2;border:1px solid #fecaca;color:#991b1b;border-radius:12px;padding:10px 12px;margin:0 0 12px;font-weight:700}
#el-ff ol{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
#el-ff li{display:flex;gap:10px;align-items:flex-start;border:1.5px solid #e2e8f0;border-radius:14px;padding:10px 12px;background:#f8fafc;color:#64748b}
#el-ff li .n{flex:none;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font-weight:800;background:#e2e8f0;color:#475569}
#el-ff li .tx{flex:1;min-width:0}#el-ff li .tx b{display:block;color:#334155;font-size:15.5px}#el-ff li .tx small{display:block;font-size:13px}
#el-ff li.ok{background:#f0fdf4;border-color:#bbf7d0}#el-ff li.ok .n{background:#16a34a;color:#fff}#el-ff li.ok .tx b{color:#166534}
#el-ff li.on{background:#fffbeb;border-color:#f59e0b;color:#713f12;box-shadow:0 0 0 3px #fde68a}#el-ff li.on .n{background:#f59e0b;color:#fff}#el-ff li.on .tx b{color:#422006}
#el-ff .tasks{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
#el-ff button.go{border:0;border-radius:999px;background:#0f766e;color:#fff;font:800 14.5px system-ui,sans-serif;padding:9px 16px;cursor:pointer;margin-top:8px}
#el-ff .tasks button.go{margin:0;padding:7px 13px;font-size:13.5px;text-align:left}#el-ff .more{font-size:13px;color:#713f12;margin-top:6px}
#el-ff .wait{padding:18px 4px;color:#475569}
@media (max-width:640px){#el-ff{top:calc(var(--el-lock-h,52px) + 6px);border-radius:14px}#el-ff .hd b{font-size:16.5px}}`;
// ⚡ Finished early? card: the order, the stage the student is on (yellow), the ones done (green) and the button(s) for the next step
async function ffGo(){const g=LOCK;if(!g||!g.cm)return;if(document.getElementById("el-ff"))return ffClose();const ca=lockCa(),t=(c,e)=>ca?c:e;
  if(!document.getElementById("el-ff-css")){const st=document.createElement("style");st.id="el-ff-css";st.textContent=FF_CSS;document.head.append(st)}
  const c=document.createElement("div");c.id="el-ff";c.setAttribute("role","dialog");c.setAttribute("aria-label",t("Has acabat abans d'hora?","Finished early?"));
  c.innerHTML=`<div class="hd"><b>⚡ ${t("Has acabat abans d'hora?","Finished early?")}</b><button type="button" data-x aria-label="${t("Tanca","Close")}">✕</button></div><div class="bd"><p class="wait">${t("Un moment…","One moment…")}</p></div>`;
  document.body.append(c);c.addEventListener("click",e=>{if(e.target.closest("[data-x]"))ffClose()});
  const S=await ffState(g);if(!c.isConnected||LOCK!==g&&!(LOCK&&LOCK.s===g.s))return;
  const rows=[],lvl=i=>S.stage>i?"ok":S.stage===i?"on":"",go=(k,i,txt)=>`<button type="button" class="go" data-ffk="${k}" data-ffi="${i}">${ffEsc(txt)} →</button>`;
  if(S.book){const b=S.book,nx=Math.min(b.read+1,b.n);rows.push({k:"book",i:1,b:"📖 "+t("Llegeix el llibre","Read the book"),
    s:b.done?"✓ "+t("Llegit sencer","You've read it all"):t(`Capítol ${nx} de ${b.n}`,`Chapter ${nx} of ${b.n}`)+(b.read?t(` · ${b.read} llegits`,` · ${b.read} read`):""),
    x:S.stage===1?go("book",0,"📖 "+t("Continua el llibre","Go on with the book")):""})}
  const td=S.todo,show=td.slice(0,6);
  rows.push({k:"todo",i:2,b:"✅ "+t("Fes les tasques pendents","Do your pending tasks"),s:td.length?t(td.length===1?"1 tasca pendent":`${td.length} tasques pendents`,td.length===1?"1 task to do":`${td.length} tasks to do`):"✓ "+t("No en tens cap","You have none"),
    x:S.stage===2?`<div class="tasks">${show.map((x,i)=>go("todo",i,x.n||x.p||"")).join("")}</div>`+(td.length>show.length?`<div class="more">${t(`I ${td.length-show.length} més a ✅ Per fer`,`And ${td.length-show.length} more in ✅ To do`)}</div>`:""):""});
  rows.push({k:"games",i:3,b:"🎲 "+t("Juga","Play games"),s:t("Jocs de vocabulari i els jocs de l'examen","Vocabulary games and the exam games"),x:S.stage===3?go("games",0,"🎲 "+t("Ves als jocs","Go to the games")):""});
  const first=S.stage===0?`<div class="first">✋ ${t("Primer acaba la feina d'avui:","First finish today's work:")}<div class="tasks" style="margin-top:8px">${S.left.map((x,i)=>go("left",i,x.n||x.p||"")).join("")}</div></div>`:"";
  c.querySelector(".bd").innerHTML=first+`<p class="ld">${t("Quan acabis la feina de classe, fes-ho en aquest ordre:","When you finish the class work, do this in order:")}</p><ol>`
    +rows.map((r,j)=>`<li class="${lvl(r.i)}"><span class="n">${S.stage>r.i?"✓":j+1}</span><span class="tx"><b>${r.b}</b><small>${ffEsc(r.s)}</small>${r.x}</span></li>`).join("")+`</ol>`;
  c.onclick=e=>{if(e.target.closest("[data-x]"))return ffClose();const x=e.target.closest("button[data-ffk]");if(!x)return;const k=x.dataset.ffk,i=+x.dataset.ffi;
    if(k==="left"){const y=S.left[i];ffClose();if(y)cmJump(y);return}
    if(k==="book")return ffGrant(g,"book",[{u:S.book.a.path,p:"book",n:ffName("book",ca)}]);
    if(k==="todo"){const y=S.todo[i];if(y)ffGrant(g,"todo",[{u:y.u,p:y.p||"",n:"✅ "+(y.n||y.p||"")}]);return}
    if(k==="games")return ffGrant(g,"games",ffGames(ca))}}
function ffBtn(b,ca){const x=document.createElement("button");x.dataset.ff="1";x.textContent=ca?"⚡ He acabat":"⚡ I've finished";
  x.title=ca?"Has acabat abans d'hora? Mira què toca ara":"Finished early? See what to do next";
  x.style.cssText="border:0;border-radius:999px;padding:6px 16px;background:#facc15;color:#422006;font:800 14px system-ui,sans-serif;cursor:pointer";b.append(x)}
// may the student open this tab now (a step the teacher opened on this page, or the one they were already on)
const cmTabOk=p=>{const h=cmHere(LOCK);return h.some(x=>!x.p||x.p===p)||p===lockFrom};
window.elCmTabOk=p=>!LOCK||!LOCK.cm||!lockHere()||cmTabOk(p);   // ⛶ one step full screen (el-app.js): Previous / Next only through these
// only today's steps on a learning path page (students and the class tab): keep = panel ids shown in any case
function cmTabs(vis,keep){const ts=[...document.querySelectorAll(".tab[data-panel]")];if(!ts.length&&!document.querySelector(".el-cm-hide"))return;
  const pv=(Array.isArray(vis)?vis:[]).map(String).filter(k=>onPage(k.slice(0,k.indexOf("#")))).map(k=>tabP(k.slice(0,k.indexOf("#")),k.slice(k.indexOf("#")+1))),on=pv.length>0&&!pv.includes(""),ok=new Set([...pv,...(keep||[])]);
  if(on&&!document.getElementById("el-cm-hide-css")){const st=document.createElement("style");st.id="el-cm-hide-css";st.textContent=".tab.el-cm-hide{display:none!important}";document.head.append(st)}
  ts.forEach(t=>{const x=on&&!ok.has(t.dataset.panel);if(t.classList.contains("el-cm-hide")!==x)t.classList.toggle("el-cm-hide",x)});
  return on}
// the steps opened for the class on this page are given back if this student's page had them hidden, 🏫 or read-only (lockSections)
function cmFree(g){const ps=cmHere(g).map(x=>x.p).filter(Boolean);if(!ps.length)return;const f=window.EL_CM_FREE=window.EL_CM_FREE||new Set(),nw=ps.filter(p=>!f.has(p));
  if(!nw.length)return;nw.forEach(p=>f.add(p));if(window.elSecFree)elSecFree(nw)}
// a chip of the bar: the tab on this page, or the work saved and that page
async function cmJump(x){if(onPage(x.u)){const t=x.p&&document.querySelector('.tab[data-panel="'+CSS.escape(x.p)+'"]');if(t){lockFrom=null;t.click()}else window.scrollTo(0,0);return}
  try{const f=document.activeElement;if(f&&f!==document.body&&f.blur)f.blur()}catch(e){}
  try{if(timer){clearTimeout(timer);await send()}}catch(e){console.warn("go",e)}const u=new URL(x.u,ROOT);u.hash=x.p||"";location.href=u.href}
function lockToast(t){const ca=lockCa();let n=document.getElementById("el-lock-toast");if(!n){n=document.createElement("div");n.id="el-lock-toast";
  n.style.cssText="position:fixed;left:50%;bottom:90px;transform:translateX(-50%);z-index:2147483001;max-width:92vw;padding:12px 18px;border-radius:12px;background:#7f1d1d;color:#fff;font:600 15px system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.3);text-align:center";document.body.append(n)}
  n.textContent=t||(ca?"🔒 El professor t'ha fet venir aquí: no pots anar a cap altra part de la web fins que et deixi anar.":"🔒 Your teacher brought you here: you can't go to any other part of the website until they let you go.");
  clearTimeout(lockToast.t);lockToast.t=setTimeout(()=>n.remove(),3500)}
// the 🎓 class mode bar is fixed on top of the page: the page moves down by its height (body padding, the sticky top bar with 🔍 Dictionary,
// the left menu and the path's column), so nothing hides behind it (problem report, 2ESOA, 13 Nov 2026: "the top green line is covering
// the dictionary"). The 🌟 line under it counts too; ⛶ one step full screen (slpPlace, !important) adds the bars' height itself.
function lockPad(){const b=document.getElementById("el-lock")||document.getElementById("el-self"),c=document.getElementById("el-cmcheer"),h=(b&&b.offsetHeight||0)+(c&&c.offsetHeight||0),R=document.documentElement;
  if(h&&!document.getElementById("el-lock-pad-css")){const st=document.createElement("style");st.id="el-lock-pad-css";
    st.textContent="body.el-lockpad{padding-top:var(--el-lock-h,0px)}body.el-lockpad .topbar{top:var(--el-lock-h,0px)!important}body.el-lockpad .elrail{top:var(--el-lock-h,0px)!important}body.el-lockpad .ellpside{top:calc(var(--el-lock-h,0px) + 70px);max-height:calc(100vh - var(--el-lock-h,0px) - 80px)}";document.head.append(st)}
  if(R.style.getPropertyValue("--el-lock-h")!==h+"px")R.style.setProperty("--el-lock-h",h+"px");
  if(document.body.classList.contains("el-lockpad")!==!!h)document.body.classList.toggle("el-lockpad",!!h)}
function lockBar(){lockBar0();lockPad();lockTell()}
// section-next.js: "Next section →" / "Next Learning Path →" hide while 🎓 class mode or the teacher's 🔒 would not let the student go there
// (the click only met the 🔒 message and students took it for "I can't hand it in": 2ESOB, 17 Nov 2026). Same rules as the click guard below.
window.elNextBlocked=p=>{if(!lockHere())return false;let t=document.querySelector('.tab[data-panel="'+CSS.escape(p)+'"]');
  if(t&&t.classList.contains("el-sec-hide")){const ts=[...document.querySelectorAll(".tab[data-panel]")];t=ts.slice(ts.indexOf(t)+1).find(x=>!x.classList.contains("el-sec-hide"));if(!t)return false;p=t.dataset.panel}
  return LOCK.cm?!cmTabOk(p):!!LOCK.p&&p!==LOCK.p&&p!==lockFrom};
window.elLeaveBlocked=h=>{if(!lockHere())return false;let u;try{u=new URL(h,location.href)}catch(e){return false}
  return !(LOCK.cm&&cmEn(LOCK).some(x=>new URL(x.u,ROOT).pathname===u.pathname))};
function lockTell(){let k="";try{k=lockHere()?JSON.stringify([LOCK.cm?cmHere(LOCK).map(x=>x.p||""):LOCK.p||"",lockFrom||"",cmEn(LOCK).map(x=>x.u)]):""}catch(e){}
  if(lockTell.k===k)return;lockTell.k=k;document.dispatchEvent(new Event("el-lock"))}
function lockBar0(){let b=document.getElementById("el-lock");
  if(!lockHere()){if(b)b.remove();return}
  const ca=lockCa(),cur=curPanel(),g=LOCK;if(g.p&&cur===g.p)lockFrom=null;
  if(!b){b=document.createElement("div");b.id="el-lock";b.style.cssText="position:fixed;top:0;left:0;right:0;z-index:2147482000;display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;justify-content:center;padding:10px 14px;font:600 15px system-ui,sans-serif;background:#0f766e;color:#fff;box-shadow:0 2px 8px rgba(0,0,0,.2)";
    b.onclick=e=>{const x=e.target.closest("button");if(!x)return;if(x.dataset.ff)return ffGo();if(x.dataset.k){const y=cmEn(LOCK)[+x.dataset.k];if(y)cmJump(y);return}const t=document.querySelector('.tab[data-panel="'+CSS.escape(LOCK.p)+'"]');if(t){lockFrom=null;t.click()}};document.body.prepend(b);const old=document.getElementById("el-pull");if(old)old.remove()}
  const en=cmEn(g);
  if(en.length>1){   // several steps open: a chip for each, the one the student is on marked
    const ff=!!g.cm;let at2=en.findIndex(x=>onPage(x.u)&&(!x.p||x.p===cur));if(at2>=0&&en[at2].hide)at2=en.findIndex(x=>x.ff&&!x.hide);   // ⚡ always in class mode; a games page: the 🎲 chip
    const h2="m|"+ca+"|"+ff+"|"+at2+"|"+en.map(x=>x.u+"#"+x.p+"#"+x.n).join("|");if(b.dataset.h===h2)return;b.dataset.h=h2;
    b.textContent="🎓 "+(ca?"Mode classe · pots treballar a:":"Class mode · you can work on:")+" ";
    en.forEach((x,i)=>{if(x.hide)return;const c=document.createElement("button");c.dataset.k=String(i);c.textContent=(i===at2?"● ":"")+(x.n||x.p);
      c.style.cssText="border:2px solid #fff;border-radius:999px;padding:5px 14px;font:800 14px system-ui,sans-serif;cursor:pointer;"+(i===at2?"background:#fff;color:#0f766e":"background:#0f766e;color:#fff");b.append(c)});if(ff)ffBtn(b,ca);return}
  const off=g.p&&cur!==g.p,h=(g.cm?"🎓 "+(ca?"Mode classe: segueixes el professor":"Class mode: you follow your teacher"):"🔒 "+(ca?"El professor et manté aquí":"Your teacher is keeping you here"))+(g.p?(ca?": pestanya ":": tab ")+(g.pn||g.p):"")
    +(off?(ca?". Acaba el que estàs fent i ves-hi.":". Finish what you are doing and go there."):"")+"|"+(off?(ca?"Ves-hi":"Go there")+" →":"");
  const ff=!!g.cm;
  if(b.dataset.h!==h+ff){b.dataset.h=h+ff;const [t,btn]=h.split("|");b.textContent=t+" ";if(btn){const x=document.createElement("button");x.textContent=btn;
    x.style.cssText="background:#fff;color:#0f766e;border:0;border-radius:999px;padding:6px 16px;font-weight:800;cursor:pointer";b.append(x)}if(ff)ffBtn(b,ca)}}
// clicks on the kept page: links that leave it, and other tabs when the teacher chose one
document.addEventListener("click",e=>{if(!lockHere())return;
  const t=e.target.closest&&e.target.closest(".tab[data-panel]");
  if(t&&(LOCK.cm?!cmTabOk(t.dataset.panel):LOCK.p&&t.dataset.panel!==LOCK.p&&t.dataset.panel!==lockFrom)){e.preventDefault();e.stopImmediatePropagation();
    const en=cmEn(LOCK);lockToast(en.length>1?(lockCa()?"🔒 Ara pots treballar a: ":"🔒 Now you can work on: ")+en.filter(x=>!x.hide).map(x=>x.n||x.p).join(", "):(lockCa()?"🔒 Ara toca la pestanya ":"🔒 Now it is the tab ")+(LOCK.pn||LOCK.p)+(lockCa()?": el professor l'obrirà quan toqui.":": your teacher will open the next one."));return}
  const a=e.target.closest&&e.target.closest("a[href]");if(!a)return;let u;try{u=new URL(a.href,location.href)}catch(x){return}
  if(u.origin===location.origin&&u.pathname===location.pathname)return;   // a tab or a link on this page
  // 📓 in class mode: the notebook is another page, so it opens as a ✍ quick note over this one and is saved into the notebook
  // (problem report, 2ESOB, 17 Nov 2026: "when we are listening to the teacher we can't take notes")
  // 📓 My notebook in class mode is always allowed (Roger, 17 Nov 2026: "when students are in class mode, I want them to be able to go to
  // their notebooks and do whatever they want"): the LS page's #notes opens; cmGo keeps them there with a ↩ Back to the class button
  if(LOCK.cm&&nbLink(u))return;
  if(a.id==="el-nbfab"){e.preventDefault();e.stopImmediatePropagation();if(!qnOpen())lockToast();return}
  if(LOCK.cm&&u.origin===location.origin&&cmEn(LOCK).some(x=>new URL(x.u,ROOT).pathname===u.pathname))return;   // another step the teacher opened
  if(/\.(pdf|mp3|mp4|m4a|png|jpe?g)$/i.test(u.pathname))return;   // study PDFs, audio and video of the path
  e.preventDefault();e.stopImmediatePropagation();lockToast()},true);
const lockFree=()=>lockToast(lockCa()?"🔓 El professor t'ha deixat anar: ja pots moure't per la web.":"🔓 Your teacher has let you go: you can move around the website again.");
setInterval(()=>{if(LOCK&&!lockOn(LOCK)){LOCK=null;lockBar();lockFree()}else if(LOCK)lockBar();cmTopSpace();cmStudentTabs();fsRefresh();fsCheck();hereTick()},1000);
// the student's tabs in class mode (only today's steps); after class mode every tab is back
// Not on the teacher's class tab while its class mode runs (html.elcmon, el-catalog.js): there cmTeacher hides the tabs itself, and this
// "every tab back" undid it once a second, so all the steps flashed in the path's column and it jumped (teacher report, 2ESOB, 19 Nov 2026:
// "the left menu kept moving, things appeared and disappeared"). quit() gives every tab back when it stops.
function cmStudentTabs(){const g=LOCK&&LOCK.cm?LOCK:null;if(!g){if(!document.documentElement.classList.contains("elcmon"))cmTabs(null);return}
  if(!cmTabs(g.vis,cmHere(g).map(x=>x.p)))return;
  const at=document.querySelector(".tab.active[data-panel]");if(!at||!at.classList.contains("el-cm-hide"))return;
  const h=cmHere(g),p=(h.find(x=>x.me)||h[0]||{}).p,t=p&&document.querySelector('.tab[data-panel="'+CSS.escape(p)+'"]');if(t){lockFrom=null;t.click()}}   // the class is over (until) or LOCK_MS passed
// ⛶ Full screen in class (Roger, 5 Nov 2026: "put students in full screen mode when I say it and they don't have a way to get out"; then
// "make the selected group go full screen" from the top right of the dashboard): live/{group}.fs = {on, at, until} (the doc gamePush
// already listens to). While it is on, every page of the site covers itself until the student taps it (a browser only goes full screen
// after a tap), then Esc is locked (Chrome and Chromebooks: Keyboard Lock, only holding Esc down leaves). Leaving full screen brings the
// cover back and writes live/{group}/fsLeft/{email} = {name, at, pull: fs.at, n}: the dashboard and the teacher bar list who left. Moving
// to another page of the site (a link, the pull-up, a reload: beforeunload/pagehide) does not count as leaving, and inside class.html
// it needs no new tap either (🖥 below). When it is switched off or
// the class ends, the page leaves full screen. Never on a recall checkpoint or the sample exam (they have their own full screen: leaving
// it sends the checkpoint), nor in the teacher's student view; not on iPhones (no full screen for pages there).
let fsBye=false;addEventListener("beforeunload",()=>{fsBye=true});addEventListener("pagehide",()=>{fsBye=true});   // going to another page: not leaving
// 🖥 Full screen that stays on from page to page (Roger, 16 Nov 2026: "whenever they change from one page of the website to another they
// exit fullscreen"). A browser leaves full screen whenever the whole tab changes page, but not when a frame inside the tab does. So while
// the class full screen is on, a student's page opens itself inside class.html (one frame the size of the window, EL_SHELL; no sign-in, no
// reads), and from then on that frame is what moves from page to page: links, the pull-up, the game and back. The one tap puts class.html
// in full screen, and it stays until the student holds Esc or the teacher turns it off. FW = the window whose full screen counts (class.html
// in the frame). When the group's full screen ends, the page leaves the frame (one reload). Recall checkpoints and the sample exam leave it
// too (their own full screen sends the checkpoint when it is left). Other tabs, PDFs opened in a new tab and a reload of class.html still need the tap.
const inShell=(()=>{try{return window.parent!==window&&!!window.frameElement&&window.frameElement.id==="el-shell"&&window.parent.EL_SHELL===true}catch(e){return false}})();
const FW=inShell?window.parent:window,SHELL=new URL("class.html",ROOT);
let shellGo=false,fsKnown=false;   // fsKnown: the group's live doc has been read once on this page (gamePush)
// a page with its own full screen: checkpoints, the sample exam and the web exam (el-web-exam.js, window.EL_EXAM): never inside class.html
const ownFs=()=>{const h=(window.EL_CATALOG||[]).find(y=>y.id===actId);return !!(h&&(h.checkpoint||/sample-exam$/.test(h.id)))||!!window.EL_EXAM};
function shellLeave(){if(!inShell||shellGo)return;shellGo=true;fsBye=true;try{FW.location.replace(location.href)}catch(e){}}
function shellEnter(){if(inShell||shellGo||window.top!==window||ownFs())return false;shellGo=true;fsBye=true;
  const u=new URL(SHELL);u.searchParams.set("u",location.pathname+location.search+location.hash);
  try{const r=document.referrer?new URL(document.referrer):null;if(r&&r.origin===location.origin&&!/\/class\.html$/.test(r.pathname)&&r.pathname!==location.pathname)u.searchParams.set("b",r.pathname+r.search+r.hash)}catch(e){}   // ↩ back (class.html)
  location.replace(u.href);return true}
const FD=FW.document,FE=FD.documentElement;
const fsCan=()=>!!(FD.fullscreenEnabled||FD.webkitFullscreenEnabled),fsIs=()=>!!(FD.fullscreenElement||FD.webkitFullscreenElement);
// FSG = the full screen in force: the teacher's switch (FSL = live/{group}.fs), which 🎓 Class mode writes; elFsEff in el-catalog.js. The
// timetable alone (TT = live/{group}.tt) no longer turns it on (Roger, 24 Nov 2026: "only … when I start class mode, not when it's English time")
let fsWas=false,FSG=null,FSL=null,TT=null,SELF_ON=false;   // SELF_ON: 🧑‍🎓 self study (cmSelf): no full screen, no away cover
// the group's timetable for "5 minutes before the class" (elClassOpenAt in el-catalog.js): kept for this page and the next ones in this browser
function keepTT(tt){if(!tt||!tt.slots||!myGroup)return;(window.EL_LIVE_TT=window.EL_LIVE_TT||{})[myGroup]=tt;try{localStorage.setItem("el_tt_"+myGroup,JSON.stringify(tt))}catch(e){}}
function fsRefresh(){const was=FSG&&FSG.at;FSG=myGroup?elFsEff(FSL,TT):null;if((FSG&&FSG.at)!==was)beatAt=0}
const fsKey=()=>"el_fs_"+(FSG&&FSG.at);
const fsSS=(k,v)=>{try{if(v===undefined)return sessionStorage.getItem(k);if(v===null)sessionStorage.removeItem(k);else sessionStorage.setItem(k,v)}catch(e){return null}};
const fsOnG=()=>!!(FSG&&FSG.on&&FSG.at&&Date.now()<(FSG.until||FSG.at+LOCK_MS));   // FSG is refreshed every second
function fsWanted(){if(frozen||SELF_ON||!myGroup||!fsOnG()||!fsCan())return false;return !ownFs()}
// fsLeft(false): a leave of the page (el-away.js below), not of the full screen; every write carries both counts of this class (n, aw/awMs)
async function fsLeft(fs=true){if(!user||!myGroup||!FSG)return;const k=fsKey()+"_n",n=(+fsSS(k)||0)+(fs?1:0);if(fs)fsSS(k,String(n));const c=awayCount(FSG.at);
  try{await setDoc(doc(db,"live",myGroup,"fsLeft",(user.email||"").toLowerCase()),{name:user.displayName||user.email||"",at:serverTimestamp(),pull:FSG.at,n,aw:c.aw,awMs:c.awMs},{merge:true})}catch(e){console.warn("full screen",e)}}
function fsGo(){try{const K=FW.navigator.keyboard,lk=()=>{try{if(K&&K.lock)K.lock(["Escape"]).catch(()=>{})}catch(e){}},
  r=(FE.requestFullscreen||FE.webkitRequestFullscreen).call(FE);if(r&&r.then)r.then(()=>{lk();fsCheck()},()=>{});else{lk();fsCheck()}}catch(e){}}
function fsCheck(){let c=document.getElementById("el-fs");
  if(shellGo)return;
  if(inShell&&(ownFs()||SELF_ON||authKnown&&!isStudent(user)||fsKnown&&!fsOnG())){shellLeave();return}   // 🖥 the full screen is over (or this page has its own)
  if(!fsWanted()){if(c)c.remove();if(fsWas){fsWas=false;try{const K=FW.navigator.keyboard;if(K&&K.unlock)K.unlock()}catch(e){}
    try{if(fsIs())(FD.exitFullscreen||FD.webkitExitFullscreen).call(FD)}catch(e){}}return}
  if(fsIs()){if(c)c.remove();fsWas=true;return}
  if(!fsWas&&shellEnter())return;   // 🖥 into class.html first (a page load, no tap): the tap there keeps full screen from page to page
  const left=fsWas;if(left){fsWas=false;setTimeout(()=>{if(!fsBye)fsLeft()},500)}   // after the cover is on (fsLeft's write can call fsCheck again); not when the page is being left
  const ca=lockCa(),again=left||(+fsSS(fsKey()+"_n")||0)>0;
  c=document.getElementById("el-fs");if(!c){c=document.createElement("div");c.id="el-fs";c.setAttribute("role","button");
    c.style.cssText="position:fixed;inset:0;z-index:2147483002;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:24px;text-align:center;background:#0f766e;color:#fff;font:600 18px system-ui,sans-serif;cursor:pointer";
    c.onclick=fsGo;document.body.append(c)}
  const h=(again?(ca?"Has sortit de la pantalla completa. El professor ho veu.":"You left full screen. Your teacher can see it."):(ca?"El professor vol aquesta pàgina a pantalla completa.":"Your teacher wants this page in full screen."))
    +"|"+(ca?"Toca la pantalla per continuar":"Tap the screen to go on");
  if(c.dataset.h!==h){c.dataset.h=h;const [a,b]=h.split("|");c.innerHTML='<div style="font-size:64px">⛶</div><div style="font-size:26px;font-weight:800;max-width:640px"></div><div style="background:#fff;color:#0f766e;border-radius:999px;padding:14px 30px;font-size:20px;font-weight:800"></div>';
    c.children[1].textContent=a;c.children[2].textContent=b+" →"}}
// 📴 Not connected (Roger, 6 Nov 2026: "if they disconnect, the teacher's board shows it"): while full screen is on for the group (a pull-up
// turns it on too), every student page beats live/{group}/here/{email} = {name, seen, off} every EL_BEAT_MS (one write a minute) and
// at once with off:true when the page is hidden (lid closed, another window or app; not when going to another page of the site).
// The dashboard and the learning path's teacher bar list who stopped beating for EL_HERE_MS or is off (elClassWatch in el-catalog.js).
// The class game player beats the same document during a game (lab/game/play.js).
let beatAt=0;
function hereBeat(off){if(!user||!isStudent(user)||AS||!myGroup)return;beatAt=Date.now();
  setDoc(doc(db,"live",myGroup,"here",(user.email||"").toLowerCase()),{name:user.displayName||user.email||"",seen:serverTimestamp(),off:!!off,fs:fsOk()}).catch(e=>console.warn("here",e))}
// fs: in full screen, or on a page that needs none (a recall checkpoint, the sample exam, no full screen on the device); sent at once when it changes
const fsOk=()=>!fsWanted()||fsIs();let fsOkWas=null;
function hereTick(){if(!fsOnG())return;const k=fsOk();if(k!==fsOkWas&&fsOkWas!==null&&document.visibilityState==="visible"){fsOkWas=k;hereBeat(false);return}fsOkWas=k;
  if(document.visibilityState==="visible"&&Date.now()-beatAt>=(window.EL_BEAT_MS||60e3))hereBeat(false)}
document.addEventListener("visibilitychange",()=>{if(!fsOnG())return;if(document.visibilityState==="hidden"){if(!fsBye)hereBeat(true)}else hereBeat(false)});
// 🎓 Other windows, tabs and apps during the class (Roger, 17 Nov 2026: "And the same in class mode or when students have class"; el-away.js):
// while the group's class is on (the timetable or class mode: fsOnG), leaving the page for another window or app covers it ("Come back to the
// class!"), coming back needs a tap on 🎓 Back to the class (it puts the full screen back too), and each leave is counted in
// live/{group}/fsLeft/{email}.aw/.awMs (one write per leave). While away the "here" beat says off (the dashboard: screen closed or another
// window). Not on the exam, checkpoints or the sample exam (their own lock), nor for the teacher's student view.
let awOff=false;
awayWatch({FD,ca:lockCa,z:2147483003,key:()=>FSG&&FSG.at,
  on:()=>!!(user&&isStudent(user)&&!AS&&myGroup&&fsOnG()&&!SELF_ON&&!ownFs()&&!window.EL_EXAM_LOCK),
  off:x=>{if(x){if(!awOff&&FD.visibilityState==="visible"){awOff=true;hereBeat(true)}}else if(awOff){awOff=false;hereBeat(false)}},
  back:()=>fsLeft(false),fsNeed:()=>fsWanted()&&!fsIs(),fsGo});
const fsChanged=()=>{fsCheck();hereTick()},FSEV=["fullscreenchange","webkitfullscreenchange"];FSEV.forEach(t=>FD.addEventListener(t,fsChanged));
// in class.html the listeners are on its document: taken off when this page goes (the frame's next page adds its own)
if(inShell){addEventListener("pagehide",()=>FSEV.forEach(t=>FD.removeEventListener(t,fsChanged)));addEventListener("pageshow",e=>{if(e.persisted)FSEV.forEach(t=>FD.addEventListener(t,fsChanged))})}
function goTo(g,first){
  cmCheer(g);   // 🌟 the first 4 minutes of class mode (gone when it stops)
  cmRemind(g);   // ✅ Finish all your activities, once, when the teacher's warm-up ends
  cmLook(g);   // 👀 Look at the screen, while the teacher shows the class map
  const was=LOCK;LOCK=lockOn(g)?g:null;
  if(was&&!LOCK){lockBar();lockFree();return}
  if(cmReport(g))return;   // 📄 the teacher is showing the term report drafts: the student stays on their own
  if(cmSelf(g)){if(LOCK){LOCK=null;lockBar()}return}   // 🧑‍🎓 self study: free on the site, their own pending work first
  if(g&&g.until&&Date.now()>=g.until)return;   // the class it was made in is over
  if(g&&g.cm)return cmGo(g);
  if(!g||!g.a||!g.at)return;const k="el_go_"+g.at;let seen=false;try{seen=!!localStorage.getItem(k)}catch(e){}
  const a=(window.EL_CATALOG||[]).find(y=>y.id===g.a);if(!a)return;
  const here=window.EL_CATALOG&&EL_CATALOG.find(y=>y.id===actId);
  if(here&&(here.checkpoint||/sample-exam$/.test(here.id))||/[?&]live=/.test(location.search))return;
  if(!LOCK&&(seen||first&&Math.abs(Date.now()-g.at)>GO_MS))return;   // not kept: once per pull-up, and not an old one already there when the page opened
  try{origSet.call(localStorage,k,"1")}catch(e){}
  const url=new URL(a.path,ROOT);url.hash=g.p?g.p:"";
  // already on that learning path (Roger, 3 Nov 2026: "if one is already there they don't get pulled"): nothing moves and nothing
  // reloads, they stay in the section they are working on; when the teacher chose another tab, a bar offers to go to it
  if(here&&here.id===a.id){const at=document.querySelector(".tab.active[data-panel]");
    if(LOCK){if(!seen)lockFrom=at&&at.dataset.panel!==g.p?at.dataset.panel:null;lockBar();return}
    if(g.p&&(!at||at.dataset.panel!==g.p))tabBar(g);return}
  goMove(url,(g.t||a.title)+(g.pn?" · "+g.pn:""),seen&&LOCK,seen&&LOCK?2:5,"📌");
}
// the notice that saves the student's work and takes them to url (back: sent back to where they are kept)
function goMove(url,name,back,secs,icon){const was=document.getElementById("el-go-move");
  if(was){was.dataset.u=url.href;was.querySelector(".n").textContent=name;was.querySelector("a.go").href=url.href;return}   // the teacher moved again: the newest place
  const ca=lockCa(),o=overlay('<div style="max-width:560px"><div class="ic" style="font-size:48px"></div><h1></h1><p class="n" style="font-size:22px;font-weight:800"></p><p class="c"></p><p><a class="go" style="display:inline-block;background:#0f766e;color:#fff;border-radius:999px;padding:12px 24px;text-decoration:none;font-weight:800"></a></p></div>');
  o.id="el-go-move";o.dataset.u=url.href;o.style.zIndex="2147483000";   // above the My week panel and the bottom bar
  o.querySelector(".ic").textContent=icon;
  o.querySelector("h1").textContent=back?(ca?"🔒 El professor et manté a:":"🔒 Your teacher is keeping you on:"):(ca?"El professor et porta a:":"Your teacher is taking you to:");
  o.querySelector(".n").textContent=name;
  const go=o.querySelector("a.go");go.href=url.href;go.textContent=(ca?"Ves-hi ara":"Go now")+" →";
  // the first time: a few seconds to save their work; sent back again while kept there: 2 seconds
  let n=secs;const c=o.querySelector(".c"),tick=()=>{c.textContent=back?(ca?"Hi tornes en "+n+" s.":"Going back in "+n+" s."):(ca?"Desant la teva feina… hi vas en "+n+" s.":"Saving your work… going there in "+n+" s.")};tick();
  const leave=async()=>{clearInterval(iv);c.textContent=ca?"Desant…":"Saving…";
    try{if(timer){clearTimeout(timer);await send()}}catch(e){console.warn("go",e)}location.href=o.dataset.u};
  // the field being typed in saves on change/blur, then the 1.5-second cloud save runs during the countdown
  try{const f=document.activeElement;if(f&&f!==document.body&&f.blur)f.blur()}catch(e){}
  const iv=setInterval(()=>{n--;if(n<=0)leave();else tick()},1000);
  go.onclick=e=>{e.preventDefault();leave()};
}
/* 📓 The notebook during class mode (Roger, 17 Nov 2026: "when students are in class mode, I want them to be able to go to their notebooks
   and do whatever they want"): the 📓 button (or any link to an LS page's #notes) opens the whole notebook, and class mode does not send them
   back while it is open. A ↩ button at the bottom says where the teacher is and takes them there (the step the teacher is on, their work
   saved first). When the teacher moves, the button names the new place; closing the notebook (#notes left) sends them back as before. */
const nbLink=u=>{try{return u.origin===location.origin&&u.hash==="#notes"&&/\/(2|4)eso\/[^/]+\/(index\.html)?$/.test(u.pathname)}catch(e){return false}};
const nbHere=()=>nbLink(new URL(location.href));
function cmNbBar(g){let b=document.getElementById("el-cm-nb");
  if(!g||!g.cm||!nbHere()||!user||!isStudent(user)||AS){if(b)b.remove();return}
  const ca=lockCa(),x=cmEn(g)[0];if(!x)return;
  if(!b){b=document.createElement("button");b.type="button";b.id="el-cm-nb";
    b.style.cssText="position:fixed;left:max(14px,env(safe-area-inset-left,0px));bottom:max(14px,env(safe-area-inset-bottom,0px));z-index:2147482000;max-width:min(460px,calc(100vw - 90px));padding:12px 20px;border:0;border-radius:999px;background:#0f766e;color:#fff;font:800 15px system-ui,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.28);cursor:pointer;text-align:left";
    b.onclick=()=>{const y=LOCK&&LOCK.cm?cmEn(LOCK)[0]:null;if(y)cmJump(y)};document.body.append(b)}
  const t="🎓 "+(ca?"Torna a la classe":"Back to the class")+(x.n?" · "+x.n:"")+" →";if(b.textContent!==t)b.textContent=t;
  b.title=ca?"El professor és aquí. La teva llibreta queda desada.":"Your teacher is here. Your notebook stays saved."}
// the notebook closed (#notes left) while class mode lasts: back to the class, as from any other page
addEventListener("hashchange",()=>{if(LOCK&&LOCK.cm&&elCmOn(LOCK)&&!nbHere())cmGo(LOCK);else if(LOCK&&LOCK.cm)cmNbBar(LOCK)});
// 🎓 Class mode (Roger, 6 Nov 2026: "instead of pulling students to the LS, I want to go class mode, and this makes students go wherever you
// are in the LS. When we go to class mode, a new tab is opened so that I can check other stuff"). live/{group}.go = {cm: true, u, p, pn, t,
// at, s, lock, until} (elCmOn in el-catalog.js), written by the teacher's class tab each time it moves (cmTeacher below). On the student's
// side (the live/{group} listener of gamePush, no extra reads): on the same page only the tab changes, in place (nothing reloads, what
// they typed stays); on another page a 3-second notice saves their work and takes them there (2 seconds when they went somewhere else
// and are sent back). While it lasts they are kept there like a pull-up (lock: links that leave the page and the other tabs are blocked).
// Not out of a recall checkpoint, the sample exam or a followed presentation. It ends with ⏹ Stop or the end of the class (until).
function cmGo(g){
  if(REP_ON)return void cmReport(g);   // 📄 on their term report while the teacher shows the drafts
  if(nbHere()){cmNbBar(g);return}   // 📓 in their notebook: they stay, the ↩ button takes them back
  cmNbBar(null);
  const here=window.EL_CATALOG&&EL_CATALOG.find(y=>y.id===actId);
  if(here&&(here.checkpoint||/sample-exam$/.test(here.id))||/[?&]live=/.test(location.search)||!LOCK)return;
  const url=cmUrl(g),k="el_go_"+g.at;let seen=false;try{seen=!!localStorage.getItem(k)}catch(e){}
  try{origSet.call(localStorage,k,"1")}catch(e){}
  // several steps open (go.ps): a student on one of them stays there; on this page but on another tab, to the teacher's tab (or the first
  // step open here); on another page with none, to the teacher's page as before
  const h=cmHere(g),multi=cmEn(g).length>1;
  if(h.length){lockFrom=null;cmFree(g);
    const at=document.querySelector(".tab.active[data-panel]"),cur=curPanel(),stay=multi&&h.some(x=>!x.p||x.p===cur);
    const p=location.pathname===url.pathname?g.p:h[0].p,t=!stay&&p&&document.querySelector('.tab[data-panel="'+CSS.escape(p)+'"]');
    if(t&&t!==at){try{const f=document.activeElement;if(f&&f!==document.body&&f.blur)f.blur()}catch(e){}t.click()}
    cmStudentTabs();lockBar();return}
  goMove(url,(g.t||"")+(g.pn?" · "+g.pn:""),seen,seen?2:3,"🎓");
}
// 🌟 The student's encouraging sentence in class mode (Roger, 9 Nov 2026: "when they are on class mode they don't see the sentence where I
// tell them positive things, can you make it visible for 4 minutes once I start the class mode? on the top of their screen"): the same
// "Hi Pau, …" line as their board (ELCheer.student in el-cheer.js, Catalan for Starter/Base), in a bar at the top of whatever page class
// mode takes them to, for the first 4 minutes after the teacher started it (go.s), then it goes away. No extra reads or writes.
// ✅ Finish all your activities (Roger, 21 Nov 2026: after the warm-up games, "I want to remind them that they need to do all the activities. I
// also want them to see what activities they need to do"): when the teacher's class tab ends the warm-up it writes go.rem = {s, at}
// (el-cm-agenda.js remind); each student in that class mode gets their own card once (el-todo.js remind: their bars and the tabs still to
// do, from the ✅ To do list's own reads). A student who joins later in the first 20 minutes gets it too. Not on the dashboard.
const REM_MS=20*60e3;
function cmRemind(g){const r=g&&g.cm&&g.rem;if(!r||r.s!==g.s||!(Date.now()-r.at<REM_MS)||onDash||!user||!(isStudent(user)||AS))return;
  const k="el_rem_seen";let was="";try{was=localStorage.getItem(k)||""}catch(e){}if(was===String(r.s))return;
  try{origSet.call(localStorage,k,String(r.s))}catch(e){}
  import(new URL("shared/js/el-todo.js",ROOT).href).then(m=>m.remind()).catch(e=>console.warn("finish reminder",e))}
// 👀 Look at the screen (Roger, 21 Nov 2026: "In class mode I want to be able to show this [the class map] to students, when I show it on the
// panel, they see look at the panel"): while the teacher's class tab shows ⛵ the class map (el-cm-agenda.js mapOpen writes go.look = {s, at}
// and clears it on ✕ Close), every student in that class mode gets a cover over the page; it goes when go.look goes (or after 15 minutes,
// if the teacher's tab closed without clearing it). Their work stays as it is underneath. Not on the dashboard.
const LOOK_MS=15*60e3;let lookT=0;
function lookOff(){clearTimeout(lookT);const x=document.getElementById("el-look");if(x)x.remove()}
function cmLook(g){const l=g&&g.cm&&g.look;if(!l||l.s!==g.s||!(Date.now()-l.at<LOOK_MS)||onDash||!user||!(isStudent(user)||AS))return lookOff();
  clearTimeout(lookT);lookT=setTimeout(lookOff,Math.max(1e3,l.at+LOOK_MS-Date.now()));if(document.getElementById("el-look"))return;
  const ca=lockCa(),x=document.createElement("div");x.id="el-look";x.setAttribute("role","alert");
  x.innerHTML=`<div><span>👀</span><b>${ca?"Mira la pantalla!":"Look at the screen!"}</b><small>${ca?"Look at the screen!":"Mira la pantalla!"}</small></div>`
    +`<style>#el-look{position:fixed;inset:0;z-index:2147482400;background:rgba(15,23,42,.82);display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;color:#fff;text-align:center}`
    +`#el-look div{display:flex;flex-direction:column;align-items:center;gap:6px}#el-look span{font-size:clamp(70px,14vw,150px);line-height:1;animation:ellk 1.6s ease-in-out infinite}`
    +`#el-look b{font-size:clamp(30px,5vw,56px);color:#fff}#el-look small{font-size:clamp(16px,2vw,22px);color:#e2e8f0}@keyframes ellk{50%{transform:scale(1.12)}}@media (prefers-reduced-motion:reduce){#el-look span{animation:none}}</style>`;
  document.body.append(x)}
// 🧑‍🎓 Self study in class mode (Roger, 24 Nov 2026: "in class mode I want to have the option of self study to work on whatever they need
// to"): while the teacher's class tab has 🧑‍🎓 Self study on (el-cm-agenda.js selfSet writes live/{group}.go.self = {s, at}; ✕ End self study
// or ⏹ Stop clears it), every student in that class mode is let go (no 🎓 bar, no moves, every page of the site open, full screen
// off, no away cover: SELF_ON) and gets a bar at the top: ✅ My pending tasks (the ✅ To do card with its links, opened once by itself), 📖 the LS book and
// 🎲 Games. When it goes, class mode takes them back to the teacher's step as usual. No extra reads: the To do list's own.
const SELF_MS=90*60e3;
const selfOn=g=>{const x=g&&g.cm&&g.self;return !!(x&&x.s===g.s&&Date.now()-x.at<SELF_MS&&elCmOn(g))};
function selfOff(){const b=document.getElementById("el-self");if(b){b.remove();lockPad()}}
function selfBook(){const c=courseOf(myGroup),ls=(window.EL_LS||[]).filter(l=>l.course===c&&!l.personal&&l.story).map(l=>l.id),last=ls[ls.length-1];
  return last?(window.EL_CATALOG||[]).find(a=>a.ls===last&&/(^|\/)book\.html$/.test(a.path||"")):null}
function cmSelf(g){const on=selfOn(g)&&!onDash&&!!user&&(isStudent(user)||!!AS)&&!window.EL_EXAM_LOCK;
  if(!on){if(SELF_ON){SELF_ON=false;fsCheck()}selfOff();return false}
  if(!SELF_ON){SELF_ON=true;fsCheck()}   // no full screen in self study (Roger, 24 Nov 2026: "in selfstudy students don't need to be in full screen")
  // 📖 the book is open for them while self study lasts, as ⚡ I've finished gives it (problem report, 2ESOB, 24 Nov 2026: a Book not on the
  // Time plan stayed hidden or read-only, so students answered the PDF's questions instead and lost them): freed in place, like ffGrant
  {const bk=selfBook();if(bk&&onPage(bk.path)){const f=window.EL_CM_FREE=window.EL_CM_FREE||new Set();if(!f.has("book")){f.add("book");if(window.elSecFree)elSecFree(["book"])}}}
  const ca=lockCa(),t=(c,e)=>ca?c:e;let b=document.getElementById("el-self");
  if(!b){b=document.createElement("div");b.id="el-self";b.setAttribute("role","status");
    b.style.cssText="position:fixed;top:0;left:0;right:0;z-index:2147482000;display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;justify-content:center;padding:10px 14px;font:700 15px system-ui,sans-serif;background:#4338ca;color:#fff;box-shadow:0 2px 8px rgba(0,0,0,.2)";
    const bk=selfBook(),bs="border:2px solid #fff;border-radius:999px;padding:5px 14px;font:800 14px system-ui,sans-serif;cursor:pointer;text-decoration:none;";
    b.innerHTML=`<span>🧑‍🎓 ${t("Estudi personal: treballa en el que necessitis","Self study: work on what you need")}</span>`
      +`<button type="button" data-self="todo" style="${bs}background:#fff;color:#4338ca">✅ ${t("Les meves tasques pendents","My pending tasks")}</button>`
      +(bk?`<a data-self="book" href="${new URL(bk.path,ROOT).href}#book" style="${bs}background:#4338ca;color:#fff">📖 ${t("El llibre","The book")}</a>`:"")
      +`<a data-self="games" href="${new URL("lab/",ROOT).href}" style="${bs}background:#4338ca;color:#fff">🎲 ${t("Jocs","Games")}</a>`;
    b.addEventListener("click",e=>{const x=e.target.closest("[data-self=todo]");if(!x)return;selfTodo()});
    document.body.prepend(b);lockPad()}
  const k="el_self_seen";let was="";try{was=sessionStorage.getItem(k)||""}catch(e){}
  if(was!==String(g.self.at)&&!cmSelf.busy){cmSelf.busy=1;setTimeout(()=>selfTodo().then(ok=>{cmSelf.busy=0;if(ok)try{sessionStorage.setItem(k,String(g.self.at))}catch(e){}}),600)}   // once: their pending tasks (seen once it showed)
  return true}
function selfTodo(){if(document.getElementById("el-rem"))return Promise.resolve(true);return import(new URL("shared/js/el-todo.js",ROOT).href).then(m=>m.remind({links:true})).catch(e=>{console.warn("self study",e);return false})}
// 📄 Term report drafts in class (Roger, 23 Nov 2026: "make sure they dont see them… I will show them the draft in class, I will need a button
// saying show draft"; "not before"): while the teacher's class tab has 📄 Show draft reports on (el-cm-agenda.js repSet writes
// live/{group}.go.report = {s, at}; ✕ Hide or ⏹ Stop clears it), every student in that class mode is taken to their own report
// (today.html#report, reportPlace) and kept there; window.EL_REP_ON tells the board, and the Firestore rules let them read their
// termReports/{email} only while go.report is under 90 minutes old. When it goes, class mode takes them back to the class as usual.
const REP_MS=90*60e3;let REP_ON=false;
function cmReport(g){const r=g&&g.cm&&g.report,on=!!(r&&r.s===g.s&&Date.now()-r.at<REP_MS&&!onDash&&user&&isStudent(user)&&!AS&&!window.EL_EXAM_LOCK);
  const was=REP_ON;REP_ON=on;window.EL_REP_ON=on;if(was!==on)dispatchEvent(new Event("el-report"));
  if(!on)return false;
  const board=/\/today\.html$/.test(location.pathname);
  if(board){if(location.hash!=="#report")location.hash="report"}
  else goMove(new URL("today.html#report",ROOT),lockCa()?"📄 El teu informe del trimestre":"📄 Your term report",false,3,"📄");
  return true}
const CHEER_MS=4*60e3;let cheerT=0;
function cheerOff(){clearInterval(cheerT);const x=document.getElementById("el-cmcheer");if(x)x.remove();cmTopSpace()}
// the 🌟 line sits under the 🎓 class mode bar: lockPad moves the page down by both (one place for it, #550 + #551)
function cmTopSpace(){lockPad()}
function cmCheer(g){const was=document.getElementById("el-cmcheer"),end=g&&g.cm&&g.s?g.s+CHEER_MS:0;
  if(!end||Date.now()>=end||!user||!isStudent(user)||AS){if(was)cheerOff();return}
  if(was&&was.dataset.s===String(g.s))return;
  loadScript("shared/js/el-cheer.js",()=>window.ELCheer).then(()=>{if(!window.ELCheer||Date.now()>=end)return;
    const n=String(user.displayName||"").trim(),f=n.includes(",")?n.split(",")[1].trim().split(/\s+/)[0]:n.split(/[\s@]+/)[0],ca=lockCa();
    const d=new Date(),day=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
    const txt=(ca?"Hola":"Hi")+(f?" "+f:"")+", "+ELCheer.student((user.email||n).toLowerCase(),day,!ca);
    let b=document.getElementById("el-cmcheer");if(!b){b=document.createElement("div");b.id="el-cmcheer";b.setAttribute("role","status");
      // just under the 🎓 class mode bar (el-lock, lockBar), above the page; the page moves down by its height while it shows
      b.style.cssText="position:fixed;left:0;right:0;top:0;z-index:2147481990;display:flex;align-items:center;justify-content:center;gap:12px;padding:14px 20px;background:linear-gradient(90deg,#4338ca,#7c3aed);color:#fff;font:800 clamp(18px,2.3vw,28px)/1.25 system-ui,sans-serif;text-align:center;box-shadow:0 4px 14px rgba(67,56,202,.3)";
      document.body.append(b)}
    b.dataset.s=String(g.s);b.innerHTML='<span aria-hidden="true">🌟</span><span class="t"></span>';b.querySelector(".t").textContent=txt;
    const place=()=>{if(Date.now()>=end)return cheerOff();const l=document.getElementById("el-lock")||document.getElementById("el-self"),top=l?l.offsetHeight:0;b.style.top=top+"px";cmTopSpace()};
    clearInterval(cheerT);place();cheerT=setInterval(place,1000)})}
// The teacher's class tab: opened by "🎓 Class mode" on the dashboard or the learning path page with ?elcm=<group>.<until ms>; this browser
// tab keeps it (sessionStorage el_cm = {g, s, until}), so the dashboard in the other tab never moves the students. Every second it looks
// at the page and its open tab, and once they have stayed the same for a second (quick clicks through tabs are not sent) and differ from
// the last one sent, it writes live/{group}.go: one write per move, read once by each student page of the group. A chip at the bottom
// shows it and ⏹ Stop ends it (go = null); the dashboard can stop it too (the tab listens to live/{group}). Not from the dashboard or the board.
const CM_K="el_cm";
function cmRead(){try{const o=JSON.parse(sessionStorage.getItem(CM_K)||"null");return o&&o.g&&Date.now()<o.until?o:null}catch(e){return null}}
const cmEnd=()=>{try{sessionStorage.removeItem(CM_K)}catch(e){}};
// ?elcm=<group>.<until>.g = class mode started again after a class game (lab/game/cm-after.js): the warm-up and 🎙️ card were already shown
// this class, so they do not open again (Roger, 18 Nov 2026, 4 ESO B, after a game: "the saying was the same")
(()=>{const sp=new URLSearchParams(location.search),v=sp.get("elcm");if(!v)return;const [g,u,from]=v.split("."),again=from==="g";
  try{sessionStorage.setItem(CM_K,JSON.stringify({g,s:Date.now(),until:+u||Date.now()+LOCK_MS}));sessionStorage.removeItem(CM_K+"_last");sessionStorage.setItem("el_cm_ag","1");if(!again){sessionStorage.setItem("el_cm_wu","1");sessionStorage.setItem("el_cm_mic","1");sessionStorage.removeItem("el_cm_mic_n")}}catch(e){}   // 📋 today's agenda (and 🎙️ who can't record) shows when class mode starts
  sp.delete("elcm");history.replaceState(null,"",location.pathname+(sp.toString()?"?"+sp:"")+location.hash)})();
let cmOn=false;
function cmTeacher(){const o=cmRead();if(!o||cmOn||onDash||onBoard)return;cmOn=true;
  const gn=((window.EL_GROUPS||[]).find(x=>x.id===o.g)||{}).name||o.g,hm=t=>new Date(t).toTimeString().slice(0,5);
  const rel=()=>location.pathname.slice(ROOT.pathname.length)||"index.html";
  const state=()=>{const t=document.querySelector(".tab.active[data-panel]"),a=(window.EL_CATALOG||[]).find(y=>y.id===actId);
    return {u:rel(),p:t?t.dataset.panel:"",pn:t?[...t.childNodes].filter(n=>!(n.classList&&n.classList.contains("el-tsw"))).map(n=>n.textContent).join("").trim():"",
      t:a?(window.elLpLabel?elLpLabel(a):a.title):(document.title||"").replace(/ · English (with Roger|Lab)$/,"").trim()}};
  let last=null,seen=null,since=0,chip=null,stop=null,agM=null;
  try{last=JSON.parse(sessionStorage.getItem(CM_K+"_last")||"null")}catch(e){}
  // 📋 Today (el-cm-agenda.js): the group's class day from the Time plan agenda, clickable; open when class mode starts and on every next
  // page until it is closed (Roger, 7 Nov 2026: "in class mode, I should have the day of the agenda so that I can click it")
  const agLoad=()=>agM?Promise.resolve(agM):import(new URL("shared/js/el-cm-agenda.js",ROOT).href).then(m=>{agM=m;m.setup({db,doc,setDoc,getDoc,getDocs,collection,query,where,deleteField:FBM[2].deleteField,serverTimestamp,lsInfo,root:ROOT,g:o.g,gname:gn,s:o.s,token:()=>user.getIdToken(),tester:e=>TESTERS.includes(e)});return m});
  const agToggle=()=>agLoad().then(m=>m.isOpen()?m.close():m.open()).catch(e=>console.warn("agenda",e));
  // today's steps and the 👥 ones (el-cm-agenda.js plan) go with every move; the module loads at once, the panel shown or not
  agLoad().then(m=>m.init()).catch(e=>console.warn("agenda",e));
  // 🔥 the warm-up game opens by itself when class mode starts (Roger, 13 Nov 2026: "so the class mode the game appears automatically"),
  // once: not on the next pages of this class mode (el-warmup.js; 🔥 Warm-up in 📋 Today opens it again)
  try{if(sessionStorage.getItem("el_cm_wu")==="1"){sessionStorage.removeItem("el_cm_wu");agLoad().then(m=>m.warmOpen(true)).catch(e=>console.warn("warm-up",e))}}catch(e){}
  // 🎙️ who of the group can't record (Roger, 14 Nov 2026; shared/js/el-mic-help.js): one read when class mode starts, a card only if
  // someone pressed 🎙️ I can't record; the 🎙️ n button on the chip below opens it again
  const micN=()=>{try{return +sessionStorage.getItem("el_cm_mic_n")||0}catch(e){return 0}};
  const micShow=names=>import(new URL("shared/js/el-mic-help.js",ROOT).href).then(m=>m.show({db,collection,getDocs,doc,deleteDoc,g:o.g,gname:gn,onCount:()=>draw()},names)).catch(e=>console.warn("mic help",e));
  try{if(sessionStorage.getItem("el_cm_mic")==="1"){sessionStorage.removeItem("el_cm_mic");micShow(false)}}catch(e){}
  const key=x=>x.u+"#"+x.p+"|"+JSON.stringify(x.ps||[])+"|"+(x.vis||[]).join(",")+"|"+(x.ff||[]).join(",");
  // ✅ Correct (Roger, 12 Nov 2026: correct the reading with the whole class, every level): on a Reading or Reading log tab of an LS2-on
  // learning path, shared/correct/ over this tab (shared/correct/open.js); the students stay on the tab, nothing is sent
  let crM=null;const crLoad=()=>crM?Promise.resolve(crM):import(new URL("shared/correct/open.js",ROOT).href).then(m=>crM=m);
  const crRe=/^[24]eso\/(?!my-real-routine\/)[a-z0-9-]+\/[a-z0-9-]+\.html$/;
  const crHere=()=>{const x=state();return crRe.test(x.u)&&(x.p==="read"||x.p==="log"||(window.elIsGrammar?elIsGrammar(x.p):x.p==="grammar")&&(window.EL_CORRECT_GRAMMAR||[]).includes(x.u.replace(/\.html$/,"")))};   // 📘 grammar: LS2 LP3 first
  const crOpen=()=>crLoad().then(m=>{const x=state(),r=m.readingOf(x.u,x.p);if(r)m.openCorrect(ROOT,Object.assign({tab:x.p,g:o.g},r))}).catch(e=>console.warn("correct",e));
  // 👥 who is in the class, on every page this tab goes to and over ✅ Correct together (fsPanel; Roger, 13 Nov 2026)
  const FPc=fsPanel(()=>o.g,()=>FPc.float(),()=>cmOn);FPc.watch();
  function quit(why){clearInterval(iv);if(stop)stop();cmEnd();cmOn=false;FPc.stop();if(agM)agM.close();document.documentElement.classList.remove("elcmon");   // the class tab drops its left column (el-catalog.js)
  cmTabs(null);if(chip){chip.innerHTML="🎓 Class mode ended"+(why?" · "+why:"");setTimeout(()=>chip&&chip.remove(),4000)}}
  // ⏹ Stop: first the end-of-class window (✔ Finished / ⏭ Next class / 🏠 Homework for today's steps, el-cm-agenda.js wrapUp; Roger, 12 Nov
  // 2026), then the students are let go. ↩ Back to class keeps class mode on.
  let ending=false;
  async function stopNow(){if(ending)return;ending=true;let r="none";try{const m=await agLoad();r=await m.wrapUp(true)}catch(e){console.warn("class mode",e)}ending=false;
    if(r==="back")return;setDoc(doc(db,"live",o.g),{go:null,fs:null},{merge:true}).then(()=>examEndIdle(o.g)).catch(x=>console.warn("class mode",x));quit(r==="saved"?"stopped · saved on your Time plan":"stopped")}
  // class mode puts the group in full screen until it stops (Roger, 7 Nov 2026: "only when I go class mode outside my schedule … then I
  // press end class mode and I don't need that button"): the first move of this class mode also writes live/{group}.fs; Stop clears it
  // (the only way students go full screen in class: the timetable alone never does it, Roger 24 Nov 2026)
  async function send(x){const now=Date.now(),go=Object.assign({cm:true,at:now,s:o.s,lock:true,until:o.until},x);last=x;
    let fsK=null;try{fsK=sessionStorage.getItem(CM_K+"_fs")}catch(e){}const w={go};if(fsK!==String(o.s))w.fs={on:true,at:now,until:o.until,cm:o.s};
    try{sessionStorage.setItem(CM_K+"_last",JSON.stringify(x))}catch(e){}
    try{await setDoc(doc(db,"live",o.g),w,{merge:true});if(w.fs)try{sessionStorage.setItem(CM_K+"_fs",String(o.s))}catch(e){}draw();if(agM)agM.refresh()}catch(e){console.warn("class mode",e);last=null;draw("✗ Not sent: "+(e.code||e.message||e))}}
  function draw(err){if(!chip){chip=document.createElement("div");chip.id="el-cmchip";
      chip.style.cssText="position:fixed;left:12px;bottom:12px;z-index:2147481500;display:flex;gap:10px;align-items:center;max-width:calc(100vw - 24px);padding:8px 10px 8px 14px;border-radius:999px;background:#4338ca;color:#fff;font:700 14px system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.25)";
      chip.onclick=e=>{const b=e.target.closest("button");if(!b)return;if(b.dataset.ag)return agToggle();if(b.dataset.wu)return agLoad().then(m=>m.warmOpen()).catch(e=>console.warn("warm-up",e));if(b.dataset.mic)return micShow(true);if(b.dataset.cr)return crOpen();stopNow()};document.body.append(chip)}
    chip.innerHTML='<span>🎓 Class mode · '+gn+' follows this tab · until '+hm(o.until)+(err?' · '+String(err).replace(/</g,"&lt;"):'')+'</span><button data-ag="1" title="Today\'s class on your Time plan: click a tab to go there with the class" style="border:1px solid #fff;border-radius:999px;padding:5px 12px;background:#4338ca;color:#fff;font:800 13px system-ui;cursor:pointer">📋 Today</button>'+'<button data-wu="1" title="The warm-up game again (it goes on with the same game)" style="border:1px solid #fff;border-radius:999px;padding:5px 12px;background:#4338ca;color:#fff;font:800 13px system-ui;cursor:pointer">🔥 Warm-up</button>'+(micN()?'<button data-mic="1" title="Students of '+gn+' who pressed I can\'t record on a speaking step" style="border:1px solid #fff;border-radius:999px;padding:5px 12px;background:#c2410c;color:#fff;font:800 13px system-ui;cursor:pointer">🎙️ '+micN()+'</button>':'')+(crHere()?'<button data-cr="1" title="'+(state().p==="grammar"?"Explain this grammar and work it out with the whole class on the projector: every level at once, sentence by sentence (the students stay here)":"Work through this reading with the whole class on the projector: every level at once, question by question (the students stay here)")+'" style="border:1px solid #fff;border-radius:999px;padding:5px 12px;background:#4338ca;color:#fff;font:800 13px system-ui;cursor:pointer;white-space:nowrap">🙌 Work it out</button>':'')+'<button style="border:0;border-radius:999px;padding:5px 12px;background:#fff;color:#4338ca;font:800 13px system-ui;cursor:pointer">⏹ Stop</button>'}
  draw();
  try{if(sessionStorage.getItem("el_cm_ag")==="1")agToggle()}catch(e){}
  // stopped from the dashboard or another class tab started later
  stop=onSnapshot(doc(db,"live",o.g),s=>{const g=s.exists()?s.data().go:null;if(s.metadata.hasPendingWrites||!last)return;if(!g||!g.cm||g.s!==o.s)quit(g&&g.cm?"another tab took over":"stopped")},e=>console.warn("class mode",e));
  const iv=setInterval(()=>{if(!cmRead()){quit("the class is over");examEndIdle(o.g);if(agM&&!ending){ending=true;agM.wrapUp(false).catch(e=>console.warn("class mode",e))}return}
    const pl=agM&&agM.plan?agM.plan():null;
    // only today's steps on this page for the class tab too: a tab now hidden goes to the first one shown
    if(pl&&cmTabs(pl.vis,[])){const at=document.querySelector(".tab.active[data-panel]");if(at&&at.classList.contains("el-cm-hide")){const f=[...document.querySelectorAll(".tab[data-panel]")].find(t=>!t.classList.contains("el-cm-hide")&&!t.classList.contains("el-sec-hide"));if(f)f.click()}}
    const x=state();Object.assign(x,{ps:pl?pl.ps.filter(y=>!(onPage(y.u)&&y.p===x.p)):[],vis:pl?pl.vis:[],ff:pl&&pl.ff?pl.ff:[]});const k=key(x);   // always both: go is merged
    if(k!==seen){seen=k;since=Date.now();return}
    if(Date.now()-since>=1000&&(!last||key(last)!==k||last.pn!==x.pn))send(x)},500);
}
// The student's route on a page outside an LS: the route of their course's latest LS (carried over from earlier LSs, elRouteOf).
async function findHomeLevel(u){
  const c=courseOf(myGroup),ls=(window.EL_LS||[]).filter(l=>l.course===c).pop();if(!ls||!window.elRouteOf)return;
  try{const lvs=await myLevels(u.uid);homeLevel=elRouteOf(lvs,ls.id).level||null}catch(e){console.warn("route",e)}
}
function loadScript(src,has){return has()?Promise.resolve():new Promise(r=>{const s=document.createElement("script");s.src=new URL(src,ROOT).href;s.onload=r;s.onerror=r;document.head.append(s)})}
function loadCatalog(){return window.EL_CATALOG?Promise.resolve():new Promise(r=>{const s=document.createElement("script");s.src=new URL("shared/js/el-catalog.js",ROOT).href;s.onload=r;s.onerror=r;document.head.append(s)})}
await loadCatalog();
// Activities are matched by path, so pages with the same file name in different LSs keep separate results.
const byPath=(window.EL_CATALOG||[]).find(x=>x.path===relPath);if(byPath)actId=byPath.id;
// A page that is not in the catalog must not take the id of another LS's page with the same file name: the LS2 vocabulary games
// (not in the catalog: always open, Roger 7 Nov 2026 "games should be available") were read as LS1's and locked as "not open yet".
else if((window.EL_CATALOG||[]).some(x=>x.id===actId&&x.ls!==lsId))actId=relPath.replace(/\.html$/,"");

// The 🔔 reads every problem report, so only the dashboard listens live (and keeps the copy el_bell up to date); other pages show
// that copy while it is younger than 10 minutes and read the reports again at most every 10 minutes (Roger, 1 Nov 2026: reads limit).
// New reports also reach the teacher by email within 15 minutes (tools/notify).
function bellWatch(cb){
  const K="el_bell",MS=10*60e3,keep=list=>{const l=plain(list);try{origSet.call(localStorage,K,JSON.stringify({t:Date.now(),l}))}catch(e){}return l};
  const docs=s=>s.docs.map(x=>Object.assign({id:x.id},x.data()));
  if(onDash)return onSnapshot(collection(db,"problems"),s=>{keep(docs(s));cb(docs(s))},e=>console.warn("bell",e));
  let c=null;try{c=JSON.parse(localStorage.getItem(K)||"null")}catch(e){}
  const read=()=>getDocs(collection(db,"problems")).then(s=>cb(keep(docs(s)))).catch(e=>console.warn("bell",e));
  if(c&&Date.now()-c.t<MS)cb(c.l);else read();
  const t=setInterval(()=>{if(document.visibilityState!=="visible")return;let x=null;try{x=JSON.parse(localStorage.getItem(K)||"null")}catch(e){}
    if(x&&Date.now()-x.t<MS){if(!c||x.t!==c.t){c=x;cb(x.l)}}else read()},60e3);
  return()=>clearInterval(t);
}
// 🛠 Is the site in maintenance? (see mtShow at the top). true: the message is on screen and the page stops here.
// A page that opened while it was off keeps listening too (Roger, 7 Nov 2026: a student handed in a Listening chart at 16:40 with
// maintenance on since 10:52: his page was opened before, and the listener used to stop when the first answer was "off"). When it
// goes on, the page reloads (el_mt with t:0, so the next load waits for the check) and shows the message. A page opened within 2 minutes of a check that found it off
// does not wait for the answer (no delay), but it still listens.
function mtCheck(u){
  if(mtStop){mtStop();mtStop=null}
  const c=mtGet(),quick=!!(c&&!c.on&&Date.now()-c.t<MT_MS);if(quick)mtHide();
  return new Promise(res=>{let first=true,o=null,on=false;if(quick)res(false);
    const stop=onSnapshot(doc(db,"site","maintenance"),async s=>{const d=s.exists()?s.data():{};
      if(!first){if(!d.on){if(on){mtPut({on:false});location.reload()}}
        else if(!on){on=true;frozen=true;mtPut({on:false,t:0});location.reload()}
        else if(o&&((d.note||"")!==o.note||JSON.stringify(d.pdfs||null)!==JSON.stringify(o.pdfs))){o.note=d.note||"";o.pdfs=d.pdfs||null;mtPut(Object.assign({on:true},o));mtShow(o,isTester(u))}return}
      first=false;
      if(!d.on){mtPut({on:false});if(!quick)mtHide();res(false);return}
      if(quick){on=true;frozen=true;mtPut({on:false,t:0});location.reload();return}   // went on in the last 2 minutes: reload into the message (t:0, so that load waits for the check)
      on=true;
      frozen=true;   // nothing typed behind the message is saved
      const g=myGroup||(myRoster||{}).group||"",mm=/^([24])eso/i.exec(g),course=courseOf(g)||(mm?mm[1]+"eso":null);
      const ls=(window.EL_LS||[]).filter(l=>l.course===course).pop();let route=null;
      try{if(ls&&window.elRouteOf)route=elRouteOf(await myLevels(u.uid),ls.id).level||null}catch(e){console.warn("route",e)}
      o={course,route,ca:!route||(window.elCa?elCa(route):true),note:d.note||"",pdfs:d.pdfs||null};   // pdfs: what the teacher ticked
      mtPut(Object.assign({on:true},o));
      try{await mtShow(o,isTester(u))}catch(e){console.warn("maintenance",e)}
      remember(u);   // el_who: the next page shows the message at once
      res(true)},e=>{console.warn("maintenance",e);if(first){first=false;res(false)}});
    mtStop=stop;});
}
// Who was signed in on this browser last (el_who: uid, role, group, language), for each page's first drawing before the sign-in is known
// (el-app.js, el-ls-home.js, today.html, teacher.html, lab/): the page opens on the right version, not the signed-out or a guessed one.
// Removed on sign-out and for an account that cannot come in. The teacher's student view keeps the teacher's own.
function remember(u){try{
  if(!u){localStorage.removeItem("el_who");return}
  // the teacher's student view: the student's language goes with el_as (this tab), so the next page draws in it at once, not in the
  // teacher's English first and Catalan two seconds later (Roger's screen recording, 7 Nov 2026, LS2 home as a Base student)
  if(AS){const l=myLevel||homeLevel;if(l){const ca=elCa(l);if(AS.ca!==ca){AS.ca=ca;asSave(AS)}}return}
  if(myRoster===null)return;
  const role=isTeacher(u)?"teacher":seesAll(u)?"tester":"student",l=myLevel||homeLevel;
  // a page that does not read the level (the board) keeps the language saved before: it wrote null, and the next page drew English first
  let was=null;try{was=JSON.parse(localStorage.getItem("el_who")||"null")}catch(e){}
  const ca=role!=="student"?false:l?elCa(l):was&&was.uid===u.uid&&typeof was.ca==="boolean"?was.ca:null;
  origSet.call(localStorage,"el_who",JSON.stringify({uid:u.uid,role,group:role==="student"?myGroup:null,ca,t:Date.now()}))}catch(e){}}
onAuthStateChanged(auth,async u=>{
  window.EL_VIEW_LEVEL=viewLevel(u);   // before anything reads a route (elRouteOf)
  // 👁 the teacher's student view of this tab: started by the student's board (today.html?student=uid), ended by the dashboard
  AS=null;
  if(isTeacher(u)){
    // (also 🎯 Practise: the dashboard's 🧠 Flashcards place opens a student's decks with lab/practice.html?student=uid#deck)
    const sp=(onBoard||/\/lab\/practice\.html$/.test(location.pathname))&&new URLSearchParams(location.search).get("student"),was=asRead();
    if(sp&&(!was||was.uid!==sp))asSave({uid:sp});
    if(onDash)leaveAs(true);
    else if((AS=asRead())){
      if(!AS.name||!AS.group){const me=await myDoc(AS.uid).catch(()=>null)||{};AS=Object.assign(AS,{name:me.name||"",email:me.email||"",group:me.group||null});asSave(AS)}
      myGroup=AS.group;if(lsId)frozen=true;asBanner()}   // nothing typed on the student's LS pages is kept
    else leaveAs(false);
  }
  user=u;authKnown=true;draw(u);
  if(u)elShow();   // signed out: after gate, with the Sign in screen already on it
  if(u&&signInO){signInO.remove();signInO=null}
  // A student's first sign-in on this browser starts clean too: what is there was done by the teacher, a signed-out visitor or
  // another student, and this student's own work comes back from the cloud (pull).
  // ✦ The teacher in Towards Nativeness (tnMe) is never wiped: this browser is theirs, and its course keys are their own answers, maybe made
  // before the page saved them (Roger's report, 17 Nov 2026: "I don't see the activity I just did", an activity done on the cached old page
  // was wiped on the first load of the new one). They are still marked unsaved (el_dirty), so the pull keeps them and the gate sends them;
  // snapshot() sends only the course's own keys, never what teacher mode left here.
  if(u&&learner(u)){const prev=localStorage.getItem("el_uid");if(prev!==u.uid){if(!tnMe(u))wipeLocal();origSet.call(localStorage,"el_uid",u.uid)}}
  myRoster=u&&isStudent(u)&&!isTester(u)?await onRoster(u):undefined;
  if(myRoster===null){await refuse(u);return}
  if(u&&isStudent(u))try{myGroup=viewGroup(u)||await ensureGroup(u)}catch(e){console.warn("group",e)}
  if(u&&isStudent(u)&&!seesAll(u)&&!AS){if(await mtCheck(u))return}else mtHide();   // 🛠 maintenance: the message instead of the page
  // A route the teacher set on the student list before their first sign-in (roster/{email}.route = {level, ls}, teacher.html listRoute):
  // saved as their route in that LS, with the level notice fields, if they have none there yet (firestore.rules checks it matches the list).
  const lr=myRoster&&myRoster.route;
  if(lr&&lr.level&&lr.ls)try{const ref=doc(db,"students",u.uid,"levels",lr.ls);if(!(await myLevels(u.uid))[lr.ls]){await setDoc(ref,{level:lr.level,changed:serverTimestamp(),was:null,why:null});once.drop("lv:"+u.uid)}}catch(e){console.warn("route from the list",e)}
  gamePush(u);
  if(isTeacher(u)&&!AS)cmTeacher();
  lsMenu(u).catch(e=>console.warn("ls menu",e));
  document.querySelectorAll("[data-el-teacher]").forEach(e=>e.hidden=!isTeacher(u)||!!AS);   // teacher-only links (e.g. a class game on its learning path)
  menuLink(u);   // again after gate, which knows the route (the label follows its language)
  try{await gate(u)}catch(e){console.warn("gate",e)}
  elShow();
  if(reloadIfStale())return;   // wiped on a page without progress sync
  if(u&&(isStudent(u)||AS)&&!myLevel&&!onBoard)await findHomeLevel(AS||u);
  if(AS&&!lsId&&!onBoard&&homeLevel)asBanner();   // again, with their level
  menuLink(u);
  sideMenu(u).catch(e=>console.warn("side menu",e));   // after menuLink: the LS links go before My activities
  studyCard(u);
  storyCard(u);
  if(myLevel||homeLevel)draw(u);   // the route is known now: the Problem button speaks its language
  // 📬 the student's own notifications in the bar (shared/js/el-notify.js); the teacher's 👁 student view shows the student's, read-only
  if(u&&(AS||isStudent(u)&&!isTeacher(u))&&!nbellP&&!noCorner())nbellP=nbellStart(u).catch(e=>{console.warn("notifications",e);return null});
  // The teacher's answer to the student's problem reports (marked fixed, or a thank-you when deleted): a card, once (shared/js/el-reply.js).
  // Each one also goes into the 📬 list, which keeps it after OK (el-notify.js history).
  if(u&&isStudent(u)&&!document.getElementById("el-reply"))import("./el-reply.js").then(m=>m.showReplies({en:repEn(),
    load:()=>quiet("rp",u,async()=>(await getDocs(query(collection(db,"problemReplies"),where("uid","==",u.uid)))).docs.map(x=>Object.assign({id:x.id},x.data())).filter(r=>!(r.at>Date.now())))   // at: sent late, from 7:30, or held until 📨 Send it
      .then(L=>{const c=L.slice();nbFeed(nb=>nb.add(c.map(r=>NTM.replyItem(r,repEn(),m))));return L}),   // a copy: the cards take answers off L as they are closed, maybe before the 📬 is ready
    done:id=>{nbFeed(nb=>nb.seen("r:"+id+":"));return deleteDoc(doc(db,"problemReplies",id))}})).catch(e=>console.warn("replies",e));
  // Announcements from the teacher to the student's group or to them (announcements/{id}): a card once each (shared/js/el-announce.js).
  if(u&&isStudent(u)&&!document.getElementById("el-announce"))import("./el-announce.js").then(m=>m.showAnnouncements({en:repEn(),
    load:()=>quiet("an",u,async()=>(await myAnnouncements(u)).filter(a=>!(a.read||{})[u.uid]))
      .then(L=>{const c=L.slice();nbFeed(nb=>nb.add(c.map(a=>NTM.annItem(a,repEn(),m,BOARD))));return L}),
    done:id=>{nbFeed(nb=>nb.seen("a:"+id+":"));return updateDoc(doc(db,"announcements",id),{["read."+u.uid]:serverTimestamp()})},reply:(id,text)=>annReply(u,id,text)})).catch(e=>console.warn("announcements",e));
  // "Your exam results are ready": a card once per new set of exam marks, with a link to the board on that LS (shared/js/el-exam-notice.js).
  if(u&&isStudent(u)&&myGroup&&!seesAll(u)&&!document.getElementById("el-exam-notice"))loadScript("shared/js/el-grading.js",()=>window.EL_GRADING)
    .then(()=>import("./el-exam-notice.js")).then(m=>m.examNotice({course:courseOf(myGroup),en:repEn(),board:BOARD,
      get:async ls=>(await myResults(u.uid))[ls+"__assessment"]||null,
      seen:async()=>((await myDoc(u.uid))||{}).examSeen||{},
      save:(ls,v)=>setDoc(doc(db,"students",u.uid),{examSeen:{[ls]:v}},{merge:true}),
      visible:async ls=>{const i=await lsInfo(ls);return i.status!=="hidden"&&elLsForGroup((window.EL_LS||[]).find(x=>x.id===ls),i,myGroup)}})).catch(e=>console.warn("exam notice",e));
  // The teacher's corrections and answers to hand-ins: a card once per new answer with a link to the step's tab, and the answer inside
  // that tab on the learning path (shared/js/el-corrections.js).
  if(u&&AS&&!onBoard&&!document.getElementById("el-corrections"))loadScript("shared/js/el-catalog.js",()=>window.EL_CATALOG).then(()=>loadScript("shared/js/el-grading.js",()=>window.EL_GRADING))
    .then(()=>import("./el-corrections.js")).then(m=>m.corrections({here:actId,root:ROOT,en:repEn(),
      list:async()=>Object.values(await myResults(AS.uid)).filter(r=>r&&r.activity&&(r.replies||r.answers||r.levels)),
      // what the student has seen, plus what the teacher has already seen in this tab (el_as_seen): the card does not come back on every page
      seen:async()=>{let t={};try{t=JSON.parse(sessionStorage.getItem("el_as_seen_"+AS.uid)||"{}")}catch(e){}return Object.assign({},((await myDoc(AS.uid))||{}).fbSeen||{},t)},
      save:o=>{try{const t=JSON.parse(sessionStorage.getItem("el_as_seen_"+AS.uid)||"{}");sessionStorage.setItem("el_as_seen_"+AS.uid,JSON.stringify(Object.assign(t,o)))}catch(e){}},   // never the student's fbSeen
      name:(aid,step)=>{for(const g of Object.values(window.EL_GRADING||{})){const x=(g.moments||[]).find(m=>m.a===aid&&m.step===step);if(x)return x.name}return null}})).catch(e=>console.warn("corrections",e));
  if(u&&isStudent(u)&&!document.getElementById("el-corrections"))loadScript("shared/js/el-catalog.js",()=>window.EL_CATALOG).then(()=>loadScript("shared/js/el-grading.js",()=>window.EL_GRADING))
    .then(()=>import("./el-corrections.js")).then(m=>m.corrections({here:actId,root:ROOT,en:repEn(),
      list:async()=>Object.values(await myResults(u.uid)).filter(r=>r&&r.activity&&(r.replies||r.answers||r.levels)),
      seen:async()=>((await myDoc(u.uid))||{}).fbSeen||{},
      save:o=>setDoc(doc(db,"students",u.uid),{fbSeen:o},{merge:true}),
      name:(aid,step)=>{for(const g of Object.values(window.EL_GRADING||{})){const x=(g.moments||[]).find(m=>m.a===aid&&m.step===step);if(x)return x.name}return null}})).catch(e=>console.warn("corrections",e));
  // "Your level": a card once each time the teacher sets the student's route (shared/js/el-level-notice.js).
  if(u&&isStudent(u)&&myGroup&&!seesAll(u)&&!document.getElementById("el-level-notice"))import("./el-level-notice.js").then(m=>m.levelNotice({course:courseOf(myGroup),
    lv:()=>myLevels(u.uid),
    seen:async()=>((await myDoc(u.uid))||{}).levelSeen||{},
    save:(c,ms)=>setDoc(doc(db,"students",u.uid),{levelSeen:{[c]:ms}},{merge:true})})).catch(e=>console.warn("level notice",e));
  // Floating weekly to-do list for students (and testers) on every page that loads this file (shared/js/el-todo.js).
  if(u&&AS&&myGroup&&!onBoard&&!document.getElementById("el-todo-btn"))import(new URL("shared/js/el-todo.js",ROOT).href).then(m=>m.start({db,user:{uid:AS.uid,email:AS.email||"",displayName:AS.name||""},group:myGroup,root:ROOT,lsId,seesAll:false,results:()=>myResults(AS.uid),levels:()=>myLevels(AS.uid),lsInfo})).catch(e=>console.warn("todo",e));
  if(u&&isStudent(u)&&myGroup&&!document.getElementById("el-todo-btn"))import(new URL("shared/js/el-todo.js",ROOT).href).then(m=>m.start({db,user:u,group:myGroup,root:ROOT,lsId,seesAll:seesAll(u),results:()=>myResults(u.uid),levels:()=>myLevels(u.uid),lsInfo})).catch(e=>console.warn("todo",e));
  // The teacher's 🔔 in the bottom bar: open problem reports from all groups on every page (live on the dashboard, bellWatch) (shared/js/el-bell.js).
  if(stopBell&&!isTeacher(u)){stopBell();stopBell=null;bellEl=null;draw(u)}
  if(isTeacher(u)&&!bellEl)import("./el-bell.js").then(m=>{if(bellEl||!isTeacher(user))return;
    bellEl=m.bell({dash:DASH,onDash,me:()=>(user||{}).uid,watch:cb=>{stopBell=bellWatch(cb)}});draw(user)}).catch(e=>console.warn("bell",e));
  remember(u);
  // 🟢 Online now + 🕘 Visit history on the dashboard (shared/js/el-visits.js): the student's own visits/{day}_{uid}, never in the student view
  if(u&&isStudent(u)&&!AS)import("./el-visits.js").then(m=>m.startVisits({db,fs:{doc,setDoc,serverTimestamp},user:u,root:ROOT.href,group:myGroup,tester:isTester(u),
    name:myRoster&&myRoster.first?[myRoster.first,myRoster.surname1].filter(Boolean).join(" "):u.displayName||u.email||""})).catch(e=>console.warn("visits",e));
  userDone=true;listeners.forEach(f=>f(u));
  // a learning path that links a class presentation: "Join the class" while the teacher presents it (el-live-join.js)
  if(stopJoin){stopJoin();stopJoin=null}const jg=++joinGen;
  if(u&&isStudent(u)&&myGroup&&document.querySelector("a.deck-link"))import("./el-live-join.js").then(m=>{if(jg===joinGen)stopJoin=m.liveJoin({db,group:myGroup})}).catch(e=>console.warn("live",e));
});

// A page left open from an earlier day (a Chromebook closed at the end of a class and opened the next morning) reloads when it is shown
// again, so it runs the site's latest version and today's plan (problem report, 2ESOA, 13 Nov 2026: yesterday's page had no ⛶ Full screen
// and could not take the class mode changes made since). Work not sent yet is sent first; the reload keeps what this browser has not sent
// (DIRTY). Not on the dashboard, recall checkpoints, the sample exam or a followed presentation.
const elDayNow=()=>{try{return new Date().toLocaleDateString("en-CA",{timeZone:"Europe/Madrid"})}catch(e){return new Date().toDateString()}},elLoadDay=elDayNow();
async function newDayReload(){if(document.hidden||reloading||elDayNow()===elLoadDay||/\/teacher\.html$/.test(location.pathname)||/[?&]live=/.test(location.search)
    ||/\/(recall-checkpoint[^/]*|sample-exam)\.html$/.test(location.pathname)||window.EL_EXAM)return;
  reloading=true;try{if(timer){clearTimeout(timer);await send()}}catch(e){console.warn("new day",e)}location.reload()}
document.addEventListener("visibilitychange",newDayReload);window.addEventListener("focus",newDayReload);setInterval(newDayReload,5*60e3);

// 🎙️ I can't record (Roger, 14 Nov 2026; shared/js/el-mic.js cant): live/{group}/micHelp/{email} = {name, page, step, title, at}, one per
// student (the latest step). Written and removed by the student, read and removed by the teacher's class tab (shared/js/el-mic-help.js).
const micRef=()=>{if(!user||AS||!isStudent(user)||!myGroup)throw new Error("not a student");return doc(db,"live",myGroup,"micHelp",(user.email||"").toLowerCase())};
const micHelp=m=>setDoc(micRef(),{name:String(user.displayName||user.email||"").slice(0,120),page:String(m.page||"").slice(0,300),step:String(m.step||"").slice(0,80),title:String(m.title||"").slice(0,200),at:serverTimestamp()});
const micHelpDone=()=>{try{return deleteDoc(micRef())}catch(e){return Promise.resolve()}};
window.ELCloud={submitActivity,micHelp,micHelpDone,auth,db,login,logout,isTeacher,isTester,isStudent,announcements:()=>user?myAnnouncements(user):Promise.resolve([]),annReply:(id,text)=>annReply(user,id,text),viewGroup:()=>viewGroup(user),group:()=>myGroup,lsStatus,lsInfo:lsRead,lsNow:lsInfo,results:(fresh)=>AS?myResults(AS.uid,fresh):user?myResults(user.uid,fresh):Promise.resolve({}),levels:()=>AS?myLevels(AS.uid):user?myLevels(user.uid):Promise.resolve({}),get viewing(){return AS},get ca(){const l=myLevel||homeLevel;return l?elCa(l):null},onUser:f=>{listeners.push(f);if(user!==null&&userDone)f(user)},get user(){return user}};
