// Map of the integrated competences (CE1, CE6–CE10) per LS (Roger, 31 Oct 2026: "we should also have this map in the year distribution").
// Shown at the top of the dashboard's 📆 Whole school year view. For each course, LS number → {name, prog, work}:
//   prog: the criteria the annual programme assesses in that LS (docs/<course>/programme.md, coverage table);
//   work: how the other integrated competences are worked: "implicit" (○), "little" (○, thin), "planned" (◇, not built yet:
//         serial story for CE7, short mediation step for CE8). A competence missing from both = not worked (—).
// ● (assessed) comes from the LS's grading plan (EL_GRADING) once the LS is on the site, else from prog. The LS project updates this
// file when it designs an LS (AGENTS.md, "Integrated-competence gaps"), and the map in https://claude.ai/artifact/U59N9aDvHN7AbUExgjCrEZ.
window.EL_COMP_MAP={
  "2eso":{
    1:{name:"My Real Routine",prog:["9.2"],work:{"1":"implicit","6":"little","10":"implicit"}},
    2:{name:"Free Time, Live!",prog:["6.2"],work:{"7":"planned","8":"planned","9":"implicit","10":"implicit"}},
    3:{name:"A Day I'll Never Forget",prog:["7.2"],work:{"1":"implicit","6":"little","8":"planned","9":"implicit","10":"implicit"}},
    4:{name:"Feel Good Guide",prog:["8.1"],work:{"1":"implicit","6":"implicit","7":"planned","9":"implicit","10":"implicit"}},
    5:{name:"Best Places Around",prog:["1.2","1.3","6.2"],work:{"7":"planned","8":"planned","9":"implicit","10":"implicit"}},
    6:{name:"Let's Plan It!",prog:["9.2","10.2"],work:{"1":"implicit","6":"implicit","7":"planned","8":"planned"}}
  },
  "4eso":{
    1:{name:"My Real Routine",prog:["9.2"],work:{"1":"implicit","6":"little","10":"implicit"}},
    2:{name:"Seasons & Celebrations",prog:["1.1","1.2","6.1"],work:{"7":"planned","8":"planned","9":"implicit","10":"implicit"}},
    3:{name:"Moments That Shaped Us",prog:["7.2","8.1"],work:{"1":"implicit","6":"little","9":"implicit","10":"implicit"}},
    4:{name:"Fact or Fake?",prog:["6.1","6.2","10.1"],work:{"7":"planned","8":"planned","9":"implicit"}},
    5:{name:"Small Changes, Big Impact",prog:["6.2","10.1"],work:{"1":"implicit","7":"planned","8":"planned","9":"implicit"}},
    6:{name:"My Next Step",prog:["9.2"],work:{"1":"implicit","6":"implicit","7":"planned","8":"planned","10":"implicit"}}
  }
};
