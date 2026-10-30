/* LS2 · Final product rubric. Rendered by shared/js/final-rubric.js.
   One row per LS criterion of the revised programme (24 Oct 2026); the levels follow the indicators in
   docs/4eso/ls2-seasons-and-celebrations/indicators.md (NA = Level 1, AS = 2, AN = 3, AE = 4). Weights approved by Roger on 24 Oct 2026
   (docs/4eso/ls2-seasons-and-celebrations/grading.md): rows 1–5 are individual and make the final product mark (25 % of the LS);
   the other rows are still marked here but count in the LS's "other competences" block (20 %), so their pct is a label. Same-route groups.
   Only the video is marked in groups (Roger, 25 Oct 2026): every group row is a video row; the research card is marked per student.
   round: when the teacher marks the row (Roger, 25 Oct 2026): 1 = after step 2 (research and plan), 2 = after submitting (video, email,
   teamwork, process). The dashboard's marking PDF (teacher.html) reads round, group and video from here, and puts the teammates' average next to
   the `peers` row and the process summary next to the `process` row (docs/4eso/ls2-seasons-and-celebrations/final-product-assessment.md). */
(function () {
  const en = {
    lang: 'en', criterion: 'Criterion',
    levels: [['Level 4', 'Very good'], ['Level 3', 'Good'], ['Level 2', 'Fair'], ['Level 1', 'Developing']],
    heading: 'Rubric for the {route} route', label: 'Rubric {route}', req: 'Route requirement:',
    rounds: { 1: 'Round 1 · after step 2', 2: 'Round 2 · after you submit' },
    calc: '<strong>When is it marked?</strong> Your teacher marks the final product in two rounds: <strong>round 1</strong> after step 2 (your source and your research card), with feedback before the rehearsal, and <strong>round 2</strong> after you submit (the video, your email, teamwork and your process). <strong>How is the grade calculated?</strong> Each row gets a level, which becomes a score: <span class="rubric-pill">Level 4 · 10</span><span class="rubric-pill">Level 3 · 7.5</span><span class="rubric-pill">Level 2 · 5</span><span class="rubric-pill">Level 1 · 2.5</span><span class="rubric-pill">No evidence · 0</span> The rows with a percentage make your final product mark (25 % of the LS mark), and they are all yours. The rows marked “Other competences” count in that part of the LS mark (20 %). Rows marked “Group” are judged on the video and shared by your group; if you did not contribute to the group work, your teacher can lower your group rows by one level.'
  };
  // Label shown instead of a percentage on rows that count in the LS's "other competences" block, not in the final product mark.
  const OTHER = 'Other competences', ALTRES = 'Altres competències';
  // Rows that are the same for Safe and Daring (the indicators do not change by route; the task does).
  const sourceEn = { name: 'My source', sub: 'Step 1: reliable or not, two reasons (4.2)', pct: 15, round: 1, cells: [
    'I rate my source on my own with precise reasons, including its purpose and channel (selling, entertaining, informing), and I see the limits of a good source.',
    'I rate my source correctly with two relevant reasons (author, date, purpose, channel) and explain why our group trusts one source most.',
    'I rate my source with one or two reasons copied from the checklist (author, date) and name the source we trust most.',
    'I give no reasons, or I rate an obviously unreliable source (a shop blog, an anonymous post) as reliable, even with the checklist.'] };
  const welcomeEn = { name: 'Welcome actions', sub: 'In my email (CC1 1.3)', pct: OTHER, round: 2, cells: [
    'Two or more concrete actions with reasons, thinking of different people (families, students who do not celebrate it, newcomers).',
    'Two concrete, realistic actions for students and families (explaining the customs, inviting families, an alternative for those who do not celebrate it).',
    'One concrete action, or two very general ones close to the model.',
    'No concrete action, or only a vague one (<i>everybody can come</i>).'] };
  const researchEn = { name: 'My research card', sub: 'LP4 piece 3, my own card (6.1)', pct: OTHER, round: 1, cells: [
    'Varied, well-chosen sources and organised notes; precise reliability reasons, including purpose and channel; an accurate comparison, and a disagreement resolved by choosing the more reliable source; all three credited.',
    'Three sources with key information in my own words, full credit lines, two relevant reasons for each source, the most trusted one explained, and one point where they agree or differ.',
    'Three sources with key information, with help; reasons copied from the checklist; credits partly complete; agreement or difference missing or vague.',
    'Fewer than three sources, copied notes, no credits or reasons, or wrong information.'] };
  const meaningEn = { name: 'What it means and why it belongs at school', sub: 'Group (1.1)', pct: OTHER, round: 2, group: true, video: true, cells: [
    'We explain the meaning with nuance (not everyone celebrates it the same way, or it has changed) and argue convincingly, linking cultural diversity to rights or to our school community.',
    'We explain what it means for the people who celebrate it and argue for its place at school with respect for cultural diversity.',
    'We say what it means in one simple sentence (<i>For many Hindus, Diwali means…</i>) and give one reason for it at school, close to the model.',
    'We do not say what it means for the people who celebrate it, or we present it in a judging way.'] };
  const linkEn = { name: 'Local link and inclusion', sub: 'Group (1.2)', pct: OTHER, round: 2, group: true, video: true, cells: [
    'A comparison that builds a real link between the two cultures, and several justified decisions that foresee who could feel left out.',
    'A clear, fair comparison with a local celebration (similarities and differences) and an inclusive decision with a reason.',
    'One similarity and one difference, and one inclusive decision, close to the model.',
    'No comparison or no inclusive decision; or the plan includes a stereotype or a caricature costume.'] };
  const stereoEn = { name: 'Stereotypes', sub: 'Group (CC3 3.2)', pct: OTHER, round: 2, group: true, video: true, cells: [
    'We explain why the stereotype is unfair with an example or evidence from our research, and several choices in our plan challenge it.',
    'We name a stereotype, explain why it is unfair and point to a concrete choice in our plan that avoids it.',
    'We name one stereotype in a simple sentence with help (<i>Some people think…</i>) and say our plan avoids it, without saying why it is unfair.',
    'No stereotype named, or the pitch repeats one (images, words, costumes).'] };
  const teamEn = { name: 'Teamwork', sub: 'Your teammates’ ratings (3.2)', pct: 5, round: 2, peers: true, cells: [
    'My teammates rate me 3.5–4 on average: I did my part on time, listened and helped to improve the work.',
    'My teammates rate me 2.5–3.4 on average.',
    'My teammates rate me 1.5–2.4 on average.',
    'My teammates rate me below 1.5, or I did not take part in the group work.'] };
  const processEn = { name: 'My process evidence', sub: 'Steps 0–5 on this page (3.2)', pct: 5, round: 2, process: true, cells: [
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
        rounds: { 1: '1a correcció · després del pas 2', 2: '2a correcció · després d’entregar' },
        calc: '<strong>Quan es corregeix?</strong> El professor corregeix el producte final en dues vegades: la <strong>1a correcció</strong>, després del pas 2 (la teva font i la teva fitxa de recerca), amb comentaris abans de l’assaig, i la <strong>2a correcció</strong>, després d’entregar (el vídeo, el correu, el treball en equip i les evidències). <strong>Com es calcula la nota?</strong> Cada fila rep un nivell, que es converteix en una puntuació: <span class="rubric-pill">Nivell 4 · 10</span><span class="rubric-pill">Nivell 3 · 7,5</span><span class="rubric-pill">Nivell 2 · 5</span><span class="rubric-pill">Nivell 1 · 2,5</span><span class="rubric-pill">Sense evidència · 0</span> Les files amb percentatge fan la nota del producte final (el 25 % de la nota de la LS) i són totes teves. Les files marcades amb “Altres competències” compten en aquesta part de la nota de la LS (el 20 %). Les files marcades amb “Grup” es valoren al vídeo i són del grup; si no has col·laborat en la feina del grup, el professor pot baixar un nivell les teves files de grup.'
      },
      rows: [
        { name: 'La meva part del vídeo', sub: 'Planificar, assajar i gravar en grup (3.2)', pct: 40, round: 2, video: true, cells: [
          'Ajudo a planificar i assajar; la meva part és clara i completa, pensada per a algú que no coneix la celebració, i enllaço amb el company següent; he millorat el guió pel meu compte després de l’assaig; 40–60 segons; només miro les notes.',
          'He planificat i assajat amb el grup; la meva part és clara i completa i he millorat el guió després de l’assaig (he explicat una paraula, he afegit un exemple); només miro les notes de tant en tant.',
          'Gravo la meva part amb el grup i dic el contingut bàsic (què, quan, on, costums) amb un guió que he millorat amb ajuda; en llegeixo trossos.',
          'No preparo ni gravo la meva part, o llegeixo un text sense revisar que no s’entén; no participo a la planificació.'] },
        { name: 'El meu correu', sub: 'Correu formal (5.1)', pct: 35, round: 2, cells: [
          'Un correu clar i ben enllaçat que va més enllà de la plantilla (connectors variats, peticions educades); pocs errors, i els corregeixo jo.',
          'Plantilla completa i adaptada: salutació i comiat formals, per què escric, el pla amb formes de futur (<i>will</i>, <i>going to</i>) i una petició; registre formal; com a màxim 2–3 errors.',
          'Hi ha el propòsit, el pla i la petició, molt a prop de la plantilla; errors que no impedeixen entendre’l; gairebé tot formal.',
          'Incomplet o no s’entén; no queda clar per què escric ni què demano, o és informal (<i>Hi</i>, <i>thanks</i>).'] },
        { name: 'La meva font', sub: 'Pas 1: fiable o no, dues raons (4.2)', pct: 15, round: 1, cells: [
          'Valoro la meva font pel meu compte amb raons precises, també per a què s’ha publicat i on (vendre, entretenir, informar), i veig els límits d’una bona font.',
          'Valoro bé la meva font amb dues raons adequades (qui l’ha escrit, quan, per a què, on es publica) i explico per què el grup es refia més d’una font.',
          'Valoro la meva font amb una o dues raons copiades de la llista (qui l’ha escrit, quan) i dic de quina font ens refiem més.',
          'No dono raons, o dic que una font clarament poc fiable (el blog d’una botiga, un missatge anònim) és fiable, fins i tot amb la llista.'] },
        { name: 'Treball en equip', sub: 'Valoració dels companys (3.2)', pct: 5, round: 2, peers: true, cells: [
          'Els companys em valoren de mitjana 3,5–4: he fet la meva part a temps, he escoltat i he ajudat a millorar la feina.',
          'Els companys em valoren de mitjana 2,5–3,4.',
          'Els companys em valoren de mitjana 1,5–2,4.',
          'Els companys em valoren per sota d’1,5, o no he participat en la feina del grup.'] },
        { name: 'Les meves evidències', sub: 'Passos 0–5 d’aquesta pàgina (3.2)', pct: 5, round: 2, process: true, cells: [
          'He entregat tots els passos a temps, concrets i amb les meves paraules, amb una autoavaluació sincera.',
          'He entregat tots els passos; un és tard o molt general.',
          'Falten un o dos passos.',
          'Falten la majoria de passos.'] },
        { name: 'Accions de benvinguda', sub: 'Al meu correu (CC1 1.3)', pct: ALTRES, round: 2, cells: [
          'Dues accions concretes o més, amb una raó, pensant en persones diferents (famílies, alumnes que no ho celebren, alumnes nous).',
          'Dues accions concretes i realistes per als alumnes i les famílies (explicar els costums, convidar les famílies, una alternativa per a qui no ho celebra).',
          'Una acció concreta, o dues de molt generals copiades del model.',
          'Cap acció concreta, o només una idea vaga (<i>everybody can come</i>).'] },
        { name: 'La meva fitxa de recerca', sub: 'Peça 3 del LP4, la meva fitxa (6.1)', pct: ALTRES, round: 1, cells: [
          'Fonts ben triades i notes ordenades; raons precises de per què cada font és fiable (qui, quan, per què, on es publica); si dues fonts no coincideixen, trio la més fiable; les dues fonts citades completes.',
          'Dues fonts amb la informació clau amb paraules meves, referències completes, dues raons per a cada font, la font de què em refio més, i una cosa en què coincideixen o són diferents.',
          'Dues fonts amb la informació clau, amb ajuda; raons copiades de la llista; una referència incompleta, o no comparo les fonts.',
          'Menys de dues fonts, notes copiades, sense referències ni raons, o informació incorrecta.'] },
        { name: 'Què significa i per què a l’escola', sub: 'Grup (1.1)', pct: ALTRES, round: 2, group: true, video: true, cells: [
          'Expliquem el significat amb matisos (no tothom ho celebra igual, o ha canviat) i argumentem bé per què ha de ser a l’escola, lligant-ho al respecte per la diversitat.',
          'Expliquem què significa per a la gent que ho celebra i per què ha de tenir un lloc a l’escola, amb respecte per la diversitat cultural.',
          'Diem què significa en una frase senzilla (<i>For many Hindus, Diwali means…</i>) i donem una raó perquè sigui a l’escola, a prop del model.',
          'No diem què significa per a la gent que ho celebra, o en parlem jutjant-ho.'] },
        { name: 'Vincle local i inclusió', sub: 'Grup (1.2)', pct: ALTRES, round: 2, group: true, video: true, cells: [
          'Un vincle que uneix de debò les dues cultures, i diverses decisions justificades pensant en qui es podria sentir exclòs.',
          'Diem clarament una cosa en comú amb una celebració local i una decisió perquè el dia sigui per a tothom, amb una raó.',
          'Una cosa en comú senzilla amb una celebració local i una decisió inclusiva, a prop del model.',
          'Cap vincle amb una celebració local o cap decisió inclusiva; o el pla inclou un estereotip o una disfressa que en fa burla.'] },
        { name: 'Estereotips', sub: 'Grup (CC3 3.2)', pct: ALTRES, round: 2, group: true, video: true, cells: [
          'Expliquem per què l’estereotip és injust amb un exemple o una dada de la recerca, i diverses decisions del pla el desmunten.',
          'Anomenem un estereotip, expliquem per què és injust i diem una decisió concreta del pla que l’evita.',
          'Anomenem un estereotip amb una frase senzilla i ajuda (<i>Some people think…</i>) i diem que el pla l’evita, sense dir per què és injust.',
          'No anomenem cap estereotip, o el vídeo en repeteix un (imatges, paraules, disfresses).'] }
      ]
    },
    safe: {
      ui: en,
      intro: 'See what is assessed and which level you are at. You work in a Safe group: each member presents one part of the video (35–45 seconds) and writes their own email.',
      note: 'Describe the celebration and what it means, compare it with a local one (similarities and differences), explain its origin briefly, plan the day with a timetable, roles and materials, explain at least one decision that makes the event inclusive, and name one stereotype, why it is unfair and how your plan avoids it. Three sources. Email: a full formal email in paragraphs with two welcome actions.',
      rows: [
        { name: 'My part of the video', sub: 'Plan, rehearse and record with the group (3.2)', pct: 40, round: 2, video: true, cells: [
          'I help to lead the planning or rehearsals; my part is fluent, well structured and adapted to an audience that does not know the celebration, with a link to the next speaker; I revised my script on my own after the rehearsal; LS grammar used well (passive, <i>used to</i>, future forms); 35–45 s.',
          'I planned and rehearsed with the group; my part is clear and complete, from a script I revised after the rehearsal (I explained a word, added an example); I only glance at my notes.',
          'I record my part with the group and cover the basic content from a script revised with help; I read parts of it, or make 3–4 grammar errors.',
          'I did not prepare or record my part, or I read an unrevised text the audience cannot follow; I did not take part in the planning.'] },
        { name: 'My email', sub: 'Formal email (5.1)', pct: 35, round: 2, cells: [
          'Clear, well-linked and persuasive beyond the model (varied linkers, polite requests); few errors, which I corrected on my own.',
          'Four paragraphs (purpose, plan, request, closing); formal register; future forms and a relative clause used correctly; one polite request (<i>Could we…? / Would it be possible…?</i>); I adapt the model.',
          'Purpose, plan and request are there, close to the model; future forms mostly correct; errors that do not block meaning; mostly formal.',
          'Unfinished or hard to understand; no clear purpose or request, or informal.'] },
        sourceEn, teamEn, processEn, welcomeEn, researchEn, meaningEn, linkEn, stereoEn
      ]
    },
    daring: {
      ui: en,
      intro: 'See what is assessed and which level you are at. You work in a Daring group: each member presents one part of the video (35–45 seconds) and writes their own email.',
      note: 'Explain the origin, meaning and how the tradition has changed, compare it with a local celebration, plan the day with a timetable, roles, materials and an estimated cost, and justify every choice so the event is inclusive and challenges stereotypes. Three sources. Email: two welcome actions with reasons, and answer one concern of the head teacher.',
      rows: [
        { name: 'My part of the video', sub: 'Plan, rehearse and record with the group (3.2)', pct: 40, round: 2, video: true, cells: [
          'I help to lead the planning or rehearsals; my part is argued, fluent and adapted to an audience that does not know the celebration, with linking words and a link to the next speaker; accurate LS grammar (passive, <i>used to</i>, future forms, relative clauses); I revised my script on my own; 35–45 s.',
          'I planned and rehearsed with the group; my part is clear, complete and argued, from a script I revised after the rehearsal; I only glance at my notes.',
          'I record my part with the group; description without argument, from a script revised with help; I read parts of it.',
          'I did not prepare or record my part, or I read an unrevised text the audience cannot follow; I did not take part in the planning.'] },
        { name: 'My email', sub: 'Formal email (5.1)', pct: 35, round: 2, cells: [
          'Clear, well-linked and persuasive beyond the model; the head teacher’s concern answered convincingly; varied, accurate language; few errors, which I corrected on my own.',
          'Four paragraphs in formal register (<i>I would be grateful if…</i>); one concern of the head teacher answered; future forms and relative clauses used correctly; I adapt the model.',
          'Purpose, plan and request close to the model; the concern is missing or answered weakly; errors that do not block meaning.',
          'Unfinished or hard to understand; no clear purpose or request, or informal.'] },
        sourceEn, teamEn, processEn, welcomeEn, researchEn, meaningEn, linkEn, stereoEn
      ]
    }
  };
  // Beginners (A1, 26 Oct 2026): the Insecure rubric with its own video, email and research-card rows (fewer requirements, same levels).
  const ins = window.finalRubricData.insecure;
  window.finalRubricData.beginners = {
    ui: ins.ui,
    intro: 'Mira què es valora i en quin nivell ets. Ets a la ruta Beginners (A1): presentes una part curta del vídeo (30–45 segons) amb la pauta i escrius el correu amb la plantilla emplenada.',
    note: 'Descriviu una celebració amb 4–5 frases de la pauta (què, quan, on, dos costums, un menjar), una cosa que té en comú amb una celebració local i dues activitats per al dia amb l’hora; un estereotip amb Some people think… i com l’eviteu. Una font per persona. Correu: la plantilla emplenada amb el banc de paraules i una acció de benvinguda.',
    rows: [
      { name: 'La meva part del vídeo', sub: 'Planificar, assajar i gravar en grup (3.2)', pct: 40, round: 2, video: true, cells: [
        'Assajo amb el grup; dic la meva part sencera (4–5 frases de la pauta) de manera clara i sense llegir, i afegeixo una frase meva; he millorat el guió després de l’assaig; 30–45 segons.',
        'He assajat amb el grup; dic les frases de la pauta de la meva part de manera clara, mirant només les notes; he canviat una cosa del guió després de l’assaig.',
        'Gravo la meva part amb el grup i dic 2–3 frases de la pauta amb ajuda; en llegeixo trossos o em falta una dada (quan, on o un costum).',
        'No preparo ni gravo la meva part, o llegeixo un text que no s’entén; no participo a la planificació.'] },
      { name: 'El meu correu', sub: 'Correu formal (5.1)', pct: 35, round: 2, cells: [
        'La plantilla completa i una o dues frases meves; salutació i comiat formals; la data, el lloc, dues coses que hi haurà, una acció de benvinguda i una petició (<i>Could we…?</i>); pocs errors.',
        'La plantilla completa amb el banc de paraules: Dear…, per què escric, la data, el lloc, què hi haurà (<i>There will be…</i>), una acció de benvinguda, una petició i Yours sincerely; com a màxim 3–4 errors que no impedeixen entendre’l.',
        'La plantilla gairebé completa: falta una part (la petició, l’acció de benvinguda o la data) o hi ha errors que fan difícil entendre una frase.',
        'La plantilla sense omplir o amb la meitat dels buits buits; no s’entén per què escric; o és informal (<i>Hi</i>, <i>bye</i>).'] },
      ins.rows[2], ins.rows[3], ins.rows[4], ins.rows[5],
      { name: 'La meva fitxa de recerca', sub: 'Peça 3 del LP4, la meva fitxa (6.1)', pct: ALTRES, round: 1, cells: [
        'Una font ben triada, notes ordenades amb les meves paraules, la referència completa i dues raons precises de per què és fiable (qui, quan, per a què, on es publica).',
        'Una font amb la informació clau amb paraules meves, la referència completa i dues raons per dir si és fiable.',
        'Una font amb la informació clau, amb ajuda; una raó copiada de la llista; la referència incompleta.',
        'Cap font, notes copiades, sense referència ni raons, o informació incorrecta.'] },
      ins.rows[7], ins.rows[8], ins.rows[9]
    ]
  };
// Native (C2 Proficiency, Roger 30 Oct 2026): the Daring rubric with its own video and email rows, written on the four Cambridge C2
  // writing subscales (Content, Communicative Achievement, Organisation, Language) and mapped onto the same NA–AE levels.
  const dar = window.finalRubricData.daring;
  window.finalRubricData.native = {
    ui: dar.ui,
    intro: 'See what is assessed and which level you are at. You are on the Native route (C2 Proficiency): the same final product as your group, judged against C2 Proficiency standards.',
    note: 'Your part of the video is the most demanding one in the group: the meaning of the celebration and why it belongs at school, argued with nuance for an audience that does not know it. Your email is the formal letter from Learning Path 6 (280–320 words) and is marked on the four Cambridge C2 writing scales: Content, Communicative Achievement, Organisation and Language.',
    rows: [
      { name: 'My part of the video', sub: 'Plan, rehearse and record with the group (3.2) · C2 standard', pct: 40, round: 2, video: true, cells: [
        'I help to lead the group; my part develops a clear position with nuance (a concession and a turn), is perfectly adapted to the audience, flows naturally from and into the next speaker, and uses precise, idiomatic language without reading; 35–45 s.',
        'My part is fluent and well organised, with a clear point, a reason and an example; register suits the audience; I use some C2 language naturally (emphasis, hedging); I glance at my notes only.',
        'My part is fluent but descriptive rather than argued, or too long for the audience; it relies on everyday language; I read parts of it.',
        'I did not prepare or record my part, or it is unplanned and hard for the audience to follow.'] },
      { name: 'My email', sub: 'Formal letter (5.1) · Cambridge C2 writing scales', pct: 35, round: 2, cells: [
        'Content: every point fully developed, concerns answered convincingly · Communicative achievement: persuasive without being pushy, register flawless · Organisation: seamless, varied cohesion · Language: precise, sophisticated and natural (inversion, formal conditionals, collocation).',
        'All points covered and developed · consistent formal register that holds the reader’s attention · clearly organised with varied linking · a wide range of vocabulary and structures with only occasional slips.',
        'Points covered but some underdeveloped · register mostly right but slips into informal or over-formal · organisation clear but mechanical · good control, with a limited range for C2.',
        'Task only partly achieved, register wrong for a head teacher, ideas listed rather than organised, or under 240 words.'] }
    ].concat(dar.rows.slice(2))
  };
})();
