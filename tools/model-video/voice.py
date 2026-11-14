"""Records the speaking script of an LS model final product (the `notes` array in <ls>/<route>-model.html) with Kokoro
(free, Apache 2.0): one wav per slide in tools/model-video/out/<course>-<route>/NN.wav. "Name: text" lines use the voice
given for Name in voices.json (a group line is shared out sentence by sentence); lines in brackets (nobody speaks) become a few seconds of silence.
Setup: see tools/voice/generate.py (venv with kokoro-onnx + soundfile, model files from GitHub).
Run: venv/bin/python tools/model-video/voice.py <kokoro-v1.0.onnx> <voices-v1.0.bin> 2eso/free-time-live/safe-model.html"""
import json, os, re, sys
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
SPEED = 0.92
GAP = 0.3  # seconds between sentences
def trim(a):  # cut the silence Kokoro leaves around a sentence
    on = np.abs(a) > 0.01 * max(1e-6, np.abs(a).max())
    if not on.any(): return a
    i, j = np.argmax(on), len(on) - np.argmax(on[::-1])
    return a[max(0, i - int(24000 * .03)):min(len(a), j + int(24000 * .06))]
page = sys.argv[3]
html = open(os.path.join(ROOT, page), encoding='utf-8').read()
notes = json.loads(re.search(r'const notes=(\[.*?\]);', html, re.S).group(1))
course, route = page.split('/')[0], os.path.basename(page).replace('-model.html', '')
name = f'{course}-{route}'
cast = json.load(open(os.path.join(HERE, 'voices.json')))[name]
out = os.path.join(HERE, 'out', name)
os.makedirs(out, exist_ok=True)
k = Kokoro(sys.argv[1], sys.argv[2])
SR = 24000
meta = []
for i, line in enumerate(notes):
    m = re.match(r'^([^:()]{1,30}):\s*(.*)$', line, re.S)
    who, text = (m.group(1).strip(), m.group(2).strip()) if m else (None, line.strip())
    if text.startswith('('):
        s = np.zeros(int(SR * 4.5), dtype=np.float32)
        voices, cues = [], []
    else:
        voices = cast.get(who) or cast['*']
        voices = voices if isinstance(voices, list) else [voices]
        say = re.sub(r'\bSt (?=[A-Z])', 'Saint ', text).replace('’', "'").replace('“', '"').replace('”', '"')
        # recorded sentence by sentence (exact caption times); a group line ("All together") is shared out between the
        # voices sentence by sentence, because a chorus of synthetic voices never lines up and sounds messy
        parts = [x.strip() for x in re.findall(r'[^.!?]+[.!?]+["\')]*\s*|[^.!?]+$', say) if x.strip()]
        shown = [x.strip() for x in re.findall(r'[^.!?]+[.!?]+["”’)]*\s*|[^.!?]+$', text) if x.strip()]
        if len(shown) != len(parts): shown = parts
        takes, cues, at = [], [], .5
        for j, x in enumerate(parts):
            v = voices[j % len(voices)]
            a, sr = k.create(x, voice=v, speed=SPEED, lang='en-us' if v[0] == 'a' else 'en-gb')
            a = trim(a)
            cues.append({'start': round(at, 3), 'end': round(at + len(a) / SR, 3), 'text': shown[j]})
            at += len(a) / SR + GAP
            takes += [a, np.zeros(int(SR * GAP), np.float32)]
        s = np.concatenate(takes[:-1])
        peak = np.abs(s).max() or 1
        s = (s / peak * 0.85).astype(np.float32)
    lead, tail = np.zeros(int(SR * .5), np.float32), np.zeros(int(SR * .8), np.float32)
    s = np.concatenate([lead, s, tail])
    sf.write(os.path.join(out, f'{i:02d}.wav'), s, SR)
    meta.append({'slide': i, 'who': who, 'text': text, 'voices': voices, 'sec': round(len(s) / SR, 2), 'cues': cues})
    print(i, who, voices, round(len(s) / SR, 1), 's', flush=True)
json.dump(meta, open(os.path.join(out, 'lines.json'), 'w'), ensure_ascii=False, indent=1)
print('total', round(sum(x['sec'] for x in meta), 1), 's')
