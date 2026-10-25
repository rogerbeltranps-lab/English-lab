// Problem reports ("⚠️ Problema / Problem" in the bottom bar): a student tells the teacher that something on the site
// does not work (an audio that does not play, a button that does not let them go on…). The report carries where it
// happened (page, section on screen) and the last errors the page logged, so the teacher can find and fix it.
// el-cloud.js saves it as problems/{id}; the teacher dashboard lists it. Importing this file starts recording errors.

const errs=[],MAXE=5,cut=(s,n)=>String(s??"").replace(/\s+/g," ").trim().slice(0,n);
const mediaErr=x=>"AUDIO VIDEO".includes(x.tagName)?x.tagName:"MEDIA",fileOf=x=>(x.currentSrc||x.src||"").split("/").slice(-2).join("/")||"?";
const note=s=>{s=cut(s,300);if(!s||errs.includes(s))return;errs.push(s);if(errs.length>MAXE)errs.shift()};
addEventListener("error",e=>{
  const x=e.target;
  if(x&&x!==window&&(x instanceof HTMLMediaElement||x.tagName==="SOURCE"||x.tagName==="IMG"))   // a file that does not load (audio, video, image)
    note(mediaErr(x)+" did not load: "+fileOf(x)+(x.error&&x.error.code?" (code "+x.error.code+")":""));
  else if(e.message)note(e.message+(e.filename?" · "+e.filename.split("/").pop()+":"+e.lineno:""));
},true);
addEventListener("unhandledrejection",e=>{const r=e.reason;note((r&&(r.name||""))+(r&&r.message?": "+r.message:r&&!r.name?String(r):""))});

export const KINDS=[
  {id:"media",ca:"Un àudio o un vídeo no es reprodueix",en:"An audio or a video does not play"},
  {id:"stuck",ca:"No puc continuar o un botó no funciona",en:"I can't go on or a button does not work"},
  {id:"marking",ca:"Una resposta correcta surt com a incorrecta",en:"A correct answer is marked wrong"},
  {id:"display",ca:"La pàgina no es veu bé o no carrega",en:"The page looks wrong or does not load"},
  {id:"other",ca:"Una altra cosa",en:"Something else"}
];

// The heading of the part of the page the student is looking at (the last heading above the middle of the screen).
function section(){
  const hs=[...document.querySelectorAll("h1,h2,h3")].filter(h=>h.offsetParent&&!h.closest("dialog,#el-cloud-bar,#el-banner"));
  let best=null;for(const h of hs){if(h.getBoundingClientRect().top<=innerHeight*0.5)best=h;else{best=best||h;break}}
  return best?cut(best.textContent,120):"";
}
function device(){
  const u=navigator.userAgent,os=/CrOS/.test(u)?"Chromebook":/Android/.test(u)?"Android":/iPhone|iPad/.test(u)?"iPhone/iPad":/Windows/.test(u)?"Windows":/Mac OS X/.test(u)?"Mac":/Linux/.test(u)?"Linux":"?";
  const br=/Edg\//.test(u)?"Edge":/Firefox\//.test(u)?"Firefox":/Chrome\//.test(u)?"Chrome":/Safari\//.test(u)?"Safari":"?";
  return os+" · "+br+" · "+innerWidth+"×"+innerHeight;
}
// What is sent with the report besides the student's own words.
export function context(){
  // audio and video that failed before this file loaded (the error event was missed)
  document.querySelectorAll("audio,video").forEach(x=>{if(x.error||x.networkState===3)note(mediaErr(x)+" did not load: "+fileOf(x)+(x.error?" (code "+x.error.code+")":""))});
  return {page:(location.pathname.replace(/^.*?\/English-lab\//i,"").replace(/^\//,"")||"index.html").slice(0,200)+(location.hash||"").slice(0,60),
    title:cut(document.title,120),section:section(),errors:errs.slice(),device:device()};
}

// Opens the report window. en: English (Safe, Daring) or Catalan (Insecure, no route). save(o) stores {kind, text, ...context()}.
export function report({en,save}){
  const t=(ca,e)=>en?e:ca,ctx=context(),d=document.createElement("dialog"),bs="border:0;border-radius:999px;padding:6px 14px;cursor:pointer;font:inherit;";
  d.style.cssText="border:0;border-radius:14px;padding:16px 18px;max-width:480px;width:calc(100% - 32px);box-shadow:0 10px 40px #0004;font:15px system-ui,sans-serif;color:#0f172a;background:#fff";
  d.innerHTML='<h3 style="margin:0 0 6px"></h3><p data-i style="margin:0 0 8px;color:#475569"></p><div data-k></div>'
    +'<textarea maxlength="1000" rows="4" style="width:100%;box-sizing:border-box;font:inherit;padding:6px;border:1px solid #cbd5e1;border-radius:8px;margin-top:8px"></textarea>'
    +'<p data-n style="margin:2px 0 0;color:#64748b;font-size:13px;text-align:right"></p><p data-w style="margin:6px 0 0;color:#64748b;font-size:13px"></p>'
    +'<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px"><button data-x></button><button data-ok></button></div>';
  const $=s=>d.querySelector(s),ta=$("textarea"),ok=$("[data-ok]"),x=$("[data-x]");
  $("h3").textContent="⚠️ "+t("Avisa d'un problema","Report a problem");
  $("[data-i]").textContent=t("Què no funciona? El professor ho veurà i ho intentarà arreglar.","What is not working? Your teacher will see it and try to fix it.");
  KINDS.forEach(k=>{const l=document.createElement("label");l.style.cssText="display:flex;gap:8px;align-items:center;padding:3px 0;cursor:pointer";
    l.innerHTML='<input type="radio" name="el-rep" value="'+k.id+'"><span></span>';l.querySelector("span").textContent=t(k.ca,k.en);$("[data-k]").append(l)});
  ta.placeholder=t("Explica què ha passat: què feies, en quin exercici o pas, què esperaves que passés…","Explain what happened: what you were doing, which exercise or step, what you expected…");
  const where=[ctx.title||ctx.page,ctx.section].filter(Boolean).join(" › ");
  $("[data-w]").textContent=t("S'enviarà també on ets: ","Where you are is sent too: ")+where+".";
  const n=$("[data-n]"),count=()=>n.textContent=ta.value.length+" / 1000";ta.oninput=count;count();
  x.style.cssText=bs+"background:#e2e8f0;color:#0f172a";x.textContent=t("Cancel·la","Cancel");x.onclick=()=>d.close();
  ok.style.cssText=bs+"background:#b45309;color:#fff";ok.textContent=t("Envia","Send");
  ok.onclick=async()=>{
    const kind=(d.querySelector("input[name=el-rep]:checked")||{}).value,text=ta.value.trim();
    if(!kind){alert(t("Tria quin tipus de problema és.","Choose what kind of problem it is."));return}
    if(kind==="other"&&!text){alert(t("Explica breument què passa.","Explain briefly what is happening."));ta.focus();return}
    ok.disabled=true;
    try{await save(Object.assign({kind,text},ctx));
      d.innerHTML="";const m=document.createElement("p");m.style.cssText="margin:0 0 12px";m.textContent=t("Gràcies! El professor ja té el teu avís.","Thank you! Your teacher has your report.");
      const c=document.createElement("button");c.style.cssText=bs+"background:#0f766e;color:#fff";c.textContent="OK";c.onclick=()=>d.close();d.append(m,c);c.focus()}
    catch(e){console.warn("problem report",e);ok.disabled=false;alert(t("No s'ha pogut enviar. Torna-ho a provar més tard o digues-ho al professor a classe.","It could not be sent. Please try again later or tell your teacher in class."))}};
  d.addEventListener("close",()=>d.remove());
  document.body.append(d);d.showModal();
}
