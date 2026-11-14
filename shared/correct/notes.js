/* ✅ Correct together (shared/correct/index.html): what the Learning Path data does not say, kept apart so that the readings the students
   do (data/<lp>.js) never change (Roger, 12 Nov 2026: "don't change any reading that's already done in class or set as homework").
   window.EL_CORRECT["<course>/<ls folder>/<lp>"] = {
     ev:  { "<panel id>": { "<question text, or its id>": where to look } }
          where to look: a phrase of the text (highlighted in the sentence that has it), a list of phrases (several sentences), an object
          by route ({ daring: …, all: … }), or false (nothing to highlight: the question is about the whole text).
          Without an entry the screen picks the sentence that shares most words with the answer and the question.
     log: { "<panel id>": { "<field id>": { beginners, insecure, safe, daring } } }: model notes for a reading log, per route, from that
          route's text. A field a route does not have is left out. logNote: { "<panel id>": a line under the log's title }.
   } */
window.EL_CORRECT = {
  '2eso/free-time-live/what-are-they-doing': {
    log: { log: {
      a1: { beginners: 'training for a competition · Nil climbing the red route', insecure: 'training for the regional competition · Nil climbing · friends cheering',
            safe: 'training for the regional competition · Nil on the red route (the hardest) · friends cheering', daring: 'training for next month’s regional competition · Nil on the hardest route · friends cheering from the mats' },
      a2: { beginners: 'climbing wall (Climb Up Club) · Sat 14 Nov, 11:05', insecure: 'climbing wall (Climb Up Club) · Sat 14 Nov, 11:05', safe: 'Climb Up Club, climbing wall · Sat 14 Nov, 11:05', daring: 'Climb Up Club, climbing wall · Sat 14 Nov, 11:05' },
      a3: { beginners: 'train on Saturday mornings', insecure: 'train on Saturday mornings', safe: 'train on Sat mornings, 10–12 · always finish with a game', daring: 'train on Sat mornings, 10–12 · finish with a game (climbing = fun)' },
      a4: { insecure: 'to inform + to invite · “Come and try!”', safe: 'to inform + to invite · “Do you want to try?”', daring: 'to inform + to invite · “just send us a message”' },
      b1: { insecure: 'run 3 km with family and friends · food market after', safe: 'run or walk 3 km · food market, hot chocolate', daring: 'run or walk 3 km · food market · run for a good cause' },
      b2: { beginners: 'Parc Central · Sun 22 Nov, 10:00', insecure: 'Parc Central · Sun 22 Nov, 10:00', safe: 'Parc Central · Sun 22 Nov, 10:00', daring: 'Parc Central · Sun 22 Nov, 10:00' },
      b4: { insecure: 'to sell + to invite · “Tickets: 5 euros” · “Sign up now”', safe: 'to sell + to invite · “they are selling fast”', daring: 'to sell + to invite · “selling fast” · “a good cause”' },
      word: { safe: 'shelter = a home for animals with no owner · clue: “the money goes to the local animal shelter”', daring: 'mats = soft floor under the wall · clue: “cheering him on from the mats”' },
      cmp: { daring: 'post: live, present continuous (“is climbing”), friendly, emojis · web page: facts (date, place, price), orders (“Sign up now!”), urgency (“selling fast”)' }
    } }
  },
  '4eso/seasons-and-celebrations/celebrations-around-the-world': {
    ev: { read: {
      'Which celebration has a game with a spinning top?': 'spinning top',
      'Which two celebrations use lights or candles as a main symbol?': ['festival of lights', 'candle']
    } },
    logNote: { log: 'Core and Plus chose any two celebrations: these notes use Diwali and Lunar New Year.' },
    log: { log: {
      w1: { beginners: 'Diwali · festival of lights · October or November', insecure: 'Diwali · festival of lights · Hindus, Sikhs, Jains · Oct or Nov · five days',
            safe: 'Diwali · festival of lights · Hindus, Sikhs, Jains · Oct or Nov · five days', daring: 'Diwali · festival of lights · Hindus, Sikhs, Jains · Oct or Nov (moon) · five days · also in Leicester, UK' },
      c1: { beginners: 'light diyas (oil lamps) · presents and sweets · fireworks', insecure: 'clean + decorate houses · light diyas · visit family, presents, sweets · fireworks',
            safe: 'decorate homes · light diyas · patterns on the floor · gifts and sweets', daring: 'light diyas · rangoli patterns on the floor · gifts and sweets · fireworks' },
      w2: { insecure: 'Lunar New Year · China, Vietnam, Korea… · late Jan or Feb', safe: 'Lunar New Year · China, Vietnam, Korea… · late Jan or Feb', daring: 'Lunar New Year · China, Vietnam, Korea… · late Jan or Feb · new lunar year' },
      c2: { insecure: 'clean houses (bad luck out) · big family dinner · red lanterns, dragon dances · red envelopes', safe: 'clean houses · reunion dinner, travel home · lanterns, dragon and lion dances · red envelopes',
            daring: 'clean houses · reunion dinner · busiest travel time · red lanterns (red = luck) · red envelopes' },
      v1: { beginners: 'diyas = small oil lamps · clue: “light small oil lamps called diyas”', insecure: 'diyas = small oil lamps · clue: “oil lamps called diyas”',
            safe: 'sweep away = take out · clue: “clean their houses to sweep away bad luck”', daring: 'rangoli = colourful floor patterns · clue: “patterns called rangoli are made on the floor”' },
      v2: { insecure: 'sweep away = take out · clue: “(to take bad luck out of the house)”', safe: 'reunion = meeting again · clue: “families get together for a big reunion dinner”', daring: 'lunar = of the moon · clue: “its date depends on the moon”' },
      why: { daring: 'cleaning before Lunar New Year = a fresh, lucky start · the text says “to sweep away bad luck”, so a clean house lets the new year start well' }
    } }
  },
  '2eso/free-time-live/write-your-vlog-script': {
    ev: { read: {
      'Which slide has the sources and the photo credits?': ['Slide 7 · Credits', 'Photos:'],
      'Which tip is Noa going to apply?': ['keep your phone out of your bedroom', 'That’s the one I’m going to apply']
    } }
  },
  '4eso/seasons-and-celebrations/research-it-right': {
    ev: { read: { 'Which sentence avoids a stereotype?': 'Avoid stereotypes' } }
  },
  '4eso/seasons-and-celebrations/write-to-the-head-teacher': {
    ev: { read: {
      'When is the event?': 'propose a celebration day',
      'How many requests does Omar make?': ['Could we use', 'Would it be possible', 'I would be grateful', 'Would it also be possible'],
      'What is the order of the paragraphs?': false,
      'Which worry might the head teacher still have?': false
    } }
  },
  '4eso/seasons-and-celebrations/sample-exam': {
    ev: { read: { 'Which tradition has changed more over time, according to the text?': 'used to have' } }
  }
};
