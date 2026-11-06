// 🎯 Coverage on the teacher dashboard (Roger, 6 Nov 2026: "another section where we can see if we have worked all the assessment criteria
// and competences planned for each LS and the year plan. Also, the grammar and the lexicon … so we can add some grammar in other LS if
// necessary"). Criteria need nothing here: they come from EL_STEP_CRITERIA (el-catalog.js) and the programme (EL_REF.prog).
// Grammar and lexicon: which learning-path tabs work each row of the Drive grammar and lexicon maps (EL_REF.grammar / EL_REF.lexicon,
// el-reference-data.js). Key = the start of the row's text in the map (matched with startsWith, so a rebuilt map keeps working);
// value = the tabs that teach it, "activity id#panel id" as in EL_SECTIONS. A row the map plans for the LS with no entry here shows
// "⚠ no learning path works it"; an entry for a row the map does not plan for that LS shows as "➕ also worked".
// Filled in by reading each LS's data files and its overview.md (the grammar and vocabulary of every learning path). When an LS is
// designed, add its block here (the LS project writes it with the LS; see AGENTS.md "Coverage"). LS1 needs none: it is finished, so
// everything its map row plans counts as worked once the group is past it.
window.EL_COVER = {
  "2eso-free-time-live": {
    gram: {
      "Imperatius": ["2eso/ls2-likes-and-screen-tips#grammar", "2eso/ls2-write-your-vlog-script#grammar"],
      "Present Simple i preguntes": ["2eso/ls2-getting-started#recall", "2eso/ls2-now-or-usually#grammar"],
      "Present Continuous (accions": ["2eso/ls2-what-are-they-doing#grammar", "2eso/ls2-what-are-they-doing#mixed"],
      "Contrast present simple / present continuous": ["2eso/ls2-now-or-usually#grammar", "2eso/ls2-now-or-usually#mixed", "2eso/ls2-write-your-vlog-script#grammar"],
      "Verbs d’estat": ["2eso/ls2-now-or-usually#vocab", "2eso/ls2-now-or-usually#grammar", "2eso/ls2-write-your-vlog-script#vocab"],
      "like / love / hate + -ing": ["2eso/ls2-likes-and-screen-tips#grammar", "2eso/ls2-likes-and-screen-tips#mixed"],
      "Preguntes de subjecte i d’objecte": ["2eso/ls2-what-are-they-doing#grammar"],
      "too / enough": ["2eso/ls2-likes-and-screen-tips#grammar"],
      "Connectors i cohesió": ["2eso/ls2-likes-and-screen-tips#grammar", "2eso/ls2-write-your-vlog-script#grammar"]
    },
    lex: {
      "Tecnologia, mitjans i recerca": ["2eso/ls2-check-the-source#vocab", "2eso/ls2-likes-and-screen-tips#vocab"],
      "Roba, oci i esports": ["2eso/ls2-getting-started#vocab", "2eso/ls2-what-are-they-doing#vocab", "2eso/ls2-now-or-usually#vocab"],
      "Oci, esdeveniments i temps atmosfèric": ["2eso/ls2-what-are-they-doing#vocab"],
      "Expressions de temps": ["2eso/ls2-now-or-usually#vocab"],
      "Paraules compostes": ["2eso/ls2-likes-and-screen-tips#vocab"],
      "Rutines i hàbits": ["2eso/ls2-getting-started#recall"],
      "Salut i benestar": ["2eso/ls2-likes-and-screen-tips#vocab"]
    }
  },
  "4eso-seasons-and-celebrations": {
    gram: {
      "Preposicions de lloc i de temps": ["4eso/ls2-celebrations-around-the-world#grammar"],
      "Present Simple i preguntes": ["4eso/ls2-celebrations-around-the-world#grammar", "4eso/ls2-celebrations-around-the-world#mixed"],
      "Present Continuous (accions": ["4eso/ls2-plan-the-day#grammar"],
      "like / love / hate + -ing": ["4eso/ls2-write-to-the-head-teacher#grammar"],
      "Past Simple (verbs regulars": ["4eso/ls2-where-traditions-come-from#grammar"],
      "Used to": ["4eso/ls2-where-traditions-come-from#grammar", "4eso/ls2-where-traditions-come-from#mixed"],
      "Future forms": ["4eso/ls2-plan-the-day#grammar", "4eso/ls2-plan-the-day#mixed"],
      "will / going to": ["4eso/ls2-plan-the-day#grammar", "4eso/ls2-plan-the-day#mixed"],
      "Present Continuous amb valor de futur": ["4eso/ls2-plan-the-day#grammar", "4eso/ls2-plan-the-day#mixed"],
      "Peticions i ofertes": ["4eso/ls2-write-to-the-head-teacher#grammar"],
      "Relative clauses (especificatives": ["4eso/ls2-where-traditions-come-from#grammar"],
      "Passive voice": ["4eso/ls2-celebrations-around-the-world#grammar"],
      "Connectors i cohesió": ["4eso/ls2-where-traditions-come-from#grammar", "4eso/ls2-write-to-the-head-teacher#grammar"],
      "Progressió de connectors": ["4eso/ls2-where-traditions-come-from#grammar", "4eso/ls2-write-to-the-head-teacher#grammar"],
      "Relatives no especificatives": ["4eso/ls2-where-traditions-come-from#grammar"]
    },
    lex: {
      "Llocs, mobilitat i viatges": ["4eso/ls2-where-traditions-come-from#vocab"],
      "Llengua d’aula, números, dates": ["4eso/ls2-where-traditions-come-from#vocab"],
      "Casa, poble/ciutat i llocs": ["4eso/ls2-where-traditions-come-from#vocab"],
      "Menjar, begudes i compres": ["4eso/ls2-getting-started#words", "4eso/ls2-celebrations-around-the-world#vocab"],
      "Oci, esdeveniments i temps atmosfèric": ["4eso/ls2-getting-started#words"],
      "Animals, natura i paisatge": ["4eso/ls2-getting-started#words"],
      "Plans, sortides i reptes": ["4eso/ls2-plan-the-day#vocab"],
      "Cultures i opinions": ["4eso/ls2-celebrations-around-the-world#vocab", "4eso/ls2-where-traditions-come-from#vocab"],
      "Expressions de temps": ["4eso/ls2-where-traditions-come-from#vocab", "4eso/ls2-plan-the-day#vocab"],
      "Verb + preposició": ["4eso/ls2-where-traditions-come-from#vocab"],
      "Fer plans, quedar i reservar": ["4eso/ls2-plan-the-day#vocab"],
      "Fórmules de missatges": ["4eso/ls2-write-to-the-head-teacher#vocab"],
      "Registre formal i informal": ["4eso/ls2-write-to-the-head-teacher#vocab"],
      "Phrasal verbs de tres parts": ["4eso/ls2-write-to-the-head-teacher#grammar"]
    }
  }
};
