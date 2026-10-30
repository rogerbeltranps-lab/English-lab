// Class game: 4 ESO Seasons & Celebrations LP1 Getting started at Safe level · the autumn words of the learning path
// (4eso/seasons-and-celebrations/data/getting-started.js): weather with -y, temperature, autumn changes, harvest and seasonal food, feelings.
// Roger (30 Oct 2026): it replaces the Autumn words slides; the questions alternate between choosing the answer and writing it.
// Deck format (AGENTS.md, "Class games"): a theory slide {theory, img, lines}, a question {q, img, options, why} (the FIRST option is the
// right one) or a written question {q, img, write, why}: students type the missing words; write lists the accepted answers, the first
// one is shown. **word** is highlighted, ___ is a gap, img is an emoji or an image file.
ELGameDeck({
  title:"Autumn words: choose it, write it",
  slides:[
    {theory:"What's the weather like?",img:"🌫️",lines:[
      "noun + **-y**: sun → **sunny** · cloud → **cloudy** · wind → **windy** · rain → **rainy** · fog → **foggy** (sun and fog double the letter).",
      "From cold to hot: **cold** → **chilly** / **cool** → **mild** → **warm** → **hot**. It's **mild** = not hot and not cold.",
      "**Frost** = ice on cars and grass on a very cold morning. In the USA autumn is **fall**."]},
    {q:"I can't see the end of the street this morning. It's very ___.",img:"🌫️",options:["foggy","fogy","frosty","sunny"],why:"fog → fo**gg**y: the g doubles."},
    {q:"It isn't hot and it isn't cold. It's ___. (m...)",img:"🌤️",write:["mild"],why:"**mild** = between warm and cool."},
    {q:"There was ___ on the cars this morning, so we scraped the windows.",img:"🧊",options:["frost","fog","harvest","crop"],why:"**frost** = thin ice on a very cold morning."},
    {q:"It's ___ outside: wear a jumper. (ch...)",img:"🧥",write:["chilly","cold"],why:"**chilly** = quite cold."},
    {q:"Which is the right order, from cold to hot?",img:"🌡️",options:["cold, cool, mild, warm, hot","cool, cold, warm, mild, hot","cold, mild, cool, hot, warm","mild, cold, cool, warm, hot"],why:"cold → cool → mild → warm → hot."},
    {theory:"Autumn changes",img:"🍂",lines:[
      "**get** + comparative = change: The days **get shorter**. It **gets colder**. It **gets dark early**.",
      "At the end of October **the clocks go back** one hour, so it **gets dark early**.",
      "**Leaves change colour** and then **leaves fall** from the trees."]},
    {q:"In autumn the days get ___ and the nights get longer.",img:"🌇",write:["shorter"],why:"get + comparative: short → **shorter**."},
    {q:"At the end of October the clocks go ___ one hour.",img:"🕰️",options:["back","down","out","off"],why:"In autumn **the clocks go back**; in spring they go forward."},
    {q:"The clocks went back, so now it gets ___ at half past five.",img:"🌑",write:["dark"],why:"**it gets dark early** = night comes early."},
    {q:"In October the leaves ___ colour.",img:"🍁",options:["change","make","do","get"],why:"The chunk is **leaves change colour**."},
    {q:"In November the leaves ___ from the trees.",img:"🍂",write:["fall"],why:"leaves = they → **fall** (no -s): every year."},
    {theory:"Harvest time, food and feelings",img:"🌰",lines:[
      "**Harvest** = the time farmers collect the **crops**. **Seasonal** food grows at this time of year.",
      "We **pick** mushrooms and apples, we **roast** chestnuts and sweet potatoes, and people **carve** pumpkins at Halloween.",
      "Feel + adjective + preposition: **grateful for**, **proud of**, **scared of**, **excited about**. A warm, comfortable room is **cosy**."]},
    {q:"Chestnuts and mushrooms are ___ food: they grow at this time of year.",img:"🍄",options:["seasonal","season","seasonly","seasoned"],why:"**seasonal** (adjective) = typical of one season."},
    {q:"Last Sunday we went to a farm to ___ apples.",img:"🍎",write:["pick"],why:"**pick fruit** = take it from the tree."},
    {q:"Farmers collect the crops at ___ time.",img:"🌾",options:["harvest","frost","crop","pumpkin"],why:"**harvest** = when the crops are collected."},
    {q:"At the Castanyada we ___ chestnuts in a hot pan.",img:"🌰",write:["roast"],why:"We **roast** chestnuts and sweet potatoes."},
    {q:"At Halloween people ___ pumpkins to make scary faces.",img:"🎃",options:["carve","cook","pick","roast"],why:"**carve** = cut a shape into something."},
    {q:"My little brother is scared ___ the pumpkin faces in the dark.",img:"👻",write:["of"],why:"**scared of** something."},
    {q:"I feel grateful ___ my family at the Castanyada.",img:"🙏",options:["for","of","about","with"],why:"**grateful for** something; proud **of**, excited **about**."},
    {q:"Our living room is warm and comfortable on a cold night. It's very ___.",img:"🛋️",write:["cosy","cozy"],why:"**cosy** (UK) = **cozy** (US)."},
    {q:"Which word doesn't belong? chestnuts · sweet potatoes · pumpkins · frost",img:"🤔",options:["frost","chestnuts","sweet potatoes","pumpkins"],why:"**frost** is weather; the others are autumn food."},
    {q:"Autumn is called ___ in the USA.",img:"🇺🇸",write:["fall"],why:"autumn (UK) = **fall** (US)."}
  ]
});
