# Docs map

Start with the [root AGENTS.md](../AGENTS.md): it holds the rules for every course and LS. Then open the course and LS you are working on.

```
docs/
  general/                       not tied to a course or LS
    roadmap.md                   planned clean-up of the code structure
    tasks.md                     living list of pending site tasks
    new-ls-playbook.md           how we build a new LS: checklist for Roger + technical notes (model: 4ESO LS2)
  4eso/
    programme.md                 Roger's 4ESO teaching programme (all 6 LS)
    ls1-my-real-routine/
      AGENTS.md                  rules and dated decisions for this LS
      overview.md                the course content (three routes)
      assessment-criteria.md     activities mapped to the assessment criteria
    ls2-seasons-and-celebrations/
      AGENTS.md
      overview.md
      assessment-criteria.md     activities mapped to the assessment criteria
      competences-grid.md        competences × activities, and when each criterion is marked
      final-product-assessment.md  groups, parts, steps, marks and rubric of the final product
      indicators.md              NA / AS / AN / AE indicators per LS criterion
      grading.md                 LS mark, evidence per criterion and how levels are collected
  2eso/
    programme.md                 Roger's 2ESO teaching programme (Learning Situations 2n ESO, 21 Oct 2026, rev. 24 Oct)
    ls1-my-real-routine/
      AGENTS.md
      overview.md
      assessment-criteria.md     activities mapped to the assessment criteria
    ls2-free-time-live/
      AGENTS.md                  rules, how it was built from 4ESO LS2, and the dated decision log
      overview.md                the course content (three routes)
      assessment-criteria.md     activities mapped to the eight LS criteria
      competences-grid.md        competences × activities, and when each criterion is marked
      final-product-assessment.md  the individual Free Time Vlog: routes, steps, marks, two rounds
      indicators.md              NA / AS / AN / AE indicators per LS criterion (generated from el-grading.js)
      grading.md                 LS mark, evidence per criterion and how levels are collected
  archive/                       old drafts, for reference only
```

**For each new LS:** follow [general/new-ls-playbook.md](general/new-ls-playbook.md). In short: create `docs/<course>/ls<n>-<name>/` with an `AGENTS.md` (rules for that LS plus a dated decision log) and an `overview.md` (the approved content). Decisions that apply to every LS go in the root AGENTS.md; decisions for one LS go in its own AGENTS.md.

## Reference documents

Roger's reference documents, the ones every new LS follows. Word copies are in the LS project's files, folder `reference/`.

- [How we build a Learning Situation](general/new-ls-playbook.md): the checklist for a new LS, with 4ESO LS2 as the model.
- [Worked example: from competence to LS criterion](https://claude.ai/artifact/RLZP7UdTgREkiT7MJgCFAR): how a competence becomes an LS criterion with its indicators, plus the 4ESO LS2 assessment example.
