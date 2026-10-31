/* LS2 · Learning Path 1 · Study guide (shared/js/el-study.js). Practice only, new items (not the checkpoint's or the sample exam's). */
window.LP.study = {
  next: 1,
  covers: { ca: 'LS1 i Learning Paths 1 i 2', en: 'LS1 and Learning Paths 1 and 2' },
  today: { ca: 'cinc activitats de temps lliure amb play / go / do i dues frases sobre la teva setmana', en: 'five free-time activities with play / go / do and two sentences about your week' },
  exam: { ca: 'd’aquest Learning Path surten el Listening (preguntes amb quatre opcions), el Vocabulary (activitats de temps lliure, play / go / do) i el Grammar de LS1 (Present Simple, adverbis de freqüència).', en: 'this Learning Path comes up in the Listening (questions with four options), the Vocabulary (free-time activities, play / go / do) and the Grammar from LS1 (Present Simple, adverbs of frequency).' },
  check: [
    ['', 'I ___ (play) the guitar on Mondays.', 'play', ['I → play (sense -s).', 'I → play (no -s).']],
    ['', 'She ___ (go) swimming every Saturday.', 'goes', ['She → goes.', 'She → goes.']],
    ['', 'We play ___ at the park. (bàsquet)', 'basketball', ['Bàsquet = basketball.', 'basketball = bàsquet.']],
    ['', 'He ___ (be) good at football.', 'is', ['He → is.', 'He → is.']],
    ['', 'I listen ___ music on the bus.', 'to', ['listen to music.', 'listen to music.']],
    ['insecure', 'My sister ___ (not / do) karate.', "doesn't do|does not do", ['Negatiu amb she: doesn’t + verb.', "Negative with she: doesn't + verb."]],
    ['insecure', '___ you go cycling at the weekend? — Yes, I do.', 'do', ['Pregunta amb you: Do…?', 'Questions with you: Do…?']],
    ['insecure', 'I ___ go to bed late. (mai)', 'never', ['Mai = never.', 'never = 0 %.']],
    ['safe', 'I go skating ___ a week: on Tuesdays.', 'once', 'once a week = one time a week.'],
    ['safe', 'He reads comics ___ his free time.', 'in', 'in my / his free time.'],
    ['safe', 'What time ___ your sister get up?', 'does', 'Questions with he / she: does.'],
    ['daring', 'I want to ___ a basketball club. (apuntar-me)', 'join', 'join a club.'],
    ['daring', 'I practise the piano every day because I want to get ___.', 'better', 'get better (at) = improve.']
  ],
  listen: { audio: 'audio/where-are-you.mp3', items: [
    ['', 'Why is it noisy where Omar is?', ['He is at a basketball match.', 'He is at a concert.', 'He is in the park.', 'He is at home with his sister.'], ['És al poliesportiu mirant un partit.', 'He’s at the sports centre, watching a match.']],
    ['', 'When does the match finish?', ['at twelve', 'at half past twelve', 'at ten', 'at two'], ['«…the match finishes at twelve.»', '“…the match finishes at twelve.”']],
    ['', 'What will Laia bring?', ['the comic', 'her guitar', 'a cat', 'sandwiches'], ['«I’ll bring the comic.»', '“I’ll bring the comic.”']],
    ['safe', 'What does Omar want to see?', ['Laia’s comic', 'a real cat', 'the swimming pool', 'a guitar concert'], '“A cat who plays the guitar? I want to see it!”'],
    ['daring', 'Why does Omar ask “Do you want to meet in the square?”', ['to invite Laia', 'to say no to Laia', 'to ask about the weather', 'to talk about his sister'], 'It’s an invitation.']
  ] },
  vocab: [
    ['', 'I ___ football with my friends.', ['play', 'go', 'do', 'make'], ['Esports amb pilota → play.', 'Ball games → play.']],
    ['', 'We go ___ in the sea in summer.', ['swimming', 'swim', 'swims', 'to swim'], ['go + -ing: go swimming.', 'go + -ing: go swimming.']],
    ['', 'She ___ karate on Tuesdays.', ['does', 'plays', 'goes', 'makes'], ['Arts marcials → do.', 'Martial arts → do.']],
    ['insecure', 'I ___ my friends in the square on Saturdays.', ['meet', 'play', 'go', 'do'], ['Quedar amb amics = meet friends.', 'meet friends = see them.']],
    ['safe', 'We go cycling twice a ___.', 'week', 'twice a week = two times a week.'],
    ['daring', 'I spend a lot of time ___ (draw) comics.', 'drawing', 'spend time + -ing.']
  ],
  grammar: [
    ['', 'My friend ___ in Girona.', ['lives', 'live', 'living', 'is live'], ['He / she → -s: lives.', 'He / she → -s: lives.']],
    ['', '___ you like comics?', ['Do', 'Does', 'Are', 'Is'], ['Pregunta amb you: Do…?', 'Questions with you: Do…?']],
    ['', 'Which sentence is right?', ['I always go to the park on Sundays.', 'I go always to the park on Sundays.', 'Always I go to the park on Sundays.', 'I go to the park always on Sundays.'], ['L’adverbi va abans del verb: I always go.', 'The adverb goes before the verb: I always go.']],
    ['insecure', 'He ___ (not / play) the piano.', "doesn't play|does not play", ['Negatiu amb he: doesn’t + verb.', "Negative with he: doesn't + verb."]],
    ['safe', 'She ___ (watch) TV after dinner.', 'watches', '-ch + -es: watches.'],
    ['daring', 'I’m good ___ playing the guitar.', 'at', 'be good at + -ing.']
  ]
};
