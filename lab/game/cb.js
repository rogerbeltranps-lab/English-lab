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
function deckQs(d,id,kind){const out=[],np=d.notes===false;let k=0,inRun=false,n=0;
  (d.slides||[]).forEach(s=>{if(s.q){if(inRun){k++;inRun=false}n++;out.push(Object.assign({},s,{deck:id,kind,n,p:k&&!np?"p"+k:"",key:(kind==="vocab"?"v":"g")+n}))}
    else if(s.notes!==false)inRun=true});
  return out}
async function load(ids){
  const decks={};
  for(const id of ids){if(!/^[\w-]+$/.test(id))continue;
    const meta=(window.EL_GAMES||[]).find(x=>x.id===id)||{},kind=meta.kind||(/-vocab$/.test(id)?"vocab":"grammar");
    let got=null;window.ELGameDeck=d=>{got=d};await script(base+"decks/"+id+".js");if(!got)continue;
    const qs=deckQs(got,id,kind);let more=null;window.ELGameMore=m=>{more=m};await script(base+"decks/more/"+id+".js");
    if(more&&Array.isArray(more.questions)){let n=qs.length;more.questions.forEach(q=>{n++;qs.push(Object.assign({},q,{deck:id,kind,n,p:q.p?"p"+q.p:"",key:(kind==="vocab"?"v":"g")+n,extra:true}))})}
    decks[id]={id,title:got.title,kind,qs,more:!!more}}
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
const shown=(qu,seed)=>qu.keep?[...qu.options.keys()]:G.shuffle(qu.options.length,(seed+hash(qu.key))>>>0);
function isRight(qu,t){if(t==null)return false;if(qu.write)return G.right(t,qu.write.map(G.norm));return G.norm(plain(t))===G.norm(plain(qu.options[0]))}
function score(id,pl,hr){const p=pl[id];let s=p?+p.e||0:0;
  Object.values(hr||{}).forEach(h=>{if(h.ok&&h.n){if(h.f===id)s+=h.n;if(h.t===id)s-=h.n}});return Math.max(0,Math.round(s))}
// the files (Roger: points, double, shield, virus, hack): weights out of 100; bits grow a little with each right answer
const FILES=[["bits",56],["double",9],["shield",9],["virus",7],["hack",19]];
const HACK=0.25,VIRUS=0.2,SHIELD_MS=90e3;
function reward(n,canHack,r,bits){r=r||Math.random;const w=FILES.filter(f=>(canHack||f[0]!=="hack")&&(bits>=20||f[0]!=="virus"&&f[0]!=="double")),tot=w.reduce((t,f)=>t+f[1],0);let x=r()*tot,k="bits";
  for(const f of w){if((x-=f[1])<0){k=f[0];break}}
  const b=10+2*Math.min(n,40);return k==="bits"?{k,n:Math.round(b*[1,1,1.5,2,2,3,5][Math.floor(r()*7)]/5)*5}:{k}}
const FILE_LOOK={bits:["💾","Bits"],double:["⚡","Double"],shield:["🛡️","Firewall"],virus:["🦠","Virus"],hack:["💻","Hack"]};
window.ELCB={hash,rng,shuf,plain,pid,avatar,load,order,shown,isRight,score,reward,pwFor,FILE_LOOK,HACK,VIRUS,SHIELD_MS};
})();
