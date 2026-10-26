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
  {icon:"📈",en:`<b>Up to +${en} on your term grade.</b> The best student gets +${en}, the others in proportion. It only adds.`,ca:`<b>Fins a +${ca} a la nota del trimestre.</b> El millor de la classe té +${ca}, els altres en proporció. Només suma.`}]};
