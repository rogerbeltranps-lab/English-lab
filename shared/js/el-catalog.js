// Activity catalogue used by pages, the student page and the teacher dashboard.
// Criteria are an editorial PROPOSAL from docs/*/ls1-my-real-routine/overview.md; pending Roger's approval.
// points: number of actions in the activity; each completed action = 1 point.
// graded:false = not evaluated (warm-up, or in-class games/theory presentations: inClass:true) - always free to practise.
// graded:true  = evaluated; enabled by the teacher and can be done ONCE (submit locks it), unless manual.
// skip: done-keys not scored (LP writings are practised but not corrected yet; "match" is vocabulary review, not submittable).
// manual:true = scored by the teacher (not by counting actions); delivered through Google Classroom, not in this site.
// steps: final-product steps (id, title) whose hand-ins (state.steps in the page's key) the dashboard shows; pieces: product-pieces key.
// mode: "practice" = repeatable, "once" = can be submitted a single time.
// LS1 My Real Routine (Roger, 25 Oct 2026): done in class and redesigned for next year; only the exam and the final product count,
// so its learning paths are graded:false (practice). Results already saved stay in Firestore.
// Beginners (Roger, 26 Oct 2026): A1, below Insecure, Catalan with heavy scaffolding; the teacher sets it. The teacher sets every route (Roger, 30 Oct 2026: students never choose one, they can only ask for a change on their board).
// Native (Roger, 30 Oct 2026): above Daring, for a native speaker preparing Cambridge C2 Proficiency (4 ESO); only the teacher sets it. Pages
// without Native content show the Daring version (applyLevel in el-cloud.js, ls2-engine.js).
// Level names (Roger, 30 Oct 2026: "no need for old names in the app any more"): the app shows only Starter · Base · Core · Plus · Pro,
// teacher dashboard included. The ids (beginners, insecure, safe, daring, native) stay in the code, the data and the docs.
window.EL_LEVELS=[{id:"beginners",name:"Starter",student:"Starter",ca:"Començo des de zero: molt suport, passos curts i instruccions en català.",en:"I am starting from zero: a lot of support, short steps and instructions in Catalan."},{id:"insecure",name:"Base",student:"Base",ca:"Necessito molt suport i pautes (instruccions en català).",en:"I need a lot of support and guidance (instructions in Catalan)."},{id:"safe",name:"Core",student:"Core",ca:"Em sento segur/a amb una mica de suport (instruccions en anglès).",en:"I feel confident with a little support (instructions in English)."},{id:"daring",name:"Plus",student:"Plus",ca:"Vull el repte: més autonomia i menys ajudes.",en:"I want the challenge: more independence and less help."},{id:"native",name:"Pro",student:"Pro",ask:false,ca:"Parlo anglès com a llengua materna i em preparo per al C2 Proficiency de Cambridge.",en:"English is my first language and I am preparing for Cambridge C2 Proficiency."}];
// Class groups. The student picks one the first time they sign in; the teacher can change it in the dashboard.
window.elCa=l=>l==="beginners"||l==="insecure";   // routes that read instructions in Catalan
// The student's route in an LS. The teacher sets routes (Roger, 26 Oct 2026: from the LS1 exam mark, on the dashboard). An LS with
// no route of its own takes the latest route set in an earlier LS of the same course (EL_LS order), so a route carries over to every
// later LS until the teacher changes it. lv = {lsId: {level, by}}. Returns {level, from, own}: from = the LS whose route it is (null: no
// route yet); own = a route a 2 ESO student chose before 30 Oct 2026 (by:"student"; it still counts but is not shown as theirs, and
// students can no longer write it). A route the teacher set, in any LS of the course, wins over it.
window.elRouteOf=function(lv,ls){lv=lv||{};const L=window.EL_LS||[],me=L.find(x=>x.id===ls),
    chain=[ls].concat(me?L.slice(0,L.indexOf(me)).reverse().filter(x=>x.course===me.course).map(x=>x.id):[]),
    find=(ids,mine)=>{for(const id of ids){const l=lv[id]||{};if(l.level&&(l.by==="student")===mine)return {level:l.level,from:id,own:mine}}return null},
    later=me?L.slice(L.indexOf(me)+1).filter(x=>x.course===me.course).map(x=>x.id):[];   // a route the teacher set later also replaces the student's choice
  const own=find(chain,true);return find(chain,false)||own&&(find(later,false)||own)||{level:null,from:null,own:false}};
// Route from the LS1 exam mark (out of 10), default cut-offs per course: under beginners → Starter, under insecure → Base,
// under safe → Core, otherwise Plus (Roger, 30 Oct 2026: under 3 Starter, 3 to under 6 Base, 6 to under 8 Core, 8 or more Plus).
// Roger can change them on the dashboard (settings/routes in Firestore overrides these). Pro is never given by a mark.
window.EL_ROUTE_CUTS={"2eso":{beginners:3,insecure:6,safe:8},"4eso":{beginners:3,insecure:6,safe:8}};
window.elRouteFromMark=(m,c)=>m==null||isNaN(m)?null:m<c.beginners?"beginners":m<c.insecure?"insecure":m<c.safe?"safe":"daring";
window.EL_GROUPS=[{id:"2ESOA",course:"2eso",name:"2ESO A"},{id:"2ESOB",course:"2eso",name:"2ESO B"},{id:"4ESOA",course:"4eso",name:"4ESO A"},{id:"4ESOB",course:"4eso",name:"4ESO B"}];
// Is an LS assigned to a group? ls/{id}.groups lists the groups (set in the teacher dashboard); without it, every group of the LS's course.
window.elLsForGroup=function(ls,info,gid){const g=(window.EL_GROUPS||[]).find(x=>x.id===gid);if(!g||!ls)return false;return info&&Array.isArray(info.groups)?info.groups.includes(gid):g.course===ls.course};
// study (optional): start of the path of the vocabulary and grammar summary PDFs; the board adds the route + ".pdf".
window.EL_LS=[
  {id:"2eso-my-real-routine",course:"2eso",title:"2ESO · My Real Routine",study:"2eso/my-real-routine/downloads/ls1-vocabulary-grammar-"},
  {id:"4eso-my-real-routine",course:"4eso",title:"4ESO · My Real Routine",study:"4eso/my-real-routine/downloads/ls1-vocabulary-grammar-",pro:true},
  {id:"4eso-seasons-and-celebrations",course:"4eso",title:"4ESO · Seasons & Celebrations",study:"4eso/seasons-and-celebrations/downloads/ls2-vocabulary-grammar-",pro:true},
  {id:"2eso-free-time-live",course:"2eso",title:"2ESO · Free Time, Live!",study:"2eso/free-time-live/downloads/ls2-vocabulary-grammar-"}
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
    A("2eso","final-product.html","Final product",["3.1","3.2","3.3","5.1"],["finalProduct2ESO"],0,{manual:true}),
    A("4eso","getting-started.html","Getting started (warm-up)",["3.1"],["gettingStarted4ESO"],4,{graded:false}),
    A("4eso","a-day-in-real-life.html","A day in real life",["3.1","5.1"],["lp2StateV2_4ESO"],8,{skip:["write","match"],graded:false}),
    A("4eso","useful-expressions.html","Useful expressions",["3.1","5.1"],["s3Real4State"],4,{skip:["write"],graded:false}),
    A("4eso","grammar-phrasal-verbs.html","Grammar: phrasal verbs",["5.1"],["s4GrammarState"],5,{graded:false}),
    A("4eso","healthy-habits.html","Healthy habits",["3.1","5.2"],["healthyHabitsState4ESO"],8,{skip:["write","match"],graded:false}),
    A("4eso","vocabulary-games.html","Vocabulary games",["5.1"],[],0,{graded:false,inClass:true}),
    A("4eso","final-product.html","Final product",["3.1","3.2","3.3","5.1","5.2"],["finalProduct4ESO"],0,{manual:true}),
    ...(function(){
      // LS2: ids carry the LS so they never clash with My Real Routine pages of the same name.
      const L=(file,title,criteria,key,points,o)=>A("4eso",file,title,criteria,[key],points,Object.assign({id:"4eso/ls2-"+file.replace(".html",""),ls:"4eso-seasons-and-celebrations",path:"4eso/seasons-and-celebrations/"+file},o||{}));
      const C={mode:"practice",checkpoint:true};   // recall checkpoint: opens the way to what comes after it (elCheckpointMissing)
      return [
        L("getting-started.html","Getting started: Castanyada & Halloween (warm-up)",["4.1","2.2"],"ls2GettingStarted4ESO",5,{graded:false}),
        L("celebrations-around-the-world.html","Celebrations around the world",["4.1","2.2","5.1","3.2","1.1"],"ls2Celebrations4ESO",9,{skip:["write"],steps:[["log","Reading log"]]}),
        L("recall-checkpoint-1.html","Recall checkpoint 1",["4.1","5.1"],"ls2Checkpoint14ESO",1,C),
        L("where-traditions-come-from.html","Where traditions come from",["2.2","5.1","1.2","3.2"],"ls2Traditions4ESO",9,{skip:["write"],steps:[["chart","Listening chart"],["talk","Talk"]]}),
        L("recall-checkpoint-2.html","Recall checkpoint 2",["4.1","5.1"],"ls2Checkpoint24ESO",1,C),
        L("research-it-right.html","Research it right",["4.2","6.1","1.2","CC3 3.2"],"ls2Research4ESO",9,{steps:[["card","Research card"],["talk","Talk"]]}),
        L("plan-the-day.html","Plan the day",["2.2","5.1","3.2","CC1 1.3"],"ls2Plan4ESO",9,{skip:["write"],steps:[["talk","Talk"]]}),
        L("recall-checkpoint-3.html","Recall checkpoint 3",["4.1","5.1"],"ls2Checkpoint34ESO",1,C),
        L("write-to-the-head-teacher.html","Write to the head teacher",["4.1","5.1","3.2","CC1 1.3"],"ls2Email4ESO",9,{skip:["write"],steps:[["talk","Talk"]]}),
        L("recall-checkpoint-4.html","Recall checkpoint 4",["4.1","5.1"],"ls2Checkpoint44ESO",1,C),
        L("sample-exam.html","Sample exam",["2.2","4.1","5.1"],"ls2SampleExam4ESO",7,{graded:false}),
        L("celebration-day-proposal.html","Final product: Celebration Day Proposal",["1.1","1.2","3.2","4.2","5.1","6.1","CC1 1.3","CC3 3.2"],"ls2FinalProduct4ESO",0,{manual:true,steps:[["prep","0 · My pieces"],["source","1 · My source"],["contribution","2 · My contribution"],["part","3 · My part"],["email","4 · My email"],["feedback","Feedback to a group"],["team","5 · Teamwork"]],pieces:"ls2Products4ESO"}),
        L("reflect.html","Reflect",[],"ls2Reflect4ESO",1,{graded:false})
      ];
    })(),
    ...(function(){
      // 2ESO LS2 Free Time, Live! (built from the 4ESO LS2 model; docs/2eso/ls2-free-time-live/). Individual vlog, so no group steps.
      const L=(file,title,criteria,key,points,o)=>A("2eso",file,title,criteria,[key],points,Object.assign({id:"2eso/ls2-"+file.replace(".html",""),ls:"2eso-free-time-live",path:"2eso/free-time-live/"+file},o||{}));
      const C={mode:"practice",checkpoint:true};   // recall checkpoint: opens the way to what comes after it (elCheckpointMissing)
      return [
        L("getting-started.html","Getting started: what do you do in your free time? (warm-up)",["4.1","2.2"],"ls2GettingStarted2ESO",6,{graded:false}),
        L("what-are-they-doing.html","What are they doing?",["4.1","2.2","5.1","3.2"],"ls2Doing2ESO",11,{skip:["write"],steps:[["log","Reading log"],["talk","Talk"]]}),
        L("recall-checkpoint-1.html","Recall checkpoint 1",["4.1","5.1"],"ls2Checkpoint12ESO",1,C),
        L("now-or-usually.html","Now or usually?",["2.2","5.1","3.2"],"ls2NowUsually2ESO",9,{skip:["write"],steps:[["chart","Listening chart"],["talk","Talk"]]}),
        L("recall-checkpoint-2.html","Recall checkpoint 2",["4.1","5.1"],"ls2Checkpoint22ESO",1,C),
        L("check-the-source.html","Check the source",["4.2","6.2"],"ls2Source2ESO",9,{steps:[["factfile","Fact file"],["talk","Talk"]]}),
        L("likes-and-screen-tips.html","Likes and screen tips",["2.2","5.1","3.2","CD4 4.5"],"ls2Tips2ESO",9,{skip:["write"],steps:[["talk","Talk"]]}),
        L("recall-checkpoint-3.html","Recall checkpoint 3",["4.1","5.1"],"ls2Checkpoint32ESO",1,C),
        L("write-your-vlog-script.html","Write your vlog script",["4.1","5.1","3.2"],"ls2Script2ESO",9,{skip:["write"],steps:[["talk","Talk"]]}),
        L("recall-checkpoint-4.html","Recall checkpoint 4",["4.1","5.1"],"ls2Checkpoint42ESO",1,C),
        L("sample-exam.html","Sample exam",["2.2","4.1","5.1"],"ls2SampleExam2ESO",7,{graded:false}),
        L("free-time-vlog.html","Final product: Free Time Vlog",["3.2","4.2","5.1","6.2","CD2 2.2","CD4 4.5"],"ls2FinalProduct2ESO",0,{manual:true,steps:[["prep","0 · My pieces"],["source","1 · My source"],["slides","2 · My slides"],["script","3 · My script"],["edit","4 · Record and edit"],["feedback","Feedback for my buddy"],["tips","5 · My tip"]],pieces:"ls2Products2ESO"}),
        L("reflect.html","Reflect",[],"ls2Reflect2ESO",1,{graded:false})
      ];
    })()
  ];
})();
// Number of distinct completed actions (truthy keys inside any "done" map) in a synced localStorage state string.
window.elDone=function(str,skip){skip=skip||[];const s=new Set();try{(function w(o){if(o&&typeof o==="object"){for(const k in o){if(k==="done"&&o[k]&&typeof o[k]==="object"){for(const d in o[k])if(o[k][d]&&!skip.includes(d))s.add(d)}else w(o[k])}}})(JSON.parse(str))}catch(e){}return s.size};
// Points of an activity from the current localStorage (capped at the activity's total).
window.elPoints=function(a,get){const g=get||(k=>localStorage.getItem(k));let n=0;a.keys.forEach(k=>n+=elDone(g(k),a.skip));return Math.min(n,a.points)};
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
    "4eso/ls2-where-traditions-come-from":[...LP,"listen","chart","grammar","mixed","write","speak","talk"],
    "4eso/ls2-research-it-right":["recall","read","sources","respect","notes","credit","again","talk","card"],
    "4eso/ls2-plan-the-day":[...LP,"listen","again","grammar","mixed","write","speak","talk"],
    "4eso/ls2-write-to-the-head-teacher":[...LP,"read","register","again","grammar","write","speak","talk"],
    "4eso/ls2-recall-checkpoint-1":["check"],"4eso/ls2-recall-checkpoint-2":["check"],"4eso/ls2-recall-checkpoint-3":["check"],"4eso/ls2-recall-checkpoint-4":["check"],
    "4eso/ls2-sample-exam":["listen","chart","read","log","vocab","grammar","write"],
    "4eso/ls2-celebration-day-proposal":["video","email","submit"],
    "4eso/ls2-reflect":["reflect"]
  });
  // Revised programme (24 Oct 2026): 2.1, 3.1, 6.2 and CE2 2.3 are no longer LS2 criteria, so speaking steps practise the pitch (3.2).
  // Four skills (Roger, 30 Oct 2026): Use of English steps heard (practice and grammar, "listen and complete") give 2.2 + 5.1; said steps ("say it") and Talk give 3.2.
  // Cards (4 ESO LP3–LP6, 2 ESO LP2–LP6): the card asks the student to say the word aloud before turning it, so they give 4.1 + 3.2 (Roger, 30 Oct 2026: paths students had started stay as they were).
  const LW=["2.2","5.1"],S=["3.2"],RS=["4.1","3.2"];
  window.EL_STEP_CRITERIA={
    "4eso/ls2-getting-started":{read:["4.1"],listen:["2.2"],speak:[]},
    "4eso/ls2-celebrations-around-the-world":{read:["4.1"],log:["4.1"],listen:["2.2"],write:["5.1"],speak:["3.2","1.1"]},
    "4eso/ls2-where-traditions-come-from":{cards:RS,listen:["2.2"],chart:["2.2"],practice:LW,grammar:LW,mixed:S,write:["5.1","1.2"],speak:["3.2","1.2"],talk:S},
    "4eso/ls2-research-it-right":{read:["4.2"],sources:["4.2"],respect:["1.2","CC3 3.2"],notes:["6.1"],credit:["6.1"],again:["2.2"],talk:S,card:["4.2","6.1","CC3 3.2"]},
    "4eso/ls2-plan-the-day":{cards:RS,listen:["2.2"],again:["2.2"],practice:LW,grammar:LW,mixed:S,write:["5.1","CC1 1.3"],speak:["3.2"],talk:S},
    "4eso/ls2-write-to-the-head-teacher":{cards:RS,read:["4.1"],register:["5.1"],again:["2.2"],practice:LW,grammar:S,write:["5.1","CC1 1.3"],speak:["3.2"],talk:S},
    "4eso/ls2-recall-checkpoint-1":ck,"4eso/ls2-recall-checkpoint-2":ck,"4eso/ls2-recall-checkpoint-3":ck,"4eso/ls2-recall-checkpoint-4":ck,
    "4eso/ls2-sample-exam":{listen:["2.2"],chart:["2.2"],read:["4.1"],log:["4.1"],write:["5.1"]},
    "4eso/ls2-celebration-day-proposal":{video:["3.2","1.1","1.2","CC3 3.2"],email:["5.1","CC1 1.3"],submit:[]},
    "4eso/ls2-reflect":{reflect:[]}
  };
})();
// LS2 2ESO Free Time, Live!: steps per page and the criterion each step gives evidence for (docs/2eso/ls2-free-time-live/assessment-criteria.md).
(function(){
  const LP=["recall","cards","practice"],ck={check:["4.1","5.1"]},LW=["2.2","5.1"],S=["3.2"],RS=["4.1","3.2"];
  Object.assign(window.EL_ACTIONS,{
    "2eso/ls2-getting-started":[...LP,"read","listen","speak"],
    "2eso/ls2-what-are-they-doing":[...LP,"read","log","listen","again","grammar","mixed","write","speak","talk"],
    "2eso/ls2-now-or-usually":[...LP,"listen","chart","grammar","mixed","write","speak","talk"],
    "2eso/ls2-check-the-source":[...LP,"read","sources","credit","again","talk","factfile"],
    "2eso/ls2-likes-and-screen-tips":[...LP,"listen","again","grammar","mixed","write","speak","talk"],
    "2eso/ls2-write-your-vlog-script":[...LP,"read","parts","again","grammar","write","speak","talk"],
    "2eso/ls2-recall-checkpoint-1":["check"],"2eso/ls2-recall-checkpoint-2":["check"],"2eso/ls2-recall-checkpoint-3":["check"],"2eso/ls2-recall-checkpoint-4":["check"],
    "2eso/ls2-sample-exam":["listen","chart","read","log","vocab","grammar","write"],
    "2eso/ls2-free-time-vlog":["video","submit"],
    "2eso/ls2-reflect":["reflect"]
  });
  Object.assign(window.EL_STEP_CRITERIA,{
    "2eso/ls2-getting-started":{read:["4.1"],listen:["2.2"],speak:[]},
    "2eso/ls2-what-are-they-doing":{cards:RS,read:["4.1"],log:["4.1"],listen:["2.2"],again:["2.2"],practice:LW,grammar:LW,mixed:S,write:["5.1"],speak:["3.2"],talk:S},
    "2eso/ls2-now-or-usually":{cards:RS,listen:["2.2"],chart:["2.2"],practice:LW,grammar:LW,mixed:S,write:["5.1"],speak:["3.2"],talk:S},
    "2eso/ls2-check-the-source":{cards:RS,read:["4.2"],sources:["4.2"],credit:["6.2"],practice:LW,again:["2.2"],talk:S,factfile:["4.2","6.2"]},
    "2eso/ls2-likes-and-screen-tips":{cards:RS,listen:["2.2"],again:["2.2"],practice:LW,grammar:LW,mixed:S,write:["5.1","CD4 4.5"],speak:["3.2","CD4 4.5"],talk:S},
    "2eso/ls2-write-your-vlog-script":{cards:RS,read:["4.1"],parts:["5.1"],again:["2.2"],practice:LW,grammar:S,write:["5.1"],speak:["3.2"],talk:S},
    "2eso/ls2-recall-checkpoint-1":ck,"2eso/ls2-recall-checkpoint-2":ck,"2eso/ls2-recall-checkpoint-3":ck,"2eso/ls2-recall-checkpoint-4":ck,
    "2eso/ls2-sample-exam":{listen:["2.2"],chart:["2.2"],read:["4.1"],log:["4.1"],write:["5.1"]},
    "2eso/ls2-free-time-vlog":{video:["3.2","CD2 2.2"],submit:[]},
    "2eso/ls2-reflect":{reflect:[]}
  });
})();
// Use of English is reading and writing (Roger, 30 Oct 2026: "the vocabulary sections of the learning path count as reading and writing alike,
// since they read and then practise by writing, completing sentences or choosing an option"): in every activity with step criteria, a
// vocabulary or grammar step with none of its own (recall, words, cards, practice, grammar, mixed, vocab) gives evidence for 4.1 and 5.1.
(function(){const UOE=["recall","words","cards","practice","grammar","mixed","vocab"];
  Object.keys(window.EL_STEP_CRITERIA).forEach(id=>{const sc=window.EL_STEP_CRITERIA[id];(window.EL_ACTIONS[id]||[]).forEach(k=>{if(UOE.includes(k)&&!sc[k])sc[k]=["4.1","5.1"]})})})();
