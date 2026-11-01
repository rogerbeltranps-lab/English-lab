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
    // added: homework the teacher set from the dashboard ("🏠 Set as homework" on a session line; ls/{id}.homework[group] =
    // {id: {text, by, set, msg}}; msg = the teacher's message with the instructions, shown to students under the item), listed with kind "hw" and extra:true (they are not in the calendar feed, which is a static file).
    tasks(p,gi,added){const out=[];if(!p||gi<0)return out;
      Object.entries(added||{}).forEach(([id,h])=>{if(h&&h.text&&h.by)out.push({kind:"hw",date:h.by,set:h.set||null,text:h.text,extra:true,id,msg:h.msg||null})});
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
    upcoming(p,gi,from,days,added){from=from||today();const to=add(from,days==null?14:days);return this.tasks(p,gi,added).filter(x=>x.kind!=="exam"&&x.date>=from&&x.date<=to)},
    // calendar feed of a group (tools/gen-calendar.js writes calendar/<group id>.ics from this file): the .ics link and the link
    // that subscribes a Google Calendar to it once, so every later homework appears by itself
    calendar(gid,root){const ics=new URL("calendar/"+String(gid).toLowerCase()+".ics",root||location.href).href;
      return {ics,google:"https://calendar.google.com/calendar/r?cid="+encodeURIComponent(ics.replace(/^https?:/,"webcal:"))}},
    // a Google Calendar link that adds one homework (for the ones the teacher set from the dashboard)
    gcalLink(x,lang){const ca=L(lang)==="ca",d=s=>s.replace(/-/g,""),start=x.set&&x.set<x.date?x.set:add(x.date,-1);
      return "https://calendar.google.com/calendar/render?action=TEMPLATE&text="+encodeURIComponent((ca?"🏠 Deures d'anglès: ":"🏠 English homework: ")+x.text)
        +"&dates="+d(start)+"/"+d(x.date)+"&details="+encodeURIComponent((ca?"Per a la classe del ":"For the class on ")+this.date(x.date,lang))},
    // one homework or self-study item as text for students ("by Tue 10 Nov · …", Catalan for Starter and Base)
    taskText(x,lang){const ca=L(lang)==="ca";
      return x.kind==="self"?(ca?"Classe pel teu compte":"Class on your own")+" ("+this.date(x.date,lang)+") · "+x.text+" · "+(ca?"treballa amb auriculars i acaba-ho a casa":"work with headphones and finish it at home")
        :(ca?"Per al ":"By ")+this.date(x.date,lang)+" · "+x.text},
    // Moved sessions (Roger, 1 Nov 2026: "be able to change the day of sth you arranged for a certain day"): the teacher moves a session
    // line to another day on the dashboard; ls/{ls}.planEdits[group][original line] = {to: "YYYY-MM-DD" or null, tabs: ["activity#panel"…] or null}
    // (tabs = the tabs of that session, chosen by the teacher). applyEdits rewrites EL_PLAN[ls] in place from its original rows, so every page
    // (dashboard, student board, My week, emails) shows the line on its new day ("Wed 4 · …" → "Fri 6 · …", in the week of that day; a week
    // with no row gets one), and the due days of the activities (`due`, `stepDue`) that fell on the old day of a class move with it.
    // p._moved[gi][new line] = {orig, from (old day)}; p._tabs[gi][original line] = the chosen tabs. Safe to call again with new edits.
    applyEdits(ls,edits){const p=(window.EL_PLAN||{})[ls];if(!p||!p.rows)return null;const cp=o=>o==null?o:JSON.parse(JSON.stringify(o));
      if(!p._base)p._base=cp({rows:p.rows,due:p.due||null,stepDue:p.stepDue||null});
      const b=cp(p._base);p.rows=b.rows;if(b.due)p.due=b.due;if(b.stepDue)p.stepDue=b.stepDue;p._moved={};p._tabs={};
      const get=(r,gi)=>String((r.g?r.g[gi]:r.what)||"").split("\n").filter(Boolean),set=(r,gi,ls)=>{if(r.g)r.g[gi]=ls.join("\n");else r.what=ls.join("\n")};
      Object.entries(edits||{}).forEach(([gid,m])=>{const gi=col(p,gid);if(gi<0||!m)return;const mv=p._moved[gi]={},tb=p._tabs[gi]={};
        Object.entries(m).forEach(([orig,e])=>{if(!e)return;if(e.tabs&&e.tabs.length)tb[orig]=e.tabs;if(!e.to||!/^\d{4}-\d\d-\d\d$/.test(e.to))return;
          const ri=p.rows.findIndex(r=>r.from&&get(r,gi).includes(orig));if(ri<0)return;const old=this.lineDay(p.rows[ri].from,orig);if(!old||old===e.to)return;
          const hw=/^Homework by /.test(orig),d=day(e.to),nl=orig.replace(/^(Homework by )?\w{3} \d{1,2}\b/,(_,h)=>(h||"")+DAYS.en[d.getDay()]+" "+d.getDate());
          set(p.rows[ri],gi,get(p.rows[ri],gi).filter(l=>l!==orig));
          let ti=p.rows.findIndex(r=>r.from&&r.from<=e.to&&e.to<=add(r.from,6));
          if(ti<0){const mon=add(e.to,-((d.getDay()+6)%7)),prev=[...p.rows].reverse().find(r=>r.from&&r.from<mon)||p.rows[0],nr={term:prev.term,from:mon,when:this.week({from:mon}),added:true};
            if(p.rows[0].g)nr.g=p.rows[0].g.map(()=>"");else nr.what="";ti=p.rows.findIndex(r=>r.from&&r.from>mon);if(ti<0)ti=p.rows.length;p.rows.splice(ti,0,nr)}
          const tr=p.rows[ti],ls=get(tr,gi),at=ls.findIndex(l=>{const x=this.lineDay(tr.from,l);return x&&x>e.to});ls.splice(at<0?ls.length:at,0,nl);set(tr,gi,ls);
          mv[nl]={orig,from:old};
          if(!hw){Object.values(p.due||{}).forEach(a=>{if(a&&a[gi]===old)a[gi]=e.to});Object.values(p.stepDue||{}).forEach(o=>Object.values(o||{}).forEach(a=>{if(a&&a[gi]===old)a[gi]=e.to}))}})});
      return p},
    // the day of a session line ("Tue 27 · …" or "Homework by Mon 9 · …") counted from the Monday of its week row, or null
    lineDay(from,l){const m=/^(?:Homework by )?(Sun|Mon|Tue|Wed|Thu|Fri|Sat) (\d{1,2})\b/.exec(String(l));if(!m||!from)return null;
      for(let k=0;k<21;k++){const s=add(from,k),d=day(s);if(d.getDate()===+m[2]&&DAYS.en[d.getDay()]===m[1])return s}return null},
    // "Fri 20 Nov" · "dv. 20 nov."
    date:(s,lang)=>{const d=day(s),l=L(lang);return DAYS[l][d.getDay()]+" "+d.getDate()+" "+MON[l][d.getMonth()]},
    // "26–30 Oct" · "30 Nov–4 Dec" (Monday to Friday)
    week:(r,lang)=>{const a=day(r.from),b=day(add(r.from,4)),l=L(lang);
      return a.getMonth()===b.getMonth()?a.getDate()+"–"+b.getDate()+" "+MON[l][b.getMonth()]:a.getDate()+" "+MON[l][a.getMonth()]+"–"+b.getDate()+" "+MON[l][b.getMonth()]},
    // a session line of the plan with its weekday in Catalan ("Mon 26 · …" → "dl. 26 · …"); the rest stays as written
    line:(s,lang)=>L(lang)==="ca"?String(s).replace(/\b(Sun|Mon|Tue|Wed|Thu|Fri|Sat)(?= \d)/g,w=>DAYS.ca[DAYS.en.indexOf(w)]):String(s)
  };
})();
