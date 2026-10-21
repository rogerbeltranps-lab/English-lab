// Activity catalogue used by pages, the student page and the teacher dashboard.
// Criteria are an editorial PROPOSAL from docs/learning-situations/my-real-routine/*.md; pending Roger's approval.
// points: number of actions in the activity; each completed action = 1 point.
// graded:false = not evaluated (warm-up, or in-class games/theory presentations: inClass:true) - always free to practise.
// graded:true  = evaluated; enabled by the teacher and can be done ONCE (submit locks it), unless manual.
// manual:true = scored by the teacher (not by counting actions); delivered through Google Classroom, not in this site.
// mode: "practice" = repeatable, "once" = can be submitted a single time.
window.EL_LEVELS=[{id:"insecure",name:"Insecure",ca:"Necessito molt suport i pautes (instruccions en català)."},{id:"safe",name:"Safe",ca:"Em sento segur/a amb una mica de suport (instruccions en anglès)."},{id:"daring",name:"Daring",ca:"Vull el repte: més autonomia i menys ajudes."}];
window.EL_LS=[
  {id:"2eso-my-real-routine",course:"2eso",title:"2ESO · My Real Routine"},
  {id:"4eso-my-real-routine",course:"4eso",title:"4ESO · My Real Routine"}
];
window.EL_CATALOG=(function(){
  const base=c=>c+"/my-real-routine/";
  const A=(course,file,title,criteria,keys,points,o)=>(a=>(a.mode=a.mode||(a.graded&&!a.manual?"once":"practice"),a))(Object.assign({id:course+"/"+file.replace(".html",""),ls:course+"-my-real-routine",course,path:base(course)+file,title,criteria,keys,points,graded:true},o||{}));
  return [
    A("2eso","getting-started.html","Getting started (warm-up)",["3.1"],["gettingStarted2ESO"],4,{graded:false}),
    A("2eso","a-day-in-my-life.html","A day in my life",["3.1","5.1"],["lp2StateV2"],10),
    A("2eso","same-day-different-person.html","Same day, different person",["3.1","5.1"],["s2SameDayState"],5),
    A("2eso","present-simple-grammar.html","Present simple grammar",["5.1"],[],0,{graded:false,inClass:true}),
    A("2eso","healthy-habits.html","Healthy habits",["3.1","5.1"],["healthyHabitsState2ESO"],10),
    A("2eso","vocabulary-games.html","Vocabulary games",["5.1"],[],0,{graded:false,inClass:true}),
    A("2eso","final-product.html","Final product",["3.1","3.2","3.3","5.1"],["finalProduct2ESO"],0,{manual:true}),
    A("4eso","getting-started.html","Getting started (warm-up)",["3.1"],["gettingStarted4ESO"],4,{graded:false}),
    A("4eso","a-day-in-real-life.html","A day in real life",["3.1","5.1"],["lp2StateV2_4ESO"],10),
    A("4eso","useful-expressions.html","Useful expressions",["3.1","5.1"],["s3Real4State"],5),
    A("4eso","grammar-phrasal-verbs.html","Grammar: phrasal verbs",["5.1"],[],0,{graded:false,inClass:true}),
    A("4eso","healthy-habits.html","Healthy habits",["3.1","5.2"],["healthyHabitsState4ESO"],10),
    A("4eso","vocabulary-games.html","Vocabulary games",["5.1"],[],0,{graded:false,inClass:true}),
    A("4eso","final-product.html","Final product",["3.1","3.2","3.3","5.1","5.2"],["finalProduct4ESO"],0,{manual:true})
  ];
})();
// Number of distinct completed actions (truthy keys inside any "done" map) in a synced localStorage state string.
window.elDone=function(str){const s=new Set();try{(function w(o){if(o&&typeof o==="object"){for(const k in o){if(k==="done"&&o[k]&&typeof o[k]==="object"){for(const d in o[k])if(o[k][d])s.add(d)}else w(o[k])}}})(JSON.parse(str))}catch(e){}return s.size};
// Points of an activity from the current localStorage (capped at the activity's total).
window.elPoints=function(a,get){const g=get||(k=>localStorage.getItem(k));let n=0;a.keys.forEach(k=>n+=elDone(g(k)));return Math.min(n,a.points)};
window.elToday=function(){const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
