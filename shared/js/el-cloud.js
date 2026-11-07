// English Lab cloud: sign-in (students: school email + password; teacher: Google; el-signin.js), per-LS progress sync, LS release gate,
// route (set by the teacher), learning paths the teacher opens per group, once-only activities, points per completed action.
import "./el-copyright.js";
import "./el-route-names.js";
import {signIn} from "./el-signin.js";
import {CONFIG,DOMAINS,TEACHERS,TESTERS} from "./el-firebase.js";   // project config, school domains, teacher and testers
import {report} from "./el-report.js";

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
if(!FBM)await new Promise(()=>{});   // offline: stop here quietly, as the failed static import did before
const [{initializeApp},A,{getFirestore,doc,getDoc,getDocs,setDoc,updateDoc,deleteDoc,collection,query,where,writeBatch,serverTimestamp,onSnapshot}]=FBM;

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
  const c=!fresh&&rcGet(uid);if(c)return Promise.resolve(c);
  return once("rs:"+uid,async()=>{const d={};(await getDocs(collection(db,"students",uid,"results"))).forEach(x=>d[x.id]=x.data());rcPut(uid,plain(d));return d});
}
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
const onRoster=async u=>{try{const s=await getDoc(doc(db,"roster",(u.email||"").toLowerCase()));return s.exists()?s.data():null}catch(e){console.warn("roster",e);return undefined}};
let myRoster;

// Which activity / LS is this page?
const relPath=location.pathname.replace(/^.*?\/((2|4)eso\/.*)$/,"$1");
const m=relPath.match(/^((2|4)eso)\/([^/]+)\//);
const lsId=m?m[1]+"-"+m[3]:null;
let actId=m?m[1]+"/"+relPath.split("/").pop().replace(".html",""):null;
const resKey=a=>a.replace("/","__");

// Keys of learning paths locked for the student's group are never sent (firestore.rules refuses them; the cloud copy stays as it is).
const snapshot=()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(!SKIP.test(k)&&!lockedKeys.includes(k))o[k]=localStorage.getItem(k)}return o};
const progressRef=()=>doc(db,"students",user.uid,"progress",lsId);

// "public" (free access, nothing saved) was removed when students got their own password (Roger, 26 Oct 2026): an LS still stored as public is open.
const lsSt=s=>s==="public"?"open":s||"hidden";
// homework (set from the dashboard) and planEdits (sessions moved to another day, tabs per session) came later: they were not copied
// here, so the dashboard and the student board lost the homework set from the dashboard after a reload. planEdits is applied to the
// time plan (ELWeek.applyEdits) as soon as it is read.
// once per page here; ELCloud.lsInfo (the dashboard, after it changes an LS) always reads the server.
const lsInfo=id=>once("ls:"+id,()=>lsRead(id));
async function lsRead(id){try{const s=await getDoc(doc(db,"ls",id));if(!s.exists())return {status:"hidden",enabled:[],groups:null,open:{}};const d=s.data();
  if(d.planEdits&&window.ELWeek&&ELWeek.applyEdits)ELWeek.applyEdits(id,d.planEdits);
  const o={status:lsSt(d.status),enabled:d.enabled||[],groups:d.groups||null,open:d.open||{},secLocked:d.secLocked||{},secOpened:d.secOpened||{},homework:d.homework||{},planEdits:d.planEdits||{},push:d.push||{},done:d.done||{},played:d.played||{}};
  lsKeep(id,o);return o}catch(e){return {status:"hidden",enabled:[],open:{}}}}
// The last LS state read in this browser (el_ls_<id>: status, groups, open learning paths), only for a page's first drawing before the
// sign-in is known (the LS home's learning paths, All Learning Situations). The page draws again with the state it reads now.
function lsKeep(id,o){try{origSet.call(localStorage,"el_ls_"+id,JSON.stringify({status:o.status,enabled:o.enabled,groups:o.groups,open:o.open,done:o.done}))}catch(e){}}
const lsStatus=async id=>(await lsInfo(id)).status;

// Any key the pull changes marks the page stale, not only this activity's: the final product reads every product piece and Reflect
// reads the checkpoints, so they must reload too to show the student's saved answers (Roger, 26 Oct 2026: answers always come back).
async function pull(){
  const s=await getDoc(progressRef()).catch(()=>null);
  if(s&&s.exists()){const cloud=s.data().data||{};syncing=true;
    const d=dirty();
    for(const k in cloud){if(d[k]&&localStorage.getItem(k)!=null)continue;if(localStorage.getItem(k)!==cloud[k]){origSet.call(localStorage,k,cloud[k]);stale=true}}
    syncing=false}
  pulled=true;
}
// The page's own script read localStorage before this file knew whose it is. After a wipe (another account) or a pull that
// changed it, reload once so the page shows this student's progress, not the old one, and never saves the old one back
// (a Daring student saw "2 / 5" from someone else's steps, Roger 26 Oct 2026). Returns true when it reloads.
function reloadIfStale(){
  const again=sessionStorage.getItem("el_reload")===location.pathname;sessionStorage.removeItem("el_reload");
  if(!stale||again){stale=false;return false}   // once only, never a loop
  sessionStorage.setItem("el_reload",location.pathname);frozen=true;location.reload();return true;
}
function resultPayload(a,extra){const sc=elPoints(a),parts=typeof window.EL_RESULT_PARTS==="function"?window.EL_RESULT_PARTS():null;return Object.assign({ls:lsId,activity:a.id,score:sc,max:a.points,done:sc,updated:serverTimestamp()},parts?{parts}:{},extra||{})}
// Nothing is sent before this page has pulled the student's progress: a save made while signing in (a slow connection) would
// otherwise send this browser's older copy over the answers saved from another device.
function push(){
  if(!user||!isStudent(user)||syncing||frozen||!lsId||noSync||!pulled)return;
  clearTimeout(timer);
  timer=setTimeout(send,1500);
}
let meAt=0;
async function send(){
  timer=null;
  try{
    const snap=snapshot();
    // students/{uid} (name, email, last active) at most every 5 minutes, not on every save: the free plan also has 20,000 writes a day
    if(Date.now()-meAt>5*60e3){await setDoc(doc(db,"students",user.uid),{name:user.displayName||"",email:user.email,updated:serverTimestamp()},{merge:true});meAt=Date.now()}
    await setDoc(progressRef(),{data:snap,updated:serverTimestamp()},{merge:true});
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
  // Google is only for the teacher (Roger, 26 Oct 2026): any other account that comes in through the Google link is signed out.
  const google=(u.providerData||[]).some(p=>p.providerId==="google.com")&&!(u.providerData||[]).some(p=>p.providerId==="password");
  if(!isTeacher(u)&&(google||!isStudent(u))){await signOut(auth);alert(google&&isStudent(u)?"Google sign-in is only for the teacher. Sign in with your school email and your password. · Entra amb el correu de l'institut i la teva contrasenya.":"Sign in with your school email (@"+DOMAINS.join(", @")+").");return}
  if(isStudent(u)&&!isTester(u)&&(await onRoster(u))===null)return;   // refused in onAuthStateChanged
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
// Students only use their board, English Lab (lab/ and its practice page lab/practice.html), their own course page and the LSs assigned to their group.
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
  const info=await lsInfo(lsId),st=info.status;
  if(isStudent(u)&&!seesAll(u)&&Array.isArray(info.open[myGroup]))lockedKeys=elLpLocks(lsId,info.open[myGroup]).lockedKeys;
  if(isTeacher(u)&&!AS){if(st!=="open")banner("Teacher mode · LS "+lsId+": "+st,"#475569");teacherSections(info);return}   // an open LS: no bar that pushes the page down a second after it opened (Roger, 7 Nov 2026); hidden or closed: the bar says so
  if(AS)asBanner();
  else if(!u||!isStudent(u)){signInBlock();return}
  const tester=!AS&&seesAll(u),vg=!AS&&viewGroup(u);
  if(tester)banner("Test account: you see every LS and activity.","#7c3aed");
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
  if(a&&!tester&&!elLpOpen(a,info,myGroup)&&saved){freeze();banner(ca?"Aquesta activitat ara està tancada: pots veure les teves respostes, però no canviar-les.":"This activity is closed for now: you can see your answers, but not change them.","#92400e");return}
  if(a&&!tester&&!elLpOpen(a,info,myGroup)){frozen=true;block(ca?"Aquesta activitat encara no està oberta":"This activity is not open yet",ca?"El professor l'obrirà a classe quan toqui fer-la.":"Your teacher will open it in class when it is time to do it.",ca);return}
  if(a&&!tester)lockSections(elSecLockedFor(a,info,myGroup,new Set(a.keys.flatMap(k=>[...elDoneSet(localStorage.getItem(k))]))),ca);
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
  pullBar(info,a,ca);
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
function asBanner(){const b0=document.getElementById("el-as-banner");if(b0)b0.remove();
  banner("👁 Student view: "+asWho()+" · as they see it, read-only (nothing is saved)","#a16207",[{t:"Their board",f:()=>{location.href=boardUrl()}},{t:"Exit student view",f:asExit}]);
  const b=document.getElementById("el-banner");if(b)b.id="el-as-banner"}
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
// the tab shows 🔒 but opens, the panel keeps the student's saved answers and feedback, and nothing in it can be changed (inputs, Check,
// Do it again, cards…), except audio, video, their speed buttons and hints. Pages re-render (LS2 engine), so it is applied again on every change.
function lockSections(ids,ca){
  if(!ids.length)return;
  const note=ca?"🔒 Aquesta secció ara està tancada: pots mirar-la i veure les teves respostes, però no canviar-les. El professor l'obrirà a classe quan toqui.":"🔒 This section is closed for now: you can look at it and see your answers, but not change them. Your teacher will open it in class when it is time.";
  const st=document.createElement("style");st.textContent=".panel.el-sec-off>:not(.el-sec-note){pointer-events:none}.panel.el-sec-off :is(audio,video,summary,[data-vs]){pointer-events:auto}.tab.el-sec-off{opacity:.7}"
    +".el-sec-note{margin:0 0 14px;padding:10px 14px;border-radius:10px;background:#fef3c7;color:#92400e;font-weight:600}";document.head.append(st);
  const apply=()=>{
    document.querySelectorAll(".tab[data-panel]").forEach(t=>{if(!ids.includes(t.dataset.panel)||t.classList.contains("el-sec-off"))return;t.classList.add("el-sec-off");t.title=note;t.prepend("🔒 ")});
    ids.forEach(id=>{const p=document.getElementById(id);if(!p||!p.classList.contains("panel"))return;p.classList.add("el-sec-off");
      if(!p.querySelector(":scope>.el-sec-note")){const n=document.createElement("div");n.className="el-sec-note";n.textContent=note;p.prepend(n)}
      p.querySelectorAll("input,textarea,select,button:not([data-vs])").forEach(e=>{if(!e.disabled){e.disabled=true;e.tabIndex=-1}})})};
  apply();new MutationObserver(apply).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["disabled"]});
}
// Open and close sections right on the page (Roger, 1 Nov 2026: "vull poder obrir i tancar les tabs, són les seccions dels camins"): in
// teacher mode a bar above the tabs picks a group, and every section tab gets a 🔓/🔒 switch for that group. Same data and rule as the
// dashboard's Sections column (teacher.html api.secLock): ls/{id}.secLocked[group][activity] = locked panel ids, and secOpened keeps every
// section opened so far (elSecLockedFor, elSecPending in el-catalog.js). A learning path still locked for the group shows a warning with
// an Open button (ls/{id}.open, locked, lockedKeys, as api.lpOpen). LS1 pages are left as they are (Roger: leave LS1 alone).
// The learning path pages do not load el-sections.js (the section list the dashboard uses), so it is loaded here for the teacher only.
async function teacherSections(info){
  for(const [f,v] of [["el-sections","EL_SECTIONS"],["el-plan","EL_PLAN"]])if(!window[v])await new Promise(r=>{const sc=document.createElement("script");sc.src=new URL("shared/js/"+f+".js",ROOT).href;sc.onload=sc.onerror=r;document.head.append(sc)});
  const a=(window.EL_CATALOG||[]).find(x=>x.id===actId),secs=a&&(window.EL_SECTIONS||{})[a.id];
  if(!secs||!secs.length||/-my-real-routine$/.test(lsId))return;
  const ls=(window.EL_LS||[]).find(l=>l.id===lsId),course=lsId.split("-")[0];
  let grs=(window.EL_GROUPS||[]).filter(g=>elLsForGroup(ls,info,g.id));if(!grs.length)grs=(window.EL_GROUPS||[]).filter(g=>g.course===course);if(!grs.length)return;
  const k=a.id.replace("/","__"),ref=doc(db,"ls",lsId),all=secs.map(x=>x[0]),nm=id=>(secs.find(x=>x[0]===id)||[])[1]||id;
  let g=localStorage.getItem("el_t_secgroup");if(!grs.some(x=>x.id===g))g=grs[0].id;
  let msg="",busy=false;
  const st=document.createElement("style");st.textContent=".el-tsec{margin:0 0 10px;padding:10px 14px;border:2px solid #a5b4fc;border-radius:12px;background:#eef2ff;font:14px system-ui,sans-serif;color:#1e1b4b}"
    +".el-tsec .r{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.el-tsec b{margin-right:4px}.el-tsec button{border:1px solid #c7d2fe;background:#fff;color:#3730a3;border-radius:999px;padding:3px 12px;cursor:pointer;font:600 13px system-ui,sans-serif}"
    +".el-tsec button.on{background:#4338ca;color:#fff;border-color:#4338ca}.el-tsec button.g{background:none;border-color:transparent;text-decoration:underline;font-weight:500}.el-tsec small{display:block;color:#475569;margin-top:6px}"
    +".el-tsec .w{margin-top:8px;padding:6px 10px;border-radius:8px;background:#fef2f2;color:#991b1b;font-weight:600}.el-tsec .w button{margin-left:6px}.el-tsec .m{margin-left:6px;color:#15803d;font-weight:600}.el-tsec .m.err{color:#b91c1c}"
    +".el-tsec .pl{margin-top:8px;padding-top:8px;border-top:1px dashed #a5b4fc}.el-tsec .pl button[data-cm]:not(.g){background:#0f766e;border-color:#0f766e;color:#fff}.el-tsec .now{color:#0f766e;font-weight:700}.el-tsec .pl button.fs.on{background:#1e293b;border-color:#1e293b;color:#fff}.el-tsec .fsl{flex-basis:100%;font-size:13px;color:#9a3412;font-weight:600}"
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
  async function openLp(){const ids=(window.EL_CATALOG||[]).filter(x=>x.ls===lsId&&(x===a||elLpOpen(x,info,g))).map(x=>x.id),L=elLpLocks(lsId,ids);
    try{await setDoc(ref,{open:{[g]:ids},locked:{[g]:L.locked},lockedKeys:{[g]:L.lockedKeys}},{merge:true});info.open=Object.assign({},info.open,{[g]:ids});msg="✓ Saved"}
    catch(e){console.warn("open",e);msg="✗ Not saved: "+(e.code||e.message||e)}draw()}
  // 🎓 Class mode (Roger, 6 Nov 2026, replaces 📌 Pull up): "Start class mode" opens this page in a new browser tab, the class tab for the
  // projector; the students of the group follow that tab wherever it goes (cmTeacher below) and this tab stays free for other things.
  const cmOpen=()=>{const now=Date.now(),until=(window.elClassEnd&&elClassEnd(g,now))||now+LOCK_MS,u=new URL(location.href);
    u.searchParams.set("elcm",g+"."+until);window.open(u.href,"_blank","noopener")};
  const cmStop=()=>setDoc(doc(db,"live",g),{go:null},{merge:true}).then(()=>{msg="✓ Class mode stopped"},e=>{msg="✗ Not saved: "+(e.code||e.message||e)}).then(draw);
  // ⛶ full screen for the group (live/{group}.fs = {on, at, until}, as on the dashboard; fsCheck below): the state and who left
  // (live/{group}/fsLeft), live for the group chosen in this bar
  // and who is not connected (live/{group}/here, elClassWatch in el-catalog.js), while full screen or a class game is on
  let fsStop=null,fsStopL=null,fsStopH=null,fsG=null,fsX=null,fsLive=null,fsList=[],fsHere=[];
  // in force now: the switch (fsX) or, during a class of the timetable, on by itself (elFsEff in el-catalog.js)
  const fsTT=()=>(fsLive&&fsLive.tt)||elTT(g),fsE=()=>elFsEff(fsX,fsTT());
  const fsW=()=>elClassWatch(Object.assign({},fsLive,{fs:fsE()}),fsList,fsHere);
  function fsWatch(){if(fsG===g)return;[fsStop,fsStopL,fsStopH].forEach(f=>f&&f());fsStop=fsStopL=fsStopH=null;fsG=g;fsX=fsLive=null;fsList=[];fsHere=[];
    fsStop=onSnapshot(doc(db,"live",g),s=>{fsLive=s.exists()?s.data():null;fsX=(fsLive&&fsLive.fs)||null;fsListen();draw()},e=>console.warn("live",e))}
  function fsListen(){const on=fsW().active;
    if(on&&!fsStopL){fsStopL=onSnapshot(collection(db,"live",g,"fsLeft"),c=>{fsList=c.docs.map(d=>Object.assign({e:d.id},d.data()));draw()},e=>console.warn("fsLeft",e));
      fsStopH=onSnapshot(collection(db,"live",g,"here"),c=>{fsHere=c.docs.map(d=>Object.assign({e:d.id},d.data()));draw()},e=>console.warn("here",e));
      if(!fsRo[g]){fsRo[g]=[];getDocs(query(collection(db,"roster"),where("group","==",g))).then(q=>{fsRo[g]=q.docs.map(d=>{const r=d.data();return {e:d.id,name:(r.first||r.name||d.id.split("@")[0])+(r.surname1?" "+r.surname1:"")}});draw()}).catch(e=>{delete fsRo[g];console.warn("roster",e)})}}
    else if(!on&&fsStopL){fsStopL();fsStopH&&fsStopH();fsStopL=fsStopH=null;fsList=[];fsHere=[]}}
  setInterval(()=>{if(fsLive){fsListen();draw()}},30e3);   // a beat missed for EL_HERE_MS, the end of the class or of the game
  // during a class it is on by itself: switching it off writes {on:false, off:true, until: the end of the class} (off for this class only)
  async function fsToggle(){const now=Date.now(),c=elSlotNow(fsTT(),now),v=fsE()?(c?{on:false,off:true,at:now,until:c.end}:null):{on:true,at:now,until:c?c.end:now+LOCK_MS};
    try{await setDoc(doc(db,"live",g),{fs:v},{merge:true});msg=v?"✓ "+gname(g)+" in full screen":"✓ Full screen off"}catch(e){console.warn("fs",e);msg="✗ Not saved: "+(e.code||e.message||e)}draw()}
  const fsHm=t=>{const d=t&&t.toDate?t.toDate():typeof t==="number"?new Date(t):null;return d?d.toTimeString().slice(0,5):""};
  // while the group is in full screen, the same state and list stay fixed at the top right of the page, also when scrolling (Roger, 5 Nov 2026)
  // the whole group, in or out (Roger, 6 Nov 2026), as on the dashboard: the group's student list (read once), ▾ makes it small,
  // and it opens again by itself when a student who was in goes out (elClassRoll in el-catalog.js)
  // in the class tab (on the projector) the panel stays small: counts only, the names one tap away
  const fsRo={},fsMin={on:!!cmRead(),was:new Set()},E=t=>String(t==null?"":t).replace(/</g,"&lt;");
  const fsRoll=()=>{const w=elClassRoll(Object.assign({},fsLive,{fs:fsE()}),fsList,fsHere,fsRo[g]||[]),now=new Set(w.inn.map(y=>y.e));
    if(fsMin.on&&!cmRead()&&w.out.some(y=>fsMin.was.has(y.e)))fsMin.on=false;fsMin.was=now;return w};
  const fsWhy=y=>y.why==="full"?"out of full screen"+(y.left?" · left "+fsHm(y.left.at)+(y.left.n>1?" ("+y.left.n+"×)":""):""):y.why==="closed"?"screen closed or another window · since "+fsHm(y.seen):y.why==="lost"?"lost connection · since "+fsHm(y.seen):"not connected";
  function fsFloat(w){let f=document.getElementById("el-fsfloat");if(!w.active){if(f)f.remove();return}
    if(!f){f=document.createElement("div");f.id="el-fsfloat";f.style.cssText="position:fixed;top:10px;right:12px;z-index:2147481000;max-width:min(380px,calc(100vw - 24px));background:#fff;border:2px solid #1e293b;border-radius:14px;padding:8px 12px;box-shadow:0 6px 20px rgba(0,0,0,.2);font:600 14px system-ui,sans-serif;color:#1e293b";
      f.onclick=e=>{const b=e.target.closest("button");if(!b)return;if(b.dataset.min){fsMin.on=!fsMin.on;draw()}else fsToggle()};document.body.append(f)}
    const bs="border:1px solid #1e293b;border-radius:999px;padding:3px 10px;cursor:pointer;font:700 12px system-ui;",gone=w.out.filter(y=>y.why!=="never"),never=w.out.filter(y=>y.why==="never");
    const h='<div style="display:flex;gap:8px;align-items:center;justify-content:space-between"><b>'+(w.fs?'⛶ '+gname(g)+' in full screen':'🎮 '+gname(g)+' is playing')+'</b><span>'+(w.fs?'<button style="'+bs+'background:#1e293b;color:#fff">Switch off</button> ':'')+'<button data-min="1" style="'+bs+'background:#fff;color:#1e293b" title="'+(fsMin.on?"Show the names":"Make this small (it opens again when someone goes out)")+'">'+(fsMin.on?"▸":"▾")+'</button></span></div>'
      +'<div style="color:#475569;font-size:12px;margin-top:2px">'+(w.game?'🎮 Class game: '+E(w.title)+(w.fs?' · ':''):'')+(w.fs?'until '+fsHm(fsE().until)+(fsE().auto?' (class, by your timetable)':''):'')+'</div>'
      +'<div style="margin-top:4px;font-size:15px"><b style="color:#166534">✓ '+w.inn.length+' in</b> · <b style="color:#b91c1c">✗ '+w.out.length+' out</b> <span style="color:#64748b;font-weight:500">of '+w.n+'</span></div>'
      +(fsMin.on?'':'<div style="margin-top:6px;max-height:40vh;overflow:auto;line-height:1.5">'
        +gone.map(y=>'<div style="color:#b91c1c">✗ <b>'+E(y.name)+'</b> · '+fsWhy(y)+'</div>').join("")
        +(never.length?'<div style="color:#475569;margin-top:4px">⚪ Not connected ('+never.length+'): '+never.map(y=>E(y.name)).join(", ")+'</div>':'')
        +(w.inn.length?'<div style="color:#166534;margin-top:4px">✓ In ('+w.inn.length+'): '+w.inn.map(y=>E(y.name)).join(", ")+'</div>':'<div style="color:#64748b;margin-top:4px">Nobody is in yet: they tap their screen to go full screen.</div>')+'</div>');
    if(f.dataset.h!==h){f.dataset.h=h;f.innerHTML=h}}
  function fsRow(w){const x=fsE(),on=!!x,cls=!!elSlotNow(fsTT());
    return '<button class="fs'+(on?" on":"")+'" data-fs="1" title="Every open page of '+gname(g)+' goes full screen (they tap once to start; Esc does nothing; you see who is in and who is out). During each class of your timetable it is on by itself and ends with the class. Not on recall checkpoints or the sample exam.">⛶ Full screen '+gname(g)+': '+(on?"on":"off")+(cls?on?" (class)":" for this class":"")+'</button>'
      +(w.active?'<div class="fsl">'+(on?'until '+fsHm(x.until):'🎮 in a game')+' · ✓ '+w.inn.length+' in · ✗ '+w.out.length+' out'+(w.out.length&&!cmRead()?': '+w.out.map(y=>E(y.name)+" ("+fsWhy(y)+")").join(" · "):"")+'</div>':"")}
  const toggle=id=>{const off=new Set(locked());off.has(id)?off.delete(id):off.add(id);save(all.filter(x=>off.has(x)))};
  function cmRow(){fsWatch();const x=fsLive&&fsLive.go,on=elCmOn(x),me=cmRead(),mine=me&&me.g===g;
    return '<div class="r pl"><b>🎓 Class mode for '+gname(g)+'</b>'
      +(mine?'<span class="now">This tab is the class tab: '+gname(g)+' follows it'+(x&&x.until?' until '+fsHm(x.until):'')+'</span><button class="g" data-cm="-">⏹ Stop class mode</button>'
        :on?'<span class="now">On: they follow your class tab ('+E(x.t||"")+(x.pn?" · "+E(x.pn):"")+')</span><button class="g" data-cm="-">⏹ Stop class mode</button><button data-cm="1">Start it here instead</button>'
        :'<button data-cm="1" title="Opens this page in a new tab for the projector. Every student of '+gname(g)+' goes wherever that tab goes (page and tab) until you stop it or the class ends. Keep using this tab for anything else.">Start class mode (new tab)</button>')
+'</div><div class="r pl">'+fsRow(fsRoll())+'</div>'}
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
      +(elLpOpen(a,info,g)?"":'<div class="w">⚠️ This whole learning path is locked for '+gname(g)+': students cannot open it yet.<button data-lp="1">✔ Open it for '+gname(g)+'</button></div>');
    if(bar.dataset.h!==html){bar.innerHTML=html;bar.dataset.h=html;try{origSet.call(localStorage,"el_tsec_"+relPath,JSON.stringify({h:html,css:st.textContent,all,off}))}catch(e){}}   // for el-app.js tsecEarly on the next visit
    fsFloat(fsRoll())
    document.querySelectorAll(".tab[data-panel]").forEach(t=>{const id=t.dataset.panel;if(!all.includes(id))return;const on=!off.includes(id);
      let sw=t.querySelector(".el-tsw");if(!sw){sw=document.createElement("span");sw.className="el-tsw";sw.setAttribute("role","button");
        sw.onclick=e=>{e.stopPropagation();e.preventDefault();toggle(id)};t.append(sw)}
      const tx=on?"🔓":"🔒",ti=(on?"Open":"Closed")+" for "+gname(g)+": click to "+(on?"close":"open")+" “"+nm(id)+"”";
      if(sw.textContent!==tx)sw.textContent=tx;if(sw.title!==ti)sw.title=ti;sw.classList.toggle("off",!on);t.classList.toggle("el-toff",!on)})}
  draw();new MutationObserver(()=>draw()).observe(document.body,{childList:true,subtree:true});
}
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
  return Object.values(out).filter(a=>!(a.at>Date.now())).map(a=>a.at?Object.assign(a,{created:a.at}):a);
}
// Problem reports (bottom bar "⚠️ Problema / Problem"): problems/{id}, read only by the teacher in the dashboard.
// Catalan for Insecure and with no route; English for Safe and Daring (LS pages: the route; the board: its own language).
// Outside an LS page (course pages, English Lab, Practice) the route is the one of the course's latest LS (homeLevel), so a Core or
// Plus student gets the Problem window and the cards in English there too. The board keeps its own language (the LS on screen).
const repEn=()=>{const l=myLevel||homeLevel;return l?!elCa(l):onBoard&&document.documentElement.lang==="en"};
// A screenshot goes in its own document (problemShots/{same id}), so the dashboard loads it only when the teacher opens it.
const reportProblem=u=>report({en:repEn(),save:o=>{
  const {shot,shotFrom}=o,ref=doc(collection(db,"problems")),b=writeBatch(db);delete o.shot;delete o.shotFrom;
  b.set(ref,Object.assign(o,{uid:u.uid,email:(u.email||"").toLowerCase(),name:u.displayName||"",group:myGroup||null,ls:lsId,activity:actId,route:myLevel,shot:shot?shotFrom:null,created:serverTimestamp()}));
  if(shot)b.set(doc(db,"problemShots",ref.id),{uid:u.uid,img:shot,created:serverTimestamp()});
  return b.commit()}});

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
      d.innerHTML="";const m=document.createElement("p");m.style.cssText="margin:0 0 12px";m.textContent=t("Gràcies! El professor llegirà el teu suggeriment.","Thank you! Your teacher will read your suggestion.");
      const c=document.createElement("button");c.style.cssText=bs+"background:#0f766e;color:#fff";c.textContent="OK";c.onclick=()=>d.close();d.append(m,c)}
    catch(e){console.warn("suggestion",e);ok.disabled=false;alert(t("No s'ha pogut enviar. Torna-ho a provar més tard.","It could not be sent. Please try again later."))}};
  d.addEventListener("close",()=>d.remove());
  document.body.append(d);d.showModal();ta.focus();
}

function bar(){
  const el=document.createElement("div");el.id="el-cloud-bar";
  el.style.cssText="position:fixed;right:10px;bottom:10px;z-index:10002;background:#fff;border:1px solid #cbd5e1;border-radius:999px;padding:6px 12px;font:13px system-ui,sans-serif;box-shadow:0 2px 8px #0002;display:flex;gap:8px;align-items:center";
  document.body.appendChild(el);
  // until Firebase has said who is signed in, the chip stays empty: it showed "Not signed in · Sign in" for a second to a signed-in
  // student on every page (Roger, 7 Nov 2026: "all pages still pop up in between")
  return u=>{el.innerHTML="";el.style.visibility=authKnown?"":"hidden";if(!authKnown)return;
    const b=(t,f)=>{const x=document.createElement("button");x.textContent=t;x.onclick=f;x.style.cssText="border:0;background:#0f766e;color:#fff;border-radius:999px;padding:4px 10px;cursor:pointer";return x};
    if(!u)el.append("Not signed in ",b("Sign in",login));
    else if(AS){el.style.background="#fef3c7";el.style.borderColor="#f59e0b";el.append("👁 "+(AS.name||AS.email||"Student")+" ");
      const a=document.createElement("a");a.textContent="Their board";a.href=boardUrl();el.append(a," ");
      if(!onLab){const l=document.createElement("a");l.textContent="English Lab";l.href=new URL("lab/",ROOT).href;el.append(l," ")}
      const x=b("Exit student view",asExit);x.style.background="#a16207";x.title="Back to your dashboard; their answers leave this browser";el.append(x)}
    else{el.append(u.displayName||u.email," ");
      const a=document.createElement("a");a.textContent=isTeacher(u)?"Dashboard":"My dashboard";a.href=isTeacher(u)?dashHere:BOARD;el.append(a," ");
      if(isStudent(u)&&!onLab){const l=document.createElement("a");l.textContent="English Lab";l.href=new URL("lab/",ROOT).href;el.append(l," ")}
      if(isStudent(u)){const p=b("⚠️ "+(repEn()?"Problem":"Problema"),()=>reportProblem(u));p.style.background="#b45309";p.title=repEn()?"Report a problem: something on the website does not work":"Avisa d'un problema: alguna cosa de la web no funciona";el.append(p," ")}
      if(isStudent(u)){const i=b("💡 Idea",()=>suggest(u));i.title=repEn()?"Suggest an improvement to the website":"Suggereix una millora per a la web";el.append(i," ")}
      if(isTeacher(u)&&bellEl)el.append(bellEl," ");
      if(isTester(u)){const s=document.createElement("select");s.title="Tester: see the site as a student of this group";
        s.innerHTML='<option value="">View: tester (everything)</option>'+(window.EL_GROUPS||[]).map(g=>'<option value="'+g.id+'">View as '+g.name+'</option>').join("");
        s.value=viewGroup(u)||"";s.onchange=()=>{origSet.call(localStorage,"el_view",s.value);location.reload()};el.append(s," ");
        const vg=viewGroup(u);if(vg){const c=courseOf(vg),lv=document.createElement("select");lv.title="Tester: see the site as a student on this level";
          lv.innerHTML='<option value="">Level: my own route</option>'+(window.EL_LEVELS||[]).filter(x=>x.id!=="native"||c==="4eso").map(x=>'<option value="'+x.id+'">'+(window.elLevelLabel?elLevelLabel(c,x.id):x.name)+'</option>').join("");
          lv.value=viewLevel(u)||"";lv.onchange=()=>{origSet.call(localStorage,"el_view_level",lv.value);location.reload()};el.append(lv," ")}}
      el.append(b("Sign out",logout))}};
}
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
    if(cur)items.push(mk(ca?"Learning Situation actual":"Current Learning Situation",href(cur.course+"/"+cur.id.slice(cur.course.length+1)+"/index.html"),cur.title.replace(/^\S+ · /,"")));
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
    +(every?"":" <b>"+elLevelLabel(ls.course,lv==="native"?"daring":lv)+"</b>")
    +"</p><p>"+(every?EL_LEVELS.filter(x=>x.id!=="native").map(x=>a(x.id)).join(""):a(lv==="native"?"daring":lv))+"</p></div></div>";
  el.hidden=false;
}
let draw=()=>{},authKnown=false;
const start=()=>{draw=bar();draw(user)};
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",start):start();
new MutationObserver(()=>draw(user)).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});   // the board picks its language after loading

// Class game (lab/game, Roger 26 Oct 2026): while the teacher's board runs a game for the student's group (live/{group}, host.js), a
// signed-in student is taken into it (lab/game/play.html) from whatever page they are on, and goes back here with the player's Leave.
const GAME=new URL("lab/game/play.html",ROOT),onGame=location.pathname===GAME.pathname;
function gamePush(u){
  if(stopGame){stopGame();stopGame=null}
  if(!u||!isStudent(u)||!myGroup||onGame)return;
  let first=true;
  stopGame=onSnapshot(doc(db,"live",myGroup),s=>{const x=s.exists()?s.data():null,ms=x&&x.at&&x.at.toMillis?x.at.toMillis():0;
    // the player goes full screen too (Roger, 6 Nov 2026) and speaks Catalan only to Starter and Base: ca=1|0 (the level is read first if needed)
    if(x&&x.game&&x.on&&x.phase!=="end"&&Date.now()-ms<10*60e3){const g=()=>{location.href=GAME.href+"?g="+encodeURIComponent(myGroup)+"&from="+encodeURIComponent(location.pathname+location.search)+(myLevel||homeLevel?"&ca="+(lockCa()?1:0):"")};
      if(!myLevel&&!homeLevel&&!lvTried&&user&&!AS){lvTried=true;findHomeLevel(user).finally(g)}else g();return}
    const f=first,run=()=>{goTo(x&&x.go,f);FSL=(x&&x.fs)||null;TT=(x&&x.tt)||null;fsRefresh();fsCheck()};first=false;
    if(x&&(x.go||x.fs||elSlotNow(x.tt))&&!myLevel&&!homeLevel&&!lvTried&&user&&!AS){lvTried=true;findHomeLevel(user).finally(run)}else run()},
    e=>console.warn("game",e));
}
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
const cmUrl=g=>{const u=new URL(g.u,ROOT);u.hash=g.p||"";return u},lockHere=()=>!!LOCK&&(LOCK.cm?location.pathname===cmUrl(LOCK).pathname:actId===LOCK.a);
function lockToast(t){const ca=lockCa();let n=document.getElementById("el-lock-toast");if(!n){n=document.createElement("div");n.id="el-lock-toast";
  n.style.cssText="position:fixed;left:50%;bottom:90px;transform:translateX(-50%);z-index:2147483001;max-width:92vw;padding:12px 18px;border-radius:12px;background:#7f1d1d;color:#fff;font:600 15px system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.3);text-align:center";document.body.append(n)}
  n.textContent=t||(ca?"🔒 El professor t'ha fet venir aquí: no pots anar a cap altra part de la web fins que et deixi anar.":"🔒 Your teacher brought you here: you can't go to any other part of the website until they let you go.");
  clearTimeout(lockToast.t);lockToast.t=setTimeout(()=>n.remove(),3500)}
function lockBar(){let b=document.getElementById("el-lock");
  if(!lockHere()){if(b)b.remove();return}
  const ca=lockCa(),at=document.querySelector(".tab.active[data-panel]"),cur=at&&at.dataset.panel,g=LOCK;if(g.p&&cur===g.p)lockFrom=null;
  if(!b){b=document.createElement("div");b.id="el-lock";b.style.cssText="position:fixed;top:0;left:0;right:0;z-index:2147482000;display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;justify-content:center;padding:10px 14px;font:600 15px system-ui,sans-serif;background:#0f766e;color:#fff;box-shadow:0 2px 8px rgba(0,0,0,.2)";
    b.onclick=e=>{const x=e.target.closest("button");if(!x)return;const t=document.querySelector('.tab[data-panel="'+CSS.escape(LOCK.p)+'"]');if(t){lockFrom=null;t.click()}};document.body.prepend(b);const old=document.getElementById("el-pull");if(old)old.remove()}
  const off=g.p&&cur!==g.p,h=(g.cm?"🎓 "+(ca?"Mode classe: segueixes el professor":"Class mode: you follow your teacher"):"🔒 "+(ca?"El professor et manté aquí":"Your teacher is keeping you here"))+(g.p?(ca?": pestanya ":": tab ")+(g.pn||g.p):"")
    +(off?(ca?". Acaba el que estàs fent i ves-hi.":". Finish what you are doing and go there."):"")+"|"+(off?(ca?"Ves-hi":"Go there")+" →":"");
  if(b.dataset.h!==h){b.dataset.h=h;const [t,btn]=h.split("|");b.textContent=t+" ";if(btn){const x=document.createElement("button");x.textContent=btn;
    x.style.cssText="background:#fff;color:#0f766e;border:0;border-radius:999px;padding:6px 16px;font-weight:800;cursor:pointer";b.append(x)}}}
// clicks on the kept page: links that leave it, and other tabs when the teacher chose one
document.addEventListener("click",e=>{if(!lockHere())return;
  const t=e.target.closest&&e.target.closest(".tab[data-panel]");
  if(t&&LOCK.p&&t.dataset.panel!==LOCK.p&&t.dataset.panel!==lockFrom){e.preventDefault();e.stopImmediatePropagation();lockToast((lockCa()?"🔒 Ara toca la pestanya ":"🔒 Now it is the tab ")+(LOCK.pn||LOCK.p)+(lockCa()?": el professor l'obrirà quan toqui.":": your teacher will open the next one."));return}
  const a=e.target.closest&&e.target.closest("a[href]");if(!a)return;let u;try{u=new URL(a.href,location.href)}catch(x){return}
  if(u.origin===location.origin&&u.pathname===location.pathname)return;   // a tab or a link on this page
  if(/\.(pdf|mp3|mp4|m4a|png|jpe?g)$/i.test(u.pathname))return;   // study PDFs, audio and video of the path
  e.preventDefault();e.stopImmediatePropagation();lockToast()},true);
const lockFree=()=>lockToast(lockCa()?"🔓 El professor t'ha deixat anar: ja pots moure't per la web.":"🔓 Your teacher has let you go: you can move around the website again.");
setInterval(()=>{if(LOCK&&!lockOn(LOCK)){LOCK=null;lockBar();lockFree()}else if(LOCK)lockBar();fsRefresh();fsCheck();hereTick()},1000);   // the class is over (until) or LOCK_MS passed
// ⛶ Full screen in class (Roger, 5 Nov 2026: "put students in full screen mode when I say it and they don't have a way to get out"; then
// "make the selected group go full screen" from the top right of the dashboard): live/{group}.fs = {on, at, until} (the doc gamePush
// already listens to). While it is on, every page of the site covers itself until the student taps it (a browser only goes full screen
// after a tap), then Esc is locked (Chrome and Chromebooks: Keyboard Lock, only holding Esc down leaves). Leaving full screen brings the
// cover back and writes live/{group}/fsLeft/{email} = {name, at, pull: fs.at, n}: the dashboard and the teacher bar list who left. Moving
// to another page of the site (a link, the pull-up, a reload: beforeunload/pagehide) needs a new tap but does not count as leaving. When it is switched off or
// the class ends, the page leaves full screen. Never on a recall checkpoint or the sample exam (they have their own full screen: leaving
// it sends the checkpoint), nor in the teacher's student view; not on iPhones (no full screen for pages there).
const FD=document,FE=FD.documentElement;
const fsCan=()=>!!(FD.fullscreenEnabled||FD.webkitFullscreenEnabled),fsIs=()=>!!(FD.fullscreenElement||FD.webkitFullscreenElement);
// FSG = the full screen in force: the teacher's switch (FSL = live/{group}.fs) or the group's class by the timetable (TT = live/{group}.tt),
// elFsEff in el-catalog.js (Roger, 6 Nov 2026: "according to the teacher's timetable students should go full screen when they have class")
let fsWas=false,FSG=null,FSL=null,TT=null;
function fsRefresh(){const was=FSG&&FSG.at;FSG=myGroup?elFsEff(FSL,TT):null;if((FSG&&FSG.at)!==was)beatAt=0}
const fsKey=()=>"el_fs_"+(FSG&&FSG.at);
const fsSS=(k,v)=>{try{if(v===undefined)return sessionStorage.getItem(k);if(v===null)sessionStorage.removeItem(k);else sessionStorage.setItem(k,v)}catch(e){return null}};
const fsOnG=()=>!!(FSG&&FSG.on&&FSG.at&&Date.now()<(FSG.until||FSG.at+LOCK_MS));   // FSG is refreshed every second
function fsWanted(){if(frozen||!myGroup||!fsOnG()||!fsCan())return false;const h=(window.EL_CATALOG||[]).find(y=>y.id===actId);return !(h&&(h.checkpoint||/sample-exam$/.test(h.id)))}
let fsBye=false;addEventListener("beforeunload",()=>{fsBye=true});addEventListener("pagehide",()=>{fsBye=true});   // going to another page: not leaving
async function fsLeft(){if(!user||!myGroup||!FSG)return;const k=fsKey()+"_n",n=(+fsSS(k)||0)+1;fsSS(k,String(n));
  try{await setDoc(doc(db,"live",myGroup,"fsLeft",(user.email||"").toLowerCase()),{name:user.displayName||user.email||"",at:serverTimestamp(),pull:FSG.at,n},{merge:true})}catch(e){console.warn("full screen",e)}}
function fsGo(){try{const lk=()=>{try{if(navigator.keyboard&&navigator.keyboard.lock)navigator.keyboard.lock(["Escape"]).catch(()=>{})}catch(e){}},
  r=(FE.requestFullscreen||FE.webkitRequestFullscreen).call(FE);if(r&&r.then)r.then(()=>{lk();fsCheck()},()=>{});else{lk();fsCheck()}}catch(e){}}
function fsCheck(){let c=document.getElementById("el-fs");
  if(!fsWanted()){if(c)c.remove();if(fsWas){fsWas=false;try{if(navigator.keyboard&&navigator.keyboard.unlock)navigator.keyboard.unlock()}catch(e){}
    try{if(fsIs())(FD.exitFullscreen||FD.webkitExitFullscreen).call(FD)}catch(e){}}return}
  if(fsIs()){if(c)c.remove();fsWas=true;return}
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
FD.addEventListener("fullscreenchange",()=>{fsCheck();hereTick()});FD.addEventListener("webkitfullscreenchange",()=>{fsCheck();hereTick()});
function goTo(g,first){
  const was=LOCK;LOCK=lockOn(g)?g:null;
  if(was&&!LOCK){lockBar();lockFree();return}
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
// 🎓 Class mode (Roger, 6 Nov 2026: "instead of pulling students to the LS, I want to go class mode, and this makes students go wherever you
// are in the LS. When we go to class mode, a new tab is opened so that I can check other stuff"). live/{group}.go = {cm: true, u, p, pn, t,
// at, s, lock, until} (elCmOn in el-catalog.js), written by the teacher's class tab each time it moves (cmTeacher below). On the student's
// side (the live/{group} listener of gamePush, no extra reads): on the same page only the tab changes, in place (nothing reloads, what
// they typed stays); on another page a 3-second notice saves their work and takes them there (2 seconds when they went somewhere else
// and are sent back). While it lasts they are kept there like a pull-up (lock: links that leave the page and the other tabs are blocked).
// Not out of a recall checkpoint, the sample exam or a followed presentation. It ends with ⏹ Stop or the end of the class (until).
function cmGo(g){
  const here=window.EL_CATALOG&&EL_CATALOG.find(y=>y.id===actId);
  if(here&&(here.checkpoint||/sample-exam$/.test(here.id))||/[?&]live=/.test(location.search)||!LOCK)return;
  const url=cmUrl(g),k="el_go_"+g.at;let seen=false;try{seen=!!localStorage.getItem(k)}catch(e){}
  try{origSet.call(localStorage,k,"1")}catch(e){}
  if(location.pathname===url.pathname){lockFrom=null;
    const t=g.p&&document.querySelector('.tab[data-panel="'+CSS.escape(g.p)+'"]'),at=document.querySelector(".tab.active[data-panel]");
    if(t&&t!==at){try{const f=document.activeElement;if(f&&f!==document.body&&f.blur)f.blur()}catch(e){}t.click()}
    lockBar();return}
  goMove(url,(g.t||"")+(g.pn?" · "+g.pn:""),seen,seen?2:3,"🎓");
}
// The teacher's class tab: opened by "🎓 Class mode" on the dashboard or the learning path page with ?elcm=<group>.<until ms>; this browser
// tab keeps it (sessionStorage el_cm = {g, s, until}), so the dashboard in the other tab never moves the students. Every second it looks
// at the page and its open tab, and once they have stayed the same for a second (quick clicks through tabs are not sent) and differ from
// the last one sent, it writes live/{group}.go: one write per move, read once by each student page of the group. A chip at the bottom
// shows it and ⏹ Stop ends it (go = null); the dashboard can stop it too (the tab listens to live/{group}). Not from the dashboard or the board.
const CM_K="el_cm";
function cmRead(){try{const o=JSON.parse(sessionStorage.getItem(CM_K)||"null");return o&&o.g&&Date.now()<o.until?o:null}catch(e){return null}}
const cmEnd=()=>{try{sessionStorage.removeItem(CM_K)}catch(e){}};
(()=>{const sp=new URLSearchParams(location.search),v=sp.get("elcm");if(!v)return;const [g,u]=v.split(".");
  try{sessionStorage.setItem(CM_K,JSON.stringify({g,s:Date.now(),until:+u||Date.now()+LOCK_MS}));sessionStorage.removeItem(CM_K+"_last")}catch(e){}
  sp.delete("elcm");history.replaceState(null,"",location.pathname+(sp.toString()?"?"+sp:"")+location.hash)})();
let cmOn=false;
function cmTeacher(){const o=cmRead();if(!o||cmOn||onDash||onBoard)return;cmOn=true;
  const gn=((window.EL_GROUPS||[]).find(x=>x.id===o.g)||{}).name||o.g,hm=t=>new Date(t).toTimeString().slice(0,5);
  const rel=()=>location.pathname.slice(ROOT.pathname.length)||"index.html";
  const state=()=>{const t=document.querySelector(".tab.active[data-panel]"),a=(window.EL_CATALOG||[]).find(y=>y.id===actId);
    return {u:rel(),p:t?t.dataset.panel:"",pn:t?[...t.childNodes].filter(n=>!(n.classList&&n.classList.contains("el-tsw"))).map(n=>n.textContent).join("").trim():"",
      t:a?(window.elLpLabel?elLpLabel(a):a.title):(document.title||"").replace(/ · English (with Roger|Lab)$/,"").trim()}};
  let last=null,seen=null,since=0,chip=null,stop=null;
  try{last=JSON.parse(sessionStorage.getItem(CM_K+"_last")||"null")}catch(e){}
  const key=x=>x.u+"#"+x.p;
  function quit(why){clearInterval(iv);if(stop)stop();cmEnd();cmOn=false;if(chip){chip.innerHTML="🎓 Class mode ended"+(why?" · "+why:"");setTimeout(()=>chip&&chip.remove(),4000)}}
  async function send(x){const go=Object.assign({cm:true,at:Date.now(),s:o.s,lock:true,until:o.until},x);last=x;
    try{sessionStorage.setItem(CM_K+"_last",JSON.stringify(x))}catch(e){}
    try{await setDoc(doc(db,"live",o.g),{go},{merge:true});draw()}catch(e){console.warn("class mode",e);last=null;draw("✗ Not sent: "+(e.code||e.message||e))}}
  function draw(err){if(!chip){chip=document.createElement("div");chip.id="el-cmchip";
      chip.style.cssText="position:fixed;left:12px;bottom:12px;z-index:2147481500;display:flex;gap:10px;align-items:center;max-width:calc(100vw - 24px);padding:8px 10px 8px 14px;border-radius:999px;background:#4338ca;color:#fff;font:700 14px system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.25)";
      chip.onclick=e=>{if(!e.target.closest("button"))return;setDoc(doc(db,"live",o.g),{go:null},{merge:true}).catch(x=>console.warn("class mode",x));quit("stopped")};document.body.append(chip)}
    chip.innerHTML='<span>🎓 Class mode · '+gn+' follows this tab · until '+hm(o.until)+(err?' · '+String(err).replace(/</g,"&lt;"):'')+'</span><button style="border:0;border-radius:999px;padding:5px 12px;background:#fff;color:#4338ca;font:800 13px system-ui;cursor:pointer">⏹ Stop</button>'}
  draw();
  // stopped from the dashboard or another class tab started later
  stop=onSnapshot(doc(db,"live",o.g),s=>{const g=s.exists()?s.data().go:null;if(s.metadata.hasPendingWrites||!last)return;if(!g||!g.cm||g.s!==o.s)quit(g&&g.cm?"another tab took over":"stopped")},e=>console.warn("class mode",e));
  const iv=setInterval(()=>{if(!cmRead())return quit("the class is over");const x=state(),k=key(x);
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
function mtCheck(u){
  if(mtStop){mtStop();mtStop=null}
  const c=mtGet();if(c&&!c.on&&Date.now()-c.t<MT_MS){mtHide();return Promise.resolve(false)}
  return new Promise(res=>{let first=true,o=null;
    const off=()=>{mtPut({on:false});if(mtStop){mtStop();mtStop=null}};
    const stop=onSnapshot(doc(db,"site","maintenance"),async s=>{const d=s.exists()?s.data():{};
      if(!first){if(!d.on){off();location.reload()}else if(o&&((d.note||"")!==o.note||JSON.stringify(d.pdfs||null)!==JSON.stringify(o.pdfs))){o.note=d.note||"";o.pdfs=d.pdfs||null;mtPut(Object.assign({on:true},o));mtShow(o,isTester(u))}return}
      first=false;
      if(!d.on){off();mtHide();res(false);return}
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
  if(AS||myRoster===null)return;
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
    const sp=onBoard&&new URLSearchParams(location.search).get("student"),was=asRead();
    if(sp&&(!was||was.uid!==sp))asSave({uid:sp});
    if(onDash)leaveAs(true);
    else if((AS=asRead())){
      if(!AS.name||!AS.group){const me=await myDoc(AS.uid).catch(()=>null)||{};AS=Object.assign(AS,{name:me.name||"",email:me.email||"",group:me.group||null});asSave(AS)}
      myGroup=AS.group;if(lsId)frozen=true}   // nothing typed on the student's LS pages is kept
    else leaveAs(false);
  }
  user=u;authKnown=true;draw(u);
  if(u&&signInO){signInO.remove();signInO=null}
  // A student's first sign-in on this browser starts clean too: what is there was done by the teacher, a signed-out visitor or
  // another student, and this student's own work comes back from the cloud (pull).
  if(u&&isStudent(u)){const prev=localStorage.getItem("el_uid");if(prev!==u.uid){wipeLocal();origSet.call(localStorage,"el_uid",u.uid)}}
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
  if(reloadIfStale())return;   // wiped on a page without progress sync
  if(u&&(isStudent(u)||AS)&&!myLevel&&!onBoard)await findHomeLevel(AS||u);
  if(AS&&!lsId&&!onBoard&&homeLevel)asBanner();   // again, with their level
  menuLink(u);
  sideMenu(u).catch(e=>console.warn("side menu",e));   // after menuLink: the LS links go before My activities
  studyCard(u);
  storyCard(u);
  if(myLevel||homeLevel)draw(u);   // the route is known now: the Problem button speaks its language
  // The teacher's answer to the student's problem reports (marked fixed, or a thank-you when deleted): a card, once (shared/js/el-reply.js).
  if(u&&isStudent(u)&&!document.getElementById("el-reply"))import("./el-reply.js").then(m=>m.showReplies({en:repEn(),
    load:()=>quiet("rp",u,async()=>(await getDocs(query(collection(db,"problemReplies"),where("uid","==",u.uid)))).docs.map(x=>Object.assign({id:x.id},x.data()))),
    done:id=>deleteDoc(doc(db,"problemReplies",id))})).catch(e=>console.warn("replies",e));
  // Announcements from the teacher to the student's group or to them (announcements/{id}): a card once each (shared/js/el-announce.js).
  if(u&&isStudent(u)&&!document.getElementById("el-announce"))import("./el-announce.js").then(m=>m.showAnnouncements({en:repEn(),
    load:()=>quiet("an",u,async()=>(await myAnnouncements(u)).filter(a=>!(a.read||{})[u.uid])),
    done:id=>updateDoc(doc(db,"announcements",id),{["read."+u.uid]:serverTimestamp()})})).catch(e=>console.warn("announcements",e));
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
    bellEl=m.bell({dash:DASH,onDash,watch:cb=>{stopBell=bellWatch(cb)}});draw(user)}).catch(e=>console.warn("bell",e));
  remember(u);
  userDone=true;listeners.forEach(f=>f(u));
  // a learning path that links a class presentation: "Join the class" while the teacher presents it (el-live-join.js)
  if(stopJoin){stopJoin();stopJoin=null}const jg=++joinGen;
  if(u&&isStudent(u)&&myGroup&&document.querySelector("a.deck-link"))import("./el-live-join.js").then(m=>{if(jg===joinGen)stopJoin=m.liveJoin({db,group:myGroup})}).catch(e=>console.warn("live",e));
});

window.ELCloud={submitActivity,auth,db,login,logout,isTeacher,isTester,isStudent,announcements:()=>user?myAnnouncements(user):Promise.resolve([]),viewGroup:()=>viewGroup(user),group:()=>myGroup,lsStatus,lsInfo:lsRead,lsNow:lsInfo,results:(fresh)=>AS?myResults(AS.uid,fresh):user?myResults(user.uid,fresh):Promise.resolve({}),levels:()=>AS?myLevels(AS.uid):user?myLevels(user.uid):Promise.resolve({}),get viewing(){return AS},get ca(){const l=myLevel||homeLevel;return l?elCa(l):null},onUser:f=>{listeners.push(f);if(user!==null&&userDone)f(user)},get user(){return user}};
