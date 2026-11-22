"""Records tools/voice/readings.json (from readings.js) with Kokoro (free, Apache 2.0), voice af_heart, American English
-> audio/read/<key>.mp3, one file per reading, read sentence by sentence with short pauses, and writes audio/read/index.js
(window.EL_READ = { key: [second where each block starts] }) for shared/js/el-read-aloud.js. Only missing files are recorded;
times are kept in audio/read/times.json. Towards Nativeness (C1-C2) is read at normal speed, the LS readings a little slower.
Setup and model files: see tools/voice/generate.py.
Run from the repo root: venv/bin/python tools/voice/readings.py <kokoro-v1.0.onnx> <voices-v1.0.bin>"""
import json, os, re, subprocess, sys, tempfile
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'audio', 'read')
VOICE, LANG = 'af_heart', 'en-us'
os.makedirs(OUT, exist_ok=True)
k = Kokoro(sys.argv[1], sys.argv[2])
items = json.load(open(os.path.join(ROOT, 'tools', 'voice', 'readings.json')))
tf = os.path.join(OUT, 'times.json')
times = json.load(open(tf)) if os.path.exists(tf) else {}
tmp = os.path.join(tempfile.gettempdir(), 'el-read.wav')
SENT = re.compile(r'(?<=[.!?])["\')]?\s+(?=["\'(]?[A-Z0-9])')

def trim(s, sr):
    a = np.abs(s) > 0.01 * max(1e-6, np.abs(s).max())
    if not a.any():
        return s
    i, j = np.argmax(a), len(a) - np.argmax(a[::-1])
    return s[max(0, i - int(sr * .03)):min(len(s), j + int(sr * .05))]

done = 0
for x in items:
    mp3 = os.path.join(OUT, x['key'] + '.mp3')
    if os.path.exists(mp3) and x['key'] in times:
        continue
    speed = 1.0 if 'towards-nativeness' in x['src'] else 0.9
    sr, out, starts, t = 24000, [], [], 0.0
    for block in x['say']:
        starts.append(round(t, 2))
        for sent in [s for s in SENT.split(block) if s.strip()]:
            s, sr = k.create(sent, voice=VOICE, speed=speed, lang=LANG)
            s = trim(s, sr)
            out += [s, np.zeros(int(sr * .32), dtype=s.dtype)]
            t += (len(s) + int(sr * .32)) / sr
        if block.strip():
            out.append(np.zeros(int(sr * .45), dtype=np.float32)); t += .45
    sf.write(tmp, np.concatenate(out), sr)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp, '-ac', '1', '-ar', '24000', '-b:a', '48k', mp3], check=True)
    times[x['key']] = starts
    done += 1
    print(done, x['key'], x['src'], round(t), 's', flush=True)
json.dump(times, open(tf, 'w'), indent=0, sort_keys=True)
have = {f[:-4] for f in os.listdir(OUT) if f.endswith('.mp3')}
idx = {kk: v for kk, v in sorted(times.items()) if kk in have}
with open(os.path.join(OUT, 'index.js'), 'w') as f:
    f.write('/* Reading recordings (Kokoro af_heart), made by tools/voice/readings.py: key -> second where each block starts. Do not edit by hand. */\n')
    f.write('window.EL_READ = ' + json.dumps(idx, separators=(',', ':')) + ';\n')
print('recorded', done, 'total', len(idx))
