// Weekly copy of the whole English Lab database into Roger's private Drive (Roger, 20 Nov 2026: "can you make a copy on my drive …
// I want a copy every friday"). Run by the GitHub Action "Database copy to Drive" (.github/workflows/database-copy.yml), free.
// 1. Reads every document (one Firestore read each, about 3,100 on 20 Nov 2026) with the read-only repo secret
//    FIREBASE_SERVICE_ACCOUNT_ENGLISH_LAB_IETM (env FIREBASE_SERVICE_ACCOUNT).
// 2. Gzips it as one JSON file: {project, takenAt, count, docs: [{path, fields (Firestore REST format, types kept), updateTime}]}.
// 3. Sends it to the school Apps Script (tools/notify/school-mail.gs, action "backup", SCHOOL_MAIL_URL + SCHOOL_MAIL_KEY), which saves it
//    as english-lab-backup-YYYY-MM-DD.json.gz in Teacher Studio › 04_Students (private) › English Lab database copies.
// Personal data never touches the repo or the public Action log: the log shows counts and sizes only. Nothing is kept on the runner.
// The real safety net is Firestore's own backups (daily, kept 7 days; Sunday, kept 14 weeks, set 20 Nov 2026); this copy is the one
// outside Google Cloud. Restore: docs/general/backups.md.
// Usage: node tools/backup/firestore-copy.mjs [--dry] (--dry = read and measure, send nothing)
import crypto from "node:crypto";import zlib from "node:zlib";
const E=process.env,DRY=process.argv.includes("--dry");
const t=(E.FIREBASE_SERVICE_ACCOUNT||"").trim().replace(/^['"]|['"]$/g,"");if(!t)throw new Error("Missing FIREBASE_SERVICE_ACCOUNT");
const k=JSON.parse(t.startsWith("{")?t:Buffer.from(t,"base64").toString("utf8"));
const now=Math.floor(Date.now()/1000),b=o=>Buffer.from(JSON.stringify(o)).toString("base64url");
const un=b({alg:"RS256",typ:"JWT"})+"."+b({iss:k.client_email,scope:"https://www.googleapis.com/auth/datastore",aud:"https://oauth2.googleapis.com/token",iat:now,exp:now+3600});
const jwt=un+"."+crypto.createSign("RSA-SHA256").update(un).sign(k.private_key).toString("base64url");
const tj=await (await fetch("https://oauth2.googleapis.com/token",{method:"POST",body:new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion:jwt})})).json();
if(!tj.access_token)throw new Error("Service account sign-in failed: "+(tj.error||"no token"));
const ROOT=`projects/${k.project_id}/databases/(default)/documents`,docs=[];let last=null;
// every document in the database, all collections and subcollections, 500 at a time in name order
for(;;){const q={from:[{allDescendants:true}],orderBy:[{field:{fieldPath:"__name__"}}],limit:500};
  if(last)q.startAt={values:[{referenceValue:last}],before:false};
  const r=await fetch(`https://firestore.googleapis.com/v1/${ROOT}:runQuery`,{method:"POST",headers:{authorization:"Bearer "+tj.access_token,"content-type":"application/json"},body:JSON.stringify({structuredQuery:q})});
  if(!r.ok)throw new Error("Reading failed: "+r.status);
  const page=(await r.json()).filter(x=>x.document).map(x=>x.document);if(!page.length)break;
  page.forEach(d=>docs.push({path:d.name.slice(ROOT.length+1),fields:d.fields||{},updateTime:d.updateTime}));
  last=page.at(-1).name;if(page.length<500)break;}
const takenAt=new Date().toISOString(),day=new Date().toLocaleDateString("en-CA",{timeZone:"Europe/Madrid"});
const gz=zlib.gzipSync(Buffer.from(JSON.stringify({project:k.project_id,takenAt,count:docs.length,docs})),{level:9});
const name=`english-lab-backup-${day}.json.gz`;
console.log(`${docs.length} documents · ${(gz.length/1e6).toFixed(2)} MB compressed · ${name}`);
if(gz.length>40e6)throw new Error("Too big for one request to the school script (40 MB): split the copy first");
if(DRY){console.log("--dry: nothing sent");process.exit(0)}
const url=(E.SCHOOL_MAIL_URL||"").trim(),key=(E.SCHOOL_MAIL_KEY||"").trim();if(!url||!key)throw new Error("Missing SCHOOL_MAIL_URL or SCHOOL_MAIL_KEY");
const sha=crypto.createHash("sha256").update(gz).digest("hex");
const r=await fetch(url,{method:"POST",headers:{"content-type":"application/json"},redirect:"follow",
  body:JSON.stringify({key,action:"backup",name,count:docs.length,sha256:sha,data:gz.toString("base64")})});
const j=await r.json().catch(()=>null);
if(!j?.ok)throw new Error("The school script did not save the copy: "+(j?.error||r.status));
console.log(j.exists?"Already in Drive today (kept the first one)":`Saved in Drive (${(j.bytes/1e6).toFixed(2)} MB)`);
