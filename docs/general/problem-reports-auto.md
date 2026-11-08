# Problem reports handled automatically

Roger, 8 Nov 2026: "When somebody reports a problem I want you to read it straightaway and, if it's a real problem, fix it and answer the
student that it is fixed straightaway. Merge, but it must be a technical problem, not a design or pedagogical thing." Then: "I must be
informed though via mail, with an important subject."

This file is the routine of the scheduled task **"English Lab: problem reports"** (a fresh Claude session in the English Lab cloud
environment, which has `FIREBASE_SERVICE_ACCOUNT` with write access). The tool is `tools/problems/auto.mjs`.

## Each run

1. `git pull`, then `node tools/problems/auto.mjs open`. "Nothing new" → stop at once (no email, no PR, nothing else read).
2. For each report: read everything it holds, look at the screenshot file it prints (shots from before 6 Nov 2026 can show the folded
   Study guide over the page; the section "Com estudiar / How to study" then means nothing), open the page's code and data, and look at the
   student's own documents only if needed (`students/{uid}/progress`, `results`). Decide:
   - **Technical bug** (the site does not work as it was built to: a button, audio or video, saving or showing the student's work, a page
     that looks broken, a card or word missing, a step that cannot be done or is counted wrong, an answer key that refuses an answer that is
     plainly correct for that item, a marking run that missed a hand-in) → fix it.
   - **Not technical** (design wishes, what to teach or practise, how hard something is, a mark or correction the student disagrees with,
     routes and levels, deadlines, personal matters), **unclear** (you cannot find or reproduce a bug), or a fix that would change LS1
     content or design (Roger: leave LS1 alone) → `node tools/problems/auto.mjs leave <id> --note "…" --apply`: one or two sentences for
     Roger, saying what the student means and why it is his call. Nothing is sent to the student.
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
5. Email Roger once per run with every report fixed in that run (Gmail connector, from and to `roger.beltranps@gmail.com`):
   subject **`⚠️ IMPORTANT · English Lab: N problem report(s) fixed automatically`**; body: for each report the student, group, what they
   said, what was wrong, the PR link (or "already fixed by …"), and the message the student got; at the end the reports left for him with
   their notes, and the dashboard link https://rogerbeltranps-lab.github.io/English-lab/teacher.html#probs. Then add the labels `IMPORTANT`
   and `STARRED` to the sent message so it stands out (Gmail has no "high priority" flag). A run that only left reports for Roger sends no
   email (the 15-minute alert already told him about the new report; the dashboard shows the note).

## Costs and limits

- Firestore: one list of `problems` (a few dozen documents) per run, plus a screenshot per new report. Never list students or results
  for a report unless the bug needs it, then only that student's documents.
- Runs only in the day (Madrid), see the task's schedule. A run with nothing new ends after one command.
- The dashboard shows each report's note in ⚠️ Problem reports ("🤖 Fixed automatically" / "🤖 Left for you"); Reopen and Delete work as
  before.
