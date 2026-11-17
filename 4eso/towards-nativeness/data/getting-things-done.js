/* Towards Nativeness · Learning Path 2 · Getting things done (LS2 of the learning situations doc): do / make, want / ask / allow +
   someone + to, let + verb, present continuous / perfect for what you are doing now, one subject per verb (no dummy it, no missing it),
   did + base form. All mistakes are Roger's own (feedback doc). */
window.LP = {
  key: 'tnDone', n: 2, title: 'Getting things done',
  panels: [
    { id: 'spot', type: 'mc', tab: '🔍 Spot the mistake', title: 'Spot the mistake: your own instructions', pill: 'Warm-up',
      intro: 'Your real messages, typing slips already fixed. One mistake each. Choose the part that is wrong.',
      items: [
        { q: '“You didn’t do the changes I asked for.”', o: ['do the changes', 'You didn’t', 'I asked for'], ex: '<strong>make</strong> changes, a decision, a mistake, an exam, a rubric. <strong>do</strong> a test, an exercise, a good job.' },
        { q: '“I want students receive a notification.”', o: ['want students receive', 'a notification', 'I'], ex: '<strong>want + someone + to</strong>: I want students to receive a notification.' },
        { q: '“I attach the grid with the criteria.”', o: ['I attach', 'the grid', 'with the criteria'], ex: 'For what you are doing as you write: <strong>I’m attaching / I’ve attached</strong>. <em>I attach</em> sounds like a habit.' },
        { q: '“Maybe is better to leave it.”', o: ['Maybe is better', 'to leave it', 'Maybe'], ex: 'Every verb needs a subject: <strong>Maybe it’s better to leave it.</strong>' },
        { q: '“In general the audio it’s not working well.”', o: ['the audio it’s', 'In general', 'well'], ex: 'One subject only: <strong>the audio isn’t working</strong>.' },
        { q: '“Here it happens the same.”', o: ['Here it happens the same', 'Here', 'the same'], ex: 'No dummy <em>it</em> before the verb: <strong>The same thing happens here.</strong>' },
        { q: '“Did you fixed that?”', o: ['Did you fixed', 'that', 'Did'], ex: 'After did, the base form: <strong>Did you fix that?</strong>' },
        { q: '“Don’t allow students press answers super fast.”', o: ['allow students press', 'Don’t', 'super fast'], ex: '<strong>allow someone to</strong> / <strong>let someone + verb</strong>: Don’t let students press… / Don’t allow students to press…' },
        { q: '“I don’t want the spellchecker underline their mistakes.”', o: ['want the spellchecker underline', 'their mistakes', 'I don’t'], ex: '<strong>want + object + to</strong>: I don’t want the spellchecker to underline their mistakes.' },
        { q: '“Make possible to select the PDF.”', o: ['Make possible to', 'select', 'the PDF'], ex: '<strong>make it possible to</strong>: Make it possible to select the PDF.' }
      ] },

    { id: 'vocab', type: 'vocab', tab: 'Vocabulary', title: 'Getting things done: collocations and polite requests',
      intro: 'Learn the collocations as blocks. The flashcards test them both ways.',
      receptive: 'a deliverable · a deadline · to sign off on · to prioritise · a to-do list',
      core: { daring: ["make changes (to)", 'make a decision', 'make a mistake', "do a test / an exercise", 'do a good job', 'I’m attaching', 'I’ve just uploaded', "I want you to + verb", 'I’d like to', 'I was wondering if', "Could you walk me through…?", "get around to + -ing", 'deal with', 'get it over with', 'stick with it', 'not sold on', "let someone + verb", "allow someone to + verb", "put something off", "chase someone up"] },
      groups: [
        { g: 'make (create or change something)', items: [['make changes (to)', 'fer canvis (a)', 'Don’t make any changes without asking me.'], ['make a decision', 'prendre una decisió', 'We need to make a decision by Friday.'], ['make a mistake', 'equivocar-se', 'Everyone makes mistakes.'], ['make an exam / a rubric / a guide', 'fer un examen / una rúbrica / una guia', 'Could you make a rubric for this writing?'], ['make a sound', 'fer un so', 'The app still makes a whistle sound.'], ['make it possible to', 'fer possible', 'Make it possible to download the PDF.']] },
        { g: 'do (tasks and activities)', items: [['do a test / an exercise', 'fer una prova / un exercici', 'Do a quick test before you merge.'], ['do an activity', 'fer una activitat', 'We’ll do the listening activity together.'], ['do a good job', 'fer bona feina', 'You did a great job with the dashboard.'], ['do the dishes / the shopping', 'rentar els plats / fer la compra', 'I’ll do the shopping later.']] },
        { g: 'Asking people to do things', items: [['I want you to + verb', 'vull que facis', 'I want you to check every page.'], ['ask someone to + verb', 'demanar a algú que', 'Ask every user to connect.'], ['allow someone to + verb', 'permetre a algú', 'It should allow you to mark it as done.'], ['let someone + verb', 'deixar que algú', 'Let students see their marks.'], ['I’d like to', 'm’agradaria', 'I’d like to check the web version.'], ['I was wondering if', 'em preguntava si', 'I was wondering if you could help me.'], ['Could you walk me through…?', 'em podries explicar pas a pas…?', 'Could you walk me through the setup?']] },
        { g: 'What you’re doing right now', items: [['I’m attaching', 't’adjunto', 'I’m attaching the grid with the criteria.'], ['I’m sending you', 't’envio', 'Here’s the document I’m sending you.'], ['I’ve just uploaded', 'acabo de pujar', 'I’ve just uploaded the photos.'], ['I’ve attached', 'he adjuntat', 'I’ve attached three screenshots.']] },
        { g: 'Keeping going (from your vocabulary sheet)', items: [['get around to + -ing', 'trobar el moment de', 'I never got around to fixing it.'], ['put something off', 'ajornar', 'Don’t put it off until June.'], ['chase someone up', 'reclamar, fer seguiment', 'I’ll chase them up tomorrow.'], ['deal with', 'gestionar', 'I’ll deal with the emails later.'], ['get it over with', 'treure-s’ho del damunt', 'Let’s just get it over with.'], ['stick with it', 'perseverar', 'It’s hard at first, but stick with it.'], ['not sold on', 'no acabar d’estar convençut de', 'I’m not sold on the new design.'], ['a daunting task', 'una tasca aclaparadora', 'Marking 100 exams is a daunting task.']] }
      ],
      practice: [
        { q: 'Please don’t ___ any changes until I’ve checked it.', a: ['make'] },
        { q: 'Could you ___ a quick test before you merge?', a: ['do'] },
        { q: 'I want the rubric ___ in the Drive too.', a: ['to be'] },
        { q: 'Let students ___ their own marks.', a: ['see'] },
        { q: 'It should allow you ___ it as done.', a: ['to mark'] },
        { q: 'I’m ___ the document you asked for.', a: ['attaching', 'sending'] },
        { q: 'I’ll ___ them up if they don’t answer by Friday.', a: ['chase'] },
        { q: 'I keep putting it ___. I really need to get it over with.', a: ['off'] },
        { q: 'I’m not ___ on the new colours, to be honest.', a: ['sold'] },
        { q: 'I finally got around to ___ the old learning paths.', a: ['fixing', 'checking', 'updating', 'deleting'] }
      ] },

    { id: 'read', type: 'mc', tab: 'Reading', title: 'Reading: The polite machine', pill: 'C1',
      intro: 'An opinion column about how we give instructions to AI. Read for the writer’s attitude.',
      media: { text: '<p><strong>The polite machine</strong></p>' +
        '<p>I used to think that typing “please” to a chatbot was a waste of keystrokes. After all, the machine doesn’t have feelings to hurt, and it will do the job whether I ask nicely or bark an order. Then I spent a term watching my colleagues work with AI assistants, and I changed my mind.</p>' +
        '<p>The teachers who got the best results were not the ones who knew the most about technology. They were the ones who wrote instructions the way they would brief a new colleague: <em>I’d like you to check every page, and I want the changes to be small. Please don’t make any decisions about the design without asking me first.</em> Compare that with the typical message typed in a hurry between two classes: <em>do the changes, maybe is better</em>. The machine copes with both, but the first one leaves far less room for guesswork.</p>' +
        '<p>Part of the difference is grammar. <em>I want you to…</em>, <em>Could you…?</em> and <em>Let them choose</em> are not just polite; they are precise. They say who does what. A sentence with no subject forces the reader, human or not, to fill the gap, and the gap is exactly where misunderstandings live.</p>' +
        '<p>There is also a habit worth picking up from good project managers: saying what you are doing as you do it. <em>I’m attaching the grid. I’ve just uploaded the photos.</em> It sounds trivial, but it tells the reader where to look and what has already happened, which saves a round of “Which file?” messages.</p>' +
        '<p>None of this means we should write essays to our software. The best instructions I saw were short. But they were complete: every verb had a subject, every request had a person and an action, and every change had a reason. It turns out that the skills we spend years teaching our students, clarity, courtesy and a sense of the reader, are exactly the ones the machines reward. I am not sold on the idea that AI will make us lazier writers. If anything, it might make us better ones.</p>' },
      items: [
        { q: 'What made the writer change their mind about writing “please”?', o: ['seeing which colleagues got the best results', 'reading a study about AI', 'a chatbot that refused rude orders'] },
        { q: 'Why does the writer say “I want you to…” is precise?', o: ['It says who does what.', 'It is more formal.', 'Machines understand it faster.'] },
        { q: 'According to the text, where do misunderstandings “live”?', o: ['in the gap left by a missing subject', 'in long sentences', 'in technical words'] },
        { q: 'What is the point of “I’m attaching the grid”?', o: ['It tells the reader what has happened and where to look.', 'It is more polite than “I attach”.', 'It makes the message longer.'] },
        { q: '“I am not sold on the idea” means the writer…', o: ['isn’t convinced', 'disagrees strongly', 'is selling a product'] },
        { q: 'What is the writer’s overall attitude to AI and writing?', o: ['cautiously optimistic', 'openly hostile', 'indifferent'] }
      ] },

    { id: 'listen', type: 'mc', tab: 'Listening', title: 'Listening: The Monday meeting', pill: 'C1 · two voices',
      intro: 'A head of department and a teacher share out the jobs for the week. Listen for who does what.',
      media: { audio: 'audio/lp2-monday-meeting.mp3', title: 'The Monday meeting', script: [
        ['Claire', 'Right, let’s get this over with, shall we? We’ve got a lot to get through this week.'],
        ['Marc', 'Go ahead. I’ve got my list here.'],
        ['Claire', 'First, the exams. Have you made the second version yet?'],
        ['Marc', 'Not yet, I’m afraid. I’ve been putting it off, to be honest. I’ll make it tonight and send it to you tomorrow morning.'],
        ['Claire', 'Perfect. And I’d like you to do a quick test with the answer key before you send it. Last time there were two mistakes in it.'],
        ['Marc', 'Fair point. I’ll do that.'],
        ['Claire', 'Second thing. The head wants every department to make changes to the reports. She wants them to be shorter and to include one comment per student.'],
        ['Marc', 'One comment per student? For a hundred and twenty students? That’s a daunting task.'],
        ['Claire', 'I know, but she won’t let us skip it. What I was wondering is if we could share it out. You deal with fourth, I’ll deal with second.'],
        ['Marc', 'That sounds fair. And the parents who haven’t replied about the trip?'],
        ['Claire', 'I’ll chase them up. I’m sending the reminder as we speak, actually. There, done.'],
        ['Marc', 'Great. Anything else?'],
        ['Claire', 'Just one. The new website. I’m not sold on the colours. Could you ask the students to vote on two options? Let them choose, it’s their site.'],
        ['Marc', 'Good idea. I’ll make a quick poll.'],
        ['Claire', 'Lovely. Right, I think that’s everything. Thanks, Marc, you’re doing a great job.']
      ] },
      chunks: ['let’s get this over with', 'I’ve been putting it off', 'do a quick test with the answer key', 'I’ll chase them up', 'let them choose'],
      items: [
        { q: 'Why hasn’t Marc made the second exam yet?', o: ['He’s been putting it off.', 'He was ill.', 'Claire told him to wait.'] },
        { q: 'What does Claire ask Marc to do before he sends the exam?', o: ['test it with the answer key', 'show it to the head', 'make it shorter'] },
        { q: 'What does the head want the reports to be like?', o: ['shorter, with one comment per student', 'longer and more detailed', 'the same as last year'] },
        { q: 'How do they solve the problem of the reports?', o: ['They share them out by year group.', 'Claire does them all.', 'They ask the head for more time.'] },
        { q: 'What is Claire doing while she talks about the parents?', o: ['sending the reminder', 'writing the poll', 'making the exam'] },
        { q: 'How will they choose the website colours?', o: ['The students will vote on two options.', 'Claire will decide.', 'The head will choose.'] }
      ] },

    { id: 'movie', type: 'movie', tab: '🎬 Movie dictation', title: 'Movie dictation: going for it', pill: 'Real films',
      intro: 'Two real scenes about getting things done. Each line plays only its part (press ▶ again as many times as you like). Type the missing words.',
      clips: [
        { youtube: 'oYs2wMuxkiQ', title: 'The Pursuit of Happyness (2006): “Don’t ever let somebody tell you…”', credit: 'Clip: “The Pursuit of Happyness”, Columbia Pictures, via YouTube. Short lines for listening practice only.',
          note: 'A father and his son on a basketball court. Listen for <em>let somebody + verb</em>, the structure you’re practising.',
          items: [
            { t: [0, 9], q: 'You’ll probably be about ___ as I was.', a: ['as good'] },
            { t: [25, 38], q: 'Don’t ever let somebody ___ you can’t do something.', a: ['tell you'] },
            { t: [73, 86], q: 'You want something, ___.', a: ['go get it'] }
          ] },
        { youtube: 'wpO7UM7RNrA', title: 'The King’s Speech (2010): the wartime address', credit: 'Clip: “The King’s Speech”, The Weinstein Company, via YouTube. Short lines for listening practice only.',
          note: 'The King and his speech therapist get a hard job done. British English, and very slow at times: that is part of the scene.',
          items: [
            { t: [216, 232], q: 'Forget everything else and ___.', a: ['just say it to me'] },
            { t: [408, 422], q: 'The task will be ___.', a: ['hard'] },
            { t: [572, 588], q: 'But had to ___, so they knew it was me.', a: ['throw in a few'] }
          ] }
      ] },

    { id: 'translate', type: 'typed', tab: 'Catalan → English', title: 'Say it like a native: Catalan → English', pill: 'Write it',
      intro: 'Translate as you would write it to a colleague. Contractions are fine.',
      items: [
        { q: 'Vull que la rúbrica també sigui al Drive.', a: ['I want the rubric to be in the Drive too', 'I want the rubric to be on the Drive too', 'I want the rubric in the Drive too', 'I’d like the rubric to be in the Drive too'], en: 'want + object + to be; too at the end.' },
        { q: 'T’adjunto el document.', a: ['I’m attaching the document', 'I’ve attached the document', 'Please find the document attached', 'I’m sending you the document'], en: 'Present continuous or perfect for now.' },
        { q: 'No facis canvis sense el meu permís.', a: ['Don’t make changes without my permission', 'Don’t make any changes without my permission', 'Don’t make any changes without asking me'], en: 'make changes.' },
        { q: 'Aquí passa el mateix.', a: ['The same thing happens here', 'The same happens here', 'It’s the same here'], en: 'No dummy it.' },
        { q: 'Potser és millor deixar-ho.', a: ['Maybe it’s better to leave it', 'Maybe it would be better to leave it', 'Perhaps it’s better to leave it', 'It might be better to leave it'], en: 'Add the subject it.' },
        { q: 'Deixa que els alumnes triïn.', a: ['Let the students choose', 'Let students choose', 'Let them choose'], en: 'let + verb, no to.' },
        { q: 'Ho has arreglat?', a: ['Did you fix it', 'Have you fixed it'], en: 'did + base form, or have + past participle.' },
        { q: 'M’agradaria veure la versió web.', a: ['I’d like to see the web version', 'I would like to see the web version', 'I’d like to check the web version', 'I’d like to see the website version'], en: 'I’d like to (not I’ll like to).' },
        { q: 'Ho he anat ajornant.', a: ['I’ve been putting it off', 'I have been putting it off', 'I keep putting it off', 'I’ve kept putting it off'], en: 'put it off: the pronoun goes in the middle.' },
        { q: 'Fes que sigui possible descarregar el PDF.', a: ['Make it possible to download the PDF', 'Make it possible to download the pdf'], en: 'make it possible to.' }
      ] },

    { id: 'grammar', type: 'typed', tab: 'Grammar', title: 'Verb patterns and subjects', pill: 'Answer all',
      explain: [
        '<strong>want / ask / allow / encourage / need + someone + to</strong>: <em>I want you to check it. It should allow you to mark it.</em> Never <s>I want that you</s>, <s>allow to mark</s>.',
        '<strong>let / make + someone + verb</strong> (no to): <em>Let them choose. Make them think.</em>',
        '<strong>Now</strong>: <em>I’m attaching, I’m sending, I’ve just uploaded</em>. <strong>yet / already</strong> take the present perfect: <em>They haven’t done it yet.</em>',
        '<strong>One subject per verb</strong>: <em>It’s online now. There’s nothing at the top. The audio isn’t working</em> (not <s>the audio it’s</s>). After <strong>did</strong>: the base form.'
      ],
      items: [
        { q: 'I want students ___ (receive) an email.', a: ['to receive'] },
        { q: 'Don’t let them ___ (press) the button twice.', a: ['press'] },
        { q: 'The app should allow you ___ (save) a draft.', a: ['to save'] },
        { q: 'Ask every user ___ (connect) with their school email.', a: ['to connect'] },
        { q: 'Add the subject: “___ says Kokoro couldn’t load.”', a: ['It'] },
        { q: 'Add the subject: “___ should be nothing at the top.”', a: ['There'] },
        { q: 'Fix it: “fix what it doesn’t work” → fix what ___', a: ['doesn’t work', 'does not work'] },
        { q: 'Some students ___ (not do) the exam yet.', a: ['haven’t done', 'have not done'] },
        { q: 'When ___ (we / create) this page?', a: ['did we create'] },
        { q: 'I ___ (just / upload) the photos, can you see them?', a: ['’ve just uploaded', 'have just uploaded', 'just uploaded'] }
      ] },

    { id: 'idiom', type: 'idiom', tab: '✨ Make it idiomatic', title: 'Make it idiomatic: say it like a native speaker', pill: 'Say it or write it',
      intro: "Your own sentences: clear, but built in Catalan. Rewrite each one the way a native speaker would say it: type it, or press 🎙 Say it and say it aloud (spoken English counts too). Then compare with the natural version and hear it.", items: [
        { s: "I attach the grid with the criteria.", a: ["I’m attaching the grid with the criteria.", "I’ve attached the grid with the criteria.", "Please find the grid with the criteria attached."], why: "Now, as you write: <strong>I’m attaching</strong> / <strong>I’ve attached</strong>." },
        { s: "Here’s the document I send you.", a: ["Here’s the document I’m sending you.", "Here’s the document I sent you."], why: "Present continuous or past, never the present simple." },
        { s: "I need you to do an HTML page.", a: ["I need you to make an HTML page.", "I need you to build an HTML page.", "I need you to create an HTML page."], why: "<strong>make / build</strong> a page." },
        { s: "Go ahead then and apply changes on the repository.", a: ["Go ahead then and apply the changes to the repository.", "Go ahead and apply the changes to the repository."], why: "apply something <strong>to</strong> something." },
        { s: "Don’t change content, only list the errors that you see and how to fix them.", a: ["Don’t change any content, just list the errors you find and how to fix them.", "Don’t change the content, just list the errors you find and how to fix them."], why: "<strong>just</strong> for “only this”; errors you <strong>find</strong>." },
        { s: "I want to allow doing further activities for fast finishers.", a: ["I want to let fast finishers do further activities.", "I want fast finishers to be able to do more activities.", "I want to let fast finishers do more activities."], why: "<strong>let someone do</strong>." },
        { s: "Yes, add “I’ve finished” but that brings them to the book section.", a: ["Yes, add “I’ve finished”, but make it take them to the book section."], why: "<strong>make it take them</strong> somewhere." },
        { s: "Once I finish, I’ll like to make one of the two LS as a model for the next to come.", a: ["Once I finish, I’d like to use one of the two LSs as a model for the next ones.", "Once I’ve finished, I’d like to use one of the two LSs as a model for the next ones."], why: "<strong>I’d like</strong>; <strong>use X as a model</strong>." },
        { s: "I want to have the option to tell you send it anyway and you always ask me.", a: ["I want the option to say “send it anyway”, so always ask me.", "I want to be able to say “send it anyway”, so always ask me."], why: "<strong>so always ask me</strong>." },
        { s: "Maybe is better to leave it.", a: ["Maybe it’s better to leave it.", "Maybe it’s best to leave it.", "It might be better to leave it."], why: "Every verb needs a subject: <strong>it’s</strong>." }
      ] },
    { id: 'write', type: 'writing', tab: 'Writing', title: 'Writing: ten instructions for a new feature',
      intro: 'Your text goes to your teacher for correction: grammar and idiom only.',
      task: 'Write the brief for a new English Lab or LumoUp feature (180–220 words) as you would send it to a developer. Start with one sentence on what you are attaching. Then give at least eight precise instructions, with a reason for each. Use want / ask / allow + someone + to, let + verb, make and do correctly, and give every verb a subject.',
      model: 'Hi Tom, I’m attaching two screenshots of the student board. I’d like you to add a “Speak again” button under each speaking task. I want it to appear only after the correction has arrived, so that students don’t try to redo it blindly. It should allow them to record a second version and hand it in again. Please don’t make any changes to the first recording: I want the teacher to compare both…',
      min: { daring: 180 },
      checklist: { daring: ['one sentence with I’m attaching / I’ve attached', 'eight instructions with want / ask / allow + someone + to', 'let + verb at least once', 'make and do with the right nouns', 'every verb has one subject (no dummy it)', 'two expressions from the vocabulary sheet'] } },

    { id: 'talk', type: 'talk', tab: '🎙 Speaking', title: 'Speaking: random questions about getting things done', pill: '4 random questions',
      intro: 'You get 4 random questions from a pool of 12. Answer fully, about 40 seconds each. Your recording goes to your teacher, who sends back the correction here.',
      task: 'Answer naturally with examples. Use make / do, want + someone + to, let + verb, and at least two expressions like put off, chase up, get around to, deal with.',
      pick: 4, wait: { daring: 45, native: 45, safe: 45 }, min: { daring: 90, safe: 90 },
      partner: [
        { q: 'What’s something you keep putting off at the moment? Why?' },
        { q: 'Tell me about a decision you made recently at school. How did you make it?' },
        { q: 'If you could ask your head teacher to change one thing, what would you want them to do?' },
        { q: 'What do you let your students decide in class, and what don’t you let them decide?' },
        { q: 'What’s the biggest mistake you’ve made with technology?' },
        { q: 'How do you deal with a week when you have too much to do?' },
        { q: 'Which task do you always want to get over with as quickly as possible?' },
        { q: 'What are you working on right now, at this exact moment of the term?' },
        { q: 'What did you do last weekend, and what did you make, if anything?' },
        { q: 'Tell me about something you finally got around to doing.' },
        { q: 'What should a good app allow students to do that most apps don’t?' },
        { q: 'Is there a new idea you’re not sold on yet? Why not?' }
      ],
      model: 'I keep putting off the reports, to be honest. Every term I tell myself I’ll make a start early, and every term I end up doing them the night before. What I want to do this time is to deal with five students a day, so it doesn’t become a daunting task. I’ve even asked my students to remind me, which is a bit embarrassing.' },

    { id: 'talk2', type: 'talk', tab: '🔁 Speak again', title: 'Speak again: the same questions, with your mistakes fixed', pill: 'After the feedback',
      intro: 'Read the correction of your first try, then answer exactly the same questions again, using every corrected form on purpose.',
      task: 'Same questions as your first try. Before you press Start, write down the three mistakes from your feedback you most want to avoid, and the right version of each.',
      redo: 'talk', wait: { daring: 45, native: 45, safe: 45 }, min: { daring: 90, safe: 90 }, partner: null,
      model: 'Use your corrected version: the same ideas, the better forms.' }
  ]
};
window.LP.panels.find(p => p.id === 'talk2').partner = window.LP.panels.find(p => p.id === 'talk').partner;
/* 🗣 Shadowing: the natural versions of ✨ Make it idiomatic, one sentence at a time (data/shadow.js, made by tools/towards-nativeness/shadow.py). */
(function () { const c = (window.TN_SHADOW || {}).done; if (!c) return; const P = window.LP.panels, i = P.findIndex(p => p.id === 'write');
  P.splice(i, 0, { id: 'shadow', type: 'shadow', tab: '🗣 Shadowing', title: 'Shadowing: your sentences, said the native way', pill: 'Listen and repeat', clip: c }); })();
