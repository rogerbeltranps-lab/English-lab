// Activity catalogue used by pages, the student page and the teacher dashboard.
// Criteria are an editorial PROPOSAL from docs/*/ls1-my-real-routine/overview.md; pending Roger's approval.
// points: number of actions in the activity; each completed action = 1 point.
// graded:false = not evaluated (warm-up, or in-class games/theory presentations: inClass:true) - always free to practise.
// graded:true  = evaluated; enabled by the teacher and can be done ONCE (submit locks it), unless manual.
// skip: done-keys not scored (LS1 writings were practised but not corrected; "match" is vocabulary review, not submittable). From LS2 on, the
// writing of every learning path is handed in to the teacher and corrected (Roger, 1 Nov 2026: "now we will mark the writings"), so it is a
// scored step like the others: never put "write" in skip for a new LS.
// manual:true = scored by the teacher (not by counting actions); delivered through Google Classroom, not in this site.
// steps: final-product steps (id, title) whose hand-ins (state.steps in the page's key) the dashboard shows; pieces: product-pieces key.
// mode: "practice" = repeatable, "once" = can be submitted a single time.
// self: the id of the LS's self-assessment panel (shared/js/el-self.js, on the Reflect page; Roger, 2 Nov 2026): the dashboard's Self-assessment box reads it.
// LS1 My Real Routine (Roger, 25 Oct 2026): done in class and redesigned for next year; only the exam and the final product count,
// so its learning paths are graded:false (practice). Results already saved stay in Firestore.
// Beginners (Roger, 26 Oct 2026): A1, below Insecure, Catalan with heavy scaffolding; the teacher sets it. The teacher sets every route (Roger, 30 Oct 2026: students never choose one, they can only ask for a change on their board).
// Native (Roger, 30 Oct 2026): above Daring, for a native speaker preparing Cambridge C2 Proficiency (4 ESO); only the teacher sets it. Pages
// without Native content show the Daring version (applyLevel in el-cloud.js, ls2-engine.js).
// Level names (Roger, 30 Oct 2026: "no need for old names in the app any more"): the app shows only Starter · Base · Core · Plus · Pro,
// teacher dashboard included. The ids (beginners, insecure, safe, daring, native) stay in the code, the data and the docs.
window.EL_LEVELS=[{id:"beginners",name:"Starter",student:"Starter",ca:"Començo des de zero: molt suport, passos curts i instruccions en català.",en:"I am starting from zero: a lot of support, short steps and instructions in Catalan."},{id:"insecure",name:"Base",student:"Base",ca:"Necessito molt suport i pautes (instruccions en català).",en:"I need a lot of support and guidance (instructions in Catalan)."},{id:"safe",name:"Core",student:"Core",ca:"Em sento segur/a amb una mica de suport (instruccions en anglès).",en:"I feel confident with a little support (instructions in English)."},{id:"daring",name:"Plus",student:"Plus",ca:"Vull el repte: més autonomia i menys ajudes.",en:"I want the challenge: more independence and less help."},{id:"native",name:"Pro",student:"Pro",ask:false,ca:"Parlo anglès com a llengua materna i em preparo per al C2 Proficiency de Cambridge.",en:"English is my first language and I am preparing for Cambridge C2 Proficiency."}];
// Class groups. The student picks one the first time they sign in; the teacher can change it in the dashboard.
// CEFR level of each route (Roger, 31 Oct 2026: "if they are starters they should read 2ESO_starter (A1)"), from the levels document of
// the teaching programme (AGENTS.md, "Levels, listenings, videos and readings"): short label + the full description.
window.EL_CEFR={"2eso":{beginners:["A1","A1","A1"],insecure:["A1+","A1+ / A2 inicial","A1+ / early A2"],safe:["A2","A2","A2"],daring:["A2+","A2+ / B1 emergent","A2+ / emerging B1"]},
  "4eso":{beginners:["A1","A1","A1"],insecure:["A2","A2 / A2+","A2 / A2+"],safe:["B1","B1","B1"],daring:["B1+","B1 / B1+","B1 / B1+"],native:["C2","C2 Proficiency","C2 Proficiency"]}};
// Students see levels, never support descriptions such as "molt suport" (Roger, 1 Nov 2026: "they might feel judged"): route cards on LS
// pages show the short label, the board's route request shows it too, and EL_LEVELS[].ca/.en stay for the teacher only.
window.elCefr=(c,lv,full)=>{const x=((window.EL_CEFR[c]||{})[lv])||((window.EL_CEFR[c]||{})[lv==="native"?"daring":lv]);return x?(full?x[2]:x[0]):""};
// "2ESO Starter (A1)": what students read as their level (board, English Lab, practice page, level notice)
window.elLevelLabel=(c,lv)=>{const n=((window.EL_LEVELS||[]).find(l=>l.id===lv)||{}).name||lv;if(!lv)return "";const k=elCefr(c,lv);return (c?c.toUpperCase()+" ":"")+n+(k?" ("+k+")":"")};
window.elCa=l=>l==="beginners"||l==="insecure";   // routes that read instructions in Catalan
// The student's route in an LS. The teacher sets routes (Roger, 26 Oct 2026: from the LS1 exam mark, on the dashboard). An LS with
// no route of its own takes the latest route set in an earlier LS of the same course (EL_LS order), so a route carries over to every
// later LS until the teacher changes it. lv = {lsId: {level, by}}. Returns {level, from, own}: from = the LS whose route it is (null: no
// route yet); own = a route a 2 ESO student chose before 30 Oct 2026 (by:"student"; it still counts but is not shown as theirs, and
// students can no longer write it). A route the teacher set, in any LS of the course, wins over it.
// A hand-in comment that only says "no problem" (no, none, res, cap problema...) needs no answer (Roger, 30 Oct 2026)
window.elNoComment=function(c){const t=String(c||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z' ]+/g," ").replace(/\s+/g," ").trim().replace(/ (thanks|thank you|gracies|gracias)$/,"");
  return !t||/^(no|nope|none|nothing|nada|res|cap|ninguno|no comment|all good|ok|okay|fine|everything (is )?(ok|fine)|tot be|todo bien)$/.test(t)
    ||/^(no|i (do not|don't|dont) have|i have no|i had no|we (do not|don't|dont) have|we have no|we had no|no tinc|no tenim|no he tingut|no hem tingut|no tengo|no tenemos|no he tenido|no hemos tenido|cap|ningun|ninguno)( any| cap| ningun| ninguno)? (problem(s|a|es|as)?|questions?|dubtes?|dudas?|comments?|comentaris?|comentarios?)( at all)?$/.test(t)};
// A student's level (route): ONE level per course, the same in every LS (Roger, 1 Nov 2026: "why doesn't it show everywhere if I make a
// change?"). It is the route the teacher set most recently in ANY LS of the course (levels/{ls}.changed, or .updated on older docs);
// without times, this LS's own route, then the nearest earlier LS, then a later one. A route a 2 ESO student chose before 30 Oct 2026
// (by:"student") counts only while the teacher has set none. Returns {level, from: the LS whose doc holds it, own: chosen by the student}.
window.elRouteOf=function(lv,ls){if(window.EL_VIEW_LEVEL)return {level:window.EL_VIEW_LEVEL,from:ls,own:false};   // tester previewing a level (el-cloud.js viewLevel)
  lv=lv||{};const L=window.EL_LS||[],me=L.find(x=>x.id===ls),
    ids=[ls].concat(me?L.slice(0,L.indexOf(me)).reverse().filter(x=>x.course===me.course).map(x=>x.id):[],
      me?L.slice(L.indexOf(me)+1).filter(x=>x.course===me.course).map(x=>x.id):[]),
    ms=x=>!x?0:typeof x.toMillis==="function"?x.toMillis():typeof x==="string"?Date.parse(x)||0:typeof x==="number"?x:x.seconds!=null?x.seconds*1000:0,
    pick=mine=>{let best=null,bt=-1;for(const id of ids){const l=lv[id]||{};if(!l.level||(l.by==="student")!==mine)continue;
      const t=ms(l.changed)||ms(l.updated);if(t>bt){best={level:l.level,from:id,own:mine};bt=t}}return best};
  return pick(false)||pick(true)||{level:null,from:null,own:false}};
// Route from the LS1 exam mark (out of 10), default cut-offs per course: under beginners → Starter, under insecure → Base,
// under safe → Core, otherwise Plus (Roger, 30 Oct 2026: under 3 Starter, 3 to under 6 Base, 6 to under 8 Core, 8 or more Plus).
// Roger can change them on the dashboard (settings/routes in Firestore overrides these). Pro is never given by a mark.
window.EL_ROUTE_CUTS={"2eso":{beginners:3,insecure:6,safe:8},"4eso":{beginners:3,insecure:6,safe:8}};
window.elRouteFromMark=(m,c)=>m==null||isNaN(m)?null:m<c.beginners?"beginners":m<c.insecure?"insecure":m<c.safe?"safe":"daring";
window.EL_GROUPS=[{id:"2ESOA",course:"2eso",name:"2ESO A"},{id:"2ESOB",course:"2eso",name:"2ESO B"},{id:"4ESOA",course:"4eso",name:"4ESO A"},{id:"4ESOB",course:"4eso",name:"4ESO B"}];
// Is an LS assigned to a group? ls/{id}.groups lists the groups (set in the teacher dashboard); without it, every group of the LS's course.
window.elLsForGroup=function(ls,info,gid){const g=(window.EL_GROUPS||[]).find(x=>x.id===gid);if(!g||!ls)return false;return info&&Array.isArray(info.groups)?info.groups.includes(gid):g.course===ls.course};
// study (optional): start of the path of the vocabulary and grammar summary PDFs; the board adds the route + ".pdf".
// story (optional): the LS's reading story (tools/reading-story): title, start of the PDF path, key = the Drive doc with the answer key and teacher notes (only on the teacher's Materials tab); the LS home page adds the route + ".pdf" (and "cover.jpg").
// shadowing (optional): the LS's shadowing video (tools/shadowing-video), the same for every route: on the board next to the summary and in the dashboard's Materials tab.
window.EL_LS=[
  {id:"2eso-my-real-routine",course:"2eso",title:"2ESO · My Real Routine",study:"2eso/my-real-routine/downloads/ls1-vocabulary-grammar-"},
  {id:"4eso-my-real-routine",course:"4eso",title:"4ESO · My Real Routine",study:"4eso/my-real-routine/downloads/ls1-vocabulary-grammar-",pro:true},
  {id:"4eso-seasons-and-celebrations",course:"4eso",title:"4ESO · Seasons & Celebrations",study:"4eso/seasons-and-celebrations/downloads/ls2-vocabulary-grammar-",pro:true,starter:true,shadowing:"4eso/seasons-and-celebrations/video/shadowing.mp4",story:{title:"Lantern Night",pdf:"4eso/seasons-and-celebrations/downloads/ls2-story-",key:"https://docs.google.com/document/d/1uc108nk9jxlfhAaJ0Z-vzAxZbq_qI_3dMHs3akKIu7A/edit"}},
  {id:"2eso-free-time-live",course:"2eso",title:"2ESO · Free Time, Live!",study:"2eso/free-time-live/downloads/ls2-vocabulary-grammar-",starter:true,shadowing:"2eso/free-time-live/video/shadowing.mp4",story:{title:"Maya Live!",pdf:"2eso/free-time-live/downloads/ls2-story-",key:"https://docs.google.com/document/d/1rcikmXonPtG8HFXzcim26QEm0Rbe1X0LavRPOSUYtuk/edit"}}
];
window.EL_CATALOG=(function(){
  const base=c=>c+"/my-real-routine/";
  const A=(course,file,title,criteria,keys,points,o)=>(a=>(a.mode=a.mode||(a.graded&&!a.manual?"once":"practice"),a))(Object.assign({id:course+"/"+file.replace(".html",""),ls:course+"-my-real-routine",course,path:base(course)+file,title,criteria,keys,points,graded:true},o||{}));
  return [
    A("2eso","getting-started.html","Getting started (warm-up)",["3.1"],["gettingStarted2ESO"],4,{graded:false}),
    A("2eso","a-day-in-my-life.html","A day in my life",["3.1","5.1"],["lp2StateV2"],8,{skip:["write","match"],graded:false}),
    A("2eso","same-day-different-person.html","Same day, different person",["3.1","5.1"],["s2SameDayState"],3,{skip:["write","match"],graded:false}),
    A("2eso","present-simple-grammar.html","Present simple grammar",["5.1"],["s2GrammarState"],5,{graded:false}),
    A("2eso","healthy-habits.html","Healthy habits",["3.1","5.1"],["healthyHabitsState2ESO"],8,{skip:["write","match"],graded:false}),
    A("2eso","vocabulary-games.html","Vocabulary games",["5.1"],[],0,{graded:false,inClass:true}),
    A("2eso","final-product.html","Final product",["3.1","3.2","3.3","5.1","9.2"],["finalProduct2ESO"],0,{manual:true}),
    A("4eso","getting-started.html","Getting started (warm-up)",["3.1"],["gettingStarted4ESO"],4,{graded:false}),
    A("4eso","a-day-in-real-life.html","A day in real life",["3.1","5.1"],["lp2StateV2_4ESO"],8,{skip:["write","match"],graded:false}),
    A("4eso","useful-expressions.html","Useful expressions",["3.1","5.1"],["s3Real4State"],4,{skip:["write"],graded:false}),
    A("4eso","grammar-phrasal-verbs.html","Grammar: phrasal verbs",["5.1"],["s4GrammarState"],5,{graded:false}),
    A("4eso","healthy-habits.html","Healthy habits",["3.1","5.2"],["healthyHabitsState4ESO"],8,{skip:["write","match"],graded:false}),
    A("4eso","vocabulary-games.html","Vocabulary games",["5.1"],[],0,{graded:false,inClass:true}),
    A("4eso","final-product.html","Final product",["3.1","3.2","3.3","5.1","5.2","9.2"],["finalProduct4ESO"],0,{manual:true}),
    ...(function(){
      // LS2: ids carry the LS so they never clash with My Real Routine pages of the same name.
      const L=(file,title,criteria,key,points,o)=>A("4eso",file,title,criteria,[key],points,Object.assign({id:"4eso/ls2-"+file.replace(".html",""),ls:"4eso-seasons-and-celebrations",path:"4eso/seasons-and-celebrations/"+file},o||{}));
      const C={mode:"practice",checkpoint:true};   // recall checkpoint: opens the way to what comes after it (elCheckpointMissing)
      return [
        L("getting-started.html","Getting started: Castanyada & Halloween (warm-up)",["4.1","2.2"],"ls2GettingStarted4ESO",5,{graded:false}),
        L("celebrations-around-the-world.html","Celebrations around the world",["4.1","2.2","5.1","3.2","1.1"],"ls2Celebrations4ESO",10,{steps:[["log","Reading log"]]}),
        L("recall-checkpoint-1.html","Recall checkpoint 1",["4.1","5.1"],"ls2Checkpoint14ESO",1,C),
        L("where-traditions-come-from.html","Where traditions come from",["2.2","5.1","1.2","3.2"],"ls2Traditions4ESO",11,{steps:[["chart","Listening chart"],["talk","Talk"]]}),
        L("recall-checkpoint-2.html","Recall checkpoint 2",["4.1","5.1"],"ls2Checkpoint24ESO",1,C),
        L("research-it-right.html","Research it right",["4.2","6.1","1.2","CC3 3.2"],"ls2Research4ESO",10,{steps:[["card","Research card"],["talk","Talk"]]}),
        L("plan-the-day.html","Plan the day",["2.2","5.1","3.2","CC1 1.3"],"ls2Plan4ESO",11,{steps:[["talk","Talk"]]}),
        L("recall-checkpoint-3.html","Recall checkpoint 3",["4.1","5.1"],"ls2Checkpoint34ESO",1,C),
        L("write-to-the-head-teacher.html","Write to the head teacher",["4.1","5.1","3.2","CC1 1.3"],"ls2Email4ESO",11,{steps:[["talk","Talk"]]}),
        L("recall-checkpoint-4.html","Recall checkpoint 4",["4.1","5.1"],"ls2Checkpoint44ESO",1,C),
        L("sample-exam.html","Sample exam",["2.2","4.1","5.1"],"ls2SampleExam4ESO",7,{graded:false}),
        L("celebration-day-proposal.html","Final product: Celebration Day Proposal",["1.1","1.2","3.2","4.2","5.1","6.1","CC1 1.3","CC3 3.2"],"ls2FinalProduct4ESO",0,{manual:true,steps:[["prep","0 · My pieces"],["source","1 · My source"],["contribution","2 · My contribution"],["part","3 · My part"],["email","4 · My email"],["feedback","Feedback to a group"],["team","5 · Teamwork"]],pieces:"ls2Products4ESO"}),
        L("reflect.html","Reflect",[],"ls2Reflect4ESO",2,{graded:false,self:"self"})
      ];
    })(),
    ...(function(){
      // 2ESO LS2 Free Time, Live! (built from the 4ESO LS2 model; docs/2eso/ls2-free-time-live/). Individual vlog, so no group steps.
      const L=(file,title,criteria,key,points,o)=>A("2eso",file,title,criteria,[key],points,Object.assign({id:"2eso/ls2-"+file.replace(".html",""),ls:"2eso-free-time-live",path:"2eso/free-time-live/"+file},o||{}));
      const C={mode:"practice",checkpoint:true};   // recall checkpoint: opens the way to what comes after it (elCheckpointMissing)
      return [
        L("getting-started.html","Getting started: what do you do in your free time? (warm-up)",["4.1","2.2"],"ls2GettingStarted2ESO",6,{graded:false}),
        L("what-are-they-doing.html","What are they doing?",["4.1","2.2","5.1","3.2"],"ls2Doing2ESO",13,{steps:[["log","Reading log"],["talk","Talk"]]}),
        L("recall-checkpoint-1.html","Recall checkpoint 1",["4.1","5.1"],"ls2Checkpoint12ESO",1,C),
        L("now-or-usually.html","Now or usually?",["2.2","5.1","3.2"],"ls2NowUsually2ESO",11,{steps:[["chart","Listening chart"],["talk","Talk"]]}),
        L("recall-checkpoint-2.html","Recall checkpoint 2",["4.1","5.1"],"ls2Checkpoint22ESO",1,C),
        L("check-the-source.html","Check the source",["4.2","6.2"],"ls2Source2ESO",10,{steps:[["factfile","Fact file"],["talk","Talk"]]}),
        L("likes-and-screen-tips.html","Likes and screen tips",["2.2","5.1","3.2","CD4 4.5"],"ls2Tips2ESO",11,{steps:[["talk","Talk"]]}),
        L("recall-checkpoint-3.html","Recall checkpoint 3",["4.1","5.1"],"ls2Checkpoint32ESO",1,C),
        L("write-your-vlog-script.html","Write your vlog script",["4.1","5.1","3.2"],"ls2Script2ESO",11,{steps:[["talk","Talk"]]}),
        L("recall-checkpoint-4.html","Recall checkpoint 4",["4.1","5.1"],"ls2Checkpoint42ESO",1,C),
        L("sample-exam.html","Sample exam",["2.2","4.1","5.1"],"ls2SampleExam2ESO",7,{graded:false}),
        L("free-time-vlog.html","Final product: Free Time Vlog",["3.2","4.2","5.1","6.2","CD2 2.2","CD4 4.5"],"ls2FinalProduct2ESO",0,{manual:true,steps:[["prep","0 · My pieces"],["source","1 · My source"],["slides","2 · My slides"],["script","3 · My script"],["edit","4 · Record and edit"],["feedback","Feedback for my buddy"],["tips","5 · My tip"]],pieces:"ls2Products2ESO"}),
        L("reflect.html","Reflect",[],"ls2Reflect2ESO",2,{graded:false,self:"self"})
      ];
    })()
  ];
})();
// Number of distinct completed actions (truthy keys inside any "done" map) in a synced localStorage state string.
window.elDone=function(str,skip){skip=skip||[];const s=new Set();try{(function w(o){if(o&&typeof o==="object"){for(const k in o){if(k==="done"&&o[k]&&typeof o[k]==="object"){for(const d in o[k])if(o[k][d]&&!skip.includes(d))s.add(d)}else w(o[k])}}})(JSON.parse(str))}catch(e){}return s.size};
// Points of an activity from the current localStorage (capped at the activity's total).
window.elPoints=function(a,get){const g=get||(k=>localStorage.getItem(k));let n=0;a.keys.forEach(k=>n+=elDone(g(k),a.skip));return Math.min(n,a.points)};
// An activity's score on the dashboards: 1 point per step done (elPoints, the count the page itself saves), counted again from the saved
// progress (pg = the LS's progress data) whenever it is there, so it always matches the ✔ steps. The saved result
// (results/{activity}.score of max) can be older: a student who pressed Submit with 1 step done kept 1/10 for good, because
// firestore.rules freeze a submitted result, while the progress kept growing (Roger, 4 Nov 2026: "I don't understand this score").
// The saved result is used only when there is no progress, and always for the final product (the teacher's mark). → {score, max} or null.
window.elScore=function(a,x,pg){if(a.manual||!a.graded||!pg||!a.keys.some(k=>pg[k]))return x?{score:x.score||0,max:x.max||a.points}:null;
  return {score:elPoints(a,k=>pg[k]||null),max:a.points}};
// Steps the teacher has corrected (results/{activity}.replies[step]) that the progress does not mark as done (Roger, 4 Nov 2026: "he did it
// but he sees that, why?"). Before 1 Nov a writing went to ChatGPT first and was done only once the final version was saved; many students
// stopped after the draft, and the Wednesday run corrects drafts too (fbItems in el-marking.js). A corrected step counts as done, unless
// the teacher sent it back to redo (flags[step].done = "redo"). → [step ids]
window.elCorrected=function(a,r){const rp=(r&&r.replies)||{},fl=(r&&r.flags)||{};
  return ((window.EL_ACTIONS||{})[a.id]||[]).filter(k=>String(rp[k]||"").trim()&&!(fl[k]&&fl[k].done==="redo"))};
// The same in a student's loaded progress, in memory only (nothing is saved): pg = {ls: {key: state JSON}}, rs = {activity id: result}.
// Each corrected step gets done[step] and, when it has none, doneAt[step] = the day the text was first saved (draft or final version).
window.elInjectCorrected=function(pg,rs){if(!pg||!rs)return;(window.EL_CATALOG||[]).forEach(a=>{if(a.manual||!a.keys||!a.keys.length)return;
  const ks=elCorrected(a,rs[a.id]);if(!ks.length)return;const L=pg[a.ls];if(!L)return;let st;try{st=JSON.parse(L[a.keys[0]]||"{}")}catch(e){return}
  let ch=false;ks.forEach(k=>{if((st.done||{})[k])return;(st.done=st.done||{})[k]=true;ch=true;
    const at=[st.drafts,st.finals].flatMap(o=>Object.entries(o||{}).filter(([x])=>x===k||x.indexOf(k+"_")===0).map(([,v])=>v&&v.at)).filter(Boolean).sort()[0]||((st.steps||{})[k]||{}).date;
    if(at)(st.doneAt=st.doneAt||{})[k]=(st.doneAt||{})[k]||at});
  if(ch)L[a.keys[0]]=JSON.stringify(st)})};
// Every step of a learning path done (Roger, 4 Nov 2026: "some students have that they did everything and that the bonus counts, however
// this is not true"): the steps themselves (EL_ACTIONS without the not-scored ones), never the Submit or "Mark as done" flag, which a
// student can press with 1 step of 10 done. done = Set of the student's done steps, r = results/{activity}; an activity with no steps
// listed falls back to the flag. Used by the bonus (All work), the student's missing list and every ✅ Done.
window.elAllDone=function(a,done,r){const req=((window.EL_ACTIONS||{})[a.id]||[]).filter(k=>!(a.skip||[]).includes(k));
  if(req.length)return req.every(k=>done.has(k));r=r||{};return !!(r.locked||r.markedDone)};
window.elToday=function(){const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};

// Actions (steps) inside each activity, as recorded in the "done" maps. 'note' = not scored.
window.EL_ACTIONS={
  "2eso/getting-started":["quick","listen","read","speak"],"4eso/getting-started":["quick","listen","read","speak"],
  "2eso/a-day-in-my-life":["explore","cards","words","match","practice","listen","reading","build","write","speaking"],
  "2eso/healthy-habits":["explore","cards","words","match","practice","listen","reading","build","write","speaking"],
  "4eso/a-day-in-real-life":["explore","cards","words","match","practice","listen","reading","build","write","speaking"],
  "4eso/healthy-habits":["explore","cards","words","match","practice","listen","reading","build","write","speaking"],
  "2eso/same-day-different-person":["cards","forms","match","speak","write"],
  "4eso/useful-expressions":["cards","evening","organise","speak","write"],
  "2eso/present-simple-grammar":["recognise","controlled","transform","edit","selfcheck"],
  "4eso/grammar-phrasal-verbs":["recognise","controlled","transform","edit","selfcheck"],
  "2eso/final-product":["notes","prepare","record","submit"],"4eso/final-product":["notes","prepare","record","submit"]
};
// PROPOSAL (pending review): which action gives evidence for which criterion. Other actions are language practice.
window.EL_EVIDENCE={speaking:["3.1"],speak:["3.1"],record:["3.1"],write:["5.1"],build:["5.1"],prepare:["5.1"],notes:["5.1"]};
// Set of completed action keys in a synced state string.
window.elDoneSet=function(str){const s=new Set();try{(function w(o){if(o&&typeof o==="object"){for(const k in o){if(k==="done"&&o[k]&&typeof o[k]==="object"){for(const d in o[k])if(o[k][d])s.add(d)}else w(o[k])}}})(JSON.parse(str))}catch(e){}return s};
// Learning paths open per group (Roger, 26 Oct 2026: "so they don't do them before I ask"): the teacher opens or locks every activity
// of an LS for each group (dashboard → LS settings), stored as ls/{id}.open[group] = [activity ids]. A group without that list keeps the
// old rule: practice always open, graded activities only when in ls/{id}.enabled. elLpLocks gives what firestore.rules check:
// locked[group] (activity ids, for results) and lockedKeys[group] (their saved keys, for progress; key + "Level" is the route the page keeps).
window.elLpOpen=function(a,info,gid){const o=info&&info.open&&info.open[gid];return Array.isArray(o)?o.includes(a.id):!a.graded||((info&&info.enabled)||[]).includes(a.id)};
// Sections inside a learning path (Roger, 26 Oct 2026: "even in the learning path, I want to open these sections as I teach"): the section
// tabs the teacher has locked for a group, ls/{id}.secLocked[group][activity id with "/" as "__"] = panel ids (EL_SECTIONS in el-sections.js),
// and the ones opened at some point, ls/{id}.secOpened[group][same key]. None locked = every section open. A locked section is read-only
// on the page (el-cloud.js lockSections): students see it with their saved answers. The saved state is one JSON per page, so the rules cannot check them.
const secKey=a=>a.id.replace("/","__"),secOf=(info,f,gid,a)=>{const g=info&&info[f]&&info[f][gid];return g&&g[secKey(a)]};
window.elSecLocked=function(a,info,gid){return secOf(info,"secLocked",gid,a)||[]};
// Steps a section holds (EL_ACTIONS keys): its panel id, or the cards and practice steps for a vocabulary section; none for info panels.
window.elSecSteps=function(a,id){const ks=(window.EL_ACTIONS||{})[a.id]||[];return id==="vocab"?ks.filter(k=>k==="cards"||k==="practice"):ks.includes(id)?[id]:[]};
const secDone=(a,id,done)=>{const st=elSecSteps(a,id);return st.length>0&&st.every(k=>done.has(k))};
// Roger (26 Oct 2026): sections he has opened stay on the student's to-do until they finish them, so a section opened before and locked
// again stays open for a student who has not finished it; it is read-only for everyone else. done = Set of the student's done steps.
window.elSecLockedFor=function(a,info,gid,done){const op=secOf(info,"secOpened",gid,a)||[];return elSecLocked(a,info,gid).filter(id=>!(op.includes(id)&&elSecSteps(a,id).length&&!secDone(a,id,done)))};
// Sections still to finish (the to-do list): only in a learning path where the teacher uses the section switches, a section that is open
// or was opened before, holds steps and has some not done. Returns [[panel id, name]].
window.elSecPending=function(a,info,gid,done){const lk=secOf(info,"secLocked",gid,a);if(!Array.isArray(lk))return [];const op=secOf(info,"secOpened",gid,a)||[];
  return ((window.EL_SECTIONS||{})[a.id]||[]).filter(([id])=>(!lk.includes(id)||op.includes(id))&&elSecSteps(a,id).length&&!secDone(a,id,done))};
// ✅ To do (Roger, 6 Nov 2026: "When I open a section it must be set as to do. So in each class I open a section or LP and they see it as
// to do. They are only homework if I say so (I can say that a LP is homework or only a section)"): every learning path of an open LS that
// the teacher has opened for the group (elLpOpen) and the student has not finished, with its tabs that are open for them (elSecLockedFor:
// not locked, or opened before and not finished) and hold steps not done yet. Opening is enough: nothing else to set. Dropped paths and the
// final product handed in on Classroom are left out. Homework is separate: only what the teacher sets with 🏠 Set as homework (elHwTargets).
// The board's ✅ To do and the floating ✅ To do button (el-todo.js) use it. p, gi = the group's plan (or null, -1); doneOf(a) = Set of the
// student's done steps; isDone(a) = every step done. Returns [{a, tabs: [[panel id, name]], due, late, cp}] in the order of the plan
// (due day, then the LS's order); cp = the recall checkpoint to do first (elCheckpointMissing), or null.
window.elTodoList=function(ls,info,gid,doneOf,isDone,p,gi){const st=info&&info.status==="public"?"open":info&&info.status;if(st!=="open"||!gid)return [];
  const W=window.ELWeek,today=W?W.today():new Date().toISOString().slice(0,10),dr=(p&&gi>=0&&(p._dropped||{})[gi])||[],due=a=>p&&gi>=0&&W?W.due(p,a.id,gi):null;
  return (window.EL_CATALOG||[]).filter(a=>a.ls===ls).map((a,i)=>({a,i,d:due(a)})).filter(({a})=>!a.manual&&!dr.includes(a.id)&&elLpOpen(a,info,gid)&&!isDone(a))
    .sort((x,y)=>(x.d||"~")<(y.d||"~")?-1:(x.d||"~")>(y.d||"~")?1:x.i-y.i)
    .map(({a,d})=>{const done=doneOf(a),secs=(window.EL_SECTIONS||{})[a.id]||[],off=secs.length?elSecLockedFor(a,info,gid,done):[];
      const tabs=secs.filter(([id])=>!off.includes(id)&&elSecSteps(a,id).length&&!secDone(a,id,done));
      if(secs.length&&!tabs.length)return null;   // what is open is done; the rest is still locked
      return {a,tabs,due:d,late:!!(d&&d<today),cp:elCheckpointMissing(a,doneOf,y=>elLpOpen(y,info,gid))}}).filter(Boolean)};
// "LP3" in the group's plan → its learning path ("LP3 Where traditions come from" somewhere in the plan): {"3": activity}
window.elLpNumMap=function(ls,p,gi){const m={},acts=(window.EL_CATALOG||[]).filter(a=>a.ls===ls),sh=x=>String(x).split(/[:(]/)[0].trim().toLowerCase();
  ((p&&p.rows)||[]).forEach(r=>String(r.g?r.g[gi]||"":r.what||"").replace(/LP(\d+) ([A-Z][^(\n·]*)/g,(_,n,name)=>{const nm=name.trim().toLowerCase(),a=acts.find(y=>sh(y.title).startsWith(nm)||nm.startsWith(sh(y.title)));if(a&&!m[n])m[n]=a}));
  return m};
// What a homework covers (🏠 Homework on the board and in el-todo.js): {activity id: [panel ids]} ([] = the whole learning path), or null.
// x = an item of ELWeek.tasks. Homework set on the dashboard since 6 Nov 2026 saves it (x.tabs); older ones and the plan's "Homework by …"
// lines are read from their text: "LP3 Speaking and Talk", "LP3 Where traditions come from: Speaking, Talk" (tab names of that path; none
// named = the whole path; words in brackets are left out, e.g. "(Speaking and Talk after the exam)").
window.elHwTargets=function(x,ls,p,gi){if(!x||x.kind!=="hw")return null;if(x.tabs&&typeof x.tabs==="object"&&Object.keys(x.tabs).length)return x.tabs;
  const m=elLpNumMap(ls,p,gi),out={},txt=String(x.text||"").replace(/\([^)]*\)/g," "),parts=txt.split(/(?=\bLP\d+\b)/);
  parts.forEach(seg=>{const n=(seg.match(/^LP(\d+)\b/)||[])[1],a=n&&m[n];if(!a)return;const s=seg.replace(/^LP\d+\s*/,"").toLowerCase();
    const ids=((window.EL_SECTIONS||{})[a.id]||[]).filter(([id,nm])=>elSecSteps(a,id).length&&new RegExp("(^|[^a-z])"+String(nm).toLowerCase().replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"($|[^a-z])").test(s)).map(z=>z[0]);
    out[a.id]=[...new Set([...(out[a.id]||[]),...ids])]});
  return Object.keys(out).length?out:null};
// Pull up a learning path (Roger, 2 Nov 2026: "students find it difficult to find the learning path … I go to the LS and pull it up for the
// A or B group"): the teacher puts one learning path (and maybe one of its tabs) on a group's screens from the dashboard, the Time plan or
// the learning path page in teacher mode. ls/{id}.push[group] = {a: activity id, p: panel id or "", pn: tab name, t: label "LP3 …", at: ms}
// or null (taken down). Students get a big "Open it" card on their board and a bar on every page of that LS. The newest one counts, while
// its learning path is open for the group, and for EL_PULL_DAYS days at most. infos = {lsId: ls info} (lsInfo in el-cloud.js).
// A pull-up made during a class carries until = the end of that class (elClassEnd in el-plan.js): then it is over, like "Release them".
window.EL_PULL_DAYS=7;
window.elPullLive=x=>!!(x&&x.a&&x.at&&Date.now()-x.at<EL_PULL_DAYS*864e5&&!(x.until&&Date.now()>=x.until));
window.elPullFor=function(infos,gid){let best=null;
  for(const [ls,info] of Object.entries(infos||{})){const x=info&&info.push&&info.push[gid];if(!elPullLive(x))continue;
    const a=(window.EL_CATALOG||[]).find(y=>y.id===x.a),l=(window.EL_LS||[]).find(y=>y.id===ls);
    if(!a||(info.status||"hidden")==="hidden"||!elLsForGroup(l,info,gid)||!elLpOpen(a,info,gid))continue;
    if(!best||x.at>best.at)best=Object.assign({ls,act:a},x)}
  return best};
// ⛶ 📴 Who left full screen and who is not connected in class (Roger, 6 Nov 2026: "when they are playing a game, I want them to be in full
// screen too; if I pull them they should be in full screen. If they disconnect, the teacher's board shows it"). x = live/{group} (fs, the
// class game: game, on, phase, sid, at), left = live/{group}/fsLeft docs {name, at, pull, n}, here = live/{group}/here docs {name, seen, off}
// (every student page beats every EL_BEAT_MS while full screen or a game is on; off:true when the page is hidden: lid closed, other window).
// A session is the full screen (fs.at) and/or the game (sid). Not connected = beat during this session, then off or no beat for EL_HERE_MS.
window.EL_BEAT_MS=60e3;window.EL_HERE_MS=150e3;
const elMs=t=>t&&t.toMillis?t.toMillis():typeof t==="number"?t:0;
window.elFsOn=f=>!!(f&&f.on&&f.at&&Date.now()<(f.until||f.at+70*60e3));
// 🗓 The timetable of a group (Roger, 6 Nov 2026: "according to the teacher's timetable students should go full screen when they have
// class"; "I want a section where the teacher can add the schedule"): tt = {slots: ["Tue 12:00", …], off: ["YYYY-MM-DD" | [from, to]],
// len: minutes}. The teacher edits it on the dashboard (🗓 Timetable: settings/timetable) and every group's copy goes into live/{group}.tt,
// the document every student page already listens to, so students need no extra read. elTT(gid) = the group's tt from window.EL_TIMETABLE.
window.elTT=gid=>{const T=window.EL_TIMETABLE;return T&&T.groups&&T.groups[gid]?{slots:T.groups[gid],off:T.off||[],len:T.len||60}:null};
// days off as [from, to] pairs: "YYYY-MM-DD", ["from", "to"] or "from/to" (Firestore keeps no arrays inside arrays, so stored ones use "from/to")
window.elOffList=off=>(off||[]).map(o=>Array.isArray(o)?[o[0],o[1]||o[0]]:String(o).includes("/")?String(o).split("/"):[String(o),String(o)]);
window.elTTStore=T=>({groups:Object.assign({},T.groups),off:elOffList(T.off).map(([a,b])=>a===b?a:a+"/"+b),len:+T.len||60});
window.elTTRead=o=>({groups:Object.assign({},o.groups),off:elOffList(o.off).map(([a,b])=>a===b?a:[a,b]),len:+o.len||60});
// the class going on at `at` (ms): {start, end} in ms, from 5 minutes before it starts until it ends, or null (no class, a day off)
window.elSlotNow=function(tt,at){if(!tt||!tt.slots)return null;const d=new Date(at||Date.now()),len=+tt.len||60;
  const ymd=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
  if(elOffList(tt.off).some(o=>o[0]<=ymd&&ymd<=o[1]))return null;
  const dn=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()],m=d.getHours()*60+d.getMinutes(),z=new Date(d);z.setHours(0,0,0,0);
  for(const sl of tt.slots){const x=String(sl).match(/^(\w{3}) (\d{1,2}):(\d\d)$/);if(!x||x[1]!==dn)continue;const s=+x[2]*60+ +x[3];
    if(m>=s-5&&m<s+len)return {start:z.getTime()+s*60e3,end:z.getTime()+(s+len)*60e3}}
  return null};
// ⛶ Full screen by the timetable (Roger, 6 Nov 2026: "no need to release since they get released after the class"): during a class of the
// group it is on by itself ({on, at: the start of the class, until: its end, auto: true}) and it ends with the class. The teacher's switch
// (live/{group}.fs) still counts: {on: true, …} turns it on outside a class; {on: false, off: true, until: end of the class} switches it
// off for that class only. Returns the full screen in force now, or null.
window.elFsEff=function(fs,tt,at){const now=at||Date.now(),c=elSlotNow(tt,now);
  if(fs&&fs.at&&now<(fs.until||fs.at+70*60e3)){if(fs.on)return fs;if(fs.off&&c&&fs.until>=c.end)return null}
  return c?{on:true,at:c.start,until:c.end,auto:true}:null};
// 🎓 Class mode (Roger, 6 Nov 2026: "instead of pulling students to the LS, I want to go class mode, and this makes students go wherever
// you are in the LS"): live/{group}.go = {cm: true, u: page path from the site root, p: tab or "", pn: tab name, t: page title, at, s: when
// class mode started, lock: true, until}. Written by the teacher's class tab each time it moves (el-cloud.js cmSend); open student pages go there.
window.elCmOn=g=>!!(g&&g.cm&&g.u&&g.at&&Date.now()<(g.until||g.at+70*60e3));
window.elGameOn=x=>!!(x&&x.game&&x.on&&x.phase!=="end"&&Date.now()-elMs(x.at)<10*60e3);
window.elClassWatch=function(x,left,here){const fs=x&&x.fs,fo=elFsOn(fs),go=elGameOn(x),now=Date.now(),keys=[];
  if(fo)keys.push(fs.at);if(x&&x.sid&&(go||fo&&x.sid>=fs.at))keys.push(x.sid);
  if(!keys.length)return {active:false,fs:false,game:false,left:[],off:[]};
  const t0=Math.min(...keys)-60e3;   // a minute for the difference between the teacher's clock and the server's
  return {active:true,fs:fo,game:go,title:go?x.title||"":"",t0,
    left:(left||[]).filter(y=>keys.includes(y.pull)).sort((p,q)=>elMs(q.at)-elMs(p.at)),
    off:(here||[]).filter(y=>elMs(y.seen)>=t0&&(y.off||now-elMs(y.seen)>EL_HERE_MS)).sort((p,q)=>elMs(q.seen)-elMs(p.seen))}};
// The whole group, in or out (Roger, 6 Nov 2026: "I want to see not who's left but who is in and who is out … the students we have"):
// roster = [{e: email, name}] (the group's student list; anyone else who beat in this session is added). here and left docs carry e (their id).
// In = connected now and in full screen (here.fs: true also where the page needs none: checkpoints, iPhones). Out, with why:
// "full" out of full screen (left: when and how many times), "lost" no beat for EL_HERE_MS, "closed" screen closed or another window,
// "never" not connected in this session (absent, not signed in, or on a page that does not load el-cloud.js).
window.elClassRoll=function(x,left,here,roster){const w=elClassWatch(x,left,here);w.inn=[];w.out=[];if(!w.active)return w;const now=Date.now();
  const H={},Lf={},who=new Map();(here||[]).forEach(y=>{if(y.e)H[y.e]=y});w.left.forEach(y=>{if(y.e)Lf[y.e]=y});
  (roster||[]).forEach(r=>who.set(r.e,r.name||r.e.split("@")[0]));
  Object.values(H).forEach(y=>{if(!who.has(y.e)&&elMs(y.seen)>=w.t0)who.set(y.e,y.name||y.e.split("@")[0])});
  for(const [e,name] of who){const h=H[e],l=Lf[e],seen=h&&elMs(h.seen)>=w.t0?elMs(h.seen):0,live=seen&&!h.off&&now-seen<=EL_HERE_MS,o={e,name,left:l||null,seen};
    if(live&&h.fs!==false)w.inn.push(o);else{o.why=live?"full":seen?(h.off?"closed":"lost"):"never";w.out.push(o)}}
  const rank={full:0,closed:1,lost:2,never:3},az=(a,b)=>a.name.localeCompare(b.name);
  w.inn.sort(az);w.out.sort((a,b)=>rank[a.why]-rank[b.why]||az(a,b));w.n=who.size;return w};
// "LP3 Where traditions come from": the number the time plan gives the learning path (EL_PLAN text "LP3 Where traditions …"), else its short title.
window.elLpLabel=function(a){const sh=t=>String(t).split(/[:(]/)[0].trim(),st=sh(a.title),lo=st.toLowerCase(),p=(window.EL_PLAN||{})[a.ls];let n=null;
  if(p)(p.rows||[]).forEach(r=>[].concat(r.g||r.what||[]).join("\n").replace(/LP(\d+) ([A-Z][^(\n·]*)/g,(_,k,nm)=>{nm=nm.trim().toLowerCase();if(!n&&nm&&(lo.startsWith(nm)||nm.startsWith(lo)))n=k}));
  return (n?"LP"+n+" ":"")+st};
window.elLpLocks=function(ls,open){const shut=(window.EL_CATALOG||[]).filter(a=>a.ls===ls&&!open.includes(a.id));
  return {locked:shut.map(a=>a.id),lockedKeys:shut.flatMap(a=>a.keys.flatMap(k=>[k,k+"Level"]))}};
// Recall checkpoints open the way (Roger, 26 Oct 2026): an activity that comes after a checkpoint in its LS (catalogue order = LS page
// order) opens only when every earlier checkpoint is done. Only checkpoints the student can do count (enabled(x)), so a checkpoint the
// teacher has not enabled yet never blocks; the final product (manual) is never blocked. done(x) = Set of the student's done steps of x.
window.elCheckpointMissing=function(a,done,enabled){if(!a||a.manual)return null;const list=(window.EL_CATALOG||[]).filter(x=>x.ls===a.ls),i=list.indexOf(a);
  return i<0?null:list.slice(0,i).find(x=>x.checkpoint&&enabled(x)&&!(window.EL_ACTIONS[x.id]||["check"]).every(k=>done(x).has(k)))||null};
// LS2 4ESO Seasons & Celebrations: steps per page (as ls2-engine.js records them) and the criterion each step gives evidence for,
// by the skill it practises (docs/4eso/ls2-seasons-and-celebrations/assessment-criteria.md). Recall, vocabulary and grammar steps are language practice.
(function(){
  const LP=["recall","cards","practice"],ck={check:["4.1","5.1"]};
  Object.assign(window.EL_ACTIONS,{
    "4eso/ls2-getting-started":["recall","words","read","listen","speak"],
    "4eso/ls2-celebrations-around-the-world":[...LP,"read","log","listen","grammar","mixed","write","speak"],
    "4eso/ls2-where-traditions-come-from":[...LP,"listen","chart","shadow","grammar","mixed","write","speak","talk"],
    "4eso/ls2-research-it-right":["recall","read","sources","respect","notes","credit","again","shadow","talk","card"],
    "4eso/ls2-plan-the-day":[...LP,"listen","again","shadow","grammar","mixed","write","speak","talk"],
    "4eso/ls2-write-to-the-head-teacher":[...LP,"read","register","again","shadow","grammar","write","speak","talk"],
    "4eso/ls2-recall-checkpoint-1":["check"],"4eso/ls2-recall-checkpoint-2":["check"],"4eso/ls2-recall-checkpoint-3":["check"],"4eso/ls2-recall-checkpoint-4":["check"],
    "4eso/ls2-sample-exam":["listen","chart","read","log","vocab","grammar","write"],
    "4eso/ls2-celebration-day-proposal":["video","email","submit"],
    "4eso/ls2-reflect":["self","reflect"]
  });
  // Revised programme (24 Oct 2026): 2.1, 3.1, 6.2 and CE2 2.3 are no longer LS2 criteria, so speaking steps practise the pitch (3.2).
  // Four skills (Roger, 30 Oct 2026): Use of English steps heard (practice and grammar, "listen and complete") give 2.2 + 5.1; said steps ("say it") and Talk give 3.2.
  // Cards (4 ESO LP3–LP6, 2 ESO LP2–LP6): the card asks the student to say the word aloud before turning it, so they give 4.1 + 3.2 (Roger, 30 Oct 2026: paths students had started stay as they were).
  const LW=["2.2","5.1"],S=["3.2"],RS=["4.1","3.2"],SH=["2.2","3.2"];   // shadowing: half listening, half speaking
  window.EL_STEP_CRITERIA={
    "4eso/ls2-getting-started":{read:["4.1"],listen:["2.2"],speak:[]},
    "4eso/ls2-celebrations-around-the-world":{read:["4.1"],log:["4.1"],listen:["2.2"],write:["5.1"],speak:["3.2","1.1"]},
    "4eso/ls2-where-traditions-come-from":{shadow:SH,cards:RS,listen:["2.2"],chart:["2.2"],practice:LW,grammar:LW,mixed:S,write:["5.1","1.2"],speak:["3.2","1.2"],talk:S},
    "4eso/ls2-research-it-right":{shadow:SH,read:["4.2"],sources:["4.2"],respect:["1.2","CC3 3.2"],notes:["6.1"],credit:["6.1"],again:["2.2"],talk:S,card:["4.2","6.1","CC3 3.2"]},
    "4eso/ls2-plan-the-day":{shadow:SH,cards:RS,listen:["2.2"],again:["2.2"],practice:LW,grammar:LW,mixed:S,write:["5.1","CC1 1.3"],speak:["3.2"],talk:S},
    "4eso/ls2-write-to-the-head-teacher":{shadow:SH,cards:RS,read:["4.1"],register:["5.1"],again:["2.2"],practice:LW,grammar:S,write:["5.1","CC1 1.3"],speak:["3.2"],talk:S},
    "4eso/ls2-recall-checkpoint-1":ck,"4eso/ls2-recall-checkpoint-2":ck,"4eso/ls2-recall-checkpoint-3":ck,"4eso/ls2-recall-checkpoint-4":ck,
    "4eso/ls2-sample-exam":{listen:["2.2"],chart:["2.2"],read:["4.1"],log:["4.1"],write:["5.1"]},
    "4eso/ls2-celebration-day-proposal":{video:["3.2","1.1","1.2","CC3 3.2"],email:["5.1","CC1 1.3"],submit:[]},
    "4eso/ls2-reflect":{self:[],reflect:[]}
  };
})();
// LS2 2ESO Free Time, Live!: steps per page and the criterion each step gives evidence for (docs/2eso/ls2-free-time-live/assessment-criteria.md).
(function(){
  const LP=["recall","cards","practice"],ck={check:["4.1","5.1"]},LW=["2.2","5.1"],S=["3.2"],RS=["4.1","3.2"],SH=["2.2","3.2"];
  Object.assign(window.EL_ACTIONS,{
    "2eso/ls2-getting-started":[...LP,"read","listen","speak"],
    "2eso/ls2-what-are-they-doing":[...LP,"read","log","listen","again","shadow","grammar","mixed","write","speak","talk"],
    "2eso/ls2-now-or-usually":[...LP,"listen","chart","shadow","grammar","mixed","write","speak","talk"],
    "2eso/ls2-check-the-source":[...LP,"read","sources","credit","again","shadow","talk","factfile"],
    "2eso/ls2-likes-and-screen-tips":[...LP,"listen","again","shadow","grammar","mixed","write","speak","talk"],
    "2eso/ls2-write-your-vlog-script":[...LP,"read","parts","again","shadow","grammar","write","speak","talk"],
    "2eso/ls2-recall-checkpoint-1":["check"],"2eso/ls2-recall-checkpoint-2":["check"],"2eso/ls2-recall-checkpoint-3":["check"],"2eso/ls2-recall-checkpoint-4":["check"],
    "2eso/ls2-sample-exam":["listen","chart","read","log","vocab","grammar","write"],
    "2eso/ls2-free-time-vlog":["video","submit"],
    "2eso/ls2-reflect":["self","reflect"]
  });
  Object.assign(window.EL_STEP_CRITERIA,{
    "2eso/ls2-getting-started":{read:["4.1"],listen:["2.2"],speak:[]},
    "2eso/ls2-what-are-they-doing":{shadow:SH,cards:RS,read:["4.1"],log:["4.1"],listen:["2.2"],again:["2.2"],practice:LW,grammar:LW,mixed:S,write:["5.1"],speak:["3.2"],talk:S},
    "2eso/ls2-now-or-usually":{shadow:SH,cards:RS,listen:["2.2"],chart:["2.2"],practice:LW,grammar:LW,mixed:S,write:["5.1"],speak:["3.2"],talk:S},
    "2eso/ls2-check-the-source":{shadow:SH,cards:RS,read:["4.2"],sources:["4.2"],credit:["6.2"],practice:LW,again:["2.2"],talk:S,factfile:["4.2","6.2"]},
    "2eso/ls2-likes-and-screen-tips":{shadow:SH,cards:RS,listen:["2.2"],again:["2.2"],practice:LW,grammar:LW,mixed:S,write:["5.1","CD4 4.5"],speak:["3.2","CD4 4.5"],talk:S},
    "2eso/ls2-write-your-vlog-script":{shadow:SH,cards:RS,read:["4.1"],parts:["5.1"],again:["2.2"],practice:LW,grammar:S,write:["5.1"],speak:["3.2"],talk:S},
    "2eso/ls2-recall-checkpoint-1":ck,"2eso/ls2-recall-checkpoint-2":ck,"2eso/ls2-recall-checkpoint-3":ck,"2eso/ls2-recall-checkpoint-4":ck,
    "2eso/ls2-sample-exam":{listen:["2.2"],chart:["2.2"],read:["4.1"],log:["4.1"],write:["5.1"]},
    "2eso/ls2-free-time-vlog":{video:["3.2","CD2 2.2"],submit:[]},
    "2eso/ls2-reflect":{self:[],reflect:[]}
  });
})();
// Use of English is reading and writing (Roger, 30 Oct 2026: "the vocabulary sections of the learning path count as reading and writing alike,
// since they read and then practise by writing, completing sentences or choosing an option"): in every activity with step criteria, a
// vocabulary or grammar step with none of its own (recall, words, cards, practice, grammar, mixed, vocab) gives evidence for 4.1 and 5.1.
(function(){const UOE=["recall","words","cards","practice","grammar","mixed","vocab"];
  Object.keys(window.EL_STEP_CRITERIA).forEach(id=>{const sc=window.EL_STEP_CRITERIA[id];(window.EL_ACTIONS[id]||[]).forEach(k=>{if(UOE.includes(k)&&!sc[k])sc[k]=["4.1","5.1"]})})})();
