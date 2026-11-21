# How we work - Work requirements

**Every rule Claude follows when it works for Roger on English Lab, in one organised document.** First version 20 Nov 2026, **for Roger to revise** (start with [section 13](#13-to-revise-what-is-outdated-and-what-contradicts)).

It unifies:

- the Drive guides in Teacher Studio › 01_General › **01_How we work** (*How we make exams*, *How we make rubrics*, *Drive rules*, *Prompts*) and **08_Reference docs** (*Procediment LS per curs*, *Competences per term*, *How to make a class game*, *LS playbook*, *Research audit*);
- the project instructions and the project memory's standing rules;
- the root [AGENTS.md](../AGENTS.md), the LS `AGENTS.md` files and the notes in [docs/general/](general/) (21 Nov 2026: every rule moved here; the notes keep only how each feature works).

Duplicates are merged into one line. Each rule says where it comes from and when Roger set it. Where two sources disagree, Claude follows the **newer** rule until Roger decides, and the clash is listed in [section 13](#13-to-revise-what-is-outdated-and-what-contradicts).

## 0. About this document

**Where it lives** (Roger, 20 Nov 2026: "I need you to be efficient… organize the info there where I can also review it").

- **This file is the one rulebook.** Every rule lives here and nowhere else: project memory, the routine files and the feature notes in `docs/general/` only point here. The notes stay because a thread reads the note of the feature it changes before touching it; outdated notes are in `docs/archive/` (21 Nov 2026). The repo's `CLAUDE.md` loads this file into every Claude session that works in the repo, so no thread can miss it.
- **Roger reviews it on GitHub**: [docs/REQUIREMENTS.md](https://github.com/rogerbeltranps-lab/English-lab/blob/main/docs/REQUIREMENTS.md). He writes his changes or answers in a thread (or as a comment on the PR), and Claude edits this file in a PR.
- **A new standing rule goes here in the same PR as the work.** Change or remove the old line instead of adding a second one. Never write a rule only in project memory, a routine file or Drive.
- **In Drive** (Roger, 20 Nov 2026), Teacher Studio › 01_General › 01_How we work and 08_Reference docs each hold only a link doc that opens this file. The old guides, and a snapshot of this file as of 20 Nov, are in each folder's `Archive`. Nothing was deleted.

**Order of authority** (first wins):

1. What Roger writes in the current thread.
2. This document (standing rules).
3. The root `AGENTS.md` (technical decisions), then the LS's own `AGENTS.md` (rules for one LS), then the guides in `docs/general/`.
4. Project memory topic notes (history of each feature: context, not rules).

**Keeping it true.**

- The technical detail of a rule (file names, functions, data) goes in `AGENTS.md`, in the same PR.
- Each rule carries its date, so the newest is easy to see.
- A rule for one LS only goes in that LS's `AGENTS.md`, not here.
- **The website and this file move together** (Roger, 20 Nov 2026: "I've been making changes (and I will continue) and I will change rules"): every PR that changes what students or Roger see, or how something is marked, checks this file and updates the line it changes, in the same PR. When Roger changes a rule in a thread, the old line is replaced, never kept next to the new one.

**Key words.** LS = Learning Situation · LP = learning path · SLP = a section (tab) of a learning path · FP = final product · CE2 to CE5 = listening, speaking, reading, writing · CE1, CE6 to CE10 = the integrated competences · route = the student's level (Starter, Base, Core, Plus, Pro; called itinerary in the older guides).

**Source tags.** *Exams doc*, *Rubrics doc*, *Drive rules*, *Prompts*, *Procediment*, *Competences*, *Research audit* = the Drive guides above · *AGENTS* = root AGENTS.md · *Playbook* = docs/general/new-ls-playbook.md · *Memory* = project memory · *Instructions* = project instructions.

---

## 1. Working with Roger

**Talking to Roger**

- Write to Roger **in English**, even when he writes in Catalan or Spanish (Memory).
- End **every** reply with a short **"Pattern to watch"** (Instructions, 17 Nov 2026): at most 3 items, "what he wrote" → **natural version** + one-line rule. Correct only grammar, prepositions (his weakest point) and idiom (Catalan/Spanish calques). **Never** correct typos, spelling, capitals, punctuation, accents, apostrophes or contractions (Im, dont, u) or to/too slips: he types fast on his phone (19 Nov 2026). No real mistakes → say so in one line.
- Log every correction in `/mnt/project-files/english-corrections.md` (date, what he wrote, natural version, rule).
- Lead with the result. Short, friendly, plain words. Roger is an English teacher, not a developer: explain technical things in one sentence. Only the steps he has to do, in order, no advanced options unless needed (Prompts, 22 Oct 2026).
- When a piece of work has several parts that Roger reviews, do one part, report, and wait for his OK ("seguim") before the next (Procediment, 21 Oct 2026; Playbook).

**Approval words** (Memory)

| Roger says | It means |
| --- | --- |
| **"merge"** | Approval to merge the PR. |
| **"apply"** | Approval for a live write (Firestore data, uploading exam or checkpoint keys, importing marks, deleting an account, deploying a new school script version). "merge" alone never covers it. |
| **"send"** | Approval to send an email or message that was shown to him. |
| "merge without asking" / "send without asking" | Approval for that one ask, not a standing rule. |

- Always show a **preview before merge** (screenshots at the sizes students use, or a description for a non-visual change).
- After a merge that changes pages, tell him to **hard reload** (Cmd+Shift+R / Ctrl+Shift+R), and students too when they need it.
- Live writes: dry run first, show what would change, then wait for "apply".
- Ask once with a decision card when a choice changes his goal; keep working on the recommended option meanwhile, unless it cannot be undone.

**Finishing work**

- **Don't give up early** (8 Nov 2026). Before saying "it can't be done", try the other routes. Never pick a fallback for him without asking.
- **Never resolve a thread without his OK.** Exception (9 Nov 2026): once a PR is merged and nothing is left, resolve it.
- Every new thread runs on **Opus 5.5, effort high** (Memory).
- Before delivering anything Roger asked for, check it yourself (curricular fit, levels, that every question can be answered) and explain briefly the decisions taken (Prompts, 22 Oct 2026).

**His computers and accounts**

- **Never act in Roger's browser or accounts without asking** (8 Nov 2026). Give him the link instead. **One exception** (Roger, 21 Nov 2026): Claude pastes and deploys new versions of the school Apps Script relay itself, in the browser built into the Claude app, once Roger says **"apply"** for that change. Every other browser or account action stays forbidden.
- Setup on his computer: **one step at a time, one paste-ready command**, full paths filled in. Never ask him to paste a secret in the chat; for a key, give one Terminal line that copies `NAME=value` to the clipboard.
- School Wi-Fi blocks github.com: on school days he needs his phone hotspot for anything that talks to GitHub.
- Devices: Mac (`/Users/roger/Developer/English-lab-site`) and PC (`C:\Developer\English-lab`). Both fall behind `main`; pull when a device session starts.
- New versions of the school Apps Script (mail relay, Gemini, Classroom): Claude writes the file in `/mnt/project-files/school-script/`, shows what changes, and after Roger's **"apply"** pastes and deploys it in the Claude app's built-in browser (21 Nov 2026; Roger no longer pastes scripts by hand). Scripts Roger runs himself must need no API to switch on and no Google Cloud setup (Prompts, 22 Oct 2026).

**Costs and scheduled tasks**

- **Never run a paid generation** (ElevenLabs voices, credits) without Roger's OK **for that specific generation**. An approved script is not permission to generate (AGENTS).
- Gemini (shown as "Roig") costs money: only speaking feedback and analysis use the API now; FP videos are marked in Roger's own Gemini app (20 Nov 2026).
- Scheduled tasks (marking, problem reports, audits): never re-enable a task Roger paused, never delete and recreate one (the school script holds their tokens).

---

## 2. Privacy, data and Drive

**Privacy**

- **The repo is public.** Never commit personal data (names, emails, marks, the student list), real exam content, answer keys, exam audio or checkpoint keys (AGENTS; Exams doc; Drive rules).
- Personal data lives only in `/mnt/project-files/alumnes/` and Drive › Teacher Studio › **04_Students (private)**.
- No student names or emails in PRs, commits, code or comments: write "problem report, 2ESOA, 8 Nov".
- In demos, previews and screenshots use the invented students of the demo files (Alex Sample, Pau Exemple), never real ones.
- **Keep Firestore reads low** (the free plan's 50,000 reads a day ran out on 1 Nov 2026). No new reads without a reason; cloud scripts must check for quota errors (a silent 429 returns empty data).
- The service-account key `bf3c16b4…` was partly exposed in a screenshot and should be replaced (open item).

**Backups and the yearly cycle**

- **Backups** (20 Nov 2026, [backups.md](general/backups.md)): Firestore backs itself up every day (kept 7 days) and every Sunday (kept 14 weeks), and every Friday a copy goes to Drive › 04_Students (private) › English Lab database copies. The copies hold students' personal data: never in the repo, the project's public files or an Action log. A restore happens only on Roger's "apply".
- **Yearly cycle** (roadmap, Oct 2026): at the end of each school year, export every student's progress (CSV) and keep the backups in the school's Drive, then delete the year's student data from Firebase. How long backups are kept, who opens them and when they are deleted belongs to the data-protection approval and the privacy notice for families (students are minors); keep backups without names where names are not needed. **Ask Roger** before the first yearly deletion (June 2027).

**Drive: where things go** (Drive rules, 26 Oct 2026; AGENTS)

- Teacher Studio (folder id `1GwOQ20qtYRregPQ0aSsXyCSJo9si7oC_`): `00 Start here` · `01_General` (official documents, competences, levels, grammar and lexicon by level, **01_How we work**, calendar, `07_Word lists (Lexora)`, `08_Reference docs`) · `02_Cursos` › `2 ESO` / `4 ESO` › `Programme`, `LS1 …` to `LS6 …` · `03_Site assets` · `04_Students (private)` · `05_Archive`.
- Everything for one course and LS goes in its LS folder: `Exam` (with `Google Forms script`), `Summaries`, `Final product`, `Assessment`, `Listenings`, `Videos`. **Create a subfolder the first time it is needed, with its own `Archive`.**
- Teaching programmes go in the course's `Programme` folder: one current file (the version with every route); older versions in its `Archive`.
- Things for every course go in `01_General`.
- **Exams, answer keys, exam audios and Forms scripts live only in Drive** (course › LS › Exam) and project files, never in the repo. Other audio and video for the site live in the repo.

**Drive: new and changed documents** (Drive rules, 26 Oct 2026)

- **Every new document Claude makes** (exams, keys, audios, scripts, programmes, rubrics, summaries, assessment, competences, levels…) **is saved in its Drive folder as soon as it is done.**
- **When a document changes, update it in place** (same file, same name), so links keep working.
- When a document gets old, move it to the `Archive` folder inside the same folder; add the date to its name if a newer file has the same name, e.g. *Learning_Situations_4t_ESO (2026-10-24).docx*.
- **Never delete anything** in Roger's Drive. Old or duplicate files go to `Archive`; Claude never deletes student videos. When Claude finds a duplicate, it tells Roger and lets him choose (20 Nov 2026).
- Keep `00 Start here` and the repo index (`docs/README.md`) up to date when a folder is added.
- New teaching materials go in Drive Teacher Studio (Memory).

---

## 3. What students see: naming, language and look

**Names on screen**

- **Gemini = "Roig", Claude = "Beltran"** everywhere a person can read it (site, dashboard, emails). New UI text never says Gemini, Claude, Google AI or "AI" (16 Nov 2026). Code, comments and prompts keep the real names.
- **Students must never learn that AI marks or answers their work.** Never mention AI to students (feedback, emails, cards). Exception by Roger's design: on the sample exam the student opens *their own* ChatGPT for the writing.
- Routes: students and the dashboard show only **Starter · Base · Core · Plus · Pro** (code keeps beginners · insecure · safe · daring · native; Research audit, 26 Oct 2026). Never capitalise "Safe", "Daring", "Insecure", "Beginners" or start a sentence with "Native" in student content (they get relabelled).
- Students see **levels, not support**: only the CEFR label (2 ESO A1 · A1+ · A2 · A2+; 4 ESO A1 · A2 · B1 · B1+ · C2). Never "molt suport", "strong support" and the like (1 Nov 2026). Students never see the word "route".
- LSs carry their number: "LS2 · Free Time, Live!" (7 Nov 2026).
- "**Learning path**" naming stays (20 Nov 2026: Roger reversed his earlier "remove it").
- The class step is "**🙌 Work it out together**" / "Ho resolem junts", never "Correct together" (19 Nov 2026).
- The student board is "**My dashboard / El meu tauler**". Teacher tiles are **Assessment details** and **Students' progress** (11 Nov 2026).
- `teacher.html` is in English only.

**Language by level**

- Starter and Base (and no route): instructions, hints, help and feedback in **Catalan**. Core, Plus, Pro: **English** (Exams doc; AGENTS). English stays the target language for all input and production.
- Answers and messages to students go in **both languages**, their language first (20 Nov 2026).

**What students must not see**

- **Never show locked or future work** (7 Nov 2026): no 🔒, "not open", "checkpoint first", or totals that include closed steps. Only learning paths and sections Roger has opened.
- **No class work shown in advance** (20 Nov 2026): a tab planned for a later class is hidden, like a locked tab, until its class opens it (5 minutes before class, or class mode); never shown in blue. Its steps still count in the path's progress.
- **Students are never told which activities are assessed**: no "this counts", "first try" or "checkpoint" labels (26 Oct 2026). Only the general note that all work is part of continuous assessment (40 % of the LS mark from LS2).
- Students never see **send times** of messages (14 Nov 2026), never classmates' marks, never where Practise content comes from.
- "Not late yet" counts are never shown to students (19 Nov 2026).
- The public home page shows no screenshots or pictures of the app and never mentions the full screen mode (7 Nov 2026).
- **Students never see Towards Nativeness** (20 Nov 2026). It is Roger's own C1 to C2 course (a personal LS in 4 ESO). It never appears anywhere for students: menu, My marks tabs, board, progress, notebook, LS lists. The teacher's 👁 student view must show exactly what students see, so it is hidden there too. Only the dashboard, Roger's own view and the tester see it. Checked on every PR by `tools/students-never-see/check.mjs` (PR #784).

**Look and devices**

- **Quality over quantity** (19 Nov 2026): too many activities. Students see only the SLPs Roger adds; the final product is always last. Keep screens short: little on the menu, details inside each place.
- Students use **Chromebooks (~1366×768)**: design for that first, then check 390×844 (phone). Phone rules live only in `el-phone.css` inside `@media (max-width:640px)`; computers must stay pixel-identical.
- Course palettes: **2 ESO green, 4 ESO blue**. Competence colours: CE1 teal, CE2 blue, CE3 orange, CE4 green, CE5 purple, CE6 amber, CD indigo, CC pink.
- **One colour rule for every percentage** (20 Nov 2026): under 50 red · 50–59 orange · 60–79 green · 80–89 blue · 90+ purple (`elPctCol`).
- Marks: the degree (Assoliment notable…) in a coloured box first, the number small beside it (10 Nov 2026).
- Student pages: no translating, no copying of page text, no spell-check in answer boxes (9 and 13 Nov 2026).
- Everything students can download or print carries "© (year) Roger Beltran · English Lab · All rights reserved".
- Students' answers always come back (on reload, another device, after a level change) unless they redo that activity (6 Nov 2026).
- Never draw a guessed page that changes after sign-in (7 Nov 2026).
- **LS1 stays as it is** unless Roger asks: its content and pages are finished.

**The student's pages** (site as of 20 Nov 2026)

- **Home = the voyage road** of the LS: same layout every LS, a new setting per LS (4 ESO a sea voyage, 2 ESO LS2 a reporters' bus tour; art from ChatGPT/Gemini prompts Roger runs). The stops are only the Time plan's tabs; every student's vehicle is shown; nothing covers a stop, a label or a vehicle. Music is on by default and **off during the group's class time** (the 🎵 button can't turn it on then). The 2 ESO road has no Barcelona landmarks (20 Nov 2026).
- **⚠️ Report a problem on every page**, including game boards, videos, flashcards, rubrics, grammar presentations and print pages (19 Nov 2026).
- **📊 My marks on one screen** (19–20 Nov 2026): the LS mark so far with its parts (📚 Everyday work, 🎬 Final product, 📝 Exam, 🎯 My checkpoints), ⏰ late activities (at most 5, the rest in ✅ To do), the points in one line, and **How you are doing in each skill** (activities and exam per skill; the exam only once results are released). **Speaking = the final product's oral rows** (criteria 3.x) from LS2 on; in LS1 the whole final product.
- **🎓 My progress**: 📈 How my skills grow and 🕸 My skills radar, the student's own work only, the exam only once released (20 Nov 2026).
- **📝 Exam practice** in the side menu under My marks: the student's LSs, each opening its sample exams (19 Nov 2026).
- Question labels: no 👆 Tria / ✏️ Completa labels where the task is obvious; join, change, fix, listen and own example keep theirs (19 Nov 2026).

**The teacher's dashboard** (20 Nov 2026)

- Home: one card per group with the exam rings per part and a second line per skill with the **class work** (first tries + vocabulary and grammar games); the old First tries section is gone. 📝 Exams sorts 🏆 Best mark first.
- 🌱 Progress tile per group: LS mark so far, steps done, work marked, activities average, 📈 skill mastery over time (the whole year, week by week), 🕸 skills radar, average per criterion. No new Firestore reads.
- 👁 The student view shows exactly what students see.

---

## 4. Curriculum, competences and programmes

**Official text** (Procediment, 21 Oct 2026)

- **Never invent competences, criteria or codes.** Use only the literal official text, copied from the PDFs (Decret 175/2022 and the XTEC transversal documents). If the text can't be found, write the code with "text oficial pendent" and tell Roger. *Choosing* which criteria an LS assesses is design; *rewording* them is not allowed.
- **Take the right course's column.** Foreign language (Decret 175/2022): two columns, *1r i 2n* (left) and *3r i 4t* (right). XTEC transversals: five columns, the last two are ESO (1r i 2n, 3r i 4t): for 2 ESO the fourth column, not the first.
- **Official transversal codes**: CC1–CC4, CPSAA 1–CPSAA 5 (with a space), CD1–CD5, and CE1–CE3 of the entrepreneurial competence, always with the word "emprenedora" next to it so it isn't confused with the English CEs. No home-made abbreviations (such as "EMP").
- Programme documents are **in English with the official terminology in Catalan** (competències, criteris, sabers).
- Mistakes already made in 4 ESO, never to repeat: summarised or reworded criteria shown as official; invented abbreviations; criteria swapped between codes (1.1 ↔ 1.2) or mistyped ("veràç"); video FPs that didn't assess Speaking; Listening missing from most LSs; grammar and lexicon tables following the maps' units instead of the course.

**Competences across the year** (Competences, decisions of 30 Oct 2026)

- **CE2 to CE5 (the four communicative competences) are assessed in every LS and every term.**
- **The integrated competences (CE1, CE6 to CE10) are assessed only in the LS that plans and shares a task for them**, usually one or two per LS (2 to 4 per term). Each one is assessed at least once a year, and every criterion of the course appears at least once over the year.
- **Transversal competences** (CC, CD, CPSAA, entrepreneurial) are assessed and shown apart but **never count in an English mark** (LS, term or year).
- **The year mark of each competence weights Term 1 ×1, Term 2 ×2, Term 3 ×3.**
- CE8 (mediation) gets a second small assessed task when 2 ESO LS5/LS6 and 4 ESO LS5 are designed.
- Students must know the learning objectives and the assessment criteria (DOIGC, quoted in Competences).

**Writing a programme or an LS design** (Procediment, 21 Oct 2026)

- Six LSs per course, two per term; each with title, guiding question, timing and final product.
- Section headings of each LS: 1 Learning objectives · 2 Competències específiques i criteris d'avaluació (two blocks: communicative skills CE4, CE2, CE3, CE5, all four in every LS; integrated competences, one or two) · 3 Final Product (per route) · 4 Sabers: Vocabulary (cumulative: each route keeps the lower routes' words and adds more) · 5 Sabers: Grammar (per route) · 6 Competències transversals (one or two XTEC sub-competences, literal criterion of the course's ESO column, plus an *Evidència* line marked as a proposal, not official text).
- **Objectives = CAPACITY + KNOWLEDGE + PURPOSE**, with a verb from the table in `Objectius_redactat.pdf` (preferably apply, analyse, evaluate or create), in English, with the CE they serve in brackets. LS-specific criteria: ACTION + KNOWLEDGE + CONTEXT.
- **Grammar and lexicon follow the course, not the units.** Everything the Drive grammar and lexicon maps give the course appears in some LS; nothing the maps put in another course; order inside the course is free; an item from an earlier course enters as **R** (review). Then update the course's column in both maps (units → LSs, new R items, a footnote with the decision), and make the LS tables match the maps.
- Delivery: a Claude Doc with an index, a summary table of the LSs with the coverage check (competences, grammar, lexicon), the full LS designs and the course's grammar and lexicon tables; plus a Word version in the course folder.

**Levels per route** (Exams doc; Procediment)

| Course | Starter / Base ("Insecure") | Core ("Safe") | Plus ("Daring") |
| --- | --- | --- | --- |
| 1 ESO | A1 with a lot of support | A1 consolidated | A1+ or early A2 |
| 2 ESO | A1+ or early A2 with scaffolding | functional A2 | A2+ or emerging B1 |
| 3 ESO | A2 with support | more autonomous A2 | emerging B1 |
| 4 ESO | A2/A2+ with support | indicative B1 | B1/B1+ |

Starter (Beginners) sits below Base, and Pro (Native, 4 ESO) above Plus; students only see the CEFR label (section 3).

---

## 5. Designing a Learning Situation

**The guide is the [new LS playbook](general/new-ls-playbook.md).** The model is **4ESO LS2 *Seasons & Celebrations*** as it is now; a new LS copies it and Claude only asks about what is different. Any change Roger makes to LS2 updates the playbook in the same PR, unless he says it is for one LS only.

**Before building**

- **Plan week by week, then build only that week** (Roger, 21 Nov 2026: "this web is to teach, not a self-study web… otherwise you prepare a lot of activities that we don't have time to do; and that's a waste of money"). The site supports teaching in class. An overview guide for the whole LS is fine, but activities are built one week at a time: 🤖 Claude drafts what happens in each class of the coming week, 👤 Roger checks it and says what to build, 🤖 Claude builds only that. Never build activities ahead of the agreed weekly plan.
- **Plan for the real pace** (Roger, 21 Nov 2026): about **two main activities per class**, each in a simple format (grammar: explanation, exercises, correction · listening: questions, correction, doubts and difficult words · reading: read, questions, correction · writing: model, write, hand in · speaking: model, prepare in pairs, say it). Every class: warm-up (5 min) · shadowing (5) · activity 1 (20) · activity 2 (20) · a game on that day's grammar and/or vocabulary (10).
- Remind Roger of the **integrated-competence gaps** (31 Oct 2026): CE7 serial story, CE8 mediation step (assessed a second time in 2 ESO LS5/LS6 and 4 ESO LS5), CE1 intercultural element for 4 ESO LS4, CE6 source check in LS3.
- **Content first** (AGENTS): only content Roger approved goes on the site. Never invent or change pedagogical content during implementation; flag gaps and contradictions first.
- Confirm the programme section is final. Check grammar and vocabulary against the programme and the Drive grammar and lexicon maps (section 4).
- Each step of the playbook ends with Roger's OK before the next.
- Lessons from LS2 (playbook): confirm the programme is final before building (rebuilt in PR #54); write readings per route from the start (#36, #38); record with `eleven_v3` and tags from the start (#51, #52); agree the exam format before writing it (#70, #72); plan the final product's marking rounds before its page (#71).

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

- Recall warm-up, vocabulary cards (15–20 **core words** per route, both directions; core words come back in later readings, warm-ups and checkpoints, the rest stay receptive: Research audit), practice, grammar, 💬 Expressions, reading, listening (prediction, a check between the two listens, a micro-dictation of 2–3 chunks of 3–6 words), shadowing, speaking / Talk, writing, My goal and How did it go?
- **Vocabulary cards** (20 Nov 2026: "simple like this and full screen, like Practise"): one card for the whole site, as in 🎯 Practise. Look at the word, say it out loud, **Turn over** (it plays the word and the example), then **✓ Ho sabia / I knew it** or **↺ Encara no / Not yet**. Full screen, **no typing**. The step is done after 10 "Ho sabia"; the cards never lock. LS1 keeps its old cards.
- **How it works boxes are always visual** (cards, examples, tables, ⚠ typical mistakes) and hold **no practice boxes** inside (14 Nov 2026).
- **Teaching flow** (13–16 Nov 2026): visual How it works → 📘 Grammar together: 🙌 4 questions together (from the extra practice), then ⏱ Your turn, and it ends there. Then notebook / pairs, then a short individual set.
- **Compulsory per grammar block = 4** (3 questions + the own example), the rest ➕ extra practice; 💬 Expressions = 6 compulsory + 4 extra per level.
- **Grammar that comes back**: only Starter and Base drill the old form; Core and Plus start from the new use, never more old-form items than new ones.
- Words with a structure (in/on/at, play/go/do, verb + preposition) are **💬 Expressions**, their own step after Vocabulary, not grammar (16 Nov 2026).
- ✓ Check per question; the mark is the first try; students can correct wrong answers in the notebook without changing the mark.
- Students can't copy the theory into their notes; notes are optional, their own examples (19 Nov 2026).
- Randomise answer options, never the questions.
- The recall warm-up is done with no notes; practice is done at 80 %; the learning path's piece of writing or speaking is saved for the final product (Playbook).
- Part of the vocabulary practice is **heard** (*Listen and complete*: the computer says the sentence, the student types the missing words) and the mixed practice is **said** (*Say it* into the mic), so the four skills stay balanced (30 Oct 2026).
- **Listening cycle**: "Before you listen" (predict 2–3 words), a first listen for the gist, a second for the questions, then the micro-dictation of its 2–3 chunks. Prediction and gist boxes come automatically; the LS only supplies the chunks. **Never marked.** Real videos are mixed with recorded ones.
- **Shadowing step** in every learning path after Getting started (30 Oct 2026): a 25–45 s part of a recording the LS already has (never changed), with script and start and end times for the normal and slower copy, done in four rounds, counted by completion. The same clips run on the class shadowing page in the first five minutes of class.
- **My goal / How did it go?** opens and closes each learning path: about a minute, never marked, not a step; the teacher reads both on the dashboard.
- **Class presentations** introduce new vocabulary and grammar and **ask before they explain**: the class guesses each word, then sees it, hears it and gets its Catalan meaning. Teams win points (a bonus of up to +0.5 on the term grade), with a buzzer and a class quiz on the Chromebooks.
- **Recall checkpoints** every two weeks: on the LS page each sits right after the learning path it reviews and asks only about paths done before it; students must finish it to open what comes after (section 8).
- **Criteria**: every assessment criterion has at least one activity that gives evidence for it, and four levels (NA · AS · AN · AE) with indicators.

**Research audit content rules** (approved 26 Oct 2026; status in section 13)

- Final product groups mix routes: every group has at least one Core or Plus student, never an all-Starter/Base group; each student keeps their own route's task for their part.
- Once per learning path in class, a 6-minute **pair round before the speaking recording** (information gap, or 4/3/2: the same talk to three partners in 90, 60 and 45 s).
- The first learning path of each LS opens with a flashcard review of the previous LS's core words.
- Study summaries work as a self-test: a cover-and-recall column in the vocabulary tables and a 10-item self-quiz per learning path.
- Read and watch more (later): optional, never late, never graded; nothing added until Roger's Lexora app is ready.

**Class games** (see the [class games guide](general/class-games-guide.md))

- **One vocabulary game + one grammar game per LS** (16 Nov 2026), built from a vocabulary + grammar pair of decks per learning path; never a mixed deck. The board may play them together (📚🧩 Vocabulary + Grammar, 19 Nov 2026).
- Questions only in the game: no theory slides (16 Nov 2026). Cumulative: Roger ticks which points go in.
- Games are at **Core level** for everyone, not easy (the first demo was too easy), and use plenty of the learning path's **less common words**: passively (in the questions) and actively (questions on a word's meaning, use, collocation or preposition). A vocabulary game asks only words; a grammar game only grammar and 💬 Expressions. Lean: about 15–20 questions.
- In class: students see only the question and four coloured tiles (or type the words in a ✏️ written question); they never see the answer before the board shows it. No timer, only right or wrong. After a written question the board shows the wrong answers without names. Music only on the projector.
- **Points**: +1 term point per right answer; the best student in the group gets +0.5 on the term grade, the others proportionally down to 0; the tester never counts as the best. Results count only questions whose answer was shown; a student who joined but didn't answer gets it wrong.
- Our own names and art, never a copy of another game.

**Each LS has** (Memory; Playbook Part 1b)

- The icon side menu, the ⓘ About banner, the "This LS in 4 minutes" video, the 🧩📚 Games and theory card, a shadowing video (~6 min, the approved format), a self-assessment Reflect page, secure recall checkpoints, a sample exam (optional, always open), vocabulary games, a study summary PDF per route, paper worksheets, its voyage road skin (themed per LS; art via ChatGPT/Gemini prompts Roger runs).
- The LS page's Final Product tab is only a short card with "Open the final product →"; the final product page opens with a model final product for the student's route, then what the route must do and what counts, the steps and the rubric.
- A study summary PDF per route (students download it from their board) and a Word copy for Roger.
- Calendar: dated sessions per group, the exam day and a due date per activity, on the dashboard and the student board.

**Site look checklist** (Roger, 7 Nov 2026; Claude ticks every line before Roger tries a new LS; the 20 Nov simple LS home may have changed some, check against LS2)

- Name with its number ("LS3 · Title") in the page title, heading, back link and menus.
- No 📚 Study place and no "List in the LS" link; the grammar and vocabulary lists stay hidden in the page for the board's 🔤 Grammar and vocabulary place, with the summary PDF.
- 🧩📚 Games and theory card beside the LS title: grammar and vocabulary circles, Open and 📝 Your notes.
- Tiles: 📈 My formative assessment, 🗣 Shadowing video, ⓘ About this LS, 🖨 Paper worksheets (teacher only). No 🎮 Vocabulary games tile.
- ⓘ About is visual (objective cards with a verb icon, the "How will we work" diagram, competence tiles, criteria as cards that open), opens at the top at once, and going back returns to where the student was. No routes or Catalan help paragraph.
- Students see only the learning paths the teacher has opened.
- On the board: the Games and theory card with this LS's results only, 🎯 My level beside the greeting ("Core · A2"), My marks, Final product and Exams in the same card style.
- Flashcards speak with the Kokoro Heart voice; listenings, Talk and dictation stay ElevenLabs.
- Students' left menu is the shared one (My dashboard · Practise · My course and its LSs · Books · Grammar and vocabulary · Games · Help · Study on your phone); Practise and Games show only the student's own course.
- The teacher's student view shows the page in the student's language from the first moment, with the red frame.

**Final product**

- A spoken video: students upload it on the site; it goes to Roger's Drive. **No spoken video = 0.**
- Only the video is marked as a group; everything else per student. Marked in two rounds, midway and at the end, with a marking PDF per round; a rubric per route in Word (Playbook). Group make-up: see contradiction 29.
- Procediment (21 Oct 2026): a video made with Google Slides, the student's face visible in picture-in-picture; audio alone only for practice (still the format? see section 13).

**Audio and video**

- ElevenLabs: `eleven_v3` with audio tags, voices chosen by Roger from previews, one OK per generation. Slow copies always made locally for free (ffmpeg). Flashcards use the free Kokoro Heart voice.
- Never re-record a listening students already used.

---

## 6. Making an exam

The base is Roger's guide ***How we make exams*** (28 Oct 2026), updated with what changed when exams moved to the website (LS2, Nov 2026). Rules that only applied to Google Forms are kept apart in 6.12. Where Roger has not decided something, it says **Ask Roger**.

### 6.1 What the exam counts

| LS | LS mark |
| --- | --- |
| LS1 (both courses) | Exam **75 %** · final product **25 %** (learning paths were practice) |
| LS2 and every later LS | Exam **35 %** · final product **25 %** · daily work in the learning paths **40 %** (2 Nov 2026) |

- **One exam per LS. Grade = points ÷ 10** (exam out of 100), the same for every level; no maximum-grade caps (Exams doc).
- Each section carries its criteria; vocabulary and grammar count for **4.1 and 5.1** alike (Use of English is reading and writing, 30 Oct 2026).
- Scale: NA 2.5 · AS 5 · AN 7.5 · AE 10. Mark to degree: under 5 NA · 5–6.9 AS · 7–8.9 AN · 9–10 AE.
- A percentage alone never sets the degree of 4.1 or 2.2: their indicators describe a task (reading log, listening chart); the exam scores are supporting evidence.
- **LS1's harder (Daring) exam counts ×1.2**, capped at 10 (17 Nov 2026). Levels are still set from the raw points. **Ask Roger** whether the harder paper of later exams gets a bonus too.
- The exam is not the whole LS: the number of activities done never raises an exam mark, but it counts in the LS mark (Rubrics doc).

### 6.2 Before writing it

1. **Find what each group has really done**: the Time plan ticks and class days, dropped learning paths (not in the exam for that group), the class games played. The exam asks only that (19 Nov 2026: "only what both groups did"). Respect the objectives, vocabulary, phrasal verbs, expressions and grammar really worked (Prompts).
2. **Exam day per group** is in `EL_PLAN[ls].exam`; check it with Roger.
3. **Remind Roger** to decide: the versions per level and who takes each; how a mark converts between levels ("an 8 from a Base will be a 6": still undecided, nothing built).
4. **Agree the format with Roger before writing** (lesson from LS2: the exam was rebuilt twice).
5. Look at what students do best and worst in the activities and class games. For LS2 Roger wanted the exam **achievable** ("so that they get good marks", 19 Nov 2026): lean on strengths (choosing is easier than typing), avoid what most failed. **Ask Roger** if the next exam should be tailored the same way.
6. **From LS3 on, 10–15 % of the exam is on the core language of earlier LSs** (Research audit, 26 Oct 2026).

### 6.3 Structure

- **Sections in this order, by criterion** (Exams doc; Prompts): 1 **Listening** (2.1) → 2 **Reading** (4.1) → 3 **Language in Use**: Vocabulary + Grammar (4.1 / 5.1) → 4 **Writing** (5.1 + 5.2).
- Current weights (LS2, both courses, 19 Nov 2026): **Listening 20 · Reading 20 · Vocabulary 35 · Grammar 15 · Writing 10** = 100.
- **Two papers by level** (19 Nov 2026): **Base** for Starter and Base (and students with no level), **Core** for Core, Plus and Pro.
- **Several versions per paper so neighbours can't copy** (A/B/C, given by account). Every version has the same structure, points and difficulty, with different texts and questions. No listening question is shared between versions of the same paper.
- Every question is assigned to the criterion it really assesses; vocabulary and grammar are tools to understand and produce messages, not isolated knowledge (Prompts).
- The student's exam level is shown under every exam mark (dashboard and board).

### 6.4 Good items

- **VERY IMPORTANT: the reading must not give away the writing** (Exams doc, 28 Oct 2026). The reading never shares the topic or content of the writing task, or at least contains no sentence a student could copy into it. Check it for every paper and version before delivering. (Reason: in 4 ESO *My Real Routine*, one writing was almost a copy of the reading.)
- Distractors are **plausible, homogeneous and of equal difficulty**. No length clues, no grammar clues, no absurd options, no predictable patterns.
- **No item reveals the answer to another.**
- No answer can be found by elimination or without understanding the text, the audio or the content.
- Questions follow the order of the audio and of the text (17 and 20 Nov 2026); questions are never shuffled, options are, and the right letter is spread evenly.

### 6.5 Item types and answer keys

- **Everything except the writing is 4-option multiple choice or a short gap (1–3 words)** (Exams doc; 25 Oct 2026), so it marks itself.
- **One box per gap** (20 Nov 2026): a two-word gap is two boxes (`split: true`).
- **Keys accept every correct answer, not only the target expression**: contractions = full forms (I'm watching = am watching), capitals, extra spaces, apostrophe type and a final full stop don't matter (Exams doc; Prompts); the words alone, the chunk or the whole sentence; extra words taken from the question are fine; in "Correct the mistake" only the gap sentence counts (20 Nov 2026).
- Spelling slips: see contradiction 21 in section 13.

### 6.6 Listening

- **First section, one shared audio** for all versions and levels, with different questions per version and level; played in class, all together. "Listening finished" opens the rest. A make-up student may play it at most twice, no pause or rewind.
- **Short: about 1.5 minutes**; plan fewer audio facts (Exams doc).
- Claude delivers the full script and a plain dialogue `.txt` (`SPEAKER: line`). Who records it: see contradiction 18.

### 6.7 Writing task

- One task per paper, in English with the Catalan underneath; Base also gets a frame; the word count is shown as a guide (no penalty, section 7).
- Students may copy and paste their own text inside their boxes, nothing from outside.
- Marked with the exam writing rubric (section 7).

### 6.8 Keeping it secret and where it goes

- Exam sources, keys and audio live **only** in project files (`web-exam-<course>-<ls>/source.mjs`) and Drive (course › LS › Exam); never in the repo. `data/exam.js` on the site has questions and options only, **no answers**.
- Keys go to `cpKeys/{exam key}.web` with `tools/web-exam/upload-keys.mjs`: dry run first, `--apply` only on Roger's "apply". After any change to the source, rebuild **and** re-upload the keys before the exam.
- The re-entry password is stored only as a hash; never write it anywhere.
- No notebook, notes, dictionary or quick-note pad on the exam page (20 Nov 2026).
- The **tester account** does the exam first to check it works; its try never counts.
- Paper copies for students without a laptop: print packs per paper and version, keys apart, odd papers padded for double-sided printing, kept in project files.

### 6.9 The sample exam

- On the site, **same format and points** as the exam, **new sentences** (no overlap with the real exam), built only on what the groups covered.
- **Optional and always open** (9 Nov 2026): never homework, never To do, never late, never in the bonus; shown as "🎯 Test yourself". Every new LS's sample exam gets `optional: true`. Open it **a week before the exam**, with each section's result linked to what to review (Research audit).
- Its first tab is the LS shadowing video (information only).
- Its writing opens the **student's own ChatGPT** with a prompt that asks only for a **mistakes table** (No. · Criterion C2/C3/C4 · Mistake · Correction · Why) and the corrected text: **never a mark, level or points** (20 Nov 2026).

### 6.10 On the exam day

- On the exam day of the Time plan, 🎓 Class mode opens the exam page. 📝 **Exam mode** pulls the group's students to it; Roger explains the rules, then ▶ **Start the exam** starts every waiting exam at once.
- Exam mode starts by itself only during the group's class time; outside it there is a button (19 Nov 2026).
- Full screen; leaving it, another tab or app for more than 0.4 s, or a reload stops the exam; Roger types his password on the student's screen to let them back in. Changes after coming back are logged.
- After listening, students move freely between Reading, Vocabulary, Grammar and Writing and see ✅ Review (blanks in red) before 🏁 Turn in (see contradiction 17).
- **Roger closes the exam himself** (🔒 Close). Nothing closes a started exam automatically (19 Nov 2026).
- Make-ups and single students: 👤 Only some students…; class mode goes on for the others.
- On a Chromebook in full screen, the 🔍 Search key, Alt+Tab, the top-row keys and Ctrl+W/T/N do nothing (20 Nov 2026; still to test on a real Chromebook).
- After turning in: practice games (LS words, never exam items), points only in the browser.

### 6.11 Marking and results

- Everything but the writing is marked automatically against the keys. Record the version each student took.
- **Writing**: Claude marks it with the C1–C4 rubric (section 7), the corrected text, a mistakes table and feedback in Roger's voice (Catalan for Base, English for Core). A blank writing is 0. Writing rows are always named C1–C4.
- **Preview first** (marks per student, average, how many passed), then save only on Roger's "apply".
- **Paper exams**: marked by hand from Roger's photos, doubtful items flagged; Roger enters them (Save marks skips paper rows).
- **A part not done is left out, not 0** (14 Nov 2026): the mark is the other parts rescaled to 10.
- A student who lost connection: use what was saved, only on Roger's word (20 Nov 2026).
- **Results are held**: they show 4 days after the exam at 8:00 (17 Nov 2026), or on the day Roger chooses (2 ESO LS2: Fri 27 Nov 8:00). While held, the student sees neither the sections, the report, the writing level nor the exam in "My LS mark so far".
- **Don't notify students or save marks until Roger says results can go out.** An email needs his "send".
- **The report**: the whole exam question by question (right ones too, with the student's answer, the right one, why, and what to review), the writing with its C1–C4 cards, mistakes table and own text next to the corrected one. Catalan for Starter/Base, English otherwise.

### 6.12 The Google Forms format (LS1, Oct 2026)

Kept from *How we make exams* and *Prompts* for paper or Forms exams; **Ask Roger** whether any of it is still wanted (section 13).

- Four models A–D, each with the three itineraries, 35 items, 100 points, 50 minutes. Word versions first (editable, printable) and a teacher guide: keys, writing rubric, points, question-to-criterion map, pedagogical reasons.
- Two Google Forms per model: Form 1 (listening, reading, language in use; free navigation until submit; one response, no editing), then a link to Form 2 (writing), so students can't go back to the reading.
- Name, group (a choice) and itinerary required; school account only; email collected; the Sheet joins both forms by email.
- "I don't know" (0 points) on every academic multiple-choice item; gaps not required (blank = 0); progress bar off; page titles "Part X of N".
- The Sheet's grade out of 10 is the official grade: one tab per group, sorted by itinerary then name, writing text in the last column so Roger can add rubric columns; re-runs never delete responses or marks; rows never move; downloadable as Excel.
- School Sheets use `;` as formula separator: detect it, never hardcode commas.
- The Forms script: re-runnable without duplicates, resumable when Google stops it, a Catalan menu (create, verify, test send), checked in simulation before delivery; model script in `/mnt/project-files/my-real-routine-2eso/apps-script/`.

---

## 7. Making a rubric

From ***How we make rubrics*** (27 Oct 2026), for every rubric: exam writings, final products, oral tasks.

**Six principles**

1. **Validity**: assess what we really want students to learn (to explain a routine, an understandable description weighs most).
2. **Alignment**: ask only for what was taught, practised and announced before the task.
3. **Proportionality**: an error costs what it matters (a wrong preposition never weighs like not doing the task).
4. **Reliability**: two teachers with the same evidence reach similar marks; clear descriptors with examples, not long lists of counts.
5. **Equity**: every route can reach the maximum mark, with different demands and support. Not every text deserves the same mark.
6. **Formative value**: the rubric tells the student what they achieved and what to improve next (one thing done well, one to improve).

**The exam writing rubric** (out of 20, scaled to the section's points: 10 in LS2)

- **C1 Task achievement 8**: four aspects × 0–2 (0 no evidence, 1 partial, 2 developed), adapted to each paper and version.
- **C2 Grammar 4 · C3 Vocabulary 4 · C4 Organisation and cohesion 4** (organisation 0–1, connectors 0–2, mechanics 0–1).
- **No word-count penalty**: word ranges guide; brevity only costs points when ideas the task asks for are missing (in C1).
- **No quotas as thresholds**: "5 expressions" or "2 connectors" describe an excellent text, they never block a mark. No minimum number of structures.
- **One error, one penalty**: each error counts in one criterion only ("She get up": credit *get up* in vocabulary, penalise the -s in grammar).
- **Criterion 5.2** (planning, drafting, revising) is assessed from the process in the LS, not from spelling in one exam text.

**Every rubric**

- Has descriptors for a notable and an excellent text.
- **Indicators say how many times** (10 Nov 2026): fewer than half = NA, half = AS, 7 in 10 = AN, 9 in 10 = AE, plus the quality; each starts with what the student CAN DO.
- Final product: **Very good = 10/10** (a row at level 4 is always 10; Good / Fair / Developing 7.5 / 5 / 2.5 on a click) (14 Nov 2026).
- Comes with a ready-to-paste marking prompt (Rubrics doc says ChatGPT; see contradiction 25).

---

## 8. Marking and feedback

- **Everything is corrected automatically; Roger marks only the final product** (31 Oct 2026).
- **Weekly runs**: marking and corrections **Wednesday ~15:00**; comments answered at once (and a Friday 15:00 catch-up); the Friday audit is switched off for now. ✏️ "Correct everything waiting now" starts a run on request.
- **Feedback is written as Roger**, first person, never signed, never mentioning AI, never inventing what happened in class. Catalan for Starter, Base and no route; English for Core, Plus and Pro. Levels are never shown to students.
- **Writing corrections**: a short comment, a table Mistake · Correction · Why (at most 8) and the whole text corrected changing only the mistakes; the student sees their own text with the mistakes underlined. A handed-in writing is final unless Roger sends it back.
- **Speaking and Talk: recording only, no transcript card** (14 and 16 Nov 2026). Spoken corrections cover words and grammar, never spelling or pronunciation.
- **Copies**: the writing log (pasted characters, keys, time) flags possible copies; clearly pasted texts are sent back automatically with a Redo note; never "too good" for Pro.
- **Final product**: Roger marks it with **✨ Correct in my Roig** (his own Gemini app, the agreed prompt and rubric, nothing paid; 20 Nov 2026). For the next LS, automatic drafts must be **off**. The prompt is kind but honest ("I don't want to give grades they don't deserve"); prompt changes only with Roger's agreement. Feedback in the part-line format (`Name (30%) · 7.5/10` + ✔ / ➜ lines). LS1 FP reflection: students who said in a problem report they couldn't see the instructions get the reflection row 10/10; nobody else (14 Nov 2026).
- **Speaking analysis** (20 Nov 2026): teacher only; nothing runs by itself; 🔍 Analyse shows the count and cost first.

**Recall checkpoints** (Roger, 31 Oct 2026: "make sure they don't cheat"; [secure-checkpoints.md](general/secure-checkpoints.md))

- On the site, not as an exam: rules first ("I have read the rules" tick), one question at a time, about 45 s each, no going back, only once; no copying or pasting; leaving the page sends it automatically (back within 2 s is only a 👀 glance).
- No mark and no answers until Roger releases them (📣 Release feedback); then the page shows the mark, every answer, the right one and the hint (Catalan for Starter and Base).
- Answers and hints never in the repo: keys in project files and Drive, uploaded to `cpKeys` only on Roger's "apply", before the checkpoint opens.
- The dashboard warns (⚠️) when a checkpoint is 35 points or more above the student's usual level: worth a look, not proof.

**Daily work** (the 40 %)

- Recall checkpoints 10 · warm-ups 2.5 · practice/grammar/mixed done 5 · class games 2.5 · skills tabs done 15 (= 35, "Grammar, vocabulary and skills") + other competences 5. Transversal criteria never count.
- **Missing work = 0 only if the tab was done in class (ticked on the Time plan) and its day has passed.**
- **Done late counts the same as on time this term** (14 Nov 2026). Roger wants it **stricter next term**: remind him when term 2 starts (23 Nov 2026).
- Term 1 ended 20 Nov 2026: Roger closes each group with 🔒 Close term.
- Class games: a missed game or one under half right is left out, never 0; a game played again counts only its latest play.
- Self-assessment never counts in the mark.
- Year mark: Term 1 ×1, Term 2 ×2, Term 3 ×3 (section 4).

---

## 9. Answering students

**Problem reports** (routine: [problem-reports-auto.md](general/problem-reports-auto.md); instant task `trig_019JfVaVpNJdhGnFTsMxcWYg`)

- **Technical bug** → fix it, squash-merge without asking, answer the student in Roger's voice, and email Roger with an **⚠️ IMPORTANT** subject (8 Nov 2026).
- **Design, pedagogy, marks, routes, deadlines, unclear, or LS1 content** → change nothing; leave it for Roger with a status (✅ fixed / 👍 not a bug / ✋ needs you), a note and a suggested reply in both languages.
- Roger's own reports: "✅ Merge straight away" for small tweaks; big changes or "⏸ Don't merge yet" → a PR with preview or a plan, and a thread.

**Timing and wording of every automatic answer** (17 Nov 2026)

- Shown to the student only **between 08:00 and 18:00 Madrid time and at least 2 hours** after the report or comment arrived. Never `--now` unless Roger asks.
- **Never use the student's first name or surnames** (no "Hola X").
- **Both languages**, their language first (20 Nov 2026).
- Roger's own sends from the dashboard after 21:00: **always ask him** "send now or hold until 7:30" (14 Nov 2026).

**What a suggested reply says**

- **Every suggested reply or draft to a student** (problem reports, ideas, private-message answers, comments) is built on **what the website really has** (20 Nov 2026): point to the real thing with the names students see (Examen de mostra / Sample exam, 🎯 Practica / Practise, Games, the learning paths, a step's title) and say how to use it. No generic advice, and never promise something new Roger hasn't decided.
- Short, kind, plain, first person as Roger. Never AI, Claude, PRs or code.
- **Every 💬 Answer box opens with Beltran's draft** (Catalan + English, Roger's voice, no names; 20 Nov 2026, PR #777). It is never sent by itself: Roger edits it and presses Send. Routine details: [problem-reports-auto.md › Drafts for ideas and private answers](general/problem-reports-auto.md).

---

## 10. Emails

- **Every email goes from Roger's school account** (`roger.beltran@ietramuntana.cat`), **never his personal Gmail** (19 Nov 2026). The Gmail connector in this project is his *personal* account: don't use it to send to students.
- Report and alert emails **to Roger** also go to the school address.
- The school script relay sends **only to @ietramuntana.cat**, plain text only. For outside addresses (parents) or attachments: give Roger a **prefilled school-Gmail compose link**, or offer a new script version.
- **Emails to students**: draft in **Catalan and English**, show it to Roger, send only after his explicit "send". Students' messages at night (21:00–7:30) are held until 7:30, and Roger is always asked "send now or hold".
- Never show Claude/AI in emails or images (crop the bookmarks bar out of screenshots).
- "My kids" / "my tutees" = the 14 4ESO A students Roger tutors (their sheet is in Drive), never the whole group. Parents' contacts are personal data.

---

## 11. Technical work and deploying

- Repo `rogerbeltranps-lab/English-lab`, published with GitHub Pages; `teacher.html` = the dashboard, `today.html` = the student board. Groups 2ESOA, 2ESOB, 4ESOA, 4ESOB.
- **Start from the closest working page** and reuse its structure, styles and shared helpers (AGENTS).
- **Every decision goes in writing in the same PR**: a standing rule here, the technical detail in the root `AGENTS.md`, an LS-only rule in that LS's `AGENTS.md`, and the playbook when the LS model changes. Update the `docs/README.md` index row when an LS gets new docs.
- PRs: the attribution block, assignee and reviewer `rogerbeltranps-lab`, screenshots for visual changes. Merge only on "merge" (or the problem-report standing approval for technical bugs).
- Checks before a PR: `node --check` on changed JS, `git diff --check`, the repo checks that apply (`tools/vocab-cards/check.mjs`, `tools/answers-stay/…`), a Playwright look at 1366×768 (and 390×844 for student pages). Say honestly when a check was only programmatic.
- Bump `?v=` cache keys when a shared file or media changes; tell Roger (and students) to hard reload.
- `firestore.rules` publish by themselves on merge (GitHub Action). New school script versions: Claude pastes and deploys them in the Claude app's browser after Roger's "apply" (section 1).
- Preview without Firebase: `EL_DEMO_*` demo data and the invented students; never real data in previews.
- Firestore: no new reads without need; the dashboard works from its browser copy and updates per group.
- `teacher.html` belongs to this project; the separate LS (content) project must ask here for dashboard changes.

---

## 12. Where the details live

**Old Drive guides** (Teacher Studio › 01_General). This document replaces them; on 20 Nov 2026 they moved to the `Archive` of their folder (01_How we work › Archive, 08_Reference docs › the Archive made on 31 Oct), except *Prompts* and *Procediment*, which Drive would not let Claude move.

| Guide | Folder | Status (section 13) |
| --- | --- | --- |
| [How we make exams](https://docs.google.com/document/d/1KHpy26wMIgLSKubTfIMT0bcChoHhZTypBWz_sKxKJtM/edit) (28 Oct) | 01_How we work | Partly outdated |
| [How we make rubrics](https://docs.google.com/document/d/1xYYI4Is-F05fKdHjyt61NA0NghCDuCUSKZLxH9HkzXs/edit) (27 Oct) | 01_How we work | Current |
| [Drive rules](https://docs.google.com/document/d/1xFu81XudUjQGyoqniXK1VWB5IK9iNc0oEldWo3XUf-E/edit) (26 Oct) | 01_How we work | Current |
| [Prompts](https://docs.google.com/document/d/1m4Eh5Ef8iy7nYA4tgLt0YaNaiPiMs8dLS9jqKtg1MhA/edit) (22 Oct) | 01_How we work | Outdated (Forms) |
| [Procediment LS per curs](https://drive.google.com/file/d/17rsC8gb-dovMSSiqa2sR4gn80Tia_A5A/view) (21 Oct) | 08_Reference docs | Mostly current |
| [Competences per term](https://docs.google.com/document/d/1SmfCdBzkSr205pN5UlFt3FJL4JtMi3Xm7tYp_9Ob4g8/edit) (31 Oct) | 08_Reference docs | Current |
| [How to make a class game](https://docs.google.com/document/d/1beR5w4Sw3s-uAsBdLt_N2287YBiH69J2jhLZm20KOF8/edit) (16 Nov) | 08_Reference docs | Current (has a duplicate) |
| [How we build a Learning Situation (LS playbook)](https://docs.google.com/document/d/1Vguxd9J0hVEQdA5kjAfLx9W8Hj3JFKs8fo8u1nvUVD4/edit) (30 Oct) | 08_Reference docs | Outdated copy |
| [Research audit](https://docs.google.com/document/d/1wZMzvoGxk4fv8bcCTHuNP5UxKjzxWaXJiDqkLZuur1Y/edit) (27 Oct) | 08_Reference docs | Status column old |

**Repo files**

| Topic | File |
| --- | --- |
| Every technical decision, per feature | [AGENTS.md](../AGENTS.md) |
| Building a new LS, step by step | [docs/general/new-ls-playbook.md](general/new-ls-playbook.md) |
| Class games (Roger's readable guide) | [docs/general/class-games-guide.md](general/class-games-guide.md) |
| Secure recall checkpoints | [docs/general/secure-checkpoints.md](general/secure-checkpoints.md) |
| Problem reports routine | [docs/general/problem-reports-auto.md](general/problem-reports-auto.md) |
| Backups and restore | [docs/general/backups.md](general/backups.md) |
| Old notes (roadmap, task list, research audit brief) | [docs/archive/general/](archive/general/) |
| One LS's rules and decision log | `docs/<course>/ls<n>-<name>/AGENTS.md` |
| One LS's grading, indicators, FP rubric | `docs/<course>/ls<n>-<name>/grading.md`, `indicators.md`, `final-product-assessment.md` |
| Programmes (Catalan) | `docs/2eso/programme.md`, `docs/4eso/programme.md` |
| Teaching materials index | [docs/README.md](README.md) |
| Roger's English corrections | `/mnt/project-files/english-corrections.md` |

---

## 13. To revise: what is outdated and what contradicts

### 13.1 The Drive guides, one by one

| Guide | Still true | Outdated or to confirm |
| --- | --- | --- |
| How we make exams | Reading never gives away the writing; section order by criterion; good-item rules; keys accept every correct answer; short shared listening; grade = points ÷ 10; exams only in Drive. | Google Forms, two forms, four models A–D, three itineraries, 35 items in 50 minutes, writing 20 points, "I don't know" option (now web exams: 6.12, rows 16–20). |
| How we make rubrics | All six principles and the C1–C4 rubric (still used to mark writings). | "A ready-to-paste ChatGPT prompt" (row 25). |
| Drive rules | Everything. | Folder names have changed slightly (01_General, 04_Students (private)). |
| Prompts | Item quality, verify before finishing, explain decisions. | Word + Forms workflow, four models, three itineraries; "explain to me in Catalan" (row 22). |
| Procediment LS per curs | Official text only, columns, codes, objectives formula, grammar/lexicon by course, past mistakes. | Three routes Insecure/Safe/Daring (row 14); FP video format (row 24). |
| Competences per term | Everything, incl. year weights T1×1, T2×2, T3×3. | Check that the year weights are built when Term 2 marks start. |
| How to make a class game | The 16 Nov 21:01 copy. | **Duplicate**: an older copy with the same title (16 Nov 20:39) sits next to it. |
| LS playbook (Drive) | – | A copy from 30 Oct; the repo playbook has changed many times since. Replace with a fresh copy or archive it. |
| Research audit | The content rules (section 5). | Status column of 27 Oct: items 3–9 say "to do"; Roger to confirm which are done. Grammar block split (row 26). |

**Drive tidy-up** (20 Nov 2026, on Roger's word): the guides went to `Archive` (nothing deleted; the older class game copy is named "older duplicate"). Still for Roger:

- Move *Prompts* (01_How we work) and *Procediment_LS_per_curs.md* (08_Reference docs) to `Archive` by hand: Drive refused Claude's move.
- 08_Reference docs has **two folders called Archive** (made 26 Oct and 31 Oct); the guides went to the 31 Oct one.

### 13.2 Contradictions

Until Roger answers, Claude follows the **newer** rule (in bold).

| # | Topic | The older text says | The newer rule says | Where to fix |
| --- | --- | --- | --- | --- |
| 1 | Committing | AGENTS.md › Verification: "Do not commit or push unless explicitly asked." | **Claude opens PRs for every change and merges on "merge"** (how every thread has worked since October). | Reword the AGENTS.md line. |
| 2 | Exam delivery | Exams doc, Prompts, AGENTS.md › Exams, the playbook and 4ESO LS2 `grading.md`: Word papers + a Google Form per model, writing 30 (or 20) points. | **Web exams on the site (1 and 17 Nov 2026), Base/Core papers with versions A/B/C, L20 R20 V35 G15 W10.** | Playbook step 10, both LS2 `grading.md`; Ask Roger if Forms are still wanted for anything. |
| 3 | Exam versions | `el-web-exam.js` header and AGENTS.md: versions A or B. | **A/B/C** (19 Nov 2026). | Comment and AGENTS.md line. |
| 4 | Web exam writing | AGENTS.md: Roger clicks a 5.1 level (NA 8 · AS 15 · AN 23 · AE 30 of 30). | **Claude marks it with C1–C4 (8/4/4/4 of 20)** (17 Nov 2026). Keep the click as a manual backup? | Ask Roger. |
| 5 | Speaking hand-in | AGENTS.md (3 and 7 Nov), Research audit change 2: hand in the transcript (and an improved version). | **Recording only, no transcript** (14 and 16 Nov 2026). | Remove the transcript lines from AGENTS.md. |
| 6 | Writing revisions | Playbook Part 1, Research audit change 2: a first version, then an improved final version with "What I changed". | **Every writing is handed in once and Claude corrects it** (1–2 Nov 2026). | Update the playbook row. |
| 7 | Daily work split | Playbook: practice 7.5. Research audit change 1: checkpoints 50 % · warm-ups 25 % · practice 25 % of the grammar and vocabulary block. | **Checkpoints 10 · warm-ups 2.5 · practice 5 · class games 2.5** (9 Nov 2026). | Playbook LS mark row; Research audit Doc. |
| 8 | Compulsory questions | AGENTS.md (14 Nov): split grammar steps and Prepositions + vocab have 7 compulsory + 7 extra. | **4 compulsory per grammar block** (16 Nov 2026). Does Prepositions + vocab keep 7? | Ask Roger, then fix AGENTS.md. |
| 9 | "Optional" labels | Memory (26 Oct): no "optional" labels on student pages. | **The sample exam shows "🎯 Test yourself (optional)"** (9 Nov 2026), on Roger's request. | Keep the exception. |
| 10 | Continue card | Memory: every LS has a Continue card. | **Simple LS home (20 Nov 2026) hides it on the LS page**; the board keeps ▶ Continue. | Confirm with Roger. |
| 11 | Mixed games | AGENTS.md (6 Nov): "never a mixed game again". | **Decks stay a pair, but the board can play both together** (19 Nov 2026). | Both true; wording clear here. |
| 12 | FP videos with Gemini | Memory (19 Nov): finish LS2 with the paid Gemini API. | **Roger's own Gemini app now** (20 Nov 2026). | Done (memory updated). |
| 13 | Students' week | Playbook: students have a "My week" button. | **No week plan for students** (6 Nov 2026): ✅ To do and 🏠 Homework only. | Playbook Calendar row. |
| 14 | Routes | Exams doc, Prompts, Procediment, AGENTS.md, playbook: three itineraries Insecure / Safe / Daring. | **Starter, Base, Core, Plus (+ Pro in 4 ESO); exams in two papers, Base and Core.** | Wording; the level table in section 4 maps them. |
| 15 | Level conversion | Memory (1 Nov): convert marks by level ("an 8 from a Base will be a 6"). | **Nothing decided or built.** | Ask Roger before the next exams. |
| 16 | Exam writing points | Exams doc: writing 20 of 100. | **LS2 web exam: writing 10 of 100** (rubric still out of 20, halved). | Ask Roger which he wants from LS3. |
| 17 | Reading during the writing | Exams doc: two forms so students can't go back to the reading while writing. | **Web exam: free movement between sections and a review page** (Nov 2026). The reading rule (6.4) is the only protection. | Ask Roger: lock the reading once the writing starts? |
| 18 | Who records the listening | Exams doc: Roger records it himself (Claude gives the script). Playbook: ElevenLabs audio. | **LS2 reused the audio of a learning-path video.** | Ask Roger which way from LS3. |
| 19 | Length and models | Exams doc: four models A–D, 35 items, 50 minutes. | **Two papers × versions A/B/C**; number of items and time not fixed. | Ask Roger: keep 35 items / 50 minutes? |
| 20 | "I don't know" option | Exams doc, Prompts: on every multiple-choice item (0 points). | **Web exam has none.** | Ask Roger if he wants it. |
| 21 | Spelling slips in keys | Exams doc: keys accept "small spelling variants". | **18 Nov 2026: Roger did not accept "donw" for "down"** in a late LS1 exam. | Ask Roger: typos right or wrong? |
| 22 | Language to Roger | Prompts: explain to Roger in Catalan. | **Always English** (Memory, standing rule). | Prompts is only for Forms scripts; confirm. |
| 23 | Exam location | Exams doc: exams live only in Teacher Studio › Exam. | **Web exam source and keys are in project files** (`web-exam-<course>-<ls>/`), plus Drive. | Confirm both are fine. |
| 24 | FP format | Procediment: a video with Google Slides, face in picture-in-picture. | **A spoken video uploaded on the site** (no format rule since). | Confirm the Slides + face rule. |
| 25 | Rubric marking prompt | Rubrics doc: every rubric has a ready-to-paste ChatGPT prompt. | **Claude marks writings; Roger marks FPs in his Gemini app with the agreed prompt** (20 Nov 2026). | Keep "a ready-to-paste prompt" without naming ChatGPT? |
| 26 | Research audit status | Research audit Doc: changes 3–9 "to do". | Several are built (core words, micro-dictation chunks, Catalan-to-English flashcards, the voyage road). | Roger to confirm which are still wanted. |
| 27 | Class game theory | Class games guide (5 Nov): theory and explanation slides between the questions. | **Questions only, no theory slides** (16 Nov 2026). | Done: the guide now points here. |
| 28 | Storing recordings | Roadmap (Oct 2026): never store audio recordings (the most sensitive data). | **Speaking recordings and FP videos are stored** in Drive › 04_Students (private) (Nov 2026). | Confirm, and check it is in the data-protection approval. |
| 29 | Final product groups | Playbook: groups from the same route. | **Research audit (26 Oct 2026): mixed routes**, at least one Core or Plus student per group. | Ask Roger which from LS3. |
| 30 | Sample exam timing | Playbook: taken the session before the exam. | **Research audit: open a week before the exam** (and it is always open, 9 Nov 2026). | Wording only. |
| 31 | Flashcards typing | Playbook Part 1 (26 Oct): the student types or says the English before turning the card. | **No typing on the cards** (20 Nov 2026). | Done: playbook points here. |
