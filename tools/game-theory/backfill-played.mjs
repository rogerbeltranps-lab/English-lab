// Backfill ls/{id}.played[group][deck] (Roger, 8 Nov 2026: "if a game has been played, even though a student wasn't there, they can see
// the theory explained. But here, I don't see them"). The board (lab/game/host.js markPlayed) writes `played` only since the 📝 notes
// release (6 Nov 2026 evening); every class game before that has a gameResults/{group}_{sid} document but no `played` entry, so the LS
// page's 📝 Games and theory place (shared/js/el-notes.js) said "Your class hasn't played any class game in this LS yet".
// This copies each group + game of gameResults into `played` (day = the first time it was played). It only adds missing entries.
// --add GROUP:deck-id[@YYYY-MM-DD] adds a game a group played before results were saved (no gameResults document); repeat it as needed.
// Dry run unless --apply. Needs FIREBASE_SERVICE_ACCOUNT (the cloud environment has it). Prints no names.
//   node tools/game-theory/backfill-played.mjs [--add 4ESOB:4eso-ls2-lp2-vocab@2026-11-04] [--apply]
import fs from "node:fs";import path from "node:path";import vm from "node:vm";import crypto from "node:crypto";import {fileURLToPath} from "node:url";
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../.."),PROJECT="english-lab-ietm",APPLY=process.argv.includes("--apply");
const ctx={console};ctx.window=ctx;vm.createContext(ctx);
for(const f of ["shared/js/el-catalog.js","lab/game/decks/index.js"])vm.runInContext(fs.readFileSync(path.join(ROOT,f),"utf8"),ctx);
const GAMES=ctx.window.EL_GAMES||[],LSS=ctx.window.EL_LS||[];
// the same LS lookup as host.js lsId(): the deck's course and LS title
const lsOf=deck=>{const m=GAMES.find(g=>g.id===deck)||{},nm=String(m.ls||"").replace(/^[^·]*·\s*/,"").trim().toLowerCase();
  const l=LSS.find(x=>x.course===m.course&&x.title.replace(/^[^·]*·\s*/,"").trim().toLowerCase()===nm);return l?l.id:""};

async function token(){
  const t=process.env.FIREBASE_SERVICE_ACCOUNT.trim().replace(/^['"]|['"]$/g,""),k=JSON.parse(t.startsWith("{")?t:Buffer.from(t,"base64").toString("utf8"));
  const now=Math.floor(Date.now()/1000),b=o=>Buffer.from(JSON.stringify(o)).toString("base64url");
  const un=b({alg:"RS256",typ:"JWT"})+"."+b({iss:k.client_email,scope:"https://www.googleapis.com/auth/datastore",aud:"https://oauth2.googleapis.com/token",iat:now,exp:now+3600});
  const jwt=un+"."+crypto.createSign("RSA-SHA256").update(un).sign(k.private_key).toString("base64url");
  const j=await(await fetch("https://oauth2.googleapis.com/token",{method:"POST",body:new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion:jwt})})).json();
  if(!j.access_token)throw new Error(JSON.stringify(j));return j.access_token;
}
const TOKEN=await token(),DOCS="https://firestore.googleapis.com/v1/projects/"+PROJECT+"/databases/(default)/documents/";
async function api(method,url,body){
  const r=await fetch(url,{method,headers:{authorization:"Bearer "+TOKEN,"content-type":"application/json"},body:body&&JSON.stringify(body)});
  if(r.status===404)return null;const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(method+": "+(j.error?.message||r.status));return j;
}
const plain=v=>v==null?null:"stringValue" in v?v.stringValue:"integerValue" in v?+v.integerValue:"doubleValue" in v?v.doubleValue:"booleanValue" in v?v.booleanValue
  :"timestampValue" in v?v.timestampValue:"nullValue" in v?null:"mapValue" in v?Object.fromEntries(Object.entries(v.mapValue.fields||{}).map(([k,x])=>[k,plain(x)]))
  :"arrayValue" in v?(v.arrayValue.values||[]).map(plain):null;
const doc=d=>d?Object.fromEntries(Object.entries(d.fields||{}).map(([k,x])=>[k,plain(x)])):null;
async function list(coll){const out=[];let t="";do{const j=await api("GET",DOCS+coll+"?pageSize=300"+(t?"&pageToken="+t:""));(j?.documents||[]).forEach(d=>out.push([d.name.split("/").pop(),doc(d)]));t=j?.nextPageToken||""}while(t);return out}
const bq=k=>"`"+String(k).replace(/[`\\]/g,"\\$&")+"`";

// want[ls][group][deck] = first day played (ms)
const want={},put=(ls,g,deck,ms,why)=>{if(!ls){console.log("  ? no LS for",deck,"("+why+")");return}
  ((want[ls]=want[ls]||{})[g]=want[ls][g]||{});const o=want[ls][g];if(!o[deck]||ms<o[deck])o[deck]=ms};
for(const [id,d] of await list("gameResults")){const g=d.group||id.split("_")[0],ms=+d.sid||+id.split("_")[1]||0;if(g&&d.deck)put(lsOf(d.deck),g,d.deck,ms,"gameResults "+id)}
process.argv.forEach((a,i)=>{if(a!=="--add")return;const m=String(process.argv[i+1]||"").match(/^([^:]+):([^@]+)(?:@(\d{4}-\d\d-\d\d))?$/);
  if(!m||!GAMES.some(g=>g.id===m[2]))throw new Error("--add GROUP:deck-id[@YYYY-MM-DD], unknown: "+process.argv[i+1]);
  put(lsOf(m[2]),m[1],m[2],m[3]?Date.parse(m[3]+"T12:00:00Z"):Date.now(),"--add")});

let added=0;
for(const [ls,groups] of Object.entries(want)){
  const cur=doc(await api("GET",DOCS+"ls/"+ls))||{},have=cur.played||{},fields={},mask=[];
  for(const [g,decks] of Object.entries(groups))for(const [deck,ms] of Object.entries(decks)){
    const old=have[g]&&have[g][deck];
    console.log(`${old?"  have":"  ADD "} ${ls} · ${g} · ${deck} · ${new Date(old||ms).toISOString().slice(0,10)}`);
    if(old)continue;added++;mask.push("played."+bq(g)+"."+bq(deck));
    (((fields.played=fields.played||{mapValue:{fields:{}}}).mapValue.fields[g]=fields.played.mapValue.fields[g]||{mapValue:{fields:{}}}).mapValue.fields[deck]={integerValue:String(ms)});
  }
  if(APPLY&&mask.length)await api("PATCH",DOCS+"ls/"+ls+"?"+mask.map(f=>"updateMask.fieldPaths="+encodeURIComponent(f)).join("&"),{fields});
}
console.log(`${added} entr${added===1?"y":"ies"} ${APPLY?"written":"to add (dry run: add --apply to write)"}.`);
