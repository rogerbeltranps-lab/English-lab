// Buzzer for students (Roger, 25 Oct 2026), on the student board (today.html) and in a class presentation a student follows live
// (el-deck-points.js). The teacher opens a question in the presentation: buzz/{group} = {open, q, out:[team], winner:{team, at} or null}.
// The first press sets the winner for the student's team; firestore.rules allow it only while open, while nobody has won,
// for the student's own team (points/{email}.team) and not for a team that is out of this question.
// buzzer({S, db, group, team, names, t, el}): S = the Firestore module, team = the student's team id, names = {team id: name},
// t(ca, en) = the page's language, el = where the buzzer goes (hidden while the buzzers are closed). Returns a function that stops it.
// Sounds (shared/js/el-sound.js, when the page loads it): a press, and a fanfare on the devices of the team that was first; 🔊 mutes them.
const css=`.elbz{position:fixed;left:0;right:0;bottom:0;z-index:60;display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px max(16px,env(safe-area-inset-right,0px)) calc(12px + env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px));background:#0f172a;color:#fff;font:600 16px/1.35 system-ui,sans-serif;text-align:center;box-shadow:0 -6px 24px rgba(0,0,0,.25)}
.elbz[hidden]{display:none!important}
.elbz button.bz{width:min(170px,44vw);height:min(170px,44vw);border-radius:50%;border:0;background:#dc2626;color:#fff;font:800 26px/1.1 system-ui,sans-serif;box-shadow:0 8px 0 #991b1b,0 12px 28px rgba(0,0,0,.4);cursor:pointer;touch-action:manipulation}
.elbz button.bz:active{transform:translateY(6px);box-shadow:0 2px 0 #991b1b}
.elbz button.bz:disabled{opacity:.6;cursor:default}
.elbz .bzsnd{position:absolute;top:8px;right:max(10px,env(safe-area-inset-right,0px));width:40px;height:40px;border:0;border-radius:50%;background:rgba(255,255,255,.12);color:#fff;font-size:18px;cursor:pointer}
.elbz .bzmsg{font-size:19px;font-weight:800;padding-inline:44px}.elbz .bzmsg.win{color:#fde047}.elbz small{color:#cbd5e1;font-weight:500}`;
export function buzzer({S,db,group,team,names,t,el}){
  if(!document.getElementById("el-buzz-css")){const st=document.createElement("style");st.id="el-buzz-css";st.textContent=css;document.head.append(st)}
  el.classList.add("elbz");el.hidden=true;
  const ref=S.doc(db,"buzz",group),name=id=>String(names[id]||id).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  let z=null,busy=false,mine=null,first=true;   // mine: the round (q) this device won
  const snd=n=>window.ELSound&&ELSound.play(n),sndBtn=()=>window.ELSound?`<button type="button" class="bzsnd" aria-label="${ELSound.on()?"Sound on":"Sound off"}" title="${ELSound.on()?"Sound on":"Sound off"}">${ELSound.on()?"🔊":"🔇"}</button>`:"";
  const draw=()=>{
    el.hidden=!(z&&z.open);if(el.hidden)return;
    const bar=document.getElementById("el-cloud-bar");   // the site's bottom bar (sign out) stays on top: keep the text above it
    el.style.paddingBottom=bar&&bar.offsetHeight?`calc(${bar.offsetHeight+18}px + env(safe-area-inset-bottom,0px))`:"";
    const w=z.winner&&z.winner.team,out=(z.out||[]).includes(team);
    el.innerHTML=w?(w===team?`<p class="bzmsg win">🎉 ${mine===z.q?t("Has estat el primer!","You were first!"):t("El teu equip ha estat el primer!","Your team was first!")} ${name(team)}, ${t("responeu!","answer!")}</p>`
        :`<p class="bzmsg">⏱ ${t(`${name(w)} ha estat el primer.`,`${name(w)} was first.`)}</p><small>${t("Escolta la resposta.","Listen to their answer.")}</small>`)
      :out?`<p class="bzmsg">${t("El teu equip ja ha respost aquesta pregunta.","Your team has already answered this question.")}</p><small>${t("Espera la següent.","Wait for the next one.")}</small>`
      :`<button type="button" class="bz"${busy?" disabled":""}>🔔 ${t("PREM!","BUZZ!")}</button><small>${t("El teu equip:","Your team:")} ${name(team)} · ${t("el primer equip a prémer respon","the first team to buzz answers")}</small>`;
    el.insertAdjacentHTML("beforeend",sndBtn());
  };
  const onClick=async e=>{
    if(e.target.closest(".bzsnd")){ELSound.set(!ELSound.on());draw();return}
    if(!e.target.closest("button.bz")||busy)return;busy=true;snd("press");draw();
    const q=z&&z.q;
    try{const won=await S.runTransaction(db,async tx=>{const s=await tx.get(ref),d=s.exists()?s.data():{};
        if(!d.open||d.winner||d.q!==q||(d.out||[]).includes(team))return false;
        tx.update(ref,{winner:{team,at:S.serverTimestamp()}});return true});
      if(won){mine=q;try{navigator.vibrate&&navigator.vibrate(150)}catch(x){}}
    }catch(x){console.warn("buzz",x)}
    busy=false;draw();
  };
  el.addEventListener("click",onClick);
  const stop=S.onSnapshot(ref,s=>{const was=z&&z.winner;z=s.exists()?s.data():null;
    if(!first&&z&&z.open&&z.winner&&!was&&z.winner.team===team)snd("win");   // my team was first
    first=false;draw()},e=>console.warn("buzz",e));
  return ()=>{stop();el.removeEventListener("click",onClick);el.hidden=true};
}
