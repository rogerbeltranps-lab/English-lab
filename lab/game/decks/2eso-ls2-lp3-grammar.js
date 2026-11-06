// Class game: 2 ESO Free Time, Live! LP3 Now or usually? · GRAMMAR ONLY (Roger, 5 Nov 2026: "the grammar should have slides to explain
// it well so that students understand it"; 6 Nov 2026: new games for LP3). Safe level, the path's Grammar step: Present Simple vs Present
// Continuous with time expressions, questions and negatives of both, state verbs, and a short look at temporary situations
// (2eso/free-time-live/data/now-or-usually.js). Words from the path (passive only); the vocabulary game is 2eso-ls2-lp3-vocab.js.
// Theory slides (AGENTS.md, "Class games"): lines can be text, a table {table:[[header…],[row…]…]} or a warning {watch}; step:true shows
// one block per Space; ca is the Catalan help the teacher can show (CA on the board, or C). ~~word~~ is crossed out (a mistake).
ELGameDeck({
  title:"Grammar · Present Simple or Present Continuous?",
  slides:[
    {theory:"Usually or now?",img:"🔄",step:true,wide:true,lines:[
      {table:[["","Present Simple","Present Continuous"],["Use","habits, things that are always true","actions happening **now**"],["Form","I **play** · she **plays**","I**'m playing** · she**'s playing**"],["Time words","**usually**, always, never, every weekend, on Sundays, in winter","**now**, right now, at the moment, today, this weekend, Look!, Listen!"]]},
      "Mei **usually comes** to the ice rink on Sunday afternoons. **Right now** she**'s practising** her turns.",
      {watch:"Habit + now in one sentence: I **usually go** swimming, **but today** I**'m watching** a match."}],
      ca:["Present Simple = el que fas normalment (hàbits). Present Continuous = el que està passant ara.","Mira les paraules de temps: usually, every… → Present Simple; now, today, Look! → Present Continuous."]},
    {q:"Mei usually ___ to the ice rink on Sunday afternoons.",img:"⛸️",options:["comes","is coming","come","coming"],why:"**usually** → a habit → Present Simple: she come**s**."},
    {q:"Look! Kai ___ (fall) again!",img:"🤕",write:["is falling","'s falling"],why:"**Look!** → now → **is falling**."},
    {q:"Which time expression goes with the Present Continuous?",img:"⏱️",options:["at the moment","every weekend","usually","on Saturday mornings"],why:"**at the moment** = now. The others are habits."},
    {q:"In summer we ___ (swim) in the sea every day.",img:"🏖️",write:["swim"],why:"**every day** → a habit → **swim**."},
    {q:"I usually wear trainers, but today I ___ boots.",img:"👢",options:["am wearing","wear","wears","wearing"],why:"**but today** → now → **am wearing**."},
    {theory:"Questions and negatives",img:"❓",step:true,wide:true,lines:[
      {table:[["","Present Simple (do / does)","Present Continuous (am / is / are)"],["Negative","Noah **doesn't ride** on Mondays.","Noah **isn't riding** today."],["Question","**Do** you **train** on Tuesdays?","What **are** you **doing**?"],["Short answer","Yes, I **do**. / No, she **doesn't**.","Yes, I **am**. / No, he **isn't**."]]},
      "**How often** do you go skating? — **Twice a week.**",
      {watch:"Don't mix them: ~~Do you watching~~ → **Are** you **watching**? · ~~Is she like~~ → **Does** she **like**?"}],
      ca:["Present Simple: do / does + verb (sense -s). Present Continuous: am / is / are + verb-ing.","No barregis do amb -ing."]},
    {q:"___ you usually train on Tuesdays? — Yes, we do.",img:"🏋️",options:["Do","Are","Does","Is"],why:"A habit question: **Do** you train…? — Yes, we **do**."},
    {q:"Noah ___ (not / ride) today: he's filming the race.",img:"🚴",write:["isn't riding","is not riding","'s not riding"],why:"**today** → now → **isn't riding**."},
    {q:"What ___ Kai doing at the moment? — He's falling!",img:"⛸️",options:["is","does","do","are"],why:"Now: What **is** Kai **doing**?"},
    {q:"Mei's dad ___ (not / go) skating in winter: it's too cold.",img:"🥶",write:["doesn't go","does not go"],why:"A habit, he → **doesn't go** (no -s after doesn't)."},
    {q:"Which question is correct?",img:"✅",options:["Are you watching the match now?","Do you watching the match now?","Are you watch the match now?","Do you are watching the match now?"],why:"Now → **Are** you **watching**…?"},
    {theory:"State verbs: never -ing",img:"🧠",step:true,lines:[
      "Some verbs are **states** (feelings, thoughts), not actions: **like, love, hate, want, need, know, prefer, understand, believe, mean**.",
      "We use them in the **Present Simple**, even for now: I **want** a new helmet now. **Do** you **understand**?",
      {watch:"~~I'm needing new gloves~~ → I **need** new gloves. · ~~Are you knowing~~ → **Do** you **know**?"},
      "**think**: opinion → I **think** skating is fun. An activity now → Be quiet! I**'m thinking** about my next video."],
      ca:["Els verbs d'estat (like, want, need, know…) no van mai en -ing, encara que parlem d'ara.","think: opinió → I think…; pensar ara mateix → I'm thinking about…"]},
    {q:"I ___ a new helmet: mine is too small.",img:"⛑️",options:["want","am wanting","wanting","wants"],why:"**want** is a state verb: no -ing."},
    {q:"She ___ (prefer) skating to cycling.",img:"⛸️",write:["prefers"],why:"**prefer** is a state verb: she prefer**s**."},
    {q:"Which sentence is correct?",img:"✅",options:["Do you know the rules of this game?","Are you knowing the rules of this game?","Do you knowing the rules of this game?","Are you know the rules of this game?"],why:"**know** is a state verb: **Do** you **know**…?"},
    {q:"I ___ (not / understand) this exercise. Can you help me?",img:"🤔",write:["don't understand","do not understand"],why:"**understand** is a state verb → **don't understand**."},
    {theory:"Not only this second: temporary",img:"📆",step:true,lines:[
      "The Present Continuous is also for things that are true **for a short time**: **This month** I**'m training** for a race.",
      "My cousin **is staying** with us **this week**. (Usually she lives in Lleida.)",
      {watch:"Plans: **This weekend** we**'re going** to a concert. **Next week** I**'m racing** too."}],
      ca:["El Present Continuous també serveix per a coses temporals (this month, this week) i per a plans (this weekend, next week)."]},
    {q:"This month I ___ (train) for a race, so I ride every day.",img:"🚵",write:["am training","'m training"],why:"**this month** → temporary → **am training**."},
    {q:"Leo usually wins, and he ___ again today!",img:"🏆",options:["is winning","wins","win","is wining"],why:"**today** → is wi**nn**ing (double the n)."},
    {q:"Be quiet, please! I ___ (think) about my next video.",img:"💭",write:["am thinking","'m thinking"],why:"An activity now: I**'m thinking** about…"},
    {q:"I ___ skating is more fun than cycling.",img:"🗣️",options:["think","am thinking","thinking","thinks"],why:"An opinion → **think** (no -ing)."},
  ]
});
