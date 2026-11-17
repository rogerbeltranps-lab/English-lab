// 🎓 Class mode / 🏁 End the class at the end of a class game (Roger, 17 Nov 2026: "after a game I should be able to go to class mode or
// end the class"). Both boards show the two buttons on the end screen: host.js (🎮 Quiz) and cb-host.js (🕵️ Code Breakers, 🚀 Space rescue).
// - 🎓 Class mode: class mode still on for the group in another tab → the students go back to its page (cmBack, as 🎓 Back to class mode)
//   and this tab closes. Class mode off (stopped, or the class time ran out during the game, as 4 ESO B on 17 Nov 2026: class mode ended at
//   10:30 and the game ran to 10:30:20) → it starts again in this tab (?elcm=, el-cloud.js cmTeacher) at the page it was on before the game
//   (live/{group}.go, as this board last read it), until the end of the class by the timetable (live/{group}.tt) or 70 minutes; the students
//   waiting on the end screen follow it (play.js cmFree: a newer go.at). Nothing known → the dashboard, with its own 🎓 Class mode.
//   (The class tab itself, sessionStorage el_cm, keeps its own 🎓 Back to class mode: the boards call that instead.)
// - 🏁 End the class: as ⏹ Stop class mode on the dashboard (go: null, fs: null: no class mode, no full screen) with the game off and
//   ce = now: the students' game screen says the class is over, with ← Back. This tab goes to the dashboard.
// Reads: none of its own (see() takes the live/{group} docs the board reads anyway). Writes: one, to live/{group}.
export function cmAfter({S,db}){
  const seen={};   // group → {go, tt}: the last class mode (even one that has ended) and the timetable this board saw in live/{group}
  const see=(g,x)=>{if(!g||!x)return;const o=seen[g]||(seen[g]={});if(x.go&&x.go.u)o.go=x.go;if(x.tt)o.tt=x.tt};
  const live=go=>!!(go&&go.cm&&go.u&&go.at&&go.lock&&Date.now()<(go.until||go.at+70*60e3));
  const isOn=g=>live(seen[g]&&seen[g].go);
  // the end of the class going on now by the group's timetable (as el-plan.js elClassEnd, from tt = {len, slots: ["Tue 9:30"], off}), else 70 minutes
  function until(g){const tt=seen[g]&&seen[g].tt,d=new Date(),now=d.getTime();
    if(tt&&Array.isArray(tt.slots)){const ymd=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
      const off=(tt.off||[]).some(o=>{const [a,b]=String(o).split("/");return a<=ymd&&ymd<=(b||a)});
      const dn=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()],m=d.getHours()*60+d.getMinutes(),len=+tt.len||60;
      if(!off)for(const sl of tt.slots){const x=String(sl).match(/^(\w{3}) (\d{1,2}):(\d\d)$/);if(!x||x[1]!==dn)continue;const s=+x[2]*60+ +x[3];
        if(m>=s-5&&m<s+len){const e=new Date(d);e.setHours(0,0,0,0);return e.getTime()+(s+len)*60e3}}}
    return now+70*60e3}
  const page=(u,p)=>{const x=new URL("../../"+u,location.href);if(p)x.hash=p;return x};
  function lastPage(g){const go=seen[g]&&seen[g].go;if(go&&go.u)return {u:go.u,p:go.p||""};
    try{const l=JSON.parse(sessionStorage.getItem("el_cm_last")||"null");if(l&&l.u)return {u:l.u,p:l.p||""}}catch(e){}return null}
  const dash=()=>new URL("../../teacher.html",location.href).href;
  // 🎓 Class mode (the game is already over and its results saved by the board)
  async function toClass(g){if(!g)return;const on=isOn(g),last=lastPage(g),w={cmBack:Date.now(),on:false,at:S.serverTimestamp()};
    await S.setDoc(S.doc(db,"live",g),w,{merge:true});
    if(on){const go=seen[g].go;try{window.close()}catch(e){}setTimeout(()=>{location.href=page(go.u,go.p).href},400);return}
    if(!last){location.href=dash();return}
    const u=page(last.u,last.p);u.searchParams.set("elcm",g+"."+until(g));location.href=u.href}
  // 🏁 End the class
  async function endClass(g){if(!g)return;const now=Date.now();
    await S.setDoc(S.doc(db,"live",g),{go:null,fs:null,on:false,cmBack:now,ce:now,at:S.serverTimestamp()},{merge:true});
    try{const o=JSON.parse(sessionStorage.getItem("el_cm")||"null");if(o&&o.g===g){sessionStorage.removeItem("el_cm");sessionStorage.removeItem("el_cm_last")}}catch(e){}
    location.href=dash()}
  const btns=(g,busy)=>`<button class="btn cm" data-do="cmclass" title="${isOn(g)?"Class mode is on: the students go back to its page":"Class mode starts again at the class page, the students follow it"}">${busy==="cm"?"Going back…":"🎓 Class mode"}</button> <button class="btn ghost" data-do="cmendclass" title="Stops class mode and full screen: the class is over">${busy==="end"?"Ending…":"🏁 End the class"}</button>`;
  return {see,isOn,toClass,endClass,btns,until}}
