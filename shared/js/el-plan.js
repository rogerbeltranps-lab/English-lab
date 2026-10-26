// Teaching calendar per LS, shown on the teacher dashboard. Edit the rows here when the plan changes.
// term: rows start a new term block when it changes. assess: what that term's mark is built from.
// groups: one column per class group; each row lists that group's dated sessions (one per line).
// due: last session of each activity per group (same order as groups), YYYY-MM-DD; "done on time" on the dashboard means done by the end of that day.
//   The student board lists each activity in the week of its due date and reminds the student when it is past and not done.
// optional: optional activities (homework) per group, same shape as due; the floating to-do list (el-todo.js) shows them on that day, never late.
// exam: exam day per group (same order as groups), YYYY-MM-DD. from: Monday of each row's week, YYYY-MM-DD (finds "this week").
// tips: teaching tips for the teacher's checklist (dashboard Time plan tab, never shown to students): [text, tip]; the tip appears under
//   every session line that contains the text (for example "LP2 (2/2)" or "Recall checkpoint 1"). Short, practical, taken from the LS docs.
// A new plan (for example 2 ESO LS2) is one more entry with these fields; groups use the names "2ESO-A", "2ESO-B"…
window.EL_PLAN={
  "4eso-seasons-and-celebrations":{
    note:"Starts 26 Oct 2026. 4ESO-A: Mon 8:30 · Wed 12:00 · Fri 13:00. 4ESO-B: Mon 15:00 · Tue 9:30 · Wed 10:30. Term 1 ends on 20 Nov, so the exam is in term 1 and the final product is in term 2 (its mark goes into the term 2 report). LP = Learning Path.",
    terms:{
      1:{title:"Term 1 · Learning Paths and exam",assess:"Exam (35 %) + grammar and vocabulary activities (20 %, automatic) · criteria 4.1, 2.2, 5.1 (exam, LP2 reading log, LP3 listening chart) · other competences start from the Learning Paths (docs/4eso/ls2-seasons-and-celebrations/grading.md)"},
      2:{title:"Term 2 · Final product",assess:"Final product (25 %: my part, email, my source, teamwork, process) + other competences (20 %: LP4 research card and the final product content rows) · criteria 3.2, 5.1, 4.2 · 6.1, 1.1, 1.2, CC1 1.3, CC3 3.2 · marked in two rounds: round 1 after step 2 (my source, research sheet), round 2 after submitting (video, email, teamwork, process) · the LS2 mark closes here"}
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
    optional:{
      "4eso/ls2-recall-checkpoint-2":["2026-11-06","2026-11-03"],
      "4eso/ls2-recall-checkpoint-3":["2026-11-11","2026-11-09"]
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
        "Mon 23 · LP4 Research it right (1/2)\nWed 25 · LP4 (2/2) · Step 1 My source\nFri 27 · Event plan · Step 0 My pieces · Step 2 My contribution · Round 1 marking",
        "Mon 23 · LP4 Research it right (1/2)\nTue 24 · LP4 (2/2) · Step 1 My source\nWed 25 · Event plan · Step 0 My pieces · Step 2 My contribution · Round 1 marking"],
        note:"Self-assessment week · Step 0 needs piece 3 (LP4 research card), so it is due with step 2 · Round 1 (my source, research sheet): marking PDF from the dashboard, feedback before the rehearsal"},
      {term:2,from:"2026-11-30",when:"Week 6 · 30 Nov–4 Dec",g:[
        "Mon 30 · Google Slides\nWed 2 · Rehearse the parts · Step 3 My part\nFri 4 · Record the draft video",
        "Mon 30 · Google Slides\nTue 1 · Rehearse the parts · Step 3 My part\nWed 2 · Record the draft video"]},
      {term:2,from:"2026-12-07",when:"Week 7 · 7–11 Dec",g:[
        "Wed 9 · Feedback to another group · fix the video · Step 4 My email\nFri 11 · Submit on Classroom (deadline)",
        "Wed 9 · Feedback to another group · fix the video · Step 4 My email\nSubmit on Classroom by Fri 11 (deadline)"],
        note:"7–8 Dec: no school"},
      {term:2,from:"2026-12-14",when:"Week 8 · 14 Dec",g:[
        "Mon 14 · Step 5 Teamwork · Reflect · Round 2 marking",
        "Mon 14 · Step 5 Teamwork · Reflect · Round 2 marking"],
        note:"Round 2 (video, email, teamwork, process): marking PDF from the dashboard, video watched on Classroom · 15–18 Dec: projecte propi (all hours) · 22 Dec–7 Jan: holidays"}
    ],
    extra:"Recall checkpoints 2 and 3 are optional homework. 4ESO-A has 11 classes before the exam and 4ESO-B has 12, so only 4ESO-B gets a catch-up class.",
    tips:[
      ["LP1 Getting started","Start with the recall warm-up (My Real Routine) with no notes: the first try is what counts. Play the origins video for everyone; Insecure students can switch to the slow copy. End with “Which celebrations would you like to explore?”: you use the answers to form the groups next week."],
      ["LP2 Celebrations around the world","Point out the yellow “first try counts” note before they start. The reading has one text per route. The reading log is a hand-in: give it a level (NA · AS · AN · AE) on the dashboard, because it is the only level for 4.1 (the exam gives a score)."],
      ["LP2 (2/2)","Finish the grammar (It is celebrated / takes place / is held, on · in · at) and product piece 1. Level the LP2 reading logs this week while they are fresh."],
      ["Recall checkpoint 1","5 minutes at the very start of the class, no notes and before any review: the first try counts in the grammar and vocabulary block."],
      ["form same-route groups","You form the groups inside each route (Insecure 3, Safe and Daring 3–4), not friends' choice, so you can separate pairs that do not work well. Each group chooses its celebration today: pieces 2, 4 and 5 are about it."],
      ["Form same-route groups","You form the groups inside each route (Insecure 3, Safe and Daring 3–4), not friends' choice, so you can separate pairs that do not work well. Each group chooses its celebration today: pieces 2, 4 and 5 are about it."],
      ["LP3 Where traditions come from","The podcast is at Safe level for everyone; Insecure has the “Versió més lenta” button. The listening chart on the Mei and Noah videos is the level moment for 2.2: give it a level on the dashboard."],
      ["LP3 (2/2)","Product piece 2 is about the group's celebration. Set recall checkpoint 2 as optional homework (it only counts if it raises their mark)."],
      ["LP5 Plan the day","Future forms: going to (plans), will (decisions, predictions), Present Continuous (arrangements). Every route's event plan needs two actions so every student and family feels welcome (CC1 1.3): check they are there."],
      ["LP5 (2/2)","Set recall checkpoint 3 as optional homework."],
      ["LP6 Write to the head teacher","Formal email: draft → AI feedback → final version. Insecure uses the guided template; Daring also answers one concern of the head teacher. The two welcome actions go in the email too."],
      ["LP6 (2/2)","Check every student saved the email as product piece 5: they paste it again in final product step 4."],
      ["Recall checkpoint 4","Counts (first try), and covers everything except LP4. Do it before the catch-up or the review."],
      ["Catch-up","Open the group's tab first: “n late” lists who still owes which activity, so you know who to sit with."],
      ["Sample exam","Same format and points as the real exam. Their email gets a ChatGPT guide mark: remind them it can be wrong and that you mark the real one. Note the common mistakes and review them at the start of the exam day."],
      ["EXAM","The Google Forms are created closed: open the route's Form at the start and close it at the end. The exam audio (project files ls2/exam/audio) is played twice in class, never posted. Then enter the section scores and the email level on the dashboard."],
      ["LP4 Research it right","Term 2 starts here. The research card is handed in and marked per student (round 1): two sources for Insecure, three for Safe and Daring, each rated with two reasons and a credit line."],
      ["Step 1 My source","One source each, 3–5 notes in their own words, a credit line and reliable or not with two reasons."],
      ["Round 1 marking","Download the round 1 marking PDF from the dashboard (my source, research card) and give feedback before the rehearsal."],
      ["Google Slides","One or two slides per part, short text and an image, credits on the last slide. Do a short check-in with every Insecure group."],
      ["Rehearse the parts","Each part lasts 40–60 s (Insecure) or 35–45 s (Safe and Daring); the video 2–3 minutes. Step 3: their script, what they changed after the rehearsal and key notes."],
      ["Record the draft video","Every member presents their own part, with face and slides visible."],
      ["Step 4 My email","They paste the final email in step 4 so it reaches the round 2 marking PDF; Classroom is only for the video."],
      ["Submit on Classroom","Deadline Fri 11 Dec: remind them the day before and check who has not submitted on Classroom."],
      ["Step 5 Teamwork","Peer assessment of each teammate: use it, with what you saw, to give one level less on the group rows to a student who did not contribute."],
      ["Reflect","Reflect reads their four checkpoint first tries. Talk about the gap between their self-assessment and your levels."],
      ["Round 2 marking","Round 2 marking PDF: the video rows once per group (watch it on Classroom), then my part, email, teamwork and process per student."]
    ]
  },
  "2eso-free-time-live":{
    note:"Starts 27 Oct 2026. 2ESO-A: Tue 12:00 · Thu 12:00 · Fri 8:30. 2ESO-B: Tue 10:30 · Thu 8:30 · Fri 9:30 (same days, so both groups follow the same plan). Term 1 ends on 20 Nov, so the exam is in term 1 and the final product (the vlog) is in term 2. No classes on 30 Oct, 7–8 Dec and 15–18 Dec (projecte propi), so the vlog is submitted on Thu 10 Dec. LP = Learning Path.",
    terms:{
      1:{title:"Term 1 · Learning Paths and exam",assess:"Exam (35 %) + grammar and vocabulary activities (20 %, automatic) · criteria 4.1, 2.2, 5.1 (exam, LP2 reading log, LP3 listening chart) · other competences start from the Learning Paths (docs/2eso/ls2-free-time-live/grading.md)"},
      2:{title:"Term 2 · Final product",assess:"Final product (25 %: my vlog, my script and slides, my source, process) + other competences (20 %: fact file and credits, recording and editing, screen tips) · criteria 3.2, 5.1, 4.2 · 6.2, CD2 2.2, CD4 4.5 · marked in two rounds: round 1 after step 2 (my source, fact file), round 2 after submitting (vlog, script, editing, tip, process) · the LS2 mark closes here"}
    },
    groups:["2ESO-A","2ESO-B"],
    exam:["2026-11-20","2026-11-20"],
    due:{
      "2eso/ls2-getting-started":["2026-10-27","2026-10-27"],
      "2eso/ls2-what-are-they-doing":["2026-11-03","2026-11-03"],
      "2eso/ls2-recall-checkpoint-1":["2026-11-03","2026-11-03"],
      "2eso/ls2-now-or-usually":["2026-11-06","2026-11-06"],
      "2eso/ls2-likes-and-screen-tips":["2026-11-12","2026-11-12"],
      "2eso/ls2-write-your-vlog-script":["2026-11-17","2026-11-17"],
      "2eso/ls2-recall-checkpoint-4":["2026-11-17","2026-11-17"],
      "2eso/ls2-sample-exam":["2026-11-19","2026-11-19"],
      "2eso/ls2-check-the-source":["2026-11-26","2026-11-26"],
      "2eso/ls2-free-time-vlog":["2026-12-10","2026-12-10"],
      "2eso/ls2-reflect":["2026-12-11","2026-12-11"]
    },
    optional:{
      "2eso/ls2-recall-checkpoint-2":["2026-11-06","2026-11-06"],
      "2eso/ls2-recall-checkpoint-3":["2026-11-12","2026-11-12"]
    },
    rows:[
      {term:1,from:"2026-10-26",when:"Week 1 · 26–30 Oct",g:[
        "Tue 27 · LP1 Getting started\nThu 29 · LP2 What are they doing? (1/2)",
        "Tue 27 · LP1 Getting started\nThu 29 · LP2 What are they doing? (1/2)"],
        note:"29 Oct: Castanyada/Halloween at school · 30 Oct: no school"},
      {term:1,from:"2026-11-02",when:"Week 2 · 2–6 Nov",g:[
        "Tue 3 · LP2 (2/2) · Recall checkpoint 1 (5 min) · pair the vlog buddies (same route), choose the hobby or event\nThu 5 · LP3 Now or usually? (1/2)\nFri 6 · LP3 (2/2)",
        "Tue 3 · LP2 (2/2) · Recall checkpoint 1 (5 min) · pair the vlog buddies (same route), choose the hobby or event\nThu 5 · LP3 Now or usually? (1/2)\nFri 6 · LP3 (2/2)"]},
      {term:1,from:"2026-11-09",when:"Week 3 · 9–13 Nov",g:[
        "Tue 10 · LP5 Likes and screen tips (1/2)\nThu 12 · LP5 (2/2)\nFri 13 · LP6 Write your vlog script (1/2)",
        "Tue 10 · LP5 Likes and screen tips (1/2)\nThu 12 · LP5 (2/2)\nFri 13 · LP6 Write your vlog script (1/2)"]},
      {term:1,from:"2026-11-16",when:"Week 4 · 16–20 Nov",g:[
        "Tue 17 · LP6 (2/2) · Recall checkpoint 4\nThu 19 · Sample exam\nFri 20 · EXAM",
        "Tue 17 · LP6 (2/2) · Recall checkpoint 4\nThu 19 · Sample exam\nFri 20 · EXAM"],
        note:"20 Nov: term 1 ends"},
      {term:2,from:"2026-11-23",when:"Week 5 · 23–27 Nov",g:[
        "Tue 24 · LP4 Check the source (1/2)\nThu 26 · LP4 (2/2) · Fact file · Step 1 My source\nFri 27 · Step 0 My pieces · Step 2 My slides · Round 1 marking",
        "Tue 24 · LP4 Check the source (1/2)\nThu 26 · LP4 (2/2) · Fact file · Step 1 My source\nFri 27 · Step 0 My pieces · Step 2 My slides · Round 1 marking"],
        note:"Self-assessment week · Step 0 needs piece 3 (LP4 fact file), so it is due with step 2 · Round 1 (my source, fact file): marking PDF from the dashboard, feedback before recording"},
      {term:2,from:"2026-11-30",when:"Week 6 · 30 Nov–4 Dec",g:[
        "Tue 1 · Google Slides (photos, captions)\nThu 3 · Rehearse with the vlog buddy · Step 3 My script\nFri 4 · Record the first version",
        "Tue 1 · Google Slides (photos, captions)\nThu 3 · Rehearse with the vlog buddy · Step 3 My script\nFri 4 · Record the first version"]},
      {term:2,from:"2026-12-07",when:"Week 7 · 7–11 Dec",g:[
        "Thu 10 · Feedback for the vlog buddy · edit the video · Step 4 Record and edit · Submit on Classroom (deadline)\nFri 11 · Step 5 My tip · Reflect",
        "Thu 10 · Feedback for the vlog buddy · edit the video · Step 4 Record and edit · Submit on Classroom (deadline)\nFri 11 · Step 5 My tip · Reflect"],
        note:"7–8 Dec: no school · Round 2 (vlog, script, editing, tip, process): marking PDF from the dashboard during 14–18 Dec (projecte propi, no English classes), video watched on Classroom · 22 Dec–7 Jan: holidays"}
    ],
    extra:"Recall checkpoints 2 and 3 are optional homework. Both groups have 11 classes before the exam, as 4ESO-A.",
    tips:[
      ["LP1 Getting started","Start with the recall warm-up (My Real Routine: routine verbs, Present Simple) with no notes. Tell them about the yellow note: only the first try counts. “Where are you?” is at Safe level for everyone; Insecure has the slow copy."],
      ["LP2 What are they doing?","Present Continuous with clothes, kit and weather. The reading log is a hand-in: give it a level (NA · AS · AN · AE) on the dashboard, because it is the only level for 4.1 (the exam gives a score)."],
      ["LP2 (2/2)","Finish the grammar (-ing spelling, short answers) and product piece 1, “In this photo…”. Level the reading logs this week."],
      ["Recall checkpoint 1","5 minutes at the very start of the class, no notes and before any review: the first try counts in the grammar and vocabulary block."],
      ["pair the vlog buddies","You pair the buddies inside each route. The vlog is individual: buddies research together and give feedback, but nothing is marked in pairs. Each student picks their own hobby or event today."],
      ["LP3 Now or usually?","Present Simple vs Present Continuous with time expressions. The listening chart on the Mei and Noah videos is the level moment for 2.2: give it a level on the dashboard."],
      ["LP3 (2/2)","Product piece 2, “I usually… but today…”. Set recall checkpoint 2 as optional homework (it only counts if it raises their mark)."],
      ["LP5 Likes and screen tips","like / love / hate + -ing and imperatives. “Screen smart” gives the tips. Product piece 4 (their screen tips) feeds the vlog's tips slide and step 5 (CD4 4.5)."],
      ["LP5 (2/2)","Set recall checkpoint 3 as optional homework."],
      ["LP6 Write your vlog script","Show Noa's climbing vlog: seven slides (greeting · live now · usually · photo or facts · likes · tips · credits). The full script is product piece 5: Insecure 90–120 words with the template, Safe 130–170, Daring 170–220."],
      ["LP6 (2/2)","Check every student saved the script as piece 5, and let them rehearse it aloud."],
      ["Recall checkpoint 4","Counts (first try), and covers everything except LP4."],
      ["Sample exam","Same format and points as the real exam. Their vlog script gets a ChatGPT guide mark: remind them it can be wrong and that you mark the real one. Note the common mistakes and review them at the start of the exam day."],
      ["EXAM","The Google Forms are created closed: open the route's Form at the start and close it at the end. The exam audio (project files ls2-2eso/exam/audio) is played twice in class, never posted. Then enter the section scores and the writing level on the dashboard."],
      ["LP4 Check the source","Term 2 starts here. Insecure works from the given source (“Skateboarding”, Encyclopedia website). The fact file is piece 3 and a level moment for 4.2 and 6.2."],
      ["Step 1 My source","One source each, rated reliable or not with two reasons, and its credit."],
      ["Step 0 My pieces","Step 0 needs piece 3 (the LP4 fact file), so it is due with step 2."],
      ["Round 1 marking","Download the round 1 marking PDF from the dashboard (LP4 fact file, my source, fact file and credits) and give feedback before they record."],
      ["Google Slides","Seven slides as in the model vlog: a photo and a caption each, credits on the last slide (for a photo, who took it)."],
      ["Rehearse with the vlog buddy","The vlog lasts 1.5–2 minutes. Step 3: the final script, what they changed and key notes."],
      ["Record the first version","Buddies watch each other's first recording next class and give feedback (not marked)."],
      ["Submit on Classroom","Deadline today: check who has not submitted the vlog on Classroom before the end of the class."],
      ["Step 5 My tip","The screen tip they applied: the level moment for CD4 4.5 in round 2."],
      ["Reflect","Reflect reads their four checkpoint first tries. Talk about the gap between their self-assessment and your levels. Round 2 marking PDF during 14–18 Dec."]
    ]
  }
};
