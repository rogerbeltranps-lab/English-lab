// Class game: 4 ESO Seasons & Celebrations LP5 Plan the day · GRAMMAR ONLY (Roger, 21 Nov 2026: the LS2 wrap-up, class 1 of week 1:
// listening + grammar, then "a game with the grammar and/or vocab we've seen in class"). Core level, the path's Grammar step: going to
// for plans, will for decisions and offers, there will be; then arrangements (Present Continuous), timetables (Present Simple) and
// predictions (will); as the stretch, going to with evidence (4eso/seasons-and-celebrations/data/plan-the-day.js, grammar and Which
// future?). Every question comes from those items, reworded only to fit the game. The vocabulary game is 4eso-ls2-lp5-vocab.js.
// Deck format (AGENTS.md, "Class games"): a theory slide {theory, point, tab, lines, ca}, a question {q, img, options, why} (the FIRST
// option is the right one) or a written question {q, img, write, why}. **word** is highlighted, ___ is a gap, ~~word~~ is crossed out.
ELGameDeck({
  title:"Grammar · Future plans",
  slides:[
    {theory:"going to, will or there will be?",point:"going to (plans) · will (decisions, offers) · there will be",tab:"grammar",pointCa:"going to (plans) · will (decisions, ofertes) · there will be",img:"📅",step:true,wide:true,lines:[
      {table:[["","Use","Example"],["**going to** + verb","a plan you already have","We**'re going to decorate** the hall."],["**will** ('ll) + verb","a decision you make now, an offer","\"We need music!\" \"I**'ll bring** my speaker!\""],["**there will be** + noun","what the event has","**There will be** music and food."]]},
      {watch:"\"These boxes are heavy.\" ~~I'm going to help you~~ → I**'ll help** you! (you decide now)"}],
      ca:["going to: un pla que ja tens. will: una decisió que prens ara o una oferta.","there will be = hi haurà."]},
    {q:"We ___ ___ ___ (decorate) the hall. It's our plan.",img:"🎨",write:["are going to decorate","'re going to decorate"],why:"A plan → **are going to decorate**."},
    {q:"\"We need music!\" \"I ___ bring my speaker!\"",img:"🔊",options:["'ll","'m going to","bring","am bringing"],why:"A decision now, an offer → **I'll**."},
    {q:"___ ___ ___ music and food at the event.",img:"🍲",write:["there will be"],why:"What the event has → **There will be**."},
    {q:"Ana ___ ___ ___ (make) the posters. She bought the paper yesterday.",img:"🖍️",write:["is going to make","'s going to make"],why:"She already planned it → **is going to make**."},
    {q:"\"It's cold in here.\" \"I ___ close the window.\"",img:"🪟",options:["'ll","'m going to","close","am closing"],why:"You decide now → **I'll** close it."},
    {q:"We ___ ___ ___ ___ (not / invite) other schools. We decided it yesterday.",img:"🏫",write:["aren't going to invite","are not going to invite","'re not going to invite"],why:"A plan, negative → **aren't going to invite**."},
    {q:"___ you going to come to the celebration day?",img:"❓",options:["Are","Do","Will","Is"],why:"Question with going to: **Are** you going to…?"},
    {q:"\"These boxes are heavy.\" \"I ___ help you!\"",img:"📦",write:["will","'ll"],why:"An offer → **will** ('ll)."},
    {theory:"Arrangements, timetables and predictions",point:"Arrangements, timetables and predictions",tab:"grammar",pointCa:"Cites, horaris i prediccions",img:"🗓️",step:true,wide:true,lines:[
      {table:[["","Form","Example"],["an arrangement (it's in the diary)","Present Continuous","We**'re meeting** the head teacher on Monday at 9."],["a timetable, a programme","Present Simple","The event **starts** at 10.00. The bus **leaves** at 8.15."],["a prediction (I think…)","will","I think everyone **will love** it."]]}],
      ca:["Una cita amb hora i lloc: Present Continuous. Un horari o programa: Present Simple. Una predicció: will."]},
    {q:"We ___ ___ (meet) the head teacher on Monday at 9. It's in her diary.",img:"📒",write:["are meeting","'re meeting"],why:"An arrangement → **are meeting**."},
    {q:"The event ___ (start) at 10.00, according to the programme.",img:"🕙",write:["starts"],why:"A timetable → Present Simple: **starts**."},
    {q:"I think everyone ___ ___ (love) it.",img:"😍",write:["will love","'ll love"],why:"A prediction with I think → **will love**."},
    {q:"The bus ___ at 8.15 tomorrow. It's on the timetable.",img:"🚌",options:["leaves","is going to leave","will leaving","leave"],why:"A timetable → **leaves**."},
    {q:"We booked the hall yesterday: we ___ a dance at 12.",img:"💃",options:["are performing","perform","will performing","performing"],why:"An arrangement → **are performing**."},
    {theory:"Which future? Look at the evidence",point:"Which future? going to with evidence",tab:"grammar",pointCa:"Quin futur? going to amb una prova",img:"🌧️",lines:[
      "**going to** also predicts what we can **see** is coming: Look at those dark clouds! It**'s going to rain**.",
      {watch:"An arrangement is not will: ~~We will meet the head teacher on Monday at 9~~ → We**'re meeting** her on Monday at 9."}],
      ca:["Si veus una prova (núvols negres), fes servir going to: It's going to rain."]},
    {q:"Look at those dark clouds! It ___ before the parade.",img:"⛈️",options:["'s going to rain","rains","is raining","rain"],why:"You can see it coming → **is going to rain**."},
    {q:"\"Nobody has a speaker.\" \"Don't worry, I ___ ___ (bring) mine.\"",img:"🎶",write:["will bring","'ll bring"],why:"A decision now → **will bring**."},
    {q:"The doors ___ (open) at 9.30, and the event finishes at 13.00.",img:"🚪",write:["open"],why:"A timetable → Present Simple: the doors **open**."},
    {q:"Next year I ___ join the student council. I've decided.",img:"🗳️",options:["'m going to","will to","join","joining"],why:"A plan you already decided → **I'm going to**."},
  ]
});
