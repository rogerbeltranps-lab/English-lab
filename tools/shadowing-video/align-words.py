# Word timings for an LS's recordings, to pick the shadowing video's sentences (pip install pocketsphinx; it bundles its English model).
#   python3 tools/shadowing-video/align-words.py <ls folder> <out.json> [data files…]
# mp3 listenings take their script (with speakers) from the panels' media.script in the data files; videos take theirs from video/*.vtt
# (not the -slow copies). Writes {src: [[line, speaker, word, start, end], …]} and prints every sentence with its times.
# Add names missing from the dictionary to EXTRA and numbers to NUM.
import json, re, subprocess, sys, glob, os, unicodedata
from pocketsphinx import Decoder
LS, OUT, DATA = sys.argv[1].rstrip('/') + '/', sys.argv[2], sys.argv[3:]
EXTRA = {'laia': 'L AY AH', 'samhain': 'S AW IH N', 'wampanoag': 'W AA M P AH N OW AE G', 'castanyada': 'K AE S T AH N Y AA D AH',
         'panellets': 'P AH N AH L EH T S', 'castanyeres': 'K AE S T AH N Y EH R AH S', 'hanukkah': 'HH AA N AH K AH', 'mei': 'M EY',
         'kai': 'K AY', 'omar': 'OW M AA R', 'girona': 'JH IH R OW N AH', 'vlog': 'V L AA G', 'vlogs': 'V L AA G Z',
         'practising': 'P R AE K T IH S IH NG', 'tracksuit': 'T R AE K S UW T'}
NUM = {'1621': 'sixteen twenty one', '1800s': 'eighteen hundreds', '1863': 'eighteen sixty three', '4B': 'four b'}

def toks(line):
    line = re.sub(r'\[[^\]]*\]', '', line).replace('’', "'")
    out = []
    for raw in line.split():
        r = raw
        for k, v in NUM.items():
            r = r.replace(k, v)
        ws = [unicodedata.normalize('NFKD', w).encode('ascii', 'ignore').decode().lower().strip("'") for w in re.findall(r"[A-Za-zÀ-ÿ']+", r)]
        out.append((raw, [w for w in ws if w]))
    return out

src = {}
node = "global.window={};const fs=require('fs');const o={};for(const f of process.argv.slice(1)){window.LP=null;eval(fs.readFileSync(f,'utf8'));" \
       "for(const p of window.LP.panels){const m=p.media;if(m&&m.audio&&m.script)o[m.audio]=m.script.map(l=>Array.isArray(l)?l:['',l])}}console.log(JSON.stringify(o))"
if DATA:
    src.update({k: [tuple(x) for x in v] for k, v in json.loads(subprocess.run(['node', '-e', node, *DATA], capture_output=True, text=True).stdout).items()})
for v in sorted(glob.glob(LS + 'video/*.vtt')):
    if v.endswith('-slow.vtt'):
        continue
    lines = []
    for c in open(v).read().strip().split('\n\n')[1:]:
        t = ' '.join(c.split('\n')[2:]); sp, _, rest = t.partition(': ')
        lines.append((sp, rest) if rest else ('', t))
    src['video/' + os.path.basename(v)[:-4] + '.mp4'] = lines

res = {}
for f, lines in src.items():
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', LS + f, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout
    dec = Decoder(samprate=16000, bestpath=False)
    for w, p in EXTRA.items():
        try:
            dec.add_word(w, p, False)
        except Exception:
            pass
    T = [(i, raw, ws) for i, (sp, l) in enumerate(lines) for raw, ws in toks(l)]
    flat = [w for _, _, ws in T for w in ws]
    try:
        dec.set_align_text(' '.join(flat)); dec.start_utt(); dec.process_raw(pcm, full_utt=True); dec.end_utt()
        sg = dec.seg()
    except RuntimeError as e:  # usually a word missing from the dictionary: add it to EXTRA
        print('FAILED', f, e); continue
    segs = [(s.start_frame / 100, (s.end_frame + 1) / 100) for s in sg if s.word not in ('<s>', '</s>', '<sil>', '[NOISE]')] if sg else []
    if len(segs) != len(flat):
        print('FAILED', f, len(segs), len(flat)); continue
    i, out = 0, []
    for li, raw, ws in T:
        if ws:
            out.append([li, lines[li][0], raw, segs[i][0], segs[i + len(ws) - 1][1]]); i += len(ws)
    res[f] = out
    cur = []
    for w in out:  # print sentences
        cur.append(w)
        if re.search(r'[.?!]["”]?$', w[2]) or w is out[-1]:
            print(f'{f.split("/")[-1][:14]:14} {cur[0][1]:6} {cur[0][3]:6.2f}-{cur[-1][4]:6.2f} ({cur[-1][4]-cur[0][3]:.1f}s) ' + ' '.join(x[2] for x in cur)); cur = []
json.dump(res, open(OUT, 'w'))
