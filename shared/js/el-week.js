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
    // Homework and self-study (Roger, 31 Oct 2026: "they should see their homework … if I miss a class, they should also know what
    // they have to do"): from the session lines of a group, [{kind, date, set, text}] by date. kind "hw" = a line
    // "Homework by Tue 10 · …" (date = that day, set = the class just before it), "self" = a class line marked "· self-study"
    // (the teacher is away), "exam" = the exam day. The student board, My week, the dashboard and the calendar feeds use it.
    tasks(p,gi){const out=[];if(!p||gi<0)return out;
      const at=(from,dn,n)=>{for(let k=0;k<21;k++){const s=add(from,k),d=day(s);if(d.getDate()===n&&DAYS.en[d.getDay()]===dn)return s}return null};
      let last=null;
      (p.rows||[]).forEach(r=>{if(!r.from)return;String((r.g?r.g[gi]:r.what)||"").split("\n").forEach(raw=>{const ln=raw.trim();
        let m=ln.match(/^Homework by (Sun|Mon|Tue|Wed|Thu|Fri|Sat) (\d{1,2}) · (.+)$/);
        if(m){const d=at(r.from,m[1],+m[2]);if(d)out.push({kind:"hw",date:d,set:last,text:m[3]});return}
        m=ln.match(/^(Sun|Mon|Tue|Wed|Thu|Fri|Sat) (\d{1,2}) · (.+)$/);if(!m)return;
        const d=at(r.from,m[1],+m[2]);if(!d)return;last=d;
        if(/· self-study\b/.test(m[3]))out.push({kind:"self",date:d,set:null,text:m[3].replace(/\s*· self-study\b/,"").trim()})})});
      const ex=p.exam&&p.exam[gi];if(ex)out.push({kind:"exam",date:ex,set:null,text:"Exam"});
      return out.sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0)},
    // homework and self-study classes still ahead (date >= from, by default today), within `days` days
    upcoming(p,gi,from,days){from=from||today();const to=add(from,days==null?14:days);return this.tasks(p,gi).filter(x=>x.kind!=="exam"&&x.date>=from&&x.date<=to)},
    // calendar feed of a group (tools/gen-calendar.js writes calendar/<group id>.ics from this file): the .ics link and the link
    // that subscribes a Google Calendar to it once, so every later homework appears by itself
    calendar(gid,root){const ics=new URL("calendar/"+String(gid).toLowerCase()+".ics",root||location.href).href;
      return {ics,google:"https://calendar.google.com/calendar/r?cid="+encodeURIComponent(ics.replace(/^https?:/,"webcal:"))}},
    // one homework or self-study item as text for students ("by Tue 10 Nov · …", Catalan for Starter and Base)
    taskText(x,lang){const ca=L(lang)==="ca";
      return x.kind==="self"?(ca?"Classe pel teu compte":"Class on your own")+" ("+this.date(x.date,lang)+") · "+x.text+" · "+(ca?"treballa amb auriculars i acaba-ho a casa":"work with headphones and finish it at home")
        :(ca?"Per al ":"By ")+this.date(x.date,lang)+" · "+x.text},
    // "Fri 20 Nov" · "dv. 20 nov."
    date:(s,lang)=>{const d=day(s),l=L(lang);return DAYS[l][d.getDay()]+" "+d.getDate()+" "+MON[l][d.getMonth()]},
    // "26–30 Oct" · "30 Nov–4 Dec" (Monday to Friday)
    week:(r,lang)=>{const a=day(r.from),b=day(add(r.from,4)),l=L(lang);
      return a.getMonth()===b.getMonth()?a.getDate()+"–"+b.getDate()+" "+MON[l][b.getMonth()]:a.getDate()+" "+MON[l][a.getMonth()]+"–"+b.getDate()+" "+MON[l][b.getMonth()]},
    // a session line of the plan with its weekday in Catalan ("Mon 26 · …" → "dl. 26 · …"); the rest stays as written
    line:(s,lang)=>L(lang)==="ca"?String(s).replace(/\b(Sun|Mon|Tue|Wed|Thu|Fri|Sat)(?= \d)/g,w=>DAYS.ca[DAYS.en.indexOf(w)]):String(s)
  };
})();
