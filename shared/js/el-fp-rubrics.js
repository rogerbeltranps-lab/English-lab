// Final product rubrics the teacher marks with, shown to students with their level shaded (Roger, 4 Nov 2026: "they should see the rubric
// … and their level shadowed"). One rubric for everyone (Roger, 3 Nov 2026: "the same requirements to pass ESO"), the same as the Classroom
// sheet "LS1 4ESO Final product rubric (Classroom, one level A2+)" in Drive. Rows in the order of the teacher's feedback parts
// ("Name (30%) · 7.5/10" lines, see fbBox in today.html). levels: titles from top to bottom; each row: name, what it checks (sub), weight w (%),
// points per level (pts) and the descriptors of the levels with points above 0 (d). Level of a part = its mark out of 10 ÷ 2.5, rounded.
window.EL_FP_RUBRICS={
  "4eso/final-product":{title:"LS1 4 ESO · Final product: My Real Routine (video)",
    note:"One rubric for everyone, about A2+ (between Base A2/A2+ and Core B1). Total 80 points; mark out of 10 = points ÷ 8.",
    levels:["Very good","Good","Fair","Developing","No evidence"],
    rows:[
      {name:"Speaking",sub:"Oral explanation of the routines",w:30,pts:[24,18,12,6,0],d:[
        "I present my classmate's routine in order (morning, after school, evening) with at least 2 ideas for each part of the day, and I say at least 1 similarity or difference with my own routine. I am easy to understand and only glance at the slides.",
        "I follow the order and say a similarity or difference, but I give fewer than 2 ideas for one part of the day, or I read 1–2 full sentences.",
        "I don't follow the order, or I don't compare with my own routine, or I read more than 2 full sentences; the main message can be understood.",
        "I explain only one part of the day, or I read everything, or I cannot be understood."]},
      {name:"Language & analysis",sub:"Accuracy and connectors",w:20,pts:[16,12,8,4,0],d:[
        "I use he/she + Present Simple with at most 1 mistake, at least 5 studied routine expressions, and 2 types of connector: cause (because) and contrast or consequence (but, so).",
        "I use he/she + Present Simple with 2–3 mistakes and at least 4 studied expressions; I use because.",
        "I make 4–5 mistakes with he/she + Present Simple, or use only 2–3 studied expressions, or don't use because.",
        "I make 6 or more mistakes or use no studied expressions; it is hard to understand what I mean."]},
      {name:"Google Slides",sub:"Content and visual support",w:10,pts:[8,6,4,2,0],d:[
        "All 5 slides are there (Title, Morning, After school, Evening, Health reflection). Each has short English sentences (2 lines at most) and an image or icon. The reflection slide judges the routine and shows 1 similarity or difference with mine.",
        "All 5 slides are there, but 1 has no image or icon, or has a long paragraph.",
        "Only 3 or 4 of the 5 slides are there, or 2 or more have long paragraphs or no image.",
        "Only 2 or fewer slides are there, or the text is too small or too long to read."]},
      {name:"Pronunciation & intonation",sub:"Shadowing: pitch, stress and rhythm",w:15,pts:[12,9,6,3,0],d:[
        "I use clear rising and falling intonation, stress key words, pause naturally between groups of words and lower my voice at the end of ideas, as in the shadowing videos. My presentation is easy to follow.",
        "I use rises and falls in most sentences and stress some key words. A few parts sound flat or have awkward pauses, but my message is clear.",
        "My voice is often flat or irregular, I rarely stress important words, and pauses sometimes break up my ideas. The main message is understood.",
        "My speech is mostly monotonous, or my pitch, pauses and pronunciation make important parts hard to understand."]},
      {name:"Interaction & reflection",sub:"Interview and healthy habits",w:15,pts:[12,9,6,3,0],d:[
        "My notes have actions, times and habits. I judge my classmate's routine (healthy, partly healthy or not very healthy) with at least 1 real interview detail, and I say if my own routine is healthier or less healthy, with a reason.",
        "I judge my classmate's routine with a real interview detail, but I don't compare it with mine, or my notes have only 2 of the 3 elements (actions, times, habits).",
        "My judgement has only a general reason (e.g. 'because it is good'), with no interview detail.",
        "There is no judgement or reason, or I talk about the person's body or weight instead of habits."]},
      {name:"Learning strategies",sub:"CE9 9.2: rehearse, review and improve",w:10,pts:[8,6,4,2,0],d:[
        "I rehearse, make a test video, watch it and improve it. At the end of the video I say in one sentence what I improved (e.g. 'After my test video, I spoke more slowly.'), and the change shows.",
        "At the end of the video I say what I improved, but the change hardly shows or the sentence is unclear.",
        "I don't say what I improved, but the video shows I rehearsed: few pauses and I look little at my notes.",
        "Nothing shows rehearsal or review: I read, stop often, or the video has problems a review would have caught (sound, camera, slides)."]}]}};
