// Teacher's problem bell (Roger, 26 Oct 2026): "🔔" in the bottom bar of every page that loads el-cloud.js, only for the teacher.
// It shows how many problem reports from students (all groups) are still open and lists the latest ones; live on the dashboard, every 10 minutes elsewhere (bellWatch in el-cloud.js).
// bell({watch,dash,onDash}) returns the element; el-cloud.js puts it in the bar. watch(cb) calls cb(reports) on every change
// (problems/{id}, read only by the teacher); dash = the dashboard URL; onDash = this page is the dashboard (it opens the box itself).
const KIND={media:"🔊 Audio or video does not play",stuck:"⛔ Cannot go on",marking:"❌ Correct answer marked wrong",display:"🖥️ Page looks wrong",other:"❓ Something else"};
const MAX=8;
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const when=x=>x.created?(x.created.toDate?x.created.toDate():new Date(x.created)):null;
const ago=d=>{if(!d)return "";const m=Math.round((Date.now()-d)/60000);
  return m<1?"just now":m<60?m+" min ago":m<1440?Math.round(m/60)+" h ago":d.toLocaleDateString("en-GB",{day:"numeric",month:"short"})};
const groupName=g=>((window.EL_GROUPS||[]).find(x=>x.id===g)||{}).name||"";

export function bell({watch,dash,onDash}){
  const w=document.createElement("span");w.id="el-bell";w.style.cssText="position:relative;display:inline-flex";
  const b=document.createElement("button");b.type="button";
  b.style.cssText="border:1px solid #cbd5e1;background:#fff;color:#0f172a;border-radius:999px;padding:3px 9px;cursor:pointer;font:inherit;display:inline-flex;gap:4px;align-items:center";
  const p=document.createElement("div");p.hidden=true;p.setAttribute("role","dialog");p.setAttribute("aria-label","Problem reports");
  p.style.cssText="position:fixed;right:10px;bottom:58px;width:min(380px,calc(100vw - 20px));max-height:60vh;overflow:auto;background:#fff;color:#0f172a;border:1px solid #cbd5e1;border-radius:14px;box-shadow:0 10px 30px #0003;padding:10px 12px;z-index:10003;text-align:left";
  w.append(b,p);
  let open=[],first=true;
  const draw=()=>{
    const n=open.length;
    b.innerHTML='🔔'+(n?'<b style="background:#dc2626;color:#fff;border-radius:999px;min-width:18px;padding:0 5px;font-size:12px;line-height:18px;text-align:center">'+n+"</b>":"");
    b.title=n?n+" open problem report"+(n>1?"s":"")+" from students (all groups)":"No open problem reports";b.setAttribute("aria-label",b.title);
    const li=x=>{const where=[x.title||x.page,x.section].filter(Boolean).join(" › ");
      return '<li style="margin:0;padding:8px 0;border-top:1px solid #e2e8f0"><b>'+esc(KIND[x.kind]||x.kind)+"</b>"
        +(x.text?'<div style="margin:2px 0;color:#334155">'+esc(x.text.length>140?x.text.slice(0,140)+"…":x.text)+"</div>":"")
        +'<small style="color:#64748b">'+esc([x.name||x.email,groupName(x.group),ago(when(x))].filter(Boolean).join(" · "))+(where?"<br>📍 "+esc(where):"")+"</small></li>"};
    p.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><b>⚠️ Problem reports</b><small style="color:#64748b">all groups</small></div>'
      +(n?'<ul style="list-style:none;padding:0;margin:6px 0">'+open.slice(0,MAX).map(li).join("")+"</ul>"+(n>MAX?'<p style="margin:4px 0;color:#64748b">… and '+(n-MAX)+" more.</p>":"")
        :'<p style="color:#64748b;margin:8px 0">No open problem reports. 🎉</p>')
      +'<a href="'+dash+'#probs" style="display:inline-block;margin-top:4px;background:#0f766e;color:#fff;border-radius:999px;padding:5px 12px;text-decoration:none;font-weight:600">Open them in the dashboard →</a>';
    p.querySelector("a").onclick=e=>{if(!onDash)return;e.preventDefault();p.hidden=true;window.dispatchEvent(new CustomEvent("el-probs"))};
  };
  b.onclick=e=>{e.stopPropagation();p.hidden=!p.hidden};
  document.addEventListener("click",e=>{if(!p.hidden&&!w.contains(e.target))p.hidden=true});
  document.addEventListener("keydown",e=>{if(e.key==="Escape")p.hidden=true});
  watch(all=>{
    const before=new Set(open.map(x=>x.id));
    open=all.filter(x=>!x.fixed).sort((a,c)=>(when(c)||0)-(when(a)||0));
    draw();
    if(!first&&open.some(x=>!before.has(x.id))&&b.animate)b.animate([{transform:"rotate(0)"},{transform:"rotate(-18deg)"},{transform:"rotate(18deg)"},{transform:"rotate(0)"}],{duration:500,iterations:3});   // a new report came in
    first=false});
  draw();
  return w;
}
