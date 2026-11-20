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
// V = {ls, skin (the LS id: SKINS, the whole world of the map), beds:[{id, kind: lp|cp|fp|bonus, plants:[{key, id, name, href, st}]}], fp:{title, sub, href, done}, now, me:{n, s},
//      mates:[{n, s}], cont:{href, label}, store, save, en, quiet()}
(function(){
  const BASE=(()=>{try{return new URL("../",document.currentScript.src).href}catch(e){return "shared/"}})();
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
  // ---- skins: the whole world of the map, per LS id (Roger, 20 Nov 2026: 2 ESO LS2 is "a whole new world", young sports reporters in a
  // bus touring sports events, ending at a vlog studio). SEA is the 4 ESO sea voyage and every skin's default: a skin gives only what
  // changes, so a new world needs only its data and its pictures. Picture names have no ".webp".
  //   dir      its pictures' folder, under shared/
  //   places   [{f flag, c name, p place, y year or when, h 📜 fact, fe 🎉 celebration, img}], in order: one per learning path
  //   dest     the final destination, the same fields;  img: pictures that replace the places' own, the one after the last place = dest
  //            (null = keep);  fest: show the 🎉 lines
  //   bg       {tile, size (px), color, wash (a colour laid over the tile), drift (false = land: it does not move)};  stop: {step, done, now} the stop pictures
  //   veh      {img (a classmate's, tinted per student), me (my own), band (the part of img the tint colours: a CSS clip-path), icon,
  //            imgs: [{img, me, band}] several shapes: each student gets one by their first name, the same on every screen}
  //   fog      the picture over what is not open yet;  decos: 9 pictures for the sides of the map: the 1st in the bottom corner, the
  //            others from the top down (null = none, [name, width px] = a bigger one)
  //   road     {halo, hw, line, lw, dash} the colours and widths of the route;  snd: {dir (under shared/), music, amb (the loop under the
  //            music, null = none), ambVol, click, step, port, fog, voyage} sound files (null = silent)
  //   w        wording {key: [Catalan, English]}: title, back (to my vehicle), map (back to the map), tip (the fog), reached (a place),
  //            dest, done, reach, end
  const SEA={dir:"img/voyage/",places:PORTS,dest:DEST,img:[],fest:false,
    bg:{tile:"sea",size:300,color:"#7fc0e3",wash:"#ffffff38"},stop:{step:"step",done:"step-done",now:"step-now"},
    veh:{img:"boat",me:"boat-me",band:"inset(69% 0 15% 0)",icon:"⛵"},fog:"fog",
    decos:["compass","whale","dolphin","turtle","seagull","seagull","dolphin","whale","turtle"],
    road:{halo:"#ffffff55",hw:22,line:"#fff",lw:3,dash:"10 10"},
    snd:{dir:"audio/voyage/",music:"music.mp3",amb:"sea-loop.wav",ambVol:.15,click:"click.mp3",step:"step.mp3",port:"port.mp3",fog:"fog.mp3",voyage:"voyage.mp3"},
    w:{title:["El teu viatge","Your voyage"],back:["Torna al meu vaixell","Back to my boat"],map:["Torna al mapa","Back to the map"],
      tip:["Apareixeran més ports quan el professor els afegeixi","More ports appear when your teacher adds them"],reached:["Has arribat a port","Port reached"],
      dest:["Destinació final","Final destination"],done:["Viatge completat!","Voyage complete!"],reach:["Has arribat a","You reached"],end:["el final del viatge.","the end of the voyage."]}};
  // 4 ESO LS2: the sea, with Gemini art made with Roger (20 Nov 2026), cut out of its background, 320 px WebP; fw = the pictures with
  // fireworks that go off over them (place numbers from 0, the one after the last place = dest)
  const SKINS={"4eso-seasons-and-celebrations":{fest:true,img:["port-england-bonfire","port-usa-fest","port-india-fest","port-jamaica-fest","port-canada-fest","port-sierra-leone-fest","port-australia-fest"],fw:[0,2,6]},
    // 2 ESO LS2 "Free Time, Live!": young sports reporters in a TV bus touring sports events, ending at the vlog studio (Roger, 20 Nov
    // 2026). Gemini art cut out of its white background. The road is drawn grey with a white centre line; no sounds of its own yet (no waves)
    "2eso-free-time-live":{
      dir:"img/road-2eso/",
      places:[
        {f:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",c:"England",p:"London · Wimbledon",y:"July",h:"It's the oldest tennis tournament in the world, and the players must wear white clothes.",img:"place-england-wimbledon"},
        {f:"🏴󠁧󠁢󠁳󠁣󠁴󠁿",c:"Scotland",p:"Braemar · the Highland Games",y:"September",h:"Athletes in kilts throw a heavy tree trunk called a caber.",img:"place-scotland-highland"},
        {f:"🇺🇸",c:"USA",p:"New York · a baseball game",y:"Spring and summer",h:"In the middle of the game, all the fans stand up and sing a song together.",img:"place-usa-baseball"},
        {f:"🇨🇦",c:"Canada",p:"Toronto · an ice-hockey game",y:"Winter",h:"Ice hockey is Canada's national winter sport.",img:"place-canada-hockey"},
        {f:"🇯🇲",c:"Jamaica",p:"Kingston · Champs",y:"March",h:"At the school athletics championships, thousands of fans watch teenage runners, and some become Olympic stars.",img:"place-jamaica-champs"},
        {f:"🇦🇺",c:"Australia",p:"Sydney · Bondi Beach",y:"Summer",h:"Surfers and swimmers stay between the red and yellow flags, where the lifeguards can see them.",img:"place-australia-bondi"}],
      dest:{f:"🎬",c:"Free Time, Live!",p:"the vlog studio",y:"",h:"Time to make your vlog!",img:"dest-vlog-studio"},
      bg:{tile:"bg-pitch-tile",size:300,color:"#9cc680",wash:"#ffffff00",drift:false},   // a striped football pitch (Roger's choice)
      stop:{step:"stop",done:"stop-done",now:"stop-now"},
      // bus.webp is 220×171; the white body is from 34% down to 9% from the bottom (camera and dish on the roof stay grey)
      // six shapes (Roger, 20 Nov 2026), one per student by first name: the minibus, a box van, a classic van, a camper, a double-decker and a cart;
      // band = from the roof down (the camera and the dish stay grey)
      veh:{img:"bus",me:"bus-me",band:"inset(34% 0 9% 0)",icon:"🚌",drive:true,imgs:[{img:"bus",me:"bus-me",band:"inset(34% 0 9% 0)"},
        {img:"van-box",me:"van-box-me",band:"inset(33% 0 9% 0)"},{img:"van-classic",me:"van-classic-me",band:"inset(34% 0 9% 0)"},
        {img:"van-camper",me:"van-camper-me",band:"inset(31% 0 9% 0)"},{img:"bus-double",me:"bus-double-me",band:"inset(28% 0 9% 0)"},
        {img:"van-cart",me:"van-cart-me",band:"inset(28% 0 11% 0)"}]},
      fog:"clouds",
      // Barcelona landmarks bigger than the small decorations (Torre Glòries is tall, so narrower)
      decos:["deco-traffic-light","deco-camera",["deco-bcn-tibidabo",110],["deco-bcn-sagrada-familia",110],"deco-football","deco-drone",["deco-bcn-torre-glories",55],["deco-bcn-stadium",110],"deco-microphone"],
      road:{halo:"#6b7280",hw:30,line:"#fff",lw:3,dash:"14 12"},
      // sounds: a clean sports-TV theme (no noise drums), camera snap, cheer, fanfare, beep-beep horn. No background loop: the crowd
      // loop sounded like noise, and iPhones ignore the volume we set, so it played as loud as the song (Roger, 20 Nov)
      snd:{dir:"audio/road-2eso/",music:"music.mp3",amb:null,click:"click.mp3",step:"step.mp3",port:"port.mp3",fog:"fog.mp3",voyage:"voyage.mp3",horn:"horn.mp3"},
      w:{title:["La teva gira de reporter","Your reporter tour"],back:["Torna al meu bus","Back to my bus"],tip:["Apareixeran més parades quan el professor les afegeixi","More stops appear when your teacher adds them"],
         reached:["Parada assolida","Stop reached"],dest:["Destinació final","Final destination"],done:["Gira completada!","Trip complete!"],
         reach:["Has arribat a","You made it to"],end:["el final de la gira.","the end of the tour."]}
    }};
  function skinOf(V){const k=SKINS[V&&V.skin]||{},o={...SEA,...k},im=k.img||[];
    ["bg","stop","veh","road","snd","w"].forEach(x=>o[x]={...SEA[x],...(k[x]||{})});
    o.places=(k.places||SEA.places).map((P,i)=>({...P,img:im[i]||P.img}));const d=k.dest||SEA.dest;o.dest={...d,img:im[o.places.length]||d.img};
    o.I=BASE+o.dir;o.A=BASE+o.snd.dir;o.wd=(key,en)=>(o.w[key]||["",""])[en?1:0];return o}
  const py=P=>[P.p,P.y].filter(x=>x!=null&&x!=="").join(" · "),hasFw=(S,i)=>(S.fw||[]).includes(i);
  // ✨ things that move (Roger, 20 Nov 2026: "turtles could swim, clouds could move, fireworks too"): the background drifts, sea animals
  // swim to and fro and turn round, gulls and drones glide, the fog drifts, fireworks go off over the pictures that have them. Only
  // transforms (cheap on a Chromebook), and nothing moves for "reduce motion".
  const FW=["#ffd54a","#ff6b6b","#4fc3f7","#81c784","#f48fb1","#fff"];
  const fwHtml=st=>`<span class="vy-fws" aria-hidden="true"${st?` style="${st}"`:""}>`+[[20,14,0],[56,6,.9],[82,18,1.7]].map(([x,y,d],b)=>`<b style="left:${x}%;top:${y}%;--dl:${d}s;--c:${FW[(b*2+1)%6]}">`
    +Array.from({length:10},(_,i)=>`<i style="--a:${i*36}deg"></i>`).join("")+`</b>`).join("")+`</span>`;
  // a decoration's movement, by what it is: [kind, faces right (1) or left (-1)]
  const MOVE=f=>/whale|turtle/.test(f)?["swim",1]:/dolphin/.test(f)?["swim",-1]:/seagull|drone/.test(f)?["fly",1]:/compass/.test(f)?["sway",1]:null;
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
  function model(V){const items=[],stops=[],PL=skinOf(V).places;let pi=-1;
    (V.beds||[]).filter(b=>b.kind!=="fp").forEach(b=>{
      const ps=(b.plants||[]).filter(p=>!p.later);if(!ps.length)return;
      if((b.kind==="lp"||pi<0)&&pi<PL.length-1){pi++;items.push({port:PL[pi],pi,keys:[]})}
      const port=items.filter(x=>x.port).pop();
      ps.forEach(p=>{const sk=skill(b.id,p.id,b.kind),s={key:p.key,href:p.href,done:p.st==="bloom",cp:b.kind==="cp",sk,t:title(b.id,p,V.en),pi,i:stops.length};
        port.keys.push(p.key);items.push(s);stops.push(s)})});
    items.filter(x=>x.port).forEach(x=>{x.done=x.keys.every(k=>stops.find(s=>s.key===k).done)});
    return {items,stops,ports:items.filter(x=>x.port),done:stops.filter(s=>s.done).length}}
  const hue=n=>[...String(n)].reduce((a,c)=>a+c.charCodeAt(0)*37,0)%360,col=n=>`hsl(${hue(n)} 60% 42%)`;
  // a student's vehicle: the skin's one, or one of its shapes (veh.imgs) picked by the first name, so classmates see the same one
  const shape=(S,n)=>{const L=S.veh.imgs;if(!L||!L.length||n==null)return null;return L[[...String(n)].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7)%L.length]};
  const BOAT=(S,c,big,n)=>{const v=shape(S,n);
    if(big)return `<span class="vy-b big"><img src="${S.I}${v&&v.me||S.veh.me}.webp" alt=""></span>`;
    const m=v?`;-webkit-mask-image:url(${S.I}${v.img}.webp);mask-image:url(${S.I}${v.img}.webp);clip-path:${v.band||"none"}`:"";
    return `<span class="vy-b"><img src="${S.I}${v?v.img:S.veh.img}.webp" alt=""><i style="background:${c}${m}"></i></span>`};

  // ---- sounds ----
  let saved=null;try{saved=localStorage.getItem("el_voyage_snd")}catch(e){}
  // quiet(): the teacher's view of a student's board and class mode start with no sound; there the 🎵 button turns it on for this page (force)
  const SND={on:saved!=="0",MV:.3,music:null,sea:null,quiet:()=>false,force:false,dt:0,sk:skinOf(null),
    hush(){return this.quiet()&&!this.force},
    play(k,vol){const f=this.sk.snd[k];if(!f||!this.on||this.hush())return;try{const a=new Audio(this.sk.A+f);a.volume=vol||.8;a.play().catch(()=>{});this.duck()}catch(e){}},
    duck(){const m=this.music;if(!m)return;clearTimeout(this.dt);m.volume=this.MV*.35;this.dt=setTimeout(()=>{if(this.music)this.music.volume=this.MV},1800)},
    startBg(){if(this.music||!this.on||this.hush()||!document.querySelector(".vy-sea")||document.hidden)return;
      const S=this.sk;if(!S.snd.music)return;
      try{const m=this.music=new Audio(S.A+S.snd.music);m.loop=true;m.volume=this.MV;let w=null;
        if(S.snd.amb){w=this.sea=new Audio(S.A+S.snd.amb);w.loop=true;w.volume=S.snd.ambVol;w.play().catch(()=>{})}
        // refused (no tap yet): forget both, the next tap tries again
        m.play().catch(()=>{if(this.music===m){try{w&&w.pause()}catch(e){}this.music=this.sea=null}})}catch(e){}},
    stopBg(){[this.music,this.sea].forEach(a=>{try{a&&a.pause()}catch(e){}});this.music=this.sea=null}};
  // the song starts with the first tap on the board (browsers allow sound only after one), and stops when the map is gone (another
  // place of the board), the tab is hidden or class mode starts
  // (pointerdown, click, keydown and touchend: Safari and touch screens count only some of them as a tap; the 🎵 button handles itself)
  ["pointerdown","click","keydown","touchend"].forEach(ev=>addEventListener(ev,e=>{if(!(e.target&&e.target.closest&&e.target.closest('[data-vy="snd"]')))SND.startBg()},{capture:true}));
  setInterval(()=>{if(SND.music&&(!document.querySelector(".vy-sea")||SND.hush()||!SND.on))SND.stopBg()},1500);
  document.addEventListener("visibilitychange",()=>{if(document.hidden)SND.stopBg()});

  // ---- styles ----
  function css(){if(document.getElementById("vy-css"))return;const s=document.createElement("style");s.id="vy-css";s.textContent=`
.vy{margin:0 0 14px}.vy-row{display:flex;gap:14px;height:max(440px,calc(100vh - 250px))}
.vy-sea{position:relative;flex:1;min-width:0;border-radius:20px;overflow:hidden;border:3px solid #b08a52;background:var(--vy-bgc)}
.vy-sea::before{content:"";position:absolute;top:0;bottom:0;left:0;right:calc(-1*var(--vy-bgs));background:linear-gradient(var(--vy-wash),var(--vy-wash)),var(--vy-bg) 0 0/var(--vy-bgs) repeat;animation:vydrift 60s linear infinite}
@keyframes vydrift{to{translate:calc(-1*var(--vy-bgs)) 0}}.vy-sea.still::before{animation:none}
.vy-top{position:absolute;left:0;right:0;top:0;z-index:6;display:flex;justify-content:space-between;align-items:center;gap:8px;padding:9px 14px;background:linear-gradient(#f6ead0f2,#f6ead000);pointer-events:none}
.vy-top small{display:block;font-size:11px;color:#8a5a1f;text-transform:uppercase;letter-spacing:.06em;font-weight:800}.vy-top b{font:700 17px Georgia,serif;color:#4a2f0e}
.vy-sc{position:absolute;inset:0;overflow-y:auto;overflow-x:hidden;scrollbar-width:thin}.vy-map{position:relative}.vy-map>svg{position:absolute;left:0;top:0;pointer-events:none}
.vy-st{position:absolute;width:76px;height:76px;margin:-38px 0 0 -38px;background:var(--vy-st) center/contain no-repeat;display:grid;place-items:center;font-size:23px;padding-bottom:8px;z-index:2;text-decoration:none;border-radius:50%}
.vy-st.done{background-image:var(--vy-std);font-size:0}.vy-st.now{background-image:var(--vy-stn);transform:scale(1.15)}
.vy-st:focus-visible{outline:3px solid #b45309}.vy-st.pop{animation:vypop .7s}@keyframes vypop{40%{transform:scale(1.4)}}
.vy-st.flash{animation:vyflash 1s ease 2}@keyframes vyflash{50%{filter:drop-shadow(0 0 14px #ffd54a) brightness(1.25)}}
.vy-lab{position:absolute;transform:translateY(-50%);max-width:240px;font-size:13px;line-height:1.25;color:#2b1d0b;background:#fbf3dfee;border:1px solid #d9c08a;padding:5px 9px;border-radius:10px;z-index:2;text-decoration:none}
.vy-lab small{display:block;font-size:10.5px;text-transform:uppercase;letter-spacing:.05em;font-weight:800}.vy-lab.done{opacity:.8}.vy-lab.now{background:#fff;font-weight:700;box-shadow:0 2px 8px #0003;border:2px solid #b45309}
.vy-port{position:absolute;left:50%;transform:translate(-50%,-50%);z-index:3;width:min(250px,74%);display:flex;flex-direction:column;align-items:center;text-align:center;gap:2px;background:#fbf3df;border:2px solid #b08a52;border-radius:14px;padding:8px 14px 10px;box-shadow:0 3px 0 #8a6a3a;line-height:1.3}
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
.vy-b img{width:100%;height:100%;display:block}.vy-b i{position:absolute;inset:0;mix-blend-mode:multiply;-webkit-mask:var(--vy-veh) center/contain no-repeat;mask:var(--vy-veh) center/contain no-repeat;clip-path:var(--vy-band)}
.vy-boat:nth-child(2n) .vy-b{animation-duration:3.2s;animation-delay:-.8s}.vy-boat:nth-child(3n) .vy-b{animation-duration:2.6s;animation-delay:-1.5s}
/* veh.drive (vans, buses): a small up-down bounce as if driving, no rocking */
.vy-sea.drive .vy-b{animation-name:vydrive;animation-duration:.9s;animation-timing-function:ease-in-out}.vy-sea.drive .vy-b.big{animation-duration:1s}
.vy-sea.drive .vy-boat:nth-child(2n) .vy-b{animation-duration:1.05s}.vy-sea.drive .vy-boat:nth-child(3n) .vy-b{animation-duration:.8s}
@keyframes vydrive{0%,100%{transform:translateY(0)}50%{transform:translateY(-2.5px)}}
@keyframes vybob{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-5px) rotate(4deg)}}
.vy-you{position:absolute;z-index:4;transform:translate(-50%,-100%);text-align:center}.vy-you b{background:#b45309}
.vy-fog{position:absolute;left:-60px;right:-60px;z-index:4;pointer-events:none}.vy-fog img{position:absolute;width:100%;height:150px;left:0}
.vy-tip{position:absolute;left:50%;transform:translateX(-50%);z-index:5;background:#fff;border-radius:12px;padding:6px 12px;font-size:12.5px;color:#4b5563;box-shadow:0 1px 4px #0002;white-space:nowrap;max-width:92%;overflow:hidden;text-overflow:ellipsis}
.vy-dest{position:absolute;left:50%;transform:translateX(-50%);z-index:5;text-align:center;width:min(330px,92%);background:#fbf3df;border:2px solid #b08a52;border-radius:16px;padding:6px 10px 10px;box-shadow:0 3px 0 #8a6a3a;color:inherit;text-decoration:none}
.vy-dest img{width:180px;height:170px;object-fit:contain;display:block;margin:-4px auto -8px}.vy-dest small{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#b45309;font-weight:800}
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
@media (max-width:640px){.vy-row{height:calc(100vh - 210px);min-height:420px}.vy-top b{font-size:15px}.vy-lab{max-width:140px;font-size:12px}.vy-b.big{width:64px;height:64px}.vy-go a{font-size:17px}.vy-go a small{display:none}.vy-snd span{display:none}}
@media (prefers-reduced-motion:reduce){.vy-b,.vy-deco,.vy-fog img,.vy-sea::before{animation:none}.vy-fws{display:none}}`;document.head.appendChild(s)}

  // ---- the frame (the map itself is laid out by wire, at the width it gets) ----
  const cssVars=S=>{const u=f=>`url(${S.I}${f}.webp)`;return `--vy-bg:${u(S.bg.tile)};--vy-bgs:${S.bg.size}px;--vy-bgc:${S.bg.color};--vy-wash:${S.bg.wash||"transparent"};`
    +`--vy-st:${u(S.stop.step)};--vy-std:${u(S.stop.done)};--vy-stn:${u(S.stop.now)};--vy-veh:${u(S.veh.img)};--vy-band:${S.veh.band||"none"}`};
  function html(V){css();const en=V.en,t=(ca,e)=>en?e:ca,M=model(V),n=M.stops.length,fp=V.fp||{},S=skinOf(V),wd=k=>S.wd(k,en);
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
    return `<section class="vy" aria-label="${esc(wd("title"))}"><div class="vy-row"><div class="vy-sea${S.bg.drift===false?" still":""}${S.veh.drive?" drive":""}" style="${esc(cssVars(S))}"><div class="vy-sc"><div class="vy-map"></div></div>`
      +`<div class="vy-top"><div><small>${esc(V.ls||"")} · ${esc(wd("title"))}</small><b>🏆 ${esc(fp.title||"")}</b></div></div>`
      +`<button type="button" class="vy-btn vy-snd" data-vy="snd"></button><button type="button" class="vy-btn vy-down" data-vy="me" title="${esc(wd("back"))}" aria-label="${esc(wd("back"))}">${S.veh.icon}</button>`
      +`<div class="vy-toast" role="status"></div><div class="vy-ovl"></div></div><aside class="vy-steps">${col}</aside></div><div class="vy-go">${go}</div></section>`}

  // ---- the map ----
  const LAST={};   // scroll position per store, kept when the board draws again
  function wire(root,V){const sea=root&&root.querySelector(".vy-sea");if(!sea)return;
    const en=V.en,t=(ca,e)=>en?e:ca,M=model(V),sc=sea.querySelector(".vy-sc"),map=sea.querySelector(".vy-map"),fp=V.fp||{},S=skinOf(V),wd=k=>S.wd(k,en),I=S.I;
    SND.quiet=V.quiet||(()=>false);if(SND.sk.dir!==S.dir||SND.sk.snd.music!==S.snd.music)SND.stopBg();SND.sk=S;
    const W=sc.clientWidth||800,wide=W>640,cx=W/2,lane=wide?95:32,STEP=wide?118:96,GAP=56,PH=wide?44:72,TOP=wide?440:420,lanes=[0,-1,-1.6,-1,0,1,1.6,1];
    // a port card (square-ish, Roger 20 Nov) never covers a stop, a label or a vehicle: measure each card first and give it the room it
    // needs (half its height + the vehicles' half height ~50 px + a margin, on each side)
    const portCard=it=>{const P=it.port;return `<div class="vy-port${it.done?" ok":""}" style="top:${it.y||0}px"><span class="fl">${P.f}</span><span><b>${esc(P.c)}</b><br><em>${esc(py(P))}</em>${P.h?`<br><i>📜 ${esc(P.h)}</i>`:""}${S.fest&&P.fe?`<br><i class="ce">🎉 ${esc(P.fe)}</i>`:""}</span></div>`};
    const D=S.dest,destCard=()=>`<a class="vy-dest${fp.done?" ok":""}" href="${esc(fp.href||"#")}" style="top:58px"><img src="${I}${D.img}.webp" alt="">${hasFw(S,S.places.length)?fwHtml("left:50%;width:180px;height:70px;transform:translateX(-50%)"):""}<small>${D.f} ${esc(wd("dest"))}: ${esc([D.c,py(D)].filter(Boolean).join(" · "))}</small>`
      +(S.fest&&D.fe?`<small class="ce">🎉 ${esc(D.fe)}</small>`:"")+`<b>${esc(fp.title||"")}</b>${fp.sub?`<p>${esc(fp.sub)}</p>`:""}</a>`;
    map.style.width=W+"px";map.innerHTML=M.ports.map(portCard).join("")+destCard();
    map.querySelectorAll(".vy-port").forEach((el,j)=>{M.ports[j].ph=Math.max(PH,Math.ceil(el.offsetHeight/2)+56-GAP/2)});
    // from the top: the final product card, the vehicles that got there, the fog (only until the final product is sent), then the
    // stops. The fog never covers a vehicle or a label (Roger, 20 Nov): the road starts low enough to leave it its own band
    const dEl=map.querySelector(".vy-dest"),destB=58+(dEl&&dEl.offsetHeight||330),finY=destB+60,FOGH=220,fogTop=destB+110;
    const need=fp.done?finY+150:fogTop+FOGH+70;
    let total,pts,topY;
    const lay=T=>{total=T;M.items.forEach(it=>total+=it.port?GAP+2*it.ph:STEP);total+=90;
      let yy=total-70,li=0;pts=[];
      M.items.forEach(it=>{if(it.port){yy-=GAP/2+it.ph;it.y=yy;yy-=GAP/2+it.ph;return}it.x=cx+lanes[li%lanes.length]*lane;it.y=yy;it.right=it.x<=cx;pts.push([it.x,it.y]);li++;yy-=STEP});
      topY=pts.length?Math.min(...pts.map(p=>p[1])):total-120};
    lay(TOP);if(topY<need)lay(TOP+need-topY);
    map.style.height=total+"px";
    let h="";
    // the route
    if(pts.length){let d=`M${pts[0][0]} ${pts[0][1]+70}`;pts.forEach(([x,y],i)=>{if(!i){d+=` L${x} ${y}`;return}const [px,py]=pts[i-1];d+=` C${px} ${(py+y)/2} ${x} ${(py+y)/2} ${x} ${y}`});
      const l=pts[pts.length-1];d+=` C${l[0]} ${l[1]-80} ${cx} ${l[1]-80} ${cx} 160`;
      h+=`<svg width="${W}" height="${total}" aria-hidden="true"><path d="${d}" fill="none" stroke="${S.road.halo}" stroke-width="${S.road.hw}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${S.road.line}" stroke-width="${S.road.lw}" stroke-dasharray="${S.road.dash}" stroke-linecap="round"/></svg>`}
    // the decorations at the sides (the sea: a compass, sea life), one per place of the skin's list
    if(W>500)[[W-120,total-170,90],[W*.06,TOP+180],[W*.86,TOP+620],[W*.08,TOP+1250],[W*.82,TOP+1500],[W*.88,TOP+40],[W*.1,TOP+1950],[W*.85,TOP+2400],[W*.07,TOP+2900]]
      .map((d,i)=>{const k=(S.decos||[])[i];return Array.isArray(k)?[d[0],d[1],k[1]||d[2]||0,k[0]]:[d[0],d[1],d[2]||0,k]}).filter(d=>d[3]&&d[1]<total-110).forEach(([x,y,w,f],i)=>{const mv=MOVE(f),d=x>W/2?-1:1;   // on the right they set off to the left
        h+=`<img class="vy-deco${mv?" "+mv[0]:""}" src="${I}${f}.webp" style="left:${x}px;top:${y}px;${w?`width:${w}px;`:""}${mv?`--d:${d};--f:${d*mv[1]};--t:${14+i%3*3}s;--dl:-${i*2.3}s`:""}" alt="">`});
    // ports: the label on the route, the picture at the side
    M.ports.forEach((it,j)=>{const P=it.port,img=P.img;
      h+=portCard(it);
      if(W>560){const left=j%2===0,sz=Math.min(280,W*.27),px=left?Math.max(-20,cx-lane*2-sz-150):Math.min(W-sz+20,cx+lane*2+150);
        h+=`<div class="vy-pimg" style="left:${px}px;top:${it.y-sz*.95}px;width:${sz}px"><img src="${I}${img}.webp" alt="">${hasFw(S,it.pi)?fwHtml():""}<span class="ln">${P.f} ${esc(P.c)}</span></div>`}});
    // the stops
    const now=M.stops.find(s=>s.key===V.now);
    M.stops.forEach(s=>{const k=SK[s.sk]||SK.Step,nw=now&&s.key===now.key,c=(s.done?" done":"")+(nw?" now":""),lx=s.right?s.x+36:s.x-36;
      h+=`<a class="vy-st${c}" href="${esc(s.href)}" data-k="${esc(s.key)}" style="left:${s.x}px;top:${s.y}px" title="${esc(skName(s.sk,en)+" · "+s.t)}">${k[0]}</a>`
        +`<a class="vy-lab${c}" href="${esc(s.href)}" style="${s.right?`left:${lx}px`:`right:${W-lx}px`};top:${s.y}px"><small style="color:${k[1]}">${esc(skName(s.sk,en))}</small>${esc(s.t)}</a>`});
    // boats: every student by the steps done (one past the last stop = at the destination)
    const n=M.stops.length,spot=x=>Math.max(0,Math.min(n,x|0));
    const at={};(V.mates||[]).forEach(m=>{const i=spot(m.s);(at[i]=at[i]||[]).push(m)});
    const meI=spot(V.me&&V.me.s!=null?V.me.s:M.done);
    const YO=wide?78:74,XY=i=>i<n?(s=>[s.x+(s.right?-YO:YO),s.y+48])(M.stops[i]):[cx+(wide?200:110),finY+36],meXY=XY(meI);M.xy=XY;M.meI=meI;
    // at a stop the vehicles stand in one row on the side without the label: yours next to the stop, then the classmates that fit
    // (never on top of each other or of the stop; the others become "+3", names on hover)
    const bw=m=>Math.max(52,String(m.n).length*7.5+16)+4;
    for(const i in at){const L=at[i].sort((a,b)=>String(a.n).localeCompare(b.n)),s=+i<n?M.stops[i]:null,off=+i===meI&&V.me?(wide?100:72):0;
      let room=s?(s.right?s.x-40:W-s.x-40)-off-4:W-8,sh=[],used=0;
      for(const m of L){const w=bw(m),left=L.length-sh.length-1;if(sh.length>=(wide?4:3)||used+w+(left?36:0)>room)break;sh.push(m);used+=w}
      const more=L.length-sh.length,max=sh.length;
      const boats=sh.map(m=>`<div class="vy-boat" title="${esc(m.n)}">${BOAT(S,col(m.n),0,m.n)}<b style="background:${col(m.n)}">${esc(m.n)}</b></div>`).join("")+(more?`<span class="vy-more" title="${esc(L.slice(max).map(m=>m.n).join(", "))}">+${more}</span>`:"");
      const wB=used+(more?36:0);
      if(s){const x=s.right?s.x-40-wB-off:s.x+40+off;h+=`<div class="vy-mates" style="left:${x}px;top:${s.y}px">${boats}</div>`}
      else h+=`<div class="vy-mates" style="left:${Math.max(4,cx-(wide?200:110)-wB/2)}px;top:${finY}px">${boats}</div>`}
    if(V.me)h+=`<div class="vy-you" style="left:${meXY[0]}px;top:${meXY[1]}px"><b>${t("Tu","You")}</b>${BOAT(S,"#b45309",1,V.me.n)}</div>`;
    // fog over what is not open yet, then the destination: the final product
    if(!fp.done){const fg=`${I}${S.fog}.webp`;const ft=topY-70-FOGH;h+=`<div class="vy-fog" style="top:${ft}px;height:${FOGH}px"><img src="${fg}" style="top:0" alt=""><img src="${fg}" style="top:35px;transform:scaleX(-1)" alt=""><img src="${fg}" style="top:70px" alt=""></div>`
      +`<div class="vy-tip" style="top:${ft+95}px">🌫️ ${esc(wd("tip"))}</div>`}
    h+=destCard();
    map.innerHTML=h;
    // where the view starts: where it was, else my boat
    const toMe=b=>sc.scrollTo({top:Math.max(0,meXY[1]-sc.clientHeight*.55),behavior:b?"smooth":"auto"});
    if(LAST[V.store]!=null&&LAST.w===W)sc.scrollTop=LAST[V.store];else toMe();LAST.w=W;
    sc.addEventListener("scroll",()=>{LAST[V.store]=sc.scrollTop},{passive:true});
    // buttons
    const sb=sea.querySelector('[data-vy="snd"]'),setSb=()=>{const on=SND.on&&!SND.hush();sb.innerHTML=on?`🎵 <span>${t("Música sí","Music on")}</span>`:`🔇 <span>${t("Música no","Music off")}</span>`;sb.classList.toggle("off",!on)};setSb();
    // a tap on 🎵 always does what it says: sound off → on; on but not playing yet (no tap on the page before) → it starts; playing → off
    sb.onclick=e=>{e.stopPropagation();
      if(SND.hush()){SND.force=true;SND.on=true;SND.startBg()}
      else if(SND.on&&!SND.music){SND.startBg()}
      else{SND.on=!SND.on;if(!SND.on)SND.force=false;SND.on?SND.startBg():SND.stopBg();if(!SND.quiet())try{localStorage.setItem("el_voyage_snd",SND.on?"1":"0")}catch(e){}}
      setSb()};
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
    const en=V.en,S=skinOf(V),od=new Set(old.d||[]),ok=new Set(old.k||[]),op=new Set(old.p||[]);
    const newDone=now.d.filter(k=>!od.has(k)),newStops=now.k.filter(k=>!ok.has(k)),newPorts=now.p.filter(p=>!op.has(p));
    // the board may draw again in the meantime (the LS page arrives, the classmates arrive): look the map up when each effect plays
    const el=k=>[...document.querySelectorAll(".vy-sea .vy-st")].find(e=>e.dataset.k===k),li=k=>[...document.querySelectorAll(".vy-steps li.s")].find(e=>e.dataset.k===k);
    let delay=300;
    // veh.drive: my vehicle drives along the road from where it was (the steps done last time) to where it is now, then the step pops
    const fromI=M.stops.filter(s=>od.has(s.key)).length,still=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(S.veh.drive&&newDone.length&&M.xy&&M.meI>fromI&&!still){const to=M.xy(M.meI),pts=[];for(let i=fromI;i<=M.meI;i++)pts.push(M.xy(i));
      setTimeout(()=>{const y=document.querySelector(".vy-sea .vy-you");if(!y||!y.animate)return;
        const sc=document.querySelector(".vy-sea .vy-sc");if(sc)sc.scrollTo({top:Math.max(0,pts[0][1]-sc.clientHeight*.55)});
        SND.play("horn",.7);y.animate(pts.map(p=>({translate:`${p[0]-to[0]}px ${p[1]-to[1]}px`})),{duration:Math.min(2400,700+300*(pts.length-1)),easing:"ease-in-out"});
        if(sc)sc.scrollTo({top:Math.max(0,to[1]-sc.clientHeight*.55),behavior:"smooth"})},delay);delay+=Math.min(2400,700+300*(pts.length-1))+150}
    if(newDone.length){setTimeout(()=>{newDone.forEach(k=>{const e=el(k);if(e){e.classList.remove("pop");void e.offsetWidth;e.classList.add("pop")}const l=li(k);if(l)l.classList.add("pop")});SND.play("step")},delay);delay+=900}
    if(newStops.length&&old.k&&old.k.length){setTimeout(()=>{newStops.forEach(k=>{const e=el(k);if(e)e.classList.add("flash")});SND.play("fog",.6)},delay);delay+=900}
    if(newPorts.length){const it=M.ports.find(p=>p.pi===newPorts[newPorts.length-1]),P=it.port;
      setTimeout(()=>{const T=document.querySelector(".vy-sea .vy-toast");if(!T)return;T.innerHTML=`<div class="big">${P.f} 🏅</div><b>${esc(S.wd("reached",en))}: ${esc(P.c)}!</b><small>${esc(py(P))}${P.h?` · 📜 ${esc(P.h)}`:""}</small>${S.fest&&P.fe?`<small class="ce">🎉 ${esc(P.fe)}</small>`:""}`;
        T.classList.add("on");SND.play("port");setTimeout(()=>T.classList.remove("on"),5000)},delay);delay+=5200}
    if(now.f&&!old.f)setTimeout(()=>{const s=document.querySelector(".vy-sea");if(s)voyageDone(s,V)},delay)}
  function voyageDone(sea,V){const en=V.en,t=(ca,e)=>en?e:ca,O=sea.querySelector(".vy-ovl"),S=skinOf(V),D=S.dest,fp=V.fp||{},wd=k=>esc(S.wd(k,en));
    O.innerHTML=`<div class="card"><img src="${S.I}${D.img}.webp" alt=""><div style="font-size:30px">${D.f} 🏆</div><h3>${wd("done")}</h3>`
      +`<p>${wd("reach")} <b>${esc(py(D))}</b>, ${wd("end")}</p><p>${t("El teu","Your")} <b>${esc(fp.title||"")}</b> ${t("ja és amb el professor.","is with your teacher now.")}</p>`
      +(S.fest&&D.fe?`<p class="ce">🎉 ${esc(D.fe)}</p>`:"")+`<button type="button">${S.veh.icon} ${wd("map")}</button></div>`;
    O.classList.add("on");O.querySelector("button").onclick=()=>O.classList.remove("on");SND.play("voyage",.9);
    const R=O.getBoundingClientRect(),cols=["#ffd54a","#ff6b6b","#4fc3f7","#81c784","#f48fb1","#fff"];
    for(let b=0;b<6;b++)setTimeout(()=>{const x=R.width*(.15+Math.random()*.7),y=R.height*(.12+Math.random()*.3);
      for(let i=0;i<26;i++){const d=document.createElement("i");d.className="vy-fw";const a=i/26*6.283,r=60+Math.random()*50;
        d.style.cssText=`left:${x}px;top:${y}px;background:${cols[(b+i)%6]};color:${cols[(b+i)%6]};--x:${Math.cos(a)*r}px;--y:${Math.sin(a)*r}px`;O.appendChild(d);setTimeout(()=>d.remove(),1500)}},b*450)}

  window.elVoyage={html,wire,model,skill,PORTS,DEST,SEA,SKINS,SND,skin:skinOf,
    // a skill's label, icon and colour (the activity pages' 🧭 Your steps, el-app.js, get them from the board's copy)
    sk:(k,en)=>({n:skName(k,en),i:(SK[k]||SK.Step)[0],c:(SK[k]||SK.Step)[1]}),
    // the first name of "Surname Surname, Name" (the student list) or of "Name Surname"
    first:n=>{n=String(n||"").trim();return (n.includes(",")?n.split(",")[1].trim().split(/\s+/)[0]:n.split(/[\s@]+/)[0]||"").slice(0,40)}};
})();
