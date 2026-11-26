"""Towards Nativeness: records the listenings with Kokoro (free, Apache 2.0; same setup as tools/voice/generate.py), one voice per
speaker (VOICES below: every main female voice is af_heart, Roger 17 Nov 2026: "kokoro now (heart)"; a second woman in the
same dialogue keeps another voice so the two can be told apart), a short pause between turns, and writes 4eso/towards-nativeness/<audio>.mp3 plus a -slow.mp3 copy (atempo 0.8).
Usage (repo root): node tools/towards-nativeness/listenings.js > /tmp/tn-lines.json
                   venv/bin/python tools/towards-nativeness/voice.py /tmp/tn-lines.json kokoro-v1.0.onnx voices-v1.0.bin [--force]
Only missing files are recorded unless --force."""
import json, os, subprocess, sys, tempfile
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LS = os.path.join(ROOT, '4eso', 'towards-nativeness')
VOICES = {  # speaker -> (voice, lang)
    'Anna': ('af_heart', 'en-us'), 'Tom': ('am_michael', 'en-us'),
    'Claire': ('af_heart', 'en-us'), 'Marc': ('bm_george', 'en-gb'),
    'Host': ('af_heart', 'en-us'), 'Jordi': ('am_puck', 'en-us'),
    'Montse': ('af_heart', 'en-us'), 'David': ('bm_lewis', 'en-gb'), 'Laia': ('bf_isabella', 'en-gb'),
}
k = Kokoro(sys.argv[2], sys.argv[3])
force = '--force' in sys.argv
for item in json.load(open(sys.argv[1])):
    mp3 = os.path.join(LS, item['audio'])
    if os.path.exists(mp3) and not force:
        continue
    parts, sr = [], 24000
    for who, line in item['script']:
        voice, lang = VOICES.get(who, ('af_heart', 'en-us'))
        s, sr = k.create(line.replace('’', "'"), voice=voice, speed=1.0, lang=lang)
        parts += [s, np.zeros(int(sr * 0.45), dtype=s.dtype)]
    wav = os.path.join(tempfile.gettempdir(), 'tn.wav')
    sf.write(wav, np.concatenate(parts), sr)
    os.makedirs(os.path.dirname(mp3), exist_ok=True)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-ac', '1', '-ar', '24000', '-b:a', '48k', mp3], check=True)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-filter:a', 'atempo=0.8', '-ac', '1', '-ar', '24000', '-b:a', '48k', mp3[:-4] + '-slow.mp3'], check=True)
    print('recorded', item['audio'], flush=True)
