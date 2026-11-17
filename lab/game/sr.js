// 🚀 Space rescue (Roger, 17 Nov 2026: "Space rescue for the grammar and vocabulary games", a third choice next to 🎮 Quiz and 🕵️ Code
// Breakers): the same round as Code Breakers (the same questions, each student at their own pace, the same results and marks: cb.js,
// cb-host.js, cb-play.js with live/{group}.cb.th = "sr"), with another story and no hacking. A right answer opens one of 3 cargo pods:
// ⛽ fuel, 🛢️ a big tank, 🚀 turbo or ☄️ a meteor (loses a little fuel). The fuel flies the student's rocket from Earth to planet after
// planet: each planet reached rescues the astronaut stranded there, and a planet once reached stays rescued (cb.rs). The oxygen is the
// round's time (the teacher's minutes, + 2 min = more oxygen). Only the % right counts for marks, as in Code Breakers.
// window.ELSR:
//   PLANETS                 the stops, in fuel from Earth
//   reached(fuel)           how many planets that fuel reaches
//   next(fuel)              the next planet (or null after the last one)
//   pod(n, r, fuel)         one cargo pod's content after n right answers ({k, n}); no meteor under 60 fuel
//   POD_LOOK                {k: [emoji, name]}
//   rocket(animal, opts)    the rocket (SVG) with the student's animal at the window; opts {size, flame, cls}
//   planet(p, size)         a planet (SVG)
//   pos(fuel), stop(i)      where that fuel / planet i is on the journey map, in % (one equal step per planet)
//   way(fuel, rs)           the journey strip of a student: Earth, the planets, their rocket
(function(){
const PLANETS=[
  {n:"Moon",at:40,c:"#e2e8f0",d:"#94a3b8"},{n:"Mars",at:120,c:"#f87171",d:"#b91c1c"},{n:"Jupiter",at:260,c:"#fdba74",d:"#c2410c",band:1},
  {n:"Saturn",at:450,c:"#fde68a",d:"#ca8a04",ring:1},{n:"Uranus",at:700,c:"#a5f3fc",d:"#0891b2"},{n:"Neptune",at:1000,c:"#93c5fd",d:"#1d4ed8"},
  {n:"Pluto",at:1400,c:"#ddd6fe",d:"#7c3aed"},{n:"Planet X",at:2000,c:"#f9a8d4",d:"#be185d",ring:1}];
const reached=f=>PLANETS.filter(p=>(+f||0)>=p.at).length;
const next=f=>PLANETS.find(p=>(+f||0)<p.at)||null;
const PODS=[["fuel",62],["tank",22],["turbo",8],["meteor",8]];
const POD_LOOK={fuel:["⛽","Fuel"],tank:["🛢️","Big tank"],turbo:["🚀","Turbo"],meteor:["☄️","Meteor"]};
const r5=x=>Math.max(5,Math.round(x/5)*5);
function pod(n,r,fuel){r=r||Math.random;const w=PODS.filter(p=>fuel>=60||p[0]!=="meteor"),tot=w.reduce((t,p)=>t+p[1],0);let x=r()*tot,k="fuel";
  for(const p of w){if((x-=p[1])<0){k=p[0];break}}
  const b=10+2*Math.min(+n||0,40);
  return k==="meteor"?{k,n:r5(fuel*.15)}:{k,n:r5(b*(k==="turbo"?4:k==="tank"?2.5:[1,1,1.5][Math.floor(r()*3)]))}}
let uid=0;
function rocket(a,o){o=o||{};const s=o.size||60,id="sr"+(++uid);
  return `<svg class="srrk${o.cls?" "+o.cls:""}" viewBox="0 0 100 100" width="${s}" height="${s}" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="#cbd5e1"/><stop offset=".45" stop-color="#fff"/><stop offset="1" stop-color="#94a3b8"/></linearGradient></defs>
    ${o.flame?`<g class="srfl"><path d="M38 80 Q50 112 62 80 Z" fill="#f97316"/><path d="M43 80 Q50 100 57 80 Z" fill="#fde047"/></g>`:""}
    <path d="M34 62 L18 80 L20 86 L36 76 Z" fill="#ef4444"/><path d="M66 62 L82 80 L80 86 L64 76 Z" fill="#ef4444"/>
    <path d="M50 4 C70 18 70 52 66 80 L34 80 C30 52 30 18 50 4 Z" fill="url(#${id})" stroke="#64748b" stroke-width="1.5"/>
    <path d="M50 4 C59 10 64 18 66 26 L34 26 C36 18 41 10 50 4 Z" fill="#ef4444"/><rect x="40" y="78" width="20" height="6" rx="2" fill="#475569"/>
    <circle cx="50" cy="46" r="14" fill="#0c4a6e" stroke="#475569" stroke-width="3"/><text x="50" y="47" text-anchor="middle" dominant-baseline="central" font-size="17">${a||"🧑‍🚀"}</text></svg>`}
function planet(p,s){s=s||40;const id="sp"+(++uid);
  const ring=w=>`<ellipse cx="20" cy="20" rx="19" ry="5.5" fill="none" stroke="${p.c}" stroke-width="2.4" opacity=".9"${w?` clip-path="url(#${id}c)"`:""}/>`;
  return `<svg class="srpl" viewBox="0 0 40 40" width="${s}" height="${s}" aria-hidden="true"><defs><radialGradient id="${id}" cx=".35" cy=".35" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".25" stop-color="${p.c}"/><stop offset="1" stop-color="${p.d}"/></radialGradient>
    <clipPath id="${id}c"><rect x="0" y="20" width="40" height="20"/></clipPath></defs><g transform="rotate(-18 20 20)">
    ${p.ring?ring():""}<circle cx="20" cy="20" r="${p.ring?11:14}" fill="url(#${id})"/>${p.band?`<path d="M8 16 H32 M7 23 H33" stroke="${p.d}" stroke-width="2" opacity=".5"/>`:""}${p.ring?ring(1):""}</g></svg>`}
const EARTH={n:"Earth",c:"#86efac",d:"#1d4ed8"};
// the journey of one student: Earth on the left, then the planets, their rocket between the last planet reached and the next one
// where some fuel is on a journey map, in % (Earth = 0, then one equal step per planet: the same map on the board and the Chromebooks)
const SLOT=100/(PLANETS.length+1),stop=i=>(i+1)*SLOT;
function pos(f){f=Math.max(0,+f||0);const k=reached(f);if(k>=PLANETS.length)return Math.min(100,stop(k-1)+SLOT*Math.min(1,(f-PLANETS[k-1].at)/1000));
  const pv=k?PLANETS[k-1].at:0;return (k+(f-pv)/(PLANETS[k].at-pv))*SLOT}
function way(f,rs){f=+f||0;const k=Math.max(reached(f),+rs||0),slot=SLOT,pos_=pos(f);
  return `<div class="srway" aria-label="${k} planets reached"><span class="srline"><i style="width:${pos_}%"></i></span>
    <span class="srstop e" style="left:0">${planet(EARTH,22)}</span>
    ${PLANETS.map((p,i)=>`<span class="srstop${i<k?" ok":""}" style="left:${(i+1)*slot}%" title="${p.n}">${planet(p,22)}${i<k?'<b class="srsaved">🧑‍🚀</b>':""}</span>`).join("")}
    <span class="srme" style="left:${pos_}%">${rocket("",{size:26,cls:"tilt"})}</span></div>`}
window.ELSR={PLANETS,reached,next,pod,POD_LOOK,rocket,planet,way,pos,stop,EARTH};
})();
