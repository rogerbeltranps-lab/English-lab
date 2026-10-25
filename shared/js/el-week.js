// Week helpers for the teaching plans in el-plan.js (exam day, `from` of each week row, `due` per activity), shared by the
// teacher dashboard (time plan) and the student board (this week, reminders). Dates are YYYY-MM-DD in local time.
// window.EL_TODAY (YYYY-MM-DD) replaces today in previews.
(function(){
  const key=x=>String(x).replace(/[^a-z0-9]/gi,"").toLowerCase();
  const ymd=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
  const day=s=>{const [y,m,d]=String(s).split("-").map(Number);return new Date(y,m-1,d)};
  const add=(s,n)=>{const d=day(s);d.setDate(d.getDate()+n);return ymd(d)};
  const today=()=>window.EL_TODAY||ymd(new Date());
  const span=p=>{const fs=((p&&p.rows)||[]).map(r=>r.from).filter(Boolean).sort();return fs.length?[fs[0],add(fs[fs.length-1],6)]:null};
  // column of a group (EL_GROUPS id or name) in a plan; -1 if the plan is not for that group
  const col=(p,gid)=>{const g=(window.EL_GROUPS||[]).find(x=>x.id===gid||x.name===gid);return g&&p&&p.groups?p.groups.findIndex(x=>key(x)===key(g.name)):-1};
  const due=(p,id,gi)=>p&&p.due&&p.due[id]&&p.due[id][gi]||null;
  const DAYS={en:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],ca:["dg.","dl.","dt.","dc.","dj.","dv.","ds."]};
  const MON={en:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],ca:["gen.","febr.","març","abr.","maig","juny","jul.","ag.","set.","oct.","nov.","des."]};
  const L=lang=>lang==="ca"?"ca":"en";
  window.ELWeek={
    today,add,span,col,due,
    days:(a,b)=>Math.round((day(b)-day(a))/864e5),
    // the week row containing day d (today by default), or -1
    row:(p,d)=>{d=d||today();return ((p&&p.rows)||[]).findIndex(r=>r.from&&r.from<=d&&d<=add(r.from,6))},
    // plans of a group: [{ls,p,gi}]
    plans:gid=>Object.entries(window.EL_PLAN||{}).map(([ls,p])=>({ls,p,gi:col(p,gid)})).filter(x=>x.gi>=0&&span(x.p)),
    // the plan a group follows now: the one running today, else the next one, else the last one
    now(gid){const t=today(),ps=this.plans(gid).sort((a,b)=>span(a.p)[0]<span(b.p)[0]?-1:1);
      return ps.find(x=>span(x.p)[0]<=t&&t<=span(x.p)[1])||ps.find(x=>span(x.p)[0]>t)||ps[ps.length-1]||null},
    exam:(p,gi)=>p&&p.exam&&p.exam[gi]||null,
    // activities due in week row i: [[activity id, date]] by date
    dueIn:(p,gi,i)=>{const r=p.rows[i];if(!r||!r.from)return [];const e=add(r.from,6);
      return Object.keys(p.due||{}).map(id=>[id,due(p,id,gi)]).filter(([,d])=>d&&r.from<=d&&d<=e).sort((a,b)=>a[1]<b[1]?-1:1)},
    // "Fri 20 Nov" · "dv. 20 nov."
    date:(s,lang)=>{const d=day(s),l=L(lang);return DAYS[l][d.getDay()]+" "+d.getDate()+" "+MON[l][d.getMonth()]},
    // "26–30 Oct" · "30 Nov–4 Dec" (Monday to Friday)
    week:(r,lang)=>{const a=day(r.from),b=day(add(r.from,4)),l=L(lang);
      return a.getMonth()===b.getMonth()?a.getDate()+"–"+b.getDate()+" "+MON[l][b.getMonth()]:a.getDate()+" "+MON[l][a.getMonth()]+"–"+b.getDate()+" "+MON[l][b.getMonth()]},
    // a session line of the plan with its weekday in Catalan ("Mon 26 · …" → "dl. 26 · …"); the rest stays as written
    line:(s,lang)=>L(lang)==="ca"?String(s).replace(/\b(Sun|Mon|Tue|Wed|Thu|Fri|Sat)(?= \d)/g,w=>DAYS.ca[DAYS.en.indexOf(w)]):String(s)
  };
})();
