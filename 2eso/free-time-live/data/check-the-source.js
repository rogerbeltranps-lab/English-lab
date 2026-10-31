/* 2 ESO · LS2 Free Time, Live! · Learning Path 4 · Check the source (LS criteria 4.2 and 6.2; term 2, before the final product) */
window.LP = {
  key: 'ls2Source2ESO', n: 4, starter: true, title: 'Check the source',
  panels: [
    { id: 'recall', type: 'recall', tab: 'Recall', title: { ca: 'Recall: Learning Paths 2 i 3', en: 'Recall: Learning Paths 2 and 3' }, pill: { ca: 'Sense apunts', en: 'No notes' },
      intro: { ca: 'Escriu les respostes sense mirar res.', en: 'Type the answers without looking.' },
      items: [
        { q: 'I usually play tennis, but today I ___ (play) basketball.', a: ['am playing', "'m playing"], ca: 'today → ara.', en: 'today → now.' },
        { q: 'Look! It ___ (snow).', a: ['is snowing', "'s snowing"] },
        { q: 'Write the -ing form: sit → ___', a: ['sitting'] },
        { q: 'At the ___ she’s training for a show. (en aquest moment)', a: ['moment'] },
        { q: 'It’s cold. Wear a ___ and gloves. (jaqueta)', a: ['jacket'] },
        { r: 'insecure', q: 'He ___ (not / like) cold weather.', a: ["doesn't like", 'does not like'] },
        { r: 'insecure', q: 'What ___ you doing right now?', a: ['are'] },
        { r: 'safe', q: 'I ___ (want) a new bike. (state verb, now)', a: ['want'] },
        { r: 'safe', q: 'Our team is in a ___ with 12 teams.', a: ['tournament'] },
        { r: 'daring', q: 'This month I ___ (train) for a race.', a: ['am training', "'m training"] },
        { r: 'daring', q: 'I ___ (prefer) skating to cycling.', a: ['prefer'] }
      ] },
    { id: 'vocab', type: 'vocab', practiceMode: 'listen', tab: { ca: 'Vocabulari', en: 'Vocabulary' }, title: { ca: 'Tecnologia i pantalles', en: 'Technology and screens' },
      intro: { ca: 'Explora, practica amb les targetes i completa les frases (80 %).', en: 'Explore, practise with the cards and complete the sentences (80 %).' },
      receptive: 'livestream · subscribers · highlights',
      core: { beginners: ['watch videos', 'take photos', 'chat with friends', 'send a message'], insecure: ['watch videos', 'play online', 'chat with friends', 'take photos', 'record a video', 'send a message'], safe: ['watch videos', 'play online', 'chat with friends', 'take photos', 'record a video', 'send a message', 'upload a video', 'follow a channel', 'download an app', 'search online', 'check a website', 'screen time', 'social media'], daring: ['watch videos', 'play online', 'chat with friends', 'take photos', 'record a video', 'send a message', 'upload a video', 'follow a channel', 'download an app', 'search online', 'check a website', 'screen time', 'social media', 'a reliable source', 'the author', 'up to date', 'an advert', 'credit a source'] },
      groups: [
        { g: 'Technology', items: [['watch videos', 'mirar vídeos', 'I watch videos about skating.'], ['play online', 'jugar en línia', 'He plays online with his cousins.'], ['chat with friends', 'xatejar amb amics', 'We chat with friends after school.'], ['take photos', 'fer fotos', 'She takes photos of her dog.'], ['record a video', 'gravar un vídeo', 'I’m recording a video for my vlog.'], ['send a message', 'enviar un missatge', 'Send me a message when you arrive.']] },
        { r: 'safe', g: 'Online (Safe)', items: [['upload a video', 'pujar un vídeo', 'We upload a video every Sunday.'], ['follow a channel', 'seguir un canal', 'I follow a climbing channel.'], ['download an app', 'descarregar una app', 'Download the app to see the results.'], ['search online', 'buscar en línia', 'Search online for the club’s website.'], ['check a website', 'consultar una web', 'Check the website for the times.'], ['screen time', 'temps de pantalla', 'My screen time is two hours a day.'], ['social media', 'xarxes socials', 'The club is on social media.']] },
        { r: 'daring', g: 'Sources (Daring)', items: [['a reliable source', 'una font fiable', 'A museum website is a reliable source.'], ['the author', 'l’autor/a', 'Who is the author of this page?'], ['up to date', 'actualitzat', 'The dates are up to date.'], ['an advert', 'un anunci', 'This page is an advert for a shop.'], ['credit a source', 'citar una font', 'Credit your sources on the last slide.']] }
      ],
      review: [
        { g: 'Learning Path 3', items: [['right now', 'ara mateix', 'Right now I’m at home.'], ['usually', 'normalment', 'I usually play on Saturdays.']] },
        { r: 'safe', g: 'Learning Path 3', items: [['practise', 'practicar', 'I practise every day.']] }
      ],
      practice: [
        { q: 'I ___ videos about skateboarding every evening. (mirar)', a: ['watch'] },
        { q: 'She ___ photos of her cat for her vlog. (fer)', a: ['takes'] },
        { q: 'Can you ___ me a message later? (enviar)', a: ['send'] },
        { q: 'We ___ with friends in a class group. (xatejar)', a: ['chat'] },
        { q: 'I’m ___ a video for my vlog right now. (gravar)', a: ['recording'] },
        { r: 'insecure', q: 'He ___ online with his cousins at the weekend. (jugar)', a: ['plays'] },
        { r: 'safe', q: 'I ___ a skating channel with 2 million subscribers. (seguir)', a: ['follow'] },
        { r: 'safe', q: 'Please ___ the website before you go: it says the pool is closed. (consultar)', a: ['check'] },
        { r: 'safe', q: 'My ___ time is too high: three hours a day!', a: ['screen'] },
        { r: 'safe', q: 'We ___ our video to the club channel on Sundays. (pujar)', a: ['upload'] },
        { r: 'daring', q: 'Is this page ___ ___ date? It says “2019”.', a: ['up to'] },
        { r: 'daring', q: 'This page is not information: it’s an ___ for trainers.', a: ['advert', 'advertisement', 'ad'] }
      ] },
    { id: 'read', type: 'mc', tab: 'Reading', title: 'Reading: Can you trust this page?', pill: '80 %',
      intro: { ca: 'Aquest text t’explica com saber si una pàgina web és fiable. Llegeix-lo i respon.', en: 'This text explains how to know if a web page is reliable. Read it and answer.' },
      media: { text: {
        beginners: '<p>You want facts for your vlog. Before you use a web page, ask four questions.</p><p><strong>1. Who is the author?</strong> Look for a name: a club, a museum, a school. No name? Be careful.</p><p><strong>2. When is it from?</strong> Look for a date. Old pages have old information.</p><p><strong>3. Why is it there?</strong> Some pages inform you. Other pages want your money: a shop says “the best skateboard in the world”.</p><p><strong>4. What type of website is it?</strong> An official website or an encyclopedia is better than a video with no sources.</p><p>At the end of your vlog, credit your source and your photos: the title, the website and the year.</p><p class="tiny"><strong>Paraules:</strong> author = autor/a · be careful = ves amb compte · date = data · money = diners · credit = cita · source = font</p>',
        insecure: '<p>You want facts about your hobby for your vlog. Before you use a web page, ask four questions.</p><p><strong>1. Who is the author?</strong> Look for a name or an organisation: a sports club, a museum, a school, an official website. No name? Be careful.</p><p><strong>2. When is it from?</strong> Look for a date. Old pages can have old information: the price of a ticket, the time of a class, the rules of a sport.</p><p><strong>3. Why is it there?</strong> Some pages inform you. Other pages want to sell you something: trainers, a game, a course. A shop says “the best skateboard in the world” because it wants your money.</p><p><strong>4. What type of website is it?</strong> An official website, an encyclopedia or a club website is usually better than a social media post or a video with no sources.</p><p>Use two pages for each fact. At the end of your vlog, credit your sources and your photos: the title of the page, the website and the year.</p>',
        safe: '<p>You want facts about your hobby or event for your vlog. Before you use a web page, ask four questions.</p><p><strong>1. Who is the author?</strong> Look for a name or an organisation: a sports federation, a museum, a school, an official tourism website. If you can’t find who wrote it, be careful: anyone can publish online.</p><p><strong>2. When was it written or updated?</strong> Look for a date. Old pages can have old information: ticket prices, class times, the rules of a sport, the date of a festival.</p><p><strong>3. Why was it written?</strong> Some pages want to inform you. Others want to sell you something, like trainers, a game or a course, or they just want lots of views. A shop says “the best skateboard in the world” because it wants your money, not because it is true.</p><p><strong>4. What type of website is it?</strong> An official website, an encyclopedia with references or a club website is usually more reliable than a social media post or a short video with no sources.</p><p>Check each fact in two pages. If they don’t agree, choose the more reliable one. At the end of your vlog, credit your sources and your photos: the title of the page, the website and the year. Don’t copy sentences: take notes with key words and write your own sentences.</p>',
        daring: '<p>You want facts about your hobby or event for your vlog, and you want them to be correct. Before you use a web page, ask four questions.</p><p><strong>1. Who is the author?</strong> Look for a name or an organisation whose job is to inform: a sports federation, a museum, a school, an official tourism website. If no author or organisation is given, be careful: anyone can publish anything online.</p><p><strong>2. When was it written or updated?</strong> Look for a date. Old pages often contain old information: ticket prices, class times, the rules of a sport or the date of a festival change, so a page from 2019 may be wrong today.</p><p><strong>3. Why was it written?</strong> Some pages are written to inform; others are written to sell you something, like trainers, a game or a course, or simply to get as many views as possible. A shop that says “the best skateboard in the world” wants your money, so its opinion is not a fact.</p><p><strong>4. What type of website is it?</strong> An official website, an encyclopedia with references or a club website is usually more reliable than a social media post or a short video with no sources, because somebody checks the information before it is published.</p><p>Confirm each fact in two pages, and if they disagree, choose the more reliable one or say that they disagree. At the end of your vlog, credit your sources and your photos: the title of the page, the website and the year. Never copy whole sentences: take notes with key words and then write your own sentences.</p>'
      } },
      items: [
        { q: 'What should you look for first?', o: ['the author', 'the photos', 'the colours of the page'], h: 'Mira la pregunta 1.' },
        { q: 'Why is the date important?', o: ['Old pages can have old information.', 'New pages are always wrong.', 'Dates are difficult to read.'], h: 'Mira la pregunta 2.' },
        { q: 'Why does a shop say “the best skateboard in the world”?', o: ['because it wants your money', 'because it is true', 'because it is a museum'], h: 'Mira la pregunta 3.' },
        { q: 'Which type of website is usually more reliable?', o: ['an official website', 'a social media post', 'a video with no sources'], h: 'Mira la pregunta 4.' },
        { r: 'insecure', q: 'How many pages do you need for each fact?', o: ['two', 'one', 'five'], h: 'Mira l’últim paràgraf.' },
        { q: 'What do you credit at the end of your vlog?', o: ['your sources and your photos', 'your friends', 'your screen time'], h: 'Mira l’últim paràgraf.' },
        { r: 'safe', q: 'What should you do if two pages don’t agree?', o: ['Choose the more reliable one.', 'Use the first one you found.', 'Use a social media post.'] },
        { r: 'safe', q: 'Why shouldn’t you copy sentences?', o: ['You should take notes and write your own sentences.', 'Copying is faster.', 'Sentences are too long.'] },
        { r: 'daring', q: 'Why is an encyclopedia with references usually more reliable than a short video?', o: ['Somebody checks the information before it is published.', 'It has more photos.', 'It is longer.'] },
        { r: 'daring', q: '“Its opinion is not a fact” means…', o: ['What the shop says is not necessarily true.', 'The shop is always right.', 'Opinions are not allowed online.'] }
      ] },
    // LS criterion 4.2: rate pages as reliable or not with reasons from the checklist (author, date, purpose, type of website).
    { id: 'sources', type: 'mc', tab: { ca: 'Fonts', en: 'Sources' }, title: { ca: 'Fiable o no fiable?', en: 'Reliable or not?' }, pill: '80 %',
      intro: { ca: 'Per a cada pàgina, tria l’opció correcta. Llegeix l’explicació després de comprovar: són les raons de la llista (autor, data, propòsit, tipus de web).', en: 'Choose for each page. Read the explanation after you check: the reasons come from the checklist (author, date, purpose, type of website).' },
      items: [
        { q: 'The Catalan Skateboarding Federation’s website: “Rules of skateboarding competitions”, updated 2026.', o: ['Reliable', 'Not reliable'], ex: { ca: 'Autor conegut (una federació), data recent, propòsit: informar.', en: 'Known author (a federation), recent date, purpose: to inform.' } },
        { q: 'A shop page: “The best skateboard in the world, only 199 €! Buy now!”', o: ['Not reliable', 'Reliable'], ex: { ca: 'Propòsit: vendre. No és informació.', en: 'Purpose: to sell. It is not information.' } },
        { q: 'A 20-second video, “5 crazy facts about football 🤯”, no author, no sources.', o: ['Not reliable', 'Reliable'], ex: { ca: 'Sense autor ni fonts, fet per tenir visualitzacions.', en: 'No author, no sources, made for views.' } },
        { q: 'An encyclopedia article about basketball, with references, updated this year.', o: ['Reliable', 'Not reliable'], ex: { ca: 'Tipus de web: enciclopèdia amb referències, data recent.', en: 'Type of website: an encyclopedia with references, recent date.' } },
        { r: 'insecure', q: 'A forum answer from 2015: “The swimming pool opens at 9 every day.”', o: ['Not reliable', 'Reliable'], ex: { ca: 'Antic i anònim: els horaris canvien.', en: 'Old and anonymous: opening times change.' } },
        { q: 'The town council’s website: “Autumn Fun Run 2026: date, place and tickets”.', o: ['Reliable', 'Not reliable'], ex: { ca: 'Font oficial, informació actual.', en: 'An official source with current information.' } },
        { r: 'safe', q: 'A famous player’s social media post: “Our match is on Sunday at 6, come!”', o: ['Reliable for the time of the match, but check the rest', 'Not reliable for anything'], ex: { en: 'The author knows the match, but a post is not a source for facts about the sport.' } },
        { r: 'daring', q: 'A blog called “Skate Life” by a 15-year-old fan, no dates, no sources.', o: ['Not reliable: no dates or sources, even if the author loves skating', 'Reliable: the author is a real skater'], ex: { en: 'Loving a hobby is not the same as checking facts; no dates, no sources.' } }
      ] },
    { id: 'credit', type: 'mc', tab: { ca: 'Crèdits', en: 'Credits' }, title: { ca: 'Cita les fonts i les fotos', en: 'Credit your sources and photos' }, pill: '80 %',
      intro: { ca: 'Ordre: <strong>"Títol de la pàgina", web, any.</strong> Per a una foto: <strong>Photo: nom o web.</strong> Exemple: <em>"Rules of skateboarding competitions", Catalan Skateboarding Federation, 2026.</em>', en: 'Order: <strong>"Title of the page", website, year.</strong> For a photo: <strong>Photo: name or website.</strong> Example: <em>"Rules of skateboarding competitions", Catalan Skateboarding Federation, 2026.</em>' },
      items: [
        { q: 'Which credit line is in the right order?', o: ['"Basketball", Encyclopedia website, 2026.', '2026, Basketball, Encyclopedia website.', 'Encyclopedia website Basketball 2026'] },
        { q: 'Which credit line is complete?', o: ['"Autumn Fun Run 2026", Town council website, 2026.', '"Autumn Fun Run 2026".', 'I found it on the internet.'] },
        { q: 'Which is the right way to credit a photo you did not take?', o: ['Photo: Marta Vila (Climb Up Club).', 'No credit: it is only a photo.', 'Photo: me.'] },
        { r: 'safe', q: 'Where do the credits go in your vlog?', o: ['on the last slide', 'on the first slide', 'nowhere'] }
      ] },
    { id: 'again', type: 'mc', tab: { ca: 'Escolta una font', en: 'Listen to a source' }, title: { ca: 'Escolta: fets o opinions?', en: 'Listen: facts or opinions?' }, pill: { ca: 'Ràdio · 80 %', en: 'Radio · 80 %' },
      intro: { ca: 'Escolta la ràdio de l’LP2 com un investigador: qui parla, quins fets dona i què és opinió.', en: 'Listen to the LP2 radio like a researcher: who is speaking, what facts do they give and what is opinion?' },
      media: { audio: 'audio/live-from-the-sports-hall.mp3', title: 'Live from the sports hall', script: [
        ['Emma', '[excited] Hello and welcome to School Radio! We’re at the sports hall and the big match is starting: the Blue Team against the Green Team. Sam, what’s happening?'],
        ['Sam', 'Well, Emma, the Blue Team is wearing their new white uniform and the Green Team is wearing green T-shirts and black shorts. The players are warming up and the crowd is cheering. It’s very noisy in here!'],
        ['Emma', 'It’s cold and rainy outside, but inside it’s hot. There are about two hundred students watching. [laughs] Some of them are eating sandwiches!'],
        ['Sam', 'And the match is starting! Number seven, Marc, has the ball. He’s running… he’s jumping… and he scores! Two points for the Blue Team!'],
        ['Emma', 'Marc usually plays as a defender, but today he’s playing as a forward. And it’s working!'],
        ['Sam', 'Now the Green Team has the ball. Their captain, Júlia, is passing to number four… she’s shooting… and she misses. The Blue Team is winning, six to two.'],
        ['Emma', 'What a match! It’s half-time now. The players are drinking water and the coach is talking to the team. We’ll be back in ten minutes. Don’t go away!']] },
      chunks: ['There are about two hundred students watching', 'The Blue Team is winning'],
      items: [
        { q: 'Who is speaking?', o: ['two reporters from School Radio', 'two players', 'the coach'], h: 'Escolta el principi: “welcome to…”.' },
        { q: 'Where are they?', o: ['at the sports hall', 'at the park', 'in the radio studio'], h: 'Escolta “We’re at the…”.' },
        { q: 'Which one is a fact?', o: ['The Blue Team is winning six to two.', 'What a match!', 'It’s working!'], h: 'Un fet es pot comprovar, per exemple un resultat.' },
        { q: 'Which one is an opinion?', o: ['What a match!', 'It’s half-time now.', 'Marc has the ball.'], h: 'Una opinió diu què pensa algú.' },
        { q: 'How many students are watching?', o: ['about two hundred', 'about twenty', 'about two thousand'], h: 'Escolta “There are about…”.' },
        { r: 'insecure', q: 'Is this a good source for what is happening in the match?', o: ['Yes: the reporters are there and see it live.', 'No: radio is never right.', 'No: they don’t talk about the match.'], h: 'Pensa: on són els periodistes?' },
        { r: 'safe', q: 'Why does Emma say “about two hundred students”?', o: ['She didn’t count them exactly.', 'There are exactly two hundred.', 'She has no idea of the number.'] },
        { r: 'safe', q: 'You want to put the final score in your fact file. What should you do?', o: ['Check it in another source: the match isn’t finished.', 'Write six to two: it’s the final score.', 'Never write scores in a fact file.'] },
        { r: 'daring', q: 'Why is a live radio report good for some facts but not for others?', o: ['It’s good for what is happening now, but it mixes facts and opinions and the match isn’t finished.', 'It’s never good because the reporters are students.', 'It’s good for everything because it’s live.'] },
        { r: 'daring', q: 'What do you need to add to use this report in your fact file?', o: ['the name of the source and the date', 'the reporters’ favourite team', 'nothing: radio doesn’t need a credit'] }
      ] },
    { id: 'shadow', type: 'shadow', tab: { ca: 'Shadowing', en: 'Shadowing' }, title: { ca: 'Shadowing · Live from the sports hall', en: 'Shadowing · Live from the sports hall' }, pill: '3 ×',
      intro: { ca: 'Repeteix un tros de l’escolta just darrere de la veu, com una ombra.', en: 'Repeat part of the listening just behind the speaker, like a shadow.' },
      clip: { title: 'Live from the sports hall', src: 'audio/live-from-the-sports-hall.mp3', slow: 'audio/live-from-the-sports-hall-slow.mp3', t: [37.04, 69.96], ts: [42.83, 80.96], lines: [
        ['Sam', 'And the match is starting! Number seven, Marc, has the ball. He’s running… he’s jumping… and he scores! Two points for the Blue Team!'],
        ['Emma', 'Marc usually plays as a defender, but today he’s playing as a forward. And it’s working!'],
        ['Sam', 'Now the Green Team has the ball. Their captain, Júlia, is passing to number four… she’s shooting… and she misses. The Blue Team is winning, six to two.']] } },
    { id: 'talk', type: 'talk', tab: { ca: 'Conversa', en: 'Talk' }, title: { ca: 'Conversa: d’on ho has tret?', en: 'Talk: where did you find it?' },
      intro: { ca: 'El teu company de vlog et pregunta per la font de la teva fitxa.', en: 'Your vlog buddy asks you about the source for your fact file.' },
      task: { beginners: 'Respon amb frases curtes: el nom de la web, qui l’ha escrit i si és fiable.', insecure: 'Respon amb frases completes sobre la teva font: el nom, qui l’ha escrit, la data i si és fiable.', safe: 'Answer about your real source. Give reasons: who wrote it, when, and one fact you found.', daring: 'Answer about your real source, give reasons and say how you checked a fact in a second source.' },
      partner: [
        { q: 'Which website did you use?', ca: 'Quina web has fet servir?' },
        { q: 'Who wrote it?', ca: 'Qui l’ha escrit?' },
        { q: 'Is it a good source? Why?', ca: 'És una bona font? Per què?' },
        { r: 'insecure', q: 'Is the information new or old?', ca: 'La informació és nova o vella?' },
        { r: 'safe', q: 'What is one interesting fact from your source?' },
        { r: 'safe', q: 'How are you going to credit it in your vlog?' },
        { r: 'daring', q: 'Did you check that fact on another website?' }
      ],
      model: { beginners: 'I used the Encyclopedia website. An expert wrote it. Yes, it is a good source.', insecure: 'I used the Encyclopedia website. An expert wrote it. The information is from 2025. I think it is a good source because it gives dates and names.', safe: 'I used an online encyclopedia about skateboarding. An expert wrote the article and it’s from 2025, so it’s quite new. It’s a good source because it has dates, names and its own sources. One interesting fact is that skateboarding started in California in the 1950s. I’m going to write the name of the website and the date on my last slide.', daring: 'I used an online encyclopedia article about skateboarding. It was written by a sports journalist and updated in 2025, so it’s recent. I think it’s reliable because it gives dates and links to its sources, and it doesn’t try to sell anything. One interesting fact is that skateboarding started in California in the 1950s, when surfers wanted to “surf” on the street. I checked it on a second website, the Olympics page, and it said the same. I’ll credit both on my last slide.' } },
    // Piece 3 and the evidence for LS criteria 4.2 (two pages rated with two reasons, one chosen) and 6.2 (fact file: Insecure four facts from one given source;
    // Safe and Daring two sources; photos and sources credited). A step, so the teacher sees it; also saved as piece 3 of the final product.
    { id: 'factfile', type: 'step', product: 3, tab: { ca: 'Fitxa', en: 'Fact file' }, title: { ca: 'Peça 3: la meva fitxa de dades', en: 'Piece 3: my fact file' }, pill: { ca: 'Ho veu el professor', en: 'Your teacher sees it' },
      intro: { ca: 'Omple la fitxa sobre la teva afició o esdeveniment i entrega-la. Notes curtes amb paraules clau. A les rutes Beginners i Insecure fas servir la font que et donem aquí sota (Beginners: dues dades; Insecure: quatre); a Safe i Daring busques dues pàgines.', en: 'Fill in the fact file about your hobby or event and hand it in. Short notes with key words. Safe and Daring: find two web pages or posts, rate both and choose one.' },
      html: { ca: '<div class="model"><strong>La teva font (rutes Beginners i Insecure):</strong> demana al professor la fitxa de la teva afició o fes servir la pàgina oficial de la federació o del club. Si no en tens cap, fes servir aquesta: <em>"Skateboarding", Encyclopedia website, 2026: skateboarding starts in California in the 1950s · a skateboard has four wheels and a deck · it is an Olympic sport since 2021 · skaters wear a helmet and knee pads.</em><br><strong>És fiable?</strong> Dues raons de la llista: qui l’ha escrita (autor), de quan és (data), per a què (informar / vendre), quin tipus de web és.</div><div class="model"><strong>Exemple de frase:</strong> <em>Reliable: the author is an encyclopedia and the date is 2026.</em> · <em>Not reliable: it is a shop and it wants to sell trainers.</em></div>',
        en: '<div class="model"><strong>Is it reliable?</strong> Use the four questions from the text: who is the author, when is it from, why was it written (to inform / to sell / to get views) and what type of website it is.<br><strong>Model:</strong> <em>Reliable: the author is a sports federation and it was updated in 2026.</em> · <em>Not reliable: it is a shop page that wants to sell skateboards, and there is no date.</em></div>' },
      fields: [
        { id: 'topic', label: { ca: 'La meva afició o esdeveniment', en: 'My hobby or event' }, ph: 'e.g. skateboarding · the school basketball tournament', rows: 1 },
        { id: 's1', label: { ca: 'Font 1: referència ("Títol", web, any)', en: 'Page 1: credit line ("Title", website, year)' }, ph: '"Title", website, year.', rows: 1 },
        { id: 'r1', label: { ca: 'Font 1: és fiable? Dues raons de la llista (autor, data, propòsit, tipus de web)', en: 'Page 1: reliable or not? Two reasons from the checklist (author, date, purpose, type of website)' }, rows: 2 },
        { r: 'safe', id: 's2', label: 'Page 2: credit line ("Title", website, year)', ph: '"Title", website, year.', rows: 1 },
        { r: 'safe', id: 'r2', label: 'Page 2: reliable or not? Two reasons from the checklist', rows: 2 },
        { r: 'safe', id: 'choose', label: 'Which page will you use for your vlog, and why?', rows: 1 },
        { id: 'f1', label: { ca: 'Dada 1 (paraules clau)', en: 'Fact 1 (key words)' }, rows: 1 },
        { id: 'f2', label: { ca: 'Dada 2', en: 'Fact 2' }, rows: 1 },
        { r: 'insecure', id: 'f3', label: { ca: 'Dada 3', en: 'Fact 3' }, rows: 1 },
        { r: 'insecure', id: 'f4', label: { ca: 'Dada 4', en: 'Fact 4' }, rows: 1 },
        { r: 'daring', id: 'agree', label: 'Do your two pages agree? If not, which one do you trust, and why?', rows: 2 },
        { id: 'photos', label: { ca: 'Les meves fotos: d’on són? (Photo: jo / nom / web)', en: 'My photos: where are they from? (Photo: me / name / website)' }, rows: 2 }
      ],
      rate: {
        beginners: ['Tinc dues dades de la font donada', 'Dono una raó o dues per dir si la font és fiable', 'Sé d’on és cada foto'],
        insecure: ['Tinc quatre dades de la meva font', 'Dono dues raons per dir si la font és fiable', 'Les notes són paraules clau, no frases copiades', 'Sé d’on és cada foto'],
        safe: ['I have two pages, each rated with two reasons, and I chose one', 'I have four facts in key words from my chosen page', 'My credit lines are complete', 'I know where every photo comes from'],
        daring: ['I have two pages, each rated with two precise reasons, and I chose one', 'I have four facts and I checked whether my pages agree', 'My credit lines are complete', 'I know where every photo comes from']
      } }
  ]
};
