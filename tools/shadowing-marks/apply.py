# Shadowing marks + sentence times for the LP Shadowing clips (Roger, 7 Nov 2026: "indications like going up/down, stressed words,
# linking" + two modes: Listen and repeat, sentence by sentence, and Shadowing, all at once).
#   pip install pocketsphinx numpy; python3 tools/shadowing-marks/apply.py
# marks.json: {data file: [[marked sentence, …] for each clip line]} in the video's format (tools/shadowing-video): **stressed**, ‿ linked,
# ↗ before a comma / pause and at the end of yes/no questions, ↘ at the end of statements and wh- questions. The sentences of a line,
# stripped of the marks, must give the line exactly. The script checks that, aligns every sentence in the normal and the -slow copy
# (pocketsphinx, inside the clip's t / ts) and writes clip.marks and clip.cues = [[from, to, slowFrom, slowTo], …] into the data file.
import json, os, re, subprocess, sys, unicodedata
import numpy as np
from pocketsphinx import Decoder
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) + '/'
EXTRA = {'laia': 'L AY AH', 'samhain': 'S AW IH N', 'wampanoag': 'W AA M P AH N OW AE G', 'hanukkah': 'HH AA N AH K AH', 'mei': 'M EY',
         'kai': 'K AY', 'omar': 'OW M AA R', 'vlog': 'V L AA G', 'tracksuit': 'T R AE K S UW T', 'diwali': 'D IH W AA L IY', 'julia': 'JH UW L IY AH'}
NUM = {'1621': 'sixteen twenty one', '1863': 'eighteen sixty three', '4B': 'four b'}

def strip(m):
    return re.sub(r'\s+', ' ', re.sub(r'\s*[↗↘]', '', m.replace('**', '').replace('==', '').replace('‿', ' '))).strip()

def words(s):
    for k, v in NUM.items():
        s = s.replace(k, v)
    s = s.replace('’', "'")
    ws = [unicodedata.normalize('NFKD', w).encode('ascii', 'ignore').decode().lower().strip("'") for w in re.findall(r"[A-Za-zÀ-ÿ']+", s)]
    return [w for w in ws if w]

def align(path, t0, t1, sents):
    a = max(0, t0 - 0.25)
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(a), '-to', str(t1 + 0.4), '-i', path, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout
    dec = Decoder(samprate=16000, bestpath=False)
    for w, p in EXTRA.items():
        try: dec.add_word(w, p, False)
        except Exception: pass
    W = [words(s) for s in sents]
    flat = [w for ws in W for w in ws]
    dec.set_align_text(' '.join(flat)); dec.start_utt(); dec.process_raw(pcm, full_utt=True); dec.end_utt()
    segs = [(a + s.start_frame / 100, a + (s.end_frame + 1) / 100) for s in dec.seg() if s.word not in ('<s>', '</s>', '<sil>', '[NOISE]')]
    if len(segs) != len(flat):
        sys.exit(f'ALIGN FAILED {path}: {len(segs)} of {len(flat)} words')
    out, i = [], 0
    for ws in W:
        out.append([segs[i][0], segs[i + len(ws) - 1][1]]); i += len(ws)
    # where each sentence really starts (Roger, 12 Nov 2026: "the first words don't come out"): pocketsphinx can put a soft first
    # sound ("And", "But", "My", "OK") a little late, so walk back from the first word through the sound to 60 ms of quiet
    # (12 dB over the quiet of the gap before it, 10 ms frames) and start 0.05 s before that, or 0.12 s before the word
    x = np.frombuffer(pcm, np.int16).astype(float)
    db = 20 * np.log10(np.sqrt(np.add.reduceat(x ** 2, np.arange(0, len(x), 160)) / 160) + 1)
    fr = lambda t: int(round((t - a) * 100))
    starts = []
    for k, (w0, _) in enumerate(out):
        lo, w = fr(out[k - 1][1] if k else t0), fr(w0)
        gap = db[max(lo, w - 150, 0):w]
        on = w0
        if len(gap) >= 3:
            thr, j, q = np.percentile(gap, 10) + 12, w, 0
            while j > max(lo, 0) and q < 6:
                j -= 1; q = q + 1 if db[j] < thr else 0
            if q >= 6: on = a + (j + q) / 100
        starts.append(max(t0, (out[k - 1][1] + 0.02) if k else t0, min(w0 - 0.12, on - 0.05)))
    # cut in the quiet between sentences: each sentence ends halfway to the next one (at most 0.35 s after its last word)
    for k in range(len(out)):
        nxt = out[k + 1][0] if k + 1 < len(out) else t1
        out[k][1] = min(out[k][1] + 0.35, min((out[k][1] + nxt) / 2, starts[k + 1]) if k + 1 < len(out) else max(out[k][1], min(t1, out[k][1] + 0.35)))
        out[k][0] = starts[k]
    return [[round(x, 2), round(y, 2)] for x, y in out]

def clip_span(src, start):
    # the clip object of the shadow panel: from 'clip: {' to its closing brace (strings skipped)
    i = src.index('clip: {', start) + 6; depth, q, j = 0, None, i
    while True:
        c = src[j]
        if q:
            if c == '\\': j += 1
            elif c == q: q = None
        elif c in '\'"`': q = c
        elif c == '{': depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0: return i, j
        j += 1

marks = json.load(open(ROOT + 'tools/shadowing-marks/marks.json'))
node = "global.window={};const fs=require('fs');window.LP=null;eval(fs.readFileSync(process.argv[1],'utf8'));" \
       "console.log(JSON.stringify(window.LP.panels.find(p=>p.type==='shadow').clip))"
for f, M in marks.items():
    clip = json.loads(subprocess.run(['node', '-e', node, ROOT + f], capture_output=True, text=True, check=True).stdout)
    lines = [l[-1] if isinstance(l, list) else l for l in clip['lines']]
    if len(lines) != len(M): sys.exit(f'{f}: {len(M)} marked lines for {len(lines)} lines')
    fixed = []
    for li, (line, ss) in enumerate(zip(lines, M)):
        if '’' in line: ss = [s.replace("'", '’') for s in ss]
        if strip(' '.join(ss)) != line: sys.exit(f'{f} line {li + 1}:\n  {strip(" ".join(ss))}\n  {line}')
        fixed.append(ss)
    sents = [strip(s) for ss in fixed for s in ss]
    base = ROOT + os.path.dirname(os.path.dirname(f)) + '/'
    n = align(base + clip['src'], *clip['t'], sents)
    s = align(base + clip['slow'], *clip['ts'], sents)
    cues = [a + b for a, b in zip(n, s)]
    for x, c in zip(sents, cues): print(f'{f.split("/")[-1][:18]:18} {c[0]:6.2f}-{c[1]:6.2f} {c[2]:6.2f}-{c[3]:6.2f} {x[:60]}')
    src = open(ROOT + f).read()
    a, b = clip_span(src, src.index("type: 'shadow'"))
    body = src[a:b]
    k = body.find(', marks: [')
    if k >= 0: body = body[:k] + ' '
    body = body.rstrip() + ', marks: ' + json.dumps(fixed, ensure_ascii=False) + ', cues: ' + json.dumps(cues) + ' '
    open(ROOT + f, 'w').write(src[:a] + body + src[b:])
