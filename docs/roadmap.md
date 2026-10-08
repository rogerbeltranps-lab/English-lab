# Roadmap: clean code for English Lab

## Goal
Keep the code clean as the site grows. A new Learning Situation (LS) should only need new **content** (and maybe new activities). The style, navigation, progress and phone behaviour come from shared code.

## Why
The phone and progress fixes made so far showed the same causes again and again:
- The same code copied into each page (topbar, colours, progress rules). Copies drifted apart and caused sideways dragging on phones, wrong colours, and a Speaking step that could never complete.
- Content mixed into page code, so a content edit can break an activity.
- Pages relying on each other's variable names, clashing class names, and hard-coded paths such as `/English-lab/index.html`.
- No automatic checks, so problems were found by hand on a phone.

## Rules for this work
- Content needs the user's approval before it is implemented or changed (see `AGENTS.md`, content-first workflow).
- One step at a time. Check the result on a phone before starting the next step.
- Do not commit or push unless the user asks.
- Report honestly what was only checked by script (no real device or microphone in cloud sessions).

## Model course
To be chosen by the user: **2 ESO** or **4 ESO** My Real Routine. The chosen course becomes the reference for later Learning Situations; the other course follows it.

## Steps

### 1. Test suite
Move the checks used so far into the repository so every later change can be verified:
- phone widths (360, 390, 430 px) and tablet widths: no sideways overflow, no overlaps in the topbar
- progress: each activity updates the bar, Undo works, route switching keeps routes separate
- "Mark section as done" buttons: blocked when incomplete, working when done
- matching rounds: completable, identical tiles interchangeable
- light and dark system theme: writing fields readable
- JavaScript syntax and `git diff --check`

### 2. Shared core (foundation)
- One topbar and one palette file per course; remove the copies inside pages.
- Shared JS helpers (`learning-path-support.js`, `section-next.js`) plus one common way to save and read progress.
- A short guide in `docs/` on naming and structure, and a checklist for new pages.
- No content moves in this step.

### 3. Content separate from the page
One page type at a time, vocabulary first (four pages repeat it): move the content (vocabulary, questions, texts, speaking tasks) into a data file per LS. The page reads the data and holds no content. After each page type, run the test suite and compare behaviour with the old page.

### 4. Second course
Apply the model to the other course, then use it as the base for the next Learning Situation.

### 5. Student login and saved progress
Goal: students sign in with their school Google account and the teacher can see their progress.

Planned approach (Firebase or similar):
- Google sign-in restricted to the school domain. The restriction must be enforced in the database rules, not only on the login screen.
- Progress saved per student (step marks, route, dates) instead of only in the browser, so it follows them between devices.
- A teacher dashboard readable only by teacher accounts.
- All pages save progress through the one shared progress module from step 2, so adding the login changes one file, not every page.

Decisions needed from the teacher before starting:
- School domain and the list of teacher accounts.
- What to store: only step marks, or also written texts. Audio recordings should not be stored (most sensitive and heaviest data).
- Data protection: students are minors, so school management or the data protection officer must approve, and a short privacy notice for families may be needed.
- Someone with Google Workspace admin access creates the Firebase project and enables Google sign-in.
- Check that the free plan is enough for the number of students.

Size and design (about 120 students; free-plan figures to be verified on Firebase's pricing page):
- One small record per student, keyed by their account. Save only when a step changes, or after a pause in typing, never on every keystroke.
- The dashboard loads on demand (not a live listener on all records), grouped by class with a filter.
- A way for the teacher to reset one student's progress.
- Do not store audio recordings.

Yearly cycle:
- Every year the teacher deletes the students' data from Firebase and keeps backups.
- Provide a CSV export of all students' progress, run by the teacher before the yearly deletion.
- Store backups in a secure school location (for example the school's Google Drive), not in the public repository.
- Backups still contain students' personal data, so the retention period (how long they are kept, who can open them, when they are finally deleted) must be part of the data protection approval and the privacy notice. Consider keeping backups without names (anonymised) if names are not needed later.

Limits: real Google login cannot be tested in a cloud session. Test on real devices with a few student accounts. Rules and code can be checked by script.

### 6. Reorganize `AGENTS.md`
- Update it to describe the shared core, the test suite and the content files.
- Split it into short focused files in `docs/` (style, route language, vocabulary and matching, final product, workflow). `AGENTS.md` stays a short index.
- Remove duplicated or conflicting rules, including the one about when to commit and push, and write it in one place.
- Add the lessons learned: use relative paths, unique class names, explicit dark-mode colours on form fields, run the test suite before finishing.

## Progress
- [ ] Model course chosen
- [ ] 1. Test suite
- [ ] 2. Shared core
- [ ] 3. Content separate from the page
- [ ] 4. Second course
- [ ] 5. Student login and saved progress
- [ ] 6. Reorganize `AGENTS.md`
