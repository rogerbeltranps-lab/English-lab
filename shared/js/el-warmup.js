// 🔥 Warm-up game at the start of every class (Roger, 13 Nov 2026: "I'd like to start every class with a mini game like ahorcado with the
// grammar and vocabulary of the unit", "but not always ahorcado", "they say letters and I press them so I don't even have to know the
// answer", "so the class mode the game appears automatically"). A full-screen board over the class tab when class mode starts (el-cloud.js
// cmTeacher, once per class mode), and again from 🔥 Warm-up in 📋 Today. Whole class, on the projector only: the students call out and the
// teacher taps; nothing is written or read in Firestore, no marks, the students' Chromebooks stay where they are.
// The words and sentences are the class games' (lab/game/decks/<id>.js, + decks/more/<id>.js) of today's learning paths (el-cm-agenda.js
// warmDecks). Four games take turns, a different one each class for the group (localStorage el_wu, this browser): 🔤 Hangman (a word from
// the vocabulary, a letter keyboard; the hangman is drawn in 8 parts; its sentence is hidden at first, see clueHang), 🔀 Word order (a sentence in shuffled tiles: tap them in
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
// top of the warm-up, the same all day for the group, from the LS's topic first, else the general list;
// 💡 What does it mean? shows a simple meaning and the Catalan saying when there is one. Proverbs only (no quotes put in anyone's mouth).
// Never the same as the group's last classes (Roger, 18 Nov 2026, 4 ESO B: "the saying was the same as yesterday": a hash of the day could
// pick the same one two classes in a row): the sayings go round in a fixed order, one step per calendar day (two days one of the LS's topic,
// then a general one), each group starting at its own place: the same saying comes back after 9 days at the soonest.
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
// sayFor(group, class game ids, "YYYY-MM-DD"): the saying of that day; the teacher's 📅 Time plan shows it on each class day (teacher.html wuRow)
export function sayFor(g,decks,day){const pre=String((decks||[])[0]||"").split("-").slice(0,2).join("-"),top=SAY_TOPIC[pre]||[],gen=SAY_GEN;
  const d=day||new Date().toLocaleDateString("en-CA",{timeZone:"Europe/Madrid"}),n=Math.round(Date.parse(d+"T12:00:00Z")/864e5)+hash(g)%997,at=(l,k)=>l[k%l.length];
  if(!top.length)return at(gen,n);
  return n%3?at(top,n-Math.floor(n/3)):at(gen,Math.floor(n/3))}   // two days of the topic's, then a general one
const sayOfDay=o=>sayFor(o.g,o.decks);

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
    if(!document.querySelector('link[href*="el-notebook.css"]')){const f=document.createElement("link");f.rel="stylesheet";f.href=new URL("shared/css/el-notebook.css?v=20261120a",root).href;document.head.append(f)}}
  box=document.createElement("div");box.id="el-wu";box.setAttribute("role","dialog");box.setAttribute("aria-label","Warm-up game");box.className="notranslate";box.translate=false;
  box.innerHTML='<div class="wu-c"><p class="wu-msg">Getting the warm-up ready…</p></div>';box.onclick=click;document.body.append(box);
  keyH=e=>{if(!box||!S||e.ctrlKey||e.metaKey||e.altKey)return;if(e.key==="Escape"){close();return}
    if(S.view==="say"){if(e.key===" "||e.key==="ArrowRight"||e.key==="Enter"||e.key==="PageDown"){e.preventDefault();toGame()}return}
    if(S.view==="rem"){if(e.key===" "||e.key==="ArrowRight"||e.key==="Enter"||e.key==="PageDown"){e.preventDefault();close()}return}
    if(S.game==="hang"&&/^[a-z]$/i.test(e.key)){e.preventDefault();guess(e.key.toLowerCase())}};
  document.addEventListener("keydown",keyH,true);
  if(o.only==="rem"){S={o,view:"rem",pool:[],game:null,round:0,items:[],st:null};return toRem()}
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
  if(S.game==="hang")S.st={it,got:new Set(),miss:[],shown:false,cl:0};
  if(S.game==="vow")S.st={it,hint:0,shown:false};
  if(S.game==="order"){let t=it.ws.map((w,i)=>({w,i}));for(let k=0;k<6;k++){t=shuf(t);if(t.some((x,j)=>x.i!==j))break}S.st={it,tiles:t,done:0,bad:-1,shown:false,miss:0}}
  if(S.game==="spot")S.st={it,pick:-1,shown:false,tries:0};
  draw()}
const letters=w=>w.toLowerCase().replace(/[^a-z]/g,"").split("");
function hangWon(){const s=S.st;return letters(s.it.w).every(c=>s.got.has(c))}
function guess(c){const s=S.st;if(!s||s.shown||s.got.has(c)||s.miss.includes(c)||s.miss.length>=LIVES||hangWon())return;
  if(letters(s.it.w).includes(c))s.got.add(c);else s.miss.push(c);if(hangWon()||s.miss.length>=LIVES)s.shown=true;draw()}

function click(e){const b=e.target.closest("button");if(!b||!S&&!b.dataset.x)return;
  if(b.dataset.x)return S&&S.view!=="rem"&&(S.o.onRace||S.o.onRemind)&&!remDone(S.o.s)?toRem():close();
  if(b.dataset.race){const f=S&&S.o.onRace;close();if(f)f({fin:true});return}
  if(b.dataset.say){S.sayOpen=!S.sayOpen;return draw()}
  if(b.dataset.tosay){S.view="say";return draw()}
  if(b.dataset.togame)return toGame();
  if(b.dataset.g)return start(b.dataset.g);
  if(b.dataset.k)return guess(b.dataset.k);
  if(b.dataset.next){S.round++;return newRound()}
  if(b.dataset.again)return start(S.game);
  if(b.dataset.show){S.st.shown=true;if(S.game==="hang")letters(S.st.it.w).forEach(c=>S.st.got.add(c));if(S.game==="order")S.st.done=S.st.it.ws.length;return draw()}
  if(b.dataset.cl&&S.game==="hang"){S.st.cl=Math.max(S.st.cl||0,+b.dataset.cl);return draw()}
  if(b.dataset.hint&&S.game==="vow"){S.st.hint++;return draw()}
  if(b.dataset.t!=null&&S.game==="order"){const s=S.st,t=s.tiles[+b.dataset.t];if(t.used||s.shown)return;
    if(t.w===s.it.ws[s.done]){t.used=true;s.done++;s.bad=-1;if(s.done>=s.it.ws.length)s.shown=true}else{s.bad=+b.dataset.t;s.miss++}return draw()}
  if(b.dataset.w!=null&&S.game==="spot"){const s=S.st;if(s.shown)return;s.pick=+b.dataset.w;s.tries++;if(/\u0001/.test(s.it.ws[s.pick])||/\u0002/.test(s.it.ws[s.pick])||inWrong(s.pick))s.shown=true;return draw()}}
// the words of the wrong form (it can be more than one word: "is celebrate")
function inWrong(i){const ws=S.st.it.ws;let on=false;for(let k=0;k<=i;k++){if(/\u0001/.test(ws[k]))on=true;if(k===i)return on;if(/\u0002/.test(ws[k]))on=false}return false}

function draw(){if(!box||!S)return;if(S.view==="say")return drawSay();if(S.view==="rem")return drawRem();const g=GAMES.find(x=>x.id===S.game),n=S.items.length,end=S.round>=n;
  const tabs=GAMES.filter(x=>itemsFor(x.id,S.pool).length).map(x=>`<button class="wu-t ${x.id===S.game?"on":""}" data-g="${x.id}" title="Play ${E(x.name)} instead">${x.em} ${E(x.name)}</button>`).join("");
  let body="";
  if(end)body=`<div class="wu-end"><div class="wu-big">🎉</div><h2>Warm-up done!</h2><p>${E(S.o.title||"")}</p><div class="wu-row"><button class="wu-b" data-again="1">↻ Play again</button><button class="wu-b go" data-x="1">${S.o.onRace&&!remDone(S.o.s)?"⛵ Who's winning the race? →":"▶ Start the class"}</button></div></div>`;
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
    ${clueHang(s,lost||won)}<p class="wu-sm">${s.miss.length?"✗ "+s.miss.map(c=>c.toUpperCase()).join(" "):""}</p></div></div>
    ${won?'<p class="wu-ok">✔ Well done!</p>':lost?`<p class="wu-no">Hanged! It was <b>${E(w)}</b>.</p>`:""}
    <div class="wu-kb">${kb}</div>`}
// 💡 The sentence is hidden at first (Roger, 17 Nov 2026: "the hangman is easy because students can guess it super fast with the
// sentence … if they are clueless I show them half of the sentence, or the entire sentence"): the round starts with no sentence and no
// picture; ½ Half the sentence shows the first half of its words (the rest as blank lines, the gap always there), 📝 The whole sentence
// shows it all with its picture. Once the word is found, the class is hanged or 👁 Show answer, the whole sentence shows anyway.
function clueHang(s,end){const c=s.it.c,cl=end||s.shown?2:(s.cl||0);
  const bt=(n,t,tip)=>`<button class="wu-b" data-cl="${n}" title="${tip}">${t}</button>`;
  if(cl>=2)return `<p class="wu-clue">${s.it.img?`<span>${E(s.it.img)}</span> `:""}${E(c)}</p>`;
  if(cl===1){const ws=c.split(" "),gi=ws.findIndex(w=>/_{3,}/.test(w)),n=Math.ceil(ws.length/2);
    const t=ws.map((w,i)=>i<n||i===gi?E(w):`<span class="wu-hid" style="width:${Math.max(1.2,w.length*.42).toFixed(2)}em"></span>`).join(" ");
    return `<p class="wu-clue">${t}</p><div class="wu-row wu-cl">${bt(2,"📝 The whole sentence","Show the whole sentence and its picture")}</div>`}
  return `<div class="wu-row wu-cl"><span class="wu-sm">💡 Stuck?</span>${bt(1,"½ Half the sentence","Show the first half of the sentence")}${bt(2,"📝 The whole sentence","Show the whole sentence and its picture")}</div>`}
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

// ✅ Finish all your activities (Roger, 21 Nov 2026: "At the beginning of the class, after the games, I want the students to see something
// like this [the dashboard's Work done in each learning path]. I want to remind them that they need to do all the activities. I also want
// them to see what activities they need to do"; then "on the right, I also want to see this [🧭 Your steps] with the percentage of students
// who've done them"). The last slide, once per class mode: ▶ Start the class (or the end of the game) brings it up instead of closing,
// and o.onRemind() then shows every student their own list on their screen (el-cm-agenda.js remind → el-cloud.js cmRemind → el-todo.js
// remind). The numbers are the dashboard's copy in this browser (teacher.html remSave, localStorage el_rem_<group>): what the group did in
// class before today or has as homework; the share of students per step; never a name. No copy (or one over 12 hours old): the message only.
// Courses with the race map never get this slide: toRem opens the map instead (below).
const REM_K="el_wu_rem";
const remDone=s=>{try{return !!s&&sessionStorage.getItem(REM_K)===String(s)}catch(e){return false}};
// ⛵ In the courses with the race map (o.onRace) the games lead straight to it (Roger, 21 Nov 2026: "we are repeating the info"; he chose
// the students' own ✅ card on the website, and in class once the map closes): no slide here, the map says "Finish all your activities!"
// on top, students see 👀 Look at the screen, then their own card when the map closes (el-cm-agenda.js mapClose). Once per class mode.
function toRem(){if(S.o.onRace){try{sessionStorage.setItem(REM_K,String(S.o.s))}catch(e){}const f=S.o.onRace;close();f({fin:true});return}
  S.view="rem";if(!remDone(S.o.s)){try{sessionStorage.setItem(REM_K,String(S.o.s))}catch(e){}try{const r=S.o.onRemind&&S.o.onRemind();if(r&&r.catch)r.catch(e=>console.warn("finish reminder",e))}catch(e){console.warn("finish reminder",e)}}draw()}
function remData(g){try{const d=JSON.parse(localStorage.getItem("el_rem_"+g)||"null");return d&&d.g===g&&Date.now()-d.at<12*36e5?d:null}catch(e){return null}}
const pcCol=p=>window.elPctCol?elPctCol(p):p==null?"#cbd5e1":p<50?"#dc2626":p<60?"#ea580c":p<80?"#16a34a":p<90?"#2563eb":"#8b5cf6";
function drawRem(){const d=remData(S.o.g),hm=t=>new Date(t).toTimeString().slice(0,5);
  const lps=d&&d.lps.length?d.lps.map(z=>`<li><span class="rn">${E(z.lab)}</span><span class="rb"><i style="width:${z.pc||0}%;background:${pcCol(z.pc)}"></i></span><b>${z.pc??0} %</b><small>${z.fin}/${d.N} finished</small></li>`).join(""):"";
  const steps=d&&d.steps.length?d.steps.map(x=>x.port?`<li class="rp">${E(x.port)}</li>`:`<li class="rs"><span class="rt"><small style="color:${E(x.sk.c)}">${E(x.sk.n)}</small>${E(x.t)}</span><span class="rb sm"><i style="width:${x.pc||0}%;background:${pcCol(x.pc)}"></i></span><b>${x.pc??0} %</b></li>`).join(""):"";
  box.innerHTML=`<div class="wu-top"><b>✅ Before we start · ${E(S.o.gname||S.o.g)}</b><span class="wu-tabs"></span><button class="wu-b go" data-x="1" title="Close and start the class (Esc)">▶ Start the class</button></div>
  <div class="wu-c wu-remc"><div class="wu-remhd"><span class="nb-postit k-other">✅ Every activity counts</span>
    <div class="nb-slip wu-remsay">Finish all your activities!</div></div>
    <p class="wu-remsub">👀 Look at your screen: it shows what <u>you</u> still have to do.</p>
    ${lps||steps?`<div class="wu-rem">${lps?`<div class="wu-rcol"><h3>Work done in each learning path</h3><ul class="wu-rl">${lps}</ul></div>`:""}${steps?`<div class="wu-rcol"><h3>🧭 Our steps <small>· students who did each one</small></h3><ul class="wu-rsl">${steps}</ul></div>`:""}</div>
    <p class="wu-sm wu-remft">${E(d.ls)} · what we did in class before today and homework · ${d.N} students · updated ${hm(d.at)}</p>`:""}
    <div class="wu-row"><button class="wu-b go" data-x="1">▶ Start the class</button></div></div>`}

const CSS=`
#el-wu{position:fixed;inset:0;z-index:2147483000;color:var(--nb-black,#23262b);font:400 clamp(18px,1.75vw + 8px,44px)/1.35 var(--nb-teacher,"Kalam",cursive);display:flex;flex-direction:column;overflow:auto;
  background:linear-gradient(90deg,transparent 2.8em,var(--nb-margin,#ef9a9a) 2.8em calc(2.8em + 2px),transparent calc(2.8em + 2px)),repeating-linear-gradient(transparent 0 1.6em,var(--nb-line,#c7d9ee) 1.6em calc(1.6em + 1px)) var(--nb-paper,#fffef8);background-attachment:local}
#el-wu *{box-sizing:border-box}#el-wu h2{margin:0;font:700 1.6em/1.2 var(--nb-hand);color:var(--nb-pencil)}#el-wu p{margin:0}
#el-wu .wu-top{display:flex;align-items:center;gap:.6em;flex-wrap:wrap;padding:.45em 1em;background:#f1ecd9;border-bottom:1px solid #e0d8bd;font-family:system-ui,sans-serif;font-size:clamp(14px,.7vw + 8px,22px)}
#el-wu .wu-tabs{display:flex;gap:.35em;flex-wrap:wrap;flex:1;justify-content:center}
#el-wu .wu-t{font:600 .85em system-ui,sans-serif;color:#4b5563;background:#fff;border:1px solid #d6cfb6;border-radius:999px;padding:.3em .8em;cursor:pointer}
#el-wu .wu-t.on{background:#ffe082;color:#2b2b2b;border-color:#e8c65a}
#el-wu .wu-c{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.5em;padding:.4em 1.2em .8em 3.6em;text-align:center}
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
#el-wu .wu-hid{display:inline-block;height:.9em;border-bottom:2px dotted #9e9784;vertical-align:baseline}
#el-wu .wu-cl{align-items:center;margin-top:.3em}#el-wu .wu-cl .wu-b{font-size:.7em}
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
#el-wu .wu-bigsay{margin:.5em 0 .1em;padding:.7em 1.3em .6em;max-width:min(30em,92%);font:700 2.7em/1.2 var(--nb-teacher);color:#23262b;transform:rotate(-.6deg)}
#el-wu .wu-bigsay q{quotes:"“" "”"}
#el-wu .wu-mean{font:400 1.45em/1.3 var(--nb-teacher);color:#23262b;max-width:34em}
#el-wu .wu-cat{font:700 1.35em/1.3 var(--nb-hand);color:var(--nb-ink)}#el-wu .wu-cat small{font:600 .6em system-ui,sans-serif;color:var(--nb-pencil);margin-right:.3em}
#el-wu .wu-msg{color:var(--nb-pencil)}
#el-wu .wu-remc{gap:.35em;justify-content:flex-start;padding-top:.5em}#el-wu .wu-remhd{display:flex;align-items:center;gap:.8em;flex-wrap:wrap;justify-content:center}
#el-wu .wu-remhd .nb-postit{margin:0;font-size:.9em;line-height:1.3}
#el-wu .wu-remsay{margin:.25em 0 0;padding:.3em 1em .25em;font:700 1.6em/1.15 var(--nb-teacher);color:#23262b;transform:rotate(-.6deg)}
#el-wu .wu-remsub{font:400 1em/1.3 var(--nb-teacher);color:#23262b}#el-wu .wu-remsub u{text-decoration-color:var(--nb-red,#e53935);text-decoration-thickness:.08em}
#el-wu .wu-rem{display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.5fr);align-items:start;gap:1em;width:min(64em,100%);text-align:left;font:400 clamp(13px,.55vw + 9px,22px)/1.3 system-ui,sans-serif;margin-top:.3em}
#el-wu .wu-rcol{background:#fff;border:1px solid #e0d8bd;border-radius:.7em;padding:.6em .9em;box-shadow:0 2px 5px rgba(0,0,0,.1);min-width:0}
#el-wu .wu-rcol h3{margin:0 0 .4em;font:800 .78em system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#64748b}#el-wu .wu-rcol h3 small{text-transform:none;letter-spacing:0;font-weight:600}
#el-wu .wu-rem ul{list-style:none;margin:0;padding:0}
#el-wu .wu-rl li{display:grid;grid-template-columns:minmax(0,1fr) 3.6em;grid-template-areas:"n n" "b p" "f f";row-gap:.2em;column-gap:.6em;align-items:center;gap:.6em;padding:.35em .4em;border-radius:.4em}#el-wu .wu-rl li:nth-child(odd){background:#f8fafc}
#el-wu .rn{grid-area:n;font-weight:600}#el-wu .wu-rl .rb{grid-area:b}#el-wu .wu-rl b{grid-area:p}#el-wu .wu-rl small{grid-area:f}#el-wu .wu-rem b{text-align:right;font-weight:800}#el-wu .wu-rl small{color:#64748b;font-size:.85em}
#el-wu .rb{height:.75em;border-radius:999px;background:#e2e8f0;overflow:hidden}#el-wu .rb i{display:block;height:100%;border-radius:999px;min-width:.35em}#el-wu .rb.sm{height:.55em}
#el-wu .wu-rsl{columns:2 15em;column-gap:1.2em}#el-wu .wu-rsl li{break-inside:avoid}#el-wu .wu-rsl li.rp{break-after:avoid;font-weight:700;color:#4a2f0e;padding:.45em .2em .15em;border-bottom:1px dashed #d9c294;margin-bottom:.15em}
#el-wu .wu-rsl li.rs{display:grid;grid-template-columns:minmax(0,1fr) 22% 3.2em;align-items:center;gap:.55em;padding:.25em .2em}
#el-wu .wu-remft{font:400 clamp(11px,.4vw + 8px,16px) system-ui,sans-serif}#el-wu .rt{min-width:0;font-size:.95em;line-height:1.2}#el-wu .rt small{display:block;font-size:.66em;font-weight:800;letter-spacing:.05em;text-transform:uppercase}
@media (max-width:700px){#el-wu .wu-rem{grid-template-columns:1fr}}
@media (max-width:700px){#el-wu .wu-c{padding-left:1.2em}#el-wu{background:var(--nb-paper,#fffef8)}#el-wu .wu-bigsay{font-size:2em}}
@keyframes wuShake{25%{translate:-.2em 0}75%{translate:.2em 0}}
@media (prefers-reduced-motion:reduce){#el-wu *{animation:none!important;transition:none!important}}`;
