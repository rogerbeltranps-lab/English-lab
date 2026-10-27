#!/bin/sh
# Rebuild the LS1 My Real Routine study summaries of both courses (run from the repo root).
# Student PDFs go to <course>/my-real-routine/downloads/, the teacher's Word to OUT (default: a temporary folder).
set -e
OUT=${1:-$(mktemp -d)}
for c in 2eso 4eso; do
  node tools/study-summary/dump.js $c "$OUT/$c.json"
  for r in insecure safe daring; do
    python3 tools/study-summary/build.py "$OUT/ls1-vocabulary-grammar-$r.docx" "$OUT/$c.json" $r
    soffice --headless --convert-to pdf --outdir "$OUT" "$OUT/ls1-vocabulary-grammar-$r.docx" >/dev/null
    mkdir -p $c/my-real-routine/downloads
    mv "$OUT/ls1-vocabulary-grammar-$r.pdf" $c/my-real-routine/downloads/
    python3 tools/stamp-copyright.py $c/my-real-routine/downloads/ls1-vocabulary-grammar-$r.pdf
  done
  python3 tools/study-summary/build.py "$OUT/LS1-grammar-and-vocabulary-by-route-$(echo $c | sed 's/eso/ESO/').docx" "$OUT/$c.json"
done
echo "teacher's Word in $OUT"
