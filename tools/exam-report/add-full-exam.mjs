// The whole exam on the student board (Roger, 2 Nov 2026: "I want students to see the questions of the exam they did, also the reading
// section … since some students want to see what they did well too"). Adds to each student's report that is already on the board
// (students/{uid}/results/{ls}__assessment .report, written by import-exam-report.mjs) the questions they got right, the choices and hint of
// every question as on the paper (opts, hint) and the texts of the exam they did (report.exam: listening instructions and transcript,
// reading text, writing task), and sets report.full. Nothing else in
// the report changes: the questions to review, the writing, its corrections and what to review stay exactly as they are, and so do the
// marks. A student whose questions to review in the file are not the same as on the board is skipped and listed (never overwritten).
//   node tools/exam-report/add-full-exam.mjs <reports.json outside the repo> <ls id, e.g. 2eso-my-real-routine> [--apply]
// reports.json = {email: report}, made by build-ls1-reports.py with --exam (emails as on the roster). Without --apply it only prints what
// would change. Sign-in: FIREBASE_SERVICE_ACCOUNT (the cloud environment's secret), else the Firebase CLI login (as tools/marking).
// Reads: the students list once (to find each uid by email) and one results document per student; writes: one per student.
// The JSON holds personal data (and the real exam texts): keep it outside the repo.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";

const PROJECT="english-lab-ietm";
const args=process.argv.slice(2),apply=args.includes("--apply"),[file,ls]=args.filter(a=>!a.startsWith("--"));
if(!file||!ls){console.error("Usage: node add-full-exam.mjs <reports.json> <ls id> [--apply]");process.exit(1)}
const reports=JSON.parse(fs.readFileSync(file,"utf8"));

async function token(){
  const sa=process.env.FIREBASE_SERVICE_ACCOUNT;
  if(sa){const t=sa.trim().replace(/^['"]|['"]$/g,""),k=JSON.parse(t.startsWith("{")?t:Buffer.from(t,"base64").toString("utf8")),
    now=Math.floor(Date.now()/1000),b=o=>Buffer.from(JSON.stringify(o)).toString("base64url");
    const un=b({alg:"RS256",typ:"JWT"})+"."+b({iss:k.client_email,scope:"https://www.googleapis.com/auth/datastore",aud:"https://oauth2.googleapis.com/token",iat:now,exp:now+3600});
    const jwt=un+"."+crypto.createSign("RSA-SHA256").update(un).sign(k.private_key).toString("base64url");
    const j=await (await fetch("https://oauth2.googleapis.com/token",{method:"POST",body:new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion:jwt})})).json();
    if(!j.access_token)throw new Error("Service account token: "+JSON.stringify(j));return j.access_token}
  const f=path.join(process.env.XDG_CONFIG_HOME||path.join(os.homedir(),".config"),"configstore","firebase-tools.json");
  const rt=fs.existsSync(f)&&JSON.parse(fs.readFileSync(f,"utf8")).tokens?.refresh_token;
  if(!rt)throw new Error("No FIREBASE_SERVICE_ACCOUNT and not signed in to the Firebase CLI (npx firebase-tools login).");
  const j=await (await fetch("https://oauth2.googleapis.com/token",{method:"POST",body:new URLSearchParams({grant_type:"refresh_token",refresh_token:rt,
    client_id:"563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com",client_secret:"j9iVZfS8kkCEFUPaAeJV0sAi"})})).json();   // the Firebase CLI's public client
  if(!j.access_token)throw new Error("Token: "+JSON.stringify(j));return j.access_token}
const TOKEN=await token();
async function api(method,url,body,ok404){
  const r=await fetch(url,{method,headers:{authorization:"Bearer "+TOKEN,"x-goog-user-project":PROJECT,"content-type":"application/json"},body:body&&JSON.stringify(body)});
  if(ok404&&r.status===404)return null;
  const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(method+" "+url.split("?")[0]+": "+(j.error?.message||r.status));return j;
}
const DOCS="https://firestore.googleapis.com/v1/projects/"+PROJECT+"/databases/(default)/documents/";
// JSON ⇄ Firestore values (as import-exam-report.mjs)
const enc=x=>x==null?{nullValue:null}:Array.isArray(x)?{arrayValue:{values:x.map(enc)}}:typeof x==="object"?{mapValue:{fields:Object.fromEntries(Object.entries(x).map(([k,v])=>[k,enc(v)]))}}
  :typeof x==="number"?(Number.isInteger(x)?{integerValue:String(x)}:{doubleValue:x}):typeof x==="boolean"?{booleanValue:x}:{stringValue:String(x)};
const dec=v=>!v?undefined:"nullValue" in v?null:v.arrayValue?(v.arrayValue.values||[]).map(dec):v.mapValue?Object.fromEntries(Object.entries(v.mapValue.fields||{}).map(([k,y])=>[k,dec(y)]))
  :v.integerValue!=null?+v.integerValue:v.doubleValue!=null?+v.doubleValue:v.booleanValue!=null?v.booleanValue:v.stringValue;
const canon=x=>JSON.stringify(x,(k,v)=>v&&typeof v==="object"&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);

// every student's uid by email: one list of students/ (paged)
const uidOf={};let page="";
do{const j=await api("GET",DOCS+"students?pageSize=300&mask.fieldPaths=email"+(page?"&pageToken="+encodeURIComponent(page):""));
  (j.documents||[]).forEach(d=>{const e=d.fields?.email?.stringValue;if(e)uidOf[e.toLowerCase()]=d.name.split("/").pop()});page=j.nextPageToken||""}while(page);

const lostKey=qs=>(qs||[]).filter(q=>!q.ok).map(q=>q.q+"|"+q.mine).sort().join(";");
let changed=0,same=0,skipped=0;
for(const [mail,rep] of Object.entries(reports)){const email=mail.toLowerCase(),uid=uidOf[email];
  if(!uid){console.log("✗ "+email+": no student with this email, skipped");skipped++;continue}
  const cur=await api("GET",DOCS+"students/"+uid+"/results/"+ls+"__assessment",null,true),old=cur?.fields?.report&&dec(cur.fields.report);
  if(!old){console.log("✗ "+email+": no report on the board for "+ls+" yet (import it first with import-exam-report.mjs), skipped");skipped++;continue}
  if(lostKey(old.questions)!==lostKey(rep.questions)){console.log("✗ "+email+": the questions to review differ from the ones on the board, skipped (check the workbook)");skipped++;continue}
  // the questions to review stay as on the board, with the paper's choices and hint added (opts, hint); the right ones come from the file
  const byQ=Object.fromEntries((rep.questions||[]).map(q=>[q.q,q])),paper=o=>{const f=byQ[o.q]||{},x={...o};if(f.opts)x.opts=f.opts;if(f.hint)x.hint=f.hint;return x};
  const right=(rep.questions||[]).filter(q=>q.ok),next={...old,questions:[...(old.questions||[]).filter(q=>!q.ok).map(paper),...right].sort((a,b)=>a.q-b.q),full:true};
  if(rep.exam)next.exam=rep.exam;
  if(canon(next)===canon(old)){same++;console.log("= "+email+": already up to date");continue}
  console.log((apply?"✓ ":"→ ")+email+": "+next.questions.length+" questions ("+right.length+" right)"+(rep.exam?" · exam texts: "+Object.keys(rep.exam).join(", "):" · no exam texts"));
  changed++;if(!apply)continue;
  await api("PATCH",DOCS+"students/"+uid+"/results/"+ls+"__assessment?updateMask.fieldPaths=report",{fields:{report:enc(next)}});
}
console.log(`\n${apply?"Written":"Would write"}: ${changed} · already up to date: ${same} · skipped: ${skipped}${apply?"":"\nNothing written: run again with --apply."}`);
