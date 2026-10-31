/* LS2 · Learning Path 5 · Study guide (shared/js/el-study.js). Practice only, new items (not the checkpoint's or the sample exam's). */
window.LP.study = {
  next: 3,
  covers: { ca: 'LS1, Learning Paths 1–3 i 5', en: 'LS1, Learning Paths 1–3 and 5' },
  today: { ca: 'cinc paraules per organitzar un esdeveniment i dues frases sobre un pla (going to i will)', en: 'five words for planning an event and three sentences about a plan (going to, will, Present Continuous)' },
  exam: { ca: 'd’aquest Learning Path surten el Listening (preguntes amb quatre opcions), el Vocabulary (organitzar un esdeveniment) i el Grammar (going to, will, there will be).', en: 'this Learning Path comes up in the Listening (questions with four options), the Vocabulary (planning an event) and the Grammar (going to, will, Present Continuous for arrangements, Present Simple for timetables).' },
  check: [
    ['', 'I ___ ___ ___ (buy) the tickets this afternoon. It’s my plan.', 'am going to buy|\'m going to buy', ['Un pla → am going to + verb.', 'A plan → am going to + verb.']],
    ['', '“I’m thirsty.” “I ___ get you some water.”', 'will|\'ll', ['Una decisió del moment → will.', 'A decision now → will.']],
    ['', '___ ___ ___ a party after the match.', 'there will be', ['En el futur: there will be.', 'Future: there will be.']],
    ['', 'We ___ our friends at the festival every year. (quedar amb)', 'meet', ['Quedar amb = meet.', 'meet = see by arrangement.']],
    ['', 'Halloween is ___ 31 October.', 'on', ['Data → on.', 'Date → on.']],
    ['insecure', 'Can you put ___ the posters on the wall? (penjar)', 'up', ['Penjar cartells = put up posters.', 'put up = hang on a wall.']],
    ['insecure', 'We need to ___ people to the party. (convidar)', 'invite', ['Convidar = invite.', 'invite = ask someone to come.']],
    ['insecure', 'My cousin ___ (not / like) parades.', "doesn't like|does not like", ['Negatiu amb he / she: doesn’t + verb.', "Negative with he / she: doesn't + verb."]],
    ['safe', 'We ___ ___ (see) the dentist at 5 tomorrow. It’s in the diary.', 'are seeing|\'re seeing', 'An arrangement → Present Continuous.'],
    ['safe', 'The film ___ (start) at 8.30 tonight, according to the cinema website.', 'starts', 'A timetable → Present Simple.'],
    ['safe', 'Diwali, Hanukkah and Christmas are ___ of light.', 'festivals', 'festivals of light.'],
    ['daring', 'I think lots of families ___ ___ (come).', 'will come', 'A prediction → will.'],
    ['daring', 'The event will be ___ in the school hall. (= take place)', 'held', 'be held = take place.']
  ],
  listen: { audio: 'audio/student-council-meeting.mp3', items: [
    ['', 'Which festivals is the event about?', ['Diwali, Hanukkah, Lunar New Year and Christmas', 'Halloween, Diwali, Hanukkah and Christmas', 'only Christmas', 'Diwali, Thanksgiving, Hanukkah and Christmas'], ['«…festivals of light: Diwali, Hanukkah, Lunar New Year and Christmas.»', '“…festivals of light: Diwali, Hanukkah, Lunar New Year and Christmas.”']],
    ['', 'Why does the event finish at one thirty?', ['because school finishes at two', 'because the hall is small', 'because of the music', 'because families have lunch'], ['«School finishes at two, so…»', '“School finishes at two, so…”']],
    ['', 'What is the plan for the food?', ['Omar will ask the families.', 'The school will buy it.', 'Class 4B will cook it.', 'The primary school will bring it.'], ['«I’ll ask the families.»', '“I’ll ask the families.”']],
    ['safe', 'What does Omar say about the music?', ['His cousin plays in a band, and he’ll call him.', 'His cousin is going to sing alone.', 'There will be no music.', 'The primary school will play.'], '“My cousin plays in a band. I’ll call him tonight.”'],
    ['daring', 'How does Laia feel about the event at the end?', ['very positive', 'worried about the rain', 'bored', 'surprised by the date'], '“I think it’ll be the best day of the term!”']
  ] },
  vocab: [
    ['', 'We need to ___ tickets for the concert.', ['buy', 'meet', 'invite', 'go'], ['Comprar entrades = buy tickets.', 'buy tickets = comprar entrades.']],
    ['', 'Let’s ___ our friends at the festival.', ['meet', 'book', 'buy', 'put'], ['Quedar amb amics = meet friends.', 'meet friends = see them.']],
    ['', 'I’m going to ___ all my class to my party.', ['invite', 'book', 'set', 'send'], ['Convidar = invite.', 'invite = ask someone to come.']],
    ['insecure', 'We want to ___ a room for the workshop.', ['book', 'buy', 'go', 'meet'], ['Reservar = book.', 'book = reserve.']],
    ['safe', 'Who is going to put ___ the posters?', 'up', 'put up posters = hang them on the wall.'],
    ['daring', 'Our class is going to run a ___ with food from different countries.', 'stall', 'run a stall = be in charge of a small table that sells or shows things.']
  ],
  grammar: [
    ['', 'Look at those clouds! It ___ rain.', ['is going to', 'will to', 'going', 'is go'], ['Ho veus venir → is going to.', 'You can see it coming → is going to.']],
    ['', '“The bin is full.” “I ___ take it out.”', ['will', 'am going', 'going to', 'am'], ['Una decisió del moment → will.', 'A decision now → will.']],
    ['', 'There ___ four stalls at the event.', ['will be', 'will', 'are be', 'be'], ['Futur de there is → there will be.', 'Future of there is → there will be.']],
    ['insecure', 'We ___ ___ ___ (not / play) music after nine.', "aren't going to play|are not going to play", ['Negatiu: aren’t going to + verb.', "Negative: aren't going to + verb."]],
    ['safe', 'The museum ___ (open) at ten on Saturdays.', 'opens', 'A timetable → Present Simple.'],
    ['daring', 'Our grandparents ___ ___ (arrive) on Friday. They’ve booked the train.', 'are arriving|\'re arriving', 'An arrangement → Present Continuous.']
  ],
  native: {
    exam: 'the C2 version: listening for attitude and implication, a long reading, vocabulary (multiple-choice cloze and word formation), grammar (open cloze and key word transformations) and a formal letter.',
    check: [
      ['', 'We’re running out of time, so let’s get the ___ rolling.', 'ball', 'get the ball rolling = start.'],
      ['', 'Were the band ___ cancel, we would use a playlist.', 'to', 'Were + subject + to + infinitive.'],
      ['', 'By Friday we will ___ sent all the invitations.', 'have', 'Future perfect.'],
      ['', 'There is ___ to be a problem with the sound: there always is.', 'bound', 'be bound to = be certain to.'],
      ['', 'The stalls need to be set up well in ___.', 'advance', 'in advance.'],
      ['', 'Let’s not set the date in ___ until the head confirms.', 'stone', 'set in stone = fixed.'],
      ['', 'The event was a ___ (RESOUND) success.', 'resounding', 'a resounding success.'],
      ['', 'We have a back-___ plan in case it rains.', 'up', 'a back-up plan.'],
      ['', 'Under no ___ should food be left uncovered.', 'circumstances', 'Under no circumstances + inversion.'],
      ['', 'The head teacher is ___ to approve the plan: she loves the idea.', 'likely|sure|bound|certain', 'be likely / sure to.']
    ],
    listen: { audio: 'audio/student-council-meeting.mp3', items: [
      ['', 'Laia’s opening line mainly shows that she…', ['is aware of a deadline', 'is annoyed with Omar', 'has already spoken to the head', 'wants to cancel the event'], '“We’re meeting the head teacher on Monday, so we need a plan today.”'],
      ['', 'Which part of the plan is already arranged rather than only intended?', ['sending the invitations on Wednesday', 'getting food from the families', 'music from Omar’s cousin', 'using the gym'], '“We’re sending them on Wednesday” = an arrangement.'],
      ['', 'Laia mentions the small hall in order to…', ['test the plan against a likely problem', 'criticise Omar’s choice', 'suggest a different date', 'bring the meeting to an end'], 'She raises a risk so they can solve it.'],
      ['', 'Overall, the tone of the meeting is…', ['brisk and constructive', 'tense and argumentative', 'formal and distant', 'vague and unfocused'], 'Short questions, quick answers, solutions.']
    ] },
    vocab: [
      ['', 'We need to ___ out the details before Monday.', ['iron', 'smooth', 'flatten', 'press'], 'iron out the details.'],
      ['', 'The whole day went off without a ___.', ['hitch', 'hatch', 'hutch', 'hinge'], 'without a hitch = with no problems.'],
      ['', '___ (ATTEND) was much higher than expected.', 'attendance', 'attend → attendance.'],
      ['', 'The event has been ___ (THOROUGH) planned.', 'thoroughly', 'thorough → thoroughly.']
    ],
    grammar: [
      ['', 'If the band doesn’t come, we’ll use a playlist. SHOULD → ___, we’ll use a playlist.', 'should the band not come|should the band fail to come', 'Should + subject + verb (inverted conditional).'],
      ['', 'We will finish decorating before nine. HAVE → By nine we ___ decorating.', 'will have finished', 'Future perfect.'],
      ['', 'Open cloze: The event is ___ take place on 11 December.', 'to', 'be to + infinitive for official plans.'],
      ['', 'Open cloze: ___ happens, we’ll keep the stalls open until 13.30.', 'whatever', 'Whatever happens…']
    ]
  }
};
