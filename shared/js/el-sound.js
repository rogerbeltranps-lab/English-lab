// Sound effects (Roger, 25 Oct 2026) for the class presentations, the team points and the buzzer. Made with the Web Audio API,
// so there are no sound files to load. ELSound.play(name) plays one; ELSound.on() says whether sound is on in this browser and
// ELSound.set(on) switches it (kept as el_sound, so a mute lasts). Browsers play sound only after a tap or a key on the page,
// so the first tap or key unlocks it. Used by the presentations (the deck's own tools).
//   open  the buzzers open            first  a team buzzed first (buzzer + bell)   right  ✓ Right · +1     wrong  ✗ Wrong
//   point a team gets +1 on the strip  press  a student presses the buzzer          win    my team was first
//   tick  3 · 2 · 1                    go     Show!                                 pick   a random number   time  the timer ends
(function(){
  let ctx=null;
  const on=()=>{try{return localStorage.getItem("el_sound")!=="off"}catch(e){return true}};
  const set=v=>{try{localStorage.setItem("el_sound",v?"on":"off")}catch(e){}if(v)ac()};   // 🔇→🔊 is a tap: start the audio now
  const ac=()=>{
    if(!ctx){const A=window.AudioContext||window.webkitAudioContext;if(!A)return null;try{ctx=new A()}catch(e){return null}}
    if(ctx.state==="suspended")ctx.resume().catch(()=>{});
    return ctx;
  };
  ["pointerdown","keydown"].forEach(t=>addEventListener(t,()=>{if(on())ac()},{capture:true,passive:true}));
  // one note: t seconds from now, f Hz for d seconds, wave type, peak volume v, sliding to Hz `to`
  function note(a,t,f,d,type,v,to){
    const o=a.createOscillator(),g=a.createGain(),s=a.currentTime+.01+t;
    o.type=type||"sine";o.frequency.setValueAtTime(f,s);if(to)o.frequency.exponentialRampToValueAtTime(to,s+d);
    g.gain.setValueAtTime(.0001,s);g.gain.exponentialRampToValueAtTime(v||.2,s+.015);g.gain.exponentialRampToValueAtTime(.0001,s+d);
    o.connect(g).connect(a.destination);o.start(s);o.stop(s+d+.05);
  }
  const arp=(a,fs,step,type,v,last)=>fs.forEach((f,i)=>note(a,i*step,f,i===fs.length-1?last:step*1.6,type,v));
  const FX={
    open:a=>{note(a,0,659,.16,"triangle",.22);note(a,.13,988,.3,"triangle",.22)},
    first:a=>{note(a,0,131,.38,"square",.07);note(a,0,139,.38,"sawtooth",.06);note(a,.4,1319,.7,"sine",.25);note(a,.4,2637,.35,"sine",.05)},
    right:a=>arp(a,[523,659,784,1047],.1,"triangle",.22,.6),
    wrong:a=>{note(a,0,330,.3,"sawtooth",.08,294);note(a,.32,247,.6,"sawtooth",.08,185)},
    point:a=>{note(a,0,988,.09,"square",.05);note(a,.08,1319,.3,"square",.05)},
    press:a=>note(a,0,196,.14,"square",.08,147),
    win:a=>arp(a,[784,988,1175,1568],.08,"triangle",.2,.55),
    tick:a=>note(a,0,880,.12,"sine",.22),
    go:a=>{note(a,0,1319,.4,"sine",.25);note(a,0,1760,.4,"sine",.08)},
    pick:a=>{[0,1,2,3,4,5].forEach(i=>note(a,i*.045,500+i*90,.05,"square",.035));note(a,.3,1175,.3,"triangle",.2)},
    time:a=>[0,.28,.56].forEach(t=>note(a,t,660,.22,"sine",.22)),
  };
  window.ELSound={play(n){if(!on()||!FX[n])return;const a=ac();if(!a)return;try{FX[n](a)}catch(e){}},on,set};
})();
