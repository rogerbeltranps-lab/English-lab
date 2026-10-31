# Secure recall checkpoints

Roger, 31 Oct 2026: "make sure they don't cheat" in the recall checkpoints. He first thought of Google Forms (one Form per route);
we chose to do it on the site so the checkpoint still opens the next learning path and feeds the grade and the Question analysis
without any sync script, and students do not see it as an exam (proposal: https://claude.ai/artifact/2rbzSbMfFCJtsy34Jrc87y).

## What the student gets

- Before starting: the rules (number of questions, about 45 s each, no going back, stay on the page or it is sent).
- One question at a time with a timer bar (`secure.secs`, 45 s). When time is up the next question comes. Enter or Next moves on.
- The question can't be selected or copied, and nothing can be pasted or dropped into the answer.
- Leaving the page (another tab, window or app: `blur` / `visibilitychange`) hides the question at once. Back within 2 s
  is a "glance" (👀 on the dashboard); otherwise the checkpoint is sent with the answers so far (⚡ "sent automatically: left the page",
  Roger: "if they leave the tab or open another app on their Chromebook, send the test automatically"). Reloading or opening it on another
  device after starting also sends it (except a reload in the first 15 s with nothing answered: the page reloads itself once after sign-in).
- After sending: "Sent ✓", the step is done and the next learning path opens. No mark and no answers until the teacher releases them;
  then the page shows the mark, every answer with ✓/✗, the right answer and the hint (Catalan for Starter and Base).

## Where things live

- `data/recall-checkpoint-N.js` (and `data/native/…` for Pro): the questions with a stable `id`, route tag `r`, and the panel's
  `secure: {secs: 45}` (optional `n: {route: count}` to draw that many questions from a bigger bank). **No answers (`a`) and no hints
  (`ca`/`en`)**: a hint can give the answer away and the repo is public. Note: the answers of the LS2 checkpoints are still in the git history
  (they were public before 31 Oct 2026); new banks written from now on are not.
- The key: `cpKeys/{page key}` in Firestore, teacher only: `items.{id} = {a: [accepted], q, i: place in the page's list (-1 for Pro), r, ca, en, extra}`.
  `extra` = answers accepted on the dashboard. The key file is kept outside the repo (project files `checkpoint-keys/`, Drive Teacher Studio)
  and uploaded with `node tools/checkpoint-keys/upload-keys.mjs <keys.json> [--apply]` on Roger's PC or Mac (Firebase CLI signed in). The tool
  keeps `extra` and lists students who did that checkpoint the old way.
- The try: `students/{uid}/checkpoints/{page key}` = `{ls, activity, key, level, ids, answers, times, leaves, auto, started, sent}`.
  `firestore.rules`: the student creates it once (LS open for their group, checkpoint not locked); never edits it unless the teacher set
  `redo: true`; the teacher writes `fb` (released corrections) and `redo`; testers may delete their own (🧪 button) to try again.
- Page: `shared/js/el-checkpoint.js`, used by `R.recall` in both `ls2-engine.js` when the panel has `secure`. The progress keeps
  `state.cp` (draw, answers so far, times, glances) so a reload shows the same questions.

## Dashboard (`teacher.html`)

- `load()` reads `cpKeys` and every `checkpoints` doc; `cpInject` marks each try with the key and writes `first`, `last.check`, `items.check_<route>`,
  `done.check` into the student's progress state **in memory only**, so the grade (`gv` first tries), the progress table and the Question analysis
  work unchanged. A first try saved by the page itself is ignored for a checkpoint with a key, except one dated before 1 Nov 2026 (done the old way, before the switch: the page shows it as done and the dashboard keeps it; 2 ESO LS2 had its checkpoints open as practice). `window.EL_CP_KEYS` gives `el-items.js` the answers.
- Group tab → "🛡️ Recall checkpoints": score, ⚡, 👀, minutes; "📣 Release feedback (n)" per checkpoint writes `fb` to the group's tries
  (press again after accepting an answer). A cell opens the answers with the time per question, "✓ Accept" (adds to `extra`, for every student)
  and "↺ Let them do it again" (sets `redo`; the page shows the rules again with a new draw).

## Paper worksheets

`tools/lp-worksheets/build.mjs OUTDIR --keys <keys.json>` fills the answers and hints back in while printing, so the checkpoint KEY PDFs still have them.
Without `--keys` the student PDFs are fine but the checkpoint KEY is empty.

## A new LS

Write each checkpoint with ids, `secure`, no `a`/`ca`/`en` in the page; put answers and hints in the LS's keys file (same shape) and upload it
before the checkpoint opens. A bank (more questions than a route needs) is just more items for that route plus `secure.n`.
