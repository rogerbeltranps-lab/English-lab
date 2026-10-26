# 2ESO · LS2 · Assessment and grading

**25 Oct 2026.** The grading plan of *Free Time, Live!*, built on the 4ESO LS2 plan with Roger's weights. Live in `shared/js/el-grading.js` (`EL_GRADING["2eso-free-time-live"]`); the teacher dashboard builds the LS grade view, the level buttons and the marking rounds from it.

## 1. The principle

Every LS criterion ends with a degree (NA · AS · AN · AE) that the teacher can justify with its [indicators](indicators.md) and a piece of work. The level comes first; the mark is worked out from it. Where a criterion has two pieces of evidence, the later one weighs twice the earlier one; missing work counts 0 (switchable to "not counted yet").

## 2. The LS mark

| Block | Weight | What goes in |
| --- | --- | --- |
| Final exam | 35 | Listening 20 (5 questions + listening chart) · Reading 20 (5 questions + reading log) · Vocabulary 15 · Grammar 15 · Writing 30 (the vlog script, 5.1 level NA 8 · AS 15 · AN 23 · AE 30). Score / max per section on the dashboard, plus the writing level. |
| Final product | 25 | My vlog 40 (3.2) · My script and slides 30 (5.1) · My source 15 (4.2) · My process evidence 15. All individual. |
| Grammar and vocabulary | 20 | Automatic (26 Oct 2026): checkpoints 1–4 50 % (first try) · recall warm-ups of LP2–LP6 25 % (first try) · practice, grammar and mixed practice of LP2–LP6 done by the session deadline 25 %. |
| Other competences | 20 | 6.2, CD2 2.2, CD4 4.5: half automatic from linked steps, half teacher levels (section 4). |

Key competences for the exam and the final product: 4.1, 4.2, 2.2, 3.2, 5.1.

## 3. Evidence per criterion

| Criterion | Evidence (earlier → later) | Degree |
| --- | --- | --- |
| 4.1 | LP2 reading log (level) · exam reading (score) | level only from the log; the exam gives a score |
| 2.2 | LP3 listening chart (level) · exam listening (score) | level only from the chart |
| 4.2 | LP4 fact file (level) · final product step 1 My source (level, round 1) | later weighs twice |
| 6.2 | LP4 fact file (level) · final product fact file and credits (level, round 1) | later weighs twice |
| 3.2 | final product step 4 My editing + the video (level, round 2) | one level |
| 5.1 | exam writing (level) · final product step 3 My script (level, round 2) | later weighs twice |
| CD2 2.2 | final product step 4 (level, round 2) | one level |
| CD4 4.5 | final product step 5 My screen tip (level, round 2) | one level |
| process | steps 0–5 handed in (level, round 2) | one level |

## 4. Other competences: the two halves

| Criterion | Automatic half (steps done) | Teacher half (levels) |
| --- | --- | --- |
| 6.2 | LP4 Credits quiz (first try) · LP4 fact file done | LP4 fact file · final product fact file and credits |
| CD2 2.2 | final product steps 2 (slides) and 4 (editing) done | final product step 4 |
| CD4 4.5 | LP5 writing and speaking done · final product step 5 done | final product step 5 |

## 5. Collecting the data

One-click level moments per student (no group moments: the vlog is individual): LP2 log (4.1) · LP3 chart (2.2) · LP4 fact file (4.2, 6.2) · final product step 1 (4.2) · fact file and credits (6.2) · step 3 (5.1) · step 4 (3.2, CD2 2.2) · step 5 (CD4 4.5) · process. Marking rounds (`marking.rounds`): round 1 = LP4 fact file + steps 0–2; round 2 = steps 3–5 (script and editing with self-ratings) + process; the video is watched on Classroom. Deadlines per group in `EL_PLAN["2eso-free-time-live"].due`.

## 6. What the site needs

Nothing new: the dashboard already reads every field used here (built for 4ESO LS2). The marking PDF per round is the English Lab project's pending task (brief in project files `ls2/assessment/marking-pdf-brief.md`); it applies to this LS as it is.

## 7. Terms

Term 1 (to Fri 20 Nov 2026): exam block, grammar and vocabulary, LP2 log, LP3 chart, LP5 tips (automatic half). Term 2 (to Fri 11 Dec): LP4, final product block, other competences levels. The final product mark goes in term 2.
