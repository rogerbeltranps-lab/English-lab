# How we build a Learning Situation

**The model is 4ESO LS2 *Seasons & Celebrations*.** When Roger says LS2 is finished, every new LS copies it. If Roger later changes something in LS2, the change goes into LS2, into this checklist and into the rules (`AGENTS.md`) at the same time, so the model is always LS2 as it is now. A change only becomes an exception if Roger says it is for one LS only.

Roger does not have to answer anything in advance. For a new LS we copy LS2, and Claude only asks about what is different.

Parts 1–4 are for Roger, in plain language. Part 5 is the technical version for Claude.

**Key:** 👤 Roger decides or approves · 🤖 Claude does it

---

## 1. What a new LS copies from LS2

These are already decided. A new LS keeps them unless Roger says otherwise.

| Topic | How LS2 does it |
| --- | --- |
| Routes and levels | Four routes: Beginners (A1, set only by the teacher), Insecure, Safe and Daring, each at the level of the programme (4ESO: A1 · A2/A2+ with support · B1 · B1/B1+). Beginners and Insecure instructions and help are in Catalan; Safe and Daring are in English. Students see them as **Starter · Base · Core · Plus** (`el-route-names.js`); code, data and docs keep the old names, and the dashboard shows both. |
| Readings | Each route reads its own version of the text, at its level, with the same key information. |
| Listenings and videos | One recording for everyone, at the Safe level. Questions and help change by route. Real videos are mixed with recorded ones. Every listening follows the same cycle: "Before you listen" (predict 2–3 words), a first listen for the gist (one sentence, did you hear your words?), a second listen for the questions, then a micro-dictation of its 2–3 `chunks` (3–6 words, word for word from the script). The prediction and gist boxes come automatically; the LS only supplies the chunks. Never marked. |
| Recorded audio (ElevenLabs) | Claude shows the script with its expression tags and the cost in credits, then sends free voice previews. Roger picks the voices and gives his OK for each recording. The slower copy for Insecure is always made for free. |
| Each learning path | Recall warm-up with no notes, vocabulary and flashcards (15–20 core words per route marked as `core`; the study cards also run Català → English on them, where the student types or says the English before turning the card), practice (done at 80 %), grammar, mixed practice, reading or listening (2–3 dictation `chunks` per listening), and a piece of writing or speaking that is saved for the final product. Writing and speaking are revised: the first version sent for AI feedback is kept as the draft, and the step is done only with an improved final version and a "What I changed" line; the teacher sees both. |
| Grammar that comes back (Roger, 30 Oct 2026) | When the LS brings back grammar an earlier LS taught (R in the programme), only Starter and Base drill the old form again. Core and Plus go straight to the new use or a contrast, with one or two quick checks of the old form at most, and never more old-form items than new ones. Details in `AGENTS.md` (Grammar). |
| The four skills, equally (Roger, 30 Oct 2026: very important) | Every LS works listening, speaking (including talking with someone), reading and writing about equally in its learning paths, about 25 % each. Vocabulary and grammar count as reading and writing, so part of that practice is heard (*Listen and complete*: the computer says the sentence and the student types the missing words) or said (*Say it*: the student says the sentence into the mic). Each learning path also has a *Talk* step (the computer asks a partner's questions and the student answers aloud, recorded) and, where the path has little listening, a *Listen again* step on audio or video the LS already has. Exams stay as they are. Claude shows the four percentages with the plan (step 2). Details in `AGENTS.md`. |
| Skills budget and shadowing (Roger, 30 Oct 2026) | The LS design lists its steps with estimated minutes per skill: about 25 % each, never outside 20–30 %, over the whole LS, class work included. Each learning path after Getting started has a **Shadowing** step (in LS2 only the paths students had not started yet): a 25–45 s part of a recording the LS already has (never changed), with its script and start and end times for the normal and slower copy, done in four rounds and counted by completion. The same clips are on the class shadowing page for the first five minutes of each class. A class runs shadowing 5 · game-theory 10–15 · together 10 · learning path 20 · Blooket 5–10, two classes per learning path. Planned next: an extended reading chapter per learning path built from the course words. Details in AGENTS.md, “The four communicative competences”. |
| Goal and review | Each learning path opens with a one-line card, "El meu objectiu" / "My goal": before starting, the student looks back at their last recall or checkpoint and writes what they want to get better at. It ends with "How did it go?": what helped most and what to review next. It takes about a minute, is never marked and is not a step, and the teacher reads both in the activity on the dashboard. Why: planning before a task and reviewing after it (self-regulated learning, metacognition) is one of the cheapest changes with good evidence, and it makes students use the feedback from their recalls (research audit, Roger 26 Oct 2026). |
| Class presentations | New vocabulary and grammar are introduced in class with a presentation on the projector that asks before it explains: the class guesses each new word first, then sees it, hears it and gets its Catalan meaning. Teams win points (a bonus of up to +0.5 on the term grade), with a buzzer and a class quiz on the students' Chromebooks. Each presentation is linked from its learning path and listed in English Lab. |
| Recall checkpoints | Short reviews every two weeks. On the LS page and in the learning path menu each checkpoint sits right after the learning path it reviews (not grouped at the bottom), and it only asks about learning paths done before it. All four count with their first try (half of the grammar and vocabulary block; the recall warm-ups are another quarter and practice done on time the last quarter). Students must finish each checkpoint to open what comes after it (`checkpoint:true` in the catalogue, in the same order as the LS page), and they are never told which activities are assessed: only the general continuous-assessment note (root `AGENTS.md`, 26 Oct 2026). **Secure since 31 Oct 2026** (`docs/general/secure-checkpoints.md`): items carry an `id`, the panel has `secure`, and answers and hints go in the LS's keys file (outside the repo, uploaded to `cpKeys`), never in `data/*.js`; write more questions than a route needs to give each student their own draw (`secure.n`). |
| Criteria | Every assessment criterion has at least one activity that gives evidence for it, and four levels (NA · AS · AN · AE) with indicators. |
| LS mark | Exam 35 % · final product 25 % · grammar and vocabulary activities 20 % (checkpoints 50 % · warm-ups 25 % · practice on time 25 %) · other competences 20 %. |
| LS page and final product page | The LS page's Final Product tab is only a short card with an "Open the final product →" button. Everything about the final product is on the final product page: it opens with a model final product for the student's route, then what the route must do and what counts, then the steps and the rubric. |
| Final product | Groups from the same route. Only the video is marked as a group; everything else is marked per student. Marked in two rounds, midway and at the end, with a marking PDF for each round. Rubric per route in Word. |
| Exam | A Word exam in Roger's format with a separate key, used to make a Google Form per route. It is marked out of 100, and everything is multiple choice or short gaps except the writing. Exam texts and audio are kept private, never on the site. |
| Sample exam | On the site, in the same format, taken the session before the exam so students know what to study. |
| Study summary | A vocabulary and grammar PDF for each route, which students download from their board, and a Word copy for Roger. |
| Copyright | Everything students can download or print carries the line "© (year) Roger Beltran · English Lab · All rights reserved". |
| Calendar | Dated sessions for each group, the exam day and a due date for each activity, shown on the dashboard and the student board. Students also have a "My week" button on every page with what to do, what is late and the homework. |

## 2. The steps, in order

Each step ends with Roger's OK before the next one starts.

1. **Programme.** 👤 Roger confirms that the LS section of the programme is final: objectives, criteria, competences, vocabulary, grammar and final product. 👤 Roger says anything that should be different from LS2.
2. **Plan.** 🤖 Claude proposes the organisation: learning paths, checkpoints, when groups are formed, final product steps and a rough calendar, with how much each learning path and the whole LS work listening, speaking, reading and writing (about 25 % each). 👤 Roger approves it.
3. **Content.** 🤖 Claude writes all the content for the three routes in one document: texts, questions and scripts. 👤 Roger approves it. Nothing goes on the site before this.
4. **Criteria check.** 🤖 Claude shows which activity gives evidence for each criterion, with the indicators for each level. 👤 Roger approves it.
5. **Site.** 🤖 Claude builds the LS pages and the class presentations for the new vocabulary and grammar. 👤 Roger tries them with the tester account.
6. **Audio and videos.** 🤖 Claude sends the tagged scripts, the cost and the voice previews. 👤 Roger picks the voices and says OK for each recording. 🤖 Claude makes the slow copies for free.
7. **Final product.** 🤖 Claude prepares the final product page: a model final product for each route, the task, the steps, the groups, the rubric per route (Word) and the two marking rounds. 👤 Roger approves the models, the rubric and its weights.
8. **Grading.** 🤖 Claude prepares the LS mark and the few moments when Roger clicks a level on the dashboard. 👤 Roger approves it. Changes to the dashboard are made by the English Lab project, so Roger may need to paste a message there.
9. **Calendar.** 🤖 Claude dates every session, the exam day and the due dates for each group. 👤 Roger checks it on the dashboard's time plan.
10. **Exam.** 🤖 Claude proposes the exam, then makes the Word exam, the key and the audio (private) and the sample exam on the site. 👤 Roger approves it and reviews the Word files.
11. **Study summary.** 🤖 Claude makes the PDF for each route and the Word copy. 👤 Roger checks them.
12. **Go live.** 👤 Roger says "ok merge". 👤 In the dashboard, Roger opens the LS for his groups and turns on graded activities when they are due.

In every step, 🤖 Claude writes each decision down in the rules files (`AGENTS.md`), so both Claude projects work from the same information.

## 3. When Roger changes something later

- 👤 Roger asks for a change in LS2, for example a new way to mark the final product.
- 🤖 Claude changes LS2, updates Part 1 or Part 2 of this checklist and the rules, all in the same pull request.
- From then on, every new LS copies the new version. If the change is meant for one LS only, Roger says so and it stays out of the model.

## 4. What Roger has when an LS is finished

- The LS on the site for the three routes, with learning paths, checkpoints, the final product, the sample exam and Reflect, plus the class presentations in English Lab.
- On the dashboard: the plan and dates, every student's work, the level buttons, the marking PDF for each round, the team points and the LS mark.
- On the student board: the week plan, late reminders, team points and the study summary PDF.
- In the project files (Word): the criteria and indicators, the final product rubric, the exam and its key, and the vocabulary and grammar summary.

---

## 5. Technical notes for Claude

Read the [root AGENTS.md](../../AGENTS.md) and the [LS2 AGENTS.md](../4eso/ls2-seasons-and-celebrations/AGENTS.md) first; they hold the rules. This part says where each step leaves its files, as in LS2.

**Keeping the model alive:** when a change to LS2 alters something in Part 1 or Part 2, update this file in the same PR. A rule that applies to every LS also goes in the root `AGENTS.md`.

| Step | Where it goes (LS2 example) |
| --- | --- |
| 1 Programme | `docs/<course>/programme.md` (regenerate `shared/js/el-criteria.js` with `node tools/gen-criteria.js .` if it changes); new folder `docs/<course>/ls<n>-<name>/` with `AGENTS.md` (rules + dated decision log) and `overview.md`; add it to `docs/README.md` and the root `AGENTS.md` LS list; project-files folder `ls<n>/` for private files |
| 2–3 Plan and content | `overview.md`, dated when approved, items tagged [I] / [S] / [D], section 0 "Rules that apply to every page" |
| 4 Criteria | `assessment-criteria.md`, `competences-grid.md`, `indicators.md` |
| 5 Site | `<course>/<ls>/index.html` (as `4eso/my-real-routine/index.html`), thin page shells + `data/<page>.js` rendered by the engine (`ls2-engine.js`), per-route `media.text`; recall checkpoints placed in the Learning Path grid and in `PAGES` (and any hard-coded `<select>`) right after the Learning Path they review (LS2 decision log, 25 Oct); `shared/js/el-catalog.js` (activities, `EL_ACTIONS`, step criteria, points, `EL_LS`); LS card on the home and course pages and in every LS dropdown; the LS page's Final Product tab is only a short card + "Open the final product →" (root `AGENTS.md`, LS landing page). Class presentations: `lab/vocabulary/<course>-<topic>.html` and `lab/grammar/<course>-<topic>.html`, question-first, with the team points slide and scripts, listed in `lab/index.html` and linked from the Learning Path page with `a.deck-link` + `?from=` (root `AGENTS.md`, Class presentations) |
| 6 Audio and video | `<ls>/audio/*.mp3` + `-slow.mp3`; `<ls>/video/*.mp4` + `-slow.mp4` + `.vtt` + poster; scripts, clips and build scripts in project files; voices and credits in the LS `AGENTS.md` |
| 7 Final product | `final-product-assessment.md`; one final product page with everything on it: "See a model final product" first (the route's model: `<route>-model.html`, a fictional group's slides + what each member says, built like LS2's from project files `ls2/final-product-models/`), then the route task and "What counts", then the engine `step` panels; `<ls>/final-rubric-data.js` (`round`, `group`, `video` per row); Word rubric in project files built from it |
| 8 Grading | `grading.md`; `EL_GRADING[ls]` in `shared/js/el-grading.js` (with `marking` for the marking PDF per round); paste-ready brief in project files for `teacher.html` changes (English Lab project) |
| 9 Calendar | `EL_PLAN[ls]` in `shared/js/el-plan.js` (`groups`, `g`, `exam`, `from`, `due`, `optional`); session lines written as `Mon 2 · LP2 Title (1/2) · …` so the "My week" list finds the days and activities |
| 10 Exam | Project files only, never in the public repo: `ls<n>/exam/` (data, `make-docx.js`, Word + key, audio with no slow copy); sample exam page + `data/sample-exam.js` on the site |
| 11 Study summary | `<ls>/downloads/ls<n>-vocabulary-grammar-{route}.pdf`, `study` in `EL_LS` (the board box and the `data-el-study` card in the LS page's Language & Knowledge tab show it); build scripts as in project files `ls2/grammar-vocabulary/build/`; stamp every PDF with `python3 tools/stamp-copyright.py`, and give student Word files the copyright footer |
| 12 Go live | PRs merged at Roger's OK; retarget stacked PRs to `main` once their base is merged |

**Goal and review card:** `ls2-engine.js` adds it by itself to every learning path page with a `recall` panel (`state.plan[route]`, `state.review[route]`; root `AGENTS.md`, "Goal and review"). A page that does not run on the engine, such as 4ESO LS2 *Getting started*, does not get it: build new pages on the engine, or add the card by hand.

**Lessons from LS2:**
- Confirm the programme is final before building. The revised programme forced a rebuild in PR #54.
- Write readings per route from the start. They were rewritten in PRs #36 and #38.
- Record with `eleven_v3` and tags from the start. The v2 recordings were redone in PRs #51 and #52.
- Agree the exam format before writing the exam. It was rebuilt in PRs #70 and #72.
- Plan the marking rounds before the final product page. They were added late in PR #71.

**First copy: 2ESO LS2 *Free Time, Live!* (25–26 Oct 2026).** Built in one pass from this playbook under Roger's standing permission (decisions listed for him in its [AGENTS.md](../2eso/ls2-free-time-live/AGENTS.md)). What the copy showed:
- The whole LS can run on the engine, Learning Path 1 included: no bespoke first page is needed.
- The build scripts in project files are reusable as they are, with a new data folder: `ls2-2eso/audio-v3/` (gen3.py, build.py), `ls2-2eso/listening-chart/pipeline/` (scenes.py, render.js, build.py: only the scenes, palette and brand change), `ls2-2eso/final-product-models/` (models.py, build.py), `ls2-2eso/exam/` (exam-data.js, make-docx.js: the writing section is the only part tied to the task), `ls2-2eso/grammar-vocabulary/build/` (dump.js reads the data files, build.py).
- `tools/gen-criteria.js` parses both programmes; a new course programme only needs the same four-step bullets per criterion.
- An individual final product needs no group or peer rows: every rubric row is per student and the marking rounds stay the same.
- Expect about 6,500 ElevenLabs credits for an LS with four listenings, two short videos and an exam recording.
