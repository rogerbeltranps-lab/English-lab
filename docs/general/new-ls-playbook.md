# Playbook: building a new Learning Situation

How to build a new LS from Roger's programme to a live, gradable LS, in order. It is the process we followed for **4ESO LS2 Seasons & Celebrations** (Oct 2026, PRs #33–#74), with the steps we had to redo turned into decisions taken at the start.

**Reference model:** 4ESO LS2. Docs in [docs/4eso/ls2-seasons-and-celebrations/](../4eso/ls2-seasons-and-celebrations/AGENTS.md), pages in `4eso/seasons-and-celebrations/`, private files (exam, audio sources, Word documents) in the LS project's shared folder `ls2/`. When a step below says "as in LS2", open that file and copy its structure.

**How to use it:** copy the checklist into the new LS's `AGENTS.md` (or a working note) and tick it as you go. Each phase ends with Roger's approval before the next one is built. The rules themselves live in the [root AGENTS.md](../../AGENTS.md); this playbook only says *when* each one applies.

---

## Phase 0 · Kick-off: decide these up front

Ask Roger these questions in **one** message (or decision card) before writing any content. Each one cost us a rebuild in LS2 when it was decided late.

| # | Decide | Default (from LS2) | What happened in LS2 |
| --- | --- | --- | --- |
| 0.1 | Is the programme section for this LS **final** (objectives, criteria, competences, vocabulary, grammar, final product)? | Roger confirms the version and date. | The revised programme (24 Oct) changed the criteria after the LS was built: activities, rubric and catalogue were redone (PR #54). |
| 0.2 | Route levels | Root AGENTS.md table (4ESO: A2/A2+ · B1 · B1/B1+; 2ESO: A1+/A2 · A2 · A2+/B1). | Levels were written down only after the first build (PRs #35–#37). |
| 0.3 | Readings per route, listenings and videos at Safe | One reading text per route; one recording at Safe for all; questions adapt per route. | Readings were first one text for all and had to be rewritten per route (PRs #36, #38). |
| 0.4 | Which listenings are real and which are generated | At least one real, level-appropriate video per LS; the rest scripted with ElevenLabs. | Mix agreed after the first draft. |
| 0.5 | ElevenLabs budget and model | `eleven_v3` with audio tags; voices picked by Roger from free previews; credits estimated per script; Roger's OK for each generation. | First recordings used v2 without tags and sounded flat: all redone with v3 (PRs #48, #51, #52). |
| 0.6 | Indicators (NA · AS · AN · AE) for every LS criterion, and which task gives evidence for each | Every criterion has at least one task with a piece of work the teacher can level. | Indicators and the "every criterion has its task" check came after the build (PR #54). |
| 0.7 | Grading weights | Exam 35 · final product 25 · grammar and vocabulary 20 · other competences 20 (or, like LS1, only exam + final product). | Agreed after the activities were built (PR #60). |
| 0.8 | Exam format | Roger's Word format (*Exam A* model), Google Form in quiz mode per route, /100, everything multiple choice or short gaps except the writing; sample exam on the site in the same format, taken the session before. | Exam and sample exam were rebuilt twice (PRs #70, #72). |
| 0.9 | Final product marking | Groups of the same route; **only the video is marked in groups**; marked in **two rounds** (midway + after submitting) with a marking PDF per round; written pieces that are marked are pasted in the step. | Rounds, individual research card and pasted email came late (PR #71). |
| 0.10 | Calendar | Dated sessions per group, exam day per group, due date per activity, term in which each mark goes (school calendar in project memory). | Plan was redone when the time plan arrived (PRs #44, #68). |
| 0.11 | Study summary | Vocabulary + grammar summary per route as a PDF on the student board, and a teacher Word with all three routes. | Asked for at the end (PR #74). |
| 0.12 | Who builds what | LS project: content, LS pages, data, docs. English Lab project: `teacher.html` and site-wide code. Briefs for the English Lab project are written early. | Dashboard requests (marking PDF, level buttons) waited on a paste-ready brief. |

Write the answers in the new LS's `AGENTS.md` decision log (Phase 1).

---

## Phase 1 · Set up the docs

- [ ] `git pull`; read the root `AGENTS.md`, `docs/README.md` and the reference LS's `AGENTS.md`.
- [ ] Create `docs/<course>/ls<n>-<name>/` with `AGENTS.md` (rules + dated decision log, as in LS2) and an empty `overview.md`.
- [ ] Add the folder to the map in `docs/README.md` and the link to the "Final Product" list in the root `AGENTS.md`.
- [ ] Record the Phase 0 answers in the decision log.
- [ ] Create the project-files folder `ls<n>/` (private: exam, audio sources, Word files).

## Phase 2 · Design and approve the content

- [ ] **Organisation proposal** (doc for Roger): learning paths, what each one practises, recall checkpoints, groups week, final product steps, rough calendar.
- [ ] Roger approves the organisation.
- [ ] **`overview.md`**: every page with its items, tagged per route ([I] all · [S] Safe and Daring · [D] Daring only), as in LS2. Includes section 0 "Rules that apply to every page" (recall warm-up, 80 % accuracy rule, mixed practice, flashcards, a product piece at the end of each learning path).
- [ ] Readings written **three times** (one per route, same key information) plus one extra Daring question.
- [ ] Listening and video scripts at Safe, with questions per route.
- [ ] Check every text and script against the route levels.
- [ ] Roger approves `overview.md` (date it at the top). Nothing is built before this.

## Phase 3 · Align activities with the criteria

- [ ] `assessment-criteria.md`: each activity and step mapped to the LS criteria (by the skill it practises plus the competences its content targets).
- [ ] `competences-grid.md`: competences × activities, and when each criterion gets its mark.
- [ ] `indicators.md`: NA · AS · AN · AE indicators for each LS criterion (Roger's method).
- [ ] Check: **every LS criterion has a task** whose piece of work can be levelled with its indicators. Add or change tasks where one is missing.
- [ ] Roger approves.

## Phase 4 · Build the pages

- [ ] LS landing page `<ls>/index.html` following `4eso/my-real-routine/index.html` (tabs Overview, Learning Path, Language & Knowledge, Final Product); objectives and criteria from the programme.
- [ ] Learning paths, recall checkpoints, final product, sample exam and Reflect: thin shells + `data/<page>.js` rendered by the LS engine (`ls2-engine.js` in LS2).
- [ ] Per-route readings in data (`media.text` = `{insecure, safe, daring}`).
- [ ] Route language: Insecure in Catalan, Safe and Daring in English; English stays the target language.
- [ ] Answer options shuffled, flashcards as the shared set, matching rules from the root `AGENTS.md`.
- [ ] Catalogue: activities in `shared/js/el-catalog.js` (`<course>/ls<n>-…` ids), `EL_ACTIONS`, step criteria, points; `EL_LS` entry.
- [ ] Publishing: card on the home and course pages, link in every Learning Situations dropdown.
- [ ] Check routes, route switching, feedback and progress; `git diff --check`; JS syntax.

## Phase 5 · Listenings and videos

- [ ] Choose the real videos (level-appropriate; questions general if the video could not be watched, and tell Roger).
- [ ] For each scripted listening: show Roger the **tagged v3 script** and the estimated credits.
- [ ] Shortlist 3–4 Voice Library voices per character; send Roger the **free previews**; he picks.
- [ ] **Ask "OK to generate this audio now?"** and wait for his OK for that specific generation.
- [ ] Generate one call per line, join with 0.45 s pauses, loudness-normalise; keep line clips in project files.
- [ ] Make the **slow copy for Insecure locally** (ffmpeg `atempo=0.85`, 0.9 s pauses). Never a second paid generation.
- [ ] Videos: MP4 (720p H.264) + `-slow.mp4` + `.vtt` subtitles + poster, in the LS `video/` folder.
- [ ] Record voices (with ids) and credits used in the LS `AGENTS.md`.

## Phase 6 · Final product and rubric

- [ ] `final-product-assessment.md`: groups (same route), individual evidence, what the group makes, who presents what, how it is marked, peer assessment, rubric per route, marking rounds.
- [ ] Final product page: steps with fields, self-assessment per statement, optional comment, teammate ratings (engine `step` panels).
- [ ] `final-rubric-data.js`: one row per criterion with `round`, `group` (video rows only) and `video`; descriptors from `indicators.md`.
- [ ] Word rubric (teacher guide + student rubric per route, Insecure in Catalan + video marking sheets) in project files, built from `final-rubric-data.js`.
- [ ] Marking PDF per round: confirm the dashboard can produce it (English Lab project).
- [ ] Roger approves rubric weights.

## Phase 7 · Grading plan and teacher dashboard

- [ ] `grading.md`: the LS mark, evidence per criterion, the two halves of "other competences", how levels are collected (the few one-click moments), what the dashboard needs, terms. As in LS2.
- [ ] Roger approves.
- [ ] `EL_GRADING[ls]` entry in `shared/js/el-grading.js` (weights, level moments, rows, evidence, indicators copied from `indicators.md`).
- [ ] Brief for the English Lab project for anything `teacher.html` needs (paste-ready, in project files).

## Phase 8 · Calendar and time plan

- [ ] `EL_PLAN[ls]` in `shared/js/el-plan.js`: terms, dated sessions per group, `exam` per group, `from` per week, `due` per activity.
- [ ] Check against the school calendar (days off, evaluation dates, exam weeks).

## Phase 9 · Exam and sample exam

- [ ] Exam proposal (sections, points, criteria, timing) → Roger approves.
- [ ] Exam content in project files only (`ls<n>/exam/`: data source, Word in Roger's format + separate key, scripts). **The repo is public: no real exam content in it.**
- [ ] Exam listening: same audio rules as Phase 5 (Roger's OK per generation); **no slow copy** for exams.
- [ ] Sample exam on the site: same format, numbering and points, new texts, covers all the LS grammar and vocabulary, ChatGPT guide mark for the writing with the warning.
- [ ] Google Forms: created **closed**, opened on the exam day (how they are built is Roger's call).

## Phase 10 · Study summary

- [ ] Teacher Word (map + all three routes) and one student PDF per route from the learning-path data (LS2 build scripts in project files `ls2/grammar-vocabulary/build/`).
- [ ] PDFs in `<ls>/downloads/`, `study` field in `EL_LS` so the board shows the route's PDF.
- [ ] Rebuild them whenever a learning path's vocabulary or grammar changes.

## Phase 11 · Go live

- [ ] PRs merged at Roger's OK (retarget stacked PRs to `main` once their base is merged).
- [ ] Roger opens the LS in `teacher.html` (LS settings: state and groups) and enables graded activities when due.
- [ ] Test as the tester account in the student view of each group.

## Phase 12 · Keep the records

Do this in every phase, not at the end:

- [ ] Each decision as one dated line in the LS `AGENTS.md` decision log; generic rules in the root `AGENTS.md`. Update lines instead of adding contradicting ones.
- [ ] Approved content dated in `overview.md`.
- [ ] Project memory updated with where things live (project files paths, threads, open points).

---

## Definition of done (files, as in LS2)

| Where | Files |
| --- | --- |
| `docs/<course>/ls<n>-<name>/` | `AGENTS.md`, `overview.md`, `assessment-criteria.md`, `competences-grid.md`, `indicators.md`, `final-product-assessment.md`, `grading.md` |
| `<course>/<ls>/` | `index.html`, learning path pages, recall checkpoints, final product, sample exam, Reflect, `data/*.js`, `final-rubric-data.js`, `audio/`, `video/`, `downloads/` |
| `shared/js/` | entries in `el-catalog.js`, `el-plan.js`, `el-grading.js`; criteria texts regenerated in `el-criteria.js` if the programme changed |
| Project files `ls<n>/` (private) | audio sources and clips, exam (Word, key, data, audio), Word rubric, grammar and vocabulary Word, dashboard briefs |
