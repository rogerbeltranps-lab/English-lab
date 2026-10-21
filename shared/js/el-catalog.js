// Activity catalogue used by pages, Today (students) and the teacher dashboard.
// Criteria are an editorial PROPOSAL from docs/learning-situations/my-real-routine/*.md; pending Roger's approval.
// mode: "practice" = repeatable, "once" = can be done/submitted a single time.  graded:false = practice only, not evaluated.
window.EL_LS=[
  {id:"2eso-my-real-routine",course:"2eso",title:"2ESO · My Real Routine"},
  {id:"4eso-my-real-routine",course:"4eso",title:"4ESO · My Real Routine"}
];
window.EL_CATALOG=(function(){
  const base=c=>c+"/my-real-routine/";
  const A=(course,file,title,criteria,keys,o)=>Object.assign({id:course+"/"+file.replace(".html",""),ls:course+"-my-real-routine",course,path:base(course)+file,title,criteria,keys,mode:"practice",graded:true},o||{});
  return [
    A("2eso","getting-started.html","Getting started (warm-up)",["3.1"],["gettingStarted2ESO"],{graded:false}),
    A("2eso","a-day-in-my-life.html","A day in my life",["3.1","5.1"],["lp2StateV2"]),
    A("2eso","same-day-different-person.html","Same day, different person",["3.1","5.1"],["s2SameDayState"]),
    A("2eso","present-simple-grammar.html","Present simple grammar",["5.1"],[]),
    A("2eso","healthy-habits.html","Healthy habits",["3.1","5.1"],["healthyHabitsState2ESO"]),
    A("2eso","vocabulary-games.html","Vocabulary games",["5.1"],[]),
    A("2eso","final-product.html","Final product",["3.1","3.2","3.3","5.1"],["finalProduct2ESO"],{mode:"once"}),
    A("4eso","getting-started.html","Getting started (warm-up)",["3.1"],["gettingStarted4ESO"],{graded:false}),
    A("4eso","a-day-in-real-life.html","A day in real life",["3.1","5.1"],["lp2StateV2_4ESO"]),
    A("4eso","useful-expressions.html","Useful expressions",["3.1","5.1"],["s3Real4State"]),
    A("4eso","grammar-phrasal-verbs.html","Grammar: phrasal verbs",["5.1"],[]),
    A("4eso","healthy-habits.html","Healthy habits",["3.1","5.2"],["healthyHabitsState4ESO"]),
    A("4eso","vocabulary-games.html","Vocabulary games",["5.1"],[]),
    A("4eso","final-product.html","Final product",["3.1","3.2","3.3","5.1","5.2"],["finalProduct4ESO"],{mode:"once"})
  ];
})();
// Counts completed steps ("done" maps) inside a synced localStorage state string.
window.elDone=function(str){let n=0;try{(function w(o){if(o&&typeof o==="object"){for(const k in o){if(k==="done"&&o[k]&&typeof o[k]==="object")n+=Object.values(o[k]).filter(Boolean).length;else w(o[k])}}})(JSON.parse(str))}catch(e){}return n};
window.elToday=function(){const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
