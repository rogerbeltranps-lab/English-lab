/* Towards Nativeness · Learning Path 5 · My latest mistakes: the part of the course that GROWS (Roger, 17 Nov 2026: "I'm about to give you
   more corrections"; their mistakes drive new sessions). To add a new batch: put it FIRST in TN_MISTAKES (newest first), with a new
   date id. Never change the id of a batch that is already there (progress is saved by it). Each mistake:
     s:   the sentence Roger wrote (typing slips fixed: only grammar and idiom count)
     bad: the exact wrong part, as it appears in s
     fix: the right version of that part (or a list of accepted ones)
     why: one short rule
     ca:  optional, a Catalan sentence that tests the same point (Catalan → English), with en: [accepted English versions]
   A batch can also have idiom: [{s, a: [natural versions], why}] (whole sentences to make idiomatic) and spoken: [the same shape, for
   short spoken chunks]; both use the ✨ panel (R.idiom: type it or 🎙 say it, then compare).
   The page makes, for each of the 3 newest batches: 🔍 Spot it (write the whole sentence correctly), ✏️ Fix it (type the right words), Catalan → English
   (when items have ca), ✨ Make it idiomatic, 🗣 Spoken English and 🗣 Shadowing (when data/shadow.js has a clip for the batch: run
   tools/towards-nativeness/shadow.py after adding a batch). Older batches (from the fourth on) come back together in 🔁 Review, mixed. */
window.TN_MISTAKES = [
  // 📍 Prepositions only (Roger, 25 Nov 2026: "add them, and create a flashcard deck of prepositions with my slips"): his preposition
  // slips from 21 Nov (evening) to 25 Nov. The same slips, as short chunks, are at the top of TN_PREPS (📍 step and the 🧠 deck).
  { id: 'n25p', date: '21–25 Nov 2026 · prepositions', from: 'your messages', items: [
    { s: 'Add the reading texts in the students’ notebooks.', bad: 'in the students’ notebooks', fix: ['to the students’ notebooks', 'to students’ notebooks', 'to the students’ notebook'], why: '<strong>add</strong> something <strong>to</strong> a place: add it to the notebook, to the list, to the page.', ca: 'Afegeix-ho a la llista de tasques.', en: ['Add it to the to-do list', 'Add it to my to-do list', 'Add it to the task list', 'Add it to my task list', 'Add it to the list of tasks', 'Add this to the to-do list', 'Add this to my to-do list'] },
    { s: 'I’d like to add an image in my message.', bad: 'add an image in my message', fix: ['add an image to my message'], why: '<strong>add</strong> something <strong>to</strong> a message, an email or a document (again: add TO).', ca: 'Vull afegir una foto al missatge.', en: ['I want to add a photo to the message', 'I want to add a picture to the message', 'I want to add a photo to my message', 'I want to add a picture to my message', 'I’d like to add a photo to the message', 'I’d like to add a picture to the message', 'I’d like to add a photo to my message', 'I’d like to add a picture to my message'] },
    { s: 'The headings mustn’t be in different pages.', bad: 'in different pages', fix: ['on different pages', 'on a different page', 'on a different page from their text'], why: 'Text is <strong>on</strong> a page: on page 84, on the next page.' },
    { s: 'On the teacher’s view it should look the same.', bad: 'On the teacher’s view', fix: ['In the teacher’s view'], why: 'You are <strong>in</strong> a view, a mode or a version (but <strong>on</strong> a page or a screen).' },
    { s: 'The assessment indicator is missing in some criteria.', bad: 'missing in', fix: ['missing from'], why: 'Something is missing <strong>from</strong> a place, a list or a group.' },
    { s: 'The reports will go here, on top.', bad: 'on top', fix: ['at the top'], why: '<strong>at the top</strong> of a page = a place on it; <em>on top</em> = lying over something.' },
    { s: 'I want all the flashcards with the same format.', bad: 'with the same format', fix: ['in the same format'], why: '<strong>in</strong> a format, a style, a colour, a language.' },
    { s: 'Starters do an exam that is more difficult to them.', bad: 'more difficult to them', fix: ['more difficult for them', 'harder for them'], why: 'easy / difficult / hard <strong>for</strong> someone.', ca: 'Per a ells és massa difícil.', en: ['It’s too difficult for them', 'It is too difficult for them', 'It’s too hard for them', 'It is too hard for them'] },
    { s: 'To me it’s very difficult to improve.', bad: 'To me', fix: ['For me'], why: 'Difficulty: <strong>for me</strong>. <em>To me</em> = in my opinion.' },
    { s: 'The bonus is for the activities that were due to before the exam.', bad: 'due to before', fix: ['due before'], why: '<strong>due</strong> + a time: due before Monday, due on Friday. <em>Due to</em> = because of.' },
    { s: 'We are at the 2nd term already.', bad: 'at the 2nd term', fix: ['in the 2nd term', 'in the second term'], why: '<strong>in</strong> a term, a week, a year; <em>at</em> is for a point: at the end of the term.' },
    { s: 'The speaking should count for the diagram.', bad: 'count for', fix: ['count towards', 'count toward'], why: 'Work <strong>counts towards</strong> a mark, a grade or a total.', ca: 'Els primers intents no compten per a la nota.', en: ['First tries don’t count towards the mark', 'First tries do not count towards the mark', 'First tries don’t count toward the mark', 'First tries don’t count towards the grade', 'First tries don’t count toward the grade', 'First attempts don’t count towards the mark', 'First attempts don’t count towards the grade'] },
    { s: 'We are not tiquismiquis with the number of words.', bad: 'tiquismiquis with', fix: ['fussy about', 'picky about'], why: '<em>tiquismiquis</em> = <strong>fussy / picky</strong>, and you are fussy <strong>about</strong> something.' },
    { s: 'Are the marks on the table?', bad: 'on the table', fix: ['in the table'], why: 'Marks are <strong>in</strong> a table (inside its cells). <em>On the table</em> = on the furniture.', ca: 'Les notes ja són a la taula?', en: ['Are the marks in the table yet', 'Are the marks already in the table', 'Are the marks in the table already', 'Are the grades in the table yet', 'Are the grades already in the table'] },
    { s: 'Do the reports of all students.', bad: 'reports of all students', fix: ['reports for all students', 'reports for all the students'], why: 'A report is made <strong>for</strong> someone.' },
    { s: 'What do you mean a few minutes after?', bad: 'mean a few', fix: ['mean by a few'], why: 'Asking about someone’s words: what do you mean <strong>by</strong> X?' },
    { s: 'Today I won’t make it for 4 ESO B and 2 ESO B.', bad: 'make it for', fix: ['make it to'], why: '<strong>make it to</strong> a class, a meeting or a place = manage to get there.', ca: 'Avui no arribaré a la reunió.', en: ['I won’t make it to the meeting today', 'I will not make it to the meeting today', 'Today I won’t make it to the meeting', 'I can’t make it to the meeting today', 'I won’t be able to make it to the meeting today'] },
    { s: 'Students see the corrections during weekdays at 5 pm.', bad: 'during weekdays', fix: ['on weekdays'], why: '<strong>on</strong> weekdays, on Mondays, on school days.' },
    { s: 'Is the script the one on my school account?', bad: 'on my school account', fix: ['in my school account'], why: 'Files and scripts are kept <strong>in</strong> an account (or in Drive).' },
    { s: 'I want a presentation to explain my students how I correct.', bad: 'explain my students', fix: ['explain to my students'], why: '<strong>explain</strong> something <strong>to</strong> someone. Never <em>explain me</em> / <em>explain my students</em>.', ca: 'Explica-m’ho una altra vegada.', en: ['Explain it to me again', 'Explain that to me again', 'Explain this to me again', 'Can you explain it to me again', 'Could you explain it to me again', 'Can you explain that to me again', 'Could you explain that to me again'] },
    { s: 'Explain me what it means.', bad: 'Explain me what it means', fix: ['Explain to me what it means', 'Explain what it means'], why: 'Your most frequent one: <strong>explain to me</strong>, or just explain what it means.' },
    { s: 'You deploy them on the website.', bad: 'deploy them on', fix: ['upload them to', 'put them on'], why: 'You <strong>upload</strong> files <strong>to</strong> a website (you deploy code).' },
    { s: 'The correction comes out from 17-18.', bad: 'from 17-18', fix: ['between 5 and 6 pm', 'between 5 and 6', 'from 5 to 6 pm', 'from 5 to 6'], why: 'A time window: <strong>between</strong> 5 <strong>and</strong> 6, or <strong>from</strong> 5 <strong>to</strong> 6 (and 5 pm, not 17h).' },
    { s: 'It happens when I change among these sections.', bad: 'change among', fix: ['switch between', 'move between', 'go between'], why: 'Going back and forth: <strong>switch between</strong> sections or tabs.' },
    { s: 'I want them to change from notebook-like or computer-like.', bad: 'change from notebook-like or computer-like', fix: ['switch between notebook-like and computer-like', 'switch between the notebook look and the computer look', 'change between notebook-like and computer-like'], why: 'Two options: <strong>between</strong> X <strong>and</strong> Y. <em>From X to Y</em> needs both ends.' },
    { s: 'I want them as columns on both places.', bad: 'on both places', fix: ['in both places'], why: '<strong>in</strong> a place: in both places, in the same place.' },
    { s: 'Activities must be simple, not regarding the content.', bad: 'simple, not regarding the content', fix: ['simple in format, not in content', 'simple in format, not content'], why: 'Say in what way with <strong>in</strong>: simple in format, rich in content.' },
    { s: 'I want a full screen with the above menu.', bad: 'the above menu', fix: ['the menu at the top', 'the menu above'], why: '<em>above</em> goes after the noun (the menu above), or say <strong>at the top</strong>.' },
    { s: 'They see a line with step 1 and by its side an example.', bad: 'and by its side an example', fix: ['with an example beside it', 'with an example next to it', 'and an example next to it', 'and an example beside it'], why: '<strong>beside it / next to it</strong> for things; <em>by her side</em> is for people.' }
  ] },
  { id: 'n21b', date: '17–21 Nov 2026 · list 2', from: 'your newest messages', items: [
    { s: 'Did you include the mistakes I did these days?', bad: 'the mistakes I did these days', fix: ['the mistakes I’ve made recently', 'the mistakes I made recently', 'the mistakes I’ve made lately', 'the mistakes I’ve made over the last few days'], why: 'You <strong>make</strong> a mistake; <em>these days</em> = nowadays, so say <strong>recently</strong>.' },
    { s: 'I want to write the good sentence, not choose it.', bad: 'the good sentence', fix: ['the correct sentence', 'the right sentence'], why: 'For answers: <strong>correct / right</strong>. <em>Good</em> is about quality.' },
    { s: 'I want fast finisher to read the book.', bad: 'fast finisher', fix: ['fast finishers'], why: 'A group in general is plural: <strong>fast finishers</strong>.' },
    { s: 'Include the ones of the exam.', bad: 'the ones of the exam', fix: ['the exam ones', 'the ones from the exam'], why: 'A noun in front (<strong>the exam ones</strong>), or <strong>from</strong> for where things come from.' },
    { s: 'I want it to have them ready by Monday.', bad: 'I want it to have', fix: ['I want to have'], why: 'No extra <em>it</em>: I want <strong>to have</strong> them ready.' },
    { s: 'We will mark them like the rest of the speaking.', bad: 'the rest of the speaking', fix: ['the other speaking activities', 'the rest of the speaking activities', 'the other speaking tasks'], why: '<em>speaking</em> as an adjective needs its noun: speaking <strong>activities</strong>.' },
    { s: 'It can be done in that moment or set as homework.', bad: 'in that moment', fix: ['at that moment', 'right then', 'then'], why: 'A point in time: <strong>at</strong> that moment (<em>en aquell moment</em>).' },
    { s: 'When I tap the %, I want to see who’s done and who hasn’t.', bad: 'who’s done and', fix: ['who’s done it and', 'who has done it and'], why: '<em>do</em> needs its object here: who’s done <strong>it</strong>.' },
    { s: 'I thought that was they saw when they opened the website.', bad: 'that was they saw', fix: ['that was what they saw'], why: 'The clause needs <strong>what</strong>: that was what they saw.' },
    { s: 'It opens when they press the button to do.', bad: 'the button to do', fix: ['the To do button'], why: 'Name the button first: <strong>the To do button</strong>.' },
    { s: 'Correct the writings missing.', bad: 'writings missing', fix: ['missing writings'], why: 'Adjective before the noun: the <strong>missing writings</strong>.' },
    { s: 'I don’t understand the colours not the labels.', bad: 'not the labels', fix: ['or the labels'], why: 'After a negative verb, join with <strong>or</strong>: I don’t understand X or Y.' },
    { s: 'I won’t make it because I have a doctor appointment.', bad: 'doctor appointment', fix: ['doctor’s appointment'], why: 'Fixed phrase with <strong>’s</strong>: a doctor’s appointment.' },
    { s: 'We need to label it with Sample exam 1.', bad: 'label it with', fix: ['label it', 'call it'], why: '<strong>label</strong> something + its name, no <em>with</em>.' },
    { s: 'Go ahead with the plan and next week activities.', bad: 'next week activities', fix: ['next week’s activities'], why: 'Time + noun: next week<strong>’s</strong> activities.' },
    { s: 'Put the summary like columns.', bad: 'like columns', fix: ['as columns', 'in columns'], why: 'The form something takes: <strong>as</strong> columns / <strong>in</strong> columns.' },
    { s: 'This web is to teach, not for self-study.', bad: 'This web is to teach', fix: ['This website is for teaching', 'This site is for teaching'], why: '<em>the web</em> is the whole internet: <strong>this website</strong>. Purpose: <strong>for + -ing</strong>.' },
    { s: 'We don’t have much time as we should.', bad: 'much time as', fix: ['as much time as'], why: 'Amounts: <strong>as much</strong> … as.' },
    { s: 'The same happens in 2 ESO.', bad: 'The same happens', fix: ['The same thing happens'], why: 'The set phrase is <strong>the same thing happens</strong>.' },
    { s: 'I’ve seen that you have a lot of docs here.', bad: 'I’ve seen that you have', fix: ['I see you have', 'I see that you have', 'I notice you have', 'I’ve noticed you have'], why: 'Something you notice right now: <strong>I see</strong> / I notice.' },
    { s: 'What happens with the writing?', bad: 'What happens with', fix: ['What’s happening with', 'What about'], why: 'A situation now: <strong>What’s happening with</strong>…? or <strong>What about</strong>…?' },
    { s: 'Change the green colour per the blue one.', bad: 'per the blue one', fix: ['to the blue one', 'to blue'], why: '<em>canviar X per Y</em> → change X <strong>to</strong> Y (or replace X <strong>with</strong> Y).' },
    { s: 'A 60 should be green already.', bad: 'A 60 should be green already', fix: ['60 should already be green'], why: 'No article before a mark used as a value; <strong>already</strong> goes before the adjective.' },
    { s: 'Make a backup for the data.', bad: 'backup for', fix: ['backup of'], why: 'A backup or a copy <strong>of</strong> something.' },
    { s: 'Where is the data I have of my students?', bad: 'of my students', fix: ['on my students', 'about my students'], why: 'Data or information <strong>on</strong> someone.' },
    { s: 'Is this already done?', bad: 'Is this already done', fix: ['Has this already been done', 'Has this been done yet'], why: 'A finished action with <em>already</em>: <strong>has … been done</strong>.' },
    { s: 'Suggest replies accordingly to the website.', bad: 'accordingly to', fix: ['according to', 'based on'], why: '<strong>according to</strong> + noun; <em>accordingly</em> stands alone.' },
    { s: 'Write an email remembering them that speaking is compulsory.', bad: 'remembering them', fix: ['reminding them'], why: '<strong>remind</strong> someone = make them remember.' },
    { s: 'It’s a document that help you work better.', bad: 'that help you', fix: ['that helps you'], why: 'A document = it: <strong>helps</strong>.' },
    { s: 'Where better for you to have them?', bad: 'Where better', fix: ['Where is it better'], why: 'A question needs its verb: Where <strong>is it</strong> better…?' },
    { s: 'Show the answer after 2 hours since they receive the message.', bad: 'after 2 hours since', fix: ['2 hours after', 'at least 2 hours after'], why: '<strong>after</strong> or <em>since</em>, not both: 2 hours after they receive it.' },
    { s: 'What’s the point on that?', bad: 'point on', fix: ['point of'], why: 'the point <strong>of</strong> something.' }
  ],
  idiom: [
    { s: 'Now I’ve done what I’ve done.', a: ['What’s done is done.'], why: 'The fixed idiom for <em>el que està fet, fet està</em>: <strong>What’s done is done.</strong>' },
    { s: 'They must be like a game.', a: ['They should work like a game.', 'They should be like a game.'], why: '<strong>should</strong> for how you want something to work; <em>must</em> sounds like an order.' },
    { s: 'It had to look more or less like this one.', a: ['It should look more or less like this one.', 'It should look roughly like this one.'], why: '<strong>should</strong> for what you expect; <em>had to</em> = an obligation.' }
  ] },
  { id: 'n21', date: '18–21 Nov 2026', from: 'your two newest lists', items: [
    { s: 'I want the students see their exam results on the dashboard.', bad: 'the students see', fix: ['the students to see'], why: 'want + someone + <strong>to</strong>.', ca: 'Vull que els alumnes facin el vídeo abans de divendres.', en: ['I want the students to make the video before Friday', 'I want students to make the video before Friday', 'I want the students to make the video by Friday', 'I want students to make the video by Friday'] },
    { s: 'I want that everything is clear for the students.', bad: 'that everything is', fix: ['everything to be'], why: 'Never <em>want that</em>: want + something + <strong>to be</strong>.' },
    { s: 'The students view still shows the old marks.', bad: 'students view', fix: ['student view'], why: 'A noun used as an adjective stays singular: <strong>student</strong> view.' },
    { s: 'Where can I see the exams results?', bad: 'exams results', fix: ['exam results'], why: 'Singular in front: <strong>exam</strong> results.' },
    { s: 'Open the samples exam first.', bad: 'samples exam', fix: ['sample exam'], why: 'Singular in front: <strong>sample</strong> exam.' },
    { s: 'My 2nd of ESO group played the game in class mode.', bad: '2nd of ESO', fix: ['2nd ESO', '2 ESO'], why: 'No <em>of</em> in course names: <strong>2nd ESO</strong>.', ca: 'Segons les notes, el grup de 4t d’ESO va millor.', en: ['Based on the marks, the 4th ESO group is doing better', 'Based on the marks, the 4 ESO group is doing better', 'Judging by the marks, the 4th ESO group is doing better', 'Going by the marks, the 4th ESO group is doing better', 'According to the marks, the 4th ESO group is doing better'] },
    { s: 'We started the LS2 on Monday.', bad: 'the LS2', fix: ['LS2'], why: 'No <em>the</em> before a name with a number: <strong>LS2</strong>, Room 4.' },
    { s: 'Can you do a copy of the 4th ESO path?', bad: 'do a copy', fix: ['make a copy'], why: '<strong>make</strong> = create something new: make a copy, make a video.' },
    { s: 'They need to do the video before Friday.', bad: 'do the video', fix: ['make the video'], why: 'You <strong>make</strong> a video.' },
    { s: 'The games are done at the end of the class.', bad: 'are done', fix: ['are played'], why: 'You <strong>play</strong> a game.' },
    { s: 'I checked it twice and is wrong again.', bad: 'and is wrong', fix: ['and it’s wrong', 'and it is wrong'], why: 'Every verb needs its subject: <strong>it’s</strong> wrong.' },
    { s: 'This time will be different.', bad: 'This time will be', fix: ['This time it will be', 'This time it’ll be'], why: 'Every verb needs its subject: this time <strong>it will</strong> be.' },
    { s: 'When I open the page, shows an error.', bad: 'shows', fix: ['it shows'], why: 'Every verb needs its subject: <strong>it</strong> shows.' },
    { s: 'Is very slow on my phone today.', bad: 'Is very slow', fix: ['It’s very slow', 'It is very slow'], why: 'English never drops <strong>it</strong>.', ca: 'Hauria d’estar sempre activat.', en: ['It should always be on', 'It should always be switched on', 'It should always be turned on', 'It should always be enabled', 'It should always be active'] },
    { s: 'Is it closed because is Saturday?', bad: 'because is', fix: ['because it’s', 'because it is'], why: 'Never drop the subject <strong>it</strong>.' },
    { s: 'The menu missing on this page.', bad: 'menu missing', fix: ['menu is missing'], why: 'A sentence needs its verb: the menu <strong>is</strong> missing.' },
    { s: 'Why English Lab is so slow today?', bad: 'Why English Lab is', fix: ['Why is English Lab'], why: 'Questions invert: why <strong>is English Lab</strong>…?', ca: 'Per què l’English Lab és tan car?', en: ['Why is English Lab so expensive', 'Why is English Lab so pricey', 'Why is English Lab that expensive', 'Why is English Lab that pricey'] },
    { s: 'That’s what you did with the exam results?', bad: 'That’s what you did', fix: ['Is that what you did'], why: 'Questions invert: <strong>Is that</strong> what you did?' },
    { s: 'There are three activities pending in the student view.', bad: 'three activities pending', fix: ['three pending activities'], why: 'Adjective before the noun: <strong>pending activities</strong>.', ca: 'Hi ha tres redaccions pendents.', en: ['There are three pending writings', 'There are 3 pending writings', 'There are three pending essays', 'There are three pending writing tasks'] },
    { s: 'They gave us an exam easy.', bad: 'an exam easy', fix: ['an easy exam'], why: 'Adjective before the noun: an <strong>easy exam</strong>.' },
    { s: 'I’ll send you a mail with the sample exam.', bad: 'a mail', fix: ['an email'], why: '<em>mail</em> is uncountable: send <strong>an email</strong>.', ca: 'Envia’m un correu amb els resultats dels exàmens.', en: ['Send me an email with the exam results', 'Email me the exam results', 'Send me an email with the results of the exams'] },
    { s: 'We only can enter marks on Fridays.', bad: 'only can', fix: ['can only'], why: '<em>only</em> after the modal: can <strong>only</strong> enter.' },
    { s: 'I need first to plan the sessions for LS2.', bad: 'I need first to plan', fix: ['First I need to plan', 'First, I need to plan'], why: '<strong>First</strong> goes at the start (or <em>…plan them first</em>).', ca: 'Primer he de planificar la SA2.', en: ['First I need to plan LS2', 'First I have to plan LS2', 'I need to plan LS2 first', 'I have to plan LS2 first'] },
    { s: 'The button should be always on.', bad: 'be always', fix: ['always be'], why: '<em>always</em> after the modal: should <strong>always be</strong>.' },
    { s: 'Students write their texts on the web.', bad: 'the web', fix: ['the website', 'the site'], why: '<em>la web</em> → the <strong>website</strong>; <em>the web</em> is the whole internet.' },
    { s: 'Can I introduce marks on the dashboard?', bad: 'introduce marks', fix: ['enter marks'], why: '<em>introduir notes</em> → <strong>enter</strong> marks.', ca: 'Has d’introduir les notes a la web.', en: ['You have to enter the marks on the website', 'You need to enter the marks on the website', 'You must enter the marks on the website', 'You have to enter the marks on the site', 'You have to enter the marks into the website'] },
    { s: 'Is this the last version of the website?', bad: 'last version', fix: ['latest version'], why: '<strong>latest</strong> = the newest; <em>last</em> = the final one.', ca: 'És l’última versió?', en: ['Is it the latest version', 'Is this the latest version', 'Is that the latest version'] },
    { s: 'Could you explain me how the export works?', bad: 'explain me how', fix: ['explain to me how', 'explain how'], why: 'explain <strong>to</strong> someone, never <em>explain me</em>.', ca: 'M’ho pots explicar?', en: ['Can you explain it to me', 'Could you explain it to me'] },
    { s: 'I’m hearing two songs.', bad: 'I’m hearing', fix: ['I can hear'], why: 'Sense verbs: <strong>I can hear</strong>, I can see.' },
    { s: 'Can you change among these sections?', bad: 'change among', fix: ['switch between'], why: '<strong>switch between</strong> two or more things.' }
  ],
  // ✨ Make it idiomatic: whole sentences to rewrite (spoken or written). a = natural versions; the first one is read aloud and shadowed.
  idiom: [
    { s: 'I want a full screen with the above menu.', a: ['I want a full-screen view with the menu at the top.', 'I want a full-screen view with the menu on top.'], why: 'a <strong>full-screen view</strong>; <em>the above menu</em> sounds like a document: the <strong>menu at the top</strong>.' },
    { s: 'I can’t read all the letters well here.', a: ['I can’t read some of the letters properly here.', 'Some of the letters are hard to read here.'], why: '<em>not all</em> = <strong>some of</strong>; read something <strong>properly</strong>.' },
    { s: 'I want that everything is ready before the class.', a: ['I want everything to be ready before class.', 'I want everything ready before class.'], why: 'want + something + <strong>to be</strong>; <strong>before class</strong>, no <em>the</em>.' },
    { s: 'Why English Lab is that pricy?', a: ['Why is English Lab so pricey?', 'Why is English Lab that pricey?', 'Why is English Lab so expensive?'], why: 'Questions invert: <strong>Why is English Lab</strong>…?' }
  ],
  // 🗣 Spoken English: short things you say all the time (spoken = said aloud in Make it idiomatic and shadowed).
  spoken: [
    { s: 'Is it because is Saturday?', a: ['Is it because it’s Saturday?'], why: 'Say the <strong>it’s</strong>.' },
    { s: 'Table full screen missing here.', a: ['The table full screen is missing here.', 'The full-screen table is missing here.'], why: 'Article and verb: <strong>The</strong> table… <strong>is</strong> missing.' },
    { s: 'There’s a microphone covered.', a: ['A microphone is covered.', 'One of the microphones is covered.'], why: 'Describe its state with <strong>is</strong>.' },
    { s: 'I’m hearing two songs.', a: ['I can hear two songs.'], why: '<strong>I can hear</strong>.' },
    { s: 'Can I change among these sections?', a: ['Can I switch between these sections?'], why: '<strong>switch between</strong>.' },
    { s: 'That’s what you did?', a: ['Is that what you did?'], why: 'Questions invert.' }
  ] },
  { id: 'n16', date: '11–16 Nov 2026', from: 'the project chat and about 80 threads', items: [
    { s: 'Change “Marks” for “Assessment details”.', bad: 'for', fix: ['to'], why: 'change X <strong>to</strong> Y.', ca: 'Canvia «Notes» per «Qualificacions».', en: ['Change Notes to Grades', 'Change Notes to Marks'] },
    { s: 'Where did you take the dictionary from?', bad: 'take', fix: ['get'], why: '<strong>get</strong> something from somewhere.', ca: 'D’on has tret aquestes imatges?', en: ['Where did you get these images from', 'Where did you get these pictures from', 'Where did you get those images from', 'Where did you get those pictures from'] },
    { s: 'Is that for free?', bad: 'for free', fix: ['free'], why: '<em>Is it free?</em> · <em>for free</em> goes after a verb: get it for free.' },
    { s: 'I want that the games have different questions.', bad: 'that the games have', fix: ['the games to have'], why: 'want + object + <strong>to</strong>, never <em>want that</em>.', ca: 'Vull que els alumnes llegeixin el llibre a casa.', en: ['I want the students to read the book at home', 'I want students to read the book at home'] },
    { s: 'Again, the text it’s not the same for everyone.', bad: 'the text it’s not', fix: ['the text isn’t', 'the text is not'], why: 'No extra <em>it</em> after the subject.' },
    { s: 'I’d like to explain a little introduction to the concepts.', bad: 'explain a little introduction', fix: ['give a short introduction', 'give a brief introduction'], why: '<strong>give</strong> an introduction; a <strong>short</strong> one.' },
    { s: 'I want to copy it, not moved.', bad: 'not moved', fix: ['not move it'], why: 'Same form on both sides: copy it, not move it.' },
    { s: 'Do students can add notes wherever they want?', bad: 'Do students can', fix: ['Can students'], why: 'Never <em>do</em> with a modal.', ca: 'Els alumnes poden canviar el color?', en: ['Can students change the colour', 'Can students change the color', 'Can the students change the colour', 'Can the students change the color'] },
    { s: 'They are too many activities.', bad: 'They are', fix: ['There are'], why: '<em>hi ha</em> → <strong>there are</strong>.', ca: 'Hi ha massa preguntes en aquesta secció.', en: ['There are too many questions in this section'] },
    { s: 'I need messages to explain them how it works.', bad: 'explain them how', fix: ['explain how', 'explain to them how'], why: 'explain something (to someone), never <em>explain them</em>.', ca: 'Explica’ls com funciona.', en: ['Explain to them how it works', 'Explain how it works to them'] },
    { s: 'The heading should appear on top.', bad: 'on top', fix: ['at the top'], why: '<strong>at the top</strong> of a page.' },
    { s: 'Preparing this materials takes a lot of effort.', bad: 'this materials', fix: ['these materials'], why: '<strong>these</strong> + plural.' },
    { s: 'I want them all feel comfortable.', bad: 'them all feel', fix: ['them all to feel'], why: 'want + someone + <strong>to</strong>.' },
    { s: 'Suggestions help me provide a better resources.', bad: 'a better resources', fix: ['better resources'], why: 'No <em>a</em> with a plural.' },
    { s: 'Do I need to ask to reassess Hajra?', bad: 'ask to reassess Hajra', fix: ['ask for Hajra to be reassessed'], why: 'ask <strong>for</strong> someone <strong>to be</strong> + past participle.' },
    { s: 'It takes a bit to see the mark.', bad: 'takes a bit', fix: ['takes a while'], why: 'It <strong>takes a while</strong>.' },
    { s: 'Did Gemini rewatched the video?', bad: 'rewatched', fix: ['rewatch'], why: 'After <em>did</em>, the base form.' },
    { s: 'And on each video, the money that costed.', bad: 'that costed', fix: ['it cost'], why: '<strong>cost / cost / cost</strong>.', ca: 'Quant va costar el vídeo?', en: ['How much did the video cost'] },
    { s: 'If they can’t record, ask them to notify it.', bad: 'notify it', fix: ['report it'], why: 'You <strong>report</strong> a problem; you notify a person.' },
    { s: 'I want Gemini see my changes.', bad: 'Gemini see', fix: ['Gemini to see'], why: 'want + someone + <strong>to</strong>.' },
    { s: 'I’ll ask students to load it on the web.', bad: 'load it on the web', fix: ['upload it to the website', 'upload it on the website', 'upload it to the site'], why: '<strong>upload</strong> a file; a <strong>website</strong>.' },
    { s: 'I want to receive an announcement when students upload it.', bad: 'an announcement', fix: ['a notification'], why: 'Apps send <strong>notifications</strong>.' },
    { s: 'It didn’t arrive yet.', bad: 'It didn’t arrive', fix: ['It hasn’t arrived', 'It has not arrived'], why: '<em>yet</em> + present perfect.', ca: 'Encara no ha arribat.', en: ['It hasn’t arrived yet', 'It still hasn’t arrived'] },
    { s: 'It arrived to my personal Gmail.', bad: 'arrived to', fix: ['arrived in'], why: 'arrive <strong>in</strong> an inbox; never <em>arrive to</em>.' },
    { s: 'Next term we’ll more strict.', bad: 'we’ll more strict', fix: ['we’ll be stricter', 'we will be stricter'], why: '<strong>be</strong> + stricter.' },
    { s: 'They didn’t do the listening and I won’t take into consideration.', bad: 'take into consideration', fix: ['take it into account'], why: 'take <strong>it</strong> into account.' },
    { s: 'Are the feedbacks like the other reports?', bad: 'Are the feedbacks', fix: ['Is the feedback'], why: '<strong>feedback</strong> is uncountable.', ca: 'El feedback és com el dels altres informes?', en: ['Is the feedback like the other reports', 'Is the feedback like in the other reports', 'Is the feedback the same as in the other reports'] },
    { s: 'On the other hand, I’d like a section for exams.', bad: 'On the other hand', fix: ['Also'], why: '<em>On the other hand</em> = contrast; <strong>Also</strong> = adding.' },
    { s: 'I answered to Emil already.', bad: 'answered to Emil', fix: ['answered Emil'], why: 'answer someone, no <em>to</em>.' },
    { s: 'Take this out from everywhere.', bad: 'out from everywhere', fix: ['out everywhere'], why: 'No <em>from</em> before <em>everywhere</em>.' },
    { s: 'I understand the 4 first questions.', bad: 'the 4 first questions', fix: ['the first 4 questions', 'the first four questions'], why: '<strong>the first four</strong>.', ca: 'Les tres primeres preguntes són fàcils.', en: ['The first three questions are easy', 'The first 3 questions are easy'] },
    { s: 'Do vocab have this option too?', bad: 'Do vocab have', fix: ['Does vocab have', 'Does vocabulary have'], why: 'Singular subject: <strong>does</strong>.' },
    { s: 'I need to see when was the last time Gemini read this.', bad: 'when was the last time Gemini read this', fix: ['when Gemini last read this'], why: 'Inside a sentence, no question order.' },
    { s: 'Now we only have one game of grammar per LS.', bad: 'one game of grammar', fix: ['one grammar game'], why: 'Noun as adjective: <strong>a grammar game</strong>.', ca: 'Tenim un joc de vocabulari per a cada unitat.', en: ['We have a vocabulary game for each unit', 'We have one vocabulary game for each unit', 'We have a vocab game for each unit', 'We have a vocabulary game for every unit'] },
    { s: 'Some colours don’t work when they are in mode taking notes.', bad: 'in mode taking notes', fix: ['in note-taking mode', 'in note taking mode'], why: '<strong>note-taking mode</strong>.' },
    { s: 'I want a mini explanation.', bad: 'a mini explanation', fix: ['a short explanation', 'a brief explanation'], why: '<strong>short</strong>, not <em>mini</em>.' },
    { s: 'Then I’ll give their time to do their questions.', bad: 'give their time', fix: ['give them time'], why: 'give <strong>them</strong> time.' },
    { s: 'Can we label like expressions?', bad: 'label like', fix: ['label it as'], why: '<strong>label it as</strong> something.' },
    { s: 'We need to add 6 activities for each section.', bad: 'for each section', fix: ['to each section'], why: 'add X <strong>to</strong> Y.' },
    { s: 'Fast finishers have always the option to read the book.', bad: 'have always', fix: ['always have'], why: '<em>always</em> before the main verb.', ca: 'Els alumnes sempre fan els deures.', en: ['The students always do their homework', 'Students always do their homework', 'The students always do the homework'] },
    { s: 'Leave them like they are for now.', bad: 'like they are', fix: ['as they are'], why: '<strong>as they are</strong>.' },
    { s: 'If happen again, I’ll let you know.', bad: 'If happen', fix: ['If it happens'], why: 'English needs a subject: <strong>it</strong>.', ca: 'Si torna a passar, t’ho dic.', en: ['If it happens again, I’ll let you know', 'If it happens again, I’ll tell you'] },
    { s: 'Let’s merge and I see if it works.', bad: 'I see', fix: ['I’ll see', 'I will see'], why: 'Future: <strong>I’ll see</strong>.' },
    { s: 'There are times where students need to move between them.', bad: 'times where', fix: ['times when'], why: '<strong>times when</strong>.' },
    { s: 'Víctor says his answers didn’t save.', bad: 'didn’t save', fix: ['weren’t saved', 'were not saved'], why: 'Passive: answers <strong>are saved</strong>.' },
    { s: 'If you could make the feeling of turning pages, that’d be amazing.', bad: 'make the feeling', fix: ['create the feeling'], why: '<strong>create</strong> a feeling.' },
    { s: 'The colour doesn’t match with the rest.', bad: 'match with', fix: ['match'], why: 'match something, no <em>with</em>.' },
    { s: 'I want the buttons to shrink up to a square.', bad: 'shrink up to', fix: ['shrink to'], why: '<strong>shrink to</strong>.' },
    { s: 'I want a mark where the introduction finishes.', bad: 'finishes', fix: ['ends'], why: 'A part of a video <strong>ends</strong>.' },
    { s: 'Can you add a saying like “Deeds are your monuments” or so?', bad: 'or so', fix: ['or something like that'], why: '<em>or so</em> is for numbers (ten or so).' }
  ],
  // ✨ Make it idiomatic: whole sentences to rewrite (spoken or written). a = natural versions; the first one is read aloud and shadowed.
  idiom: [
    { s: 'We can do that the last version of the answers is the good one.', a: ['We can make the last version of the answers the one that counts.', 'We can make the last version the one that counts.'], why: '<strong>make X the one that counts</strong>.' },
    { s: 'Yes, go ahead. I need to calm the waters with the families.', a: ['Yes, go ahead. I need to smooth things over with the families.'], why: '<em>calmar les aigües</em> → <strong>smooth things over</strong>.' },
    { s: 'It takes a bit to see the mark on the table.', a: ['It takes a while to see the mark in the table.', 'It takes a while for the mark to show up in the table.'], why: '<strong>take a while</strong>; <strong>in</strong> a table; marks <strong>show up</strong>.' },
    { s: 'On my iPad, the screen doesn’t go up to the top.', a: ['On my iPad, the page doesn’t scroll all the way to the top.', 'On my iPad, the page doesn’t scroll all the way up.'], why: 'Pages <strong>scroll all the way</strong> up.' },
    { s: 'OK, merge. If I know that, I won’t ask the students to do it again.', a: ['OK, merge. Now that I know, I won’t ask the students to do it again.'], why: '<strong>Now that I know</strong>.' },
    { s: 'I want to know the % performance that the class did the last time.', a: ['I want to know the percentage the class got last time.', 'I want to know what percentage the class got last time.', 'I want to know the % the class got last time.'], why: 'A class <strong>gets</strong> a %; <strong>last time</strong> without <em>the</em>.' },
    { s: 'We add more and more difficulty as we progress.', a: ['The difficulty builds as we go.', 'It gets harder as we go.', 'The difficulty builds up as we go.'], why: '<strong>builds as we go</strong>.' },
    { s: 'If I don’t have time to do whatever, there are no questions about it.', a: ['If I haven’t had time to teach something, there are no questions on it.', 'If I haven’t had time to cover something, there are no questions on it.'], why: '<strong>cover / teach something</strong>; questions <strong>on</strong> a topic.' },
    { s: 'It’s not about volume but quality.', a: ['It’s not about quantity but quality.', 'It’s about quality, not quantity.', 'It’s quality, not quantity.'], why: '<strong>quality, not quantity</strong>.' },
    { s: 'If I close it, I want to come back again if I want to.', a: ['If I close it, I want to be able to come back to it.', 'If I close it, I want to be able to go back to it.'], why: '<strong>be able to come back to</strong> something.' },
    { s: 'Do students see this? Because I go there when I press the notebook.', a: ['Do students see this? I end up here when I press the notebook.'], why: '<strong>end up</strong> somewhere = without planning to.' },
    { s: 'Can we make possible to have the feeling that you are writing on the notebook?', a: ['Can we make it feel like you’re writing in the notebook?', 'Can we make it feel like you are writing in the notebook?'], why: '<strong>make it feel like…</strong>; write <strong>in</strong> a notebook.' },
    { s: 'Make the content bigger to see it well on the panel.', a: ['Make the content bigger so I can see it well on the panel.', 'Make the content bigger so I can see it properly on the panel.'], why: '<strong>so I can…</strong> for purpose.' },
    { s: 'I mean little tweaks merge, big changes start a thread.', a: ['I mean: little tweaks get merged, big changes start a thread.', 'Little tweaks get merged, big changes start a thread.'], why: 'Passive with <strong>get</strong>: get merged.' },
    { s: 'They should have a button to go exactly where they were before.', a: ['They should have a button to go back to exactly where they were.', 'They should have a button to go back to exactly where they were before.'], why: '<strong>go back to</strong> where you were.' },
    { s: 'Instead of Gemini, call it Roig so that nobody understands it, but everywhere on the web.', a: ['Call it Roig everywhere on the website instead of Gemini, so nobody knows what it is.', 'Instead of Gemini, call it Roig everywhere on the website, so nobody knows what it is.'], why: 'Put <em>everywhere…</em> next to its verb.' }
  ],
  // 🗣 Spoken English: short things you say all the time (spoken = said aloud in Make it idiomatic and shadowed).
  spoken: [
    { s: 'A yes, this is the idea.', a: ['Ah, yes, that’s the idea.', 'Ah, yes, this is the idea.', 'Ah yes, that’s the idea.'], why: 'The English sound is <strong>Ah</strong>; <em>that’s the idea</em> is more natural.' },
    { s: 'Nops, I meant like here.', a: ['Nope, I meant like this one.', 'Nope, I meant this one.'], why: '<strong>Nope</strong>; past <strong>meant</strong> when you clarify.' },
    { s: 'But the way, can they look up phrasal verbs?', a: ['By the way, can they look up phrasal verbs?'], why: '<strong>By the way</strong>.' },
    { s: 'But readings are not always the same, right?', a: ['But the readings aren’t always the same, are they?', 'But the readings aren’t always the same, right?'], why: 'Question tag: <strong>are they?</strong>' },
    { s: 'So merged?', a: ['So, is it merged?', 'So, has it been merged?', 'So is it merged?'], why: 'Questions need the auxiliary.' },
    { s: 'What’s “send and confirm”?', a: ['What does “Send and confirm” mean?', 'What does Send and confirm mean?'], why: 'Ask about meaning: <strong>What does X mean?</strong>' },
    { s: 'But where, the script named English Lab?', a: ['But where? In the script called English Lab?', 'But where? In the script named English Lab?'], why: 'Two short questions; add <strong>in</strong>.' },
    { s: 'When giving me corrections you need to change that.', a: ['When you correct me, you need to change that.'], why: 'Simpler: <strong>when you correct me</strong>.' }
  ] },
  { id: 'n13', date: '13 Nov 2026', from: 'English Lab project chat', items: [
    { s: 'Show me the programmed emails to Àlex.', bad: 'programmed', fix: ['scheduled'], why: '<em>programat</em> → scheduled.', ca: 'Ensenya’m els correus programats.', en: ['Show me the scheduled emails'] },
    { s: 'I was in second of ESO A.', bad: 'second of ESO A', fix: ['2 ESO A', '2nd ESO A'], why: 'No <em>of</em>: 2nd ESO A.' },
    { s: 'I couldn’t work with the grammar in teaching mode.', bad: 'work with the grammar', fix: ['work on the grammar'], why: '<strong>work on</strong> a task.' },
    { s: 'Right now I only see who have checked the grammar.', bad: 'who have checked', fix: ['who has checked'], why: '<em>who</em> as a subject takes a singular verb.' },
    { s: 'I need to see who is in class during the class mode.', bad: 'during the class mode', fix: ['in class mode'], why: '<strong>in class mode</strong>, no article.', ca: 'Vull veure qui hi ha a classe en mode classe.', en: ['I want to see who is in class in class mode', 'I want to see who’s in class in class mode'] },
    { s: 'I want them to pass pages by dragging them.', bad: 'pass pages', fix: ['turn pages', 'turn the pages'], why: '<em>passar pàgina</em> → turn the page.', ca: 'Vull que passin pàgines arrossegant-les.', en: ['I want them to turn pages by dragging them', 'I want them to turn the pages by dragging them'] },
    { s: 'Josué has level Starter.', bad: 'has level Starter', fix: ['is at Starter level'], why: 'be <strong>at</strong> a level.', ca: 'La Júlia té nivell Core.', en: ['Júlia is at Core level', 'Julia is at Core level'] },
    { s: 'Some students will have different paces when reading.', bad: 'will have different paces when reading', fix: ['will read at different paces'], why: 'read <strong>at</strong> your own pace.' },
    { s: 'Don’t allow students press answers super fast.', bad: 'allow students press', fix: ['allow students to press', 'let students press'], why: 'allow + someone + <strong>to</strong>; let + verb.' },
    { s: 'If they are wrong, they have another questions.', bad: 'have another questions', fix: ['get another question'], why: '<strong>another + singular</strong>; get a question.' },
    { s: 'Don’t allow to bully a person when playing.', bad: 'allow to bully', fix: ['allow students to bully', 'allow anyone to bully', 'let anyone bully', 'let students bully'], why: '<em>allow</em> needs a person: allow students to…' },
    { s: 'They win badges, armaduras and features.', bad: 'armaduras', fix: ['armour', 'armor'], why: 'Spanish word: <strong>armour</strong> (uncountable).' },
    { s: 'They have an avatar that transform over the games.', bad: 'that transform', fix: ['that transforms'], why: 'third-person <strong>-s</strong>.' },
    { s: 'They must see their avatar on a place where doesn’t hide anything.', bad: 'on a place where doesn’t', fix: ['in a place where it doesn’t'], why: '<strong>in</strong> a place; add the subject <em>it</em>.' },
    { s: 'I want a mini game like ahorcado with the grammar.', bad: 'ahorcado', fix: ['hangman'], why: '<em>ahorcado / penjat</em> → hangman.' },
    { s: 'I don’t want the correcter underline their mistakes.', bad: 'the correcter underline', fix: ['the spellchecker to underline'], why: '<em>corrector</em> → spellchecker; want + object + <strong>to</strong>.', ca: 'No vull que el corrector subratlli els seus errors.', en: ['I don’t want the spellchecker to underline their mistakes'] }
  ] },
  { id: 'n12', date: '6–12 Nov 2026', from: 'English Lab project, second list', items: [
    { s: 'And in here?', bad: 'in here', fix: ['here'], why: '<em>aquí dins</em> → just <strong>here</strong>.' },
    { s: 'Here it happens the same.', bad: 'Here it happens the same', fix: ['The same thing happens here', 'The same happens here'], why: 'No dummy <em>it</em>.', ca: 'Aquí passa el mateix.', en: ['The same thing happens here', 'The same happens here'] },
    { s: 'In the LS1 it should appear the final product.', bad: 'In the LS1 it should appear the final product', fix: ['The final product should appear in LS1'], why: 'Subject first, no dummy <em>it</em>, no article with LS1.' },
    { s: 'You need any of them?', bad: 'You need', fix: ['Do you need'], why: 'Questions need an auxiliary.', ca: 'En necessites cap?', en: ['Do you need any of them', 'Do you need any'] },
    { s: 'Why this isn’t here yet?', bad: 'Why this isn’t', fix: ['Why isn’t this'], why: 'Auxiliary before the subject.' },
    { s: 'I don’t want students to see where do the info comes from.', bad: 'where do the info comes from', fix: ['where the info comes from', 'where the information comes from'], why: 'No <em>do</em> in indirect questions.' },
    { s: 'I want to see this table full screen.', bad: 'full screen', fix: ['in full screen'], why: '<strong>in</strong> full screen.' },
    { s: 'We’ll do this video.', bad: 'do this video', fix: ['make this video'], why: '<strong>make</strong> a video.', ca: 'Farem aquest vídeo demà.', en: ['We’ll make this video tomorrow', 'We will make this video tomorrow', 'We’re making this video tomorrow', 'We’re going to make this video tomorrow'] },
    { s: 'When I make changes on the agenda.', bad: 'changes on the agenda', fix: ['changes to the agenda'], why: 'make changes <strong>to</strong>.' },
    { s: 'Always games should be grammar and vocabulary.', bad: 'Always games should be', fix: ['Games should always be'], why: 'Adverb before the main verb, after the modal.' },
    { s: 'I want to see better the screen.', bad: 'see better the screen', fix: ['see the screen better'], why: 'Object before the adverb.' },
    { s: 'If a student do something wrong…', bad: 'a student do', fix: ['a student does'], why: 'third-person <strong>-s</strong>.' },
    { s: 'When did we created this?', bad: 'did we created', fix: ['did we create'], why: 'After did: the base form.', ca: 'Quan vam crear aquesta pàgina?', en: ['When did we create this page'] },
    { s: 'I want to maintain your challenge section.', bad: 'maintain', fix: ['keep'], why: '<em>mantenir</em> → keep.' },
    { s: 'I can touch a button to plan.', bad: 'touch a button', fix: ['press a button', 'tap a button'], why: '<strong>press / tap</strong> a button.' },
    { s: 'This doesn’t fit the new style, to messy.', bad: 'to messy', fix: ['it’s too messy', 'too messy'], why: '<strong>too</strong> + adjective.' }
  ] }
];

/* 📍 in / on / at (Roger, 17 Nov 2026: "in/on prepositions like in/on the list are difficult for me"): its own strand, always the second
   step. All your own preposition slips, from every list so far. Add new ones at the TOP when a new list has them (q with ___, a, en).
   🧠 They are also the 🧠 Preposition flashcards step of this page (below). A new chunk is a new card; record its sentence with Kokoro
   Heart (tools/voice/harvest.js, then generate.py). */
window.TN_PREPS = [
  // 21–25 Nov 2026 (batch n25p), as short chunks
  { q: 'Add the reading texts ___ the students’ notebooks.', a: ['to'], en: 'add something to a place.' },
  { q: 'I’d like to add an image ___ my message.', a: ['to'], en: 'add something to a message / an email.' },
  { q: 'The heading mustn’t be ___ a different page from its text.', a: ['on'], en: 'text is on a page.' },
  { q: 'It should look the same ___ the teacher’s view.', a: ['in'], en: 'in a view / a mode / a version.' },
  { q: 'The assessment indicator is missing ___ some criteria.', a: ['from'], en: 'missing from something.' },
  { q: 'The reports will go here, ___ the top.', a: ['at'], en: 'at the top of a page (on top = lying over something).' },
  { q: 'I want all the flashcards ___ the same format.', a: ['in'], en: 'in a format / a style / a colour.' },
  { q: 'Starters do an exam that is more difficult ___ them.', a: ['for'], en: 'difficult / easy / hard for someone.' },
  { q: '___ me, it’s very difficult to improve.', a: ['For'], en: 'difficulty: for me (to me = in my opinion).' },
  { q: 'We’re already ___ the 2nd term.', a: ['in'], en: 'in a term / a week / a year.' },
  { q: 'Speaking should count ___ the diagram.', a: ['towards', 'toward'], en: 'count towards a mark / a total.' },
  { q: 'We are not fussy ___ the number of words.', a: ['about'], en: 'fussy / picky about something.' },
  { q: 'Are the marks ___ the table?', a: ['in'], en: 'in a table: inside its cells.' },
  { q: 'Do the reports ___ all the students.', a: ['for'], en: 'a report for someone.' },
  { q: 'What do you mean ___ “a few minutes after”?', a: ['by'], en: 'what do you mean by X?' },
  { q: 'Today I won’t make it ___ 4 ESO B.', a: ['to'], en: 'make it to a class / a meeting.' },
  { q: 'Students see the corrections ___ weekdays at 5 pm.', a: ['on'], en: 'on weekdays / on Mondays.' },
  { q: 'Is the script the one ___ my school account?', a: ['in'], en: 'in an account / in Drive.' },
  { q: 'I want a presentation to explain ___ my students how I correct.', a: ['to'], en: 'explain something to someone.' },
  { q: 'Explain ___ me what it means.', a: ['to'], en: 'explain to me (never “explain me”).' },
  { q: 'You upload them ___ the website.', a: ['to'], en: 'upload to a website.' },
  { q: 'Corrections come out ___ 5 and 6 pm.', a: ['between'], en: 'between … and … for a time window.' },
  { q: 'It happens when I switch ___ these sections.', a: ['between'], en: 'switch between places / tabs.' },
  { q: 'Students can switch ___ the notebook look and the computer look.', a: ['between'], en: 'between X and Y for two options.' },
  { q: 'I want them as columns ___ both places.', a: ['in'], en: 'in a place.' },
  { q: 'Activities must be simple ___ format, not in content.', a: ['in'], en: 'in what way: simple in format.' },
  { q: 'I want a full screen with the menu ___ the top.', a: ['at'], en: 'at the top.' },
  { q: 'A line with step 1 and an example next ___ it.', a: ['to'], en: 'next to it / beside it (things).' },
  // earlier lists
  { q: 'Open the activity ___ class mode.', a: ['in'], en: 'in a mode: in class mode, in full screen.' },
  { q: 'The link is ___ the list ___ the top of the page.', a: ['on at', 'on / at'], en: 'on a list; at the top.' },
  { q: 'It looks fine ___ my phone but not ___ the laptop.', a: ['on on', 'on / on'], en: 'on a device.' },
  { q: 'My students are ___ 4th ESO.', a: ['in'], en: 'in a year / course / group.' },
  { q: 'It’s already ___ the list.', a: ['on'], en: 'on a list / the agenda / a page: things you read from.' },
  { q: 'Can you add it ___ the list?', a: ['to'], en: 'add something to something.' },
  { q: 'And it takes a while to see the mark ___ the table.', a: ['in'], en: 'in a table: the mark is inside a cell.' },
  { q: 'I want this information ___ the students table.', a: ['in'], en: 'in a table.' },
  { q: 'The post-it doesn’t work ___ the notebook.', a: ['in'], en: 'in a notebook: you write inside it.' },
  { q: 'Once they correct the SLP, it appears ___ their notebook, right?', a: ['in'], en: 'in a notebook.' },
  { q: 'Students write ___ the website, not ___ a pop-up.', a: ['on in', 'on / in'], en: 'on a website; in a pop-up / window / box.' },
  { q: 'Can they use Google Translate ___ my website?', a: ['on'], en: 'on a website.' },
  { q: 'I’ll ask students to upload it ___ the website.', a: ['to', 'on'], en: 'upload to (or on) a website.' },
  { q: 'It arrived ___ my personal Gmail.', a: ['in'], en: 'mail arrives in an inbox.' },
  { q: 'What will appear ___ the drafts folder?', a: ['in'], en: 'in a folder.' },
  { q: 'The heading should appear ___ the top.', a: ['at'], en: 'at the top / bottom / end: a point.' },
  { q: 'The open problem should appear ___ the top.', a: ['at'], en: 'at the top.' },
  { q: '___ class mode, the game appears automatically.', a: ['In'], en: 'in a mode.' },
  { q: 'Some colours don’t work ___ note-taking mode.', a: ['in'], en: 'in a mode.' },
  { q: 'Can they go full screen ___ the activities?', a: ['in'], en: 'in an activity / a section.' },
  { q: 'I want to see this table ___ full screen.', a: ['in'], en: 'in full screen.' },
  { q: 'Some students ___ LS2 should be able to write.', a: ['in'], en: 'in LS2, in a unit.' },
  { q: 'Make sure it works: ___ 2 ESO A it didn’t work today.', a: ['in'], en: 'in a class / group.' },
  { q: 'Josué is ___ Starter level.', a: ['at'], en: 'at a level.' },
  { q: 'Some students will read ___ different paces.', a: ['at'], en: 'at a pace / speed.' },
  { q: 'I don’t see the changes ___ my cellphone.', a: ['on'], en: 'on a phone / screen / device.' },
  { q: 'The favicon isn’t showing ___ my phone’s home screen.', a: ['on'], en: 'on a screen.' },
  { q: 'Check whether there’s a problem ___ GitHub.', a: ['on'], en: 'on a platform: on GitHub, on Classroom, on Drive.' },
  { q: 'The final task was posted ___ Classroom.', a: ['on'], en: 'on Classroom (no the).' },
  { q: 'The icon isn’t rounded ___ Windows.', a: ['on'], en: 'on an operating system.' },
  { q: 'Make the content bigger so I can see it well ___ the panel.', a: ['on'], en: 'on a panel / board / screen.' },
  { q: 'I want to put them ___ the agenda.', a: ['on'], en: 'put something on the agenda.' },
  { q: 'When I make changes ___ the agenda…', a: ['to'], en: 'make changes to something.' },
  { q: 'Apply the changes ___ the repository.', a: ['to'], en: 'apply something to something.' },
  { q: 'Explain it ___ everyone in the class.', a: ['to'], en: 'explain something to someone.' },
  { q: 'They must see their avatar ___ a place where it doesn’t hide anything.', a: ['in'], en: 'in a place.' },
  { q: 'I couldn’t work ___ the grammar in teaching mode.', a: ['on'], en: 'work on a task.' },
  { q: 'Is ChatGPT better ___ this?', a: ['at'], en: 'good / better at something.' }
];

(function () {
  const B = window.TN_MISTAKES;
  const gap = (s, bad) => s.replace(bad, '___');
  const fixArr = m => Array.isArray(m.fix) ? m.fix : [m.fix];
  const panels = [];
  const recent = B.slice(0, 3), older = B.slice(3);
  recent.forEach((b, k) => {
    const tag = k === 0 ? 'Newest · ' : '';
    // ✍️ written, not chosen (Roger, 21 Nov 2026: "I want to write the correct sentence, not choose"): a new id, so the old choose-the-part tries stay apart
    panels.push({ id: 'spotw_' + b.id, type: 'rewrite', tab: '🔍 ' + tag + b.date, title: 'Spot it · ' + b.date + ' · ' + b.from, pill: b.items.length + ' sentences',
      intro: 'Your own sentences from ' + b.date + '. Each one has one mistake (grammar or idiom only). Write the whole sentence correctly, then read why.',
      items: b.items.map(m => ({ s: m.s, a: fixArr(m).map(f => m.s.replace(m.bad, f)), ex: m.why })) });
    panels.push({ id: 'fix_' + b.id, type: 'typed', tab: '✏️ Fix it · ' + b.date, title: 'Fix it · ' + b.date, pill: 'Type it',
      intro: 'The wrong part is gone. Type what a native speaker would write in the gap. After two wrong tries you’ll see the answer.',
      items: b.items.map(m => ({ q: gap(m.s, m.bad) + ' <span class="tiny">(you wrote: <s>' + m.bad + '</s>)</span>', a: fixArr(m), en: m.why.replace(/<[^>]+>/g, '') })) });
    const ca = b.items.filter(m => m.ca && m.en);
    if (ca.length) panels.push({ id: 'ca_' + b.id, type: 'typed', tab: 'Catalan → English · ' + b.date, title: 'Catalan → English · ' + b.date, pill: 'Write it',
      intro: 'The same points in new sentences. Translate the way a native speaker would say it.',
      items: ca.map(m => ({ q: m.ca, a: m.en, en: m.why.replace(/<[^>]+>/g, '') })) });
    if (b.idiom && b.idiom.length) panels.push({ id: 'idiom_' + b.id, type: 'idiom', tab: '✨ Make it idiomatic · ' + b.date, title: 'Make it idiomatic · ' + b.date, pill: 'Say it or write it',
      intro: 'These sentences are understandable, but a native speaker would never say them like that. Rewrite each one: type it, or press 🎙 Say it and say it aloud. Then compare with the natural version.',
      items: b.idiom });
    if (b.spoken && b.spoken.length) panels.push({ id: 'spoken_' + b.id, type: 'idiom', tab: '🗣 Spoken English · ' + b.date, title: 'Spoken English · ' + b.date, pill: 'Say it aloud',
      intro: 'Short things you say all the time in chat and in class. Press 🎙 Say it and say the natural version aloud, the way you would in a conversation.',
      items: b.spoken });
    // 🗣 Shadowing: the natural versions of this batch, one sentence at a time (Kokoro af_heart, tools/towards-nativeness/shadow.py → data/shadow.js)
    const sh = (window.TN_SHADOW || {})['mistakes_' + b.id];
    if (sh) panels.push({ id: 'shadow_' + b.id, type: 'shadow', tab: '🗣 Shadowing · ' + b.date, title: 'Shadowing: your sentences, said the native way', pill: 'Listen and repeat', clip: sh });
  });
  /* 🗓 This week's mix (Roger approved, 17 Nov 2026): spaced, interleaved retrieval. 12 mistakes drawn from EVERY list so far (and the
     📍 sentences), a new draw every Monday (ISO week, seeded, so the same 12 all week on every device). The id changes every week, so it
     is a new step each week; older weeks stay done. Step 3, after 📍. */
  const week = (d => { const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())), day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day);
    const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return t.getUTCFullYear() + 'w' + String(Math.ceil(((t - y) / 864e5 + 1) / 7)).padStart(2, '0'); })(new Date());
  let seed = [...week].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  const poolW = B.flatMap(b => b.items).map(m => ({ q: gap(m.s, m.bad) + ' <span class="tiny">(you wrote: <s>' + m.bad + '</s>)</span>', a: fixArr(m), en: m.why.replace(/<[^>]+>/g, '') }))
    .concat(window.TN_PREPS || []);
  for (let i = poolW.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [poolW[i], poolW[j]] = [poolW[j], poolW[i]]; }
  if (poolW.length) panels.splice(1, 0, { id: 'week_' + week, type: 'typed', tab: '🗓 This week’s mix', title: 'This week’s mix: 12 mistakes from all your lists', pill: 'New every Monday',
    intro: 'Old and new mistakes, mixed: remembering a fix after a few days is what makes it stick. Do it once a week (Friday is a good day). If you get one wrong, it is still a habit: say the right sentence aloud three times.',
    items: poolW.slice(0, 12) });
  // 📍 always the second step, right after the newest 🔍 Spot it (so 🗓 ends up third)
  if (window.TN_PREPS) panels.splice(1, 0, { id: 'preps', type: 'typed', tab: '📍 in / on / at', title: 'in / on / at: your own sentences', pill: 'Your weak spot',
    intro: '<strong>on</strong> = things you look at, like a surface: on the list, on the website, on the screen, on my phone, on GitHub. <strong>in</strong> = things you put something inside: in the table, in the document, in the email, in the notebook, in the inbox, in class mode, in LS2. <strong>at</strong> = a point: at the top, at the end, at Starter level. <strong>to</strong> = movement: add to, apply to, upload to. Type the missing word. The same slips are also flashcards in the next step, 🧠 Preposition flashcards.',
    items: window.TN_PREPS });
  if (older.length) panels.push({ id: 'review', type: 'typed', tab: '🔁 Review: older mistakes', title: 'Review: older mistakes, mixed', pill: 'Spaced review',
    intro: 'Mistakes from earlier lists come back here, mixed. If you still get one wrong, it is a habit to work on.',
    items: older.flatMap(b => b.items).map(m => ({ q: gap(m.s, m.bad), a: fixArr(m), en: m.why.replace(/<[^>]+>/g, '') })) });
  /* 🧠 Preposition flashcards (Roger, 25 Nov 2026: "create a flashcard deck of prepositions with my slips"; "It should only be in Towards
     Nativeness, not for the students"): every TN_PREPS slip is a card (the sentence with a gap → the sentence with the preposition and the
     rule), studied with spaced repetition like 🧠 Flashcards (shared/js/el-flashdeck.js, opened straight on this one deck). Only on this
     page, never in lab/practice.html. Not a step: nothing to finish. Progress: localStorage tnPrepDeck (a tn… key, so it follows Roger's
     account). Voice: Kokoro Heart (tools/voice/harvest.js reads TN_PREPS). Right after 📍 in / on / at. */
  const P = window.TN_PREPS || [], GAPS = /_{2,}/g, esc = x => String(x).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const filled = (it, mk) => { const n = (it.q.match(GAPS) || []).length, w = String(it.a[0]).split(/\s*\/\s*|\s+/); let k = 0;
    return esc(it.q).replace(GAPS, () => mk(n > 1 ? w[k++] || '' : it.a[0])); };
  window.TN_PREP_CARDS = P.map(it => ({ id: 'p:' + it.q.toLowerCase(), kind: 'e', part: 'Prepositions: my slips', front: esc(it.q).replace(GAPS, '<span class="elfd-gap"></span>'),
    say: filled(it, x => x).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"'),
    back: '<div class="elfd-ans">' + filled(it, x => '<mark>' + esc(x) + '</mark>') + '</div>' + (it.en ? '<div class="elfd-why">💡 ' + esc(it.en) + '</div>' : '') }));
  if (P.length) panels.splice(panels.findIndex(p => p.id === 'preps') + 1, 0, { id: 'prepdeck', type: 'info', tab: '🧠 Preposition flashcards', title: 'Preposition flashcards: all your slips',
    pill: 'Spaced repetition', intro: 'Every preposition slip you’ve made, as a flashcard. Say the missing word aloud, turn the card, then tap how well you knew it: each card comes back when you need it. Up to 15 new cards a day.',
    html: '<style>#tnPrepDeck,#tnPrepDeck button{font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif}</style><div id="tnPrepDeck"></div>',   // the deck in its own plain font, not the notebook look's
    after() { const host = document.getElementById('tnPrepDeck'); if (!host || !window.ELFlashDeck) return;
      const load = () => { try { return JSON.parse(localStorage.getItem('tnPrepDeck') || '{}'); } catch (e) { return {}; } };
      ELFlashDeck.mount(host, { decks: () => [{ id: 'tn-prepositions', name: '📍 My prepositions', cards: window.TN_PREP_CARDS }], only: 'tn-prepositions', ca: () => false,
        load, save: x => { try { localStorage.setItem('tnPrepDeck', JSON.stringify(x)); } catch (e) {} }, me: () => null }); } });
  window.LP = { key: 'tnMistakes', n: 5, title: 'My latest mistakes', panels };
})();
