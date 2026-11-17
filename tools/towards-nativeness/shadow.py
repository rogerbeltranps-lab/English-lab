"""Towards Nativeness: records the 🗣 Shadowing clips with Kokoro, voice af_heart (Roger, 17 Nov 2026: "kokoro now (heart)"), one sentence
at a time with a pause between them, and writes 4eso/towards-nativeness/audio/<file>.mp3 + -slow.mp3 (atempo 0.8) and data/shadow.js:
window.TN_SHADOW = {key: clip} with lines (one per sentence), marks (only the ↗ ↘ melody arrows: no stress guesses) and cues
[[from, to, slowFrom, slowTo], ...] taken straight from the recording, so 🔁 Listen and repeat works without any alignment step.
Usage (repo root): node tools/towards-nativeness/shadow-lines.js > /tmp/tn-shadow.json
                   venv/bin/python tools/towards-nativeness/shadow.py /tmp/tn-shadow.json kokoro-v1.0.onnx voices-v1.0.bin [--force]
Clips whose mp3 exists are not recorded again unless --force; data/shadow.js is always rewritten from the sentences and saved times
(audio/<file>.json)."""
import json, os, re, subprocess, sys, tempfile
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LS = os.path.join(ROOT, '4eso', 'towards-nativeness')
AUX = r'^(is|are|am|was|were|do|does|did|can|could|will|would|should|shall|have|has|had|may|might|must)n?\b'
SLOW = 0.8

def marks(s):
    """The melody arrows only: ↗ before a comma and at the end of yes/no questions, ↘ at the end of statements and wh- questions."""
    s = re.sub(r',', ' ↗,', s)
    end = '↗' if s.rstrip().endswith('?') and re.match(AUX, s.strip(), re.I) else '↘'
    return s.rstrip() + ' ' + end

k = Kokoro(sys.argv[2], sys.argv[3])
force = '--force' in sys.argv
clips = {}
for item in json.load(open(sys.argv[1])):
    mp3 = os.path.join(LS, 'audio', item['file'] + '.mp3')
    times = os.path.join(LS, 'audio', item['file'] + '.json')
    if force or not (os.path.exists(mp3) and os.path.exists(times)) or json.load(open(times)).get('sentences') != item['sentences']:
        sr, parts, cues, t = 24000, [], [], 0.0
        lead = np.zeros(int(sr * 0.4), dtype=np.float32); parts.append(lead); t += len(lead) / sr
        for s in item['sentences']:
            a, sr = k.create(s.replace('’', "'"), voice='af_heart', speed=1.0, lang='en-us')
            a = a.astype(np.float32); parts.append(a); cues.append([round(t, 2), round(t + len(a) / sr, 2)]); t += len(a) / sr
            gap = np.zeros(int(sr * 0.9), dtype=np.float32); parts.append(gap); t += len(gap) / sr
        wav = os.path.join(tempfile.gettempdir(), 'tn-shadow.wav')
        sf.write(wav, np.concatenate(parts), sr)
        os.makedirs(os.path.dirname(mp3), exist_ok=True)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-ac', '1', '-ar', '24000', '-b:a', '48k', mp3], check=True)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-filter:a', 'atempo=' + str(SLOW), '-ac', '1', '-ar', '24000', '-b:a', '48k', mp3[:-4] + '-slow.mp3'], check=True)
        json.dump({'sentences': item['sentences'], 'cues': cues, 'end': round(t, 2)}, open(times, 'w'), ensure_ascii=False)
        print('recorded', item['file'], flush=True)
    d = json.load(open(times))
    clips[item['key']] = {
        'title': item['title'], 'src': 'audio/' + item['file'] + '.mp3', 'slow': 'audio/' + item['file'] + '-slow.mp3',
        't': [0, d['end']], 'ts': [0, round(d['end'] / SLOW, 2)],
        'lines': [[s] for s in item['sentences']], 'marks': [[marks(s)] for s in item['sentences']],
        'cues': [[a, b, round(a / SLOW, 2), round(b / SLOW, 2)] for a, b in d['cues']]}
with open(os.path.join(LS, 'data', 'shadow.js'), 'w') as f:
    f.write('/* Towards Nativeness · 🗣 Shadowing clips, made by tools/towards-nativeness/shadow.py (Kokoro af_heart). Do not edit by hand:\n'
            '   change the sentences in the learning path (✨ Make it idiomatic) or in My latest mistakes and run the tool again. */\n')
    f.write('window.TN_SHADOW = ' + json.dumps(clips, ensure_ascii=False, indent=1) + ';\n')
print('wrote data/shadow.js with', len(clips), 'clips')
