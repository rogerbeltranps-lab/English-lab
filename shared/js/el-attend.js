// 🙋 Attendance (Roger, 9 Nov 2026: "when people are missing because they are ill they will always be out, so I only want to know if
// they left. At the beginning of the class I can check the people out and accept it: that means they didn't come (it's a way of taking
// attendance) … I want a register of the attendance from now on in my dashboard"). During a class, the class panels (the dashboard's
// #fsctl, teacher.html fsDraw, and the class tab's #el-fsfloat, el-cloud.js fsFloat) list who is not here (no beat in this class) with
// 🙋 Save attendance: one tap saves them as absent. A student saved as absent who connects later is turned into late by itself (the time
// they arrived). The dashboard's 🙋 Attendance page (teacher.html attPage) shows the register: one column per class, one row per student.
// One document per class: attendance/{group}_{yyyy-mm-dd}_{hhmm} = {group, day, start (ms), absent: {email: name}, late: {email: ms},
// n (students on the list), at}. Teacher only (firestore.rules). Traffic: the panels listen to this class's document (1 read, then only
// changes); a save or a late arrival is 1 write; the register reads the group's documents once each time it opens.
// api = {db, doc, setDoc, onSnapshot, deleteField}: the Firestore functions of the page that uses it (teacher.html F, el-cloud.js).
const p2=n=>String(n).padStart(2,"0");
export const ymd=ms=>{const d=new Date(ms);return d.getFullYear()+"-"+p2(d.getMonth()+1)+"-"+p2(d.getDate())};
export const hm=ms=>{const d=new Date(ms);return p2(d.getHours())+":"+p2(d.getMinutes())};
export const attId=(g,start)=>g+"_"+ymd(start)+"_"+hm(start).replace(":","");
const E=t=>String(t==null?"":t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
// the class going on now: by the timetable (its start), else (class mode or full screen outside the timetable) when it was switched on
export function attClass(gid,tt,fs,w){const c=window.elSlotNow&&elSlotNow(tt);if(c)return c.start;
  const at=fs&&fs.at&&(typeof fs.at==="number"?fs.at:fs.at.toMillis?fs.at.toMillis():0);
  const t=at||(w&&w.t0?w.t0+60e3:0);return t?Math.floor(t/60e3)*60e3:0}
// listens to one class's document; cb(rec or null). Returns the unsubscribe.
const L={key:"",stop:null,rec:undefined,subs:new Set()};
export function attWatch(api,gid,start,cb){const key=gid&&start?attId(gid,start):"";L.subs.add(cb);
  if(key!==L.key){if(L.stop)L.stop();L.stop=null;L.key=key;L.rec=undefined;OPEN.on=false;SEL.clear();
    if(key)L.stop=api.onSnapshot(api.doc(api.db,"attendance",key),s=>{L.rec=s.exists()?s.data():null;L.subs.forEach(f=>f(L.rec))},e=>console.warn("attendance",e))}
  return L.rec}
export const attRec=()=>L.rec;
// the panel's state: OPEN.on = the list of who is not here is being checked (before the first save, or ✎ Change); SEL = names unticked (here)
const OPEN={on:false},SEL=new Set();
const notHere=w=>(w.out||[]).filter(y=>y.why==="never");
// what the panel shows: {counts (text for the summary line), html (the box)}. small: the panel is made small (only the names that matter)
export function attView(w,rec,small){const nh=notHere(w);
  if(rec===undefined)return {n:nh.length,label:"not here",html:""};
  const abs=Object.entries(rec&&rec.absent||{}),late=Object.entries(rec&&rec.late||{});
  const bs="border:1px solid #1e293b;border-radius:999px;padding:3px 12px;cursor:pointer;font:700 13px system-ui,sans-serif;";
  if(rec&&!OPEN.on){
    return {n:abs.length,label:"absent",html:'<div style="margin-top:6px;color:#334155">🙋 <b>Attendance saved</b> '+hm(rec.start)+(abs.length?' · <b style="color:#b91c1c">Absent ('+abs.length+'):</b> '+abs.map(([,n])=>E(n)).sort().join(", "):" · everybody here")
      +(late.length?' · <b style="color:#c2410c">⏰ Late:</b> '+late.map(([e,t])=>E((rec.names||{})[e]||e.split("@")[0])+" "+hm(t)).join(", "):"")
      +(small?"":' <button type="button" data-att="edit" style="'+bs+'background:#fff;color:#1e293b;padding:1px 9px;font-size:12px">✎ Change</button>')+'</div>'};}
  // not saved yet (or being changed): everybody with no beat in this class, each one a chip to untick (here after all)
  const list=OPEN.on&&rec?[...new Map([...abs.map(([e,n])=>[e,{e,name:n}]),...nh.map(y=>[y.e,y])]).values()]:nh;
  const chips=list.map(y=>{const off=SEL.has(y.e);return '<button type="button" data-att="t" data-e="'+E(y.e)+'" title="'+(off?"Here after all: tap to mark absent":"Absent: tap if this student is here")+'" style="'+bs+'margin:2px 4px 2px 0;font-weight:600;'+(off?'background:#fff;color:#94a3b8;text-decoration:line-through;border-color:#cbd5e1':'background:#fef2f2;color:#b91c1c;border-color:#fca5a5')+'">'+(off?"":"✗ ")+E(y.name)+'</button>'}).join("");
  const nAbs=list.filter(y=>!SEL.has(y.e)).length;
  return {n:nh.length,label:"not here",html:'<div style="margin-top:8px;padding:8px 10px;border:2px dashed #94a3b8;border-radius:12px;background:#f8fafc;color:#1e293b">'
    +'<div style="font-weight:700">🙋 Attendance'+(list.length?' · not here ('+list.length+')':' · everybody is connected')+'</div>'
    +(list.length?'<div style="margin:4px 0;font-size:12px;color:#64748b">Tap a name if that student is here (no device, a broken Chromebook…).</div><div>'+chips+'</div>':"")
    +'<div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap"><button type="button" data-att="save" style="'+bs+'background:#1e293b;color:#fff">✓ Save attendance'+(nAbs?': '+nAbs+' absent':': everybody here')+'</button>'
    +(OPEN.on&&rec?'<button type="button" data-att="cancel" style="'+bs+'background:#fff;color:#1e293b">Cancel</button>':"")+'</div></div>'}}
// a click inside a panel: true if it was an attendance button (then the panel draws again)
export async function attClick(b,api,gid,start,w,roster){const k=b.dataset.att;if(!k)return false;
  if(k==="t"){const e=b.dataset.e;SEL.has(e)?SEL.delete(e):SEL.add(e);return true}
  if(k==="edit"){OPEN.on=true;SEL.clear();return true}
  if(k==="cancel"){OPEN.on=false;SEL.clear();return true}
  if(k==="save"&&gid&&start){const rec=L.rec,abs={},names={};
    const list=OPEN.on&&rec?[...Object.entries(rec.absent||{}).map(([e,name])=>({e,name})),...notHere(w)]:notHere(w);
    list.forEach(y=>{if(!SEL.has(y.e))abs[y.e]=y.name});
    (roster||[]).forEach(r=>{names[r.e]=r.name});
    b.disabled=true;
    try{await api.setDoc(api.doc(api.db,"attendance",attId(gid,start)),{group:gid,day:ymd(start),start,absent:abs,late:(rec&&rec.late)||{},names,n:(roster||[]).length||w.n||0,at:Date.now()});OPEN.on=false;SEL.clear()}
    catch(e){console.warn("attendance",e);b.disabled=false;alert("Attendance not saved: "+(e.code||e.message||e))}
    return true}
  return false}
// a student saved as absent who connects later is late (the time they arrived): written once by whichever teacher page sees it first
const done=new Set();
export function attLate(api,gid,start,w){const rec=L.rec;if(!rec||!rec.absent||!gid||!start)return;
  const seen=new Map([...(w.inn||[]),...(w.out||[]).filter(y=>y.why!=="never")].map(y=>[y.e,y]));
  Object.keys(rec.absent).forEach(e=>{const y=seen.get(e),k=attId(gid,start)+e;if(!y||done.has(k)||(rec.late||{})[e])return;done.add(k);
    const t=y.seen||Date.now();
    api.setDoc(api.doc(api.db,"attendance",attId(gid,start)),{absent:{[e]:api.deleteField()},late:{[e]:t}},{merge:true}).catch(x=>{done.delete(k);console.warn("attendance",x)})})}
