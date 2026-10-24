/* LS2 · Final product rubric (approved by Roger, 24 Oct 2026). Rendered by shared/js/final-rubric.js.
   Rows 1, 2, 6 and 7 are individual; rows 3–5 are marked once for the group. Same-route groups. */
(function () {
  const en = {
    lang: 'en', criterion: 'Criterion',
    levels: [['Level 4', 'Very good'], ['Level 3', 'Good'], ['Level 2', 'Fair'], ['Level 1', 'Developing']],
    heading: 'Rubric for the {route} route', label: 'Rubric {route}', req: 'Route requirement:',
    calc: '<strong>How is the grade calculated?</strong> Each row gets a level, which becomes a score: <span class="rubric-pill">Level 4 · 10</span><span class="rubric-pill">Level 3 · 7.5</span><span class="rubric-pill">Level 2 · 5</span><span class="rubric-pill">Level 1 · 2.5</span><span class="rubric-pill">No evidence · 0</span> Then the row’s percentage is applied. Rows 1, 2, 6 and 7 are yours; rows 3–5 are shared by your group. If you did not contribute to the group work, your teacher can lower your group rows by one level.'
  };
  const teamEn = { name: 'Teamwork', sub: 'Your teammates’ ratings (3.2)', pct: 10, cells: [
    'My teammates rate me 3.5–4 on average: I did my part on time, listened and helped to improve the work.',
    'My teammates rate me 2.5–3.4 on average.',
    'My teammates rate me 1.5–2.4 on average.',
    'My teammates rate me below 1.5, or I did not take part in the group work.'] };
  const processEn = { name: 'My process evidence', sub: 'Steps 0–5 on this page (3.2, 4.2, 6.1)', pct: 10, cells: [
    'Every step handed in on time, specific and in my own words, with an honest self-assessment.',
    'Every step handed in; one is late or very general.',
    'One or two steps are missing.',
    'Most steps are missing.'] };
  window.finalRubricData = {
    insecure: {
      intro: 'Mira què es valora i en quin nivell ets. Treballes en un grup Insecure: cada membre presenta una part del vídeo (40–60 segons) i escriu el seu correu.',
      note: 'Descriviu una celebració amb frases curtes (què, quan, on, tres costums, un menjar o símbol), tres activitats per al dia amb l’hora i qui les fa, i una idea perquè tothom s’hi senti benvingut. Correu amb la plantilla guiada.',
      ui: {
        lang: 'ca', criterion: 'Criteri',
        levels: [['Nivell 4', 'Molt bé'], ['Nivell 3', 'Bé'], ['Nivell 2', 'Suficient'], ['Nivell 1', 'En procés']],
        heading: 'Rúbrica de la ruta {route}', label: 'Rúbrica {route}', req: 'Requisit de ruta:',
        calc: '<strong>Com es calcula la nota?</strong> Cada fila rep un nivell, que es converteix en una puntuació: <span class="rubric-pill">Nivell 4 · 10</span><span class="rubric-pill">Nivell 3 · 7,5</span><span class="rubric-pill">Nivell 2 · 5</span><span class="rubric-pill">Nivell 1 · 2,5</span><span class="rubric-pill">Sense evidència · 0</span> Després s’hi aplica el percentatge de la fila. Les files 1, 2, 6 i 7 són teves; les files 3–5 són del grup. Si no has col·laborat en la feina del grup, el professor pot baixar un nivell les teves files de grup.'
      },
      rows: [
        { name: 'La meva part del vídeo', sub: 'Expressió oral i pronunciació (3.1)', pct: 25, cells: [
          'Dic tot el contingut de la meva part amb frases curtes i clares (<i>It is celebrated in…</i>, <i>People…</i>, <i>At 10 o’clock…</i>); 40–60 segons; només miro les diapositives com a ajuda; pronuncio clar i faig pujades i baixades de la veu com al <i>shadowing</i>.',
          'Hi ha tot el contingut, però llegeixo 1–2 frases senceres, o faig 2–3 errors amb <i>is celebrated</i> / Present Simple, o l’entonació és força plana.',
          'Falta part del contingut, o llegeixo gairebé tota la meva part, o costa entendre algunes paraules.',
          'Dic només 1–2 frases, ho llegeixo tot o no s’entén què dic.'] },
        { name: 'El meu correu', sub: 'Correu formal (5.1)', pct: 20, cells: [
          'Plantilla completa: salutació i comiat formals, per què escric, data, lloc i activitats, una petició; sense contraccions; com a màxim 2 errors.',
          'Completa amb 3–4 errors, o una part molt curta.',
          'Falta una part, 5 errors o més, o paraules informals (<i>Hi</i>, <i>thanks</i>).',
          'La majoria de buits estan buits o no parla de l’acte.'] },
        { name: 'Recerca i fonts', sub: 'Grup (4.2, 6.1, 6.2)', pct: 10, cells: [
          'La informació surt de 2 fonts, és correcta i les dues estan citades a l’última diapositiva (títol + web).',
          '2 fonts, però una referència és incompleta.',
          'Només 1 font citada, o una dada és incorrecta.',
          'Sense fonts, o text copiat.'] },
        { name: 'Respecte i inclusió', sub: 'Grup (1.1–1.3, CC1 1.3)', pct: 10, cells: [
          'Expliquem els costums com a informació (<i>Some people…</i>), sense estereotips ni bromes; una idea clara perquè tothom s’hi senti benvingut.',
          'Respectuós, però la idea de benvinguda és vaga (<i>everybody can come</i>).',
          'Una generalització (<i>All Indian people…</i>) o cap idea de benvinguda.',
          'Estereotips, bromes sobre la tradició o disfresses que en fan burla.'] },
        { name: 'Pla de l’acte', sub: 'Grup (CE2 emprenedora 2.3)', pct: 15, cells: [
          'Tres activitats realistes per a l’escola, cadascuna amb l’hora i qui la fa.',
          'Tres activitats; a una li falta l’hora o la persona.',
          'Només 1–2 activitats, o no es poden fer a l’escola.',
          'No hi ha pla.'] },
        { name: 'Treball en equip', sub: 'Valoració dels companys (3.2)', pct: 10, cells: [
          'Els companys em valoren de mitjana 3,5–4: he fet la meva part a temps, he escoltat i he ajudat a millorar la feina.',
          'Els companys em valoren de mitjana 2,5–3,4.',
          'Els companys em valoren de mitjana 1,5–2,4.',
          'Els companys em valoren per sota d’1,5, o no he participat en la feina del grup.'] },
        { name: 'Les meves evidències', sub: 'Passos 0–5 d’aquesta pàgina (3.2, 4.2, 6.1)', pct: 10, cells: [
          'He entregat tots els passos a temps, concrets i amb les meves paraules, amb una autoavaluació sincera.',
          'He entregat tots els passos; un és tard o molt general.',
          'Falten un o dos passos.',
          'Falten la majoria de passos.'] }
      ]
    },
    safe: {
      ui: en,
      intro: 'See what is assessed and which level you are at. You work in a Safe group: each member presents one part of the video (35–45 seconds) and writes their own email.',
      note: 'Describe the celebration and compare it with a local one (similarities and differences), explain its origin briefly, plan the day with a timetable, roles and materials, and explain at least one decision that makes the event inclusive. Email: a full formal email in paragraphs.',
      rows: [
        { name: 'My part of the video', sub: 'Speaking and pronunciation (3.1)', pct: 25, cells: [
          'All the content of my part, well structured; LS grammar used well (passive, <i>used to</i>, future forms); 35–45 s; I speak naturally, only glancing at the slides; clear pronunciation, with stress on key words and natural intonation.',
          'Clear and complete, but 1–2 read sentences, 3–4 grammar errors, or rather flat intonation.',
          'Content missing (e.g. only similarities), or I read most of my part, or some words are hard to understand.',
          'Key content missing, I read everything, or I cannot be understood.'] },
        { name: 'My email', sub: 'Formal email (5.1)', pct: 20, cells: [
          'Four paragraphs (purpose, plan, request, closing); formal register; one polite request (<i>Could we…? / Would it be possible…?</i>); future forms and a relative clause; at most 3 errors.',
          'All four paragraphs, 4–5 errors or one informal expression.',
          'A paragraph missing, the request not polite, or 6 or more errors.',
          'Not a formal email, or not about the event.'] },
        { name: 'Research & credits', sub: 'Group (4.2, 6.1, 6.2)', pct: 10, cells: [
          'Facts from 2 reliable sources, contrasted where they differ, both credited (title, website, year).',
          '2 sources credited but not contrasted, or one credit incomplete.',
          'One unreliable source (shop, ad, no author), or only 1 source.',
          'No credits, or copied text.'] },
        { name: 'Respect & inclusion', sub: 'Group (1.1–1.3, CC1 1.3)', pct: 10, cells: [
          'Fair comparison with the local celebration, beliefs presented as information, and at least one decision that makes the day inclusive, with a reason.',
          'Respectful comparison; the inclusive decision has no reason.',
          'One generalisation or stereotype, or no inclusive decision.',
          'Stereotypes, mocking or caricature costumes.'] },
        { name: 'Event plan', sub: 'Group (CE2 emprenedora 2.3)', pct: 15, cells: [
          'Timetable, a role for every member and a list of materials, all realistic for school.',
          'All three, one incomplete (e.g. one member without a role).',
          'One of the three missing.',
          'Only a list of ideas, no plan.'] },
        teamEn, processEn
      ]
    },
    daring: {
      ui: en,
      intro: 'See what is assessed and which level you are at. You work in a Daring group: each member presents one part of the video (35–45 seconds) and writes their own email.',
      note: 'Explain the origin, meaning and how the tradition has changed, compare it with a local celebration, plan the day with a timetable, roles, materials and an estimated cost, and justify every choice so the event is inclusive and avoids stereotypes. Email: answer one concern of the head teacher.',
      rows: [
        { name: 'My part of the video', sub: 'Speaking and pronunciation (3.1)', pct: 25, cells: [
          'All the content of my part, argued and fluent, with linking words and accurate LS grammar (passive, <i>used to</i>, future forms, relative clauses); 35–45 s; no reading; clear pronunciation and intonation that helps the listener follow the argument.',
          'Complete and argued, with 1–2 read sentences, a few errors that do not affect meaning, or rather flat intonation.',
          'Description without argument, or content missing, or I read most of my part, or some words are hard to understand.',
          'Key content missing, I read everything, or I cannot be understood.'] },
        { name: 'My email', sub: 'Formal email (5.1)', pct: 20, cells: [
          'Four paragraphs in formal register (<i>I would be grateful if…</i>); one concern of the head teacher anticipated and answered; varied, accurate language; at most 2 errors.',
          'The concern is answered weakly, or 3–4 errors.',
          'No concern answered, one informal expression, or 5 or more errors.',
          'Not a formal email, or not about the event.'] },
        { name: 'Research & credits', sub: 'Group (4.2, 6.1, 6.2)', pct: 10, cells: [
          'Facts from 2 or more reliable sources, contrasted and evaluated (who wrote it, why), summarised in our own words, all credited.',
          'Reliable and credited, but not evaluated.',
          'One unreliable source, or one credit missing.',
          'No credits, or copied text.'] },
        { name: 'Respect & inclusion', sub: 'Group (1.1–1.3, CC1 1.3)', pct: 10, cells: [
          'Every choice (activities, food, clothes, music) justified as inclusive; beliefs as information; fair comparison with a local celebration; we explain how we avoid stereotypes.',
          'Most choices justified; respectful throughout.',
          'Few justifications, or one generalisation.',
          'Stereotypes, mocking or caricature costumes.'] },
        { name: 'Event plan', sub: 'Group (CE2 emprenedora 2.3)', pct: 15, cells: [
          'Timetable, roles, materials and a realistic estimated cost (items and amounts).',
          'All four, one incomplete or the cost has no items.',
          'One of the four missing.',
          'Only a list of ideas, no plan.'] },
        teamEn, processEn
      ]
    }
  };
})();
