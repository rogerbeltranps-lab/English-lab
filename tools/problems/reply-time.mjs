// When Beltran's automatic answers reach a student (Roger, 17 Nov 2026: "please don't answer straight away; always answer from 8-18 and
// after 2 hours since u receive the message o report, don't use their names or surnames since sometimes it feels like AI").
// Used by tools/problems/auto.mjs (a fixed report's ✅ card and message) and tools/marking/marks.mjs answer (answers to students' comments).
//   replyAt(from)          → ms: at least 2 hours after `from` (the time the report or comment arrived) and not before now, inside 08:00-18:00 Madrid
//                            time, with a few random minutes so answers never all land on the hour. A time after 18:00 moves to the next
//                            day from 08:00. The answer is saved at once with this time; students' pages show it only from then
//                            (el-cloud.js problemReplies .at, el-corrections.js answers[step].at), like the 🌙 21:00-7:30 hold (PR #634).
//   namesIn(text, names)   → the words of the student's name or surnames found in the text, and any name after a greeting
//                            ("Hola Alejandra!"), empty: fine. Both tools refuse to save an answer or draft that uses them.
// Every day of the week, as Roger said it (no weekend rule). `--now` on either tool sends at once: only when Roger asks for it in a thread.
const TZ="Europe/Madrid",FROM=8*60,TO=18*60,GAP=2*36e5;
// Madrid wall clock of an instant: {y, mo, d, h, mi}
const parts=ms=>{const o={};for(const p of new Intl.DateTimeFormat("en-GB",{timeZone:TZ,hourCycle:"h23",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}).formatToParts(new Date(ms)))o[p.type]=+p.value;
  return {y:o.year,mo:o.month,d:o.day,h:o.hour,mi:o.minute}};
// the instant of a Madrid wall-clock time (day may overflow: Date.UTC handles it)
const madrid=(y,mo,d,h,mi)=>{const guess=Date.UTC(y,mo-1,d,h,mi),p=parts(guess),off=Date.UTC(p.y,p.mo-1,p.d,p.h,p.mi)-guess;return guess-off};
export function replyAt(from=Date.now(),rand=Math.random,now=Date.now()){
  const t=Math.max(+from+GAP,now),p=parts(t),m=p.h*60+p.mi;   // an old report looked at late: from now on, still inside the hours
  if(m>=FROM&&m<TO-5)return Math.min(t+Math.round(rand()*20)*6e4,madrid(p.y,p.mo,p.d,17,55));   // inside the hours: 0-20 minutes more, never after 17:55
  const day=m>=TO-5?p.d+1:p.d;return madrid(p.y,p.mo,day,8,5+Math.round(rand()*40));           // before 8:00 or after 17:55: from 8:05 to 8:45
}
export const whenText=ms=>new Date(ms).toLocaleString("en-GB",{timeZone:TZ,weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});
const bare=s=>String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
// Also any greeting followed by a capitalised word ("Hola Alejandra!", "Hi Ammy,"), so a classmate's name or a name that is not on the
// report is caught too (Roger, 21 Nov 2026: "I said never use their names or surnames please"). Start with "Hola!" / "Hi!" or the answer.
const GREET=/(?:^|[.!?]\s+)(?:hola|hi|hello|hey|dear|bon dia|bona tarda|good morning|benvolguda?)\s+(\p{Lu}[\p{L}'’-]*)/gu;
export function namesIn(text,names){
  const words=[...new Set(names.flatMap(n=>bare(n).split(/[^a-z'-]+/)).filter(w=>w.length>=3&&!["del","las","los","the","van","von","and"].includes(w)))];
  const t=" "+bare(text).replace(/[^a-z'-]+/g," ")+" ",found=words.filter(w=>t.includes(" "+w+" "));
  for(const m of String(text||"").matchAll(new RegExp(GREET.source,"giu"))){const w=bare(m[1]);if(m[1][0]!==m[1][0].toLowerCase()&&!found.includes(w))found.push(w)}
  return found;
}
