// 🕵️ Code Breakers hacker avatars (Roger, 13 Nov 2026: "as students play hacker games they win badges, armour and features, so they have
// an avatar that transforms over the games; they must see their avatar in a place where it doesn't hide anything" + "they get better stuff
// if they get better results"). Our own art, drawn in SVG here. Shared by the board (codebreakers.html, cb-host.js: it alone gives the
// rewards) and the player (play.html, cb-play.js: draws them, and the 👕 locker in the lobby).
// - Rank (the armour): XP over all rounds. XP = right answers × 10 × how well (≥90 % ×2, ≥75 % ×1.5, ≥50 % ×1, below ×0.5) + top 3
//   +30/+20/+10. Nobody ever loses XP. A round counts from 3 answers (as the class game results).
// - The crate at the end of each round (better results, better stuff): below 50 % right a visor colour, 50–74 % an armour paint,
//   75–89 % a pet, 90 % or more (10+ answers) an effect. Beating their own best % (5+ answers) = one crate better. New things first;
//   when a crate has nothing new left, +50 XP. The new thing is put on at once (they change it in the 👕 locker).
// - Badges: see BADGES.
// cbAv/{email} = {group, xp, n (rounds), best (best %), it:{v:[], p:[], pt:[], fx:[]} (what they own), on:{v, p, pt, fx} (what they wear),
//   b:{badge: 1}, hk (hacks that worked, all rounds), bl (hacks their firewall stopped), at}, written only by the board (one batch at the end
//   of a round); the board reads the group's at the start, each student reads their own once per round. The live game shows each player's
//   look as pl[pid].hv = {r, v, p, pt, fx} and, at the end, what each one won as cb.rw[pid].
// window.ELCBAV:
//   RANKS, SLOTS, ITEMS, BADGES, TIERS
//   rankOf(xp)                  1–10
//   look(doc, wear, animal)     {r, v, p, pt, fx, a}: what they wear (only things they own)
//   svg(look, {size, mini})     the hacker (mini = head and shoulders, for the top bar and the lists)
//   award(doc, round)           → {doc (the new cbAv), rw (what they won)} or null when the round doesn't count
(function(){
const RANKS=[
 {n:"Rookie",xp:0},{n:"Script Kid",xp:150},{n:"Coder",xp:400},{n:"Hacker",xp:750},{n:"Netrunner",xp:1200},
 {n:"Cyber Knight",xp:1800},{n:"Firewall Guardian",xp:2600},{n:"Elite",xp:3600},{n:"Shadow Master",xp:4800},{n:"Code Legend",xp:6500}];
const VISORS={green:"#38f28a",cyan:"#22d3ee",pink:"#f472b6",orange:"#fb923c",violet:"#a78bfa",red:"#f87171",yellow:"#facc15",white:"#f1f5f9"};
const PAINTS={steel:"#3b5568",midnight:"#1e2a5a",crimson:"#9f1239",jungle:"#166534",ice:"#0e7490",violet:"#6d28d9",sunset:"#c2410c",graphite:"#3f3f46"};
const PETS={drone:"Drone",orb:"Data orb",bot:"Mini bot",star:"Star bot",ghost:"Byte ghost"};
const FXS={glow:"Neon glow",rain:"Code rain",bolt:"Lightning",rings:"Orbit rings"};
// slot: [key, name, items, tier]
const SLOTS=[["v","Visor",VISORS,0],["p","Armour paint",PAINTS,1],["pt","Pet",PETS,2],["fx","Effect",FXS,3]];
const ITEMS={v:VISORS,p:PAINTS,pt:PETS,fx:FXS};
const ICON={drone:"🛸",orb:"🔵",bot:"🤖",star:"⭐",ghost:"👻",glow:"✨",rain:"🟩",bolt:"⚡",rings:"🪐"};
const TIERS=[{n:"Common",c:"#9ca3af",e:"🧰"},{n:"Rare",c:"#38bdf8",e:"💠"},{n:"Epic",c:"#c084fc",e:"🔮"},{n:"Legendary",c:"#fbbf24",e:"👑"}];
const BADGES={
  sharp:["🎯","Sharp shooter","90 % right or more in a round (5+ answers)"],
  fire:["🔥","On fire","8 right answers in a row"],
  hack1:["🔓","First hack","Crack a password"],
  hack10:["🕸️","Master hacker","10 hacks that worked"],
  wall:["🛡️","Wall","Your firewall stops 3 hacks"],
  podium:["🏆","Podium","Top 3 in a round"],
  best:["📈","Better than ever","Beat your own best %"],
  regular:["🗓️","Regular","Play 5 rounds"],
  perfect:["💯","Perfect","Every answer right (10 or more)"]};
const rankOf=xp=>{let r=1;RANKS.forEach((k,i)=>{if((+xp||0)>=k.xp)r=i+1});return r};
const own=(doc,s,k)=>s==="v"&&k==="green"||!!(doc&&doc.it&&Array.isArray(doc.it[s])&&doc.it[s].includes(k));
function look(doc,wear,animal){doc=doc||{};const on=Object.assign({},doc.on||{}),o={r:rankOf(doc.xp),a:animal||"🦊"};
  if(wear)Object.keys(ITEMS).forEach(s=>{if(s in wear){const k=String(wear[s]||"");if(!k||own(doc,s,k))on[s]=k}});
  Object.keys(ITEMS).forEach(s=>{const k=on[s];o[s]=k&&ITEMS[s][k]&&own(doc,s,k)?k:s==="v"?"green":""});return o}

const lighten=(h,a)=>{const n=parseInt(h.slice(1),16),r=n>>16,g=n>>8&255,b=n&255,f=x=>Math.round(a>0?x+(255-x)*a:x*(1+a));return `rgb(${f(r)},${f(g)},${f(b)})`};
let uid=0;
function svg(o,opt){o=o||{};opt=opt||{};
  const r=Math.max(1,Math.min(10,+o.r||1)),v=VISORS[o.v]||VISORS.green,gold=r>=10,paint=gold?"#b7791f":(PAINTS[o.p]||(r>=4?PAINTS.steel:"#4b5563"));
  const p2=lighten(paint,.25),pd=lighten(paint,-.35),trim=gold?"#fde68a":v,id="cbh"+(++uid),s=[];
  s.push(`<defs><radialGradient id="${id}a"><stop offset="0" stop-color="${v}" stop-opacity=".55"/><stop offset="1" stop-color="${v}" stop-opacity="0"/></radialGradient><linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p2}"/><stop offset="1" stop-color="${paint}"/></linearGradient></defs>`);
  if(o.fx==="glow"||r>=7)s.push(`<circle cx="60" cy="78" r="${o.fx==="glow"?62:52}" fill="url(#${id}a)"/>`);
  if(o.fx==="rain")for(let i=0;i<9;i++){const x=8+i*13;s.push(`<g fill="${v}" opacity="${.25+.06*(i%3)}" font-family="monospace" font-size="9">${[0,1,2,3,4].map(k=>`<text x="${x}" y="${10+((i*17+k*16)%120)}">${"01"[(i+k)%2]}</text>`).join("")}</g>`)}
  if(o.fx==="bolt")s.push(`<g fill="none" stroke="${v}" stroke-width="2.5" stroke-linejoin="round" opacity=".9"><path d="M14 30 L24 48 L16 50 L28 72"/><path d="M106 24 L96 44 L104 46 L92 70"/></g>`);
  if(o.fx==="rings")s.push(`<g fill="none" stroke="${v}" stroke-width="1.6" opacity=".7"><ellipse cx="60" cy="80" rx="54" ry="14" transform="rotate(-14 60 80)"/><ellipse cx="60" cy="80" rx="50" ry="10" transform="rotate(18 60 80)"/></g><circle cx="10" cy="90" r="3" fill="${v}"/><circle cx="110" cy="64" r="3" fill="${v}"/>`);
  if(r>=9)s.push(`<g fill="${v}" opacity=".85">${[0,1,2,3].map(k=>`<rect x="${-6+k*2}" y="${60+k*9}" width="${30-k*5}" height="5" rx="2.5" transform="rotate(${-24+k*8} 34 76)"/><rect x="${96-k*2-(30-k*5)+30}" y="${60+k*9}" width="${30-k*5}" height="5" rx="2.5" transform="rotate(${24-k*8} 86 76)"/>`).join("")}</g>`);
  if(r>=8)s.push(`<path d="M36 70 Q60 64 84 70 L96 128 Q60 136 24 128 Z" fill="${gold?"#7c2d12":pd}" stroke="${trim}" stroke-width="1.5" opacity=".95"/>`);
  if(r<=3)s.push(`<circle cx="60" cy="44" r="29" fill="${paint}"/><path d="M33 52 Q60 78 87 52 L84 70 Q60 76 36 70 Z" fill="${paint}"/>`);
  const leg=r>=6?paint:"#1f2937";
  s.push(`<rect x="44" y="108" width="13" height="24" rx="5" fill="${leg}"/><rect x="63" y="108" width="13" height="24" rx="5" fill="${leg}"/>`);
  if(r>=6)s.push(`<rect x="44" y="118" width="13" height="4" fill="${trim}" opacity=".8"/><rect x="63" y="118" width="13" height="4" fill="${trim}" opacity=".8"/>`);
  s.push(`<rect x="41" y="128" width="17" height="7" rx="3.5" fill="#0b1220"/><rect x="62" y="128" width="17" height="7" rx="3.5" fill="#0b1220"/>`);
  const arm=r>=6?`url(#${id}b)`:paint,hand=r>=6?pd:"#e5c3a3";
  s.push(`<rect x="24" y="70" width="14" height="40" rx="7" fill="${arm}"/><rect x="82" y="70" width="14" height="40" rx="7" fill="${arm}"/><circle cx="31" cy="110" r="6" fill="${hand}"/><circle cx="89" cy="110" r="6" fill="${hand}"/>`);
  s.push(`<path d="M37 70 Q60 62 83 70 L86 114 Q60 120 34 114 Z" fill="${r>=4?`url(#${id}b)`:paint}"/>`);
  if(r<=3)s.push(`<path d="M60 68 L60 116" stroke="${r>=2?v:"#9ca3af"}" stroke-width="2" opacity=".9"/><path d="M42 98 Q60 104 78 98 L78 108 Q60 113 42 108 Z" fill="${pd}" opacity=".6"/>`);
  if(r===3)s.push(`<path d="M40 74 L52 72 L52 112 L40 110 Z M80 74 L68 72 L68 112 L80 110 Z" fill="#111827" opacity=".75"/><rect x="42" y="88" width="8" height="7" rx="1.5" fill="${v}" opacity=".5"/><rect x="70" y="88" width="8" height="7" rx="1.5" fill="${v}" opacity=".5"/>`);
  if(r>=4)s.push(`<path d="M44 74 L76 74 L72 100 L60 106 L48 100 Z" fill="${p2}" stroke="${trim}" stroke-width="1.6"/>`);
  if(r>=5)s.push(`<g stroke="${v}" stroke-width="1.4" fill="none" opacity=".85"><path d="M38 104 L48 104 L52 110"/><path d="M82 104 L72 104 L68 110"/></g><circle cx="52" cy="110" r="1.6" fill="${v}"/><circle cx="68" cy="110" r="1.6" fill="${v}"/>`);
  s.push(`<text x="60" y="${r>=4?94:92}" font-size="${r>=4?15:13}" text-anchor="middle">${String(o.a||"🦊").replace(/[<>&"]/g,"")}</text>`);
  if(r>=5)s.push(`<ellipse cx="32" cy="72" rx="12" ry="9" fill="${p2}" stroke="${trim}" stroke-width="1.6"/><ellipse cx="88" cy="72" rx="12" ry="9" fill="${p2}" stroke="${trim}" stroke-width="1.6"/>`);
  if(r>=4)s.push(`<circle cx="60" cy="44" r="24" fill="url(#${id}b)" stroke="${trim}" stroke-width="1.6"/><path d="M60 20 L60 32" stroke="${trim}" stroke-width="3" stroke-linecap="round"/>`);
  else s.push(`<circle cx="60" cy="46" r="21" fill="#0f172a"/>`);
  if(r>=3)s.push(`<rect x="${r>=4?39:42}" y="38" width="${r>=4?42:36}" height="13" rx="6.5" fill="${v}"/><rect x="${r>=4?43:46}" y="40" width="10" height="3" rx="1.5" fill="#fff" opacity=".7"/>`);
  else s.push(`<circle cx="52" cy="46" r="3.6" fill="${v}"/><circle cx="68" cy="46" r="3.6" fill="${v}"/><path d="M54 56 Q60 59 66 56" stroke="${v}" stroke-width="2" fill="none" stroke-linecap="round"/>`);
  if(r>=4)s.push(`<rect x="46" y="54" width="28" height="7" rx="3.5" fill="${pd}"/>`);
  if(r===2||r===3)s.push(`<path d="M34 44 Q34 14 60 14 Q86 14 86 44" stroke="#111827" stroke-width="4" fill="none"/><rect x="29" y="38" width="9" height="16" rx="4" fill="${v}"/><rect x="82" y="38" width="9" height="16" rx="4" fill="${v}"/>`);
  if(r>=8)s.push(`<path d="M60 8 Q74 14 70 30 L60 24 L50 30 Q46 14 60 8 Z" fill="${trim}"/>`);
  if(r>=10)s.push(`<ellipse cx="60" cy="10" rx="20" ry="5" fill="none" stroke="#fde047" stroke-width="3"/>`);
  if(r<=5)s.push(`<rect x="40" y="98" width="40" height="16" rx="3" fill="#1f2937" stroke="${r>=2?v:"#6b7280"}" stroke-width="1.5"/><rect x="44" y="101" width="32" height="2" fill="${v}" opacity=".8"/><rect x="44" y="105" width="20" height="2" fill="${v}" opacity=".5"/>`);
  if(r>=6)s.push(`<g transform="rotate(-28 92 108)"><rect x="89" y="58" width="6" height="50" rx="3" fill="${v}"/><rect x="90.5" y="60" width="2" height="44" fill="#fff" opacity=".7"/><rect x="84" y="106" width="16" height="5" rx="2" fill="${pd}"/><rect x="89" y="110" width="6" height="10" rx="2" fill="#111827"/></g>`);
  if(r>=7)s.push(`<path d="M22 86 L32 80 L42 86 L42 100 L32 108 L22 100 Z" fill="${pd}" stroke="${trim}" stroke-width="2"/><path d="M32 86 L36 92 L32 100 L28 92 Z" fill="${v}"/>`);
  if(!opt.mini){
    if(o.pt==="drone")s.push(`<g transform="translate(100 22)"><ellipse cx="0" cy="4" rx="10" ry="6" fill="#334155" stroke="${v}" stroke-width="1.5"/><circle cx="0" cy="4" r="2.5" fill="${v}"/><path d="M-14 -3 L-4 -3 M4 -3 L14 -3" stroke="#cbd5e1" stroke-width="2"/><path d="M-9 -3 L-6 1 M9 -3 L6 1" stroke="#64748b" stroke-width="1.5"/></g>`);
    if(o.pt==="orb")s.push(`<g transform="translate(102 24)"><circle r="8" fill="${v}" opacity=".85"/><circle r="12" fill="none" stroke="${v}" stroke-width="1.2" opacity=".6"/><circle cx="-2.5" cy="-2.5" r="2.5" fill="#fff" opacity=".8"/></g>`);
    if(o.pt==="bot")s.push(`<g transform="translate(101 20)"><rect x="-9" y="-7" width="18" height="14" rx="4" fill="#cbd5e1"/><circle cx="-3.5" cy="0" r="2" fill="#0f172a"/><circle cx="3.5" cy="0" r="2" fill="#0f172a"/><path d="M0 -7 L0 -12" stroke="#cbd5e1" stroke-width="1.5"/><circle cx="0" cy="-13" r="2" fill="${v}"/><rect x="-6" y="8" width="12" height="5" rx="2" fill="#94a3b8"/></g>`);
    if(o.pt==="star")s.push(`<g transform="translate(101 22)"><path d="M0 -12 L3.5 -4 L12 -3.5 L5.5 2 L7.5 10.5 L0 6 L-7.5 10.5 L-5.5 2 L-12 -3.5 L-3.5 -4 Z" fill="#facc15" stroke="#fff7" stroke-width="1"/><circle cx="-2.5" cy="0" r="1.4" fill="#0f172a"/><circle cx="2.5" cy="0" r="1.4" fill="#0f172a"/></g>`);
    if(o.pt==="ghost")s.push(`<g transform="translate(101 22)" opacity=".92"><path d="M-9 10 L-9 -2 Q-9 -12 0 -12 Q9 -12 9 -2 L9 10 L5 7 L2 10 L-2 7 L-5 10 Z" fill="#f1f5f9"/><rect x="-5" y="-5" width="3" height="4" rx="1.5" fill="${v}"/><rect x="2" y="-5" width="3" height="4" rx="1.5" fill="${v}"/></g>`);
  }
  const sz=opt.size||160,rn=RANKS[r-1].n;
  return opt.mini?`<svg class="cbav mini" viewBox="22 4 76 76" width="${sz}" height="${sz}" role="img" aria-label="${rn}">${s.join("")}</svg>`
    :`<svg class="cbav" viewBox="0 -2 120 142" width="${sz}" height="${Math.round(sz*142/120)}" role="img" aria-label="${rn}">${s.join("")}</svg>`}

// one student's round → the new cbAv doc and what they won; round = {n, r, place, players, bs (best run of right answers), hk (hacks that
// worked this round), bl (hacks their firewall stopped this round), group, rnd (a random 0–1 function, for tests)}
function award(doc,R){doc=doc||{};const n=+R.n||0,r=+R.r||0;if(n<3)return null;const rnd=R.rnd||Math.random;
  const p=Math.round(r/n*100),mult=p>=90?2:p>=75?1.5:p>=50?1:.5,bonus=(+R.players||0)>=3?([30,20,10][(+R.place||0)-1]||0):0;
  const rounds=+doc.n||0,best=+doc.best||0,beat=rounds>0&&n>=5&&p>best;
  let xp=Math.round(r*10*mult)+bonus;
  const base=p>=90&&n>=10?3:p>=75?2:p>=50?1:0,t=Math.min(3,base+(beat?1:0));
  const it={};Object.keys(ITEMS).forEach(s=>it[s]=Array.isArray(doc.it&&doc.it[s])?doc.it[s].slice():[]);if(!it.v.includes("green"))it.v.unshift("green");
  const on=Object.assign({v:"green"},doc.on||{});
  // the crate: something new from its slot, else from a lower one; nothing new left → +50 XP
  let got=null;for(let k=t;k>=0&&!got;k--){const s=SLOTS[k][0],free=Object.keys(ITEMS[s]).filter(x=>!it[s].includes(x));if(free.length){const x=free[Math.floor(rnd()*free.length)];it[s].push(x);on[s]=x;got={s,k:x}}}
  if(!got)xp+=50;
  const b=Object.assign({},doc.b||{}),nb=[],add=k=>{if(!b[k]){b[k]=1;nb.push(k)}};
  const hk=(+doc.hk||0)+(+R.hk||0),bl=(+doc.bl||0)+(+R.bl||0);
  if(p>=90&&n>=5)add("sharp");if((+R.bs||0)>=8)add("fire");if(hk>=1)add("hack1");if(hk>=10)add("hack10");if(bl>=3)add("wall");
  if(bonus)add("podium");if(beat)add("best");if(rounds+1>=5)add("regular");if(p===100&&n>=10)add("perfect");
  const x0=+doc.xp||0,x1=x0+xp;
  const nd={xp:x1,n:rounds+1,best:n>=5?Math.max(best,p):best,it,on,b,hk,bl};if(R.group)nd.group=R.group;
  return {doc:nd,rw:{x:xp,p,m:mult,bo:bonus,t,up:base<t,g:got,nb,xp:x1,r0:rankOf(x0),r1:rankOf(x1)}}}

window.ELCBAV={RANKS,SLOTS,ITEMS,ICON,TIERS,BADGES,rankOf,look,svg,award,own};
})();
