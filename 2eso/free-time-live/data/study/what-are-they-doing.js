/* LS2 · Learning Path 2 · Study guide (shared/js/el-study.js). Practice only, new items (not the checkpoint's or the sample exam's). */
window.LP.study = {
  next: 1,
  covers: { ca: 'LS1 i Learning Paths 1 i 2', en: 'LS1 and Learning Paths 1 and 2' },
  today: { ca: 'cinc paraules de roba i temps i tres frases sobre el que fa la gent ara', en: 'five clothes and weather words and three sentences about what people are doing now' },
  exam: { ca: 'd’aquest Learning Path surten el Listening (preguntes amb quatre opcions), el Vocabulary (roba, equipament, temps) i el Grammar (Present Continuous).', en: 'this Learning Path comes up in the Listening (questions with four options), the Vocabulary (clothes, kit, weather, sport events) and the Grammar (Present Continuous).' },
  check: [
    ['', 'Look! The children ___ (play) in the snow.', 'are playing|\'re playing', ['Ara mateix → are + -ing.', 'Now → are + -ing.']],
    ['', 'I ___ (wear) my new trainers today.', 'am wearing|\'m wearing', ['Avui, ara → am + -ing.', 'Today → am + -ing.']],
    ['', 'It’s ___ today: take an umbrella. (plou)', 'raining', ['Plou = it’s raining.', 'It’s raining = plou.']],
    ['', 'Write the -ing form: shop → ___', 'shopping', ['Una vocal + una consonant: es dobla (shopping).', 'One vowel + one consonant: double it (shopping).']],
    ['', 'It’s hot. Wear ___ and a T-shirt. (pantalons curts)', 'shorts', ['Pantalons curts = shorts.', 'shorts = pantalons curts.']],
    ['insecure', 'We ___ (not / watch) TV now. We’re reading.', "aren't watching|are not watching", ['Negatiu: aren’t + -ing.', "Negative: aren't + -ing."]],
    ['insecure', '___ she dancing? — Yes, she is.', 'is', ['Pregunta: Is she + -ing?', 'Question: Is she + -ing?']],
    ['insecure', 'It’s ___: there’s a lot of wind. (fa vent)', 'windy', ['Fa vent = it’s windy.', 'windy = with a lot of wind.']],
    ['safe', 'Our team is playing in a ___ this weekend. (competició)', 'competition', 'competition = competició.'],
    ['safe', 'Why ___ you laughing?', 'are', 'Question: Why are you + -ing?'],
    ['safe', 'Look! Marc ___ ___ a goal! (marcar)', 'is scoring', 'Now → is + -ing.'],
    ['daring', 'The players are ___ up before the match. (escalfar)', 'warming', 'warm up = prepare your body.'],
    ['daring', 'Who ___ (win) the match right now?', 'is winning', 'Who as the subject: Who is winning?']
  ],
  listen: { audio: 'audio/live-from-the-sports-hall.mp3', items: [
    ['', 'What is the Green Team wearing?', ['green T-shirts and black shorts', 'a white uniform', 'blue T-shirts', 'black T-shirts and green shorts'], ['«…green T-shirts and black shorts.»', '“…green T-shirts and black shorts.”']],
    ['', 'What are the players doing at the start?', ['warming up', 'drinking water', 'eating sandwiches', 'talking to the coach'], ['«The players are warming up…»', '“The players are warming up…”']],
    ['', 'What is the coach doing at half-time?', ['talking to the team', 'drinking water', 'scoring', 'cheering'], ['«…the coach is talking to the team.»', '“…the coach is talking to the team.”']],
    ['safe', 'What happens when number four shoots?', ['She misses.', 'She scores two points.', 'She passes to Júlia.', 'She falls.'], '“…she’s shooting… and she misses.”'],
    ['daring', 'What will happen in ten minutes?', ['The second half will start.', 'The match will finish.', 'Marc will play as a defender.', 'The students will go home.'], '“It’s half-time now… We’ll be back in ten minutes.”']
  ] },
  vocab: [
    ['', 'You wear ___ on your feet.', ['trainers', 'a cap', 'shorts', 'a T-shirt'], ['Bambes = trainers.', 'trainers = sports shoes.']],
    ['', 'Take an umbrella. It’s ___.', ['raining', 'sunny', 'hot', 'windy'], ['Paraigua → plou: raining.', 'Umbrella → it’s raining.']],
    ['', 'It’s 35 degrees. It’s very ___.', ['hot', 'cold', 'windy', 'snowing'], ['35 graus → fa calor: hot.', '35 degrees → hot.']],
    ['insecure', 'You wear a ___ when you ride a bike.', ['helmet', 'costume', 'uniform', 'cap'], ['Casc = helmet.', 'helmet = casc.']],
    ['safe', 'Our team won the ___: we beat eleven other teams.', 'tournament', 'a tournament = a competition with many teams.'],
    ['daring', 'Fans ___ when their team scores.', 'cheer', 'cheer = shout because you are happy.']
  ],
  grammar: [
    ['', 'Look! Pol ___ the ball.', ['is kicking', 'kicks', 'kicking', 'are kicking'], ['Look! → ara: is + -ing.', 'Look! → now: is + -ing.']],
    ['', 'They ___ green T-shirts today.', ['are wearing', 'is wearing', 'wearing', 'wear are'], ['They → are + -ing.', 'They → are + -ing.']],
    ['', 'The -ing form of run is…', ['running', 'runing', 'runnning', 'runs'], ['Es dobla la n: running.', 'Double the n: running.']],
    ['insecure', 'Is your brother playing? — No, he ___.', "isn't|is not", ['Resposta curta negativa: No, he isn’t.', "Short answer: No, he isn't."]],
    ['safe', 'What ___ the coach ___ (do)? — He’s talking to the team.', 'is doing', 'Question: What is he doing?'],
    ['daring', 'Why ___ the fans ___ (shout)?', 'are shouting', 'Question word + are + subject + -ing.']
  ]
};
