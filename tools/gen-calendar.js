// Calendar feeds per class group (Roger, 31 Oct 2026: "a google calendar saying add it to your calendar … if they do it once they copy
// all their homework. if I miss a class, they should also know what they have to do"). Reads the teaching plans (shared/js/el-plan.js)
// through ELWeek.tasks (shared/js/el-week.js) and writes calendar/<group id>.ics: every "Homework by …" line (an all-day bar from the
// class that sets it to the day before it is due), every self-study class (the teacher is away) and the exam day.
// Students subscribe once from their board ("📅 Add it to my Google Calendar"); Google refreshes the feed by itself (every few hours).
// Run after every change to el-plan.js:   node tools/gen-calendar.js .
const fs=require("fs"),path=require("path"),vm=require("vm");
const root=path.resolve(process.argv[2]||"."),SITE="https://rogerbeltranps-lab.github.io/English-lab/";
const ctx={window:{},console};ctx.window.window=ctx.window;vm.createContext(ctx);
for(const f of ["shared/js/el-catalog.js","shared/js/el-plan.js","shared/js/el-week.js"])vm.runInContext(fs.readFileSync(path.join(root,f),"utf8"),ctx,{filename:f});
const W=ctx.window.ELWeek,GROUPS=ctx.window.EL_GROUPS,LS=ctx.window.EL_LS||[];
const D=s=>s.replace(/-/g,""),esc=s=>String(s).replace(/\\/g,"\\\\").replace(/;/g,"\;").replace(/,/g,"\\,").replace(/\n/g,"\\n");
// lines of at most 75 octets, continued with a space (RFC 5545)
const fold=l=>{const b=Buffer.from(l);if(b.length<=75)return l;const out=[];let cur="";for(const ch of l){if(Buffer.byteLength(cur+ch)>(out.length?74:75)){out.push(cur);cur=""}cur+=ch}out.push(cur);return out.join("\r\n ")};
const hash=s=>{let h=0;for(const c of s)h=(h*31+c.codePointAt(0))>>>0;return h.toString(36)};
fs.mkdirSync(path.join(root,"calendar"),{recursive:true});
for(const g of GROUPS){
  const ev=[];
  for(const {ls,p,gi} of W.plans(g.id)){
    const l=LS.find(x=>x.id===ls),name=l?l.title.replace(/^\S+ · /,""):ls,url=SITE+ls.replace("-","/")+"/index.html",board=SITE+"today.html";
    for(const x of W.tasks(p,gi)){
      let start=x.date,end=W.add(x.date,1),sum,desc;
      if(x.kind==="hw"){start=x.set&&x.set<x.date?x.set:W.add(x.date,-1);end=x.date;
        sum=`🏠 English homework for ${W.date(x.date,"en")}: ${x.text}`;
        desc=`${x.text}\nFor the English class on ${W.date(x.date,"en")} · Per a la classe d'anglès del ${W.date(x.date,"ca")}.\n${name}: ${url}\nMy board / El meu tauler: ${board}`}
      else if(x.kind==="self"){sum=`📚 English class on your own: ${x.text}`;
        desc=`Your teacher is not in class today. Work on it on your own with headphones and finish it at home.\nAvui el professor no hi és: treballa-ho pel teu compte amb auriculars i acaba-ho a casa.\n${name}: ${url}`}
      else{sum=`📝 English exam · ${name}`;desc=`${name}: ${url}\nSample exam and summaries on my board / Examen de prova i resums al meu tauler: ${board}`}
      ev.push(["BEGIN:VEVENT",`UID:${g.id.toLowerCase()}-${ls}-${x.kind}-${x.date}-${hash(x.text)}@english-lab`,"DTSTAMP:20261031T000000Z",
        `DTSTART;VALUE=DATE:${D(start)}`,`DTEND;VALUE=DATE:${D(end)}`,`SUMMARY:${esc(sum)}`,`DESCRIPTION:${esc(desc)}`,`URL:${x.kind==="exam"?board:url}`,"TRANSP:TRANSPARENT","END:VEVENT"].join("\n"))}
  }
  const cal=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//English Lab//Homework//EN","CALSCALE:GREGORIAN","METHOD:PUBLISH",
    `X-WR-CALNAME:English · ${g.name}`,`X-WR-CALDESC:Homework${""}, classes on your own and exams of ${g.name} (English Lab)`,"X-WR-TIMEZONE:Europe/Madrid",
    "REFRESH-INTERVAL;VALUE=DURATION:PT6H","X-PUBLISHED-TTL:PT6H",...ev,"END:VCALENDAR"].join("\n");
  const out=cal.split("\n").map(fold).join("\r\n")+"\r\n",f=path.join(root,"calendar",g.id.toLowerCase()+".ics");
  fs.writeFileSync(f,out);console.log(path.relative(root,f),ev.length,"events");
}
