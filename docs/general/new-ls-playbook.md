# How we build a Learning Situation

**The model is 4ESO LS2 *Seasons & Celebrations*.** When Roger says LS2 is finished, every new LS copies it. If Roger later changes something in LS2, the change goes into LS2, into this checklist and into the rules (`AGENTS.md`) at the same time, so the model is always LS2 as it is now. A change only becomes an exception if Roger says it is for one LS only.

Roger does not have to answer anything in advance. For a new LS we copy LS2, and Claude only asks about what is different.

Parts 1–4 are for Roger, in plain language. Part 5 is the technical version for Claude.

**Key:** 👤 Roger decides or approves · 🤖 Claude does it

---

## 1. What a new LS copies from LS2, and how it looks

Every rule a new LS keeps from LS2 (routes, readings, listenings, each learning path, the four skills, shadowing, goal and review, presentations, checkpoints, criteria, LS mark, final product, exam, study summary, calendar) and the **site look checklist** are in [How we work - Work requirements › 5](../REQUIREMENTS.md#5-designing-a-learning-situation), the one rulebook (21 Nov 2026). When Roger changes LS2, that file changes in the same PR. This playbook keeps the steps.

## 2. The steps, in order

Each step ends with Roger's OK before the next one starts.

1. **Programme.** 👤 Roger confirms that the LS section of the programme is final: objectives, criteria, competences, vocabulary, grammar and final product. 👤 Roger says anything that should be different from LS2.
2. **Plan.** 🤖 Claude proposes an overview guide for the whole LS: learning paths, checkpoints, when groups are formed, final product steps and a rough calendar, with how much each learning path and the whole LS work listening, speaking, reading and writing (about 25 % each). 👤 Roger approves it.
3. **Content.** 🤖 Claude writes all the content for the three routes in one document: texts, questions and scripts. 👤 Roger approves it. Nothing goes on the site before this.
4. **Criteria check.** 🤖 Claude shows which activity gives evidence for each criterion, with the indicators for each level. 👤 Roger approves it.
5. **Site, one week at a time** (Roger, 21 Nov 2026). 🤖 Claude drafts what happens in each class of the coming week (two main activities per class, REQUIREMENTS.md › 5). 👤 Roger checks it and says what to build. 🤖 Claude builds only that week's pages, games and class presentations. 👤 Roger tries them with the tester account. Then the next week.
6. **Audio and videos.** 🤖 Claude sends the tagged scripts, the cost and the voice previews. 👤 Roger picks the voices and says OK for each recording. 🤖 Claude makes the slow copies for free.
7. **Final product.** 🤖 Claude prepares the final product page: a model final product for each route, the task, the steps, the groups, the rubric per route (Word) and the two marking rounds. 👤 Roger approves the models, the rubric and its weights.
8. **Grading.** 🤖 Claude prepares the LS mark and the few moments when Roger clicks a level on the dashboard. 👤 Roger approves it. Changes to the dashboard are made by the English Lab project, so Roger may need to paste a message there.
9. **Calendar.** 🤖 Claude dates every session, the exam day and the due dates for each group. 👤 Roger checks it on the dashboard's time plan.
10. **Exam.** Follow the exam guide in [How we work - Work requirements › 6](../REQUIREMENTS.md#6-making-an-exam) (Roger's exam guide, updated for web exams). 🤖 Claude proposes the format, then builds the web exam (Base and Core papers, versions A/B/C; source and key only in project files and Drive), its audio and the sample exam on the site. 👤 Roger approves it and the tester account tries it first.
11. **Study summary.** 🤖 Claude makes the PDF for each route and the Word copy. 👤 Roger checks them.
12. **Go live.** 👤 Roger says "ok merge". 👤 In the dashboard, Roger opens the LS for his groups and turns on graded activities when they are due.

In every step, 🤖 Claude writes each decision down in the rules files (`AGENTS.md`), so both Claude projects work from the same information.

## 3. When Roger changes something later

- 👤 Roger asks for a change in LS2, for example a new way to mark the final product.
- 🤖 Claude changes LS2, updates the rules in REQUIREMENTS.md › 5 and Part 2 of this checklist, all in the same pull request.
- From then on, every new LS copies the new version. If the change is meant for one LS only, Roger says so and it stays out of the model.

## 4. What Roger has when an LS is finished

- The LS on the site for the three routes, with learning paths, checkpoints, the final product, the sample exam and Reflect, plus the class presentations in English Lab.
- On the dashboard: the plan and dates, every student's work, the level buttons, the marking PDF for each round, the team points and the LS mark.
- On the student board: the week plan, late reminders, team points and the study summary PDF.
- In the project files (Word): the criteria and indicators, the final product rubric, the exam and its key, and the vocabulary and grammar summary.

---

## 5. Technical notes for Claude

Read the [root AGENTS.md](../../AGENTS.md) and the [LS2 AGENTS.md](../4eso/ls2-seasons-and-celebrations/AGENTS.md) first; they hold the rules. This part says where each step leaves its files, as in LS2.

**Keeping the model alive:** when a change to LS2 alters a rule, update REQUIREMENTS.md › 5 (and Part 2 here if a step changes) in the same PR. Its technical detail goes in the root `AGENTS.md`.

| Step | Where it goes (LS2 example) |
| --- | --- |
| 1 Programme | `docs/<course>/programme.md` (regenerate `shared/js/el-criteria.js` with `node tools/gen-criteria.js .` if it changes); new folder `docs/<course>/ls<n>-<name>/` with `AGENTS.md` (rules + dated decision log) and `overview.md`; add it to `docs/README.md` and the root `AGENTS.md` LS list; project-files folder `ls<n>/` for private files |
| 2–3 Plan and content | `overview.md`, dated when approved, items tagged [I] / [S] / [D], section 0 "Rules that apply to every page" |
| 4 Criteria | `assessment-criteria.md`, `competences-grid.md`, `indicators.md` |
| 5 Site | `<course>/<ls>/index.html` (as `4eso/my-real-routine/index.html`), thin page shells + `data/<page>.js` rendered by the engine (`ls2-engine.js`), per-route `media.text`; recall checkpoints placed in the Learning Path grid and in `PAGES` (and any hard-coded `<select>`) right after the Learning Path they review (LS2 decision log, 25 Oct); `shared/js/el-catalog.js` (activities, `EL_ACTIONS`, step criteria, points, `EL_LS`); LS card on the home and course pages and in every LS dropdown; the LS page's Final Product tab is only a short card + "Open the final product →" (root `AGENTS.md`, LS landing page). Class presentations: `lab/vocabulary/<course>-<topic>.html` and `lab/grammar/<course>-<topic>.html`, question-first, with the team points slide and scripts, listed in `lab/index.html` and linked from the Learning Path page with `a.deck-link` + `?from=` (root `AGENTS.md`, Class presentations) |
| 6 Audio and video | `<ls>/audio/*.mp3` + `-slow.mp3`; `<ls>/video/*.mp4` + `-slow.mp4` + `.vtt` + poster; scripts, clips and build scripts in project files; voices and credits in the LS `AGENTS.md` |
| 7 Final product | `final-product-assessment.md`; one final product page with everything on it: "See a model final product" first (the route's model: `<route>-model.html`, a fictional group's slides + what each member says, built like LS2's from project files `ls2/final-product-models/`), then the route task and "What counts", then the engine `step` panels; `<ls>/final-rubric-data.js` (`round`, `group`, `video` per row); Word rubric in project files built from it |
| 8 Grading | `grading.md`; `EL_GRADING[ls]` in `shared/js/el-grading.js` (with `marking` for the marking PDF per round); paste-ready brief in project files for `teacher.html` changes (English Lab project) |
| 9 Calendar | `EL_PLAN[ls]` in `shared/js/el-plan.js` (`groups`, `g`, `exam`, `from`, `due`, `optional`); session lines written as `Mon 2 · LP2 Title (1/2) · …` so the dashboard and the board find the days and activities (students have no week plan: ✅ To do and 🏠 Homework, 6 Nov 2026) |
| 10 Exam | Source and key in project files only (`web-exam-<course>-<ls>/source.mjs`) and Drive, never in the public repo; `tools/web-exam/build.mjs` writes `<ls>/data/exam.js` (no answers), keys uploaded with `tools/web-exam/upload-keys.mjs` on Roger's "apply"; sample exam page + `data/sample-exam.js` on the site |
| 11 Study summary | `<ls>/downloads/ls<n>-vocabulary-grammar-{route}.pdf`, `study` in `EL_LS` (the board's 🔤 Grammar and vocabulary place shows it; LS pages have no Study place since 7 Nov 2026); built from the Learning Paths' data with `node tools/lp-worksheets/build.mjs --summaries` once the LS is in `shared/print/lp-list.js` (every route, Starter too; `starter: true` in `EL_LS`); the copyright line is printed on every page |
| 12 Go live | PRs merged at Roger's OK; retarget stacked PRs to `main` once their base is merged |

**Simple LS home (Roger, 20 Nov 2026):** from LS2 on, `el-ls-home.js` `simpleHome` draws the LS home from the page's own About place, `a.chal` and `[data-ls-lists]`: challenge, what you will learn, assessment criteria, grammar and vocabulary (the student's level only) and 📊 a % per skill (activities: average of all tries, `state.all` in `ls2-engine.js`; exam: its parts, never while held). The old Continue card, learning paths and tiles stay in the HTML, hidden. Load `el-step-titles.js` and `el-voyage.js` before `el-ls-home.js`. The board's "Your Learning Situation now" shows only what you will learn, grammar and vocabulary, the challenge and the 4-minute video.

**Site look checklist (REQUIREMENTS.md › 5), where each line lives:** copy an LS2 `index.html` (`body.lsh`, `ls-home.css`, `el-ls-home.js`, then `lab/game/decks/index.js`, `theory.js`, `el-notes.js` before `el-cloud.js`). Name: `elLsName`/`elLsNum` (`el-catalog.js`, order in `EL_LS`). Keep `<div data-ls-lists hidden>` with its two `.bigcard` lists (the board's 🔤 place reads it) and the class names the board reads (`ol.lps`, `a.chal`, `.tiles`, `#shadowDlg video`). Games and theory: `a.tile.nt.gmt` in `header.lshead.gmh` + `section[data-place="notes"]`, filled by `el-notes.js` `homeCard` (one `myGames` read). Formative tile: `a[data-el-formative]` (el-ls-home.js adds `?ls=…#formative`). About: `.ab-obj`, `.ab-flow`, `.ab-prin`, `.ab-comp k1…k6/kc`, `details.ab-crit` (CSS in `ls-home.css`). The About place also feeds the ⓘ About this LS banner under the LS heading (`aboutBanner` in `el-ls-home.js`, hides the About tile) and the board's (`aboutHtml` in `today.html`); keep those class names. Continue card (`contCard`): kicker, LP title, "Next step: <tab>" from `EL_SECTIONS`, then bar, steps and ▶ Continue on one row, as on the board (Roger, 8 Nov 2026: every LS from now on, PR #424). Board cards: `fvHead`/`fvStat`/`fvPart` + `.fv-*` in `today.html`. Flashcard voice: `node tools/voice/harvest.js` then `tools/voice/generate.py` (root `AGENTS.md`, "Flashcard voice"), commit `audio/voice/`. Reading voice: `node tools/voice/readings.js` then `tools/voice/readings.py` (root `AGENTS.md`, "Readings read aloud"), commit `audio/read/`; never for exams or checkpoints. Menu: `elStudentMenu` in `el-catalog.js` only. Scroll: `scrollTo({behavior:"instant"})`; student-view language `el_as.ca`. PRs of 7 Nov 2026: #377–#402.

**Goal and review card:** `ls2-engine.js` adds it by itself to every learning path page with a `recall` panel (`state.plan[route]`, `state.review[route]`; root `AGENTS.md`, "Goal and review"). A page that does not run on the engine, such as 4ESO LS2 *Getting started*, does not get it: build new pages on the engine, or add the card by hand.

**Lessons from LS2:** in [REQUIREMENTS.md › 5, Before building](../REQUIREMENTS.md#5-designing-a-learning-situation).

**First copy: 2ESO LS2 *Free Time, Live!* (25–26 Oct 2026).** Built in one pass from this playbook under Roger's standing permission (decisions listed for him in its [AGENTS.md](../2eso/ls2-free-time-live/AGENTS.md)). What the copy showed:
- The whole LS can run on the engine, Learning Path 1 included: no bespoke first page is needed.
- The build scripts in project files are reusable as they are, with a new data folder: `ls2-2eso/audio-v3/` (gen3.py, build.py), `ls2-2eso/listening-chart/pipeline/` (scenes.py, render.js, build.py: only the scenes, palette and brand change), `ls2-2eso/final-product-models/` (models.py, build.py), `ls2-2eso/exam/` (exam-data.js, make-docx.js: the writing section is the only part tied to the task), `ls2-2eso/grammar-vocabulary/build/` (dump.js reads the data files, build.py).
- `tools/gen-criteria.js` parses both programmes; a new course programme only needs the same four-step bullets per criterion.
- An individual final product needs no group or peer rows: every rubric row is per student and the marking rounds stay the same.
- Expect about 6,500 ElevenLabs credits for an LS with four listenings, two short videos and an exam recording.
