# How we work - Work requirements

**Every rule Claude follows when it works for Roger on English Lab, in one organised document.** First version 20 Nov 2026, **for Roger to revise**; contradictions settled 21 Nov 2026 ([section 13](#13-what-changed-and-what-is-still-open)).

It unifies:

- the Drive guides in Teacher Studio › 01_General › **01_How we work** (*How we make exams*, *How we make rubrics*, *Drive rules*, *Prompts*) and **08_Reference docs** (*Procediment LS per curs*, *Competences per term*, *How to make a class game*, *LS playbook*, *Research audit*);
- the project instructions and the project memory's standing rules;
- the root [AGENTS.md](../AGENTS.md), the LS `AGENTS.md` files and the notes in [docs/general/](general/) (21 Nov 2026: every rule moved here; the notes keep only how each feature works).

Duplicates are merged into one line. Each rule says where it comes from and when Roger set it. **Where two rules disagree, Roger's newest decision is the valid one** (Roger, 21 Nov 2026: "when it comes to contradictions, my last decisions are the ones that are valid"). The rules below are written that way; [section 13](#13-what-changed-and-what-is-still-open) logs each clash and the few questions Roger has not decided yet.

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
- **When two rules clash, the newest decision wins** (Roger, 21 Nov 2026). Claude follows it without asking, and in the same PR fixes the older line (here, in `AGENTS.md`, a note or a Drive guide) or marks it as replaced. Ask Roger only when nothing newer was decided.
- A rule for one LS only goes in that LS's `AGENTS.md`, not here.
- **The website and this file move together** (Roger, 20 Nov 2026: "I've been making changes (and I will continue) and I will change rules"): every PR that changes what students or Roger see, or how something is marked, checks this file and updates the line it changes, in the same PR. When Roger changes a rule in a thread, the old line is replaced, never kept next to the new one.

**Key words.** LS = Learning Situation · LP = learning path · SLP = a section (tab) of a learning path · FP = final product · CE2 to CE5 = listening, speaking, reading, writing · CE1, CE6 to CE10 = the integrated competences · route = the student's level (Starter, Base, Core, Plus, Pro; called itinerary in the older guides).

**Source tags.** *Exams doc*, *Rubrics doc*, *Drive rules*, *Prompts*, *Procediment*, *Competences*, *Research audit* = the Drive guides above · *AGENTS* = root AGENTS.md · *Playbook* = docs/general/new-ls-playbook.md · *Memory* = project memory · *Instructions* = project instructions.

---

## 1. Working with Roger

**Talking to Roger**

- Write to Roger **in English**, even when he writes in Catalan or Spanish (Memory).
- End **every** reply with a short **"Pattern to watch"** (Instructions, 17 Nov 2026): at most 3 items, "what he wrote" → **natural version** + one-line rule. Correct only grammar, prepositions (his weakest point) and idiom (Catalan/Spanish calques). **Never** correct typos, spelling, capitals, punctuation, accents, apostrophes or contractions (Im, dont, u) or to/too slips: he types fast on his phone (19 Nov 2026). No real mistakes → say so in one line.
- **Roger aims for American English** (Roger, 25 Nov 2026: "I try to use the American grammar, remember this"): corrections, natural versions and every model in Towards Nativeness are American (toward, color, organize, on the weekend, gotten); never suggest a British-only form.
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
- **His to-dos go in Google Tasks** (Roger, 25 Nov 2026: "I need you to run my task app, there I want you to add things to do, for instance the ones who need to do the exam and when"; he chose his **school account**): Claude adds them to the list **English Lab** of roger.beltran@ietramuntana.cat through the school script, with the day as the due date and the steps in the notes, and marks them done when the work is done (never deletes one). Show Roger a new batch before adding it, as for any live write.
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

- **Only Starter (and no route) gets Catalan**: instructions, hints, help and feedback in **Catalan**. **Base**, Core, Plus, Pro: **English** (Roger, 21 Nov 2026: "From now on base is also in English, no Catalan help here, the help in English"). Base keeps its extra support (questions shown, slower voice, help words, choosing from options), only now in English; each question's hint has an English version for Base (`he`, Roger 21 Nov 2026: "Yes add the extra help in English"). LS1 (finished) keeps its Base pages in Catalan. English stays the target language for all input and production.
- Answers and messages to students go in **both languages**, their language first (20 Nov 2026).

**What students must not see**

- **Never show locked or future work** (7 Nov 2026): no 🔒, "not open", "checkpoint first", or totals that include closed steps. Only learning paths and sections Roger has opened.
- **No class work shown in advance** (20 Nov 2026): a tab planned for a later class is hidden, like a locked tab, until its class opens it (5 minutes before class, or class mode); never shown in blue. Its steps still count in the path's progress. **🎯 Practise follows the same rule** (Roger, 22 Nov 2026): it holds only the tabs the learning path page shows, never a locked tab or one planned for a later class.
- **Students are never told which activities are assessed**: no "this counts", "first try" or "checkpoint" labels (26 Oct 2026). Only the general note that all work is part of continuous assessment (40 % of the LS mark from LS2).
- **No gaps in learning path numbers** (Roger, 21 Nov 2026: "students mustnt see any gap"): when a learning path is dropped, the paths students will do are renumbered in order (LP1, LP2, LP3, LP4…) and the dropped one moves to the end, hidden.
- Students never see **send times** of messages (14 Nov 2026), never classmates' marks, never which learning path a Practise item comes from (they choose the LS: 🎯 Practise per LS below).
- "Not late yet" counts are never shown to students (19 Nov 2026).
- The public home page shows no screenshots or pictures of the app and never mentions the full screen mode (7 Nov 2026).
- **Students never see Towards Nativeness** (20 Nov 2026). It is Roger's own C1 to C2 course (a personal LS in 4 ESO). It never appears anywhere for students: menu, My marks tabs, board, progress, notebook, LS lists. The teacher's 👁 student view must show exactly what students see, so it is hidden there too. Only the dashboard, Roger's own view and the tester see it. Checked on every PR by `tools/students-never-see/check.mjs` (PR #784).
- **In Towards Nativeness, 🔍 Spot the mistake is written, not chosen** (Roger, 21 Nov 2026: "I want to write the correct sentence, not choose"): every Spot the mistake step (the four learning paths and each 🔍 Spot it list in My latest mistakes) shows his own sentence and he types the whole sentence correctly, or only the corrected part (Roger, 21 Nov 2026: "on my cellphone" should be right). Capitals, punctuation, contractions, missing apostrophes (dont) and one typing slip in a longer word never count; his original sentence typed again never passes. A first try marked wrong by an older check gets its credit once the check accepts it (22 Nov 2026). Once it is right (or after two wrong tries) the natural version and the rule show. Every new corrections list is added to My latest mistakes, up to the latest messages.
- **In Towards Nativeness the answer box always shows the whole sentence** (Roger, 22 Nov 2026, iPhone: "I can't see my sentence"): a typed answer wraps onto a new line as it grows, and on a phone ✓ Check sits under the box; Enter still checks. *Cellphone*, *cell phone*, *mobile phone* and *my mobile* count as *phone* (Roger, 21 Nov 2026: "on my cellphone" should be right), and *on the phone* is as right as *on my phone* in "Encara no ho he provat al mòbil" (Roger, 22 Nov 2026: "And again this is correct"); everything else in the answer still counts.
- **Towards Nativeness turns dark at night** (Roger, 21 Nov 2026: "Can towards nativeness have dark mode at night?"): from 21:00 to 7:00, and whenever his phone or computer is in dark mode, every Towards Nativeness page shows light text on a dark background, with the same contrast as by day (pictures and videos keep their colours). The 🌙 / ☀️ button in the top bar switches it by hand; a second tap goes back to automatic. Student pages stay as they are.
- **🧠 Preposition flashcards, only in Towards Nativeness** (Roger, 25 Nov 2026: "add them, and create a flashcard deck of prepositions with my slips"; then "It should only be in Toward Nativeness, not for the students"): every preposition slip in Towards Nativeness › 📍 in / on / at is also a flashcard in the next step of My latest mistakes, **🧠 Preposition flashcards**: the sentence with a gap → the sentence with the right preposition and the rule, spaced repetition and 📊 statistics like 🧠 Flashcards, read by the Kokoro Heart voice. It is not in the 🧠 Flashcards page (the students' page), not a step to finish, and its ⚡ streak is apart from the 🧠 Flashcards one. New slips join it by themselves. Its cards and progress are the same as the 📍 My prepositions deck of 🧠 My flashcards.
- **🧠 My flashcards, Roger's own** (Roger, 25 Nov 2026: "I want to have Toward American Nativeness Flashcards too"): a **🧠 My flashcards** tile on the Towards Nativeness home opens his own flashcards page, like the students' 🧠 Flashcards (spaced repetition, Again · Hard · Good · Easy, 📊 statistics, ⚡ streak), with six decks from the whole course: **✍ My slips** (every corrections list: his sentence → the natural one and why, plus Make it idiomatic, Spoken English and Catalan → English), **📍 My prepositions**, and **LP1 to LP4** (each path's vocabulary, Catalan ⇄ English, its Spot the mistake, Catalan → English, grammar and Make it idiomatic). New lists and steps add their cards by themselves. The cards are read by **Chris (ElevenLabs)**, his Towards Nativeness voice, where recorded (Roger, 25 Nov 2026: "use eleven labs for the flashcards too"; paid, so each recording run needs his OK), and by Kokoro Heart until then. **They count in his ⚡** (Roger, 26 Nov 2026: "as a teacher, yesterday I did my flashcards (Towards Nativeness) but I see 0"): a day he studies 🧠 My flashcards or 🧠 Preposition flashcards keeps the ⚡ streak of his mascot in the bottom bar going, like a day of 🧠 Flashcards. Never on a student page.
- **Towards Nativeness is in American English** (Roger, 25 Nov 2026): its models and natural versions are American, and a typed answer in British spelling (colour, organise, centre, programme, towards, burnt, travelled, grey, at the weekend) counts as the same answer.

**Look and devices**

- **Quality over quantity** (19 Nov 2026): too many activities. Students see only the SLPs Roger adds; the final product is always last. Keep screens short: little on the menu, details inside each place.
- **On a phone, the 🔍 Dictionary stays still** (Roger, 21 Nov 2026: "the dictionary moves all around the page and sometimes I don't even see what I'm typing"): its window sits at the top of what is visible, the box you type in always shows above the keyboard, and the bars at the bottom hide while you type. Computers unchanged.
- **The 🔍 Dictionary always answers** (Roger, 22 Nov 2026: "Calque should be in the dictionary"): when one free source fails, another answers (Google, then MyMemory for translations; dictionaryapi.dev, then Wiktionary for English meanings). A word no source knows says **Not found. Check the spelling.**; "I can't reach the online dictionary" shows only when no source answers at all. Students and Towards Nativeness alike.
- **📓 The reading texts are in My notebook** (Roger, 25 Nov 2026: "Add the reading texts in students notebooks"): every Reading step of a learning path done in class (or answered) shows its text in the notebook, in that step's 📖 part, at the student's level (the same text the step shows them), glued in as a printed page before their answers, so they can read it again for the Reading log or the exams. 2 ESO, 4 ESO and Towards Nativeness; not LS1, the sample exams, the recall checkpoints or the 📖 book. **A heading never stays alone at the bottom of a page and nothing is squeezed small** (Roger, 25 Nov 2026: "the headings musn't be in different pages"): ✍ My notes from class goes to the next page with the notes, and a long or pasted note goes on to the next page line by line (or at a sentence end), keeping its lines.
- **Aa Easy reading on every reading text** (Roger, 25 Nov 2026: "could we have a dislexic option reding where … some important letters are in a different color?"; then "okay do it"): a button beside 🔊 Listen to the text on every reading of the learning paths (2 ESO, 4 ESO, Towards Nativeness, every route), the sample exams, the recall checkpoints and **the exam's reading** too (Roger agreed: spacing and size give no answer away). Turning it on makes the text bigger, with more space between letters and words, in a plain font instead of the notebook look's handwriting one (what the research supports); its panel adds a cream page, a reading ruler and **b d p q in four colours** (Roger's idea; no study behind it, so an optional extra, off by default). Every student can use it, nobody else sees it, and the choice stays on that device (no Firestore reads). Dyslexia fonts, coloured overlays and "bionic" bold reading are left out: studies found no benefit. LS1 pages and the 📖 book (page pictures) are unchanged.
- **📓 Notebook or normal page, the student chooses** (Roger, 25 Nov 2026: "I want student to be able to change from notebook-like or computer like again when doing the activities"; it replaces the 19 Nov rule "students only see the notebook style in the activities"): every learning path step of 2 ESO and 4 ESO (from LS2) opens in the notebook look, and the button at the top right of each step, **🖥 Normal page** / **📓 Notebook**, switches it. The choice stays on that device and is kept when they press ↺ Practise again or come back from a game.
- **🖍 Underline on every reading text** (Roger, 25 Nov 2026: "I want students to be able to underline readings when doing activities"): a button beside Aa Easy reading, wherever that button is (learning paths of 2 ESO, 4 ESO and Towards Nativeness, every route, sample exams, recall checkpoints and the exam's reading, as on paper). It turns the text into a page to mark: drag across the words or tap one word, with a **red underline** or a **yellow, green or pink highlighter**; **🧽 Rubber** (or tapping a marked word again with the same pen) takes a mark away, **🗑 Clear all** asks for a second tap, **✓ Done** goes back to normal. On a phone the pens float at the bottom of the screen and an up-or-down swipe still scrolls. Page text still can't be selected, copied or translated. The marks are saved with the student's LS work (no new Firestore reads), so they come back on another device and in the 👁 student view; the exam's marks stay on that Chromebook only. LS1 pages are unchanged.
- Students use **Chromebooks (~1366×768)**: design for that first, then check 390×844 (phone). Phone rules live only in `el-phone.css` inside `@media (max-width:640px)`; computers must stay pixel-identical.
- Course palettes: **2 ESO green, 4 ESO blue**. Competence colours: CE1 teal, CE2 blue, CE3 orange, CE4 green, CE5 purple, CE6 amber, CD indigo, CC pink.
- **Every text is easy to read on its background** (Roger, 21 Nov 2026: "I can't read all the letters well here", on the green ✅ Finish all your activities! title over a purple header): white text on dark or coloured headers and buttons, dark text on light cards, never coloured text on a coloured band. A pop-up or bar drawn over a page sets the colour of each of its texts itself, so a page's own heading colours never leak into it.
- **One colour rule for every percentage** (20 Nov 2026): under 50 red · 50–59 orange · 60–79 green · 80–89 blue · 90+ purple (`elPctCol`).
- Marks: the degree (Assoliment notable…) in a coloured box first, the number small beside it (10 Nov 2026).
- Student pages: no translating, no copying of page text, no spell-check in answer boxes (9 and 13 Nov 2026).
- Everything students can download or print carries "© (year) Roger Beltran · English Lab · All rights reserved".
- Students' answers always come back (on reload, another device, after a level change) unless they redo that activity (6 Nov 2026). **The latest version shows** (Roger, 22 Nov 2026: "Es millor que els alumnes i jo tinguin les últimes versions a la llibreta i a la pàgina, així si ja ho han arreglat ho veuen bé"): a step opened again shows each question's newest answer (corrected on the page or with ✏️ Correct it), checked with today's check, on the page, in the notebook look and in 📓 My notebook, **and on the notebook cover** (its rings, tiles and activities done well), straight away, without opening the step again (Roger, 22 Nov 2026: "students must be their last version even on the cover. This makes them work better"; "So if you have their last versions I want them see them already"). **Students never see their first try** anywhere ("No need to say your first"). Students and Towards Nativeness alike. **Questions added to a step after it was done look new, not lost** (problem report, 4ESOB, 24 Nov 2026; Roger: "he should see his latest answers"): the answers the student gave are where their questions still are, the new questions are empty with no red "Type an answer.", the step says "✨ I've added new questions… this step stays done ✓. You can do the new ones to practise.", and the new ones can be answered and checked in both looks.
- Never draw a guessed page that changes after sign-in (7 Nov 2026).
- **LS1 stays as it is** unless Roger asks: its content and pages are finished.

**The student's pages** (site as of 20 Nov 2026)

- **Home = the voyage road** of the LS: same layout every LS, a new setting per LS (4 ESO a sea voyage, 2 ESO LS2 a reporters' bus tour; art from ChatGPT/Gemini prompts Roger runs). The stops are only the Time plan's tabs; every student's vehicle is shown, **beside the last stop its student did**, the student's own with a **You** label, each classmate's with their first name under it and nothing more when the pointer is over it (Roger, 25 Nov 2026: "the names twice when hovering over the boats don't make sense"), and the button that takes them back to it says **🚐 You** (Roger, 25 Nov 2026: "the van or boat must have a 'you'"), never at the next one still to do (Roger, 23 Nov 2026: "boats should always be by the last activity they did"); nothing covers a stop, a label or a vehicle, and **no vehicle sits on a place's picture** (Roger, 21 Nov 2026: "I said no vehicles on the pictures"; where there is no room beside it, the picture is drawn smaller). Nothing covers a decoration either (the microphone, the camera, the sea animals…): a decoration moves up or down to a free place, or is left out (Roger, 21 Nov 2026: "theres a microfone covered"). Only one song plays at a time, and it changes with the group's map. **The maps play only the music**: no sea, crowd or other background noise under it, on any map (students' boards, the teacher's maps, class mode) (Roger, 22 Nov 2026: "there's like a sea-ish sound that is a noise. Leave only the music"). Music is on by default, starts again by itself when you come back to the tab or the map (21 Nov 2026), and is **off during the group's class time** (the 🎵 button can't turn it on then). The 2 ESO road has no Barcelona landmarks (20 Nov 2026).
- **📝 Every group sees its next exam at the top** (Roger, 25 Nov 2026: "All the groups should be able to see when their next exam is, and make an option for the teacher to set exams so that they appear at the top"; "And at the top of the students board"; "the exam was done already it shouldnt be there"): under the greeting of My dashboard, a red band **📝 Next exam: Wed 9 Dec · in 14 days · its title · its note** (e.g. Term exam: LS1 + LS2 · Study with 🧠 Flashcards; Catalan for Starter), solid red in the last 3 days; the exam also shows in the 📅 Agenda with 📅 Add to your calendar. It is the earliest exam from today on, of any LS: the LS's own exam of the Time plan or one Roger sets in **📝 Exam dates** (below). **A past exam never shows**, here or on the dashboard. No new Firestore reads.
- **🌱 A new flower rings** (Roger, 22 Nov 2026: "When I open the garden again and there's a new flower I should hear a nice sound"): in every garden (the students' board, Towards Nativeness and its ✦ dashboard page), a flower that bloomed since the last visit grows in with "+N new flowers" and a short, soft chime, once. It follows the sound setting; where the phone hasn't allowed sound yet, it rings at the first tap.
- **🧭 Your steps on the LS page too** (Roger, 25 Nov 2026: "here I want this too", on the empty space under 🔤 Grammar and vocabulary): every LS page from LS2 (2 ESO and 4 ESO) shows the board's 🧭 Your steps under Grammar and vocabulary: each place with its steps, ✓ when done, ▶ on the next one, 🏆 the final product last, each step a link, "n of N done" and the bar. Only the student's own steps (and in Roger's 👁 student view); no Firestore reads (the board's copy on that device, so it shows once the student has opened the board).
- **✅ Finish all your activities** (Roger, 21 Nov 2026: "after the games, I want to remind them that they need to do all the activities. I also want them to see what activities they need to do"; then "we are repeating the info", and he chose the website, not class). **In class**, after the warm-up games the projector goes straight to the race map (⛵ Who's winning the race?) with "✅ Finish all your activities! Every one moves you forward in the race." and the **% of students who did each step**; numbers only, never a name. Courses without a race map keep the old last slide (bars of each learning path and the % per step). **On the website**, once a day and never in class time, each student gets their own card when they open their board: their bars per learning path, "Per guanyar la cursa, acaba-les totes" and the tabs they still have to do, **each one a link** to the activity (Catalan for Starter). **The card says their place in the race** (Roger, 25 Nov 2026: "tell them their position"): "🏁 You're 8th out of 21 in your class." from the same steps done as the race map (students on the same number of steps share a place), with 🥇 "you're in the lead!" for 1st, 🥈🥉 "you're on the podium!" for 2nd and 3rd, "right now, but you can still catch up!" for the last quarter, and how many activities take them up a place ("Finish 2 more activities and you'll move up to 5th place."). Only their own place, never a classmate's name. Only what the group did in class before today or has as homework. If the card can't be drawn, the old race card shows instead (one OK button that lights up 🧭 Your steps with only the pending ones and "Show all my steps" to go back).
- **✅ To do looks like that card** (Roger, 21 Nov 2026: "potser s'entén més que l'actual Per fer", "when they press the To do button"): the floating ✅ To do button opens the same card (bars + "Et falta" / "Still to do" links), and the board's ✅ To do page shows each learning path as a coloured bar with its %, then "Et falta:" and only the missing tabs as links (📝 = homework, ⏰ = late). Tabs already done are not listed.
- **⚠️ Report a problem on every page**, including game boards, videos, flashcards, rubrics, grammar presentations and print pages (19 Nov 2026).
- **The student's name and the bottom-right bar** (Roger, 25 Nov 2026: "their name can go just below my name"; "students see the icons at the bottom right and when they hover them over they see the names"): the student's name sits under **English with Roger** in the side menu (in the bar only where the page has no side menu, e.g. on a phone), and the bar at the bottom right shows only icons (🧑‍🎨 the mascot with its ⚡ streak · 📓 My notebook (Roger, 26 Nov 2026: "this I want it here"; it was a round button floating bottom left) · ⚠️ Report a problem · 💡 Suggest an idea · 📬 Notifications · 🚪 Sign out; in Roger's 👁 student view the same with the student's own 📬, then Roger's 🔔 problem reports and ✕ Exit), each showing its name on hover. Roger's own bar keeps its words (Dashboard · ⚠️ Problem · 🔔 · Sign out), and **his name sits under Teacher dashboard** at the top of his side menu, not in the bar (Roger, 25 Nov 2026: "this name should appear below teachers dashboar"; in the bar only where the page has no side menu, e.g. on a phone), with **his own mascot and ⚡ streak** at its left (Roger, 25 Nov 2026: "the mascot shoulb always visble here"); **on a phone, his mascot and ⚡ sit at the top right of every dashboard page** instead, as on the students' board, and **stay there while the page scrolls** (Roger, 25 Nov 2026: "On my cellphone I want this to be at the top right!"; "I want it to stay always there").
- **📬 Students' own notifications** (Roger, 25 Nov 2026: "will students see notifications, like you have the exam corrected…"): the 📬 in the student's bar (a mailbox, never Roger's 🔔, so the two never look alike in the 👁 student view: Roger, 25 Nov 2026: "it shoulndt be the same bell Icon") lists the latest news from Roger, newest first, each one a link: ✏️ work corrected, 💬 an answer to a hand-in or a comment, ↺ a step sent back to redo, 📝 exam results that are out (LS1 and every web exam once **📣 Published**), the answer to a ⚠️ problem report or a 💡 idea, and 📣 announcements and ✉️ messages. A red number counts what is new (not seen on its card or page yet); opening the list takes it away. **Exam results stay new until the student has seen them, however old** (Roger, 25 Nov 2026: "here there should be a notification, like 1 in red"); everything else stops counting as new after 21 days. **Nothing held ever shows early**: exam results before 📣 Publish, corrections and answers before 17:00, problem answers before 📨 Send it, late announcements before 7:30. Dates only, never send times. No Firestore reads of its own. Not on exams, recall checkpoints or the sample exam. The usual cards still pop up as before; the 📬 keeps them afterwards. The "📝 Your exam results are ready" card now also comes for LS2 and later exams once Roger publishes them.
- **🧑‍🎨 The mascot in the bar** (Roger, 25 Nov 2026: "can they have the mascot here too? with the numbers"): on every student page, the board too (Roger, 25 Nov 2026: "the mascot should be everywhere"; on the board it also sits beside 🎯 My level), Roger's avatar in the mood of the student's streak, with the ⚡ number, at the left of the bottom-right bar; a tap opens 🧠 Flashcards. Never in exams, recall checkpoints or the sample exam. **The ⚡ counts every card studied, on any device and in any tab** (Roger, 25 Nov 2026: "som students say that they practiced but it dosent show up the number 1": a Flashcards tab left open on an old copy wiped the cards studied in another tab when it was closed or hidden): a tab saves only what was studied in it, merged with the latest copy, and the bar takes in the account's copy (cards studied on the phone) at most once every 30 minutes, one read. The 👁 student view reads the student's flashcards once a tab.
- **The LS mark in points, part by part, until every part has a mark** (Roger, 21 Nov 2026: "Potser podriem posar la nota de la LS en 3 parts: 2,5/4; 0/3,5 (per fer) 0/2,5 (per fer)… perque ara com ho veuen es pensen que van millor del que van"): while the exam or the final product has no mark, no single LS mark is shown. Each part shows the points it gives of the LS's 10: 📚 Everyday work **3.4 / 4** · 📝 Exam **0 / 3.5 to do** (🔒 soon while results are held) · 🎬 Final product **0 / 2.5 to do**, plus "2.9 / 4 points so far" (the points of the parts marked so far) and "points to do". Same on the students' My marks, the LS's 📚 Everyday work page and 🎓 My progress, and on the teacher's ⛵ Class voyage and 🌱 Progress. Once every part has a mark, the LS mark shows as before (degree + number).
- **📊 My LS mark so far on My dashboard** (Roger, 21 Nov 2026: "I want this here, and below each bar what it is: Everyday work, Final Product, Exam"): a small card at the top of the board, under 🎯 My level and beside the ⏰ late · ✅ To do · 📝 Homework · 📓 links, with the same points as My marks ("2.9 / 4 points", then the LS mark once every part has a mark) and the parts bar; a click opens 📊 My marks. The bar on both places has each part's name under its piece: **Everyday work · Final product · Exam** (Catalan for Starter).
- **📊 My marks on one screen** (19–20 Nov 2026): the LS mark so far with its parts (📚 Everyday work, 🎬 Final product, 📝 Exam, 🎯 My checkpoints), ⏰ late activities (at most 5, the rest in ✅ To do; **every late tab is a link to that tab, and Do it opens the first tab still to do, never the path's first tab**: Roger, 22 Nov 2026, after a student's Do it opened a Recall tab already done ✓ and the late work looked done), and **Activities: how you are doing in each skill** (activities and exam per skill; Roger, 26 Nov 2026: "Heading Activities-> how you are doing"; the exam only once results are released). **Speaking = the final product's oral rows** (criteria 3.x) from LS2 on; in LS1 the whole final product. **A part of My marks says its own name in the page heading** (📝 My exam, 🎬 My final product, 📚 Everyday work, 🎯 My checkpoints; Roger, 26 Nov 2026: "When I open My Exam, final product… On top I need to see My Exam, final product… not my marks"). **🏆 The points and term bonus line sits at the top of 🎓 My progress**, under the term report card, not in My marks (Roger, 26 Nov 2026: "This should go on top of My progress, not in my marks").
- **📄 Term report** (Roger, 23 Nov 2026: "create a personal report of the 1st term. It must include criteria, grammar and vocabulary, a progress of their results over time and their daily work (if they did the activities at the end of the term or just before the exam, they need to know)"; "these are the reports I need!"): one page per student (`today.html#report`), in their language (Catalan for Starter or no level). It holds, in this order: **🎓 Your marks** first, right under the Draft line (Roger, 25 Nov 2026: "this should be at the top under draft"): the term mark and each LS's mark; then **What we worked on this term** in Roger's own words (his "Aquest primer trimestre hem treballat" text; the English is a translation), each point with the student's % and one precise line (Roger: "Can we give feedback on this precisely?"); the criteria; what they know well and what to work on in grammar and vocabulary; 📈 How my skills grow; their daily work week by week with how much was done in the week of the class and how much at the last minute; the notice that **from term 2, when they do their activities counts too**; and a descriptive comment as Roger (never a name). **Level names in English carry the Catalan in brackets**: Not satisfactory (No assoliment) · Satisfactory (Assoliment satisfactori) · Very good (Assoliment notable) · Excellent (Assoliment excel·lent) (Roger: "students must see the translation though"). **Students never see it on their own** (Roger: "make sure they dont see them… I will show them the draft in class, I will need a button saying show draft… not before"): only while Roger's class tab has **📄 Show draft reports** on, each student in class mode sees their own, **or once Roger presses 📣 Publish the draft** on a group's 📄 Term reports page (Roger, 24 Nov 2026: "students see them tomorrow as a draft and then we'll prepare the new version. Can you make a publish draft button?"): then every student of that group can open their own at any time from **📄 My Term 1 report (draft)** on their board and at the top of 🎓 My progress, until **🔒 Hide the drafts again**; Roger sees them all on the dashboard (Roger, 24 Nov 2026: "as a teacher I must see the reports… on my dashboard"): each group's **📄 Term reports** tile lists every student with how they worked (🟢 steady · 🟡 behind · 🟠 last minute · 🔴 nothing done), activities done, % in the week of the class, % at the last minute, the comment and **📄 Open** for the whole report; 👁 Student view › 📄 Term report opens it too. **The report shows each LS's exam marks even while the exam results are held** (Roger, 25 Nov 2026: "the reports must have them anyway, and I decide when to publish everthing!"): only inside the report; everywhere else the exam stays 🔒 until 📣 Publish the results. **A final product that counts in the next term is left out** (Roger, 25 Nov 2026: "the final product of the LS2 shouldn't be included in the report"): no 🎬 part, criterion or evidence from it. **Under every criterion, *Why this level*** (Roger, 25 Nov 2026: "here there should be a and explanation of the assessment indicator"): each piece of work its mark comes from, with its own mark and level, **one short line each across the card's whole width** (LS1 📝 Exam · Reading · 8 · Very good (Notable); Roger, 25 Nov 2026: "can you make this shorter or more compacted?"), and for a final product marked with a rubric (LS1) the student's level in that criterion's row with the row's descriptor, word for word. **Every criterion shows its assessment indicator, LS1 too** (Roger, 25 Nov 2026: "assessment indicator missing in some criteria"; he approved Claude's draft): LS1's indicators (2.1, 4.1, 3.1, 3.2, 3.3, 5.1, 5.2, 9.2, from its final product rubric and exam) are the draft doc *LS1 My Real Routine: assessment indicators*, with the Catalan for Starter. **A mistake quoted under a point belongs to that point** (Roger, 25 Nov 2026, on a linkers point quoting a verb -s mistake: "did we really do this?"): a writing mistake only illustrates its own rubric row (organisation = linkers, punctuation, capitals; vocabulary; task; grammar). The drafts are written by `tools/term-report/draft.mjs` and saved only on Roger's "apply"; they are refreshed after the activities deadline (Fri 27 Nov 2026).
- **🎓 My progress** is in the students' menu with 📊 My marks under it (the menu below), and **the term reports are at its top**, right under the title: a card **📄 My Term 1 report (draft)** that opens the report, whenever the student can see it (Roger, 25 Nov 2026: "the reports will apear here on top"). Right under the 🎓 term card (its LS table and term mark) comes **🧩 My competences** for the term chosen (Roger, 26 Nov 2026: "My competences, should go under Term1"), then **📚 Grammar and vocabulary** ("And grammar and vocabulary under my competences"; its **📖 Study** opens that topic's class explanation, point by point with the student's %, in a window on the same page, never the notebook: Roger, 26 Nov 2026, "this takes you to the notebook and it doesn't make sense"), then 📈 How my skills grow and 🕸 My skills radar, the student's own work only, the exam only once released (20 Nov 2026). **📈 How my skills grow shows the whole term** (Roger, 25 Nov 2026: "the students have done all kind of activities during the term, so they should see a term progress"): every dated piece of work counts in its week: the auto-checked steps (first try and latest check), **the class games** (🔤 Vocabulary and 🧩 Grammar, on the day they were played) and each corrected writing and recording with its level (5.1 / 3.2), **in the week it was handed in**, not the day it was marked. LS1's pages kept no dates, so **LS1 shows through its exam ★ (one point per skill) and final product ■ (🗣 Speaking)** on LS1's last day (the Friday before LS2 started). Same on the 📄 Term report and the teacher's 🌱 Progress.
- **🎯 Practise per LS** (Roger, 25 Nov 2026: "I want practice per LSs, so you can choose on LS (grammar, vocab, listening, reading, writing, speaking) or both"): Practise opens on the student's newest LS, with **the LS chosen on top** as tabs (Roger, 26 Nov 2026: "On top you choose the LS"): one tab per LS the student has, newest first, in the course's colour, and **🔀 All mixed**; changing LS keeps the skill when the new LS has it. On a phone the tabs are one row that scrolls sideways. An LS (or all of them) then shows six skills: **🃏 Vocabulary** (the word cards and the quick test) · **📘 Grammar** (each topic, and 🎲 Mixed questions: 10 from every topic on screen) · **🎧 Listening** · **📖 Reading** (the paths' reading texts with their questions) · **✍️ Writing** (🧩 Sentence builder and the paths' writing tasks: task, frame, checklist and model; the text stays on the device) · **🗣 Speaking** (the shadowing clips; the paths' Speaking and Talk tasks: model, 🔊 model read aloud, the Talk's own partner questions in order, ● Record yourself to listen back; and **🎲 Random questions** (Roger, 25 Nov 2026: "yes add both things"): four questions from the LS's 🎲 Surprise question banks, easy to harder, drawn only from tabs the class has opened, at the student's own pace with the recording on, Starter with the Catalan and a sentence start, Base help words, Core 💡 Help on a tap, Plus none; the Time plan's 🎲 Surprise questions stay as they are). Everything at the student's level, only from tabs the class has opened; nothing is handed in, sent, marked or corrected by Beltran, and no learning path names show. The browser's ← goes back one choice.
- **🧠 Flashcards** (Roger, 24 Nov 2026: "a flashcard activity with all the vocabulary and grammar done in each route and by LS… like Anki… all mixed with statistics… and per LS… to study something specific"): **its own page, apart from 🎯 Practise** (Roger, 25 Nov 2026: "I want practice and flashcards split in two. Students will see their flashcards under progress"): **🧠 Flashcards** sits in the students' menu under 📚 Study (on a phone, in the Me tab under Study), and Practise no longer has a Flashcards tile. It opens on **Choose an LS** (one big card per LS with the cards to study today) with **📊 My statistics** and **🔀 Study all my LSs mixed** (a big teal card with today's cards, one chip per LS and ▶ Start, white text on a dark colour so it is easy to read: Roger, 25 Nov 2026: "this should be another color and more accesible or visual"); an LS opens its own page with ▶ Study everything mixed and 🎯 Or study only one part (Roger, 24 Nov 2026: "I want the user to go to flashcards and there select LS or see statistics"). Each LS has a deck at the student's route with every word of its Vocabulary steps and a card for each grammar and 💬 Expressions question, only from **what the class has done so far** (the tabs Practise shows; Roger chose it, 24 Nov 2026), so every new SLP adds its cards by itself. **LS1's decks keep the lower routes' words, as on the LS1 pages** (Roger, 25 Nov 2026, on a Plus LS1 deck that held only MAKE · DO · HAVE · TAKE & PAY: "this is wrong it cant all be make"): Plus has the Base and Core routine words too, and the make / do / have / take & pay collocations are **one part**, *Collocations: make, do, have, take & pay*, so each card asks which verb goes with it. **▶ Study everything mixed** gives the cards to review today and up to 15 new cards a day; after turning a card the student taps **Again · Hard · Good · Easy** and the card comes back sooner or later (spaced repetition, like Anki). **🎯 One part** studies one vocabulary set or grammar point; **📊 Statistics** (all LSs, or one LS) shows today, days in a row, % remembered, New · Learning · Young · Mature, the next 7 days, the last 5 weeks and each part. Parts are named by topic, never by learning path. **Catalan first or English first** (Roger, 25 Nov 2026: "I want them to be able to choose whether they see the Catalan first or the English first… it makes more sense to say Fer fotos means take pictures"; "when they are collocations first Catalan as a default"): a ⇄ button on the study screen switches between automatic (the default: a vocabulary card of two or more words, a collocation or expression, shows the Catalan first; a single word shows the English first), always English first and always Catalan first; the choice stays on that device. The English is heard when the card is turned. Pro cards (an English meaning, no Catalan) stay English first. **A grammar card turns over to what is right, all of it** (Roger, 25 Nov 2026: "the relative clauses flashcard are missleading"): a *correct it* or *join* card shows only the right sentence, never the wrong one again, and it can be heard; every answer that only swaps *who*, *which* or *that* shows ("who / that", with "who / that: both are right." when the rule names only one); an answer keeps its capitals (November, "Never have I seen…"). **Every card turns over to a full sentence** (Roger, 25 Nov 2026: "here we need the full sentences, som students might find it missleading (an all the flashcards with the same fornat too)"): a numbered gap of a text (Pro open cloze and word formation) shows its whole sentence from the text, a *Correct the mistake*, *Correct the word* or *Order the words* card turns over to the right sentence alone, a *Make the question* card to the whole question, and an answer that starts a sentence starts with a capital. Progress follows the student's account (Chromebook and phone). Never marked, never To do.
- **🧑‍🎨 The streak mascot** (Roger, 24–25 Nov 2026: "I want to introduce a personalised mascot into English Lab, based on … my mini avatar"; "Can you put the mascot next to level and always visible the strike?"; "Maybe if the students touch the avatar they can go to flashcards"; "messages like do your flashcards, I promise it works or do some shadowing, i promise it works"; then "Merge"): Roger's own avatar in six moods, never commercial branding, with the **⚡ streak** (a golden bolt and the number in a rounded blue badge). The streak is the 🧠 Flashcards one: days in a row with at least one card studied, in any LS; **weekends and school holidays never break it**, and studying on them still counts. On **My dashboard** the mascot sits **next to 🎯 My level** with the ⚡ always visible (on a phone, at the top right of the greeting); a tap opens 🧠 Flashcards. Moods: 🙂 happy (studied today, or before 17:00 with today still to do), ⚡ energised (the same with 7+ days), 😟 worried (from 17:00 with today's cards still waiting), 😴 sleeping (nothing left today), 😢 sad (once, when a streak is lost), 🎉 party (once, at 7, 14, 30, 50, 100, 150 and 200 days). **Once a day, never in class time and after the daily ✅ card closes**, it says one line in Roger's voice from what the student really has pending, and the line is a link to it: "30 cards are waiting. Do your flashcards, I promise it works! 😉", "You still have 🗣 Shadowing to do. Do some shadowing, I promise it works!", "Read a chapter of 📖 the book. I promise it works!", "You have 3 late activities. Finish one today!", or "All done for today. See you tomorrow! 😴" (Catalan for Starter). It also replaces the ⛵🏁 icons on the daily race card, sits on the ✅ Finish all your activities card, the Choose an LS header of 🧠 Flashcards (one line about the streak) and the end of a study session (😴 Done for today, 🎉 a milestone); 📊 Statistics and Roger's 🧠 Flashcards tile show the ⚡ badge. It needs **no Firestore reads or writes** (the flashcards copy in the browser; the 👁 student view reads the student's copy once). **Never** in exams, recall checkpoints, the sample exam or on the projector.
- **📝 Mock exams** (it was 📝 Exam practice) in the side menu under 📚 Study: the student's LSs, each opening its sample exams (19 Nov 2026).
- Question labels: no 👆 Tria / ✏️ Completa labels where the task is obvious; join, change, fix, listen and own example keep theirs (19 Nov 2026).

**The teacher's dashboard** (20 Nov 2026)

- **First tries and latest tries** (Roger, 22 Nov 2026: "On the teacher's dashboard I want to see the first tries and last tries"): every auto-corrected step shows its first try and its latest score ("4/10 → 8/10"; one score when they are the same), and a step's details show each question's first try and its answer now. The latest score follows every correction (a new ✓ Check, ✏️ Correct it, today's check).

- Home: one card per group with **🙌 Class work** rings (first tries per skill; grammar and vocabulary with the games; **Writing and Speaking with the 5.1 / 3.2 level of each corrected writing and recording**, NA 25 · AS 50 · AN 75 · AE 100 %, since they have no automatic first tries: Roger, 24 Nov 2026, "But this isn't true. Students have a lot of writing activities") where First tries used to be (no checkpoints), and below them the exam rings per part, so the two rows compare at a glance. 📝 Exams sorts 🏆 Best mark first.
- 🌱 Progress tile per group: LS mark so far, steps done, work marked, activities average, 📈 skill mastery over time (the whole year, week by week, with each LS's exam ★ and final product ■ as points: LS1's pages kept no scores, so LS1 shows through them, on LS1's last day; the class games and the levels of corrected writings and recordings in the week they were done; 21 and 25 Nov 2026), 🕸 skills radar, average per criterion. No new Firestore reads.
- **📝 Exam dates per group** (Roger, 25 Nov 2026, same ask): each group page's heading shows **📝 Next exam: day · in N days · title** (never a past one; "📝 No exam coming · ＋ Set one" when there is none), and the Home card says it too. A click opens **📝 Exam dates**: the group's coming exams (the Time plan's own LS exam is moved on the Time plan), ＋ Add an exam (day, LS, title, note, and their Catalan for Starter, translated for him when left empty; ticks for the other groups of the course), ✏️ Change and 🗑 Remove.
- **One teacher menu on every page** (Roger, 25 Nov 2026: "this menu should always be the same", showing the 🧠 Flashcards page's menu next to the dashboard's): wherever Roger is (🧠 Flashcards, 🎯 Practise, 🎲 Games, an LS page, a learning path, the course pages), the left menu is the dashboard's own, with the same items, order, look and numbers (students per group, level asks, corrections waiting, new messages, 🛠 Maintenance ON, as the dashboard showed them last on that computer; no Firestore reads), under **Teacher dashboard**. Each item opens that place of the dashboard (📣 Announcement and 🛠 Maintenance open their window there). 🎯 Practise and 🎲 Games are in the menu too, after 📚 Materials, so nothing is lost. On a learning path it still shrinks to icons and opens on hover; on a phone the bottom bar is the dashboard's (Home · Groups · Corrections · Messages · More). Students' menus and the 👁 student view are unchanged.
- **🧠 Flashcards button between 🏠 Home and Groups** (Roger, 25 Nov 2026: "between home and groups I want to have a flashcards button. There I see this per each LS and I can even try them and have my own statistics"): it opens the students' 🧠 Flashcards page as they see it (Choose an LS, each LS's page, 📊 statistics), with a level picker for every course and route. What Roger studies there is saved to his own account, with his own statistics and streak (in a 👁 student view nothing is saved). On a phone it is in More › Materials.
- **🧠 Flashcards tile per group** (Roger, 24 Nov 2026: "Yes I want to see who uses them"; "As a teacher I want to be able to see them… On my dashboard"): who uses the 🧠 Flashcards of 🎯 Practise. Three cards (students who studied this week, cards and minutes this week, % remembered over 30 days) and one line per student: the last 7 days, last studied, days in a row, cards and time this week, cards learnt and % remembered; students who never used them say "not used yet". A click on a name opens **that student's decks as they see them** (👁 student view, with their own 📊 statistics; what Roger studies there is never saved), and 🧠 Open all the decks shows every route's cards. Only on Roger's screen, never marked. One Firestore read per student, only when the tile opens (🔄 Refresh reads again).
- **⛵ Class voyage: the title, Order by and the counts stay at the top** while Roger scrolls the table, and **⛶ Full screen** shows the whole page (map, order buttons and table) on the screen with that bar, and **▦ Table full screen** shows only the bar and the table (Roger, 21 Nov 2026: "table full screen missing here"); Esc or ✕ Exit full screen goes back (Roger, 21 Nov 2026: "I want this frozen so that when I scroll down I can see the table. And I want a full screen with the above menu"). Each full-screen button works from the others (▦ Table full screen from the map full screen too). **On a phone the full screens fill the whole screen** (Roger, 21 Nov 2026, iPhone: "I can't see the full screen map well"): no bottom tab bar, the map full screen keeps only the title and the three buttons in one short line, and the map's own title (LS · Your voyage) is a solid band so no place card shows through it.
- **⛵ Class voyage counts only the steps due** (Roger, 21 Nov 2026: "realment els hi falten tantes activitats per fer?"): Steps done, Still to do and the status count only the tabs done in class or set as homework (the same test as ✅ To do and ⏰ late). Steps planned for coming classes show as "+N coming" and never make a student look behind. The map still shows the whole road.
- **✅ To do says what is left for Roger** (Roger, 25 Nov 2026: "So it should be clearer"; "here it's unclear what I have to do… I'm tired of this"): every comment line in a group's To do says who, which step and the comment, then in plain words what he has to do (**👉 You:** answer it, or No reply needed) or **Nothing for you yet: Beltran answers it himself**. A student's activity window opens, under its title, with **👉 What's left for you** (each thing with its button) or **✅ Nothing left for you here**, and in grey what moves without him (a step sent back to redo, a comment or a level Beltran is doing). The levels and general feedback of a learning path are folded away as optional (Beltran gives them); a final product keeps its mark open. **A comment on a step sent back to ↺ Redo needs no answer** (the Redo message answers it, whoever sent it back): it leaves the To do until the student hands the step in again.
- 👁 The student view shows exactly what students see; its bottom bar also keeps Roger's 🔔 problem reports (Roger, 25 Nov 2026: "notifications should also appear here").
- **↺ Redo on every handed-in step** (Roger, 24 Nov 2026: "there should be a redo button here", on a Listening chart handed in with one letter per box): in a student's learning path window, every hand-in (listening chart, reading log, research card…) has a **↺ Redo** button (Roger, 24 Nov 2026: "I want to read redo"), like a writing's ↩ Send it back. The message (English, Catalan for Starter) goes on top of the step, and the step counts as not done until the student hands it in again. Pressing it also takes the step's comment off ✅ To do, like No reply needed (Roger, 24 Nov 2026: "I sent this to redo and it's still here").
- **📆 Term and year marks show how many students reach each degree** (Roger, 23 Nov 2026: "here I need a statistic of the NA, AS, AE, AN"): above each term's table and the whole year's, one card per degree (AE Excellent · AN Very good · AS Satisfactory · NA Not satisfactory, Excellent first) with the number of students and the %, a bar and how many passed. Only signed-in students with a mark; Roger's own and tester accounts never count, here or in the group averages.
- **🎓 Class mode any day** (Roger, 21 Nov 2026: "I dont see the class mode button, is it because is saturday?"): every group card on Home has its own **🎓 Class mode** button (⏹ Stop class mode while it is on), so Roger can prepare or try a class at the weekend or outside class time. It opens the group's next class; outside class time it lasts 70 minutes or until ⏹ Stop.
- **Students go full screen only when Roger starts 🎓 Class mode** (Roger, 24 Nov 2026: "I only want students to go full screen when I start class mode, not when it's English time"): a class of the timetable alone no longer puts them in full screen, and neither the "Come back to the class!" cover nor the In/Out list and attendance run then; ⏹ Stop (or the end of the class) ends it. **Going back keeps the full screen** (Roger, 24 Nov 2026: "sometimes when they go back they exit fullscreen, but not on purpose"): during class mode the browser's back opens the page before inside the full screen, never as a new page that ends it. Exams, recall checkpoints and the sample exam keep their own full screen rules.
- **Learning paths and activities table shows only what was done in class** (Roger, 21 Nov 2026: "here, I only want the activities that we've done"): the tabs on a past class day of the Time plan, ticked as done, or set as homework (the same test as missing work). Paths with nothing done yet are left out; the Score counts only the tabs shown. 📋 All activities shows everything.
- **LS1 shows only its exam and final product** in 👥 Students' Learning paths and activities table (Roger, 23 Nov 2026: "it should be hide, and LS1 only shows exam and final product"): LS1's learning paths were practice, done mostly before students signed in, so their columns were empty. LS1's Total there is the LS mark.
- **🗓 The term mark sits in that table** (Roger, 23 Nov 2026: "before Final product I should see the term grade, and the missing SLP and the Final product will follow on the right (and we'll see them here and in the 2n term)"): a **Term n mark** column (the same mark as 📆 Term and year marks) after what counts in the term on screen. On its right, marked → Term 2, come the tabs done in class after the term ended (or after 🔒 Close term), the tabs not done yet (with 📋 All activities) and a final product the plan puts in the next term. A learning path with tabs on both sides shows in two parts, each with its own Score. Term 2 shows the same LS again, with only those parts.
- **The class map on each group page has 🧭 Class steps on the right** (Roger, 21 Nov 2026: "I wanted a column with the percentage of students that have done it and it had to look more or less like this one"): the same places and steps as the students' 🧭 Your steps, each step with the **% of the group's students who did it** and each place with the % who did all its steps, in the percentage colours. A step not done in class yet (planned for today or a later class, not homework) shows its % in grey with "📅 not done in class yet" and is left out of the average. A tap on a step's or a place's % opens who has done it and who hasn't (Roger, 21 Nov 2026: "when I press on the % I see who's done and who hasn't"); another tap closes it. Names only there, on Roger's own screen (never on the projector); no new Firestore reads. **⛶ Full screen** on the map (and ⛶ Map full screen on ⛵ Class voyage) shows the map and its 🧭 Class steps on the whole screen; Esc or ✕ goes back (Roger, 21 Nov 2026: "I also want a full-screen button for the" class map).
- **⛵ Show the class map in class mode** (Roger, 21 Nov 2026: "In class mode I want to be able to show this to students, when I show it on the panel, they see look at the panel"): the end of the warm-up games (⛵ Who's winning the race?, with the "Finish all your activities" line and ▶ Start the class to close it), or ⛵ Show the class map above 📋 Today | 🧭 Class steps, shows the class map with its 🧭 Class steps column full screen on the projector (no names lists there). While it shows, every student's screen in that class mode says **👀 Mira la pantalla! / Look at the screen!** (their language first); ✕ Close (or Esc) gives them their page back. The numbers are the dashboard's copy from the last time Roger opened the group's page.
- 🧭 Learning situations › an LS and each group's 🔓 Learning paths show what every learning path covers: **Vocabulary · Grammar · What we do**, from the path's own step titles. The Learning situations table also shows every tab (SLP) of each path, one per line, in plain words with a legend above the table: **Open**, **Locked**, **In class + day** (opens in that class) or **Not planned yet**; "A: …" when the groups differ. No icons that could read as homework (21 Nov 2026).

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

- **Plan week by week, then build only that week** (Roger, 21 Nov 2026: "this web is to teach, not a self-study web… otherwise you prepare a lot of activities that we don't have time to do; and that's a waste of money"). The site supports teaching in class. An overview guide for the whole LS is fine, but activities are built one week at a time: 🤖 Claude drafts what happens in each class of the coming week, 👤 Roger checks it and says what to build, 🤖 Claude builds only that. Never build activities ahead of the agreed weekly plan. The weekly plan numbers the classes (class 1, 2, 3), not dates: if a class is lost or something changes, Roger says at the end of the week what was really done, and the next week's plan starts from there.
- **Plan for the real pace** (Roger, 21 Nov 2026): about **two main activities per class**, each in a simple format (grammar: explanation, exercises, correction · listening: questions, correction, doubts and difficult words · reading: read, questions, correction · writing: model, write, hand in · speaking: model, prepare in pairs, say it). Every class, in this order (Roger, 21 Nov 2026: "now we start with: saying, warm-up games, see who is winning the race (to remind them to do the activities), shadowing, 2 activities and a game"): warm-up (5 min): 💬 the saying of the day, the warm-up games, then **⛵ Who's winning the race?** (the class map on the projector with "Finish all your activities!", to remind them to do all their activities; no extra slide) · shadowing (5) · activity 1 (20) · activity 2 (20) · a game on that day's grammar and/or vocabulary (10).
- **Fast finishers in class** (Roger, 21 Nov 2026: "In class I want fast finisher to read the book, if they are done, they can do pending tasks (button to go to pending task), only if they have no pending task, I want them to go to games (include the ones of the exam)"): in class mode, ⚡ I've finished shows each student their next step in this order: finish today's class work → read the LS book (until every chapter is read) → their pending tasks (the ✅ To do list, a button for each) → only with nothing pending, games (the LS vocabulary games and the exam games). Only in class mode; it never builds or opens new work.
- **📖 The LS book is always open to read** (Roger, 24 Nov 2026: "they did the book as fast finishers so I want them to be able to see the book and turn the pages"): students can open the website's book any time, turn its pages and answer its chapters, even when the Time plan has no Book day. A chapter is still due only on a Book day of the Time plan. **📖 Books on the board opens this website book, never the PDF** (Roger, 24 Nov 2026: "didn't we say that the book would open as a real book where they can turn pages and not as a pdf?"): **📖 Open your book** goes to the book's pages, in 2 ESO and 4 ESO; the PDF stays only as a small 🖨 PDF to print link.
- **🧑‍🎓 Self study in class mode** (Roger, 24 Nov 2026: "in class mode I want to have the option of self study to work on whatever they need to"): a 🧑‍🎓 Self study button in class mode's 📋 Today lets every student go to work on their own. They can move around the whole site, **without full screen** (Roger, 24 Nov 2026: "in selfstudy students don't need to be in full screen"), under a bar with ✅ My pending tasks (the "Finish all your activities" card with its links, opened once by itself), 📖 the book and 🎲 Games. ✕ End self study (or ⏹ Stop) brings them back to the class step. It never opens new work.
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
- ✓ Check per question. **First tries never count for the mark** (Roger, 22 Nov 2026: "The first mark shouldn't count for the mark, I want to have the information to see how first tries change over time, but they shouldn't count for the mark since we need to value the work and the learning process. This is a rule"): they are kept only as a statistic for Roger (Roger, 22 Nov 2026: "First tries will be a statistic for me"). **One exception: recall** (Roger, 22 Nov 2026: "The recall keep the latest but I will use the first try to assess them"): the recall warm-ups and the recall checkpoints are marked by their first try, while students still see their latest answers. Students can correct wrong answers on the page or in the notebook, and the corrected answer is the one they see from then on (22 Nov 2026). Students' pages never mention a first try.
- **Typed answers: every natural answer counts, and the feedback names the real mistake** (Roger, 22 Nov 2026: "the feedback is wrong then because I didn't make a grammar mistake"; "This is correct too!"; "This should be the same for the students"). For every typed answer (learning paths, Towards Nativeness, 🎯 Practise, the sample exam):
  - **Accept every natural, correct answer**, casual ones included ("It works, right?", "Turns out the doc had another name", "What did you do exactly?", "in the top right corner", 2ESO / 2 ESO). When writing a question, list all of them; the first answer is the model shown. Contractions count either way (It's = It is). For students too (Roger, 22 Nov 2026: "do students have the same problem?"): American spellings count (gray = grey, favorite = favourite), a gap that shows its first letters (l_____) takes the whole word or only the missing letters, like / love / hate + to count as well as + -ing (I love to skate), and synonyms that are just as natural (remember their ancestors, a big procession, gather together).
  - **A spelling slip gets a spelling hint, never the grammar rule**: "Almost! Check the spelling of ‘laod’. Try again." (or "‘an other’ is one word", "Check the apostrophes"; Catalan for Starter). It is **still not right** (Roger chose "fix it and try again", 22 Nov 2026, as in the exams), but it is not one of the two tries before the answer shows.
  - **The grammar rule shows only for a real grammar mistake** (take / takes, Why 2 ESO doesn't…?, in / on). A real word in place of another keeps its rule.
  - **The Catalan of a Catalan → English question is natural Catalan**, never a calque of the English ("Per què 2n d'ESO no té planificació?", not "pla de temps"; Roger, 22 Nov 2026: "Això no és català").
- **No Hand in button on a step** (Roger, 24 Nov 2026: "I don't want them to have to press any button, the system needs to understand it as done"): a step with boxes and a self-assessment (Reading log, research card, final product steps) counts as handed in by itself once every box and rating is filled in, and later changes update it; the page says what is still missing until then. Writings, Speaking and Talk keep their send buttons.
- **The Reading log shows the text it is about** (Roger, 25 Nov 2026: "Yes; to make it easier to read", after a Starter student couldn't find texts A and B): the reading of the step before (texts A and B, or the whole text) sits above the boxes, at the student's level, with 🔊 Listen, Aa Easy reading and 🖍 Underline; what they underlined in the Reading tab shows there too. Every Reading log, Pro's Summary included.
- Students can't copy the theory into their notes; notes are optional, their own examples (19 Nov 2026).
- Randomise answer options, never the questions.
- The recall warm-up is done with no notes; practice is done at 80 %; the learning path's piece of writing or speaking is saved for the final product (Playbook).
- Part of the vocabulary practice is **heard** (*Listen and complete*: the computer says the sentence, the student types the missing words) and the mixed practice is **said** (*Say it* into the mic), so the four skills stay balanced (30 Oct 2026).
- **Listening cycle**: "Before you listen" (predict 2–3 words), a first listen for the gist, a second for the questions, then the micro-dictation of its 2–3 chunks. Prediction and gist boxes come automatically; the LS only supplies the chunks. **Never marked.** Real videos are mixed with recorded ones.
- **Shadowing step** in every learning path after Getting started (30 Oct 2026): a 25–45 s part of a recording the LS already has (never changed), with script and start and end times for the normal and slower copy, done in four rounds, counted by completion. **Students hand in a recording of it and Roig corrects it** (Roger, 24 Nov 2026: "in the new shadowing activities I want students to turn them in and roig will correct them"): the step is done only once the recording of their last go is handed in (📨 Hand it in to my teacher, like Speaking); Roig writes a transcript and notes on how close it is to the model (words left out, sounds, stress, linking, melody, rhythm), and the afternoon correction gives one thing done well and 2–3 things to improve, and from term 2 a 3.2 level on how close it is to the model (shadowing indicators, never grammar or words; see 📐 in section 8). Every Shadowing step from 24 Nov 2026 on; the two students had already opened (2 ESO LP2, 4 ESO LP3) stay as they were. The whole-class shadowing on the projector is not handed in. The same clips run on the class shadowing page in the first five minutes of class.
- **My goal / How did it go?** opens and closes each learning path: about a minute, never marked, not a step; the teacher reads both on the dashboard.
- **🎲 Surprise questions** (Roger, 21 Nov 2026: "they will press record and then a random question about the LS will pop up"; "like a game or shadowing that are anywhere"): a speaking activity Roger makes on the **Time plan**, not a learning path step. He ticks the SLPs it draws questions from and puts it on a class day or sets it as homework; it then appears as a stop on the students' road and as a 🎲 column in the Learning paths and activities table. The recording starts first and four questions the student hasn't seen pop up one by one, easy to harder, at their level (Starter gets the Catalan and a sentence start, Base word chips in English; Core a 💡 Help on a tap; Plus none). Questions only from the SLPs chosen: written ones where the LS has them, automatic ones from the SLP's words and grammar for the rest (Roger chose "both"). Marked like the rest of speaking (teacher-only analysis, criterion 3.2); students see Done / Not done, **Things to improve** and, from term 2, the level (📐, section 8).
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
- **The bonus is part of the term mark** (Roger, 25 Nov 2026: "the final marks of the term should include the 0,5 if they done all the activities that were due to before the Monday exam"): only a student with **every activity due in the term done** gets it (Term 1: everything due by Fri 20 Nov, before the LS2 exams; done late still counts), and then it is added to the term mark everywhere (📆 Term and year marks, the Term n mark column, the 📄 Term report, 🎓 My progress), capped at 10, shown as "7.3 + 0.38 ⭐". Without it the student sees how many activities are missing and what the bonus would be. The year mark adds each term's bonus with the term's weight (×1, ×2, ×3). On 🎓 My progress (26 Nov 2026; it was on 📊 My marks), an ended term's points and bonus stay visible under the new term's line ("✅ Term 1: 122 points → +0.4"), never folded away (problem report, 4ESOA, 25 Nov 2026: a student thought her points had been deleted).
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
- Flashcards speak with the Kokoro Heart voice, including every word, example and grammar or 💬 Expressions sentence of the 🧠 Flashcards in 🎯 Practise (Roger, 25 Nov 2026: "use kokoro for the flashcards, heart"); listenings, Talk and dictation stay ElevenLabs, and **nothing already recorded with ElevenLabs is re-recorded** (Roger, 25 Nov 2026: "the ones that are already done using the elevenlabs, dont touch them").
- **Every reading text of a learning path can be heard** (Roger, 21 Nov 2026: "is it possible to make kokoro read the readings? Heart voice?"; "And can you add it to students' readings too? Not in the exams"): 🔊 Listen to the text, read by the free Kokoro Heart voice, with 🐢 Slower and the paragraph being read lit up. Towards Nativeness and the students' LS2 learning paths, every level; a new LS's readings are recorded when it is built. **Never in exams, sample exams or recall checkpoints.** LS1 stays as it is.
- **Students' left menu** is the shared one, on every student page, in this order (Roger, 26 Nov 2026, doc *New student's organization menu*): 🏠 My dashboard · 🗂 My course · N ESO with its LSs under it (an LS appears when Roger opens it) · 🎓 My progress with 📊 My marks under it · 📚 **Study** (a card that opens its sub-items, not a page) with 🎯 General practice, 🧠 Flashcards and 📝 Mock exams under it · 📖 Books · 🔤 Print your grammar and vocab · 🎲 Games · ❓ Help. 📱 Study on your phone is no longer in the menu: it is in ❓ Help. **Sub-items open with a click and stay open** (Roger, 26 Nov 2026: "When I open the subtopics, they must stay open so that the menu doesn't move when I go down"; it replaces opening them on hover): the ▾ at the right of 🗂 My course and 🎓 My progress, or the whole 📚 Study card, opens and closes them; each stays as the student left it on that device, and is open while one of its sub-items is the page you are on. **On every student page the menu is a strip of icons that opens when the mouse is on it**, as on the LS pages (Roger, 26 Nov 2026: "Els sub apartats apareixen al tocar amb el mouse, i el menu es fa petit com amb les LS"). The phone's Me tab follows the same order. General practice and Games show only the student's own course.
- The teacher's student view shows the page in the student's language from the first moment, with the red frame.

**Final product**

- A spoken video: students upload it on the site; it goes to Roger's Drive. **No spoken video = 0.**
- Only the video is marked as a group; everything else per student. Marked in two rounds, midway and at the end, with a marking PDF per round; a rubric per route in Word (Playbook). Groups mix routes (Research audit rule above).
- Format: a spoken video uploaded on the site (Nov 2026). The Procediment's Google Slides video with the face in picture-in-picture (21 Oct 2026) is replaced; audio alone only for practice.

**Audio and video**

- ElevenLabs: `eleven_v3` with audio tags, voices chosen by Roger from previews, one OK per generation. Slow copies always made locally for free (ffmpeg). Flashcards and reading texts use the free Kokoro Heart voice.
- Never re-record a listening students already used.

---

## 6. Making an exam

The base is Roger's guide ***How we make exams*** (28 Oct 2026), updated with what changed when exams moved to the website (LS2, Nov 2026). Rules that only applied to Google Forms are kept apart in 6.12. Where Roger has not decided something, it says **Ask Roger**.

### 6.1 What the exam counts

| LS | LS mark |
| --- | --- |
| LS1 (both courses) | Exam **75 %** · final product **25 %** (learning paths were practice) |
| LS2 and every later LS | Exam **35 %** · final product **25 %** · daily work in the learning paths **40 %** (2 Nov 2026) |

- **One exam per LS. Grade = points ÷ 10** (exam out of 100), the same for every level; no maximum-grade caps (Exams doc). **Marks are never converted between levels** (Roger, 21 Nov 2026: "we won't do this"; the 1 Nov idea "an 8 from a Base will be a 6" is dropped).
- Each section carries its criteria; vocabulary and grammar count for **4.1 and 5.1** alike (Use of English is reading and writing, 30 Oct 2026).
- Scale: NA 2.5 · AS 5 · AN 7.5 · AE 10. Mark to degree: under 5 NA · 5–6.9 AS · 7–8.9 AN · 9–10 AE.
- A percentage alone never sets the degree of 4.1 or 2.2: their indicators describe a task (reading log, listening chart); the exam scores are supporting evidence.
- **LS1's harder (Daring) exam counts ×1.2**, capped at 10 (17 Nov 2026). Levels are still set from the raw points. From LS2 on, the Core paper gets **no bonus** (none was set for LS2; Roger, 21 Nov 2026: "this is solved").
- The exam is not the whole LS: the number of activities done never raises an exam mark, but it counts in the LS mark (Rubrics doc).

### 6.2 Before writing it

1. **Find what each group has really done**: the Time plan ticks and class days, dropped learning paths (not in the exam for that group), the class games played. The exam asks only that (19 Nov 2026: "only what both groups did"). Respect the objectives, vocabulary, phrasal verbs, expressions and grammar really worked (Prompts).
2. **Exam day per group** is in `EL_PLAN[ls].exam`; check it with Roger.
3. **Remind Roger** to decide the versions per level and who takes each. Marks are not converted between levels (6.1).
4. **Agree the format with Roger before writing** (lesson from LS2: the exam was rebuilt twice).
5. Look at what students do best and worst in the activities and class games. For LS2 Roger wanted the exam **achievable** ("so that they get good marks", 19 Nov 2026): lean on strengths (choosing is easier than typing), avoid what most failed. **Ask Roger** if the next exam should be tailored the same way.
6. **From LS3 on, 10–15 % of the exam is on the core language of earlier LSs** (Research audit, 26 Oct 2026).

### 6.3 Structure

- **Sections in this order, by criterion** (Exams doc; Prompts): 1 **Listening** (2.1) → 2 **Reading** (4.1) → 3 **Language in Use**: Vocabulary + Grammar (4.1 / 5.1) → 4 **Writing** (5.1 + 5.2).
- Weights (from LS2, both courses, 19 Nov 2026): **Listening 20 · Reading 20 · Vocabulary 35 · Grammar 15 · Writing 10** = 100.
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
- **A spelling slip is wrong** (18 Nov 2026: Roger did not accept "donw" for "down"). The Exams doc's "small spelling variants" no longer applies.
- No "I don't know" option (web exams, Nov 2026).

### 6.6 Listening

- **First section, one shared audio** for all versions and levels, with different questions per version and level; played in class, all together. "Listening finished" opens the rest. A make-up student may play it at most twice, no pause or rewind. **Every make-up (👤 Only some students…) works like that** (Roger, 23 Nov 2026: "they will need headphones… play the audio in their exam twice like the last time with Elunei"): the student brings headphones and plays the audio on their own exam page (2 plays), and gets **another version of their level** than the one their account gets in class, so a student who redoes the exam never sees the same questions ("different from the ones [he] did, but the same as others prepared").
- **Short: about 1.5 minutes**; plan fewer audio facts (Exams doc).
- Claude delivers the full script and a plain dialogue `.txt` (`SPEAKER: line`). The audio: as in LS2, reuse a recording the LS already has (LS2 used a learning-path video's audio, Nov 2026); a new recording only with Roger's OK for that generation (section 1).

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
- Its label is **Sample exam 1**, never with an LP number (Roger, 21 Nov 2026: "Sample Exam 1 is perfect"; it was "First exam" from 19 Nov).
- **Optional and always open** (9 Nov 2026): never homework, never To do, never late, never in the bonus; shown as "🎯 Test yourself". Every new LS's sample exam gets `optional: true`. Open it **a week before the exam**, with each section's result linked to what to review (Research audit).
- Its first tab is the LS shadowing video (information only).
- Its writing opens the **student's own ChatGPT** with a prompt that asks only for a **mistakes table** (No. · Criterion C2/C3/C4 · Mistake · Correction · Why) and the corrected text: **never a mark, level or points** (20 Nov 2026).

### 6.10 On the exam day

- On the exam day of the Time plan, 🎓 Class mode opens the exam page. 📝 **Exam mode** pulls the group's students to it; Roger explains the rules, then ▶ **Start the exam** starts every waiting exam at once.
- Exam mode starts by itself only during the group's class time; outside it there is a button (19 Nov 2026).
- Full screen; leaving it, another tab or app for more than 0.4 s, or a reload stops the exam; Roger types his password on the student's screen to let them back in. Changes after coming back are logged.
- After listening, students move freely between Reading, Vocabulary, Grammar and Writing and see ✅ Review (blanks in red) before 🏁 Turn in. The reading stays open, so rule 6.4 (the reading never gives away the writing) is what protects the writing.
- **Roger closes the exam himself** (🔒 Close). Nothing closes a started exam automatically (19 Nov 2026).
- Make-ups and single students: 👤 Only some students…; class mode goes on for the others.
- **A try that can't count is redone another day, from the dashboard** (Roger, 26 Nov 2026: "in case a student does the exam from home … I must be able to delete that exam and make him do another version of the exam, another day"; "I should've been able to fix it too"). **⚠️ check** on a student's row of the 🖥 Web exam box says why a try may not have been done in class: 🏠 **a different internet connection from the rest of the class**, 🕘 started outside the group's class time, 💻 not done on a Chromebook (📱 a phone), or ⏩ finished in under half the class's usual time. A hint to look at, never proof. In the student's window, **↺ Redo it another day (make-up)** (it replaces ↺ Let them start again) keeps the try and its marks apart, takes its marks out of the results (the new try's marks wait for 📣 Publish), and makes sure the old try never comes back, not even from a page still open on the student's computer. On the make-up day the student is ticked in 👤 Only some students… and gets the next version, playing the audio twice with headphones. **↩ Put the old try back** undoes it while no new try has started. Nothing is deleted. **The connection check** (Roger chose "Yes, save only a short code", 26 Nov 2026): the exam page asks a free service for the connection's address and saves only a short code made from it, never the address; the class at school shares one connection, so a try from home has another code.
- On a Chromebook in full screen, the 🔍 Search key, Alt+Tab, the top-row keys and Ctrl+W/T/N do nothing (20 Nov 2026; still to test on a real Chromebook).
- **If 🏁 Turn in fails, the student emails a sealed code** (Roger, 23 Nov 2026: "If it's not possible to turn in, a window pops up and say, send your exam to your teacher … with their mail (not mine) … they only have to press send"; then "can we send the mail with the text encripted?" … "the idea is that students can't give the answers to other classes either"). No copy is emailed when turning in works. After 12 s without an answer, a window **📧 Send your exam to your teacher** opens. The answers freeze and the exam no longer locks. **Send it to my teacher** opens a new email in the student's own Gmail, to Roger's school address, and the student only presses Send. The email holds the answers only as a **sealed code**: nobody can read it, in the email or in the student's Sent folder, and if a single letter is changed it won't open. Roger pastes it into **📥 Open an emailed exam** (📝 Exams › the web exam box) to see the answers and the mark, and **🏁 Turn it in** for that student. The window also has 🔄 Try to turn it in again, and the page keeps trying by itself; once it gets through, the exam shows as turned in. With no internet the email can't open either: the answers stay on that Chromebook until the connection comes back. **Nothing readable leaves the exam** (Roger chose "Remove it", 23 Nov 2026): no print or Save as PDF button, and printing the exam page prints a blank page. The site is public, so a skilled programmer could in theory open the code; no student can in an exam.
- After turning in: practice games (LS words, never exam items), points only in the browser.

### 6.11 Marking and results

- Everything but the writing is marked automatically against the keys. Record the version each student took.
- **Writing**: Claude marks it with the C1–C4 rubric (section 7), the corrected text, a mistakes table and feedback in Roger's voice (Catalan for Starter, English for everyone else, Base included, since 21 Nov 2026). A blank writing is 0. Writing rows are always named C1–C4.
- **The marks save themselves; students see them only when Roger publishes** (Roger, 24 Nov 2026: "it makes no sense to save the exams, the exams are already saved, I only need a button to publish them when I want… in the teacher's board they must appear once corrected and the writing, I will accept what Claude says"). There is no 📥 Save marks: every finished web exam is written into the marks by itself (📊 Assessment details, Home, the reports), and Claude's writing correction is saved straight away (`writing.mjs import --apply`, no "apply" needed, since students can't see it yet), with a short preview to Roger (marks per student, average, how many passed). `--draft` stays only for a provisional mark Roger asks for.
- **Changing a mark after it is saved, even after publishing**: ✓ Accept (or ✗ Undo) an answer in the student's web exam window, and every student's mark with that question is saved again; the writing has **✏️ Correct it by hand** (rubric points, comment, corrected text, mistakes; the mark and the 5.1 level follow) and **🔄 Correct again** (Beltran corrects it again in the next marking run, which starts at once; `writing.mjs redo`). Published results change for the student at once.
- **Paper exams**: marked by hand from Roger's photos, doubtful items flagged; Roger enters them (the automatic save never touches paper rows).
- **A part not done is left out, not 0** (14 Nov 2026): the mark is the other parts rescaled to 10.
- A student who lost connection: use what was saved, only on Roger's word (20 Nov 2026).
- **Results are held until Roger presses 📣 Publish the results** (Roger, 24 Nov 2026; it replaces "4 days after the exam at 8:00" of 17 Nov) in the group's 📝 Exams › 🖥 Web exam box; 🔒 Hide again takes them back. A date set before (2 ESO and 4 ESO LS2: Fri 27 Nov 8:00) still opens them by itself unless he publishes earlier. While held, the student sees neither the sections, the report, the writing level nor the exam in "My LS mark so far", and the board says the results come out soon.
- **Don't notify students until Roger publishes.** An email needs his "send".
- **The report**: the whole exam question by question (right ones too, with the student's answer, the right one, why, and what to review), the writing with its C1–C4 cards, mistakes table and own text next to the corrected one. Catalan for Starter, English otherwise (Base too).

### 6.12 The Google Forms format (LS1, Oct 2026)

**Replaced by the web exams** (Nov 2026). Kept from *How we make exams* and *Prompts* only in case Roger asks for a Forms exam again.

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
- **Made-up facts never count** (Roger, 23 Nov 2026: "if someone makes up facts, it's okay no big deal, I only care about their English"): C1 checks that each point of the task is there, not that it is true, and the feedback never corrects facts.
- **Informal English: right in an informal text, a mistake in a formal one** (Roger, 23 Nov 2026: "gonna should be accepted"; 24 Nov 2026: "gonna is a mistake in formal English"): *gonna*, *wanna* and other natural casual forms are accepted in an informal writing (a message, email or post to a friend) and corrected in a formal one (a formal email, a report, a letter to a school). Only a real error around them always counts (*I gonna* without *am*).
- **No word-count penalty**: word ranges guide; brevity only costs points when ideas the task asks for are missing (in C1).
- **No quotas as thresholds**: "5 expressions" or "2 connectors" describe an excellent text, they never block a mark. No minimum number of structures.
- **One error, one penalty**: each error counts in one criterion only ("She get up": credit *get up* in vocabulary, penalise the -s in grammar).
- **Criterion 5.2** (planning, drafting, revising) is assessed from the process in the LS, not from spelling in one exam text.

**Every rubric**

- Has descriptors for a notable and an excellent text.
- **Indicators say how many times** (10 Nov 2026): fewer than half = NA, half = AS, 7 in 10 = AN, 9 in 10 = AE, plus the quality; each starts with what the student CAN DO.
- Final product: **Very good = 10/10** (a row at level 4 is always 10; Good / Fair / Developing 7.5 / 5 / 2.5 on a click) (14 Nov 2026).
- Comes with a ready-to-paste marking prompt: for a final product, the agreed prompt for ✨ Correct in my Roig (Roger's Gemini app, 20 Nov 2026); writings are marked by Claude (section 8). Not ChatGPT.

---

## 8. Marking and feedback

- **Everything is corrected automatically; Roger marks only the final product** (31 Oct 2026).
- **Daily runs** (Roger, 24 Nov 2026: "all the writing and corrections everyday at 17 except for weekends"; it was Wednesday only): marking and corrections **every weekday at 17:43** (Roger, 24 Nov 2026: "I want the corrections on weekdays at 17:33", then saved 17:43; first 15:13), which students see as soon as they are saved, since that is inside the 17:00 to 21:00 window (section 9); comments answered at once (and a Friday 15:00 catch-up); the Friday audit is switched off for now. ✏️ "Correct everything waiting now" starts a run on request.
- **Feedback is written as Roger**, first person, never signed, never mentioning AI, never inventing what happened in class. Catalan for Starter and no route; English for Base, Core, Plus and Pro (21 Nov 2026). Levels are never shown to students.
- **Writing corrections**: a short comment, a table Mistake · Correction · Why (at most 8) and the whole text corrected changing only the mistakes; the student sees their own text with the mistakes underlined. A handed-in writing is final unless Roger sends it back. Each corrected writing also gets a **5.1 level** (NA · AS · AN · AE, from the LS's 5.1 indicators applied to that piece; 21 Nov 2026): it fills the Writing skill and criterion 5.1 on the dashboard and the students' skill charts, and students did not see it as a level in term 1; from term 2 it counts in the daily work and students see it (📐 below). A writing sent back as mostly pasted gets no level.
- **Speaking and Talk: recording only, no transcript card** (14 and 16 Nov 2026). Spoken corrections cover words and grammar, never spelling or pronunciation, except a word Roger himself marks 🔊 *said wrong* in ✏️ Correct it (24 Nov 2026; Beltran's own speaking corrections stay words and grammar).
- **Speaking counts in the skills diagram** (Roger, 24 Nov 2026: "we said that the speaking should count for the diagram"): each corrected Speaking, Talk and 🎲 Surprise questions recording also gets a **3.2 level** (NA · AS · AN · AE, from the LS's 3.2 indicators applied to that recording and its route's task), as writings get 5.1. It fills Speaking in the students' 🕸 My skills and 📈 How my skills grow, the dashboard's 🌱 Progress and criterion 3.2 (before the final product); from term 2 it counts in the daily work and students see it (📐 below). A recording sent back as pasted gets no level.
- **✏️ Correct it: Roger can change any correction himself** (Roger, 24 Nov 2026: "I underline the sentences that are wrong, and the system suggests a correction and why. I change whatever I want"; "the corrections done by Beltran don't need my okay to be sent"). **Beltran stays the one who corrects** and his corrections go out by themselves at 17:00. On the dashboard, ✏️ Correct it on any hand-in (writing, speaking, Talk, shadowing, surprise questions) opens the text, or Roig's transcript of a recording, with the correction as underlines: Roger underlines (a recording: 🔊 a word said wrong or 〰 a sentence that sounds off), changes each correction and why, and the corrected text builds itself from his underlines. The **feedback template** fills in from them: ✔ what you did well, ➜ work on this next (the kind of mistake underlined most, with how many), and the 5.1 level of a writing. Before it saves, a **double check** lists what to look at (an underline with no correction or why, a correction the same as the words, more than 8 mistakes, a student's name, any word about AI, Catalan for a non-Starter or English for Starter, no level); Roger decides. His version replaces Beltran's, Beltran doesn't correct that version again, and it shows at once (🌙 hold after 21:00), unless Beltran's version was still waiting for 17:00: then his waits too. The design for corrections without Beltran (any AI by API, or a copy-and-paste sheet) is in the Claude Doc *Corrections without Beltran: design*; not built yet.
- **Shadowing feedback** (24 Nov 2026): pronunciation only (sounds, stress, linking, melody, rhythm, keeping up with the speaker), never grammar or vocabulary, since the words are the model's; one thing done well and 2–3 things to improve. Shadowing recordings stay out of 🗣 Speaking analysis.
- **Surprise questions feedback** (21 Nov 2026): one thing done well and 2–3 concrete things to improve, from the recording, in the student's language; never a mark, and from term 2 the 3.2 level beside it (📐 below).
- **Copies**: the writing log (pasted characters, keys, time) flags possible copies; clearly pasted texts are sent back automatically with a Redo note; never "too good" for Pro.
- **Final product**: Roger marks it with **✨ Correct in my Roig** (his own Gemini app, the agreed prompt and rubric, nothing paid; 20 Nov 2026). For the next LS, automatic drafts must be **off**. The prompt is kind but honest ("I don't want to give grades they don't deserve"); prompt changes only with Roger's agreement. Feedback in the part-line format (`Name (30%) · 7.5/10` + ✔ / ➜ lines). LS1 FP reflection: students who said in a problem report they couldn't see the instructions get the reflection row 10/10; nobody else (14 Nov 2026).
- **Speaking analysis** (20 Nov 2026; daily since 24 Nov 2026): teacher only. **Every new Speaking, Talk and 🎲 Surprise questions recording is analysed by Roig in the weekday run** (Roger, 24 Nov 2026: "quantify the words they pronounce well and if not well better, and then the structure of the speech and over time decide a way of comparing it"; he chose "every recording, every day", about €1 a month). Roig also counts each recording (words, words said clearly, sentences, correct sentences, connectors, seconds), and the 🗣 Speaking tile shows **📈 Over time** week by week (the % of words said clearly, the % of correct sentences, the pronunciation and structure levels; connectors and words a minute on hover), for the group or one student. 🔍 Analyse still shows the count and cost first for anything the run missed. Students never see any of it.

**Recall checkpoints** (Roger, 31 Oct 2026: "make sure they don't cheat"; [secure-checkpoints.md](general/secure-checkpoints.md))

- On the site, not as an exam: rules first ("I have read the rules" tick), one question at a time, about 45 s each, no going back, only once; no copying or pasting; leaving the page sends it automatically (back within 2 s is only a 👀 glance).
- No mark and no answers until Roger releases them (📣 Release feedback); then the page shows the mark, every answer, the right one and the hint (Catalan for Starter).
- Answers and hints never in the repo: keys in project files and Drive, uploaded to `cpKeys` only on Roger's "apply", before the checkpoint opens.
- The dashboard warns (⚠️) when a checkpoint is 35 points or more above the student's usual level: worth a look, not proof.

**Daily work** (the 40 %)

- Recall checkpoints 10 · recall warm-ups 2.5 (both their first try: the recall exception, 22 Nov 2026) · practice/grammar/mixed done 5 · class games 2.5 · skills tabs done 15 (= 35, "Grammar, vocabulary and skills") + other competences 5. Transversal criteria never count.
- **Missing work = 0 only if the tab was done in class (ticked on the Time plan) and its day has passed.**
- **Done late counts the same as on time** in term 1 (14 Nov 2026), and in term 2 for tabs from before Mon 30 Nov. Replaced from 30 Nov by 📐 below.
- **📐 From term 2, every activity has a level NA · AS · AN · AE, and daily work rests on quality, not completion** (Roger, 24 Nov 2026, after a Listening chart handed in with one letter per box: "all the new activities we do from now on will have an assessment NA to AE"; "feedback will have NA to AE and students will have 2 weeks to turn in, after that they will have a NA"; he approved the proposal with "Go apply and merge"). For every tab done in class or set as homework **from Mon 30 Nov 2026**:
  - **The level**: a hand-in (writing 5.1, Speaking, Talk, 🎲 Surprise questions and Shadowing 3.2, Reading log 4.1, Listening chart 2.2, research card) gets it from Beltran or Roig in the weekday run; an auto-checked step (practice, grammar, Expressions, reading and listening questions, book chapters) the level of its **latest** score (under 50 % NA · 50 % AS · 70 % AN · 90 % AE); recall warm-ups and checkpoints their first try, the same way. Vocabulary cards, My goal, How did it go?, Reflect and the sample exam have no level and are left out. Roger can change any level with ✏️ Correct it.
  - **The mark**: the same parts and weights as above, each the average of its levels (NA 2.5 · AS 5 · AN 7.5 · AE 10); the skills tabs averaged per skill first, so the four skills weigh the same. Class games keep their % right.
  - **Two weeks to hand it in**, counted from the class day (or the day it was set as homework); school holidays don't count. ↺ Redo gives a week from the day it is sent back. Within the two weeks it is left out (never 0); after them a tab not handed in, or handed in late, is **NA · not handed in = 0**. Students can still do it for the feedback, but the mark stays NA.
  - **Not a real try** (one letter or the same word in every box, filler letters, "no" for an answer): Beltran gives NA and sends it back with ↺ Redo at once. **Whenever Claude sees one, in any run** (marking, a student's comment, a problem report), it sends that step back with ↺ Redo straight away, without asking (Roger, 25 Nov 2026: "always when you detect that they've done sth like this, you must ask them to redo it").
  - **Students see** the degree in a coloured box on each correction (English name with the Catalan in brackets; Catalan only for Starter), the hand-in date of each tab on ✅ To do, and the rule on My marks. **Roger sees** each tab's level, ⏳ days left or NA ✗ in the Learning paths and activities table. It is the 📐 levels NA–AE setting of 📏 in Students' progress (term 2, every group); tabs from before 30 Nov keep the term 1 rule.
- Term 1 ended 20 Nov 2026: Roger closes each group with 🔒 Close term.
- Class games: a missed game or one under half right is left out, never 0; a game played again counts only its latest play.
- Self-assessment never counts in the mark.
- Year mark: Term 1 ×1, Term 2 ×2, Term 3 ×3 (section 4).

---

## 9. Answering students

**Problem reports** (routine: [problem-reports-auto.md](general/problem-reports-auto.md); instant task `trig_019JfVaVpNJdhGnFTsMxcWYg`)

- **Technical bug** → fix it, add a real-use test that would have caught it (section 11, 🤖 Real-use tests), squash-merge without asking, answer the student in Roger's voice, and email Roger with an **⚠️ IMPORTANT** subject (8 Nov 2026).
- **Design, pedagogy, marks, routes, deadlines, unclear, or LS1 content** → change nothing; leave it for Roger with a status (✅ fixed / 👍 not a bug / ✋ needs you), a note and a suggested reply in both languages.
- Roger's own reports: "✅ Merge straight away" for small tweaks; big changes or "⏸ Don't merge yet" → a PR with preview or a plan, and a thread.
- **An answered report or idea is dealt with** (Roger, 21 Nov 2026: "Pensava q això ja ho havia contestat"; "he rebut aquest mail amb problemes que ja he solucionat"): once Roger has sent an answer (📨 Send, ✏️ Edit first or ↩ Answer, not taken back), it shows **💬 Answered** instead of ✋ Needs you, its suggested reply and "👉 First" go away, it moves to *Fixed, closed and answered*, and it leaves every count and badge and the Saturday *your week* email. ✅ Mark as fixed and ↩ Answer still work on it. **💡 Ideas are archived the same way** (Roger, 21 Nov 2026: "Ideas that I have addressed should be archived like problems now"): an answered idea, or one Roger puts away with **📥 Archive** (dealt with without an answer; nothing goes to the student), leaves the open list for a collapsed *Answered and archived* list; the open list shows only ideas still waiting, or "No open ideas. 🎉".

**Timing and wording of every automatic answer** (17 Nov 2026; timing changed 24 Nov 2026)

- **Students see Beltran's corrections and answers to comments only Monday to Friday from 17:00 Madrid time** (Roger, 24 Nov 2026: "These answers must be in the afternoon from 17h and the same for all the corrections during weekdays at 17h"; "all the writing and corrections everyday at 17 except for weekends"; it replaces the 08:00 to 18:00 window of 17 Nov). Beltran still writes them at once; they wait, unseen, until then. The corrections (the afternoon run, ✏️ Correct everything waiting now, a writing sent back to redo) show at 17:00 sharp, or at once when they are written between 17:00 and 21:00 (the 17:43 run); an answer to a comment also waits **at least 2 hours** after it arrived and shows between 17:00 and 21:00. Anything ready after 21:00 or at the weekend waits for the next weekday at 17:00. The dashboard shows 🕗 Not shown yet with 📨 Show it now. What Roger writes himself shows at once (with the 🌙 21:00 to 7:30 ask). Never `--now` unless Roger asks.
- **Problem reports: fixed at once, answered only when Roger presses the button** (Roger, 24 Nov 2026: "Reports are done immediately but we don't send an answers until I press the button and the reports that are little tweaks or bugs get fixed straightaway"). A bug or small tweak is still fixed and merged straight away, but the student's ✅ answer waits: the report stays in the open list as **Fixed · send answer** until Roger presses **📨 Send it**.
- **Never use a student's first name or surnames** (17 Nov 2026; Roger again, 21 Nov 2026: "I said never use their names or surnames please"): no "Hola X", no "Thanks, X", not a classmate's name either. This covers every draft and suggested reply in a 💬 Answer box, every automatic answer and the automatic emails to students ("Hola!" / "Hi!" or straight to the answer). The tools refuse a text with a name, and the dashboard takes names out of drafts written before the rule.
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

- **How it works / Help resources** (24 Nov 2026): the teacher dashboard has a dedicated How it works section, separate from Materials. The correction presentation is an interactive HTML slide deck (not a PDF viewer), with slide navigation, keyboard controls and full screen, and is a permanent resource in student Help for both courses; no announcement, notification, homework or to-do item is created.

## 11. Technical work and deploying

- Repo `rogerbeltranps-lab/English-lab`, published with GitHub Pages; `teacher.html` = the dashboard, `today.html` = the student board. Groups 2ESOA, 2ESOB, 4ESOA, 4ESOB.
- **Start from the closest working page** and reuse its structure, styles and shared helpers (AGENTS).
- **Every decision goes in writing in the same PR**: a standing rule here, the technical detail in the root `AGENTS.md`, an LS-only rule in that LS's `AGENTS.md`, and the playbook when the LS model changes. Update the `docs/README.md` index row when an LS gets new docs.
- PRs: the attribution block, assignee and reviewer `rogerbeltranps-lab`, screenshots for visual changes. Merge only on "merge" (or the problem-report standing approval for technical bugs).
- Checks before a PR: `node --check` on changed JS, `git diff --check`, the repo checks that apply (`tools/vocab-cards/check.mjs`, `tools/answers-stay/…`), a Playwright look at 1366×768 (and 390×844 for student pages). Say honestly when a check was only programmatic.
- **🧪 Does it still open?** (Roger, 24 Nov 2026: "okay go ahead", so that fixing one thing never breaks another that worked): every PR that changes the site runs `tools/smoke/check.mjs` on GitHub. It opens the dashboard (every menu item), the student board and its places, every LS2 page, Practise and Games with invented students only, on a Chromebook and a phone screen, and fails when a page breaks, shows nothing, is wider than a phone, misses a file, two menu items open the same page, or anything tries to reach the real database. A PR whose check fails is fixed before it is offered for merge. A new LS or a new place on the board is added to the check in the same PR.
- **🤖 Real-use tests** (Roger, 25 Nov 2026: "Your call: should the real-use tests go ahead? … Yes"): every PR that changes the site also runs `tools/real-use/check.mjs` on GitHub. A robot uses the site the way a student and Roger do, in a real browser, with the real Firebase code and `firestore.rules`, against a **free test copy of the database** that lives only on GitHub's computer (the Firebase emulator): it hands in a step and sees the tick, Roger presses ↺ Redo and the tick goes, it studies flashcards and sees ⚡, sends a ⚠️ problem report that reaches Roger's 🔔, turns on Aa Easy reading, writes in the notebook, sits the exam to 🏁 Turn in, leaves full screen and is locked out, and finds held exam results in the 📬 only after 📣 Publish. Then it checks what the student and Roger see and what was saved. Invented students only (Alex Sample, Pau Exemple); nothing can reach the real database (a try fails the check), and it costs nothing. A PR whose real-use tests fail is fixed before it is offered for merge. **Every bug a student reports becomes a new real-use test, in the same PR as its fix**, so it never comes back; a new feature students use gets its test too.
- Bump `?v=` cache keys when a shared file or media changes; tell Roger (and students) to hard reload.
- `firestore.rules` publish by themselves on merge (GitHub Action). New school script versions: Claude pastes and deploys them in the Claude app's browser after Roger's "apply" (section 1).
- Preview without Firebase: `EL_DEMO_*` demo data and the invented students; never real data in previews.
- Firestore: no new reads without need; the dashboard **opens at once from its browser copy** and checks the light part (messages, settings, ticks) in the background, never waiting for Firestore before showing the page (Roger, 21 Nov 2026: "It took ages to open"), and updates per group.
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

## 13. What changed and what is still open

### 13.1 The Drive guides, one by one

| Guide | Still true | Outdated (replaced by the newer rule) |
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

### 13.2 Contradictions, settled (21 Nov 2026)

Roger, 21 Nov 2026: "when it comes to contradictions, my last decisions are the ones that are valid". So each row below follows the newest decision. That rule is the one written in sections 1 to 11, and the older text was fixed or marked as replaced in the same PR. Rows marked *(from practice)* follow what was last done, because Roger never said it in words.

| # | Topic | Valid rule (newest) | Older text, now replaced |
| --- | --- | --- | --- |
| 1 | Committing | Claude opens a PR for every change and merges on "merge". | AGENTS.md "Do not commit or push unless explicitly asked" (fixed). |
| 2 | Exam delivery | Web exams on the site: Base and Core papers, versions A/B/C, L20 R20 V35 G15 W10 (17–19 Nov 2026). | Word papers + a Google Form per model (Exams doc, Prompts, AGENTS.md, playbook step 10, 4ESO LS2 `grading.md`: fixed or marked replaced). |
| 3 | Exam versions | A, B or C: as many versions as the exam has (19 Nov 2026). | "A or B" (`el-web-exam.js`, AGENTS.md: fixed). |
| 4 | Exam writing | Claude marks it with C1–C4 (17 Nov 2026); the dashboard's 5.1 click is only a manual backup. | AGENTS.md: Roger clicks a 5.1 level (fixed). |
| 5 | Speaking hand-in | Recording only, no transcript (14 and 16 Nov 2026). | AGENTS.md (3 and 7 Nov), Research audit change 2 (marked replaced). |
| 6 | Writing revisions | Every writing is handed in once and Claude corrects it (1–2 Nov 2026). | A first and an improved version with "What I changed" (AGENTS.md "Revision counts", Research audit change 2: marked replaced). |
| 7 | Daily work split | Checkpoints 10 · warm-ups 2.5 · practice 5 · class games 2.5 (9 Nov 2026). | Playbook practice 7.5; Research audit 50/25/25. |
| 8 | Compulsory questions | 4 per grammar block (3 questions + own example), the rest extra; 💬 Expressions 6 + 4 (16 Nov 2026). 4ESO LS2 LP3 keeps its 7 because students already started it. | AGENTS.md 7 compulsory + 7 extra (14 Nov: marked replaced). |
| 9 | "Optional" labels | The sample exam shows "🎯 Test yourself (optional)" (9 Nov 2026). | Memory: no "optional" labels. |
| 10 | Continue card | Not on the LS page (simple LS home, 20 Nov 2026); the board keeps ▶ Continue. | Memory: every LS has a Continue card. |
| 11 | Mixed games | Decks stay a pair; the board can play both together (19 Nov 2026). | AGENTS.md "never a mixed game again" (marked replaced). |
| 12 | FP videos | Marked in Roger's own Gemini app (20 Nov 2026). | Paid Gemini API. |
| 13 | Students' week | No week plan for students: ✅ To do and 🏠 Homework (6 Nov 2026). | Playbook "My week" (fixed). |
| 14 | Routes | Starter · Base · Core · Plus · Pro; exams in two papers, Base and Core. | Three itineraries Insecure / Safe / Daring. |
| 15 | Level conversion | Marks are never converted between levels (Roger, 21 Nov 2026). | Memory (1 Nov): "an 8 from a Base will be a 6". |
| 16 | Exam writing points | 10 of 100 (LS2, 19 Nov 2026); the rubric stays out of 20, halved. | Exams doc: 20 of 100. |
| 17 | Reading during the writing | Free movement between sections and a review page (web exams). | Two forms so the reading closes before the writing. |
| 18 | The listening audio | Reuse a recording the LS already has, as in LS2 *(from practice)*. | Roger records it; ElevenLabs. |
| 19 | Length and models | Two papers × versions A/B/C; items and time agreed with Roger with the format (6.2). | Four models A–D, 35 items, 50 minutes. |
| 20 | "I don't know" option | None (web exams). | On every multiple-choice item. |
| 21 | Spelling slips | Wrong (18 Nov 2026: "donw" not accepted for "down"). | Keys accept "small spelling variants". |
| 22 | Language to Roger | Always English. | Prompts: explain in Catalan. |
| 23 | Exam location | Project files (`web-exam-<course>-<ls>/`) and Drive, never the repo. | Drive only. |
| 24 | FP format | A spoken video uploaded on the site *(from practice, Nov 2026)*. | Procediment: Google Slides video with the face in picture-in-picture. |
| 25 | Rubric marking prompt | FPs: the agreed prompt for Roger's Roig; writings: Claude (20 Nov 2026). | Rubrics doc: a ChatGPT prompt. |
| 27 | Class game theory | Questions only, no theory slides (16 Nov 2026). | Class games guide (5 Nov). |
| 28 | Storing recordings | Speaking recordings and FP videos are stored in Drive › 04_Students (private) (Nov 2026); Roger confirmed the data-protection side is fine (21 Nov 2026). | Roadmap: never store recordings. |
| 29 | Final product groups | Mixed routes, at least one Core or Plus student per group (Research audit, 26 Oct 2026). | Playbook: groups from the same route. |
| 30 | Sample exam timing | Always open; opened a week before the exam (9 Nov 2026). | Playbook: the session before the exam. |
| 31 | Flashcards typing | No typing on the cards (20 Nov 2026). | Playbook Part 1 (26 Oct). |
| 32 | Base language | Base reads English, like Core; only Starter (and no route) gets Catalan (Roger, 21 Nov 2026). | "Starter and Base: Catalan" (Exams doc, AGENTS.md, the routine notes: fixed or marked replaced). |
| 33 | Exam results | Marks save themselves; students see them when Roger presses 📣 Publish (24 Nov 2026). | 📥 Save marks, then results 4 days after the exam at 8:00 (17 Nov 2026). |
| 34 | Daily work in term 2 | Every tab from 30 Nov 2026 counts its level NA–AE; two weeks to hand in, then NA = 0 (Roger, 24 Nov 2026). | Done late counts the same as on time (14 Nov 2026); students never see the 5.1 / 3.2 levels (21 and 24 Nov 2026). |

### 13.3 Still open: nothing newer was decided

- **An exam tailored to strengths again** (6.2): ask when the LS3 exam is planned.
- **Three exam papers instead of two** (Roger, 25 Nov 2026: "starters do an exam that is more difficult to them. I think I'll do 3 exams next time, core, base and starter"): a Starter paper apart from Base. Confirm when the LS3 exams are planned; until then 6.3 (two papers) stands.
- **Research audit changes 3–9** (old row 26): several are built (core words, micro-dictation chunks, Catalan-to-English flashcards, the voyage road); Roger to say which of the rest are still wanted.
