/* 2 ESO · LS2 · Final product: Free Time Vlog (from the 2 ESO programme). Individual vlog (Roger, 25 Oct 2026); a same-route vlog buddy shares research
   and gives feedback, nothing is marked in pairs. The video goes to Google Classroom; the script is pasted in step 3, so it is in the teacher's marking PDF.
   Marked by the teacher in two rounds (docs/2eso/ls2-free-time-live/final-product-assessment.md). */
(function () {
  const pieceNames = { 1: 'Piece 1 · In this photo…', 2: 'Piece 2 · Usually… but today…', 3: 'Piece 3 · Fact file', 4: 'Piece 4 · Likes and screen tips', 5: 'Piece 5 · Vlog script' };
  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const pieces = level => {
    let all = {}; try { all = JSON.parse(localStorage.getItem('ls2Products2ESO') || '{}'); } catch (e) {}
    const ca = level === 'insecure' || level === 'beginners';
    return [1, 2, 3, 4, 5].map(n => '<div class="mini-card" style="margin:10px 0"><strong>' + pieceNames[n] + '</strong>' +
      (all[n] ? '<p class="tiny">' + (ca ? 'Desada el ' : 'Saved on ') + new Date(all[n].date).toLocaleDateString() + '</p><div class="model" style="white-space:pre-wrap;font-weight:500">' + esc(all[n].text) + '</div>'
        : '<p class="tiny">' + (ca ? 'Encara no l’has desada al Learning Path corresponent.' : 'Not saved yet in its Learning Path.') + '</p>') + '</div>').join('');
  };
  // First section of the final product: the model vlog for the student's route (a fictional student's slides and script).
  const modelBox = level => {
    // Beginners has no model page of its own yet: it opens the Insecure one.
    const ca = level === 'insecure' || level === 'beginners', page = (level === 'beginners' ? 'insecure' : level) + '-model.html', R = level === 'beginners' ? 'Beginners (model Insecure)' : level[0].toUpperCase() + level.slice(1);
    return '<div class="model" style="margin-bottom:16px"><h3 style="margin-top:0">' + (ca ? 'Mira un model de vlog · ' : 'See a model vlog · ') + R + '</h3><p>' +
      (ca ? 'Una alumna inventada presenta el seu vlog: les diapositives i el que diu a cada una. Fes-lo servir per tenir idees; no el copiïs.' : 'A fictional student presents her vlog: the slides and what she says on each one. Use it for ideas; do not copy it.') +
      '</p><a class="btn" href="' + page + '" target="_blank" rel="noopener noreferrer" style="display:inline-block;text-decoration:none">' + (ca ? '▶ Obre el model ↗' : '▶ Open the model ↗') + '</a></div>';
  };
  window.LP = {
    key: 'ls2FinalProduct2ESO', n: 7, title: 'Free Time Vlog',
    panels: [
      { id: 'task', type: 'info', tab: { ca: 'La tasca', en: 'The task' }, title: { ca: 'Producte final: Free Time Vlog', en: 'Final product: Free Time Vlog' },
        html: level => modelBox(level) + ({
          ca: '<p>Fes un <strong>vlog d’1,5–2 minuts</strong> sobre la teva afició o un esdeveniment de temps lliure: un vídeo amb <strong>Google Slides i la teva cara en picture-in-picture</strong>, amb veu clara. Presenta què fa la gent a cada foto i què fa normalment, digues què t’agrada i dona consells de pantalla. Cita les fotos i la font a l’última diapositiva.</p><p><strong>Procés:</strong> tria l’afició o l’esdeveniment → busca dades (la teva font) → guió → Google Slides → grava → mira la primera gravació i millora una part → entrega.</p><p><strong>Beginners:</strong> presenta la teva afició amb fotos i frases molt curtes seguint la pauta: una frase amb <em>is / are + -ing</em> per a “ara” i una amb <em>usually</em>; dues dades de la font donada; dos consells de pantalla del model. El vlog pot durar 1–1,5 minuts.</p><p><strong>Insecure:</strong> presenta la teva afició o esdeveniment amb fotos: què fa la gent a cada foto (<em>In this photo, they’re…</em>) i què fa normalment (<em>They usually…</em>), amb frases curtes i la pauta; quatre dades d’una font; dos consells de pantalla amb imperatius. Guió amb pauta i model.</p><p><strong>Com treballes:</strong> el vlog és <strong>individual</strong>. Tens un <strong>company de vlog</strong> de la teva mateixa ruta (el professor us aparella): busqueu dades junts, us ajudeu amb les diapositives i us doneu feedback del primer vídeo. Res no es puntua en parella. A cada pas, entregues aquí una tasca, t’autoavalues i pots deixar un comentari al professor.</p><h3>El que es demana a la ruta Beginners</h3><ul><li>set diapositives curtes seguint la pauta: salutació · ara · normalment · foto · m’agrada · dos consells · crèdits</li><li>una frase amb <em>is / are + -ing</em> (ara) i una amb <em>usually</em> (normalment)</li><li><em>I love / I don’t like + -ing</em></li><li>dues dades de la font donada i les fotos citades a l’última diapositiva</li><li>es veu la teva cara i les diapositives; veu clara; una part millorada després de la primera gravació</li><li>vídeo d’1–1,5 minuts</li></ul><h3>El que es demana a la ruta Insecure</h3><ul><li>set diapositives: salutació · ara · normalment · foto · m’agrada · dos consells · crèdits</li><li>Present Continuous per a “ara” i la foto; Present Simple amb <em>usually</em></li><li><em>I love / like / don’t like + -ing</em></li><li>quatre dades d’una font i les fotos citades a l’última diapositiva</li><li>es veu la teva cara i les diapositives; veu clara; una part millorada després de la primera gravació; un error o una pausa llarga tallats</li></ul><h3>Què compta a l’avaluació final?</h3><p>Nota de la LS: examen final 35 % · producte final 25 % · activitats de gramàtica i vocabulari 20 % · altres competències 20 %.</p><ul><li><strong>El meu vlog · 40 %:</strong> planificat, gravat i revisat; contrast ara / normalment; es veuen la cara i les diapositives; una part millorada després de la primera gravació · CE3.2</li><li><strong>El meu guió i les diapositives · 30 %:</strong> segueix el model, amb expressions de temps, gustos i consells amb imperatius · CE5.1</li><li><strong>La meva font · 15 %:</strong> la pàgina que tries, valorada com a fiable o no amb dues raons · CE4.2</li><li><strong>Les meves evidències · 15 %:</strong> els passos que entregues en aquesta pàgina · CE3.2</li><li><strong>Altres competències:</strong> fitxa de dades i crèdits (CE6.2); gravació i edició: un error tallat, cada foto amb el seu peu i la seva part del guió (CD2 2.2); consells de pantalla que eviten hàbits addictius i el que aplicaràs (CD4 4.5)</li></ul><p>A la pestanya <strong>Rúbrica</strong> tens el detall de cada fila.</p>',
          en: '<p>Make a <strong>1.5–2 minute vlog</strong> about your hobby or a free-time event: a video with <strong>Google Slides and your face in picture-in-picture</strong>, with a clear voice. Present what people are doing in your photos and what they usually do, say what you like and give screen-use tips. Credit your photos and sources on the last slide.</p><p><strong>Process:</strong> choose a hobby or event → research (your source) → script → Google Slides → record → watch your first recording and improve a part → submit.</p><p><strong>Safe:</strong> present your hobby or event “live”, contrasting what you usually do with what is happening now; include the weather and your clothes or equipment; three screen tips with imperatives; two sources rated and one chosen; a photo with a caption on each slide.</p><p><strong>Daring:</strong> add a short research section with facts from your source, a temporary situation (<em>This month I’m training for…</em>), opinions with state verbs (<em>I think…, I prefer… to…</em>) and three tips with a reason each, plus the one you are going to apply.</p><p><strong>How you work:</strong> the vlog is <strong>individual</strong>. You have a <strong>vlog buddy</strong> of your own route (your teacher pairs you): you research together, help each other with the slides and give feedback on each other’s first video. Nothing is marked in pairs. At each step you hand in a task here, assess yourself and can leave a comment for your teacher.</p><h3>What your route asks for</h3><p><strong>Safe:</strong></p><ul><li>seven slides: greeting · live now · usually · photo · likes · three tips · credits</li><li>Present Continuous vs Present Simple with time expressions; weather and clothes or kit</li><li><em>love / like / hate + -ing</em>; imperatives, one negative</li><li>two sources rated with two reasons, one chosen; photos and sources credited</li><li>face and slides visible; clear voice; one part improved after the first recording; a mistake or a long pause cut</li></ul><p><strong>Daring:</strong></p><ul><li>a research section with facts in your own words from two sources</li><li>a temporary situation and opinions with state verbs</li><li>three tips with reasons and the one you will apply</li><li>sentences linked with <em>and, but, because, so</em></li></ul><h3>What counts in the final assessment?</h3><p>LS mark: final exam 35 % · final product 25 % · grammar and vocabulary activities 20 % · other competences 20 %.</p><ul><li><strong>My vlog · 40 %:</strong> planned, recorded and revised; now vs usually; face and slides visible; one part improved after the first recording · CE3.2</li><li><strong>My script and slides · 30 %:</strong> follows the model, with time expressions, likes and dislikes and tips with imperatives · CE5.1</li><li><strong>My source · 15 %:</strong> the page you choose, rated reliable or not with two reasons · CE4.2</li><li><strong>My process evidence · 15 %:</strong> the steps you hand in on this page · CE3.2</li><li><strong>Other competences:</strong> fact file and credits (CE6.2); recording and editing: a mistake cut, each photo with its caption and its part of the script (CD2 2.2); screen tips that prevent addictive habits and the one you will apply (CD4 4.5)</li></ul><p>The <strong>Rubric</strong> tab has the detail of every row.</p>'
        })[level === 'insecure' || level === 'beginners' ? 'ca' : 'en'] },
      { id: 'rubric', type: 'info', tab: { ca: 'Rúbrica', en: 'Rubric' }, title: { ca: 'Com s’avalua', en: 'How it is assessed' },
        html: '<div id="rubricHost"></div>', after: level => finalRubric.render(level) },
      { id: 'prep', type: 'step', tab: { ca: 'Pas 0 · Les meves peces', en: 'Step 0 · My pieces' }, title: { ca: 'Abans de gravar: les teves peces', en: 'Before you record: your pieces' },
        intro: { ca: 'Aquí tens el que has desat a cada Learning Path en aquest dispositiu. Si en falta alguna, torna al Learning Path i fes-la. Després explica què vas canviar després del feedback.', en: 'This is what you saved in each Learning Path on this device. If one is missing, go back to its Learning Path and do it. Then explain what you changed after the feedback.' },
        html: pieces,
        check: level => { let all = {}; try { all = JSON.parse(localStorage.getItem('ls2Products2ESO') || '{}'); } catch (e) {} const ca = level === 'insecure' || level === 'beginners'; const miss = [1, 2, 3, 4, 5].filter(n => !all[n]); return miss.length ? (ca ? 'Et falten peces: ' : 'Missing pieces: ') + miss.join(', ') + (ca ? '. Fes-les al seu Learning Path abans d’entregar.' : '. Do them in their Learning Path before you hand in.') : ''; },
        fields: [
          { id: 'topic', label: { ca: 'La meva afició o esdeveniment, i el meu company de vlog', en: 'My hobby or event, and my vlog buddy' }, rows: 1 },
          { id: 'c2', label: { ca: 'Peça 2: què vas canviar després del feedback, i per què?', en: 'Piece 2: what did you change after the feedback, and why?' }, rows: 2 },
          { id: 'c5', label: { ca: 'Peça 5 (guió): què vas canviar després del feedback, i per què?', en: 'Piece 5 (script): what did you change after the feedback, and why?' }, rows: 2 }
        ],
        rate: {
          insecure: ['Tinc les cinc peces', 'He millorat els meus textos després del feedback', 'Sé de què va el meu vlog'],
          safe: ['I have all five pieces', 'I improved my texts after the feedback', 'I know what my vlog is about'],
          daring: ['I have all five pieces', 'I improved my texts after the feedback', 'I know what my vlog is about']
        } },
      { id: 'source', type: 'step', tab: { ca: 'Pas 1 · La meva font', en: 'Step 1 · My source' }, title: { ca: 'La meva font', en: 'My source' },
        intro: { ca: 'La pàgina que faràs servir al vlog (de la teva fitxa de dades). Enganxa la referència, digues si és fiable amb dues raons i copia les dades que diràs.', en: 'The page you will use in your vlog (from your fact file). Paste the credit line, say if it is reliable with two reasons, and copy the facts you will say.' },
        fields: [
          { id: 'credit', label: { ca: 'Referència: "Títol de la pàgina", web, any', en: 'Credit line: "Title of the page", website, year' }, rows: 1 },
          { id: 'why', label: { ca: 'És fiable? Dues raons de la llista (autor, data, propòsit, tipus de web)', en: 'Reliable or not? Two reasons from the checklist (author, date, purpose, type of website)' }, rows: 2 },
          { r: 'safe', id: 'other', label: 'The page you did NOT choose: why not? (one reason)', rows: 1 },
          { id: 'facts', label: { ca: 'Les dades que diré al vlog (paraules clau, amb les meves paraules)', en: 'The facts I will say in my vlog (key words, in my own words)' }, rows: 3 }
        ],
        rate: {
          beginners: ['Dono una raó o dues per dir si la font és fiable', 'Les dades són paraules clau', 'La referència és completa'],
          insecure: ['Dono dues raons per dir si la font és fiable', 'Les dades són paraules clau, no frases copiades', 'La referència és completa'],
          safe: ['I give two reasons why my source is reliable or not', 'I say why I did not choose the other page', 'My notes are in my own words and my credit line is complete'],
          daring: ['I give two precise reasons why my source is reliable or not (author, date, purpose, type of website)', 'I say why I did not choose the other page', 'My notes are in my own words and my credit line is complete']
        } },
      { id: 'slides', type: 'step', tab: { ca: 'Pas 2 · Les meves diapositives', en: 'Step 2 · My slides' }, title: { ca: 'Les meves diapositives: foto, peu i part del guió', en: 'My slides: photo, caption and script part' },
        intro: { ca: 'Planifica les set diapositives: per a cada una, quina foto hi va, el peu de foto (text curt) i quina part del guió hi dius. Així cada foto queda amb la seva part.', en: 'Plan your seven slides: for each one, which photo goes on it, the caption (short text) and which part of the script you say on it. That way each photo sits with its part.' },
        html: { ca: '<div class="model"><strong>Exemple:</strong> <em>Slide 2 · Now · Photo: me at the skate park (me) · Caption: Saturday, 10:30, sunny · Script: “Today I’m at the skate park…”</em></div>', en: '<div class="model"><strong>Model:</strong> <em>Slide 2 · Live now · Photo: me at the skate park (photo: me) · Caption: Saturday, 10:30, sunny and windy · Script: “Today I’m at the skate park…”</em></div>' },
        fields: [
          { id: 's1', label: { ca: 'Diapositiva 1 · Salutació: foto, peu i part del guió', en: 'Slide 1 · Greeting: photo, caption and script part' }, rows: 2 },
          { id: 's2', label: { ca: 'Diapositiva 2 · Ara', en: 'Slide 2 · Live now' }, rows: 2 },
          { id: 's3', label: { ca: 'Diapositiva 3 · Normalment', en: 'Slide 3 · Usually' }, rows: 2 },
          { id: 's4', label: { ca: 'Diapositiva 4 · Foto', en: 'Slide 4 · Photo (Daring: facts)' }, rows: 2 },
          { id: 's5', label: { ca: 'Diapositiva 5 · M’agrada', en: 'Slide 5 · Likes and dislikes' }, rows: 2 },
          { id: 's6', label: { ca: 'Diapositiva 6 · Consells', en: 'Slide 6 · Screen tips' }, rows: 2 },
          { id: 's7', label: { ca: 'Diapositiva 7 · Crèdits: fotos i font', en: 'Slide 7 · Credits: photos and sources' }, rows: 2 }
        ],
        rate: {
          beginners: ['Cada diapositiva té una foto i un peu curt', 'Sé quina frase dic a cada diapositiva', 'L’última diapositiva té els crèdits'],
          insecure: ['Cada diapositiva té una foto i un peu curt', 'Sé quina part del guió dic a cada diapositiva', 'L’última diapositiva té els crèdits de les fotos i la font'],
          safe: ['Every slide has a photo and a short caption', 'Each photo sits with its part of the script', 'The last slide credits the photos and the sources'],
          daring: ['Every slide has a photo and a short caption', 'Each photo sits with its part of the script', 'The last slide credits the photos and two sources']
        } },
      { id: 'script', type: 'step', tab: { ca: 'Pas 3 · El meu guió', en: 'Step 3 · My script' }, title: { ca: 'El meu guió (després de l’assaig)', en: 'My script (after the rehearsal)' },
        intro: { ca: 'Assaja el guió amb el teu company de vlog i enganxa aquí la versió final: el professor el corregeix des d’aquí. Després fes-te les notes clau per gravar (a la gravació no llegeixis el guió).', en: 'Rehearse your script with your vlog buddy and paste the final version here: your teacher marks it from here. Then make key notes for the recording (do not read the script on camera).' },
        fields: [
          { id: 'script', label: { ca: 'El meu guió, diapositiva per diapositiva (versió final)', en: 'My script, slide by slide (final version)' }, rows: 14 },
          { id: 'changed', label: { ca: 'Què he canviat després de l’assaig? (una paraula que no es deia bé, una frase massa llarga, una part que faltava…)', en: 'What did I change after the rehearsal? (a word I could not say, a sentence that was too long, a missing part…)' }, rows: 2 },
          { id: 'notes', label: { ca: 'Les meves notes clau per gravar', en: 'My key notes for the recording' }, rows: 4 }
        ],
        rate: {
          beginners: ['Té les set parts de la pauta', 'Hi ha una frase amb is / are + -ing i una amb usually', 'Hi ha dos consells', 'Ho puc dir sense llegir'],
          insecure: ['Té les set parts del model', 'Faig servir am / is / are + -ing per a “ara” i Present Simple per a “normalment”', 'Hi ha dos consells amb imperatius', 'Ho puc dir sense llegir'],
          safe: ['It has the seven parts of the model', 'Now vs usually with time expressions', 'Three tips with imperatives, love / like / hate + -ing', 'I can say it without reading'],
          daring: ['It has the seven parts of the model, with facts and opinions', 'Now vs usually, a temporary situation, state verbs', 'Three tips with reasons, and the one I will apply', 'I can say it without reading']
        } },
      { id: 'video', type: 'checklist', tab: { ca: 'Vídeo', en: 'Video' }, title: { ca: 'Revisa el vídeo abans d’entregar', en: 'Check your video before you submit' },
        items: {
          beginners: ['Dura 1–1,5 minuts', 'Es veu la meva cara i les diapositives alhora (picture-in-picture)', 'Es sent bé la veu', 'Dic on soc, quin temps fa i què està fent una persona', 'Dic què faig normalment', 'Explico una foto: In this photo, …', 'Dic què m’agrada i dono dos consells', 'He tallat un error o una pausa llarga', 'L’última diapositiva té els crèdits de les fotos i la font'],
          insecure: ['Dura 1,5–2 minuts', 'Es veu la meva cara i les diapositives alhora (picture-in-picture)', 'Es sent bé la veu', 'Dic on soc, quin temps fa i què està fent la gent', 'Dic què faig normalment', 'Explico una foto: In this photo, they’re… / They usually…', 'Dic què m’agrada i dono dos consells de pantalla', 'He tallat un error o una pausa llarga', 'Cada foto té el seu peu i la seva part del guió', 'L’última diapositiva té els crèdits de les fotos i la font'],
          safe: ['1.5–2 minutes', 'My face and the slides are visible together (picture-in-picture)', 'Clear voice', 'Live now: where, weather, clothes or kit, what people are doing', 'What I usually do, in contrast with now', 'Likes and dislikes with love / like / hate + -ing', 'Three screen tips with imperatives', 'I cut at least one mistake or long pause', 'Each photo has its caption and sits with its part of the script', 'Photos and sources credited on the last slide'],
          daring: ['1.5–2 minutes', 'My face and the slides are visible together (picture-in-picture)', 'Clear voice', 'Live now vs usually, plus a temporary situation', 'A short research section with facts from my source', 'Opinions with state verbs', 'Three tips with reasons, and the one I will apply', 'I cut at least one mistake or long pause', 'Each photo has its caption and sits with its part of the script', 'Photos and two sources credited on the last slide']
        } },
      { id: 'edit', type: 'step', tab: { ca: 'Pas 4 · Gravar i editar', en: 'Step 4 · Record and edit' }, title: { ca: 'Com he gravat i editat el vlog', en: 'How I recorded and edited my vlog' },
        intro: { ca: 'Després de mirar la teva primera gravació. Explica com has gravat (Slides + càmera), què has millorat i què has tallat. El professor ho llegeix amb el vídeo.', en: 'After watching your first recording. Explain how you recorded (Slides + camera), what you improved and what you cut. Your teacher reads it with the video.' },
        fields: [
          { id: 'how', label: { ca: 'Com he gravat: quina eina, i com es veuen la cara i les diapositives', en: 'How I recorded: which tool, and how the face and the slides are shown' }, rows: 2 },
          { id: 'improved', label: { ca: 'Després de mirar la primera gravació, quina part he millorat, i com?', en: 'After watching my first recording, which part did I improve, and how?' }, rows: 2 },
          { id: 'cut', label: { ca: 'Què he tallat: un error, una pausa llarga… (on era?)', en: 'What I cut: a mistake, a long pause… (where was it?)' }, rows: 2 },
          { id: 'photos', label: { ca: 'Cada foto té el seu peu i la seva part del guió? Posa un exemple.', en: 'Does each photo have its caption and its part of the script? Give one example.' }, rows: 2 }
        ],
        rate: {
          beginners: ['He mirat la primera gravació i he millorat una part', 'He tallat un error o una pausa llarga', 'Es veuen la cara i les diapositives i se sent bé la veu'],
          insecure: ['He mirat la primera gravació i he millorat una part', 'He tallat un error o una pausa llarga', 'Es veuen la cara i les diapositives i se sent bé la veu', 'Cada foto va amb el seu peu i la seva part'],
          safe: ['I watched my first recording and improved at least one part', 'I cut at least one mistake or long pause', 'Face and slides visible, clear voice', 'Each photo sits with its caption and its script part'],
          daring: ['I watched my first recording and improved at least one part, on my own', 'I cut mistakes and long pauses', 'Face and slides visible, clear voice, good rhythm', 'Each photo sits with its caption and its script part']
        } },
      { id: 'feedback', type: 'step', tab: { ca: 'Feedback al company', en: 'Feedback for my buddy' }, title: { ca: 'Feedback al meu company de vlog (no puntua)', en: 'Feedback for my vlog buddy (not marked)' },
        intro: { ca: 'Mira la primera gravació del teu company de vlog i ajuda’l a millorar-la.', en: 'Watch your vlog buddy’s first recording and help them improve it.' },
        fields: [
          { id: 'buddy', label: { ca: 'El meu company de vlog', en: 'My vlog buddy' }, rows: 1 },
          { id: 'good', label: { ca: 'Dues coses que funcionen', en: 'Two things that work' }, rows: 3 },
          { id: 'better', label: { ca: 'Una cosa per millorar', en: 'One thing to improve' }, rows: 2 }
        ],
        rate: {
          beginners: ['Es veuen la cara i les diapositives', 'Diu què fa la gent ara i què fa normalment', 'Dona dos consells', 'Cita les fotos i la font'],
          insecure: ['Es veuen la cara i les diapositives', 'Diu què fa la gent ara i què fa normalment', 'Dona dos consells de pantalla', 'Cita les fotos i la font'],
          safe: ['Face and slides are visible; clear voice', 'Now vs usually is clear', 'Three screen tips with imperatives', 'Photos and sources are credited'],
          daring: ['Face and slides are visible; clear voice', 'Now vs usually is clear, with a temporary situation', 'Three tips with reasons', 'Photos and sources are credited']
        } },
      { id: 'submit', type: 'checklist', tab: { ca: 'Entrega', en: 'Submit' }, title: { ca: 'Entrega el producte final', en: 'Submit the final product' },
        intro: { ca: 'El vídeo s’entrega al Google Classroom i el guió, al pas 3 d’aquesta pàgina. El professor ho puntua.', en: 'The video goes to Google Classroom and the script to step 3 on this page. Your teacher marks them.' },
        items: {
          insecure: ['He pujat el vídeo (o l’enllaç) al Classroom', 'He enganxat el meu guió final al pas 3', 'He entregat el pas 4'],
          safe: ['I have uploaded my video (or its link) to Classroom', 'I have pasted my final script in step 3', 'I have handed in step 4'],
          daring: ['I have uploaded my video (or its link) to Classroom', 'I have pasted my final script in step 3', 'I have handed in step 4']
        } },
      { id: 'tips', type: 'step', tab: { ca: 'Pas 5 · El meu consell', en: 'Step 5 · My tip' }, title: { ca: 'El consell de pantalla que aplico', en: 'The screen tip I am applying' },
        intro: { ca: 'Després d’entregar. Dels consells del teu vlog, quin apliques tu? Explica com va.', en: 'After you submit. Of the tips in your vlog, which one are you applying? Say how it is going.' },
        fields: [
          { id: 'tip', label: { ca: 'El consell que aplico (amb imperatiu) i per què l’he triat', en: 'The tip I am applying (as an imperative) and why I chose it' }, rows: 2 },
          { id: 'going', label: { ca: 'Com va? Què és fàcil i què és difícil?', en: 'How is it going? What is easy and what is difficult?' }, rows: 3 },
          { id: 'again', label: { ca: 'Què faria diferent al pròxim vídeo?', en: 'What would I do differently in my next video?' }, rows: 2 }
        ],
        rate: {
          beginners: ['He triat un consell i l’estic aplicant', 'El consell parla de pantalles (temps, pauses, dormir)', 'He fet la meva feina a temps'],
          insecure: ['He triat un consell i l’estic aplicant', 'El consell evita un mal hàbit (temps, pauses, dormir)', 'He fet la meva feina a temps'],
          safe: ['I chose one tip and I am applying it', 'My tip prevents an addictive habit (time limits, breaks, no phone before sleeping)', 'I did my work on time'],
          daring: ['I chose one tip, I am applying it and I can explain the reason', 'My tips prevent addictive habits', 'I did my work on time']
        } }
    ]
  };
})();
