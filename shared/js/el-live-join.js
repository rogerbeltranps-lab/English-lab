// Join the class from the learning path (Roger, 25–26 Oct 2026). For a signed-in student, the link to a class presentation
// (a.deck-link) reads "Join the class" and opens the presentation in follow mode (?live={group}): the device waits for the teacher,
// then follows the slides and the student answers each question by tapping (see el-deck-points.js). While the teacher is presenting
// that deck to the student's group, the button pulses and shows the title. el-cloud.js loads this for signed-in students on pages
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
    links.forEach(l=>{const live=on&&String(x.deck||"").toLowerCase()===l.path.toLowerCase(),title=l.a.querySelector("strong");
      l.a.classList.toggle("el-live",live);
      l.a.href=`${l.path}?live=${encodeURIComponent(group)}&from=${encodeURIComponent(location.pathname)}`;
      l.a.innerHTML=`<span class="deck-link-icon" aria-hidden="true">📺</span><span><strong>${live?"Join the class now":"Join the class"}</strong><small>${esc(live?x.title||"":(title?title.textContent:""))} · Entra a la classe</small></span>`});
  };
  draw();
  const stop=onSnapshot(doc(db,"live",group),s=>{x=s.exists()?s.data():null;draw()},e=>console.warn("live",e));
  const t=setInterval(draw,60e3);
  return ()=>{stop();clearInterval(t);links.forEach(l=>{l.a.setAttribute("href",l.href);l.a.innerHTML=l.html;l.a.classList.remove("el-live")})};
}
