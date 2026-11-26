// When Beltran's automatic answers and corrections reach a student.
// Roger, 24 Nov 2026: "These answers must be in the afternoon from 17h and the same for all the corrections during weekdays at 17h"
// (it replaces the 08:00-18:00 window of 17 Nov 2026). Kept from 17 Nov: at least 2 hours after a comment or report, never a name.
// Used by tools/problems/auto.mjs (a fixed report's ✅ card and message) and tools/marking/marks.mjs (answers to students' comments,
// and every correction or marking feedback it saves).
//   replyAt(from)          → ms: an answer. At least 2 hours after `from` (the time the report or comment arrived) and not before now,
//                            Monday to Friday from 17:00 to 21:00 Madrid time (21:00 is where the 🌙 night hold starts), with a few
//                            random minutes so answers never all land at once. Otherwise the next weekday from 17:00 (17:00-17:25).
//   corrAt(now)            → ms: a correction (the Wednesday run, ✏️ Correct everything waiting now, a writing sent back to redo).
//                            Now if it is a weekday between 17:00 and 21:00, else the next weekday at 17:00 sharp.
//                            The answer or correction is saved at once with this time; students' pages show it only from then
//                            (el-cloud.js held(): problemReplies .at, answers[step].at, fbGo[step]), like the 🌙 21:00-7:30 hold (PR #634).
//   namesIn(text, names)   → the words of the student's name or surnames found in the text, and any name after a greeting
//                            ("Hola Alejandra!"), empty: fine. Both tools refuse to save an answer or draft that uses them.
// `--now` on either tool sends at once: only when Roger asks for it in a thread.
const TZ="Europe/Madrid",FROM=17*60,TO=21*60,GAP=2*36e5;
// Madrid wall clock of an instant: {y, mo, d, h, mi}
const parts=ms=>{const o={};for(const p of new Intl.DateTimeFormat("en-GB",{timeZone:TZ,hourCycle:"h23",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}).formatToParts(new Date(ms)))o[p.type]=+p.value;
  return {y:o.year,mo:o.month,d:o.day,h:o.hour,mi:o.minute}};
// the instant of a Madrid wall-clock time (day may overflow: Date.UTC handles it)
const madrid=(y,mo,d,h,mi)=>{const guess=Date.UTC(y,mo-1,d,h,mi),p=parts(guess),off=Date.UTC(p.y,p.mo-1,p.d,p.h,p.mi)-guess;return guess-off};
const weekday=p=>{const w=new Date(Date.UTC(p.y,p.mo-1,p.d)).getUTCDay();return w>=1&&w<=5};
// the first weekday at FROM (h:mi) from the Madrid day of p on (that day too when `today`)
function nextOpen(p,today,mi){for(let i=today?0:1;i<9;i++){const t=madrid(p.y,p.mo,p.d+i,12,0),q=parts(t);if(weekday(q))return madrid(q.y,q.mo,q.d,17,mi)}}
const inside=p=>{const m=p.h*60+p.mi;return weekday(p)&&m>=FROM&&m<TO};
export function replyAt(from=Date.now(),rand=Math.random,now=Date.now()){
  const t=Math.max(+from+GAP,now),p=parts(t),m=p.h*60+p.mi;   // an old report looked at late: from now on, still inside the hours
  if(inside(p)&&m<TO-5)return Math.min(t+Math.round(rand()*20)*6e4,madrid(p.y,p.mo,p.d,20,55));   // inside the hours: 0-20 minutes more, never after 20:55
  return nextOpen(p,weekday(p)&&m<FROM,Math.round(rand()*25));                                   // before 17:00, after 20:55 or a weekend: from 17:00
}
export function corrAt(now=Date.now()){const p=parts(now),m=p.h*60+p.mi;
  return inside(p)?+now:nextOpen(p,weekday(p)&&m<FROM,0)}
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
