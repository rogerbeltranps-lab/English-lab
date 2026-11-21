# Backups of the students' data

Set up on 20 Nov 2026 (Roger: "I need a backup for the data I have of my students"). Before that there was none: Firestore kept old
versions for 1 hour only.

## What runs

| What | When | Kept | Where | Cost |
|---|---|---|---|---|
| Firestore backup (Google's own) | every day | 7 days | inside the Firebase project `english-lab-ietm` | about €0.03 per GB a month, no reads |
| Firestore backup (Google's own) | every Sunday | 14 weeks (the maximum) | inside the Firebase project | same |
| Copy to Drive (`tools/backup/firestore-copy.mjs`, Action *Database copy to Drive*) | every Friday ~21:00 Madrid | until Roger deletes it | Teacher Studio › 04_Students (private) › English Lab database copies | free; about 3,100 Firestore reads (a few cents at most) |
| Delete protection on the database | always | | | free |

The Drive copy is the one outside Google Cloud: if the whole Firebase project were ever lost, the weekly Firestore backups would go
with it. Recordings and final product videos are not in Firestore: they are already files in 04_Students.

The copies hold students' personal data: never put one in this repo, the project's public files or an Action log. They stay in
04_Students (private). How long they are kept is part of the yearly cycle in `roadmap.md` (deleted with the year's data).

## Restore

- **A whole day back (a bug or a wrong bulk change):** Firebase console › Firestore › Disaster recovery (or
  `gcloud firestore backups list` and `gcloud firestore databases restore --source-backup=… --destination-database=restored`). A restore
  always goes into a NEW database; copy back only the documents needed, then delete that database. €0.20 per GB restored.
- **One document or student:** open the newest `english-lab-backup-YYYY-MM-DD.json.gz` from Drive (gzip JSON:
  `{project, takenAt, count, docs: [{path, fields, updateTime}]}`, `fields` in Firestore REST format, so a document goes back with one
  `PATCH https://firestore.googleapis.com/v1/projects/english-lab-ietm/databases/(default)/documents/{path}` with body `{fields}`).
  Only with Roger's "apply".
- Turning delete protection off (only if Roger asks to delete the database): Firebase console › Firestore › database settings.
