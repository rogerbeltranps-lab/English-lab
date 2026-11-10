// LS assessment and grading (root AGENTS.md "Assessment and grading"), one entry per LS id. The teacher dashboard reads it for the
// level buttons, exam marks, the LS grade view and the result per criterion. Weights, evidence and indicators are data, so a new LS
// only adds its entry here. Activity ids are EL_CATALOG ids; steps are EL_ACTIONS steps (as the LS pages record them).
// Levels: NA 2.5 · AS 5 · AN 7.5 · AE 10 · no evidence 0. Marks to levels: under 5 NA · 5–6.9 AS · 7–8.9 AN · 9–10 AE.
window.EL_DEGREES=["NA","AS","AN","AE"];
window.EL_DEGREE_MARK={NA:2.5,AS:5,AN:7.5,AE:10};
window.elDegree=m=>m==null||isNaN(m)?null:m<5?"NA":m<7?"AS":m<9?"AN":"AE";
window.elDegreeDown=l=>l?EL_DEGREES[Math.max(0,EL_DEGREES.indexOf(l)-1)]:l;
// Sections that count for more than one criterion (named in the notes under the criteria, e.g. "Vocabulary (4.1, 5.1)").
window.elExamShared=e=>e.sections.filter(x=>(x[3]||[]).length>1).map(x=>x[1]+" ("+x[3].join(", ")+")");
// Exam score per criterion: each section counts for every criterion it carries ([key, name, max, criteria]), so a section shared by two
// criteria (4ESO LS1 vocabulary: 4.1 and 5.1) counts in both. sc = results/{ls}/assessment .sections. Returns [{c, score, max, n, of}]
// in the order the criteria first appear; score and max only from the sections entered (n of `of`); [] when no section has criteria.
window.elExamByCrit=function(e,sc){const out={};sc=sc||{};
  e.sections.forEach(([k,,mx,cs])=>(cs||[]).forEach(c=>{const o=out[c]=out[c]||{c,score:0,max:0,n:0,of:0},y=sc[k];o.of++;
    if(y&&y.score!=null&&y.score!==""){o.score+=+y.score;o.max+=+(y.max||mx||e.max);o.n++}}));
  return Object.values(out)};
window.EL_GRADING={
  // LS1 My Real Routine, 2ESO and 4ESO (Roger, 25 Oct 2026): done in class and redesigned for next year, so this year only the final
  // exam and the final product count. only: the student board shows just these two. fp.mark: the final product is the teacher's mark
  // (score out of max in its dialog), not levels. Weights exam 75 · final product 25 (Roger, 30 Oct 2026: "the final product should count only
  // 25 %" in every LS; it was 50/50 from 25 Oct). Exam sections from his Exam A: a
  // section is [key, name, max, criteria]; 100 internal points, so the exam mark is points / 10 (the dashboard divides the sum by the sum of maxes).
  // 4ESO (Roger, 30 Oct 2026: "exams broken down by criteria"): criteria as on the exam (Models A–D) and his "Notes per criteri" sheet;
  // the writing is split into its rubric rows (C1 task 8, C2 grammar 4, C3 vocabulary 4 → 5.1; C4 organisation 4 → 5.2). Vocabulary
  // is evidence for both 4.1 and 5.1, so a criterion score (elExamByCrit) is not a share of the exam mark: the exam mark stays points / 10.
  ...(function(){const e=(c,sections)=>({blocks:[{id:"exam",name:"Final exam",w:75},{id:"fp",name:"Final product",w:25}],only:true,
    exam:{sections,max:10},fp:{a:c+"/final-product",mark:true}});
    // 2ESO (Roger, 30 Oct 2026): its exam cover gives criteria per item type: vocabulary choose 4.1, complete 5.1; grammar choose 5.1 and 4.1,
    // complete 5.1; writing as in 4ESO. So vocabulary (28) and grammar (32) are split into their choose and complete parts.
    return {"2eso-my-real-routine":e("2eso",[["listening","Listening",10,["2.1"]],["reading","Reading",10,["4.1"]],["vchoose","Vocabulary · choose",16,["4.1"]],["vcomplete","Vocabulary · complete",12,["5.1"]],
        ["gchoose","Grammar · choose",14,["5.1","4.1"]],["gcomplete","Grammar · complete",18,["5.1"]],
        ["wtask","Writing · task",8,["5.1"]],["wgrammar","Writing · grammar",4,["5.1"]],["wvocab","Writing · vocabulary",4,["5.1"]],["worg","Writing · organisation",4,["5.2"]]]),
      "4eso-my-real-routine":e("4eso",[["listening","Listening",10,["2.1"]],["reading","Reading",10,["4.1"]],["vocabulary","Vocabulary",28,["4.1","5.1"]],["grammar","Grammar",32,["5.1"]],
        ["wtask","Writing · task",8,["5.1"]],["wgrammar","Writing · grammar",4,["5.1"]],["wvocab","Writing · vocabulary",4,["5.1"]],["worg","Writing · organisation",4,["5.2"]]])}})(),
  // 4ESO LS2: docs/4eso/ls2-seasons-and-celebrations/grading.md (approved by Roger, 24 Oct 2026); indicators from its indicators.md
  "4eso-seasons-and-celebrations":(function(){
    const LP1="4eso/ls2-getting-started",LP2="4eso/ls2-celebrations-around-the-world",LP3="4eso/ls2-where-traditions-come-from",LP4="4eso/ls2-research-it-right",
      LP5="4eso/ls2-plan-the-day",LP6="4eso/ls2-write-to-the-head-teacher",FP="4eso/ls2-celebration-day-proposal",CP=n=>"4eso/ls2-recall-checkpoint-"+n;
    return {
      blocks:[{id:"exam",name:"Final exam",w:35},{id:"fp",name:"Final product",w:25},{id:"gv",name:"Grammar, vocabulary and skills",w:35},{id:"other",name:"Other competences",w:5}],   // 2 Nov 2026 (Roger): daily work 40 %, shared by the amount of work (checkpoints a bit more: the only scored, uncopyable part)
      key:["4.1","4.2","2.2","3.2","5.1"],          // key competences (CE2–CE5): exam and final product
      other:["1.1","1.2","6.1","CC1 1.3","CC3 3.2"], // the 20 % block
      // Exam: a mark per section (score out of max) and the writing level. Exam mark = sum of scores / sum of maxes × 10.
      // Use of English (vocabulary, grammar) counts for reading and writing alike, 4.1 and 5.1, in both LS2s (Roger, 30 Oct 2026:
      // “even though students see that section as Use of English … the competences are reading and writing”).
      exam:{sections:[["listening","Listening",20,["2.2"]],["reading","Reading",20,["4.1"]],["vocabulary","Vocabulary",15,["4.1","5.1"]],["grammar","Grammar",15,["4.1","5.1"]],["writing","Writing",30,["5.1"]]],max:10,level:{step:"writing",c:"5.1"}},   // points of the real exam, /100 (grading.md, 25 Oct 2026)
      // Where the teacher gives one-click levels: activity + step + criteria. group: given once per final-product group and copied to each member.
      // Only the video is marked in groups (Roger, 25 Oct 2026): the research card (6.1) is a level per student in round 1.
      // c may be a pseudo criterion with its own indicators (teamwork, process). The final product rows are in the final product dialog.
      // Learning-path steps with a level (Reading log, Listening chart, Research card / Fact file) are atOnce (Roger, 7 Nov 2026: "why is that
      // tick needed?"): marked in the Wednesday run after each hand-in, with no Time plan tick (students can only hand in what the teacher opened).
      moments:[
        {a:LP2,step:"log",name:"Reading log",c:["4.1"],atOnce:true},
        {a:LP3,step:"chart",name:"Listening chart",c:["2.2"],atOnce:true},
        {a:LP4,step:"card",name:"Research card",c:["4.2","6.1","CC3 3.2"],atOnce:true},
        {a:FP,step:"source",name:"1 · My source",c:["4.2"]},
        {a:FP,step:"research",name:"My research card (LP4 piece 3)",c:["6.1"]},
        {a:FP,step:"part",name:"3 · My part of the pitch",c:["3.2"]},
        {a:FP,step:"email",name:"4 · My email",c:["5.1","CC1 1.3"]},
        {a:FP,step:"team",name:"Teamwork (teammates' ratings)",c:["teamwork"]},
        {a:FP,step:"process",name:"My process evidence (steps 0–5)",c:["process"]},
        {a:FP,step:"group",name:"Group rows (the video)",c:["1.1","1.2","CC3 3.2"],group:true}
      ],
      // Final product (Roger, 2 Nov 2026: "the final product must be in the final product"): the research card and the video's meaning and local
      // link rows count here too, not in "other competences". The rubric's pct (final-rubric-data.js) shows the same weights.
      fp:{a:FP,rows:[{step:"part",c:"3.2",name:"My part",w:30},{step:"email",c:"5.1",name:"My email",w:25},{step:"source",c:"4.2",name:"My source",w:10},
        {step:"research",c:"6.1",name:"My research card",w:10},{step:"group",c:"1.1",name:"Video: what it means (group)",w:7.5},{step:"group",c:"1.2",name:"Video: local link (group)",w:7.5},
        {step:"team",c:"teamwork",name:"Teamwork",w:5},{step:"process",c:"process",name:"Process",w:5}]},
      // Marking PDF per round (final-product-assessment.md section 8): the rubric rows come from the LS's rubric data by round, group and video
      // (peers: the teammates' average goes next to that row; process: the process summary); answers = hand-ins [activity, step, {rate: also the self-check}].
      marking:{rubric:"4eso/seasons-and-celebrations/final-rubric-data.js",process:["prep","source","contribution","part","email","team"],afterDue:["team"],
        rounds:{1:{name:"Round 1 · Research and plan",note:"Research card and steps 0–2: My source and My research card, per student",answers:[[LP4,"card"],[FP,"prep"],[FP,"source"],[FP,"contribution"]]},
          2:{name:"Round 2 · Video, email and teamwork",note:"Steps 3–5 with the full email, teamwork received and the process, and a video sheet per group",answers:[[FP,"part"],[FP,"email",{rate:true}],[FP,"team"]],peers:"team",process:true}}},
      // Accuracy only from delayed retrieval (research audit, Roger 26 Oct 2026): first try of the four checkpoints and of the recall warm-ups
      // (they ask about earlier Learning Paths). Practice, grammar and mixed practice count only as done by the session deadline (EL_PLAN[ls].due).
      // gv part weights are their % of the LS mark (they add up to the block weight, 35); sn = the plain-words row students see (today.html SN; parts with the same sn are one row)
      gv:{parts:[
        {id:"cp",name:"Recall checkpoints (first try)",sn:"remember",w:10,first:[[CP(1),"check"],[CP(2),"check"],[CP(3),"check"],[CP(4),"check"]]},
        {id:"warm",name:"Recall warm-ups (first try)",sn:"remember",w:2.5,first:[[LP1,"recall"],[LP2,"recall"],[LP3,"recall"],[LP4,"recall"],[LP5,"recall"],[LP6,"recall"]]},
        {id:"time",name:"Practice done on time",sn:"practice",w:5,time:[[LP1,"words"],[LP2,"practice"],[LP2,"grammar"],[LP2,"mixed"],[LP3,"practice"],[LP3,"grammar"],[LP3,"mixed"],
          [LP5,"practice"],[LP5,"grammar"],[LP5,"mixed"],[LP6,"practice"],[LP6,"grammar"],[LP6,"register"]]},
        // Class games (Roger, 9 Nov 2026: "the performance in those games should be counted on performance of the students when it comes to
        // vocab and grammar, apart from giving points"): % right in this LS's grammar and vocabulary class games (gameResults, the same % as
        // the 🧩📚 circles), 2.5 % taken from practice done on time (7.5 → 5). A game the student missed or answered under half of is left out, never 0.
        {id:"games",name:"Class games (% right)",sn:"games",w:2.5,games:true},
        // Skills work (Roger, 2 Nov 2026: daily work = all the learning-path work): the reading, listening, speaking and writing tabs, done on time
        {id:"skills",name:"Skills work done on time (reading, listening, speaking, writing)",sn:"skills",w:15,time:[[LP1,"read"],[LP1,"listen"],[LP1,"speak"],[LP2,"read"],[LP2,"log"],[LP2,"listen"],[LP2,"write"],[LP2,"speak"],
          [LP3,"listen"],[LP3,"chart"],[LP3,"shadow"],[LP3,"write"],[LP3,"speak"],[LP3,"talk"],[LP4,"read"],[LP4,"sources"],[LP4,"again"],[LP4,"shadow"],[LP4,"talk"],
          [LP5,"listen"],[LP5,"again"],[LP5,"shadow"],[LP5,"write"],[LP5,"speak"],[LP5,"talk"],[LP6,"read"],[LP6,"again"],[LP6,"shadow"],[LP6,"write"],[LP6,"speak"],[LP6,"talk"]]}]},
      // Other competences: per criterion, half automatic (linked steps done; first:true = counts its first-try score) and half teacher levels (average).
      auto:{
        "1.1":[[LP2,"speak"]],
        "1.2":[[LP3,"write"],[LP3,"speak"],[LP4,"respect",1]],
        "6.1":[[LP4,"notes",1],[LP4,"credit",1],[LP4,"card"]],
        "CC1 1.3":[[LP5,"write"],[LP6,"write"]],
        "CC3 3.2":[[LP4,"respect",1]]
      },
      // Teacher half: levels on learning-path pieces only (Roger, 2 Nov 2026: "the final product must be in the final product … the other
      // competences come from the learning paths"). 1.1 and 1.2 have no learning-path level, so they are the steps alone. The final product
      // levels on these criteria stay evidence for the criterion degree (evidence below). CC1 1.3 is transversal: shown apart, never in the mark.
      teacher:{"6.1":[[LP4,"card"]],"CC1 1.3":[[FP,"email"]],"CC3 3.2":[[LP4,"card"]]},
      // Evidence per criterion for the suggested degree, earlier first: a later piece weighs `later` times the one before it.
      // [a,step] = teacher level; {exam:"reading"} = exam section mark. levelOnly: a score never sets the degree alone.
      later:2,
      evidence:{
        "4.1":{e:[[LP2,"log"],{exam:"reading"}],levelOnly:true},
        "2.2":{e:[[LP3,"chart"],{exam:"listening"}],levelOnly:true},
        "4.2":{e:[[LP4,"card"],[FP,"source"]]},
        "6.1":{e:[[LP4,"card"],[FP,"research"]]},
        "3.2":{e:[[FP,"part"]]},
        "5.1":{e:[["exam","writing"],[FP,"email"]]},
        "1.1":{e:[[FP,"group"]]},
        "1.2":{e:[[FP,"group"]]},
        "CC1 1.3":{e:[[FP,"email"]]},
        "CC3 3.2":{e:[[LP4,"card"],[FP,"group"]]}
      },
      // Indicators NA · AS · AN · AE (indicators.md; keep in step with it). Shown on hover over the level buttons.
      ind:{
        "4.1":["Cannot yet pick out the key information in the texts or infer words from context, even with the model (fewer than 5 of the 10 facts right; sentences copied).", "Picks out the basic information in two texts (what, when, where, customs) with the model's help and infers a word from context (5 or 6 of the 10 facts; 1 of 2 words).", "Picks out the key information in two texts in their own words, tells main customs from minor details and infers words from context (7 or 8 of the 10 facts; 2 of 2 words).", "Understands the texts accurately on their own, makes inferences (why a custom matters) and explains how the context gives each word's meaning (9 or 10 of the 10 facts)."],
        "4.2":["Cannot yet judge whether a source is reliable: gives no reasons or trusts an unreliable source (fewer than half of the reasons right).", "Judges a source's reliability with criteria from the checklist (author, date) and names the one they trust most (at least half of the reasons right).", "Judges the sources' reliability with relevant criteria (author, date, purpose, channel) and justifies trusting one most (7 in 10 reasons right).", "Judges sources critically on their own, considering purpose and channel, and sees the limits of a good source (9 in 10 reasons right)."],
        "2.2":["Cannot yet identify what the speakers value; only notes facts (dates, food), even with subtitles (fewer than 3 of the 6 boxes).", "Identifies one value of each speaker and a word that shows it, with subtitles or a second viewing (3 or 4 of the 6 boxes).", "Interprets in their own words what each speaker values and supports it with a phrase from the video and the tone or images (5 of the 6 boxes).", "Interprets and compares what the two speakers value, with precise evidence from words, tone and images (6 of the 6 boxes and the comparison)."],
        "3.2":["Cannot yet plan and deliver their part so the audience can follow it (does not record it, or reads more than half of the text).", "Plans and records their part with the basic content, from a script revised with help (reads up to half of the text; at least half of the sentences without errors).", "Plans, rehearses and revises their part and presents it clearly and completely (reads at most 2 sentences; 7 in 10 sentences without errors in the structures worked on).", "Presents their part fluently, adapted to an audience that does not know the celebration and linked to the next speaker (does not read; 9 in 10 sentences without errors)."],
        "5.1":["Cannot yet write an understandable formal email: the purpose or the request is missing (fewer than half of the future forms right).", "Writes an email with purpose, plan and request following the template and gets the message across (at least half of the future forms right).", "Writes a well-organised formal email (purpose, plan, request, closing) in formal register, with future forms and a relative clause (7 in 10 future forms right).", "Writes a well-linked, persuasive formal email beyond the model and corrects their own errors (9 in 10 forms right; Plus: answers a concern)."],
        "1.1":["Cannot yet explain what the celebration means for the people who celebrate it, or presents it in a judging way (no correct idea).", "Explains simply what the celebration means and why it can be at school, close to the model (1 idea and 1 reason).", "Explains what the celebration means for the people who celebrate it and argues for its place at school with respect for diversity (2 ideas and 2 reasons).", "Values the celebration with nuance (not everyone celebrates it the same way, or it has changed) and argues by linking diversity to rights or the community (3 or more ideas)."],
        "1.2":["Cannot yet build links between the celebration and local culture or propose inclusive decisions, or the plan includes a stereotype (no link or decision).", "Builds a simple link with a local celebration and proposes an inclusive decision, close to the model (1 link and 1 decision; Base: one thing in common).", "Compares the two celebrations clearly and fairly and justifies an inclusive decision (at least 1 similarity, 1 difference and 1 decision with a reason).", "Builds a real link between the two cultures and foresees who could feel left out with several justified decisions (2 or more decisions)."],
        "6.1":["Cannot yet find and organise information from the required sources: copies notes and gives no references (fewer sources than required, or fewer than half of the notes in their own words).", "Finds the key information in the required sources, with help (at least half of the notes in their own words; references incomplete).", "Finds, selects and compares information from several sources, rewords it and references it correctly (7 in 10 notes in their own words; all references; 1 point where they agree or differ).", "Finds and compares varied sources on their own and resolves a disagreement by choosing the more reliable one (9 in 10 notes in their own words and organised; full references)."],
        "CC1 1.3":["No concrete action, or only a vague one (\"everybody can come\").","One concrete action, or two very general ones close to the model.","Two concrete, realistic actions for students and families (explaining the customs, inviting families, an alternative for those who do not celebrate it).","Two or more concrete actions with reasons, thinking of different people (families, students who do not celebrate it, newcomers)."],
        "CC3 3.2":["No stereotype named, or the pitch repeats one (images, words, costumes).","Names one stereotype in a simple sentence with help (\"Some people think…\") and says the plan avoids it, without saying why it is unfair.","Names a stereotype, explains why it is unfair, and points to a concrete choice in the plan that avoids it.","Explains why it is unfair with an example or evidence from the research, and shows several choices in the plan that challenge it."],
        teamwork:["Teammates rate them below 1.5, or they did not take part in the group work.","Teammates rate them 1.5–2.4 on average.","Teammates rate them 2.5–3.4 on average.","Teammates rate them 3.5–4 on average: did their part on time, listened and helped to improve the work."],
        process:["Cannot yet document their process (fewer than 3 of the 6 steps handed in).", "Documents part of the process (3 or 4 of the 6 steps handed in).", "Documents the process step by step (5 of the 6 steps, or all 6 with one late or very general).", "Documents the whole process specifically and assesses themselves honestly (all 6 steps on time and in their own words)."]
      },
      names:{teamwork:"Teamwork",process:"Process evidence"}
    };
  })(),
  // 2ESO LS2 Free Time, Live!: docs/2eso/ls2-free-time-live/grading.md (same blocks as 4ESO LS2; individual vlog, so no teamwork row); indicators from its indicators.md
  "2eso-free-time-live":(function(){
    const LP1="2eso/ls2-getting-started",LP2="2eso/ls2-what-are-they-doing",LP3="2eso/ls2-now-or-usually",LP4="2eso/ls2-check-the-source",
      LP5="2eso/ls2-likes-and-screen-tips",LP6="2eso/ls2-write-your-vlog-script",FP="2eso/ls2-free-time-vlog",CP=n=>"2eso/ls2-recall-checkpoint-"+n;
    return {
      blocks:[{id:"exam",name:"Final exam",w:35},{id:"fp",name:"Final product",w:25},{id:"gv",name:"Grammar, vocabulary and skills",w:35},{id:"other",name:"Other competences",w:5}],   // 2 Nov 2026 (Roger): daily work 40 %, shared by the amount of work (checkpoints a bit more: the only scored, uncopyable part)
      key:["4.1","4.2","2.2","3.2","5.1"],      // key competences (CE2–CE5): exam and final product
      other:["6.2","CD2 2.2","CD4 4.5"],        // the 20 % block
      exam:{sections:[["listening","Listening",20,["2.2"]],["reading","Reading",20,["4.1"]],["vocabulary","Vocabulary",15,["4.1","5.1"]],["grammar","Grammar",15,["4.1","5.1"]],["writing","Writing",30,["5.1"]]],max:10,level:{step:"writing",c:"5.1"}},   // points of the real exam, /100 (grading.md, 25 Oct 2026)
      // One-click levels per student; the vlog is individual, so there are no group moments. "edit" (step 4) is where the vlog itself is marked (3.2, CD2 2.2).
      // Learning-path steps with a level (Reading log, Listening chart, Research card / Fact file) are atOnce (Roger, 7 Nov 2026: "why is that
      // tick needed?"): marked in the Wednesday run after each hand-in, with no Time plan tick (students can only hand in what the teacher opened).
      moments:[
        {a:LP2,step:"log",name:"Reading log",c:["4.1"],atOnce:true},
        {a:LP3,step:"chart",name:"Listening chart",c:["2.2"],atOnce:true},
        {a:LP4,step:"factfile",name:"Fact file",c:["4.2","6.2"],atOnce:true},
        {a:FP,step:"source",name:"1 · My source",c:["4.2"]},
        {a:FP,step:"factfile",name:"My fact file and credits (LP4 piece 3 + last slide)",c:["6.2"]},
        {a:FP,step:"script",name:"3 · My script and slides",c:["5.1"]},
        {a:FP,step:"edit",name:"4 · My vlog (video) and editing",c:["3.2","CD2 2.2"]},
        {a:FP,step:"tips",name:"5 · My screen tips",c:["CD4 4.5"]},
        {a:FP,step:"process",name:"My process evidence (steps 0–5)",c:["process"]}
      ],
      // Final product (Roger, 2 Nov 2026, as in 4ESO LS2): the fact file (6.2) counts here too; the rubric's pct shows the same weights.
      fp:{a:FP,rows:[{step:"edit",c:"3.2",name:"My vlog",w:35},{step:"script",c:"5.1",name:"My script and slides",w:25},{step:"source",c:"4.2",name:"My source",w:15},
        {step:"factfile",c:"6.2",name:"My fact file and credits",w:15},{step:"process",c:"process",name:"Process",w:10}]},
      marking:{rubric:"2eso/free-time-live/final-rubric-data.js",process:["prep","source","slides","script","edit","tips"],afterDue:["tips"],
        rounds:{1:{name:"Round 1 · Source and fact file",note:"Fact file and steps 0–2: My source and My fact file, per student",answers:[[LP4,"factfile"],[FP,"prep"],[FP,"source"],[FP,"slides"]]},
          2:{name:"Round 2 · Vlog, script, editing and tip",note:"Steps 3–5 with the full script, the editing log and the tip, plus the process; the video is watched on Classroom",answers:[[FP,"script",{rate:true}],[FP,"edit",{rate:true}],[FP,"tips"]],process:true}}},
      // gv part weights are their % of the LS mark (they add up to the block weight, 35); sn = the plain-words row students see (today.html SN; parts with the same sn are one row)
      gv:{parts:[
        {id:"cp",name:"Recall checkpoints (first try)",sn:"remember",w:10,first:[[CP(1),"check"],[CP(2),"check"],[CP(3),"check"],[CP(4),"check"]]},
        {id:"warm",name:"Recall warm-ups (first try)",sn:"remember",w:2.5,first:[[LP1,"recall"],[LP2,"recall"],[LP3,"recall"],[LP4,"recall"],[LP5,"recall"],[LP6,"recall"]]},
        {id:"time",name:"Practice done on time",sn:"practice",w:5,time:[[LP1,"practice"],[LP2,"practice"],[LP2,"grammar"],[LP2,"mixed"],[LP3,"practice"],[LP3,"grammar"],[LP3,"mixed"],[LP4,"practice"],
          [LP5,"practice"],[LP5,"grammar"],[LP5,"mixed"],[LP6,"practice"],[LP6,"grammar"]]},
        // Class games (Roger, 9 Nov 2026: "the performance in those games should be counted on performance of the students when it comes to
        // vocab and grammar, apart from giving points"): % right in this LS's grammar and vocabulary class games (gameResults, the same % as
        // the 🧩📚 circles), 2.5 % taken from practice done on time (7.5 → 5). A game the student missed or answered under half of is left out, never 0.
        {id:"games",name:"Class games (% right)",sn:"games",w:2.5,games:true},
        // Skills work (Roger, 2 Nov 2026, as in 4ESO LS2): the reading, listening, speaking and writing tabs, done on time
        {id:"skills",name:"Skills work done on time (reading, listening, speaking, writing)",sn:"skills",w:15,time:[[LP1,"read"],[LP1,"listen"],[LP1,"speak"],[LP2,"read"],[LP2,"log"],[LP2,"listen"],[LP2,"again"],[LP2,"shadow"],[LP2,"write"],[LP2,"speak"],[LP2,"talk"],
          [LP3,"listen"],[LP3,"chart"],[LP3,"shadow"],[LP3,"write"],[LP3,"speak"],[LP3,"talk"],[LP4,"read"],[LP4,"sources"],[LP4,"again"],[LP4,"shadow"],[LP4,"talk"],
          [LP5,"listen"],[LP5,"again"],[LP5,"shadow"],[LP5,"write"],[LP5,"speak"],[LP5,"talk"],[LP6,"read"],[LP6,"parts"],[LP6,"again"],[LP6,"shadow"],[LP6,"write"],[LP6,"speak"],[LP6,"talk"]]}]},
      auto:{
        "6.2":[[LP4,"credit",1],[LP4,"factfile"]],
        "CD2 2.2":[[FP,"slides"],[FP,"edit"]],
        "CD4 4.5":[[LP5,"write"],[LP5,"speak"],[FP,"tips"]]
      },
      // Teacher half: learning-path levels only (Roger, 2 Nov 2026, as in 4ESO LS2); CD2 and CD4 are transversal: shown apart, never in the mark.
      teacher:{"6.2":[[LP4,"factfile"]],"CD2 2.2":[[FP,"edit"]],"CD4 4.5":[[FP,"tips"]]},
      later:2,
      evidence:{
        "4.1":{e:[[LP2,"log"],{exam:"reading"}],levelOnly:true},
        "2.2":{e:[[LP3,"chart"],{exam:"listening"}],levelOnly:true},
        "4.2":{e:[[LP4,"factfile"],[FP,"source"]]},
        "6.2":{e:[[LP4,"factfile"],[FP,"factfile"]]},
        "3.2":{e:[[FP,"edit"]]},
        "5.1":{e:[["exam","writing"],[FP,"script"]]},
        "CD2 2.2":{e:[[FP,"edit"]]},
        "CD4 4.5":{e:[[FP,"tips"]]}
      },
      ind:{
        "4.1":["Cannot yet pick out the key information in the texts or their purpose, even with the model (fewer than half of the facts right; sentences copied).", "Picks out the basic information in two texts (what people are doing, where, when, what they usually do) with the model's help and identifies the purpose of one text (at least half of the facts right).", "Picks out the key information in two texts in their own words and identifies each text's purpose with a word that shows it (7 in 10 facts right).", "Understands the texts on their own, infers new words from context and compares how the two texts use language (9 in 10 facts right)."],
        "4.2":["Cannot yet judge whether a page is reliable: gives no reasons or trusts an unreliable page (fewer than half of the reasons right).", "Judges a page's reliability with criteria from the checklist and chooses one (at least half of the reasons right).", "Judges the pages' reliability with relevant criteria (author, date, purpose, type of website) and chooses the better one (7 in 10 reasons right).", "Judges the pages accurately on their own, considering the purpose (selling, getting views, informing), and justifies the choice (9 in 10 reasons right)."],
        "2.2":["Cannot yet identify what the vloggers are doing, even with subtitles (fewer than half of the boxes right).", "Identifies what each vlogger is doing now or usually does, plus a detail, with subtitles or a second viewing (at least half of the boxes).", "Identifies what each vlogger is doing now, what they usually do and details (place, clothes, weather), using the images and key words (7 in 10 boxes).", "Understands the vlogs accurately, says which words or images helped and compares the two vloggers (9 in 10 boxes)."],
        "3.2":["Cannot yet produce a vlog the audience can follow (does not record it, or reads more than half of the text).", "Records the vlog with guidance, covers the basic content and contrasts now and usually simply (reads up to half; at least half of the sentences without errors).", "Plans, records and revises the vlog; contrasts now (Present Continuous) and usually (Present Simple) clearly and improves one part (reads at most 2 sentences; 7 in 10 sentences without errors).", "Presents a fluent, well-structured vlog with a natural contrast and improves it on their own (does not read; 9 in 10 sentences without errors; 1.5–2 minutes)."],
        "5.1":["Cannot yet write an understandable script with the parts of the model (fewer than half of the verbs right).", "Writes the script with the parts of the model, following the template, and gets the message across (at least half of the verbs right).", "Writes a complete script adapted from the model, with time expressions, like / love / hate + -ing and tips with imperatives (7 in 10 verbs right).", "Writes a clear, well-linked script beyond the model and corrects their own errors (9 in 10 forms right; Plus: a temporary situation and an opinion)."],
        "6.2":["Cannot yet organise information from sources or credit them (fewer than half of the facts asked for; no credits).", "Organises basic information from a source in a fact file, with help, and credits some sources and photos (half of the facts; at least half of the credits).", "Organises the information in a fact file in key words and credits sources and photos correctly (3 in 4 facts; 7 in 10 credits complete).", "Rewords the information from sources they compared and credits everything on their own (all the facts and all the credits)."],
        "CD2 2.2":["Cannot yet edit the video: mistakes are left and the photos do not match the script (fewer than half of the photos in place).", "Records and edits with guidance and fixes some of the mistakes (at least half of the photos with their part of the script).", "Records and edits the vlog: cuts mistakes or pauses and matches the photos to the script (at least 1 cut; 7 in 10 photos in place).", "Records and edits the vlog on their own, with a good rhythm and no mistakes left (no long pauses; 9 in 10 photos in place)."],
        "CD4 4.5":["Cannot yet suggest tips to avoid addictive screen use (fewer than half of the tips asked for).", "Suggests general tips about screen use, close to the model (at least half of the tips asked for).", "Suggests concrete tips that prevent addictive habits and chooses the one they will apply (all the tips asked for, with imperatives).", "Justifies each tip and reflects on how they apply it to their own screen use (all the tips, each with a reason)."],
        process:["Cannot yet document their process (fewer than 3 of the 6 steps handed in).", "Documents part of the process (3 or 4 of the 6 steps handed in).", "Documents the process step by step (5 of the 6 steps, or all 6 with one late or very general).", "Documents the whole process specifically and assesses themselves honestly (all 6 steps on time and in their own words)."]
      },
      names:{process:"Process evidence"}
    };
  })()
};
// Indicators in Catalan (Roger, 10 Nov 2026: the degree and its indicator sentence under each criterion on the student board, 🧩 My competences
// and 📏 My criteria). Starter and Base students read the board in Catalan, so they get these; Core and Plus get `ind`. Same four levels
// (NA · AS · AN · AE), same meaning: keep them in step with `ind` and the LS's indicators.md. Only the English criteria are shown there.
// Since 10 Nov 2026 (Roger's OK) every level also says HOW MANY TIMES the student shows it, with the cuts of the mark: fewer than half = NA,
// half = AS, 7 in 10 = AN, 9 in 10 = AE. A level needs the number and the quality it describes. Each indicator starts with what the student
// CAN DO (Roger: "els indicadors han d'explicar què sap fer") and puts the numbers in brackets as the evidence.
(function(){const G=window.EL_GRADING;
  G["4eso-seasons-and-celebrations"].indCa={
    "4.1":["Encara no extreu la informació clau dels textos ni dedueix paraules pel context, fins i tot amb el model (menys de 5 de les 10 dades correctes; frases copiades).", "Extreu la informació bàsica de dos textos (què, quan, on, costums) amb l'ajuda del model i dedueix alguna paraula pel context (5 o 6 de les 10 dades; 1 de 2 paraules).", "Extreu la informació clau de dos textos amb paraules pròpies, distingeix els costums principals dels detalls i dedueix paraules pel context (7 o 8 de les 10 dades; 2 de 2 paraules).", "Comprèn els textos de manera autònoma i precisa, fa inferències (per què és important un costum) i explica com el context li dona el significat de les paraules (9 o 10 de les 10 dades)."],
    "4.2":["Encara no valora la fiabilitat d'una font: no dona raons o considera fiable una font que no ho és (menys de la meitat de les raons correctes).", "Valora la fiabilitat d'una font amb criteris de la llista (autor, data) i tria la que li sembla més fiable (la meitat o més de les raons correctes).", "Valora la fiabilitat de les fonts amb criteris pertinents (autor, data, propòsit, canal) i justifica per què se'n refia més d'una (7 de cada 10 raons correctes).", "Valora les fonts de manera autònoma i crítica, té en compte el propòsit i el canal i veu els límits d'una bona font (9 de cada 10 raons correctes)."],
    "2.2":["Encara no identifica què valoren les persones que parlen; només recull fets (dates, menjar), fins i tot amb subtítols (menys de 3 de les 6 caselles).", "Identifica un valor de cada persona i una paraula que ho mostra, amb subtítols o una segona escolta (3 o 4 de les 6 caselles).", "Interpreta amb paraules pròpies què valora cada persona i ho justifica amb una expressió del vídeo i el to o les imatges (5 de les 6 caselles).", "Interpreta i compara què valoren les dues persones, amb proves precises de les paraules, el to i les imatges (6 de les 6 caselles i la comparació)."],
    "3.2":["Encara no planifica ni presenta la seva part de manera que el públic l'entengui (no la grava, o llegeix més de la meitat del text).", "Planifica i grava la seva part amb el contingut bàsic, a partir d'un guió revisat amb ajuda (llegeix fins a la meitat del text; la meitat o més de les frases sense errades).", "Planifica, assaja i revisa la seva part i la presenta de manera clara i completa (llegeix com a molt 2 frases; 7 de cada 10 frases sense errades en les estructures treballades).", "Presenta la seva part amb fluïdesa, adaptada a un públic que no coneix la celebració i enllaçada amb el següent parlant (no llegeix; 9 de cada 10 frases sense errades)."],
    "5.1":["Encara no redacta un correu formal comprensible: falta el propòsit o la petició (menys de la meitat de les formes de futur correctes).", "Redacta un correu amb propòsit, pla i petició seguint la plantilla i es fa entendre (la meitat o més de les formes de futur correctes).", "Redacta un correu formal ben organitzat (propòsit, pla, petició, comiat), en registre formal, amb futurs i una oració de relatiu (7 de cada 10 formes de futur correctes).", "Redacta un correu formal ben lligat i persuasiu, més enllà del model, i corregeix les seves errades (9 de cada 10 formes correctes; Plus: respon una preocupació)."],
    "1.1":["Encara no explica què significa la celebració per a qui la celebra, o la presenta jutjant-la (cap idea correcta).", "Explica de manera senzilla què significa la celebració i per què pot ser a l'escola, a prop del model (1 idea i 1 raó).", "Explica què significa la celebració per a qui la celebra i defensa el seu lloc a l'escola amb respecte per la diversitat (2 idees i 2 raons).", "Valora la celebració amb matisos (no tothom la celebra igual, o ha canviat) i argumenta lligant la diversitat amb els drets o la comunitat (3 idees o més)."],
    "1.2":["Encara no construeix vincles entre la celebració i la cultura local ni proposa decisions inclusives, o el pla inclou un estereotip (cap vincle ni decisió).", "Construeix un vincle senzill amb una celebració local i proposa una decisió inclusiva, a prop del model (1 vincle i 1 decisió; Base: una cosa en comú).", "Compara de manera clara i justa les dues celebracions i justifica una decisió inclusiva (almenys 1 semblança, 1 diferència i 1 decisió amb una raó).", "Crea un vincle real entre les dues cultures i preveu qui es podria sentir exclòs amb diverses decisions justificades (2 decisions o més)."],
    "6.1":["Encara no cerca ni organitza informació de les fonts demanades: copia les notes i no cita (menys fonts de les demanades, o menys de la meitat de les notes pròpies).", "Cerca la informació clau a les fonts demanades, amb ajuda (la meitat o més de les notes amb paraules pròpies; referències incompletes).", "Cerca, selecciona i contrasta informació de diverses fonts, la reelabora i la cita bé (7 de cada 10 notes pròpies; totes les referències; 1 punt on coincideixen o no).", "Cerca i contrasta fonts variades de manera autònoma i resol un desacord triant la més fiable (9 de cada 10 notes pròpies i organitzades; referències completes)."],
    process:["Encara no documenta el seu procés (menys de 3 dels 6 passos entregats).", "Documenta part del procés (3 o 4 dels 6 passos entregats).", "Documenta el procés pas a pas (5 dels 6 passos, o tots 6 amb algun tard o molt general).", "Documenta tot el procés amb concreció i s'autoavalua amb sinceritat (els 6 passos a temps i amb paraules pròpies)."]
  };
  G["2eso-free-time-live"].indCa={
    "4.1":["Encara no extreu la informació clau dels textos ni n'identifica el propòsit, fins i tot amb el model (menys de la meitat de les dades correctes; frases copiades).", "Extreu la informació bàsica de dos textos (què fa la gent, on, quan, què fa normalment) amb l'ajuda del model i identifica el propòsit d'un text (la meitat o més de les dades correctes).", "Extreu la informació clau de dos textos amb paraules pròpies i identifica el propòsit de cada text amb una paraula que ho mostra (7 de cada 10 dades correctes).", "Comprèn els textos de manera autònoma, dedueix paraules noves pel context i compara com fan servir la llengua (9 de cada 10 dades correctes)."],
    "4.2":["Encara no valora la fiabilitat d'una pàgina: no dona raons o en considera fiable una que no ho és (menys de la meitat de les raons correctes).", "Valora la fiabilitat d'una pàgina amb criteris de la llista i en tria una (la meitat o més de les raons correctes).", "Valora la fiabilitat de les pàgines amb criteris pertinents (autor, data, propòsit, tipus de web) i tria la millor (7 de cada 10 raons correctes).", "Valora les pàgines de manera autònoma i precisa, té en compte el propòsit (vendre, tenir visualitzacions, informar) i justifica la tria (9 de cada 10 raons correctes)."],
    "2.2":["Encara no identifica què fan els vloggers, fins i tot amb subtítols (menys de la meitat de les caselles correctes).", "Identifica què fa ara o què fa normalment cada vlogger i un detall, amb subtítols o una segona escolta (la meitat o més de les caselles).", "Identifica què fa ara, què fa normalment i detalls (lloc, roba, temps) de cada vlogger, fent servir les imatges i les paraules clau (7 de cada 10 caselles).", "Comprèn els vlogs amb precisió, explica quines paraules o imatges l'han ajudat i compara els dos vloggers (9 de cada 10 caselles)."],
    "3.2":["Encara no produeix un vlog que el públic pugui seguir (no el grava, o llegeix més de la meitat del text).", "Grava el vlog amb ajuda, explica el contingut bàsic i contrasta ara i normalment de manera senzilla (llegeix fins a la meitat; la meitat o més de les frases sense errades).", "Planifica, grava i revisa el vlog; contrasta clarament ara (Present Continuous) i normalment (Present Simple) i en millora una part (llegeix com a molt 2 frases; 7 de cada 10 frases sense errades).", "Presenta un vlog fluid i ben estructurat, amb un contrast natural, i el millora pel seu compte (no llegeix; 9 de cada 10 frases sense errades; 1,5–2 minuts)."],
    "5.1":["Encara no redacta un guió comprensible amb les parts del model (menys de la meitat dels verbs ben fets).", "Redacta el guió amb les parts del model, seguint la plantilla, i es fa entendre (la meitat o més dels verbs ben fets).", "Redacta un guió complet i adaptat del model, amb expressions de temps, like / love / hate + -ing i consells amb imperatius (7 de cada 10 verbs ben fets).", "Redacta un guió clar i ben lligat més enllà del model i corregeix les seves errades (9 de cada 10 formes ben fetes; Plus: una situació temporal i una opinió)."],
    "6.2":["Encara no organitza la informació de les fonts ni les cita (menys de la meitat de les dades demanades; sense crèdits).", "Organitza la informació bàsica d'una font en una fitxa, amb ajuda, i cita part de les fonts i fotos (la meitat de les dades; la meitat o més dels crèdits).", "Organitza la informació en una fitxa amb paraules clau i cita correctament les fonts i les fotos (3 de cada 4 dades; 7 de cada 10 crèdits complets).", "Reelabora amb paraules pròpies la informació de fonts que ha comparat i ho cita tot de manera autònoma (totes les dades i tots els crèdits)."],
    "CD2 2.2":["Encara no edita el vídeo: queden les errades i les fotos no van amb el guió (menys de la meitat de les fotos al seu lloc).", "Grava i edita amb ajuda i corregeix part de les errades (la meitat o més de les fotos amb la seva part del guió).", "Grava i edita el vlog: talla errades o pauses i fa coincidir les fotos amb el guió (almenys 1 tall; 7 de cada 10 fotos al seu lloc).", "Grava i edita el vlog de manera autònoma, amb bon ritme i sense errades (cap pausa llarga; 9 de cada 10 fotos al seu lloc)."],
    "CD4 4.5":["Encara no proposa consells per evitar un ús addictiu de les pantalles (menys de la meitat dels consells demanats).", "Proposa consells generals sobre l'ús de pantalles, a prop del model (la meitat o més dels consells demanats).", "Proposa consells concrets que eviten hàbits addictius i tria quin aplicarà (tots els consells demanats, amb imperatius).", "Justifica cada consell i reflexiona sobre com l'aplica al seu propi ús (tots els consells, cadascun amb una raó)."],
    process:["Encara no documenta el seu procés (menys de 3 dels 6 passos entregats).", "Documenta part del procés (3 o 4 dels 6 passos entregats).", "Documenta el procés pas a pas (5 dels 6 passos, o tots 6 amb algun tard o molt general).", "Documenta tot el procés amb concreció i s'autoavalua amb sinceritat (els 6 passos a temps i amb paraules pròpies)."]
  };
})();
