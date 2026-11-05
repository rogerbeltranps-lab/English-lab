// Class games (lab/game): one entry per deck in this folder (decks/<id>.js). The board (host.html) lists them by course, then by LS (ls),
// then by learning path (lp, in path order); a new game is a new deck file plus a line here. course: 2eso or 4eso (the groups the board offers).
// kind (Roger, 5 Nov 2026: a vocabulary-only game and a grammar-only game per learning path): "vocab" or "grammar"; the results page
// (results.html) splits the marks by it. A game without kind (the older mixed ones, LP3) counts as "mixed".
window.EL_GAMES=[
  {id:"4eso-ls2-lp1-vocab",title:"Vocabulary · Autumn words",course:"4eso",emoji:"🍂",kind:"vocab",ls:"LS2 · Seasons & Celebrations",lp:"LP1 · Getting started"},
  {id:"4eso-ls2-lp1-grammar",title:"Grammar · Talking about change",course:"4eso",emoji:"🌇",kind:"grammar",ls:"LS2 · Seasons & Celebrations",lp:"LP1 · Getting started"},
  {id:"4eso-ls2-lp2-vocab",title:"Vocabulary · Celebrations around the world",course:"4eso",emoji:"🏮",kind:"vocab",ls:"LS2 · Seasons & Celebrations",lp:"LP2 · Celebrations around the world"},
  {id:"4eso-ls2-lp2-grammar",title:"Grammar · Customs, dates and It is celebrated",course:"4eso",emoji:"🪔",kind:"grammar",ls:"LS2 · Seasons & Celebrations",lp:"LP2 · Celebrations around the world"},
  {id:"4eso-traditions",title:"Where traditions come from: choose it, write it",course:"4eso",emoji:"📜",ls:"LS2 · Seasons & Celebrations",lp:"LP3 · Where traditions come from"},
  {id:"2eso-ls2-lp1-vocab",title:"Vocabulary · Free-time activities",course:"2eso",emoji:"🛹",kind:"vocab",ls:"LS2 · Free Time, Live!",lp:"LP1 · Getting started"},
  {id:"2eso-ls2-lp1-grammar",title:"Grammar · Present Simple: how often?",course:"2eso",emoji:"📅",kind:"grammar",ls:"LS2 · Free Time, Live!",lp:"LP1 · Getting started"},
  {id:"2eso-ls2-lp2-vocab",title:"Vocabulary · Clothes, kit and weather",course:"2eso",emoji:"🧢",kind:"vocab",ls:"LS2 · Free Time, Live!",lp:"LP2 · What are they doing?"},
  {id:"2eso-ls2-lp2-grammar",title:"Grammar · Present Continuous",course:"2eso",emoji:"🎥",kind:"grammar",ls:"LS2 · Free Time, Live!",lp:"LP2 · What are they doing?"},
  {id:"2eso-now-or-usually",title:"Now or usually? Choose it, write it",course:"2eso",emoji:"⛸️",ls:"LS2 · Free Time, Live!",lp:"LP3 · Now or usually?"},
];
