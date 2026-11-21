/* Towards Nativeness · Learning Path 1 · Talking to your tech (Roger's own course, C1 → C2; docs in AGENTS.md "Towards Nativeness").
   Built from Roger's real mistakes (feedback doc sections 1, 3, 7, 8 and LS1 of the learning situations doc): prepositions with devices
   and places on a screen, still / yet, take / bring, question word order, adverb position. Only grammar and idiom, never spelling. */
window.LP = {
  key: 'tnTech', n: 1, title: 'Talking to your tech',
  panels: [
    { id: 'spotw', type: 'rewrite', tab: '🔍 Spot the mistake', title: 'Spot the mistake: your own sentences', pill: 'Warm-up',
      intro: 'Every sentence is one you really wrote to Claude. Each has one mistake (grammar or idiom only, typing slips are already fixed). Write the whole sentence correctly, then read why.',
      items: [
        { s: 'I don’t see the changes in my cellphone.', a: ['I don’t see the changes on my phone.', 'I don’t see the changes on my cellphone.', 'I can’t see the changes on my phone.', 'I don’t see the changes on my mobile.'], ex: 'Devices, screens and platforms take <strong>on</strong>: on my phone, on my iPhone, on Windows, on GitHub, on the website.' },
        { s: 'How long I’ll have to wait?', a: ['How long will I have to wait?'], ex: 'In a question the auxiliary goes before the subject: <strong>How long will I have to wait?</strong>' },
        { s: 'Home doesn’t work yet.', a: ['Home still doesn’t work.', 'Home still isn’t working.', 'Home is still not working.', 'Home still does not work.'], ex: '<strong>still</strong> = it goes on (It still doesn’t work). <strong>yet</strong> = it hasn’t started (I haven’t tried it yet).', note: 'after a fix that didn’t work' },
        { s: 'The English Lab button doesn’t bring me here.', a: ['The English Lab button doesn’t take me here.'], ex: 'A link or button <strong>takes</strong> you somewhere. <em>Bring</em> is movement towards the speaker: bring your laptop to class.' },
        { s: 'What did you exactly do?', a: ['What exactly did you do?'], ex: 'Adverbs like exactly, already, always go before the main verb: <strong>What exactly did you do?</strong>' },
        { s: 'Why 2 ESO doesn’t have a time plan?', a: ['Why doesn’t 2 ESO have a time plan?', 'Why does 2 ESO not have a time plan?', 'Why hasn’t 2 ESO got a time plan?'], ex: 'Question order: <strong>Why doesn’t 2 ESO have a time plan?</strong>' },
        { s: 'The button is on the top of the table.', a: ['The button is at the top of the table.'], ex: 'Positions on a page: <strong>at the top / at the bottom / at the top right</strong>.' },
        { s: 'Is ChatGPT better in this?', a: ['Is ChatGPT better at this?'], ex: 'good / better / bad <strong>at</strong> something: Is ChatGPT better at this?' },
        { s: 'Why is Claude failing in connecting with my project?', a: ['Why is Claude failing to connect with my project?', 'Why is Claude failing to connect to my project?'], ex: '<strong>fail to do</strong>: Why is Claude failing to connect to my project?' },
        { s: 'I asked this to ChatGPT.', a: ['I asked ChatGPT this.', 'I asked ChatGPT about this.'], ex: '<strong>ask someone something</strong>, no <em>to</em>: I asked ChatGPT this. (But explain something <strong>to</strong> someone.)' }
      ] },

    { id: 'vocab', type: 'vocab', tab: 'Vocabulary', title: 'Words and chunks for talking to your tech',
      intro: 'Explore each chunk, practise with the flashcards (English side first, then try Catalan → English), and complete the sentences.',
      receptive: 'a glitch · a lag · a workaround · a regression · to roll back · to reproduce a bug',
      core: { daring: ["on my phone / on Windows / on GitHub", "at the top / at the bottom / at the top right", 'hover over', 'scroll down to', 'take me to', "it’s still not working", "I haven’t tried it yet", "it’s taking ages / a long time", 'it keeps crashing', 'figure out', 'pin down', 'get to the bottom of', 'work around', 'iron out', 'walk someone through', "it turns out (that)", 'that did the trick', 'be better at', 'fail to do', "agree on (a thing) / with (a person)"] },
      groups: [
        { g: 'Where things are', items: [['on my phone / on Windows / on GitHub', 'al mòbil / a Windows / a GitHub', 'It works on my laptop but not on my phone.'], ['on the website / on the dashboard', 'al web / al tauler', 'The new tab isn’t showing on the dashboard.'], ['in the browser / in the app / in Safari', 'al navegador / a l’app / a Safari', 'It only happens in Safari.'], ['at the top / at the bottom / at the top right', 'a dalt / a baix / a dalt a la dreta', 'The button sits at the top right.'], ['in section 2 / in the table / in full screen', 'a la secció 2 / a la taula / a pantalla completa', 'Open the video in full screen.'], ['in class mode / at Starter level', 'en mode classe / al nivell Starter', 'Josué is at Starter level.']] },
        { g: 'Moving around a screen', items: [['hover over', 'passar el ratolí per sobre', 'Hover over the word to see its meaning.'], ['scroll down to', 'baixar fins a', 'Scroll down to the flashcards.'], ['add / apply something to', 'afegir / aplicar a', 'Apply the changes to every learning path.'], ['rename X to Y', 'canviar el nom de X a Y', 'Rename “Exàmens” to “Exams”.'], ['take me to', 'portar-me a (un enllaç)', 'This link takes me to the wrong page.'], ['divide / split into', 'dividir en', 'Split the deck into two sets.']] },
        { g: 'When it goes wrong', items: [['it’s taking ages / a long time', 'triga molt', 'It’s taking ages to load.'], ['it keeps crashing', 'no para de penjar-se', 'The app keeps crashing on my iPhone.'], ['it shuts down', 's’apaga', 'Two Chromebooks shut down in the middle of the game.'], ['it’s still not working', 'encara no funciona', 'I’ve cleared the cache, but it’s still not working.'], ['I haven’t tried it yet', 'encara no ho he provat', 'I haven’t tried it on Windows yet.'], ['a workaround', 'una solució provisional', 'Is there a workaround until it’s fixed?']] },
        { g: 'Fixing it (from your vocabulary sheet)', items: [['figure out', 'esbrinar', 'I can’t figure out why it fails.'], ['pin down', 'precisar, identificar exactament', 'Let’s pin down when it started.'], ['get to the bottom of', 'arribar al fons de', 'We need to get to the bottom of this bug.'], ['work around', 'esquivar un problema', 'We worked around it with a second button.'], ['iron out', 'polir, resoldre detalls', 'Let’s iron out the last details.'], ['walk someone through', 'explicar pas a pas', 'Could you walk me through it?'], ['it turns out (that)', 'resulta que', 'It turns out the button was hidden behind the menu.'], ['that did the trick', 'això ho ha solucionat', 'Clearing the cache did the trick.']] },
        { g: 'Verb + preposition you slip on', items: [['be better at', 'ser millor en', 'Is it better at writing?'], ['fail to do', 'no aconseguir fer', 'It failed to load the page.'], ['agree on (a thing) / with (a person)', 'acordar / estar d’acord amb', 'Do you remember the prompt we agreed on?'], ['explain something to someone', 'explicar a algú', 'Explain it to me again.'], ['ask someone something', 'preguntar a algú', 'I asked Claude the same question.'], ['have access to', 'tenir accés a', 'Do you have access to the Drive?']] }
      ],
      practice: [
        { q: 'The favicon isn’t showing ___ my iPhone’s home screen.', a: ['on'] },
        { q: 'The menu button sits ___ the top right of the page.', a: ['at'] },
        { q: 'I’ve restarted the app, but it ___ doesn’t work.', a: ['still'] },
        { q: 'Have you tested it on Windows ___?', a: ['yet'] },
        { q: 'Clicking the logo should ___ you to the home page.', a: ['take'] },
        { q: 'Could you walk me ___ the new settings?', a: ['through'] },
        { q: 'It ___ out that the file had the wrong name.', a: ['turns', 'turned'] },
        { q: 'We spent all morning trying to get to the ___ of the problem.', a: ['bottom'] },
        { q: 'Is Claude better ___ coding than ChatGPT?', a: ['at'] },
        { q: 'Hover ___ any word to see the Catalan.', a: ['over'] }
      ] },

    { id: 'read', type: 'mc', tab: 'Reading', title: 'Reading: Where do websites live?', pill: 'C1',
      intro: 'A short magazine article. Read it once for the argument, then answer. Notice every preposition in bold: they are the ones you slip on.',
      media: { text: '<p><strong>Where do websites live?</strong></p>' +
        '<p>Ask a Catalan speaker where they saw a typo and you will probably hear <em>a la web</em>. Ask an English speaker and they will say they saw it <strong>on</strong> the website, <strong>on</strong> their phone, or <strong>on</strong> page three. For a learner, this looks like an arbitrary rule. It turns out it is anything but.</p>' +
        '<p>English quietly treats a screen as a surface. Things appear <strong>on</strong> it the way a poster appears <strong>on</strong> a wall: you see the message <strong>on</strong> your laptop, you post a photo <strong>on</strong> Instagram, and your code lives <strong>on</strong> GitHub. Software, on the other hand, is treated as a container. You open a document <strong>in</strong> Word, you find a setting <strong>in</strong> the menu and you test a page <strong>in</strong> Safari. The logic is spatial, not grammatical: if you can imagine yourself looking at something, it is <em>on</em>; if you can imagine yourself inside something, it is <em>in</em>.</p>' +
        '<p>Then there is <em>at</em>, the preposition of points. A button is not <strong>on</strong> the top of a page; it sits <strong>at</strong> the top, <strong>at</strong> the bottom or <strong>at</strong> the top right, because English thinks of those places as single spots rather than surfaces. The same idea explains why you are <strong>at</strong> a level, not <em>in</em> one: a level is a point on a scale.</p>' +
        '<p>None of this is taught as a rule in most coursebooks, which is why even very advanced speakers keep tripping over it. They have the knowledge; what they lack is the habit. The fix, linguists say, is not to memorise lists but to notice chunks. Instead of learning <em>on</em>, you learn <em>on my phone</em>, <em>at the top right</em>, <em>in full screen</em>, as if each were a single word. After a few hundred encounters, the chunk comes out by itself, and the Catalan version simply stops knocking on the door.</p>' +
        '<p>So the next time a bug report starts with “It doesn’t work in my iPhone”, don’t blame the grammar. Blame the chunk you haven’t met often enough yet.</p>' },
      items: [
        { q: 'According to the article, why do we say “on the website”?', o: ['English treats a screen as a surface you look at.', 'Websites are older than apps.', 'It is an arbitrary rule you just have to memorise.'] },
        { q: 'Which pair follows the “container” logic?', o: ['in Word, in the menu', 'on GitHub, on Instagram', 'at the top, at the bottom'] },
        { q: 'Why is a button “at the top” rather than “on the top”?', o: ['English sees that place as a single point.', 'Because the top is a surface.', 'Because “on the top” is American English.'] },
        { q: '“It turns out it is anything but” means the rule is…', o: ['not arbitrary at all', 'completely arbitrary', 'only partly arbitrary'] },
        { q: 'What do advanced speakers lack, according to the writer?', o: ['the habit, not the knowledge', 'the knowledge of the rule', 'enough grammar books'] },
        { q: 'What does “the Catalan version simply stops knocking on the door” suggest?', o: ['You stop being tempted to translate.', 'You forget your Catalan.', 'Catalan grammar becomes easier.'] }
      ] },

    { id: 'listen', type: 'mc', tab: 'Listening', title: 'Listening: It’s still not working', pill: 'C1 · two voices',
      intro: 'A teacher calls a developer friend about a bug. Listen once for the problem, then again for the details. Then do the micro-dictation.',
      media: { audio: 'audio/lp1-still-not-working.mp3', title: 'It’s still not working', script: [
        ['Anna', 'Hi Tom, sorry to bother you. Have you got a minute?'],
        ['Tom', 'Sure. Is it the quiz page again?'],
        ['Anna', 'It is. I followed your instructions, I cleared the cache and everything, but it’s still not working.'],
        ['Tom', 'Okay. Where exactly does it break? On your laptop, or on the students’ Chromebooks?'],
        ['Anna', 'Only on the Chromebooks. On my laptop it’s fine. When they press the green button at the top right, nothing happens. It’s supposed to take them to the next question.'],
        ['Tom', 'And it doesn’t throw an error, does it?'],
        ['Anna', 'Not that I can see. The page just sits there. And it’s taking ages to load in the first place.'],
        ['Tom', 'Right. Have you tried it in a different browser yet?'],
        ['Anna', 'Not yet. They only have Chrome.'],
        ['Tom', 'Fair enough. Let’s try to pin it down. Did it work last week?'],
        ['Anna', 'Yes, it worked perfectly until Monday. That’s when I added the new timer to every question.'],
        ['Tom', 'Ah. Then I think we’ve got to the bottom of it. The timer probably runs too often, and the older Chromebooks can’t keep up. That would explain why it only fails on theirs.'],
        ['Anna', 'So what do I do? I can’t buy new computers.'],
        ['Tom', 'No, no. For now, there’s a simple workaround: switch the timer off for that group. Then I’ll iron out the code this weekend and walk you through the fix on Monday.'],
        ['Anna', 'You’re a lifesaver. I owe you a coffee.'],
        ['Tom', 'You owe me several, but who’s counting?']
      ] },
      chunks: ['it’s still not working', 'at the top right', 'it’s taking ages to load', 'let’s try to pin it down', 'walk you through the fix'],
      items: [
        { q: 'Where does the problem happen?', o: ['only on the students’ Chromebooks', 'only on Anna’s laptop', 'on every device'] },
        { q: 'What should the green button do?', o: ['take the students to the next question', 'start the timer', 'show the answers'] },
        { q: 'Why hasn’t Anna tried another browser?', o: ['The students only have Chrome.', 'She forgot.', 'Tom told her not to.'] },
        { q: 'What changed on Monday?', o: ['Anna added a timer to every question.', 'The school bought new Chromebooks.', 'Tom changed the code.'] },
        { q: 'What is the workaround?', o: ['switching the timer off for that group', 'using Anna’s laptop', 'reloading the page'] },
        { q: 'How does Tom sound at the end?', o: ['amused and friendly', 'annoyed', 'worried'] }
      ] },

    { id: 'movie', type: 'movie', tab: '🎬 Movie dictation', title: 'Movie dictation: The Social Network', pill: 'Real film',
      intro: 'A real scene at native speed. Each line plays only its part of the scene (press ▶ again as many times as you like). Type the missing words. Tip: questions and word order, exactly your LP topic.',
      clips: [
        { youtube: 'XuzkTLhAiBE', title: 'The Social Network (2010): the opening scene', credit: 'Clip: “The Social Network”, Columbia Pictures, via YouTube. Lines from the scene for listening practice only.',
          note: 'Mark and Erica in a bar. He talks very fast and jumps between ideas: listen for the chunk, not every word.',
          items: [
            { t: [14, 27], q: 'Did you know there are more people with genius IQs living in China than there are people ___ living in the United States?', a: ['of any kind'] },
            { t: [60, 72], q: 'Maybe it’s just sometimes you say ___ at once…', a: ['two things'] },
            { t: [294, 312], q: 'It’ll be because ___.', a: ['you’re an asshole', 'you are an asshole'] }
          ] }
      ] },

    { id: 'translate', type: 'typed', tab: 'Catalan → English', title: 'Say it like a native: Catalan → English', pill: 'Write it',
      intro: 'Translate each sentence the way a native speaker would write it to a colleague. Contractions are fine. After two wrong tries you’ll see a model.',
      items: [
        { q: 'Encara no funciona.', a: ['It’s still not working', 'It still doesn’t work', 'It still isn’t working'], en: 'still + negative: It’s still not working.' },
        { q: 'Encara no ho he provat al mòbil.', a: ['I haven’t tried it on my phone yet', 'I haven’t tested it on my phone yet', 'I have not tried it on my phone yet'], en: 'yet at the end, present perfect, on my phone.' },
        { q: 'Quant de temps hauré d’esperar?', a: ['How long will I have to wait', 'How long am I going to have to wait'], en: 'Auxiliary before the subject.' },
        { q: 'Aquest botó no em porta a la pàgina correcta.', a: ['This button doesn’t take me to the right page', 'This button doesn’t take me to the correct page'], en: 'take me to.' },
        { q: 'Què has fet exactament?', a: ['What exactly did you do', 'What exactly have you done'], en: 'exactly before the main verb.' },
        { q: 'El menú és a dalt a la dreta.', a: ['The menu is at the top right', 'The menu’s at the top right'], en: 'at the top right.' },
        { q: 'Triga moltíssim a carregar.', a: ['It’s taking ages to load', 'It takes ages to load', 'It’s taking a long time to load', 'It takes a long time to load'], en: 'take ages / a long time to + verb.' },
        { q: 'Resulta que el fitxer tenia un altre nom.', a: ['It turns out the file had a different name', 'It turns out that the file had a different name', 'It turned out the file had a different name', 'It turned out that the file had a different name'], en: 'It turns out (that)…' },
        { q: 'Funciona, oi?', a: ['It works, doesn’t it', 'It’s working, isn’t it'], en: 'Tag questions repeat the auxiliary.' },
        { q: 'Per què no té pla de temps 2n d’ESO?', a: ['Why doesn’t 2 ESO have a time plan', 'Why doesn’t 2nd ESO have a time plan'], en: 'Questions need do/does: Why doesn’t … have …?' }
      ] },

    { id: 'grammar', type: 'typed', tab: 'Grammar', title: 'Questions, indirect questions and adverb position', pill: 'Answer all',
      explain: [
        '<strong>Direct questions</strong>: auxiliary + subject + verb. <em>How long will I have to wait? Why doesn’t it load? Does this project have too much info?</em>',
        '<strong>Indirect questions</strong> keep statement order and lose do/does: <em>I need to know what the best option is. Do you know why it doesn’t load?</em> (not <s>why doesn’t it load</s>)',
        '<strong>Adverbs</strong> (already, always, only, exactly, just, still) go before the main verb but after <em>be</em>: <em>You already have their emails. Students should always see it. It’s still slow.</em>',
        '<strong>Tags</strong> repeat the auxiliary with the opposite polarity: <em>We can’t export it, can we? It works, doesn’t it?</em>'
      ],
      items: [
        { q: 'Rewrite as a question: (why / it / not / load / on Safari)', a: ['Why doesn’t it load on Safari', 'Why isn’t it loading on Safari'], en: 'Why doesn’t it load on Safari?' },
        { q: 'Make it indirect: “Where does the info come from?” → I don’t want students to see where ___.', a: ['the info comes from', 'the information comes from'] },
        { q: 'Make it indirect: “What is the best option?” → I need to know ___.', a: ['what the best option is'] },
        { q: 'Put “already” in: Since you have their emails, send it now. → Since you ___ their emails…', a: ['already have'] },
        { q: 'Put “always” in: Students should see their answers. → Students should ___ their answers.', a: ['always see'] },
        { q: 'Tag: We can’t download it, ___?', a: ['can we'] },
        { q: 'Tag: The students have finished, ___?', a: ['haven’t they', 'have not they'] },
        { q: 'Question: (you / put / them there yourself?)', a: ['Did you put them there yourself', 'Have you put them there yourself'] },
        { q: 'Question: (what / the prompt / should / be?)', a: ['What should the prompt be'] },
        { q: 'Indirect: “How long will it take?” → I was wondering ___.', a: ['how long it will take', 'how long it would take'] }
      ] },

    { id: 'idiom', type: 'idiom', tab: '✨ Make it idiomatic', title: 'Make it idiomatic: say it like a native speaker', pill: 'Say it or write it',
      intro: "Your own sentences: clear, but built in Catalan. Rewrite each one the way a native speaker would say it: type it, or press 🎙 Say it and say it aloud (spoken English counts too). Then compare with the natural version and hear it.", items: [
        { s: "The favicon is not shown in my smartphone home screen.", a: ["The favicon isn’t showing on my phone’s home screen.", "The favicon doesn’t show up on my phone’s home screen.", "The favicon isn’t showing up on my phone’s home screen."], why: "<strong>on</strong> a screen; icons <strong>show up</strong>." },
        { s: "Check out if there’s a problem in GitHub.", a: ["Check whether there’s a problem on GitHub.", "Check if there’s a problem on GitHub.", "See if there’s a problem on GitHub."], why: "<em>check out</em> = have a look at something fun; <strong>check whether</strong>; <strong>on</strong> GitHub." },
        { s: "Is ChatGPT better in this?", a: ["Is ChatGPT better at this?"], why: "good / better <strong>at</strong> something." },
        { s: "How long I’ll have to wait?", a: ["How long will I have to wait?", "How long do I have to wait?"], why: "Auxiliary before the subject." },
        { s: "So for my website it’s better Opus?", a: ["So is Opus better for my website?", "So Opus is better for my website?"], why: "Subject first: <strong>Opus is better</strong>." },
        { s: "But cannot you do it yourself?", a: ["But can’t you do it yourself?", "But couldn’t you do it yourself?"], why: "Negative questions use the short form: <strong>can’t you</strong>." },
        { s: "It’s taking a lot.", a: ["It’s taking ages.", "It’s taking a long time.", "It’s taking forever."], why: "<strong>take ages / forever / a long time</strong>." },
        { s: "I’m using almost the 40% of my weekly limit.", a: ["I’ve already used almost 40% of my weekly limit.", "I’ve used almost 40% of my weekly limit."], why: "No <em>the</em> with %; present perfect for “so far”." },
        { s: "Some sections can be dragged laterally and show weird displays.", a: ["Some sections scroll sideways and the layout looks weird.", "Some sections move sideways and look weird.", "Some sections scroll sideways and look weird."], why: "<strong>sideways</strong>; the <strong>layout</strong> looks weird." },
        { s: "What did you exactly do?", a: ["What exactly did you do?"], why: "<em>exactly</em> right after the question word." }
      ] },
    { id: 'write', type: 'writing', tab: 'Writing', title: 'Writing: a bug report to a developer',
      intro: 'Your text goes to your teacher (you!) for correction: grammar and idiom only.',
      task: 'Write a bug report (150–200 words) to a developer about a real problem in one of your apps (English Lab, LumoUp…). Say where it happens (devices, browsers, places on the screen), what you expected, what actually happens, what you’ve tried and what you haven’t tried yet, and end with two questions.',
      model: 'Hi Tom, I’m afraid the quiz page is still playing up. It only happens on the students’ Chromebooks, in Chrome; on my laptop it works fine. When they press the green button at the top right, it should take them to the next question, but nothing happens. It turns out it started on Monday, right after I added a timer to every question. I’ve cleared the cache and restarted the app, but I haven’t tried switching the timer off yet. Could you walk me through how to roll it back? And do you know why it only fails on older devices?',
      min: { daring: 150 },
      checklist: { daring: ['on with devices and platforms, at with places on the screen', 'still and yet in the right place', 'take (not bring) for links and buttons', 'two questions with the auxiliary before the subject', 'at least one indirect question', 'three phrasal verbs from the vocabulary'] } },

    { id: 'fluency', type: 'fluency', tab: '⏱ 4 / 3 / 2 fluency', title: 'Fluency: the same story three times, each time faster', pill: 'Before Speaking', from: 'talk',
      intro: 'Choose one of the Speaking questions and answer it three times in a row: 2 minutes, then 1½, then 1 (or the classic 4 / 3 / 2). The same ideas, less time each round: your chunks get automatic. Don’t correct yourself, keep going. Then do 🎙 Speaking.' },
    { id: 'talk', type: 'talk', tab: '🎙 Speaking', title: 'Speaking: random questions about your tech', pill: '4 random questions',
      intro: 'You get 4 random questions from a pool of 12. The computer asks them one by one while you record. Answer fully, like in a conversation (about 40 seconds each). Your recording goes to your teacher, who sends back the correction here.',
      task: 'Answer naturally: give an example, a reason and a detail for each question. Try to use on / at / in correctly, still / yet, and at least two expressions from the vocabulary (figure out, it turns out, that did the trick…).',
      pick: 4, wait: { daring: 45, native: 45, safe: 45 }, min: { daring: 90, safe: 90 },
      partner: [
        { q: 'Tell me about the last bug you had in one of your apps. How did you figure it out?' },
        { q: 'Which devices do you use every day, and what do you do on each of them?' },
        { q: 'Is there anything on your phone that still doesn’t work the way you want?' },
        { q: 'What’s something you haven’t tried yet with Claude, but would like to?' },
        { q: 'Describe your English Lab dashboard. What’s at the top, and what’s at the bottom?' },
        { q: 'When something takes ages to load, what do you usually do?' },
        { q: 'Do you think Claude is better at coding or at writing? Why?' },
        { q: 'Tell me about a workaround you came up with that did the trick.' },
        { q: 'How would you explain to a colleague how to share a file on Google Drive?' },
        { q: 'What do your students find most confusing on the website?' },
        { q: 'Have you ever had a close call with your data? What happened?' },
        { q: 'If you could add one feature to English Lab tomorrow, what would it be, and where would it go on the screen?' }
      ],
      model: 'The last bug was a strange one. The quiz worked perfectly on my laptop, but on the students’ Chromebooks the green button at the top right just didn’t respond. It took me a while to pin it down, but it turns out the timer I’d added was running too often, and the older machines couldn’t keep up. In the end, switching it off for that group did the trick.' },

    { id: 'talk2', type: 'talk', tab: '🔁 Speak again', title: 'Speak again: the same questions, with your mistakes fixed', pill: 'After the feedback',
      intro: 'Read the correction of your first try, then answer exactly the same questions again. This time, use every corrected form on purpose. Your teacher compares both recordings.',
      task: 'Same questions as your first try. Before you press Start, write down the three mistakes from your feedback you most want to avoid, and the right version of each.',
      redo: 'talk', wait: { daring: 45, native: 45, safe: 45 }, min: { daring: 90, safe: 90 },
      partner: null,
      model: 'Use your corrected version: the same ideas, the better forms.' }
  ]
};
/* Speak again asks the questions the first try drew: same pool. */
window.LP.panels.find(p => p.id === 'talk2').partner = window.LP.panels.find(p => p.id === 'talk').partner;
/* 🗣 Shadowing: the natural versions of ✨ Make it idiomatic, one sentence at a time (data/shadow.js, made by tools/towards-nativeness/shadow.py). */
(function () { const c = (window.TN_SHADOW || {}).tech; if (!c) return; const P = window.LP.panels, i = P.findIndex(p => p.id === 'write');
  P.splice(i, 0, { id: 'shadow', type: 'shadow', tab: '🗣 Shadowing', title: 'Shadowing: your sentences, said the native way', pill: 'Listen and repeat', clip: c }); })();
