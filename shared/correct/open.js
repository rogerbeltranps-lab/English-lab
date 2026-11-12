// ✅ Correct together over the class tab (Roger, 12 Nov 2026): shared/correct/index.html in a full-window frame on top of the page,
// so the class tab stays on its tab underneath and the students stay where they are (nothing is sent to them). ✕ Close in the frame
// (or Esc) takes it away. Used by the class mode bar (el-cloud.js cmTeacher) and 📋 Today (el-cm-agenda.js).
// readingOf(path, tab): {ls, lp} when the page is an LS2-on learning path and the tab a Reading or a Reading log, else null.
export function readingOf(path,tab){const m=/^([24]eso\/(?!my-real-routine\/)[a-z0-9-]+)\/([a-z0-9-]+)\.html$/.exec(path||"");
  return m&&(tab==="read"||tab==="log")?{ls:m[1],lp:m[2]}:null}
let fr=null;
export function openCorrect(root,{ls,lp,tab,g}){
  if(fr)fr.remove();
  fr=document.createElement("iframe");fr.id="el-correct";fr.title="Correct together";
  fr.src=new URL("shared/correct/index.html?ls="+encodeURIComponent(ls)+"&lp="+encodeURIComponent(lp)+"&tab="+encodeURIComponent(tab||"read")+(g?"&g="+encodeURIComponent(g):"")+"&embed=1",root).href;
  fr.style.cssText="position:fixed;inset:0;width:100vw;height:100vh;border:0;z-index:2147483000;background:#0f2a3a";
  fr.onload=()=>{try{fr.contentWindow.focus()}catch(e){}};document.body.append(fr);
  const off=e=>{if(e.source===fr.contentWindow&&e.data&&e.data.elCorrect==="close"){fr.remove();fr=null;window.removeEventListener("message",off)}};
  window.addEventListener("message",off);
}
