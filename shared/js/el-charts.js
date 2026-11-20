// 📈 Small SVG charts for the teacher dashboard's 🌱 Progress place (Roger, 20 Nov 2026: "skill mastery over time is super (formative
// assessment)"). No library: plain SVG strings, so nothing new to download on a school Chromebook and no Firestore reads (the dashboard
// passes what it already has). ELCharts.line(o) = skills over time, ELCharts.radar(o) = one value per skill, ELCharts.wire() = the hover
// layer for both (a tooltip on any [data-tip], a crosshair on a line chart's week columns). Text never takes a series colour: the colour
// is on the marks, the words stay ink.
(function(){
  const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const r1=n=>Math.round(n*10)/10;
  // a marker shape (8px and up, with a 2px white ring so overlapping points stay apart): the second cue next to the colour
  function mark(shape,x,y,col,tip){const t=tip?` data-tip="${esc(tip)}"`:"",a=`fill="${col}" stroke="#fff" stroke-width="2" class="elc-pt"${t}`;
    if(shape==="square")return `<rect x="${r1(x-4.5)}" y="${r1(y-4.5)}" width="9" height="9" rx="1.5" ${a}/>`;
    if(shape==="diamond")return `<path d="M${r1(x)} ${r1(y-6)}L${r1(x+6)} ${r1(y)}L${r1(x)} ${r1(y+6)}L${r1(x-6)} ${r1(y)}Z" ${a}/>`;
    if(shape==="triangle")return `<path d="M${r1(x)} ${r1(y-6)}L${r1(x+6)} ${r1(y+4.5)}L${r1(x-6)} ${r1(y+4.5)}Z" ${a}/>`;
    return `<circle cx="${r1(x)}" cy="${r1(y)}" r="5" ${a}/>`}
  // end labels that would overlap are pushed apart (min 15px), staying inside the plot
  function spread(ls,top,bot){ls.sort((a,b)=>a.y-b.y);for(let i=1;i<ls.length;i++)if(ls[i].y-ls[i-1].y<15)ls[i].y=ls[i-1].y+15;
    const over=ls.length?ls[ls.length-1].y-bot:0;if(over>0)for(let i=ls.length-1;i>=0;i--){ls[i].y-=over;if(i&&ls[i].y-ls[i-1].y>=15)break}
    ls.forEach(l=>l.y=Math.max(top,l.y));return ls}

  // o = {x:[labels], tips:[html per column, optional], series:[{label, icon, color, shape, dash, v:[0-100 | null]}], marks:[{i, label}], h, unit}
  function line(o){
    const W=960,H=o.h||300,L=46,R=205,T=22,B=30,iw=W-L-R,ih=H-T-B,n=o.x.length,unit=o.unit==null?" %":o.unit;
    const x=i=>L+(n<2?iw/2:i*iw/(n-1)),y=v=>T+ih*(1-Math.max(0,Math.min(100,v))/100);
    let g="";
    [0,25,50,75,100].forEach(v=>{g+=`<line x1="${L}" x2="${L+iw}" y1="${y(v)}" y2="${y(v)}" stroke="${v===50?"#cbd5e1":"#eef2f7"}" stroke-width="1"${v===50?' stroke-dasharray="4 4"':""}/>`
      +`<text x="${L-8}" y="${y(v)+4}" text-anchor="end" class="elc-ax">${v}${unit}</text>`});
    const step=Math.max(1,Math.ceil(n/9));
    o.x.forEach((lab,i)=>{if(i%step&&i!==n-1)return;g+=`<text x="${x(i)}" y="${H-8}" text-anchor="middle" class="elc-ax">${esc(lab)}</text>`});
    // where each LS starts: a thin line and its short name at the top
    (o.marks||[]).forEach(m=>{const xx=x(m.i)-(n>1?iw/(n-1)/2:0);if(m.i>0)g+=`<line x1="${xx}" x2="${xx}" y1="${T-6}" y2="${T+ih}" stroke="#94a3b8" stroke-width="1" stroke-dasharray="2 3"/>`;
      g+=`<text x="${Math.max(L,xx)+4}" y="${T-8}" class="elc-ls">${esc(m.label)}</text>`});
    g+=`<line class="elc-xh" x1="0" x2="0" y1="${T}" y2="${T+ih}" stroke="#334155" stroke-width="1" visibility="hidden"/>`;
    const ends=[];
    o.series.forEach(s=>{const pts=s.v.map((v,i)=>v==null?null:[x(i),y(v),v]).filter(Boolean);if(!pts.length)return;
      if(pts.length>1)g+=`<polyline points="${pts.map(p=>r1(p[0])+","+r1(p[1])).join(" ")}" fill="none" stroke="${s.color}" stroke-width="${s.thin?1.5:2}" stroke-linejoin="round" stroke-linecap="round"${s.dash?` stroke-dasharray="${s.dash}"`:""}/>`;
      if(!s.thin)pts.forEach(p=>g+=mark(s.shape,p[0],p[1],s.color));
      // the end label: its latest value, with that week when it is not the last one (a skill not checked lately says since when)
      const e=pts[pts.length-1],li=s.v.length-1-[...s.v].reverse().findIndex(v=>v!=null);
      if(!s.thin)ends.push({y:e[1]+4,x:e[0],t:(s.icon?s.icon+" ":"")+s.label+" "+Math.round(e[2])+unit+(li<n-1?" ("+o.x[li]+")":""),c:s.color})});
    spread(ends,T+4,T+ih+4).forEach(l=>g+=`<text x="${L+iw+12}" y="${r1(l.y)}" class="elc-end">${esc(l.t)}</text>`);
    // the hover columns: one per week, wider than the marks
    const cw=n>1?iw/(n-1):iw;
    o.x.forEach((lab,i)=>{const tip=(o.tips||[])[i];if(!tip)return;g+=`<rect class="elc-col" x="${r1(x(i)-cw/2)}" y="${T}" width="${r1(cw)}" height="${ih}" fill="transparent" data-x="${r1(x(i))}" data-tip="${esc(tip)}"/>`});
    return `<svg class="elc elc-line" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.aria||"")}">${g}</svg>`}

  // o = {axes:[{label, icon}], series:[{label, color, v:[0-100|null], dash, fill}], size}
  function radar(o){
    const S=o.size||340,PX=90,c=S/2,rad=S/2-46,n=o.axes.length,ang=i=>(-90+i*360/n)*Math.PI/180;   // PX: room on both sides for the labels
    const pt=(i,v)=>[PX+c+Math.cos(ang(i))*rad*v/100,c+Math.sin(ang(i))*rad*v/100];
    let g="";
    [25,50,75,100].forEach(v=>g+=`<polygon points="${o.axes.map((a,i)=>pt(i,v).map(r1).join(",")).join(" ")}" fill="none" stroke="${v===50?"#cbd5e1":"#eef2f7"}" stroke-width="1"${v===50?' stroke-dasharray="4 4"':""}/>`);
    o.axes.forEach((a,i)=>{const [ex,ey]=pt(i,100),[lx,ly]=pt(i,116),an=Math.abs(lx-PX-c)<8?"middle":lx<PX+c?"end":"start";
      g+=`<line x1="${PX+c}" y1="${c}" x2="${r1(ex)}" y2="${r1(ey)}" stroke="#eef2f7"/><text x="${r1(lx)}" y="${r1(ly+4)}" text-anchor="${an}" class="elc-rl">${esc((a.icon?a.icon+" ":"")+a.label)}</text>`});
    [50,100].forEach(v=>g+=`<text x="${PX+c+3}" y="${r1(c-rad*v/100-3)}" class="elc-ax">${v}</text>`);
    // a skill with no value leaves a gap: the outline joins only neighbouring axes that both have one, and fills only when every axis has one
    o.series.forEach(s=>{const full=s.v.every(v=>v!=null),da=s.dash?` stroke-dasharray="${s.dash}"`:"";
      if(full)g+=`<polygon points="${s.v.map((v,i)=>pt(i,v).map(r1).join(",")).join(" ")}" fill="${s.fill?s.color:"none"}" fill-opacity="${s.fill?0.14:0}" stroke="${s.color}" stroke-width="2" stroke-linejoin="round"${da}/>`;
      else s.v.forEach((v,i)=>{const w=s.v[(i+1)%n];if(v==null||w==null||n<3&&i===n-1)return;const [a,b]=pt(i,v),[c2,d]=pt((i+1)%n,w);
        g+=`<line x1="${r1(a)}" y1="${r1(b)}" x2="${r1(c2)}" y2="${r1(d)}" stroke="${s.color}" stroke-width="2" stroke-linecap="round"${da}/>`});
      s.v.forEach((v,i)=>{if(v==null)return;const [px,py]=pt(i,v);g+=mark(s.shape||"circle",px,py,s.color,`<b>${esc(o.axes[i].label)}</b> · ${esc(s.label)}: ${Math.round(v)} %`)})});
    return `<svg class="elc elc-radar" viewBox="0 0 ${S+2*PX} ${S}" role="img" aria-label="${esc(o.aria||"")}">${g}</svg>`}

  // the hover layer, once per page: a tooltip for any [data-tip], and the crosshair of a line chart following its week column
  function wire(){if(wire.on)return;wire.on=true;
    const tip=document.createElement("div");tip.className="elc-tip";tip.hidden=true;document.body.appendChild(tip);
    const hide=()=>{tip.hidden=true;document.querySelectorAll(".elc-xh").forEach(l=>l.setAttribute("visibility","hidden"))};
    const show=(el,cx,cy)=>{tip.innerHTML=el.getAttribute("data-tip");tip.hidden=false;
      const w=tip.offsetWidth,h=tip.offsetHeight;let l=cx+14,t=cy+14;if(l+w>innerWidth-8)l=cx-w-14;if(t+h>innerHeight-8)t=cy-h-14;tip.style.left=Math.max(8,l)+"px";tip.style.top=Math.max(8,t)+"px";
      const svg=el.closest("svg"),xh=svg&&svg.querySelector(".elc-xh");document.querySelectorAll(".elc-xh").forEach(l=>{if(l!==xh)l.setAttribute("visibility","hidden")});
      if(xh&&el.hasAttribute("data-x")){xh.setAttribute("x1",el.getAttribute("data-x"));xh.setAttribute("x2",el.getAttribute("data-x"));xh.setAttribute("visibility","visible")}};
    document.addEventListener("mousemove",e=>{const el=e.target.closest&&e.target.closest("[data-tip]");if(el&&el.closest(".elc-wrap"))show(el,e.clientX,e.clientY);else if(!tip.hidden)hide()});
    // touch: a tap shows it, a tap elsewhere hides it
    document.addEventListener("click",e=>{const el=e.target.closest&&e.target.closest(".elc-wrap [data-tip]");if(el)show(el,e.clientX,e.clientY);else hide()});
    addEventListener("scroll",hide,{passive:true})}

  window.ELCharts={line,radar,wire};
})();
