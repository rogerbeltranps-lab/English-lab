// Teaching calendar per LS, shown on the teacher dashboard. Edit the rows here when the plan changes.
// term: rows start a new term block when it changes. assess: what that term's mark is built from.
// groups: one column per class group; each row lists that group's dated sessions (one per line).
// due: last session of each activity per group (same order as groups), YYYY-MM-DD; "done on time" on the dashboard means done by the end of that day.
//   The student board lists each activity in the week of its due date and reminds the student when it is past and not done.
// exam: exam day per group (same order as groups), YYYY-MM-DD. from: Monday of each row's week, YYYY-MM-DD (finds "this week").
// A new plan (for example 2 ESO LS2) is one more entry with these fields; groups use the names "2ESO-A", "2ESO-B"…
window.EL_PLAN={
  "4eso-seasons-and-celebrations":{
    note:"Starts 26 Oct 2026. 4ESO-A: Mon 8:30 · Wed 12:00 · Fri 13:00. 4ESO-B: Mon 15:00 · Tue 9:30 · Wed 10:30. Term 1 ends on 20 Nov, so the exam is in term 1 and the final product is in term 2 (its mark goes into the term 2 report). LP = Learning Path.",
    terms:{
      1:{title:"Term 1 · Learning Paths and exam",assess:"Exam (35 %) + grammar and vocabulary activities (20 %, automatic) · criteria 4.1, 2.2, 5.1 (exam, LP2 reading log, LP3 listening chart) · other competences start from the Learning Paths (docs/4eso/ls2-seasons-and-celebrations/grading.md)"},
      2:{title:"Term 2 · Final product",assess:"Final product (25 %: my part, email, my source, teamwork, process) + other competences (20 %: LP4 research card and the final product content rows) · criteria 3.2, 5.1, 4.2 · 6.1, 1.1, 1.2, CC1 1.3, CC3 3.2 · the LS2 mark closes here"}
    },
    groups:["4ESO-A","4ESO-B"],
    exam:["2026-11-20","2026-11-18"],
    due:{
      "4eso/ls2-getting-started":["2026-10-26","2026-10-26"],
      "4eso/ls2-celebrations-around-the-world":["2026-11-02","2026-10-28"],
      "4eso/ls2-recall-checkpoint-1":["2026-11-02","2026-11-02"],
      "4eso/ls2-where-traditions-come-from":["2026-11-06","2026-11-03"],
      "4eso/ls2-plan-the-day":["2026-11-11","2026-11-09"],
      "4eso/ls2-write-to-the-head-teacher":["2026-11-16","2026-11-11"],
      "4eso/ls2-recall-checkpoint-4":["2026-11-16","2026-11-16"],
      "4eso/ls2-sample-exam":["2026-11-18","2026-11-17"],
      "4eso/ls2-research-it-right":["2026-11-25","2026-11-24"],
      "4eso/ls2-celebration-day-proposal":["2026-12-11","2026-12-11"],
      "4eso/ls2-reflect":["2026-12-14","2026-12-14"]
    },
    rows:[
      {term:1,from:"2026-10-26",when:"Week 1 · 26–30 Oct",g:[
        "Mon 26 · LP1 Getting started\nWed 28 · LP2 Celebrations around the world (1/2)",
        "Mon 26 · LP1 Getting started\nTue 27 · LP2 Celebrations around the world (1/2)\nWed 28 · LP2 (2/2)"],
        note:"29 Oct: Castanyada/Halloween at school · 30 Oct: no school"},
      {term:1,from:"2026-11-02",when:"Week 2 · 2–6 Nov",g:[
        "Mon 2 · LP2 (2/2) · Recall checkpoint 1 (5 min)\nWed 4 · Form same-route groups, choose the celebration · LP3 Where traditions come from (1/2)\nFri 6 · LP3 (2/2)",
        "Mon 2 · Recall checkpoint 1 (5 min) · form same-route groups, choose the celebration · LP3 Where traditions come from (1/2)\nTue 3 · LP3 (2/2)\nWed 4 · LP5 Plan the day (1/2)"]},
      {term:1,from:"2026-11-09",when:"Week 3 · 9–13 Nov",g:[
        "Mon 9 · LP5 Plan the day (1/2)\nWed 11 · LP5 (2/2)\nFri 13 · LP6 Write to the head teacher (1/2)",
        "Mon 9 · LP5 (2/2)\nTue 10 · LP6 Write to the head teacher (1/2)\nWed 11 · LP6 (2/2)"]},
      {term:1,from:"2026-11-16",when:"Week 4 · 16–20 Nov",g:[
        "Mon 16 · LP6 (2/2) · Recall checkpoint 4\nWed 18 · Sample exam\nFri 20 · EXAM",
        "Mon 16 · Catch-up · Recall checkpoint 4\nTue 17 · Sample exam\nWed 18 · EXAM"],
        note:"20 Nov: term 1 ends"},
      {term:2,from:"2026-11-23",when:"Week 5 · 23–27 Nov",g:[
        "Mon 23 · LP4 Research it right (1/2) · Step 0 My pieces\nWed 25 · LP4 (2/2) · Step 1 My source\nFri 27 · Event plan · Step 2 My contribution",
        "Mon 23 · LP4 Research it right (1/2) · Step 0 My pieces\nTue 24 · LP4 (2/2) · Step 1 My source\nWed 25 · Event plan · Step 2 My contribution"],
        note:"Self-assessment week"},
      {term:2,from:"2026-11-30",when:"Week 6 · 30 Nov–4 Dec",g:[
        "Mon 30 · Google Slides\nWed 2 · Rehearse the parts · Step 3 My part\nFri 4 · Record the draft video",
        "Mon 30 · Google Slides\nTue 1 · Rehearse the parts · Step 3 My part\nWed 2 · Record the draft video"]},
      {term:2,from:"2026-12-07",when:"Week 7 · 7–11 Dec",g:[
        "Wed 9 · Feedback to another group · fix the video · Step 4 My email\nFri 11 · Submit on Classroom (deadline)",
        "Wed 9 · Feedback to another group · fix the video · Step 4 My email\nSubmit on Classroom by Fri 11 (deadline)"],
        note:"7–8 Dec: no school"},
      {term:2,from:"2026-12-14",when:"Week 8 · 14 Dec",g:[
        "Mon 14 · Step 5 Teamwork · Reflect",
        "Mon 14 · Step 5 Teamwork · Reflect"],
        note:"15–18 Dec: projecte propi (all hours) · 22 Dec–7 Jan: holidays"}
    ],
    extra:"Recall checkpoints 2 and 3 are optional homework. 4ESO-A has 11 classes before the exam and 4ESO-B has 12, so only 4ESO-B gets a catch-up class."
  }
};
