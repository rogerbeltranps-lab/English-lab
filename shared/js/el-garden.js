// 🌱 My garden (Roger, 17 Nov 2026: "Gardens to have all the tasks done (not always homework)"): on the student board's home, every
// activity (tab) of the current LS is a plant in the garden. Each open learning path is a bed with a little sign (LP1, LP2…), each
// recall checkpoint is a tree, the final product grows pumpkins and the optional sample exam golden flowers. A plant shows how far the
// tab is: 🌱 a sprout (not started), a bud (started), a flower (done), and a thirsty, drooping plant with a 💧 when it is on ✅ To do
// (we did it in class and it is not finished yet). The flower depends on the kind of tab (vocabulary daisy, grammar tulip, reading
// sunflower, listening bluebell, speaking rose, writing lavender, recall mushroom). A finished bed gets a butterfly; the whole garden
// finished gets a rainbow. Every plant is a link to its tab. Only open paths and tabs are planted: students never see what is locked.
// Nothing new is read or saved in Firestore: the board passes what it already has (elGarden(G, {en})). The flowers already seen on this
// computer are kept in localStorage (G.store), so new ones pop up with "+N new flowers since last time".
(function(){
  const KINDS={
    vocab:/^(vocab|vocabEx|words|cards|practice)$/,
    grammar:/^(grammar\w*|mixed)$/,
    read:/^(read|log|book|ch\d+|sources|register|respect|notes|credit|parts)$/,
    listen:/^(listen|again|chart)$/,
    speak:/^(speak|talk|shadow|shadowing|sq\d+)$/,
    write:/^(write|email|factfile|card|script|slides|plan)$/,
    recall:/^(recall|check|self|scores|reflect)$/,
  };
  const kindOf=(id,bed)=>bed==="fp"?"fp":bed==="bonus"?"bonus":Object.keys(KINDS).find(k=>KINDS[k].test(id||""))||"other";
  // colour of each flower (petals, then a darker shade for buds and outlines)
  const COL={vocab:["#ffffff","#e2e8f0"],grammar:["#f43f5e","#be123c"],read:["#fbbf24","#b45309"],listen:["#6366f1","#4338ca"],speak:["#ec4899","#9d174d"],
    write:["#a855f7","#7e22ce"],recall:["#ef4444","#b91c1c"],fp:["#f97316","#c2410c"],bonus:["#f59e0b","#b45309"],other:["#fb923c","#c2410c"]};
  const STEM="#4d7c0f",LEAF="#65a30d",LEAF2="#84cc16";
  const svg=(w,h,body,cls)=>`<svg viewBox="0 0 ${w} ${h}" class="${cls||""}" aria-hidden="true" focusable="false">${body}</svg>`;
  const mound=`<ellipse cx="12" cy="38.6" rx="6.5" ry="1.9" fill="#5b3a1a" opacity=".55"/>`;
  const stem=(top)=>`<path d="M12 38.5 Q11.4 ${(38+top)/2} 12 ${top}" stroke="${STEM}" stroke-width="1.7" fill="none" stroke-linecap="round"/>`;
  const leaves=(y)=>`<path d="M12 ${y} q-6.5 -.6 -7.6 -6 q5.6 -.2 7.6 4.4z" fill="${LEAF}"/><path d="M12 ${y-3} q6.5 -.6 7.6 -6 q-5.6 -.2 -7.6 4.4z" fill="${LEAF2}"/>`;
  const ring=(n,cx,cy,r,rx,ry,fill,extra)=>Array.from({length:n},(_,i)=>`<ellipse cx="${cx}" cy="${cy-r}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra||""} transform="rotate(${i*360/n} ${cx} ${cy})"/>`).join("");
  const DROP=`<g class="gd-drop"><path d="M5.5 1.5C5.5 1.5 2 6.4 2 8.6a3.5 3.5 0 0 0 7 0C9 6.4 5.5 1.5 5.5 1.5Z" fill="#38bdf8" stroke="#0369a1" stroke-width=".6"/><ellipse cx="4.3" cy="8.2" rx=".9" ry="1.4" fill="#e0f2fe"/></g>`;
  // the flower in bloom of each kind (viewBox 0 0 24 40, the ground at y 38.5)
  const BLOOM={
    vocab:()=>stem(11)+leaves(31)+ring(8,12,11,4.6,2.1,4,"#fff",`stroke="#d4d4d8" stroke-width=".45"`)+`<circle cx="12" cy="11" r="2.7" fill="#facc15"/><circle cx="11.2" cy="10.2" r=".8" fill="#fef08a"/>`,
    grammar:()=>`<path d="M12 38.5 L12 15" stroke="${STEM}" stroke-width="1.7" stroke-linecap="round"/><path d="M12 37 Q5 30 7 19 Q10 27 12 31z" fill="${LEAF}"/><path d="M12 35 Q19 29 17.5 21 Q14 27 12 30z" fill="${LEAF2}"/>`
      +`<path d="M6.6 7.5 Q6 17 12 18 Q18 17 17.4 7.5 L14.8 11.2 L12 5.6 L9.2 11.2Z" fill="#f43f5e"/><path d="M12 5.6 L9.2 11.2 L12 18 Z" fill="#fb7185"/>`,
    read:()=>`<path d="M12 38.5 Q11 22 12 12" stroke="${STEM}" stroke-width="2" fill="none" stroke-linecap="round"/>`+leaves(30)+ring(12,12,10.5,5.2,1.8,3.6,"#fbbf24",`stroke="#f59e0b" stroke-width=".4"`)
      +`<circle cx="12" cy="10.5" r="3.6" fill="#78350f"/><circle cx="11" cy="9.6" r=".55" fill="#a16207"/><circle cx="13.1" cy="10.4" r=".55" fill="#a16207"/><circle cx="11.6" cy="11.8" r=".55" fill="#a16207"/>`,
    listen:()=>`<path d="M11.5 38.5 Q11 16 13.6 9.5 Q15.6 5.4 19.6 6.2" stroke="${STEM}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`+leaves(31)
      +[[19.4,6.6],[15.4,9.4],[12.9,14.4]].map(([x,y])=>`<path d="M${x} ${y-1.4}v1.6" stroke="${STEM}" stroke-width=".9"/><path d="M${x-2.7} ${y+4.6}Q${x-2.8} ${y} ${x} ${y}Q${x+2.8} ${y} ${x+2.7} ${y+4.6}L${x+1.35} ${y+3.7}L${x} ${y+4.7}L${x-1.35} ${y+3.7}Z" fill="#6366f1"/><path d="M${x-1} ${y+.8}Q${x-1.6} ${y+2.4} ${x-1.4} ${y+3.6}" stroke="#a5b4fc" stroke-width=".7" fill="none"/>`).join(""),
    speak:()=>stem(13)+leaves(31)+`<path d="M8.6 16.8 l-2.2 1.8 M15.4 16.8 l2.2 1.8" stroke="${LEAF}" stroke-width="1.4" stroke-linecap="round"/><circle cx="12" cy="11.6" r="5.6" fill="#ec4899"/>`
      +`<path d="M12 11.8m-2.4 0a2.4 2.4 0 1 1 2.4 2.4a3.7 3.7 0 0 1-3.7-3.7a4.9 4.9 0 0 1 4.9-4.9" stroke="#9d174d" stroke-width="1" fill="none" stroke-linecap="round"/><circle cx="9.6" cy="9.2" r="1" fill="#f9a8d4"/>`,
    write:()=>[[12,5,0],[8.4,10,-14],[15.6,10,14]].map(([x,top,a])=>`<g transform="rotate(${a} 12 38)"><path d="M12 38.5 L12 ${top}" stroke="${STEM}" stroke-width="1.3" stroke-linecap="round"/>`
      +Array.from({length:6},(_,i)=>`<circle cx="${12+(i%2?1.2:-1.2)}" cy="${top+1+i*2.1}" r="${1.65-i*.08}" fill="${i%2?"#a855f7":"#c084fc"}"/>`).join("")+`</g>`).join("")
      +`<path d="M12 38 q-5 -1.2 -6 -6 q4.6 .4 6 4z" fill="${LEAF}"/><path d="M12 37 q5 -1.2 6 -6 q-4.6 .4 -6 4z" fill="${LEAF2}"/>`,
    recall:()=>`<path d="M10 38.6 L10.7 26 L13.3 26 L14 38.6 Z" fill="#fef3c7" stroke="#d6d3d1" stroke-width=".5"/><path d="M3.6 27.4 Q3.4 15.6 12 15.6 Q20.6 15.6 20.4 27.4 Z" fill="#ef4444"/>`
      +`<circle cx="8" cy="21.6" r="1.5" fill="#fff"/><circle cx="13" cy="18.8" r="1.2" fill="#fff"/><circle cx="16.6" cy="23" r="1.4" fill="#fff"/><circle cx="11.4" cy="24.2" r=".9" fill="#fff"/><path d="M6 37 q2 -3 3.5 0 M15 37.4 q1.6 -2.4 3 0" stroke="${LEAF2}" stroke-width="1.1" fill="none"/>`,
    fp:()=>`<path d="M1 37 Q6 32.5 9 35 M23 36.5 Q19 32 15.6 34.6" stroke="${STEM}" stroke-width="1.2" fill="none"/><path d="M3.4 33.4 q-2.6 -3.4 .6 -5.4 q2.4 2 -.6 5.4z" fill="${LEAF}"/><path d="M20.8 32.8 q2.8 -3.4 -.4 -5.6 q-2.6 2.2 .4 5.6z" fill="${LEAF2}"/>`
      +`<path d="M12 25 q.4 -3.4 2.6 -4.4" stroke="#65a30d" stroke-width="1.8" fill="none" stroke-linecap="round"/><ellipse cx="8" cy="31.6" rx="5" ry="6.4" fill="#ea580c"/><ellipse cx="16" cy="31.6" rx="5" ry="6.4" fill="#ea580c"/><ellipse cx="12" cy="31.6" rx="4.6" ry="6.9" fill="#f97316"/>`
      +`<path d="M12 25 Q10.4 31.6 12 38.4 M12 25 Q13.6 31.6 12 38.4" stroke="#c2410c" stroke-width=".55" fill="none"/><ellipse cx="9.4" cy="29" rx="1" ry="2" fill="#fdba74" opacity=".8"/>`,
    bonus:()=>stem(12)+leaves(31)+`<path d="M12 4.4 L13.9 9.4 L19.2 9.6 L15 12.9 L16.5 18 L12 15 L7.5 18 L9 12.9 L4.8 9.6 L10.1 9.4Z" fill="#f59e0b" stroke="#b45309" stroke-width=".6" stroke-linejoin="round"/><circle cx="12" cy="11.5" r="2.1" fill="#fde68a"/>`
      +`<path class="gd-spark" d="M20.4 2.6 l.7 1.7 1.7 .7 -1.7 .7 -.7 1.7 -.7 -1.7 -1.7 -.7 1.7 -.7z" fill="#facc15"/>`,
    other:()=>stem(12)+leaves(31)+`<circle cx="12" cy="11" r="5.4" fill="#f97316"/><circle cx="12" cy="11" r="3.6" fill="#fb923c"/><circle cx="12" cy="11" r="1.7" fill="#c2410c"/>`,
  };
  const SPROUT=()=>mound+`<path d="M12 38.5 L12 31.5" stroke="${LEAF}" stroke-width="1.6" stroke-linecap="round"/><path d="M12 32.4 q-5.6 .4 -6.2 -4.2 q5 -.6 6.2 3.4z" fill="${LEAF2}"/><path d="M12 31.8 q5.6 -.4 6.2 -5 q-5 0 -6.2 4.2z" fill="#a3e635"/>`;
  const BUD=(k)=>{if(k==="fp")return mound+`<path d="M3 37 Q7 34 10 36" stroke="${STEM}" stroke-width="1.1" fill="none"/><path d="M5 34.6 q-2.2 -3 .4 -4.6 q2 1.8 -.4 4.6z" fill="${LEAF}"/><ellipse cx="13.4" cy="35" rx="3.6" ry="3.2" fill="#84cc16"/><path d="M13.4 32 q.3 -1.6 1.6 -2" stroke="${STEM}" stroke-width="1.1" fill="none"/>`;
    if(k==="recall")return mound+`<path d="M11 38.6 L11.4 33 L12.6 33 L13 38.6Z" fill="#fef3c7"/><path d="M8 34 Q8 28.6 12 28.6 Q16 28.6 16 34Z" fill="#f87171"/><circle cx="10.6" cy="31.4" r=".8" fill="#fff"/>`;
    const [c,d]=COL[k]||COL.other;return stem(14)+leaves(31)+`<ellipse cx="12" cy="12.6" rx="2.8" ry="4.3" fill="${k==="vocab"?"#f1f5f9":c}" stroke="${d}" stroke-width=".5"/><path d="M9.2 13.4 Q12 19.2 14.8 13.4 L12 16.6Z" fill="${LEAF}"/>`};
  // thirsty (on ✅ To do): dry cracked soil, a brown plant bent over with its flower hanging, and a big 💧 in a bubble above it (Roger,
  // 17 Nov 2026: "I don't see the thirsty flowers": they must stand out from the rest at a glance)
  const THIRSTY=(k)=>{const [c]=COL[k]||COL.other;
    return `<ellipse cx="12" cy="38.6" rx="8.5" ry="2.2" fill="#d6b88a"/><path d="M6 38.4 l2 -.9 1.2 .8 M14.6 38.2 l1.6 -.8 1.8 .9 M10.6 39.4 l1 -1" stroke="#8b6b3d" stroke-width=".5" fill="none"/>`
      +`<path d="M12 38.5 Q11.4 27 14.4 22.2 Q17.6 17.6 18.6 24.6" stroke="#8b6b3d" stroke-width="1.7" fill="none" stroke-linecap="round"/>`
      +`<path d="M11.8 34 q-5.4 .4 -7 4.4 q4.8 -.2 7 -3z" fill="#a16207"/><path d="M12.4 30.6 q4.6 .4 5.8 4.8 q-4.4 -1.2 -5.8 -3.4z" fill="#b45309"/>`
      +`<path d="M15.6 25.6 Q18.6 23.4 21.4 25.8 Q20.6 30.6 18.6 31.2 Q16.4 30.6 15.6 25.6Z" fill="${k==="vocab"?"#d6d3d1":c}" opacity=".7" stroke="#78350f" stroke-width=".5"/>`
      +`<g class="gd-drop"><circle cx="7.4" cy="8" r="7" fill="#fff" stroke="#0284c7" stroke-width="1"/><path d="M7.4 2.6C7.4 2.6 4.2 7 4.2 9a3.2 3.2 0 0 0 6.4 0C10.6 7 7.4 2.6 7.4 2.6Z" fill="#0ea5e9"/><ellipse cx="6.2" cy="8.8" rx=".8" ry="1.3" fill="#e0f2fe"/></g>`};
  // 🪰 a rotten garden (Roger, 18 Nov 2026: "if there's nothing done, I want that everything is like rotted and full of flies and a help
  // sign"): nothing done yet (no flower, no bud) while some activities are already due (thirsty). The due plants rot, flies buzz, a HELP!
  // sign that opens the first activity to do, a grey cloud instead of the sun; no butterflies or birds. One finished activity ends it.
  const ROTTEN=()=>`<ellipse cx="13" cy="38.6" rx="9" ry="2.2" fill="#3f2a14" opacity=".65"/><path d="M11.5 38.5 Q10.4 31 14.6 29.6 Q19.6 28.4 20.4 34.4" stroke="#4a3a1a" stroke-width="1.6" fill="none" stroke-linecap="round"/>`
    +`<path d="M11.4 36.6 q-5.6 -.2 -7.6 2.2 q5 .6 7.6 -1z" fill="#57452a"/><ellipse cx="19.6" cy="35.6" rx="3.2" ry="2.4" fill="#4b2e14"/><circle cx="18.6" cy="35" r=".7" fill="#84a83c"/><circle cx="20.6" cy="36.2" r=".6" fill="#9cb04a"/><circle cx="20" cy="34.4" r=".45" fill="#84a83c"/>`
    +`<g class="gd-stink"><path d="M7 27 q2 -2 0 -4 q-2 -2 0 -4 q2 -2 0 -4" stroke="#7c8a4e" stroke-width="1" fill="none" opacity=".75" stroke-linecap="round"/><path d="M15 23 q1.6 -1.6 0 -3.2 q-1.6 -1.6 0 -3.2" stroke="#7c8a4e" stroke-width=".9" fill="none" opacity=".6" stroke-linecap="round"/></g>`;
  const DEADTREE=`<ellipse cx="20" cy="54.6" rx="10" ry="2" fill="#3f2a14" opacity=".6"/><path d="M18.4 54.6 L19.2 32 L20.8 32 L21.6 54.6Z" fill="#57452a"/><path d="M19.6 40 L13 31 L10 32 M20.2 36 L27 28 L30 29.6 M20 33 L17 24 M20.4 32 L23 23" stroke="#57452a" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M11 32.4 q-1 3 1 4" stroke="#4b2e14" stroke-width="1" fill="none"/>`;
  const FLY=(i,x,y)=>`<span class="gd-fly" style="left:${x};top:${y}px;animation-delay:-${(i*.73).toFixed(2)}s;animation-duration:${(2.2+(i%4)*.45).toFixed(2)}s" aria-hidden="true">${svg(16,12,`<g class="gd-fw"><ellipse cx="6" cy="3.6" rx="3.4" ry="2.2" fill="#e0f2fe" opacity=".85" stroke="#94a3b8" stroke-width=".4" transform="rotate(-20 6 3.6)"/><ellipse cx="10" cy="3.6" rx="3.4" ry="2.2" fill="#e0f2fe" opacity=".85" stroke="#94a3b8" stroke-width=".4" transform="rotate(20 10 3.6)"/></g>`
    +`<ellipse cx="8" cy="7.4" rx="3.4" ry="2.6" fill="#1f2937"/><circle cx="11.4" cy="6.6" r="1.9" fill="#111827"/><circle cx="12.2" cy="6" r=".8" fill="#b91c1c"/><path d="M6 9.6 l-1 2 M8 10 l0 2 M10 9.6 l1 2" stroke="#111827" stroke-width=".5"/>`)}</span>`;
  // 🪱 worms crawl in the rotten garden (Roger, 18 Nov 2026: "I want everything to look rotten even worms")
  const WORM=(i,x,b)=>`<span class="gd-worm" style="left:${x};bottom:${b}px;animation-delay:-${(i*1.3).toFixed(1)}s" aria-hidden="true"><span class="gd-wig">${svg(30,12,`<path d="M3 8 Q7 3 11 8 T19 8 T27 7" stroke="#c97b84" stroke-width="4.2" fill="none" stroke-linecap="round"/>`
    +`<path d="M3 8 Q7 3 11 8 T19 8 T27 7" stroke="#e8a1a8" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".7" stroke-dasharray="1.2 2.4"/><circle cx="26.6" cy="6.4" r=".7" fill="#3f2a14"/>`)}</span></span>`;
  const HELPSIGN=(en,href)=>`<a class="gd-help" href="${href}" title="${en?"Help your garden: do this activity first":"Ajuda el teu jardí: fes primer aquesta activitat"}">${svg(96,84,`<path d="M44 40 L44 84 L52 84 L52 40Z" fill="#6b4423"/><path d="M45.5 46 v34" stroke="#4a2f17" stroke-width="1"/>`
    +`<g transform="rotate(-6 48 26)"><rect x="4" y="6" width="88" height="40" rx="5" fill="#a16207" stroke="#5b3a1a" stroke-width="2.5"/><path d="M8 18 H88 M8 32 H88" stroke="#854d0e" stroke-width="1" opacity=".6"/>`
    +`<circle cx="11" cy="12" r="1.6" fill="#3f2a14"/><circle cx="85" cy="12" r="1.6" fill="#3f2a14"/><text x="48" y="36" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="25" fill="#fef3c7" stroke="#7f1d1d" stroke-width="1.2" letter-spacing="1">HELP!</text></g>`)}</a>`;
  const CLOUD=svg(46,40,`<g class="gd-cloud"><circle cx="15" cy="22" r="9" fill="#94a3b8"/><circle cx="26" cy="17" r="11" fill="#a3aebf"/><circle cx="35" cy="24" r="8" fill="#94a3b8"/><rect x="8" y="22" width="32" height="9" rx="4.5" fill="#94a3b8"/></g><path d="M16 34 l-2 4 M24 34 l-2 4 M32 34 l-2 4" stroke="#64748b" stroke-width="1.4" stroke-linecap="round"/>`,"gd-sun");
  const plantSvg=(k,st)=>svg(24,40,st==="bloom"?(BLOOM[k]||BLOOM.other)():st==="bud"?BUD(k):st==="thirsty"?THIRSTY(k):SPROUT(),"gd-svg");
  // a recall checkpoint is a tree (viewBox 0 0 40 56, the ground at y 54)
  const treeSvg=st=>svg(40,56,st==="bloom"
      ?`<ellipse cx="20" cy="54.4" rx="11" ry="2" fill="#14532d" opacity=".25"/><path d="M18 54.6 L18.6 36 L21.4 36 L22 54.6Z" fill="#92400e"/><path d="M20 40 L15 33 M20.6 38 L25 32" stroke="#92400e" stroke-width="1.6" stroke-linecap="round"/>`
        +`<circle cx="20" cy="22" r="12" fill="#16a34a"/><circle cx="11" cy="28" r="8" fill="#15803d"/><circle cx="29" cy="28" r="8" fill="#15803d"/><circle cx="20" cy="14" r="8.5" fill="#22c55e"/><circle cx="16" cy="18" r="4" fill="#4ade80" opacity=".6"/>`
        +[[13,25],[26,21],[20,30],[29,30],[17,13]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2" fill="#dc2626"/><circle cx="${x-.6}" cy="${y-.6}" r=".6" fill="#fecaca"/>`).join("")
      :`<ellipse cx="20" cy="54.6" rx="8" ry="2" fill="#5b3a1a" opacity=".55"/><path d="M20 54.6 ${st==="thirsty"?"Q20 44 23 39":"L20 36"}" stroke="#92400e" stroke-width="1.8" fill="none" stroke-linecap="round"/>`
        +(st==="thirsty"?`<path d="M23 39 q4 -1 6 3 q-4 1 -6 -3z M22 42 q-4 0 -5.4 4 q4 .4 5.4 -4z" fill="#a8a24a"/><g transform="translate(8 12) scale(1.3)"><circle cx="7.4" cy="8" r="7" fill="#fff" stroke="#0284c7" stroke-width="1"/><path d="M7.4 2.6C7.4 2.6 4.2 7 4.2 9a3.2 3.2 0 0 0 6.4 0C10.6 7 7.4 2.6 7.4 2.6Z" fill="#0ea5e9"/></g>`
          :`<path d="M20 41 q-6 -1 -7 -7 q5.6 0 7 5z" fill="${LEAF}"/><path d="M20 38 q6 -1 7 -7 q-5.6 0 -7 5z" fill="${LEAF2}"/>`+(st==="bud"?`<circle cx="20" cy="33.4" r="3.6" fill="#22c55e"/>`:"")),"gd-tree");
  const BFLY=(c,i)=>`<span class="gd-bfly f${i%3}" style="animation-delay:-${(i*4.3).toFixed(1)}s" aria-hidden="true"><span class="gd-bob">${svg(20,16,`<g class="gd-w"><path d="M10 8 C6 1 0 2 1.5 7 C2.4 9.6 6 9.4 10 8Z" fill="${c[0]}"/><path d="M10 8.4 C6.4 9.4 3 12 5 14.4 C7 16 9.4 12 10 8.4Z" fill="${c[1]}"/>`
    +`<path d="M10 8 C14 1 20 2 18.5 7 C17.6 9.6 14 9.4 10 8Z" fill="${c[0]}"/><path d="M10 8.4 C13.6 9.4 17 12 15 14.4 C13 16 10.6 12 10 8.4Z" fill="${c[1]}"/></g><rect x="9.3" y="5" width="1.4" height="8" rx=".7" fill="#1f2937"/><path d="M9.6 5.2 L8.4 2.4 M10.4 5.2 L11.6 2.4" stroke="#1f2937" stroke-width=".5"/>`)}</span></span>`;
  const BCOL=[["#f472b6","#fb7185"],["#facc15","#fb923c"],["#60a5fa","#a78bfa"],["#34d399","#2dd4bf"],["#f97316","#fbbf24"]];
  // 🐦 birds fly across the garden when every activity is done (Roger, 17 Nov 2026: "if they do everything they see birds")
  const BIRD=(c,d)=>`<span class="gd-bird" style="--c:${c};--d:${d}" aria-hidden="true" title="🐦"><span class="gd-bbob">${svg(30,22,`<path d="M7 11.4 L0.6 7 L1.6 14.4Z" fill="${d}"/><ellipse cx="13" cy="12.4" rx="8.4" ry="5.6" fill="${c}"/>`
    +`<ellipse cx="14.6" cy="14.6" rx="5.2" ry="3" fill="#fff" opacity=".55"/><circle cx="21" cy="8.4" r="4.4" fill="${c}"/><path d="M24.8 7.6 L29.2 8.8 L24.8 10.2Z" fill="#f59e0b"/>`
    +`<circle cx="22.4" cy="7.6" r="1" fill="#111827"/><circle cx="22.7" cy="7.3" r=".35" fill="#fff"/><path class="gd-bw" d="M8.4 10.6 Q12.4 1.6 18.4 9.4 Q13.6 12.6 8.4 10.6Z" fill="${d}"/>`)}</span></span>`;
  const BIRDS=BIRD("#3b82f6","#1d4ed8")+BIRD("#ef4444","#b91c1c")+BIRD("#facc15","#ca8a04");
  const RAINBOW=svg(200,60,["#ef4444","#f97316","#facc15","#22c55e","#3b82f6","#8b5cf6"].map((c,i)=>`<path d="M${10+i*4} 60 A${90-i*4} ${54-i*4} 0 0 1 ${190-i*4} 60" stroke="${c}" stroke-width="4" fill="none" opacity=".55"/>`).join(""),"gd-rainbow");
  const SUN=svg(40,40,`<g class="gd-rays">${Array.from({length:10},(_,i)=>`<path d="M20 2.5 L20 7.5" stroke="#fbbf24" stroke-width="2.4" stroke-linecap="round" transform="rotate(${i*36} 20 20)"/>`).join("")}</g><circle cx="20" cy="20" r="9.5" fill="#fcd34d"/><circle cx="20" cy="20" r="9.5" fill="none" stroke="#f59e0b" stroke-width="1"/>`
    +`<circle cx="16.8" cy="18.6" r="1.1" fill="#92400e"/><circle cx="23.2" cy="18.6" r="1.1" fill="#92400e"/><path d="M16.6 22.4 Q20 25.6 23.4 22.4" stroke="#92400e" stroke-width="1.2" fill="none" stroke-linecap="round"/>`,"gd-sun");
  const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
  const CSS=`
.gdn{margin:22px 0 4px;border-radius:20px;border:1px solid #bbf7d0;background:linear-gradient(180deg,#ecfccb,#d9f99d);overflow:hidden;position:relative;box-shadow:0 6px 18px #16653414}
.gdn-h{z-index:5;display:flex;align-items:center;gap:10px 16px;flex-wrap:wrap;padding:10px 18px 8px 16px;position:relative;min-height:46px;background:linear-gradient(180deg,#e0f2fe,#f0f9ff)}
.gdn-h .gd-sun{width:40px;height:40px;flex:none}.gdn-h .gd-rays{transform-origin:20px 20px;animation:gdspin 30s linear infinite}
.gdn-t{display:flex;flex-direction:column;min-width:0;flex:1 1 300px}.gdn-k{font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#166534}
.gdn-t b{font-size:17px;line-height:1.25;color:#14532d}.gdn-t b.thirst{color:#0c4a6e}
.gdn-st{display:flex;gap:6px;flex-wrap:wrap;margin-left:auto}.gdn-st span{display:inline-flex;align-items:center;gap:4px;background:#fffffff0;border:1px solid #d9f99d;border-radius:999px;padding:3px 10px;font-size:13.5px;font-weight:700;color:#365314;white-space:nowrap}
.gdn-st span.w{border-color:#7dd3fc;color:#075985;background:#f0f9ff}.gdn-st span.new{border-color:#fde047;background:#fefce8;color:#854d0e;animation:gdpop .6s ease-out both}
.gdn-lawn{position:relative;padding:6px 14px 10px;background:radial-gradient(circle at 12% 30%,#bef26433 0 2px,transparent 3px) 0 0/26px 22px,radial-gradient(circle at 60% 70%,#4d7c0f22 0 1.5px,transparent 2.5px) 0 0/34px 26px}
.gdn-lawn .gd-rainbow{position:absolute;left:50%;top:4px;width:min(440px,70%);transform:translateX(-50%);pointer-events:none;opacity:.8}
.gdn-beds{display:flex;flex-wrap:wrap;align-items:flex-end;gap:10px 14px;position:relative}
.gdb{position:relative;display:flex;align-items:flex-end;padding:0 6px 3px 4px;min-height:52px}
.gdb::after{content:"";position:absolute;left:0;right:0;bottom:0;height:13px;border-radius:7px 7px 9px 9px;background:radial-gradient(circle,#00000026 0 1px,transparent 1.6px) 0 0/7px 5px,linear-gradient(#8b5a2b,#6b4423);box-shadow:inset 0 2px 0 #a47148;z-index:0}
.gdb.fp::after{background:radial-gradient(circle,#00000026 0 1px,transparent 1.6px) 0 0/7px 5px,linear-gradient(#7c4a1e,#5b3716)}
.gdb.bonus::after{background:radial-gradient(circle,#fff6 0 1px,transparent 1.6px) 0 0/7px 5px,linear-gradient(#b08968,#8b6b4a)}
.gds{position:relative;z-index:2;align-self:flex-end;margin:0 3px 6px 0;font-size:10.5px;font-weight:800;color:#fff7ed;background:linear-gradient(#b45309,#92400e);border-radius:3px;padding:1px 4px;line-height:1.3;box-shadow:0 1px 0 #78350f;white-space:nowrap}
.gds::after{content:"";position:absolute;left:50%;top:100%;width:2px;height:6px;margin-left:-1px;background:#78350f}
.gdb.done .gds{background:linear-gradient(#15803d,#166534);box-shadow:0 1px 0 #14532d}.gdb.done .gds::before{content:"✓ "}
.gdb a,.gdt a{position:relative;z-index:1;display:block;text-decoration:none;border-radius:6px;transform-origin:50% 100%;transition:transform .15s}
.gdb a{width:21px;height:35px;margin:0 -.5px}.gdb a .gd-svg{width:24px;height:40px;margin:-5px 0 0 -1.5px;display:block}
.gdb a:hover,.gdb a:focus-visible,.gdt a:hover,.gdt a:focus-visible{transform:scale(1.35);z-index:3;outline:none}.gdb a:focus-visible .gd-svg,.gdt a:focus-visible svg{filter:drop-shadow(0 0 2px #2563eb)}
.gdt{position:relative;display:flex;flex-direction:column;align-items:center}.gdt a{width:36px;height:50px}.gdt .gd-tree{width:36px;height:50px;display:block}
.gdt .gds{margin:-2px 0 0;align-self:center}.gdt .gds::after{display:none}
.gd-drop{animation:gdbob 1.4s ease-in-out infinite}.gdb a.gd-th{animation:gdsag 3s ease-in-out infinite}
@keyframes gdsag{50%{transform:rotate(-4deg)}}
.gd-fresh{animation:gdgrow .9s cubic-bezier(.3,1.6,.5,1) both}.gd-fresh::before{content:"";position:absolute;left:50%;top:0;width:28px;height:28px;margin-left:-14px;border-radius:50%;background:radial-gradient(#fde04788,transparent 70%);animation:gdglow 2.4s ease-out both;pointer-events:none}
.gd-bfly{position:absolute;top:-20px;right:12px;width:24px;height:19px;z-index:4;pointer-events:none;animation:gdfa 18s ease-in-out infinite}.gd-bfly+.gd-bfly{right:auto;left:34px}.gd-bfly.f1{animation-name:gdfb;animation-duration:21s}.gd-bfly.f2{animation-name:gdfc;animation-duration:16s}
.gd-bob{display:block;animation:gdbob2 1.1s ease-in-out infinite alternate}.gd-bfly svg{width:24px;height:19px;display:block}
.gd-free{position:absolute;width:0;height:0;z-index:4}.gd-free .gd-bfly{top:0;right:auto;left:0}
.gd-bird{position:absolute;left:-40px;width:30px;height:22px;z-index:6;cursor:pointer;animation:gdbird 13s linear infinite}.gd-bird svg{width:30px;height:22px;display:block}
.gd-bird:nth-of-type(1){top:58px}.gd-bird:nth-of-type(2){top:96px;animation-duration:17s;animation-delay:-6s}.gd-bird:nth-of-type(3){top:40px;animation-duration:21s;animation-delay:-13s}
.gd-bbob{display:block;animation:gdbbob 1.6s ease-in-out infinite alternate}.gd-bw{transform-origin:13px 10px;animation:gdbw .28s ease-in-out infinite alternate}
@keyframes gdbird{to{left:calc(100% + 40px)}}@keyframes gdbbob{to{transform:translateY(-8px) rotate(-4deg)}}@keyframes gdbw{to{transform:scaleY(-.7)}}
.gdn.rot{border-color:#a8a29e;background:linear-gradient(180deg,#d6cfa8,#b9a878)}.gdn.rot .gdn-h{background:linear-gradient(180deg,#cbd5e1,#e2e8f0)}.gdn.rot .gdn-t b{color:#7f1d1d}.gdn.rot .gdn-k{color:#57452a}
.gdn.rot .gdn-lawn{background:radial-gradient(circle at 20% 40%,#78716c33 0 2px,transparent 3px) 0 0/24px 20px,radial-gradient(circle at 70% 60%,#57452a22 0 1.5px,transparent 2.5px) 0 0/30px 24px}
.gdn.rot .gdb a:not(.gd-rot) .gd-svg,.gdn.rot .gdt a .gd-tree{filter:saturate(.25) sepia(.45) brightness(.92)}.gdn.rot .gdn-key{background:#f5f0e1cc;border-top-color:#d6cfa8;color:#57452a}.gdn.rot .gdn-st span{border-color:#d6cfa8;color:#57452a}
.gd-stink{animation:gdstink 2.4s ease-in-out infinite}@keyframes gdstink{0%{transform:translateY(2px);opacity:.2}50%{opacity:1}100%{transform:translateY(-4px);opacity:0}}
.gd-fly{position:absolute;width:21px;height:16px;z-index:4;pointer-events:none;animation:gdbuzz 2.6s linear infinite}.gd-fly svg{width:21px;height:16px;display:block}
.gd-fw{transform-origin:8px 5px;animation:gdfw .06s linear infinite alternate}@keyframes gdfw{to{transform:scaleY(.4)}}
@keyframes gdbuzz{0%,100%{transform:translate(0,0)}12%{transform:translate(14px,-8px) rotate(20deg)}25%{transform:translate(4px,-16px) rotate(-30deg)}37%{transform:translate(-12px,-6px) rotate(10deg)}50%{transform:translate(-4px,6px) rotate(-15deg)}62%{transform:translate(12px,4px) rotate(25deg)}75%{transform:translate(-8px,-12px) rotate(-20deg)}87%{transform:translate(-14px,2px) rotate(15deg)}}
a.gd-help{position:absolute;right:18px;bottom:2px;width:96px;height:84px;z-index:5;transform-origin:50% 100%;animation:gdhelp 2.8s ease-in-out infinite}a.gd-help svg{width:96px;height:84px;display:block}a.gd-help:hover{animation-play-state:paused;filter:drop-shadow(0 0 6px #fde047)}
@keyframes gdhelp{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}.gd-cloud{animation:gdcloud 6s ease-in-out infinite alternate}@keyframes gdcloud{to{transform:translateX(3px)}}
.gdn.rot .gdn-lawn{padding-right:124px}
.gdn.wilt{border-color:#fde047;background:linear-gradient(180deg,#fef9c3,#fde68a)}.gdn.wilt .gdn-h{background:linear-gradient(180deg,#fef3c7,#fefce8)}.gdn.wilt .gdn-t b{color:#92400e}.gdn.wilt .gdn-k{color:#854d0e}
.gdn.wilt .gdn-lawn{background:radial-gradient(circle at 12% 30%,#ca8a0433 0 2px,transparent 3px) 0 0/26px 22px,radial-gradient(circle at 60% 70%,#a1620722 0 1.5px,transparent 2.5px) 0 0/34px 26px}
.gdn.wilt .gdb a:not(.gd-th) .gd-svg,.gdn.wilt .gdt a .gd-tree{filter:saturate(.6) sepia(.35) hue-rotate(-10deg)}.gdn.wilt .gdb::after{background:radial-gradient(circle,#00000022 0 1px,transparent 1.6px) 0 0/7px 5px,linear-gradient(#a8763e,#7c5a2e)}.gdn.wilt .gdn-key{background:#fefce8cc}
@media (max-width:600px){a.gd-help{width:72px;height:63px;right:6px}a.gd-help svg{width:72px;height:63px}.gdn.rot .gdn-lawn{padding-right:84px}}
.gd-worm{position:absolute;width:30px;height:12px;z-index:3;pointer-events:none;animation:gdcrawl 9s ease-in-out infinite alternate}.gd-worm svg{width:30px;height:12px;display:block}
.gd-wig{display:block;transform-origin:50% 70%;animation:gdwig .5s ease-in-out infinite alternate}@keyframes gdwig{to{transform:scaleX(.82) skewX(-8deg)}}@keyframes gdcrawl{to{transform:translateX(46px)}}
.gdn.rot .gdb::after{background:radial-gradient(circle,#00000033 0 1px,transparent 1.6px) 0 0/7px 5px,linear-gradient(#4a3a26,#33261a)}.gdn.rot .gds{background:linear-gradient(#78716c,#57534e);box-shadow:0 1px 0 #44403c}
.gd-w{transform-origin:10px 8px;animation:gdflap .22s ease-in-out infinite alternate}.gd-spark{transform-origin:20.4px 4.3px;animation:gdtw 1.6s ease-in-out infinite}
.gdn-key{display:flex;flex-wrap:wrap;gap:2px 12px;align-items:center;padding:6px 16px 9px;font-size:12.5px;color:#365314;background:#f7fee7cc;border-top:1px solid #d9f99d}
.gdn-key span{display:inline-flex;align-items:center;gap:3px;white-space:nowrap}.gdn-key svg{width:13px;height:22px}.gdn-key .gd-tree{width:16px;height:22px}.gdn-key b{font-weight:800;margin-right:2px}
@keyframes gdbob{50%{transform:translateY(2px)}}@keyframes gdspin{to{transform:rotate(360deg)}}
@keyframes gdgrow{0%{transform:scale(.1)}100%{transform:scale(1)}}@keyframes gdglow{0%{opacity:1;transform:scale(.4)}100%{opacity:0;transform:scale(2.2)}}
@keyframes gdpop{0%{transform:scale(.6);opacity:0}100%{transform:scale(1);opacity:1}}
/* the butterflies fly around the garden and land on a flower now and then (Roger, 17 Nov 2026: "can you make the butterflies fly?") */
@keyframes gdfa{0%,100%{transform:translate(0,0) rotate(0)}12%{transform:translate(-60px,-34px) rotate(-22deg)}25%{transform:translate(-130px,6px) rotate(-8deg)}31%{transform:translate(-130px,8px) rotate(0)}40%{transform:translate(-70px,-48px) rotate(18deg)}55%{transform:translate(70px,-26px) rotate(22deg)}68%{transform:translate(150px,6px) rotate(8deg)}74%{transform:translate(150px,8px) rotate(0)}86%{transform:translate(70px,-42px) rotate(-16deg)}}
@keyframes gdfb{0%,100%{transform:translate(0,0) rotate(0)}15%{transform:translate(90px,-44px) rotate(24deg)}30%{transform:translate(210px,4px) rotate(10deg)}37%{transform:translate(210px,6px) rotate(0)}50%{transform:translate(110px,-56px) rotate(-20deg)}64%{transform:translate(-50px,2px) rotate(-12deg)}71%{transform:translate(-50px,4px) rotate(0)}85%{transform:translate(-100px,-46px) rotate(-18deg)}}
@keyframes gdfc{0%,100%{transform:translate(0,0) rotate(0)}18%{transform:translate(-50px,-56px) rotate(-24deg)}34%{transform:translate(50px,-62px) rotate(20deg)}46%{transform:translate(90px,2px) rotate(10deg)}53%{transform:translate(90px,4px) rotate(0)}70%{transform:translate(-20px,-38px) rotate(-14deg)}84%{transform:translate(-110px,2px) rotate(-8deg)}91%{transform:translate(-110px,4px) rotate(0)}}
@keyframes gdbob2{to{transform:translateY(-5px)}}
@keyframes gdflap{to{transform:scaleX(.45)}}@keyframes gdtw{50%{transform:scale(.4);opacity:.5}}
@media (prefers-reduced-motion:reduce){.gdn *{animation:none!important;transition:none!important}}
@media (max-width:600px){.gdn-h{padding:10px 12px 8px;gap:8px 10px}.gdn-h .gd-sun{width:32px;height:32px}.gdn-t{flex:1 1 200px}.gdn-t b{font-size:16px}.gdn-st{margin-left:0}.gdn-lawn{padding:6px 8px 10px}.gdn-beds{gap:10px 8px}}`;
  function css(){if(document.getElementById("gdn-css"))return;const s=document.createElement("style");s.id="gdn-css";s.textContent=CSS;document.head.appendChild(s)}
  const FRESH={};
  // 🐦 the birds whistle when they fly in, once per page (Roger, 17 Nov 2026: "when birds appear I want them to whistle"; ELSound in
  // el-sound.js, Web Audio, no sound file; muted when the student muted sounds). Browsers only allow sound after a tap or a key on the
  // page, so it waits for the first one. Clicking a bird makes it chirp again.
  let sang=false;
  const sing=()=>{if(sang||!window.ELSound||!ELSound.soon)return;sang=true;setTimeout(()=>ELSound.soon("birds"),600)};
  addEventListener("click",e=>{const b=e.target&&e.target.closest&&e.target.closest(".gd-bird");if(b&&window.ELSound)ELSound.play("chirp")});
  // G = {ls: "LS2", beds: [{id, label, title, kind: "lp"|"cp"|"fp"|"bonus", plants: [{key, id, name, href, st: "sprout"|"bud"|"bloom"|"thirsty"}]}], store, save}
  window.elGarden=function(G,o){css();const en=!!(o&&o.en),t=(ca,e)=>en?e:ca;
    const all=G.beds.flatMap(b=>b.plants.map(p=>Object.assign({bed:b},p)));
    const n={bloom:0,bud:0,sprout:0,thirsty:0};all.forEach(p=>n[p.st]++);
    // the flowers seen last time on this computer: the new ones grow in front of the student (once per page load)
    if(G.store&&!FRESH[G.store]){let was=null;try{was=JSON.parse(localStorage.getItem(G.store)||"null")}catch(e){}
      const now=all.filter(p=>p.st==="bloom").map(p=>p.key);FRESH[G.store]=new Set(Array.isArray(was)?now.filter(k=>!was.includes(k)):[]);
      if(G.save!==false)try{localStorage.setItem(G.store,JSON.stringify(now))}catch(e){}
      setTimeout(()=>{FRESH[G.store].clear()},6000)}
    const fresh=FRESH[G.store]||new Set();
    const rot=n.bloom===0&&n.bud===0&&n.thirsty>0,firstTh=all.find(p=>p.st==="thirsty");
    // 🍂 a wilting garden (Roger, 18 Nov 2026: "if there [are] less than 20% I want the garden a bit yellowish and some flies"): not rotten
    // yet, but under 20% of what we already did in class is finished (flowers among flowers + thirsty plants; the optional sample exam
    // never counts). The lawn turns yellow, the plants still to finish look dry, and a few flies buzz instead of the free butterflies.
    const mb=all.filter(p=>p.bed.kind!=="bonus"&&p.st==="bloom").length,wilt=!rot&&n.thirsty>0&&mb<.2*(mb+n.thirsty);
    if(G.beds.some(b=>b.kind!=="bonus")&&G.beds.filter(b=>b.kind!=="bonus").every(b=>b.plants.every(p=>p.st==="bloom"||p.later&&p.st!=="thirsty")))sing();
    const ST={bloom:t("fet ✓","done ✓"),bud:t("començat: acaba'l perquè floreixi","started: finish it to make it bloom"),sprout:t("encara per fer","not done yet"),
      thirsty:t("💧 té set: ja ho vam fer a classe, acaba-ho per regar-la","💧 thirsty: we did it in class, finish it to water it")};
    const KN={vocab:t("Vocabulari","Vocabulary"),grammar:t("Gramàtica","Grammar"),read:"Reading",listen:"Listening",speak:"Speaking",write:"Writing",recall:"Recall",fp:t("Producte final","Final product"),bonus:t("Opcional","Optional"),other:""};
    // 🦋 a butterfly for every 5 flowers in a bed (at most 2) and always one on a finished bed (Roger, 17 Nov 2026: "I don't see the
    // butterflies": only finished beds had one, so most students had none yet)
    // 🦋 three butterflies always fly over every garden (Roger, 17 Nov 2026: "there should be always butterflies"), more with the flowers
    const FREE=[[16,26],[50,70],[82,20]];
    let bi=0;const nBf=(b,done)=>{const f=b.plants.filter(p=>p.st==="bloom").length;return Math.min(2,Math.max(done&&b.plants.length>1?1:0,Math.floor(f/5)))};
    const beds=G.beds.map(b=>{const done=b.plants.every(p=>p.st==="bloom"),head=`${b.label?b.label+" · ":""}${b.title}`;
      if(b.kind==="cp"){const p=b.plants[0],st=b.plants.every(x=>x.st==="bloom")?"bloom":b.plants.some(x=>x.st==="thirsty")?"thirsty":b.plants.some(x=>x.st!=="sprout")?"bud":"sprout";
        return `<div class="gdt"><a href="${esc(p.href)}" class="${b.plants.some(x=>fresh.has(x.key))?"gd-fresh":""}" title="${esc(head+" · "+ST[st])}" aria-label="${esc(head+" · "+ST[st])}">${rot&&st!=="bloom"?svg(40,56,DEADTREE,"gd-tree"):treeSvg(st)}</a>${b.label?`<span class="gds">${esc(b.label)}</span>`:""}</div>`}
      const plants=b.plants.map(p=>{const k=kindOf(p.id,b.kind),lab=`${p.name}${KN[k]&&!new RegExp(KN[k],"i").test(p.name)?" ("+KN[k]+")":""} · ${ST[p.st]}`;
        return `<a href="${esc(p.href)}" class="${fresh.has(p.key)?"gd-fresh":""}${rot&&p.st!=="bloom"?" gd-rot":p.st==="thirsty"?" gd-th":""}" title="${esc(head+" › "+lab)}" aria-label="${esc(head+" › "+lab)}">${rot&&p.st!=="bloom"?svg(24,40,ROTTEN(),"gd-svg"):plantSvg(k,p.st)}</a>`}).join("");
      return `<div class="gdb ${b.kind}${done?" done":""}" title="${esc(head)}">${b.label?`<span class="gds">${esc(b.label)}</span>`:""}${plants}${rot?[FLY(bi++,"30%",-12),FLY(bi++,"68%",-6),b.plants.length>3?WORM(bi++,"12%",-3):"",b.plants.length>7?WORM(bi++,"55%",-4):""].join(""):Array.from({length:nBf(b,done)},()=>BFLY(BCOL[bi%BCOL.length],bi++)).join("")}</div>`}).join("");
    // 🐦 everything done = every activity the student can do now is done (Roger, 17 Nov 2026: "make sure birds show up when everything is
    // done"): the optional sample exam and tabs kept for a later class (🏫 read-only, p.later) never hold the birds back
    const must=all.filter(p=>p.bed.kind!=="bonus"),full=must.length>0&&must.every(p=>p.st==="bloom"),allDone=must.length>0&&must.every(p=>p.st==="bloom"||p.later&&p.st!=="thirsty"),nf=fresh.size;
    const head=rot?t("El teu jardí s'està podrint! 🪰 Fes les activitats que vam fer a classe per salvar-lo","Your garden is rotting! 🪰 Do the activities we did in class to save it")
      :wilt?t("El teu jardí s'està marcint 🍂 Has acabat menys del 20% del que vam fer a classe: rega'l!","Your garden is wilting 🍂 You've finished less than 20% of what we did in class: water it!"):full?t("El teu jardí està ple de flors! 🌈","Your garden is in full bloom! 🌈")
      :allDone?t("Ho has fet tot, de moment! 🐦 La resta creixerà quan ho fem a classe","You've done everything for now! 🐦 The rest will grow when we do it in class")
      :n.thirsty?(n.thirsty===1?t("1 planta té set: acaba l'activitat per regar-la","1 plant is thirsty: finish it to water it"):t(`${n.thirsty} plantes tenen set: acaba-les per regar-les`,`${n.thirsty} plants are thirsty: finish them to water them`))
      :n.bloom?t("El teu jardí creix: cada activitat que acabes fa néixer una flor","Your garden is growing: every activity you finish makes a flower bloom")
      :t("Acaba la teva primera activitat i hi sortirà la primera flor","Finish your first activity and your first flower will bloom");
    const key=[["vocab",t("Vocabulari","Vocabulary")],["grammar",t("Gramàtica","Grammar")],["read","Reading"],["listen","Listening"],["speak","Speaking"],["write","Writing"],["recall","Recall"]]
      .map(([k,l])=>`<span>${plantSvg(k,"bloom")}${l}</span>`).join("")
      +`<span>${treeSvg("bloom")}Checkpoint</span><span>${plantSvg("fp","bloom")}${t("Producte final","Final product")}</span><span>${plantSvg("vocab","sprout")}${t("per fer","to do")}</span><span>${rot?svg(24,40,ROTTEN(),"gd-svg")+t("es podreix","rotting"):plantSvg("read","thirsty")+t("té set","thirsty")}</span><span>🐦 ${t("ho has fet tot","everything done")}</span>`;
    return `<section class="gdn${rot?" rot":wilt?" wilt":""}" id="garden" aria-label="${t("El meu jardí","My garden")}"><div class="gdn-h">${rot?CLOUD:SUN}<div class="gdn-t"><span class="gdn-k">🌱 ${t("El meu jardí","My garden")}${G.ls?" · "+esc(G.ls):""}</span><b class="${n.thirsty&&!full?"thirst":""}">${head}</b></div>`
      +`<div class="gdn-st">${nf?`<span class="new">🎉 +${nf} ${nf===1?t("flor nova","new flower"):t("flors noves","new flowers")}</span>`:""}<span title="${t("Activitats fetes","Activities done")}">🌼 ${n.bloom} ${n.bloom===1?t("flor","flower"):t("flors","flowers")}</span>`
      +(n.thirsty?`<span class="w" title="${t("Ja ho vam fer a classe i encara no ho has acabat","We did it in class and you haven't finished it yet")}">${rot?"🪰":"💧"} ${n.thirsty} ${rot?t("podrint-se","rotting"):t("amb set","thirsty")}</span>`:"")
      +(!rot&&n.bud+n.sprout?`<span title="${t("Activitats obertes per fer o començades","Open activities not finished yet")}">🌱 ${n.bud+n.sprout} ${t("creixent","growing")}</span>`:"")+`</div></div>`
      +`<div class="gdn-lawn">${full?RAINBOW:""}<div class="gdn-beds">${beds}</div>${rot?[[10,20],[28,60],[44,14],[60,52],[76,24]].map(([x,y])=>FLY(bi++,x+"%",y)).join("")+[["34%",8],["62%",14],["6%",4]].map(([x,b])=>WORM(bi++,x,b)).join("")+HELPSIGN(en,esc(firstTh.href)):wilt?[[14,22],[40,64],[66,18],[86,56]].map(([x,y])=>FLY(bi++,x+"%",y)).join(""):FREE.map(([x,y],i)=>`<span class="gd-free" style="left:${x}%;top:${y}px">${BFLY(BCOL[(i+2)%BCOL.length],bi++)}</span>`).join("")}</div>${allDone?BIRDS:""}<div class="gdn-key"><b>${t("Què hi creix?","What grows here?")}</b>${key}</div></section>`};
})();
