# Research audit: changes for the LS project

**Approved by Roger on 26 Oct 2026** ("the rest I agree with all", then "go"). Full audit with sources: [How your Learning Situations measure up against the research](https://claude.ai/artifact/FhBnrKpdnaYA5C4bjDoBbT). This file lists what the **LS project** designs (content); the English Lab project builds the site changes and ticks them here.

## Site changes (English Lab project)

| # | Change | Status |
| --- | --- | --- |
| 1 | Grammar and vocabulary block from delayed retrieval: checkpoints 50 % · recall warm-ups 25 % · practice done on time 25 %; all four checkpoints count and have due dates | Built (this PR) |
| 2 | Revision counts: draft 1 kept, improved version, a "What I changed" line, both on the dashboard and on the student's page; the same for speaking transcripts | Built (PR after #105) |
| 3 | Catalan-to-English flashcard mode for the core words; a one-minute plan and review in each Learning Path | Plan and review built (with PR 2); flashcards to do (need the core words below) |
| 4 | Listening cycle: prediction, a check between the two listens, a micro-dictation of 2–3 chunks; subtitles from the first viewing for Insecure and Beginners | To do (needs the chunks below) |
| 5 | Neutral route names on student pages (code ids stay) | To do (Roger picks the names) |

## Content changes (LS project)

Apply them to every LS still running (4ESO *Seasons & Celebrations*, 2ESO *Free Time, Live!*) where they fit the calendar, and to every new LS through the [playbook](new-ls-playbook.md).

1. **Core words.** Mark 15–20 core words per Learning Path and route (`core: true` on the vocabulary item, or a `core` list per vocabulary panel). Core words come back in the readings, recall warm-ups and checkpoints of later Learning Paths; the rest stay receptive. The current word list of every LS is in project files `lexora/english-lab-words.csv`.
2. **Micro-dictation chunks.** For every listening, 2–3 short chunks (3–6 words) from the script that carry the Learning Path's language, for the dictation step of change 4.
3. **Mixed-route final product groups.** Every group has at least one Safe or Daring student; never an all-Insecure group. Each student keeps their own route's task for their part and email; group (video) rows are marked against the route most members have (the marking PDF already does this). Update `final-product-assessment.md` and the grouping tips in `el-plan.js`.
4. **Pair rounds before the recordings.** Once per Learning Path in class, a 6-minute pair round before the speaking recording: an information-gap task or 4/3/2 (the same talk to three partners in 90, 60 and 45 s). Add it as a tip in `EL_PLAN[ls].tips`.
5. **Cumulative exam items.** 10–15 % of each LS exam on the core language of earlier LSs (from LS3 on, or the next exam that is still being written).
6. **Previous-LS review deck.** The first Learning Path of each LS opens with a flashcard review of the previous LS's core words.
7. **Study summary as a self-test.** Add a cover-and-recall column to the vocabulary tables and a 10-item self-quiz per Learning Path to each route's PDF.
8. **Sample exam a week earlier,** with each section's result linked to what to review (calendar in `el-plan.js`).
9. **Read and watch more (later).** Optional, never late, never graded: when Roger's Lexora app is ready, students read ePubs built from the LS word list. Until then nothing is added.
