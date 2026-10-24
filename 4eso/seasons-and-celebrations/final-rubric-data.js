/* LS2 · Final product rubric. Rendered by shared/js/final-rubric.js.
   One row per LS criterion of the revised programme (24 Oct 2026); the levels follow the indicators in
   docs/4eso/ls2-seasons-and-celebrations/indicators.md (NA = Level 1, AS = 2, AN = 3, AE = 4). Weights proposed to Roger, pending his OK.
   Rows 1–3, 8 and 9 are individual (65 %); rows 4–7 are marked once for the group (35 %). Same-route groups. */
(function () {
  const en = {
    lang: 'en', criterion: 'Criterion',
    levels: [['Level 4', 'Very good'], ['Level 3', 'Good'], ['Level 2', 'Fair'], ['Level 1', 'Developing']],
    heading: 'Rubric for the {route} route', label: 'Rubric {route}', req: 'Route requirement:',
    calc: '<strong>How is the grade calculated?</strong> Each row gets a level, which becomes a score: <span class="rubric-pill">Level 4 · 10</span><span class="rubric-pill">Level 3 · 7.5</span><span class="rubric-pill">Level 2 · 5</span><span class="rubric-pill">Level 1 · 2.5</span><span class="rubric-pill">No evidence · 0</span> Then the row’s percentage is applied. The rows marked “Group” are shared by your group; the others are yours. If you did not contribute to the group work, your teacher can lower your group rows by one level.'
  };
  // Rows that are the same for Safe and Daring (the indicators do not change by route; the task does).
  const welcomeEn = { name: 'Welcome actions', sub: 'In my email (CC1 1.3)', pct: 5, cells: [
    'Two or more concrete actions with reasons, thinking of different people (families, students who do not celebrate it, newcomers).',
    'Two concrete, realistic actions for students and families (explaining the customs, inviting families, an alternative for those who do not celebrate it).',
    'One concrete action, or two very general ones close to the model.',
    'No concrete action, or only a vague one (<i>everybody can come</i>).'] };
  const researchEn = { name: 'Research & credits', sub: 'Group (4.2, 6.1)', pct: 10, cells: [
    'Varied, well-chosen sources and organised notes; precise reliability reasons, including purpose and channel; an accurate comparison, and a disagreement resolved by choosing the more reliable source; all three credited.',
    'Three sources with key information in our own words, full credit lines, two relevant reasons for each source, the most trusted one explained, and one point where they agree or differ.',
    'Three sources with key information, with help; reasons copied from the checklist; credits partly complete; agreement or difference missing or vague.',
    'Fewer than three sources, copied notes, no credits or reasons, or wrong information.'] };
  const meaningEn = { name: 'What it means and why it belongs at school', sub: 'Group (1.1)', pct: 5, cells: [
    'We explain the meaning with nuance (not everyone celebrates it the same way, or it has changed) and argue convincingly, linking cultural diversity to rights or to our school community.',
    'We explain what it means for the people who celebrate it and argue for its place at school with respect for cultural diversity.',
    'We say what it means in one simple sentence (<i>For many Hindus, Diwali means…</i>) and give one reason for it at school, close to the model.',
    'We do not say what it means for the people who celebrate it, or we present it in a judging way.'] };
  const linkEn = { name: 'Local link and inclusion', sub: 'Group (1.2)', pct: 10, cells: [
    'A comparison that builds a real link between the two cultures, and several justified decisions that foresee who could feel left out.',
    'A clear, fair comparison with a local celebration (similarities and differences) and an inclusive decision with a reason.',
    'One similarity and one difference, and one inclusive decision, close to the model.',
    'No comparison or no inclusive decision; or the plan includes a stereotype or a caricature costume.'] };
  const stereoEn = { name: 'Stereotypes', sub: 'Group (CC3 3.2)', pct: 10, cells: [
    'We explain why the stereotype is unfair with an example or evidence from our research, and several choices in our plan challenge it.',
    'We name a stereotype, explain why it is unfair and point to a concrete choice in our plan that avoids it.',
    'We name one stereotype in a simple sentence with help (<i>Some people think…</i>) and say our plan avoids it, without saying why it is unfair.',
    'No stereotype named, or the pitch repeats one (images, words, costumes).'] };
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
      note: 'Descriviu una celebració amb frases curtes (què, quan, on, tres costums, un menjar o símbol), què significa per a la gent que la celebra i una cosa que té en comú amb una celebració local; tres activitats per al dia amb l’hora i qui les fa; un estereotip, per què és injust i com l’eviteu. Dues fonts. Correu amb la plantilla guiada i dues accions perquè tothom s’hi senti benvingut.',
      ui: {
        lang: 'ca', criterion: 'Criteri',
        levels: [['Nivell 4', 'Molt bé'], ['Nivell 3', 'Bé'], ['Nivell 2', 'Suficient'], ['Nivell 1', 'En procés']],
        heading: 'Rúbrica de la ruta {route}', label: 'Rúbrica {route}', req: 'Requisit de ruta:',
        calc: '<strong>Com es calcula la nota?</strong> Cada fila rep un nivell, que es converteix en una puntuació: <span class="rubric-pill">Nivell 4 · 10</span><span class="rubric-pill">Nivell 3 · 7,5</span><span class="rubric-pill">Nivell 2 · 5</span><span class="rubric-pill">Nivell 1 · 2,5</span><span class="rubric-pill">Sense evidència · 0</span> Després s’hi aplica el percentatge de la fila. Les files marcades amb “Grup” són del grup; les altres són teves. Si no has col·laborat en la feina del grup, el professor pot baixar un nivell les teves files de grup.'
      },
      rows: [
        { name: 'La meva part del vídeo', sub: 'Planificar, assajar i gravar en grup (3.2)', pct: 25, cells: [
          'Ajudo a planificar i assajar; la meva part és clara i completa, pensada per a algú que no coneix la celebració, i enllaço amb el company següent; he millorat el guió pel meu compte després de l’assaig; 40–60 segons; només miro les notes.',
          'He planificat i assajat amb el grup; la meva part és clara i completa i he millorat el guió després de l’assaig (he explicat una paraula, he afegit un exemple); només miro les notes de tant en tant.',
          'Gravo la meva part amb el grup i dic el contingut bàsic (què, quan, on, costums) amb un guió que he millorat amb ajuda; en llegeixo trossos.',
          'No preparo ni gravo la meva part, o llegeixo un text sense revisar que no s’entén; no participo a la planificació.'] },
        { name: 'El meu correu', sub: 'Correu formal (5.1)', pct: 15, cells: [
          'Un correu clar i ben enllaçat que va més enllà de la plantilla (connectors variats, peticions educades); pocs errors, i els corregeixo jo.',
          'Plantilla completa i adaptada: salutació i comiat formals, per què escric, el pla amb formes de futur (<i>will</i>, <i>going to</i>) i una petició; registre formal; com a màxim 2–3 errors.',
          'Hi ha el propòsit, el pla i la petició, molt a prop de la plantilla; errors que no impedeixen entendre’l; gairebé tot formal.',
          'Incomplet o no s’entén; no queda clar per què escric ni què demano, o és informal (<i>Hi</i>, <i>thanks</i>).'] },
        { name: 'Accions de benvinguda', sub: 'Al meu correu (CC1 1.3)', pct: 5, cells: [
          'Dues accions concretes o més, amb una raó, pensant en persones diferents (famílies, alumnes que no ho celebren, alumnes nous).',
          'Dues accions concretes i realistes per als alumnes i les famílies (explicar els costums, convidar les famílies, una alternativa per a qui no ho celebra).',
          'Una acció concreta, o dues de molt generals copiades del model.',
          'Cap acció concreta, o només una idea vaga (<i>everybody can come</i>).'] },
        { name: 'Recerca i fonts', sub: 'Grup (4.2, 6.1)', pct: 10, cells: [
          'Fonts ben triades i notes ordenades; raons precises de per què cada font és fiable (qui, quan, per què, on es publica); si dues fonts no coincideixen, triem la més fiable; les dues fonts citades completes.',
          'Dues fonts amb la informació clau amb paraules nostres, referències completes, dues raons per a cada font, la font de què ens refiem més, i una cosa en què coincideixen o són diferents.',
          'Dues fonts amb la informació clau, amb ajuda; raons copiades de la llista; una referència incompleta, o no comparem les fonts.',
          'Menys de dues fonts, notes copiades, sense referències ni raons, o informació incorrecta.'] },
        { name: 'Què significa i per què a l’escola', sub: 'Grup (1.1)', pct: 5, cells: [
          'Expliquem el significat amb matisos (no tothom ho celebra igual, o ha canviat) i argumentem bé per què ha de ser a l’escola, lligant-ho al respecte per la diversitat.',
          'Expliquem què significa per a la gent que ho celebra i per què ha de tenir un lloc a l’escola, amb respecte per la diversitat cultural.',
          'Diem què significa en una frase senzilla (<i>For many Hindus, Diwali means…</i>) i donem una raó perquè sigui a l’escola, a prop del model.',
          'No diem què significa per a la gent que ho celebra, o en parlem jutjant-ho.'] },
        { name: 'Vincle local i inclusió', sub: 'Grup (1.2)', pct: 10, cells: [
          'Un vincle que uneix de debò les dues cultures, i diverses decisions justificades pensant en qui es podria sentir exclòs.',
          'Diem clarament una cosa en comú amb una celebració local i una decisió perquè el dia sigui per a tothom, amb una raó.',
          'Una cosa en comú senzilla amb una celebració local i una decisió inclusiva, a prop del model.',
          'Cap vincle amb una celebració local o cap decisió inclusiva; o el pla inclou un estereotip o una disfressa que en fa burla.'] },
        { name: 'Estereotips', sub: 'Grup (CC3 3.2)', pct: 10, cells: [
          'Expliquem per què l’estereotip és injust amb un exemple o una dada de la recerca, i diverses decisions del pla el desmunten.',
          'Anomenem un estereotip, expliquem per què és injust i diem una decisió concreta del pla que l’evita.',
          'Anomenem un estereotip amb una frase senzilla i ajuda (<i>Some people think…</i>) i diem que el pla l’evita, sense dir per què és injust.',
          'No anomenem cap estereotip, o el vídeo en repeteix un (imatges, paraules, disfresses).'] },
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
      note: 'Describe the celebration and what it means, compare it with a local one (similarities and differences), explain its origin briefly, plan the day with a timetable, roles and materials, explain at least one decision that makes the event inclusive, and name one stereotype, why it is unfair and how your plan avoids it. Three sources. Email: a full formal email in paragraphs with two welcome actions.',
      rows: [
        { name: 'My part of the video', sub: 'Plan, rehearse and record with the group (3.2)', pct: 25, cells: [
          'I help to lead the planning or rehearsals; my part is fluent, well structured and adapted to an audience that does not know the celebration, with a link to the next speaker; I revised my script on my own after the rehearsal; LS grammar used well (passive, <i>used to</i>, future forms); 35–45 s.',
          'I planned and rehearsed with the group; my part is clear and complete, from a script I revised after the rehearsal (I explained a word, added an example); I only glance at my notes.',
          'I record my part with the group and cover the basic content from a script revised with help; I read parts of it, or make 3–4 grammar errors.',
          'I did not prepare or record my part, or I read an unrevised text the audience cannot follow; I did not take part in the planning.'] },
        { name: 'My email', sub: 'Formal email (5.1)', pct: 15, cells: [
          'Clear, well-linked and persuasive beyond the model (varied linkers, polite requests); few errors, which I corrected on my own.',
          'Four paragraphs (purpose, plan, request, closing); formal register; future forms and a relative clause used correctly; one polite request (<i>Could we…? / Would it be possible…?</i>); I adapt the model.',
          'Purpose, plan and request are there, close to the model; future forms mostly correct; errors that do not block meaning; mostly formal.',
          'Unfinished or hard to understand; no clear purpose or request, or informal.'] },
        welcomeEn, researchEn, meaningEn, linkEn, stereoEn, teamEn, processEn
      ]
    },
    daring: {
      ui: en,
      intro: 'See what is assessed and which level you are at. You work in a Daring group: each member presents one part of the video (35–45 seconds) and writes their own email.',
      note: 'Explain the origin, meaning and how the tradition has changed, compare it with a local celebration, plan the day with a timetable, roles, materials and an estimated cost, and justify every choice so the event is inclusive and challenges stereotypes. Three sources. Email: two welcome actions with reasons, and answer one concern of the head teacher.',
      rows: [
        { name: 'My part of the video', sub: 'Plan, rehearse and record with the group (3.2)', pct: 25, cells: [
          'I help to lead the planning or rehearsals; my part is argued, fluent and adapted to an audience that does not know the celebration, with linking words and a link to the next speaker; accurate LS grammar (passive, <i>used to</i>, future forms, relative clauses); I revised my script on my own; 35–45 s.',
          'I planned and rehearsed with the group; my part is clear, complete and argued, from a script I revised after the rehearsal; I only glance at my notes.',
          'I record my part with the group; description without argument, from a script revised with help; I read parts of it.',
          'I did not prepare or record my part, or I read an unrevised text the audience cannot follow; I did not take part in the planning.'] },
        { name: 'My email', sub: 'Formal email (5.1)', pct: 15, cells: [
          'Clear, well-linked and persuasive beyond the model; the head teacher’s concern answered convincingly; varied, accurate language; few errors, which I corrected on my own.',
          'Four paragraphs in formal register (<i>I would be grateful if…</i>); one concern of the head teacher answered; future forms and relative clauses used correctly; I adapt the model.',
          'Purpose, plan and request close to the model; the concern is missing or answered weakly; errors that do not block meaning.',
          'Unfinished or hard to understand; no clear purpose or request, or informal.'] },
        welcomeEn, researchEn, meaningEn, linkEn, stereoEn, teamEn, processEn
      ]
    }
  };
})();
