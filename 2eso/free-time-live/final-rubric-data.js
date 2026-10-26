/* 2 ESO · LS2 · Final product rubric (Free Time Vlog). Rendered by shared/js/final-rubric.js.
   One row per LS criterion of the 2 ESO programme (24 Oct 2026); the levels follow docs/2eso/ls2-free-time-live/indicators.md
   (NA = Level 1, AS = 2, AN = 3, AE = 4). Weights follow the 4 ESO LS2 model (docs/2eso/ls2-free-time-live/grading.md): rows 1–4 are the
   final product mark (25 % of the LS); the other rows are marked here but count in the LS's "other competences" block (20 %), so their pct is a label.
   The vlog is individual (Roger, 25 Oct 2026): no group rows and no peer rating. round: 1 = after step 2 (source, fact file), 2 = after submitting
   (vlog, script, editing, tip, process). video: judged on the video. The dashboard's marking PDF reads round and video from here. */
(function () {
  const en = {
    lang: 'en', criterion: 'Criterion',
    levels: [['Level 4', 'Very good'], ['Level 3', 'Good'], ['Level 2', 'Fair'], ['Level 1', 'Developing']],
    heading: 'Rubric for the {route} route', label: 'Rubric {route}', req: 'Route requirement:',
    rounds: { 1: 'Round 1 · after step 2', 2: 'Round 2 · after you submit' },
    calc: '<strong>When is it marked?</strong> Your teacher marks the final product in two rounds: <strong>round 1</strong> after step 2 (your source and your fact file), with feedback before you record, and <strong>round 2</strong> after you submit (the vlog, your script, how you recorded and edited, your tip and your process). <strong>How is the grade calculated?</strong> Each row gets a level, which becomes a score: <span class="rubric-pill">Level 4 · 10</span><span class="rubric-pill">Level 3 · 7.5</span><span class="rubric-pill">Level 2 · 5</span><span class="rubric-pill">Level 1 · 2.5</span><span class="rubric-pill">No evidence · 0</span> The rows with a percentage make your final product mark (25 % of the LS mark). The rows marked “Other competences” count in that part of the LS mark (20 %). Everything is yours: the vlog is individual.'
  };
  const OTHER = 'Other competences', ALTRES = 'Altres competències';
  // Rows that are the same for Safe and Daring (the indicators do not change by route; the task does).
  const sourceEn = { name: 'My source', sub: 'Step 1: reliable or not, two reasons (4.2)', pct: 15, round: 1, cells: [
    'I rate my two pages on my own with precise reasons, including the purpose (selling, getting views, informing) and the type of website, and I explain my choice.',
    'I rate both pages correctly with two relevant reasons from the checklist (author, date, purpose, type of website) and choose the better one.',
    'I rate the pages with one reason, or with reasons copied from the checklist without looking at the page; I choose one.',
    'I give no reasons, or I rate an obviously unreliable page (a shop, an anonymous video) as reliable, even with the checklist.'] };
  const processEn = { name: 'My process evidence', sub: 'Steps 0–5 on this page (3.2)', pct: 15, round: 2, process: true, cells: [
    'Every step handed in on time, specific and in my own words, with an honest self-assessment.',
    'Every step handed in; one is late or very general.',
    'One or two steps are missing.',
    'Most steps are missing.'] };
  const factEn = { name: 'My fact file and credits', sub: 'LP4 piece 3 and the last slide (6.2)', pct: OTHER, round: 1, cells: [
    'Four accurate facts in my own words from two well-chosen sources that I compared; photos and sources credited completely on the last slide.',
    'Four facts in key words from two sources, with full credit lines; photos and sources credited on the last slide.',
    'Four facts with help, partly copied; one credit line incomplete, or a photo without a credit.',
    'Fewer than four facts, copied sentences, no credits, or wrong information.'] };
  const editEn = { name: 'Recording and editing', sub: 'Judged on the video and step 4 (CD2 2.2)', pct: OTHER, round: 2, video: true, cells: [
    'I recorded and edited on my own: no mistakes or long pauses are left, the rhythm is good, and every photo sits with its caption and its script part.',
    'I recorded with Slides and my face in picture-in-picture, cut at least one mistake or long pause, and placed each photo with its caption and its script part.',
    'I recorded with guidance; one mistake or long pause is left, or a photo is not with its part of the script.',
    'No editing: mistakes and long pauses are left, or the photos do not match the script.'] };
  const tipsEn = { name: 'Screen tips', sub: 'In my vlog and step 5 (CD4 4.5)', pct: OTHER, round: 2, cells: [
    'Three tips with reasons that prevent addictive habits, and I explain the one I am applying and how it is going.',
    'Three tips with imperatives that prevent addictive habits (time limits, breaks, no phone before sleeping), and I say which one I will apply.',
    'Two or three general tips, close to the model, without saying which one I will apply.',
    'No tips, or tips that are not about screens.'] };
  window.finalRubricData = {
    insecure: {
      intro: 'Mira què es valora i en quin nivell ets. El vlog és individual: tu fas el teu vídeo i el teu company de vlog t’ajuda i et dona feedback.',
      note: 'Presenta la teva afició o esdeveniment amb fotos: què fa la gent a cada foto i què fa normalment, amb frases curtes i la pauta; quatre dades d’una font; dos consells de pantalla amb imperatius; crèdits a l’última diapositiva; es veuen la cara i les diapositives.',
      ui: {
        lang: 'ca', criterion: 'Criteri',
        levels: [['Nivell 4', 'Molt bé'], ['Nivell 3', 'Bé'], ['Nivell 2', 'Suficient'], ['Nivell 1', 'En procés']],
        heading: 'Rúbrica de la ruta {route}', label: 'Rúbrica {route}', req: 'Requisit de ruta:',
        rounds: { 1: '1a correcció · després del pas 2', 2: '2a correcció · després d’entregar' },
        calc: '<strong>Quan es corregeix?</strong> El professor corregeix el producte final en dues vegades: la <strong>1a correcció</strong>, després del pas 2 (la teva font i la teva fitxa de dades), amb comentaris abans de gravar, i la <strong>2a correcció</strong>, després d’entregar (el vlog, el guió, com has gravat i editat, el teu consell i les evidències). <strong>Com es calcula la nota?</strong> Cada fila rep un nivell, que es converteix en una puntuació: <span class="rubric-pill">Nivell 4 · 10</span><span class="rubric-pill">Nivell 3 · 7,5</span><span class="rubric-pill">Nivell 2 · 5</span><span class="rubric-pill">Nivell 1 · 2,5</span><span class="rubric-pill">Sense evidència · 0</span> Les files amb percentatge fan la nota del producte final (el 25 % de la nota de la LS). Les files marcades amb “Altres competències” compten en aquesta part de la nota de la LS (el 20 %). Tot és teu: el vlog és individual.'
      },
      rows: [
        { name: 'El meu vlog', sub: 'Planificar, gravar i revisar (3.2)', pct: 40, round: 2, video: true, cells: [
          'Un vlog clar i complet, amb bon ritme; el contrast ara / normalment és clar; he millorat més d’una part pel meu compte després de la primera gravació; només miro les notes.',
          'He planificat i gravat el vlog amb les diapositives i la meva cara; dic què fa la gent ara i què fa normalment amb les frases de la pauta; he millorat una part després de mirar la primera gravació; miro les notes de tant en tant.',
          'He gravat el vlog amb ajuda i dic el contingut bàsic (on, què fan, què m’agrada), però llegeixo trossos o no he canviat res després de la primera gravació.',
          'No gravo el vlog, o llegeixo un text que no s’entén; no es veuen la cara i les diapositives.'] },
        { name: 'El meu guió i les diapositives', sub: 'Guió i text de les diapositives (5.1)', pct: 30, round: 2, cells: [
          'Un guió clar que va més enllà de la pauta (frases pròpies, connectors), amb pocs errors que corregeixo jo; diapositives amb poc text i un peu a cada foto.',
          'Les set parts del model amb la pauta adaptada: expressions de temps (<i>today, right now, usually, on Saturdays</i>), <i>I love / like / don’t like + -ing</i> i dos consells amb imperatius; com a màxim 2–3 errors; diapositives amb poc text.',
          'Hi ha la majoria de parts, molt a prop de la pauta; errors que no impedeixen entendre’l; falta alguna expressió de temps o un consell.',
          'Incomplet o no s’entén; sense la pauta no hi ha parts clares.'] },
        { name: 'La meva font', sub: 'Pas 1: fiable o no, dues raons (4.2)', pct: 15, round: 1, cells: [
          'Valoro la meva font pel meu compte amb raons precises, també per a què s’ha publicat (vendre, informar) i quin tipus de web és.',
          'Valoro bé la font amb dues raons de la llista (qui l’ha escrita, de quan és, per a què, quin tipus de web és).',
          'Valoro la font amb una raó, o amb raons copiades de la llista sense mirar la pàgina.',
          'No dono raons, o dic que una font clarament poc fiable (una botiga, un vídeo anònim) és fiable, fins i tot amb la llista.'] },
        { name: 'Les meves evidències', sub: 'Passos 0–5 d’aquesta pàgina (3.2)', pct: 15, round: 2, process: true, cells: [
          'He entregat tots els passos a temps, concrets i amb les meves paraules, amb una autoavaluació sincera.',
          'He entregat tots els passos; un és tard o molt general.',
          'Falten un o dos passos.',
          'Falten la majoria de passos.'] },
        { name: 'La meva fitxa de dades i els crèdits', sub: 'Peça 3 del LP4 i l’última diapositiva (6.2)', pct: ALTRES, round: 1, cells: [
          'Quatre dades correctes amb les meves paraules; les fotos i la font citades completes a l’última diapositiva, pel meu compte.',
          'Quatre dades en paraules clau de la font donada, amb la referència completa; les fotos i la font citades a l’última diapositiva.',
          'Quatre dades amb ajuda, en part copiades; la referència incompleta, o una foto sense crèdit.',
          'Menys de quatre dades, frases copiades, sense crèdits, o informació incorrecta.'] },
        { name: 'Gravar i editar', sub: 'Al vídeo i al pas 4 (CD2 2.2)', pct: ALTRES, round: 2, video: true, cells: [
          'He gravat i editat pel meu compte: no queden errors ni pauses llargues, el ritme és bo i cada foto va amb el seu peu i la seva part del guió.',
          'He gravat amb les diapositives i la meva cara, he tallat un error o una pausa llarga i cada foto va amb el seu peu i la seva part del guió.',
          'He gravat amb ajuda; queda un error o una pausa llarga, o una foto no va amb la seva part del guió.',
          'Sense edició: queden errors i pauses llargues, o les fotos no van amb el guió.'] },
        { name: 'Consells de pantalla', sub: 'Al vlog i al pas 5 (CD4 4.5)', pct: ALTRES, round: 2, cells: [
          'Dos consells o més amb una raó, que eviten hàbits addictius, i explico quin aplico i com va.',
          'Dos consells amb imperatius que eviten hàbits addictius (temps límit, pauses, sense mòbil abans de dormir) i dic quin aplicaré.',
          'Un consell, o dos de molt generals copiats del model, sense dir quin aplicaré.',
          'Cap consell, o consells que no parlen de pantalles.'] }
      ]
    },
    safe: {
      ui: en,
      intro: 'See what is assessed and which level you are at. The vlog is individual: you make your own video, and your vlog buddy helps you and gives you feedback.',
      note: 'Present your hobby or event “live”, contrasting what you usually do with what is happening now; include the weather and your clothes or equipment; three screen tips with imperatives; two sources rated and one chosen; a photo with a caption on each slide; credits on the last slide.',
      rows: [
        { name: 'My vlog', sub: 'Plan, record and revise (3.2)', pct: 40, round: 2, video: true, cells: [
          'A fluent, well-structured vlog with a good rhythm; the contrast between now and usually is clear and natural, with the weather and the kit; I improved more than one part on my own after the first recording; I only glance at my notes; 1.5–2 minutes.',
          'I planned and recorded the vlog with the slides and my face in picture-in-picture; I contrast what people are doing now with what they usually do, with the weather and the clothes or kit; I improved one part after watching the first recording; I only glance at my notes.',
          'I recorded the vlog with guidance and cover the basic content, but the contrast now / usually is weak, I read parts of the script, or I did not change anything after the first recording.',
          'I did not record the vlog, or I read a text the audience cannot follow; face and slides are not visible.'] },
        { name: 'My script and slides', sub: 'Script and slide text (5.1)', pct: 30, round: 2, cells: [
          'A clear script beyond the model (own sentences, linkers, a personal touch), few errors that I corrected myself; slides with short text and a caption on each photo.',
          'The seven parts of the model, adapted: time expressions, <i>love / like / hate + -ing</i>, three tips with imperatives (one negative); at most 2–3 errors; short slide text.',
          'Most parts are there, close to the model; errors that do not block meaning; a time expression or a tip is missing.',
          'Unfinished or hard to understand; no clear parts.'] },
        sourceEn, processEn, factEn, editEn, tipsEn
      ]
    },
    daring: {
      ui: en,
      intro: 'See what is assessed and which level you are at. The vlog is individual: you make your own video, and your vlog buddy helps you and gives you feedback.',
      note: 'Add a short research section with facts from your sources, a temporary situation (This month I’m…), opinions with state verbs, and three tips with a reason each plus the one you will apply; link your sentences with and, but, because, so; credits for two sources on the last slide.',
      rows: [
        { name: 'My vlog', sub: 'Plan, record and revise (3.2)', pct: 40, round: 2, video: true, cells: [
          'A fluent, well-linked vlog with a good rhythm; now, usually and a temporary situation are clear; facts and opinions are natural; I improved more than one part on my own after the first recording; I only glance at my notes; 1.5–2 minutes.',
          'I planned and recorded the vlog with the slides and my face; I contrast now and usually, add a temporary situation and my opinions, and improved one part after watching the first recording; I only glance at my notes.',
          'I recorded the vlog with guidance and cover the content, but without the temporary situation or the opinions, I read parts, or I did not change anything after the first recording.',
          'I did not record the vlog, or I read a text the audience cannot follow; face and slides are not visible.'] },
        { name: 'My script and slides', sub: 'Script and slide text (5.1)', pct: 30, round: 2, cells: [
          'A clear, well-linked script beyond the model, with facts in my own words, opinions with state verbs and tips with reasons; few errors that I corrected myself; slides with short text and a caption on each photo.',
          'The seven parts of the model, adapted, with a research section, a temporary situation, <i>love / like / hate + -ing</i>, three tips with reasons and <i>and, but, because, so</i>; at most 2–3 errors.',
          'Most parts are there, close to the model; the research section or the reasons are weak; errors that do not block meaning.',
          'Unfinished or hard to understand; no clear parts.'] },
        sourceEn, processEn, factEn, editEn, tipsEn
      ]
    }
  };
})();
