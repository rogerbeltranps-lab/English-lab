#!/bin/sh
# Rebuild the 4 ESO Pro (native, C2 Proficiency) study summaries (run from the repo root): LS1 from pro-ls1-4eso.json (LS1 has no
# Pro pages), LS2 from the Pro Learning Path data (dump-pro.js). PDFs go to the LS downloads folders as ls<n>-vocabulary-grammar-native.pdf.
set -e
OUT=${1:-$(mktemp -d)}
node tools/study-summary/dump-pro.js "$OUT/pro-ls2.json"
for x in "ls1 my-real-routine tools/study-summary/pro-ls1-4eso.json" "ls2 seasons-and-celebrations $OUT/pro-ls2.json"; do
  set -- $x
  python3 tools/study-summary/pro.py "$OUT/$1-vocabulary-grammar-native.docx" "$3"
  soffice --headless --convert-to pdf --outdir "$OUT" "$OUT/$1-vocabulary-grammar-native.docx" >/dev/null
  mv "$OUT/$1-vocabulary-grammar-native.pdf" 4eso/$2/downloads/
  python3 tools/stamp-copyright.py 4eso/$2/downloads/$1-vocabulary-grammar-native.pdf
done
echo "Word files in $OUT"
