// Class games (lab/game): one entry per deck in this folder (decks/<id>.js). The board (host.html) lists them by course, then by LS (ls),
// then by learning path (lp, in path order); a new game is a new deck file plus a line here. course: 2eso or 4eso (the groups the board offers).
// kind (Roger, 5 Nov 2026: a vocabulary-only game and a grammar-only game per learning path): "vocab" or "grammar"; the results page
// (results.html) splits the marks by it. A game without kind (older mixed games) counts as "mixed".
// act: the learning path page whose grammar or vocabulary tabs the game's points practise. Each point of the deck names its tab
// (tab:"grammarRel" on its first theory slide), so the board's 🧩 Which grammar? ticks the points whose tab the group has done
// (ls/{id}.done[group]["<act>#<tab>"], Time plan ticks and past class days). A point without a tab is ticked once the group played that game.
window.EL_GAMES=[
  {id:"4eso-ls2-lp1-vocab",act:"4eso/ls2-getting-started",title:"Vocabulary · Autumn words",course:"4eso",emoji:"🍂",kind:"vocab",ls:"LS2 · Seasons & Celebrations",lp:"LP1 · Getting started"},
  {id:"4eso-ls2-lp1-grammar",title:"Grammar · Talking about change",course:"4eso",emoji:"🌇",kind:"grammar",ls:"LS2 · Seasons & Celebrations",lp:"LP1 · Getting started"},
  {id:"4eso-ls2-lp2-vocab",act:"4eso/ls2-celebrations-around-the-world",title:"Vocabulary · Celebrations around the world",course:"4eso",emoji:"🏮",kind:"vocab",ls:"LS2 · Seasons & Celebrations",lp:"LP2 · Celebrations around the world"},
  {id:"4eso-ls2-lp2-grammar",act:"4eso/ls2-celebrations-around-the-world",title:"Grammar · Customs, dates and It is celebrated",course:"4eso",emoji:"🪔",kind:"grammar",ls:"LS2 · Seasons & Celebrations",lp:"LP2 · Celebrations around the world"},
  {id:"4eso-ls2-lp3-vocab",act:"4eso/ls2-where-traditions-come-from",title:"Vocabulary · Origins, comparing and change",course:"4eso",emoji:"📜",kind:"vocab",ls:"LS2 · Seasons & Celebrations",lp:"LP3 · Where traditions come from"},
  {id:"4eso-ls2-lp3-grammar",act:"4eso/ls2-where-traditions-come-from",title:"Grammar · Origins, relatives and contrast",course:"4eso",emoji:"🔗",kind:"grammar",ls:"LS2 · Seasons & Celebrations",lp:"LP3 · Where traditions come from"},
  {id:"2eso-ls2-lp1-vocab",act:"2eso/ls2-getting-started",title:"Vocabulary · Free-time activities",course:"2eso",emoji:"🛹",kind:"vocab",ls:"LS2 · Free Time, Live!",lp:"LP1 · Getting started"},
  {id:"2eso-ls2-lp1-grammar",title:"Grammar · Present Simple: how often?",course:"2eso",emoji:"📅",kind:"grammar",ls:"LS2 · Free Time, Live!",lp:"LP1 · Getting started"},
  {id:"2eso-ls2-lp2-vocab",act:"2eso/ls2-what-are-they-doing",title:"Vocabulary · Clothes, kit and weather",course:"2eso",emoji:"🧢",kind:"vocab",ls:"LS2 · Free Time, Live!",lp:"LP2 · What are they doing?"},
  {id:"2eso-ls2-lp2-grammar",act:"2eso/ls2-what-are-they-doing",title:"Grammar · Present Continuous",course:"2eso",emoji:"🎥",kind:"grammar",ls:"LS2 · Free Time, Live!",lp:"LP2 · What are they doing?"},
  {id:"2eso-ls2-lp3-vocab",act:"2eso/ls2-now-or-usually",title:"Vocabulary · Now or usually? Time words and sport",course:"2eso",emoji:"⛸️",kind:"vocab",ls:"LS2 · Free Time, Live!",lp:"LP3 · Now or usually?"},
  {id:"2eso-ls2-lp3-grammar",act:"2eso/ls2-now-or-usually",title:"Grammar · Present Simple or Present Continuous?",course:"2eso",emoji:"🔄",kind:"grammar",ls:"LS2 · Free Time, Live!",lp:"LP3 · Now or usually?"},
  {id:"2eso-ls2-lp5-grammar",act:"2eso/ls2-likes-and-screen-tips",title:"Grammar · Likes and tips",course:"2eso",emoji:"❤️",kind:"grammar",ls:"LS2 · Free Time, Live!",lp:"LP5 · Likes and screen tips"},
  {id:"4eso-ls2-lp5-vocab",act:"4eso/ls2-plan-the-day",title:"Vocabulary · Planning an event",course:"4eso",emoji:"🎪",kind:"vocab",ls:"LS2 · Seasons & Celebrations",lp:"LP5 · Plan the day"},
  {id:"4eso-ls2-lp5-grammar",act:"4eso/ls2-plan-the-day",title:"Grammar · Future plans",course:"4eso",emoji:"📅",kind:"grammar",ls:"LS2 · Seasons & Celebrations",lp:"LP5 · Plan the day"},
];
// A game's name starts with its learning path (Roger, 7 Nov 2026: "games should have the name of the LP … they should start with LP1 and the
// name they already have"): "LP2 · Vocabulary · Clothes, kit and weather". g = an EL_GAMES entry, a deck id, or a saved result ({deck, title,
// lp}); a game without lp keeps its title.
window.elGameName=function(g){const L=window.EL_GAMES||[],id=typeof g==="string"?g:g&&(g.deck||g.id),m=L.find(d=>d.id===id)||{},o=typeof g==="object"&&g||{};
  const t=String(m.title||o.title||""),n=String(m.lp||o.lp||"").split(" · ")[0].trim();return n&&!t.startsWith(n+" ")?n+" · "+t:t};
