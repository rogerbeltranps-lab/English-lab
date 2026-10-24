# 4ESO · LS2 Seasons & Celebrations

Read the [root AGENTS.md](../../../AGENTS.md) first; this file adds what is specific to this LS.

- **Content:** [overview.md](overview.md), approved by Roger on 23 Oct 2026 (later approvals are dated in it). The overview numbers the Learning Paths LP0–LP5; on the site they are Learning Paths 1–6, plus 7 (Final product). Programme: [LS2 in the 4ESO programme](../programme.md#ls2--4eso--seasons--celebrations).
- **Final product rubric:** [final-product-assessment.md](final-product-assessment.md): groups, who presents what, individual and group marks, peer assessment and rubrics (draft until Roger approves).
- **Activities and criteria:** [assessment-criteria.md](assessment-criteria.md) maps each activity to the LS2 assessment criteria.
- **Pages:** `4eso/seasons-and-celebrations/`. Learning Paths 2–6, the checkpoints, the final product, the sample exam and Reflect are thin shells; their content is in `data/<page>.js` and `ls2-engine.js` renders it (recall, vocabulary + flashcards + practice, multiple choice, typed grammar, writing with AI feedback, forms, checklists, speaking). Learning Path 1 (`getting-started.html`) is a standalone page with five steps: recall, words, reading (*Autumn in two places*, one chat per route), listening (the illustrated origins video in `video/`: `halloween-castanyada.mp4`, ~2:05, and `-slow.mp4` for Insecure, ~2:32, each with a `.vtt`; the real Halloween video is an optional extra) and speaking.
- **Effective-learning rules used everywhere:** a recall warm-up with no notes opens each Learning Path; earlier vocabulary comes back in the flashcard deck and the recall items; auto-corrected steps complete at 80 %; typed answers show the answer only after a second wrong try; every Learning Path ends with a product piece saved for the Final Product page.
- **Listenings:** pitched at the Safe level (B1) for every route; the questions adapt to each route. Real, level-appropriate videos (Learning Path 2: BBC / British Council "Happy Diwali"; the Fun Easy English "Halloween" video is an optional extra in Learning Path 1) are mixed with scripted listenings generated with ElevenLabs (`audio/*.mp3`, scripts in the data files). All three scripted MP3s exist (podcast, student council meeting, Winter Fair announcement), each with a `-slow` copy; on the Insecure route the engine shows a "Versió més lenta" button that swaps to the slow copy. Until an MP3 exists, the page reads the script with the browser's voices.
- **Readings:** one text per route in every reading (Learning Paths 1, 2, 4, 6 and the sample exam), as in the root rule.
- **ElevenLabs voices for this LS:** Emma = Alice, Sam = George, Laia = Jessica, Omar = Liam, radio presenter = Daniel.
- Recall checkpoints count by completion; the first attempt (score and date) is sent to the dashboard as `parts.first`.
- Activity ids in `el-catalog.js` start with `4eso/ls2-`, and `el-cloud.js` matches pages by path, so they never clash with My Real Routine pages of the same name.

## Decision log

Newest first. One line per decision; update a line instead of adding a contradicting one.

| Date | Decision |
| --- | --- |
| 2026-10-24 | Approved by Roger: rubric weights (my part 25, email 20, research 10, inclusion 10, event plan 15, teamwork 10, process evidence 10), video 2–3 min with parts of 40–60 s (Insecure) and 35–45 s (Safe, Daring), pronunciation inside "My part"; checkpoints tagged 4.1 + 5.1 as formative evidence, Reflect has no criterion; checkpoints 2–3 optional homework; dated sessions per group (4ESO-A exam Fri 20 Nov, 4ESO-B Wed 18 Nov) in `shared/js/el-plan.js`. |
| 2026-10-24 | Final product page: steps 0–5 (+ feedback to another group) use the engine's `step` panel type: individual task fields, self-assessment 1–4 per statement, optional comment, optional teammate ratings. Hand-ins are saved in `state.steps` of `ls2FinalProduct4ESO`; the teacher dashboard ("Final product steps") reads them from the synced progress doc. Self-assessment does not change the mark by itself. |
| 2026-10-24 | Final product groups are same-route (Roger), formed by the teacher; individual marks for each student's part of the pitch and email, group marks for research, inclusion and plan, plus peer-assessed teamwork. Details in [final-product-assessment.md](final-product-assessment.md), draft. |
| 2026-10-24 | Final product route requirements now ask every route for evidence of CC1 1.3 and CE2 2.3 at its level (Insecure: time + person per activity, one welcome idea; Safe: one inclusive decision; Daring: estimated cost). Rubric draft in [final-product-assessment.md](final-product-assessment.md), awaiting approval. |
| 2026-10-24 | Final product tags in `el-catalog.js` now match its "What counts" box: 1.1–1.3, 3.1, 3.2, 4.2, 5.1, 6.1, 6.2, CC1 1.3, CE2 2.3 (approved by Roger). |
| 2026-10-24 | Calendar (3 classes a week from 26 Oct): Learning Paths 1–3, 5, 6, checkpoint 1, checkpoint 4 + sample exam and the exam (4ESO-A Fri 20 Nov, 4ESO-B Wed 18 Nov) in term 1; Research it right, the final product (deadline 11 Dec) and Reflect in term 2, where the final product mark goes. Checkpoints 2 and 3 are optional homework. Week by week in `shared/js/el-plan.js` (teacher dashboard). |
| 2026-10-24 | Scripted listenings added: `audio/culture-bites-origins`, `student-council-meeting`, `winter-fair-announcement` (+ `-slow`). Insecure gets a button to switch to the slow copy. |
| 2026-10-24 | Origins video published: podcast clips 00–05 reused plus 8 Castanyada lines; re-voiced with eleven_v3 (Emma = Amelia, Sam = Julian) after Roger approved the v3 voices, 1280×720 H.264 yuv420p, normal + slow (atempo 0.85) built locally, subtitles in WebVTT. Build script: illustrated scenes rendered with Playwright, joined with ffmpeg crossfades. |
| 2026-10-24 | Activities are linked to criteria by the skill each step practises (reading 4.1, listening 2.1, speaking 3.1, writing 5.1) plus the integrated competences its content targets; see [assessment-criteria.md](assessment-criteria.md). Proposed label fixes await Roger's approval. |
| 2026-10-24 | Getting Started: the origins video (Halloween + Castanyada, ElevenLabs voices, normal and slow copies with subtitles) is the listening; *Autumn in two places* became a reading with one chat per route. |
| 2026-10-24 | LS2 landing page follows the LS1 structure, with learning objectives and assessment criteria from the programme. No percentages in "What counts" until Roger gives them. |
| 2026-10-24 | Every reading has one version per route, with one extra Daring question each. |
| 2026-10-23 | Overview approved; real listenings are mixed with ElevenLabs ones; the respectful-wording and note-taking tasks in Research it right are multiple choice on every route. |
