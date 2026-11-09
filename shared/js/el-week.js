// Week helpers for the teaching plans in el-plan.js (exam day, `from` of each week row, `due` per activity), shared by the
// teacher dashboard (time plan) and the student board (this week, reminders). Dates are YYYY-MM-DD in local time.
// window.EL_TODAY (YYYY-MM-DD) replaces today in previews; window.EL_NOW ("YYYY-MM-DDTHH:MM") replaces the date and time.
(function(){
  const key=x=>String(x).replace(/[^a-z0-9]/gi,"").toLowerCase();
  const ymd=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
  const day=s=>{const [y,m,d]=String(s).split("-").map(Number);return new Date(y,m-1,d)};
  const add=(s,n)=>{const d=day(s);d.setDate(d.getDate()+n);return ymd(d)};
  const clock=()=>window.EL_NOW?new Date(window.EL_NOW):new Date();
  const today=()=>window.EL_TODAY||ymd(clock());
  const span=p=>{const fs=((p&&p.rows)||[]).map(r=>r.from).filter(Boolean).sort();return fs.length?[fs[0],add(fs[fs.length-1],6)]:null};
  // column of a group (EL_GROUPS id or name) in a plan; -1 if the plan is not for that group
  const col=(p,gid)=>{const g=(window.EL_GROUPS||[]).find(x=>x.id===gid||x.name===gid);return g&&p&&p.groups?p.groups.findIndex(x=>key(x)===key(g.name)):-1};
  // an optional activity (EL_CATALOG optional: the sample exam) has no due day for students or the bonus: never late, never missing, never
  // "to do by" (Roger, 9 Nov 2026: "I don't want [it] to appear as homework … not counting it as homework, to do in class, not done")
  const opt=id=>(window.EL_CATALOG||[]).some(a=>a.id===id&&a.optional);
  const due=(p,id,gi)=>p&&p.due&&p.due[id]&&p.due[id][gi]&&!opt(id)?p.due[id][gi]:null;
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
    // The class going on now by the timetable (EL_TIMETABLE in el-plan.js; Roger, 2 Nov 2026: "when I open the dashboard, the group
    // I have at that hour"): {gid, start "12:00", end "13:00", key} from 5 minutes before it starts until 5 minutes before it ends
    // (so it never overlaps the next one), or null (no class, weekend, a day in `off`). at: a Date, by default now (or EL_NOW).
    classAt(at){const T=window.EL_TIMETABLE;if(!T||!T.groups)return null;at=at||clock();const d=ymd(at);
      if((T.off||[]).some(o=>Array.isArray(o)?o[0]<=d&&d<=o[1]:o===d))return null;
      const dn=DAYS.en[at.getDay()],m=at.getHours()*60+at.getMinutes(),hm=x=>Math.floor(x/60)+":"+String(x%60).padStart(2,"0");
      for(const [gid,slots] of Object.entries(T.groups))for(const sl of slots){const x=String(sl).match(/^(\w{3}) (\d{1,2}):(\d\d)$/);if(!x||x[1]!==dn)continue;
        const s=+x[2]*60+ +x[3],len=+T.len||60;if(m>=s-5&&m<s+len-5)return {gid,start:hm(s),end:hm(s+len),key:d+" "+gid+" "+hm(s)}}
      return null},
    // activities due in week row i: [[activity id, date]] by date
    dueIn:(p,gi,i)=>{const r=p.rows[i];if(!r||!r.from)return [];const e=add(r.from,6);
      return Object.keys(p.due||{}).map(id=>[id,due(p,id,gi)]).filter(([,d])=>d&&r.from<=d&&d<=e).sort((a,b)=>a[1]<b[1]?-1:1)},
    // Homework and self-study (Roger, 31 Oct 2026: "they should see their homework … if I miss a class, they should also know what
    // they have to do"): from the session lines of a group, [{kind, date, set, text}] by date. kind "hw" = a line
    // "Homework by Tue 10 · …" (date = that day, set = the class just before it), "self" = a class line marked "· self-study"
    // (the teacher is away), "exam" = the exam day. The student board, My week, the dashboard and the calendar feeds use it.
    // added: homework the teacher set from the dashboard ("🏠 Set as homework" on a session line; ls/{id}.homework[group] =
    // {id: {text, by, set, msg, tabs}}; msg = the teacher's message with the instructions, shown to students under the item; tabs = {activity id: [panel ids]}, what it covers, elHwTargets), listed with kind "hw" and extra:true (they are not in the calendar feed, which is a static file).
    tasks(p,gi,added){const out=[];if(!p||gi<0)return out;
      Object.entries(added||{}).forEach(([id,h])=>{if(h&&h.text&&h.by)out.push({kind:"hw",date:h.by,set:h.set||null,text:h.text,extra:true,id,msg:h.msg||null,tabs:h.tabs||null})});
      const at=(from,dn,n)=>{for(let k=0;k<21;k++){const s=add(from,k),d=day(s);if(d.getDate()===n&&DAYS.en[d.getDay()]===dn)return s}return null};
      let last=null;
      (p.rows||[]).forEach(r=>{if(!r.from)return;String((r.g?r.g[gi]:r.what)||"").split("\n").forEach(raw=>{const ln=raw.trim();
        let m=ln.match(/^Homework by (Sun|Mon|Tue|Wed|Thu|Fri|Sat) (\d{1,2}) · (.+)$/);
        if(m){const d=at(r.from,m[1],+m[2]);if(d)out.push({kind:"hw",date:d,set:last,text:m[3],line:ln});return}
        m=ln.match(/^(Sun|Mon|Tue|Wed|Thu|Fri|Sat) (\d{1,2}) · (.+)$/);if(!m)return;
        const d=at(r.from,m[1],+m[2]);if(!d)return;last=d;
        if(/· self-study\b/.test(m[3]))out.push({kind:"self",date:d,set:null,text:m[3].replace(/\s*· self-study\b/,"").trim(),line:ln})})});
      const ex=p.exam&&p.exam[gi];if(ex)out.push({kind:"exam",date:ex,set:null,text:"Exam"});
      return out.sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0)},
    // homework and self-study classes still ahead (date >= from, by default today), within `days` days
    upcoming(p,gi,from,days,added){from=from||today();const to=add(from,days==null?14:days);return this.tasks(p,gi,added).filter(x=>x.kind!=="exam"&&x.date>=from&&x.date<=to)},
    // what students see as homework (Roger, 6 Nov 2026: "I say when to do sth since otherwise is too much info … if we don't finish I can
    // say this is homework"): only the homework the teacher set on the dashboard (🏠 Set as homework, extra:true). The plan's "Homework by …"
    // and self-study lines are only suggestions on the teacher's dashboard. The board, el-todo.js, the Sunday email and the calendar use it.
    // Homework planned ahead (Roger, 7 Nov 2026: "I want to plan that that will be homework"): one the teacher marked with 🏠 on a later
    // class day (set = that day) reaches students only from that day: board, To do, Sunday email and calendar.
    studentHw(p,gi,added,from,days){const t=today();return this.upcoming(p,gi,from,days,added).filter(x=>x.extra&&!(x.set&&x.set>t))},
    // calendar feed of a group (tools/gen-calendar.js writes calendar/<group id>.ics from this file): the .ics link and the link
    // that subscribes a Google Calendar to it once, so every later homework appears by itself
    calendar(gid,root){const ics=new URL("calendar/"+String(gid).toLowerCase()+".ics",root||location.href).href;
      return {ics,google:"https://calendar.google.com/calendar/r?cid="+encodeURIComponent(ics.replace(/^https?:/,"webcal:"))}},
    // "📅 Add to my calendar" (Roger, 9 Nov 2026: only on the homework, the exam and a final product deadline, from the students' Class agenda):
    // a Google Calendar link that adds one all-day event on day `date` (YYYY-MM-DD) with that title; Google asks the student to save it
    gcalDay(title,date,details){const d=s=>s.replace(/-/g,"");
      return "https://calendar.google.com/calendar/render?action=TEMPLATE&text="+encodeURIComponent(title)+"&dates="+d(date)+"/"+d(add(date,1))+(details?"&details="+encodeURIComponent(details):"")},
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
      if(!p._base)p._base=cp({rows:p.rows,due:p.due||null,stepDue:p.stepDue||null,optional:p.optional||null,exam:p.exam||null});
      const b=cp(p._base);p.rows=b.rows;if(b.due)p.due=b.due;if(b.stepDue)p.stepDue=b.stepDue;if(b.optional)p.optional=b.optional;if(b.exam)p.exam=b.exam;p._moved={};p._tabs={};p._added={};p._dropped={};p._nohw={};p._ag={};
      const get=(r,gi)=>String((r.g?r.g[gi]:r.what)||"").split("\n").filter(Boolean),set=(r,gi,ls)=>{if(r.g)r.g[gi]=ls.join("\n");else r.what=ls.join("\n")};
      const ok=d=>/^\d{4}-\d\d-\d\d$/.test(d||""),lab=to=>{const d=day(to);return DAYS.en[d.getDay()]+" "+d.getDate()};
      // puts a line on day `to` in that day's week row (a new row when the week has none), before the later lines
      const place=(gi,to,nl)=>{const d=day(to);let ti=p.rows.findIndex(r=>r.from&&r.from<=to&&to<=add(r.from,6));
        if(ti<0){const mon=add(to,-((d.getDay()+6)%7)),prev=[...p.rows].reverse().find(r=>r.from&&r.from<mon)||p.rows[0],nr={term:prev.term,from:mon,when:this.week({from:mon}),added:true};
          if(p.rows[0].g)nr.g=p.rows[0].g.map(()=>"");else nr.what="";ti=p.rows.findIndex(r=>r.from&&r.from>mon);if(ti<0)ti=p.rows.length;p.rows.splice(ti,0,nr)}
        const tr=p.rows[ti],ls=get(tr,gi),at=ls.findIndex(l=>{const x=this.lineDay(tr.from,l);return x&&x>to});ls.splice(at<0?ls.length:at,0,nl);set(tr,gi,ls)};
      const shift=(gi,old,to,ids)=>{Object.entries(p.due||{}).forEach(([id,a])=>{if(a&&a[gi]===old&&(!ids||ids.includes(id)))a[gi]=to});
        Object.entries(p.stepDue||{}).forEach(([id,o])=>{if(!ids||ids.includes(id))Object.values(o||{}).forEach(a=>{if(a&&a[gi]===old)a[gi]=to})})};
      Object.entries(edits||{}).forEach(([gid,m])=>{const gi=col(p,gid);if(gi<0||!m)return;const mv=p._moved[gi]={},tb=p._tabs[gi]={},ad=p._added[gi]={};
        const es=Object.entries(m).filter(([,e])=>e),dr=p._dropped[gi]=[],nh=p._nohw[gi]=[];
        // a learning path dropped for this group (Roger, 1 Nov 2026: "we didn't have time and it doesn't count for the unit and it's not part of
        // the exam"): key "drop:<activity id>" = {drop: true}; it has no due day any more (no late reminders, no on-time marks, no bonus check)
        es.filter(([k,e])=>/^drop:/.test(k)&&e.drop).forEach(([k])=>{const id=k.slice(5);dr.push(id);
          [p.due,p.optional].forEach(o=>{if(o&&o[id])o[id][gi]=null});if(p.stepDue&&p.stepDue[id])Object.values(p.stepDue[id]).forEach(a=>{if(a)a[gi]=null});
          // its "Homework by …" lines go too (students are not asked to do it): the ones that name only its "LPn"
          const a=(window.EL_CATALOG||[]).find(x=>x.id===id),t=a&&String(a.title).split(/[:(]/)[0].trim().toLowerCase();let n=null;
          if(t)p.rows.forEach(r=>get(r,gi).forEach(l=>{const q=!n&&/\bLP(\d+) ([^(\n·]+)/.exec(l);if(q&&q[2].trim().toLowerCase().startsWith(t.slice(0,12)))n=q[1]}));
          if(n)p.rows.forEach(r=>{const ls=get(r,gi),k=ls.filter(l=>{if(!/^Homework by /.test(l))return true;const lp=l.match(/\bLP\d+\b/g)||[];return !(lp.length&&lp.every(x=>x==="LP"+n))});if(k.length!==ls.length)set(r,gi,k)})});
        // The agenda (Roger, 6 Nov 2026: "on the left … the LP and SLP … Final Product and exam … on the right my agenda, and I can drag the
        // LP or SLP to the right"; "I should be able to move things around the days and exams and FP too"): key "agenda" = a JSON string
        // {days: {"YYYY-MM-DD": ["activity#panel", "activity#" (no tabs), "note:text", "self"]}, exam, lab: {activity: "LP3 Now or usually?"},
        // base: {activity: its last day when the agenda was made}, due0/opt0: {activity: due day then}, step0: {activity: {step: day}}}.
        // It replaces the group's whole column: one line per day ("Tue 10 · Recall checkpoint 1 · LP3 Now or usually?"), its items as
        // that line's tabs (p._tabs[gi]["@day"]) and "@day" as the line's key for ticks (p._added, like a line sent from another class);
        // the plan's "Homework by …" ideas go. The exam day follows. An activity whose last day moved has its due days moved by as many
        // classes of the group (EL_TIMETABLE) as it moved. The other edits of the group (moves, added lines, nohw, noself) were folded in.
        const agS=m.agenda;let ag=null;if(agS)try{ag=typeof agS==="string"?JSON.parse(agS):agS}catch(e){ag=null}
        if(ag&&ag.days){p._ag[gi]=ag;p.rows.forEach(r=>set(r,gi,[]));const lb=ag.lab||{},last={};
          const ds=Object.keys(ag.days).filter(ok);if(ok(ag.exam)&&!ds.includes(ag.exam))ds.push(ag.exam);ds.sort();
          ds.forEach(d=>{const its=(ag.days[d]||[]).filter(Boolean),segs=[],seen=new Set(),tabs=[];
            its.forEach(it=>{if(it==="self")return;if(/^note:/.test(it)){segs.push(it.slice(5));return}const id=it.split("#")[0];if(!/#game:/.test(it))last[id]=d;   // a class game of a path played later is not that path's day (Roger, 9 Nov 2026: Biel's LP1 and LP2 were not late)
              if(/#./.test(it))tabs.push(it);if(!seen.has(id)){seen.add(id);segs.push(lb[id]||id)}});
            if(ag.exam===d)segs.push("EXAM");if(!segs.length)return;
            const nl=lab(d)+" · "+segs.join(" · ")+(its.includes("self")?" · self-study":"");place(gi,d,nl);ad[nl]={key:"@"+d,from:null};tb["@"+d]=tabs});
          if(ok(ag.exam)){if(!p.exam)p.exam=[];p.exam[gi]=ag.exam}
          const mv1=(id,v)=>v&&ag.base&&ag.base[id]&&last[id]&&last[id]!==ag.base[id]?this.shiftClass(gid,ag.base[id],v,last[id]):v;
          [["due","due0"],["optional","opt0"]].forEach(([f,f0])=>Object.entries(ag[f0]||{}).forEach(([id,v])=>{if(dr.includes(id))return;if(!p[f])p[f]={};if(!p[f][id])p[f][id]=p.groups.map(()=>null);p[f][id][gi]=mv1(id,v)}));
          Object.entries(ag.step0||{}).forEach(([id,o])=>{if(dr.includes(id)||!p.stepDue||!p.stepDue[id])return;Object.entries(o||{}).forEach(([st,v])=>{const a=p.stepDue[id][st];if(a)a[gi]=mv1(id,v)})});
          return}
        es.filter(([k,e])=>!e.add&&!/^(drop|noself|nohw):/.test(k)).forEach(([orig,e])=>{if(e.tabs&&e.tabs.length)tb[orig]=e.tabs;if(!ok(e.to))return;
          const ri=p.rows.findIndex(r=>r.from&&get(r,gi).includes(orig));if(ri<0)return;const old=this.lineDay(p.rows[ri].from,orig);if(!old||old===e.to)return;
          const hw=/^Homework by /.test(orig),nl=orig.replace(/^(Homework by )?\w{3} \d{1,2}\b/,(_,h)=>(h||"")+lab(e.to));
          set(p.rows[ri],gi,get(p.rows[ri],gi).filter(l=>l!==orig));place(gi,e.to,nl);mv[nl]={orig,from:old};
          if(!hw)shift(gi,old,e.to)});
        // a self-study class the teacher teaches after all (Roger, 2 Nov 2026: "I can't delete this homework … they do it in class"): key
        // "noself:<original line>" = {noSelf: true}; the line (moved or not) loses "· self-study", so it is a normal class everywhere
        // (no 📚 item on the boards and in Homework to remind, carried and reminded like any class). The .ics feed follows within the hour (calendar-sync.yml).
        es.filter(([k,e])=>/^noself:/.test(k)&&e.noSelf).forEach(([k])=>{const orig=k.slice(7),cur=Object.keys(mv).find(n=>mv[n].orig===orig)||orig,nl=cur.replace(/\s*· self-study\b/,"");
          if(nl===cur)return;p.rows.forEach(r=>{const ls=get(r,gi),j=ls.indexOf(cur);if(j<0)return;ls[j]=nl;set(r,gi,ls);mv[nl]=mv[cur]||{orig,from:this.lineDay(r.from,cur)};delete mv[cur]})});
        // a "Homework by …" line of the plan the teacher deleted (Roger, 2 Nov 2026: "I should be able to delete the homework"): key
        // "nohw:<original line>" = {noHw: true}; the line (moved or not) goes, so it is not on the boards, in My week, in the emails or in
        // the calendar feed (tools/gen-calendar.js --live). p._nohw[gi] = [{orig, text, date}] for the dashboard's "↩ Bring back".
        es.filter(([k,e])=>/^nohw:/.test(k)&&e.noHw).forEach(([k])=>{const orig=k.slice(5),cur=Object.keys(mv).find(n=>mv[n].orig===orig)||orig;
          p.rows.forEach(r=>{const ls=get(r,gi),j=ls.indexOf(cur);if(j<0||!/^Homework by /.test(cur))return;ls.splice(j,1);set(r,gi,ls);
            nh.push({orig,text:cur.replace(/^Homework by \w{3} \d{1,2} · /,""),date:this.lineDay(r.from,cur)});delete mv[cur]})});
        // the tabs not done in a session, sent to a later class ("⏭ Next class" on the dashboard): {add: "LP3 Where traditions come from",
        // to, from: the day they were planned, tabs, shift: activity ids whose due day on `from` moves to `to`}
        es.filter(([,e])=>e.add&&ok(e.to)).sort((x,y)=>(x[1].at||0)-(y[1].at||0)).forEach(([key,e])=>{const nl=lab(e.to)+" · "+e.add+(e.from?" · not finished on "+lab(e.from):"");
          if(e.tabs&&e.tabs.length)tb[key]=e.tabs;place(gi,e.to,nl);ad[nl]={key,from:e.from||null};if(ok(e.from)&&e.shift)shift(gi,e.from,e.to,e.shift)})});
      return p},
    // Past class days count as done (Roger, 7 Nov 2026: "If a student do sth that's all. It's done and ticked"; "If I dont do sth in class I
    // drag it to the next day and that's all"): every item still on an agenda day before today (and the day itself, "@day") is ticked,
    // unless the teacher unticked it (false). In memory only: ticks = teacherPlan/{group}.ticks, ag = the group's agenda (elAgendaOf);
    // adds the missing keys (the day as their value) and returns them. Used by the dashboard, the Saturday email and the marking.
    autoTicks(ls,ag,ticks,t){const out=[];if(!ag||!ag.days||!ticks)return out;t=t||today();
      Object.keys(ag.days).concat(ag.exam&&!ag.days[ag.exam]?[ag.exam]:[]).forEach(d=>{if(!(d<t))return;
        const its=[...(ag.days[d]||[]).filter(it=>it&&it!=="self"),...(ag.exam===d?["exam"]:[])];if(!its.length)return;
        its.forEach(it=>{const k=ls+"|@"+d+"#"+it;if(!(k in ticks)){ticks[k]=d;out.push(k)}});
        const k=ls+"|@"+d;if(!(k in ticks)&&its.every(it=>ticks[ls+"|@"+d+"#"+it])){ticks[k]=d;out.push(k)}});
      return out},
    // a day the group has English by its timetable (EL_TIMETABLE in el-plan.js): true/false, or null without a timetable for it
    isClass(gid,d){const T=window.EL_TIMETABLE;if(!T||!T.groups||!T.groups[gid])return null;if((T.off||[]).some(o=>Array.isArray(o)?o[0]<=d&&d<=o[1]:o===d))return false;
      const dn=DAYS.en[day(d).getDay()];return T.groups[gid].some(s=>String(s).startsWith(dn+" "))},
    // the group's class days from a to b (both included), by its timetable
    classDays(gid,a,b){const out=[];if(!a||!b)return out;for(let d=a,k=0;d<=b&&k<400;d=add(d,1),k++)if(this.isClass(gid,d))out.push(d);return out},
    // day v, which was some classes after (or before) day `from`, moved as many classes after (or before) day `to` (without a timetable, as many days)
    shiftClass(gid,from,v,to){if(this.isClass(gid,from)==null)return add(to,this.days(from,v));
      const n=v>from?this.classDays(gid,add(from,1),v).length:-this.classDays(gid,v,add(from,-1)).length;if(!n)return add(to,this.days(from,v));
      let d=to,k=0,g=0;while(k<Math.abs(n)&&g<400){d=add(d,n>0?1:-1);g++;if(this.isClass(gid,d))k++}return d},
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
