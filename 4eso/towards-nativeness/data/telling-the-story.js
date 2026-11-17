/* Towards Nativeness · Learning Path 3 · Telling the story of your app (LS4 of the learning situations doc, B2 → C1): phrasal verbs and
   where the object goes, three-part verbs, verb + -ing / to / that, narrative tenses, indirect questions, and the calques to retire.
   Expressions come from Roger's vocabulary sheet (My_English_Vocabulary). */
window.LP = {
  key: 'tnStory', n: 3, title: 'Telling the story of your app',
  panels: [
    { id: 'spot', type: 'mc', tab: '🔍 Spot the mistake', title: 'Spot the calque', pill: 'Warm-up',
      intro: 'These are built from Catalan and then translated. A native speaker understands them, but can tell. Choose the part that gives you away.',
      items: [
        { q: '“It’s trigging a lot.”', o: ['trigging a lot', 'It’s', 'a lot'], ex: '<em>trigar molt</em> → <strong>It’s taking ages / a long time.</strong>' },
        { q: '“I want that you check it.”', o: ['want that you check', 'I', 'it'], ex: '<strong>I want you to check it.</strong>' },
        { q: '“I recommend you to start small.”', o: ['recommend you to start', 'I', 'small'], ex: '<strong>recommend + that</strong> or <strong>-ing</strong>: I recommend that you start small / I recommend starting small.' },
        { q: '“I’m looking forward to show you the app.”', o: ['looking forward to show', 'I’m', 'the app'], ex: 'After look forward to / get used to, the <em>to</em> is a preposition: <strong>looking forward to showing</strong>.' },
        { q: '“I figured out it after an hour.”', o: ['figured out it', 'I', 'after an hour'], ex: 'A pronoun goes in the middle of a phrasal verb: <strong>I figured it out.</strong>' },
        { q: '“Maintain the design, please.”', o: ['Maintain', 'the design', 'please'], ex: '<em>mantenir</em> → <strong>keep</strong> the design.' },
        { q: '“It works in here.”', o: ['in here', 'It works', 'It'], ex: '<em>aquí dins</em> → just <strong>here</strong>: It works here.' },
        { q: '“It’s normal that it fails.”', o: ['It’s normal that', 'it fails', 'fails'], ex: '<strong>No wonder it fails. / It’s no surprise it fails.</strong>' },
        { q: '“When I had the idea, I never built an app.”', o: ['I never built', 'When I had the idea', 'an app'], ex: 'What came before another past event: past perfect. <strong>I had never built an app.</strong>' },
        { q: '“Some students will have different paces when reading.”', o: ['will have different paces', 'Some students', 'when reading'], ex: '<strong>Some students will read at different paces.</strong> (read at your own pace)' }
      ] },

    { id: 'vocab', type: 'vocab', tab: 'Vocabulary', title: 'Expressions for telling the story (your vocabulary sheet)',
      intro: 'These 30 expressions come from your own vocabulary sheet, grouped by the stage of the story. Learn them with the flashcards both ways.',
      receptive: 'to bootstrap · a side project · to scale up · feedback loop · word of mouth',
      core: { daring: ["come up with an idea", "be into something", "come across a tool", 'get something off the ground', 'get something up and running', 'kick off with', 'get the hang of it', 'brush up on', 'hit a wall', "burn through credits", 'a close call', 'soldier on', 'take off', 'end up + -ing', 'run itself', 'pick up on', 'come across as', 'at the end of the day', 'what I’m getting at is', "keep in mind (that)"] },
      groups: [
        { g: 'The idea', items: [['come up with an idea', 'idear, empescar-se', 'I came up with the idea on a train.'], ['be into something', 'agradar molt', 'I’ve always been into technology.'], ['come across a tool', 'trobar per casualitat', 'I came across Claude Code by chance.'], ['get into coding', 'aficionar-se a programar', 'I got into coding last summer.']] },
        { g: 'Getting started', items: [['get something off the ground', 'posar en marxa', 'It took weeks to get it off the ground.'], ['get something up and running', 'fer funcionar', 'We got the site up and running in October.'], ['kick off with', 'començar amb', 'Every class kicks off with a game.'], ['get the hang of it', 'agafar-li el truc', 'After a week I got the hang of it.'], ['brush up on', 'refrescar', 'I had to brush up on my JavaScript.'], ['walk someone through', 'explicar pas a pas', 'Claude walked me through it.']] },
        { g: 'Problems', items: [['hit a wall', 'encallar-se', 'In November we hit a wall.'], ['burn through credits', 'gastar ràpidament', 'I burnt through my credits in two days.'], ['a close call', 'per un pèl', 'Losing the database was a close call.'], ['get carried away', 'deixar-se emportar', 'I got carried away and added too many features.'], ['second-guess yourself', 'dubtar de tu mateix', 'Stop second-guessing yourself.'], ['put up with', 'aguantar', 'Students put up with a lot of bugs.']] },
        { g: 'Keeping going', items: [['stick with it', 'perseverar', 'I stuck with it, and it paid off.'], ['soldier on', 'tirar endavant', 'We soldiered on through the bugs.'], ['cope with', 'fer front a', 'The server couldn’t cope with 50 students.'], ['stand up to', 'plantar cara', 'You have to stand up to the doubters.']] },
        { g: 'Results', items: [['take off', 'enlairar-se, triomfar', 'The app really took off in November.'], ['end up + -ing', 'acabar fent', 'I ended up rebuilding the whole dashboard.'], ['run itself', 'funcionar sol', 'Now the class almost runs itself.'], ['pick up on', 'adonar-se de', 'Students picked up on every small change.'], ['come across as', 'semblar, transmetre', 'I don’t want to come across as arrogant.'], ['show off', 'presumir', 'I’m not trying to show off.']] },
        { g: 'Your opinion', items: [['at the end of the day', 'al capdavall', 'At the end of the day, it’s about the students.'], ['what I’m getting at is', 'el que vull dir és', 'What I’m getting at is that it saves time.'], ['keep in mind (that)', 'tenir present', 'Keep in mind that it’s free.'], ['I’m not sold on', 'no n’estic convençut', 'I’m not sold on AI marking yet.'], ['a daunting task', 'una tasca aclaparadora', 'It seemed a daunting task at first.']] }
      ],
      practice: [
        { q: 'I came ___ with the idea while I was marking exams.', a: ['up'] },
        { q: 'It took us a month to get the site up and ___.', a: ['running'] },
        { q: 'At first it was hard, but after a week I got the ___ of it.', a: ['hang'] },
        { q: 'In November we hit a ___: nothing seemed to work.', a: ['wall'] },
        { q: 'I burnt ___ my weekly limit in two days.', a: ['through'] },
        { q: 'We almost lost every mark. It was a close ___.', a: ['call'] },
        { q: 'The app really took ___ after the second term.', a: ['off'] },
        { q: 'I ended up ___ (rebuild) the whole dashboard.', a: ['rebuilding'] },
        { q: 'Students pick up ___ every little change.', a: ['on'] },
        { q: 'At the end of the ___, it’s about the students.', a: ['day'] }
      ] },

    { id: 'read', type: 'mc', tab: 'Reading', title: 'Reading: From a tablecloth sketch to 120 users', pill: 'C1',
      intro: 'A teachers’ newsletter tells the story of a classroom app. Notice the narrative tenses and the phrasal verbs.',
      media: { text: '<p><strong>From a tablecloth sketch to 120 users</strong></p>' +
        '<p>When Marta Vidal came up with the idea for her vocabulary app, she had never written a line of code. She was sitting in a café after a parents’ evening, doodling on a paper tablecloth, when it struck her that her students forgot most of the words she taught them within a week. “I’d tried flashcards, games, everything,” she says. “What I hadn’t tried was making them come back to the words at the right moment.”</p>' +
        '<p>Getting the project off the ground was, by her own admission, a daunting task. She spent the summer brushing up on the basics with online courses, and she came across an AI coding assistant almost by accident. “At first I second-guessed myself constantly. I’d ask it to make a change and then spend an hour trying to figure out what it had actually done.” But she stuck with it, and by October she had a working prototype up and running.</p>' +
        '<p>Then she hit a wall. On the first day she used the app with a full class, the server couldn’t cope with thirty students logging in at once, and the whole thing crashed. “It was a close call,” she remembers. “I nearly gave up. But the students picked up on how much it mattered to me, and they kept asking when it would be back.” She soldiered on, worked around the problem with a simpler login, and ironed out the remaining bugs over the Christmas holidays.</p>' +
        '<p>Since then, the app has taken off. More than a hundred and twenty students now use it every week, and Marta has ended up rebuilding most of it twice. Some lessons, she says, almost run themselves. Asked what she would recommend to other teachers, she doesn’t hesitate. “I’d recommend that they start small and keep in mind that it doesn’t have to be perfect. At the end of the day, what I’m getting at is simple: the students don’t care how clever the code is. They care whether it helps them.”</p>' },
      items: [
        { q: 'What had Marta tried before the app?', o: ['flashcards and games', 'nothing at all', 'a different app'] },
        { q: '“By her own admission, a daunting task” means she…', o: ['admits it was very hard and intimidating', 'thinks it was easy', 'was forced to admit she failed'] },
        { q: 'Why did the app crash on the first day?', o: ['Too many students logged in at the same time.', 'She had forgotten to save the code.', 'The AI assistant made a mistake.'] },
        { q: 'What kept Marta going after the crash?', o: ['The students kept asking when it would be back.', 'Her head teacher insisted.', 'She had already paid for the server.'] },
        { q: 'Which sentence uses the past perfect for something that came before?', o: ['“she had never written a line of code”', '“the app has taken off”', '“she spent the summer brushing up”'] },
        { q: 'What is Marta’s main advice?', o: ['Start small; it doesn’t have to be perfect.', 'Learn to code properly first.', 'Use the cleverest code possible.'] }
      ] },

    { id: 'listen', type: 'mc', tab: 'Listening', title: 'Listening: The podcast interview', pill: 'C1 · two voices',
      intro: 'A short education podcast. The host interviews a teacher who built an app. Listen for how he tells the story.',
      media: { audio: 'audio/lp3-podcast.mp3', title: 'Teachers who code: episode 12', script: [
        ['Host', 'Welcome back to Teachers Who Code. My guest today built a learning platform for his own classes. So, how did it all start?'],
        ['Jordi', 'Honestly, by accident. I’d been teaching for fifteen years and I was getting tired of the same worksheets. One evening I came across a video about AI coding tools, and I thought, why not?'],
        ['Host', 'Had you done any coding before?'],
        ['Jordi', 'Hardly any. I’d made a website for my football club years ago, but that was it. So the first few weeks were rough. I kept asking the AI to change things and then I couldn’t figure out what it had done.'],
        ['Host', 'When did you get the hang of it?'],
        ['Jordi', 'Around the third week. I stopped asking for huge changes and started asking for one small thing at a time. That did the trick.'],
        ['Host', 'And did you ever hit a wall?'],
        ['Jordi', 'Oh, constantly. The worst moment was in November. I was showing it to the whole school when it crashed in front of everyone. I wanted the ground to swallow me up.'],
        ['Host', 'What did you do?'],
        ['Jordi', 'I soldiered on. I put it down to experience, went home, and stayed up until two working it out. By the morning it was up and running again.'],
        ['Host', 'Where is it now?'],
        ['Jordi', 'It’s really taken off. Every student in the school uses it, and some classes almost run themselves. But keep in mind that I’ve ended up rewriting it three times.'],
        ['Host', 'Any advice for listeners who want to try?'],
        ['Jordi', 'I’d recommend that they start with one problem, not a whole platform. And don’t second-guess yourself too much. At the end of the day, the students are very forgiving.']
      ] },
      chunks: ['I came across a video', 'I couldn’t figure out what it had done', 'that did the trick', 'I soldiered on', 'it’s really taken off'],
      items: [
        { q: 'How much coding had Jordi done before?', o: ['almost none: one old website', 'a lot, as a hobby', 'none at all'] },
        { q: 'What helped him get the hang of it?', o: ['asking for one small change at a time', 'taking a course', 'a colleague’s help'] },
        { q: '“I wanted the ground to swallow me up” means he felt…', o: ['deeply embarrassed', 'very angry', 'extremely tired'] },
        { q: 'What did he do after the crash?', o: ['He worked on it until 2 a.m. and fixed it.', 'He gave up for a month.', 'He asked a developer to fix it.'] },
        { q: 'How many times has he rewritten the platform?', o: ['three times', 'twice', 'never'] },
        { q: 'What is his main advice?', o: ['Start with one problem, not a whole platform.', 'Never show the app to the whole school.', 'Learn to code before you start.'] }
      ] },

    { id: 'movie', type: 'movie', tab: '🎬 Movie dictation', title: 'Movie dictation: stories that matter', pill: 'Real films',
      intro: 'Two real scenes. Each line plays only its part (press ▶ again as many times as you like). Type the missing words.',
      clips: [
        { youtube: 'yMpdgnUYVNo', title: 'Interstellar (2014): Cooper says goodbye to Murph', credit: 'Clip: “Interstellar”, Paramount Pictures / Warner Bros., via YouTube. Short lines for listening practice only.',
          note: 'A father and daughter. Emotional, quiet speech: listen for the weak forms.',
          items: [
            { t: [13, 25], q: 'I’ll keep it broken so ___.', a: ['you have to stay'] },
            { t: [18, 34], q: 'Once you’re a parent, you’re the ___ of your children’s future.', a: ['ghost'] },
            { t: [154, 168], q: 'You have no idea when you’re coming back. ___.', a: ['No idea at all'] },
            { t: [179, 195], q: 'I love you forever and ___.', a: ['I’m coming back', 'I am coming back'] }
          ] },
        { youtube: 'vi0Lbjs5ECI', title: 'Dead Poets Society (1989): Carpe diem', credit: 'Clip: “Dead Poets Society”, Touchstone Pictures, via YouTube. Short lines for listening practice only.',
          note: 'A teacher tells his students a story, in front of old photographs. Notice how he slows down.',
          items: [
            { t: [64, 76], q: 'Because we are ___, lads.', a: ['food for worms'] },
            { t: [83, 96], q: 'Their eyes are ___, just like you.', a: ['full of hope'] },
            { t: [122, 134], q: 'These boys are now ___ daffodils.', a: ['fertilizing', 'fertilising'] }
          ] }
      ] },

    { id: 'translate', type: 'typed', tab: 'Catalan → English', title: 'Say it like a native: Catalan → English', pill: 'Write it',
      intro: 'Translate with the expression in brackets. Contractions are fine.',
      items: [
        { q: 'Se’m va acudir la idea en un tren. (come up with)', a: ['I came up with the idea on a train', 'I came up with the idea on the train', 'I came up with the idea while I was on a train'], en: 'on a train (transport you can walk on).' },
        { q: 'Quan vaig començar, mai no havia programat. (past perfect)', a: ['When I started, I had never coded', 'When I started, I’d never coded', 'When I started, I had never programmed', 'When I started, I’d never programmed', 'When I started, I had never written any code', 'When I started, I’d never written any code'], en: 'had never + past participle.' },
        { q: 'Ho vaig esbrinar al cap d’una hora. (figure out)', a: ['I figured it out after an hour', 'I figured it out an hour later', 'I worked it out after an hour'], en: 'The pronoun goes in the middle.' },
        { q: 'Tinc moltes ganes d’ensenyar-te l’app.', a: ['I’m really looking forward to showing you the app', 'I’m looking forward to showing you the app', 'I can’t wait to show you the app', 'I really look forward to showing you the app'], en: 'look forward to + -ing.' },
        { q: 'Vaig acabar refent tot el tauler. (end up)', a: ['I ended up redoing the whole dashboard', 'I ended up rebuilding the whole dashboard', 'I ended up remaking the whole dashboard'], en: 'end up + -ing.' },
        { q: 'Et recomano que comencis de mica en mica.', a: ['I recommend that you start small', 'I recommend starting small', 'I recommend you start small', 'I’d recommend that you start small', 'I’d recommend starting small'], en: 'recommend + that / -ing, never recommend you to.' },
        { q: 'No m’estranya que falli. (no wonder)', a: ['No wonder it fails', 'No wonder it’s failing', 'It’s no wonder it fails'], en: 'No wonder… (not It’s normal that…).' },
        { q: 'Mantingues el disseny.', a: ['Keep the design', 'Keep the same design'], en: 'mantenir → keep.' },
        { q: 'Em preguntava quant de temps trigarà.', a: ['I was wondering how long it will take', 'I was wondering how long it would take'], en: 'Indirect question: statement order.' },
        { q: 'Des de llavors, ha triomfat. (take off)', a: ['Since then, it has taken off', 'Since then, it’s taken off', 'It has taken off since then', 'It’s taken off since then'], en: 'Present perfect links the story to now.' }
      ] },

    { id: 'grammar', type: 'typed', tab: 'Grammar', title: 'Phrasal verbs, verb patterns and narrative tenses', pill: 'Answer all',
      explain: [
        '<strong>Phrasal verbs + object</strong>: a noun can go before or after the particle, but a pronoun always goes in the middle: <em>figure the problem out / figure out the problem / figure it out</em> (never <s>figure out it</s>). Three-part verbs never split: <em>come up with it, put up with it, get around to it</em>.',
        '<strong>-ing after</strong> look forward to, get used to, end up, put off, keep, avoid, recommend: <em>I’m looking forward to showing you.</em> <strong>recommend / suggest + that</strong>: <em>I recommend that you start small.</em>',
        '<strong>Narrative tenses</strong>: past simple for the main events, past continuous for the background (<em>I was testing it when it crashed</em>), past perfect for what came before (<em>I’d never built an app</em>), present perfect to connect to now (<em>Since then, it’s taken off</em>).'
      ],
      items: [
        { q: 'The bug? I finally figured ___ ___. (it / out, right order)', a: ['it out'] },
        { q: 'I can’t put ___ that noise any longer. (three-part verb)', a: ['up with'] },
        { q: 'I’m looking forward to ___ (hear) from you.', a: ['hearing'] },
        { q: 'Students got used to ___ (record) themselves.', a: ['recording'] },
        { q: 'I suggest ___ you start with one learning path.', a: ['that'] },
        { q: 'When I came up with the idea, I ___ (never / build) an app.', a: ['had never built', '’d never built'] },
        { q: 'I ___ (test) it in class when it crashed.', a: ['was testing'] },
        { q: 'Since then, the app ___ (take off).', a: ['has taken off', '’s taken off'] },
        { q: 'We kept ___ (find) new bugs every day.', a: ['finding'] },
        { q: 'Don’t put ___ ___ any longer. (it / off)', a: ['it off'] }
      ] },

    { id: 'idiom', type: 'idiom', tab: '✨ Make it idiomatic', title: 'Make it idiomatic: say it like a native speaker', pill: 'Say it or write it',
      intro: "Your own sentences: clear, but built in Catalan. Rewrite each one the way a native speaker would say it: type it, or press 🎙 Say it and say it aloud (spoken English counts too). Then compare with the natural version and hear it.", items: [
        { s: "You can start from the scratch.", a: ["You can start from scratch."], why: "<strong>from scratch</strong>, no article." },
        { s: "I figured out it after an hour.", a: ["I figured it out after an hour.", "It took me an hour to figure it out."], why: "Pronoun in the middle: <strong>figure it out</strong>." },
        { s: "When I had the idea, I never built an app.", a: ["When I had the idea, I’d never built an app.", "When I had the idea, I had never built an app.", "When I had the idea, I’d never built an app before."], why: "Before then: past perfect." },
        { s: "The idea is that they can read from the last chapter they read.", a: ["The idea is that they can read on from the last chapter they read.", "The idea is that they can pick up where they left off."], why: "<strong>read on</strong>; <strong>pick up where you left off</strong>." },
        { s: "Students couldn’t leave the game once finished.", a: ["Students couldn’t leave the game once they’d finished it.", "Students couldn’t get out of the game once they’d finished.", "Students couldn’t leave the game once they’d finished."], why: "Add the subject; past perfect for the earlier action." },
        { s: "Whenever they change from one page to another they exit fullscreen.", a: ["Whenever they moved from one page to another, they dropped out of full screen.", "Whenever they went from one page to another, they dropped out of full screen."], why: "Past for past events; <strong>drop out of</strong> full screen." },
        { s: "Students say that is difficult for them to organise their minds with the web.", a: ["Students say it’s hard to organise their thoughts on the website.", "Students say it’s difficult to organise their thoughts on the website."], why: "<strong>it’s hard to</strong>; <strong>organise your thoughts</strong>." },
        { s: "The confection of LSs that are a bit complex takes me a lot.", a: ["Designing LSs that are a bit complex takes me ages.", "Putting together LSs that are a bit complex takes me ages.", "Designing LSs that are a bit complex takes me a long time."], why: "<em>confecció</em> → <strong>designing / putting together</strong>." },
        { s: "I was seeing the proper game but students where playing a hacker game.", a: ["I was seeing the right game, but the students were playing a hacker game.", "I could see the right game, but the students were playing a hacker game."], why: "<strong>the right</strong> game; past continuous for the background." },
        { s: "Didn’t we say that there were not going to be transcripts in the speaking activities?", a: ["Didn’t we agree there wouldn’t be any transcripts in the speaking activities?", "Didn’t we agree there wouldn’t be transcripts in the speaking activities?"], why: "<strong>agree</strong>; reported future: <strong>wouldn’t be any</strong>." }
      ] },
    { id: 'write', type: 'writing', tab: 'Writing', title: 'Writing: the story of English Lab',
      intro: 'This is the final product of LS4 in your learning situations doc. Your text goes to your teacher for correction: grammar and idiom only.',
      task: 'You have been invited to tell English teachers from other schools how English Lab went from an idea to something your students use every day. Write a 250–300 word article for a teachers’ newsletter in four parts: the idea, the start, the problems, where it is now. Use at least 12 expressions from the vocabulary, two past perfect verbs and two present perfect verbs, and no calque from the warm-up.',
      model: 'When I came up with the idea for English Lab, I had never written a line of code. I’d been teaching for years and I was tired of handing out worksheets that came back half done…',
      min: { daring: 250 },
      checklist: { daring: ['four parts: idea, start, problems, now', '12 expressions from the vocabulary, in the right form', 'pronoun objects in the middle of phrasal verbs (figure it out)', 'two past perfect and two present perfect verbs', 'the right pattern after look forward to, end up and recommend', 'no calque from the warm-up'] } },

    { id: 'fluency', type: 'fluency', tab: '⏱ 4 / 3 / 2 fluency', title: 'Fluency: the same story three times, each time faster', pill: 'Before Speaking', from: 'talk',
      intro: 'Choose one of the Speaking questions and answer it three times in a row: 2 minutes, then 1½, then 1 (or the classic 4 / 3 / 2). The same ideas, less time each round: your chunks get automatic. Don’t correct yourself, keep going. Then do 🎙 Speaking.' },
    { id: 'talk', type: 'talk', tab: '🎙 Speaking', title: 'Speaking: random questions about your story', pill: '4 random questions',
      intro: 'You get 4 random questions from a pool of 12. Answer like a storyteller, about 45 seconds each, without reading. Your recording goes to your teacher, who sends back the correction here.',
      task: 'Tell real stories. Move between past simple, past continuous, past perfect and present perfect, and use at least four expressions from the vocabulary.',
      pick: 4, wait: { daring: 50, native: 50, safe: 50 }, min: { daring: 110, safe: 110 },
      partner: [
        { q: 'How did you come up with the idea for English Lab?' },
        { q: 'What had you tried before, and why hadn’t it worked?' },
        { q: 'Tell me about a moment when you hit a wall with the project.' },
        { q: 'How long did it take you to get the hang of working with Claude?' },
        { q: 'What’s the closest call you’ve had with the app?' },
        { q: 'What have your students picked up on that surprised you?' },
        { q: 'If a colleague wanted to start a project like yours, what would you recommend?' },
        { q: 'Is there anything you got carried away with and later regretted?' },
        { q: 'How has your way of teaching changed since you started?' },
        { q: 'What were you doing when you realised the project had really taken off?' },
        { q: 'What are you looking forward to doing with the app next year?' },
        { q: 'At the end of the day, is it worth all the work? Why?' }
      ],
      model: 'I came up with the idea almost by accident. I’d been using worksheets for years, and I was marking a pile of them one evening when I realised that half my students had copied the answers. I’d tried everything, so I thought, why not build something myself? The first weeks were rough, but I stuck with it, and since then it’s really taken off.' },

    { id: 'talk2', type: 'talk', tab: '🔁 Speak again', title: 'Speak again: the same questions, with your mistakes fixed', pill: 'After the feedback',
      intro: 'Read the correction of your first try, then answer exactly the same questions again, using every corrected form on purpose.',
      task: 'Same questions as your first try. Before you press Start, write down the three mistakes from your feedback you most want to avoid, and the right version of each.',
      redo: 'talk', wait: { daring: 50, native: 50, safe: 50 }, min: { daring: 110, safe: 110 }, partner: null,
      model: 'Use your corrected version: the same story, the better forms.' }
  ]
};
window.LP.panels.find(p => p.id === 'talk2').partner = window.LP.panels.find(p => p.id === 'talk').partner;
/* 🗣 Shadowing: the natural versions of ✨ Make it idiomatic, one sentence at a time (data/shadow.js, made by tools/towards-nativeness/shadow.py). */
(function () { const c = (window.TN_SHADOW || {}).story; if (!c) return; const P = window.LP.panels, i = P.findIndex(p => p.id === 'write');
  P.splice(i, 0, { id: 'shadow', type: 'shadow', tab: '🗣 Shadowing', title: 'Shadowing: your sentences, said the native way', pill: 'Listen and repeat', clip: c }); })();
