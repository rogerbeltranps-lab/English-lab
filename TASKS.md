# English Lab — Pending Tasks

This is the repository's living task list. Update it whenever a task is added, completed, or dropped.

**Last updated:** October 15, 2026

## Pending

### 1. Automatically attach assessment rubric PDFs to Gmail drafts
- **Status:** Pending — configuration to be decided
- **Priority:** Medium
- **Scope:** Final Product, 2nd and 4th year of ESO
- **Current behavior:** The “Prepare email in Gmail” button drafts a message, but the PDF must be saved and attached manually.
- **Goal:** Generate the complete rubric PDF and create a Gmail draft with the recipient, subject, message, and PDF already attached. **Never send emails automatically**; the teacher reviews each draft and clicks Send.
- **To do:**
  - [ ] Decide whether to use a personal Gmail account or the school's account (administrator restrictions may apply).
  - [ ] Configure Google Cloud, the Gmail API, and OAuth with the minimum permissions needed to create drafts.
  - [ ] Implement reliable rubric PDF generation without relying on “Print / Save as PDF.”
  - [ ] Create the draft with the PDF attached, without automatically sending it.
  - [ ] Test the process for both 2nd and 4th year of ESO, including authorization errors and missing information.
  - [ ] Review student-data privacy and ensure credentials and tokens are never exposed in the repository.
- **Note:** The Gmail API typically has no direct cost for this expected usage. Feasibility depends on OAuth permissions and account policies.

### 2. Audit and align vocabulary games with Learning Paths
- **Status:** Pending — source audit completed October 15, 2026
- **Priority:** High (student-facing content)
- **Scope:** `2eso/my-real-routine/vocabulary-games.html` and `4eso/my-real-routine/vocabulary-games.html`; all six games and all three routes
- **Finding:** The games use hand-maintained JSON vocabulary banks rather than the vocabulary actually introduced in each course's Learning Paths. The 2 ESO file has 41 bank entries; the 4 ESO file has 42. Each route currently has a 26-item Alphabet Challenge, 20 Jeopardy questions and 8 Sentence Scramble items. Alphabet Challenge, Memory Match, Word Rush and Mystery Picture draw from the shared route vocabulary; Jeopardy and Sentence Scramble also require separate review.
- **Confirmed 2 ESO problems:** `juice`, `snooze`, `pack my bag`, `hang out`, `help out`, `tidy up` and `catch the bus` are set as target answers without being taught as target expressions in the relevant course Learning Paths. Some exact time expressions (e.g. `quarter past`, `quarter to`, `ten to`) are assessed without equivalent explicit vocabulary presentation. Core taught expressions are missing from the games, including `have a shower`, `go for a walk`, `head out for school`, `turn in` and `sleep in`.
- **Confirmed 4 ESO problems:** Insecure's alphabet contains advanced `bite the bullet`, `catch up on`, `get down to`, `knock off` and `lie in` despite these not being part of its taught Insecure vocabulary. Other game targets such as `juggle commitments`, `quiet time`, `avoid distractions`, `snooze`, `burn out` and `balance responsibilities` are not systematically introduced in the corresponding Vocabulary sections. Core taught words `wake up`, `get up`, `get home`, `turn in` and healthy-habit expressions are absent or underrepresented.
- **Important distinction:** Some advanced 4 ESO phrases appear in a listening/reading transcript or the grammar session for **Safe** (e.g. `put off`, `catch up on`, `get down to`). Appearance alone does not make them taught vocabulary for **Insecure**. Verify each route against its actual Explore/Study cards and level-specific explanation, not just substring occurrence on a page.
- **To do:**
  - [ ] Establish a single curriculum-derived vocabulary inventory for each course and route: LP2, LP3, LP4 grammar where explicitly taught, and LP5 Healthy habits. Record the specific source session and minimum route for every term.
  - [ ] Make **Insecure** assess only Insecure-taught expressions; **Safe** include the earlier core plus Safe; **Daring** include the previous core plus Daring (cumulative routes).
  - [ ] Rewrite Alphabet Challenge clue/answer pairs from the taught inventory. **Do not add unrelated vocabulary to fill A–Z**; if 26 authentic letters are unavailable, support a shorter wheel and remove hard-coded `26` from the wheel, navigation and progress.
  - [ ] Review Memory Match, Word Rush and Mystery Picture together with their shared pool; ensure meanings, context gaps, Catalan translations, picture names and acceptable aliases all match the taught expressions.
  - [ ] Individually rewrite all 20 Jeopardy questions and 8 Sentence Scramble sentences per route, removing unstudied assessed expressions and any forced/ambiguous answers.
  - [ ] Ensure each important target expression from the Learning Paths recurs in at least one game, without requiring every minor word to appear in every game.
  - [ ] Validate all 12 combinations (2 courses × 6 games) for all three routes, including spelling variants, alternate natural answers, scoring, completion and mobile/projector mode; publish only after passing.
- **Reference:** `Guia mestra de les sessions · English Lab` and `Guia mestra del format Learning Path`: vocabulary should be introduced, contextualised and reused, without arbitrary additional lists.

## Task statuses
- **Pending:** Not started.
- **In progress:** Currently being worked on.
- **Blocked:** Waiting on a decision, access, or dependency.
- **Done:** Implemented and verified.

Once a task is complete, move it to **Completed**, recording the date and, where possible, a link to the commit or pull request.

## Completed

_No tasks have been recorded as completed in this document yet._
