// English Lab cloud: sign-in (students: school email + password; teacher: Google; el-signin.js), per-LS progress sync, LS release gate,
// route (set by the teacher), learning paths the teacher opens per group, once-only activities, points per completed action.
import "./el-copyright.js";
import "./el-route-names.js";
import {initializeApp} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import * as A from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {signIn} from "./el-signin.js";
import {getFirestore,doc,getDoc,getDocs,setDoc,updateDoc,deleteDoc,collection,query,where,writeBatch,serverTimestamp,onSnapshot} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {CONFIG,DOMAINS,TEACHERS,TESTERS} from "./el-firebase.js";   // project config, school domains, teacher and testers
import {report} from "./el-report.js";

const SKIP=/^(el_|firebase|debug)/;
const ROOT=new URL("../../",import.meta.url);

const {getAuth,signOut,onAuthStateChanged}=A;
const app=initializeApp(CONFIG),auth=getAuth(app),db=getFirestore(app);
const origSet=Storage.prototype.setItem;
let bellEl=null,stopBell=null,stopJoin=null,stopGame=null,joinGen=0,lockedKeys=[],myGroup=null,noSync=false,user=null,timer=null,syncing=false,frozen=false,myLevel=null,homeLevel=null,stale=false,pulled=false;
const listeners=[];
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
async function lsInfo(id){try{const s=await getDoc(doc(db,"ls",id));if(!s.exists())return {status:"hidden",enabled:[],groups:null,open:{}};const d=s.data();
  if(d.planEdits&&window.ELWeek&&ELWeek.applyEdits)ELWeek.applyEdits(id,d.planEdits);
  return {status:lsSt(d.status),enabled:d.enabled||[],groups:d.groups||null,open:d.open||{},secLocked:d.secLocked||{},secOpened:d.secOpened||{},homework:d.homework||{},planEdits:d.planEdits||{}}}catch(e){return {status:"hidden",enabled:[],open:{}}}}
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
// The link back to the board speaks the page's language: Catalan for Starter, Base and no route, English otherwise.
const todayLink=(ca=true)=>'<p><a href="'+new URL("today.html",ROOT).href+'">'+(ca?"Torna al meu tauler":"Back to my board")+'</a></p>';
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
// Students only use their board, English Lab (lab/ and its practice page lab/practice.html), their own course page and the LSs assigned to their group.
const BOARD=new URL("today.html",ROOT).href,DASH=new URL("teacher.html",ROOT).href,onBoard=/\/today\.html$/.test(location.pathname),onLab=/\/lab\/(index\.html|practice\.html)?$/.test(location.pathname),
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
  if(isTeacher(u)){banner("Teacher mode · LS "+lsId+": "+st,"#475569");teacherSections(info);return}
  if(!u||!isStudent(u)){signInBlock();return}
  const tester=seesAll(u),vg=viewGroup(u);
  if(tester)banner("Test account: you see every LS and activity.","#7c3aed");
  if(vg){const vl=viewLevel(u);banner("Test account · student view of "+EL_GROUPS.find(x=>x.id===vg).name+(vl?" · level "+(window.elLevelLabel?elLevelLabel(courseOf(vg),vl):vl):"")+": you see what this group sees.","#7c3aed",{t:"See everything again",f:()=>{origSet.call(localStorage,"el_view","");location.reload()}})}
  // The student's level: one per course, the same in every LS (elRouteOf). With none yet, a student works on the Insecure
  // version (nothing is saved as their route) until the teacher sets it; testers just see every route.
  const lvs={};try{(await getDocs(collection(db,"students",u.uid,"levels"))).forEach(d=>lvs[d.id]=d.data())}catch(e){console.warn("levels",e)}
  let lvl=elRouteOf(lvs,lsId).level;
  const ca0=!lvl||elCa(lvl);   // the blocks below speak the student's language (Catalan with no route)
  if(!tester&&!elLsForGroup(EL_LS.find(l=>l.id===lsId),info,myGroup)){block(ca0?"Aquesta LS no és del teu grup":"This LS is not for your group",ca0?"Torna al teu tauler: allà tens les LS que el professor ha assignat al teu grup.":"Go back to your board: it has the LSs your teacher gave your group.",ca0);return}
  if(st==="hidden"&&!tester){block(ca0?"Aquesta LS encara no està disponible":"This LS is not available yet",ca0?"El professor l'obrirà quan estigui preparada.":"Your teacher will open it when it is ready.",ca0);return}
  if(localStorage.getItem("el_practice_"+actId)!=="1")await pull();
  if(reloadIfStale())return;
  const a=EL_CATALOG.find(x=>x.id===actId),saved=hasWork(a);   // before applyLevel, whose route click saves an empty state
  if(!lvl&&!tester){lvl="insecure";banner("Encara no tens nivell: el professor te'l posarà a partir de l'examen de la primera LS. De moment fas la ruta Base.","#0369a1")}
  if(lvl||tester)applyLevel(lvl,tester);
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
// Open and close sections right on the page (Roger, 1 Nov 2026: "vull poder obrir i tancar les tabs, són les seccions dels camins"): in
// teacher mode a bar above the tabs picks a group, and every section tab gets a 🔓/🔒 switch for that group. Same data and rule as the
// dashboard's Sections column (teacher.html api.secLock): ls/{id}.secLocked[group][activity] = locked panel ids, and secOpened keeps every
// section opened so far (elSecLockedFor, elSecPending in el-catalog.js). A learning path still locked for the group shows a warning with
// an Open button (ls/{id}.open, locked, lockedKeys, as api.lpOpen). LS1 pages are left as they are (Roger: leave LS1 alone).
// The learning path pages do not load el-sections.js (the section list the dashboard uses), so it is loaded here for the teacher only.
async function teacherSections(info){
  if(!window.EL_SECTIONS)await new Promise(r=>{const sc=document.createElement("script");sc.src=new URL("shared/js/el-sections.js",ROOT).href;sc.onload=sc.onerror=r;document.head.append(sc)});
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
  const toggle=id=>{const off=new Set(locked());off.has(id)?off.delete(id):off.add(id);save(all.filter(x=>off.has(x)))};
  function draw(){
    const t0=document.querySelector(".tab[data-panel]"),nav=t0&&t0.parentElement;if(!nav)return;
    let bar=document.getElementById("el-tsec");
    if(!bar||bar.nextElementSibling!==nav){if(bar)bar.remove();bar=document.createElement("div");bar.id="el-tsec";bar.className="el-tsec";nav.before(bar);
      bar.onclick=e=>{const b=e.target.closest("button");if(!b)return;e.preventDefault();
        if(b.dataset.g){g=b.dataset.g;origSet.call(localStorage,"el_t_secgroup",g);msg="";draw()}
        else if(b.dataset.all)save(b.dataset.all==="1"?[]:all.slice());else if(b.dataset.lp)openLp()}}
    const off=locked(),n=all.length-off.filter(x=>all.includes(x)).length;
    const html='<div class="r"><b>🔓 Sections open for</b>'+grs.map(x=>'<button data-g="'+x.id+'" class="'+(x.id===g?"on":"")+'">'+x.name+'</button>').join("")
      +'<span>· '+n+' of '+all.length+' open</span><button class="g" data-all="1">open all</button><button class="g" data-all="0">close all</button>'
      +(msg?'<span class="m'+(msg[0]==="✗"?" err":"")+'">'+msg+'</span>':"")+'</div>'
      +'<small>Click 🔓 or 🔒 on a tab to open or close that section for '+gname(g)+'. Students see a closed section read-only, with their saved answers; one you opened before stays doable for students who have not finished it. Teacher only: students never see this bar.</small>'
      +(elLpOpen(a,info,g)?"":'<div class="w">⚠️ This whole learning path is locked for '+gname(g)+': students cannot open it yet.<button data-lp="1">✔ Open it for '+gname(g)+'</button></div>');
    if(bar.dataset.h!==html){bar.innerHTML=html;bar.dataset.h=html}
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
  await setDoc(doc(db,"students",u.uid,"results",resKey(a.id)),{ls:a.ls,activity:a.id,score:sc,max:a.points,done:sc,locked:true,markedDone:true,updated:serverTimestamp()},{merge:true});
  return true;
}

// Announcements for this student (shared/js/el-announce.js): the ones sent to their group and the ones sent to them (testers are in every
// one's uids). Two queries, because firestore.rules let a student read only those; the teacher reads them all.
async function myAnnouncements(u){
  const c=collection(db,"announcements"),out={},add=s=>s.forEach(x=>out[x.id]=Object.assign({id:x.id},x.data()));
  if(isTeacher(u)){add(await getDocs(c));return Object.values(out)}
  const g=viewGroup(u)||myGroup;
  await Promise.all([getDocs(query(c,where("uids","array-contains",u.uid))).then(add),g&&getDocs(query(c,where("groups","array-contains",g))).then(add)].filter(Boolean));
  return Object.values(out);
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
  return u=>{el.innerHTML="";
    const b=(t,f)=>{const x=document.createElement("button");x.textContent=t;x.onclick=f;x.style.cssText="border:0;background:#0f766e;color:#fff;border-radius:999px;padding:4px 10px;cursor:pointer";return x};
    if(!u)el.append("Not signed in ",b("Sign in",login));
    else{el.append(u.displayName||u.email," ");
      const a=document.createElement("a");a.textContent=isTeacher(u)?"Dashboard":"My activities";a.href=isTeacher(u)?dashHere:BOARD;el.append(a," ");
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
  const teach=isTeacher(u),txt=teach?"Dashboard":elCa(myLevel||homeLevel)?"Les meves activitats":"My activities";
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
// Pro (native, C2): its own PDF where the LS has `pro`, otherwise the Daring one; Starter its own where the LS has `starter` (LS2 on,
// tools/lp-worksheets/build.mjs), otherwise Base.
function studyCard(u){
  const el=document.querySelector("[data-el-study]"),ls=(window.EL_LS||[]).find(x=>x.id===lsId);
  if(!el||!ls||!ls.study||!u)return;
  const every=isTeacher(u)||seesAll(u),lv=myLevel,ca=!every&&elCa(lv);
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
  const every=isTeacher(u)||seesAll(u),lv=myLevel,ca=!every&&elCa(lv),s=ls.story;
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
// The student's route on a page outside an LS: the route of their course's latest LS (carried over from earlier LSs, elRouteOf).
async function findHomeLevel(u){
  const c=courseOf(myGroup),ls=(window.EL_LS||[]).filter(l=>l.course===c).pop();if(!ls||!window.elRouteOf)return;
  try{const lvs={};(await getDocs(collection(db,"students",u.uid,"levels"))).forEach(d=>lvs[d.id]=d.data());homeLevel=elRouteOf(lvs,ls.id).level||null}catch(e){console.warn("route",e)}
}
function loadScript(src,has){return has()?Promise.resolve():new Promise(r=>{const s=document.createElement("script");s.src=new URL(src,ROOT).href;s.onload=r;s.onerror=r;document.head.append(s)})}
function loadCatalog(){return window.EL_CATALOG?Promise.resolve():new Promise(r=>{const s=document.createElement("script");s.src=new URL("shared/js/el-catalog.js",ROOT).href;s.onload=r;s.onerror=r;document.head.append(s)})}
await loadCatalog();
// Activities are matched by path, so pages with the same file name in different LSs keep separate results.
const byPath=(window.EL_CATALOG||[]).find(x=>x.path===relPath);if(byPath)actId=byPath.id;

onAuthStateChanged(auth,async u=>{
  window.EL_VIEW_LEVEL=viewLevel(u);   // before anything reads a route (elRouteOf)
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
  if(u&&isStudent(u)&&!myLevel&&!onBoard)await findHomeLevel(u);
  menuLink(u);
  studyCard(u);
  storyCard(u);
  if(myLevel||homeLevel)draw(u);   // the route is known now: the Problem button speaks its language
  // The teacher's answer to the student's problem reports (marked fixed, or a thank-you when deleted): a card, once (shared/js/el-reply.js).
  if(u&&isStudent(u)&&!document.getElementById("el-reply"))import("./el-reply.js").then(m=>m.showReplies({en:repEn(),
    load:async()=>(await getDocs(query(collection(db,"problemReplies"),where("uid","==",u.uid)))).docs.map(x=>Object.assign({id:x.id},x.data())),
    done:id=>deleteDoc(doc(db,"problemReplies",id))})).catch(e=>console.warn("replies",e));
  // Announcements from the teacher to the student's group or to them (announcements/{id}): a card once each (shared/js/el-announce.js).
  if(u&&isStudent(u)&&!document.getElementById("el-announce"))import("./el-announce.js").then(m=>m.showAnnouncements({en:repEn(),
    load:async()=>(await myAnnouncements(u)).filter(a=>!(a.read||{})[u.uid]),
    done:id=>updateDoc(doc(db,"announcements",id),{["read."+u.uid]:serverTimestamp()})})).catch(e=>console.warn("announcements",e));
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
      list:async()=>(await getDocs(collection(db,"students",u.uid,"results"))).docs.map(x=>x.data()).filter(r=>r&&r.activity&&(r.replies||r.answers||r.levels)),
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

window.ELCloud={submitActivity,auth,db,login,logout,isTeacher,isTester,isStudent,announcements:()=>user?myAnnouncements(user):Promise.resolve([]),viewGroup:()=>viewGroup(user),group:()=>myGroup,lsStatus,lsInfo,onUser:f=>{listeners.push(f);if(user!==null)f(user)},get user(){return user}};
