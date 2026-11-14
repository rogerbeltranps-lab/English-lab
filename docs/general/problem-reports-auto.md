# Problem reports handled automatically

Roger, 8 Nov 2026: "When somebody reports a problem I want you to read it straightaway and, if it's a real problem, fix it and answer the
student that it is fixed straightaway. Merge, but it must be a technical problem, not a design or pedagogical thing." Then: "I must be
informed though via mail, with an important subject."

This file is the routine of the scheduled task **"English Lab: problem reports"** (a fresh Claude session in the English Lab cloud
environment, which has `FIREBASE_SERVICE_ACCOUNT` with write access). The tool is `tools/problems/auto.mjs`.

## When it runs

Only when a student sends a report (Roger, 8 Nov 2026: "I want you to be triggered only when there's a problem"). The task is
**"English Lab: problem reports (instant)"**, with no schedule. When a report is saved, the student's page asks the school Apps Script
(`tools/notify/school-mail.gs`, action `problem`, checked with the student's own sign-in) to start the task through its API trigger
(`PROBLEM_TASK_TOKEN`, Roger's live script only), at most once every 3 minutes and 30 times a day. A report sent less than 3 minutes after
the last start sets a one-off Apps Script timer (`startProblemsLater`) that starts the task again when the 3 minutes are over. The old
hourly task "English Lab: problem reports" is switched off.

## Each run

1. `git pull`, then `node tools/problems/auto.mjs open`. "Nothing new" (no open report and no new comment) → stop at once (no email, no PR,
   nothing else read). A line "NEW COMMENTS" → also do "Students' comments, answered at once" below (after the reports, if any).
2. For each report: read everything it holds, look at the screenshot file it prints (shots from before 6 Nov 2026 can show the folded
   Study guide over the page; the section "Com estudiar / How to study" then means nothing), open the page's code and data, and look at the
   student's own documents only if needed (`students/{uid}/progress`, `results`). Decide:
   - **Technical bug** (the site does not work as it was built to: a button, audio or video, saving or showing the student's work, a page
     that looks broken, a card or word missing, a step that cannot be done or is counted wrong, an answer key that refuses an answer that is
     plainly correct for that item, a marking run that missed a hand-in) → fix it.
   - **Not technical** (design wishes, what to teach or practise, how hard something is, a mark or correction the student disagrees with,
     routes and levels, deadlines, personal matters), **unclear** (you cannot find or reproduce a bug), or a fix that would change LS1
     content or design (Roger: leave LS1 alone) → `node tools/problems/auto.mjs leave <id> --status … --note "…" --reply "…" [--todo "…"]
     --apply`. Nothing is sent to the student: Roger sends it with one click (see "Status and suggested reply" below).
   - Already fixed by an earlier change → no PR; answer it as fixed (step 4), naming the PR or date in the note.
3. Fix: a branch `claude/problem-<short id>` from `main`, the smallest change that fixes it, following `AGENTS.md`, plus a line in
   `AGENTS.md` if it sets a rule ("(problem report, <group>, <date>)"). Run the repo's checks that apply (`node tools/vocab-cards/check.mjs`,
   `node --check` on changed JS, a Playwright look at the page at 1366×768 when it is visual). Open the PR (attribution block, assignee and
   reviewer `rogerbeltranps-lab`), wait for its checks, **squash-merge it without asking** (Roger's standing approval for technical fixes
   from problem reports). Never put student names or emails in the PR, commits or code: say "problem report, 2ESOA, 8 Nov".
4. Answer the student: `node tools/problems/auto.mjs fixed <id> --msg "…" --note "… PR #n" --apply`. The card already says "Fixed! Thank
   you…" in the report's language (Catalan for Beginners, Insecure and no route, English for Safe and Daring; the tool says which). `--msg`
   adds one or two plain sentences in that language, in Roger's voice: what was wrong and what they see now ("Tenies raó: …", "You were
   right: …"). Never mention AI, Claude, PRs or code. If they must reload, say so ("Recarrega la pàgina").
5. Roger's email: `auto.mjs fixed` saves `problems/{id}.auto.at`; the GitHub Action **"English Lab emails"** (`tools/notify/notify.mjs
   --instant`, from the school account) sends him one email for every report fixed since its last check, subject
   **`⚠️ IMPORTANT · English Lab: N problem report(s) fixed automatically`**, with the student, what they said, what was wrong (the note),
   the message they got and the dashboard link. Start it at once after the last `fixed` of the run: GitHub MCP `actions_run_trigger`
   (method `run_workflow`, workflow `teacher-emails.yml`, ref `main`, inputs `{"send": "new reports and ideas to me"}`); its 15-minute
   schedule is only the backup (GitHub often runs it late). Reports left for Roger get no extra email: the 15-minute alert already told him
   about each new report, and the dashboard shows the note.

## Status and suggested reply (Roger, 10 Nov 2026)

"I need you to tell me if the problems are fixed and a suggested message to send with a button." Every report left for Roger gets:

- `--status`: **`fixed`** (it is right now: a mark Roger already recalculated, a redo he already gave, a change already merged),
  **`nobug`** (the site works as it was built to; an explanation is all the student needs), or **`you`** (Roger must do something first:
  a redo, 📣 Show answers, a roster name, a decision). The dashboard shows it as ✅ Fixed / 👍 Not a bug / ✋ Needs you.
- `--note`: one or two sentences for Roger (what the student means, what you checked, the numbers).
- `--todo` (only with `you`): what Roger must do first, one short line ("Press ↺ Let them do it again on her checkpoint 1 score").
- `--reply`: the answer to the student, in the report's language (the tool says which), Roger's voice, first person, plain and kind,
  two or three short sentences; never AI, Claude, PRs or code. Write it so it is true once the todo is done.

In ⚠️ Problem reports the reply has **📨 Send…** (fixed → the ✅ fixed card with it; nobug → the message card and the report closes;
you → the message card, the report stays open) and **✏️ Edit first** (opens 💬 Answer with the text). Run `leave` again on the same
report to change it (`open --all` shows the current one).

## The teacher's own reports (Roger, 13 Nov 2026)

"I need a problem button available for the teacher." Roger has the same ⚠️ Problem button in the bottom bar of the dashboard, the class
tab and every page he opens signed in (and in the ⋯ menu of a learning path on a phone). His reports are `problems/{id}` with
`teacher: true` (firestore.rules lets only his account set it), in English, with `group` = the class mode's group when he sends it from the
class tab. They start this same task. `auto.mjs open` prints them as "FROM ROGER, THE TEACHER". They are Roger's own requests.

Roger, same day: "little tweaks merge, big changes start a thread" + "I want a dropdown button where I say merge or don't merge yet".
His window has a dropdown, saved as `merge` (`auto.mjs open` prints "✅ MERGE STRAIGHT AWAY" or "⏸ DON'T MERGE YET"):

- **✅ Merge straight away** (`merge: true`, the default; on any page, LS1 included) → do it and squash-merge exactly as in "Each run"
  step 3, no preview to wait for. Then `node tools/problems/auto.mjs fixed <id> --note "what changed, PR #n" --apply` (no `--msg`: there is
  no student card) and start the email Action (step 5): the ⚠️ IMPORTANT email tells him what changed, with "hard reload the page"; he checks
  it on the site. Only if it is plainly a big change (a new feature or screen, many pages or LSs, student marks, answers or other data,
  firestore.rules, how a routine works) do not merge: treat it as ⏸ and say why in the note.
- **⏸ Don't merge yet** (`merge: false`) → small and clear: make it on a branch `claude/problem-<short id>`, open the PR with a clickable
  preview (screenshots in the PR) and do not merge. Big or unclear: build nothing, write the plan. Then `auto.mjs leave <id> --status you
  --note "PR #n with its preview, or the plan in two or three lines and your questions" --todo "Start a thread: 🤖 Fix with Claude" --apply`
  (no `--reply`) and start the email Action: he gets "English Lab: your report not merged yet" with the note and the link to the report,
  where 🤖 Fix with Claude copies everything (your note too) into a new thread of the English Lab project, where he says "merge" or asks for
  changes (a task cannot open a project thread by itself).
- **Unclear**, whatever he chose → as ⏸, with the one question you need answered in the note.

Roger gets no 15-minute "new report" email for his own reports (notify.mjs skips `teacher`); the dashboard shows them as 👨‍🏫 You, with no
💬 Answer and no suggested reply.

## Students' comments, answered at once (Roger, 9 Nov 2026)

"I want you to answer straight away but I want to see what you said and be able to edit … or remove it if I want to." The same task
answers students' comments on their hand-ins as soon as they send them. When a student's page saves a new comment (not only "no
problem": `elNoComment`), `shared/js/el-cloud.js` sets `students/{uid}.commented` and starts this task the same way as a report
(action `problem`, so the same 3-minute and 30-a-day limits, and no new token).

`auto.mjs open` says so with a line "NEW COMMENTS: n student(s)…" (one query; then it does not say "Nothing new"). Each run with that
line, after the reports (or alone, when there is no open report):

1. `node tools/marking/marks.mjs comments --new`. "No new comments." → nothing else to do for comments.
2. Otherwise answer the sheet exactly as the Friday task does (`/mnt/project-files/claude-answers-preview/daily-answers-task-prompt.md`):
   read the content file and the hand-in, write as Roger in the first person, never mention AI, Catalan for Starter, Base and no route,
   English for Core, Plus and Pro, FORYOU for anything that needs Roger. Write the EL-ANSWERS v1 file in the scratchpad and run
   `node tools/marking/marks.mjs answer <file> --new --apply` (it saves `settings/marking.cmtRun`, so the next run skips them).
3. No email for comments: Roger sees each answer in the dashboard (group To do: "🗨️ Claude answered N comments this week", and the
   tab cell in 👥 Students), where he can edit it or 🗑 remove it (the student then sees no answer and Claude does not answer that
   comment again). The Friday 15:00 task still answers any comment left.

## Costs and limits

- Firestore: one list of `problems` (a few dozen documents) per run, plus a screenshot per new report. Never list students or results
  for a report unless the bug needs it, then only that student's documents.
- Runs only when a student reports something. A run with nothing new ends after one command.
- The dashboard shows each report's status, note and suggested reply in ⚠️ Problem reports; Reopen and Delete work as before.
