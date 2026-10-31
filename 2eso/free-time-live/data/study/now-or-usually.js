/* LS2 · Learning Path 3 · Study guide (shared/js/el-study.js). Practice only, new items (not the checkpoint's or the sample exam's). */
window.LP.study = {
  next: 2,
  covers: { ca: 'Learning Paths 1–3', en: 'Learning Paths 1–3' },
  today: { ca: 'dues frases amb usually, dues amb now i cinc expressions de temps', en: 'two sentences with usually, two with now and five time expressions' },
  exam: { ca: 'd’aquest Learning Path surten el Listening (preguntes amb quatre opcions), el Vocabulary (expressions de temps) i el Grammar (Present Simple o Present Continuous).', en: 'this Learning Path comes up in the Listening (questions with four options), the Vocabulary (time expressions) and the Grammar (Present Simple or Present Continuous, state verbs).' },
  check: [
    ['', 'I usually ___ (go) to the park on Sundays.', 'go', ['usually → Present Simple.', 'usually → Present Simple.']],
    ['', 'Today I ___ (stay) at home: it’s raining.', 'am staying|\'m staying', ['Avui, ara → am + -ing.', 'Today → am + -ing.']],
    ['', 'Listen! My dad ___ (sing) in the shower.', 'is singing|\'s singing', ['Listen! → ara: is + -ing.', 'Listen! → now: is + -ing.']],
    ['', 'We ___ (play) basketball every Tuesday.', 'play', ['every Tuesday → Present Simple.', 'every Tuesday → Present Simple.']],
    ['', 'In winter it’s cold, but in ___ it’s hot. (estiu)', 'summer', ['Estiu = summer.', 'summer = estiu.']],
    ['insecure', 'My mum ___ (not / work) today: it’s Sunday.', "isn't working|is not working|'s not working", ['Avui → isn’t + -ing.', "Today → isn't + -ing."]],
    ['insecure', '___ you usually walk to school? — Yes, I do.', 'do', ['usually → Do you…?', 'usually → Do you…?']],
    ['insecure', 'She ___ (wear) a hat right now.', 'is wearing|\'s wearing', ['Right now → is + -ing.', 'Right now → is + -ing.']],
    ['safe', 'He ___ (need) new trainers. His are too small. (state verb)', 'needs', 'need is a state verb: no -ing.'],
    ['safe', '___ the weekend, I go cycling with my dad.', 'at', 'at the weekend.'],
    ['safe', 'I ___ (know) the answer!', 'know', 'know is a state verb: no -ing.'],
    ['daring', 'This month I ___ (learn) to skate.', 'am learning|\'m learning', 'A temporary situation → Present Continuous.'],
    ['daring', 'Leo ___ (prefer) cycling to skating.', 'prefers', 'prefer is a state verb: Present Simple.']
  ],
  listen: { video: 'video/mei-ice-rink.mp4', items: [
    ['', 'What is the temperature?', ['about three degrees', 'about thirteen degrees', 'about thirty degrees', 'below zero'], ['«…about three degrees…»', '“…about three degrees…”']],
    ['', 'What month is it?', ['December', 'November', 'January', 'October'], ['«It’s December…»', '“It’s December…”']],
    ['', 'What colour is Mei’s jacket?', ['red', 'blue', 'white', 'black'], ['«…a big red jacket.»', '“…a big red jacket.”']],
    ['safe', 'What is Mei’s group doing for the show?', ['a dance on ice', 'a race on ice', 'a song', 'a hockey match'], '“My group is doing a dance on ice.”'],
    ['daring', 'How does Mei feel about her training?', ['It’s difficult, but she loves it.', 'It’s easy and boring.', 'She hates it.', 'She is scared of falling.'], '“It’s difficult, but I love it.”']
  ] },
  vocab: [
    ['', 'I go to the park ___ Saturday mornings.', ['on', 'in', 'at', 'to'], ['Dies → on.', 'Days → on.']],
    ['', '___! Kai is falling!', ['Look', 'Usually', 'Every', 'Never'], ['Look! → ara.', 'Look! → now.']],
    ['', 'We go skating ___ weekend.', ['every', 'now', 'today', 'at'], ['Cada cap de setmana = every weekend.', 'every weekend = a habit.']],
    ['insecure', 'It’s cold ___ winter.', ['in', 'on', 'at', 'to'], ['Estacions → in.', 'Seasons → in.']],
    ['safe', 'The ___ today is 3 degrees.', 'temperature', 'temperature = how hot or cold it is.'],
    ['daring', 'Do you ___ chocolate or vanilla ice cream? (preferir)', 'prefer', 'prefer = like more.']
  ],
  grammar: [
    ['', 'I ___ to school by bus every day.', ['go', 'am going', 'goes', 'going'], ['every day → Present Simple.', 'every day → Present Simple.']],
    ['', 'Look! It ___.', ['is snowing', 'snows', 'snowing', 'snow'], ['Look! → is + -ing.', 'Look! → is + -ing.']],
    ['', 'She usually ___ jeans, but today she’s wearing a dress.', ['wears', 'is wearing', 'wear', 'wearing'], ['usually → Present Simple: wears.', 'usually → Present Simple: wears.']],
    ['insecure', 'What ___ you doing at the moment?', 'are', ['At the moment → are you + -ing?', 'At the moment → are you + -ing?']],
    ['safe', 'I ___ (want) a hot chocolate now.', 'want', 'want is a state verb: no -ing, even now.'],
    ['daring', 'My cousin ___ (live) with us this year, so we skate together.', 'is living|\'s living', 'A temporary situation → Present Continuous.']
  ]
};
