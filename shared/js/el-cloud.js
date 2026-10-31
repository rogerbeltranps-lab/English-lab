// English Lab cloud: sign-in (students: school email + password; teacher: Google; el-signin.js), per-LS progress sync, LS release gate,
// route (set by the teacher), learning paths the teacher opens per group, once-only activities, points per completed action.
import "./el-copyright.js";
import "./el-route-names.js";
import {initializeApp} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import * as A from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {signIn} from "./el-signin.js";
import {getFirestore,doc,getDoc,getDocs,setDoc,deleteDoc,collection,query,where,writeBatch,serverTimestamp,onSnapshot} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {CONFIG,DOMAINS,TEACHERS,TESTERS} from "./el-firebase.js";   // project config, school domains, teacher and testers
import {report} from "./el-report.js";

const SKIP=/^(el_|firebase|debug)/;
const ROOT=new URL("../../",import.meta.url);

const {getAuth,signOut,onAuthStateChanged}=A;
const app=initializeApp(CONFIG),auth=getAuth(app),db=getFirestore(app);
const origSet=Storage.prototype.setItem;
let bellEl=null,stopBell=null,stopJoin=null,stopGame=null,joinGen=0,lockedKeys=[],myGroup=null,noSync=false,user=null,timer=null,syncing=false,frozen=false,myLevel=null,stale=false,pulled=false;
const listeners=[];
const isTeacher=u=>!!u&&TEACHERS.includes((u.email||"").toLowerCase());
const isTester=u=>!!u&&TESTERS.includes((u.email||"").toLowerCase());
// Testers can switch to the student view of one group (bottom bar): the site then behaves as for a listed student of that group.
// Kept in this browser only (el_view), so it needs no rules change; "" = tester view, everything open.
const viewGroup=u=>{if(!isTester(u))return null;const g=localStorage.getItem("el_view");return (window.EL_GROUPS||[]).some(x=>x.id===g)?g:null};
const seesAll=u=>isTester(u)&&!viewGroup(u);
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
async function lsInfo(id){try{const s=await getDoc(doc(db,"ls",id));return s.exists()?{status:lsSt(s.data().status),enabled:s.data().enabled||[],groups:s.data().groups||null,open:s.data().open||{},secLocked:s.data().secLocked||{},secOpened:s.data().secOpened||{}}:{status:"hidden",enabled:[],groups:null,open:{}}}catch(e){return {status:"hidden",enabled:[],open:{}}}}
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
async function send(){
  timer=null;
  try{
    const snap=snapshot();
    await setDoc(doc(db,"students",user.uid),{name:user.displayName||"",email:user.email,updated:serverTimestamp()},{merge:true});
    await setDoc(progressRef(),{data:snap,updated:serverTimestamp()},{merge:true});
    // saved: these keys are no longer newer here than in the cloud (keys of a locked learning path can never be sent)
    const d=dirty();for(const k in d)if(snap[k]===localStorage.getItem(k)||lockedKeys.includes(k))delete d[k];setDirty(d);
    const a=window.EL_CATALOG&&actId&&EL_CATALOG.find(x=>x.id===actId);
    if(a&&a.graded&&!a.manual)await setDoc(doc(db,"students",user.uid,"results",resKey(actId)),resultPayload(a),{merge:true});
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
  const mail=u.email;await signOut(auth);wipeLocal();origSet.call(localStorage,"el_uid","");
  const o=overlay('<div style="max-width:520px"><h1>Aquest compte no pot entrar</h1><p><b></b> no és a la llista d\'alumnes d\'English Lab. Entra amb el teu correu de l\'institut i la contrasenya que t\'ha donat el professor, o parla amb ell.</p><p><button style="border:0;background:#0f766e;color:#fff;border-radius:999px;padding:8px 16px;cursor:pointer;font:inherit">Entra amb un altre compte</button></p></div>');
  o.style.zIndex=10001;o.querySelector("b").textContent=mail;o.querySelector("button").onclick=()=>{o.remove();login()};
}
// Shared school computers: never leak one student's local progress into another account.
const wipeLocal=()=>{const ks=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(!SKIP.test(k))ks.push(k)}ks.forEach(k=>localStorage.removeItem(k));localStorage.removeItem(DIRTY);if(ks.length)stale=true};
const logout=async()=>{await signOut(auth);wipeLocal();origSet.call(localStorage,"el_uid","");location.reload()};

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
  const lock=()=>document.querySelectorAll("main input,main textarea,main select,main .opt,main [draggable],main .actions button:not([data-vs])").forEach(e=>{if(e.closest(".section-next"))return;e.disabled=true;e.style.pointerEvents="none"});
  lock();new MutationObserver(lock).observe(document.body,{childList:true,subtree:true});
}
function overlay(html){
  const o=document.createElement("div");
  o.style.cssText="position:fixed;inset:0;z-index:10000;background:#f8fafc;display:grid;place-items:center;font:16px system-ui,sans-serif;text-align:center;padding:20px;overflow:auto";
  o.innerHTML=html;document.body.append(o);return o;
}
const todayLink='<p><a href="'+new URL("today.html",ROOT).href+'">Torna al meu tauler</a></p>';
const block=(title,msg)=>overlay('<div><h1>'+title+'</h1><p>'+msg+'</p>'+todayLink+'</div>');
// Signed-out visitors on an LS page: the sign-in button sits in the overlay itself; it goes away once someone signs in.
let signInO=null;
function signInBlock(){
  signInO=overlay('<div style="max-width:520px"><h1>Sign in</h1><p>To do the activities you need to sign in with your school email (@'+DOMAINS.join(", @")+') and the password your teacher gave you.</p><p><button style="border:0;background:#0f766e;color:#fff;border-radius:999px;padding:8px 16px;cursor:pointer;font:inherit">Sign in</button></p></div>');
  signInO.querySelector("button").onclick=login;
}

// Class group: listed students get the group of the student list (copied to students/{uid}.group, which the pages read).
// Testers, and everyone while the list cannot be read, choose it once on the first sign-in; afterwards only the teacher changes it.
async function ensureGroup(u){
  const s=await getDoc(doc(db,"students",u.uid)).catch(()=>null),cur=s&&s.exists()?s.data().group:null;
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
  if(!all)btns.forEach(b=>{if(b!==mine)b.style.display="none"});
}
// Students only use their board, English Lab, their own course page and the LSs assigned to their group.
const BOARD=new URL("today.html",ROOT).href,DASH=new URL("teacher.html",ROOT).href,onBoard=/\/today\.html$/.test(location.pathname),onLab=/\/lab\/(index\.html)?$/.test(location.pathname),
  onHome=[ROOT.pathname,ROOT.pathname+"index.html"].includes(location.pathname),onDash=/\/teacher\.html$/.test(location.pathname);
// The teacher's Dashboard link says which course (and LS) this page is in, so the dashboard opens on it (teacher.html, el_t_last).
const dashHere=(()=>{const c=relPath.match(/^((2|4)eso)\//);if(!c)return DASH;const u=new URL(DASH);u.searchParams.set("course",c[1]);
  if(lsId)u.searchParams.set("ls",lsId);return u.href})();
const courseOf=g=>((window.EL_GROUPS||[]).find(x=>x.id===g)||{}).course;
async function gate(u){
  const c=relPath.match(/^((2|4)eso)\/(index\.html)?$/);
  if(!u&&c){signInBlock();return}   // course pages are for signed-in users only
  if(isStudent(u)&&!seesAll(u)&&!lsId&&!onBoard&&!onLab){
    if(!(c&&c[1]===courseOf(myGroup))){location.replace(BOARD);return}
  }
  if(!lsId||!window.EL_CATALOG)return;
  const info=await lsInfo(lsId),st=info.status;
  if(isStudent(u)&&!seesAll(u)&&Array.isArray(info.open[myGroup]))lockedKeys=elLpLocks(lsId,info.open[myGroup]).lockedKeys;
  if(isTeacher(u)){banner("Teacher mode · LS "+lsId+": "+st,"#475569");return}
  if(!u||!isStudent(u)){signInBlock();return}
  const tester=seesAll(u),vg=viewGroup(u);
  if(tester)banner("Test account: you see every LS and activity.","#7c3aed");
  if(vg)banner("Test account · student view of "+EL_GROUPS.find(x=>x.id===vg).name+": you see what this group sees.","#7c3aed",{t:"See everything again",f:()=>{origSet.call(localStorage,"el_view","");location.reload()}});
  if(!tester&&!elLsForGroup(EL_LS.find(l=>l.id===lsId),info,myGroup)){block("Aquesta LS no és del teu grup","Torna al teu tauler: allà tens les LS que el professor ha assignat al teu grup.");return}
  if(st==="hidden"&&!tester){block("Aquesta LS encara no està disponible","El professor l'obrirà quan estigui preparada.");return}
  if(localStorage.getItem("el_practice_"+actId)!=="1")await pull();
  if(reloadIfStale())return;
  const a=EL_CATALOG.find(x=>x.id===actId),saved=hasWork(a);   // before applyLevel, whose route click saves an empty state
  // The route of this LS, or the one carried over from an earlier LS (elRouteOf). With none yet, a student works on the Insecure
  // version (nothing is saved as their route) until the teacher sets it; testers just see every route.
  const lvs={};try{(await getDocs(collection(db,"students",u.uid,"levels"))).forEach(d=>lvs[d.id]=d.data())}catch(e){console.warn("levels",e)}
  let lvl=elRouteOf(lvs,lsId).level;
  if(!lvl&&!tester){lvl="insecure";banner("Encara no tens nivell: el professor te'l posarà a partir de l'examen de la primera LS. De moment fas la ruta Base.","#0369a1")}
  if(lvl||tester)applyLevel(lvl,tester);
  if(st==="closed"){freeze();banner("LS tancada: només pots consultar el que vas fer i el feedback.","#92400e");return}
  // Students are never told which activities are assessed (Roger, 26 Oct 2026), so this message does not say it either.
  const ca=elCa(lvl);
  // Learning paths open per group (elLpOpen in el-catalog.js): a locked one shows a block and saves nothing.
  // Students always see their own answers (Roger, 26 Oct 2026): with saved work it opens read-only instead of the block.
  if(a&&!tester&&!elLpOpen(a,info,myGroup)&&saved){freeze();banner(ca?"Aquesta activitat ara està tancada: pots veure les teves respostes, però no canviar-les.":"This activity is closed for now: you can see your answers, but not change them.","#92400e");return}
  if(a&&!tester&&!elLpOpen(a,info,myGroup)){frozen=true;block(ca?"Aquesta activitat encara no està oberta":"This activity is not open yet",ca?"El professor l'obrirà a classe quan toqui fer-la.":"Your teacher will open it in class when it is time to do it.");return}
  if(a&&!tester)lockSections(elSecLockedFor(a,info,myGroup,new Set(a.keys.flatMap(k=>[...elDoneSet(localStorage.getItem(k))]))),ca);
  // A recall checkpoint must be done before what comes after it in the LS (elCheckpointMissing in el-catalog.js).
  const cp=!tester&&elCheckpointMissing(a,x=>elDoneSet(localStorage.getItem(x.keys[0])),x=>elLpOpen(x,info,myGroup));
  if(cp&&saved){freeze();banner(ca?"Per continuar aquesta activitat, primer acaba el "+cp.title+". Mentrestant pots veure les teves respostes.":"To go on with this activity, first finish "+cp.title+". Meanwhile you can see your answers.","#92400e",{t:(ca?"Obre el ":"Open ")+cp.title+" →",f:()=>{location.href=new URL(cp.path,ROOT).href}});return}
  if(cp){const o=overlay('<div style="max-width:520px"><h1></h1><p></p><p><a class="go" style="display:inline-block;background:#0f766e;color:#fff;border-radius:999px;padding:10px 18px;text-decoration:none;font-weight:700"></a></p>'+todayLink+'</div>');
    o.querySelector("h1").textContent=ca?"Primer fes el "+cp.title:"First do "+cp.title;
    o.querySelector("p").textContent=ca?"Per continuar, primer has d'acabar el "+cp.title+". Fes-lo sense apunts.":"To go on, first finish "+cp.title+". Do it without notes.";
    const go=o.querySelector("a.go");go.href=new URL(cp.path,ROOT).href;go.textContent=(ca?"Obre el ":"Open ")+cp.title+" →";return}
  if(a&&a.manual&&a.graded)banner(ca?"Aquesta activitat és per entregar a través del Google Classroom.":"This activity is to be submitted through Google Classroom.","#1d4ed8");
  if(a&&a.mode==="once"){
    const rref=doc(db,"students",u.uid,"results",resKey(actId));
    const r=await getDoc(rref).catch(()=>null),rd=r&&r.exists()?r.data():{};
    if(rd.locked){
      noSync=true;const pk="el_practice_"+actId;
      if(localStorage.getItem(pk)==="1"){banner("Mode pràctica: pots fer l'activitat de nou, però no s'enviarà ni canviarà la teva nota.","#7c3aed",{t:"Surt de la pràctica",f:()=>{origSet.call(localStorage,pk,"0");location.reload()}});return}
      banner("Activitat entregada. Pots consultar-la i, si vols, tornar-la a fer per practicar (no s'enviarà de nou).","#92400e",{t:"Practica de nou",f:()=>{a.keys.forEach(k=>localStorage.removeItem(k));origSet.call(localStorage,pk,"1");location.reload()}});
      freeze();return}
    const submit=async()=>{if(!confirm(ca?"Un cop entregada, la nota queda fixada (podràs practicar-la de nou, però no s'enviarà). Vols entregar-la?":"Once submitted, your result is fixed (you can practise it again, but it will not be sent). Submit it?"))return;
      await setDoc(progressRef(),{data:snapshot(),updated:serverTimestamp()},{merge:true});
      await setDoc(rref,resultPayload(a,{locked:true,markedDone:true}),{merge:true});location.reload()};
    if(rd.markedDone)banner((ca?"Aquesta activitat és per entregar. L'has marcada com a feta, però encara no l'has entregada.":"This activity is to be submitted. You have marked it as done but not submitted it yet."),"#15803d",[{t:ca?"Entrega-la":"Submit",f:submit},{t:ca?"Desmarca":"Unmark",f:async()=>{await setDoc(rref,{markedDone:false,updated:serverTimestamp()},{merge:true});location.reload()}}]);
    else banner((ca?"Aquesta activitat és per entregar (només una vegada). Quan acabis, marca-la com a feta.":"This activity is to be submitted (only once). When you finish, mark it as done."),"#1d4ed8",{t:ca?"Marca com a feta":"Mark as done",f:async()=>{
      await setDoc(progressRef(),{data:snapshot(),updated:serverTimestamp()},{merge:true});
      await setDoc(rref,resultPayload(a,{markedDone:true}),{merge:true});
      if(confirm(ca?"Activitat marcada com a feta. Vols entregar-la ara? (La nota quedarà fixada.)":"Activity marked as done. Do you want to submit it now? (Your result will be fixed.)"))await setDoc(rref,resultPayload(a,{locked:true,markedDone:true}),{merge:true});
      location.reload()}});
  }
  openHashTab();
  // Work left in this browser that the cloud does not have yet (for example done while the LS was still "public") reaches the cloud now.
  push();
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
// A link to a section (activity.html#read, from the to-do list) opens that tab once the page is ready.
function openHashTab(){const id=decodeURIComponent(location.hash.slice(1));if(!id)return;const t=[...document.querySelectorAll(".tab[data-panel]")].find(x=>x.dataset.panel===id);if(t)t.click()}
addEventListener("hashchange",openHashTab);

// Submit (lock) an activity from any page, using the progress saved in the cloud.
async function submitActivity(a){
  const u=user;if(!u||!isStudent(u))return false;
  const p=await getDoc(doc(db,"students",u.uid,"progress",a.ls)).catch(()=>null),data=p&&p.exists()?p.data().data||{}:{};
  const sc=elPoints(a,k=>data[k]);
  await setDoc(doc(db,"students",u.uid,"results",resKey(a.id)),{ls:a.ls,activity:a.id,score:sc,max:a.points,done:sc,locked:true,markedDone:true,updated:serverTimestamp()},{merge:true});
  return true;
}

// Problem reports (bottom bar "⚠️ Problema / Problem"): problems/{id}, read only by the teacher in the dashboard.
// Catalan for Insecure and with no route; English for Safe and Daring (LS pages: the route; the board: its own language).
const repEn=()=>myLevel?!elCa(myLevel):onBoard&&document.documentElement.lang==="en";
// A screenshot goes in its own document (problemShots/{same id}), so the dashboard loads it only when the teacher opens it.
const reportProblem=u=>report({en:repEn(),save:o=>{
  const {shot,shotFrom}=o,ref=doc(collection(db,"problems")),b=writeBatch(db);delete o.shot;delete o.shotFrom;
  b.set(ref,Object.assign(o,{uid:u.uid,email:(u.email||"").toLowerCase(),name:u.displayName||"",group:myGroup||null,ls:lsId,activity:actId,route:myLevel,shot:shot?shotFrom:null,created:serverTimestamp()}));
  if(shot)b.set(doc(db,"problemShots",ref.id),{uid:u.uid,img:shot,created:serverTimestamp()});
  return b.commit()}});

function bar(){
  const el=document.createElement("div");el.id="el-cloud-bar";
  el.style.cssText="position:fixed;right:10px;bottom:10px;z-index:10002;background:#fff;border:1px solid #cbd5e1;border-radius:999px;padding:6px 12px;font:13px system-ui,sans-serif;box-shadow:0 2px 8px #0002;display:flex;gap:8px;align-items:center";
  document.body.appendChild(el);
  return u=>{el.innerHTML="";
    const b=(t,f)=>{const x=document.createElement("button");x.textContent=t;x.onclick=f;x.style.cssText="border:0;background:#0f766e;color:#fff;border-radius:999px;padding:4px 10px;cursor:pointer";return x};
    if(!u)el.append("Not signed in ",b("Sign in",login));
    else{el.append(u.displayName||u.email," ");
      const a=document.createElement("a");a.textContent=isTeacher(u)?"Dashboard":"My activities";a.href=isTeacher(u)?dashHere:BOARD;el.append(a," ");
      if(isStudent(u)&&!onLab){const l=document.createElement("a");l.textContent="English Lab";l.href=new URL("lab/",ROOT).href;el.append(l," ")}
      if(isStudent(u)){const p=b("⚠️ "+(repEn()?"Problem":"Problema"),()=>reportProblem(u));p.style.background="#b45309";p.title=repEn()?"Report a problem: something on the website does not work":"Avisa d'un problema: alguna cosa de la web no funciona";el.append(p," ")}
      if(isTeacher(u)&&bellEl)el.append(bellEl," ");
      if(isTester(u)){const s=document.createElement("select");s.title="Tester: see the site as a student of this group";
        s.innerHTML='<option value="">View: tester (everything)</option>'+(window.EL_GROUPS||[]).map(g=>'<option value="'+g.id+'">View as '+g.name+'</option>').join("");
        s.value=viewGroup(u)||"";s.onchange=()=>{origSet.call(localStorage,"el_view",s.value);location.reload()};el.append(s," ")}
      el.append(b("Sign out",logout))}};
}
// Every page's own menu gets a link to the board ("My activities") for a signed-in student, or to the dashboard for the teacher,
// next to its Home link: header menu (course and LS pages), side and phone menus (Home, English Lab), top bar of activity pages.
function menuLink(u){
  document.querySelectorAll("[data-el-board]").forEach(e=>e.remove());
  if(!u||onBoard||onDash||!(isStudent(u)||isTeacher(u)))return;
  const teach=isTeacher(u),txt=teach?"Dashboard":elCa(myLevel)?"Les meves activitats":"My activities";
  const add=(home,cls,icon)=>{if(!home)return;const a=document.createElement("a");a.dataset.elBoard="";a.className=cls;a.href=teach?dashHere:BOARD;a.textContent=icon+txt;home.after(a)};
  document.querySelectorAll(".navlinks").forEach(n=>add(n.querySelector(":scope>a"),"",""));
  document.querySelectorAll(".nav-tabs,.mobile-tabs").forEach(n=>add(n.querySelector(":scope>.tab-btn"),"tab-btn",""));
  document.querySelectorAll(".lp-home-link").forEach(h=>add(h,"lp-home-link","☰ "));
  document.querySelectorAll(".site-header .home-link").forEach(h=>add(h,"home-link",""));
}
// Learning Situations dropdown (.ls-dropdown, course and LS pages): a student, and the tester in a group's view, sees only their own
// course with the LSs assigned to their group that are not hidden; the other courses and the "Soon" ones go (Roger, 26 Oct 2026).
async function lsMenu(u){
  const dds=document.querySelectorAll(".ls-dropdown");
  if(!dds.length||!u||!isStudent(u)||seesAll(u)||!myGroup)return;
  const course=courseOf(myGroup),home=new URL(course+"/",ROOT).href,norm=h=>new URL(h,location.href).href.replace(/index\.html$/,""),ok={};
  await Promise.all((window.EL_LS||[]).filter(l=>l.course===course).map(async l=>{const i=await lsInfo(l.id);
    ok[new URL(l.id.replace(course+"-",course+"/")+"/",ROOT).href]=i.status!=="hidden"&&elLsForGroup(l,i,myGroup)}));
  dds.forEach(dd=>dd.querySelectorAll(".course-group").forEach(g=>{const c=g.querySelector(":scope>.course-link");
    if(g.classList.contains("muted-group")||!c||norm(c.getAttribute("href"))!==home){g.remove();return}
    g.querySelectorAll(".ls-link").forEach(a=>{if(!ok[norm(a.getAttribute("href"))])a.remove()})}));
}
// Vocabulary and grammar summary on the LS page (Roger, 26 Oct 2026): the "Language & Knowledge" tab has an empty card ([data-el-study]);
// for an LS with `study` in EL_LS it gets the student's route PDF (nothing until they have a route), the teacher and testers all three.
// Pro (native, C2): its own PDF where the LS has `pro` (tools/study-summary/build-pro.sh), otherwise the Daring one; Starter gets Base.
function studyCard(u){
  const el=document.querySelector("[data-el-study]"),ls=(window.EL_LS||[]).find(x=>x.id===lsId);
  if(!el||!ls||!ls.study||!u)return;
  const every=isTeacher(u)||seesAll(u),lv=myLevel,ca=!every&&elCa(lv);
  if(!every&&!lv)return;
  const a=r=>'<a href="'+new URL(ls.study+r+".pdf",ROOT).href+'" download style="display:inline-block;margin:4px 8px 0 0;padding:12px 18px;border-radius:12px;background:var(--accent-dark);color:white;font-weight:800;text-decoration:none">📥 '+(ca?"Descarrega el resum":"Download the summary")+(every?" · "+EL_LEVELS.find(x=>x.id===r).name:"")+" (PDF)</a>";
  el.innerHTML="<h2>📚 "+(ca?"Resum del vocabulari i la gramàtica":"Vocabulary and grammar summary")+"</h2><p>"
    +(ca?"Primer tot el vocabulari i després tota la gramàtica de la teva ruta, amb les explicacions i la pràctica. Descarrega'l quan vulguis per estudiar. És opcional: fes-lo servir si et va bé.":"All the vocabulary and then all the grammar of your route, with the explanations and practice. Download it whenever you want to study. It is optional: use it if it helps you.")
    +"</p><p>"+(every?EL_LEVELS.filter(x=>x.id!=="beginners"&&(x.id!=="native"||ls.pro)).map(x=>a(x.id)).join(""):a(lv==="beginners"?"insecure":lv==="native"&&!ls.pro?"daring":lv))+"</p>";
  el.hidden=false;
}
let draw=()=>{};
const start=()=>{draw=bar();draw(user)};
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",start):start();
new MutationObserver(()=>draw(user)).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});   // the board picks its language after loading

// Class game (lab/game, Roger 26 Oct 2026): while the teacher's board runs a game for the student's group (live/{group}, host.js), a
// signed-in student is taken into it (lab/game/play.html) from whatever page they are on, and goes back here with the player's Leave.
const GAME=new URL("lab/game/play.html",ROOT),onGame=location.pathname===GAME.pathname;
function gamePush(u){
  if(stopGame){stopGame();stopGame=null}
  if(!u||!isStudent(u)||!myGroup||onGame)return;
  stopGame=onSnapshot(doc(db,"live",myGroup),s=>{const x=s.exists()?s.data():null,ms=x&&x.at&&x.at.toMillis?x.at.toMillis():0;
    if(x&&x.game&&x.on&&x.phase!=="end"&&Date.now()-ms<10*60e3){location.href=GAME.href+"?g="+encodeURIComponent(myGroup)+"&from="+encodeURIComponent(location.pathname+location.search)}},
    e=>console.warn("game",e));
}
function loadScript(src,has){return has()?Promise.resolve():new Promise(r=>{const s=document.createElement("script");s.src=new URL(src,ROOT).href;s.onload=r;s.onerror=r;document.head.append(s)})}
function loadCatalog(){return window.EL_CATALOG?Promise.resolve():new Promise(r=>{const s=document.createElement("script");s.src=new URL("shared/js/el-catalog.js",ROOT).href;s.onload=r;s.onerror=r;document.head.append(s)})}
await loadCatalog();
// Activities are matched by path, so pages with the same file name in different LSs keep separate results.
const byPath=(window.EL_CATALOG||[]).find(x=>x.path===relPath);if(byPath)actId=byPath.id;

onAuthStateChanged(auth,async u=>{
  user=u;draw(u);
  if(u&&signInO){signInO.remove();signInO=null}
  // A student's first sign-in on this browser starts clean too: what is there was done by the teacher, a signed-out visitor or
  // another student, and this student's own work comes back from the cloud (pull).
  if(u&&isStudent(u)){const prev=localStorage.getItem("el_uid");if(prev!==u.uid){wipeLocal();origSet.call(localStorage,"el_uid",u.uid)}}
  myRoster=u&&isStudent(u)&&!isTester(u)?await onRoster(u):undefined;
  if(myRoster===null){await refuse(u);return}
  if(u&&isStudent(u))try{myGroup=viewGroup(u)||await ensureGroup(u)}catch(e){console.warn("group",e)}
  // A route the teacher set on the student list before their first sign-in (roster/{email}.route = {level, ls}, teacher.html listRoute):
  // saved as their route in that LS, with the level notice fields, if they have none there yet (firestore.rules checks it matches the list).
  const lr=myRoster&&myRoster.route;
  if(lr&&lr.level&&lr.ls)try{const ref=doc(db,"students",u.uid,"levels",lr.ls);if(!(await getDoc(ref)).exists())await setDoc(ref,{level:lr.level,changed:serverTimestamp(),was:null,why:null})}catch(e){console.warn("route from the list",e)}
  gamePush(u);
  lsMenu(u).catch(e=>console.warn("ls menu",e));
  document.querySelectorAll("[data-el-teacher]").forEach(e=>e.hidden=!isTeacher(u));   // teacher-only links (e.g. a class game on its learning path)
  menuLink(u);   // again after gate, which knows the route (the label follows its language)
  try{await gate(u)}catch(e){console.warn("gate",e)}
  if(reloadIfStale())return;   // wiped on a page without progress sync
  menuLink(u);
  studyCard(u);
  if(myLevel)draw(u);   // the route is known now: the Problem button speaks its language
  // The teacher's answer to the student's problem reports (marked fixed, or a thank-you when deleted): a card, once (shared/js/el-reply.js).
  if(u&&isStudent(u)&&!document.getElementById("el-reply"))import("./el-reply.js").then(m=>m.showReplies({en:repEn(),
    load:async()=>(await getDocs(query(collection(db,"problemReplies"),where("uid","==",u.uid)))).docs.map(x=>Object.assign({id:x.id},x.data())),
    done:id=>deleteDoc(doc(db,"problemReplies",id))})).catch(e=>console.warn("replies",e));
  // "Your exam results are ready": a card once per new set of exam marks, with a link to the board on that LS (shared/js/el-exam-notice.js).
  if(u&&isStudent(u)&&myGroup&&!seesAll(u)&&!document.getElementById("el-exam-notice"))loadScript("shared/js/el-grading.js",()=>window.EL_GRADING)
    .then(()=>import("./el-exam-notice.js")).then(m=>m.examNotice({course:courseOf(myGroup),en:repEn(),board:BOARD,
      get:async ls=>{const s=await getDoc(doc(db,"students",u.uid,"results",ls+"__assessment"));return s.exists()?s.data():null},
      seen:async()=>{const s=await getDoc(doc(db,"students",u.uid));return s.exists()&&s.data().examSeen||{}},
      save:(ls,v)=>setDoc(doc(db,"students",u.uid),{examSeen:{[ls]:v}},{merge:true}),
      visible:async ls=>{const i=await lsInfo(ls);return i.status!=="hidden"&&elLsForGroup((window.EL_LS||[]).find(x=>x.id===ls),i,myGroup)}})).catch(e=>console.warn("exam notice",e));
  // The teacher's corrections and answers to hand-ins: a card once per new answer with a link to the step's tab, and the answer inside
  // that tab on the learning path (shared/js/el-corrections.js).
  if(u&&isStudent(u)&&!document.getElementById("el-corrections"))loadScript("shared/js/el-catalog.js",()=>window.EL_CATALOG).then(()=>loadScript("shared/js/el-grading.js",()=>window.EL_GRADING))
    .then(()=>import("./el-corrections.js")).then(m=>m.corrections({here:actId,root:ROOT,en:repEn(),
      list:async()=>(await getDocs(collection(db,"students",u.uid,"results"))).docs.map(x=>x.data()).filter(r=>r&&r.activity&&(r.replies||r.levels)),
      seen:async()=>{const s=await getDoc(doc(db,"students",u.uid));return s.exists()&&s.data().fbSeen||{}},
      save:o=>setDoc(doc(db,"students",u.uid),{fbSeen:o},{merge:true}),
      name:(aid,step)=>{for(const g of Object.values(window.EL_GRADING||{})){const x=(g.moments||[]).find(m=>m.a===aid&&m.step===step);if(x)return x.name}return null}})).catch(e=>console.warn("corrections",e));
  // "Your level": a card once each time the teacher sets the student's route (shared/js/el-level-notice.js).
  if(u&&isStudent(u)&&myGroup&&!seesAll(u)&&!document.getElementById("el-level-notice"))import("./el-level-notice.js").then(m=>m.levelNotice({course:courseOf(myGroup),
    lv:async()=>{const o={};(await getDocs(collection(db,"students",u.uid,"levels"))).forEach(d=>o[d.id]=d.data());return o},
    seen:async()=>{const s=await getDoc(doc(db,"students",u.uid));return s.exists()&&s.data().levelSeen||{}},
    save:(c,ms)=>setDoc(doc(db,"students",u.uid),{levelSeen:{[c]:ms}},{merge:true})})).catch(e=>console.warn("level notice",e));
  // Floating weekly to-do list for students (and testers) on every page that loads this file (shared/js/el-todo.js).
  if(u&&isStudent(u)&&myGroup&&!document.getElementById("el-todo-btn"))import(new URL("shared/js/el-todo.js",ROOT).href).then(m=>m.start({db,user:u,group:myGroup,root:ROOT,lsId,seesAll:seesAll(u)})).catch(e=>console.warn("todo",e));
  // The teacher's 🔔 in the bottom bar: open problem reports from all groups, live, on every page (shared/js/el-bell.js).
  if(stopBell&&!isTeacher(u)){stopBell();stopBell=null;bellEl=null;draw(u)}
  if(isTeacher(u)&&!bellEl)import("./el-bell.js").then(m=>{if(bellEl||!isTeacher(user))return;
    bellEl=m.bell({dash:DASH,onDash,watch:cb=>{stopBell=onSnapshot(collection(db,"problems"),s=>cb(s.docs.map(x=>Object.assign({id:x.id},x.data()))),e=>console.warn("bell",e))}});draw(user)}).catch(e=>console.warn("bell",e));
  listeners.forEach(f=>f(u));
  // a learning path that links a class presentation: "Join the class" while the teacher presents it (el-live-join.js)
  if(stopJoin){stopJoin();stopJoin=null}const jg=++joinGen;
  if(u&&isStudent(u)&&myGroup&&document.querySelector("a.deck-link"))import("./el-live-join.js").then(m=>{if(jg===joinGen)stopJoin=m.liveJoin({db,group:myGroup})}).catch(e=>console.warn("live",e));
});

window.ELCloud={submitActivity,auth,db,login,logout,isTeacher,isTester,isStudent,viewGroup:()=>viewGroup(user),group:()=>myGroup,lsStatus,lsInfo,onUser:f=>{listeners.push(f);if(user!==null)f(user)},get user(){return user}};
