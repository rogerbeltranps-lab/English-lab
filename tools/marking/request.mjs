// ✏️ Correct everything waiting now (Roger, 6 Nov 2026: "where I can order to correct everything that's waiting to be corrected").
// The dashboard's ✏️ Corrections saves settings/marking.request = {at, by}. This script (GitHub Action "Marking on request",
// .github/workflows/marking-request.yml, every 15 minutes, free) reads that document and, when the request is newer than the last run
// (settings/marking.run.started, saved by marks.mjs `ready`) and was not started yet, starts the scheduled task "English Lab: mark and
// correct" on claude.ai through its API trigger: the same run as on Wednesdays, at once. Read-only in Firestore (the Action's service
// account can only read): the request it already started is kept in the Actions cache (MARK_STATE). A request older than 2 days is left.
// Secrets (repo Settings > Secrets and variables > Actions): FIREBASE_SERVICE_ACCOUNT_ENGLISH_LAB_IETM (already there) and
// MARK_TASK_TOKEN, the token of the scheduled task's API trigger (claude.ai/code/routines > English Lab: mark and correct > Edit >
// + trigger > API > Generate token). Optional MARK_TASK_URL if the task is ever made again (its new Fire URL). Without the token it does
// nothing and says so in the log; the dashboard then tells the teacher to press Run now on claude.ai. The log shows no names (public).
// 7 Nov 2026 (Roger's first press waited 45 minutes: GitHub ran this check only every few hours): the dashboard now starts the task
// itself through the school Apps Script (tools/notify/school-mail.gs, action "mark") and saves request.fired; this check is the backup.
// It also goes through the school script first (SCHOOL_MAIL_URL + SCHOOL_MAIL_KEY, so the task token lives only there and the script
// never starts the same request twice), and only then tries MARK_TASK_TOKEN directly (if that secret is still set and valid).
//   node tools/marking/request.mjs [--dry]     --dry: says what it would do, starts nothing
import fs from "node:fs";
import {firestore,E,ARGS,SCHOOL} from "../notify/lib.mjs";

const URL_=(E.MARK_TASK_URL||"https://api.anthropic.com/v1/claude_code/routines/trig_019KQmvwTDQJ8wgujGeotDmG/fire").trim(),TOKEN=(E.MARK_TASK_TOKEN||"").trim();
const STATE=E.MARK_STATE||".mark-state.json",DRY=ARGS.includes("--dry");
const f=await firestore(),m=(await f.get("settings/marking"))||{},q=m.request||{};
const rq=Date.parse(q.at||"")||0,st=Date.parse((m.run||{}).started||"")||0;
let state={};try{state=JSON.parse(fs.readFileSync(STATE,"utf8"))}catch(e){}
if(!rq||rq<=st){console.log("No correction asked for.");process.exit(0)}
if(q.fired){console.log("Already started from the dashboard ("+q.fired+"): waiting for the run to begin.");process.exit(0)}
if(rq<=(state.fired||0)){console.log("Already started for the request of "+new Date(rq).toISOString()+": waiting for the run to begin.");process.exit(0)}
if(Date.now()-rq>2*864e5){console.log("The request is older than 2 days: left.");process.exit(0)}
if(DRY){console.log("Would start the marking task now.");process.exit(0)}
const done=how=>{fs.writeFileSync(STATE,JSON.stringify({fired:rq}));if(E.GITHUB_OUTPUT)fs.appendFileSync(E.GITHUB_OUTPUT,"fired=1\n");   // the Action saves the cache only then
  console.log("Marking task "+how+" for the request of "+new Date(rq).toISOString()+".");process.exit(0)};
// 1. the school script (the token lives there; it starts each request once)
let why="no school script (SCHOOL_MAIL_URL / SCHOOL_MAIL_KEY)";
if(SCHOOL.relay&&SCHOOL.key){try{const r=await fetch(SCHOOL.relay,{method:"POST",headers:{"content-type":"text/plain"},body:JSON.stringify({key:SCHOOL.key,action:"mark",at:q.at}),redirect:"follow"});
    const j=await r.json().catch(()=>null);if(j&&j.ok)done(j.started?"started through the school script":"already started by the school script");
    why="the school script said: "+(j&&j.error||"no answer (HTTP "+r.status+")")}catch(e){why="the school script did not answer ("+e.name+")"}}
// 2. the task token as a GitHub secret (the first setup)
if(!TOKEN){console.log("A correction was asked for, but nothing started: "+why+", and MARK_TASK_TOKEN is not set.");process.exit(1)}
const r=await fetch(URL_,{method:"POST",headers:{authorization:"Bearer "+TOKEN,"anthropic-beta":"experimental-cc-routine-2026-04-01","anthropic-version":"2023-06-01","content-type":"application/json"},body:"{}"});
if(!r.ok){console.log("The marking task did not start: "+why+"; with MARK_TASK_TOKEN: HTTP "+r.status+(r.status===401?" (the token is wrong or was made again)":""));process.exit(1)}
done("started with MARK_TASK_TOKEN");
