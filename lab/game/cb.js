// 🕵️ Code Breakers (Roger, 11–12 Nov 2026: "can we make a game like a blooket, hackers like?"): a second way to play the class games of a
// learning path. Our own game, name and look. What the board (codebreakers.html, cb-host.js) and the player (play.html, cb-play.js) share.
// - One round = the questions of BOTH games of the learning path (vocabulary + grammar, Roger 11 Nov 2026: "if I choose Code Breakers, it picks
//   the questions of the grammar and the vocabulary of that LP"), with no theory slides. Each answer is still saved as vocabulary or grammar.
// - New questions on the same words and grammar (Roger, 12 Nov 2026: "different questions asking the same grammar and vocabulary … to make the
//   games more complete"): decks/more/<deck id>.js = ELGameMore({deck, questions:[…]}), each question as in a deck plus p (the theory part it
//   practises: 1 = the first run of theory slides, as the 📝 notes parts). Code Breakers shows them first, then the class game's own questions.
// - Each student plays at their own pace. A right answer opens one of 3 files: bits, ⚡ double, 🛡️ firewall, 🦠 virus or 💻 hack. A hack steals
//   from another player if the hacker cracks their password: each player chooses it at the start from 3 words of the learning path, and the
//   hacker sees that word's clue (its sentence with a gap) and the 3 words, so knowing the vocabulary is what cracks it.
// - The board is the referee of the hacks (it alone reads every player's password) and publishes the scores in live/{group}.
// window.ELCB:
//   load(ids)             loads the decks (and their decks/more files) → {decks:{id:{id, title, kind, qs}}, pool, words}
//   order(pool, seed)     the order of the questions for one student: new questions first, vocabulary and grammar taking turns
//   shown(qu, seed)       the order of a question's options for one student (the deck's first option is the right one)
//   similar(pool, qu, a, seed, avoid)  a question like qu to try after a wrong answer (key)
//   readMs(qu)            how long the answers stay locked so the question is read first
//   isRight(qu, text)     a tapped option's text or typed words → true / false
//   pid(email)            a short id for a player (keys of live maps, never the email)
//   avatar(email)         the player's animal
//   score(pid, pl, hr)    a player's bits: earned + stolen − lost (pl = {pid: {e}}, hr = the board's hack results)
//   reward(n, canHack, r, bits) one file's content after n right answers (no virus or double under 20 bits)
//   pwFor(email, words)   the 3 password words offered to a player
(function(){
const G=window.ELGame;
function hash(s){let h=2166136261>>>0;s=String(s||"");for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0}return h>>>0}
function rng(seed){let t=(seed>>>0)||1;return ()=>{t=(t+0x6D2B79F5)>>>0;let x=Math.imul(t^(t>>>15),1|t);x=(x+Math.imul(x^(x>>>7),61|x))^x;return ((x^(x>>>14))>>>0)/4294967296}}
function shuf(a,seed){a=a.slice();const r=rng(seed);for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const plain=s=>String(s??"").replace(/\*\*/g,"").replace(/~~/g,"");
const pid=em=>hash(String(em||"").toLowerCase()).toString(36);
const ANIMALS=["🦊","🐼","🐯","🐸","🐙","🦉","🐵","🐧","🦁","🐨","🐰","🐶","🐱","🦄","🐲","🐢","🦖","🐝","🦈","🐬","🦩","🦔","🐻","🐮"];
const avatar=em=>ANIMALS[hash("av"+String(em||"").toLowerCase())%ANIMALS.length];

function script(src){return new Promise(res=>{const s=document.createElement("script");s.src=src;s.onload=()=>res(true);s.onerror=()=>res(false);document.head.append(s)})}
const base=(()=>{const c=document.currentScript&&document.currentScript.src;return c?c.replace(/[^/]*$/,""):"./"})();
// a deck's questions, numbered as on the board (n = 1, 2… in deck order: the same n as the class game's results), each with its notes part
// (tp = the number of that run of theory slides even when the deck has no notes; th = {tp: [its theory slides]}, shown after a wrong answer)
function deckQs(d,id,kind,th){const out=[],np=d.notes===false;let k=0,inRun=false,n=0,run=[];th=th||{};
  (d.slides||[]).forEach(s=>{if(s.q){if(inRun){k++;inRun=false;th[k]=run;run=[]}n++;out.push(Object.assign({},s,{deck:id,kind,n,tp:k,p:k&&!np?"p"+k:"",key:(kind==="vocab"?"v":"g")+n}))}
    else if(s.notes!==false){inRun=true;if(s.theory)run.push(s)}});
  return out}
async function load(ids){
  const decks={};
  for(const id of ids){if(!/^[\w-]+$/.test(id))continue;
    const meta=(window.EL_GAMES||[]).find(x=>x.id===id)||{},kind=meta.kind||(/-vocab$/.test(id)?"vocab":"grammar");
    let got=null;window.ELGameDeck=d=>{got=d};await script(base+"decks/"+id+".js");if(!got)continue;
    const th={},qs=deckQs(got,id,kind,th);let more=null;window.ELGameMore=m=>{more=m};await script(base+"decks/more/"+id+".js");
    if(more&&Array.isArray(more.questions)){let n=qs.length;more.questions.forEach(q=>{n++;qs.push(Object.assign({},q,{deck:id,kind,n,tp:+q.p||0,p:q.p?"p"+q.p:"",key:(kind==="vocab"?"v":"g")+n,extra:true}))})}
    decks[id]={id,title:got.title,kind,qs,th,more:!!more}}
  const pool=Object.values(decks).flatMap(d=>d.qs);
  return {decks,pool,words:words(pool)}}
// password words: the vocabulary questions whose answer is one word (4 letters or more) and whose sentence has a gap; the clue is that sentence
function words(pool){const seen=new Set(),out=[];
  pool.filter(q=>q.kind==="vocab"&&/_{3,}/.test(q.q)).forEach(q=>{const w=plain(q.write?q.write[0]:q.options[0]).trim();
    if(!/^[a-z]{4,}$/i.test(w)||seen.has(w.toLowerCase()))return;seen.add(w.toLowerCase());
    out.push({w,c:plain(q.q).replace(/\s*\([^)]*\.\.\.\)\s*$/,"").replace(/\s*\(one word\)\s*$/i,"").trim()})});
  return out}
function pwFor(em,ws){if(!ws.length)return [];return shuf(ws,hash("pw"+String(em||"").toLowerCase())).slice(0,3)}
// new questions first, then the class game's; vocabulary and grammar take turns (each part shuffled for this student)
function order(pool,seed){const part=x=>{const v=shuf(pool.filter(q=>q.kind==="vocab"&&!!q.extra===x),seed+(x?1:3)),g=shuf(pool.filter(q=>q.kind!=="vocab"&&!!q.extra===x),seed+(x?2:4)),o=[];
    while(v.length||g.length){if(v.length)o.push(v.shift());if(g.length)o.push(g.shift())}return o};
  return [...part(true),...part(false)].map(q=>q.key)}
// 🔁 After a wrong answer, a similar question (Roger, 13 Nov 2026: "when they are wrong … show them the answer, explain the theory and ask a
// similar question; if they are wrong they have another question. Two wrongs, they continue though."): the same game (vocabulary or
// grammar) and the same part of its theory, one this student hasn't answered yet if there is one; else the same part; else the same game.
function similar(pool,qu,a,seed,avoid){const ok=q=>q.key!==qu.key&&!(avoid&&avoid.has(q.key));
  const tiers=[q=>q.deck===qu.deck&&q.tp===qu.tp&&a[q.key]==null,q=>q.deck===qu.deck&&q.tp===qu.tp,q=>q.deck===qu.deck&&a[q.key]==null,q=>q.deck===qu.deck];
  for(const t of tiers){const l=pool.filter(q=>ok(q)&&t(q));if(l.length)return l[rng(seed+hash(qu.key))()*l.length|0].key}return null}
// 🤝 No ganging up (Roger, 13 Nov 2026: "don't allow to bully a person when playing hackers, meaning not everybody hacks the same person"):
// after somebody tries to hack a player, nobody can try again on them for 1 minute (2 minutes after a hack that worked), and nobody can hack
// the same player twice in a row. The board judges it from the time of each attempt (a late attempt is ✋ blocked, pr:true, and changes nothing);
// the players' lists grey those players out. guard(pid, hr, before) = until when pid is protected (from the hacks before that time);
// lastTarget(pid, hr) = the last player pid tried to hack.
const GUARD_TRY=60e3,GUARD_OK=120e3;
function guard(id,hr,before){let u=0;Object.values(hr||{}).forEach(h=>{if(!h||h.t!==id||h.pr)return;const a=+h.at||0;if(before!=null&&a>=before)return;u=Math.max(u,a+(h.ok?GUARD_OK:GUARD_TRY))});return u}
function lastTarget(id,hr){let b=null;Object.values(hr||{}).forEach(h=>{if(h&&h.f===id&&(!b||(+h.at||0)>(+b.at||0)))b=h});return b?b.t:null}
// 👀 Read first (Roger, 13 Nov 2026: "don't allow students to press super fast answers without looking"): the answers can't be pressed until
// the student has had time to read the question and the options: 1.2 s + 35 ms a character, between 2 and 5 seconds.
function readMs(qu){const t=plain(qu.q)+" "+(qu.options||[]).map(plain).join(" ");return Math.max(2000,Math.min(5000,1200+35*t.length))}
const shown=(qu,seed)=>qu.keep?[...qu.options.keys()]:G.shuffle(qu.options.length,(seed+hash(qu.key))>>>0);
// ✏️ Typed answers with more than the gap count too (Roger, 13 Nov 2026, Code Breakers: "if the answer is 'are doing' because it comes from
// 'are you doing', it must be correct"; the LS pages do the same since #559): 2 words or more, in the order of the sentence with the gap
// filled, holding every word of the answer; other words of the sentence may be left out ("are doing" for "What ___ you doing?" = are), never
// added. Contractions count either way and the verb in brackets is left out. A wrong form still fails.
const xp=s=>(" "+G.norm(plain(s)).replace(/\bwon't\b/g,"will not").replace(/\bcan't\b/g,"cannot").replace(/n't\b/g," not").replace(/'re\b/g," are").replace(/'ll\b/g," will")
  .replace(/'m\b/g," am").replace(/'ve\b/g," have").replace(/'d\b/g," would").replace(/'s\b/g," is")+" ").replace(/[^a-z0-9' ]+/g," ").replace(/\s+/g," ").trim();
function fits(q,answers,typed){const t=xp(typed).split(" ").filter(Boolean);if(t.length<2)return false;
  const parts=plain(q).replace(/\([^)]*\)/g," ").split(/_{2,}(?:[\s/]*_{2,})*/),g=parts.length-1;if(g<1)return false;
  return answers.some(a=>{const w=G.norm(a).split(" "),fills=g===1?[w.join(" ")]:g===w.length?w:g===2&&w.length>2?[w[0],w.slice(1).join(" ")]:null;if(!fills)return false;
    const words=[],gap=[],put=(x,f)=>xp(x).split(" ").filter(Boolean).forEach(y=>{gap.push(!!f);words.push(y)});
    put(parts[0]);fills.forEach((f,i)=>{put(f,true);put(parts[i+1])});if(!gap.some(Boolean))return false;
    const W=words.length,memo={},go=(i,j)=>{if(j===W)return i===t.length;const k=i*(W+1)+j;if(k in memo)return memo[k];
      return memo[k]=(i<t.length&&t[i]===words[j]&&go(i+1,j+1))||(!gap[j]&&go(i,j+1))};
    return go(0,0)})}
function isRight(qu,t){if(t==null)return false;if(qu.write)return G.right(t,qu.write.map(G.norm))||fits(qu.q,qu.write,t);return G.norm(plain(t))===G.norm(plain(qu.options[0]))}
function score(id,pl,hr){const p=pl[id];let s=p?+p.e||0:0;
  Object.values(hr||{}).forEach(h=>{if(h.ok&&h.n){if(h.f===id)s+=h.n;if(h.t===id)s-=h.n}});return Math.max(0,Math.round(s))}
// the files (Roger: points, double, shield, virus, hack): weights out of 100; bits grow a little with each right answer
const FILES=[["bits",56],["double",9],["shield",9],["virus",7],["hack",19]];
const HACK=0.25,VIRUS=0.2,SHIELD_MS=90e3;
function reward(n,canHack,r,bits){r=r||Math.random;const w=FILES.filter(f=>(canHack||f[0]!=="hack")&&(bits>=20||f[0]!=="virus"&&f[0]!=="double")),tot=w.reduce((t,f)=>t+f[1],0);let x=r()*tot,k="bits";
  for(const f of w){if((x-=f[1])<0){k=f[0];break}}
  const b=10+2*Math.min(n,40);return k==="bits"?{k,n:Math.round(b*[1,1,1.5,2,2,3,5][Math.floor(r()*7)]/5)*5}:{k}}
const FILE_LOOK={bits:["💾","Bits"],double:["⚡","Double"],shield:["🛡️","Firewall"],virus:["🦠","Virus"],hack:["💻","Hack"]};
window.ELCB={hash,rng,shuf,plain,pid,avatar,load,order,shown,similar,readMs,guard,lastTarget,isRight,score,reward,pwFor,FILE_LOOK,HACK,VIRUS,SHIELD_MS};
})();
