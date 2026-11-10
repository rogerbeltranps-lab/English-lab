// Activity catalogue used by pages, the student page and the teacher dashboard.
// Criteria are an editorial PROPOSAL from docs/*/ls1-my-real-routine/overview.md; pending Roger's approval.
// points: number of actions in the activity; each completed action = 1 point.
// graded:false = not evaluated (warm-up, or in-class games/theory presentations: inClass:true) - always free to practise.
// graded:true  = evaluated; enabled by the teacher and can be done ONCE (submit locks it), unless manual.
// skip: done-keys not scored (LS1 writings were practised but not corrected; "match" is vocabulary review, not submittable). From LS2 on, the
// writing of every learning path is handed in to the teacher and corrected (Roger, 1 Nov 2026: "now we will mark the writings"), so it is a
// scored step like the others: never put "write" in skip for a new LS.
// manual:true = scored by the teacher (not by counting actions); delivered through Google Classroom, not in this site.
// video:true = its video is uploaded on its own page (Submit tab, shared/js/el-video.js, into the teacher's Drive; Roger, 8 Nov 2026), not on Classroom.
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
// English Lab by level, not by course (Roger, 6 Nov 2026: "hauria d'estar per nivells no per cursos"): one ladder of CEFR steps; each step
// is every [course, route] whose level is that step (A1 = 2 ESO Starter + 4 ESO Starter, A2 = 2 ESO Core + 4 ESO Base...), so students of
// the same level in both courses share the practice. [{k:"A2", pairs:[["2eso","safe"],["4eso","insecure"]]}, ...]
window.elLadder=()=>{const o={};Object.keys(window.EL_CEFR).forEach(c=>Object.keys(window.EL_CEFR[c]).forEach(lv=>{const k=window.EL_CEFR[c][lv][0];(o[k]=o[k]||[]).push([c,lv])}));
  return ["A1","A1+","A2","A2+","B1","B1+","B2","C1","C2"].filter(k=>o[k]).map(k=>({k,pairs:o[k]}))};
window.elCa=l=>l==="beginners"||l==="insecure";   // routes that read instructions in Catalan
// The student's route in an LS. The teacher sets routes (Roger, 26 Oct 2026: from the LS1 exam mark, on the dashboard). An LS with
// no route of its own takes the latest route set in an earlier LS of the same course (EL_LS order), so a route carries over to every
// later LS until the teacher changes it. lv = {lsId: {level, by}}. Returns {level, from, own}: from = the LS whose route it is (null: no
// route yet); own = a route a 2 ESO student chose before 30 Oct 2026 (by:"student"; it still counts but is not shown as theirs, and
// students can no longer write it). A route the teacher set, in any LS of the course, wins over it.
// A hand-in comment that only says "no problem" (no, none, res, cap problema...) needs no answer (Roger, 30 Oct 2026)
window.elNoComment=function(c){const t=String(c||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z' ]+/g," ").replace(/\s+/g," ").trim().replace(/ (thanks|thank you|gracies|gracias)$/,"");
  // "No, all is okk" (4ESOA, 9 Nov 2026): a leading "no", "ok" with extra k's and "all is ok/fine/good/clear" count too
  const u=t.replace(/^(no|nope) (?=.)/,"").replace(/\bok+\b/g,"ok").replace(/\bokey\b/g,"okay");
  return !t||/^(no|nope|none|nothing|nada|res|cap|ninguno|no comment|all good|ok|okay|fine|everything (is )?(ok|fine)|tot be|todo bien)$/.test(t)
    ||/^((it'?s|it is|all|everything|everything'?s|all is|all was|everything (is|was)|it was) )?(ok|okay|fine|good|clear|right|perfect|correct)( for me)?$/.test(u)||/^(tot (esta |estava )?(be|clar|correcte)|todo (esta |estaba )?(bien|claro|correcto))$/.test(u)
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
// The LS name with its number for students and the teacher (Roger, 7 Nov 2026: "we should see LS2 Free Time..."): "LS2 · Free Time, Live!".
// The number is the LS's place in its course in EL_LS (LS1 first).
// elLsNum(l) = "LS2": menus show it in the icon box instead of 📚 (Roger, 7 Nov 2026: "instead of the book emoji").
window.elLsNum=l=>{if(!l)return "";const i=(window.EL_LS||[]).filter(x=>x.course===l.course).findIndex(x=>x.id===l.id);return i>=0?"LS"+(i+1):""};
window.elLsName=l=>{if(!l)return "";const c=(window.EL_LS||[]).filter(x=>x.course===l.course),i=c.findIndex(x=>x.id===l.id);return (i>=0?"LS"+(i+1)+" · ":"")+String(l.title||"").replace(/^\S+ · /,"")};
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
        L("sample-exam.html","Sample exam",["2.2","4.1","5.1"],"ls2SampleExam4ESO",7,{graded:false,optional:true}),
        L("celebration-day-proposal.html","Final product: Celebration Day Proposal",["1.1","1.2","3.2","4.2","5.1","6.1","CC1 1.3","CC3 3.2"],"ls2FinalProduct4ESO",0,{manual:true,video:true,steps:[["prep","0 · My pieces"],["source","1 · My source"],["contribution","2 · My contribution"],["part","3 · My part"],["email","4 · My email"],["feedback","Feedback to a group"],["team","5 · Teamwork"]],pieces:"ls2Products4ESO"}),
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
        L("sample-exam.html","Sample exam",["2.2","4.1","5.1"],"ls2SampleExam2ESO",7,{graded:false,optional:true}),
        L("free-time-vlog.html","Final product: Free Time Vlog",["3.2","4.2","5.1","6.2","CD2 2.2","CD4 4.5"],"ls2FinalProduct2ESO",0,{manual:true,video:true,steps:[["prep","0 · My pieces"],["source","1 · My source"],["slides","2 · My slides"],["script","3 · My script"],["edit","4 · Record and edit"],["feedback","Feedback for my buddy"],["tips","5 · My tip"]],pieces:"ls2Products2ESO"}),
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
// Optional practice (Roger, 9 Nov 2026: "I want all the students to be able to practise the sample exam, however I don't want it to appear
// as homework … always leave the sample exam open but not counting it as homework, to do in class or not done"): an activity with
// optional:true in EL_CATALOG (the sample exam of every LS) is always open for every group of an LS that is not hidden, whatever the
// open switches, the section switches, the Time plan or the recall checkpoints say. It is never in ✅ To do, never homework, never late or
// missing, never the "next" step, and its tabs are never counted in done/missing work (no due day: ELWeek.due).
window.elOptional=a=>!!(a&&a.optional);
window.elLpOpen=function(a,info,gid,raw){if(a&&a.optional)return true;const o=info&&info.open&&info.open[gid];
  if(!(Array.isArray(o)?o.includes(a.id):!a.graded||((info&&info.enabled)||[]).includes(a.id)))return false;
  if(!raw&&!window.EL_RAW_OPEN&&elCpShown(a,info,gid))return false;   // a checkpoint whose answers are shown is closed: nobody can do it any more
  return raw||window.EL_RAW_OPEN||!elPlanLater(info,gid).acts.has(a.id)};
// The Time plan opens on the class day (Roger, 7 Nov 2026: "the SLPs will be automatically open the day the group has class and it's on my
// plan"; "If I don't do sth in class I drag it to the next day and that's all"). Dragging a learning path or tab onto a class day still opens
// it for the group (rules level, so saving works on that day without anyone writing); on the students' screens it stays closed until that
// day: a learning path whose items on the agenda (ls/{id}.planEdits[group].agenda) are all on later days, and a tab whose items are all on
// later days. Homework the teacher set and a pull-up open it at once, as before. Page-only, like the section switches. raw (or
// window.EL_RAW_OPEN, set by the dashboard) = the switches alone, for whatever writes them.
const agToday=()=>window.ELWeek&&ELWeek.today?ELWeek.today():window.EL_TODAY||new Date().toLocaleDateString("en-CA",{timeZone:"Europe/Madrid"});
// 🖨 Print session (Roger, 7 Nov 2026: "print today's sections for those who don't have a Chromebook … also the games"; "the same here [the
// Time plan's class day] in case I know it beforehand", "like print session"): the paper sheet of one class day, shared/print/today.html.
// its = the day's agenda items in order; returns the link from the site root (learning path tabs, then each game; notes are left out).
window.elPrintDay=function(its,gname,dlab){const by=new Map(),games=[];
  (its||[]).forEach(it=>{it=String(it);const i=it.indexOf("#");if(i<0||/^note:/.test(it))return;const id=it.slice(0,i),p=it.slice(i+1);
    if(/^game:/.test(p)){if(!games.includes(p.slice(5)))games.push(p.slice(5));return}
    const a=(window.EL_CATALOG||[]).find(x=>x.id===id);if(!a||!a.path)return;const k=a.path.replace(/\.html$/,"");if(!by.has(k))by.set(k,[]);if(p)by.get(k).push(p);else by.get(k).all=true});
  const items=[...by].map(([k,ps])=>k+(ps.all?"":":"+ps.join("."))).join("|");
  return "shared/print/today.html?items="+encodeURIComponent(items)+"&games="+encodeURIComponent(games.join(","))+"&g="+encodeURIComponent(gname||"")+"&d="+encodeURIComponent(dlab||"")};
window.elAgendaOf=function(info,gid){const s=info&&info.planEdits&&info.planEdits[gid]&&info.planEdits[gid].agenda;if(!s)return null;
  try{const ag=typeof s==="string"?JSON.parse(s):s;return ag&&ag.days?ag:null}catch(e){return null}};
window.elAgToday=()=>agToday();
// 5 minutes before the class (Roger, 8 Nov 2026: "cannot be unfrozen 5 minutes before the class?"): what the Time plan puts on today opens
// for students 5 minutes before the group's class starts by its timetable, not in the morning. The timetable: the group's live/{group}.tt
// (el-cloud.js keeps it in window.EL_LIVE_TT and this browser, el_tt_<group>, so the next page knows it at once), else EL_TIMETABLE
// (el-plan.js). No class of the group that day by the timetable (or no timetable at all): it opens with the day, as before.
window.elTTFor=function(gid){const L=window.EL_LIVE_TT;if(L&&L[gid]&&L[gid].slots)return L[gid];
  try{const c=JSON.parse(localStorage.getItem("el_tt_"+gid)||"null");if(c&&c.slots)return c}catch(e){}return window.elTT?elTT(gid):null};
// when the plan's items of `day` (YYYY-MM-DD) open for the group: 5 minutes before its first class that day (ms), or null (no class by the timetable)
window.elClassOpenAt=function(gid,day){const tt=elTTFor(gid);if(!tt||!tt.slots||!day)return null;
  if(elOffList(tt.off).some(o=>o[0]<=day&&day<=o[1]))return null;
  const z=new Date(day+"T00:00:00"),dn=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][z.getDay()];let best=null;
  for(const sl of tt.slots){const x=String(sl).match(/^(\w{3}) (\d{1,2}):(\d\d)$/);if(!x||x[1]!==dn)continue;const t=z.getTime()+(+x[2]*60+ +x[3]-5)*60e3;if(best==null||t<best)best=t}
  return best};
const laterMemo=new WeakMap();   // per ls info and group: recomputed when the agenda, homework, pull-up or day changes
window.elPlanLater=function(info,gid,today){const none={acts:new Set(),tabs:{}};if(!info||typeof info!=="object")return none;
  const ag=elAgendaOf(info,gid);if(!ag)return none;const real=!today;today=today||agToday();
  const op=real?elClassOpenAt(gid,today):null,early=op!=null&&Date.now()<op,after=(d,x)=>d>today||(early&&d===today);   // today's items wait for the class
  const src=info.planEdits[gid].agenda,mm=laterMemo.get(info)||{},m=mm[gid];if(m&&m.today===today&&m.early===early&&m.src===src&&m.hw===info.homework&&m.push===info.push&&m.done===info.done)return m.v;
  const first={},tabFirst={};
  Object.entries(ag.days).forEach(([d,its])=>(its||[]).forEach(it=>{const i=String(it).indexOf("#");if(i<0)return;const id=it.slice(0,i),p=it.slice(i+1);
    if(!first[id]||d<first[id])first[id]=d;if(p){const k=id+"#"+p;if(!tabFirst[k]||d<tabFirst[k])tabFirst[k]=d}}));
  const free=new Set();   // opened at once by the teacher: homework and a pull-up; the sample exam stays open for revising (Roger, 7 Nov 2026: "I want them to see the sample exam")
  Object.keys(first).forEach(id=>{if(/sample-exam$/.test(id))free.add(id)});Object.keys(tabFirst).forEach(k=>{if(/sample-exam#/.test(k))free.add(k)});
  // homework planned for a later class day (set > today) frees nothing until that day (Roger, 7 Nov 2026)
  Object.values(((info.homework||{})[gid])||{}).forEach(h=>{if(!h||!h.tabs||typeof h.tabs!=="object"||h.set&&h.set>today)return;Object.entries(h.tabs).forEach(([id,ps])=>{free.add(id);(ps||[]).forEach(p=>free.add(id+"#"+p))})});
  const pu=(info.push||{})[gid];if(pu&&pu.a){free.add(pu.a);if(pu.p)free.add(pu.a+"#"+pu.p)}
  const v={acts:new Set(Object.keys(first).filter(id=>after(first[id])&&!free.has(id))),tabs:{},free,planned:new Set([...Object.keys(tabFirst),...Object.keys(((info.done||{})[gid])||{})]),
    whole:new Set(Object.values(ag.days).flatMap(its=>(its||[]).map(String).filter(it=>it.endsWith("#")).map(it=>it.slice(0,-1))))};
  Object.entries(tabFirst).forEach(([k,d])=>{if(!after(d)||free.has(k))return;const [id,p]=[k.slice(0,k.indexOf("#")),k.slice(k.indexOf("#")+1)];(v.tabs[id]=v.tabs[id]||[]).push(p)});
  mm[gid]={today,early,src,hw:info.homework,push:info.push,done:info.done,v};laterMemo.set(info,mm);return v};
// Sections inside a learning path (Roger, 26 Oct 2026: "even in the learning path, I want to open these sections as I teach"): the section
// tabs the teacher has locked for a group, ls/{id}.secLocked[group][activity id with "/" as "__"] = panel ids (EL_SECTIONS in el-sections.js),
// and the ones opened at some point, ls/{id}.secOpened[group][same key]. None locked = every section open. A locked section is read-only
// on the page (el-cloud.js lockSections): students see it with their saved answers. The saved state is one JSON per page, so the rules cannot check them.
const secKey=a=>a.id.replace("/","__"),secOf=(info,f,gid,a)=>{const g=info&&info[f]&&info[f][gid];return g&&g[secKey(a)]};
window.elSecLocked=function(a,info,gid){return a&&a.optional?[]:secOf(info,"secLocked",gid,a)||[]};   // optional: every tab open
// Steps a section holds (EL_ACTIONS keys): its panel id, or the cards and practice steps for a vocabulary section; none for info panels.
// Steps grouped by the tab they live in, in the path's order: [[step, …], …]. The Vocabulary tab holds two steps (cards, practice) and counts
// as one tab, done when both are (Roger, 7 Nov 2026: students see the same tabs and counts as the learning path and the dashboard).
window.elTabGroups=function(a,ks){const xs=((window.EL_SECTIONS||{})[a.id]||[]).map(x=>x[0]),m=new Map();
  ks.forEach(k=>{const p=xs.includes(k)?k:(k==="cards"||k==="practice")&&xs.includes("vocab")?"vocab":k;if(!m.has(p))m.set(p,[]);m.get(p).push(k)});return [...m.values()]};
// Tabs still to do in a learning path (Roger, 7 Nov 2026: "it says she's missing one but she's missing 5!"): every count of missing work
// (board banner, All my work done, My activities, the learning-paths table, the dashboard's Points box) counts TABS, not learning paths.
// The tabs of its scored steps (EL_ACTIONS without a.skip, grouped by elTabGroups); one with no steps listed counts as 1 tab (its flag).
window.elTabsOf=function(a){const ks=((window.EL_ACTIONS||{})[a.id]||[]).filter(k=>!(a.skip||[]).includes(k));return ks.length?elTabGroups(a,ks):null};
// the tabs not done as [[step, …], …] (done = Set of the student's done steps, r = results/{activity}); an activity with no steps: [] or [[]]
window.elTabsLeft=function(a,done,r){const g=elTabsOf(a);return g?g.filter(x=>!x.every(k=>done.has(k))):elAllDone(a,done,r)?[]:[[]]};
window.elTabsTotal=a=>{const g=elTabsOf(a);return g?g.length:1};
window.elSecSteps=function(a,id){const ks=(window.EL_ACTIONS||{})[a.id]||[];return id==="vocab"?ks.filter(k=>k==="cards"||k==="practice"):ks.includes(id)?[id]:[]};
const secDone=(a,id,done)=>{const st=elSecSteps(a,id);return st.length>0&&st.every(k=>done.has(k))};
// Roger (26 Oct 2026): sections he has opened stay on the student's to-do until they finish them, so a section opened before and locked
// again stays open for a student who has not finished it; it is read-only for everyone else. done = Set of the student's done steps.
// sections locked now that were never opened for the group (a section opened before and locked again was taught: its work is due)
window.elSecNeverOpened=function(a,info,gid){const op=secOf(info,"secOpened",gid,a)||[];return elSecLocked(a,info,gid).filter(id=>!op.includes(id))};
const secLk=(a,info,gid,done)=>{const op=secOf(info,"secOpened",gid,a)||[];return elSecLocked(a,info,gid).filter(id=>!(op.includes(id)&&elSecSteps(a,id).length&&!secDone(a,id,done)))};
// Not planned yet = for class too (Roger, 9 Nov 2026: "If it's to do in class it shouldn't appear here and if they browse it and see it open
// they can only see it not do it"): when the group has an agenda, a tab of an open learning path that is on no class day at all (nor ticked
// as done in class, set as homework or pulled up; nor a path planned whole) is 🏫 for class too: shown read-only, never To do, like a tab
// planned for a later day (it gets no day on its note). The tabs for a later day + these: [panel id].
const laterTabs=(a,info,gid)=>{const L=elPlanLater(info,gid),later=L.tabs[a.id]||[];if(!L.planned||!a||a.optional||L.free.has(a.id)||L.whole.has(a.id))return later;
  const S=(window.EL_SECTIONS||{})[a.id],ids=S?S.map(x=>x[0]):[...new Set(((window.EL_ACTIONS||{})[a.id]||[]).map(k=>k==="cards"||k==="practice"?"vocab":k))];   // LP pages load no el-sections.js
  const un=ids.filter(id=>elSecSteps(a,id).length&&!L.planned.has(a.id+"#"+id)&&!L.free.has(a.id+"#"+id));
  return un.length?[...new Set([...later,...un])]:later};
window.elLaterTabs=laterTabs;
window.elSecLockedFor=function(a,info,gid,done){const lk=secLk(a,info,gid,done);
  if(window.EL_RAW_OPEN)return lk;const later=laterTabs(a,info,gid);return [...new Set([...lk,...later])]};   // + tabs for a later class day or not planned yet (laterTabs)
// 🏫 To do in class (Roger, 8 Nov 2026: "students can see it but can't write any answer nor play any video until it's class time"; "a blue
// shadow and a legend saying to do in class"): a tab of an open learning path that the Time plan puts on a later class day (elPlanLater) is
// SHOWN, read-only, until that day; a tab the teacher locked with the section switches stays hidden. Still not doable, so it is never in
// ✅ To do or the "next" step (elSecLockedFor keeps it), but it counts in the path's tabs, so a path is never "done" with tabs still to come.
// Returns {panel id: the class day it is planned for (YYYY-MM-DD)}.
window.elSecSoon=function(a,info,gid,done){if(window.EL_RAW_OPEN||!a||a.optional)return {};const later=laterTabs(a,info,gid);if(!later.length)return {};
  const lk=secLk(a,info,gid,done),ag=elAgendaOf(info,gid),today=agToday(),o={};
  later.forEach(p=>{if(lk.includes(p))return;let d=null;Object.entries((ag&&ag.days)||{}).forEach(([dd,its])=>{if(dd>=today&&(its||[]).includes(a.id+"#"+p)&&(!d||dd<d))d=dd});o[p]=d});return o};
// the steps of those tabs (elSecSteps), for counting
window.elSoonSteps=function(a,soon){return Object.keys(soon||{}).flatMap(id=>elSecSteps(a,id))};
// Sections still to finish (the to-do list): only in a learning path where the teacher uses the section switches, a section that is open
// or was opened before, holds steps and has some not done. Returns [[panel id, name]].
window.elSecPending=function(a,info,gid,done){const lk=secOf(info,"secLocked",gid,a);if(!Array.isArray(lk)||a.optional)return [];const op=secOf(info,"secOpened",gid,a)||[],later=window.EL_RAW_OPEN?[]:laterTabs(a,info,gid);
  return ((window.EL_SECTIONS||{})[a.id]||[]).filter(([id])=>(!lk.includes(id)||op.includes(id))&&!later.includes(id)&&elSecSteps(a,id).length&&!secDone(a,id,done))};
// ✅ To do (Roger, 6 Nov 2026: "When I open a section it must be set as to do. So in each class I open a section or LP and they see it as
// to do. They are only homework if I say so (I can say that a LP is homework or only a section)"): every learning path of an open LS that
// the teacher has opened for the group (elLpOpen) and the student has not finished, with its tabs that are open for them (elSecLockedFor:
// not locked, or opened before and not finished) and hold steps not done yet. Opening is enough: nothing else to set. Dropped paths and the
// final product handed in on Classroom are left out. Homework is separate: only what the teacher sets with 🏠 Set as homework (elHwTargets).
// The board's ✅ To do and the floating ✅ To do button (el-todo.js) use it. p, gi = the group's plan (or null, -1); doneOf(a) = Set of the
// student's done steps; isDone(a) = every step done. Returns [{a, tabs: [[panel id, name]], due, late, cp}] in the order of the plan
// (due day, then the LS's order); cp = the recall checkpoint to do first (elCheckpointMissing), or null.
// Only what was due before today's class (Roger, 9 Nov 2026: "it only should be on the list what was due before today's class. What I plan
// to do in class and I put it on the agenda and stays open they think that it's homework and that they have to do it"): when the group has
// a Time plan agenda, a tab is in ✅ To do only if it was on a class day before today (the agenda, or ticked as done in class: ls/{id}.done)
// or the teacher set it as homework (from its set day). Open tabs planned for today or later, or on no class day, are not To do.
// Returns {acts: Set of whole paths, tabs: {activity id: Set of panel ids}}, or null when the group has no agenda (then opened = To do).
window.elDueBefore=function(info,gid,today){const ag=elAgendaOf(info,gid);if(!ag)return null;const real=!today;today=today||agToday();
  // today's class counts too once it is over (Roger, 9 Nov 2026: "If the student didn't come to class they can do the checkpoint at home.
  // So that be a to do thing"): about an hour after the class opens (elClassOpenAt = 5 minutes before it starts); no class today: tomorrow
  const op=real?elClassOpenAt(gid,today):null,over=op!=null&&Date.now()>op+60*60e3;
  const v={acts:new Set(),tabs:{}},add=(it,d)=>{if(d!==true&&(!d||d>today||(d===today&&!over)))return;it=String(it);const i=it.indexOf("#");if(i<0||/^note:/.test(it))return;
    const id=it.slice(0,i),p=it.slice(i+1);if(/^game:/.test(p))return;if(!p)v.acts.add(id);else (v.tabs[id]=v.tabs[id]||new Set()).add(p)};
  Object.entries(ag.days||{}).forEach(([d,its])=>(its||[]).forEach(it=>add(it,d)));
  Object.entries(((info.done||{})[gid])||{}).forEach(([k,d])=>add(k,d));
  Object.values(((info.homework||{})[gid])||{}).forEach(h=>{if(!h||!h.tabs||typeof h.tabs!=="object"||h.set&&h.set>today)return;
    Object.entries(h.tabs).forEach(([id,ps])=>{if(!ps||!ps.length)v.acts.add(id);else ps.forEach(p=>add(id+"#"+p,true))})});
  return v};
window.elTodoList=function(ls,info,gid,doneOf,isDone,p,gi){const st=info&&info.status==="public"?"open":info&&info.status;if(st!=="open"||!gid)return [];
  const W=window.ELWeek,today=W?W.today():new Date().toISOString().slice(0,10),dr=(p&&gi>=0&&(p._dropped||{})[gi])||[],due=a=>p&&gi>=0&&W?W.due(p,a.id,gi):null;
  const db=window.EL_RAW_OPEN?null:elDueBefore(info,gid),dueA=a=>!db||db.acts.has(a.id)||!!db.tabs[a.id],dueT=(a,id)=>!db||db.acts.has(a.id)||!!(db.tabs[a.id]&&db.tabs[a.id].has(id));
  return (window.EL_CATALOG||[]).filter(a=>a.ls===ls).map((a,i)=>({a,i,d:due(a)})).filter(({a})=>!a.manual&&!a.optional&&!dr.includes(a.id)&&elLpOpen(a,info,gid)&&!isDone(a)&&dueA(a))
    .sort((x,y)=>(x.d||"~")<(y.d||"~")?-1:(x.d||"~")>(y.d||"~")?1:x.i-y.i)
    .map(({a,d})=>{const done=doneOf(a),secs=(window.EL_SECTIONS||{})[a.id]||[],off=secs.length?elSecLockedFor(a,info,gid,done):[];
      const tabs=secs.filter(([id])=>!off.includes(id)&&dueT(a,id)&&elSecSteps(a,id).length&&!secDone(a,id,done));
      if(secs.length&&!tabs.length)return null;   // what is open and due is done; the rest is still locked or for a later class
      return {a,tabs,due:d,late:!!(d&&d<today),cp:elCheckpointMissing(a,doneOf,y=>elLpOpen(y,info,gid))}}).filter(Boolean)};
// "LP3" in the group's plan → its learning path ("LP3 Where traditions come from" somewhere in the plan): {"3": activity}
window.elLpNumMap=function(ls,p,gi){const m={},acts=(window.EL_CATALOG||[]).filter(a=>a.ls===ls),sh=x=>String(x).split(/[:(]/)[0].trim().toLowerCase();
  ((p&&p.rows)||[]).forEach(r=>String(r.g?r.g[gi]||"":r.what||"").replace(/LP(\d+) ([A-Z][^(\n·]*)/g,(_,n,name)=>{const nm=name.trim().toLowerCase(),a=acts.find(y=>sh(y.title).startsWith(nm)||nm.startsWith(sh(y.title)));if(a&&!m[n])m[n]=a}));
  return m};
// What a homework covers (🏠 Homework on the board and in el-todo.js): {activity id: [panel ids]} ([] = the whole learning path), or null.
// x = an item of ELWeek.tasks. Homework set on the dashboard since 6 Nov 2026 saves it (x.tabs); older ones and the plan's "Homework by …"
// lines are read from their text: "LP3 Speaking and Talk", "LP3 Where traditions come from: Speaking, Talk" (tab names of that path; none
// named = the whole path; words in brackets are left out, e.g. "(Speaking and Talk after the exam)").
window.elHwTargets=function(x,ls,p,gi){if(!x||x.kind!=="hw")return null;
  const noOpt=o=>{const r={};Object.entries(o||{}).forEach(([id,ps])=>{if(!elOptional((window.EL_CATALOG||[]).find(a=>a.id===id)))r[id]=ps});return Object.keys(r).length?r:null};   // optional practice is never homework
  if(x.tabs&&typeof x.tabs==="object"&&Object.keys(x.tabs).length)return noOpt(x.tabs);
  const m=elLpNumMap(ls,p,gi),out={},txt=String(x.text||"").replace(/\([^)]*\)/g," "),parts=txt.split(/(?=\bLP\d+\b)/);
  parts.forEach(seg=>{const n=(seg.match(/^LP(\d+)\b/)||[])[1],a=n&&m[n];if(!a)return;const s=seg.replace(/^LP\d+\s*/,"").toLowerCase();
    const ids=((window.EL_SECTIONS||{})[a.id]||[]).filter(([id,nm])=>elSecSteps(a,id).length&&new RegExp("(^|[^a-z])"+String(nm).toLowerCase().replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"($|[^a-z])").test(s)).map(z=>z[0]);
    out[a.id]=[...new Set([...(out[a.id]||[]),...ids])]});
  return noOpt(out)};
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
// Who left, for the teacher's panels (Roger, 9 Nov 2026: "I need to know who disconnects, and I need their names to be there … even when
// we are watching a video"): gone = out now (out of full screen, screen closed, lost connection), back = left full screen in this class and
// came back. Both stay named on the dashboard panel (#fsctl) and the class tab's panel (el-cloud.js #el-fsfloat), also when made small.
window.elWhoLeft=w=>({gone:(w.out||[]).filter(y=>y.why!=="never"),back:(w.inn||[]).filter(y=>y.left),never:(w.out||[]).filter(y=>y.why==="never")});
// One short line of counts, names only on a tap (Roger, 10 Nov 2026: "this was too big and I couldn't see the screen! And during the games
// students played to log in and out so that their name appeared. I only need … who is in the class and who is not and see the numbers
// (then if I click I see the names)"): "✓ 25 in · ✗ 2 left · ⚪ 3 not here of 30", each count a button (data-wl) that opens its names under
// the line; a second tap (or another count) closes it. Nothing is named on the screen (the projector) until the teacher taps a count.
// o = {open: "in"|"left"|"nh"|null, av: el-attend.js attView (its html is the 🙋 attendance chips + Save, or the saved list), why: y => text,
// hm: ms => "hh:mm"}. Returns {line, list} (inline styles: the dashboard, the class tab and the game board all use it). No reads, no writes.
window.elWhoLine=function(w,o){o=o||{};const {gone,back,never}=elWhoLeft(w),E=t=>String(t==null?"":t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
  const av=o.av||{n:never.length,label:"not here",html:""},abs=av.label==="absent",why=o.why||(()=>""),hm=o.hm||(()=>"");
  const b=(k,col,txt,tip)=>{const on=o.open===k;return '<button type="button" data-wl="'+k+'" aria-expanded="'+on+'" title="'+tip+'" style="border:1.5px solid '+col+';border-radius:999px;padding:2px 10px;margin:1px 0;cursor:pointer;font:700 14px system-ui,sans-serif;'+(on?'background:'+col+';color:#fff':'background:#fff;color:'+col)+'">'+txt+'</button>'};
  const line='<div class="el-wl" style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:4px">'
    +b("in","#166534","✓ "+w.inn.length+" in","Who is in: tap to see the names")
    +b("left","#b91c1c","✗ "+gone.length+" left"+(back.length?' <span style="font-weight:600">· ↩ '+back.length+'</span>':""),"Who left (and who left and came back): tap to see the names")
    +b("nh",abs?"#b91c1c":"#64748b",(abs?"🙋 ":"⚪ ")+av.n+" "+av.label,abs?"Attendance saved: tap to see who is absent or late, or change it":"Not connected in this class: tap to see the names"+(av.html?" and save the attendance":""))
    +'<span style="color:#64748b;font:500 13px system-ui,sans-serif">of '+(w.n||0)+'</span></div>';
  const box=h=>'<div class="el-wlbox" style="margin-top:6px;max-height:40vh;overflow:auto;line-height:1.5;font:500 14px system-ui,sans-serif;color:#1e293b;text-align:left">'+h+'</div>';
  let list="";
  if(o.open==="in")list=box(w.inn.length?'<div style="color:#166534">✓ <b>In ('+w.inn.length+'):</b> '+w.inn.map(y=>E(y.name)).join(", ")+'</div>':'<div style="color:#64748b">Nobody is in yet: they tap their screen to go full screen.</div>');
  else if(o.open==="left")list=box((gone.length?gone.map(y=>'<div style="color:#b91c1c">✗ <b>'+E(y.name)+'</b> · '+why(y)+'</div>').join(""):'<div style="color:#64748b">Nobody has left.</div>')
    +(back.length?'<div style="color:#c2410c;margin-top:4px">↩ <b>Left and came back ('+back.length+'):</b> '+back.map(y=>'<b>'+E(y.name)+'</b> <small>('+(y.left.n>1?y.left.n+'×, last ':'')+hm(y.left.at)+')</small>').join(", ")+'</div>':""));
  else if(o.open==="nh")list=av.html?box(av.html):box(never.length?'<div style="color:#475569">⚪ <b>Not here ('+never.length+'):</b> '+never.map(y=>E(y.name)).join(", ")+'</div>':'<div style="color:#64748b">Everybody is connected.</div>');
  return {line,list}};
// 🎬 Videos under the panel: a video's own ⛶ full screen would hide the page and the panel with it, so on a teacher page with the panel
// showing, a video that goes full screen comes back into the page, fills the screen there (.el-bigvid) and the page goes full screen
// instead: the panel stays on top of the video. ✕ Smaller or Esc puts it back. elPlayVideo(src) plays a video over the page (the unit's
// shadowing video from the dashboard's agenda or the class tab's 📋 Today), with ⛶ Full screen that does the same. No reads, no writes.
(function(){if(window.elPlayVideo||typeof document==="undefined")return;   // no page (the email tools load this file in Node)
  const d=document,R=d.documentElement,fsEl=()=>d.fullscreenElement||d.webkitFullscreenElement;
  const watch=()=>!!(d.getElementById("el-fsfloat")||d.querySelector("#fsctl.on"));
  const css=()=>{if(d.getElementById("el-vidcss"))return;const s=d.createElement("style");s.id="el-vidcss";s.textContent=
    ".el-bigvid{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;max-width:none!important;max-height:none!important;margin:0!important;border:0!important;border-radius:0!important;z-index:2147482000!important;background:#000!important;object-fit:contain}"
    +"html.el-vid-on #fsctl{z-index:2147483000}#el-bigx{position:fixed;top:12px;left:14px;z-index:2147482500;border:0;border-radius:999px;padding:8px 16px;background:#fff;color:#1e1b4b;font:800 15px system-ui,sans-serif;cursor:pointer;box-shadow:0 4px 14px #0006}"
    +"#el-vid{position:fixed;inset:0;z-index:2147481600;background:rgba(15,23,42,.92);display:grid;place-items:center;padding:60px 20px 20px}"
    +"#el-vid video{max-width:100%;max-height:calc(100vh - 90px);border-radius:12px;background:#000}"
    +"#el-vid .el-vbar{position:absolute;top:14px;left:16px;display:flex;gap:8px}#el-vid .el-vbar button{border:0;border-radius:999px;padding:8px 16px;background:#fff;color:#1e1b4b;font:800 15px system-ui,sans-serif;cursor:pointer}";
    d.head.append(s)};
  let big=null,mine=false,swap=false;
  const on=()=>R.classList.toggle("el-vid-on",!!(big||d.getElementById("el-vid")));
  const pageFs=()=>{if(fsEl())return Promise.resolve();const r=R.requestFullscreen||R.webkitRequestFullscreen;if(!r)return Promise.reject();
    try{const p=r.call(R);mine=true;return p&&p.then?p.catch(e=>{mine=false;throw e}):Promise.resolve()}catch(e){mine=false;return Promise.reject(e)}};
  function bigOn(v){css();if(big&&big!==v)bigOff(true);big=v;v.classList.add("el-bigvid");
    if(!d.getElementById("el-bigx")){const b=d.createElement("button");b.id="el-bigx";b.type="button";b.textContent="✕ Smaller";b.title="Back to the page (Esc)";b.onclick=()=>bigOff();d.body.append(b)}on()}
  function bigOff(keepFs){if(big)big.classList.remove("el-bigvid");big=null;const b=d.getElementById("el-bigx");if(b)b.remove();
    if(!keepFs&&mine&&fsEl()){mine=false;const x=(d.exitFullscreen||d.webkitExitFullscreen).call(d);if(x&&x.catch)x.catch(()=>{})}on()}
  ["fullscreenchange","webkitfullscreenchange"].forEach(ev=>d.addEventListener(ev,()=>{const f=fsEl();if(swap)return;
    if(f&&(f.tagName==="VIDEO"||f.tagName==="IFRAME")&&watch()){swap=true;const x=(d.exitFullscreen||d.webkitExitFullscreen).call(d),v=f;
      Promise.resolve(x).catch(()=>{}).then(()=>{bigOn(v);return pageFs()}).catch(()=>{}).then(()=>{swap=false})}
    else if(!f){mine=false;if(big)bigOff(true)}}));
  d.addEventListener("keydown",e=>{if(e.key==="Escape"&&big&&!fsEl())bigOff()});
  window.elPlayVideo=function(src){css();const old=d.getElementById("el-vid");if(old)old.remove();const o=d.createElement("div");o.id="el-vid";
    o.innerHTML='<div class="el-vbar"><button type="button" data-x="1">✕ Close the video</button><button type="button" data-fs="1" title="The video fills the screen; the list of who left stays on top">⛶ Full screen</button></div><video controls autoplay playsinline></video>';
    const v=o.querySelector("video");v.src=src;
    o.onclick=e=>{const b=e.target.closest("button");if(!b)return;if(b.dataset.x){if(big===v)bigOff();o.remove();on()}else{bigOn(v);pageFs().catch(()=>{})}};
    d.body.append(o);on();return o};
  // links marked data-elvid play over the page instead of opening the video file in a new tab
  d.addEventListener("click",e=>{const a=e.target.closest&&e.target.closest("a[data-elvid]");if(!a||e.ctrlKey||e.metaKey||e.shiftKey)return;e.preventDefault();window.elPlayVideo(a.href)})})();
// "LP3 Where traditions come from": the number the time plan gives the learning path (EL_PLAN text "LP3 Where traditions …"), else its short title.
window.elLpLabel=function(a){const sh=t=>String(t).split(/[:(]/)[0].trim(),st=sh(a.title),lo=st.toLowerCase(),p=(window.EL_PLAN||{})[a.ls];let n=null;
  if(p)(p.rows||[]).forEach(r=>[].concat(r.g||r.what||[]).join("\n").replace(/LP(\d+) ([A-Z][^(\n·]*)/g,(_,k,nm)=>{nm=nm.trim().toLowerCase();if(!n&&nm&&(lo.startsWith(nm)||nm.startsWith(lo)))n=k}));
  return (n?"LP"+n+" ":"")+st};
// Recall checkpoint answers shown to a group (Roger, 9 Nov 2026: "when all students or I say show (but then nobody can do the checkpoint)"):
// ls/{id}.cpShown[group][activity id] = when. Students then see their questions, answers and corrections (today.html ✅ My checkpoints)
// and the checkpoint is closed for that group (elLpOpen, firestore.rules), so it no longer blocks what comes after it.
// The score as soon as a checkpoint is sent (Roger, 10 Nov 2026: "I want students see their scores when they finish the checkpoint"):
// cpHash/{page key} = {items:{id:[hashes of the accepted answers]}}, written by the dashboard from the answer key and readable by a student
// only once they have sent that checkpoint (firestore.rules). The page hashes the student's own answers the same way and counts the
// matches: the score, never which answers were right (that comes with 📣 Show answers). Same normalising as teacher.html cpNorm.
window.elCpNorm=s=>String(s||"").toLowerCase().replace(/[’‘`]/g,"'").replace(/[“”"]/g,"").replace(/[.,!?;:]/g,"").replace(/\s+/g," ").trim();
window.elCpHash=async(key,id,v)=>{const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(key+"|"+id+"|"+elCpNorm(v)));
  return [...new Uint8Array(b)].slice(0,10).map(x=>x.toString(16).padStart(2,"0")).join("")};
window.elCpScore=async(h,key,ids,answers)=>{if(!h||!h.items||!Array.isArray(ids)||!ids.length)return null;let n=0;
  for(let i=0;i<ids.length;i++){const v=(answers||[])[i];if(!elCpNorm(v))continue;const L=h.items[ids[i]]||[];if(L.includes(await elCpHash(key,ids[i],v)))n++}
  return {score:n,max:ids.length}};
window.elCpShown=(a,info,gid)=>!!(a&&a.checkpoint&&info&&info.cpShown&&info.cpShown[gid]&&info.cpShown[gid][a.id]);
window.elLpLocks=function(ls,open){const shut=(window.EL_CATALOG||[]).filter(a=>a.ls===ls&&!a.optional&&!open.includes(a.id));   // optional: never locked
  return {locked:shut.map(a=>a.id),lockedKeys:shut.flatMap(a=>a.keys.flatMap(k=>[k,k+"Level"]))}};
// Recall checkpoints open the way (Roger, 26 Oct 2026): an activity that comes after a checkpoint in its LS (catalogue order = LS page
// order) opens only when every earlier checkpoint is done. Only checkpoints the student can do count (enabled(x)), so a checkpoint the
// teacher has not enabled yet never blocks; the final product (manual) is never blocked. done(x) = Set of the student's done steps of x.
window.elCheckpointMissing=function(a,done,enabled){if(!a||a.manual||a.optional)return null;const list=(window.EL_CATALOG||[]).filter(x=>x.ls===a.ls),i=list.indexOf(a);
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

// 🧩 📚 Class game circles (Roger, 6 Nov 2026: "a kind of circle with a percentage on the board saying something like games and theory,
// click to see your performance and what to study … two, grammar and vocabulary, and I want those circles next to the students in the
// list"). elGameStats(games) takes class game results [{kind, r, of}] (myGames on the student board, gameResults on the dashboard) and gives
// {grammar, vocab} = % right (null when none played); elRing(p, label, size) draws one circle (inline styles, any page).
window.elGameStats=function(games){
  const t={grammar:[0,0],vocab:[0,0]};(games||[]).forEach(g=>{const k=t[g.kind];if(k&&g.of){k[0]+=g.r||0;k[1]+=g.of}});
  const pc=([a,b])=>b?Math.round(a/b*100):null;return {grammar:pc(t.grammar),vocab:pc(t.vocab),n:(games||[]).length}};
// The games behind a circle (Roger, 7 Nov 2026: "they should see grammar games, when they go to the percentage"): the hover text of a 🧩 or
// 📚 circle names its % and lists every game it counts, newest first, with that game's score. games = [{kind, r, of, title, day, lp}];
// ca = Catalan (Starter and Base students). Plain text with line breaks (a title attribute). Each game starts with its learning path
// (Roger, 7 Nov 2026: "they should start with LP1 and the name they already have"): "• LP2 · Clothes, kit and weather".
window.elGameTip=function(games,kind,ca){
  const T=ca?{grammar:"🧩 Jocs de gramàtica",vocab:"📚 Jocs de vocabulari",right:"encerts",none:"Encara cap joc"}:{grammar:"🧩 Grammar games",vocab:"📚 Vocabulary games",right:"right",none:"No games yet"};
  const l=(games||[]).filter(g=>g.kind===kind&&g.of).sort((a,b)=>String(b.day||"").localeCompare(String(a.day||""))),r=l.reduce((a,g)=>a+(g.r||0),0),of=l.reduce((a,g)=>a+g.of,0);
  if(!l.length)return `${T[kind]||kind}: ${T.none}`;
  const day=d=>{if(!d)return "";const x=new Date(d+"T12:00");return isNaN(x)?"":x.toLocaleDateString(ca?"ca":"en-GB",{day:"numeric",month:"short"})};
  const name=t=>String(t||"").replace(/^(Vocabulary|Grammar|Vocabulari|Gramàtica) · /,"");
  return `${T[kind]}: ${Math.round(r/of*100)} % ${T.right} (${r} / ${of})\n`+l.map(g=>`• ${g.lp?String(g.lp).split(" · ")[0]+" · ":""}${name(g.title)}${day(g.day)?" · "+day(g.day):""}: ${g.r||0} / ${g.of} (${Math.round((g.r||0)/g.of*100)} %)`).join("\n")};
window.elRing=function(p,label,size,tip){
  const z=size||46,col=p==null?"#cbd5e1":p<50?"#dc2626":p<80?"#d97706":"#16a34a",q=s=>String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");
  return `<span style="display:inline-flex;align-items:center;gap:6px;vertical-align:middle" title="${q(tip||label+": "+(p==null?"–":p+" %"))}"><span style="width:${z}px;height:${z}px;border-radius:50%;flex:0 0 auto;display:grid;place-items:center;background:conic-gradient(${col} ${(p||0)*3.6}deg,#e5e7eb 0)"><b style="width:${z-10}px;height:${z-10}px;border-radius:50%;background:#fff;display:grid;place-items:center;font:800 ${Math.round(z/3.6)}px/1 system-ui,sans-serif;color:#0f172a">${p==null?"–":p+"%"}</b></span>${label?`<span style="font-size:${Math.max(11,Math.round(z/3.6))}px;font-weight:700;line-height:1.15">${label}</span>`:""}</span>`};
// ---- The students' left menu, ONE for every student page (Roger, 7 Nov 2026: "this should always be the same"): the board (today.html),
// the LS homes (el-ls-home.js) and Games, Practise, learning paths, vocabulary games, course pages (el-app.js) all draw it from here.
// 🏠 My dashboard · 🗂 My course · N ESO + its LSs · 📖 Books · 🔤 Grammar and vocabulary · 🎲 Games · 🎯 Practise · (🎬 How the website
// works, off for now) · ❓ Help · 📱 Study on your phone. The LSs: the ones the board showed last in this browser (el_menu_ls, saved by
// today.html), else the course's LSs not hidden in the last read status (el_ls_<id>, el-cloud.js). No Firestore reads.
window.EL_MENU_HOWTO=false;   // 🎬 How the website works in the menu: hidden for now (Roger, 7 Nov 2026: "take this out for the moment"); true brings it back
window.elMenuLs=function(courses,group){
  let ids=null;try{ids=JSON.parse(localStorage.getItem("el_menu_ls")||"null")}catch(e){}
  const L=window.EL_LS||[];
  if(Array.isArray(ids)&&ids.length){const s=ids.map(id=>L.find(l=>l.id===id)).filter(l=>l&&courses.includes(l.course));if(s.length)return s}   // the board's order
  const st={},info=id=>{if(!(id in st))try{st[id]=JSON.parse(localStorage.getItem("el_ls_"+id)||"null")}catch(e){st[id]=null}return st[id]};
  return L.filter(l=>{if(!courses.includes(l.course))return false;const i=info(l.id);
    if(!i)return true;if(i.status==="hidden")return false;return !group||!window.elLsForGroup||elLsForGroup(l,i,group)})
    .sort((a,b)=>(((info(b.id)||{}).status==="open")-((info(a.id)||{}).status==="open")));   // open LS first, as the board
};
// o: {root (site root URL, "" on today.html), courses:["4eso"], lss (LS list; default elMenuLs), group, ca (Catalan labels), board (the
// board's URL, ?student= in the teacher's student view), here: "board"|"marks"|"course:<c>"|"ls:<id>"|"books"|"lang"|"games"|"practise"|"help"|"phone",
// app (opened as a home-screen app: no 📱)} → the buttons' HTML (classes nv, nv sub, on; shared/css/el-app.css and ls-home.css)
window.elStudentMenu=function(o){
  const R=o.root||"",t=(ca,en)=>o.ca?ca:en,cs=o.courses||[],CN={"2eso":"2 ESO","4eso":"4 ESO"},board=o.board||R+"today.html",here=o.here||"";
  const lss=o.lss||elMenuLs(cs,o.group),q=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const b=(k,cls,h,ic,txt,x)=>{const on=k&&k===here;return `<a class="nv${cls}${on?" on":""}" href="${h}"${on?' aria-current="page"':""}${x||""}><span class="ic${/^LS\d/.test(ic)?" lsn":""}" aria-hidden="true">${ic}</span><span class="lb">${txt}</span></a>`};
  const bq=board.split("#")[0];
  // Practise right below My dashboard (Roger, 7 Nov 2026: "practice should be below my dashboard")
  // 📊 My marks right below My dashboard, on every student page (Roger, 7 Nov 2026: "i si posem les meves notes a sota del meu taulell?
  // i revisem que estigui allà sempre?"): the board's #marks place
  // 🎓 My progress below it (Roger, 9 Nov 2026: "a table with their results … they can choose term"): the board's #progress place
  return b("board","",bq,"🏠",t("El meu tauler","My dashboard"))+b("marks","",bq+"#marks","📊",t("Les meves notes","My marks"))+b("progress","",bq+"#progress","🎓",t("El meu progrés","My progress"))+b("practise","",R+"lab/practice.html","🎯",t("Practica","Practise"))
    +cs.map(c=>b("course:"+c,"",R+c+"/index.html","🗂",`${t("El meu curs","My course")} · ${CN[c]}`)
      +lss.filter(l=>l.course===c).map(l=>b("ls:"+l.id," sub",R+l.course+"/"+l.id.slice(l.course.length+1)+"/index.html",elLsNum(l)||"📚",q(String(l.title).replace(/^\S+ · /,"")))).join("")).join("")
    +(cs.length?b("books","",bq+"#books","📖",t("Llibres","Books"))+b("lang","",bq+"#language","🔤",t("Gramàtica i vocabulari","Grammar and vocabulary")):"")
    +b("games","",R+"lab/","🎲",t("Jocs","Games"))
    +(window.EL_MENU_HOWTO?b("","",`${R}video/how-english-lab-works${t("-ca","")}.mp4?v=20261102c`,"🎬",t("Com funciona la web","How the website works"),' target="_blank" rel="noopener"'):"")
    +b("help","",bq+"#help","❓",t("Ajuda","Help"))
    +(o.app?"":b("phone","",bq+"#phone","📱",t("Estudia amb el mòbil","Study on your phone")));
};

// The phone's bottom tab bar for students (Roger, 8 Nov 2026: "la visió del mòbil necessita un gran remodelació … no ha de tenir
// exactament el mateix que la visió web però sí la mateixa funcionalitat"; mockup option A): the same five tabs on every student page,
// shown only at ≤640 px wide (shared/css/el-phone.css); a computer or a Chromebook never sees it. Home · To do · LSn (the LS page) ·
// Practise (Practise and Games) · Me (the board's #me place: level, marks, books, help, problem, idea). The board keeps the To do and
// Homework counts in localStorage (el_ptabs) so the other pages show the same badge with no Firestore read.
// o: {root (site root URL), board (the board's URL, ?student= in the teacher's student view), ls (the LS object or id the LS tab opens),
// here: "home"|"todo"|"ls"|"practise"|"me", ca (Catalan labels), todo (badge; default the board's last count)} → puts nav.elptabs on the page
window.elPhoneTabs=function(o){
  const R=o.root||"",t=(ca,en)=>o.ca?ca:en,bq=(o.board||R+"today.html").split("#")[0];
  const L=typeof o.ls==="string"?(window.EL_LS||[]).find(l=>l.id===o.ls):o.ls;
  const lsH=L?R+L.course+"/"+L.id.slice(L.course.length+1)+"/index.html":bq+"#units",lsN=(L&&window.elLsNum&&elLsNum(L))||"LS";
  let n=o.todo;if(n==null)try{n=(JSON.parse(localStorage.getItem("el_ptabs")||"{}")||{}).todo||0}catch(e){n=0}
  const sv=p=>`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const I={home:'<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',todo:'<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="m8 12 3 3 5-6"/>',
    ls:'<path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z"/><path d="M5 18a2 2 0 0 1 2-2h12"/>',practise:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    me:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'};
  const it=[["home",bq,t("Inici","Home")],["todo",bq+"#todo",t("Per fer","To do")],["ls",lsH,lsN],["practise",R+"lab/practice.html",t("Practica","Practise")],["me",bq+"#me",t("Jo","Me")]];
  let b=document.querySelector("nav.elptabs");
  if(!b){b=document.createElement("nav");b.className="elptabs";document.body.append(b)}
  b.setAttribute("aria-label",t("Menú","Menu"));
  b.innerHTML=it.map(([k,h,l])=>{const on=k===o.here;return `<a href="${h}"${on?' class="on" aria-current="page"':""}><span class="pi">${sv(I[k])}</span><span class="pl">${l}</span>${k==="todo"&&n?`<b>${n>99?"99+":n}</b>`:""}</a>`}).join("");
  document.body.classList.add("elptab");
  return b;
};

// On an LS (its home and its learning paths) the students' side menu is a strip of icons that opens over the page (Roger, 8 Nov 2026:
// "when students are on the LS, to see better the screen, I want the menu to hide and only show the emoji or logos of each side. If the
// mouse goes on the section the menu gets bigger"). el-app.js (.elrail) and el-ls-home.js (aside.side) set body.elmini and call this with
// the menu: it puts a ☰ button before the brand. The mouse opens the menu (el-app.css, section 3); ☰ opens or closes it with a tap (a
// touch screen has no mouse to point with), a tap outside or Esc closes it. Calling it again after the menu is redrawn is fine.
window.elMiniRail=function(r){
  if(!r)return;
  if(!r.querySelector(":scope>.elmtop")){
    const top=document.createElement("div"),br=r.querySelector(":scope>.elr-brand,:scope>.brand");top.className="elmtop";
    top.innerHTML=`<button type="button" class="elmt" aria-label="Menu" title="Menu"><span aria-hidden="true">☰</span></button>`;
    r.prepend(top);if(br)top.append(br);
  }
  const set=o=>{r.classList.toggle("elopen",o);const b=r.querySelector(".elmt");if(b)b.setAttribute("aria-expanded",o?"true":"false")};
  set(r.classList.contains("elopen"));
  if(r.dataset.elmini)return;r.dataset.elmini="1";
  r.addEventListener("click",e=>{if(e.target.closest(".elmt")){e.preventDefault();set(!r.classList.contains("elopen"))}});
  document.addEventListener("click",e=>{if(r.classList.contains("elopen")&&!r.contains(e.target))set(false)},true);
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&r.classList.contains("elopen"))set(false)});
};

// The class tab (class mode, el-cloud.js cmTeacher) has no side menu (Roger, 7 Nov 2026: "when I stop the class this appears and I don't
// need it. Plus it appears for a sec when the class is running"): this file runs before any menu is drawn (el-app.js .elrail on the
// learning paths, el-ls-home.js .nvs on the LS home), so the browser tab opened with ?elcm= is marked at once (sessionStorage el_cmtab,
// kept for the tab's life) and its menu buttons are never shown, not even for a moment. While class mode is on, the left column stays
// as the place of 📋 Today (el-cm-agenda.js docks there); once it stops (html.elcmon taken off by cmTeacher's quit) the column goes too
// and the page uses the whole width. Other tabs (the dashboard, a normal learning path page) keep their menu.
(function () {
  let tab = false, on = false;
  try {
    if (new URLSearchParams(location.search).has("elcm")) sessionStorage.setItem("el_cmtab", "1");
    tab = sessionStorage.getItem("el_cmtab") === "1";
    const o = JSON.parse(sessionStorage.getItem("el_cm") || "null");
    on = new URLSearchParams(location.search).has("elcm") || !!(o && o.g && Date.now() < o.until);
  } catch (e) {}
  if (!tab) return;
  const h = document.documentElement;
  h.classList.add("elcmtab");
  if (on) h.classList.add("elcmon");
  const st = document.createElement("style");
  st.id = "el-cmtab-css";
  st.textContent = "html.elcmtab .elrail .elside,html.elcmtab .elrail .eln,html.elcmtab aside.side .nvs,"
    + "html.elcmtab .elbar,html.elcmtab .nvs-m,html.elcmtab #bnav,html.elcmtab .elptabs{display:none!important}"
    + "html.elcmtab:not(.elcmon) .elrail,html.elcmtab:not(.elcmon) aside.side{display:none!important}"
    + "html.elcmtab:not(.elcmon) body.elapp.elhas-rail{padding-left:0!important}"
    + "html.elcmtab:not(.elcmon) .app{grid-template-columns:minmax(0,1fr)!important}"
    // a narrow window: no room for the docked agenda (it floats above the chip), so no empty strip either
    + "@media (max-width:980px){html.elcmtab .elrail{display:none!important}html.elcmtab body.elapp.elhas-rail{padding-left:0!important}}";
  (document.head || h).append(st);
})();
