/* Towards Nativeness · Learning Path 4 · Writing like a teacher (LS3 of the learning situations doc): Catalan school words, articles and
   uncountable nouns, a/an before sounds, criterion / criteria, this / these and third-person -s, compounds and 's instead of chains of of. */
window.LP = {
  key: 'tnTeacher', n: 4, title: 'Writing like a teacher',
  panels: [
    { id: 'spot', type: 'mc', tab: '🔍 Spot the mistake', title: 'Spot the mistake: school English', pill: 'Warm-up',
      intro: 'Your own sentences about school, typing slips already fixed. One mistake each.',
      items: [
        { q: '“Now I want you to do the same with the LSs of 2n of ESO.”', o: ['the LSs of 2n of ESO', 'I want you to', 'the same'], ex: '<strong>the 2nd ESO LSs</strong>: no <em>of</em>, ordinal number.' },
        { q: '“Each objective has one assessment criteria.”', o: ['one assessment criteria', 'Each objective', 'has'], ex: 'one <strong>criterion</strong>, two <strong>criteria</strong>.' },
        { q: '“I mean this indicators.”', o: ['this indicators', 'I mean', 'I'], ex: '<strong>these</strong> + plural.' },
        { q: '“During a LS, students work in groups.”', o: ['a LS', 'During', 'in groups'], ex: '<strong>an LS</strong>: it starts with the sound /e/.' },
        { q: '“This project has too many info.”', o: ['too many info', 'This project', 'has'], ex: 'info is uncountable: <strong>too much info</strong>.' },
        { q: '“The dashboard need a new button.”', o: ['need', 'The dashboard', 'a new button'], ex: 'he / she / it + <strong>-s</strong>: the dashboard needs.' },
        { q: '“Create a document mare with all the competences.”', o: ['a document mare', 'Create', 'all the competences'], ex: '<strong>a master document</strong>.' },
        { q: '“For the next course I’ll change the programme.”', o: ['the next course', 'I’ll change', 'the programme'], ex: '<em>el curs vinent</em> → <strong>next school year</strong>.' },
        { q: '“Send me a list of mails.”', o: ['a list of mails', 'Send me', 'Send'], ex: '<strong>a list of emails</strong> (mail = the post, uncountable).' },
        { q: '“The criteria is only shown to the teacher.”', o: ['The criteria is', 'only shown', 'to the teacher'], ex: 'criteria is plural: <strong>the criteria are shown</strong>.' }
      ] },

    { id: 'vocab', type: 'vocab', tab: 'Vocabulary', title: 'School English without Catalan',
      intro: 'The words you need to write to colleagues, parents and heads of department. The flashcards test them both ways.',
      receptive: 'a scheme of work · differentiation · formative / summative assessment · a learning outcome · a cover lesson',
      core: { daring: ['next school year', 'the school', 'a master document', 'indicators', 'development', 'track progress', 'adapt to', 'what we’ve agreed', '2nd ESO', 'an email', 'the website', 'a criterion / criteria', 'an LS', 'feedback', 'hand in', 'cover a class', 'a staff meeting', 'the head of department', 'a parents’ evening', 'the deadline'] },
      groups: [
        { g: 'Catalan school words → English', items: [['next school year (el curs vinent)', 'el curs vinent', 'Next school year we’ll have three groups.'], ['the school (el centre)', 'el centre', 'The school has a new timetable.'], ['a master document (document mare)', 'document mare', 'All the LSs come from one master document.'], ['indicators (indicadors)', 'indicadors', 'Each criterion has three indicators.'], ['development / designing (elaboració)', 'elaboració', 'The development of each LS takes a month.'], ['track progress (registrar el progrés)', 'registrar el progrés', 'The dashboard tracks their progress.'], ['adapt to (adaptar a)', 'adaptar a', 'Adapt the LSs to what we’ve agreed.'], ['2nd / 4th ESO (2n / 4t d’ESO)', '2n / 4t d’ESO', 'I teach 2nd and 4th ESO.']] },
        { g: 'Countable or not?', items: [['an email / emails', 'un correu', 'I sent three emails.'], ['feedback (no a)', 'retroacció', 'They get some feedback every week.'], ['info / information (no a, no -s)', 'informació', 'There’s too much info on that page.'], ['code (no a)', 'codi', 'The idea is to have clean code.'], ['stuff (no a)', 'coses', 'It’s general stuff.'], ['the audio files (not the audios)', 'els àudios', 'The audio files are on the Drive.'], ['a criterion / two criteria', 'un criteri / dos criteris', 'The criteria are on the rubric.']] },
        { g: 'School life', items: [['hand in', 'lliurar', 'Hand in the writing by Friday.'], ['cover a class', 'substituir en una classe', 'Can you cover my 4th ESO class?'], ['a staff meeting', 'un claustre', 'We’ve got a staff meeting at five.'], ['the head of department', 'cap de departament', 'I sent it to the head of department.'], ['a parents’ evening', 'una reunió de pares', 'Parents’ evening is next Thursday.'], ['the deadline', 'la data límit', 'The deadline is Friday.'], ['mark / grade', 'corregir / posar nota', 'I’ve marked half the exams.']] },
        { g: 'Noun phrases the English way', items: [['the exam guide (not the exam’s guide)', 'la guia de l’examen', 'Add a note to the exam guide.'], ['the app’s name (not the name of the app)', 'el nom de l’app', 'The app’s name is on the cover.'], ['my Linux terminal', 'el meu terminal de Linux', 'Open my Linux terminal.'], ['the Healthy Habits writing section', 'la secció d’escriptura de Healthy Habits', 'The Healthy Habits writing section is new.'], ['a given competence', 'una competència donada', 'From a given competence, I design an objective.']] }
      ],
      practice: [
        { q: 'I’m changing the programme for ___ school year.', a: ['next'] },
        { q: 'Each objective has one assessment ___.', a: ['criterion'] },
        { q: 'During ___ LS, students work on one final product.', a: ['an'] },
        { q: 'There’s too ___ info on the home page.', a: ['much'] },
        { q: 'The criteria ___ shown on the rubric.', a: ['are'] },
        { q: '___ indicators are too vague. (plural)', a: ['These', 'Those'] },
        { q: 'Could you send me a list of their ___?', a: ['emails'] },
        { q: 'Please hand ___ your writing by Friday.', a: ['in'] },
        { q: 'Adapt the 4th ESO LSs ___ what we’ve agreed.', a: ['to'] },
        { q: 'I give them some ___ every week. (retroacció)', a: ['feedback'] }
      ] },

    { id: 'read', type: 'mc', tab: 'Reading', title: 'Reading: An email that works', pill: 'C1',
      intro: 'A department head writes to a new colleague about how to write to families. Read for the advice.',
      media: { text: '<p><strong>Subject: A few tips before your first parents’ emails</strong></p>' +
        '<p>Dear Laia,</p>' +
        '<p>Welcome to the department! As promised at yesterday’s staff meeting, here are a few tips for writing to families. None of this is in the official guide, but it has saved me a lot of trouble over the years.</p>' +
        '<p>First, keep it short. Parents read our emails on their phones, usually at the end of a long day. Three short paragraphs are plenty: what has happened, what you would like them to do, and when. If there is a deadline, put it in the first two lines. A good test is whether the email still makes sense if they only read the subject line and the first sentence.</p>' +
        '<p>Second, avoid our own jargon. We talk about <em>LSs</em>, <em>criteria</em> and <em>indicators</em> all day, but most families have no idea what an LS is. Write “the project we’re doing this term” instead. The same goes for the words we borrow from Catalan without noticing: in English it is <em>next school year</em>, not <em>the next course</em>, and the building we work in is <em>the school</em>, not <em>the centre</em>.</p>' +
        '<p>Third, be careful with feedback. Feedback is uncountable, so you give <em>some feedback</em> or <em>a piece of feedback</em>, never <em>a feedback</em>. More importantly, start with something the student has done well, even if it is small. Families are far more likely to support you if they feel you’ve noticed their child.</p>' +
        '<p>Finally, never send anything in anger. If an email from a family upsets you, write your reply, save it as a draft and read it again the next morning. You will almost always end up changing it, and you will rarely regret the delay.</p>' +
        '<p>I’m attaching the template I use for the first email of the year. Feel free to adapt it to your own style.</p>' +
        '<p>Best wishes,<br>Montse</p>' },
      items: [
        { q: 'Why does Montse recommend short emails?', o: ['Parents read them on their phones after a long day.', 'Long emails are against school rules.', 'Short emails sound more polite.'] },
        { q: 'Where should a deadline go?', o: ['in the first two lines', 'at the end', 'in the subject line only'] },
        { q: 'What does she suggest instead of “LS”?', o: ['“the project we’re doing this term”', '“the learning situation”', '“the unit”'] },
        { q: 'Which is correct, according to the email?', o: ['some feedback', 'a feedback', 'feedbacks'] },
        { q: 'Why start with something the student has done well?', o: ['Families support you more if they feel you’ve noticed their child.', 'It is required by the official guide.', 'It makes the email shorter.'] },
        { q: 'What does she advise when a family email upsets you?', o: ['Save your reply as a draft and reread it the next morning.', 'Forward it to the head of department.', 'Reply immediately and honestly.'] }
      ] },

    { id: 'listen', type: 'mc', tab: 'Listening', title: 'Listening: The staff meeting', pill: 'C1 · three voices',
      intro: 'Part of a department meeting. Listen for the decisions and who will do what.',
      media: { audio: 'audio/lp4-staff-meeting.mp3', title: 'The staff meeting', script: [
        ['Montse', 'Okay, everyone, let’s make a start. We’ve only got forty minutes. First item: the programme for next school year.'],
        ['David', 'Have the criteria changed again?'],
        ['Montse', 'Some of them have. The new criteria are in the master document. I’ve highlighted the ones that are different.'],
        ['Laia', 'Sorry, quick question. Is there one indicator per criterion, or more?'],
        ['Montse', 'Three per criterion, at least for second and fourth ESO. Which reminds me, David, could you adapt the second ESO LSs to the new criteria by the end of the month?'],
        ['David', 'Sure. Although that’s a lot of work. Could Laia give me a hand with the indicators?'],
        ['Laia', 'Happy to. I’ve got a free period on Thursdays.'],
        ['Montse', 'Perfect. Second item: parents’ evening. It’s next Thursday from five to eight. Please hand in your reports by Tuesday so that I can check them.'],
        ['David', 'Tuesday? That’s a bit tight.'],
        ['Montse', 'I know, but the head wants them on the website by Wednesday. And please, keep the comments short and give some positive feedback first.'],
        ['Laia', 'Should we email the families as well?'],
        ['Montse', 'Yes. I’m sending you a template right now. There you go. Adapt it as much as you like, but don’t use too much jargon. Families don’t know what an LS is.'],
        ['David', 'Fair enough. Anything else?'],
        ['Montse', 'Just one thing. Can somebody cover my class on Friday? I’ve got a course in Barcelona.'],
        ['Laia', 'I can do it.'],
        ['Montse', 'Brilliant. Thanks, Laia. Right, that’s everything.']
      ] },
      chunks: ['the programme for next school year', 'the new criteria are in the master document', 'adapt the second ESO LSs to the new criteria', 'give some positive feedback first', 'can somebody cover my class'],
      items: [
        { q: 'Where are the new criteria?', o: ['in the master document', 'on the website', 'in an email from the head'] },
        { q: 'How many indicators does each criterion have?', o: ['three', 'one', 'it depends on the teacher'] },
        { q: 'What will David do by the end of the month?', o: ['adapt the 2nd ESO LSs to the new criteria', 'write the parents’ emails', 'cover Montse’s class'] },
        { q: 'Why must reports be handed in by Tuesday?', o: ['The head wants them on the website by Wednesday.', 'Parents’ evening is on Tuesday.', 'Montse is away on Friday.'] },
        { q: 'What does Montse do while she talks about the template?', o: ['She sends it.', 'She prints it.', 'She reads it aloud.'] },
        { q: 'Why does Montse need someone to cover her class?', o: ['She has a course in Barcelona.', 'She is ill.', 'She has a meeting with the head.'] }
      ] },

    { id: 'movie', type: 'movie', tab: '🎬 Movie dictation', title: 'Movie dictation: speeches and big moments', pill: 'Real films',
      intro: 'Two real scenes. Each line plays only its part (press ▶ again as many times as you like). Type the missing words.',
      clips: [
        { youtube: 'QO3k9ZukvWs', title: 'Legally Blonde (2001): Elle Woods’ graduation speech', credit: 'Clip: “Legally Blonde”, MGM, via YouTube. Short lines for listening practice only.',
          note: 'A formal speech at a university graduation: listen for the formal chunks you could use at school.',
          items: [
            { t: [0, 14], q: 'I am personally very honored to introduce this year’s ___ speaker.', a: ['class-elected', 'class elected'] },
            { t: [0, 22], q: 'I am sure we are going to ___ from her.', a: ['see great things'] },
            { t: [55, 72], q: 'On our very first day at Harvard, a very wise professor ___.', a: ['quoted Aristotle'] }
          ] },
        { youtube: '3MP5qHvuHE0', title: 'Jerry Maguire (1996): “You complete me”', credit: 'Clip: “Jerry Maguire”, TriStar Pictures, via YouTube. Short lines for listening practice only.',
          note: 'A man walks into a room full of people. Listen for the present perfect at the end.',
          items: [
            { t: [0, 9], q: 'I’m ___ my wife.', a: ['looking for'] },
            { t: [65, 76], q: 'I ___ my wife.', a: ['miss'] },
            { t: [185, 198], q: 'You know this is the best talking group ___?', a: ['I’ve ever been in', 'I have ever been in'] }
          ] }
      ] },

    { id: 'translate', type: 'typed', tab: 'Catalan → English', title: 'Say it like a native: Catalan → English', pill: 'Write it',
      intro: 'Translate as you would write it in an email to a colleague. Contractions are fine.',
      items: [
        { q: 'El curs vinent tindrem tres grups de 2n d’ESO.', a: ['Next school year we’ll have three 2nd ESO groups', 'Next school year we will have three 2nd ESO groups', 'Next year we’ll have three 2nd ESO groups', 'Next school year, we’ll have three 2nd ESO groups'], en: 'next school year; 2nd ESO groups (noun as modifier).' },
        { q: 'Cada criteri té tres indicadors.', a: ['Each criterion has three indicators', 'Every criterion has three indicators'], en: 'one criterion; has (-s).' },
        { q: 'Aquests criteris són diferents dels de 3r i 4t d’ESO.', a: ['These criteria are different from those in 3rd and 4th ESO', 'These criteria are different from the ones in 3rd and 4th ESO'], en: 'these criteria are; different from those in.' },
        { q: 'Hi ha massa informació a la web.', a: ['There’s too much info on the website', 'There’s too much information on the website', 'There is too much information on the website', 'There is too much info on the website'], en: 'much + uncountable; on the website.' },
        { q: 'Crea un document mare amb totes les competències.', a: ['Create a master document with all the competences', 'Make a master document with all the competences', 'Create a master document with all the competencies'], en: 'master document.' },
        { q: 'Adapta les LS de 4t d’ESO al que hem acordat.', a: ['Adapt the 4th ESO LSs to what we’ve agreed', 'Adapt the 4th ESO LSs to what we have agreed', 'Adapt the 4th ESO LSs to what we agreed'], en: 'adapt to; what we’ve agreed.' },
        { q: 'Envia’m una llista dels correus.', a: ['Send me a list of the emails', 'Send me a list of their emails', 'Send me a list of the email addresses'], en: 'emails, not mails.' },
        { q: 'Afegeix una nota a la guia de l’examen.', a: ['Add a note to the exam guide'], en: 'the exam guide, not the exam’s guide.' },
        { q: 'Durant una LS, els alumnes treballen en grup.', a: ['During an LS, students work in groups', 'During an LS students work in groups', 'During an LS, the students work in groups'], en: 'an LS.' },
        { q: 'Els dono una mica de retroacció cada setmana.', a: ['I give them some feedback every week', 'I give them a bit of feedback every week'], en: 'feedback is uncountable.' }
      ] },

    { id: 'grammar', type: 'typed', tab: 'Grammar', title: 'Articles, agreement and noun phrases', pill: 'Answer all',
      explain: [
        '<strong>a / an</strong> goes by sound: <em>an LS, an HTML file, an objective, a university, a European project</em>.',
        '<strong>No article</strong> with uncountable nouns used in general: <em>clean code, feedback, info, stuff, homework, advice</em>; and with %: <em>40% of my limit</em>.',
        '<strong>this + singular, these + plural; criterion / criteria; he/she/it + -s</strong>: <em>these criteria are, the dashboard needs, a student does</em>.',
        '<strong>Compounds and ’s</strong> instead of chains of <em>of</em>: <em>the exam guide, the app’s name, my Linux terminal, every section of every learning path</em>.'
      ],
      items: [
        { q: 'Send me ___ HTML file with the results.', a: ['an'] },
        { q: 'It’s ___ European project. (a / an)', a: ['a'] },
        { q: 'The idea is to have ___ clean code. (write - if nothing)', a: ['-'] },
        { q: 'I’ve used almost ___ 40% of my weekly limit. (write - if nothing)', a: ['-'] },
        { q: '___ criteria ___ different this year. (this/these + be)', a: ['These are'] },
        { q: 'When a student ___ (reach) ten cards, let them continue.', a: ['reaches'] },
        { q: 'Who ___ (have) checked the grammar? (one person or more)', a: ['has'] },
        { q: 'Rewrite: “the name of the app” → ___', a: ['the app’s name', 'the app name'] },
        { q: 'Rewrite: “the guide of the exam” → ___', a: ['the exam guide'] },
        { q: 'Rewrite: “all the sections of all the learning paths” → ___', a: ['every section of every learning path', 'all the sections of every learning path'] }
      ] },

    { id: 'idiom', type: 'idiom', tab: '✨ Make it idiomatic', title: 'Make it idiomatic: say it like a native speaker', pill: 'Say it or write it',
      intro: "Your own sentences: clear, but built in Catalan. Rewrite each one the way a native speaker would say it: type it, or press 🎙 Say it and say it aloud (spoken English counts too). Then compare with the natural version and hear it.", items: [
        { s: "Now I want you to do the same with the LSs of 2n of ESO.", a: ["Now I want you to do the same with the 2 ESO LSs.", "Now do the same with the 2 ESO LSs.", "Now I want you to do the same with the LSs for 2 ESO."], why: "Compound: <strong>the 2 ESO LSs</strong>." },
        { s: "Adapt the 4th of ESO LSs into what we have said.", a: ["Adapt the 4 ESO LSs to what we’ve agreed.", "Adapt the 4 ESO LSs to what we agreed.", "Adapt the 4 ESO LSs to what we’ve agreed on."], why: "adapt <strong>to</strong>; <strong>what we’ve agreed</strong>." },
        { s: "Create a document mare with all the competences.", a: ["Create a master document with all the competences."], why: "<em>document mare</em> → <strong>master document</strong>." },
        { s: "From a competence given, I design a objective.", a: ["From a given competence, I design an objective.", "I design an objective from a given competence."], why: "Adjective before the noun; <strong>an</strong> objective." },
        { s: "This are the docs that explain how to do the objectives.", a: ["These are the docs that explain how to write the objectives.", "These are the documents that explain how to write the objectives."], why: "<strong>these are</strong>; <strong>write</strong> objectives." },
        { s: "Please check if some students that hadn’t done exam of the LS1 finally did it.", a: ["Please check whether any students who hadn’t done the LS1 exam have finally done it.", "Please check if any students who hadn’t done the LS1 exam have done it now."], why: "<strong>any</strong> in questions; <strong>the LS1 exam</strong>." },
        { s: "In the doc you created are missing the verb to be.", a: ["The doc you created is missing the verb to be.", "The verb to be is missing from the doc you created."], why: "<em>hi falta</em> → <strong>X is missing</strong> / <strong>Y is missing X</strong>." },
        { s: "Send a mail to Nael telling that his video has no sound.", a: ["Send Nael an email telling him his video has no sound.", "Send an email to Nael telling him that his video has no sound.", "Send an email to Nael telling him his video has no sound."], why: "<strong>an email</strong>; <strong>tell someone</strong> that." },
        { s: "Not handed or no link should be a 0 as a default.", a: ["Not handed in or no link should be a 0 by default."], why: "<strong>hand in</strong>; <strong>by default</strong>." },
        { s: "The final task was sent on the classroom on the 23 Oct.", a: ["The final task was posted on Classroom on 23 Oct.", "The final task was posted on Classroom on 23 October."], why: "<strong>post on Classroom</strong> (no <em>the</em>)." }
      ] },
    { id: 'write', type: 'writing', tab: 'Writing', title: 'Writing: an email presenting one of your LSs',
      intro: 'This is the final product of LS3 in your learning situations doc. Your text goes to your teacher for correction: grammar and idiom only.',
      task: 'Write an email (180–230 words) to the head of department, or to a colleague from another school, presenting one of your learning situations: its title, level, objectives, final product and how it is assessed. No Catalan school words, every this / these and a / an correct, no chains of “of”.',
      model: 'Subject: Seasons & Celebrations, our 4th ESO LS for the first term\n\nDear Montse,\n\nAs we agreed at the last staff meeting, I’m attaching a summary of the LS I’ve designed for 4th ESO this term…',
      min: { daring: 180 },
      checklist: { daring: ['subject line and a clear opening sentence', 'English school words only (next school year, the school, master document…)', 'a / an by sound (an LS)', 'these + plural, criterion / criteria', 'feedback, info, code with no a', 'compounds and ’s instead of chains of of'] } },

    { id: 'talk', type: 'talk', tab: '🎙 Speaking', title: 'Speaking: random questions about your teaching', pill: '4 random questions',
      intro: 'You get 4 random questions from a pool of 12. Answer like you would at a teachers’ conference, about 45 seconds each. Your recording goes to your teacher, who sends back the correction here.',
      task: 'Use English school words (next school year, staff meeting, head of department, hand in, mark…), get every article and plural right, and give examples.',
      pick: 4, wait: { daring: 45, native: 45, safe: 45 }, min: { daring: 90, safe: 90 },
      partner: [
        { q: 'Describe one of your learning situations to a teacher from another country.' },
        { q: 'How do you assess your students’ speaking? What criteria do you use?' },
        { q: 'What will be different in your classes next school year?' },
        { q: 'How do you give feedback on writing without spending all weekend on it?' },
        { q: 'Tell me about a parents’ evening that didn’t go as planned.' },
        { q: 'What do you think is the most useful piece of advice for a new teacher?' },
        { q: 'How do you track your students’ progress during a term?' },
        { q: 'What happens at a typical staff meeting at your school?' },
        { q: 'What’s the difference between teaching 2nd ESO and 4th ESO?' },
        { q: 'Which school documents do you find most useless, and why?' },
        { q: 'How do you adapt an activity to students at very different levels?' },
        { q: 'If you were head of department, what would you change first?' }
      ],
      model: 'Next school year I’d like to change the way I give feedback on writing. At the moment I mark every text by hand, which takes ages. What I’m planning is to give some feedback on two criteria only, but to make it really specific, and then let the students rewrite their texts in class.' },

    { id: 'talk2', type: 'talk', tab: '🔁 Speak again', title: 'Speak again: the same questions, with your mistakes fixed', pill: 'After the feedback',
      intro: 'Read the correction of your first try, then answer exactly the same questions again, using every corrected form on purpose.',
      task: 'Same questions as your first try. Before you press Start, write down the three mistakes from your feedback you most want to avoid, and the right version of each.',
      redo: 'talk', wait: { daring: 45, native: 45, safe: 45 }, min: { daring: 90, safe: 90 }, partner: null,
      model: 'Use your corrected version: the same ideas, the better forms.' }
  ]
};
window.LP.panels.find(p => p.id === 'talk2').partner = window.LP.panels.find(p => p.id === 'talk').partner;
/* 🗣 Shadowing: the natural versions of ✨ Make it idiomatic, one sentence at a time (data/shadow.js, made by tools/towards-nativeness/shadow.py). */
(function () { const c = (window.TN_SHADOW || {}).teacher; if (!c) return; const P = window.LP.panels, i = P.findIndex(p => p.id === 'write');
  P.splice(i, 0, { id: 'shadow', type: 'shadow', tab: '🗣 Shadowing', title: 'Shadowing: your sentences, said the native way', pill: 'Listen and repeat', clip: c }); })();
