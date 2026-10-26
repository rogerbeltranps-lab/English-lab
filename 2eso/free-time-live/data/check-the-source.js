/* 2 ESO · LS2 Free Time, Live! · Learning Path 4 · Check the source (LS criteria 4.2 and 6.2; term 2, before the final product) */
window.LP = {
  key: 'ls2Source2ESO', n: 4, title: 'Check the source',
  panels: [
    { id: 'recall', type: 'recall', tab: 'Recall', title: { ca: 'Recall: Learning Paths 2 i 3', en: 'Recall: Learning Paths 2 and 3' }, pill: { ca: 'Sense apunts', en: 'No notes' },
      intro: { ca: 'Escriu les respostes sense mirar res.', en: 'Type the answers without looking.' },
      items: [
        { q: 'I usually play tennis, but today I ___ (play) basketball.', a: ['am playing', "'m playing"], ca: 'today → ara.', en: 'today → now.' },
        { q: 'Look! It ___ (snow).', a: ['is snowing', "'s snowing"] },
        { q: 'Write the -ing form: sit → ___', a: ['sitting'] },
        { q: 'At the ___ she’s training for a show. (en aquest moment)', a: ['moment'] },
        { q: 'It’s cold. Wear a ___ and gloves. (jaqueta)', a: ['jacket'] },
        { q: 'He ___ (not / like) cold weather.', a: ["doesn't like", 'does not like'] },
        { q: 'What ___ you doing right now?', a: ['are'] },
        { r: 'safe', q: 'I ___ (want) a new bike. (state verb, now)', a: ['want'] },
        { r: 'safe', q: 'Our team is in a ___ with 12 teams.', a: ['tournament'] },
        { r: 'daring', q: 'This month I ___ (train) for a race.', a: ['am training', "'m training"] },
        { r: 'daring', q: 'I ___ (prefer) skating to cycling.', a: ['prefer'] }
      ] },
    { id: 'vocab', type: 'vocab', tab: { ca: 'Vocabulari', en: 'Vocabulary' }, title: { ca: 'Tecnologia i pantalles', en: 'Technology and screens' },
      intro: { ca: 'Explora, practica amb les targetes i completa les frases (80 %).', en: 'Explore, practise with the cards and complete the sentences (80 %).' },
      receptive: 'livestream · subscribers · highlights',
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
        { q: 'He ___ online with his cousins at the weekend. (jugar)', a: ['plays'] },
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
        insecure: '<p>You want facts about your hobby for your vlog. Before you use a web page, ask four questions.</p><p><strong>1. Who is the author?</strong> Look for a name or an organisation: a sports club, a museum, a school, an official website. No name? Be careful.</p><p><strong>2. When is it from?</strong> Look for a date. Old pages can have old information: the price of a ticket, the time of a class, the rules of a sport.</p><p><strong>3. Why is it there?</strong> Some pages inform you. Other pages want to sell you something: trainers, a game, a course. A shop says “the best skateboard in the world” because it wants your money.</p><p><strong>4. What type of website is it?</strong> An official website, an encyclopedia or a club website is usually better than a social media post or a video with no sources.</p><p>Use two pages for each fact. At the end of your vlog, credit your sources and your photos: the title of the page, the website and the year.</p>',
        safe: '<p>You want facts about your hobby or event for your vlog. Before you use a web page, ask four questions.</p><p><strong>1. Who is the author?</strong> Look for a name or an organisation: a sports federation, a museum, a school, an official tourism website. If you can’t find who wrote it, be careful: anyone can publish online.</p><p><strong>2. When was it written or updated?</strong> Look for a date. Old pages can have old information: ticket prices, class times, the rules of a sport, the date of a festival.</p><p><strong>3. Why was it written?</strong> Some pages want to inform you. Others want to sell you something, like trainers, a game or a course, or they just want lots of views. A shop says “the best skateboard in the world” because it wants your money, not because it is true.</p><p><strong>4. What type of website is it?</strong> An official website, an encyclopedia with references or a club website is usually more reliable than a social media post or a short video with no sources.</p><p>Check each fact in two pages. If they don’t agree, choose the more reliable one. At the end of your vlog, credit your sources and your photos: the title of the page, the website and the year. Don’t copy sentences: take notes with key words and write your own sentences.</p>',
        daring: '<p>You want facts about your hobby or event for your vlog, and you want them to be correct. Before you use a web page, ask four questions.</p><p><strong>1. Who is the author?</strong> Look for a name or an organisation whose job is to inform: a sports federation, a museum, a school, an official tourism website. If no author or organisation is given, be careful: anyone can publish anything online.</p><p><strong>2. When was it written or updated?</strong> Look for a date. Old pages often contain old information: ticket prices, class times, the rules of a sport or the date of a festival change, so a page from 2019 may be wrong today.</p><p><strong>3. Why was it written?</strong> Some pages are written to inform; others are written to sell you something, like trainers, a game or a course, or simply to get as many views as possible. A shop that says “the best skateboard in the world” wants your money, so its opinion is not a fact.</p><p><strong>4. What type of website is it?</strong> An official website, an encyclopedia with references or a club website is usually more reliable than a social media post or a short video with no sources, because somebody checks the information before it is published.</p><p>Confirm each fact in two pages, and if they disagree, choose the more reliable one or say that they disagree. At the end of your vlog, credit your sources and your photos: the title of the page, the website and the year. Never copy whole sentences: take notes with key words and then write your own sentences.</p>'
      } },
      items: [
        { q: 'What should you look for first?', o: ['the author', 'the photos', 'the colours of the page'], h: 'Mira la pregunta 1.' },
        { q: 'Why is the date important?', o: ['Old pages can have old information.', 'New pages are always wrong.', 'Dates are difficult to read.'], h: 'Mira la pregunta 2.' },
        { q: 'Why does a shop say “the best skateboard in the world”?', o: ['because it wants your money', 'because it is true', 'because it is a museum'], h: 'Mira la pregunta 3.' },
        { q: 'Which type of website is usually more reliable?', o: ['an official website', 'a social media post', 'a video with no sources'], h: 'Mira la pregunta 4.' },
        { q: 'How many pages do you need for each fact?', o: ['two', 'one', 'five'], h: 'Mira l’últim paràgraf.' },
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
        { q: 'A forum answer from 2015: “The swimming pool opens at 9 every day.”', o: ['Not reliable', 'Reliable'], ex: { ca: 'Antic i anònim: els horaris canvien.', en: 'Old and anonymous: opening times change.' } },
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
    // Piece 3 and the evidence for LS criteria 4.2 (two pages rated with two reasons, one chosen) and 6.2 (fact file: Insecure four facts from one given source;
    // Safe and Daring two sources; photos and sources credited). A step, so the teacher sees it; also saved as piece 3 of the final product.
    { id: 'factfile', type: 'step', product: 3, tab: { ca: 'Fitxa', en: 'Fact file' }, title: { ca: 'Peça 3: la meva fitxa de dades', en: 'Piece 3: my fact file' }, pill: { ca: 'Ho veu el professor', en: 'Your teacher sees it' },
      intro: { ca: 'Omple la fitxa sobre la teva afició o esdeveniment i entrega-la. Notes curtes amb paraules clau. A la ruta Insecure fas servir la font que et donem aquí sota; a Safe i Daring busques dues pàgines.', en: 'Fill in the fact file about your hobby or event and hand it in. Short notes with key words. Safe and Daring: find two web pages or posts, rate both and choose one.' },
      html: { ca: '<div class="model"><strong>La teva font (ruta Insecure):</strong> demana al professor la fitxa de la teva afició o fes servir la pàgina oficial de la federació o del club. Si no en tens cap, fes servir aquesta: <em>"Skateboarding", Encyclopedia website, 2026: skateboarding starts in California in the 1950s · a skateboard has four wheels and a deck · it is an Olympic sport since 2021 · skaters wear a helmet and knee pads.</em><br><strong>És fiable?</strong> Dues raons de la llista: qui l’ha escrita (autor), de quan és (data), per a què (informar / vendre), quin tipus de web és.</div><div class="model"><strong>Exemple de frase:</strong> <em>Reliable: the author is an encyclopedia and the date is 2026.</em> · <em>Not reliable: it is a shop and it wants to sell trainers.</em></div>',
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
        { id: 'f3', label: { ca: 'Dada 3', en: 'Fact 3' }, rows: 1 },
        { id: 'f4', label: { ca: 'Dada 4', en: 'Fact 4' }, rows: 1 },
        { r: 'daring', id: 'agree', label: 'Do your two pages agree? If not, which one do you trust, and why?', rows: 2 },
        { id: 'photos', label: { ca: 'Les meves fotos: d’on són? (Photo: jo / nom / web)', en: 'My photos: where are they from? (Photo: me / name / website)' }, rows: 2 }
      ],
      rate: {
        insecure: ['Tinc quatre dades de la meva font', 'Dono dues raons per dir si la font és fiable', 'Les notes són paraules clau, no frases copiades', 'Sé d’on és cada foto'],
        safe: ['I have two pages, each rated with two reasons, and I chose one', 'I have four facts in key words from my chosen page', 'My credit lines are complete', 'I know where every photo comes from'],
        daring: ['I have two pages, each rated with two precise reasons, and I chose one', 'I have four facts and I checked whether my pages agree', 'My credit lines are complete', 'I know where every photo comes from']
      } }
  ]
};
