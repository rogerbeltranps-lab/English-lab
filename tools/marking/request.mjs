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
//   node tools/marking/request.mjs [--dry]     --dry: says what it would do, starts nothing
import fs from "node:fs";
import {firestore,E,ARGS} from "../notify/lib.mjs";

const URL_=(E.MARK_TASK_URL||"https://api.anthropic.com/v1/claude_code/routines/trig_019KQmvwTDQJ8wgujGeotDmG/fire").trim(),TOKEN=(E.MARK_TASK_TOKEN||"").trim();
const STATE=E.MARK_STATE||".mark-state.json",DRY=ARGS.includes("--dry");
const f=await firestore(),m=(await f.get("settings/marking"))||{};
const rq=Date.parse((m.request||{}).at||"")||0,st=Date.parse((m.run||{}).started||"")||0;
let state={};try{state=JSON.parse(fs.readFileSync(STATE,"utf8"))}catch(e){}
if(!rq||rq<=st){console.log("No correction asked for.");process.exit(0)}
if(rq<=(state.fired||0)){console.log("Already started for the request of "+new Date(rq).toISOString()+": waiting for the run to begin.");process.exit(0)}
if(Date.now()-rq>2*864e5){console.log("The request is older than 2 days: left.");process.exit(0)}
if(!TOKEN){console.log("A correction was asked for, but MARK_TASK_TOKEN is not set: nothing started (see the top of tools/marking/request.mjs).");process.exit(0)}
if(DRY){console.log("Would start the marking task now.");process.exit(0)}
const r=await fetch(URL_,{method:"POST",headers:{authorization:"Bearer "+TOKEN,"anthropic-beta":"experimental-cc-routine-2026-04-01","anthropic-version":"2023-06-01","content-type":"application/json"},
  body:JSON.stringify({text:"The teacher pressed ✏️ Correct everything waiting now on the dashboard: do the whole run now, exactly as on Wednesdays."})});
if(!r.ok){console.log("The marking task did not start: HTTP "+r.status+(r.status===401?" (the token is wrong or was regenerated)":""));process.exit(1)}
fs.writeFileSync(STATE,JSON.stringify({fired:rq}));if(E.GITHUB_OUTPUT)fs.appendFileSync(E.GITHUB_OUTPUT,"fired=1\n");   // the Action saves the cache only thenconsole.log("Marking task started for the request of "+new Date(rq).toISOString()+".");
