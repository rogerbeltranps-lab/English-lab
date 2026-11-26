// Class game: 4 ESO Seasons & Celebrations LP1 Getting started · GRAMMAR ONLY (Roger, 5 Nov 2026: "the grammar should have slides to
// explain it well so that students understand it"). Safe level, the grammar of the path's texts (the reading "Autumn in two places" and
// the practice): get + comparative for a change (comparative forms), Present Simple (every autumn) vs Present Continuous (it's getting
// dark now), and feelings: adjective + preposition + noun or -ing. Words from the path (passive only); the vocabulary game is
// 4eso-ls2-lp1-vocab.js. Theory slides (AGENTS.md, "Class games"): lines can be text, a table {table:[[header…],[row…]…]} or a warning
// {watch}; step:true shows one block per Space; ca is the Catalan help the teacher can show (CA on the board, or C).
ELGameDeck({
  title:"Grammar · Talking about change",
  slides:[
    {theory:"get + comparative = a change",point:"get + comparative (it gets colder)",pointCa:"get + comparatiu (it gets colder)",img:"🌇",step:true,lines:[
      "Read: “**In autumn the days get shorter.**” What does it mean?",
      "Every day is a bit shorter than the day before: **get** + comparative = something **changes**.",
      "It **gets colder**. The nights **get longer**. The streets **get more crowded** at Christmas.",
      {watch:"**it gets dark early** (an adjective, not a comparative) = night comes early."}],
      ca:["get + comparatiu = un canvi: els dies es fan més curts (the days get shorter).","It gets colder = cada vegada fa més fred."]},
    {theory:"How to make the comparative",img:"📏",step:true,wide:true,lines:[
      {table:[["Adjective","Rule","get + …"],["short: cold, dark, long","+ **-er**","get cold**er** · get dark**er**"],["ends in -e: nice, wide","+ **-r**","get nice**r**"],["one vowel + one consonant: wet, hot","double + **-er**","get we**tt**er · get ho**tt**er"],["consonant + y: windy, chilly, foggy","y → **-ier**","get wind**ier** · get chill**ier**"],["long: crowded, comfortable","**more** + adjective","get **more crowded**"],["irregular: good, bad","—","get **better** · get **worse**"]]},
      {watch:"~~more colder~~ → **colder**. Use **more** only with long adjectives."}],
      ca:["Adjectius curts: -er (colder). Acabats en consonant + y: -ier (windier).","Adjectius llargs: more + adjectiu (more crowded). Good → better, bad → worse."]},
    {q:"In autumn the days get ___ (short).",img:"🌇",write:["shorter"],why:"short → **shorter**."},
    {q:"It's November: every morning it gets ___.",img:"🥶",options:["colder","more cold","coldest","more colder"],why:"cold is short → **colder** (never *more colder*)."},
    {q:"In December the mornings get ___ (chilly).",img:"🧣",write:["chillier"],why:"consonant + y → chill**ier**."},
    {q:"Our town gets ___ at Christmas: lots of people come to the market.",img:"🛍️",options:["more crowded","crowdeder","crowded more","most crowded"],why:"crowded is long → **more crowded**."},
    {q:"The weather gets ___ (bad) in November: more rain and more wind.",img:"🌧️",write:["worse"],why:"bad → **worse** (irregular)."},
    {q:"Which is correct?",img:"🌬️",options:["It gets wetter and windier.","It gets weter and windyer.","It gets more wet and more windyer.","It gets wettier and windier."],why:"wet → we**tt**er · windy → wind**ier**."},
    {theory:"Every autumn or right now?",point:"Present Simple or Present Continuous?",pointCa:"Present Simple o Present Continuous?",img:"🍁",step:true,wide:true,lines:[
      {table:[["Present Simple: every year, in general","Present Continuous: now, these days"],["In autumn the days **get** shorter.","Look! It**'s getting** dark."],["The leaves **fall** in November.","The leaves **are falling** right now."],["It usually **rains** a lot in Manchester.","It**'s raining** at the moment."]]},
      "Present Simple + **usually**, **always**, **every year**, **in autumn** · Present Continuous + **now**, **at the moment**, **these days**, **Look!**",
      {watch:"**It's getting colder** = it's changing now, day by day."}],
      ca:["Present Simple: el que passa cada any o en general. Present Continuous: el que passa ara o aquests dies.","It's getting colder = ara mateix està canviant, cada dia fa més fred."]},
    {q:"Look outside! It ___ dark already.",img:"🌆",options:["'s getting","gets","get","is get"],why:"**Look!** → now → It**'s getting** dark."},
    {q:"In Manchester it usually ___ (rain) a lot in November.",img:"☔",write:["rains"],why:"**usually** → in general → **rains**."},
    {q:"Every year the clocks ___ back at the end of October.",img:"🕰️",options:["go","are going","goes","is going"],why:"**every year** → Present Simple: the clocks **go** back."},
    {q:"Come to the park! The leaves ___ (fall) and it looks amazing right now.",img:"🍂",write:["are falling","'re falling"],why:"**right now** → the leaves **are falling**."},
    {q:"These days the weather ___ colder and colder.",img:"🌡️",options:["is getting","gets usually","get","getting"],why:"**these days** + a change now → **is getting** colder and colder."},
    {theory:"Feelings: adjective + preposition (+ -ing)",point:"Adjective + preposition + -ing (excited about going)",pointCa:"Adjectiu + preposició + -ing (excited about going)",img:"🎃",step:true,wide:true,lines:[
      {table:[["Adjective + preposition","+ noun","+ verb-ing"],["scared **of**","scared of **the dark**","scared of **walking** home alone"],["excited **about**","excited about **Halloween**","excited about **dressing** up"],["proud **of**","proud of **our tradition**","proud of **making** panellets"],["grateful **for**","grateful for **my family**","grateful for **having** a cosy home"]]},
      {watch:"After a preposition, the verb takes **-ing**: excited about ~~go~~ **going**."}],
      ca:["Després d'una preposició (of, about, for…), el verb va en -ing: excited about going."]},
    {q:"My brother is excited about ___ (dress) up as a skeleton.",img:"💀",write:["dressing"],why:"about + verb-**ing**: dress**ing**."},
    {q:"I'm proud ___ making panellets with my grandma.",img:"👵",options:["of","about","for","with"],why:"**proud of** + noun or -ing."},
    {q:"Which is correct?",img:"🍬",options:["I'm excited about going trick or treating.","I'm excited about go trick or treating.","I'm excited for to go trick or treating.","I'm excited about to go trick or treating."],why:"preposition + **-ing**: about **going**."},
    {q:"Josh is grateful for ___ (have) friends in Catalonia.",img:"🙏",write:["having"],why:"for + verb-**ing**: hav**ing** (drop the -e)."},
    {q:"Some children are scared of ___ (walk) past the pumpkins in the dark.",img:"👻",write:["walking"],why:"of + verb-**ing**: walk**ing**."},
  ]
});
