/* LS2 · Final product · Native route (C2 Proficiency, Roger 30 Oct 2026): same steps as the group, with C2 requirements. Adds a 'native'
   version to the texts the engine picks by route (byLevel); everything else is the Daring version. Rubric: final-rubric-data.js (native). */
(function () {
  const P = id => window.LP.panels.find(p => p.id === id) || {};
  const task = P('task'), html = task.html;
  task.html = level => html(level) + (level === 'native' ? '<div class="model" style="margin-top:14px"><strong>Native route (C2 Proficiency):</strong> you work with your group like everyone else, but your pieces are the C2 ones from your Learning Paths: the article (piece 1), the Part 1 essay (piece 2), the proposal (piece 4) and the formal letter (piece 5, your email). In the video, take the part that needs the most argument: what the celebration means and why it belongs at school. Help your group with language, but do not write their parts for them: the video is marked as the group’s work.</div>' : '');
  if (P('part').rate) P('part').rate.native = ['My part argues a position with nuance (a concession and a turn), not just a description', 'I adapted my language to an audience that does not know the celebration, without talking down to them', 'I can say it from three key words, without reading', 'I link smoothly from and into my teammates’ parts', 'It lasts 35–45 seconds'];
  if (P('email').rate) P('email').rate.native = ['Content: every point developed, at least two concerns answered', 'Communicative achievement: persuasive, never pushy; correct opening and sign-off', 'Organisation: each paragraph has one job; varied linking', 'Language: precise, natural C2 (inversion, formal conditionals, collocations)', '280–320 words'];
})();
