// English Lab cloud: Google sign-in (school domain), per-LS progress sync, LS release gate, once-only activities.
import {initializeApp} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getFirestore,doc,getDoc,setDoc,serverTimestamp} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const CONFIG={apiKey:"AIzaSyCdO9ygUg8GzhfKsmqJKBg7-k_BDE3ZvKE",authDomain:"english-lab-ietm.firebaseapp.com",projectId:"english-lab-ietm",storageBucket:"english-lab-ietm.firebasestorage.app",messagingSenderId:"100211300058",appId:"1:100211300058:web:aff85bd00c3a877e7af7e3"};
const DOMAIN="ietramuntana.cat",TEACHERS=["roger.beltranps@gmail.com"],SKIP=/^(el_|firebase|debug)/;
const ROOT=new URL("../../",import.meta.url);

const app=initializeApp(CONFIG),auth=getAuth(app),db=getFirestore(app);
const origSet=Storage.prototype.setItem;
let user=null,timer=null,syncing=false,frozen=false;
const listeners=[];
const isTeacher=u=>!!u&&TEACHERS.includes((u.email||"").toLowerCase());
const isStudent=u=>!!u&&(u.email||"").toLowerCase().endsWith("@"+DOMAIN);

// Which activity / LS is this page?
const relPath=location.pathname.replace(/^.*?\/((2|4)eso\/.*)$/,"$1");
const m=relPath.match(/^((2|4)eso)\/([^/]+)\//);
const lsId=m?m[1]+"-"+m[3]:null;
const actId=m?m[1]+"/"+relPath.split("/").pop().replace(".html",""):null;
const resKey=a=>a.replace("/","__");

const snapshot=()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(!SKIP.test(k))o[k]=localStorage.getItem(k)}return o};
const progressRef=()=>doc(db,"students",user.uid,"progress",lsId);

async function lsStatus(id){try{const s=await getDoc(doc(db,"ls",id));return s.exists()?s.data().status:"hidden"}catch(e){return "hidden"}}

async function pull(){
  const s=await getDoc(progressRef()).catch(()=>null);
  if(s&&s.exists()){const cloud=s.data().data||{};syncing=true;
    for(const k in cloud){if(localStorage.getItem(k)!==cloud[k])origSet.call(localStorage,k,cloud[k])}
    syncing=false}
}
function push(){
  if(!user||!isStudent(user)||syncing||frozen||!lsId)return;
  clearTimeout(timer);
  timer=setTimeout(async()=>{
    try{
      await setDoc(doc(db,"students",user.uid),{name:user.displayName||"",email:user.email,updated:serverTimestamp()},{merge:true});
      await setDoc(progressRef(),{data:snapshot(),updated:serverTimestamp()},{merge:true});
      if(window.EL_CATALOG&&actId){const a=EL_CATALOG.find(x=>x.id===actId);
        if(a&&a.graded){let d=0;a.keys.forEach(k=>d+=elDone(localStorage.getItem(k)));
          await setDoc(doc(db,"students",user.uid,"results",resKey(actId)),resultPayload(d),{merge:true})}}
    }catch(e){console.warn("sync",e)}
  },1500);
}
Storage.prototype.setItem=function(k,v){if(frozen&&this===localStorage&&!SKIP.test(k))return;origSet.call(this,k,v);if(this===localStorage&&!SKIP.test(k))push()};

// Automatic scoring: result elements (id ends in "Result") that print "N / M ..." are tracked; best score per part is kept.
let parts={};
const tally=()=>{let sc=0,mx=0;for(const k in parts){sc+=parts[k].s;mx+=parts[k].m}return {score:sc,max:mx}};
function resultPayload(d){return Object.assign({ls:lsId,activity:actId,done:d,parts,updated:serverTimestamp()},tally())}
function watchScores(){
  const scan=()=>{let ch=false;document.querySelectorAll('[id$="Result"]').forEach(e=>{const t=(e.textContent||"").match(/([0-9]+) *[/] *([0-9]+)/);if(!t)return;const s=+t[1],mx=+t[2];if(!mx)return;
      const p=parts[e.id];if(!p||s>p.s||mx!==p.m&&s/mx>p.s/p.m){parts[e.id]={s,m:mx};ch=true}});
    if(ch)push()};
  new MutationObserver(scan).observe(document.body,{childList:true,subtree:true,characterData:true});
}
async function login(){
  const p=new GoogleAuthProvider();p.setCustomParameters({hd:DOMAIN,prompt:"select_account"});
  const r=await signInWithPopup(auth,p);
  if(!isStudent(r.user)&&!isTeacher(r.user)){await signOut(auth);alert("Cal entrar amb el compte @"+DOMAIN+".")}
}
// Shared school computers: never leak one student's local progress into another account.
const wipeLocal=()=>{const ks=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(!SKIP.test(k))ks.push(k)}ks.forEach(k=>localStorage.removeItem(k))};
const logout=async()=>{await signOut(auth);wipeLocal();origSet.call(localStorage,"el_uid","");location.reload()};

function banner(text,color,btn){
  const b=document.createElement("div");b.id="el-banner";
  b.style.cssText="position:sticky;top:0;z-index:9998;padding:8px 14px;font:14px system-ui,sans-serif;text-align:center;background:"+color+";color:#fff";
  b.textContent=text+" ";
  if(btn){const x=document.createElement("button");x.textContent=btn.t;x.onclick=btn.f;x.style.cssText="margin-left:8px;border:0;border-radius:6px;padding:3px 10px;cursor:pointer";b.append(x)}
  document.body.prepend(b);
}
function freeze(){
  frozen=true;
  const lock=()=>document.querySelectorAll("main input,main textarea,main select,main .opt,main [draggable]").forEach(e=>{e.disabled=true;e.style.pointerEvents="none"});
  lock();new MutationObserver(lock).observe(document.body,{childList:true,subtree:true});
}
function block(title,msg){
  const o=document.createElement("div");
  o.style.cssText="position:fixed;inset:0;z-index:10000;background:#f8fafc;display:grid;place-items:center;font:16px system-ui,sans-serif;text-align:center;padding:20px";
  o.innerHTML='<div><h1>'+title+'</h1><p>'+msg+'</p><p><a href="'+new URL("today.html",ROOT).href+'">Torna a «Avui»</a></p></div>';
  document.body.append(o);
}

async function gate(u){
  if(!lsId||!window.EL_CATALOG)return;
  if(isTeacher(u)){const st=await lsStatus(lsId);banner("Mode professor · LS "+lsId+": "+st,"#475569");return}
  if(!u||!isStudent(u)){block("Entra amb el compte del col·le","Per fer les activitats cal iniciar sessió amb el teu compte @"+DOMAIN+" (botó de baix a la dreta).");return}
  const st=await lsStatus(lsId);
  if(st==="hidden"){block("Aquesta LS encara no està disponible","El professor l'obrirà quan estigui preparada.");return}
  await pull();
  if(st==="closed"){freeze();banner("LS tancada: només pots consultar el que vas fer i el feedback.","#92400e");return}
  const a=EL_CATALOG.find(x=>x.id===actId);
  const rd=await getDoc(doc(db,"students",u.uid,"results",resKey(actId))).catch(()=>null);
  if(rd&&rd.exists()&&rd.data().parts)parts=rd.data().parts;
  if(a&&a.graded)watchScores();
  if(a&&a.mode==="once"){
    const r=await getDoc(doc(db,"students",u.uid,"results",resKey(actId))).catch(()=>null);
    if(r&&r.exists()&&r.data().locked){freeze();banner("Activitat entregada: ja no es pot modificar.","#92400e");return}
    banner("Aquesta activitat només es pot fer una vegada.","#1d4ed8",{t:"Entrega-la",f:async()=>{
      if(!confirm("Un cop entregada no la podràs tornar a fer ni modificar. Vols entregar-la?"))return;
      let d=0;a.keys.forEach(k=>d+=elDone(localStorage.getItem(k)));
      await setDoc(progressRef(),{data:snapshot(),updated:serverTimestamp()},{merge:true});
      await setDoc(doc(db,"students",u.uid,"results",resKey(actId)),Object.assign(resultPayload(d),{locked:true}),{merge:true});
      location.reload()}});
  }
}

function bar(){
  const el=document.createElement("div");el.id="el-cloud-bar";
  el.style.cssText="position:fixed;right:10px;bottom:10px;z-index:9999;background:#fff;border:1px solid #cbd5e1;border-radius:999px;padding:6px 12px;font:13px system-ui,sans-serif;box-shadow:0 2px 8px #0002;display:flex;gap:8px;align-items:center";
  document.body.appendChild(el);
  return u=>{el.innerHTML="";
    const b=(t,f)=>{const x=document.createElement("button");x.textContent=t;x.onclick=f;x.style.cssText="border:0;background:#0f766e;color:#fff;border-radius:999px;padding:4px 10px;cursor:pointer";return x};
    if(!u)el.append("Sense sessió ",b("Entra amb el compte del col·le",login));
    else{el.append(u.displayName||u.email," ");
      const a=document.createElement("a");a.textContent=isTeacher(u)?"Tauler":"Avui";a.href=new URL(isTeacher(u)?"teacher.html":"today.html",ROOT).href;el.append(a," ",b("Surt",logout))}};
}
let draw=()=>{};
const start=()=>{draw=bar();draw(user)};
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",start):start();

function loadCatalog(){return window.EL_CATALOG?Promise.resolve():new Promise(r=>{const s=document.createElement("script");s.src=new URL("shared/js/el-catalog.js",ROOT).href;s.onload=r;s.onerror=r;document.head.append(s)})}
await loadCatalog();

onAuthStateChanged(auth,async u=>{
  user=u;draw(u);
  if(u&&isStudent(u)){const prev=localStorage.getItem("el_uid");if(prev!==u.uid){if(prev!==null&&prev!==u.uid)wipeLocal();origSet.call(localStorage,"el_uid",u.uid)}}
  try{await gate(u)}catch(e){console.warn("gate",e)}
  listeners.forEach(f=>f(u));
});

window.ELCloud={auth,db,login,logout,isTeacher,isStudent,lsStatus,onUser:f=>{listeners.push(f);if(user!==null)f(user)},get user(){return user}};
