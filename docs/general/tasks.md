# English Lab — Pending Tasks

This is the repository's living task list. Update it whenever a task is added, completed, or dropped.

**Last updated:** October 16, 2026

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
- **Status:** In progress — code changes committed; published browser checks still outstanding
- **Priority:** High (student-facing)
- **Scope:** All 6 vocabulary games, 3 routes, 2 ESO and 4 ESO.
- **Completed October 16, 2026:**
  - [x] Compare the vocabulary-game banks with LP2 Routine expressions, LP3 Same day / Useful expressions, LP4 grammar where taught, and LP5 Healthy habits.
  - [x] Replace unstudied target answers with expressions actually introduced in the corresponding course and route. Insecure now includes its taught LP3 and Healthy Habits vocabulary.
  - [x] Keep Safe and Daring cumulative while making each route's Word Wheel balance baseline and extension vocabulary.
  - [x] Reduce Alphabet Challenge to 22 supported letters rather than adding unrelated words to fill the alphabet; remove hard-coded 26-letter progress and positioning.
  - [x] Correct Jeopardy (20 prompts per route), Sentence Scramble (8 sentences per route), picture answer sets and the shared pools for Memory Match, Word Rush and Mystery Picture.
  - [x] Exclude above-route distractors from Word Rush, Mystery Picture and other generated questions.
  - [x] Validate embedded JSON, JavaScript syntax, question counts, wheel letter matching, option uniqueness and data references for both pages.
- **Still to verify:**
  - [ ] Browser smoke test on *published* GitHub Pages for all six games at each route on 2 ESO and 4 ESO, including keyboard/touch, timer, scoring, saving history and finish/retry.
  - [ ] Confirm mobile layouts and the projector team mode after GitHub Pages deployment.
- **Files/commits:**
  - `2eso/my-real-routine/vocabulary-games.html` — latest update [4ae306b](https://github.com/rogerbeltranps-lab/English-lab/commit/4ae306bfc4a1640b1a46d3991954ddd050f0fd74)
  - `4eso/my-real-routine/vocabulary-games.html` — latest update [68d46e8](https://github.com/rogerbeltranps-lab/English-lab/commit/68d46e88618372b022431d2dcf6cb8ae8ee3c0a3)
- **Notes:** Both HTML pages have valid embedded game data and parseable JavaScript. GitHub Pages could not be independently retrieved for a live browser test during this session. Keep this ticket open until published verification is complete.

## Task statuses
- **Pending:** Not started.
- **In progress:** Currently being worked on.
- **Blocked:** Waiting on a decision, access, or dependency.
- **Done:** Implemented and verified.

Once a task is complete, move it to **Completed**, recording the date and, where possible, a link to the commit or pull request.

## Completed

_No tasks have been recorded as completed in this document yet._
