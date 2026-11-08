// Class game: 2 ESO Free Time, Live! LP1 Getting started · GRAMMAR ONLY (Roger, 5 Nov 2026: "the grammar should have slides to explain
// it well so that students understand it"). Safe level: the Present Simple for habits (he / she / it + -s, -es, -ies; don't / doesn't),
// questions and short answers, and how often (adverbs of frequency and their place). The words come from the path's vocabulary
// (passive only); the vocabulary game is 2eso-ls2-lp1-vocab.js.
// Theory slides (AGENTS.md, "Class games"): lines can be text, a table {table:[[header…],[row…]…]} or a warning {watch}; step:true shows
// one block per Space; ca is the Catalan help the teacher can show (CA on the board, or C). ~~word~~ is crossed out (a mistake).
ELGameDeck({
  title:"Grammar · Present Simple: how often?",
  slides:[
    {theory:"The Present Simple: habits",img:"🔁",step:true,lines:[
      "We use the **Present Simple** for things we do **often**, **usually** or **every week**.",
      {table:[["I / you / we / they","he / she / it"],["I **play** football.","Hugo **plays** football."],["We **go** skating.","Marta **goes** skating."],["They **don't draw**.","She **doesn't draw**."]]},
      {watch:"After **doesn't**, no -s: She doesn't ~~plays~~ **play**."}],
      ca:["Present Simple = hàbits, coses que fem sovint.","Amb he / she / it el verb porta -s. A la negativa: don't / doesn't + verb sense -s."]},
    {theory:"he / she / it: -s, -es or -ies?",img:"✏️",step:true,lines:[
      {table:[["The verb ends in…","he / she / it","Examples"],["most verbs","+ **-s**","play → play**s** · draw → draw**s**"],["-o, -ch, -sh, -ss, -x","+ **-es**","go → go**es** · do → do**es** · watch → watch**es**"],["consonant + y","y → **-ies**","study → stud**ies** · fly → fl**ies**"],["have","irregular","have → **has**"]]},
      {watch:"Vowel + y: only -s: play → play**s** (not ~~plaies~~)."}],
      ca:["La majoria de verbs: -s. Acabats en -o, -ch, -sh, -ss, -x: -es.","Consonant + y: canvia la y per -ies. Have → has."]},
    {q:"Omar's sister ___ basketball every Saturday.",img:"🏀",options:["plays","play","playing","is play"],why:"She → play**s**: a habit (every Saturday)."},
    {q:"My cousin ___ (watch) skating videos every night.",img:"📱",write:["watches"],why:"watch ends in -ch → watch**es**."},
    {q:"Hugo ___ video games on school days.",img:"🎮",options:["doesn't play","don't play","doesn't plays","not play"],why:"he → **doesn't** + verb with no -s."},
    {q:"Aina ___ (study) English with an app every day.",img:"📚",write:["studies"],why:"consonant + y → stud**ies**."},
    {q:"Which sentence is correct?",img:"🛹",options:["Pol goes skating and has a new board.","Pol go skating and have a new board.","Pol goes skating and haves a new board.","Pol gos skating and has a new board."],why:"go → **goes**, have → **has**."},
    {theory:"Questions and short answers",img:"❓",step:true,lines:[
      {table:[["Question","Short answer"],["**Do** you **play** the guitar?","Yes, I **do**. / No, I **don't**."],["**Does** she **go** swimming?","Yes, she **does**. / No, she **doesn't**."],["**Where do** they **train**?","At the sports centre."]]},
      "Question word + **do / does** + subject + verb: **When does** Marta **practise**?",
      {watch:"The -s goes to **does**: Does she ~~goes~~ **go**?"}],
      ca:["Preguntes: Do / Does + subjecte + verb sense -s.","Resposta curta: Yes, I do. / No, she doesn't."]},
    {q:"___ your brother do karate? — Yes, he does.",img:"🥋",write:["does"],why:"your brother = he → **Does** …?"},
    {q:"Do you go cycling at the weekend? — No, I ___.",img:"🚲",options:["don't","doesn't","not","am not"],why:"Do you…? → No, I **don't**."},
    {q:"Where ___ you meet your friends? — In the square.",img:"📍",write:["do"],why:"you → Where **do** you meet…?"},
    {q:"Which question is correct?",img:"⏱️",options:["What time does the match start?","What time does the match starts?","What time the match starts?","What time do the match start?"],why:"**does** + the match + **start** (no -s)."},
    {q:"Does Hugo like football? — Yes, he ___.",img:"⚽",write:["does"],why:"Does…? → Yes, he **does**."},
    {theory:"How often? Adverbs of frequency",img:"📅",step:true,lines:[
      "**always** 100 % · **usually** · **often** · **sometimes** · **never** 0 %",
      {table:[["Where does it go?","Example"],["**before** most verbs","She **usually goes** skating."],["**after** be (am / is / are)","She **is always** late."]]},
      "Expressions of time go at the **end**: I go swimming **once a week**. We train **twice a week**.",
      {watch:"She ~~goes usually~~ → She **usually goes**."}],
      ca:["L'adverbi va davant del verb, però darrere de be (am / is / are).","Once a week, twice a week, every day… van al final de la frase."]},
    {q:"Marta ___ to the skate park on Saturdays.",img:"🛹",options:["usually goes","goes usually","usually go","is usually go"],why:"Adverb **before** the verb, and she → go**es**."},
    {q:"Put **always** in: Aina is late for training. → Aina ___ late for training.",img:"⏰",write:["is always","'s always"],why:"With **be**, the adverb goes after: **is always**."},
    {q:"Which sentence is correct?",img:"🚲",options:["We go cycling twice a week.","We twice a week go cycling.","We go twice a week cycling.","Twice we go a week cycling."],why:"Time expressions go at the **end**."},
    {q:"___ often do you go swimming? — Once a week.",img:"🏊",write:["how"],why:"**How often…?** asks about frequency."},
    {q:"I ___ video games on school days. (0 %)",img:"🚫",options:["never play","play never","don't never play","am never play"],why:"**never** goes before the verb, with no *don't*."},
    {q:"Put **sometimes** in: We meet friends in the park. → We ___ friends in the park.",img:"🌳",write:["sometimes meet"],why:"Adverb **before** the verb: we **sometimes meet**."},
  ]
});
