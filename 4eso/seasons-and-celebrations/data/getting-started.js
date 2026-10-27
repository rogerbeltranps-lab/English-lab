/* LS2 · Getting started (4ESO): the questions of the page, used by getting-started.html and by the teacher dashboard's
   Question analysis (shared/js/el-items.js reads window.LP.panels; tools/gen-sections.js reads the tabs). The page itself is not built
   by ls2-engine.js: it keeps its own code. */
// Recall (LS1). r = first route that does the item (cumulative).
const recall=[
 {r:"beginners",q:"She ___ (get) up at seven every day.",a:["gets"],ca:"Amb he / she / it, el Present Simple porta -s."},
 {r:"beginners",q:"He ___ (go) to school by bus.",a:["goes"],ca:"he → goes (go + -es)."},
 {r:"beginners",q:"I have breakfast ___ seven o'clock.",a:["at"],ca:"Hora → at."},
 {r:"insecure",q:"___ he walk to school? — Yes, he does.",a:["does"],ca:"Pregunta amb he: Does + subjecte + verb."},
 {r:"insecure",q:"Write the sentence with <em>always</em>: I am late.",a:["i am always late","i'm always late"],ca:"Els adverbis de freqüència van després del verb be."},
 {r:"insecure",q:"I'm tired. I'm going to turn ___ early tonight.",a:["in"],ca:"turn in = anar a dormir."},
 {r:"insecure",q:"We ___ (not / have) breakfast at school.",a:["don't have","do not have"],ca:"Negativa amb we: don't + verb."},
 {r:"beginners",q:"First, I get up. ___, I have a shower.",a:["then","after that","next"],ca:"Seqüència: First, Then / After that / Next, Finally."},
 {r:"safe",q:"I pick up my sister. → I pick ___ ___.",a:["her up"],en:"With a pronoun, it goes between the verb and the particle: pick her up."},
 {r:"safe",q:"I've got homework. I need to get down ___ ___.",a:["to it","to work","to business"],en:"get down to is a three-part phrasal verb: get down to it (it = homework) or get down to work."},
 {r:"daring",q:"<em>make</em> or <em>do</em>? ___ an effort",a:["make"],en:"make an effort (MAKE group)."},
 {r:"daring",q:"After ___ (whip) up dinner, I get down to work.",a:["whipping"],en:"After + verb-ing."}
];
// Vocabulary: [expression, Catalan, example]
const vocab=[
 {r:"beginners",g:"Seasons & weather",items:[["spring","primavera","Flowers grow in spring."],["summer","estiu","It's hot in summer."],["autumn (UK) / fall (US)","tardor","Autumn is my favourite season."],["winter","hivern","It's cold in winter."],["sunny","assolellat","It's sunny today."],["cloudy","ennuvolat","It's cloudy and grey."],["windy","ventós","It's windy by the sea."],["rainy","plujós","Take an umbrella: it's rainy."],["foggy","amb boira","It's foggy in the morning."],["cold","fred","It's very cold in January."],["cool","fresc","The mornings are cool."],["mild","suau, temperat","Autumn here is mild."],["warm","càlid, calent","It's warm in the afternoon."],["the days get shorter / longer","els dies s'escurcen / s'allarguen","In autumn the days get shorter."],["leaves change colour","les fulles canvien de color","In October the leaves change colour."],["leaves fall","les fulles cauen","Leaves fall in November."]]},
 {r:"beginners",g:"Seasonal food & nature",items:[["chestnuts","castanyes","We roast chestnuts."],["sweet potatoes","moniatos","Sweet potatoes are delicious."],["pumpkins","carbasses","People carve pumpkins at Halloween."],["mushrooms","bolets","We pick mushrooms in the forest."],["apples","pomes","Apples are an autumn fruit."],["oranges","taronges","Oranges are a winter fruit."],["nuts","fruits secs","Panellets have nuts."],["harvest","collita","The harvest is in autumn."],["trees","arbres","The trees lose their leaves."],["plants","plantes","Plants grow in spring."],["flowers","flors","There are flowers in spring."]]},
 {r:"beginners",g:"Feelings",items:[["excited","il·lusionat/da","I'm excited about the party."],["happy","content/a","I'm happy at Christmas."],["grateful","agraït/da","I'm grateful for my family."],["proud","orgullós/osa","I'm proud of our tradition."],["scared","espantat/da","I'm scared of ghosts!"],["relaxed","relaxat/da","I feel relaxed at home."]]},
 {r:"safe",g:"Seasons & nature (Safe)",items:[["seasonal","de temporada","Chestnuts are seasonal food."],["crop","collita, conreu","Rice is an important crop."],["pick fruit","collir fruita","We pick fruit in September."],["frost","gebre, glaçada","There's frost on the car."],["chilly","fresquet, fred","It's chilly: wear a jumper."],["cosy","acollidor","Our living room is cosy."],["it gets dark early","es fa fosc aviat","In winter it gets dark early."],["the clocks go back","es retarda el rellotge","The clocks go back in October."]]}
];
const practice=[
 {r:"beginners",q:"In autumn the days get ___.",a:["shorter"]},
 {r:"insecure",q:"Leaves ___ from the trees in November.",a:["fall"]},
 {r:"beginners",q:"It's ___ today. Take an umbrella.",a:["rainy","raining"]},
 {r:"beginners",q:"At the Castanyada we roast ___.",a:["chestnuts","sweet potatoes"]},
 {r:"beginners",q:"At Halloween people carve ___.",a:["pumpkins"]},
 {r:"insecure",q:"It isn't hot or cold. It's ___.",a:["mild"]},
 {r:"insecure",q:"I can't see the road. It's very ___.",a:["foggy"]},
 {r:"insecure",q:"Farmers collect the crops at ___ time.",a:["harvest"]},
 {r:"insecure",q:"I feel ___ the night before a big party.",a:["excited","happy","nervous"]},
 {r:"beginners",q:"___ (UK) / fall (US) is my favourite season.",a:["autumn"]},
 {r:"safe",q:"The clocks go ___ in late October.",a:["back"]},
 {r:"safe",q:"In winter it gets dark ___.",a:["early","earlier"]},
 {r:"safe",q:"It's ___ outside. Wear a jumper.",a:["chilly","cold","cool"]},
 {r:"safe",q:"On a cold night, our living room feels warm and ___.",a:["cosy","cozy"]},
 {r:"safe",q:"We go to the farm to ___ fruit.",a:["pick"]}
];
// Reading (one chat per route, AGENTS.md). Options: first one is correct; order is shuffled on screen.
const readingChat={
 beginners:[
  ["Núria","Hi Josh! How's the weather in Manchester?"],
  ["Josh","Hi Núria! It's cold and rainy. It gets dark at half past four."],
  ["Núria","Here it's mild. It's sunny in the afternoon."],
  ["Josh","What do you do in autumn?"],
  ["Núria","On 31 October we celebrate the Castanyada. We eat chestnuts and panellets. Panellets are small sweets with almonds and pine nuts."],
  ["Josh","We have Halloween on the same night. Children wear costumes. My brother is going to be a skeleton. My mum makes pumpkin soup."],
  ["Núria","For me, the Castanyada is about family. We eat together at my grandparents' house."],
  ["Josh","Nice! I love autumn. The leaves change colour."],
  ["Núria","Me too! Autumn is my favourite season."]
 ],
 insecure:[
  ["Núria","Hi Josh! How's the weather in Manchester?"],
  ["Josh","Hi Núria! It's cold and rainy. The mornings are very cold, and there was frost (ice) on the cars today!"],
  ["Núria","Frost? Here it's mild. It's sunny in the afternoon, but the mornings are cool and foggy."],
  ["Josh","Lucky you! The clocks went back last weekend, so it gets dark very early now, at half past four."],
  ["Núria","Wow! Here the days get shorter too."],
  ["Josh","What do you do in autumn?"],
  ["Núria","It's harvest time, so there's a lot of seasonal food. Last Sunday I went to the forest with my dad. We picked mushrooms."],
  ["Josh","Nice! We picked apples at a farm."],
  ["Núria","On 31 October we celebrate the Castanyada. We roast chestnuts and sweet potatoes, and we eat panellets. Panellets are little sweets with almonds and pine nuts. At school, a teacher dresses up as a castanyera, an old woman who sells chestnuts."],
  ["Josh","Delicious! We have Halloween on the same night. Children wear costumes and go trick or treating. My little brother is going to be a skeleton. He's very excited!"],
  ["Núria","Do you carve pumpkins?"],
  ["Josh","Yes, every year. My mum makes pumpkin soup with the inside. And you? Do you wear costumes?"],
  ["Núria","Some people do. But for me the Castanyada is about family. We eat together at my grandparents' house. It's cosy and relaxed."],
  ["Josh","Nice! I love autumn. The leaves change colour and fall from the trees."],
  ["Núria","Me too. Autumn is my favourite season!"]
 ],
 safe:[
  ["Núria","Hi Josh! How's the weather in Manchester?"],
  ["Josh","Hi Núria! Cold and rainy, as usual. It's really chilly in the mornings, and there was frost on the cars today. It feels like winter already!"],
  ["Núria","Frost already? Here it's still quite mild. It's sunny in the afternoon, but the mornings are cool and foggy."],
  ["Josh","Lucky you! And the clocks went back last weekend, so it gets dark really early now, at about half past four."],
  ["Núria","Half past four? Wow! Here the days get shorter too, but it's not that bad."],
  ["Josh","So what do you do in autumn?"],
  ["Núria","It's harvest time here, so there's lots of seasonal food. Last Sunday I went to the forest with my dad to pick mushrooms."],
  ["Josh","Nice! We went to a farm to pick apples, and my mum made an apple pie."],
  ["Núria","And on the thirty-first of October we celebrate the Castanyada. We roast chestnuts and sweet potatoes, and we eat panellets. They're little sweets made with nuts, like almonds and pine nuts. At school, a teacher always dresses up as a castanyera, an old woman who sells roasted chestnuts."],
  ["Josh","Sounds delicious! We have Halloween on the same night. Kids dress up in costumes and go trick or treating. My little brother is going as a skeleton this year. He's so excited!"],
  ["Núria","Do you carve pumpkins?"],
  ["Josh","Yes, every year. My mum always makes pumpkin soup with the inside. But my brother gets scared of the pumpkin faces in the dark! What about you? Do you dress up?"],
  ["Núria","Some people do now. But for me the Castanyada is about family. We eat together at my grandparents' house. It's cosy and relaxed, and I feel grateful for that. I'm proud of our tradition."],
  ["Josh","That's really nice. I love autumn. The leaves change colour, and when the leaves fall from the trees, the parks look amazing."],
  ["Núria","Me too. Autumn is my favourite season. Happy Halloween, Josh!"],
  ["Josh","Happy Castanyada! Save me some panellets!"]
 ],
 daring:[
  ["Núria","Hi Josh! How's the weather in Manchester these days?"],
  ["Josh","Hi Núria! Cold and rainy, as usual. It's been really chilly in the mornings, and there was frost on the cars today, which is early even for Manchester. It feels like winter already!"],
  ["Núria","Frost already? Here it's still surprisingly mild. It's sunny in the afternoon, although the mornings are cool and foggy."],
  ["Josh","Lucky you! Since the clocks went back last weekend, it gets dark really early, at about half past four. By the time I get home from school, it's almost night."],
  ["Núria","Half past four? Wow! Here the days are getting shorter too, but it's not that bad."],
  ["Josh","So what do you usually do in autumn?"],
  ["Núria","It's harvest time here, so there's lots of seasonal food. Last Sunday I went to the forest with my dad to pick mushrooms, which is something my family has done for generations."],
  ["Josh","Nice! We went to a farm to pick apples, and my mum made an apple pie."],
  ["Núria","And on the thirty-first of October we celebrate the Castanyada, which is held the night before All Saints' Day. We roast chestnuts and sweet potatoes and eat panellets, little sweets made with nuts, like almonds and pine nuts. At school, a teacher always dresses up as a castanyera, an old woman who sells roasted chestnuts."],
  ["Josh","Sounds delicious! We have Halloween on the same night. Kids dress up in costumes and go trick or treating, although some people say it has become too commercialised. My little brother is going as a skeleton this year, and he's so excited!"],
  ["Núria","Do you carve pumpkins?"],
  ["Josh","Yes, every year. My mum always makes pumpkin soup with the inside, so nothing is wasted. What about you? Do you dress up?"],
  ["Núria","Some people do now, especially younger kids, because Halloween has become popular here too. But for me the Castanyada is about family. We eat together at my grandparents' house, and it's cosy and relaxed. I feel grateful for those evenings, and I'm proud that we keep the tradition alive."],
  ["Josh","That's really nice. I love autumn too. The leaves change colour, and when they fall from the trees, the parks look amazing."],
  ["Núria","Me too. Autumn is definitely my favourite season. Happy Halloween, Josh!"],
  ["Josh","Happy Castanyada! Save me some panellets!"]
 ]
};
const readingQs=[
 {r:"beginners",q:"What's the weather like in Manchester?",o:["cold and rainy","sunny and warm","foggy and mild"],h:"Llegeix el primer missatge d'en Josh."},
 {r:"insecure",q:"What was on the cars in Manchester this morning?",o:["frost","snow","leaves"],h:"Busca què hi havia «on the cars»."},
 {r:"beginners",q:"When does it get dark in Manchester?",o:["at about 4.30","at about 6.30","at about 8.00"],h:"Busca «half past four»: quina hora és?"},
 {r:"insecure",q:"What did Núria do last Sunday?",o:["She picked mushrooms in the forest.","She picked apples at a farm.","She roasted chestnuts."],h:"Busca «Last Sunday» al missatge de la Núria."},
 {r:"beginners",q:"What are panellets?",o:["sweets with almonds and pine nuts","roasted sweet potatoes","a kind of soup"],h:"Busca «little sweets»."},
 {r:"beginners",q:"What does Josh's mum make?",o:["pumpkin soup","panellets","roasted chestnuts"],h:"Busca «My mum…» al missatge d'en Josh."},
 {r:"beginners",q:"For Núria, the Castanyada is mainly about…",o:["family","costumes","fireworks"],h:"Busca «for me the Castanyada is about…»."},
 {r:"safe",q:"Why does it get dark so early in Manchester now?",o:["The clocks went back.","It's always foggy.","The weather is bad."],h:""},
 {r:"safe",q:"True or false: nobody in Catalonia dresses up at the end of October.",o:["False: some people do now.","True: nobody dresses up."],h:""},
 {r:"daring",q:"What does Núria's last part show?",o:["She prefers a family tradition to costumes.","She thinks Halloween is bad.","She doesn't like autumn."],h:""}
];
// Listening (origins video, Safe level for every route; Beginners answers the same five with Catalan hints and the slower copy). Options: first one is correct; order is shuffled on screen.
const listening=[
 {r:"beginners",q:"Where does Halloween come from?",o:["an old Celtic festival called Samhain","an American film","a Catalan tradition"],h:"Escolta el principi: de quina festa antiga ve?"},
 {r:"beginners",q:"What did people carve before pumpkins?",o:["turnips","apples","chestnuts"],h:"És una sorpresa: no eren carbasses."},
 {r:"beginners",q:"What day is the day after the Castanyada?",o:["All Saints' Day","Christmas Day","New Year's Day"],h:"Escolta què passa l'1 de novembre."},
 {r:"beginners",q:"In the traditional story, why did the bell ringers eat chestnuts?",o:["to keep warm and get energy","to sell them in the street","because they were sweet"],h:"Escolta la història dels campaners: per què menjaven castanyes?"},
 {r:"beginners",q:"What are panellets made with?",o:["almonds, sugar and pine nuts","chestnuts and honey","pumpkin and chocolate"],h:"Escolta els tres ingredients."},
 {r:"safe",q:"What do both celebrations have in common?",o:["They take place on the same night and are about the dead and the end of the harvest.","They both use pumpkins.","They both come from the USA."],h:""},
 {r:"daring",q:"Why do the two celebrations “feel very different”?",o:["Halloween is about costumes and scary fun, and the Castanyada is about family and food.","Only Halloween remembers the dead.","The Castanyada is a new tradition."],h:""}
];
window.LP={key:"ls2GettingStarted4ESO",title:"Getting started",panels:[
 {id:"recall",type:"recall",tab:"Recall",title:"Recall",items:recall},
 {id:"words",type:"typed",area:"Vocabulary",tab:"Autumn words",title:"Autumn words",items:practice,
  core:{insecure:["spring","summer","autumn (UK) / fall (US)","winter","sunny","cloudy","windy","rainy","cold","warm","the days get shorter / longer","leaves fall","chestnuts","sweet potatoes","pumpkins","harvest","excited","grateful","proud","scared"],safe:["autumn (UK) / fall (US)","winter","foggy","mild","the days get shorter / longer","leaves change colour","chestnuts","sweet potatoes","pumpkins","harvest","grateful","proud","seasonal","crop","pick fruit","frost","chilly","cosy","it gets dark early","the clocks go back"],daring:["autumn (UK) / fall (US)","winter","foggy","mild","the days get shorter / longer","leaves change colour","chestnuts","sweet potatoes","pumpkins","harvest","grateful","proud","seasonal","crop","pick fruit","frost","chilly","cosy","it gets dark early","the clocks go back"]}},
 {id:"read",type:"mc",media:{text:true},tab:"Reading",title:"Reading: The autumn chat",items:readingQs},
 {id:"listen",type:"mc",media:{videos:true},tab:"Listening",title:"Listening: Halloween and the Castanyada",items:listening,
  chunks:["at the end of the harvest","sweet potatoes are autumn food","on the first of November"]},
 {id:"speak",type:"speaking",tab:"Speaking"}
]};
