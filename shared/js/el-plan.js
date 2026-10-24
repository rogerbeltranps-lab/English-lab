// Teaching calendar per LS, shown on the teacher dashboard. Edit the rows here when the plan changes.
// term: rows start a new term block when it changes. assess: what that term's mark is built from.
window.EL_PLAN={
  "4eso-seasons-and-celebrations":{
    note:"3 classes a week, starting 26 Oct 2026. Term 1 ends on 20 Nov, so the exam is in term 1 and the final product moves to term 2 (its mark goes into the term 2 report).",
    terms:{
      1:{title:"Term 1 · Learning Paths and exam",assess:"Exam + Learning Path work · criteria 2.1, 4.1, 5.1, 3.1, 1.1"},
      2:{title:"Term 2 · Final product",assess:"Final product (group pitch + individual email) · criteria 1.2–1.3, 3.1–3.2, 4.2, 6.1–6.2, CC1 1.3, CE2 2.3"}
    },
    rows:[
      {term:1,when:"Week 1 · 26–29 Oct",what:"Learning Path 1: Getting started (Castanyada & Halloween, school celebration on 29 Oct) · start Learning Path 2: Celebrations around the world",note:"30 Oct: no school"},
      {term:1,when:"Week 2 · 2–6 Nov",what:"Finish Celebrations around the world · Recall checkpoint 1 (5-minute warm-up) · form same-route groups and choose the celebration · Learning Path 3: Where traditions come from"},
      {term:1,when:"Week 3 · 9–13 Nov",what:"Learning Path 5: Plan the day · Learning Path 6: Write to the head teacher"},
      {term:1,when:"Week 4 · 16–20 Nov",what:"Recall checkpoint 4 + Sample exam (the class before the exam) · EXAM (about 18–19 Nov) · one spare class to catch up",note:"20 Nov: term 1 ends"},
      {term:2,when:"Week 5 · 23–27 Nov",what:"Learning Path 4: Research it right (research card with the group)",note:"Self-assessment week"},
      {term:2,when:"Week 6 · 30 Nov–4 Dec",what:"Final product: event plan and Google Slides · individual preparation dossier due (about 4 Dec)"},
      {term:2,when:"Week 7 · 9–11 Dec",what:"Final product: record the group pitch and write the individual formal email · deliver on Google Classroom by 11 Dec",note:"7–8 Dec: no school"},
      {term:2,when:"Next class after 11 Dec",what:"Reflect · feedback on the final product",note:"15–18 Dec: projecte propi (all hours)"}
    ],
    extra:"Recall checkpoints 2 and 3 are optional homework."
  }
};
