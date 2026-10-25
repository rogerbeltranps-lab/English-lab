// LS assessment and grading (root AGENTS.md "Assessment and grading"), one entry per LS id. The teacher dashboard reads it for the
// level buttons, exam marks, the LS grade view and the result per criterion. Weights, evidence and indicators are data, so a new LS
// only adds its entry here. Activity ids are EL_CATALOG ids; steps are EL_ACTIONS steps (as the LS pages record them).
// Levels: NA 2.5 · AS 5 · AN 7.5 · AE 10 · no evidence 0. Marks to levels: under 5 NA · 5–6.9 AS · 7–8.9 AN · 9–10 AE.
window.EL_DEGREES=["NA","AS","AN","AE"];
window.EL_DEGREE_MARK={NA:2.5,AS:5,AN:7.5,AE:10};
window.elDegree=m=>m==null||isNaN(m)?null:m<5?"NA":m<7?"AS":m<9?"AN":"AE";
window.elDegreeDown=l=>l?EL_DEGREES[Math.max(0,EL_DEGREES.indexOf(l)-1)]:l;
window.EL_GRADING={
  // LS1 My Real Routine, 2ESO and 4ESO (Roger, 25 Oct 2026): done in class and redesigned for next year, so this year only the final
  // exam and the final product count. only: the student board shows just these two. fp.mark: the final product is the teacher's mark
  // (score out of max in its dialog), not levels. Weights 50/50 until Roger sets them; one exam section until he gives the marks.
  ...(function(){const e=c=>({blocks:[{id:"exam",name:"Final exam",w:50},{id:"fp",name:"Final product",w:50}],only:true,
    exam:{sections:[["exam","Exam"]],max:10},fp:{a:c+"/final-product",mark:true}});
    return {"2eso-my-real-routine":e("2eso"),"4eso-my-real-routine":e("4eso")}})(),
  // 4ESO LS2: docs/4eso/ls2-seasons-and-celebrations/grading.md (approved by Roger, 24 Oct 2026); indicators from its indicators.md
  "4eso-seasons-and-celebrations":(function(){
    const LP2="4eso/ls2-celebrations-around-the-world",LP3="4eso/ls2-where-traditions-come-from",LP4="4eso/ls2-research-it-right",
      LP5="4eso/ls2-plan-the-day",LP6="4eso/ls2-write-to-the-head-teacher",FP="4eso/ls2-celebration-day-proposal",CP=n=>"4eso/ls2-recall-checkpoint-"+n;
    return {
      blocks:[{id:"exam",name:"Final exam",w:35},{id:"fp",name:"Final product",w:25},{id:"gv",name:"Grammar and vocabulary",w:20},{id:"other",name:"Other competences",w:20}],
      key:["4.1","4.2","2.2","3.2","5.1"],          // key competences (CE2–CE5): exam and final product
      other:["1.1","1.2","6.1","CC1 1.3","CC3 3.2"], // the 20 % block
      // Exam: a mark per section (score out of max) and the writing level. Exam mark = sum of scores / sum of maxes × 10.
      exam:{sections:[["listening","Listening"],["reading","Reading"],["vocabulary","Vocabulary"],["grammar","Grammar"],["writing","Writing"]],max:10,level:{step:"writing",c:"5.1"}},
      // Where the teacher gives one-click levels: activity + step + criteria. group: given once per final-product group and copied to each member.
      // Only the video is marked in groups (Roger, 25 Oct 2026): the research card (6.1) is a level per student in round 1.
      // c may be a pseudo criterion with its own indicators (teamwork, process). The final product rows are in the final product dialog.
      moments:[
        {a:LP2,step:"log",name:"Reading log",c:["4.1"]},
        {a:LP3,step:"chart",name:"Listening chart",c:["2.2"]},
        {a:LP4,step:"card",name:"Research card",c:["4.2","6.1","CC3 3.2"]},
        {a:FP,step:"source",name:"1 · My source",c:["4.2"]},
        {a:FP,step:"research",name:"My research card (LP4 piece 3)",c:["6.1"]},
        {a:FP,step:"part",name:"3 · My part of the pitch",c:["3.2"]},
        {a:FP,step:"email",name:"4 · My email",c:["5.1","CC1 1.3"]},
        {a:FP,step:"team",name:"Teamwork (teammates' ratings)",c:["teamwork"]},
        {a:FP,step:"process",name:"My process evidence (steps 0–5)",c:["process"]},
        {a:FP,step:"group",name:"Group rows (the video)",c:["1.1","1.2","CC3 3.2"],group:true}
      ],
      fp:{a:FP,rows:[{step:"part",c:"3.2",name:"My part",w:40},{step:"email",c:"5.1",name:"My email",w:35},{step:"source",c:"4.2",name:"My source",w:15},{step:"team",c:"teamwork",name:"Teamwork",w:5},{step:"process",c:"process",name:"Process",w:5}]},
      // Marking PDF per round (final-product-assessment.md section 8): the rubric rows come from the LS's rubric data by round, group and video
      // (peers: the teammates' average goes next to that row; process: the process summary); answers = hand-ins [activity, step, {rate: also the self-check}].
      marking:{rubric:"4eso/seasons-and-celebrations/final-rubric-data.js",process:["prep","source","contribution","part","email","team"],afterDue:["team"],
        rounds:{1:{name:"Round 1 · Research and plan",note:"Research card and steps 0–2: My source and My research card, per student",answers:[[LP4,"card"],[FP,"prep"],[FP,"source"],[FP,"contribution"]]},
          2:{name:"Round 2 · Video, email and teamwork",note:"Steps 3–5 with the full email, teamwork received and the process, and a video sheet per group",answers:[[FP,"part"],[FP,"email",{rate:true}],[FP,"team"]],peers:"team",process:true}}},
      // 60 % first-try accuracy + 40 % done by the session deadline (EL_PLAN[ls].due). optional: counted only if it raises the accuracy.
      gv:{first:60,onTime:40,
        items:[[LP2,"recall"],[LP2,"practice"],[LP2,"grammar"],[LP2,"mixed"],[LP3,"recall"],[LP3,"practice"],[LP3,"grammar"],[LP3,"mixed"],[LP4,"recall"],
          [LP5,"recall"],[LP5,"practice"],[LP5,"grammar"],[LP5,"mixed"],[LP6,"recall"],[LP6,"practice"],[LP6,"grammar"],[LP6,"register"],[CP(1),"check"],[CP(4),"check"]],
        optional:[[CP(2),"check"],[CP(3),"check"]]},
      // Other competences: per criterion, half automatic (linked steps done; first:true = counts its first-try score) and half teacher levels (average).
      auto:{
        "1.1":[[LP2,"speak"]],
        "1.2":[[LP3,"write"],[LP3,"speak"],[LP4,"respect",1]],
        "6.1":[[LP4,"notes",1],[LP4,"credit",1],[LP4,"card"]],
        "CC1 1.3":[[LP5,"write"],[LP6,"write"]],
        "CC3 3.2":[[LP4,"respect",1]]
      },
      teacher:{"1.1":[[FP,"group"]],"1.2":[[FP,"group"]],"6.1":[[LP4,"card"],[FP,"research"]],"CC1 1.3":[[FP,"email"]],"CC3 3.2":[[LP4,"card"],[FP,"group"]]},
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
        "4.1":["The log is unfinished or mostly wrong, even with the model: facts missing for one text, whole sentences copied, no word inferred.","Both texts logged with what, when, where and two customs, close to the model and often copied; one word inferred correctly.","Both texts logged accurately in short notes of their own, main customs chosen over minor details, two words inferred correctly.","Accurate, concise log without help; adds an idea that needs inference (why a custom matters) and explains how the context showed each word's meaning."],
        "4.2":["Sources rated with no reasons, or an obviously unreliable source rated as reliable (a shop blog, an anonymous post), even with the checklist.","Each source rated with one or two reasons copied from the checklist (author, date); names the one they trust most.","Each source rated correctly with two relevant reasons (author, date, purpose, channel); explains why they trust one most.","Rates on their own with precise reasons, including purpose and channel (selling, entertaining); sees the limits of a good source and compares them."],
        "2.2":["Chart missing, or it lists only facts (dates, food) and no values, even after a second viewing with subtitles.","Names one thing each speaker values (Insecure: from a list) and copies one word or phrase that shows it, with subtitles or a second viewing.","Explains in their own words what each speaker values, with a phrase from the video and a note on the tone or the images.","Explains the values with precise evidence from words, tone and images, and compares the two speakers: what they share and how they differ."],
        "3.2":["Does not prepare or record their part, or reads an unrevised text the audience cannot follow; does not take part in planning.","Records their part with the group and covers the basic content (what, when, where, customs) from a script revised with help; reads parts of it.","Plans and rehearses with the group; records a clear, complete part from a script they revised after the rehearsal (explains an unknown word, adds an example); only glances at the notes.","Leads planning or rehearsals; a fluent, well-structured part adapted to an audience that does not know the celebration, with links to the next speaker; uses feedback on their own."],
        "5.1":["Unfinished or not understandable; no clear purpose or request, or informal, even with the template.","Purpose, plan and request present, close to the template or model; future forms mostly correct; errors that do not block meaning; mostly formal.","Clear paragraphs (purpose, plan, request, closing), formal register, future forms and a relative clause used correctly; adapts the model.","Clear, well-linked and persuasive beyond the model (varied linkers, polite requests; Daring: a concern answered), few errors, corrected on their own."],
        "1.1":["Does not say what the celebration means for the people who celebrate it, or presents it in a judging way.","Says what it means in one simple sentence (\"For many Hindus, Diwali means…\") and gives one reason for it at school, close to the model.","Explains what it means for the people who celebrate it and argues for its place at school with respect for cultural diversity.","Explains the meaning with nuance (not everyone celebrates it the same way, or it has changed) and argues convincingly, linking diversity to rights or to the school community."],
        "1.2":["No link with a local celebration or no inclusive decision; or the plan includes a stereotype or a caricature costume.","One simple link (Insecure: one thing in common; Safe and Daring: one similarity and one difference) and one inclusive decision, close to the model.","A clear, fair comparison and an inclusive decision with a reason.","A comparison that builds a real link between the two cultures, and several justified decisions that foresee who could feel left out."],
        "6.1":["Fewer sources than required, copied notes, no references, or wrong information.","Required sources with key information from each, with help; references partly complete; agreement or difference missing or vague.","Required sources, key information in their own words, full references, and one point where the sources agree or differ.","Varied, well-chosen sources, organised notes, an accurate comparison, and a disagreement resolved by choosing the more reliable source."],
        "CC1 1.3":["No concrete action, or only a vague one (\"everybody can come\").","One concrete action, or two very general ones close to the model.","Two concrete, realistic actions for students and families (explaining the customs, inviting families, an alternative for those who do not celebrate it).","Two or more concrete actions with reasons, thinking of different people (families, students who do not celebrate it, newcomers)."],
        "CC3 3.2":["No stereotype named, or the pitch repeats one (images, words, costumes).","Names one stereotype in a simple sentence with help (\"Some people think…\") and says the plan avoids it, without saying why it is unfair.","Names a stereotype, explains why it is unfair, and points to a concrete choice in the plan that avoids it.","Explains why it is unfair with an example or evidence from the research, and shows several choices in the plan that challenge it."],
        teamwork:["Teammates rate them below 1.5, or they did not take part in the group work.","Teammates rate them 1.5–2.4 on average.","Teammates rate them 2.5–3.4 on average.","Teammates rate them 3.5–4 on average: did their part on time, listened and helped to improve the work."],
        process:["Most steps are missing.","One or two steps are missing.","Every step handed in; one is late or very general.","Every step handed in on time, specific and in their own words, with an honest self-assessment."]
      },
      names:{teamwork:"Teamwork",process:"Process evidence"}
    };
  })()
};
