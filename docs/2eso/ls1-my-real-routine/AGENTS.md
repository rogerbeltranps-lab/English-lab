# 2ESO · LS1 My Real Routine

Read the [root AGENTS.md](../../../AGENTS.md) first; this file adds what is specific to this LS.

- **Content:** [overview.md](overview.md) (draft for review; website extracts are not automatically approved). The 2ESO teaching programme is still to come from Roger; it will be saved as `docs/2eso/programme.md`.
- **Pages:** `2eso/my-real-routine/`.
- **Activities and criteria:** [assessment-criteria.md](assessment-criteria.md) maps each activity step to the LS1 assessment criteria (proposal).

## Final Product

- Insecure interviews and describes a classmate; Safe does so in more detail; **only Daring** also compares with the student’s own routine, including similarities and differences.
- Highlight comparison as a core requirement wherever it applies; never add it to routes that do not require it.
- **Every route includes a healthy-habits reflection:** Insecure gives a guided judgment and a simple reason; Safe justifies it with specific habits; Daring develops the reasoning and suggests respectful, realistic improvements where appropriate. The comparison route reflects on both routines.
- Workflow: **Interview → Notes → Google Slides → Prepare → Record presentation → Review → Submit**.
- The final submission is a video presenting **Google Slides with the student’s face/camera and slides visible together in picture-in-picture**, with clear voice. State this explicitly; do not substitute vague recording-tool instructions or audio-only submission.
- Keep WAV/audio recording for short Speaking practice, not the main Final Product.
- Insecure retains Catalan guidance for every step and a worked chain: **interview answer → notes → slide content → spoken sentence → healthy-habit reflection**, with English target-language examples.

## Archive

The [detailed overview](../../archive/my-real-routine/overview.md) (both courses) and the [2ESO session pilot](../../archive/my-real-routine/2eso/a-day-in-my-life.md) are historical, unapproved drafts, kept for reference only.

## Decision log

Newest first. One line per decision; update a line instead of adding a contradicting one.

| Date | Decision |
| --- | --- |
| 2026-10-27 | **Vocabulary and grammar summary by route** (Roger), same layout as LS2: all the vocabulary, then all the grammar, Learning Path by Learning Path, from the pages' data (vocabulary cumulative by route; the grammar page, the Same day, different person practice and the writing connectors in each route's own version; listening/reading questions, games and open tasks left out). Student PDFs `2eso/my-real-routine/downloads/ls1-vocabulary-grammar-{insecure,safe,daring}.pdf` (Insecure in Catalan; no Beginners version, Beginners use Insecure as on the pages), shown on the LS page's Language & Knowledge tab (not on the board: LS1 shows only its grade there); teacher's Word with a map and all three routes in Drive `LS1 My Real Routine/Summaries`. Rebuild with `sh tools/study-summary/build-all.sh` when a Learning Path's vocabulary or grammar changes. |
| 2026-10-25 | **One final product page** (Roger): the LS page's Final Product tab is now only a card with a button to the final product page; its route boxes and "What counts" moved there. `final-product.html` opens with "See a model final product" (the Insecure, Safe or Daring example, by route; step 3 keeps a link back to it), then what you create, what counts and the route task. Rule in the root AGENTS.md (LS landing page). |
| 2026-10-25 | This school year only the final exam and the final product count (Roger): LS1 was done in class and will be redesigned for next year. Its learning paths are `graded:false` in `el-catalog.js` (practice; saved results stay in Firestore), and `EL_GRADING["2eso-my-real-routine"]` has only the exam and the final product (the teacher's mark), 50/50 (confirmed by Roger). Exam A sections and points (25 Oct 2026): Listening 10 · Reading 10 · Vocabulary 28 · Grammar 32 · Writing 20 = 100; the exam mark is points / 10. The student board shows only the LS grade (no learning paths, no links to the LS pages, so students do not go back to the activities); the dashboard shows the LS grade first with the learning paths folded. |
| 2026-10-24 | Docs moved to `docs/2eso/ls1-my-real-routine/`; the 4ESO version of this LS has its own folder in `docs/4eso/`. |
