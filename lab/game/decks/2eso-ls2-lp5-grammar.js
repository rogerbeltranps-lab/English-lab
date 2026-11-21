// Class game: 2 ESO Free Time, Live! LP5 Likes and screen tips · GRAMMAR ONLY (Roger, 21 Nov 2026: the LS2 wrap-up, class 3 of week 1:
// grammar + listening, then "a game with the grammar and/or vocab we've seen in class"). Core level, the path's Grammar step: love / like /
// don't mind / hate + -ing, imperatives for tips (Take… / Don't…) and, as the stretch, tips with because / so
// (2eso/free-time-live/data/likes-and-screen-tips.js). Every question comes from that step's items, reworded only to fit the game.
// Deck format (AGENTS.md, "Class games"): a theory slide {theory, point, tab, lines, ca}, a question {q, img, options, why} (the FIRST
// option is the right one) or a written question {q, img, write, why}. **word** is highlighted, ___ is a gap, ~~word~~ is crossed out.
ELGameDeck({
  title:"Grammar · Likes and tips",
  slides:[
    {theory:"love / like / don't mind / hate + -ing",point:"love / like / hate + -ing",tab:"grammar",pointCa:"love / like / hate + -ing",img:"❤️",step:true,wide:true,lines:[
      {table:[["😍","🙂","😐","🙁","😖"],["**love**","**like**","**don't mind**","**don't like**","**hate**"]]},
      "After these verbs, the action takes **-ing**: I **love skating**. She **hates losing**. **Do** you **like playing** online?",
      {watch:"~~I like play video games~~ → I like **playing** video games. · ~~She hate losing~~ → She **hates** losing."}],
      ca:["Després de love, like, don't mind, don't like i hate, el verb va amb -ing.","Amb he / she / it: hates, loves, likes (amb -s)."]},
    {q:"I love ___ (skate) at the park.",img:"🛹",write:["skating"],why:"love + **-ing**: skate → **skating** (no e)."},
    {q:"She ___ losing a match.",img:"😖",options:["hates","hate","hating","is hate"],why:"she → **hates** + -ing."},
    {q:"We don't like ___ up early on Sundays.",img:"⏰",options:["getting","get","to getting","gets"],why:"don't like + **-ing**: **getting** (double t)."},
    {q:"Correct the mistake: \"I like play video games.\" → I like ___ video games.",img:"🎮",write:["playing"],why:"like + **-ing** → **playing**."},
    {q:"___ you like playing online? — Yes, I do.",img:"💻",options:["Do","Are","Does","Is"],why:"A question with like: **Do** you like…? — Yes, I **do**."},
    {q:"My brother ___ (not / like) swimming.",img:"🏊",write:["doesn't like","does not like"],why:"he → **doesn't like** (no -s after doesn't)."},
    {q:"I don't ___ training in the rain: it's OK for me.",img:"🌧️",options:["mind","like","love","hate"],why:"**don't mind** = it's OK for me."},
    {q:"They love ___ (watch) highlights after the match.",img:"📺",write:["watching"],why:"love + **-ing** → **watching**."},
    {q:"Which sentence is correct?",img:"✅",options:["He hates getting up early.","He hate getting up early.","He hates get up early.","He hating getting up early."],why:"he → **hates** + **getting**."},
    {q:"I love ___ (swim) in the sea in summer.",img:"🌊",write:["swimming"],why:"swim → swi**mm**ing (double the m)."},
    {theory:"Tips: the verb alone",point:"Imperatives: tips (Take… / Don't…)",tab:"grammar",pointCa:"Imperatius: consells (Take… / Don't…)",img:"📢",step:true,wide:true,lines:[
      {table:[["✅ Do it","🚫 Don't do it"],["**Take** a break every 30 minutes.","**Don't use** your phone in bed."],["**Go** outside and **play**.","**Don't check** your phone every five minutes."]]},
      "A tip has **no subject**: no *you*.",
      {watch:"~~You put your phone away~~ → **Put** your phone away. · ~~No use your phone~~ → **Don't** use your phone. · ~~Don't to use~~ → Don't **use**."}],
      ca:["Un consell és el verb sol, sense you: Take a break.","Per dir que no: Don't + verb: Don't use your phone in bed."]},
    {q:"Tip: ___ a break every 30 minutes.",img:"☕",options:["Take","Takes","Taking","You take"],why:"A tip = the verb alone: **Take** a break."},
    {q:"Tip: ___ off your phone at night.",img:"📵",write:["switch","turn"],why:"**Switch off** (or **turn off**) your phone."},
    {q:"Tip: ___ use your phone in bed.",img:"🛏️",options:["Don't","No","Not","Doesn't"],why:"A negative tip: **Don't** + verb."},
    {q:"Make it a tip: \"You put your phone away at dinner.\" → ___ your phone away at dinner.",img:"🍽️",write:["put"],why:"No *you*: **Put** your phone away."},
    {q:"___ your phone out of your bedroom at night.",img:"🚪",options:["Keep","Keeping","To keep","You keeping"],why:"A tip = the verb alone: **Keep**."},
    {q:"Correct the mistake: \"Don't to use your phone in bed.\" → Don't ___ your phone in bed.",img:"❌",write:["use"],why:"Don't + verb, no *to*: Don't **use**."},
    {theory:"Tips with a reason",point:"Tips with because / so",tab:"grammar",pointCa:"Consells amb because / so",img:"💡",lines:[
      "**because** gives the reason: Switch off your phone at night, **because** the light keeps you awake.",
      "**so** gives the result: Set a time limit, **so** you have time for other things."],
      ca:["because = perquè (la raó). so = així (el resultat)."]},
    {q:"Switch off your phone at night, ___ the light keeps you awake.",img:"🌙",options:["because","so","but","or"],why:"The reason → **because**."},
    {q:"Set a time limit, ___ you have time for other things.",img:"⏳",options:["so","because","but","or"],why:"The result → **so**."},
  ]
});
