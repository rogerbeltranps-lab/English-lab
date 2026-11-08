"""Records tools/voice/lines.json with Kokoro (free, Apache 2.0), voice af_heart, American English -> audio/voice/<key>.mp3
and writes audio/voice/index.js (window.EL_VOICE = the recorded keys). Only missing files are recorded; keys no longer in
lines.json are left alone (old pages may still use them).
Setup (once): python3 -m venv venv && venv/bin/pip install kokoro-onnx soundfile
  model files (GitHub, no account): kokoro-v1.0.onnx and voices-v1.0.bin from
  https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
Run from the repo root: venv/bin/python tools/voice/generate.py <kokoro-v1.0.onnx> <voices-v1.0.bin>"""
import json, os, subprocess, sys, tempfile
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'audio', 'voice')
VOICE, LANG, SPEED = 'af_heart', 'en-us', 0.9
os.makedirs(OUT, exist_ok=True)
k = Kokoro(sys.argv[1], sys.argv[2])
lines = json.load(open(os.path.join(ROOT, 'tools', 'voice', 'lines.json')))
tmp = os.path.join(tempfile.gettempdir(), 'el-voice.wav')
done = 0
for x in lines:
    mp3 = os.path.join(OUT, x['key'] + '.mp3')
    if os.path.exists(mp3) or not x['say']:
        continue
    s, sr = k.create(x['say'], voice=VOICE, speed=SPEED, lang=LANG)
    a = np.abs(s) > 0.01 * max(1e-6, np.abs(s).max())
    if a.any():  # trim silence, keep a short tail
        i, j = np.argmax(a), len(a) - np.argmax(a[::-1])
        s = s[max(0, i - int(sr * .05)):min(len(s), j + int(sr * .12))]
    sf.write(tmp, s, sr)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp, '-ac', '1', '-ar', '24000', '-b:a', '40k', mp3], check=True)
    done += 1
    if done % 100 == 0:
        print(done, flush=True)
keys = sorted(f[:-4] for f in os.listdir(OUT) if f.endswith('.mp3'))
with open(os.path.join(OUT, 'index.js'), 'w') as f:
    f.write('/* Flashcard recordings (Kokoro af_heart), made by tools/voice/generate.py. Do not edit by hand. */\n')
    f.write('window.EL_VOICE = new Set(' + json.dumps(keys) + ');\n')
print('recorded', done, 'total', len(keys))
