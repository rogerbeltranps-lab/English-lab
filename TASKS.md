# English Lab — Pending Tasks

This is the repository's living task list. Update it whenever a task is added, completed, or dropped.

**Last updated:** October 14, 2026

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

## Task statuses
- **Pending:** Not started.
- **In progress:** Currently being worked on.
- **Blocked:** Waiting on a decision, access, or dependency.
- **Done:** Implemented and verified.

Once a task is complete, move it to **Completed**, recording the date and, where possible, a link to the commit or pull request.

## Completed

_No tasks have been recorded as completed in this document yet._
