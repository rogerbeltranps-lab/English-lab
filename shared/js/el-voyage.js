// ⛵ The voyage to the challenge on the student board (Roger, 19-20 Nov 2026: "students see only the SLPs I add, final product always
// last"; mockups v1-v15 in the project's road-preview folder). The current LS is a sea voyage: every tab of a learning path the teacher
// has opened is a stop (an island), each learning path reaches a port of the English voyages in real historical order (a flag, a 📜
// history fact and, in an LS about celebrations, a 🎉 celebration), and the final product is always the last port: Sydney Cove.
// Every student of the group is a boat, placed by the steps they have done (fewer steps = lower on the route); classmates show their first
// name, never a mark (Roger chose "All, with first names", 19 Nov 2026). On the right, 🧭 Your steps: the same stops as a list with ticks.
// Sounds: quiet background music on the map only (🎵 on/off, remembered in this browser), reward sounds for a step done, a port reached
// and the voyage complete. Every sound is off while the teacher's class mode is on (only the teacher's screen plays) and in the teacher's
// view of a student's board. Nothing is locked or "later": only what the teacher has opened.
// The board passes what it already has: elVoyage.html(V) draws the frame, elVoyage.wire(root, V) lays the map out at the width it gets.
// V = {ls, skin (the LS id: SKINS), beds:[{id, kind: lp|cp|fp|bonus, plants:[{key, id, name, href, st}]}], fp:{title, sub, href, done}, now, me:{n, s},
//      mates:[{n, s}], cont:{href, label}, store, save, en, quiet()}
(function(){
  const BASE=(()=>{try{return new URL("../",document.currentScript.src).href}catch(e){return "shared/"}})(),IMG=BASE+"img/voyage/",AUD=BASE+"audio/voyage/";
  const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  // the ports, in the real order of the voyages; fest = the celebration line and picture for an LS about celebrations
  const PORTS=[
    {f:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",c:"England",p:"Plymouth",y:1620,h:"The Mayflower leaves Plymouth for America.",fe:"Bonfire Night (5 November): bonfires and fireworks.",img:"port-england"},
    {f:"🇺🇸",c:"USA",p:"Plymouth, Massachusetts",y:1620,h:"102 passengers arrive after 66 days at sea.",fe:"Thanksgiving (fourth Thursday of November): a big family dinner.",img:"port-usa"},
    {f:"🇮🇳",c:"India",p:"Madras (Chennai)",y:1639,h:"The East India Company sets up a trading post.",fe:"Diwali: the festival of lights, in October or November.",img:"port-india"},
    {f:"🇯🇲",c:"Jamaica",p:"Port Royal",y:1655,h:"English ships take Jamaica from Spain, and Port Royal becomes a busy port.",fe:"Jonkonnu: a Christmas parade with drums, music and costumes.",img:"port-jamaica"},
    {f:"🇨🇦",c:"Canada",p:"Halifax",y:1749,h:"The British found Halifax with about 2,500 settlers.",fe:"Winter festivals: skating, snow and lights in the trees.",img:"port-canada"},
    {f:"🇸🇱",c:"Sierra Leone",p:"Freetown",y:1787,h:"About 400 settlers from London, many of them freed Black people, start a settlement here.",fe:"The Lantern Parade: big glowing lanterns through the streets.",img:"port-sierra-leone"}];
  const DEST={f:"🇦🇺",c:"Australia",p:"Sydney Cove",y:1788,h:"The First Fleet arrives with 11 ships.",fe:"New Year's Eve: fireworks over Sydney Harbour.",img:"port-australia"};
  // the port pictures and lines of each LS (a skin per LS id): fest = the 🎉 celebration lines; img = a picture per port, the 7th is the
  // destination (null = the plain island); fw = the pictures with fireworks that go off over them (same numbers). Gemini art made with
  // Roger (20 Nov 2026), cut out of its background, 320 px WebP.
  const SKINS={"4eso-seasons-and-celebrations":{fest:true,img:["port-england-bonfire","port-usa-fest","port-india-fest","port-jamaica-fest","port-canada-fest","port-sierra-leone-fest","port-australia-fest"],fw:[0,2,6]}};
  const skinOf=V=>SKINS[V.skin]||{},pimg=(V,i)=>(skinOf(V).img||[])[i]||(i<PORTS.length?PORTS[i].img:DEST.img),fest=V=>!!skinOf(V).fest,hasFw=(V,i)=>(skinOf(V).fw||[]).includes(i);
  // ✨ things that move (Roger, 20 Nov 2026: "turtles could swim, clouds could move, fireworks too"): the sea drifts, sea animals swim
  // to and fro and turn round, gulls glide, the fog drifts, fireworks go off over the pictures that have them. Only transforms (cheap on a
  // Chromebook), and nothing moves for "reduce motion".
  const FW=["#ffd54a","#ff6b6b","#4fc3f7","#81c784","#f48fb1","#fff"];
  const fwHtml=st=>`<span class="vy-fws" aria-hidden="true"${st?` style="${st}"`:""}>`+[[20,14,0],[56,6,.9],[82,18,1.7]].map(([x,y,d],b)=>`<b style="left:${x}%;top:${y}%;--dl:${d}s;--c:${FW[(b*2+1)%6]}">`
    +Array.from({length:10},(_,i)=>`<i style="--a:${i*36}deg"></i>`).join("")+`</b>`).join("")+`</span>`;
  // a decoration's movement, by what it is: [kind, faces right (1) or left (-1)]
  const MOVE=f=>/whale|turtle/.test(f)?["swim",1]:/dolphin/.test(f)?["swim",-1]:/seagull/.test(f)?["fly",1]:/compass/.test(f)?["sway",1]:null;
  // the skill of a stop, from the tab's type (EL_STEP_TITLES, built by tools/gen-sections.js) and its panel id
  const SK={Recall:["🧠","#6b7280"],Vocabulary:["🔤","#0f766e"],Grammar:["🧩","#b91c1c"],Listening:["🎧","#7e22ce"],Reading:["📖","#1d4ed8"],Research:["🔎","#0369a1"],
    Speaking:["🗣","#c2410c"],"Speaking · Shadowing":["🎙","#c2410c"],"Speaking · Talk":["📞","#c2410c"],Writing:["✍️","#15803d"],"Reading · Book":["📚","#1d4ed8"],Checkpoint:["🛡","#334155"],Step:["⭐","#8a5a1f"]};
  const CA={Vocabulary:"Vocabulari",Grammar:"Gramàtica",Writing:"Escriptura","Speaking · Talk":"Speaking · Conversa",Research:"Recerca",Step:"Pas"};
  const TT=(a,p)=>((window.EL_STEP_TITLES||{})[a]||{})[p]||null;
  function skill(aid,pid,kind){if(kind==="cp")return "Checkpoint";const ty=(TT(aid,pid)||[])[0]||"";
    if(ty==="recall"||/^recall/.test(pid))return "Recall";
    if(/^(vocab|words|cards|practice)/.test(pid)||ty==="vocab")return "Vocabulary";
    if(/^(grammar|mixed)/.test(pid))return "Grammar";
    if(pid==="shadow"||ty==="shadow")return "Speaking · Shadowing";
    if(pid==="talk"||ty==="talk")return "Speaking · Talk";
    if(/^speak/.test(pid)||ty==="speaking")return "Speaking";
    if(/^(write|card)/.test(pid)||ty==="writing")return "Writing";
    if(/^ch\d|^book/.test(pid))return "Reading · Book";
    if(/^(sources|respect|notes|credit)$/.test(pid))return "Research";
    if(/listen|again|chart/.test(pid))return "Listening";
    if(/read|log|register/.test(pid))return "Reading";
    return "Step"}
  const skName=(k,en)=>en?k:CA[k]||k;
  const title=(aid,p,en)=>{const x=TT(aid,p.id);return x&&((!en&&x[2])||x[1])||p.name||p.id};
  // the stops in order: a port for each learning path (cp, bonus and book paths are stops of the port they follow); the final product
  // is not a stop, it is the destination
  function model(V){const items=[],stops=[];let pi=-1;
    (V.beds||[]).filter(b=>b.kind!=="fp").forEach(b=>{
      const ps=(b.plants||[]).filter(p=>!p.later);if(!ps.length)return;
      if((b.kind==="lp"||pi<0)&&pi<PORTS.length-1){pi++;items.push({port:PORTS[pi],pi,keys:[]})}
      const port=items.filter(x=>x.port).pop();
      ps.forEach(p=>{const sk=skill(b.id,p.id,b.kind),s={key:p.key,href:p.href,done:p.st==="bloom",cp:b.kind==="cp",sk,t:title(b.id,p,V.en),pi,i:stops.length};
        port.keys.push(p.key);items.push(s);stops.push(s)})});
    items.filter(x=>x.port).forEach(x=>{x.done=x.keys.every(k=>stops.find(s=>s.key===k).done)});
    return {items,stops,ports:items.filter(x=>x.port),done:stops.filter(s=>s.done).length}}
  const hue=n=>[...String(n)].reduce((a,c)=>a+c.charCodeAt(0)*37,0)%360,col=n=>`hsl(${hue(n)} 60% 42%)`;
  const BOAT=(c,big)=>big?`<span class="vy-b big"><img src="${IMG}boat-me.webp" alt=""></span>`:`<span class="vy-b"><img src="${IMG}boat.webp" alt=""><i style="background:${c}"></i></span>`;

  // ---- sounds ----
  let saved=null;try{saved=localStorage.getItem("el_voyage_snd")}catch(e){}
  const SND={on:saved!=="0",MV:.3,music:null,sea:null,quiet:()=>false,dt:0,
    play(k,vol){if(!this.on||this.quiet())return;try{const a=new Audio(AUD+k+".mp3");a.volume=vol||.8;a.play().catch(()=>{});this.duck()}catch(e){}},
    duck(){const m=this.music;if(!m)return;clearTimeout(this.dt);m.volume=this.MV*.35;this.dt=setTimeout(()=>{if(this.music)this.music.volume=this.MV},1800)},
    startBg(){if(this.music||!this.on||this.quiet()||!document.querySelector(".vy-sea")||document.hidden)return;
      try{this.music=new Audio(AUD+"music.mp3");this.music.loop=true;this.music.volume=this.MV;this.music.play().catch(()=>{this.music=null});
        this.sea=new Audio(AUD+"sea-loop.wav");this.sea.loop=true;this.sea.volume=.15;this.sea.play().catch(()=>{})}catch(e){}},
    stopBg(){[this.music,this.sea].forEach(a=>{try{a&&a.pause()}catch(e){}});this.music=this.sea=null}};
  // the song starts with the first tap on the board (browsers allow sound only after one), and stops when the map is gone (another
  // place of the board), the tab is hidden or class mode starts
  addEventListener("pointerdown",()=>SND.startBg(),{capture:true});
  setInterval(()=>{if(SND.music&&(!document.querySelector(".vy-sea")||SND.quiet()||!SND.on))SND.stopBg()},1500);
  document.addEventListener("visibilitychange",()=>{if(document.hidden)SND.stopBg()});

  // ---- styles ----
  function css(){if(document.getElementById("vy-css"))return;const s=document.createElement("style");s.id="vy-css";s.textContent=`
.vy{margin:0 0 14px}.vy-row{display:flex;gap:14px;height:max(440px,calc(100vh - 250px))}
.vy-sea{position:relative;flex:1;min-width:0;border-radius:20px;overflow:hidden;border:3px solid #b08a52;background:#7fc0e3}
.vy-sea::before{content:"";position:absolute;top:0;bottom:0;left:0;right:-300px;background:linear-gradient(#ffffff38,#ffffff38),url(${IMG}sea.webp) 0 0/300px repeat;animation:vydrift 60s linear infinite}
@keyframes vydrift{to{translate:-300px 0}}
.vy-top{position:absolute;left:0;right:0;top:0;z-index:6;display:flex;justify-content:space-between;align-items:center;gap:8px;padding:9px 14px;background:linear-gradient(#f6ead0f2,#f6ead000);pointer-events:none}
.vy-top small{display:block;font-size:11px;color:#8a5a1f;text-transform:uppercase;letter-spacing:.06em;font-weight:800}.vy-top b{font:700 17px Georgia,serif;color:#4a2f0e}
.vy-sc{position:absolute;inset:0;overflow-y:auto;overflow-x:hidden;scrollbar-width:thin}.vy-map{position:relative}.vy-map>svg{position:absolute;left:0;top:0;pointer-events:none}
.vy-st{position:absolute;width:76px;height:76px;margin:-38px 0 0 -38px;background:url(${IMG}step.webp) center/contain no-repeat;display:grid;place-items:center;font-size:23px;padding-bottom:8px;z-index:2;text-decoration:none;border-radius:50%}
.vy-st.done{background-image:url(${IMG}step-done.webp);font-size:0}.vy-st.now{background-image:url(${IMG}step-now.webp);transform:scale(1.15)}
.vy-st:focus-visible{outline:3px solid #b45309}.vy-st.pop{animation:vypop .7s}@keyframes vypop{40%{transform:scale(1.4)}}
.vy-st.flash{animation:vyflash 1s ease 2}@keyframes vyflash{50%{filter:drop-shadow(0 0 14px #ffd54a) brightness(1.25)}}
.vy-lab{position:absolute;transform:translateY(-50%);max-width:240px;font-size:13px;line-height:1.25;color:#2b1d0b;background:#fbf3dfee;border:1px solid #d9c08a;padding:5px 9px;border-radius:10px;z-index:2;text-decoration:none}
.vy-lab small{display:block;font-size:10.5px;text-transform:uppercase;letter-spacing:.05em;font-weight:800}.vy-lab.done{opacity:.8}.vy-lab.now{background:#fff;font-weight:700;box-shadow:0 2px 8px #0003;border:2px solid #b45309}
.vy-port{position:absolute;left:50%;transform:translate(-50%,-50%);z-index:3;display:flex;align-items:center;gap:8px;background:#fbf3df;border:2px solid #b08a52;border-radius:14px;padding:6px 14px;box-shadow:0 3px 0 #8a6a3a;max-width:min(94%,560px)}
.vy-port .fl{font-size:28px;line-height:1}.vy-port b{font:700 18px Georgia,serif;color:#4a2f0e}.vy-port em{font-style:normal;font-size:12.5px;color:#8a5a1f}.vy-port i{font-size:12px;color:#4b3a1f;font-style:normal}.vy-port i.ce{color:#9a3412;font-weight:600}
.vy-port.ok::after{content:"✓";position:absolute;right:-9px;top:-9px;width:22px;height:22px;border-radius:50%;background:#15803d;color:#fff;font-size:13px;font-weight:900;display:grid;place-items:center;border:2px solid #fff}
.vy-pimg{position:absolute;z-index:1;pointer-events:none}.vy-pimg img{width:100%;display:block;filter:drop-shadow(0 6px 6px #0003)}.vy-pimg .lf{position:absolute;left:50%;top:4%;transform:translateX(-50%);font-size:30px;line-height:1}
.vy-pimg .ln{position:absolute;left:50%;bottom:2%;transform:translateX(-50%);font:700 15px Georgia,serif;color:#4a2f0e;background:#fbf3dfee;border:1px solid #d9c08a;border-radius:8px;padding:2px 10px;white-space:nowrap}
.vy-deco{position:absolute;z-index:1;width:64px;opacity:.95;pointer-events:none}
.vy-deco.swim,.vy-deco.fly{animation:vyswim var(--t,16s) ease-in-out var(--dl,0s) infinite}.vy-deco.fly{--m:150px}.vy-deco.sway{animation:vysway 7s ease-in-out infinite alternate}
@keyframes vyswim{0%{translate:0 0;scale:var(--f) 1}25%{translate:calc(var(--d)*var(--m,70px)/2) -7px}46%{translate:calc(var(--d)*var(--m,70px)) 0;scale:var(--f) 1}50%{translate:calc(var(--d)*var(--m,70px)) 0;scale:calc(var(--f)*-1) 1}75%{translate:calc(var(--d)*var(--m,70px)/2) 7px}96%{translate:0 0;scale:calc(var(--f)*-1) 1}100%{translate:0 0;scale:var(--f) 1}}
@keyframes vysway{from{rotate:-8deg}to{rotate:8deg}}
.vy-fog img{animation:vyfog 14s ease-in-out infinite alternate}.vy-fog img:nth-child(2){animation-duration:19s;animation-delay:-6s}.vy-fog img:nth-child(3){animation-duration:11s;animation-delay:-3s}
@keyframes vyfog{from{translate:-40px 0}to{translate:40px 0}}
.vy-fws{position:absolute;left:0;top:0;width:100%;height:45%;pointer-events:none;z-index:1}.vy-fws b{position:absolute;width:0;height:0}
.vy-fws i{position:absolute;left:-3px;top:-3px;width:6px;height:6px;border-radius:50%;background:var(--c);box-shadow:0 0 6px var(--c);opacity:0;animation:vyfwp 2.6s ease-out var(--dl) infinite}
@keyframes vyfwp{0%{transform:rotate(var(--a)) translateY(0) scale(.5);opacity:0}8%{opacity:1}65%{opacity:.9}100%{transform:rotate(var(--a)) translateY(-30px) scale(.9);opacity:0}}
.vy-mates{position:absolute;display:flex;gap:4px;transform:translateY(-60%);z-index:3}.vy-boat{display:flex;flex-direction:column;align-items:center;min-width:44px}
.vy-boat b,.vy-you b{margin-top:1px;color:#fff;font-size:11px;font-weight:800;border-radius:999px;padding:1px 7px;border:1.5px solid #fff;white-space:nowrap}
.vy-more{align-self:center;background:#fffd;color:#374151;font-size:12px;font-weight:800;border-radius:999px;padding:3px 8px}
.vy-b{position:relative;display:block;width:58px;height:58px;filter:drop-shadow(0 2px 1px #0003);animation:vybob 2.8s ease-in-out infinite;transform-origin:50% 85%}.vy-b.big{width:80px;height:80px;animation-duration:3s}
.vy-b img{width:100%;height:100%;display:block}.vy-b i{position:absolute;inset:0;mix-blend-mode:multiply;-webkit-mask:url(${IMG}boat.webp) center/contain no-repeat;mask:url(${IMG}boat.webp) center/contain no-repeat;clip-path:inset(69% 0 15% 0)}
.vy-boat:nth-child(2n) .vy-b{animation-duration:3.2s;animation-delay:-.8s}.vy-boat:nth-child(3n) .vy-b{animation-duration:2.6s;animation-delay:-1.5s}
@keyframes vybob{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-5px) rotate(4deg)}}
.vy-you{position:absolute;z-index:4;transform:translate(-50%,-100%);text-align:center}.vy-you b{background:#b45309}
.vy-fog{position:absolute;left:-60px;right:-60px;z-index:4;pointer-events:none}.vy-fog img{position:absolute;width:100%;height:150px;left:0}
.vy-tip{position:absolute;left:50%;transform:translateX(-50%);z-index:5;background:#fff;border-radius:12px;padding:6px 12px;font-size:12.5px;color:#4b5563;box-shadow:0 1px 4px #0002;white-space:nowrap;max-width:92%;overflow:hidden;text-overflow:ellipsis}
.vy-dest{position:absolute;left:50%;transform:translateX(-50%);z-index:5;text-align:center;width:min(330px,92%);background:#fbf3df;border:2px solid #b08a52;border-radius:16px;padding:6px 10px 10px;box-shadow:0 3px 0 #8a6a3a;color:inherit;text-decoration:none}
.vy-dest img{width:180px;display:block;margin:-4px auto -8px}.vy-dest small{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#b45309;font-weight:800}
.vy-dest small.ce{color:#9a3412;text-transform:none;letter-spacing:0;font-size:12px}.vy-dest b{display:block;font:700 18px Georgia,serif;color:#4a2f0e;margin-top:2px}.vy-dest p{margin:3px 0 0;font-size:12.5px;color:#374151;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.vy-dest.ok b::after{content:" ✓";color:#15803d}
.vy-btn{position:absolute;bottom:12px;z-index:7;height:42px;border-radius:12px;background:#ffffffe6;display:flex;align-items:center;gap:6px;padding:0 12px;font:700 14px system-ui,sans-serif;box-shadow:0 1px 4px #0003;color:#1d3557;border:0;cursor:pointer}
.vy-btn.off{opacity:.65}.vy-snd{right:66px}.vy-down{right:14px;width:42px;justify-content:center;padding:0;font-size:19px}
.vy-toast{position:absolute;left:50%;top:42%;transform:translate(-50%,-50%) scale(.6);opacity:0;z-index:9;width:min(440px,90%);background:#fbf3df;border:3px solid #b08a52;border-radius:18px;padding:14px 22px;text-align:center;box-shadow:0 6px 0 #8a6a3a,0 10px 30px #0004;transition:all .35s cubic-bezier(.2,1.6,.4,1);pointer-events:none}
.vy-toast.on{opacity:1;transform:translate(-50%,-50%) scale(1)}.vy-toast .big{font-size:42px;line-height:1}.vy-toast b{display:block;font:700 23px Georgia,serif;color:#4a2f0e;margin-top:4px}.vy-toast small{display:block;font-size:13.5px;color:#8a5a1f;margin-top:3px}.vy-toast small.ce{color:#9a3412;font-weight:700}
.vy-ovl{position:absolute;inset:0;z-index:20;display:grid;place-items:center;background:radial-gradient(#0b1f3acc,#0b1f3af2);opacity:0;pointer-events:none;transition:opacity .5s}.vy-ovl.on{opacity:1;pointer-events:auto}
.vy-ovl .card{position:relative;width:min(500px,90%);background:#fbf3df;border:4px solid #b08a52;border-radius:24px;padding:16px 22px 20px;text-align:center;box-shadow:0 8px 0 #8a6a3a,0 20px 60px #0008;transform:scale(.7);transition:transform .6s cubic-bezier(.2,1.6,.4,1)}.vy-ovl.on .card{transform:scale(1)}
.vy-ovl img{width:240px;margin:-60px auto 0;display:block;filter:drop-shadow(0 6px 10px #0006)}.vy-ovl h3{margin:4px 0 2px;font:700 28px Georgia,serif;color:#4a2f0e}.vy-ovl p{margin:4px 0;color:#5b4320}.vy-ovl .ce{color:#9a3412;font-weight:700}
.vy-ovl button{margin-top:10px;background:#3fa34d;color:#fff;font-weight:800;font-size:15px;padding:10px 22px;border-radius:14px;box-shadow:0 4px 0 #2b7a37;border:0;cursor:pointer}
.vy-fw{position:absolute;z-index:3;width:9px;height:9px;box-shadow:0 0 8px currentColor;border-radius:50%;pointer-events:none;animation:vyfw 1.4s ease-out forwards}@keyframes vyfw{0%{transform:translate(0,0);opacity:1}100%{transform:translate(var(--x),var(--y));opacity:0}}
.vy-steps{width:268px;flex:none;background:#fffaf0;border:3px solid #b08a52;border-radius:20px;display:flex;flex-direction:column;min-height:0;overflow:hidden}
.vy-steps h2{margin:0;padding:12px 14px 8px;font:700 17px Georgia,serif;color:#4a2f0e;display:flex;justify-content:space-between;align-items:baseline;gap:6px;background:#f6ead0}.vy-steps h2 small{font:600 12px system-ui,sans-serif;color:#8a5a1f;white-space:nowrap}
.vy-steps .bar{height:8px;background:#ead9b5;margin:0 14px 8px;border-radius:9px;overflow:hidden}.vy-steps .bar i{display:block;height:100%;background:#15803d;border-radius:9px}
.vy-steps ol{position:relative;list-style:none;margin:0;padding:0 8px 10px;overflow:auto;flex:1;scrollbar-width:thin}
.vy-steps .pt{display:flex;align-items:center;gap:6px;font:700 13px system-ui,sans-serif;color:#4a2f0e;padding:10px 6px 4px;border-bottom:1px dashed #d9c294}.vy-steps .pt .tk{margin-left:auto}
.vy-steps li.s a{display:flex;align-items:center;gap:8px;padding:6px;border-radius:10px;font-size:13px;line-height:1.25;color:#1f2937;text-decoration:none}.vy-steps li.s a:hover{background:#f3e7cc}
.vy-steps li.s small{display:block;font-size:10px;font-weight:800;letter-spacing:.05em;text-transform:uppercase}
.vy-steps .tk{flex:none;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-size:13px;font-weight:900;border:2px solid #c9b07a;color:transparent}
.vy-steps .ok .tk,.vy-steps .pt .tk.ok{background:#15803d;border-color:#15803d;color:#fff}.vy-steps li.ok .n{color:#6b7280}
.vy-steps li.now a{background:#fff;box-shadow:0 0 0 2px #b45309 inset}.vy-steps li.now .tk{border-color:#b45309;background:#b45309;color:#fff;font-size:10px}
.vy-steps li.fp a{margin-top:8px;background:#fdf2d6;font-weight:700}.vy-steps li.fp .tk{border:0;font-size:17px;color:inherit}
.vy-steps li.s.pop .tk{animation:vytk .5s cubic-bezier(.2,1.8,.4,1)}@keyframes vytk{0%{transform:scale(.3)}100%{transform:scale(1)}}
.vy-go{display:flex;margin-top:10px}.vy-go a{flex:1;display:flex;align-items:center;justify-content:center;gap:10px;background:#3fa34d;color:#fff;text-decoration:none;font-weight:800;font-size:19px;border-radius:16px;padding:12px;box-shadow:0 4px 0 #2b7a36;min-width:0}
.vy-go a small{font-weight:600;font-size:15px;opacity:.95;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.vy-go a.fin{background:#b45309;box-shadow:0 4px 0 #7c3a06}.vy-go a.all{background:#fff;color:#174d3d;box-shadow:0 4px 0 #cbd5e1}
@media (max-width:900px){.vy-steps{display:none}}
@media (max-width:640px){.vy-row{height:calc(100vh - 210px);min-height:420px}.vy-top b{font-size:15px}.vy-lab{max-width:150px;font-size:12px}.vy-go a{font-size:17px}.vy-go a small{display:none}.vy-snd span{display:none}}
@media (prefers-reduced-motion:reduce){.vy-b,.vy-deco,.vy-fog img,.vy-sea::before{animation:none}.vy-fws{display:none}}`;document.head.appendChild(s)}

  // ---- the frame (the map itself is laid out by wire, at the width it gets) ----
  function html(V){css();const en=V.en,t=(ca,e)=>en?e:ca,M=model(V),n=M.stops.length,fp=V.fp||{};
    const now=M.stops.find(s=>s.key===V.now);
    let col=`<h2>🧭 ${t("Els teus passos","Your steps")} <small>${t(`${M.done} de ${n} fets`,`${M.done} of ${n} done`)}</small></h2><div class="bar"><i style="width:${n?Math.round(M.done/n*100):0}%"></i></div><ol>`;
    M.items.forEach(it=>{
      if(it.port){col+=`<li class="pt"><span>${it.port.f}</span>${esc(it.port.c)}<span class="tk${it.done?" ok":""}">✓</span></li>`;return}
      const k=SK[it.sk]||SK.Step,nw=now&&it.key===now.key;
      col+=`<li class="s${it.done?" ok":""}${nw?" now":""}" data-k="${esc(it.key)}"><a href="${esc(it.href)}"><span class="tk">${nw?"▶":"✓"}</span><span class="n"><small style="color:${k[1]}">${esc(skName(it.sk,en))}</small>${esc(it.t)}</span></a></li>`});
    if(fp.title)col+=`<li class="s fp${fp.done?" ok":""}${!now&&!fp.done?" now":""}"><a href="${esc(fp.href||"#")}"><span class="tk">🏆</span><span class="n"><small style="color:#b45309">${t("Producte final","Final product")}</small>${esc(fp.title)}</span></a></li>`;
    col+="</ol>";
    const go=V.cont?`<a href="${esc(V.cont.href)}">▶ ${t("Continua","Continue")} <small>· ${esc(V.cont.label||(now?now.t:""))}</small></a>`
      :fp.title&&!fp.done?`<a class="fin" href="${esc(fp.href||"#")}">🏆 ${t("Producte final","Final product")} <small>· ${esc(fp.title)}</small></a>`
      :`<a class="all" href="lab/practice.html">✓ ${t("Ho tens tot fet! Practica pel teu compte","You're all done! Practise on your own")} →</a>`;
    return `<section class="vy" aria-label="${t("El teu viatge","Your voyage")}"><div class="vy-row"><div class="vy-sea"><div class="vy-sc"><div class="vy-map"></div></div>`
      +`<div class="vy-top"><div><small>${esc(V.ls||"")} · ${t("El teu viatge","Your voyage")}</small><b>🏆 ${esc(fp.title||"")}</b></div></div>`
      +`<button type="button" class="vy-btn vy-snd" data-vy="snd"></button><button type="button" class="vy-btn vy-down" data-vy="me" title="${t("Torna al meu vaixell","Back to my boat")}" aria-label="${t("Torna al meu vaixell","Back to my boat")}">⛵</button>`
      +`<div class="vy-toast" role="status"></div><div class="vy-ovl"></div></div><aside class="vy-steps">${col}</aside></div><div class="vy-go">${go}</div></section>`}

  // ---- the map ----
  const LAST={};   // scroll position per store, kept when the board draws again
  function wire(root,V){const sea=root&&root.querySelector(".vy-sea");if(!sea)return;
    const en=V.en,t=(ca,e)=>en?e:ca,M=model(V),sc=sea.querySelector(".vy-sc"),map=sea.querySelector(".vy-map"),fp=V.fp||{};
    SND.quiet=V.quiet||(()=>false);
    const W=sc.clientWidth||800,wide=W>640,cx=W/2,lane=wide?95:62,STEP=wide?118:96,GAP=56,TOP=wide?440:420,lanes=[0,-1,-1.6,-1,0,1,1.6,1];
    let total=TOP;M.items.forEach(it=>total+=it.port?GAP+88:STEP);total+=90;
    map.style.height=total+"px";map.style.width=W+"px";
    let yy=total-70,li=0;const pts=[];
    M.items.forEach(it=>{if(it.port){yy-=GAP/2+44;it.y=yy;yy-=GAP/2+44;return}it.x=cx+lanes[li%lanes.length]*lane;it.y=yy;it.right=it.x<=cx;pts.push([it.x,it.y]);li++;yy-=STEP});
    let h="";
    const topY=pts.length?Math.min(...pts.map(p=>p[1])):total-120;
    // the route
    if(pts.length){let d=`M${pts[0][0]} ${pts[0][1]+70}`;pts.forEach(([x,y],i)=>{if(!i){d+=` L${x} ${y}`;return}const [px,py]=pts[i-1];d+=` C${px} ${(py+y)/2} ${x} ${(py+y)/2} ${x} ${y}`});
      const l=pts[pts.length-1];d+=` C${l[0]} ${l[1]-80} ${cx} ${l[1]-80} ${cx} 160`;
      h+=`<svg width="${W}" height="${total}" aria-hidden="true"><path d="${d}" fill="none" stroke="#ffffff55" stroke-width="22" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="10 10" stroke-linecap="round"/></svg>`}
    // sea life
    if(W>500)[[W-120,total-170,"compass",90],[W*.06,TOP+180,"whale"],[W*.86,TOP+620,"dolphin"],[W*.08,TOP+1250,"turtle"],[W*.82,TOP+1500,"seagull"],[W*.88,TOP+40,"seagull"],[W*.1,TOP+1950,"dolphin"],[W*.85,TOP+2400,"whale"],[W*.07,TOP+2900,"turtle"]]
      .filter(d=>d[1]<total-110).forEach(([x,y,f,w],i)=>{const mv=MOVE(f),d=x>W/2?-1:1;   // on the right they set off to the left
        h+=`<img class="vy-deco${mv?" "+mv[0]:""}" src="${IMG}${f}.webp" style="left:${x}px;top:${y}px;${w?`width:${w}px;`:""}${mv?`--d:${d};--f:${d*mv[1]};--t:${14+i%3*3}s;--dl:-${i*2.3}s`:""}" alt="">`});
    // ports: the label on the route, the picture at the side
    M.ports.forEach((it,j)=>{const P=it.port,img=pimg(V,it.pi);
      h+=`<div class="vy-port${it.done?" ok":""}" style="top:${it.y}px"><span class="fl">${P.f}</span><span><b>${esc(P.c)}</b> <em>${esc(P.p)} · ${P.y}</em><br><i>📜 ${esc(P.h)}</i>${fest(V)?`<br><i class="ce">🎉 ${esc(P.fe)}</i>`:""}</span></div>`;
      if(W>560){const left=j%2===0,sz=Math.min(280,W*.27),px=left?Math.max(-20,cx-lane*2-sz-150):Math.min(W-sz+20,cx+lane*2+150);
        h+=`<div class="vy-pimg" style="left:${px}px;top:${it.y-sz*.95}px;width:${sz}px"><img src="${IMG}${img}.webp" alt="">${hasFw(V,it.pi)?fwHtml():""}<span class="ln">${P.f} ${esc(P.c)}</span></div>`}});
    // the stops
    const now=M.stops.find(s=>s.key===V.now);
    M.stops.forEach(s=>{const k=SK[s.sk]||SK.Step,nw=now&&s.key===now.key,c=(s.done?" done":"")+(nw?" now":""),lx=s.right?s.x+36:s.x-36;
      h+=`<a class="vy-st${c}" href="${esc(s.href)}" data-k="${esc(s.key)}" style="left:${s.x}px;top:${s.y}px" title="${esc(skName(s.sk,en)+" · "+s.t)}">${k[0]}</a>`
        +`<a class="vy-lab${c}" href="${esc(s.href)}" style="${s.right?`left:${lx}px`:`right:${W-lx}px`};top:${s.y}px"><small style="color:${k[1]}">${esc(skName(s.sk,en))}</small>${esc(s.t)}</a>`});
    // boats: every student by the steps done (one past the last stop = at the destination)
    const n=M.stops.length,spot=x=>Math.max(0,Math.min(n,x|0)),destY=wide?300:290;
    const at={};(V.mates||[]).forEach(m=>{const i=spot(m.s);(at[i]=at[i]||[]).push(m)});
    const meI=spot(V.me&&V.me.s!=null?V.me.s:M.done);
    const meXY=meI<n?(s=>[s.x+(s.right?-78:78),s.y+48])(M.stops[meI]):[cx+(wide?200:110),destY+60];
    for(const i in at){const L=at[i].sort((a,b)=>String(a.n).localeCompare(b.n)),max=wide?4:2,sh=L.slice(0,max),more=L.length-sh.length;
      const boats=sh.map(m=>`<div class="vy-boat" title="${esc(m.n)}">${BOAT(col(m.n))}<b style="background:${col(m.n)}">${esc(m.n)}</b></div>`).join("")+(more?`<span class="vy-more" title="${esc(L.slice(max).map(m=>m.n).join(", "))}">+${more}</span>`:"");
      const wB=sh.reduce((a,m)=>a+Math.max(52,String(m.n).length*7.5+16)+4,0)+(more?40:0);
      if(+i<n){const s=M.stops[i],off=+i===meI?100:0;let x=s.right?s.x-40-wB-off:s.x+40+off;x=Math.max(4,Math.min(W-wB-4,x));h+=`<div class="vy-mates" style="left:${x}px;top:${s.y}px">${boats}</div>`}
      else h+=`<div class="vy-mates" style="left:${Math.max(4,cx-(wide?200:110)-wB/2)}px;top:${destY+60}px">${boats}</div>`}
    if(V.me)h+=`<div class="vy-you" style="left:${meXY[0]}px;top:${meXY[1]}px"><b>${t("Tu","You")}</b>${BOAT("#b45309",1)}</div>`;
    // fog over what is not open yet, then the destination: the final product
    if(!fp.done){h+=`<div class="vy-fog" style="top:${topY-235}px;height:220px"><img src="${IMG}fog.webp" style="top:0" alt=""><img src="${IMG}fog.webp" style="top:50px;transform:scaleX(-1)" alt=""><img src="${IMG}fog.webp" style="top:95px" alt=""></div>`
      +`<div class="vy-tip" style="top:${topY-130}px">🌫️ ${t("Apareixeran més ports quan el professor els afegeixi","More ports appear when your teacher adds them")}</div>`}
    const D=DEST,dimg=pimg(V,PORTS.length);
    h+=`<a class="vy-dest${fp.done?" ok":""}" href="${esc(fp.href||"#")}" style="top:58px"><img src="${IMG}${dimg}.webp" alt="">${hasFw(V,PORTS.length)?fwHtml("left:50%;width:180px;height:70px;transform:translateX(-50%)"):""}<small>${D.f} ${t("Destinació final","Final destination")}: ${esc(D.c)} · ${esc(D.p)} · ${D.y}</small>`
      +(fest(V)?`<small class="ce">🎉 ${esc(D.fe)}</small>`:"")+`<b>${esc(fp.title||"")}</b>${fp.sub?`<p>${esc(fp.sub)}</p>`:""}</a>`;
    map.innerHTML=h;
    // where the view starts: where it was, else my boat
    const toMe=b=>sc.scrollTo({top:Math.max(0,meXY[1]-sc.clientHeight*.55),behavior:b?"smooth":"auto"});
    if(LAST[V.store]!=null&&LAST.w===W)sc.scrollTop=LAST[V.store];else toMe();LAST.w=W;
    sc.addEventListener("scroll",()=>{LAST[V.store]=sc.scrollTop},{passive:true});
    // buttons
    const sb=sea.querySelector('[data-vy="snd"]'),setSb=()=>{sb.innerHTML=SND.on?`🎵 <span>${t("Música sí","Music on")}</span>`:`🔇 <span>${t("Música no","Music off")}</span>`;sb.classList.toggle("off",!SND.on)};setSb();
    sb.onclick=e=>{e.stopPropagation();SND.on=!SND.on;SND.on?SND.startBg():SND.stopBg();setSb();try{localStorage.setItem("el_voyage_snd",SND.on?"1":"0")}catch(e){}};
    sea.querySelector('[data-vy="me"]').onclick=()=>{toMe(1);SND.play("click",.6)};
    map.addEventListener("click",e=>{if(e.target.closest(".vy-st,.vy-lab,.vy-dest"))SND.play("click",.6)});
    root.querySelectorAll(".vy-steps li.s a").forEach(a=>a.addEventListener("click",()=>SND.play("click",.6)));
    const nowLi=root.querySelector(".vy-steps li.now");if(nowLi){const ol=nowLi.parentElement;ol.scrollTop=Math.max(0,nowLi.offsetTop-ol.clientHeight*.45)}
    // relayout when the width changes (window resized, phone turned)
    if(!wire.ro&&window.ResizeObserver){wire.ro=new ResizeObserver(()=>{const r=wire.last;if(!r)return;const s=r.root.querySelector(".vy-sc");if(s&&s.clientWidth&&Math.abs(s.clientWidth-(LAST.w||0))>20)wire(r.root,r.V)})}
    if(wire.ro){wire.ro.disconnect();wire.ro.observe(sc)}wire.last={root,V};
    rewards(sea,root,V,M);
  }

  // ---- rewards: what is new since the last visit (kept in this browser): a step done, a port reached, the final product sent, a new stop ----
  const SEEN={};
  function rewards(sea,root,V,M){if(!V.store||SEEN[V.store])return;SEEN[V.store]=1;
    let old=null;try{old=JSON.parse(localStorage.getItem(V.store)||"null")}catch(e){}
    const now={d:M.stops.filter(s=>s.done).map(s=>s.key),k:M.stops.map(s=>s.key),p:M.ports.filter(p=>p.done).map(p=>p.pi),f:!!(V.fp&&V.fp.done)};
    if(V.save!==false)try{localStorage.setItem(V.store,JSON.stringify(now))}catch(e){}
    if(!old)return;   // the first visit only remembers
    const en=V.en,t=(ca,e)=>en?e:ca,od=new Set(old.d||[]),ok=new Set(old.k||[]),op=new Set(old.p||[]);
    const newDone=now.d.filter(k=>!od.has(k)),newStops=now.k.filter(k=>!ok.has(k)),newPorts=now.p.filter(p=>!op.has(p));
    // the board may draw again in the meantime (the LS page arrives, the classmates arrive): look the map up when each effect plays
    const el=k=>[...document.querySelectorAll(".vy-sea .vy-st")].find(e=>e.dataset.k===k),li=k=>[...document.querySelectorAll(".vy-steps li.s")].find(e=>e.dataset.k===k);
    let delay=300;
    if(newDone.length){setTimeout(()=>{newDone.forEach(k=>{const e=el(k);if(e){e.classList.remove("pop");void e.offsetWidth;e.classList.add("pop")}const l=li(k);if(l)l.classList.add("pop")});SND.play("step")},delay);delay+=900}
    if(newStops.length&&old.k&&old.k.length){setTimeout(()=>{newStops.forEach(k=>{const e=el(k);if(e)e.classList.add("flash")});SND.play("fog",.6)},delay);delay+=900}
    if(newPorts.length){const it=M.ports.find(p=>p.pi===newPorts[newPorts.length-1]),P=it.port;
      setTimeout(()=>{const T=document.querySelector(".vy-sea .vy-toast");if(!T)return;T.innerHTML=`<div class="big">${P.f} 🏅</div><b>${t("Has arribat a port","Port reached")}: ${esc(P.c)}!</b><small>${esc(P.p)} · ${P.y} · 📜 ${esc(P.h)}</small>${fest(V)?`<small class="ce">🎉 ${esc(P.fe)}</small>`:""}`;
        T.classList.add("on");SND.play("port");setTimeout(()=>T.classList.remove("on"),5000)},delay);delay+=5200}
    if(now.f&&!old.f)setTimeout(()=>{const s=document.querySelector(".vy-sea");if(s)voyageDone(s,V)},delay)}
  function voyageDone(sea,V){const en=V.en,t=(ca,e)=>en?e:ca,O=sea.querySelector(".vy-ovl"),D=DEST,fp=V.fp||{};
    O.innerHTML=`<div class="card"><img src="${IMG}${pimg(V,PORTS.length)}.webp" alt=""><div style="font-size:30px">${D.f} 🏆</div><h3>${t("Viatge completat!","Voyage complete!")}</h3>`
      +`<p>${t("Has arribat a","You reached")} <b>${esc(D.p)} · ${D.y}</b>, ${t("el final del viatge.","the end of the voyage.")}</p><p>${t("El teu","Your")} <b>${esc(fp.title||"")}</b> ${t("ja és amb el professor.","is with your teacher now.")}</p>`
      +(fest(V)?`<p class="ce">🎉 ${esc(D.fe)}</p>`:"")+`<button type="button">⛵ ${t("Torna al mapa","Back to the map")}</button></div>`;
    O.classList.add("on");O.querySelector("button").onclick=()=>O.classList.remove("on");SND.play("voyage",.9);
    const R=O.getBoundingClientRect(),cols=["#ffd54a","#ff6b6b","#4fc3f7","#81c784","#f48fb1","#fff"];
    for(let b=0;b<6;b++)setTimeout(()=>{const x=R.width*(.15+Math.random()*.7),y=R.height*(.12+Math.random()*.3);
      for(let i=0;i<26;i++){const d=document.createElement("i");d.className="vy-fw";const a=i/26*6.283,r=60+Math.random()*50;
        d.style.cssText=`left:${x}px;top:${y}px;background:${cols[(b+i)%6]};color:${cols[(b+i)%6]};--x:${Math.cos(a)*r}px;--y:${Math.sin(a)*r}px`;O.appendChild(d);setTimeout(()=>d.remove(),1500)}},b*450)}

  window.elVoyage={html,wire,model,skill,PORTS,DEST,SKINS,SND,
    // a skill's label, icon and colour (the activity pages' 🧭 Your steps, el-app.js, get them from the board's copy)
    sk:(k,en)=>({n:skName(k,en),i:(SK[k]||SK.Step)[0],c:(SK[k]||SK.Step)[1]}),
    // the first name of "Surname Surname, Name" (the student list) or of "Name Surname"
    first:n=>{n=String(n||"").trim();return (n.includes(",")?n.split(",")[1].trim().split(/\s+/)[0]:n.split(/[\s@]+/)[0]||"").slice(0,40)}};
})();
