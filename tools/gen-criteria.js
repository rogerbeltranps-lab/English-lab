// Run: node tools/gen-criteria.js .   Generates shared/js/el-criteria.js from docs/4eso/programme.md (official texts) and the 2ESO LS1 summaries (argv[2] = repo).
const fs=require("fs"),path=require("path"),R=process.argv[2];
const md=fs.readFileSync(path.join(R,"docs/4eso/programme.md"),"utf8").split("\r\n").join("\n").split("\n");
const c4={};let inCE=false,trans=null;
for(const l of md){
  if(/^### 2\. Compet/.test(l)){inCE=true;trans=null;continue}
  if(/^### 6\. Compet/.test(l)){inCE=false;trans="";continue}
  if(/^#{2,3} /.test(l)){inCE=false;trans=null;continue}
  // competence headings: "- **CE4 · Reading**" (English) or "- **CC1 · Competència ciutadana**", "- **CE1 emprenedora · …**" (transversal)
  if(inCE||trans!==null){const h=l.match(/^- \*\*(CC\d|CD\d|CPSAA ?\d|CE\d)( emprenedora)? ·/)||(trans!==null&&l.match(/^- \*\*(CC\d|CD\d|CPSAA ?\d|CE\d) ?(emprenedora)?\*\*/));
    if(h){const english=inCE&&!h[2]&&/^CE\d$/.test(h[1])&&!/emprenedora/.test(l)&&/^- \*\*CE\d+ · (Reading|Listening|Speaking|Writing|Interculturalitat|Recerca|Lectura|Mediació|Autoregulació|Comunicació)/.test(l);
      if(!english){trans=h[1];continue}else{trans=inCE?null:trans;continue}}}
  // criterion lines: "- **2 · Criteri d'avaluació 4.1:** text" (24 Oct format) or "- 4.1 text" (older format)
  const m=l.match(/^- \*\*2 · Criteri d'avaluació (\d+\.\d+):\*\* (.+)$/)||l.match(/^- (\d+\.\d+)\.? (.+)$/);if(!m)continue;
  // transversal criteria keep their prefix as the catalogue writes them ("CC1 1.3", "CC3 3.2")
  const k=trans?trans+" "+m[1]:m[1];
  if((inCE||trans)&&!c4[k])c4[k]=m[2].trim();
}
const c2={ // 2ESO: brief summaries from docs/2eso/ls1-my-real-routine/overview.md (not official quotations; 1r i 2n criteria)
  "3.1":"Textos orals breus, senzills, estructurats i comprensibles.",
  "3.2":"Planificació, producció i revisió guiades.",
  "3.3":"Interacció breu i respectuosa amb un company.",
  "5.1":"Textos breus, clars i coherents seguint pautes; suport escrit de Google Slides."
};
const need=["1.1","1.2","2.1","2.2","3.1","3.2","3.3","4.1","4.2","5.1","5.2","6.1","CC1 1.3","CC3 3.2"];
const miss=need.filter(k=>!c4[k]);if(miss.length)console.warn("missing 4ESO:",miss.join(", "));
const keep=o=>Object.fromEntries(Object.entries(o).filter(([k])=>!/^(CD|CPSAA)/.test(k)).sort());
const out=`// Assessment criteria texts shown on the teacher dashboard and the student board (hover or tap a criterion, and the legend).
// 4ESO: copied literally from docs/4eso/programme.md (Decret 175/2022, 3r i 4t; transversal criteria from XTEC).
// 2ESO: brief summaries from docs/2eso/ls1-my-real-routine/overview.md until the 2ESO programme arrives.
// Regenerate with "node tools/gen-criteria.js ." when the programme changes; do not edit the wording by hand.
window.EL_COMPETENCES={"1":"CE1 · Interculturalitat","2":"CE2 · Listening","3":"CE3 · Speaking","4":"CE4 · Reading","5":"CE5 · Writing","6":"CE6 · Recerca i informació","7":"CE7 · Lectura personal","8":"CE8 · Mediació","9":"CE9 · Autoregulació","10":"CE10 · Comunicació ètica","CC1":"CC1 · Competència ciutadana","CC3":"CC3 · Competència ciutadana","CC4":"CC4 · Competència ciutadana","CE1":"CE1 · Competència emprenedora","CE2":"CE2 · Competència emprenedora"};
window.EL_CRITERIA={
  "2eso":${JSON.stringify(c2,null,1).replace(/\n/g,"\n  ")},
  "4eso":${JSON.stringify(keep(c4),null,1).replace(/\n/g,"\n  ")}
};
// Competence label of a criterion code: "3.1" → "CE3 · Speaking", "CC1 1.3" → "CC1 · Competència ciutadana".
window.elCompetence=function(c){const t=String(c).match(/^(CC\\d|CE\\d) /);return window.EL_COMPETENCES[t?t[1]:String(c).split(".")[0]]||""};
window.elCriterion=function(course,c){return (window.EL_CRITERIA[course]||{})[c]||""};
`;
fs.writeFileSync(path.join(R,"shared/js/el-criteria.js"),out);console.log("4eso:",Object.keys(keep(c4)).join(" "));
