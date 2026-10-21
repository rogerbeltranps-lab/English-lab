// English Lab cloud sync: Google sign-in (school domain) + localStorage progress mirrored to Firestore.
import {initializeApp} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getFirestore,doc,getDoc,setDoc,serverTimestamp} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const CONFIG={apiKey:"AIzaSyCdO9ygUg8GzhfKsmqJKBg7-k_BDE3ZvKE",authDomain:"english-lab-ietm.firebaseapp.com",projectId:"english-lab-ietm",storageBucket:"english-lab-ietm.firebasestorage.app",messagingSenderId:"100211300058",appId:"1:100211300058:web:aff85bd00c3a877e7af7e3"};
const DOMAIN="ietramuntana.cat";
const TEACHERS=["roger.beltranps@gmail.com"];
const SKIP=/^(el_|firebase|debug)/;

const app=initializeApp(CONFIG),auth=getAuth(app),db=getFirestore(app);
const origSet=Storage.prototype.setItem;
let user=null,timer=null,syncing=false;
const listeners=[];

const isTeacher=u=>!!u&&TEACHERS.includes((u.email||"").toLowerCase());
const isStudent=u=>!!u&&(u.email||"").toLowerCase().endsWith("@"+DOMAIN);
const snapshot=()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(!SKIP.test(k))o[k]=localStorage.getItem(k)}return o};

async function pull(){
  const s=await getDoc(doc(db,"students",user.uid));
  if(s.exists()){const cloud=s.data().data||{};syncing=true;
    for(const k in cloud){if(localStorage.getItem(k)!==cloud[k])origSet.call(localStorage,k,cloud[k])}
    syncing=false}
  push();
}
function push(){
  if(!user||!isStudent(user)||syncing)return;
  clearTimeout(timer);
  timer=setTimeout(()=>setDoc(doc(db,"students",user.uid),{name:user.displayName||"",email:user.email,data:snapshot(),updated:serverTimestamp()},{merge:true}).catch(e=>console.warn("sync",e)),1500);
}
Storage.prototype.setItem=function(k,v){origSet.call(this,k,v);if(this===localStorage&&!SKIP.test(k))push()};

async function login(){
  const p=new GoogleAuthProvider();p.setCustomParameters({hd:DOMAIN,prompt:"select_account"});
  const r=await signInWithPopup(auth,p);
  if(!isStudent(r.user)&&!isTeacher(r.user)){await signOut(auth);alert("Cal entrar amb el compte @"+DOMAIN+".")}
}
const logout=()=>signOut(auth);

function bar(){
  const el=document.createElement("div");el.id="el-cloud-bar";
  el.style.cssText="position:fixed;right:10px;bottom:10px;z-index:9999;background:#fff;border:1px solid #cbd5e1;border-radius:999px;padding:6px 12px;font:13px system-ui,sans-serif;box-shadow:0 2px 8px #0002;display:flex;gap:8px;align-items:center";
  document.body.appendChild(el);
  return u=>{el.innerHTML="";
    const b=(t,f)=>{const x=document.createElement("button");x.textContent=t;x.onclick=f;x.style.cssText="border:0;background:#0f766e;color:#fff;border-radius:999px;padding:4px 10px;cursor:pointer";return x};
    if(!u)el.append("Progrés només en aquest navegador ",b("Entra amb el compte del col·le",login));
    else{el.append(u.displayName||u.email," ");
      const a=document.createElement("a");a.textContent=isTeacher(u)?"Tauler":"Avui";a.href=new URL(isTeacher(u)?"teacher.html":"today.html",new URL("../../",import.meta.url)).href;el.append(a," ",b("Surt",logout))}};
}
let draw=()=>{};
const start=()=>{draw=bar();draw(user)};
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",start):start();

onAuthStateChanged(auth,async u=>{
  user=u;draw(u);
  if(u&&isStudent(u))await pull();
  listeners.forEach(f=>f(u));
});

window.ELCloud={auth,db,login,logout,isTeacher,isStudent,onUser:f=>{listeners.push(f);if(user!==null)f(user)},get user(){return user}};
