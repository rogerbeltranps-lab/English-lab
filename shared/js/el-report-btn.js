// ⚠️ Report a problem on the pages that have no bottom bar (Roger, 19 Nov 2026: "I want to be able to report a problem everywhere,
// there are games where I can't do it and even other pages"). Pages with el-cloud.js already have ⚠️ Problem in their bottom bar; this
// small file gives the others the same window (el-report.js) and saves it the same way (problems/{id}, a screenshot in problemShots/{id})
// and starts the same instant task (wakeFixer): the class game boards (host, Code Breakers, Space rescue, results), the model videos,
// LS1 examples, rubrics and sample exams, the flashcards, the grammar presentations, Shadowing and the teacher's print pages.
// Load it with <script type="module" src=".../shared/js/el-report-btn.js"></script>; ?at=bl|br|tl|tr picks the corner (bottom right by default);
// ?before=<id> puts it in the page's own bar, just before that button, where nothing floats over the page (the grammar presentations:
// their bottom right corner is the big "next step" button);
// ?who=teacher shows it to the teacher only (the class game player, play.html, where students have their own ⚠️ in the game's top bar).
// Who sees it: a signed-in student (school account) or the teacher, never signed-out visitors. Reads: none until a report is sent; then
// the student's group, from el_who (el-cloud.js saves it on every other page) or one read of students/{uid}. Hidden when printing.
// Inside a frame (a worksheet in the print preview, the correction window over a learning path) it stays out: the page around it has its own.
// The class tab's shell (class.html, #el-shell) is not a page of its own, so the pages inside it keep the button.
import {CONFIG,DOMAINS,TEACHERS} from "./el-firebase.js";
import {report,wakeFixer} from "./el-report.js";

const inFrame=(()=>{try{return window.top!==window&&!(frameElement&&frameElement.id==="el-shell")}catch(e){return true}})();
const Q=new URL(import.meta.url).searchParams,AT=(Q.get("at")||"br").slice(0,2),ONLY_T=Q.get("who")==="teacher",BEFORE=Q.get("before");
const FB="https://www.gstatic.com/firebasejs/10.14.1/";
const isTeacher=u=>!!u&&TEACHERS.includes((u.email||"").toLowerCase());
const isStudent=u=>!!u&&DOMAINS.some(d=>(u.email||"").toLowerCase().endsWith("@"+d));
const who=()=>{try{return JSON.parse(localStorage.getItem("el_who")||"null")||{}}catch(e){return {}}};
const GROUPS=["2ESOA","2ESOB","4ESOA","4ESOB"];   // firestore.rules: group is one of these or null

if(!inFrame&&!document.getElementById("el-cloud-bar"))start().catch(e=>console.warn("report button",e));

async function start(){
  const [{initializeApp,getApps},A,S]=await Promise.all([import(FB+"firebase-app.js"),import(FB+"firebase-auth.js"),import(FB+"firebase-firestore.js")]);
  const app=getApps()[0]||initializeApp(CONFIG),auth=A.getAuth(app),db=S.getFirestore(app);
  let btn=null;
  A.onAuthStateChanged(auth,u=>{
    if(btn){btn.remove();btn=null}
    if(document.getElementById("el-cloud-bar"))return;   // el-cloud.js came after all: its bar has the button
    const tch=isTeacher(u);if(!tch&&(ONLY_T||!isStudent(u)))return;
    const w=who(),en=tch||!(w.uid===u.uid&&w.ca===true);
    btn=document.createElement("button");btn.type="button";btn.id="el-report-btn";
    btn.textContent="⚠️ "+(en?"Problem":"Problema");
    btn.title=tch?"Report a problem on this page: Beltran looks at it straight away (technical ones are fixed and you get an email)"
      :en?"Report a problem: something on the website does not work":"Avisa d'un problema: alguna cosa de la web no funciona";
    btn.onclick=()=>open(u,tch,en);
    css();place();
  });
  // a part of the page in full screen (the model videos' player, a game): the button goes inside it, or it would be hidden behind it
  const place=()=>{if(!btn)return;const f=document.fullscreenElement||document.webkitFullscreenElement,bf=BEFORE&&document.getElementById(BEFORE);
    if(bf&&!(f&&f!==document.documentElement&&!f.contains(bf))){btn.classList.add("inl");if(btn.nextSibling!==bf)bf.before(btn);return}
    btn.classList.remove("inl");const host=f&&f!==document.documentElement&&f.tagName!=="VIDEO"?f:document.body;if(btn.parentNode!==host)host.append(btn)};
  document.addEventListener("fullscreenchange",place);document.addEventListener("webkitfullscreenchange",place);

  async function group(u,tch){
    if(tch){try{const o=JSON.parse(sessionStorage.getItem("el_cm")||"null");return o&&GROUPS.includes(o.g)&&Date.now()<o.until?o.g:null}catch(e){return null}}
    const w=who();if(w.uid===u.uid&&GROUPS.includes(w.group))return w.group;
    try{const s=await S.getDoc(S.doc(db,"students",u.uid));const g=s.exists()&&s.data().group;return GROUPS.includes(g)?g:null}catch(e){return null}
  }
  function open(u,tch,en){
    report({en,teacher:tch,save:async o=>{
      const {shot,shotFrom}=o,ref=S.doc(S.collection(db,"problems")),b=S.writeBatch(db);delete o.shot;delete o.shotFrom;
      b.set(ref,Object.assign(o,{uid:u.uid,email:(u.email||"").toLowerCase(),name:u.displayName||"",group:await group(u,tch),
        ls:document.body.dataset.ls||null,activity:null,route:null,shot:shot?shotFrom:null,created:S.serverTimestamp()},tch?{teacher:true}:{}));
      if(shot)b.set(S.doc(db,"problemShots",ref.id),{uid:u.uid,img:shot,created:S.serverTimestamp()});
      return b.commit().then(r=>{wakeFixer(u);return r})}});
  }
}

function css(){
  if(document.getElementById("el-report-css"))return;
  const v=AT[0]==="t"?"top":"bottom",h=AT[1]==="l"?"left":"right",s=document.createElement("style");s.id="el-report-css";
  s.textContent="#el-report-btn{position:fixed;"+v+":max(10px,env(safe-area-inset-"+v+",0px));"+h+":max(10px,env(safe-area-inset-"+h+",0px));z-index:2147482900;"
    +"border:0;border-radius:999px;padding:6px 12px;background:#b45309;color:#fff;font:600 13px/1.2 system-ui,sans-serif;cursor:pointer;"
    +"box-shadow:0 2px 8px #0003;opacity:.92}#el-report-btn:hover,#el-report-btn:focus-visible{opacity:1}"
    +"#el-report-btn.inl{position:static;margin:0 8px 0 0;box-shadow:none;opacity:1;flex:none}"
    +"@media print{#el-report-btn{display:none!important}}";
  document.head.append(s);
}
