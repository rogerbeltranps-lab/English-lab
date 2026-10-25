// Join the class from the learning path (Roger, 25 Oct 2026). While the teacher presents, for the student's class group, a class
// presentation that this page links to (a.deck-link), the link becomes a big "Join the class" button: it opens the presentation in
// follow mode (?live={group}), where the student answers each question on their device (see el-deck-points.js). The presentation
// counts as over 10 minutes after the teacher's screen last said it was on. el-cloud.js loads this for signed-in students on pages
// with a deck link.
import {doc,onSnapshot} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
const css=`.deck-link.el-live{background:#0f766e!important;color:#fff!important;border-color:#0f766e!important;min-height:56px;box-shadow:0 0 0 0 rgba(15,118,110,.55);animation:elJoin 1.8s ease-out infinite}
.deck-link.el-live small{color:#ccfbf1!important}
@keyframes elJoin{0%{box-shadow:0 0 0 0 rgba(15,118,110,.55)}80%,100%{box-shadow:0 0 0 14px rgba(15,118,110,0)}}
@media (prefers-reduced-motion: reduce){.deck-link.el-live{animation:none}}`;
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
export function liveJoin({db,group}){
  const links=[...document.querySelectorAll("a.deck-link")].map(a=>({a,href:a.getAttribute("href"),html:a.innerHTML,path:new URL(a.href,location.href).pathname}));
  if(!links.length||!group)return ()=>{};
  if(!document.getElementById("el-live-join-css")){const st=document.createElement("style");st.id="el-live-join-css";st.textContent=css;document.head.append(st)}
  let x=null;
  const draw=()=>{
    const ms=x&&x.at&&(x.at.toMillis?x.at.toMillis():+x.at),on=!!(x&&x.on&&ms&&Date.now()-ms<10*60e3);
    links.forEach(l=>{const live=on&&x.deck===l.path;l.a.classList.toggle("el-live",live);
      if(live){l.a.href=`${x.deck}?live=${encodeURIComponent(group)}&from=${encodeURIComponent(location.pathname)}`;
        l.a.innerHTML=`<span class="deck-link-icon" aria-hidden="true">📺</span><span><strong>Join the class now</strong><small>${esc(x.title||"")} · Entra a la classe</small></span>`}
      else if(l.a.getAttribute("href")!==l.href){l.a.setAttribute("href",l.href);l.a.innerHTML=l.html}});
  };
  const stop=onSnapshot(doc(db,"live",group),s=>{x=s.exists()?s.data():null;draw()},e=>console.warn("live",e));
  const t=setInterval(draw,60e3);
  return ()=>{stop();clearInterval(t)};
}
