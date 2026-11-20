# English Lab · Working requirements

**The rules every Claude thread follows when it works for Roger on English Lab, in one place.** Gathered on 20 Nov 2026 from the project instructions, the project memory's standing rules, the root [AGENTS.md](../AGENTS.md), the LS `AGENTS.md` files, the guides in [docs/general/](general/) and about 320 topic notes in project memory. Duplicates are merged; where two sources disagree, the newer word of Roger's wins and the clash is listed in [section 11](#11-contradictions-and-stale-text-for-roger-to-decide) for Roger to confirm.

Read this file first in every thread. It says **what** must happen. **How** it is built in code (file names, functions, data shapes) stays in the root [AGENTS.md](../AGENTS.md), which is the technical reference; this file points to the right section.

## 0. How to use this document

**Order of authority** (first wins):

1. What Roger writes in the current thread.
2. This file (standing rules).
3. The root `AGENTS.md` (technical decisions), then the LS's own `AGENTS.md` (rules for one LS), then the guides in `docs/general/`.
4. Project memory topic notes (history of each feature: useful context, not rules).

**Keeping it true:**

- When Roger sets a new standing rule, add it here **in the same PR** as the work (and the technical detail in `AGENTS.md`). Change or remove the old line instead of adding a second one.
- Each rule carries the date Roger said it, so the newest is easy to see.
- A rule for one LS only goes in that LS's `AGENTS.md`, not here.
- The Drive copy (Teacher Studio › 01_General › 08_Reference docs) is a copy: the repo file is the master. Replace the Drive copy when this file changes (old copy to that folder's `Archive`).

**Key words:** LS = Learning Situation · LP = learning path · SLP = a section (tab) of a learning path · FP = final product · CE2–CE5 = listening, speaking, reading, writing.

---

## 1. Roger's workflow: how to work with him

**Talking to Roger**

- Write to Roger **in English**, even when he writes in Catalan or Spanish (project memory).
- End **every** reply with a short **"Pattern to watch"** section (project instructions, 17 Nov 2026): at most 3 items, "what he wrote" → **natural version** + one-line rule. Correct only grammar, prepositions (his weakest point) and idiom (Catalan/Spanish calques). **Never** correct typos, spelling, capitals, punctuation, accents, apostrophes/contractions (Im, dont, u) or to/too slips: he types fast on his phone and was annoyed by it (19 Nov 2026). No real mistakes → say so in one line or praise a natural phrase.
- Log every correction in `/mnt/project-files/english-corrections.md` (date, what he wrote, natural version, rule). These become the next "My latest mistakes" batch in Towards Nativeness.
- Lead with the result. Short, friendly, plain words. Roger is an English teacher, not a developer: explain technical things in one sentence.

**Approval words** (project memory)

| Roger says | It means |
| --- | --- |
| **"merge"** | Approval to merge the PR. |
| **"apply"** | Approval for a live write (Firestore data, uploading exam or checkpoint keys, importing marks, deleting an account). "merge" alone never covers it. |
| **"send"** | Approval to send an email or message that was shown to him. |
| "merge without asking" / "send without asking" | Approval for that one ask, not a standing rule. |

- Always show a **preview before merge** (screenshots at the sizes students use, or a description for a non-visual change).
- After a merge that changes pages, tell him to **hard reload** (Cmd+Shift+R / Ctrl+Shift+R), and students too when they need it.
- Live writes: dry run first, show what would change, then wait for "apply".
- Ask once with a decision card when a choice changes his goal; keep working on the recommended option meanwhile unless it cannot be undone.

**Finishing work**

- **Don't give up early** (8 Nov 2026: "you were being lazy, deciding for me"). Before saying "it can't be done", try the other routes. Never pick a fallback for him without asking.
- **Never resolve a thread without his OK.** Exception (9 Nov 2026): once a PR is merged and nothing is left, resolve it yourself.
- Every new thread runs on **Opus 5.5, effort high** (project memory).

**His computers and accounts**

- **Never act in Roger's browser or accounts without asking** (8 Nov 2026: Claude used his Chrome without permission). Give him the link instead.
- Setup on his computer: **one step at a time, one paste-ready command**, full paths filled in (secrets-handoff note). Never ask him to paste a secret in the chat; for a key, give one Terminal line that copies `NAME=value` to the clipboard.
- School Wi-Fi blocks github.com: on school days he needs his phone hotspot for anything that talks to GitHub.
- Devices: Mac (`/Users/roger/Developer/English-lab-site`) and PC (`C:\Developer\English-lab`). Both fall behind `main`; pull when a device session starts.
- New versions of the school Apps Script (mail relay, Gemini, Classroom): Claude writes the file in `/mnt/project-files/school-script/`; **Roger pastes and deploys it himself**.

**Costs and scheduled tasks**

- **Never run a paid generation** (ElevenLabs voices, credits) without Roger's OK **for that specific generation**. An approved script is not permission to generate (AGENTS.md, Levels, listenings…).
- Gemini (shown as "Roig") costs money: only speaking feedback/analysis uses the API now; FP videos are marked in Roger's own Gemini app (20 Nov 2026).
- Scheduled tasks (marking, problem reports, audits): never re-enable a task Roger paused, never delete and recreate one (the school script holds their API tokens).

---

## 2. Privacy, data and safety

- **The repo is public.** Never commit personal data (names, emails, marks, the student list), real exam content, answer keys, exam audio or checkpoint keys. Personal data lives in `/mnt/project-files/alumnes/` and Drive › Teacher Studio › 04_Students (private). Exam sources and keys live in project files (`web-exam-<course>-<ls>/`) and Drive.
- No student names or emails in PRs, commits, code or comments: write "problem report, 2ESOA, 8 Nov".
- In demos, previews and screenshots use the invented students of the demo files (Alex Sample, Pau Exemple), never real ones.
- **Never delete anything in Roger's Drive.** An old file moves to the `Archive` subfolder of its folder (date in the name if needed). Claude never deletes student videos.
- Drive layout (26 Oct 2026): Teacher Studio › 00 Start here · 01_General (… 08_Reference docs) · 02_Cursos › 2 ESO / 4 ESO › Programme, LS1…LS6 (Exam, Summaries, Final product, Assessment, Listenings, Videos) · 03_Site assets · 04_Students (private) · 05_Archive. Every new document, audio or video Claude makes goes to its Drive folder **as soon as it is done** (details: top of AGENTS.md).
- New teaching materials go in **Drive Teacher Studio** (folder id `1GwOQ20qtYRregPQ0aSsXyCSJo9si7oC_`).
- **Keep Firestore reads low** (the free plan's 50,000 reads a day ran out on 1 Nov 2026). No new reads without a reason; cloud scripts must check for quota errors (a silent 429 returns empty data).
- The service-account key `bf3c16b4…` was partly exposed in a screenshot and should be replaced (open item).

---

## 3. What students see: naming, language and look

**Names on screen**

- **Gemini = "Roig", Claude = "Beltran"** everywhere a person can read it (site, dashboard, emails). New UI text never says Gemini, Claude, Google AI or "AI" (16 Nov 2026). Code, comments and prompts keep the real names.
- **Students must never learn that AI marks or answers their work.** Never mention AI to students (feedback, emails, cards). Exception by Roger's design: on the sample exam the student opens *their own* ChatGPT for the writing.
- Routes: students and the dashboard show only **Starter · Base · Core · Plus · Pro** (code keeps beginners · insecure · safe · daring · native). Never capitalise "Safe", "Daring", "Insecure", "Beginners" or start a sentence with "Native" in student content (they get relabelled).
- Students see **levels, not support**: only the CEFR label (2 ESO A1 · A1+ · A2 · A2+; 4 ESO A1 · A2 · B1 · B1+ · C2). Never "molt suport", "strong support" and the like (1 Nov 2026). Students never see "routes" or "route" as a word.
- LSs carry their number: "LS2 · Free Time, Live!" (7 Nov 2026).
- "**Learning path**" naming stays (20 Nov 2026: Roger reversed his earlier "remove it").
- The class step is "**🙌 Work it out together**" / "Ho resolem junts", never "Correct together" (19 Nov 2026).
- The student board is "**My dashboard / El meu tauler**". Teacher tiles are **Assessment details** and **Students' progress** (11 Nov 2026).
- `teacher.html` is in English only.

**Language by level**

- Starter and Base (and no route): instructions, help and feedback in **Catalan**. Core, Plus, Pro: **English**. English stays the target language for all input and production.
- Answers and messages to students go in **both languages**, their language first (20 Nov 2026).

**What students must not see**

- **Never show locked or future work** (7 Nov 2026): no 🔒, "not open", "checkpoint first", or totals that include closed steps. Only learning paths and sections Roger has opened.
- **No class work shown in advance** (20 Nov 2026): tabs planned for a later class are hidden until 5 minutes before class or class mode.
- **Students are never told which activities are assessed**: no "this counts", "first try" or "checkpoint" labels (26 Oct 2026). Only the general note that all work is part of continuous assessment (40 % of the LS mark in LS2).
- Students never see **send times** of messages (14 Nov 2026), never classmates' marks, never where Practise content comes from.
- "Not late yet" counts are never shown to students (19 Nov 2026).
- The public home page shows no screenshots or pictures of the app, and never mentions the full screen mode (7 Nov 2026).

**Look and devices**

- **Quality over quantity** (19 Nov 2026): Roger finds there are too many activities. Students see only the SLPs Roger adds; the final product is always last. Keep screens short: little on the menu, details inside each place.
- Students use **Chromebooks (~1366×768)**: design for that first, then check 390×844 (phone). Phone rules live only in `el-phone.css` inside `@media (max-width:640px)`; computers must stay pixel-identical.
- Course palettes: **2 ESO green, 4 ESO blue**. Competence colours: CE1 teal, CE2 blue, CE3 orange, CE4 green, CE5 purple, CE6 amber, CD indigo, CC pink.
- **One colour rule for every percentage** (20 Nov 2026): under 50 red · 50–59 orange · 60–79 green · 80–89 blue · 90+ purple (`elPctCol`).
- Marks: the degree (Assoliment notable…) in a coloured box first, the number small beside it (10 Nov 2026).
- Student pages: no translating, no copying of page text, no spell-check in answer boxes (9 and 13 Nov 2026).
- Everything students can download or print carries "© <year> Roger Beltran · English Lab · All rights reserved".
- Students' answers always come back (on reload, another device, after a level change) unless they redo that activity (6 Nov 2026).
- Never draw a guessed page that changes after sign-in (7 Nov 2026).
- **LS1 stays as it is** unless Roger asks: its content and pages are finished.

---

## 4. Designing a Learning Situation

**The guide is the [new LS playbook](general/new-ls-playbook.md).** The model is **4ESO LS2 *Seasons & Celebrations*** as it is now; a new LS copies it and Claude only asks about what is different. Any change Roger makes to LS2 updates the playbook in the same PR, unless he says it is for one LS only.

**Before building**

- Remind Roger of the **integrated-competence gaps** (31 Oct 2026): CE7 serial story, CE8 mediation step (assessed a second time in 2 ESO LS5/LS6 and 4 ESO LS5), CE1 intercultural element for 4 ESO LS4, CE6 source check in LS3.
- **Content first** (AGENTS.md, Content-first workflow): only content Roger approved goes on the site. Never invent or change pedagogical content during implementation; flag gaps and contradictions first.
- Confirm the programme section is final. Check grammar and vocabulary against the programme and the Drive grammar/lexicon maps: nothing from another course except as a labelled chunk.
- Each step of the playbook ends with Roger's OK before the next.

**Routes and levels**

- Routes are **set only by Roger**, from each student's **LS1 exam mark**: under 3 Starter · 3 to under 6 Base · 6 to under 8 Core · 8 or more Plus; Pro only by Roger. Students can only *ask* for a change. One level per student per course, the same in every LS.
- Starter must really differ from Base (choose from three options, slow audio, Catalan hints); Base gets at least one or two items or requirements more. No step identical for Starter and Base.
- Readings: each route reads its own version at its level, same topic and key information. Listenings and videos: one recording for everyone at Core level; the questions and help change by route.

**The four skills, equally** (30 Oct 2026, "VERY IMPORTANT")

- Learning paths work CE2 listening, CE3 speaking, CE4 reading, CE5 writing about **25 % each, every one between 20 and 30 %**, over the whole LS. Use of English counts as reading and writing. Report the four shares with the plan.
- Skills budget in minutes per step in the LS design; the LP skeleton (~58 min) is in AGENTS.md.
- **Grammar is never heard or said** (15 Nov 2026): grammar steps are read and typed.
- **Never change a learning path students have already started**; respect the calendar.

**Inside a learning path**

- Recall warm-up, vocabulary + study cards (15–20 `core` words per route, both directions), practice, grammar, 💬 Expressions, reading, listening (cycle + micro-dictation), shadowing, speaking / Talk, writing, My goal and How did it go?
- **How it works boxes are always visual** (cards, examples, tables, ⚠ typical mistakes) and hold **no practice boxes** inside (no 🙌 All together / ✏️ Your turn boxes, 14 Nov 2026).
- **Teaching flow** (13–16 Nov 2026): visual How it works → 📘 Grammar together: 🙌 4 questions together (from the extra practice), then ⏱ Your turn, and it ends there. Then notebook / pairs, then a short individual set.
- **Compulsory per grammar block = 4** (3 questions + the own example), the rest ➕ extra practice; 💬 Expressions = 6 compulsory + 4 extra per level.
- **Grammar that comes back**: only Starter and Base drill the old form; Core and Plus start from the new use, never more old-form items than new ones.
- Words with a structure (in/on/at, play/go/do, verb + preposition) are **💬 Expressions**, their own step after Vocabulary, not grammar (16 Nov 2026).
- ✓ Check per question; the mark is the first try; students can correct wrong answers in the notebook without changing the mark.
- Students can't copy the theory into their notes; notes are optional, their own examples (19 Nov 2026).
- Randomise answer options, never the questions.

**Class games** (see the [class games guide](general/class-games-guide.md))

- **One vocabulary game + one grammar game per LS** (16 Nov 2026), built from a vocabulary + grammar pair of decks per learning path; never a mixed deck. The board may play them together (📚🧩 Vocabulary + Grammar, 19 Nov 2026).
- Questions only in the game: no theory slides shown (16 Nov 2026). Cumulative: Roger ticks which points go in.
- Games are at Core level for everyone and use the LS's less common words.
- Our own names and art, never a copy of another game.

**Each LS has** (project memory, playbook Part 1b)

- The icon side menu, the ⓘ About banner, the "This LS in 4 minutes" video, the 🧩📚 Games and theory card, a shadowing video (~6 min, the approved format), a self-assessment Reflect page, secure recall checkpoints, a sample exam (optional, always open), vocabulary games, a study summary PDF per route, paper worksheets, its voyage road skin (themed per LS; art via ChatGPT/Gemini prompts Roger runs).
- Tick the site look checklist (playbook Part 1b) before Roger tries a new LS.

**Audio and video**

- ElevenLabs: `eleven_v3` with audio tags, voices chosen by Roger from previews, one OK per generation. Slow copies always made locally for free (ffmpeg). Flashcards use the free Kokoro Heart voice.
- Listening/Talk/dictation lines recorded; never re-record a listening students already used.

---

## 5. Making an exam (the exam guide)

This guide did not exist; it is written from the rules and decisions of the LS1 and LS2 exams (25 Oct – 20 Nov 2026). Where Roger has not decided something yet, it says **Ask Roger**.

### 5.1 What the exam counts

| LS | LS mark |
| --- | --- |
| LS1 (both courses) | Exam **75 %** · final product **25 %** (learning paths were practice) |
| LS2 and every later LS | Exam **35 %** · final product **25 %** · daily work in the learning paths **40 %** (2 Nov 2026) |

- The exam mark = all points ÷ 10 (exam out of 100). Each section carries its criteria; vocabulary and grammar count for **4.1 and 5.1** alike (Use of English is reading and writing, 30 Oct 2026).
- Scale: NA 2.5 · AS 5 · AN 7.5 · AE 10. Mark to degree: under 5 NA · 5–6.9 AS · 7–8.9 AN · 9–10 AE.
- A percentage alone never sets the degree of 4.1 or 2.2: their indicators describe a task (reading log, listening chart); the exam scores are supporting evidence.
- **LS1's harder (Daring) exam counts ×1.2**, capped at 10 (17 Nov 2026). Levels are still set from the raw points. **Ask Roger** whether the harder version of later exams gets a bonus too.

### 5.2 Before writing it

1. **Find what each group has really done**: the Time plan ticks and class days, dropped learning paths (not in the exam for that group), the class games played. The exam asks only that (19 Nov 2026: "only what both groups did").
2. **Exam day per group** is in `EL_PLAN[ls].exam`; check it with Roger.
3. **Remind Roger** to decide (memory, 1 Nov 2026): the two versions per level and who takes each; how a mark converts between levels ("an 8 from a Base will be a 6": still undecided, nothing built).
4. **Agree the format before writing** (lesson from LS2: the exam was rebuilt twice in PRs #70 and #72).
5. Look at what students do best and worst in the activities and class games (question analysis, game results). For LS2 Roger wanted the exam **achievable** ("so that they get good marks", 19 Nov 2026): lean on strengths (choosing is easier than typing), avoid what most failed. **Ask Roger** if the next exam should be tailored the same way.

### 5.3 Papers, levels and versions

- **Two papers by level** (19 Nov 2026): **Base** for Starter and Base (and students with no level), **Core** for Core, Plus and Pro.
- **Several versions per level** so neighbours can't copy: A/B/C, given by account. No listening question is shared between versions of the same level.
- The student's exam level is shown under every exam mark (dashboard and board).
- Paper copies for students without a laptop: print packs (Base A, Base B, Core A, Core B…), answer keys apart, odd papers padded for double-sided printing, kept in project files.

### 5.4 Format and content

- Web exam sections for LS2 (both courses): **Listening 20 · Reading 20 · Vocabulary 35 · Grammar 15 · Writing 10** = 100 (19 Nov 2026; was 20/20/15/15/30).
- **Everything except the writing is multiple choice or a short gap** (25 Oct 2026): no open short-sentence answers, so it marks itself.
- **Questions follow the order of the audio and of the text** (17 and 20 Nov 2026); questions are never shuffled, options are.
- **One box per gap** (20 Nov 2026): a two-word gap is two boxes (`split: true`).
- Accepted answers (20 Nov 2026): the words alone, the chunk or the whole sentence; extra words taken from the question are fine (don't penalise writing more than needed); contractions = full forms (I'm watching = am watching); in "Correct the mistake" only the gap sentence counts.
- **Listening first, all together**, played in class; then "Listening finished" opens the rest. For a make-up, the student may play it herself at most twice, no pause or rewind.
- **Writing**: one task per paper, in English with the Catalan underneath; Base also gets a frame; word count shown. Students may copy and paste their own text inside their boxes, nothing from outside.
- After turning in: practice games (LS words, never exam items), points only in the browser.
- Word exams (LS1 format, 25 Oct 2026): Catalan cover with Apartat · Criteri · Preguntes · Punts, the grade rule and the route; a section per route with a banner naming exam, route and level; questions numbered in one sequence with points; four options A–D with the right letter spread evenly; each gap with a hint and an answer line; the writing with requirements, a plan grid, ruled lines, a checklist and a word count. The key is a separate file.

### 5.5 Keeping it secret

- Real exam content **never goes in the public repo**. The source lives in project files (`web-exam-<course>-<ls>/source.mjs`); `data/exam.js` on the site has questions and options only, **no answers**. Keys go to `cpKeys/{exam key}.web` with `tools/web-exam/upload-keys.mjs`, dry run first, `--apply` only on Roger's "apply".
- After any change to the source, rebuild **and** re-upload the keys before the exam (live keys must match the live exam).
- The re-entry password is stored only as a hash; never write the password anywhere.
- No notebook, notes, dictionary or quick-note pad on the exam page (20 Nov 2026).
- The **tester account** does the exam first to check it works; its try never counts.

### 5.6 The sample exam

- On the site, **same format and points** as the exam, **new sentences** (no overlap with the real exam).
- **Optional and always open** (9 Nov 2026): never homework, never To do, never late, never in the bonus; shown as "🎯 Test yourself". Every new LS's sample exam gets `optional: true`.
- Built only on what the groups covered (19 Nov 2026: labelled "First exam" practice for LS2).
- Its first tab is the LS shadowing video (information only).
- Its writing opens the **student's own ChatGPT** with a prompt that asks only for a **mistakes table** (No. · Criterion C2/C3/C4 · Mistake · Correction · Why) and the corrected text: **never a mark, level or points** (20 Nov 2026). Claude does not correct it.

### 5.7 On the exam day

- On the exam day of the Time plan, 🎓 Class mode opens the exam page. 📝 **Exam mode** pulls the group's students to it; Roger explains the rules, then ▶ **Start the exam** starts every waiting exam at once.
- Exam mode starts by itself only during the group's class time; outside it there is a button (19 Nov 2026, after it locked 2ESOA at home).
- Full screen; leaving it, another tab or app for more than 0.4 s, or a reload stops the exam; Roger types his password on the student's screen to let them back in. Changes after coming back are logged.
- **Roger closes the exam himself** (🔒 Close). Nothing closes a started exam automatically (19 Nov 2026).
- Make-ups and single students: 👤 Only some students…; class mode goes on for the others.

### 5.8 Marking

- Everything but the writing is marked automatically against the keys.
- **Writing** (17 Nov 2026, like the LS1 exam): Claude corrects each text with the rubric **C1 task 8 · C2 grammar 4 · C3 vocabulary 4 · C4 organisation 4**, the corrected text, a mistakes table and feedback in Roger's voice (Catalan for Base, English for Core). A blank writing is 0. Writing rows are always named C1–C4 so the board can explain them.
- **Preview first** (marks per student, average, how many passed), then save only on Roger's "apply".
- **Paper exams**: marked by hand from Roger's photos, doubtful items flagged; Roger enters them (Save marks skips paper rows).
- **A part not done is left out, not 0** (14 Nov 2026): the mark is the other parts rescaled to 10.
- A student who lost connection: use what was saved, only on Roger's word (20 Nov 2026).
- Record the exam version each student took.

### 5.9 Results

- **Results are held**: they show to students 4 days after the exam at 8:00 (17 Nov 2026), or on the day Roger chooses (2 ESO LS2: Fri 27 Nov 8:00). While held, the student sees neither the sections, the report, the writing level nor the exam in "My LS mark so far".
- **Don't notify students or save marks until Roger says results can go out.** The exam results card appears by itself once every section has a score; an email needs his "send".
- **The report** (on the student board and inside the dashboard): the whole exam question by question (right ones too, the text, the student's answer and the right one, why, a link to what to review), the writing with its C1–C4 cards, mistakes table and own text next to the corrected one, then "what to review". Catalan for Starter/Base, English otherwise.

---

## 6. Marking and feedback

- **Everything is corrected automatically; Roger marks only the final product** (31 Oct 2026). Every other student text gets a correction from Claude's runs.
- **Weekly runs**: marking and corrections **Wednesday ~15:00**; comments answered at once (and a Friday 15:00 catch-up); the Friday audit is switched off for now. ✏️ "Correct everything waiting now" starts a run on request.
- **Feedback is written as Roger**, first person, never signed, never mentioning AI, never inventing what happened in class. Catalan for Starter, Base and no route; English for Core, Plus and Pro. Levels are never shown to students.
- **Writing corrections**: a short comment, a table Mistake · Correction · Why (at most 8) and the whole text corrected changing only the mistakes; the student sees their own handed-in text with the mistakes underlined. A handed-in writing is final unless Roger sends it back.
- **Speaking and Talk: recording only, no transcript card** (14 and 16 Nov 2026). Spoken corrections cover words and grammar, never spelling or pronunciation.
- **Copies**: the writing log (pasted characters, keys, time) flags possible copies; clearly pasted texts are sent back automatically with a Redo note; never "too good" for Pro.
- **Final product**:
  - Students upload the video on the site; it goes to Roger's Drive.
  - Roger marks it with **✨ Correct in my Roig**: his own Gemini app with the agreed prompt and rubric, nothing paid (20 Nov 2026). For the next LS, automatic drafts must be **off**.
  - **Very good = 10/10** (a rubric row at level 4 is always 10; Good/Fair/Developing 7.5/5/2.5 on a click) (14 Nov 2026).
  - **No spoken video = 0.**
  - LS1 FP reflection: students who say in a problem report that they couldn't see the instructions get the reflection row 10/10; nobody else (14 Nov 2026).
  - The prompt is kind but honest; "I don't want to give grades they don't deserve". Prompt changes only with Roger's agreement.
  - Feedback in the part-line format (`Name (30%) · 7.5/10` + ✔ / ➜ lines) so the board shows the rubric table.
- **Speaking analysis** (20 Nov 2026): teacher only; nothing runs by itself; 🔍 Analyse shows the count and cost first.
- **Indicators say how many times** (10 Nov 2026): fewer than half = NA, half = AS, 7 in 10 = AN, 9 in 10 = AE, plus the quality; each starts with what the student CAN DO. Write new LS indicators and rubric cells this way.

**Daily work** (the 40 %)

- Recall checkpoints 10 · warm-ups 2.5 · practice/grammar/mixed done 5 · class games 2.5 · skills tabs done 15 (= 35, "Grammar, vocabulary and skills") + other competences 5. Transversal criteria never count in a mark.
- **Missing work = 0 only if the tab was done in class (ticked on the Time plan) and its day has passed.**
- **Done late counts the same as on time this term** (14 Nov 2026). Roger wants it **stricter next term**: remind him when term 2 starts (23 Nov 2026).
- Term 1 ended 20 Nov 2026: Roger closes each group with 🔒 Close term.
- Class games: a missed game or one under half right is left out, never 0; a game played again counts only its latest play.
- Self-assessment never counts in the mark.

---

## 7. Answering students

**Problem reports** (routine: [problem-reports-auto.md](general/problem-reports-auto.md); instant task `trig_019JfVaVpNJdhGnFTsMxcWYg`)

- **Technical bug** → fix it, squash-merge without asking, answer the student in Roger's voice, and email Roger with an **⚠️ IMPORTANT** subject (8 Nov 2026).
- **Design, pedagogy, marks, routes, deadlines, unclear, or LS1 content** → don't change anything; leave it for Roger with a status (✅ fixed / 👍 not a bug / ✋ needs you), a note and a suggested reply in both languages.
- Roger's own reports: "✅ Merge straight away" for small tweaks; big changes or "⏸ Don't merge yet" → a PR with preview or a plan, and a thread.

**Timing and wording of every automatic answer** (17 Nov 2026)

- Shown to the student only **between 08:00 and 18:00 Madrid time and at least 2 hours** after the report or comment arrived. Never `--now` unless Roger asks.
- **Never use the student's first name or surnames** (no "Hola X"): it feels like AI.
- **Both languages**, their language first (20 Nov 2026).
- Roger's own sends from the dashboard after 21:00: **always ask him** "send now or hold until 7:30" (14 Nov 2026).

**What a suggested reply says**

- Built on **what the website really has** (the sample exam, 🎯 Practise, Games, the notebook…), never generic advice or promises of features Roger hasn't decided (20 Nov 2026).
- Short, kind, plain, first person as Roger. Never AI, Claude, PRs or code.
- A 💬 draft is ready in every Answer box (ideas, private answers, problem reports): Roger edits and sends it.

---

## 8. Emails

- **Every email goes from Roger's school account** (`roger.beltran@ietramuntana.cat`), **never his personal Gmail** (19 Nov 2026). The Gmail connector in this project is his *personal* account: don't use it to send to students.
- Report and alert emails **to Roger** also go to the school address (PR #733).
- The school script relay sends **only to @ietramuntana.cat** and plain text only (no attachments). For outside addresses (parents) or attachments: give Roger a **prefilled school-Gmail compose link**, or offer a new script version.
- **Emails to students**: draft in **Catalan and English**, show it to Roger, send only after his explicit "send". Students' messages at night (21:00–7:30) are held until 7:30, and Roger is always asked "send now or hold".
- Never show Claude/AI in emails or images (crop the bookmarks bar out of screenshots).
- "My kids" / "my tutees" = the 14 4ESO A students Roger tutors (their sheet is in Drive), never the whole group. Parents' contacts are personal data.

---

## 9. Technical work and deploying

- Repo `rogerbeltranps-lab/English-lab`, published with GitHub Pages; `teacher.html` = the dashboard, `today.html` = the student board. Groups 2ESOA, 2ESOB, 4ESOA, 4ESOB.
- **Start from the closest working page** and reuse its structure, styles and shared helpers (AGENTS.md, Start from working examples).
- **Every decision goes in writing in the same PR**: a standing rule here, the technical detail in the root `AGENTS.md`, an LS-only rule in that LS's `AGENTS.md`, and the playbook when the LS model changes. Update the `docs/README.md` index row when an LS gets new docs.
- PRs: the attribution block, assignee and reviewer `rogerbeltranps-lab`, screenshots for visual changes. Merge only on "merge" (or the problem-report standing approval for technical bugs).
- Checks before a PR: `node --check` on changed JS, `git diff --check`, the repo checks that apply (`tools/vocab-cards/check.mjs`, `tools/answers-stay/…`), a Playwright look at 1366×768 (and 390×844 for student pages). Say honestly when a check was only programmatic.
- Bump `?v=` cache keys when a shared file or media changes; tell Roger (and students) to hard reload.
- `firestore.rules` publish by themselves on merge (GitHub Action). New school script versions: Roger pastes and deploys.
- Preview without Firebase: `EL_DEMO_*` demo data and the invented students; never real data in previews.
- Firestore: no new reads without need; the dashboard works from its browser copy and updates per group.
- `teacher.html` belongs to this project; the separate LS (content) project must ask here for dashboard changes.

---

## 10. Where the details live

| Topic | File |
| --- | --- |
| Every technical decision, per feature | [AGENTS.md](../AGENTS.md) |
| Building a new LS, step by step | [docs/general/new-ls-playbook.md](general/new-ls-playbook.md) |
| Class games (Roger's readable guide) | [docs/general/class-games-guide.md](general/class-games-guide.md) |
| Secure recall checkpoints | [docs/general/secure-checkpoints.md](general/secure-checkpoints.md) |
| Problem reports routine | [docs/general/problem-reports-auto.md](general/problem-reports-auto.md) |
| Research audit decisions | [docs/general/research-audit-brief.md](general/research-audit-brief.md) |
| One LS's rules and decision log | `docs/<course>/ls<n>-<name>/AGENTS.md` |
| One LS's grading, indicators, FP rubric | `docs/<course>/ls<n>-<name>/grading.md`, `indicators.md`, `final-product-assessment.md` |
| Programmes (Catalan) | `docs/2eso/programme.md`, `docs/4eso/programme.md` |
| Teaching materials index | [docs/README.md](README.md) |
| Roger's English corrections | `/mnt/project-files/english-corrections.md` |

---

## 11. Contradictions and stale text (for Roger to decide)

Found while gathering. Until Roger answers, Claude follows the **newer** rule (in bold).

| # | Topic | The older text says | The newer rule says | Where to fix |
| --- | --- | --- | --- | --- |
| 1 | Committing | AGENTS.md › Verification: "Do not commit or push unless explicitly asked." | **Claude opens PRs for every change and merges on "merge"** (the way every thread has worked since October). | Reword the AGENTS.md line to "commit on a branch, open a PR, merge only on 'merge'". |
| 2 | Exam delivery | AGENTS.md › Exams, the playbook and 4ESO LS2 `grading.md`: a Google Form per route, writing 30 points. | **Web exams on the site (1 and 17 Nov 2026), Base/Core papers with versions A/B/C, L20 R20 V35 G15 W10.** | Update the playbook (Part 1 "Exam", step 10) and both LS2 `grading.md`. |
| 3 | Exam versions | `el-web-exam.js` header and AGENTS.md: versions A or B. | **A/B/C** (19 Nov 2026). | Comment and AGENTS.md line. |
| 4 | Web exam writing | AGENTS.md: Roger clicks a 5.1 level (NA 8 · AS 15 · AN 23 · AE 30 of 30). | **Claude marks it with C1–C4 (8/4/4/4 of 20)** (17 Nov 2026). Are both still wanted (click = manual backup)? | Ask Roger. |
| 5 | Speaking hand-in | AGENTS.md (3 and 7 Nov) and a memory note: hand in the transcript; transcript boxes read-only. | **Recording only, no transcript** (14 and 16 Nov 2026). | Remove the transcript lines from AGENTS.md. |
| 6 | Writing revisions | Playbook Part 1: the first version goes for AI feedback, then an improved final version. | **Every writing is handed in to the teacher once, and Claude corrects it** (1–2 Nov 2026). | Update the playbook's "Each learning path" row. |
| 7 | Daily work split | Playbook: practice 7.5, checkpoints "half of the grammar and vocabulary block". | **Practice 5 + class games 2.5**, checkpoints 10 of 35 (9 Nov 2026). | Update the playbook's LS mark row. |
| 8 | Compulsory questions | AGENTS.md (14 Nov): split grammar steps and Prepositions + vocab have 7 compulsory + 7 extra (`req: 7`). | **4 compulsory per grammar block** (16 Nov 2026, "4 per point"). Does Prepositions + vocab keep 7? | Ask Roger, then fix AGENTS.md. |
| 9 | "Optional" labels | Memory (26 Oct): no "optional" labels on student pages. | **The sample exam shows "💪 Optional · exam practice" / "🎯 Test yourself (optional)"** (9 Nov 2026), on Roger's request. | Keep the exception; reword the old rule. |
| 10 | Continue card | Memory standing rule: every LS has a Continue card. | **Simple LS home (20 Nov 2026) hides the Continue card on the LS page**; the board keeps ▶ Continue. | Confirm with Roger. |
| 11 | Mixed games | AGENTS.md (6 Nov): "never a mixed game again". | **Decks stay a pair, but the board can play both together** (19 Nov 2026, PR #742). | Both are true; the wording is now clear here. |
| 12 | FP videos with Gemini | Memory (19 Nov): finish LS2 with the paid Gemini API, switch to Roger's app from the next LS. | **Roger's own Gemini app now** (20 Nov 2026, `FPG_APP = true`). | Project memory note updated 20 Nov 2026. |
| 13 | Students' week | Playbook Part 1 "Calendar": students have a "My week" button. | **No week plan for students** (6 Nov 2026): ✅ To do and 🏠 Homework only. | Update the playbook's Calendar row. |
| 14 | Three routes | AGENTS.md › Content-first and the playbook step 3: "three routes". | **Four routes + Pro** (Starter, Base, Core, Plus; Pro in 4 ESO). | Wording only. |
| 15 | Level conversion | Memory (1 Nov): marks to be converted by level ("an 8 from a Base will be a 6"). | **Nothing decided or built.** | Ask Roger before the next exams. |
