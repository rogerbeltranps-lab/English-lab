// Points (Roger, 25–26 Oct 2026). In the class presentations every right answer a student taps on their Chromebook is +1 point.
// They are a bonus on the term grade: up to EL_POINTS_BONUS, in proportion to the best student of the class group that term (the
// best student gets the whole bonus), so they can only raise the grade. Points start again every term. Stored in Firebase, never
// in the repository:
//   points/{email} = {t1, t2, t3}: written by the teacher (presentation and dashboard); each student reads their own.
//   teams/{group} = {best:{t1:n}}: the group's best this term; no personal data, so the group's students read it.
// Used by the class presentations (el-deck-points.js), the student board (today.html) and the teacher dashboard (teacher.html).
window.EL_TERMS=[{id:"t1",en:"Term 1",ca:"1r trimestre",end:"2026-11-20"},{id:"t2",en:"Term 2",ca:"2n trimestre",end:"2027-02-26"},{id:"t3",en:"Term 3",ca:"3r trimestre"}];
window.EL_POINTS_BONUS=0.5;
// Term of a day (YYYY-MM-DD, today by default): the first one that has not ended yet.
window.elTerm=function(day){
  if(!day){const d=new Date();day=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
  return (EL_TERMS.find(t=>!t.end||day<=t.end)||EL_TERMS[EL_TERMS.length-1]).id;
};
window.elTermName=(id,lang)=>{const t=EL_TERMS.find(x=>x.id===id);return t?t[lang==="ca"?"ca":"en"]:id};
// Bonus for p points when the best student of the group has best points, to two decimals.
window.elBonus=(p,best)=>best>0&&p>0?Math.round(Math.min(1,p/best)*EL_POINTS_BONUS*100)/100:0;
window.elNum=(n,lang)=>{const s=String(Math.round(n*100)/100);return lang==="ca"?s.replace(".",","):s};
// The rules, as the class hears them every time (presentation reminder, student board). HTML in English and Catalan.
window.elPointsRules=function(){const en=elNum(EL_POINTS_BONUS,"en"),ca=elNum(EL_POINTS_BONUS,"ca");return [
  {icon:"💻",en:"<b>Right answer: +1 point.</b> Tap it on your Chromebook before 3 · 2 · 1.",ca:"<b>Resposta correcta: +1 punt.</b> Toca-la al Chromebook abans del 3 · 2 · 1."},
  {icon:"📱",en:"<b>Join from the Learning Path.</b> “My activities” shows your points.",ca:"<b>Entra des del Learning Path.</b> “Les meves activitats” mostra els teus punts."},
  {icon:"📈",en:`<b>Up to +${en} on your term grade,</b> only with no late activities (all the ones past their day done). The best student with nothing late gets +${en}, the others in proportion.`,ca:`<b>Fins a +${ca} a la nota del trimestre,</b> només sense cap activitat endarrerida (totes les que ja tocaven, fetes). El millor sense res endarrerit té +${ca}, els altres en proporció.`}]};
// All the work done (Roger, 30 Oct 2026: "qui no ha fet tot, no opta als punts extres"): a student gets the bonus of a term only with
// every activity of that term done. Counted: each activity of the group's time plans (EL_PLAN due) whose due day is in the term and
// already past, in an LS that is not Hidden, open for the group (elLpOpen) and with no section still locked by the teacher; the final
// product (manual) and optional homework never count. Done late still counts as done. isDone(activity) is the page's own check.
// Returns the missing ones as [[activity, due day]], oldest first.
window.elTermSpan=id=>{const i=EL_TERMS.findIndex(t=>t.id===id);return [i>0?EL_TERMS[i-1].end:"",EL_TERMS[i]&&EL_TERMS[i].end||"9999-12-31"]};
// elDueWork: every activity that counts so far this term (the same rule), as [[activity, due day, tabs]], oldest first; elMissing: the ones not done.
// Only the tabs taught (problem report, 4ESOA, 19 Nov 2026: "Ot did everything and the system is saying he has 10 activities late. Those
// activities are open to do in the future but they are not to be done"; AGENTS.md: missing work counts 0 only if ticked done in class on
// the Time plan and its day has passed): when the group has a Time plan agenda, a learning path counts only with its tabs that were on a
// class day before today, ticked as done in class or set as homework (elDueBefore in el-catalog.js); tabs = a Set of those panel ids
// (null = the whole path: planned whole, or no agenda). A path with none of them does not count yet. Count tabs with elTabsLeft(a,…,tabs).
window.elDueWork=function(gid,term,infoOf){
  const [from,to]=elTermSpan(term),today=ELWeek.today(),out=[];
  ELWeek.plans(gid).forEach(x=>{const info=infoOf(x.ls)||{status:"hidden"};if(info.status==="hidden")return;
    const db=window.EL_RAW_OPEN||!window.elDueBefore?null:elDueBefore(info,gid);
    Object.keys(x.p.due||{}).forEach(id=>{const a=(window.EL_CATALOG||[]).find(y=>y.id===id),d=ELWeek.due(x.p,id,x.gi);
      if(!a||!d||a.manual||d<=from||d>to||d>=today||!elLpOpen(a,info,gid)||elSecNeverOpened(a,info,gid).length)return;
      const tabs=elTaughtTabs(a,db);if(tabs===false)return;
      out.push([a,d,tabs])})});
  return out.sort((a,b)=>a[1]<b[1]?-1:1)};
// the tabs of a path taught so far (db = elDueBefore(info, group), or null): null = the whole path, a Set of panel ids, or false = none yet
window.elTaughtTabs=function(a,db){if(!db||db.acts.has(a.id)||!elTabsOf(a))return null;const ps=db.tabs[a.id];if(!ps||!ps.size)return false;
  const o=new Set([...ps].map(k=>elTabOf(a.id,k)));return elTabsOf(a,o).length?o:false};
// left(a, tabs) = the student's tabs not done (elTabsLeft); without it, a path counts until it is all done
window.elMissing=(gid,term,isDone,infoOf,left)=>elDueWork(gid,term,infoOf).filter(([a,,tabs])=>left?left(a,tabs).length>0:!isDone(a));
// Share of an LS mark that is continuous assessment (Roger, 2 Nov 2026: students must see how much their everyday work counts):
// every block of EL_GRADING[ls] except the final exam and the final product (from LS2 on: grammar, vocabulary and skills 35 % + other competences 5 % = 40 %).
window.elFormativeShare=ls=>{const g=(window.EL_GRADING||{})[ls];if(!g||g.only||!g.blocks)return 0;
  return g.blocks.filter(b=>b.id!=="exam"&&b.id!=="fp").reduce((s,b)=>s+(+b.w||0),0)};
// The LS mark in its parts, in points out of the LS's 10 (Roger, 21 Nov 2026: "Potser podriem posar la nota de la LS en 3 parts: 2,5/4;
// 0/3,5 (per fer) 0/2,5 (per fer)", "perque ara com ho veuen es pensen que van millor del que van"): an 8.5 in the daily work alone read as
// an 8.5 LS mark, so until every part has a mark the board and the dashboard show each part as points (daily work 3.4 / 4 · exam – / 3.5 ·
// final product – / 2.5) and no single mark. v = {daily, exam, fp}, each out of 10 or null. Returns {parts: [{k, w, max, v, pts}], all,
// got (points so far), of (the points the marked parts are worth), left (points of the parts still to do)}, or null for an LS without blocks. LS1 (only exam and final product): two parts.
window.elLsPts=function(ls,v){const g=(window.EL_GRADING||{})[ls];if(!g||!g.blocks)return null;const W=id=>+((g.blocks.find(b=>b.id===id)||{}).w)||0;
  const parts=[["daily",g.only?0:elFormativeShare(ls)],["exam",W("exam")],["fp",W("fp")]].filter(([,w])=>w)
    .map(([k,w])=>{const m=v&&v[k]!=null&&!isNaN(v[k])?+v[k]:null;return {k,w,max:w/10,v:m,pts:m==null?null:m*w/100}});
  const kn=parts.filter(p=>p.v!=null);return {parts,all:!!parts.length&&kn.length===parts.length,got:kn.reduce((n,p)=>n+p.pts,0),of:kn.reduce((n,p)=>n+p.max,0),left:parts.filter(p=>p.v==null).reduce((n,p)=>n+p.max,0)}};
// the daily work out of 10 from a stored progress ({gv, other, …}; results/{ls}__assessment.progress): its blocks by weight, the ones with a mark
window.elDailyOf=function(ls,p){const g=(window.EL_GRADING||{})[ls];if(!g||!g.blocks||g.only||!p)return null;
  const cs=g.blocks.filter(b=>b.id!=="exam"&&b.id!=="fp"&&p[b.id]!=null),w=cs.reduce((n,b)=>n+(+b.w||0),0);return w?cs.reduce((n,b)=>n+p[b.id]*b.w,0)/w:null};
