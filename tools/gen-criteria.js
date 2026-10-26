// Run: node tools/gen-criteria.js .   Generates shared/js/el-criteria.js from docs/4eso/programme.md and docs/2eso/programme.md (official texts; argv[2] = repo).
const fs=require("fs"),path=require("path"),R=process.argv[2];
// Reads one programme: the criterion lines under "### 2." (English competences) and "### 6." (transversal competences) of every LS.
function parse(file){
  const md=fs.readFileSync(path.join(R,file),"utf8").split("\r\n").join("\n").split("\n");
  const c={};let inCE=false,trans=null;
  for(const l of md){
    if(/^### 2\. Compet/.test(l)){inCE=true;trans=null;continue}
    if(/^### 6\. Compet/.test(l)){inCE=false;trans="";continue}
    if(/^#{2,3} /.test(l)){inCE=false;trans=null;continue}
    // competence headings: "- **CE4 · Reading**" (English) or "- **CC1 · Competència ciutadana**", "- **CE1 emprenedora · …**", "- **CD2 · Competència digital**" (transversal)
    if(inCE||trans!==null){const h=l.match(/^- \*\*(CC\d|CD\d|CPSAA ?\d|CE\d)( emprenedora)? ·/)||(trans!==null&&l.match(/^- \*\*(CC\d|CD\d|CPSAA ?\d|CE\d) ?(emprenedora)?\*\*/));
      if(h){const english=inCE&&!h[2]&&/^CE\d$/.test(h[1])&&!/emprenedora/.test(l)&&/^- \*\*CE\d+ · (Reading|Listening|Speaking|Writing|Interculturalitat|Recerca|Lectura|Mediació|Autoregulació|Comunicació)/.test(l);
        if(!english){trans=h[1];continue}else{trans=inCE?null:trans;continue}}}
    // criterion lines: "- **2 · Criteri d'avaluació 4.1:** text" (24 Oct format) or "- 4.1 text" (older format)
    const m=l.match(/^- \*\*2 · Criteri d'avaluació (\d+\.\d+):\*\* (.+)$/)||l.match(/^- (\d+\.\d+)\.? (.+)$/);if(!m)continue;
    // transversal criteria keep their prefix as the catalogue writes them ("CC1 1.3", "CC3 3.2", "CD2 2.2")
    const k=trans?trans+" "+m[1]:m[1];
    if((inCE||trans)&&!c[k])c[k]=m[2].trim();
  }
  return c;
}
const c4=parse("docs/4eso/programme.md"),c2=parse("docs/2eso/programme.md");
const need=["1.1","1.2","2.1","2.2","3.1","3.2","3.3","4.1","4.2","5.1","5.2","6.1","CC1 1.3","CC3 3.2"];
const miss=need.filter(k=>!c4[k]);if(miss.length)console.warn("missing 4ESO:",miss.join(", "));
const need2=["2.2","3.1","3.2","3.3","4.1","4.2","5.1","6.2","CD2 2.2","CD4 4.5"];
const miss2=need2.filter(k=>!c2[k]);if(miss2.length)console.warn("missing 2ESO:",miss2.join(", "));
// 4ESO keeps only the transversals its LSs assess so far (CC); 2ESO LS2 assesses CD2 2.2 and CD4 4.5, so CD keys stay.
const keep=(o,re)=>Object.fromEntries(Object.entries(o).filter(([k])=>!re.test(k)).sort());
const out=`// Assessment criteria texts shown on the teacher dashboard and the student board (hover or tap a criterion, and the legend).
// 4ESO: copied literally from docs/4eso/programme.md (Decret 175/2022, 3r i 4t; transversal criteria from XTEC).
// 2ESO: copied literally from docs/2eso/programme.md (Decret 175/2022, 1r i 2n; transversal criteria from XTEC).
// Regenerate with "node tools/gen-criteria.js ." when a programme changes; do not edit the wording by hand.
window.EL_COMPETENCES={"1":"CE1 · Interculturalitat","2":"CE2 · Listening","3":"CE3 · Speaking","4":"CE4 · Reading","5":"CE5 · Writing","6":"CE6 · Recerca i informació","7":"CE7 · Lectura personal","8":"CE8 · Mediació","9":"CE9 · Autoregulació","10":"CE10 · Comunicació ètica","CC1":"CC1 · Competència ciutadana","CC2":"CC2 · Competència ciutadana","CC3":"CC3 · Competència ciutadana","CC4":"CC4 · Competència ciutadana","CD1":"CD1 · Competència digital","CD2":"CD2 · Competència digital","CD3":"CD3 · Competència digital","CD4":"CD4 · Competència digital","CE1":"CE1 · Competència emprenedora","CE2":"CE2 · Competència emprenedora"};
window.EL_CRITERIA={
  "2eso":${JSON.stringify(keep(c2,/^CPSAA/),null,1).replace(/\n/g,"\n  ")},
  "4eso":${JSON.stringify(keep(c4,/^(CD|CPSAA)/),null,1).replace(/\n/g,"\n  ")}
};
// Competence label of a criterion code: "3.1" → "CE3 · Speaking", "CC1 1.3" → "CC1 · Competència ciutadana", "CD2 2.2" → "CD2 · Competència digital".
window.elCompetence=function(c){const t=String(c).match(/^(CC\\d|CD\\d|CE\\d) /);return window.EL_COMPETENCES[t?t[1]:String(c).split(".")[0]]||""};
window.elCriterion=function(course,c){return (window.EL_CRITERIA[course]||{})[c]||""};
`;
fs.writeFileSync(path.join(R,"shared/js/el-criteria.js"),out);console.log("4eso:",Object.keys(keep(c4,/^(CD|CPSAA)/)).join(" "));console.log("2eso:",Object.keys(keep(c2,/^CPSAA/)).join(" "));
