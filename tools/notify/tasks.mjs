// Roger's to-dos in Google Tasks of his school account (Roger, 25 Nov 2026: "I need you to run my task app, there I want you to add
// things to do, for instance the ones who need to do the exam and when"). Goes through the school Apps Script (v39+, actions tasks /
// tasks_list / tasks_done) with SCHOOL_MAIL_URL + SCHOOL_MAIL_KEY. The list file holds names, so it lives in project files, never here.
//   node tools/notify/tasks.mjs add <file.json> [--send]   file = {list?: "English Lab", items: [{title, notes?, due?: "YYYY-MM-DD"}]}
//   node tools/notify/tasks.mjs list [list name]           what is in the list (read only)
//   node tools/notify/tasks.mjs done <task id>… [--send]   mark tasks done (never deletes)
// Without --send, add and done only print what they would do. A task whose title is already in the list is skipped.
import fs from "node:fs";
const [cmd, ...rest] = process.argv.slice(2), GO = rest.includes("--send"), args = rest.filter(a => a !== "--send");
async function call(body) {
  const url = (process.env.SCHOOL_MAIL_URL || "").trim(), key = (process.env.SCHOOL_MAIL_KEY || "").trim();
  if (!url || !key) throw new Error("SCHOOL_MAIL_URL and SCHOOL_MAIL_KEY are needed");
  const r = await fetch(url, { method: "POST", headers: { "content-type": "text/plain" }, redirect: "follow", body: JSON.stringify({ key, ...body }) });
  const j = await r.json(); if (!j.ok) throw new Error(j.error || "school script refused"); return j;
}
if (cmd === "add") {
  const P = JSON.parse(fs.readFileSync(args[0], "utf8")), list = P.list || "English Lab";
  if (!GO) { for (const t of P.items) console.log((t.due || "(no date)").padEnd(11), t.title); console.log(`\n${P.items.length} task(s) for "${list}". Add --send to add them.`); }
  else for (const d of (await call({ action: "tasks", list, items: P.items })).done) console.log(d.skipped ? "skipped (already there):" : "added:", d.title);
} else if (cmd === "list") {
  const j = await call({ action: "tasks_list", list: args[0] || "English Lab" });
  for (const t of j.tasks) console.log(t.status === "completed" ? "✓" : "○", (t.due || "").slice(0, 10).padEnd(10), t.title, " [" + t.id + "]");
} else if (cmd === "done") {
  if (!GO) console.log("Would mark done:", args.join(", "), "\nAdd --send to do it.");
  else console.log("done:", (await call({ action: "tasks_done", ids: args })).done.join(", "));
} else console.log("Usage: node tools/notify/tasks.mjs add <file.json> [--send] | list [name] | done <id>… [--send]");
