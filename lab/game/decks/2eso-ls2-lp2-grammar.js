// Class game: 2 ESO Free Time, Live! LP2 What are they doing? · GRAMMAR ONLY (Roger, 5 Nov 2026: "the grammar should have slides to
// explain it well so that students understand it"). Safe level: the Present Continuous (affirmative, negative, questions, short answers)
// and -ing spelling, as in the path's Grammar step (2eso/free-time-live/data/what-are-they-doing.js). Now vs usually is LP3.
// The words come from the path's vocabulary (passive only); the vocabulary game is 2eso-ls2-lp2-vocab.js.
// Theory slides (AGENTS.md, "Class games"): lines can be text, a table {table:[[header…],[row…]…]} or a warning {watch}; step:true shows
// one block per Space; ca is the Catalan help the teacher can show (CA on the board, or C). ~~word~~ is crossed out (a mistake).
ELGameDeck({
  title:"Grammar · Present Continuous",
  slides:[
    {theory:"What's happening now?",point:"Present Continuous: am / is / are + -ing",pointCa:"Present Continuous: am / is / are + -ing",img:"🎥",step:true,lines:[
      "We use the **Present Continuous** for actions happening **now**.",
      {table:[["","am / is / are","verb + -ing"],["I","**am** ('m)","watching the match."],["He / She / It","**is** ('s)","climbing the red route."],["We / You / They","**are** ('re)","cheering."]]},
      "Time words: **now** · **right now** · **at the moment** · **today** · **Look!** · **Listen!**",
      {watch:"Don't forget am / is / are: ~~Nil climbing~~ → Nil **is climbing**."}],
      ca:["Present Continuous = accions que passen ara mateix.","am / is / are + verb acabat en -ing. No t'oblidis mai de am / is / are."]},
    {q:"Look! The players ___ up before the match.",img:"🏃",options:["are warming","is warming","warming","are warm"],why:"The players = they → **are** + warm**ing**."},
    {q:"Listen! The crowd ___ (cheer) for the Blue Team.",img:"📣",write:["is cheering","'s cheering"],why:"**The crowd** is one group → **is cheering**."},
    {q:"I ___ the highlights right now.",img:"📺",options:["am watching","is watching","watching","am watch"],why:"I → **am** + watch**ing**."},
    {q:"Emma and Sam ___ (talk) on School Radio.",img:"🎙️",write:["are talking","'re talking"],why:"Emma and Sam = they → **are talking**."},
    {theory:"How to write the -ing form",point:"Spelling the -ing form",pointCa:"Com s'escriu la forma -ing",img:"✏️",step:true,lines:[
      {table:[["The verb…","Rule","Examples"],["most verbs","+ **-ing**","play → play**ing** · cheer → cheer**ing** · study → study**ing**"],["ends in -e","drop the **-e**","dance → danc**ing** · write → writ**ing** · take → tak**ing**"],["one vowel + one consonant","**double** it","run → ru**nn**ing · swim → swi**mm**ing · win → wi**nn**ing · get → ge**tt**ing"]]},
      {watch:"Two vowels: no double: read → **reading** (not ~~readding~~)."}],
      ca:["La majoria: + -ing. Si acaba en -e, treu la -e.","Una vocal + una consonant al final: dobla la consonant (run → running)."]},
    {q:"Write the -ing form: swim → ___",img:"🏊",write:["swimming"],why:"One vowel + one consonant: swi**mm**ing."},
    {q:"Which -ing form is correct?",img:"🖊️",options:["writing","writting","writeing","writng"],why:"write → drop the **-e** → writing (one t)."},
    {q:"Write the -ing form: take → ___",img:"📸",write:["taking"],why:"take → drop the **-e** → taking."},
    {q:"Our team isn't ___ today: the score is 2–6.",img:"😞",options:["winning","wining","wineing","winnig"],why:"win → wi**nn**ing: double the n."},
    {theory:"Negatives: not now",point:"Present Continuous: negatives and questions",pointCa:"Present Continuous: negatives i preguntes",img:"🚫",step:true,lines:[
      {table:[["Positive","Negative"],["I**'m** playing.","I**'m not** playing."],["She**'s** playing.","She **isn't** playing."],["They**'re** playing.","They **aren't** playing."]]},
      "It's raining, so we **aren't playing** outside. The Green Team **isn't winning**.",
      {watch:"~~I amn't~~ → I**'m not**."}],
      ca:["Negativa: posa not darrere de am / is / are: I'm not · isn't · aren't."]},
    {theory:"Questions and short answers",img:"❓",step:true,lines:[
      {table:[["Question","Short answer"],["**Are** you **watching**?","Yes, I **am**. / No, I**'m not**."],["**Is** Júlia **shooting**?","Yes, she **is**. / No, she **isn't**."],["**What are** they **doing**?","They're warming up."]]},
      "(Question word) + **am / is / are** + subject + verb-ing: **Why are** the fans **cheering**?",
      {watch:"Short answers have no contraction: Yes, she **is** (not ~~Yes, she's~~)."}],
      ca:["Pregunta: am / is / are davant del subjecte. Resposta curta: Yes, she is. / No, she isn't.","A la resposta curta afirmativa no hi ha contracció."]},
    {q:"It's freezing, so the children ___ (not / play) outside.",img:"🥶",write:["aren't playing","are not playing","'re not playing"],why:"The children = they → **aren't playing**."},
    {q:"Is Júlia shooting? — Yes, she ___.",img:"🏀",options:["is","'s","does","shoots"],why:"Short answers have no contraction: **Yes, she is**."},
    {q:"What ___ you ___ (do) right now? — I'm drawing.",img:"🎨",write:["are doing"],why:"What **are** you **doing**? Write both words."},
    {q:"Which question is correct?",img:"❓",options:["Why are the fans cheering?","Why the fans are cheering?","Why are cheering the fans?","Why do the fans cheering?"],why:"Question word + **are** + subject + verb-ing."},
    {q:"It ___ (not / rain) now. Let's go out!",img:"🌤️",write:["isn't raining","is not raining","'s not raining"],why:"It → **isn't raining**."},
    {q:"Are you listening to music?",img:"🎧",options:["No, I'm not.","No, I amn't.","No, I don't.","No, I isn't."],why:"Are you…? → **No, I'm not.**"},
    {q:"Twenty teams ___ (take) part in the tournament this weekend.",img:"🏆",write:["are taking","'re taking"],why:"Twenty teams → **are taking** (drop the -e)."},
    {q:"Who ___? — Marc! Two points for the Blue Team!",img:"🙌",options:["is scoring","are scoring","does scoring","scoring"],why:"**Who** is the subject: Who **is scoring**?"},
  ]
});
