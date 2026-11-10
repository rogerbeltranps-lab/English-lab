// Class game: 4 ESO Seasons & Celebrations LP3 Where traditions come from · GRAMMAR ONLY (Roger, 5 Nov 2026: "the grammar should have
// slides to explain it well so that students understand it"; 6 Nov 2026: new games for LP3). Safe level, the path's Grammar step: origins
// with the Past Simple and used to, defining relatives (who, which, that, where, when), contrast (whereas, unlike) and, as the stretch,
// non-defining relatives and concession (4eso/seasons-and-celebrations/data/where-traditions-come-from.js). Words from the path (passive
// only); the vocabulary game is 4eso-ls2-lp3-vocab.js. Theory slides (AGENTS.md, "Class games"): lines can be text, a table, a warning
// {watch}; step:true shows one block per Space; ca is the Catalan help (CA, or C); ~~word~~ is crossed out (a mistake).
ELGameDeck({
  title:"Grammar · Origins, relatives and contrast",
  slides:[
    {theory:"Origins: Past Simple or used to?",point:"Past Simple or used to",pointCa:"Past Simple o used to",img:"📜",step:true,wide:true,lines:[
      {table:[["","Past Simple","used to + verb"],["Use","**one finished event**, often with a date","a **past habit** that is **not true now**"],["Example","The first Thanksgiving **took** place in 1621. Lincoln **made** it official in 1863.","People **used to** carve turnips. (Now they carve pumpkins.)"],["Negative","They **didn't use** pumpkins.","Children **didn't use to** go trick or treating here."],["Question","When **did** it **start**?","**Did** people **use to** wear masks? — Yes, they **did**."]]},
      {watch:"After did / didn't: **use to** (no -d): ~~didn't used to~~ → **didn't use to**."}],
      ca:["Past Simple: un fet acabat (sovint amb data). used to: un costum del passat que ara ja no es fa (solia…).","Amb did / didn't escrivim use to, sense -d."]},
    {q:"The first Thanksgiving ___ place in 1621.",img:"🦃",options:["took","used to take","takes","taked"],why:"One finished event with a date → Past Simple: **took**."},
    {q:"People in Ireland ___ ___ carve turnips, but now they carve pumpkins.",img:"🎃",write:["used to"],why:"A past habit that is not true now → **used to**."},
    {q:"Lincoln ___ (make) Thanksgiving official in 1863.",img:"🏛️",write:["made"],why:"Irregular Past Simple: make → **made**."},
    {q:"Children ___ go trick or treating in Catalonia.",img:"🍬",options:["didn't use to","didn't used to","don't used to","not used to"],why:"Negative: **didn't use to** (no -d)."},
    {q:"___ people use to wear masks at Samhain? — Yes, they did.",img:"🎭",write:["did"],why:"Question: **Did** … use to …?"},
    {theory:"Defining relatives: which person, thing, place or time?",point:"Defining relatives: who, which, where, when",pointCa:"Relatius: who, which, where, when",img:"🔗",step:true,wide:true,lines:[
      {table:[["For…","use","Example"],["people","**who** (or that)","The Wampanoag were the people **who** lived in the area."],["things","**which** / **that**","Diwali is a festival **which** celebrates light."],["places","**where**","The town square is the place **where** the parade ends."],["times","**when**","31 October is the day **when** we eat panellets."]]},
      {watch:"Don't repeat the subject: ~~a festival which it celebrates light~~ → a festival **which celebrates** light."}],
      ca:["who per a persones, which / that per a coses, where per a llocs, when per a moments.","No repeteixis it / they després del relatiu."]},
    {q:"The Wampanoag were the people ___ lived in the area.",img:"🌾",options:["who","which","where","when"],why:"People → **who**."},
    {q:"The town square is the place ___ the parade ends. (one word)",img:"📍",write:["where"],why:"A place → **where**."},
    {q:"That's the shop ___ sells panellets.",img:"🏪",options:["which","who","where","when"],why:"A thing → **which** (or that)."},
    {q:"31 October is the day ___ we eat panellets and chestnuts. (one word)",img:"📅",write:["when","that"],why:"A time → **when**."},
    {theory:"Contrast: whereas, unlike, although",point:"Contrast: whereas, unlike, although",pointCa:"Contrast: whereas, unlike, although",img:"⚖️",step:true,lines:[
      "**whereas / while** join two different ideas: Halloween is about costumes, **whereas** the Castanyada is about family.",
      "**unlike** + noun: **Unlike** Hanukkah, Diwali lasts five days.",
      "**although / even though** + sentence: **Although** Halloween started in Europe, it is very popular in the USA.",
      {watch:"**However / On the other hand** start a new sentence: Many families love the feast. **However**, some see it as a day of mourning."}],
      ca:["whereas / while = mentre que · unlike + nom = a diferència de · although = encara que.","However va al començament d'una frase nova, amb coma."]},
    {q:"Halloween is about costumes, ___ the Castanyada is about food and family.",img:"🌰",options:["whereas","unlike","although","both"],why:"Two different ideas → **whereas**."},
    {q:"___ Hanukkah, Diwali lasts five days. (u...)",img:"🕎",write:["unlike"],why:"**Unlike** + noun."},
    {q:"___ it is commercialised, Halloween is still fun for children.",img:"🛒",options:["Although","However","Unlike","Whereas"],why:"**Although** + a sentence (a concession)."},
    {q:"Many families love the feast. ___, some Native Americans see it as a day of mourning.",img:"🤔",options:["However","Although","Unlike","Whereas"],why:"A new sentence → **However**,"},
    {theory:"Extra information: non-defining relatives",point:"Non-defining relatives (, which …,)",pointCa:"Relatius entre comes (, which …,)",img:"✍️",step:true,lines:[
      "Extra information goes **between commas**: Thanksgiving, **which takes place in November**, became official in 1863.",
      "People: **who** · things: **which**: Abraham Lincoln, **who** was president in 1863, made it official.",
      {watch:"Never **that** between commas: Diwali, ~~that~~ **which** is celebrated in autumn, is the festival of lights."}],
      ca:["Informació extra entre comes: which (coses) o who (persones). Mai that entre comes."]},
    {q:"The Castanyada, ___ is held on 31 October, is a family celebration.",img:"🍂",options:["which","that","who","where"],why:"Between commas → **which** (never that)."},
    {q:"Abraham Lincoln, ___ was president in 1863, made Thanksgiving official. (one word)",img:"🎩",write:["who"],why:"A person, between commas → **who**."},
    {q:"Which sentence is correct?",img:"✅",options:["Diwali, which lasts five days, is the festival of lights.","Diwali, that lasts five days, is the festival of lights.","Diwali which lasts five days, is the festival of lights.","Diwali, which it lasts five days, is the festival of lights."],why:"Commas on both sides + **which**, no extra *it*."},
  ]
});
