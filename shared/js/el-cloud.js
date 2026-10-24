// English Lab cloud: Google sign-in (school domain), per-LS progress sync, LS release gate,
// route (level) choice, teacher-enabled graded activities, once-only activities, points per completed action.
import {initializeApp} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getFirestore,doc,getDoc,setDoc,serverTimestamp} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const CONFIG={apiKey:"AIzaSyCdO9ygUg8GzhfKsmqJKBg7-k_BDE3ZvKE",authDomain:"english-lab-ietm.firebaseapp.com",projectId:"english-lab-ietm",storageBucket:"english-lab-ietm.firebasestorage.app",messagingSenderId:"100211300058",appId:"1:100211300058:web:aff85bd00c3a877e7af7e3"};
// Schools whose Google accounts can sign in as students. Add a new school by adding its domain here AND in firestore.rules.
const DOMAINS=["ietramuntana.cat"],TEACHERS=["roger.beltranps@gmail.com"],SKIP=/^(el_|firebase|debug)/;
const ROOT=new URL("../../",import.meta.url);

const app=initializeApp(CONFIG),auth=getAuth(app),db=getFirestore(app);
const origSet=Storage.prototype.setItem;
let noSync=false,publicLs=false,user=null,timer=null,syncing=false,frozen=false,myLevel=null;
const listeners=[];
const isTeacher=u=>!!u&&TEACHERS.includes((u.email||"").toLowerCase());
const isStudent=u=>!!u&&DOMAINS.some(d=>(u.email||"").toLowerCase().endsWith("@"+d));

// Which activity / LS is this page?
const relPath=location.pathname.replace(/^.*?\/((2|4)eso\/.*)$/,"$1");
const m=relPath.match(/^((2|4)eso)\/([^/]+)\//);
const lsId=m?m[1]+"-"+m[3]:null;
let actId=m?m[1]+"/"+relPath.split("/").pop().replace(".html",""):null;
const resKey=a=>a.replace("/","__");

const snapshot=()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(!SKIP.test(k))o[k]=localStorage.getItem(k)}return o};
const progressRef=()=>doc(db,"students",user.uid,"progress",lsId);
const levelRef=(uid,ls)=>doc(db,"students",uid,"levels",ls);

async function lsInfo(id){try{const s=await getDoc(doc(db,"ls",id));return s.exists()?{status:s.data().status||"hidden",enabled:s.data().enabled||[]}:{status:"hidden",enabled:[]}}catch(e){return {status:"hidden",enabled:[]}}}
const lsStatus=async id=>(await lsInfo(id)).status;

async function pull(){
  const s=await getDoc(progressRef()).catch(()=>null);
  if(s&&s.exists()){const cloud=s.data().data||{};syncing=true;
    for(const k in cloud){if(localStorage.getItem(k)!==cloud[k])origSet.call(localStorage,k,cloud[k])}
    syncing=false}
}
function resultPayload(a,extra){const sc=elPoints(a),parts=typeof window.EL_RESULT_PARTS==="function"?window.EL_RESULT_PARTS():null;return Object.assign({ls:lsId,activity:a.id,score:sc,max:a.points,done:sc,updated:serverTimestamp()},parts?{parts}:{},extra||{})}
function push(){
  if(!user||!isStudent(user)||syncing||frozen||!lsId||publicLs||noSync)return;
  clearTimeout(timer);
  timer=setTimeout(async()=>{
    try{
      await setDoc(doc(db,"students",user.uid),{name:user.displayName||"",email:user.email,updated:serverTimestamp()},{merge:true});
      await setDoc(progressRef(),{data:snapshot(),updated:serverTimestamp()},{merge:true});
      const a=window.EL_CATALOG&&actId&&EL_CATALOG.find(x=>x.id===actId);
      if(a&&a.graded&&!a.manual)await setDoc(doc(db,"students",user.uid,"results",resKey(actId)),resultPayload(a),{merge:true});
    }catch(e){console.warn("sync",e)}
  },1500);
}
Storage.prototype.setItem=function(k,v){if(frozen&&this===localStorage&&!SKIP.test(k))return;origSet.call(this,k,v);if(this===localStorage&&!SKIP.test(k))push()};

async function login(){
  const p=new GoogleAuthProvider();p.setCustomParameters({prompt:"select_account"});
  const r=await signInWithPopup(auth,p);
  if(!isStudent(r.user)&&!isTeacher(r.user)){await signOut(auth);alert("Sign in with your school account (@"+DOMAINS.join(", @")+").")}
}
// Shared school computers: never leak one student's local progress into another account.
const wipeLocal=()=>{const ks=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(!SKIP.test(k))ks.push(k)}ks.forEach(k=>localStorage.removeItem(k))};
const logout=async()=>{await signOut(auth);wipeLocal();origSet.call(localStorage,"el_uid","");location.reload()};

function banner(text,color,btn){
  const b=document.createElement("div");b.id="el-banner";
  b.style.cssText="position:sticky;top:0;z-index:9998;padding:8px 14px;font:14px system-ui,sans-serif;text-align:center;background:"+color+";color:#fff";
  b.textContent=text+" ";
  for(const bt of [].concat(btn||[])){const x=document.createElement("button");x.textContent=bt.t;x.onclick=bt.f;x.style.cssText="margin-left:8px;border:0;border-radius:6px;padding:3px 10px;cursor:pointer";b.append(x)}
  document.body.prepend(b);
}
function freeze(){
  frozen=true;
  const lock=()=>document.querySelectorAll("main input,main textarea,main select,main .opt,main [draggable]").forEach(e=>{e.disabled=true;e.style.pointerEvents="none"});
  lock();new MutationObserver(lock).observe(document.body,{childList:true,subtree:true});
}
function overlay(html){
  const o=document.createElement("div");
  o.style.cssText="position:fixed;inset:0;z-index:10000;background:#f8fafc;display:grid;place-items:center;font:16px system-ui,sans-serif;text-align:center;padding:20px;overflow:auto";
  o.innerHTML=html;document.body.append(o);return o;
}
const todayLink='<p><a href="'+new URL("today.html",ROOT).href+'">Back to my activities</a></p>';
const block=(title,msg)=>overlay('<div><h1>'+title+'</h1><p>'+msg+'</p>'+todayLink+'</div>');

function chooseLevel(u){
  return new Promise(res=>{
    const o=overlay('<div style="max-width:520px"><h1>Tria el teu nivell</h1><p>Aquesta tria és per a tota la situació d\'aprenentatge. Si després vols canviar-la, hauràs de demanar-ho al professor.</p><div id="el-lv"></div></div>');
    EL_LEVELS.forEach(l=>{const b=document.createElement("button");b.innerHTML="<b>"+l.name+"</b><br><small>"+l.ca+"</small>";
      b.style.cssText="display:block;width:100%;margin:10px 0;padding:12px;border:2px solid #0f766e;background:#fff;border-radius:12px;cursor:pointer;font:inherit";
      b.onclick=async()=>{if(!confirm("Triar el nivell "+l.name+"?"))return;await setDoc(levelRef(u.uid,lsId),{level:l.id,updated:serverTimestamp()});o.remove();res(l.id)};
      o.querySelector("#el-lv").append(b)});
  });
}
// Class group: asked once, on the first sign-in; afterwards only the teacher changes it.
async function ensureGroup(u){
  const s=await getDoc(doc(db,"students",u.uid)).catch(()=>null);
  if(!window.EL_GROUPS||(s&&s.exists()&&s.data().group))return;
  return new Promise(res=>{
    const o=overlay('<div style="max-width:520px"><h1>Tria el teu grup</h1><p>Només ho hauràs de fer una vegada. Si t\'equivoques, avisa el professor.</p><div id="el-gr"></div></div>');
    EL_GROUPS.forEach(g=>{const b=document.createElement("button");b.innerHTML="<b>"+g.name+"</b>";
      b.style.cssText="display:block;width:100%;margin:10px 0;padding:12px;border:2px solid #0f766e;background:#fff;border-radius:12px;cursor:pointer;font:inherit";
      b.onclick=async()=>{if(!confirm("Ets de "+g.name+"?"))return;await setDoc(doc(db,"students",u.uid),{group:g.id,name:u.displayName||"",email:u.email,updated:serverTimestamp()},{merge:true});o.remove();res(g.id)};
      o.querySelector("#el-gr").append(b)});
  });
}
function applyLevel(lvl){
  myLevel=lvl;
  const btns=[...document.querySelectorAll(".route[data-level]")];
  const mine=btns.find(b=>b.dataset.level===lvl);
  if(mine&&!mine.classList.contains("active"))mine.click();
  btns.forEach(b=>{if(b!==mine)b.style.display="none"});
}
async function requestLevel(u){
  const opts=EL_LEVELS.map(l=>l.id).join(", ");
  const want=prompt("A quin nivell vols canviar? ("+opts+")\nEl professor ho haurà d'acceptar.");
  if(!want||!EL_LEVELS.some(l=>l.id===want.trim().toLowerCase()))return;
  await setDoc(levelRef(u.uid,lsId),{request:want.trim().toLowerCase(),requestedAt:serverTimestamp()},{merge:true});
  alert("Petició enviada al professor.");
}

async function gate(u){
  if(!lsId||!window.EL_CATALOG)return;
  const info=await lsInfo(lsId),st=info.status;
  if(st==="public"){publicLs=true;return}   // free access, no login, nothing is saved or scored
  if(isTeacher(u)){banner("Mode professor · LS "+lsId+": "+st,"#475569");return}
  if(!u||!isStudent(u)){block("Sign in with your school account","To do the activities you need to sign in with your school account (@"+DOMAINS.join(", @")+") (button at the bottom right).");return}
  if(st==="hidden"){block("Aquesta LS encara no està disponible","El professor l'obrirà quan estigui preparada.");return}
  if(localStorage.getItem("el_practice_"+actId)!=="1")await pull();
  const a=EL_CATALOG.find(x=>x.id===actId);
  const ld=await getDoc(levelRef(u.uid,lsId)).catch(()=>null);
  let lvl=ld&&ld.exists()?ld.data().level:null;
  if(st==="closed"){if(lvl)applyLevel(lvl);freeze();banner("LS tancada: només pots consultar el que vas fer i el feedback.","#92400e");return}
  if(!lvl)lvl=await chooseLevel(u);
  applyLevel(lvl);
  if(a&&a.graded&&!info.enabled.includes(actId)){block("Aquesta activitat avaluable encara no està habilitada","El professor t'avisarà a classe quan toqui fer-la.");return}
  const ca=lvl==="insecure";
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
}

// Submit (lock) an activity from any page, using the progress saved in the cloud.
async function submitActivity(a){
  const u=user;if(!u||!isStudent(u))return false;
  const p=await getDoc(doc(db,"students",u.uid,"progress",a.ls)).catch(()=>null),data=p&&p.exists()?p.data().data||{}:{};
  const sc=elPoints(a,k=>data[k]);
  await setDoc(doc(db,"students",u.uid,"results",resKey(a.id)),{ls:a.ls,activity:a.id,score:sc,max:a.points,done:sc,locked:true,markedDone:true,updated:serverTimestamp()},{merge:true});
  return true;
}

function bar(){
  const el=document.createElement("div");el.id="el-cloud-bar";
  el.style.cssText="position:fixed;right:10px;bottom:10px;z-index:9999;background:#fff;border:1px solid #cbd5e1;border-radius:999px;padding:6px 12px;font:13px system-ui,sans-serif;box-shadow:0 2px 8px #0002;display:flex;gap:8px;align-items:center";
  document.body.appendChild(el);
  return u=>{el.innerHTML="";
    const b=(t,f)=>{const x=document.createElement("button");x.textContent=t;x.onclick=f;x.style.cssText="border:0;background:#0f766e;color:#fff;border-radius:999px;padding:4px 10px;cursor:pointer";return x};
    if(!u)el.append("Not signed in ",b("Sign in with your school account",login));
    else{el.append(u.displayName||u.email," ");
      const a=document.createElement("a");a.textContent=isTeacher(u)?"Dashboard":"My activities";a.href=new URL(isTeacher(u)?"teacher.html":"today.html",ROOT).href;el.append(a," ");
      if(isStudent(u)&&lsId)el.append(b("Change route",()=>requestLevel(u))," ");
      el.append(b("Sign out",logout))}};
}
let draw=()=>{};
const start=()=>{draw=bar();draw(user)};
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",start):start();

function loadCatalog(){return window.EL_CATALOG?Promise.resolve():new Promise(r=>{const s=document.createElement("script");s.src=new URL("shared/js/el-catalog.js",ROOT).href;s.onload=r;s.onerror=r;document.head.append(s)})}
await loadCatalog();
// Activities are matched by path, so pages with the same file name in different LSs keep separate results.
const byPath=(window.EL_CATALOG||[]).find(x=>x.path===relPath);if(byPath)actId=byPath.id;

onAuthStateChanged(auth,async u=>{
  user=u;draw(u);
  if(u&&isStudent(u)){const prev=localStorage.getItem("el_uid");if(prev!==u.uid){if(prev!==null&&prev!==u.uid)wipeLocal();origSet.call(localStorage,"el_uid",u.uid)}}
  if(u&&isStudent(u))try{await ensureGroup(u)}catch(e){console.warn("group",e)}
  try{await gate(u)}catch(e){console.warn("gate",e)}
  listeners.forEach(f=>f(u));
});

window.ELCloud={submitActivity,auth,db,login,logout,isTeacher,isStudent,lsStatus,lsInfo,onUser:f=>{listeners.push(f);if(user!==null)f(user)},get user(){return user}};
