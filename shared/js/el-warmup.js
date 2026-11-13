// 🔥 Warm-up game at the start of every class (Roger, 13 Nov 2026: "I'd like to start every class with a mini game like ahorcado with the
// grammar and vocabulary of the unit", "but not always ahorcado", "they say letters and I press them so I don't even have to know the
// answer", "so the class mode the game appears automatically"). A full-screen board over the class tab when class mode starts (el-cloud.js
// cmTeacher, once per class mode), and again from 🔥 Warm-up in 📋 Today. Whole class, on the projector only: the students call out and the
// teacher taps; nothing is written or read in Firestore, no marks, the students' Chromebooks stay where they are.
// The words and sentences are the class games' (lab/game/decks/<id>.js, + decks/more/<id>.js) of today's learning paths (el-cm-agenda.js
// warmDecks). Four games take turns, a different one each class for the group (localStorage el_wu, this browser): 🔤 Hangman (a word from
// the vocabulary, its sentence as the clue, a letter keyboard; 8 lights go out), 🔀 Word order (a sentence in shuffled tiles: tap them in
// order, a wrong tile shakes), 🕵️ Spot the mistake (a sentence with a wrong form: tap the wrong word), 🅰 No vowels (a word without its
// vowels; 💡 adds one). Three rounds; the teacher never needs to know the answer (👁 Show answer is there anyway).
const E=t=>String(t==null?"":t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
const plain=t=>String(t||"").replace(/\*\*/g,"").replace(/\s+/g," ").trim();
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const GAMES=[
  {id:"hang",name:"Hangman",em:"🔤",how:"Call out a letter. Eight wrong letters and the lights are out."},
  {id:"order",name:"Word order",em:"🔀",how:"Tell me the words in the right order."},
  {id:"spot",name:"Spot the mistake",em:"🕵️",how:"One word is wrong. Which one? And what should it be?"},
  {id:"vow",name:"No vowels",em:"🅰",how:"The vowels are gone. What's the word?"}];
const ROUNDS=3,LIVES=8,K="el_wu";
// 💬 Saying of the day (Roger, 13 Nov 2026: "can you add a proverb or saying like Deeds are your monuments"): one English saying at the
// top of the warm-up, the same all day for the group (a hash of the day and the group), from the LS's topic first, else the general list;
// 💡 What does it mean? shows a simple meaning and the Catalan saying when there is one. Proverbs only (no quotes put in anyone's mouth).
const SAY_GEN=[
  ["Deeds are your monuments.","What you do is what people remember, not what you say.",""],
  ["Practice makes perfect.","The more you practise, the better you get.","La pràctica fa el mestre."],
  ["Rome wasn't built in a day.","Big things take time and patience.","Roma no es va fer en un dia."],
  ["Actions speak louder than words.","What you do shows more than what you say.","Fets i no paraules."],
  ["Better late than never.","It's better to do something late than not at all.","Més val tard que mai."],
  ["Little by little, one goes far.","Small steps every day take you a long way.","Poc a poc s'arriba lluny."],
  ["Where there's a will, there's a way.","If you really want something, you find a way to do it.","Qui la segueix la consegueix."],
  ["Two heads are better than one.","Working together gives better ideas.",""],
  ["The early bird catches the worm.","People who start early get the best chances.","Qui matina fa farina."],
  ["Don't judge a book by its cover.","Don't decide what something is like just by how it looks.",""],
  ["Every cloud has a silver lining.","Even a bad situation has something good in it.",""],
  ["Knowledge is power.","The more you know, the more you can do.",""],
  ["A journey of a thousand miles begins with a single step.","Every big goal starts with one small action.",""]];
const SAY_TOPIC={
  "4eso-ls2":[
    ["The more, the merrier.","A celebration is better with more people.","Com més serem, més riurem."],
    ["When in Rome, do as the Romans do.","When you visit a place, follow its customs.","On vagis, fes el que veuràs."],
    ["Old habits die hard.","It is difficult to stop doing things we have always done.",""],
    ["Home is where the heart is.","Home is the place where the people you love are.",""],
    ["April showers bring May flowers.","Bad times (like rain) often bring good things later.",""],
    ["There's no place like home.","Nowhere feels as good as your own home.",""]],
  "2eso-ls2":[
    ["All work and no play makes Jack a dull boy.","You need free time too, not only work.",""],
    ["Time flies when you're having fun.","When you enjoy something, time passes very quickly.",""],
    ["No pain, no gain.","You need to work hard to get better.","Qui algo vol, algo li costa."],
    ["Health is wealth.","Being healthy is the most important thing you have.","La salut és el més important."],
    ["An apple a day keeps the doctor away.","Eating well keeps you healthy.",""],
    ["Variety is the spice of life.","Doing different things makes life fun.",""]]};
const hash=t=>{let h=2166136261;for(const c of String(t)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
function sayOfDay(o){const pre=String((o.decks||[])[0]||"").split("-").slice(0,2).join("-"),top=SAY_TOPIC[pre]||[],all=top.concat(SAY_GEN);
  const d=new Date().toLocaleDateString("en-CA",{timeZone:"Europe/Madrid"}),h=hash(d+"|"+o.g);
  return top.length&&h%3!==0?top[h%top.length]:all[h%all.length]}

let root=null,box=null,S=null,keyH=null;

function script(src){return new Promise(r=>{const s=document.createElement("script");s.src=src;s.onload=s.onerror=()=>{s.remove();r()};document.head.append(s)})}
// the questions of these class games: [{q, a (right answer), wrong: [other options], kind}]
async function loadPool(ids){const out=[];
  for(const id of ids){if(!/^[\w-]+$/.test(id))continue;const kind=/-vocab$/.test(id)?"vocab":"grammar";
    let d=null;window.ELGameDeck=x=>{d=x};await script(new URL("lab/game/decks/"+id+".js",root).href);
    let m=null;window.ELGameMore=x=>{m=x};await script(new URL("lab/game/decks/more/"+id+".js",root).href);
    const qs=((d&&d.slides)||[]).filter(s=>s.q).concat((m&&Array.isArray(m.questions))?m.questions:[]);
    qs.forEach(s=>{const a=plain(s.write?s.write[0]:(s.options||[])[0]);if(!a)return;
      out.push({q:plain(s.q),a,wrong:s.write?[]:(s.options||[]).slice(1).map(plain),kind,img:s.img||""})})}
  return out}
const oneGap=q=>(q.q.match(/_{3,}/g)||[]).length===1;
const full=q=>q.q.replace(/\s*\((?:[^)]*\.\.\.|one word|[^)]*words?)\)\s*$/i,"").replace(/_{3,}/,q.a);
const clue=q=>q.q.replace(/\s*\((?:[^)]*\.\.\.|one word|[^)]*words?)\)\s*$/i,"").replace(/_{3,}/,"_____");
// what each game can use
function itemsFor(g,pool){const seen=new Set(),uniq=(k,x)=>{k=k.toLowerCase();if(seen.has(k))return null;seen.add(k);return x};
  const gap=pool.filter(oneGap);
  if(g==="hang")return gap.filter(q=>q.kind==="vocab"&&/^[a-z][a-z' -]{3,17}$/i.test(q.a)&&q.a.replace(/[^a-z]/gi,"").length>=4).map(q=>uniq(q.a,{w:q.a,c:clue(q),img:q.img})).filter(Boolean);
  if(g==="vow")return gap.filter(q=>q.kind==="vocab"&&/^[a-z][a-z' -]{4,17}$/i.test(q.a)&&(q.a.match(/[aeiou]/gi)||[]).length>=2).map(q=>uniq(q.a,{w:q.a,c:clue(q),img:q.img})).filter(Boolean);
  if(g==="order")return gap.map(q=>{const s=full(q),ws=s.split(" ");return ws.length>=5&&ws.length<=12&&!/_{3,}/.test(s)?uniq(s,{s,ws,kind:q.kind}):null}).filter(Boolean)
    .sort((a,b)=>(a.kind==="grammar"?0:1)-(b.kind==="grammar"?0:1));
  if(g==="spot")return gap.filter(q=>q.wrong.length&&q.kind==="grammar").map(q=>{const w=q.wrong.find(x=>x&&x.toLowerCase()!==q.a.toLowerCase()&&!/_{3,}/.test(x));if(!w)return null;
    const s=q.q.replace(/\s*\([^)]*\)\s*$/,"").replace(/_{3,}/,"\u0001"+w+"\u0002"),ws=s.split(" ").filter(Boolean);if(ws.length>14)return null;
    return uniq(q.q,{ws,ok:full(q),a:q.a,w})}).filter(Boolean);
  return []}
const rot=()=>{try{return JSON.parse(localStorage.getItem(K)||"{}")||{}}catch(e){return {}}};
function nextGame(g,pool){const r=rot(),last=GAMES.findIndex(x=>x.id===r[g]);
  for(let k=1;k<=GAMES.length;k++){const x=GAMES[(last+k+GAMES.length)%GAMES.length];if(itemsFor(x.id,pool).length>=ROUNDS)return x.id}
  return GAMES.find(x=>itemsFor(x.id,pool).length)?.id||null}
function remember(g,id){const r=rot();r[g]=id;try{localStorage.setItem(K,JSON.stringify(r))}catch(e){}}

// Closed and opened again in the same class mode (🔥 on the class mode chip or in 📋 Today; Roger, 13 Nov 2026: "if I close it I want to
// come back again if I want to"): the same game goes on at the same round (sessionStorage el_wu_cur = {s, game, round, items}).
const CUR="el_wu_cur";
const curGet=s=>{try{const c=JSON.parse(sessionStorage.getItem(CUR)||"null");return c&&s&&c.s===s?c:null}catch(e){return null}};
function curSave(){if(!S||!S.o.s)return;try{sessionStorage.setItem(CUR,JSON.stringify({s:S.o.s,game:S.game,round:S.round,items:S.items}))}catch(e){}}
// o = {root (site URL), g (group id), gname, s (this class mode), decks: [class game ids], title (today's learning paths)}
export async function open(o){root=o.root;close();
  if(!document.getElementById("el-wu-css")){const st=document.createElement("style");st.id="el-wu-css";st.textContent=CSS;document.head.append(st);
    const f=document.createElement("link");f.rel="stylesheet";f.href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&display=swap";document.head.append(f)}
  box=document.createElement("div");box.id="el-wu";box.setAttribute("role","dialog");box.setAttribute("aria-label","Warm-up game");box.className="notranslate";box.translate=false;
  box.innerHTML='<div class="wu-c"><p class="wu-msg">Getting the warm-up ready…</p></div>';box.onclick=click;document.body.append(box);
  keyH=e=>{if(!box||!S||e.ctrlKey||e.metaKey||e.altKey)return;if(e.key==="Escape"){close();return}
    if(S.game==="hang"&&/^[a-z]$/i.test(e.key)){e.preventDefault();guess(e.key.toLowerCase())}};
  document.addEventListener("keydown",keyH,true);
  const pool=await loadPool(o.decks||[]).catch(()=>[]);
  const cur=curGet(o.s);
  if(cur&&GAMES.some(x=>x.id===cur.game)&&Array.isArray(cur.items)&&cur.items.length){S={o,say:sayOfDay(o),sayOpen:false,pool,game:cur.game,round:Math.min(+cur.round||0,cur.items.length),items:cur.items,st:null};newRound();return}
  const game=nextGame(o.g,pool);
  S={o,say:sayOfDay(o),sayOpen:false,pool,game,round:0,items:[],st:null};
  if(!game){box.querySelector(".wu-c").innerHTML=`<p class="wu-msg">No warm-up today: there is no class game for today's learning path yet.</p><button class="wu-b go" data-x="1">▶ Start the class</button>`;return}
  start(game)}
export function close(){if(box){box.remove();box=null}if(keyH)document.removeEventListener("keydown",keyH,true);keyH=null;S=null}
export const isOpen=()=>!!box;

function start(id){S.game=id;S.round=0;S.items=shuf(itemsFor(id,S.pool)).slice(0,ROUNDS);remember(S.o.g,id);newRound()}
function newRound(){curSave();const it=S.items[S.round];if(!it)return draw();
  if(S.game==="hang")S.st={it,got:new Set(),miss:[],shown:false};
  if(S.game==="vow")S.st={it,hint:0,shown:false};
  if(S.game==="order"){let t=it.ws.map((w,i)=>({w,i}));for(let k=0;k<6;k++){t=shuf(t);if(t.some((x,j)=>x.i!==j))break}S.st={it,tiles:t,done:0,bad:-1,shown:false,miss:0}}
  if(S.game==="spot")S.st={it,pick:-1,shown:false,tries:0};
  draw()}
const letters=w=>w.toLowerCase().replace(/[^a-z]/g,"").split("");
function hangWon(){const s=S.st;return letters(s.it.w).every(c=>s.got.has(c))}
function guess(c){const s=S.st;if(!s||s.shown||s.got.has(c)||s.miss.includes(c)||s.miss.length>=LIVES||hangWon())return;
  if(letters(s.it.w).includes(c))s.got.add(c);else s.miss.push(c);if(hangWon()||s.miss.length>=LIVES)s.shown=true;draw()}

function click(e){const b=e.target.closest("button");if(!b||!S&&!b.dataset.x)return;
  if(b.dataset.x)return close();
  if(b.dataset.say){S.sayOpen=!S.sayOpen;return draw()}
  if(b.dataset.g)return start(b.dataset.g);
  if(b.dataset.k)return guess(b.dataset.k);
  if(b.dataset.next){S.round++;return newRound()}
  if(b.dataset.again)return start(S.game);
  if(b.dataset.show){S.st.shown=true;if(S.game==="hang")letters(S.st.it.w).forEach(c=>S.st.got.add(c));if(S.game==="order")S.st.done=S.st.it.ws.length;return draw()}
  if(b.dataset.hint&&S.game==="vow"){S.st.hint++;return draw()}
  if(b.dataset.t!=null&&S.game==="order"){const s=S.st,t=s.tiles[+b.dataset.t];if(t.used||s.shown)return;
    if(t.w===s.it.ws[s.done]){t.used=true;s.done++;s.bad=-1;if(s.done>=s.it.ws.length)s.shown=true}else{s.bad=+b.dataset.t;s.miss++}return draw()}
  if(b.dataset.w!=null&&S.game==="spot"){const s=S.st;if(s.shown)return;s.pick=+b.dataset.w;s.tries++;if(/\u0001/.test(s.it.ws[s.pick])||/\u0002/.test(s.it.ws[s.pick])||inWrong(s.pick))s.shown=true;return draw()}}
// the words of the wrong form (it can be more than one word: "is celebrate")
function inWrong(i){const ws=S.st.it.ws;let on=false;for(let k=0;k<=i;k++){if(/\u0001/.test(ws[k]))on=true;if(k===i)return on;if(/\u0002/.test(ws[k]))on=false}return false}

function draw(){if(!box||!S)return;const g=GAMES.find(x=>x.id===S.game),n=S.items.length,end=S.round>=n;
  const tabs=GAMES.filter(x=>itemsFor(x.id,S.pool).length).map(x=>`<button class="wu-t ${x.id===S.game?"on":""}" data-g="${x.id}" title="Play ${E(x.name)} instead">${x.em} ${E(x.name)}</button>`).join("");
  let body="";
  if(end)body=`<div class="wu-end"><div class="wu-big">🎉</div><h2>Warm-up done!</h2><p>${E(S.o.title||"")}</p><div class="wu-row"><button class="wu-b" data-again="1">↻ Play again</button><button class="wu-b go" data-x="1">▶ Start the class</button></div></div>`;
  else if(S.game==="hang")body=drawHang();else if(S.game==="vow")body=drawVow();else if(S.game==="order")body=drawOrder();else body=drawSpot();
  const done=!end&&S.st&&S.st.shown;
  box.innerHTML=`<div class="wu-top"><b>🔥 Warm-up · ${E(S.o.gname||S.o.g)}</b><span class="wu-tabs">${tabs}</span><button class="wu-b ghost" data-x="1" title="Close the warm-up (Esc)">▶ Start the class</button></div>
  <div class="wu-c">${sayBox()}${end?"":`<div class="wu-head"><span class="wu-em">${g.em}</span><div><h2>${E(g.name)}</h2><p>${E(g.how)}</p></div><span class="wu-n">${S.round+1} / ${n}</span></div>`}${body}
  ${end?"":`<div class="wu-row wu-foot">${done?`<button class="wu-b go" data-next="1">${S.round+1<n?"Next →":"Finish 🎉"}</button>`:`<button class="wu-b ghost" data-show="1" title="Show the answer on the screen">👁 Show answer</button>`}</div>`}</div>`}
function sayBox(){const y=S.say;if(!y)return "";
  return `<div class="wu-say"><span class="wu-sl">💬 Saying of the day</span><q>${E(y[0])}</q>${S.sayOpen?`<p class="wu-sm2">${E(y[1])}${y[2]?` <i>· ${E(y[2])}</i>`:""}</p>`:""}<button class="wu-t" data-say="1">${S.sayOpen?"Hide":"💡 What does it mean?"}</button></div>`}
function drawHang(){const s=S.st,w=s.it.w,lost=s.miss.length>=LIVES,won=hangWon();
  const slots=w.split("").map(c=>/[a-z]/i.test(c)?`<span class="wu-l ${s.got.has(c.toLowerCase())?"on":""} ${lost&&!s.got.has(c.toLowerCase())?"lost":""}">${s.got.has(c.toLowerCase())||lost?E(c):""}</span>`:c===" "?'<span class="wu-sp"></span>':`<span class="wu-p">${E(c)}</span>`).join("");
  const lights=Array.from({length:LIVES},(_,i)=>`<span class="wu-bulb ${i<s.miss.length?"off":""}"></span>`).join("");
  const kb=["qwertyuiop","asdfghjkl","zxcvbnm"].map(r=>`<div class="wu-kr">${r.split("").map(c=>`<button class="wu-k ${s.got.has(c)?"ok":s.miss.includes(c)?"no":""}" data-k="${c}" ${s.got.has(c)||s.miss.includes(c)||s.shown?"disabled":""}>${c.toUpperCase()}</button>`).join("")}</div>`).join("");
  return `<div class="wu-lights" aria-label="${LIVES-s.miss.length} lights left">${lights}</div>
    <div class="wu-word">${slots}</div>
    <p class="wu-clue">${s.it.img?`<span>${E(s.it.img)}</span> `:""}${E(s.it.c)}</p>
    ${won?'<p class="wu-ok">✔ Well done!</p>':lost?`<p class="wu-no">The lights are out! It was <b>${E(w)}</b>.</p>`:""}
    <div class="wu-kb">${kb}</div>`}
function drawVow(){const s=S.st,w=s.it.w;let k=0;
  const out=w.split("").map(c=>{if(/[aeiou]/i.test(c)){k++;return s.shown||k<=s.hint?`<span class="wu-l on">${E(c)}</span>`:'<span class="wu-l"></span>'}return c===" "?'<span class="wu-sp"></span>':/[a-z]/i.test(c)?`<span class="wu-l on cons">${E(c)}</span>`:`<span class="wu-p">${E(c)}</span>`}).join("");
  const nv=(w.match(/[aeiou]/gi)||[]).length;
  return `<div class="wu-word">${out}</div><p class="wu-clue">${s.it.img?`<span>${E(s.it.img)}</span> `:""}${E(s.it.c)}</p>
    ${s.shown?'<p class="wu-ok">✔ <b>'+E(w)+'</b></p>':`<div class="wu-row"><button class="wu-b" data-hint="1" ${s.hint>=nv-1?"disabled":""}>💡 Add a vowel</button></div>`}`}
function drawOrder(){const s=S.st,ws=s.it.ws;
  const line=ws.map((w,i)=>i<s.done?`<span class="wu-tl in">${E(w)}</span>`:'<span class="wu-tl gap"></span>').join("");
  const tiles=s.tiles.map((t,i)=>`<button class="wu-tl ${t.used?"used":""} ${s.bad===i?"bad":""}" data-t="${i}" ${t.used||s.shown?"disabled":""}>${E(t.w)}</button>`).join("");
  return `<div class="wu-line">${line}</div>${s.shown?`<p class="wu-ok">✔ ${E(ws.join(" "))}</p>`:`<div class="wu-tiles">${tiles}</div>`}${s.miss?`<p class="wu-sm">${s.miss} wrong ${s.miss===1?"try":"tries"}</p>`:""}`}
function drawSpot(){const s=S.st,ws=s.it.ws;
  const t=ws.map((w,i)=>{const bad=inWrong(i),cls=s.shown&&bad?"bad":s.pick===i&&!bad?"miss":"";return `<button class="wu-sw ${cls}" data-w="${i}" ${s.shown?"disabled":""}>${E(w.replace(/[\u0001\u0002]/g,""))}</button>`}).join("");
  return `<div class="wu-sent">${t}</div>${s.shown?`<p class="wu-ok">✔ ${E(s.it.ok)}</p><p class="wu-sm">Not <s>${E(s.it.w)}</s> but <b>${E(s.it.a)}</b></p>`:s.pick>=0?'<p class="wu-no">That one is fine. Try again!</p>':""}`}

const CSS=`
#el-wu{position:fixed;inset:0;z-index:2147483000;background:radial-gradient(120% 90% at 50% 0%,#24316b 0%,#121a3d 55%,#0b1029 100%);color:#f5f7ff;font:500 clamp(16px,1.25vw + 6px,30px)/1.3 Fredoka,system-ui,sans-serif;display:flex;flex-direction:column;overflow:auto}
#el-wu *{box-sizing:border-box}#el-wu h2{margin:0;font-size:1.5em;font-weight:700}#el-wu p{margin:0}
#el-wu .wu-top{display:flex;align-items:center;gap:.6em;flex-wrap:wrap;padding:.5em 1em;background:rgba(0,0,0,.25)}
#el-wu .wu-tabs{display:flex;gap:.35em;flex-wrap:wrap;flex:1;justify-content:center}
#el-wu .wu-t{font:600 .7em Fredoka,system-ui,sans-serif;color:#c9d2f5;background:transparent;border:1px solid rgba(255,255,255,.25);border-radius:999px;padding:.3em .8em;cursor:pointer}
#el-wu .wu-t.on{background:#ffc93c;color:#2a1d00;border-color:#ffc93c}
#el-wu .wu-c{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.55em;padding:.6em 1.2em 1em;text-align:center}
#el-wu .wu-head{display:flex;align-items:center;gap:.6em;text-align:left}#el-wu .wu-head p{opacity:.8;font-size:.8em}
#el-wu .wu-em{font-size:2.2em}#el-wu .wu-n{margin-left:1em;background:rgba(255,255,255,.12);border-radius:999px;padding:.2em .7em;font-weight:700}
#el-wu .wu-b{font:700 .85em Fredoka,system-ui,sans-serif;border:0;border-radius:.6em;padding:.45em 1em;cursor:pointer;background:#fff;color:#1b2350;box-shadow:0 .15em 0 rgba(0,0,0,.3)}
#el-wu .wu-b.go{background:#22c55e;color:#fff}#el-wu .wu-b.ghost{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.4);box-shadow:none}
#el-wu .wu-b:disabled{opacity:.4;cursor:default}
#el-wu button:focus-visible{outline:3px solid #ffc93c;outline-offset:2px}
#el-wu .wu-row{display:flex;gap:.6em;justify-content:center;flex-wrap:wrap}
#el-wu .wu-word{display:flex;flex-wrap:wrap;justify-content:center;gap:.25em;font-size:1.9em;font-weight:700;text-transform:uppercase}
#el-wu .wu-l{width:1.1em;height:1.35em;border-bottom:.12em solid #ffc93c;display:grid;place-items:center}
#el-wu .wu-l.lost{color:#ff8a8a}#el-wu .wu-l.cons{color:#cfd7ff;border-bottom-color:transparent;width:auto;min-width:.8em}#el-wu .wu-sp{width:.8em}#el-wu .wu-p{align-self:end}
#el-wu .wu-clue{max-width:34em;font-size:1em;color:#dfe5ff;background:rgba(255,255,255,.08);border-radius:.6em;padding:.5em .9em}
#el-wu .wu-lights{display:flex;gap:.4em}
#el-wu .wu-bulb{width:1.1em;height:1.1em;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fff7c2,#ffc93c 55%,#e08a00);box-shadow:0 0 .7em #ffc93c;transition:all .3s}
#el-wu .wu-bulb.off{background:#2b3360;box-shadow:none}
#el-wu .wu-kb{display:grid;gap:.3em}#el-wu .wu-kr{display:flex;gap:.3em;justify-content:center}
#el-wu .wu-k{font:700 1em Fredoka,system-ui,sans-serif;width:1.9em;height:1.9em;border-radius:.4em;border:0;background:#e9edff;color:#1b2350;cursor:pointer;box-shadow:0 .12em 0 rgba(0,0,0,.35)}
#el-wu .wu-k.ok{background:#22c55e;color:#fff}#el-wu .wu-k.no{background:#3a4275;color:#8b93c2;text-decoration:line-through}#el-wu .wu-k:disabled{cursor:default}
#el-wu .wu-ok{color:#7cf0a4;font-weight:700;font-size:1.1em}#el-wu .wu-no{color:#ffb4b4;font-weight:600}#el-wu .wu-sm{opacity:.75;font-size:.8em}
#el-wu .wu-line,#el-wu .wu-tiles{display:flex;flex-wrap:wrap;gap:.35em;justify-content:center;max-width:40em}
#el-wu .wu-sent{display:flex;flex-wrap:wrap;gap:.05em .1em;justify-content:center;max-width:36em}#el-wu .wu-line{min-height:2em}
#el-wu .wu-tl{font:600 1.05em Fredoka,system-ui,sans-serif;border:0;border-radius:.45em;padding:.25em .6em;background:#fff;color:#1b2350;cursor:pointer;box-shadow:0 .12em 0 rgba(0,0,0,.35)}
#el-wu .wu-tl.gap{width:2.6em;height:1.6em;background:transparent;border:2px dashed rgba(255,255,255,.3);box-shadow:none}
#el-wu .wu-tl.in{background:#22c55e;color:#fff;cursor:default}#el-wu .wu-tl.used{visibility:hidden}
#el-wu .wu-tl.bad{background:#ff8a8a;animation:wuShake .35s}
#el-wu .wu-sw{font:600 1.25em Fredoka,system-ui,sans-serif;border:0;border-radius:.35em;padding:.1em .3em;background:transparent;color:#fff;cursor:pointer}
#el-wu .wu-sw:hover:not(:disabled){background:rgba(255,255,255,.12)}#el-wu .wu-sw.bad{background:#ef4444;text-decoration:line-through}#el-wu .wu-sw.miss{background:rgba(255,255,255,.15);animation:wuShake .35s}
#el-wu .wu-end{display:grid;gap:.6em;justify-items:center}#el-wu .wu-big{font-size:3em}
#el-wu .wu-say{display:grid;justify-items:center;gap:.2em;max-width:40em;padding:.2em 1em .5em;border-bottom:1px solid rgba(255,255,255,.15);margin-bottom:.2em}
#el-wu .wu-sl{font-size:.6em;letter-spacing:.12em;text-transform:uppercase;color:#ffc93c;font-weight:700}
#el-wu .wu-say q{font-size:1.45em;font-weight:600;font-style:italic;quotes:"“" "”"}#el-wu .wu-sm2{font-size:.8em;color:#dfe5ff}#el-wu .wu-sm2 i{color:#ffc93c}
#el-wu .wu-msg{opacity:.85}
@keyframes wuShake{25%{transform:translateX(-.2em)}75%{transform:translateX(.2em)}}
@media (prefers-reduced-motion:reduce){#el-wu *{animation:none!important;transition:none!important}}`;
