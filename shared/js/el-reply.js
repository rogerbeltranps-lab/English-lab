// The teacher's answer to a problem report (Roger, 26 Oct 2026): problemReplies/{same id as the report} = {uid, kind, what, text, where, en, created}.
// kind "fixed": the teacher marked the report as fixed. kind "thanks": the teacher deleted it without changing anything, and the student
// still gets a polite thank-you. The student sees it once, as a card on the next page they open, and "OK" deletes it.
// Catalan for Beginners, Insecure and with no route; English for Safe and Daring: en is set by the dashboard from the route the report was sent with.
// kind "message" (Roger, 31 Oct 2026: "I want to be able to answer students when they report a problem"): the teacher's own words in msg,
// saved as problemReplies/{report id}_m{time} so several answers and the fixed/thanks note never overwrite each other. A "fixed" note can
// carry msg too ("Send and mark as fixed"). The card shows msg as it was written, in its own box under the standard sentence.
import {KINDS} from "./el-report.js";

export const MSG_MAX=1000;
export const replyColor=k=>k==="fixed"?"#16a34a":k==="message"?"#2563eb":"#7c3aed";
const cut=(s,n)=>{s=String(s??"").replace(/\s+/g," ").trim();return s.length>n?s.slice(0,n-1)+"…":s};
// r = the reply document, en = English or Catalan. Returns {title, body}.
export function replyText(r,en){
  const k=KINDS.find(x=>x.id===r.what)||{},what=(r.text?cut(r.text,100):(en?k.en:k.ca)||"").replace(/[.!?…\s]+$/,""),q=en?`“${what}”`:`«${what}»`,
    w=r.where?cut(r.where,80):"",at=w?(en?` in “${w}”`:` a «${w}»`):"",about=w?(en?` about “${w}”`:` sobre «${w}»`):"";
  if(r.kind==="message")return en
    ?{title:"💬 Your teacher answered you",body:`You told me about a problem${at}: ${q}. Here is my answer:`}
    :{title:"💬 El teu professor t'ha respost",body:`Em vas avisar d'un problema${at}: ${q}. Aquesta és la meva resposta:`};
  if(r.kind==="fixed")return en
    ?{title:"✅ Fixed! Thank you",body:`You told me about a problem${at}: ${q}. It is fixed now. Thank you very much for letting me know: it helps the whole class!`}
    :{title:"✅ Arreglat! Gràcies",body:`Em vas avisar d'un problema${at}: ${q}. Ja està arreglat. Moltes gràcies per avisar-me: ajudes tota la classe!`};
  return en
    ?{title:"💌 Thank you for your report",body:`Thank you very much for your report${about}: ${q}. I read every report carefully, and I checked this one: the page works as it should, so I have not changed it. Your comments really help me improve the website, so please keep telling me when something looks wrong!`}
    :{title:"💌 Gràcies pel teu avís",body:`Moltes gràcies pel teu avís${about}: ${q}. Llegeixo amb atenció tots els avisos i he revisat aquest: la pàgina funciona com ha de funcionar, per això no l'he canviat. Els teus comentaris m'ajuden molt a millorar la web: continua avisant-me quan vegis alguna cosa estranya!`};
}

// Shows the student's replies one after the other. load() → [{id,...}], done(id) deletes one (after "OK").
export async function showReplies({load,done,en}){
  let L;try{L=await load()}catch(e){console.warn("replies",e);return}
  L.sort((a,b)=>(a.created&&a.created.toMillis?a.created.toMillis():0)-(b.created&&b.created.toMillis?b.created.toMillis():0));
  const next=()=>{
    const r=L.shift();if(!r)return;const lang=typeof r.en==="boolean"?r.en:en,{title,body}=replyText(r,lang);
    const c=document.createElement("div");c.id="el-reply";c.setAttribute("role","status");
    c.style.cssText="position:fixed;top:16px;left:50%;transform:translateX(-50%);width:min(440px,calc(100vw - 24px));box-sizing:border-box;z-index:10004;background:#fff;color:#0f172a;border:2px solid "+replyColor(r.kind)+";border-radius:16px;box-shadow:0 10px 30px #0003;padding:14px 16px;font:15px/1.45 system-ui,sans-serif";
    c.innerHTML='<b style="display:block;font-size:17px;margin-bottom:4px"></b><p style="margin:0 0 10px"></p><div hidden style="margin:0 0 10px;padding:8px 12px;border-left:4px solid #2563eb;background:#eff6ff;border-radius:8px;white-space:pre-wrap;overflow-wrap:anywhere;max-height:45vh;overflow:auto"></div><small style="display:block;color:#64748b;margin-bottom:10px">'+(lang?"From your teacher":"Del teu professor")+'</small><button type="button" style="border:0;background:#0f766e;color:#fff;border-radius:999px;padding:6px 18px;font:inherit;font-weight:600;cursor:pointer">'+(lang?"OK":"D'acord")+"</button>";
    c.querySelector("b").textContent=title;c.querySelector("p").textContent=body;
    const m=String(r.msg||"").trim().slice(0,MSG_MAX),mb=c.querySelector("div");if(m){mb.textContent=m;mb.hidden=false}
    c.querySelector("button").onclick=()=>{c.remove();Promise.resolve(done(r.id)).catch(e=>console.warn("reply",e));next()};
    document.body.append(c);c.querySelector("button").focus({preventScroll:true})};
  next();
}
