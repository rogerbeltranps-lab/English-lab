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
| Routes and levels | Three routes: Insecure, Safe and Daring, each at the level of the programme (4ESO: A2/A2+ with support · B1 · B1/B1+). Insecure instructions and help are in Catalan; Safe and Daring are in English. |
| Readings | Each route reads its own version of the text, at its level, with the same key information. |
| Listenings and videos | One recording for everyone, at the Safe level. Questions and help change by route. Real videos are mixed with recorded ones. |
| Recorded audio (ElevenLabs) | Claude shows the script with its expression tags and the cost in credits, then sends free voice previews. Roger picks the voices and gives his OK for each recording. The slower copy for Insecure is always made for free. |
| Each learning path | Recall warm-up with no notes, vocabulary and flashcards, practice (done at 80 %), grammar, mixed practice, reading or listening, and a piece of writing or speaking that is saved for the final product. |
| Class presentations | New vocabulary and grammar are introduced in class with a presentation on the projector that asks before it explains: the class guesses each new word first, then sees it, hears it and gets its Catalan meaning. Teams win points (a bonus of up to +0.5 on the term grade), with a buzzer and a class quiz on the students' Chromebooks. Each presentation is linked from its learning path and listed in English Lab. |
| Recall checkpoints | Short reviews every two weeks. They count when they are done, and the first try is recorded. |
| Criteria | Every assessment criterion has at least one activity that gives evidence for it, and four levels (NA · AS · AN · AE) with indicators. |
| LS mark | Exam 35 % · final product 25 % · grammar and vocabulary activities 20 % · other competences 20 %. |
| LS page and final product page | The LS page's Final Product tab is only a short card with an "Open the final product →" button. Everything about the final product is on the final product page: it opens with a model final product for the student's route, then what the route must do and what counts, then the steps and the rubric. |
| Final product | Groups from the same route. Only the video is marked as a group; everything else is marked per student. Marked in two rounds, midway and at the end, with a marking PDF for each round. Rubric per route in Word. |
| Exam | A Word exam in Roger's format with a separate key, used to make a Google Form per route. It is marked out of 100, and everything is multiple choice or short gaps except the writing. Exam texts and audio are kept private, never on the site. |
| Sample exam | On the site, in the same format, taken the session before the exam so students know what to study. |
| Study summary | A vocabulary and grammar PDF for each route, which students download from their board, and a Word copy for Roger. |
| Copyright | Everything students can download or print carries the line "© (year) Roger Beltran · English Lab · All rights reserved". |
| Calendar | Dated sessions for each group, the exam day and a due date for each activity, shown on the dashboard and the student board. Students also have a "My week" button on every page with what to do, what is late and the optional homework. |

## 2. The steps, in order

Each step ends with Roger's OK before the next one starts.

1. **Programme.** 👤 Roger confirms that the LS section of the programme is final: objectives, criteria, competences, vocabulary, grammar and final product. 👤 Roger says anything that should be different from LS2.
2. **Plan.** 🤖 Claude proposes the organisation: learning paths, checkpoints, when groups are formed, final product steps and a rough calendar. 👤 Roger approves it.
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
| 5 Site | `<course>/<ls>/index.html` (as `4eso/my-real-routine/index.html`), thin page shells + `data/<page>.js` rendered by the engine (`ls2-engine.js`), per-route `media.text`; `shared/js/el-catalog.js` (activities, `EL_ACTIONS`, step criteria, points, `EL_LS`); LS card on the home and course pages and in every LS dropdown; the LS page's Final Product tab is only a short card + "Open the final product →" (root `AGENTS.md`, LS landing page; PR #80, pending when this was written). Class presentations: `lab/vocabulary/<course>-<topic>.html` and `lab/grammar/<course>-<topic>.html`, question-first, with the team points slide and scripts, listed in `lab/index.html` and linked from the Learning Path page with `a.deck-link` + `?from=` (root `AGENTS.md`, Class presentations) |
| 6 Audio and video | `<ls>/audio/*.mp3` + `-slow.mp3`; `<ls>/video/*.mp4` + `-slow.mp4` + `.vtt` + poster; scripts, clips and build scripts in project files; voices and credits in the LS `AGENTS.md` |
| 7 Final product | `final-product-assessment.md`; one final product page with everything on it: "See a model final product" first (the route's model), then the route task and "What counts", then the engine `step` panels; `<ls>/final-rubric-data.js` (`round`, `group`, `video` per row); Word rubric in project files built from it |
| 8 Grading | `grading.md`; `EL_GRADING[ls]` in `shared/js/el-grading.js` (with `marking` for the marking PDF per round); paste-ready brief in project files for `teacher.html` changes (English Lab project) |
| 9 Calendar | `EL_PLAN[ls]` in `shared/js/el-plan.js` (`groups`, `g`, `exam`, `from`, `due`, `optional`); session lines written as `Mon 2 · LP2 Title (1/2) · …` so the "My week" list finds the days and activities |
| 10 Exam | Project files only, never in the public repo: `ls<n>/exam/` (data, `make-docx.js`, Word + key, audio with no slow copy); sample exam page + `data/sample-exam.js` on the site |
| 11 Study summary | `<ls>/downloads/ls<n>-vocabulary-grammar-{route}.pdf`, `study` in `EL_LS`; build scripts as in project files `ls2/grammar-vocabulary/build/`; stamp every PDF with `python3 tools/stamp-copyright.py`, and give student Word files the copyright footer |
| 12 Go live | PRs merged at Roger's OK; retarget stacked PRs to `main` once their base is merged |

**Lessons from LS2:**
- Confirm the programme is final before building. The revised programme forced a rebuild in PR #54.
- Write readings per route from the start. They were rewritten in PRs #36 and #38.
- Record with `eleven_v3` and tags from the start. The v2 recordings were redone in PRs #51 and #52.
- Agree the exam format before writing the exam. It was rebuilt in PRs #70 and #72.
- Plan the marking rounds before the final product page. They were added late in PR #71.
