// 🔥 Warm-up game at the start of every class (Roger, 13 Nov 2026: "I'd like to start every class with a mini game like ahorcado with the
// grammar and vocabulary of the unit", "but not always ahorcado", "they say letters and I press them so I don't even have to know the
// answer", "so the class mode the game appears automatically"). A full-screen board over the class tab when class mode starts (el-cloud.js
// cmTeacher, once per class mode), and again from 🔥 Warm-up in 📋 Today. Whole class, on the projector only: the students call out and the
// teacher taps; nothing is written or read in Firestore, no marks, the students' Chromebooks stay where they are.
// The words and sentences are the class games' (lab/game/decks/<id>.js, + decks/more/<id>.js) of today's learning paths (el-cm-agenda.js
// warmDecks). Four games take turns, a different one each class for the group (localStorage el_wu, this browser): 🔤 Hangman (a word from
// the vocabulary, its sentence as the clue, a letter keyboard; the hangman is drawn in 8 parts), 🔀 Word order (a sentence in shuffled tiles: tap them in
// order, a wrong tile shakes), 🕵️ Spot the mistake (a sentence with a wrong form: tap the wrong word), 🅰 No vowels (a word without its
// vowels; 💡 adds one). Three rounds; the teacher never needs to know the answer (👁 Show answer is there anyway).
// 📓 Drawn like the student's notebook and in two slides (Roger, 14 Nov 2026: "I want the initial games and saying to have the same
// style, and the saying must be bigger, and then the next slide the games section"): first 💬 the saying of the day, big, on a taped slip
// over lined paper; Space, → or 🔥 Warm-up game → goes on to the game, drawn on the same paper (el-notebook.css: post-its, slips, the
// teacher's handwriting). Opened again in the same class mode, it goes straight back to the game (💬 in the top bar shows the saying).
const E=t=>String(t==null?"":t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
const plain=t=>String(t||"").replace(/\*\*/g,"").replace(/\s+/g," ").trim();
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const GAMES=[
  {id:"hang",name:"Hangman",em:"🔤",how:"Call out a letter. Eight wrong letters and the man is hanged."},
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
    if(!document.querySelector('link[href*="el-notebook.css"]')){const f=document.createElement("link");f.rel="stylesheet";f.href=new URL("shared/css/el-notebook.css?v=20261114w",root).href;document.head.append(f)}}
  box=document.createElement("div");box.id="el-wu";box.setAttribute("role","dialog");box.setAttribute("aria-label","Warm-up game");box.className="notranslate";box.translate=false;
  box.innerHTML='<div class="wu-c"><p class="wu-msg">Getting the warm-up ready…</p></div>';box.onclick=click;document.body.append(box);
  keyH=e=>{if(!box||!S||e.ctrlKey||e.metaKey||e.altKey)return;if(e.key==="Escape"){close();return}
    if(S.view==="say"){if(e.key===" "||e.key==="ArrowRight"||e.key==="Enter"||e.key==="PageDown"){e.preventDefault();toGame()}return}
    if(S.game==="hang"&&/^[a-z]$/i.test(e.key)){e.preventDefault();guess(e.key.toLowerCase())}};
  document.addEventListener("keydown",keyH,true);
  const pool=await loadPool(o.decks||[]).catch(()=>[]);
  const cur=curGet(o.s);
  if(cur&&GAMES.some(x=>x.id===cur.game)&&Array.isArray(cur.items)&&cur.items.length){S={o,say:sayOfDay(o),sayOpen:false,view:"game",pool,game:cur.game,round:Math.min(+cur.round||0,cur.items.length),items:cur.items,st:null};newRound();return}
  const game=nextGame(o.g,pool);
  S={o,say:sayOfDay(o),sayOpen:false,view:"say",pool,game,round:0,items:[],st:null};
  if(game){S.items=shuf(itemsFor(game,pool)).slice(0,ROUNDS);remember(o.g,game)}
  draw()}
export function close(){if(box){box.remove();box=null}if(keyH)document.removeEventListener("keydown",keyH,true);keyH=null;S=null}
export const isOpen=()=>!!box;

function start(id){S.game=id;S.round=0;S.items=shuf(itemsFor(id,S.pool)).slice(0,ROUNDS);remember(S.o.g,id);newRound()}
// from the saying to the game (or, with no game for today, the class)
function toGame(){if(!S.game){close();return}S.view="game";if(!S.st)newRound();else draw()}
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
  if(b.dataset.tosay){S.view="say";return draw()}
  if(b.dataset.togame)return toGame();
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

function draw(){if(!box||!S)return;if(S.view==="say")return drawSay();const g=GAMES.find(x=>x.id===S.game),n=S.items.length,end=S.round>=n;
  const tabs=GAMES.filter(x=>itemsFor(x.id,S.pool).length).map(x=>`<button class="wu-t ${x.id===S.game?"on":""}" data-g="${x.id}" title="Play ${E(x.name)} instead">${x.em} ${E(x.name)}</button>`).join("");
  let body="";
  if(end)body=`<div class="wu-end"><div class="wu-big">🎉</div><h2>Warm-up done!</h2><p>${E(S.o.title||"")}</p><div class="wu-row"><button class="wu-b" data-again="1">↻ Play again</button><button class="wu-b go" data-x="1">▶ Start the class</button></div></div>`;
  else if(S.game==="hang")body=drawHang();else if(S.game==="vow")body=drawVow();else if(S.game==="order")body=drawOrder();else body=drawSpot();
  const done=!end&&S.st&&S.st.shown;
  box.innerHTML=`<div class="wu-top"><b>🔥 Warm-up · ${E(S.o.gname||S.o.g)}</b>${S.say?`<button class="wu-t" data-tosay="1" title="Show the saying of the day again">💬 Saying</button>`:""}<span class="wu-tabs">${tabs}</span><button class="wu-b ghost" data-x="1" title="Close the warm-up (Esc)">▶ Start the class</button></div>
  <div class="wu-c">${end?"":`<div class="wu-head"><span class="nb-postit k-other">${g.em} ${E(g.name)}</span><p>${E(g.how)}</p><span class="wu-n">${S.round+1} / ${n}</span></div>`}${body}
  ${end?"":`<div class="wu-row wu-foot">${done?`<button class="wu-b go" data-next="1">${S.round+1<n?"Next →":"Finish 🎉"}</button>`:`<button class="wu-b ghost" data-show="1" title="Show the answer on the screen">👁 Show answer</button>`}</div>`}</div>`}
// 💬 the first slide: the saying of the day, big, on a taped slip; 💡 its meaning and the Catalan saying underneath
function drawSay(){const y=S.say||["","",""],g=GAMES.find(x=>x.id===S.game);
  box.innerHTML=`<div class="wu-top"><b>💬 Saying of the day · ${E(S.o.gname||S.o.g)}</b><span class="wu-tabs"></span><button class="wu-b ghost" data-x="1" title="Close the warm-up (Esc)">▶ Start the class</button></div>
  <div class="wu-c wu-sayc"><span class="nb-postit k-read">💬 Saying of the day</span>
    <div class="nb-slip wu-bigsay"><q>${E(y[0])}</q></div>
    ${S.sayOpen?`<p class="wu-mean">${E(y[1])}</p>${y[2]?`<p class="wu-cat"><small>En català:</small> ${E(y[2])}</p>`:""}`:""}
    <div class="wu-row"><button class="wu-b" data-say="1">${S.sayOpen?"Hide the meaning":"💡 What does it mean?"}</button>
    <button class="wu-b go" data-togame="1">${g?`${g.em} Warm-up game: ${E(g.name)} →`:"▶ Start the class"}</button></div>
    <p class="wu-sm">Space or →: ${g?"the game":"start the class"}</p></div>`}
function drawHang(){const s=S.st,w=s.it.w,lost=s.miss.length>=LIVES,won=hangWon();
  const slots=w.split("").map(c=>/[a-z]/i.test(c)?`<span class="wu-l ${s.got.has(c.toLowerCase())?"on":""} ${lost&&!s.got.has(c.toLowerCase())?"lost":""}">${s.got.has(c.toLowerCase())||lost?E(c):""}</span>`:c===" "?'<span class="wu-sp"></span>':`<span class="wu-p">${E(c)}</span>`).join("");
  // the hangman, drawn part by part (Roger, 13 Nov 2026: "it's a hangman but I don't see a hangman"): one part per wrong letter, the
  // parts still to come faint so the class sees how many tries are left
  const P=['<line x1="8" y1="132" x2="72" y2="132"/>','<line x1="28" y1="132" x2="28" y2="8"/>','<line x1="28" y1="8" x2="86" y2="8"/><line x1="28" y1="28" x2="48" y2="8"/>',
    '<line x1="86" y1="8" x2="86" y2="26"/>','<circle cx="86" cy="38" r="12"/>','<line x1="86" y1="50" x2="86" y2="90"/>','<line x1="86" y1="62" x2="70" y2="78"/><line x1="86" y1="62" x2="102" y2="78"/>',
    '<line x1="86" y1="90" x2="72" y2="114"/><line x1="86" y1="90" x2="100" y2="114"/>'];
  const man=`<svg class="wu-man ${lost?"dead":won?"saved":""}" viewBox="0 0 110 140" aria-label="${LIVES-s.miss.length} wrong letters left">${P.map((x,i)=>`<g class="${i<s.miss.length?"on":"todo"}">${x}</g>`).join("")}</svg>`;
  const kb=["qwertyuiop","asdfghjkl","zxcvbnm"].map(r=>`<div class="wu-kr">${r.split("").map(c=>`<button class="wu-k ${s.got.has(c)?"ok":s.miss.includes(c)?"no":""}" data-k="${c}" ${s.got.has(c)||s.miss.includes(c)||s.shown?"disabled":""}>${c.toUpperCase()}</button>`).join("")}</div>`).join("");
  return `<div class="wu-hang">${man}<div class="wu-hr"><div class="wu-word">${slots}</div>
    <p class="wu-clue">${s.it.img?`<span>${E(s.it.img)}</span> `:""}${E(s.it.c)}</p><p class="wu-sm">${s.miss.length?"✗ "+s.miss.map(c=>c.toUpperCase()).join(" "):""}</p></div></div>
    ${won?'<p class="wu-ok">✔ Well done!</p>':lost?`<p class="wu-no">Hanged! It was <b>${E(w)}</b>.</p>`:""}
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
#el-wu{position:fixed;inset:0;z-index:2147483000;color:var(--nb-black,#23262b);font:400 clamp(16px,1.25vw + 6px,30px)/1.35 var(--nb-teacher,"Kalam",cursive);display:flex;flex-direction:column;overflow:auto;
  background:linear-gradient(90deg,transparent 3.4em,var(--nb-margin,#ef9a9a) 3.4em calc(3.4em + 2px),transparent calc(3.4em + 2px)),repeating-linear-gradient(transparent 0 1.6em,var(--nb-line,#c7d9ee) 1.6em calc(1.6em + 1px)) var(--nb-paper,#fffef8);background-attachment:local}
#el-wu *{box-sizing:border-box}#el-wu h2{margin:0;font:700 1.6em/1.2 var(--nb-hand);color:var(--nb-pencil)}#el-wu p{margin:0}
#el-wu .wu-top{display:flex;align-items:center;gap:.6em;flex-wrap:wrap;padding:.45em 1em;background:#f1ecd9;border-bottom:1px solid #e0d8bd;font-family:system-ui,sans-serif;font-size:.8em}
#el-wu .wu-tabs{display:flex;gap:.35em;flex-wrap:wrap;flex:1;justify-content:center}
#el-wu .wu-t{font:600 .85em system-ui,sans-serif;color:#4b5563;background:#fff;border:1px solid #d6cfb6;border-radius:999px;padding:.3em .8em;cursor:pointer}
#el-wu .wu-t.on{background:#ffe082;color:#2b2b2b;border-color:#e8c65a}
#el-wu .wu-c{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.6em;padding:.6em 1.2em 1em 4.2em;text-align:center}
#el-wu .wu-head{display:flex;align-items:center;gap:.8em;flex-wrap:wrap;justify-content:center;text-align:left}#el-wu .wu-head p{color:var(--nb-pencil);font-size:.9em}
#el-wu .wu-head .nb-postit{margin:0;font-size:1.3em;line-height:1.3}
#el-wu .wu-n{background:#fff;border:1.5px solid #333;border-radius:999px;padding:.05em .7em;font-weight:700;font-size:.9em;transform:rotate(-2deg)}
#el-wu .wu-b{font:700 .8em system-ui,sans-serif;border:2px solid #333;border-radius:.5em;padding:.45em 1em;cursor:pointer;background:#fff;color:#23262b;box-shadow:2px 3px 0 rgba(0,0,0,.18)}
#el-wu .wu-b.go{background:#2e7d32;border-color:#2e7d32;color:#fff}#el-wu .wu-b.ghost{background:transparent;color:#23262b;border:1px solid #b9b19a;box-shadow:none}
#el-wu .wu-b:disabled{opacity:.4;cursor:default}
#el-wu button:focus-visible{outline:3px solid #f5b400;outline-offset:2px}
#el-wu .wu-row{display:flex;gap:.6em;justify-content:center;flex-wrap:wrap}
#el-wu .wu-word{display:flex;flex-wrap:wrap;justify-content:center;gap:.25em;font:700 2.1em var(--nb-hand);text-transform:uppercase;color:var(--nb-ink)}
#el-wu .wu-l{width:1.05em;height:1.3em;border-bottom:.08em solid #23262b;display:grid;place-items:center}
#el-wu .wu-l.lost{color:var(--nb-red)}#el-wu .wu-l.cons{color:#23262b;border-bottom-color:transparent;width:auto;min-width:.7em}#el-wu .wu-sp{width:.8em}#el-wu .wu-p{align-self:end}
#el-wu .wu-clue{position:relative;max-width:34em;font-size:1em;color:#222;background:#fff;padding:.6em 1.1em .5em;box-shadow:0 2px 5px rgba(0,0,0,.14);transform:rotate(-.5deg);margin-top:.5em}
#el-wu .wu-clue::before,#el-wu .wu-clue::after{content:"";position:absolute;top:-.45em;width:2.6em;height:.85em;background:rgba(232,220,180,.78)}#el-wu .wu-clue::before{left:.7em;transform:rotate(-5deg)}#el-wu .wu-clue::after{right:.7em;transform:rotate(4deg)}
#el-wu .wu-hang{display:flex;align-items:center;justify-content:center;gap:1.4em;flex-wrap:wrap;max-width:52em}
#el-wu .wu-hr{display:grid;gap:.5em;justify-items:center;min-width:0;flex:1 1 20em}
#el-wu .wu-man{width:6.5em;height:auto;flex:none;fill:none;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
#el-wu .wu-man .todo{stroke:rgba(0,0,0,.07)}#el-wu .wu-man .on{stroke:#23262b}#el-wu .wu-man.dead .on{stroke:var(--nb-red)}#el-wu .wu-man.saved .on{stroke:var(--nb-green)}
#el-wu .wu-kb{display:grid;gap:.3em}#el-wu .wu-kr{display:flex;gap:.3em;justify-content:center}
#el-wu .wu-k{font:700 1em var(--nb-teacher);width:1.9em;height:1.9em;border-radius:.3em;border:1.5px solid #333;background:#fff;color:#23262b;cursor:pointer;box-shadow:1px 2px 0 rgba(0,0,0,.15)}
#el-wu .wu-k.ok{background:#b9f6ca;border-color:var(--nb-green);color:#14532d}#el-wu .wu-k.no{background:#f1efe6;color:#b5b0a0;border-color:#cfc9b5;text-decoration:line-through;text-decoration-color:var(--nb-red)}#el-wu .wu-k:disabled{cursor:default}
#el-wu .wu-ok{color:var(--nb-green);font-weight:700;font-size:1.15em}#el-wu .wu-no{color:var(--nb-red);font-weight:700}#el-wu .wu-sm{color:var(--nb-pencil);font-size:.8em}
#el-wu .wu-line,#el-wu .wu-tiles{display:flex;flex-wrap:wrap;gap:.4em;justify-content:center;max-width:40em}
#el-wu .wu-sent{position:relative;display:flex;flex-wrap:wrap;gap:.05em .1em;justify-content:center;max-width:36em;background:#fff;padding:.7em 1.2em .6em;box-shadow:0 2px 5px rgba(0,0,0,.14);transform:rotate(-.4deg);margin:.4em 0}#el-wu .wu-sent::before,#el-wu .wu-sent::after{content:"";position:absolute;top:-.45em;width:2.6em;height:.85em;background:rgba(232,220,180,.78)}#el-wu .wu-sent::before{left:.7em;transform:rotate(-5deg)}#el-wu .wu-sent::after{right:.7em;transform:rotate(4deg)}#el-wu .wu-line{min-height:2em}
#el-wu .wu-tl{font:700 1.1em var(--nb-teacher);border:1.5px solid #333;border-radius:.2em;padding:.15em .6em;background:#fff;color:#23262b;cursor:pointer;box-shadow:1px 2px 0 rgba(0,0,0,.15)}
#el-wu .wu-tl:nth-child(odd){transform:rotate(-1deg)}#el-wu .wu-tl:nth-child(even){transform:rotate(1deg)}
#el-wu .wu-tl.gap{width:2.6em;height:1.6em;background:transparent;border:2px dashed #b9b19a;box-shadow:none}
#el-wu .wu-tl.in{background:#b9f6ca;border-color:var(--nb-green);cursor:default}#el-wu .wu-tl.used{visibility:hidden}
#el-wu .wu-tl.bad{background:#ffcdd2;border-color:var(--nb-red);animation:wuShake .35s}
#el-wu .wu-sw{font:400 1.6em var(--nb-teacher);border:0;border-radius:.6em .25em .7em .3em;padding:.05em .25em;background:transparent;color:#23262b;cursor:pointer}
#el-wu .wu-sw:hover:not(:disabled){background:var(--nb-hl-y)}#el-wu .wu-sw.bad{color:var(--nb-red);text-decoration:line-through;text-decoration-thickness:.08em;border:2.2px solid var(--nb-red);border-radius:50% 45% 55% 48%/60% 50% 55% 45%}#el-wu .wu-sw.miss{background:#eceae2;animation:wuShake .35s}
#el-wu .wu-end{display:grid;gap:.6em;justify-items:center}#el-wu .wu-big{font-size:3em}#el-wu .wu-end p{color:var(--nb-pencil)}
#el-wu .wu-sayc{gap:.8em}#el-wu .wu-sayc>.nb-postit{margin:0 0 .2em;font-size:1.4em;line-height:1.3}
#el-wu .wu-bigsay{margin:.6em 0 .2em;padding:.9em 1.4em .8em;max-width:min(30em,92%);font:700 3em/1.25 var(--nb-teacher);color:#23262b;transform:rotate(-.6deg)}
#el-wu .wu-bigsay q{quotes:"“" "”"}
#el-wu .wu-mean{font:400 1.45em/1.3 var(--nb-teacher);color:#23262b;max-width:34em}
#el-wu .wu-cat{font:700 1.35em/1.3 var(--nb-hand);color:var(--nb-ink)}#el-wu .wu-cat small{font:600 .6em system-ui,sans-serif;color:var(--nb-pencil);margin-right:.3em}
#el-wu .wu-msg{color:var(--nb-pencil)}
@media (max-width:700px){#el-wu .wu-c{padding-left:1.2em}#el-wu{background:var(--nb-paper,#fffef8)}#el-wu .wu-bigsay{font-size:2em}}
@keyframes wuShake{25%{translate:-.2em 0}75%{translate:.2em 0}}
@media (prefers-reduced-motion:reduce){#el-wu *{animation:none!important;transition:none!important}}`;
