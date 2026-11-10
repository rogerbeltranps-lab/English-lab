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
        "4.1":["Fewer than 5 of the 10 facts right (what, when, where and two customs for each text), or whole sentences copied; no word inferred, even with the model.", "5 or 6 of the 10 facts right, close to the model and often copied; 1 of the 2 words inferred correctly.", "7 or 8 of the 10 facts right, in short notes of their own, main customs chosen over minor details; 2 of 2 words inferred correctly.", "9 or 10 of the 10 facts right, without help; adds an idea that needs inference (why a custom matters) and explains how the context showed each word's meaning."],
        "4.2":["Fewer than half of the reasons right, or an obviously unreliable source (a shop blog, an anonymous post) rated as reliable, even with the checklist.", "At least half of the reasons right, copied from the checklist (author, date); names the source they trust most.", "7 in 10 reasons right and relevant (author, date, purpose, channel); explains why they trust one source most.", "9 in 10 reasons right, found on their own, including purpose and channel (selling, entertaining); sees the limits of a good source."],
        "2.2":["Fewer than 3 of the 6 boxes right (for each video: a value, a phrase that shows it, the tone or an image), or only facts (dates, food) and no values, even after a second viewing with subtitles.", "3 or 4 of the 6 boxes right: one thing each speaker values (Base: from a list) and one word or phrase that shows it, with subtitles or a second viewing.", "5 of the 6 boxes right, in their own words: what each speaker values, a phrase from the video and a note on the tone or the images.", "6 of the 6 boxes right, and compares the two speakers: what they share and how they differ."],
        "3.2":["Does not record their part, or reads more than half of the text; the audience cannot follow the message.", "Records their part with the basic content (what, when, where, customs) from a script revised with help; reads up to half of the text.", "A clear, complete part, revised after the rehearsal; reads at most 2 whole sentences; 7 in 10 sentences without errors in the structures worked on.", "Fluent and adapted to an audience that does not know the celebration, linked to the next speaker; does not read; 9 in 10 sentences without errors."],
        "5.1":["Unfinished or not understandable; no purpose or request; fewer than half of the future forms right.", "Purpose, plan and request, close to the template; at least half of the future forms right; errors that do not block meaning.", "Four clear parts (purpose, plan, request, closing), formal register; 7 in 10 future forms right and one relative clause used correctly.", "Well linked and persuasive beyond the model (varied linkers; Plus: answers a concern); 9 in 10 forms right; corrects their own errors."],
        "1.1":["Does not say what the celebration means, or presents it in a judging way.", "1 correct idea about what it means for the people who celebrate it and 1 reason for having it at school, close to the model.", "2 ideas about its meaning and 2 reasons for having it at school, with respect for cultural diversity.", "3 or more ideas with nuance (not everyone celebrates it the same way, or it has changed) and arguments that link diversity to rights or to the school community."],
        "1.2":["No link with a local celebration and no inclusive decision, or the plan includes a stereotype.", "1 simple link (Base: one thing in common; Core and Plus: one similarity and one difference) and 1 inclusive decision, close to the model.", "A clear, fair comparison (at least 1 similarity and 1 difference) and 1 inclusive decision with a reason.", "A comparison that builds a real link between the two cultures, and 2 or more justified decisions that foresee who could feel left out."],
        "6.1":["Fewer sources than required, or fewer than half of the notes in their own words; no references.", "The required sources; at least half of the notes in their own words; references incomplete.", "The required sources; 7 in 10 notes in their own words; all references complete; 1 point where the sources agree or differ.", "Varied sources; 9 in 10 notes in their own words and organised; full references; a disagreement resolved by choosing the more reliable source."],
        "CC1 1.3":["No concrete action, or only a vague one (\"everybody can come\").","One concrete action, or two very general ones close to the model.","Two concrete, realistic actions for students and families (explaining the customs, inviting families, an alternative for those who do not celebrate it).","Two or more concrete actions with reasons, thinking of different people (families, students who do not celebrate it, newcomers)."],
        "CC3 3.2":["No stereotype named, or the pitch repeats one (images, words, costumes).","Names one stereotype in a simple sentence with help (\"Some people think…\") and says the plan avoids it, without saying why it is unfair.","Names a stereotype, explains why it is unfair, and points to a concrete choice in the plan that avoids it.","Explains why it is unfair with an example or evidence from the research, and shows several choices in the plan that challenge it."],
        teamwork:["Teammates rate them below 1.5, or they did not take part in the group work.","Teammates rate them 1.5–2.4 on average.","Teammates rate them 2.5–3.4 on average.","Teammates rate them 3.5–4 on average: did their part on time, listened and helped to improve the work."],
        process:["Fewer than 3 of the 6 steps (0–5) handed in.", "3 or 4 of the 6 steps handed in.", "5 of the 6 steps handed in, or all 6 with one late or very general.", "All 6 steps handed in on time, specific and in their own words, with an honest self-assessment."]
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
        "4.1":["Fewer than half of the facts asked for are right (what people are doing, where and when, what they usually do, the purpose), or whole sentences copied; no purpose given, even with the model.", "At least half of the facts right, close to the model and often copied; the purpose of at least one text.", "7 in 10 facts right, in short notes of their own; the purpose of each text with a word from the text that shows it.", "9 in 10 facts right, without help; infers a new word from context and compares how the two texts use language."],
        "4.2":["Fewer than half of the reasons right, or an obviously unreliable page (a shop, an anonymous video) rated as reliable, even with the checklist.", "At least half of the reasons right, copied from the checklist without really looking at the page; one page chosen.", "7 in 10 reasons right and relevant (author, date, purpose, type of website); the better page chosen.", "9 in 10 reasons right, precise and found on their own, including the purpose (selling, getting views, informing) and the type of website; explains the choice."],
        "2.2":["Fewer than half of the boxes right (for each vlogger: what they are doing now, what they usually do and two details), or only the place, even after a second viewing with subtitles.", "At least half of the boxes right: what each vlogger is doing now or usually does, plus one detail, with subtitles or a second viewing.", "7 in 10 boxes right: what they are doing now, what they usually do and two details (place, clothes or weather), using the images and key words.", "9 in 10 boxes right, with precise details; says which words or images helped and compares the two vloggers."],
        "3.2":["Does not record the vlog, or reads more than half of the text and the audience cannot follow it; face and slides not visible.", "Records the vlog with guidance and covers the basic content (where, what people are doing, likes); reads up to half of the text; at least half of the now / usually sentences without errors.", "Plans and records with Slides and face in picture-in-picture; reads at most 2 sentences; 7 in 10 now (Present Continuous) and usually (Present Simple) sentences without errors; improves one part after the first recording.", "A fluent, well-structured vlog with a good rhythm, 1.5–2 minutes; does not read; 9 in 10 sentences without errors and a natural contrast; improves more than one part on their own."],
        "5.1":["Unfinished or not understandable; no clear parts, even with the template; fewer than half of the verbs (Present Continuous and Present Simple) right.", "The parts are there, close to the template or model; at least half of the verbs right; errors that do not block meaning; the tips are imperatives.", "The seven parts of the model, adapted; 7 in 10 verbs right, and time expressions, like / love / hate + -ing and imperatives used correctly; short slide text.", "A clear, well-linked script beyond the model (and, but, because, so; Plus: a temporary situation and an opinion); 9 in 10 forms right; corrects their own errors."],
        "6.2":["Fewer than half of the facts asked for, copied sentences or wrong information; no credits.", "Half of the facts, with help and partly copied; at least half of the credits (sources and photos), some incomplete.", "3 in 4 facts right, in key words from the required sources (Base: one given source; Core and Plus: two); 7 in 10 credits complete on the last slide.", "All the facts accurate and in their own words, from well-chosen sources they compared; every credit complete, on their own."],
        "CD2 2.2":["No editing: the mistakes and long pauses are left, or fewer than half of the photos are with their part of the script.", "Records with guidance; a mistake or long pause is left; at least half of the photos with their part of the script.", "Records with Slides and face in picture-in-picture; cuts at least one mistake or long pause; 7 in 10 photos with their caption and their script part.", "Records and edits on their own: no mistakes or long pauses left, good rhythm; 9 in 10 photos with their caption and their part."],
        "CD4 4.5":["No tips, fewer than half of the tips asked for (Base two, Core and Plus three), or tips that are not about screens.", "At least half of the tips asked for, general and close to the model; does not say which one they will apply.", "All the tips asked for, with imperatives, that prevent addictive habits (time limits, breaks, no phone before sleeping); says which one they will apply.", "All the tips asked for, each with a reason; explains the one they are applying and how it is going."],
        process:["Fewer than 3 of the 6 steps (0–5) handed in.", "3 or 4 of the 6 steps handed in.", "5 of the 6 steps handed in, or all 6 with one late or very general.", "All 6 steps handed in on time, specific and in their own words, with an honest self-assessment."]
      },
      names:{process:"Process evidence"}
    };
  })()
};
// Indicators in Catalan (Roger, 10 Nov 2026: the degree and its indicator sentence under each criterion on the student board, 🧩 My competences
// and 📏 My criteria). Starter and Base students read the board in Catalan, so they get these; Core and Plus get `ind`. Same four levels
// (NA · AS · AN · AE), same meaning: keep them in step with `ind` and the LS's indicators.md. Only the English criteria are shown there.
// Since 10 Nov 2026 (Roger's OK) every level also says HOW MANY TIMES the student shows it, with the cuts of the mark: fewer than half = NA,
// half = AS, 7 in 10 = AN, 9 in 10 = AE. A level needs the number and the quality it describes.
(function(){const G=window.EL_GRADING;
  G["4eso-seasons-and-celebrations"].indCa={
    "4.1":["Menys de 5 de les 10 dades correctes (què, quan, on i dos costums de cada text), o frases copiades senceres; cap paraula deduïda, fins i tot amb el model.", "5 o 6 de les 10 dades correctes, a prop del model i sovint copiades; 1 de les 2 paraules deduïda.", "7 o 8 de les 10 dades correctes, en notes pròpies, triant els costums principals; 2 de 2 paraules deduïdes.", "9 o 10 de les 10 dades correctes, sense ajuda; afegeix una inferència (per què és important un costum) i explica com ha deduït cada paraula."],
    "4.2":["Menys de la meitat de les raons correctes, o una font clarament poc fiable (el blog d'una botiga, un missatge anònim) considerada fiable, fins i tot amb la llista.", "Almenys la meitat de les raons correctes, copiades de la llista (autor, data); diu en quina font confia més.", "7 de cada 10 raons correctes i pertinents (autor, data, propòsit, canal); explica per què confia més en una.", "9 de cada 10 raons correctes, pel seu compte, incloent-hi el propòsit i el canal; veu els límits d'una bona font."],
    "2.2":["Menys de 3 de les 6 caselles correctes (de cada vídeo: un valor, una expressió que el mostra, el to o una imatge), o només fets (dates, menjar) sense cap valor, fins i tot amb subtítols.", "3 o 4 de les 6 caselles correctes: un valor de cada persona (Base: d'una llista) i una paraula que ho mostra, amb subtítols o una segona escolta.", "5 de les 6 caselles correctes, amb paraules pròpies: el valor, una expressió del vídeo i una nota sobre el to o les imatges.", "6 de les 6 caselles correctes, i a més compara les dues persones: què comparteixen i en què es diferencien."],
    "3.2":["No grava la seva part, o llegeix més de la meitat del text; el públic no pot seguir el missatge.", "Grava la part amb el contingut bàsic (què, quan, on, costums) a partir d'un guió revisat amb ajuda; llegeix fins a la meitat del text.", "Part clara i completa, revisada després de l'assaig; llegeix com a molt 2 frases senceres; 7 de cada 10 frases sense errades en les estructures treballades.", "Fluida i adaptada a un públic que no coneix la celebració, enllaçada amb el següent parlant; no llegeix; 9 de cada 10 frases sense errades."],
    "5.1":["Inacabat o no s'entén; falta el propòsit o la petició; menys de la meitat de les formes de futur correctes.", "Propòsit, pla i petició, a prop de la plantilla; almenys la meitat de les formes de futur correctes; errades que no impedeixen entendre'l.", "Quatre parts clares (propòsit, pla, petició, comiat), registre formal; 7 de cada 10 formes de futur correctes i una oració de relatiu ben feta.", "Ben lligat i persuasiu més enllà del model (connectors variats; Plus: respon una preocupació); 9 de cada 10 formes correctes; corregeix ell mateix les errades."],
    "1.1":["No diu què significa la celebració, o la presenta jutjant-la.", "1 idea correcta sobre què significa per a qui la celebra i 1 raó per tenir-la a l'escola, a prop del model.", "2 idees sobre el significat i 2 raons per tenir-la a l'escola, amb respecte per la diversitat.", "3 o més idees amb matisos (no tothom la celebra igual, o ha canviat) i arguments que lliguen la diversitat amb els drets o la comunitat."],
    "1.2":["Cap relació amb una celebració local ni cap decisió inclusiva, o el pla inclou un estereotip.", "1 relació senzilla (Base: una cosa en comú; Core i Plus: una semblança i una diferència) i 1 decisió inclusiva.", "Una comparació clara i justa (almenys 1 semblança i 1 diferència) i 1 decisió inclusiva amb una raó.", "Una comparació que crea un vincle real i 2 o més decisions justificades que preveuen qui es podria sentir exclòs."],
    "6.1":["Menys fonts de les demanades, o menys de la meitat de les notes amb paraules pròpies; sense referències.", "Les fonts demanades; almenys la meitat de les notes amb paraules pròpies; referències incompletes.", "Les fonts demanades; 7 de cada 10 notes amb paraules pròpies; totes les referències completes; 1 punt on les fonts coincideixen o difereixen.", "Fonts variades; 9 de cada 10 notes pròpies i organitzades; referències completes; un desacord resolt triant la font més fiable."],
    process:["Menys de 3 dels 6 passos (0–5) entregats.", "3 o 4 dels 6 passos entregats.", "5 dels 6 passos entregats, o tots 6 amb algun tard o molt general.", "Els 6 passos entregats a temps, concrets i amb paraules pròpies, amb una autoavaluació sincera."]
  };
  G["2eso-free-time-live"].indCa={
    "4.1":["Menys de la meitat de les dades demanades correctes (què fa la gent, on i quan, què fa normalment, el propòsit), o frases copiades senceres; cap propòsit, fins i tot amb el model.", "La meitat o més de les dades correctes, a prop del model i sovint copiades; el propòsit d'almenys un text.", "7 de cada 10 dades correctes, en notes curtes i pròpies; el propòsit de cada text amb una paraula del text que ho mostra.", "9 de cada 10 dades correctes, sense ajuda; dedueix una paraula nova pel context i compara com fan servir la llengua els dos textos."],
    "4.2":["Menys de la meitat de les raons correctes, o una pàgina clarament poc fiable (una botiga, un vídeo anònim) considerada fiable, fins i tot amb la llista de control.", "La meitat o més de les raons correctes, copiades de la llista sense mirar gaire la pàgina; tria una pàgina.", "7 de cada 10 raons correctes i pertinents (autor, data, propòsit, tipus de web); tria la millor.", "9 de cada 10 raons correctes, precises i pel seu compte, també el propòsit (vendre, tenir visualitzacions, informar) i el tipus de web; explica la tria."],
    "2.2":["Menys de la meitat de les caselles correctes (de cada vlogger: què fa ara, què fa normalment i dos detalls), o només hi ha el lloc, fins i tot després de tornar-ho a veure amb subtítols.", "La meitat o més de les caselles correctes: què fa ara o què fa normalment i un detall de cada vlogger, amb subtítols o una segona escolta.", "7 de cada 10 caselles correctes: què fa ara, què fa normalment i dos detalls (lloc, roba o temps), fent servir les imatges i les paraules clau.", "9 de cada 10 caselles correctes, amb detalls precisos; diu quines paraules o imatges l'han ajudat i compara els dos vloggers."],
    "3.2":["No grava el vlog, o llegeix més de la meitat del text i el públic no el pot seguir; no es veuen la cara ni les diapositives.", "Grava el vlog amb ajuda i explica el contingut bàsic (on, què fa la gent, què li agrada); llegeix fins a la meitat del text; la meitat o més de les frases d'ara i de normalment sense errades.", "Planifica i grava amb les diapositives i la cara en petit a la pantalla; llegeix com a molt 2 frases; 7 de cada 10 frases d'ara (Present Continuous) i de normalment (Present Simple) sense errades; millora una part després de la primera gravació.", "Vlog fluid i ben estructurat, amb bon ritme, d'1,5 a 2 minuts; no llegeix; 9 de cada 10 frases sense errades i un contrast natural; millora més d'una part pel seu compte."],
    "5.1":["Inacabat o no s'entén; sense parts clares, fins i tot amb la plantilla; menys de la meitat dels verbs (Present Continuous i Present Simple) ben fets.", "Hi ha les parts, a prop de la plantilla o el model; la meitat o més dels verbs ben fets; errades que no impedeixen entendre'l; els consells són imperatius.", "Les set parts del model, adaptades; 7 de cada 10 verbs ben fets, i també les expressions de temps, like / love / hate + -ing i els imperatius; text curt a les diapositives.", "Un guió clar i ben lligat més enllà del model (and, but, because, so; Plus: una situació temporal i una opinió); 9 de cada 10 formes ben fetes; corregeix ell mateix les errades."],
    "6.2":["Menys de la meitat de les dades demanades, frases copiades o informació errònia; sense crèdits.", "La meitat de les dades, amb ajuda i en part copiades; la meitat o més dels crèdits (fonts i fotos), algun incomplet.", "3 de cada 4 dades correctes, en paraules clau de les fonts demanades (Base: una font donada; Core i Plus: dues); 7 de cada 10 crèdits complets a l'última diapositiva.", "Totes les dades exactes i amb paraules pròpies, de fonts ben triades que ha comparat; tots els crèdits complets, pel seu compte."],
    "CD2 2.2":["Sense edició: queden les errades i les pauses llargues, o menys de la meitat de les fotos van amb la seva part del guió.", "Grava amb ajuda; queda alguna errada o pausa llarga; la meitat o més de les fotos amb la seva part del guió.", "Grava amb les diapositives i la cara en petit a la pantalla; talla almenys una errada o pausa llarga; 7 de cada 10 fotos amb el seu peu i la seva part del guió.", "Grava i edita pel seu compte: no queda cap errada ni pausa llarga, bon ritme; 9 de cada 10 fotos amb el seu peu i la seva part."],
    "CD4 4.5":["Cap consell, menys de la meitat dels consells demanats (Base 2, Core i Plus 3), o consells que no parlen de pantalles.", "La meitat o més dels consells demanats, generals i a prop del model; no diu quin aplicarà.", "Tots els consells demanats, amb imperatius, que eviten hàbits addictius (límit de temps, pauses, res de mòbil abans de dormir); diu quin aplicarà.", "Tots els consells demanats, amb una raó cadascun; explica el que aplica i com li va."],
    process:["Menys de 3 dels 6 passos (0–5) entregats.", "3 o 4 dels 6 passos entregats.", "5 dels 6 passos entregats, o tots 6 amb algun tard o molt general.", "Els 6 passos entregats a temps, concrets i amb paraules pròpies, amb una autoavaluació sincera."]
  };
})();
