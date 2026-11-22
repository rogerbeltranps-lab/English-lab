"""Towards Nativeness: records the ✍️ micro-dictation bits with Kokoro Heart (free, Apache 2.0; same setup as tools/voice/generate.py)
as 4eso/towards-nativeness/audio/tts/<key>.mp3 plus a -slow.mp3 copy (atempo 0.75, as tools/tts makes them), so the engine's playRec
plays a real recording: the browser voice made no sound on Roger's iPhone (22 Nov 2026).
Usage (repo root): node tools/towards-nativeness/dictation.js > /tmp/tn-dict.json
                   venv/bin/python tools/towards-nativeness/dictation.py /tmp/tn-dict.json kokoro-v1.0.onnx voices-v1.0.bin [--force]
Only missing files are recorded unless --force."""
import json, os, subprocess, sys, tempfile
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, '4eso', 'towards-nativeness', 'audio', 'tts')
os.makedirs(OUT, exist_ok=True)
k = Kokoro(sys.argv[2], sys.argv[3])
force = '--force' in sys.argv
wav = os.path.join(tempfile.gettempdir(), 'tn-dict.wav')
for item in json.load(open(sys.argv[1])):
    mp3 = os.path.join(OUT, item['key'] + '.mp3')
    if os.path.exists(mp3) and not force:
        continue
    s, sr = k.create(item['text'].replace('’', "'"), voice='af_heart', speed=1.0, lang='en-us')
    pad = np.zeros(int(sr * 0.25), dtype=s.dtype)   # a little silence at each end, so iOS doesn't clip the first word
    sf.write(wav, np.concatenate([pad, s, pad]), sr)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-ac', '1', '-ar', '24000', '-b:a', '48k', mp3], check=True)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-filter:a', 'atempo=0.75', '-ac', '1', '-ar', '24000', '-b:a', '48k', mp3[:-4] + '-slow.mp3'], check=True)
    print('recorded', item['key'], item['text'], flush=True)
