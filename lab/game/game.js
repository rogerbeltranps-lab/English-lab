// English Lab class game (Roger, 26 Oct 2026): what the board (host.html) and the player (play.html) share. window.ELGame:
//   md(text)        a deck's text as HTML: **word** is highlighted, ___ is a gap (everything else is escaped)
//   pic(img)        a picture: an emoji, or an image file (a path or https address)
//   shuffle(n,seed) the order of n options for one question of one game (the same on every reload)
//   norm(text)      a written answer made comparable: lower case, straight apostrophes, single spaces, no full stop at the end
//   right(text,ok)  whether a written answer is one of the accepted answers ok (already normalised, as the board publishes them)
//   music(name)     background music, made with the Web Audio API (no files): "lobby", "think" or "" (stop); only the board plays it
//   fx(name)        a sound effect: join, tap, next, reveal, right, wrong, fanfare, drum
//   sound(on)       sound on or off in this browser (kept as el_game_sound); sound() says which
//   confetti()      a burst of confetti
//   bg()            the floating shapes behind the page
(function(){
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const md=s=>esc(s).replace(/\*\*(.+?)\*\*/g,'<b class="k">$1</b>').replace(/_{3,}/g,'<span class="gap"></span>');
const pic=s=>!s?"":/^(https?:|\.{0,2}\/)|\.(png|jpe?g|gif|svg|webp)$/i.test(s)?`<img src="${esc(s)}" alt="">`:esc(s);
const norm=s=>String(s??"").toLowerCase().replace(/[\u2018\u2019\u02bc`´]/g,"'").replace(/\s+/g," ").trim().replace(/[.!?]+$/,"").trim();
const right=(s,ok)=>s!=null&&Array.isArray(ok)&&ok.includes(norm(s));
function shuffle(n,seed){   // seeded Fisher–Yates (mulberry32)
  let a=[...Array(n).keys()],t=(+seed||1)>>>0;
  const r=()=>{t=(t+0x6D2B79F5)>>>0;let x=Math.imul(t^(t>>>15),1|t);x=(x+Math.imul(x^(x>>>7),61|x))^x;return ((x^(x>>>14))>>>0)/4294967296};
  for(let i=n-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
  return a;
}

/* ---------- sound ---------- */
let ctx=null,out=null,noise=null;
const on=()=>{try{return localStorage.getItem("el_game_sound")!=="off"}catch(e){return true}};
function ac(){
  if(!ctx){const A=window.AudioContext||window.webkitAudioContext;if(!A)return null;try{ctx=new A();out=ctx.createGain();out.gain.value=on()?1:0;out.connect(ctx.destination)}catch(e){return null}}
  if(ctx.state==="suspended")ctx.resume().catch(()=>{});
  return ctx;
}
["pointerdown","keydown"].forEach(t=>addEventListener(t,()=>ac(),{capture:true,passive:true}));   // browsers start audio only after a tap or a key
const hz=m=>440*Math.pow(2,(m-69)/12);
function tone(t,f,d,type,v,dest,to){
  const a=ctx,o=a.createOscillator(),g=a.createGain();
  o.type=type||"sine";o.frequency.setValueAtTime(f,t);if(to)o.frequency.exponentialRampToValueAtTime(to,t+d);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  o.connect(g).connect(dest||out);o.start(t);o.stop(t+d+.05);
}
function hiss(t,d,v,freq,dest,q){
  if(!noise){noise=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const c=noise.getChannelData(0);for(let i=0;i<c.length;i++)c[i]=Math.random()*2-1}
  const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();
  s.buffer=noise;f.type=freq>3000?"highpass":"bandpass";f.frequency.value=freq;f.Q.value=q||1;
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  s.connect(f).connect(g).connect(dest||out);s.start(t);s.stop(t+d+.02);
}
const kick=(t,dest)=>tone(t,150,.28,"sine",.55,dest,40);

// Music: four bars of four chords that loop, 16 steps a bar. Each song: tempo, chords (root MIDI note, minor?), and what plays on each step.
const SONGS={
  lobby:{bpm:124,chords:[[60,0],[57,1],[53,0],[55,0]],
    step(t,s,ch,d,m){const [r,mi]=ch,tn=[r,r+(mi?3:4),r+7,r+12];
      if(s%8===0)kick(t,m);
      if(s===4||s===12)hiss(t,.16,.25,1800,m,.7);
      if(s%4===2)hiss(t,.05,.16,8000,m);
      if([0,3,6,8,11,14].includes(s))tone(t,hz(r-24),d*1.6,"triangle",.32,m);
      if(s%2===0)tone(t,hz(tn[(s/2)%4]+12),d*1.5,"square",.045,m);
      if(s===0||s===8)tn.slice(0,3).forEach(n=>tone(t,hz(n),d*7,"sawtooth",.018,m));}},
  think:{bpm:104,chords:[[57,1],[53,0],[60,0],[55,0]],
    step(t,s,ch,d,m){const [r,mi]=ch,tn=[r,r+(mi?3:4),r+7];
      hiss(t,.03,s%4===0?.12:.06,9000,m);
      if(s%8===0)kick(t,m);
      if(s%2===0)tone(t,hz(r-24),d*.9,"triangle",.26,m);
      if(s%4===1)tone(t,hz(tn[(s>>2)%3]+12),d*1.2,"sine",.09,m);
      if(s===0)tn.forEach(n=>tone(t,hz(n),d*15,"triangle",.025,m));}},
};
let song=null,mGain=null,timer=null,next=0,step=0;
function music(name){
  const a=ac();if(!a)return;
  if(name===song)return;
  if(mGain){const g=mGain;g.gain.setTargetAtTime(.0001,a.currentTime,.25);setTimeout(()=>g.disconnect(),1500)}
  clearInterval(timer);song=name||null;mGain=null;if(!song)return;
  const S=SONGS[song];mGain=a.createGain();mGain.gain.value=.0001;mGain.gain.setTargetAtTime(.55,a.currentTime,.4);mGain.connect(out);
  const d=60/S.bpm/4,m=mGain;next=a.currentTime+.1;step=0;
  timer=setInterval(()=>{while(next<a.currentTime+.2){const s=step%16,bar=Math.floor(step/16)%S.chords.length;try{S.step(next,s,S.chords[bar],d,m)}catch(e){}next+=d;step++}},40);
}
const FX={
  join:t=>tone(t,620,.16,"sine",.3,null,1240),
  tap:t=>{tone(t,880,.08,"square",.08);tone(t+.05,1320,.1,"square",.06)},
  next:t=>hiss(t,.35,.35,1200,null,.5),
  reveal:t=>{kick(t);tone(t,196,1.2,"triangle",.3);tone(t,294,1.1,"sine",.18);hiss(t,.6,.2,5000)},
  right:t=>[523,659,784,1047].forEach((f,i)=>tone(t+i*.09,f,i===3?.7:.18,"triangle",.3)),
  wrong:t=>{tone(t,330,.3,"sawtooth",.12,null,294);tone(t+.3,247,.6,"sawtooth",.12,null,185)},
  fanfare:t=>{[[523,0],[659,.14],[784,.28],[1047,.42]].forEach(([f,s])=>tone(t+s,f,.2,"square",.08));[523,659,784,1047].forEach(f=>tone(t+.6,f,1.4,"triangle",.14));hiss(t+.6,1.2,.15,6000)},
  drum:t=>{for(let i=0;i<22;i++)hiss(t+i*.07,.06,.08+i*.012,900,null,.6);kick(t+1.6);hiss(t+1.6,1.4,.3,6000)},
};
function fx(n){if(!on()||!FX[n])return;const a=ac();if(!a)return;try{FX[n](a.currentTime+.02)}catch(e){}}
function sound(v){
  if(v===undefined)return on();
  try{localStorage.setItem("el_game_sound",v?"on":"off")}catch(e){}
  const a=ac();if(a&&out)out.gain.setTargetAtTime(v?1:0,a.currentTime,.05);
  return v;
}

/* ---------- confetti ---------- */
function confetti(){
  if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const c=document.createElement("canvas");c.className="confetti";document.body.append(c);
  const x=c.getContext("2d"),W=c.width=innerWidth,H=c.height=innerHeight,col=["#e8384f","#2f7de1","#ffc83d","#2ea84a","#ffffff","#b67cff"];
  const P=Array.from({length:160},()=>({x:Math.random()*W,y:-20-Math.random()*H*.5,vx:(Math.random()-.5)*3,vy:2+Math.random()*4,s:6+Math.random()*8,r:Math.random()*6,vr:(Math.random()-.5)*.3,c:col[Math.floor(Math.random()*col.length)]}));
  const t0=performance.now();
  (function f(t){x.clearRect(0,0,W,H);P.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.04;p.r+=p.vr;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.c;x.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);x.restore()});
    t-t0<4200?requestAnimationFrame(f):c.remove()})(t0);
}
function bg(){const d=document.createElement("div");d.className="bgfx";d.setAttribute("aria-hidden","true");
  d.innerHTML=Array.from({length:14},(_,i)=>`<i style="left:${(i*7.3+3)%100}%;width:${40+(i*17)%70}px;height:${40+(i*17)%70}px;animation-duration:${14+(i*5)%16}s;animation-delay:-${(i*3.7)%18}s"></i>`).join("");
  document.body.prepend(d)}

window.ELGame={esc,md,pic,norm,right,shuffle,music,fx,sound,confetti,bg};
})();
