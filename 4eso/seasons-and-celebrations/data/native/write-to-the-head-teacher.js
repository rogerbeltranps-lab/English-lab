/* LS2 · Learning Path 6 · Native route (C2 Proficiency, Roger 30 Oct 2026). Replaces panels by id; others are the Daring version. */
window.LP.native = {
  recall: { type: 'recall', tab: 'Recall', title: 'Recall: Learning Paths 3–5', pill: 'No notes',
    intro: 'Type the answers without looking.',
    items: [
      { q: '___ it rain, we will use the gym. (1 word)', a: ['should'], en: 'Inverted conditional.' },
      { q: 'The event is ___ to take place on 11 December. (arranged)', a: ['due'] },
      { q: 'We still need to iron ___ a few details.', a: ['out'] },
      { q: 'If the band falls ___, we have a playlist.', a: ['through'] },
      { q: 'Organising it was no mean ___.', a: ['feat'] },
      { q: 'The custom ___ from a harvest ritual. (comes from)', a: ['stems'] },
      { q: 'We need to strike a ___ between fun and learning.', a: ['balance'] },
      { q: 'A plan for when things go wrong: a ___ plan', a: ['contingency'] }
    ] },

  vocab: { type: 'vocab', tab: 'Vocabulary', title: 'C2 vocabulary: formal persuasion',
    intro: 'Explore, go through the cards and complete the sentences (80 %). The language of a letter that gets a “yes”.',
    receptive: 'with all due respect · notwithstanding · hereby · forthwith',
    groups: [
      { g: 'Proposing and requesting', items: [
        ['with a view to', 'with the aim of (+ -ing)', 'We are writing with a view to organising a celebration day.'],
        ['we would welcome the opportunity to', 'a polite way to ask for a chance to do something', 'We would welcome the opportunity to present our plan.'],
        ['grant permission', 'to formally allow something', 'We hope you will grant permission for the event.'],
        ['at no cost to', 'without the school having to pay', 'The decorations will be made at no cost to the school.'],
        ['feasible', 'possible and practical to do', 'We believe the plan is entirely feasible.'],
        ['in light of', 'considering (something new)', 'In light of last year’s success, we propose…']] },
      { g: 'Answering concerns', items: [
        ['allay (concerns / fears)', 'to make a worry less strong', 'We hope to allay any concerns about supervision.'],
        ['mindful of', 'aware of and careful about', 'We are mindful of the time this takes from lessons.'],
        ['safeguard', 'to protect from harm', 'Two teachers will safeguard the younger visitors.'],
        ['minimal disruption', 'very little interruption', 'The event will cause minimal disruption to lessons.'],
        ['address (an issue)', 'to deal with a problem', 'We have addressed the issue of space.']] },
      { g: 'Arguing for value', items: [
        ['foster', 'to help something develop', 'The event would foster mutual respect.'],
        ['enhance', 'to improve the quality of something', 'It would enhance the school’s links with families.'],
        ['tangible', 'real and able to be seen or measured', 'The benefits would be tangible.'],
        ['far-reaching', 'having a big effect on many things', 'The effects could be far-reaching.'],
        ['a case in point', 'a good example of what you are saying', 'Last year’s book week is a case in point.']] }
    ],
    core: ['with a view to', 'we would welcome the opportunity to', 'grant permission', 'at no cost to', 'feasible', 'in light of', 'allay (concerns / fears)', 'mindful of', 'minimal disruption', 'address (an issue)', 'foster', 'enhance', 'tangible', 'a case in point'],
    practice: [
      { q: 'We are writing with a ___ to organising a celebration day.', a: ['view'] },
      { q: 'We hope this will ___ any concerns about supervision. (make less strong)', a: ['allay'] },
      { q: 'We are ___ of the time the event takes from lessons. (aware of)', a: ['mindful'] },
      { q: 'The lanterns will be made at no ___ to the school.', a: ['cost'] },
      { q: 'Such an event would ___ respect between communities. (help develop)', a: ['foster'] },
      { q: 'Last year’s book week is a case in ___.', a: ['point'] },
      { q: 'The event will cause minimal ___ (DISRUPT) to lessons.', a: ['disruption'] },
      { q: 'We believe the plan is entirely ___ (FEASIBILITY).', a: ['feasible'] },
      { q: 'In ___ of last year’s success, we propose a longer event.', a: ['light'] },
      { q: 'We hope you will ___ permission for the event.', a: ['grant', 'give'] }
    ] },

  read: { type: 'mc', tab: 'Reading', title: 'Reading: what makes a formal letter persuasive', pill: '80 %',
    media: (window.LP.panels.find(p => p.id === 'read') || {}).media,   // the class's model email
    intro: 'Read your class’s model email again, this time as an examiner. The questions are about how it works, not what it says. Then you will write something better.',
    items: [
      { q: 'What is the function of the first paragraph (“I am writing on behalf of 4t ESO B…”)?', o: ['to state who is writing and the purpose immediately', 'to describe the event in detail', 'to thank the head teacher', 'to answer a concern'] },
      { q: 'Why does the writer mention that information “has been checked in at least two reliable sources”?', o: ['to build credibility before the request', 'to show off the research', 'to fill the word count', 'to criticise other students'] },
      { q: 'The sentence “We also understand that supervision may be a concern” is an example of…', o: ['anticipating an objection', 'a request', 'an apology', 'a complaint'] },
      { q: 'What would most improve the email at C2 level?', o: ['more precise, varied vocabulary and a stronger argument for the educational value', 'more exclamation marks to show enthusiasm', 'shorter paragraphs with one sentence each', 'adding personal opinions about each festival'] },
      { q: 'Which closing would be most appropriate for this letter?', o: ['We would welcome the opportunity to discuss the proposal with you at your convenience.', 'Let us know ASAP!', 'Hope you say yes, thanks a lot.', 'Waiting for your answer.'] },
      { q: 'If the email began “Dear Ms Puig”, the most appropriate sign-off is…', o: ['Yours sincerely', 'Yours faithfully', 'Cheers', 'Best wishes'] }
    ] },

  register: { type: 'mc', tab: 'Register', title: 'Register: choose the C2 formal version', pill: '80 %',
    intro: 'Formal does not mean long or stiff. Choose the version that is formal, precise and natural.',
    items: [
      { q: '“We want to do a party about festivals.”', o: ['We would like to propose a celebration day focusing on festivals of light.', 'We are desirous of performing a festival-related party.', 'We wanna do a festivals party.', 'It is our wish that a party will be done.'], ex: 'Formal and natural: propose + a precise noun phrase. The second is over-formal and unnatural.' },
      { q: '“Don’t worry about the mess, we’ll clean up.”', o: ['Students will be responsible for tidying the hall afterwards.', 'Do not worry about the mess.', 'The mess shall be eliminated by our persons.', 'No worries about cleaning!'], ex: 'Replace the reassurance with a concrete commitment.' },
      { q: '“It would be really, really good for everyone.”', o: ['The event would benefit the whole school community.', 'It would be extremely, extremely beneficial.', 'It would be super good for all.', 'Everyone would like it a lot.'], ex: 'One precise verb (benefit) is stronger than intensifiers.' },
      { q: '“Can you answer quickly because we need to start?”', o: ['We would be grateful for a reply by Friday, so that preparations can begin.', 'Answer quickly, please.', 'We demand an immediate response.', 'Can you answer us really soon?'], ex: 'A polite request with a specific deadline and a reason.' }
    ] },

  grammar: { type: 'typed', tab: 'Grammar', title: 'Politeness and distance in formal requests', pill: '80 %',
    intro: 'Key word transformations (Reading and Use of English, Part 4): 3–8 words including the word in CAPITALS.',
    explain: [
      '<strong>Distancing with past forms:</strong> <em>We were wondering whether… · We were hoping you might…</em>',
      '<strong>Formal requests:</strong> <em>We would be grateful if you could… · It would be much appreciated if… · Would you be willing to…?</em>',
      '<strong>Inversion and formal conditionals:</strong> <em>Should you have any questions… · Were you to agree, we would…</em>',
      '<strong>Passive for diplomacy:</strong> <em>It has been suggested that… · Concerns have been raised about…</em>'
    ],
    items: [
      { q: 'Please could you reply by Friday? GRATEFUL → We ___ reply by Friday.', a: ['would be grateful if you could', 'would be grateful if you would'], en: 'would be grateful if you could.' },
      { q: 'If you have any questions, please contact us. SHOULD → ___ any questions, please contact us.', a: ['should you have'], en: 'Should you have…' },
      { q: 'If you agreed, we would start preparations at once. WERE → ___ agree, we would start preparations at once.', a: ['were you to'], en: 'Were you to + infinitive.' },
      { q: 'Can we use the hall? WONDERING → We ___ use the hall.', a: ['were wondering if we could', 'were wondering whether we could', 'were wondering if we might'], en: 'Distancing past continuous.' },
      { q: 'Some teachers are worried about supervision. RAISED → Concerns ___ about supervision.', a: ['have been raised'], en: 'Diplomatic passive.' },
      { q: 'We will make sure the event does not disrupt lessons. ENSURE → We will ___ no disruption to lessons.', a: ['ensure that there is', 'ensure there is'], en: 'ensure (that) there is…' },
      { q: 'We appreciate your help very much. APPRECIATED → Your help ___.', a: ['is much appreciated', 'is greatly appreciated', 'is very much appreciated'], en: 'is much appreciated.' },
      { q: 'The school will not have to pay anything. COST → The event will be ___ the school.', a: ['at no cost to'], en: 'at no cost to.' },
      { q: 'We think the event is very important. ATTACH → We ___ to the event.', a: ['attach great importance', 'attach a great deal of importance'], en: 'attach importance to.' },
      { q: 'Would you agree to meet us? WILLING → Would ___ meet us?', a: ['you be willing to'], en: 'Would you be willing to…?' }
    ] },

  write: { type: 'writing', product: 5, tab: 'The letter', title: 'Piece 5: a formal letter (C2 Proficiency Writing, Part 2)',
    intro: 'This text is the fifth piece of your final product (your email to the head teacher). Write it as an exam letter.',
    task: 'Write a formal <strong>letter</strong> (280–320 words) to your head teacher proposing your group’s celebration day. Explain what the event would involve and how it would make every student and family feel welcome, address at least two concerns the head teacher might have (for example, lost teaching time, supervision, families who do not celebrate), and request permission and a meeting. The letter should be persuasive without being pushy.',
    model: '<em>Structure only.</em> Purpose in the first sentence (<em>I am writing on behalf of… with a view to…</em>) · The event, concisely · Inclusion: two concrete measures with reasons · Concerns: name them yourself before the reader does, and answer each with a commitment · The value, with one case in point · Request + availability + formal close.',
    min: 280,
    checklist: ['Purpose clear in the first sentence', 'Two concrete inclusion measures, justified', 'At least two concerns raised and answered', 'Polite request for permission and a meeting, with a deadline', 'C2 formal register: precise, varied, never pushy; correct opening and sign-off', '280–320 words'] },

  speak: { type: 'plan', tab: 'Speaking plan', title: 'Speaking: plan your part of the pitch (no recording)',
    part: 'Your group presents the proposal. Your part is about 45 seconds. Plan it here like a C2 Proficiency long turn: structure beats script.',
    question: '<strong>Your part of the pitch: why the head teacher should say yes.</strong>',
    tip: '<p><strong>Open with the listener’s problem, not your idea.</strong> The head teacher worries about time, safety and families. Start there (<em>We know December is already full…</em>), then show how your idea helps.</p>' +
      '<p><strong>The rule of three:</strong> three reasons are easy to remember; five sound like a list. Give the strongest last.</p>' +
      '<p><strong>Don’t memorise sentences, memorise the order.</strong> Three key words on a card. If you lose your place, the next key word brings you back, and you sound natural rather than recited.</p>',
    fields: [
      { id: 'first', label: 'What comes to mind first? (everything)', rows: 3 },
      { id: 'problem', label: 'The listener’s worry you will start with', rows: 2 },
      { id: 'three', label: 'Your three reasons, strongest last', rows: 3 },
      { id: 'card', label: 'Your card: three key words only', rows: 1 },
      { id: 'close', label: 'Your final sentence (the one thing they should remember)', rows: 2 }
    ],
    modelPlan: '<div class="model" style="font-weight:400"><strong>Worry:</strong> “We know December is already full and every lesson counts.”<br><strong>Reasons:</strong> (1) it costs nothing and fits in one morning · (2) every family is invited, and nobody is asked to celebrate, only to learn · (3) strongest: students teach each other, which is the best evidence of learning.<br><strong>Card:</strong> TIME · WELCOME · TEACH<br><strong>Close:</strong> “Give us one morning and we’ll show you what four weeks of learning looks like.”</div>' }
};
