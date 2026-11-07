// Class game: 4 ESO Seasons & Celebrations LP2 Celebrations around the world · GRAMMAR ONLY (Roger, 5 Nov 2026: "the grammar should have
// slides to explain it well so that students understand it"). Safe level, the path's Grammar step: the Present Simple for customs,
// on / in / at for dates, and It is celebrated / takes place / is held (4eso/seasons-and-celebrations/data/celebrations-around-the-world.js).
// Words from the path (passive only); the vocabulary game is 4eso-ls2-lp2-vocab.js. Theory slides (AGENTS.md, "Class games"): lines can be
// text, a table {table:[[header…],[row…]…]} or a warning {watch}; step:true shows one block per Space; ca is the Catalan help (CA, or C).
ELGameDeck({
  title:"Grammar · Customs, dates and It is celebrated",
  slides:[
    {theory:"Customs: the Present Simple",img:"🪔",step:true,wide:true,lines:[
      "Customs happen **every year**, so we use the **Present Simple**.",
      {table:[["people / families / we / they","he / she / it · my family · Diwali"],["People **light** candles.","Hanukkah **lasts** eight nights."],["We **don't work** on 1 January.","My family **doesn't celebrate** Halloween."],["**Do** you **decorate** the house?","**Does** your town **have** a parade?"]]},
      {watch:"**my family**, **the town**, **everybody** = it → verb + -s: Everybody **eats** twelve grapes."}],
      ca:["Els costums es repeteixen cada any: Present Simple.","My family, the town, everybody funcionen com it: el verb porta -s."]},
    {q:"At Diwali, people ___ small oil lamps called diyas.",img:"🪔",options:["light","lights","are lighting","lit"],why:"people = they → **light** (no -s): a custom, every year."},
    {q:"Hanukkah ___ (last) eight nights.",img:"🕎",write:["lasts"],why:"Hanukkah = it → last**s**."},
    {q:"On New Year's Eve everybody ___ twelve grapes at midnight.",img:"🍇",options:["eats","eat","are eating","eating"],why:"**everybody** = he / she → eat**s**."},
    {q:"My family ___ (not / celebrate) Halloween, but we love the Castanyada.",img:"🎃",write:["doesn't celebrate","does not celebrate"],why:"My family = it → **doesn't celebrate** (no -s after doesn't)."},
    {q:"___ your town have a parade at Carnival? — Yes, it does.",img:"🎭",write:["does"],why:"your town = it → **Does** …? — Yes, it does."},
    {theory:"When? on, in, at",img:"📅",step:true,wide:true,lines:[
      {table:[["on","in","at"],["a date or a day","a month, a season, a year","a festival time, night, a clock time"],["**on** 31 October","**in** November","**at** Christmas"],["**on** New Year's Eve","**in** winter","**at** night"],["**on** Sunday","**in** 2026","**at** midnight"]]},
      {watch:"**on** Christmas Day (one day) · **at** Christmas (the holiday time)."}],
      ca:["on + data o dia · in + mes, estació o any · at + període de festa, la nit o una hora.","on Christmas Day (el dia), però at Christmas (les festes)."]},
    {q:"The Castanyada is held ___ 31 October.",img:"🌰",options:["on","in","at","for"],why:"A date → **on**."},
    {q:"Families visit their relatives ___ Christmas.",img:"🎄",write:["at"],why:"A festival time → **at** Christmas."},
    {q:"Lunar New Year is celebrated ___ late January or February.",img:"🏮",options:["in","on","at","for"],why:"A month → **in**."},
    {q:"The fireworks start ___ midnight.",img:"🎆",write:["at"],why:"A clock time → **at** midnight."},
    {q:"Which is correct?",img:"🎁",options:["We open our presents on Christmas Day.","We open our presents at Christmas Day.","We open our presents in Christmas Day.","We open our presents on the Christmas."],why:"One day → **on** Christmas Day."},
    {theory:"It is celebrated · It takes place · It is held",img:"🗓️",step:true,wide:true,lines:[
      "To say **when** and **where** a celebration happens, use these chunks:",
      {table:[["Chunk","Example"],["It **is celebrated** in / on…","Diwali **is celebrated** all over the world."],["It **takes place** in / on…","Hanukkah **takes place** in December."],["It **is held** in / on…","The Three Kings parade **is held** on 5 January."]]},
      "**is celebrated**, **is held** = is / are + past participle: we talk about the celebration, not the people.",
      {watch:"~~It is take place~~ → It **takes place**. · ~~It celebrates in India~~ → It **is celebrated** in India."}],
      ca:["Per dir quan i on se celebra una festa: It is celebrated… · It takes place… · It is held…","Is celebrated / is held: is + participi. Takes place no porta is."]},
    {q:"Diwali ___ (take) place in October or November.",img:"🗓️",write:["takes"],why:"It **takes place** = it happens (no *is*)."},
    {q:"Where ___ the biggest Diwali celebration in the UK held? — In Leicester.",img:"🇬🇧",options:["is","does","are","has"],why:"It **is held** → Where **is** it held?"},
    {q:"Lunar New Year ___ (celebrate) in China, Vietnam and Korea.",img:"🐉",write:["is celebrated","'s celebrated"],why:"People celebrate it → It **is celebrated**."},
    {q:"The Castanyada ___ on 31 October.",img:"🌰",options:["is held","holds","is hold","held is"],why:"**is held** = is + past participle (hold → held)."},
    {q:"Carnival parades ___ (hold) in February.",img:"🎭",write:["are held"],why:"parades (plural) → **are held**."},
    {q:"Which sentence is correct?",img:"🦃",options:["Thanksgiving takes place in November.","Thanksgiving is taken place in November.","Thanksgiving is take place in November.","Thanksgiving take place in November."],why:"**takes place** (Thanksgiving = it → -s; no *is*)."},
  ]
});
