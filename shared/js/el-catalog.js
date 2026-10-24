// Activity catalogue used by pages, the student page and the teacher dashboard.
// Criteria are an editorial PROPOSAL from docs/*/ls1-my-real-routine/overview.md; pending Roger's approval.
// points: number of actions in the activity; each completed action = 1 point.
// graded:false = not evaluated (warm-up, or in-class games/theory presentations: inClass:true) - always free to practise.
// graded:true  = evaluated; enabled by the teacher and can be done ONCE (submit locks it), unless manual.
// skip: done-keys not scored (LP writings are practised but not corrected yet; AI feedback only).
// manual:true = scored by the teacher (not by counting actions); delivered through Google Classroom, not in this site.
// mode: "practice" = repeatable, "once" = can be submitted a single time.
window.EL_LEVELS=[{id:"insecure",name:"Insecure",ca:"Necessito molt suport i pautes (instruccions en català)."},{id:"safe",name:"Safe",ca:"Em sento segur/a amb una mica de suport (instruccions en anglès)."},{id:"daring",name:"Daring",ca:"Vull el repte: més autonomia i menys ajudes."}];
window.EL_LS=[
  {id:"2eso-my-real-routine",course:"2eso",title:"2ESO · My Real Routine"},
  {id:"4eso-my-real-routine",course:"4eso",title:"4ESO · My Real Routine"},
  {id:"4eso-seasons-and-celebrations",course:"4eso",title:"4ESO · Seasons & Celebrations"}
];
window.EL_CATALOG=(function(){
  const base=c=>c+"/my-real-routine/";
  const A=(course,file,title,criteria,keys,points,o)=>(a=>(a.mode=a.mode||(a.graded&&!a.manual?"once":"practice"),a))(Object.assign({id:course+"/"+file.replace(".html",""),ls:course+"-my-real-routine",course,path:base(course)+file,title,criteria,keys,points,graded:true},o||{}));
  return [
    A("2eso","getting-started.html","Getting started (warm-up)",["3.1"],["gettingStarted2ESO"],4,{graded:false}),
    A("2eso","a-day-in-my-life.html","A day in my life",["3.1","5.1"],["lp2StateV2"],9,{skip:["write"]}),
    A("2eso","same-day-different-person.html","Same day, different person",["3.1","5.1"],["s2SameDayState"],4,{skip:["write"]}),
    A("2eso","present-simple-grammar.html","Present simple grammar",["5.1"],["s2GrammarState"],5),
    A("2eso","healthy-habits.html","Healthy habits",["3.1","5.1"],["healthyHabitsState2ESO"],9,{skip:["write"]}),
    A("2eso","vocabulary-games.html","Vocabulary games",["5.1"],[],0,{graded:false,inClass:true}),
    A("2eso","final-product.html","Final product",["3.1","3.2","3.3","5.1"],["finalProduct2ESO"],0,{manual:true}),
    A("4eso","getting-started.html","Getting started (warm-up)",["3.1"],["gettingStarted4ESO"],4,{graded:false}),
    A("4eso","a-day-in-real-life.html","A day in real life",["3.1","5.1"],["lp2StateV2_4ESO"],9,{skip:["write"]}),
    A("4eso","useful-expressions.html","Useful expressions",["3.1","5.1"],["s3Real4State"],4,{skip:["write"]}),
    A("4eso","grammar-phrasal-verbs.html","Grammar: phrasal verbs",["5.1"],["s4GrammarState"],5),
    A("4eso","healthy-habits.html","Healthy habits",["3.1","5.2"],["healthyHabitsState4ESO"],9,{skip:["write"]}),
    A("4eso","vocabulary-games.html","Vocabulary games",["5.1"],[],0,{graded:false,inClass:true}),
    A("4eso","final-product.html","Final product",["3.1","3.2","3.3","5.1","5.2"],["finalProduct4ESO"],0,{manual:true}),
    ...(function(){
      // LS2: ids carry the LS so they never clash with My Real Routine pages of the same name.
      const L=(file,title,criteria,key,points,o)=>A("4eso",file,title,criteria,[key],points,Object.assign({id:"4eso/ls2-"+file.replace(".html",""),ls:"4eso-seasons-and-celebrations",path:"4eso/seasons-and-celebrations/"+file},o||{}));
      const C={mode:"practice"};
      return [
        L("getting-started.html","Getting started: Castanyada & Halloween (warm-up)",["4.1","2.1","3.1"],"ls2GettingStarted4ESO",5,{graded:false}),
        L("celebrations-around-the-world.html","Celebrations around the world",["2.1","3.1","4.1","5.1"],"ls2Celebrations4ESO",8,{skip:["write"]}),
        L("recall-checkpoint-1.html","Recall checkpoint 1",["4.1"],"ls2Checkpoint14ESO",1,C),
        L("where-traditions-come-from.html","Where traditions come from",["1.1","2.1","3.1","5.1"],"ls2Traditions4ESO",7,{skip:["write"]}),
        L("research-it-right.html","Research it right",["1.2","4.2","6.1","6.2"],"ls2Research4ESO",7),
        L("recall-checkpoint-2.html","Recall checkpoint 2",["4.1"],"ls2Checkpoint24ESO",1,C),
        L("plan-the-day.html","Plan the day",["2.1","3.1","5.1"],"ls2Plan4ESO",7,{skip:["write"]}),
        L("recall-checkpoint-3.html","Recall checkpoint 3",["4.1"],"ls2Checkpoint34ESO",1,C),
        L("write-to-the-head-teacher.html","Write to the head teacher",["3.2","4.1","5.1"],"ls2Email4ESO",7,{skip:["write"]}),
        L("recall-checkpoint-4.html","Recall checkpoint 4",["4.1"],"ls2Checkpoint44ESO",1,C),
        L("sample-exam.html","Sample exam",["2.1","4.1","5.1"],"ls2SampleExam4ESO",4,{graded:false}),
        L("celebration-day-proposal.html","Final product: Celebration Day Proposal",["1.3","3.1","3.2","5.1","6.2"],"ls2FinalProduct4ESO",0,{manual:true}),
        L("reflect.html","Reflect",["3.1"],"ls2Reflect4ESO",1,{graded:false})
      ];
    })()
  ];
})();
// Number of distinct completed actions (truthy keys inside any "done" map) in a synced localStorage state string.
window.elDone=function(str,skip){skip=skip||[];const s=new Set();try{(function w(o){if(o&&typeof o==="object"){for(const k in o){if(k==="done"&&o[k]&&typeof o[k]==="object"){for(const d in o[k])if(o[k][d]&&!skip.includes(d))s.add(d)}else w(o[k])}}})(JSON.parse(str))}catch(e){}return s.size};
// Points of an activity from the current localStorage (capped at the activity's total).
window.elPoints=function(a,get){const g=get||(k=>localStorage.getItem(k));let n=0;a.keys.forEach(k=>n+=elDone(g(k),a.skip));return Math.min(n,a.points)};
window.elToday=function(){const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
