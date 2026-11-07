// Encouraging sentences (Roger, 6 Nov 2026: "add interesting sentences for teacher (me in this case) being encouraging and optimistic",
// and for students "everyday and every student randomly gets a new one"). No Firestore reads: the pick comes from the date.
// ELCheer.teacher(day, n)  → the sentence in the "Hi, Roger! …" heading on the dashboard home (same line and font as the name): the same all day, a new one each day;
//                            n = how many times ↻ was pressed. Monday, Friday and the weekend start with their own line.
// ELCheer.student(seed, day, en) → the end of the board greeting "Hi Pau, …" (Catalan for Starter/Base, English for Core/Plus).
//                            Each student starts at a different place (seed = their email or name) and moves one sentence a day,
//                            so nobody sees the same one two days running and the whole list comes round before any repeats.
// day = "YYYY-MM-DD" (ELWeek.today()). Add sentences at the end of a list; keep the student ones short and A2-friendly.
(function(){
  const TEACHER=[
    "Every word a student learns this week is one you planted. 🌱",
    "Somewhere today, a student understood something because you explained it one more time. That counts.",
    "You built a whole learning site for more than a hundred students. That is remarkable.",
    "Small steps every class add up to big leaps by June. 🚀",
    "The quietest student in the room may be learning the most. Keep going.",
    "A good lesson isn't a perfect one. It's one where someone learns something. You do that every day.",
    "Your patience today is someone's confidence tomorrow.",
    "Learning a language is brave. Teaching one to teenagers is braver. 💪",
    "One kind comment can change how a student feels about English for years.",
    "The best teachers never stop learning. You're clearly one of them.",
    "Mistakes in class are proof that students are trying. Yours are too.",
    "Today is a fresh page. Write something good on it. ✍️",
    "Interesting fact: remembering a word from memory makes it stick better than reading it again. Your checkpoints do exactly that. 🧠",
    "Interesting fact: practice spread over several days beats cramming the night before. Your learning paths are built that way. 📅",
    "Interesting fact: saying a sentence out loud helps you remember it better than reading it in silence. Shadowing works! 🗣️",
    "Interesting fact: people remember stories much better than lists. That's why Maya and Lantern Night are worth it. 📖",
    "Interesting fact: a good night's sleep is when the brain stores what it learnt. Rest is part of the job. 😴",
    "Interesting fact: laughter lowers anxiety, and calm students speak more. A joke is a teaching tool. 😄",
    "Some of today's quiet students will remember your class in twenty years.",
    "Progress isn't always loud. Sometimes it's one more student handing in on time.",
    "You don't have to do everything today. Doing the next thing well is enough.",
    "Teaching is planting trees: the shade comes later, but it comes. 🌳",
    "Every class is a new chance, for them and for you.",
    "The energy you bring into the room is contagious. Bring the good stuff. ☀️",
    "This year, someone went from \"I can't speak English\" to \"I can try\" thanks to you.",
    "When you enjoy the topic, they notice. Curiosity is catching. 🔍",
    "A tired teacher is still a great teacher. Be kind to yourself today.",
    "All that automatic marking is time you get back. Future you says thank you. ⏳",
    "Celebrate the small wins: a correct past simple, a brave question, a finished task. 🎉",
    "Every fluent speaker was once a beginner. Your Starters are on their way.",
    "What you teach this term will travel with them: on holidays, in jobs, in friendships abroad. ✈️",
    "You're not only teaching English. You're teaching them that they can learn hard things.",
    "Done is better than perfect. Teach it, then improve it next time.",
    "Good things are happening in your classes, even on the days you don't see them. ✨",
    "A student who asks \"how do you say…?\" is a student who wants to speak. That's your doing.",
    "Strong routines make brave learners. Your classes give them both."
  ];
  const DAY={1:"New week, new possibilities. Let's make it a good one! 🚀",3:"Halfway through the week and you're doing great. 💪",
    5:"It's Friday! You made it through another week. Be proud of what you did. 🎉",6:"It's the weekend. Rest is part of great teaching too. 🌿",
    0:"It's Sunday. Recharge, the week ahead will be better for it. 🌿"};
  const STUDENT=[
    ["espero que tinguis un dia genial! ☺️","hope you are having a great day! ☺️"],
    ["a punt per aprendre alguna cosa nova avui? 🚀","ready to learn something new today? 🚀"],
    ["cada paraula que aprens compta! 🌱","every word you learn counts! 🌱"],
    ["els petits passos fan grans progressos! 💪","small steps make big progress! 💪"],
    ["ho estàs fent millor del que et penses! ⭐","you are doing better than you think! ⭐"],
    ["que bé veure't per aquí! 👋","great to see you here! 👋"],
    ["avui és un bon dia per aprendre anglès! ☀️","today is a good day to learn English! ☀️"],
    ["els errors t'ajuden a aprendre: continua provant-ho! 🙌","mistakes help you learn, so keep trying! 🙌"],
    ["fem que avui compti! ✨","let's make today count! ✨"],
    ["el teu anglès creix cada dia! 🌱","your English is growing every day! 🌱"],
    ["tu pots! 💪","you've got this! 💪"],
    ["un pas més per parlar anglès! 🗣️","one more step towards speaking English! 🗣️"],
    ["una mica de pràctica avui fa una gran diferència demà! 🌟","a little practice today makes a big difference tomorrow! 🌟"],
    ["les ments curioses aprenen ràpid: continua fent preguntes! 🔍","curious minds learn fast, so keep asking questions! 🔍"],
    ["mira quant has avançat ja! 🏔️","look how far you've come already! 🏔️"],
    ["l'anglès t'obre portes a tot el món! 🌍","English opens doors all over the world! 🌍"],
    ["diverteix-te amb l'anglès avui! 🎉","have fun with English today! 🎉"],
    ["fes-ho tan bé com puguis, és el que compta! 🙂","just do your best, that's what matters! 🙂"],
    ["un nou dia, una nova oportunitat per brillar! ✨","a new day, a new chance to shine! ✨"],
    ["l'esforç d'avui és el teu anglès de demà! 🚀","your effort today is your English tomorrow! 🚀"],
    ["continua així, vas pel bon camí! 🛤️","keep going, you're on the right track! 🛤️"],
    ["tots els experts van començar sent principiants! 🌱","every expert was once a beginner! 🌱"],
    ["espero que el teu dia estigui ple de coses bones! 🌻","I hope your day is full of good things! 🌻"],
    ["gràcies per esforçar-te tant! 👏","thanks for working so hard! 👏"],
    ["un somriure i una mica de pràctica fan molt! 😊","a smile and a bit of practice go a long way! 😊"]
  ];
  const num=d=>{const [y,m,x]=String(d).split("-").map(Number);return Math.round(Date.UTC(y,m-1,x)/864e5)};
  const hash=s=>{let h=0;for(const c of String(s||""))h=(h*31+c.codePointAt(0))>>>0;return h};
  window.ELCheer={TEACHER,STUDENT,
    teacher(day,n){n=n||0;const k=num(day),wd=((k+4)%7+7)%7,own=DAY[wd];   // 1 Jan 1970 was a Thursday
      if(own&&!n)return own;return TEACHER[(k+n-(own?1:0))%TEACHER.length]},
    student(seed,day,en){const s=STUDENT[(hash(seed)+num(day))%STUDENT.length];return en?s[1]:s[0]}};
})();
